

// - Imports - //

import {
    MixDOMTreeNode,
    MixDOMDefApplied,
    MixDOMDefTarget,
    MixDOMComponentPreUpdates,
    MixDOMRenderOutput,
    MixDOMSourceBoundaryId,
    MixDOMDefBoundary,
} from "../static/_Types";
import { SignalListener, SignalManFlags, callListeners } from "./SignalMan";
import { _Defs } from "../static/_Defs";
import { _Apply } from "../static/_Apply";
import { ContentClosure } from "./ContentClosure";
import { Component, ComponentFunc, ComponentType } from "./Component";
import { ComponentStream, ComponentStreamType } from "./ComponentStream";
import { ComponentShadow, ComponentShadowAPI } from "./ComponentShadow";
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
    /** Whether the boundary is mounted. Starts as false, set to true right before didMount is called and null after willUnmount. */
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
    /** Content boundaries will never feature bId. So can be used for checks to know if is a source or content boundary. */
    bId?: never;


    // This is the moment we open up our personal copy of the envelop. It has been just opened and reclosed with treeNode appropriate for us.
    // .. Note. We use the basis of BaseBoundary, so we can use the same _Apply methods for SourceBoundary and ContentBoundary.
    //
    constructor(outerDef: MixDOMDefApplied, targetDef: MixDOMDefTarget, treeNode: MixDOMTreeNode, sourceBoundary: SourceBoundary) {
        // Base boundary.
        super(sourceBoundary.host, outerDef, treeNode);
        // Assign.
        this.sourceBoundary = sourceBoundary;
        this.targetDef = targetDef;
        this._innerDef = _Defs.newAppliedDef(targetDef, sourceBoundary.closure);
    }

    /** Apply a targetDef from the new envelope. Simply sets the defs accordingly. */
    updateEnvelope(targetDef: MixDOMDefTarget, truePassDef?: MixDOMDefApplied | null): void {
        this.targetDef = targetDef;
        if (truePassDef)
            this._innerDef.childDefs = truePassDef.childDefs;
    }

}

/** This is what "contains" a component.
 * .. It's the common interface for technical as well as advanced API interfacing. */
export class SourceBoundary extends BaseBoundary {


    // - Redefine - //

    /** Redefine that the outer def is about a boundary. */
    _outerDef: MixDOMDefApplied & MixDOMDefBoundary;


    // - Private-like temporary states - //

    /** Temporary rendering state indicator. */
    _renderState?: "active" | "re-updated";
    /** Temporary collection of preUpdates - as the update data are always executed immediately. */
    _preUpdates?: MixDOMComponentPreUpdates;


    // - Host related - //

    /** Our host based quick id. It's mainly used for sorting, and sometimes to detect whether is content or source boundary, helps in debugging too. */
    bId: MixDOMSourceBoundaryId;


    // - Type and main features - //

    /** Shortcut for the component. Only one can be set (and typically one is). */
    component: Component;

    // - Boundary, closure & children - //

    /** The content closure tied to this boundary.
     * - It it's the channel through which our parent passes content to us - regardless of the update flow.
     * - When tied to a boundary, the content closure has a reference to it as .thruBoundary. (It can also be used without .thruBoundary, see ComponentStream.) */
    closure: ContentClosure;


    // - Init & destroy - //

    constructor(host: Host, outerDef: MixDOMDefApplied & MixDOMDefBoundary, treeNode: MixDOMTreeNode, sourceBoundary?: SourceBoundary) {
        // Init.
        super(host, outerDef, treeNode);
        this.bId = host.services.createBoundaryId();
        this.sourceBoundary = sourceBoundary || null;
        this.closure = new ContentClosure(this, sourceBoundary);
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
            const shadowAPI = tag["api"] as ComponentShadowAPI | undefined;
            const renderFunc = tag["MIX_DOM_CLASS"] ? null : this._outerDef.tag as ComponentFunc;
            const withContextAPI = renderFunc && renderFunc.length >= 3 || false;
            
            // Create component.
            const component = this.component = new (renderFunc ? shadowAPI ? { [renderFunc.name]: class extends Component {}}[renderFunc.name] : Component : tag as ComponentType)(props, this) as Component;
            this.component = component;
            if (withContextAPI)
                component.initContextAPI();
            
            // Assign renderFunc.
            if (renderFunc)
                // For the first time, let's wrap the original function - presumably only called once, then gets reassigned.
                component.render = withContextAPI ? (freshProps) => renderFunc.call(component, freshProps, component, component.contextAPI) : (freshProps) => renderFunc.call(component, freshProps, component);

            // Note. In class form, in case uses closure in the constructor, should pass the 2nd arg as well: super(props, boundary).
            // .. This way, it's all handled and ready, and there's no need to add special checks or do some initial "flushing".
            // .. But we provide it here if didn't pass them.
            if (!component.boundary)
                // We set a readonly value here - it's on purpose: it's only set if wasn't set in the constructor (by not being passed to super).
                (component as { boundary: SourceBoundary }).boundary = this;
            
            // Handle ComponentShadowAPI.
            if (shadowAPI) {
                // Make sure is assigned for functional components. If was a class then assumes it was unique class already.
                component.constructor.api = shadowAPI;
                // Add to collection.
                shadowAPI.components.add(component);
                // Add listeners.
                for (const name in shadowAPI.signals) {
                    for (const listener of shadowAPI.signals[name]) {
                        const [callback, extraArgs, flags ] = listener as [callback: (...args: any[]) => any, extraArgs: any[] | null, flags: SignalManFlags, groupId: any | null, origListeners?: SignalListener[] ];
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
        const firstTime = this.isMounted === false && !this._renderState;
        if (!iRecursion)
            this._renderState = "active";
        // Render.
        const component = this.component;
        const content = component.render(this._outerDef.props || {}, component.state);
        const reassign = typeof content === "function";
        // Reassign.
        if (reassign)
            component.render = content;
        // If on the mount run, call the data listeners.
        // .. We do this even in class form, due to the mixing capabilities there might be functional components mixed in, too.
        // .. So will anyway receive the initial call right after the initial render - double renderer or not.
        if (firstTime && component.contextAPI)
            component.contextAPI.callDataBy();
        // Re-render - don't add iRecursion, we got a new render function.
        if (reassign)
            return this.render(iRecursion);
        // Wanted to update during render. Run again and return the new render defs instead.
        if (this._renderState === "re-updated") {
            // Render with iRecursion counting.
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
