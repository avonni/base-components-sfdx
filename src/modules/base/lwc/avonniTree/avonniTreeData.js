/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2021, Avonni Labs, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * - Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { getTreeNode } from './avonniTreeNode';
import { assert } from 'c/utilsPrivate';

/**
 * @class
 * @param {number} currentFocusedItemIndex Index of the currently focused item.
 * @param {string[]} treeItemsInTraversalOrder Array of item keys, in the order they appear in the tree when it is completely opened.
 * @param {object[]} visibleTreeItems Set of visible tree items.
 * @param {object} indices Map of item keys and their value.
 * @param {object} nameKeyMapping Map of item names and their key.
 */
export class TreeData {
    constructor() {
        this._currentFocusedItemIndex = 0;
        this._treeItemsInTraversalOrder = [];
        this._visibleTreeItems = null;
        this._indices = {};
        this._nameKeyMapping = {};
    }

    get treeItemsInTraversalOrder() {
        return this._treeItemsInTraversalOrder;
    }

    get visibleTreeItems() {
        return this._visibleTreeItems;
    }

    get currentFocusedItemIndex() {
        return this._currentFocusedItemIndex;
    }

    get indices() {
        return this._indices;
    }

    get nameKeyMapping() {
        return this._nameKeyMapping;
    }

    /**
     * Add an item to the visible tree items set.
     *
     * @param {object} child Item to add to the visible items.
     */
    addVisible(child) {
        this.visibleTreeItems.add(child);
    }

    /**
     * Select all children descendants of a node.
     *
     * @param {object} node Node to select all descendants of.
     * @param {string[]} selectedItems Array of selected item names, the new selected items' names should be added to.
     */
    cascadeSelectionDown(node, selectedItems) {
        node.children.forEach((child) => {
            const name = child.name;
            if (!selectedItems.includes(name)) {
                selectedItems.push(name);
                child.selected = true;
                this.cascadeSelectionDown(child, selectedItems);
            }
        });
    }

    /**
     * Go up the tree hierarchy to select all the item's ancestors for which all children are selected.
     *
     * @param {object} item Item from which to start the cascade up the tree.
     * @param {string[]} selectedItems Array of selected item names, the new selected items' names should be added to.
     */
    cascadeSelectionUp(item, selectedItems) {
        const node = item.treeNode;
        const name = node.name;
        if (!selectedItems.includes(name)) {
            const allChildrenAreSelected = node.children.every((child) => {
                return child.selected;
            });
            if (allChildrenAreSelected) {
                node.selected = true;
                selectedItems.push(name);
                const parent = this.getItem(item.parent);
                if (parent) {
                    this.cascadeSelectionUp(parent, selectedItems);
                }
            }
        }
    }

    /**
     * Select the item that belongs to this name, and select all its descendants and ancestors if needed.
     *
     * @param {string} name Name of the item to select.
     * @param {string[]} selectedItems Array of selected item names, the new selected items' names should be added to.
     * @param {boolean} cascadeSelection If true, cascade the selection to the children and parents of the item.
     */
    computeSelection(name, selectedItems, cascadeSelection) {
        const item = this.getItemFromName(name);
        if (!item) return;

        item.treeNode.selected = true;
        if (cascadeSelection) {
            this.cascadeSelectionDown(item.treeNode, selectedItems);
            const parent = this.getItem(item.parent);
            if (parent) {
                this.cascadeSelectionUp(parent, selectedItems);
            }
        }
    }

    /**
     * Clone an item.
     *
     * @param {object} item Item to clone.
     * @returns {object} Cloned item.
     */
    cloneItems(item) {
        const newItem = {
            avatar: item.avatar,
            label: item.label,
            name: item.name,
            expanded: item.expanded,
            metatext: item.metatext,
            href: item.href,
            disabled: item.disabled,
            isLoading: item.isLoading,
            items: [],
            fields: item.fields
        };

        if (item.items && item.items.length > 0) {
            newItem.items = item.items.map((leaf) => {
                return this.cloneItems(leaf);
            });
        }

        return newItem;
    }

    /**
     * Expand the parents of an item.
     *
     * @param {object} node Item to expand the tree to.
     */
    expandTo(node) {
        let parentKey = node.parent;
        let parentNode = this._indices[parentKey];
        while (parentKey && parentKey !== '0' && parentNode) {
            parentKey = parentNode.parent;
            parentNode = parentNode.treeNode;
            if (!parentNode.nodeRef.expanded) {
                parentNode.nodeRef.expanded = true;
            }

            parentNode = this._indices[parentKey];
        }
    }

    /**
     * Find the first visible focusable item.
     *
     * @returns {object} First focusable item.
     */
    findFirstNodeToFocus() {
        return this.indices[this.treeItemsInTraversalOrder[0]];
    }

