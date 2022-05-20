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
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';
import { classSet } from 'c/utils';
import { FieldConstraintApiWithProxyInput } from 'c/inputUtils';

const validVariants = {
    valid: ['standard', 'label-inline', 'label-hidden', 'label-stacked'],
    default: 'standard'
};

const validTypes = {
    valid: ['number', 'currency', 'percent'],
    default: 'number'
};

const DEFAULT_STEP = 1;

/**
 * @class
 * @description The Input Counter allows a user to increase or decrease a numerical value.
 * @descriptor avonni-input-counter
 * @storyId example-input-counter--base
 * @public
 */
export default class AvonniInputCounter extends LightningElement {
    /**
     * Specifies a shortcut key to activate or focus an element.
     *
     * @type {string}
     * @public
     */
    @api accessKey;
    /**
     * Describes the input to assistive technologies.
     *
     * @type {string}
     * @public
     */
    @api ariaLabel;
    /**
     * A space-separated list of element IDs whose presence or content is controlled by the input.
     *
     * @type {string}
     * @public
     */
    @api ariaControls;
    /**
     * A space-separated list of element IDs that provide descriptive labels for the input.
     *
     * @type {string}
     * @public
     */
    @api ariaDescribedBy;
    /**
     * A space-separated list of element IDs that provide labels for the input.
     *
     * @type {string}
     * @public
     */
    @api ariaLabelledBy;
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
     * @required
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
     * Error message to be displayed when a pattern mismatch is detected.
     * @type {string}
     * @public
     */
    @api messageWhenPatternMismatch;
    /**
     * Error message to be displayed when a range overflow is detected.
     *
     * @type {string}
     * @public
     */
    @api messageWhenRangeOverflow;
    /**
     * Error message to be displayed when a range underflow is detected.
     *
     * @type {string}
     * @public
     */
    @api messageWhenRangeUnderflow;
    /**
     * Error message to be displayed when a step mismatch is detected.
     *
     * @type {string}
     * @public
     */
    @api messageWhenStepMismatch;
    /**
     * Error message to be displayed when the value is missing.
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
     */
    @api name;

    _disabled;
    _step = DEFAULT_STEP;
    _type = validTypes.default;
    _readOnly = false;
    _required = false;
    _value = null;
    _variant = validVariants.default;

    _constraintApi;
    _constraintApiProxyInputUpdater;
    _fractionDigits;
    _previousValue;
    helpMessage;
    init = false;

    renderedCallback() {
        if (!this.init) {
            let srcElement = this.template.querySelector(
                '.avonni-input-counter'
            );

            if (srcElement) {
                const style = document.createElement('style');
                style.innerText =
                    '.avonni-input-counter .slds-input {text-align: center;padding: 0 var(--lwc-spacingXxLarge,3rem);}';
                srcElement.appendChild(style);
            }
            this.showHelpMessageIfInvalid();
            this.init = true;
        }
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * The minimum acceptable value for the input. Constrains the decrementer to stop at the specified minimum. If an entered value is below the minimum, incrementing or decrementing will then set the value to the specified minimum.
     *
     * @type {number}
     * @default null
     * @public
     */
    @api
    get min() {
        return this._min;
    }

    set min(value) {
        const min = Number(value);
        this._min = !isNaN(min) ? min : null;
    }

    /**
     * The maximum acceptable value for the input. Constrains the incrementer to stop at the specified maximum. If the entered value is above the maximum, incrementing or decrementing will then set the value to the specified maximum.
     *
     * @type {number}
     * @default null
     * @public
     */
    @api
    get max() {
        return this._max;
    }

    set max(value) {
        const max = Number(value);
        this._max = !isNaN(max) ? max : null;
    }

    /**
     * Granularity of the value - number of significant decimal digits specified as a positive integer. For example, 2 formats the value to 2 digits after the decimal.
     *
     * @type {number}
     * @default null
     * @public
     */
    @api
    get fractionDigits() {
        return this._fractionDigits;
    }

    set fractionDigits(value) {
        const digits = Number(value);
        this._fractionDigits = !isNaN(digits)
            ? Math.round(Math.abs(digits))
            : null;
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
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
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
        return this._readOnly;
    }

    set readOnly(value) {
        this._readOnly = normalizeBoolean(value);
    }

    /**
     * If present, the input field must be filled out before the form is submitted.
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
     * Amount to add or substract from the value.
     *
     * @type {number}
     * @default 1
     * @public
     */
    @api
    get step() {
        return this._step;
    }

    set step(value) {
        this._step = Number(value) || DEFAULT_STEP;
    }

    /**
     * Input counter type. Valid values include number, currency and percent.
     *
     * @type {string}
     * @default number
     * @public
     */
    @api
    get type() {
        return this._type;
    }

    set type(type) {
        this._type = normalizeString(type, {
            fallbackValue: validTypes.default,
            validValues: validTypes.valid
        });
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
     * Specifies the value of an input element.
     *
     * @type {number}
     * @default null
     * @public
     */
    @api
    get value() {
        return this._value;
    }

    set value(val) {
        const value = Number(val);
        this._value = !isNaN(value) ? value : null;
    }

    /**
     * The variant changes the appearance of an input field. Accepted variants include standard, label-inline, label-hidden, and label-stacked. This value defaults to standard, which displays the label above the field. Use label-hidden to hide the label but make it available to assistive technology. Use label-inline to horizontally align the label and input field. Use label-stacked to place the label above the input field.
     *
     * @type {string}
     * @default standard
     * @public
     */
    @api
    get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: validVariants.default,
            validValues: validVariants.valid
        });

