

// - Imports - //

import {
    MixDOMUpdateCompareMode,
    ReturnTypes
} from "../static/_Types";
import { MixDOMCompareDepth, _Lib } from "../static/_Lib";


// - Optional extra types - //

export type DataExtractor<P extends any[] = any[], R = any> = (...args: P) => R;

/** This helps to create a typed data picker by providing the types for the Params for extractor and Data for output of the selector.
 * - The type return is a function that can be used for triggering the effect (like in Redux).
 * - The extractor can return an array up to 10 typed members.
 */
// export type CreateDataPicker<Params extends any[] = any[], Data = any> = <
//     Extractor extends (...args: Params) => any[] | readonly any[],
//     Extracted extends ReturnType<Extractor> = ReturnType<Extractor>
// >(extractor: Extractor, selector: (...args: Extracted) => Data, depth?: number | MixDOMUpdateCompareMode) => (...args: Params) => Data;
export type CreateDataPicker<Params extends any[] = any[], Data = any> = <
    Extractor extends
        ((...args: Params) => [any]) | 
        ((...args: Params) => [any, any]) | 
        ((...args: Params) => [any, any, any]) | 
        ((...args: Params) => [any, any, any, any]) | 
        ((...args: Params) => [any, any, any, any, any]) | 
        ((...args: Params) => [any, any, any, any, any, any]) | 
        ((...args: Params) => [any, any, any, any, any, any, any]) | 
        ((...args: Params) => [any, any, any, any, any, any, any, any]) | 
        ((...args: Params) => [any, any, any, any, any, any, any, any, any]) | 
        ((...args: Params) => [any, any, any, any, any, any, any, any, any, any]),
    Extracted extends ReturnType<Extractor> = ReturnType<Extractor>
>(extractor: Extractor, selector: (...args: Extracted) => Data, depth?: number | MixDOMUpdateCompareMode) => (...args: Params) => Data;

/** This helps to create a fully typed data selector with multiple extractors (each outputting any value) as an array.
 * - It returns a callback that can be used for selecting (like in Redux).
 * - The typing supports up to 10 extractors.
 */
export type CreateDataSelector<Params extends any[], Data extends any> =
    <Extractors extends
        [DataExtractor<Params>] |
        [DataExtractor<Params>, DataExtractor<Params>] | 
        [DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>] | 
        [DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>] | 
        [DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>] |
        [DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>] |
        [DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>] |
        [DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>] |
        [DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>] | 
        [DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>]
    >(extractors: Extractors, selector: (...args: ReturnTypes<Extractors>) => Data, depth?: number | MixDOMUpdateCompareMode) => (...args: Params) => Data;


// - Creator functions - //

/** Create a data picker (returns a function): It's like Effect but for data with an intermediary extractor.
 * - Give an extractor that extracts an array out of your customly defined arguments. Can return an array up to 10 typed members or more with `[...] as const` trick.
 * - Whenever the extracted output has changed (in shallow sense by default), the selector will be run.
 * - The arguments of the selector is the extracted array spread out, and it should return the output data solely based on them.
 * - The whole point of this abstraction, is to trigger the presumably expensive selector call only when the cheap extractor func tells there's a change.
 */
export const createDataPicker = <
    Extracted extends // any[] | readonly any[]
        [any] |
        [any, any] |
        [any, any, any] |
        [any, any, any, any] |
        [any, any, any, any, any] |
        [any, any, any, any, any, any] |
        [any, any, any, any, any, any, any] |
        [any, any, any, any, any, any, any, any] |
        [any, any, any, any, any, any, any, any, any] |
        [any, any, any, any, any, any, any, any, any, any] | 
        readonly any[],
    Data extends any,
    Params extends any[],
>(extractor: (...args: Params) => Extracted, selector: (...args: Extracted) => Data, depth: number | MixDOMUpdateCompareMode = 1): (...args: Params) => Data => {
    // Prepare.
    let extracted: any[] | readonly any[] = [];
    let data: Data = undefined as any;
    // Clean depth.
    const d = typeof depth === "string" ? MixDOMCompareDepth[depth] : depth;
    // Return a function to do the selecting.
    return (...args: any[]): Data => {
        // Extract new extracts.
        const newExtracted = extractor(...args as any);
        // Check extracts have changed - if not, return old outcome.
        // .. If depth is -2 , we are in "always" mode, if lower in "never" mode, and so no need to check in either.
        if (d < -1) {
            // In never mode, never update.
            if (d !== -2)
                return data;
        }
        else if (_Lib.areEqual(newExtracted, extracted, d))
            return data;
        // Got through - set new extracts, recalc and store new outcome by the selector.
        extracted = newExtracted;
        data = selector(...extracted as any);
        // Return the new data.
        return data;
    };
}

