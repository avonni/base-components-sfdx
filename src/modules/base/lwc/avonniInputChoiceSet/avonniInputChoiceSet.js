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
     * Text label for the input.
     *
     * @type {string}
     * @public
     * @required
     */
    @api label;
    /**
     * Array of option objects.
     *
     * @type {object[]}
     * @public
     * @required
     */
    @api options;
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

    _orientation = INPUT_CHOICE_ORIENTATIONS.default;
    _type = INPUT_CHOICE_TYPES.default;
    _helpMessage;
    _disabled = false;
    _required = false;
    _value = [];
    _isMultiSelect = false;

    constructor() {
        super();
        this.itemIndex = 0;
    }

    /**
     * Synchronize all inputs Aria help element ID.
     */
    synchronizeA11y() {
        const inputs = this.template.querySelectorAll('[data-element-id^="input"]');
        Array.prototype.slice.call(inputs).forEach((input) => {
            synchronizeAttrs(input, {
                'aria-describedby': this.computedUniqueHelpElementId
            });
        });
    }

    connectedCallback() {
        this.classList.add('slds-form-element');
        this.updateClassList();
        this.interactingState = new InteractingState();
        this.interactingState.onleave(() => this.showHelpMessageIfInvalid());
    }

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

    renderedCallback() {
        this.synchronizeA11y();
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
        this._value = value ? value : [];
    }

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
     * Checks if the input is valid.
     *
     * @returns {boolean} Indicates whether the element meets all constraint validations.
     * @public
     */
    @api
    checkValidity() {
        return this._constraint.checkValidity();
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
        return this._constraint.reportValidity((message) => {
            this._helpMessage = message;
        });
    }

    /**
     * Sets a custom error message to be displayed when a form is submitted.
     *
     * @param {string} message - The string that describes the error.
     * If message is an empty string, the error message is reset.
     * @public
     */
    @api
    setCustomValidity(message) {
        this._constraint.setCustomValidity(message);
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
     * Get element unique help ID.
     *
     * @type {string}
     */
    get computedUniqueHelpElementId() {
        const helpElement = this.template.querySelector('[data-helptext]');
        return getRealDOMId(helpElement);
    }

    /**
     * Focus method. Sets focus on the first input option.
     *
     * @public
     */
    @api
    focus() {
        const firstCheckbox = this.template.querySelector('[data-element-id="input"]');
        if (firstCheckbox) {
            firstCheckbox.focus();
        }
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
        return Array.from(inputs)
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => checkbox.value);
    }

    /**
     * Dispatches the change event.
     */
    handleChange(event) {
        event.stopPropagation();

        let value = event.target.value;
        const checkboxes = this.template.querySelectorAll('[data-element-id^="input"]');
        if (this.isMultiSelect) {
            this._value = this.handleValueChange(checkboxes);
        } else {
            const checkboxesToUncheck = Array.from(checkboxes).filter(
                (checkbox) => checkbox.value !== value
            );
            checkboxesToUncheck.forEach((checkbox) => {
                checkbox.checked = false;
            });
            this._value = this.handleValueChange(checkboxes);
        }
        if (this.type === 'button') {
            checkboxes.forEach((checkbox) => {
                const label = checkbox.labels[0];
                let icon = label.querySelector('[data-element-id="lightning-icon-button"]');
                if (icon) {
                    if (value.includes(label.control.value))
                        icon.variant = 'inverse';
                    else icon.variant = '';

                    if (!checkbox.checked && icon.variant === 'inverse') {
                        icon.variant = '';
                    }
                }
            });
        }

        /**
         * The event fired when the value changed.
         *
         * @event
         * @name change
         * @param {string} value The input value.
         * @public
         * @bubbles
         * @cancelable
         * @composed
         */
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value: this.value
                },
                composed: true,
                bubbles: true,
                cancelable: true
            })
        );
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
                    !this.disabled && this.required && !this.value.length
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
        const classnames = classSet(
            'slds-form-element__legend slds-form-element__label'
        );

        return classnames
            .add({
                'slds-assistive-text': this.variant === VARIANT.LABEL_HIDDEN
            })
            .toString();
    }

    /**
     * Computed Button Class styling.
     *
     * @type {string}
     */
    get computedButtonClass() {
        return this.checkboxVariant
            ? ''
            : `slds-checkbox_button-group ${this.orientation}`;
    }

    /**
     * Computed Checkbox Container Class styling.
     *
     * @type {string}
     */
    get computedCheckboxContainerClass() {
        const checkboxClass = this.isMultiSelect
            ? `slds-checkbox ${this.orientation}`
            : `slds-radio ${this.orientation}`;
        const buttonClass = `slds-button slds-checkbox_button ${this.orientation}`;

        return this.checkboxVariant ? checkboxClass : buttonClass;
    }

    /**
     * Computed Label Class styling.
     *
     * @type {string}
     */
    get computedLabelClass() {
        const buttonLabelClass = `slds-checkbox_button__label slds-align_absolute-center ${this.orientation}`;
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
}
