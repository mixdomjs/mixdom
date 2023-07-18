

// - Imports - //

import { SVGAttributesBy, SVGGraphicalEventAttributes } from "./_SVGTypes";
import { SignalListener, SignalsRecord } from "../classes/SignalMan";
import {
    PseudoElement,
    PseudoElementProps,
    PseudoFragment,
    PseudoFragmentProps,
    PseudoPortal,
    PseudoPortalProps,
    PseudoEmpty,
    PseudoEmptyProps,
 } from "../classes/ComponentPseudos";
import { ContentBoundary, SourceBoundary } from "../classes/Boundary";
import { ContentClosure } from "../classes/ContentClosure";
import { RefBase, RefDOMSignals } from "../classes/Ref";
import { ComponentSignals, ComponentTypeAny } from "../classes/Component";
import { ComponentStreamType } from "../classes/ComponentStream";
import { Host } from "../classes/Host";
import { Context } from "../classes/Context";


// - General - //

// Helpers for object-likes: dictionaries / classes.
export type Awaited<T> = T extends PromiseLike<infer U> ? U : T
export type Intersect<T> = (T extends any ? ((x: T) => 0) : never) extends ((x: infer R) => 0) ? R : never;
export type RecordableType<K extends string> = Partial<Record<K, any>> | Array<K> | Set<K>; // Iterable<K>;
export type Dictionary<V = any> = Record<string, V>;
export type CleanDictionary<T> = {[Key in keyof T]: T[Key]; };
export type CleanDictionaryWith<T, V = {}> = {[Key in keyof T]: [T[Key]] extends [V] ? T[Key] : never; };
export type ClassType<T = {}, Args extends any[] = any[]> = new (...args: Args) => T;
export type ClassMixer<TExtends extends ClassType> = <TBase extends ClassType>(Base: TBase) => Omit<TBase & TExtends, "new"> & { new (...args: GetConstructorArgs<TExtends>): GetConstructorReturn<TBase> & GetConstructorReturn<TExtends>; };
export type GetConstructorArgs<T> = T extends new (...args: infer U) => any ? U : never;
/** This senseless types makes the mixin typing work. */
export type GetConstructorReturn<T> = T extends new (...args: any[]) => infer U ? U : never;
/** Helper to collect up to 10 return types from an array of functions. */
export type ReturnTypes<T extends any[] | readonly any[]> =
    T[0] extends undefined ? [] : 
    T[1] extends undefined ? [ReturnType<T[0]>] : 
    T[2] extends undefined ? [ReturnType<T[0]>, ReturnType<T[1]>] : 
    T[3] extends undefined ? [ReturnType<T[0]>, ReturnType<T[1]>, ReturnType<T[2]>] : 
    T[4] extends undefined ? [ReturnType<T[0]>, ReturnType<T[1]>, ReturnType<T[2]>, ReturnType<T[3]>] : 
    T[5] extends undefined ? [ReturnType<T[0]>, ReturnType<T[1]>, ReturnType<T[2]>, ReturnType<T[3]>, ReturnType<T[4]>] : 
    T[6] extends undefined ? [ReturnType<T[0]>, ReturnType<T[1]>, ReturnType<T[2]>, ReturnType<T[3]>, ReturnType<T[4]>, ReturnType<T[5]>] : 
    T[7] extends undefined ? [ReturnType<T[0]>, ReturnType<T[1]>, ReturnType<T[2]>, ReturnType<T[3]>, ReturnType<T[4]>, ReturnType<T[5]>, ReturnType<T[6]>] : 
    T[8] extends undefined ? [ReturnType<T[0]>, ReturnType<T[1]>, ReturnType<T[2]>, ReturnType<T[3]>, ReturnType<T[4]>, ReturnType<T[5]>, ReturnType<T[6]>, ReturnType<T[7]>] : 
    T[9] extends undefined ? [ReturnType<T[0]>, ReturnType<T[1]>, ReturnType<T[2]>, ReturnType<T[3]>, ReturnType<T[4]>, ReturnType<T[5]>, ReturnType<T[6]>, ReturnType<T[7]>, ReturnType<T[8]>] : 
    [ReturnType<T[0]>, ReturnType<T[1]>, ReturnType<T[2]>, ReturnType<T[3]>, ReturnType<T[4]>, ReturnType<T[5]>, ReturnType<T[6]>, ReturnType<T[7]>, ReturnType<T[8]>, ReturnType<T[9]>];

// Unprecise.
// export type ClassMixer<TExtends extends ClassType> = <TBase extends ClassType>(Base: TBase) => TBase & TExtends;
// export type ClassBaseMixer<TExtends extends object> = <TBase extends ClassType>(Base: TBase) => TBase & ClassType<TExtends>;

// Unneeded.
// export type WithPromise<T> = T extends Promise<any> ? T : Promise<T>;
// export type IntersectBase<T, Base> = (T extends any ? ((x: T) => 0) : never) extends ((x: infer R) => 0) ? Base & R : never;
// export type NullLike = null | undefined; // Equivalent to check: someVar == null.
// export type NonDictionary = Array<any> | Set<any> | Map<any, any>;
// export type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;
// export type GetConstructorArgs<T> = T extends new (...args: infer U) => any ? U : never;
// export type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;  // <-- For some reason, Typescript's Omit is not working in the environment - so here's a copied type for it.
// export type Methods<T> = { [P in keyof T as T[P] extends Function ? P : never]: T[P] };
// export type NoMethods<T> = { [P in keyof T as T[P] extends Function ? never : P]: T[P] };
// export type ValueOf<T> = T[keyof T];
// export type NotEmptyString<Str extends string> = Str extends "" ? never : Str;
// export type NonArrayObject<T extends object = object> = { [index: number]: never; } & T; // <-- Thanks to Zach at: https://stackoverflow.com/questions/61148466/typescript-type-that-matches-any-object-but-not-arrays
// export type PureDictionary<T> = T extends Dictionary ? (T extends NonDictionary ? never : T) : never;
// export type WithFallback<Optional, Full> = Optional extends (never | undefined) ? Optional : Full;
// export type Choose<T, ValueTrue, ValueFalse> = T extends (never | undefined) ? ValueFalse : ValueTrue;
// export type PickInData<Data, DataKey extends string | undefined> = DataKey extends never | undefined ? Data : PropType<Data, DataKey & string>;
// export type Tail<T extends readonly any[]> = ((...t: T) => void) extends ((h: any, ...r: infer R) => void) ? R : never;
// export type Last<T extends readonly any[]> = number extends T['length'] ? T[1e100] : { [K in keyof T]: K extends keyof Tail<T> ? never : T[K] }[number];
    

// - HTML & SVG - //

