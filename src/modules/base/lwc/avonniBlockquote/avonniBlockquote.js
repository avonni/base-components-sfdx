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
import { classSet } from 'c/utils';

const BLOCKQUOTE_VARIANTS = {
    valid: ['default', 'brand', 'warning', 'error', 'success'],
    default: 'default'
};
const ICON_POSITIONS = { valid: ['left', 'right'], default: 'left' };
const ICON_SIZES = {
    valid: ['xx-small', 'x-small', 'small', 'medium', 'large'],
    default: 'small'
};

/**
 * @class
 * @name Blockquote
 * @descriptor avonni-blockquote
 * @storyId example-blockquote--base
 * @public
 */
export default class AvonniBlockquote extends LightningElement {
    /**
     * Icon displayed to the left of the title.
     *
     * @public
     * @type {string}
     */
    @api iconName;
    /**
     * The title can include text and is displayed in the header.
     *
     * @public
     * @type {string}
     */
    @api title;

    _variant = BLOCKQUOTE_VARIANTS.default;
    _iconPosition = ICON_POSITIONS.default;
    _iconSize = ICON_SIZES.default;

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Describes the position of the icon. Options include left and right.
     *
     * @public
     * @type {string}
     * @default left
     */
    @api
    get iconPosition() {
        return this._iconPosition;
    }

    set iconPosition(position) {
        this._iconPosition = normalizeString(position, {
            fallbackValue: ICON_POSITIONS.default,
            validValues: ICON_POSITIONS.valid
        });
    }

    /**
     * The size of the icon. Valid values include xx-small, x-small, small, medium, large.
     *
     * @public
     * @type {string}
     * @default small
     */
    @api
    get iconSize() {
        return this._iconSize;
    }

    set iconSize(size) {
        this._iconSize = normalizeString(size, {
            fallbackValue: ICON_SIZES.default,
            validValues: ICON_SIZES.valid
        });
    }

    /**
     * The variant changes the appearance of the blockquote. Valid values include default, brand, warning, error, success.
     *
     * @public
     * @type {string}
     * @default default
     */
    @api
    get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: BLOCKQUOTE_VARIANTS.default,
            validValues: BLOCKQUOTE_VARIANTS.valid
        });
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Compute blockquote style by variant.
     *
     * @type {string}
     */
    get blockquoteClass() {
        return classSet('avonni-blockquote__container')
            .add(`avonni-blockquote__theme-${this._variant}`)
            .toString();
    }

    /**
     * Set icon left.
     *
     * @type {boolean}
     */
    get leftIcon() {
        return this._iconPosition === 'left' && this.iconName;
    }

    /**
     * Set icon right.
     *
     * @type {boolean}
     */
    get rightIcon() {
        return this._iconPosition === 'right' && this.iconName;
    }
}
