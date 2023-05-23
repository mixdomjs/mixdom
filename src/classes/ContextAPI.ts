

// - Imports - //

import {
    PropType,
    Dictionary,
    RecordableType,
    SplitOnce,
    FirstSplit,
    SecondSplit,
    GetJoinedDataKeysFrom,
} from "../static/_Types";
import { SignalSendAsReturn, SignalListenerFunc, SignalsRecord, SignalBoy, SignalListener } from "./SignalMan";
import { _Lib } from "../static/_Lib";
import { _Apply } from "../static/_Apply";
import { Context, newContext, newContexts } from "./Context";
import { DataListenerFunc } from "./DataMan";


// - Helper types - //

export type MixDOMContextsAll = Record<string, Context<any, SignalsRecord>>;
export type MixDOMContextsAllOrNull<AllContexts extends MixDOMContextsAll = {}> = { [Name in keyof AllContexts]: AllContexts[Name] | null; };

// This works by iteration data down beforehands and can thus be used to offer suggestions for each data key.
export type GetJoinedDataKeysFromContexts<Contexts extends MixDOMContextsAll> = {[CtxName in string & keyof Contexts]: GetJoinedDataKeysFrom<Contexts[CtxName]["data"], CtxName>}[string & keyof Contexts];
export type GetJoinedSignalKeysFromContexts<Contexts extends MixDOMContextsAll> = {[CtxName in string & keyof Contexts]: keyof Contexts[CtxName]["_Signals"] extends string ? `${CtxName}.${keyof Contexts[CtxName]["_Signals"]}` : never; }[string & keyof Contexts];

// Local helper types.
export type MergeSignalsFromContexts<Ctxs extends MixDOMContextsAll> = {
    [Key in string & GetJoinedSignalKeysFromContexts<Ctxs>]: [Ctxs[FirstSplit<Key, ".">]["_Signals"][SecondSplit<Key, ".">]] extends [SignalListenerFunc] ? Ctxs[FirstSplit<Key, ".">]["_Signals"][SecondSplit<Key, ".">] : never;
    // [Key in string & GetJoinedSignalKeysFromContexts<Ctxs>]: Ctxs[FirstSplit<Key, ".">]["_Signals"][SecondSplit<Key, ".">]; 
    // <-- This shorter one is not enough for the compiled module.d.ts. Does not satisfy SignalsRecord otherwise.
};

// These work by using the given data key location types.
type GetDataByContextString<Key extends string, Contexts extends MixDOMContextsAll> = GetDataByContextKeys<SplitOnce<Key, ".">, Contexts>;
type GetDataByContextKeys<CtxKeys extends string[], Contexts extends MixDOMContextsAll> = 
    [CtxKeys[0]] extends [keyof Contexts] ? 
        [CtxKeys[1]] extends [string] ?
            PropType<Contexts[CtxKeys[0]]["data"], CtxKeys[1], never>
        : Contexts[CtxKeys[0]]["data"]
    : never;

    
// - Class - //

/** ContextAPI looks like it has full SignalMan and DataMan capabilities but only extends SignalBoy internally.
 * - It has all the same methods, but does not have .data member and data listening can have a fallback array.
 * - All data keys and signal names should start with "contextName.", for example: "settings.theme" data key or "navigation.onFocus" signal.
 */
export class ContextAPI<Contexts extends MixDOMContextsAll = {}, CtxSignals extends SignalsRecord = MergeSignalsFromContexts<Contexts>> extends SignalBoy<CtxSignals> {
    

    // - Members - //

    /** Data needs mapping using the callback as the key and value contains the data needs. The data needs are also used as to get the argument values for the callback. */
    public dataListeners: Map<DataListenerFunc, [ needs: string[], fallbackArgs?: any[] ]>;
    /** All the contexts assigned to us.
     * - They also have a link back to us by context.contextAPIs, with this as the key and context names as the values. 
     * - Note that can also set `null` value here - for purposefully excluding an inherited context (when using one contextAPI to inherit contexts from another).
     *      * But `undefined` will never be found in here - if gives to the setContext, it means deleting the entry from the record. */
    public contexts: Partial<Record<string, Context<any, SignalsRecord> | null>>;


    // - Initialize - //

    constructor(contexts?: Partial<Contexts>) {
        super();
        this.contexts = { ...contexts };
        this.dataListeners = new Map();
    }


    // - Overrideable - //