export interface CSSProperties extends Partial<Omit<CSSStyleDeclaration, "item" | "getPropertyPriority" | "getPropertyValue" | "removeProperty" | "setProperty" | CSSNumericKeys> & Record<CSSNumericKeys, string | number>> {
    [index: number]: never;
};
/** Some commonly used CSS properties that can receive numeric input. */
export type CSSNumericKeys = 
    | "borderWidth"
    | "borderBottomWidth"
    | "borderLeftWidth"
    | "borderRightWidth"
    | "borderTopWidth"
    | "bottom"
    | "columnGap"
    | "flexGrow"
    | "flexShrink"
    | "fontWeight"
    | "gap"
    | "gridColumnEnd"
    | "gridColumnGap"
    | "gridColumnStart"
    | "gridRowEnd"
    | "gridRowGap"
    | "gridRowStart"
    | "height"
    | "inset"
    | "left"
    | "margin"
    | "marginBottom"
    | "marginLeft"
    | "marginRight"
    | "marginTop"
    | "maxWidth"
    | "maxHeight"
    | "minWidth"
    | "minHeight"
    | "offsetDistance"
    | "opacity"
    | "order"
    | "outlineWidth"
    | "padding"
    | "paddingTop"
    | "paddingBottom"
    | "paddingLeft"
    | "paddingRight"
    | "right"
    | "rowGap"
    | "scrollMargin"
    | "scrollMarginBlock"
    | "scrollMarginBlockEnd"
    | "scrollMarginBlockStart"
    | "scrollMarginBottom"
    | "scrollMarginInline"
    | "scrollMarginInlineEnd"
    | "scrollMarginInlineStart"
    | "scrollMarginLeft"
    | "scrollMarginRight"
    | "scrollMarginTop"
    | "scrollPadding"
    | "scrollPaddingBlock"
    | "scrollPaddingBlockEnd"
    | "scrollPaddingBlockStart"
    | "scrollPaddingBottom"
    | "scrollPaddingInline"
    | "scrollPaddingInlineEnd"
    | "scrollPaddingInlineStart"
    | "scrollPaddingLeft"
    | "scrollPaddingRight"
    | "scrollPaddingTop"
    | "stopOpacity"
    | "strokeWidth"
    | "strokeOpacity"
    | "tabIndex"
    | "tabSize"
    | "top"
    | "width"
    | "zIndex"
;

export type HTMLTags = keyof HTMLElementTagNameMap;
export type HTMLElementType<Tag extends HTMLTags = HTMLTags> = HTMLElementTagNameMap[Tag];
export type SVGTags = keyof SVGElementTagNameMap;
export type SVGElementType<Tag extends SVGTags = SVGTags> = SVGElementTagNameMap[Tag];
export type DOMTags = HTMLTags | SVGTags;
export type DOMElement = HTMLElement | SVGElement;
export type ListenerAttributeNames = keyof ListenerAttributesAll;
export type ListenerAttributes = { [Name in keyof ListenerAttributesAll]?: ListenerAttributesAll[Name] | null; };
export type HTMLAttributes<Tag extends HTMLTags = HTMLTags> = Partial<Omit<HTMLElementType<Tag>, "style" | "class" | "className" | "textContent" | "innerHTML" | "outerHTML" | "outerText" | "innerText">> & Partial<ListenerAttributesAll>;
export type SVGAttributes<Tag extends SVGTags = SVGTags> = Omit<SVGAttributesBy[Tag], "style" | "class" | "className"> & Partial<ListenerAttributesAll>;
export type HTMLSVGAttributes<Tag extends DOMTags = DOMTags, Other = never> = [Tag] extends [HTMLTags] ? HTMLAttributes<Tag> : [Tag] extends [SVGTags] ? SVGAttributes<Tag> : Other;
export type HTMLSVGAttributesBy = { [Tag in DOMTags]: HTMLSVGAttributes<Tag>; };

export interface ListenerAttributesAll {
    onAbort: GlobalEventHandlers["onabort"];
    onActivate: SVGGraphicalEventAttributes["onActivate"];
    onAnimationCancel: GlobalEventHandlers["onanimationcancel"];
    onAnimationEnd: GlobalEventHandlers["onanimationend"];
    onAnimationIteration: GlobalEventHandlers["onanimationiteration"];
    onAnimationStart: GlobalEventHandlers["onanimationstart"];
    onAuxClick: GlobalEventHandlers["onauxclick"];
    onBlur: GlobalEventHandlers["onblur"];
    // onCancel: Animation["oncancel"];
    onCanPlay: GlobalEventHandlers["oncanplay"];
    onCanPlayThrough: GlobalEventHandlers["oncanplaythrough"];
    onChange: GlobalEventHandlers["onchange"];
    onClick: GlobalEventHandlers["onclick"];
    onClose: GlobalEventHandlers["onclose"];
    onContextMenu: GlobalEventHandlers["oncontextmenu"];
    onCueChange: GlobalEventHandlers["oncuechange"];
    onDblClick: GlobalEventHandlers["ondblclick"];
    onDrag: GlobalEventHandlers["ondrag"];
    onDragEnd: GlobalEventHandlers["ondragend"];
    onDragEnter: GlobalEventHandlers["ondragenter"];
    // onDragExit: GlobalEventHandlers["ondragexit"];
    onDragLeave: GlobalEventHandlers["ondragleave"];
    onDragOver: GlobalEventHandlers["ondragover"];
    onDragStart: GlobalEventHandlers["ondragstart"];
    onDrop: GlobalEventHandlers["ondrop"];
    onDurationChange: GlobalEventHandlers["ondurationchange"];
    onEmptied: GlobalEventHandlers["onemptied"];
    onEnded: GlobalEventHandlers["onended"];
    onError: GlobalEventHandlers["onerror"];
    onFocus: GlobalEventHandlers["onfocus"];
    onFocusIn: SVGGraphicalEventAttributes["onFocusIn"];
    onFocusOut: SVGGraphicalEventAttributes["onFocusOut"];
    onGotPointerCapture: GlobalEventHandlers["ongotpointercapture"];
    onInput: GlobalEventHandlers["oninput"];
    onInvalid: GlobalEventHandlers["oninvalid"];
    onKeyDown: GlobalEventHandlers["onkeydown"];
    // Note, onkeypress is deprecated, but we need to support it nevertheless - for some while, at least.
    // onKeyPress: GlobalEventHandlers["onkeypress"];
    onKeyPress: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null;
    onKeyUp: GlobalEventHandlers["onkeyup"];
    onLoad: GlobalEventHandlers["onload"];
    onLoadedData: GlobalEventHandlers["onloadeddata"];
    onLoadedMetaData: GlobalEventHandlers["onloadedmetadata"];
    // onLoadEnd: GlobalEventHandlers["onloadend"];
    onLoadStart: GlobalEventHandlers["onloadstart"];
    onLostPointerCapture: GlobalEventHandlers["onlostpointercapture"];
    onMouseDown: GlobalEventHandlers["onmousedown"];
    onMouseEnter: GlobalEventHandlers["onmouseenter"];
    onMouseLeave: GlobalEventHandlers["onmouseleave"];
    onMouseMove: GlobalEventHandlers["onmousemove"];
    onMouseOut: GlobalEventHandlers["onmouseout"];
    onMouseOver: GlobalEventHandlers["onmouseover"];
    onMouseUp: GlobalEventHandlers["onmouseup"];
    onPause: GlobalEventHandlers["onpause"];
    onPlay: GlobalEventHandlers["onplay"];
    onPlaying: GlobalEventHandlers["onplaying"];
    onPointerCancel: GlobalEventHandlers["onpointercancel"];
    onPointerDown: GlobalEventHandlers["onpointerdown"];
    onPointerEnter: GlobalEventHandlers["onpointerenter"];
    onPointerLeave: GlobalEventHandlers["onpointerleave"];
    onPointerMove: GlobalEventHandlers["onpointermove"];
    onPointerOut: GlobalEventHandlers["onpointerout"];
    onPointerOver: GlobalEventHandlers["onpointerover"];
    onPointerUp: GlobalEventHandlers["onpointerup"];
    onProgress: GlobalEventHandlers["onprogress"];
    onRateChange: GlobalEventHandlers["onratechange"];
    onReset: GlobalEventHandlers["onreset"];
    onResize: GlobalEventHandlers["onresize"];
    onScroll: GlobalEventHandlers["onscroll"];
    onSecurityPolicyViolation: GlobalEventHandlers["onsecuritypolicyviolation"];
    onSeeked: GlobalEventHandlers["onseeked"];
    onSeeking: GlobalEventHandlers["onseeking"];
    onSelect: GlobalEventHandlers["onselect"];
    onStalled: GlobalEventHandlers["onstalled"];
    onSubmit: GlobalEventHandlers["onsubmit"];
    onSuspend: GlobalEventHandlers["onsuspend"];
    onTimeUpdate: GlobalEventHandlers["ontimeupdate"];
    onToggle: GlobalEventHandlers["ontoggle"];
    onTouchCancel: GlobalEventHandlers["ontouchcancel"];
    onTouchEnd: GlobalEventHandlers["ontouchend"];
    onTouchMove: GlobalEventHandlers["ontouchmove"];
    onTouchStart: GlobalEventHandlers["ontouchstart"];
    onTransitionCancel: GlobalEventHandlers["ontransitioncancel"];
    onTransitionEnd: GlobalEventHandlers["ontransitionend"];
    onTransitionRun: GlobalEventHandlers["ontransitionrun"];
    onTransitionStart: GlobalEventHandlers["ontransitionstart"];
    onVolumeChange: GlobalEventHandlers["onvolumechange"];
    onWaiting: GlobalEventHandlers["onwaiting"];
    onWheel: GlobalEventHandlers["onwheel"];
}


