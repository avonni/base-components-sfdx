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
    observePosition,
    normalizeArray,
    getListHeight
} from 'c/utilsPrivate';

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
        'container',
        'reset'
    ],
    default: 'border'
};

const ICON_SIZES = {
    valid: ['xx-small', 'x-small', 'small', 'medium', 'large'],
    default: 'medium'
};

const ICON_POSITIONS = {
    valid: ['left', 'right'],
    default: 'left'
};

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

const MENU_LENGTHS = {
    valid: ['5-items', '7-items', '10-items'],
    default: '7-items'
};

const MENU_WIDTHS = {
    valid: ['xx-small', 'x-small', 'small', 'medium', 'large'],
    default: 'small'
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
     * The keyboard shortcut for the button menu.
     *
     * @type {string}
     * @public
     */
    @api accessKey;
    /**
     * The assistive text for the button.
     *
     * @type {string}
     * @public
     */
    @api alternativeText;
    /**
     * The name of the icon to be used in the format 'utility:down'.
     *
     * @type {string}
     * @public
     */
    @api iconName;
    /**
     * Optional text to be shown on the button.
     *
     * @type {string}
     * @public
     */
    @api label;
    /**
     * Message displayed while the menu is in the loading state.
     *
     * @type {string}
     * @public
     */
    @api loadingStateAlternativeText;
    /**
     * Text that is displayed when the field is empty, to prompt the user for a valid entry.
     *
     * @type {string}
     * @public
     */
    @api searchInputPlaceholder = DEFAULT_SEARCH_INPUT_PLACEHOLDER;
    /**
     * Displays tooltip text when the mouse moves over the button menu.
     *
     * @type {string}
     * @public
     */
    @api title;
    /**
     * Text to display when the user mouses over or focuses on the button. The tooltip is auto-positioned relative to the button and screen space.
     *
     * @type {string}
     * @public
     */
    @api tooltip;

    _allowSearch = false;
    _buttonSize = BUTTON_SIZES.default;
    _disabled = false;
    _hideCheckMark = false;
    _iconPosition = ICON_POSITIONS.default;
    _iconSize = ICON_SIZES.default;
    _isLoading;
    _items = [];
    _menuAlignment = MENU_ALIGNMENTS.default;
    _menuLength = MENU_LENGTHS.default;
    _menuWidth = MENU_WIDTHS.default;
    _value;
    _variant = BUTTON_VARIANTS.default;

    queryTerm;
    showFooter = true;
    filteredItems = [];
    hoverItem;
    listHeight;
    displayActionIcons = false;

    _dropdownOpened = false;
    _dropdownVisible = false;
    _order;
    _boundingRect = {};

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
        this._connected = true;
    }

    renderedCallback() {
        if (this.footerSlot) {
            this.showFooter = this.footerSlot.assignedElements().length !== 0;
        }
        if (this._dropdownOpened) {
            this.calculateListHeight();
        }
    }

    disconnectedCallback() {
        if (this._deRegistrationCallback) {
            this._deRegistrationCallback();
        }
    }

    /**
     * Footer Slot DOM element
     *
     * @type {HTMLElement}
     */
    get footerSlot() {
        return this.template.querySelector('slot[name=footer]');
    }

    /**
     * Slot DOM element
     *
     * @type {HTMLElement}
     */
    get slot() {
        return this.template.querySelector('slot');
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * If present, display a search box.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get allowSearch() {
        return this._allowSearch;
    }

    set allowSearch(value) {
        this._allowSearch = normalizeBoolean(value);
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
     * If present, the menu cannot be opened by users.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get hideCheckMark() {
        return this._hideCheckMark;
    }

    set hideCheckMark(value) {
        this._hideCheckMark = normalizeBoolean(value);
    }

    /**
     * The size of the button-icon. Valid values include xx-small, x-small, medium, or large.
     *
     * @type {string}
     * @public
     * @default left
     */
    @api
    get iconPosition() {
        return this._iconPosition;
    }

    set iconPosition(iconPosition) {
        this._iconPosition = normalizeString(iconPosition, {
            fallbackValue: ICON_POSITIONS.default,
            validValues: ICON_POSITIONS.valid
        });
    }

    /**
     * The size of the icon. Options include xx-small, x-small, small, medium, or large.
     *
     * @type {string}
     * @public
     * @default medium
     */
    @api
    get iconSize() {
        return this._iconSize;
    }

    set iconSize(iconSize) {
        this._iconSize = normalizeString(iconSize, {
            fallbackValue: ICON_SIZES.default,
            validValues: ICON_SIZES.valid
        });
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
     * Array of item objects.
     *
     * @type {object[]}
     * @public
     */
    @api
    get items() {
        return this._items;
    }

    set items(value) {
        this._items = normalizeArray(value);
        this.filteredItems = this._items;
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
     * Maximum length of the menu. Valid values include 5-items, 7-items and 10-items.
     *
     * @type {string}
     * @default 7-items
     * @public
     */
    @api
    get menuLength() {
        return this._menuLength;
    }

    set menuLength(value) {
        this._menuLength = normalizeString(value, {
            fallbackValue: MENU_LENGTHS.default,
            validValues: MENU_LENGTHS.valid
        });
    }

    /**
     * Minimum width of the menu. Valid values include xx-small, x-small, small, medium and large.
     *
     * @type {string}
     * @default small
     * @public
     */
    @api
    get menuWidth() {
        return this._menuWidth;
    }

    set menuWidth(value) {
        this._menuWidth = normalizeString(value, {
            fallbackValue: MENU_WIDTHS.default,
            validValues: MENU_WIDTHS.valid
        });
    }

    /**
     * If present, a nubbin is present on the menu. A nubbin is a stub that protrudes from the menu item towards the button menu. The nubbin position is based on the menu-alignment.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get nubbin() {
        return this._nubbin;
    }

    set nubbin(value) {
        this._nubbin = normalizeBoolean(value);
    }

    /**
     * Value of the selected item.
     *
     * @public
     * @type {string}
     */
    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }

    /**
     * The variant changes the look of the button. Accepted variants when no label include bare, container, border, border-filled, bare-inverse, and border-inverse. Accepted variants when label include bare, border, brand and reset.
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
     * Deprecated. Use `allow-search` instead.
     *
     * @type {boolean}
     * @default false
     * @deprecated
     */
    @api
    get withSearch() {
        return this._allowSearch;
    }
    set withSearch(value) {
        this._allowSearch = normalizeBoolean(value);
        console.warn(
            'The "with-search" attribute is deprecated. Use "allow-search" instead.'
        );
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Computed list items.
     * @type {object[]}
     */
    get computedListItems() {
        return this.filteredItems.map((item, index) => {
            let { actions, avatar, label, meta, value } = item;
            const key = `item-key-${index}`;
            const metaJoin = meta ? meta.join(' • ') : null;
            const selected = this.value === value;
            const displayFigure = avatar || !this.hideCheckMark;
            const computedItemClass = classSet(
                'slds-listbox__option slds-media slds-media_center slds-listbox__option_plain avonni-dynamic-menu__item_color-background'
            ).add({
                'slds-is-selected': selected
            });
            return {
                actions,
                avatar,
                key,
                label,
                metaJoin,
                selected,
                value,
                computedItemClass,
                displayFigure
            };
        });
    }

    /**
     * Computed button class, when the dynamic menu has a label.
     *
     * @type {string}
     */
    get computedButtonClass() {
        const { variant, order, buttonSize } = this;
        return classSet('')
            .add({
                'slds-button': variant !== 'reset',
                'slds-button_reset avonni-dynamic-menu__button_reset':
                    variant === 'reset',
                'slds-button_stretch': buttonSize === 'stretch',
                'slds-button_first': order === 'first',
                'slds-button_middle': order === 'middle',
                'slds-button_last': order === 'last',
                'slds-button_neutral':
                    variant !== 'brand' &&
                    variant !== 'reset' &&
                    variant !== 'bare',
                'avonni-dynamic-menu__button_border': variant === 'border',
                'avonni-dynamic-menu__button_bare': variant === 'bare',
                'slds-button_brand avonni-dynamic-menu__button_brand':
                    variant === 'brand'
            })
            .toString();
    }

    /**
     * Computed Dropdown class styling.
     *
     * @type {string}
     */
    get computedDropdownClass() {
        return classSet(
            'slds-dropdown slds-popover slds-dynamic-menu avonni-dynamic-menu__dropdown_color-background'
        )
            .add({
                'slds-dropdown_left':
                    this._menuAlignment === 'left' || this.isAutoAlignment(),
                'slds-dropdown_center': this._menuAlignment === 'center',
                'slds-dropdown_right': this._menuAlignment === 'right',
                'slds-dropdown_bottom': this._menuAlignment === 'bottom-center',
                'slds-dropdown_bottom slds-dropdown_right slds-dropdown_bottom-right':
                    this._menuAlignment === 'bottom-right',
                'slds-dropdown_bottom slds-dropdown_left slds-dropdown_bottom-left':
                    this._menuAlignment === 'bottom-left',
                'slds-nubbin_top-left':
                    this._menuAlignment === 'left' && this._nubbin,
                'slds-nubbin_top-right':
                    this._menuAlignment === 'right' && this._nubbin,
                'slds-nubbin_top':
                    this._menuAlignment === 'center' && this._nubbin,
                'slds-nubbin_bottom-left':
                    this._menuAlignment === 'bottom-left' && this._nubbin,
                'slds-nubbin_bottom-right':
                    this._menuAlignment === 'bottom-right' && this._nubbin,
                'slds-nubbin_bottom':
                    this._menuAlignment === 'bottom-center' && this._nubbin,
                'slds-p-vertical_large': this.isLoading
            })
            .add(`slds-dropdown_${this._menuWidth}`)
            .toString();
    }

    /**
     * Verify if there's Items to display.
     *
     * @type {boolean}
     */
    get showItems() {
        return this.computedListItems.length;
    }

    /**
     * Verify if the icon position is left.
     *
     * @type {boolean}
     */
    get iconIsLeft() {
        return this._iconPosition === 'left' && this.iconName;
    }

    /**
     * Verify if the icon position is right.
     *
     * @type {boolean}
     */
    get iconIsRight() {
        return this._iconPosition === 'right' && this.iconName;
    }

    /**
     * Computed Aria Expanded from dropdown menu.
     *
     * @type {string}
     */
    get computedAriaExpanded() {
        return String(this._dropdownVisible);
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Set focus on the button.
     *
     * @public
     */
    @api
    focus() {
        if (this._connected) {
            this.focusOnButton();
        }
        /**
         * Focus event
         *
         * @event
         * @name focus
         */
        this.dispatchEvent(new CustomEvent('focus'));
    }

    /**
     * Simulates a mouse click on the button.
     *
     * @public
     */
    @api
    click() {
        if (this._connected) {
            if (this.label) {
                this.template
                    .querySelector('[data-element-id="button"]')
                    .click();
            } else {
                this.template
                    .querySelector('[data-element-id="lightning-button-icon"]')
                    .click();
            }
        }
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Return the list height.
     *
     * @type {string}
     */
    calculateListHeight() {
        let height = 0;
        let length = 7;
        if (this._menuLength === '5-items') {
            length = 5;
        } else if (this._menuLength === '10-items') {
            length = 10;
        }

        const items = this.template.querySelectorAll(
            '[data-element-id="item"]'
        );

        if (items) {
            height += getListHeight(items, length);
        }
        this.listHeight = `max-height: ${height}px; overflow-y: auto;`;
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
            this.template.querySelector('[data-element-id="button"]').focus();
        } else {
            this.template
                .querySelector('[data-element-id="lightning-button-icon"]')
                .focus();
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
                 * The event fired when you open the dropdown menu.
                 *
                 * @event
                 * @name open
                 * @public
                 */
                this.dispatchEvent(new CustomEvent('open'));
                this._boundingRect = this.getBoundingClientRect();
                this.pollBoundingRect();
            } else {
                /**
                 * The event fired when you close the dropdown menu.
                 *
                 * @event
                 * @name close
                 * @public
                 */
                this.dispatchEvent(new CustomEvent('close'));
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
                if (this._connected) {
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
            return (
                item.label.toLowerCase().indexOf(filter) > -1 ||
                item.value.toLowerCase().indexOf(filter) > -1
            );
        });
    }

    /**
     * Click handler.
     *
     * @param {Event} event
     */
    handleItemClick(event) {
        let target = event.target.getAttribute('data-element-id');
        let value = event.currentTarget.getAttribute('data-value');
        if (target === 'action') {
            /**
             * The event fired when a user clicks on an action.
             *
             * @event
             * @name actionclick
             * @param {string} name Name of the action clicked.
             * @param {string} item The value of the item.
             * @public
             */
            this.dispatchEvent(
                new CustomEvent('actionclick', {
                    detail: {
                        name: event.target.name,
                        item: value
                    }
                })
            );
        } else {
            /**
             * Select event.
             *
             * @event
             * @name select
             * @param {string} value The value of the selected item.
             * @cancelable
             * @public
             */
            this.dispatchEvent(
                new CustomEvent('select', {
                    cancelable: true,
                    detail: {
                        value
                    }
                })
            );
            this._value = value;
        }

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

    /**
     * Mouse Enter handler. Adds display action class.
     *
     * @param {Event} event
     */
    handleOptionMouseEnter(event) {
        event.currentTarget.classList.add(
            'avonni-dynamic-menu__display_action'
        );
    }

    /**
     * Mouse Enter handler. Removes display action class.
     *
     * @param {Event} event
     */
    handleOptionMouseLeave(event) {
        event.currentTarget.classList.remove(
            'avonni-dynamic-menu__display_action'
        );
    }
}
