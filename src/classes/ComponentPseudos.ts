

// - Imports - //

import {
    DOMTags,
    MixDOMCloneNodeBehaviour,
    MixDOMPreDOMTagProps,
    MixDOMRenderOutput,
    MixDOMDefTarget,
} from "../static/_Types";
import { ComponentTypeEither } from "./Component";
import { ComponentStreamProps, ComponentStreamType } from "./ComponentStream";


// - Export pseudo classes - //
//
// These have props class member just for typescript TSX, as these classes will never be instanced (only their static side used).
// .. So even though they are used like: <MixDOM.Portal />, the MixDOM.Portal class is actually never instanced.
// .. Instead it's just turned into a target def describing portal (or other) functionality - as the features are handled directly (for better performance).

export interface MixDOMPrePseudoProps {
    /** Disable the def altogether - including all contents inside. (Technically makes the def amount to null.) */
    _disable?: boolean;
    /** Attach key for moving the def around. */
    _key?: any;
}


// - Fragment - //

export interface PseudoFragmentProps extends MixDOMPrePseudoProps { }
/** Fragment represent a list of render output instead of stuff under one root.
 * Usage example: `<MixDOM.Fragment><div/><div/></MixDOM.Fragment>` */
export class PseudoFragment<Props extends PseudoFragmentProps = PseudoFragmentProps> {
    public static MIX_DOM_CLASS = "Fragment";
    public readonly props: Props;
    constructor(_props: Props) {}
}


// - Portal - //

export interface PseudoPortalProps extends MixDOMPrePseudoProps {
    container: Node | null;
}
/** Portal allows to insert the content into a foreign dom node.
 * Usage example: `<MixDOM.Portal container={myDOMElement}><div/></MixDOM.Portal>` */
export class PseudoPortal<Props extends PseudoPortalProps = PseudoPortalProps> {
    public static MIX_DOM_CLASS = "Portal";
    public readonly props: Props;
    constructor(_props: Props) { }
}


// - Element - //

export type PseudoElementProps<Tag extends DOMTags = DOMTags> = MixDOMPreDOMTagProps<Tag> & {
    element: HTMLElement | SVGElement | null;
    /** Determines what happens when meeting duplicates.
     * - If == null, uses the Host based setting.
     * - If boolean, then is either "deep" or nothing. */
    cloneMode?: boolean | MixDOMCloneNodeBehaviour | null;
};
/** This allows to use an existing dom element as if it was part of the system.
 * So you can modify its props and such. */
export class PseudoElement<Tag extends DOMTags = DOMTags, Props extends PseudoElementProps<Tag> = PseudoElementProps<Tag>> {
    public static MIX_DOM_CLASS = "Element";
    public readonly props: Props;
    constructor(_props: Props) { }
}


// - Empty - //

/** Empty dummy component that accepts any props, but always renders null. */
export interface PseudoEmptyProps extends Record<string, any> {}
export class PseudoEmpty<Props extends PseudoEmptyProps = PseudoEmptyProps> {
    public static MIX_DOM_CLASS = "Empty";
    public readonly props: Props;
    constructor(_props: Props) { }
    render(): MixDOMRenderOutput { return null; }
}


// - EmptyStream - //

/** This is an empty dummy stream class:
 * - Its purpose is to make writing render output easier (1. no empty checks, and 2. for typing):
 *     * For example: `const MyStream = component.state.PopupStream || MixDOM.EmptyStream;`
 *     * You can then access the Content and ContentCopy members, and copyContent(key) and withContent(...contents) methods fluently.
 * - However, they will just return null, so won't have any effect on anything.
 *     * Note also that technically speaking this class extends PseudoEmpty.
 *     * And it only adds the 2 public members (Content and ContentCopy) and 2 public methods (copycontent and withContent).
 *     * Due to not actually being a stream, it will never be used as a stream. It's just a straw dog.
 * - If you need to distinguish between real and fake, use `isStream()` method. The empty returns false.
 *     * For example, to set specific content listening needs, you can use a memo - run it on render or .onBeforeUpdate callback.
 *     * Memo onMount: `(NewStream: ComponentStreamType) => NewStream.isStream() && component.contentAPI.needsFor(NewStream, true);`
 *     * Memo onUnmount: `(OldStream: ComponentStreamType) => OldStream.isStream() && component.contentAPI.needsFor(OldStream, null);`
 */
export const PseudoEmptyStream = class extends PseudoEmpty<ComponentStreamProps> {
    public static Content: MixDOMDefTarget | null = null;
    public static ContentCopy: MixDOMDefTarget | null = null;
    public static copyContent = (_key?: any): MixDOMDefTarget | null => null;
    public static WithContent: ComponentTypeEither<{props: { hasContent?: boolean; }}> = (_initProps, _comp) => null;
    public static isStream(): boolean { return false; }
} as unknown as ComponentStreamType;
