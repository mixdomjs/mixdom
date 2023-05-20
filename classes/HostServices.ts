

// - Imports - //

import {
    MixDOMTreeNode,
    MixDOMSourceBoundaryChange,
    MixDOMRenderInfo,
    MixDOMSourceBoundaryId,
    MixDOMComponentPreUpdates,
    MixDOMChangeInfos,
    MixDOMDefTarget,
    MixDOMRenderOutput,
    MixDOMContextRefresh,
    MixDOMUpdateCompareModesBy,
    MixDOMUpdateCompareMode,
    MixDOMComponentUpdates,
    MixDOMCompareDepthByMode,
} from "../static/_Types";
import { SignalListenerFunc, askListeners, callListeners } from "./SignalMan";
import { _Lib } from "../static/_Lib";
import { _Defs } from "../static/_Defs";
import { _Find } from "../static/_Find";
import { _Apply } from "../static/_Apply";
import { HostRender } from "./HostRender";
import { SourceBoundary } from "./Boundary";
import { Context } from "./Context";
import { Host } from "./Host";
import { ComponentStream } from "./ComponentStream";
import { ComponentFunc, ComponentTypeAny } from "./Component";
import { WrapperAPI } from "./ComponentWrapper";
import { ShadowAPI } from "./ComponentShadow";


// - HostServices (the technical part) for Host  - //

export class HostServices {

    public static FLAGS_LISTENER_ONE_SHOT = 1;

    // Relations.
    /** Dedicated render handler class instance. It's public internally, as it has some direct-to-use functionality: like pausing, resuming and hydration. */
    public renderer: HostRender;
    /** Ref up. This whole class could be in host, but for internal clarity the more private and technical side is here. */
    private host: Host;

    // Bookkeeping.
    /** A simple counter is used to create unique id for each boundary (per host). */
    private bIdCount: number;
    /** This is the target render definition that defines the host's root boundary's render output. */
    private rootDef: MixDOMDefTarget | null;
    /** Temporary value (only needed for .onlyRunInContainer setting). */
    private _rootIsDisabled?: true;

    // Update flow.
    private updateTimer: number | NodeJS.Timeout | null;
    private updatesPending: Set<SourceBoundary>;
    private _isUpdating?: boolean;
    private _forcePostTimeout?: number | null;

    // Post flow: execute render infos and boundary calls (eg. didMount and didUpdate).
    private renderTimer: number | NodeJS.Timeout | null;
    private postBoundaryCalls: MixDOMSourceBoundaryChange[][];
    private postRenderInfos: MixDOMRenderInfo[][];

    constructor(host: Host) {
        this.host = host;
        this.renderer = new HostRender(host.settings, host.groundedTree); // Should be constructed after assigning settings and groundedTree.
        this.bIdCount = 0;
        this.updateTimer = null;
        this.renderTimer = null;
        this.updatesPending = new Set();
        this.postRenderInfos = [];
        this.postBoundaryCalls = [];
    }

    
    // - Id & timers - //

    public createBoundaryId(): MixDOMSourceBoundaryId {
        return "h-" + this.host.constructor.idCount.toString() + "-b-" + (this.bIdCount++).toString();
    }

    public clearTimers(forgetPending: boolean = false): void {
        // Unless we are destroying the whole thing, it's best to (update and) render the post changes into dom.
        if (!forgetPending)
            this.runUpdates(null);
        // Clear update timer.
        if (this.updateTimer !== null) {
            clearTimeout(this.updateTimer);
            this.updateTimer = null;
        }
        // Clear render timer.
        if (this.renderTimer !== null) {
            clearTimeout(this.renderTimer);
            this.renderTimer = null;
        }
    }


    // - Host root boundary helpers - //

    public createRoot(content: MixDOMRenderOutput): ComponentTypeAny {
        // Update root def.
        this.rootDef = _Defs.newDefFromContent(content);
        // Create a root boundary that will render our targetDef or null if disabled.
        return ((_props, _component) => () => this._rootIsDisabled ? null : this.rootDef) as ComponentFunc;
    }

