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
import { classSet, generateUUID } from 'c/utils';
import { keyCodes, normalizeString, normalizeArray } from 'c/utilsPrivate';

const AVATAR_GROUP_SIZES = {
    valid: ['x-small', 'small', 'medium', 'large', 'x-large', 'xx-large'],
    default: 'medium'
};
const AVATAR_GROUP_LAYOUTS = {
    valid: ['stack', 'grid', 'list'],
    default: 'stack'
};

const AVATAR_GROUP_VARIANTS = {
    valid: ['empty', 'square', 'circle'],
    default: 'square'
};

const BUTTON_ICON_POSITIONS = { valid: ['left', 'right'], default: 'left' };

const BUTTON_VARIANTS = {
    valid: [
        'neutral',
        'base',
        'brand',
        'brand-outline',
        'destructive',
        'destructive-text',
        'inverse',
        'success'
    ],
    default: 'neutral'
};

const DEFAULT_LIST_BUTTON_SHOW_MORE_LABEL = 'Show more';
const DEFAULT_LIST_BUTTON_SHOW_LESS_LABEL = 'Show less';
const LOADING_THRESHOLD = 60;
const MAX_LOADED_ITEMS = 30;

/**
 * @class
 * @name AvatarGroup
 * @descriptor avonni-avatar-group
 * @storyId example-avatar-group--base-with-two-avatars
 * @public
 */
export default class AvonniAvatarGroup extends LightningElement {
    /**
     * The Lightning Design System name of the action icon.
     * Specify the name in the format 'utility:down' where 'utility' is the category, and 'down' is the specific icon to be displayed.
     * @type {string}
     * @name action-icon-name
     * @public
     */
    @api actionIconName;

    /**
     * Label of the button that appears in the list layout, when the number of avatars exceeds the max-count number.
     * @type {string}
     * @name list-button-show-more-label
     * @default Show more
     * @public
     */
    @api listButtonShowMoreLabel = DEFAULT_LIST_BUTTON_SHOW_MORE_LABEL;

    /**
     * Label of the button that appears in the list layout, when the number of avatars exceeds the max-count number.
     * @type {string}
     * @name list-button-show-less-label
     * @default Show less
     * @public
     */
    @api listButtonShowLessLabel = DEFAULT_LIST_BUTTON_SHOW_LESS_LABEL;

    /**
     * The Lightning Design System name of the list button icon. Specify the name in the format 'utility:down' where 'utility' is the category, and 'down' is the specific icon to be displayed.
     * @type {string}
     * @name list-button-show-more-icon-name
     * @public
     */
    @api listButtonShowMoreIconName;

    /**
     * The Lightning Design System name of the list button icon. Specify the name in the format 'utility:down' where 'utility' is the category, and 'down' is the specific icon to be displayed.
     * @type {string}
     * @name list-button-show-less-icon-name
     * @public
     */
    @api listButtonShowLessIconName;

    /**
     * Name of the avatar group. It will be returned by the actionclick event.
     * @type {string}
     * @public
     */
    @api name;

    _items = [];
    _maxCount;
    _size = AVATAR_GROUP_SIZES.default;
    _layout = AVATAR_GROUP_LAYOUTS.default;
    _listButtonShowMoreIconPosition = BUTTON_ICON_POSITIONS.default;
    _listButtonShowLessIconPosition = BUTTON_ICON_POSITIONS.default;
    _listButtonVariant = BUTTON_VARIANTS.default;
    _variant = AVATAR_GROUP_VARIANTS.default;
    _imageWidth;

    showHiddenItems = false;
    _focusedIndex = 0;
    _hiddenItemsStartIndex = 0;
    _popoverFocusoutAnimationFrame;
    _popoverIsFocused = false;
    _preventPopoverClosing = false;

    connectedCallback() {
        this.template.addEventListener(
            'actionclick',
            this.handleAvatarActionClick
        );
    }

