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

const ITEM_THEMES = {
    valid: ['default', 'shade', 'inverse'],
    default: 'default'
};

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

export default class AvonniRelationshipGraph extends LightningElement {
    @api label;
    @api avatarSrc;
    @api avatarFallbackIconName;
    @api href;
    @api shrinkIconName = DEFAULT_SHRINK_ICON_NAME;
    @api expandIconName = DEFAULT_EXPAND_ICON_NAME;

    processedGroups;
    selectedItemPosition;
    inlineHeader;

    _variant = RELATIONSHIP_GRAPH_GROUP_VARIANTS.default;
    _actions = [];
    _selectedItemName;
    _selectedItem;
    _groups = [];
    _groupActions = [];
    _groupActionsPosition = ACTIONS_POSITIONS.default;
    _groupTheme = ITEM_THEMES.default;
    _itemActions = [];
    _itemTheme = ITEM_THEMES.default;
    _hideItemsCount = false;

    connectedCallback() {
        this.updateSelection();

        if (this.variant === 'vertical') {
            this.inlineHeader = true;
        }
    }

    renderedCallback() {
        this.updateLine();
    }

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

    @api
    get actions() {
        return this._actions;
    }
    set actions(value) {
        this._actions = normalizeArray(value);
    }

    @api
    get selectedItemName() {
        return this._selectedItemName;
    }
    set selectedItemName(name) {
        this._selectedItemName =
            (typeof name === 'string' && name.trim()) || '';

        if (this.isConnected) this.updateSelection();
    }

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

    @api
    get groupActions() {
        return this._groupActions;
    }
    set groupActions(value) {
        this._groupActions = normalizeArray(value);
    }

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

    @api
    get groupTheme() {
        return this._groupTheme;
    }
    set groupTheme(value) {
        this._groupTheme = normalizeString(value, {
            fallbackValue: ITEM_THEMES.default,
            validValues: ITEM_THEMES.valid
        });
    }

    @api
    get itemActions() {
        return this._itemActions;
    }
    set itemActions(value) {
        this._itemActions = normalizeArray(value);
    }

    @api
    get itemTheme() {
        return this._itemTheme;
    }
    set itemTheme(value) {
        this._itemTheme = normalizeString(value, {
            fallbackValue: ITEM_THEMES.default,
            validValues: ITEM_THEMES.valid
        });
    }

    @api
    get hideItemsCount() {
        return this._hideItemsCount;
    }
    set hideItemsCount(boolean) {
        this._hideItemsCount = normalizeBoolean(boolean);
    }

    get hasAvatar() {
        return this.avatarSrc || this.avatarFallbackIconName;
    }

    get hasActions() {
        return this.actions.length > 0;
    }

    get childLevel() {
        return this.template.querySelector(
            'c-primitive-relationship-graph-level'
        );
    }

    get wrapperClass() {
        return classSet('').add({
            'slds-grid': this.variant === 'horizontal',
            'slds-m-left_medium': this.variant === 'horizontal'
        });
    }

    get headerClass() {
        const { variant, groupTheme } = this;
        return classSet('slds-show_inline-block').add({
            'slds-box': variant === 'vertical',
            group: variant === 'vertical',
            'slds-theme_shade':
                variant === 'vertical' && groupTheme === 'shade',
            'slds-theme_inverse':
                variant === 'vertical' && groupTheme === 'inverse',
            'slds-theme_default':
                variant === 'vertical' && groupTheme === 'default',
            'slds-text-align_center': variant === 'vertical',
            'slds-m-bottom_medium': variant === 'horizontal'
        });
    }

    get actionsClass() {
        return classSet('slds-is-relative actions').add({
            actions_vertical: this.variant === 'vertical',
            'slds-p-vertical_small': this.variant === 'horizontal',
            'slds-p-vertical_large': this.variant === 'vertical'
        });
    }
    get actionButtonClass() {
        return classSet('slds-button slds-button_neutral').add({
            'slds-button_stretch': this.variant === 'vertical',
            'slds-m-bottom_xx-small': this.variant === 'horizontal'
        });
    }

    get lineClass() {
        return classSet('line').add({
            line_vertical: this.variant === 'horizontal',
            'line_horizontal slds-m-bottom_large': this.variant === 'vertical'
        });
    }

    updateLine() {
        const line = this.template.querySelector('.line');
        const currentLevel = this.childLevel;

        if (this.variant === 'vertical') {
            const width = currentLevel.offsetWidth;
            line.setAttribute('style', `width: calc(${width}px - 21rem)`);
        } else {
            const height = currentLevel.currentLevelHeight;
            line.setAttribute('style', `height: calc(${height}px + 1.5rem);`);
        }
    }

    updateSelection() {
        if (!this.groups.length > 0) return;

        // Reset the selection and go through the tree with the new selection
        this._selectedItem = undefined;
        this.processedGroups = JSON.parse(JSON.stringify(this.groups));

        if (this.selectedItemName)
            this.selectItem(this.selectedItemName, this.processedGroups);
    }

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

    dispatchSelectEvent(event) {
        const name = event.detail.name;
        this._selectedItemName = name;
        this.updateSelection();

        this.dispatchEvent(
            new CustomEvent('select', {
                detail: {
                    name: name
                }
            })
        );
    }

    dispatchActionClickEvent(event) {
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

    handleLevelHeightChange() {
        this.updateLine();
    }
}
