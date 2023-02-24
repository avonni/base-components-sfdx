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
    normalizeArray,
    synchronizeAttrs,
    getRealDOMId,
    classListMutation
} from 'c/utilsPrivate';
import {
    FieldConstraintApi,
    InteractingState,
    normalizeVariant,
    VARIANT
} from 'c/inputUtils';
import { classSet } from 'c/utils';
import InputChoiceOption from './avonniInputChoiceOption';

const i18n = {
    required: 'required'
};

const INPUT_CHOICE_ORIENTATIONS = {
    valid: ['vertical', 'horizontal'],
    default: 'vertical'
};
const INPUT_CHOICE_TYPES = { valid: ['default', 'button'], default: 'default' };

/**
 * @class
 * @descriptor avonni-input-choice-set
 * @storyId example-input-choice-set--radio-buttons
 * @public
 */
export default class AvonniInputChoiceSet extends LightningElement {
    static delegatesFocus = true;
    /**
     * Help text detailing the purpose and function of the input.
     *
     * @type {string}
     * @public
     */
    @api fieldLevelHelp;
    /**
     * Text label for the input.
     *
     * @type {string}
     * @public
     * @required
     */
    @api label;
    /**
     * Optional message to be displayed when no option is selected and the required attribute is set.
     *
     * @type {string}
     * @public
     */
    @api messageWhenValueMissing;
    /**
     * Specifies the name of an input element.
     *
     * @type {string}
     * @public
     * @required
     */
    @api name;
    /**
     * Array of option objects.
     *
     * @type {object[]}
     * @public
     * @required
     */
    @api options;

    _disabled = false;
    _isLoading = false;
    _isMultiSelect = false;
    _orientation = INPUT_CHOICE_ORIENTATIONS.default;
    _required = false;
    _type = INPUT_CHOICE_TYPES.default;
    _value = [];
    _variant;

    _helpMessage;
    _isConnected = false;

    constructor() {
        super();
        this.itemIndex = 0;
    }

    /**
     * Synchronize all inputs Aria help element ID.
     */
    synchronizeA11y() {
        const inputs = this.template.querySelectorAll(
            '[data-element-id^="input"]'
        );
        Array.prototype.slice.call(inputs).forEach((input) => {
            synchronizeAttrs(input, {
                'aria-describedby': this.computedUniqueHelpElementId
            });
        });
    }

    connectedCallback() {
        if (this.isMultiSelect && this.value) {
            // Make sure the value is an array when the input is multiselect
            this._value =
                typeof this.value === 'string'
                    ? [this.value]
                    : normalizeArray(this.value);
        }

        this.classList.add('slds-form-element');
        this.updateClassList();
        this.interactingState = new InteractingState();
        this.interactingState.onleave(() => this.showHelpMessageIfInvalid());
        this._isConnected = true;
    }

