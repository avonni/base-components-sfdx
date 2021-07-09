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
import { normalizeString } from 'c/utilsPrivate';

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

export default class AvonniOutputData extends LightningElement {
    @api label;

    _typeAttributes = {};
    _type = DATA_TYPES.default;
    _value;

    @api
    get typeAttributes() {
        return this._typeAttributes;
    }
    set typeAttributes(value) {
        this._typeAttributes = typeof value === 'object' ? value : {};
    }

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

    get isBoolean() {
        return this.type === 'boolean';
    }

    get isDate() {
        return this.type === 'date';
    }

    get isEmail() {
        return this.type === 'email';
    }

    get isLocation() {
        return this.type === 'location';
    }

    get isNumber() {
        return (
            this.type === 'number' ||
            this.type === 'percent' ||
            this.type === 'currency'
        );
    }

    get isPhone() {
        return this.type === 'phone';
    }

    get isText() {
        return this.type === 'text';
    }

    get isUrl() {
        return this.type === 'url';
    }

    get numberFormatStyle() {
        if (this.type === 'currency' || this.type === 'percent') {
            return this.type;
        }
        return 'decimal';
    }

    get showBoolean() {
        return this.isBoolean && this.value;
    }
}