// - Node JS - //

export interface NodeJSTimeout {
    ref(): this;
    unref(): this;
    hasRef(): boolean;
    refresh(): this;
    [Symbol.toPrimitive](): number;
}


// - MixDOM html - //

/** Type for className input.
 * - Represents what can be fed into the MixDOM.classNames method with (ValidName extends string):
 *     1. ValidName (single className string),
 *     2. Array<ValidName>,
 *     3. Record<ValidName, any>.
 *     + If you want to use the validation only for Arrays and Records but not Strings, add 2nd parameter `string` to the type: `CleanClassName<ValidName, string>`
 * - Unfortunately, currently the name validation only works for Array and Record types, and single strings.
 * - To use concatenated class name strings (eg. "bold italic"), you have three options:
 *     1. Use `MixDOM.classNamesWith("" as ValidName, longName);`
 *     2. Create a validator with `const getClassNames = MixDOM.createNameValidator<ValidName>;` and use it with `getClassNames(longName)`.
 *     3. If you're dealing with a string type (not object), and have (or store) it as a variable, you can do: `MixDOM.classNames<ValidName, typeof longName>(longName)`.
 *     +  Note that maybe later TS might support it so that can use `MixDOM.classNames<ValidName>(longName)` without the second type parameter like above.
 */
export type MixDOMPreClassName<Valid extends string = string, Single extends string = Valid> = Single | Partial<Record<Valid, any>> | Array<Valid> | Set<Valid>;
//
// <-- Let's not allow deep anymore, it also messes with arrays and the <Single>. So dropping the recursion: | Array<MixDOMPreClassName<Valid, Single>> | Set<MixDOMPreClassName<Valid, Single>>;


// - Component & Boundary - //

export type MixDOMDoubleRenderer<Props extends Dictionary = {}, State extends Dictionary = {}> = (props: Props, state: State) => MixDOMRenderOutput | MixDOMDoubleRenderer<Props, State>;
export type MixDOMBoundary = SourceBoundary | ContentBoundary;
export type MixDOMSourceBoundaryId = string;


// - Tags - //

export type MixDOMPseudoTag<Props extends Dictionary = {}> =
    | ([Props] extends [PseudoFragmentProps] ? typeof PseudoFragment<Props> : never)
    | ([Props] extends [PseudoElementProps] ? typeof PseudoElement<HTMLTags | SVGTags, Props> : never)
    | ([Props] extends [PseudoPortalProps] ? typeof PseudoPortal<Props> : never)
    | ([Props] extends [PseudoEmptyProps] ? typeof PseudoEmpty<Props> : never)
;
export type MixDOMComponentTag<Props extends Dictionary = {}> = ComponentTypeAny<Props> | MixDOMPseudoTag<Props>;
// export type MixDOMPreTag = DOMTags | MixDOMPseudoTag | typeof PseudoEmpty | MixDOMComponentTag;
export type MixDOMPreTag = DOMTags | MixDOMPseudoTag | MixDOMComponentTag;
export type MixDOMPostTag = "" | "_" | DOMTags | MixDOMComponentTag | null;
/** This tag conversion is used for internal tag based def mapping. The MixDOMDefTarget is the MixDOM.ContentPass.
 * The number type refers to _Apply.SEARCH_TAG_BY_TYPE values. */
export type MixDOMDefKeyTag = MixDOMPostTag | MixDOMDefTarget | typeof PseudoFragment | Host | number;


// - Virtual dom for hydration - //

// Type for hydration mapping.
export type MixDOMHydrationItem = {
    tag: DOMTags;
    node: Element | SVGElement | Node;
    parent: MixDOMHydrationItem | null;
    children?: MixDOMHydrationItem[];
    key?: any;
    used?: boolean;
};
/** Should return true like value to accept, false like to not accept. */
export type MixDOMHydrationValidator = (item: MixDOMHydrationItem | null, treeNode: MixDOMTreeNodeDOM, tag: DOMTags | "_" | "", key: any) => any;
/** Should return a Node or MixDOMHydrationItem to suggest, or null otherwise. */
export type MixDOMHydrationSuggester = (item: MixDOMHydrationItem | null, treeNode: MixDOMTreeNodeDOM, tag: DOMTags | "_" | "", key: any) => Node | MixDOMHydrationItem | null;


