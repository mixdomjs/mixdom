

// - Imports - //

import {
    MixDOMProcessedDOMProps,
    MixDOMDefTarget,
    MixDOMDefType,
    MixDOMDefApplied,
    MixDOMPreTag,
    MixDOMComponentTag,
    MixDOMRenderOutput,
    MixDOMContentValue,
    Dictionary,
    DOMTags,
    MixDOMPreComponentProps,
    MixDOMPreDOMTagProps,
    MixDOMPreBaseProps,
} from "./_Types";
import { _Lib } from "./_Lib";
import {
    PseudoPortalProps,
    PseudoElementProps,
    PseudoContextsProps
} from "../classes/ComponentPseudos";
import { ContentClosure } from "../classes/ContentClosure";
import { Ref } from "../classes/Ref";
import { Host } from "../classes/Host";
import {
    unfoldSpread,
    SpreadFunc
} from "../classes/ComponentSpread";


// - Exports - //

/** Create a rendering definition. Supports receive direct JSX compiled output. */
export function newDef<DOMTag extends DOMTags>(domTag: DOMTag, origProps?: MixDOMPreDOMTagProps<DOMTag> | null, ...contents: MixDOMRenderOutput[]): MixDOMDefTarget | null;
export function newDef<Props extends Dictionary>(componentTag: MixDOMComponentTag<Props>, origProps?: (MixDOMPreComponentProps & Props) | null, ...contents: MixDOMRenderOutput[]): MixDOMDefTarget | null;
export function newDef<Props extends MixDOMPreDOMTagProps | MixDOMPreComponentProps>(tag: MixDOMPreTag, origProps?: Props | null, ...contents: MixDOMRenderOutput[]): MixDOMDefTarget | null;
// export function newDef<Props extends HTMLSVGAttributes | MixDOMPreComponentProps>(tag: DOMTags | ComponentTypeAny<Props>, origProps?: Props | null, ...contents: MixDOMRenderOutput[]): MixDOMDefTarget | null;
// export function newDef<DOMTag extends DOMTags, Props extends HTMLSVGAttributes<DOMTag> | MixDOMPreComponentProps>(tag: DOMTag | ComponentTypeAny<Props>, origProps?: Props | null, ...contents: MixDOMRenderOutput[]): MixDOMDefTarget | null;
export function newDef(tagOrClass: MixDOMPreTag, origProps: Dictionary | null = null, ...contents: MixDOMRenderOutput[]): MixDOMDefTarget | null {
    // Get type.
    const defType = _Defs.getMixDOMDefType(tagOrClass);
    if (!defType || origProps && (origProps as MixDOMPreBaseProps)._disable)
        return null;
    // Add childDefs to the def.
    const childDefs: MixDOMDefTarget[] = [];
    let wasText = false;
    let iContent = 0;
    for (const content of contents) {
        // Let's join adjacent string content together - there's no need to create a textNode for each.
        // .. This improves performance: 1. less dom operations, 2. less stuff (= less processing).
        let isText = typeof content === "string";
        if (content && isText && wasText) {
            childDefs[iContent-1].domContent += content as string;
            continue;
        }
        // Create def.
        const def = _Defs.newDefFromContent(content);
        if (def) {
            iContent = childDefs.push(def);
            wasText = isText;
        }
    }

    // Static, render immediately and return the def.
    if (defType === "spread")
        return unfoldSpread(tagOrClass as SpreadFunc, origProps || {}, childDefs);

    // Special case - return null, if the def is practically an empty fragment (has no simple content either).
    // .. Note that due to how the flow works, this functions like a "remove empty fragments recursively" feature.
    // .... This is because the flow goes up: first children defs are created, then they are fed to its parent def's creation as content, and so on.
    // .... So we don't need to do (multiple) recursions down, but instead do a single check in each scope, and the answer is ready when it's the parent's turn.
    if (defType === "fragment" && !childDefs[0])
        return null;

    // Create the basis for the def.
    const tag = defType === "dom" && tagOrClass as DOMTags || defType === "boundary" && tagOrClass as MixDOMComponentTag || defType === "element" && "_" || (defType === "content" ? "" : null);
	const targetDef = {
        MIX_DOM_DEF: defType,
        tag,
        childDefs
	} as MixDOMDefTarget;

    // Props.
    const needsProps = !!tag;
    if (targetDef.MIX_DOM_DEF === "fragment") {
        if (origProps && origProps.withContent)
            targetDef.withContent = origProps.withContent;
    }
    else if (origProps) {
        // Copy.
        const { _key, _ref, _contexts, _signals, _disable, ...passProps } = origProps;
        if (_key != null)
            targetDef.key = _key;
        if (_ref) {
            const forwarded: Ref[] = [];
            if (_ref.constructor["MIX_DOM_CLASS"] === "Ref")
                forwarded.push(_ref as Ref);
            else {
                for (const f of (_ref as Ref[]))
                    if (f && f.constructor["MIX_DOM_CLASS"] === "Ref" && forwarded.indexOf(f) === -1)
                        forwarded.push(f);
            }
            targetDef.attachedRefs = forwarded;
        }
        if (_contexts && defType === "boundary")
            targetDef.attachedContexts = { ..._contexts };
        if (_signals) // Note. These will only be handled for "boundary" and dom-like.
            targetDef.attachedSignals = { ..._signals };
        if (needsProps)
            targetDef.props = typeof tag === "string" ? _Lib.cleanDOMProps(passProps) : passProps as MixDOMProcessedDOMProps;
    }
    // Empty props.
    else if (needsProps)
        targetDef.props = {};

    // Specialities.
    switch(targetDef.MIX_DOM_DEF) {
        case "portal": {
            const props = (origProps || {}) as PseudoPortalProps;
            targetDef.domPortal = props.container || null;
            break;
        }
        case "contexts": {
            targetDef.contexts = (origProps || {} as PseudoContextsProps).cascade || null;
            break;
        }
        case "element": {
            const props = (origProps || {}) as PseudoElementProps;
            targetDef.domElement = props.element || null;
            targetDef.domCloneMode = props.cloneMode != null ? (typeof props.cloneMode === "boolean" ? (props.cloneMode ? "deep" : "") : props.cloneMode) : null;
            delete targetDef.props["element"];
            delete targetDef.props["cloneMode"];
            break;
        }
    }
    // Return def.
    return targetDef;
}

