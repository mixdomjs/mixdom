

// - Imports - //

import { ClassType, ClassMixer, Awaited } from "../static/_Types";


// - Types - //

export enum SignalManFlags {
    // Modes.
    /** If enabled, removes the listener once it has been fired once. */
    OneShot = 1 << 0,
    /** If enabled, calls the listener after a 0ms timeout. Note that this makes the callback's return value always be ignored from the return flow. */
    Deferred = 1 << 1,
    // Shortcuts.
    None = 0,
    All = OneShot | Deferred,
}
export type SignalListenerFunc = (...args: any[]) => any | void;
export type SignalListener<Callback extends SignalListenerFunc = SignalListenerFunc> = [ callback: Callback, extraArgs: any[] | null, flags: SignalManFlags, groupId?: any | null ];
export type SignalsRecord = Record<string, SignalListenerFunc>;
// export type SignalsBook<Signals extends SignalsRecord = {}> = {[ Name in string & keyof Signals]: Array<SignalListener<Signals[Name]>> };

export type SignalSendAsReturn<
    // Input.
    OrigReturnVal,
    HasAwait extends boolean,
    IsSingle extends boolean,
    // Figured out.
    RetVal = true extends HasAwait ? Awaited<OrigReturnVal> : OrigReturnVal,
    ReturnVal = true extends IsSingle ? RetVal | undefined : RetVal[]
> = true extends HasAwait ? Promise<ReturnVal> : ReturnVal;


// - Helpers - //

/** Call a bunch of listeners and handle SignalManFlags mode.
 * - Will remove from given listeners array if OneShot flag is used.
 * - If Deferred flag is used, calls the listener after 0ms timeout.
 * - Does not collect return values. Just for emitting out without hassle. */
export function callListeners(listeners: SignalListener[], args?: any[] | null, ignoreOneShot: boolean = false): void {
    // Loop each.
    let i = 0;
    for (const listener of (ignoreOneShot ? listeners : listeners.slice())) {
        // One shot.
        const flags: SignalManFlags = listener[2] || 0;
        if (!ignoreOneShot && (flags & SignalManFlags.OneShot))
            listeners.splice(i, 1);
        else
            i++;
        // Deferred.
        if (flags & SignalManFlags.Deferred)
            setTimeout(() => listener[0](...(listener[1] && args ? [...args, ...listener[1]] : args || listener[1] || [])), 0);
        // Immediate.
        else
            listener[0](...(listener[1] && args ? [...args, ...listener[1]] : args || listener[1] || []));
    }
}

/** This emits the signal and collects the answers given by each listener ignoring `undefined` as an answer.
 * - By default, returns a list of answers. To return the last one, include "last" in the modes array.
 * - To stop at the first accepted answer use "first" mode or "first-true" mode.
 * - Always skips `undefined` as an answer. To skip `null` too use "no-null" mode, or any falsifiable with `no-false`.
 */
export function askListeners(listeners: SignalListener[], args?: any[] | null, modes?: Array<"" | "no-false" | "no-null" | "last" | "first" | "first-true">, ignoreOneShot: boolean = false): any {
    // Parse.
    const stopFirst = modes && (modes.includes("first") || modes.includes("first-true"));
    const onlyOne = modes && (stopFirst || modes.includes("last"));
    const noFalse = modes && modes.includes("no-false");
    const noNull = modes && modes.includes("no-null");
    const answers: any[] = [];
    // Loop each.
    let i = 0;
    for (const listener of (ignoreOneShot ? listeners : listeners.slice())) {
        // One shot.
        const flags: SignalManFlags = listener[2] || 0;
        if (!ignoreOneShot && (flags & SignalManFlags.OneShot))
            listeners.splice(i, 1);
        else
            i++;
        // Deferred - won't be part of return answer flow.
        if (flags & SignalManFlags.Deferred)
            setTimeout(() => listener[0](...(listener[1] && args ? [...args, ...listener[1]] : args || listener[1] || [])), 0);
        // Call and collect answer.
        else {
            // Get answer.
            const answer = listener[0](...(listener[1] && args ? [...args, ...listener[1]] : args || listener[1] || []));
            // Not acceptable.
            if (!answer && (answer === undefined || noFalse || noNull && answer == null))
                continue;
            // Add to acceptables.
            if (onlyOne)
                answers[0] = answer;
            else
                answers.push(answer);
            // Stop at first acceptable. Don't call further.
            if (stopFirst && (answer || !modes.includes("first-true")))
                break;
        }
    }
    // Return acceptable answers.
    return onlyOne ? answers[0] : answers;
}

/** The first argument is a double array of signal listeners to support fluent flow and OneShot splicing. Otherwise uses askListeners as the core and functions similarly. */
export function askListenersBy(allListeners: SignalListener[][], args?: any[] | null, modes?: Array<"" | "no-false" | "no-null" | "last" | "first" | "first-true">): any {
    // To support OneShot we need the double structure.
    // .. It's easier to just support it here and then call the flow with reduced array.
    // .. So if has more than one array, capture one shot here.
    if (allListeners[1]) {
        // Loop each.
        let flattenedListeners: SignalListener[] = [];
        for (const listeners of allListeners) {
            flattenedListeners = flattenedListeners.concat(listeners);
            for (let i=listeners.length-1; i>=0; i--) {
                if (listeners[i][2] & SignalManFlags.OneShot)
                    listeners.splice(i, 1);
            }
        }
        // Call.
        return askListeners(flattenedListeners, args, modes, true);
    }
    // There's only one array - just do it normally.
    return askListeners(allListeners[0], args, modes);
}