// - PRE Props - //

export interface MixDOMPreBaseProps {
    /** Disable the def altogether - including all contents inside. (Technically makes the def amount to null.) */
    _disable?: boolean;
    /** Attach key for moving the def around. */
    _key?: any;
    /** Attach one or many refs. */
    _ref?: RefBase | RefBase[];
}
export interface MixDOMPreProps<Signals extends SignalsRecord = {}> extends MixDOMPreBaseProps {
    /** Attach signals. */
    _signals?: Partial<Signals> | null;
    /** Attach named contexts on a child component. Any changes in these will call component.contextAPI.setContext() accordingly. */
    _contexts?: Partial<Record<string, Context | null>> | null;
}
/** Dev. note. The current decision is to rely on JSX global declaration and not include MixDOMPreComponentProps into each Component type (including funcs) or constructor(props).
 * - However, the _signals are reliant on having more typed info to be used nicely. So that's why we have this type specifically. The _signals will not be there during the render cycle, tho. 
 * - Note that above decision relies mainly on two things: 1. The JSX intrinsic declaration is anyway needed for DOM elements, 2. It's very confusing to have _key and _disable appearing in the type inside render method / func.
 */
export type MixDOMPreComponentOnlyProps<Signals extends SignalsRecord = {}> = {
    /** Attach signals to component. Exceptionally the _signals prop is exposed even tho it will not be there during the render cycle. It's exposed due to getting better typing experience when using it in TSX. */
    _signals?: Partial<ComponentSignals & Signals> | null;
    /** Attach named contexts on a child component. Any changes in these will call component.contextAPI.setContext() accordingly. */
    _contexts?: Partial<Record<string, Context | null>> | null;
}
export type MixDOMPreComponentProps<Signals extends SignalsRecord = {}> = MixDOMPreBaseProps & MixDOMPreComponentOnlyProps<Signals>;

/** This combines all the internal dom props together: "_key", "_ref", "_disable" and _"signals" with its dom specific listeners. */
export interface MixDOMPreDOMProps extends MixDOMPreBaseProps {
    /** The common DOM signals are the same as with Refs: "domDidAttach", "domWillDetach", "domDidMount", "domDidUpdate", "domDidContent", "domDidMove" and "domWillUnmount". */
    _signals?: Partial<RefDOMSignals> | null;
}
/** This includes all the internal dom props (_key, _ref, ...) as well as common attributes (class, className, style, data, ...) and any specific for the given DOM tag. */
export type MixDOMPreDOMTagProps<Tag extends DOMTags = DOMTags> = MixDOMPreDOMProps & HTMLSVGAttributes<Tag, {}> & ListenerAttributes & MixDOMCommonDOMProps;


// - POST Props - //

export interface MixDOMCommonDOMProps { 
    class?: string;
    className?: string;
    style?: CSSProperties | string;
    data?: Dictionary;
}
/** These are any DOM props excluding internal props (like _key, _ref, ...), but also including HTML and SVG attributes (including listeners) by inputting Tag. */
export type MixDOMDOMProps<Tag extends DOMTags = DOMTags> = HTMLSVGAttributes<Tag, {}> & ListenerAttributes & MixDOMCommonDOMProps;

/** Post props don't contain key, ref. In addition className and class have been merged, and style processed to a dictionary. */
export type MixDOMProcessedDOMProps = { className?: string; style?: CSSProperties; data?: Dictionary; };


// - JSX - Intrinsic attributes - //

/** Meant for JSX.
 * - Generic support for "_key", "_ref" and "_disable" props (by catch phrase).
 *      * Note that for components, the "_signals" prop is component specific, so uses the initial props on constructor or func.
 *      * This means, each component should be typed with shortcuts (eg. `ComponentFunc<Info>`). To do it manually initProps should have MixDOMPreComponentProps included.
 * - For each dom tag (= HTML & SVG tags), adds their attributes including listeners.
 *      * In addition, for each dom tag adds support for "_signals" related to dom changes.
 */
export type IntrinsicAttributesBy = { [CompOrEl: string]: MixDOMPreProps | MixDOMPreComponentProps; } & {[Tag in keyof HTMLSVGAttributesBy]: MixDOMPreDOMProps & MixDOMCommonDOMProps; } & HTMLSVGAttributesBy;


// - Render output types - //

export type MixDOMContentNull = null | undefined;
export type MixDOMContentValue = string | number;
export type MixDOMContentSimple = MixDOMContentValue | Node;
export type MixDOMRenderOutputSingle = MixDOMDefTarget | MixDOMContentSimple | MixDOMContentNull | Host;
export interface MixDOMRenderOutputMulti extends Array<MixDOMRenderOutputSingle | MixDOMRenderOutputMulti> {} // This is a recursive type, might be nested array.
export type MixDOMRenderOutput = MixDOMRenderOutputSingle | MixDOMRenderOutputMulti;


// - Update related - //

export interface MixDOMComponentUpdates<Props extends Dictionary = {}, State = {}> {
    props?: Props;
    state?: State;
    force?: boolean | "all";
}

/** Defines how often components should render after updates (how onShouldUpdate works).
 * - "always" means they will always re-render. You should use this only for debugging.
 * - "changed" means they will render if the reference has changed.
 * - "shallow" means they will render if any prop (of an object/array) has changed. This is the default for most.
 * - "double" is like "shallow" but any prop value that is object or array will do a further shallow comparison to determine if it has changed.
 * - "deep" compares all the way down recursively. Only use this if you it's really what you want - never use it with recursive objects (= with direct or indirect self references).
 */
export type MixDOMUpdateCompareMode = "never" | "always" | "changed" | "shallow" | "double" | "deep";
/** Defines how often components should update for each updatable type: props, state, context.
 * - If type not defined, uses the default value for it.
 * - Note that the pure checks only check those types that have just been changed.
 */
export interface MixDOMUpdateCompareModesBy {
    props: MixDOMUpdateCompareMode | number;
    state: MixDOMUpdateCompareMode | number;
}


// - DOM diffs - //

/** Differences made to a dom element. Note that this never includes tag changes, because it requires creating a new element. */
export interface MixDOMDOMDiffs {
    /** If no attributes, no changes in general attributes. If value in the dictionary is undefined means removed. */
    attributes?: Dictionary;
    /** If no listeners, no changes in listeners. If value in the dictionary is undefined means removed. */
    listeners?: Dictionary;
    /** If no style, no changes in styles. If value in the dictionary is undefined means removed. */
    style?: CSSProperties;
    /** If no data, no changes in data attribute. If value in the dictionary is undefined means removed. */
    data?: Dictionary;
    /** If no classNames, no changes in class names. The keys are class names: for each, if true class name was added, if false name was removed. */
    classNames?: Record<string, boolean>;
}


