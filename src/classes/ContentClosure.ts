

// - Imports - //

import {
    MixDOMTreeNode,
    MixDOMChangeInfos,
    MixDOMContentEnvelope,
    MixDOMDefApplied,
    MixDOMRenderInfo,
    MixDOMSourceBoundaryChange,
    MixDOMDefTarget,
} from "../static/_Types";
import { _Find } from "../static/_Find";
import { _Apply } from "../static/_Apply";
import { ContentBoundary, SourceBoundary } from "./Boundary";
import { ComponentStream } from "./ComponentStream";
import { HostServices } from "./HostServices";


// - Content closure - //

export class ContentClosure {

    // - Members & init - //

    /** The boundary that is connected to this closure - we are its link upwards in the content chain. */
    thruBoundary: SourceBoundary | null;
    /** The sourceBoundary is required to render anything - it defines to whom the content originally belongs.
     * If it would ever be switched (eg. by streaming from multiple sources), should clear the envelope first, and then assign new. */
    sourceBoundary: SourceBoundary | null;
    /** The sealed envelope that contains the content to pass: { applied, targetDef }. */
    envelope: MixDOMContentEnvelope | null;
    /** If not null, then this is the grounding def that features a true pass. */
    truePassDef: MixDOMDefApplied | null;
    /** Map where keys are the grounded defs (applied), and values are [boundary, treeNode, copyKey]. */
    groundedDefs: Map<MixDOMDefApplied, [boundary: SourceBoundary | ContentBoundary, treeNode: MixDOMTreeNode, copyKey: any]>;
    /** The grounded defs that are pending refresh. If all should be refreshed, contains all the keys in the groundedDefs. */
    pendingDefs: Set<MixDOMDefApplied>;
    /** This contains the boundaries from any WithContent components that refer to us.
     * - They will be re-updated every time our envelope changes. (Actually they would just care about null vs. non-null.) */
    withContents?: Set<SourceBoundary>;
    /** Used to detect which closures are linked together through content passing.
     * - This is further more used for the withContents feature. (But could be used for more features.)
     * - Note that this kind of detection is not needed for streams: as there's only the (active) source and target - nothing in between them.
     */
    chainedClosures?: Set<ContentClosure>;
    /** If this closure is linked to feed a stream, assign the stream instance here. */
    stream?: ComponentStream | null;

    constructor(thruBoundary?: SourceBoundary | null, sourceBoundary?: SourceBoundary | null) {
        this.thruBoundary = thruBoundary || null;
        this.sourceBoundary = sourceBoundary || null;
        this.envelope = null;
        this.truePassDef = null;
        this.groundedDefs = new Map();
        this.pendingDefs = new Set();
    }


    // - Needs - //

    /** Whether we have any actual content to pass. */
    hasContent(): boolean {
        const aDef = this.envelope?.applied;
        return !(!aDef || aDef.disabled || (aDef.MIX_DOM_DEF === "fragment" && (!aDef.childDefs.length || aDef.childDefs[0].disabled && aDef.childDefs.length === 1)));
    }

    /** Get the content that we pass. */
    readContent(shallowCopy: boolean = false): Readonly<MixDOMDefTarget[]> | null {
        if (!this.envelope)
            return null;
        const aDef = this.envelope.applied;
        const childDefs = aDef.childDefs;
        if (aDef.MIX_DOM_DEF === "fragment" && (!childDefs.length || childDefs[0].disabled && childDefs.length === 1))
            return null;
        const tDefs = this.envelope.target.childDefs;
        return shallowCopy ? tDefs.slice() : tDefs;
    }

    /** Collect the interested boundaries.
     * - In practice these come from two places:
     *      1. The special WithContent components (either the MixDOM global one or from a ComponentStream).
     *      2. For parental content passing, also the child closures that have reported to be fed by us.
     * - Because of this architectural decision, we actually don't anymore need a cyclical loop prevention (as of v3.1).
     *      * This is because, the parent no longer has to re-render - earlier had to using: .withContent(...contents). Instead only WithContent component updates.
     *      * Cyclical prevention would only be needed if deliberately formed one by defining render content for MyStream within MyStream.WithContent content pass.
     */
    collectInterested(byStream?: ComponentStream | null): Set<SourceBoundary> | null {
        // From Stream.
        if (byStream)
            return byStream.constructor.closure?.withContents ? new Set(byStream.constructor.closure.withContents) : null;
        // Doesn't have any direct interests, nor any child closures that we're feeding to.
        if (!this.withContents && !this.chainedClosures)
            return null;
        // Add direct interests.
        const interested = this.withContents ? new Set(this.withContents) : new Set<SourceBoundary>();
        if (this.chainedClosures) {
            for (const subClosure of this.chainedClosures) {
                const intr = subClosure.collectInterested();
                if (intr)
                    for (const b of intr)
                        interested.add(b);
            }
        }
        // Return interested.
        return interested.size ? interested : null;
    }


