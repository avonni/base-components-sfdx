import { LightningElement, api } from 'lwc';
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';

const validVariants = ['bottom-toolbar', 'top-toolbar'];
const validModes = ['draw', 'erase'];

export default class AvonniInputPen extends LightningElement {
    @api fieldLevelHelp;
    @api label;
    @api disabledButtons = [];

    _value;
    _color = '#000';
    _size = 2;
    _variant = 'bottom-toolbar';
    _mode = 'draw';
    _disabled = false;
    _readOnly = false;
    _required = false;
    _hideControls = false;
    _invalid = false;

    sizeList;
    init = false;

    isDownFlag;
    isDotFlag = false;
    prevX = 0;
    currX = 0;
    prevY = 0;
    currY = 0;

    canvasElement;
    ctx;
    cursor;

    connectedCallback() {
        this.sizeList = [...Array(100).keys()].slice(1).map(x => {
            return { label: `${x}px`, value: x };
        });

        this.onMouseUp = this.handleMouseUp.bind(this);
        this.onMouseMove = this.handleMouseMove.bind(this);

        window.addEventListener('mouseup', this.onMouseUp);
        window.addEventListener('mousemove', this.onMouseMove);
    }

    disconnectedCallback() {
        window.removeEventListener('mouseup', this.onMouseUp);
        window.removeEventListener('mousemove', this.onMouseMove);
    }

    renderedCallback() {
        if (!this.init) {
            this.canvasElement = this.template.querySelector('canvas');
            this.ctx = this.canvasElement.getContext('2d');

            if (this.value) {
                this.initSrc();
            }

            this.canvasElement.width = this.canvasElement.parentElement.offsetWidth;
            this.canvasElement.height =
                this.canvasElement.parentElement.offsetWidth / 2;

            this.initCusrsorStyles();

            if (!this.hideControls && this.showSize) {
                let srcElement = this.template.querySelector(
                    '.avonni-combobox'
                );
                const style = document.createElement('style');
                style.innerText =
                    '.avonni-combobox .slds-dropdown_fluid {min-width: 100px;}';
                srcElement.appendChild(style);
            }

            if (this.variant === 'bottom-toolbar') {
                this.classList.add('avonni-reverse');
            } else {
                this.classList.remove('avonni-reverse');
            }

            this.init = true;
        }
    }

    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;

