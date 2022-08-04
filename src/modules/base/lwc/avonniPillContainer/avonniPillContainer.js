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
import {
    deepCopy,
    keyCodes,
    normalizeBoolean,
    normalizeArray
} from 'c/utilsPrivate';
import { AvonniResizeObserver } from 'c/resizeObserver';
import { classSet, generateUUID } from 'c/utils';

const DEFAULT_ALTERNATIVE_TEXT = 'Selected Options:';

/**
 * @class
 * @descriptor avonni-pill-container
 * @storyId example-pill-container--sortable
 * @public
 */
export default class AvonniPillContainer extends LightningElement {
    _actions = [];
    _alternativeText = DEFAULT_ALTERNATIVE_TEXT;
    _isCollapsible = false;
    _isExpanded = false;
    @track _items = [];
    _singleLine = false;
    _sortable = false;

    _dragState;
    _dragTimeOut;
    _focusedIndex = 0;
    _focusedTabIndex = 0;
    _hasFocus = false;
    _pillsNotFittingCount;
    _pillContainerElementId;
    _resizeObserver;

    connectedCallback() {
        window.addEventListener('mouseup', this.handleMouseUp);
    }

    renderedCallback() {
        if (this._resizeObserver && !this.computedIsCollapsible) {
            this._resizeObserver.disconnect();
            this._resizeObserver = undefined;
        } else if (!this._resizeObserver && this.computedIsCollapsible) {
            this._resizeObserver = this.initResizeObserver();
        }
    }

    disconnectedCallback() {
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
        }

        window.removeEventListener('mouseup', this.handleMouseUp);
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Array of actions to display to the right of each pill.
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
     * Alternative text used to describe the pill container. If the pill container is sortable, it should describe its behavior, for example: "Sortable pills. Press spacebar to grab or drop an item. Press right and left arrow keys to change position. Press escape to cancel."
     *
     * @type {string}
     * @public
     */
    @api
    get alternativeText() {
        return this._alternativeText;
    }
    set alternativeText(value) {
        this._alternativeText =
            value && typeof value === 'string'
                ? value
                : DEFAULT_ALTERNATIVE_TEXT;
    }

    /**
     * If present, the pill list can be collapsed. Use `is-collapsible` with the `is-expanded` attribute to expand and collapse the list of pills.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get isCollapsible() {
        return this._isCollapsible;
    }
    set isCollapsible(value) {
        this._isCollapsible = normalizeBoolean(value);
        this.clearDrag();
    }

    /**
     * If present and `is-collapsible` too, the list of pills is expanded. This attribute is ignored when `is-collapsible` is false, and the list of pills is expanded even if `is-expanded` is false or not set.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get isExpanded() {
        return this._isExpanded;
    }
    set isExpanded(value) {
        this._isExpanded = normalizeBoolean(value);
        this.clearDrag();
    }

    /**
     * Array of item objects to display as pills in the container.
     *
     * @type {object[]}
     * @public
     */
    @api
    get items() {
        return this._items;
    }
    set items(value) {
        this._items = deepCopy(normalizeArray(value));

        this.clearDrag();
    }

    /**
     * If present, the pills are limited to one line. This attribute overrides the `is-collapsible` and `is-expanded` attributes.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get singleLine() {
        return this._singleLine;
    }
    set singleLine(value) {
        this._singleLine = normalizeBoolean(value);
        this.clearDrag();
    }

    /**
     * If present, the pills can be reordered by dragging and dropping, or using the spacebar key.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get sortable() {
        return this._sortable;
    }
    set sortable(value) {
        this._sortable = normalizeBoolean(value);
        this.clearDrag();
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * True if the pill container is considered collapsible.
     *
     * @type {boolean}
     */
    get computedIsCollapsible() {
        return (!this.isCollapsible && !this.isExpanded) || this.isCollapsible;
    }

    /**
     * True of the pill container is considered expanded.
     *
     * @type {boolean}
     */
    get computedIsExpanded() {
        return (!this.isCollapsible && !this.isExpanded) || this.isExpanded;
    }

    /**
     * CSS classes of the listbox element.
     *
     * @type {string}
     */
    get computedListboxClass() {
        return classSet('slds-listbox slds-is-relative slds-listbox_horizontal')
            .add({
                'slds-listbox_inline': this.singleLine
            })
            .toString();
    }

