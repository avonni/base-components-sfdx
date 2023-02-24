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
import { normalizeString, normalizeBoolean } from 'c/utilsPrivate';
import { classSet } from 'c/utils';

const VALUE_VARIANTS = {
    valid: ['standard', 'value-hidden'],
    default: 'standard'
};

const PROGRESS_CIRCLE_DIRECTIONS = {
    valid: ['fill', 'drain'],
    default: 'fill'
};

const PROGRESS_CIRCLE_SIZES = {
    valid: ['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large'],
    default: 'medium'
};

const PROGRESS_CIRCLE_THICKNESSES = {
    valid: ['x-small', 'small', 'medium', 'large', 'x-large'],
    default: 'medium'
};

const TITLE_POSITIONS = { valid: ['top', 'bottom'], default: 'bottom' };

const DEFAULT_VALUE = 0;

/**
 * @class
 * @descriptor avonni-progress-bar
 * @storyId example-progress-circle--base
 * @public
 */
export default class AvonniProgressCircle extends LightningElement {
    /**
     * The label is displayed after the value in the progress circle.
     *
     * @type {string}
     * @public
     */
    @api label;
    /**
     * The title is displayed at the bottom or top of the progress circle.
     *
     * @type {string}
     * @public
     */
    @api title;

    _direction = PROGRESS_CIRCLE_DIRECTIONS.default;
    _isLoading = false;
    _size = PROGRESS_CIRCLE_SIZES.default;
    _thickness = PROGRESS_CIRCLE_THICKNESSES.default;
    _titlePosition = TITLE_POSITIONS.default;
    _value = DEFAULT_VALUE;
    _variant = VALUE_VARIANTS.default;

    _dots = 1;
    _spinningValue = 0;

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Deprecated. Use "--avonni-progress-circle-bar-color" styling hook instead..
     *
     * @type {string}
     * @default #1589ee
     * @deprecated
     */
    @api
    get color() {
        return this._color;
    }

    set color(color) {
        console.warn(
            'The "color" attribute is deprecated. Use "--avonni-progress-circle-bar-color" styling hook instead.'
        );
    }

    /**
     * Controls which way the color flows from the top of the ring, either clockwise or counterclockwise Valid values include fill and drain.
     * The fill value corresponds to a color flow in the clockwise direction. The drain value indicates a color flow in the counterclockwise direction.
     *
     * @type {string}
     * @public
     * @default fill
     */
    @api
    get direction() {
        return this._direction;
    }

    set direction(direction) {
        this._direction = normalizeString(direction, {
            fallbackValue: PROGRESS_CIRCLE_DIRECTIONS.default,
            validValues: PROGRESS_CIRCLE_DIRECTIONS.valid
        });
    }

