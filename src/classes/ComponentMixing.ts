

// - Imports - //

import { _Lib } from "../static/_Lib";
import { _Find } from "../static/_Find";
import {
    Dictionary,
    MixDOMDoubleRenderer,
    MixDOMRenderOutput,
    Intersect,
} from "../static/_Types";
import { newDef } from "../static/_Defs";
import { MixDOMContent } from "../MixDOM";
import { SpreadFunc } from "./ComponentSpread";
import {
    Component,
    ComponentFunc,
    ComponentFuncWith,
    ComponentInfo,
    ComponentType,
    ComponentTypeAny,
    ComponentTypeWithClass,
    ComponentWith,
    GetComponentFuncInfo,
    GetComponentInfo,
    ComponentContextAPI
} from "./Component";
import { ComponentShadowFunc, ComponentShadowAPI } from "./ComponentShadow";
import { ComponentWiredFunc, ComponentWiredAPI } from "./ComponentWired";


// - Helper to merge ComponentShadowAPI and ComponentWiredAPIs - //

/** This creates a new ComponentShadowAPI or ComponentWiredAPI and merges updateModes and signals.
 * - If is a ComponentWiredAPI also attaches the last builtProps member, and onBuildProps and onMixProps methods.
 */
export function mergeShadowWiredAPIs(apis: Array<ComponentShadowAPI>): ComponentShadowAPI;
export function mergeShadowWiredAPIs(apis: Array<ComponentWiredAPI>): ComponentWiredAPI;
export function mergeShadowWiredAPIs(apis: Array<ComponentShadowAPI | ComponentWiredAPI>): ComponentShadowAPI | ComponentWiredAPI {
    // Create new API.
    const isWired = apis.some(api => api instanceof ComponentWiredAPI);
    const finalAPI = (isWired ? new ComponentWiredAPI() : new ComponentShadowAPI()) as ComponentWiredAPI; // For easier typing below.
    // Combine infos.
    for (const api of apis) {
        // Merge update modes.
        if (api.updateModes) {
            if (!finalAPI.updateModes)
                finalAPI.updateModes = {};
            for (const type in api.updateModes)
                finalAPI.updateModes[type] = { ...finalAPI.updateModes[type], ...api.updateModes[type] };
        }
        // Combine listeners.
        for (const signalName in api.signals)
            finalAPI.signals[signalName] = [ ...finalAPI.signals[signalName] || [], ...api.signals[signalName] ];
        // ComponentWiredAPI specials.
        // .. Note that this kind of mixing builtProps, onBuildProps and onMixProps from here and there is kind of messy.
        // .. However, very likely this is never used like this. Furthermore this whole function is also probably almost never used.
        if (api instanceof ComponentWiredAPI) {
            // Use the latest builtProps.
            if (api.builtProps)
                finalAPI.builtProps = api.builtProps;
            // Use the latest callbacks.
            if (api.onBuildProps)
                finalAPI.onBuildProps = api.onBuildProps;
            if (api.onMixProps)
                finalAPI.onMixProps = api.onMixProps;
        }
    }
    // Return the combined API.
    return finalAPI;
}


// - Create mixable funcs & classes - //

// Types for combining and extending Component functions.
export type ExtendComponentFunc<Func extends ComponentFunc, Info extends Partial<ComponentInfo>> = [Func] extends [ { _Required?: ComponentFunc | undefined; }] ? ComponentFuncMixable<Func["_Required"] & {}, Func["_Info"] & Info> : ComponentFunc<Func["_Info"] & Info>;
export type ComponentFuncExtends<A extends ComponentFunc, B extends ComponentFunc> =
    [B] extends [{ _Required?: ComponentFunc | undefined; }] ?
        [Component<A["_Info"] & {}> & (A["_Info"] & { class?: {}})["class"] & {}] extends [Component<(B["_Required"] & { _Info?: {}; })["_Info"] & {}> & ((B["_Required"] & { _Info?: {}; })["_Info"] & { class?: {}})["class"] & {}] ?
            ComponentFunc
        : never
    : ComponentFunc;
export type ReadComponentClassInfo<Comp extends Component> = Omit<Comp, keyof Component>;

// export type ComponentFuncExtendsType<A extends ComponentType, B extends ComponentFunc> = [B] extends [ComponentFuncMixable] ? [ComponentFunc<InstanceType<A>["_Info"]>] extends [B["_Required"]] ? ComponentFunc : never : ComponentFunc;
export type ComponentFuncExtendsType<A extends ComponentType, B extends ComponentFunc> = [B] extends [{ _Required?: ComponentFunc | undefined; }] ? [A] extends [ComponentTypeWithClass<(B["_Required"] & { _Info?: {}; })["_Info"] & {}>] ? ComponentFunc : never : ComponentFunc;
export type ComponentFuncRequires<RequiresInfo extends Partial<ComponentInfo> = {}, OwnInfo extends Partial<ComponentInfo> = {}> = ComponentFunc<RequiresInfo & OwnInfo> & { _Required?: ComponentFunc<RequiresInfo>; };
export type ComponentFuncMixable<RequiredFunc extends ComponentFunc = ComponentFunc, OwnInfo extends Partial<ComponentInfo> = {}> = ComponentFunc<GetComponentFuncInfo<RequiredFunc> & OwnInfo> & { _Required?: RequiredFunc; };
export type CombineComponentFuncs<
    A extends ComponentFunc = ComponentFunc,
    B extends ComponentFunc = ComponentFunc,
    C extends ComponentFunc = ComponentFunc,
    D extends ComponentFunc = ComponentFunc,
    E extends ComponentFunc = ComponentFunc,
    F extends ComponentFunc = ComponentFunc,
    G extends ComponentFunc = ComponentFunc,
    H extends ComponentFunc = ComponentFunc,
    I extends ComponentFunc = ComponentFunc,
    J extends ComponentFunc = ComponentFunc,
> = ComponentFunc<GetComponentFuncInfo<A> & GetComponentFuncInfo<B> & GetComponentFuncInfo<C> & GetComponentFuncInfo<D> & GetComponentFuncInfo<E> & GetComponentFuncInfo<F> & GetComponentFuncInfo<G> & GetComponentFuncInfo<H> & GetComponentFuncInfo<I> & GetComponentFuncInfo<J>>;
export type CombineInfosFromComponentFuncs<
    A extends ComponentFunc = ComponentFunc,
    B extends ComponentFunc = ComponentFunc,
    C extends ComponentFunc = ComponentFunc,
    D extends ComponentFunc = ComponentFunc,
    E extends ComponentFunc = ComponentFunc,
    F extends ComponentFunc = ComponentFunc,
    G extends ComponentFunc = ComponentFunc,
    H extends ComponentFunc = ComponentFunc,
    I extends ComponentFunc = ComponentFunc,
    J extends ComponentFunc = ComponentFunc,
> = GetComponentFuncInfo<A> & GetComponentFuncInfo<B> & GetComponentFuncInfo<C> & GetComponentFuncInfo<D> & GetComponentFuncInfo<E> & GetComponentFuncInfo<F> & GetComponentFuncInfo<G> & GetComponentFuncInfo<H> & GetComponentFuncInfo<I> & GetComponentFuncInfo<J> & {};


/** This mixes many component functions together. Each should look like: `(initProps, component, cApi?) => MixDOMRenderOutput | MixDOMDoubleRenderer`.
 * - Note that this only "purely" mixes the components together (on the initial render call).
 *      * By default does not put a renderer function in the end but just passes last output (preferring funcs, tho). If you want make sure a renderer is in the end, put last param to true: `(...funcs, true)`
 *      * Compare this with `mixComponentFuncsWith(..., composer)`, that always returns a renderer. (And its last argument is auto-typed based on all previous.)
 * - Each mixable func can also have pre-requirements if typed with `ComponentFuncMixable<RequiredFunc, OwnInfo>` - the typing supports up to 8 funcs and requirements can be filled by any func before.
 *      * Note that you should only use `ComponentFunc` or `ComponentFuncMixable`. Not supported for spread functions (makes no sense) nor component classes (not supported for this flow, see mixComponentClassFuncs instead).
 *      * You should type each function most often with `ComponentFunc<Info>` type or `MixDOM.component<Info>()` method. If you leave a function and its params totally untyped, it will break the typing flow. But next one can correct it (at least partially).
 * - This also supports handling contextual needs (by a func having 3 args) as well as attaching / merging ComponentShadowAPI | ComponentWiredAPI.
 * - Note that this does not wrap components one after another (like HOCs). Instead only their initializing closure is used, and the last active renderer.
 *      * Often the purpose is to extend props, state and/or class - especially class data becomes useful to hold info from different closures. Even partial renderers.
 *      * Note that each component func can still override state with: `component.state = { ...myStuff }`. The process detects changes and combines the states together if changed.
 */