// - Change & render infos - //

/** This info is used for executing rendering changes to dom for a given appliedDef (which is modified during the process).
 * - If props is given it modifies the class, style and attributes of the element. This modifies the .domProps in the appliedDef.
 * - If create info is provided, creates a new dom element.
 * - If move info is provided, moves the given element to the new location.
 * - If destroy is provided, removes the element from dom and from appliedDef.domElement.
 */
interface MixDOMRenderInfoBase {
    treeNode: MixDOMTreeNode;
    remove?: boolean;
    create?: boolean;
    move?: boolean;
    emptyMove?: boolean;
    update?: boolean;
    content?: boolean;
    swap?: boolean | Node;
    refresh?: boolean | "read";
}
interface MixDOMRenderInfoBoundary extends MixDOMRenderInfoBase {
    treeNode: MixDOMTreeNodeBoundary | MixDOMTreeNodePass;
    remove?: true;
    create?: false;
    update?: false;
    content?: false;
    move?: false | never;
    swap?: false;
}
interface MixDOMRenderInfoDOMLike extends MixDOMRenderInfoBase {
    treeNode: MixDOMTreeNodeDOM | MixDOMTreeNodePortal;
    swap?: boolean | Node;
    remove?: true;
    create?: true;
    move?: true;
    update?: true;
    content?: true;
}
interface MixDOMRenderInfoHost extends MixDOMRenderInfoBase {
    treeNode: MixDOMTreeNodeHost;
    remove?: boolean;
    create?: boolean;
    move?: boolean;
    update?: false;
    content?: false;
    swap?: false;
}
export type MixDOMRenderInfo = MixDOMRenderInfoBoundary | MixDOMRenderInfoDOMLike | MixDOMRenderInfoHost;

/** This only includes the calls that can be made after the fact: onUnmount is called before (so not here). */
export type MixDOMSourceBoundaryChangeType = "mounted" | "updated" | "moved";
export type MixDOMSourceBoundaryChange = [ boundary: SourceBoundary, changeType: MixDOMSourceBoundaryChangeType, prevProps?: Dictionary, prevState?: Dictionary ];
export type MixDOMChangeInfos = [ MixDOMRenderInfo[], MixDOMSourceBoundaryChange[] ];



// - Defs - //

/** Describes what kind of def it is.
 * - Compared to treeNode.type, we have extra: "content" | "element" | "fragment". But don't have "root" (or ""). */
export type MixDOMDefType = "dom" | "content" | "element" | "portal" | "boundary" | "pass" | "contexts" | "fragment" | "host";
type MixDOMSpreadLinks = {
    /** This contains any true and copy passes. It's the point where the inner spread stopped processing, and the parent spread can continue from it. */
    passes: MixDOMDefTarget[];
    /** This contains any MixDOM.WithContent components, if they were not sure whether they actually have content or not (due to only having "pass" defs without any solid stuff). 
     * - The structure is [ childDefs, withDef ], where childDefs are the children originally passed to the spread.
     */
    withs: [childDefs: MixDOMDefTarget[], withDef: MixDOMDefTarget & { props: { hasContent?: boolean; }; }][];
};

interface MixDOMDefBase<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> {

    // Mandatory.
    /** This is to distinguish from other objects as well as to define the type both in the same.
     * - That's why it's name so strangely (to distinguish from objects), but still somewhat sensibly to be readible.
     * - In earlier quick tests, it seemed (almost 2x) faster to use { _isDef: true} as opposed to creating a new class instance (without _isDef member). */
    MIX_DOM_DEF: MixDOMDefType;
    tag: MixDOMPostTag;
    childDefs: MixDOMDefApplied[] | MixDOMDefTarget[];

    // Internal.
    /** The def should be skipped - used internally.
     * - Currently only used for type "content" for settings.noRenderValuesMode and "fragment" for withContent() and spread usage. */
    disabled?: boolean;

    // Common optional.
    key?: any;
    attachedRefs?: RefBase[];
    attachedSignals?: Partial<Record<string, SignalListener[0]>>;
    attachedContexts?: Partial<Record<string, Context | null>>;

    // Common to types: "dom" | "element" | "boundary".
    props?: Props;

    // Others - only for specific types.
    // .. Fragment.
    isArray?: boolean;
    scopeType?: "spread" | "spread-pass" | "spread-copy";
    scopeMap?: Map<MixDOMDefKeyTag, MixDOMDefApplied[]>;
    spreadLinks?: MixDOMSpreadLinks;
    // .. Content.
    domContent?: MixDOMContentSimple | null;
    domHTMLMode?: boolean;
    // .. Element.
    domElement?: HTMLElement | SVGElement | null;
    domCloneMode?: MixDOMCloneNodeBehaviour | "" | null;
    // .. Portal.
    domPortal?: Node | null;
    // .. Pass.
    contentPass?: ContentClosure | null;
    contentPassType?: "pass" | "copy";
    getStream?: () => ComponentStreamType;
    // streamNeeds?: boolean | "temp" | null;
    // .. Host.
    host?: Host;
    // .. Boundary.
    hasPassWithin?: true;

