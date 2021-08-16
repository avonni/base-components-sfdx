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

import { LightningElement, api, track } from 'lwc';
import { classSet, generateUniqueId } from 'c/utils';
import {
    normalizeArray,
    normalizeBoolean,
    normalizeString
} from 'c/utilsPrivate';

/**
 * @constant
 * @type {object}
 * @property {string[]} valid   The valid icon positions.
 * @property {string}   default The default icon position.
 */
const ICON_POSITIONS = {
    valid: ['left', 'right'],
    default: 'left'
};

/**
 * @constant
 * @type {object}
 * @property {string[]} valid   The valid list item dividers.
 * @property {string}   default The default list item divider.
 */
const LIST_ITEM_DIVIDERS = {
    valid: ['top', 'bottom', 'around'],
    default: 'around'
};

/**
 * @constant
 * @type {object}
 * @property {string[]} valid   The valid popover positions.
 * @property {string}   default The default popover position.
 */
const POPOVER_POSITIONS = {
    valid: ['bottom', 'left', 'right'],
    default: 'bottom'
};

/**
 * @class
 * @classdesc Editable and sortable data list.
 * @name DataList
 * @descriptor avonni-data-list
 * @storyId example-data-list--base
 * @public
 */
export default class AvonniDataListBasic extends LightningElement {
    /**
     * Alternative text used to describe the list.
     * If the list is sortable, it should describe its behavior, for example: 'Sortable menu.
     * Press spacebar to grab or drop an item.
     * Press up and down arrow keys to change position.
     * Press escape to cancel.
     *
     * @type {string}
     * @public
     */
    @api alternativeText;

    /**
     * Label of the list.
     *
     * @type {string}
     * @public
     */
    @api label;

    /**
     * The Lightning Design System name of the sortable icon.
     * Names are written in the format 'standard:account' where 'standard' is the category, and 'account' is the specific icon to be displayed.
     *
     * @type {string}
     * @public
     */
    @api sortableIconName;

    @track _actions = [];
    @track _listActions = [];
    _data = [];
    _fields = [];
    _divider = LIST_ITEM_DIVIDERS.default;
    _popoverPosition = POPOVER_POSITIONS.default;
    _sortable = false;
    _sortableIconPosition = ICON_POSITIONS.default;

    @track popoverFields = [];
    @track computedItems = [];
    initialData = [];
    currentPopover;
    previousPopover;
    savePopoverData = false;
    isInsidePopover = false;
    shiftPressed = false;
    tabPressed = false;

    /**
     * Called when the element is inserted in a document.
     * Initializes the event listeners and the items for the List component.
     *
     * @callback connectedCallback
     */
    connectedCallback() {
        this.initEventListeners();
        this.computedItems = this.dataAsItems;
    }

    /**
     * Array of actions.
     *
     * @type {Action[]}
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
     * The array of data to be displayed.
     *
     * @type {Data[]}
     * @public
     */
    @api
    get records() {
        return this._records;
    }
    set records(value) {
        this._records = normalizeArray(value);
        this.initialData = normalizeArray(value);
    }

    /**
     * Changes the appearance of the list.
     * Valid values include top, bottom and around.
     *
     * @type {string}
     * @default around
     * @public
     */
    @api
    get divider() {
        return this._divider;
    }
    set divider(value) {
        this._divider = normalizeString(value, {
            fallbackValue: LIST_ITEM_DIVIDERS.default,
            validValues: LIST_ITEM_DIVIDERS.valid
        });
    }

    /**
     * Array of fields displayed in the popover.
     *
     * @type {Field[]}
     * @public
     */
    @api
    get fields() {
        return this._fields;
    }
    set fields(value) {
        this._fields = normalizeArray(value);
    }

    /**
     * Array of actions for the list.
     *
     * @type {Action[]}
     * @public
     */
    @api
    get listActions() {
        return this._listActions;
    }
    set listActions(value) {
        this._listActions = normalizeArray(value);
    }

    /**
     * The items of the list can be edited using a popover.
     * Accepted positions for the popover include bottom, left and right.
     * This value defaults to bottom.
     *
     * @type {string}
     * @default bottom
     * @public
     */
    @api
    get popoverPosition() {
        return this._popoverPosition;
    }

    set popoverPosition(value) {
        this._popoverPosition = normalizeString(value, {
            fallbackValue: POPOVER_POSITIONS.default,
            validValues: POPOVER_POSITIONS.valid
        });
    }

    /**
     * If true, it will be possible to reorder the list items.
     *
     * @type {boolean}
     * @public
     */
    @api
    get sortable() {
        return this._sortable;
    }
    set sortable(value) {
        this._sortable = normalizeBoolean(value);
    }

    /**
     * Position of the sortable icon.
     * Valid values include left and right.
     *
     * @type {string}
     * @default left
     * @public
     */
    @api
    get sortableIconPosition() {
        return this._sortableIconPosition;
    }
    set sortableIconPosition(value) {
        this._sortableIconPosition = normalizeString(value, {
            fallbackValue: ICON_POSITIONS.default,
            validValues: ICON_POSITIONS.valid
        });
    }