    /**
     * If present the progress bar displays a loading animation. The value goes from 0 to 100 repeatedly and the label displays a 3 dots animation. The value and labels become hidden.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get isLoading() {
        return this._isLoading;
    }

    set isLoading(loading) {
        this._isLoading = normalizeBoolean(loading);
    }

    /**
     * The size of the progress circle. Valid values include xx-small (26x26px), 'x-small' (40x40px), small (52x52px), medium (104x104px), large (152x152px) and x-large (208x208px).
     *
     * @type {string}
     * @public
     * @default medium
     */
    @api
    get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: PROGRESS_CIRCLE_SIZES.default,
            validValues: PROGRESS_CIRCLE_SIZES.valid
        });
    }

    /**
     * Set progress circle thickness. Valid values include x-small, small, medium, large and x-large.
     *
     * @type {string}
     * @public
     * @default medium
     */
    @api
    get thickness() {
        return this._thickness;
    }

    set thickness(thickness) {
        this._thickness = normalizeString(thickness, {
            fallbackValue: PROGRESS_CIRCLE_THICKNESSES.default,
            validValues: PROGRESS_CIRCLE_THICKNESSES.valid
        });
    }

    /**
     * Position of the title. Valid values include top and bottom.
     *
     * @type {string}
     * @public
     * @default bottom
     */
    @api
    get titlePosition() {
        return this._titlePosition;
    }

    set titlePosition(position) {
        this._titlePosition = normalizeString(position, {
            fallbackValue: TITLE_POSITIONS.default,
            validValues: TITLE_POSITIONS.valid
        });
    }

    /**
     * The percentage value of the progress circle.
     * The value must be a number from 0 to 100. A value of 50 corresponds to a color fill of half the ring in a clockwise or counterclockwise direction, depending on the direction attribute.
     *
     * @type {number}
     * @public
     * @default 0
     */
    @api
    get value() {
        return this._value;
    }

    set value(value) {
        const parsedValue = parseInt(value, 10);
        this._value = isNaN(parsedValue)
            ? DEFAULT_VALUE
            : Math.min(Math.max(parsedValue, 0), 100);
    }

    /**
     * Accepted variants include standard, value-hidden.
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
            fallbackValue: VALUE_VARIANTS.default,
            validValues: VALUE_VARIANTS.valid
        });
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Compute display fill for progress bar.
     *
     * @type {string}
     */
    get completeness() {
        let fillValue = Number(this.value);
        let isLong = this.value > 50 ? '1 1' : '0 1';

        if (this._direction === 'fill' && fillValue !== 100) {
            fillValue = 100 - this.value;
            isLong = this.value > 50 ? '1 0' : '0 0';
        }

        let arcX = Math.cos(2 * Math.PI * (fillValue / 100));
        let arcY = Math.sin(2 * Math.PI * (fillValue / 100));

        return 'M 1 0 A 1 1 0 ' + isLong + ' ' + arcX + ' ' + arcY + ' L 0 0';
    }

    /**
     * There is no label when isLoading is true.
     *
     * @type {boolean}
     */
    get labelPresent() {
        return this.label && !this.isLoading;
    }

    /**
     * Animate progress bar with continuous loading animation.
     *
     * @type {string}
     */
    get loading() {
        let previousValue = this._spinningValue;

        setTimeout(() => {
            if (previousValue < 100) {
                this._spinningValue += 2.5;
            } else {
                setTimeout(() => {
                    this._spinningValue = 0;
                }, 800);
            }
        }, 60);

        this._dots = Math.round(this._spinningValue / 33);

        let fillValue = this._spinningValue;
        let isLong = this._spinningValue > 50 ? '1 1' : '0 1';

        if (this._direction === 'fill' && fillValue !== 100) {
            fillValue = 100 - this._spinningValue;
            isLong = this._spinningValue > 50 ? '1 0' : '0 0';
        }

        let arcX = Math.cos(2 * Math.PI * (fillValue / 100));
        let arcY = Math.sin(2 * Math.PI * (fillValue / 100));

        return 'M 1 0 A 1 1 0 ' + isLong + ' ' + arcX + ' ' + arcY + ' L 0 0';
    }

    /**
     * Return loading dots animations . .. ... for isLoading animation.
     *
     * @type {string}
     */
    get loadingDots() {
        return '.'.repeat(this._dots);
    }

    /**
     * Compute display fill for progress bar.
     *
     * @type {string}
     */
    get progress() {
        return this.isLoading ? this.loading : this.completeness;
    }

    /**
     * Progress circle label class styling based on attributes.
     *
     * @type {string}
     */
    get progressLabelClass() {
        return `avonni-progress-circle__label slds-text-align_center slds-truncate avonni-progress-circle__label_size-${this._size}`;
    }

    /**
     * Progress circle class styling based on attributes.
     *
     * @type {string}
     */
    get progressRingClass() {
        return classSet('avonni-progress-circle')
            .add({
                'avonni-progress-circle__title_top': this.showPositionTop
            })
            .add(`avonni-progress-circle_size-${this._size}`)
            .toString();
    }

    /**
     * Progress circle content class styling based on attributes.
     *
     * @type {string}
     */
    get progressRingContentClass() {
        return classSet('avonni-progress-circle__content')
            .add(`avonni-progress-circle__content_size-${this._size}`)
            .add({
                'avonni-progress-circle_thickness-x-small-size-xx-small':
                    this._thickness === 'x-small' && this._size === 'xx-small',
                'avonni-progress-circle_thickness-small-size-xx-small':
                    this._thickness === 'small' && this._size === 'xx-small',
                'avonni-progress-circle_thickness-large-size-xx-small':
                    this._thickness === 'large' && this._size === 'xx-small',
                'avonni-progress-circle_thickness-x-large-size-xx-small':
                    this._thickness === 'x-large' && this._size === 'xx-small',
                'avonni-progress-circle_thickness-x-small-size-x-small':
                    this._thickness === 'x-small' && this._size === 'x-small',
                'avonni-progress-circle_thickness-small-size-x-small':
                    this._thickness === 'small' && this._size === 'x-small',
                'avonni-progress-circle_thickness-large-size-x-small':
                    this._thickness === 'large' && this._size === 'x-small',
                'avonni-progress-circle_thickness-x-large-size-x-small':
                    this._thickness === 'x-large' && this._size === 'x-small',
                'avonni-progress-circle_thickness-x-small-size-small':
                    this._thickness === 'x-small' && this._size === 'small',
                'avonni-progress-circle_thickness-small-size-small':
                    this._thickness === 'small' && this._size === 'small',
                'avonni-progress-circle_thickness-large-size-small':
                    this._thickness === 'large' && this._size === 'small',
                'avonni-progress-circle_thickness-x-large-size-small':
                    this._thickness === 'x-large' && this._size === 'small',
                'avonni-progress-circle_thickness-small-size-large':
                    this._thickness === 'small' && this._size === 'large',
                'avonni-progress-circle_thickness-large-size-large':
                    this._thickness === 'large' && this._size === 'large',
                'avonni-progress-circle_thickness-x-large-size-large':
                    this._thickness === 'x-large' && this._size === 'large',
                'avonni-progress-circle_thickness-small-size-x-large':
                    this._thickness === 'small' && this._size === 'x-large',
                'avonni-progress-circle_thickness-large-size-x-large':
                    this._thickness === 'large' && this._size === 'x-large',
                'avonni-progress-circle_thickness-x-large-size-x-large':
                    this._thickness === 'x-large' && this._size === 'x-large',
                'avonni-progress-circle_thickness-x-small':
                    this._thickness === 'x-small',
                'avonni-progress-circle_thickness-small':
                    this._thickness === 'small',
                'avonni-progress-circle_thickness-large':
                    this._thickness === 'large',
                'avonni-progress-circle_thickness-x-large':
                    this._thickness === 'x-large'
            })
            .toString();
    }

    /**
     * Progress circle title class styling based on attributes.
     *
     * @type {string}
     */
    get progressTitleClass() {
        return `avonni-progress-circle__title slds-text-align_center slds-truncate avonni-progress-circle__title_size-${this._size}`;
    }

    /**
     * Progress circle title top class styling based on attributes.
     *
     * @type {string}
     */
    get progressTitleClassTop() {
        const titleClass = this.progressTitleClass;
        return `${titleClass} avonni-progress-circle__title-top_size-${this._size}`;
    }

    /**
     * True if the title is on the top of the progress circle.
     *
     * @type {boolean}
     */
    get showPositionTop() {
        return this.titlePosition === 'top' && this.title;
    }

    /**
     * Verify if showing value.
     *
     * @type {string}
     */
    get showValue() {
        return this._variant === 'standard' && !this.isLoading;
    }
}
