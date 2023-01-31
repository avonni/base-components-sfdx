// /**
//  * BSD 3-Clause License
//  *
//  * Copyright (c) 2021, Avonni Labs, Inc.
//  * All rights reserved.
//  *
//  * Redistribution and use in source and binary forms, with or without
//  * modification, are permitted provided that the following conditions are met:
//  *
//  * - Redistributions of source code must retain the above copyright notice, this
//  *   list of conditions and the following disclaimer.
//  *
//  * - Redistributions in binary form must reproduce the above copyright notice,
//  *   this list of conditions and the following disclaimer in the documentation
//  *   and/or other materials provided with the distribution.
//  *
//  * - Neither the name of the copyright holder nor the names of its
//  *   contributors may be used to endorse or promote products derived from
//  *   this software without specific prior written permission.
//  *
//  * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
//  * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
//  * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
//  * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
//  * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
//  * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
//  * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
//  * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
//  * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
//  * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//  */

import { LightningElement, api } from 'lwc';
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';
import BwipJs from '@salesforce/resourceUrl/BwipJs';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript } from 'lightning/platformResourceLoader'
import { classSet } from 'c/utils';

const BARCODE_TYPES = [
    'auspost',
    'azteccode',
    'azteccodecompact',
    'aztecrune',
    'bc412',
    'channelcode',
    'codablockf',
    'code11',
    'code128',
    'code16k',
    'code2of5',
    'code32',
    'code39',
    'code39ext',
    'code49',
    'code93',
    'code93ext',
    'codeone',
    'coop2of5',
    'daft',
    'databarexpanded',
    'databarexpandedcomposite',
    'databarexpandedstacked',
    'databarexpandedstackedcomposite',
    'databarlimited',
    'databarlimitedcomposite',
    'databaromni',
    'databaromnicomposite',
    'databarstacked',
    'databarstackedcomposite',
    'databarstackedomni',
    'databarstackedomnicomposite',
    'databartruncated',
    'databartruncatedcomposite',
    'datalogic2of5',
    'datamatrix',
    'datamatrixrectangular',
    'datamatrixrectangularextension',
    'dotcode',
    'ean13',
    'ean13composite',
    'ean14',
    'ean2',
    'ean5',
    'ean8',
    'ean8composite',
    'flattermarken',
    'gs1-128',
    'gs1-128composite',
    'gs1-cc',
    'gs1datamatrix',
    'gs1datamatrixrectangular',
    'gs1dotcode',
    'gs1northamericancoupon',
    'gs1qrcode',
    'hanxin',
    'hibcazteccode',
    'hibccodablockf',
    'hibccode128',
    'hibccode39',
    'hibcdatamatrix',
    'hibcdatamatrixrectangular',
    'hibcmicropdf417',
    'hibcpdf417',
    'hibcqrcode',
    'iata2of5',
    'identcode',
    'industrial2of5',
    'interleaved2of5',
    'isbn',
    'ismn',
    'issn',
    'itf14',
    'japanpost',
    'kix',
    'leitcode',
    'matrix2of5',
    'maxicode',
    'micropdf417',
    'microqrcode',
    'msi',
    'onecode',
    'pdf417',
    'pdf417compact',
    'pharmacode',
    'pharmacode2',
    'planet',
    'plessey',
    'posicode',
    'postnet',
    'pzn',
    'qrcode',
    'rationalizedCodabar',
    'raw',
    'rectangularmicroqrcode',
    'royalmail',
    'sscc18',
    'symbol',
    'telepen',
    'telepennumeric',
    'ultracode',
    'upca',
    'upcacomposite',
    'upce',
    'upcecomposite'
];
const DEFAULT_BACKGROUND = '#ffffff';
const DEFAULT_COLOR = '#000000';
const DEFAULT_TEXT_COLOR = '#000000';
const TEXT_ALIGNMENT = {
    valid: [
        'top-left',
        'top-center',
        'top-right',
        'top-justify',
        'center-left',
        'center-center',
        'center-right',
        'center-justify',
        'bottom-left',
        'bottom-center',
        'bottom-right',
        'bottom-justify'
    ],
    default: 'bottom-center'
};
const TEXT_X_ALIGN = {
    valid: ['left', 'center', 'right', 'justify'],
    default: 'center'
};
const TEXT_Y_ALIGN = {
    valid: ['below', 'center', 'above'],
    default: 'below'
};

