

// - Imports - //

import {
    RecordableType,
    MixDOMTreeNode,
    MixDOMRenderInfo,
    MixDOMRenderOutput,
    MixDOMTreeNodeType,
    MixDOMTreeNodeDOM,
    MixDOMTreeNodeBoundary,
    MixDOMHydrationSuggester,
    MixDOMHydrationValidator,
    MixDOMUpdateCompareModesBy,
    MixDOMRenderTextTag,
    MixDOMRenderTextContentCallback,
    DOMTags,
    MixDOMCloneNodeBehaviour,
    MixDOMTreeNodeHost,
    MixDOMDefBoundary,
    MixDOMDefApplied,
} from "../static/_Types";
import { _Lib } from "../static/_Lib";
import { _Defs } from "../static/_Defs";
import { _Find } from "../static/_Find";
import { SourceBoundary } from "./Boundary";
import { HostServices } from "./HostServices";
import { HostRender } from "./HostRender";
import { ComponentTypeAny, ComponentWith } from "./Component";
import { ContextAPI, MixDOMContextsAll } from "./ContextAPI";
import { SignalListener } from "./SignalMan";


// - HostContextAPI class - //

/** This is simply a tiny class that is used to manage the host duplication features in a consistent way.
 * - Each Host has a `.shadowAPI`, but it's the very same class instance for all the hosts that are duplicated - the original and any duplicates have the same instance here.
 * - This way, it doesn't matter who is the original source (or if it dies away). As long as the shadowAPI instance lives, the originality lives.
 */
export class HostShadowAPI<Contexts extends MixDOMContextsAll = {}> {
    /** These are the Host instances that share the common duplication basis. Note that only appear here once mounted (and disappear once cleaned up). */
    hosts: Set<Host<Contexts>> = new Set();
    /** These are the duplicatable contexts (by names). Any time a Host is duplicated, it will get these contexts automatically. */
    contexts: Partial<Contexts> = {};
}

/** The Host based ContextAPI simply adds an extra argument to the setContext and setContexts methods for handling which contexts are auto-assigned to duplicated hosts.
 * - It also has the afterRefresh method assign to the host's cycles. */
export interface HostContextAPI<Contexts extends MixDOMContextsAll = {}> extends ContextAPI<Contexts> {
    /** The Host that this ContextAPI is attached to. Should be set manually after construction.
     * - It's used for two purposes: 1. Marking duplicatable contexts to the Host's shadowAPI, 2. syncing to the host refresh (with the afterRefresh method).
     * - It's assigned as a member to write HostContextAPI as a clean class.
     */
    host: Host<Contexts>;
    /** Attach the context to this ContextAPI by name. Returns true if did attach, false if was already there.
     * - Note that if the context is `null`, it will be kept in the bookkeeping. If it's `undefined`, it will be removed.
     *      * This only makes difference when uses one ContextAPI to inherit its contexts from another ContextAPI.
     * - Note that this method is extended on the HostContextAPI to include markAsDuplicatable option (defaults to false).
     *      * If set to true, will also modify the host.shadowAPI.contexts: if has a context adds there, if null or undefined removes from there.
     *      * It's a dictionary used for auto-assigning contexts to a new duplicated host - requires `host.settings.duplicatableHost: true`.
     */
    setContext<Name extends keyof Contexts & string>(name: Name, context: Contexts[Name] | null | undefined, callDataIfChanged?: boolean, markAsDuplicatable?: boolean): boolean;
    /** Set multiple named contexts in one go. Returns true if did changes, false if didn't. This will only modify the given keys.
     * - Note that if the context is `null`, it will be kept in the bookkeeping. If it's `undefined`, it will be removed.
     *      * This only makes difference when uses one ContextAPI to inherit its contexts from another ContextAPI.
     * - Note that this method is extended on the HostContextAPI to include markAsDuplicatable option (defaults to false).
     *      * If set to true, will also modify the host.shadowAPI.contexts: if has a context adds there, if null or undefined removes from there.
     *      * It's a dictionary used for auto-assigning contexts to a new duplicated host - requires `host.settings.duplicatableHost: true`.
     */
    setContexts(contexts: Partial<{[CtxName in keyof Contexts]: Contexts[CtxName] | null | undefined; }>, callDataIfChanged?: boolean, markAsDuplicatable?: boolean): boolean;
    /** This triggers a refresh and returns a promise that is resolved when the Host's update / render cycle is completed.
     * - If there's nothing pending, then will resolve immediately. 
     * - This uses the signals system, so the listener is called among other listeners depending on the adding order. */
    afterRefresh(fullDelay?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): Promise<void>;
    /** Attached to provide adding all component based signals. Note that will skip any components that have the given context name overridden. */
    getListenersFor<CtxName extends string & keyof Contexts>(ctxName: CtxName, signalName: string & keyof Contexts[CtxName]["_Signals"]): SignalListener[] | undefined;
    /** Attached to provide adding all component based data listeners. Note that will skip any components that have all of those names overridden. */
    callDataListenersFor(ctxNames: string[], dataKeys?: true | string[]): void;
}
export class HostContextAPI<Contexts extends MixDOMContextsAll = {}> extends ContextAPI<Contexts> {