export function mixComponentFuncs<A extends ComponentFuncExtends<ComponentFunc<{}>, A>>(a: A, useRenderer?: boolean): A;
export function mixComponentFuncs<A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>>(a: A, b: B, useRenderer?: boolean): CombineComponentFuncs<A, B>;
export function mixComponentFuncs<A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>>(a: A, b: B, c: C, useRenderer?: boolean): CombineComponentFuncs<A, B, C>;
export function mixComponentFuncs<A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>>(a: A, b: B, c: C, d: D, useRenderer?: boolean): CombineComponentFuncs<A, B, C, D>;
export function mixComponentFuncs<A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>>(a: A, b: B, c: C, d: D, e: E, useRenderer?: boolean): CombineComponentFuncs<A, B, C, D, E>;
export function mixComponentFuncs<A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, F extends ComponentFuncExtends<A & B & C & D & E, F>>(a: A, b: B, c: C, d: D, e: E, f: F, useRenderer?: boolean): CombineComponentFuncs<A, B, C, D, E, F>;
export function mixComponentFuncs<A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, F extends ComponentFuncExtends<A & B & C & D & E, F>, G extends ComponentFuncExtends<A & B & C & D & E & F, G>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, useRenderer?: boolean): CombineComponentFuncs<A, B, C, D, E, F, G>;
export function mixComponentFuncs<A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, F extends ComponentFuncExtends<A & B & C & D & E, F>, G extends ComponentFuncExtends<A & B & C & D & E & F, G>, H extends ComponentFuncExtends<A & B & C & D & E & F & G, H>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, useRenderer?: boolean): CombineComponentFuncs<A, B, C, D, E, F, G, H>;
export function mixComponentFuncs(...args: [...funcs: ComponentFunc[], useRenderer: boolean | undefined] | ComponentFunc[]) {
    // Parse args.
    const nArgs = args.length;
    const useRenderer = args[nArgs - 1] === true;
    const funcs = (useRenderer || !args[nArgs - 1] ? args.slice(0, nArgs - 1) : args) as ComponentFunc[];
    // Go through each.
    const CompFunc = (initProps: Dictionary, component: Component | ComponentWith, cAPI?: ComponentContextAPI) => {
        // Collect the last non-null output as the final outcome.
        // .. Prefer any functions, put if not provided use the outcome. We anyway return a renderer func.
        let lastOutput: MixDOMDoubleRenderer | MixDOMRenderOutput = null;
        for (const func of funcs as ComponentFunc[]) {
            // Skip empties. In case happens for some reason.
            if (!func)
                continue;
            // Collect state and meta before.
            const state = component.state;
            // Run the initial closure.
            const output = (func as ComponentFuncWith)(initProps, component as ComponentWith, cAPI as ComponentContextAPI);
            // If returned a function (or lastOutput wasn't a func), store the output.
            if (typeof output === "function" || typeof lastOutput !== "function")
                lastOutput = output;
            // Combine together old and new state and meta. As each can still do component.state = { myStuff } 
            if (state !== component.state && component.state)
                component.state = { ...(state || {}), ...component.state };
        }
        // Just return the last output. Don't force a renderer here - this is for pure mixing purposes.
        return useRenderer ? () => lastOutput : lastOutput;
    }
    // Handle APIs: Check if any had 3 arguments for ContextAPI, and if any had ComponentShadowAPI | ComponentWiredAPI attached.
    let hadContext = false;
    const apis = (funcs as Array<ComponentShadowFunc | ComponentWiredFunc>).filter(func => (hadContext = hadContext || func.length > 2) && false || func.api).map(func => func.api);
    // Create and return final component func, and attach ComponentShadowAPI | ComponentWiredAPI.
    const FinalFunc = hadContext ? (initProps: Dictionary, component: ComponentWith, cAPI: ComponentContextAPI) => CompFunc(initProps, component, cAPI) : (initProps: Dictionary, component: Component) => CompFunc(initProps, component);
    if (apis[0])
        (FinalFunc as ComponentShadowFunc | ComponentWiredFunc).api = mergeShadowWiredAPIs(apis); // If had even one, we should create a new one - as this is a new unique component.
    return FinalFunc;
}


/** This mixes many component functions together. Each should look like: (initProps, component, cApi?) => MixDOMRenderOutput | MixDOMDoubleRenderer.
 * - Unlike mixComponentFuncs, the last argument is a mixable func that should compose all together, and its typing comes from all previous combined.
 *      * If you want to add extra props to the auto typed composer you can add them as an extra last argument: `{} as { props: { someStuff: boolean; } }`.
 *      * Alternatively you can add them to the 2nd last function with: `SomeMixFunc as ExtendComponentFunc<typeof SomeMixFunc & ExtraInfo>`.
 * - Each mixable func can also have pre-requirements if typed with `ComponentFuncMixable<RequiredFunc, OwnInfo>` - the typing supports up to 8 funcs and requirements can be filled by any func before.
 *      * Note that you should only use ComponentFunc or ComponentFuncMixable. Not supported for spread functions (makes no sense) nor component classes (not supported).
 *      * You should type each function most often with ComponentFunc<Info> or MixDOM.component<Info>(). If you leave a function and its params totally untyped, it will break the typing flow. But next one can correct it (at least partially).
 * - Note that this does not wrap components one after another (like HOCs). Instead only their initializing closure is used, and the last active renderer.
 *      * Often the purpose is to extend props, state and/or class - especially class data becomes useful to hold info from different closures. Even partial renderers.
 *      * Note that each component func can still override state with: `component.state = { ...myStuff }`. The process detects changes and combines the states together if changed.
 */
// export function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, Mixed extends ExtendComponentFunc<A, ExtraInfo>>(a: A, composer: Mixed, extraInfo?: ExtraInfo): Mixed;
// export function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<A, B> & ExtraInfo>>(a: A, b: B, composer: Mixed, extraInfo?: ExtraInfo): Mixed;
// export function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<A, B, C> & ExtraInfo>>(a: A, b: B, c: C, composer: Mixed, extraInfo?: ExtraInfo): Mixed;
// export function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D> & ExtraInfo>>(a: A, b: B, c: C, d: D, composer: Mixed, extraInfo?: ExtraInfo): Mixed;
// export function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D, E> & ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, composer: Mixed, extraInfo?: ExtraInfo): Mixed;
// export function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, F extends ComponentFuncExtends<A & B & C & D & E, F>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D, E, F> & ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, composer: Mixed, extraInfo?: ExtraInfo): Mixed;
// export function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, F extends ComponentFuncExtends<A & B & C & D & E, F>, G extends ComponentFuncExtends<A & B & C & D & E & F, G>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D, E, F, G> & ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, composer: Mixed, extraInfo?: ExtraInfo): Mixed;
// export function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, F extends ComponentFuncExtends<A & B & C & D & E, F>, G extends ComponentFuncExtends<A & B & C & D & E & F, G>, H extends ComponentFuncExtends<A & B & C & D & E & F & G, H>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D, E, F, G, H> & ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, composer: Mixed, extraInfo?: ExtraInfo): Mixed;

