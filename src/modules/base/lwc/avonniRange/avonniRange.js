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
import { classSet } from 'c/utils';
import { FieldConstraintApiWithProxyInput } from 'c/inputUtils';

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_STEP = 1;

const ICON_SIZES = {
    valid: ['x-small', 'small', 'medium', 'large'],
    default: ''
};
const RATING_TYPES = {
    valid: ['horizontal', 'vertical'],
    default: 'horizontal'
};
const LABEL_VARIANTS = {
    valid: ['standard', 'label-hidden', 'label-inline', 'label-stacked'],
    default: 'standard'
};
const RATING_UNITS = {
    valid: ['decimal', 'currency', 'percent'],
    default: 'decimal'
};

/**
 * @class
 * @descriptor avonni-range
 * @storyId example-range--base
 * @public
 */
export default class AvonniRange extends LightningElement {
    /**
     * Text label to describe the slider. Provide your own label to describe the slider.
     *
     * @type {string}
     * @public
     */
    @api label;
    /**
     * Error message to be displayed when a range overflow is detected.
     *
     * @type {string}
     * @public
     */
    @api messageWhenRangeOverflow;
    /**
     * Error message to be displayed when a range underflow is detected.
     *
     * @type {string}
     * @public
     */
    @api messageWhenRangeUnderflow;
    /**
     * Error message to be displayed when a step mismatch is detected.
     *
     * @type {string}
     * @public
     */
    @api messageWhenStepMismatch;
    /**
     * Error message to be displayed when the value is missing.
     *
     * @type {string}
     * @public
     */
    @api messageWhenValueMissing;
    /**
     * Error message to be displayed when the value is too long.
     *
     * @type {string}
     * @public
     */
    @api messageWhenTooLong;
    /**
     * Error message to be displayed when a bad input is detected.
     *
     * @type {string}
     * @public
     */
    @api messageWhenBadInput;
    /**
     * Error message to be displayed when a pattern mismatch is detected.
     *
     * @type {string}
     * @public
     */
    @api messageWhenPatternMismatch;
    /**
     * Error message to be displayed when a type mismatch is detected.
     *
     * @type {string}
     * @public
     */
    @api messageWhenTypeMismatch;
    /**
     * Object containing selected fields for the unit type (currencyCode, currencyDisplayAs, minimumIntegerDigits, minimumFractionDigits, maximumFractionDigits, minimumSignificantDigits, maximumSignificantDigits).
     *
     * @type {object}
     * @public
     * @default
     */
    @api unitAttributes = {};

    _min = DEFAULT_MIN;
    _max = DEFAULT_MAX;
    _step = DEFAULT_STEP;
    _valueLower;
    _valueUpper;
    _size = ICON_SIZES.default;
    _type = RATING_TYPES.default;
    _variant = LABEL_VARIANTS.default;
    _unit = RATING_UNITS.default;
    _pin = false;
    _disabled = false;
    _helpMessage;

    init;

    renderedCallback() {
        if (!this.init) {
            this.initRange();
            this.init = true;
        }
    }

    /**
     * The minimum value of the input range. The default is 0.
     *
     * @type {number}
     * @public
     * @default 0
     */
    @api
    get min() {
        return this._min;
    }

    set min(value) {
        this._min = Number(value);

        if (this.init) {
            this.initRange();
        }
    }

    /**
     * The maximum value of the input range. The default is 100.
     *
     * @type {number}
     * @public
     * @default 100
     */
    @api
    get max() {
        return this._max;
    }

    set max(value) {
        this._max = Number(value);

        if (this.init) {
            this.initRange();
        }
    }

    /**
     * The step increment value of the input range. Example steps include 0.1, 1, or 10. The default is 1.
     *
     * @type {number}
     * @public
     * @default 1
     */
    @api
    get step() {
        return this._step;
    }

    set step(value) {
        this._step = Number(value);

        if (this.init) {
            this.initRange();
        }
    }

    /**
     * The lower value of the range.
     *
     * @type {string}
     * @public
     * @default 0
     */
    @api
    get valueLower() {
        return this._valueLower ? this._valueLower : this.min;
    }

    set valueLower(value) {
        this._valueLower = Number(value);

        if (this.init) {
            this.initRange();
        }
    }