    renderedCallback() {
        this.synchronizeA11y();
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * If present, the input field is disabled and users cannot interact with it.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get disabled() {
        return this._disabled || false;
    }
    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    /**
     * If present, the input is loading and a spinner is visible where the options should be.
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
     * If present, multiple choices can be selected.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get isMultiSelect() {
        return this._isMultiSelect || false;
    }
    set isMultiSelect(value) {
        this._isMultiSelect = normalizeBoolean(value);
    }

    /**
     * Orientation of the input options. Valid values include vertical and horizontal.
     *
     * @type {string}
     * @default vertical
     * @public
     */
    @api
    get orientation() {
        return this._orientation;
    }

    set orientation(orientation) {
        this._orientation = normalizeString(orientation, {
            fallbackValue: INPUT_CHOICE_ORIENTATIONS.default,
            validValues: INPUT_CHOICE_ORIENTATIONS.valid
        });
    }

    /**
     * If present, the input field is read-only and cannot be edited by users.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get readOnly() {
        return this._readOnly || false;
    }
    set readOnly(value) {
        this._readOnly = normalizeBoolean(value);
    }

    /**
     * If present, at least one option must be selected.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get required() {
        return this._required || false;
    }
    set required(value) {
        this._required = normalizeBoolean(value);
    }

    /**
     * If present, the options stretch to full width.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get stretch() {
        return this._stretch || false;
    }
    set stretch(value) {
        this._stretch = normalizeBoolean(value);
    }

    /**
     * Type of the input. Valid values include default and button.
     *
     * @type {string}
     * @default default
     * @public
     */
    @api
    get type() {
        return this._type;
    }

    set type(type) {
        this._type = normalizeString(type, {
            fallbackValue: INPUT_CHOICE_TYPES.default,
            validValues: INPUT_CHOICE_TYPES.valid
        });
    }

    /**
     * The list of selected options. Each array entry contains the value of a selected option. The value of each option is set in the options attribute.
     *
     * @type {string}
     * @public
     * @required
     */
    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;

        if (value && this.isConnected && this.isMultiSelect) {
            this._value =
                typeof value === 'string' ? [value] : normalizeArray(value);
        }
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
     * The variant changes the appearance of the input label.
     * Accepted variants include standard, label-hidden, label-inline, and label-stacked.
     * Use label-hidden to hide the label but make it available to assistive technology.
     * Use label-inline to horizontally align the label and checkbox group.
     * Use label-stacked to place the label above the checkbox group.
     *
     * @type {string}
     * @default standard
     * @public
     */
    @api
    get variant() {
        return this._variant || VARIANT.STANDARD;
    }

    set variant(value) {
        this._variant = normalizeVariant(value);
        this.updateClassList();
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * True if type is default.
     *
     * @type {boolean}
     */
    get checkboxVariant() {
        return this.type === 'default';
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
     * Create new InputChoiceOption object.
     *
     * @type {Object[]}
     */
    get transformedOptions() {
        const { options, value } = this;
        if (Array.isArray(options)) {
            return options.map((option) => {
                return new InputChoiceOption(option, value, this.itemIndex++);
            });
        }
        return [];
    }

    /**
     * Get element unique help ID.
     *
     * @type {string}
     */
    get computedUniqueHelpElementId() {
        const helpElement = this.template.querySelector('[data-helptext]');
        return getRealDOMId(helpElement);
    }

    /**
     * Gets FieldConstraintApi for validation.
     *
     * @type {object}
     */
    get _constraint() {
        if (!this._constraintApi) {
            this._constraintApi = new FieldConstraintApi(() => this, {
                valueMissing: () =>
                    !this.disabled &&
                    this.required &&
                    (!this.value || !this.value.length)
            });
        }
        return this._constraintApi;
    }

    /**
     * Computed Legend Class styling.
     *
     * @type {string}
     */
    get computedLegendClass() {
        return classSet('')
            .add({
                'slds-assistive-text': this.variant === VARIANT.LABEL_HIDDEN,
                'avonni-input-choice-set__display_flex':
                    this.variant !== VARIANT.LABEL_INLINE
            })
            .toString();
    }

    /**
     * Computed Button Class styling.
     *
     * @type {string}
     */
    get computedButtonClass() {
        return classSet(`avonni-input-choice-set__${this.orientation}`).add({
            'slds-checkbox_button-group': !this.checkboxVariant,
            'avonni-input-choice-set__stretch': this.stretch
        });
    }

    /**
     * Computed Checkbox Container Class styling.
     *
     * @type {string}
     */
    get computedCheckboxContainerClass() {
        const checkboxClass = this.isMultiSelect
            ? `slds-checkbox avonni-input-choice-set__${this.orientation}`
            : `slds-radio avonni-input-choice-set__${this.orientation}`;
        const buttonClass = `slds-button slds-checkbox_button avonni-input-choice-set__${this.orientation}`;

        return this.checkboxVariant ? checkboxClass : buttonClass;
    }

    /**
     * Computed Label Class styling.
     *
     * @type {string}
     */
    get computedLabelClass() {
        const buttonLabelClass = `slds-checkbox_button__label slds-align_absolute-center avonni-input-choice-set__${this.orientation}`;
        const checkboxLabelClass =
            this.isMultiSelect && this.checkboxVariant
                ? 'slds-checkbox__label'
                : 'slds-radio__label';

        return this.checkboxVariant ? checkboxLabelClass : buttonLabelClass;
    }

    /**
     * Returns checkbox if is-multi-select is true or type is not default and radio if is-multi-select is false.
     *
     * @type {string}
     */
    get computedInputType() {
        return this.isMultiSelect || !this.checkboxVariant
            ? 'checkbox'
            : 'radio';
    }

    /**
     * Returns slds-checkbox_faux if is-multi-select is true and slds-radio_faux if is-multi-select is false.
     *
     * @type {string}
     */
    get computedCheckboxShapeClass() {
        return this.isMultiSelect ? 'slds-checkbox_faux' : 'slds-radio_faux';
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

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
     * Displays the error messages. If the input is valid, <code>reportValidity()</code> clears displayed error messages.
     *
     * @returns {boolean} False if invalid, true if valid.
     * @public
     */
    @api
    reportValidity() {
        return this._constraint.reportValidity((message) => {
            this._helpMessage = message;
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
     * Sets the focus on the first input option.
     *
     * @public
     */
    @api
    focus() {
        const firstCheckbox = this.template.querySelector(
            '[data-element-id="input"]'
        );
        if (firstCheckbox) {
            firstCheckbox.focus();
        }
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Update form class styling.
     */
    updateClassList() {
        classListMutation(this.classList, {
            'slds-form-element_stacked': this.variant === VARIANT.LABEL_STACKED,
            'slds-form-element_horizontal':
                this.variant === VARIANT.LABEL_INLINE
        });
    }

    /**
     * Dispatch the focus event.
     */
    handleFocus() {
        this.interactingState.enter();

        /**
         * The event fired when you focus the input.
         *
         * @event
         * @name focus
         * @public
         */
        this.dispatchEvent(new CustomEvent('focus'));
    }

    /**
     * Dispatch the blur event.
     */
    handleBlur() {
        this.interactingState.leave();

        /**
         * The event fired when the focus is removed from the input.
         *
         * @event
         * @name blur
         * @public
         */
        this.dispatchEvent(new CustomEvent('blur'));
    }

    /**
     * Click handler.
     *
     * @param {Event} event
     */
    handleClick(event) {
        if (this.readOnly) {
            event.preventDefault();
        }
        if (this.template.activeElement !== event.target) {
            event.target.focus();
        }
    }

    /**
     * Value change handler.
     *
     * @param {array} inputs All inputs.
     * @returns {array} Checked values.
     */
    handleValueChange(inputs) {
        const checkedValues = Array.from(inputs)
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => checkbox.value);
        return this.isMultiSelect ? checkedValues : checkedValues[0] || null;
    }

    /**
     * Dispatches the change event.
     */
    handleChange(event) {
        event.stopPropagation();

        const value = event.currentTarget.value;
        const checkboxes = this.template.querySelectorAll(
            '[data-element-id="input"]'
        );
        if (this.isMultiSelect) {
            this._value = this.handleValueChange(checkboxes);
        } else {
            if (this.value === value) {
                // Prevent unselecting the current option when the type is 'button'
                event.currentTarget.checked = true;
                return;
            }

            const checkboxesToUncheck = Array.from(checkboxes).filter(
                (checkbox) => checkbox.value !== value
            );
            checkboxesToUncheck.forEach((checkbox) => {
                checkbox.checked = false;
            });
            this._value = this.handleValueChange(checkboxes);
        }

        /**
         * The event fired when the value changed.
         *
         * @event
         * @name change
         * @param {string|string[]} value Selected options' value. Returns an array of string if the input is multi-select. Returns a string otherwise.
         * @public
         * @bubbles
         * @cancelable
         * @composed
         */
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value: this._value
                },
                composed: true,
                bubbles: true,
                cancelable: true
            })
        );
    }
}
