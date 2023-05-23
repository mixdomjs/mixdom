

// - Imports - //

import {
    Dictionary,
    RecordableType,
    NodeJSTimeout,
    MixDOMDoubleRenderer,
    MixDOMRenderOutput,
    MixDOMUpdateCompareModesBy,
    MixDOMTreeNodeType,
    MixDOMTreeNode,
    MixDOMComponentPreUpdates,
    MixDOMUpdateCompareMode,
    ClassType,
    ClassMixer,
    MixDOMPreComponentOnlyProps,
} from "../static/_Types";
import { _Lib } from "../static/_Lib";
import { _Defs } from "../static/_Defs";
import { _Find } from "../static/_Find";
import { SignalMan, _SignalManMixin } from "./SignalMan";
import { SpreadFunc } from "./ComponentSpread";
import { SourceBoundary } from "./Boundary";
import { ComponentShadowAPI } from "./ComponentShadow";
import { createWired, ComponentWiredFunc, ComponentWiredType } from "./ComponentWired";
import { Host } from "./Host";
import { ContextAPI, MixDOMContextsAll, MixDOMContextsAllOrNull } from "./ContextAPI";
import { Context } from "./Context";


// - Component signals - //

export type ComponentSignals<Info extends Partial<ComponentInfo> = {}> = {
    /** Special call - called right after constructing. */
    preMount: () => void;
    /** Callback that is fired after the initial rendering has been done and elements are in the dom. After any further updates onUpdate (and onPreUpdate and onShouldUpdate) are called. */
    didMount: () => void;
    /** This is a callback that will always be called when the component is checked for updates.
     * - Note that this is not called on mount, but will be called everytime on update when it's time to check whether should update or not - regardless of whether will actually update.
     * - This is the perfect place to use Effects to, as you can modify the state immediately and the mods will be included in the current update run. Access the new values in component.props and component.state.
     *   .. Note that you can also use effects on the render scope. The only difference is that the render method will be called again immediately after (but likewise included in the same update run). */
    beforeUpdate: () => void;
    /** Callback to determine whether should update or not.
     * - If returns true, component will update. If false, will not.
     * - If returns null (or no onShouldUpdate method assigned), will use the rendering settings to determine.
     * - Note that this is not called every time necessarily (never on mount, and not if was forced).
     * - Note that this is called right before onPreUpdate and the actual update (if that happens).
     * - Note that by this time all the data has been updated already. So use preUpdates to get what it was before.
     * - Note that due to handling return value, emitting this particular signal is handled a bit differently. If any says true, will update, otherwise will not. */
    shouldUpdate: (
        newUpdates: MixDOMComponentPreUpdates<Info["props"] & {}, Info["state"] & {}>,
        preUpdates: MixDOMComponentPreUpdates<Info["props"] & {}, Info["state"] & {}>,
    ) => boolean | null;
    /** This is a callback that will always be called when the component is checked for updates. Useful to get a snapshot of the situation.
     * - Note that this is not called on mount, but will be called everytime on update, even if will not actually update (use the 3rd param).
     * - Note that this will be called right after onShouldUpdate (if that is called) and right before the update happens.
     * - Note that by this time all the data has been updated already. So use preUpdates to get what it was before. */
    preUpdate: (
        newUpdates: MixDOMComponentPreUpdates<Info["props"] & {}, Info["state"] & {}>,
        preUpdates: MixDOMComponentPreUpdates<Info["props"] & {}, Info["state"] & {}>,
        willUpdate: boolean
    ) => void;
    /** Called after the component has updated and changes been rendered into the dom. */
    didUpdate: (
        newUpdates: MixDOMComponentPreUpdates<Info["props"] & {}, Info["state"] & {}>,
        preUpdates: MixDOMComponentPreUpdates<Info["props"] & {}, Info["state"] & {}>,
    ) => void;
    /** Called when the component has moved in the tree structure. */
    didMove: () => void;
    /** Called when the component is about to be ungrounded: removed from the tree and dom elements destroyed. */
    willUnmount: () => void;
};

export type ComponentExternalSignalsFor<Comp extends Component = Component, CompSignals extends Dictionary<(...args: any[]) => any | void> = ComponentSignals<Comp["constructor"]["_Info"] & {}> & (Comp["constructor"]["_Info"] & {} & { signals: {}})["signals"]> =
    { [SignalName in keyof CompSignals]: (comp: Comp, ...params: Parameters<CompSignals[SignalName]>) => ReturnType<CompSignals[SignalName]> };