    // - Grounding / Ungrounding - //

    /** Should be called when a treeNode is grounding us to the grounded tree.
     * - If was grounded for the first time, updates the internals and returns render infos and boundary updates for the content.
     * - If was already grounded, returns [] for infos.
     */
    contentGrounded(groundingDef: MixDOMDefApplied, gBoundary: SourceBoundary | ContentBoundary, treeNode: MixDOMTreeNode, copyKey?: any): MixDOMChangeInfos {

        // Note that we don't collect listener boundaries.
        // .. Instead it's handled by downward flow (as content is rarely passed super far away).
        // .. To make it easier to handle not calling update on boundary many times, we just return a list of interested boundaries on .preRefresh().
        // .. The rest is then handled externally by the applyDefPairs process (after this function has returned).

        // Already grounded.
        // .. There's no changes upon retouching the ground - it was the parent that rendered, we don't care and nor does it.
        // .. However, we must still detect moving, and add according renderInfos (for all our dom roots) if needed.
        const info = this.groundedDefs.get(groundingDef);
        if (info) {
            // Check if should move the content.
            if (groundingDef.action === "moved" && treeNode.boundary) {
                // If so, it's just a simple move by collecting all root nodes inside.
                return [
                    _Find.rootDOMTreeNodes(treeNode.boundary.treeNode, true, true).map( // <-- We use includeEmpty because maybe not all domNodes are not mounted yet. Similarly as in _Apply.applyDefPairs.
                        treeNode => ({ treeNode, move: true }) as MixDOMRenderInfo ),
                    []
                ];
            }
            // Nothing to do.
            return [[], []];
        }

        // Update mapping.
        this.groundedDefs.set(groundingDef, [gBoundary, treeNode, copyKey]);

        // Update now and return the infos to the flow - we do this only upon grounding for the first time.
        // .. Otherwise, our content is updated on .applyRefresh(), which will be called after.
        return this.applyContentDefs([groundingDef]);

    }

    /** Should be called when a treeNode that had grounded our content into the grounded tree is being cleaned up. */
    contentUngrounded(groundingDef: MixDOMDefApplied): [MixDOMRenderInfo[], MixDOMSourceBoundaryChange[]] {
        // Not ours - don't touch.
        const info = this.groundedDefs.get(groundingDef);
        if (!info)
            return [[], []];
        // Was the real pass - free it up.
        if (this.truePassDef === groundingDef)
            this.truePassDef = null;
        // Remove from groundDefs and put its childDefs back to empty.
        this.groundedDefs.delete(groundingDef);
        this.pendingDefs.delete(groundingDef);
        // Destroy the content boundary (attached to the treeNode in our info).
        // .. We must nullify the defs too.
        const boundary = info[1].boundary;
        return boundary ? _Apply.destroyBoundary(boundary) : [[], []];
    }


    // - Refreshing content - //