    /**
     * The data as items for the List component.
     *
     * @type {ListItem[]}
     */
    get dataAsItems() {
        if (this.fields.length === 0) return [];

        let items = [];
        for (let i = 0; i < this.records.length; i++) {
            if (!this.records[i][this.fields[0].name]) continue;
            items.push({
                label: this.records[i][this.fields[0].name],
                description:
                    this.fields.length > 1
                        ? this.records[i][this.fields[1].name]
                        : ''
            });
        }

        return items;
    }

    /**
     * Whether the list actions contains actions to display.
     *
     * @type {boolean}
     */
    get hasListActions() {
        return this.listActions.length > 0;
    }

    /**
     * Whether the popover should be visible.
     *
     * @type {boolean}
     */
    get showPopover() {
        return this.currentPopover !== undefined;
    }

    get popover() {
        return this.template.querySelector('section');
    }

    /**
     * Computed CSS classes for the popover.
     *
     * @type {string}
     */
    get computedPopover() {
        return classSet('slds-popover slds-is-absolute slds-hide')
            .add({
                'slds-nubbin_top': this.popoverPosition === 'bottom',
                'slds-nubbin_right-top': this.popoverPosition === 'left',
                'slds-nubbin_left-top': this.popoverPosition === 'right'
            })
            .toString();
    }

    /**
     * If the items have been sorted by the user, resets the items to their original order.
     *
     * @public
     */
    @api
    reset() {
        this.template.querySelector('avonni-list').reset();
        this._records = this.initialData;
    }

    /**
     * Initializes the event listeners.
     */
    initEventListeners() {
        this.template.addEventListener('mousedown', () => {
            this.previousPopover = this.currentPopover;
        });
        this.template.addEventListener('click', () => {
            this.previousPopover = undefined;
        });
    }

