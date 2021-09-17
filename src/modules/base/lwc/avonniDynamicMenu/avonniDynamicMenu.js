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

const BUTTON_SIZES = {
    valid: ['auto', 'stretch'],
    default: 'auto'
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

/**
 * @class
 * @descriptor  avonni-dynamic-menu
 * @storyId example-dynamic-menu--base
 * @public
 */
export default class AvonniDynamicMenu extends LightningElement {
    /**
     * The name of the icon to be used in the format 'utility:down'.
     *
     * @type {string}
     * @public
     */
    @api iconName;
    /**
     * The value for the button element. This value is optional and can be used when submitting a form.
     *
     * @type {string}
     * @public
     */
    @api value;
    /**
     * The assistive text for the button.
     *
     * @type {string}
     * @public
     */
    @api alternativeText;
    /**
     * Message displayed while the menu is in the loading state.
     *
     * @type {string}
     * @public
     */
    @api loadingStateAlternativeText;
    /**
     * Optional text to be shown on the button.
     *
     * @type {string}
     * @public
     */
    @api label;
    /**
     * If present, display search box.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api withSearch;
    /**
     * The keyboard shortcut for the button menu.
     *
     * @type {string}
     * @public
     */
    @api accessKey;
    /**
     * Displays tooltip text when the mouse moves over the button menu.
     *
     * @type {string}
     * @public
     */
    @api title;
    /**
     * Text that is displayed when the field is empty, to prompt the user for a valid entry.
     *
     * @type {string}
     * @public
     */
    @api searchInputPlaceholder = DEFAULT_SEARCH_INPUT_PLACEHOLDER;
    /**
     * Text to display when the user mouses over or focuses on the button. The tooltip is auto-positioned relative to the button and screen space.
     *
     * @type {string}
     * @public
     */
    @api tooltip;

    _buttonSize = BUTTON_SIZES.default;
    _items = [];
    _isLoading;
    _variant = BUTTON_VARIANTS.default;
    _menuAlignment = MENU_ALIGNMENTS.default;
    _disabled;
    queryTerm;
    _dropdownVisible = false;
    _dropdownOpened = false;
    _order;
    showFooter = true;
    filteredItems = [];
    _boundingRect = {};
    _iconSize = ICON_SIZES.default;

    connectedCallback() {
        this.classList.add(
            'slds-dropdown-trigger',
            'slds-dropdown-trigger_click'
        );

        // Register event so the button-group (or other) component can register the button
        const privatebuttonregister = new CustomEvent('privatebuttonregister', {
            bubbles: true,
            detail: {
                callbacks: {
                    setOrder: this.setOrder.bind(this),
                    setDeRegistrationCallback: (deRegistrationCallback) => {
                        this._deRegistrationCallback = deRegistrationCallback;
                    }
                }
            }
        });

        this.dispatchEvent(privatebuttonregister);
    }

    renderedCallback() {
        if (this.footerSlot) {
            this.showFooter = this.footerSlot.assignedElements().length !== 0;
        }
    }

    disconnectedCallback() {
        if (this._deRegistrationCallback) {
            this._deRegistrationCallback();
        }
    }

    get footerSlot() {
        return this.template.querySelector('slot[name=footer]');
    }

    /**
     * Size of the button. Available options include auto and stretch.
     *
     * @type {string}
     * @public
     * @default auto
     */
    @api
    get buttonSize() {
        return this._buttonSize;
    }

    set buttonSize(value) {
        this._buttonSize = normalizeString(value, {
            fallbackValue: BUTTON_SIZES.default,
            validValues: BUTTON_SIZES.valid
        });

        if (this._buttonSize === 'stretch') {
            this.classList.add('slds-button_stretch');
        } else {
            this.classList.remove('slds-button_stretch');
        }
    }

    /**
     * An Array of item fields.
     *
     * @type {object[]}
     * @public
     */
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

    /**
     * The variant changes the look of the button. Accepted variants include bare, container, border, border-filled, bare-inverse, and border-inverse.
     *
     * @type {string}
     * @public
     * @default border
     */
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

    /**
     * The size of the icon. Options include xx-small, x-small, medium, or large.
     *
     * @type {string}
     * @public
     * @default medium
     */
    @api get iconSize() {
        return this._iconSize;
    }

    set iconSize(iconSize) {
        this._iconSize = normalizeString(iconSize, {
            fallbackValue: ICON_SIZES.default,
            validValues: ICON_SIZES.valid
        });
    }

    /**
     * Determines the alignment of the menu relative to the button. Available options are: auto, left, center, right, bottom-left, bottom-center, bottom-right. The auto option aligns the dropdown menu based on available space.
     *
     * @type {string}
     * @public
     * @default left
     */
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

    /**
     * If present, the menu cannot be opened by users.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    /**
     * If present, the menu is in a loading state and shows a spinner.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get isLoading() {
        return this._isLoading;
    }

    set isLoading(value) {
        this._isLoading = normalizeBoolean(value);
    }

    /**
     * Set focus on the button.
     *
     * @public
     */
    @api
    focus() {
        if (this.isConnected) {
            this.focusOnButton();
        }
        /**
         * Focus event
         *
         * @event
         * @name focus
         * @public
         */
        this.dispatchEvent(new CustomEvent('focus'));
    }

    /**
     * Click method on the button.
     *
     * @public
     */
    @api
    click() {
        if (this.isConnected) {
            if (this.label) {
                this.template.querySelector('button').click();
            } else {
                this.template.querySelector('lightning-button-icon').click();
            }
        }
    }

    /**
     * Computed Aria Expanded from dropdown menu.
     *
     * @type {string}
     */
    get computedAriaExpanded() {
        return String(this._dropdownVisible);
    }

    /**
     * Computed button class, when the dynamic menu has a label.
     *
     * @type {string}
     * @default slds-button
     */
    get computedButtonClass() {
        const { variant, _order, buttonSize } = this;
        return classSet('slds-button')
            .add({
                'slds-button_neutral': variant !== 'brand',
                'slds-button_brand': variant === 'brand',
                'slds-button_first': _order === 'first',
                'slds-button_middle': _order === 'middle',
                'slds-button_last': _order === 'last',
                'slds-button_stretch': buttonSize === 'stretch'
            })
            .toString();
    }

    /**
     * Computed Dropdown class styling.
     *
     * @type {string}
     */
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

    /**
     * Check if there's Items to display.
     *
     * @type {boolean}
     */
    get showItems() {
        return this.filteredItems.length > 0;
    }

    /**
     * Sets the order value of the button when in the context of a button-group or other ordered component
     * @param {string} order -  The order string (first, middle, last)
     */
    setOrder(order) {
        this._order = order;
    }

    /**
     * Button Click handler.
     */
    handleButtonClick() {
        this.allowBlur();
        this.toggleMenuVisibility();
        this.focusOnButton();
    }

    /**
     * Button Mouse down event handler.
     *
     * @param {Event} event
     */
    handleButtonMouseDown(event) {
        const mainButton = 0;
        if (event.button === mainButton) {
            this.cancelBlur();
        }
    }

    /**
     * Dropdown menu Mouse down event handler.
     *
     * @param {Event} event
     */
    handleDropdownMouseDown(event) {
        const mainButton = 0;
        if (event.button === mainButton) {
            this.cancelBlur();
        }
    }

    /**
     * Dropdown menu Mouse up handler.
     */
    handleDropdownMouseUp() {
        this.allowBlur();
    }

    /**
     * Dropdown menu scroll event handler.
     *
     * @param {Event} event
     */
    handleDropdownScroll(event) {
        event.stopPropagation();
    }

    /**
     * Button focus handler.
     */
    focusOnButton() {
        if (this.label) {
            this.template.querySelector('button').focus();
        } else {
            this.template.querySelector('lightning-button-icon').focus();
        }
    }

    /**
     * Check if menu is Auto Aligned.
     *
     * @returns boolean
     */
    isAutoAlignment() {
        return this.menuAlignment.startsWith('auto');
    }

    /**
     * Dropdown menu Visibility toggle.
     */
    toggleMenuVisibility() {
        if (!this.disabled) {
            this._dropdownVisible = !this._dropdownVisible;
            this._dropdownOpened = !this._dropdownOpened;

            if (this._dropdownVisible) {
                /**
                 * Event fires when opening dropdown menu.
                 *
                 * @event
                 * @name open
                 * @public
                 */
                this.dispatchEvent(new CustomEvent('open'));
                this._boundingRect = this.getBoundingClientRect();
                this.pollBoundingRect();
            } else {
                this.filteredItems = this.items;
            }

            this.classList.toggle('slds-is-open');
        }
    }

    /**
     * Blur Handler.
     */
    handleBlur() {
        if (this._cancelBlur) {
            return;
        }

        if (this._dropdownVisible) {
            this.toggleMenuVisibility();
        }
        /**
         * Blur event
         *
         * @event
         * @name blur
         * @public
         */
        this.dispatchEvent(new CustomEvent('blur'));
    }

    /**
     * Allows Blur.
     */
    allowBlur() {
        this._cancelBlur = false;
    }

    /**
     * Cancels Blur.
     */
    cancelBlur() {
        this._cancelBlur = true;
    }

    /**
     * Close Dropdown menu.
     */
    close() {
        if (this._dropdownVisible) {
            this.toggleMenuVisibility();
        }
    }

    /**
     * Get bounding rect coordinates for dropdown menu.
     */
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

    /**
     * Key up event handler.
     *
     * @param {Event} event
     */
    handleKeyUp(event) {
        let filter = event.target.value.toLowerCase();
        this.filteredItems = this.items.filter((item) => {
            return item.label.toLowerCase().indexOf(filter) > -1;
        });
    }

    /**
     * Click handler.
     *
     * @param {Event} event
     */
    handleClick(event) {
        let index = event.currentTarget.id.split('-')[0];
        let item = this.items[index];

        /**
         * Select event.
         *
         * @event
         * @name select
         * @param {object[]} item
         * @public
         */
        const selectedEvent = new CustomEvent('select', {
            detail: {
                item
            }
        });
        this.dispatchEvent(selectedEvent);

        this.toggleMenuVisibility();
    }

    /**
     * Clear filtered Items.
     *
     * @param {Event} event
     */
    clearFilter(event) {
        if (!event.target.value) {
            this.filteredItems = this.items;
        }
    }
}
