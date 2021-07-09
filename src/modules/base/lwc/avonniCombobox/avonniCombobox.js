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
    normalizeArray,
    normalizeBoolean,
    normalizeString,
    classListMutation
} from 'c/utilsPrivate';
import { classSet } from 'c/utils';

const DROPDOWN_ALIGNMENTS = {
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

const VARIANTS = {
    valid: ['standard', 'label-inline', 'label-hidden', 'label-stacked'],
    default: 'standard'
};

const DROPDOWN_LENGTHS = {
    valid: ['5-items', '7-items', '10-items'],
    default: '7-items'
};

const DEFAULT_LOADING_STATE_ALTERNATIVE_TEXT = 'Loading';
const DEFAULT_PLACEHOLDER = 'Select an Option';
const DEFAULT_PLACEHOLDER_WHEN_SEARCH_ALLOWED = 'Search...';
const DEFAULT_SELECTED_OPTIONS_ARIA_LABEL = 'Selected Options';

// Default LWC message
const DEFAULT_MESSAGE_WHEN_VALUE_MISSING = 'Complete this field.';

export default class AvonniCombobox extends LightningElement {
    @api fieldLevelHelp;
    @api label;
    @api name;
    @api search;

    _actions = [];
    _allowSearch = false;
    _disabled = false;
    _dropdownAlignment = DROPDOWN_ALIGNMENTS.default;
    _dropdownLength = DROPDOWN_LENGTHS.default;
    _groups = [];
    _hideSelectedOptions = false;
    _isLoading = false;
    _isMultiSelect = false;
    _loadingStateAlternativeText = DEFAULT_LOADING_STATE_ALTERNATIVE_TEXT;
    _messageWhenValueMissing = DEFAULT_MESSAGE_WHEN_VALUE_MISSING;
    _multiLevelGroups = false;
    _options = [];
    _placeholder;
    _readOnly = false;
    _removeSelectedOptions = false;
    _required = false;
    _selectedOptionsAriaLabel = DEFAULT_SELECTED_OPTIONS_ARIA_LABEL;
    _scopes = [];
    _scopesGroups = [];
    _search = this.computeSearch;
    _value = [];
    _variant = VARIANTS.default;

    helpMessage;
    selectedOptions = [];
    scopesValue;

    @api
    get actions() {
        return this._actions;
    }
    set actions(value) {
        this._actions = normalizeArray(value);
    }

    @api
    get allowSearch() {
        return this._allowSearch;
    }
    set allowSearch(value) {
        this._allowSearch = normalizeBoolean(value);
    }

    @api
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    @api
    get dropdownAlignment() {
        return this._dropdownAlignment;
    }
    set dropdownAlignment(value) {
        this._dropdownAlignment = normalizeString(value, {
            validValues: DROPDOWN_ALIGNMENTS.valid,
            fallbackValue: DROPDOWN_ALIGNMENTS.default
        });
    }

    @api
    get dropdownLength() {
        return this._dropdownLength;
    }
    set dropdownLength(value) {
        this._dropdownLength = normalizeString(value, {
            fallbackValue: DROPDOWN_LENGTHS.default,
            validValues: DROPDOWN_LENGTHS.valid
        });
    }

    @api
    get groups() {
        return this._groups;
    }
    set groups(value) {
        this._groups = normalizeArray(value);
    }

    @api
    get hideSelectedOptions() {
        return this._hideSelectedOptions;
    }
    set hideSelectedOptions(value) {
        this._hideSelectedOptions = normalizeBoolean(value);
    }

    @api
    get isLoading() {
        return this._isLoading;
    }
    set isLoading(value) {
        this._isLoading = normalizeBoolean(value);
    }

    @api
    get isMultiSelect() {
        return this._isMultiSelect;
    }
    set isMultiSelect(value) {
        this._isMultiSelect = normalizeBoolean(value);
    }

    @api
    get loadingStateAlternativeText() {
        return this._loadingStateAlternativeText;
    }
    set loadingStateAlternativeText(value) {
        this._loadingStateAlternativeText =
            typeof value === 'string'
                ? value.trim()
                : DEFAULT_LOADING_STATE_ALTERNATIVE_TEXT;
    }

    @api
    get messageWhenValueMissing() {
        return this._messageWhenValueMissing;
    }
    set messageWhenValueMissing(value) {
        this._messageWhenValueMissing =
            typeof value === 'string'
                ? value.trim()
                : DEFAULT_MESSAGE_WHEN_VALUE_MISSING;
    }

    @api
    get multiLevelGroups() {
        return this._multiLevelGroups;
    }
    set multiLevelGroups(value) {
        this._multiLevelGroups = normalizeBoolean(value);
    }

    @api
    get options() {
        return this._options;
    }
    set options(value) {
        this._options = normalizeArray(value);
    }

    @api
    get placeholder() {
        if (this._placeholder) return this._placeholder;

        return this.allowSearch
            ? DEFAULT_PLACEHOLDER_WHEN_SEARCH_ALLOWED
            : DEFAULT_PLACEHOLDER;
    }
    set placeholder(value) {
        this._placeholder = value;
    }

    @api
    get readOnly() {
        return this._readOnly;
    }
    set readOnly(value) {
        this._readOnly = normalizeBoolean(value);
    }

    @api
    get removeSelectedOptions() {
        return this._removeSelectedOptions;
    }
    set removeSelectedOptions(value) {
        this._removeSelectedOptions = normalizeBoolean(value);
    }

    @api
    get required() {
        return this._required;
    }
    set required(value) {
        this._required = normalizeBoolean(value);
    }

    @api
    get selectedOptionsAriaLabel() {
        return this._selectedOptionsAriaLabel;
    }
    set selectedOptionsAriaLabel(value) {
        this._selectedOptionsAriaLabel =
            typeof value === 'string'
                ? value.trim()
                : DEFAULT_SELECTED_OPTIONS_ARIA_LABEL;
    }

    @api
    get scopes() {
        return this._scopes;
    }
    set scopes(value) {
        this._scopes = normalizeArray(value);
        this.scopesValue = this.scopes.length && [this.scopes[0].value];
    }

    @api
    get scopesGroups() {
        return this._scopesGroups;
    }
    set scopesGroups(value) {
        this._scopesGroups = normalizeArray(value);
    }

    @api
    get validity() {
        return (this.mainCombobox && this.mainCombobox.validity) || false;
    }

    @api
    get value() {
        return this._value;
    }
    set value(value) {
        this._value =
            typeof value === 'string' ? [value] : [...normalizeArray(value)];
    }

    @api
    get variant() {
        return this._variant;
    }
    set variant(value) {
        this._variant = normalizeString(value, {
            validValues: VARIANTS.valid,
            fallbackValue: VARIANTS.default
        });

        classListMutation(this.classList, {
            'slds-form-element_stacked': this._variant === 'label-stacked',
            'slds-form-element_horizontal': this._variant === 'label-inline'
        });
    }

    get mainCombobox() {
        return this.template.querySelector('.combobox__main-combobox');
    }

    get showScopes() {
        return this.scopes.length;
    }

    get showSelectedOptions() {
        return (
            !this.hideSelectedOptions &&
            this.isMultiSelect &&
            this.selectedOptions.length
        );
    }

    get computedLabelClass() {
        return classSet('slds-form-element__label')
            .add({ 'slds-assistive-text': this.variant === 'label-hidden' })
            .toString();
    }

    get computedMainComboboxClass() {
        return classSet('combobox__main-combobox')
            .add({
                'slds-combobox-addon_end slds-col': this.showScopes
            })
            .toString();
    }

    get computedComboboxGroupClass() {
        return this.showScopes ? 'slds-combobox-group' : undefined;
    }

    @api
    blur() {
        this.mainCombobox.blur();
    }

    @api
    checkValidity() {
        return this.mainCombobox.checkValidity();
    }

    @api
    close() {
        this.mainCombobox.close();
    }

    @api
    focus() {
        this.mainCombobox.focus();
    }

    @api
    open() {
        this.mainCombobox.open();
    }

    @api
    reportValidity() {
        return this.mainCombobox.reportValidity();
    }

    @api
    setCustomValidity(message) {
        this.mainCombobox.setCustomValidity(message);
    }

    @api
    showHelpMessageIfInvalid() {
        this.reportValidity();
    }

    handleBlur() {
        this.dispatchEvent(new CustomEvent('blur'));
    }

    handleFocus() {
        this.dispatchEvent(new CustomEvent('focus'));
    }

    handleSearch(event) {
        this.dispatchEvent(
            new CustomEvent('search', {
                detail: {
                    value: event.detail.value
                }
            })
        );
    }

    handleScopeChange(event) {
        this.dispatchEvent(
            new CustomEvent('scopechange', {
                detail: {
                    value: event.detail.value[0]
                },
                bubbles: true
            })
        );
    }

    handleActionClick(event) {
        this.dispatchEvent(
            new CustomEvent('actionclick', {
                detail: {
                    name: event.detail.name
                },
                bubbles: true
            })
        );
    }

    handleChange(event) {
        this._value = event.detail.value;
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value: this.value
                },
                bubbles: true
            })
        );
    }

    handleOpen() {
        this.dispatchEvent(new CustomEvent('open'));
    }

    handlePrivateSelect(event) {
        this.selectedOptions = event.detail.selectedOptions;
    }

    handleRemoveSelectedOption(event) {
        this.mainCombobox.handleRemoveSelectedOption(event);
    }
}
