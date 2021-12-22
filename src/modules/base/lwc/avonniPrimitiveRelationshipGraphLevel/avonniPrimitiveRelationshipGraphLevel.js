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
import { classSet } from 'c/utils';
import { normalizeArray } from 'c/utilsPrivate';

export default class AvonniPrimitiveRelationshipGraphLevel extends LightningElement {
    @api variant;
    @api groupActions;
    @api groupActionsPosition;
    @api itemActions;
    @api shrinkIconName;
    @api expandIconName;
    @api activeGroups;
    @api hideItemsCount;

    _groups = [];
    _selectedGroups;
    _selectedItemName;
    _selectedItem;

    connectedCallback() {
        this.updateSelection();
    }

    renderedCallback() {
        this.updateLine();
    }

    @api
    get groups() {
        return this._groups;
    }
    set groups(proxy) {
        this._groups = normalizeArray(proxy);
        this.updateSelection();
    }

    @api
    get selectedGroups() {
        return this._selectedGroups;
    }
    set selectedGroups(value) {
        this._selectedGroups = value;
    }

    @api
    get currentLevelHeight() {
        const currentLevel = this.currentLevel;
        if (!currentLevel) return 0;

        const lastGroup = currentLevel.querySelector(
            'c-primitive-relationship-graph-group:last-child'
        );
        if (!lastGroup) return 0;

        const currentLevelHeight = currentLevel.offsetHeight;
        const lastGroupHeight = lastGroup.height;

        return currentLevelHeight - lastGroupHeight;
    }

    @api
    get currentLevelWidth() {
        if (!this.currentLevel) return 0;
        return this.currentLevel.getBoundingClientRect().width;
    }

    get currentLevel() {
        return this.template.querySelector('.current-level');
    }

    get childLevel() {
        return this.template.querySelector(
            'c-primitive-relationship-graph-level'
        );
    }

    get wrapperClass() {
        return classSet('').add({
            'slds-grid': this.variant === 'horizontal',
            'slds-show_inline-block': this.variant === 'vertical'
        });
    }

    get currentLevelClass() {
        return classSet('current-level').add({
            'slds-grid': this.variant === 'vertical',
            'slds-m-left_x-large': this.variant === 'horizontal'
        });
    }

    get currentLevelWrapperClass() {
        return this.variant === 'vertical'
            ? 'slds-show_inline-block'
            : undefined;
    }

    get lineClass() {
        return classSet('line').add({
            line_active: this.containsActiveItem,
            line_horizontal: this.variant === 'vertical',
            'slds-m-left_x-large line_vertical': this.variant === 'horizontal'
        });
    }

    get containsActiveItem() {
        return Array.from(this.groups).some((group) => {
            if (!group.items) return false;

            return group.items.some((item) => item.activeSelection);
        });
    }

    get selectedItemComponent() {
        const groups = this.template.querySelectorAll(
            'c-primitive-relationship-graph-group'
        );

        let selectedItem;
        groups.forEach((group) => {
            const selection = group.selectedItemComponent;
            if (selection) selectedItem = selection;
        });
        return selectedItem;
    }

    get selectedGroupComponent() {
        const groups = this.template.querySelectorAll(
            'c-primitive-relationship-graph-group'
        );

        let selectedGroup;
        groups.forEach((group) => {
            const selection = group.selected;
            if (selection) selectedGroup = group;
        });
        return selectedGroup;
    }

    updateLine() {
        // Get the DOM elements
        const selectedItem = this.selectedItemComponent;
        const selectedGroup = this.selectedGroupComponent;
        const child = this.childLevel;
        const currentLevel = this.currentLevel;
        const line = this.template.querySelector('.line');

        if (!selectedItem || !child) return;

        // Vertical variant: calculate width
        if (this.variant === 'vertical') {
            const scroll = window.pageXOffset;
            const childPosition = child.getBoundingClientRect();
            const groupPosition = selectedGroup.getBoundingClientRect();

            // Distance between the center of the selected group and the center of the first child group
            const groupWidth =
                groupPosition.right -
                childPosition.left -
                groupPosition.width -
                scroll * 2;
            // Distance between the center of the two boundary child groups
            const childWidth = child.currentLevelWidth - groupPosition.width;

            const width = childWidth > groupWidth ? childWidth : groupWidth;
            line.setAttribute('style', `width: ${width}px;`);

            // Horizontal variant: calculate height
        } else {
            const scroll = window.pageYOffset;
            const currentLevelTop =
                currentLevel.getBoundingClientRect().top + scroll;
            const itemPosition = selectedItem.getBoundingClientRect();

            // Distance between the center of the selected item and the top of the first child group
            // 24 is removed to compensate for the line not starting at the complete top of the level
            const itemHeight =
                itemPosition.top +
                itemPosition.height / 2 +
                scroll -
                currentLevelTop -
                24;
            // Distance between the top of the two boundary child groups

            const childHeight = child.currentLevelHeight;

            const height =
                itemHeight > childHeight
                    ? `${itemHeight}px`
                    : `${childHeight}px`;
            line.setAttribute('style', `height: ${height};`);
        }
    }

    updateSelection() {
        if (!this.groups) return;

        const groups = JSON.parse(JSON.stringify(this.groups));
        const selectedGroup = groups.find((group) => group.selected);
        if (selectedGroup && selectedGroup.items) {
            const selectedItem = selectedGroup.items.find(
                (item) => item.selected
            );
            if (selectedItem && selectedItem.groups)
                this._selectedGroups = selectedItem.groups;
        }
    }

    cleanSelection() {
        this._selectedGroups = undefined;
        if (this.childLevel) this.childLevel.selectedGroups = undefined;
    }

    dispatchSelectEvent(event) {
        this.dispatchEvent(
            new CustomEvent('select', {
                detail: {
                    name: event.detail.name
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

    handleSelect(event) {
        this.cleanSelection();
        this.dispatchSelectEvent(event);
    }

    handleCloseActiveGroup() {
        this.cleanSelection();
    }

    handleGroupHeightChange() {
        this.updateLine();

        this.dispatchEvent(new CustomEvent('heightchange'));
    }
}