        if (this.ctx) {
            this.initSrc();
        }
    }

    @api
    get color() {
        return this._color;
    }

    set color(value) {
        this._color = value;
        this.initCusrsorStyles();
    }

    @api
    get size() {
        return this._size;
    }

    set size(value) {
        this._size = Number(value);
        this.initCusrsorStyles();
    }

    @api get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: 'bottom-toolbar',
            validValues: validVariants
        });

        if (this._variant === 'bottom-toolbar') {
            this.classList.add('avonni-reverse');
        } else {
            this.classList.remove('avonni-reverse');
        }
    }

    @api get mode() {
        return this._mode;
    }

    set mode(value) {
        this._mode = normalizeString(value, {
            fallbackValue: 'draw',
            validValues: validModes
        });
        this.initCusrsorStyles();
    }

    @api get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);

        if (this._disabled) {
            this.classList.add('avonni-disabled');
        }
    }

    @api get readOnly() {
        return this._readOnly;
    }

    set readOnly(value) {
        this._readOnly = normalizeBoolean(value);

        if (this._readOnly) {
            this.classList.add('avonni-disabled');
        }
    }

    @api get required() {
        return this._required;
    }

    set required(value) {
        this._required = normalizeBoolean(value);
    }

    @api get hideControls() {
        if (
            !this.showPen &&
            !this.showErase &&
            !this.showClear &&
            !this.showSize &&
            !this.showColor
        ) {
            return true;
        }

        return this._hideControls;
    }

    set hideControls(value) {
        this._hideControls = normalizeBoolean(value);
    }

    @api get invalid() {
        return this._invalid;
    }

    set invalid(value) {
        this._invalid = normalizeBoolean(value);
    }

    get showPen() {
        return this.disabledButtons.indexOf('pen') === -1;
    }

    get showErase() {
        return this.disabledButtons.indexOf('eraser') === -1;
    }

    get showClear() {
        return this.disabledButtons.indexOf('clear') === -1;
    }

    get showSize() {
        return this.disabledButtons.indexOf('size') === -1;
    }

    get showColor() {
        return this.disabledButtons.indexOf('color') === -1;
    }

    @api
    clear() {
        if (!this.readOnly) {
            this.ctx.clearRect(
                0,
                0,
                this.canvasElement.width,
                this.canvasElement.height
            );
            this.setDraw();
            this.handleChangeEvent();
        }
    }

    @api
    setMode(modeName) {
        this._mode = normalizeString(modeName, {
            fallbackValue: this._mode,
            validValues: validModes
        });
    }

    initSrc() {
        this.clear();
        this.invalid = false;
        this.template
            .querySelector('.slds-form-element')
            .classList.remove('slds-has-error');
        this.template
            .querySelector('.slds-rich-text-editor')
            .classList.remove('slds-has-error');

        if (this.value.indexOf('data:image/') === 0) {
            let img = new Image();
            img.onload = function() {
                this.ctx.drawImage(img, 0, 0);
            }.bind(this);
            img.src = this.value;
        } else if (this.value) {
            this.invalid = true;
            this.template
                .querySelector('.slds-form-element')
                .classList.add('slds-has-error');
            this.template
                .querySelector('.slds-rich-text-editor')
                .classList.add('slds-has-error');
        }
    }

    initCusrsorStyles() {
        this.cursor = this.template.querySelector('.avonni-cursor');

        if (this.cursor) {
            this.cursor.style.setProperty('--size', this.size);
            this.cursor.style.setProperty(
                '--color',
                this.mode === 'draw' ? this.color : '#ffffff'
            );
        }
    }

    setDraw() {
        this.setMode('draw');
        if (this.cursor) {
            this.cursor.style.setProperty('--color', this.color);
        }
    }

    setErase() {
        this.setMode('erase');
        if (this.cursor) {
            this.cursor.style.setProperty('--color', '#ffffff');
        }
    }

    handleColorChange(event) {
        this.color = event.detail.hex;
        if (this.cursor) {
            this.cursor.style.setProperty('--color', this.color);
        }
        this.setDraw();
    }

    handleSizeChange(event) {
        this.size = Number(event.detail.value);
        if (this.cursor) {
            this.cursor.style.setProperty('--size', this.size);
        }
    }

    handleMouseMove(event) {
        this.searchCoordinatesForEvent('move', event);
    }

    handleMouseDown(event) {
        this.searchCoordinatesForEvent('down', event);
    }

    handleMouseUp(event) {
        this.searchCoordinatesForEvent('up', event);
    }

    handleMouseEnter(event) {
        if (!this.disabled && !this.readOnly) {
            this.cursor.style.opacity = 1;
            this.searchCoordinatesForEvent('enter', event);
        }
    }

    handleMouseLeave() {
        this.cursor.style.opacity = 0;
    }

    searchCoordinatesForEvent(requestedEvent, event) {
        if (!this.disabled && !this.readOnly) {
            if (requestedEvent === 'down') {
                this.setupCoordinate(event);

                this.isDownFlag = true;
                this.isDotFlag = true;

                if (this.isDotFlag) {
                    this.drawDot();
                    this.isDotFlag = false;
                }

                if (this.invalid) {
                    this.template
                        .querySelector('.slds-form-element')
                        .classList.remove('slds-has-error');
                    this.template
                        .querySelector('.slds-rich-text-editor')
                        .classList.remove('slds-has-error');

                    this._invalid = false;
                }
            }
            if (requestedEvent === 'up') {
                if (this.isDownFlag) {
                    this.handleChangeEvent();
                }

                this.isDownFlag = false;
            }

            if (requestedEvent === 'enter' && this.isDownFlag) {
                this.drawDot();
            }

            if (requestedEvent === 'move') {
                if (this.isDownFlag) {
                    this.setupCoordinate(event);
                    this.redraw();
                }

                this.moveCursor(event);
            }
        }
    }

    moveCursor(event) {
        const clientRect = this.canvasElement.getBoundingClientRect();
        let left = event.clientX - clientRect.left - this.size / 2;
        let top = event.clientY - clientRect.top - this.size / 2;

        this.cursor.style.left = `${left}px`;
        this.cursor.style.top = `${top}px`;
    }

    setupCoordinate(eventParam) {
        const clientRect = this.canvasElement.getBoundingClientRect();
        this.prevX = this.currX;
        this.prevY = this.currY;
        this.currX = eventParam.clientX - clientRect.left;
        this.currY = eventParam.clientY - clientRect.top;
    }

    redraw() {
        this.ctx.beginPath();
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.moveTo(this.prevX, this.prevY);
        this.ctx.lineTo(this.currX, this.currY);
        this.ctx.strokeStyle = this.mode === 'draw' ? this.color : '#ffffff';
        this.ctx.lineWidth = this.size;
        this.ctx.closePath();
        this.ctx.stroke();
    }

    drawDot() {
        this.ctx.beginPath();
        this.ctx.arc(
            this.currX,
            this.currY,
            this.size / 2,
            0,
            2 * Math.PI,
            false
        );
        this.ctx.fillStyle = this.mode === 'draw' ? this.color : '#ffffff';
        this.ctx.fill();
        this.ctx.closePath();
    }

    handleChangeEvent() {
        var dataURL = this.canvasElement.toDataURL();

        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    dataURL
                }
            })
        );
    }
}
