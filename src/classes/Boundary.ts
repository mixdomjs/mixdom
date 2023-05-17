

// - Imports - //

import {
    MixDOMTreeNode,
    MixDOMDefApplied,
    MixDOMDefTarget,
    MixDOMComponentPreUpdates,
    MixDOMRenderOutput,
    MixDOMSourceBoundaryId,
} from "../static/_Types";
import { SignalManFlags, callListeners } from "./SignalMan";
import { _Defs } from "../static/_Defs";
import { _Apply } from "../static/_Apply";
import { ContentClosure } from "./ContentClosure";
import { Component, ComponentWith, ComponentFunc, ComponentType } from "./Component";
import { ComponentStream, ComponentStreamType } from "./ComponentStream";
import { ComponentShadow, ShadowAPI } from "./ComponentShadow";
import { ContextAPI, ContextAPIWith } from "./ContextAPI";
import { Context } from "./Context";
import { Host } from "./Host";


// - Boundary - //

class BaseBoundary {


    // - Defs - //

    /** The def that defined this boundary to be included. This also means it contains our last applied props. */
    _outerDef: MixDOMDefApplied;
    /** The _innerDef is the root def for what the boundary renders inside - or passes inside for content boundaries.
     * - Note that the _innerDef is only null when the boundary renders null. For content boundaries it's never (they'll be destroyed instead). */
    _innerDef: MixDOMDefApplied | null;


    // - host, treeNode and mounted - //

    /** The reference for containing host for many technical things as well as general settings. */
    host: Host;
    /** Whether the boundary is mounted. This is set to true right before onMount is called and false after willUnmount. */
    isMounted: boolean | null;
    /** The fixed treeNode of the boundary is a very important concept and reference for technical reasons.
     * - It allows to keep the separate portions of the GroundedTree structure together by tying parent and child boundary to each other.
     *   .. So, ultimately it allows us to keep a clear bookkeeping of the dom tree and makes it easy, flexible and performant to apply changes to it.
     * - The node is given by the host boundary (or host for root) and the reference always stays the same (even when mangling stuff around).
     *   1. The first host is the host instance: it creates the root treeNode and its first child, and passes the child for the first boundary.
     *   2. The boundary then simply adds add kids to this treeNode.
     *   3. If the boundary has a sub-boundary in it, it similarly gives it a treeNode to work with.
     *   4. When the boundary re-renders, it will reuse the applied defs and if did for any sub-boundary,
     *      will then reuse the same treeNode and just modify its parent accordingly. So the sub-boundary doesn't even need to know about it.
     */
    treeNode: MixDOMTreeNode;


    // - Boundary refs - //

    /** The sourceBoundary refers to the original SourceBoundary who defined us.
     * - Due to content passing, it's not necessarily our .parentBoundary, who is the one who grounded us to the tree.
     * - For the rootBoundary of a host, there's no .sourceBoundary, but for all nested, there always is.
     * - Note that for source boundarries, the sourceBoundary should never change from what was given in the constructor.
     *   .. It's passed to the source boundary's content closure, and from there further on. Swapping it on the boundary is not supported (see ComponentStream for swapping it on the closure). */
    sourceBoundary: SourceBoundary | null;
    /** The parentBoundary ref is very useful for going quickly up the boundary tree - the opposite of .innerBoundaries. */
    parentBoundary: SourceBoundary | ContentBoundary | null;
    /** Any source or content boundaries inside that we have directly grounded in tree order - updated during every update run (don't use during). */
    innerBoundaries: (SourceBoundary | ContentBoundary)[];

    /** The component instance tied to this boundary - necessarily extends Component. */
    component?: Component;


    // - Contextual - //

    /** These are contexts inherited from the parent. */
    outerContexts: Record<string, Context | null>;
    _outerContextsWere?: Record<string, Context | null>;


    constructor(host: Host, outerDef: MixDOMDefApplied, treeNode: MixDOMTreeNode) {
        // Init.
        this.host = host;
        this.treeNode = treeNode;
        this._outerDef = outerDef;
        this._innerDef = null;
        this.isMounted = false;
        this.sourceBoundary = null;
        this.parentBoundary = null;
        this.innerBoundaries = [];
        this.outerContexts = {};
    }
}

export class ContentBoundary extends BaseBoundary {


    // - Additions - //

    /** The def whose children define our content - we are a fragment-like container. */
    targetDef: MixDOMDefTarget;

    // - Redefinitions - //

    /** Redefine that we always have it. It's based on the targetDef. */
    _innerDef: MixDOMDefApplied;
    /** Redefine that we always have a host for content boundaries - for us, it's the original source of our rendering.
     * Note that the content might get passed through many boundaries, but now we have landed it. */
    sourceBoundary: SourceBoundary;
    /** Redefine that we always have a boundary that grounded us to the tree - we are alive because of it.
     * - Note that it gets assigned (externally) immediately after constructor is called.
     * - The parentBoundary ref is very useful for going quickly up the boundary tree - the opposite of .innerBoundaries. */
    parentBoundary: SourceBoundary | ContentBoundary;


