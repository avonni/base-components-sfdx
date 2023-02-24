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
    deepCopy,
    normalizeArray,
    normalizeBoolean,
    normalizeObject,
    normalizeString
} from 'c/utilsPrivate';
import { classSet } from 'c/utils';
import Menu from './avonniMenu';

const MENU_VARIANTS = {
    valid: ['horizontal', 'vertical'],
    default: 'horizontal'
};

const DEFAULT_APPLY_BUTTON_LABEL = 'Apply';
const DEFAULT_RESET_BUTTON_LABEL = 'Reset';

/**
 * @class
 * @descriptor avonni-filter-menu-group
 * @storyId example-filter-menu-group--base
 * @public
 */
export default class AvonniFilterMenuGroup extends LightningElement {
    _applyButtonLabel = DEFAULT_APPLY_BUTTON_LABEL;
    _hideApplyResetButtons = false;
    _hideSelectedItems = false;
    _menus = [];
    _resetButtonLabel = DEFAULT_RESET_BUTTON_LABEL;
    _value = {};
    _variant = MENU_VARIANTS.default;

    computedMenus = [];
    selectedPills = [];
    _connected = false;
    _selectedValue = {};

    connectedCallback() {
        this.computeValue();
        this._connected = true;
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Label of the apply button.
     *
     * @type {string}
     * @public
     * @default Apply
     */
    @api
    get applyButtonLabel() {
        return this._applyButtonLabel;
    }
    set applyButtonLabel(value) {
        this._applyButtonLabel =
            value && typeof value === 'string'
                ? value.trim()
                : DEFAULT_APPLY_BUTTON_LABEL;
    }

    /**
     * If present, the apply and reset buttons are hidden and the value is immediately saved every time the selection changes.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get hideApplyResetButtons() {
        return this._hideApplyResetButtons;
    }
    set hideApplyResetButtons(value) {
        this._hideApplyResetButtons = normalizeBoolean(value);
    }

    /**
     * If present, the selected items are hidden.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get hideSelectedItems() {
        return this._hideSelectedItems;
    }
    set hideSelectedItems(bool) {
        this._hideSelectedItems = normalizeBoolean(bool);
    }

    /**
     * Array of menu objects.
     *
     * @type {object[]}
     * @public
     */
    @api
    get menus() {
        return this._menus;
    }
    set menus(value) {
        this._menus = deepCopy(normalizeArray(value, 'object'));
        this.computedMenus = this._menus.map((menu) => {
            return new Menu(menu);
        });

        if (this._connected) {
            this.computeValue();
        }
    }

    /**
     * Label of the reset button.
     *
     * @type {string}
     * @public
     * @default Reset
     */
    @api
    get resetButtonLabel() {
        return this._resetButtonLabel;
    }
    set resetButtonLabel(value) {
        this._resetButtonLabel =
            value && typeof value === 'string'
                ? value.trim()
                : DEFAULT_RESET_BUTTON_LABEL;
    }

    /**
     * Value of the menus. The object follows the structure `{ menuName: menuValue }`.
     * Depending on the menu type, its value will have a different type:
     * * `list`: selected item’s value, or array of selected items' values.
     * * `range`: array of selected numbers.
     * * `date-range`: array of ISO 8601 dates.
     *
     * @type {object}
     * @public
     */
    @api
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = deepCopy(normalizeObject(value));

        if (this._connected) {
            this.computeValue();
        }
    }

    /**
     * The variant changes the look of the menu group. Accepted variants include horizontal and vertical.
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
            fallbackValue: MENU_VARIANTS.default,
            validValues: MENU_VARIANTS.valid
        });
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * True if the apply and reset buttons should be hidden for each menu.
     *
     * @type {boolean}
     */
    get hideMenuApplyResetButtons() {
        return this.isVertical || this.hideApplyResetButtons;
    }

    /**
     * Check if Vertical variant.
     *
     * @type {boolean}
     */
    get isVertical() {
        return this.variant === 'vertical';
    }

    /**
     * Check if selectedPills is populated and if items are not hidden.
     *
     * @type {boolean}
     */
    get showSelectedItems() {
        return !this.hideSelectedItems && this.selectedPills.length;
    }

    /**
     * Filter Wrapper class styling
     *
     * @type {string}
     */
    get filtersWrapperClass() {
        return classSet({
            'slds-grid': !this.isVertical
        });
    }

    /**
     * Filters class styling
     *
     * @type {string}
     */
    get filtersClass() {
        return classSet({
            'slds-m-right_xx-small': !this.isVertical,
            'slds-m-bottom_medium': this.isVertical
        });
    }

    get pillActions() {
        return [
            {
                label: 'Remove',
                name: 'remove',
                iconName: 'utility:close'
            }
        ];
    }