export type ComponentExternalSignals<Comp extends Component = Component> = {
    /** Special call - called right after constructing the component instance. */
    preMount: (component: Comp) => void;
    /** Callback that is fired after the initial rendering has been done and elements are in the dom. After any further updates onUpdate (and onPreUpdate and onShouldUpdate) are called. */
    didMount: (component: Comp) => void;
    /** This is a callback that will always be called when the component is checked for updates.
     * - Note that this is not called on mount, but will be called everytime on update when it's time to check whether should update or not - regardless of whether will actually update.
     * - This is the perfect place to use Effects to, as you can modify the state immediately and the mods will be included in the current update run. Access the new values in component.props and component.state.
     *   .. Note that you can also use effects on the render scope. The only difference is that the render method will be called again immediately after (but likewise included in the same update run). */
    beforeUpdate: (component: Comp) => void;
    /** Callback to determine whether should update or not.
     * - If returns true, component will update. If false, will not.
     * - If returns null (or no onShouldUpdate method assigned), will use the rendering settings to determine.
     * - Note that this is not called every time necessarily (never on mount, and not if was forced).
     * - Note that this is called right before onPreUpdate and the actual update (if that happens).
     * - Note that by this time all the data has been updated already. So use preUpdates to get what it was before.
     * - Note that due to handling return value, emitting this particular signal is handled a bit differently. If any says true, will update, otherwise will not. */
    shouldUpdate: (component: Comp,
        newUpdates: MixDOMComponentPreUpdates<(Comp["constructor"]["_Info"] & {props: {}})["props"], (Comp["constructor"]["_Info"] & {state: {}})["state"]>,
        preUpdates: MixDOMComponentPreUpdates<(Comp["constructor"]["_Info"] & {props: {}})["props"], (Comp["constructor"]["_Info"] & {state: {}})["state"]>,
    ) => boolean | null;
    /** This is a callback that will always be called when the component is checked for updates. Useful to get a snapshot of the situation.
     * - Note that this is not called on mount, but will be called everytime on update, even if will not actually update (use the 3rd param).
     * - Note that this will be called right after onShouldUpdate (if that is called) and right before the update happens.
     * - Note that by this time all the data has been updated already. So use preUpdates to get what it was before. */
    preUpdate: (component: Comp,
        newUpdates: MixDOMComponentPreUpdates<(Comp["constructor"]["_Info"] & {props: {}})["props"], (Comp["constructor"]["_Info"] & {state: {}})["state"]>,
        preUpdates: MixDOMComponentPreUpdates<(Comp["constructor"]["_Info"] & {props: {}})["props"], (Comp["constructor"]["_Info"] & {state: {}})["state"]>,
        willUpdate: boolean
    ) => void;
    /** Called after the component has updated and changes been rendered into the dom. */
    didUpdate: (component: Comp,
        newUpdates: MixDOMComponentPreUpdates<(Comp["constructor"]["_Info"] & {props: {}})["props"], (Comp["constructor"]["_Info"] & {state: {}})["state"]>,
        preUpdates: MixDOMComponentPreUpdates<(Comp["constructor"]["_Info"] & {props: {}})["props"], (Comp["constructor"]["_Info"] & {state: {}})["state"]>,
    ) => void;
    /** Called when the component has moved in the tree structure. */
    didMove: (component: Comp) => void;
    /** Called when the component is about to be ungrounded: removed from the tree and dom elements destroyed. */
    willUnmount: (component: Comp) => void;
};

/** Typing infos for Components. */
export interface ComponentInfo<Props extends Dictionary = {}, State extends Dictionary = {}, Class extends Dictionary = {}, Signals extends Dictionary<(...args: any[]) => any> = {}, Timers extends any = any, Contexts extends MixDOMContextsAll = {}> {
    /** Typing for the props for the component - will be passed by parent. */
    props: Props;
    /** Typing for the local state of the component. */
    state: State;
    /** Only for functional components - can type extending the component with methods and members.
     * - For example: `{ class: { doSomething(what: string): void; }; }`
     * - And then `(initProps, component) => { component.doSomething = (what) => { ... } }` */
    class: Class;
    /** Typed signals. For example `{ signals: { onSomething: (what: string) => void; }; }`.
     * - Note that these are passed on to the props._signals typing. However props._signals will not actually be found inside the render method. */
    signals: Signals;
    /** Typing for timers. Usually strings but can be anything. */
    timers: Timers;
    /** Typing for the related contexts: a dictionary where keys are context names and values are each context.
     * - The actual contexts can be attached directly on the Component using its contextAPI or _contexts prop, but they are also secondarily inherited from the Host. */
    contexts: Contexts;
}


// - ComponentContextAPI class - //

