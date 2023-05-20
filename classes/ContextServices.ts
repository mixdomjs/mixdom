

// - Imports - //

import { MixDOMContextRefresh } from "../static/_Types";
import { _Apply } from "../static/_Apply";
import { _Lib } from "../static/_Lib";
import { Host } from "./Host";
import { Context } from "./Context";
import { Component } from "./Component";
import { ContextAPI } from "./ContextAPI";
import { SignalManFlags, SignalListener } from "./SignalMan";


// - ContextServices - //

export class ContextServices {


    // - Members & construct - //

    // The Context instance we serve.
    private context: Context;

    // Private refreshing info.
    private refreshTimer: number | NodeJS.Timeout | null;
    /** Whenever new components attach to us for signal or data needs (or when components move), the order is dirtied. It will be sorted then on next usage for the appropriate side: "data" or "signals". */
    private dirtyOrder: MixDOMContextRefresh;

    // Delayed.
    /** These will be called on the refresh cycle. The handler afterSignalRefresh automatically utilizes the postHosts if present, to add the hosts there. */
    private _afterPreDelay?: Array<(postHosts: Set<Host> | null) => void>;
    /** These will be called on the post refresh cycle.
     * - However this is just a temp storage, they will be moved to _afterDelayPending collection on the refresh cycle. */
    private _afterDelay?: Array<(postHosts: Set<Host> | null) => void>;
    /** These will be called on the post refresh cycle. It's the final storage for them.
     * - Note that postHosts won't ever be found at this point (or for afterDelay side for that matter). The type is there just for fluent typing flow. */
    private _afterDelayPending?: [ Set<Host>, Array<(postHosts: Set<Host> | null) => void> ][];

    constructor(context: Context) {
        // Public.
        this.context = context;
        // Private.
        this.refreshTimer = null;
        this.dirtyOrder = 0;
    }


    // - Signals & listeners - //

    /** This returns all the signal component listeners in component's tree order. Should be called right before calling the listeners.
     * - Note that when returning the listeners, keeps the original array references, and so returns a double array.
     * - This is to suppor OneShot functionality fluently (and less copying).
     */
    public getListeners(signalName: string, returnInfos?: false | never): SignalListener[][] | null;
    public getListeners(signalName: string, returnInfos: true): [ContextAPI, string][] | null;
    public getListeners(signalName: string, returnInfos: boolean): SignalListener[][] | [ContextAPI, string][] | null;
    public getListeners(signalName: string, returnInfos?: boolean): SignalListener[][] | [ContextAPI, string][] | null {
        // Collect from components.
        let allListeners: SignalListener[][] | [ContextAPI, string][] = [];
        // Sort.
        const ctx = this.context;
        let sComponents = ctx.signalComponents;
        if (this.dirtyOrder & MixDOMContextRefresh.Actions) {
            if (sComponents.size > 1)
                ctx.signalComponents = sComponents = ContextServices.sortCollection(sComponents);
            this.dirtyOrder &= ~MixDOMContextRefresh.Actions;
        }
        // Collect all.
        for (const [component, ctxNames] of sComponents) {
            // Nope - shouldn't happen.
            const cApi = component.contextAPI as unknown as ContextAPI;
            if (!cApi)
                continue;
            // Loop by context names.
            for (const ctxName of ctxNames) {
                const lBy = cApi.signalsBy[ctxName];
                if (lBy && lBy[signalName]) {
                    if (returnInfos)
                        (allListeners as [ContextAPI, string][]).push( [cApi, ctxName] );
                    else
                        (allListeners as SignalListener[][]).push(lBy[signalName]);
                }
            }
        }
        // Add direct listeners to the end.
        if (this.context.signals[signalName])
            (allListeners as SignalListener[][]).push(this.context.signals[signalName]);
        // Return listeners.
        return allListeners[0] ? allListeners : null;
    }
    

    // - Refresh flow - //

