

// - Imports - //

import {
    Dictionary,
    MixDOMDefTarget,
    MixDOMPreBaseProps,
    MixDOMRenderOutput,
} from "../static/_Types";
import { _Defs } from "../static/_Defs";


// - Types - //

export interface ComponentSpreadProps extends Pick<MixDOMPreBaseProps, "_disable" | "_key"> {}
/** Typing for a SpreadFunc: It's like a Component, except it's spread out immediately on the parent render scope when defined. */
export type SpreadFunc<Props extends Dictionary = {}> = (props: Props) => MixDOMRenderOutput;
/** Typing for a SpreadFunc with extra arguments. Note that it's important to define the JS side as (props, ...args) so that the func.length === 1. 
 * - The idea is to use the same spread function outside of normal render flow: as a static helper function to produce render defs (utilizing the extra args).
 */
export type SpreadFuncWith<Props extends Dictionary = {}, ExtraArgs extends any[] = any[]> = (props: Props, ...args: ExtraArgs) => MixDOMRenderOutput;


// - Functionality - //

/** Create a SpreadFunc - it's actually just a function with 0 or 1 arguments: (props?).
 * - It's the most performant way to render things (no lifecycle, just spread out with its own pairing scope).
 * - Note that this simply gives back the original function, unless it has more than 1 arguments, in which case an intermediary function is created.
 *      * This intermediary function actually supports feeding in more arguments - this works since a func with (props, ...args) actually has length = 1.
 *      * If you want to include the props and extra arguments typing into the resulting function use the createSpreadWith function instead (it also automatically reads the types).
 */
export const createSpread = <Props extends Dictionary = {}>(func: (props: Props, ...args: any[]) => MixDOMRenderOutput): SpreadFunc<Props> =>
    func.length > 1 ? function (props: Props, ...args: any[]) { return func(props, ...args); } : func;
/** Create a SpreadFunc by automatically reading the types for Props and ExtraArgs from the given function. See createSpread for details.
 * - The idea is to use the same spread function outside of normal render flow: as a static helper function to produce render defs (utilizing the extra args).
 */
export const createSpreadWith = <Props extends Dictionary, ExtraArgs extends any[]>(func: (props: Props, ...args: ExtraArgs) => MixDOMRenderOutput): SpreadFuncWith<Props, ExtraArgs> =>
    func.length > 1 ? function (props: Props, ...args: ExtraArgs) { return func(props, ...args); } : func;

/** The method to call and unfold spread func's render defs. (This functionality is paired with other parts in _Apply.)
 * - The returned defs are wrapped in a fragment that provides scoping detection - unless returned null, then also returns null.
 * - The children fed here are the cleaned childDefs that should replace any content pass.
 * - Note that this renders the spread func and then goes over its targetDefs while also copying the new structure and modifying it. */
