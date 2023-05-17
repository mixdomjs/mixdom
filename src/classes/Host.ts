

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
    GetJoinedDataKeysFrom,
    PropType,
    MixDOMUpdateCompareModesBy,
    MixDOMRenderTextTag,
    MixDOMRenderTextContentCallback,
    DOMTags,
    MixDOMCloneNodeBehaviour,
    MixDOMTreeNodeHost,
} from "../static/_Types";
import { _Lib } from "../static/_Lib";
import { _Defs } from "../static/_Defs";
import { _Find } from "../static/_Find";
import { SourceBoundary } from "./Boundary";
import { HostServices } from "./HostServices";
import { HostRender } from "./HostRender";
import { SignalsRecord } from "./SignalMan";
import { DataSignalMan } from "./DataSignalMan";
import { ComponentTypeAny } from "./Component";


// - Types - //

/** Hosts always have these signals. But you can add custom ones as well through `Host<Data, Signals>`. */
export type HostSignals = {
    /** Called right after the update cycle. */
    onUpdate: () => void;
    /** Called right after the render cycle. */
    onRender: () => void;
}
export interface HostType<Data extends any = any, Signals extends SignalsRecord = {}> {
    /** Used for host based id's. To help with sorting fluently across hosts. */
    idCount: number;
    new (content?: MixDOMRenderOutput, domContainer?: Node | null, settings?: HostSettingsUpdate | null): Host<Data, Signals>;

    modifySettings(baseSettings: HostSettings, updates: HostSettingsUpdate): void;
    getDefaultSettings(settings?: HostSettingsUpdate | null): HostSettings;
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

    /** If the internal should update check is called without any types to update with, this decides whether should update or not. Defaults to false. */
    shouldUpdateWithNothing: boolean;

    /** Defines what components should look at when doing onShouldUpdate check.
     * By default looks in all 4 places for change: 1. Props, 2. State, 3. Children, 4. Streamed.
     * .. However, most of them will be empty, and Children and Streamed will only be there if specifically asked for (by needsData, get/needs children, getFor/needsFor streamed content).
     * .. The default mode is "double", except for children it's "changed", and for streamed it's "always". */
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

    /** The maximum number of cyclical updates - only affects content streaming (at least currently). Defaults to 0 - so won't allow any.
     * - Cyclical updates normally never happen. However, they can happen when updating components up the flow. In practice, these cases are extremely rare but can happen.
     *      * As an example, inserting a stream (using withContent) in a common parent for insertion and source - though all in between must be spread funcs or have {props: "always"} update mode.
     *      * This also includes cases where the same component defines and inserts the content of the same stream.
     * - Note that what the cut actually means (eg. for a stream), is that the content will be updated, but the components interested in its content will not be triggered for updates (-> won't re-render).
     *      * For example when a common parent uses withContent, the parent won't re-render. But as normally, the contents are updated smoothly without intermediary ones re-rendering.
     */
    maxCyclicalUpdates: number;

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

    /** Whether allows contexts to cascade down from host to host.
     * - Specifically sets whether this host accepts contexts above its root.
     * - If false, will be independent of the parent host's contexts. Defaults to true. */
    welcomeContextsUpRoot: boolean;

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
     * - The treeNode in the arguments defines where would be inserted. */
    duplicatableHost: boolean | ((host: Host, treeNode: MixDOMTreeNodeHost) => Host | boolean | null);

    /** For weird behaviour. */
    devLogWarnings: boolean;
    /** This log can be useful when testing how MixDOM behaves (in small tests, not for huge apps) - eg. to optimize using keys.
     * To get nice results, set preCompareDOMProps setting to `true`. */
    devLogRenderInfos: boolean;
    /** To see what was cleaned up on each run (defs / treeNodes). */
    devLogCleanUp: boolean;

}


// - Class - //

/** This is the main class to orchestrate and start rendering. */
export class Host<Data extends any = any, Signals extends SignalsRecord = {}> extends DataSignalMan<Data, HostSignals & Signals> { 

    
    // - Static - //
    
    public static MIX_DOM_CLASS = "Host";
    public static idCount = 0;

    ["constructor"]: HostType<Data, Signals>;

    
    // - Members - //

