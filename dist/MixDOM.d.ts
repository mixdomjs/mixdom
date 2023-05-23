declare type SVGGlobalAttributes = Partial<SVGCoreAttributes> & Partial<SVGPresentationalAttributes> & Partial<SVGStylingAttributes> & Partial<SVGCoreAttributes> & Partial<SVGGraphicalEventAttributes>;
declare type SVGGeneralAttributes = SVGGlobalAttributes & Partial<SVGNativeAttributes>;
interface SVGAttributesBy extends SVGAttributesByTag {
}
declare type SVGAttributesByTag = SVGManualAttributes & Record<Exclude<keyof SVGElementTagNameMap, keyof SVGManualAttributes>, Partial<SVGNativeAttributes>>;
interface SVGManualAttributes {
    a: {
        "download"?: HTMLAttributes<"a">["download"];
        "href"?: HTMLAttributes<"a">["href"];
        "hreflang"?: HTMLAttributes<"a">["hreflang"];
        "ping"?: SVGNativeAttributes["ping"];
        "referrerpolicy"?: SVGNativeAttributes["referrerpolicy"];
        "rel"?: SVGNativeAttributes["rel"];
        "target"?: HTMLAttributes<"a">["target"];
        "type"?: SVGNativeAttributes["type"];
        "xlink:href"?: SVGNativeAttributes["xlink:href"];
    } & SVGGlobalAttributes;
    circle: {
        "cx"?: SVGNativeAttributes["cx"];
        "cy"?: SVGNativeAttributes["cy"];
        "r"?: SVGNativeAttributes["r"];
        "pathLength"?: SVGNativeAttributes["pathLength"];
    } & SVGGlobalAttributes;
    ellipse: {
        "cx"?: SVGNativeAttributes["cx"];
        "cy"?: SVGNativeAttributes["cy"];
        "rx"?: SVGNativeAttributes["rx"];
        "ry"?: SVGNativeAttributes["ry"];
        "pathLength"?: SVGNativeAttributes["pathLength"];
    } & SVGGlobalAttributes;
    g: {} & SVGGlobalAttributes;
    image: {
        "x"?: SVGNativeAttributes["x"];
        "y"?: SVGNativeAttributes["y"];
        "width"?: SVGNativeAttributes["width"];
        "height"?: SVGNativeAttributes["height"];
        "href"?: HTMLAttributes<"a">["href"];
        "xlink:href"?: SVGNativeAttributes["xlink:href"];
        "preserveAspectRatio"?: SVGNativeAttributes["preserveAspectRatio"];
        "crossorigin"?: SVGNativeAttributes["crossorigin"];
    } & SVGGlobalAttributes;
    line: {
        "x1"?: SVGNativeAttributes["x1"];
        "y1"?: SVGNativeAttributes["y1"];
        "x2"?: SVGNativeAttributes["x2"];
        "y2"?: SVGNativeAttributes["y2"];
        "pathLength"?: SVGNativeAttributes["pathLength"];
    } & SVGGlobalAttributes;
    path: {
        "d"?: SVGNativeAttributes["d"];
        "pathLength"?: SVGNativeAttributes["pathLength"];
    } & SVGGlobalAttributes;
    polyline: {
        "points"?: SVGNativeAttributes["points"];
        "pathLength"?: SVGNativeAttributes["pathLength"];
    } & SVGGlobalAttributes;
    polygon: {
        "points"?: SVGNativeAttributes["points"];
        "pathLength"?: SVGNativeAttributes["pathLength"];
    } & SVGGlobalAttributes;
    rect: {
        "x"?: SVGNativeAttributes["x"];
        "y"?: SVGNativeAttributes["y"];
        "width"?: SVGNativeAttributes["width"];
        "height"?: SVGNativeAttributes["height"];
        "rx"?: SVGNativeAttributes["rx"];
        "ry"?: SVGNativeAttributes["ry"];
        "pathLength"?: SVGNativeAttributes["pathLength"];
    } & SVGGlobalAttributes;
    use: {
        "href"?: HTMLAttributes<"a">["href"];
        "xlink:href"?: SVGNativeAttributes["xlink:href"];
        "x"?: SVGNativeAttributes["x"];
        "y"?: SVGNativeAttributes["y"];
        "width"?: SVGNativeAttributes["width"];
        "height"?: SVGNativeAttributes["height"];
    } & SVGGlobalAttributes;
}
interface SVGCoreAttributes {
    "id": string;
    "lang": string;
    "tabindex": string;
    "xml:base": string;
    "xml:lang": string;
    "xml:space": string;
}
interface SVGStylingAttributes {
    "class": string;
    "style": string;
}
interface SVGGraphicalEventAttributes {
    onActivate: (this: GlobalEventHandlers, ev: UIEvent) => void;
    onFocusIn: (this: GlobalEventHandlers, ev: UIEvent) => void;
    onFocusOut: (this: GlobalEventHandlers, ev: UIEvent) => void;
}
interface SVGPresentationalAttributes {
    "clip-path": string;
    "clip-rule": number | string;
    "color": string;
    "color-interpolation": 'auto' | 'sRGB' | 'linearRGB' | 'inherit';
    "color-rendering": number | string;
    "cursor": number | string;
    "display": number | string;
    "fill": string;
    "fill-opacity": number | string;
    "fill-rule": 'nonzero' | 'evenodd' | 'inherit';
    "filter": string;
    "mask": string;
    "opacity": number | string;
    "pointer-events": number | string;
    "shape-rendering": number | string;
    "stroke": string;
    "stroke-dasharray": number | string;
    "stroke-dashoffset": number | string;
    "stroke-linecap": 'butt' | 'round' | 'square' | 'inherit';
    "stroke-linejoin": 'butt' | 'round' | 'square' | 'inherit';
    "stroke-miterlimit": number | string;
    "stroke-opacity": number | string;
    "stroke-width": number | string;
    "transform": string;
    "vector-effect": number | string;
    "visibility": number | string;
}
interface SVGAriaAttributes {
    "aria-activedescendant": string;
    "aria-atomic": string;
    "aria-autocomplete": string;
    "aria-busy": string;
    "aria-checked": string;
    "aria-colcount": string;
    "aria-colindex": string;
    "aria-colspan": string;
    "aria-controls": string;
    "aria-current": string;
    "aria-describedby": string;
    "aria-details": string;
    "aria-disabled": string;
    "aria-dropeffect": string;
    "aria-errormessage": string;
    "aria-expanded": string;
    "aria-flowto": string;
    "aria-grabbed": string;
    "aria-haspopup": string;
    "aria-hidden": string;
    "aria-invalid": string;
    "aria-keyshortcuts": string;
    "aria-label": string;
    "aria-labelledby": string;
    "aria-level": string;
    "aria-live": string;
    "aria-modal": string;
    "aria-multiline": string;
    "aria-multiselectable": string;
    "aria-orientation": string;
    "aria-owns": string;
    "aria-placeholder": string;
    "aria-posinset": string;
    "aria-pressed": string;
    "aria-readonly": string;
    "aria-relevant": string;
    "aria-required": string;
    "aria-roledescription": string;
    "aria-rowcount": string;
    "aria-rowindex": string;
    "aria-rowspan": string;
    "aria-selected": string;
    "aria-setsize": string;
    "aria-sort": string;
    "aria-valuemax": string;
    "aria-valuemin": string;
    "aria-valuenow": string;
    "aria-valuetext": string;
    "role": string;
}
/** The collected native attributes for all svg elements combined - excluding the global attributes belonging to all. */
interface SVGNativeAttributes {
    "accent-height": number | string;
    "accumulate": 'none' | 'sum';
    "additive": 'replace' | 'sum';
    "alignment-baseline": 'auto' | 'baseline' | 'before-edge' | 'text-before-edge' | 'middle' | 'central' | 'after-edge' | 'text-after-edge' | 'ideographic' | 'alphabetic' | 'hanging' | 'mathematical' | 'inherit';
    "allow-reorder": 'no' | 'yes';
    "alphabetic": number | string;
    "amplitude": number | string;
    "arabic-form": 'initial' | 'medial' | 'terminal' | 'isolated';
    "ascent": number | string;
    "attribute-name": string;
    "attribute-type": string;
    "auto-reverse": number | string;
    "azimuth": number | string;
    "baseFrequency": number | string;
    "baseline-shift": number | string;
    "baseProfile": number | string;
    "bbox": number | string;
    "begin": number | string;
    "bias": number | string;
    "by": number | string;
    "calcMode": number | string;
    "cap-height": number | string;
    "clip": number | string;
    "clip-path": string;
    "clipPathUnits": number | string;
    "clip-rule": number | string;
    "color-interpolation": number | string;
    "color-interpolation-filters": 'auto' | 'sRGB' | 'linearRGB' | 'inherit';
    "color-profile": number | string;
    "color-rendering": number | string;
    "contentScriptType": number | string;
    "contentStyleType": number | string;
    "crossorigin": string;
    "cursor": number | string;
    "cx": number | string;
    "cy": number | string;
    "d": string;
    "decelerate": number | string;
    "descent": number | string;
    "diffuseConstant": number | string;
    "direction": number | string;
    "display": number | string;
    "divisor": number | string;
    "dominant-baseline": number | string;
    "dur": number | string;
    "dx": number | string;
    "dy": number | string;
    "edgeMode": number | string;
    "elevation": number | string;
    "enable-background": number | string;
    "end": number | string;
    "exponent": number | string;
    "external-resources-required": number | string;
    "fill": string;
    "fill-opacity": number | string;
    "fill-rule": 'nonzero' | 'evenodd' | 'inherit';
    "filter": string;
    "filterRes": number | string;
    "filterUnits": number | string;
    "flood-color": number | string;
    "flood-opacity": number | string;
    "focusable": number | string;
    "font-family": string;
    "font-size": number | string;
    "font-size-adjust": number | string;
    "font-stretch": number | string;
    "font-style": number | string;
    "font-variant": number | string;
    "font-weight": number | string;
    "format": number | string;
    "from": number | string;
    "fx": number | string;
    "fy": number | string;
    "g1": number | string;
    "g2": number | string;
    "glyph-name": number | string;
    "glyph-orientation-horizontal": number | string;
    "glyph-orientation-vertical": number | string;
    "glyphRef": number | string;
    "gradientTransform": string;
    "gradientUnits": string;
    "hanging": number | string;
    "height": number | string;
    "horiz-adv-x": number | string;
    "horiz-origin-x": number | string;
    "ideographic": number | string;
    "image-rendering": number | string;
    "in2": number | string;
    "in": string;
    "intercept": number | string;
    "k1": number | string;
    "k2": number | string;
    "k3": number | string;
    "k4": number | string;
    "k": number | string;
    "kernelMatrix": number | string;
    "kernelUnitLength": number | string;
    "kerning": number | string;
    "keyPoints": number | string;
    "keySplines": number | string;
    "keyTimes": number | string;
    "lengthAdjust": number | string;
    "letter-spacing": number | string;
    "lighting-color": number | string;
    "limitingConeAngle": number | string;
    "local": number | string;
    "marker-end": string;
    "marker-mid": string;
    "marker-start": string;
    "markerHeight": number | string;
    "markerUnits": number | string;
    "markerWidth": number | string;
    "mask": string;
    "maskContentUnits": number | string;
    "maskUnits": number | string;
    "mathematical": number | string;
    "mode": number | string;
    "numOctaves": number | string;
    "offset": number | string;
    "opacity": number | string;
    "operator": number | string;
    "order": number | string;
    "orient": number | string;
    "orientation": number | string;
    "origin": number | string;
    "overflow": number | string;
    "overline-position": number | string;
    "overline-thickness": number | string;
    "paint-order": number | string;
    "panose1": number | string;
    "pathLength": number | string;
    "patternContentUnits": string;
    "patternTransform": number | string;
    "patternUnits": string;
    "ping": string;
    "pointer-events": number | string;
    "points": string;
    "pointsAtX": number | string;
    "pointsAtY": number | string;
    "pointsAtZ": number | string;
    "preserveAlpha": number | string;
    "preserveAspectRatio": string;
    "primitiveUnits": number | string;
    "r": number | string;
    "radius": number | string;
    "refX": number | string;
    "refY": number | string;
    "rel": string;
    "rendering-intent": number | string;
    "repeatCount": number | string;
    "repeatDur": number | string;
    "requiredExtensions": number | string;
    "requiredFeatures": number | string;
    "referrerpolicy": 'no-referrer' | 'no-referrer-when-downgrade' | 'same-origin' | 'origin' | 'strict-origin' | 'origin-when-cross-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
    "restart": number | string;
    "result": string;
    "rotate": number | string;
    "rx": number | string;
    "ry": number | string;
    "scale": number | string;
    "seed": number | string;
    "shape-rendering": number | string;
    "slope": number | string;
    "spacing": number | string;
    "specularConstant": number | string;
    "specularExponent": number | string;
    "speed": number | string;
    "spreadMethod": string;
    "startOffset": number | string;
    "stdDeviation": number | string;
    "stemh": number | string;
    "stemv": number | string;
    "stitchTiles": number | string;
    "stop-color": string;
    "stop-opacity": number | string;
    "strikethrough-position": number | string;
    "strikethrough-thickness": number | string;
    "string": number | string;
    "stroke": string;
    "stroke-dasharray": string | number;
    "stroke-dashoffset": string | number;
    "stroke-linecap": 'butt' | 'round' | 'square' | 'inherit';
    "stroke-linejoin": 'miter' | 'round' | 'bevel' | 'inherit';
    "stroke-miterlimit": string | number;
    "stroke-opacity": number | string;
    "stroke-width": number | string;
    "surfaceScale": number | string;
    "systemLanguage": number | string;
    "tableValues": number | string;
    "targetX": number | string;
    "targetY": number | string;
    "text-anchor": string;
    "text-decoration": number | string;
    "text-rendering": number | string;
    "textLength": number | string;
    "to": number | string;
    "transform": string;
    "transform-origin": string;
    "type": string;
    "u1": number | string;
    "u2": number | string;
    "underline-position": number | string;
    "underline-thickness": number | string;
    "unicode": number | string;
    "unicode-bidi": number | string;
    "unicode-range": number | string;
    "units-per-em": number | string;
    "v-alphabetic": number | string;
    "values": string;
    "vector-effect": number | string;
    "version": string;
    "vert-adv-y": number | string;
    "vert-origin-x": number | string;
    "vert-origin-y": number | string;
    "v-hanging": number | string;
    "v-ideographic": number | string;
    "viewBox": string;
    "viewTarget": number | string;
    "visibility": number | string;
    "v-mathematical": number | string;
    "width": number | string;
    "widths": number | string;
    "word-spacing": number | string;
    "writing-mode": number | string;
    "x1": number | string;
    "x2": number | string;
    "x": number | string;
    "xChannelSelector": string;
    "xHeight": number | string;
    "xlink:actuate": string;
    "xlink:arcrole": string;
    "xlink:href": string;
    "xlink:role": string;
    "xlink:show": string;
    "xlink:title": string;
    "xlink:type": string;
    "xml:base": string;
    "xml:lang": string;
    "xml:space": string;
    "y1": number | string;
    "y2": number | string;
    "y": number | string;
    "yChannelSelector": string;
    "z": number | string;
    "zoomAndPan": string;
}

declare enum SignalManFlags {
    /** If enabled, removes the listener once it has been fired once. */
    OneShot = 1,
    /** If enabled, calls the listener after a 0ms timeout. Note that this makes the callback's return value always be ignored from the return flow. */
    Deferred = 2,
    None = 0,
    All = 3
}
declare type SignalListenerFunc = (...args: any[]) => any | void;
declare type SignalListener<Callback extends SignalListenerFunc = SignalListenerFunc> = [callback: Callback, extraArgs: any[] | null, flags: SignalManFlags, groupId: any | null | undefined, origListeners?: SignalListener[]];
declare type SignalsRecord = Record<string, SignalListenerFunc>;
declare type SignalSendAsReturn<OrigReturnVal, HasAwait extends boolean, IsSingle extends boolean, RetVal = true extends HasAwait ? Awaited<OrigReturnVal> : OrigReturnVal, ReturnVal = true extends IsSingle ? RetVal | undefined : RetVal[]> = true extends HasAwait ? Promise<ReturnVal> : ReturnVal;
/** There are two ways you can use this:
 * 1. Call this to give basic SignalMan features with types for Props and such being empty.
 *      * `class MyMix extends SignalManMixin(MyBase) {}`
 * 2. If you want to type the signals (as you very likely do), use this simple trick instead:
 *      * `class MyMix extends (SignalManMixin as ClassMixer<typeof SignalMan<{ someSignal: () => void; }>>)(MyBase) {}`
 */
declare const SignalManMixin: ClassMixer<SignalManType<{}>>;
declare const SignalBoy_base: ClassType<{}, any[]>;
/** This is like SignalMan but only provides listening: the sendSignal, sendSignalAs and afterRefresh methods are deleted (for clarity of purpose). */
declare class SignalBoy<Signals extends SignalsRecord = {}> extends SignalBoy_base {
}
interface SignalBoy<Signals extends SignalsRecord = {}> {
    /** The stored signal connections. To emit signals use `sendSignal` and `sendSignalAs` methods. */
    signals: Record<string, Array<SignalListener>>;
    /** Assign a listener to a signal. You can also define extra arguments, optional groupId for easy clearing, and connection flags (eg. for one-shot or to defer call).
     * Also checks whether the callback was already attached to the signal, in which case overrides the info. */
    listenTo<Name extends string & keyof Signals>(name: Name, callback: Signals[Name], extraArgs?: any[] | null, flags?: SignalManFlags | null, groupId?: any | null): void;
    /** Clear listeners by names, callback and/or groupId. Each restricts the what is cleared. To remove a specific callback attached earlier, provide name and callback. */
    unlistenTo(names?: (string & keyof Signals) | Array<string & keyof Signals> | null, callback?: SignalListenerFunc | null, groupId?: any | null): void;
    /** Check if any listener exists by the given name, callback and/or groupId. */
    isListening<Name extends string & keyof Signals>(name?: Name | null, callback?: SignalListenerFunc | null, groupId?: any | null): boolean;
    /** Optional local callback handler to keep track of added / removed listeners. Called right after adding and right before removing. */
    onListener?(name: string & keyof Signals, index: number, wasAdded: boolean): void;
}
interface SignalManType<Signals extends SignalsRecord = {}> extends ClassType<SignalMan<Signals>> {
}
declare const SignalMan_base: ClassType<{}, any[]>;
declare class SignalMan<Signals extends SignalsRecord = {}> extends SignalMan_base {
}
interface SignalMan<Signals extends SignalsRecord = {}> extends SignalBoy<Signals> {
    /** Send a signal. Does not return a value. Use `sendSignalAs(modes, name, ...args)` to refine the behaviour. */
    sendSignal<Name extends string & keyof Signals>(name: Name, ...args: Parameters<Signals[Name]>): void;
    /** This exposes various features to the signalling process which are inputted as the first arg: either string or string[]. Features are:
     * - "delay": Delays sending the signal. To also collect returned values must include "await".
     *      * Note that this delays the start of the process. So if new listeners are attached right after, they'll receive the signal.
     *      * The stand alone SignalMan simply uses setTimeout with 1ms delay. (On Components, Hosts and Contexts it's delayed to the "render" cycle of the host(s).)
     * - "pre-delay": This is like "delay" but uses 0ms timeout on the standalone SignalMan. (On Components, Hosts and Contexts it's delayed to their update cycle.)
     * - "await": Awaits each listener (simultaneously) and returns a promise. By default returns the last non-`undefined` value, combine with "multi" to return an array of awaited values (skipping `undefined`).
     *      * Exceptionally if "delay" is on, and there's no "await" then can only return `undefined`, as there's no promise to capture the timed out returns.
     * - "multi": Can be used to force array return even if using "last", "first" or "first-true" - which would otherwise switch to a single value return mode.
     *      * Note that by default, is in multi mode, except if a mode is used that indicates a single value return.
     * - "last": Use this to return the last acceptable value (by default ignoring any `undefined`) - instead of an array of values.
     * - "first": Stops the listening at the first value that is not `undefined` (and not skipped by "no-false" or "no-null"), and returns that single value.
     *      * Note that "first" does not stop the flow when using "await" as the async calls are made simultaneously. But it returns the first acceptable value.
     * - "first-true": Is like "first" but stops only if value amounts to true like: !!value.
     * - "no-false": Ignores any falsifiable values, only accepts: `(!!value)`. So most commonly ignored are: `false`, `0`, `""`, `null´, `undefined`.
     * - "no-null": Ignores any `null` values in addition to `undefined`. (By default only ignores `undefined`.)
     *      * Note also that when returning values, any signal that was connected with .Deferred flag will always be ignored from the return value flow (and called 0ms later, in addition to "delay" timeout).
     */
    sendSignalAs<Name extends string & keyof Signals, Mode extends "" | "pre-delay" | "delay" | "await" | "last" | "first" | "first-true" | "multi" | "no-false" | "no-null", HasAwait extends boolean = Mode extends string[] ? Mode[number] extends "await" ? true : false : Mode extends "await" ? true : false, HasLast extends boolean = Mode extends string[] ? Mode[number] extends "last" ? true : false : Mode extends "last" ? true : false, HasFirst extends boolean = Mode extends string[] ? Mode[number] extends "first" ? true : Mode[number] extends "first-true" ? true : false : Mode extends "first" ? true : Mode extends "first-true" ? true : false, HasMulti extends boolean = Mode extends string[] ? Mode[number] extends "multi" ? true : false : Mode extends "multi" ? true : false, HasDelay extends boolean = Mode extends string[] ? Mode[number] extends "delay" ? true : false : Mode extends "delay" ? true : false, UseSingle extends boolean = true extends HasMulti ? false : HasFirst | HasLast, UseReturnVal extends boolean = true extends HasAwait ? true : true extends HasDelay ? false : true>(modes: Mode | Mode[], name: Name, ...args: Parameters<Signals[Name]>): true extends UseReturnVal ? SignalSendAsReturn<ReturnType<Signals[Name]>, HasAwait, UseSingle> : undefined;
    /** This returns a promise that is resolved after the "pre-delay" or "delay" cycle has finished.
     * - By default uses a timeout of 1ms for fullDelay (for "delay") and 0ms otherwise (for "pre-delay").
     * - This is used internally by the sendSignalAs method with "pre-delay" or "delay". The method can be overridden to provide custom timing. */
    afterRefresh(fullDelay?: boolean): Promise<void>;
    /** Optional assignable method. If used, then this will be used for the signal sending related methods to get all the listeners - instead of this.signals[name]. */
    getListenersFor?(signalName: string & keyof Signals): SignalListener[] | undefined;
}

declare class ContentClosure {
    /** The boundary that is connected to this closure - we are its link upwards in the content chain. */
    thruBoundary: SourceBoundary | null;
    /** The sourceBoundary is required to render anything - it defines to whom the content originally belongs.
     * If it would ever be switched (eg. by streaming from multiple sources), should clear the envelope first, and then assign new. */
    sourceBoundary: SourceBoundary | null;
    /** The sealed envelope that contains the content to pass: { applied, targetDef }. */
    envelope: MixDOMContentEnvelope | null;
    /** If not null, then this is the grounding def that features a true pass. */
    truePassDef: MixDOMDefApplied | null;
    /** Map where keys are the grounded defs (applied), and values are [boundary, treeNode, copyKey]. */
    groundedDefs: Map<MixDOMDefApplied, [boundary: SourceBoundary | ContentBoundary, treeNode: MixDOMTreeNode, copyKey: any]>;
    /** The grounded defs that are pending refresh. If all should be refreshed, contains all the keys in the groundedDefs. */
    pendingDefs: Set<MixDOMDefApplied>;
    /** This contains the boundaries from any WithContent components that refer to us.
     * - They will be re-updated every time our envelope changes. (Actually they would just care about null vs. non-null.) */
    withContents?: Set<SourceBoundary>;
    /** Used to detect which closures are linked together through content passing.
     * - This is further more used for the withContents feature. (But could be used for more features.)
     * - Note that this kind of detection is not needed for streams: as there's only the (active) source and target - nothing in between them.
     */
    chainedClosures?: Set<ContentClosure>;
    /** If this closure is linked to feed a stream, assign the stream instance here. */
    stream?: ComponentStream | null;
    constructor(thruBoundary?: SourceBoundary | null, sourceBoundary?: SourceBoundary | null);
    /** Whether we have any actual content to pass. */
    hasContent(): boolean;
    /** Get the content that we pass. */
    readContent(shallowCopy?: boolean): Readonly<MixDOMDefTarget[]> | null;
    /** Collect the interested boundaries.
     * - In practice these come from two places:
     *      1. The special WithContent components (either the MixDOM global one or from a ComponentStream).
     *      2. For parental content passing, also the child closures that have reported to be fed by us.
     * - Because of this architectural decision, we actually don't anymore need a cyclical loop prevention (as of v3.1).
     *      * This is because, the parent no longer has to re-render - earlier had to using: .withContent(...contents). Instead only WithContent component updates.
     *      * Cyclical prevention would only be needed if deliberately formed one by defining render content for MyStream within MyStream.WithContent content pass.
     */
    collectInterested(byStream?: ComponentStream | null): Set<SourceBoundary> | null;
    /** Should be called when a treeNode is grounding us to the grounded tree.
     * - If was grounded for the first time, updates the internals and returns render infos and boundary updates for the content.
     * - If was already grounded, returns [] for infos.
     */
    contentGrounded(groundingDef: MixDOMDefApplied, gBoundary: SourceBoundary | ContentBoundary, treeNode: MixDOMTreeNode, copyKey?: any): MixDOMChangeInfos;
    /** Should be called when a treeNode that had grounded our content into the grounded tree is being cleaned up. */
    contentUngrounded(groundingDef: MixDOMDefApplied): [MixDOMRenderInfo[], MixDOMSourceBoundaryChange[]];
    /** Sets the new envelope so the flow can be pre-smart, but does not apply it yet. Returns the interested sub boundaries. */
    preRefresh(newEnvelope: MixDOMContentEnvelope | null, byStream?: ComponentStream | null): Set<SourceBoundary> | null;
    /** Call this after preRefresh to do the actual update process. Returns infos for boundary calls and render changes. */
    applyRefresh(forceUpdate?: boolean): MixDOMChangeInfos;
    /** Internal helper to apply a new envelope and update any interested inside, returning the infos. */
    applyEnvelope(newEnvelope: MixDOMContentEnvelope | null): MixDOMChangeInfos;
    /** This is the method that makes stuff inside content closures concrete.
     * - For true ContentPass (see copies below), the situation is very distinguished:
     *   1. Because we are in a closure, our target defs have already been mapped to applied defs and new defs created when needed.
     *   2. However, the treeNode part of the process was not handled for us. So we must do it now.
     *   3. After having updated treeNodes and got our organized toApplyPairs, we can just feed them to _Apply.applyDefPairs to get renderInfos and boundaryUpdates.
     * - Behaviour on MixDOM.ContentCopy (and multi MixDOM.ContentPass).
     *   1. The situation is very different from ContentPass, because we don't have a set of pre-mangled applied defs.
     *   2. Instead we do actually do a very similar process to _Apply.runBoundaryUpdate, but without boundary and without rendering.
     *   3. For future updates, we can reuse the appliedDef for each copy - the copies can also be keyed.
     */
    private applyContentDefs;
}

/** Typing for a SpreadFunc: It's like a Component, except it's spread out immediately on the parent render scope when defined. */
declare type SpreadFunc<Props extends Dictionary = {}> = (props: Props) => MixDOMRenderOutput;
/** Typing for a SpreadFunc with extra arguments. Note that it's important to define the JS side as (props, ...args) so that the func.length === 1.
 * - The idea is to use the same spread function outside of normal render flow: as a static helper function to produce render defs (utilizing the extra args).
 */