    // - For TypeScript - //

    /** Content boundaries will never feature component. So can be used for checks to know if is a source or content boundary. */
    component?: never;
    /** Content boundaries will never feature boundaryId. So can be used for checks to know if is a source or content boundary. */
    boundaryId?: never;


    // This is the moment we open up our personal copy of the envelop. It has been just opened and reclosed with treeNode appropriate for us.
    // .. Note. We use the basis of BaseBoundary, so we can use the same _Apply methods for SourceBoundary and ContentBoundary.
    //
    constructor(outerDef: MixDOMDefApplied, targetDef: MixDOMDefTarget, treeNode: MixDOMTreeNode, sourceBoundary: SourceBoundary) {
        // Base boundary.
        super(sourceBoundary.host, outerDef, treeNode);
        // Assign.
        this.sourceBoundary = sourceBoundary;
        this.targetDef = targetDef;
        this._innerDef = _Defs.newAppliedDefBy(targetDef, sourceBoundary.closure);
    }

    updateEnvelope(targetDef: MixDOMDefTarget, truePassDef?: MixDOMDefApplied | null) {
        this.targetDef = targetDef;
        if (truePassDef)
            this._innerDef.childDefs = truePassDef.childDefs;
    }

}

/** This is what "contains" a component.
 * .. It's the common interface for technical as well as advanced API interfacing. */
export class SourceBoundary extends BaseBoundary {


    // - Private-like temporary states - //

    /** If true means that has not ever rendered yet.
     * .. Needed for LiveFunctions to know if should call context data call right after the first render.
     * .. Because with the wrapper render function, it's the first render call where things are initialized. */
    _notRendered?: true;
    /** Temporary rendering state indicator. */
    _renderState?: "active" | "re-updated";
    /** Temporary collection of preUpdates - as the update data are always executed immediately. */
    _preUpdates?: MixDOMComponentPreUpdates;
    /** Temporary marker to account for cutting cyclical updates automatically. Only used for Streams (could be used more generally).
     * - Cyclical updates normally never happen. However, they can happen when updating components up the flow. In practice, these cases are extremely rare but can happen.
     *      * As an example, inserting a stream (using withContent) in a common parent for insertion and source - though all in between must be spread funcs or have {props: "always"} update mode.
     * - When starts updating a child boundary (in _Apply.applyDefPairs), it's marked with 1 and after finishing deletes the marker.
     *      * If a cyclical update happens it's detected a couple of lines above by a boundary having _nUpdates already. Optionally can limit the count, defaults to 0 cyclical updates in host.settings.
     * - Note that what this actually means (eg. for a stream), is that the content will be updated, but the components interested in its content will not be triggered for updates (-> won't re-render).
     *      * For example when a common parent uses withContent, the parent won't re-render. But as normally, the contents are updated smoothly without intermediary ones re-rendering.
     */
    _nUpdates?: number;
    /** Temporary flag used to auto-initialize the LiveContext for a component. */
    _initContextAPI?: true;


    // - host related - //

    /** Our host based quick id. It's mainly used for sorting, and sometimes to detect whether is content or source boundary, helps in debugging too. */
    boundaryId: MixDOMSourceBoundaryId;


    // - Type and main features - //

    /** Shortcut for the component. Only one can be set (and typically one is). */
    component: Component;

    // - Boundary, closure & children - //

    /** The content closure tied to this boundary.
     * - It it's the channel through which our parent passes content to us - regardless of the update flow.
     * - When tied to a boundary, the content closure has a reference to it as .thruBoundary. (It can also be used without .thruBoundary, see ComponentStream.) */
    closure: ContentClosure;


    // - Init & destroy - //

    constructor(host: Host, outerDef: MixDOMDefApplied, treeNode: MixDOMTreeNode, sourceBoundary?: SourceBoundary) {
        // Init.
        super(host, outerDef, treeNode);
        this._notRendered = true;
        this.boundaryId = host.services.createBoundaryId();
        this.sourceBoundary = sourceBoundary || null;
        this.closure = new ContentClosure(this, sourceBoundary);
        // this.localNeeds = null;
    }

