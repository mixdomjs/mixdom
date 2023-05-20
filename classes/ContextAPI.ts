

// - Imports - //

import {
    PropType,
    Dictionary,
    RecordableType,
    MixDOMContextAttach,
    MixDOMContextRefresh,
    SplitOnce,
    MixDOMContextsAll,
    FirstSplit,
    SecondSplit,
    GetJoinedSignalKeysFromContexts,
    GetJoinedDataKeysFromContexts
} from "../static/_Types";
import { SignalSendAsReturn, SignalManFlags, SignalListener, SignalListenerFunc, SignalsRecord } from "./SignalMan";
import { _Lib } from "../static/_Lib";
import { _Apply } from "../static/_Apply";
import { Component, ComponentInfo, ComponentWith } from "./Component";
import { ComponentShadowWith } from "./ComponentShadow";
import { HostServices } from "./HostServices";
import { Context, newContext, newContexts } from "./Context";


// - Helper types - //

// These work by using the given data key location types.
export type GetDataByContextString<Key extends string, Contexts extends MixDOMContextsAll> = GetDataByContextKeys<SplitOnce<Key, ".">, Contexts>;
type GetDataByContextKeys<CtxKeys extends string[], Contexts extends MixDOMContextsAll> = 
    [CtxKeys[0]] extends [keyof Contexts] ? 
        [CtxKeys[1]] extends [string] ?
            PropType<Contexts[CtxKeys[0]]["data"], CtxKeys[1], never>
        : Contexts[CtxKeys[0]]["data"]
    : never;
// type CheckDataByContextString<Key extends string, Contexts extends MixDOMContextsAll> = CheckDataByContextKeys<SplitOnce<Key, ".">, Contexts>;
// type CheckDataByContextKeys<CtxKeys extends string[], Contexts extends MixDOMContextsAll> = 
//     [CtxKeys[0]] extends [keyof Contexts] ? 
//         [CtxKeys[1]] extends [string] ?
//             PropType<Contexts[CtxKeys[0]]["data"], CtxKeys[1], never> extends never ? never : string
//         : string
//     : never;


// - Class - //

export class ContextAPI<Info extends Partial<ComponentInfo> = {}, Contexts extends MixDOMContextsAll = Info["contexts"] & {}> {
    

    // - Members - //

    /** The component this api is tied to. It should feature .contextAPI as us. */
    public component: Component<Info>;
    /** Data needs mapping using the callback as the key and value contains the data needs. The data needs are also used as to get the argument values for the callback. */
    public dataListeners: Map<SignalListenerFunc, [ needs: string[], fallbackArgs?: any[] ]>;
    /** Signal listeners by context (= main dictionary) and signal name (= sub dictionary).
     * - Note. This is typed widely, the related methods are typed precisely.
     */
    public signalsBy: Record<string, Record<string, SignalListener[]>>;
    /** The contexts the component has overridden itself.
     * .. This is typically used for tunneling purposes, when the component wants to be part of the context it created.
     * .. This is optional because, it's quite rarely used.
     * .... But when using contexts for tunneling, sometimes wants to talkback to parent with actions or share part of the context. */
    public overriddenContexts?: Record<string, Context | null>;


    // - Initialize - //

    constructor(component: Component<Info>) {
        this.component = component;
        this.dataListeners = new Map();
        this.signalsBy = {};
    }


    // - Listen to signals - //

