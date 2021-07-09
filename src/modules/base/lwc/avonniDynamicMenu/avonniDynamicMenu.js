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
import {
    normalizeBoolean,
    normalizeString,
    observePosition
} from 'c/utilsPrivate';

const MENU_ALIGNMENTS = {
    valid: [
        'left',
        'center',
        'right',
        'bottom-left',
        'bottom-center',
        'bottom-right'
    ],
    default: 'left'
};

const BUTTON_VARIANTS = {
    valid: [
        'border',
        'border-inverse',
        'border-filled',
        'brand',
        'bare',
        'bare-inverse',
        'container'
    ],
    default: 'border'
};

const ICON_SIZES = {
    valid: ['xx-small', 'x-small', 'small', 'medium', 'large'],
    default: 'medium'
};

const DEFAULT_SEARCH_INPUT_PLACEHOLDER = 'Search…';

export default class AvonniDynamicMenu extends LightningElement {
    @api iconName;
    @api value;
    @api alternativeText;
    @api loadingStateAlternativeText;
    @api label;
    @api withSearch;
    @api accessKey;
    @api title;
    @api searchInputPlaceholder = DEFAULT_SEARCH_INPUT_PLACEHOLDER;
    @api tooltip;

    _items = [];
    _isLoading;
    _variant = BUTTON_VARIANTS.default;
    _menuAlignment = MENU_ALIGNMENTS.default;
    _disabled;
    queryTerm;
    _dropdownVisible = false;
    _dropdownOpened = false;
    showFooter = true;
    filteredItems = [];
    _boundingRect = {};
    _iconSize = ICON_SIZES.default;

    connectedCallback() {
        this.classList.add(
            'slds-dropdown-trigger',
            'slds-dropdown-trigger_click'
        );
    }

    renderedCallback() {
        if (this.footerSlot) {
            this.showFooter = this.footerSlot.assignedElements().length !== 0;
        }
    }

    get footerSlot() {
        return this.template.querySelector('slot[name=footer]');
    }

    @api
    get items() {
        return this._items;
    }

    set items(value) {
        let result = [];

        value.forEach((item, key) => {
            let cloneItem = Object.assign({}, item);
            cloneItem.metaJoin = cloneItem.meta.join(' • ');
            cloneItem.key = `item-key-${key}`;
            result.push(cloneItem);
        });

        this._items = result;
        this.filteredItems = result;
    }

    @api
    get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: BUTTON_VARIANTS.default,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    @api get iconSize() {
        return this._iconSize;
    }

    set iconSize(iconSize) {
        this._iconSize = normalizeString(iconSize, {
            fallbackValue: ICON_SIZES.default,
            validValues: ICON_SIZES.valid
        });
    }

    @api
    get menuAlignment() {
        return this._menuAlignment;
    }

    set menuAlignment(value) {
        this._menuAlignment = normalizeString(value, {
            fallbackValue: MENU_ALIGNMENTS.default,
            validValues: MENU_ALIGNMENTS.valid
        });
    }

    @api
    get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    @api
    get isLoading() {
        return this._isLoading;
    }

    set isLoading(value) {
        this._isLoading = normalizeBoolean(value);
    }

    @api
    focus() {
        if (this.isConnected) {
            this.focusOnButton();
        }
        this.dispatchEvent(new CustomEvent('focus'));
    }

    @api
    click() {
        if (this.isConnected) {
            if (this.label) {
                this.template.querySelector('lightning-button').click();
            } else {
                this.template.querySelector('lightning-button-icon').click();
            }
        }
    }

    get computedAriaExpanded() {
        return String(this._dropdownVisible);
    }

    get computedDropdownClass() {
        return classSet('slds-dropdown slds-popover slds-dynamic-menu')
            .add({
                'slds-dropdown_left':
                    this.menuAlignment === 'left' || this.isAutoAlignment(),
                'slds-dropdown_center': this.menuAlignment === 'center',
                'slds-dropdown_right': this.menuAlignment === 'right',
                'slds-dropdown_bottom': this.menuAlignment === 'bottom-center',
                'slds-dropdown_bottom slds-dropdown_right slds-dropdown_bottom-right':
                    this.menuAlignment === 'bottom-right',
                'slds-dropdown_bottom slds-dropdown_left slds-dropdown_bottom-left':
                    this.menuAlignment === 'bottom-left',
                'slds-nubbin_top-left': this.menuAlignment === 'left',
                'slds-nubbin_top-right': this.menuAlignment === 'right',
                'slds-nubbin_top': this.menuAlignment === 'center',
                'slds-nubbin_bottom-left': this.menuAlignment === 'bottom-left',
                'slds-nubbin_bottom-right':
                    this.menuAlignment === 'bottom-right',
                'slds-nubbin_bottom': this.menuAlignment === 'bottom-center',
                'slds-p-vertical_large': this.isLoading
            })
            .toString();
    }

    get showItems() {
        return this.filteredItems.length > 0;
    }

    handleButtonClick() {
        this.allowBlur();
        this.toggleMenuVisibility();
        this.focusOnButton();
    }

    handleButtonMouseDown(event) {
        const mainButton = 0;
        if (event.button === mainButton) {
            this.cancelBlur();
        }
    }

    handleDropdownMouseDown(event) {
        const mainButton = 0;
        if (event.button === mainButton) {
            this.cancelBlur();
        }
    }

    handleDropdownMouseUp() {
        this.allowBlur();
    }

    handleDropdownScroll(event) {
        event.stopPropagation();
    }

    focusOnButton() {
        if (this.label) {
            this.template.querySelector('lightning-button').focus();
        } else {
            this.template.querySelector('lightning-button-icon').focus();
        }
    }

    isAutoAlignment() {
        return this.menuAlignment.startsWith('auto');
    }

    toggleMenuVisibility() {
        if (!this.disabled) {
            this._dropdownVisible = !this._dropdownVisible;
            this._dropdownOpened = !this._dropdownOpened;

            if (this._dropdownVisible) {
                this.dispatchEvent(new CustomEvent('open'));
                this._boundingRect = this.getBoundingClientRect();
                this.pollBoundingRect();
            } else {
                this.filteredItems = this.items;
            }

            this.classList.toggle('slds-is-open');
        }
    }

    handleBlur() {
        if (this._cancelBlur) {
            return;
        }

        if (this._dropdownVisible) {
            this.toggleMenuVisibility();
        }

        this.dispatchEvent(new CustomEvent('blur'));
    }

    allowBlur() {
        this._cancelBlur = false;
    }

    cancelBlur() {
        this._cancelBlur = true;
    }

    close() {
        if (this._dropdownVisible) {
            this.toggleMenuVisibility();
        }
    }

    pollBoundingRect() {
        if (this.isAutoAlignment() && this._dropdownVisible) {
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => {
                if (this.isConnected) {
                    observePosition(this, 300, this._boundingRect, () => {
                        this.close();
                    });

                    this.pollBoundingRect();
                }
            }, 250);
        }
    }

    handleKeyUp(event) {
        let filter = event.target.value.toLowerCase();
        this.filteredItems = this.items.filter((item) => {
            return item.label.toLowerCase().indexOf(filter) > -1;
        });
    }

    handleClick(event) {
        let index = event.currentTarget.id.split('-')[0];
        let item = this.items[index];

        const selectedEvent = new CustomEvent('select', {
            detail: {
                item
            }
        });
        this.dispatchEvent(selectedEvent);

        this.toggleMenuVisibility();
    }

    clearFilter(event) {
        if (!event.target.value) {
            this.filteredItems = this.items;
        }
    }
}
