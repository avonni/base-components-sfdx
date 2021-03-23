import { LightningElement, api } from 'lwc';
import {
    colorType,
    generateColors,
    HSVToHSL,
    normalizeBoolean
} from 'c/utilsPrivate';

const indicatorSize = 12;

export default class AvonniColorGradient extends LightningElement {
    @api messageWhenBadInput = 'Please ensure value is correct';

    _disabled = false;
    _readOnly = false;
    _opacity = false;

    _value = '#ffffff';
    colors = generateColors('#ffffff');
    positionX;
    positionY;
    paletteWidth;
    paletteHeight;
    data;
    down = false;
    init = false;
    showError = false;

    connectedCallback() {
        this.onMouseUp = this.handlerMouseUp.bind(this);
        this.onMouseMove = this.handlerMouseMove.bind(this);

        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
    }

    disconnectedCallback() {
        window.removeEventListener('mouseup', this.onMouseUp);
        window.removeEventListener('mousemove', this.onMouseMove);
    }

    renderedCallback() {
        if (!this.init) {
            if (this.opacity) {
                this.setOpacityColor(this.colors.H);
            }

            let palette = this.template.querySelector(
                '.slds-color-picker__custom-range'
            );

            this.paletteWidth = palette.offsetWidth;
            this.paletteHeight = palette.offsetHeight;

            this.setPaletteColor(this.colors.H);
            this.setSwatchColor(this.value);
            this.setindIcatorPosition();

            this.init = true;
        }
    }

    @api
    get value() {
        return this._value;
    }

    set value(value) {
        if (colorType(this.value) !== null) {
            this._value = value;
            this.colors = generateColors(this._value);

            if (this.init) {
                this.setPaletteColor(this.colors.H);
                this.setSwatchColor(this.value);
                this.setindIcatorPosition();
            }
        }
    }