/**
 * @class
 * @name Barcode
 * @descriptor avonni-barcode
 * @description The barcode component provides a builder to create different types of barcodes.
 * @storyId example-barcode--code-11
 * @public
 */
export default class AvonniBarcode extends LightningElement {
	_bwipjsLoaded = false;
    _background = DEFAULT_BACKGROUND;
    _color = DEFAULT_COLOR;
    _textColor = DEFAULT_TEXT_COLOR;
    _checksum = false;
    _errorMessage;
    _hideValue = false;
    _textAlignment = TEXT_ALIGNMENT.default;
    _type;
    _width = '100%';
    _height;

    textXAlign = 'center';
    textYAlign = 'below';
    validCode = true;
    initialRender = true;

    connectedCallback() {
		Promise.all([loadScript(this, BwipJs)])
		.then(() => {
			this._bwipjsLoaded = true; 
			if (this._bwipjsLoaded) {
			this.renderBarcode();
		}
	
		})
		 .catch((error) => { 
			this.dispatchEvent( 
				new ShowToastEvent({ 
					 title: 'Error loading bwipjs',
					 message: error.message,
					 variant: 'error' 
				 }) 
			); 
		});
	}

	renderedCallback() {
        if (this._bwipjsLoaded) {
			this.renderBarcode();
		}
	
        this.initialRender = false;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */
    /**
     * The background color as a hexadecimal color value. Defaults to #ffffff.
     *
     * @public
     * @type {string}
     * @default #ffffff
     */
    @api
    get background() {
        return this._background;
    }
    set background(value) {
        this._background = normalizeString(value);
        this.rerenderBarcode();
    }

    /**
     * Set to true to show the checksum value.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get checksum() {
        return this._checksum;
    }
    set checksum(value) {
        this._checksum = normalizeBoolean(value);
        this.rerenderBarcode();
    }

    /**
     * The barcode color as a hexadecimal color value. Defaults to #000000.
     *
     * @public
     * @type {string}
     * @default #000000
     */
    @api
    get color() {
        return this._color;
    }
    set color(value) {
        this._color = normalizeString(value);
        this.rerenderBarcode();
    }

    /**
     * The maximum height of the barcode. The value accepts length values of any units. Unitless numbers are converted to pixels. By default the height depends on the width.
     *
     * @public
     * @type {string|number}
     */
    @api
    get height() {
        return this._height;
    }
    set height(value) {
        this._height = this.normalizeDimension(value, '');
        this.setCanvasStyle();
    }

    /**
     * If present, hide the value of the barcode.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get hideValue() {
        return this._hideValue;
    }
    set hideValue(value) {
        this._hideValue = normalizeBoolean(value);
        this.rerenderBarcode();
    }

    /**
     * The text color as a hexadecimal color value.
     *
     * @public
     * @type {string}
     * @default #000000
     */
    @api
    get textColor() {
        return this._textColor;
    }
    set textColor(value) {
        this._textColor = normalizeString(value);
        this.rerenderBarcode();
    }

    /**
     * The position of the displayed value. Accepted values are top-left, top-center, top-right, top-justify, center-left, center-center, center-right, center-justify, bottom-left, bottom-center, bottom-right, bottom-justify.
     *
     * @public
     * @type {string}
     * @default bottom-center
     */
    @api
    get textAlignment() {
        return this._textAlignment;
    }
    set textAlignment(value) {
        this._textAlignment = normalizeString(value, {
            fallbackValue: TEXT_ALIGNMENT.default,
            valid: TEXT_ALIGNMENT.valid
        });

        const replace1 = this._textAlignment.replace('bottom', 'below');
        const replace2 = replace1.replace('top', 'above');
        const outputAlignment = replace2.split('-');
        this.textXAlign = normalizeString(outputAlignment[1], {
            validValues: TEXT_X_ALIGN.valid,
            fallbackValue: TEXT_X_ALIGN.default
        });
        this.textYAlign = normalizeString(outputAlignment[0], {
            validValues: TEXT_Y_ALIGN.valid,
            fallbackValue: TEXT_Y_ALIGN.default
        });
        this.rerenderBarcode();
    }

    /**
     * The type of barcode created. The supported types are listed below.
     *
     * @public
     * @type {string}
     */
    @api
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = normalizeString(value, {
            validValues: BARCODE_TYPES,
            toLowerCase: false
        });
        this.rerenderBarcode();
    }