/** Create a data selector: It's like the DataPicker above, but takes in an array of extractors (not just one).
 * - Accordingly the outputs of extractors are then spread out as the arguments for the selector.
 */
export const createDataSelector = <
    Extractors extends
        [DataExtractor<Params>] |
        [DataExtractor<Params>, DataExtractor<Params>] | 
        [DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>] | 
        [DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>] | 
        [DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>] |
        [DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>] |
        [DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>] |
        [DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>] |
        [DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>] | 
        [DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>, DataExtractor<Params>],
    Data extends any,
    Params extends any[] = Parameters<Extractors[number]>,
>(extractors: Extractors, selector: (...args: ReturnTypes<Extractors>) => Data, depth: number | MixDOMUpdateCompareMode = 1): (...args: Params) => Data =>
    createDataPicker((...args) => extractors.map(e => e && e(...args as any)) as any, selector, depth);


// // - Testing: DataPicker - //
// 
// // Prepare.
// type MyParams = [colorMode?: "light" | "dark", typeScript?: boolean];
// type MyData = { theme: "dark" | "light"; typescript: boolean; }
// 
// // With pre-typing.
// const codeViewDataPicker =
//     (createDataPicker as CreateDataPicker<MyParams, MyData>)(
//     // Extractor - showcases the usage for contexts.
//     // .. For example, if has many components with similar context data needs.
//     (colorMode, typeScript) => [
//         colorMode || "dark",
//         typeScript || false,
//     ],
//     // Picker - it's only called if the extracted data items were changed from last time.
//     (theme, typescript) => ({ theme, typescript })
// );
// 
// // With manual typing.
// const codeViewDataPicker_MANUAL = createDataPicker(
//     // Extractor.
//     (...[colorMode, typeScript]: MyParams) => [
//         colorMode || "dark",
//         typeScript || false,
//     ],
//     // Picker.
//     (theme, typescript): MyData => ({ theme, typescript })
// );
// 
// // All work.
// const val = codeViewDataPicker("dark", true);
// const val_FAIL = codeViewDataPicker("FAIL", true);
// const val_MANUAL = codeViewDataPicker_MANUAL("dark", true);
// const val_MANUAL_FAIL = codeViewDataPicker_MANUAL("FAIL", true);


// // - Testing: DataSelector - //
// 
// // Prepare.
// type MyParams = [colorMode?: "light" | "dark", typeScript?: boolean];
// type MyData = { theme: "dark" | "light"; typescript: boolean; }
// 
// // With pre-typing.
// const codeViewDataSelector = (createDataSelector as CreateDataSelector<MyParams, MyData>)(
//     // Extractors.
//     [
//         (colorMode, _typeScript) => colorMode || "dark",
//         (_colorMode, typeScript) => typeScript || false,
//     ], // No trick.
//     // Selector.
//     (theme, typescript) => ({ theme, typescript })
// );
// 
// // With manual typing.
// const codeViewDataSelector_MANUAL = createDataSelector(
//     // Extractors.
//     [
//         (colorMode: "light" | "dark", _typeScript: boolean) => colorMode || "dark",
//         (...[_colorMode, typeScript]: MyParams) => typeScript || false,
//     ], // No trick.
//     // Selector.
//     (theme, typescript): MyData => ({ theme, typescript })
// );
// 
// // All work.
// const sel = codeViewDataSelector("dark", true);
// const sel_FAIL = codeViewDataSelector("FAIL", true); // Here only "FAIL" is red-underlined.
// const sel_MANUAL = codeViewDataSelector_MANUAL("dark", true);
// const sel_MANUAL_FAIL = codeViewDataSelector_MANUAL("FAIL", true); // Only difference is that both: ("FAIL", true) are red-underlined.