    // - Setting contexts - //

    public setContext<Name extends keyof Contexts & string>(name: Name, context: Contexts[Name] | null | undefined, callDataIfChanged: boolean = true, markAsDuplicatable: boolean = false): boolean { 
        // Handle local bookkeeping.
        if (markAsDuplicatable)
            context ? this.host.shadowAPI.contexts[name] = context : delete this.host.shadowAPI.contexts[name];
        // Basis.
        return super.setContext(name as never, context as never, callDataIfChanged);
    }
    public setContexts(namedContexts: Partial<{[CtxName in keyof Contexts]: Contexts[CtxName] | null | undefined; }>, callDataIfChanged: boolean = true, markAsDuplicatable: boolean = false): boolean {
        // Handle local bookkeeping.
        if (markAsDuplicatable) {
            const dContexts = this.host.shadowAPI.contexts;
            for (const ctxName in namedContexts)
                namedContexts[ctxName] ? dContexts[ctxName] = namedContexts[ctxName] as any : delete dContexts[ctxName];
        }
        // Basis.
        return super.setContexts(namedContexts, callDataIfChanged);
    }


    // - Handling refresh - //

    public afterRefresh(fullDelay?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): Promise<void> {
        return this.host.afterRefresh(fullDelay, updateTimeout, renderTimeout);
    }


    // - Getting / Calling indirect (component) listeners - //

    public getListenersFor<CtxName extends string & keyof Contexts>(ctxName: CtxName, signalName: string & keyof Contexts[CtxName]["_Signals"]): SignalListener[] | undefined {
        // Prepare.
        const ctxSignalName = ctxName + "." + signalName;
        // Collect all.
        const listeners = (this.signals[ctxSignalName] || []).concat([...this.host.contextComponents]
            // Only allow those that match and are not on components that have direct overrides for the given name - as they would be collected directly if related. (If unrelated, then nothing to do.)
            .filter(comp => comp.contextAPI.signals[ctxSignalName] && (comp.contextAPI.contexts[ctxName] === undefined))
            // Convert to the listeners and reduce the double structure away.
            .map(comp => comp.contextAPI.signals[ctxSignalName]).reduce((a, c) => a.concat(c), []) );
        return listeners[0] && listeners;
    }
    public callDataListenersFor(ctxNames: string[], dataKeys: true | string[] = true): void {
        // Call the direct.
        const ctxDataKeys = dataKeys === true ? ctxNames : ctxNames.map(ctxName => dataKeys.map(key => ctxName + "." + key)).reduce((a, c) => a.concat(c)) as any;
        this.callDataBy(ctxDataKeys as never);
        // Call indirect - but only the ones who has not overridden the given context names locally.
        // .. If has overridden locally, will be refreshed directly if related.
        for (const comp of this.host.contextComponents)
            if (ctxNames.some(ctxName => comp.contextAPI.contexts[ctxName] === undefined))
                comp.contextAPI.callDataBy(ctxDataKeys as never);
    }
}


// - Types - //

export interface HostType<Contexts extends MixDOMContextsAll = {}> {
    /** Used for host based id's. To help with sorting fluently across hosts. */
    idCount: number;
    new (content?: MixDOMRenderOutput, domContainer?: Node | null, settings?: HostSettingsUpdate | null): Host<Contexts>;
    modifySettings(baseSettings: HostSettings, newSettings: HostSettingsUpdate): void;
    getDefaultSettings(): HostSettings;
}

