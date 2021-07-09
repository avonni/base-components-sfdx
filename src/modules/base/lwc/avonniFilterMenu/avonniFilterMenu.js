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
    normalizeBoolean,
    normalizeString,
    normalizeArray,
    observePosition,
    animationFrame,
    timeout
} from 'c/utilsPrivate';
import { classSet } from 'c/utils';
import { Tooltip } from 'c/tooltipLibrary';
import {
    Direction,
    startPositioning,
    stopPositioning
} from 'c/positionLibrary';

import filterMenuVertical from './avonniFilterMenuVertical.html';
import filterMenu from './avonniFilterMenu.html';

const ICON_SIZES = {
    valid: ['xx-small', 'x-small', 'small', 'medium', 'large'],
    default: 'medium'
};

const MENU_ALIGNMENTS = {
    valid: [
        'auto',
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
        'bare',
        'container',
        'border',
        'border-filled',
        'bare-inverse',
        'border-inverse'
    ],
    default: 'border'
};

const MENU_VARIANTS = {
    valid: ['horizontal', 'vertical'],
    default: 'horizontal'
};

const MENU_WIDTHS = {
    valid: ['xx-small', 'x-small', 'small', 'medium', 'large'],
    default: 'small'
};

const MENU_LENGTHS = {
    valid: ['5-items', '7-items', '10-items'],
    default: '7-items'
};

const i18n = {
    loading: 'Loading',
    showMenu: 'Show Menu'
};

const DEFAULT_ICON_NAME = 'utility:down';
const DEFAULT_SEARCH_INPUT_PLACEHOLDER = 'Search...';
const DEFAULT_APPLY_BUTTON_LABEL = 'Apply';
const DEFAULT_RESET_BUTTON_LABEL = 'Reset';

export default class AvonniFilterMenu extends LightningElement {
    @api accessKey;
    @api label;
    @api title;

    _alternativeText = i18n.showMenu;
    _loadingStateAlternativeText = i18n.loading;
    _tooltip;
    _disabled = false;
    _iconName = DEFAULT_ICON_NAME;
    _iconSize = ICON_SIZES.default;
    _isLoading = false;
    _items = [];
    _dropdownAlignment = MENU_ALIGNMENTS.default;
    _dropdownNubbin = false;
    _value = [];
    _variant = MENU_VARIANTS.default;
    _buttonVariant = BUTTON_VARIANTS.default;
    _searchInputPlaceholder = DEFAULT_SEARCH_INPUT_PLACEHOLDER;
    _showSearchBox = false;
    _applyButtonLabel = DEFAULT_APPLY_BUTTON_LABEL;
    _resetButtonLabel = DEFAULT_RESET_BUTTON_LABEL;
    _hideApplyResetButtons = false;
    _dropdownWidth = MENU_WIDTHS.default;
    _dropdownLength = MENU_LENGTHS.default;
    _hideSelectedItems = false;

    _cancelBlur = false;
    _dropdownVisible = false;
    _order;

    @track computedItems = [];
    @track selectedItems = [];
    dropdownOpened = false;
    fieldLevelHelp;

