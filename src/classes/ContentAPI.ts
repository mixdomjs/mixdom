

// - Imports - //

import { MixDOMDefTarget } from "../static/_Types";
import { Component } from "./Component";
import { ComponentStreamType } from "./ComponentStream";


// - Class - //

/** Handles content passing related getting, needs and bookkeeping. Both through the parental chain and via streaming. */
export class ContentAPI {


    // - Members - //

    /** The component this api is assigned to. */
    public component: Component;
    /** Needs for local content passing. */
    public localNeeds: boolean | "temp" | null;
    /** Needs for streamed content passing.
     * - This contains the keys for any connected streams, and the set needs for each. If key not found, then means has no needs or is not connected. */
    public streamNeeds?: Map<ComponentStreamType, boolean | "temp">;


    // - Constructor - //

    public constructor (component: Component) {
        this.component = component;
    }


    // - Local content passing (by parent chain) - //

    private read(shallowCopy: boolean = false): Readonly<MixDOMDefTarget[]> | null {
        const defs: MixDOMDefTarget[] | null = this.component.boundary.closure.envelope?.targetDef.childDefs || null;
        return shallowCopy && defs ? defs.slice() : defs;
    }

    public get(skipNeeds: boolean = false, shallowCopy: boolean = false): Readonly<MixDOMDefTarget[]> | null {
        if (!skipNeeds)
            this.needs("temp", true);
        return this.read(shallowCopy);
    }

    public needs(needs?: boolean | "temp" | null, softly: boolean = false): void {
        // Stop.
        if (softly && typeof this.localNeeds === "boolean")
            return;
        // Mark needs.
        this.localNeeds = needs ?? null;
        // Add / remove back link.
        const links = this.component.boundary.closure.contentLinks;
        needs == null ? links.delete(this) : links.add(this);
    }


    // - Streamed content passing - //

    /** Read the child defs of a stream. */
    private readFor(Stream: ComponentStreamType, shallowCopy: boolean = false): Readonly<MixDOMDefTarget[]> | null {
        return Stream.closure ? Stream.closure.readContent(shallowCopy) : null;
    }

    /** Get the children for the Stream, and by default set temporary needs for them. */
    public getFor(Stream: ComponentStreamType, skipNeeds: boolean = false, shallowCopy: boolean = false): Readonly<MixDOMDefTarget[]> | null {
        // Not a real stream.
        if (!Stream.isStream())
            return null;
        // Needs.
        if (!skipNeeds)
            this.needsFor(Stream, "temp", true);
        // Read.
        return this.readFor(Stream, shallowCopy);
    }

    /** Set the needs for a stream. */
    public needsFor(Stream: ComponentStreamType, needs?: boolean | "temp" | null, softly: boolean = false): void {
        // Not a real stream.
        if (!Stream.isStream())
            return;
        // Not allowed to change boolean value.
        if (softly && this.streamNeeds && typeof this.streamNeeds.get(Stream) === "boolean")
            return;
        // Unset.
        if (needs == null) {
            this.streamNeeds && this.streamNeeds.delete(Stream);
            Stream.contentLinks.delete(this);
        }
        // Set.
        else {
            if (this.streamNeeds)
                this.streamNeeds.set(Stream, needs);
            else
                this.streamNeeds = new Map([[Stream, needs]]);
            Stream.contentLinks.add(this);
        }
    }

}
