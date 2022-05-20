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

/**
 * @constant
 * @type {object}
 * @property {string[]} valid   - The valid data types.
 * @property {string}   default - The default data type.
 */
const DATA_TYPES = {
    valid: [
        'boolean',
        'currency',
        'date',
        'email',
        'location',
        'number',
        'percent',
        'phone',
        'text',
        'url'
    ],
    default: 'text'
};

/**
 * @constant
 * @type {object}
 * @property {string[]} valid   - The valid variants.
 * @property {string}   default - The default variant.
 */
const VARIANTS = {
    valid: ['standard', 'label-inline', 'label-hidden', 'label-stacked'],
    default: 'standard'
};

/**
 * @class
 * @classdesc The input data displays data depending on its type.
 * @name InputData
 * @descriptor avonni-input-data
 * @storyId example-input-data--base
 * @public
 */
export default class AvonniInputData extends LightningElement {
    /**
     * Label of the input. If present, it will be displayed on top of the data.
     *
     * @type {string}
     * @public
     */
    @api label;

    /**
     * Specifies the name of an input element.
     *
     * @type {string}
     * @public
     */
    @api name;

    /**
     * Message to be displayed when input field is empty, to prompt the user for a valid entry.
     *
     * @type {string}
     * @public
     */
    @api placeholder;

    _checked = false;
    _disabled = false;
    _latitude;
    _longitude;
    _readOnly = false;
    _required = false;
    _type = DATA_TYPES.default;
    _variant = VARIANTS.default;
    _value = '';

