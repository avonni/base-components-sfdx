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
import qrcodeGeneration from './avonniQrcodeGeneration.js';

const QR_ENCODINGS = {valid: ['ISO_8859_1', 'UTF_8'], default: 'ISO_8859_1'};
const QR_ERROR_CORRECTIONS = {valid: ['L', 'M', 'Q', 'H'], default: 'L'};
const QR_RENDER_AS = {valid: ['canvas', 'svg'], default: 'svg'};

const DEFAULT_BORDER_WIDTH = 0;
const DEFAULT_PADDING = 0;
const DEFAULT_SIZE = 200;
const DEFAULT_COLOR = '#000';
const DEFAULT_BACKGROUND_COLOR = '#fff';

export default class AvonniQrcode extends LightningElement {
    _borderWidth = DEFAULT_BORDER_WIDTH;
    _padding = DEFAULT_PADDING;
    _value;
    _size = DEFAULT_SIZE;
    _encoding = QR_ENCODINGS.default;
    _errorCorrection = QR_ERROR_CORRECTIONS.default;
    _renderAs = QR_RENDER_AS.default;
    _background = DEFAULT_BACKGROUND_COLOR;
    _borderColor;
    _color = DEFAULT_COLOR;

    rendered = false;

    renderedCallback() {
        this.redraw();
        this.rendered = true;
    }

    @api
    get borderWidth() {
        return this._borderWidth;
    }

    set borderWidth(value) {
        this._borderWidth =
            typeof value === 'number' ? value : DEFAULT_BORDER_WIDTH;

        if (this.rendered) {
            this.redraw();
        }
    }

    @api
    get padding() {
        return this._padding;
    }

    set padding(value) {
        this._padding = typeof value === 'number' ? value : DEFAULT_PADDING;

        if (this.rendered) {
            this.redraw();
        }
    }

    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;

        if (this.rendered) {
            this.redraw();
        }
    }

    @api
    get size() {
        return this._size;
    }

    set size(value) {
        if ((!isNaN(value) && Number(value) < 1) || isNaN(value)) {
            this._size = DEFAULT_SIZE;
        } else {
            this._size = Number(value);
        }

        if (this.rendered) {
            this.redraw();
        }
    }

    @api get encoding() {
        return this._encoding;
    }

    set encoding(encoding) {
        this._encoding = normalizeString(encoding, {
            fallbackValue: QR_ENCODINGS.default,
            validValues: QR_ENCODINGS.valid,
            toLowerCase: false
        });

        if (this.rendered) {
            this.redraw();
        }
    }

    @api get errorCorrection() {
        return this._errorCorrection;
    }

    set errorCorrection(value) {
        this._errorCorrection = normalizeString(value, {
            fallbackValue: QR_ERROR_CORRECTIONS.default,
            validValues: QR_ERROR_CORRECTIONS.valid,
            toLowerCase: false
        });

        if (this.rendered) {
            this.redraw();
        }
    }

    @api get renderAs() {
        return this._renderAs;
    }

    set renderAs(value) {
        this._renderAs = normalizeString(value, {
            fallbackValue: QR_RENDER_AS.default,
            validValues: QR_RENDER_AS.valid
        });

        if (this.rendered) {
            this.redraw();
        }
    }

    @api get background() {
        return this._background;
    }

    set background(color) {
        if (typeof color === 'string') {
            let styles = new Option().style;
            styles.color = color;

            if (
                styles.color === color ||
                this.isHexColor(color.replace('#', ''))
            ) {
                this._background = color;
            }
        } else {
            this._background = DEFAULT_BACKGROUND_COLOR;
        }

        if (this.rendered) {
            this.redraw();
        }
    }

    @api get borderColor() {
        return this._borderColor;
    }

    set borderColor(color) {
        if (typeof color === 'string') {
            let styles = new Option().style;
            styles.color = color;

            if (
                styles.color === color ||
                this.isHexColor(color.replace('#', ''))
            ) {
                this._borderColor = color;
            }
        }

        if (this.rendered) {
            this.redraw();
        }
    }

    @api get color() {
        return this._color;
    }

    set color(color) {
        if (typeof color === 'string') {
            let styles = new Option().style;
            styles.color = color;

            if (
                styles.color === color ||
                this.isHexColor(color.replace('#', ''))
            ) {
                this._color = color;
            }
        } else {
            this._color = DEFAULT_COLOR;
        }

        if (this.rendered) {
            this.redraw();
        }
    }

    get renderAsSvg() {
        return this._renderAs === 'svg';
    }

    isHexColor(hex) {
        return (
            typeof hex === 'string' &&
            hex.length === 6 &&
            !isNaN(Number('0x' + hex))
        );
    }

    @api
    redraw() {
        if (this.value) {
            const qrCodeGenerated = new qrcodeGeneration(
                0,
                this._errorCorrection
            );

            qrCodeGenerated.addData(this.value, this._encoding);
            qrCodeGenerated.make();

            let svgCode = qrCodeGenerated.createSvgTag({
                cellColor: () => {
                    return this._color;
                },
                bg: {
                    enabled: true,
                    fill: this._background
                },
                margin: 0,
                svgSize: this.size
            });

            if (this.renderAsSvg) {
                let element = this.template.querySelector('.qrcode');
                if (!element) return;
                // eslint-disable-next-line @lwc/lwc/no-inner-html
                element.innerHTML = svgCode;

                element.firstElementChild.style.border = `${this.borderWidth}px solid ${this._borderColor}`;
                element.firstElementChild.style.padding = `${this.padding}px`;
                element.firstElementChild.style.maxWidth = '100%';
            } else {
                let canvas = this.template.querySelector('canvas');
                if (!canvas) return;

                if (this.size) {
                    canvas.width = this.size;
                    canvas.height = this.size;
                    canvas.style.maxWidth = this.size + 'px';
                } else {
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                    canvas.width = canvas.offsetWidth;
                    canvas.height = canvas.offsetWidth;
                    canvas.style.maxWidth = this.offsetWidth + 'px';
                }

                canvas.style.border = `${this.borderWidth}px solid ${this._borderColor}`;
                canvas.style.padding = `${this.padding}px`;

                let ctx = canvas.getContext('2d');
                let img = new Image();

                img.onload = function () {
                    ctx.drawImage(this, 0, 0);
                };

                img.src =
                    'data:image/svg+xml; charset=utf8, ' +
                    encodeURIComponent(svgCode);
            }
        }
    }
}
