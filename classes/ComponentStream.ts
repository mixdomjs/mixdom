

// - Imports - //

import { _Defs } from "../static/_Defs";
import { _Apply } from "../static/_Apply";
import {
    MixDOMChangeInfos,
    MixDOMContentEnvelope,
    MixDOMDefTarget,
    MixDOMRenderOutput,
    MixDOMPreComponentOnlyProps,
} from "../static/_Types";
import { SourceBoundary } from "./Boundary";
import { ContentClosure } from "./ContentClosure";
import { Component, ComponentType } from "./Component";
import { PseudoFragment } from "./ComponentPseudos";
import { ContentAPI } from "./ContentAPI";
import { SignalManFlags } from "./SignalMan";


// - MAIN IDEA - //
// 
// I - BASICS:
//  - We have one kind of stream: ComponentStream.
//      * It can be used directly or shared via context data (and then using onData() -> setState() flow).
//  - The basic idea is that there's an INPUT SOURCE and STREAM OUTPUT parts.
//      * The input is an instance of the ComponentStream class, while output is handled by the static side: ComponentStreamType.
//      * As there can be many instances of a stream, there is mixing on the static class side to decide which one is the active source.
//      * The static output side can be used just like with MixDOM shortcut: Stream.Content, Stream.ContentCopy, Stream.copyContent(...) and Stream.withContent(...)
//  - To account for situations where you might have access to a stream but it might be empty, there's a MixDOM.EmptyStream pseudo class.
//      * It actually extends PseudoEmpty but has typing of ComponentStreamType. You can use its public members and methods in the flow, they'll just return null.
//
// II - CHILDREN NEEDS:
//  - Finally we also need to do bookkeeping of children needs so that can use withContent as well as specifically define needs for a boundary.
//      * Like always, this is done via contentAPI, but with the getFor(Stream, ...) method.
//  - When you have stable access to the stream, it's relatively straightforward: just use contentApi.getFor(MyStream) to get the children or .needsFor to mark the needs.
//      * As normally, using the getFor method also by default marks the "temp" needs to the contentAPI's bookkeeping.
//  - If you don't have stable access, you should use an effect and run it when the stream has changed (eg. in state.PopupStream).
//      * The effect's mount part should set the needs, eg. `contentAPI.needsFor(MyStream, true)`, and the unmount part unset them `.needsFor(MyStream, null)`.
//      * If you have EmptyStreams in the flow you can use `MyStream.isStream()` method to tell which is a real stream. The ContentAPI methods also use it internally.
//  - Note that normally you never need to assign specific needs.
//      * You can just insert the content by `MyStream.Content`, use a wrapper that auto-sets needs: `MyStream.withContent(...)` or to handle each kid with auto needs `contentAPI.getFor(MyStream)`.


// - Typing - //

/** Props for the Stream component generally. Includes intrinsic signals. */
export interface ComponentStreamProps extends MixDOMPreComponentOnlyProps {
    /** Define the relative importance of this Stream instance amongst others of the same Stream class.
     * - The higher the number, the more important the stream.
     * - Note that if you want to disable the stream source totally (as if it weren't there), you can use the general _disable prop. */
    importance?: number;
}
/** Instanced streaming source. */
export interface ComponentStream extends Component<{ props: ComponentStreamProps; }> {
    /** The constructor is typed as ComponentStreamType. */
    ["constructor"]: ComponentType & ComponentStreamType; // For some reason we need ComponentType reassurance here or the compile module.d.ts will have an error here (with incompatible contructor.api).
    /** Used internally. Whether can refresh the source or not. If it's not attached, cannot. */
    canRefresh(): boolean;
    /** Used internally in relation to the content passing updating process. */
    preRefresh(newEnvelope: MixDOMContentEnvelope | null, skipInterests?: boolean): Set<SourceBoundary> | null;
    /** Used internally in relation to the content passing updating process. */
    applyRefresh(forceUpdate?: boolean): MixDOMChangeInfos;
    /** To refresh sub mixing - mainly the importance prop. */
    refreshSource(forceRenderTimeout?: number | null): void;
    /** Returns info for removal and additions. */
    reattachSource(fully?: boolean): MixDOMChangeInfos | null;
}
/** Static class side for stream output. */
export interface ComponentStreamType extends ComponentType<{ props: ComponentStreamProps; }> {

    readonly MIX_DOM_CLASS: string; // "Stream"

