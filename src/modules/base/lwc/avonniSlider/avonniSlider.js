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
import {
    normalizeBoolean,
    normalizeString,
    normalizeArray,
    normalizeObject
} from 'c/utilsPrivate';
import { classSet, generateUUID } from 'c/utils';
import { AvonniResizeObserver } from 'c/resizeObserver';
import { FieldConstraintApiWithProxyInput } from 'c/inputUtils';

const DEFAULT_MIN = 0;
const DEFAULT_MINIMUM_DISTANCE = 0;
const DEFAULT_MAX = 100;
const DEFAULT_MAX_PERCENTAGE = 1;
const PERCENT_SCALING_FACTOR = 100;
const DEFAULT_STEP = 1;
const DEFAULT_VALUE = 50;

const SLIDER_SIZES = {
    valid: ['x-small', 'small', 'medium', 'large', 'responsive'],
    default: 'responsive'
};
const SLIDER_TYPES = {
    valid: ['horizontal', 'vertical'],
    default: 'horizontal'
};
const LABEL_VARIANTS = {
    valid: ['standard', 'label-hidden'],
    default: 'standard'
};
const SLIDER_UNITS = {
    valid: ['decimal', 'currency', 'percent', 'custom'],
    default: 'decimal'
};
const TICK_MARK_STYLES = {
    valid: ['inner-tick', 'tick', 'dot'],
    default: 'inner-tick'
};
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/**
 * @class
 * @descriptor avonni-slider
 * @storyId example-slider--base
 * @public
 */
export default class AvonniSlider extends LightningElement {
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

    _disabled = false;
    _disableSwap = false;
    _max = DEFAULT_MAX;
    _min = DEFAULT_MIN;
    _minimumDistance = DEFAULT_MINIMUM_DISTANCE;
    _pin = false;
    _hideTrack = false;
    _hideMinMaxValues = false;
    _showTickMarks = false;
    _size = SLIDER_SIZES.default;
    _step = DEFAULT_STEP;
    _tickMarkStyle = TICK_MARK_STYLES.default;
    _type = SLIDER_TYPES.default;
    _unit = SLIDER_UNITS.default;
    _unitAttributes = {};
    _variant = LABEL_VARIANTS.default;
    _value = [DEFAULT_VALUE];

    computedMax;
    computedMin = DEFAULT_MIN;
    customLabels = [];

    _computedValues = [DEFAULT_VALUE];
    _focusedInputIndex;
    _helpMessage;
    _initMax;
    _moveEventWait = false;
    _pinLocked = false;
    _previousScalingFactor = 1;
    _trackInterval = [DEFAULT_MIN, DEFAULT_VALUE];
    _resizeObserver;
    _scalingFactor = 1;
    _constraintApis = [];
    _constraintApiProxyInputUpdaters = [];

    _connected = false;
    _domModified = false;
    _rendered = false;

    constructor() {
        super();
        this.template.addEventListener('mousemove', (event) => {
            if (!this._moveEventWait) {
                if (this._computedValues.length > 1) {
                    this.setClosestOnTop(event);
                    this._moveEventWait = true;
                    // after a fraction of a second, allow events again
                    setTimeout(() => {
                        this._moveEventWait = false;
                    }, 50);
                }
            }
        });
        this.template.addEventListener('focusin', (event) => {
            if (event.target.dataset.groupName === 'input') {
                this._focusedInputIndex = event.target.dataset.index;
            }
        });
    }

    connectedCallback() {
        this.scaleValues();
        this.capValues();
        this._connected = true;
    }