export interface HostSettingsUpdate extends Partial<Omit<HostSettings, "updateComponentModes">> {
    updateComponentModes?: Partial<HostSettings["updateComponentModes"]>;
}

/** Settings for MixDOM behaviour for all inside a host instance.
 * The settings can be modified in real time: by host.updateSettings(someSettings) or manually, eg. host.settings.updateTimeout = null. */
export interface HostSettings {
    
	/** If is null, then is synchronous. Otherwise uses the given timeout in ms. Defaults to 0ms.
     * - This timeout delays the beginning of the update process.
     *   * After the timeout has elapsed, .render() is called on components and a new structure is received.
     *   * The structure is then applied to the component, and for any nested components similarly .render() is called and then the defs applied recursively.
     *   * Finally, the process outputs a list of render callbacks to apply the related dom changes. Executing the changes can be delayed with the 2nd timeout: settings.renderTimeout.
     * - Note. Generally this helps to combine multiple updates together and thus prevent unnecessary updates.
     *   * This is useful if (due to complex app setup) you sometimes end up calling update multiple times for the same component.
     *     .. Without this, the update procedure would go through each time (and if rendering set to null, it as well).
     *     .. But with this, the updates get clumped together. For example, updating immediately after startup will not result in onUpdate, but only one onMount.
     * - Recommended usage for updateTimeout & renderTimeout:
     *   * For most cases, use updateTimeout: 0 and renderTimeout: 0 or null. Your main code line will run first, and rendering runs after (sync or async).
     *   * If you want synchronous updates on your components, use updateTimeout: null, renderTimeout: 0 - so updates are done before your main code line continues, but dom rendering is done after.
     *     .. In this case also consider putting useImmediateCalls to true.
     *   * If you want everything to be synchronous (including the dom), put both to null. */
    updateTimeout: number | null;

    /** If is null, then is synchronous. Otherwise uses the given timeout in ms. Defaults to 0ms.
     * - This timeout delays the actual dom rendering part of the component update process.
     * - It's useful to have a tiny delay to save from unnecessary rendering, when update gets called multiple times - even 0ms can help.
     * - Only use null renderTimeout (= synchronous rendering after updateTimeout) if you really want rendering to happen immediately after update.
     *     * Typically, you then also want the updateTimeout to be null (synchronous), so you get access to your dom elements synchronously.
     * - Note that renderTimeout happens after updateTimeout, so they both affect how fast rendering happens - see settings.updateTimeout for details. */
    renderTimeout: number | null;

    /** The lifecycle calls (onMount, onUpdate, ...) are collected (together with render infos) and called after the recursive update process has finished.
     * - This option controls whether the calls are made immediately after the update process or only after the (potentially delayed) rendering.
     * - Keep this as false, if you want the components to have their dom elements available upon onMount - like in React. (Defaults to false.)
     * - Put this to true, only if you really want the calls to be executed before the rendering happens.
     *     * If you combine this with updateTimeout: null, then you get synchronously updated state, with only rendering delayed.
     *     * However, you won't have dom elements on mount. To know when that happens should use refs or signals and .domDidMount and .domWillUnmount callbacks. */
    useImmediateCalls: boolean;

    /** Defines what components should look at when doing onShouldUpdate check for "props" and "state". */
    updateComponentModes: MixDOMUpdateCompareModesBy;

    /** Whether does a equalDOMProps check on the updating process.
     * - If true: Only adds render info (for updating dom props) if there's a need for it.
     * - If false: Always adds render info for updating dom elements. They will be diffed anyhow.
     * - If "if-needed": Then marks to be updated if had other rendering needs (move or content), if didn't then does equalDOMProps check. (So that if no need, don't mark render updates at all.)
     * Note that there is always a diffing check before applying dom changes, and the process only applies changes from last set.
     * .. In other words, this does not change at all what gets applied to the dom.
     * .. The only thing this changes, is whether includes an extra equalDOMProps -> boolean run during the update process.
     * .. In terms of assumed performance:
     * .... Even though equalDOMProps is an extra process, it's a bit faster to run than collecting diffs and in addition it can stop short - never add render info.
     * .... However, the only time it stops short is for not-equal, in which case it also means that we will anyway do the diff collection run later on.
     * .... In other words, it's in practice a matter of taste: if you want clean renderinfos (for debugging) use true. The default is "if-needed". */
    preCompareDOMProps: boolean | "if-needed";

