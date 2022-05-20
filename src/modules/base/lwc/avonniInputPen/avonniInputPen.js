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
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';

const TOOLBAR_VARIANTS = {
    valid: ['bottom-toolbar', 'top-toolbar'],
    default: 'bottom-toolbar'
};
const PEN_MODES = { valid: ['draw', 'erase'], default: 'draw' };

const DEFAULT_COLOR = '#000';
const DEFAULT_SIZE = 2;

/**
 * @class
 * @descriptor avonni-input-pen
 * @storyId example-input-pen--base
 * @public
 */
export default class AvonniInputPen extends LightningElement {
    /**
     * Array of buttons to remove from the toolbar. Values include pen, eraser, clear, size, color
     *
     * @type {string[]}
     * @public
     */
    @api disabledButtons = [];
    /**
     * Help text detailing the purpose and function of the input.
     *
     * @type {string}
     * @public
     */
    @api fieldLevelHelp;
    /**
     * Text label for the input.
     *
     * @type {string}
     * @public
     */
    @api label;

    _color = DEFAULT_COLOR;
    _disabled = false;
    _hideControls = false;
    _invalid = false;
    _mode = PEN_MODES.default;
    _readOnly = false;
    _required = false;
    _size = DEFAULT_SIZE;
    _value;
    _variant = TOOLBAR_VARIANTS.default;

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
        this.sizeList = [...Array(100).keys()].slice(1).map((x) => {
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
            this.canvasElement = this.template.querySelector(
                '[data-element-id="canvas"]'
            );
            this.ctx = this.canvasElement.getContext('2d');

            if (this.value) {
                this.initSrc();
            }

            this.canvasElement.width =
                this.canvasElement.parentElement.offsetWidth;
            this.canvasElement.height =
                this.canvasElement.parentElement.offsetWidth / 2;

            this.initCursorStyles();

            if (!this.hideControls && this.showSize) {
                let srcElement = this.template.querySelector(
                    '.avonni-input-pen__combobox'
                );
                const style = document.createElement('style');
                style.innerText =
                    '.avonni-input-pen__combobox .slds-dropdown_fluid {min-width: 100px;}';
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

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Color of the pen.
     *
     * @type {string}
     * @public
     * @default #000
     */
    @api
    get color() {
        return this._color;
    }

    set color(value) {
        this._color = value;
        this.initCursorStyles();
    }

    /**
     * If present, the input field is disabled and users cannot interact with it.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);

        if (this._disabled) {
            this.classList.add('avonni-disabled');
        }
    }

    /**
     * If present, hide the control bar.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get hideControls() {
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

    /**
     * If true, the editor is considered invalid.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get invalid() {
        return this._invalid;
    }

    set invalid(value) {
        this._invalid = normalizeBoolean(value);
    }

    /**
     * Valid modes include draw and erase.
     *
     * @type {string}
     * @public
     * @default draw
     */
    @api
    get mode() {
        return this._mode;
    }

    set mode(value) {
        this._mode = normalizeString(value, {
            fallbackValue: PEN_MODES.default,
            validValues: PEN_MODES.valid
        });
        this.initCursorStyles();
    }

    /**
     * If present, the input field is read-only and cannot be edited by users.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get readOnly() {
        return this._readOnly;
    }

    set readOnly(value) {
        this._readOnly = normalizeBoolean(value);

        if (this._readOnly) {
            this.classList.add('avonni-disabled');
        }
    }

    /**
     * If present, the input field must be filled out before the form is submitted.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get required() {
        return this._required;
    }

    set required(value) {
        this._required = normalizeBoolean(value);
    }

    /**
     * Size of the pen.
     *
     * @type {string}
     * @public
     * @default 2
     */
    @api
    get size() {
        return this._size;
    }

    set size(value) {
        this._size = Number(value);
        this.initCursorStyles();
    }

    /**
     * dataUrl like 'data:image/png;base64, …'
     *
     * @type {string}
     * @public
     */
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

    /**
     * The variant changes the appearance of the toolbar. Accepted variant is bottom-toolbar and top-toolbar which causes the toolbar to be displayed below the box.
     *
     * @type {string}
     * @public
     * @default bottom-toolbar
     */
    @api
    get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: TOOLBAR_VARIANTS.default,
            validValues: TOOLBAR_VARIANTS.valid
        });

        if (this._variant === 'bottom-toolbar') {
            this.classList.add('avonni-reverse');
        } else {
            this.classList.remove('avonni-reverse');
        }
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Check if Pen is shown.
     *
     * @type {boolean}
     */
    get showPen() {
        return (
            !this.disabledButtons || this.disabledButtons.indexOf('pen') === -1
        );
    }

    /**
     * Check if Eraser is shown.
     */
    get showErase() {
        return (
            !this.disabledButtons ||
            this.disabledButtons.indexOf('eraser') === -1
        );
    }

    /**
     * Check if Clear is shown.
     *
     * @type {boolean}
     */
    get showClear() {
        return (
            !this.disabledButtons ||
            this.disabledButtons.indexOf('clear') === -1
        );
    }

    /**
     * Check if Size is shown.
     *
     * @type {boolean}
     */
    get showSize() {
        return (
            !this.disabledButtons || this.disabledButtons.indexOf('size') === -1
        );
    }

    /**
     * Check if Color is shown.
     *
     * @type {boolean}
     */
    get showColor() {
        return (
            !this.disabledButtons ||
            this.disabledButtons.indexOf('color') === -1
        );
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Clear the canvas.
     *
     * @public
     */
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

    /**
     * Set the drawing mode. Valid modes include draw and erase.
     *
     * @param {string} modeName
     * @public
     */
    @api
    setMode(modeName) {
        this._mode = normalizeString(modeName, {
            fallbackValue: this._mode,
            validValues: PEN_MODES.valid
        });
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Initialize the Image canvas and dom elements.
     */
    initSrc() {
        this.clear();
        this._invalid = false;
        this.template
            .querySelector('.slds-form-element')
            .classList.remove('slds-has-error');
        this.template
            .querySelector('.slds-rich-text-editor')
            .classList.remove('slds-has-error');

        if (this.value && this.value.indexOf('data:image/') === 0) {
            let img = new Image();
            img.onload = function () {
                this.ctx.drawImage(img, 0, 0);
            }.bind(this);
            img.src = this.value;
        } else if (this.value) {
            this._invalid = true;
            this.template
                .querySelector('.slds-form-element')
                .classList.add('slds-has-error');
            this.template
                .querySelector('.slds-rich-text-editor')
                .classList.add('slds-has-error');
        }
    }

    /**
     * Initialize Cursor styling.
     */
    initCursorStyles() {
        this.cursor = this.template.querySelector(
            '[data-element-id="input-pen-cursor"]'
        );

        if (this.cursor) {
            this.cursor.style.setProperty('--size', this.size);
            this.cursor.style.setProperty(
                '--color',
                this.mode === 'draw' ? this.color : '#ffffff'
            );
        }
    }

    /**
     * Set the Mode to Draw.
     */
    setDraw() {
        this.setMode('draw');
        if (this.cursor) {
            this.cursor.style.setProperty('--color', this.color);
        }
    }

    /**
     * Set the Mode to Erase.
     */
    setErase() {
        this.setMode('erase');
        if (this.cursor) {
            this.cursor.style.setProperty('--color', '#ffffff');
        }
    }

    /**
     * Color change handler.
     *
     * @param {Event} event
     */
    handleColorChange(event) {
        this._color = event.detail.hex;
        if (this.cursor) {
            this.cursor.style.setProperty('--color', this.color);
        }
        this.setDraw();
    }

    /**
     * Size change handler. Change cursor size.
     *
     * @param {Event} event
     */
    handleSizeChange(event) {
        this._size = Number(event.detail.value);
        if (this.cursor) {
            this.cursor.style.setProperty('--size', this.size);
        }
    }

    /**
     * Mouse move handler. Search canvas coordinates on event trigger.
     *
     * @param {Event} event
     */
    handleMouseMove(event) {
        this.searchCoordinatesForEvent('move', event);
    }

    /**
     * Mouse down handler. Search canvas coordinates on event trigger.
     *
     * @param {Event} event
     */
    handleMouseDown(event) {
        this.searchCoordinatesForEvent('down', event);
    }

    /**
     * Mouse up handler. Search canvas coordinates on event trigger.
     *
     * @param {Event} event
     */
    handleMouseUp(event) {
        this.searchCoordinatesForEvent('up', event);
    }

    /**
     * Mouse Enter handler. Set opacity to 1. Search canvas coordinates on event trigger.
     *
     * @param {Event} event
     */
    handleMouseEnter(event) {
        if (!this.disabled && !this.readOnly) {
            this.cursor.style.opacity = 1;
            this.searchCoordinatesForEvent('enter', event);
        }
    }

    /**
     * Mouse leave handler. Set opacity to 0.
     */
    handleMouseLeave() {
        this.cursor.style.opacity = 0;
    }

    /**
     * Search the canvas element for coordinates on Event trigger.
     *
     * @param {string} requestedEvent
     * @param {Event} event
     */
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

    /**
     * Get cursor coordinates from Canvas Element on cursor move.
     *
     * @param {Event} event
     */
    moveCursor(event) {
        const clientRect = this.canvasElement.getBoundingClientRect();
        let left = event.clientX - clientRect.left - this.size / 2;
        let top = event.clientY - clientRect.top - this.size / 2;

        this.cursor.style.left = `${left}px`;
        this.cursor.style.top = `${top}px`;
    }

    /**
     * Calculate coordinates for previous X, Y and current X, Y of cursor.
     *
     * @param {Event} eventParam
     */
    setupCoordinate(eventParam) {
        const clientRect = this.canvasElement.getBoundingClientRect();
        this.prevX = this.currX;
        this.prevY = this.currY;
        this.currX = eventParam.clientX - clientRect.left;
        this.currY = eventParam.clientY - clientRect.top;
    }

    /**
     * Redraw Canvas context based on calculated cursor event cycle from previous to current coordinates.
     */
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

    /**
     * Canvas draw dot method.
     */
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

    /**
     * Change event handler.
     */
    handleChangeEvent() {
        var dataURL = this.canvasElement.toDataURL();

        /**
         * The event fired when the value changed.
         *
         * @event
         * @name change
         * @param {string} dataURL Base64 of the drawing.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    dataURL
                }
            })
        );
    }
}