    /** This triggers a refresh and returns a promise that is resolved when the update / render cycle is completed.
     * - If there's nothing pending, then will resolve immediately. 
     * - This uses the signals system, so the listener is called among other listeners depending on the adding order.
     * - Note that this method is overrideable. On the basic implementation it resolves immediately.
     *      * However, on the Host.contextAPI it's tied to the Host's update / render cycle - and serves as the bridge for syncing (to implement "delay" signals). */
     public afterRefresh(fullDelay?: boolean, forceTimeout?: number | null): Promise<void>;
     public afterRefresh(_fullDelay: boolean = false, _forceTimeout?: number | null): Promise<void> {
        return new Promise<void>(async (resolve) => resolve());
     }
 

    // - Send signals - //

    /** Emit a signal. Does not return a value. Use `sendSignalAs(modes, ctxSignalName, ...args)` to refine the behaviour. */
    public sendSignal<
        CtxSignalName extends string & keyof CtxSignals,
        CtxName extends keyof Contexts & FirstSplit<CtxSignalName, ".">,
        SignalName extends string & SecondSplit<CtxSignalName, ".">,
    >(ctxSignalName: CtxSignalName, ...args: Parameters<Contexts[CtxName]["_Signals"][SignalName]>): void {
        const [ctxName, signalName] = ctxSignalName.split(".", 2);
        return this.getContext(ctxName)?.sendSignal(signalName, ...args);
    }
    
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
    public sendSignalAs<
        CtxSignalName extends string & keyof CtxSignals,
        Mode extends "" | "pre-delay" | "delay" | "await" | "last" | "first" | "first-true" | "multi" | "no-false" | "no-null",
        HasAwait extends boolean = Mode extends string[] ? Mode[number] extends "await" ? true : false : Mode extends "await" ? true : false,
        HasLast extends boolean = Mode extends string[] ? Mode[number] extends "last" ? true : false : Mode extends "last" ? true : false,
        HasFirst extends boolean = Mode extends string[] ? Mode[number] extends "first" ? true : Mode[number] extends "first-true" ? true : false : Mode extends "first" ? true : Mode extends "first-true" ? true : false,
        HasMulti extends boolean = Mode extends string[] ? Mode[number] extends "multi" ? true : false : Mode extends "multi" ? true : false,
        HasDelay extends boolean = Mode extends string[] ? Mode[number] extends "delay" ? true : false : Mode extends "delay" ? true : false,
        HasPreDelay extends boolean = Mode extends string[] ? Mode[number] extends "pre-delay" ? true : false : Mode extends "pre-delay" ? true : false,
        UseSingle extends boolean = true extends HasMulti ? false : HasFirst | HasLast,
        UseReturnVal extends boolean = true extends HasAwait ? true : true extends HasDelay | HasPreDelay ? false : true
    >(modes: Mode | Mode[], ctxSignalName: CtxSignalName, ...args: Parameters<CtxSignals[CtxSignalName]>): true extends UseReturnVal ? SignalSendAsReturn<ReturnType<CtxSignals[CtxSignalName]>, HasAwait, UseSingle> : undefined {
        const [ctxName, signalName] = ctxSignalName.split(".", 2);
        const ctx = this.getContext(ctxName);
        if (ctx)
            return ctx.sendSignalAs(modes, signalName, ...args) as any;
        const m: string[] = typeof modes === "string" ? [modes] : modes;
        const r = m.includes("last") || m.includes("first") || m.includes("first-true") ? undefined : [];
        return m.includes("await") ? new Promise(resolve => resolve(r)) as any : r as any;
    }


