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
import SVG_URL from '@salesforce/resourceUrl/illustrationLibrary';

const validSizes = ['small', 'large'];

const validVariants = [
    'text-only',
    'going-camping',
    'gone_fishing',
    'maintenance',
    'desert',
    'open-road',
    'no-access',
    'no-connection',
    'not-available-in-lightning',
    'page-not-available',
    'walkthrough-not-available',
    'fishing-deals',
    'lake-mountain',
    'no-events',
    'no-events-2',
    'no-task',
    'no-task-2',
    'setup',
    'gone-fishing',
    'no-access-2',
    'no-content',
    'no-preview',
    'preview',
    'research'
];

export default class AvonniIllustration extends LightningElement {
    @api title;
    _size = 'small';
    _variant = 'text-only';

    @api get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: 'text-only',
            validValues: validVariants
        });
    }

    @api get size() {
        return this._variant;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: 'small',
            validValues: validSizes
        });
    }

    get illustrationClass() {
        return classSet('slds-illustration')
            .add({
                'slds-illustration_small': this._size === 'small',
                'slds-illustration_large': this._size === 'large'
            })
            .toString();
    }

    get svgURL() {
        return SVG_URL + '/' + this._variant + '.svg';
    }

    get showSvg() {
        return this._variant !== 'text-only';
    }
}
