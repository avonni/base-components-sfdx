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
import { normalizeString, normalizeBoolean } from 'c/utilsPrivate';
import { classSet } from 'c/utils';

const MEDIA_OBJECT_SIZES = {
    valid: ['small', 'medium', 'large'],
    default: 'medium'
};
const VERTICAL_ALIGNMENTS = {
    valid: ['center', 'start', 'end'],
    default: 'start'
};

/**
 * @class
 * @descriptor avonni-media-object
 * @storyId example-media-object--base
 * @public
 */
export default class AvonniMediaObject extends LightningElement {
    _verticalAlign = VERTICAL_ALIGNMENTS.default;
    _responsive = false;
    _inline = false;
    _size = MEDIA_OBJECT_SIZES.default;

    /**
     * Determines how to align the media object items vertically in the container. The alignment options are start, center and end.
     *
     * @type {string}
     * @public
     * @default start
     */
    @api
    get verticalAlign() {
        return this._verticalAlign;
    }

    set verticalAlign(verticalAlign) {
        this._verticalAlign = normalizeString(verticalAlign, {
            fallbackValue: VERTICAL_ALIGNMENTS.default,
            validValues: VERTICAL_ALIGNMENTS.value
        });
    }

    /**
     * figure and body stack on smaller screens.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get responsive() {
        return this._responsive;
    }

    set responsive(value) {
        this._responsive = normalizeBoolean(value);
    }

    /**
     * Aligns the figure and body to be inline-block of each other.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get inline() {
        return this._inline;
    }

    set inline(value) {
        this._inline = normalizeBoolean(value);
    }

    /**
     * The size of the media object. Valid values include small, medium and large.
     *
     * @type {string}
     * @public
     * @default medium
     */
    @api get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: MEDIA_OBJECT_SIZES.default,
            validValues: MEDIA_OBJECT_SIZES.valid
        });
    }

    /**
     * Compute media object class styling based on selected attributes.
     *
     * @type {string}
     */
    get mediaObjectClass() {
        return classSet('slds-media')
            .add({
                'slds-media_small': this._size === 'small',
                'slds-media_large': this._size === 'large',
                'slds-media_center': this._verticalAlign === 'center',
                'avonni-media-object-alignement-end':
                    this._verticalAlign === 'end',
                'slds-media_responsive': this._responsive === true,
                'avonni-media-object-display-inline': this._inline === true
            })
            .toString();
    }
}