    /** Should actually only be called once. Initializes a Component class and assigns renderer and so on. */
    reattach(): void {
        // Nullify for a moment. It will be set back below in all cases.
        this.component = null as unknown as ComponentShadow;
        const props = this._outerDef.props || {};
        // Setup the rendering.
        let tag = this._outerDef.tag;
        if (typeof tag === "function") {
            // Prepare.
            const shadowAPI = tag["api"] as ShadowAPI | undefined;
            const renderFunc = tag["MIX_DOM_CLASS"] ? null : this._outerDef.tag as ComponentFunc;
            const withContextAPI = renderFunc && renderFunc.length >= 3 || false;
            if (withContextAPI)
                this._initContextAPI = true;
            // Create component.
            const component = this.component = new (renderFunc ? shadowAPI ? { [renderFunc.name]: class extends Component {}}[renderFunc.name] : Component : tag as ComponentType)(props, this) as Component;
            this.component = component;
            // We must assign contextAPI right after constructing the class if wasn't done during it already (2 lines above).
            if (this._initContextAPI) {
                if (!component.contextAPI)
                    component.contextAPI = new ContextAPI(component) as ContextAPIWith;
                delete this._initContextAPI;
            }
            // Assign renderFunc.
            if (renderFunc)
                // For the first time, let's wrap the original function - presumably only called once, then gets reassigned.
                component.render = (freshProps) => renderFunc.apply(component, withContextAPI ? [freshProps, component, component.contextAPI] : [ freshProps, component ]);

            // Note. In class form, in case uses closure in the constructor, should pass the 2nd arg as well: super(props, boundary).
            // .. This way, it's all handled and ready, and there's no need to add special checks or do some initial "flushing".
            // .. But we provide it here if didn't pass them.
            if (!component.boundary)
                // We set a readonly value here - it's on purpose: it's only set if wasn't set in the constructor (by not being passed to super).
                (component as { boundary: SourceBoundary }).boundary = this;
            
            // Handle ShadowAPI.
            if (shadowAPI) {
                // Make sure is assigned for functional components. If was a class then assumes it was unique class already.
                component.constructor.api = shadowAPI;
                // Add to collection.
                shadowAPI.components.add(component);
                // Add listeners.
                for (const name in shadowAPI.signals) {
                    for (const listener of shadowAPI.signals[name]) {
                        const [callback, extraArgs, flags ] = listener as [callback: (...args: any[]) => any, extraArgs: any[] | null, flags: SignalManFlags ];
                        component.listenTo(name as any, (...args: any[]) => extraArgs ? callback(component, ...args, ...extraArgs) : callback(component, ...args), null, flags, callback);
                    }
                }
            }
            // Handle Stream.
            if (tag["MIX_DOM_CLASS"] === "Stream") {
                // Get stream and assign the stream source to the closure for passing refreshes further.
                this.closure.stream = component as ComponentStream;
                // Add source - they are always available after being born (until dying).
                (tag as ComponentStreamType).addSource(component as ComponentStream);
            }
            // Add and call preMount.
            if (component.signals.preMount)
                callListeners(component.signals.preMount);
        }
        // Fallback to empty Component - shouldn't happen.
        else
            this.component = new Component(props, this);
    }


    // - Update & render - //

    update(forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null) {
        this.host.services.absorbUpdates(this, { force: !this.isMounted ? "all" : forceUpdate || false }, true, forceUpdateTimeout, forceRenderTimeout);
    }

    updateBy(updates: MixDOMComponentPreUpdates, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null) {
        this.host.services.absorbUpdates(this, { ...updates, force: !this.isMounted ? "all" : forceUpdate || false }, true, forceUpdateTimeout, forceRenderTimeout);
    }

    render(iRecursion: number = 0): MixDOMRenderOutput {
        // Rendering state.
        if (!iRecursion)
            this._renderState = "active";
        // Remove temporary children needs marker.
        const cntApi = this.component.contentAPI;
        // .. Parental passing.
        if (cntApi.localNeeds === "temp")
            cntApi.needs(null);
        // .. Streams.
        if (cntApi.streamNeeds)
            for (const [ Stream, needs ] of cntApi.streamNeeds)
                if (needs === "temp")
                    cntApi.needsFor(Stream as (ComponentStreamType), null);
        // Render.
        const props = this._outerDef.props || {};
        const component = this.component as ComponentWith; // For easier typing, let's assume context, too.
        const content = component.render(props, component.state);
        // Remove first time marker.
        const firstTime = this._notRendered;
        if (firstTime)
            delete this._notRendered;
        // Reassign new render function and render again.
        if (typeof content === "function") {
            // Reassign.
            component.render = content;
            // Special case. Let's call the data listeners (attached by listenToData) for the first time.
            if (component.contextAPI && firstTime && component.contextAPI.dataListeners.size)
                component.contextAPI.askDataBuildBy(true, true); // For all (true), and immediately (true).
            // Re-render.
            return this.render(iRecursion);
        }
        // Run again and return the new ones instead.
        if (this._renderState === "re-updated") {
            const settings = this.host.settings;
            if (settings.maxReRenders < 0 || iRecursion < settings.maxReRenders) {
                iRecursion++;
                this._renderState = "active";
                return this.render(iRecursion);
            }
            // - DEVLOG - //
            else {
                if (settings.devLogWarnings) {
                    console.warn("__SourceBoundary.render: Warning: The component tried to render for over " + ((iRecursion + 1).toString()) + " times.",
                        (this._outerDef.tag as ComponentType).MIX_DOM_CLASS ? component.constructor : this._outerDef.tag,
                        component
                    );
                }
            }
        }
        // Finish up.
        delete this._renderState;
        // Return content.
        return content;
    }
}