    /** This returns a promise that is resolved on afterPreDelay or afterDelay cycle. Triggers refresh (so will be called). */
    public afterSignalRefresh(signalName: string, fullDelay: boolean = false, forceTimeout?: number | null): Promise<SignalListener[][] | null> {
        // Add to delayed.
        return new Promise<SignalListener[][] | null>(resolve => {
            // Prepare.
            const ctx = this.context;
            const delayType = fullDelay ? "_afterDelay" : "_afterPreDelay";
            if (!this[delayType])
                this[delayType] = [];
            // Add timer.
            (this[delayType] as any[]).push((postHosts: Set<Host> | null) => {
                // Get listeners now.
                const infos = this.getListeners(signalName, true);
                let allListeners: SignalListener[][] = [];
                // If found interested, add them to our listeners, and collect post hosts.
                if (infos) {
                    for (const [cApi, ctxName] of infos) {
                        const lBy = cApi.signalsBy[ctxName];
                        if (lBy && lBy[signalName]) {
                            // Combine listeners.
                            allListeners.push(lBy[signalName]);
                            // Add to post hosts, if it's time to collect them.
                            if (postHosts)
                                postHosts.add(cApi.component.boundary.host);
                        }
                    }
                }
                // Add direct listeners.
                if (ctx.signals[signalName])
                    allListeners.push(ctx.signals[signalName]);
                // Resolve with the listeners.
                resolve(allListeners[0] ? allListeners : null);
            });
            // Trigger refresh.
            this.triggerRefresh(ctx.settings.refreshTimeout, forceTimeout);
        });
    }

    /** Refresh the context. Uses the default timing unless specified. */
    public triggerRefresh(defaultTimeout: number | null, forceTimeout?: number | null): void {
        this.refreshTimer = _Lib.refreshWithTimeout(this, this.refreshPending, this.refreshTimer, defaultTimeout, forceTimeout);
    }

    /** This refreshes the context immediately.
     * - This is assumed to be called only by the .refresh function above.
     * - So it will mark the timer as cleared, without using clearTimeout for it. */
    private refreshPending(): void {
        // Get.
        const refreshKeys = this.context.dataKeysPending;
        let afterPreDelay = this._afterPreDelay;
        let afterDelay = this._afterDelay;
        // Clear.
        this.refreshTimer = null;
        this.context.dataKeysPending = null;
        delete this._afterPreDelay;
        delete this._afterDelay;
        // Prepare host collection for delayed signals.
        const pHosts = afterDelay ? new Set<Host>() : null;
        // Call signals on delayed listeners - also collect to pHosts.
        if (afterPreDelay) {
            for (const callback of afterPreDelay)
                callback(pHosts);
        }
        // Call data refresh on components - also collect to pHosts.
        if (refreshKeys)
            this.runData(refreshKeys, pHosts);
        // Trigger updates for post hosts.
        if (afterDelay && pHosts) {
            for (const host of [...pHosts]) {
                // If has anything pending, wait until rendered out.
                if (host.services.hasPending())
                    host.listenTo("onRender", this.onHostRender.bind(this, host), null, SignalManFlags.OneShot);
                // Otherwise no need.
                else
                    pHosts.delete(host);
            }
            // Add to pending.
            if (!this._afterDelayPending)
                this._afterDelayPending = [];
            this._afterDelayPending.push([pHosts, afterDelay]);
            // Run immediately.
            if (!pHosts.size)
                this.onHostRender();
        }
    }


    /** Run the data about for given boundaries and listeners. */
    private runData(refreshKeys: string[] | true, collectPostHosts?: Set<Host> | null): void {
        // Sort.
        const ctx = this.context;
        let dataComponents = ctx.dataComponents;
        if ((this.dirtyOrder & MixDOMContextRefresh.Data) && dataComponents.size > 1)
            ctx.dataComponents = dataComponents = ContextServices.sortCollection(dataComponents);
        this.dirtyOrder &= ~MixDOMContextRefresh.Data;
        // Loop all the data interested components.
        for (const [c, ctxNames] of dataComponents) {
            // Add to hosts for timing delayed signals.
            const host = c.boundary.host;
            if (collectPostHosts)
                collectPostHosts.add(host);
            // Loop the context names - typically, there's only one. There should also be cApi, but we make sure here.
            const cApi = (c.contextAPI as ContextAPI | undefined);
            if (cApi) {
                // Loop by context names attached to us - meaning we are the context referred to by the name.
                for (const ctxName of ctxNames) {
                    for (const [callback, [ctxDataKeys, fallbackArgs]] of cApi.dataListeners.entries()) { // Note that we use .entries() to take a copy of the situation.
                        // Verify that at least one matches.
                        let doRefresh = refreshKeys === true || (refreshKeys as string[]).some(rKey => {
                            const rCtxKey = ctxName + "." + rKey;
                            return ctxDataKeys.some(needsCtxKey => needsCtxKey === rCtxKey || needsCtxKey.startsWith(rCtxKey + ".") || rCtxKey.startsWith(needsCtxKey + "."));
                        });
                        // Call.
                        // .. Presumably this will trigger setState changes -> host.absorbUpdates(), which is what we want.
                        if (doRefresh)
                            callback(...cApi.buildDataArgsBy(ctxDataKeys, fallbackArgs));
                    }
                }
            }
        }
        // External listeners.
        if (ctx.dataListeners.size) {
            for (const [func, needs] of ctx.dataListeners) {
                if (refreshKeys === true || refreshKeys.some(key => needs.some(need => need === key || need.startsWith(key + ".") || key.startsWith(need + "."))))
                    func(...needs.map((need, i) => ctx.getInData(need as never)));
            }
        }
    }


