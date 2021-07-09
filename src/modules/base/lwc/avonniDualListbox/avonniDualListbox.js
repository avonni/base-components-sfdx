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
import { classSet, formatLabel } from 'c/utils';
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

export default class AvonniDualListbox extends LightningElement {
    @api sourceLabel;
    @api selectedLabel;
    @api selectedPlaceholder;
    @api label;
    @api name;
    @api addButtonIconName = DEFAULT_ADD_BUTTON_ICON_NAME;
    @api downButtonIconName = DEFAULT_DOWN_BUTTON_ICON_NAME;
    @api removeButtonIconName = DEFAULT_REMOVE_BUTTON_ICON_NAME;
    @api upButtonIconName = DEFAULT_UP_BUTTON_ICON_NAME;
    @api addButtonLabel;
    @api removeButtonLabel;
    @api upButtonLabel;
    @api downButtonLabel;
    @api fieldLevelHelp;

    _requiredOptions = [];
    _options = [];
    _hideBottomDivider = false;
    _buttonSize = BUTTON_SIZES.default;
    _buttonVariant = BUTTON_VARIANTS.default;
    _isLoading = false;
    _searchEngine = false;
    _variant = LABEL_VARIANTS.default;
    _disabled;
    _disableReordering = false;
    _draggable = false;
    _required = false;
    _maxVisibleOptions = DEFAULT_MAX_VISIBLE_OPTIONS;
    _min = DEFAULT_MIN;
    _max;
    _size = BOXES_SIZES.default;

    _selectedValues = [];
    highlightedOptions = [];
    errorMessage = '';
    focusableInSource;
    focusableInSelected;
    isFocusOnList = false;
    _searchTerm;
    _upButtonDisabled = false;
    _downButtonDisabled = false;
    _oldIndex;
    _sourceBoxHeight;
    _selectedBoxHeight;

