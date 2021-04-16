import { LightningElement, api } from 'lwc';
import {
    normalizeBoolean,
    normalizeString,
    normalizeArray
} from 'c/utilsPrivate';
import { classSet } from 'c/utils';
import progressBar from './avonniProgressBar.html';
import progressBarVertical from './avonniProgressBarVertical.html';

const SIZES = {
    valid: ['x-small', 'small', 'medium', 'large', 'full'],
    default: 'full'
};

const POSITIONS = {
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

const VARIANTS = { valid: ['base', 'circular'], default: 'base' };

const THEMES = {
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

const THICKNESS = {
    valid: ['x-small', 'small', 'medium', 'large'],
    default: 'medium'
};

const ORIENTATION = {
    valid: ['horizontal', 'vertical'],
    default: 'horizontal'
};

export default class AvonniProgressBar extends LightningElement {
    @api label;
    @api valueLabel;

    _size = 'full';
    _value = 0;
    _showValue = false;
    _valuePosition = 'top-right';
    _referenceLines = [];
    _variant = 'base';
    _theme = 'base';
    _textured = false;
    _thickness = 'medium';
    _orientation = 'horizontal';

    // render the progress bar depending on its orientation
    render() {
        if (this._orientation === 'horizontal') {
            return progressBar;
        }
        return progressBarVertical;
    }

    @api
    get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: SIZES.default,
            validValues: SIZES.valid
        });
    }

    @api
    get value() {
        return this._value;
    }

    set value(value) {
        if (typeof value === 'number') {
            if (value <= 0) {
                this._value = 0;
            } else if (value > 100) {
                this._value = 100;
            } else {
                this._value = value;
            }
        } else {
            this._value = 0;
        }
    }

    @api
    get showValue() {
        return this._showValue;
    }

    set showValue(value) {
        this._showValue = normalizeBoolean(value);
    }

    @api
    get valuePosition() {
        return this._valuePosition;
    }

    set valuePosition(valuePosition) {
        this._valuePosition = normalizeString(valuePosition, {
            fallbackValue: POSITIONS.default,
            validValues: POSITIONS.valid
        });
    }

    @api
    get referenceLines() {
        return this._referenceLines;
    }

    set referenceLines(value) {
        this._referenceLines = normalizeArray(value);
    }

    @api
    get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: VARIANTS.default,
            validValues: VARIANTS.valid
        });
    }

    @api
    get theme() {
        return this._theme;
    }

    set theme(theme) {
        this._theme = normalizeString(theme, {
            fallbackValue: THEMES.default,
            validValues: THEMES.valid
        });
    }

    @api
    get textured() {
        return this._textured;
    }

    set textured(value) {
        this._textured = normalizeBoolean(value);
    }

    @api
    get thickness() {
        return this._thickness;
    }

    set thickness(thickness) {
        this._thickness = normalizeString(thickness, {
            fallbackValue: THICKNESS.default,
            validValues: THICKNESS.valid
        });
    }

    @api
    get orientation() {
        return this._orientation;
    }

    set orientation(orientation) {
        this._orientation = normalizeString(orientation, {
            fallbackValue: ORIENTATION.default,
            validValues: ORIENTATION.valid
        });
    }

    get computedSizing() {
        return classSet('')
            .add({
                'avonni-progress-bar-horizontal-size_x-small':
                    this._size === 'x-small' &&
                    this._orientation === 'horizontal',
                'avonni-progress-bar-horizontal-size_small':
                    this._size === 'small' &&
                    this._orientation === 'horizontal',
                'avonni-progress-bar-horizontal-size_medium':
                    this._size === 'medium' &&
                    this._orientation === 'horizontal',
                'avonni-progress-bar-horizontal-size_large':
                    this._size === 'large' &&
                    this._orientation === 'horizontal',
                'avonni-progress-bar-vertical-size_x-small':
                    this._size === 'x-small' &&
                    this._orientation === 'vertical',
                'avonni-progress-bar-vertical-size_small':
                    this._size === 'small' && this._orientation === 'vertical',
                'avonni-progress-bar-vertical-size_medium':
                    this._size === 'medium' && this._orientation === 'vertical',
                'avonni-progress-bar-vertical-size_large':
                    this._size === 'large' && this._orientation === 'vertical',
                'avonni-progress-bar-vertical-size_full':
                    (this._size === 'full') & (this._orientation === 'vertical')
            })
            .toString();
    }

    get computedOuterClass() {
        return classSet('slds-progress-bar slds-text-align_center')
            .add({
                'slds-progress-bar_vertical': this._orientation === 'vertical',
                'slds-progress-bar_circular': this.variant === 'circular',
                'slds-progress-bar_x-small': this._thickness === 'x-small',
                'slds-progress-bar_small': this._thickness === 'small',
                'slds-progress-bar_large': this._thickness === 'large'
            })
            .toString();
    }

    // for the progressBar in vertical we need to set a height on the outer div and inner div
    get computedInnerClass() {
        return classSet('slds-progress-bar__value')
            .add({
                'slds-progress-bar__value_success': this._theme === 'success',
                'slds-theme_inverse': this._theme === 'inverse',
                'slds-theme_alt-inverse': this._theme === 'alt-inverse',
                'slds-theme_warning': this.theme === 'warning',
                'slds-theme_info': this._theme === 'info',
                'slds-theme_error': this._theme === 'error',
                'slds-theme_offline': this._theme === 'offline',
                'avonni-progress-bar-vertical-size_x-small':
                    this._size === 'x-small' &&
                    this._orientation === 'vertical',
                'avonni-progress-bar-vertical-size_small':
                    this._size === 'small' && this._orientation === 'vertical',
                'avonni-progress-bar-vertical-size_medium':
                    this._size === 'medium' && this._orientation === 'vertical',
                'avonni-progress-bar-vertical-size_large':
                    this._size === 'large' && this._orientation === 'vertical',
                'slds-theme_alert-texture': this._textured === true
            })
            .toString();
    }

    get assistiveText() {
        return `Progress: ${this._value}%`;
    }

    get isHorizontal() {
        return this._orientation === 'horizontal';
    }

    get computedStyle() {
        return this._orientation === 'horizontal'
            ? `width: ${this._value}%`
            : `height: ${this._value}%`;
    }

    get showPositionLeft() {
        return this._valuePosition === 'left' && this._showValue;
    }

    get showPositionRight() {
        return this._valuePosition === 'right' && this._showValue;
    }

    get showPositionTopRight() {
        return this._valuePosition === 'top-right' && this._showValue;
    }

    get showPositionTopLeft() {
        return this._valuePosition === 'top-left' && this._showValue;
    }

    get showPositionBottomRight() {
        return this._valuePosition === 'bottom-right' && this._showValue;
    }

    get showPositionBottomLeft() {
        return this._valuePosition === 'bottom-left' && this._showValue;
    }

    get showPositionBottom() {
        return this.showPositionBottomLeft || this.showPositionBottomRight;
    }

    get showPositionTop() {
        return (
            this.showPositionTopLeft || this.showPositionTopRight || this.label
        );
    }
}
