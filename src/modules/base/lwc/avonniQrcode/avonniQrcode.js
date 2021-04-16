import { LightningElement, api } from 'lwc';
import { normalizeString } from 'c/utilsPrivate';
import qrcodeGeneration from './avonniQrcodeGeneration.js';

const validEncodings = ['ISO_8859_1', 'UTF_8'];
const validErrorCorrections = ['L', 'M', 'Q', 'H'];
const validRenderAs = ['canvas', 'svg'];

const DEFAULT_BORDER_WIDTH = 0;
const DEFAULT_PADDING = 0;
const DEFAULT_SIZE = 200;
const DEFAULT_ENCODING = 'ISO_8859_1';
const DEFAULT_ERROR_CORRECTION = 'L';
const DEFAULT_RENDER_AS = '#svg';
const DEFAULT_COLOR = '#000';
const DEFAULT_BACKGROUND_COLOR = '#fff';

export default class AvonniQrcode extends LightningElement {
    _borderWidth = DEFAULT_BORDER_WIDTH;
    _padding = DEFAULT_PADDING;
    _value;
    _size = DEFAULT_SIZE;
    _encoding = DEFAULT_ENCODING;
    _errorCorrection = DEFAULT_ERROR_CORRECTION;
    _renderAs = DEFAULT_RENDER_AS;
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
            fallbackValue: 'ISO_8859_1',
            validValues: validEncodings,
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
            fallbackValue: 'L',
            validValues: validErrorCorrections,
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
            fallbackValue: 'svg',
            validValues: validRenderAs
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
                // eslint-disable-next-line @lwc/lwc/no-inner-html
                element.innerHTML = svgCode;

                element.firstElementChild.style.border = `${this.borderWidth}px solid ${this._borderColor}`;
                element.firstElementChild.style.padding = `${this.padding}px`;
                element.firstElementChild.style.maxWidth = '100%';
            } else {
                let canvas = this.template.querySelector('canvas');

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
