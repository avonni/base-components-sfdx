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
    buttonGroupOrderClass
} from 'c/utilsPrivate';

import { Tooltip } from 'c/tooltipLibrary';

const i18n = {
    loading: 'Loading',
    showMenu: 'Show Menu'
};

const menuItemCSSClassName = 'slds-dropdown__item';
const menuItemCSSSelector = `.slds-dropdown__list .${menuItemCSSClassName}`;

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

const ICON_SIZES = {
    valid: ['xx-small', 'x-small', 'small', 'medium'],
    default: 'medium'
};

const BUTTON_VARIANTS = {
    valid: [
        'brand',
        'bare',
        'bare-inverse',
        'container',
        'border',
        'border-filled',
        'border-inverse'
    ],
    default: 'border'
};

const DEFAULT_ICON_NAME = 'utility:down';

/**
 * @class
 * @descriptor avonni-button-menu
 * @storyId example-button-menu--base
 * @public
 */
export default class AvonniButtonMenu extends LightningElement {
    static delegatesFocus = true;
    /**
     * The assistive text for the button menu.
     *
     * @public
     * @type {string}
     * @default Show Menu
     */
    @api alternativeText = i18n.showMenu;
    /**
     * Describes the reason for showing the draft indicator. This is required when is-draft is true.
     *
     * @public
     * @type {string}
     */
    @api draftAlternativeText;
    /**
     * Reserved for internal use only.
     * Describes the order of this element (first, middle or last) inside a lightning-button-group.
     *
     * @type {string}
     * @public
     */
    @api groupOrder;
    /**
     * Optional text to be shown on the button.
     *
     * @public
     * @type {string}
     */
    @api label;
    /**
     * Message displayed while the menu is in the loading state.
     *
     * @public
     * @type {string}
     * @default Loading
     */
    @api loadingStateAlternativeText = i18n.loading;
    /**
     * The value for the button element. This value is optional and can be used when submitting a form.
     *
     * @public
     * @type {string}
     */
    @api value = '';

    _accesskey;
    _disabled = false;
    _iconSize = ICON_SIZES.default;
    _isDraft = false;
    _isLoading = false;
    _menuAlignment = MENU_ALIGNMENTS.default;
    _nubbin = false;
    _title;
    _tooltip;
    _variant = BUTTON_VARIANTS.default;

    _iconName = DEFAULT_ICON_NAME;
    _hideDownArrow = false;
    _order = null;

    _boundingRect = {};
    _dropdownVisible = false;
    _dropdownOpened = false;
    _focusOnIndexDuringRenderedCallback = null;
    _positioning = false;
    _rerenderFocus = true;
    _tabindex = 0;

    _needsFocusAfterRender = false;