    /** Listen to the signals sent through the context. */
    // public listenTo<
    //     CtxName extends keyof Contexts & string,
    //     SignalName extends string & keyof Contexts[CtxName]["_Signals"]
    // >(contextName: CtxName, signalName: SignalName, callback: Contexts[CtxName]["_Signals"][SignalName], extraArgs?: any[] | null, flags?: SignalManFlags | null, groupId?: any | null): void {
    public listenTo<
        CtxSignalName extends GetJoinedSignalKeysFromContexts<Contexts>,
        CtxName extends keyof Contexts & FirstSplit<CtxSignalName, ".">,
        SignalName extends string & SecondSplit<CtxSignalName, ".">
    >(ctxSignalName: CtxSignalName, callback: Contexts[CtxName]["_Signals"][SignalName], extraArgs?: any[] | null, flags?: SignalManFlags | null, groupId?: any | null): void {
        // Prepare.
        const [contextName, signalName] = ctxSignalName.split(".", 2);
        const ctxListeners = this.signalsBy[contextName];
        const listener: SignalListener = [callback, extraArgs || null, flags || SignalManFlags.None ];
        if (groupId != null)
            listener.push(groupId);
        // Local.
        if (!ctxListeners)
            this.signalsBy[contextName] = { [signalName]: [ listener ]};
        else {
            // Prepare.
            let listeners = ctxListeners[signalName];
            // New entry.
            if (!listeners)
                ctxListeners[signalName] = listeners = [ listener ];
            // Add to existing.
            else {
                // Check for a duplicate by callback. If has add in its place (to update the info), otherwise add to end.
                if (!listeners.some((info, index) => info[0] === callback ? listeners[index] = listener : false))
                    listeners.push( listener );
            }
        }
        // Context.
        this.getContext(contextName)?.services.onInterest("signals", this.component, contextName);
    }

    public unlistenTo<
        CtxSignalName extends GetJoinedSignalKeysFromContexts<Contexts>
    >(ctxSignalNames?: CtxSignalName | CtxSignalName[] | null, callback?: SignalListenerFunc | null, groupId?: any | null): void {
        // Get listeners by context name. If none, none to remove.
        for (const ctxSignalName of (ctxSignalNames ? typeof ctxSignalNames === "string" ? [ctxSignalNames] : ctxSignalNames : Object.keys(this.signalsBy))) {
            // Parse.
            const [contextName, signalName] = ctxSignalName.split(".", 2);
            const listeners = this.signalsBy[contextName];
            if (!listeners)
                return;
            // Prepare names.
            const signalNames = signalName ? [ signalName ] : Object.keys(listeners) as string[];
            // Loop by names.
            const hasGroupId = groupId != null;
            let removeTotally = true;
            for (const thisName of signalNames) {
                // Destroy in reverse order.
                const connections = listeners[thisName];
                if (!connections)
                    continue;
                // Remove each if matches.
                for (let i=connections.length-1; i>=0; i--) {
                    if (callback && callback !== connections[i][0])
                        continue;
                    if (hasGroupId && groupId !== connections[i][3])
                        continue;
                    connections.splice(i, 1);
                }
                // Empty.
                if (!connections[0])
                    delete listeners[thisName];
                else 
                    removeTotally = false;
            }
            // Context.
            if (removeTotally && !Object.keys(listeners).length)
                this.getContext(contextName)?.services.onDisInterest("signals", this.component, contextName);
        }
    }
    
    public isListening<
        CtxSignalName extends GetJoinedSignalKeysFromContexts<Contexts>
    >(ctxSignalName?: string & keyof Contexts | CtxSignalName | null, callback?: SignalListenerFunc | null, groupId?: any | null): boolean {
        // By any.
        if (!ctxSignalName)
            return Object.keys(this.signalsBy).some(ctxName => this.isListening(ctxName, callback, groupId));
        // Get signal listeners dictionary by context name.
        const [contextName, signalName] = ctxSignalName.split(".", 2);
        const byCtx = this.signalsBy[contextName];
        // None at all by context.
        if (!byCtx)
            return false;
        // Get listeners by signal name / all by the given context.
        const listeners: SignalListener[] = signalName ? byCtx[signalName] : Object.values(byCtx).reduce((a, b) => a.concat(b), []);
        // No listeners.
        if (!listeners[0])
            return false;
        // Callback doesn't match.
        if (callback && !listeners.some(listener => listener[0] === callback))
            return false;
        // Group doesn't match.
        if (groupId != null && !listeners.some(listener => listener[3] === groupId))
            return false;
        // Matches.
        return true;
    }


    // - Send signals - //

