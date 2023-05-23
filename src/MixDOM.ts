

// - Imports - //

import {
    RecordableType,
    DOMTags,
    MixDOMPreDOMTagProps,
    MixDOMDefTarget,
    MixDOMTreeNode,
    MixDOMTreeNodeType,
    MixDOMBoundary,
    MixDOMDefApplied,
} from "./static/_Types";
import { MixDOMCompareDepth, _Lib } from "./static/_Lib";
import { _Defs, newDef } from "./static/_Defs";
import { _Find } from "./static/_Find";
import { _Apply } from "./static/_Apply";
import { HostRender }from "./classes/HostRender";
import {
    PseudoFragment,
    PseudoPortal,
    PseudoElement,
    PseudoEmpty,
    PseudoEmptyStream,
} from "./classes/ComponentPseudos";
import { newHost, Host } from "./classes/Host";
import { newContext, newContexts, Context } from "./classes/Context";
import { createSpread, createSpreadWith } from "./classes/ComponentSpread";
import {
    createComponent,
    Component,
    ComponentMixin,
    ComponentTypeAny,
    ComponentType,
    createComponentWith,
} from "./classes/Component";
import {
    createMixin,
    mixComponentFuncs,
    mixComponentFuncsWith,
    mixComponentMixins,
    mixComponentClassMixins,
    mixComponentClassFuncs,
    mixComponentClassFuncsWith,
    mixHOCs,
    mixComponentMixinsWith,
} from "./classes/ComponentMixing";
import { createWired } from "./classes/ComponentWired";
import { createStream } from "./classes/ComponentStream";
import { newRef, Ref } from "./classes/Ref";
import { newEffect, Effect, EffectMixin } from "./addons/Effect";
import { createDataPicker, createDataSelector } from "./addons/DataPicker";
import { createShadow, createShadowWith } from "./classes/ComponentShadow";
import { SignalMan, SignalManMixin } from "./classes/SignalMan";
import { DataMan, DataManMixin } from "./classes/DataMan";
import { DataSignalMan, DataSignalManMixin } from "./classes/DataSignalMan";
import { ContentClosure } from "./classes/ContentClosure";


// - Export shortcuts - //

// Def.
export { newDef } from "./static/_Defs";

// Content.
export const MixDOMContent = _Defs.newContentPassDef();
export const MixDOMContentCopy = _Defs.newContentPassDef({}, true);
export type WithContentInfo = {
    props: {
        /** If set to a boolean value (= not null nor undefined), skips checking whether actually has content and returns the value. */
        hasContent?: boolean | null;
    };
    class: {
        /** Internal method to check whether has content - checks recursively through the parental chain. */
        hasContent(): boolean;
    };
}
const checkRecursively = (def: MixDOMDefApplied): boolean => {
    const e = def.contentPass?.envelope;
    return e && _Defs.hasContentInDefs(e.applied.childDefs, checkRecursively) as boolean || false;
};
const MixDOMWithContent = class WithContent extends Component<WithContentInfo> {
    /** Technical marker. Simply used to differentiate us from the Stream. */
    public static _WithContent = MixDOMContent;
    /** Internal method to check whether has content through the chain recursively. */
    public hasContent(): boolean {
        // Get our boundary's source boundary's closure. (As it's not about us, it's about our parent.)
        const closure: ContentClosure | null | undefined = this.boundary.sourceBoundary?.closure;
        // Check upstairs, recursively if needs to.
        return closure && closure.envelope && _Defs.hasContentInDefs(closure.envelope.applied.childDefs, checkRecursively) as boolean || false;
    }
    public render() {
        return (this.props.hasContent ?? this.hasContent()) ? MixDOMContent : null;
    }
} as ComponentType<WithContentInfo>;

/** Create a new def from a html string. Returns a def for a single html element
 * - If a wrapInTag given will use it as a container.
 * - Otherwise, if the string refers to multiple, returns an element containing them (with settings.renderHTMLDefTag).
 * - Normally uses a container only as a fallback if has many children. */
