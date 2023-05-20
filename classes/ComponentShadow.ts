

// - Imports - //

import {
    MixDOMPreComponentOnlyProps,
    MixDOMDoubleRenderer,
    MixDOMRenderOutput,
    MixDOMUpdateCompareModesBy,
} from "../static/_Types";
import { _Defs } from "../static/_Defs";
import {
    Component,
    ComponentExternalSignalsFor,
    ComponentFuncNoCtxShortcut,
    ComponentFuncWithCtxShortcut,
    ComponentInfo,
    ComponentType,
    createComponent,
    createComponentWith
} from "./Component";
import { SignalListener, SignalBoy } from "./SignalMan";
import {
    ContextAPI,
    ContextAPIWith,
    ContextShadowAPIWith
} from "./ContextAPI";


// - Helper types - //

/** Type for the ShadowAPI signals. */
export type ComponentShadowSignals<Info extends Partial<ComponentInfo> = {}> = ComponentExternalSignalsFor<ComponentShadow<Info>>;
export type ComponentShadowFunc<Info extends Partial<ComponentInfo> = {}> = (
    ((props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentShadow<Info>, contextAPI?: ContextAPI<Info>) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info["props"]>, NonNullable<Info["state"]>>)
    ) & { Info?: Info; api: ShadowAPI<Info>; };
export type ComponentShadowFuncWith<Info extends Partial<ComponentInfo> = {}> =
    ((props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentShadowWith<Info>, contextAPI: ContextShadowAPIWith<Info>) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info["props"]>, NonNullable<Info["state"]>>) & { Info?: Info; api: ShadowAPI<Info>; };
export type ComponentShadowFuncWithout<Info extends Partial<ComponentInfo> = {}> =
    ((props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentShadow<Info>, contextAPI?: never) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info["props"]>, NonNullable<Info["state"]>>) & { Info?: Info; api: ShadowAPI<Info>; };


// - Class types - //

export interface ComponentShadowType<Info extends Partial<ComponentInfo> = {}> extends ComponentType<Info> {
    api: ShadowAPI<Info>;
}
/** There is no actual class for ComponentShadow. Instead a new class is created when createShadow is used. */
export interface ComponentShadow<Info extends Partial<ComponentInfo> = {}> extends Component<Info> { }
/** Type for Component with ContextAPI. Also includes the signals that ContextAPI brings. */
export interface ComponentShadowWith<Info extends Partial<ComponentInfo> = {}> extends ComponentShadow<Info & { signals: Info["signals"] }> {
    contextAPI: ContextAPIWith<Info & { signals: Info["signals"] }>;
}
    

// - Class - //

/** This allows to access the instanced components as well as to use signal listeners (with component extra param as the first one), and trigger updates. */
export class ShadowAPI<Info extends Partial<ComponentInfo> = {}> extends SignalBoy<ComponentShadowSignals<Info>> {
    
    /** The currently instanced components that use our custom class as their constructor. */
    public components: Set<Component<Info>>;
    /** Default update modes. Can be overridden by the component's updateModes. */
    public updateModes?: Partial<MixDOMUpdateCompareModesBy>;

    /** The instance is constructed when a new component func is created. When they are instanced they are added to our .components collection. */
    constructor() {
        super();
        this.components = new Set();
    }

    
    // - Methods - //

    /** Call this to trigger an update on the instanced components. */
    public update(update: boolean | "all" = true, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void {
        for (const component of this.components)
            component.triggerUpdate(update, forceUpdateTimeout, forceRenderTimeout);
    }


    // - Auto pass listeners to components - //

    /** The onListener callback is required by ShadowAPI's functionality for connecting signals to components fluently. */
    onListener(name: string, index: number, wasAdded: boolean) {
        // Add our only listener, using the callback as the key.
        if (this.components.size) {
            const listener: SignalListener = this.signals[name][index];
            const callback = listener[0];
            // Add our only listener, using the callback as the key.
            if (wasAdded)
                for (const component of this.components)
                    (component as Component).listenTo(name as any, (...args: any[]) => listener[1] ? callback(component, ...args, ...listener[1]) : callback(component, ...args), null, listener[2], callback);
            // Remove our listener, using the callback as the groupId.
            else
                for (const component of this.components)
                    component.unlistenTo(name as any, callback);
        }
    }
    
}


// - Create helpers - //

/** Create a shadow component omitting the first initProps: (component). The contextAPI is if has 2 arguments (component, contextAPI).
 * - Shadow components are normal components, but they have a ShadowAPI attached as component.constructor.api.
 * - This allows the components to be tracked and managed by the parenting scope who creates the unique component class (whose instances are tracked).
*/
// export function createShadow<Info extends Partial<ComponentInfo> = {}>(func: (component: ComponentShadow<Info>) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info["props"]>, NonNullable<Info["state"]>>, signals?: Partial<ComponentShadowSignals<Info>> | null, name?: string): ComponentShadowFunc<Info>;
// export function createShadow<Info extends Partial<ComponentInfo> = {}>(func: (component: ComponentShadowWith<Info>, contextAPI: ContextAPI<Info>) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info["props"]>, NonNullable<Info["state"]>>, signals?: Partial<ComponentShadowSignals<Info>> | null, name?: string): ComponentShadowFuncWith<Info>;
export function createShadow<Info extends Partial<ComponentInfo> = {}>(func: (component: ComponentShadow<Info>, contextAPI: ContextAPIWith<Info>) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info["props"]>, NonNullable<Info["state"]>>, signals?: Partial<ComponentShadowSignals<Info>> | null, name?: string): ComponentShadowFunc<Info>;
export function createShadow<Info extends Partial<ComponentInfo> = {}>(CompClass: ComponentType<Info>, signals?: Partial<ComponentShadowSignals<Info>> | null, name?: string): ComponentShadowType<Info>;
export function createShadow<Info extends Partial<ComponentInfo> = {}>(funcOrClass: ComponentFuncNoCtxShortcut | ComponentFuncWithCtxShortcut | ComponentType, signals?: Partial<ComponentShadowSignals> | null, name: string = funcOrClass.name) {
    // Exceptionally we also support feeding in a class here. To add support for being a shadow.
    const Shadow = funcOrClass["MIX_DOM_CLASS"] ? { [name]: class extends (funcOrClass as ComponentType) {} }[name] as ComponentShadowType<Info> : createComponent(funcOrClass as any, name) as ComponentShadowFuncWith<Info>;
    Shadow.api = new ShadowAPI();
    if (signals)
        for (const sName in signals)
            Shadow.api.listenTo(sName as any, signals[sName] as any);
    return Shadow;
}

/** Create a shadow component with ContextAPI by func and omitting the first initProps: (component, contextAPI). The contextAPI is instanced regardless of argument count. */
export const createShadowWith = <Info extends Partial<ComponentInfo> = {}>(func: (component: ComponentShadow<Info>, contextAPI: ContextAPIWith<Info>) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info["props"]>, NonNullable<Info["state"]>>, signals?: Partial<ComponentShadowSignals> | null, name: string = func.name): ComponentShadowFuncWith<Info> => {
    // Create and attach ShadowAPI.
    const Shadow = createComponentWith(func, name) as ComponentShadowFuncWith<Info>;
    Shadow.api = new ShadowAPI();
    if (signals)
        for (const sName in signals)
            Shadow.api.listenTo(sName as any, signals[sName] as any);
    return Shadow;
}