    connectedCallback() {
        this.classList.add(
            'slds-dropdown-trigger',
            'slds-dropdown-trigger_click'
        );

        if (this.isDraft) {
            this.classList.add('slds-is-unsaved');
        }

        /**
         * @event
         * @name privatebuttonregister
         * @param {object}
         * @private
         * @bubbles
         */
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

    disconnectedCallback() {
        if (this._deRegistrationCallback) {
            this._deRegistrationCallback();
        }
    }

    renderedCallback() {
        this.initTooltip();

        if (
            !this._positioning &&
            this._dropdownVisible &&
            this._rerenderFocus
        ) {
            this.focusOnMenuItemAfterRender();
        }
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * The keyboard shortcut for the button menu.
     *
     * @public
     * @type {string}
     */
    @api
    get accessKey() {
        return this._accesskey;
    }

    set accessKey(newValue) {
        this._accesskey = newValue;
    }

    /**
     * If present, the menu can't be opened by users.
     *
     * @public
     * @type {boolean}
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
     * The name of the icon to be used in the format 'utility:down'. If an icon other than 'utility:down' or 'utility:chevrondown' is used, a utility:down icon is appended to the right of that icon.
     *
     * @public
     * @type {string}
     * @default utility:down
     */
    @api
    get iconName() {
        return this._iconName;
    }

    set iconName(icon) {
        this._iconName = normalizeString(icon);
    }

    /**
     * The size of the icon. Options include xx-small, x-small, small, or medium.
     *
     * @public
     * @type {string}
     * @default medium
     */
    @api
    get iconSize() {
        return this._iconSize;
    }

    set iconSize(size) {
        this._iconSize = normalizeString(size, {
            fallbackValue: ICON_SIZES.default,
            validValues: ICON_SIZES.valid
        });
    }

    /**
     * If present, the menu trigger shows a draft indicator.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get isDraft() {
        return this._isDraft;
    }

    set isDraft(value) {
        this._isDraft = normalizeBoolean(value);
    }

    /**
     * If true, the menu is in a loading state and shows a spinner.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get isLoading() {
        return this._isLoading;
    }

    set isLoading(value) {
        const normalizedValue = normalizeBoolean(value);
        if (this.isAutoAlignment()) {
            this.stopPositioning();
        }

        this._isLoading = normalizedValue;
    }

    /**
     * Determines the alignment of the menu relative to the button. Available options are: auto, left, center, right, bottom-left, bottom-center, bottom-right. The auto option aligns the dropdown menu based on available space.
     *
     * @public
     * @type {string}
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
     * If present, the small down arrow normaly displayed to the right of a custom icon is hidden. Without a custom icon-name this does nothing.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get hideDownArrow() {
        return this._hideDownArrow;
    }

    set hideDownArrow(value) {
        this._hideDownArrow = normalizeBoolean(value);
    }

    /**
     * Displays title text when the mouse moves over the button menu.
     *
     * @public
     * @type {string}
     */
    @api
    get title() {
        return this._title;
    }

    set title(newValue) {
        this._title = newValue;
    }

    /**
     * Text to display when the user mouses over or focuses on the button. The tooltip is auto-positioned relative to the button and screen space.
     *
     * @public
     * @type {string}
     */
    @api
    get tooltip() {
        return this._tooltip ? this._tooltip.value : undefined;
    }

    // remove-next-line-for-c-namespace
    set tooltip(value) {
        if (this._tooltip) {
            this._tooltip.value = value;
        } else if (value) {
            // Note that because the tooltip target is a child element it may not be present in the
            // dom during initial rendering.
            this._tooltip = new Tooltip(value, {
                root: this,
                target: () =>
                    this.template.querySelector('[data-element-id="button"]')
            });
            this._tooltip.initialize();
        }
    }

    /**
     * The variant changes the look of the button. Accepted variants include brand, bare, container, border, border-filled, bare-inverse, and border-inverse.
     *
     * @public
     * @type {string}
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

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    get computedAriaExpanded() {
        return String(this._dropdownVisible);
    }

    /**
     * Computed button class styling.
     *
     * @type {string}
     */
    get computedButtonClass() {
        const isDropdownIcon = !this.computedShowDownIcon;
        const isBare =
            this.variant === 'bare' || this.variant === 'bare-inverse';

        const classes = classSet('slds-button');
        classes.add(buttonGroupOrderClass(this.groupOrder));

        if (this.label) {
            classes.add({
                'slds-button_neutral':
                    this.variant === 'border' ||
                    this.variant === 'border-filled',
                'slds-button_inverse': this.variant === 'border-inverse',
                'slds-button_icon-inverse': this.variant === 'bare-inverse',
                'slds-button_brand': this.variant === 'brand'
            });
        } else {
            const useMoreContainer =
                this.variant === 'container' ||
                this.variant === 'bare-inverse' ||
                this.variant === 'border-inverse';

            classes.add({
                'slds-button_icon': !isDropdownIcon,
                'slds-button_icon-bare': isBare,
                'slds-button_icon-more': !useMoreContainer && !isDropdownIcon,
                'slds-button_icon-container-more':
                    useMoreContainer && !isDropdownIcon,
                'slds-button_icon-brand slds-button_icon':
                    this.variant === 'brand',
                'slds-button_icon-container':
                    this.variant === 'container' && isDropdownIcon,
                'slds-button_icon-border':
                    this.variant === 'border' && isDropdownIcon,
                'slds-button_icon-border-filled avonni-button-menu_button-border-filled':
                    this.variant === 'border-filled',
                'slds-button_icon-border-inverse':
                    this.variant === 'border-inverse',
                'slds-button_icon-inverse': this.variant === 'bare-inverse',
                'slds-button_icon-xx-small':
                    this.iconSize === 'xx-small' && !isBare,
                'slds-button_icon-x-small':
                    this.iconSize === 'x-small' && !isBare,
                'slds-button_icon-small': this.iconSize === 'small' && !isBare
            });
        }

        return classes.add(`slds-button_${this._order}`).toString();
    }

    /**
     * Computed dropdown class styling.
     *
     * @type {string}
     */
    get computedDropdownClass() {
        return classSet('slds-dropdown')
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
                'slds-nubbin_top-left':
                    this.nubbin && this.menuAlignment === 'left',
                'slds-nubbin_top-right':
                    this.nubbin && this.menuAlignment === 'right',
                'slds-nubbin_top':
                    this.nubbin && this.menuAlignment === 'center',
                'slds-nubbin_bottom-left':
                    this.nubbin && this.menuAlignment === 'bottom-left',
                'slds-nubbin_bottom-right':
                    this.nubbin && this.menuAlignment === 'bottom-right',
                'slds-nubbin_bottom':
                    this.nubbin && this.menuAlignment === 'bottom-center',
                'slds-p-vertical_large': this.isLoading
            })
            .toString();
    }

