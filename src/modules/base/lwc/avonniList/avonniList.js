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
    normalizeArray,
    normalizeBoolean,
    normalizeString
} from 'c/utilsPrivate';
import { classSet } from 'c/utils';

const ICON_POSITIONS = {
    valid: ['left', 'right'],
    default: 'right'
};

const DIVIDER = {
    valid: ['top', 'bottom', 'around']
};

const DEFAULT_ITEM_HEIGHT = 44;

const IMAGE_WIDTH = {
    valid: ['small', 'medium', 'large']
};

/**
 * @class
 * @example example-list--base
 * @description The List component allows for a user to enumerate a vertical list with items.
 * @descriptor avonni-list
 * @public
 */
export default class AvonniList extends LightningElement {
    /**
     * Text label for the list.
     *
     * @type {string}
     * @public
     */
    @api label;
    /**
     * The Lightning Design System name of the sortable icon. Names are written in the format 'standard:account' where 'standard' is the category, and 'account' is the specific icon to be displayed.
     *
     * @type {string}
     * @public
     */
    @api sortableIconName;
    /**
     * Alternative text used to describe the list. If the list is sortable, it should describe its behavior, for example: “Sortable menu. Press spacebar to grab or drop an item. Press up and down arrow keys to change position. Press escape to cancel.”
     *
     * @type {string}
     * @public
     */
    @api alternativeText;

    _items = [];
    _sortable = false;
    _sortableIconPosition = ICON_POSITIONS.default;

    _draggedIndex;
    _draggedElement;
    _initialY;
    _menuTop;
    _menuBottom;
    _itemElements;
    _savedComputedItems;
    _currentItemDraggedHeight;
    _actions = [];
    _hasActions = false;
    _divider;
    _imageSrc = [];
    computedActions = [];
    computedItems = [];
    _hasImages;
    menuRole;
    itemRole;
    denyItemClick = false;

    /**
     * Position of the sortable icon. Valid values include left and right.
     *
     * @type {string}
     * @public
     */
    @api
    get divider() {
        return this._divider;
    }
    set divider(value) {
        this._divider = normalizeString(value, {
            validValues: DIVIDER.valid
        });
    }

    /**
     * Fixed width of image (3 sizes: (small 48px, medium 72px and large 128px).
     *
     * @type {string}
     * @public
     * @default large
     */
    @api
    get imageWidth() {
        return this._imageWidth;
    }

    set imageWidth(width) {
        this._imageWidth = normalizeString(width, {
            validValues: IMAGE_WIDTH.valid
        });

        switch (this._imageWidth) {
            case 'small':
                this._imageWidth = '48';
                break;
            case 'medium':
                this._imageWidth = '72';
                break;
            case 'large':
                this._imageWidth = '128';
                break;
            default:
                this._imageWidth = '128';
                break;
        }
    }

    /**
     * Array of item objects.
     *
     * @type {object}
     * @public
     */
    @api
    get items() {
        return this._items;
    }
    set items(proxy) {
        this._items = normalizeArray(proxy);
        this.computedItems = JSON.parse(JSON.stringify(this._items));
        this.computedItems.forEach((item) => {
            item.infos = normalizeArray(item.infos);
            item.icons = normalizeArray(item.icons);
        });
    }

    /**
     * If true, it will be possible to reorder the list items.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get sortable() {
        return this._sortable;
    }
    set sortable(bool) {
        this._sortable = normalizeBoolean(bool);

        if (this._sortable) {
            this.menuRole = 'listbox';
            this.itemRole = 'option';
        }
    }

    /**
     * Position of the sortable icon. Valid values include left and right.
     *
     * @type {string}
     * @public
     * @default right
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
     * Array of actions.
     *
     * @type {object}
     * @public
     */
    @api
    get actions() {
        return this._actions;
    }
    set actions(proxy) {
        this._actions = normalizeArray(proxy);
        this.computedActions = JSON.parse(JSON.stringify(this._actions));
        this._hasActions = true;
    }

    /**
     * Computed Image container style width defined by user selected image width.
     *
     * @type {string}
     */
    get computedImageContainerStyle() {
        return `
        width : ${this._imageWidth}px;
        min-width : ${this._imageWidth}px;
        `;
    }