    // We are a static class, and when instanced output a streaming source.
    new (props: ComponentStreamProps, boundary?: SourceBoundary): ComponentStream;

    // Public members - for usage inside the render output.
    Content: MixDOMDefTarget | null;
    ContentCopy: MixDOMDefTarget | null;
    copyContent: (key?: any) => MixDOMDefTarget | null;
    withContent: (...contents: MixDOMRenderOutput[]) => MixDOMDefTarget | null;
    isStream(): boolean;

    // Internal members.
    /** Contains the links back to the content api's - used for collecting interested boundaries (base on needs) for auto-updating them. */
    contentLinks: Set<ContentAPI>;
    closure: ContentClosure;
    source: ComponentStream | null;
    sources: Set<ComponentStream>;

    // Internal methods.
    addSource(stream: ComponentStream): void;
    removeSource(stream: ComponentStream, withSourceRefresh?: boolean): MixDOMChangeInfos | null;
    reattachSourceBy(stream: ComponentStream, fully?: boolean): MixDOMChangeInfos | null;
    refreshStream(forceRenderTimeout?: number | null): void;
    getBestStream(): ComponentStream | null;
}


// - Create - //

/** Create a component for streaming. */
export const createStream = (): ComponentStreamType =>
    class _Stream extends Component<{ props: ComponentStreamProps; }> {

        /** The constructor is typed as ComponentStreamType. */
        ["constructor"]: ComponentStreamType;


        // - Instanced - //

        public canRefresh(): boolean {
            return _Stream.source === this;
        }

        public preRefresh(newEnvelope: MixDOMContentEnvelope | null, skipInterests?: boolean): Set<SourceBoundary> | null {
            // If we are the active source - pass the preRefresh (part 1/2) from closure to closure.
            return _Stream.source === this && _Stream.closure.preRefresh(newEnvelope, this, skipInterests) || null;
        }

        public applyRefresh(forceUpdate: boolean = false): MixDOMChangeInfos {
            // If we are the active source, pass the applyRefresh (part 2/2) from closure to closure.
            return _Stream.source === this && _Stream.closure.applyRefresh(forceUpdate) || [ [], [] ];
        }

        /** Returns info for removal and additions. */
        public reattachSource(fully: boolean = false): MixDOMChangeInfos | null {
            return _Stream.reattachSourceBy(this, fully);
        }

        /** To refresh sub mixing - mainly the importance prop. */
        public refreshSource(forceRenderTimeout?: number | null): void {
            _Stream.refreshStream(forceRenderTimeout);
        }

        // Make sure renders null.
        public render() {
            return null;
        }


        // - Static - //

        public static MIX_DOM_CLASS = "Stream";
        public static closure: ContentClosure = new ContentClosure();
        public static source: ComponentStream | null = null;
        public static sources: Set<ComponentStream> = new Set();
        public static contentLinks: Set<ContentAPI> = new Set();


        // - Static external usage - //

        public static Content: MixDOMDefTarget | null = { ..._Defs.newContentPassDef(_Stream), contentPass: null, getContentStream: () => _Stream };
        public static ContentCopy: MixDOMDefTarget | null = { ..._Defs.newContentPassDef(_Stream, true), contentPass: null, getContentStream: () => _Stream };
        public static copyContent = (key?: any): MixDOMDefTarget | null => ({ ..._Defs.newContentPassDef(key ?? _Stream, true), contentPass: null, getContentStream: () => _Stream });
        public static withContent = (...contents: MixDOMRenderOutput[]): MixDOMDefTarget | null =>
            _Defs.newDef(PseudoFragment, { withContent: () => _Stream, _key: _Stream }, ...contents);
        public static isStream(): boolean { return true; }


        // - Static helpers - //

        /** Add a streaming source - used internally. */
        public static addSource(stream: ComponentStream): void {
            // Add as a ready-to-use source.
            _Stream.sources.add(stream);
        }

        /** Remove a streaming source - used internally.
         * - Note that this only returns remove related infos - any additions or updates are run by a host listener afterwards. */
        public static removeSource(stream: ComponentStream, withSourceRefresh: boolean = true): MixDOMChangeInfos | null {
            // Remove from local bookkeeping.
            _Stream.sources.delete(stream);
            // Was not the active source - nothing more to do.
            if (_Stream.source !== stream)
                return null;
            // Collect interested. We won't mark anything, just collect them.
            let infos: MixDOMChangeInfos | null = null;
            // let interested: SourceBoundary[] | null = _Stream.contentLinks.size ? [..._Stream.contentLinks].map(cApi => cApi.component.boundary) : null;
            let interested: Set<SourceBoundary> | null = _Stream.closure.collectInterested(stream);
            // Apply null to the envelope to destroy the content.
            infos = _Stream.closure.applyEnvelope(null);
            // Nullify the references, to mark that we have no active source now.
            _Stream.source = null;
            _Stream.closure.sourceBoundary = null;
            // Finally, add a listener to the stream's host. We'll use it to refresh a better source and also to update the interested boundaries.
            // .. Importantly, we must use "render" flush. The "update" flush is too early (with case 1 below) as it's going on already (we're called from _Apply.destroyBoundary).
            // .. Note. To do practical tests, see these two important special cases:
            // .... 1. Try having one source and remove it (-> null). If the inserter has withContent, then uses the interested ones, while refreshStream wouldn't run (= already removed source).
            // .... 2. Try having two sources and remove the active one (-> refresh). The refreshStream should run to update the content.
            if (withSourceRefresh || interested)
                stream.boundary.host.listenTo("onRender", () => {
                    // Before we refresh the stream connections, let's premark all our interested boundaries to have no stream content (childDefs: []).
                    // .. If the refreshing finds a new stream, it will update the content then again, before the actual update is run.
                    if (interested) {
                        const map = new Map([[stream, []] as [ ComponentStream, MixDOMDefTarget[]]]);
                        for (const b of interested)
                            b.host.services.absorbUpdates(b, { streamed: map });
                    }
                    // Refresh the stream.
                    if (withSourceRefresh)
                        _Stream.refreshStream();
                }, null, SignalManFlags.OneShot);
            // Return infos.
            return infos;
        }

        /** The one with highest importance number wins. Otherwise, prefers the first in instance order. */
        public static getBestStream(): ComponentStream | null {
            // Get only one or none.
            const sources = _Stream.sources;
            const count = sources.size;
            if (count < 2)
                return count && [...sources][0] || null;
            // By importance.
            let importance = -Infinity;
            let source: ComponentStream | null = null;
            for (const stream of sources) {
                const i = (stream.props as ComponentStreamProps).importance || 0;
                if (i > importance) {
                    source = stream;
                    importance = i;
                    continue;
                }
            }
            return source;
        }

        /** Returns info for removal and additions.
         * - Note that this does not include the destruction info, if it belongs to another host.
         *   * Instead in that case will execute the destruction immediately in that other host, and return info about addition if any.
         *   * This is to avoid rare bugs from arising, eg: in MixDOMRender marking external elements is host based. */
        public static reattachSourceBy(source: ComponentStream, fully: boolean = false): MixDOMChangeInfos | null {
            // Same source - or cannot take over.
            const oldSource = _Stream.source;
            if (oldSource === source || oldSource && !fully)
                return null;
            // Cannot hijack forcibly.
            if (oldSource !== source && oldSource && (source.props.importance || 0) <= (oldSource.props.importance || 0))
                return null;
            // Get changes.
            let infos: MixDOMChangeInfos | null = null;
            const boundary = source.boundary;
            if (oldSource) {
                infos = _Stream.closure.applyEnvelope(null);
                // If the host for destruction is different from the source's host, we should execute it in it instead - immediately.
                if (infos && boundary.host !== oldSource.boundary.host) {
                    oldSource.boundary.host.services.absorbChanges(infos[0], infos[1], null);
                    infos = null;
                }
            }
            // Take over.
            _Stream.source = source;
            _Stream.closure.sourceBoundary = boundary;
            // Add.
            if (boundary.closure.envelope)
                infos = _Apply.mergeChanges(infos, _Stream.closure.applyEnvelope(boundary.closure.envelope));
            // Return changes - for both destruction and additions.
            return infos;
        }

        /** This doesn't return the infos as they can belong to two different hosts.
         * Instead it absorbs the changes to each host and makes sure micro-timing is correct. */
        public static refreshStream(forceRenderTimeout?: number | null): void {
            // Get best stream - stop if already there.
            const stream = _Stream.getBestStream();
            const oldSource = _Stream.source || null;
            if (stream === oldSource)
                return;
            const closure = _Stream.closure;
            // Function to add new.
            const addNew = stream ? (didRemove = true) => {
                // Cancel - if has been overtaken.
                if (didRemove && _Stream.source !== stream)
                    return;
                // Pre-refresh envelope.
                const boundary = stream.boundary;
                _Stream.source = stream;
                closure.sourceBoundary = boundary;
                const infos = closure.applyEnvelope(boundary.closure.envelope);
                // Absorb changes - immediately if also removed old.
                if (infos[0][0] || infos[1][0])
                    boundary.host.services.absorbChanges(infos[0], infos[1], didRemove ? null : forceRenderTimeout);
            } : null;

            // Remove.
            // .. Already has a source.
            if (oldSource) {
                // Remove old.
                const oldHost = oldSource.boundary.host;
                let oldInfos = closure.applyEnvelope(null);
                // Clear - or actually set the new ones in place already.
                // .. This way, we can prevent multiple refreshes - and according recursive addition problems.
                _Stream.source = stream;
                closure.sourceBoundary = stream && stream.boundary;
                // Did get removal infos.
                if (oldInfos[0][0] || oldInfos[1][0]) {
                    if (addNew)
                        oldHost.listenTo("onUpdate", addNew, null, SignalManFlags.OneShot);
                    oldHost.services.absorbChanges(oldInfos[0], oldInfos[1], forceRenderTimeout);
                }
                // Just add, if even that.
                else if (addNew)
                    addNew();
            }
            // .. Just add.
            else if (addNew)
                addNew(false);
        }

    }



