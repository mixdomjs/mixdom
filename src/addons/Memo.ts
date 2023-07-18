

// - Imports - //

import {
    ClassMixer,
    ClassType,
    MixDOMUpdateCompareMode
} from "../static/_Types";
import { MixDOMCompareDepth, _Lib } from "../static/_Lib";


// - Memo (stand alone) - //

/** Memo callback to run when memory has changed (according to the comparison mode).
 * - If returns a new callback function, it will be run when unmounting the callback. */
export type MemoOnMount<Memory = any> = (newMem: Memory, prevMem: Memory | undefined) => void | MemoOnUnmount;
export type MemoOnUnmount<Memory = any> = (currentMem: Memory, nextMem: Memory, cancelled: boolean) => void;
function _MemoMixin<Memory = any>(Base: ClassType) {

    return class _Memo extends Base {

        public static MIX_DOM_CLASS = "Memo";

        memory: Memory | undefined;
        onMount: MemoOnMount | null;
        onUnmount: MemoOnUnmount | null;
        depth: number;

        constructor(onMount?: MemoOnMount<Memory>, memory?: Memory, ...baseParams: any[]) {
            super(...baseParams);
            this.memory = memory;
            this.onMount = onMount || null;
            this.onUnmount = null;
            this.depth = 1;
        }

        public setDepth(depth?: number | MixDOMUpdateCompareMode | null): void {
            this.depth = depth == null ? 1 : typeof depth === "string" ? MixDOMCompareDepth[depth] : depth;
        }

        public reset(onMount: MemoOnMount<Memory> | null, memory: Memory, forceRun: boolean = false): boolean {
            return this.use(memory, forceRun, onMount);
        }

        public use(memory: Memory, forceRun: boolean = false, newOnMountIfChanged?: MemoOnMount<Memory> | null): boolean {
            // No change.
            const memWas = this.memory;
            if (this.depth < -1) {
                if (this.depth !== -2)
                    return false;
            }
            else if (!forceRun && _Lib.areEqual(memWas, memory, this.depth))
                return false;
            // Update callbacks.
            if (newOnMountIfChanged !== undefined) {
                if (this.onUnmount)
                    this.onUnmount(memWas, memory, false);
                this.onUnmount = null;
                this.onMount = newOnMountIfChanged;
            }
            // Store the memory.
            this.memory = memory;
            // Run callback.
            if (this.onMount)
                this.onUnmount = this.onMount(memory, memWas) || null;
            // Did not change in given mode.
            return false;
        }

        /** Cancel Unmount callback. */
        public cancel(runUnmount: boolean = true, clearMemory: boolean = false, clearCallbacks: boolean = false): void {
            // Run unmount.
            const newMem = clearMemory ? undefined : this.memory;
            if (runUnmount && this.onUnmount)
                this.onUnmount(this.memory, newMem, true);
            // Clear memory (or reuse old, if not clearing).
            this.memory = newMem;
            // Clear.
            if (clearCallbacks) {
                this.onMount = null;
                this.onUnmount = null;
            }
        }
    }
}
export interface Memo<Memory = any> {

    // Note that the type for Memory is not used elsewhere below.
    // ... This is to allow more flexible mixin use with redefined memory.
    /** The last store memory. */
    memory: Memory | undefined;

    /** The callback to run, when has changed.
     * - If returns a function, will replace the unUnmount callback after (for the next time) - otherwise nullifies it. */
    onMount: MemoOnMount<Memory> | null;
    /** This is automatically assigned by the return value of the onMount - if doesn't return a func, will assing to null. */
    onUnmount: MemoOnUnmount<Memory> | null;

    /** Comparison mode to be used by default. (Defaults to 1, which is the same as "shallow".)
    * - If -1 depth, performs fully deep search. If depth <= -2, then is in "always" mode (doesn't even check). */
    depth: number;

    /** Main function for using the memo.
     * - Compares the memory against the old one and if changed, returns true and runs the callback.
     * - If newOnMountIfChanged provided, overrides the callback (only if was changed) right before calling it.
     * - Note that you don't need to have an callback assigned at all: you can also use the returned boolean and run your callback inline. */
    use(memory: this["memory"], forceRun?: boolean, newOnMountIfChanged?: MemoOnMount<Memory> | null): boolean;

    /** Alternative for .use, that requires a function. (Do not use this, if you can reuse a function.)
     * - Note that if you can reuse a function all the time, you should. (There's no point declaring a new one every time in vain.)
     * - Note that you can also call .update(mem), and if it returns true, then execute your callback inline.  */
    reset(onMount: MemoOnMount<Memory> | null, memory: this["memory"], forceRun?: boolean): boolean;

    /** Cancel unmount callback. */
    cancel(skipUnmount?: boolean, clearMemo?: boolean): void;

    /** Set the comparison depth using a number or the shortcut names in MixDOMUpdateCompareMode. */
    setDepth(depth?: number | MixDOMUpdateCompareMode | null): void;

}
export class Memo<Memory = any> extends _MemoMixin(Object) {}
export const newMemo = <Memory = any>(onMount?: MemoOnMount<Memory>, memory?: Memory) => new Memo<Memory>(onMount, memory);

/** There are two ways you can use this:
 * 1. Call this to give basic Memo features.
 *      * For example: `class MyMix extends MemoMixin(MyBase) {}`
 * 2. If you want to define Memory, use this simple trick instead:
 *      * For example: `class MyMix extends (MemoMixin as ClassMixer<typeof Memo<MyMemory>>)(MyBase) {}`
 */
export const MemoMixin = _MemoMixin as ClassMixer<typeof Memo>;