    /**
     * Find the index of an item, based on its key.
     *
     * @param {string} key Key of the item.
     * @returns {number} Index of the item.
     */
    findIndex(key) {
        return this.indices[key] !== undefined ? this.indices[key].index : -1;
    }

    /**
     * Find the last visible focusable item.
     *
     * @returns {object} Last focusable item.
     */
    findLastNodeToFocus() {
        let lastNode = null;
        const treeitems = this.treeItemsInTraversalOrder;
        for (let i = treeitems.length - 1; i >= 0; i--) {
            if (this.isVisible(treeitems[i])) {
                lastNode = treeitems[i];
                break;
            }
        }
        return this.indices[lastNode];
    }

    /**
     * Find the next visible focusable item.
     *
     * @param {number} current Index of the currently focused item.
     * @returns {object} Next focusable item.
     */
    findNextNodeToFocus(current = this.currentFocusedItemIndex) {
        const treeitems = this.treeItemsInTraversalOrder;
        let nextNode = null;
        if (current < treeitems.length - 1) {
            for (let i = current + 1; i < treeitems.length; i++) {
                if (this.isVisible(treeitems[i])) {
                    nextNode = treeitems[i];
                    break;
                }
            }
        }
        return this.indices[nextNode];
    }

    /**
     * Find the previous item in the same branch.
     *
     * @param {number} key Key of the current item.
     * @returns {object} Previous item in the branch.
     */
    findPrevNodeInSameBranch(key) {
        const path = key.split('.');
        const index = Number(path.pop()) - 1;
        path.push(index);
        const prevKey = path.join('.');
        return this.getItem(prevKey);
    }

    /**
     * Find the previous visible focusable item.
     *
     * @param {number} current Index of the currently focused item.
     * @returns {object} Previous focusable item.
     */
    findPrevNodeToFocus(current = this.currentFocusedItemIndex) {
        const treeitems = this.treeItemsInTraversalOrder;
        let prevNode = null;
        if (current > 0) {
            for (let i = current - 1; i >= 0; i--) {
                if (this.isVisible(treeitems[i])) {
                    prevNode = treeitems[i];
                    break;
                }
            }
        }
        return this.indices[prevNode];
    }

    /**
     * Find an item from its key.
     *
     * @param {string} key Key of the item.
     * @returns {object} Item.
     */
    getItem(key) {
        return this.indices[key];
    }

    /**
     * Find an item from its index.
     *
     * @param {number} index Index of the item.
     * @returns {object} Item.
     */
    getItemAtIndex(index) {
        if (index > -1 && index < this.treeItemsInTraversalOrder.length) {
            return this.indices[this.treeItemsInTraversalOrder[index]];
        }
        return null;
    }

    /**
     * Find an item from its name.
     *
     * @param {string} name Name of the item.
     * @returns {object} Item.
     */
    getItemFromName(itemName) {
        if (typeof itemName === 'string') {
            const itemKey = this.nameKeyMapping[itemName];
            if (itemKey) {
                const item = this.getItem(itemKey);
                return item;
            }
        }
        return null;
    }

    /**
     * Get the path to access the item in the tree, in the form of an array of levels.
     *
     * @param {string} key Key of the item.
     * @returns {number[]} Array of levels of depth.
     */
    getLevelPath(key) {
        return key.split('.').map((level) => parseInt(level, 10) - 1);
    }

    /**
     * Determine if an item is visible.
     *
     * @param {object} treeItem Item to check.
     * @returns {boolean} True of the item is visible.
     */
    isVisible(treeItem) {
        return this.visibleTreeItems.has(treeItem);
    }

