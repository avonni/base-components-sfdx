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
import {
    SUPPORTED_TYPE_ATTRIBUTES,
    TYPES,
    TYPE_ATTRIBUTES,
    VARIANTS
} from './avonniConstants';

/**
 * The output data displays data depending on its type.
 *
 * @class
 * @descriptor avonni-output-data
 * @storyId example-output-data--base
 * @public
 */
export default class AvonniOutputData extends LightningElement {
    /**
     * Label of the output. If present, it will be displayed on top of the data.
     *
     * @type {string}
     * @public
     */
    @api label;

    _typeAttributes = {};
    _type = TYPES.default;
    _value;
    _variant = VARIANTS.default;

    normalizedTypeAttributes = {};
    _isConnected = false;

    connectedCallback() {
        this.normalizeTypeAttributes();
        this._isConnected = true;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Attributes specific to the type (see <strong>Types and Type Attributes</strong>).
     *
     * @type {object}
     * @public
     */
    @api
    get typeAttributes() {
        return this._typeAttributes;
    }
    set typeAttributes(value) {
        this._typeAttributes = typeof value === 'object' ? value : {};

        if (this._isConnected) this.normalizeTypeAttributes();
    }

    /**
     * Type of the output. Valid types include boolean, currency, date, email, location, number, percent, phone, url and text.
     *
     * @type {string}
     * @public
     */
    @api
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = normalizeString(value, {
            fallbackValue: TYPES.default,
            validValues: TYPES.valid
        });

        if (this._isConnected) this.normalizeTypeAttributes();
    }

    /**
     * Value of the output.
     *
     * @type {string}
     * @public
     */
    @api
    get value() {
        if (this.isBoolean) {
            return this._value === 'true' || this._value;
        }

        return this._value;
    }
    set value(value) {
        this._value = value;
    }

    /**
     * The variant changes the appearance of an input field. Accepted variants include standard, label-inline, label-hidden, and label-stacked.
     * This value defaults to standard, which displays the label above the field. Use label-hidden to hide the label but make it available to assistive technology. Use label-inline to horizontally align the label and input field. Use label-stacked to place the label above the input field.
     *
     * @type {string}
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

    get computedLabelClass() {
        return classSet('slds-item_label slds-text-color_weak slds-truncate')
            .add({
                'slds-assistive-text': this.variant === 'label-hidden'
            })
            .toString();
    }

    /**
     * Computed class of the output wrapper.
     *
     * @type {string}
     */
    get computedWrapperClass() {
        const variant = this.variant;
        return classSet()
            .add({
                'slds-list_stacked':
                    variant === 'label-stacked' || variant === 'standard',
                'slds-list_horizontal slds-wrap': variant === 'label-inline'
            })
            .toString();
    }

    /**
     * True if the type is boolean.
     *
     * @type {boolean}
     */
    get isBoolean() {
        return this.type === 'boolean';
    }

    /**
     * True if the type is date.
     *
     * @type {boolean}
     */
    get isDate() {
        return this.type === 'date';
    }

    /**
     * True if the type is email.
     *
     * @type {boolean}
     */
    get isEmail() {
        return this.type === 'email';
    }

    /**
     * True if the type is location.
     *
     * @type {boolean}
     */
    get isLocation() {
        return this.type === 'location';
    }

    /**
     * True if the type is number, percent or currency.
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
     * True if the type is phone.
     *
     * @type {boolean}
     */
    get isPhone() {
        return this.type === 'phone';
    }

    /**
     * True if the type is text.
     *
     * @type {boolean}
     */
    get isText() {
        return this.type === 'text';
    }

    /**
     * True if the type is url.
     *
     * @type {boolean}
     */
    get isUrl() {
        return this.type === 'url';
    }

    /**
     * Format of the number type.
     *
     * @type {boolean}
     */
    get numberFormatStyle() {
        if (this.type === 'currency' || this.type === 'percent') {
            return this.type;
        }
        return 'decimal';
    }

    /**
     * True if the type is boolean and the value is truthy.
     *
     * @type {boolean}
     */
    get showBoolean() {
        return this.isBoolean && this.value;
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Normalize the type attributes, to remove the invalid and unsupported attributes.
     */
    normalizeTypeAttributes() {
        const typeAttributes = Object.entries(this.typeAttributes);
        if (!typeAttributes.length) {
            this.normalizedTypeAttributes = {};
            return;
        }

        const normalizedTypeAttributes = {};
        for (let i = 0; i < typeAttributes.length; i++) {
            // Check if the attribute is valid for the type
            const [key, value] = typeAttributes[i];
            const allowedAttribute =
                SUPPORTED_TYPE_ATTRIBUTES[this.type] &&
                SUPPORTED_TYPE_ATTRIBUTES[this.type].includes(key);
            const hasValue = value !== undefined && value !== null;
            if (!allowedAttribute || !hasValue) continue;

            // Check if the value type is valid
            const definition = TYPE_ATTRIBUTES.find(
                (attr) => attr.name === key
            );

            let normalizedValue = value;
            if (definition.type === 'string' && definition.valid) {
                // Normalize string attributes
                normalizedValue = normalizeString(value, {
                    fallbackValue: definition.default,
                    validValues: definition.valid
                });
                if (!normalizedValue) continue;
            } else if (
                definition.type === 'string' &&
                typeof normalizedValue !== 'string'
            ) {
                continue;
            } else if (definition.type === 'number') {
                // Normalize number attributes
                normalizedValue = Number(value);
                if (isNaN(normalizedValue)) continue;
            } else if (definition.type === 'boolean') {
                // Normalize boolean attributes
                normalizedValue = normalizeBoolean(value);
            }

            normalizedTypeAttributes[key] = normalizedValue;
        }

        this.normalizedTypeAttributes = normalizedTypeAttributes;
    }
}
