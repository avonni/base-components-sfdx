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
    normalizeArray
} from 'c/utilsPrivate';
import { classSet } from 'c/utils';
import progressBar from './avonniProgressBar.html';
import progressBarVertical from './avonniProgressBarVertical.html';

const DEFAULT_VALUE = 0;

const PROGRESS_BAR_SIZES = {
    valid: ['x-small', 'small', 'medium', 'large', 'full'],
    default: 'full'
};

const VALUE_POSITIONS = {
    valid: [
        'left',
        'right',
        'top-right',
        'top-left',
        'bottom-right',
        'bottom-left'
    ],
    default: 'top-right'
};

const PROGRESS_BAR_VARIANTS = { valid: ['base', 'circular'], default: 'base' };

const PROGRESS_BAR_THEMES = {
    valid: [
        'base',
        'success',
        'inverse',
        'alt-inverse',
        'warning',
        'info',
        'error',
        'offline'
    ],
    default: 'base'
};

const PROGRESS_BAR_THICKNESSES = {
    valid: ['x-small', 'small', 'medium', 'large'],
    default: 'medium'
};

const PROGRESS_BAR_ORIENTATIONS = {
    valid: ['horizontal', 'vertical'],
    default: 'horizontal'
};

/**
 * @class
 * @descriptor avonni-progress-bar
 * @storyId example-progress-bar--base
 * @public
 */
export default class AvonniProgressBar extends LightningElement {
    /**
     * Label for the progress bar.
     *
     * @type {string}
     * @public
     */
    @api label;
    /**
     * Text display next to the value.
     *
     * @type {string}
     * @public
     */
    @api valueLabel;

    _orientation = PROGRESS_BAR_ORIENTATIONS.default;
    _referenceLines = [];
    _showValue = false;
    _size = PROGRESS_BAR_SIZES.default;
    _textured = false;
    _theme = PROGRESS_BAR_THEMES.default;
    _thickness = PROGRESS_BAR_THICKNESSES.default;
    _value = DEFAULT_VALUE;
    _valuePosition = VALUE_POSITIONS.default;
    _variant = PROGRESS_BAR_VARIANTS.default;