    // - Listen to data - //

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
    // public listenToData<
    //     Key1 extends CheckDataByContextString<Key1, Contexts>,
    //     Fallback extends [ fall1?: GetDataByContextString<Key1, Contexts> | null ],
    //     Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0]) => void,
    // >(dataKey1: Key1, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    // public listenToData<
    //     Key1 extends CheckDataByContextString<Key1, Contexts>,
    //     Key2 extends CheckDataByContextString<Key2, Contexts>,
    //     Fallback extends [ fall1?: GetDataByContextString<Key1, Contexts> | null, fall2?: GetDataByContextString<Key2, Contexts> | null ],
    //     Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0], val2: GetDataByContextString<Key2, Contexts> | Fallback[1]) => void,
    //     >(dataKey1: Key1, dataKey2: Key2, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    // public listenToData<
    //     Key1 extends CheckDataByContextString<Key1, Contexts>,
    //     Key2 extends CheckDataByContextString<Key2, Contexts>,
    //     Key3 extends CheckDataByContextString<Key3, Contexts>,
    //     Fallback extends [ fall1?: GetDataByContextString<Key1, Contexts> | null, fall2?: GetDataByContextString<Key2, Contexts> | null, fall3?: GetDataByContextString<Key3, Contexts> | null  ],
    //     Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0], val2: GetDataByContextString<Key2, Contexts> | Fallback[1], val3: GetDataByContextString<Key3, Contexts> | Fallback[2]) => void,
    //     >(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    // public listenToData<
    //     Key1 extends CheckDataByContextString<Key1, Contexts>,
    //     Key2 extends CheckDataByContextString<Key2, Contexts>,
    //     Key3 extends CheckDataByContextString<Key3, Contexts>,
    //     Key4 extends CheckDataByContextString<Key4, Contexts>,
    //     Fallback extends [ fall1?: GetDataByContextString<Key1, Contexts> | null, fall2?: GetDataByContextString<Key2, Contexts> | null, fall3?: GetDataByContextString<Key3, Contexts> | null, fall4?: GetDataByContextString<Key4, Contexts> | null  ],
    //     Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0], val2: GetDataByContextString<Key2, Contexts> | Fallback[1], val3: GetDataByContextString<Key3, Contexts> | Fallback[2], val4: GetDataByContextString<Key4, Contexts> | Fallback[3]) => void,
    //     >(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    // public listenToData<
    //     Key1 extends CheckDataByContextString<Key1, Contexts>,
    //     Key2 extends CheckDataByContextString<Key2, Contexts>,
    //     Key3 extends CheckDataByContextString<Key3, Contexts>,
    //     Key4 extends CheckDataByContextString<Key4, Contexts>,
    //     Key5 extends CheckDataByContextString<Key5, Contexts>,
    //     Fallback extends [ fall1?: GetDataByContextString<Key1, Contexts> | null, fall2?: GetDataByContextString<Key2, Contexts> | null, fall3?: GetDataByContextString<Key3, Contexts> | null, fall4?: GetDataByContextString<Key4, Contexts> | null, fall5?: GetDataByContextString<Key5, Contexts> | null  ],
    //     Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0], val2: GetDataByContextString<Key2, Contexts> | Fallback[1], val3: GetDataByContextString<Key3, Contexts> | Fallback[2], val4: GetDataByContextString<Key4, Contexts> | Fallback[3], val5: GetDataByContextString<Key5, Contexts> | Fallback[4]) => void,
    //     >(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, dataKey5: Key5, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    // public listenToData<
    //     Key1 extends CheckDataByContextString<Key1, Contexts>,
    //     Key2 extends CheckDataByContextString<Key2, Contexts>,
    //     Key3 extends CheckDataByContextString<Key3, Contexts>,
    //     Key4 extends CheckDataByContextString<Key4, Contexts>,
    //     Key5 extends CheckDataByContextString<Key5, Contexts>,
    //     Key6 extends CheckDataByContextString<Key6, Contexts>,
    //     Fallback extends [ fall1?: GetDataByContextString<Key1, Contexts> | null, fall2?: GetDataByContextString<Key2, Contexts> | null, fall3?: GetDataByContextString<Key3, Contexts> | null, fall4?: GetDataByContextString<Key4, Contexts> | null, fall5?: GetDataByContextString<Key5, Contexts> | null, fall6?: GetDataByContextString<Key6, Contexts> | null ],
    //     Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0], val2: GetDataByContextString<Key2, Contexts> | Fallback[1], val3: GetDataByContextString<Key3, Contexts> | Fallback[2], val4: GetDataByContextString<Key4, Contexts> | Fallback[3], val5: GetDataByContextString<Key5, Contexts> | Fallback[4], val6: GetDataByContextString<Key6, Contexts> | Fallback[5]) => void,
    //     >(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, dataKey5: Key5, dataKey6: Key6, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    // public listenToData<
    //     Key1 extends CheckDataByContextString<Key1, Contexts>,
    //     Key2 extends CheckDataByContextString<Key2, Contexts>,
    //     Key3 extends CheckDataByContextString<Key3, Contexts>,
    //     Key4 extends CheckDataByContextString<Key4, Contexts>,
    //     Key5 extends CheckDataByContextString<Key5, Contexts>,
    //     Key6 extends CheckDataByContextString<Key6, Contexts>,
    //     Key7 extends CheckDataByContextString<Key7, Contexts>,
    //     Fallback extends [ fall1?: GetDataByContextString<Key1, Contexts> | null, fall2?: GetDataByContextString<Key2, Contexts> | null, fall3?: GetDataByContextString<Key3, Contexts> | null, fall4?: GetDataByContextString<Key4, Contexts> | null, fall5?: GetDataByContextString<Key5, Contexts> | null, fall6?: GetDataByContextString<Key6, Contexts> | null, fall7?: GetDataByContextString<Key7, Contexts> | null ],
    //     Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0], val2: GetDataByContextString<Key2, Contexts> | Fallback[1], val3: GetDataByContextString<Key3, Contexts> | Fallback[2], val4: GetDataByContextString<Key4, Contexts> | Fallback[3], val5: GetDataByContextString<Key5, Contexts> | Fallback[4], val6: GetDataByContextString<Key6, Contexts> | Fallback[5], val7: GetDataByContextString<Key7, Contexts> | Fallback[6]) => void,
    //     >(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, dataKey5: Key5, dataKey6: Key6, dataKey7: Key6, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    // public listenToData<
    //     Key1 extends CheckDataByContextString<Key1, Contexts>,
    //     Key2 extends CheckDataByContextString<Key2, Contexts>,
    //     Key3 extends CheckDataByContextString<Key3, Contexts>,
    //     Key4 extends CheckDataByContextString<Key4, Contexts>,
    //     Key5 extends CheckDataByContextString<Key5, Contexts>,
    //     Key6 extends CheckDataByContextString<Key6, Contexts>,
    //     Key7 extends CheckDataByContextString<Key7, Contexts>,
    //     Key8 extends CheckDataByContextString<Key8, Contexts>,
    //     Fallback extends [ fall1?: GetDataByContextString<Key1, Contexts> | null, fall2?: GetDataByContextString<Key2, Contexts> | null, fall3?: GetDataByContextString<Key3, Contexts> | null, fall4?: GetDataByContextString<Key4, Contexts> | null, fall5?: GetDataByContextString<Key5, Contexts> | null, fall6?: GetDataByContextString<Key6, Contexts> | null, fall7?: GetDataByContextString<Key7, Contexts> | null, fall8?: GetDataByContextString<Key8, Contexts> | null ],
    //     Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0], val2: GetDataByContextString<Key2, Contexts> | Fallback[1], val3: GetDataByContextString<Key3, Contexts> | Fallback[2], val4: GetDataByContextString<Key4, Contexts> | Fallback[3], val5: GetDataByContextString<Key5, Contexts> | Fallback[4], val6: GetDataByContextString<Key6, Contexts> | Fallback[5], val7: GetDataByContextString<Key7, Contexts> | Fallback[6], val8: GetDataByContextString<Key8, Contexts> | Fallback[7]) => void,
    //     >(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, dataKey5: Key5, dataKey6: Key6, dataKey7: Key6, dataKey8: Key8, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
 