export const _Defs = {

    // - CREATE DEFS - //

    /** Note that "content" and "host" defs are created from the ...contents[], while "pass" type comes already as a def.
     * .. This gives any other type. If there's no valid type, returns "". */
    getMixDOMDefType(tag: MixDOMPreTag): MixDOMDefType | "spread" | "" {
        // Dom.
        if (typeof tag === "string")
            return "dom";
        // Functions.
        const mixDOMClass = tag["MIX_DOM_CLASS"];
        if (!mixDOMClass)
            return typeof tag === "function" ? (tag.length >= 2 ? "boundary" : "spread") : "";
        // Class/Mixin or pseudo class.
        switch(mixDOMClass) {
            // Boundaries.
            case "Component":
            case "Stream":
                return "boundary";
            // For others below, we return the lower case type as it fits MixDOMDefType.
            case "Fragment":
            case "Portal":
            case "Element":
            case "Contexts": // Note that "Context" as singular should not appear here anymore after v1.7.0.
            case "Host":
                return mixDOMClass.toLowerCase() as MixDOMDefType;
            // Empty or other.
            // case "Empty":
            default:
                return "";
        }
    },

    // Returns null only if has no tagOrClass and no contentPass defined.
    newDef,

    // Create a def out of the content.
    newDefFromContent(renderContent: MixDOMRenderOutput): MixDOMDefTarget | null {

        // Object type.
        if (renderContent && (typeof renderContent === "object")) {
            // Def - we check it first, because it's the most common. (Although typescript would prefer it below by neglating other options.)
            if (typeof renderContent["MIX_DOM_DEF"] === "string") {
                // We pass defs directly, as they contents have been cleaned already.
                // .. At least for practical performance reasons, we assume that - let's not account for external def hacks.
                return renderContent as MixDOMDefTarget;
            }
            // Dom node.
            if (renderContent instanceof Node) {
                return {
                    MIX_DOM_DEF: "content",
                    tag: "",
                    childDefs: [],
                    domContent: renderContent
                };
            }
            // Host.
            if (renderContent.constructor["MIX_DOM_CLASS"] === "Host") {
                return {
                    MIX_DOM_DEF: "host",
                    tag: null,
                    host: renderContent as Host,
                    key: renderContent, // Unique key, so does wide.
                    childDefs: [],
                };
            }
            // Is an array or array like.
            if (Array.isArray(renderContent) || renderContent instanceof HTMLCollection || renderContent instanceof NodeList) {
                // Process array with localKeys support.
                const childDefs = [...renderContent].map(item => _Defs.newDefFromContent(item)).filter(def => def) as MixDOMDefTarget[];
                if (!childDefs.length)
                    return null;
                // Create a single fragment item to hold the array and mark as array.
                return {
                    MIX_DOM_DEF: "fragment",
                    tag: null,
                    isArray: true,
                    childDefs
                };
            }
            // Otherwise it's unknown data, stringify it.
            renderContent = String(renderContent) as MixDOMContentValue;
        }
        // Is simple content as a string or number.
        if (renderContent != null)
            return {
                MIX_DOM_DEF: "content",
        		tag: "",
                domContent: renderContent,
                childDefs: [],
        	};
        // Is empty.
        return null;
    },

    /** Copies everything from targetDef that defines its type, but not any "updatable" properties (except key). */
    newAppliedDefBy(targetDef: MixDOMDefTarget, contentClosure: ContentClosure | null): MixDOMDefApplied {
        // Basics.
        const aDef = {
            MIX_DOM_DEF: targetDef.MIX_DOM_DEF,
            tag: targetDef.tag,
            childDefs: [],
            action: "mounted"
        } as MixDOMDefApplied;
        if (targetDef.key != null)
            aDef.key = targetDef.key;
        // Other non-changing based on type.
        if (aDef.MIX_DOM_DEF === "fragment") {
            if (targetDef.isArray)
                aDef.isArray = true;
            if (targetDef.scopeType)
                aDef.scopeType = targetDef.scopeType;
            if (targetDef.withContent !== undefined)
                aDef.withContent = targetDef.withContent;
        }
        // Content pass.
        else if (aDef.MIX_DOM_DEF === "pass") {
            if (targetDef.getContentStream) {
                aDef.getContentStream = targetDef.getContentStream;
                aDef.contentPass = targetDef.contentPass || null;
            }
            else
                aDef.contentPass = targetDef.contentPass || contentClosure || null;
        }
        // Host.
        else if (targetDef.host)
            aDef.host = targetDef.host;
        // Return applied def ready to go.
        return aDef;
    },

    newContentPassDef(key?: any, isCopy? : boolean): MixDOMDefTarget {
        // Create basis.
        const def: MixDOMDefTarget = {
            MIX_DOM_DEF: "pass",
            tag: null,
            childDefs: [],
            contentPassType: isCopy ? "copy" : "pass",
        };
        // Apply key.
        if (key != null)
            def.key = key;
        // We always need to have a key for true content pass.
        // .. and it should be unique and common to all MixDOM.Content defs unless specifically given a key.
        else if (!isCopy)
            def.key = _Defs.ContentKey;
        // Return def.
        return def;
    },

    newContentCopyDef(key?: any): MixDOMDefTarget {
        return _Defs.newContentPassDef(key, true);
    },

    // A unique but common to all key for MixDOM.Content defs - used unless specifically given a key.
    ContentKey: {}

}


