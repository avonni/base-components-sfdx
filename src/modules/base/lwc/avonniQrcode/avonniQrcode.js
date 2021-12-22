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

const QR_ENCODINGS = { valid: ['ISO_8859_1', 'UTF_8'], default: 'ISO_8859_1' };
const QR_ERROR_CORRECTIONS = { valid: ['L', 'M', 'Q', 'H'], default: 'L' };
const QR_RENDER_AS = { valid: ['canvas', 'svg'], default: 'svg' };

const DEFAULT_BORDER_WIDTH = 0;
const DEFAULT_PADDING = 0;
const DEFAULT_SIZE = 200;
const DEFAULT_COLOR = '#000000';
const DEFAULT_BACKGROUND_COLOR = '#ffffff';

/**
 * @class
 * @descriptor avonni-qrcode
 * @storyId example-qrcode--base
 * @public
 */
export default class AvonniQrcode extends LightningElement {
    _background;
    _borderColor;
    _borderWidth = DEFAULT_BORDER_WIDTH;
    _color;
    _encoding = QR_ENCODINGS.default;
    _errorCorrection = QR_ERROR_CORRECTIONS.default;
    _padding = DEFAULT_PADDING;
    _renderAs = QR_RENDER_AS.default;
    _size = DEFAULT_SIZE;
    _value;

    _rendered = false;

    renderedCallback() {
        this.redraw();
        this._rendered = true;
    }

    /**
     * Background color of the qr-code. Accepts a valid CSS color string, including hex and rgb.
     *
     * @type {string}
     * @public
     * @default #ffffff
     */
    @api
    get background() {
        return this._background;
    }

    set background(color) {
        if (color && typeof color === 'string') {
            let styles = new Option().style;
            styles.color = color;

            if (
                styles.color === color ||
                this.isHexColor(color.replace('#', ''))
            ) {
                this._background = color;
            }
        }

        if (this._rendered) {
            this.redraw();
        }
    }

    /**
     * The color of the border. Accepts a valid CSS color string, including hex and rgb.
     *
     * @type {string}
     * @public
     */
    @api
    get borderColor() {
        return this._borderColor;
    }

    set borderColor(color) {
        if (color && typeof color === 'string') {
            let styles = new Option().style;
            styles.color = color;

            if (
                styles.color === color ||
                this.isHexColor(color.replace('#', ''))
            ) {
                this._borderColor = color;
            }
        }

        if (this._rendered) {
            this.redraw();
        }
    }

    /**
     * The width of the border in pixels. By default the border width is set to zero which means that the border will not appear.
     *
     * @type {number}
     * @public
     * @default 0
     */
    @api
    get borderWidth() {
        return this._borderWidth;
    }

    set borderWidth(value) {
        this._borderWidth =
            typeof value === 'number' ? value : DEFAULT_BORDER_WIDTH;

        if (this._rendered) {
            this.redraw();
        }
    }

    /**
     * The color of the QR code. Accepts a valid CSS color string, including hex and rgb.
     *
     * @type {string}
     * @public
     * @default #000000
     */
    @api
    get color() {
        return this._color;
    }

    set color(color) {
        if (color && typeof color === 'string') {
            let styles = new Option().style;
            styles.color = color;

            if (
                styles.color === color ||
                this.isHexColor(color.replace('#', ''))
            ) {
                this._color = color;
            }
        }

        if (this._rendered) {
            this.redraw();
        }
    }

    /**
     * The encoding mode used to encode the value.The possible values are:
     * * "ISO_8859_1" - supports all characters from the ISO/IEC 8859-1 character set.
     * * "UTF_8" - supports all Unicode characters.
     *
     * @type {string}
     * @public
     * @default ISO_8859_1
     */
    @api
    get encoding() {
        return this._encoding;
    }

    set encoding(encoding) {
        this._encoding = normalizeString(encoding, {
            fallbackValue: QR_ENCODINGS.default,
            validValues: QR_ENCODINGS.valid,
            toLowerCase: false
        });

        if (this._rendered) {
            this.redraw();
        }
    }

    /**
     * The error correction level used to encode the value. The possible values are:
     * * "L" - approximately 7% of the codewords can be restored.
     * * "M" - approximately 15% of the codewords can be restored.
     * * "Q" - approximately 25% of the codewords can be restored.
     * * "H" - approximately 30% of the codewords can be restored.
     *
     * @type {string}
     * @public
     * @default L
     */
    @api
    get errorCorrection() {
        return this._errorCorrection;
    }

    set errorCorrection(value) {
        this._errorCorrection = normalizeString(value, {
            fallbackValue: QR_ERROR_CORRECTIONS.default,
            validValues: QR_ERROR_CORRECTIONS.valid,
            toLowerCase: false
        });

        if (this._rendered) {
            this.redraw();
        }
    }

    /**
     * Sets the minimum distance in pixels that should be left between the border and the QR modules.
     *
     * @type {number}
     * @public
     * @default 0
     */
    @api
    get padding() {
        return this._padding;
    }

    set padding(value) {
        this._padding = typeof value === 'number' ? value : DEFAULT_PADDING;

        if (this._rendered) {
            this.redraw();
        }
    }

    /**
     * Sets the preferred rendering engine. If it is not supported by the browser, the QRCode will switch to the first available mode. The supported values are:
     * * "canvas" - renders the widget as a Canvas element, if available.
     * * "svg" - renders the widget as inline SVG document, if available
     *
     * @type {string}
     * @public
     * @default svg
     */
    @api
    get renderAs() {
        return this._renderAs;
    }

    set renderAs(value) {
        this._renderAs = normalizeString(value, {
            fallbackValue: QR_RENDER_AS.default,
            validValues: QR_RENDER_AS.valid
        });

        this._color =
            this._renderAs === 'canvas' && !this._color ? DEFAULT_COLOR : null;
        this._background =
            this._renderAs === 'canvas' && !this._background
                ? DEFAULT_BACKGROUND_COLOR
                : null;

        if (this._rendered) {
            this.redraw();
        }
    }

    /**
     * Specifies the size of a QR code in pixels (i.e. "200px"). Numeric values are treated as pixels.
     * If no size is specified, it will be determined from the element width and height. In case the element has width or height of zero, a default value of 200 pixels will be used.
     *
     * @type {number}
     * @public
     * @default 200
     */
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

        if (this._rendered) {
            this.redraw();
        }
    }

    /**
     * The value of the QRCode.
     *
     * @type {string}
     * @public
     * @required
     */
    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;

        if (this._rendered) {
            this.redraw();
        }
    }

    /**
     * Render QR Code as SVG.
     *
     * @type {string}
     */
    get renderAsSvg() {
        return this._renderAs === 'svg';
    }

    get isColorNull() {
        return !this._color;
    }

    get isBackgroundNull() {
        return !this._background;
    }

    /**
     * Verify if color is hexadecimal.
     *
     * @param {string} hex
     * @returns {boolean}
     */
    isHexColor(hex) {
        return (
            typeof hex === 'string' &&
            hex.length === 6 &&
            !isNaN(Number('0x' + hex))
        );
    }

    /**
     * Redraws the QR code using the current value and options.
     *
     * @public
     */
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
                svgSize: this.size,
                renderAsSvg: this.renderAsSvg,
                isColorNull: this.isColorNull,
                isBackgroundNull: this.isBackgroundNull
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
