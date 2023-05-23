# Contributing to MixDOM

---

## Disclaimer

Thank you for considering contributing to MixDOM. It's an open source library and as such it's meant to start to live its own life. Here are some principles and guidelines for future development.

---

## Main principles of MixDOM

### Architecture

- The core idea about the flow is 1. down cascading flow complemented by 2. quick tunnels and 3. lateral communication along the main flow. The tunnels refer to content passing (through parental chains or by distant streams), using wrapped components as well as tunneled context assignments (by `_contexts` prop or `overrideContext` method in some cases). The lateral flow refers to the contexts and especially their actions, questions and asynchronous requests, but also the data sharing aspect. The as a whole, the architecture provides a very powerful and performant environment for building the client side of apps, weaving together state based UIs with precisely orchestrated and configurable flows.
- In comparison to React, there is an emphasis on the latter two (2. tunnels and 3. lateral), as React is based on a strict one-by-one cascading flow (with reconciliation and other _post_ processing). From MixDOM's perspective, this lack of lateral bridges actually leaves a "gap" in the strictly one-by-one cascading states architecture, and accordingly the solution is integrated into the core of MixDOM (2 and 3 above).

### Feature set

- The current feature set forms a "whole" as explained above: down fall with tunneled & lateral flows. This is of course coupled with features related to DOM, such as `UIRef` and other commonly useful helpers like `Effect`. There can of course be more features (along these lines or others), but to keep the size small, the basic feature set should not grow too much.
- Any bigger features should be implemented as "plugins" (eg. NPM packages). The internal architecture can be adjusted to support them better (in general terms) - of course must find ways to do so without fattening the flow too much.
- All features should be thought out well as a whole in terms of practical usage, overall flow, performance in many scales. They should add value to library as a whole, or solve some specific use cases (especially those that become "deal breakers" in some circumstances).

### Relatively lightweight

- The library should stay small, clearly under 100kb. Note that as of v3.0, it jumped from less than 70kb to around 90kb with the additions of several features. However, with v3.1 it jumped back to around 75kb by reorganizing some features and reimplementing them with simpler concepts.
- The target size is not totally arbitrary, but it reflects the amount of basic features that constitute what is MixDOM - for example, Preact is about 10kb (20kb with compat), so it makes sense MixDOM is a few times bigger.
- Note that, there are a lot of performant ultra-light-weight alternatives to React, even smaller (and more performant) than Preact. While performance is important in MixDOM, being super lightweight is not a priority, but instead providing a wholesome architecture with convenient practical features.

----

## Contributing by GitHub issues

### Bugs

- You can report bugs into the GitHub repo issues: https://github.com/mixdomjs/mixdom/issues
- Please follow the following guidelines when reporting bugs:
  - First verify that a similar bug doesn't exist already in the issues.
  - Try to be as brief but descriptive of the bug as possible - both in the title and in the description.
  - Describe (a bit of) the context of what you're aiming to do, and how the bug prevented it.
  - Provide the steps to reproduce the problem.
  - If somehow related, provide information about the environment where you run into the bug (eg. browser, OS).
  - Often a screenshot of snippet of your code (or the error) can be very helpful.

### Feature requests

- Before requesting a feature, please read the "Main principles of MixDOM" above. It describes what MixDOM aims to do, and how it should grow.
- Feature requests can be made in the GitHub repo issues using the "feature" label: https://github.com/mixdomjs/mixdom/labels/feature

---

## Contributing by code guidelines

### Where

- Use the GitHub repo:  https://github.com/mixdomjs/mixdom.git

### TypeScript

- All code should be written in TypeScript.
- For advanced typing algorithms, make sure there's no excessively deep iterations: eg. precomputing all permutations to match against something, as opposed to eg. splitting that something and comparing it to a valid base set.

### Commenting

- All routines and procedures should be commented along the way. Preferably in small chunks, so that it's easy to distinguish the aim (= comments) from the implementation (= code). The rhythm of comments also makes it easy to visually glance through the idea flow.
- For bigger routines and algorithms, should make a general explanation of the main idea behind it. This way it can be evaluated in relation to other flow when considering performance in larger scales.

### Keeping classes clean

- It's preferable to split complex classes to a "public" and more "private" parts. The public class is the one that the programmer uses when writing UIs, while the private classes are the ones handling all the technicalities. For example, classes like `Host`, `Context`, `Component`, `Ref`, ... are all meant to be used by the end programmer so they are kept very clean and minimal to their purpose. For the component classes most of the functionality is handled by "semi-private" `boundary` and the actual routines for them in the static `_Apply`, while `Host` is only a small interface to `HostServices` and `HostRender` classes.
- Note that this sort of splitting also makes it easier to write internal mixins in relation to typing. The main reason being however having a "clean front" vs. "functional insides".

### Code structure

- Currently the `src` folder is divided into three main folders: `classes`, `static` and `addons`. The `classes` folder contains all the classes and `static` contains a background library for them - either general purpose (like `_Lib`) or specific to the flow of MixDOM (eg. `_Apply`). The `addons` folder contains classes that are not present in the core processing.
- In addition there's the important `MixDOM` shortcut next to the index files.
- There are three index files for three different compiling needs:
  1. `index.ts` is the source for es module output. (Use with "import".)
  2. `index.cjs.ts` is the source for cjs output. (Use with "require".)
  3. `index.global.ts` is the source for global use that adds MixDOM global. (Just directly import the script.)

### Naming

- Should use clear naming, especially in methods and members, but also in the code (the runtime variables will be minified anyway).
- However, it's not always easy, and too long names become obtrusive (and add extra size to the minified file). So just seek some balance with short but depictive names.
- The internal (more private) classes can undergo naming changes more easily, as they are not meant to be used directly. When name changes are needed, they should be clumped together in a major (or minor) version update and notified about them clearly (at least in the CHANGES.md doc).

### Dev dependencies

- The source project is only dependent on TypeScript and then Rollup (and a couple of plugins for it) to output the final files.
- Note that the process also copies two files: `index.module.js` and `index.module.d.ts` so that can be directly imported as a native es module (without a pre module handler) - there was some problems with `index.mjs` and `index.d.ts` if using directly.

