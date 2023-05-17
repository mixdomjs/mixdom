

// - Imports - //

import { _Lib } from "./_Lib";
import {
    MixDOMTreeNode,
    MixDOMTreeNodeDOM,
    MixDOMTreeNodeBoundary,
    MixDOMTreeNodeHost,
    MixDOMTreeNodeContexts,
    MixDOMTreeNodePortal,
    MixDOMDefKeyTag,
    MixDOMDefTarget,
    MixDOMDefApplied,
    MixDOMDefTargetPseudo,
    MixDOMDefAppliedPseudo,
    MixDOMSourceBoundaryChange,
    MixDOMRenderInfo,
    MixDOMChangeInfos,
    MixDOMContentSimple,
    MixDOMContentEnvelope,
    MixDOMBoundary,
    MixDOMContextRefresh,
    MixDOMContextAttach,
} from "./_Types";
import { callListeners } from "../classes/SignalMan";
import { _Defs } from "./_Defs";
import { _Find } from "./_Find";
import { mixDOMContent } from "../MixDOM";
import { HostRender } from "../classes/HostRender";
import { ContentBoundary, SourceBoundary } from "../classes/Boundary";
import { Ref } from "../classes/Ref";
import { ComponentStream, ComponentStreamType } from "../classes/ComponentStream";
import { Context } from "../classes/Context";
import { ContentClosure } from "../classes/ContentClosure";
import { HostServices } from "../classes/HostServices";
import { Host } from "../classes/Host";
import { ContextAPI } from "../classes/ContextAPI";
import { ComponentType } from "../classes/Component";
import { ComponentShadowType } from "../classes/ComponentShadow";


// - Methods - //

type OuterContexts = Record<string, Context | null>;
type ToApplyPair = [MixDOMDefTarget, MixDOMDefApplied, MixDOMTreeNode, OuterContexts];