    /**
     * FirstAction is used when only 1 action is present in computedActions.
     *
     * @type {object}
     */
    get firstAction() {
        return this.computedActions[0];
    }

    /**
     * Check whether Actions has multiple entries.
     *
     * @type {boolean}
     */
    get hasMultipleActions() {
        return this._actions.length > 1;
    }

    /**
     * Check if Icon is to be shown to the right.
     *
     * @type {boolean}
     */
    get showIconRight() {
        return (
            this.sortable &&
            this.sortableIconName &&
            this.sortableIconPosition === 'right'
        );
    }

    /**
     * Check if Icon is to be shown to the left.
     *
     * @type {boolean}
     */
    get showIconLeft() {
        return (
            this.sortable &&
            this.sortableIconName &&
            this.sortableIconPosition === 'left'
        );
    }

    /**
     * Check if Image is present and set the list class styling according to attributes.
     *
     * @type {string}
     */
    get computedListClass() {
        if (
            this.computedItems.length > 0 &&
            Object.keys(...this.computedItems).includes('imageSrc')
        ) {
            this._hasImages = true;
        }
        return classSet('avonni-list__item-menu')
            .add({
                'slds-has-dividers_around': this.divider === 'around',
                'slds-has-dividers_top-space': this.divider === 'top',
                'slds-has-dividers_bottom-space': this.divider === 'bottom',
                'avonni-list__has-images': this._hasImages
            })
            .toString();
    }

    /**
     * Computed Image container class styling based on icon position and divider attributes.
     *
     * @type {string}
     */
    get computedImageContainerClass() {
        return classSet('avonni-list__item-image-container')
            .add({
                'avonni-list__item-image-container_rounded-corners':
                    this.divider === 'around' &&
                    this.sortableIconName &&
                    this.sortableIconPosition === 'right'
            })
            .toString();
    }

    /**
     * Computed item class styling based on user specified attributes.
     *
     * @type {string}
     */
    get computedItemClass() {
        return classSet('slds-grid avonni-list__item slds-item')
            .add({
                'avonni-list__item-sortable': this.sortable,
                'avonni-list__item-expanded': this._hasActions,
                'slds-p-vertical_x-small': !this.divider,
                'slds-p-horizontal_none': this.divider === 'top' || 'bottom'
            })
            .toString();
    }

    /**
     * Get current tab index based on if list is sortable.
     *
     * @type {boolean}
     */
    get tabindex() {
        return this.sortable ? '0' : '-1';
    }

    /**
     * If the items have been sorted by the user, reset the items to their original order.
     *
     * @public
     */
    @api
    reset() {
        this.clearSelection();
        this.computedItems = JSON.parse(JSON.stringify(this.items));
    }

    /**
     * Update assistive text based on new item ordering.
     */
    updateAssistiveText() {
        const label = this.computedItems[this._draggedIndex].label;
        const position = this._draggedIndex + 1;
        const total = this.computedItems.length;
        const element = this.template.querySelector(
            '.slds-assistive-text[aria-live="assertive"]'
        );
        // We don't use a variable to avoid rerendering
        element.textContent = `${label}. ${position} / ${total}`;
    }

    /**
     * Compute hovered items center coordinates for ordering.
     *
     * @param {number} center
     * @returns {object} item
     */
    getHoveredItem(center) {
        return this._itemElements.find((item) => {
            if (item !== this._draggedElement) {
                const itemIndex = Number(item.dataset.index);
                const itemPosition = item.getBoundingClientRect();
                const itemCenter =
                    itemPosition.bottom - itemPosition.height / 2;

                if (
                    (this._draggedIndex > itemIndex && center < itemCenter) ||
                    (this._draggedIndex < itemIndex && center > itemCenter)
                ) {
                    return item;
                }
            }
            return undefined;
        });
    }

