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
import Option from './avonniOption';
import Action from './avonniAction';
import {
    normalizeArray,
    normalizeBoolean,
    normalizeString,
    getListHeight,
    normalizeAriaAttribute,
    classListMutation
} from 'c/utilsPrivate';
import { InteractingState, FieldConstraintApi } from 'c/inputUtils';
import { classSet, generateUUID } from 'c/utils';
import { AutoPosition, Direction } from 'c/positionLibrary';

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
const DEFAULT_GROUP_NAME = 'ungrouped';

/**
 * Primitive Combobox.
 *
 * @class
 */
export default class AvonniPrimitiveCombobox extends LightningElement {
    /**
     * Help text detailing the purpose and function of the primitive combobox.
     *
     * @type {string}
     * @public
     */
    @api fieldLevelHelp;

    /**
     * Text label for the primitive combobox.
     *
     * @type {string}
     * @public
     */
    @api label;

    /**
     * Error message to be displayed when a bad input is detected.
     *
     * @type {string}
     * @public
     */
    @api messageWhenBadInput;

    /**
     * Error message to be displayed when the value is missing and input is required.
     *
     * @type {string}
     * @public
     */
    @api messageWhenValueMissing;

    /**
     * Specifies the name of the primitive combobox.
     *
     * @type {string}
     * @public
     */
    @api name;

    _actions = [];
    _allowSearch = false;
    _disabled = false;
    _dropdownAlignment = DROPDOWN_ALIGNMENTS.default;
    _dropdownLength = DROPDOWN_LENGTHS.default;
    _groups = [{ name: DEFAULT_GROUP_NAME }];
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
    _search = this.computeSearch;
    _selectedOptionsAriaLabel = DEFAULT_SELECTED_OPTIONS_ARIA_LABEL;
    _hideClearIcon = false;
    _value = [];
    _variant = VARIANTS.default;

    _autoPosition;
    _cancelBlur = false;
    _maxVisibleOptions = Number(DROPDOWN_LENGTHS.default.match(/[0-9]+/)[0]);
    _highlightedOptionIndex = 0;
    _visibleOptions = [];
    backLink;
    computedGroups = [];
    dropdownVisible = false;
    helpMessage;
    inputValue = '';
    parentOptionsValues = [];
    selectedOption;
    selectedOptions = [];
    topActions = [];
    bottomActions = [];

    connectedCallback() {
        this.initValue();

        if (this.removeSelectedOptions) {
            this.visibleOptions = this.removeSelectedOptionsFrom(
                this.visibleOptions
            );
        }

        this.interactingState = new InteractingState();
        this.interactingState.onleave(() => this.showHelpMessageIfInvalid());
        this._connected = true;
    }

    renderedCallback() {
        if (this.dropdownVisible) {
            this.updateDropdownHeight();
            this.highlightOption(0);
        }
    }

    /**
     * Array of action objects. The actions are displayed at the end of the primitive combobox options.
     *
     * @type {object[]}
     * @public
     */
    @api
    get actions() {
        return this._actions;
    }
    set actions(value) {
        const actions = normalizeArray(value);
        this.topActions = [];
        this.bottomActions = [];
        this._actions = [];

        actions.forEach((action) => {
            const actionObject = new Action(action);
            this._actions.push(actionObject);

            if (actionObject.position === 'bottom') {
                this.bottomActions.push(actionObject);
            } else {
                this.topActions.push(actionObject);
            }
        });
    }