// We cannot reuse the Mixed for the return if we want the return to be `Func & { _Info: Info }`;
export function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, Mixed extends ExtendComponentFunc<A, ExtraInfo>>(a: A, composer: Mixed, extraInfo?: ExtraInfo): ExtendComponentFunc<A, ExtraInfo>;
export function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<A, B> & ExtraInfo>>(a: A, b: B, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<CombineInfosFromComponentFuncs<A, B> & ExtraInfo>;
export function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<A, B, C> & ExtraInfo>>(a: A, b: B, c: C, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<CombineInfosFromComponentFuncs<A, B, C> & ExtraInfo>;
export function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D> & ExtraInfo>>(a: A, b: B, c: C, d: D, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D> & ExtraInfo>;
export function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D, E> & ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D, E> & ExtraInfo>;
export function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, F extends ComponentFuncExtends<A & B & C & D & E, F>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D, E, F> & ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D, E, F> & ExtraInfo>;
export function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, F extends ComponentFuncExtends<A & B & C & D & E, F>, G extends ComponentFuncExtends<A & B & C & D & E & F, G>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D, E, F, G> & ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D, E, F, G> & ExtraInfo>;
export function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, F extends ComponentFuncExtends<A & B & C & D & E, F>, G extends ComponentFuncExtends<A & B & C & D & E & F, G>, H extends ComponentFuncExtends<A & B & C & D & E & F & G, H>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D, E, F, G, H> & ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D, E, F, G, H> & ExtraInfo>;
export function mixComponentFuncsWith(...funcs: any[]): ComponentFunc {
    // Remove the typing object.
    const nFuncs = funcs.length;
    if (typeof funcs[nFuncs - 1] !== "function")
        return (mixComponentFuncs as any)(...funcs.slice(0, nFuncs - 1), true);
    // Just pass all.
    return (mixComponentFuncs as any)(...funcs, true);
}



// - Types for Mixins - //

// Types for combining and extending Component clases.
export type ComponentMixinType<Info extends Partial<ComponentInfo> = {}, RequiresInfo extends Partial<ComponentInfo> = {}> = (Base: ComponentTypeWithClass<RequiresInfo>) => ComponentTypeWithClass<RequiresInfo & Info>;
export type ComponentMixinExtends<A extends ComponentMixinType, B extends ComponentMixinType> = [ReturnType<A>] extends [Parameters<B>[0]] ? ComponentMixinType : never;
export type ComponentMixinExtendsInfo<Info extends Partial<ComponentInfo>, Ext extends ComponentMixinType> = [ComponentType<Info>] extends [Parameters<Ext>[0]] ? ComponentMixinType : never;
export type ComponentMixinExtendsType<A extends ComponentType, B extends ComponentMixinType> = [A] extends [Parameters<B>[0]] ? ComponentMixinType : never;
// This is not really used.
export type CombineMixins<
    A extends ComponentMixinType = ComponentMixinType,
    B extends ComponentMixinType = ComponentMixinType,
    C extends ComponentMixinType = ComponentMixinType,
    D extends ComponentMixinType = ComponentMixinType,
    E extends ComponentMixinType = ComponentMixinType,
    F extends ComponentMixinType = ComponentMixinType,
    G extends ComponentMixinType = ComponentMixinType,
    H extends ComponentMixinType = ComponentMixinType,
> = ComponentMixinType<
    ReturnType<A>["_Info"] & ReturnType<B>["_Info"] & ReturnType<C>["_Info"] & ReturnType<D>["_Info"] & ReturnType<E>["_Info"] & ReturnType<F>["_Info"] & ReturnType<G>["_Info"] & ReturnType<H>["_Info"] & {},
    Parameters<A>[0]["_Info"] & {}
>;

export type GetComponentInfoFromMixins<
    A extends ComponentMixinType = ComponentMixinType,
    B extends ComponentMixinType = ComponentMixinType,
    C extends ComponentMixinType = ComponentMixinType,
    D extends ComponentMixinType = ComponentMixinType,
    E extends ComponentMixinType = ComponentMixinType,
    F extends ComponentMixinType = ComponentMixinType,
    G extends ComponentMixinType = ComponentMixinType,
    H extends ComponentMixinType = ComponentMixinType,
> = ReturnType<A>["_Info"] & ReturnType<B>["_Info"] & ReturnType<C>["_Info"] & ReturnType<D>["_Info"] & ReturnType<E>["_Info"] & ReturnType<F>["_Info"] & ReturnType<G>["_Info"] & ReturnType<H>["_Info"] & {};

// Type extending for classes.
// export type ExtendComponentType<Type extends ComponentType, Info extends Partial<ComponentInfo>> = [Type] extends [ { required: ComponentType }] ? ComponentTypeMixable<Type["required"], Type["_Info"] & Info> : Type["_Info"] & Info;
// export type ComponentTypeExtends<A extends ComponentType, B extends ComponentType> = [B] extends [ComponentTypeMixable] ? [A] extends [B["required"]] ? ComponentType : never : ComponentType;
// export type ComponentTypeMixable<PreCompType extends ComponentType = ComponentType, PostInfo extends Partial<ComponentInfo> = {}> = ComponentType<PreCompType["_Info"] & PostInfo> & { required?: PreCompType; };
// export type CombineComponentTypes<
//     A extends ComponentType = ComponentType,
//     B extends ComponentType = ComponentType,
//     C extends ComponentType = ComponentType,
//     D extends ComponentType = ComponentType,
//     E extends ComponentType = ComponentType,
//     F extends ComponentType = ComponentType,
//     G extends ComponentType = ComponentType,
//     H extends ComponentType = ComponentType,
// > = ComponentType<A["_Info"] & B["_Info"] & C["_Info"] & D["_Info"] & E["_Info"] & F["_Info"] & G["_Info"] & H["_Info"]>;
// export type GetComponentInfoFromTypes<
//     A extends ComponentType = ComponentType,
//     B extends ComponentType = ComponentType,
//     C extends ComponentType = ComponentType,
//     D extends ComponentType = ComponentType,
//     E extends ComponentType = ComponentType,
//     F extends ComponentType = ComponentType,
//     G extends ComponentType = ComponentType,
//     H extends ComponentType = ComponentType,
// > = A["_Info"] & B["_Info"] & C["_Info"] & D["_Info"] & E["_Info"] & F["_Info"] & G["_Info"] & H["_Info"];

/** This returns the original function (to create a mixin class) back but simply helps with typing. 
 * - The idea of a mixin is this: `(Base) => class extends Base { ... }`. So it creates a new class that extends the provided base class.
 *     * In the context of Components the idea is that the Base is Component and then different features are added to it.
 *     * Optionally, when used with mixComponentMixins the flow also supports adding requirements (in addition to that the Base is a Component class).
 * - To use this method: `const MyMixin = createMixin<RequiresInfo, MyMixinInfo>(Base => class _MyMixin extends Base { ... }`
 *     * Without the method: `const MyMixin = (Base: ComponentTypeWithClass<RequireInfo>) => class _MyMixin extends (Base as ComponentTypeWithClass<RequireInfo & MyMixinInfo>) { ... }`
 *     * So the trick of this method is simply that the returned function still includes `(Base: Required)`, but _inside_ the func it looks like `(Base: Required & Added)`.
*/
export function createMixin<Info extends Partial<ComponentInfo>, RequiresInfo extends Partial<ComponentInfo> = {}>( func: (Base: ComponentTypeWithClass<RequiresInfo & Info>) => ComponentTypeWithClass<RequiresInfo & Info> ): (Base: ComponentTypeWithClass<RequiresInfo>) => ComponentTypeWithClass<RequiresInfo & Info> { return func as any; }

/** Mix many mixins together into using a Component class as the basis to mix on: `(MyMixin1, MyMixin2, ...)`.
 * - Note. The last mixin with a render method defined is used as the render method of the combined class.
 * - Note. If you want to define a custom base class (extending Component) you can use `mixComponentClassMixins` method whose first argument is a base class.
 * - For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
*/
// Using two different funcs for best typing experience and avoiding compiling and circular problems.
// Types for only mixins.
export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, Info extends GetComponentInfoFromMixins<A>>(a: A): ComponentType<Info>;
export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>>(a: A, b: B): ComponentType<GetComponentInfoFromMixins<A, B>>;
export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>>(a: A, b: B, c: C): ComponentType<GetComponentInfoFromMixins<A, B, C>>;
export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>>(a: A, b: B, c: C, d: D): ComponentType<GetComponentInfoFromMixins<A, B, C, D>>;
export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D>, E>>(a: A, b: B, c: C, d: D, e: E): ComponentType<GetComponentInfoFromMixins<A, B, C, D, E>>;
export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E>, F>>(a: A, b: B, c: C, d: D, e: E, f: F): ComponentType<GetComponentInfoFromMixins<A, B, C, D, E, F>>;
export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E>, F>, G extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E, F>, G>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G): ComponentType<GetComponentInfoFromMixins<A, B, C, D, E, F, G>>;
export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E>, F>, G extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E, F>, G>, H extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E, F, G>, H>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H): ComponentType<GetComponentInfoFromMixins<A, B, C, D, E, F, G, H>>;
// The actual func. Note that its implementation actually supports the first argument being either: a component base class or a mixin.
export function mixComponentMixins(...args: any[]) {
    // Loop each and extend.
    const CustomBase = (args[0] as ComponentType).MIX_DOM_CLASS ? args[0] : null;
    let BaseClass: ComponentType = CustomBase || Component;
    for (const mixin of (CustomBase ? args.slice(1) : args) as ComponentMixinType[])
        BaseClass = mixin(BaseClass);
    // Return the final class.
    return BaseClass;
}

/** Mix many mixins together into using a Component class as the basis to mix on: `(MyMixin1, MyMixin2, ..., ComposerMixin)`
 * - Note. The last mixin is assumed to be the one to do the rendering and its type is combined from all the previous + the optional extra info given as the very last argument.
 * - This is like mixComponentFuncsWith but for mixins. On the javascript this function is teh same as MixDOM.mixMixins.
 */
export function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentMixinExtends<ComponentMixinType, A>, Info extends GetComponentInfoFromMixins<A> & ExtraInfo>(a: A, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
export function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, Info extends GetComponentInfoFromMixins<A, B> & ExtraInfo>(a: A, b: B, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
export function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, Info extends GetComponentInfoFromMixins<A, B, C> & ExtraInfo>(a: A, b: B, c: C, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
export function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, Info extends GetComponentInfoFromMixins<A, B, C, D> & ExtraInfo>(a: A, b: B, c: C, d: D, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
export function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D>, E>, Info extends GetComponentInfoFromMixins<A, B, C, D, E> & ExtraInfo>(a: A, b: B, c: C, d: D, e: E, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
export function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E>, F>, Info extends GetComponentInfoFromMixins<A, B, C, D, E, F> & ExtraInfo>(a: A, b: B, c: C, d: D, e: E, f: F, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
export function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E>, F>, G extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E, F>, G>, Info extends GetComponentInfoFromMixins<A, B, C, D, E, F, G> & ExtraInfo>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
export function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E>, F>, G extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E, F>, G>, H extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E, F, G>, H>, Info extends GetComponentInfoFromMixins<A, B, C, D, E, F, G, H> & ExtraInfo>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
// The actual func. Note that its implementation actually supports the first argument being either: a component base class or a mixin.
export function mixComponentMixinsWith(...args: any[]) {
    // Remove the typing object.
    const nArgs = args.length;
    if (typeof args[nArgs - 1] !== "function")
        return (mixComponentMixins as any)(...args.slice(0, nArgs - 1));
    // Just pass all.
    return (mixComponentMixins as any)(args);
}


/** Mix many mixins together with a custom Component class as the basis to mix on: `(MyClass, MyMixin1, MyMixin2, ...)`.
 * - Note. The last mixin with a render method defined is used as the render method of the combined class.
 * - Note. If you don't want to define a custom component class as the base, you can use the `mixComponentMixins` function instead (which uses the Component class). These two funcs are split to get better typing experience.
 * - For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
*/
export function mixComponentClassMixins<Base extends ComponentType, A extends ComponentMixinExtendsType<Base, A>>(base: Base, a: A): ReturnType<A>;
export function mixComponentClassMixins<Base extends ComponentType, A extends ComponentMixinExtendsInfo<Base["_Info"] & {}, A>, B extends ComponentMixinExtendsInfo<Base["_Info"] & ReturnType<A>["_Info"] & {}, B>>(base: Base, a: A, b: B): ComponentType<Base["_Info"] & GetComponentInfoFromMixins<A, B>>;
export function mixComponentClassMixins<Base extends ComponentType, A extends ComponentMixinExtendsInfo<Base["_Info"] & {}, A>, B extends ComponentMixinExtendsInfo<Base["_Info"] & ReturnType<A>["_Info"] & {}, B>, C extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B>, C>>(base: Base, a: A, b: B, c: C): ComponentType<Base["_Info"] & GetComponentInfoFromMixins<A, B, C>>;
export function mixComponentClassMixins<Base extends ComponentType, A extends ComponentMixinExtendsInfo<Base["_Info"] & {}, A>, B extends ComponentMixinExtendsInfo<Base["_Info"] & ReturnType<A>["_Info"] & {}, B>, C extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C>, D>>(base: Base, a: A, b: B, c: C, d: D): ComponentType<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D>>;
export function mixComponentClassMixins<Base extends ComponentType, A extends ComponentMixinExtendsInfo<Base["_Info"] & {}, A>, B extends ComponentMixinExtendsInfo<Base["_Info"] & ReturnType<A>["_Info"] & {}, B>, C extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D>, E>>(base: Base, a: A, b: B, c: C, d: D, e: E): ComponentType<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E>>;
export function mixComponentClassMixins<Base extends ComponentType, A extends ComponentMixinExtendsInfo<Base["_Info"] & {}, A>, B extends ComponentMixinExtendsInfo<Base["_Info"] & ReturnType<A>["_Info"] & {}, B>, C extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E>, F>>(base: Base, a: A, b: B, c: C, d: D, e: E, f: F): ComponentType<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E, F>>;
export function mixComponentClassMixins<Base extends ComponentType, A extends ComponentMixinExtendsInfo<Base["_Info"] & {}, A>, B extends ComponentMixinExtendsInfo<Base["_Info"] & ReturnType<A>["_Info"] & {}, B>, C extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E>, F>, G extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E, F>, G>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G): ComponentType<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E, F, G>>;
export function mixComponentClassMixins<Base extends ComponentType, A extends ComponentMixinExtendsInfo<Base["_Info"] & {}, A>, B extends ComponentMixinExtendsInfo<Base["_Info"] & ReturnType<A>["_Info"] & {}, B>, C extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E>, F>, G extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E, F>, G>, H extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E, F, G>, H>>(base: Base, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H): ComponentType<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E, F, G, H>>;
export function mixComponentClassMixins(...args: any[]) { return (mixComponentMixins as any)(...args); }


// // Using two sets of overloads, one without base and one with base. This is fine, but typing experience is worse as the whole func is redlined.
// // 
// // Types for only mixins.
// export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, Info extends GetComponentInfoFromMixins<A>>(a: A): ComponentType<Info>;
// export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>>(a: A, b: B): ComponentType<GetComponentInfoFromMixins<A, B>>;
// export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>>(a: A, b: B, c: C): ComponentType<GetComponentInfoFromMixins<A, B, C>>;
// export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>>(a: A, b: B, c: C, d: D): ComponentType<GetComponentInfoFromMixins<A, B, C, D>>;
// export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D>, E>>(a: A, b: B, c: C, d: D, e: E): ComponentType<GetComponentInfoFromMixins<A, B, C, D, E>>;
// export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E>, F>>(a: A, b: B, c: C, d: D, e: E, f: F): ComponentType<GetComponentInfoFromMixins<A, B, C, D, E, F>>;
// export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E>, F>, G extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E, F>, G>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G): ComponentType<GetComponentInfoFromMixins<A, B, C, D, E, F, G>>;
// export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E>, F>, G extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E, F>, G>, H extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E, F, G>, H>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H): ComponentType<GetComponentInfoFromMixins<A, B, C, D, E, F, G, H>>;
// // Note that these types with Base make the typing experience a bit worse. Without them could see which arg is the problem, with these added the whole func will be redlined.
// export function mixComponentMixins<Base extends ComponentType, A extends ComponentMixinExtendsType<Base, A>>(base: Base, a: A): ReturnType<A>;
// export function mixComponentMixins<Base extends ComponentType, A extends ComponentMixinExtendsInfo<Base["_Info"] & {}, A>, B extends ComponentMixinExtendsInfo<Base["_Info"] & ReturnType<A>["_Info"], B>>(base: Base, a: A, b: B): ComponentType<Base["_Info"] & GetComponentInfoFromMixins<A, B>>;
// export function mixComponentMixins<Base extends ComponentType, A extends ComponentMixinExtendsInfo<Base["_Info"] & {}, A>, B extends ComponentMixinExtendsInfo<Base["_Info"] & ReturnType<A>["_Info"], B>, C extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B>, C>>(base: Base, a: A, b: B, c: C): ComponentType<Base["_Info"] & GetComponentInfoFromMixins<A, B, C>>;
// export function mixComponentMixins<Base extends ComponentType, A extends ComponentMixinExtendsInfo<Base["_Info"] & {}, A>, B extends ComponentMixinExtendsInfo<Base["_Info"] & ReturnType<A>["_Info"], B>, C extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C>, D>>(base: Base, a: A, b: B, c: C, d: D): ComponentType<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D>>;
// export function mixComponentMixins<Base extends ComponentType, A extends ComponentMixinExtendsInfo<Base["_Info"] & {}, A>, B extends ComponentMixinExtendsInfo<Base["_Info"] & ReturnType<A>["_Info"], B>, C extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D>, E>>(base: Base, a: A, b: B, c: C, d: D, e: E): ComponentType<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E>>;
// export function mixComponentMixins<Base extends ComponentType, A extends ComponentMixinExtendsInfo<Base["_Info"] & {}, A>, B extends ComponentMixinExtendsInfo<Base["_Info"] & ReturnType<A>["_Info"], B>, C extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E>, F>>(base: Base, a: A, b: B, c: C, d: D, e: E, f: F): ComponentType<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E, F>>;
// export function mixComponentMixins<Base extends ComponentType, A extends ComponentMixinExtendsInfo<Base["_Info"] & {}, A>, B extends ComponentMixinExtendsInfo<Base["_Info"] & ReturnType<A>["_Info"], B>, C extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E>, F>, G extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E, F>, G>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G): ComponentType<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E, F, G>>;
// export function mixComponentMixins<Base extends ComponentType, A extends ComponentMixinExtendsInfo<Base["_Info"] & {}, A>, B extends ComponentMixinExtendsInfo<Base["_Info"] & ReturnType<A>["_Info"], B>, C extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E>, F>, G extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E, F>, G>, H extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E, F, G>, H>>(base: Base, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H): ComponentType<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E, F, G, H>>;


// // Using merged types. These have a problem upon compiling: they are circular.
// 
// export function mixComponentMixins<
//     A extends ([A] extends [ComponentMixinType] ? ComponentMixinExtends<ComponentMixinType, ComponentMixinType & A> : ComponentType),
//     AInfo extends ([A] extends [ComponentMixinType] ? ReturnType<A>["_Info"] : InstanceType<ComponentType & A>["_Info"]),
//     B extends [A] extends [ComponentMixinType] ? ComponentMixinExtends<A, B> : ComponentMixinExtendsInfo<AInfo, B>
// >(a: A, b: B): ComponentType<AInfo & InstanceType<ReturnType<B>>["_Info"]>;
// export function mixComponentMixins<
//     A extends ([A] extends [ComponentMixinType] ? ComponentMixinExtends<ComponentMixinType, ComponentMixinType & A> : ComponentType),
//     AInfo extends ([A] extends [ComponentMixinType] ? ReturnType<A>["_Info"] : InstanceType<ComponentType & A>["_Info"]),
//     B extends [A] extends [ComponentMixinType] ? ComponentMixinExtends<A, B> : ComponentMixinExtendsInfo<AInfo, B>,
//     C extends ComponentMixinExtendsInfo<AInfo & InstanceType<ReturnType<B>>["_Info"], C>,
// >(a: A, b: B, c: C): ComponentType<AInfo & GetComponentInfoFromMixins<B, C>>;
// export function mixComponentMixins<
//     A extends ([A] extends [ComponentMixinType] ? ComponentMixinExtends<ComponentMixinType, ComponentMixinType & A> : ComponentType),
//     AInfo extends ([A] extends [ComponentMixinType] ? ReturnType<A>["_Info"] : InstanceType<ComponentType & A>["_Info"]),
//     B extends [A] extends [ComponentMixinType] ? ComponentMixinExtends<A, B> : ComponentMixinExtendsInfo<AInfo, B>,
//     C extends ComponentMixinExtendsInfo<AInfo & InstanceType<ReturnType<B>>["_Info"], C>,
//     D extends ComponentMixinExtendsInfo<AInfo & GetComponentInfoFromMixins<B, C>, D>
// >(a: A, b: B, c: C, d: D): ComponentType<AInfo & GetComponentInfoFromMixins<B, C, D>>;
// export function mixComponentMixins<
//     A extends ([A] extends [ComponentMixinType] ? ComponentMixinExtends<ComponentMixinType, ComponentMixinType & A> : ComponentType),
//     AInfo extends ([A] extends [ComponentMixinType] ? ReturnType<A>["_Info"] : InstanceType<ComponentType & A>["_Info"]),
//     B extends [A] extends [ComponentMixinType] ? ComponentMixinExtends<A, B> : ComponentMixinExtendsInfo<AInfo, B>,
//     C extends ComponentMixinExtendsInfo<AInfo & InstanceType<ReturnType<B>>["_Info"], C>,
//     D extends ComponentMixinExtendsInfo<AInfo & GetComponentInfoFromMixins<B, C>, D>,
//     E extends ComponentMixinExtendsInfo<AInfo & GetComponentInfoFromMixins<B, C, D>, E>
// >(a: A, b: B, c: C, d: D, e: E): ComponentType<AInfo & GetComponentInfoFromMixins<B, C, D, E>>;
// export function mixComponentMixins<
//     A extends ([A] extends [ComponentMixinType] ? ComponentMixinExtends<ComponentMixinType, ComponentMixinType & A> : ComponentType),
//     AInfo extends ([A] extends [ComponentMixinType] ? ReturnType<A>["_Info"] : InstanceType<ComponentType & A>["_Info"]),
//     B extends [A] extends [ComponentMixinType] ? ComponentMixinExtends<A, B> : ComponentMixinExtendsInfo<AInfo, B>,
//     C extends ComponentMixinExtendsInfo<AInfo & InstanceType<ReturnType<B>>["_Info"], C>,
//     D extends ComponentMixinExtendsInfo<AInfo & GetComponentInfoFromMixins<B, C>, D>,
//     E extends ComponentMixinExtendsInfo<AInfo & GetComponentInfoFromMixins<B, C, D>, E>,
//     F extends ComponentMixinExtendsInfo<AInfo & GetComponentInfoFromMixins<B, C, D, E>, F>
// >(a: A, b: B, c: C, d: D, e: E, f: F): ComponentType<AInfo & GetComponentInfoFromMixins<B, C, D, E, F>>;
// export function mixComponentMixins<
//     A extends ([A] extends [ComponentMixinType] ? ComponentMixinExtends<ComponentMixinType, ComponentMixinType & A> : ComponentType),
//     AInfo extends ([A] extends [ComponentMixinType] ? ReturnType<A>["_Info"] : InstanceType<ComponentType & A>["_Info"]),
//     B extends [A] extends [ComponentMixinType] ? ComponentMixinExtends<A, B> : ComponentMixinExtendsInfo<AInfo, B>,
//     C extends ComponentMixinExtendsInfo<AInfo & InstanceType<ReturnType<B>>["_Info"], C>,
//     D extends ComponentMixinExtendsInfo<AInfo & GetComponentInfoFromMixins<B, C>, D>,
//     E extends ComponentMixinExtendsInfo<AInfo & GetComponentInfoFromMixins<B, C, D>, E>,
//     F extends ComponentMixinExtendsInfo<AInfo & GetComponentInfoFromMixins<B, C, D, E>, F>,
//     G extends ComponentMixinExtendsInfo<AInfo & GetComponentInfoFromMixins<B, C, D, E, F>, G>,
// >(a: A, b: B, c: C, d: D, e: E, f: F, g: G): ComponentType<AInfo & GetComponentInfoFromMixins<B, C, D, E, F, G>>;
// export function mixComponentMixins<
//     A extends ([A] extends [ComponentMixinType] ? ComponentMixinExtends<ComponentMixinType, ComponentMixinType & A> : ComponentType),
//     AInfo extends ([A] extends [ComponentMixinType] ? ReturnType<A>["_Info"] : InstanceType<ComponentType & A>["_Info"]),
//     B extends [A] extends [ComponentMixinType] ? ComponentMixinExtends<A, B> : ComponentMixinExtendsInfo<AInfo, B>,
//     C extends ComponentMixinExtendsInfo<AInfo & InstanceType<ReturnType<B>>["_Info"], C>,
//     D extends ComponentMixinExtendsInfo<AInfo & GetComponentInfoFromMixins<B, C>, D>,
//     E extends ComponentMixinExtendsInfo<AInfo & GetComponentInfoFromMixins<B, C, D>, E>,
//     F extends ComponentMixinExtendsInfo<AInfo & GetComponentInfoFromMixins<B, C, D, E>, F>,
//     G extends ComponentMixinExtendsInfo<AInfo & GetComponentInfoFromMixins<B, C, D, E, F>, G>,
//     H extends ComponentMixinExtendsInfo<AInfo & GetComponentInfoFromMixins<B, C, D, E, F, G>, H>
// >(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H): ComponentType<AInfo & GetComponentInfoFromMixins<B, C, D, E, F, G, H>>;


// // Using ComponentMixinExtends<CombineMixins<A, B>, C> flow. Has problems on compiled or if in different file than Component.ts.
// 
// export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, Info extends GetComponentInfoFromMixins<A>>(a: A): ComponentType<Info>;
// export function mixComponentMixins<Base extends ComponentType, A extends ComponentMixinExtendsType<Base, A>>(base: Base, a: A): ReturnType<A>;
// export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>>(a: A, b: B): ComponentType<GetComponentInfoFromMixins<A, B>>;
// export function mixComponentMixins<Base extends ComponentType, A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>>(base: Base, a: A, b: B): ComponentType<GetComponentInfoFromMixins<A, B>>;
// export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtends<CombineMixins<A, B>, C>>(a: A, b: B, c: C): ComponentType<GetComponentInfoFromMixins<A, B, C>>;
// export function mixComponentMixins<Base extends ComponentType, A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtends<CombineMixins<A, B>, C>>(base: Base, a: A, b: B, c: C): ComponentType<GetComponentInfoFromMixins<A, B, C>>;
// export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtends<CombineMixins<A, B>, C>, D extends ComponentMixinExtends<CombineMixins<A, B, C>, D>>(a: A, b: B, c: C, d: D): ComponentType<GetComponentInfoFromMixins<A, B, C, D>>;
// export function mixComponentMixins<Base extends ComponentType, A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtends<CombineMixins<A, B>, C>, D extends ComponentMixinExtends<CombineMixins<A, B, C>, D>>(base: Base, a: A, b: B, c: C, d: D): ComponentType<GetComponentInfoFromMixins<A, B, C, D>>;
// export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtends<CombineMixins<A, B>, C>, D extends ComponentMixinExtends<CombineMixins<A, B, C>, D>, E extends ComponentMixinExtends<CombineMixins<A, B, C, D>, E>>(a: A, b: B, c: C, d: D, e: E): ComponentType<GetComponentInfoFromMixins<A, B, C, D, E>>;
// export function mixComponentMixins<Base extends ComponentType, A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtends<CombineMixins<A, B>, C>, D extends ComponentMixinExtends<CombineMixins<A, B, C>, D>, E extends ComponentMixinExtends<CombineMixins<A, B, C, D>, E>>(base: Base, a: A, b: B, c: C, d: D, e: E): ComponentType<GetComponentInfoFromMixins<A, B, C, D, E>>;
// export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtends<CombineMixins<A, B>, C>, D extends ComponentMixinExtends<CombineMixins<A, B, C>, D>, E extends ComponentMixinExtends<CombineMixins<A, B, C, D>, E>, F extends ComponentMixinExtends<A & B & C & D & E, F>>(a: A, b: B, c: C, d: D, e: E, f: F): ComponentType<GetComponentInfoFromMixins<A, B, C, D, E, F>>;
// export function mixComponentMixins<Base extends ComponentType, A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtends<CombineMixins<A, B>, C>, D extends ComponentMixinExtends<CombineMixins<A, B, C>, D>, E extends ComponentMixinExtends<CombineMixins<A, B, C, D>, E>, F extends ComponentMixinExtends<A & B & C & D & E, F>>(base: Base, a: A, b: B, c: C, d: D, e: E, f: F): ComponentType<GetComponentInfoFromMixins<A, B, C, D, E, F>>;
// export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtends<CombineMixins<A, B>, C>, D extends ComponentMixinExtends<CombineMixins<A, B, C>, D>, E extends ComponentMixinExtends<CombineMixins<A, B, C, D>, E>, F extends ComponentMixinExtends<A & B & C & D & E, F>, G extends ComponentMixinExtends<A & B & C & D & E & F, G>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G): ComponentType<GetComponentInfoFromMixins<A, B, C, D, E, F, G>>;
// export function mixComponentMixins<Base extends ComponentType, A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtends<CombineMixins<A, B>, C>, D extends ComponentMixinExtends<CombineMixins<A, B, C>, D>, E extends ComponentMixinExtends<CombineMixins<A, B, C, D>, E>, F extends ComponentMixinExtends<A & B & C & D & E, F>, G extends ComponentMixinExtends<A & B & C & D & E & F, G>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G): ComponentType<GetComponentInfoFromMixins<A, B, C, D, E, F, G>>;
// export function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtends<CombineMixins<A, B>, C>, D extends ComponentMixinExtends<CombineMixins<A, B, C>, D>, E extends ComponentMixinExtends<CombineMixins<A, B, C, D>, E>, F extends ComponentMixinExtends<A & B & C & D & E, F>, G extends ComponentMixinExtends<A & B & C & D & E & F, G>, H extends ComponentMixinExtends<A & B & C & D & E & F & G, H>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H): ComponentType<GetComponentInfoFromMixins<A, B, C, D, E, F, G, H>>;
// export function mixComponentMixins<Base extends ComponentType, A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtends<CombineMixins<A, B>, C>, D extends ComponentMixinExtends<CombineMixins<A, B, C>, D>, E extends ComponentMixinExtends<CombineMixins<A, B, C, D>, E>, F extends ComponentMixinExtends<A & B & C & D & E, F>, G extends ComponentMixinExtends<A & B & C & D & E & F, G>, H extends ComponentMixinExtends<A & B & C & D & E & F & G, H>>(base: Base, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H): ComponentType<GetComponentInfoFromMixins<A, B, C, D, E, F, G, H>>;


// /** This mixes together a Component class and a single function. 
//  * - Optionally as the 3rd arg, can provide an extra function to do the rendering `(props, state) => MixDOMRenderOutput | MixDOMDoubleRenderer;`
//  * - Or the 3rd arg can be a boolean: `true` to use class render method, or `false` to use the renderer from funcs. Defaults to false (-> uses func renderer). */
// export function mixComponentClassFunc<Class extends ComponentType, Func extends ComponentFunc, Info extends Partial<ComponentInfo> = Class["_Info"] & GetComponentFuncInfo<Func>>(BaseClass: Class, func: Func, useClassRender: boolean | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}> = false): ComponentType<Info> {
//     // Return a new class extending the base.
//     return { [BaseClass.name]: class extends (BaseClass as ComponentType) {
//         // Assign render method. It will only be used for the very first time.
//         render(initProps: Dictionary) {
//             // Run the func initializer once.
//             const output = func(initProps, this, this.contextAPI as ComponentContextAPI);
//             // Return the original render.
//             return useClassRender ? typeof useClassRender === "function" ? useClassRender : super.render : typeof output === "function" ? output : () => output;
//         }
//     }}[BaseClass.name] as any;
// }
/** This mixes together a Component class and one or many functions. 
 * - By default, attaches the return of the last function as the renderer (if function type, otherwise an earlier one). 
 * - Optionally as the 3rd arg, can provide a boolean to use the class renderer instead. */
export function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>>(Base: Class, a: A, useClassRender?: boolean): A;
export function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<BaseFunc & A, B>>(Base: Class, a: A, b: B, useClassRender?: boolean): ComponentType<GetComponentFuncInfo<CombineComponentFuncs<A, B>>>;
export function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<BaseFunc & A, B>, C extends ComponentFuncExtends<BaseFunc & A & B, C>>(Base: Class, a: A, b: B, c: C, useClassRender?: boolean): ComponentType<GetComponentFuncInfo<CombineComponentFuncs<A, B, C>>>;
export function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<BaseFunc & A, B>, C extends ComponentFuncExtends<BaseFunc & A & B, C>, D extends ComponentFuncExtends<BaseFunc & A & B & C, D>>(Base: Class, a: A, b: B, c: C, d: D, useClassRender?: boolean): ComponentType<GetComponentFuncInfo<CombineComponentFuncs<A, B, C, D>>>;
export function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<BaseFunc & A, B>, C extends ComponentFuncExtends<BaseFunc & A & B, C>, D extends ComponentFuncExtends<BaseFunc & A & B & C, D>, E extends ComponentFuncExtends<BaseFunc & A & B & C & D, E>>(Base: Class, a: A, b: B, c: C, d: D, e: E, useClassRender?: boolean): ComponentType<GetComponentFuncInfo<CombineComponentFuncs<A, B, C, D, E>>>;
export function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<BaseFunc & A, B>, C extends ComponentFuncExtends<BaseFunc & A & B, C>, D extends ComponentFuncExtends<BaseFunc & A & B & C, D>, E extends ComponentFuncExtends<BaseFunc & A & B & C & D, E>, F extends ComponentFuncExtends<BaseFunc & A & B & C & D & E, F>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, useClassRender?: boolean): ComponentType<GetComponentFuncInfo<CombineComponentFuncs<A, B, C, D, E, F>>>;
export function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<BaseFunc & A, B>, C extends ComponentFuncExtends<BaseFunc & A & B, C>, D extends ComponentFuncExtends<BaseFunc & A & B & C, D>, E extends ComponentFuncExtends<BaseFunc & A & B & C & D, E>, F extends ComponentFuncExtends<BaseFunc & A & B & C & D & E, F>, G extends ComponentFuncExtends<BaseFunc & A & B & C & D & E & F, G>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, useClassRender?: boolean): ComponentType<GetComponentFuncInfo<CombineComponentFuncs<A, B, C, D, E, F, G>>>;
export function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<BaseFunc & A, B>, C extends ComponentFuncExtends<BaseFunc & A & B, C>, D extends ComponentFuncExtends<BaseFunc & A & B & C, D>, E extends ComponentFuncExtends<BaseFunc & A & B & C & D, E>, F extends ComponentFuncExtends<BaseFunc & A & B & C & D & E, F>, G extends ComponentFuncExtends<BaseFunc & A & B & C & D & E & F, G>, H extends ComponentFuncExtends<BaseFunc & A & B & C & D & E & F & G, H>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, useClassRender?: boolean): ComponentType<GetComponentFuncInfo<CombineComponentFuncs<A, B, C, D, E, F, G, H>>>;
export function mixComponentClassFuncs(BaseClass: ComponentType, ...funcArgs: ComponentFunc[] | [...funcs: ComponentFunc[], useClassRender: boolean | undefined]) {
    // Mix.
    const useClassRender = typeof funcArgs[funcArgs.length - 1] !== "function" ? !!funcArgs.pop() : false;
    // const compFunc = funcArgs.length > 1 ? mixComponentFuncs(...funcArgs as [ComponentFunc]) : funcArgs[0] as ComponentFunc;
    const compFunc = funcArgs.length > 1 ? (mixComponentFuncs as any)(...funcArgs) : funcArgs[0] as ComponentFunc;
    // Return a new class extending the base.
    return { [BaseClass.name]: class extends (BaseClass as ComponentType) {
        // Assign render method. It will only be used for the very first time.
        render(initProps: Dictionary) {
            // Run the compFunc initializer once.
            const output = compFunc(initProps, this, this.contextAPI as ComponentContextAPI);
            // Return a renderer.
            return useClassRender ? super.render : typeof output === "function" ? output : () => output;
        }
    }}[BaseClass.name] as any;
}

/** This mixes together a Component class and one or many functions with a composer function as the last function.
 * - The last function is always used as the renderer and its typing is automatic.
 *      * If you want to add extra props to the auto typed composer you can add them as an extra last argument: `{} as { props: { someStuff: boolean; } }`.
 */
export function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, Mixed extends ExtendComponentFunc<BaseFunc, ExtraInfo>>(Base: Class, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<GetComponentFuncInfo<Mixed>>;
export function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<BaseFunc, A> & ExtraInfo>>(Base: Class, a: A, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<GetComponentFuncInfo<Mixed>>;
export function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<A, B>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<BaseFunc, A, B> & ExtraInfo>>(Base: Class, a: A, b: B, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<GetComponentFuncInfo<Mixed>>;
export function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<BaseFunc, A, B, C> & ExtraInfo>>(Base: Class, a: A, b: B, c: C, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<GetComponentFuncInfo<Mixed>>;
export function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<BaseFunc, A, B, C, D> & ExtraInfo>>(Base: Class, a: A, b: B, c: C, d: D, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<GetComponentFuncInfo<Mixed>>;
export function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<BaseFunc, A, B, C, D, E> & ExtraInfo>>(Base: Class, a: A, b: B, c: C, d: D, e: E, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<GetComponentFuncInfo<Mixed>>;
export function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, F extends ComponentFuncExtends<A & B & C & D & E, F>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<BaseFunc, A, B, C, D, E, F> & ExtraInfo>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<GetComponentFuncInfo<Mixed>>;
export function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, F extends ComponentFuncExtends<A & B & C & D & E, F>, G extends ComponentFuncExtends<A & B & C & D & E & F, G>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<BaseFunc, A, B, C, D, E, F, G> & ExtraInfo>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<GetComponentFuncInfo<Mixed>>;
export function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, F extends ComponentFuncExtends<A & B & C & D & E, F>, G extends ComponentFuncExtends<A & B & C & D & E & F, G>, H extends ComponentFuncExtends<A & B & C & D & E & F & G, H>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<BaseFunc, A, B, C, D, E, F, G, H> & ExtraInfo>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<GetComponentFuncInfo<Mixed>>;
export function mixComponentClassFuncsWith(...funcs: any[]) {
    const nFuncs = funcs.length;
    return (mixComponentClassFuncs as any)(...(typeof funcs[nFuncs - 1] !== "function" ? funcs.slice(0, nFuncs - 1) : funcs)) as any;
}


// It's again the same conceptual typing problem. We cannot provide just one argument and let the others flow from given. It's all or none.
// .. So can't use this entwineComponentWith concept nicely without hassle, so can just use ExtendComponentFunc and MixDOM.component() instead.
// 
// export type EntwineComponentWith<Info extends Partial<ComponentInfo> = {}> = <Mixed extends ComponentFunc, Composer extends ComponentFunc<GetComponentInfo<Mixed> & Info>>(mixedFuncs: Mixed, composer: Composer) => ComponentFunc;
// export function entwineComponentWith<Info extends Partial<ComponentInfo>, Mixed extends ComponentFunc>(mixedFuncs: Mixed, composer: CombineComponentFuncs<Mixed, ComponentFunc<Info>>) {}
// export function entwineComponentWith2<Info extends Partial<ComponentInfo> = {}, Mixed extends ComponentFunc | null = null>(composer: [Mixed] extends [ComponentFunc] ? CombineComponentFuncs<Mixed, ComponentFunc<Info>> : ComponentFunc<Info>) {}


// - Component HOCs - //

export type ComponentHOC<RequiredType extends ComponentTypeAny, FinalType extends ComponentTypeAny> = (InnerComp: RequiredType) => FinalType;
export type ComponentHOCBase = (InnerComp: ComponentTypeAny) => ComponentTypeAny;

/** Combine many HOCs together. */
// Note. There is something wrong with assigning a func to ComponentTypeAny upon compiling (not before) in module usage.
// .. Something about the props not being okay to ComponentFunc<{}>. It only happens when using an untyped spread func as the BASE.
// .... In that case the type is (props: { ...}) => any ..! Where as shouldn't be ANY.
// .. Could solve it generally by using `Base extends any`, not ComponentTypeAny. But let's just leave it. If uses a typed base func works fine.
export function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny>
    (base: Base, hoc1: (base: Base) => A): SpreadFunc<(Intersect<GetComponentInfo<A> & {}> & {props: {}})["props"] & {}>;
export function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny>
    (base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B): SpreadFunc<(Intersect<GetComponentInfo<B> & {}> & {props: {}})["props"] & {}>;
export function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny>
    (base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C): SpreadFunc<(Intersect<GetComponentInfo<C> & {}> & {props: {}})["props"] & {}>;
export function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny>
    (base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D): SpreadFunc<(Intersect<GetComponentInfo<D> & {}> & {props: {}})["props"] & {}>;
export function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny>
    (base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E): SpreadFunc<(Intersect<GetComponentInfo<E> & {}> & {props: {}})["props"] & {}>;
export function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny>
    (base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F): SpreadFunc<(Intersect<GetComponentInfo<F> & {}> & {props: {}})["props"] & {}>;
export function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny, G extends ComponentTypeAny>
    (base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F, hoc7: (f: F) => G): SpreadFunc<(Intersect<GetComponentInfo<G> & {}> & {props: {}})["props"] & {}>;
export function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny, G extends ComponentTypeAny, H extends ComponentTypeAny>
    (base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F, hoc7: (f: F) => G, hoc8: (g: G) => H): SpreadFunc<(Intersect<GetComponentInfo<H> & {}> & {props: {}})["props"] & {}>;
export function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny, G extends ComponentTypeAny, H extends ComponentTypeAny, I extends ComponentTypeAny>
    (base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F, hoc7: (f: F) => G, hoc8: (g: G) => H, hoc9: (h: H) => I): SpreadFunc<(Intersect<GetComponentInfo<I> & {}> & {props: {}})["props"] & {}>;
export function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny, G extends ComponentTypeAny, H extends ComponentTypeAny, I extends ComponentTypeAny, J extends ComponentTypeAny>
    (base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F, hoc7: (f: F) => G, hoc8: (g: G) => H, hoc9: (h: H) => I, hoc10: (i: I) => J): SpreadFunc<(Intersect<GetComponentInfo<J> & {}> & {props: {}})["props"] & {}>;
export function mixHOCs(baseComp: ComponentTypeAny, ...hocs: ComponentHOCBase[]): SpreadFunc {
    // First compose new components.
    let Base = baseComp;
    for (const thisHOC of hocs)
        Base = thisHOC(Base);
    // Then create a def for the last component in the chain. We can just use a spread as our final component.
    return (props) => newDef(Base, props, MixDOMContent);
}






// - Testing - //


// const MyMixin = (Base: ComponentTypeWithClass<MyMixinRequiresInfo>) => class _MyMixin extends (Base as ComponentTypeWithClass<MyMixinRequiresInfo & MyMixinInfo>) {
//     // const MyMixin = createMixin<MyMixinInfo, MyMixinRequiresInfo>(Base => class _MyMixin extends Base {
//
//         // Extra members.
//         hoverDisabled?: boolean;
//         hoverTimeout: number;
//
//         // Construct with pass args. We need to distinguish props tho.
//         constructor(props, ...passArgs: any[]) {
//             super(props, ...passArgs);
//             this.hoverTimeout = 500;
//             this.state = {
//                 hovered: false,
//                 test: true
//             }
//         }
//
//         // Mouse enter and leave features.
//         onMouseEnter() {
//             if (!this.hoverDisabled)
//                 this.setTimer("onMouseEnter", () => {
//                     this.setInState("hovered", true);
//                 }, this.hoverTimeout);
//         }
//         onMouseLeave() {
//             if (this.hasTimer("onMouseEnter"))
//                 this.clearTimer("onMouseEnter");
//             if (this.state.hovered)
//                 this.setInState("hovered", false);
//         }
//
//     }
// 
// 
// type MyMixinRequiresInfo = { class: { hoverTimeout: number; } };
// type MyMixinInfo = { state: { test: boolean; } };
// interface MyMixin0Info {
//     state: { apina: boolean; };
// }
// const MyMixin0 = createMixin<MyMixin0Info>(Base => class _MyMixin extends Base { });
// const MyMixin1 = createMixin<MyMixinInfo>(Base => class _MyMixin extends Base { });
// const MyMixin1Req = createMixin<MyMixinInfo, MyMixin0Info>(Base => class _MyMixin extends Base {
//     render() {
//         this.setInState("test", false);
//         return null;
//     }
// });

// // // const Test: _ComponentMixin = MyMixin1;
// // const Test2: ComponentMixinType<MyMixinInfo, {}> = MyMixin1;
// const MyMixin2 = (Base: ComponentType<{}>) => class _MyMixin extends (Base as ComponentType<MyMixinInfo>) {}
// // const MyMixin3 = (Base: ComponentType<{}>) => class _MyMixin extends Base {}
// // 
// const Test55555_FAIL = mixComponentMixins(MyMixin2, MyMixin1Req); // Should fail..! Correct..!
// const Test555 = mixComponentMixins(MyMixin2, MyMixin0, MyMixin1Req); // Should not fail. Correct..!
// const Test5555 = mixComponentMixins(MyMixin0, MyMixin0, MyMixin1Req); // Should not fail. Correct..!
// const Test55555 = mixComponentMixins(MyMixin0, MyMixin1Req);




// // - Test types - //
// 
// // Types for combining and extending generally.
// export type ComponentTypeMixable<PreComp extends ComponentTypeAny = ComponentTypeAny, PostComp extends ComponentTypeAny = PreComp> = CombineComponentTypes<PreComp, PostComp> & { Info?: { required: PreComp; }; };
// export type ComponentTypeExtends<A extends ComponentTypeAny, B extends ComponentTypeAny> = [B] extends [ComponentTypeMixable] ? [A] extends [NonNullable<B["_Info"]>["required"]] ? ComponentFunc : never : ComponentFunc;
// export type ComponentTypeExtendsProps<A extends ComponentTypeAny, B extends ComponentTypeAny> = [(GetComponentInfo<A> & { props: {}; })["props"]] extends [(GetComponentInfo<B> & { props: {}; })["props"]] ? ComponentTypeAny : never;
// export type CombineComponentTypes<
//     A extends ComponentTypeAny = ComponentTypeAny,
//     B extends ComponentTypeAny = ComponentTypeAny,
//     C extends ComponentTypeAny = ComponentTypeAny,
//     D extends ComponentTypeAny = ComponentTypeAny,
//     E extends ComponentTypeAny = ComponentTypeAny,
//     F extends ComponentTypeAny = ComponentTypeAny,
//     G extends ComponentTypeAny = ComponentTypeAny,
//     H extends ComponentTypeAny = ComponentTypeAny,
// > = ComponentType<Omit<Partial<ComponentInfo> & GetComponentInfo<A> & GetComponentInfo<B> & GetComponentInfo<C> & GetComponentInfo<D> & GetComponentInfo<E> & GetComponentInfo<F> & GetComponentInfo<G> & GetComponentInfo<H>, "required">>;
// 
// export type HOCExtendsProps<RequiredProps extends Dictionary, HOC extends HOCType> = [GetComponentInfo<ReturnType<HOC>>["props"]] extends [RequiredProps] ? HOCType : never;
// export type HOCExtendsComponent<Required extends ComponentTypeAny, HOC extends HOCType> = [GetComponentInfo<ReturnType<HOC>>] extends [GetComponentInfo<Required>] ? HOCType : never;
// export type HOCExtendsComponent<Required extends ComponentTypeAny, HOC extends HOCType> = [ComponentType<GetComponentInfo<ReturnType<HOC>> & {}>] extends [ComponentType<GetComponentInfo<Required> & {}>] ? HOCType : never;
// 
// export type HOCExtendsComponent<Required extends ComponentTypeAny, HOC extends HOCType> = [GetComponentInfo<ReturnType<HOC>> & {}] extends [GetComponentInfo<Required> & {}] ? HOCType : never;
// export type HOCExtendsHOC<ReqHOC extends HOCType, HOC extends HOCType> = [GetComponentInfo<ReturnType<HOC>>] extends [GetComponentInfo<ReturnType<ReqHOC>>] ? HOCType : never;
// 
// type CleanRecord<Type extends {}> = {[Key in string & keyof Type]: Type[Key]};
// type CleanDoubleRecord<Type extends Record<any,any>> = {[Key in string & keyof Type]: [Type[Key]] extends [{}] ? CleanRecord<Type[Key]> : Type[Key] };
// type CleanComponentInfo<Info extends Partial<ComponentInfo>> = WithoutUndefined<{ [Key in keyof Info]: [Record<any,any> | undefined] extends [Info[Key]] ? undefined : Info[Key] }>;
// type UndefinedKeys<T> = { [K in keyof T]: T[K] extends undefined ? K : never }[keyof T];
// type UndefinedKeysOr<T> = { [K in keyof T]: [Record<any,any> | undefined] extends [T[K]] ? K : never }[keyof T];
// type WithoutUndefined<T> = T[keyof T] extends never ? never : Omit<T, UndefinedKeys<T>>;
// 
// 
// type WithoutNever<T> = [{ [K in keyof T]: T[K] extends never ? K : never }[keyof T]] extends [never] ? T : never;
// type InfoExtendsClean<Req extends Partial<ComponentInfo>, Ext extends Partial<ComponentInfo>> = WithoutNever<InfoExtends<CleanComponentInfo<Partial<ComponentInfo> & Req>, CleanComponentInfo<Partial<ComponentInfo> & Ext>>>;
// type InfoExtends<Req extends Partial<ComponentInfo>, Ext extends Partial<ComponentInfo>> = 
//     {[Key in keyof Req]:
//         [Key] extends [keyof Ext] ? 
//             [undefined] extends [Req[Key]] ? Ext[Key] : [Ext[Key]] extends [Req[Key]] ? Ext[Key] : never
//         : never
//     };
// 
// export type HOCTyped<RequiredType extends ComponentTypeAny = ComponentTypeAny, FinalType extends ComponentTypeAny = ComponentTypeAny> = (innerComp: RequiredType) => FinalType;
// export type HOCType = (innerComp: ComponentTypeAny) => ComponentTypeAny;
// export type HOCExtendsComponent<Required extends ComponentTypeAny, HOC extends HOCType> = [GetComponentInfo<ReturnType<HOC>> & {}] extends [GetComponentInfo<Required> & {}] ? HOCType : never;
// export type HOCExtendsHOC<ReqHOC extends HOCType, HOC extends HOCType> = [GetComponentInfo<ReturnType<HOC>>] extends [GetComponentInfo<ReturnType<ReqHOC>>] ? HOCType : never;