    /**
     * CSS classes of the list item elements.
     *
     * @type {string}
     */
    get computedListItemClass() {
        return classSet('slds-listbox-item').add({
            'slds-is-relative': this.sortable,
            'avonni-pill-container__item_sortable-single-line':
                this.sortable && this.singleLine
        });
    }

    /**
     * CSS classes of the pill elements.
     *
     * @type {string}
     */
    get computedPillClass() {
        return classSet('slds-pill')
            .add({
                'avonni-pill-container__pill-sortable': this.sortable
            })
            .toString();
    }

    /**
     * Label of the "show more" button.
     *
     * @type {string}
     */
    get computedPillCountMoreLabel() {
        if (
            this.computedIsExpanded ||
            isNaN(this._pillsNotFittingCount) ||
            this._pillsNotFittingCount <= 0
        ) {
            return undefined;
        }
        return `+${this._pillsNotFittingCount} more`;
    }

    /**
     * CSS classes of the wrapper element.
     *
     * @type {string}
     */
    get computedWrapperClass() {
        return classSet('avonni-pill-container__wrapper').add({
            'slds-is-expanded': this.computedIsExpanded && !this.singleLine,
            'slds-pill_container': this.singleLine,
            'slds-listbox_selection-group': !this.singleLine
        });
    }

    /**
     * HTML element containing the instructions used during drag and drop.
     *
     * @type {HTMLElement}
     */
    get altTextElement() {
        return this.template.querySelector(
            '[data-element-id="span-instructions"]'
        );
    }

    /**
     * HTML element of the currently focused pill.
     *
     * @type {HTMLElement}
     */
    get focusedPillElement() {
        const pillElements = this.template.querySelectorAll(
            '[data-element-id="avonni-primitive-pill"]'
        );
        return pillElements[this._focusedIndex];
    }

    /**
     * List items' HTML elements.
     *
     * @type {NodeList}
     */
    get itemElements() {
        return this.template.querySelectorAll('[data-element-id="li"]');
    }

    /**
     * Value of the listbox element tabindex.
     *
     * @type {number}
     */
    get listboxTabIndex() {
        return this.items.length ? -1 : 0;
    }

    /**
     * Listbox HTML element.
     *
     * @type {HTMLElement}
     */
    get listElement() {
        return this.template.querySelector('[data-element-id="ul"]');
    }

    /**
     * True if the "show more" button should be visible.
     *
     * @type {boolean}
     * @default false
     */
    get showMore() {
        return this.computedIsCollapsible && !this.computedIsExpanded;
    }