    /** Sets the new envelope so the flow can be pre-smart, but does not apply it yet. Returns the interested sub boundaries. */
    preRefresh(newEnvelope: MixDOMContentEnvelope | null, byStream?: ComponentStream | null): Set<SourceBoundary> | null {

        // Notes about streaming:
        // 1. The normal content passing happens for the Stream source's closure by its parent.
        // 2. Then it hits the this.stream check below, and if active stream it goes through it - if not the flow is routed here (where it will never have grounding spots, so will die).
        // 3. The .preRefresh function on the stream will then call the connected output closure for .preRefresh(newEnvelope, this) giving the .byStream.
        // 4. Finally, the flow hits back here (in another closure) with byStream provided and with there being no .stream as it's the output part of the stream.
        // 5. And then the part below with this.collectInterested(byStream) is triggered using the byStream gotten from step 3.

        // If part of stream, our grounders are in the stream closure.
        if (this.stream && this.stream.canRefresh()) {
            this.envelope = newEnvelope;
            return this.stream.preRefresh(newEnvelope);
        }
        // Special quick exit: already at nothing.
        if (!this.envelope && !newEnvelope)
            return null;
        
        // // Alternative detection for whether our new envelope contains a content pass or not.
        // // .. If it does, we'll update the chainedClosures bookkeeping.
        // // .. Note that this feature is now detected in _Apply.defPairs without this extra run using def.hasPassWithin and used in _Apply.
        // const sClosure = this.sourceBoundary?.closure;
        // if (sClosure) {
        //     let hasPass = false;
        //     if (newEnvelope) {
        //         let defs = newEnvelope.applied.childDefs;
        //         while (defs[0]) {
        //             let nextDefs: MixDOMDefApplied[] = [];
        //             for (const def of defs) {
        //                 if (def.MIX_DOM_DEF === "pass") {
        //                     hasPass = true;
        //                     break;
        //                 }
        //                 if (def.childDefs[0])
        //                     nextDefs = nextDefs.concat(def.childDefs);
        //             }
        //             if (hasPass)
        //                 break;
        //             defs = nextDefs;
        //         }
        //     }
        //     if (hasPass)
        //         (sClosure.chainedClosures || (sClosure.chainedClosures = new Set())).add(this);
        //     else
        //         sClosure.chainedClosures?.delete(this);
        // }

        // Collect interested.
        const interested = this.collectInterested(byStream);
        // Mark that they have updates.
        if (interested)
            for (const b of interested)
                HostServices.preSetUpdates(b, { force: true });
        // Set envelope.
        this.envelope = newEnvelope;
        // Mark all as pending.
        this.pendingDefs = new Set(this.groundedDefs.keys());
        // Return the interested one or then nothing.
        return interested;
    }

    /** Call this after preRefresh to do the actual update process. Returns infos for boundary calls and render changes. */
    applyRefresh(forceUpdate: boolean = false): MixDOMChangeInfos {

        // If part of stream, our grounders are in the stream closure.
        if (this.stream && this.stream.canRefresh())
            return this.stream.applyRefresh(forceUpdate);

        // Prepare outcome.
        let renderInfos: MixDOMRenderInfo[] = [];
        let boundaryChanges: MixDOMSourceBoundaryChange[] = [];

        // Apply closure content to all pending and still existing grounders.
        // .. Note that the only time there's a grounder that's not pending is that when it was just grounded.
        // .. In that case its render info was returned in that part of flow.
        if (this.pendingDefs.size)
            [ renderInfos, boundaryChanges ] = this.applyContentDefs(this.pendingDefs, forceUpdate);

        // // There's no true pass def at all - clean up all inside in relation to original defs.
        // if (!this.truePassDef && this.envelope) {
        //     const devLog = this.sourceBoundary && this.sourceBoundary.host.settings.devLogCleanUp || false;
        //     for (const def of this.envelope.applied.childDefs) {
        //         // Nothing to clean up.
        //         const treeNode = def.treeNode;
        //         if (!treeNode)
        //             continue;
        //         // - DEVLOG - //
        //         // Log.
        //         if (devLog)
        //             console.log("__ContentClosure.applyRefresh dev-log - clean up treeNode (no true pass): ", treeNode);
        //         // Dom node.
        //         if (treeNode.type === "dom")
        //             renderInfos.push({treeNode, remove: true });
        //         // Boundary.
        //         else if (treeNode.boundary) {
        //             const [ rInfos, bUpdates ] = _Apply.destroyBoundary(treeNode.boundary);
        //             renderInfos = renderInfos.concat(rInfos);
        //             boundaryChanges = boundaryChanges.concat(bUpdates);
        //         }
        //         // Remove.
        //         treeNode.parent = null;
        //         treeNode.sourceBoundary = null;
        //         delete def.treeNode;
        //     }
        // }
        // //
        // // <-- While this here works (and does get triggered correctly), don't think it's actually needed.
        // // ... This is because - for true pass - the situation captured here is essentially the same as having no grounding defs.
        // // ... So, they'll get cleaned up anyway.


        // All had been updated already.
        return [renderInfos, boundaryChanges];
    }

    /** Internal helper to apply a new envelope and update any interested inside, returning the infos. */
    public applyEnvelope(newEnvelope: MixDOMContentEnvelope | null): MixDOMChangeInfos {
        // Update interested.
        const interested = this.preRefresh(newEnvelope);
        const extraInfos: MixDOMChangeInfos | null = interested && HostServices.updateInterested(interested);
        // Apply and get infos.
        const ourInfos = this.applyRefresh();
        return extraInfos ? [ extraInfos[0].concat(ourInfos[0]), extraInfos[1].concat(ourInfos[1]) ] : ourInfos;
    }


    // - Private helpers - //

