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

/**
 * A widget that provides a user with an input field that is either an autocomplete or readonly, accompanied by a listbox of options.
 *
 * @class
 * @public
 * @storyId example-combobox--base
 * @descriptor avonni-combobox
 */
export default class AvonniCombobox extends LightningElement {
    /**
     * Help text detailing the purpose and function of the combobox.
     *
     * @type {string}
     * @public
     */
    @api fieldLevelHelp;

    /**
     * Text label for the combobox.
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
    @api messageWhenValueMissing;

    /**
     * Specifies the name of the combobox.
     *
     * @type {string}
     * @public
     */
    @api name;

    /**
     * Custom search function to execute instead of the default search. It has to:
     * * Take an object with two keys as an argument: options and searchTerm.
     * * Return the new options.
     *
     * @type {function}
     * @public
     */
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

    selectedOptions = [];
    scopesValue;

    /**
     * Array of action objects. The actions are displayed at the end of the combobox options.
     *
     * @type {object[]}
     * @public
     */
    @api
    get actions() {
        return this._actions;
    }
    set actions(value) {
        this._actions = normalizeArray(value);
    }

    /**
     * If present, the combobox options are searchable.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get allowSearch() {
        return this._allowSearch;
    }
    set allowSearch(value) {
        this._allowSearch = normalizeBoolean(value);
    }

    /**
     * If present, the combobox is disabled and users cannot interact with it.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    /**
     * Specifies where the drop-down list is aligned with or anchored to the selection field.
     * Valid values include auto, left, center, right, bottom-left, bottom-center and bottom-right.
     * By default the list is aligned with the selection field at the top left so the list opens down.
     * Use bottom-left to make the selection field display at the bottom so the list opens above it.
     * Use auto to let the component determine where to open the list based on space available.
     *
     * @type {string}
     * @default left
     * @public
     */
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

    /**
     * Maximum length of the dropdown menu. Valid values include 5-items, 7-items and 10-items.
     *
     * @type {string}
     * @default 7-items
     * @public
     */
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

    /**
     * Array of group objects. The groups are used to separate the options inside the drop-down.
     *
     * @type {object[]}
     * @public
     */
    @api
    get groups() {
        return this._groups;
    }
    set groups(value) {
        this._groups = normalizeArray(value);
    }

    /**
     * If present, the selected options pills will be hidden.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get hideSelectedOptions() {
        return this._hideSelectedOptions;
    }
    set hideSelectedOptions(value) {
        this._hideSelectedOptions = normalizeBoolean(value);
    }

    /**
     * If true, the drop-down menu is in a loading state and shows a spinner.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get isLoading() {
        return this._isLoading;
    }
    set isLoading(value) {
        this._isLoading = normalizeBoolean(value);
    }

    /**
     * If present, multiple options can be selected.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get isMultiSelect() {
        return this._isMultiSelect;
    }
    set isMultiSelect(value) {
        this._isMultiSelect = normalizeBoolean(value);
    }

    /**
     * Message displayed while the combobox is in the loading state.
     *
     * @type {string}
     * @default Loading
     * @public
     */
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

    /**
     * If present, groups can contain other groups. Each group added to an option will create a level of depth.
     *
     * If false, there will be only one level of groups.
     * If an option belongs to several groups, the option will be repeated in each group.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get multiLevelGroups() {
        return this._multiLevelGroups;
    }
    set multiLevelGroups(value) {
        this._multiLevelGroups = normalizeBoolean(value);
    }

    /**
     * Array of option objects.
     *
     * @type {object[]}
     * @public
     */
    @api
    get options() {
        return this._options;
    }
    set options(value) {
        this._options = normalizeArray(value);
    }

    /**
     * Text that is displayed before an option is selected, to prompt the user to select an option.
     *
     * The default value varies depending on the value of allow-search.
     *
     * @type {string}
     * @default Select an option -or- Search…
     * @public
     */
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

    /**
     * If present, the combobox is read-only. A read-only combobox is also disabled.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get readOnly() {
        return this._readOnly;
    }
    set readOnly(value) {
        this._readOnly = normalizeBoolean(value);
    }

    /**
     * If present, the selected options will be removed from the options.
     *
     * If false, a checkmark will be displayed next to the selected options.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get removeSelectedOptions() {
        return this._removeSelectedOptions;
    }
    set removeSelectedOptions(value) {
        this._removeSelectedOptions = normalizeBoolean(value);
    }

    /**
     * If present, a value must be selected before the form can be submitted.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get required() {
        return this._required;
    }
    set required(value) {
        this._required = normalizeBoolean(value);
    }

    /**
     * Describes the selected options section to assistive technologies.
     *
     * @type {string}
     * @default Selected Options
     * @public
     */
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

    /**
     * Array of scope objects. The scopes are displayed in a drop-down menu, to the left of the combobox input.
     *
     * @type {object[]}
     * @public
     */
    @api
    get scopes() {
        return this._scopes;
    }
    set scopes(value) {
        this._scopes = normalizeArray(value);
        this.scopesValue = this.scopes.length && [this.scopes[0].value];
    }

    /**
     * Array of group objects. The groups are used to separate the scopes inside the drop-down.
     *
     * @type {object[]}
     * @public
     */
    @api
    get scopesGroups() {
        return this._scopesGroups;
    }
    set scopesGroups(value) {
        this._scopesGroups = normalizeArray(value);
    }

    /**
     * Represents the validity states that an element can be in, with respect to constraint validation.
     *
     * @type {string}
     * @public
     */
    @api
    get validity() {
        return (this.mainCombobox && this.mainCombobox.validity) || false;
    }

