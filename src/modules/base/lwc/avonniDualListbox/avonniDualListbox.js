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
    normalizeBoolean,
    normalizeString,
    assert,
    getRealDOMId,
    getListHeight
} from 'c/utilsPrivate';
import { classSet, formatLabel, generateUUID } from 'c/utils';
import { FieldConstraintApi, InteractingState } from 'c/inputUtils';
import { handleKeyDownOnOption } from './avonniKeyboard';

const DEFAULT_MIN = 0;
const DEFAULT_ADD_BUTTON_ICON_NAME = 'utility:right';
const DEFAULT_DOWN_BUTTON_ICON_NAME = 'utility:down';
const DEFAULT_REMOVE_BUTTON_ICON_NAME = 'utility:left';
const DEFAULT_UP_BUTTON_ICON_NAME = 'utility:up';
const DEFAULT_MAX_VISIBLE_OPTIONS = 5;

const LABEL_VARIANTS = {
    valid: ['standard', 'label-hidden', 'label-stacked'],
    default: 'standard'
};

const BUTTON_VARIANTS = {
    valid: [
        'bare',
        'container',
        'brand',
        'border',
        'border-filled',
        'bare-inverse',
        'border-inverse'
    ],
    default: 'border'
};

const BUTTON_SIZES = {
    valid: ['xx-small', 'x-small', 'small', 'medium', 'large'],
    default: 'medium'
};

const BOXES_SIZES = { valid: ['small', 'medium', 'large'], default: 'medium' };

const i18n = {
    optionLockAssistiveText: 'Option Lock AssistiveText',
    required: 'Required',
    requiredError: 'Value required',
    loadingText: 'Loading'
};

/**
 * @class
 * @descriptor avonni-dual-listbox
 * @storyId example-dual-listbox--base
 * @public
 */
export default class AvonniDualListbox extends LightningElement {
    /**
     * The name of the icon to be used in the format 'utility:right'.
     *
     * @type {string}
     * @public
     * @default utility:right
     */
    @api addButtonIconName = DEFAULT_ADD_BUTTON_ICON_NAME;

    /**
     * Label for add button.
     *
     * @type {string}
     * @public
     */
    @api addButtonLabel;

    /**
     * The name of the icon to be used in the format ‘utility:down’.
     *
     * @type {string}
     * @public
     * @default utility:down
     */
    @api downButtonIconName = DEFAULT_DOWN_BUTTON_ICON_NAME;

    /**
     * Label for down button
     *
     * @type {string}
     * @public
     */
    @api downButtonLabel;

    /**
     * Help text detailing the purpose and function of the dual listbox.
     *
     * @type {string}
     * @public
     */
    @api fieldLevelHelp;

    /**
     * Label for the dual listbox.
     *
     * @type {string}
     * @public
     */
    @api label;

    /**
     * Error message to be displayed when the value is missing and input is required.
     *
     * @type {string}
     * @public
     */
    @api
    messageWhenValueMissing = i18n.requiredError;

    /**
     * Specifies the name of an input element.
     *
     * @type {string}
     * @public
     */
    @api name;

    /**
     * The name of the icon to be used in the format ‘utility:left’.
     *
     * @type {string}
     * @public
     * @default utility:left
     */
    @api removeButtonIconName = DEFAULT_REMOVE_BUTTON_ICON_NAME;

    /**
     * Label for remove button.
     *
     * @type {string}
     * @public
     */
    @api removeButtonLabel;

    /**
     * Label for the selected options listbox.
     *
     * @type {string}
     * @public
     */
    @api selectedLabel;

    /**
     * Text displayed when no options are selected.
     *
     * @type {string}
     * @public
     */
    @api selectedPlaceholder;

    /**
     * Label for the source options listbox.
     *
     * @type {string}
     * @public
     */
    @api sourceLabel;

    /**
     * The name of the icon to be used in the format ‘utility:up’.
     *
     * @type {string}
     * @public
     * @default utility:up
     */
    @api upButtonIconName = DEFAULT_UP_BUTTON_ICON_NAME;

    /**
     * Label for up button.
     *
     * @type {string}
     * @public
     */
    @api upButtonLabel;

    _requiredOptions = [];
    _options = [];
    _allowSearch = false;
    _buttonSize = BUTTON_SIZES.default;
    _buttonVariant = BUTTON_VARIANTS.default;
    _disabled;
    _disableReordering = false;
    _draggable = false;
    _hideBottomDivider = false;
    _isLoading = false;
    _max;
    _maxVisibleOptions = DEFAULT_MAX_VISIBLE_OPTIONS;
    _min = DEFAULT_MIN;
    _required = false;
    _size = BOXES_SIZES.default;
    _variant = LABEL_VARIANTS.default;

    _selectedValues = [];
    _groupedValues = [];
    highlightedOptions = [];
    errorMessage = '';
    focusableInSource;
    focusableInSelected;
    isFocusOnList = false;
    _searchTerm;
    _upButtonDisabled = false;
    _downButtonDisabled = false;
    _oldIndex;
    _newIndex;

    _sourceBoxHeight;
    _selectedBoxHeight;

    _dropItSelected = false;
    _dropItSource = false;