    /**
     * Compute swap between dragged items.
     *
     * @param {Element} target
     */
    switchWithItem(target) {
        const targetIndex = Number(target.dataset.index);
        const index = this._draggedIndex;
        target.classList.add('avonni-list__item-sortable_moved');

        // If the target has already been moved, move it back to its original position
        // Else, move it up or down
        if (target.style.transform !== '') {
            target.style.transform = '';
        } else {
            const translationValue =
                targetIndex > index
                    ? -this._currentItemDraggedHeight
                    : this._currentItemDraggedHeight;
            target.style.transform = `translateY(${translationValue + 'px'})`;
        }

        // Make the switch in computed items
        [this.computedItems[targetIndex], this.computedItems[index]] = [
            this.computedItems[index],
            this.computedItems[targetIndex]
        ];

        this._draggedIndex = targetIndex;
        this._draggedElement.dataset.index = targetIndex;
        target.dataset.index = index;
        this.updateAssistiveText();
    }

    /**
     * Erase the list styles and dataset - clear tracked variables.
     */
    clearSelection() {
        // Clean the styles and dataset
        this._itemElements.forEach((item, index) => {
            item.style = undefined;
            item.dataset.position = 0;
            item.dataset.index = index;
            item.className = item.className.replace(
                /avonni-list__item-sortable_moved.*/g,
                ''
            );
        });
        if (this._draggedElement)
            this._draggedElement.classList.remove(
                'avonni-list__item-sortable_dragged'
            );

        this.template.querySelector(
            '.slds-assistive-text[aria-live="assertive"]'
        ).textContent = '';

        // Clean the tracked variables
        this._draggedElement = this._draggedIndex = this._initialY = this._savedComputedItems = undefined;
    }

    /**
     * Get initial list menu position and initial Y position on user interaction.
     *
     * @param {Event} event
     */
    initPositions(event) {
        const menuPosition = this.template
            .querySelector('.avonni-list__item-menu')
            .getBoundingClientRect();
        this._menuTop = menuPosition.top;
        this._menuBottom = menuPosition.bottom;

        this._initialY =
            event.type === 'touchstart'
                ? event.touches[0].clientY
                : event.clientY;
    }

    /**
     * Prevent ghost image on avatar drag.
     *
     * @param {Event} event
     */
    handleAvatarDragStart(event) {
        event.preventDefault();
    }

    /**
     * Compute drag event start element positions and indexes // Prevent certain elements from being dragged.
     *
     * @param {Event} event
     * @returns {function | object} intiPositions() | _savedComputedItems
     */
    dragStart(event) {
        // Reset denyItemClick attribute on item touch
        this.denyItemClick = false;

        // Stop dragging if the click was on a button menu
        if (
            !this.sortable ||
            event.target.tagName.startsWith('LIGHTNING-BUTTON') ||
            event.target.tagName.startsWith('A')
        )
            return;

        this._itemElements = Array.from(
            this.template.querySelectorAll('.avonni-list__item-sortable')
        );
        this._draggedElement = event.currentTarget;
        this._currentItemDraggedHeight = this._draggedElement.offsetHeight;
        this._draggedIndex = Number(this._draggedElement.dataset.index);
        this._draggedElement.classList.add(
            'avonni-list__item-sortable_dragged'
        );
        if (event.type !== 'keydown') {
            this.initPositions(event);
        } else {
            this._savedComputedItems = [...this.computedItems];
        }

        this.updateAssistiveText();

        if (event.type === 'touchstart') {
            // Make sure touch events don't trigger mouse events
            event.preventDefault();
            // Close any open button menu
            this._draggedElement.focus();
        }
    }

    /**
     * Compute drag event logic.
     *
     * @param {Event} event
     */
    drag(event) {
        if (!this._draggedElement) return;
        this._draggedElement.classList.add('sortable-item_dragged');

        // Deny itemclick event dispatch on drag
        this.denyItemClick = true;

        const mouseY =
            event.type === 'touchmove'
                ? event.touches[0].clientY
                : event.clientY;
        const menuTop = this._menuTop;
        const menuBottom = this._menuBottom;

        // Make sure it is not possible to drag the item out of the menu
        let currentY;
        if (mouseY < menuTop) {
            currentY = menuTop;
        } else if (mouseY > menuBottom) {
            currentY = menuBottom;
        } else {
            currentY = mouseY;
        }

        // Stick the dragged item to the mouse position
        this._draggedElement.style.transform = `translateY(${
            currentY - this._initialY
        }px)`;

        // Get the position of the dragged item
        const position = this._draggedElement.getBoundingClientRect();
        const center = position.bottom - position.height / 2;

        const hoveredItem = this.getHoveredItem(center);
        if (hoveredItem) this.switchWithItem(hoveredItem);
        const buttonMenu = event.currentTarget.querySelector(
            'lightning-button-menu'
        );
        if (buttonMenu) buttonMenu.classList.remove('slds-is-open');
    }