export const _Apply = {

    /** For the special types, just anything unique other than string and function - and not !!false. */
    SEARCH_TAG_BY_TYPE: {
        "fragment": 1,
        "portal": 2,
        "pass": 3,
        "contexts": 4,
        "host": 5,
    }, // as Record<MixDOMDefType, number>,


    // - Closure update process - //

    // Visual analogy: ContentClosure as a SEALED ENVELOPE:
    //
    // - Think of the ContentClosure as a sealed envelope that gets passed from the original boundary to a sub-boundary in it.
    //   * The contents of the envelope describe the contents that this particular sub-boundary has from its direct parent boundary.
    //   * The contents also contain a direct reference to the paired def branch of the original boundary (to update its treeNode assignments on grounding, or clear on ungrounding).
    //
    // - If the sub-boundary does not ground the content directly, but passes it to another sub-sub-boundary, then a new envelope is written for it.
    //   * Again the envelope contains whatever the sub-boundary assigned to its sub-sub-boundary, which in case case includes the earlier envelope.
    //   * In other words, the new envelope contains (amongst other content) another envelope from up the tree.
    //
    // - When the content is finally grounded (if at all), the last (freshest) envelope is opened.
    //   - On grounding the closure also gets a treeNode reference that should be used similarly to boundary's treeNode.
    //     * Otherwise the rendering wouldn't know where to insert the contents.
    //   a) For a TRUE PASS:
    //     1. After opening the envelope, the pairing process is finished (by attaching treeNodes) and an array of pairs to be grounded is formed.
    //     2. The pairs are fed to a new grounding process, which grounds dom elements and mounts/updates sub-boundaries within collecting getting render infos.
    //     3. If the newly grounded defs contained more envelopes, then they get opened similarly to this envelope and render infos from it are added to the flow.
    //        .. Note that we only open the grounded envelopes - envelopes nested in sub-boundaries will be open when they are grounded (if ever).
    //   b) For a CONTENT COPY:
    //     - It's basically the same routine as on boundary mount/update, but just done for closure via ContentBoundary instead of SourceBoundary.
    //     - This is because, although sharing the same target defs, each copy is independent from the original render scope's applied defs - each copy has its own applied def root and should do its own pairing.
    //
    // - If the content gets ungrounded by a nested component that earlier grounded it:
    //     * All its contents get destroyed, which includes destroying any nested sub-boundaries and envelopes - collecting infos for all this.
    //     * For a TRUE PASS this means modifying the original applied defs treeNode assignments accordingly.
    //       .. If the content later gets re-grounded, then it's like it was grounded for the first time.
    //     * For a CONTENT COPY, it's simply the destruction - it also gets removed from the map that maps copies.
    //
    // - When the original boundary re-renders:
    //   * Any new sub-boundaries will trigger writing new envelopes for them, just like on the first render - collecting infos.
    //   * Any sub-boundaries no longer present will be destroyed, which includes destroying all their envelopes and nested sub-boundaries as well - collecting infos.
    //   * Any kept sub-boundaries (by def pairing) with sealed envelopes will get new envelopes in their place.
    //     .. This causes a re-render of the contents for all the grounded passes and copies.
    //   a) For a TRUE PASS:
    //      - The situation is like on grounding, except that our def pairing has changed.
    //         .. So likewise we start by finishing the pairing process: adding any missing treeNodes.
    //      - Otherwise it's the same: the pairs are fed to a grounding process, and so on.
    //   b) For a CONTENT COPY:
    //      - It's simply the same routine as on boundary mount/update but for closures.
    //
    // Using getChildren():
    // - Using the getChildren method results in reading the child defs that are held inside the sealed envelope.
    //   * In other words, it's like a spying technology that allows to read what's inside the envelope without opening it.
    // - The boundary that does the spying also needs to be updated when contents have changed - to refresh the info, otherwise would have old info.
    //   * This is marked into the closure, by using .getChildren() and/or .needsChildren(needs: boolean | null).
    //     .. You can also just read the children without updating needs by .getChildren(false) - this is useful if you use it outside the render method.
    //   * So whenever a new sealed copy (with same "id") is passed to replace the old one, the spying boundaries will also update.
    //     .. The flow also takes care of that the spying boundaries won't be updated multiple times (because they are kids, might be updated anyway).


    /**
     * For true ContentPass, the situation is very distinguished:
     *   - Because we are in a closure, our target defs have already been mapped to applied defs and new defs created when needed.
     *   - However, the treeNode part of the process was not handled for us. So we must do it now.
     *   - After having updated treeNodes and got our organized toApplyPairs, we can just feed them to _Apply.applyDefPairs to get renderInfos and boundaryUpdates.
     */
    runContentPassUpdate(contentBoundary: ContentBoundary, forceUpdate: boolean = false): MixDOMChangeInfos {

        // 1. Make a pre loop to assign groundable treeNodes.
        const [ toApplyPairs, toCleanUp, emptyMovers ] = _Apply.assignTreeNodesForPass(contentBoundary);

        // 2. Apply the target defs recursively until each boundary starts (automatically limited by our toApplyPairs).
        // .. We update each def collecting render infos, and on boundaries create/update content closure and call mount/update.
        let [ renderInfos, boundaryChanges ] = _Apply.applyDefPairs(contentBoundary, toApplyPairs, forceUpdate);

        // If we have custom clean ups.
        if (toCleanUp[0]) {
            // Go through the clean-uppable and collect.
            const unusedDefs: Set<MixDOMDefApplied> = new Set();
            for (const treeNode of toCleanUp) {
                // Was reused further inside.
                if (treeNode.sourceBoundary)
                    continue;
                // Add to clean up.
                if (treeNode.def)
                    unusedDefs.add(treeNode.def);
                // Just in case.
                treeNode.parent = null;
            }
            // Clean up any defs that were detected by custom clean up.
            if (unusedDefs.size) {
                const infos = _Apply.cleanUpBoundaryDefs(unusedDefs, contentBoundary.host.settings.devLogCleanUp);
                // Add to the beginning.
                renderInfos = infos[0].concat(renderInfos);
                boundaryChanges = infos[1].concat(boundaryChanges);
            }
        }

        // Prepend empty movers.
        if (emptyMovers[0])
            renderInfos = emptyMovers.map(treeNode => ({ treeNode, emptyMove: true } as MixDOMRenderInfo)).concat(renderInfos);

        // Mark as having been activated. (We use this for the mount vs. update checks.)
        contentBoundary.isMounted = true;

        // 3. Return collected render infos.
        return [ renderInfos, boundaryChanges ];
    },


    // - BOUNDARY UPDATE PROCESS - //

    /** The main method to update the boundary.
     *
     * - MAIN IDEA - //
     *
     * PHASE I - pre-map reusability - "PRE-MANGLING LOOP":
     * 1. Handle boundary type: either render the SourceBoundary to get preDef tree or reuse it from existing ContentBoundary (copy!).
     * 2. Collect keys and contentPasses from already appliedDefs for reusing them.
     * 3. Go over the preDef tree and assign appliedDef to each targetDef.
     *    - We update our appliedDef tree (half-separately from old appliedDefs) as we go, and try to reuse as much as we can.
     *    - We also create / reuse treeNodes on the go.
     *    - The finding reusables also includes handling MixDOM.Content's.
     *      .. For any (generic or keyed) MixDOM.Content found, convert them into a contentPassDef and assign the closure given by our hostBoundary to it (if any).
     *      .. Like with normal defs, try to look for a fitting contentPass (from the earlier applied contentPasses) with keys and order.
     *    - As an output, we collect toApplyPairs for the next step below.
     *
     * PHASE II - apply defs and collect render infos - "GROUNDING LOOP":
     * 4. Start applying defs down the targetDef tree by given toApplyPairs and collect render infos.
     *    - a) For any fragment, we just continue to next (the kids will be there in the loop).
     *    - b) For any domtag def, collect render info (the kids will be in the loop).
     *    - c) For any sub-boundary, apply the def to the sub-boundary (with targetDefs with our appliedDefs attached) collecting its render info.
     *       * .. Note. Kids will not be in the loop - we need not go any further here. (This is pre-handled in toApplyPairs.)
     *       * .. Note that this will prevent from any MixDOM.Content within from being detected in our scope - note that they were already converted to closures above.
     *       * .... This is how it should be, because these closures will not be grounded by us - maybe by the nested boundary, maybe not.
     *    - d) For any contentPassDef, ground them - as they are now in direct contact with the dom tag chain.
     *       * .. This means, triggering the closure found in them (originally created by our host boundary, and might go way back).
     *       * .. So we won't go further, but we will trigger the process to go further down from here (by the closure).
     * 5. Clean up old defs and their content: destroy old dom content and unused boundaries with their closures and collect render infos for all the related destruction.
     * 6. Return the render infos.
     *
     */
    runBoundaryUpdate(byBoundary: SourceBoundary | ContentBoundary, forceUpdate: boolean = false): MixDOMChangeInfos {


        // - 1. Handle source boundary vs. content boundary vs. stream. - //


        // Prepare.
        let preDef : MixDOMDefTarget | null = null;
        let appliedDef: MixDOMDefApplied | null = byBoundary._innerDef;
        let renderInfos: MixDOMRenderInfo[];
        let boundaryChanges: MixDOMSourceBoundaryChange[];

        // If source boundary, render it to get the preDef tree.
        if (byBoundary.boundaryId) {
            // Render.
            preDef = _Defs.newDefFromContent(byBoundary.render());
            // Make sure has appliedDef for a preDef.
            if (preDef && !appliedDef)
                appliedDef = _Defs.newAppliedDefBy(preDef, byBoundary.closure);
        }
        // For content boundary, just get the already rendered def tree.
        else
            preDef = (byBoundary as ContentBoundary).targetDef;

        // - 2. Collect a map of current tags and applied defs - //
        // .. These maps will be used for wide pairing as well as for clean up.
        // .. Note that we should always build the map, even on boundary mount.
        // .... This is because in that case we were given a newly created appliedDef in runBoundaryUpdate, and it needs to be reusable, too.
        // .... Note that it will only be created if there wasn't an appliedDef and there is a preDef - for null -> null, this is not called.

        // Prepare.
        const [ defsByTags, unusedDefs ] = !appliedDef ? [ new Map<MixDOMDefKeyTag, MixDOMDefApplied[]>(), new Set<MixDOMDefApplied>() ] : _Apply.buildDefMaps(appliedDef);
        const emptyMovers: MixDOMTreeNode[] = [];
        // Normal case.
        if (preDef) {

            // - 3. Go over the preDef tree and assign appliedDef to each targetDef (including smart assigning for multiple MixDOM.Contentes). - //
            // .. We collect the new appliedDef tree as we go - as a separate copy from the original.
            // .. We also collect toApplyPairs already for a future phase of the process.

            const toCleanUpDefs: MixDOMDefApplied[] = [];
            const toApplyPairs = _Apply.pairDefs(byBoundary, preDef, appliedDef as MixDOMDefApplied, defsByTags, unusedDefs, toCleanUpDefs, emptyMovers);

            // Update the _innerDef.
            // .. There is always a pair, if there was a preDef.
            // .. Note that we can't rely on that it's still the appliedDef - due to that root might have been swapped.
            byBoundary._innerDef = toApplyPairs[0][1];

            // - 4. Apply the target defs recursively until each boundary starts (automatically limited by our toApplyPairs). - //
            // .. We update each def collecting render infos, and on boundaries create/update content closure and call mount/update.
            [ renderInfos, boundaryChanges ] = _Apply.applyDefPairs(byBoundary, toApplyPairs, forceUpdate);


            // - 5a. Extra clean ups - //

            // The toCleanUpDefs are defs that might need clean up.
            // .. Now that all the grounding has been done, we can check if they really should be cleaned up.
            if (toCleanUpDefs[0]) {
                for (const def of toCleanUpDefs) {
                    // Only for the ones that really were not landed after all.
                    const treeNode = def.treeNode;
                    if (!treeNode || (treeNode.sourceBoundary !== null))
                        continue;
                    unusedDefs.add(def);
                }
            }

        }
        // Go to null / stay at null.
        else {
            // Define.
            renderInfos = [];
            boundaryChanges = [];
            // Go to null.
            // .. Note. Previously empty move was added every time at null - but don't think it's necessary, so now behind this if clause.
            if (appliedDef || !byBoundary.isMounted)
                // Let's add in an emptyMove. Let's add it in even if was not mounted yet.
                // .. Not sure if is needed, but certainly can't hurt - maybe is even required (if appeared as a first child).
                emptyMovers.push(byBoundary.treeNode);
            // Nullify and cut.
            // .. The innerBoundaries are normally reassigned on .applyDefPairs.
            byBoundary.innerBoundaries = [];
            // .. Note. The cutting would normally be done in the processing in .assignTreeNodesForChildren (part of .pairDefs).
            byBoundary.treeNode.children = [];
            // .. Note that the appliedDef will never be null for content boundary. Otherwise it wouldn't have gotten here.
            byBoundary._innerDef = null;
        }

        // - 5b. Main clean up - handle removing unused applied defs. - //
        // .. Note, we put here all the render infos for destruction at the start of the array.

        // Clean up any defs that were unused by the pairing process.
        if (unusedDefs.size) {
            const infos = _Apply.cleanUpBoundaryDefs(unusedDefs, byBoundary.host.settings.devLogCleanUp);
            // Add to the beginning.
            renderInfos = infos[0].concat(renderInfos);
            boundaryChanges = infos[1].concat(boundaryChanges);
        }

        // Prepend empty movers.
        if (emptyMovers[0])
            renderInfos = emptyMovers.map(treeNode => ({ treeNode, emptyMove: true } as MixDOMRenderInfo)).concat(renderInfos);

        // Mark as having been activated.
        if (!byBoundary.isMounted)
            byBoundary.isMounted = true;

        // Clear that contexts were updated - because we did update.
        delete byBoundary._outerContextsWere;


        // - 6. Return collected render infos. - //

        return [ renderInfos, boundaryChanges ];

	},



    // - CORE METHOD FOR APPLYING PAIRS - //

    /** This is the core method for actually applying the meaning of defs into reality.
     * - The process includes applying dom tags into dom elements (not rendering yet) and instancing/updating sub boundaries.
     * - The array of toApplyPairs to be fed here should only include the "groundable" ones and in tree order (use .pairDefs method).
     *   .. All the other content (= not included in toApplyPairs) gets passed on as a closure by creating/updating it from .childDefs.
     * - Each item in the toApplyPairs is [toDef, aDef, treeNode, outerContexts ]
     * - Importantly this collects and returns ordered renderInfos and boundaryCalls, which can be later executed.
     */
    applyDefPairs(byBoundary: SourceBoundary | ContentBoundary, toApplyPairs: ToApplyPair[], forceUpdate: boolean = false): MixDOMChangeInfos {

        // Main idea:
        // - Start applying defs down the targetDef tree by given toApplyPairs and collect render infos.
        //    a) For any fragment, we just continue to next (the kids will be there in the loop).
        //    b) For any domtag def, collect render info (the kids will be in the loop).
        //    c) For any sub-boundary, apply the def to the sub-boundary (with targetDefs with our appliedDefs attached) collecting its render info.
        //       .. Note. Kids will not be in the loop - we need not go any further here. (This is pre-handled in toApplyPairs.)
        //       .. Note that this will prevent from any MixDOM.Content within from being detected in our scope - note that they were already converted to closures above.
        //       .... This is how it should be, because these closures will not be grounded by us - maybe by the nested boundary, maybe not.
        //    d) For any contentPassDef, ground them - as they are now in direct contact with the dom tag chain.
        //       .. This means, triggering the closure found in them (originally created by our host boundary, and might go way back).
        //       .. So we won't go further, but we will trigger the process to go further down from here (by the closure).

        // Apply the target defs recursively until each boundary starts (automatically limited by our toApplyPairs).
        // .. We update each def collecting render infos, and on boundaries create/update content closure and call mount/update.

    	// Prepare.
        const sourceBoundary = (byBoundary.boundaryId ? byBoundary : byBoundary.sourceBoundary) as SourceBoundary;
        const movedNodes: MixDOMTreeNode[] = [];
        const domPreCheckType = byBoundary.host.settings.preCompareDOMProps;

        // Clear innerBoundaries and innerPasses, they will be added again below.
        byBoundary.innerBoundaries = [];

        // Loop all toApplyPairs.
        let allChanges: MixDOMChangeInfos = [ [], [] ];
        // let renderInfos: MixDOMRenderInfo[] = [];
        // let boundaryChanges: MixDOMSourceBoundaryChange[] = [];
        for (const defPair of toApplyPairs) {

            // Prepare.
            const [ toDef, aDef, treeNode, outerContexts ] = defPair;
            const mountRun = aDef.action === "mounted";

            // Detect move. (For dom tags, boundaries and passes handled separately.)
            if (!mountRun && aDef.action === "moved") {
                switch (aDef.MIX_DOM_DEF) {

                    // For clarity and robustness, boundary's move is not handled here but in .updateBoundary in HostServices.
                    // case "boundary":

                    // Pass is handlded in contentGrounded, so it's not handled here to not double.
                    // case "pass":

                    case "contexts":
                    case "fragment":
                        // Move roots.
                        for (const node of _Find.rootDOMTreeNodes(treeNode, true, true)) { // <-- We use includeEmpty because maybe not all domNodes are not mounted yet.
                            if (movedNodes.indexOf(node) !== -1)
                                continue;
                            movedNodes.push(node);
                            allChanges[0].push({ treeNode: node, move: true });
                        }
                        break;
                    case "host":
                        // Verify that the host is dedicated to us (might be stolen).
                        if (aDef.host && aDef.host.groundedTree.parent === treeNode)
                            allChanges[0].push({ treeNode, move: true } as MixDOMRenderInfo);
                        break;
                }
            }

            // For fragments, there's nothing else.
            // .. Note that the stream need updates are handled in pairDefs process - to support auto-disabling at the same while.
            if (aDef.MIX_DOM_DEF === "fragment")
                continue;


            // - Special case: content passing - //

            // If the treeNode refers to a pass, let's handle it here and stop.
            if (treeNode.type === "pass") {

                // If it's not an actual pass, but a def related to the same treeNode, we can just skip.
                // .. It's then actually a fragment - either a real one or the one at the root of the content boundary (by design).
                // .. We only want to run the procedures below once for every pass.
                // .. Note. Actually, we don't need this check anymore - fragments have been cut out above - but just in case / for completion.
                if (aDef.MIX_DOM_DEF !== "pass")
                    continue;

                // Stream.
                let contentPass = aDef.contentPass;
                let contentKey = mixDOMContent.key;
                if (aDef.getContentStream) {
                    // Get fresh stream.
                    const Stream = aDef.getContentStream() as ComponentStreamType;
                    // Update key - it's used to detect true pass.
                    contentKey = Stream.Content?.key;
                    // Changed - only happens for contextual components, except for initial assigning (without the unground part).
                    const newClosure: ContentClosure | null = Stream.closure || null;
                    if (contentPass !== newClosure) {
                        // Unground and unlink.
                        if (contentPass) {
                            // Remove the stream link.
                            contentPass.streamLinks?.delete(aDef);
                            // Unground old.
                            _Apply.mergeChanges( allChanges, contentPass.contentUngrounded(aDef) );
                        }
                        // Assign new - will be grounded below.
                        aDef.contentPass = newClosure;
                        contentPass = newClosure;
                        // Add new stream link.
                        if (newClosure) {
                            if (!newClosure.streamLinks)
                                newClosure.streamLinks = new Set([aDef]);
                            else
                                newClosure.streamLinks.add(aDef);
                        }
                    }
                }

                // Ground and collect changes.
                // .. Note that we always have contentPass here, but for typescript put an if clause.
                // .... The reason for this is that targetDef's have .contentPassType and appliedDef's have .contentPass.
                // .... In the typing, it's just defined commonly for both, so both are optional types.
                if (contentPass)
                    _Apply.mergeChanges( allChanges, contentPass.contentGrounded(aDef, byBoundary, treeNode, aDef.key !== contentKey ? aDef.key : null) );

                // Add content boundary to collection.
                if (treeNode.boundary)
                    byBoundary.innerBoundaries.push(treeNode.boundary);

                // Nothing more to do.
                // .. Note that all around below, there's no case for "pass" - it's been completely handled here.
                continue;
            }


            // - Normal case: detect & update changes - //

            // Collect.
            const propsWere = aDef.props;
            let contentChanged = false;

            // Props.
            // .. They are for types: "element", "dom" and "boundary".
            // .. Also for "content" if has .domHTMLMode = true.
            if (toDef.props) {
                if (aDef.props !== toDef.props) {
                    // Add to pre-updates.
                    if (treeNode.boundary)
                        HostServices.preSetUpdates(treeNode.boundary as SourceBoundary, { props: toDef.props });
                    // Update.
                    aDef.props = toDef.props || {};
                }
            }

            // Apply special properties and detect swaps.
            let isDomType = false;
            switch(aDef.MIX_DOM_DEF) {

                // Case: Fragment - nothing to do.
                // Case: ContentPass - nothing to do. And actually not even in here - cut out above.

                // Content.
                case "content":
                    isDomType = true;
                    // Detect.
                    const htmlMode = toDef.domHTMLMode;
                    contentChanged = aDef.domContent !== toDef.domContent || htmlMode !== toDef.domHTMLMode;
                    // Update.
                    if (contentChanged) {
                        aDef.domContent = toDef.domContent as MixDOMContentSimple;
                        htmlMode !== undefined ? aDef.domHTMLMode = htmlMode : delete aDef.domHTMLMode;
                    }
                    break;

                // Element: swapping, .element, .cloneMode and .props.
                case "element":
                    isDomType = true;
                    if (aDef.domElement !== toDef.domElement) {
                        // Element swap.
                        if (!mountRun)
                            allChanges[0].push({ treeNode: treeNode as MixDOMTreeNodeDOM, swap: true });
                        // Apply.
                        aDef.domElement = toDef.domElement || null;
                    }
                    // Note. There's no real time mode change support - other than this.
                    aDef.domCloneMode = toDef.domCloneMode != null ? toDef.domCloneMode : null;
                    break;

                case "dom":
                    isDomType = true;
                    break;

                // Portal: swapping and .domPortal.
                case "portal":
                    if (aDef.domPortal !== toDef.domPortal) {
                        // Portal mount or swap.
                        allChanges[0].push({ treeNode: treeNode as MixDOMTreeNodePortal, [mountRun ? "create" : "swap"]: true });
                        // Apply.
                        aDef.domPortal = toDef.domPortal || null;
                    }
                    break;

                // Contexts (insertion, removal, swapping).
                case "contexts": {
                    const aContexts = aDef.contexts;
                    const toContexts = toDef.contexts || null;
                    if (aContexts !== toContexts) {
                        // Remove treeNode from the contexts.
                        if (aContexts) {
                            for (const name in aContexts) {
                                const aCtx = aContexts[name];
                                if (aCtx && aCtx !== (toContexts && toContexts[name] || null)) {
                                    // Call remove.
                                    if (aCtx.onRemoveFrom)
                                        aCtx.onRemoveFrom(treeNode as MixDOMTreeNodeContexts, name);
                                    // Do the removing - either one name or most often the whole entry.
                                    const tNames = aCtx.inTree.get(treeNode as MixDOMTreeNodeContexts);
                                    tNames && tNames.size > 1 ? tNames.delete(name) : aCtx.inTree.delete(treeNode as MixDOMTreeNodeContexts);
                                }
                            }
                        }
                        // Add treeNode to the context.
                        for (const name in toContexts) {
                            const toCtx = toContexts[name];
                            if (toCtx && toCtx !== (aContexts && aContexts[name] || null)) {
                                // Call add.
                                if (toCtx.onInsertInto)
                                    toCtx.onInsertInto(treeNode as MixDOMTreeNodeContexts, name);
                                // Do the adding - either one name or most often the whole entry.
                                const tNames = toCtx.inTree.get(treeNode as MixDOMTreeNodeContexts);
                                tNames ? tNames.add(name) : toCtx.inTree.set(treeNode as MixDOMTreeNodeContexts, new Set([name]));
                            }
                        }
                        // Apply.
                        aDef.contexts = toContexts;
                    }
                    break;
                }

                // Case: Sub boundary.
                // .. We only create it here, updating it is handled below.
                case "boundary":
                    // Create new boundary.
                    if (mountRun) {
                        const boundary = new SourceBoundary(byBoundary.host, aDef, treeNode, sourceBoundary);
                        boundary.parentBoundary = byBoundary;
                        boundary.outerContexts = { ...outerContexts };
                        treeNode.boundary = boundary;
                    }
                    break;

                // Case: Host.
                case "host":
                    // Note that the .host is already assigned on deffing to the toDef (so we'll have it on aDef too).
                    if (aDef.host) {
                        // Prepare.
                        const origHost = aDef.host;
                        let host = origHost;
                        // If was not updating an existing one and is already in use, we should try to duplicate.
                        if (aDef.action === "mounted" && origHost.groundedTree.parent) {
                            // See if can duplicate.
                            const duplicatable = host.settings.duplicatableHost;
                            if (typeof duplicatable === "function") {
                                const talkback = duplicatable(aDef.host, treeNode as MixDOMTreeNodeHost);
                                if (!talkback)
                                    break;
                                if (typeof talkback === "object") {
                                    host = talkback;
                                    // Was given a custom - make sure it's not taken.
                                    if (host.groundedTree.parent || host.sourceHost)
                                        break;
                                }
                            }
                            // Cannot duplicate.
                            else if (!duplicatable)
                                break;
                            // Got thru - create a new host (unless provided a new one).
                            if (host === origHost)
                                host = new Host( origHost.services.getRootDef(true), null, origHost.settings);
                            // Link.
                            host.sourceHost = origHost.sourceHost || origHost;
                            if (!origHost.ghostHosts)
                                origHost.ghostHosts = new Set();
                            origHost.ghostHosts.add(host);
                            // Set into the def.
                            aDef.host = host;
                        }

                        // Handle reassigning (duplicated or not).
                        // .. Reassign.
                        host.groundedTree.parent = treeNode;
                        treeNode.children = [ host.groundedTree ];
                        // .. Render infos.
                        allChanges[0].push( { treeNode: treeNode as MixDOMTreeNodeHost, move: true } );
                        // .. Outer contexts.
                        if (host.settings.welcomeContextsUpRoot)
                            host.services.onContextPass( outerContexts );
                        break;
                    }
            }

            // Case: Dom tags. Collect render info (the kids will be in the loop).
            if (isDomType) {
                // Create.
                if (mountRun)
                    allChanges[0].push( {
                        treeNode: treeNode as MixDOMTreeNodeDOM,
                        create: true,
                    } );
                // Prop updates to existing dom element.
                else {
                    // Check if should.
                    const move = aDef.action === "moved" && (movedNodes.indexOf(treeNode) === -1);
                    // .. Note that simpleContent never has props, so if aDef.tag === "" we never need to update (nor move, just content).
                    const update = aDef.tag ?
                            !domPreCheckType
                            || ((domPreCheckType === "if-needed") && (contentChanged || move))
                            || !_Lib.equalDOMProps(propsWere || {}, toDef.props || {})
                        : false;
                    // Add to rendering.
                    if (update || contentChanged || move) {
                        const info: MixDOMRenderInfo = { treeNode: treeNode as MixDOMTreeNodeDOM };
                        if (update)
                            info.update = true;
                        if (contentChanged)
                            info.content = true;
                        if (move) {
                            info.move = true;
                            movedNodes.push(treeNode);
                        }
                        allChanges[0].push( info );
                    }
                }
                // Attach signals - we just pass the dictionary like object. It will be used directly at the appropriate moment.
                if (toDef.attachedSignals)
                    aDef.attachedSignals = toDef.attachedSignals;
                else if (aDef.attachedSignals)
                    delete aDef.attachedSignals;
            }


            // - Special case: Updating a source boundary - //

            // Handle source boundary - upon creation or updating.
            // .. For any sub-boundary, apply the def to the sub-boundary (with targetDefs with our appliedDefs attached) collecting its render info.
            // .... Note. Kids will not be in the loop - we need not go any further here. (This is pre-handled in toApplyPairs.)
            // .... Note that this will prevent from any MixDOM.Content within from being detected in our scope - note that they were already converted to closures above.
            // ...... This is how it should be, because these closures will not be grounded by us - maybe by the nested boundary, maybe not.
            if (treeNode.boundary) {

                // - Before updating - //

                // Shortcut.
                // .. Note that we already cut the "pass" type above, so this here will always be a source boundary - not content passing boundary.
                const boundary = treeNode.boundary as SourceBoundary;

                // Add source or content boundary to collection.
                byBoundary.innerBoundaries.push(boundary);

                // Finish the constructing only now.
                // .. This way the process is similar to functional and class, and we need no special handling.
                if (mountRun)
                    boundary.reattach();

                // Attach signals by prop tunnelling, before updating the boundary (but after creating it, if mountRun).
                const component = boundary.component;
                if (aDef.attachedSignals !== toDef.attachedSignals) {
                    const from = aDef.attachedSignals;
                    const to = toDef.attachedSignals;
                    if (from) {
                        for (const key in from) {
                            const info = from[key];
                            if (!to || info !== to[key]) 
                                component.unlistenTo(key as any, info);
                        }
                    }
                    if (to) {
                        for (const key in to) {
                            const info = to[key];
                            if (!from || from[key] !== info)
                                component.listenTo(key as any, info);
                        }
                    }
                }

                // Attach contexts by prop tunnelling, before updating the boundary (but after creating it, if mountRun).
                if (aDef.attachedContexts || toDef.attachedContexts)
                    _Apply.handleAttachedContexts(aDef, toDef);

                // If the context did change, let's mark it here.
                // .. If the boundary will update, it will automatically (by background architecture)
                // .... find that contexts have changed for sub boundaries, and handle it.
                // .. If it will not update, we will collect the interested ones below.
                if (!mountRun) {
                    // Check old.
                    let didChange: MixDOMContextRefresh = 0;
                    const cApi = component.contextAPI;
                    const bOuterCtxs = boundary.outerContexts;
                    let changedNames: string[] | null = null;
                    for (const name in bOuterCtxs) {
                        // No change, or is overridden at a more important level - no change.
                        const oldCtx = bOuterCtxs[name];
                        if (outerContexts[name] === oldCtx || cApi && cApi.getContext(name as never, MixDOMContextAttach.Parent | MixDOMContextAttach.Overridden) !== undefined)
                            continue;
                        didChange |= MixDOMContextRefresh.Otherwise;
                        if (!changedNames)
                            changedNames = [];
                        changedNames.push(name);
                        // Update.
                        if (cApi)
                            didChange |= _Apply.helpUpdateContext(cApi, name, outerContexts[name] || null, oldCtx);
                    }
                    // Check new.
                    for (const name in outerContexts) {
                        // Already handled above.
                        if (bOuterCtxs[name] !== undefined)
                            continue;
                        // No change, or is overridden at a more important level - no change.
                        const newCtx = outerContexts[name];
                        if (bOuterCtxs[name] === newCtx || cApi && cApi.getContext(name as never, MixDOMContextAttach.Parent | MixDOMContextAttach.Overridden) !== undefined)
                            continue;
                        // Remove from context.
                        didChange |= MixDOMContextRefresh.Otherwise;
                        if (!changedNames)
                            changedNames = [];
                        changedNames.push(name);
                        if (cApi)
                            didChange |= _Apply.helpUpdateContext(cApi, name, newCtx, null);
                    }
                    // Changed - mark for contextual updates.
                    if (didChange && changedNames) {
                        // Collect old and update.
                        // .. By doing this we also mark that it if it didn't update, we will update the contexts (below).
                        boundary._outerContextsWere = bOuterCtxs;
                        boundary.outerContexts = { ...outerContexts };
                        // Let's mark that it has contextual updates.
                        if (cApi && HostServices.shouldUpdateContextually(didChange)) {
                            const pUpdates = boundary._preUpdates;
                            if (!pUpdates)
                                boundary._preUpdates = { contextual: changedNames };
                            else
                                pUpdates.contextual = pUpdates.contextual ? [... new Set([...pUpdates.contextual, ...changedNames]) ] : changedNames;
                        }
                    }
                }


                // - Content passing (before update, after contexts) - //

                // Prepare.
                const isStream = component.constructor.MIX_DOM_CLASS === "Stream";

                // Collect a new envelope for the content.
                // .. Note, there will not be a situation that toDef is a boundary and also has simple content - so always has childDefs.
                let newEnvelope: MixDOMContentEnvelope | null = null;
                const oldEnvelope = boundary.closure.envelope;
                if (toDef.childDefs[0]) {
                    // Create new fragment to hold the childDefs, and keep the reference for aDef.childDefs (needed for true content pass)..!
                    if (!oldEnvelope) {
                        newEnvelope = {
                            appliedDef: { tag: null, MIX_DOM_DEF: "fragment", childDefs: aDef.childDefs, action: "mounted" },
                            targetDef: { tag: null, MIX_DOM_DEF: "fragment", childDefs: toDef.childDefs }
                        };
                    }
                    // Just create a new envelope based on existing.
                    else {
                        newEnvelope = {
                            appliedDef: { ...oldEnvelope.appliedDef, childDefs: aDef.childDefs, action: aDef.action },
                            targetDef: { ...oldEnvelope.targetDef, childDefs: toDef.childDefs },
                        };
                    }
                }

                // Refresh source connection and collect infos from it.
                if (isStream)
                    allChanges = _Apply.mergeChanges( allChanges, (component as ComponentStream).reattachSource(true) );

                // Do a "pre-refresh" to update the info for the update runs below.
                // .. But we will not yet apply the content to grounded - maybe they will not be there anymore, or maybe there'll be more.
                const skipContent = !oldEnvelope && !newEnvelope;
                const bInterested = skipContent ? null : boundary.closure.preRefresh(newEnvelope, null, boundary._nUpdates != null && boundary._nUpdates > boundary.host.settings.maxCyclicalUpdates);


                // - Run updates - //

                // Run updates. It's done with an if-should check, but in either case it will clear the pending updates.
                // .. We tell that our bInterested are ordered, because they came from the content passing process (if we had any).
                // .. Actually no: they are not ordered - the sub branches are, but the insertion points might not be (they might move).

                // Pre-mark to prevent cyclical.
                if (isStream)
                    boundary._nUpdates = (boundary._nUpdates || 0) + 1;
                // Run.
                allChanges = _Apply.mergeChanges( allChanges, byBoundary.host.services.updateBoundary(boundary, forceUpdate, movedNodes, bInterested) );
                // Post-mark. The detection is a couple of lines above.
                if (isStream)
                    delete boundary._nUpdates;


                // - After updating - //

                // Finally, apply the content to the groundable spots inside.
                // .. As can be seen, we will first let their do their updates.
                // .... That is why we pre-refreshed them, so they have fresh info.
                // .... So that if any grounds, they can ground immediately.
                // .. But now is time to apply to any "still existing oldies" (excluding dead and newly grounded).
                if (!skipContent)
                    allChanges = _Apply.mergeChanges( allChanges, boundary.closure.applyRefresh(forceUpdate) );

            }


            // - Finish updating - //

            // Detach / attach ref.
            if (aDef.attachedRefs || toDef.attachedRefs) {
                // Detach.
                const aRefs = aDef.attachedRefs;
                const toRefs = toDef.attachedRefs;
                if (aRefs) {
                    for (const ref of aRefs) {
                        if (!toRefs || !toRefs.includes(ref))
                            Ref.willDetachFrom(ref, treeNode);
                    }
                }
                // Attach refs. When we are landing forwarded refs from host boundaries.
                if (toRefs) {
                    for (const ref of toRefs)
                        if (!aRefs || !aRefs.includes(ref))
                            Ref.didAttachOn(ref, treeNode);
                }
                // Update.
                aDef.attachedRefs = toRefs;
            }

        }

        return allChanges;
    },


    // - Def & treeNode sub routines - //


    /** This does the pairing for the whole render output, and prepares structure for applying defs.
     * - Returns toApplyPairs array for feeding into applyDefPairs.
     *   .. This includes only the ones to be "grounded" - the others will be passed inside a closure.
     * - Reuses, modifies and creates appliedDefs on the go. (Modifies properties: parent, children, treeNode.)
     * - Also reuses, modifies and creates treeNodes on the go.
     */
    pairDefs(byBoundary: SourceBoundary | ContentBoundary, preDef: MixDOMDefTarget, newAppliedDef: MixDOMDefApplied, defsByTags: Map<MixDOMDefKeyTag, MixDOMDefApplied[]>, unusedDefs: Set<MixDOMDefApplied>, toCleanUpDefs?: MixDOMDefApplied[], emptyMovers?: MixDOMTreeNode[] | null): ToApplyPair[] {
        // Typescript.
        type DefLoopPair = [MixDOMDefTargetPseudo | MixDOMDefTarget, MixDOMDefAppliedPseudo | MixDOMDefApplied, MixDOMTreeNode | null, OuterContexts, boolean, Map<MixDOMDefKeyTag, MixDOMDefApplied[]>? ];
        // Prepare.
        const settings = byBoundary.host.settings;
        const noValuesMode = settings.noRenderValuesMode;
        const wideArrKeys = settings.wideKeysInArrays;
        const toApplyPairs: [MixDOMDefTarget, MixDOMDefApplied, MixDOMTreeNode, OuterContexts][] = [];
        const sourceBoundary = byBoundary.boundaryId ? byBoundary as SourceBoundary : byBoundary.sourceBoundary;
        let defPairs: DefLoopPair[] = [[ { childDefs: [ preDef ] as MixDOMDefTarget[] }, { childDefs: [ newAppliedDef ] as MixDOMDefApplied[] }, byBoundary.treeNode, { ...byBoundary.outerContexts }, false ]];
        let defPair: DefLoopPair | undefined;
        let i = 0;
        // Start looping the target defs.
        while (defPair = defPairs[i]) {
            // Next.
            i++;
            // Parse.
            const [toDef, aDef, pTreeNode, outerContexts, toDefIsFragment ] = defPair;
            // Get scoped subDefsByTags mapping.
            // .. However, if the def refers to a true content pass within a spread, unravel back to our scope.
            let subDefsByTags = aDef.scopeMap || defPair[5];
            if (subDefsByTags && aDef.scopeType === "spread-pass")
                subDefsByTags = undefined;

            //
            //
            // <-- Dev. note. We should move CONTEXTS here.
            // ... It's more correct. However doesn't really make a practical difference at least currently.
            //
            //

            // Nothing to pair.
            if (!toDef.childDefs[0]) {
                aDef.childDefs = [];
            }
            // Pair children and assign tree nodes for them.
            else {

                // Find correct applied defs - with null for any unfound.
                const appliedChildDefs = _Apply.findAppliedChildDefs(aDef, toDef, subDefsByTags || defsByTags, unusedDefs, sourceBoundary, wideArrKeys);
                // Set children.
                aDef.childDefs = appliedChildDefs;

                // Extra routine, remove unwanted defs.
                for (let ii=0, toChildDef: MixDOMDefTarget; toChildDef=toDef.childDefs[ii]; ii++) {
                    // Handle by type.
                    let skipDef: boolean | null = null;
                    switch (toChildDef.MIX_DOM_DEF) {
                        // If the simple content should be skipped.
                        case "content":
                            skipDef = noValuesMode && (noValuesMode === true ? !toChildDef.domContent : noValuesMode.indexOf(toChildDef.domContent) !== -1);
                            break;
                        // If is a fragment that requires children, skip it if there's no content to be delivered.
                        // .. Also mark temp needs.
                        case "fragment":
                            // Premark as skippable type but not skipped.
                            skipDef = false;
                            // Not actually skippable (but maybe was before, so we need skipDef = false above).
                            if (toChildDef.withContent === undefined)
                                break;
                            // Stream.
                            const component = sourceBoundary?.component;
                            if (typeof toChildDef.withContent === "function") {
                                // Let's anyway mark our needs locally.
                                const Stream = toChildDef.withContent() as ComponentStreamType;
                                if (component)
                                    component.contentAPI.needsFor(Stream, "temp", true);
                                // Get output stream.
                                // Prepare auto-managing.
                                const aChildDef = aDef.childDefs[ii];
                                const contentPass = aChildDef.StreamOut?.closure || null;
                                const newClosure = Stream.closure || null;
                                // Output closure has changed.
                                // .. Note that the withContent fragments for streams are auto keyed: they won't mix with other streams.
                                // .. So we can reliably detect change, in the rare cases that it does happen. (The deletion part is in cleanUpBoundaryDefs, too, of course.)
                                if (contentPass !== newClosure) {
                                    // Remove the stream link.
                                    if (contentPass)
                                        contentPass.streamLinks?.delete(aChildDef);
                                    // Add new stream link.
                                    if (newClosure) {
                                        if (!newClosure.streamLinks)
                                            newClosure.streamLinks = new Set([aChildDef]);
                                        else
                                            newClosure.streamLinks.add(aChildDef);
                                    }
                                }
                                // Store for auto-managing.
                                aChildDef.StreamOut = Stream;
                                // Update whether should skip or not.
                                skipDef = !Stream.closure.hasContent();
                            }
                            // Local passing.
                            else {
                                if (toChildDef.withContent)
                                    skipDef = !sourceBoundary || !sourceBoundary.closure.hasContent();
                                if (component)
                                    component.contentAPI.needs("temp", true);
                            }
                            break;
                    }
                    // Update skip marks.
                    if (skipDef !== null) {
                        // Update mark.
                        const aDefChild = aDef.childDefs[ii];
                        skipDef ? aDefChild.disabled = true : delete aDefChild.disabled;
                    }
                }

                // Get tree nodes for kids.
                // .. For pseudo elements, we only ground if there's an element defined.
                const treeNodes = pTreeNode && toDef.MIX_DOM_DEF !== "boundary" && (toDef.MIX_DOM_DEF !== "element" || toDef.domElement) ?
                    _Apply.assignTreeNodesForChildren(appliedChildDefs, pTreeNode, toDefIsFragment, sourceBoundary, emptyMovers) : [];

                // Loop each kid to add to loop, and collect extra clean up.
                const newDefPairs: DefLoopPair[] = [];
                for (let ii=0, toChildDef: MixDOMDefTarget; toChildDef=toDef.childDefs[ii]; ii++) {
                    // Get.
                    const tNode = treeNodes[ii] || null;
                    const aChildDef = appliedChildDefs[ii];
                    // Check if should be removed.
                    if (!tNode && aChildDef.treeNode) {
                        // Mark as pre-cleaneable, if doesn't get sourceBoundary back, should be cleaned away.
                        aChildDef.treeNode.sourceBoundary = null;
                        if (toCleanUpDefs)
                            toCleanUpDefs.push(aChildDef);
                    }
                    // Contexts.
                    const myOuterContexts = toChildDef.contexts && toChildDef.MIX_DOM_DEF === "contexts" ? _Apply.mergeOuterContexts(outerContexts, toChildDef.contexts) : outerContexts;
                    // Add to loop.
                    const newPair: DefLoopPair = [toChildDef, aChildDef, tNode, myOuterContexts, toChildDef.MIX_DOM_DEF === "fragment" ];
                    newDefPairs.push(newPair);
                    // .. Handle spread content passing speciality.
                    if (subDefsByTags)
                        newPair[5] = subDefsByTags;
                }
                // Add new generation to the start of the loop.
                defPairs = newDefPairs.concat(defPairs.slice(i));
                i = 0;
            }

            // Add for phase II loop - unless was a pseudo-def or skipped.
            if (pTreeNode && toDef.MIX_DOM_DEF && aDef.MIX_DOM_DEF)
                toApplyPairs.push([toDef, aDef, pTreeNode, outerContexts]);

        }
        // Return ready to apply pairs.
        return toApplyPairs;
    },

    /** This finds the applied children non-recursively for given appliedParentDef and targetParentDef.
      *
      * 1. The logic is primarily based on matching tags.
      *    - To reuse an applied def, must have `===` same tag.
      *    - Accordingly for scope-wide key reusing, we get a map of `Map<QTag, MixDOMDefApplied[]>`.
      *
      * 2. The process is categorized followingly:
      *    - Arrays (very much like in React).
      *       A) Item with key:
      *          1. Look for matching tag & key from the equivalent array set.
      *             * If not found, look no further: clearly there's no match this time.
      *       B) Item with no key:
      *          1. Look for matching tag from the equivalent array set, but only ones that (likewise) have no key defined.
      *       C) Array with non-array: no matches.
      *    - Non-arrays.
      *       A) Item with key:
      *          1. Look for matching tag & key from siblings.
      *          2. If not found, look for matching tag & key from the whole scope (by the given tag based map).
      *          3. If not found, don't look further.
      *             * We had a key defined, and now there's clearly no match - let's not force one.
      *       B) Item with no key:
      *          1. Look from siblings with same tag based on order, but only the ones that (likewise) have no key defined.
      *       C) Non-array with array: no matches.
      *
      * 3. Further notes.
      *    - In version 3.0.0 a `constantProps` feature was added to the Component. It can disallow pairing if the defined props have changed.
      *    - Note that for render scope wide matching, there's a unusedDefs set given.
      *      * If a def has already been used, it's not found in the set, and we should not allow it - so it's skipped and the process continues.
      *      * However, when we reuse a def, if modifyBookKeeping is true, we remove it from the set and defsByTags.
      *      * This list is further used for knowing what defs were not reused - to remove them.
      *    - However, everytime finds a match (that is not vetoed by not found in unusedDefs), it's just accepted and the process stops.
      *      * So there's no post-processing to find the best of multiple fitting matches - we don't even continue to find more fitting matches.
      *      * In the context of sibling matches, this is actually desired behaviour, because it mixes in a secondary ordered based matching.
      *        .. However, for wide matching the order is non-important, but it's still consistent and reasonable: it's the tree-order for each tag.
      *    - Note. The logical outcome for the function is as described above, but it's instead organized below into a more flowing form.
      */
    findAppliedChildDefs(parentAppliedDef: MixDOMDefApplied | MixDOMDefAppliedPseudo | null, parentDef: MixDOMDefTarget | MixDOMDefTargetPseudo, defsByTags: Map<MixDOMDefKeyTag, MixDOMDefApplied[]>, unusedDefs: Set<MixDOMDefApplied>, sourceBoundary?: SourceBoundary | null, wideArrKeys?: boolean): MixDOMDefApplied[] {
        // Handle trivial special case - no children asked for.
        let nChildDefs = parentDef.childDefs.length;
        if (!nChildDefs)
            return [];
        // Not compatible - shouldn't find matches.
        const allowWide = wideArrKeys || !parentDef.isArray;
        if (!wideArrKeys && (parentDef.isArray != (parentAppliedDef && parentAppliedDef.isArray)))
            return parentDef.childDefs.map(def => _Defs.newAppliedDefBy(def, sourceBoundary && sourceBoundary.closure || null));

        // Loop children and collect defs.
        const siblingDefs = parentAppliedDef && parentAppliedDef.childDefs || null;
        const childAppliedDefs: MixDOMDefApplied[] = [];
        for (let i=0; i<nChildDefs; i++) {

            // Prepare.
            const childDef = parentDef.childDefs[i];
            const hasKey = childDef.key != null;
            const defType = childDef.MIX_DOM_DEF;
            const sTag = childDef.getContentStream || _Apply.SEARCH_TAG_BY_TYPE[defType] || childDef.tag;
            /** Whether did move for sure. If not sure, don't put to true. */
            let wideMove = false;
            let aDef: MixDOMDefApplied | null = null;

            // Look for matching tag (& key) from siblings.
            // .. Note that we don't slice & splice the siblingDefs - we just loop it over again.
            if (siblingDefs) {
                for (const def of siblingDefs) {
                    // Prepare.
                    // Not matching by: 1. key vs. non-key, 2. wrong tag, 3. already used.
                    if ((hasKey ? def.key !== childDef.key : def.key != null) || sTag !== (def.getContentStream || _Apply.SEARCH_TAG_BY_TYPE[def.MIX_DOM_DEF] || def.tag) || !unusedDefs.has(def))
                        continue;
                    // Not matching by constant props.
                    if (defType === "boundary" && def.treeNode?.boundary?.component?.constantProps &&
                        !_Lib.equalDictionariesBy(childDef.props, def.props, def.treeNode.boundary.component.constantProps))
                        continue;
                    // Accepted.
                    aDef = def;
                    unusedDefs.delete(def);
                    // Note. Might have still moved, but we don't mark didMove - we check for moving below.
                    break;
                }
            }
            // If not found, look for matching tag & key from the whole scope (by the given tag based map).
            if (!aDef && hasKey && allowWide) {
                // Note that cousinDefs is one time used and not used for clean up. It's okay to splice or not splice from it.
                const cousinDefs = defsByTags && defsByTags.get(sTag);
                if (cousinDefs) {
                    let ii = -1;
                    for (const def of cousinDefs) {
                        // Prepare.
                        ii++;
                        // Not matching.
                        if (def.key !== childDef.key || !unusedDefs.has(def))
                            continue;
                        // Not matching by constant props.
                        if (defType === "boundary" && def.treeNode?.boundary?.component?.constantProps &&
                            !_Lib.equalDictionariesBy(childDef.props, def.props, def.treeNode.boundary.component.constantProps))
                            continue;
                        // Accepted.
                        aDef = def;
                        unusedDefs.delete(def);
                        // cousinDefs.splice(ii, 1); // We shall skip splicing, can just loop again.
                        wideMove = true;
                        break;
                    }
                }
            }
            // Create.
            if (!aDef)
                aDef = _Defs.newAppliedDefBy(childDef, sourceBoundary && sourceBoundary.closure || null);
            // Mark whether was moved or just updated.
            else
                aDef.action =
                    // Moved by wide keys.
                    wideMove ||
                    // Moved by not had having a parent def.
                    !parentAppliedDef ||
                    // Moved by not having the same index as last time.
                    parentAppliedDef.childDefs[i] !== aDef
                    // Note that detection for being moved due to a passing parent (fragments, content passes, etc.) having moved is not done here.
                    // .. It's instead handled in _Apply.applyDefPairs and with contentGrounded method for passes (ContentClosure instances).
                    ? "moved" : "updated";
            //
            // <-- Should we also check for the previous if its next sibling had moved - do we need it logically ?
            // ... Anyway, if needed, could be done right here in the loop by storing prevDef. (But don't think it's needed.)

            // Add to collection in the children order.
            childAppliedDefs.push(aDef);
        }

        return childAppliedDefs;
    },

    /** This assigns treeNodes to an array of applied child defs.
     * Functionality:
     * - It tries to reuse the treeNode from the def if had, otherwise creates a new.
     *      * In either case assigns the treeNode parent-children relations for the main node.
     * - It modifies the appliedDef.treeNode accordingly and finally returns an array of treeNodes matching the given aChilds.
     * - It also knows how to handle fragments, so if the nodeIsFragment is true, it will treat the given workingTreeNode as a placeholder.
     * - Note that this procedure assumes that there are no (nestedly) empty fragments in the flow. (This is already handled in the defs creation flow.)
     *      * This makes it easy for us to know that whenever there's a child, it should have a node. So we can safely create new ones for all in the list (if cannot reuse).
     *      * Of course, fragments are not actually worth tree nodes, but we use them as placeholders in the flow. (But because of above, we know there will be something to replace them.)
     */
    assignTreeNodesForChildren(aChilds: MixDOMDefApplied[], workingTreeNode: MixDOMTreeNode, nodeIsFragment?: boolean, sourceBoundary?: SourceBoundary | null, emptyMovers?: MixDOMTreeNode[] | null): (MixDOMTreeNode | null)[] {

        // A preassumption of using this function is that it's called flowing down the tree structure.
        // .. Due to this, we will always clear the kids of the workingTreeNode, and reassign them afterwards below.
        if (workingTreeNode.children[0])
            workingTreeNode.children = [];

        // Quick exit.
        const count = aChilds.length;
        if (!count)
            return [];

        // Prepare.
        const treeNodes: (MixDOMTreeNode | null)[] = [];
        let iAddPoint = 0;
        let firstAvailable: MixDOMTreeNode | null = null;
        let pTreeNode: MixDOMTreeNode = workingTreeNode;

        // Prepare functionality for when is inside a fragment.
        // .. We need to get the parentTreeNode's child position for adding siblings next to it.
        if (nodeIsFragment) {
            // No parent node.
            // .. Just return an empty array - things would be messed up anyway.
            if (!workingTreeNode.parent)
                return [];
            // Reassign.
            pTreeNode = workingTreeNode.parent;
            firstAvailable = workingTreeNode;
            iAddPoint = pTreeNode.children.indexOf(workingTreeNode);
            // The child node is not a child of the parent.
            // .. Just return an empty array - things would be messed up anyway.
            if (iAddPoint === -1)
                return [];
        }

        // Loop target defs.
        for (let i=0; i<count; i++) {
            // Prepare.
            const aChild = aChilds[i];
            if (aChild.disabled) {
                // Modify the iAddPoint (instead of i and count), so that adds correctly - we are skipped.
                iAddPoint--;
                treeNodes.push(null);
                continue;
            }
            let myTreeNode: MixDOMTreeNode | null = null;
            // Had an existing treeNode, reuse it.
            if (aChild.treeNode)
                myTreeNode = aChild.treeNode;
            // Otherwise mark as mounted.
            // .. Unless is a fragment: we don't know it by checking .treeNode, as they never have treeNodes.
            else if (aChild.MIX_DOM_DEF !== "fragment")
                aChild.action = "mounted";
            // If has firstAvailable, handle it now.
            if (firstAvailable) {
                // If has myTreeNode, always reuse it.
                // .. In that remove firstAvailable, it will be forgotten. (We don't need to correct its parent.)
                if (myTreeNode)
                    pTreeNode.children.splice(iAddPoint, 1);
                else
                    myTreeNode = firstAvailable;
                // Clear, it's only for the first time.
                firstAvailable = null;
            }
            // Correct type.
            const aType = aChild.MIX_DOM_DEF;
            const type = aType === "content" || aType === "element" ? "dom" : (aType === "fragment" ? "" : aType as MixDOMTreeNode["type"]);
            // No tree node.
            if (!myTreeNode) {
                // Create.
                myTreeNode = {
                    type,
                    parent: pTreeNode,
                    children: [],
                    sourceBoundary: sourceBoundary || null,
                    domNode: null,
                } as MixDOMTreeNode;
                // Add domProps.
                if (myTreeNode.type === "dom")
                    myTreeNode.domProps = {};
            }
            // Update changes to existing.
            else {

                // Note that we must never clear away children from the child treeNodes here (unlike we do for the parent above).
                // .. This is because we don't know where they were from originally.
                // .... Specifically when they were previously nested inside a boundary within us (the source boundary),
                // .... and that sub boundary does not get updated due to "should"-smartness,
                // .... then we would end up messing the unupdated tree structure by clearing children away from here n there..!
                // .. For the same reason, it's actually okay to clear them for the parent (and should do so): as it's currently being processed (= updated).
                // .... Note also that it's impossible that the treeNode we reuse would have already been processed earlier in the flow.
                // .... This is because 1. we only reuse from aChild.treeNode, 2. each def has its unique treeNode (if any), 3. and def pairing process never double-uses defs.

                // Dislogde from parent in any case - the child will be (re-) added below.
                if (myTreeNode.parent) {
                    // Get index.
                    const iMe = myTreeNode.parent.children.indexOf(myTreeNode);
                    // Detect empty movers.
                    // .. We need this to update bookkeeping when something moves away from being a first child.
                    if (iMe === 0 && myTreeNode.parent !== pTreeNode && HostRender.PASSING_TYPES[myTreeNode.parent.type] === true && emptyMovers) {
                        if (emptyMovers.indexOf(myTreeNode.parent) === -1)
                            emptyMovers.push(myTreeNode.parent);
                    }
                    // Remove.
                    if (iMe !== -1)
                        myTreeNode.parent.children.splice(iMe, 1);
                }
                // Set parent and source.
                myTreeNode.parent = pTreeNode;
                myTreeNode.sourceBoundary = sourceBoundary || null;

                // We set the type in case was just created before fed to us.
                // .. The type should in practice stay the same - because treeNodes are tied to def's, execpt when doing swapping.
                myTreeNode.type = type;

            }

            // Pair with the def.
            if (aChild.MIX_DOM_DEF !== "fragment") {
                myTreeNode.def = aChild;
                aChild.treeNode = myTreeNode;
            }

            // Add to tree node's children at the right spot, and to our return collection.
            pTreeNode.children.splice(iAddPoint + i, 0, myTreeNode);
            treeNodes.push(myTreeNode);
        }
        // Return the treeNodes matching the given aChilds.
        return treeNodes;
    },

    /** This is a specific handler for true content pass.
     * - It needs this procedure because its defs have already been paired.
     * - In here we assign treeNodes to them if they are grounded.
     * - For those that are not used, we mark .sourceBoundary = null and collect to cleanUp (that we return). */
    assignTreeNodesForPass(contentBoundary: ContentBoundary): [ToApplyPair[], MixDOMTreeNode[], MixDOMTreeNode[]] {
        // Prepare.
        const appliedDef = contentBoundary._innerDef;
        const sourceBoundary = contentBoundary.sourceBoundary;
        const targetDef = contentBoundary.targetDef;
        const toCleanUp: MixDOMTreeNode[] = [];
        const emptyMovers: MixDOMTreeNode[] = [];
        // Prepare loop.
        type DefLoopPair = [MixDOMDefTarget, MixDOMDefApplied, MixDOMTreeNode | null, OuterContexts, boolean ];
        const toApplyPairs: ToApplyPair[] = [];
        let defPairs: DefLoopPair[] = [[ targetDef, appliedDef, contentBoundary.treeNode, { ...contentBoundary.outerContexts }, false ]];
        let defPair: DefLoopPair | undefined;
        let i = 0;
        // Start looping the target defs.
        while (defPair = defPairs[i]) {
            // Next.
            i++;
            // Parse.
            const [toDef, aDefNew, pTreeNode, outerContexts, toDefIsFragment ] = defPair;
            // Explore, if has children and is not a boundary def (in that case, our grounding branch ends to it).
            if (aDefNew.childDefs[0]) {
                // Get tree nodes for kids.
                // .. For <MixDOM.Element>'s, we only ground if there's an element defined.
                const treeNodes = pTreeNode && toDef.MIX_DOM_DEF !== "boundary" && (toDef.MIX_DOM_DEF !== "element" || toDef.domElement) ?
                    _Apply.assignTreeNodesForChildren(aDefNew.childDefs, pTreeNode, toDefIsFragment, sourceBoundary, emptyMovers) : [];
                // After clean up.
                let iKid = 0;
                const newDefPairs: DefLoopPair[] = [];
                for (const aChildDef of aDefNew.childDefs) {
                    // Add to pre-clean up - they might get reused later, so we just mark sourceBoundary null and collect.
                    // .. If upon final clean up they still have sourceBoundary null, it means they were not used.
                    // .. Note that we must not here do an actual clean up yet - this is because there might be nested true pass content boundaries within us.
                    const tNode: MixDOMTreeNode | null = treeNodes[iKid] || null;
                    if (!tNode && aChildDef.treeNode) {
                        toCleanUp.push(aChildDef.treeNode);
                        aChildDef.treeNode.sourceBoundary = null;
                    }
                    // Contexts.
                    const toChildDef = toDef.childDefs[iKid];
                    const myOuterContexts = toChildDef.contexts && toChildDef.MIX_DOM_DEF === "contexts" ? _Apply.mergeOuterContexts(outerContexts, toChildDef.contexts) : outerContexts;
                    // Add to loop.
                    newDefPairs.push([toChildDef, aChildDef as MixDOMDefApplied, tNode, myOuterContexts, aChildDef.MIX_DOM_DEF === "fragment" ]);
                    // Next.
                    iKid++;
                }
                // Add new generation to the start of the loop.
                defPairs = newDefPairs.concat(defPairs.slice(i));
                i = 0;
            }
            // Add for phase II loop.
            if (pTreeNode && !aDefNew.disabled)
                toApplyPairs.push([toDef, aDefNew, pTreeNode, outerContexts]);
        }
        // Return pairs.
        return [ toApplyPairs, toCleanUp, emptyMovers ];
    },


    // - Build up helper - //

    /** Helper to build tag based def map for wide key pairing. */
    buildDefMaps(appliedDef: MixDOMDefApplied, ignoreSelf: boolean = false, unusedDefs: Set<MixDOMDefApplied> = new Set(), collectPass?: MixDOMDefApplied[]): [Map<MixDOMDefKeyTag, MixDOMDefApplied[]>, Set<MixDOMDefApplied> ] {
        // Prepare.
        const defsByTags = new Map<MixDOMDefKeyTag, MixDOMDefApplied[]>();
        let defsToSearch: MixDOMDefApplied[] = ignoreSelf ? appliedDef.childDefs.slice() : [appliedDef];
        let searchDef: MixDOMDefApplied | undefined;
        let i = 0;
        // Loop the appliedDef and its childDefs recursively (in tree order).
        while (searchDef = defsToSearch[i]) {
            // Next.
            i++;
            // Add to the base collection.
            unusedDefs.add(searchDef);
            // Add to defsByTags.
            const sTag = searchDef.getContentStream || _Apply.SEARCH_TAG_BY_TYPE[searchDef.MIX_DOM_DEF] || searchDef.tag;
            const byTags = defsByTags.get(sTag);
            byTags ? byTags.push(searchDef) : defsByTags.set(sTag, [ searchDef ]);
            // Isolate if has scope type - eg. spread and content pass copies within spread.
            if (searchDef.scopeType) {
                // Unravel back to the parent scope, if is true pass within a spread (there's only one or none per spread).
                if (searchDef.scopeType === "spread-pass") {
                    if (collectPass)
                        collectPass.push(searchDef);
                }
                // Otherwise process the sub scope.
                else {
                    // Do the scoping and collect a nested true pass (into an array).
                    const collect: MixDOMDefApplied[] = [];
                    searchDef.scopeMap = _Apply.buildDefMaps(searchDef, true, unusedDefs, collect)[0];
                    // Add the kids of true pass to processing back in our scope - it belongs to us, even though went through the spread.
                    // .. Note, we do it by adding the kids using collect[0], because logically there's only 0 or 1 items in the array.
                    // .. This is because there's only one true pass (or none at all) - others are / become copies.
                    // .. So we just use the array as a reference, an extra return value that is not returned but given as an extra arg.
                    if (collect[0]) {
                        defsToSearch = collect[0].childDefs.concat(defsToSearch.slice(i));
                        i = 0;
                    }
                }
            }
            // Otherwise addd child defs to top of queue.
            else if (searchDef.childDefs[0]) {
                defsToSearch = searchDef.childDefs.concat(defsToSearch.slice(i));
                i = 0;
            }
            // Note. We don't search within nested boundaries, they have their own key scope.
            // .. The same for spreads except when they have a true content pass, then we take it back (handled above).
        }
        return [ defsByTags, unusedDefs ];
    },


    // - Clean up routines - //

    cleanUpBoundaryDefs(unusedDefs: Iterable<MixDOMDefApplied>, devLog: boolean = false, nullifyDefs: boolean = true, destroyAllDOM: boolean = true): MixDOMChangeInfos {
        // - DEVLOG - //
        // Log.
        if (devLog)
            console.log("___Apply.cleanUpBoundaryDefs: Dev-log: Clean up unused defs: ", [...unusedDefs]);
        // Loop each and destroy accordingly.
        let allChanges: MixDOMChangeInfos = [ [], [] ];
        for (const aDef of unusedDefs) {
            // Nothing to do.
            const treeNode = aDef.treeNode;
            if (!treeNode)
                continue;

            // // Detach tunnels - except for boundaries it's done in destroyBoundary.
            // // .. No need to do this. Tunnels are only meaningful for contextual boundaries.
            // if (aDef.MIX_DOM_DEF !== "boundary" && aDef.attachedContexts) {
            //     const tunnels = aDef.attachedContexts;
            //     for (const name in tunnels) {
            //         const tunnel = tunnels[name];
            //         if (tunnel)
            //             tunnel.onRemoveFrom(treeNode);
            //     }
            // }

            // // Detach signals.
            // // .. No need to do this either.
            // if (aDef.MIX_DOM_DEF !== "boundary" && aDef.attachedSignals) {
            // }

            // Remove.
            switch(aDef.MIX_DOM_DEF) {

                // The ones that will handle refs by themselves - use break.
                case "dom":
                case "element":
                case "content":
                    if (destroyAllDOM)
                        allChanges[0].push( { treeNode: treeNode as MixDOMTreeNodeDOM, remove: true });
                    break;
                case "boundary":
                    // Note that we must not nullifyDefs.
                    // .. Otherwise, we cannot swap away stuff from the to-be-destroyed boundary's content pass (defined by us).
                    // .. Note that destroyBoundary will call back here recursively.
                    if (treeNode.boundary)
                        allChanges = _Apply.mergeChanges(allChanges, _Apply.destroyBoundary(treeNode.boundary, false, destroyAllDOM));
                    break;

                // Don't break for the below one - we want to generally detach attachedRefs from all of them.

                case "pass":
                    // Content pass - by parent chain or streaming.
                    if (aDef.contentPass) {
                        // Unground.
                        allChanges = _Apply.mergeChanges(allChanges, aDef.contentPass.contentUngrounded(aDef));
                        // Remove the stream link for streams.
                        if (aDef.getContentStream)
                            aDef.contentPass.streamLinks?.delete(aDef);
                    }

                case "host": {
                    const host = aDef.host;
                    if (host && host.groundedTree.parent === treeNode) {
                        // Reassign.
                        host.groundedTree.parent = null;
                        treeNode.children = [];
                        // Render.
                        allChanges[0].push( { treeNode: treeNode as MixDOMTreeNodeHost, move: true });
                        // Clear from host linking.
                        const sourceHost = host.sourceHost;
                        if (sourceHost) {
                            // Remove from ghosts.
                            if (sourceHost.ghostHosts) {
                                sourceHost.ghostHosts.delete(host);
                                if (!sourceHost.ghostHosts.size)
                                    delete sourceHost.ghostHosts;
                            }
                            // Delete source host ref, too.
                            delete host.sourceHost;
                        }
                    }
                }
                case "contexts":
                    if (aDef.contexts) {
                        for (const name in aDef.contexts) {
                            // Get.
                            const aCtx = aDef.contexts[name];
                            if (!aCtx)
                                continue;
                            // Call remove.
                            if (aCtx.onRemoveFrom)
                                aCtx.onRemoveFrom(treeNode as MixDOMTreeNodeContexts, name);
                            // Do the removing - either one name or most often the whole entry.
                            const tNames = aCtx.inTree.get(treeNode as MixDOMTreeNodeContexts);
                            tNames && tNames.size > 1 ? tNames.delete(name) : aCtx.inTree.delete(treeNode as MixDOMTreeNodeContexts);
                        }
                    }

                case "fragment":
                    // Remove the stream link for contextual streams.
                    if (aDef.StreamOut && typeof aDef.withContent === "function")
                        aDef.StreamOut.closure.streamLinks?.delete(aDef);

                default:
                    if (aDef.attachedRefs && aDef.MIX_DOM_DEF)
                        for (const attachedRef of aDef.attachedRefs)
                            Ref.willDetachFrom(attachedRef, treeNode);
                    break;

            }
            // Nullify.
            if (nullifyDefs) {
                treeNode.parent = null;
                treeNode.sourceBoundary = null;
                delete aDef.treeNode;
            }
            //
            //
            // <-- Verify here that still works in all cases. Was before behind a check that verified that is within content boundary.

        }
        return allChanges;
    },

    /** This destroys a given boundary and cleans up everything in it recursively. */
    destroyBoundary(boundary: SourceBoundary | ContentBoundary, nullifyDefs: boolean = true, destroyAllDOM: boolean = true): MixDOMChangeInfos {
        // Prepare.
        let allChanges: MixDOMChangeInfos = [ [], [] ];

        // We destroy each in tree order - using _Apply.destroyBoundary and _Apply.cleanUpBoundaryDefs as a recursive pair.
        // .. Note. In a way, it'd be more natural to do it in reverse tree order.
        // .. However, we want to do the ref unmounting in tree order, in order to allow "salvaging" to work more effectively.
        // .... And we don't want component.willUnmount to run in reverse tree order while ref.onDomUnmount runs in tree order.
        // .. So as a result, we do the unmounting process in tree order as well.
        // .... If needed later, can be changed - just should handle salvaging in coherence with this.
        // .... However, it's not anymore that easy to change back - if does, should again switch to (pre v3) way of collecting all inside and looping them here.

        // Already destroyed.
        if (boundary.isMounted === null)
            return allChanges;
        // Source boundary.
        const sBoundary = boundary.boundaryId ? boundary : null;
        if (sBoundary) {
            const component = sBoundary.component;
            const Comp = component.constructor as ComponentType | ComponentShadowType | ComponentStreamType;
            // Call.
            if (component.signals.willUnmount)
                callListeners(component.signals.willUnmount);
            // Detach attached refs.
            if (sBoundary._outerDef.attachedRefs) {
                for (const attachedRef of sBoundary._outerDef.attachedRefs)
                    Ref.willDetachFrom(attachedRef, sBoundary.treeNode);
            }
            // Host listeners.
            if (component.hostListeners) {
                for (const [name, callback] of component.hostListeners)
                    sBoundary.host.unlistenTo(name as any, callback);
                delete component.hostListeners;
            }
            if (component.hostDataListeners) {
                for (const [callback] of component.hostDataListeners)
                    sBoundary.host.unlistenToData(callback);
                delete component.hostDataListeners;
            }
            // Contextual.
            const cApi = component.contextAPI;
            if (cApi) {
                // Detach tunnels - other than cascading.
                const namedCtxs = cApi.getContexts();
                for (const name in namedCtxs) {
                    const ctx = namedCtxs[name];
                    // We don't care for didChange flags, but just want to disentagle from contexts and call the onContextsChange callback.
                    if (ctx)
                        _Apply.helpUpdateContext(cApi, name, null, ctx);
                }
                // Note that streams (as well as any passes) are destroyed below.
            }
            // Remove from doubles bookkeeping and clear their signals.
            if (Comp.api) {
                Comp.api.components.delete(component as any); // Some typing thing here. Things should have StreamProps.
                if (Comp.api.signals)
                    Comp.api.signals = {};
            }
            // Stream.
            if (Comp.MIX_DOM_CLASS === "Stream")
                // Remove source, and add the destructional changes. (There's likely to be some, unless was using multiple streams or had empty content.)
                // .. The other changes will be bound to a host listener and run after, this includes triggering any interested ones.
                allChanges = _Apply.mergeChanges(allChanges, (Comp as ComponentStreamType).removeSource(component as ComponentStream));

            // Clear back links from stream needs.
            // .. Note that we don't need to clear the parent-child passing passing needs, as the closure dies with us.
            // .. Note also that while destruction happens our defs are fed to the cleanUpBoundaryDefs procedure (below) that handles "pass" type and fragments withContent.
            if (component.contentAPI.streamNeeds) {
                for (const Stream of [...component.contentAPI.streamNeeds.keys()])
                    Stream.contentLinks.delete(component.contentAPI);
                component.contentAPI.streamNeeds.clear();
            }

            // Clear signals. We just reset them.
            if (component.signals)
                component.signals = {};

            // Clear timers.
            if (component.timers)
                component.clearTimers();

        }

        // Add root removals for rendering info - note that we find the root nodes recursively thru nested boundaries.
        // .. We collect them in tree order for correct salvaging behaviour.
        if (destroyAllDOM)
            allChanges[0] = allChanges[0].concat(_Find.rootDOMTreeNodes(boundary.treeNode, true).map(treeNode => ({ treeNode: treeNode as (MixDOMTreeNodeDOM | MixDOMTreeNodeBoundary), remove: true } as MixDOMRenderInfo)));

        // Get all defs and send to cleanUpBoundaryDefs - we also pass the nullifyDefs down, but do not pass destroyAllDOM as we already captured the root nodes above recursively.
        // .. Note that if our inner def contains boundaries within (or is a boundary def itself), it will call here recursively down the structure (with destroyAllDOM set to false).
        if (boundary._innerDef)
            allChanges = _Apply.mergeChanges(allChanges,
                _Apply.cleanUpBoundaryDefs(_Find.allDefsIn(boundary._innerDef), boundary.host.settings.devLogCleanUp, nullifyDefs, false)
            );

        // Remove from updates, if was there.
        if (sBoundary)
            sBoundary.host.services.cancelUpdates(sBoundary);

        // Mark as destroyed.
        boundary.isMounted = null;
        return allChanges;
    },


    // - Handle attached helpers - //

    handleAttachedContexts(aDef: MixDOMDefApplied, toDef: MixDOMDefTarget) {
        // Nothing to do.
        const toContexts = toDef.attachedContexts;
        if (!aDef.treeNode || !toContexts && !aDef.attachedContexts)
            return;
        // Prepare.
        const treeNode: MixDOMTreeNode = aDef.treeNode;
        const cBoundary = treeNode.type === "boundary" && treeNode.boundary || null;
        const fromTunnels = aDef.attachedContexts || {};
        // Update.
        aDef.attachedContexts = toContexts;
        // Bookkeeping and calling.
        // .. This feature is only for boundaries with a contextAPI component.
        const cApi = cBoundary && cBoundary.component.contextAPI;
        if (cApi) {
            // Prepare.
            const overridden = cApi.overriddenContexts || {};
            const toTunnels = toContexts || {};
            const changed = new Set( [ ...Object.keys(fromTunnels), ...Object.keys(toTunnels) ])
            let didChange: MixDOMContextRefresh = 0;
            let changedNames: string[] | null = null;
            // Loop.
            for (const name of changed) {
                // If overridden, no change - we are at a less important level.
                if (overridden[name] !== undefined)
                    continue;
                // Not changed.
                const oldTunnel = fromTunnels[name] === undefined ? cBoundary.outerContexts[name] : fromTunnels[name];
                const newTunnel = toTunnels[name];
                if (newTunnel === oldTunnel)
                    continue;
                // Did change.
                didChange |= MixDOMContextRefresh.Otherwise;
                didChange |= _Apply.helpUpdateContext(cApi, name, newTunnel, oldTunnel);
                if (!changedNames)
                    changedNames = [];
                changedNames.push(name);
            }
            // Mark for contextual changes.
            if (changedNames && HostServices.shouldUpdateContextually(didChange)) {
                const pUpdates = cBoundary._preUpdates;
                if (!pUpdates)
                    cBoundary._preUpdates = { contextual: changedNames };
                else
                    pUpdates.contextual = pUpdates.contextual ? [... new Set([...pUpdates.contextual, ...changedNames]) ] : changedNames;
            }
        }
    },


    // - Context helpers - //

    helpUpdateContext(cApi: ContextAPI, ctxName: string, newContext: Context | null, oldContext: Context | null): MixDOMContextRefresh {
        // Data interests.
        let changed: MixDOMContextRefresh = 0;
        if ([...cApi.dataListeners].some(([, [needs]]) => needs.some(need => need === ctxName || need.startsWith(ctxName + ".")))) {
            if (oldContext)
                oldContext.services.onDisInterest("data", cApi.component, ctxName);
            if (newContext)
                newContext.services.onInterest("data", cApi.component, ctxName)
            changed |= MixDOMContextRefresh.Data;
        }
        // Action interests.
        if (cApi.signalsBy[ctxName]) {
            if (oldContext)
                oldContext.services.onDisInterest("signals", cApi.component, ctxName);
            if (newContext)
                newContext.services.onInterest("signals", cApi.component, ctxName);
            changed |= MixDOMContextRefresh.Actions;
        }
        // Return changed.
        return changed;
    },

    mergeOuterContexts(outerContexts: OuterContexts, modContexts: OuterContexts): OuterContexts {
        // Take copy and add / remove each.
        const newContexts = { ...outerContexts };
        for (const name in modContexts) {
            const ctx = modContexts[name];
            ctx ? newContexts[name] = ctx : delete newContexts[name];
        }
        // Return pruned.
        return newContexts;
    },


    // - Update boundaries helpers - //

    /** Sorting principles:
     * 1. We do it by collecting boundaryId parent chains (with ">" splitter, parent first).
     *    .. Note that any inner siblings will have the same key chain - we inner sort them by index.
     * 2. And then sort the boundaryId chains according to .startsWith() logic.
     * 3. Finally we reassign the updates - unraveling the nested order of same keys.
     * - Note. This implicitly supports sorting boundaries from different hosts, as the id's are in the form of: "h-number-b-number", eg. "h-2-b-47".
     */
    sortBoundaries(boundaries: Iterable<SourceBoundary>): void {

        // 1. Collect boundaryId chains.
        const keysMap: Map<string, SourceBoundary[]> = new Map();
        for (const boundary of boundaries) {
            // Prepare.
            let key = boundary.boundaryId;
            // Go up the parent chain.
            // .. If is a content boundary, just add an empty splitter.
            let pBoundary: MixDOMBoundary | null = boundary.parentBoundary;
            while (pBoundary) {
                key = (pBoundary.boundaryId || "") + ">" + key;
                pBoundary = pBoundary.parentBoundary;
            }
            // Add amongst cousins - optimization to get better tree order even in not-so-important cases.
            // .. We find the correct spot by comparing index in innerBoundaries.
            const collected = keysMap.get(key);
            if (collected) {
                let iSub = 0;
                if (boundary.parentBoundary) {
                    const inner = boundary.parentBoundary.innerBoundaries;
                    const iMe = inner.indexOf(boundary);
                    for (const kid of collected) {
                        if (iMe < inner.indexOf(kid))
                            break;
                        iSub++;
                    }
                }
                collected.splice(iSub, 0, boundary);
            }
            // First one in the cousin family.
            else
                keysMap.set(key, [boundary]);
        }

        // 2. Sort by keys.
        const sortedKeys: string[] = [];
        for (const thisKey of keysMap.keys()) {
            let iInsert = 0;
            let shouldBreak = false;
            for (const thatKey of sortedKeys) {
                // Is earlier.
                if (thatKey.startsWith(thisKey + ">"))
                    break;
                // Is related, should break after.
                if (thisKey.startsWith(thatKey + ">"))
                    shouldBreak = true;
                // Break now, relations have ended.
                else if (shouldBreak)
                    break;
                // Next location.
                iInsert++;
            }
            sortedKeys.splice(iInsert, 0, thisKey);
        }

        // 3. Reassign in correct order.
        let i = 0;
        for (const key of sortedKeys) {
            // Unravel any of the same cousin family.
            for (const boundary of keysMap.get(key) as SourceBoundary[]) {
                boundaries[i] = boundary;
                i++;
            }
        }
    },


    // - Helper to merge change infos - //

    mergeChanges<T extends MixDOMChangeInfos | null>(firstInfo: T, ...moreInfos: (MixDOMChangeInfos | null)[]): T {
        let allInfos: T = firstInfo;
        for (const infos of moreInfos) {
            if (!infos)
                continue;
            if (allInfos) {
                allInfos[0] = allInfos[0].concat(infos[0]);
                allInfos[1] = allInfos[1].concat(infos[1]);
            }
            else
                allInfos = infos as T;
        }
        return allInfos;
    },


}