    /**
     * Render the progress bar depending on its orientation.
     *
     * @returns {File} progressBar.html | progressBarVertical.html
     */
    render() {
        if (this._orientation === 'horizontal') {
            return progressBar;
        }
        return progressBarVertical;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Orientation of the progress bar to be used. Valid values include horizontal and vertical.
     *
     * @type {string}
     * @public
     * @default horizontal
     */
    @api
    get orientation() {
        return this._orientation;
    }

    set orientation(orientation) {
        this._orientation = normalizeString(orientation, {
            fallbackValue: PROGRESS_BAR_ORIENTATIONS.default,
            validValues: PROGRESS_BAR_ORIENTATIONS.valid
        });
    }

    /**
     * Array of reference lines objects.
     *
     * @type {object[]}
     * @public
     */
    @api
    get referenceLines() {
        return this._referenceLines;
    }

    set referenceLines(value) {
        this._referenceLines = normalizeArray(value);
    }

    /**
     * The size of the progress bar. Valid values are x-small, small, medium, large and full.
     *
     * @type {string}
     * @public
     * @default full
     */
    @api
    get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: PROGRESS_BAR_SIZES.default,
            validValues: PROGRESS_BAR_SIZES.valid
        });
    }

    /**
     * If present, display the value.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get showValue() {
        return this._showValue;
    }

    set showValue(value) {
        this._showValue = normalizeBoolean(value);
    }

    /**
     * If present, display a texture background.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get textured() {
        return this._textured;
    }

    set textured(value) {
        this._textured = normalizeBoolean(value);
    }

    /**
     * Defines the theme of the progress bar. Valid values includes base, success, inverse, alt-inverse, warning, info, error and offline.
     *
     * @type {string}
     * @public
     * @default base
     */
    @api
    get theme() {
        return this._theme;
    }

    set theme(theme) {
        this._theme = normalizeString(theme, {
            fallbackValue: PROGRESS_BAR_THEMES.default,
            validValues: PROGRESS_BAR_THEMES.valid
        });
    }

    /**
     * Set progress bar thickness. Valid values include x-small, small, medium and large.
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
            fallbackValue: PROGRESS_BAR_THICKNESSES.default,
            validValues: PROGRESS_BAR_THICKNESSES.valid
        });
    }

    /**
     * The percentage value of the progress bar.
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
        if (parseInt(value, 10) <= 0) {
            this._value = 0;
        } else if (parseInt(value, 10) > 100) {
            this._value = 100;
        } else if (isNaN(parseInt(value, 10))) {
            this._value = DEFAULT_VALUE;
        } else {
            this._value = parseInt(value, 10);
        }
    }

    /**
     * Position of the value if present. Valid values include left, right, top-right, top-left, bottom-right and bottom-left.
     *
     * @type {string}
     * @public
     * @default top-right
     */
    @api
    get valuePosition() {
        return this._valuePosition;
    }

    set valuePosition(valuePosition) {
        this._valuePosition = normalizeString(valuePosition, {
            fallbackValue: VALUE_POSITIONS.default,
            validValues: VALUE_POSITIONS.valid
        });
    }

    /**
     * The variant changes the appearance of the progress bar. Accepted variants include base or circular.
     *
     * @type {string}
     * @public
     * @default base
     */
    @api
    get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: PROGRESS_BAR_VARIANTS.default,
            validValues: PROGRESS_BAR_VARIANTS.valid
        });
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Computed Sizing class for the progress bar.
     *
     * @type {string}
     */
    get computedSizing() {
        return classSet('')
            .add({
                'avonni-progress-bar__bar-horizontal_size-x-small':
                    this._size === 'x-small' &&
                    this._orientation === 'horizontal',
                'avonni-progress-bar__bar-horizontal_size-small':
                    this._size === 'small' &&
                    this._orientation === 'horizontal',
                'avonni-progress-bar__bar-horizontal_size-medium':
                    this._size === 'medium' &&
                    this._orientation === 'horizontal',
                'avonni-progress-bar__bar-horizontal_size-large':
                    this._size === 'large' &&
                    this._orientation === 'horizontal',
                'avonni-progress-bar__vertical-bar_size-x-small':
                    this._size === 'x-small' &&
                    this._orientation === 'vertical',
                'avonni-progress-bar__vertical-bar_size-small':
                    this._size === 'small' && this._orientation === 'vertical',
                'avonni-progress-bar__vertical-bar_size-medium':
                    this._size === 'medium' && this._orientation === 'vertical',
                'avonni-progress-bar__vertical-bar_size-large':
                    this._size === 'large' && this._orientation === 'vertical',
                'avonni-progress-bar__vertical-bar_size-full':
                    (this._size === 'full') &
                    (this._orientation === 'vertical'),
                'slds-grid slds-grid_align-center':
                    this.orientation === 'vertical'
            })
            .toString();
    }

    /**
     * Computed Outer class styling.
     *
     * @type {string}
     */
    get computedOuterClass() {
        return classSet('slds-progress-bar slds-text-align_center')
            .add({
                'slds-progress-bar_vertical': this._orientation === 'vertical',
                'slds-progress-bar_circular': this._variant === 'circular',
                'slds-progress-bar_x-small': this._thickness === 'x-small',
                'slds-progress-bar_small': this._thickness === 'small',
                'slds-progress-bar_large': this._thickness === 'large'
            })
            .add(`avonni-progress-bar__bar-background_theme-${this._theme}`)
            .add({
                'slds-m-bottom_large': this._referenceLines.length > 0
            })
            .toString();
    }

    /**
     * Computed Inner class styling based on selected attributes.
     *
     * @type {string}
     */
    get computedInnerClass() {
        // for the progressBar in vertical we need to set a height on the outer div and inner div
        return classSet('slds-progress-bar__value')
            .add(`avonni-progress-bar__bar_theme-${this._theme}`)
            .add({
                'avonni-progress-bar__vertical-bar_size-x-small':
                    this._size === 'x-small' &&
                    this._orientation === 'vertical',
                'avonni-progress-bar__vertical-bar_size-small':
                    this._size === 'small' && this._orientation === 'vertical',
                'avonni-progress-bar__vertical-bar_size-medium':
                    this._size === 'medium' && this._orientation === 'vertical',
                'avonni-progress-bar__vertical-bar_size-large':
                    this._size === 'large' && this._orientation === 'vertical',
                'slds-theme_alert-texture': this._textured
            })
            .toString();
    }

    /**
     * Return assistive text.
     *
     * @type {string}
     */
    get assistiveText() {
        return `Progress: ${this._value}%`;
    }

    /**
     * Computed orientation width or height depending on vertical or horizontal display.
     *
     * @type {string}
     */
    get computedStyle() {
        return this._orientation === 'horizontal'
            ? `width: ${this._value}%`
            : `height: ${this._value}%`;
    }

    /**
     * Verify Show position left.
     *
     * @type {string | boolean}
     */
    get showPositionLeft() {
        return this._valuePosition === 'left' && this._showValue;
    }

    /**
     * Verify Show position right.
     *
     * @type {string | boolean}
     */
    get showPositionRight() {
        return this._valuePosition === 'right' && this._showValue;
    }

    /**
     * Verify Show position top right.
     *
     * @type {string | boolean}
     */
    get showPositionTopRight() {
        return this._valuePosition === 'top-right' && this._showValue;
    }

    /**
     * Verify Show position top left.
     *
     * @type {string | boolean}
     */
    get showPositionTopLeft() {
        return this._valuePosition === 'top-left' && this._showValue;
    }

    /**
     * Verify Show position bottom right.
     *
     * @type {string | boolean}
     */
    get showPositionBottomRight() {
        return this._valuePosition === 'bottom-right' && this._showValue;
    }

    /**
     * Verify Show position bottom left.
     *
     * @type {string | boolean}
     */
    get showPositionBottomLeft() {
        return this._valuePosition === 'bottom-left' && this._showValue;
    }

    /**
     * Verify Show position bottom.
     *
     * @type {boolean}
     */
    get showPositionBottom() {
        return this.showPositionBottomLeft || this.showPositionBottomRight;
    }

    /**
     * Verify Show position top.
     *
     * @type {string | boolean}
     */
    get showPositionTop() {
        return (
            this.showPositionTopLeft || this.showPositionTopRight || this.label
        );
    }
}
