

// - Imports - //

import { IntrinsicAttributesBy, MixDOMPreBaseProps } from "./_Types";


// - Exports - //

export declare namespace JSX {

    /** This gives support for:
     * - It adds generic support for "_key", "_ref", "_disable" and "_contexts" props (by catch phrase).
     *      * Note that for components, the "_signals" prop is component specific, so uses the initial props on constructor or func.
     *      * This means, each component should be typed with shortcuts (eg. `ComponentFunc<Info>`). To do it manually initProps should have MixDOMPreComponentProps included.
     * - For each dom tag (= HTML & SVG tags), adds their attributes including listeners.
     *      * In addition, for each dom tag adds support for "_signals" related to dom changes.
     */
    export interface IntrinsicElements extends IntrinsicAttributesBy {}
    
    /** This is needed for components mostly. The IntrinsicElements gets ignored for them when defines precise typing: eg. (props: SomeProps).
     * - However, IntrinsicAttributes then brings those to all (dom and components), so we provide here the three basic: "_key", "_ref" and "_disable". 
     * - We leave "_signals" and "_contexts" to be found on the init props if looks in there. */
    export interface IntrinsicAttributes extends MixDOMPreBaseProps { }

}