    /** The maximum number of times a boundary is allowed to be render during an update due to update calls during the render func.
     * .. If negative, then there's no limit. If 0, then doesn't allow to re-render. The default is 1: allow to re-render once (so can render twice in a row).
     * .. If reaches the limit, stops re-rendering and logs a warning if devLogToConsole has .Warnings on. */
    maxReRenders: number;

    /** Which element (tag) to wrap texts (from props.children) into.
     * - By default, no wrapping is applied: treats texts as textNodes (instanceof Node).
     * - You can also pass in a callback to do custom rendering - should return a Node, or then falls back to textNode. */
    renderTextTag: MixDOMRenderTextTag;

    /** Tag to use for as a fallback when using the MixDOM.defHTML feature (that uses .innerHTML on a dummy element). Defaults to "span".
     * - It only has meaning, if the output contains multiple elements and didn't specifically define the container tag to use. */
    renderHTMLDefTag: DOMTags;

    /** If you want to process the simple content text, assign a callback here. */
    renderTextHandler: MixDOMRenderTextContentCallback | null;

    /** This defines how MixDOM will treat "simple content". The options are:
     *     1. When set to false (default), renders everything except null and undefined. (Other values are stringified.)
     *     2. When set to true, renders only values that doesn't amount to !!false. So skips: false and 0 as well.
     *     3. Third option is to give an array of values that should never be rendered.
     * Technical notes:
     *     - Regardless of the setting, MixDOM will always skip simple content of `null` and `undefined` (already at the static def creation level).
     *     - This setting applies as early as possible in the non-static side of process (in pairDefs routine).
     *     - How it works is that it will actually go and modify the target def by removing any unwanted child, before it would be paired.
     */
    noRenderValuesMode: boolean | any[];

    /** For svg content, the namespaceURI argument to be passed into createElementNS(namespaceURI, tag).
     * If none given, hard coded default is: "http://www.w3.org/2000/svg" */
    renderSVGNamespaceURI: string;

    /** When using MixDOM.Element to insert nodes, and swaps them, whether should apply (true), and if so whether should read first ("read").
     * Defaults to true, which means will apply based on scratch, but not read before it. */
    renderDOMPropsOnSwap: boolean | "read";

    /** This is useful for server side functionality. (Defaults to false, as most of the times you're using MixDOM on client side.)
     * - Put this to true, to disable the rendering aspects (will pause the dedicated HostRender instance). Instead use host.readAsString() or MixDOM.readAsString(treeNode) to get the html string.
     * - Note that you might want to consider putting settings.renderTimeout to null, so that the dom string is immediately renderable after the updates. */
    disableRendering: boolean;

    /** This is useful for nesting hosts.
     * - Put this to true to make nested but not currently grounded hosts be unmounted internally.
     * - When they are grounded again, they will mount and rebuild their internal structure from the rootBoundary up. */
    onlyRunInContainer: boolean;

    /** When pairing defs for reusing, any arrays are dealt as if their own key scope by default.
     * - By setting this to true, wide key pairing is allowed for arrays as well.
     * - Note that you can always use {...myArray} instead of {myArray} to avoid this behaviour (even wideKeysInArrays: false).
     *   .. In other words, if you do not want the keys in the array contents to mix widely, keep it as an array - don't spread it. */
    wideKeysInArrays: boolean;

    /** Default behaviour for handling duplicated instances of dom nodes.
     * - The duplication can happen due to manually inserting many, or due to multiple content passes, copies, or .getChildren().
     * - The detection is host based and simply based on whether the element to create was already grounded or not. */
    duplicateDOMNodeBehaviour: MixDOMCloneNodeBehaviour | "";
    /** Custom handler for the duplicateDOMNodeBehaviour. */
    duplicateDOMNodeHandler: ((domNode: Node, treeNode: MixDOMTreeNodeDOM) => Node | null) | null;
    /** Whether this host can be auto-duplicated when included dynamically multiple times. Defaults to false.
     * - Can also be a callback that returns a boolean (true to include, false to not), or a new host.
     * - Note that if uses a custom Host class, the new duplicate will be made from the normal Host class. Use the callback to provide manually.
     * - The treeNode in the arguments defines where would be inserted. */
    duplicatableHost: boolean | ((host: Host, treeNode: MixDOMTreeNodeHost) => Host | boolean | null);

