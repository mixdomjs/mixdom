

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
    ComponentInfo,
    ComponentType,
    ComponentTypeEither,
    createComponent,
    createComponentWith,
    ComponentContextAPI
} from "./Component";
import { SignalListener, SignalBoy } from "./SignalMan";


// - Helper types - //

/** Type for the ComponentShadowAPI signals. */
export type ComponentShadowSignals<Info extends Partial<ComponentInfo> = {}> = ComponentExternalSignalsFor<ComponentShadow<Info>>;
export type ComponentShadowFunc<Info extends Partial<ComponentInfo> = {}> = (
    ((props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentShadow<Info>) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info["props"]>, NonNullable<Info["state"]>>)
    ) & { Info?: Info; api: ComponentShadowAPI<Info>; };
export type ComponentShadowFuncWith<Info extends Partial<ComponentInfo> = {}> =
    ((props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentShadowWith<Info>, contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info["props"]>, NonNullable<Info["state"]>>) & { Info?: Info; api: ComponentShadowAPI<Info>; };
export type ComponentShadowFuncWithout<Info extends Partial<ComponentInfo> = {}> =
    ((props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentShadow<Info>, contextAPI?: never) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info["props"]>, NonNullable<Info["state"]>>) & { Info?: Info; api: ComponentShadowAPI<Info>; };


// - Class types - //

export interface ComponentShadowType<Info extends Partial<ComponentInfo> = {}> extends ComponentType<Info> {
    api: ComponentShadowAPI<Info>;
}
/** There is no actual pre-existing class for ComponentShadow. Instead a new class is created when createShadow is used. */
export interface ComponentShadow<Info extends Partial<ComponentInfo> = {}> extends Component<Info> { }
/** Type for Component with ComponentContextAPI. Also includes the signals that ComponentContextAPI brings. */
export interface ComponentShadowWith<Info extends Partial<ComponentInfo> = {}> extends ComponentShadow<Info> {
    contextAPI: ComponentContextAPI<Info["contexts"] & {}>;
}


// - Class - //

/** This allows to access the instanced components as well as to use signal listeners (with component extra param as the first one), and trigger updates. */
export class ComponentShadowAPI<Info extends Partial<ComponentInfo> = {}> extends SignalBoy<ComponentShadowSignals<Info>> {
    
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

    /** The onListener callback is required by ComponentShadowAPI's functionality for connecting signals to components fluently. */
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
 * - Shadow components are normal components, but they have a ComponentShadowAPI attached as component.constructor.api.
 * - This allows the components to be tracked and managed by the parenting scope who creates the unique component class (whose instances are tracked).
*/
export function createShadow<Info extends Partial<ComponentInfo> = {}>(CompClass: ComponentType<Info>, signals?: Partial<ComponentShadowSignals<Info>> | null, name?: string): ComponentShadowType<Info>;
export function createShadow<Info extends Partial<ComponentInfo> = {}>(funcOrClass: ComponentTypeEither, signals?: Partial<ComponentShadowSignals> | null, name: string = funcOrClass.name) {
    // Exceptionally we also support feeding in a class here. To add support for being a shadow.
    const Shadow = funcOrClass["MIX_DOM_CLASS"] ? { [name]: class extends (funcOrClass as ComponentType) {} }[name] as ComponentShadowType<Info> : createComponent(funcOrClass as any, name) as ComponentShadowFunc<Info>;
    Shadow.api = new ComponentShadowAPI();
    if (signals)
        for (const sName in signals)
            Shadow.api.listenTo(sName as any, signals[sName] as any);
    return Shadow;
}

/** Create a shadow component with ComponentContextAPI by func and omitting the first initProps: (component, contextAPI). The contextAPI is instanced regardless of argument count. */
export const createShadowWith = <Info extends Partial<ComponentInfo> = {}>(func: (component: ComponentShadow<Info>, contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info["props"]>, NonNullable<Info["state"]>>, signals?: Partial<ComponentShadowSignals> | null, name: string = func.name): ComponentShadowFuncWith<Info> => {
    // Create and attach ComponentShadowAPI.
    const Shadow = createComponentWith(func, name) as ComponentShadowFuncWith<Info>;
    Shadow.api = new ComponentShadowAPI();
    if (signals)
        for (const sName in signals)
            Shadow.api.listenTo(sName as any, signals[sName] as any);
    return Shadow;
}