const newDefHTML = (innerHTML: string, wrapInTag?: DOMTags, props?: MixDOMPreDOMTagProps, key?: any): MixDOMDefTarget => {
    // Create def.
    const def: MixDOMDefTarget = {
        MIX_DOM_DEF: "content",
        tag: wrapInTag || "",
        childDefs: [],
        domContent: innerHTML,
        domHTMLMode: true
    };
    // Attach props.
    if (wrapInTag && props)
        def.props = _Lib.cleanDOMProps(props);
    // Attach key.
    if (key != null)
        def.key = key;
    // Return def.
    return def;
};

// Collected shortcuts and static methods.
export const MixDOM = {

    
    // - Def shortcuts - //

    /** Create a new render definition. Can feed JSX input. (It's like `React.createElement` but `MixDOM.def`). */
    def: newDef,

    /** Create a new def from a HTML string. Returns a def for a single HTML element.
     * - If a wrapInTag given will use it as a container.
     * - Otherwise, if the string refers to multiple, returns an element containing them (with settings.renderHTMLDefTag).
     * - Normally uses a container only as a fallback if has many children. */
    defHTML: newDefHTML,


    // - Content passing - //

    /** Generic def for passing content.
     * - Use this to include content (~ React's props.children) from the parent component.
     * - Note that in the case of multiple contentPasses the first one in tree order is the real one.
     *   .. If you deliberately want to play with which is the real one and which is a copy, use MixDOM.ContentCopy or MixDOM.copyContent(someKey) for the others. */
    Content: MixDOMContent,
    /** A custom component (func) that can be used for conditional inserting.
     * - For example: `<WithContent><span class="title">{MixDOM.Content}</span></WithContent>`
     *      * Results in `<span class="title">...</span>`, where ... is the actual content passed (by parent).
     *      * However, if there was no actual content to pass (`null` or `undefined`), then results in `null`.
     *      * Note that if the parent passes {MixDOM.Content}, then it is something and will render with the wrapping (so does not work recursively).
     * - Note that if the component ever needs to "handle" the children, or be refreshed when they change, should put the related info as `props`.
     *      * For example, `{ props.children: MixDOMRenderOutput[]; }`. Or even better as: `{ props.items: MyItem[]; }` and then create the defs within from the MyItem info.
     *      * You can then also easily detect if there are any children/items and do conditional rendering accordingly.
     * - Note that prior to v3.1, this feature worked technically differently.
     *      * Now it's implemented in a much simpler way, only drawback being the lack of recursive support, but benefit being that parent won't have to re-render (and ~4kB less minified code).
     */
    WithContent: MixDOMWithContent,
    /** A generic shortcut for a content copy.
     * .. We give it a unique key ({}), so that it can be widely moved around.
     * .. In the case you use multiple ContentCopy's, then reuses each widely by tree order. */
    ContentCopy: MixDOMContentCopy,
    /** Use this method to create a copy of the content that is not swappable with the original render content.
     * - This is very rarely useful, but in the case you want to display the passed content multiple times,
     *   this allows to distinguish from the real content pass: `{ MixDOM.Content }` vs. `{ MixDOM.copyContent("some-key") }` */
    copyContent: _Defs.newContentCopyDef,

    // Enums.
    /** For quick getting modes to depth for certain uses (Effect and DataPicker).
     * - Positive values can go however deep. Note that -1 means deep, but below -2 means will not check.
     * - Values are: "always" = -2, "deep" = -1, "changed" = 0, "shallow" = 1, "double" = 2. */
    CompareDepthByMode: MixDOMCompareDepth,


    // - Class & mixin shortcuts - //

    // Common base classes.
    /** This is a typable base class used for the signals features in many MixDOM classes.
     * - You can use it as a standalone communicator as well or in the component flow: eg. by sharing them via through props, contexts or directly / globally.
     *      * For example, some components can add listeners to the (typed) signals, and you can emit them from elsewhere to, say, trigger a state refresh. 
     * - The signal flow is typically one way: you're not expecting a return value from the sendSignal function.
     *      * However even sendSignal does return the last non `undefined` value returned by a listener. (This is used internally for "shouldUpdate" (boolean to tell) and "domWillUnmount" (boolean to salvage).)
     * - However, you can also get a list of answers as the return value: using askSignal for synchronous and requestSignal for asynchronous questions.
     *      * Finally, there's also askLastSignal and requestLastSignal for cases where you except a single answer. Exceptionally, the second argument is the fallback value: `(name, fallback, ...args)`
     */
    SignalMan,
    /** This extends the given base class with SignalMan features - see above for details.
     * - Returns the dynamically extended class. Typewise this means: `(Base: ClassType) => ClassType<typeof Base & typeof SignalMan>` */
    SignalManMixin,
    /** This provides data setting and listening features with dotted strings.
     * - Example to create: `const dataMan = new MixDOM.DataMan({ ...initData });`
     * - Example for listening: `dataMan.listenToData("some.data.key", "another", (some, other) => { ... })`
     * - Example for setting data: `dataMan.setInData("some.data.key", somedata)`
     */
    DataMan,
    /** This provides the DataMan features to a custom base class.
     * - Returns the dynamically extended class. Typewise this means: `(Base: ClassType) => ClassType<typeof Base & typeof DataMan>` */
    DataManMixin,
    /** This class combines `DataMan` and `SignalMan` mixins together in the order: DataSignalMan > DataMan > SignalMan.
     * - Can be used for stand alone purposes. It's also used as the basis for `Context`.
     * - Extra notes:
     *      * Note that `ContextAPI` looks very much like DataSignalMan but is a bit different technically. It holds no data or signals of its own, but refers to signals and data from many named contexts.
     *      * Likewise there are similar methods available on the `Component` class, but with the "Context" word in them, eg. listenToContextData, sendContextSignal, ... They are just like the signals on component's host's contextAPI, but are automatically disconnected when the component unmounts.
     */
    DataSignalMan,
    /** Provides the combined DataManSignal features to a custom base class.
     * - Returns the dynamically extended class. Typewise this means: `(Base: ClassType) => ClassType<typeof Base & typeof DataSignalMan>` 
     * - The extending order is: `DataManMixin( SignalManMixin( Base ) ). */
    DataSignalManMixin,

    // Main classes.
    Component,
    ComponentMixin,
    Host,
    Context,
    Ref,

    // Addon classes.
    Effect,
    EffectMixin,


    // - Pseudo classes - //

    /** Fragment represent a list of render output instead of stuff under one root.
     * Usage example: `<MixDOM.Fragment><div/><div/></MixDOM.Fragment>` */
    Fragment: PseudoFragment,
    /** Portal allows to insert the content into a foreign dom node.
     * Usage example: `<MixDOM.Portal container={myDOMElement}><div/></MixDOM.Portal>` */
    Portal: PseudoPortal,
    /** This allows to use an existing dom element as if it was part of the system.
     * So you can modify its props and such. */
    Element: PseudoElement,
    /** Empty dummy component that accepts any props, but always renders null. */
    Empty: PseudoEmpty,
    /** This is an empty dummy stream class:
     * - Its purpose is to make writing render output easier (1. no empty checks, and 2. for typing):
     *     * For example: `const MyStream = component.state.PopupStream || MixDOM.EmptyStream;`
     *     * You can then access the Content and ContentCopy members, and copyContent(key) and withContent(...contents) methods fluently.
     * - However, they will just return null, so won't have any effect on anything.
     *     * Note also that technically speaking this class extends PseudoEmpty.
     *     * And it only adds the 2 public members (Content and ContentCopy) and 2 public methods (copycontent and withContent).
     *     * Due to not actually being a stream, it will never be used as a stream. It's just a straw dog.
     * - If you need to distinguish between real and fake, use `isStream()` method. The empty returns false.
     *     * For example, to set specific content listening needs, you can use an effect - run it on render or .onBeforeUpdate callback.
     *     * on effect mount: `(NewStream: ComponentStreamType) => NewStream.isStream() && component.contentAPI.needsFor(NewStream, true);`
     *     * on effect unmount: `(OldStream: ComponentStreamType) => OldStream.isStream() && component.contentAPI.needsFor(OldStream, null);`
     */
    EmptyStream: PseudoEmptyStream,


    // - Instance classes - //

    /** Create a Host instance to orchestrate rendering. */
    newHost,
    /** Create a Context instance. */
    newContext,
    /** Create multiple named Contexts as a dictionary. Useful for attaching them to a ContextAPI - and for getting the combined type for TypeScript purposes. */
    newContexts,
    /** Create a Ref instance. */
    newRef,
    /** Create an Effect instance. */
    newEffect,


    // - Create components - //

    /** Alias for createComponent. Create a functional component. You get the component as the first parameter, and optionally contextAPI as the second if you define 2 args: (component, contextAPI). */
    component: createComponent,
    /** Create a functional component with ContextAPI. The first initProps is omitted: (component, contextAPI). The contextAPI is instanced regardless of argument count. */
    componentWith: createComponentWith,
    /** Create a shadow component omitting the first initProps: (component). The contextAPI is if has 2 arguments (component, contextAPI).
     * - Shadow components are normal components, but they have a ShadowAPI attached as component.constructor.api.
     * - This allows the components to be tracked and managed by the parenting scope who creates the unique component class (whose instances are tracked).
    */
    shadow: createShadow,
    /** Create a shadow component with ContextAPI by func and omitting the first initProps: (component, contextAPI). The contextAPI is instanced regardless of argument count. */
    shadowWith: createShadowWith,
    /** Create a SpreadFunc - it's actually just a function with 0 or 1 arguments: (props?).
     * - It's the most performant way to render things (no lifecycle, just spread out with its own pairing scope).
     * - Note that this simply gives back the original function, unless it has more than 1 arguments, in which case an intermediary function is created.
     *      * This intermediary function actually supports feeding in more arguments - this works since a func with (props, ...args) actually has length = 1.
     *      * If you want to include the props and extra arguments typing into the resulting function use the MixDOM.spreadWith function instead (it also automatically reads the types).
     */
    spread: createSpread,
    /** Create a SpreadFunc by automatically reading the types for Props and ExtraArgs from the given function. See MixDOM.spread for details.
     * - The idea is to use the same spread function outside of normal render flow: as a static helper function to produce render defs (utilizing the extra args).
     */
    spreadWith: createSpreadWith,
    /** Create a ComponentStream class for  streaming (in / out).
     * - For example, `export const MyStream = MixDOM.createStream();`.
     * - And then to feed content in a render method: `<MyStream>Some content..</MyStream>`.
     * - Finally insert it somewhere in a render method: `{MyStream.Content}`.
    */
    stream: createStream,
    /** Creates an intermediary component (function) to help produce extra props to an inner component.
     *      * It receives its parent `props` normally, and then uses its `state` for the final props that will be passed to the inner component (as its `props`).
     * - About arguments:
     *      1. The optional Builder function builds the common external props for all wired instances. These are added to the component's natural props.
     *      2. The optional Mixer function builds unique props for each wired instance. If used, the common props are fed to it and the output of the mixer instead represents the final props to add.
     *      3. The only mandatory argument is the component to be used in rendering, can be a spread func, too. It's the one that receives the mixed props: from the tree flow and from the wiring source by handled by Mixer and Builder functions.
     *      4. Finally you can also define the name of the component (useful for debugging).
     * - Technically this method creates a component function (but could as well be a class extending Component).
     *      - The important thing is that it's a unique component func/class and it has `api` member that is of `WiredAPI` type (extending `ShadowAPI`).
     *      - When the component is instanced, its static class side contains the same `api` which serves as the connecting interface between the driver and all instances.
     *      - This class can then allow to set and refresh the common props, and trigger should-updates for all the instances and use signals.
     *      - The `WiredAPI` extension contains then features related to the automated mixing of parent props and custom data to produce final state -> inner component props.
     * - Note that when creates a stand alone wired component (not through Component component's .createWired method), you should drive the updates manually by .setProps.
     */
    wired: createWired,
    /** This returns the original function (to create a mixin class) back but simply helps with typing. 
     * - The idea of a mixin is this: `(Base) => class extends Base { ... }`. So it creates a new class that extends the provided base class.
     *     * In the context of Components the idea is that the Base is Component and then different features are added to it.
     *     * Optionally, when used with mixComponentMixins the flow also supports adding requirements (in addition to that the Base is a Component class).
     * - To use this method: `const MyMixin = MixDOM.mixin<RequiresInfo, MyMixinInfo>(Base => class _MyMixin extends Base { ... }`
     *     * Without the method: `const MyMixin = (Base: ComponentTypeWithClass<RequireInfo>) => class _MyMixin extends (Base as ComponentTypeWithClass<RequireInfo & MyMixinInfo>) { ... }`
     *     * So the trick of this method is simply that the returned function still includes `(Base: Required)`, but _inside_ the func it looks like `(Base: Required & Added)`.
    */
    mixin: createMixin,


    // - Component mixing - //

    /** This mixes many component functions together. Each should look like: `(initProps, component, cApi?) => MixDOMRenderOutput | MixDOMDoubleRenderer`.
     * - Note that this only "purely" mixes the components together (on the initial render call).
     *      * By default does not put a renderer function in the end but just passes last output (preferring funcs, tho). If you want make sure a renderer is in the end, put last param to true: `(...funcs, true)`
     *      * Compare this with `MixDOM.mixFuncsWith(..., composer)`, that always returns a renderer. (And its last argument is auto-typed based on all previous.)
     * - Each mixable func can also have pre-requirements if typed with `ComponentFuncMixable<RequiredFunc, OwnInfo>` - the typing supports up to 8 funcs and requirements can be filled by any func before.
     *      * Note that you should only use `ComponentFunc` or `ComponentFuncMixable`. Not supported for spread functions (makes no sense) nor component classes (not supported for this flow, see mixComponentClassFunc instead).
     *      * You should type each function most often with `ComponentFunc<Info>` type or `MixDOM.component<Info>()` method. If you leave a function and its params totally untyped, it will break the typing flow. But next one can correct it (at least partially).
     * - This also supports handling contextual needs (by a func having 3 args) as well as attaching / merging ShadowAPI | WiredAPI.
     * - Note that this does not wrap components one after another (like HOCs). Instead only their initializing closure is used, and the last active renderer.
     *      * Often the purpose is to extend props, state and/or class - especially class data becomes useful to hold info from different closures. Even partial renderers.
     *      * Note that each component func can still override state with: `component.state = { ...myStuff }`. The process detects changes and combines the states together if changed.
     */
    mixFuncs: mixComponentFuncs,
    /** This mixes many component functions together. Each should look like: (initProps, component, cApi?) => MixDOMRenderOutput | MixDOMDoubleRenderer.
     * - Unlike MixDOM.mixFuncs, the last argument is a mixable func that should compose all together, and its typing comes from all previous combined.
     *      * If you want to add extra props to the auto typed composer you can add them as an extra last argument: `{} as { props: { someStuff: boolean; } }`.
     *      * Alternatively you can add them to the 2nd last function with: `SomeMixFunc as ExtendComponentFunc<typeof SomeMixFunc, ExtraInfo>`.
     * - Each mixable func can also have pre-requirements if typed with `ComponentFuncMixable<RequiredFunc, OwnInfo>` - the typing supports up to 8 funcs and requirements can be filled by any func before.
     *      * Note that you should only use ComponentFunc or ComponentFuncMixable. Not supported for spread functions (makes no sense) nor component classes (not supported).
     *      * You should type each function most often with ComponentFunc<Info> or MixDOM.component<Info>(). If you leave a function and its params totally untyped, it will break the typing flow. But next one can correct it (at least partially).
     * - This also supports handling contextual needs (by a func having 3 args) as well as attaching / merging ShadowAPI | WiredAPI.
     * - Note that this does not wrap components one after another (like HOCs). Instead only their initializing closure is used, and the last active renderer.
     *      * Often the purpose is to extend props, state and/or class - especially class data becomes useful to hold info from different closures. Even partial renderers.
     *      * Note that each component func can still override state with: `component.state = { ...myStuff }`. The process detects changes and combines the states together if changed.
     */
    mixFuncsWith: mixComponentFuncsWith,
    /** This mixes together a Component class and one or many functions. 
     * - By default, attaches the return of the last function as the renderer (if function type, otherwise an earlier one). 
     * - Optionally as the 3rd arg, can provide a boolean to use the class renderer instead. */
    mixClassFuncs: mixComponentClassFuncs,
    /** This mixes together a Component class and one or many functions with a composer function as the last function.
     * - The last function is always used as the renderer and its typing is automatic.
     *      * If you want to add extra props to the auto typed composer you can add them as an extra last argument: `{} as { props: { someStuff: boolean; } }`.
     */
    mixClassFuncsWith: mixComponentClassFuncsWith,
    /** Mix many mixins together with a custom Component class as the basis to mix on: `(MyClass, MyMixin1, MyMixin2, ...)`.
     * - Note. The last mixin with a render method defined is used as the render method of the combined class.
     * - Note. If you don't want to define a custom component class as the base, you can use the `MixDOM.mixMixins` function instead (which uses the Component class). These two funcs are split to get better typing experience.
     * - For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
    */
    mixClassMixins: mixComponentClassMixins,
    /** Mix many mixins together into using the basic Component class as the basis to mix on: `(MyMixin1, MyMixin2, ...)`.
     * - Note. The last mixin with a render method defined is used as the render method of the combined class.
     * - Note. If you want to define a custom base class (extending Component) you can use `MixDOM.mixClassMixins` method whose first argument is a base class.
     * - For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
     */
    mixMixins: mixComponentMixins,
    /** Mix many mixins together into using a Component class as the basis to mix on: `(MyMixin1, MyMixin2, ..., ComposerMixin)`
     * - Note. The last mixin is assumed to be the one to do the rendering and its type is combined from all the previous + the optional extra info given as the very last argument.
     * - This is like MixDOM.mixFuncsWith but for mixins. On the javascript this function is teh same as MixDOM.mixMixins.
     */
    mixMixinsWith: mixComponentMixinsWith,
    /** This creates a final component for a list of HOCs with a based component: `(Base, HOC1, HOC2, ... )`
     * - Note that conceptually HOCs are not very performant as they create extra intermediary components.
     * - Consider using mixFuncs or mixMixins concepts instead. They are like HOCs merged into one component with a dynamic base.
     */
    mixHOCs: mixHOCs,
    

    // - Helper functions - //

    /** Create a data picker (returns a function): It's like Effect but for data with an intermediary extractor.
     * - Give an extractor that extracts an array out of your customly defined arguments.
     * - Whenever the extracted output has changed (in shallow sense by default), the selector will be run.
     * - The arguments of the selector is the extracted array spread out, and it should return the output data solely based on them.
     * - The whole point of this abstraction, is to trigger the presumably expensive selector call only when the cheap extractor func tells there's a change. */
    dataPicker: createDataPicker,
    /** Create a data selector (returns a function): It's like the DataPicker above, but takes in an array of extractors (not just one).
     * - Accordingly the outputs of extractors are then spread out as the arguments for the selector. */
    dataSelector: createDataSelector,
 

    // - Finding stuff - //

    findTreeNodesIn: (treeNode: MixDOMTreeNode, types?: RecordableType<MixDOMTreeNodeType>, maxCount?: number, inNested?: boolean, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): MixDOMTreeNode[] =>
        _Find.treeNodesWithin(treeNode, types && _Lib.buildRecordable<MixDOMTreeNodeType>(types), maxCount, inNested, overHosts, validator),
    findComponentsIn: <Comp extends ComponentTypeAny = ComponentTypeAny>(treeNode: MixDOMTreeNode, maxCount?: number, inNested?: boolean, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): Comp[] =>
        _Find.treeNodesWithin(treeNode, { boundary: true }, maxCount, inNested, overHosts, validator).map(t => (t.boundary && t.boundary.component) as unknown as Comp),
    findElementsIn: <T extends Node = Node>(treeNode: MixDOMTreeNode, maxCount?: number, inNested?: boolean, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): T[] =>
        _Find.treeNodesWithin(treeNode, { dom: true }, maxCount, inNested, overHosts, validator).map(tNode => tNode.domNode) as T[],
    queryElementIn: <T extends Element = Element>(treeNode: MixDOMTreeNode, selector: string, inNested?: boolean, overHosts?: boolean): T | null =>
        _Find.domElementByQuery<T>(treeNode, selector, inNested, overHosts),
    queryElementsIn: <T extends Element = Element>(treeNode: MixDOMTreeNode, selector: string, maxCount?: number, inNested?: boolean, overHosts?: boolean): T[] =>
        _Find.domElementsByQuery<T>(treeNode, selector, maxCount, inNested, overHosts),


    // - HTML helpers - //

    /** Read html content as string from the given treeNode, component or boundary.
     * Typically used with Host having settings.disableRendering (and settings.renderTimeout = null). */
    readAsString: (from: MixDOMTreeNode | Component | MixDOMBoundary): string => {
        const treeNode = from && (from.constructor["MIX_DOM_CLASS"] ? (from as Component).boundary.treeNode : (from as MixDOMBoundary).treeNode || typeof from["type"] === "string" && from as MixDOMTreeNode);
        return treeNode ? HostRender.readAsString(treeNode) : "";
    },

    // HTML attribute cleaners.
    /** Returns a string to be used as class name (with no duplicates and optional nested TypeScript verification).
     * - Each item in the classNames can be:
     *     1. ValidName (single className string),
     *     2. Array<ValidName>,
     *     3. Record<ValidName, any>.
     *     + If you want to use the validation only for Arrays and Records but not Strings, add 2nd parameter `string` to the type: `CleanClassName<ValidName, string>`
     * - Unfortunately, the name validation inputted here only works for Array and Record types, and single strings.
     * - To use concatenated class name strings (eg. "bold italic"), you should:
     *     1. Declare a validator by: `const cleanNames: ValidateNames<ValidName> = MixDOM.classNames;`
     *     2. Then use it like this: `const okName = cleanNames("bold italic", ["bold"], {"italic": false, "bold": true})`;
     */
    classNames: _Lib.cleanDOMClass,
    /** Convert a style cssText string into a dictionary with capitalized keys.
     * - For example: "background-color: #aaa" => { backgroundColor: "#aaa" }.
     * - The dictionary format is used for easy detection of changes.
     *   .. As we want to respect any external changes and just modify based on our own. (For style, class and any attributes.) */
    parseStyle: _Lib.cleanDOMStyle,


    // - General purpose utilities - //

    /** General equal comparison with level for deepness.
     * - nDepth: 0. No depth - simple check.
     * - nDepth: 1. Shallow equal.
     * - nDepth: 2. Shallow double equal.
     * - nDepth < 0. Deep. */
    areEqual: _Lib.areEqual,
    /** General inlined deep copy with level for deepness.
     * - nDepth: 0. No depth - pass directly.
     * - nDepth: 1. Shallow copy.
     * - nDepth: 2. Shallow double copy.
     * - nDepth < 0. Deep copy.
     * Note that by design classes (and other functions) are not copied, but class constructors are instanced again and all values applied.
     */
    deepCopy: _Lib.deepCopy,
    /** Notes:
     * - With end smaller than start, will give the same result but in reverse.
     * - If you use stepSize, always give it a positive number. Or will loop forever.
     * - Works for integers and floats. Of course floats might do what they do even with simple adding / subtraction.
     * Examples:
     * - range(3) => [0, 1, 2]
     * - range(1, 3) => [1, 2]
     * - range(3, 1) => [2, 1]
     * - range(1, -2) => [0, -1, -2]
     * - range(-3) => [-1, -2, -3]
     */
    range: _Lib.range,

};