    /** This is the method that makes stuff inside content closures concrete.
     * - For true ContentPass (see copies below), the situation is very distinguished:
     *   1. Because we are in a closure, our target defs have already been mapped to applied defs and new defs created when needed.
     *   2. However, the treeNode part of the process was not handled for us. So we must do it now.
     *   3. After having updated treeNodes and got our organized toApplyPairs, we can just feed them to _Apply.applyDefPairs to get renderInfos and boundaryUpdates.
     * - Behaviour on MixDOM.ContentCopy (and multi MixDOM.ContentPass).
     *   1. The situation is very different from ContentPass, because we don't have a set of pre-mangled applied defs.
     *   2. Instead we do actually do a very similar process to _Apply.runBoundaryUpdate, but without boundary and without rendering.
     *   3. For future updates, we can reuse the appliedDef for each copy - the copies can also be keyed.
     */
    private applyContentDefs(groundedDefs?: Iterable<MixDOMDefApplied> | null, forceUpdate: boolean = false): MixDOMChangeInfos {

        // Collect rendering infos basis once.
        // .. They are the same for all copies, except that the appliedDef is different for each.
        if (!groundedDefs)
            groundedDefs = this.groundedDefs.keys();

        // Loop each given groundedDef.
        let renderInfos: MixDOMRenderInfo[] = [];
        let boundaryChanges: MixDOMSourceBoundaryChange[] = [];
        for (const groundingDef of groundedDefs) {
            // Mark as non-pending in any case.
            this.pendingDefs.delete(groundingDef);
            // Get.
            const info = this.groundedDefs.get(groundingDef);
            if (info === undefined)
                continue;
            let [gBoundary, treeNode, copyKey] = info;
            let contentBoundary = treeNode.boundary as ContentBoundary | null;
            // Remove.
            if (!this.envelope || !this.sourceBoundary) {
                // Destroy.
                if (contentBoundary) {

                    // Note that we must call destroyBoundary with nullifyDefs=false (for true pass at least).
                    // .. The reason is that otherwise we might be messing up with treeNodes that maybe were reused in original render scope.
                    // .... It was verified earlier that there was a recursively adding bug because of nullifying defs.
                    // .. Note that alternatively we can just do: contentBoundary._innerDef.childDefs = []. This will essentially make nullifyDefs not run on the boundary.
                    // .... However, doing this sounds a bit wrong in case there are nested passes inside - because we should not nullify their defs either.

                    // Destroy and collect render infos - do not nullify defs (see above why).
                    const infos = _Apply.destroyBoundary(contentBoundary, false);
                    renderInfos = renderInfos.concat(infos[0]);
                    boundaryChanges = boundaryChanges.concat(infos[1]);

                    // We are the ones doing bookkeeping for the treeNode.boundary when it's a content boundary.
                    treeNode.boundary = null;
                }
            }
            // Create / update.
            else {
                let isTruePass = true;
                const envelope = this.envelope;
                // Create.
                if (!contentBoundary) {
                    // Create a new content boundary.
                    contentBoundary = new ContentBoundary(groundingDef, envelope.target, treeNode, this.sourceBoundary);
                    // Create basis for content copy - forces copy if already has a grounded def for truePass.
                    // .. Each copy grounding starts from an empty applied def, so we don't need to do anything else.
                    // .. For true pass we assign the childDefs directly to the innerDef's childDefs - the innerDef is a fragment.
                    isTruePass = copyKey == null && (!this.truePassDef || this.truePassDef === groundingDef);
                    if (isTruePass) {
                        contentBoundary._innerDef.childDefs = envelope.applied.childDefs;
                        this.truePassDef = groundingDef;
                    }
                    // Assign common stuff.
                    contentBoundary.parentBoundary = gBoundary;
                    treeNode.boundary = contentBoundary;
                }
                // Update existing content boundary.
                else {
                    isTruePass = this.truePassDef === groundingDef;
                    contentBoundary.updateEnvelope(envelope.target, isTruePass ? envelope.applied : null);
                }
                // Apply defs to pass/copy.
                const [rInfos, bChanges] = isTruePass ?
                    _Apply.runPassUpdate(contentBoundary, forceUpdate) :
                    _Apply.runBoundaryUpdate(contentBoundary, forceUpdate);
                // Collect infos.
                renderInfos = renderInfos.concat(rInfos);
                boundaryChanges = boundaryChanges.concat(bChanges);
            }

        }
        // Return infos.
        return [renderInfos, boundaryChanges];

    }

}