    /**
     * The value to encode in the barcode.
     *
     * @public
     * @type {string | number}
     */
    @api
    get value() {
        return this._value;
    }
    set value(codeValue) {
        this._value = normalizeString(codeValue, { toLowerCase: false });
        this.rerenderBarcode();
    }

    /**
     * The maximum width of the barcode. The value accepts length values of any units. Unitless numbers are converted to pixels. Defaults to 100%.
     *
     * @public
     * @type {string|number}
     * @default 100%
     */
    @api
    get width() {
        return this._width;
    }
    set width(value) {
        this._width = this.normalizeDimension(value, '100%');
        this.setCanvasStyle();
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    get canvas() {
        return this.template.querySelector(
            '[data-element-id="avonni-barcode-canvas"]'
        );
    }

    get computedCanvasClass() {
        return classSet('slds-text-align_center').add({
            'slds-hide': !this.validCode
        });
    }

    get errorMessage() {
        return `Error: ${this._errorMessage}`;
    }

    /*
     * ------------------------------------------------------------
     * PRIVATE METHODS
     * ------------------------------------------------------------
     */

    /**
     * Set the bwip-js parameters depending on the type of barcode.
     */
    barcodeParameters() {
        const params = {
            bcid: this.type,
            text: this.value,
            includetext: !this.hideValue,
            includecheck: this.checksum,
            includecheckintext: this.checksum,
            textxalign: this.textXAlign,
            textyalign: this.textYAlign,
            barcolor: this.colorHexCode(this.color),
            backgroundcolor: this.colorHexCode(this.background),
            textcolor: this.colorHexCode(this.textColor),
            scale: 10
        };

        if (this.type === 'gs1-cc') {
            params.ccversion = 'b';
            params.cccolumns = 4;
        }

        if (this.type === 'gs1northamericancoupon') {
            params.segments = 8;
        }

        if (this.type === 'rectangularmicroqrcode') {
            params.version = 'R17x139';
        }

        return params;
    }

    /**
     * Returns the numeric value from a HEX value, ex: #000000 returns 000000.
     *
     * @returns {string} color value
     */
    colorHexCode(color) {
        return color.replace('#', '');
    }

    /**
     * Normalize values for height and width.
     */
    normalizeDimension(value, defaultValue) {
        let normalizedValue;
        if (value === undefined || value === null || value === '') {
            normalizedValue = defaultValue;
        } else if (!isNaN(value)) {
            normalizedValue = `${value}px`;
        } else {
            normalizedValue = value;
        }
        return normalizedValue;
    }

    parseErrorMessage(message) {
        let errorMessage = message.replace(/bwipp.|bwip-js: /gi, '');
        errorMessage = errorMessage.replace(' bcid ', ' type ');
        return errorMessage;
    }

    /**
     * Render the barcode.
     */
    renderBarcode() {
        this.setCanvasStyle();
        try {
            bwipjs.toCanvas(this.canvas, this.barcodeParameters());
            this._errorMessage = null;
            this.validCode = true;
        } catch (e) {
            if (e.message) {
                this._errorMessage = this.parseErrorMessage(e.message);
            } else if (this._errorMessage == null) {
                this._errorMessage =
                    'This barcode type does not support this value.';
            }
            this.validCode = false;
        }
    }

    rerenderBarcode() {
        if (!this.initialRender) {
            if (this._bwipjsLoaded) {
			this.renderBarcode();
		}
	
        }
    }

    /**
     * Set the canvas style.
     */
    setCanvasStyle() {
        if (this.canvas) {
            this.canvas.style.width = this.width;
            this.canvas.style.maxHeight = this.height;
        }
    }
}