export interface ComponentContextAPI<Contexts extends MixDOMContextsAll = {}> extends ContextAPI<Contexts> {
    /** The Host that this ContextAPI is related to (through the component). Should be set manually after construction.
     * - It's used for two purposes: 1. Inheriting contexts, 2. syncing to the host refresh (with the afterRefresh method).
     * - It's assigned as a member to write ComponentContextAPI as a clean class.
     */
    host: Host<Contexts>;
    /** Get the named context for the component.
     * - Note that for the ComponentContextAPI, its local bookkeeping will be used primarily. If a key is found there it's returned (even if `null`).
     * - Only if the local bookkeeping gave `undefined` will the inherited contexts from the host be used, unless includeInherited is set to `false` (defaults to `true`).
     */
    getContext<Name extends keyof Contexts & string>(name: Name, includeInherited?: boolean): Contexts[Name] | null | undefined;
    /** Get the contexts for the component, optionally only for given names.
     * - Note that for the ComponentContextAPI, its local bookkeeping will be used primarily. If a key is found there it's returned (even if `null`).
     * - Only if the local bookkeeping gave `undefined` will the inherited contexts from the host be used, unless includeInherited is set to `false` (defaults to `true`).
     */
    getContexts<Name extends keyof Contexts & string>(onlyNames?: RecordableType<Name> | null, includeInherited?: boolean): Partial<Record<string, Context | null>> & Partial<MixDOMContextsAllOrNull<Contexts>>;
    /** This triggers a refresh and returns a promise that is resolved when the Component's Host's update / render cycle is completed.
     * - If there's nothing pending, then will resolve immediately. 
     * - This uses the signals system, so the listener is called among other listeners depending on the adding order. */
    afterRefresh(fullDelay?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): Promise<void>;
}
export class ComponentContextAPI<Contexts extends MixDOMContextsAll = {}> extends ContextAPI<Contexts> {
    host: Host<Contexts>;
    public getContext<Name extends keyof Contexts & string>(name: Name, includeInherited: boolean = true): Contexts[Name] | null | undefined {
        return this.contexts[name] !== undefined ? this.contexts[name] as Contexts[Name] | null : includeInherited ? this.host.contextAPI.contexts[name] as Contexts[Name] | undefined : undefined;
    }
    public getContexts<Name extends keyof Contexts & string>(onlyNames?: RecordableType<Name> | null, includeInherited: boolean = true): Partial<Record<string, Context | null>> & Partial<MixDOMContextsAllOrNull<Contexts>> {
        return includeInherited ? { ...this.host.contextAPI.getContexts(onlyNames), ...super.getContexts(onlyNames) } : super.getContexts(onlyNames);
    }
    public afterRefresh(fullDelay?: boolean | undefined, updateTimeout?: number | null, renderTimeout?: number | null): Promise<void> {
        return this.host.afterRefresh(fullDelay, updateTimeout, renderTimeout);
    }
}


// - Mixin - //