    public updateRoot(content: MixDOMRenderOutput, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void {
        // Create a def for the root class with given props and contents.
        // .. We have a class, so we know won't be empty.
        this.rootDef = _Defs.newDefFromContent(content);
        // Restart.
        this.host.rootBoundary.update(true, forceUpdateTimeout, forceRenderTimeout);
    }

    public refreshRoot(forceUpdate: boolean = false, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void {
        // Update state.
        const wasEnabled = !this._rootIsDisabled;
        const host = this.host;
        const shouldRun = !(host.settings.onlyRunInContainer && !host.groundedTree.domNode && !host.groundedTree.parent);
        shouldRun ? delete this._rootIsDisabled : this._rootIsDisabled = true;
        // Force update: create / destroy.
        if (forceUpdate || !shouldRun || !wasEnabled)
            host.rootBoundary.update(true, forceUpdateTimeout, forceRenderTimeout);
        // Do moving.
        else if (shouldRun && wasEnabled) {
            // Get its root nodes.
            const rHostInfos = host.rootBoundary ? _Find.rootDOMTreeNodes(host.rootBoundary.treeNode, true).map(treeNode => ({ treeNode, move: true }) as MixDOMRenderInfo) : [];
            // Trigger render immediately - and regardless of whether had info (it's needed for a potential hosting host).
            this.absorbChanges(rHostInfos, null, forceRenderTimeout);
        }
    }

    public clearRoot(forgetPending: boolean = false) {
        // Clear timers.
        this.clearTimers(forgetPending);
        // Clear target.
        this.rootDef = null;
    }

    public getRootDef(shallowCopy?: boolean): MixDOMDefTarget | null {
        return this.rootDef && (shallowCopy ? { ...this.rootDef } : this.rootDef);
    }

    // - Context pass (host to host) - //

    public onContextPass(outerContexts: Record<string, Context | null>): void {
        // Prepare.
        const root = this.host.rootBoundary;
        if (!root._outerContextsWere)
            root._outerContextsWere = root.outerContexts;
        root.outerContexts = { ...outerContexts };
        // Update contexts down.
        const collected = HostServices.afterOuterContexts(root);
        // Handle changes.
        for (const thruBoundary of collected) {
            // Was already updated.
            if (!thruBoundary._preUpdates)
                continue;
            // Update and collect.
            this.absorbUpdates(thruBoundary, {}); // Just trigger empty. Our contextual updates are already found in _preUpdates (due to .afterOuterContexts).
        }
        // Flush.
        this.runUpdates();
    }


    // - Has pending updates or post process - //

    public hasPending(updateSide: boolean = true, postSide: boolean = true, dataSide: boolean = true): boolean {
        return updateSide && this.updateTimer !== null || postSide && this.renderTimer !== null || dataSide && !!this.host.dataKeysPending || false;
    }


    // - 1. Update flow - //

    public cancelUpdates(boundary: SourceBoundary): void {
        this.updatesPending.delete(boundary);
    }

    /** This is the main method to update a boundary.
     * - It applies the updates to bookkeeping immediately.
     * - The actual update procedure is either timed out or immediate according to settings.
     *   .. It's recommended to use a tiny update timeout (eg. 0ms) to group multiple updates together. */
    public absorbUpdates(boundary: SourceBoundary, updates: MixDOMComponentPreUpdates, refresh: boolean = true, forceUpdateTimeout?: number | null, forcePostTimeout?: number | null): void {
        // Dead.
        if (boundary.isMounted === null)
            return;
        // Update the bookkeeping.
        HostServices.preSetUpdates(boundary, updates);
        // Is rendering, re-render immediately, and go no further. No need to update timeout either.
        if (boundary._renderState) {
            boundary._renderState = "re-updated";
            return;
        }
        // Add to collection.
        this.updatesPending.add(boundary);
        // Trigger.
        if (refresh)
            this.triggerUpdates(forceUpdateTimeout, forcePostTimeout);
    }

    /** This triggers the update cycle. */
    public triggerUpdates(forceUpdateTimeout?: number | null, forcePostTimeout?: number | null) {
        // Update temporary time out if given a tighter time.
        if (forcePostTimeout !== undefined) {
            if ((forcePostTimeout === null) || (this._forcePostTimeout === undefined) || (this._forcePostTimeout !== null) && (forcePostTimeout < this._forcePostTimeout) )
                this._forcePostTimeout = forcePostTimeout;
        }
        // If is updating, just wait.
        if (this._isUpdating)
            return;
        // Refresh.
        this.refreshWithTimeout("update", forceUpdateTimeout);
    }

    /** This clears the this.dataKeysPending to `null` and absorbs any updates for related host data listeners, but will not trigger refresh. */
    private flushDataKeys() {
        // If has data keys, mark all with host data interests to be potentially refreshed - but don't trigger refresh.
        if (this.host.dataKeysPending) {
            // Get and clear pending refreshes.
            const refreshKeys = this.host.dataKeysPending;
            this.host.dataKeysPending = null;
            // Absorb updates for each component that's part of the host - if the refresh keys matches its data needs.
            for (const boundary of _Find.boundariesWithin(this.host.rootBoundary)) {
                if (boundary.component.hostDataListeners) {
                    // Collect matching callbacks.
                    const hostCalls: SignalListenerFunc[] = [];
                    for (const [callback, needs] of boundary.component.hostDataListeners) {
                        if (refreshKeys === true || refreshKeys.some(dataKey => needs.some(need => need === dataKey || need.startsWith(dataKey + ".") || dataKey.startsWith(need + ".")))) 
                            hostCalls.push(callback);
                    }
                    // Absorb without refreshing.
                    if (hostCalls[0])
                        this.absorbUpdates(boundary, { host: hostCalls }, false);
                }
            }
        }
    }

    /** This method should always be used when executing updates within a host - it's the main orchestrator of updates.
     * To add to post updates use the .absorbUpdates() method above. It triggers calling this with the assigned timeout, so many are handled together. */
    private runUpdates(postTimeout?: number | null) {

        // Set flags.
        this.updateTimer = null;
        this._isUpdating = true;
        // Get render timeout.
        postTimeout = postTimeout !== undefined ? postTimeout : (this._forcePostTimeout !== undefined ? this._forcePostTimeout : this.host.settings.renderTimeout);
        delete this._forcePostTimeout;

        // If has data keys, absorb interested.
        if (this.host.dataKeysPending)
            this.flushDataKeys();

        // Update again immediately, if new ones collected.
        while (this.updatesPending.size) {

            // Copy and clear delayed, so can add new during.
            let sortedUpdates = [...this.updatesPending];
            this.updatesPending.clear();

            // Do smart sorting here if has at least 2 boundaries.
            if (sortedUpdates[1])
                _Apply.sortBoundaries(sortedUpdates);

            // Collect output.
            let renderInfos: MixDOMRenderInfo[] = [];
            let boundaryUpdates: MixDOMSourceBoundaryChange[] = [];

            // Run update for each.
            for (const boundary of sortedUpdates) {
                const updates = this.updateBoundary(boundary);
                if (updates) {
                    renderInfos = renderInfos.concat(updates[0]);
                    boundaryUpdates = boundaryUpdates.concat(updates[1]);
                }
            }

            // Add to post post.
            if (renderInfos[0])
                this.postRenderInfos.push(renderInfos);
            if (boundaryUpdates[0]) {
                if (this.host.settings.useImmediateCalls)
                    HostServices.callBoundaryChanges(boundaryUpdates);
                else
                    this.postBoundaryCalls.push(boundaryUpdates);
            }

            // If has more data keys, absorb interested.
            if (this.host.dataKeysPending)
                this.flushDataKeys();

        }

        // Call listeners.
        if (this.host.signals.onUpdate)
            callListeners(this.host.signals.onUpdate);

        // Render.
        this.refreshWithTimeout("render", postTimeout);

        // Finished.
        delete this._isUpdating;
    }

    /** This is the core whole command to update a source boundary including checking if it should update and if has already been updated.
     * - It handles the _preUpdates bookkeeping and should update checking and return infos for changes.
     * - It should only be called from a few places: 1. runUpdates flow above, 2. within _Apply.applyDefPairs for updating nested, 3. HostServices.updateInterested for updating indirectly interested sub boundaries.
     * - If gives bInterested, it's assumed to be be unordered, otherwise give areOrdered = true. */
    public updateBoundary(boundary: SourceBoundary, forceUpdate: boolean | "all" = false, movedNodes?: MixDOMTreeNode[], bInterested?: Set<SourceBoundary> | null, areOrdered: boolean = false): MixDOMChangeInfos | null {

        // Parse.
        let shouldUpdate = !!forceUpdate;
        let forceNested = forceUpdate === "all";
        let renderInfos: MixDOMRenderInfo[] = [];
        let boundaryChanges: MixDOMSourceBoundaryChange[] = [];
        const component = boundary.component;
        const cApi = component.contextAPI;

        // Handle data listeners.
        // .. Note. If the state is modified during the call (as is assumed), it will add old to _preUpdates and will not trigger a new run since .isUpdating is true (as we're in that part of flow).
        if (boundary._preUpdates) {
            // Host data.
            // .. Note that the checks for needing the data refresh call is done prior to adding { host: callbacks[] } to the preUpdates. Here we just call them out by cross matching.
            const hostCalls = boundary._preUpdates.host;
            if (hostCalls && component.hostDataListeners) {
                for (const [callback, needs] of component.hostDataListeners.entries()) // Note that we use .entries() to take a copy of the situation.
                    if (hostCalls.includes(callback))
                        callback(...needs.map((need, i) => this.host.getInData(need)));
            }
            // Contextual data.
            if (cApi && boundary._preUpdates.contextual)
                cApi.askDataBuildBy(boundary._preUpdates.contextual, true);
        }

        // If is a wrapped component and it received props update, we should now rebuild its state very quickly.
        // .. Note. The wrapper components are never contextual. The createWrapper method always creates a basic functional component.
        const shadowAPI = component.constructor.api as ShadowAPI & Partial<WrapperAPI> | undefined;
        if (shadowAPI && shadowAPI.getMixedProps && (boundary.isMounted === false || boundary._preUpdates?.props)) {
            // Make sure build has run once.
            if (!boundary.isMounted) {
                if (shadowAPI.onBuildProps && !shadowAPI.builtProps)
                    shadowAPI.builtProps = shadowAPI.onBuildProps(null);
            }
            // Mark _preUpdates (needed if not on mount run) and do a quick update.
            else
                boundary._preUpdates ? boundary._preUpdates.state = component.state : boundary._preUpdates = { state: component.state };
            // Update state.
            component.state = shadowAPI.getMixedProps(component as any);
        }

        // Prepare mount run.
        if (!boundary.isMounted) {
            // Has been destroyed - shouldn't happen.
            if (boundary.isMounted === null)
                return null;
            // On mount.
            boundaryChanges.push( [boundary, "mounted"] );
            shouldUpdate = true;
            // Just in case.
            if (boundary._preUpdates)
                delete boundary._preUpdates;
        }

        // Prepare update run.
        else {
            
            // Call beforeUpdate.
            // .. Note. Like the contextual portion above, if the state is modified during the call, it will add to _preUpdates and stop.
            // .. This makes it a perfect place to use effects - however they can also be used during the render call (then will call render again).
            if (component.signals.beforeUpdate)
                callListeners(component.signals.beforeUpdate);

            // Clear.
            const _preUpdates = boundary._preUpdates;
            delete boundary._preUpdates;

            // Has already been updated.
            if (!_preUpdates) {
                if (!forceUpdate)
                    return null;
            }
            
            // Prepare.
            const { force, contextual, ..._newUpdates } = _preUpdates || {};
            const prevUpdates: MixDOMComponentUpdates = _newUpdates; // We need this extra only for typing below.
            const newUpdates: MixDOMComponentUpdates = {};
            // Handle props.
            if (prevUpdates.props)
                newUpdates.props = boundary._outerDef.props;
            // State.
            if (prevUpdates.state)
                newUpdates.state = component.state || {};
            // Children.
            if (prevUpdates.children)
                newUpdates.children = boundary.closure.envelope?.targetDef.childDefs || [];
            // Streamed content.
            if (prevUpdates.streamed) {
                newUpdates.streamed = new Map();
                for (const source of prevUpdates.streamed.keys())
                    newUpdates.streamed.set(source, source.constructor.closure?.envelope?.targetDef.childDefs || []);
            }
            // Update flags.
            if (force) {
                shouldUpdate = true;
                if (force === "all")
                    forceNested = true;
            }
            // Check if should update.
            else if (!shouldUpdate) {
                // Run shouldUpdate check for live / easy.
                const preShould: boolean | null = component.signals.shouldUpdate ? askListeners(component.signals.shouldUpdate, [component, newUpdates, prevUpdates], ["first-true", "no-false"]) : null;
                // Run by background system.
                if (preShould === true || preShould == null && HostServices.shouldUpdateBy(boundary, newUpdates, prevUpdates))
                    shouldUpdate = true;
            }
            // Set call mode.
            const wasMoved = boundary._outerDef.action === "moved";
            if (wasMoved)
                boundaryChanges.push([boundary, "moved"]);
            if (shouldUpdate)
                boundaryChanges.push([boundary, "updated", newUpdates, prevUpdates]);
            // Was moved.
            if (wasMoved) {
                // Mark to any contexts that should refresh order.
                if (cApi) {
                    const contexts = cApi.getContexts();
                    for (const name in contexts) {
                        const ctx = contexts[name];
                        if (ctx)
                            ctx.services.onComponentMove(component, name);
                    }
                }
                // For clarity and robustness, we collect the render infos here for move, as we collect the boundary for move here, too.
                // .. However, to support the flow of .applyDefPairs we also support an optional .movedNodes array to prevent doubles.
                for (const node of _Find.rootDOMTreeNodes(boundary.treeNode, true, true)) {
                    if (movedNodes) {
                        if (movedNodes.indexOf(node) !== -1)
                            continue;
                        movedNodes.push(node);
                    }
                    renderInfos.push({ treeNode: node, move: true });
                }
            }
            // Call preUpdate to provide a snapshot of the situation - regardless of whether actually will update or not.
            if (component.signals.preUpdate)
                callListeners(component.signals.preUpdate, [newUpdates, prevUpdates, shouldUpdate]);
        }

        // Run the update routine.
        if (shouldUpdate) {
            const [rInfos, bUpdates] = _Apply.runBoundaryUpdate(boundary, forceNested);
            renderInfos = renderInfos.concat(rInfos);
            boundaryChanges = boundaryChanges.concat(bUpdates);
        }
        // Update contexts down the tree if was not updated and contexts were changed.
        // .. Also add them to / merge them with bInterested, if found any interested.
        else if (boundary._outerContextsWere) {
            // Apply context changes down and collect interested.
            let collected = HostServices.afterOuterContexts(boundary);
            // Remove this boundary, if was added - we're currently handling it.
            // .. Otherwise might trigger an empty update in a special case.
            // .. The case is that a context is swapped off, but the value in local still gives the same value.
            // 
            // <-- Hey. This special case is maybe not relevant anymore?
            // 
            if (collected[0] === boundary)
                collected = collected.slice(1);
            // Loop through locally interested.
            if (collected[0]) {
                // Merge from both (without duplicates) and sort.
                if (bInterested && bInterested.size) {
                    // Add each.
                    areOrdered = false;
                    for (const b of collected)
                        bInterested.add(b);
                }
                // Replace - the order is clean within our contextual collection.
                else
                    bInterested = new Set(collected);
            }
        }

        // Add wrapper updates.
        // .. So this is when this component's .createWrapper method was used and auto-bound to the component for updates.
        // .. Note that we do this after having updated, so we have a fresh state.
        if (component.wrappers) {
            for (const Wrapper of component.wrappers) {
                // Build common props.
                if (Wrapper.api.onBuildProps) {
                    // Build new common props.
                    const propsWere = Wrapper.api.builtProps;
                    Wrapper.api.builtProps = Wrapper.api.onBuildProps(propsWere);
                    // If had callback and it gave back exactly the old props, then we take it to mean, don't go further.
                    if (propsWere === Wrapper.api.builtProps)
                        continue;
                    // 
                    // .. Maybe this is a bit confusing feature..? Because if doesn't have to callback will and should flow thru.
                }
                // Update state for each manually.
                if (Wrapper.api.components.size) {
                    // Prepare.
                    if (!bInterested)
                        bInterested = new Set();
                    areOrdered = false;
                    // Preset and add each.
                    for (const wrapped of Wrapper.api.components) {
                        // Pre mark updates.
                        // .. Note. To avoid rare extra calls to the mixer (when both props and state have changed), we don't use { state: Wrapper.api.getMixedProps(wrapped) } here.
                        // .. Instead we just re-trigger update using (same) props, and then it will be handled above for the instance.
                        HostServices.preSetUpdates(wrapped.boundary, { props: wrapped.props });
                        // Add to interested.
                        bInterested.add(wrapped.boundary);
                    }
                }
            }
        }

        // Update interested boundaries.
        // .. Each is a child boundary of ours (sometimes nested deep inside).
        // .. We have them from 3 sources: 1. interested in our content (parent-chain or streamed), 2. contextual changes cascaded down, 3. wrapped components.
        const isStream = boundary.component.constructor["MIX_DOM_CLASS"] === "Stream";
        if (bInterested && bInterested.size) {
            const uInfos = HostServices.updateInterested(bInterested, !areOrdered);
            renderInfos = renderInfos.concat(uInfos[0]);
            boundaryChanges = boundaryChanges.concat(uInfos[1]);
        }

        // Trigger refresh for stream source - presumably the importance has changed if ever is updated (or was just mounted).
        // .. Note that due to the multi-host and micro-timing complexities, this actually doesn't return render infos but rather performs the refresh.
        // .. The infos are fed to each host synchronously using the host's own feed.
        if (isStream)
            (boundary.component as ComponentStream).refreshSource();

        // Return infos.
        return (renderInfos[0] || boundaryChanges[0]) ? [ renderInfos, boundaryChanges ] : null;

    }


    // - 2. Post process flow - //

    /** This absorbs infos from the updates done. Infos are for update calls and to know what to render. Triggers calling runRender. */
    public absorbChanges(renderInfos: MixDOMRenderInfo[] | null, boundaryChanges?: MixDOMSourceBoundaryChange[] | null, forcePostTimeout?: number | null) {
        // Add rendering to post.
        if (renderInfos)
            this.postRenderInfos.push(renderInfos);
        // Add boundary calls.
        if (boundaryChanges) {
            // Immediately.
            if (this.host.settings.useImmediateCalls)
                HostServices.callBoundaryChanges(boundaryChanges);
            // After rendering.
            else
                this.postBoundaryCalls.push(boundaryChanges);
        }
        // Refresh.
        this.refreshWithTimeout("render", forcePostTimeout);
    }

    private runRender() {
        // Clear timer ref.
        this.renderTimer = null;
        // Render infos.
        for (const renderInfos of this.postRenderInfos)
            if (renderInfos[0])
                this.renderer.applyToDOM(renderInfos);
        this.postRenderInfos = [];
        // Boundary changes.
        for (const boundaryChanges of this.postBoundaryCalls)
            if (boundaryChanges[0])
                HostServices.callBoundaryChanges(boundaryChanges);
        this.postBoundaryCalls = [];
        // Call listeners.
        if (this.host.signals.onRender)
            callListeners(this.host.signals.onRender);
    }


    // - Helpers - //

    private refreshWithTimeout(side: "update" | "render", forceTimeout?: number | null) {
        if (side === "update")
            this.updateTimer = _Lib.refreshWithTimeout(this, this.runUpdates, this.updateTimer, this.host.settings.updateTimeout, forceTimeout);
        else
            this.renderTimer = _Lib.refreshWithTimeout(this, this.runRender, this.renderTimer, this.host.settings.renderTimeout, forceTimeout);
    }


    // - Static - //

    /** Whenever a change happens, we want the states to be immediately updated (for clearer and more flexible behaviour).
     * To do this, we need to set them immediately and at the same time collect old info (unless had old collected already). */
    public static preSetUpdates(boundary: SourceBoundary, updates: MixDOMComponentPreUpdates): void {

        // Prepare.
        const component = boundary.component;
        let preUpdates = boundary._preUpdates;
        if (!preUpdates)
            boundary._preUpdates = (preUpdates = {});

        // Update new values and preUpdates.
        // .. Props.
        if (updates.props) {
            if (!preUpdates.props)
                preUpdates.props = boundary._outerDef.props || {};
            boundary._outerDef.props = updates.props;
            // We set a readonly value here (props) - it's on purpose: we want it to be readonly for all others except in this method.
            (component as { props: MixDOMComponentPreUpdates["props"]; }).props = updates.props;
        }
        // .. State.
        if (updates.state) {
            if (!preUpdates.state)
                preUpdates.state = component.state;
            component.state = updates.state;
        }
        // .. Children. This is actually set externally due to timing, but we provide it here anyway.
        if (updates.children && boundary.closure) {
            if (!preUpdates.children)
                preUpdates.children = boundary.closure.envelope?.targetDef.childDefs || [];
                //
                // <-- I think we should not slice here - for should update comparison purposes.
        }
        // .. Streamed content. This is actually set externally due to timing, but we provide it here anyway.
        if (updates.streamed) {
            if (!preUpdates.streamed)
                preUpdates.streamed = new Map();
            for (const source of updates.streamed.keys())
                preUpdates.streamed.set(source, source.constructor.closure?.envelope?.targetDef.childDefs || []);
                //
                // <-- I think we should not slice here - for should update comparison purposes.
        }
        // .. Context data.
        if (updates.contextual)
            preUpdates.contextual = preUpdates.contextual ? [...new Set<string>([...updates.contextual, ...preUpdates.contextual])] : [ ...updates.contextual ];
        // .. Host data.
        if (updates.host)
            preUpdates.host = preUpdates.host ? [...new Set<SignalListenerFunc>([...updates.host, ...preUpdates.host])] : [ ...updates.host ];
        // .. Force update mode.
        if (updates.force)
            preUpdates.force = ((updates.force === "all") || (preUpdates.force === "all")) ? "all" : true;
    }

    public static updateInterested(bInterested: Set<SourceBoundary>, sortBefore: boolean = true): MixDOMChangeInfos {
        // Prepare return.
        let renderInfos: MixDOMRenderInfo[] = [];
        let boundaryChanges: MixDOMSourceBoundaryChange[] = [];
        // Sort, if needs and has at least two entries.
        if (sortBefore && bInterested.size > 1)
            _Apply.sortBoundaries(bInterested);
        // Update each - if still needs to be updated (when the call comes).
        for (const thruBoundary of bInterested) {
            // Was already updated.
            if (!thruBoundary._preUpdates)
                continue;
            // Update and collect.
            const uInfos = thruBoundary.host.services.updateBoundary(thruBoundary);
            if (uInfos) {
                renderInfos = renderInfos.concat(uInfos[0]);
                boundaryChanges = boundaryChanges.concat(uInfos[1]);
            }
        }
        // Return infos.
        return [ renderInfos, boundaryChanges ];
    }


    // - Update contextually - //

    /** This only runs (and should only be called) if the boundary didn't update, but its contexts were changed.
     * - In that case, it will go down the tree and update the cascading context ties as well as collect interested ones until no need to go further.
     * - Note that this will not collect interested boundaries within nested hosts, but instead collects the hosts if settings allow.
     * - Note that this can also include the given sourceBoundary to the collection (if its component has a context api and is interested). */
    public static afterOuterContexts(sourceBoundary: SourceBoundary): SourceBoundary[] {

        // Prepare.
        const collected: SourceBoundary[] = [];
        if (!sourceBoundary._outerContextsWere)
            return collected;

        // Collect all changed names.
        const origOldContexts: Record<string, Context | null> = {};
        const newContexts = sourceBoundary.outerContexts;
        for (const name in sourceBoundary.outerContexts) {
            const oldContext = sourceBoundary._outerContextsWere[name];
            if (sourceBoundary.outerContexts[name] !== oldContext)
                origOldContexts[name] = oldContext; // Might be undefined, but it's just what we want.
        }
        for (const name in sourceBoundary._outerContextsWere) {
            if (sourceBoundary.outerContexts[name] === undefined)
                origOldContexts[name] = sourceBoundary._outerContextsWere[name];
        }
        // Set the outerContexts back temporarily, so won't stop the flow before it starts.
        sourceBoundary.outerContexts = sourceBoundary._outerContextsWere;
        delete sourceBoundary._outerContextsWere;

        // Loop down the tree until the branches die (out of nothing to update).
        // .. We will go down with oldContexts that gradually narrows down if a sub context replaces it.
        type LoopPair = [MixDOMTreeNode, typeof origOldContexts];
        let infos: LoopPair[] = [ [ sourceBoundary.treeNode, origOldContexts ] ];
        let info: LoopPair | undefined;
        let i = 0;
        while (info = infos[i]) {
            // Next.
            i++;
            // Parse.
            const treeNode = info[0];
            const oldContexts = info[1];
            // Host.
            // .. If allowed to pass contexts from host to host,
            // .. Set the boundary to the host's root boundary, so we can do the update routine.
            // .. Instead of checking interests, will collect to hosts instead.
            if (treeNode.type === "host") {
                // Collect new outer contexts, while checking if there's any diffs.
                const host = treeNode.def.host;
                if (host && host.settings.welcomeContextsUpRoot) {
                    const boundary = host.rootBoundary;
                    const hostContext = { ...boundary.outerContexts };
                    let hadDiffs = false;
                    for (const name in oldContexts) {
                        if (boundary.outerContexts[name] === oldContexts[name]) {
                            hadDiffs = true;
                            const newCtx = newContexts[name];
                            newCtx ? hostContext[name] = newCtx : delete hostContext[name];
                        }
                    }
                    if (hadDiffs)
                        host.services.onContextPass(hostContext);
                }
            }
            // Has a boundary.
            else if (treeNode.boundary) {
                // Check if finds a match to the old that needs to be updated.
                const boundary = treeNode.boundary;
                const cApi = boundary.component?.contextAPI;
                const myOldContexts: typeof oldContexts = {};
                let didChange: MixDOMContextRefresh = 0;
                let changedNames: string[] | null = null;
                // Loop old contexts.
                for (const name in oldContexts) {
                    // Refers to the old - so, needs a refresh.
                    // .. Note that in the case was added (= oldContexts[name] === undefined),
                    // .. Then the check still works: will only work on it, if it was removed before.
                    if (boundary.outerContexts[name] === oldContexts[name]) {
                        // Update.
                        const newCtx = newContexts[name];
                        const oldCtx = myOldContexts[name];
                        newCtx ? boundary.outerContexts[name] = newCtx : delete boundary.outerContexts[name];
                        myOldContexts[name] = oldCtx;
                        didChange |= MixDOMContextRefresh.Otherwise;
                        if (!changedNames)
                            changedNames = [];
                        changedNames.push(name);
                        // Add to interests boundaries, if was interested.
                        if (cApi) {
                            // Check if is overriden on a more important level - if so, nothing to do.
                            if (newCtx !== cApi.getContext(name as never))
                                continue;
                            // Remove / Add.
                            didChange |= _Apply.helpUpdateContext(cApi, name, newCtx, oldCtx);
                            // Is interested in the context, and as it was changed, we must trigger callings its data callbacks.
                            if (!collected.includes(boundary as SourceBoundary) && [...cApi.dataListeners.values()].some(([needs]) => needs.some(need => need === name || need.startsWith(name + "."))))
                                collected.push(boundary as SourceBoundary);
                        }
                    }
                    // Otherwise drop out by not including into myOldContexts.
                }
                // Remove pending flag, if had.
                delete boundary._outerContextsWere;
                // No diffs, can stop on this branch.
                if (!didChange || !changedNames)
                    continue;
                // Add contextual changes.
                if (boundary.component && HostServices.shouldUpdateContextually(didChange)) {
                    if (!boundary._preUpdates)
                        boundary._preUpdates = {};
                    boundary._preUpdates.contextual = changedNames;
                }
                // Add kids.
                if (treeNode.children[0]) {
                    infos = treeNode.children.map(t => [ t, myOldContexts ] as LoopPair).concat(infos.slice(i));
                    i = 0;
                }
            }
            // Otherwise, just add kids.
            else if (treeNode.children[0]) {
                // Found contexts: remove from the flow, if matches our oldContext name, as it then replaces us down the flow.
                const ctxs = treeNode.type === "contexts" ? treeNode.def.contexts : null;
                let addKidsContexts: typeof oldContexts | null = oldContexts;
                if (ctxs) {
                    // Collect matches.
                    const found: string[] = [];
                    for (const name in oldContexts) {
                        // Found - remove the name from going further as it has been replaced.
                        if (ctxs[name] !== undefined)
                            found.push(name);
                    }
                    // Did find.
                    if (found[0]) {
                        // Copy oldContexts and set it to be set for kids.
                        addKidsContexts = { ...oldContexts };
                        // Remove found names from it.
                        for (const name of found)
                            delete addKidsContexts[name];
                        // Has no more names to go on with.
                        if (Object.keys(addKidsContexts)[0] === undefined)
                            addKidsContexts = null;
                    }
                }
                // Add kids.
                if (addKidsContexts) {
                    infos = treeNode.children.map(t => [ t, addKidsContexts ] as LoopPair).concat(infos.slice(i));
                    i = 0;
                }
            }
        }

        // Return the interested in tree order.
        return collected;
    }

    public static shouldUpdateContextually(didChange: MixDOMContextRefresh): boolean {
        return (didChange & (MixDOMContextRefresh.DoRefresh | MixDOMContextRefresh.Data)) !== 0;
        // return (didChange & MixDOMContextRefresh.NoRefresh) === 0 && (didChange & (MixDOMContextRefresh.DoRefresh | MixDOMContextRefresh.Data)) !== 0;
    }

    public static shouldUpdateBy(boundary: SourceBoundary, newUpdates: MixDOMComponentUpdates, preUpdates: MixDOMComponentUpdates | null): boolean {
        // Prepare.
        const settings = boundary.host.settings;
        const component = boundary.component;
        const modes: Partial<MixDOMUpdateCompareModesBy> = component.updateModes || {};
        // Get modes from ShadowAPI.
        if (component.constructor.api) {
            const dUpdateModes = component.constructor.api.updateModes;
            if (dUpdateModes) {
                for (const type in dUpdateModes)
                    if (modes[type] === undefined)
                        modes[type] = dUpdateModes[type];
            }
        }
        // If anything tells us to update, we do the update: so can return true from within, but not false.
        let didCheck = false;
        if (preUpdates) {
            for (const type in preUpdates) {
                // Prepare.
                didCheck = true;
                const mode: MixDOMUpdateCompareMode | number = modes[type] ?? settings.updateComponentModes[type];
                const nMode = typeof mode === "number" ? mode : MixDOMCompareDepthByMode[mode] as number ?? 0;
                // Always or never.
                if (nMode < -1) {
                    if (nMode === -2)
                        return true;
                    continue;
                }
                // Changed.
                if (nMode === 0) {
                    if (preUpdates[type] !== newUpdates[type])
                        return true;
                }
                // Otherwise use the library method.
                else if (!_Lib.areEqual(preUpdates[type], newUpdates[type], nMode))
                    return true;
            }
        }
        // If didn't even check.
        if (!didCheck)
            return settings.shouldUpdateWithNothing;
        // No reason to update.
        return false;
    }


    // - Private static - //

    private static callBoundaryChanges(boundaryChanges: MixDOMSourceBoundaryChange[]) {
        // Loop each.
        for (const info of boundaryChanges) {
            // Parse.
            const [ boundary, change, myUpdates, myPrevUpdates ] = info;
            const component = boundary.component;
            const signalName: "didUpdate" | "didMount" | "didMove" = change === "mounted" ? "didMount" : change === "moved" ? "didMove" : "didUpdate";
            // Call the component. Pre-check here some common cases to not need to call.
            if (component.signals[signalName])
                callListeners(component.signals[signalName], change === "updated" ? [myUpdates || {}, myPrevUpdates || {}] : undefined);
        }
    }
    
}