declare type SpreadFuncWith<Props extends Dictionary = {}, ExtraArgs extends any[] = any[]> = (props: Props, ...args: ExtraArgs) => MixDOMRenderOutput;
/** Create a SpreadFunc - it's actually just a function with 0 or 1 arguments: (props?).
 * - It's the most performant way to render things (no lifecycle, just spread out with its own pairing scope).
 * - Note that this simply gives back the original function, unless it has more than 1 arguments, in which case an intermediary function is created.
 *      * This intermediary function actually supports feeding in more arguments - this works since a func with (props, ...args) actually has length = 1.
 *      * If you want to include the props and extra arguments typing into the resulting function use the createSpreadWith function instead (it also automatically reads the types).
 */
declare const createSpread: <Props extends Dictionary<any> = {}>(func: (props: Props, ...args: any[]) => MixDOMRenderOutput) => SpreadFunc<Props>;
/** Create a SpreadFunc by automatically reading the types for Props and ExtraArgs from the given function. See createSpread for details.
 * - The idea is to use the same spread function outside of normal render flow: as a static helper function to produce render defs (utilizing the extra args).
 */
declare const createSpreadWith: <Props extends Dictionary<any>, ExtraArgs extends any[]>(func: (props: Props, ...args: ExtraArgs) => MixDOMRenderOutput) => SpreadFuncWith<Props, ExtraArgs>;