    // Other.
    treeNode?: MixDOMTreeNode;

}
export interface MixDOMDefDOM<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase<Props> {
    MIX_DOM_DEF: "dom";
    tag: DOMTags;
    props: Props;
    attachedRefs?: RefBase[];
}
export interface MixDOMDefContent extends MixDOMDefBase {
    MIX_DOM_DEF: "content";
    tag: "" | DOMTags;
    domContent: MixDOMContentSimple;
    domHTMLMode?: false;
    props?: never;
}
export interface MixDOMDefContentInner<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase {
    MIX_DOM_DEF: "content";
    tag: "" | DOMTags;
    domContent: MixDOMContentSimple;
    /** If true, sets the content as innerHTML. */
    domHTMLMode: true;
    props?: Props;
}
export interface MixDOMDefElement<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase<Props> {
    MIX_DOM_DEF: "element";
    tag: "_";
    props: Props;
    domElement: HTMLElement | SVGElement | null;
    domCloneMode?: MixDOMCloneNodeBehaviour | "" | null;
}
export interface MixDOMDefPortal<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase<Props> {
    MIX_DOM_DEF: "portal";
    tag: null;
    domPortal: Node | null;
    props?: never;
}
export interface MixDOMDefBoundary<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase<Props> {
    MIX_DOM_DEF: "boundary";
    tag: MixDOMComponentTag;
    props: Props;
    /** Internal marker put on the applied def to mark that was passed in a content pass.
     * - This helps to form a parental chain of closures that pass the content down.
     * - This in turn helps to make WithContent feature work recursively.
     * - Note that alternatively this could be after-checked in contentClosure.preRefresh.
     *      * However, it's more performant to just go check for this while pairing defs.
     */
    hasPassWithin?: true;
}
export interface MixDOMDefFragment extends MixDOMDefBase {
    MIX_DOM_DEF: "fragment";
    tag: null;
    isArray?: boolean;
    scopeType?: MixDOMDefBase["scopeType"];
    /** This helps to optimize nested spread processing, as well as handle WithContent recursively for spreads. */
    spreadLinks?: MixDOMDefBase["spreadLinks"];
    /** Scope map is used only on the applied def side.
     * - This is used to isolate the scopes for the pairing process.
     * - For example, any spread function outputs, and any content pass copies in them, should be isolated.
     * - This means, that when the root of the isolation is paired with a new target, the inner pairing will use this scope only - and nothing else can use it. */
    scopeMap?: Map<MixDOMDefKeyTag, MixDOMDefApplied[]>;
}
export interface MixDOMDefPass extends MixDOMDefBase {
    MIX_DOM_DEF: "pass";
    tag: null;
    contentPass?: ContentClosure | null;
    contentPassType?: "pass" | "copy";
    /** If is about a stream, this is assigned and gets the common static class part for a stream component. */
    getStream?: () => ComponentStreamType;
    // /** If the pass refers to a stream, the locally set needs are here - they are tied to this particular pass and set while creating the def. */
    // streamNeeds?: boolean | "temp" | null;
    props?: never;
}
export interface MixDOMDefHost extends MixDOMDefBase {
    MIX_DOM_DEF: "host";
    tag: null;
    host: Host;
    props?: never;
}
export type MixDOMDefTypesAll = MixDOMDefDOM | MixDOMDefContent | MixDOMDefContentInner | MixDOMDefElement | MixDOMDefPortal | MixDOMDefBoundary | MixDOMDefPass | MixDOMDefFragment | MixDOMDefHost;

export interface MixDOMDefAppliedBase extends MixDOMDefBase {
    childDefs: MixDOMDefApplied[];
    action: "mounted" | "moved" | "updated";
    treeNode?: MixDOMTreeNode;
}
export interface MixDOMDefTargetBase extends MixDOMDefBase {
    childDefs: MixDOMDefTarget[];
    treeNode?: never;
    action?: never;
}

export type MixDOMDefApplied = MixDOMDefAppliedBase & MixDOMDefTypesAll;
export type MixDOMDefTarget = MixDOMDefTargetBase & MixDOMDefTypesAll;



// - Grounded tree - //
export type MixDOMTreeNodeType = "dom" | "portal" | "boundary" | "pass" | "contexts" | "host" | "root";
interface MixDOMTreeNodeBase {

    // - Mandatory - //

    /** The main type of the treeNode that defines how it should behave and what it contains.
     * The type "" is only used temporarily - it can only end up in treeNodes if there's an error. */
    type: MixDOMTreeNodeType | "";
    /** Normally, only the root has no parent, but all others do.
     * However, if we are talking about a treeNode that is no longer in the tree (= a dead branch),
     * .. then the parent is null, or one of the parents in the chain is null even though it's not a real root node. */
    parent: MixDOMTreeNode | null;
    /** The treeNodes inside - for navigation. */
    children: MixDOMTreeNode[];
    /** Every treeNode has a domNode reference. It refers to the NEAREST DOM ELEMENT DOWNWARDS from this treeNode.
     * - So if this treeNode is of "dom" type, it's actually its own node.
     * - But boundaries and other abstractions do not have their own dom node.
     * - Instead, it's updated UPWARDS (until meets a dom tag parent) from an actual treeNode with dom element upon create / remove / move.
     *   .. The reason for this weirdness is bookkeeping performance logic (see HostRender.findInsertionNodes).
     *   .. We do minimal bookkeeping for a very quick way to find where any node should be.*/
    domNode: DOMElement | Node | null;
    /** The boundary that produced this tree node - might be passed through content closures. */
    sourceBoundary: SourceBoundary | null;

    // - Optional - //

    /** If refers to a boundary - either a custom class / functino or then a content passing boundary. */
    boundary?: MixDOMBoundary | null;
    /** The def tied to this particular treeNode. */
    def?: MixDOMDefApplied;

};
interface MixDOMTreeNodeBaseWithDef extends MixDOMTreeNodeBase {
    def: MixDOMDefApplied;
}
export interface MixDOMTreeNodeEmpty extends MixDOMTreeNodeBase {
    type: "";
};
export interface MixDOMTreeNodeRoot extends MixDOMTreeNodeBase {
    type: "root";
    def?: never;
};
export interface MixDOMTreeNodeDOM extends MixDOMTreeNodeBaseWithDef {
    type: "dom";
    /** This exists only for treeNodes referring to dom elements (typeof appliedDef.tag === "string").
     * To avoid ever missing diffs, it's best to hold a memory for the props that were actually applied to a dom element.
     * Note. Like React, we do not want to read the state of the dom element due to 2 reasons:
     *   1. Reading from dom element is relatively slow (in comparison to reading property of an object).
     *   2. It's actually better for outside purposes that we only take care of our own changes to dom - not forcing things there (except create / destroy our own). */
    domProps: MixDOMProcessedDOMProps;
};
export interface MixDOMTreeNodePortal extends MixDOMTreeNodeBaseWithDef {
    type: "portal";
    /** For portals, the domNode refers to the external container. */
    domNode: MixDOMTreeNodeBase["domNode"];
};
export interface MixDOMTreeNodeBoundary extends MixDOMTreeNodeBaseWithDef {
    type: "boundary";
    /** This will be set to the treeNode right after instancing the source boundary. */
    boundary: SourceBoundary;
};
export interface MixDOMTreeNodePass extends MixDOMTreeNodeBaseWithDef {
    type: "pass";
    /** This will be set to the treeNode right after instancing the content boundary.
     * - It's null only if there's no content, otherwise there's a content boundary.*/
    boundary: ContentBoundary | null;
};
export interface MixDOMTreeNodeHost extends MixDOMTreeNodeBaseWithDef {
    type: "host";
};
export type MixDOMTreeNode = MixDOMTreeNodeEmpty | MixDOMTreeNodeDOM | MixDOMTreeNodePortal | MixDOMTreeNodeBoundary | MixDOMTreeNodePass | MixDOMTreeNodeHost | MixDOMTreeNodeRoot;