    renderedCallback() {
        if (!this.resizeObserver) {
            this._resizeObserver = this.initResizeObserver();
        }
        if (!this._rendered || this._domModified) {
            if (this.isVerticalResponsive) {
                this.setVerticalResponsiveHeight();
            }
            if (this.showTrack) {
                this.updateTrack(this._computedValues);
            } else {
                this._trackInterval = [
                    this.computedMin - 1,
                    this.computedMin - 1
                ];
            }
            this._computedValues.forEach((val, index) => {
                this.setHitboxPosition(index);
            });
            if (this.hasCustomLabels) {
                this.displayCustomLabels();
            }
            this._rendered = true;
            this._domModified = false;
        }
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * If present, the slider is disabled and users cannot interact with it.
     *
     * @type {Boolean}
     * @public
     * @default false
     */
    @api
    get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    /**
     * If present, the slider thumbs can swap order.
     *
     * @type {Boolean}
     * @public
     * @default false
     */
    @api
    get disableSwap() {
        return this._disableSwap;
    }
    set disableSwap(value) {
        this._disableSwap = normalizeBoolean(value);
    }

    /**
     * The maximum value of the input slider.
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
        const intValue = !isNaN(value) ? parseInt(value, 10) : null;
        this._initMax = intValue;
        this.initMaxDefaultValue();

        if (this._connected) {
            this.scaleValues();
            this.capValues();
        }
    }

    /**
     * The minimum value of the input slider.
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
        const intValue = parseInt(value, 10);
        const normalizedMin = isNaN(intValue) ? DEFAULT_MIN : intValue;
        this.computedMin = normalizedMin;
        this._min = normalizedMin;

        if (this._connected) {
            this.scaleValues();
            this.capValues();
        }
    }

    /**
     * The minimum distance between nodes when swap is disabled and there are many nodes.
     *
     * @type {number}
     * @public
     * @default 0
     */
    @api
    get minimumDistance() {
        return this._minimumDistance;
    }
    set minimumDistance(value) {
        const intValue = parseInt(value, 10);
        this._minimumDistance = isNaN(intValue)
            ? DEFAULT_MINIMUM_DISTANCE
            : intValue;
    }

    /**
     * If present, min and max value indicators are removed.
     *
     * @type {Boolean}
     * @public
     * @default false
     */
    @api
    get hideMinMaxValues() {
        return this._hideMinMaxValues;
    }
    set hideMinMaxValues(value) {
        this._hideMinMaxValues = normalizeBoolean(value);
        this._domModified = true;
    }

    /**
     * If present, track is removed.
     *
     * @type {Boolean}
     * @public
     * @default false
     */
    @api
    get hideTrack() {
        return this._hideTrack;
    }
    set hideTrack(value) {
        this._hideTrack = normalizeBoolean(value);
        this._domModified = true;
    }

    /**
     * If present, a pin containing the value is shown when the thumb is pressed.
     *
     * @type {Boolean}
     * @public
     * @default false
     */
    @api
    get showPin() {
        return this._pin;
    }
    set showPin(value) {
        this._pin = normalizeBoolean(value);
        this._domModified = true;
    }

    /**
     * If present, minor tick marks are displayed at every step.
     *
     * @type {Boolean}
     * @public
     * @default false
     */
    @api
    get showTickMarks() {
        return this._showTickMarks;
    }
    set showTickMarks(value) {
        this._showTickMarks = normalizeBoolean(value);
        this._domModified = true;
    }

    /**
     * Size of the slider. Accepted values are responsive, x-small, small, medium, and large.
     *
     * @type {string}
     * @public
     * @default responsive
     */
    @api
    get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: SLIDER_SIZES.default,
            validValues: SLIDER_SIZES.valid
        });
    }

    /**
     * The step increment value of the input slider. Example steps include 0.1, 1, or 10.
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
        this._scalingFactor =
            0 < this._step && this._step < 1 ? 1 / this.step : DEFAULT_STEP;
        if (this._connected) {
            this.scaleValues();
            this.capValues();
        }
        this._domModified = true;
    }

    /**
     * If present, tick marks are displayed with the according style. Accepted styles are inner-tick, tick, dot.
     *
     * @type {string}
     * @public
     * @default inner-tick
     */
    @api
    get tickMarkStyle() {
        return this._tickMarkStyle;
    }
    set tickMarkStyle(value) {
        this._tickMarkStyle = normalizeString(value, {
            fallbackValue: TICK_MARK_STYLES.default,
            validValues: TICK_MARK_STYLES.valid
        });
        this._domModified = true;
    }

    /**
     * The type determines the orientation of the slider. Accepted values are vertical and horizontal.
     *
     * @type {string}
     * @public
     * @default horizontal
     */
    @api
    get type() {
        return this._type;
    }

    set type(type) {
        this._type = normalizeString(type, {
            fallbackValue: SLIDER_TYPES.default,
            validValues: SLIDER_TYPES.valid
        });
        this._domModified = true;
    }

    /**
     * Format the value displayed. Accepted units include decimal, currency, percent and custom. See Units and Unit Attributes table for more details.
     *
     * @type {string}
     * @public
     * @default decimal
     */
    @api
    get unit() {
        return this._unit;
    }
    set unit(unit) {
        this._unit = normalizeString(unit, {
            fallbackValue: SLIDER_UNITS.default,
            validValues: SLIDER_UNITS.valid
        });

        this.initMaxDefaultValue();

        if (this._unit === 'percent') {
            this._scalingFactor = PERCENT_SCALING_FACTOR;
            if (this._connected) {
                this.scaleValues();
                this.capValues();
            }
        }
    }

    /**
     * Attributes specific to the selected unit. See Units and Unit Attributes table for more details.
     *
     * @type {object}
     * @public
     */
    @api
    get unitAttributes() {
        return this._unitAttributes;
    }
    set unitAttributes(value) {
        if (value && value.customLabels) {
            this.customLabels = normalizeArray(value.customLabels, 'object');
            this._domModified = true;
        }
        this._unitAttributes = normalizeObject(value);
    }

    /**
     * Represents the validity states that an element can be in, with respect to constraint validation.
     *
     * @type {object}
     * @public
     */
    @api
    get validity() {
        return this._computedValues.length === 1
            ? this._constraints[0].validity.valid
            : this._constraints.reduce((result, nextConstraintApi) => {
                  return result && nextConstraintApi.validity.valid;
              }, true);
    }

    /**
     * The value of the slider. If multiple values are given, slider will have multiple thumbs, one for each value.
     *
     * @type {number | number[]}
     * @public
     * @default 50
     */
    @api
    get value() {
        return this._value;
    }
    set value(value) {
        if (!isNaN(Number(value))) {
            this._value = [Number(value)];
        } else {
            const normalizedValue = normalizeArray(value, 'number');
            this._value = normalizedValue.length
                ? normalizedValue
                : [DEFAULT_VALUE];
            this._value.sort((a, b) => a - b);
        }

        this._computedValues = [...this._value];
        if (this._connected) {
            this.scaleValues();
            this.capValues();
        }
        this._domModified = true;
    }

    /**
     * The variant changes the appearance of the slider. Accepted variants include standard and label-hidden. The default is standard.
     *
     * @type {string}
     * @public
     * @default standard
     */
    @api
    get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: LABEL_VARIANTS.default,
            validValues: LABEL_VARIANTS.valid
        });
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Computed label class styling.
     *
     * @type {string}
     */
    get computedLabelClass() {
        return classSet('avonni-slider__label slds-slider-label__label').add({
            'slds-assistive-text': this._variant === 'label-hidden'
        });
    }

    /**
     * Computed container class styling ( size, vertical ).
     *
     * @type {string}
     */
    get computedContainerClass() {
        return classSet(
            `avonni-slider__container-horizontal-size_${this._size}`
        )
            .add({
                'avonni-slider__vertical': this.isVertical,
                'slds-is-absolute': this.isVertical,
                'slds-m-left_xx-small': this.isVertical,
                [`avonni-slider__container-vertical-origin_${this._size}`]:
                    this.isVertical
            })
            .toString();
    }

    /**
     * Computed pin class styling.
     *
     * @type {string}
     */
    get computedPinClass() {
        return classSet('').add({
            'avonni-slider__pin-vertical': this.isVertical,
            'avonni-slider__pin': !this.isVertical
        });
    }

    /**
     * Computed input class styling.
     *
     * @type {string}
     */
    get computedInputClass() {
        return classSet('slds-slider__range avonni-slider__slider').add({
            'avonni-slider__slider_disabled': this.disabled
        });
    }

    /**
     * Computed track class styling.
     *
     * @type {string}
     */
    get computedTrackClass() {
        return classSet('avonni-slider__track').add({
            'avonni-slider__track_disabled': this.disabled,
            'avonni-slider__track-border_square':
                this.showAnyTickMarks && this.tickMarkStyle === 'inner-tick'
        });
    }

    /**
     * Computed track class styling.
     *
     * @type {string}
     */
    get computedTrackContainerClass() {
        return classSet('avonni-slider__track-container').add({
            'avonni-slider__track-container-border_square':
                this.showAnyTickMarks && this.tickMarkStyle === 'inner-tick'
        });
    }

    /**
     * Computed custom label class styling.
     *
     * @type {string}
     */
    get computedCustomLabelClass() {
        return classSet('').add({
            'avonni-slider__custom-label_horizontal': !this.isVertical,
            'avonni-slider__custom-label_vertical': this.isVertical
        });
    }

    /**
     * Computed custom label container class styling.
     *
     * @type {string}
     */
    get computedCustomLabelContainerClass() {
        const isVertical = this.type === 'vertical';
        return classSet('').add({
            'avonni-slider__custom-label-container_horizontal': !isVertical,
            'avonni-slider__custom-label-container_vertical': isVertical,
            'avonni-slider__custom-label-container_close':
                this._tickMarkStyle !== 'tick',
            [`avonni-slider__container-vertical-size_${this._size}`]: isVertical
        });
    }

    /**
     * Computed custom label container class styling.
     *
     * @type {string}
     */
    get computedSpacerClass() {
        return classSet('').add({
            [`avonni-slider__container-vertical-size_${this._size}`]:
                !this.isVerticalResponsive,
            'avonni-slider__spacer-height_responsive': this.isVerticalResponsive
        });
    }

    /**
     * Unit normalized to a valid lightning-formatted-number unit.
     *
     * @type {string}
     */
    get computedUnit() {
        return this.unit === 'custom' ? SLIDER_UNITS.default : this.unit;
    }

    /**
     * Computed Slider Wrapper class styling.
     *
     */
    get computedSliderWrapperClass() {
        return classSet('avonni-slider__wrapper slds-p-vertical_x-small').add({
            'avonni-slider__wrapper_height_full':
                this.isVertical && !this.showLabel,
            'avonni-slider__wrapper_height_label':
                this.isVertical && this.showLabel
        });
    }

    /**
     * Computed right pin class styling.
     *
     * @type {string}
     */
    get computedUnitContainerClass() {
        return classSet(
            'avonni-slider__unit-container slds-grid slds-grid_align-spread'
        ).add({
            'avonni-slider__unit-container_ticks-horizontal':
                !this.isVertical &&
                this.showAnyTickMarks &&
                this.tickMarkStyle !== 'tick',
            'avonni-slider__unit-container_ticks-horizontal-tick':
                !this.isVertical &&
                this.showAnyTickMarks &&
                this.tickMarkStyle === 'tick',
            'slds-p-top_x-small': !this.isVertical
        });
    }

    /**
     * Key for inputs and customLabels
     * @type {string}
     *
     */
    get generateKey() {
        return generateUUID();
    }

    /**
     * Verify if the slider has custom labels.
     * @type {Boolean}
     *
     */
    get hasCustomLabels() {
        return this.customLabels.length !== 0 && this._unit === 'custom';
    }

    /**
     * Returns the color corresponding to highlight (depends on disabled)
     * @type {string}
     *
     */
    get highlightColor() {
        return this.disabled
            ? 'var(--avonni-slider-track-color-background, #919191)'
            : 'var(--avonni-slider-track-color, #0176d3)';
    }

    /**
     * Verify if slider is vertical.
     * @type {Boolean}
     *
     */
    get isVertical() {
        return this._type === 'vertical';
    }

    /**
     * Verify if slider is vertical and responsive
     * @type {Boolean}
     *
     */
    get isVerticalResponsive() {
        return this._type === 'vertical' && this.size === 'responsive';
    }

    /**
     * Verify if slider is vertical and does not have custom labels.
     * @type {Boolean}
     *
     */
    get isNormalVertical() {
        return (
            this._type === 'vertical' &&
            !this.hasCustomLabels &&
            !this.hideMinMaxValues
        );
    }

    /**
     * Verify if slider is vertical and does not have custom labels.
     * @type {Boolean}
     *
     */
    get isNormalHorizontal() {
        return (
            this._type !== 'vertical' &&
            !this.hasCustomLabels &&
            !this.hideMinMaxValues
        );
    }

    /**
     * To show or not the label
     * @type {Boolean}
     *
     */
    get showLabel() {
        return !(
            this._variant === 'label-hidden' ||
            !this.label ||
            (this.label && this.label.length === 0)
        );
    }

    /**
     * To show or not the track.
     * @type {Boolean}
     *
     */
    get showTrack() {
        return !this.hideTrack && this._computedValues.length < 3;
    }

    /**
     * To show or not the tick marks.
     * @type {Boolean}
     *
     */
    get showAnyTickMarks() {
        return this.hasCustomLabels || this._showTickMarks;
    }

    /**
     * To show or not the major tick marks.
     * @type {Boolean}
     *
     */
    get showOnlyMajorTicks() {
        return this.hasCustomLabels && !this._showTickMarks;
    }

    /**
     * values for display in DOM
     * @type {number[]}
     *
     */
    get values() {
        return this._computedValues;
    }

    /**
     * Compute constraintApis with fieldConstraintApiWithProxyInputs.
     * @type {object[]}
     *
     */
    get _constraints() {
        if (this._constraintApis.length === 0) {
            for (let i = 0; i < this._computedValues.length; i++) {
                const constraintApi = new FieldConstraintApiWithProxyInput(
                    () => this
                );

                this._constraintApiProxyInputUpdaters[i] =
                    constraintApi.setInputAttributes({
                        type: () => 'number',
                        value: () => this._computedValues[i],
                        max: () => this.max,
                        min: () => this.min,
                        step: () => this.step,
                        formatter: () => this.computedUnit,
                        disabled: () => this.disabled
                    });

                this._constraintApis[i] = constraintApi;
            }
        }
        return this._constraintApis;
    }

    /**
     * Returns the current variable for styling hook of thumb radius.
     * @type {number}
     */
    get _thumbRadius() {
        const thumbRadius = parseInt(
            getComputedStyle(
                this.template.querySelector('.avonni-slider__slider')
            )
                .getPropertyValue('--avonni-slider-thumb-sizing-width')
                .split('px')[0],
            10
        );
        return thumbRadius ? thumbRadius : 8;
    }

    /**
     * Returns the track bar html element.
     * @type {object}
     *
     */
    get _track() {
        return this.template.querySelector('[data-element-id="track"]');
    }

    /**
     * Returns the current variable for styling hook of track height.
     * @type {number}
     */
    get _trackHeight() {
        const trackHeight = this.template.querySelector(
            '[data-element-id="track-container"]'
        ).offsetHeight;
        return trackHeight ? trackHeight : 4;
    }

    /**
     *  Returns the tick ruler html element.
     * @type {object}
     *
     */
    get _ruler() {
        return this.template.querySelector('[data-element-id="ruler"]');
    }

    /**
     *  Returns the spacer element height for spacing on vertical slider.
     * @type {object}
     *
     */
    get _spacerHeight() {
        return (
            this.template.querySelector('[data-element-id="spacer"]')
                .clientHeight -
            2 * this._thumbRadius -
            0.5
        );
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Removes keyboard focus from the input element.
     *
     * @public
     */
    @api
    blur() {
        if (this._rendered) {
            this.template.activeElement.blur();
            this._focusedInputIndex = undefined;
        }
    }

    /**
     * Checks if the input is valid.
     *
     * @returns {Boolean} True if the element meets all constraint validations.
     * @public
     */
    @api
    checkValidity() {
        return this._constraints.reduce((result, nextConstraintApi) => {
            return result && nextConstraintApi.checkValidity();
        }, true);
    }

    /**
     * Sets focus on the next input element.
     *
     * @public
     */
    @api
    focus() {
        if (this._rendered) {
            if (!this._focusedInputIndex) {
                this._focusedInputIndex = 0;
            } else {
                this._focusedInputIndex++;
            }
            if (this._focusedInputIndex >= this._computedValues.length) {
                this._focusedInputIndex = 0;
            }
            const inputs = this.template.querySelectorAll(
                '[data-group-name="input"]'
            );
            inputs[this._focusedInputIndex].focus();
        }
    }

    /**
     * Displays the error messages. If the input is valid, reportValidity() clears displayed error messages.
     *
     * @returns {Boolean} False if invalid, true if valid.
     * @public
     */
    @api
    reportValidity() {
        let helpMessage = '';

        const isValid = this._constraints.reduce(
            (result, constraintApi, index) => {
                return (
                    result &&
                    constraintApi.reportValidity((message) => {
                        helpMessage += `Slider ${index}: ${message} `;
                    })
                );
            },
            true
        );
        if (this._computedValues.length === 1) {
            helpMessage = helpMessage.split(': ')[1];
        }
        this._helpMessage = isValid ? undefined : helpMessage.trim();
        return isValid;
    }

    /**
     * Sets a custom error message to be displayed when a form is submitted.
     *
     * @param {string} message The string that describes the error. If message is an empty string, the error message is reset.
     * @public
     */
    @api
    setCustomValidity(message) {
        this._constraints.forEach((constraintApi) => {
            constraintApi.setCustomValidity(message);
        });
    }

    /**
     * Displays error messages on invalid fields.
     * An invalid field fails at least one constraint validation and returns false when <code>checkValidity()</code> is called.
     *
     * @public
     */
    @api
    showHelpMessageIfInvalid() {
        this.reportValidity();
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Initialization of the max attribute.
     */
    initMaxDefaultValue() {
        let normalizedMax;
        if (this._initMax && !isNaN(this._initMax)) {
            normalizedMax = this._initMax;
        } else {
            normalizedMax =
                this.unit === 'percent' ? DEFAULT_MAX_PERCENTAGE : DEFAULT_MAX;
        }

        this.computedMax = normalizedMax;
        this._max = normalizedMax;
    }

    /**
     * Caps the value if it overflows min or max.
     */
    capValues() {
        this._computedValues.forEach((val, index) => {
            this._computedValues[index] = Math.min(
                Math.max(val, this.computedMin),
                this.computedMax
            );
            this._computedValues[index] =
                Math.round(this._computedValues[index] / this._step) *
                this._step;
        });
        this.updatePublicValue();
    }

    /**
     * Update slider values and dispatch change event.
     */
    changeSlider() {
        this._updateProxyInputAttributes('value');

        /**
         * The event fired when the slider value changed.
         *
         * @event
         * @name change
         * @param {number | number[]} value The value of the slider.
         * @public
         */
        const selectedEvent = new CustomEvent('change', {
            detail: {
                value: this._value
            }
        });

        this.dispatchEvent(selectedEvent);
    }

    /**
     * Displays and positions the custom labels for the slider
     */
    displayCustomLabels() {
        const customLabelNodes = this.template.querySelectorAll(
            '[data-group-name="custom-label-wrapper"]'
        );
        let totalWidth = this.template.querySelector(
            '[data-element-id="custom-label-container"]'
        ).clientWidth;
        if (this.isVertical) {
            totalWidth = this._spacerHeight;
        }
        customLabelNodes.forEach((element, index) => {
            const value = this.customLabels[index].value;
            if (this.isVertical) {
                element.style.top = `${
                    totalWidth - this.getPercentOfValue(value) * totalWidth
                }px`;
            } else {
                element.style.left = `${
                    this.getPercentOfValue(value) * totalWidth
                }px`;
            }
        });
    }

    /**
     * Draws the tick marks as SVG depending on its style.
     */
    drawRuler(drawPositions = false) {
        const ruler = this._ruler;
        if (drawPositions) {
            ruler.querySelectorAll('*').forEach((child) => {
                child.remove();
            });
        }
        const totalWidth = this.getInput(0).clientWidth;
        const numberOfSteps =
            (this.computedMax - this.computedMin) /
            (this.step * this._scalingFactor);
        const stepWidth = (totalWidth - this._thumbRadius * 2) / numberOfSteps;

        switch (this._tickMarkStyle) {
            case 'tick':
                this.drawTickRuler(
                    numberOfSteps,
                    this._thumbRadius,
                    stepWidth,
                    drawPositions
                );
                break;
            case 'dot':
                this.drawDotRuler(
                    numberOfSteps,
                    this._thumbRadius,
                    stepWidth,
                    drawPositions
                );
                break;
            default:
                // or when = 'inner-tick'
                this.drawInnerTickRuler(
                    numberOfSteps,
                    this._thumbRadius,
                    stepWidth,
                    drawPositions
                );
                break;
        }
    }

    /**
     * draws the tick marks for inner-tick style
     */
    drawInnerTickRuler(numberOfSteps, leftPosition, stepWidth, drawPositions) {
        const ruler = this._ruler;

        if (drawPositions) {
            for (let i = 0; i < numberOfSteps + 1; i++) {
                const valueOfStep =
                    (i / numberOfSteps) * (this.computedMax - this.computedMin);
                let isMajorStep = i === 0 || i === numberOfSteps;
                if (this.hasCustomLabels) {
                    isMajorStep =
                        isMajorStep ||
                        this.customLabels.some(
                            (customLabel) =>
                                customLabel.value === i + this.computedMin
                        );
                }
                if (this.showOnlyMajorTicks && !isMajorStep) {
                    leftPosition += stepWidth;
                    continue;
                }
                const trackMiddle = this._trackHeight / 2 + 10;
                const line = document.createElementNS(SVG_NAMESPACE, 'line');
                line.setAttribute('x1', `${leftPosition}`);
                line.setAttribute('x2', `${leftPosition}`);
                line.setAttribute(
                    'y1',
                    `${
                        isMajorStep
                            ? trackMiddle -
                              this._trackHeight / 2 -
                              (3 + 0.2 * this._trackHeight)
                            : trackMiddle -
                              this._trackHeight / 2 -
                              (2 + 0.2 * this._trackHeight)
                    }`
                );
                line.setAttribute(
                    'y2',
                    `${
                        isMajorStep
                            ? trackMiddle +
                              this._trackHeight / 2 +
                              (3 + 0.2 * this._trackHeight)
                            : trackMiddle +
                              this._trackHeight / 2 +
                              (2 + 0.2 * this._trackHeight)
                    }`
                );
                ruler.appendChild(line);
                line.dataset.tickValue = valueOfStep;
                leftPosition += stepWidth;
            }
        }

        this.template.querySelectorAll('line').forEach((line) => {
            const isColored =
                this._trackInterval[0] <= line.dataset.tickValue &&
                line.dataset.tickValue <= this._trackInterval[1];
            line.setAttribute(
                'stroke',
                `${
                    isColored
                        ? this.highlightColor
                        : 'var(--avonni-slider-track-color-background, #ecebea)'
                }`
            );
        });
    }

    /**
     * draws the tick marks for tick style
     */
    drawTickRuler(numberOfSteps, leftPosition, stepWidth, drawPositions) {
        if (drawPositions) {
            const ruler = this._ruler;
            for (let i = 0; i < numberOfSteps + 1; i++) {
                let isMajorStep = i === 0 || i === numberOfSteps;
                if (this.hasCustomLabels) {
                    isMajorStep =
                        isMajorStep ||
                        this.customLabels.some(
                            (customLabel) =>
                                customLabel.value === i + this.computedMin
                        );
                }
                if (this.showOnlyMajorTicks && !isMajorStep) {
                    leftPosition += stepWidth;
                    continue;
                }
                const line = document.createElementNS(SVG_NAMESPACE, 'line');
                line.setAttribute(
                    'stroke',
                    `${isMajorStep ? 'black' : 'gray'}`
                );
                line.setAttribute('height', `10`);
                line.setAttribute('width', `5`);
                line.setAttribute('x1', `${leftPosition}`);
                line.setAttribute('x2', `${leftPosition}`);
                line.setAttribute(
                    'y1',
                    `${this._trackHeight + (20 + 0.2 * this._trackHeight)}`
                );
                line.setAttribute(
                    'y2',
                    `${
                        isMajorStep
                            ? this._trackHeight + (27 + 0.2 * this._trackHeight)
                            : this._trackHeight + (26 + 0.2 * this._trackHeight)
                    }`
                );
                ruler.appendChild(line);
                leftPosition += stepWidth;
            }
        }
    }

    /**
     * draws the tick marks for dot style
     */
    drawDotRuler(numberOfSteps, leftPosition, stepWidth, drawPositions) {
        if (drawPositions) {
            const ruler = this._ruler;
            for (let i = 0; i < numberOfSteps + 1; i++) {
                const valueOfStep =
                    (i / numberOfSteps) * (this.computedMax - this.computedMin);
                let isMajorStep = i === 0 || i === numberOfSteps;
                if (this.hasCustomLabels) {
                    isMajorStep =
                        isMajorStep ||
                        this.customLabels.some(
                            (customLabel) =>
                                customLabel.value === i + this.computedMin
                        );
                }
                if (
                    (this.showOnlyMajorTicks && !isMajorStep) ||
                    i === 0 ||
                    i === numberOfSteps
                ) {
                    leftPosition += stepWidth;
                    continue;
                }
                const circle = document.createElementNS(
                    SVG_NAMESPACE,
                    'circle'
                );
                circle.setAttribute('cx', `${leftPosition}`);
                circle.setAttribute('cy', `${this._trackHeight / 2 + 10}`);
                circle.setAttribute('r', `${this._trackHeight / 3}`);
                ruler.appendChild(circle);
                circle.dataset.tickValue = valueOfStep;
                leftPosition += stepWidth;
            }
        }
        this.template.querySelectorAll('circle').forEach((circle) => {
            const isColored =
                this._trackInterval[0] <= circle.dataset.tickValue &&
                circle.dataset.tickValue <= this._trackInterval[1];
            circle.setAttribute(
                'fill',
                `${
                    isColored
                        ? '#ffffff'
                        : 'var(--avonni-slider-track-color-background, #ecebea)'
                }`
            );
            circle.style.filter = isColored
                ? 'brightness(1)'
                : 'brightness(0.4)';
        });
    }

    /**
     * Initialize the screen resize observer.
     *
     * @returns {AvonniResizeObserver} Resize observer.
     */
    initResizeObserver() {
        if (!(this.showAnyTickMarks || this.isVerticalResponsive)) return null;
        const resizeObserver = new AvonniResizeObserver(() => {
            if (this.isVerticalResponsive) {
                this.setVerticalResponsiveHeight();
            }
            if (this.showAnyTickMarks) {
                this.drawRuler(true);
            }
            if (this.hasCustomLabels) {
                this.displayCustomLabels();
            }
        });
        resizeObserver.observe(
            this.template.querySelector('[data-element-id="div-wrapper"]')
        );
        return resizeObserver;
    }

    /**
     *  Returns the input html element.
     *  @returns {object}
     *
     */
    getInput(index) {
        return this.template.querySelector(
            `[data-group-name="input"][data-index="${index}"]`
        );
    }

    /**
     *  Returns the hitbox element for certain index.
     * @returns {object}
     *
     */
    getHitbox(index) {
        return this.template.querySelector(
            `[data-group-name="hitbox"][data-index="${index}"]`
        );
    }

    /**
     * Get the percentage associated to a value of the slider
     * @param value
     * @type {number}
     */
    getPercentOfValue(value) {
        return (
            (value - this.computedMin) / (this.computedMax - this.computedMin)
        );
    }

    /**
     * Handle any slider value change.
     *
     * @param {Event} event
     */
    handleChange(event) {
        this.updateInputSliders(event);
        if (this._pin) {
            this.setPinPosition(event);
        }
        this.setHitboxPosition(parseInt(event.target.dataset.index, 10));
        this.updatePublicValue();
        this.changeSlider();
    }

    /**
     * Handle collision between sliders.
     *
     * @param {Event} event
     */
    manageCollisions(updatedSliderIndex, newValues) {
        const hasLeftNeighbor = updatedSliderIndex - 1 >= 0;
        const hasRightNeighbor = updatedSliderIndex + 1 < newValues.length;

        let neighborIndex = 0;
        if (hasLeftNeighbor) {
            neighborIndex = updatedSliderIndex - 1;
            if (
                newValues[updatedSliderIndex] - newValues[neighborIndex] <
                this._minimumDistance
            ) {
                newValues[updatedSliderIndex] =
                    newValues[neighborIndex] + this._minimumDistance;
            }
        }
        if (hasRightNeighbor) {
            neighborIndex = updatedSliderIndex + 1;
            if (
                newValues[neighborIndex] - newValues[updatedSliderIndex] <
                this._minimumDistance
            ) {
                newValues[updatedSliderIndex] =
                    newValues[neighborIndex] - this._minimumDistance;
            }
        }
    }

    /**
     * Scale values if steps is smaller than 1.
     *
     * @param {Event} event
     */
    scaleValues() {
        if (!isNaN(this._value)) {
            this._computedValues = [this._value * this._scalingFactor];
        } else {
            this._computedValues = this._value.map(
                (val) => val * this._scalingFactor
            );
        }
        this.computedMin = this._min * this._scalingFactor;
        this.computedMax = this._max * this._scalingFactor;
    }

    /**
     * If slider is closer to mouse, adds a class which puts it above the others.
     *
     * @param {Event} event
     */
    setClosestOnTop(event) {
        const total = this.getInput(0).clientWidth;
        const inputPos = [];
        // get all X positions of input thumbs
        for (let i = 0; i < this._computedValues.length; i++) {
            inputPos[i] =
                total *
                    this.getPercentOfValue(
                        parseInt(this.getInput(i).value, 10)
                    ) +
                i;
        }

        // find closestX from mouse from input pos
        const closestX = inputPos.reduce((previous, current) => {
            return Math.abs(current - event.offsetX) <
                Math.abs(previous - event.offsetX)
                ? current
                : previous;
        });

        // set classes accordingly
        for (let i = 0; i < inputPos.length; i++) {
            if (inputPos.indexOf(closestX) === i) {
                this.getInput(i).classList.add('avonni-slider__slider_above');
            } else {
                this.getInput(i).classList.remove(
                    'avonni-slider__slider_above'
                );
            }
        }
    }

    /**
     * Sets the vertical wrapper and spacer to dimensions of parent height if responsive and vertical.
     *
     * @param {Event} event
     */
    setVerticalResponsiveHeight() {
        this.template.host.style.height = '100%';
        this.template.host.style.display = 'block';
        const spacer = this.template.querySelector(
            '[data-element-id="spacer"]'
        );
        const parentHeight = Math.max(
            -this._thumbRadius,
            spacer.offsetHeight - this._thumbRadius
        );
        const wrapper = this.template.querySelector(
            '[data-element-id="div-wrapper"]'
        );
        wrapper.style.transformOrigin = `${
            (parentHeight + this._thumbRadius) / 2
        }px ${(parentHeight + this._thumbRadius) / 2}px`;
        wrapper.style.width = `${parentHeight + this._thumbRadius}px`;
    }

    /**
     * Test if thumb is hovered.
     * @returns {Boolean}
     */
    thumbIsHovered(event) {
        const obj = this.getHitbox(
            parseInt(event.currentTarget.dataset.index, 10)
        );
        const radius = this._thumbRadius;
        const centerPointX = obj.getBoundingClientRect().x + radius;
        const centerPointY = obj.getBoundingClientRect().y + radius;
        if (
            Math.sqrt(
                (event.clientX - centerPointX) *
                    (event.clientX - centerPointX) +
                    (event.clientY - centerPointY) *
                        (event.clientY - centerPointY)
            ) < radius
        ) {
            return true;
        }
        return false;
    }

    /**
     * Display pin and hover color on thumb.
     */
    handleThumbHovered(event) {
        if (this._pinLocked || this.thumbIsHovered(event)) {
            this.getInput(event.currentTarget.dataset.index).classList.add(
                'avonni-slider__slider-thumb_hovered'
            );
            if (this._pin) {
                this.setPinPosition(event);
                this.template
                    .querySelector(`[data-group-name="pin"][data-index="0"]`)
                    .classList.add('avonni-slider__pin_visible');
            }
        } else {
            this.handleThumbExit(event);
        }
    }

    /**
     * Hide pin and remove hover color on thumb.
     */
    handleThumbExit(event) {
        if (!this.thumbIsHovered(event) && !this._pinLocked) {
            this.getInput(event.currentTarget.dataset.index).classList.remove(
                'avonni-slider__slider-thumb_hovered'
            );
            if (this._pin) {
                this.template
                    .querySelector(`[data-group-name="pin"][data-index="0"]`)
                    .classList.remove('avonni-slider__pin_visible');
            }
        }
    }

    /**
     * Lock the pin so it is always displayed.
     */
    handleLockPin(event) {
        this._pinLocked = true;
        this.handleThumbHovered(event);
    }

    /**
     * Unlock the pin so it is not always displayed.
     */
    handleUnlockPin(event) {
        this._pinLocked = false;
        this.handleThumbHovered(event);
    }

    /**
     * Calculate Pins position.
     */
    setPinPosition(event) {
        const pin = this.template.querySelector(
            `[data-group-name="pin"][data-index="0"]`
        );
        const pinIndex = parseInt(event.target.dataset.index, 10);
        const pinProgress = this.getPercentOfValue(
            this._computedValues[pinIndex]
        );
        let transformedValue = this._computedValues[pinIndex];
        if (this._scalingFactor !== 1) {
            transformedValue = transformedValue / this._scalingFactor;
        }
        pin.querySelector(
            '[data-element-id="lightning-formatted-number-pin"]'
        ).value = transformedValue;

        let totalWidth = this.getInput(0).clientWidth;
        if (this.isVertical) {
            totalWidth = this._spacerHeight;
        }
        if (this.isVertical) {
            pin.style.left = `${pinProgress * totalWidth}px`;
        } else {
            pin.style.left = `${
                pinProgress * totalWidth +
                this._thumbRadius * (1 - pinProgress * 2)
            }px`;
        }
    }

    setHitboxPosition(index) {
        const hitbox = this.template.querySelector(
            `[data-group-name="hitbox"][data-index="${index}"]`
        );
        const hitboxProgress = this.getPercentOfValue(
            this._computedValues[parseInt(index, 10)]
        );

        let totalWidth = this.getInput(0).clientWidth;
        if (this.isVertical) {
            totalWidth = this._spacerHeight;
        }
        if (this.isVertical) {
            hitbox.style.left = `${
                hitboxProgress * totalWidth + this._thumbRadius
            }px`;
        } else {
            hitbox.style.left = `${
                hitboxProgress * totalWidth +
                this._thumbRadius * (1 - hitboxProgress * 2)
            }px`;
        }
    }

    /**
     * Updates the input slider values based on its current value.
     *
     * @param {Event} event
     */
    updateInputSliders(event) {
        const newValues = [...this._computedValues];
        const targetIndex = parseInt(event.currentTarget.dataset.index, 10);
        newValues[targetIndex] = parseInt(event.currentTarget.value, 10);
        if (this._disableSwap) {
            this.manageCollisions(targetIndex, newValues);
        }
        for (let i = 0; i < this._computedValues.length; i++) {
            this.getInput(i).value = newValues[i];
            this._computedValues[i] = newValues[i];
        }
        if (this.showTrack) {
            this.updateTrack(newValues);
        }
    }

    /**
     * Updates the value that user has access to based on the current computedValues.
     */
    updatePublicValue() {
        if (this._computedValues.length === 1) {
            this._value = this._computedValues[0] / this._scalingFactor;
        } else {
            this._value = this._computedValues.map(
                (val) => val / this._scalingFactor
            );
            this._value = this._value.sort((a, b) => a - b);
        }
    }

    /**
     * Updates the value that user has access to based on the current computedValues.
     * @param {number[]} values values to base track update on
     */
    updateTrack(values) {
        if (this._computedValues.length >= 2) {
            const lowestValue = Math.max(
                ...[Math.min(...values), this.computedMin]
            );
            this._track.style.left =
                this.getPercentOfValue(lowestValue) * PERCENT_SCALING_FACTOR +
                '%';
            this._trackInterval[0] = lowestValue - this.computedMin;
        } else {
            this._track.style.left = '0%';
            this._trackInterval[0] = this.computedMin;
        }
        const highestValue = Math.min(
            ...[Math.max(...values), this.computedMax]
        );
        this._track.style.right =
            PERCENT_SCALING_FACTOR -
            this.getPercentOfValue(highestValue) * PERCENT_SCALING_FACTOR +
            '%';
        this._trackInterval[1] = highestValue - this.computedMin;
        if (this.showAnyTickMarks) {
            this.drawRuler(!this._rendered || this._domModified);
        }
    }

    /**
     * Proxy Input Attributes updater.
     *
     * @param {object} attributes
     */
    _updateProxyInputAttributes(attributes) {
        if (this._constraintApiProxyInputUpdaters.length !== 0) {
            this._constraintApiProxyInputUpdaters.forEach((updater) => {
                updater(attributes);
            });
        }
    }
}