    /**
     * Parse the tree data into a usable tree structure.
     *
     * @param {object[]} data Data to parse.
     * @param {string[]} selectedItems Selected item names.
     * @returns {object[]} Parsed data.
     */
    parse(data, selectedItems) {
        const root = {};
        root.items = data;
        const seen = new WeakSet();
        let _selectedItem = null;
        function buildTree(currentNode, parent, level, childNum) {
            if (isNodeValid(currentNode, level)) {
                const node = getTreeNode(
                    currentNode,
                    level,
                    parent ? parent.key : null,
                    childNum + 1
                );
                if (
                    parent &&
                    parent.visible &&
                    parent.expanded &&
                    !parent.disabled
                ) {
                    node.visible = true;
                }
                level++;
                seen.add(currentNode);

                if (node.key && parent) {
                    this.treeItemsInTraversalOrder.push(node.key);
                    const indexedObj = {
                        index: this.treeItemsInTraversalOrder.length - 1,
                        key: node.key,
                        parent: parent.key,
                        level: node.level,
                        treeNode: node
                    };
                    this.indices[node.key] = indexedObj;
                    this.nameKeyMapping[node.name] = node.key;
                    if (selectedItems.includes(node.name)) {
                        node.selected = true;
                        _selectedItem = indexedObj;
                    }
                }

                if (
                    // eslint-disable-next-line no-prototype-builtins
                    currentNode.hasOwnProperty('items') &&
                    Array.isArray(currentNode.items)
                ) {
                    for (
                        let i = 0, length = currentNode.items.length;
                        i < length;
                        i++
                    ) {
                        const buildTreeFn = buildTree.bind(this);
                        buildTreeFn(currentNode.items[i], node, level, i);
                    }
                }

                if (parent) {
                    parent.children.push(node);
                    if (node.visible) {
                        parent.visibleItems.push(node.key);
                        parent.visibleItems.push.apply(
                            parent.visibleItems,
                            node.visibleItems
                        );
                    }
                    level--;
                }
                seen.delete(currentNode);
                return node;
            }
            return null;
        }
        function isNodeValid(currentNode, level) {
            const hasCycle = seen.has(currentNode);
            const hasLabel = level === 0 ? true : !!currentNode.label;
            assert(
                hasCycle === false,
                `Data passed to lightning:tree has circular reference. Skipping the node`
            );
            assert(
                hasLabel === true,
                `The node passed to lightning:tree has empty label. Skipping the node`
            );
            return !hasCycle && hasLabel;
        }
        const buildTreeFn = buildTree.bind(this);
        const tree = buildTreeFn(root, null, 0, 1);
        if (tree) {
            this._visibleTreeItems = new Set();
            tree.visibleItems.forEach((item) => {
                this._visibleTreeItems.add(item);
            });
            tree.selectedItem = _selectedItem;
            return tree;
        }
        return null;
    }

    /**
     * Remove an item from the visible items.
     *
     * @param {object} child The item to remove.
     */
    removeVisible(child) {
        this.visibleTreeItems.delete(child);
    }

    /**
     * Reset the selected items to the given selected items.
     *
     * @param {stirng[]} selectedItems Selected item names.
     */
    resetSelection(selectedItems) {
        this.treeItemsInTraversalOrder.forEach((key) => {
            const item = this.indices[key];
            item.treeNode.selected = selectedItems.includes(item.treeNode.name);
        });
    }

    /**
     * Select an item.
     *
     * @param {object} node The item to select.
     * @param {string[]} selectedItems Selected item names.
     * @param {boolean} cascadeSelection If true, select all children of the item.
     */
    selectNode(node, selectedItems, cascadeSelection) {
        node.selected = true;
        if (!selectedItems.includes(node.name)) {
            selectedItems.push(node.name);
        }

        if (cascadeSelection && node.children) {
            node.children.forEach((child) => {
                this.selectNode(child, selectedItems, cascadeSelection);
            });
        }
    }

    /**
     * Unselect an item.
     *
     * @param {object} node The item to unselect.
     * @param {string[]} selectedItems Selected item names, from which the item name is removed from.
     * @param {boolean} cascadeSelection If true, unselect all children of the item.
     */
    unselectNode(node, selectedItems, cascadeSelection) {
        node.selected = false;
        const selectedIndex = selectedItems.indexOf(node.name);
        if (selectedIndex > -1) {
            selectedItems.splice(selectedIndex, 1);
        }

        if (cascadeSelection && node.children) {
            node.children.forEach((child) => {
                this.unselectNode(child, selectedItems, cascadeSelection);
            });
        }
    }

    /**
     * Update the value of the current focus item index.
     *
     * @param {object} focused Index of the new focused item.
     * @returns {object} New focused item.
     */
    updateCurrentFocusedItemIndex(focused) {
        if (focused > -1 && focused < this.treeItemsInTraversalOrder.length) {
            this._currentFocusedItemIndex = focused;
            return this.getItemAtIndex(this.currentFocusedItemIndex);
        }
        return null;
    }

    /**
     * Remove an item's children from the visible items.
     *
     * @param {string} branchCollapsed Key of the branch that was collapsed.
     */
    updateVisibleTreeItemsOnCollapse(branchCollapsed) {
        const treeitems = this.treeItemsInTraversalOrder;
        const branchItem = this.getItem(branchCollapsed);
        const branchKeyIndex = branchItem.index;
        const branchLevel = branchItem.level;
        let level,
            child = null;
        for (let i = branchKeyIndex + 1; i < treeitems.length; i++) {
            child = this.getItem(treeitems[i]);
            level = child.level;
            if (level <= branchLevel) {
                break;
            }
            this.visibleTreeItems.delete(treeitems[i]);
        }
    }
}