    /**
     * The upper value of the range.
     *
     * @type {string}
     * @public
     */
    @api
    get valueUpper() {
        if (!this._valueUpper) {
            return this.valueLower > this.min
                ? Number(this.valueLower) + Number(this.step)
                : this.min;
        }

        return this._valueUpper;
    }

    set valueUpper(value) {
        this._valueUpper = Number(value);

        if (this.init) {
            this.initRange();
        }
    }

    /**
     * The size of the slider. The default is an empty string, which sets the slider to the width of the viewport. Accepted values are x-small, small, medium, and large.
     *
     * @type {string}
     * @public
     */
    @api get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: ICON_SIZES.default,
            validValues: ICON_SIZES.valid
        });

        if (this.init) {
            this.initRange();
        }
    }

    /**
     * The type determines the orientation of the slider. Accepted values are vertical and horizontal. The default is horizontal.
     *
     * @type {string}
     * @public
     * @default horizontal
     */
    @api get type() {
        return this._type;
    }

    set type(type) {
        this._type = normalizeString(type, {
            fallbackValue: RATING_TYPES.default,
            validValues: RATING_TYPES.valid
        });

        if (this.init) {
            this.initRange();
        }
    }

    /**
     * The variant changes the appearance of the slider. Accepted variants include standard and label-hidden. The default is standard.
     *
     * @type {string}
     * @public
     * @default standard
     */
    @api get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: LABEL_VARIANTS.default,
            validValues: LABEL_VARIANTS.valid
        });

        if (this.init) {
            this.initRange();
        }
    }

    /**
     * Accepted unit include decimal, currency and percent.
     * Format the value displayed (lightning-formatted-number)
     *
     * @type {string}
     * @public
     * @default decimal
     */
    @api get unit() {
        return this._unit;
    }

    set unit(unit) {
        this._unit = normalizeString(unit, {
            fallbackValue: RATING_UNITS.default,
            validValues: RATING_UNITS.valid
        });

        if (this.init) {
            this.initRange();
        }
    }

    /**
     * If present, a pin with integer value is shown when the knob is pressed.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api get pin() {
        return this._pin;
    }

    set pin(value) {
        this._pin = normalizeBoolean(value);

        if (this.init) {
            this.initRange();
        }
    }

    /**
     * If present, the slider is disabled and users cannot interact with it.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);

        if (this.init) {
            this.initRange();
        }
    }

    /**
     * Initialize range cmp.
     */
    initRange() {
        this.showHelpMessageIfInvalid();
        this.setInputsWidth();
        this.addProgressLine();
        this.setBubblesPosition();
    }

    /**
     * Handle left slider point value change.
     *
     * @param {Event} event
     */
    handleChangeLeft(event) {
        this._valueLower = event.target.value;
        this.setInputsWidth();
        this.addProgressLine();
        this.changeRange();
        this.setBubblesPosition();
    }

    /**
     * Handle right slider point value change.
     *
     * @param {Event} event
     */
    handleChangeRight(event) {
        this._valueUpper = event.target.value;
        this.setInputsWidth();
        this.addProgressLine();
        this.changeRange();
        this.setBubblesPosition();
    }

    /**
     * Update range upper and lower values.
     */
    changeRange() {
        this._updateProxyInputLeftAttributes('value');
        this._updateProxyInputRightAttributes('value');

        /**
         * The event fired when the range value changed.
         *
         * @event
         * @name change
         * @param {string} valueLower The lower value of the range.
         * @param {string} valueUpper The upper value of the range.
         * @public
         */
        const selectedEvent = new CustomEvent('change', {
            detail: {
                valueLower: Number(this.valueLower),
                valueUpper: Number(this.valueUpper)
            }
        });

        this.dispatchEvent(selectedEvent);
    }

    /**
     * Computed label class styling.
     *
     * @type {string}
     */
    get computedLabelClass() {
        const classes = classSet();

        classes.add(
            this._variant === 'label-hidden'
                ? 'slds-assistive-text'
                : 'slds-slider-label__label'
        );

        return classes.toString();
    }

    /**
     * Computed container class styling ( size, vertical ).
     *
     * @type {string}
     */
    get computedContainerClass() {
        const { size, type } = this;
        const classes = classSet('');

        if (size) {
            classes.add(`avonni-container_${size}`);
        }

        if (type === 'vertical') {
            classes.add('avonni-vertical');
        }

        return classes.toString();
    }

    /**
     * Computed left bubble class styling.
     *
     * @type {string}
     */
    get computedBubbleLeftClass() {
        return this._type === 'vertical'
            ? 'avonni-bubble-vertical left-bubble'
            : 'avonni-bubble left-bubble';
    }

    /**
     * Computed right bubble class styling.
     *
     * @type {string}
     */
    get computedBubbleRightClass() {
        return this._type === 'vertical'
            ? 'avonni-bubble-vertical right-bubble'
            : 'avonni-bubble right-bubble';
    }

    /**
     * Verify if range is vertical.
     *
     * @type {boolean}
     */
    get isVertical() {
        return this._type === 'vertical';
    }

    /**
     * Calculate the max range from the lower value.
     *
     * @type {number}
     */
    get calculateMax() {
        return (
            Number(this.valueLower) +
            this.stepsCount('left') * this.step
        ).toFixed(3);
    }

    /**
     * Calculate the max range from the lower value.
     *
     * @type {number}
     */
    get calculateMin() {
        let minVaule =
            Number(this.valueUpper) - this.stepsCount('right') * this.step;
        if (minVaule === this.calculateMax) {
            minVaule = minVaule + Number(this.step);
        }

        return minVaule.toFixed(3);
    }

    /**
     * Calculate Steps count from position method.
     *
     * @param {string} position
     * @returns {number} stepsForPosition
     */
    stepsCount(position) {
        let stepCount = (this.valueUpper - this.valueLower) / this.step;
        let stepsForPosition = 0;

        stepsForPosition =
            position === 'left'
                ? Math.floor(stepCount / 2)
                : Math.round(stepCount / 2);

        return stepsForPosition;
    }

    /**
     * Calculate inputs width between left and right inputs.
     */
    setInputsWidth() {
        let inputWidth = this.max - this.min;
        let leftStep = this.stepsCount('left');

        let leftInputWidth =
            ((Number(this.valueLower - this.min) / this.step + leftStep) /
                (inputWidth / this.step)) *
            100;

        let rightInputWidth = 100 - leftInputWidth;

        let leftInput = this.template.querySelector('.inverse-right');

        leftInput.style.width = rightInputWidth + '%';

        let rightInput = this.template.querySelector('.inverse-left');

        rightInput.style.width = leftInputWidth + '%';
    }

    /**
     * Progress indicator line.
     */
    addProgressLine() {
        if (!this._disabled) {
            let leftInput = this.template.querySelector('.slider-left');
            let rightInput = this.template.querySelector('.slider-right');

            let leftProgressLine =
                ((this.calculateMax - this.valueLower) /
                    (this.calculateMax - this.min)) *
                100;
            let rightProgressLine =
                ((this.valueUpper - this.calculateMin) /
                    (this.max - this.calculateMin)) *
                100;

            leftInput.style.background =
                'linear-gradient(to left, #1a5296 0%, #1a5296 ' +
                leftProgressLine +
                '%, #ecebea ' +
                leftProgressLine +
                '%, #ecebea 100%)';

            rightInput.style.background =
                'linear-gradient(to right, #1a5296 0%, #1a5296 ' +
                rightProgressLine +
                '%, #ecebea ' +
                rightProgressLine +
                '%, #ecebea 100%)';
        }
    }

    /**
     * Display left bubble.
     */
    showLeftBubble() {
        if (this._pin) {
            let bubbleLeft = this.template.querySelector('.left-bubble');
            bubbleLeft.style.opacity = '1';
        }
    }

    /**
     * Display right bubble.
     */
    showRightBubble() {
        if (this._pin) {
            let bubbleRight = this.template.querySelector('.right-bubble');
            bubbleRight.style.opacity = '1';
        }
    }

    /**
     * Hide left bubble.
     */
    hideLeftBubble() {
        if (this._pin) {
            let bubbleLeft = this.template.querySelector('.left-bubble');
            bubbleLeft.style.opacity = '0';
        }
    }

    /**
     * Hide right bubble.
     */
    hideRightBubble() {
        if (this._pin) {
            let bubbleRight = this.template.querySelector('.right-bubble');
            bubbleRight.style.opacity = '0';
        }
    }

    /**
     * Calculate Bubbles position.
     */
    setBubblesPosition() {
        if (this._pin) {
            setTimeout(() => {
                let bubbleLeft = this.template.querySelector('.left-bubble');
                let bubbleRight = this.template.querySelector('.right-bubble');

                let rightProgressBubble =
                    ((this.valueUpper - this.calculateMin) /
                        (this.max - this.calculateMin)) *
                    100;

                let leftProgressBubble =
                    (1 -
                        (this.calculateMax - this.valueLower) /
                            (this.calculateMax - this.min)) *
                    100;

                bubbleLeft.style.left =
                    'calc(' +
                    leftProgressBubble +
                    '% - ' +
                    (leftProgressBubble * 0.16 + 8) +
                    'px)';

                bubbleRight.style.left =
                    'calc(' +
                    rightProgressBubble +
                    '% - ' +
                    (rightProgressBubble * 0.16 + 8) +
                    'px)';
            }, 1);
        }
    }

    /**
     * Represents the validity states of the slider inputs, with respect to constraint validation.
     *
     * @public
     */
    @api get validity() {
        return (
            this._constraintLeft.validity +
            ', ' +
            this._constraintRight.validity
        );
    }

    /**
     * Returns the valid attribute value (Boolean) on the ValidityState object.
     *
     * @public
     * @returns {boolean}
     */
    @api
    checkValidity() {
        return (
            this._constraintLeft.checkValidity() &&
            this._constraintRight.checkValidity()
        );
    }

    /**
     * Displays the error messages and returns false if the input is invalid. If the input is valid, reportValidity() clears displayed error messages and returns true.
     *
     * @public
     * @returns {string | boolean}
     */
    @api
    reportValidity() {
        let helpMessage = '';

        let leftInput = this._constraintLeft.reportValidity((message) => {
            helpMessage = helpMessage + message;
        });

        let rightInput = this._constraintRight.reportValidity((message) => {
            if (!leftInput) {
                helpMessage = helpMessage + ', ';
            }

            helpMessage = helpMessage + message;
        });

        this._helpMessage = helpMessage;

        return leftInput && rightInput;
    }

    /**
     * Sets a custom error message to be displayed when the input value is submitted.
     *
     * @public
     * @param {string} message
     */
    @api
    setCustomValidity(message) {
        this._constraintLeft.setCustomValidity(message);
        this._constraintRight.setCustomValidity(message);
    }

    /**
     * Displays an error message if the input value is required and no option is selected.
     *
     * @public
     */
    @api
    showHelpMessageIfInvalid() {
        this.reportValidity();
    }

    /**
     * Update input left proxy attributes.
     *
     * @param {object} attributes
     */
    _updateProxyInputLeftAttributes(attributes) {
        if (this._constraintApiProxyInputLeftUpdater) {
            this._constraintApiProxyInputLeftUpdater(attributes);
        }
    }

    /**
     * Update input right proxy attributes.
     *
     * @param {object} attributes
     */
    _updateProxyInputRightAttributes(attributes) {
        if (this._constraintApiProxyInputRightUpdater) {
            this._constraintApiProxyInputRightUpdater(attributes);
        }
    }

    /**
     * Get the left constraint API via proxy input.
     *
     * @return {object} constraintApiLeft
     */
    get _constraintLeft() {
        if (!this._constraintApiLeft) {
            this._constraintApiLeft = new FieldConstraintApiWithProxyInput(
                () => this
            );

            this._constraintApiProxyInputLeftUpdater = this._constraintApiLeft.setInputAttributes(
                {
                    type: () => 'range',
                    value: () => this.valueLower,
                    max: () => this.max,
                    min: () => this.min,
                    step: () => this.step,
                    disabled: () => this.disabled
                }
            );
        }
        return this._constraintApiLeft;
    }

    /**
     * Get the right constraint API via proxy input.
     *
     * @return {object} constraintApiRight
     */
    get _constraintRight() {
        if (!this._constraintApiRight) {
            this._constraintApiRight = new FieldConstraintApiWithProxyInput(
                () => this
            );

            this._constraintApiProxyInputRightUpdater = this._constraintRight.setInputAttributes(
                {
                    type: () => 'range',
                    value: () => this.valueUpper,
                    max: () => this.max,
                    min: () => this.min,
                    step: () => this.step,
                    disabled: () => this.disabled
                }
            );
        }
        return this._constraintApiRight;
    }
}