    @api get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);

        [
            ...this.template.querySelectorAll('.slds-color-picker__hue-slider')
        ].forEach(element => {
            element.style.background = this._disabled ? '#ecebea' : '';
        });

        if (this.init) {
            this.setPaletteColor(this.colors.H);
        }
    }

    @api get readOnly() {
        return this._readOnly;
    }

    set readOnly(value) {
        this._readOnly = normalizeBoolean(value);
    }

    @api get opacity() {
        return this._opacity;
    }

    set opacity(value) {
        this._opacity = normalizeBoolean(value);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            if (this.opacity) {
                this.setOpacityColor(this.colors.H);
            }
        }, 1);
    }

    @api
    renderValue(color) {
        if (this.colorValue !== color) {
            this.value = color;
            this.colors = generateColors(this.value);

            if (this.opacity) {
                this.setOpacityColor(this.colors.H);
            }

            this.setPaletteColor(this.colors.H);
            this.setSwatchColor(this.value);
            this.setindIcatorPosition();
        }
    }

    get disabledInput() {
        return this.disabled || this.readOnly;
    }

    get colorValue() {
        return this.colors.A < 1 && this.opacity
            ? this.colors.hexa
            : this.colors.hex;
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

    dispatchChange() {
        if (!this.disabled && !this.readOnly) {
            this.dispatchEvent(
                new CustomEvent('change', {
                    bubbles: true,
                    cancelable: true,
                    detail: {
                        hex: this.colors.hex,
                        hexa: this.colors.hexa,
                        rgb: this.colors.rgb,
                        rgba: this.colors.rgba,
                        alpha: this.colors.A
                    }
                })
            );
        }
    }

    handlerInput(event) {
        if (!this.readOnly) {
            let H = event.target.value;

            this.setPaletteColor(H);

            if (this.opacity) {
                this.setOpacityColor(H);

                let color = `hsla(${H}, ${this.colors.S}%, ${this.colors.L}%, ${this.colors.A})`;

                if (colorType(color) === null) {
                    color = `hsla(${H}, ${this.colors.S}%, ${this.colors.L}%, 1)`;
                }

                this.colors = generateColors(color);
            } else {
                this.colors = generateColors(
                    `hsl(${H}, ${this.colors.S}%, ${this.colors.L}%)`
                );
            }

            this.colors.H = H;

            this.setSwatchColor(this.colors.hexa);
            this.hideErrors();
            this.dispatchChange();
        }
    }

    handlerInputOpacity(event) {
        if (!this.readOnly) {
            let alpha = event.target.value;

            this.colors = generateColors(
                `hsla(${this.colors.H}, ${this.colors.S}%, ${this.colors.L}%, ${alpha})`
            );

            this.setSwatchColor(this.colors.hexa);
            this.hideErrors();
            this.dispatchChange();
        }
    }

    handleInputColor(event) {
        let color = event.target.value;

        if (this.colors.A < 1 && this.opacity) {
            this.colors.hexa = color;
        } else {
            this.colors.hex = color;
        }

        if (
            colorType(color) === 'hex' ||
            (colorType(color) === 'hexa' && this.opacity)
        ) {
            this.hideErrors();
            this.updateColors(color);
        } else {
            this.showError = true;
            this.template
                .querySelector('.slds-color-picker__input-custom-hex')
                .classList.add('slds-has-error');
        }
    }

    handleInputRed(event) {
        this.colors.R = event.target.value;
        this.processingRGBColor(event);
    }

    handleInputGreen(event) {
        this.colors.G = event.target.value;
        this.processingRGBColor(event);
    }

    handleInputBlue(event) {
        this.colors.B = event.target.value;
        this.processingRGBColor(event);
    }

    handleInputAlpha(event) {
        this.colors.A = event.target.value;
        this.processingRGBColor(event);
    }

    processingRGBColor(event) {
        let color = `rgba(${this.colors.R},${this.colors.G},${this.colors.B},${this.colors.A})`;

        if (colorType(color) !== null) {
            this.hideErrors();
            this.updateColors(color);
        } else {
            this.showError = true;
            event.target.parentElement.parentElement.classList.add(
                'slds-has-error'
            );
        }
    }

    handlerClickPalet(event) {
        if (
            event.target.className !== 'slds-color-picker__range-indicator' &&
            !this.disabled &&
            !this.readOnly
        ) {
            let indicator = this.template.querySelector(
                '.slds-color-picker__range-indicator'
            );

            indicator.style.top = `${event.offsetY - indicatorSize}px`;
            indicator.style.left = `${event.offsetX}px`;

            this.setColor(event.offsetX, event.offsetY - indicatorSize);
        }
    }

    handlerMouseDown(event) {
        this.down = true;
        this.data = {
            x: event.x,
            y: event.y,
            top: event.target.offsetTop,
            left: event.target.offsetLeft,
            width: this.paletteWidth,
            height: this.paletteHeight - indicatorSize
        };
    }

    handlerMouseUp() {
        this.down = false;
    }

    handlerMouseMove(event) {
        if (this.down && !this.readOnly) {
            let indicator = this.template.querySelector(
                '.slds-color-picker__range-indicator'
            );

            let delta = {
                x: this.data.left + event.clientX - this.data.x,
                y: this.data.top + event.clientY - this.data.y
            };

            if (delta.x < this.data.width) {
                if (delta.x < 0) {
                    indicator.style.left = '0px';
                    delta.x = 0;
                } else {
                    indicator.style.left = `${delta.x}px`;
                }
            } else {
                indicator.style.left = `${this.data.width}px`;
                delta.x = this.data.width;
            }

            if (delta.y < this.data.height) {
                if (delta.y < -indicatorSize) {
                    indicator.style.top = `-${indicatorSize}px`;
                    delta.y = -indicatorSize;
                } else {
                    indicator.style.top = `${delta.y}px`;
                }
            } else {
                indicator.style.top = `${this.data.height}px`;
                delta.y = this.data.height;
            }

            this.setColor(delta.x, delta.y);
        }
    }

    setColor(x, y) {
        let s = x / this.paletteWidth;
        let v = 1 - y / this.paletteHeight;
        let hsl = HSVToHSL(this.colors.H, s, v);

        let saturation = Math.round(hsl.S * 100);
        let lightness = Math.round(hsl.L * 100);

        if (saturation < 0) {
            saturation = 0;
        } else if (saturation > 100) {
            saturation = 100;
        }

        if (lightness < 0) {
            lightness = 0;
        } else if (lightness > 100) {
            lightness = 100;
        }

        if (this.opacity) {
            let color = `hsla(${this.colors.H}, ${saturation}%, ${lightness}%, ${this.colors.A})`;

            if (colorType(color) === null) {
                color = `hsla(${this.colors.H}, ${saturation}%, ${lightness}%, 1)`;
            }

            let colors = generateColors(color);

            if (colors.H !== this.colors.H) {
                colors.H = this.colors.H;
            }

            this.colors = colors;
        } else {
            this.colors = generateColors(
                `hsl(${this.colors.H}, ${saturation}%, ${lightness}%)`
            );
        }

        this.positionX = x;
        this.positionY = y;

        this.hideErrors();
        this.setSwatchColor(this.colors.hexa);
        this.dispatchChange();
    }

    updateColors(color) {
        this.colors = generateColors(color);

        if (this.opacity) {
            this.setOpacityColor(this.colors.H);
        }

        this.setPaletteColor(this.colors.H);
        this.setSwatchColor(this.colors.hexa);
        this.setindIcatorPosition();
        this.dispatchChange();
    }

    setindIcatorPosition() {
        let x = this.paletteWidth * this.colors.hsv.s;
        let y = this.paletteHeight * (1 - this.colors.hsv.v);

        if (!this.disabled) {
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => {
                let indicator = this.template.querySelector(
                    '.slds-color-picker__range-indicator'
                );

                if (indicator) {
                    indicator.style.top = `${y}px`;
                    indicator.style.left = `${x}px`;
                }
            }, 1);
        }

        this.positionX = x;
        this.positionY = y;
    }

    setPaletteColor(value) {
        let color = this.disabled ? '#ecebea' : `hsl(${value}, 100%, 50%)`;

        this.template.querySelector(
            '.slds-color-picker__custom-range'
        ).style.background = color;
    }

    setSwatchColor(value) {
        let color = this.disabled ? '#ecebea' : value;
        this.template.querySelector('.slds-swatch').style.background = color;
    }

    setOpacityColor(value) {
        let opacity = this.template.querySelector('.avonni-opacity-input');

        opacity.style.backgroundImage = this.disabled
            ? 'none'
            : `linear-gradient(to right, hsla(0,100%,50%, 0), hsla(${value},100%,50%,1))`;
    }

    hideErrors() {
        this.showError = false;

        this.template
            .querySelector('.slds-color-picker__input-custom-hex')
            .classList.remove('slds-has-error');

        [...this.template.querySelectorAll('.avonni-color-input')].forEach(
            element => {
                element.classList.remove('slds-has-error');
            }
        );
    }
}