    /** This represents abstractly what the final outcome looks like in dom. */
    public groundedTree: MixDOMTreeNode;
    /** The root boundary that renders whatever is fed to the host on .update or initial creation. */
    public rootBoundary: SourceBoundary;
    /** Internal services to keep the whole thing together and synchronized.
     * They are the semi-private internal part of Host, so separated into its own class. */
    services: HostServices;
    /** The general settings for this host instance.
     * - Do not modify directly, use the .modifySettings method instead.
     * - Otherwise rendering might have old settings, or setting.onlyRunInContainer might be uncaptured. */
    public settings: HostSettings;
    /** This gets automatically assigned, whenever the host is auto-duplicated (by settings.duplicatableHost).
     * - Note that when a duplication happens, will also add the duplicated host to our ghostHost's collection, while we're its sourceHost. */
    public sourceHost?: Host;
    /** This refers to all the duplicated hosts (of this host) - requires settings.duplicatableHost. We hold that memory so that we can pass settings. */
    public ghostHosts?: Set<Host>;


    // - Init - //

    constructor(content?: MixDOMRenderOutput, domContainer?: Node | null, data?: Data, settings?: HostSettingsUpdate | null) {


        // - Initialize - //

        // Signals.
        super(data);

        // Static.
        this.constructor.idCount++;

        // Initialize.
        // .. And groundedTree.
        this.groundedTree = {
            type: "root",
            parent: null,
            children: [],
            domNode: domContainer || null,
            sourceBoundary: null
        };
        // .. And then settings.
        this.settings = Host.getDefaultSettings(settings);
        // .. And then services - to initialize HostRender class with proper refs.
        this.services = new HostServices(this);


        // - Start up - //

        // Create root component with the first content.
        const Root = this.services.createRoot(content);
        // Create base tree node for the root boundary.
        const sourceDef = _Defs.newAppliedDefBy({ MIX_DOM_DEF: "boundary", tag: Root, props: {}, childDefs: [] }, null);
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
        return new Promise<void>(resolve => {
            // No pending - resolve immediately.
            if (!this.services.hasPending(true, renderSide, true))
                resolve();
            // Add a listener and trigger refresh.
            else {
                // Add to refresh wait.
                this.listenTo(renderSide ? "onRender" : "onUpdate", resolve as any);
                // Trigger updates.
                this.services.triggerUpdates(updateTimeout, renderTimeout);
            }
        });
    }
    
    /** Trigger refreshing the host's pending updates and render changes. */
    public triggerRefresh(updateTimeout?: number | null, renderTimeout?: number | null): void {
        this.services.triggerUpdates(updateTimeout, renderTimeout);
    }

    
    // - Extend to provide both timeouts (mostly for typing, but must do implementation too without a separate interface) - //

    /** Set the data and refresh.
     * - Note that the extend functionality should only be used for dictionary objects. */
    public setData(data: Data, extend?: boolean | false, refresh?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): void;
    public setData(data: Partial<Data>, extend?: boolean | true, refresh?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): void;
    public setData(data: Partial<Data>, extend: boolean = false, refresh: boolean = true, updateTimeout?: number | null, renderTimeout?: number | null): void { (super.setData as Host["setData"])(data, extend, refresh, updateTimeout, renderTimeout); }

    /** Set or extend in nested data, and refresh with the key.
     * - Note that the extend functionality should only be used for dictionary objects. */
    public setInData<DataKey extends GetJoinedDataKeysFrom<Data & {}>, SubData extends PropType<Data, DataKey, never>>(dataKey: DataKey, subData: Partial<SubData>, extend?: true, refresh?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): void;
    public setInData<DataKey extends GetJoinedDataKeysFrom<Data & {}>, SubData extends PropType<Data, DataKey, never>>(dataKey: DataKey, subData: SubData, extend?: boolean | undefined, refresh?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): void;
    public setInData(dataKey: string, subData: any, extend: boolean = false, refresh: boolean = true, updateTimeout?: number | null, renderTimeout?: number | null): void { (super.setInData as Host["setInData"])(dataKey, subData as never, extend, refresh, updateTimeout, renderTimeout); }