    renderedCallback() {
        const avatars = this.template.querySelectorAll(
            '[data-group-name="avatar"]'
        );

        avatars.forEach((avatar, index) => {
            avatar.style.zIndex = avatars.length - index;
        });
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * An array of items to be rendered as avatar in a group.
     * @type {object[]}
     * @public
     */
    @api
    get items() {
        return this._items;
    }

    set items(value) {
        this._items = normalizeArray(value);
    }

    /**
     * Defines the layout of the avatar group. Valid values include stack, grid and list.
     * @type {string}
     * @default stack
     * @public
     */
    @api
    get layout() {
        return this._layout;
    }

    set layout(value) {
        this._layout = normalizeString(value, {
            fallbackValue: AVATAR_GROUP_LAYOUTS.default,
            validValues: AVATAR_GROUP_LAYOUTS.valid
        });
    }

    /**
     * Position of the list button’s icon. Valid values include left and right.
     * @type {string}
     * @name list-button-show-less-icon-position
     * @default left
     * @public
     */
    @api
    get listButtonShowLessIconPosition() {
        return this._listButtonShowLessIconPosition;
    }

    set listButtonShowLessIconPosition(value) {
        this._listButtonShowLessIconPosition = normalizeString(value, {
            fallbackValue: BUTTON_ICON_POSITIONS.default,
            validValues: BUTTON_ICON_POSITIONS.valid
        });
    }

    /**
     * Position of the list button’s icon. Valid values include left and right.
     * @type {string}
     * @name list-button-show-more-icon-position
     * @default left
     * @public
     */
    @api
    get listButtonShowMoreIconPosition() {
        return this._listButtonShowMoreIconPosition;
    }

    set listButtonShowMoreIconPosition(value) {
        this._listButtonShowMoreIconPosition = normalizeString(value, {
            fallbackValue: BUTTON_ICON_POSITIONS.default,
            validValues: BUTTON_ICON_POSITIONS.valid
        });
    }

    /**
     * Variant of the button that appears in the list layout, when the number of avatars exceeds the max-count number.
     * @type {string}
     * @name list-button-variant
     * @default neutral
     * @public
     */
    @api
    get listButtonVariant() {
        return this._listButtonVariant;
    }

    set listButtonVariant(value) {
        this._listButtonVariant = normalizeString(value, {
            fallbackValue: BUTTON_VARIANTS.default,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    /**
     * The maximum number of avatars allowed in the visible list.
     * @type {number}
     * @name max-count
     * @default 5 for stack, 11 for grid and list
     * @public
     */
    @api
    get maxCount() {
        return this._maxCount;
    }

    set maxCount(value) {
        this._maxCount = parseInt(value, 10);
    }

    /**
     * The size of the avatars. Valid values include x-small, small, medium, large, x-large and xx-large.
     * @type {string}
     * @default medium
     * @public
     */
    @api
    get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: AVATAR_GROUP_SIZES.default,
            validValues: AVATAR_GROUP_SIZES.valid
        });
    }

    /**
     * Shape of the avatars. Valid values include empty, circle or square.
     * @type {string}
     * @default square
     * @public
     */
    @api
    get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: AVATAR_GROUP_VARIANTS.default,
            validValues: AVATAR_GROUP_VARIANTS.valid
        });
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Class of the action button
     * @type {string}
     */
    get actionButtonClass() {
        return classSet('avonni-avatar-group__action-button')
            .add({
                'avonni-avatar-group__avatar-in-line-button':
                    this.layout === 'stack'
            })
            .add({
                'avonni-avatar-group__action-button_circle':
                    this.variant === 'circle',
                'avonni-avatar-group__action-button_square':
                    this.variant === 'square',
                'avonni-avatar-group__action-button_x-large':
                    this.size === 'x-large',
                'avonni-avatar-group__action-button_xx-large':
                    this.size === 'xx-large',
                'avonni-avatar-group__action-button_large':
                    this.size === 'large',
                'avonni-avatar-group__action-button_medium':
                    this.size === 'medium',
                'avonni-avatar-group__action-button_small':
                    this.size === 'small',
                'avonni-avatar-group__action-button_x-small':
                    this.size === 'x-small'
            })
            .toString();
    }

    /**
     * Action button icon size
     * @type {string}
     */
    get actionButtonIconSize() {
        switch (this.size) {
            case 'x-small':
            case 'small':
            case 'medium':
                return 'x-small';
            case 'xx-large':
                return 'medium';
            default:
                return 'small';
        }
    }

    /**
     * Class of action button wrapper
     * @type {string}
     */
    get actionButtonWrapperClass() {
        return classSet(`avonni-action-button-${this.size}`)
            .add({
                'avonni-avatar-group__action-button-base-layout':
                    this.layout !== 'list',
                'avonni-avatar-group__action-button-list slds-show slds-p-vertical_x-small slds-p-horizontal_small':
                    this.layout === 'list',
                'avonni-avatar-group__avatar-button-in-line':
                    this.layout === 'stack'
            })
            .toString();
    }

    /**
     * Class to add a flex row gap to grid and stack layouts
     * @type {string}
     */
    get avatarFlexWrapperClass() {
        return classSet({
            'avonni-avatar-group__avatar-wrapper': this.layout !== 'list'
        }).toString();
    }

    /**
     * Class wrapping the two-avatar group
     * @type {string}
     */
    get avatarGroupClass() {
        return classSet('slds-avatar-group avonni-avatar-group__avatar')
            .add({
                'slds-avatar-group_x-small': this.size === 'x-small',
                'slds-avatar-group_small': this.size === 'small',
                'slds-avatar-group_medium': this.size === 'medium',
                'slds-avatar-group_large': this.size === 'large',
                'avonni-avatar-group_x-large': this.size === 'x-large',
                'avonni-avatar-group_xx-large': this.size === 'xx-large',
                'avonni-avatar-group_circle': this.variant === 'circle',
                'avonni-avatar-group_in-line': this.layout === 'stack'
            })
            .toString();
    }

    /**
     * Class of avatars when displayed in a line
     * @type {string}
     */
    get avatarInlineClass() {
        return classSet('avonni-avatar-group__avatar')
            .add({
                'avonni-avatar-group_in-line': this.layout === 'stack',
                'avonni-avatar-group__avatar_radius-border-square':
                    (this.layout === 'stack' || this.layout === 'grid') &&
                    this.variant === 'square'
            })
            .add(`avonni-avatar-${this.size}`)
            .toString();
    }

    /**
     * Class of the avatar wrapper, when there are more than two avatars
     * @type {string}
     */
    get avatarWrapperClass() {
        return classSet('avonni-avatar-group__avatar-container')
            .add({
                'slds-show avonni-avatar-group__avatar-container_list slds-p-horizontal_small slds-p-vertical_x-small':
                    this.layout === 'list',
                'avonni-avatar-group__avatar-container_grid':
                    this.layout === 'grid',
                'avonni-avatar-group__avatar-container_stack':
                    this.layout === 'stack',
                'avonni-avatar-group_circle': this.variant === 'circle',
                'slds-p-right_x-small': this.layout === 'grid'
            })
            .toString();
    }

    /**
     * Maximum number of visible items.
     * @type {number}
     */
    get computedMaxCount() {
        if (this.maxCount) {
            return this.maxCount;
        }
        return this.layout === 'stack' ? 5 : 11;
    }

    /**
     * Current icon name of the list button (show more or show less)
     * @type {string}
     */
    get currentListButtonIcon() {
        return this.showHiddenItems
            ? this.listButtonShowLessIconName
            : this.listButtonShowMoreIconName;
    }

    /**
     * Current label of the list button (show more or show less)
     * @type {string}
     */
    get currentlistButtonLabel() {
        return this.showHiddenItems
            ? this.listButtonShowLessLabel
            : this.listButtonShowMoreLabel;
    }

    /**
     * Current icon position of the list button (show more or show less)
     * @type {string}
     */
    get currentListButtonPosition() {
        return this.showHiddenItems
            ? this.listButtonShowLessIconPosition
            : this.listButtonShowMoreIconPosition;
    }

    /**
     * Automatically generated unique key.
     * @type {string}
     */
    get generatedKey() {
        return generateUUID();
    }

    /**
     * Array of hidden items.
     *
     * @type {object[]}
     */
    get hiddenItems() {
        if (!this.showMoreButton) {
            return [];
        } else if (this.display === 'list') {
            return this.items.slice(this.computedMaxCount);
        }

        let endIndex = this._hiddenItemsStartIndex + MAX_LOADED_ITEMS;
        const lastIndex = this.items.length;
        if (endIndex + 10 >= lastIndex) {
            // If only 10 items are left, load them all
            endIndex = lastIndex;
        }

        const items = this.items.slice(this._hiddenItemsStartIndex, endIndex);

        return items.map((it, index) => {
            return {
                ...it,
                index: index + this._hiddenItemsStartIndex
            };
        });
    }

    /**
     * Class of the hidden extra items dropdown
     * @type {string}
     */
    get hiddenListClass() {
        return classSet({
            'slds-dropdown slds-dropdown_left slds-p-around_none':
                this.layout !== 'list'
        }).toString();
    }

    /**
     * True if there are only two avatars visible
     * @type {boolean}
     */
    get isClassic() {
        return (
            this.layout === 'stack' &&
            this.items.length === 2 &&
            !this.actionIconName
        );
    }

    /**
     * True if the layout is not "list"
     * @type {boolean}
     */
    get isNotList() {
        return !(this.layout === 'list');
    }

    /**
     * If there are exactly two items, contains the first. Else contains an empty object.
     * @type {object}
     */
    get primaryItem() {
        if (this.items.length === 2) {
            return this.items[0];
        }
        return {};
    }

    /**
     * If there are exactly two items, contains the second. Else contains an empty object.
     * @type {object}
     */
    get secondaryItem() {
        if (this.items.length === 2) {
            return this.items[1];
        }
        return {};
    }

    /**
     * Class of the show more button when the avatars are displayed in a line
     *
     * @type {string}
     */
    get showMoreAvatarClass() {
        return classSet('avonni-avatar-group__avatar avonni-avatar-group__plus')
            .add({
                'avonni-avatar-group_in-line ': this.layout === 'stack',
                'avonni-avatar-group__avatar_radius-border-square':
                    (this.layout === 'stack' || this.layout === 'grid') &&
                    this.variant === 'square'
            })
            .add(`avonni-avatar-${this.size}`)
            .toString();
    }

    /**
     * True if the "Show More" button should be displayed.
     *
     * @type {boolean}
     */
    get showMoreButton() {
        return this.computedMaxCount < this.items.length;
    }

    /**
     * Label of the "Show More" button.
     *
     * @type {string}
     */
    get showMoreInitials() {
        const length = this.items.length - this.computedMaxCount;
        return `+${length}`;
    }

    /**
     * Class to reorder show more section
     * @type {string}
     */
    get showMoreSectionClass() {
        return classSet({
            'slds-grid slds-grid_vertical-reverse': this.layout === 'list',
            'slds-show_inline slds-is-relative': this.layout !== 'list'
        }).toString();
    }

    /**
     * Computed list items
     * @type {object[]}
     */
    get visibleItems() {
        return this.items.length > this.computedMaxCount
            ? this.items.slice(0, this.computedMaxCount)
            : this.items;
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Set the focus on the item at the saved focused index.
     */
    focusItem() {
        const focusedItem = this.template.querySelector(
            `[data-element-id^="li"][data-index="${this._focusedIndex}"]`
        );
        if (focusedItem) {
            focusedItem.focus();
        }
    }

    /**
     * Find the item at the given position.
     *
     * @param {number} y Position of the item on the Y axis.
     * @returns {object} Object with two keys: index and offset (position of the given y compared to the top of the item).
     */
    getHiddenItemFromPosition(y) {
        const elements = this.template.querySelectorAll(
            '[data-element-id="li-hidden"]'
        );

        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            const position = el.getBoundingClientRect();

            if (y + 1 >= position.top && y - 1 <= position.bottom) {
                return {
                    index: Number(el.dataset.index),
                    offset: y - position.top
                };
            }
        }
        return null;
    }

    /**
     * Normalize the focused index.
     *
     * @param {number} index Index to normalize.
     */
    normalizeFocusedIndex(index) {
        let position = 'INDEX';
        const popoverOpen = this.showHiddenItems && this.layout !== 'list';

        if (popoverOpen && index < this.computedMaxCount) {
            position = 'FIRST_HIDDEN_ITEM';
        } else if (popoverOpen && index > this.items.length - 1) {
            position = 'LAST_HIDDEN_ITEM';
        } else if (!this.showHiddenItems && index >= this.computedMaxCount) {
            position = 'LAST_VISIBLE_ITEM';
        } else if (index < 0) {
            position = 'FIRST_ITEM';
        } else if (index > this.items.length - 1) {
            position = 'LAST_ITEM';
        }

        switch (position) {
            case 'FIRST_ITEM':
                return 0;
            case 'LAST_VISIBLE_ITEM':
                return this.computedMaxCount - 1;
            case 'FIRST_HIDDEN_ITEM':
                return this.computedMaxCount;
            case 'LAST_HIDDEN_ITEM':
                return this.items.length - 1;
            case 'LAST_ITEM':
                return this.items.length - 1;
            default:
                return index;
        }
    }

    /**
     * Update the focused index.
     *
     * @param {number} index Index of the new focused item.
     */
    switchFocus(index) {
        const list = this.template.querySelector('[data-element-id="ul"]');
        if (list) {
            list.tabIndex = '-1';
        }

        const normalizedIndex = this.normalizeFocusedIndex(index);

        // remove focus from current item
        const previousItem = this.template.querySelector(
            `[data-element-id^="li"][data-index="${this._focusedIndex}"]`
        );
        if (previousItem) {
            previousItem.tabIndex = '-1';
        }

        // move to next
        this._focusedIndex = normalizedIndex;

        // set focus
        const item = this.template.querySelector(
            `[data-element-id^="li"][data-index="${normalizedIndex}"]`
        );
        item.tabIndex = '0';
    }

    /*
     * ------------------------------------------------------------
     *  EVENT HANDLERS AND DISPATCHERS
     * -------------------------------------------------------------
     */

    /**
     * Dispatch the actionclick event
     */
    handleActionClick() {
        const name = this.name;

        /**
         * The event fired when the user clicks on an action.
         *
         * @event
         * @name actionclick
         * @param {string} name The avatar group name.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('actionclick', {
                detail: {
                    name
                }
            })
        );
    }

    /**
     * Dispatch the actionclick event
     */
    handleAvatarActionClick = (event) => {
        const name = event.detail.name;
        const index = Number(event.target.dataset.index);
        const item = this.items[index];

        /**
         * The event fired when the user clicks on an avatar action.
         *
         * @event
         * @name avataractionclick
         * @param {object} item The avatar detail.
         * @param {string} name The action name.
         * @param {string} targetName Name of the avatar.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('avataractionclick', {
                detail: {
                    item,
                    name,
                    targetName: item.name
                }
            })
        );
    };

    /**
     * If the "show more" avatar was clicked, open the popover.
     * If another avatar was clicked, dispatch the avatarclick event.
     */
    handleAvatarClick(event) {
        if (event.type === 'keyup' && event.key !== 'Enter') {
            return;
        }

        const index = Number(event.target.dataset.index);
        const item = this.items[index];

        /**
         * The event fired when the user click on an avatar.
         *
         * @event
         * @name avatarclick
         * @param {object} item The avatar detail.
         * @param {string} name Name of the avatar.
         * @bubbles
         * @cancelable
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('avatarclick', {
                bubbles: true,
                cancelable: true,
                detail: {
                    item,
                    name: item.name
                }
            })
        );

        if (this.layout !== 'list' && this.showHiddenItems) {
            this.handleToggleShowHiddenItems();
        } else if (!this.isClassic) {
            this.switchFocus(index);
        }
    }

    /**
     * Handle a focus inside the hidden items list.
     */
    handleHiddenItemsFocusIn() {
        if (this.layout === 'list') {
            return;
        }
        this._popoverIsFocused = true;
    }

    /**
     * Handle a focus outside the hidden items list.
     */
    handleHiddenItemsFocusOut() {
        if (this.layout === 'list') {
            return;
        }
        this._popoverIsFocused = false;

        cancelAnimationFrame(this._popoverFocusoutAnimationFrame);
        this._popoverFocusoutAnimationFrame = requestAnimationFrame(() => {
            if (
                !this._popoverIsFocused &&
                this.showHiddenItems &&
                !this._preventPopoverClosing
            ) {
                this.handleToggleShowHiddenItems();
            }
            this._preventPopoverClosing = false;
        });
    }

    /**
     * Handle a scroll movement inside the hidden items list.
     *
     * @param {Event} event `scroll` event.
     */
    handleHiddenItemsScroll(event) {
        const popover = event.currentTarget;
        const popoverTop = popover.getBoundingClientRect().top;
        const height = popover.scrollHeight;
        const scrolledDistance = popover.scrollTop;
        const bottomLimit = height - popover.clientHeight - LOADING_THRESHOLD;
        const loadDown = scrolledDistance >= bottomLimit;
        const loadUp = scrolledDistance <= LOADING_THRESHOLD;

        let newIndex;
        if (loadUp) {
            const previousIndex = this._hiddenItemsStartIndex - 10;
            newIndex = Math.max(previousIndex, this.computedMaxCount);
        } else if (loadDown) {
            const nextIndex = this._hiddenItemsStartIndex + 10;
            const maxIndex = this.items.length - MAX_LOADED_ITEMS - 10;
            const minIndex = this.computedMaxCount;
            newIndex =
                maxIndex < minIndex ? minIndex : Math.min(nextIndex, maxIndex);
        }

        if (!isNaN(newIndex) && this._hiddenItemsStartIndex !== newIndex) {
            const topItem = this.getHiddenItemFromPosition(popoverTop);
            this._hiddenItemsStartIndex = newIndex;
            this._preventPopoverClosing = true;

            requestAnimationFrame(() => {
                // Move the scroll bar back to the previous top item
                const previousTopItem = this.template.querySelector(
                    `[data-element-id="li-hidden"][data-index="${topItem.index}"]`
                );
                const lastHiddenItem =
                    this.hiddenItems[this.hiddenItems.length - 1];
                const focusIsTooHigh = this._focusedIndex < topItem.index;
                const focusIsTooLow = this._focusedIndex > lastHiddenItem.index;

                if (focusIsTooHigh || focusIsTooLow) {
                    // If the scroll was triggered using the mouse,
                    // keep an item focused
                    this.switchFocus(topItem.index);
                }
                this.focusItem();
                popover.scrollTop = previousTopItem.offsetTop + topItem.offset;
            });
        }
    }

    /**
     * Handle a focus on an item.
     *
     * @param {Event} event `focus` event.
     */
    handleItemFocus(event) {
        const index = Number(event.currentTarget.dataset.index);
        if (index !== this._focusedIndex) {
            this.switchFocus(index);
        }
    }

    /**
     * Handle a keydown event on the items list.
     *
     * @param {Event} event `keydown` event.
     */
    handleItemsKeyDown(event) {
        switch (event.keyCode) {
            case keyCodes.left:
            case keyCodes.up: {
                // Prevent the page from scrolling
                event.preventDefault();
                this.switchFocus(this._focusedIndex - 1);
                this.focusItem();
                break;
            }
            case keyCodes.right:
            case keyCodes.down: {
                // Prevent the page from scrolling
                event.preventDefault();
                this.switchFocus(this._focusedIndex + 1);
                this.focusItem();
                break;
            }
            case keyCodes.space:
            case keyCodes.enter:
                // Prevent the page from scrolling
                event.preventDefault();
                this.handleAvatarClick(event);
                break;
            case keyCodes.escape:
                if (this.showHiddenItems) {
                    this.handleToggleShowHiddenItems();
                }
                break;
            default:
                break;
        }
    }

    /**
     * Handle a keydown event on the show more button.
     *
     * @param {Event} event `keydown` event.
     */
    handleShowHiddenItemsButtonKeyDown(event) {
        const key = event.key;
        if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
            this.handleToggleShowHiddenItems();
        }
    }

    /**
     * Toggle the hidden extra avatars popover
     */
    handleToggleShowHiddenItems() {
        this.showHiddenItems = !this.showHiddenItems;

        if (this.showHiddenItems) {
            this._hiddenItemsStartIndex = this.computedMaxCount;
            this._focusedIndex = this.computedMaxCount;
        } else {
            this._focusedIndex = this.computedMaxCount - 1;
        }

        requestAnimationFrame(() => {
            if (this.showHiddenItems) {
                this.focusItem();
            } else {
                const showMoreButton = this.template.querySelector(
                    '[data-show-more-button]'
                );
                if (showMoreButton) {
                    showMoreButton.focus();
                }
            }
        });
    }

    /**
     * Stop the propagation of an event.
     *
     * @param {Event} event Event to stop.
     */
    stopPropagation(event) {
        event.stopPropagation();
    }
}