    /**
     * True if the apply and reset buttons should be displayed at the end of the menus.
     *
     * @type {boolean}
     */
    get showApplyResetButtons() {
        return this.isVertical && !this.hideApplyResetButtons;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Save the currently selected values.
     *
     * @public
     */
    @api
    apply() {
        this._value = deepCopy(this._selectedValue);
        this.computeValue();
    }

    /**
     * Clear the value.
     *
     * @deprecated
     */
    @api
    clear() {
        this._value = {};
        this.computeValue();

        console.warn(
            'The clear() method is deprecated. To unselect the value, use reset(). To remove the current value, use the value attribute.'
        );
    }

    /**
     * Set the focus on the first focusable element.
     *
     * @public
     */
    @api
    focus() {
        const element = this.template.querySelector(
            '[data-group-name="focusable-element"]'
        );
        if (element) {
            element.focus();
        }
    }

    /**
     * Unselect all values, without saving the change.
     *
     * @public
     */
    @api
    reset() {
        this._selectedValue = {};
        this.computedMenus.forEach((menu) => {
            menu.value = [];
        });
        this.computedMenus = [...this.computedMenus];
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Set the value in each computed menu.
     */
    computeValue() {
        const pills = [];
        this.computedMenus.forEach((menu) => {
            menu.value = deepCopy(this.value[menu.name]);
            pills.push(menu.selectedItems);
        });
        this.selectedPills = pills.flat();
        this._selectedValue = deepCopy(this.value);
    }

    /*
     * ------------------------------------------------------------
     *  EVENT HANDLERS AND DISPATCHERS
     * -------------------------------------------------------------
     */

    /**
     * Handle a click on an "Apply" button, in the horizontal variant.
     *
     * @param {Event} event `apply` event fired by the menu.
     */
    handleApply(event) {
        event.stopPropagation();
        if (this.hideMenuApplyResetButtons) {
            // The apply and select events are fired at the same time
            return;
        }
        const menuName = event.target.dataset.name;
        this.value[menuName] = event.detail.value;
        this.computeValue();
        this.dispatchApply(menuName);
    }

    /**
     * Handle the click on the "Apply" button, in the vertical variant.
     */
    handleApplyClick() {
        this.apply();
        this.dispatchApply();
    }

    /**
     * Handle the load more event.
     *
     * @param {Event} event `loadmore` event fired by the menu.
     */
    handleLoadMore(event) {
        event.stopPropagation();
        const menuName = event.target.dataset.name;

        /**
         * The event fired when the end of a list is reached. It is only fired if the `enableInfiniteLoading` type attribute is present on the menu. In the horizontal variant, the `loadmore` event is triggered by a scroll to the end of the list. In the vertical variant, the `loadmore` event is triggered by a button clicked by the user.
         *
         * @event
         * @name loadmore
         * @param {string} name Name of the menu that triggered the event.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('loadmore', { detail: { name: menuName } })
        );
    }

    /**
     * Handle a click on a "Reset" button, in the horizontal variant.
     *
     * @param {Event} event `reset` event fired by the menu.
     */
    handleReset(event) {
        event.stopPropagation();
        if (this.isVertical) {
            return;
        }
        const menuName = event.target.dataset.name;
        delete this._selectedValue[menuName];
        this.dispatchReset(menuName);
    }

    /**
     * Handle a click on the "Reset" button, in the vertical variant.
     */
    handleResetClick() {
        if (!this.isVertical) {
            return;
        }
        this.reset();
        this.dispatchReset();
    }

    /**
     * Handle an input in a search field.
     *
     * @param {Event} event `search` event fired by the menu.
     */
    handleSearch(event) {
        event.stopPropagation();
        const menuName = event.target.dataset.name;
        const value = event.detail.value;

        /**
         * The event fired when a search input value is changed.
         *
         * @event
         * @name search
         * @param {string} name Name of the menu that triggered the event.
         * @param {string} value Value of the search input.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('search', {
                detail: {
                    name: menuName,
                    value
                }
            })
        );
    }

    /**
     * Handle the removal of a selected item pill.
     *
     * @param {Event} event `actionclick` event fired by the pill container.
     */
    handleSelectedItemRemove(event) {
        const index = event.detail.index;
        const selectedPill = this.selectedPills.splice(index, 1)[0];
        const { menuName, itemValue } = selectedPill;

        // Update the menu value
        if (itemValue) {
            const menu = this.computedMenus.find((m) => m.name === menuName);
            this.value[menuName] = menu.value.filter((v) => {
                return v !== selectedPill.itemValue;
            });
        } else {
            delete this.value[menuName];
        }
        this.computeValue();
        this.dispatchApply();
    }

    /**
     * Handle the selection of a new value in one of the menus.
     *
     * @param {Event} event `select` event fired by the menu.
     */
    handleSelect(event) {
        event.stopPropagation();
        const menuName = event.target.dataset.name;
        const value = event.detail.value;

        if (!value.length) {
            delete this._selectedValue[menuName];
        } else {
            this._selectedValue[menuName] = value;
        }

        /**
         * The event fired when a user selects or unselects a value.
         *
         * @event
         * @name select
         * @param {string} name Name of the menu.
         * @param {string} value Currently displayed value of the menu.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('select', {
                detail: {
                    name: menuName,
                    value
                }
            })
        );

        if (this.hideApplyResetButtons) {
            // Save the selection immediately
            this.apply();
            this.dispatchApply(menuName);
        }
    }

    /**
     * Dispatch the apply event.
     *
     * @param {string} name Name of the menu that triggered the event, if any.
     */
    dispatchApply(name) {
        /**
         * The event fired when an "Apply" button is clicked, or a pill removed from the selected items.
         *
         * @event
         * @name apply
         * @param {string} name In the horizontal variant, name of the menu that triggered the event.
         * @param {object} value Current value of the filter menu group.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('apply', {
                detail: {
                    name,
                    value: this.value
                }
            })
        );
    }

    /**
     * Dispatch the reset event.
     *
     * @param {string} name Name of the menu that triggered the event, if any.
     */
    dispatchReset(name) {
        /**
         * The event fired when a "Reset" button is clicked.
         *
         * @event
         * @name reset
         * @param {string} name In the horizontal variant, name of the menu that triggered the event.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('reset', {
                detail: {
                    name
                }
            })
        );
    }
}
