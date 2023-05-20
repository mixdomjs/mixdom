

// - Imports - //

import {
    ClassMixer,
    ClassType,
    MixDOMCompareDepthByMode,
    MixDOMUpdateCompareMode
} from "../static/_Types";
import { _Lib } from "../static/_Lib";


// - Effect (stand alone) - //

/** Effect to run when memory has changed (according to the comparison mode).
 * - If returns a new effect function, it will be run when unmounting the effect. */
export type EffectOnMount<Memory = any> = (newMem: Memory, prevMem: Memory | undefined) => void | EffectOnUnmount;
export type EffectOnUnmount<Memory = any> = (currentMem: Memory, nextMem: Memory, cancelled: boolean) => void;
function _EffectMixin<Memory = any>(Base: ClassType) {

    return class _Effect extends Base {

        public static MIX_DOM_CLASS = "Effect";

        memory: Memory | undefined;
        onMount: EffectOnMount | null;
        onUnmount: EffectOnUnmount | null;
        depth: number;

        constructor(effect?: EffectOnMount<Memory>, memory?: Memory, ...baseParams: any[]) {
            super(...baseParams);
            this.memory = memory;
            this.onMount = effect || null;
            this.onUnmount = null;
            this.depth = 1;
        }

        public setDepth(depth?: number | MixDOMUpdateCompareMode | null): void {
            this.depth = depth == null ? 1 : typeof depth === "string" ? MixDOMCompareDepthByMode[depth] : depth;
        }

        public reset(effect: EffectOnMount<Memory> | null, memory: Memory, forceRun: boolean = false): boolean {
            return this.use(memory, forceRun, effect);
        }

        public use(memory: Memory, forceRun: boolean = false, newEffectIfChanged?: EffectOnMount<Memory> | null): boolean {
            // No change.
            const memWas = this.memory;
            if (this.depth < -1) {
                if (this.depth !== -2)
                    return false;
            }
            else if (!forceRun && _Lib.areEqual(memWas, memory, this.depth))
                return false;
            // Update effect.
            if (newEffectIfChanged !== undefined) {
                if (this.onUnmount)
                    this.onUnmount(memWas, memory, false);
                this.onUnmount = null;
                this.onMount = newEffectIfChanged;
            }
            // Store the memory.
            this.memory = memory;
            // Run effect.
            if (this.onMount)
                this.onUnmount = this.onMount(memory, memWas) || null;
            // Did not change in given mode.
            return false;
        }

        /** Cancel effect. */
        public cancel(runUnmount: boolean = true, clearMemory: boolean = false, clearEffect: boolean = false): void {
            // Run unmount.
            const newMem = clearMemory ? undefined : this.memory;
            if (runUnmount && this.onUnmount)
                this.onUnmount(this.memory, newMem, true);
            // Clear memory (or reuse old, if not clearing).
            this.memory = newMem;
            // Clear.
            if (clearEffect) {
                this.onMount = null;
                this.onUnmount = null;
            }
        }
    }
}
export interface Effect<Memory = any> {

    // Note that the type for Memory is not used elsewhere below.
    // ... This is to allow more flexible mixin use with redefined memory.
    /** The last store memory. */
    memory: Memory | undefined;

    /** The effect to run, when has changed.
     * - If returns a function, will replace the effect after (for the next time). */
    onMount: EffectOnMount<Memory> | null;
    /** This is automatically assigned by the return value of the onMount - if doesn't return a func, will assing to null. */
    onUnmount: EffectOnUnmount<Memory> | null;

    /** Comparison mode to be used by default. (Defaults to 1, which is the same as "shallow".)
    * - If -1 depth, performs fully deep search. If depth <= -2, then is in "always" mode (doesn't even check). */
    depth: number;

    /** Main function for using the effect.
     * - Compares the memory against the old one and if changed, returns true and runs the effect.
     * - If newEffectIfChanged provided, overrides the effect (only if was changed) right before calling the effect.
     * - Note that you don't need to have an effect assigned at all: you can also use the returned boolean and run your "effect" inline. */
    use(memory: this["memory"], forceRun?: boolean, newEffectIfChanged?: EffectOnMount<Memory> | null): boolean;

    // /** Just like the use method, but returns whatever the effect returned. */
    // run(memory: this["memory"], forceRun?: boolean, newEffectIfChanged?: EffectOnMount<Memory> | null): boolean;

    /** Alias for .use, that requires a function. (Do not use this, if you can reuse a function.)
     * - Note that if you can reuse a function all the time, you should. (There's no point declaring a new one every time in vain.)
     * - Note that you can also call .update(mem), and if it returns true, then do your effect inline.  */
    reset(effect: EffectOnMount<Memory> | null, memory: this["memory"], forceRun?: boolean): boolean;

    /** Cancel effect. */
    cancel(skipUnmount?: boolean, clearEffect?: boolean): void;

    /** Set the comparison depth using a number or the shortcut names in MixDOMUpdateCompareMode. */
    setDepth(depth?: number | MixDOMUpdateCompareMode | null): void;

}
export class Effect<Memory = any> extends _EffectMixin(Object) {}
export const newEffect = <Memory = any>(effect?: EffectOnMount<Memory>, memory?: Memory) => new Effect<Memory>(effect, memory);

/** There are two ways you can use this:
 * 1. Call this to give basic Effect features.
 *      * For example: `class MyMix extends EffectMixin(MyBase) {}`
 * 2. If you want to define Memory, use this simple trick instead:
 *      * For example: `class MyMix extends (EffectMixin as ClassMixer<typeof Effect<MyMemory>>)(MyBase) {}`
 */
export const EffectMixin = _EffectMixin as ClassMixer<typeof Effect>;