    /**
     * Show downwards icon on button.
     *
     * @type {boolean}
     */
    get computedShowDownIcon() {
        if (this.hideDownArrow) {
            return false;
        }
        return !(
            this.iconName === 'utility:down' ||
            this.iconName === 'utility:chevrondown'
        );
    }

    /**
     * Computed access key.
     *
     * @type {string}
     */
    get computedAccessKey() {
        return this._accesskey;
    }

    /**
     * Computed title.
     *
     * @type {string}
     */
    get computedTitle() {
        return this._title;
    }

    /**
     * Computed alternative text.
     *
     * @type {string}
     */
    get computedAlternativeText() {
        return this.alternativeText || i18n.showMenu;
    }

    /**
     * Computed loading state default or loading state alternative text.
     *
     * @type {string}
     */
    get computedLoadingStateAlternativeText() {
        return this.loadingStateAlternativeText || i18n.loading;
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
    }

    /**
     * Simulate a mouse click on the button.
     *
     * @public
     */
    @api
    click() {
        if (this._connected) {
            this.template.querySelector('[data-element-id="button"]').click();
        }
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Tooltip initialization.
     */
    initTooltip() {
        if (this._tooltip && !this._tooltip.initialized) {
            this._tooltip.initialize();
        }
    }

    /**
     * Return focus on menu item after render.
     */
    focusOnMenuItemAfterRender() {
        let focusOnIndex = this._focusOnIndexDuringRenderedCallback || 0;

        const menuItems = this.getMenuItems();

        if (focusOnIndex === 'LAST') {
            focusOnIndex = menuItems.length - 1;

            if (focusOnIndex < 0) {
                focusOnIndex = 'LAST';
            }
        }

        if (focusOnIndex !== 'LAST') {
            if (focusOnIndex > menuItems.length - 1 && menuItems.length > 0) {
                focusOnIndex = menuItems.length - 1;
            }

            this.focusOnMenuItem(focusOnIndex);

            this._focusOnIndexDuringRenderedCallback = null;
        }

        this._rerenderFocus = false;
    }

    /**
     * Menu item selector handler.
     *
     * @param {Event} event
     */
    handleMenuItemPrivateSelect(event) {
        if (event.detail.type === 'submenu') {
            event.target.parentElement
                .querySelectorAll('.avonni-submenu')
                .forEach((submenu) => {
                    submenu.close();
                });
            if (!this._dropdownVisible) {
                this.toggleMenuVisibility();
                event.target.focus();
            }
        } else {
            if (this._dropdownVisible) {
                this.toggleMenuVisibility();
                this.focusOnButton();
            }
        }

        event.stopPropagation();

        if (event.detail.type === 'dialog') {
            let dialog = this.querySelector(
                '[dialog-name=' + event.detail.value + ']'
            );
            if (dialog) {
                dialog.show();
                this.template
                    .querySelector('[data-element-id="button"]')
                    .blur();
            }
        }

        this.dispatchSelect(event);
    }

    /**
     * Menu item select dispatch method.
     *
     * @param {Event} event
     */
    dispatchSelect(event) {
        /**
         * The event fired when a menu item is selected.
         *
         * @event
         * @name select
         * @param {string} value Value of the selected option.
         * @public
         * @cancelable
         */
        this.dispatchEvent(
            new CustomEvent('select', {
                cancelable: true,
                detail: {
                    value: event.detail.value
                }
            })
        );
    }

    /**
     * Button click handler.
     */
    handleButtonClick() {
        this.allowBlur();

        this.toggleMenuVisibility();

        this.focusOnButton();
    }

    /**
     * Button mouse down handler.
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
     * Dropdown menu mouse down handler.
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
     * Dropdown menu mouse up handler.
     */
    handleDropdownMouseUp() {
        this.allowBlur();
    }

    /**
     * Dropdown menu mouse leave handler.
     */
    handleDropdownMouseLeave() {
        if (!this._menuHasFocus) {
            this.close();
        }
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
     * Button focus.
     */
    focusOnButton() {
        this.template.querySelector('[data-element-id="button"]').focus();
    }

    /**
     * Set focus on menu item via Item Index.
     *
     * @param {object} itemIndex
     */
    focusOnMenuItem(itemIndex) {
        if (this._dropdownVisible) {
            const menuItem = this.getMenuItemByIndex(itemIndex);
            this.cancelBlurAndFocusOnMenuItem(menuItem);
        }
    }

    /**
     * Auto alignment handler.
     *
     * @return {boolean}
     */
    isAutoAlignment() {
        return this.menuAlignment.startsWith('auto');
    }

    /**
     * Menu visibility toggle handler.
     */
    toggleMenuVisibility() {
        if (!this.disabled) {
            this._dropdownVisible = !this._dropdownVisible;
            this._rerenderFocus = !this._rerenderFocus;

            if (!this._dropdownVisible) {
                this.querySelectorAll('.avonni-submenu').forEach((submenu) => {
                    submenu.close();
                });
            }

            if (!this._dropdownOpened && this._dropdownVisible) {
                this._dropdownOpened = true;
            }

            if (this._dropdownVisible) {
                /**
                 * The event fired when the dropdown menu is opened.
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
                 * The event fired when the dropdown menu is closed.
                 *
                 * @event
                 * @name close
                 * @public
                 */
                this.dispatchEvent(new CustomEvent('close'));
            }

            this.classList.toggle('slds-is-open');
        }
    }

    /**
     * Get item array from menu.
     *
     * @return {object[]}
     */
    getMenuItems() {
        return Array.from(this.querySelectorAll(menuItemCSSSelector));
    }

    /**
     * Get item with index in menu item array.
     *
     * @param {object[]} index
     * @return menu item from array
     */
    getMenuItemByIndex(index) {
        return this.getMenuItems()[index];
    }

    /**
     * Find menu item's index.
     *
     * @param {object} menuItemElement
     * @returns {number} index of menu item
     */
    findMenuItemIndex(menuItemElement) {
        return this.getMenuItems().indexOf(menuItemElement);
    }

    /**
     * Find menu item from event target.
     *
     * @param {Element} element
     * @returns {Element} menu item
     */
    findMenuItemFromEventTarget(element) {
        let currentNode = element;
        const stopAtElement = this.template.querySelector("[role='menu']");

        while (currentNode !== stopAtElement) {
            if (
                currentNode.classList &&
                currentNode.classList.contains(menuItemCSSClassName)
            ) {
                return currentNode;
            }
            if (currentNode.parentNode) {
                currentNode = currentNode.parentNode;
            } else {
                return null;
            }
        }
        return null;
    }

    /**
     * Menu item mouse over handler.
     *
     * @param {Event} event
     */
    handleMouseOverOnMenuItem(event) {
        const menuItem = this.findMenuItemFromEventTarget(event.target);

        if (event.target.classList.value.indexOf('avonni-submenu') === -1) {
            event.target.parentElement
                .querySelectorAll('.avonni-submenu')
                .forEach((submenu) => {
                    submenu.close();
                });
        }

        if (menuItem) {
            const menuItemIndex = this.findMenuItemIndex(menuItem);
            this.focusOnMenuItem(menuItemIndex);
        }
    }

    /**
     * Blur cancel and set focus on menu item.
     *
     * @param {object} menuItem
     */
    cancelBlurAndFocusOnMenuItem(menuItem) {
        if (menuItem) {
            this.cancelBlur();
            menuItem.focus();
        }
    }

    /**
     * Focus handler.
     */
    handleFocus() {
        /**
         * @event
         * @name focus
         */
        this.dispatchEvent(new CustomEvent('focus'));
    }

    /**
     * Private blur handler.
     *
     * @param {Event} event
     */
    handlePrivateBlur(event) {
        event.stopPropagation();

        this.handleBlur();
        this._menuHasFocus = false;
    }

    /**
     * Private focus handler.
     *
     * @param {Event} event
     */
    handlePrivateFocus(event) {
        event.stopPropagation();

        this.allowBlur();
        this._menuHasFocus = true;
    }

    /**
     * Blur handler.
     */
    handleBlur() {
        if (this._cancelBlur) {
            return;
        }

        if (this._dropdownVisible) {
            this.toggleMenuVisibility();
        }
        this.dispatchEvent(new CustomEvent('blur'));
    }

    /**
     * Allow blur.
     */
    allowBlur() {
        this._cancelBlur = false;
    }

    /**
     * Cancel blur.
     */
    cancelBlur() {
        this._cancelBlur = true;
    }

    /**
     * Set button order.
     *
     * @param {object} order
     */
    setOrder(order) {
        this._order = order;
    }

    /**
     * Close menu.
     */
    close() {
        if (this._dropdownVisible) {
            this.toggleMenuVisibility();
        }
    }

    /**
     * Poll bounding rect position for button menu.
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
}
