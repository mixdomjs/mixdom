
// - Imports - //

import {
    MixDOMTreeNode,
    MixDOMTreeNodeDOM,
    MixDOMTreeNodeType,
    MixDOMDefApplied,
} from "./_Types";
import { _Lib } from "./_Lib";
import { _Defs } from "./_Defs";
import { SourceBoundary, ContentBoundary } from "../classes/Boundary";


// - _Find static features - //

export const _Find = {


    // - Finders - //

    /** This is a very quick way to find all boundaries within and including the given one - recursively if includeNested is true.
     * - Note that this stays inside the scope of the host (as .innerBoundaries never contains the root boundary of another host). */
    boundariesWithin(origBoundary: SourceBoundary, includeNested: boolean = true): SourceBoundary[] {
        // Prepare.
        const list: SourceBoundary[] = [];
		let bLeft : (SourceBoundary | ContentBoundary)[] = [origBoundary];
		let boundary : SourceBoundary | ContentBoundary | undefined;
        let i = 0;
        // Loop recursively in tree order.
		while (boundary = bLeft[i]) {
            // Next.
            i++;
            // Skip content boundaries, and all within them.
            if (!boundary.boundaryId)
                continue;
            // Skip inactive.
            if (boundary.isMounted === null)
                continue;
            // Accepted.
            list.push(boundary);
            // Skip going further.
            if (!includeNested && origBoundary !== boundary)
                continue;
			// Add child defs to top of queue.
			if (boundary.innerBoundaries[0]) {
			    bLeft = boundary.innerBoundaries.concat(bLeft.slice(i));
                i = 0;
            }
		}
        return list;
    },

    /** Finds treeNodes of given types within the given rootTreeNode (including it).
     * - If includeNested is true, searches recursively inside sub boundaries - not just within the render scope. (Normally stops after meets a source or content boundary.)
     * - If includeInHosts is true, extends the search to inside nested hosts as well. (Not recommended.)
     * - If includeInInactive is true, extends the search to include inactive boundaries and treeNodes inside them. */
    treeNodesWithin(rootTreeNode: MixDOMTreeNode, okTypes?: Partial<Record<MixDOMTreeNodeType, boolean>>, maxCount: number = 0, includeNested: boolean = false, includeInHosts: boolean = false, validator?: (treeNode: MixDOMTreeNode) => any): MixDOMTreeNode[] {
        // Prepare.
        const list: MixDOMTreeNode[] = [];
		let treeNodesLeft : MixDOMTreeNode[] = [rootTreeNode];
		let treeNode : MixDOMTreeNode | undefined;
        let i = 0;
        const origBoundary = rootTreeNode.boundary;
        // Loop recursively in tree order.
		while (treeNode = treeNodesLeft[i]) {
            // Next.
            i++;
            // Skip inactive.
            if (treeNode.boundary && treeNode.boundary.isMounted === null)
                continue;
            // Accepted.
            if (!okTypes || okTypes[treeNode.type]) {
                if (!validator || validator(treeNode)) {
                    const count = list.push(treeNode);
                    if (maxCount && count >= maxCount)
                        return list;
                }
            }
            // Skip going further.
            if (treeNode.boundary && !includeNested && treeNode.boundary !== origBoundary)
                continue;
            else if (treeNode.type === "host" && !includeInHosts)
                continue;
			// Add child defs to top of queue.
			if (treeNode.children[0]) {
			    treeNodesLeft = treeNode.children.concat(treeNodesLeft.slice(i));
                i = 0;
            }
		}
        return list
    },

    rootDOMTreeNodes(rootNode: MixDOMTreeNode, inNestedBoundaries: boolean = false, includeEmpty: boolean = false, maxCount: number = 0): MixDOMTreeNodeDOM[] {
        // Loop each root node.
        let collected: MixDOMTreeNodeDOM[] = [];
        for (const treeNode of rootNode.children) {
            // Skip - doesn't have any.
            if (!treeNode.domNode && !includeEmpty)
                continue;
            // Handle by type.
            switch(treeNode.type) {
                // Collect.
                case "dom":
                    collected.push(treeNode);
                    if (maxCount && collected.length >= maxCount)
                        return collected;
                    break;
                // If does not want nested boundaries (including nested hosts), skip.
                // .. Otherwise continue to collect root nodes (below).
                case "boundary":
                case "pass":
                case "host":
                    if (!inNestedBoundaries)
                        break;
                // Collect root nodes inside.
                case "contexts":
                case "root":
                    collected = collected.concat(_Find.rootDOMTreeNodes(treeNode, inNestedBoundaries, includeEmpty, maxCount && (maxCount - collected.length)));
                    if (maxCount && collected.length >= maxCount)
                        return collected.slice(0, maxCount);
                    break;
            }
        }
        // Return collection.
        return collected;
    },

    /** Get all defs (including the given one) in tree order traversing down from the given one.
     * - The search is automatically limited to inside the render scope, as defs are. */
    allDefsIn(rootDef: MixDOMDefApplied, okTypes?: Partial<Record<MixDOMTreeNodeType, boolean>>, maxCount: number = 0): MixDOMDefApplied[] {
        // Prepare.
        const allDefs: MixDOMDefApplied[] = [];
        let defs: MixDOMDefApplied[] = [ rootDef ];
        let def: MixDOMDefApplied | undefined;
        let i = 0;
        // Loop each.
        while (def = defs[i]) {
            // Add.
            if (!okTypes || okTypes[def.MIX_DOM_DEF])
                // Stop if too much.
                if (allDefs.push(def) >= maxCount && maxCount)
                    break;
            // Next.
            i++;
            // Add kids to the front of the queue.
            if (def.childDefs[0]) {
                defs = def.childDefs.concat(defs.slice(i));
                i = 0;
            }
        }
        // Return collected.
        return allDefs;
    },


    // - Shortcuts - //

    // treeNodesIn(treeNode: TreeNode, types: RecordableType<MixDOMTreeNodeType>, maxCount: number = 0, allowWithinBoundaries: boolean = false, allowOverHosts: boolean = false, validator?: (treeNode: TreeNode) => any): TreeNode[] {
    //     return _Find.treeNodesWithin(treeNode, _Lib.buildRecordable<MixDOMTreeNodeType>(types), maxCount, allowWithinBoundaries, allowOverHosts, validator);
    // },
    //
    // componentsIn<Comp extends Component = Component>(treeNode: TreeNode, maxCount: number = 0, allowWithinBoundaries: boolean = false, allowOverHosts: boolean = false, validator?: (treeNode: TreeNode) => any): Comp[] {
    //     return _Find.treeNodesWithin(treeNode, { boundary: true }, maxCount, allowWithinBoundaries, allowOverHosts, validator).map(t => (t.boundary && (t.boundary.live || t.boundary.mini)) as unknown as Comp);
    // },

    domElementByQuery<T extends Element = Element>(treeNode: MixDOMTreeNode, selectors: string, allowWithinBoundaries: boolean = false, allowOverHosts: boolean = false): T | null {
        const validator = (tNode: MixDOMTreeNode) => tNode.domNode && tNode.domNode instanceof Element && tNode.domNode.matches(selectors);
        const foundNode = _Find.treeNodesWithin(treeNode, { dom: true }, 1, allowWithinBoundaries, allowOverHosts, validator)[0];
        return foundNode && foundNode.domNode as T || null;
    },

    domElementsByQuery<T extends Element = Element>(treeNode: MixDOMTreeNode, selectors: string, maxCount: number = 0, allowWithinBoundaries: boolean = false, allowOverHosts: boolean = false): T[] {
        const validator = (tNode: MixDOMTreeNode) => tNode.domNode && tNode.domNode instanceof Element && tNode.domNode.matches(selectors);
        return _Find.treeNodesWithin(treeNode, { dom: true }, maxCount, allowWithinBoundaries, allowOverHosts, validator).map(tNode => tNode.domNode as T);
    },

}