        if (this._variant === 'label-inline') {
            this.classList.add('avonni-input-counter__flex-container');
        }
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Value sent to lightning-input step as a floating point number ( ex. 0.01 would result in 2 decimal places on the value ). Calculated from the fractionDigits.
     */
    get inputStep() {
        return this._fractionDigits
            ? 1 / Math.pow(10, this._fractionDigits)
            : 1;
    }

    /**
     * Form Element class add error if showError.
     *
     * @type {string}
     */
    get formElementClass() {
        return classSet('slds-form-element')
            .add({
                'slds-has-error': this.showError
            })
            .toString();
    }

    /**
     * Input class if readOnly.
     *
     * @type {string}
     */
    get inputClass() {
        return this._readOnly ? '' : 'avonni-input-counter';
    }

    /**
     * Check if variant is inline.
     *
     * @type {boolean}
     */
    get hasLabel() {
        return this.label && this._variant !== 'label-hidden';
    }

    /**
     * Get Aria Controls.
     *
     * @type {object}
     */
    get computedAriaControls() {
        return this.ariaControls || null;
    }

    /**
     * Get Aria Labelled by.
     *
     * @type {string}
     */
    get computedAriaLabelledBy() {
        return this.ariaLabelledBy || null;
    }

    /**
     * Get Aria Described By
     *
     * @type {string}
     */
    get computedAriaDescribedBy() {
        return this.ariaDescribedBy || null;
    }