    /** This refreshes both: data & pending signals.
     * - If refreshKeys defined, will add them - otherwise only refreshes pending.
     * - Note that if !!refreshKeys is false, then will not add any refreshKeys. If there were none, will only trigger the signals. */
    public refreshData<DataKey extends GetJoinedDataKeysFrom<Data & {}>>(dataKeys: DataKey | DataKey[] | boolean, updateTimeout?: number | null, renderTimeout?: number | null): void;
    public refreshData(dataKeys?: string | string[] | boolean | null, updateTimeout?: number | null, renderTimeout?: number | null): void {
        // Add keys.
        if (dataKeys)
            this.addRefreshKeys(dataKeys);
        // Trigger our host updates.
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
     *     1. welcomeContextsUpRoot: Immediately updates whether now has a context on the host or not.
     *     2. onlyRunInContainer: Refreshes whether is visible or not (might destroy all / create all, if needed).
     */
    public modifySettings(settings: HostSettingsUpdate, passToGhosts: boolean = true): void {
        // Collect state before.
        const onlyRunWas = this.settings.onlyRunInContainer;
        const welcomeCtxsWas = this.settings.welcomeContextsUpRoot;
        // Do changes.
        Host.modifySettings(this.settings, settings);
        // Detect special changes.
        // .. Recheck contexts from host to host.
        if (welcomeCtxsWas !== undefined && welcomeCtxsWas !== settings.welcomeContextsUpRoot) {
            const pHost = this.groundedTree.parent && this.groundedTree.parent.sourceBoundary && this.groundedTree.parent.sourceBoundary.host;
            const pCtxs = pHost && this.settings.welcomeContextsUpRoot ? pHost.rootBoundary.outerContexts : {};
            this.services.onContextPass(pCtxs);
        }
        // .. Run the update immediately.
        if (settings.onlyRunInContainer !== undefined && settings.onlyRunInContainer !== onlyRunWas)
            this.refreshRoot(false, null, null);
        // Update duplicated hosts.
        if (passToGhosts && this.ghostHosts)
            for (const host of this.ghostHosts)
                host.modifySettings(settings);
    }


    // - Static helpers - //

    /** Modify settings with partial settings. If any is `undefined` uses the default setting. */
    public static modifySettings(baseSettings: HostSettings, updates: HostSettingsUpdate): void {
        // Defaults.
        const defaults = Host.getDefaultSettings();
        // Special case.
        const { updateComponentModes, ... otherUpdates } = updates;
        if (updateComponentModes) {
            for (const prop in updateComponentModes) {
                const val = updateComponentModes[prop];
                if (typeof val === "string")
                    baseSettings.updateComponentModes[prop] = val;
                else
                    baseSettings.updateComponentModes[prop] = defaults.updateComponentModes[prop];
            }
        }
        // Update simple values.
        for (const prop in otherUpdates) {
            const val = updates[prop];
            const type = typeof val;
            if (val === undefined)
                baseSettings[prop] = defaults[prop];
            else if ((val === null) || (type === "boolean") || (type === "string") || (type === "number"))
                baseSettings[prop] = val;
        }
    }

    public static getDefaultSettings(settings?: HostSettingsUpdate | null): HostSettings {
        // Default.
        const dSettings: HostSettings = {
            // Timing.
            updateTimeout: 0,
            renderTimeout: 0,
            // Calling.
            useImmediateCalls: false,
            // Updating.
            shouldUpdateWithNothing: false,
            maxCyclicalUpdates: 0,
            updateComponentModes: {
                props: "shallow",
                state: "shallow",
                children: "always",
                streamed: "always",
            },
            preCompareDOMProps: "if-needed",
            // Behaviour.
            welcomeContextsUpRoot: true,
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
            devLogCleanUp: false,
        };
        // Apply custom.
        if (settings) {
            for (const prop in settings)
                dSettings[prop] = settings[prop];
        }
        // Return combined.
        return dSettings;
    }


    // - Typing - //

    /** This is only provided for typing related technical reasons. There's no actual Signals object on the javascript side. */
    _Signals: Signals;

}

/** Create a new host and start rendering into it. */
export const newHost = <Data extends any = any, Signals extends SignalsRecord = {}>(
    content?: MixDOMRenderOutput,
    container?: HTMLElement | null,
    data?: any,
    settings?: HostSettingsUpdate | null,
) => new Host<Data, Signals>(content, container, data, settings);

