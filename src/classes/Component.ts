

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
    MixDOMContextsAll,
    MixDOMUpdateCompareMode,
    ClassType,
    ClassMixer,
    MixDOMPreComponentOnlyProps,
    GetJoinedDataKeysFrom,
    PropType,
} from "../static/_Types";
import { _Lib } from "../static/_Lib";
import { _Defs } from "../static/_Defs";
import { _Find } from "../static/_Find";
import { SignalMan, SignalListenerFunc, _SignalManMixin, SignalManFlags, SignalsRecord } from "./SignalMan";
import { SpreadFunc } from "./ComponentSpread";
import { SourceBoundary } from "./Boundary";
import { ContentAPI } from "./ContentAPI";
import { ContextAPI, ContextAPIWith } from "./ContextAPI";
import { ShadowAPI } from "./ComponentShadow";
import { createWrapper, ComponentWrapperFunc, ComponentWrapperType } from "./ComponentWrapper";
import { Host } from "./Host";


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
export interface ComponentInfo<Props extends Dictionary = {}, State extends Dictionary = {}, Class extends Dictionary = {}, Signals extends Dictionary<(...args: any[]) => any> = {}, Timers extends any = any, HostInfo extends Host = Host, Contexts extends MixDOMContextsAll = {}> {
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
    /** Typing for host data and signals. */
    host: HostInfo;
    /** Typing for contexts. */
    contexts: Contexts;
}


// - Mixin - //