interface DefPseudo {
    MIX_DOM_DEF?: "";
    childDefs: MixDOMDefApplied[] | MixDOMDefTarget[];
    disabled?: boolean;
    type?: MixDOMDefType | "";
    tag?: any;
    isArray?: boolean;
    props?: Dictionary | MixDOMProcessedDOMProps;
    domElement?: HTMLElement | SVGElement | null;
    _skipDef?: true;
}
export interface MixDOMDefTargetPseudo extends DefPseudo { childDefs: MixDOMDefTarget[]; scopeType?: MixDOMDefFragment["scopeType"]; scopeMap?: MixDOMDefFragment["scopeMap"]; }; // withContent?: boolean | (() => ComponentStreamType); };
export interface MixDOMDefAppliedPseudo extends DefPseudo { childDefs: MixDOMDefApplied[]; scopeType?: MixDOMDefFragment["scopeType"]; scopeMap?: MixDOMDefFragment["scopeMap"]; action?: MixDOMDefAppliedBase["action"]; hasPassWithin?: true; };


// - Content envelope - //

export interface MixDOMContentEnvelope {
    applied: MixDOMDefApplied;
    target: MixDOMDefTarget;
}


// - Settings - //

/** The basic dom node cloning modes - either deep or shallow: element.clone(mode === "deep").
 * - If in "always" then is deep, and will never use the original. */
export type MixDOMCloneNodeBehaviour = "deep" | "shallow" | "always";
export type MixDOMRenderTextTagCallback = (text: string | number) => Node | null;
export type MixDOMRenderTextContentCallback = (text: string | number) => string | number;
export type MixDOMRenderTextTag = DOMTags | "" | MixDOMRenderTextTagCallback;



// - - - - - - - //
// - Algoritms - //
// - - - - - - - //

// - Merge classes - //

/** Helper to merge classes. This is used for the related functionality for extendClass and mergeClasses methods. */
export type MergeClasses<
    A extends ClassType = ClassType,
    B extends ClassType = ClassType,
    C extends ClassType = ClassType,
    D extends ClassType = ClassType,
    E extends ClassType = ClassType,
    F extends ClassType = ClassType,
    G extends ClassType = ClassType,
    H extends ClassType = ClassType,
    I extends ClassType = ClassType,
    J extends ClassType = ClassType,
    Instance extends Object = InstanceType<A> & InstanceType<B> & InstanceType<C> & InstanceType<D> & InstanceType<E> & InstanceType<F> & InstanceType<G> & InstanceType<H> & InstanceType<I> & InstanceType<J>
> = Omit<A & B & C & D & E & F & G & H & I & J, "new"> & { new (...args: any[]): Instance; };


// - Algoritm: Get nested value & join & split - //
//
// These are thanks to: https://github.com/microsoft/TypeScript/pull/40336

export type Join<T extends unknown[], D extends string> =
    T extends [] ? '' :
    T extends [string | number | boolean | bigint] ? `${T[0]}` :
    T extends [string | number | boolean | bigint, ...infer U] ? `${T[0]}${D}${Join<U, D>}` :
    string;

/** Split a string into a typed array.
 * - Use with PropType to validate and get deep value types with, say, dotted strings. */
export type Split<S extends string, D extends string> =
    string extends S ? string[] :
    S extends '' ? [] :
    S extends `${infer T}${D}${infer U}` ? [T, ...Split<U, D>] :
    [S];
export type SplitOnce<S extends string, D extends string> =
    string extends S ? string[] :
    S extends '' ? [] :
    S extends `${infer T}${D}${infer U}` ? [T, U] :
    [S];
export type FirstSplit<S extends string, D extends string> =
    string extends S ? string :
    S extends '' ? '' :
    S extends `${infer T}${D}${string}` ? T :
    S;
export type SecondSplit<S extends string, D extends string> =
    string extends S ? string :
    S extends '' ? '' :
    S extends `${string}${D}${infer T}` ? T :
    S;

/** Get deep value type. If puts 3rd param to never, then triggers error with incorrect path. */
export type PropType<T, Path extends string, Unknown = unknown> =
    string extends Path ? Unknown :
    Path extends keyof T ? T[Path] :
    Path extends `${infer K}.${infer R}` ? K extends keyof T ? PropType<T[K], R, Unknown> : Unknown :
    Unknown;


// - Custom algoritms for building dotted string suggestions - //

// Helper - to iterate up to 10. If used with negative (or higher) value, iterates forever.
type SafeIterator = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...0[]];

/** Collect structural data keys from a deep dictionary as dotted strings.
 * - Does not go inside arrays, sets, maps, immutable objects nor classes or class instances.
 * - By default limits to 10 depth, to not limit at all put MaxDepth to -1.
 * - Can provide <Data, Pre, Joiner, MaxDepth>. Should not provide the last PreVal, it's used internally. */
export type GetJoinedDataKeysFrom<
    Data extends Record<string, any>,
    Pre extends string = "",
    Joiner extends string = ".",
    MaxDepth extends number = 10,
    PreVal extends string = "" extends Pre ? "" : `${Pre}${Joiner}` // This one is computed, do not input it.
> = SafeIterator[MaxDepth] extends never ? never : 
    { [Key in string & keyof Data]:
        Data[Key] extends { [key: string]: any;[key: number]: never; } ?
            Data[Key] extends { asMutable(): Data[Key]; } ?
                `${PreVal}${Key}` :
            string & GetJoinedDataKeysFrom<Data[Key], `${PreVal}${Key}`, Joiner, SafeIterator[MaxDepth]> | `${PreVal}${Key}` :
        `${PreVal}${Key}`
    }[string & keyof Data];

// Other useful:
//
// type PickByArrayLength<Arr extends any[], Options extends any[], Index extends number = 10> = [undefined] extends [Arr[Index]] ? PickByArrayLength<Arr, Options, SafeIterator[Index]> : Options[Index];
// export declare function getPropValue<T, P extends string>(obj: T, path: P): PropType<T, P>;
// type MatchPair<S extends string> = S extends `${infer A}.${infer B}` ? [A, B] : unknown;


// - Pick by array length - //

// - Algoritm: Class name validation - //

/** Typing tool for class name validation. The input can be:
 *    1. A string, either single or concatenated: "bold", "bold italic".
 *    2. An array of strings, similarly either single or concatenated: ["bold", "bold italic"].
 *    3. A record of string keys (where values are non-important for typing). Similarly short or long: { "bold": false, "bold italic": true }
 *    4. Anything else is accepted including "". This is to allow usage like: doHighlight && "highlight" (for strings or arrays). For objects used like: { "highlight": doHighlight }.
 * - Note that this returns either `string` (for valid strings), `Valid[]` or `any` (for valid objects & arrays), or `never` type (for failure).
 *   .. This is mostly because of whatever happens to work in practice in all the required scenarios.
 *   .. It's also because more detail is not required, and can then support mangling more flexible (while avoiding problems like circular constraints).
 * - Note that this functionality is paired with a javascript function's inner workings. (It will collect a valid class name out of the same input.)
 */
