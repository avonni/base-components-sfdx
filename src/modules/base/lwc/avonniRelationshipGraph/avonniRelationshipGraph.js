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

import { LightningElement, api } from 'lwc';
import {
    normalizeString,
    normalizeArray,
    normalizeBoolean
} from 'c/utilsPrivate';
import { classSet } from 'c/utils';

const RELATIONSHIP_GRAPH_GROUP_VARIANTS = {
    valid: ['horizontal', 'vertical'],
    default: 'horizontal'
};

const ACTIONS_POSITIONS = {
    valid: ['top', 'bottom'],
    default: 'top'
};

const DEFAULT_SHRINK_ICON_NAME = 'utility:chevrondown';
const DEFAULT_EXPAND_ICON_NAME = 'utility:chevronright';

/**
 * @class
 * @descriptor avonni-relationship-graph
 * @storyId example-relationship-graph--base
 * @public
 */
export default class AvonniRelationshipGraph extends LightningElement {
    /**
     * The Lightning Design System name of the icon used as a fallback when the root avatar image fails to load.
     * Specify the name in the format 'utility:down' where 'utility' is the category, and 'down' is the specific icon to be displayed.
     *
     * @type {string}
     * @public
     */
    @api avatarFallbackIconName;
    /**
     * Image URL for the avatar of the root item. If present, the avatar is displayed before the label.
     *
     * @type {string}
     * @public
     */
    @api avatarSrc;
    /**
     * Icon used to expand a closed group of items.
     *
     * @type {string}
     * @public
     * @default utility:chevronright
     */
    @api expandIconName = DEFAULT_EXPAND_ICON_NAME;
    /**
     * URL for the root label link.
     *
     * @type {string}
     * @public
     */
    @api href;
    /**
     * Root label.
     *
     * @type {string}
     * @public
     * @required
     */
    @api label;
    /**
     * Icon used to shrink an expanded group of items.
     *
     * @type {string}
     * @public
     * @default utility:chevrondown
     */
    @api shrinkIconName = DEFAULT_SHRINK_ICON_NAME;

    _actions = [];
    _groupActions = [];
    _groupActionsPosition = ACTIONS_POSITIONS.default;
    _groups = [];
    _hideItemsCount = false;
    _itemActions = [];
    _selectedItem;
    _selectedItemName;
    _variant = RELATIONSHIP_GRAPH_GROUP_VARIANTS.default;

    processedGroups;
    selectedItemPosition;
    inlineHeader;

    connectedCallback() {
        this.updateSelection();

        if (this.variant === 'vertical') {
            this.inlineHeader = true;
        }
        this._isConnected = true;
    }