    /** For weird behaviour. */
    devLogWarnings: boolean;
    /** Mostly for developing MixDOM.
     * - This log can be useful when testing how MixDOM behaves (in very small tests, not for huge apps) - eg. to optimize using keys.
     * - To get nice results, set preCompareDOMProps setting to `true`. */
    devLogRenderInfos: boolean;

}


// - Class - //

/** This is the main class to orchestrate and start rendering. */
// export class Host<Data extends any = any, Signals extends SignalsRecord = {}> extends DataSignalMan<Data, HostSignals & Signals> { 
export class Host<Contexts extends MixDOMContextsAll = {}> {

    
    // - Static - //
    
    public static MIX_DOM_CLASS = "Host";
    public static idCount = 0;

    ["constructor"]: HostType<Contexts>;

    
    // - Members - //

    /** This represents abstractly what the final outcome looks like in dom. */
    public groundedTree: MixDOMTreeNode;
    /** The root boundary that renders whatever is fed to the host on .update or initial creation. */
    public rootBoundary: SourceBoundary;
    /** The general settings for this host instance.
     * - Do not modify directly, use the .modifySettings method instead.
     * - Otherwise rendering might have old settings, or setting.onlyRunInContainer might be uncaptured. */
    public settings: HostSettings;
    /** Internal services to keep the whole thing together and synchronized.
     * They are the semi-private internal part of Host, so separated into its own class. */
    services: HostServices;

    /** This is used for duplicating hosts. It's the very same instance for all duplicated (and their source, which can be a duplicated one as well). */
    public shadowAPI: HostShadowAPI<Contexts>;
    /** This provides the data and signal features for this Host and all the Components that are part of it.
     * - You can use .contextAPI directly for external usage.
     * - When using from within components, it's best to use their dedicated methods (for auto-disconnection features). */
    public contextAPI: HostContextAPI<Contexts>;
    /** This contains all the components that have a contextAPI assigned. Automatically updated, used internally. The info can be used for custom purposes (just don't modify). */
    public contextComponents: Set<ComponentWith>;


    // - Init - //

    constructor(content?: MixDOMRenderOutput, domContainer?: Node | null, settings?: HostSettingsUpdate | null, contexts?: Contexts | null, shadowAPI?: HostShadowAPI | null) {


        // - Initialize - //

        // Static.
        this.constructor.idCount++;

        // Initialize.
        // .. ShadowAPI.
        this.shadowAPI = shadowAPI || new HostShadowAPI();
        this.contextComponents = new Set();
        // .. ContextAPI.
        this.contextAPI = new HostContextAPI();
        this.contextAPI.host = this;
        if (contexts)
            this.contextAPI.setContexts(contexts as any, false, true); // Don't call, but mark the initial ones as permanent.
        
        // .. And groundedTree.
        this.groundedTree = {
            type: "root",
            parent: null,
            children: [],
            domNode: domContainer || null,
            sourceBoundary: null
        };

        // .. And then settings.
        this.settings = Host.getDefaultSettings();
        if (settings)
            Host.modifySettings(this.settings, settings);

        // .. And then services - to initialize HostRender class with proper refs.
        this.services = new HostServices(this);


        // - Start up - //

        // Create root component with the first content.
        const Root = this.services.createRoot(content);
        // Create base tree node for the root boundary.
        const sourceDef = _Defs.newAppliedDef({ MIX_DOM_DEF: "boundary", tag: Root, props: {}, childDefs: [] }, null) as MixDOMDefApplied & MixDOMDefBoundary;
        const treeNode: MixDOMTreeNodeBoundary = {
            type: "boundary",
            def: sourceDef,
            sourceBoundary: null,
            // For type clarity, we define (for typescript) that treeNode always has a boundary.
            // .. However, we always instance it with the treeNode, so it's impossible.
            // .. But it will be set right after instancing (here and in _Apply). Hence, the weird typescripting here.
            boundary: null as unknown as SourceBoundary,
            parent: this.groundedTree,
            children: [],
            domNode: null
        };
        this.groundedTree.children.push(treeNode);
        // Create boundary.
        this.rootBoundary = new SourceBoundary(this, sourceDef, treeNode);
        treeNode.boundary = this.rootBoundary;
        this.rootBoundary.reattach();
        // Run updates.
        this.services.absorbUpdates(this.rootBoundary, {});
    }



    // - Root methods - //