function _ComponentMixin<Info extends Partial<ComponentInfo> = {}, Props extends Dictionary = NonNullable<Info["props"]>, State extends Dictionary = NonNullable<Info["state"]>>(Base: ClassType) {

    // A bit surprisingly, using this way of typing (combined with the ComponentMixin definition below), everything works perfectly.
    // .. The only caveat is that within here, we don't have the base class available.
    return class _Component extends (_SignalManMixin(Base) as ClassType) {


        // - Typing - //
        
        // _Info: Info;


        // - Static side - //

        public static MIX_DOM_CLASS = "Component";
        ["constructor"]: ComponentType; // <Info>;


        // - Members - //

        public readonly props: Props;
        public state: State;

        public updateModes: Partial<MixDOMUpdateCompareModesBy>;
        public constantProps?: Partial<Record<keyof Props, MixDOMUpdateCompareMode | number | true>>;
        public hostDataListeners?: Map<SignalListenerFunc, string[]>;
        public hostListeners?: [name: string, callback: SignalListenerFunc][];
        public timers?: Map<any, number | NodeJSTimeout>;
        public contentAPI: ContentAPI;
        public contextAPI?: ContextAPI<Info>;
        public readonly boundary: SourceBoundary;
        public readonly wrappers?: Set<ComponentWrapperType | ComponentWrapperFunc>;


        // - Methods - //

        constructor(props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Props, boundary?: SourceBoundary, ...passArgs: any[]) {
            // We are a mixin.
            super(...passArgs);
            // Add content api.
            this.contentAPI = new ContentAPI(this as any);
            // Set from args.
            this.props = props;
            if (boundary) {
                this.boundary = boundary;
                boundary.component = this as any;
                if (boundary._initContextAPI)
                    this.initContextAPI();
            }
        }

        initContextAPI(): void {
            if (!this.contextAPI)
                this.contextAPI = new ContextAPI(this as any) as ContextAPIWith<Info>;
        }


        // - Host related - //
        
        public getHost(): Host {
            return this.boundary.host;
        }

        public listenToHost(name: string, callback: SignalListenerFunc, extraArgs?: any[] | null, flags?: SignalManFlags | null): void {
            // Add to our local bookkeeping (for auto-disconnection on unmounting).
            // .. First one.
            if (!this.hostListeners)
                this.hostListeners = [[name, callback]];
            // .. If exists already, can just skip - it will be overridden likewise on the host (based on name and callback).
            else {
                const listeners = this.hostListeners;
                if (!listeners.some(([n, c], index) => n === name && c === callback))
                    listeners.push([name, callback]);
            }
            // Add a direct listener.
            this.boundary.host.listenTo(name as any, callback, extraArgs, flags);
        }

        public unlistenToHost(names?: string | string[] | null, callback?: SignalListenerFunc | null): void {
            // Remove from host.
            this.boundary.host.unlistenTo(names as any, callback);
            // Remove from local bookkeeping.
            if (this.hostListeners) {
                // Make sure is array or nothing.
                if (typeof names === "string")
                    names = [ names ];
                // Go through each in reverse order and check if names and callback matches - if so, remove from the array.
                for (let i=this.hostListeners.length-1; i>=0; i--) {
                    const [name, thisCallback] = this.hostListeners[i];
                    if ((!names || names.includes(name)) && (!callback || callback == thisCallback))
                        this.hostListeners.splice(i, 1);
                }
            }
        }

        public isListeningToHost(name?: string | null, callback?: (SignalListenerFunc) | null): boolean {
            return this.hostListeners && this.hostListeners.some(([n, c]) => (!name || n === name) && (!callback || c === callback)) || false;
        }

        public listenToHostData(...args: any[]): void {
            // Parse.
            let iOffset = 1;
            const nArgs = args.length;
            const callImmediately = typeof args[nArgs - iOffset] === "boolean" && args[nArgs - iOffset++];
            const callback: SignalListenerFunc = args[nArgs - iOffset];
            const dataNeeds = args.slice(0, nArgs - iOffset);
            // Add / Override.
            if (!this.hostDataListeners)
                this.hostDataListeners = new Map();
            this.hostDataListeners.set(callback, dataNeeds);
            // Call.
            if (callImmediately)
                callback(...dataNeeds.map((need, i) => this.boundary.host.getInData(need)));
        }

        public unlistenToHostData(callback: SignalListenerFunc): boolean {
            // Doesn't have.
            if (!this.hostDataListeners || !this.hostDataListeners.has(callback))
                return false;
            // Remove.
            this.hostDataListeners.delete(callback);
            if (!this.hostDataListeners.size)
                delete this.hostDataListeners;
            return true;
        }

        
        // - Extend signal delay handling - //

        // Overridden.
        public afterRefresh(renderSide: boolean = false, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): Promise<void> {
            return this.boundary.host.afterRefresh(renderSide, forceUpdateTimeout, forceRenderTimeout);
        }


        // - Getters - //

        public isMounted(): boolean {
            return this.boundary.isMounted === true;
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

        public createWrapper(...args: any[]): ComponentWrapperFunc | ComponentWrapperType {
            const Wrapper = createWrapper(...args as Parameters<typeof createWrapper>);
            if (!this.wrappers)
                // We set a readonly value here - it's on purpose: we want it to be readonly for all others except this line.
                (this as { wrappers: Set<ComponentWrapperFunc | ComponentWrapperType>; }).wrappers = new Set([Wrapper]);
            else
                this.wrappers.add(Wrapper);
            return Wrapper;
        }


        // - Render - //

        public render(_props: Props, _state: State): MixDOMRenderOutput | MixDOMDoubleRenderer & MixDOMDoubleRenderer<Props, State> { return null; }
        // public render(_props: Props, _state: State): MixDOMRenderOutput | MixDOMDoubleRenderer<Props, State> { return null; }

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

    // Apis.
    /** Use contentAPI to define any needs for content passing: children or streams.
     * For example, if you want to wrap them specifically, you should define the needs here - so that this component is updated when the content pass has changed. */
    contentAPI: ContentAPI;
    /** Use contextAPI to define contextual needs (for actions, data, ctx streams). Note that you need to initialize this with initContextAPI or by using a functional component with proper initialization (3 arguments or by a shortcut). */
    contextAPI?: ContextAPIWith<Info>;

    // Related class instances.
    /** Ref to the dedicated boundary. */
    readonly boundary: SourceBoundary;
    /** Any wrapper component classes created by us. */
    readonly wrappers?: Set<ComponentWrapperType | ComponentWrapperFunc>;
    /** Any host listeners that will be auto-disconnected on unmount. */
    hostListeners?: [name: string, callback: SignalListenerFunc][];
    /** If uses listenToHostData method, automatically marks the dataKeys here for auto refreshing. We don't need fallbackArgs as the host is always present - reflected in the typing as well. */
    hostDataListeners?: Map<SignalListenerFunc, string[]>;
    
    /** The constructor is typed as ComponentType. */
    ["constructor"]: ComponentType<Info>;


    // - Initializers - //

    /** Initialize a ContextAPI for this component. This is only useful when using classes - as opposed to functional components. */
    initContextAPI(): void;


    // - Host related - //

    /** Gets the host of the component. Can sometimes be used, say, with custom signals on the host. */
    getHost(): Info["host"] & {};
    /** Add a host signal listener that will be automatically disconnected when the component unmounts. */
    listenToHost<HostSignals extends SignalsRecord = (Info["host"] & { _Signals: SignalsRecord })["_Signals"], SignalName extends string & keyof HostSignals = string & keyof HostSignals>(name: SignalName, callback: HostSignals[SignalName], extraArgs?: any[] | null, flags?: SignalManFlags | null): void;
    /** Remove a host signal listener added with `listenToHost`. */
    unlistenToHost<HostSignals extends SignalsRecord = (Info["host"] & { _Signals: SignalsRecord })["_Signals"]>(names?: keyof HostSignals | Array<keyof HostSignals> | null, callback?: SignalListenerFunc | null, groupId?: any | null): void;
    /** Check whether has added a host signal listener with `listenToHost`. */
    isListeningToHost<HostSignals extends SignalsRecord = (Info["host"] & { _Signals: SignalsRecord })["_Signals"]>(name?: keyof HostSignals | null, callback?: SignalListenerFunc | null): boolean;
    /** Listen to data changes in the component - typically then set to the component's state.
     * - However, only needed if the data is designed to be changing, otherwise can just use `component.getHost().getInData(dataKey)` (eg. in the initializer).
     * - As the host is always present, there's no `undefined` added to the arguments, and no fallback arguments needed to be provided. */
    listenToHostData<
        HostData extends (Info["host"] & { data: {}; })["data"],
        Keys extends GetJoinedDataKeysFrom<HostData & {}>,
        Key1 extends Keys,
        Callback extends (val1: PropType<HostData, Key1, never>) => void,
    >(dataKey: Key1, callback: Callback, callImmediately?: boolean): void;
    listenToHostData<
        HostData extends (Info["host"] & { data: {}; })["data"],
        Keys extends GetJoinedDataKeysFrom<HostData & {}>,
        Key1 extends Keys,
        Key2 extends Keys,
        Callback extends (val1: PropType<HostData, Key1, never>, val2: PropType<HostData, Key2, never>) => void,
    >(dataKey1: Key1, dataKey2: Key2, callback: Callback, callImmediately?: boolean): void;
    listenToHostData<
        HostData extends (Info["host"] & { data: {}; })["data"],
        Keys extends GetJoinedDataKeysFrom<HostData & {}>,
        Key1 extends Keys,
        Key2 extends Keys,
        Key3 extends Keys,
        Callback extends (val1: PropType<HostData, Key1, never>, val2: PropType<HostData, Key2, never>, val3: PropType<HostData, Key3, never>) => void,
    >(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, callback: Callback, callImmediately?: boolean): void;
    listenToHostData<
        HostData extends (Info["host"] & { data: {}; })["data"],
        Keys extends GetJoinedDataKeysFrom<HostData & {}>,
        Key1 extends Keys,
        Key2 extends Keys,
        Key3 extends Keys,
        Key4 extends Keys,
        Callback extends (val1: PropType<HostData, Key1, never>, val2: PropType<HostData, Key2, never>, val3: PropType<HostData, Key3, never>, val4: PropType<HostData, Key4, never>) => void,
    >(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, callback: Callback, callImmediately?: boolean): void;
    listenToHostData<
        HostData extends (Info["host"] & { data: {}; })["data"],
        Keys extends GetJoinedDataKeysFrom<HostData & {}>,
        Key1 extends Keys,
        Key2 extends Keys,
        Key3 extends Keys,
        Key4 extends Keys,
        Key5 extends Keys,
        Callback extends (val1: PropType<HostData, Key1, never>, val2: PropType<HostData, Key2, never>, val3: PropType<HostData, Key3, never>, val4: PropType<HostData, Key4, never>, val5: PropType<HostData, Key5, never>) => void,
    >(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, dataKey5: Key5, callback: Callback, callImmediately?: boolean): void;
    listenToHostData<
        HostData extends (Info["host"] & { data: {}; })["data"],
        Keys extends GetJoinedDataKeysFrom<HostData & {}>,
        Key1 extends Keys,
        Key2 extends Keys,
        Key3 extends Keys,
        Key4 extends Keys,
        Key5 extends Keys,
        Key6 extends Keys,
        Callback extends (val1: PropType<HostData, Key1, never>, val2: PropType<HostData, Key2, never>, val3: PropType<HostData, Key3, never>, val4: PropType<HostData, Key4, never>, val5: PropType<HostData, Key5, never>, val6: PropType<HostData, Key6, never>) => void,
    >(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, dataKey5: Key5, dataKey6: Key6, callback: Callback, callImmediately?: boolean): void;
    listenToHostData<
        HostData extends (Info["host"] & { data: {}; })["data"],
        Keys extends GetJoinedDataKeysFrom<HostData & {}>,
        Key1 extends Keys,
        Key2 extends Keys,
        Key3 extends Keys,
        Key4 extends Keys,
        Key5 extends Keys,
        Key6 extends Keys,
        Key7 extends Keys,
        Callback extends (val1: PropType<HostData, Key1, never>, val2: PropType<HostData, Key2, never>, val3: PropType<HostData, Key3, never>, val4: PropType<HostData, Key4, never>, val5: PropType<HostData, Key5, never>, val6: PropType<HostData, Key6, never>, val7: PropType<HostData, Key7, never>) => void,
    >(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, dataKey5: Key5, dataKey6: Key6, dataKey7: Key6, callback: Callback, callImmediately?: boolean): void;
    listenToHostData<
        HostData extends (Info["host"] & { data: {}; })["data"],
        Keys extends GetJoinedDataKeysFrom<HostData & {}>,
        Key1 extends Keys,
        Key2 extends Keys,
        Key3 extends Keys,
        Key4 extends Keys,
        Key5 extends Keys,
        Key6 extends Keys,
        Key7 extends Keys,
        Key8 extends Keys,
        Callback extends (val1: PropType<HostData, Key1, never>, val2: PropType<HostData, Key2, never>, val3: PropType<HostData, Key3, never>, val4: PropType<HostData, Key4, never>, val5: PropType<HostData, Key5, never>, val6: PropType<HostData, Key6, never>, val7: PropType<HostData, Key7, never>, val8: PropType<HostData, Key8, never>) => void,
    >(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, dataKey5: Key5, dataKey6: Key6, dataKey7: Key6, dataKey8: Key8, callback: Callback, callImmediately?: boolean): void;
    /** Remove a host data listener manually. Returns true if did remove, false if wasn't attached. */
    unlistenToHostData(callback: SignalListenerFunc): boolean;


    // - Extend signal delay handling - //

    /** This returns a promise that is resolved after the host's refresh cycle has finished.
     * - By default delays until the "update" cycle (renderSide = false). If renderSide is true, then is resolved after the "render" cycle (after updates). */
    afterRefresh(renderSide?: boolean, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): Promise<void>;


    // - Getters - //

    /** Whether this component has mounted. If false, then has not yet mounted or has been destroyed. */
    isMounted(): boolean;
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

    /** Creates a wrapper component (function) and attaches it to the .wrappers set for automatic updates.
     * - The wrapper component is an intermediary component to help produce extra props to an inner component.
     *      * It receives its parent props normally, and then uses its `state` for the final props that will be passed to the inner component (as its `props`).
     * - About arguments:
     *      1. The optional Builder function builds the common external props for all wrapped instances. These are added to the component's natural props.
     *      2. The optional Mixer function builds unique props for each wrapped instance. If used, the common props are fed to it and the output of the mixer instead represents the final props to add.
     *      3. The only mandatory argument is the component to be used in rendering, can be a spread func, too. It's the one that receives the mixed props: from the tree flow and from the wiring source by handled by Mixer and Builder functions.
     *      4. Finally you can also define the name of the component (useful for debugging).
     * - Technically this method creates a component function (but could as well be a class extending Component).
     *      - The important thing is that it's a unique component func/class and it has `api` member that is of `WrapperAPI` type (extending `ShadowAPI`).
     *      - When the component is instanced, its static class side contains the same `api` which serves as the connecting interface between the driver and all instances.
     *      - This class can then allow to set and refresh the common props, and trigger should-updates for all the instances and use signals.
     *      - The `WrapperAPI` extension contains then features related to the automated mixing of parent props and custom data to produce final state -> inner component props.
     * - Note that when creates a wrapper component through this method (on a Component component), it's added to the .wrappers set and automatically triggered for updates whenever this component is checked for should-updates.
     */
    createWrapper<
         ParentProps extends Dictionary = {},
         BuildProps extends Dictionary = {},
         MixedProps extends Dictionary = ParentProps & BuildProps,
         Builder extends (lastProps: BuildProps | null) => BuildProps = (lastProps: BuildProps | null) => BuildProps,
         Mixer extends (parentProps: ParentProps, addedProps: [Builder] extends [() => any] ? BuildProps : null, wrapped: Component<{ props: ParentProps; state: MixedProps; }>) => MixedProps = (parentProps: ParentProps, addedProps: [Builder] extends [() => any] ? BuildProps : null, wrapped: Component<{ props: ParentProps; state: MixedProps; }>) => MixedProps,
         >(mixer: Mixer | BuildProps | null, renderer: ComponentTypeAny<{ props: MixedProps; }>, name?: string): ComponentWrapperFunc<ParentProps, BuildProps, MixedProps>;
     createWrapper<
         ParentProps extends Dictionary = {},
         BuildProps extends Dictionary = {},
         MixedProps extends Dictionary = ParentProps & BuildProps,
         Builder extends (lastProps: BuildProps | null) => BuildProps = (lastProps: BuildProps | null) => BuildProps,
         Mixer extends (parentProps: ParentProps, addedProps: [Builder] extends [() => any] ? BuildProps : null, wrapped: Component<{ props: ParentProps; state: MixedProps; }>) => MixedProps = (parentProps: ParentProps, addedProps: [Builder] extends [() => any] ? BuildProps : null, wrapped: Component<{ props: ParentProps; state: MixedProps; }>) => MixedProps,
     >(builder: Builder | BuildProps | null, mixer: Mixer | null, renderer: ComponentTypeAny<{ props: MixedProps; }>, name?: string): ComponentWrapperFunc<ParentProps, BuildProps, MixedProps>;


    // - Render - //

    /** The most important function of any component: the render function. If not using functional rendering, override this manually on the class.
     */
    render(props: Props, state: State): MixDOMRenderOutput | MixDOMDoubleRenderer & MixDOMDoubleRenderer<Props, State>;


    // // - Typing - //
    
    // /** This is not an actual javascript object - only the info used for typing the various features on the component. */
    // _Info: Info;

}

/** This declares a Component class but allows to input the Infos one by one: <Props, State, Class, Signals, Timers, Contexts> */
export interface ComponentOf<
    Props extends Dictionary = {},
    State extends Dictionary = {},
    Class extends Dictionary = {},
    Signals extends Dictionary<(...args: any[]) => any> = {},
    Timers extends any = any,
    HostInfo extends Host = Host,
    Contexts extends MixDOMContextsAll = {}
> extends Component<ComponentInfo<Props, State, Class, Signals, Timers, HostInfo, Contexts>> {}


// - Component types - //

/** Type for Component with ContextAPI. Also includes the signals that ContextAPI brings. */
export interface ComponentWith<Info extends Partial<ComponentInfo> = {}> extends Component<Info & { signals: {} & Info["signals"] }> {
    contextAPI: ContextAPIWith<Info & { signals: {} & Info["signals"] }>;
}
export interface ComponentType<Info extends Partial<ComponentInfo> = {}> {
    /** Class type. */
    MIX_DOM_CLASS: string; // "Component"
    /** May feature a ShadowAPI, it's put here to make typing easier. */
    api?: ShadowAPI<Info>; // Too deep. Either ["constructor"] or api here.
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
    HostInfo extends Host = Host,
    Contexts extends MixDOMContextsAll = {}
> extends ComponentType<ComponentInfo<Props, State, Class, Signals, Timers, HostInfo, Contexts>> {}

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
export type ExtendInfoWith<Info extends Partial<ComponentInfo>, Comp extends ComponentTypeAny> = Info & ([Comp] extends [ComponentFunc] ? GetComponentFuncInfo<Comp> : [Comp] extends [SpreadFunc] ? { props: Parameters<Comp>[0] } : GetComponentInfo<Comp>);


// - Function types - //

// Common declarations.
/** This declares a ComponentFunc by <Info>. */
export type ComponentFunc<Info extends Partial<ComponentInfo> = {}> = 
    ((props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: Component<Info> & Info["class"], contextAPI: ContextAPI<Info>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>) & { _Info?: Info; };

// export type ComponentFunc<Info extends Partial<ComponentInfo> = {}> = 
//     ((props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: Component<Info> & Info["class"]) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>) |
//     ((props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentWith<Info> & Info["class"], contextAPI: ContextAPIWith<Info>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>);

    /** This declares a ComponentFunc but allows to input the Infos one by one: <Props, State, Class, Signals, Timers, Contexts> */
export type ComponentFuncOf<Props extends Dictionary = {}, State extends Dictionary = {}, Class extends Dictionary = {}, Signals extends Dictionary<(...args: any[]) => any> = {}, Timers extends any = any, HostInfo extends Host = Host, Contexts extends MixDOMContextsAll = {}> = 
    (props: MixDOMPreComponentOnlyProps<Signals> & Props, component: Component<ComponentInfo<Props, State, Class, Signals, Timers, HostInfo, Contexts>> & Class, contextAPI?: ContextAPI<ComponentInfo<Props, State, Class, Signals, Timers, HostInfo, Contexts>>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Props, State>;
/** This declares a ComponentFunc that will have a ContextAPI instance. */
export type ComponentFuncWith<Info extends Partial<ComponentInfo> = {}> =
    ((props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentWith<Info> & Info["class"], contextAPI: ContextAPI<Info>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>) & { _Info?: Info; };
/** This declares a ComponentFunc that will _not_ have a ContextAPI instance. */
export type ComponentFuncWithout<Info extends Partial<ComponentInfo> = {}> =
    ((props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: Component<Info> & Info["class"], contextAPI?: never) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>) & { _Info: Info; };

/** Either type of functional component: spread or a full component (with optional contextAPI). */
export type ComponentFuncAny<Info extends Partial<ComponentInfo> = {}> = ComponentFunc<Info> | SpreadFunc<Info["props"] & {}>;

// Internal helpers - exported only locally.
export type ComponentFuncNoCtxShortcut<Info extends Partial<ComponentInfo> = {}> = (component: Component<Info> & Info["class"]) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>;
export type ComponentFuncWithCtxShortcut<Info extends Partial<ComponentInfo> = {}> = (component: ComponentWith<Info> & Info["class"], contextAPI: ContextAPIWith<Info>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>;


// - Create component function - //

/** Create a component by func.
 * - You get the component as the first parameter (component), and optionally contextAPI instanced as the second but only if defining with 2 args: (component, contextAPI).
 * - Typing works similarly - including adding contextual signals with ContextAPI. However, component.contextAPI is not ensured. Use createComponentWith instead to get best typing with ContextAPI. */
// export function createComponent<Info extends Partial<ComponentInfo> = {}>(func: (component: Component<Info> & Info["class"]) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>, name?: string): ComponentFunc<Info>;
// export function createComponent<Info extends Partial<ComponentInfo> = {}>(func: (component: ComponentWith<Info> & Info["class"], contextAPI: ContextAPIWith<Info>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>, name?: string): ComponentFuncWith<Info>;
export function createComponent<Info extends Partial<ComponentInfo> = {}>(func: (component: Component<Info> & Info["class"], contextAPI: ContextAPIWith<Info>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>, name?: string): ComponentFunc<Info>;
export function createComponent<Info extends Partial<ComponentInfo> = {}>(func: ComponentFuncNoCtxShortcut<Info> | ComponentFuncWithCtxShortcut<Info>, name: string = func.name) {
    // This { [func.name]: someFunc }[func.name] trick allows to reuse the name dynamically. However, its mostly useful for classes, as the functions are named outside (= afterwards).
    return { [name]: 
        func.length > 1 ?
            function (_props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentWith<Info>, contextAPI: ContextAPIWith<Info>) { return (func as ComponentFuncWithCtxShortcut<Info>)(component, contextAPI); } as ComponentFuncWith<Info> :
            function (_props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: Component<Info>) { return (func as ComponentFuncNoCtxShortcut<Info>)(component); } as ComponentFunc<Info>
    }[name];
}

/** Create a component with ContextAPI by func and omitting the first initProps: (component, contextAPI). The contextAPI is instanced regardless of argument count and component typing includes component.contextAPI. */
export const createComponentWith = <Info extends Partial<ComponentInfo> = {}>(func: ComponentFuncWithCtxShortcut<Info>, name: string = func.name): ComponentFuncWith<Info> =>
    // This { [func.name]: someFunc }[func.name] trick allows to reuse the name dynamically.
    ({ [name]: function (_props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentWith<Info> & Info["class"], contextAPI: ContextAPIWith<Info>) { return (func as ComponentFuncWithCtxShortcut<Info>)(component, contextAPI); }})[name];