    connectedCallback() {
        this.classList.add('slds-form-element');
        this.keyboardInterface = this.selectKeyboardInterface();

        this.addRequiredOptionsToValue();

        // debounceInteraction since DualListbox has multiple focusable elements
        this.interactingState = new InteractingState({
            debounceInteraction: true
        });
        this.interactingState.onenter(() => {
            this.dispatchEvent(new CustomEvent('focus'));
        });
        this.interactingState.onleave(() => {
            this.showHelpMessageIfInvalid();
            this.dispatchEvent(new CustomEvent('blur'));

            // reset the optionToFocus otherwise dualListbox will steal the focus any time it's rerendered.
            this.optionToFocus = null;
        });
    }

    renderedCallback() {
        this.assertRequiredAttributes();

        if (this.disabled) {
            this._upButtonDisabled = true;
            this._downButtonDisabled = true;
            return;
        }

        if (this.optionToFocus) {
            // value could have an apostrophe, which is why we need to escape it otherwise the queryselector will not work
            const option = this.template.querySelector(
                `div[data-value='${this.optionToFocus}']`
            );
            if (option) {
                this.isFocusOnList = true;
                option.focus();
            }
        }
        this.disabledButtons();
        this.updateBoxesHeight();
        this.setOptionIndexes();
        if (!this.rendered) {
            this.getGroupValues();
        }
        this.rendered = true;
    }

    /**
     * If present, a search box is added to the first listbox.
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
     * For the bare variant, valid values include x-small, small, medium, and large. For non-bare variants, valid values include xx-small, x-small, small, and medium.
     *
     * @type {string}
     * @public
     * @default medium
     */
    @api
    get buttonSize() {
        return this._buttonSize;
    }

    set buttonSize(size) {
        this._buttonSize = normalizeString(size, {
            fallbackValue: BUTTON_SIZES.default,
            validValues: BUTTON_SIZES.valid
        });
    }

    /**
     * Use this variant for all button icons (add, up, down and remove). Valid values include bare, container, brand, border, border-filled, bare-inverse and border-inverse.
     *
     * @type {string}
     * @public
     */
    @api
    get buttonVariant() {
        return this._buttonVariant;
    }

    set buttonVariant(variant) {
        this._buttonVariant = normalizeString(variant, {
            fallbackValue: BUTTON_VARIANTS.default,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    /**
     * If present, the Up and Down buttons used for reordering are hidden.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get disableReordering() {
        return this._disableReordering;
    }

    set disableReordering(value) {
        this._disableReordering = normalizeBoolean(value);
    }

    /**
     * If present, the listbox is disabled and users cannot interact with it.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get disabled() {
        return this._disabled || false;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    /**
     * If present, the options are draggable.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get draggable() {
        if (this.disabled) {
            return false;
        }
        return this._draggable;
    }

    set draggable(value) {
        this._draggable = normalizeBoolean(value);
    }

    /**
     * If present, hides the bottom divider.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get hideBottomDivider() {
        return this._hideBottomDivider || false;
    }

    set hideBottomDivider(value) {
        this._hideBottomDivider = normalizeBoolean(value);
    }

    /**
     * If present, the source options listbox is in a loading state and shows a spinner.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get isLoading() {
        return this._isLoading || false;
    }

    set isLoading(value) {
        this._isLoading = normalizeBoolean(value);
    }

    /**
     * Number of options that display in the listboxes before vertical scrollbars are displayed. Determines the vertical size of the listbox.
     *
     * @type {number}
     * @public
     * @default 5
     */
    @api
    get maxVisibleOptions() {
        return this._maxVisibleOptions;
    }

    set maxVisibleOptions(value) {
        const number =
            typeof value === 'number' ? value : DEFAULT_MAX_VISIBLE_OPTIONS;
        this._maxVisibleOptions = parseInt(number, 10);

        if (this.isConnected) {
            this.updateBoxesHeight();
        }
    }

    /**
     * Maximum number of options allowed in the selected options listbox.
     *
     * @type {number}
     * @public
     */
    @api
    get max() {
        return this._max;
    }

    set max(value) {
        const number = typeof value === 'number' ? value : '';
        this._max = parseInt(number, 10);
    }

    /**
     * Minimum number of options required in the selected options listbox.
     *
     * @type {number}
     * @public
     */
    @api
    get min() {
        return this._min;
    }

    set min(value) {
        const number = typeof value === 'number' ? value : DEFAULT_MIN;
        this._min = parseInt(number, 10);
    }

    /**
     * Error message to be displayed when a range overflow is detected.
     *
     * @type {string}
     * @public
     */
    @api
    get messageWhenRangeOverflow() {
        return this._messageWhenRangeOverflow;
    }

    set messageWhenRangeOverflow(message) {
        this._messageWhenRangeOverflow = message;
    }

    /**
     * Error message to be displayed when a range underflow is detected.
     *
     * @type {string}
     * @public
     */
    @api
    get messageWhenRangeUnderflow() {
        return this._messageWhenRangeUnderflow;
    }

    set messageWhenRangeUnderflow(message) {
        this._messageWhenRangeUnderflow = message;
    }

    /**
     * A list of options that are available for selection. Each option has the following attributes: label, description, value, iconName, iconSrc, initials and variant.
     *
     * @type {object[]}
     * @public
     */
    @api
    get options() {
        return this._options;
    }

    set options(value) {
        this._options = Array.isArray(value)
            ? JSON.parse(JSON.stringify(value))
            : [];

        if (this.isConnected) {
            this.updateBoxesHeight();
        }
    }

    /**
     * If present, the user must add an item to the selected listbox before submitting the form.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get required() {
        return this._required;
    }

    set required(value) {
        this._required = normalizeBoolean(value);
    }

    /**
     * A list of required options that cannot be removed from selected options listbox. This list is populated with values from the options attribute.
     *
     * @type {string[]}
     * @public
     */
    @api
    get requiredOptions() {
        return this._requiredOptions;
    }

    set requiredOptions(newValue) {
        this._requiredOptions = Array.isArray(newValue)
            ? JSON.parse(JSON.stringify(newValue))
            : [];
        if (this.isConnected) {
            this.addRequiredOptionsToValue();
        }
    }

    /**
     * It defines the width of the source options listbox and the selected options listbox. Valid values include small, medium and large.
     *
     * @type {string}
     * @public
     * @default medium
     */
    @api
    get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: BOXES_SIZES.default,
            validValues: BOXES_SIZES.valid
        });
    }