    /**
     * If present, the primitive combobox options are searchable.
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
     * If present, the primitive combobox is disabled and users cannot interact with it.
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

        this._maxVisibleOptions = Number(
            this._dropdownLength.match(/[0-9]+/)[0]
        );
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
        this._groups = [...normalizeArray(value)];

        // Add a default group for options without groups
        this._groups.unshift({ name: DEFAULT_GROUP_NAME });
        if (this.visibleOptions.length) this.computeGroups();
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
        if (this._connected) this.initValue();
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

        if (this.groups.length && this.visibleOptions.length)
            this.computeGroups();
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
        const options = normalizeArray(value);
        const optionObjects = this.initOptionObjects(options);
        this._options = optionObjects;
        this.visibleOptions = optionObjects;

        if (this._connected) {
            this.initValue();
        }
    }

    /**
     * Text that is displayed before an option is selected, to prompt the user to select an option.
     *
     * The default value varies depending on the value of allow-search.
     *
     * @type {string}
     * @default Select an Option -or- Search…
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
     * Custom search function to execute instead of the default search. It has to:
     * * Take an object with two keys as an argument: options and searchTerm
     * * Return the new options.
     *
     * @type {function}
     * @public
     */
    @api
    get search() {
        return this._search;
    }
    set search(value) {
        this._search = typeof value === 'function' ? value : this.computeSearch;
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
     * If present, it is not possible to clear a selected option using the input clear icon.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get hideClearIcon() {
        return this._hideClearIcon;
    }
    set hideClearIcon(value) {
        this._hideClearIcon = normalizeBoolean(value);
    }

    /**
     * Represents the validity states that an element can be in, with respect to constraint validation.
     *
     * @type {string}
     * @public
     */
    @api
    get validity() {
        return this._constraint.validity;
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
            typeof value === 'string' ? [value] : normalizeArray(value);
        if (this._connected) this.initValue();
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
     * Returns an array of visible options.
     *
     * @type {object[]}
     */
    get visibleOptions() {
        return this._visibleOptions;
    }
    set visibleOptions(value) {
        this._visibleOptions =
            this._connected && this.removeSelectedOptions
                ? this.removeSelectedOptionsFrom(value)
                : value;

        this.computeGroups();
    }

    /**
     * Returns a boolean indicating if the value is valid or not.
     *
     * @type {boolean}
     */
    get hasBadInput() {
        let values = [];
        this.options.forEach((option) => {
            if (option.options) {
                option.options.forEach((innerOption) => {
                    values.push(innerOption.value);
                });
            }
            values.push(option.value);
        });
        if (this.isMultiSelect) {
            return this.hasBadValues;
        }
        return this._value.length === 0 || this._value[0] === ''
            ? true
            : values.some((e) => this._value.includes(e));
    }

    /**
     * Gets FieldConstraintApi.
     *
     * @type {object}
     */
    get _constraint() {
        if (!this._constraintApi) {
            this._constraintApi = new FieldConstraintApi(() => this, {
                valueMissing: () =>
                    !this.disabled && this.required && this.value.length === 0,
                badInput: () => !this.hasBadInput
            });
        }
        return this._constraintApi;
    }

    /**
     * Returns a unique ID.
     *
     * @type {string}
     */
    get generateKey() {
        return generateUUID();
    }

    /**
     * Returns an input element.
     *
     * @type {element}
     */
    get input() {
        return this.template.querySelector('[data-element-id="input"]');
    }

    /**
     * Returns an icon name for the input depending on allow-search attribute.
     *
     * @type {string}
     */
    get inputIconName() {
        return this.allowSearch ? 'utility:search' : 'utility:down';
    }

    /**
     * If true, display value avatar.
     *
     * @type {boolean}
     */
    get showInputValueAvatar() {
        return (
            this.selectedOption &&
            !this.selectedOption.iconName &&
            this.inputValue === this.selectedOption.label &&
            (this.selectedOption.avatarSrc ||
                this.selectedOption.avatarFallbackIconName)
        );
    }

    /**
     * If true, display value icon.
     *
     * @type {boolean}
     */
    get showInputValueIcon() {
        return this.selectedOption && this.selectedOption.iconName;
    }

    /**
     * True if disabled or read-only are true.
     *
     * @type {boolean}
     */
    get inputIsDisabled() {
        return this.disabled || this.readOnly;
    }

    /**
     * True if allow-search is false.
     *
     * @type {boolean}
     */
    get hasNoSearch() {
        return !this.allowSearch;
    }

    /**
     * Returns true as a string if dropdown-visible is true and false as a string if false.
     *
     * @type {string}
     */
    get computedAriaExpanded() {
        return this.dropdownVisible ? 'true' : 'false';
    }

    /**
     * Returns none if this.readOnly or this.disabled is present and list if not.
     *
     * @type {string}
     */
    get computedAriaAutocomplete() {
        return this.readOnly || this.disabled ? 'none' : 'list';
    }

    /**
     * True if parent-options-values and current parent.
     *
     * @type {boolean}
     */
    get currentParent() {
        return (
            this.parentOptionsValues.length &&
            this.getOption(
                this.parentOptionsValues[this.parentOptionsValues.length - 1]
            )
        );
    }

    /**
     * Returns an array of options element.
     *
     * @type {element}
     */
    get _optionElements() {
        if (this.dropdownVisible) {
            const elements = [];
            const topActions = this.template.querySelectorAll(
                '.combobox__action_top'
            );
            topActions.forEach((action) => {
                if (action.ariaDisabled === 'false') elements.push(action);
            });

            const backLink = this.template.querySelector(
                '[data-name="backlink"]'
            );
            if (backLink) elements.push(backLink);

            const groups = this.template.querySelectorAll(
                '[data-element-id^="avonni-primitive-combobox-group"]'
            );
            groups.forEach((group) => {
                elements.push(group.optionElements);
            });

            const bottomActions = this.template.querySelectorAll(
                '.combobox__action_bottom'
            );
            bottomActions.forEach((action) => {
                if (action.ariaDisabled === 'false') elements.push(action);
            });

            return elements.flat();
        }
        return [];
    }

    /**
     * True if highlighted-option.
     *
     * @type {boolean}
     */
    get _highlightedOption() {
        return (
            this._optionElements.length &&
            this._optionElements[this._highlightedOptionIndex]
        );
    }

    /**
     * True if selected-options, multi-select is true and hide-selected-options is false.
     *
     * @type {boolean}
     */
    get showSelectedOptions() {
        return (
            !this.hideSelectedOptions &&
            this.isMultiSelect &&
            this.selectedOptions.length > 0
        );
    }

    /**
     * True if hide-clear-input is false and the input has a value.
     *
     * @type {boolean}
     */
    get showClearInputIcon() {
        return !this.hideClearIcon && this.inputValue !== '';
    }

    /**
     * True if input-value and no visible-options.
     *
     * @type {boolean}
     */
    get showNoSearchResultMessage() {
        return this.inputValue && !this.visibleOptions.length;
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
     * Computed Dropdown Trigger Class styling.
     *
     * @type {string}
     */
    get computedDropdownTriggerClass() {
        return classSet(
            'slds-is-relative slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click combobox__dropdown-trigger'
        )
            .add({
                'slds-is-open': this.dropdownVisible,
                'slds-has-icon-only slds-combobox_container':
                    this.showInputValueIcon
            })
            .toString();
    }

    /**
     * Computed Dropdown Class styling.
     *
     * @type {string}
     */
    get computedDropdownClass() {
        return classSet(
            'slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid combobox__dropdown'
        )
            .add({
                'slds-dropdown_left':
                    this.dropdownAlignment === 'left' ||
                    this.dropdownAlignment === 'auto',
                'slds-dropdown_center': this.dropdownAlignment === 'center',
                'slds-dropdown_right': this.dropdownAlignment === 'right',
                'slds-dropdown_bottom':
                    this.dropdownAlignment === 'bottom-center',
                'slds-dropdown_bottom slds-dropdown_right slds-dropdown_bottom-right':
                    this.dropdownAlignment === 'bottom-right',
                'slds-dropdown_bottom slds-dropdown_left slds-dropdown_bottom-left':
                    this.dropdownAlignment === 'bottom-left'
            })
            .toString();
    }

    /**
     * Computed Input Container Class styling.
     *
     * @type {string}
     */
    get computedInputContainerClass() {
        return classSet('slds-combobox__form-element slds-input-has-icon')
            .add({
                'slds-input-has-icon_left-right combobox__input-has-icon_left-right':
                    this.showInputValueAvatar || this.showInputValueIcon,
                'slds-input-has-icon_right':
                    !this.showInputValueAvatar && !this.showInputValueIcon
            })
            .toString();
    }

    /**
     * True if read-only and is-multi-select is false.
     *
     * @type {boolean}
     */
    get readOnlyNotMultiSelect() {
        return this.readOnly && !this.isMultiSelect;
    }

    /**
     * True if value is valid returns the input value, if else return the value.
     *
     * @type {string}
     */
    get readOnlyValue() {
        return this.validity.valid ? this.inputValue : '';
    }

    get readOnlyLabel() {
        return this.label ? this.label : 'Read Only Combobox';
    }

    /**
     * Removes focus from the input.
     *
     * @public
     */
    @api
    blur() {
        if (this.input) this.input.blur();
    }

    /**
     * Checks if the input is valid.
     *
     * @returns {boolean} True if the element meets all constraint validations.
     * @public
     */
    @api
    checkValidity() {
        return this._constraint.checkValidity();
    }

    /**
     * Closes the dropdown.
     *
     * @public
     */
    @api
    close() {
        if (this.dropdownVisible) {
            this.dropdownVisible = false;
            this.stopDropdownPositioning();

            if (this.isMultiSelect) {
                // Reset options
                this.visibleOptions = [...this.options];
                this.parentOptionsValues = [];
                this.backLink = undefined;
            } else {
                // Reset to current visible level and erase the search
                this.visibleOptions =
                    (this.currentParent && this.currentParent.options) ||
                    this.options;
            }
        }
    }

    /**
     * Sets focus on the input.
     *
     * @public
     */
    @api
    focus() {
        if (this.input) this.input.focus();
    }

    /**
     * Opens the dropdown.
     *
     * @public
     */
    @api
    open() {
        const hasItems = this.options.length || this.actions.length;
        if (
            !this.inputIsDisabled &&
            !this.dropdownVisible &&
            (hasItems || this.isLoading)
        ) {
            this.dropdownVisible = true;
            this.startDropdownAutoPositioning();
        }
    }

    /**
     * Displays the error messages. If the input is valid, <code>reportValidity()</code> clears displayed error messages.
     *
     * @returns {boolean} False if invalid, true if valid.
     * @public
     */
    @api
    reportValidity() {
        return this._constraint.reportValidity((message) => {
            this.helpMessage = this.messageWhenValueMissing || message;
        });
    }

    /**
     * Sets a custom error message to be displayed when a form is submitted.
     *
     * @param {string} message The string that describes the error. If message is an empty string, the error message is reset.
     * @public
     */
    @api
    setCustomValidity(message) {
        this._constraint.setCustomValidity(message);
    }

    /**
     * Displays error messages on invalid fields.
     * An invalid field fails at least one constraint validation and returns false when <code>checkValidity()</code> is called.
     *
     * @public
     */
    @api
    showHelpMessageIfInvalid() {
        this.reportValidity();
    }

    /**
     * Value initialization.
     */
    initValue() {
        this.inputValue = '';
        if (this.selectedOption) {
            this.selectedOption.selected = false;
            this.selectedOption = undefined;
        }

        if (this.isMultiSelect) {
            this.selectedOptions.forEach((option) => {
                option.selected = false;
            });
            this.value.forEach((value) => {
                const selectedOption = this.getOption(value, this.options);
                if (selectedOption) selectedOption.selected = true;
            });
            this.selectedOption = undefined;
            this.computeSelection();
        } else {
            const selectedOption = this.getOption(this.value[0], this.options);

            if (selectedOption) {
                selectedOption.selected = true;
                this.selectedOption = selectedOption;
                this.inputValue = selectedOption.label;
            }
        }
    }

    /**
     * Option's object initialization.
     */
    initOptionObjects(options) {
        const optionObjects = [];
        options.forEach((option) => {
            const optionObject = new Option(option);

            // If the option has children, generate objects for them too
            const childrenOptions = normalizeArray(option.options);
            if (childrenOptions.length) {
                optionObject.options = this.initOptionObjects(childrenOptions);
            }

            optionObjects.push(optionObject);
        });
        return optionObjects;
    }

    /**
     * Positioning for the dropdown.
     */
    startDropdownAutoPositioning() {
        if (this.dropdownAlignment !== 'auto') {
            return;
        }

        if (!this._autoPosition) {
            this._autoPosition = new AutoPosition(this);
        }

        this._autoPosition.start({
            target: () =>
                this.template.querySelector('[data-element-id="input"]'),
            element: () => this.template.querySelector('div.slds-dropdown'),
            align: {
                horizontal: Direction.Left,
                vertical: Direction.Top
            },
            targetAlign: {
                horizontal: Direction.Left,
                vertical: Direction.Bottom
            },
            autoFlip: true,
            alignWidth: true,
            autoShrinkHeight: true,
            minHeight:
                // Same configuration as lightning-combobox
                this.visibleOptions.length < 3 ? '2.25rem' : '6.75rem'
        });
    }

    // remove-next-line-for-c-namespace
    stopDropdownPositioning() {
        if (this._autoPosition) {
            this._autoPosition.stop();
        }
    }

    /**
     * Calculating the dropdown's height.
     */
    updateDropdownHeight() {
        const groups = this.template.querySelectorAll(
            '[data-element-id^="avonni-primitive-combobox-group"]'
        );
        const visibleItems = [];
        const visibleGroupTitles = [];

        // As long as we haven't reach the maximum visible options or the end of the groups,
        // get the next group options and title
        let i = 0;
        while (
            visibleItems.flat().length < this._maxVisibleOptions &&
            i < groups.length
        ) {
            const options = groups[i].optionElements;
            visibleItems.push(options);

            const title = groups[i].titleElement;
            if (title) visibleGroupTitles.push(title);
            i += 1;
        }

        // Height of the visible options, according to the dropdown length
        const optionsHeight = getListHeight(
            visibleItems.flat(),
            this._maxVisibleOptions
        );

        // Height of the title groups
        const titlesHeight = getListHeight(visibleGroupTitles);

        // Height of the top actions
        const topActions = this.template.querySelectorAll(
            '.combobox__action_top'
        );
        const topActionsHeight = getListHeight(topActions);

        // If we can see all options, add the height of the bottom actions
        let bottomActionsHeight = 0;
        if (this.visibleOptions.length <= this._maxVisibleOptions) {
            const bottomActions = this.template.querySelectorAll(
                '.combobox__action_bottom'
            );
            bottomActionsHeight = getListHeight(bottomActions);
        }

        const dropdown = this.template.querySelector(
            '.combobox__dropdown-trigger .slds-dropdown'
        );
        const height =
            optionsHeight +
            titlesHeight +
            topActionsHeight +
            bottomActionsHeight;

        // Do not set the height when there is no actions or options
        // (for example 0 search results or is loading)
        if (height) {
            dropdown.style.maxHeight = `${height}px`;
        }
    }

    /**
     * Computing the groups.
     */
    computeGroups() {
        const computedGroups = [];

        // For each visible option
        this.visibleOptions.forEach((option) => {
            const optionGroups = option.groups;
            let currentLevelGroups = computedGroups;

            if (optionGroups.length && this.groups.length > 1) {
                // For each group of the option
                optionGroups.forEach((name, index) => {
                    // If groups are nested
                    if (this.multiLevelGroups) {
                        // We push the option only if we have reached the deepest group
                        currentLevelGroups = normalizeArray(
                            this.groupOption({
                                groups: currentLevelGroups,
                                name,
                                option:
                                    index === optionGroups.length - 1
                                        ? option
                                        : undefined
                            })
                        );
                    } else {
                        this.groupOption({
                            groups: computedGroups,
                            name,
                            option
                        });
                    }
                });
            } else {
                // If the option does not have groups,
                // push the option in the default group
                this.groupOption({
                    groups: computedGroups,
                    option,
                    name: DEFAULT_GROUP_NAME
                });
            }
        });

        this.sortGroups(computedGroups);
        this.computedGroups = computedGroups;
    }

    /**
     * Finds a group based on its name, and adds an option to its list.
     * Takes an object with three keys as an argument.
     *
     * @param {array} groups Array of the groups.
     * @param {object} option (optional) The option we want to push in the group. If provided, when the group is found, the option will be added to its options.
     * @param {string} name The name of the group the option belongs to.
     *
     * @returns {array} The children groups of the group that was selected.
     */

    // The rule is disabled, because the default "return" is to call the function again
    // eslint-disable-next-line consistent-return
    groupOption(params) {
        const { groups, option, name } = params;
        const computedGroup = groups.find((grp) => grp.name === name);

        if (computedGroup) {
            // If the group already exists, push the new option in the list
            if (option) computedGroup.options.push(option);
            return computedGroup.groups;
        }

        // If the group does not exist yet but is in the global groups list,
        // create a new group
        const group = this.groups.find((grp) => {
            return grp.name === name;
        });
        if (group) {
            const newGroup = {
                label: group.label,
                name: name,
                options: option ? [option] : [],
                groups: []
            };
            groups.push(newGroup);

            // If we just added the default group, move it up to the first entry
            if (name === DEFAULT_GROUP_NAME) this.sortGroups(groups);

            return newGroup.groups;
        }
        // If the group is not in the global groups list,
        // push the option in the default group
        this.groupOption({
            groups,
            option,
            name: DEFAULT_GROUP_NAME
        });
    }

    /**
     * Move the default group at the top.
     */
    sortGroups(groups) {
        const defaultGroupIndex = groups.findIndex(
            (group) => group.name === DEFAULT_GROUP_NAME
        );
        if (defaultGroupIndex > -1) {
            const defaultGroup = groups.splice(defaultGroupIndex, 1)[0];
            groups.unshift(defaultGroup);
        }
    }

    /**
     * Computes the selected options.
     */
    computeSelection() {
        this.selectedOptions = this.getSelectedOptions();
        this.hasBadValues =
            this._value.length === 0
                ? true
                : this.selectedOptions.some((option) => option.value);
        this._value = this.selectedOptions.map((option) => option.value);

        this.dispatchEvent(
            new CustomEvent('privateselect', {
                detail: { selectedOptions: this.selectedOptions }
            })
        );
    }

    /**
     * Search function.
     *
     * @param {object} params The search term and an array of the options
     * @returns {array} Array of options that includes the search term
     */
    computeSearch(params) {
        const { options, searchTerm } = params;
        return options.filter((option) => {
            return option.label
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
        });
    }

    /**
     * Removes selected options from the options array.
     *
     * @param {array} options Array of all the options
     * @returns {array} Array of all unselected options
     */
    removeSelectedOptionsFrom(options) {
        const unselectedOptions = [];
        options.forEach((option) => {
            if (option.options.length) {
                const computedOption = new Option(option);
                computedOption.options = this.removeSelectedOptionsFrom(
                    computedOption.options
                );

                // We want to show the option only if some children options are unselected
                if (computedOption.options.length) {
                    unselectedOptions.push(computedOption);
                }
            } else {
                if (!option.selected) unselectedOptions.push(option);
            }
        });
        return unselectedOptions;
    }

    /**
     * Unselects selected options.
     *
     * @param {array} options Array of all the options
     */
    unselectOption(options = this.options) {
        let selectedOption = options.find((option) => option.selected);
        if (selectedOption) {
            selectedOption.selected = false;
            return;
        }

        // Search deeper levels
        let i = 0;
        while (!selectedOption && i < options.length) {
            const childrenOptions = options[i].options;
            if (childrenOptions.length) {
                selectedOption = this.unselectOption(childrenOptions);
            }
            i += 1;
        }
    }

    /**
     * Return an array of all selected options.
     *
     * @param {array} options Array of all the options
     * @returns {array} Array of all selected options
     */
    getSelectedOptions(options = this.options) {
        const selectedOptions = [];
        options.forEach((option) => {
            if (option.selected) selectedOptions.push(option);
            if (option.options.length) {
                selectedOptions.push(this.getSelectedOptions(option.options));
            }
        });

        return selectedOptions.flat();
    }

    /**
     * Find an option from its value.
     *
     * @param {string} value Unique value of the option to find.
     * @param {array} options Array of options.
     * @returns {object} option
     */
    getOption(value, options = this.options) {
        let option = options.find((opt) => opt.value === value);

        // Search deeper levels
        let i = 0;
        while (!option && i < options.length) {
            const childrenOptions = options[i].options;
            if (childrenOptions.length) {
                option = this.getOption(value, childrenOptions);
            }
            i += 1;
        }

        return option;
    }

    /**
     * Hightlights the option with focus on.
     *
     * @param {number} index index of the option with focus on.
     */
    highlightOption(index) {
        if (!this._optionElements[index]) return;

        if (this._highlightedOption)
            this._highlightedOption.classList.remove(
                'avonni-primitive-combobox__option_background_focused'
            );
        this._highlightedOptionIndex = index;
        this._highlightedOption.classList.add(
            'avonni-primitive-combobox__option_background_focused'
        );
        const listboxElement = this.template.querySelector(
            '.slds-listbox [role="listbox"]'
        );
        listboxElement.setAttribute(
            'aria-activedescendant',
            normalizeAriaAttribute(this._highlightedOption.id)
        );
    }

    /**
     * Updates the back link.
     *
     * @param {string} label
     */
    updateBackLink(label) {
        this.backLink = new Action({
            label: label,
            name: 'backlink',
            iconName: 'utility:chevronleft',
            position: 'top',
            isBackLink: true
        });
    }

    /**
     * If selected-option and input-value = '' closes the dropdown.
     * Dispatches blur event.
     */
    handleBlur() {
        if (this._cancelBlur) {
            return;
        }
        if (this.selectedOption) {
            this.inputValue = this.selectedOption.label;
        } else {
            this.inputValue = '';
        }
        this.close();

        this.interactingState.leave();

        this.dispatchEvent(new CustomEvent('blur'));
    }

    /**
     * Dispatches focus event.
     */
    handleFocus() {
        this.interactingState.enter();

        this.dispatchEvent(new CustomEvent('focus'));
    }

    /**
     * Handles the input for the search function.
     * Dispatches search event.
     */
    handleInput(event) {
        const searchTerm = event.currentTarget.value;
        this.inputValue = searchTerm;

        // Search in the current level of options
        const options =
            (this.currentParent && this.currentParent.options) || this.options;

        const result = this.search({
            searchTerm,
            options: options
        });

        this.visibleOptions = result;

        this.dispatchEvent(
            new CustomEvent('search', {
                detail: {
                    value: searchTerm
                }
            })
        );
    }

    handleDropdownMouseDown(event) {
        const mainButton = 0;
        if (event.button === mainButton) {
            this._cancelBlur = true;
        }
    }

    /**
     * Sets cancelBlur to false on mouseup on dropdown.
     */
    handleDropdownMouseUp() {
        // We need this to make sure that if a scrollbar is being dragged with the mouse, upon release
        // of the drag we allow blur, otherwise the dropdown would not close on blur since we'd have cancel blur set
        this._cancelBlur = false;
    }

    /**
     * Handles the click on highlighted options.
     */
    handleHighlightedOptionClick(event) {
        // If the search is allowed, the options have to be selected with enter
        if (this.allowSearch && (event.key === ' ' || event.key === 'Spacebar'))
            return;

        if (this._highlightedOption.dataset.value) {
            this.handleOptionClick(event);
        } else if (this._highlightedOption.dataset.name === 'backlink') {
            this.handleBackLinkClick();
        } else {
            this.handleActionClick(this._highlightedOption.dataset.name);
        }
    }

    /**
     * Handles the input key down.
     * If dropdown is closed, opens it and dispatch open event.
     */
    handleInputKeyDown(event) {
        if (!this.dropdownVisible) {
            this.open();
            this.dispatchEvent(new CustomEvent('open'));
        } else {
            const index = this._highlightedOptionIndex;
            switch (event.key) {
                case 'ArrowUp':
                    if (index > 0) {
                        this.highlightOption(index - 1);
                    } else {
                        this.highlightOption(this._optionElements.length - 1);
                    }
                    break;
                case 'ArrowDown':
                    if (index < this._optionElements.length - 1) {
                        this.highlightOption(index + 1);
                    } else {
                        this.highlightOption(0);
                    }
                    break;
                case 'ArrowLeft':
                    this.handleBackLinkClick();
                    break;
                case 'GoBack':
                    this.handleBackLinkClick();
                    break;
                case ' ':
                    this.handleHighlightedOptionClick(event);
                    break;
                case 'Spacebar':
                    this.handleHighlightedOptionClick(event);
                    break;
                case 'Enter':
                    this.handleHighlightedOptionClick(event);
                    break;
                case 'Escape':
                    this.close();
                    break;
                case 'Home':
                    this.highlightOption(0);
                    break;
                case 'End':
                    this.highlightOption(this._optionElements - 1);
                    break;
                default:
                // do nothing
            }
        }
    }

    /**
     * Handles the back link click.
     */
    handleBackLinkClick() {
        const parents = this.parentOptionsValues;
        parents.pop();

        if (parents.length) {
            const parent = this.getOption(parents[parents.length - 1]);
            this.updateBackLink(parent.label);
            this.visibleOptions = parent.options;
        } else {
            this.visibleOptions = this.options;
            this.backLink = undefined;
        }

        this.focus();
    }

    /**
     * Clears the input value.
     * Dispatches change event.
     */
    handleClearInput(event) {
        event.stopPropagation();
        if (this.disabled) return;

        this.inputValue = '';

        // Clear the value
        if (!this.isMultiSelect && this.selectedOption) {
            this.selectedOption.selected = false;
            this.selectedOption = undefined;
            this.computeSelection();

            this.dispatchEvent(
                new CustomEvent('change', {
                    detail: {
                        value: this.value
                    }
                })
            );
        }

        // Reset the visible options
        this.visibleOptions = this.options;
        this.parentOptionsValues = [];
        this.backLink = undefined;

        this.focus();
    }

    /**
     * Handles the click on action.
     * Dispatches actionClick event.
     * Closes the dropdown.
     *
     * @param {event} event If clicked with mouse we receive the event
     * @param {string} name If clicked with keyboard we receive the name
     */
    handleActionClick(eventOrName) {
        // If the action is "clicked" through a keyboard event, the argument will be the name

        let name;
        if (typeof eventOrName === 'string') {
            name = eventOrName;
        } else {
            if (eventOrName.currentTarget.ariaDisabled === 'true') {
                this.focus();
                return;
            }
            name = eventOrName.currentTarget.dataset.name;
        }

        this.dispatchEvent(
            new CustomEvent('actionclick', {
                detail: {
                    name: name
                },
                bubbles: true
            })
        );

        this.close();
        this.focus();
    }

    /**
     * Handles the click on option.
     * Dispatches change event.
     * Closes the dropdown.
     *
     * @param {event} event click event
     */
    handleOptionClick(event) {
        event.stopPropagation();

        const selectedOption = this.visibleOptions.find((option) => {
            return option.value === this._highlightedOption.dataset.value;
        });

        // If the option has children options, change the visible options
        if (selectedOption.options && selectedOption.options.length) {
            this.visibleOptions = selectedOption.options;
            this.parentOptionsValues.push(selectedOption.value);
            this.updateBackLink(this.currentParent.label);
            this.focus();
            return;
        }

        // Toggle selection
        if (!this.isMultiSelect && !selectedOption.selected) {
            this.unselectOption();
        }
        selectedOption.selected = !selectedOption.selected;
        this.computeSelection();

        // Update the input value
        if (!this.isMultiSelect && selectedOption.selected) {
            this.inputValue = selectedOption.label;
            this.selectedOption = selectedOption;
        } else {
            this.inputValue = '';
            this.selectedOption = undefined;
        }

        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value: this.value
                },
                bubbles: true
            })
        );

        this.close();
        this.focus();
    }

    /**
     * Handles mouse enter on li.
     */
    handleMouseEnter(event) {
        event.stopPropagation();
        if (event.currentTarget.ariaDisabled === 'true') return;

        // If the mouse enters an option, the id will be sent through an event from the group
        const id = event.detail.id ? event.detail.id : event.currentTarget.id;

        const index = this._optionElements.findIndex((option) => {
            return option.id === id;
        });

        this.highlightOption(index);
    }

    /**
     * Handles the remove of lightning-pill (selected-option).
     * Dispatches change event.
     *
     * @param {event} event onremove event
     * @public
     */
    @api
    handleRemoveSelectedOption(event) {
        const value = event.detail.name;
        const selectedOption = this.getOption(value);
        selectedOption.selected = false;

        this.computeSelection();
        this.visibleOptions = this.options;

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
     * Handles the trigger click.
     * If dropdown is closed, it opens it.
     * Dispatches open event.
     */
    handleTriggerClick() {
        if (!this.dropdownVisible) {
            this.open();
            this.dispatchEvent(new CustomEvent('open'));
        }
    }
}
