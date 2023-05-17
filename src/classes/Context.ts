

// - Imports - //

import { ClassType, GetJoinedDataKeysFrom, MixDOMTreeNodeContexts } from "../static/_Types";
import { SignalSendAsReturn, SignalsRecord, askListenersBy, callListeners } from "./SignalMan";
import { DataSignalMan } from "./DataSignalMan";
import { _Defs } from "../static/_Defs";
import { Component } from "./Component";
import { ContextServices } from "./ContextServices";
import { _Lib } from "../static/_Lib";


// - Types - //

export type ContextSettings = {
    /** Timeout for refreshing for this particular context.
     * - The timeout is used for both: data refresh and (normal) actions.
     * - If null, then synchronous - defaults to 0ms.
     * - Note that if you use null, the updates will run synchronously.
     *   .. It's not recommended to use it, because you'd have to make sure you always use it in that sense.
     *   .. For example, the component you called from might have already unmounted on the next line (especially if host is fully synchronous, too). */
    refreshTimeout: number | null;
};


// - Class - //

export class Context<Data = any, Signals extends SignalsRecord = any> extends DataSignalMan<Data, Signals> {


    // - Static - //
    
    public static MIX_DOM_CLASS = "Context";

    ["constructor"]: ContextType<Data, Signals>;
    
    
    // - Members - //

    // Collections.
    /** Contains the TreeNodes where this context is inserted as keys and values is the name is inserted as.
     * - This is not used for refresh flow (anymore), but might be useful for custom purposes. */
    public inTree: Map<MixDOMTreeNodeContexts, Set<string>>;

    // // Data & contents.
    // public readonly data: Data;

    // Settings.
    public settings: ContextSettings;

    /** Internal services to keep the whole thing together and synchronized.
     * They are the semi-private internal part of Context, so separated into its own class. */
    services: ContextServices;

    /** The source components that are intersted in the signals and attached to it by 1. cascading, 2. tunneling, or 3. overriding.
     * - The value is a set of context names, as we don't know what we're called from ContextAPI's point of view.
     */
    signalComponents: Map<Component, Set<string>>;
    /** The source components that are interested in the data and attached to it by 1. cascading, 2. tunneling, or 3. overriding.
     * - The value is a set of context names, as we don't know what we're called from ContextAPI's point of view.
     * - Whenever a component is interested in us (= has a listener func with data-args referring to us), it's collected here.
     * - The needs are checked when the refresh cycle is performed.
     */
    dataComponents: Map<Component, Set<string>>;

    /** Temporary internal callbacks that will be called when the refresh cycle is done. */
    afterPreDelay?: Array<() => void>;
    /** Temporary internal callbacks that will be called after the refresh cycle and the related host "render" refresh have been flushed. */
    afterDelay?: Array<() => void>;


    // - Construct - //

    constructor(data: any, settings?: Partial<ContextSettings> | null | undefined) {
        // Base.
        super(data);
        // Listeners.
        this.dataComponents = new Map();
        this.signalComponents = new Map();
        // Collections.
        this.inTree = new Map();
        // Public settings.
        this.settings = Context.getDefaultSettings();
        // Internal services - for clarity and clearer mixin use.
        this.services = new ContextServices(this as unknown as Context); // Simpler typing.
        // Update settings.
        if (settings)
            this.modifySettings(settings);
    }


    // - Signal sending overrides (for fatter signal structure with double arrays) - //