    _dropItSelected = false;
    _dropItSource = false;
    _newIndex;

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
    }

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

    @api
    messageWhenValueMissing = i18n.requiredError;

    @api
    get messageWhenRangeOverflow() {
        return this._messageWhenRangeOverflow;
    }

    set messageWhenRangeOverflow(message) {
        this._messageWhenRangeOverflow = message;
    }

    @api
    get messageWhenRangeUnderflow() {
        return this._messageWhenRangeUnderflow;
    }

    set messageWhenRangeUnderflow(message) {
        this._messageWhenRangeUnderflow = message;
    }

    @api
    get hideBottomDivider() {
        return this._hideBottomDivider || false;
    }

    set hideBottomDivider(value) {
        this._hideBottomDivider = normalizeBoolean(value);
    }

    @api
    get disabled() {
        return this._disabled || false;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    @api
    get isLoading() {
        return this._isLoading || false;
    }

    set isLoading(value) {
        this._isLoading = normalizeBoolean(value);
    }

    @api
    get required() {
        return this._required;
    }

    set required(value) {
        this._required = normalizeBoolean(value);
    }

    @api
    get searchEngine() {
        return this._searchEngine;
    }

    set searchEngine(value) {
        this._searchEngine = normalizeBoolean(value);
    }

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

    @api
    get max() {
        return this._max;
    }

    set max(value) {
        const number = typeof value === 'number' ? value : '';
        this._max = parseInt(number, 10);
    }

    @api
    get min() {
        return this._min;
    }

    set min(value) {
        const number = typeof value === 'number' ? value : DEFAULT_MIN;
        this._min = parseInt(number, 10);
    }

    @api
    get disableReordering() {
        return this._disableReordering;
    }

    set disableReordering(value) {
        this._disableReordering = normalizeBoolean(value);
    }

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

    @api
    focus() {
        const firstOption = this.template.querySelector(`div[data-index='0']`);
        if (firstOption) {
            firstOption.focus();
            this.updateSelectedOptions(firstOption, true, false);
        }
    }

    get validity() {
        return this._constraint.validity;
    }

    @api
    checkValidity() {
        return this._constraint.checkValidity();
    }

    @api
    reportValidity() {
        return this._constraint.reportValidity((message) => {
            this.errorMessage = message;
        });
    }

    @api
    setCustomValidity(message) {
        this._constraint.setCustomValidity(message);
    }

    @api
    showHelpMessageIfInvalid() {
        this.reportValidity();
    }

    get hasFieldLevelHelp() {
        return !!this.fieldLevelHelp;
    }

    get computedUniqueId() {
        return this.uniqueId;
    }

    get computedSourceListId() {
        return getRealDOMId(this.template.querySelector('[data-source-list]'));
    }

    get computedSelectedListId() {
        return getRealDOMId(
            this.template.querySelector('[data-selected-list]')
        );
    }

    get computedSourceListbox() {
        return this.template.querySelector('[data-source-list]');
    }

    get computedSelectedListbox() {
        return this.template.querySelector('[data-selected-list]');
    }

    get ariaDisabled() {
        return String(this.disabled);
    }

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

    updateBoxesHeight() {
        let overSelectedHeight = 0;
        let overSourceHeight = 0;
        const sourceOptions = this.template.querySelectorAll(
            'li[data-role="source"]'
        );
        const selectedOptions = this.template.querySelectorAll(
            'li[data-role="selected"]'
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
                this.template.querySelector('li[data-role="source"]')
                    .offsetHeight *
                (this._maxVisibleOptions - this.computedSourceList.length);
        } else overSourceHeight = 0;

        if (
            this.computedSelectedList.length < this._maxVisibleOptions &&
            selectedOptions.length > 0
        ) {
            overSelectedHeight =
                this.template.querySelector('li[data-role="selected"]')
                    .offsetHeight *
                (this._maxVisibleOptions - this.computedSelectedList.length);
        } else overSelectedHeight = 0;

        this._selectedBoxHeight =
            getListHeight(selectedOptions, this._maxVisibleOptions) +
            overSelectedHeight;

        if (this.searchEngine) {
            this._sourceBoxHeight =
                sourceOptionsHeight +
                getListHeight(
                    this.template.querySelector(
                        '.avonni-dual-listbox-search-engine'
                    )
                ) +
                overSourceHeight;
        }
        this._sourceBoxHeight = sourceOptionsHeight + overSourceHeight;
    }

    get sourceHeight() {
        return this.searchEngine &&
            this._selectedBoxHeight > this._sourceBoxHeight
            ? `height: ${this._selectedBoxHeight - 48}px`
            : `height: ${this._sourceBoxHeight}px`;
    }

    get selectedHeight() {
        return this.searchEngine &&
            this._selectedBoxHeight <= this._sourceBoxHeight
            ? `height: ${this._selectedBoxHeight + 48}px`
            : `height: ${this._sourceBoxHeight}px`;
    }

    get isLabelHidden() {
        return this.variant === 'label-hidden';
    }

    get isSelectedBoxEmpty() {
        return this._selectedValues.length === 0;
    }

    get computedLockAssistiveText() {
        return formatLabel(
            this.i18n.optionLockAssistiveText,
            this.selectedLabel
        );
    }

    get i18n() {
        return i18n;
    }

    get moveButtonsDisabled() {
        return this.disabled;
    }

    get computedOuterClass() {
        return classSet('')
            .add({
                'slds-form-element_stacked': this._variant === 'label-stacked'
            })
            .toString();
    }

    get computedGroupLabelClass() {
        return classSet('slds-form-element__label slds-form-element__legend')
            .add({ 'slds-assistive-text': this.isLabelHidden })
            .toString();
    }

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

    get computedListboxSelectedContainerClass() {
        return classSet(
            'slds-dueling-list__options avonni-dual-listbox-option-is-selected'
        )
            .add({ 'slds-is-disabled': this._disabled })
            .add({
                'avonni-dual-listbox-selected-list-with-search': this
                    ._searchEngine
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

    get computedListItemClass() {
        return classSet('slds-listbox__item')
            .add({
                'avonni-dual-listbox-option-border_bottom': !this
                    .hideBottomDivider
            })
            .toString();
    }

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

    handleBlur(event) {
        this.interactingState.leave();

        const element = event.target;
        if (element.role !== 'option') {
            this.isFocusOnList = false;
        }
    }

    handleRightButtonClick() {
        this.interactingState.interacting();
        this.moveOptionsBetweenLists(true, true);
    }

    handleDragRight() {
        this.interactingState.interacting();
        this.moveOptionsBetweenLists(true, false);
        this._dropItSelected = false;
    }

    handleLeftButtonClick() {
        this.interactingState.interacting();
        this.moveOptionsBetweenLists(false, true);
    }

    handleDragLeft() {
        this.interactingState.interacting();
        this.moveOptionsBetweenLists(false, false);
        this._dropItSource = false;
    }

    handleUpButtonClick() {
        this.interactingState.interacting();
        this.changeOrderOfOptionsInList(true);
    }

    handleDownButtonClick() {
        this.interactingState.interacting();
        this.changeOrderOfOptionsInList(false);
    }

    handleOptionKeyDown(event) {
        this.interactingState.interacting();
        if (this.disabled) {
            return;
        }
        handleKeyDownOnOption(event, this.keyboardInterface);
    }

    handleSearch(event) {
        this._searchTerm = event.detail.value;
    }

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

    disabledButtons() {
        const selectedLength = this._selectedValues.length - 1;

        this._upButtonDisabled = this.highlightedOptions.find((option) => {
            return this._selectedValues.indexOf(option) === 0;
        });

        this._downButtonDisabled = this.highlightedOptions.find((option) => {
            return this._selectedValues.indexOf(option) === selectedLength;
        });
    }

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

    updateCurrentSelectedList(currentList, isMultiple) {
        if (this.selectedList !== currentList || !isMultiple) {
            if (this.selectedList) {
                this.highlightedOptions = [];
                this.lastSelected = -1;
            }
            this.selectedList = currentList;
        }
    }

    dispatchChangeEvent(values) {
        // the change event needs to propagate to elements outside of the light-DOM, hence making it composed.
        this.dispatchEvent(
            new CustomEvent('change', {
                composed: true,
                bubbles: true,
                detail: { value: values }
            })
        );
    }

    assertRequiredAttributes() {
        assert(
            !!this.options,
            `<avonni-dual-listbox> Missing required "options" attribute.`
        );
    }

    swapOptions(i, j, array) {
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    getElementsOfList(listId) {
        const elements = this.template.querySelectorAll(
            `div[data-type='${listId}']`
        );
        return elements ? elements : [];
    }

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

    getOptionIndex(optionElement) {
        return parseInt(optionElement.getAttribute('data-index'), 10);
    }

    getListId(optionElement) {
        return getRealDOMId(optionElement.parentElement.parentElement);
    }

    updateFocusableOption(listId, value) {
        if (listId === this.computedSourceListId) {
            this.focusableInSource = value;
        } else if (listId === this.computedSelectedListId) {
            this.focusableInSelected = value;
        }
        this.optionToFocus = value;
    }

    isNumber(value) {
        return value !== '' && value !== null && isFinite(value);
    }

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

    handleDragStartSource(event) {
        event.currentTarget.classList.add('avonni-dual-listbox-dragging');
    }

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

    handleDragStartSelected(event) {
        event.currentTarget.classList.add('avonni-dual-listbox-dragging');
    }

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

    handleDragOverSource(event) {
        event.preventDefault();
        this._dropItSource = true;
    }

    handleDragLeaveSource() {
        this._dropItSource = false;
    }

    handleDragOverSelected(event) {
        event.preventDefault();
        this._dropItSelected = true;
    }

    handleDragLeaveSelected() {
        this._dropItSelected = false;
    }

    handleDragOver(event) {
        event.preventDefault();
        this._newIndex = Number(event.target.getAttribute('data-index'));
    }
}
