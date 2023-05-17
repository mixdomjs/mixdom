## v3.0.0

### New main version (and name)

- The library has gone through some major changes with a couple of important new features, such as:

- 1. Mixing components.
  2. Integrated signals system (with async support).
  3. Component streaming - define contents in one place, insert elsewhere (even up the flow, supporting wide keys moving).
  4. Flexible support for hydrating server side rendered (or other custom elements).
  5. Support to disable (and pause and resume) rendering and collect render output as an HTML string.
  6. Data listening and signals support on Host - with an easy access to it from the components part of the host.

- Major breaking changes:

- - Generally changed the name and naming from **UIDOM** to **MixDOM** regarding framework and all classes and typing. Also refined naming all around, in methods, members and typing. This better describes what this library is about.
  - Reorganized "actions" concept as "signals", using the common basis now found in many classes, called **SignalMan**. Likewise there is **DataMan** related to data listening features.
  - Cleaned up component class and functional forms. Now there's just `Component` (both as a class and function) in addition to the `Spread` functional rendering. The basic Component class supports lifecycle callbacks, state, timers, wrapped components, streaming and can be hooked up to contexts.
  - Removed `local` from `Component`. Now can use `cApi.listenToData` and hook it up with setting the component `state`.
  - The components are now typed with an info dictionary, eg. `const Comp: ComponentFunc<Info> = (_, comp) => { ... }`. Also added `class` member for custom data for `Component` with typing support. This is very useful with **Refs** and component mixing to extend the component features.
  - Changes in the reserved keyword props - now they all start with an underline: `_key`, `_ref`, `_contexts` (and the new `_disable` and `_signals`). This is to distinguish them better from your normal props, and it also highlights two important things: 1. they have a special meaning in the `MixDOM` core, 2. they will not be passed to the component props - in other words, they are like "special commands".
  - Changes naming of all lifecycle signals to be simpler: `didMount`, `didMove`, `beforeUpdate`, `shouldUpdate`, `preUpdate`, `didUpdate` and `willUnmount` (and `didAttach` and `willDetach` for **Refs**).
  - Changes in the `Component`'s and `Ref`'s callbacks: now they all are based on the signals system, so can add multiple and thus reuse the same ref in many components fluently. For example: `ref.listenTo("didMount", (component) => { ... })`. Likewise Host's "update" and "render" listeners now work through the signals system.

### Features

- Component mixing: you can mix component functions together as well as build chains from mixins (all with full typing support - including specifying requirements for mixables).

- The signal system now uses a common base class - **SignalMan** - that is used in many classes. It also includes a flexible signal sending system supporting asynchronous signals. Also added `_signals` special prop that can be used with the signals system for dom elements or components (without Refs).

- Added distant content streaming - fully unleashing the powers of the content envelope system.

- - The component streaming concept allows to render content in one place and insert in another place. The stand alone streams can be driven by any rendering source: any component type or externally using an extra host: `host.updateRoot(<MyStream>Stuff here..!</MyStream>)`. The streams can also be shared by contexts (with named typing), so you can access them easily all around.
  - To use a stream, 1. create a new `ComponentStream` (by `MixDOM.stream()`), 2. render content into the stream: `<MyStream>Stuff..!</MyStream>`, and 3. insert the content somewhere by: `<div>{MyStream.Content}</div>`. You can insert streams (input or output) anywhere in the render scope.
  - The streaming also supports mixing from multiple sources (= by multiple instances of the same stream class) using `importance` prop - as well as automatically falling back to the next best source if the active streaming source dies.

- The server side support is composed of three things: 1. Allowing to disable rendering (and instead read the output as a html string), 2. On the client side, supporting hydrating components with custom DOM element structure. 3. Handling any browser-specific features (anything using `window` or `document` in global namespace), so that work in NodeJS environment or are ignored accordingly.

- - Note that the concepts of outputted html string and re-hydration from custom elements works for client-side usage as well - especially the rehydration callbacks allow you to customize how the elements get refilled, and even allow to hydrate without any virtual tree (just using callbacks), or mix both.

- Reorganized the component classes and functions. Now there are just two main components: `Component` and `SpreadFunc`.