    /**
     * A list of default options that are included in the selected options listbox. This list is populated with values from the options attribute.
     *
     * @type {string[]}
     * @public
     */
    @api
    get value() {
        return this._selectedValues;
    }

    set value(newValue) {
        this.updateHighlightedOptions(newValue);
        this._selectedValues = newValue || [];
        if (this.isConnected) {
            this.addRequiredOptionsToValue();
        }
    }

    /**
     * The variant changes the appearance of the dual listbox. Valid variants include standard, label-hidden and label-stacked. Use label-hidden to hide the label but make it available to assistive technology. Use label-stacked to place the label above the dual listbox.
     *
     * @type {string}
     * @public
     * @default standard
     */
    @api
    get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: LABEL_VARIANTS.default,
            validValues: LABEL_VARIANTS.valid
        });
    }

    /**
     * Sets focus on the first option from either list. If the source list doesn't contain any options, the first option on the selected list is focused on.
     *
     * @public
     */
    @api
    focus() {
        const firstOption = this.template.querySelector(`div[data-index='0']`);
        if (firstOption) {
            firstOption.focus();
            this.updateSelectedOptions(firstOption, true, false);
        }
    }

    /**
     * Get validity from field constraint API.
     *
     * @type {boolean}
     */
    get validity() {
        return this._constraint.validity;
    }

    /**
     * Returns the valid attribute value (Boolean) on the ValidityState object.
     *
     * @public
     * @returns {boolean}
     */
    @api
    checkValidity() {
        return this._constraint.checkValidity();
    }

    /**
     * Displays the error messages and returns false if the input is invalid. If the input is valid, reportValidity() clears displayed error messages and returns true.
     *
     * @public
     * @returns {string} errorMessage
     */
    @api
    reportValidity() {
        return this._constraint.reportValidity((message) => {
            this.errorMessage = message;
        });
    }

    /**
     * Sets a custom error message to be displayed when the dual listbox value is submitted.
     *
     * @param {string} message
     * @public
     */
    @api
    setCustomValidity(message) {
        this._constraint.setCustomValidity(message);
    }

    /**
     * Displays an error message if the dual listbox value is required.
     */
    @api
    showHelpMessageIfInvalid() {
        this.reportValidity();
    }

    /**
     * Computed real DOM Id for Source List.
     *
     * @type {string}
     */
    get computedSourceListId() {
        return getRealDOMId(
            this.template.querySelector('[data-element-id="ul-source-list"]')
        );
    }

    /**
     * Computed real DOM Id for Selected List.
     *
     * @type {string}
     */
    get computedSelectedListId() {
        return getRealDOMId(
            this.template.querySelector('[data-element-id="ul-selected-list"]')
        );
    }

    /**
     * Get Aria Disabled.
     *
     * @type {string}
     */
    get ariaDisabled() {
        return String(this.disabled);
    }

    get generateKey() {
        return generateUUID();
    }

    /**
     * Get Computed Source List.
     *
     * @type {object}
     */
    get computedSourceList() {
        let sourceListOptions = [];
        if (this.options) {
            const required = this.requiredOptions;
            const values = this.value;
            sourceListOptions = this.options.filter(
                (option) =>
                    values.indexOf(option.value) === -1 &&
                    required.indexOf(option.value) === -1
            );
        }

        if (this._searchTerm) {
            sourceListOptions = sourceListOptions.filter((option) => {
                return option.label.toLowerCase().includes(this._searchTerm);
            });
        }

        return this.computeListOptions(
            sourceListOptions,
            this.focusableInSource
        );
    }

    /**
     * Get Computed Selected List.
     *
     * @type {object}
     */
    get computedSelectedList() {
        const selectedListOptions = [];
        if (this.options) {
            const optionsMap = {};
            this.options.forEach((option) => {
                optionsMap[option.value] = { ...option };
            });
            this.value.forEach((optionValue) => {
                const option = optionsMap[optionValue];
                if (option) {
                    option.isSelected = true;
                }
            });
            this.requiredOptions.forEach((optionValue) => {
                const option = optionsMap[optionValue];
                if (option) {
                    option.isLocked = true;
                }
            });

            // add selected options in the given order
            this.value.forEach((optionValue) => {
                const option = optionsMap[optionValue];
                if (option) {
                    selectedListOptions.push(option);
                }
            });
        }

        return this.computeListOptions(
            selectedListOptions,
            this.focusableInSelected
        );
    }

    /**
     * Get Computed Source List With Groups.
     *
     * @type {object}
     */
    get computedSourceGroups() {
        return this.groupByName(this.computedSourceList, 'groupName');
    }

    /**
     * Get Computed Selected List With Groups.
     *
     * @type {object}
     */
    get computedSelectedGroups() {
        return this.groupByName(this.computedSelectedList, 'groupName');
    }

    /**
     * Compute List options from Selected and Source Lists.
     *
     * @param {object} options
     * @param {string} focusableOptionValue
     * @returns {object} list options
     */
    computeListOptions(options, focusableOptionValue) {
        if (options.length > 0) {
            const focusableOption = options.find((option) => {
                return option.value === focusableOptionValue;
            });

            const focusableValue = focusableOption
                ? focusableOption.value
                : options[0].value;
            return options.map((option) => {
                return this.computeOptionProperties(option, focusableValue);
            });
        }

        return [];
    }

    /**
     * Computed Option object properties.
     *
     * @param {object} option
     * @param {number} focusableValue
     * @returns {object} object
     */
    computeOptionProperties(option, focusableValue) {
        const isSelected = this.highlightedOptions.indexOf(option.value) > -1;
        const hasDescription = option.description;
        const classList = classSet(
            'slds-listbox__option slds-listbox__option_plain slds-media slds-media_center slds-media_inline avonni-dual-listbox-list-item-min_height '
        )
            .add({ 'slds-media_small': !hasDescription })
            .add({ 'slds-is-selected': isSelected })
            .toString();

        return {
            ...option,
            tabIndex: option.value === focusableValue ? '0' : '-1',
            selected: isSelected ? true : false,
            primaryText: option.description ? option.label : '',
            secondaryText: option.description ? option.description : '',
            iconSize: option.iconSize
                ? option.iconSize
                : hasDescription
                ? 'medium'
                : 'small',
            classList
        };
    }

    /**
     * Update box heights based on content.
     *
     * @returns {number} Box heights
     */
    updateBoxesHeight() {
        let overSelectedHeight;
        let overSourceHeight;
        const sourceOptions = this.template.querySelectorAll(
            '[data-element-id="li-source"]'
        );
        const selectedOptions = this.template.querySelectorAll(
            '[data-element-id="li-selected"]'
        );

        const sourceOptionsHeight = getListHeight(
            sourceOptions,
            this._maxVisibleOptions
        );

        if (
            this.computedSourceList.length < this._maxVisibleOptions &&
            sourceOptions.length > 0
        ) {
            overSourceHeight =
                this.template.querySelector('[data-element-id="li-source"]')
                    .offsetHeight *
                (this._maxVisibleOptions - this.computedSourceList.length);
        } else overSourceHeight = 0;

        if (
            this.computedSelectedList.length < this._maxVisibleOptions &&
            selectedOptions.length > 0
        ) {
            overSelectedHeight =
                this.template.querySelector('[data-element-id="li-selected"]')
                    .offsetHeight *
                (this._maxVisibleOptions - this.computedSelectedList.length);
        } else overSelectedHeight = 0;

        this._selectedBoxHeight =
            getListHeight(selectedOptions, this._maxVisibleOptions) +
            overSelectedHeight;

        if (this.allowSearch) {
            if (this.computedSourceList.length > 0) {
                this._sourceBoxHeight =
                    sourceOptionsHeight +
                    getListHeight(
                        this.template.querySelector(
                            '.avonni-dual-listbox-allow-search'
                        )
                    ) +
                    overSourceHeight;
            } else if (this.computedSourceList.length === 0) {
                this._sourceBoxHeight = this._maxVisibleOptions * 41;
            }
        } else this._sourceBoxHeight = sourceOptionsHeight + overSourceHeight;
    }

    /**
     * Get Source List Height.
     *
     * @type {string}
     */
    get sourceHeight() {
        if (this.allowSearch) {
            return this._selectedBoxHeight > this._sourceBoxHeight
                ? `height: ${this._selectedBoxHeight - 48}px`
                : `height: ${this._sourceBoxHeight}px`;
        }
        {
            return this._selectedBoxHeight > this._sourceBoxHeight
                ? `height: ${this._selectedBoxHeight}px`
                : `height: ${this._sourceBoxHeight}px`;
        }
    }

    /**
     * Get Selected Box Height.
     *
     * @type {string}
     */
    get selectedHeight() {
        if (this.allowSearch) {
            return this._selectedBoxHeight <= this._sourceBoxHeight
                ? `height: ${this._sourceBoxHeight + 48}px`
                : `height: ${this._selectedBoxHeight}px`;
        }
        {
            return this._selectedBoxHeight > this._sourceBoxHeight
                ? `height: ${this._selectedBoxHeight}px`
                : `height: ${this._sourceBoxHeight}px`;
        }
    }

    /**
     * Check if Label Hidden.
     *
     * @type {boolean}
     */
    get isLabelHidden() {
        return this.variant === 'label-hidden';
    }

    /**
     * Check if Selected Box is Empty.
     *
     * @type {boolean}
     */
    get isSelectedBoxEmpty() {
        return this._selectedValues.length === 0;
    }

    /**
     * Computed Lock Assistive Text.
     *
     * @type {string}
     */
    get computedLockAssistiveText() {
        return formatLabel(
            this.i18n.optionLockAssistiveText,
            this.selectedLabel
        );
    }

    /**
     * Localization.
     *
     * @type {i18n}
     */
    get i18n() {
        return i18n;
    }

    /**
     * Check if move buttons are disabled.
     *
     * @type {boolean}
     */
    get moveButtonsDisabled() {
        return this.disabled;
    }

    /**
     * Computed Outer Class styling.
     *
     * @type {string}
     */
    get computedOuterClass() {
        return classSet('')
            .add({
                'slds-form-element_stacked': this._variant === 'label-stacked'
            })
            .toString();
    }

    /**
     * Computed Group Label Class styling.
     *
     * @type {string}
     */
    get computedGroupLabelClass() {
        return classSet('slds-form-element__label slds-form-element__legend')
            .add({ 'slds-assistive-text': this.isLabelHidden })
            .toString();
    }

    /**
     * Computed Listbox Columns Class styling.
     *
     * @type {string}
     */
    get computedListboxColumnsClass() {
        return classSet('avonni-dual-listbox-list__column')
            .add({
                'avonni-dual-listbox-list__column_responsive_small ':
                    this._size === 'small',
                'avonni-dual-listbox-list__column_responsive_medium ':
                    this._size === 'medium',
                'avonni-dual-listbox-list__column_responsive_large ':
                    this._size === 'large'
            })
            .toString();
    }

    /**
     * Computed Listbox Source Container Class styling.
     *
     * @type {string}
     */
    get computedListboxSourceContainerClass() {
        return classSet(
            'slds-dueling-list__options avonni-dual-listbox-option-is-selected'
        )
            .add({ 'slds-is-disabled': this._disabled })
            .add({ 'slds-is-relative': this._isLoading })
            .add({
                'avonni-dual-listbox-size_small': this._size === 'small',
                'avonni-dual-listbox-size_medium': this._size === 'medium',
                'avonni-dual-listbox-size_large': this._size === 'large'
            })
            .toString();
    }

    /**
     * Computed Listbox Selected Container Class styling.
     *
     * @type {string}
     */
    get computedListboxSelectedContainerClass() {
        return classSet(
            'slds-dueling-list__options avonni-dual-listbox-option-is-selected'
        )
            .add({ 'slds-is-disabled': this._disabled })
            .add({
                'avonni-dual-listbox-selected-list-with-search': this
                    ._allowSearch
            })
            .add({
                'avonni-dual-listbox-empty-column': this.isSelectedBoxEmpty
            })
            .add({
                'avonni-dual-listbox-size_small': this._size === 'small',
                'avonni-dual-listbox-size_medium': this._size === 'medium',
                'avonni-dual-listbox-size_large': this._size === 'large'
            })
            .toString();
    }

    /**
     * Computed List Item Class styling.
     *
     * @type {string}
     */
    get computedListItemClass() {
        return classSet('slds-listbox__item')
            .add({
                'avonni-dual-listbox-option-border_bottom': !this
                    .hideBottomDivider
            })
            .toString();
    }

    /**
     * Option Click event handler.
     *
     * @param {Event} event
     */
    handleOptionClick(event) {
        this.interactingState.interacting();
        if (this.disabled) {
            return;
        }
        const selectMultiple = event.metaKey || event.ctrlKey || event.shiftKey;
        const option = event.currentTarget;
        if (event.shiftKey) {
            this.selectAllFromLastSelectedToOption(option, false);
            return;
        }
        const selected =
            selectMultiple && option.getAttribute('aria-selected') === 'true';
        this.updateSelectedOptions(option, !selected, selectMultiple);
        this.shiftIndex = -1;
    }

    /**
     * Focus event handler.
     *
     * @param {Event} event
     */
    handleFocus(event) {
        this.interactingState.enter();

        // select the focused option if entering a listbox
        const element = event.target;
        if (element.role === 'option') {
            if (!this.isFocusOnList) {
                this.isFocusOnList = true;
                this.updateSelectedOptions(element, true, false);
            }
        }
    }

    /**
     * Blur event handler.
     *
     * @param {Event} event
     */
    handleBlur(event) {
        this.interactingState.leave();

        const element = event.target;
        if (element.role !== 'option') {
            this.isFocusOnList = false;
        }
    }

    /**
     * Right Button Click handler.
     */
    handleRightButtonClick() {
        this.interactingState.interacting();
        this.moveOptionsBetweenLists(true, true);
    }

    /**
     * Drag Right handler.
     */
    handleDragRight() {
        this.interactingState.interacting();
        this.moveOptionsBetweenLists(true, false);
        this._dropItSelected = false;
    }

    /**
     * Left Button Click handler.
     */
    handleLeftButtonClick() {
        this.interactingState.interacting();
        this.moveOptionsBetweenLists(false, true);
    }

    /**
     * Drag Right handler.
     */
    handleDragLeft() {
        this.interactingState.interacting();
        this.moveOptionsBetweenLists(false, false);
        this._dropItSource = false;
    }

    /**
     * Up Button Click handler.
     */
    handleUpButtonClick() {
        this.interactingState.interacting();
        this.changeOrderOfOptionsInList(true);
    }

    /**
     * Down Button Click handler.
     */
    handleDownButtonClick() {
        this.interactingState.interacting();
        this.changeOrderOfOptionsInList(false);
    }

    /**
     * Option Keydown event handler.
     *
     * @param {Event} event
     */
    handleOptionKeyDown(event) {
        this.interactingState.interacting();
        if (this.disabled) {
            return;
        }
        handleKeyDownOnOption(event, this.keyboardInterface);
    }

    /**
     * Search event handler.
     *
     * @param {Event} event
     */
    handleSearch(event) {
        this._searchTerm = event.detail.value;
    }

    /**
     * Move Options between Lists.
     *
     * @param {boolean} addToSelect
     * @param {boolean} retainFocus
     */
    moveOptionsBetweenLists(addToSelect, retainFocus) {
        const isValidList = addToSelect
            ? this.selectedList === this.computedSourceListId
            : this.selectedList === this.computedSelectedListId;
        if (!isValidList) {
            return;
        }
        const toMove = this.highlightedOptions;
        const values = this.computedSelectedList.map((option) => option.value);
        const required = this.requiredOptions;
        let newValues = [];
        if (addToSelect) {
            newValues = values.concat(toMove);
        } else {
            newValues = values.filter(
                (value) =>
                    toMove.indexOf(value) === -1 || required.indexOf(value) > -1
            );
        }

        const oldSelectedValues = this._selectedValues;
        this._selectedValues = newValues;
        const invalidMove =
            this.validity.valueMissing ||
            (this.validity.rangeOverflow &&
                this.selectedList === this.computedSourceListId) ||
            (this.validity.rangeUnderflow &&
                this.selectedList === this.computedSelectedListId);

        if (invalidMove || toMove.length === 0) {
            this.showHelpMessageIfInvalid();
            this._selectedValues = oldSelectedValues;
            return;
        }

        if (retainFocus) {
            const listId = addToSelect
                ? this.computedSelectedListId
                : this.computedSourceListId;
            if (listId.includes('source')) {
                if (this.computedSelectedList.length > 0) {
                    this.updateFocusableOption(
                        this.computedSourceListId,
                        this.computedSelectedList[this._oldIndex].value
                    );
                } else this.updateFocusableOption(listId, toMove[0]);
            } else {
                if (this.computedSourceList.length > 0) {
                    this.updateFocusableOption(
                        this.computedSelectedListId,
                        this.computedSourceList[this._oldIndex].value
                    );
                } else this.updateFocusableOption(listId, toMove[0]);
            }
        } else {
            this.interactingState.leave();
            this.isFocusOnList = false;
            this.highlightedOptions = [];
            this.optionToFocus = null;
        }

        this.dispatchChangeEvent(newValues);
        this.highlightedOptions.find((option) => {
            return this._selectedValues.indexOf(option);
        });
        this.updateBoxesHeight();
    }

    /**
     * Reserve old index value.
     *
     * @param {object} option
     */
    oldIndexValue(option) {
        const options = this.template.querySelector(
            `div[data-value='${option}']`
        );
        if (options) {
            const index = options.getAttribute('data-index');
            if (index === '0') {
                this._oldIndex = 0;
            } else this._oldIndex = index - 1;
        }
    }

    /**
     * Change Order of options in List.
     *
     * @param {boolean} moveUp
     */
    changeOrderOfOptionsInList(moveUp) {
        const elementList = this.getElementsOfList(this.selectedList);
        const values = this.computedSelectedList.map((option) => option.value);
        const toMove = values.filter(
            (option) => this.highlightedOptions.indexOf(option) > -1
        );
        const validSelection =
            toMove.length === 0 ||
            this.selectedList !== this.computedSelectedListId;
        if (validSelection) {
            return;
        }
        let start = moveUp ? 0 : toMove.length - 1;
        let index = values.indexOf(toMove[start]);
        const validMove =
            (moveUp && index === 0) || (!moveUp && index === values.length - 1);
        if (validMove) {
            return;
        }

        if (moveUp) {
            while (start < toMove.length) {
                index = values.indexOf(toMove[start]);
                this.swapOptions(index, index - 1, values, elementList);
                start++;
            }
        } else {
            while (start > -1) {
                index = values.indexOf(toMove[start]);
                this.swapOptions(index, index + 1, values, elementList);
                start--;
            }
        }

        this._selectedValues = values;
        this.updateFocusableOption(this.selectedList, toMove[0]);
        this.optionToFocus = null;
        this.dispatchChangeEvent(values);
        this.updateBoxesHeight();
    }

    /**
     * Disabled buttons method for up and down buttons.
     */
    disabledButtons() {
        const indexesArray = [];
        // First we need to verify if the highlighted options are in the selected list.
        if (
            this._selectedValues.some((r) =>
                this.highlightedOptions.includes(r)
            )
        ) {
            this.highlightedOptions.forEach((option) => {
                indexesArray.push(this.getOptionGroupIndexes(option));
            });
            // Then we need to verify if one of the highlighted options is the first one of its group.
            const first = indexesArray.map((array) => {
                return this.computedSelectedGroups[array[0]].options[
                    Number(array[1]) - 1
                ]
                    ? false
                    : true;
            });
            // And we need to verify if one of the highlighted options is the last one of its group.
            const last = indexesArray.map((array) => {
                return this.computedSelectedGroups[array[0]].options[
                    Number(array[1]) + 1
                ]
                    ? false
                    : true;
            });

            this._upButtonDisabled = first.includes(true);
            this._downButtonDisabled = last.includes(true);
        } else {
            // if the highlighted options are not in the selected list the up and down button are not disabled.
            this._upButtonDisabled = false;
            this._downButtonDisabled = false;
        }
    }

    /**
     * Add All selected Options to highlightedOptions.
     *
     * @param {object} option
     * @param {boolean} all
     */
    selectAllFromLastSelectedToOption(option, all) {
        const listId = option.getAttribute('data-type');
        this.updateCurrentSelectedList(listId, true);
        const options = this.getElementsOfList(listId);
        const end = all ? 0 : this.getOptionIndex(option);
        this.lastSelected = this.lastSelected < 0 ? end : this.lastSelected;
        const start = all ? options.length : this.lastSelected;
        let val, select;
        this.highlightedOptions = [];
        for (let i = 0; i < options.length; i++) {
            select = (i - start) * (i - end) <= 0;
            if (select) {
                val = options[i].getAttribute('data-value');
                this.highlightedOptions.push(val);
            }
        }
    }

    /**
     * Update Selected Options.
     *
     * @param {object} option
     * @param {boolean} select
     * @param {boolean} isMultiple
     */
    updateSelectedOptions(option, select, isMultiple) {
        const value = option.getAttribute('data-value');
        const listId = this.getListId(option);
        const optionIndex = this.getOptionIndex(option);
        this.updateCurrentSelectedList(listId, isMultiple);
        if (select) {
            if (this.highlightedOptions.indexOf(value) === -1) {
                this.highlightedOptions.push(value);
            }
        } else {
            this.highlightedOptions.splice(
                this.highlightedOptions.indexOf(value),
                1
            );
        }

        this.updateFocusableOption(listId, value);

        this.lastSelected = optionIndex;
        this.oldIndexValue(this.highlightedOptions);
    }

    /**
     * Add Required Options to value.
     */
    addRequiredOptionsToValue() {
        if (
            !this.options ||
            !this.options.length ||
            !this._requiredOptions ||
            !this._requiredOptions.length
        ) {
            // no options/requiredOptions, just ignore
            return;
        }

        const numOfSelectedValues = this._selectedValues.length;
        const allValues = this.options.map((option) => option.value);

        const requiredValues = this._requiredOptions.filter((option) =>
            allValues.includes(option)
        );

        // add required options to the selected values as they are already displayed in the selected list
        this._selectedValues = [
            ...new Set([...requiredValues, ...this._selectedValues])
        ];

        if (numOfSelectedValues !== this._selectedValues.length) {
            // value was changed
            this.dispatchChangeEvent(this._selectedValues);
        }
    }

    /**
     * Validation with constraint Api.
     *
     * @type {object}
     */
    get _constraint() {
        if (!this._constraintApi) {
            this._constraintApi = new FieldConstraintApi(() => this, {
                valueMissing: () =>
                    !this.disabled &&
                    this.required &&
                    this.computedSelectedList.length < 1,
                rangeUnderflow: () =>
                    this.computedSelectedList.length < this.min,
                rangeOverflow: () => this.computedSelectedList.length > this.max
            });
        }
        return this._constraintApi;
    }

    /**
     * Update Selected List with current selection.
     *
     * @param {string} currentList
     * @param {boolean} isMultiple
     */
    updateCurrentSelectedList(currentList, isMultiple) {
        if (this.selectedList !== currentList || !isMultiple) {
            if (this.selectedList) {
                this.highlightedOptions = [];
                this.lastSelected = -1;
            }
            this.selectedList = currentList;
        }
    }

    /**
     * Change event dispatcher.
     *
     * @param {object} values A comma-separated list of selected items.
     */
    dispatchChangeEvent(values) {
        /**
         * The event fired when an item is selected in the combobox.
         *
         * @event
         * @name change
         * @param {object} value
         * @public
         * @bubbles
         * @composed
         */
        this.dispatchEvent(
            new CustomEvent('change', {
                // the change event needs to propagate to elements outside of the light-DOM, hence making it composed.
                composed: true,
                bubbles: true,
                detail: { value: values }
            })
        );
    }

    /**
     * Assert Required Attributes.
     */
    assertRequiredAttributes() {
        assert(
            !!this.options,
            `<avonni-dual-listbox> Missing required "options" attribute.`
        );
    }

    /**
     * Swap Options.
     *
     * @param {number} i
     * @param {number} j
     * @param {object[]} array
     */
    swapOptions(i, j, array) {
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    /**
     * Get List of Elements by Id.
     *
     * @param {string} listId
     * @return {object[]|NodeListOf<Element>} elements
     */
    getElementsOfList(listId) {
        const elements = this.template.querySelectorAll(
            `div[data-type='${listId}']`
        );
        return elements ? elements : [];
    }

    /**
     * Keyboard use for selecting items.
     *
     * @return keyboard interface
     */
    selectKeyboardInterface() {
        const that = this;
        that.shiftIndex = -1;
        that.lastShift = null;
        return {
            getShiftIndex() {
                return that.shiftIndex;
            },
            setShiftIndex(value) {
                that.shiftIndex = value;
            },
            getLastShift() {
                return that.lastShift;
            },
            setLastShift(value) {
                that.lastShift = value;
            },
            getElementsOfList(listId) {
                return that.getElementsOfList(listId);
            },
            selectAllOptions(option) {
                that.selectAllFromLastSelectedToOption(option, true);
            },
            updateSelectedOptions(option, select, isMultiple) {
                that.updateSelectedOptions(option, select, isMultiple);
            },
            moveOptionsBetweenLists(addToSelect) {
                that.moveOptionsBetweenLists(addToSelect, true);
            }
        };
    }

    /**
     * Compute Option Index number.
     *
     * @param {Element} optionElement
     * @returns {number} Option Index
     */
    getOptionIndex(optionElement) {
        return parseInt(optionElement.getAttribute('data-index'), 10);
    }

    /**
     * Get the index of the group and the index of the option inside the group.
     *
     * @param {number} value
     * @return {object[]} array containing the two indexes
     */
    getOptionGroupIndexes(value) {
        const option = this.template.querySelector(
            `div[data-value="${value}"]`
        );
        return [option.dataset.groupIndex, option.dataset.insideGroupIndex];
    }

    /**
     * Get DOM Id for the List element.
     *
     * @param {Element} optionElement
     * @returns {string} DOM id
     */
    getListId(optionElement) {
        return getRealDOMId(optionElement.parentElement.parentElement);
    }

    /**
     * Update value with focused option item.
     *
     * @param {string} listId
     * @param {string} value
     */
    updateFocusableOption(listId, value) {
        if (listId === this.computedSourceListId) {
            this.focusableInSource = value;
        } else if (listId === this.computedSelectedListId) {
            this.focusableInSelected = value;
        }
        this.optionToFocus = value;
    }

    /**
     * Update Highlighted Options.
     *
     * @param {object} newValue
     */
    updateHighlightedOptions(newValue) {
        let isSame = false;
        if (
            newValue &&
            newValue.length &&
            this._selectedValues &&
            this._selectedValues.length
        ) {
            isSame =
                newValue.length === this._selectedValues.length &&
                newValue.every((option) =>
                    this._selectedValues.includes(option)
                );
        }
        if (!isSame) {
            this.highlightedOptions = [];
        }
    }

    /**
     * Drag Start add "avonni-dual-listbox-dragging" class to current SourceList element.
     *
     * @param {Event} event
     */
    handleDragStartSource(event) {
        event.currentTarget.classList.add('avonni-dual-listbox-dragging');
    }

    /**
     * Drag end event SourceList element handler ( remove "avonni-dual-listbox-dragging" ).
     *
     * @param {Event} event
     */
    handleDragEndSource(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('avonni-dual-listbox-dragging');
        if (this._dropItSelected) {
            if (
                this.highlightedOptions.includes(
                    event.currentTarget.getAttribute('data-value')
                )
            ) {
                this.handleDragRight();
            }
        }
    }

    /**
     * Drag Start add "avonni-dual-listbox-dragging" class to current SelectedList element.
     *
     * @param {Event} event
     */
    handleDragStartSelected(event) {
        event.currentTarget.classList.add('avonni-dual-listbox-dragging');
    }

    /**
     * Drag end event SourceList element handler ( remove "avonni-dual-listbox-dragging" ) - reorder list and index.
     *
     * @param {Event} event
     */
    handleDragEndSelected(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('avonni-dual-listbox-dragging');
        if (this._dropItSource) {
            if (
                this.highlightedOptions.includes(
                    event.currentTarget.getAttribute('data-value')
                )
            ) {
                this.handleDragLeft();
            }
        } else if (!this._dropItSource) {
            if (!this._disableReordering) {
                const values = this.computedSelectedList.map(
                    (option) => option.value
                );
                const elementList = Array.from(
                    this.getElementsOfList(this.selectedList)
                );
                const swappingIndex = Number(
                    event.target.getAttribute('data-index')
                );
                this.swapOptions(
                    swappingIndex,
                    this._newIndex,
                    values,
                    elementList
                );
                this._selectedValues = values;
            }
        }
    }

    /**
     * Drag and Drop Element Over SourceList.
     *
     * @param {Event} event
     */
    handleDragOverSource(event) {
        event.preventDefault();
        this._dropItSource = true;
    }

    /**
     * Drag Element and leave SourceList event.
     *
     * @param {Event} event
     */
    handleDragLeaveSource() {
        this._dropItSource = false;
    }

    /**
     * Drag and Drop Element Over SelectedList.
     *
     * @param {Event} event
     */
    handleDragOverSelected(event) {
        event.preventDefault();
        this._dropItSelected = true;
    }

    /**
     * Drag Element and leave SelectedList event.
     *
     * @param {Event} event
     */
    handleDragLeaveSelected() {
        this._dropItSelected = false;
    }

    /**
     * Drag Over Handler.
     *
     * @param {Event} event
     */
    handleDragOver(event) {
        event.preventDefault();
        this._newIndex = Number(event.target.getAttribute('data-index'));
    }

    /**
     * Move the default group at the top.
     */
    sortGroups(groups) {
        const defaultGroupIndex = groups.findIndex(
            (group) => group.label === undefined
        );
        if (defaultGroupIndex > -1) {
            const defaultGroup = groups.splice(defaultGroupIndex, 1)[0];
            groups.unshift(defaultGroup);
        }
        return groups;
    }

    /**
     * Method to create the groups of options.
     *
     * @param {array} array Array of options.
     * @param {string} groupName groupName.
     * @returns {array} Array of formatted list for the markup.
     */
    groupByName(array, groupName) {
        return this.sortGroups(
            Object.values(
                array.reduce((obj, current) => {
                    if (!obj[current[groupName]])
                        obj[current[groupName]] = {
                            label: current[groupName],
                            options: []
                        };
                    obj[current[groupName]].options.push(current);
                    return obj;
                }, {})
            )
        );
    }

    /**
     * Gets the new order of values after the group by.
     */
    getGroupValues() {
        this.computedSelectedGroups.forEach((group) => {
            group.options.forEach((option) => {
                this._groupedValues.push(option.value);
            });
        });
        this._selectedValues = this._groupedValues;
    }

    /**
     * Sets the data-index attribute of each option.
     */
    setOptionIndexes() {
        const sourceBox = this.template.querySelector(
            '[data-element-id="ul-source-list"]'
        );
        sourceBox
            .querySelectorAll('.slds-listbox__option')
            .forEach((option, index) => {
                option.setAttribute('data-index', index);
            });
        const selectedBox = this.template.querySelector(
            '[data-element-id="ul-selected-list"]'
        );
        selectedBox
            .querySelectorAll('.slds-listbox__option')
            .forEach((option, index) => {
                option.setAttribute('data-index', index);
            });
    }
}