export type NameValidator<Valid extends string, Input> =
    // String - split with " " and check if the collection extends Valid[].
    [Input] extends [string] ? Split<Input, " "> extends Valid[] ? string : never :
    // Array - check each STRING VALUE inside and split it and check if extends Valid[]. (Other types are ignored.)
    [Input] extends [Array<any> | Readonly<Array<any>>] ? Input extends Valid[] ? Valid[] : Split<Input[number] & string, " "> extends Valid[] ? any : never :
    // Object - check each STRING KEY inside and split it and check if extends Valid[].
    [Input] extends [object] ? keyof Input extends Valid ? any : Split<keyof Input & string, " "> extends Valid[] ? any : never :
    // Otherwise allow anything.
    any;

/** Helper to validate class names (paired with a javascript function that actually supports handling: (...params: any[]) => string;
 * 1. First create a type for valid names, eg.: `type ValidNames = "bold" | "italic" | "underline" | "dimmed";
 * 2. Then define a shortcut for the validator with the ValidNames type: `const cleanNames: ValidateNames<ValidNames> = MixDOM.classNames;`.
 * 3. Then reuse the function for validation:
 *     a. For strings: `const okName = cleanNames("bold", "underline italic", false, "");` // => "bold underline italic"
 *     b. For arrays: `const okName = cleanNames(["underline", "dimmed italic", false, ""], [], undefined, ["bold"]);` // => "underline dimmed italic bold"
 *     c. For objects: `const okName = cleanNames({"bold": false, "dimmed italic": true}, null, {"underline": true });` // => "dimmed italic underline"
 * - You can also mix these freely: `const okName = cleanNames("bold", ["italic"], {"underline": false});`
 * - Note however, that the typing support is made for 10 arguments max. Anything after that uses a common type ...T[], so it will get buggy in various ways.
 */
export type ValidateNames<Valid extends string> = <
    T1 extends NameValidator<Valid, T1>,
    T2 extends NameValidator<Valid, T2>,
    T3 extends NameValidator<Valid, T3>,
    T4 extends NameValidator<Valid, T4>,
    T5 extends NameValidator<Valid, T5>,
    T6 extends NameValidator<Valid, T6>,
    T7 extends NameValidator<Valid, T7>,
    T8 extends NameValidator<Valid, T8>,
    T9 extends NameValidator<Valid, T9>,
    T10 extends NameValidator<Valid, T10>,
    Tn extends NameValidator<Valid, Tn>>
    (t1?: T1, t2?: T2, t3?: T3, t4?: T4, t5?: T5, t6?: T6, t7?: T7, t8?: T8, t9?: T9, t10?: T10, ...tn: Tn[]) => string;

// // - Testing - //
//
// // Prepare.
// type ValidNames = "a" | "b";
// const validate: ValidateNames<ValidNames> = MixDOM.classNames;
//
// // Do tests.
// // .. These should not produce errors.
// validate(["a"]);
// validate(["a", "b", ""]);
// validate(["a", "b", "a b", "b a"]);
// validate(["a", false, undefined, "b"]);
// validate(["a", false, undefined, "b"] as const);
// validate({"a": true, "b a": false});
// validate({"a": true, "b a": false} as const);
// validate("a", "a b", false, ["a"], ["b a", ""], undefined, {"a": true, "b a": false});
// // .. These should fail each, because "FAIL" is not part of ValidNames.
// validate("FAIL");
// validate(["FAIL"]);
// validate({"FAIL": false});
// validate("a", "a b", undefined, "FAIL", ["a", false]);
// validate("a", "a b", undefined, ["a", "FAIL", false]);
// validate(["a", "b", "a b", "FAIL", false]);
// validate("a", "a b", false, ["a"], ["b a", ""], undefined, {"a": true, "b a": false, "FAIL": true});
// validate("a", "FAIL", "a b", false, ["a"], ["b a", ""], undefined, {"a": true, "b a": false});
// validate("a", "a b", false, ["a", "FAIL"], ["b a", ""], undefined, {"a": true, "b a": false});


// - Algoritm alternative: Get dotted keys - //
//
// These are thanks to jcalz at: https://stackoverflow.com/questions/58434389/typescript-deep-keyof-of-a-nested-object
//
// export type SafeIteratorDepth = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
// export type SafeIteratorDepthDefault = 10;
//
// type NestedJoin<K, P> = K extends string | number ?
//     P extends string | number ?
//         `${K}${"" extends P ? "" : "."}${P}`
//         : never
//     : never
// ;
//
// // Max 20, if gives higher, it's 0.
// // .. This works by having an offset of 1: the first item is never, then 0, 1, 2, ...
// // .. So each time we get with a number, we get one smaller, until we hit never.
// type NestedPrev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...0[]];
//
// /** Get nested paths and leaves from data, eg. "themes" | "themes.color" | "themes.style" */
// export type NestedPathsBy<T, NotAllowed = never, D extends SafeIteratorDepth = SafeIteratorDepthDefault> = [D] extends [never] ? never : T extends object ?
//     { [K in keyof T]-?: K extends string | number ?
//         T[K] extends NotAllowed ?
//             never
//             : K | NestedJoin<K, NestedPathsBy<T[K], NotAllowed, NestedPrev[D]>>
//         : never
//     }[keyof T] : ""
// ;
// export type NestedPaths<T> = NestedPathsBy<T, NonDictionary, SafeIteratorDepthDefault>;
//
// /** Get nested leaves only from data, eg. "themes.color" | "themes.style" - but not "themes" as it's not a leaf. */
// export type NestedLeaves<T, NotAllowed = never, D extends SafeIteratorDepth = SafeIteratorDepthDefault> = [D] extends [never] ? never : T extends object ?
//     { [K in keyof T]-?: T[K] extends NotAllowed ? {} : NestedJoin<K, NestedLeaves<T[K], NotAllowed, NestedPrev[D]>> }[keyof T]
//     : ""
// ;
//
// <-- Unfortunately this is too heavy. It gets heavy when extending a class using this, or in mixin use.


// - More algoritm alternatives - //
//
// Example 1: https://stackoverflow.com/questions/47057649/typescript-string-dot-notation-of-nested-object
//
// Example 2: https://dev.to/pffigueiredo/typescript-utility-keyof-nested-object-2pa3
// export type DottedKeysOf<ObjectType> =
// 	ObjectType extends PureDictionary<ObjectType> ?
// 		{[Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
// 		// @ts-ignore - TypeScript tells us that it's excessively deep and possibly infinite - luckily we can ignore just the warning, but keep functionality.
// 		? Key | `${Key}.${DottedKeysOf<ObjectType[Key]>}`
// 		: Key
// 		}[keyof ObjectType & (string | number)]
// 	: never
// ;