    // Overridden to support double arrays.
    /** Emit a signal. Does not return a value. Use `sendSignalAs(modes, name, ...args)` to refine the behaviour. */
    public sendSignal<Name extends string & keyof Signals>(name: Name, ...args: Parameters<Signals[Name]>): void {
        const allListeners = this.services.getListeners(name);
        if (allListeners)
            for (const listeners of allListeners)
                callListeners(listeners, args);
    }
    // Overridden to support double arrays.
    /** This exposes various features to the signalling process which are inputted as the first arg: either string or string[]. Features are:
     * - "delay": Delays sending the signal. To also collect returned values must include "await".
     *      * Note that this delays the process to sync with the context refresh cycle and further after the related hosts have finished their "render" cycle.
     * - "pre-delay": Like "delay", syncs to the refresh cycle, but calls then on the context refresh cycle - without waiting for the hosts to have rendered.
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
    public sendSignalAs<
        Name extends string & keyof Signals,
        Mode extends "" | "pre-delay" | "delay" | "await" | "last" | "first" | "first-true" | "multi" | "no-false" | "no-null",
        HasAwait extends boolean = Mode extends string[] ? Mode[number] extends "await" ? true : false : Mode extends "await" ? true : false,
        HasLast extends boolean = Mode extends string[] ? Mode[number] extends "last" ? true : false : Mode extends "last" ? true : false,
        HasFirst extends boolean = Mode extends string[] ? Mode[number] extends "first" ? true : Mode[number] extends "first-true" ? true : false : Mode extends "first" ? true : Mode extends "first-true" ? true : false,
        HasDelay extends boolean = Mode extends string[] ? Mode[number] extends "delay" ? true : false : Mode extends "delay" ? true : false,
        HasPreDelay extends boolean = Mode extends string[] ? Mode[number] extends "pre-delay" ? true : false : Mode extends "pre-delay" ? true : false,
        UseReturnVal extends boolean = true extends HasAwait ? true : true extends HasDelay | HasPreDelay ? false : true,
    >(modes: Mode | Mode[], name: Name, ...args: Parameters<Signals[Name]>): true extends UseReturnVal ? SignalSendAsReturn<ReturnType<Signals[Name]>, HasAwait, HasLast | HasFirst> : undefined;
    public sendSignalAs(modes: string | string[], name: string, ...args: any[]): any {
        // Parse.
        const m = (typeof modes === "string" ? [ modes ] : modes) as Array<"" | "pre-delay" | "delay" | "await" | "last" | "first" | "first-true" | "no-false" | "no-null">;
        const isDelayed = m.includes("delay") || m.includes("pre-delay");
        const stopFirst = m.includes("first") || m.includes("first-true");
        // Return a promise.
        if (m.includes("await"))
            return new Promise<any>(async (resolve) => {
                // Get listeners - optionally by delay.
                const allListeners = isDelayed ? await this.services.afterSignalRefresh(name, m.includes("delay")) : this.services.getListeners(name);
                // No listeners.
                if (!allListeners)
                    return m.includes("last") || stopFirst ? resolve(undefined) : resolve([]);
                // Resolve with answers.
                // .. We have to do the four checks here manually, as we need to await the answers first.
                let answers = (await Promise.all(askListenersBy(allListeners, args))).filter(a => !(a === undefined || a == null && m.includes("no-null") || !a && m.includes("no-false")));
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
        // No promise, nor delay - return synchronous answers.
        if (!isDelayed) {
            const allListeners = this.services.getListeners(name);
            if (allListeners)
                return askListenersBy(allListeners, args, m as any[]);
            return m.includes("last") || stopFirst ? undefined : [];
        }
        // Delayed without a promise - no return value.
        // .. We scope this in an async func that we trigger immediately. This is to get the common flow with await and getAllListenersAfter.
        (async () => {
            // Wait until the refresh has been made and get listeners.
            const allListeners = await this.services.afterSignalRefresh(name, m.includes("delay"));
            if (allListeners) {
                // Stop at first. Rarity, so we just support it through askListeners without getting the value.
                if (stopFirst)
                    askListenersBy(allListeners, args, m as any[]);
                // Just call.
                else
                    for (const listeners of allListeners)
                        callListeners(listeners, args);
            }
        })();
        // .. Nothing to return.
        return undefined;
    }


    // - DataSignalMan overrides (to finish off the implementation) - //

    // Overridden.
    /** This returns a promise that is resolved when the context is refreshed, or after all the hosts have refreshed. */
    public afterRefresh(preDelaySide: boolean = false, forceTimeout?: number | null): Promise<void> {
        // Add to delayed.
        return new Promise<void>(async (resolve) => {
            // Prepare.
            const delayType = preDelaySide ? "_afterPreDelay" : "_afterDelay";
            if (!this.services[delayType])
                this.services[delayType] = [];
            // Add timer.
            (this[delayType] as any[]).push(() => resolve()); // We don't use any params - we have no signal name, we just wait until a general refresh has happened.
            // Trigger refresh.
            this.services.triggerRefresh(this.settings.refreshTimeout, forceTimeout);
        });
    }
    