    /** Clear whatever has been previously rendered - destroys all boundaries inside the rootBoundary. */
    public clearRoot(update: boolean = true, updateTimeout?: number | null, renderTimeout?: number | null): void {
        // Clear.
        this.services.clearRoot(true);
        // Update.
        if (update)
            this.rootBoundary.update(true, updateTimeout, renderTimeout);
    }
    /** Move the host root into another dom container. */
    public moveRoot(newParent: Node | null, renderTimeout?: number | null): void {
        // Already there.
        if (this.groundedTree.domNode === newParent)
            return;
        // Update.
        this.groundedTree.domNode = newParent;
        // Create render infos.
        const renderInfos = _Find.rootDOMTreeNodes(this.rootBoundary.treeNode, true).map(treeNode => ({ treeNode, move: true }) as MixDOMRenderInfo);
        // Trigger render.
        if (renderInfos[0] || (renderTimeout !== undefined))
            this.services.absorbChanges(renderInfos, null, renderTimeout);
    }
    /** Update the previously render content with new render output definitions. */
    public updateRoot(content: MixDOMRenderOutput, updateTimeout?: number | null, renderTimeout?: number | null): void {
        this.services.updateRoot(content, updateTimeout, renderTimeout);
    }
    /** Triggers an update on the host root, optionally forcing it. This is useful for refreshing the container. */
    public refreshRoot(forceUpdate: boolean = false, updateTimeout?: number | null, renderTimeout?: number | null): void {
        this.services.refreshRoot(forceUpdate, updateTimeout, renderTimeout);
    }


    // - Refreshing - //

    /** Triggers a process that refreshes the dom nodes based on the current state.
     * - In case forceDOMRead is on will actually read from dom to look for real changes to be done.
     * - Otherwise just reapplies the situation - as if some updates had not been done.
     * - Note. This is a partly experimental feature - it's not assumed to be used in normal usage. */
    public refreshDOM(forceDOMRead: boolean = false, renderTimeout?: number | null): void {
        // Go through the MixDOMTreeNode structure and refresh each.
        const refresh = forceDOMRead ? "read" : true;
        const renderInfos: MixDOMRenderInfo[] = [];
        let nextNodes = [...this.groundedTree.children] as MixDOMTreeNodeDOM[];
        let treeNode: MixDOMTreeNodeDOM | undefined;
        let i = 0;
        while (treeNode = nextNodes[i]) {
            // Next.
            i += 1;
            // If describes a dom node.
            if (treeNode.domProps) {
                treeNode
                renderInfos.push({
                    treeNode,
                    refresh,
                });
            }
            // Add to loop.
            if (treeNode.children[0]) {
                nextNodes = treeNode.children.concat(nextNodes.slice(i)) as MixDOMTreeNodeDOM[];
                i = 0;
            }
        }
        // Render.
        this.services.absorbChanges(renderInfos, null, renderTimeout);
    }
    
    // Overridden.
    /** This triggers a refresh and returns a promise that is resolved when the update / render cycle is completed.
     * - If there's nothing pending, then will resolve immediately. 
     * - Note that this uses the signals system, so the listener is called among other listeners depending on the adding order. */
    public afterRefresh(renderSide: boolean = false, updateTimeout?: number | null, renderTimeout?: number | null): Promise<void> {
        return new Promise<void>(resolve => this.afterRefreshCall(resolve, renderSide, updateTimeout, renderTimeout));
    }

    /** This is like afterRefresh but works with a callback, given as the first arg. (This is the core method for the feature.)
     * - Triggers a refresh and calls the callback once the update / render cycle is completed.
     * - If there's nothing pending, then will call immediately. 
     * - Note that this uses the signals system, so the listener is called among other listeners depending on the adding order. */
    public afterRefreshCall(callback: () => void, renderSide: boolean = false, updateTimeout?: number | null, renderTimeout?: number | null): void {
        // No pending - call immediately.
        if (!this.services.hasPending(true, renderSide))
            callback();
        // Add a listener and trigger refresh.
        else {
            // Add to refresh wait.
            const side = renderSide ? "_afterRender" : "_afterUpdate";
            (this.services[side] || (this.services[side] = [])).push(callback);
            // Trigger updates.
            this.services.triggerUpdates(updateTimeout, renderTimeout);
        }
    }
    
    /** Trigger refreshing the host's pending updates and render changes. */
    public triggerRefresh(updateTimeout?: number | null, renderTimeout?: number | null): void {
        this.services.triggerUpdates(updateTimeout, renderTimeout);
    }