function _ComponentMixin<Info extends Partial<ComponentInfo> = {}, Props extends Dictionary = NonNullable<Info["props"]>, State extends Dictionary = NonNullable<Info["state"]>>(Base: ClassType) {

    // A bit surprisingly, using this way of typing (combined with the ComponentMixin definition below), everything works perfectly.
    // .. The only caveat is that within here, we don't have the base class available.
    return class _Component extends (_SignalManMixin(Base) as ClassType) {


        // - Static side - //

        public static MIX_DOM_CLASS = "Component";
        ["constructor"]: ComponentType<Info>;


        // - Members - //

        public readonly boundary: SourceBoundary;
        public readonly props: Props;
        public state: State;
        public updateModes: Partial<MixDOMUpdateCompareModesBy>;
        public constantProps?: Partial<Record<keyof Props, MixDOMUpdateCompareMode | number | true>>;
        public timers?: Map<any, number | NodeJSTimeout>;
        public readonly wired?: Set<ComponentWiredType | ComponentWiredFunc>;

        public contextAPI?: ComponentContextAPI<Info["contexts"] & {}>;


        // - Construction - //

        constructor(props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Props, boundary?: SourceBoundary, ...passArgs: any[]) {
            // We are a mixin.
            super(...passArgs);
            // Set from args.
            this.props = props;
            if (boundary) {
                this.boundary = boundary;
                boundary.component = this as any;
            }
        }

        /** This initializes the contextAPI instance (once). */
        initContextAPI(): void {
            // Already created.
            if (this.contextAPI)
                return;
            // Create new.
            this.contextAPI = new ComponentContextAPI();
            this.contextAPI.host = this.boundary.host;
            // Attach to host for hooking up to its contexts automatically. Will be removed on unmounting.
            this.boundary.host.contextComponents.add(this as any as ComponentWith);
            // Set initial contexts.
            const _contexts = this.boundary._outerDef.attachedContexts;
            if (_contexts)
                for (const ctxName in _contexts)
                    this.contextAPI.setContext(ctxName as never, _contexts[ctxName] as never, false);
        }


        // - Getters - //

        public isMounted(): boolean {
            return this.boundary.isMounted === true;
        }

        public getHost<Contexts extends MixDOMContextsAll = Info["contexts"] & {}>(): Host<Contexts> {
            return this.boundary.host;
        }

        public queryElement(selector: string, withinBoundaries: boolean = false, overHosts: boolean = false): Element | null {
            return _Find.domElementByQuery(this.boundary.treeNode, selector, withinBoundaries, overHosts);
        }

        public queryElements(selector: string, maxCount: number = 0, withinBoundaries: boolean = false, overHosts: boolean = false): Element[] {
            return _Find.domElementsByQuery(this.boundary.treeNode, selector, maxCount, withinBoundaries, overHosts);
        }

        public findElements(maxCount: number = 0, withinBoundaries: boolean = false, overHosts: boolean = false, validator?: (treeNode: MixDOMTreeNode) => any): Node[] {
            return _Find.treeNodesWithin(this.boundary.treeNode, { dom: true }, maxCount, withinBoundaries, overHosts, validator).map(tNode => tNode.domNode) as Node[];
        }

        public findComponents<Comp extends ComponentTypeAny = ComponentTypeAny>(maxCount: number = 0, withinBoundaries: boolean = false, overHosts: boolean = false, validator?: (treeNode: MixDOMTreeNode) => any): Comp[] {
            return _Find.treeNodesWithin(this.boundary.treeNode, { boundary: true }, maxCount, withinBoundaries, overHosts, validator).map(t => (t.boundary && t.boundary.component) as unknown as Comp);
        }

        public findTreeNodes(types?: RecordableType<MixDOMTreeNodeType>, maxCount: number = 0, withinBoundaries: boolean = false, overHosts: boolean = false, validator?: (treeNode: MixDOMTreeNode) => any): MixDOMTreeNode[] {
            return _Find.treeNodesWithin(this.boundary.treeNode, types && _Lib.buildRecordable<MixDOMTreeNodeType>(types), maxCount, withinBoundaries, overHosts, validator);
        }


        // - Timer service - automatically cleared upon unmounting - //

        public newTimer(callback: () => void, timeout: number): {} {
            const id = {};
            this.setTimer(id, callback, timeout);
            return id;
        }
        public setTimer(timerId: any, callback: () => void, timeout: number): void {
            // Clear old.
            if (!this.timers)
                this.timers = new Map();
            else if (this.timers.has(timerId))
                this.clearTimer(timerId);
            // Assign.
            this.timers.set(timerId, setTimeout(() => {
                this.clearTimer(timerId);
                callback.call(this);
            }, timeout));
        }
        public hasTimer(timerId: any): boolean {
            return this.timers ? this.timers.has(timerId) : false;
        }
        public clearTimer(timerId: any): void {
            if (!this.timers)
                return;
            const timer = this.timers.get(timerId);
            if (timer != null) {
                clearTimeout(timer as number | undefined);
                this.timers.delete(timerId);
            }
        }
        public clearTimers(onlyTimerIds?: any[]): void {
            if (!this.timers)
                return;
            if (onlyTimerIds) {
                for (const timerId of onlyTimerIds)
                    this.clearTimer(timerId);
            }
            else {
                this.timers.forEach(timer => clearTimeout(timer as number | undefined));
                this.timers.clear();
            }
        }


        // - Updating - //

        public setUpdateModes(modes: Partial<MixDOMUpdateCompareModesBy>, extend: boolean = true): void {
            // Reset.
            if (!extend)
                this.updateModes = {};
            // Extend.
            for (const type in modes)
                this.updateModes[type] = modes[type];
        }

        public setConstantProps(constProps: Partial<Record<keyof Props, MixDOMUpdateCompareMode | number | true>> | (keyof Props)[] | null, extend: boolean = true, overrideEach: MixDOMUpdateCompareMode | number | null = null): void {
            // Reset or initialize.
            if (!extend || !this.constantProps)
                this.constantProps = {};
            // Extend.
            let didAdd = false;
            if (constProps) {
                if (Array.isArray(constProps))
                    for (const prop of constProps) {
                        this.constantProps[prop] = overrideEach ?? true;
                        didAdd = true;
                    }
                else
                    for (const prop in constProps) {
                        this.constantProps[prop] = overrideEach ?? constProps[prop];
                        didAdd = true;
                    }
            }
            // Remove totally.
            if (!didAdd && !extend)
                delete this.constantProps;
        }

        public setState(newState: Pick<State, keyof State> | State, extend: boolean = true, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void {
            // Combine state.
            const state = extend ? { ...this.state, ...newState } as State : newState;
            // Update.
            this.boundary.updateBy({ state } as MixDOMComponentPreUpdates, forceUpdate, forceUpdateTimeout, forceRenderTimeout);
        }

        public setInState(property: keyof State, value: any, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void {
            // Get new state.
            const state = { ...(this.state || {}), [property]: value } as State;
            // Update.
            this.boundary.updateBy({ state } as MixDOMComponentPreUpdates, forceUpdate, forceUpdateTimeout, forceRenderTimeout);
        }

        public triggerUpdate(forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void {
            this.boundary.host.services.absorbUpdates(this.boundary, { force: forceUpdate || false }, true, forceUpdateTimeout, forceRenderTimeout);
        }


        // - Wired component - //

        public createWired(...args: any[]): ComponentWiredFunc | ComponentWiredType {
            const Wired = createWired(...args as Parameters<typeof createWired>);
            if (!this.wired)
                // We set a readonly value here - it's on purpose: we want it to be readonly for all others except this line.
                (this as { wired: Set<ComponentWiredFunc | ComponentWiredType>; }).wired = new Set([Wired]);
            else
                this.wired.add(Wired);
            return Wired;
        }

        
        // - Extend signal delay handling - //

        // Overridden.
        public afterRefresh(renderSide: boolean = false, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): Promise<void> {
            return this.boundary.host.afterRefresh(renderSide, forceUpdateTimeout, forceRenderTimeout);
        }


        // - Render - //

        public render(_props: Props, _state: State): MixDOMRenderOutput | MixDOMDoubleRenderer & MixDOMDoubleRenderer<Props, State> { return null; }

    }
}

/** There are two ways you can use this:
 * 1. Call this to give basic Component features with advanced typing being empty.
 *      * For example: `class MyMix extends ComponentMixin(MyBase) {}`
 * 2. If you want to define Props, State, Signals, Timers and Contexts, use this simple trick instead:
 *      * For example: `class MyMix extends (ComponentMixin as ClassMixer<ComponentType<{ props: MyProps; timers: MyTimers; }>>)(MyBase) {}`
 * - Note that the Info["class"] only works for functional components. In class form, you simply extend the class or mixin with a custom class or mixin.
 */
export const ComponentMixin = _ComponentMixin as unknown as ClassMixer<ComponentType>;


// - Class - //

/** Standalone Component class. */
export class Component<Info extends Partial<ComponentInfo> = {}, Props extends Dictionary = NonNullable<Info["props"]>, State extends Dictionary = NonNullable<Info["state"]>> extends _ComponentMixin(Object) {
    // Needed for TSX.
    // _Info: Info;
    ["constructor"]: ComponentType<Info>;
    constructor(props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Props, boundary?: SourceBoundary, ...passArgs: any[]) { super(props, boundary, ...passArgs); }
    
}
export interface Component<
    Info extends Partial<ComponentInfo> = {},
    Props extends Dictionary = NonNullable<Info["props"]>,
    State extends Dictionary = NonNullable<Info["state"]>
> extends SignalMan<ComponentSignals<Info> & Info["signals"]> {

    /** Fresh props from the parent. */
    readonly props: Props;
    /** Locally defined state. When it's changed, the component will typically update and then re-render if needed. */
    state: State;
    /** Map of the timers by id, the value is the reference for cancelling the timer. Only appears here if uses timers. */
    timers?: Map<Info["timers"] & {}, number | NodeJSTimeout>;

    /** If any is undefined / null, then uses the default from host.settings. */
    updateModes: Partial<MixDOMUpdateCompareModesBy>;

    /** If constantProps is defined, then its keys defines props that must not change, and values how the comparison is done for each.
     * This affects the def pairing process by disallowing pairing if conditions not met, which in turn results in unmount and remount instead of just updating props (and potentially moving). */
    constantProps?: Partial<Record<keyof Props, MixDOMUpdateCompareMode | number | true>>;
    /** ContextAPI for the component. You can use it to access contextual features. By default inherits the named contexts from the Host, but you can also override them locally. */
    contextAPI?: ComponentContextAPI<Info["contexts"] & {}>;

    // Related class instances.
    /** Ref to the dedicated SourceBoundary - it's technical side of a Component. */
    readonly boundary: SourceBoundary;
    /** Any wired component classes created by us. */
    readonly wired?: Set<ComponentWiredType | ComponentWiredFunc>;

    /** The constructor is typed as ComponentType. */
    ["constructor"]: ComponentType<Info>;


    // - Extend signal delay handling - //

    /** This returns a promise that is resolved after the host's refresh cycle has finished.
     * - By default delays until the "update" cycle (renderSide = false). If renderSide is true, then is resolved after the "render" cycle (after updates). */
    afterRefresh(renderSide?: boolean, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): Promise<void>;


    // - Getters - //

    /** Whether this component has mounted. If false, then has not yet mounted or has been destroyed. */
    isMounted(): boolean;
    /** Gets the rendering host that this component belongs to. By default uses the same Contexts typing as in the component's info, but can provide custom Contexts here too. */
    getHost<Contexts extends MixDOMContextsAll = Info["contexts"] & {}>(): Host<Contexts>;
    /** Get the first dom element within by a selectors within the host (like document.querySelector). Should rarely be used, but it's here if needed. */
    queryElement<T extends Element = Element>(selector: string, withinBoundaries?: boolean, overHosts?: boolean): T | null;
    /** Get dom elements within by a selectors within the host (like document.querySelectorAll). Should rarely be used, but it's here if needed. */
    queryElements<T extends Element = Element>(selector: string, maxCount?: number, withinBoundaries?: boolean, overHosts?: boolean): T[];
    /** Find all dom nodes within by an optional validator. */
    findElements<T extends Node = Node>(maxCount?: number, withinBoundaries?: boolean, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): T[];
    /** Find all components within by an optional validator. */
    findComponents<Comp extends ComponentTypeAny = ComponentTypeAny>(maxCount?: number, withinBoundaries?: boolean, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): Comp[];
    /** Find all treeNodes within by given types and an optional validator. */
    findTreeNodes(types?: RecordableType<MixDOMTreeNodeType>, maxCount?: number, withinBoundaries?: boolean, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): MixDOMTreeNode[];


    // - Timer service - automatically cleared on unmount - //

    /** Add a new timer _without_ an id. Returns the id which is always a new empty object: {}. It can be used for cancelling. */
    newTimer(callback: () => void, timeout: number): {};
    /** Add a new timer with a custom id. Timers will be automatically cancelled if the component unmounts. You can provide the typing locally to the method. */
    setTimer(timerId: NonNullable<Info["timers"]>, callback: () => void, timeout: number): void;
    /** Check whether the current timer id exists. */
    hasTimer(timerId: NonNullable<Info["timers"]>): boolean;
    /** Clear timer by id. */
    clearTimer(timerId: NonNullable<Info["timers"]>): void;
    /** Clear all timers or many timers by an array of timer ids. */
    clearTimers(onlyTimerIds?: NonNullable<Info["timers"]>[]): void;


    // - Updating - //

    // Update generally.
    /** Modify the updateModes member that defines how should compare { props, data, children, streams } during the update process. */
    setUpdateModes(modes: Partial<MixDOMUpdateCompareModesBy>, extend?: boolean): void;
    /** Modify the constantProps member that defines which props must not change (and how) without a remount. If you set the mode to `true` it means "changed" (= 0 depth).
     * You can also override the mode for each if you just want to use the keys of another dictionary. 
     * By default extends the given constant props, if you want to reset put extend to `false`. If you want to clear, leave the constProps empty (null | [] | {}) as well. */
    setConstantProps(constProps: Partial<Record<keyof Props, MixDOMUpdateCompareMode | number | true>> | (keyof Props)[] | null, extend?: boolean, overrideEach?: MixDOMUpdateCompareMode | number | null): void;
    /** Trigger an update manually. Normally you never need to use this. Can optionally define update related timing */
    triggerUpdate(forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    // State.
    /** Set the whole state (or partial with extend set to true). Can optionally define update related timing. */
    setState<Key extends keyof State>(newState: Pick<State, Key> | State, extend?: boolean | true, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    setState(newState: State, extend?: false, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Set one property in the state with typing support. Can optionally define update related timing. */
    setInState<Key extends keyof State>(property: Key, value: State[Key], forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    

    // - Wired component - //

    /** Creates a wired component (function) and attaches it to the .wired set for automatic updates.
     * - The wired component is an intermediary component to help produce extra props to an inner component.
     *      * It receives its parent props normally, and then uses its `state` for the final props that will be passed to the inner component (as its `props`).
     * - About arguments:
     *      1. The optional Builder function builds the common external props for all wired instances. These are added to the component's natural props.
     *      2. The optional Mixer function builds unique props for each wired instance. If used, the common props are fed to it and the output of the mixer instead represents the final props to add.
     *      3. The only mandatory argument is the component to be used in rendering, can be a spread func, too. It's the one that receives the mixed props: from the tree flow and from the wiring source by handled by Mixer and Builder functions.
     *      4. Finally you can also define the name of the component (useful for debugging).
     * - Technically this method creates a component function (but could as well be a class extending Component).
     *      - The important thing is that it's a unique component func/class and it has `api` member that is of `WiredAPI` type (extending `ComponentShadowAPI`).
     *      - When the component is instanced, its static class side contains the same `api` which serves as the connecting interface between the driver and all instances.
     *      - This class can then allow to set and refresh the common props, and trigger should-updates for all the instances and use signals.
     *      - The `WiredAPI` extension contains then features related to the automated mixing of parent props and custom data to produce final state -> inner component props.
     * - Note that when creates a wired component through this method (on a Component component), it's added to the .wired set and automatically triggered for updates whenever this component is checked for should-updates.
     */
    createWired<
         ParentProps extends Dictionary = {},
         BuildProps extends Dictionary = {},
         MixedProps extends Dictionary = ParentProps & BuildProps,
         Builder extends (lastProps: BuildProps | null) => BuildProps = (lastProps: BuildProps | null) => BuildProps,
         Mixer extends (parentProps: ParentProps, addedProps: [Builder] extends [() => any] ? BuildProps : null, wired: Component<{ props: ParentProps; state: MixedProps; }>) => MixedProps = (parentProps: ParentProps, addedProps: [Builder] extends [() => any] ? BuildProps : null, wired: Component<{ props: ParentProps; state: MixedProps; }>) => MixedProps,
         >(mixer: Mixer | BuildProps | null, renderer: ComponentTypeAny<{ props: MixedProps; }>, name?: string): ComponentWiredFunc<ParentProps, BuildProps, MixedProps>;
     createWired<
         ParentProps extends Dictionary = {},
         BuildProps extends Dictionary = {},
         MixedProps extends Dictionary = ParentProps & BuildProps,
         Builder extends (lastProps: BuildProps | null) => BuildProps = (lastProps: BuildProps | null) => BuildProps,
         Mixer extends (parentProps: ParentProps, addedProps: [Builder] extends [() => any] ? BuildProps : null, wired: Component<{ props: ParentProps; state: MixedProps; }>) => MixedProps = (parentProps: ParentProps, addedProps: [Builder] extends [() => any] ? BuildProps : null, wired: Component<{ props: ParentProps; state: MixedProps; }>) => MixedProps,
     >(builder: Builder | BuildProps | null, mixer: Mixer | null, renderer: ComponentTypeAny<{ props: MixedProps; }>, name?: string): ComponentWiredFunc<ParentProps, BuildProps, MixedProps>;


    // - Render - //

    /** The most important function of any component: the render function. If not using functional rendering, override this manually on the class.
     */
    render(props: Props, state: State): MixDOMRenderOutput | MixDOMDoubleRenderer & MixDOMDoubleRenderer<Props, State>;

}

/** This declares a Component class but allows to input the Infos one by one: <Props, State, Class, Signals, Timers, Contexts> */
export interface ComponentOf<
    Props extends Dictionary = {},
    State extends Dictionary = {},
    Class extends Dictionary = {},
    Signals extends Dictionary<(...args: any[]) => any> = {},
    Timers extends any = any,
    Contexts extends MixDOMContextsAll = {},
> extends Component<ComponentInfo<Props, State, Class, Signals, Timers, Contexts>> {}


// - Component types - //

/** Type for Component with ContextAPI. Also includes the signals that ContextAPI brings. */
export interface ComponentWith<Info extends Partial<ComponentInfo> = {}> extends Component<Info> {
    contextAPI: ComponentContextAPI<Info["contexts"] & {}>;
}
export interface ComponentType<Info extends Partial<ComponentInfo> = {}> {
    /** Class type. */
    MIX_DOM_CLASS: string; // "Component"
    /** May feature a ComponentShadowAPI, it's put here to make typing easier. */
    api?: ComponentShadowAPI<Info>; // Too deep. Either ["constructor"] or api here.
    // We are a static class, and when instanced output a streaming source.
    new (props: Info["props"] & {}, boundary?: SourceBoundary): Component<Info>;

    // Typing info.
    _Info?: Info;
}
export interface ComponentTypeOf<
    Props extends Dictionary = {},
    State extends Dictionary = {},
    Class extends Dictionary = {},
    Signals extends Dictionary<(...args: any[]) => any> = {},
    Timers extends any = any,
    Contexts extends MixDOMContextsAll = {},
> extends ComponentType<ComponentInfo<Props, State, Class, Signals, Timers, Contexts>> {}

/** This includes the _Info: { class } into the typing as if extending the class. */
export type ComponentTypeWithClass<Info extends Partial<ComponentInfo> = {}> = [Info["class"]] extends [{}] ?
    // Has class info, attach them.
    Omit<ComponentType<Info>, "new"> & {
        new (props: Info["props"] & {}, boundary?: SourceBoundary):
            Component<Info> & Info["class"];
            // Component<Info> & { [Key in keyof Info["class"]]: Info["class"][Key]; }
    } : ComponentType<Info>;
export type ComponentWithClass<Info extends Partial<ComponentInfo> = {}> = Component<Info> & Info["class"];

/** Either a class or a component func (not a spread func). */
export type ComponentTypeEither<Info extends Partial<ComponentInfo> = {}> = ComponentType<Info> | ComponentFunc<Info>;
/** This is a shortcut for all valid MixDOM components: class, component func or a spread func.
 * - Hint. You can use this in props: `{ ItemRenderer: ComponentTypeAny<Info>; }` and then just insert it by `<props.ItemRenderer {...itemInfo} />` */
export type ComponentTypeAny<Info extends Partial<ComponentInfo> = {}> = ComponentType<Info> | ComponentFunc<Info> | SpreadFunc<Info["props"] & {}>;
export type ComponentInstanceType<CompType extends ComponentType | ComponentFunc, Fallback = Component> = [CompType] extends [ComponentFunc] ? Component<GetComponentFuncInfo<CompType>> : [CompType] extends [ComponentType] ? InstanceType<CompType> : Fallback;
export type GetComponentInfo<Type extends ComponentTypeAny | Component> = ([Type] extends [(...args: any[]) => any | void] ? GetComponentFuncInfo<Type> : [(...args: any[]) => any | void] extends [Type] ? GetComponentFuncInfo<(() => any) & Type> : [Type] extends [Component] ? Type["constructor"]["_Info"] & {} : [Type] extends [ComponentType] ? Type["_Info"] & {} : (Type & { _Info: Partial<ComponentInfo>; })["_Info"] & {});
// export type GetComponentFuncInfo<Type extends (...args: any[]) => any | void> = [undefined] extends [Parameters<Type>[1]] ? { props: Parameters<Type>[0]; } : (Parameters<Type>[1] & { _Info: {}; })["_Info"];
export type GetComponentFuncInfo<Type extends (...args: any[]) => any | void> = [Type] extends [{ _Info?: Partial<ComponentInfo> | undefined; }] ? Type["_Info"] & {} : [undefined] extends [Parameters<Type>[1]] ? { props: Parameters<Type>[0]; } : (Parameters<Type>[1] & { _Info: {}; })["_Info"];
export type ExtendComponentInfoWith<Info extends Partial<ComponentInfo>, Comp extends ComponentTypeAny> = Info & ([Comp] extends [ComponentFunc] ? GetComponentFuncInfo<Comp> : [Comp] extends [SpreadFunc] ? { props: Parameters<Comp>[0] } : GetComponentInfo<Comp>);


// - Function types - //

// Common declarations.
/** This declares a ComponentFunc by <Info>. */
export type ComponentFunc<Info extends Partial<ComponentInfo> = {}> = 
    // ((initProps: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: Component<Info> & Info["class"]) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>) & { _Info?: Info; };
    ((initProps: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: Component<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>) & { _Info?: Info; };

/** This declares a ComponentFunc that will have a ContextAPI instance. */
export type ComponentFuncWith<Info extends Partial<ComponentInfo> = {}> =
    ((initProps: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentWith<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>) & { _Info?: Info; };

/** This declares a ComponentFunc but allows to input the Infos one by one: <Props, State, Class, Signals, Timers, Contexts> */
export type ComponentFuncOf<Props extends Dictionary = {}, State extends Dictionary = {}, Class extends Dictionary = {}, Signals extends Dictionary<(...args: any[]) => any> = {}, Timers extends any = any, Contexts extends MixDOMContextsAll = {}> = 
    (initProps: MixDOMPreComponentOnlyProps<Signals> & Props, component: Component<ComponentInfo<Props, State, Class, Signals, Timers, Contexts>> & Class, contextAPI: ComponentContextAPI<Contexts>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Props, State>;

/** Either type of functional component: spread or a full component (with optional contextAPI). */
export type ComponentFuncAny<Info extends Partial<ComponentInfo> = {}> = ComponentFunc<Info> | SpreadFunc<Info["props"] & {}>;

// Internal helpers - exported only locally.
export type ComponentFuncShortcut<Info extends Partial<ComponentInfo> = {}> = (component: Component<Info> & Info["class"]) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>;
export type ComponentFuncWithCtxShortcut<Info extends Partial<ComponentInfo> = {}> = (component: ComponentWith<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>;


// - Create component function - //

/** Create a component by func. You get the component as the first parameter (component), while initProps are omitted. */
export function createComponent<Info extends Partial<ComponentInfo> = {}>(func: (component: Component<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>, name?: string): ComponentFunc<Info>;
export function createComponent<Info extends Partial<ComponentInfo> = {}>(func: ComponentFuncShortcut<Info> | ComponentFuncWithCtxShortcut<Info>, name: string = func.name) {
    // This { [func.name]: someFunc }[func.name] trick allows to reuse the name dynamically. However, its mostly useful for classes, as the functions are named outside (= afterwards).
    return { [name]: 
        func.length > 1 ?
            function (_props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentWith<Info>, contextAPI: ComponentContextAPI<Info["contexts"] & {}>) { return (func as ComponentFuncWithCtxShortcut<Info>)(component, contextAPI); } as ComponentFuncWith<Info> :
            function (_props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: Component<Info>) { return (func as ComponentFuncShortcut<Info>)(component); } as ComponentFunc<Info>
    }[name];
}

/** Create a component with ContextAPI by func and omitting the first initProps: (component, contextAPI). The contextAPI is instanced regardless of argument count and component typing includes component.contextAPI. */
export const createComponentWith = <Info extends Partial<ComponentInfo> = {}>(func: ComponentFuncWithCtxShortcut<Info>, name: string = func.name): ComponentFuncWith<Info> =>
    // This { [func.name]: someFunc }[func.name] trick allows to reuse the name dynamically.
    ({ [name]: function (_props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentWith<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) { return (func as ComponentFuncWithCtxShortcut<Info>)(component, contextAPI); }})[name] as ComponentFuncWith<Info>;
