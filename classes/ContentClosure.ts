

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
import { ContentAPI } from "./ContentAPI";
import { ComponentStreamType, ComponentStream } from "./ComponentStream";
import { HostServices } from "./HostServices";


// - Content closure - //

export class ContentClosure {

    // - Members & init - //

    /** The boundary that is connected to this closure - we are its link upwards in the content chain. */
    thruBoundary: SourceBoundary | null;
    /** The sourceBoundary is required to render anything - it defines to whom the content originally belongs.
     * If it would ever be switched (eg. by streaming from multiple sources), should clear the envelope first, and then assign new. */
    sourceBoundary: SourceBoundary | null;
    envelope: MixDOMContentEnvelope | null;
    truePassDef: MixDOMDefApplied | null;
    groundedDefsMap: Map<MixDOMDefApplied, [SourceBoundary | ContentBoundary, MixDOMTreeNode, any]>;
    pendingDefs: Set<MixDOMDefApplied>;

    /** Contains the links back to the content api's - used for collecting interested boundaries (base on needs) for auto-updating them. Managed from outside this class. */
    contentLinks: Set<ContentAPI>;
    /** Contains the links back to the defs (fragment.withContent() or pass.getContentStream()) related to stream outs, that might in turn have contentLinks to content apis. Managed from outside this class. Does not exist until first one created. */
    streamLinks?: Set<MixDOMDefApplied>;

    /** If this closure is linked to feed a stream, assign the stream instance here. */
    stream?: ComponentStream | null;

    constructor(thruBoundary?: SourceBoundary | null, sourceBoundary?: SourceBoundary | null) {
        this.thruBoundary = thruBoundary || null;
        this.sourceBoundary = sourceBoundary || null;
        this.envelope = null;
        this.truePassDef = null;
        this.groundedDefsMap = new Map();
        this.pendingDefs = new Set();
        this.contentLinks = new Set();
    }


    // - Needs - //

    hasContent(): boolean {
        const aDef = this.envelope?.appliedDef;
        return !(!aDef || aDef.disabled || (aDef.MIX_DOM_DEF === "fragment" && (!aDef.childDefs.length || aDef.childDefs[0].disabled && aDef.childDefs.length === 1)));
    }

    readContent(shallowCopy: boolean = false): Readonly<MixDOMDefTarget[]> | null {
        if (!this.envelope)
            return null;
        const aDef = this.envelope.appliedDef;
        const childDefs = aDef.childDefs;
        if (aDef.MIX_DOM_DEF === "fragment" && (!childDefs.length || childDefs[0].disabled && childDefs.length === 1))
            return null;
        const tDefs = this.envelope.targetDef.childDefs;
        return shallowCopy ? tDefs.slice() : tDefs;
    }
    
