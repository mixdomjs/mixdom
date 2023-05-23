

// - Imports - //

import {
    Dictionary,
    RecordableType,
    CSSProperties,
    ClassType,
    MixDOMProcessedDOMProps,
    MixDOMPreClassName,
    MixDOMUpdateCompareMode,
    MixDOMCommonDOMProps,
    NodeJSTimeout,
} from "./_Types";


// - Exports - //

// Enums.
/** For quick getting modes to depth for certain uses (Effect and DataPicker).
 * - Positive values can go however deep. Note that -1 means deep, but below -2 means will not check.
 * - Values are: "never" = -3, "always" = -2, "deep" = -1, "changed" = 0, "shallow" = 1, "double" = 2. */
export enum MixDOMCompareDepth {
    never = -3,
    always = -2,
    deep = -1,
    changed = 0,
    shallow = 1,
    double = 2,
};

export const _Lib = {


    COMPLEX_DOM_PROPS: {
        style: true,
        data: true
    },

    // - General tools - //

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
    range(start: number, end?: number | null, stepSize: number = 1): number[] {
        // Only length given.
        if (end == null)
            [end, start] = [start, 0];
        // Go in reverse.
        const range: number[] = [];
        if (end < start) {
            for (let i=start-1; i>=end; i -= stepSize)
                range.push(i);
        }
        // Fill directly.
        else
            for (let i=start; i<end; i += stepSize)
                range.push(i);
        // Return range.
        return range;
    },

    // Thanks to: https://stackoverflow.com/questions/24758284/how-to-change-camelcase-to-slug-case-or-kabob-case-via-regex-in-javascript
    /**
     * - With "-" as replaceBy, functions like this: "testProp" => "test-prop", and "TestProp" => "-test-prop".
     * - This behaviour mirrors how element.dataset[prop] = value works. For example: data.TestProp = true   =>   <div data--test-prop="true" />  */
    decapitalize(str: string, replaceBy: string = ""): string {
        return str.replace(/([A-Z])/g, replaceBy + "$1").toLowerCase();
    },

    /** Builds a record of { [key]: trueFalseLike }, which is useful for internal quick checks. */
    buildRecordable<T extends string = any>(types: RecordableType<T>): Partial<Record<T, any>> {
        if (types.constructor === Object)
            return types as Partial<Record<T, any>>;
        const tTypes: Partial<Record<T, any>> = {};
        for (const type of types as Iterable<T>)
            tTypes[type] = true;
        return tTypes;
    },

    // /** Extends the base class with methods from other classes - last constructor gets applied.
    //  * - This is from: https://www.typescriptlang.org/docs/handbook/mixins.html
    //  */
    // extendClassMethods(BaseClass, withClasses: ClassType[]): void {
    //     withClasses.forEach((ThisClass) => {
    //         Object.getOwnPropertyNames(ThisClass.prototype).forEach((name) => {
    //             Object.defineProperty(
    //                 BaseClass.prototype,
    //                 name,
    //                 Object.getOwnPropertyDescriptor(ThisClass.prototype, name) ||
    //                 Object.create(null)
    //             );
    //         });
    //     });
    // },


    // - Data helpers - //

    // /** Helper to get in data by a dotted string. */
    // getInData(origData: Dictionary, dataKey: string, fallback?: any): any {
    //     // Special case.
    //     if (!dataKey)
    //         return origData as any;
    //     // Split keys.
    //     const dataKeys = dataKey.split(".");
    //     let data = origData as Record<string, any>;
    //     for (const key of dataKeys) {
    //         if (!data)
    //             return fallback as any;
    //         data = data[key];
    //     }
    //     // Return deep data.
    //     return data === undefined ? fallback : data as any;
    // },
    // 
    // /** Helper to set in data by a dotted string. Do not provide an empty dataKey, will not do anything. */
    // setInData(origData: Dictionary, dataKey: string, subData: any, extend: boolean = false): void {
    //     // Root - let's not do it.
    //     if (!dataKey) {
    //         // for (const prop in subData)
    //         //     origData[prop] = subData;
    //         // for (const prop in origData)
    //         //     if (!subData.hasOwnProperty(prop))
    //         //         delete origData[prop];
    //         return;
    //     }
    //     // Prepare.
    //     const dataKeys = dataKey.split(".");
    //     const lastKey = dataKeys.pop();
    //     // .. Handle invalid case. We need to have last key.
    //     if (!lastKey)
    //         return;
    //     // Get data parent.
    //     let data = origData as Record<string, any>;
    //     for (const key of dataKeys)
    //         data = data[key] || (data[key] = {});
    //     // Extend.
    //     if (extend) {
    //         const last = data[lastKey];
    //         if (!last || last.constructor !== Object)
    //             extend = false;
    //         else
    //             data[lastKey] = {...last, ...subData as object};
    //     }
    //     // Set.
    //     if (!extend)
    //         data[lastKey] = subData;
    // },


    // - Refresh timer logic - //

    /** Generic helper for classes with timer and method to call to execute rendering with a very specific logic.
     * - Returns the value that should be assigned as the stored timer (either existing one, new one or null). */
    callWithTimeout<Obj extends object, Timer extends number | NodeJSTimeout>(obj: Obj, callback: (this: Obj) => void, currentTimer: Timer | null, defaultTimeout: number | null, forceTimeout?: number | null): Timer | null {
        // Clear old timer if was given a specific forceTimeout (and had a timer).
        if (currentTimer !== null && forceTimeout !== undefined) {
            clearTimeout(currentTimer);
            currentTimer = null;
        }
        // Execute immediately.
        const timeout = forceTimeout === undefined ? defaultTimeout : forceTimeout;
        if (timeout === null)
            callback.call(obj);
        // Or setup a timer - unless already has a timer to be reused.
        else if (currentTimer === null)
            currentTimer = setTimeout(() => callback.call(obj), timeout) as Timer;
        // Return the timer.
        return currentTimer;
    },

    
    // - HTML props - //

    cleanDOMProps<Props extends Dictionary & Pick<MixDOMCommonDOMProps, "class" | "className" | "style"> = {}>(origProps: Props, copy?: boolean): MixDOMProcessedDOMProps & Props {
        // Copy.
        const props = copy ? { ...origProps } : origProps;
        // Class.
        if (props.class)
            props.className = props.className ? props.class + " " + props.className : props.class;
        delete props.class;
        // Style.
        if (typeof props.style === "string")
            props.style = _Lib.cleanDOMStyle(props.style);
        // Return cleaned.
        return props as MixDOMProcessedDOMProps & Props;
    },

    // Help from: https://stackoverflow.com/questions/8987550/convert-css-text-to-javascript-object
    cleanDOMStyle(cssText: string): CSSProperties {
        const text = cssText.replace(/\/\*(.|\s)*?\*\//g, " ").replace(/\s+/g, " ").trim();
        if (!text)
            return {};
        const style: CSSProperties = {};
        const properties = text.split(";").map(o => o.split(":").map(x => x && x.trim()));
        for (const [prop, val] of properties)
            if (prop)
                style[prop.replace(/\W+\w/g, match => match.slice(-1).toUpperCase())] = val;
        return style;
    },

    /** Returns a string to be used as class name (with no duplicates and optional nested TypeScript verification).
     * - Each item in the classNames can be:
     *     1. ValidName (single className string),
     *     2. Array<ValidName>,
     *     3. Record<ValidName, any>.
     *     + If you want to use the validation only for Arrays and Records but not Strings, add 2nd parameter `string` to the type: `classNames<ValidName, string>`
     * - Unfortunately, the name validation inputted here only works for Array and Record types, and single strings.
     * - To use concatenated class name strings (eg. "bold italic"), you should:
     *     1. Declare a validator by: `const classNames: ValidateNames<ValidName> = MixDOM.classNames;`
     *     2. Then use it like this: `const okName = classNames("bold italic", ["bold"], {"italic": false, "bold": true})`;
     */
    cleanDOMClass<ValidNames extends string = string, SingleName extends string = ValidNames>(...classNames: Array<MixDOMPreClassName<ValidNames, SingleName> | "" | false | 0 | null | undefined>): string {
        // Collect all to a dictionary.
        const record: Record<string, true> = {};
        for (const name of classNames)
            if (name)
                _Lib.collectNamesTo(name, record, " ");
        // Return the valid keys joined by space - the collectNamesTo makes sure there's no duplicates nor empties.
        return Object.keys(record).join(" ");
    },

    /** Collects unique names as dictionary keys with value `true` for each found.
     * The names are assumed to be:
     * 1. String (use stringSplitter),
     * 2. Iterable of string names, or an iterable of this type itself (recursively).
     * 3. Record where names are keys, values tells whether to include or not. */
    collectNamesTo(names: MixDOMPreClassName, record: Record<string, true>, stringSplitter: string = ""): void {
        // Note, this assumes names is not empty (especially not null or "").
        switch(typeof names) {
            // String, split by empty spaces.
            case "string": {
                if (stringSplitter) {
                    for (const name of names.split(stringSplitter))
                        if (name)
                            record[name] = true;
                }
                else
                    record[names] = true;
                break;
            }
            case "object": {
                // Dictionary like.
                if (names.constructor === Object) {
                    for (const name in names as Dictionary)
                        if (name && names[name])
                            record[name] = true;
                }
                // Array like.
                else {
                    // It's just a simple array - not recursive anymore, because the typing didn't work that nicely with deep stuff / recursion.
                    // .. So we just iterate each, split by " " and collect.
                    for (const cName of names as Iterable<string>) {
                        if (cName && typeof cName === "string") {
                            if (stringSplitter) {
                                for (const name of cName.split(stringSplitter))
                                    if (name)
                                        record[name] = true;
                            }
                            else
                                record[cName] = true;
                        }
                    }
                    // for (const preName of names as Iterable<MixDOMPreClassName>)
                    //     if (preName)
                    //         _Lib.collectNamesTo(preName, record, stringSplitter);
                }
                break;
            }
        }
    },

    /** Get diffs in class names in the form of: Record<string, boolean>, where true means added, false removed, otherwise not included.
     * - Note. This process only checks for changes - it ignores changes in order completely. */
    getClassNameDiffs(origName?: string, newName?: string): Record<string, boolean> | null {
        // Quick check.
        origName = origName || "";
        newName = newName || "";
        if (origName === newName)
            return null;
        // Prepare outcome.
        const origNames = origName.split(" ");
        const newNames = newName.split(" ");
        const diffs = {};
        // Removed.
        let did: null | boolean = null;
        if (origNames)
    		for (const name of origNames) {
    			if (name && (!newNames || newNames.indexOf(name) === -1))
    				diffs[name] = did = false;
    		}
        // Added.
        if (newNames)
    		for (const name of newNames) {
    			if (name && (!origNames || origNames.indexOf(name) === -1))
    				diffs[name] = did = true;
    		}
        // Return diffs if has any.
        return did !== null ? diffs : null;
    },

    getDictionaryDiffs<T extends Dictionary>(orig: Partial<T>, update: Partial<T>): Partial<T> | null {
        // Collect.
        const diffs: Partial<T> = {};
        let hasDiffs = false;
        // .. Deleted.
        for (const prop in orig) {
            const origValue = orig[prop];
            if (origValue !== undefined && update[prop] === undefined) {
                diffs[prop] = undefined;
                hasDiffs = true;
            }
	    }
        // .. Added or changed.
        for (const prop in update) {
            const newValue = update[prop];
            if (orig[prop] !== newValue) {
                diffs[prop] = newValue;
                hasDiffs = true;
            }
        }
        return hasDiffs ? diffs : null;
    },


    /** Inlined comparison method specialized into domProps (attributes of a dom element). */
    equalDOMProps(a: MixDOMProcessedDOMProps, b: MixDOMProcessedDOMProps): boolean {
        // Handle complex properties.
        for (const prop in _Lib.COMPLEX_DOM_PROPS) {
            // .. At least a has the complex prop.
            if (a[prop]) {
                // But b has no the complex prop.
                if (!b[prop])
                    return false;
                // Compare complex data (as shallow dictionaries).
                const aData = a[prop];
                const bData = b[prop];
                // .. Added or changed.
                if (aData !== bData) {
            		for (const prop in bData) {
            			if (aData[prop] !== bData[prop])
            				return false;
            		}
                    // .. Deleted.
            		for (const prop in aData) {
            			if (bData[prop] === undefined && aData[prop] !== undefined)
            				return false;
            		}
                }
            }
            // .. Only b has style.
            else if (b[prop])
                return false;
        }
        // All else.
        // .. Added or changed.
        for (const prop in b) {
            if (a[prop] !== b[prop] && !_Lib.COMPLEX_DOM_PROPS[prop])
                return false;
        }
        // .. Deleted.
        for (const prop in a) {
            if (b[prop] === undefined && a[prop] !== undefined && !_Lib.COMPLEX_DOM_PROPS[prop])
                return false;
        }
        return true;
    },


    // - Comparison helpers - //

    /** Helper to compare a dictionary against another by a dictionary of update modes (only compares the propeties of this dictionary).
     * - Returns false if had differences. Note that in "always" mode even identical values are considered different, so returns true for any. 
     * - -2 always, -1 deep, 0 changed, 1 shallow, 2 double, ... See the MixDOMUpdateCompareMode type for details. */
    equalDictionariesBy(from: Dictionary | null | undefined, to: Dictionary | null | undefined, compareBy: Record<string, MixDOMUpdateCompareMode | number | any>): boolean {
        // Loop each prop key in the compareBy dictionary.
        const eitherEmpty = !from || !to;
        for (const prop in compareBy) {
            // Prepare.
            const mode = compareBy[prop];
            const nMode = typeof mode === "number" ? mode : MixDOMCompareDepth[mode as string] as number ?? 0;
            // Never (-3) and always (-2) modes. The outcome is flipped as we're not asking about change but equality.
            if (nMode < -1) {
                if (nMode === -2)
                    return false;
                continue;
            }
            // Always different - so never equal.
            if (nMode === -2)
                return false;
            // Special case. If either was empty, return true (= equal) if both were empty, false (= not equal) otherwise.
            if (eitherEmpty)
                return !from && !to;
            // Changed.
            if (nMode === 0) {
                if (from[prop] !== to[prop])
                    return false;
            }
            // Otherwise use the library method.
            else if (!_Lib.areEqual(from[prop], to[prop], nMode))
                return false;
        }
        // All that were checked were equal.
        return true;
    },
    

    // - Equality - //

    /** General inlined equal with level for deepness.
     * - nDepth: 0. No depth - simple check.
     * - nDepth: 1. Shallow equal.
     * - nDepth: 2. Shallow double equal.
     * - nDepth < 0. Deep. */
    areEqual(a: any, b: any, nDepth = -1): boolean {
        // Identical.
        if (a === b)
            return true;
        // Object.
        if (a && nDepth && typeof a === "object") {
            // Incompatible.
            if (!b || typeof b !== "object")
                return false;
            // Check constructor.
            // .. Note that for classes, we would do this specifically anyway.
            // .. In other words, classes get handled without any specific rules: by this check and below like an object.
            const constr = a.constructor;
            if (constr !== b.constructor)
                return false;
            // Next level.
            nDepth--;
            // Prepare subtype.
            let isArr = false;
            switch(constr) {
                case Object:
                    break;
                case Array:
                    isArr = true;
                    break;
                case Set:
                    isArr = true;
                    a = [...a];
                    b = [...b];
                    break;
                case Map:
                    if (a.size !== b.size)
                        return false;
                    for (const [k, v] of a) {
                        if (!b.has(k))
                            return false;
                        if (nDepth ? !_Lib.areEqual(b.get(k), v, nDepth) : b.get(k) !== v)
                            return false;
                    }
                    return true;
                default:
                    // Array like.
                    const subType = a.toString();
                    if (subType === "[object NodeList]" || subType === "[object HTMLCollection]")
                        isArr = true;
                    break;
            }
            // Array like.
            if (isArr) {
                const count = a.length;
                if (count !== b.length)
                    return false;
                for (let i=0; i<count; i++)
                    if (nDepth ? !_Lib.areEqual(a[i], b[i], nDepth) : a[i] !== b[i])
                        return false;
            }
            // Anything object-like - hoping that works for anything else.
            // .. Note. This works for arrays as well (though slower), but NodeList and HTMLCollection has extras. And not for Sets nor Maps.
            else {
                // Added or changed.
                for (const p in b) {
                    if (!a.hasOwnProperty(p))
                        return false;
                    if (nDepth ? !_Lib.areEqual(a[p], b[p], nDepth) : a[p] !== b[p])
                        return false;
                }
                // Deleted.
                for (const p in a) {
                    if (!b.hasOwnProperty(p))
                        return false;
                }
            }
            // No diffs found.
            return true;
        }
        // Otherwise not equal, because are not objects and were not identical (checked earlier already).
        return false;
    },

    /** General inlined deep copy with level for deepness.
     * - nDepth: 0. No depth - pass directly.
     * - nDepth: 1. Shallow copy.
     * - nDepth: 2. Shallow double copy.
     * - nDepth < 0. Deep copy. (Defaults to -1, so deep.)
     * Note that by design classes (and other functions) are not copied, but class constructors are instanced again and all values applied.
     */
    deepCopy<T extends any = any>(obj: T, nDepth = -1): T {
        // Simple.
        if (!obj || !nDepth || typeof obj !== "object")
            return obj;
        // Next level.
        nDepth--;
        // Prepare subtype.
        let arr: any[] | null = null;
        switch(obj.constructor) {
            case Object:
                break;
            case Array:
                arr = obj as any[];
                break;
            case Set:
                return new Set(!nDepth ? obj as unknown as Set<any> : [...(obj as unknown as Set<any>)].map(item => _Lib.deepCopy(item, nDepth)) ) as T;
            case Map:
                return new Map(!nDepth ? obj as unknown as Map<any, any> : [...(obj as unknown as Map<any, any>)].map(([key, item]) => [_Lib.deepCopy(key, nDepth), _Lib.deepCopy(item, nDepth) ]) ) as T;
            default:
                // Array like - note that it's an illegal constructor to use: new obj.constructor() for these types (or using: new NodeList() likewise for the same reason).
                const subType = obj.toString();
                if (subType === "[object NodeList]" || subType === "[object HTMLCollection]")
                    arr = [...obj as any[]];
                break;
        }
        // Array or array like.
        if (arr)
            return (nDepth ? arr.map(item => _Lib.deepCopy(item, nDepth)) : [...arr as any[]]) as T;
        // Object (dictionary) like.
        // .. Shallow.
        if (!nDepth)
            return { ...obj };
        // .. Deeper - with support to keep constructor (might not work for all, but it's more correct than changing the constructor).
        const newObj: Record<string, any> = new (obj.constructor as ClassType)();
        for (const prop in obj)
            newObj[prop] = _Lib.deepCopy(obj[prop], nDepth);
        return newObj as T;
    },

}


// // - Constrained mixins - //
// 
// These were made before realizing the constrained mixins on TypeScript docs only refer to methods, and simply overriding them.
// .. There's not much point in these with such strong constraints (especially how constructor is dealt with).
// .. And the typing would have to be corrected to reflect the situation.  ... So just dropped.
// 
// /** This extends the base class with given classes, but does _not_ return a new class (mostly for typing), but it's actually the original class after mutations. Typing supports up to 8 classes, javascript has no limit. */
// export function extendClass<Base extends ClassType, A extends ClassType>(BaseClass: Base, ...withClasses: [A]): MergeClasses<Base & A>;
// export function extendClass<Base extends ClassType, A extends ClassType, B extends ClassType>(BaseClass: Base, ...withClasses: [A, B]): MergeClasses<Base, A, B>;
// export function extendClass<Base extends ClassType, A extends ClassType, B extends ClassType, C extends ClassType>(BaseClass: Base, ...withClasses: [A, B, C]): MergeClasses<Base, A, B, C>;
// export function extendClass<Base extends ClassType, A extends ClassType, B extends ClassType, C extends ClassType, D extends ClassType>(BaseClass: Base, ...withClasses: [A, B, C, D]): MergeClasses<Base, A, B, C, D>;
// export function extendClass<Base extends ClassType, A extends ClassType, B extends ClassType, C extends ClassType, D extends ClassType, E extends ClassType>(BaseClass: Base, ...withClasses: [A, B, C, D, E]): MergeClasses<Base, A, B, C, D, E>;
// export function extendClass<Base extends ClassType, A extends ClassType, B extends ClassType, C extends ClassType, D extends ClassType, E extends ClassType, F extends ClassType>(BaseClass: Base, ...withClasses: [A, B, C, D, E, F]): MergeClasses<Base, A, B, C, D, E, F>;
// export function extendClass<Base extends ClassType, A extends ClassType, B extends ClassType, C extends ClassType, D extends ClassType, E extends ClassType, F extends ClassType, G extends ClassType>(BaseClass: Base, ...withClasses: [A, B, C, D, E, F, G]): MergeClasses<Base, A, B, C, D, E, F, G>;
// export function extendClass<Base extends ClassType, A extends ClassType, B extends ClassType, C extends ClassType, D extends ClassType, E extends ClassType, F extends ClassType, G extends ClassType, H extends ClassType>(BaseClass: Base, ...withClasses: [A, B, C, D, E, F, G, H]): MergeClasses<Base, A, B, C, D, E, F, G, H>;
// export function extendClass(BaseClass: ClassType, ...withClasses: ClassType[]): ClassType {
//     _Lib.extendClassMethods(BaseClass, withClasses);
//     return BaseClass;
// }
// 
// /** This merges many classes together into a new class. Typing supports up to 8 classes, javascript has no limit. */
// export function mergeClasses<A extends ClassType>(...classes: [A]): A;
// export function mergeClasses<A extends ClassType, B extends ClassType>(...classes: [A, B]): MergeClasses<A, B>;
// export function mergeClasses<A extends ClassType, B extends ClassType, C extends ClassType>(...classes: [A, B, C]): MergeClasses<A, B, C>;
// export function mergeClasses<A extends ClassType, B extends ClassType, C extends ClassType, D extends ClassType>(...classes: [A, B, C, D]): MergeClasses<A, B, C, D>;
// export function mergeClasses<A extends ClassType, B extends ClassType, C extends ClassType, D extends ClassType, E extends ClassType>(...classes: [A, B, C, D, E]): MergeClasses<A, B, C, D, E>;
// export function mergeClasses<A extends ClassType, B extends ClassType, C extends ClassType, D extends ClassType, E extends ClassType, F extends ClassType>(...classes: [A, B, C, D, E, F]): MergeClasses<A, B, C, D, E, F>;
// export function mergeClasses<A extends ClassType, B extends ClassType, C extends ClassType, D extends ClassType, E extends ClassType, F extends ClassType, G extends ClassType>(...classes: [A, B, C, D, E, F, G]): MergeClasses<A, B, C, D, E, F, G>;
// export function mergeClasses<A extends ClassType, B extends ClassType, C extends ClassType, D extends ClassType, E extends ClassType, F extends ClassType, G extends ClassType, H extends ClassType>(...classes: [A, B, C, D, E, F, G, H]): MergeClasses<A, B, C, D, E, F, G, H>;
// export function mergeClasses(...classes: ClassType[]): ClassType {
//     const BaseClass = class _BaseClass {}
//     _Lib.extendClassMethods(BaseClass, classes);
//     return BaseClass;
// }