    // - Pausing & hydration - //

    /** Pause the rendering. Resume it by calling resume(), rehydrate() or rehydrateWith(). */
    public pause(): void {
        this.services.renderer.pause();
    }
    /** Resume rendering - triggers rehydration. */
    public resume(): void {
        this.services.renderer.resume();
    }
    /** Tells whether the rendering is currently paused or not. */
    public isPaused(): boolean {
        return this.services.renderer.paused;
    }
    /** This rehydrates the rendered defs with actual dom elements iterating down the groundedTree and the container (defaults to the host's container element).
     * - It supports reusing custom html elements from a custom "container" element as well. Note it should be the _containing_ element.
     * - In readAllMode will re-read the current dom props from the existing ones as well. Defaults to false.
     * - In smuggleMode will replace the existing elements with better ones from "from" - otherwise only tries to fill missing ones. Defaults to false.
     * - In destroyOthersMode will destroy the other unused elements found in the container. Defaults to false. Note. This can be a bit dangerous.
     * - This also resumes rendering if was paused - unless is disableRendering is set to true in host settings.
     */
    public rehydrate(container: Node | null = null, readAllMode: boolean = false, smuggleMode: boolean = false, destroyOthersMode: boolean = false, validator?: MixDOMHydrationValidator, suggester?: MixDOMHydrationSuggester): void {
        // Hydrate (and resume).
        this.services.renderer.rehydrate(container || this.groundedTree.domNode, readAllMode, smuggleMode, destroyOthersMode, validator, suggester);
    }
    /** This accepts new render content to update the groundedTree first and then rehydrates accordingly. See rehydrate method for details of the other arguments.
     * - Functions synchronously, so applies all updates and rendering immediately.
     * - Note that like rehydrate this also resumes paused state. (And works by: 1. pause, 2. update, 3. rehydrate.) */
    public rehydrateWith(content: MixDOMRenderOutput, container: Node | null = null, readAllMode: boolean = false, smuggleMode: boolean = false, destroyOthersMode: boolean = false, validator?: MixDOMHydrationValidator, suggester?: MixDOMHydrationSuggester): void {
        // Pause rendering.
        this.pause();
        // Update immediately.
        this.updateRoot(content, null, null);
        // Resume by rehydrating.
        this.services.renderer.rehydrate(container || this.groundedTree.domNode, readAllMode, smuggleMode, destroyOthersMode, validator, suggester);
    }

    
    // - Getters - //

    /** Read the whole rendered contents as a html string. Typically used with settings.disableRendering (and settings.renderTimeout = null). */
    public readAsString(): string {
        return HostRender.readAsString(this.rootBoundary.treeNode);
    }
    /** Get the root dom node (ours or by a nested boundary) - if has many, the first one (useful for insertion). */
    public getRootElement(): Node | null {
        return this.rootBoundary && this.rootBoundary.treeNode.domNode;
    }
    /** Get all the root dom nodes - might be many if used with a fragment.
     * - Optionally define whether to search in nested boundaries or not (by default does). */
    public getRootElements(inNestedBoundaries?: boolean): Node[] {
        return this.rootBoundary ? _Find.rootDOMTreeNodes(this.rootBoundary.treeNode, inNestedBoundaries, false).map(treeNode => treeNode.domNode) as Node[] : [];
    }
    /** Get the first dom element by a selectors within the host (like document.querySelector). Should rarely be used, but it's here if needed. */
    public queryElement<T extends Element = Element>(selectors: string, overHosts: boolean = false): T | null {
        return _Find.domElementByQuery<T>(this.groundedTree, selectors, true, overHosts);
    }
    /** Get dom elements by a selectors within the host (like document.querySelectorAll). Should rarely be used, but it's here if needed. */
    public queryElements<T extends Element = Element>(selectors: string, maxCount: number = 0, overHosts: boolean = false): T[] {
        return _Find.domElementsByQuery<T>(this.groundedTree, selectors, maxCount, true, overHosts);
    }
    /** Find all dom nodes by an optional validator. */
    public findElements<T extends Node = Node>(maxCount: number = 0, overHosts: boolean = false, validator?: (treeNode: MixDOMTreeNode) => any): T[] {
        return _Find.treeNodesWithin(this.groundedTree, { dom: true }, maxCount, true, overHosts, validator).map(tNode => tNode.domNode) as T[];
    }
    /** Find all components by an optional validator. */
    public findComponents<Comp extends ComponentTypeAny = ComponentTypeAny>(maxCount: number = 0, overHosts: boolean = false, validator?: (treeNode: MixDOMTreeNode) => any): Comp[] {
        return _Find.treeNodesWithin(this.groundedTree, { boundary: true }, maxCount, true, overHosts, validator).map(t => (t.boundary && t.boundary.component) as unknown as Comp);
    }
    /** Find all treeNodes by given types and an optional validator. */
    public findTreeNodes(types: RecordableType<MixDOMTreeNodeType>, maxCount: number = 0, overHosts: boolean = false, validator?: (treeNode: MixDOMTreeNode) => any): MixDOMTreeNode[] {
        return _Find.treeNodesWithin(this.groundedTree, types && _Lib.buildRecordable<MixDOMTreeNodeType>(types), maxCount, true, overHosts, validator);
    }