    dragEnd(event) {
        if (!this._draggedElement) return;

        // Allow imperfect item click within a 4px drag margin
        if (event && Math.abs(event.clientY - this._initialY) < 4) {
            this.denyItemClick = false;
        }

        this.computedItems = [...this.computedItems];

        this.clearSelection();

        /**
         * The event fired when a user reordered the items.
         *
         * @event
         * @name reorder
         * @param {object} items
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('reorder', {
                detail: {
                    items: this.computedItems
                }
            })
        );
    }
    /**
     * Handler for keyboard access controls to sortable list.
     *
     * @param {Event} event
     */
    handleKeyDown(event) {
        if (!this.sortable) return;

        // If space bar is pressed, select or drop the item
        if (event.key === ' ' || event.key === 'Spacebar') {
            if (this._draggedElement) {
                this.dragEnd();
            } else {
                this.dragStart(event);
            }
        } else if (this._draggedElement) {
            // If escape is pressed, cancel the move
            if (event.key === 'Escape' || event.key === 'Esc') {
                this.computedItems = [...this._savedComputedItems];
                this.clearSelection();
            }

            // If up/down arrow is pressed, move the item
            const index = Number(event.currentTarget.dataset.index);
            let targetIndex;

            if (
                event.key === 'ArrowDown' &&
                index + 1 < this.computedItems.length
            ) {
                targetIndex = index + 1;
            } else if (event.key === 'ArrowUp') {
                targetIndex = index - 1;
            }

            if (targetIndex >= 0) {
                const targetItem = this._itemElements.find(
                    (item) => Number(item.dataset.index) === targetIndex
                );

                this.switchWithItem(targetItem);

                // Move the dragged element
                const currentPosition = Number(
                    this._draggedElement.dataset.position
                );
                const position =
                    targetIndex > index
                        ? currentPosition + DEFAULT_ITEM_HEIGHT
                        : currentPosition - DEFAULT_ITEM_HEIGHT;

                this._draggedElement.style.transform = `translateY(${position}px)`;
                this._draggedElement.dataset.position = position;
            }
        }
    }

    /**
     * Stop the dragging process when touching the button menu.
     *
     * @param {Event} event
     */
    handleButtonMenuTouchStart(event) {
        event.stopPropagation();
    }

    /**
     * Handles a click on an item action.
     *
     * @param {Event} event
     */
    handleActionClick(event) {
        const actionName = this.hasMultipleActions
            ? event.detail.value
            : event.target.value;
        const itemIndex = event.target.parentElement.parentElement.parentElement.getAttribute(
            'data-index'
        );

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
                    name: actionName,
                    item: this.computedItems[itemIndex]
                }
            })
        );
    }

    /**
     * Handles a click on an item.
     * The click event will not dispatch an event if the clicked element already has a purpose (action or link).
     *
     * @param {Event} event
     */
    handleItemClick(event) {
        if (
            this.denyItemClick ||
            event.target.tagName.startsWith('LIGHTNING') ||
            event.target.tagName === 'A'
        )
            return;

        /**
         * The event fired when a user clicks on an item.
         *
         * @event
         * @name itemclick
         * @param {object}  item Item clicked.
         * @param {DOMRect} name Bounds of the item clicked.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('itemclick', {
                detail: {
                    item: this.computedItems[
                        event.currentTarget.getAttribute('data-index')
                    ],
                    bounds: event.currentTarget.getBoundingClientRect()
                }
            })
        );
    }
}
