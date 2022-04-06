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
import { normalizeString, normalizeArray } from 'c/utilsPrivate';

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
    _allowBlur = false;
    _listButtonShowMoreIconPosition = BUTTON_ICON_POSITIONS.default;
    _listButtonShowLessIconPosition = BUTTON_ICON_POSITIONS.default;
    _listButtonVariant = BUTTON_VARIANTS.default;
    _variant = AVATAR_GROUP_VARIANTS.default;
    _imageWidth;

    showPopover = false;
    hiddenItems = [];

    connectedCallback() {
        if (!this.maxCount) {
            this._maxCount = this.layout === 'stack' ? 5 : 11;
        }
        this.template.addEventListener(
            'actionclick',
            this.handleAvatarActionClick
        );
    }

    renderedCallback() {
        if (!this.isClassic) {
            let avatars = this.template.querySelectorAll(
                '.avonni-avatar-group__avatar'
            );

            avatars.forEach((avatar, index) => {
                avatar.style.zIndex = avatars.length - index;
            });
        }
    }

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
        this._maxCount = value;
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

    /**
     * Current label of the list button (show more or show less)
     * @type {string}
     */
    get currentlistButtonLabel() {
        return this.showPopover
            ? this.listButtonShowLessLabel
            : this.listButtonShowMoreLabel;
    }

    /**
     * Current icon name of the list button (show more or show less)
     * @type {string}
     */
    get currentListButtonIcon() {
        return this.showPopover
            ? this.listButtonShowLessIconName
            : this.listButtonShowMoreIconName;
    }

    /**
     * Current icon position of the list button (show more or show less)
     * @type {string}
     */
    get currentListButtonPosition() {
        return this.showPopover
            ? this.listButtonShowLessIconPosition
            : this.listButtonShowMoreIconPosition;
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
     * Computed list items
     * @type {object[]}
     */
    get listItems() {
        let length = this.items.length;
        let maxCount = this.maxCount;
        let items = JSON.parse(JSON.stringify(this.items));

        if (isNaN(maxCount)) {
            maxCount = this.layout === 'stack' ? 5 : 11;
        }

        if (length > maxCount) {
            items = items.slice(0, maxCount);

            items.push({
                initials: `+${length - maxCount}`,
                showMore: true
            });
        }

        items.forEach((item, index) => {
            item.key = 'avatar-key-' + index;
        });
        return items;
    }

    /**
     * Hidden extra items
     * @type {object[]}
     */
    get listHiddenItems() {
        let length = this.items.length;
        let maxCount = this.maxCount;
        let items = JSON.parse(JSON.stringify(this.items));

        if (isNaN(maxCount)) {
            maxCount = 11;
        }

        if (length > maxCount) {
            items = items.slice(maxCount);
            items.forEach((item, index) => {
                item.key = 'avatar-key-hidden-' + index;
            });
            return items;
        }
        return [];
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
                'avonni-avatar-group_circle': this.variant === 'circle'
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
                'avonni-avatar-group__avatar_color-border-circle':
                    this.layout === 'stack' && this.variant === 'circle',
                'avonni-avatar-group__avatar_color-border-square':
                    this.layout === 'stack' && this.variant === 'square'
            })
            .add(`avonni-avatar-${this.size}`)
            .toString();
    }

    /**
     * Class of the show more button when the avatars are displayed in a line
     * @type {string}
     */
    get avatarInlinePlusClass() {
        return classSet('avonni-avatar-group__avatar avonni-avatar-group__plus')
            .add({
                'avonni-avatar-group_in-line ': this.layout === 'stack',
                'avonni-avatar-group__avatar_color-border-circle':
                    this.layout === 'stack' && this.variant === 'circle',
                'avonni-avatar-group__avatar_color-border-square':
                    this.layout === 'stack' && this.variant === 'square'
            })
            .add(`avonni-avatar-${this.size}`)
            .toString();
    }

    /**
     * Class of the avatar wrapper, when there are more than two avatars
     * @type {string}
     */
    get avatarWrapperClass() {
        return classSet('avonni-avatar-group__avatar-container').add({
            'slds-show': this.layout === 'list',
            'avonni-avatar-group_circle': this.variant === 'circle',
            'slds-p-right_x-small': this.layout === 'grid'
        });
    }

    /**
     * Class of the action button
     * @type {string}
     */
    get actionButtonClass() {
        return classSet('avonni-avatar-group__action-button')
            .add({
                'avonni-avatar-group_action-button-in-line':
                    this.layout === 'stack'
            })
            .add({
                'avonni-avatar-group__action-button_circle avonni-avatar-group__avatar_color-border-circle':
                    this.variant === 'circle',
                'avonni-avatar-group__action-button_square avonni-avatar-group__avatar_color-border-square':
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
     * Class of action button wrapper
     * @type {string}
     */
    get actionButtonWrapperClass() {
        let classes = classSet(`avonni-action-button-${this.size}`)
            .add({
                'avonni-avatar-group__action-button-base-layout':
                    this.layout !== 'list',
                'avonni-avatar-group__action-button-list slds-show':
                    this.layout === 'list',
                'avonni-avatar-group_action-button-in-line':
                    this.layout === 'stack'
            })
            .toString();

        return classes;
    }

    /**
     * Class of the hidden extra items dropdown
     * @type {string}
     */
    get hiddenListClass() {
        return classSet().add({
            'slds-dropdown slds-dropdown_left': this.layout !== 'list'
        });
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
     * Change the value of _allowBlur to true
     */
    allowBlur() {
        this._allowBlur = true;
    }

    /**
     * Change the value of _allowBlur to false
     */
    cancelBlur() {
        this._allowBlur = false;
    }

    /**
     * Close the hidden extra avatars popover
     */
    handleBlur() {
        if (!this._allowBlur) {
            return;
        }
        this.showPopover = false;
    }

    /**
     * If the "show more" avatar was clicked, open the popover.
     * If another avatar was clicked, dispatch the avatarclick event.
     */
    handleAvatarClick(event) {
        if (event.type === 'keyup' && event.key !== 'Enter') return;

        const itemId = event.target.dataset.itemId;
        const type = event.target.dataset.type;
        let item;

        if (type === 'show') {
            item = this.listItems[itemId];
        } else {
            item = this.listHiddenItems[itemId];
        }

        if (item.showMore) {
            this.showPopover = true;
            this.template.querySelector('.slds-dropdown-trigger').focus();
            this.allowBlur();
        } else {
            /**
             * The event fired when the user click on an avatar.
             *
             * @event
             * @name avatarclick
             * @param {object} item The avatar detail.
             * @bubbles
             * @cancelable
             * @public
             */
            this.dispatchEvent(
                new CustomEvent('avatarclick', {
                    bubbles: true,
                    cancelable: true,
                    detail: {
                        item
                    }
                })
            );

            this.showPopover = false;
            this.cancelBlur();
        }
    }

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
        const itemId = event.target.dataset.itemId;
        const type = event.target.dataset.type;
        let item;

        if (type === 'show') {
            item = this.listItems[itemId];
        } else {
            item = this.listHiddenItems[itemId];
        }

        /**
         * The event fired when the user clicks on an avatar action.
         *
         * @event
         * @name avataractionclick
         * @param {object} item The avatar detail.
         * @param {string} name The action name.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('avataractionclick', {
                detail: {
                    item,
                    name
                }
            })
        );
    };

    /**
     * Toggle the hidden extra avatars popover
     */
    toggleShowHiddenList() {
        this.showPopover = !this.showPopover;
    }
}