    /**
     * Compute constraintApi with fieldConstraintApiWithProxyInput.
     */
    get _constraint() {
        if (!this._constraintApi) {
            this._constraintApi = new FieldConstraintApiWithProxyInput(
                () => this
            );

            this._constraintApiProxyInputUpdater =
                this._constraintApi.setInputAttributes({
                    type: () => 'number',
                    value: () => this.value,
                    max: () => this.max,
                    min: () => this.min,
                    step: () => this.inputStep,
                    formatter: () => this.type,
                    disabled: () => this.disabled
                });
        }
        return this._constraintApi;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Sets focus on the input element.
     *
     * @public
     */
    @api
    focus() {
        this.template
            .querySelector('[data-element-id="lightning-input"]')
            .focus();
    }

    /**
     * Removes keyboard focus from the input element.
     *
     * @public
     */
    @api
    blur() {
        this.template
            .querySelector('[data-element-id="lightning-input"]')
            .blur();
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
     * Displays the error messages. If the input is valid, <code>reportValidity()</code> clears displayed error messages.
     *
     * @returns {boolean} False if invalid, true if valid.
     * @public
     */
    @api
    reportValidity() {
        return this._constraint.reportValidity((message) => {
            this.helpMessage = message;
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

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Decrements the current value based on the step.
     */
    decrementValue() {
        this.normalizeInputParameters();

        if (!isNaN(this.value)) {
            this._value = Number(this.value) - Number(this.step);
        } else {
            this.emptyInputField();
        }
        this.minMaxConditionsHandler();

        this.handleNumberOutput();
    }

    /**
     * Increments the current value based on the step.
     */
    incrementValue() {
        this.normalizeInputParameters();

        if (!isNaN(this.value)) {
            this._value = Number(this.value) + Number(this.step);
        } else {
            this.emptyInputField();
        }
        this.minMaxConditionsHandler();

        this.handleNumberOutput();
    }

    /**
     * Normalizes the values for min, max and step to the current fractionDigits and stores the current value of this.value for condition handlers.
     */
    normalizeInputParameters() {
        if (this._max) this.handlePrecision(this._max);
        if (this._min) this.handlePrecision(this._min);
        if (this._step) this.handlePrecision(this._step);

        this._previousValue = this.value;
    }

    /**
     * Sets the value to this.value if the input field is empty and the user fires either increment or decrement methods.
     */
    emptyInputField() {
        this._value =
            this.step && this.min === 0
                ? 0
                : this.step !== 1 && !this.min
                ? this.step
                : this.min
                ? this.min
                : null;
    }

    /**
     * Logic handler for min and max constraints to set this.value.
     */
    minMaxConditionsHandler() {
        if (
            (this.min || this.min === 0) &&
            (this.value < this.min || this._previousValue < this.min)
        ) {
            this._value = this.min;
        }
        if (
            this.max &&
            (this.value > this.max || this._previousValue > this.max)
        ) {
            this._value = this.max;
        }
    }

    /**
     * Normalize loss of precision after value change and send the updated value to the input.
     */
    handleNumberOutput() {
        this._value = this.handlePrecision(this._value);
        this.updateValue();
    }

    /**
     * Sets the input values to a specified decimal length based on fractionDigits.
     *
     * @param input
     * @type {number}
     */
    handlePrecision(input) {
        if (!isNaN(input)) {
            input = (+input).toFixed(this._fractionDigits);
        }
        return +input;
    }

    /**
     * Updates the value in lightning-input, updates proxy for validation and dispatches change event.
     */
    updateValue() {
        [
            ...this.template.querySelectorAll(
                '[data-element-id="lightning-input"]'
            )
        ].forEach((element) => {
            element.value = this._value;
        });

        this._updateProxyInputAttributes('value');

        /**
         * @event
         * @name change
         * @description The event fired when the value changes.
         * @param {number} value
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value: this._value
                }
            })
        );
        this.showHelpMessageIfInvalid();
    }

    /**
     * Once a user finishes the input field entry the handler normalizes the value and sends it to update.
     *
     * @param {Event} event
     */
    handlerCommit(event) {
        this._value = +event.target.value;
        this.handlePrecision(this._value);
        this.updateValue();
    }

    /**
     * Focus handler.
     */
    handlerFocus() {
        this.dispatchEvent(new CustomEvent('focus'));
    }

    /**
     * Blur handler.
     */
    handlerBlur() {
        this.dispatchEvent(new CustomEvent('blur'));
    }

    /**
     * Method for handling user Up and Down arrows inside input field to increment or decrement the value.
     *
     * @param {Event} event
     */
    handlerKeyDown(event) {
        let key = event.key;
        switch (key) {
            case 'ArrowUp':
                this._value = this.value - this.inputStep;
                this.incrementValue();
                break;
            case 'ArrowDown':
                this._value = this.value + this.inputStep;
                this.decrementValue();
                break;
            default:
                key = undefined;
                break;
        }
    }

    /**
     * Proxy Input Attributes updater.
     *
     * @param {object} attributes
     */
    _updateProxyInputAttributes(attributes) {
        if (this._constraintApiProxyInputUpdater) {
            this._constraintApiProxyInputUpdater(attributes);
        }
    }
}