    // - Settings - //
    
    /** Modify previously given settings with partial settings.
     * - Note that if any value in the dictionary is `undefined` uses the default setting.
     * - Supports handling the related special cases:
     *      * `onlyRunInContainer`: Refreshes whether is visible or not (might destroy all / create all, if needed).
     */
    public modifySettings(settings: HostSettingsUpdate, passToDuplicated: boolean = true): void {
        // Collect state before.
        const onlyRunWas = this.settings.onlyRunInContainer;
        // Update each values.
        Host.modifySettings(this.settings, settings);
        // Detect special changes.
        // .. Run the update immediately.
        if (settings.onlyRunInContainer !== undefined && settings.onlyRunInContainer !== onlyRunWas)
            this.refreshRoot(false, null, null);
        // Update duplicated hosts.
        if (passToDuplicated)
            for (const host of this.shadowAPI.hosts)
                if (host !== this)
                    host.modifySettings(settings, false);
    }


    // - Static helpers - //

    public static modifySettings(base: HostSettings, newSettings: HostSettingsUpdate, useDefaults = false): void {
        // Prepare.
        let defaults: HostSettings | null = null;
        // Pre-handle special cases: an object like setting value.
        if (newSettings.updateComponentModes) {
            const newUpdModes = newSettings.updateComponentModes;
            const updModes: Partial<HostSettings["updateComponentModes"]> = {};
            for (const type in newUpdModes)
                updModes[type] = newUpdModes[type] ?? (defaults || (defaults = Host.getDefaultSettings())).updateComponentModes[type];
            newSettings = {...newSettings, updateComponentModes: updModes };
        }
        // Handle all.
        for (const prop in newSettings)
            if (newSettings[prop] !== undefined)
                base[prop] = newSettings[prop];
            else if (useDefaults)
                base[prop] = (defaults || (defaults = Host.getDefaultSettings()))[prop];
    }

    public static getDefaultSettings(): HostSettings {
        // Default.
        const dSettings: HostSettings = {
            // Timing.
            updateTimeout: 0,
            renderTimeout: 0,
            // Calling.
            useImmediateCalls: false,
            // Updating.
            updateComponentModes: {
                props: "shallow",
                state: "shallow",
            },
            preCompareDOMProps: "if-needed",
            // Behaviour.
            wideKeysInArrays: false,
            noRenderValuesMode: false,
            onlyRunInContainer: false,
            // Rendering.
            disableRendering: false,
            duplicateDOMNodeBehaviour: "deep",
            duplicateDOMNodeHandler: null,
            duplicatableHost: false,
            maxReRenders: 1,
            renderTextTag: "",
            renderHTMLDefTag: "span",
            renderTextHandler: null,
            renderSVGNamespaceURI: "http://www.w3.org/2000/svg",
            renderDOMPropsOnSwap: true,
            // - DEVLOG - //
            // Dev log.
            devLogWarnings: false,
            devLogRenderInfos: false,
        };
        // Return combined.
        return dSettings;
    }

}

/** Create a new host and start rendering into it. */
export const newHost = <Contexts extends MixDOMContextsAll = {}>(
    content?: MixDOMRenderOutput,
    container?: HTMLElement | null,
    settings?: HostSettingsUpdate | null,
    contexts?: Contexts,
    // shadowAPI?: HostShadowAPI | null
) => new Host<Contexts>(content, container, settings, contexts); //, shadowAPI);