    collectInterested(byStream?: ComponentStream | null): Set<SourceBoundary> | null {

        // Prepare.
        const interested: Set<SourceBoundary> = new Set();

        // For Stream's closure, the logic is very different from normal content passing (see below).
        // .. It's connected non-locally, so it doesn't have a thruBoundary whose innerBoundaries we can use to go downwards until the chain breaks.
        // .. Instead, streams can be connected in two ways: 1. by having been grounded somewhere, 2. interests having been set. Otherwise, simply not connected.
        if (byStream) {

            // Loop stream linked defs.
            if (this.streamLinks) {
                for (const aDef of this.streamLinks) {
                    // Get stream tied to the def.
                    let Stream: ComponentStreamType | null = null;
                    switch (aDef.MIX_DOM_DEF) {
                        case "fragment":
                            if (typeof aDef.withContent === "function")
                                Stream = aDef.withContent();
                            break;
                        case "pass":
                            if (aDef.getContentStream)
                                Stream = aDef.getContentStream();
                            break;
                    }
                    // If has stream, get the interested through its .contentLinks.
                    if (Stream && Stream.contentLinks.size) {
                        for (const cApi of Stream.contentLinks) {

                            // // Not interested - actually the contentLinks are updated immediately based on needs, so this check could be omitted.
                            // if (!cApi.streamNeeds || !cApi.streamNeeds.get(Stream))
                            //     continue;

                            // Add to interested.
                            interested.add(cApi.component.boundary);
                        }
                    }
                }
            }

            // Dev. note.
            // 
            // Should we also loop all the grounded spots, and go down there by innerBoundaries - because our content might be passed further..?
            // .. The answer is: No, there's no down passing chain for streams - it's direct..!
            // .. The only practical exception is if the content is the content pass for stream, and it happens to have no content.
            // .... Then withContent behaviour is technically correct, but not what the user assumes: ultimately there will be nothing to pass.
            // .... However, this is fine enough. If really would want to know that, can use the contentAPI.getFor() and examine the contents if any.
            // ..... Actually, no can't - for the same reason that we can't automate it here easily. Because of the _needs_.
            //
            // .. So then. We could theoretically, check the grounding defs, and loop up _parent_ boundaries until reaching _source_ (unless original is source)..?
            // .... No hey, shouldn't it work, if wraps both with withContent..?
            // .... Hmm, will have a disabled def there at the root. <-- We could check for that.
            //
            // Afternote: I think checking was implemented for this special case.
            // .. In any case, should verify those special cases and examine the practical usefulness.

        }

        // For normal content passing (down the tree), we must use the .thruBoundary.innerBoundaries to go down.
        // .. We know that the chain is broken if an inner boundary's closure has no interested nor grounding points. Otherwise the chain continues.
        // .. Along this chain (including us), we collect the interested and alarm them for updates.
        else if (this.thruBoundary) {
            let loop: SourceBoundary[] = [ this.thruBoundary ];
            let boundary: SourceBoundary | undefined;
            let i = 0;
            while (boundary = loop[i]) {
                i++;
                // Add interested. Note that on the first run, this refers to us.
                for (const cApi of boundary.closure.contentLinks) {

                    // // Actually the contentLinks are updated immediately - so this check could be omitted.
                    // if (!cApi.localNeeds)
                    //     continue;

                    // Add to interests.
                    interested.add(cApi.component.boundary);
                }
                // Add inner.
                if (boundary.innerBoundaries[0]) {
                    loop = (boundary.innerBoundaries.filter(b => b.boundaryId && b.closure.contentLinks.size) as SourceBoundary[]).concat(loop.slice(i));
                    // loop = (boundary.innerBoundaries.filter(b => b.boundaryId && (b.closure.groundedDefsMap.size || b.closure.contentLinks.size)) as SourceBoundary[]).concat(loop.slice(i));
                    i = 0;
                }
            }
        }

        // Return interested.
        return interested.size ? interested : null;
    }


    // - Grounding / Ungrounding - //

    // If was grounded for the first time, updates the internals and returns render infos and boundary updates for the content.
    // .. If was grounded already returns [] for infos.
    contentGrounded(groundingDef: MixDOMDefApplied, gBoundary: SourceBoundary | ContentBoundary, treeNode: MixDOMTreeNode, copyKey?: any): MixDOMChangeInfos {

        // Note that we don't collect listener boundaries.
        // .. Instead it's handled by downward flow (as content is rarely passed super far away).
        // .. To make it easier to handle not calling update on boundary many times, we just return a list of interested boundaries on .preRefresh().
        // .. The rest is then handled externally by the applyDefPairs process (after this function has returned).

        // Already grounded.
        // .. There's no changes upon retouching the ground - it was the parent that rendered, we don't care and nor does it.
        // .. However, we must still detect moving, and add according renderInfos (for all our dom roots) if needed.
        const info = this.groundedDefsMap.get(groundingDef);
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
        this.groundedDefsMap.set(groundingDef, [gBoundary, treeNode, copyKey]);

        // Update now and return the infos to the flow - we do this only upon grounding for the first time.
        // .. Otherwise, our content is updated on .applyRefresh(), which will be called after.
        return this.applyContentDefs([groundingDef]);

    }

    contentUngrounded(groundingDef: MixDOMDefApplied): [MixDOMRenderInfo[], MixDOMSourceBoundaryChange[]] {
        // Not ours - don't touch.
        const info = this.groundedDefsMap.get(groundingDef);
        if (!info)
            return [[], []];
        // Was the real pass - free it up.
        if (this.truePassDef === groundingDef)
            this.truePassDef = null;
        // Remove from groundDefs and put its childDefs back to empty.
        this.groundedDefsMap.delete(groundingDef);
        this.pendingDefs.delete(groundingDef);
        // Destroy the content boundary (attached to the treeNode in our info).
        // .. We must nullify the defs too.
        const boundary = info[1].boundary;
        return boundary ? _Apply.destroyBoundary(boundary) : [[], []];
    }


    // - Refreshing content - //