    /**
     * Array of selected options value. If is-multi-select is false and several values are passed, only the first one will be taken into account.
     *
     * @type {string[]}
     * @public
     */
    @api
    get value() {
        return this._value;
    }
    set value(value) {
        this._value =
            typeof value === 'string' ? [value] : [...normalizeArray(value)];
    }

    /**
     * The variant changes the appearance of the combobox.
     * Accepted variants include standard, label-hidden, label-inline, and label-stacked.
     * This value defaults to standard. Use label-hidden to hide the label but make it available to assistive technology.
     * Use label-inline to horizontally align the label and combobox.
     * Use label-stacked to place the label above the combobox.
     *
     * @type {string}
     * @default standard
     * @public
     */
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

    /**
     * Selects the main combobox.
     *
     * @type {element}
     */
    get mainCombobox() {
        return this.template.querySelector('.combobox__main-combobox');
    }

    /**
     * True if scopes.
     *
     * @type {boolean}
     */
    get showScopes() {
        return this.scopes.length;
    }

    /**
     * True if hide-selected-options is false, is-multi-select is true and selected-options.
     *
     * @type {boolean}
     */
    get showSelectedOptions() {
        return (
            !this.hideSelectedOptions &&
            this.isMultiSelect &&
            this.selectedOptions.length
        );
    }

    /**
     * Computed Label Class styling.
     *
     * @type {string}
     */
    get computedLabelClass() {
        return classSet('slds-form-element__label')
            .add({ 'slds-assistive-text': this.variant === 'label-hidden' })
            .toString();
    }

    /**
     * Computed Main Combobox Class styling.
     *
     * @type {string}
     */
    get computedMainComboboxClass() {
        return classSet('combobox__main-combobox')
            .add({
                'slds-combobox-addon_end slds-col': this.showScopes
            })
            .toString();
    }

    /**
     * Computed Combobox Group Class styling.
     *
     * @type {string}
     */
    get computedComboboxGroupClass() {
        return this.showScopes ? 'slds-combobox-group' : undefined;
    }

    /**
     * Removes focus from the combobox.
     *
     * @public
     */
    @api
    blur() {
        this.mainCombobox.blur();
    }

    /**
     * Indicates whether the element meets all constraint validations.
     *
     * @returns {boolean} the valid attribute value on the ValidityState object.
     * @public
     */
    @api
    checkValidity() {
        return this.mainCombobox.checkValidity();
    }

    /**
     * Closes the dropdown.
     *
     * @public
     */
    @api
    close() {
        this.mainCombobox.close();
    }

    /**
     * Sets focus on the combobox.
     *
     * @public
     */
    @api
    focus() {
        this.mainCombobox.focus();
    }

    /**
     * Opens the dropdown.
     *
     * @public
     */
    @api
    open() {
        this.mainCombobox.open();
    }

    /**
     * Displays the error messages and returns false if the input is invalid.
     * If the input is valid, reportValidity() clears displayed error messages and returns true.
     *
     * @returns {boolean} - The validity status of the input fields.
     * @public
     */
    @api
    reportValidity() {
        return this.mainCombobox.reportValidity();
    }

    /**
     * Sets a custom error message to be displayed when a form is submitted.
     * 
     * @param {string} message - The string that describes the error. If message is an empty string, the error message is reset.
     * @public
     */
    @api
    setCustomValidity(message) {
        this.mainCombobox.setCustomValidity(message);
    }

    /**
     * Displays error messages on invalid fields.
     * An invalid field fails at least one constraint validation and returns false when checkValidity() is called.
     *
     * @public
     */
    @api
    showHelpMessageIfInvalid() {
        this.reportValidity();
    }

    /**
     * Dispatches blur event.
     */
    handleBlur() {
        this.dispatchEvent(new CustomEvent('blur'));
    }

    /**
     * Dispatches focus event.
     */
    handleFocus() {
        this.dispatchEvent(new CustomEvent('focus'));
    }

    /**
     * Dispatches search event.
     */
    handleSearch(event) {
        /**
         * @event
         * @name search
         * The event fired when a user types into the combobox input.
         * @param {string} value The value of the search input.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('search', {
                detail: {
                    value: event.detail.value
                }
            })
        );
    }

    /**
     * Dispatches scope change event.
     */
    handleScopeChange(event) {
        /**
         * The event fired when a scope is selected.
         * 
         * @event
         * @name scopeChange
         * @param {string} value The value of the scope selected.
         * @bubbles
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('scopechange', {
                detail: {
                    value: event.detail.value[0]
                },
                bubbles: true
            })
        );
    }

    /**
     * Dispatches action click event.
     */
    handleActionClick(event) {
        /**
         * @event
         * @name actionClick
         * The event fired when a user clicks on an action.
         * @param {string} name The name of the action clicked.
         * @bubbles
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('actionclick', {
                detail: {
                    name: event.detail.name
                },
                bubbles: true
            })
        );
    }

    /**
     * Dispatches change event.
     */
    handleChange(event) {
        this._value = event.detail.value;
        /**
         * The event fired when a user clicks on an action.
         * 
         * @event
         * @name change
         * @param {string[]} value The new value of the combobox.
         * @bubbles
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value: this.value
                },
                bubbles: true
            })
        );
    }

    /**
     * Dispatches open event.
     */
    handleOpen() {
        /**
         * The event fired when the drop-down is opened.
         * It is not fired when the drop-down is opened programmatically with the open() method.
         * 
         * @event
         * @name open
         * @public
         */
        this.dispatchEvent(new CustomEvent('open'));
    }

    /**
     * Handles private select for primitive-combobox.
     */
    handlePrivateSelect(event) {
        this.selectedOptions = event.detail.selectedOptions;
    }

    /**
     * Handles remove for lightning-pill.
     */
    handleRemoveSelectedOption(event) {
        this.mainCombobox.handleRemoveSelectedOption(event);
    }
}