/** Type for the ComponentShadowAPI signals. */
declare type ComponentShadowSignals<Info extends Partial<ComponentInfo> = {}> = ComponentExternalSignalsFor<ComponentShadow<Info>>;
declare type ComponentShadowFunc<Info extends Partial<ComponentInfo> = {}> = (((props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentShadow<Info>) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info["props"]>, NonNullable<Info["state"]>>)) & {
    Info?: Info;
    api: ComponentShadowAPI<Info>;
};
declare type ComponentShadowFuncWith<Info extends Partial<ComponentInfo> = {}> = ((props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentShadowWith<Info>, contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info["props"]>, NonNullable<Info["state"]>>) & {
    Info?: Info;
    api: ComponentShadowAPI<Info>;
};
interface ComponentShadowType<Info extends Partial<ComponentInfo> = {}> extends ComponentType<Info> {
    api: ComponentShadowAPI<Info>;
}
/** There is no actual pre-existing class for ComponentShadow. Instead a new class is created when createShadow is used. */
interface ComponentShadow<Info extends Partial<ComponentInfo> = {}> extends Component<Info> {
}
/** Type for Component with ComponentContextAPI. Also includes the signals that ComponentContextAPI brings. */
interface ComponentShadowWith<Info extends Partial<ComponentInfo> = {}> extends ComponentShadow<Info> {
    contextAPI: ComponentContextAPI<Info["contexts"] & {}>;
}
/** This allows to access the instanced components as well as to use signal listeners (with component extra param as the first one), and trigger updates. */
declare class ComponentShadowAPI<Info extends Partial<ComponentInfo> = {}> extends SignalBoy<ComponentShadowSignals<Info>> {
    /** The currently instanced components that use our custom class as their constructor. */
    components: Set<Component<Info>>;
    /** Default update modes. Can be overridden by the component's updateModes. */
    updateModes?: Partial<MixDOMUpdateCompareModesBy>;
    /** The instance is constructed when a new component func is created. When they are instanced they are added to our .components collection. */
    constructor();
    /** Call this to trigger an update on the instanced components. */
    update(update?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** The onListener callback is required by ComponentShadowAPI's functionality for connecting signals to components fluently. */
    onListener(name: string, index: number, wasAdded: boolean): void;
}
/** Create a shadow component omitting the first initProps: (component). The contextAPI is if has 2 arguments (component, contextAPI).
 * - Shadow components are normal components, but they have a ComponentShadowAPI attached as component.constructor.api.
 * - This allows the components to be tracked and managed by the parenting scope who creates the unique component class (whose instances are tracked).
*/
declare function createShadow<Info extends Partial<ComponentInfo> = {}>(CompClass: ComponentType<Info>, signals?: Partial<ComponentShadowSignals<Info>> | null, name?: string): ComponentShadowType<Info>;
/** Create a shadow component with ComponentContextAPI by func and omitting the first initProps: (component, contextAPI). The contextAPI is instanced regardless of argument count. */
declare const createShadowWith: <Info extends Partial<ComponentInfo<{}, {}, {}, {}, any, {}>> = {}>(func: (component: ComponentShadow<Info>, contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info["props"]>, NonNullable<Info["state"]>>, signals?: Partial<ComponentShadowSignals> | null, name?: string) => ComponentShadowFuncWith<Info>;

/** Wired can be a func with { api }. */
declare type ComponentWiredFunc<ParentProps extends Dictionary = {}, BuildProps extends Dictionary = {}, MixedProps extends Dictionary = {}> = ((props: ParentProps, component: ComponentWired<ParentProps>) => MixDOMRenderOutput | MixDOMDoubleRenderer<ParentProps, MixedProps>) & {
    api: ComponentWiredAPI<ParentProps, BuildProps, MixedProps>;
};
/** There is no actual pre-existing class for ComponentWired. But for typing, we can provide the info for the static side. */
interface ComponentWiredType<ParentProps extends Dictionary = {}, BuildProps extends Dictionary = {}, MixedProps extends Dictionary = {}> extends ComponentShadowType<{
    props: ParentProps;
}> {
    api: ComponentWiredAPI<ParentProps, BuildProps, MixedProps>;
}
/** There is no actual class for ComponentWired. Instead a new class is created when createWired is used. */
interface ComponentWired<ParentProps extends Dictionary = {}> extends Component<{
    props: ParentProps;
}> {
}
declare class ComponentWiredAPI<ParentProps extends Dictionary = {}, BuildProps extends Dictionary = {}, MixedProps extends Dictionary = {}> extends ComponentShadowAPI<{
    props: ParentProps;
    state: MixedProps;
}> {
    /** The additional props created by the builder are stored here. */
    builtProps: BuildProps | null;
    /** Default update modes. These will be used for each wired component instance.
     * - Note that we add `{ props: "never" }` as default in the constructor.
     * - This is because we want the update checks to skip props and use the `state` (that we pass as props to the inner component).
     */
    updateModes?: Partial<MixDOMUpdateCompareModesBy>;
    constructor();
    /** This is used to get the new props by the builder. It's only used when manually called with .refresh() or when the wired source component (if any) updates. */
    buildProps(): BuildProps | null;
    /** Get the final mixed props for a component instance of our wired class. */
    getMixedProps(wired: Component): MixedProps;
    /** Call this to manually update the wired part of props and force a refresh.
     * - This is most often called by the static refresh method above, with props coming from the builder / built props. */
    setProps(builtProps: BuildProps | null, forceUpdate?: boolean | "all" | "trigger", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Call this to rebuild the wired part of props and trigger a refresh on the instances.
     * - If the props stay the same, you should set `forceUpdate = "trigger"`, or rather just call `update()` directly if you know there's no builder. */
    refresh(forceUpdate?: boolean | "all" | "trigger", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Call this to trigger an update on the instanced components.
     * - This sets the state of each wired components using the getMixedProps method to produce the final mixed props (that will be passed to the renderer component as props). */
    update(update?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Optional callback to build the common props upon refresh start. These are then fed to the mixer as extra info. */
    onBuildProps?(lastProps: BuildProps | null): BuildProps | null;
    /** Optional callback to build the common props upon refresh start. These are then fed to the mixer as extra info. */
    onMixProps?(parentProps: ParentProps & {}, buildProps: [this["onBuildProps"]] extends [() => any] ? BuildProps : null, wired: Component<{
        props?: ParentProps;
    }>): MixedProps;
}
/** Creates a wired component.
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
 * - Note that when creates a stand alone wired component (not through Component component's .createWired method), you should drive the updates manually by .setProps.
 */
declare function createWired<ParentProps extends Dictionary = {}, BuildProps extends Dictionary = {}, MixedProps extends Dictionary = {}, Builder extends (lastProps: BuildProps | null) => BuildProps = (lastProps: BuildProps | null) => BuildProps, Mixer extends (parentProps: ParentProps, buildProps: [Builder] extends [() => any] ? BuildProps : null, wired: Component<{
    props: ParentProps;
    state: MixedProps;
}>) => MixedProps = (parentProps: ParentProps, buildProps: [Builder] extends [() => any] ? BuildProps : null, wired: Component<{
    props: ParentProps;
    state: MixedProps;
}>) => MixedProps>(mixer: Mixer | BuildProps | null, renderer: ComponentTypeAny<{
    props: MixedProps;
}>, name?: string): ComponentWiredFunc<ParentProps, BuildProps, MixedProps>;
declare function createWired<ParentProps extends Dictionary = {}, BuildProps extends Dictionary = {}, MixedProps extends Dictionary = {}, Builder extends (lastProps: BuildProps | null) => BuildProps = (lastProps: BuildProps | null) => BuildProps, Mixer extends (parentProps: ParentProps, buildProps: [Builder] extends [() => any] ? BuildProps : null, wired: Component<{
    props: ParentProps;
    state: MixedProps;
}>) => MixedProps = (parentProps: ParentProps, buildProps: [Builder] extends [() => any] ? BuildProps : null, wired: Component<{
    props: ParentProps;
    state: MixedProps;
}>) => MixedProps>(builder: Builder | BuildProps | null, mixer: Mixer | null, renderer: ComponentTypeAny<{
    props: MixedProps;
}>, name?: string): ComponentWiredFunc<ParentProps, BuildProps, MixedProps>;

declare type HostRenderSettings = Pick<HostSettings, "renderTextHandler" | "renderTextTag" | "renderHTMLDefTag" | "renderSVGNamespaceURI" | "renderDOMPropsOnSwap" | "noRenderValuesMode" | "disableRendering" | "duplicateDOMNodeHandler" | "duplicateDOMNodeBehaviour" | "devLogWarnings" | "devLogRenderInfos">;
declare class HostRender {
    /** Detect if is running in browser or not. */
    inBrowser: boolean;
    /** Root for pausing. */
    hydrationRoot: MixDOMTreeNode | null;
    /** Pausing. When resumes, rehydrates. */
    paused: boolean;
    /** When paused, if has any infos about removing elements, we store them - so that we can call unmount (otherwise the treeNode ref is lost). */
    pausedPending?: MixDOMRenderInfo[];
    /** Collection of settings. */
    settings: HostRenderSettings;
    /** To keep track of featured external dom elements. */
    externalElements: Set<Node>;
    constructor(settings: HostRenderSettings, hydrationRoot?: MixDOMTreeNode);
    /** Pause the renderer from receiving updates. */
    pause(): void;
    /** Resume the renderer after pausing. Will rehydrate dom elements and reapply changes to them.
     * Note that calling resume will unpause rendering even when settings.disableRendering is set to true. */
    resume(): void;
    /** This rehydrates the rendered defs with actual dom elements.
     * - It supports reusing custom html elements from within the given "container" element - it should be the _containing_ element. You should most often use the host's container element.
     * - In smuggleMode will replace the existing elements with better ones from "from" - otherwise only tries to fill missing ones.
     * - In destroyOthersMode will destroy the unused elements found in the container.
     * - In readAllMode will re-read the current dom props from the existing ones as well.
     * - This also resumes rendering if was paused - unless is disableRendering is set to true in host settings.
     */
    rehydrate(container?: Node | null, readAllMode?: boolean, smuggleMode?: boolean, destroyOthersMode?: boolean, validator?: MixDOMHydrationValidator | null, suggester?: MixDOMHydrationSuggester | null): void;
    /** The main method to apply renderInfos. Everything else in here serves this.
     * - Note that all the infos in a single renderInfos array should be in tree order. (Happens automatically by the update order.)
     * - Except emptyMove's should be prepended to the start, and destructions appended to the end (<- happens automatically due to clean up being after).
     */
    applyToDOM(renderInfos: MixDOMRenderInfo[]): void;
    private getApprovedNode;
    private createDOMNodeBy;
    static SIMPLE_TAGS: string[];
    static SPECIAL_PROPS: Record<string, "other" | "render" | undefined>;
    static PASSING_TYPES: Partial<Record<MixDOMTreeNodeType | MixDOMDefType, true>>;
    static LISTENER_PROPS: Record<keyof ListenerAttributesAll, (e: Event) => void>;
    /** Using the bookkeeping logic, find the parent node and next sibling as html insertion targets. */
    static findInsertionNodes(treeNode: MixDOMTreeNode): [Node, Node | null] | [null, null];
    /** This should be called (after the dom action) for each renderInfo that has action: "create" / "move" / "remove" / "swap" (and on "content" if changed node).
     * - The respective action is defined by whether gives a domNode or null. If null, it's remove, otherwise it's like moving (for creation too).
     * - In either case, it goes and updates the bookkeeping so that each affected boundary always has a .domNode reference that points to its first element.
     * - This information is essential (and as minimal as possible) to know where to insert new domNodes in a performant manner. (See above findInsertionNodes().)
     * - Note that if the whole boundary unmounts, this is not called. Instead the one that was "moved" to be the first one is called to replace this.
     *   .. In dom sense, we can skip these "would move to the same point" before actual dom moving, but renderInfos should be created - as they are automatically by the basic flow. */
    static updateDOMChainBy(fromTreeNode: MixDOMTreeNode, domNode: Node | null, fromSelf?: boolean): void;
    /** This reads the domProps (for MixDOMTreeNodeDOM) from a domNode. Skips listeners, but supports class, style and data. */
    static readFromDOM(domNode: HTMLElement | SVGElement | Node): MixDOMProcessedDOMProps;
    /** Returns a single html element.
     * - In case, the string refers to multiple, returns a fallback element containing them - even if has no content. */
    static domNodeFrom(innerHTML: string, fallbackTagOrEl?: DOMTags | HTMLElement, keepTag?: boolean): Node | null;
    /** Apply properties to dom elements for the given treeNode. Returns [ appliedProps, domElement, diffs? ]. */
    static domApplyProps(treeNode: MixDOMTreeNodeDOM, logWarnings?: boolean): [MixDOMProcessedDOMProps, Element | SVGElement | null, MixDOMDOMDiffs?];
    /** This returns the content inside a root tree node as a html string. */
    static readAsString(treeNode: MixDOMTreeNode): string;
    /** This returns a suitable virtual item from the structure.
     * - Tries the given vItem, or if used its children.
     * - Can use an optional suggester that can suggest some other virtual item or a direct dom node.
     *   * Any suggestions (by the callback or our tree structure) must always have matching tag and other some requirements.
     *   * If suggests a virtual item it must fit the structure. If suggests a dom node, it can be from anywhere basically - don't steal from another host.
     * - Can also use an optional validator that should return true to accept, false to not accept. It's the last one in the chain that can say no.
     * - DEV. NOTE. This is a bit SKETCHY.
     */
    static getTreeNodeMatch(treeNode: MixDOMTreeNodeDOM, vItem: MixDOMHydrationItem | null, vKeyedByTags?: Partial<Record<DOMTags, MixDOMHydrationItem[]>>, excludedNodes?: Set<Node> | null, validator?: MixDOMHydrationValidator | null, suggester?: MixDOMHydrationSuggester | null): MixDOMHydrationItem | Node | null;
    private static isVirtualItemOk;
}

declare class HostServices {
    /** Dedicated render handler class instance. It's public internally, as it has some direct-to-use functionality: like pausing, resuming and hydration. */
    renderer: HostRender;
    /** Ref up. This whole class could be in host, but for internal clarity the more private and technical side is here. */
    private host;
    /** A simple counter is used to create unique id for each boundary (per host). */
    private bIdCount;
    /** This is the target render definition that defines the host's root boundary's render output. */
    private rootDef;
    private updateTimer;
    private updatesPending;
    private renderTimer;
    private rCallsPending;
    private rInfosPending;
    /** Temporary value (only needed for .onlyRunInContainer setting). */
    private _rootDisabled?;
    /** Temporary forced render timeout. */
    private _renderTimeout?;
    /** Temporary flag to mark while update process is in progress. */
    private _isUpdating?;
    /** Temporary internal callbacks that will be called when the update cycle is done. */
    _afterUpdate?: Array<() => void>;
    /** Temporary internal callbacks that will be called after the render cycle is done. */
    _afterRender?: Array<() => void>;
    constructor(host: Host);
    /** This creates a new boundary id in the form of "h-hostId:b-bId", where hostId and bId are strings from the id counters. For example: "h-1:b:5"  */
    createBoundaryId(): MixDOMSourceBoundaryId;
    clearTimers(forgetPending?: boolean): void;
    createRoot(content: MixDOMRenderOutput): ComponentTypeAny;
    updateRoot(content: MixDOMRenderOutput, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    refreshRoot(forceUpdate?: boolean, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    clearRoot(forgetPending?: boolean): void;
    getRootDef(shallowCopy?: boolean): MixDOMDefTarget | null;
    hasPending(updateSide?: boolean, postSide?: boolean): boolean;
    cancelUpdates(boundary: SourceBoundary): void;
    /** This is the main method to update a boundary.
     * - It applies the updates to bookkeeping immediately.
     * - The actual update procedure is either timed out or immediate according to settings.
     *   .. It's recommended to use a tiny update timeout (eg. 0ms) to group multiple updates together. */
    absorbUpdates(boundary: SourceBoundary, updates: MixDOMComponentPreUpdates, refresh?: boolean, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** This triggers the update cycle. */
    triggerUpdates(forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** This method should always be used when executing updates within a host - it's the main orchestrator of updates.
     * To add to post updates use the .absorbUpdates() method above. It triggers calling this with the assigned timeout, so many are handled together. */
    private runUpdates;
    /** This is the core whole command to update a source boundary including checking if it should update and if has already been updated.
     * - It handles the _preUpdates bookkeeping and should update checking and return infos for changes.
     * - It should only be called from a few places: 1. runUpdates flow above, 2. within _Apply.applyDefPairs for updating nested, 3. HostServices.updateInterested for updating indirectly interested sub boundaries.
     * - If gives bInterested, it's assumed to be be unordered, otherwise give areOrdered = true. */
    updateBoundary(boundary: SourceBoundary, forceUpdate?: boolean | "all", movedNodes?: MixDOMTreeNode[], bInterested?: Set<SourceBoundary> | null): MixDOMChangeInfos | null;
    /** This absorbs infos from the updates done. Infos are for update calls and to know what to render. Triggers calling runRender. */
    absorbChanges(renderInfos: MixDOMRenderInfo[] | null, boundaryChanges?: MixDOMSourceBoundaryChange[] | null, forceRenderTimeout?: number | null): void;
    private runRender;
    private refreshWithTimeout;
    /** Whenever a change happens, we want the states to be immediately updated (for clearer and more flexible behaviour).
     * To do this, we need to set them immediately and at the same time collect old info (unless had old collected already). */
    static preSetUpdates(boundary: SourceBoundary, updates: MixDOMComponentPreUpdates): void;
    static updateInterested(bInterested: Set<SourceBoundary>, sortBefore?: boolean): MixDOMChangeInfos;
    static shouldUpdateBy(boundary: SourceBoundary, newUpdates: MixDOMComponentUpdates, preUpdates: MixDOMComponentUpdates | null): boolean;
    private static callBoundaryChanges;
}

/** Technically should return void. But for conveniency can return anything - does not use the return value in any case. */
declare type DataListenerFunc = (...args: any[]) => any | void;
/** There are two ways you can use this:
 * 1. Call this to give basic DataMan features with advanced typing being empty.
 *      * `class MyMix extends DataManMixin(MyBase) {}`
 * 2. If you want to define the Data and Signals types, you can use this trick instead:
 *      * `class MyMix extends (DataManMixin as ClassMixer<DataManType<Data, Signals>>)(MyBase) {}`
 */
declare const DataManMixin: ClassMixer<ClassType<DataMan<any>, any[]>>;
interface DataManType<Data = any> extends ClassType<DataMan<Data>> {
}
declare const DataMan_base: {
    new (data?: any, ...args: any[]): {
        readonly data: any;
        /** External data listeners - called after the contextual components. The keys are data listener callbacks, and values are the data needs. */
        dataListeners: Map<DataListenerFunc, string[]>;
        /** The pending data keys - for internal refreshing uses. */
        dataKeysPending: true | string[] | null;
        listenToData(...args: any[]): void;
        /** Remove a data listener manually. Returns true if did remove, false if wasn't attached. */
        unlistenToData(callback: DataListenerFunc): boolean;
        getData(): any;
        getInData(dataKey: string, fallback?: any): any;
        setData(data: any, extend?: boolean, refresh?: boolean, ...timeArgs: any[]): void;
        setInData(dataKey: string, subData: any, extend?: boolean, refresh?: boolean, ...timeArgs: any[]): void;
        /** Trigger refresh and optionally add data keys for refreshing.
         * - This triggers callbacks from dataListeners that match needs in dataKeysPending.
         * - This base implementation just calls the listeners with matching keys immediately / after the given timeout.
         * - Note that you might want to override this method and tie it to some refresh system.
         *      * In that case, remember to feed the keys: `if (dataKeys) this.addRefreshKeys(dataKeys);`
         */
        refreshData(dataKeys?: string | boolean | string[] | null | undefined, forceTimeout?: number | null | undefined): void;
        /** Note that this only adds the refresh keys but will not refresh. */
        addRefreshKeys(refreshKeys: string | boolean | string[]): void;
    };
};
declare class DataMan<Data = any> extends DataMan_base {
}
/** This provides data setting and listening features with dotted strings.
 * - Example to create: `const dataMan = new MixDOM.DataMan({ ...initData });`
 * - Example for listening: `dataMan.listenToData("some.data.key", "another", (some, other) => { ... })`
 * - Example for setting data: `dataMan.setInData("some.data.key", somedata)`
 */
interface DataMan<Data = any> {
    readonly data: Data;
    /** External data listeners - called after the contextual components. The keys are data listener callbacks, and values are the data needs. */
    dataListeners: Map<DataListenerFunc, string[]>;
    /** The pending data keys - for internal refreshing uses. */
    dataKeysPending: string[] | true | null;
    /** This allows to listen to data by defining specific needs which in turn become the listener arguments.
     * - The needs are defined as dotted strings: For example, `listenToData("user.allowEdit", "themes.darkMode", (allowEdit, darkMode) => { ... });`
     * - By calling this, we both assign a listener but also set data needs to it, so it will only be called when the related data portions have changed.
     * - To remove the listener use `unlistenToData(callback)`.
     */
    listenToData<Keys extends GetJoinedDataKeysFrom<Data & {}>, Key1 extends Keys, Callback extends (val1: PropType<Data, Key1, never>) => void>(dataKey: Key1, callback: Callback, callImmediately?: boolean): void;
    listenToData<Keys extends GetJoinedDataKeysFrom<Data & {}>, Key1 extends Keys, Key2 extends Keys, Callback extends (val1: PropType<Data, Key1, never>, val2: PropType<Data, Key2, never>) => void>(dataKey1: Key1, dataKey2: Key2, callback: Callback, callImmediately?: boolean): void;
    listenToData<Keys extends GetJoinedDataKeysFrom<Data & {}>, Key1 extends Keys, Key2 extends Keys, Key3 extends Keys, Callback extends (val1: PropType<Data, Key1, never>, val2: PropType<Data, Key2, never>, val3: PropType<Data, Key3, never>) => void>(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, callback: Callback, callImmediately?: boolean): void;
    listenToData<Keys extends GetJoinedDataKeysFrom<Data & {}>, Key1 extends Keys, Key2 extends Keys, Key3 extends Keys, Key4 extends Keys, Fallback extends [fall1?: PropType<Data, Key1, never> | null, fall2?: PropType<Data, Key2, never> | null, fall3?: PropType<Data, Key3, never> | null, fall4?: PropType<Data, Key4, never> | null], Callback extends (val1: PropType<Data, Key1, never>, val2: PropType<Data, Key2, never>, val3: PropType<Data, Key3, never>, val4: PropType<Data, Key4, never>) => void>(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, callback: Callback, callImmediately?: boolean): void;
    listenToData<Keys extends GetJoinedDataKeysFrom<Data & {}>, Key1 extends Keys, Key2 extends Keys, Key3 extends Keys, Key4 extends Keys, Key5 extends Keys, Callback extends (val1: PropType<Data, Key1, never>, val2: PropType<Data, Key2, never>, val3: PropType<Data, Key3, never>, val4: PropType<Data, Key4, never>, val5: PropType<Data, Key5, never>) => void>(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, dataKey5: Key5, callback: Callback, callImmediately?: boolean): void;
    listenToData<Keys extends GetJoinedDataKeysFrom<Data & {}>, Key1 extends Keys, Key2 extends Keys, Key3 extends Keys, Key4 extends Keys, Key5 extends Keys, Key6 extends Keys, Callback extends (val1: PropType<Data, Key1, never>, val2: PropType<Data, Key2, never>, val3: PropType<Data, Key3, never>, val4: PropType<Data, Key4, never>, val5: PropType<Data, Key5, never>, val6: PropType<Data, Key6, never>) => void>(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, dataKey5: Key5, dataKey6: Key6, callback: Callback, callImmediately?: boolean): void;
    listenToData<Keys extends GetJoinedDataKeysFrom<Data & {}>, Key1 extends Keys, Key2 extends Keys, Key3 extends Keys, Key4 extends Keys, Key5 extends Keys, Key6 extends Keys, Key7 extends Keys, Callback extends (val1: PropType<Data, Key1, never>, val2: PropType<Data, Key2, never>, val3: PropType<Data, Key3, never>, val4: PropType<Data, Key4, never>, val5: PropType<Data, Key5, never>, val6: PropType<Data, Key6, never>, val7: PropType<Data, Key7, never>) => void>(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, dataKey5: Key5, dataKey6: Key6, dataKey7: Key6, callback: Callback, callImmediately?: boolean): void;
    listenToData<Keys extends GetJoinedDataKeysFrom<Data & {}>, Key1 extends Keys, Key2 extends Keys, Key3 extends Keys, Key4 extends Keys, Key5 extends Keys, Key6 extends Keys, Key7 extends Keys, Key8 extends Keys, Callback extends (val1: PropType<Data, Key1, never>, val2: PropType<Data, Key2, never>, val3: PropType<Data, Key3, never>, val4: PropType<Data, Key4, never>, val5: PropType<Data, Key5, never>, val6: PropType<Data, Key6, never>, val7: PropType<Data, Key7, never>, val8: PropType<Data, Key8, never>) => void>(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, dataKey5: Key5, dataKey6: Key6, dataKey7: Key6, dataKey8: Key8, callback: Callback, callImmediately?: boolean): void;
    /** Remove a data listener manually. Returns true if did remove, false if wasn't attached. */
    unlistenToData(callback: DataListenerFunc): boolean;
    /** Get the whole data (directly).
     * - If you want to use refreshes and such as designed, don't modify the data directly (do it via setData or setInData) - or then call .refreshData accordingly. */
    getData(): Data;
    /** Get a portion within the data using dotted string to point the location. For example: "themes.selected". */
    getInData<DataKey extends GetJoinedDataKeysFrom<Data & {}>>(dataKey: DataKey, fallback?: PropType<Data, DataKey, never>): PropType<Data, DataKey>;
    /** Set the data and refresh.
     * - Note that the extend functionality should only be used for dictionary objects. */
    setData(data: Data, extend?: boolean | false, refresh?: boolean, forceTimeout?: number | null): void;
    setData(data: Partial<Data>, extend?: boolean | true, refresh?: boolean, forceTimeout?: number | null): void;
    /** Set or extend in nested data, and refresh with the key.
     * - Note that the extend functionality should only be used for dictionary objects. */
    setInData<DataKey extends GetJoinedDataKeysFrom<Data & {}>, SubData extends PropType<Data, DataKey, never>>(dataKey: DataKey, subData: Partial<SubData>, extend?: true, refresh?: boolean, forceTimeout?: number | null): void;
    setInData<DataKey extends GetJoinedDataKeysFrom<Data & {}>, SubData extends PropType<Data, DataKey, never>>(dataKey: DataKey, subData: SubData, extend?: boolean | undefined, refresh?: boolean, forceTimeout?: number | null): void;
    /** This refreshes both: data & pending signals.
     * - If refreshKeys defined, will add them - otherwise only refreshes pending.
     * - Note that if !!refreshKeys is false, then will not add any refreshKeys. If there were none, will only trigger the signals. */
    refreshData<DataKey extends GetJoinedDataKeysFrom<Data & {}>>(dataKeys: DataKey | DataKey[] | boolean, forceTimeout?: number | null): void;
    refreshData<DataKey extends GetJoinedDataKeysFrom<Data & {}>>(dataKeys: DataKey | DataKey[] | boolean, forceTimeout?: number | null): void;
    /** Note that this only adds the refresh keys but will not refresh. */
    addRefreshKeys(refreshKeys?: string | string[] | boolean): void;
}

/** There are two ways you can use this:
 * 1. Call this to give basic DataSignalMan features with advanced typing being empty.
 *      * `class MyMix extends DataSignalManMixin(MyBase) {}`
 * 2. If you want to define the Data and Signals types, you can use this trick instead:
 *      * `class MyMix extends (DataSignalManMixin as ClassMixer<DataSignalManType<Data, Signals>>)(MyBase) {}`
 */
declare const DataSignalManMixin: ClassMixer<ClassType<DataMan<any> & SignalMan<{}>, any[]>>;
interface DataSignalManType<Data = any, Signals extends SignalsRecord = {}> extends ClassType<DataSignalMan<Data, Signals>> {
}
declare const DataSignalMan_base: ClassType<{}, any[]>;
declare class DataSignalMan<Data = any, Signals extends SignalsRecord = {}> extends DataSignalMan_base {
}
interface DataSignalMan<Data = any, Signals extends SignalsRecord = {}> extends DataMan<Data>, SignalMan<Signals> {
}

declare type ContextSettings = {
    /** Timeout for refreshing for this particular context.
     * - The timeout is used for both: data refresh and (normal) actions.
     * - If null, then synchronous - defaults to 0ms.
     * - Note that if you use null, the updates will run synchronously.
     *   .. It's not recommended to use it, because you'd have to make sure you always use it in that sense.
     *   .. For example, the component you called from might have already unmounted on the next line (especially if host is fully synchronous, too). */
    refreshTimeout: number | null;
};
/** Context provides signal and data listener features (extending `SignalMan` and `DataMan` basis).
 * - It provides direct listening but is also designed to work with ContextAPI instances.
 * - Each MixDOM rendering Host has a ContextAPI instance and the Component class has related methods for ease of use (and auto-disconnection on unmount).
 */
declare class Context<Data = any, Signals extends SignalsRecord = any> extends DataSignalMan<Data, Signals> {
    static MIX_DOM_CLASS: string;
    ["constructor"]: ContextType<Data, Signals>;
    settings: ContextSettings;
    /** The keys are the ContextAPIs this context is attached to with a name, and the values are the names (typically only one). They are used for refresh related purposes. */
    contextAPIs: Map<ContextAPI, string[]>;
    /** Temporary internal timer marker. */
    refreshTimer: number | NodeJSTimeout | null;
    /** Temporary internal callbacks that will be called when the update cycle is done. */
    private _afterUpdate?;
    /** Temporary internal callbacks that will be called after the update cycle and the related host "render" refresh have been flushed. */
    private _afterRender?;
    constructor(data: any, settings?: Partial<ContextSettings> | null | undefined);
    /** Overridden to support getting signal listeners from related contextAPIs - in addition to direct listeners (which are put first). */
    getListenersFor(signalName: string): SignalListener[] | undefined;
    /** This returns a promise that is resolved when the context is refreshed, or after all the hosts have refreshed. */
    afterRefresh(fullDelay?: boolean, forceTimeout?: number | null): Promise<void>;
    /** Trigger refresh of the context and optionally add data keys.
     * - This triggers calling pending data keys and delayed signals (when the refresh cycle is executed). */
    refreshData<DataKey extends GetJoinedDataKeysFrom<Data & {}>>(dataKeys: DataKey | DataKey[] | boolean | null, forceTimeout?: number | null): void;
    triggerRefresh(forceTimeout?: number | null): void;
    /** This refreshes the context immediately.
     * - This is assumed to be called only by the .refresh function above.
     * - So it will mark the timer as cleared, without using clearTimeout for it. */
    private refreshPending;
    /** Update settings with a dictionary. If any value is `undefined` then uses the default setting. */
    modifySettings(settings: Partial<ContextSettings>): void;
    static getDefaultSettings(): ContextSettings;
    /** This is only provided for typing related technical reasons. There's no actual Signals object on the javascript side. */
    _Signals: Signals;
}
declare type ContextType<Data = any, Signals extends SignalsRecord = SignalsRecord> = ClassType<Context<Data, Signals>, [Data?, Partial<ContextSettings>?]> & {
    readonly MIX_DOM_CLASS: string;
};
/** Create a new context. */
declare const newContext: <Data = any, Signals extends SignalsRecord = SignalsRecord>(data?: Data | undefined, settings?: Partial<ContextSettings>) => Context<Data, Signals>;
/** Create multiple named contexts by giving data. */
declare const newContexts: <Contexts extends { [Name in keyof AllData & string]: Context<AllData[Name], any>; }, AllData extends { [Name_1 in keyof Contexts & string]: Contexts[Name_1]["data"]; } = { [Name_2 in keyof Contexts & string]: Contexts[Name_2]["data"]; }>(contextsData: AllData, settings?: Partial<ContextSettings>) => Contexts;

declare type MixDOMContextsAll = Record<string, Context<any, SignalsRecord>>;
declare type MixDOMContextsAllOrNull<AllContexts extends MixDOMContextsAll = {}> = {
    [Name in keyof AllContexts]: AllContexts[Name] | null;
};
declare type GetJoinedDataKeysFromContexts<Contexts extends MixDOMContextsAll> = {
    [CtxName in string & keyof Contexts]: GetJoinedDataKeysFrom<Contexts[CtxName]["data"], CtxName>;
}[string & keyof Contexts];
declare type GetJoinedSignalKeysFromContexts<Contexts extends MixDOMContextsAll> = {
    [CtxName in string & keyof Contexts]: keyof Contexts[CtxName]["_Signals"] extends string ? `${CtxName}.${keyof Contexts[CtxName]["_Signals"]}` : never;
}[string & keyof Contexts];
declare type MergeSignalsFromContexts<Ctxs extends MixDOMContextsAll> = {
    [Key in string & GetJoinedSignalKeysFromContexts<Ctxs>]: [Ctxs[FirstSplit<Key, ".">]["_Signals"][SecondSplit<Key, ".">]] extends [SignalListenerFunc] ? Ctxs[FirstSplit<Key, ".">]["_Signals"][SecondSplit<Key, ".">] : never;
};
declare type GetDataByContextString<Key extends string, Contexts extends MixDOMContextsAll> = GetDataByContextKeys<SplitOnce<Key, ".">, Contexts>;
declare type GetDataByContextKeys<CtxKeys extends string[], Contexts extends MixDOMContextsAll> = [
    CtxKeys[0]
] extends [keyof Contexts] ? [
    CtxKeys[1]
] extends [string] ? PropType<Contexts[CtxKeys[0]]["data"], CtxKeys[1], never> : Contexts[CtxKeys[0]]["data"] : never;
/** ContextAPI looks like it has full SignalMan and DataMan capabilities but only extends SignalBoy internally.
 * - It has all the same methods, but does not have .data member and data listening can have a fallback array.
 * - All data keys and signal names should start with "contextName.", for example: "settings.theme" data key or "navigation.onFocus" signal.
 */
declare class ContextAPI<Contexts extends MixDOMContextsAll = {}, CtxSignals extends SignalsRecord = MergeSignalsFromContexts<Contexts>> extends SignalBoy<CtxSignals> {
    /** Data needs mapping using the callback as the key and value contains the data needs. The data needs are also used as to get the argument values for the callback. */
    dataListeners: Map<DataListenerFunc, [needs: string[], fallbackArgs?: any[]]>;
    /** All the contexts assigned to us.
     * - They also have a link back to us by context.contextAPIs, with this as the key and context names as the values.
     * - Note that can also set `null` value here - for purposefully excluding an inherited context (when using one contextAPI to inherit contexts from another).
     *      * But `undefined` will never be found in here - if gives to the setContext, it means deleting the entry from the record. */
    contexts: Partial<Record<string, Context<any, SignalsRecord> | null>>;
    constructor(contexts?: Partial<Contexts>);
    /** This triggers a refresh and returns a promise that is resolved when the update / render cycle is completed.
     * - If there's nothing pending, then will resolve immediately.
     * - This uses the signals system, so the listener is called among other listeners depending on the adding order.
     * - Note that this method is overrideable. On the basic implementation it resolves immediately.
     *      * However, on the Host.contextAPI it's tied to the Host's update / render cycle - and serves as the bridge for syncing (to implement "delay" signals). */
    afterRefresh(fullDelay?: boolean, forceTimeout?: number | null): Promise<void>;
    /** Emit a signal. Does not return a value. Use `sendSignalAs(modes, ctxSignalName, ...args)` to refine the behaviour. */
    sendSignal<CtxSignalName extends string & keyof CtxSignals, CtxName extends keyof Contexts & FirstSplit<CtxSignalName, ".">, SignalName extends string & SecondSplit<CtxSignalName, ".">>(ctxSignalName: CtxSignalName, ...args: Parameters<Contexts[CtxName]["_Signals"][SignalName]>): void;
    /** This exposes various features to the signalling process which are inputted as the first arg: either string or string[]. Features are:
     * - "delay": Delays sending the signal. To also collect returned values must include "await".
     *      * Note that this delays the process to sync with the Context's refresh cycle and further after all the related host's have finished their "render" cycle.
     * - "pre-delay": Like "delay", syncs to the Context's refresh cycle, but calls then on that cycle - without waiting the host's to have rendered.
     * - "await": Awaits each listener (simultaneously) and returns a promise. By default returns the last non-`undefined` value, combine with "multi" to return an array of awaited values (skipping `undefined`).
     *      * Exceptionally if "delay" is on, and there's no "await" then can only return `undefined`, as there's no promise to capture the timed out returns.
     * - "multi": This is the default mode: returns an array of values ignoring any `undefined`.
     *      * Inputting this mode makes no difference. It's just provided for typing convenience when wants a list of answers without anything else (instead of inputting "").
     * - "last": Use this to return the last acceptable value (by default ignoring any `undefined`) - instead of an array of values.
     * - "first": Stops the listening at the first value that is not `undefined` (and not skipped by "no-false" or "no-null"), and returns that single value.
     *      * Note that "first" does not stop the flow when using "await" as the async calls are made simultaneously. But it returns the first acceptable value.
     * - "first-true": Is like "first" but stops only if value amounts to true like: !!value.
     * - "no-false": Ignores any falsifiable values, only accepts: `(!!value)`. So most commonly ignored are: `false`, `0`, `""`, `null´, `undefined`.
     * - "no-null": Ignores any `null` values in addition to `undefined`. (By default only ignores `undefined`.)
     *      * Note also that when returning values, any signal that was connected with .Deferred flag will always be ignored from the return value flow (and called 0ms later, in addition to "delay" timeout).
     * - Note that ContextAPI's sendSignal and sendSignalAs will use the contexts methods if found. If context not found immediately when called, then does nothing.
     */
    sendSignalAs<CtxSignalName extends string & keyof CtxSignals, Mode extends "" | "pre-delay" | "delay" | "await" | "last" | "first" | "first-true" | "multi" | "no-false" | "no-null", HasAwait extends boolean = Mode extends string[] ? Mode[number] extends "await" ? true : false : Mode extends "await" ? true : false, HasLast extends boolean = Mode extends string[] ? Mode[number] extends "last" ? true : false : Mode extends "last" ? true : false, HasFirst extends boolean = Mode extends string[] ? Mode[number] extends "first" ? true : Mode[number] extends "first-true" ? true : false : Mode extends "first" ? true : Mode extends "first-true" ? true : false, HasMulti extends boolean = Mode extends string[] ? Mode[number] extends "multi" ? true : false : Mode extends "multi" ? true : false, HasDelay extends boolean = Mode extends string[] ? Mode[number] extends "delay" ? true : false : Mode extends "delay" ? true : false, HasPreDelay extends boolean = Mode extends string[] ? Mode[number] extends "pre-delay" ? true : false : Mode extends "pre-delay" ? true : false, UseSingle extends boolean = true extends HasMulti ? false : HasFirst | HasLast, UseReturnVal extends boolean = true extends HasAwait ? true : true extends HasDelay | HasPreDelay ? false : true>(modes: Mode | Mode[], ctxSignalName: CtxSignalName, ...args: Parameters<CtxSignals[CtxSignalName]>): true extends UseReturnVal ? SignalSendAsReturn<ReturnType<CtxSignals[CtxSignalName]>, HasAwait, UseSingle> : undefined;
    /** This allows to listen to contextual data by defining specific needs which in turn become the listener arguments.
     * - The needs are defined as dotted strings in which the first word is the contextName: eg. `settings.user` refers to context named `settings` and it has `user` data.
     * - The needs are transferred to callback arguments. For example, if we have contexts named "settings" and "themes", we could do something like:
     *      * `listenToData("settings.user.allowEdit", "themes.darkMode", (allowEdit, darkMode) => { ... });`
     * - By calling this, we both assign a listener but also set data needs.
     *      *  The listener will be fired on data changes. If puts last argument to `true`, will be fired once immediately - or when mounts if not yet mounted.
     *      *  The data needs are used to detect when the callback needs to be fired again. Will only be fired if the data in the portion (or including it) has been set.
     * - Normally, using ContextAPI you never need to remove the listeners (they'll be disconnected upon unmounting). But you can use `unlistenToData(callback)` to do so manually as well.
     * - You can also input fallbackArgs after the callback, to provide for the cases where context is missing.
     */
    listenToData<Keys extends GetJoinedDataKeysFromContexts<Contexts>, Key1 extends Keys, Fallback extends [fall1?: GetDataByContextString<Key1, Contexts> | null], Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0]) => void>(dataKey1: Key1, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    listenToData<Keys extends GetJoinedDataKeysFromContexts<Contexts>, Key1 extends Keys, Key2 extends Keys, Fallback extends [fall1?: GetDataByContextString<Key1, Contexts> | null, fall2?: GetDataByContextString<Key2, Contexts> | null], Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0], val2: GetDataByContextString<Key2, Contexts> | Fallback[1]) => void>(dataKey1: Key1, dataKey2: Key2, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    listenToData<Keys extends GetJoinedDataKeysFromContexts<Contexts>, Key1 extends Keys, Key2 extends Keys, Key3 extends Keys, Fallback extends [fall1?: GetDataByContextString<Key1, Contexts> | null, fall2?: GetDataByContextString<Key2, Contexts> | null, fall3?: GetDataByContextString<Key3, Contexts> | null], Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0], val2: GetDataByContextString<Key2, Contexts> | Fallback[1], val3: GetDataByContextString<Key3, Contexts> | Fallback[2]) => void>(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    listenToData<Keys extends GetJoinedDataKeysFromContexts<Contexts>, Key1 extends Keys, Key2 extends Keys, Key3 extends Keys, Key4 extends Keys, Fallback extends [fall1?: GetDataByContextString<Key1, Contexts> | null, fall2?: GetDataByContextString<Key2, Contexts> | null, fall3?: GetDataByContextString<Key3, Contexts> | null, fall4?: GetDataByContextString<Key4, Contexts> | null], Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0], val2: GetDataByContextString<Key2, Contexts> | Fallback[1], val3: GetDataByContextString<Key3, Contexts> | Fallback[2], val4: GetDataByContextString<Key4, Contexts> | Fallback[3]) => void>(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    listenToData<Keys extends GetJoinedDataKeysFromContexts<Contexts>, Key1 extends Keys, Key2 extends Keys, Key3 extends Keys, Key4 extends Keys, Key5 extends Keys, Fallback extends [fall1?: GetDataByContextString<Key1, Contexts> | null, fall2?: GetDataByContextString<Key2, Contexts> | null, fall3?: GetDataByContextString<Key3, Contexts> | null, fall4?: GetDataByContextString<Key4, Contexts> | null, fall5?: GetDataByContextString<Key5, Contexts> | null], Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0], val2: GetDataByContextString<Key2, Contexts> | Fallback[1], val3: GetDataByContextString<Key3, Contexts> | Fallback[2], val4: GetDataByContextString<Key4, Contexts> | Fallback[3], val5: GetDataByContextString<Key5, Contexts> | Fallback[4]) => void>(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, dataKey5: Key5, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    listenToData<Keys extends GetJoinedDataKeysFromContexts<Contexts>, Key1 extends Keys, Key2 extends Keys, Key3 extends Keys, Key4 extends Keys, Key5 extends Keys, Key6 extends Keys, Fallback extends [fall1?: GetDataByContextString<Key1, Contexts> | null, fall2?: GetDataByContextString<Key2, Contexts> | null, fall3?: GetDataByContextString<Key3, Contexts> | null, fall4?: GetDataByContextString<Key4, Contexts> | null, fall5?: GetDataByContextString<Key5, Contexts> | null, fall6?: GetDataByContextString<Key6, Contexts> | null], Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0], val2: GetDataByContextString<Key2, Contexts> | Fallback[1], val3: GetDataByContextString<Key3, Contexts> | Fallback[2], val4: GetDataByContextString<Key4, Contexts> | Fallback[3], val5: GetDataByContextString<Key5, Contexts> | Fallback[4], val6: GetDataByContextString<Key6, Contexts> | Fallback[5]) => void>(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, dataKey5: Key5, dataKey6: Key6, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    listenToData<Keys extends GetJoinedDataKeysFromContexts<Contexts>, Key1 extends Keys, Key2 extends Keys, Key3 extends Keys, Key4 extends Keys, Key5 extends Keys, Key6 extends Keys, Key7 extends Keys, Fallback extends [fall1?: GetDataByContextString<Key1, Contexts> | null, fall2?: GetDataByContextString<Key2, Contexts> | null, fall3?: GetDataByContextString<Key3, Contexts> | null, fall4?: GetDataByContextString<Key4, Contexts> | null, fall5?: GetDataByContextString<Key5, Contexts> | null, fall6?: GetDataByContextString<Key6, Contexts> | null, fall7?: GetDataByContextString<Key7, Contexts> | null], Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0], val2: GetDataByContextString<Key2, Contexts> | Fallback[1], val3: GetDataByContextString<Key3, Contexts> | Fallback[2], val4: GetDataByContextString<Key4, Contexts> | Fallback[3], val5: GetDataByContextString<Key5, Contexts> | Fallback[4], val6: GetDataByContextString<Key6, Contexts> | Fallback[5], val7: GetDataByContextString<Key7, Contexts> | Fallback[6]) => void>(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, dataKey5: Key5, dataKey6: Key6, dataKey7: Key6, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    listenToData<Keys extends GetJoinedDataKeysFromContexts<Contexts>, Key1 extends Keys, Key2 extends Keys, Key3 extends Keys, Key4 extends Keys, Key5 extends Keys, Key6 extends Keys, Key7 extends Keys, Key8 extends Keys, Fallback extends [fall1?: GetDataByContextString<Key1, Contexts> | null, fall2?: GetDataByContextString<Key2, Contexts> | null, fall3?: GetDataByContextString<Key3, Contexts> | null, fall4?: GetDataByContextString<Key4, Contexts> | null, fall5?: GetDataByContextString<Key5, Contexts> | null, fall6?: GetDataByContextString<Key6, Contexts> | null, fall7?: GetDataByContextString<Key7, Contexts> | null, fall8?: GetDataByContextString<Key8, Contexts> | null], Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0], val2: GetDataByContextString<Key2, Contexts> | Fallback[1], val3: GetDataByContextString<Key3, Contexts> | Fallback[2], val4: GetDataByContextString<Key4, Contexts> | Fallback[3], val5: GetDataByContextString<Key5, Contexts> | Fallback[4], val6: GetDataByContextString<Key6, Contexts> | Fallback[5], val7: GetDataByContextString<Key7, Contexts> | Fallback[6], val8: GetDataByContextString<Key8, Contexts> | Fallback[7]) => void>(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, dataKey5: Key5, dataKey6: Key6, dataKey7: Key6, dataKey8: Key8, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    /** Remove a data listener manually. Returns true if did remove, false if wasn't attached. */
    unlistenToData(callback: DataListenerFunc): boolean;
    /** Get from contextual data by dotted key: eg. `"someCtxName.someData.someProp"`.
     * - If the context exists uses the getInData method from the context, otherwise returns undefined or the fallback. (The fallback is also used if the data key not found in context data.)
     */
    getInData<CtxDataKey extends GetJoinedDataKeysFromContexts<Contexts>, SubData extends GetDataByContextString<CtxDataKey, Contexts>>(ctxDataKey: CtxDataKey, fallback?: never | undefined): SubData | undefined;
    getInData<CtxDataKey extends GetJoinedDataKeysFromContexts<Contexts>, SubData extends GetDataByContextString<CtxDataKey, Contexts>, FallbackData extends SubData>(ctxDataKey: CtxDataKey, fallback: FallbackData): SubData;
    /** Set in contextual data by dotted key: eg. `"someCtxName.someData.someProp"`.
     * - Sets the data in the context, if context found, and triggers refresh (by default). If the sub data is an object, can also extend.
     * - Note that if the context is found, using this triggers the contextual data listeners (with default or forced timeout). */
    setInData<CtxDataKey extends GetJoinedDataKeysFromContexts<Contexts>, SubData extends GetDataByContextString<CtxDataKey, Contexts>>(ctxDataKey: CtxDataKey, data: Partial<SubData> & Dictionary, extend?: true, refresh?: boolean, forceTimeout?: number | null): void;
    setInData<CtxDataKey extends GetJoinedDataKeysFromContexts<Contexts>, SubData extends GetDataByContextString<CtxDataKey, Contexts>>(ctxDataKey: CtxDataKey, data: SubData, extend?: boolean, refresh?: boolean, forceTimeout?: number | null): void;
    /** Manually trigger refresh without setting the data using a dotted key (or an array of them) with context name: eg. `"someCtxName.someData.someProp"`. */
    refreshData<CtxDataKey extends GetJoinedDataKeysFromContexts<Contexts>>(ctxDataKeys: CtxDataKey | CtxDataKey[], forceTimeout?: number | null): void;
    /** Manually trigger refresh by multiple refreshKeys for multiple contexts.
     * - Note that unlike the other data methods in the ContextAPI, this one separates the contextName and the keys: `{ [contextName]: dataKeys }`
     * - The data keys can be `true` to refresh all in the context, or a dotted string or an array of dotted strings to refresh multiple separate portions simultaneously. */
    refreshDataBy<All extends {
        [Name in keyof Contexts]: All[Name] extends boolean ? boolean : All[Name] extends string ? PropType<Contexts[Name]["data"], All[Name], never> extends never ? never : string : All[Name] extends string[] | readonly string[] ? unknown extends PropType<Contexts[Name]["data"], All[Name][number]> ? never : string[] | readonly string[] : never;
    }>(namedRefreshes: Partial<All>, forceTimeout?: number | null): void;
    /** Gets the context locally by name. Returns null if not found, otherwise Context.
     * - This method can be extended to get contexts from elsewhere in addition. (It's used internally all around ContextAPI, except in getContexts and setContext.)
     */
    getContext<Name extends keyof Contexts & string>(name: Name): Contexts[Name] | null | undefined;
    /** Gets the contexts by names. If name not found, not included in the returned dictionary, otherwise the values are Context | null. */
    getContexts<Name extends keyof Contexts & string>(onlyNames?: RecordableType<Name> | null): Partial<Record<string, Context | null>> & Partial<MixDOMContextsAllOrNull<Contexts>>;
    /** This creates a new context - presumably to be attached with .contexts prop.
     * - If overrideWithName given, then calls setContext automatically with the given name. */
    newContext<CtxData = any, CtxSignals extends SignalsRecord = {}>(data: CtxData, overrideWithName?: never | "" | undefined, refreshIfOverriden?: never | false): Context<CtxData, CtxSignals>;
    newContext<Name extends keyof Contexts & string>(data: Contexts[Name]["data"], overrideWithName: Name, refreshIfOverriden?: boolean): Contexts[Name];
    /** Same as newContext but for multiple contexts all at once.
     * - If overrideForSelf set to true, will call setContexts after to attach the contexts here. */
    newContexts<Contexts extends {
        [Name in keyof AllData & string]: Context<AllData[Name]>;
    }, AllData extends {
        [Name in keyof Contexts & string]: Contexts[Name]["data"];
    } = {
        [Name in keyof Contexts & string]: Contexts[Name]["data"];
    }>(allData: AllData, overrideForSelf?: never | false | undefined, refreshIfOverriden?: never | false): Contexts;
    newContexts<Name extends keyof Contexts & string>(allData: Partial<Record<Name, Contexts[Name]["data"]>>, overrideForSelf: true, refreshIfOverriden?: boolean): Partial<Record<Name, Contexts[Name]["data"]>>;
    /** Attach the context to this ContextAPI by name. Returns true if did attach, false if was already there.
     * - Note that if the context is `null`, it will be kept in the bookkeeping. If it's `undefined`, it will be removed.
     *      * This only makes difference when uses one ContextAPI to inherit its contexts from another ContextAPI.
     */
    setContext<Name extends keyof Contexts & string>(name: Name, context: Contexts[Name] | null | undefined, callDataIfChanged?: boolean): boolean;
    /** Set multiple named contexts in one go. Returns true if did changes, false if didn't. This will only modify the given keys.
     * - Note that if the context is `null`, it will be kept in the bookkeeping. If it's `undefined`, it will be removed.
     *      * This only makes difference when uses one ContextAPI to inherit its contexts from another ContextAPI.
     */
    setContexts(contexts: Partial<{
        [CtxName in keyof Contexts]: Contexts[CtxName] | null | undefined;
    }>, callDataIfChanged?: boolean): boolean;
    /** Helper to build data arguments from this ContextAPI's contextual connections with the given data needs args.
     * - For example: `getDataArgsBy(["settings.user.name", "themes.darkMode"])`.
     * - Used internally but can be used for manual purposes. Does not support typing like listenToData - just string[].
     */
    getDataArgsBy(needs: string[], fallbackArgs?: any[]): any[];
    /** Manually trigger an update based on changes in context. Should not be used in normal circumstances.
     * - Only calls / triggers for refresh by needs related to the given contexts. If ctxNames is true, then all.
     */
    callDataBy(ctxDataKeys?: true | GetJoinedDataKeysFromContexts<Contexts>[]): void;
    /** Assignable getter to collect more signal listeners for a call through a specific context name. */
    getListenersFor?<CtxName extends string & keyof Contexts>(ctxName: CtxName, signalName: string & keyof Contexts[CtxName]["_Signals"]): SignalListener[] | undefined;
    /** Assignable getter to call more data listeners when specific context names are refreshed. */
    callDataListenersFor?(ctxNames: string[], dataKeys?: true | string[]): void;
}

/** This is simply a tiny class that is used to manage the host duplication features in a consistent way.
 * - Each Host has a `.shadowAPI`, but it's the very same class instance for all the hosts that are duplicated - the original and any duplicates have the same instance here.
 * - This way, it doesn't matter who is the original source (or if it dies away). As long as the shadowAPI instance lives, the originality lives.
 */
declare class HostShadowAPI<Contexts extends MixDOMContextsAll = {}> {
    /** These are the Host instances that share the common duplication basis. Note that only appear here once mounted (and disappear once cleaned up). */
    hosts: Set<Host<Contexts>>;
    /** These are the duplicatable contexts (by names). Any time a Host is duplicated, it will get these contexts automatically. */
    contexts: Partial<Contexts>;
}
/** The Host based ContextAPI simply adds an extra argument to the setContext and setContexts methods for handling which contexts are auto-assigned to duplicated hosts.
 * - It also has the afterRefresh method assign to the host's cycles. */
interface HostContextAPI<Contexts extends MixDOMContextsAll = {}> extends ContextAPI<Contexts> {
    /** The Host that this ContextAPI is attached to. Should be set manually after construction.
     * - It's used for two purposes: 1. Marking duplicatable contexts to the Host's shadowAPI, 2. syncing to the host refresh (with the afterRefresh method).
     * - It's assigned as a member to write HostContextAPI as a clean class.
     */
    host: Host<Contexts>;
    /** Attach the context to this ContextAPI by name. Returns true if did attach, false if was already there.
     * - Note that if the context is `null`, it will be kept in the bookkeeping. If it's `undefined`, it will be removed.
     *      * This only makes difference when uses one ContextAPI to inherit its contexts from another ContextAPI.
     * - Note that this method is extended on the HostContextAPI to include markAsDuplicatable option (defaults to false).
     *      * If set to true, will also modify the host.shadowAPI.contexts: if has a context adds there, if null or undefined removes from there.
     *      * It's a dictionary used for auto-assigning contexts to a new duplicated host - requires `host.settings.duplicatableHost: true`.
     */
    setContext<Name extends keyof Contexts & string>(name: Name, context: Contexts[Name] | null | undefined, callDataIfChanged?: boolean, markAsDuplicatable?: boolean): boolean;
    /** Set multiple named contexts in one go. Returns true if did changes, false if didn't. This will only modify the given keys.
     * - Note that if the context is `null`, it will be kept in the bookkeeping. If it's `undefined`, it will be removed.
     *      * This only makes difference when uses one ContextAPI to inherit its contexts from another ContextAPI.
     * - Note that this method is extended on the HostContextAPI to include markAsDuplicatable option (defaults to false).
     *      * If set to true, will also modify the host.shadowAPI.contexts: if has a context adds there, if null or undefined removes from there.
     *      * It's a dictionary used for auto-assigning contexts to a new duplicated host - requires `host.settings.duplicatableHost: true`.
     */
    setContexts(contexts: Partial<{
        [CtxName in keyof Contexts]: Contexts[CtxName] | null | undefined;
    }>, callDataIfChanged?: boolean, markAsDuplicatable?: boolean): boolean;
    /** This triggers a refresh and returns a promise that is resolved when the Host's update / render cycle is completed.
     * - If there's nothing pending, then will resolve immediately.
     * - This uses the signals system, so the listener is called among other listeners depending on the adding order. */
    afterRefresh(fullDelay?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): Promise<void>;
    /** Attached to provide adding all component based signals. Note that will skip any components that have the given context name overridden. */
    getListenersFor<CtxName extends string & keyof Contexts>(ctxName: CtxName, signalName: string & keyof Contexts[CtxName]["_Signals"]): SignalListener[] | undefined;
    /** Attached to provide adding all component based data listeners. Note that will skip any components that have all of those names overridden. */
    callDataListenersFor(ctxNames: string[], dataKeys?: true | string[]): void;
}
declare class HostContextAPI<Contexts extends MixDOMContextsAll = {}> extends ContextAPI<Contexts> {
}
interface HostType<Contexts extends MixDOMContextsAll = {}> {
    /** Used for host based id's. To help with sorting fluently across hosts. */
    idCount: number;
    new (content?: MixDOMRenderOutput, domContainer?: Node | null, settings?: HostSettingsUpdate | null): Host<Contexts>;
    modifySettings(baseSettings: HostSettings, newSettings: HostSettingsUpdate): void;
    getDefaultSettings(): HostSettings;
}
interface HostSettingsUpdate extends Partial<Omit<HostSettings, "updateComponentModes">> {
    updateComponentModes?: Partial<HostSettings["updateComponentModes"]>;
}
/** Settings for MixDOM behaviour for all inside a host instance.
 * The settings can be modified in real time: by host.updateSettings(someSettings) or manually, eg. host.settings.updateTimeout = null. */
interface HostSettings {
    /** If is null, then is synchronous. Otherwise uses the given timeout in ms. Defaults to 0ms.
     * - This timeout delays the beginning of the update process.
     *   * After the timeout has elapsed, .render() is called on components and a new structure is received.
     *   * The structure is then applied to the component, and for any nested components similarly .render() is called and then the defs applied recursively.
     *   * Finally, the process outputs a list of render callbacks to apply the related dom changes. Executing the changes can be delayed with the 2nd timeout: settings.renderTimeout.
     * - Note. Generally this helps to combine multiple updates together and thus prevent unnecessary updates.
     *   * This is useful if (due to complex app setup) you sometimes end up calling update multiple times for the same component.
     *     .. Without this, the update procedure would go through each time (and if rendering set to null, it as well).
     *     .. But with this, the updates get clumped together. For example, updating immediately after startup will not result in onUpdate, but only one onMount.
     * - Recommended usage for updateTimeout & renderTimeout:
     *   * For most cases, use updateTimeout: 0 and renderTimeout: 0 or null. Your main code line will run first, and rendering runs after (sync or async).
     *   * If you want synchronous updates on your components, use updateTimeout: null, renderTimeout: 0 - so updates are done before your main code line continues, but dom rendering is done after.
     *     .. In this case also consider putting useImmediateCalls to true.
     *   * If you want everything to be synchronous (including the dom), put both to null. */
    updateTimeout: number | null;
    /** If is null, then is synchronous. Otherwise uses the given timeout in ms. Defaults to 0ms.
     * - This timeout delays the actual dom rendering part of the component update process.
     * - It's useful to have a tiny delay to save from unnecessary rendering, when update gets called multiple times - even 0ms can help.
     * - Only use null renderTimeout (= synchronous rendering after updateTimeout) if you really want rendering to happen immediately after update.
     *     * Typically, you then also want the updateTimeout to be null (synchronous), so you get access to your dom elements synchronously.
     * - Note that renderTimeout happens after updateTimeout, so they both affect how fast rendering happens - see settings.updateTimeout for details. */
    renderTimeout: number | null;
    /** The lifecycle calls (onMount, onUpdate, ...) are collected (together with render infos) and called after the recursive update process has finished.
     * - This option controls whether the calls are made immediately after the update process or only after the (potentially delayed) rendering.
     * - Keep this as false, if you want the components to have their dom elements available upon onMount - like in React. (Defaults to false.)
     * - Put this to true, only if you really want the calls to be executed before the rendering happens.
     *     * If you combine this with updateTimeout: null, then you get synchronously updated state, with only rendering delayed.
     *     * However, you won't have dom elements on mount. To know when that happens should use refs or signals and .domDidMount and .domWillUnmount callbacks. */
    useImmediateCalls: boolean;
    /** Defines what components should look at when doing onShouldUpdate check for "props" and "state". */
    updateComponentModes: MixDOMUpdateCompareModesBy;
    /** Whether does a equalDOMProps check on the updating process.
     * - If true: Only adds render info (for updating dom props) if there's a need for it.
     * - If false: Always adds render info for updating dom elements. They will be diffed anyhow.
     * - If "if-needed": Then marks to be updated if had other rendering needs (move or content), if didn't then does equalDOMProps check. (So that if no need, don't mark render updates at all.)
     * Note that there is always a diffing check before applying dom changes, and the process only applies changes from last set.
     * .. In other words, this does not change at all what gets applied to the dom.
     * .. The only thing this changes, is whether includes an extra equalDOMProps -> boolean run during the update process.
     * .. In terms of assumed performance:
     * .... Even though equalDOMProps is an extra process, it's a bit faster to run than collecting diffs and in addition it can stop short - never add render info.
     * .... However, the only time it stops short is for not-equal, in which case it also means that we will anyway do the diff collection run later on.
     * .... In other words, it's in practice a matter of taste: if you want clean renderinfos (for debugging) use true. The default is "if-needed". */
    preCompareDOMProps: boolean | "if-needed";
    /** The maximum number of times a boundary is allowed to be render during an update due to update calls during the render func.
     * .. If negative, then there's no limit. If 0, then doesn't allow to re-render. The default is 1: allow to re-render once (so can render twice in a row).
     * .. If reaches the limit, stops re-rendering and logs a warning if devLogToConsole has .Warnings on. */
    maxReRenders: number;
    /** Which element (tag) to wrap texts (from props.children) into.
     * - By default, no wrapping is applied: treats texts as textNodes (instanceof Node).
     * - You can also pass in a callback to do custom rendering - should return a Node, or then falls back to textNode. */
    renderTextTag: MixDOMRenderTextTag;
    /** Tag to use for as a fallback when using the MixDOM.defHTML feature (that uses .innerHTML on a dummy element). Defaults to "span".
     * - It only has meaning, if the output contains multiple elements and didn't specifically define the container tag to use. */
    renderHTMLDefTag: DOMTags;
    /** If you want to process the simple content text, assign a callback here. */
    renderTextHandler: MixDOMRenderTextContentCallback | null;
    /** This defines how MixDOM will treat "simple content". The options are:
     *     1. When set to false (default), renders everything except null and undefined. (Other values are stringified.)
     *     2. When set to true, renders only values that doesn't amount to !!false. So skips: false and 0 as well.
     *     3. Third option is to give an array of values that should never be rendered.
     * Technical notes:
     *     - Regardless of the setting, MixDOM will always skip simple content of `null` and `undefined` (already at the static def creation level).
     *     - This setting applies as early as possible in the non-static side of process (in pairDefs routine).
     *     - How it works is that it will actually go and modify the target def by removing any unwanted child, before it would be paired.
     */
    noRenderValuesMode: boolean | any[];
    /** For svg content, the namespaceURI argument to be passed into createElementNS(namespaceURI, tag).
     * If none given, hard coded default is: "http://www.w3.org/2000/svg" */
    renderSVGNamespaceURI: string;
    /** When using MixDOM.Element to insert nodes, and swaps them, whether should apply (true), and if so whether should read first ("read").
     * Defaults to true, which means will apply based on scratch, but not read before it. */
    renderDOMPropsOnSwap: boolean | "read";
    /** This is useful for server side functionality. (Defaults to false, as most of the times you're using MixDOM on client side.)
     * - Put this to true, to disable the rendering aspects (will pause the dedicated HostRender instance). Instead use host.readAsString() or MixDOM.readAsString(treeNode) to get the html string.
     * - Note that you might want to consider putting settings.renderTimeout to null, so that the dom string is immediately renderable after the updates. */
    disableRendering: boolean;
    /** This is useful for nesting hosts.
     * - Put this to true to make nested but not currently grounded hosts be unmounted internally.
     * - When they are grounded again, they will mount and rebuild their internal structure from the rootBoundary up. */
    onlyRunInContainer: boolean;
    /** When pairing defs for reusing, any arrays are dealt as if their own key scope by default.
     * - By setting this to true, wide key pairing is allowed for arrays as well.
     * - Note that you can always use {...myArray} instead of {myArray} to avoid this behaviour (even wideKeysInArrays: false).
     *   .. In other words, if you do not want the keys in the array contents to mix widely, keep it as an array - don't spread it. */
    wideKeysInArrays: boolean;
    /** Default behaviour for handling duplicated instances of dom nodes.
     * - The duplication can happen due to manually inserting many, or due to multiple content passes, copies, or .getChildren().
     * - The detection is host based and simply based on whether the element to create was already grounded or not. */
    duplicateDOMNodeBehaviour: MixDOMCloneNodeBehaviour | "";
    /** Custom handler for the duplicateDOMNodeBehaviour. */
    duplicateDOMNodeHandler: ((domNode: Node, treeNode: MixDOMTreeNodeDOM) => Node | null) | null;
    /** Whether this host can be auto-duplicated when included dynamically multiple times. Defaults to false.
     * - Can also be a callback that returns a boolean (true to include, false to not), or a new host.
     * - Note that if uses a custom Host class, the new duplicate will be made from the normal Host class. Use the callback to provide manually.
     * - The treeNode in the arguments defines where would be inserted. */
    duplicatableHost: boolean | ((host: Host, treeNode: MixDOMTreeNodeHost) => Host | boolean | null);
    /** For weird behaviour. */
    devLogWarnings: boolean;
    /** Mostly for developing MixDOM.
     * - This log can be useful when testing how MixDOM behaves (in very small tests, not for huge apps) - eg. to optimize using keys.
     * - To get nice results, set preCompareDOMProps setting to `true`. */
    devLogRenderInfos: boolean;
}
/** This is the main class to orchestrate and start rendering. */
declare class Host<Contexts extends MixDOMContextsAll = {}> {
    static MIX_DOM_CLASS: string;
    static idCount: number;
    ["constructor"]: HostType<Contexts>;
    /** This represents abstractly what the final outcome looks like in dom. */
    groundedTree: MixDOMTreeNode;
    /** The root boundary that renders whatever is fed to the host on .update or initial creation. */
    rootBoundary: SourceBoundary;
    /** The general settings for this host instance.
     * - Do not modify directly, use the .modifySettings method instead.
     * - Otherwise rendering might have old settings, or setting.onlyRunInContainer might be uncaptured. */
    settings: HostSettings;
    /** Internal services to keep the whole thing together and synchronized.
     * They are the semi-private internal part of Host, so separated into its own class. */
    services: HostServices;
    /** This is used for duplicating hosts. It's the very same instance for all duplicated (and their source, which can be a duplicated one as well). */
    shadowAPI: HostShadowAPI<Contexts>;
    /** This provides the data and signal features for this Host and all the Components that are part of it.
     * - You can use .contextAPI directly for external usage.
     * - When using from within components, it's best to use their dedicated methods (for auto-disconnection features). */
    contextAPI: HostContextAPI<Contexts>;
    /** This contains all the components that have a contextAPI assigned. Automatically updated, used internally. The info can be used for custom purposes (just don't modify). */
    contextComponents: Set<ComponentWith>;
    constructor(content?: MixDOMRenderOutput, domContainer?: Node | null, settings?: HostSettingsUpdate | null, contexts?: Contexts | null, shadowAPI?: HostShadowAPI | null);
    /** Clear whatever has been previously rendered - destroys all boundaries inside the rootBoundary. */
    clearRoot(update?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): void;
    /** Move the host root into another dom container. */
    moveRoot(newParent: Node | null, renderTimeout?: number | null): void;
    /** Update the previously render content with new render output definitions. */
    updateRoot(content: MixDOMRenderOutput, updateTimeout?: number | null, renderTimeout?: number | null): void;
    /** Triggers an update on the host root, optionally forcing it. This is useful for refreshing the container. */
    refreshRoot(forceUpdate?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): void;
    /** Triggers a process that refreshes the dom nodes based on the current state.
     * - In case forceDOMRead is on will actually read from dom to look for real changes to be done.
     * - Otherwise just reapplies the situation - as if some updates had not been done.
     * - Note. This is a partly experimental feature - it's not assumed to be used in normal usage. */
    refreshDOM(forceDOMRead?: boolean, renderTimeout?: number | null): void;
    /** This triggers a refresh and returns a promise that is resolved when the update / render cycle is completed.
     * - If there's nothing pending, then will resolve immediately.
     * - Note that this uses the signals system, so the listener is called among other listeners depending on the adding order. */
    afterRefresh(renderSide?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): Promise<void>;
    /** This is like afterRefresh but works with a callback, given as the first arg. (This is the core method for the feature.)
     * - Triggers a refresh and calls the callback once the update / render cycle is completed.
     * - If there's nothing pending, then will call immediately.
     * - Note that this uses the signals system, so the listener is called among other listeners depending on the adding order. */
    afterRefreshCall(callback: () => void, renderSide?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): void;
    /** Trigger refreshing the host's pending updates and render changes. */
    triggerRefresh(updateTimeout?: number | null, renderTimeout?: number | null): void;
    /** Pause the rendering. Resume it by calling resume(), rehydrate() or rehydrateWith(). */
    pause(): void;
    /** Resume rendering - triggers rehydration. */
    resume(): void;
    /** Tells whether the rendering is currently paused or not. */
    isPaused(): boolean;
    /** This rehydrates the rendered defs with actual dom elements iterating down the groundedTree and the container (defaults to the host's container element).
     * - It supports reusing custom html elements from a custom "container" element as well. Note it should be the _containing_ element.
     * - In readAllMode will re-read the current dom props from the existing ones as well. Defaults to false.
     * - In smuggleMode will replace the existing elements with better ones from "from" - otherwise only tries to fill missing ones. Defaults to false.
     * - In destroyOthersMode will destroy the other unused elements found in the container. Defaults to false. Note. This can be a bit dangerous.
     * - This also resumes rendering if was paused - unless is disableRendering is set to true in host settings.
     */
    rehydrate(container?: Node | null, readAllMode?: boolean, smuggleMode?: boolean, destroyOthersMode?: boolean, validator?: MixDOMHydrationValidator, suggester?: MixDOMHydrationSuggester): void;
    /** This accepts new render content to update the groundedTree first and then rehydrates accordingly. See rehydrate method for details of the other arguments.
     * - Functions synchronously, so applies all updates and rendering immediately.
     * - Note that like rehydrate this also resumes paused state. (And works by: 1. pause, 2. update, 3. rehydrate.) */
    rehydrateWith(content: MixDOMRenderOutput, container?: Node | null, readAllMode?: boolean, smuggleMode?: boolean, destroyOthersMode?: boolean, validator?: MixDOMHydrationValidator, suggester?: MixDOMHydrationSuggester): void;
    /** Read the whole rendered contents as a html string. Typically used with settings.disableRendering (and settings.renderTimeout = null). */
    readAsString(): string;
    /** Get the root dom node (ours or by a nested boundary) - if has many, the first one (useful for insertion). */
    getRootElement(): Node | null;
    /** Get all the root dom nodes - might be many if used with a fragment.
     * - Optionally define whether to search in nested boundaries or not (by default does). */
    getRootElements(inNestedBoundaries?: boolean): Node[];
    /** Get the first dom element by a selectors within the host (like document.querySelector). Should rarely be used, but it's here if needed. */
    queryElement<T extends Element = Element>(selectors: string, overHosts?: boolean): T | null;
    /** Get dom elements by a selectors within the host (like document.querySelectorAll). Should rarely be used, but it's here if needed. */
    queryElements<T extends Element = Element>(selectors: string, maxCount?: number, overHosts?: boolean): T[];
    /** Find all dom nodes by an optional validator. */
    findElements<T extends Node = Node>(maxCount?: number, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): T[];
    /** Find all components by an optional validator. */
    findComponents<Comp extends ComponentTypeAny = ComponentTypeAny>(maxCount?: number, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): Comp[];
    /** Find all treeNodes by given types and an optional validator. */
    findTreeNodes(types: RecordableType<MixDOMTreeNodeType>, maxCount?: number, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): MixDOMTreeNode[];
    /** Modify previously given settings with partial settings.
     * - Note that if any value in the dictionary is `undefined` uses the default setting.
     * - Supports handling the related special cases:
     *      * `onlyRunInContainer`: Refreshes whether is visible or not (might destroy all / create all, if needed).
     */
    modifySettings(settings: HostSettingsUpdate, passToDuplicated?: boolean): void;
    static modifySettings(base: HostSettings, newSettings: HostSettingsUpdate, useDefaults?: boolean): void;
    static getDefaultSettings(): HostSettings;
}
/** Create a new host and start rendering into it. */
declare const newHost: <Contexts extends MixDOMContextsAll = {}>(content?: MixDOMRenderOutput, container?: HTMLElement | null, settings?: HostSettingsUpdate | null, contexts?: Contexts | undefined) => Host<Contexts>;

declare type ComponentSignals<Info extends Partial<ComponentInfo> = {}> = {
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
    shouldUpdate: (newUpdates: MixDOMComponentPreUpdates<Info["props"] & {}, Info["state"] & {}>, preUpdates: MixDOMComponentPreUpdates<Info["props"] & {}, Info["state"] & {}>) => boolean | null;
    /** This is a callback that will always be called when the component is checked for updates. Useful to get a snapshot of the situation.
     * - Note that this is not called on mount, but will be called everytime on update, even if will not actually update (use the 3rd param).
     * - Note that this will be called right after onShouldUpdate (if that is called) and right before the update happens.
     * - Note that by this time all the data has been updated already. So use preUpdates to get what it was before. */
    preUpdate: (newUpdates: MixDOMComponentPreUpdates<Info["props"] & {}, Info["state"] & {}>, preUpdates: MixDOMComponentPreUpdates<Info["props"] & {}, Info["state"] & {}>, willUpdate: boolean) => void;
    /** Called after the component has updated and changes been rendered into the dom. */
    didUpdate: (newUpdates: MixDOMComponentPreUpdates<Info["props"] & {}, Info["state"] & {}>, preUpdates: MixDOMComponentPreUpdates<Info["props"] & {}, Info["state"] & {}>) => void;
    /** Called when the component has moved in the tree structure. */
    didMove: () => void;
    /** Called when the component is about to be ungrounded: removed from the tree and dom elements destroyed. */
    willUnmount: () => void;
};
declare type ComponentExternalSignalsFor<Comp extends Component = Component, CompSignals extends Dictionary<(...args: any[]) => any | void> = ComponentSignals<Comp["constructor"]["_Info"] & {}> & (Comp["constructor"]["_Info"] & {} & {
    signals: {};
})["signals"]> = {
    [SignalName in keyof CompSignals]: (comp: Comp, ...params: Parameters<CompSignals[SignalName]>) => ReturnType<CompSignals[SignalName]>;
};
declare type ComponentExternalSignals<Comp extends Component = Component> = {
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
    shouldUpdate: (component: Comp, newUpdates: MixDOMComponentPreUpdates<(Comp["constructor"]["_Info"] & {
        props: {};
    })["props"], (Comp["constructor"]["_Info"] & {
        state: {};
    })["state"]>, preUpdates: MixDOMComponentPreUpdates<(Comp["constructor"]["_Info"] & {
        props: {};
    })["props"], (Comp["constructor"]["_Info"] & {
        state: {};
    })["state"]>) => boolean | null;
    /** This is a callback that will always be called when the component is checked for updates. Useful to get a snapshot of the situation.
     * - Note that this is not called on mount, but will be called everytime on update, even if will not actually update (use the 3rd param).
     * - Note that this will be called right after onShouldUpdate (if that is called) and right before the update happens.
     * - Note that by this time all the data has been updated already. So use preUpdates to get what it was before. */
    preUpdate: (component: Comp, newUpdates: MixDOMComponentPreUpdates<(Comp["constructor"]["_Info"] & {
        props: {};
    })["props"], (Comp["constructor"]["_Info"] & {
        state: {};
    })["state"]>, preUpdates: MixDOMComponentPreUpdates<(Comp["constructor"]["_Info"] & {
        props: {};
    })["props"], (Comp["constructor"]["_Info"] & {
        state: {};
    })["state"]>, willUpdate: boolean) => void;
    /** Called after the component has updated and changes been rendered into the dom. */
    didUpdate: (component: Comp, newUpdates: MixDOMComponentPreUpdates<(Comp["constructor"]["_Info"] & {
        props: {};
    })["props"], (Comp["constructor"]["_Info"] & {
        state: {};
    })["state"]>, preUpdates: MixDOMComponentPreUpdates<(Comp["constructor"]["_Info"] & {
        props: {};
    })["props"], (Comp["constructor"]["_Info"] & {
        state: {};
    })["state"]>) => void;
    /** Called when the component has moved in the tree structure. */
    didMove: (component: Comp) => void;
    /** Called when the component is about to be ungrounded: removed from the tree and dom elements destroyed. */
    willUnmount: (component: Comp) => void;
};
/** Typing infos for Components. */
interface ComponentInfo<Props extends Dictionary = {}, State extends Dictionary = {}, Class extends Dictionary = {}, Signals extends Dictionary<(...args: any[]) => any> = {}, Timers extends any = any, Contexts extends MixDOMContextsAll = {}> {
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
interface ComponentContextAPI<Contexts extends MixDOMContextsAll = {}> extends ContextAPI<Contexts> {
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
declare class ComponentContextAPI<Contexts extends MixDOMContextsAll = {}> extends ContextAPI<Contexts> {
    host: Host<Contexts>;
}
/** There are two ways you can use this:
 * 1. Call this to give basic Component features with advanced typing being empty.
 *      * For example: `class MyMix extends ComponentMixin(MyBase) {}`
 * 2. If you want to define Props, State, Signals, Timers and Contexts, use this simple trick instead:
 *      * For example: `class MyMix extends (ComponentMixin as ClassMixer<ComponentType<{ props: MyProps; timers: MyTimers; }>>)(MyBase) {}`
 * - Note that the Info["class"] only works for functional components. In class form, you simply extend the class or mixin with a custom class or mixin.
 */
declare const ComponentMixin: ClassMixer<ComponentType<{}>>;
declare const Component_base: {
    new (props: MixDOMPreComponentOnlyProps<{}>, boundary?: SourceBoundary | undefined, ...passArgs: any[]): {
        constructor: ComponentType<{}>;
        readonly boundary: SourceBoundary;
        readonly props: {};
        state: {};
        updateModes: Partial<MixDOMUpdateCompareModesBy>;
        constantProps?: Partial<Record<never, number | true | MixDOMUpdateCompareMode>> | undefined;
        timers?: Map<any, number | NodeJSTimeout> | undefined;
        readonly wired?: Set<ComponentWiredType<{}, {}, {}> | ComponentWiredFunc<{}, {}, {}>> | undefined;
        contextAPI?: ComponentContextAPI<{}> | undefined;
        /** This initializes the contextAPI instance (once). */
        initContextAPI(): void;
        isMounted(): boolean;
        getHost<Contexts extends MixDOMContextsAll = {}>(): Host<Contexts>;
        queryElement(selector: string, withinBoundaries?: boolean, overHosts?: boolean): Element | null;
        queryElements(selector: string, maxCount?: number, withinBoundaries?: boolean, overHosts?: boolean): Element[];
        findElements(maxCount?: number, withinBoundaries?: boolean, overHosts?: boolean, validator?: ((treeNode: MixDOMTreeNode) => any) | undefined): Node[];
        findComponents<Comp extends ComponentTypeAny<{}> = ComponentTypeAny<{}>>(maxCount?: number, withinBoundaries?: boolean, overHosts?: boolean, validator?: ((treeNode: MixDOMTreeNode) => any) | undefined): Comp[];
        findTreeNodes(types?: RecordableType<MixDOMTreeNodeType> | undefined, maxCount?: number, withinBoundaries?: boolean, overHosts?: boolean, validator?: ((treeNode: MixDOMTreeNode) => any) | undefined): MixDOMTreeNode[];
        newTimer(callback: () => void, timeout: number): {};
        setTimer(timerId: any, callback: () => void, timeout: number): void;
        hasTimer(timerId: any): boolean;
        clearTimer(timerId: any): void;
        clearTimers(onlyTimerIds?: any[] | undefined): void;
        setUpdateModes(modes: Partial<MixDOMUpdateCompareModesBy>, extend?: boolean): void;
        setConstantProps(constProps: never[] | Partial<Record<never, number | true | MixDOMUpdateCompareMode>> | null, extend?: boolean, overrideEach?: number | MixDOMUpdateCompareMode | null): void;
        setState(newState: {} | Pick<{}, never>, extend?: boolean, forceUpdate?: boolean | "all" | undefined, forceUpdateTimeout?: number | null | undefined, forceRenderTimeout?: number | null | undefined): void;
        setInState(property: never, value: any, forceUpdate?: boolean | "all" | undefined, forceUpdateTimeout?: number | null | undefined, forceRenderTimeout?: number | null | undefined): void;
        triggerUpdate(forceUpdate?: boolean | "all" | undefined, forceUpdateTimeout?: number | null | undefined, forceRenderTimeout?: number | null | undefined): void;
        createWired(...args: any[]): ComponentWiredType<{}, {}, {}> | ComponentWiredFunc<{}, {}, {}>;
        afterRefresh(renderSide?: boolean, forceUpdateTimeout?: number | null | undefined, forceRenderTimeout?: number | null | undefined): Promise<void>;
        render(_props: {}, _state: {}): MixDOMRenderOutput | MixDOMDoubleRenderer<{}, {}>;
    };
    MIX_DOM_CLASS: string;
};
/** Standalone Component class. */
declare class Component<Info extends Partial<ComponentInfo> = {}, Props extends Dictionary = NonNullable<Info["props"]>, State extends Dictionary = NonNullable<Info["state"]>> extends Component_base {
    ["constructor"]: ComponentType<Info>;
    constructor(props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Props, boundary?: SourceBoundary, ...passArgs: any[]);
}
interface Component<Info extends Partial<ComponentInfo> = {}, Props extends Dictionary = NonNullable<Info["props"]>, State extends Dictionary = NonNullable<Info["state"]>> extends SignalMan<ComponentSignals<Info> & Info["signals"]> {
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
    /** Ref to the dedicated SourceBoundary - it's technical side of a Component. */
    readonly boundary: SourceBoundary;
    /** Any wired component classes created by us. */
    readonly wired?: Set<ComponentWiredType | ComponentWiredFunc>;
    /** The constructor is typed as ComponentType. */
    ["constructor"]: ComponentType<Info>;
    /** This returns a promise that is resolved after the host's refresh cycle has finished.
     * - By default delays until the "update" cycle (renderSide = false). If renderSide is true, then is resolved after the "render" cycle (after updates). */
    afterRefresh(renderSide?: boolean, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): Promise<void>;
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
    /** Modify the updateModes member that defines how should compare { props, data, children, streams } during the update process. */
    setUpdateModes(modes: Partial<MixDOMUpdateCompareModesBy>, extend?: boolean): void;
    /** Modify the constantProps member that defines which props must not change (and how) without a remount. If you set the mode to `true` it means "changed" (= 0 depth).
     * You can also override the mode for each if you just want to use the keys of another dictionary.
     * By default extends the given constant props, if you want to reset put extend to `false`. If you want to clear, leave the constProps empty (null | [] | {}) as well. */
    setConstantProps(constProps: Partial<Record<keyof Props, MixDOMUpdateCompareMode | number | true>> | (keyof Props)[] | null, extend?: boolean, overrideEach?: MixDOMUpdateCompareMode | number | null): void;
    /** Trigger an update manually. Normally you never need to use this. Can optionally define update related timing */
    triggerUpdate(forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Set the whole state (or partial with extend set to true). Can optionally define update related timing. */
    setState<Key extends keyof State>(newState: Pick<State, Key> | State, extend?: boolean | true, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    setState(newState: State, extend?: false, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Set one property in the state with typing support. Can optionally define update related timing. */
    setInState<Key extends keyof State>(property: Key, value: State[Key], forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
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
    createWired<ParentProps extends Dictionary = {}, BuildProps extends Dictionary = {}, MixedProps extends Dictionary = ParentProps & BuildProps, Builder extends (lastProps: BuildProps | null) => BuildProps = (lastProps: BuildProps | null) => BuildProps, Mixer extends (parentProps: ParentProps, addedProps: [Builder] extends [() => any] ? BuildProps : null, wired: Component<{
        props: ParentProps;
        state: MixedProps;
    }>) => MixedProps = (parentProps: ParentProps, addedProps: [Builder] extends [() => any] ? BuildProps : null, wired: Component<{
        props: ParentProps;
        state: MixedProps;
    }>) => MixedProps>(mixer: Mixer | BuildProps | null, renderer: ComponentTypeAny<{
        props: MixedProps;
    }>, name?: string): ComponentWiredFunc<ParentProps, BuildProps, MixedProps>;
    createWired<ParentProps extends Dictionary = {}, BuildProps extends Dictionary = {}, MixedProps extends Dictionary = ParentProps & BuildProps, Builder extends (lastProps: BuildProps | null) => BuildProps = (lastProps: BuildProps | null) => BuildProps, Mixer extends (parentProps: ParentProps, addedProps: [Builder] extends [() => any] ? BuildProps : null, wired: Component<{
        props: ParentProps;
        state: MixedProps;
    }>) => MixedProps = (parentProps: ParentProps, addedProps: [Builder] extends [() => any] ? BuildProps : null, wired: Component<{
        props: ParentProps;
        state: MixedProps;
    }>) => MixedProps>(builder: Builder | BuildProps | null, mixer: Mixer | null, renderer: ComponentTypeAny<{
        props: MixedProps;
    }>, name?: string): ComponentWiredFunc<ParentProps, BuildProps, MixedProps>;
    /** The most important function of any component: the render function. If not using functional rendering, override this manually on the class.
     */
    render(props: Props, state: State): MixDOMRenderOutput | MixDOMDoubleRenderer & MixDOMDoubleRenderer<Props, State>;
}
/** This declares a Component class but allows to input the Infos one by one: <Props, State, Class, Signals, Timers, Contexts> */
interface ComponentOf<Props extends Dictionary = {}, State extends Dictionary = {}, Class extends Dictionary = {}, Signals extends Dictionary<(...args: any[]) => any> = {}, Timers extends any = any, Contexts extends MixDOMContextsAll = {}> extends Component<ComponentInfo<Props, State, Class, Signals, Timers, Contexts>> {
}
/** Type for Component with ContextAPI. Also includes the signals that ContextAPI brings. */
interface ComponentWith<Info extends Partial<ComponentInfo> = {}> extends Component<Info> {
    contextAPI: ComponentContextAPI<Info["contexts"] & {}>;
}
interface ComponentType<Info extends Partial<ComponentInfo> = {}> {
    /** Class type. */
    MIX_DOM_CLASS: string;
    /** May feature a ComponentShadowAPI, it's put here to make typing easier. */
    api?: ComponentShadowAPI<Info>;
    new (props: Info["props"] & {}, boundary?: SourceBoundary): Component<Info>;
    _Info?: Info;
}
interface ComponentTypeOf<Props extends Dictionary = {}, State extends Dictionary = {}, Class extends Dictionary = {}, Signals extends Dictionary<(...args: any[]) => any> = {}, Timers extends any = any, Contexts extends MixDOMContextsAll = {}> extends ComponentType<ComponentInfo<Props, State, Class, Signals, Timers, Contexts>> {
}
/** This includes the _Info: { class } into the typing as if extending the class. */
declare type ComponentTypeWithClass<Info extends Partial<ComponentInfo> = {}> = [Info["class"]] extends [{}] ? Omit<ComponentType<Info>, "new"> & {
    new (props: Info["props"] & {}, boundary?: SourceBoundary): Component<Info> & Info["class"];
} : ComponentType<Info>;
declare type ComponentWithClass<Info extends Partial<ComponentInfo> = {}> = Component<Info> & Info["class"];
/** Either a class or a component func (not a spread func). */
declare type ComponentTypeEither<Info extends Partial<ComponentInfo> = {}> = ComponentType<Info> | ComponentFunc<Info>;
/** This is a shortcut for all valid MixDOM components: class, component func or a spread func.
 * - Hint. You can use this in props: `{ ItemRenderer: ComponentTypeAny<Info>; }` and then just insert it by `<props.ItemRenderer {...itemInfo} />` */
declare type ComponentTypeAny<Info extends Partial<ComponentInfo> = {}> = ComponentType<Info> | ComponentFunc<Info> | SpreadFunc<Info["props"] & {}>;
declare type ComponentInstanceType<CompType extends ComponentType | ComponentFunc, Fallback = Component> = [CompType] extends [ComponentFunc] ? Component<GetComponentFuncInfo<CompType>> : [CompType] extends [ComponentType] ? InstanceType<CompType> : Fallback;
declare type GetComponentInfo<Type extends ComponentTypeAny | Component> = ([Type] extends [(...args: any[]) => any | void] ? GetComponentFuncInfo<Type> : [(...args: any[]) => any | void] extends [Type] ? GetComponentFuncInfo<(() => any) & Type> : [Type] extends [Component] ? Type["constructor"]["_Info"] & {} : [Type] extends [ComponentType] ? Type["_Info"] & {} : (Type & {
    _Info: Partial<ComponentInfo>;
})["_Info"] & {});
declare type GetComponentFuncInfo<Type extends (...args: any[]) => any | void> = [Type] extends [{
    _Info?: Partial<ComponentInfo> | undefined;
}] ? Type["_Info"] & {} : [undefined] extends [Parameters<Type>[1]] ? {
    props: Parameters<Type>[0];
} : (Parameters<Type>[1] & {
    _Info: {};
})["_Info"];
declare type ExtendComponentInfoWith<Info extends Partial<ComponentInfo>, Comp extends ComponentTypeAny> = Info & ([Comp] extends [ComponentFunc] ? GetComponentFuncInfo<Comp> : [Comp] extends [SpreadFunc] ? {
    props: Parameters<Comp>[0];
} : GetComponentInfo<Comp>);
/** This declares a ComponentFunc by <Info>. */
declare type ComponentFunc<Info extends Partial<ComponentInfo> = {}> = ((initProps: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: Component<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>) & {
    _Info?: Info;
};
/** This declares a ComponentFunc that will have a ContextAPI instance. */
declare type ComponentFuncWith<Info extends Partial<ComponentInfo> = {}> = ((initProps: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentWith<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>) & {
    _Info?: Info;
};
/** This declares a ComponentFunc but allows to input the Infos one by one: <Props, State, Class, Signals, Timers, Contexts> */
declare type ComponentFuncOf<Props extends Dictionary = {}, State extends Dictionary = {}, Class extends Dictionary = {}, Signals extends Dictionary<(...args: any[]) => any> = {}, Timers extends any = any, Contexts extends MixDOMContextsAll = {}> = (initProps: MixDOMPreComponentOnlyProps<Signals> & Props, component: Component<ComponentInfo<Props, State, Class, Signals, Timers, Contexts>> & Class, contextAPI: ComponentContextAPI<Contexts>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Props, State>;
/** Either type of functional component: spread or a full component (with optional contextAPI). */
declare type ComponentFuncAny<Info extends Partial<ComponentInfo> = {}> = ComponentFunc<Info> | SpreadFunc<Info["props"] & {}>;
declare type ComponentFuncWithCtxShortcut<Info extends Partial<ComponentInfo> = {}> = (component: ComponentWith<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>;
/** Create a component by func. You get the component as the first parameter (component), while initProps are omitted. */
declare function createComponent<Info extends Partial<ComponentInfo> = {}>(func: (component: Component<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>, name?: string): ComponentFunc<Info>;
/** Create a component with ContextAPI by func and omitting the first initProps: (component, contextAPI). The contextAPI is instanced regardless of argument count and component typing includes component.contextAPI. */
declare const createComponentWith: <Info extends Partial<ComponentInfo<{}, {}, {}, {}, any, {}>> = {}>(func: ComponentFuncWithCtxShortcut<Info>, name?: string) => ComponentFuncWith<Info>;

declare class BaseBoundary {
    /** The def that defined this boundary to be included. This also means it contains our last applied props. */
    _outerDef: MixDOMDefApplied;
    /** The _innerDef is the root def for what the boundary renders inside - or passes inside for content boundaries.
     * - Note that the _innerDef is only null when the boundary renders null. For content boundaries it's never (they'll be destroyed instead). */
    _innerDef: MixDOMDefApplied | null;
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
    constructor(host: Host, outerDef: MixDOMDefApplied, treeNode: MixDOMTreeNode);
}
declare class ContentBoundary extends BaseBoundary {
    /** The def whose children define our content - we are a fragment-like container. */
    targetDef: MixDOMDefTarget;
    /** Redefine that we always have it. It's based on the targetDef. */
    _innerDef: MixDOMDefApplied;
    /** Redefine that we always have a host for content boundaries - for us, it's the original source of our rendering.
     * Note that the content might get passed through many boundaries, but now we have landed it. */
    sourceBoundary: SourceBoundary;
    /** Redefine that we always have a boundary that grounded us to the tree - we are alive because of it.
     * - Note that it gets assigned (externally) immediately after constructor is called.
     * - The parentBoundary ref is very useful for going quickly up the boundary tree - the opposite of .innerBoundaries. */
    parentBoundary: SourceBoundary | ContentBoundary;
    /** Content boundaries will never feature component. So can be used for checks to know if is a source or content boundary. */
    component?: never;
    /** Content boundaries will never feature bId. So can be used for checks to know if is a source or content boundary. */
    bId?: never;
    constructor(outerDef: MixDOMDefApplied, targetDef: MixDOMDefTarget, treeNode: MixDOMTreeNode, sourceBoundary: SourceBoundary);
    /** Apply a targetDef from the new envelope. Simply sets the defs accordingly. */
    updateEnvelope(targetDef: MixDOMDefTarget, truePassDef?: MixDOMDefApplied | null): void;
}
/** This is what "contains" a component.
 * .. It's the common interface for technical as well as advanced API interfacing. */
declare class SourceBoundary extends BaseBoundary {
    /** Redefine that the outer def is about a boundary. */
    _outerDef: MixDOMDefApplied & MixDOMDefBoundary;
    /** Temporary rendering state indicator. */
    _renderState?: "active" | "re-updated";
    /** Temporary collection of preUpdates - as the update data are always executed immediately. */
    _preUpdates?: MixDOMComponentPreUpdates;
    /** Our host based quick id. It's mainly used for sorting, and sometimes to detect whether is content or source boundary, helps in debugging too. */
    bId: MixDOMSourceBoundaryId;
    /** Shortcut for the component. Only one can be set (and typically one is). */
    component: Component;
    /** The content closure tied to this boundary.
     * - It it's the channel through which our parent passes content to us - regardless of the update flow.
     * - When tied to a boundary, the content closure has a reference to it as .thruBoundary. (It can also be used without .thruBoundary, see ComponentStream.) */
    closure: ContentClosure;
    constructor(host: Host, outerDef: MixDOMDefApplied & MixDOMDefBoundary, treeNode: MixDOMTreeNode, sourceBoundary?: SourceBoundary);
    /** Should actually only be called once. Initializes a Component class and assigns renderer and so on. */
    reattach(): void;
    update(forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    updateBy(updates: MixDOMComponentPreUpdates, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    render(iRecursion?: number): MixDOMRenderOutput;
}

/** Props for the Stream component generally. Includes intrinsic signals. */
interface ComponentStreamProps extends MixDOMPreComponentOnlyProps {
    /** Define the relative importance of this Stream instance amongst others of the same Stream class.
     * - The higher the number, the more important the stream.
     * - Note that if you want to disable the stream source totally (as if it weren't there), you can use the general _disable prop. */
    importance?: number;
}
/** Instanced streaming source. */
interface ComponentStream extends Component<{
    props: ComponentStreamProps;
}> {
    /** The constructor is typed as ComponentStreamType. */
    ["constructor"]: ComponentType & ComponentStreamType;
    /** Used internally. Whether can refresh the source or not. If it's not attached, cannot. */
    canRefresh(): boolean;
    /** Used internally in relation to the content passing updating process. */
    preRefresh(newEnvelope: MixDOMContentEnvelope | null): Set<SourceBoundary> | null;
    /** Used internally in relation to the content passing updating process. */
    applyRefresh(forceUpdate?: boolean): MixDOMChangeInfos;
    /** To refresh sub mixing - mainly the importance prop. */
    refreshSource(forceRenderTimeout?: number | null): void;
    /** Returns info for removal and additions. */
    reattachSource(fully?: boolean): MixDOMChangeInfos | null;
}
/** Static class side for stream output. */
interface ComponentStreamType extends ComponentType<{
    props: ComponentStreamProps;
}> {
    readonly MIX_DOM_CLASS: string;
    new (props: ComponentStreamProps, boundary?: SourceBoundary): ComponentStream;
    Content: MixDOMDefTarget | null;
    ContentCopy: MixDOMDefTarget | null;
    copyContent: (key?: any) => MixDOMDefTarget | null;
    /** A custom component (func) that can be used for stream conditional inserting.
     * - For example: `<MyStream.WithContent><div class="popup-container">{MyStream.Content}</div></MyStream.WithContent>`
     *      * Results in `<div class="popup-container">...</div>`, where ... is the actual content passed (by stream source).
     *      * However, if there was no actual content to pass, then results in `null`.
     * - This is very typically used for adding some wired elements to a popup stream, like in the above example.
     */
    WithContent: ComponentType<{
        props: {
            hasContent?: boolean;
        };
    }> & {
        /** Should contain the content pass object. For parental passing it's the MixDOM.Content object. For streams their Content pass object with its getStream() method. */
        _WithContent: MixDOMDefTarget;
    };
    isStream(): boolean;
    closure: ContentClosure;
    source: ComponentStream | null;
    sources: Set<ComponentStream>;
    addSource(stream: ComponentStream): void;
    removeSource(stream: ComponentStream, withSourceRefresh?: boolean): MixDOMChangeInfos | null;
    reattachSourceBy(stream: ComponentStream, fully?: boolean): MixDOMChangeInfos | null;
    refreshStream(forceRenderTimeout?: number | null): void;
    getBestStream(): ComponentStream | null;
}
/** Create a component for streaming. */
declare const createStream: () => ComponentStreamType;

interface MixDOMPrePseudoProps {
    /** Disable the def altogether - including all contents inside. (Technically makes the def amount to null.) */
    _disable?: boolean;
    /** Attach key for moving the def around. */
    _key?: any;
}
interface PseudoFragmentProps extends MixDOMPrePseudoProps {
}
/** Fragment represent a list of render output instead of stuff under one root.
 * Usage example: `<MixDOM.Fragment><div/><div/></MixDOM.Fragment>` */
declare class PseudoFragment<Props extends PseudoFragmentProps = PseudoFragmentProps> {
    static MIX_DOM_CLASS: string;
    readonly props: Props;
    constructor(_props: Props);
}
interface PseudoPortalProps extends MixDOMPrePseudoProps {
    container: Node | null;
}
/** Portal allows to insert the content into a foreign dom node.
 * Usage example: `<MixDOM.Portal container={myDOMElement}><div/></MixDOM.Portal>` */
declare class PseudoPortal<Props extends PseudoPortalProps = PseudoPortalProps> {
    static MIX_DOM_CLASS: string;
    readonly props: Props;
    constructor(_props: Props);
}
declare type PseudoElementProps<Tag extends DOMTags = DOMTags> = MixDOMPreDOMTagProps<Tag> & {
    element: HTMLElement | SVGElement | null;
    /** Determines what happens when meeting duplicates.
     * - If == null, uses the Host based setting.
     * - If boolean, then is either "deep" or nothing. */
    cloneMode?: boolean | MixDOMCloneNodeBehaviour | null;
};
/** This allows to use an existing dom element as if it was part of the system.
 * So you can modify its props and such. */
declare class PseudoElement<Tag extends DOMTags = DOMTags, Props extends PseudoElementProps<Tag> = PseudoElementProps<Tag>> {
    static MIX_DOM_CLASS: string;
    readonly props: Props;
    constructor(_props: Props);
}
/** Empty dummy component that accepts any props, but always renders null. */
interface PseudoEmptyProps extends Record<string, any> {
}
declare class PseudoEmpty<Props extends PseudoEmptyProps = PseudoEmptyProps> {
    static MIX_DOM_CLASS: string;
    readonly props: Props;
    constructor(_props: Props);
    render(): MixDOMRenderOutput;
}
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
declare const PseudoEmptyStream: ComponentStreamType;

declare type RefDOMSignals<Type extends Node = Node> = {
    /** Called when a ref is about to be attached to a dom element. */
    domDidAttach: (domNode: Type) => void;
    /** Called when a ref is about to be detached from a dom element. */
    domWillDetach: (domNode: Type) => void;
    /** Called when a reffed dom element has been mounted: rendered into the dom for the first time. */
    domDidMount: (domNode: Type) => void;
    /** Called when a reffed dom element updates (not on the mount run). */
    domDidUpdate: (domNode: Type, diffs: MixDOMDOMDiffs) => void;
    /** Called when the html content of a dom element has changed. */
    domDidContent: (domNode: Type, simpleContent: MixDOMContentSimple | null) => void;
    /** Called when a reffed dom element has been moved in the tree. */
    domDidMove: (domNode: Type, fromContainer: Node | null, fromNextSibling: Node | null) => void;
    /** Return true to salvage the element: won't be removed from dom.
     * This is only useful for fade out animations, when the parenting elements also stay in the dom (and respective children). */
    domWillUnmount: (domNode: Type) => boolean | void;
};
declare type RefComponentSignals<Type extends ComponentTypeEither = ComponentTypeEither, Instance extends ComponentInstanceType<Type> = ComponentInstanceType<Type>> = {
    /** Called when a ref is about to be attached to a component. */
    didAttach: (component: Type) => void;
    /** Called when a ref is about to be detached from a component. */
    willDetach: (component: Type | ContentBoundary) => void;
} & ([Instance] extends [Component] ? ComponentExternalSignalsFor<Instance> : {});
declare type RefSignals<Type extends Node | ComponentTypeEither = Node | ComponentTypeEither> = [Type] extends [Node] ? RefDOMSignals<Type> : [Type] extends [ComponentTypeEither] ? RefComponentSignals<Type> : RefDOMSignals<Type & Node> & RefComponentSignals<Type & ComponentTypeEither>;
interface RefBase {
    signals: Record<string, SignalListener[]>;
    treeNodes: Set<MixDOMTreeNode>;
    onListener(name: string, index: number, wasAdded: boolean): void;
    getTreeNode(): MixDOMTreeNode | null;
    getTreeNodes(): MixDOMTreeNode[];
    getElement(onlyForDOMRefs?: boolean): Node | null;
    getElements(onlyForDOMRefs?: boolean): Node[];
    getComponent(): Component | null;
    getComponents(): Component[];
}
declare class Ref<Type extends Node | ComponentTypeEither = Node | ComponentTypeEither> extends SignalBoy<RefSignals<Type>> {
    static MIX_DOM_CLASS: string;
    /** The collection (for clarity) of tree nodes where is attached to.
     * It's not needed internally but might be useful for custom needs. */
    treeNodes: Set<MixDOMTreeNode>;
    constructor(...args: any[]);
    /** The onListener callback is required by Ref's functionality for connecting signals to components fluently. */
    onListener(name: string, index: number, wasAdded: boolean): void;
    /** This returns the last reffed treeNode, or null if none.
     * - The MixDOMTreeNode is a descriptive object attached to a location in the grounded tree. Any tree node can be targeted by refs.
     * - The method works as if the behaviour was to always override with the last one.
     * - Except that if the last one is removed, falls back to earlier existing. */
    getTreeNode(): MixDOMTreeNode | null;
    /** This returns all the currently reffed tree nodes (in the order added). */
    getTreeNodes(): MixDOMTreeNode[];
    /** This returns the last reffed domNode, or null if none.
     * - The method works as if the behaviour was to always override with the last one.
     * - Except that if the last one is removed, falls back to earlier existing. */
    getElement(onlyForDOMRefs?: boolean): [Type] extends [Node] ? Type | null : Node | null;
    /** This returns all the currently reffed dom nodes (in the order added). */
    getElements(onlyForDOMRefs?: boolean): [Type] extends [Node] ? Type[] : Node[];
    /** This returns the last reffed component, or null if none.
     * - The method works as if the behaviour was to always override with the last one.
     * - Except that if the last one is removed, falls back to earlier existing. */
    getComponent(): [Type] extends [Node] ? Component | null : [Type] extends [ComponentTypeEither] ? ComponentInstanceType<Type> : Component | null;
    /** This returns all the currently reffed components (in the order added). */
    getComponents(): [Type] extends [Node] ? Component[] : [Type] extends [ComponentTypeEither] ? ComponentInstanceType<ComponentTypeEither & Type>[] : Component[];
    static didAttachOn(ref: RefBase, treeNode: MixDOMTreeNode): void;
    static willDetachFrom(ref: RefBase, treeNode: MixDOMTreeNode): void;
}
/** Create a new ref instance shortcut. */
declare const newRef: <Type extends Node | ComponentTypeEither<{}> = Node | ComponentTypeEither<{}>>() => Ref<Type>;

declare type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
declare type Intersect<T> = (T extends any ? ((x: T) => 0) : never) extends ((x: infer R) => 0) ? R : never;
declare type RecordableType<K extends string> = Partial<Record<K, any>> | Array<K> | Set<K>;
declare type Dictionary<V = any> = Record<string, V>;
declare type CleanDictionary<T> = {
    [Key in keyof T]: T[Key];
};
declare type CleanDictionaryWith<T, V = {}> = {
    [Key in keyof T]: [T[Key]] extends [V] ? T[Key] : never;
};
declare type ClassType<T = {}, Args extends any[] = any[]> = new (...args: Args) => T;
declare type ClassMixer<TExtends extends ClassType> = <TBase extends ClassType>(Base: TBase) => Omit<TBase & TExtends, "new"> & {
    new (...args: GetConstructorArgs<TExtends>): GetConstructorReturn<TBase> & GetConstructorReturn<TExtends>;
};
declare type GetConstructorArgs<T> = T extends new (...args: infer U) => any ? U : never;
/** This senseless types makes the mixin typing work. */
declare type GetConstructorReturn<T> = T extends new (...args: any[]) => infer U ? U : never;
/** Helper to collect up to 10 return types from an array of functions. */
declare type ReturnTypes<T extends any[] | readonly any[]> = T[0] extends undefined ? [] : T[1] extends undefined ? [ReturnType<T[0]>] : T[2] extends undefined ? [ReturnType<T[0]>, ReturnType<T[1]>] : T[3] extends undefined ? [ReturnType<T[0]>, ReturnType<T[1]>, ReturnType<T[2]>] : T[4] extends undefined ? [ReturnType<T[0]>, ReturnType<T[1]>, ReturnType<T[2]>, ReturnType<T[3]>] : T[5] extends undefined ? [ReturnType<T[0]>, ReturnType<T[1]>, ReturnType<T[2]>, ReturnType<T[3]>, ReturnType<T[4]>] : T[6] extends undefined ? [ReturnType<T[0]>, ReturnType<T[1]>, ReturnType<T[2]>, ReturnType<T[3]>, ReturnType<T[4]>, ReturnType<T[5]>] : T[7] extends undefined ? [ReturnType<T[0]>, ReturnType<T[1]>, ReturnType<T[2]>, ReturnType<T[3]>, ReturnType<T[4]>, ReturnType<T[5]>, ReturnType<T[6]>] : T[8] extends undefined ? [ReturnType<T[0]>, ReturnType<T[1]>, ReturnType<T[2]>, ReturnType<T[3]>, ReturnType<T[4]>, ReturnType<T[5]>, ReturnType<T[6]>, ReturnType<T[7]>] : T[9] extends undefined ? [ReturnType<T[0]>, ReturnType<T[1]>, ReturnType<T[2]>, ReturnType<T[3]>, ReturnType<T[4]>, ReturnType<T[5]>, ReturnType<T[6]>, ReturnType<T[7]>, ReturnType<T[8]>] : [
    ReturnType<T[0]>,
    ReturnType<T[1]>,
    ReturnType<T[2]>,
    ReturnType<T[3]>,
    ReturnType<T[4]>,
    ReturnType<T[5]>,
    ReturnType<T[6]>,
    ReturnType<T[7]>,
    ReturnType<T[8]>,
    ReturnType<T[9]>
];
interface CSSProperties extends Partial<Omit<CSSStyleDeclaration, "item" | "getPropertyPriority" | "getPropertyValue" | "removeProperty" | "setProperty" | CSSNumericKeys> & Record<CSSNumericKeys, string | number>> {
    [index: number]: never;
}
/** Some commonly used CSS properties that can receive numeric input. */
declare type CSSNumericKeys = "borderWidth" | "borderBottomWidth" | "borderLeftWidth" | "borderRightWidth" | "borderTopWidth" | "bottom" | "columnGap" | "flexGrow" | "flexShrink" | "fontWeight" | "gap" | "gridColumnEnd" | "gridColumnGap" | "gridColumnStart" | "gridRowEnd" | "gridRowGap" | "gridRowStart" | "height" | "inset" | "left" | "margin" | "marginBottom" | "marginLeft" | "marginRight" | "marginTop" | "maxWidth" | "maxHeight" | "minWidth" | "minHeight" | "offsetDistance" | "opacity" | "order" | "outlineWidth" | "padding" | "paddingTop" | "paddingBottom" | "paddingLeft" | "paddingRight" | "right" | "rowGap" | "scrollMargin" | "scrollMarginBlock" | "scrollMarginBlockEnd" | "scrollMarginBlockStart" | "scrollMarginBottom" | "scrollMarginInline" | "scrollMarginInlineEnd" | "scrollMarginInlineStart" | "scrollMarginLeft" | "scrollMarginRight" | "scrollMarginTop" | "scrollPadding" | "scrollPaddingBlock" | "scrollPaddingBlockEnd" | "scrollPaddingBlockStart" | "scrollPaddingBottom" | "scrollPaddingInline" | "scrollPaddingInlineEnd" | "scrollPaddingInlineStart" | "scrollPaddingLeft" | "scrollPaddingRight" | "scrollPaddingTop" | "stopOpacity" | "strokeWidth" | "strokeOpacity" | "tabIndex" | "tabSize" | "top" | "width" | "zIndex";
declare type HTMLTags = keyof HTMLElementTagNameMap;
declare type HTMLElementType<Tag extends HTMLTags = HTMLTags> = HTMLElementTagNameMap[Tag];
declare type SVGTags = keyof SVGElementTagNameMap;
declare type SVGElementType<Tag extends SVGTags = SVGTags> = SVGElementTagNameMap[Tag];
declare type DOMTags = HTMLTags | SVGTags;
declare type DOMElement = HTMLElement | SVGElement;
declare type ListenerAttributeNames = keyof ListenerAttributesAll;
declare type ListenerAttributes = {
    [Name in keyof ListenerAttributesAll]?: ListenerAttributesAll[Name] | null;
};
declare type HTMLAttributes<Tag extends HTMLTags = HTMLTags> = Partial<Omit<HTMLElementType<Tag>, "style" | "class" | "className" | "textContent" | "innerHTML" | "outerHTML" | "outerText" | "innerText">> & Partial<ListenerAttributesAll>;
declare type SVGAttributes<Tag extends SVGTags = SVGTags> = Omit<SVGAttributesBy[Tag], "style" | "class" | "className"> & Partial<ListenerAttributesAll>;
declare type HTMLSVGAttributes<Tag extends DOMTags = DOMTags, Other = never> = [Tag] extends [HTMLTags] ? HTMLAttributes<Tag> : [Tag] extends [SVGTags] ? SVGAttributes<Tag> : Other;
declare type HTMLSVGAttributesBy = {
    [Tag in DOMTags]: HTMLSVGAttributes<Tag>;
};
interface ListenerAttributesAll {
    onAbort: GlobalEventHandlers["onabort"];
    onActivate: SVGGraphicalEventAttributes["onActivate"];
    onAnimationCancel: GlobalEventHandlers["onanimationcancel"];
    onAnimationEnd: GlobalEventHandlers["onanimationend"];
    onAnimationIteration: GlobalEventHandlers["onanimationiteration"];
    onAnimationStart: GlobalEventHandlers["onanimationstart"];
    onAuxClick: GlobalEventHandlers["onauxclick"];
    onBlur: GlobalEventHandlers["onblur"];
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
    onKeyPress: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null;
    onKeyUp: GlobalEventHandlers["onkeyup"];
    onLoad: GlobalEventHandlers["onload"];
    onLoadedData: GlobalEventHandlers["onloadeddata"];
    onLoadedMetaData: GlobalEventHandlers["onloadedmetadata"];
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
interface NodeJSTimeout {
    ref(): this;
    unref(): this;
    hasRef(): boolean;
    refresh(): this;
    [Symbol.toPrimitive](): number;
}
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
declare type MixDOMPreClassName<Valid extends string = string, Single extends string = Valid> = Single | Partial<Record<Valid, any>> | Array<Valid> | Set<Valid>;
declare type MixDOMDoubleRenderer<Props extends Dictionary = {}, State extends Dictionary = {}> = (props: Props, state: State) => MixDOMRenderOutput | MixDOMDoubleRenderer<Props, State>;
declare type MixDOMBoundary = SourceBoundary | ContentBoundary;
declare type MixDOMSourceBoundaryId = string;
declare type MixDOMPseudoTag<Props extends Dictionary = {}> = ([Props] extends [PseudoFragmentProps] ? typeof PseudoFragment<Props> : never) | ([Props] extends [PseudoElementProps] ? typeof PseudoElement<HTMLTags | SVGTags, Props> : never) | ([Props] extends [PseudoPortalProps] ? typeof PseudoPortal<Props> : never) | ([Props] extends [PseudoEmptyProps] ? typeof PseudoEmpty<Props> : never);
declare type MixDOMComponentTag<Props extends Dictionary = {}> = ComponentTypeAny<Props> | MixDOMPseudoTag<Props>;
declare type MixDOMPreTag = DOMTags | MixDOMPseudoTag | MixDOMComponentTag;
declare type MixDOMPostTag = "" | "_" | DOMTags | MixDOMComponentTag | null;
/** This tag conversion is used for internal tag based def mapping. The MixDOMDefTarget is the MixDOM.ContentPass.
 * The number type refers to _Apply.SEARCH_TAG_BY_TYPE values. */
declare type MixDOMDefKeyTag = MixDOMPostTag | MixDOMDefTarget | typeof PseudoFragment | Host | number;
declare type MixDOMHydrationItem = {
    tag: DOMTags;
    node: Element | SVGElement | Node;
    parent: MixDOMHydrationItem | null;
    children?: MixDOMHydrationItem[];
    key?: any;
    used?: boolean;
};
/** Should return true like value to accept, false like to not accept. */
declare type MixDOMHydrationValidator = (item: MixDOMHydrationItem | null, treeNode: MixDOMTreeNodeDOM, tag: DOMTags | "_" | "", key: any) => any;
/** Should return a Node or MixDOMHydrationItem to suggest, or null otherwise. */
declare type MixDOMHydrationSuggester = (item: MixDOMHydrationItem | null, treeNode: MixDOMTreeNodeDOM, tag: DOMTags | "_" | "", key: any) => Node | MixDOMHydrationItem | null;
interface MixDOMPreBaseProps {
    /** Disable the def altogether - including all contents inside. (Technically makes the def amount to null.) */
    _disable?: boolean;
    /** Attach key for moving the def around. */
    _key?: any;
    /** Attach one or many refs. */
    _ref?: RefBase | RefBase[];
}
interface MixDOMPreProps<Signals extends SignalsRecord = {}> extends MixDOMPreBaseProps {
    /** Attach signals. */
    _signals?: Partial<Signals> | null;
    /** Attach named contexts on a child component. Any changes in these will call component.contextAPI.setContext() accordingly. */
    _contexts?: Partial<Record<string, Context | null>> | null;
}
/** Dev. note. The current decision is to rely on JSX global declaration and not include MixDOMPreComponentProps into each Component type (including funcs) or constructor(props).
 * - However, the _signals are reliant on having more typed info to be used nicely. So that's why we have this type specifically. The _signals will not be there during the render cycle, tho.
 * - Note that above decision relies mainly on two things: 1. The JSX intrinsic declaration is anyway needed for DOM elements, 2. It's very confusing to have _key and _disable appearing in the type inside render method / func.
 */
declare type MixDOMPreComponentOnlyProps<Signals extends SignalsRecord = {}> = {
    /** Attach signals to component. Exceptionally the _signals prop is exposed even tho it will not be there during the render cycle. It's exposed due to getting better typing experience when using it in TSX. */
    _signals?: Partial<ComponentSignals & Signals> | null;
    /** Attach named contexts on a child component. Any changes in these will call component.contextAPI.setContext() accordingly. */
    _contexts?: Partial<Record<string, Context | null>> | null;
};
declare type MixDOMPreComponentProps<Signals extends SignalsRecord = {}> = MixDOMPreBaseProps & MixDOMPreComponentOnlyProps<Signals>;
/** This combines all the internal dom props together: "_key", "_ref", "_disable" and _"signals" with its dom specific listeners. */
interface MixDOMPreDOMProps extends MixDOMPreBaseProps {
    /** The common DOM signals are the same as with Refs: "domDidAttach", "domWillDetach", "domDidMount", "domDidUpdate", "domDidContent", "domDidMove" and "domWillUnmount". */
    _signals?: Partial<RefDOMSignals> | null;
}
/** This includes all the internal dom props (_key, _ref, ...) as well as common attributes (class, className, style, data, ...) and any specific for the given DOM tag. */
declare type MixDOMPreDOMTagProps<Tag extends DOMTags = DOMTags> = MixDOMPreDOMProps & HTMLSVGAttributes<Tag, {}> & ListenerAttributes & MixDOMCommonDOMProps;
interface MixDOMCommonDOMProps {
    class?: string;
    className?: string;
    style?: CSSProperties | string;
    data?: Dictionary;
}
/** These are any DOM props excluding internal props (like _key, _ref, ...), but also including HTML and SVG attributes (including listeners) by inputting Tag. */
declare type MixDOMDOMProps<Tag extends DOMTags = DOMTags> = HTMLSVGAttributes<Tag, {}> & ListenerAttributes & MixDOMCommonDOMProps;
/** Post props don't contain key, ref. In addition className and class have been merged, and style processed to a dictionary. */
declare type MixDOMProcessedDOMProps = {
    className?: string;
    style?: CSSProperties;
    data?: Dictionary;
};
/** Meant for JSX.
 * - Generic support for "_key", "_ref" and "_disable" props (by catch phrase).
 *      * Note that for components, the "_signals" prop is component specific, so uses the initial props on constructor or func.
 *      * This means, each component should be typed with shortcuts (eg. `ComponentFunc<Info>`). To do it manually initProps should have MixDOMPreComponentProps included.
 * - For each dom tag (= HTML & SVG tags), adds their attributes including listeners.
 *      * In addition, for each dom tag adds support for "_signals" related to dom changes.
 */
declare type IntrinsicAttributesBy = {
    [CompOrEl: string]: MixDOMPreProps | MixDOMPreComponentProps;
} & {
    [Tag in keyof HTMLSVGAttributesBy]: MixDOMPreDOMProps & MixDOMCommonDOMProps;
} & HTMLSVGAttributesBy;
declare type MixDOMContentNull = null | undefined;
declare type MixDOMContentValue = string | number;
declare type MixDOMContentSimple = MixDOMContentValue | Node;
declare type MixDOMRenderOutputSingle = MixDOMDefTarget | MixDOMContentSimple | MixDOMContentNull | Host;
interface MixDOMRenderOutputMulti extends Array<MixDOMRenderOutputSingle | MixDOMRenderOutputMulti> {
}
declare type MixDOMRenderOutput = MixDOMRenderOutputSingle | MixDOMRenderOutputMulti;
interface MixDOMComponentUpdates<Props extends Dictionary = {}, State = {}> {
    props?: Props;
    state?: State;
}
interface MixDOMComponentPreUpdates<Props extends Dictionary = {}, State = {}> {
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
declare type MixDOMUpdateCompareMode = "never" | "always" | "changed" | "shallow" | "double" | "deep";
/** Defines how often components should update for each updatable type: props, state, context.
 * - If type not defined, uses the default value for it.
 * - Note that the pure checks only check those types that have just been changed.
 */
interface MixDOMUpdateCompareModesBy {
    props: MixDOMUpdateCompareMode | number;
    state: MixDOMUpdateCompareMode | number;
}
/** Differences made to a dom element. Note that this never includes tag changes, because it requires creating a new element. */
interface MixDOMDOMDiffs {
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
declare type MixDOMRenderInfo = MixDOMRenderInfoBoundary | MixDOMRenderInfoDOMLike | MixDOMRenderInfoHost;
/** This only includes the calls that can be made after the fact: onUnmount is called before (so not here). */
declare type MixDOMSourceBoundaryChangeType = "mounted" | "updated" | "moved";
declare type MixDOMSourceBoundaryChange = [boundary: SourceBoundary, changeType: MixDOMSourceBoundaryChangeType, newUpdates?: (MixDOMComponentUpdates | null), prevUpdates?: (MixDOMComponentUpdates | null)];
declare type MixDOMChangeInfos = [MixDOMRenderInfo[], MixDOMSourceBoundaryChange[]];
/** Describes what kind of def it is.
 * - Compared to treeNode.type, we have extra: "content" | "element" | "fragment". But don't have "root" (or ""). */
declare type MixDOMDefType = "dom" | "content" | "element" | "portal" | "boundary" | "pass" | "contexts" | "fragment" | "host";
declare type MixDOMSpreadLinks = {
    /** This contains any true and copy passes. It's the point where the inner spread stopped processing, and the parent spread can continue from it. */
    passes: MixDOMDefTarget[];
    /** This contains any MixDOM.WithContent components, if they were not sure whether they actually have content or not (due to only having "pass" defs without any solid stuff).
     * - The structure is [ childDefs, withDef ], where childDefs are the children originally passed to the spread.
     */
    withs: [childDefs: MixDOMDefTarget[], withDef: MixDOMDefTarget & {
        props: {
            hasContent?: boolean;
        };
    }][];
};
interface MixDOMDefBase<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> {
    /** This is to distinguish from other objects as well as to define the type both in the same.
     * - That's why it's name so strangely (to distinguish from objects), but still somewhat sensibly to be readible.
     * - In earlier quick tests, it seemed (almost 2x) faster to use { _isDef: true} as opposed to creating a new class instance (without _isDef member). */
    MIX_DOM_DEF: MixDOMDefType;
    tag: MixDOMPostTag;
    childDefs: MixDOMDefApplied[] | MixDOMDefTarget[];
    /** The def should be skipped - used internally.
     * - Currently only used for type "content" for settings.noRenderValuesMode and "fragment" for withContent() and spread usage. */
    disabled?: boolean;
    key?: any;
    attachedRefs?: RefBase[];
    attachedSignals?: Partial<Record<string, SignalListener[0]>>;
    attachedContexts?: Partial<Record<string, Context | null>>;
    props?: Props;
    isArray?: boolean;
    scopeType?: "spread" | "spread-pass" | "spread-copy";
    scopeMap?: Map<MixDOMDefKeyTag, MixDOMDefApplied[]>;
    spreadLinks?: MixDOMSpreadLinks;
    domContent?: MixDOMContentSimple | null;
    domHTMLMode?: boolean;
    domElement?: HTMLElement | SVGElement | null;
    domCloneMode?: MixDOMCloneNodeBehaviour | "" | null;
    domPortal?: Node | null;
    contentPass?: ContentClosure | null;
    contentPassType?: "pass" | "copy";
    getStream?: () => ComponentStreamType;
    host?: Host;
    hasPassWithin?: true;
    treeNode?: MixDOMTreeNode;
}
interface MixDOMDefDOM<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase<Props> {
    MIX_DOM_DEF: "dom";
    tag: DOMTags;
    props: Props;
    attachedRefs?: RefBase[];
}
interface MixDOMDefContent extends MixDOMDefBase {
    MIX_DOM_DEF: "content";
    tag: "" | DOMTags;
    domContent: MixDOMContentSimple;
    domHTMLMode?: false;
    props?: never;
}
interface MixDOMDefContentInner<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase {
    MIX_DOM_DEF: "content";
    tag: "" | DOMTags;
    domContent: MixDOMContentSimple;
    /** If true, sets the content as innerHTML. */
    domHTMLMode: true;
    props?: Props;
}
interface MixDOMDefElement<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase<Props> {
    MIX_DOM_DEF: "element";
    tag: "_";
    props: Props;
    domElement: HTMLElement | SVGElement | null;
    domCloneMode?: MixDOMCloneNodeBehaviour | "" | null;
}
interface MixDOMDefPortal<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase<Props> {
    MIX_DOM_DEF: "portal";
    tag: null;
    domPortal: Node | null;
    props?: never;
}
interface MixDOMDefBoundary<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase<Props> {
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
interface MixDOMDefFragment extends MixDOMDefBase {
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
interface MixDOMDefPass extends MixDOMDefBase {
    MIX_DOM_DEF: "pass";
    tag: null;
    contentPass?: ContentClosure | null;
    contentPassType?: "pass" | "copy";
    /** If is about a stream, this is assigned and gets the common static class part for a stream component. */
    getStream?: () => ComponentStreamType;
    props?: never;
}
interface MixDOMDefHost extends MixDOMDefBase {
    MIX_DOM_DEF: "host";
    tag: null;
    host: Host;
    props?: never;
}
declare type MixDOMDefTypesAll = MixDOMDefDOM | MixDOMDefContent | MixDOMDefContentInner | MixDOMDefElement | MixDOMDefPortal | MixDOMDefBoundary | MixDOMDefPass | MixDOMDefFragment | MixDOMDefHost;
interface MixDOMDefAppliedBase extends MixDOMDefBase {
    childDefs: MixDOMDefApplied[];
    action: "mounted" | "moved" | "updated";
    treeNode?: MixDOMTreeNode;
}
interface MixDOMDefTargetBase extends MixDOMDefBase {
    childDefs: MixDOMDefTarget[];
    treeNode?: never;
    action?: never;
}
declare type MixDOMDefApplied = MixDOMDefAppliedBase & MixDOMDefTypesAll;
declare type MixDOMDefTarget = MixDOMDefTargetBase & MixDOMDefTypesAll;
declare type MixDOMTreeNodeType = "dom" | "portal" | "boundary" | "pass" | "contexts" | "host" | "root";
interface MixDOMTreeNodeBase {
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
    /** If refers to a boundary - either a custom class / functino or then a content passing boundary. */
    boundary?: MixDOMBoundary | null;
    /** The def tied to this particular treeNode. */
    def?: MixDOMDefApplied;
}
interface MixDOMTreeNodeBaseWithDef extends MixDOMTreeNodeBase {
    def: MixDOMDefApplied;
}
interface MixDOMTreeNodeEmpty extends MixDOMTreeNodeBase {
    type: "";
}
interface MixDOMTreeNodeRoot extends MixDOMTreeNodeBase {
    type: "root";
    def?: never;
}
interface MixDOMTreeNodeDOM extends MixDOMTreeNodeBaseWithDef {
    type: "dom";
    /** This exists only for treeNodes referring to dom elements (typeof appliedDef.tag === "string").
     * To avoid ever missing diffs, it's best to hold a memory for the props that were actually applied to a dom element.
     * Note. Like React, we do not want to read the state of the dom element due to 2 reasons:
     *   1. Reading from dom element is relatively slow (in comparison to reading property of an object).
     *   2. It's actually better for outside purposes that we only take care of our own changes to dom - not forcing things there (except create / destroy our own). */
    domProps: MixDOMProcessedDOMProps;
}
interface MixDOMTreeNodePortal extends MixDOMTreeNodeBaseWithDef {
    type: "portal";
    /** For portals, the domNode refers to the external container. */
    domNode: MixDOMTreeNodeBase["domNode"];
}
interface MixDOMTreeNodeBoundary extends MixDOMTreeNodeBaseWithDef {
    type: "boundary";
    /** This will be set to the treeNode right after instancing the source boundary. */
    boundary: SourceBoundary;
}
interface MixDOMTreeNodePass extends MixDOMTreeNodeBaseWithDef {
    type: "pass";
    /** This will be set to the treeNode right after instancing the content boundary.
     * - It's null only if there's no content, otherwise there's a content boundary.*/
    boundary: ContentBoundary | null;
}
interface MixDOMTreeNodeHost extends MixDOMTreeNodeBaseWithDef {
    type: "host";
}
declare type MixDOMTreeNode = MixDOMTreeNodeEmpty | MixDOMTreeNodeDOM | MixDOMTreeNodePortal | MixDOMTreeNodeBoundary | MixDOMTreeNodePass | MixDOMTreeNodeHost | MixDOMTreeNodeRoot;
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
interface MixDOMDefTargetPseudo extends DefPseudo {
    childDefs: MixDOMDefTarget[];
    scopeType?: MixDOMDefFragment["scopeType"];
    scopeMap?: MixDOMDefFragment["scopeMap"];
}
interface MixDOMDefAppliedPseudo extends DefPseudo {
    childDefs: MixDOMDefApplied[];
    scopeType?: MixDOMDefFragment["scopeType"];
    scopeMap?: MixDOMDefFragment["scopeMap"];
    action?: MixDOMDefAppliedBase["action"];
    hasPassWithin?: true;
}
interface MixDOMContentEnvelope {
    applied: MixDOMDefApplied;
    target: MixDOMDefTarget;
}
/** The basic dom node cloning modes - either deep or shallow: element.clone(mode === "deep").
 * - If in "always" then is deep, and will never use the original. */
declare type MixDOMCloneNodeBehaviour = "deep" | "shallow" | "always";
declare type MixDOMRenderTextTagCallback = (text: string | number) => Node | null;
declare type MixDOMRenderTextContentCallback = (text: string | number) => string | number;
declare type MixDOMRenderTextTag = DOMTags | "" | MixDOMRenderTextTagCallback;
/** Helper to merge classes. This is used for the related functionality for extendClass and mergeClasses methods. */
declare type MergeClasses<A extends ClassType = ClassType, B extends ClassType = ClassType, C extends ClassType = ClassType, D extends ClassType = ClassType, E extends ClassType = ClassType, F extends ClassType = ClassType, G extends ClassType = ClassType, H extends ClassType = ClassType, I extends ClassType = ClassType, J extends ClassType = ClassType, Instance extends Object = InstanceType<A> & InstanceType<B> & InstanceType<C> & InstanceType<D> & InstanceType<E> & InstanceType<F> & InstanceType<G> & InstanceType<H> & InstanceType<I> & InstanceType<J>> = Omit<A & B & C & D & E & F & G & H & I & J, "new"> & {
    new (...args: any[]): Instance;
};
declare type Join<T extends unknown[], D extends string> = T extends [] ? '' : T extends [string | number | boolean | bigint] ? `${T[0]}` : T extends [string | number | boolean | bigint, ...infer U] ? `${T[0]}${D}${Join<U, D>}` : string;
/** Split a string into a typed array.
 * - Use with PropType to validate and get deep value types with, say, dotted strings. */
declare type Split<S extends string, D extends string> = string extends S ? string[] : S extends '' ? [] : S extends `${infer T}${D}${infer U}` ? [T, ...Split<U, D>] : [
    S
];
declare type SplitOnce<S extends string, D extends string> = string extends S ? string[] : S extends '' ? [] : S extends `${infer T}${D}${infer U}` ? [T, U] : [
    S
];
declare type FirstSplit<S extends string, D extends string> = string extends S ? string : S extends '' ? '' : S extends `${infer T}${D}${string}` ? T : S;
declare type SecondSplit<S extends string, D extends string> = string extends S ? string : S extends '' ? '' : S extends `${string}${D}${infer T}` ? T : S;
/** Get deep value type. If puts 3rd param to never, then triggers error with incorrect path. */
declare type PropType<T, Path extends string, Unknown = unknown> = string extends Path ? Unknown : Path extends keyof T ? T[Path] : Path extends `${infer K}.${infer R}` ? K extends keyof T ? PropType<T[K], R, Unknown> : Unknown : Unknown;
declare type SafeIterator = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...0[]];
/** Collect structural data keys from a deep dictionary as dotted strings.
 * - Does not go inside arrays, sets, maps, immutable objects nor classes or class instances.
 * - By default limits to 10 depth, to not limit at all put MaxDepth to -1.
 * - Can provide <Data, Pre, Joiner, MaxDepth>. Should not provide the last PreVal, it's used internally. */
declare type GetJoinedDataKeysFrom<Data extends Record<string, any>, Pre extends string = "", Joiner extends string = ".", MaxDepth extends number = 10, PreVal extends string = "" extends Pre ? "" : `${Pre}${Joiner}`> = SafeIterator[MaxDepth] extends never ? never : {
    [Key in string & keyof Data]: Data[Key] extends {
        [key: string]: any;
        [key: number]: never;
    } ? Data[Key] extends {
        asMutable(): Data[Key];
    } ? `${PreVal}${Key}` : string & GetJoinedDataKeysFrom<Data[Key], `${PreVal}${Key}`, Joiner, SafeIterator[MaxDepth]> | `${PreVal}${Key}` : `${PreVal}${Key}`;
}[string & keyof Data];
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
declare type NameValidator<Valid extends string, Input> = [
    Input
] extends [string] ? Split<Input, " "> extends Valid[] ? string : never : [
    Input
] extends [Array<any> | Readonly<Array<any>>] ? Input extends Valid[] ? Valid[] : Split<Input[number] & string, " "> extends Valid[] ? any : never : [
    Input
] extends [object] ? keyof Input extends Valid ? any : Split<keyof Input & string, " "> extends Valid[] ? any : never : any;
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
declare type ValidateNames<Valid extends string> = <T1 extends NameValidator<Valid, T1>, T2 extends NameValidator<Valid, T2>, T3 extends NameValidator<Valid, T3>, T4 extends NameValidator<Valid, T4>, T5 extends NameValidator<Valid, T5>, T6 extends NameValidator<Valid, T6>, T7 extends NameValidator<Valid, T7>, T8 extends NameValidator<Valid, T8>, T9 extends NameValidator<Valid, T9>, T10 extends NameValidator<Valid, T10>, Tn extends NameValidator<Valid, Tn>>(t1?: T1, t2?: T2, t3?: T3, t4?: T4, t5?: T5, t6?: T6, t7?: T7, t8?: T8, t9?: T9, t10?: T10, ...tn: Tn[]) => string;

declare type DataExtractor<P extends any[] = any[], R = any> = (...args: P) => R;
/** This helps to create a typed data picker by providing the types for the Params for extractor and Data for output of the selector.
 * - The type return is a function that can be used for triggering the effect (like in Redux).
 * - The extractor can return an array up to 10 typed members.
 */
declare type CreateDataPicker<Params extends any[] = any[], Data = any> = <Extractor extends ((...args: Params) => [any]) | ((...args: Params) => [any, any]) | ((...args: Params) => [any, any, any]) | ((...args: Params) => [any, any, any, any]) | ((...args: Params) => [any, any, any, any, any]) | ((...args: Params) => [any, any, any, any, any, any]) | ((...args: Params) => [any, any, any, any, any, any, any]) | ((...args: Params) => [any, any, any, any, any, any, any, any]) | ((...args: Params) => [any, any, any, any, any, any, any, any, any]) | ((...args: Params) => [any, any, any, any, any, any, any, any, any, any]), Extracted extends ReturnType<Extractor> = ReturnType<Extractor>>(extractor: Extractor, selector: (...args: Extracted) => Data, depth?: number | MixDOMUpdateCompareMode) => (...args: Params) => Data;
/** This helps to create a fully typed data selector with multiple extractors (each outputting any value) as an array.
 * - It returns a callback that can be used for selecting (like in Redux).
 * - The typing supports up to 10 extractors.
 */
declare type CreateDataSelector<Params extends any[], Data extends any> = <Extractors extends [
    DataExtractor<Params>
] | [
    DataExtractor<Params>,
    DataExtractor<Params>
] | [
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>
] | [
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>
] | [
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>
] | [
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>
] | [
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>
] | [
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>
] | [
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>
] | [
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>,
    DataExtractor<Params>
]>(extractors: Extractors, selector: (...args: ReturnTypes<Extractors>) => Data, depth?: number | MixDOMUpdateCompareMode) => (...args: Params) => Data;
/** Create a data picker (returns a function): It's like Effect but for data with an intermediary extractor.
 * - Give an extractor that extracts an array out of your customly defined arguments. Can return an array up to 10 typed members or more with `[...] as const` trick.
 * - Whenever the extracted output has changed (in shallow sense by default), the selector will be run.
 * - The arguments of the selector is the extracted array spread out, and it should return the output data solely based on them.
 * - The whole point of this abstraction, is to trigger the presumably expensive selector call only when the cheap extractor func tells there's a change.
 */
declare const createDataPicker: <Extracted extends readonly any[] | [any] | [any, any] | [any, any, any] | [any, any, any, any] | [any, any, any, any, any] | [any, any, any, any, any, any] | [any, any, any, any, any, any, any] | [any, any, any, any, any, any, any, any] | [any, any, any, any, any, any, any, any, any] | [any, any, any, any, any, any, any, any, any, any], Data extends unknown, Params extends any[]>(extractor: (...args: Params) => Extracted, selector: (...args: Extracted) => Data, depth?: number | MixDOMUpdateCompareMode) => (...args: Params) => Data;
/** Create a data selector: It's like the DataPicker above, but takes in an array of extractors (not just one).
 * - Accordingly the outputs of extractors are then spread out as the arguments for the selector.
 */
declare const createDataSelector: <Extractors extends [DataExtractor<Params, any>] | [DataExtractor<Params, any>, DataExtractor<Params, any>] | [DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>] | [DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>] | [DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>] | [DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>] | [DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>] | [DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>] | [DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>] | [DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>, DataExtractor<Params, any>], Data extends unknown, Params extends any[] = Parameters<Extractors[number]>>(extractors: Extractors, selector: (...args: ReturnTypes<Extractors>) => Data, depth?: number | MixDOMUpdateCompareMode) => (...args: Params) => Data;

/** Effect to run when memory has changed (according to the comparison mode).
 * - If returns a new effect function, it will be run when unmounting the effect. */
declare type EffectOnMount<Memory = any> = (newMem: Memory, prevMem: Memory | undefined) => void | EffectOnUnmount;
declare type EffectOnUnmount<Memory = any> = (currentMem: Memory, nextMem: Memory, cancelled: boolean) => void;
declare const Effect_base: {
    new (effect?: EffectOnMount<any> | undefined, memory?: any, ...baseParams: any[]): {
        memory: any;
        onMount: EffectOnMount<any> | null;
        onUnmount: EffectOnUnmount<any> | null;
        depth: number;
        setDepth(depth?: number | MixDOMUpdateCompareMode | null | undefined): void;
        reset(effect: EffectOnMount<any> | null, memory: any, forceRun?: boolean): boolean;
        use(memory: any, forceRun?: boolean, newEffectIfChanged?: EffectOnMount<any> | null | undefined): boolean;
        /** Cancel effect. */
        cancel(runUnmount?: boolean, clearMemory?: boolean, clearEffect?: boolean): void;
    };
    MIX_DOM_CLASS: string;
};
interface Effect<Memory = any> {
    /** The last store memory. */
    memory: Memory | undefined;
    /** The effect to run, when has changed.
     * - If returns a function, will replace the effect after (for the next time). */
    onMount: EffectOnMount<Memory> | null;
    /** This is automatically assigned by the return value of the onMount - if doesn't return a func, will assing to null. */
    onUnmount: EffectOnUnmount<Memory> | null;
    /** Comparison mode to be used by default. (Defaults to 1, which is the same as "shallow".)
    * - If -1 depth, performs fully deep search. If depth <= -2, then is in "always" mode (doesn't even check). */
    depth: number;
    /** Main function for using the effect.
     * - Compares the memory against the old one and if changed, returns true and runs the effect.
     * - If newEffectIfChanged provided, overrides the effect (only if was changed) right before calling the effect.
     * - Note that you don't need to have an effect assigned at all: you can also use the returned boolean and run your "effect" inline. */
    use(memory: this["memory"], forceRun?: boolean, newEffectIfChanged?: EffectOnMount<Memory> | null): boolean;
    /** Alias for .use, that requires a function. (Do not use this, if you can reuse a function.)
     * - Note that if you can reuse a function all the time, you should. (There's no point declaring a new one every time in vain.)
     * - Note that you can also call .update(mem), and if it returns true, then do your effect inline.  */
    reset(effect: EffectOnMount<Memory> | null, memory: this["memory"], forceRun?: boolean): boolean;
    /** Cancel effect. */
    cancel(skipUnmount?: boolean, clearEffect?: boolean): void;
    /** Set the comparison depth using a number or the shortcut names in MixDOMUpdateCompareMode. */
    setDepth(depth?: number | MixDOMUpdateCompareMode | null): void;
}
declare class Effect<Memory = any> extends Effect_base {
}
declare const newEffect: <Memory = any>(effect?: EffectOnMount<Memory> | undefined, memory?: Memory | undefined) => Effect<Memory>;
/** There are two ways you can use this:
 * 1. Call this to give basic Effect features.
 *      * For example: `class MyMix extends EffectMixin(MyBase) {}`
 * 2. If you want to define Memory, use this simple trick instead:
 *      * For example: `class MyMix extends (EffectMixin as ClassMixer<typeof Effect<MyMemory>>)(MyBase) {}`
 */
declare const EffectMixin: ClassMixer<typeof Effect>;

/** For quick getting modes to depth for certain uses (Effect and DataPicker).
 * - Positive values can go however deep. Note that -1 means deep, but below -2 means will not check.
 * - Values are: "never" = -3, "always" = -2, "deep" = -1, "changed" = 0, "shallow" = 1, "double" = 2. */
declare enum MixDOMCompareDepth {
    never = -3,
    always = -2,
    deep = -1,
    changed = 0,
    shallow = 1,
    double = 2
}

/** Create a rendering definition. Supports receive direct JSX compiled output. */
declare function newDef<DOMTag extends DOMTags>(domTag: DOMTag, origProps?: MixDOMPreDOMTagProps<DOMTag> | null, ...contents: MixDOMRenderOutput[]): MixDOMDefTarget | null;
declare function newDef<Props extends Dictionary>(componentTag: MixDOMComponentTag<Props>, origProps?: (MixDOMPreComponentProps & Props) | null, ...contents: MixDOMRenderOutput[]): MixDOMDefTarget | null;
declare function newDef<Props extends MixDOMPreDOMTagProps | MixDOMPreComponentProps>(tag: MixDOMPreTag, origProps?: Props | null, ...contents: MixDOMRenderOutput[]): MixDOMDefTarget | null;

/** This creates a new ComponentShadowAPI or ComponentWiredAPI and merges updateModes and signals.
 * - If is a ComponentWiredAPI also attaches the last builtProps member, and onBuildProps and onMixProps methods.
 */
declare function mergeShadowWiredAPIs(apis: Array<ComponentShadowAPI>): ComponentShadowAPI;
declare function mergeShadowWiredAPIs(apis: Array<ComponentWiredAPI>): ComponentWiredAPI;
declare type ExtendComponentFunc<Func extends ComponentFunc, Info extends Partial<ComponentInfo>> = [Func] extends [{
    _Required?: ComponentFunc | undefined;
}] ? ComponentFuncMixable<Func["_Required"] & {}, Func["_Info"] & Info> : ComponentFunc<Func["_Info"] & Info>;
declare type ComponentFuncExtends<A extends ComponentFunc, B extends ComponentFunc> = [
    B
] extends [{
    _Required?: ComponentFunc | undefined;
}] ? [
    Component<A["_Info"] & {}> & (A["_Info"] & {
        class?: {};
    })["class"] & {}
] extends [Component<(B["_Required"] & {
    _Info?: {};
})["_Info"] & {}> & ((B["_Required"] & {
    _Info?: {};
})["_Info"] & {
    class?: {};
})["class"] & {}] ? ComponentFunc : never : ComponentFunc;
declare type ReadComponentClassInfo<Comp extends Component> = Omit<Comp, keyof Component>;
declare type ComponentFuncExtendsType<A extends ComponentType, B extends ComponentFunc> = [B] extends [{
    _Required?: ComponentFunc | undefined;
}] ? [A] extends [ComponentTypeWithClass<(B["_Required"] & {
    _Info?: {};
})["_Info"] & {}>] ? ComponentFunc : never : ComponentFunc;
declare type ComponentFuncRequires<RequiresInfo extends Partial<ComponentInfo> = {}, OwnInfo extends Partial<ComponentInfo> = {}> = ComponentFunc<RequiresInfo & OwnInfo> & {
    _Required?: ComponentFunc<RequiresInfo>;
};
declare type ComponentFuncMixable<RequiredFunc extends ComponentFunc = ComponentFunc, OwnInfo extends Partial<ComponentInfo> = {}> = ComponentFunc<GetComponentFuncInfo<RequiredFunc> & OwnInfo> & {
    _Required?: RequiredFunc;
};
declare type CombineComponentFuncs<A extends ComponentFunc = ComponentFunc, B extends ComponentFunc = ComponentFunc, C extends ComponentFunc = ComponentFunc, D extends ComponentFunc = ComponentFunc, E extends ComponentFunc = ComponentFunc, F extends ComponentFunc = ComponentFunc, G extends ComponentFunc = ComponentFunc, H extends ComponentFunc = ComponentFunc, I extends ComponentFunc = ComponentFunc, J extends ComponentFunc = ComponentFunc> = ComponentFunc<GetComponentFuncInfo<A> & GetComponentFuncInfo<B> & GetComponentFuncInfo<C> & GetComponentFuncInfo<D> & GetComponentFuncInfo<E> & GetComponentFuncInfo<F> & GetComponentFuncInfo<G> & GetComponentFuncInfo<H> & GetComponentFuncInfo<I> & GetComponentFuncInfo<J>>;
declare type CombineInfosFromComponentFuncs<A extends ComponentFunc = ComponentFunc, B extends ComponentFunc = ComponentFunc, C extends ComponentFunc = ComponentFunc, D extends ComponentFunc = ComponentFunc, E extends ComponentFunc = ComponentFunc, F extends ComponentFunc = ComponentFunc, G extends ComponentFunc = ComponentFunc, H extends ComponentFunc = ComponentFunc, I extends ComponentFunc = ComponentFunc, J extends ComponentFunc = ComponentFunc> = GetComponentFuncInfo<A> & GetComponentFuncInfo<B> & GetComponentFuncInfo<C> & GetComponentFuncInfo<D> & GetComponentFuncInfo<E> & GetComponentFuncInfo<F> & GetComponentFuncInfo<G> & GetComponentFuncInfo<H> & GetComponentFuncInfo<I> & GetComponentFuncInfo<J> & {};
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
declare function mixComponentFuncs<A extends ComponentFuncExtends<ComponentFunc<{}>, A>>(a: A, useRenderer?: boolean): A;
declare function mixComponentFuncs<A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>>(a: A, b: B, useRenderer?: boolean): CombineComponentFuncs<A, B>;
declare function mixComponentFuncs<A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>>(a: A, b: B, c: C, useRenderer?: boolean): CombineComponentFuncs<A, B, C>;
declare function mixComponentFuncs<A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>>(a: A, b: B, c: C, d: D, useRenderer?: boolean): CombineComponentFuncs<A, B, C, D>;
declare function mixComponentFuncs<A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>>(a: A, b: B, c: C, d: D, e: E, useRenderer?: boolean): CombineComponentFuncs<A, B, C, D, E>;
declare function mixComponentFuncs<A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, F extends ComponentFuncExtends<A & B & C & D & E, F>>(a: A, b: B, c: C, d: D, e: E, f: F, useRenderer?: boolean): CombineComponentFuncs<A, B, C, D, E, F>;
declare function mixComponentFuncs<A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, F extends ComponentFuncExtends<A & B & C & D & E, F>, G extends ComponentFuncExtends<A & B & C & D & E & F, G>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, useRenderer?: boolean): CombineComponentFuncs<A, B, C, D, E, F, G>;
declare function mixComponentFuncs<A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, F extends ComponentFuncExtends<A & B & C & D & E, F>, G extends ComponentFuncExtends<A & B & C & D & E & F, G>, H extends ComponentFuncExtends<A & B & C & D & E & F & G, H>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, useRenderer?: boolean): CombineComponentFuncs<A, B, C, D, E, F, G, H>;
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
declare function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, Mixed extends ExtendComponentFunc<A, ExtraInfo>>(a: A, composer: Mixed, extraInfo?: ExtraInfo): ExtendComponentFunc<A, ExtraInfo>;
declare function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<A, B> & ExtraInfo>>(a: A, b: B, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<CombineInfosFromComponentFuncs<A, B> & ExtraInfo>;
declare function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<A, B, C> & ExtraInfo>>(a: A, b: B, c: C, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<CombineInfosFromComponentFuncs<A, B, C> & ExtraInfo>;
declare function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D> & ExtraInfo>>(a: A, b: B, c: C, d: D, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D> & ExtraInfo>;
declare function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D, E> & ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D, E> & ExtraInfo>;
declare function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, F extends ComponentFuncExtends<A & B & C & D & E, F>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D, E, F> & ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D, E, F> & ExtraInfo>;
declare function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, F extends ComponentFuncExtends<A & B & C & D & E, F>, G extends ComponentFuncExtends<A & B & C & D & E & F, G>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D, E, F, G> & ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D, E, F, G> & ExtraInfo>;
declare function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentFuncExtends<ComponentFunc<{}>, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, F extends ComponentFuncExtends<A & B & C & D & E, F>, G extends ComponentFuncExtends<A & B & C & D & E & F, G>, H extends ComponentFuncExtends<A & B & C & D & E & F & G, H>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D, E, F, G, H> & ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<CombineInfosFromComponentFuncs<A, B, C, D, E, F, G, H> & ExtraInfo>;
declare type ComponentMixinType<Info extends Partial<ComponentInfo> = {}, RequiresInfo extends Partial<ComponentInfo> = {}> = (Base: ComponentTypeWithClass<RequiresInfo>) => ComponentTypeWithClass<RequiresInfo & Info>;
declare type ComponentMixinExtends<A extends ComponentMixinType, B extends ComponentMixinType> = [ReturnType<A>] extends [Parameters<B>[0]] ? ComponentMixinType : never;
declare type ComponentMixinExtendsInfo<Info extends Partial<ComponentInfo>, Ext extends ComponentMixinType> = [ComponentType<Info>] extends [Parameters<Ext>[0]] ? ComponentMixinType : never;
declare type ComponentMixinExtendsType<A extends ComponentType, B extends ComponentMixinType> = [A] extends [Parameters<B>[0]] ? ComponentMixinType : never;
declare type CombineMixins<A extends ComponentMixinType = ComponentMixinType, B extends ComponentMixinType = ComponentMixinType, C extends ComponentMixinType = ComponentMixinType, D extends ComponentMixinType = ComponentMixinType, E extends ComponentMixinType = ComponentMixinType, F extends ComponentMixinType = ComponentMixinType, G extends ComponentMixinType = ComponentMixinType, H extends ComponentMixinType = ComponentMixinType> = ComponentMixinType<ReturnType<A>["_Info"] & ReturnType<B>["_Info"] & ReturnType<C>["_Info"] & ReturnType<D>["_Info"] & ReturnType<E>["_Info"] & ReturnType<F>["_Info"] & ReturnType<G>["_Info"] & ReturnType<H>["_Info"] & {}, Parameters<A>[0]["_Info"] & {}>;
declare type GetComponentInfoFromMixins<A extends ComponentMixinType = ComponentMixinType, B extends ComponentMixinType = ComponentMixinType, C extends ComponentMixinType = ComponentMixinType, D extends ComponentMixinType = ComponentMixinType, E extends ComponentMixinType = ComponentMixinType, F extends ComponentMixinType = ComponentMixinType, G extends ComponentMixinType = ComponentMixinType, H extends ComponentMixinType = ComponentMixinType> = ReturnType<A>["_Info"] & ReturnType<B>["_Info"] & ReturnType<C>["_Info"] & ReturnType<D>["_Info"] & ReturnType<E>["_Info"] & ReturnType<F>["_Info"] & ReturnType<G>["_Info"] & ReturnType<H>["_Info"] & {};
/** This returns the original function (to create a mixin class) back but simply helps with typing.
 * - The idea of a mixin is this: `(Base) => class extends Base { ... }`. So it creates a new class that extends the provided base class.
 *     * In the context of Components the idea is that the Base is Component and then different features are added to it.
 *     * Optionally, when used with mixComponentMixins the flow also supports adding requirements (in addition to that the Base is a Component class).
 * - To use this method: `const MyMixin = createMixin<RequiresInfo, MyMixinInfo>(Base => class _MyMixin extends Base { ... }`
 *     * Without the method: `const MyMixin = (Base: ComponentTypeWithClass<RequireInfo>) => class _MyMixin extends (Base as ComponentTypeWithClass<RequireInfo & MyMixinInfo>) { ... }`
 *     * So the trick of this method is simply that the returned function still includes `(Base: Required)`, but _inside_ the func it looks like `(Base: Required & Added)`.
*/
declare function createMixin<Info extends Partial<ComponentInfo>, RequiresInfo extends Partial<ComponentInfo> = {}>(func: (Base: ComponentTypeWithClass<RequiresInfo & Info>) => ComponentTypeWithClass<RequiresInfo & Info>): (Base: ComponentTypeWithClass<RequiresInfo>) => ComponentTypeWithClass<RequiresInfo & Info>;
/** Mix many mixins together into using a Component class as the basis to mix on: `(MyMixin1, MyMixin2, ...)`.
 * - Note. The last mixin with a render method defined is used as the render method of the combined class.
 * - Note. If you want to define a custom base class (extending Component) you can use `mixComponentClassMixins` method whose first argument is a base class.
 * - For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
*/
declare function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, Info extends GetComponentInfoFromMixins<A>>(a: A): ComponentType<Info>;
declare function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>>(a: A, b: B): ComponentType<GetComponentInfoFromMixins<A, B>>;
declare function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>>(a: A, b: B, c: C): ComponentType<GetComponentInfoFromMixins<A, B, C>>;
declare function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>>(a: A, b: B, c: C, d: D): ComponentType<GetComponentInfoFromMixins<A, B, C, D>>;
declare function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D>, E>>(a: A, b: B, c: C, d: D, e: E): ComponentType<GetComponentInfoFromMixins<A, B, C, D, E>>;
declare function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E>, F>>(a: A, b: B, c: C, d: D, e: E, f: F): ComponentType<GetComponentInfoFromMixins<A, B, C, D, E, F>>;
declare function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E>, F>, G extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E, F>, G>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G): ComponentType<GetComponentInfoFromMixins<A, B, C, D, E, F, G>>;
declare function mixComponentMixins<A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E>, F>, G extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E, F>, G>, H extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E, F, G>, H>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H): ComponentType<GetComponentInfoFromMixins<A, B, C, D, E, F, G, H>>;
/** Mix many mixins together into using a Component class as the basis to mix on: `(MyMixin1, MyMixin2, ..., ComposerMixin)`
 * - Note. The last mixin is assumed to be the one to do the rendering and its type is combined from all the previous + the optional extra info given as the very last argument.
 * - This is like mixComponentFuncsWith but for mixins. On the javascript this function is teh same as MixDOM.mixMixins.
 */
declare function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentMixinExtends<ComponentMixinType, A>, Info extends GetComponentInfoFromMixins<A> & ExtraInfo>(a: A, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
declare function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, Info extends GetComponentInfoFromMixins<A, B> & ExtraInfo>(a: A, b: B, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
declare function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, Info extends GetComponentInfoFromMixins<A, B, C> & ExtraInfo>(a: A, b: B, c: C, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
declare function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, Info extends GetComponentInfoFromMixins<A, B, C, D> & ExtraInfo>(a: A, b: B, c: C, d: D, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
declare function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D>, E>, Info extends GetComponentInfoFromMixins<A, B, C, D, E> & ExtraInfo>(a: A, b: B, c: C, d: D, e: E, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
declare function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E>, F>, Info extends GetComponentInfoFromMixins<A, B, C, D, E, F> & ExtraInfo>(a: A, b: B, c: C, d: D, e: E, f: F, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
declare function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E>, F>, G extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E, F>, G>, Info extends GetComponentInfoFromMixins<A, B, C, D, E, F, G> & ExtraInfo>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
declare function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ComponentMixinExtends<ComponentMixinType, A>, B extends ComponentMixinExtends<A, B>, C extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E>, F>, G extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E, F>, G>, H extends ComponentMixinExtendsInfo<GetComponentInfoFromMixins<A, B, C, D, E, F, G>, H>, Info extends GetComponentInfoFromMixins<A, B, C, D, E, F, G, H> & ExtraInfo>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
/** Mix many mixins together with a custom Component class as the basis to mix on: `(MyClass, MyMixin1, MyMixin2, ...)`.
 * - Note. The last mixin with a render method defined is used as the render method of the combined class.
 * - Note. If you don't want to define a custom component class as the base, you can use the `mixComponentMixins` function instead (which uses the Component class). These two funcs are split to get better typing experience.
 * - For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
*/
declare function mixComponentClassMixins<Base extends ComponentType, A extends ComponentMixinExtendsType<Base, A>>(base: Base, a: A): ReturnType<A>;
declare function mixComponentClassMixins<Base extends ComponentType, A extends ComponentMixinExtendsInfo<Base["_Info"] & {}, A>, B extends ComponentMixinExtendsInfo<Base["_Info"] & ReturnType<A>["_Info"] & {}, B>>(base: Base, a: A, b: B): ComponentType<Base["_Info"] & GetComponentInfoFromMixins<A, B>>;
declare function mixComponentClassMixins<Base extends ComponentType, A extends ComponentMixinExtendsInfo<Base["_Info"] & {}, A>, B extends ComponentMixinExtendsInfo<Base["_Info"] & ReturnType<A>["_Info"] & {}, B>, C extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B>, C>>(base: Base, a: A, b: B, c: C): ComponentType<Base["_Info"] & GetComponentInfoFromMixins<A, B, C>>;
declare function mixComponentClassMixins<Base extends ComponentType, A extends ComponentMixinExtendsInfo<Base["_Info"] & {}, A>, B extends ComponentMixinExtendsInfo<Base["_Info"] & ReturnType<A>["_Info"] & {}, B>, C extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C>, D>>(base: Base, a: A, b: B, c: C, d: D): ComponentType<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D>>;
declare function mixComponentClassMixins<Base extends ComponentType, A extends ComponentMixinExtendsInfo<Base["_Info"] & {}, A>, B extends ComponentMixinExtendsInfo<Base["_Info"] & ReturnType<A>["_Info"] & {}, B>, C extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D>, E>>(base: Base, a: A, b: B, c: C, d: D, e: E): ComponentType<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E>>;
declare function mixComponentClassMixins<Base extends ComponentType, A extends ComponentMixinExtendsInfo<Base["_Info"] & {}, A>, B extends ComponentMixinExtendsInfo<Base["_Info"] & ReturnType<A>["_Info"] & {}, B>, C extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E>, F>>(base: Base, a: A, b: B, c: C, d: D, e: E, f: F): ComponentType<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E, F>>;
declare function mixComponentClassMixins<Base extends ComponentType, A extends ComponentMixinExtendsInfo<Base["_Info"] & {}, A>, B extends ComponentMixinExtendsInfo<Base["_Info"] & ReturnType<A>["_Info"] & {}, B>, C extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E>, F>, G extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E, F>, G>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G): ComponentType<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E, F, G>>;
declare function mixComponentClassMixins<Base extends ComponentType, A extends ComponentMixinExtendsInfo<Base["_Info"] & {}, A>, B extends ComponentMixinExtendsInfo<Base["_Info"] & ReturnType<A>["_Info"] & {}, B>, C extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B>, C>, D extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C>, D>, E extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D>, E>, F extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E>, F>, G extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E, F>, G>, H extends ComponentMixinExtendsInfo<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E, F, G>, H>>(base: Base, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H): ComponentType<Base["_Info"] & GetComponentInfoFromMixins<A, B, C, D, E, F, G, H>>;
/** This mixes together a Component class and one or many functions.
 * - By default, attaches the return of the last function as the renderer (if function type, otherwise an earlier one).
 * - Optionally as the 3rd arg, can provide a boolean to use the class renderer instead. */
declare function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>>(Base: Class, a: A, useClassRender?: boolean): A;
declare function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<BaseFunc & A, B>>(Base: Class, a: A, b: B, useClassRender?: boolean): ComponentType<GetComponentFuncInfo<CombineComponentFuncs<A, B>>>;
declare function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<BaseFunc & A, B>, C extends ComponentFuncExtends<BaseFunc & A & B, C>>(Base: Class, a: A, b: B, c: C, useClassRender?: boolean): ComponentType<GetComponentFuncInfo<CombineComponentFuncs<A, B, C>>>;
declare function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<BaseFunc & A, B>, C extends ComponentFuncExtends<BaseFunc & A & B, C>, D extends ComponentFuncExtends<BaseFunc & A & B & C, D>>(Base: Class, a: A, b: B, c: C, d: D, useClassRender?: boolean): ComponentType<GetComponentFuncInfo<CombineComponentFuncs<A, B, C, D>>>;
declare function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<BaseFunc & A, B>, C extends ComponentFuncExtends<BaseFunc & A & B, C>, D extends ComponentFuncExtends<BaseFunc & A & B & C, D>, E extends ComponentFuncExtends<BaseFunc & A & B & C & D, E>>(Base: Class, a: A, b: B, c: C, d: D, e: E, useClassRender?: boolean): ComponentType<GetComponentFuncInfo<CombineComponentFuncs<A, B, C, D, E>>>;
declare function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<BaseFunc & A, B>, C extends ComponentFuncExtends<BaseFunc & A & B, C>, D extends ComponentFuncExtends<BaseFunc & A & B & C, D>, E extends ComponentFuncExtends<BaseFunc & A & B & C & D, E>, F extends ComponentFuncExtends<BaseFunc & A & B & C & D & E, F>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, useClassRender?: boolean): ComponentType<GetComponentFuncInfo<CombineComponentFuncs<A, B, C, D, E, F>>>;
declare function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<BaseFunc & A, B>, C extends ComponentFuncExtends<BaseFunc & A & B, C>, D extends ComponentFuncExtends<BaseFunc & A & B & C, D>, E extends ComponentFuncExtends<BaseFunc & A & B & C & D, E>, F extends ComponentFuncExtends<BaseFunc & A & B & C & D & E, F>, G extends ComponentFuncExtends<BaseFunc & A & B & C & D & E & F, G>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, useClassRender?: boolean): ComponentType<GetComponentFuncInfo<CombineComponentFuncs<A, B, C, D, E, F, G>>>;
declare function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<BaseFunc & A, B>, C extends ComponentFuncExtends<BaseFunc & A & B, C>, D extends ComponentFuncExtends<BaseFunc & A & B & C, D>, E extends ComponentFuncExtends<BaseFunc & A & B & C & D, E>, F extends ComponentFuncExtends<BaseFunc & A & B & C & D & E, F>, G extends ComponentFuncExtends<BaseFunc & A & B & C & D & E & F, G>, H extends ComponentFuncExtends<BaseFunc & A & B & C & D & E & F & G, H>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, useClassRender?: boolean): ComponentType<GetComponentFuncInfo<CombineComponentFuncs<A, B, C, D, E, F, G, H>>>;
/** This mixes together a Component class and one or many functions with a composer function as the last function.
 * - The last function is always used as the renderer and its typing is automatic.
 *      * If you want to add extra props to the auto typed composer you can add them as an extra last argument: `{} as { props: { someStuff: boolean; } }`.
 */
declare function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, Mixed extends ExtendComponentFunc<BaseFunc, ExtraInfo>>(Base: Class, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<GetComponentFuncInfo<Mixed>>;
declare function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<BaseFunc, A> & ExtraInfo>>(Base: Class, a: A, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<GetComponentFuncInfo<Mixed>>;
declare function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<A, B>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<BaseFunc, A, B> & ExtraInfo>>(Base: Class, a: A, b: B, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<GetComponentFuncInfo<Mixed>>;
declare function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<BaseFunc, A, B, C> & ExtraInfo>>(Base: Class, a: A, b: B, c: C, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<GetComponentFuncInfo<Mixed>>;
declare function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<BaseFunc, A, B, C, D> & ExtraInfo>>(Base: Class, a: A, b: B, c: C, d: D, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<GetComponentFuncInfo<Mixed>>;
declare function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<BaseFunc, A, B, C, D, E> & ExtraInfo>>(Base: Class, a: A, b: B, c: C, d: D, e: E, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<GetComponentFuncInfo<Mixed>>;
declare function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, F extends ComponentFuncExtends<A & B & C & D & E, F>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<BaseFunc, A, B, C, D, E, F> & ExtraInfo>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<GetComponentFuncInfo<Mixed>>;
declare function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, F extends ComponentFuncExtends<A & B & C & D & E, F>, G extends ComponentFuncExtends<A & B & C & D & E & F, G>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<BaseFunc, A, B, C, D, E, F, G> & ExtraInfo>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<GetComponentFuncInfo<Mixed>>;
declare function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc & ComponentFunc<Class["_Info"] & {}>, A extends ComponentFuncExtends<BaseFunc, A>, B extends ComponentFuncExtends<A, B>, C extends ComponentFuncExtends<A & B, C>, D extends ComponentFuncExtends<A & B & C, D>, E extends ComponentFuncExtends<A & B & C & D, E>, F extends ComponentFuncExtends<A & B & C & D & E, F>, G extends ComponentFuncExtends<A & B & C & D & E & F, G>, H extends ComponentFuncExtends<A & B & C & D & E & F & G, H>, Mixed extends ComponentFunc<CombineInfosFromComponentFuncs<BaseFunc, A, B, C, D, E, F, G, H> & ExtraInfo>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<GetComponentFuncInfo<Mixed>>;
declare type ComponentHOC<RequiredType extends ComponentTypeAny, FinalType extends ComponentTypeAny> = (InnerComp: RequiredType) => FinalType;
declare type ComponentHOCBase = (InnerComp: ComponentTypeAny) => ComponentTypeAny;
/** Combine many HOCs together. */
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A): SpreadFunc<(Intersect<GetComponentInfo<A> & {}> & {
    props: {};
})["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B): SpreadFunc<(Intersect<GetComponentInfo<B> & {}> & {
    props: {};
})["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C): SpreadFunc<(Intersect<GetComponentInfo<C> & {}> & {
    props: {};
})["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D): SpreadFunc<(Intersect<GetComponentInfo<D> & {}> & {
    props: {};
})["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E): SpreadFunc<(Intersect<GetComponentInfo<E> & {}> & {
    props: {};
})["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F): SpreadFunc<(Intersect<GetComponentInfo<F> & {}> & {
    props: {};
})["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny, G extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F, hoc7: (f: F) => G): SpreadFunc<(Intersect<GetComponentInfo<G> & {}> & {
    props: {};
})["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny, G extends ComponentTypeAny, H extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F, hoc7: (f: F) => G, hoc8: (g: G) => H): SpreadFunc<(Intersect<GetComponentInfo<H> & {}> & {
    props: {};
})["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny, G extends ComponentTypeAny, H extends ComponentTypeAny, I extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F, hoc7: (f: F) => G, hoc8: (g: G) => H, hoc9: (h: H) => I): SpreadFunc<(Intersect<GetComponentInfo<I> & {}> & {
    props: {};
})["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny, G extends ComponentTypeAny, H extends ComponentTypeAny, I extends ComponentTypeAny, J extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F, hoc7: (f: F) => G, hoc8: (g: G) => H, hoc9: (h: H) => I, hoc10: (i: I) => J): SpreadFunc<(Intersect<GetComponentInfo<J> & {}> & {
    props: {};
})["props"] & {}>;

declare const MixDOMContent: MixDOMDefTarget;
declare const MixDOMContentCopy: MixDOMDefTarget;
declare type WithContentInfo = {
    props: {
        /** If set to a boolean value (= not null nor undefined), skips checking whether actually has content and returns the value. */
        hasContent?: boolean | null;
    };
    class: {
        /** Internal method to check whether has content - checks recursively through the parental chain. */
        hasContent(): boolean;
    };
};
declare const MixDOM: {
    /** Create a new render definition. Can feed JSX input. (It's like `React.createElement` but `MixDOM.def`). */
    def: typeof newDef;
    /** Create a new def from a HTML string. Returns a def for a single HTML element.
     * - If a wrapInTag given will use it as a container.
     * - Otherwise, if the string refers to multiple, returns an element containing them (with settings.renderHTMLDefTag).
     * - Normally uses a container only as a fallback if has many children. */
    defHTML: (innerHTML: string, wrapInTag?: DOMTags, props?: MixDOMPreDOMTagProps, key?: any) => MixDOMDefTarget;
    /** Generic def for passing content.
     * - Use this to include content (~ React's props.children) from the parent component.
     * - Note that in the case of multiple contentPasses the first one in tree order is the real one.
     *   .. If you deliberately want to play with which is the real one and which is a copy, use MixDOM.ContentCopy or MixDOM.copyContent(someKey) for the others. */
    Content: MixDOMDefTarget;
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
    WithContent: ComponentType<WithContentInfo>;
    /** A generic shortcut for a content copy.
     * .. We give it a unique key ({}), so that it can be widely moved around.
     * .. In the case you use multiple ContentCopy's, then reuses each widely by tree order. */
    ContentCopy: MixDOMDefTarget;
    /** Use this method to create a copy of the content that is not swappable with the original render content.
     * - This is very rarely useful, but in the case you want to display the passed content multiple times,
     *   this allows to distinguish from the real content pass: `{ MixDOM.Content }` vs. `{ MixDOM.copyContent("some-key") }` */
    copyContent: (key?: any) => MixDOMDefTarget;
    /** For quick getting modes to depth for certain uses (Effect and DataPicker).
     * - Positive values can go however deep. Note that -1 means deep, but below -2 means will not check.
     * - Values are: "always" = -2, "deep" = -1, "changed" = 0, "shallow" = 1, "double" = 2. */
    CompareDepthByMode: typeof MixDOMCompareDepth;
    /** This is a typable base class used for the signals features in many MixDOM classes.
     * - You can use it as a standalone communicator as well or in the component flow: eg. by sharing them via through props, contexts or directly / globally.
     *      * For example, some components can add listeners to the (typed) signals, and you can emit them from elsewhere to, say, trigger a state refresh.
     * - The signal flow is typically one way: you're not expecting a return value from the sendSignal function.
     *      * However even sendSignal does return the last non `undefined` value returned by a listener. (This is used internally for "shouldUpdate" (boolean to tell) and "domWillUnmount" (boolean to salvage).)
     * - However, you can also get a list of answers as the return value: using askSignal for synchronous and requestSignal for asynchronous questions.
     *      * Finally, there's also askLastSignal and requestLastSignal for cases where you except a single answer. Exceptionally, the second argument is the fallback value: `(name, fallback, ...args)`
     */
    SignalMan: typeof SignalMan;
    /** This extends the given base class with SignalMan features - see above for details.
     * - Returns the dynamically extended class. Typewise this means: `(Base: ClassType) => ClassType<typeof Base & typeof SignalMan>` */
    SignalManMixin: ClassMixer<SignalManType<{}>>;
    /** This provides data setting and listening features with dotted strings.
     * - Example to create: `const dataMan = new MixDOM.DataMan({ ...initData });`
     * - Example for listening: `dataMan.listenToData("some.data.key", "another", (some, other) => { ... })`
     * - Example for setting data: `dataMan.setInData("some.data.key", somedata)`
     */
    DataMan: typeof DataMan;
    /** This provides the DataMan features to a custom base class.
     * - Returns the dynamically extended class. Typewise this means: `(Base: ClassType) => ClassType<typeof Base & typeof DataMan>` */
    DataManMixin: ClassMixer<ClassType<DataMan<any>, any[]>>;
    /** This class combines `DataMan` and `SignalMan` mixins together in the order: DataSignalMan > DataMan > SignalMan.
     * - Can be used for stand alone purposes. It's also used as the basis for `Context`.
     * - Extra notes:
     *      * Note that `ContextAPI` looks very much like DataSignalMan but is a bit different technically. It holds no data or signals of its own, but refers to signals and data from many named contexts.
     *      * Likewise there are similar methods available on the `Component` class, but with the "Context" word in them, eg. listenToContextData, sendContextSignal, ... They are just like the signals on component's host's contextAPI, but are automatically disconnected when the component unmounts.
     */
    DataSignalMan: typeof DataSignalMan;
    /** Provides the combined DataManSignal features to a custom base class.
     * - Returns the dynamically extended class. Typewise this means: `(Base: ClassType) => ClassType<typeof Base & typeof DataSignalMan>`
     * - The extending order is: `DataManMixin( SignalManMixin( Base ) ). */
    DataSignalManMixin: ClassMixer<ClassType<DataMan<any> & SignalMan<{}>, any[]>>;
    Component: typeof Component;
    ComponentMixin: ClassMixer<ComponentType<{}>>;
    Host: typeof Host;
    Context: typeof Context;
    Ref: typeof Ref;
    Effect: typeof Effect;
    EffectMixin: ClassMixer<typeof Effect>;
    /** Fragment represent a list of render output instead of stuff under one root.
     * Usage example: `<MixDOM.Fragment><div/><div/></MixDOM.Fragment>` */
    Fragment: typeof PseudoFragment;
    /** Portal allows to insert the content into a foreign dom node.
     * Usage example: `<MixDOM.Portal container={myDOMElement}><div/></MixDOM.Portal>` */
    Portal: typeof PseudoPortal;
    /** This allows to use an existing dom element as if it was part of the system.
     * So you can modify its props and such. */
    Element: typeof PseudoElement;
    /** Empty dummy component that accepts any props, but always renders null. */
    Empty: typeof PseudoEmpty;
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
    EmptyStream: ComponentStreamType;
    /** Create a Host instance to orchestrate rendering. */
    newHost: <Contexts extends MixDOMContextsAll = {}>(content?: MixDOMRenderOutput, container?: HTMLElement | null | undefined, settings?: HostSettingsUpdate | null | undefined, contexts?: Contexts | undefined) => Host<Contexts>;
    /** Create a Context instance. */
    newContext: <Data = any, Signals extends SignalsRecord = SignalsRecord>(data?: Data | undefined, settings?: Partial<ContextSettings> | undefined) => Context<Data, Signals>;
    /** Create multiple named Contexts as a dictionary. Useful for attaching them to a ContextAPI - and for getting the combined type for TypeScript purposes. */
    newContexts: <Contexts_1 extends { [Name in keyof AllData & string]: Context<AllData[Name], any>; }, AllData extends { [Name_1 in keyof Contexts_1 & string]: Contexts_1[Name_1]["data"]; } = { [Name_2 in keyof Contexts_1 & string]: Contexts_1[Name_2]["data"]; }>(contextsData: AllData, settings?: Partial<ContextSettings> | undefined) => Contexts_1;
    /** Create a Ref instance. */
    newRef: <Type extends Node | ComponentTypeEither<{}> = Node | ComponentTypeEither<{}>>() => Ref<Type>;
    /** Create an Effect instance. */
    newEffect: <Memory = any>(effect?: EffectOnMount<Memory> | undefined, memory?: Memory | undefined) => Effect<Memory>;
    /** Alias for createComponent. Create a functional component. You get the component as the first parameter, and optionally contextAPI as the second if you define 2 args: (component, contextAPI). */
    component: typeof createComponent;
    /** Create a functional component with ContextAPI. The first initProps is omitted: (component, contextAPI). The contextAPI is instanced regardless of argument count. */
    componentWith: <Info extends Partial<ComponentInfo<{}, {}, {}, {}, any, {}>> = {}>(func: ComponentFuncWithCtxShortcut<Info>, name?: string) => ComponentFuncWith<Info>;
    /** Create a shadow component omitting the first initProps: (component). The contextAPI is if has 2 arguments (component, contextAPI).
     * - Shadow components are normal components, but they have a ShadowAPI attached as component.constructor.api.
     * - This allows the components to be tracked and managed by the parenting scope who creates the unique component class (whose instances are tracked).
    */
    shadow: typeof createShadow;
    /** Create a shadow component with ContextAPI by func and omitting the first initProps: (component, contextAPI). The contextAPI is instanced regardless of argument count. */
    shadowWith: <Info_1 extends Partial<ComponentInfo<{}, {}, {}, {}, any, {}>> = {}>(func: (component: ComponentShadow<Info_1>, contextAPI: ComponentContextAPI<Info_1["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info_1["props"]>, NonNullable<Info_1["state"]>>, signals?: Partial<ComponentExternalSignalsFor<ComponentShadow<{}>, ComponentSignals<{}>>> | null | undefined, name?: string) => ComponentShadowFuncWith<Info_1>;
    /** Create a SpreadFunc - it's actually just a function with 0 or 1 arguments: (props?).
     * - It's the most performant way to render things (no lifecycle, just spread out with its own pairing scope).
     * - Note that this simply gives back the original function, unless it has more than 1 arguments, in which case an intermediary function is created.
     *      * This intermediary function actually supports feeding in more arguments - this works since a func with (props, ...args) actually has length = 1.
     *      * If you want to include the props and extra arguments typing into the resulting function use the MixDOM.spreadWith function instead (it also automatically reads the types).
     */
    spread: <Props extends Dictionary<any> = {}>(func: (props: Props, ...args: any[]) => MixDOMRenderOutput) => SpreadFunc<Props>;
    /** Create a SpreadFunc by automatically reading the types for Props and ExtraArgs from the given function. See MixDOM.spread for details.
     * - The idea is to use the same spread function outside of normal render flow: as a static helper function to produce render defs (utilizing the extra args).
     */
    spreadWith: <Props_1 extends Dictionary<any>, ExtraArgs extends any[]>(func: (props: Props_1, ...args: ExtraArgs) => MixDOMRenderOutput) => SpreadFuncWith<Props_1, ExtraArgs>;
    /** Create a ComponentStream class for  streaming (in / out).
     * - For example, `export const MyStream = MixDOM.createStream();`.
     * - And then to feed content in a render method: `<MyStream>Some content..</MyStream>`.
     * - Finally insert it somewhere in a render method: `{MyStream.Content}`.
    */
    stream: () => ComponentStreamType;
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
    wired: typeof createWired;
    /** This returns the original function (to create a mixin class) back but simply helps with typing.
     * - The idea of a mixin is this: `(Base) => class extends Base { ... }`. So it creates a new class that extends the provided base class.
     *     * In the context of Components the idea is that the Base is Component and then different features are added to it.
     *     * Optionally, when used with mixComponentMixins the flow also supports adding requirements (in addition to that the Base is a Component class).
     * - To use this method: `const MyMixin = MixDOM.mixin<RequiresInfo, MyMixinInfo>(Base => class _MyMixin extends Base { ... }`
     *     * Without the method: `const MyMixin = (Base: ComponentTypeWithClass<RequireInfo>) => class _MyMixin extends (Base as ComponentTypeWithClass<RequireInfo & MyMixinInfo>) { ... }`
     *     * So the trick of this method is simply that the returned function still includes `(Base: Required)`, but _inside_ the func it looks like `(Base: Required & Added)`.
    */
    mixin: typeof createMixin;
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
    mixFuncs: typeof mixComponentFuncs;
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
    mixFuncsWith: typeof mixComponentFuncsWith;
    /** This mixes together a Component class and one or many functions.
     * - By default, attaches the return of the last function as the renderer (if function type, otherwise an earlier one).
     * - Optionally as the 3rd arg, can provide a boolean to use the class renderer instead. */
    mixClassFuncs: typeof mixComponentClassFuncs;
    /** This mixes together a Component class and one or many functions with a composer function as the last function.
     * - The last function is always used as the renderer and its typing is automatic.
     *      * If you want to add extra props to the auto typed composer you can add them as an extra last argument: `{} as { props: { someStuff: boolean; } }`.
     */
    mixClassFuncsWith: typeof mixComponentClassFuncsWith;
    /** Mix many mixins together with a custom Component class as the basis to mix on: `(MyClass, MyMixin1, MyMixin2, ...)`.
     * - Note. The last mixin with a render method defined is used as the render method of the combined class.
     * - Note. If you don't want to define a custom component class as the base, you can use the `MixDOM.mixMixins` function instead (which uses the Component class). These two funcs are split to get better typing experience.
     * - For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
    */
    mixClassMixins: typeof mixComponentClassMixins;
    /** Mix many mixins together into using the basic Component class as the basis to mix on: `(MyMixin1, MyMixin2, ...)`.
     * - Note. The last mixin with a render method defined is used as the render method of the combined class.
     * - Note. If you want to define a custom base class (extending Component) you can use `MixDOM.mixClassMixins` method whose first argument is a base class.
     * - For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
     */
    mixMixins: typeof mixComponentMixins;
    /** Mix many mixins together into using a Component class as the basis to mix on: `(MyMixin1, MyMixin2, ..., ComposerMixin)`
     * - Note. The last mixin is assumed to be the one to do the rendering and its type is combined from all the previous + the optional extra info given as the very last argument.
     * - This is like MixDOM.mixFuncsWith but for mixins. On the javascript this function is teh same as MixDOM.mixMixins.
     */
    mixMixinsWith: typeof mixComponentMixinsWith;
    /** This creates a final component for a list of HOCs with a based component: `(Base, HOC1, HOC2, ... )`
     * - Note that conceptually HOCs are not very performant as they create extra intermediary components.
     * - Consider using mixFuncs or mixMixins concepts instead. They are like HOCs merged into one component with a dynamic base.
     */
    mixHOCs: typeof mixHOCs;
    /** Create a data picker (returns a function): It's like Effect but for data with an intermediary extractor.
     * - Give an extractor that extracts an array out of your customly defined arguments.
     * - Whenever the extracted output has changed (in shallow sense by default), the selector will be run.
     * - The arguments of the selector is the extracted array spread out, and it should return the output data solely based on them.
     * - The whole point of this abstraction, is to trigger the presumably expensive selector call only when the cheap extractor func tells there's a change. */
    dataPicker: <Extracted extends readonly any[] | [any] | [any, any] | [any, any, any] | [any, any, any, any] | [any, any, any, any, any] | [any, any, any, any, any, any] | [any, any, any, any, any, any, any] | [any, any, any, any, any, any, any, any] | [any, any, any, any, any, any, any, any, any] | [any, any, any, any, any, any, any, any, any, any], Data_1 extends unknown, Params extends any[]>(extractor: (...args: Params) => Extracted, selector: (...args: Extracted) => Data_1, depth?: number | MixDOMUpdateCompareMode) => (...args: Params) => Data_1;
    /** Create a data selector (returns a function): It's like the DataPicker above, but takes in an array of extractors (not just one).
     * - Accordingly the outputs of extractors are then spread out as the arguments for the selector. */
    dataSelector: <Extractors extends [DataExtractor<Params_1, any>] | [DataExtractor<Params_1, any>, DataExtractor<Params_1, any>] | [DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>] | [DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>] | [DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>] | [DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>] | [DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>] | [DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>] | [DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>] | [DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>, DataExtractor<Params_1, any>], Data_2 extends unknown, Params_1 extends any[] = Parameters<Extractors[number]>>(extractors: Extractors, selector: (...args: ReturnTypes<Extractors>) => Data_2, depth?: number | MixDOMUpdateCompareMode) => (...args: Params_1) => Data_2;
    findTreeNodesIn: (treeNode: MixDOMTreeNode, types?: RecordableType<MixDOMTreeNodeType>, maxCount?: number, inNested?: boolean, overHosts?: boolean, validator?: ((treeNode: MixDOMTreeNode) => any) | undefined) => MixDOMTreeNode[];
    findComponentsIn: <Comp extends ComponentTypeAny<{}> = ComponentTypeAny<{}>>(treeNode: MixDOMTreeNode, maxCount?: number, inNested?: boolean, overHosts?: boolean, validator?: ((treeNode: MixDOMTreeNode) => any) | undefined) => Comp[];
    findElementsIn: <T extends Node = Node>(treeNode: MixDOMTreeNode, maxCount?: number, inNested?: boolean, overHosts?: boolean, validator?: ((treeNode: MixDOMTreeNode) => any) | undefined) => T[];
    queryElementIn: <T_1 extends Element = Element>(treeNode: MixDOMTreeNode, selector: string, inNested?: boolean, overHosts?: boolean) => T_1 | null;
    queryElementsIn: <T_2 extends Element = Element>(treeNode: MixDOMTreeNode, selector: string, maxCount?: number, inNested?: boolean, overHosts?: boolean) => T_2[];
    /** Read html content as string from the given treeNode, component or boundary.
     * Typically used with Host having settings.disableRendering (and settings.renderTimeout = null). */
    readAsString: (from: MixDOMTreeNode | Component | MixDOMBoundary) => string;
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
    classNames: <ValidNames extends string = string, SingleName extends string = ValidNames>(...classNames: (false | "" | 0 | MixDOMPreClassName<ValidNames, SingleName> | null | undefined)[]) => string;
    /** Convert a style cssText string into a dictionary with capitalized keys.
     * - For example: "background-color: #aaa" => { backgroundColor: "#aaa" }.
     * - The dictionary format is used for easy detection of changes.
     *   .. As we want to respect any external changes and just modify based on our own. (For style, class and any attributes.) */
    parseStyle: (cssText: string) => CSSProperties;
    /** General equal comparison with level for deepness.
     * - nDepth: 0. No depth - simple check.
     * - nDepth: 1. Shallow equal.
     * - nDepth: 2. Shallow double equal.
     * - nDepth < 0. Deep. */
    areEqual: (a: any, b: any, nDepth?: number) => boolean;
    /** General inlined deep copy with level for deepness.
     * - nDepth: 0. No depth - pass directly.
     * - nDepth: 1. Shallow copy.
     * - nDepth: 2. Shallow double copy.
     * - nDepth < 0. Deep copy.
     * Note that by design classes (and other functions) are not copied, but class constructors are instanced again and all values applied.
     */
    deepCopy: <T_3 extends unknown = any>(obj: T_3, nDepth?: number) => T_3;
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
    range: (start: number, end?: number | null | undefined, stepSize?: number) => number[];
};

/** Include this once in your project in a file included in TS/TSX compilation:
 *
 * ```
import { JSX as _JSX } from "mix-dom";
declare global {
    namespace JSX {
        interface IntrinsicElements extends _JSX.IntrinsicElements {}
        interface IntrinsicAttributes extends _JSX.IntrinsicAttributes {}
    }
}
```
 */
declare namespace JSX {
    /** This gives support for:
     * - It adds generic support for "_key", "_ref" and "_disable" props (by catch phrase)
     *      * Note however that the "_signals" prop is component specific, so uses the initial props on constructor or func.
     *          * This means, each component should be typed with shortcuts (eg. `ComponentFunc<Info>`). To do it manually initProps should have MixDOMPreComponentProps included.
     *      * Similarly the "_contexts" prop is gotten through the props, even though it's not component specific (though could be, but it's not necessarily desired).
     * - For each dom tag (= HTML & SVG tags), adds their attributes including listeners.
     *      * In addition, for each dom tag adds support for "_signals" related to dom changes.
     */
    interface IntrinsicElements extends IntrinsicAttributesBy {
    }
    /** This is needed for components mostly. The IntrinsicElements gets ignored for them when defines precise typing: eg. (props: SomeProps).
     * - However, IntrinsicAttributes then brings those to all (dom and components), so we provide here the three basic: "_key", "_ref" and "_disable".
     * - We leave "_signals" and "_contexts" to be found on the init props if looks in there. */
    interface IntrinsicAttributes extends MixDOMPreBaseProps {
    }
}

export { Awaited, CSSNumericKeys, CSSProperties, ClassMixer, ClassType, CleanDictionary, CleanDictionaryWith, CombineComponentFuncs, CombineInfosFromComponentFuncs, CombineMixins, Component, ComponentExternalSignals, ComponentFunc, ComponentFuncAny, ComponentFuncExtends, ComponentFuncExtendsType, ComponentFuncMixable, ComponentFuncOf, ComponentFuncRequires, ComponentFuncWith, ComponentHOC, ComponentHOCBase, ComponentInfo, ComponentInstanceType, ComponentMixin, ComponentMixinExtends, ComponentMixinExtendsInfo, ComponentMixinExtendsType, ComponentMixinType, ComponentOf, ComponentShadow, ComponentShadowFunc, ComponentShadowFuncWith, ComponentShadowSignals, ComponentShadowType, ComponentShadowWith, ComponentSignals, ComponentStream, ComponentStreamProps, ComponentStreamType, ComponentType, ComponentTypeAny, ComponentTypeEither, ComponentTypeOf, ComponentTypeWithClass, ComponentWired, ComponentWiredFunc, ComponentWiredType, ComponentWith, ComponentWithClass, Context, ContextAPI, CreateDataPicker, CreateDataSelector, DOMElement, DOMTags, DataExtractor, DataMan, DataManMixin, DataManType, DataSignalMan, DataSignalManMixin, DataSignalManType, Dictionary, Effect, EffectMixin, ExtendComponentFunc, ExtendComponentInfoWith, FirstSplit, GetComponentFuncInfo, GetComponentInfo, GetComponentInfoFromMixins, GetConstructorArgs, GetConstructorReturn, GetJoinedDataKeysFrom, GetJoinedDataKeysFromContexts, GetJoinedSignalKeysFromContexts, HTMLAttributes, HTMLElementType, HTMLSVGAttributes, HTMLSVGAttributesBy, HTMLTags, Host, HostSettings, HostSettingsUpdate, Intersect, IntrinsicAttributesBy, JSX, Join, ListenerAttributeNames, ListenerAttributes, ListenerAttributesAll, MergeClasses, MergeSignalsFromContexts, MixDOM, MixDOMBoundary, MixDOMChangeInfos, MixDOMCloneNodeBehaviour, MixDOMCommonDOMProps, MixDOMCompareDepth, MixDOMComponentPreUpdates, MixDOMComponentTag, MixDOMComponentUpdates, MixDOMContent, MixDOMContentCopy, MixDOMContentEnvelope, MixDOMContentNull, MixDOMContentSimple, MixDOMContentValue, MixDOMContextsAll, MixDOMDOMDiffs, MixDOMDOMProps, MixDOMDefApplied, MixDOMDefAppliedBase, MixDOMDefAppliedPseudo, MixDOMDefBoundary, MixDOMDefContent, MixDOMDefContentInner, MixDOMDefDOM, MixDOMDefElement, MixDOMDefFragment, MixDOMDefHost, MixDOMDefKeyTag, MixDOMDefPass, MixDOMDefPortal, MixDOMDefTarget, MixDOMDefTargetBase, MixDOMDefTargetPseudo, MixDOMDefType, MixDOMDefTypesAll, MixDOMDoubleRenderer, MixDOMHydrationItem, MixDOMHydrationSuggester, MixDOMHydrationValidator, MixDOMPostTag, MixDOMPreBaseProps, MixDOMPreClassName, MixDOMPreComponentOnlyProps, MixDOMPreComponentProps, MixDOMPreDOMProps, MixDOMPreDOMTagProps, MixDOMPreProps, MixDOMPreTag, MixDOMProcessedDOMProps, MixDOMPseudoTag, MixDOMRenderInfo, MixDOMRenderOutput, MixDOMRenderOutputMulti, MixDOMRenderOutputSingle, MixDOMRenderTextContentCallback, MixDOMRenderTextTag, MixDOMRenderTextTagCallback, MixDOMSourceBoundaryChange, MixDOMSourceBoundaryChangeType, MixDOMSourceBoundaryId, MixDOMTreeNode, MixDOMTreeNodeBoundary, MixDOMTreeNodeDOM, MixDOMTreeNodeEmpty, MixDOMTreeNodeHost, MixDOMTreeNodePass, MixDOMTreeNodePortal, MixDOMTreeNodeRoot, MixDOMTreeNodeType, MixDOMUpdateCompareMode, MixDOMUpdateCompareModesBy, NameValidator, NodeJSTimeout, PropType, PseudoElement, PseudoElementProps, PseudoEmpty, PseudoEmptyProps, PseudoEmptyStream, PseudoFragment, PseudoFragmentProps, PseudoPortal, PseudoPortalProps, ReadComponentClassInfo, RecordableType, Ref, RefSignals, ReturnTypes, SVGAriaAttributes, SVGAttributes, SVGAttributesBy, SVGCoreAttributes, SVGElementType, SVGGeneralAttributes, SVGGlobalAttributes, SVGGraphicalEventAttributes, SVGNativeAttributes, SVGPresentationalAttributes, SVGStylingAttributes, SVGTags, SecondSplit, SignalListener, SignalListenerFunc, SignalMan, SignalManFlags, SignalManMixin, SignalManType, Split, SplitOnce, SpreadFunc, SpreadFuncWith, ValidateNames, WithContentInfo, createComponent, createComponentWith, createDataPicker, createDataSelector, createMixin, createShadow, createShadowWith, createSpread, createSpreadWith, createStream, createWired, mergeShadowWiredAPIs, mixComponentClassFuncs, mixComponentClassFuncsWith, mixComponentClassMixins, mixComponentFuncs, mixComponentFuncsWith, mixComponentMixins, mixComponentMixinsWith, mixHOCs, newContext, newContexts, newDef, newEffect, newHost, newRef };