    /** Sets the new envelope so the flow can be pre-smart, but does not apply it yet. Returns the interested sub boundaries. */
    preRefresh(newEnvelope: MixDOMContentEnvelope | null, byStream?: ComponentStream | null, skipInterests?: boolean): Set<SourceBoundary> | null {

        // Notes about streaming:
        // 1. The normal content passing happens for the Stream source's closure by its parent.
        // 2. Then it hits the this.stream check below, and if active stream it goes through it - if not the flow is routed here (where it will never have grounding spots, so will die).
        // 3. The .preRefresh function on the stream will then call the connected output closure for .preRefresh(newEnvelope, this) giving the .byStream.
        // 4. Finally, the flow hits back here (in another closure) with byStream provided and with there being no .stream as it's the output part of the stream.
        // 5. And then the part below with this.collectInterested(byStream) is triggered using the byStream gotten from step 3.

        // If part of stream, our grounders are in the stream closure.
        if (this.stream && this.stream.canRefresh()) {
            this.envelope = newEnvelope;
            return this.stream.preRefresh(newEnvelope, skipInterests);
        }
        // Special quick exit: already at nothing.
        if (!this.envelope && !newEnvelope)
            return null;
        // Collect interested.
        const interested = skipInterests ? null : this.collectInterested(byStream);
        // If had interested, mark preUpdates for them without host.services.absorbUpdates call.
        // .. The parent scope that calls us should handle them directly instead.
        if (interested) {
            // Get before.
            const oldKids = this.envelope?.targetDef.childDefs.slice() || []; // <-- Should we slice here..? I guess.
            // For a stream.
            if (byStream)
                for (const b of interested) {
                    // Mark for updates.
                    // .. Note that for comparisons, it's okay to use a Map here and set keys on it (without creating a new).
                    // .. This is because on each update run it's a new preUpdate object and thus a new map.
                    if (!b._preUpdates)
                        b._preUpdates = { streamed: new Map([[byStream, oldKids]]) }
                    else if (!b._preUpdates.streamed)
                        b._preUpdates.streamed = new Map([[byStream, oldKids]]);
                    else if (!b._preUpdates.streamed.has(byStream))
                        b._preUpdates.streamed.set(byStream, oldKids);
                }
            // In regards to parental content passing.
            else 
                for (const b of interested) {
                    // Mark the boundary for updates.
                    if (!b._preUpdates)
                        b._preUpdates = { children: oldKids }
                    else if (!b._preUpdates.children)
                        b._preUpdates.children = oldKids;
                }
        }
        // Set envelope.
        this.envelope = newEnvelope;
        // Mark all as pending.
        this.pendingDefs = new Set(this.groundedDefsMap.keys());
        // Return all interested.
        return interested;
    }

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
        //     for (const def of this.envelope.appliedDef.childDefs) {
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
        const extraInfos: MixDOMChangeInfos | null = interested ? HostServices.updateInterested(interested) : null;
        // Apply and get infos.
        const uInfos = this.applyRefresh();
        return extraInfos ? [ extraInfos[0].concat(uInfos[0]), extraInfos[1].concat(uInfos[1]) ] : uInfos;
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
            groundedDefs = this.groundedDefsMap.keys();

        // Loop each given groundedDef.
        let renderInfos: MixDOMRenderInfo[] = [];
        let boundaryChanges: MixDOMSourceBoundaryChange[] = [];
        for (const groundingDef of groundedDefs) {
            // Mark as non-pending in any case.
            this.pendingDefs.delete(groundingDef);
            // Get.
            const info = this.groundedDefsMap.get(groundingDef);
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
                    contentBoundary = new ContentBoundary(groundingDef, envelope.targetDef, treeNode, this.sourceBoundary);
                    // Create basis for content copy - forces copy if already has a grounded def for truePass.
                    // .. Each copy grounding starts from an empty applied def, so we don't need to do anything else.
                    // .. For true pass we assign the childDefs directly to the innerDef's childDefs - the innerDef is a fragment.
                    isTruePass = copyKey == null && (!this.truePassDef || this.truePassDef === groundingDef);
                    if (isTruePass) {
                        contentBoundary._innerDef.childDefs = envelope.appliedDef.childDefs;
                        this.truePassDef = groundingDef;
                    }
                    // Assign common stuff.
                    contentBoundary.parentBoundary = gBoundary;
                    treeNode.boundary = contentBoundary;
                }
                // Update existing content boundary.
                else {
                    isTruePass = this.truePassDef === groundingDef;
                    contentBoundary.updateEnvelope(envelope.targetDef, isTruePass ? envelope.appliedDef : null);
                }
                // Apply defs to pass/copy.
                const [rInfos, bChanges] = isTruePass ?
                    _Apply.runContentPassUpdate(contentBoundary, forceUpdate) :
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