- - `Component` replaces the old `UIMini` and `UILive` bringing lifecycle callbacks, timers, wrapped components, etc. They can be hooked up to context through their dedicated `ContextAPI`.
  - `SpreadFunc` is simply any *function* that has 1 or 0 args. Useful for short compositional needs (= purely static shortcuts).

- Hosts and Contexts now share a common base class - **DataSignalMan** - that provides features for sending and listening to signals as well as data.

- Added feature to disable any def by using `_disable={true}` prop - it collapses the def (including all contents inside) to `null`.

- - In terms of micro-performance it'd be better to use `someCondition ? <RenderStuff.../> : null` instead - that way you won't even create those render def that will anyway be disregarded. (However, if there's no child defs, makes no difference.)

- In similar fashion added `PseudoEmpty` component class that will also amount to `null`. It accepts any props and can serve special case usages (where you for some reason need to have a dummy component if real one not available). And specifically for streams `PseudoEmptySteram`.

- Provided `MixDOM.deepCopy` with custom depth to help with nested data special cases (eg. using state and complex server fetched data).

- Enhanced typing experience in many places - for example, in data listening and signals, there's now auto-suggestion (even for dotted strings), DataPicker/DataSelector typing is more flexible, providing various pieces of info with the `ComponentInfo` type, and so on.

### Fixes

- Fixed a bug in `_Find.rootDOMTreeNodes` that resulted in not supporting getting nested root dom nodes correctly. This caused DOM moving error in rare cases when using nested fragments or content passes with multiple children.
- Fixed a bug in relation to content passing and using the set needs for them. Also fixed that `MixDOM.withContent` also adds temporary "needs" for children - so that works correctly when the content changes.
- Fixed a rare special case related to DOM insertion and boundaries that render `null` (or otherwise have no `domNode` from their contents in the `treeNode`). Now correctly updates the chain if the first `treeNode` child of a parent deliberately has no `domNode`, and accordingly the DOM tree order is correct.
- Fixed including the `{ children }` in the `shouldUpdate` and other such update related info collections. (Now it also includes a new `{ streamed }` portion.)

### Other changes

- To support server side, made the `setTimeout` and `clearTimeout` use NodeJS's equivalent calls if not run in browser environment. Likewise handled a couple of cases using `document` to be functional without browser.

- Renamed `Host` setting `preEqualDOMProps` to `preCompareDOMProps`.

- Changed the common reserved keywords to have underline before: `_key`, `_ref`, `_disable`, `_signals` and `_contexts`.

- On `Ref`:

- - Removed the assignable callbacks - now everything uses the signals system instead.
  - Changed all callbacks related to `SourceBoundary` refer to `Component` instead.
  - Accordingly, changed `getRefBoundary` to `getComponent` and likewise the plural to `getComponents`, as they now deal with components, not boundaries - and likweise `getDomNode` to `getElement`.

- Added a new argument `extend: boolean = true` into `setState` of `Component`. Now the arguments are: `setState(newState, extend = true, forceUpdate = false, forceUpdateTimeout?, forceRenderTimeout?)`.

- On `Effect` mount & unmount callbacks:

- - Flipped the optional mount callback args the other way around: `(prevMem, newMem)` to `(newMem, prevMem)`. This makes it more convenient to use the new memory, which is what you typically want. The functionality also resembles `DataPicker` more this way. However on unmount the order is like it was, but arguments named better: `(currentMem, nextMem)`.
  - Also simplified the third parameter in the unmount callback - now it's called `cancelled` and type is `boolean`: `(currentMem, nextMem, cancelled)`.
  - Added a new argument to `cancel` method (as the second argument): `clearMemory: boolean = false`.
  - Clarified the timing, so that first old unmount is run, then memory changed, then new mount is run (before the memory was changed first).
  - Clarified that `memory` member can also be `undefined`, as this is true in some cases.

- Removed the `Host` setting `reusingSiblingTags`. Its implementational meaning was not actually what was intended - and implementing a feature to not reuse tags is really not that useful (at all).

- Converted the class for `ComponentWrapper` into a simple interface for typing, as it was not supposed to be used as without creating a new class for each new component - now `ComponentWrapper` only refers to the interface. Note that the important part is the static part: `ComponentWrapperType` interface and the `WrapperAPI` instance attached.

- Some minor changes in the internal classes.