// - Mixins - //




export function _SignalBoyMixin<Signals extends SignalsRecord = {}>(Base: ClassType) {

    return class _SignalBoy extends Base {


        // - Members - //

        public signals: Record<string, Array<SignalListener>>;


        // - Constructor - //

        constructor(...passArgs: any[]) {
            super(...passArgs);
            this.signals = {};
        }


        // - Methods - //

        listenTo(name: string, callback: SignalListenerFunc, extraArgs?: any[], flags: SignalManFlags = SignalManFlags.None, groupId?: any | null) {
            // Prepare.
            let listeners = this.signals[name];
            const listener: SignalListener = [callback, extraArgs || null, flags || SignalManFlags.None ];
            if (groupId != null)
                listener.push(groupId);
            // New entry.
            if (!listeners)
                this.signals[name] = listeners = [ listener ];
            // Add to existing.
            else {
                // Check for a duplicate by callback. If has add in its place (to update the info), otherwise add to end.
                if (!listeners.some((info, index) => info[0] === callback ? listeners[index] = listener : false))
                    listeners.push( listener );
            }
            // Call.
            if (this.onListener)
                this.onListener(name, listeners.indexOf(listener), true);
        }

        unlistenTo(names?: string | string[] | null, callback?: SignalListenerFunc | null, groupId?: any | null) {
            // Prepare names.
            if (names == null)
                names = Object.keys(this.signals);
            else if (typeof names === "string")
                names = [ names ];
            // Loop by names.
            const hasGroupId = groupId != null;
            for (const thisName of names) {
                // Destroy in reverse order.
                const connections = this.signals[thisName];
                if (!connections)
                    continue;
                for (let i=connections.length-1; i>=0; i--) {
                    // Only the callback.
                    if (callback && connections[i][0] !== callback)
                        continue;
                    // Only the group.
                    if (hasGroupId && connections[i][3] !== groupId)
                        continue;
                    // Remove.
                    if (this.onListener)
                        this.onListener(thisName, i, false);
                    connections.splice(i, 1);
                }
                // Empty.
                if (!connections[0])
                    delete this.signals[thisName];
            }
        }

        isListening(name?: string | null, callback?: (SignalListenerFunc) | null, groupId?: any | null) {
            // Loop each by name.
            if (name == null)
                return Object.keys(this.signals).some(name => this.isListening(name, callback, groupId));
            // Empty.
            if (!this.signals[name])
                return false;
            // Callback doesn't match.
            if (callback && !this.signals[name].some(listener => listener[0] === callback))
                return false;
            // Group doesn't match.
            if (groupId != null && !this.signals[name].some(listener => listener[3] === groupId))
                return false;
            // Does match.
            return true;
        }

        onListener?(name: string, index: number, wasAdded: boolean): void;

    }
}

export function _SignalManMixin<Signals extends SignalsRecord = {}>(Base: ClassType) {

    return class _SignalMan extends _SignalBoyMixin(Base) {


        // - Sending signals - //

        sendSignal(name: string, ...args: any[]): any {
            if (this.signals[name])
                callListeners(this.signals[name], args);
        }

        // Note. This method assumes modes won't be modified during the call (in case uses delay or await).
        // .. This method can be extended, so uses string | string[] basis for modes in here.
        sendSignalAs(modes: string | string[], name: string, ...args: any[]): any {
            // Parse.
            const m = (typeof modes === "string" ? [ modes ] : modes) as Array<"" | "pre-delay" | "delay" | "await" | "last" | "first" | "first-true" | "no-false" | "no-null">;
            const isDelayed = m.includes("delay") || m.includes("pre-delay");
            const stopFirst = m.includes("first") || m.includes("first-true");
            // Return a promise.
            if (m.includes("await"))
                return new Promise<any>(async (resolve) => {
                    // Wait extra.
                    if (isDelayed)
                        await this.afterRefresh(m.includes("delay"));
                    // No listeners.
                    if (!this.signals[name])
                        return m.includes("last") || stopFirst ? resolve(undefined) : resolve([]);
                    // Resolve with answers.
                    // .. We have to do the four checks here manually, as we need to await the answers first.
                    let answers = (await Promise.all(askListeners(this.signals[name], args))).filter(a => !(a === undefined || a == null && m.includes("no-null") || !a && m.includes("no-false")));
                    if (m.includes("last"))
                        resolve(answers[-1]);
                    else if (stopFirst) {
                        if (m.includes("first-true"))
                            answers = answers.filter(val => val);
                        resolve(answers[0]);
                    }
                    else
                        resolve(answers);
                });
            // No promise, nor delay.
            if (!isDelayed)
                return this.signals[name] ? askListeners(this.signals[name], args, m as any[]) : m.includes("last") || stopFirst ? undefined : [];
            // Delayed without a promise - no return value.
            (async () => {
                await this.afterRefresh(m.includes("delay"));
                if (this.signals[name]) {
                    // Stop at first. Rarity, so we just support it through askListeners without getting the value.
                    if (stopFirst)
                        askListeners(this.signals[name], args, m as any[]);
                    // Just call.
                    else
                        callListeners(this.signals[name], args);
                }
            })();
            // No value to return.
            return undefined;
        }

        // Extendable handler.
        afterRefresh(fullDelay: boolean = false): Promise<void> {
            return new Promise<void>(resolve => setTimeout(resolve, fullDelay ? 1 : 0));
        }

    }
}