    // Alternative. Using pre-suggested keys for better typing experience.
    public listenToData<
        Keys extends GetJoinedDataKeysFromContexts<Contexts>,
        Key1 extends Keys,
        Fallback extends [ fall1?: GetDataByContextString<Key1, Contexts> | null ],
        Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0]) => void,
    >(dataKey1: Key1, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    public listenToData<
        Keys extends GetJoinedDataKeysFromContexts<Contexts>,
        Key1 extends Keys,
        Key2 extends Keys,
        Fallback extends [ fall1?: GetDataByContextString<Key1, Contexts> | null, fall2?: GetDataByContextString<Key2, Contexts> | null ],
        Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0], val2: GetDataByContextString<Key2, Contexts> | Fallback[1]) => void,
        >(dataKey1: Key1, dataKey2: Key2, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    public listenToData<
        Keys extends GetJoinedDataKeysFromContexts<Contexts>,
        Key1 extends Keys,
        Key2 extends Keys,
        Key3 extends Keys,
        Fallback extends [ fall1?: GetDataByContextString<Key1, Contexts> | null, fall2?: GetDataByContextString<Key2, Contexts> | null, fall3?: GetDataByContextString<Key3, Contexts> | null  ],
        Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0], val2: GetDataByContextString<Key2, Contexts> | Fallback[1], val3: GetDataByContextString<Key3, Contexts> | Fallback[2]) => void,
        >(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    public listenToData<
        Keys extends GetJoinedDataKeysFromContexts<Contexts>,
        Key1 extends Keys,
        Key2 extends Keys,
        Key3 extends Keys,
        Key4 extends Keys,
        Fallback extends [ fall1?: GetDataByContextString<Key1, Contexts> | null, fall2?: GetDataByContextString<Key2, Contexts> | null, fall3?: GetDataByContextString<Key3, Contexts> | null, fall4?: GetDataByContextString<Key4, Contexts> | null  ],
        Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0], val2: GetDataByContextString<Key2, Contexts> | Fallback[1], val3: GetDataByContextString<Key3, Contexts> | Fallback[2], val4: GetDataByContextString<Key4, Contexts> | Fallback[3]) => void,
        >(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    public listenToData<
        Keys extends GetJoinedDataKeysFromContexts<Contexts>,
        Key1 extends Keys,
        Key2 extends Keys,
        Key3 extends Keys,
        Key4 extends Keys,
        Key5 extends Keys,
        Fallback extends [ fall1?: GetDataByContextString<Key1, Contexts> | null, fall2?: GetDataByContextString<Key2, Contexts> | null, fall3?: GetDataByContextString<Key3, Contexts> | null, fall4?: GetDataByContextString<Key4, Contexts> | null, fall5?: GetDataByContextString<Key5, Contexts> | null  ],
        Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0], val2: GetDataByContextString<Key2, Contexts> | Fallback[1], val3: GetDataByContextString<Key3, Contexts> | Fallback[2], val4: GetDataByContextString<Key4, Contexts> | Fallback[3], val5: GetDataByContextString<Key5, Contexts> | Fallback[4]) => void,
        >(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, dataKey5: Key5, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    public listenToData<
        Keys extends GetJoinedDataKeysFromContexts<Contexts>,
        Key1 extends Keys,
        Key2 extends Keys,
        Key3 extends Keys,
        Key4 extends Keys,
        Key5 extends Keys,
        Key6 extends Keys,
        Fallback extends [ fall1?: GetDataByContextString<Key1, Contexts> | null, fall2?: GetDataByContextString<Key2, Contexts> | null, fall3?: GetDataByContextString<Key3, Contexts> | null, fall4?: GetDataByContextString<Key4, Contexts> | null, fall5?: GetDataByContextString<Key5, Contexts> | null, fall6?: GetDataByContextString<Key6, Contexts> | null ],
        Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0], val2: GetDataByContextString<Key2, Contexts> | Fallback[1], val3: GetDataByContextString<Key3, Contexts> | Fallback[2], val4: GetDataByContextString<Key4, Contexts> | Fallback[3], val5: GetDataByContextString<Key5, Contexts> | Fallback[4], val6: GetDataByContextString<Key6, Contexts> | Fallback[5]) => void,
        >(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, dataKey5: Key5, dataKey6: Key6, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    public listenToData<
        Keys extends GetJoinedDataKeysFromContexts<Contexts>,
        Key1 extends Keys,
        Key2 extends Keys,
        Key3 extends Keys,
        Key4 extends Keys,
        Key5 extends Keys,
        Key6 extends Keys,
        Key7 extends Keys,
        Fallback extends [ fall1?: GetDataByContextString<Key1, Contexts> | null, fall2?: GetDataByContextString<Key2, Contexts> | null, fall3?: GetDataByContextString<Key3, Contexts> | null, fall4?: GetDataByContextString<Key4, Contexts> | null, fall5?: GetDataByContextString<Key5, Contexts> | null, fall6?: GetDataByContextString<Key6, Contexts> | null, fall7?: GetDataByContextString<Key7, Contexts> | null ],
        Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0], val2: GetDataByContextString<Key2, Contexts> | Fallback[1], val3: GetDataByContextString<Key3, Contexts> | Fallback[2], val4: GetDataByContextString<Key4, Contexts> | Fallback[3], val5: GetDataByContextString<Key5, Contexts> | Fallback[4], val6: GetDataByContextString<Key6, Contexts> | Fallback[5], val7: GetDataByContextString<Key7, Contexts> | Fallback[6]) => void,
        >(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, dataKey5: Key5, dataKey6: Key6, dataKey7: Key6, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    public listenToData<
        Keys extends GetJoinedDataKeysFromContexts<Contexts>,
        Key1 extends Keys,
        Key2 extends Keys,
        Key3 extends Keys,
        Key4 extends Keys,
        Key5 extends Keys,
        Key6 extends Keys,
        Key7 extends Keys,
        Key8 extends Keys,
        Fallback extends [ fall1?: GetDataByContextString<Key1, Contexts> | null, fall2?: GetDataByContextString<Key2, Contexts> | null, fall3?: GetDataByContextString<Key3, Contexts> | null, fall4?: GetDataByContextString<Key4, Contexts> | null, fall5?: GetDataByContextString<Key5, Contexts> | null, fall6?: GetDataByContextString<Key6, Contexts> | null, fall7?: GetDataByContextString<Key7, Contexts> | null, fall8?: GetDataByContextString<Key8, Contexts> | null ],
        Callback extends (val1: GetDataByContextString<Key1, Contexts> | Fallback[0], val2: GetDataByContextString<Key2, Contexts> | Fallback[1], val3: GetDataByContextString<Key3, Contexts> | Fallback[2], val4: GetDataByContextString<Key4, Contexts> | Fallback[3], val5: GetDataByContextString<Key5, Contexts> | Fallback[4], val6: GetDataByContextString<Key6, Contexts> | Fallback[5], val7: GetDataByContextString<Key7, Contexts> | Fallback[6], val8: GetDataByContextString<Key8, Contexts> | Fallback[7]) => void,
        >(dataKey1: Key1, dataKey2: Key2, dataKey3: Key3, dataKey4: Key4, dataKey5: Key5, dataKey6: Key6, dataKey7: Key6, dataKey8: Key8, callback: Callback, fallbackArgs?: Fallback | null, callImmediately?: boolean): void;
    
    public listenToData(...args: any[]): void {
        // Parse.
        let iOffset = 1;
        const nArgs = args.length;
        const callImmediately = typeof args[nArgs - iOffset] === "boolean" && args[nArgs - iOffset++];
        const fallbackArgs: any[] | undefined = Array.isArray(args[nArgs - iOffset]) && args[nArgs - iOffset++] || undefined;
        const callback: DataListenerFunc = args[nArgs - iOffset];
        const dataNeeds = args.slice(0, nArgs - iOffset);
        // Set needs.
        this.dataListeners.set(callback, [dataNeeds, fallbackArgs ]);
        // Call.
        if (callImmediately)
            callback(...this.getDataArgsBy(dataNeeds, fallbackArgs));
    }

    /** Remove a data listener manually. Returns true if did remove, false if wasn't attached. */
    public unlistenToData(callback: DataListenerFunc): boolean {
        // Not found.
        if (this.dataListeners.has(callback))
            return false;
        // Remove.
        this.dataListeners.delete(callback);
        return true;
    }


    // - Handle data - //

    /** Get from contextual data by dotted key: eg. `"someCtxName.someData.someProp"`.
     * - If the context exists uses the getInData method from the context, otherwise returns undefined or the fallback. (The fallback is also used if the data key not found in context data.)
     */
    public getInData<CtxDataKey extends GetJoinedDataKeysFromContexts<Contexts>, SubData extends GetDataByContextString<CtxDataKey, Contexts>>(ctxDataKey: CtxDataKey, fallback?: never | undefined): SubData | undefined;
    public getInData<CtxDataKey extends GetJoinedDataKeysFromContexts<Contexts>, SubData extends GetDataByContextString<CtxDataKey, Contexts>, FallbackData extends SubData>(ctxDataKey: CtxDataKey, fallback: FallbackData): SubData;
    public getInData(ctxDataKey: string, fallback: any = undefined): any {
        const ctxName = ctxDataKey.split(".", 1)[0];
        const context = this.getContext(ctxName);
        return context ? context.getInData(ctxDataKey.slice(ctxName.length + 1), fallback) : fallback;
    }

    /** Set in contextual data by dotted key: eg. `"someCtxName.someData.someProp"`.
     * - Sets the data in the context, if context found, and triggers refresh (by default). If the sub data is an object, can also extend.
     * - Note that if the context is found, using this triggers the contextual data listeners (with default or forced timeout). */
    public setInData<CtxDataKey extends GetJoinedDataKeysFromContexts<Contexts>, SubData extends GetDataByContextString<CtxDataKey, Contexts>>(ctxDataKey: CtxDataKey, data: Partial<SubData> & Dictionary, extend?: true, refresh?: boolean, forceTimeout?: number | null): void;
    public setInData<CtxDataKey extends GetJoinedDataKeysFromContexts<Contexts>, SubData extends GetDataByContextString<CtxDataKey, Contexts>>(ctxDataKey: CtxDataKey, data: SubData, extend?: boolean, refresh?: boolean, forceTimeout?: number | null): void;
    public setInData(ctxDataKey: string, data: any, extend?: boolean, refresh?: boolean, forceTimeout?: number | null): void {
        const ctxName = ctxDataKey.split(".", 1)[0];
        this.getContext(ctxName)?.setInData(ctxDataKey.slice(ctxName.length + 1), data as never, extend, refresh, forceTimeout);
    }

    /** Manually trigger refresh without setting the data using a dotted key (or an array of them) with context name: eg. `"someCtxName.someData.someProp"`. */
    public refreshData<CtxDataKey extends GetJoinedDataKeysFromContexts<Contexts>>(ctxDataKeys: CtxDataKey | CtxDataKey[], forceTimeout?: number | null): void;
    public refreshData(ctxDataKeys: string | string[], forceTimeout?: number | null): void {
        // Prepare a temp dictionary.
        const contexts: Record<string, Context | null | undefined> = {};
        // Loop each data key.
        for (const ctxDataKey of typeof ctxDataKeys === "string" ? [ctxDataKeys] : ctxDataKeys) {
            // Get context.
            const ctxName = ctxDataKey.split(".", 1)[0];
            if (contexts[ctxName] !== undefined)
                contexts[ctxName] = this.getContext(ctxName);
            // Add refresh keys, if context found.
            contexts[ctxName]?.addRefreshKeys(ctxDataKey.slice(ctxName.length + 1));
        }
        // Refresh each.
        for (const ctxName in contexts)
            contexts[ctxName]?.refreshData(null as never, forceTimeout);
    }

    /** Manually trigger refresh by multiple refreshKeys for multiple contexts.
     * - Note that unlike the other data methods in the ContextAPI, this one separates the contextName and the keys: `{ [contextName]: dataKeys }`
     * - The data keys can be `true` to refresh all in the context, or a dotted string or an array of dotted strings to refresh multiple separate portions simultaneously. */
    public refreshDataBy<
        All extends {
            [Name in keyof Contexts]:
                All[Name] extends boolean ? boolean :
                All[Name] extends string ? PropType<Contexts[Name]["data"], All[Name], never> extends never ? never : string:
                All[Name] extends string[] | readonly string[] ? unknown extends PropType<Contexts[Name]["data"], All[Name][number]> ? never : string[] | readonly string[] :
                never
        }
    >(namedRefreshes: Partial<All>, forceTimeout?: number | null): void;
    public refreshDataBy(namedNeeds: Record<keyof Contexts & string, boolean | string | string[]>, forceTimeout?: number | null): void {
        const contexts = this.getContexts(namedNeeds);
        for (const name in contexts) {
            const context = contexts[name];
            if (context)
                context.refreshData(namedNeeds[name] as never, forceTimeout);
        }
    }


    // - Mangle contexts - //

    /** Gets the context locally by name. Returns null if not found, otherwise Context. 
     * - This method can be extended to get contexts from elsewhere in addition. (It's used internally all around ContextAPI, except in getContexts and setContext.)
     */
    public getContext<Name extends keyof Contexts & string>(name: Name): Contexts[Name] | null | undefined {
        return this.contexts[name] as Contexts[Name] | null | undefined;
    }

    /** Gets the contexts by names. If name not found, not included in the returned dictionary, otherwise the values are Context | null. */
    public getContexts<Name extends keyof Contexts & string>(onlyNames?: RecordableType<Name> | null): Partial<Record<string, Context | null>> & Partial<MixDOMContextsAllOrNull<Contexts>> {
        // Base.
        if (!onlyNames)
            return { ...this.contexts } as Contexts;
        const okNames = _Lib.buildRecordable(onlyNames);
        const contexts: Partial<MixDOMContextsAllOrNull> = {};
        for (const name in this.contexts)
            if (okNames[name])
                contexts[name] = this.contexts[name];
        // Mixed.
        return contexts;
    }

    /** This creates a new context - presumably to be attached with .contexts prop.
     * - If overrideWithName given, then calls setContext automatically with the given name. */
    public newContext<CtxData = any, CtxSignals extends SignalsRecord = {}>(data: CtxData, overrideWithName?: never | "" | undefined, refreshIfOverriden?: never | false): Context<CtxData, CtxSignals>;
    public newContext<Name extends keyof Contexts & string>(data: Contexts[Name]["data"], overrideWithName: Name, refreshIfOverriden?: boolean): Contexts[Name];
    public newContext(data: any, overrideWithName?: string, refreshIfOverriden: boolean = true): Context {
        const context = newContext(data);
        if (overrideWithName)
            this.setContext(overrideWithName, context as any, refreshIfOverriden);
        return context;
    }

    /** Same as newContext but for multiple contexts all at once.
     * - If overrideForSelf set to true, will call setContexts after to attach the contexts here. */
    public newContexts<Contexts extends { [Name in keyof AllData & string]: Context<AllData[Name]> }, AllData extends { [Name in keyof Contexts & string]: Contexts[Name]["data"] } = { [Name in keyof Contexts & string]: Contexts[Name]["data"] }>(allData: AllData, overrideForSelf?: never | false | undefined, refreshIfOverriden?: never | false): Contexts;
    public newContexts<Name extends keyof Contexts & string>(allData: Partial<Record<Name, Contexts[Name]["data"]>>, overrideForSelf: true, refreshIfOverriden?: boolean): Partial<Record<Name, Contexts[Name]["data"]>>;
    public newContexts(allData: any, overrideForSelf: boolean = false, refreshIfOverriden: boolean = true): Record<string, Context> {
        const contexts = newContexts(allData);
        if (overrideForSelf)
            this.setContexts(contexts as any, refreshIfOverriden);
        return contexts;
    }
    /** Attach the context to this ContextAPI by name. Returns true if did attach, false if was already there.
     * - Note that if the context is `null`, it will be kept in the bookkeeping. If it's `undefined`, it will be removed.
     *      * This only makes difference when uses one ContextAPI to inherit its contexts from another ContextAPI.
     */
    public setContext<Name extends keyof Contexts & string>(name: Name, context: Contexts[Name] | null | undefined, callDataIfChanged: boolean = true): boolean { 
        // Nothing to do.
        const oldContext = this.contexts[name];
        if (oldContext === context)
            return false;
        // Remove from old context.
        if (oldContext) {
            const ctxNames = oldContext.contextAPIs.get(this as ContextAPI);
            if (ctxNames) {
                const newNames = ctxNames.filter(ctxName => ctxName !== name);
                newNames.length ? oldContext.contextAPIs.set(this as ContextAPI, newNames) : oldContext.contextAPIs.delete(this as ContextAPI);
            }
        }
        // Add to new context.
        if (context) {
            // Add to new context.
            const ctxNames = context.contextAPIs.get(this as ContextAPI) || [];
            if (!ctxNames.includes(name))
                ctxNames.push(name);
            context.contextAPIs.set(this as ContextAPI, ctxNames);
        }
        // Handle local bookkeeping.
        if (context !== undefined)
            this.contexts[name] = context;
        else
            delete this.contexts[name];
        // Refresh.
        if (callDataIfChanged)
            this.callDataListenersFor ? this.callDataListenersFor([name]) : this.callDataBy([name] as never);
        return true;
    }
    /** Set multiple named contexts in one go. Returns true if did changes, false if didn't. This will only modify the given keys.
     * - Note that if the context is `null`, it will be kept in the bookkeeping. If it's `undefined`, it will be removed.
     *      * This only makes difference when uses one ContextAPI to inherit its contexts from another ContextAPI.
     */
    public setContexts(contexts: Partial<{[CtxName in keyof Contexts]: Contexts[CtxName] | null | undefined; }>, callDataIfChanged: boolean = true): boolean {
        // Override each - don't refresh.
        let didChange = false;
        for (const name in contexts)
            didChange = this.setContext(name, contexts[name] as any, false) || didChange;
        // Refresh.
        if (callDataIfChanged && didChange)
            this.callDataListenersFor ? this.callDataListenersFor(Object.keys(contexts)) : this.callDataBy(Object.keys(contexts) as never);
        return didChange;
    }

    
    // - Context data build helpers - //

    /** Helper to build data arguments from this ContextAPI's contextual connections with the given data needs args.
     * - For example: `getDataArgsBy(["settings.user.name", "themes.darkMode"])`.
     * - Used internally but can be used for manual purposes. Does not support typing like listenToData - just string[].
     */
    public getDataArgsBy(needs: string[], fallbackArgs?: any[]): any[] {
        return needs.map((need, i) => {
            const ctxName = need.split(".", 1)[0];
            const ctx = this.getContext(ctxName); // Use the getter - for better extendability of the ContextAPI class.
            return ctx ? ctx.getInData(need.slice(ctxName.length + 1), fallbackArgs && fallbackArgs[i]) : fallbackArgs && fallbackArgs[i];
        });
    }

    // Local.
    /** Manually trigger an update based on changes in context. Should not be used in normal circumstances.
     * - Only calls / triggers for refresh by needs related to the given contexts. If ctxNames is true, then all.
     */
    public callDataBy(ctxDataKeys: true | GetJoinedDataKeysFromContexts<Contexts>[] = true): void {
        // Loop each callback, and call if needs to.
        for (const [callback, [needs, fallbackArgs]] of this.dataListeners.entries())// Note that we use .entries() to take a copy of the situation.
            if (ctxDataKeys === true || ctxDataKeys.some((ctxDataKey: string) => needs.some(need => need === ctxDataKey || need.startsWith(ctxDataKey + ".") || ctxDataKey.startsWith(need + "."))))
                callback(...this.getDataArgsBy(needs, fallbackArgs));
    }


    // - Optional assignable getter - //

    /** Assignable getter to collect more signal listeners for a call through a specific context name. */
    getListenersFor?<CtxName extends string & keyof Contexts>(ctxName: CtxName, signalName: string & keyof Contexts[CtxName]["_Signals"]): SignalListener[] | undefined;

    /** Assignable getter to call more data listeners when specific context names are refreshed. */
    callDataListenersFor?(ctxNames: string[], dataKeys?: true | string[]): void;

}
