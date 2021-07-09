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

export default class AvonniAvatarGroup extends LightningElement {
    @api actionIconName;
    @api listButtonIconName;
    @api listButtonShowMoreLabel = DEFAULT_LIST_BUTTON_SHOW_MORE_LABEL;
    @api listButtonShowLessLabel = DEFAULT_LIST_BUTTON_SHOW_LESS_LABEL;

    @api listButtonShowMoreIconName;
    @api listButtonShowLessIconName;
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

    @api
    get items() {
        return this._items;
    }

    set items(value) {
        this._items = normalizeArray(value);
    }

    @api
    get maxCount() {
        return this._maxCount;
    }

    set maxCount(value) {
        this._maxCount = value;
    }

    @api get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: AVATAR_GROUP_SIZES.default,
            validValues: AVATAR_GROUP_SIZES.valid
        });
    }

    @api get layout() {
        return this._layout;
    }

    set layout(value) {
        this._layout = normalizeString(value, {
            fallbackValue: AVATAR_GROUP_LAYOUTS.default,
            validValues: AVATAR_GROUP_LAYOUTS.valid
        });
    }

    @api get listButtonVariant() {
        return this._listButtonVariant;
    }

    set listButtonVariant(value) {
        this._listButtonVariant = normalizeString(value, {
            fallbackValue: BUTTON_VARIANTS.default,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    @api get listButtonShowMoreIconPosition() {
        return this._listButtonShowMoreIconPosition;
    }

    set listButtonShowMoreIconPosition(value) {
        this._listButtonShowMoreIconPosition = normalizeString(value, {
            fallbackValue: BUTTON_ICON_POSITIONS.default,
            validValues: BUTTON_ICON_POSITIONS.valid
        });
    }
    @api get listButtonShowLessIconPosition() {
        return this._listButtonShowLessIconPosition;
    }

    set listButtonShowLessIconPosition(value) {
        this._listButtonShowLessIconPosition = normalizeString(value, {
            fallbackValue: BUTTON_ICON_POSITIONS.default,
            validValues: BUTTON_ICON_POSITIONS.valid
        });
    }

    @api get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: AVATAR_GROUP_VARIANTS.default,
            validValues: AVATAR_GROUP_VARIANTS.valid
        });
    }

    get currentlistButtonLabel() {
        return this.showPopover
            ? this.listButtonShowLessLabel
            : this.listButtonShowMoreLabel;
    }

    get currentListButtonIcon() {
        return this.showPopover
            ? this.listButtonShowLessIconName
            : this.listButtonShowMoreIconName;
    }

    get currentListButtonPosition() {
        return this.showPopover
            ? this.listButtonShowLessIconPosition
            : this.listButtonShowMoreIconPosition;
    }

    get primaryItem() {
        if (this.items.length === 2) {
            return this.items[0];
        }

        return {};
    }

    get secondaryItem() {
        if (this.items.length === 2) {
            return this.items[1];
        }

        return {};
    }

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

    get avatarInlineClass() {
        return classSet('avonni-avatar-group__avatar')
            .add({
                'avonni-avatar-group_in-line': this.layout === 'stack',
                circleBorder:
                    this.layout === 'stack' && this.variant === 'circle',
                squareBorder:
                    this.layout === 'stack' && this.variant === 'square'
            })
            .add(`avonni-avatar-${this.size}`)
            .toString();
    }

    get avatarInlinePlusClass() {
        return classSet('avonni-avatar-group__avatar avonni-avatar-group__plus')
            .add({
                'avonni-avatar-group_in-line': this.layout === 'stack'
            })
            .add(`avonni-avatar-${this.size}`)
            .toString();
    }

    get avatarWrapperClass() {
        return classSet('avonni-avatar-group__avatar-container').add({
            'slds-show': this.layout === 'list',
            'avonni-avatar-group_circle': this.variant === 'circle',
            'slds-p-right_x-small': this.layout === 'grid'
        });
    }

    get actionButtonClass() {
        return classSet('avonni-avatar-group__action-button')
            .add({
                'avonni-avatar-group_action-button-in-line':
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

    get actionButtonBaseLayoutClass() {
        return classSet(
            'avonni-avatar-group__action-button-base-layout'
        ).toString();
    }

    get actionButtonListClass() {
        return classSet('avonni-avatar-group__action-button-list').add({
            'slds-show': this.layout === 'list'
        });
    }

    get actionButtonInlineClass() {
        return classSet('avonni-avatar-group__action-button-base-layout')
            .add({
                'avonni-avatar-group_action-button-in-line':
                    this.layout === 'stack'
            })
            .add(`avonni-action-button-${this.size}`)
            .toString();
    }
    get hiddenListStyle() {
        return classSet().add({
            'slds-dropdown slds-dropdown_left': this.layout !== 'list'
        });
    }
    get actionButtonLayoutClass() {
        if (this.layout === 'list') {
            return this.actionButtonListClass;
        } else if (this.layout === 'stack') {
            return this.actionButtonInlineClass;
        }
        return this.actionButtonBaseLayoutClass;
    }

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

    get isClassic() {
        return (
            this.layout === 'stack' &&
            this.items.length === 2 &&
            !this.actionIconName
        );
    }

    get isNotList() {
        return !(this.layout === 'list');
    }
    allowBlur() {
        this._allowBlur = true;
    }

    cancelBlur() {
        this._allowBlur = false;
    }

    handleBlur() {
        if (!this._allowBlur) {
            return;
        }

        this.showPopover = false;
    }

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

    actionClick() {
        // * action event *
        const name = this.name;

        this.dispatchEvent(
            new CustomEvent('actionclick', {
                bubbles: true,
                cancelable: true,
                detail: {
                    name
                }
            })
        );
    }

    toggleShowHiddenList() {
        this.showPopover = !this.showPopover;
    }
}