// /** There are two ways you can use this:
//  * 1. Call this to give basic SignalBoy features with types for Props and such being empty.
//  *      * `class MyMix extends SignalBoyMixin(MyBase) {}`
//  * 2. If you want to type the signals (as you very likely do), use this simple trick instead:
//  *      * `class MyMix extends (SignalBoyMixin as ClassMixer<typeof SignalBoy<{ someSignal: () => void; }>>)(MyBase) {}`
//  */
// export const SignalBoyMixin = _SignalBoyMixin as ClassMixer<SignalManType>;

/** There are two ways you can use this:
 * 1. Call this to give basic SignalMan features with types for Props and such being empty.
 *      * `class MyMix extends SignalManMixin(MyBase) {}`
 * 2. If you want to type the signals (as you very likely do), use this simple trick instead:
 *      * `class MyMix extends (SignalManMixin as ClassMixer<typeof SignalMan<{ someSignal: () => void; }>>)(MyBase) {}`
 */
export const SignalManMixin = _SignalManMixin as ClassMixer<SignalManType>;


// - SignalBoy class (without sending features) - //

/** This is like SignalMan but only provides listening: the sendSignal, sendSignalAs and afterRefresh methods are deleted (for clarity of purpose). */
export class SignalBoy<Signals extends SignalsRecord = {}> extends _SignalBoyMixin(Object) { }
export interface SignalBoy<Signals extends SignalsRecord = {}> { 
    
    // _Signals: Signals;

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


// - SignalMan class (with sending features) - //

export interface SignalManType<Signals extends SignalsRecord = {}> extends ClassType<SignalMan<Signals>> { }
export class SignalMan<Signals extends SignalsRecord = {}> extends (_SignalManMixin(Object) as ClassType) { }
export interface SignalMan<Signals extends SignalsRecord = {}> extends SignalBoy<Signals> {
    
    /** Send a signal. Does not return a value. Use `sendSignalAs(modes, name, ...args)` to refine the behaviour. */
    sendSignal<Name extends string & keyof Signals>(name: Name, ...args: Parameters<Signals[Name]>): void;
    /** This exposes various features to the signalling process which are inputted as the first arg: either string or string[]. Features are:
     * - "delay": Delays sending the signal. To also collect returned values must include "await".
     *      * Note that this delays the start of the process. So if new listeners are attached right after, they'll receive the signal.
     *      * The stand alone SignalMan simply uses setTimeout with 1ms delay. (On Components, Hosts and Contexts it's delayed to the "render" cycle of the host(s).)
     * - "pre-delay": This is like "delay" but uses 0ms timeout on the standalone SignalMan. (On Components, Hosts and Contexts it's delayed to their update cycle.)
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
     */
    sendSignalAs<
        Name extends string & keyof Signals,
        Mode extends "" | "pre-delay" | "delay" | "await" | "last" | "first" | "first-true" | "multi" | "no-false" | "no-null",
        HasAwait extends boolean = Mode extends string[] ? Mode[number] extends "await" ? true : false : Mode extends "await" ? true : false,
        HasLast extends boolean = Mode extends string[] ? Mode[number] extends "last" ? true : false : Mode extends "last" ? true : false,
        HasFirst extends boolean = Mode extends string[] ? Mode[number] extends "first" ? true : Mode[number] extends "first-true" ? true : false : Mode extends "first" ? true : Mode extends "first-true" ? true : false,
        HasDelay extends boolean = Mode extends string[] ? Mode[number] extends "delay" ? true : false : Mode extends "delay" ? true : false,
        UseReturnVal extends boolean = true extends HasAwait ? true : true extends HasDelay ? false : true,
    >(modes: Mode | Mode[], name: Name, ...args: Parameters<Signals[Name]>): true extends UseReturnVal ? SignalSendAsReturn<ReturnType<Signals[Name]>, HasAwait, HasLast | HasFirst> : undefined;
    /** This returns a promise that is resolved after the "pre-delay" or "delay" cycle has finished.
     * - By default uses a timeout of 1ms for fullDelay (for "delay") and 0ms otherwise (for "pre-delay").
     * - This is used internally by the sendSignalAs method with "pre-delay" or "delay". The method can be overridden to provide custom timing. */
    afterRefresh(fullDelay?: boolean): Promise<void>;
}