    // Overridden to handle data refreshes.
    /** Trigger refresh of the context and optionally add data keys.
     * - This triggers calling pending data keys and delayed signals (when the refresh cycle is executed). */
    public refreshData<DataKey extends GetJoinedDataKeysFrom<Data & {}>>(dataKeys: DataKey | DataKey[] | boolean, forceTimeout?: number | null): void;
    public refreshData(dataKeys: string | string[] | boolean | null, forceTimeout?: number | null): void {
        // Add keys.
        if (dataKeys)
            this.addRefreshKeys(dataKeys);
        // Trigger contextual refresh.
        this.services.triggerRefresh(this.settings.refreshTimeout, forceTimeout);
    }
    

    // - Settings - //

    // Common basis. There's currently (anymore) 1 setting.
    /** Update settings with a dictionary. If any value is `undefined` then uses the default setting. */
    public modifySettings(settings: Partial<ContextSettings>): void {
        const defaults = Context.getDefaultSettings();
        for (const name in settings)
            settings[name] = settings[name] === undefined ? defaults[name] : settings[name];
    }


    // - Optional assignable callbacks - //

    // Tree nodes.
    /** Called when the context is inserted into the grounded tree. */
    public onInsertInto?(treeNode: MixDOMTreeNodeContexts, ctxName: string): void;
    /** Called when the context is removed from the grounded tree. */
    public onRemoveFrom?(treeNode: MixDOMTreeNodeContexts, ctxName: string): void;

    // Boundary interests.
    /** Called when a component is interested in data. */
    public onDataInterests?(component: Component, ctxName: string, isInterested: boolean): void;
    /** Called when a component is interested in signals. */
    public onSignalInterests?(component: Component, ctxName: string, isInterested: boolean): void;


    // - Static - //
    
    public static getDefaultSettings(): ContextSettings {
        return { refreshTimeout: 0 };
    }


    // - Typing - //

    /** This is only provided for typing related technical reasons. There's no actual Signals object on the javascript side. */
    _Signals: Signals;

}

export type ContextType<Data = any, Signals extends SignalsRecord = SignalsRecord> = ClassType<Context<Data, Signals>, [Data?, Partial<ContextSettings>?]> & {
    readonly MIX_DOM_CLASS: string; // "Context"
}


// - Create helpers - //

/** Create a new context. */
export const newContext = <Data = any, Signals extends SignalsRecord = SignalsRecord>(data?: Data, settings?: Partial<ContextSettings>): Context<Data, Signals> =>
    new Context<Data, Signals>(data, settings);

/** Create multiple named contexts. (Useful for tunneling.) */
export const newContexts = <
    Contexts extends { [Name in keyof AllData & string]: Context<AllData[Name]> },
    AllData extends { [Name in keyof Contexts & string]: Contexts[Name]["data"] } = { [Name in keyof Contexts & string]: Contexts[Name]["data"] }
>(contextsData: AllData, settings?: Partial<ContextSettings>): Contexts => {
    const contexts: Record<string, Context> = {};
    for (const name in contextsData)
        contexts[name] = newContext(contextsData[name], settings);
    return contexts as Contexts;
};