// // - Testing - //
// //
// // newDef("fail", { "style": {color: "#aac"} });
// // newDef("FAIL", { "style": {color: "#aac"} });
// newDef("span", { "style": {color: "#aac"} });
// // newDef("span", { "styleFAIL": {color: "#aac"} });
// // newDef("span", { "styleFAIL": {color: "#aac"} as const } as const);
// // newDef("span", { "class": true });
// newDef("span", { "class": "true" });
// // newDef("span", { "style": {colorFAIL: "#aac"} });
// // newDef("span", { "style": {colorFAIL: "#aac" } as const } as const);
//
// import { Component } from "../classes/Component";
// import { Context } from "../classes/Context";
// import { MixDOM } from "../MixDOM";
// import { MixDOMContextsAll } from "../static/_Types";
//
// interface TestProps { test: boolean; }
// const Test = (props: TestProps) => {
//     return null;
// }
// class TestClass extends Component<TestProps> {}
// newDef(Test, { test: true });
// // newDef(Test, { testFAIL: true }); // Fails correctly!
// newDef(TestClass, { test: true });
// // newDef(TestClass, { testFAIL: true }); // Fails correctly!
//
// const contexts = { "test": new Context() };
// newDef(MixDOM.Contexts, { cascade: contexts });
// // newDef(MixDOM.Contexts, { cascadeFAIL: { "test": new Context() } }); // Fails correctly!
// newDef(MixDOM.Fragment, { withContent: true });
// // newDef(MixDOM.Fragment, { withContentFAIL: true }); // Fails correctly!
//