    /**
     * Returns the index of the element from the data array corresponding to an item from the List Component.
     *
     * @param {ListItem} item Item from the List component.
     * @return {number}
     */
    getDataIndexFromListItem(item) {
        for (let i = 0; i < this.records.length; i++) {
            if (
                this.records[i][this.fields[0].name] === item.label &&
                (this.fields.length < 2 ||
                    this.records[i][this.fields[1].name] === item.description)
            ) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Transfers a 'reorder' event from the List component to the Data List component.
     *
     * @param {Event} event
     */
    handleReorder(event) {
        const reorderedItems = event.detail.items;
        this.computedItems = reorderedItems;

        let newData = [];
        reorderedItems.forEach((item) => {
            newData.push(this.records[this.getDataIndexFromListItem(item)]);
        });
        this._records = newData;

        /**
         * The event fired when a user reordered the items.
         *
         * @event
         * @name reorder
         * @param {object[]} items Item objects, in their new order.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('reorder', {
                detail: {
                    items: newData
                }
            })
        );
    }

    /**
     * Transfers an 'actionclick' event from the List component to the Data List component.
     *
     * @param {Event} event
     */
    handleActionClick(event) {
        /**
         * The event fired when a user clicks on an action.
         *
         * @event
         * @name actionclick
         * @param {string} name  Name of the action clicked.
         * @param {object} items Item clicked.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('actionclick', {
                detail: {
                    name: event.detail.name,
                    item: this.records[
                        this.getDataIndexFromListItem(event.detail.item)
                    ]
                }
            })
        );
    }

    /**
     * Handles a click on a list action.
     * The name of the action is dispatched in a 'listactionclick' event.
     *
     * @param {Event} event
     */
    handleListActionClick(event) {
        /**
         * The event fired when a user clicks on a list action.
         *
         * @event
         * @name listactionclick
         * @param {string} name Name of the list action clicked.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('listactionclick', {
                detail: {
                    name: event.target.getAttribute('data-name')
                }
            })
        );
    }

    /**
     * Handles a click on an item from the List component.
     *
     * @param {Event} event
     */
    handleItemClick(event) {
        for (let i = 0; i < this.records.length; i++) {
            if (
                this.records[i][this.fields[0].name] === event.detail.item.label
            ) {
                if (i !== this.previousPopover) {
                    this.changeCurrentPopover(i);
                    // eslint-disable-next-line @lwc/lwc/no-async-operation
                    setTimeout(() => {
                        this.updatePopoverPosition(event.detail.bounds);
                        const input = this.template.querySelector(
                            'c-data-input'
                        );
                        if (input) input.focus();
                    }, 0);
                }
                break;
            }
        }
    }

    /**
     * Changes the popover to display.
     *
     * @param {number} index The index of the popover to open.
     */
    changeCurrentPopover(index) {
        this.currentPopover = index;
        this.generatePopoverContent();
    }

    /**
     * Updates the position of the popover according to the bounds of an item from the List component.
     *
     * @param {DOMRect} bounds The bounds of an item from the List component.
     */
    updatePopoverPosition(bounds) {
        const nubbinOffset = 30;
        const componentRect = this.template
            .querySelector('avonni-list')
            .getBoundingClientRect();

        if (this.popoverPosition === 'bottom') {
            this.popover.style.top =
                bounds.bottom - componentRect.top + nubbinOffset + 'px';
            this.popover.style.left = bounds.width / 2 - 144 + 'px';
        } else {
            const topOffset = bounds.height > 50 ? 20 : 10;
            this.popover.style.top =
                bounds.top - componentRect.top + topOffset + 'px';
            const sideOffset =
                bounds.right - componentRect.left + nubbinOffset + 'px';
            if (this.popoverPosition === 'left') {
                this.popover.style.right = sideOffset;
            } else {
                this.popover.style.left = sideOffset;
            }
        }

        this.popover.classList.remove('slds-hide');
        this.popover.classList.add('slds-show');
    }

    /**
     * Generates the content of the popover as an element that can be rendered in the HTML.
     */
    generatePopoverContent() {
        for (let i = 0; i < this.records.length; i++) {
            if (i === this.currentPopover) {
                this.popoverFields = [];
                this.fields.forEach((field) => {
                    this.popoverFields.push({
                        fieldId: generateUniqueId(),
                        label: field.label,
                        name: field.name,
                        type: field.type,
                        value: this.records[i][field.name]
                    });
                });
                break;
            }
        }
    }

    /**
     * Handles a click on the 'Done' button of the popover and the closing logic.
     */
    handlePopoverDoneClick() {
        this.currentPopover = undefined;
        this.tabIndex = false;
        this.shiftPressed = false;
    }

    /**
     * Handles a mouseenter in the popover area.
     */
    handlePopoverMouseEnter() {
        this.isInsidePopover = true;
    }

    /**
     * Handles a blur of an element in the popover.
     * A mouse click outside the popover will close it.
     */
    handlePopoverBlur() {
        if (!this.isInsidePopover && !this.tabPressed) {
            this.handlePopoverDoneClick();
            this.generatePopoverContent();
        }
    }

    /**
     * Handles a mouseleave in the popover area.
     */
    handlePopoverMouseLeave() {
        this.isInsidePopover = false;
    }

    /**
     * Handles a blur of an input element in the popover.
     * Focus will be given to the 'Done' button if Shift+Tab is pressed when the focus is on the first field.
     * @param {Event} event
     */
    handlePopoverInputBlur(event) {
        if (this.currentPopover !== undefined) {
            let newData = JSON.parse(JSON.stringify(this.records));
            newData[this.currentPopover][event.target.name] =
                event.target.value;
            this._records = newData;
            this.computedItems = this.dataAsItems;

            if (this.savePopoverData) {
                this.dispatchSaveEvent(newData[this.currentPopover]);
                this.savePopoverData = false;
            }
            this.handlePopoverBlur();

            const trapFocus =
                event.target === this.template.querySelector('c-data-input') &&
                this.tabPressed &&
                this.shiftPressed;

            if (trapFocus) {
                this.template.querySelector('.slds-col_bump-left').focus();
            }
        }
    }

    /**
     * Handles a commit event for the popover input fields.
     * This will force the dispatch of a 'save' event.
     */
    handlePopoverInputCommit() {
        this.savePopoverData = true;
    }

    /**
     * Dispatches a save event, where 'draftValues' corresponds to the current value that is provided during popover editing.
     *
     * @param {Data} popoverData The data from the popover fields.
     */
    dispatchSaveEvent(popoverData) {
        /**
         * The event fired when data is saved during popover editing.
         *
         * @event
         * @name save
         * @param {object} draftValues The current value that's provided during popover editing.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('save', {
                detail: {
                    draftValues: popoverData
                }
            })
        );
    }

    /**
     * Handles a blur of the 'Done' button in the popover.
     * Focus will be given to the first input field if Tab is pressed when the focus is on the 'Done' button.
     *
     * @param {Event} event
     */
    handlePopoverDoneButtonBlur(event) {
        this.handlePopoverBlur();

        const trapFocus =
            event.target ===
                this.template.querySelector('.slds-col_bump-left') &&
            this.tabPressed &&
            !this.shiftPressed;

        if (trapFocus) {
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => {
                this.template.querySelector('c-data-input').focus();
            }, 0);
        }
    }

    /**
     * Handles a keydown inside the popover.
     *
     * @param {Event} event
     */
    handlePopoverKeydown(event) {
        if (event.keyCode === 9) {
            this.tabPressed = true;
        } else if (event.keyCode === 16) {
            this.shiftPressed = true;
        } else if (event.keyCode === 27) {
            this.handlePopoverDoneClick();
        }
    }

    /**
     * Handles a keyup inside the popover.
     *
     * @param {Event} event
     */
    handlePopoverKeyup(event) {
        if (event.keyCode === 9) {
            this.tabPressed = false;
        } else if (event.keyCode === 16) {
            this.shiftPressed = false;
        }
    }
}
