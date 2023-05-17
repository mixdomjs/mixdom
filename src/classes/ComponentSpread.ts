

// - Imports - //

import {
    Dictionary,
    MixDOMDefTarget,
    MixDOMPreBaseProps,
    MixDOMRenderOutput,
} from "../static/_Types";
import { _Defs } from "../static/_Defs";

/** Create a ComponentSpread - it's actually just a function with 0 or 1 arguments: (props?).
 * - It's the most performant way to render things (no lifecycle, just spread out with its own pairing scope).
 * - Note that this simply gives back the original function, unless it has more than 1 arguments, in which case an intermediary arrow function is created.
 * - Note also that spread functions actually receive a dictionary for the "this" keyword: { props, children }
 */
export const createSpread = <Props extends Dictionary = {}>(func: (this: ComponentSpread<Props>, props: Props, ...args: any[]) => MixDOMRenderOutput) =>
    func.length > 1 ? function (this: { props: Props, children: MixDOMDefTarget[]; }, props: Props) { return func.call(this, props); } : func;

export interface ComponentSpreadProps extends Pick<MixDOMPreBaseProps, "_disable" | "_key"> {}

/** ComponentSpread interface describes the `this` for spread functions (unless arrow funcs), providing additional on-the-flow information. */
export interface ComponentSpread<Props> {
    props: Props;
    children: MixDOMDefTarget[];
}
export type SpreadFunc<Props extends Dictionary = {}> = ((this: ComponentSpread<Props>, props: Props) => MixDOMRenderOutput); // & { Props?: Props; };
// export type SpreadFunc<Props extends Dictionary = {}> = ((this: ComponentSpread<Props>, props: ComponentSpreadProps & Props) => MixDOMRenderOutput); // & { Props?: Props; };


/** The method to call and unfold spread func's render defs. (This functionality is paired with other parts in _Apply.)
 * - The returned defs are wrapped in a fragment that provides scoping detection - unless returned null, then also returns null.
 * - The children fed here are the cleaned childDefs that should replace any content pass.
 * - Note that this renders the spread func and then goes over its targetDefs while also copying the new structure and modifying it. */
export function unfoldSpread<Props extends Dictionary = {}>(spreadFunc: SpreadFunc, origProps: ComponentSpreadProps & Props, children: MixDOMDefTarget[]): MixDOMDefTarget | null {
    // Render.
    const { _key, _disable, ...props } = origProps;
    let preDef = _Defs.newDefFromContent( spreadFunc.call({ props, children } as ComponentSpread<Props>, props) );
    if (!preDef)
        return null;
    // We wrap everything in a fragment def marked as its own spread scope.
    const baseDef: MixDOMDefTarget = { MIX_DOM_DEF: "fragment", childDefs: [ { ...preDef } ], scopeType: "spread", tag: null };
    if (_key != null)
        baseDef.key = _key;
    if (_disable != null)
        baseDef.disabled = _disable;
    // Prepare to loop.
    let toLoop: MixDOMDefTarget[] = [ baseDef ];
    let pDef: MixDOMDefTarget | undefined;
    let hasTruePass = false;
    let iMain = 0;
    const noContents = !children.length;
    // Loop defs.
    // .. And copy the new structure as we go.
    while (pDef = toLoop[iMain]) {
        // Next.
        iMain++;
        // No kids - just go to the next (the branch ends - already processed).
        if (!pDef.childDefs[0])
            continue;
        // Prepare to process kids.
        const newLoop: MixDOMDefTarget[] = [];
        const childDefs = pDef.childDefs;
        pDef.childDefs = [];
        // Loop kids.
        for (const thisDef of childDefs) {
            // Prepare.
            let newDef: MixDOMDefTarget;
            // Handle local content passing.
            // .. Like below, we ignore handling Streams, and handle them in the source boundary instead.
            // .. Note also that for content pass, we don't handle the children - we just insert our pass inside.
            if (thisDef.MIX_DOM_DEF === "pass" && !thisDef.getContentStream) {
                // Create new def about a fragment.
                newDef = { MIX_DOM_DEF: "fragment", tag: null, childDefs: [...children] };
                // Add key.
                if (thisDef.key != null)
                    newDef.key = thisDef.key;
                // Mark copy - or that has true pass now.
                if (hasTruePass || thisDef.contentPassType === "copy")
                    newDef.scopeType = "spread-copy";
                else {
                    newDef.scopeType = "spread-pass";
                    hasTruePass = true;
                }
            }
            // Not content pass.
            else {
                // Copy the def basis.
                newDef = { ...thisDef };
                // Handle children dependent.
                // .. Note that if is about Stream, we just let it be - as it's not about the contents fed to us.
                if (thisDef.MIX_DOM_DEF === "fragment" && thisDef.withContent !== undefined && typeof thisDef.withContent !== "function") {
                    // Include / don't include kids.
                    if (noContents)
                        newDef.childDefs = [];
                    // In any case, delete the withContent mark, as we already handled it here on the static def side - must not be handled again.
                    // .. For Streams, this clause is not run and we just let it be there (as it was not handled).
                    delete newDef.withContent;
                }
                // Only add to the loop if is not a content pass.
                newLoop.push(newDef);
            }
            // Add.
            pDef.childDefs.push(newDef);
        }
        // Add to the loop, and cut earlier off.
        toLoop = newLoop.concat(toLoop.slice(iMain));
        iMain = 0;
    }
    // Return target - we might have modified it.
    return baseDef;
}