    connectedCallback() {
        // button-group necessities
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

    disconnectedCallback() {
        if (this._deRegistrationCallback) {
            this._deRegistrationCallback();
        }
    }

    renderedCallback() {
        if (this._variant === 'horizontal') {
            this.classList.add(
                'slds-dropdown-trigger',
                'slds-dropdown-trigger_click'
            );
        } else {
            this.classList.remove(
                'slds-dropdown-trigger',
                'slds-dropdown-trigger_click'
            );
        }
        
        this.initTooltip();
    }

    render() {
        if (this.variant === 'vertical') {
            return filterMenuVertical;
        }
        return filterMenu;
    }

    @api
    get alternativeText() {
        return this._alternativeText;
    }
    set alternativeText(value) {
        this._alternativeText =
            typeof value === 'string' ? value.trim() : i18n.showMenu;
    }

    @api
    get loadingStateAlternativeText() {
        return this._loadingStateAlternativeText;
    }
    set loadingStateAlternativeText(value) {
        this._loadingStateAlternativeText =
            typeof value === 'string' ? value.trim() : i18n.loading;
    }

    @api
    get tooltip() {
        return this._tooltip ? this._tooltip.value : undefined;
    }

    set tooltip(value) {
        // Used instead of the tooltip in vertical variant
        this.fieldLevelHelp = value;

        if (this._tooltip) {
            this._tooltip.value = value;
        } else if (value) {
            // Note that because the tooltip target is a child element it may not be present in the
            // dom during initial rendering.
            this._tooltip = new Tooltip(value, {
                root: this,
                target: () => this.template.querySelector('button')
            });
            this._tooltip.initialize();
        }
    }

    @api
    get disabled() {
        return this._disabled;
    }
    set disabled(bool) {
        this._disabled = normalizeBoolean(bool);
    }

    @api
    get iconName() {
        return this._iconName;
    }
    set iconName(value) {
        this._iconName =
            value && typeof value === 'string'
                ? value.trim()
                : DEFAULT_ICON_NAME;
    }

    @api
    get iconSize() {
        return this._iconSize;
    }
    set iconSize(value) {
        this._iconSize = normalizeString(value, {
            fallbackValue: ICON_SIZES.default,
            validValues: ICON_SIZES.valid
        });
    }

    @api
    get isLoading() {
        return this._isLoading;
    }
    set isLoading(bool) {
        const normalizedValue = normalizeBoolean(bool);
        if (this.isAutoAlignment()) {
            // stop previous positioning if any as it maintains old position relationship
            this.stopPositioning();

            if (this._isLoading && !normalizedValue) {
                // was loading before and now is not, we need to reposition
                this.startPositioning();
            }
        }

        this._isLoading = normalizedValue;
    }

    @api
    get items() {
        return this._items;
    }
    set items(proxy) {
        this._items = normalizeArray(proxy);
        this.computedItems = JSON.parse(JSON.stringify(this._items));

        this.computeValue();
        this.computeSelectedItems();
        this.computeTabindex();
    }

    @api
    get value() {
        return this._value;
    }
    set value(proxy) {
        const array = normalizeArray(proxy);
        this._value = JSON.parse(JSON.stringify(array));

        this.computeValue();
        this.computeSelectedItems();
    }

    @api
    get variant() {
        return this._variant;
    }
    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: MENU_VARIANTS.default,
            validValues: MENU_VARIANTS.valid
        });
    }

    @api
    get buttonVariant() {
        return this._buttonVariant;
    }
    set buttonVariant(value) {
        this._buttonVariant = normalizeString(value, {
            fallbackValue: BUTTON_VARIANTS.default,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    @api
    get searchInputPlaceholder() {
        return this._searchInputPlaceholder;
    }
    set searchInputPlaceholder(value) {
        this._searchInputPlaceholder =
            value && typeof value === 'string'
                ? value.trim()
                : DEFAULT_SEARCH_INPUT_PLACEHOLDER;
    }

    @api
    get showSearchBox() {
        return this._showSearchBox;
    }
    set showSearchBox(bool) {
        this._showSearchBox = normalizeBoolean(bool);
    }

    @api
    get applyButtonLabel() {
        return this._applyButtonLabel;
    }
    set applyButtonLabel(value) {
        this._applyButtonLabel =
            value && typeof value === 'string'
                ? value.trim()
                : DEFAULT_APPLY_BUTTON_LABEL;
    }

    @api
    get resetButtonLabel() {
        return this._resetButtonLabel;
    }
    set resetButtonLabel(value) {
        this._resetButtonLabel =
            value && typeof value === 'string'
                ? value.trim()
                : DEFAULT_RESET_BUTTON_LABEL;
    }

    @api
    get hideApplyResetButtons() {
        return this._hideApplyResetButtons;
    }
    set hideApplyResetButtons(bool) {
        this._hideApplyResetButtons = normalizeBoolean(bool);
    }

    @api
    get dropdownAlignment() {
        return this._dropdownAlignment;
    }
    set dropdownAlignment(value) {
        this._dropdownAlignment = normalizeString(value, {
            fallbackValue: MENU_ALIGNMENTS.default,
            validValues: MENU_ALIGNMENTS.valid
        });
    }

    @api
    get dropdownWidth() {
        return this._dropdownWidth;
    }
    set dropdownWidth(value) {
        this._dropdownWidth = normalizeString(value, {
            fallbackValue: MENU_WIDTHS.default,
            validValues: MENU_WIDTHS.valid
        });
    }

    @api
    get dropdownLength() {
        return this._dropdownLength;
    }
    set dropdownLength(value) {
        this._dropdownLength = normalizeString(value, {
            fallbackValue: MENU_LENGTHS.default,
            validValues: MENU_LENGTHS.valid
        });
    }

    @api
    get dropdownNubbin() {
        return this._dropdownNubbin;
    }
    set dropdownNubbin(bool) {
        this._dropdownNubbin = normalizeBoolean(bool);
    }

    @api
    get hideSelectedItems() {
        return this._hideSelectedItems;
    }
    set hideSelectedItems(bool) {
        this._hideSelectedItems = normalizeBoolean(bool);
    }

    get checkboxComputedItems() {
        return this.computedItems.filter((item) => !item.hidden);
    }

    get computedShowDownIcon() {
        return !(
            this.iconName === 'utility:down' ||
            this.iconName === 'utility:chevrondown'
        );
    }

    get computedAriaExpanded() {
        return String(this._dropdownVisible); // default value must be a string for the attribute to always be present with a string value
    }

    get computedButtonClass() {
        const isDropdownIcon = !this.computedShowDownIcon;
        const isBare =
            this.buttonVariant === 'bare' ||
            this.buttonVariant === 'bare-inverse';

        const classes = classSet('slds-button');

        if (this.label) {
            classes.add({
                'slds-button_neutral': this.buttonVariant === 'border',
                'slds-button_inverse': this.buttonVariant === 'border-inverse'
            });
        } else {
            // The inverse check is to allow for a combination of a non-default icon and an -inverse buttonVariant
            const useMoreContainer =
                this.buttonVariant === 'container' ||
                this.buttonVariant === 'bare-inverse' ||
                this.buttonVariant === 'border-inverse';

            classes.add({
                'slds-button_icon': !isDropdownIcon,
                'slds-button_icon-bare': isBare,
                'slds-button_icon-more': !useMoreContainer && !isDropdownIcon,
                'slds-button_icon-container-more':
                    useMoreContainer && !isDropdownIcon,
                'slds-button_icon-container':
                    this.buttonVariant === 'container' && isDropdownIcon,
                'slds-button_icon-border':
                    this.buttonVariant === 'border' && isDropdownIcon,
                'slds-button_icon-border-filled':
                    this.buttonVariant === 'border-filled',
                'slds-button_icon-border-inverse':
                    this.buttonVariant === 'border-inverse',
                'slds-button_icon-inverse':
                    this.buttonVariant === 'bare-inverse',
                'slds-button_icon-xx-small':
                    this.iconSize === 'xx-small' && !isBare,
                'slds-button_icon-x-small':
                    this.iconSize === 'x-small' && !isBare,
                'slds-button_icon-small': this.iconSize === 'small' && !isBare,
                'slds-button_icon-large': this.iconSize === 'large' && !isBare
            });
        }

        return classes
            .add({
                // order classes when part of a button-group
                'slds-button_first': this._order === 'first',
                'slds-button_middle': this._order === 'middle',
                'slds-button_last': this._order === 'last'
            })
            .toString();
    }

    get computedDropdownClass() {
        return classSet('slds-dropdown')
            .add({
                'slds-dropdown_left':
                    this.dropdownAlignment === 'left' || this.isAutoAlignment(),
                'slds-dropdown_center': this.dropdownAlignment === 'center',
                'slds-dropdown_right': this.dropdownAlignment === 'right',
                'slds-dropdown_bottom':
                    this.dropdownAlignment === 'bottom-center',
                'slds-dropdown_bottom slds-dropdown_right slds-dropdown_bottom-right':
                    this.dropdownAlignment === 'bottom-right',
                'slds-dropdown_bottom slds-dropdown_left slds-dropdown_bottom-left':
                    this.dropdownAlignment === 'bottom-left',
                'slds-nubbin_top-left':
                    this.dropdownNubbin && this.dropdownAlignment === 'left',
                'slds-nubbin_top-right':
                    this.dropdownNubbin && this.dropdownAlignment === 'right',
                'slds-nubbin_top':
                    this.dropdownNubbin && this.dropdownAlignment === 'center',
                'slds-nubbin_bottom-left':
                    this.dropdownNubbin &&
                    this.dropdownAlignment === 'bottom-left',
                'slds-nubbin_bottom-right':
                    this.dropdownNubbin &&
                    this.dropdownAlignment === 'bottom-right',
                'slds-nubbin_bottom':
                    this.dropdownNubbin &&
                    this.dropdownAlignment === 'bottom-center',
                'slds-p-vertical_large': this.isLoading,
                'slds-dropdown_xx-small': this.dropdownWidth === 'xx-small',
                'slds-dropdown_x-small': this.dropdownWidth === 'x-small',
                'slds-dropdown_small': this.dropdownWidth === 'small',
                'slds-dropdown_medium': this.dropdownWidth === 'medium',
                'slds-dropdown_large': this.dropdownWidth === 'large'
            })
            .toString();
    }

    get computedItemListClass() {
        return classSet('slds-dropdown__list').add({
            'slds-dropdown_length-with-icon-5':
                this.dropdownLength === '5-items',
            'slds-dropdown_length-with-icon-7':
                this.dropdownLength === '7-items',
            'slds-dropdown_length-with-icon-10':
                this.dropdownLength === '10-items'
        });
    }

    get showSelectedItems() {
        return !this.hideSelectedItems && this.selectedItems.length > 0;
    }

    @api
    focus() {
        if (this.variant === 'vertical') {
            this.template.querySelector('lightning-checkbox-group').focus();
        } else {
            this.template.querySelector('button').focus();
        }
    }

    @api
    apply() {
        this.computeSelectedItems();
        this.close();
    }

    @api
    clear() {
        this._value = [];
        this.computeValue();
        this.computeSelectedItems();
    }

    computeTabindex() {
        let firstFocusableItem;
        this.computedItems.forEach((item) => {
            if (!firstFocusableItem && !item.disabled) {
                firstFocusableItem = true;
                item.tabindex = '0';
            } else {
                item.tabindex = '-1';
            }
        });
    }

    computeValue() {
        this.computedItems.forEach((item) => {
            if (this.value.indexOf(item.value) > -1) {
                item.checked = true;
            } else {
                item.checked = false;
            }
        });
    }

    computeSelectedItems() {
        const selectedItems = [];
        this.computedItems.forEach((item) => {
            if (item.checked) {
                selectedItems.push({
                    label: item.label,
                    name: item.value
                });
            }
        });
        this.selectedItems = selectedItems;
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

    initTooltip() {
        if (this._tooltip && !this._tooltip.initialized) {
            this._tooltip.initialize();
        }
    }

    setOrder(order) {
        this._order = order;
    }

    isAutoAlignment() {
        return this.dropdownAlignment.startsWith('auto');
    }

    startPositioning() {
        if (!this.isAutoAlignment()) {
            return Promise.resolve();
        }

        this._positioning = true;

        const align = {
            horizontal: Direction.Left,
            vertical: Direction.Top
        };

        const targetAlign = {
            horizontal: Direction.Left,
            vertical: Direction.Bottom
        };

        let autoFlip = true;
        let autoFlipVertical;

        return animationFrame()
            .then(() => {
                this.stopPositioning();
                this._autoPosition = startPositioning(
                    this,
                    {
                        target: () => this.template.querySelector('button'),
                        element: () =>
                            this.template.querySelector('.slds-dropdown'),
                        align,
                        targetAlign,
                        autoFlip,
                        autoFlipVertical,
                        scrollableParentBound: true,
                        keepInViewport: true
                    },
                    true
                );
                // Edge case: W-7460656
                if (this._autoPosition) {
                    return this._autoPosition.reposition();
                }
                return Promise.reject();
            })
            .then(() => {
                return timeout(0);
            })
            .then(() => {
                // Use a flag to prevent this async function from executing multiple times in a single lifecycle
                this._positioning = false;
            });
    }

    stopPositioning() {
        if (this._autoPosition) {
            stopPositioning(this._autoPosition);
            this._autoPosition = null;
        }
        this._positioning = false;
    }

    toggleMenuVisibility() {
        if (!this.disabled) {
            this._dropdownVisible = !this._dropdownVisible;
            if (!this.dropdownOpened && this._dropdownVisible) {
                this.dropdownOpened = true;
            }
            if (this._dropdownVisible) {
                this.startPositioning();
                this.dispatchEvent(new CustomEvent('open'));

                // update the bounding rect when the menu is toggled
                this._boundingRect = this.getBoundingClientRect();

                this.pollBoundingRect();
            } else {
                this.stopPositioning();
                this.dispatchEvent(new CustomEvent('close'));
            }

            this.classList.toggle('slds-is-open');
        }
    }

    pollBoundingRect() {
        // only poll if the dropdown is auto aligned
        if (this.isAutoAlignment() && this._dropdownVisible) {
            setTimeout(
                () => {
                    if (this.isConnected) {
                        observePosition(this, 300, this._boundingRect, () => {
                            this.close();
                        });

                        // continue polling
                        this.pollBoundingRect();
                    }
                },
                250 // check every 0.25 second
            );
        }
    }

    handleDropdownMouseDown(event) {
        const mainButton = 0;
        if (event.button === mainButton) {
            this.cancelBlur();
        }
    }

    handleButtonMouseDown(event) {
        const mainButton = 0;
        if (event.button === mainButton) {
            this.cancelBlur();
        }
    }

    handleDropdownClick() {
        // On click outside of a focusable element, the focus will go to the button
        if (!this.template.activeElement) {
            this.focus();
        }
    }

    handleButtonClick() {
        this.allowBlur();

        this.toggleMenuVisibility();
    }

    handleButtonFocus() {
        this.dispatchEvent(new CustomEvent('focus'));
    }

    handleButtonBlur() {
        if (!this._cancelBlur) {
            this.close();
            this.dispatchEvent(new CustomEvent('blur'));
        }
    }

    handleCheckboxChange(event) {
        this._value = event.detail.value;
        this.computeValue();
        this.dispatchSelect();
    }

    handlePrivateSelect(event) {
        const index = this.value.findIndex(
            (itemValue) => itemValue === event.detail.value
        );
        if (index > -1) {
            this.value.splice(index, 1);
        } else {
            this.value.push(event.detail.value);
        }

        this.computeValue();

        event.stopPropagation();
        this.dispatchSelect();
    }

    handlePrivateBlur(event) {
        event.stopPropagation();

        if (this._cancelBlur) {
            return;
        }

        if (this._dropdownVisible) {
            this.toggleMenuVisibility();
        }
    }

    handlePrivateFocus(event) {
        event.stopPropagation();
        this.allowBlur();
    }

    handleKeyDown(event) {
        if (event.code === 'Tab') {
            this.cancelBlur();

            if (event.target.label === this.applyButtonLabel) {
                this.allowBlur();
                this.close();
                this.dispatchEvent(new CustomEvent('blur'));
            }
        }

        const isMenuItem = event.target.tagName === 'LIGHTNING-MENU-ITEM';

        // To follow LWC convention, menu items are navigable with up and down arrows
        if (isMenuItem) {
            const index = Number(event.target.dataset.index);

            if (event.code === 'ArrowUp') {
                const previousItem = this.template.querySelector(
                    `[data-index="${index - 1}"]`
                );
                if (previousItem) {
                    this.cancelBlur();
                    previousItem.focus();
                }
            } else if (event.code === 'ArrowDown') {
                const nextItem = this.template.querySelector(
                    `[data-index="${index + 1}"]`
                );
                if (nextItem) {
                    this.cancelBlur();
                    nextItem.focus();
                }
            }
        }
    }

    handleSelectedItemRemove(event) {
        const selectedItemIndex = event.detail.index;
        this.selectedItems.splice(selectedItemIndex, 1);

        const valueIndex = this.value.findIndex(
            (name) => name === event.detail.item.name
        );
        this.value.splice(valueIndex, 1);
        this.computeValue();
        this.dispatchApply();
    }

    handleApplyClick() {
        this.computeSelectedItems();
        this.dispatchApply();
        this.close();
    }

    handleResetClick() {
        this.dispatchEvent(new CustomEvent('reset'));
        this.clear();
    }

    handleSearch(event) {
        const searchTerm = event.currentTarget.value;

        this.computedItems.forEach((item) => {
            const label = item.label.toLowerCase();
            item.hidden = searchTerm
                ? !label.includes(searchTerm.toLowerCase())
                : false;
        });

        this.dispatchEvent(
            new CustomEvent('search', {
                detail: {
                    value: searchTerm
                }
            })
        );
    }

    dispatchApply() {
        this.dispatchEvent(
            new CustomEvent('apply', {
                detail: {
                    value: this.value
                }
            })
        );
    }

    dispatchSelect() {
        // Dispatch the event with the same properties as LWC button-menu
        this.dispatchEvent(
            new CustomEvent('select', {
                cancelable: true,
                detail: {
                    value: this.value
                }
            })
        );
    }
}