export function unfoldSpread<Props extends Dictionary = {}>(spreadFunc: SpreadFunc, origProps: ComponentSpreadProps & Props, children: MixDOMDefTarget[]): MixDOMDefTarget | null {
    // Render.
    const { _key, _disable, ...props } = origProps;
    let preDef = _Defs.newDefFrom( spreadFunc(props) );
    if (!preDef)
        return null;
    // We wrap everything in a fragment def marked as its own spread scope.
    const spreadLinks: MixDOMDefTarget["spreadLinks"] & {} = { passes: [], withs: [] };
    const baseDef: MixDOMDefTarget = {
        MIX_DOM_DEF: "fragment",
        childDefs: [ { ...preDef } ],
        scopeType: "spread",
        spreadLinks,
        tag: null
     };
    if (_key != null)
        baseDef.key = _key;
    if (_disable != null)
        baseDef.disabled = _disable;
    // Prepare to loop.
    let toLoop: MixDOMDefTarget[] = [ baseDef ];
    let pDef: MixDOMDefTarget | undefined;
    let hasTruePass = false;
    let iMain = 0;
    const hasKids = !!children[0];
    // Loop defs.
    // .. And copy the new structure as we go.
    while (pDef = toLoop[iMain]) {
        // Next.
        iMain++;
        // No kids - just go to the next (the branch ends - already processed).
        if (!pDef.childDefs[0])
            continue;
        // Prepare to process kids.
        let newLoop: MixDOMDefTarget[] = [];
        const childDefs = pDef.childDefs;
        pDef.childDefs = [];
        // Loop kids.
        for (const thisDef of childDefs) {
            // Prepare.
            let newDef: MixDOMDefTarget & { props?: { hasContent?: boolean | null; }; }; // For easier typing below.

            // Already handled by an inner spread function.
            // .. There's no point in re-processing the same stuff, so we just continue where it left off.
            if (thisDef.spreadLinks) {
                // We reuse the spread's root def directly.
                newDef = thisDef as typeof newDef;
                // If it had any content passes (that were converted to a fragments), just add them to our loop.
                // .. We'll continue where the inner spread left off with the passes.
                newLoop = newLoop.concat(thisDef.spreadLinks.passes);
                // And we handle any WithContent usage with our better knowledge (from up the flow).
                // .. Note that the withs only contains infos for those WithContent components that are in "maybe" state.
                for (const [cDefs, withDef] of thisDef.spreadLinks.withs) {
                    // Update the props with our new value.
                    // .. It's already been copied once (see below), so we can just mutate the props.
                    const hasContent = cDefs && _Defs.hasContentInDefs(cDefs, hasKids);
                    withDef.props.hasContent = !!hasContent;
                    // Add to be checked again by a further parent, if we have one.
                    // .. So we continue to do this up the spreads, until we get a definitive answer for a question nested within.
                    // .. Note that in the end, we should always get a definitive answer, ultimately from the parentmost spread.
                    // .... This is because any "pass" defs were changed to the actual children (right below). So the questions have been answered within.
                    if (hasContent === "maybe")
                        spreadLinks.withs.push([cDefs, withDef]);
                }
            }

            // Handle local content passing.
            // .. Like below, we ignore handling Streams, and handle them in the source boundary instead.
            // .. Note also that for content pass, we don't handle the children - we just insert our pass inside.
            else if (thisDef.MIX_DOM_DEF === "pass" && !thisDef.getStream) {
                // Create new def about a fragment.
                newDef = { MIX_DOM_DEF: "fragment", tag: null, childDefs: [...children] };
                // Add key.
                if (thisDef.key != null)
                    newDef.key = thisDef.key;
                // Mark copy - or that has true pass now.
                if (hasTruePass || thisDef.contentPassType === "copy") {
                    newDef.scopeType = "spread-copy";
                }
                else {
                    newDef.scopeType = "spread-pass";
                    hasTruePass = true;
                }
                // Add to spread bookkeeping.
                spreadLinks.passes.push(newDef);
            }
            // Not content pass.
            else {
                // Copy the def basis.
                // .. Note. It's okay even if is a "pass" for MyStream.Content.
                newDef = { ...thisDef };
                // Only add to the loop if is not a content pass.
                newLoop.push(newDef);
                // Handle conditional - however ignore streams, as we don't know anything about their kids.
                if (thisDef.MIX_DOM_DEF === "boundary" && thisDef.tag["_WithContent"] && !thisDef.tag["_WithContent"].getStream) {
                    // Skip if had been specifically set by the user.
                    // .. Note that in that case any parenting spreads won't recognize this either - see the skip-spreads optimization above.
                    if (newDef.props?.hasContent == null) {
                        // Override the props with our answer.
                        const hasContent = _Defs.hasContentInDefs(children, hasKids);
                        newDef.props = { hasContent: !!hasContent, ...newDef.props };
                        // Add to our links if needs more processing.
                        if (hasContent === "maybe")
                            spreadLinks.withs.push([children, newDef as any]);
                    }
                }
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