// - Backup notes - //
// 
// 
// - OLD MAIN IDEA (with ContextStreams) - //
// 
// DEV. NOTE:
// .. The ContextStreams concept was dropped as you can achieve the same ends via sharing the stream through context data.
// .. As the idea below shows, it required relatively lot of technical additions in many parts of code (minified to about 3kb), also related to typing.
// .... In addition, swapping elements fluently in the render scope using ContextStreams did not work in the original v3.0.0: instead it unmounted and mounted them. (It works for normal Streams.)
// .... The only real drawback of not having ContextStreams is that if you ever need to specifically set needs to a stream, you should use an effect. However, it's extremely rare to need to do this.
// .... Otherwise everything can be done in the normal flow (listenToData -> setState) taking maybe one or two lines of code more than would with ContextStreams. And fewer things to learn.
//
// I - BASICS:
//  - We have two kinds of streams: ComponentStream and ComponentContextStream.
//      * The ComponentStream is the basis that allows to insert content, while ComponentContextStream connects to a ComponentStream via context.
//  - For ComponentStream:
//      * The basic idea is that there's an INPUT SOURCE and STREAM OUTPUT parts.
//          - The input is an instance of the ComponentStream class, while output is handled by the static side: ComponentStreamType.
//          - As there can be many instances of a stream, there is mixing on the static class side to decide which one is the active source.
//          - The static output side can be used just like with MixDOM shortcut: Stream.Content, Stream.ContentCopy, Stream.copyContent(...) and Stream.withContent(...)
//  - For ComponentContextStream:
//      * Things are a bit different, as each instance is located in a different part of tree, and can thus have different context -> different output stream.
//          - So instead, for inputting, each source connects independently to the output as a source. (If context toggles off, removes itself from being a source.)
//      * The static output side works similarly: Stream.Content, Stream.ContentCopy, Stream.copyContent(...) and Stream.withContent(...)
//          - Likewise the location (of the output def) in the grounded tree makes a difference, as it reads contexts at that location.
//      * Accordingly, and a bit surprisingly, context streams are created through: MixDOM.createContextStream(ctxName, streamName).
//          - You can also use context.getStream(), but it actually returns a ComponentStream, not ComponentContextStream (as it's always attached to the context).
//          - The contextAPI holds no methods for streams. (To avoid unnecessary bookkeeping, instead just store it in the initializing closure or meta or as a class member.)
//
// II - CHILDREN MARKING:
//  - Finally we also need to do bookkeeping of children needs so that can use withContent as well as specifically define needs for a boundary.
//      * This is done via contentAPI's getFor method.
//      * For ComponentStream, it's relatively straight forward: eg. use contentApi.getFor(MyStream) to get the children and mark the needs.
//      * For ComponentContextStream, it's a bit more complicated, as it's impossible to determine where the reading point is.
//          - So instead, you must manually give the surrounding contexts: contentApi.getFor(MyStream, _skipNeeds, _shallowCopy, contexts)
// - The marking also adds the stream to the boundary's contentApi (if found, which is requirement for setting needs).
//      * So when the boundary renders again, it can clear the temporary needs (refering to it) from the bookkeeping in the stream class.