    // - Callbacks - //

    /** Whenever a component becomes interested in us in terms of "data" or "signals", this is called and we add it to our interests. */
    public onInterest(side: "data" | "signals", component: Component, ctxName: string): void {
        // Modify.
        const context = this.context;
        const isData = side === "data";
        const collection: Map<Component, Set<string>> = isData ? context.dataComponents : context.signalComponents;
        const current = collection.get(component);
        current ? current.add(ctxName) : collection.set(component, new Set([ctxName]));
        this.dirtyOrder |= isData ? MixDOMContextRefresh.Data : MixDOMContextRefresh.Actions;
        // Callback.
        const method = isData ? "onDataInterests" : "onSignalInterests";
        if (context[method])
            (context[method] as NonNullable<Context[typeof method]>)(component, ctxName, true);
    }

    public onDisInterest(side: "data" | "signals", component: Component, ctxName: string): void {
        // Callback.
        const context = this.context;
        const isData = side === "data";
        const method = isData ? "onDataInterests" : "onSignalInterests";
        if (context[method])
            (context[method] as NonNullable<Context[typeof method]>)(component, ctxName, false);
        // Modify.
        const collection: Map<Component, Set<string>> = isData ? context.dataComponents : context.signalComponents;
        const current = collection.get(component);
        if (current) {
            current.delete(ctxName);
            if (!current.size)
                collection.delete(component);
        }
    }

    /** This thiggers calling the delayed signals. */
    public onHostRender(host: Host | null = null): void {
        // Stored ._afterDelayPending are required.
        const all = this._afterDelayPending;
        if (!all)
            return;
        // Loop each set, and run and remove if finished.
        let iSet = -1;
        for (const [ hosts, afterDelay ] of [...all]) {
            // Next.
            iSet++;
            // Remove.
            if (host)
                hosts.delete(host);
            // Finished totally.
            // .. Note that might have been 0 all along, if no host had pending updates.
            if (!hosts.size) {
                all.splice(iSet--, 1);
                for (const callback of afterDelay)
                    callback(null);
            }
        }
        // Remove if all finished.
        if (!all[0])
            delete this._afterDelayPending;
    }

    /** Whenever a component we're interested in moves, we must mark the order dirty. */
    public onComponentMove(component: Component, ctxName: string): void {
        const cApi = component.contextAPI;
        if (cApi)
            this.dirtyOrder |= (cApi.signalsBy[ctxName] && MixDOMContextRefresh.Actions || 0) | ([...cApi.dataListeners.values()].some(([needs]) => needs.some(need => need === ctxName || need.startsWith(ctxName + "."))) && MixDOMContextRefresh.Data || 0);
    }


    // - Static helpers - //

    public static sortCollection<Comp extends Component>(collection: Map<Comp, Set<string>>): Map<Comp, Set<string>> {
        // Sort.
        const sorted = [ ...collection.keys() ].map(c => c.boundary);
        _Apply.sortBoundaries(sorted);
        // Build a new map.
        return new Map(sorted.map(b => [b.component, collection.get(b.component as Comp)] as [Comp, Set<string>]));
    }
}