    renderedCallback() {
        this.updateLine();
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Array of root actions.
     *
     * @type {object[]}
     * @public
     */
    @api
    get actions() {
        return this._actions;
    }
    set actions(value) {
        this._actions = normalizeArray(value);
    }

    /**
     * Array of default actions for all groups.
     *
     * @type {object[]}
     * @public
     */
    @api
    get groupActions() {
        return this._groupActions;
    }
    set groupActions(value) {
        this._groupActions = normalizeArray(value);
    }

    /**
     * Position of the group actions. Valid options include top and bottom.
     *
     * @type {string}
     * @public
     * @default top
     */
    @api
    get groupActionsPosition() {
        return this._groupActionsPosition;
    }
    set groupActionsPosition(value) {
        this._groupActionsPosition = normalizeString(value, {
            fallbackValue: ACTIONS_POSITIONS.default,
            validValues: ACTIONS_POSITIONS.valid
        });
    }

    /**
     * Array of group objects.
     *
     * @type {object[]}
     * @public
     */
    @api
    get groups() {
        return this._groups;
    }
    set groups(value) {
        this._groups = normalizeArray(value);

        if (this.isConnected) {
            this.updateSelection();
        }
    }

    /**
     * If present, the number of items per group is hidden.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get hideItemsCount() {
        return this._hideItemsCount;
    }
    set hideItemsCount(boolean) {
        this._hideItemsCount = normalizeBoolean(boolean);
    }

    /**
     * Array of default actions for all items.
     *
     * @type {object[]}
     * @public
     */
    @api
    get itemActions() {
        return this._itemActions;
    }
    set itemActions(value) {
        this._itemActions = normalizeArray(value);
    }

    /**
     * Name of the selected item.
     *
     * @type {string}
     * @public
     */
    @api
    get selectedItemName() {
        return this._selectedItemName;
    }
    set selectedItemName(name) {
        this._selectedItemName =
            (typeof name === 'string' && name.trim()) || '';

        if (this.isConnected) this.updateSelection();
    }

    /**
     * The variant changes the appearance of the graph. Valid values include horizontal and vertical.
     *
     * @type {string}
     * @public
     * @default horizontal
     */
    @api
    get variant() {
        return this._variant;
    }
    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: RELATIONSHIP_GRAPH_GROUP_VARIANTS.default,
            validValues: RELATIONSHIP_GRAPH_GROUP_VARIANTS.valid
        });
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Verify if avatar is displayed.
     *
     * @type {string}
     */
    get hasAvatar() {
        return this.avatarSrc || this.avatarFallbackIconName;
    }

    /**
     * Verify if actions object is populated.
     *
     * @type {object[]}
     */
    get hasActions() {
        return this.actions.length > 0;
    }

    /**
     * Get the DOM child element level
     *
     * @type {Element}
     */
    get childLevel() {
        return this.template.querySelector(
            '[data-element-id="avonni-primitive-relationship-graph-level"]'
        );
    }

    /**
     * Compute wrapper class when horizontal.
     *
     * @type {string}
     */
    get wrapperClass() {
        return classSet('').add({
            'slds-grid': this.variant === 'horizontal',
            'slds-m-left_medium': this.variant === 'horizontal'
        });
    }

    /**
     * Compute header class styling based on selected attributes.
     *
     * @type {string}
     */
    get headerClass() {
        const { variant } = this;
        return classSet('slds-show_inline-block').add({
            'slds-box': variant === 'vertical',
            group: variant === 'vertical',
            'slds-text-align_center': variant === 'vertical',
            'slds-m-bottom_medium': variant === 'horizontal'
        });
    }

    /**
     * Compute actions class styling based on vertical or horizontal alignment.
     *
     * @type {string}
     */
    get actionsClass() {
        return classSet('slds-is-relative actions').add({
            actions_vertical: this.variant === 'vertical',
            'slds-p-vertical_small': this.variant === 'horizontal',
            'slds-p-vertical_large': this.variant === 'vertical'
        });
    }

    /**
     * Get action button class styling based on vertical or horizontal alignment.
     *
     * @type {string}
     */
    get actionButtonClass() {
        return classSet('slds-button slds-button_neutral').add({
            'slds-button_stretch': this.variant === 'vertical',
            'slds-m-bottom_xx-small': this.variant === 'horizontal'
        });
    }

    /**
     * Get line class styling based on vertical or horizontal alignment.
     *
     * @type {string}
     */
    get lineClass() {
        return classSet().add({
            line_vertical: this.variant === 'horizontal',
            'line_horizontal slds-m-bottom_large': this.variant === 'vertical'
        });
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Update line width and height based child element level.
     *
     * @type {string}
     */
    updateLine() {
        const line = this.template.querySelector(
            '[data-element-id="div-line"]'
        );
        const currentLevel = this.childLevel;

        if (this.variant === 'vertical') {
            const width = currentLevel.offsetWidth;
            line.setAttribute('style', `width: calc(${width}px - 21rem)`);
        } else {
            const height = currentLevel.currentLevelHeight;
            line.setAttribute('style', `height: calc(${height}px + 1.5rem);`);
        }
    }

    /**
     * Update selection from graph.
     */
    updateSelection() {
        if (!this.groups.length > 0) return;

        // Reset the selection and go through the tree with the new selection
        this._selectedItem = undefined;
        this.processedGroups = JSON.parse(JSON.stringify(this.groups));

        if (this.selectedItemName)
            this.selectItem(this.selectedItemName, this.processedGroups);
    }

    /**
     * Select item from relationship graph.
     *
     * @param {string} name
     * @param {object} groups
     */
    selectItem(name, groups) {
        let i = 0;

        while (!this._selectedItem && i < groups.length) {
            const items = groups[i].items;

            if (items) {
                const itemIndex = items.findIndex(
                    (currentItem) => currentItem.name === name
                );

                if (itemIndex > -1) {
                    // Mark current group and item as selected
                    const currentGroup = groups[i];
                    const currentItem = currentGroup.items[itemIndex];
                    currentGroup.selected = true;
                    currentItem.selected = true;
                    currentItem.activeSelection = true;

                    this._selectedItem = currentItem;
                    break;
                }

                let j = 0;
                while (!this._selectedItem && j < items.length) {
                    if (items[j].groups) this.selectItem(name, items[j].groups);

                    // If a child item has been selected, select the current parent item
                    if (this._selectedItem) items[j].selected = true;
                    j += 1;
                }
            }

            // If a child group has been selected, select the current parent group
            if (this._selectedItem) groups[i].selected = true;
            i += 1;
        }
    }

    /**
     * Select event dispatch.
     *
     * @param {Event} event
     */
    dispatchSelectEvent(event) {
        const name = event.detail.name;
        this._selectedItemName = name;
        this.updateSelection();

        /**
         * The event fired when a user clicks on an item. An external select by changing the selected attribute of an item does not emit this event.
         *
         * @event
         * @name select
         * @param {string} name Name of the item selected.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('select', {
                detail: {
                    name: name
                }
            })
        );
    }

    /**
     * Action click event dispatcher.
     *
     * @param {Event} event
     */
    dispatchActionClickEvent(event) {
        /**
         * The event fired when a user clicks on an action.
         *
         * @event
         * @name actionclick
         * @param {string} name Name of the action clicked.
         * @param {string} targetName Name of the group or item the action is related to. If the action is a root action, the value of <code>targetName</code> will be ‘root’.
         * @param {object} itemData For an item action, data of the item.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('actionclick', {
                detail: event.detail
            })
        );
    }

    handleActionClick(event) {
        const name = event.currentTarget.value;

        this.dispatchEvent(
            new CustomEvent('actionclick', {
                detail: {
                    name: name,
                    targetName: 'root'
                }
            })
        );
    }

    /**
     * Level height change handler.
     */
    handleLevelHeightChange() {
        this.updateLine();
    }
}