    /**
     * Automatically generated unique key.
     *
     * @type {string}
     */
    get uniqueKey() {
        return generateUUID();
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Set the focus on the pill list.
     *
     * @public
     */
    @api
    focus() {
        if (this.focusedPillElement && this.items[this._focusedIndex].href) {
            this.focusedPillElement.focusLink();
        } else if (this.focusedPillElement) {
            this.focusedPillElement.focus();
        } else if (this.listElement) {
            this.listElement.focus();
        }
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Initialize the reordering of a pill.
     *
     * @param {number} index Index of the reordered pill.
     */
    initDragState(index) {
        if (!this.sortable) return;

        this._dragState = {
            initialIndex: index,
            lastHoveredIndex: index
        };
        const wrapper = this.template.querySelector(
            '[data-element-id="div-wrapper"]'
        );
        wrapper.classList.add('avonni-pill-container__list_dragging');
        this.updateAssistiveText(index + 1);
    }

    /**
     * Initialize the screen resize observer.
     *
     * @returns {AvonniResizeObserver} Resize observer.
     */
    initResizeObserver() {
        if (!this.listElement) return null;

        const resizeObserver = new AvonniResizeObserver(() => {
            let notFittingCount = 0;
            const items = this.template.querySelectorAll(
                '[data-element-id="li"]'
            );
            for (let i = 0; i < items.length; i++) {
                const node = items[i];
                if (node.offsetTop > 0) {
                    notFittingCount += 1;
                }
            }
            this._pillsNotFittingCount = notFittingCount;
        });
        resizeObserver.observe(this.listElement);
        return resizeObserver;
    }

    /**
     * Clear the reorder state.
     */
    clearDrag() {
        clearTimeout(this._dragTimeOut);
        if (!this._dragState) return;

        const index = this._dragState.lastHoveredIndex;
        this.itemElements[index].classList.remove(
            'avonni-pill-container__pill_left-border',
            'avonni-pill-container__pill_right-border'
        );
        const wrapper = this.template.querySelector(
            '[data-element-id="div-wrapper"]'
        );
        wrapper.classList.remove('avonni-pill-container__list_dragging');
        this._dragState = null;
        this.altTextElement.textContent = '';
    }

    /**
     * Remove the border showing the current position during the reorder of a pill.
     */
    clearDragBorder() {
        const lastIndex = this._dragState.lastHoveredIndex;
        this.itemElements[lastIndex].classList.remove(
            'avonni-pill-container__pill_left-border',
            'avonni-pill-container__pill_right-border'
        );
    }

    /**
     * Move the reordered pill to the left.
     *
     * @param {number} index Index of the pill the reordered pill is moving to the left of.
     */
    moveLeft(index) {
        if (index < 0) return;

        this.clearDragBorder();
        this._dragState.lastHoveredIndex = index;
        this.itemElements[index].classList.add(
            'avonni-pill-container__pill_left-border'
        );
        this._dragState.position = 'left';
        const position =
            index > this._dragState.initialIndex ? index : index + 1;
        this.updateAssistiveText(position);
    }

    /**
     * Move the reordered pill to the right.
     *
     * @param {number} index Index of the pill the reordered pill is moving to the right of.
     */
    moveRight(index) {
        if (index > this.items.length - 1) return;

        this.clearDragBorder();
        this._dragState.lastHoveredIndex = index;
        this.itemElements[index].classList.add(
            'avonni-pill-container__pill_right-border'
        );
        this._dragState.position = 'right';
        const position =
            index >= this._dragState.initialIndex ? index + 1 : index + 2;
        this.updateAssistiveText(position);
    }

    /**
     * Update the focused index.
     *
     * @param {number} index Index of the new focused pill.
     */
    switchFocus(index) {
        let normalizedIndex = index;
        if (index > this.items.length - 1) {
            normalizedIndex = 0;
        } else if (index < 0) {
            normalizedIndex = this.items.length - 1;
        }

        // remove focus from current pill
        if (this.focusedPillElement) {
            this.focusedPillElement.tabIndex = '-1';
        }

        // move to next
        this._focusedIndex = normalizedIndex;

        // set focus
        this.focusedPillElement.tabIndex = '0';
        this.focus();
    }

    /**
     * Update the assistive text with the current position of the reordered pill.
     *
     * @param {number} position New position of the reordered pill.
     */
    updateAssistiveText(position) {
        const initialIndex = this._dragState.initialIndex;
        const label = this.items[initialIndex].label;
        const total = this.items.length;
        this.altTextElement.textContent = `${label}. ${position} / ${total}`;
    }

    /*
     * ------------------------------------------------------------
     *  EVENT HANDLERS AND DISPATCHERS
     * -------------------------------------------------------------
     */

    /**
     * Handle the click on a pill action.
     *
     * @param {Event} event
     */
    handleActionClick(event) {
        /**
         * The event fired when a user clicks on an action.
         *
         * @event
         * @name actionclick
         * @param {number} index Index of the item clicked.
         * @param {string} name Name of the action.
         * @param {string} targetName Name of the item the action belongs to.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('actionclick', {
                detail: {
                    name: event.detail.name,
                    index: Number(event.target.dataset.index),
                    targetName: event.detail.targetName
                }
            })
        );
    }

    /**
     * Handle a key pressed on the list.
     *
     * @param {Event} event
     */
    handleKeyDown(event) {
        if (this.items.length <= 0) {
            return;
        }
        const index = this._dragState
            ? this._dragState.lastHoveredIndex
            : this._focusedIndex;

        switch (event.keyCode) {
            case keyCodes.left:
            case keyCodes.up: {
                const previousIndex = index - 1;

                if (!this._dragState) {
                    this.switchFocus(previousIndex);
                } else if (
                    this._dragState.position === 'left' ||
                    previousIndex === this._dragState.initialIndex ||
                    index === this._dragState.initialIndex
                ) {
                    this.moveLeft(previousIndex);
                } else {
                    this.moveLeft(index);
                }
                break;
            }
            case keyCodes.right:
            case keyCodes.down: {
                const nextIndex = index + 1;

                if (!this._dragState) {
                    this.switchFocus(nextIndex);
                } else if (
                    this._dragState.position === 'right' ||
                    nextIndex === this._dragState.initialIndex ||
                    index === this._dragState.initialIndex
                ) {
                    this.moveRight(nextIndex);
                } else {
                    this.moveRight(index);
                }
                break;
            }
            case keyCodes.space:
                if (this._dragState) {
                    this.handleMouseUp();
                } else if (this.sortable) {
                    this.initDragState(index);
                }
                break;
            case keyCodes.escape:
                this.clearDrag();
                break;
            default:
                this.focus();
        }
    }

    /**
     * Handle a click on the "show more" button.
     */
    handleMoreClick() {
        this._isExpanded = true;
        this.focus();
    }

    /**
     * Handle a mouse button release on the pill container.
     */
    handleMouseUp = () => {
        if (
            !this._dragState ||
            this._dragState.lastHoveredIndex === this._dragState.initialIndex
        ) {
            this.clearDrag();
            return;
        }

        const { initialIndex, lastHoveredIndex, position } = this._dragState;
        const index =
            position === 'left' ? lastHoveredIndex : lastHoveredIndex + 1;

        if (lastHoveredIndex > initialIndex) {
            this._items.splice(index, 0, this._items[initialIndex]);
            this._items.splice(initialIndex, 1);
        } else {
            const pill = this._items.splice(initialIndex, 1)[0];
            this._items.splice(index, 0, pill);
        }

        /**
         * The event fired when a user reorders the pills.
         *
         * @event
         * @name reorder
         * @param {object[]} items Items in their new order.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('reorder', {
                detail: {
                    items: deepCopy(this._items)
                }
            })
        );

        this.clearDrag();
        this._focusedIndex = lastHoveredIndex;
        setTimeout(() => {
            // Set the focus on the pill after rerender
            this.focus();
        }, 0);
    };

    /**
     * Handle a focus blur on a pill.
     *
     * @param {Event} event
     */
    handlePillBlur(event) {
        if (
            !event.relatedTarget ||
            !this.template.contains(event.relatedTarget)
        ) {
            this._hasFocus = false;
            /**
             * The event fired when the pill container loses focus.
             *
             * @event
             * @name blur
             * @public
             */
            this.dispatchEvent(new CustomEvent('blur'));
        }
    }

    /**
     * Handle a click on a pill.
     *
     * @param {Event} event
     */
    handlePillClick(event) {
        const index = Number(event.target.dataset.index);

        if (index >= 0 && this._focusedIndex !== index) {
            this.switchFocus(index);
        } else {
            this.focus();
        }

        event.stopPropagation();
    }

    /**
     * Handle a focus set on a pill.
     */
    handlePillFocus() {
        if (!this._hasFocus) {
            this._hasFocus = true;
            /**
             * The event fired when the pill container gains focus.
             *
             * @event
             * @name focus
             * @public
             */
            this.dispatchEvent(new CustomEvent('focus'));
        }
    }

    /**
     * Handle a mouse button pressed on a pill.
     *
     * @param {Event} event
     */
    handlePillMouseDown(event) {
        if (!this.sortable) return;

        const index = Number(event.currentTarget.dataset.index);
        this._dragTimeOut = setTimeout(() => {
            this.initDragState(index);
        }, 200);
    }

    /**
     * Handle a movement of the mouse on a pill.
     *
     * @param {Event} event
     */
    handlePillMouseMove(event) {
        if (!this._dragState) return;

        const index = Number(event.currentTarget.dataset.index);
        const coordinates = event.currentTarget.getBoundingClientRect();
        const onLeft = event.clientX < coordinates.left + coordinates.width / 2;

        if (onLeft) {
            // The cursor is on the left side of the pill
            this.moveLeft(index);
        } else {
            // The cursor is on the right side of the pill
            this.moveRight(index);
        }
    }
}