    /**
     * Called when the element is inserted in a document.
     * Initializes the input value.
     */
    connectedCallback() {
        this.initalizeInputValue();
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * If present, the input is checked. Only has an effect with type boolean.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get checked() {
        return this._checked;
    }

    set checked(value) {
        this._checked = normalizeBoolean(value);
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
     * Latitude of a location.
     * Only has an effect with type location.
     *
     * @type {number}
     * @public
     */
    @api
    get latitude() {
        return this._latitude;
    }
    set latitude(value) {
        this._latitude = this.normalizeLocationValue(value, 90);
    }

    /**
     * Longitude of a location.
     * Only has an effect with type location.
     *
     * @type {number}
     * @public
     */
    @api
    get longitude() {
        return this._longitude;
    }
    set longitude(value) {
        this._longitude = this.normalizeLocationValue(value, 180);
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
     * Type of the input.
     * Accepted types include boolean, currency, date, email, location, number, percent, phone, url and text.
     *
     * @type {string}
     * @default text
     * @public
     */
    @api
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = normalizeString(value, {
            fallbackValue: DATA_TYPES.default,
            validValues: DATA_TYPES.valid
        });
    }

    /**
     * Value of the input.
     * Has an effect with all types, except for boolean and location.
     *
     * @type {string}
     * @public
     */
    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value ? value : '';
    }

    /**
     * The variant changes the appearance of an input field.
     * Accepted variants include standard, label-inline, label-hidden, and label-stacked.
     * This value defaults to standard, which displays the label above the field.
     * Use label-hidden to hide the label but make it available to assistive technology.
     * Use label-inline to horizontally align the label and input field.
     * Use label-stacked to place the label above the input field.
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
            fallbackValue: VARIANTS.default,
            validValues: VARIANTS.valid
        });
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Whether the data input type is a number.
     * Number, percent and currency types are considered as numbers.
     *
     * @type {boolean}
     */
    get isNumber() {
        return (
            this.type === 'number' ||
            this.type === 'percent' ||
            this.type === 'currency'
        );
    }

    /**
     * Whether the data input type is a boolean.
     *
     * @type {boolean}
     */
    get isBoolean() {
        return this.type === 'boolean';
    }

    /**
     * Whether the data input type is a location.
     * @type {boolean}
     */
    get isLocation() {
        return this.type === 'location';
    }

    /**
     * Whether the data input type is a phone number.
     * @type {boolean}
     */
    get isPhone() {
        return this.type === 'phone';
    }

    /**
     * Whether the data input type is different from a location and a phone number.
     * @type {boolean}
     */
    get isBaseInput() {
        return !this.isLocation && !this.isPhone;
    }

    /**
     * The Salesforce lightning-input type attribute equivalent for the data input type.
     * @type {string}
     */
    get inputType() {
        if (this.isNumber) {
            return 'number';
        } else if (this.isBoolean) {
            return 'checkbox';
        }

        return this.type;
    }

    /**
     * The Salesforce lightning-input formatter attribute depending on the number type.
     * @type {string}
     */
    get inputFormat() {
        if (this.type === 'currency' || this.type === 'percent') {
            return this.type;
        }
        return 'decimal';
    }

    /**
     * The label of the input.
     * The Salesforce lightning-input requires a label.
     * If there is no label, one will be given by default.
     * @type {string}
     */
    get inputLabel() {
        return this.label ? this.label : 'Data input';
    }

    /**
     * The variant of the input.
     * If there is no label, the variant will be changed to label-hidden.
     * @type {string}
     */
    get inputVariant() {
        return this.label ? this.variant : 'label-hidden';
    }

    /**
     * The lightning-input element used as input.
     * @type {Element}
     */
    get input() {
        return this.template.firstChild;
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
        this.input.focus();
    }

    /**
     * Removes keyboard focus from the input element.
     *
     * @public
     */
    @api
    blur() {
        this.input.blur();
    }

    /**
     * Displays the error messages. If the input is valid, <code>reportValidity()</code> clears displayed error messages.
     *
     * @returns {boolean} False if invalid, true if valid.
     * @public
     */
    @api
    reportValidity() {
        return this.input.reportValidity();
    }

    /**
     * Sets a custom error message to be displayed when a form is submitted.
     *
     * @param {string} message The string that describes the error. If message is an empty string, the error message is reset.
     * @public
     */
    @api
    setCustomValidity(message) {
        if (!this.isLocation) {
            this.input.setCustomValidity(message);
        }
    }

    /**
     * Sets a custom error message to be displayed for the latitude or longitude field when the value is submitted.
     *
     * @param {string} message Describes the error. If message is an empty, the error message is reset.
     * @param {string} fieldName Name of the field, which must be a latitude or longitude.
     * @public
     */
    @api
    setCustomValidityForField(message, fieldName) {
        if (this.isLocation) {
            this.input.setCustomValidityForField(message, fieldName);
        }
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
     * Initializes the value of the input according to its type
     */
    initalizeInputValue() {
        if (this.isPhone && this.value) {
            this._value = this.formatPhoneNumber(this.value.toString());
        }
    }

    /**
     * Returns the normalized value of the coordinate.
     * Latitude ranges between -90 and 90.
     * Longitude ranges between -180 and 180.
     * @param {number|undefined}    value       - The value to normalize.
     * @param {number}              absoluteMax - The maximum of the value as an absolute number.
     * @return {number|undefined}
     */
    normalizeLocationValue(value, absoluteMax) {
        return value !== 0 && !value
            ? undefined
            : Math.min(Math.max(value, -absoluteMax), absoluteMax);
    }

    /**
     * Handles a change in the input if its type is a phone number.
     * The phone number will be displayed in the format ###-###-####.
     * @param {Event} event
     */
    handlePhoneInputChange(event) {
        event.target.value = this.formatPhoneNumber(event.target.value);
        this.handleInputChange(event);
    }

    /**
     * Changes a phone number to the format ###-###-####.
     * @param {string} unformattedTel - The phone number to format.
     * @return {string}
     */
    formatPhoneNumber(unformattedTel) {
        const tel = unformattedTel
            .replace(/\D+/g, '')
            .match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        return !tel[2]
            ? tel[1]
            : `${tel[1]}-${tel[2]}` + (tel[3] ? `-${tel[3]}` : '');
    }

    /**
     * Transfers the lightning-input change event to the data input component.
     * @param {Event} event
     */
    handleInputChange(event) {
        event.stopPropagation();

        let detail;
        if (this.isLocation) {
            this._latitude = event.target.latitude;
            this._longitude = event.target.longitude;
            detail = {
                latitude: this.latitude,
                longitude: this.longitude
            };
        } else {
            this._checked = event.target.checked;
            this._value = event.target.value;
            detail = {
                checked: this.checked,
                value: this.value
            };
        }

        /**
         * The event fired when the input value changes.
         *
         * @event
         * @name change
         * @param {number} latitude Latitude, if the input is a location.
         * @param {number} longitude Longitude, if the input is a location.
         * @param {boolean} checked True if the input is a boolean and it is checked.
         * @param {any} value Value of the input, if it is not a location.
         * @public
         * @bubbles
         * @composed
         */
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: detail,
                bubbles: true,
                composed: true
            })
        );
    }

    /**
     * Transfers the lightning-input commit event to the data input component.
     */
    handleInputCommit() {
        /**
         * The event fired when the input looses focus, or Enter is pressed.
         *
         * @event
         * @name commit
         * @public
         */
        this.dispatchEvent(new CustomEvent('commit'));
    }

    /**
     * Transfers the lightning-input blur event to the data input component.
     */
    handleBlur() {
        this.dispatchEvent(new CustomEvent('blur'));
    }

    /**
     * Transfers the lightning-input focus event to the data input component.
     */
    handleFocus() {
        this.dispatchEvent(new CustomEvent('focus'));
    }
}
