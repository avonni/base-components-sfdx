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
import { normalizeBoolean, generateColors } from 'c/utilsPrivate';
import { generateUniqueId } from 'c/utils';

const DEFAULT_COLORS = [
    '#e3abec',
    '#c2dbf7',
    '#9fd6ff',
    '#9de7da',
    '#9df0bf',
    '#fff099',
    '#fed49a',
    '#d073df',
    '#86b9f3',
    '#5ebbff',
    '#44d8be',
    '#3be281',
    '#ffe654',
    '#ffb758',
    '#bd35bd',
    '#5778c1',
    '#5ebbff',
    '#00aea9',
    '#3bba4c',
    '#f4bc25',
    '#f99120',
    '#580d8c',
    '#001870',
    '#0a2399',
    '#097476',
    '#096a50',
    '#b67d11',
    '#b85d0d'
];

const DEFAULT_TILE_WIDTH = 20
const DEFAULT_TILE_HEIGHT = 20
const DEFAULT_COLUMNS = 7

export default class AvonniColorPalette extends LightningElement {
    @api value;
    @api colors = DEFAULT_COLORS;

    _columns = DEFAULT_COLUMNS;
    _tileWidth = DEFAULT_TILE_WIDTH;
    _tileHeight = DEFAULT_TILE_HEIGHT;
    _disabled = false;
    _isLoading = false;
    _readOnly = false;
    init = false;

    renderedCallback() {
        this.initContainer();
    }

    initContainer() {
        let containerWidth = this.columns * (Number(this.tileWidth) + 8);
        let containerMinHeight = Number(this.tileHeight) + 8;
        let container = this.template.querySelector('.avonni-pallet-container');

        if (container) {
            container.style.width = `${containerWidth}px`;
            container.style.minHeight = `${containerMinHeight}px`;
        }

        [...this.template.querySelectorAll('.slds-swatch')].forEach(
            (element) => {
                if (this.disabled) {
                    element.style.backgroundColor = '#dddbda';
                } else {
                    element.style.backgroundColor = element.parentElement.getAttribute(
                        'item-color'
                    );
                }

                element.style.height = `${this.tileHeight}px`;
                element.style.width = `${this.tileWidth}px`;
            }
        );
    }

    @api
    get columns() {
        return this._columns;
    }

    set columns(value) {
        this._columns = Number(value);
        this.initContainer();
    }

    @api
    get tileWidth() {
        return this._tileWidth;
    }

    set tileWidth(value) {
        this._tileWidth = Number(value);
        this.initContainer();
    }

    @api
    get tileHeight() {
        return this._tileHeight;
    }

    set tileHeight(value) {
        this._tileHeight = Number(value);
        this.initContainer();
    }

    @api get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
        this.initContainer();
    }

    @api get isLoading() {
        return this._isLoading;
    }

    set isLoading(value) {
        this._isLoading = normalizeBoolean(value);
        this.initContainer();
    }

    @api get readOnly() {
        return this._readOnly;
    }

    set readOnly(value) {
        this._readOnly = normalizeBoolean(value);
        this.initContainer();
    }

    get uniqKey() {
        return generateUniqueId();
    }

    @api
    reset() {
        this.value = '';
        this.dispatchChange();
    }

    handleFocus() {
        this.dispatchEvent(
            new CustomEvent('privatefocus', {
                bubbles: true,
                cancelable: true
            })
        );
    }

    handleBlur() {
        this.dispatchEvent(new CustomEvent('blur'));

        this.dispatchEvent(
            new CustomEvent('privateblur', {
                composed: true,
                bubbles: true,
                cancelable: true
            })
        );
    }

    handleClick(event) {
        if (this.disabled || this.readOnly) {
            event.preventDefault();
            return;
        }

        this.value = event.target.parentElement.getAttribute('item-color');
        event.preventDefault();
        this.dispatchChange();
    }

    dispatchChange() {
        let colors = generateColors(this.value);

        if (!this.disabled && !this.readOnly) {
            this.dispatchEvent(
                new CustomEvent('change', {
                    bubbles: true,
                    cancelable: true,
                    detail: {
                        hex: colors.hex,
                        hexa: colors.hexa,
                        rgb: colors.rgb,
                        rgba: colors.rgba,
                        alpha: colors.A
                    }
                })
            );
        }
    }
}
