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
import { FieldConstraintApi } from 'c/inputUtils';
import { classSet, generateUniqueId } from 'c/utils';
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

// Default LWC message
const DEFAULT_MESSAGE_WHEN_VALUE_MISSING = 'Complete this field.';

export default class AvonniPrimitiveCombobox extends LightningElement {
    @api fieldLevelHelp;
    @api label;
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
    _messageWhenValueMissing = DEFAULT_MESSAGE_WHEN_VALUE_MISSING;
    _multiLevelGroups = false;
    _options = [];
    _placeholder;
    _readOnly = false;
    _removeSelectedOptions = false;
    _required = false;
    _search = this.computeSearch;
    _selectedOptionsAriaLabel = DEFAULT_SELECTED_OPTIONS_ARIA_LABEL;
    _showClearInput = false;
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
    }

    renderedCallback() {
        if (this.dropdownVisible) {
            this.updateDropdownHeight();
            this.highlightOption(0);
        }
    }

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

        this._maxVisibleOptions = Number(
            this._dropdownLength.match(/[0-9]+/)[0]
        );
    }

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
        if (this.isConnected) this.initValue();
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

        if (this.groups.length && this.visibleOptions.length)
            this.computeGroups();
    }

    @api
    get options() {
        return this._options;
    }
    set options(value) {
        const options = normalizeArray(value);
        const optionObjects = this.initOptionObjects(options);
        this._options = optionObjects;
        this.visibleOptions = optionObjects;

        if (this.isConnected) {
            this.initValue();
        }
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
    get search() {
        return this._search;
    }
    set search(value) {
        this._search = typeof value === 'function' ? value : this.computeSearch;
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
    get showClearInput() {
        return this._showClearInput;
    }
    set showClearInput(value) {
        this._showClearInput = normalizeBoolean(value);
    }

    @api
    get validity() {
        return this._constraint.validity;
    }

    @api
    get value() {
        return this._value;
    }
    set value(value) {
        this._value =
            typeof value === 'string' ? [value] : normalizeArray(value);
        if (this.isConnected) this.initValue();
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

    get visibleOptions() {
        return this._visibleOptions;
    }
    set visibleOptions(value) {
        this._visibleOptions =
            this.isConnected && this.removeSelectedOptions
                ? this.removeSelectedOptionsFrom(value)
                : value;

        this.computeGroups();
    }

    get _constraint() {
        if (!this._constraintApi) {
            this._constraintApi = new FieldConstraintApi(() => this, {
                valueMissing: () =>
                    !this.disabled && this.required && this.value.length === 0
            });
        }
        return this._constraintApi;
    }

    get generateKey() {
        return generateUniqueId();
    }

    get input() {
        return this.template.querySelector('input');
    }

    get inputIconName() {
        return this.allowSearch ? 'utility:search' : 'utility:down';
    }

    get showInputValueAvatar() {
        return (
            this.selectedOption &&
            !this.selectedOption.iconName &&
            this.inputValue === this.selectedOption.label &&
            (this.selectedOption.avatarSrc ||
                this.selectedOption.avatarFallbackIconName)
        );
    }

    get showInputValueIcon() {
        return this.selectedOption && this.selectedOption.iconName;
    }

    get inputIsDisabled() {
        return this.disabled || this.readOnly;
    }

    get hasNoSearch() {
        return !this.allowSearch;
    }

    get computedAriaExpanded() {
        return this.dropdownVisible ? 'true' : 'false';
    }

    get computedAriaAutocomplete() {
        return this.readOnly || this.disabled ? 'none' : 'list';
    }

    get currentParent() {
        return (
            this.parentOptionsValues.length &&
            this.getOption(
                this.parentOptionsValues[this.parentOptionsValues.length - 1]
            )
        );
    }

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
                'c-primitive-combobox-group'
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

    get _highlightedOption() {
        return (
            this._optionElements.length &&
            this._optionElements[this._highlightedOptionIndex]
        );
    }

    get showSelectedOptions() {
        return (
            !this.hideSelectedOptions &&
            this.isMultiSelect &&
            this.selectedOptions.length > 0
        );
    }

    get showClearInputIcon() {
        return this.showClearInput && this.input && this.inputValue !== '';
    }

    get showNoSearchResultMessage() {
        return this.inputValue && !this.visibleOptions.length;
    }

    get showHelpMessage() {
        return this.helpMessage && !this.checkValidity();
    }

    get computedLabelClass() {
        return classSet('slds-form-element__label')
            .add({ 'slds-assistive-text': this.variant === 'label-hidden' })
            .toString();
    }

    get computedDropdownTriggerClass() {
        return classSet(
            'slds-is-relative slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click combobox__dropdown-trigger'
        )
            .add({
                'slds-is-open': this.dropdownVisible,
                'slds-has-icon-only slds-combobox_container': this
                    .showInputValueIcon
            })
            .toString();
    }

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

    @api
    blur() {
        if (this.input) this.input.blur();
    }

    @api
    checkValidity() {
        return this._constraint.checkValidity();
    }

    @api
    close() {
        if (this.dropdownVisible) {
            this.dropdownVisible = false;
            this.stopDropdownPositioning();

            if (this.isMultiSelect) {
                // Reset options and keep the current search
                const searchTerm = this.inputValue;
                const options = this.options;
                this.visibleOptions = searchTerm
                    ? this.search({ options, searchTerm })
                    : options;

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

    @api
    focus() {
        if (this.input) this.input.focus();
    }

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

    @api
    reportValidity() {
        return this._constraint.reportValidity((message) => {
            this.helpMessage = this.messageWhenValueMissing || message;
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

    initValue() {
        if (this.isMultiSelect) {
            this.value.forEach((value) => {
                const selectedOption = this.options.find(
                    (option) => option.value === value
                );
                if (selectedOption) selectedOption.selected = true;
            });
            this.selectedOption = undefined;
            this.computeSelection();
        } else {
            const selectedOption = this.options.find(
                (option) => option.value === this.value[0]
            );
            if (selectedOption) {
                selectedOption.selected = true;
                this.selectedOption = selectedOption;
                this.inputValue = selectedOption.label;
            }
        }
    }

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

    startDropdownAutoPositioning() {
        if (this.dropdownAlignment !== 'auto') {
            return;
        }

        if (!this._autoPosition) {
            this._autoPosition = new AutoPosition(this);
        }

        this._autoPosition.start({
            target: () => this.template.querySelector('input'),
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

    updateDropdownHeight() {
        const groups = this.template.querySelectorAll(
            'c-primitive-combobox-group'
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
     * Find a group based on its name, and adds an option to its list.
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
     * Move the default group at the top
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

    computeSelection() {
        this.selectedOptions = this.getSelectedOptions();
        this._value = this.selectedOptions.map((option) => option.value);

        this.dispatchEvent(
            new CustomEvent('privateselect', {
                detail: { selectedOptions: this.selectedOptions }
            })
        );
    }

    computeSearch(params) {
        const { options, searchTerm } = params;
        return options.filter((option) => {
            return option.label
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
        });
    }

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

    highlightOption(index) {
        if (!this._optionElements[index]) return;

        if (this._highlightedOption)
            this._highlightedOption.classList.remove('slds-has-focus');
        this._highlightedOptionIndex = index;
        this._highlightedOption.classList.add('slds-has-focus');
        const listboxElement = this.template.querySelector(
            '.slds-listbox [role="listbox"]'
        );
        listboxElement.setAttribute(
            'aria-activedescendant',
            normalizeAriaAttribute(this._highlightedOption.id)
        );
    }

    updateBackLink(label) {
        this.backLink = new Action({
            label: label,
            name: 'backlink',
            iconName: 'utility:chevronleft',
            position: 'top',
            isBackLink: true
        });
    }

    handleBlur() {
        if (this._cancelBlur) {
            return;
        }
        if (this.selectedOption && this.inputValue === '') {
            this.inputValue = this.selectedOption.label;
        }
        this.close();

        this.dispatchEvent(new CustomEvent('blur'));
    }

    handleFocus() {
        this.dispatchEvent(new CustomEvent('focus'));
    }

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

    handleDropdownMouseUp() {
        // We need this to make sure that if a scrollbar is being dragged with the mouse, upon release
        // of the drag we allow blur, otherwise the dropdown would not close on blur since we'd have cancel blur set
        this._cancelBlur = false;
    }

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

    handleClearInput(event) {
        event.stopPropagation();
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

    handleTriggerClick() {
        if (!this.dropdownVisible) {
            this.open();
            this.dispatchEvent(new CustomEvent('open'));
        }
    }
}