    /** Emit a signal. Does not return a value. Use `sendSignalAs(modes, contextName, signalName, ...args)` to refine the behaviour. */
    // public sendSignal<
    //     CtxName extends keyof Contexts & string,
    //     SignalName extends string & keyof Contexts[CtxName]["_Signals"]
    // >(ctxSignalName: Join<[CtxName, SignalName], ".">, ...args: Parameters<Contexts[CtxName]["_Signals"][SignalName]>): void {
    public sendSignal<
        CtxSignalName extends GetJoinedSignalKeysFromContexts<Contexts>,
        CtxName extends keyof Contexts & FirstSplit<CtxSignalName, ".">,
        SignalName extends string & SecondSplit<CtxSignalName, ".">,
    >(ctxSignalName: CtxSignalName, ...args: Parameters<Contexts[CtxName]["_Signals"][SignalName]>): void {
        const [contextName, signalName] = ctxSignalName.split(".", 2);
        return this.getContext(contextName)?.sendSignal(signalName, ...args);
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
        CtxSignalName extends GetJoinedSignalKeysFromContexts<Contexts>,
        CtxName extends keyof Contexts & FirstSplit<CtxSignalName, ".">,
        SignalName extends string & SecondSplit<CtxSignalName, ".">,
        // CtxName extends keyof Contexts & string,
        // SignalName extends string & keyof Contexts[CtxName]["_Signals"],
        // CtxSignalName extends CtxName | Join<[CtxName, SignalName], ".">,
        Mode extends "" | "pre-delay" | "delay" | "await" | "last" | "first" | "first-true" | "multi" | "no-false" | "no-null",
        HasAwait extends boolean = Mode extends string[] ? Mode[number] extends "await" ? true : false : Mode extends "await" ? true : false,
        HasLast extends boolean = Mode extends string[] ? Mode[number] extends "last" ? true : false : Mode extends "last" ? true : false,
        HasFirst extends boolean = Mode extends string[] ? Mode[number] extends "first" ? true : Mode[number] extends "first-true" ? true : false : Mode extends "first" ? true : Mode extends "first-true" ? true : false,
        HasDelay extends boolean = Mode extends string[] ? Mode[number] extends "delay" ? true : false : Mode extends "delay" ? true : false,
        HasPreDelay extends boolean = Mode extends string[] ? Mode[number] extends "pre-delay" ? true : false : Mode extends "pre-delay" ? true : false,
        UseReturnVal extends boolean = true extends HasAwait ? true : true extends HasDelay | HasPreDelay ? false : true,
    // >(modes: Mode | Mode[], contextName: CtxName, signalName: SignalName, ...args: Parameters<Contexts[CtxName]["_Signals"][SignalName]>): true extends UseReturnVal ? SignalSendAsReturn<ReturnType<Contexts[CtxName]["_Signals"][SignalName]>, HasAwait, HasLast | HasFirst> : undefined {
    >(modes: Mode | Mode[], ctxSignalName: CtxSignalName, ...args: Parameters<Contexts[CtxName]["_Signals"][SignalName]>): true extends UseReturnVal ? SignalSendAsReturn<ReturnType<Contexts[CtxName]["_Signals"][SignalName]>, HasAwait, HasLast | HasFirst> : undefined {
        const [contextName, signalName] = ctxSignalName.split(".", 2);
        const ctx = this.getContext(contextName);
        return (ctx ? ctx.sendSignalAs(modes, signalName, ...args) : undefined) as any;
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
        const callback: SignalListenerFunc = args[nArgs - iOffset];
        const dataNeeds = args.slice(0, nArgs - iOffset);
        // Set needs.
        const ctxs: Record<string, Context | null> = {};
        const allOld = [...this.dataListeners.values()];
        const oldInfos = this.dataListeners.get(callback);
        this.dataListeners.set(callback, [dataNeeds, fallbackArgs ]);
        // Update context collection.
        for (const dataNeed of dataNeeds) {
            // Already handled.
            const contextName = dataNeed.split(".", 1)[0];
            if (ctxs[contextName] !== undefined)
                continue;
            // Get context.
            const ctx = ctxs[contextName] = this.getContext(contextName) || null;
            if (!ctx)
                continue;
            // Add as an interested component.
            if (!allOld.some(([needs]) => needs.some(need => need.startsWith(contextName))))
                ctx.services.onInterest("data", this.component, contextName);
        }
        // If overrode an earlier callback, then check if needs to remove as an interested component from the old contexts.
        if (oldInfos) {
            for (const oldKey of oldInfos[0]) {
                // Was added again, handled already, or not found already.
                const contextName = oldKey.split(".", 1)[0];
                if (ctxs[contextName] !== undefined)
                    continue;
                // Otherwise might need to be removed.
                const ctx = ctxs[contextName] = this.getContext(contextName) || null;
                if (!ctx)
                    continue;
                // If none needs anymore, remove from interested components.
                if (!allOld.some(([keys]) => keys.some(key => key === contextName || key.startsWith(contextName + "."))))
                    ctx.services.onDisInterest("data", this.component, contextName);
            }
        }
        // Call.
        if (callImmediately)
            callback(...this.buildDataArgsBy(dataNeeds, fallbackArgs));
    }

    /** Remove a data listener manually. Returns true if did remove, false if wasn't attached. */
    public unlistenToData(callback: SignalListenerFunc): boolean {
        // Remove.
        const dataKeys = this.dataListeners.get(callback);
        this.dataListeners.delete(callback);
        // Nothing to remove.
        if (!dataKeys)
            return false;
        // Remove from interested components in each context.
        const allInfos = [...this.dataListeners.values()];
        for (const dataKey of dataKeys[0]) {
            // Get context.
            const contextName = dataKey.split(".", 1)[0];
            const ctx = this.getContext(contextName) || null;
            if (!ctx)
                continue;
            // If none needs anymore, remove from interested components.
            if (!allInfos.some(([needs]) => needs.some(need => need === contextName || need.startsWith(contextName + "."))))
                ctx.services.onDisInterest("data", this.component, contextName);
        }
        // Did remove.
        return true;
    }


    // - Handle data - //

    /** Get from contextual data by dotted key: eg. `"someCtxName.someData.someProp"`.
     * - If the context exists uses the getInData method from the context, otherwise returns undefined or the fallback. (The fallback is also used if the data key not found in context data.)
     */
    // public getInData<CtxDataKey extends CheckDataByContextString<CtxDataKey, Contexts>, SubData extends GetDataByContextString<CtxDataKey, Contexts>>(ctxDataKey: CtxDataKey, fallback?: never | undefined): SubData | undefined;
    // public getInData<CtxDataKey extends CheckDataByContextString<CtxDataKey, Contexts>, SubData extends GetDataByContextString<CtxDataKey, Contexts>, FallbackData extends SubData>(ctxDataKey: CtxDataKey, fallback: FallbackData): SubData;
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
    // public setInData<CtxDataKey extends CheckDataByContextString<CtxDataKey, Contexts>, SubData extends GetDataByContextString<CtxDataKey, Contexts>>(ctxDataKey: CtxDataKey, data: Partial<SubData> & Dictionary, extend?: true, refresh?: boolean, forceTimeout?: number | null): void;
    // public setInData<CtxDataKey extends CheckDataByContextString<CtxDataKey, Contexts>, SubData extends GetDataByContextString<CtxDataKey, Contexts>>(ctxDataKey: CtxDataKey, data: SubData, extend?: boolean, refresh?: boolean, forceTimeout?: number | null): void;
    public setInData<CtxDataKey extends GetJoinedDataKeysFromContexts<Contexts>, SubData extends GetDataByContextString<CtxDataKey, Contexts>>(ctxDataKey: CtxDataKey, data: Partial<SubData> & Dictionary, extend?: true, refresh?: boolean, forceTimeout?: number | null): void;
    public setInData<CtxDataKey extends GetJoinedDataKeysFromContexts<Contexts>, SubData extends GetDataByContextString<CtxDataKey, Contexts>>(ctxDataKey: CtxDataKey, data: SubData, extend?: boolean, refresh?: boolean, forceTimeout?: number | null): void;
    public setInData(ctxDataKey: string, data: any, extend?: boolean, refresh?: boolean, forceTimeout?: number | null): void {
        const ctxName = ctxDataKey.split(".", 1)[0];
        this.getContext(ctxName)?.setInData(ctxDataKey.slice(ctxName.length + 1), data as never, extend, refresh, forceTimeout);
    }

    /** Manually trigger refresh without setting the data using a dotted key (or an array of them) with context name: eg. `"someCtxName.someData.someProp"`. */
    // public refreshData<CtxDataKey extends CheckDataByContextString<CtxDataKey, Contexts>>(ctxDataKeys: CtxDataKey | CtxDataKey[], forceTimeout?: number | null): void;
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


    // // - Old data methods: with (contextName, dataKeys) -structure - //
    // 
    // /** Get the whole context data (directly). */
    // public getData<Name extends keyof Contexts & string, CtxData extends Contexts[Name]["data"], FallbackData extends CtxData | undefined>(contextName: Name, noContextFallback?: never | undefined): CtxData | undefined;
    // public getData<Name extends keyof Contexts & string, CtxData extends Contexts[Name]["data"], FallbackData extends CtxData>(contextName: Name, noContextFallback: FallbackData): CtxData;
    // public getData(contextName: keyof Contexts & string, noContextFallback: any = undefined): any {
    //     const context = this.getContext(contextName);
    //     return context ? context.data : noContextFallback;
    // }
    // 
    // /** Get a portion of data inside the context data (directly).
    //  * Use the dataKey to define the location as a dotted string. For example: "themes.selected" */
    // public getInData<Name extends keyof Contexts & string, CtxData extends Contexts[Name]["data"], DataKey extends PropType<CtxData, DataKey, never> extends never ? never : string>(contextName: Name, dataKey: DataKey, noContextFallback?: never | undefined): PropType<CtxData, DataKey> | undefined;
    // public getInData<Name extends keyof Contexts & string, CtxData extends Contexts[Name]["data"], DataKey extends PropType<CtxData, DataKey, never> extends never ? never : string, SubData extends PropType<CtxData, DataKey>, FallbackData extends SubData>(contextName: Name, dataKey: DataKey, noContextFallback: FallbackData): SubData;
    // public getInData(contextName: keyof Contexts & string, dataKey: string, noContextFallback: any = undefined): any {
    //     const context = this.getContext(contextName);
    //     return context ? context.getInData(dataKey as never) : noContextFallback;
    // }
    // 
    // /** Set the whole data of the context, and trigger refresh (by default). If the data is an object, can also extend. Triggers the contextual data listeners (with default or forced timeout). */
    // public setData<Name extends keyof Contexts & string>(contextName: Name, data: Partial<Contexts[Name]["data"]> & Dictionary, extend?: true, refresh?: boolean, forceTimeout?: number | null): void;
    // public setData<Name extends keyof Contexts & string>(contextName: Name, data: Contexts[Name]["data"], extend?: boolean, refresh?: boolean, forceTimeout?: number | null): void;
    // public setData(contextName: keyof Contexts & string, data: any, extend?: boolean, refresh?: boolean, forceTimeout?: number | null): void {
    //     this.getContext(contextName)?.setData(data, extend, refresh, forceTimeout);
    // }
    // 
    // /** Set a portion of data inside the context data, and trigger refresh (by default). If the sub data is an object, can also extend.
    //  * - Use the dataKey to define the location as a dotted string. For example: "themes.selected"
    //  * - Triggers the contextual data listeners (with default or forced timeout). */
    // public setInData<Name extends keyof Contexts & string, CtxData extends Contexts[Name]["data"], DataKey extends string, SubData extends PropType<CtxData, DataKey, never>>(contextName: Name, dataKey: DataKey, data: Partial<SubData> & Dictionary, extend?: true, refresh?: boolean, forceTimeout?: number | null): void;
    // public setInData<Name extends keyof Contexts & string, CtxData extends Contexts[Name]["data"], DataKey extends string, SubData extends PropType<CtxData, DataKey, never>>(contextName: Name, dataKey: DataKey, data: SubData, extend?: boolean, refresh?: boolean, forceTimeout?: number | null): void;
    // public setInData(contextName: keyof Contexts & string, dataKey: string, data: any, extend?: boolean, refresh?: boolean, forceTimeout?: number | null): void {
    //     this.getContext(contextName)?.setInData(dataKey, data as never, extend, refresh, forceTimeout);
    // }
    // 
    // /** Manually trigger refresh with refreshKeys for the given context: triggers the contextual data listeners (with default or forced timeout).
    //  * Use the refreshKeys to define the location as a dotted string or an array of dotted strings. For example: ["themes.selected", "preferences"] */
    // public refreshData<Name extends keyof Contexts & string, CtxData extends Contexts[Name]["data"], DataKey extends PropType<CtxData, DataKey, never> extends never ? never : string>(contextName: Name, refreshKeys?: boolean | DataKey | DataKey[], forceTimeout?: number | null): void;
    // public refreshData(contextName: keyof Contexts & string, refreshKeys?: boolean | string | string[], forceTimeout?: number | null): void {
    //     this.getContext(contextName)?.refresh(refreshKeys as never, forceTimeout);
    // }


    // - Mangle contexts - //

    /** Check whether has context or not by name. Rarely needed - uses .getContext internally. */
    public hasContext<Name extends keyof Contexts & string>(name: Name, onlyTypes: MixDOMContextAttach = MixDOMContextAttach.All): boolean {
        return !!this.getContext(name, onlyTypes);
    }

    /** Gets the context locally by name. Returns undefined if not found, otherwise Context | null.
     * Give MixDOMContextAttach flags to allow only certain types, and onlyNames to allow only certain names. The flags are:
     *  - Cascading (1): Outer contexts.
     *  - Parent (2): Attached by parent.
     *  - Overridden (4): Locally overridden.
     * Note that if specific flags given, the method will only check from those. This means it might return a context that is actually overridden on a higher level of importance. */
    public getContext<Name extends keyof Contexts & string>(name: Name, onlyTypes: MixDOMContextAttach = MixDOMContextAttach.All): Contexts[Name] | null | undefined {
        // Overridden.
        if (onlyTypes & MixDOMContextAttach.Overridden) {
            const tunnels = this.overriddenContexts;
            if (tunnels && tunnels[name] !== undefined)
                return tunnels[name] as Contexts[Name] | null;
        }
        // Attached by tunneling.
        const boundary = this.component.boundary;
        if (onlyTypes & MixDOMContextAttach.Parent) {
            const tunnels = boundary._outerDef.attachedContexts;
            if (tunnels && tunnels[name] !== undefined)
                return tunnels[name] as Contexts[Name] | null;
        }
        // From outer contexts.
        if (onlyTypes & MixDOMContextAttach.Cascading)
            return boundary.outerContexts[name] as Contexts[Name] | undefined | null;
        // Not found.
        return undefined;
    }
    /** Gets the contexts locally by names. If name not found, not included in the returned dictionary, otherwise the values are Context | null.
     * Give MixDOMContextAttach flags to allow only certain types, and onlyNames to allow only certain names. The flags are:
     *  - Cascading (1): Outer contexts.
     *  - Parent (2): Attached by parent.
     *  - Overridden (4): Locally overridden.
     * Note that if specific flags given, the method will only check from those. This means it might return context that are actually overridden on a higher level of importance. */
    public getContexts<Name extends keyof Contexts & string>(onlyNames?: RecordableType<Name> | null, onlyTypes: MixDOMContextAttach = MixDOMContextAttach.All): Partial<Record<string, Context | null>> & Partial<Contexts> {
        // Base.
        const okNames = onlyNames ? _Lib.buildRecordable(onlyNames) : null;
        const tunnels: Record<string, Context | null> = {};
        const boundary = this.component.boundary;
        if (onlyTypes & MixDOMContextAttach.Cascading)
            for (const name in boundary.outerContexts)
                if (!okNames || okNames[name])
                    tunnels[name] = boundary.outerContexts[name];
        // Attached.
        if (onlyTypes & MixDOMContextAttach.Parent) {
            const attached = boundary._outerDef.attachedContexts;
            if (attached)
                for (const name in attached)
                    if (!okNames || okNames[name])
                        tunnels[name] = attached[name];
        }
        // Overridden.
        if (onlyTypes & MixDOMContextAttach.Overridden) {
            const overridden = this.overriddenContexts;
            if (overridden)
                for (const name in overridden)
                    if (!okNames || okNames[name])
                        tunnels[name] = overridden[name];
        }
        // Mixed.
        return tunnels as Partial<Contexts>;
    }

    /** This creates a new context - presumably to be attached with .contexts prop.
     * - If overrideWithName given, then includes this context in the component's contextual scope as well (as if its parent had used ._contexts).
     *   .. Note that this is the same as using .overrideContext(name), so it will override any context of the same name for this component. */
    public newContext<CtxData = any, CtxSignals extends SignalsRecord = {}>(data: CtxData, overrideWithName?: never | "" | undefined, refreshIfOverriden?: never | false): Context<CtxData, CtxSignals>;
    public newContext<Name extends keyof Contexts & string>(data: Contexts[Name]["data"], overrideWithName: Name, refreshIfOverriden?: boolean): Contexts[Name];
    public newContext(data: any, overrideWithName?: string, refreshIfOverriden: boolean = true): Context {
        const context = newContext(data);
        if (overrideWithName)
            this.overrideContext(overrideWithName, context as any, refreshIfOverriden);
        return context;
    }

    /** Same as newContext but for multiple contexts all at once.
     * - If overrideForSelf set to true, will call overrideContexts after to include this component into each context. */
    public newContexts<Contexts extends { [Name in keyof AllData & string]: Context<AllData[Name]> }, AllData extends { [Name in keyof Contexts & string]: Contexts[Name]["data"] } = { [Name in keyof Contexts & string]: Contexts[Name]["data"] }>(allData: AllData, overrideForSelf?: never | false | undefined, refreshIfOverriden?: never | false): Contexts;
    public newContexts<Name extends keyof Contexts & string>(allData: Partial<Record<Name, Contexts[Name]["data"]>>, overrideForSelf: true, refreshIfOverriden?: boolean): Partial<Record<Name, Contexts[Name]["data"]>>;
    public newContexts(allData: any, overrideForSelf: boolean = false, refreshIfOverriden: boolean = true): Record<string, Context> {
        const contexts = newContexts(allData);
        if (overrideForSelf)
            this.overrideContexts(contexts as any, refreshIfOverriden);
        return contexts;
    }
    /** Override context for this component only without affecting the cascading context flow.
     * - This will override both: the cascading as well as manually attached (if the parent had used ._contexts prop for us).
     * - If the given context value is undefined, then will remove the previously set override. Otherwise sets it to the given context or null.
     * - This method is most often used by calling newContext with second param, but can be used manually as well. */
    public overrideContext<Name extends keyof Contexts & string>(name: Name, context: Contexts[Name] | null | undefined, refreshIfChanged: boolean | "immediate" = true): MixDOMContextRefresh { 
        // Detect change.
        const oldContext = this.getContext(name);
        const newContext = context !== undefined ? context : this.getContext(name, MixDOMContextAttach.Parent | MixDOMContextAttach.Cascading);
        let overridden = this.overriddenContexts;
        // Remove earlier override.
        if (context === undefined) {
            if (overridden) {
                delete overridden[name];
                if (!Object.keys(overridden).length)
                    delete this.overriddenContexts;
            }
        }
        // Override.
        else {
            if (!overridden)
                overridden = this.overriddenContexts = {};
            overridden[name] = context;
        }
        // Did change.
        const didChange: MixDOMContextRefresh = oldContext !== newContext ? _Apply.helpUpdateContext(this as any, name, newContext || null, oldContext || null) : MixDOMContextRefresh.None;
        // Refresh.
        if (refreshIfChanged && HostServices.shouldUpdateContextually(didChange))
            this.askDataBuildBy([name], refreshIfChanged === "immediate");
        return didChange;
    }
    /** Override multiple contexts in one go. Returns flags for whether contextual refresh should be made. */
    public overrideContexts<Name extends keyof Contexts & string>(contexts: Partial<Record<Name, Contexts[Name] | null | undefined>>, refreshIfChanged: boolean | "immediate" = true): MixDOMContextRefresh {
        // Override each - don't refresh.
        let didChange: MixDOMContextRefresh = MixDOMContextRefresh.None;
        for (const name in contexts)
            didChange |= this.overrideContext(name, contexts[name] as any, false);
        // Refresh.
        if (refreshIfChanged && HostServices.shouldUpdateContextually(didChange))
            this.askDataBuildBy(Object.keys(contexts), refreshIfChanged === "immediate");
        // Contextual changes.
        return didChange;
    }


    // - Context data build helpers - //

    // Local.
    /** Manually trigger an update based on changes in context. Should not be used in normal circumstances.
     * - Only calls / triggers for refresh by needs related to the given contexts. If ctxNames is true, then all.
     * - If rebuildImmediately is true, then calls callDataListeners -> onData immediately.
     * - Otherwise uses the update flow with the common forceUpdate, forceUpdateTimeout and forceRenderTimeout params and calls when right before updating.
     */
    public askDataBuildBy(ctxNames: string[] | true = true, rebuildImmediately?: boolean, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void { 
        // Destroyed.
        const isMounted = this.component.boundary.isMounted;
        if (isMounted === null)
            return;
        // Rebuild contextual data immediately.
        if (rebuildImmediately)
            for (const [callback, [needs, fallbackArgs]] of this.dataListeners.entries()) { // Note that we use .entries() to take a copy of the situation.
                if (ctxNames === true || ctxNames.some(ctxName => needs.some(need => need === ctxName || need.startsWith(ctxName + "."))))
                    callback(...this.buildDataArgsBy(needs, fallbackArgs));
            }
        // Add to updates.
        else
            this.component.boundary.updateBy({ contextual: ctxNames === true ? Object.keys(this.getContexts()) : ctxNames }, forceUpdate, forceUpdateTimeout, forceRenderTimeout);
    }
    /** Helper to build data arguments from this ContextAPI's contextual connections with the given data needs args.
     * - For example: `buildDataArgsBy(["settings.user.name", "themes.darkMode"])`.
     * - Used internally but can be used for manual purposes. Does not support typing like listenToData - just string[].
     */
    public buildDataArgsBy(needs: string[], fallbackArgs?: any[]): any[] {
        // Get.
        const b = this.component.boundary;
        const overridden = this.overriddenContexts;
        const tunnels = b._outerDef.attachedContexts;
        const outerContexts = b.outerContexts;
        // Build arguments.
        const args: any[] = [];
        let i = 0;
        for (const need of needs) {
            const ctxName = need.split(".", 1)[0];
            let ctx: Context | null | undefined = overridden ? overridden[ctxName] : undefined;
            if (tunnels && ctx === undefined)
                ctx = tunnels[ctxName];
            if (ctx === undefined)
                ctx = outerContexts[ctxName];
            args.push(ctx ? ctx.getInData(need.slice(ctxName.length + 1) as never, fallbackArgs && fallbackArgs[i]) : fallbackArgs && fallbackArgs[i]);
            i++;
        }
        // Return arguments for the call.
        return args;
    }

}


// - Extra class types - //

/** This extends ContextAPI and provides the typing for the `component` member. */
export interface ContextAPIWith<Info extends Partial<ComponentInfo> = {}> extends ContextAPI<Info> {
    component: ComponentWith<Info>;
}
/** This extends ContextAPI and provides the typing for the `component` member. */
export interface ContextShadowAPIWith<Info extends Partial<ComponentInfo> = {}> extends ContextAPI<Info> {
    component: ComponentShadowWith<Info>;
}
