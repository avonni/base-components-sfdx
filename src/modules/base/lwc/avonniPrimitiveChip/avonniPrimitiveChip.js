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
    normalizeObject,
    deepCopy
} from 'c/utilsPrivate';

import { classSet } from 'c/utils';

const CHIP_VARIANTS = {
    valid: [
        'alt-inverse',
        'base',
        'brand',
        'error',
        'info',
        'inverse',
        'offline',
        'success',
        'warning'
    ],
    default: 'base'
};

const MEDIA_POSITION = {
    valid: ['left', 'right'],
    default: 'left'
};

export default class AvonniPrimitiveChip extends LightningElement {
    _label = '';
    _outline = false;
    _variant = CHIP_VARIANTS.default;
    _avatar = undefined;
    _position = MEDIA_POSITION.default;
    _prefixIconName = undefined;
    _suffixIconName = undefined;
    _hidden = false;

    /**
     * Label displayed in the chip.
     *
     * @public
     * @type {string}
     */
    @api
    get label() {
        return this._label;
    }
    set label(value) {
        this._label = value;
    }

    /**
     * If true, display an outline style button.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get outline() {
        return this._outline;
    }
    set outline(hasOutline) {
        this._outline = normalizeBoolean(hasOutline);
    }

    /**
     * The variant changes the appearance of the chip. Accepted variants include base, brand, inverse, alt-inverse, success, info, warning, error, offline.
     *
     * @public
     * @type {string}
     * @default base
     */
    @api
    get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: CHIP_VARIANTS.default,
            validValues: CHIP_VARIANTS.valid
        });
    }

    /**
     *  The avatar to display. Set to null by default
     *  @public
     *  @type {Object}
     *  @default null
     */
    @api
    get avatar() {
        return this._avatar;
    }
    set avatar(value) {
        if (value) {
            const tempAvatar = deepCopy(normalizeObject(value));
            this._avatar = tempAvatar;
        } else {
            this._avatar = null;
        }
    }

    /** The prefix name of the icon to display.
     *  @public
     *  @type {string}
     *  @default x-small
     */
    @api
    get prefixIconName() {
        return this._prefixIconName;
    }
    set prefixIconName(value) {
        this._prefixIconName = value;
    }

    /** The suffix name of the icon to display.
     *  @public
     *  @type {string}
     *  @default x-small
     */
    @api
    get suffixIconName() {
        return this._suffixIconName;
    }
    set suffixIconName(value) {
        this._suffixIconName = value;
    }

    @api
    get hidden() {
        return this._hidden;
    }
    set hidden(value) {
        this._hidden = normalizeBoolean(value);
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     *  Computed class for chip.
     */
    get computedChipClass() {
        return classSet('').add({
            'slds-is-collapsed': this._hidden
        });
    }

    get showAvatar() {
        return this._avatar;
    }

    /**
     *  If left icon media is to be shown.
     */
    get showAvatarLeft() {
        return this.showAvatar && this._avatar.position !== 'right';
    }
}
