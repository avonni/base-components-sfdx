import { LightningElement, api } from 'lwc';
import { classSet } from 'c/utils';
import { normalizeString } from 'c/utilsPrivate';

const VARIANTS = {
    valid: ['default', 'darker', 'success', 'warning', 'error', 'lightest'],
    default: 'default'
};

const BORDER_STYLES = {
    valid: ['solid', 'dashed', 'dotted', 'none'],
    default: 'dotted'
};

const ORIENTATION = {
    valid: ['horizontal', 'vertical'],
    default: 'horizontal'
};

export default class AvonniPrimitiveProgressBarReferenceLine extends LightningElement {
    @api label;
    @api thickness;

    _value = 0;
    _variant = 'default';
    _borderStyle = 'none';
    _orientation = 'horizontal';

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
        } else this._value = 0;
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
    get borderStyle() {
        return this._borderStyle;
    }

    set borderStyle(borderStyle) {
        this._borderStyle = normalizeString(borderStyle, {
            fallbackValue: BORDER_STYLES.default,
            validValues: BORDER_STYLES.valid
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

    get isHorizontal() {
        return this._orientation === 'horizontal';
    }

    get computedBadgeClass() {
        return classSet('avonni-progress-bar-reference-line')
            .add({
                'avonni-progress-bar-reference-line_inverse':
                    this._variant === 'darker',
                'avonni-progress-bar-reference-line_lightest':
                    this._variant === 'lightest',
                'avonni-progress-bar-reference-line_success':
                    this._variant === 'success',
                'avonni-progress-bar-reference-line_warning':
                    this._variant === 'warning',
                'avonni-progress-bar-reference-line_error':
                    this._variant === 'error'
            })
            .toString();
    }

    get computedOuterClass() {
        return classSet('')
            .add({
                'avonni-progress-bar-marker': this.isHorizontal
            })
            .add({
                'avonni-progress-bar-reference-line-border-style_dashed':
                    this._borderStyle === 'dashed' && this.isHorizontal,
                'avonni-progress-bar-reference-line-border-style_solid':
                    this._borderStyle === 'solid' && this.isHorizontal,
                'avonni-progress-bar-reference-line-border-style_dotted':
                    this._borderStyle === 'dotted' && this.isHorizontal
            })
            .add({
                'avonni-progress-bar-reference-line-border-thickness_x-small':
                    this.thickness === 'x-small' && this.isHorizontal,
                'avonni-progress-bar-reference-line-border-thickness_small':
                    this.thickness === 'small' && this.isHorizontal,
                'avonni-progress-bar-reference-line-border-thickness_large':
                    this.thickness === 'large' && this.isHorizontal
            })
            .add({
                'avonni-progress-bar-reference-line-border-color_darker':
                    this._variant === 'darker',
                'avonni-progress-bar-reference-line-border-color_success':
                    this._variant === 'success',
                'avonni-progress-bar-reference-line-border-color_warning':
                    this._variant === 'warning',
                'avonni-progress-bar-reference-line-border-color_error':
                    this._variant === 'error',
                'avonni-progress-bar-reference-line-border-color_lightest':
                    this._variant === 'lightest'
            })
            .add({
                'avonni-progress-bar-marker-vertical': !this.isHorizontal
            })
            .add({
                'avonni-progress-bar-reference-line-border-vertical-style_dashed':
                    this._borderStyle === 'dashed' && !this.isHorizontal,
                'avonni-progress-bar-reference-line-border-vertical-style_solid':
                    this._borderStyle === 'solid' && !this.isHorizontal,
                'avonni-progress-bar-reference-line-border-vertical-style_dotted':
                    this._borderStyle === 'dotted' && !this.isHorizontal
            })
            .add({
                'avonni-progress-bar-reference-line-border-thickness-vertical_x-small':
                    this.thickness === 'x-small' && !this.isHorizontal,
                'avonni-progress-bar-reference-line-border-thickness-vertical_small':
                    this.thickness === 'small' && !this.isHorizontal,
                'avonni-progress-bar-reference-line-border-thickness-vertical_large':
                    this.thickness === 'large' && !this.isHorizontal
            })
            .add({
                'avonni-progress-bar-reference-line-border-vertical-color_darker':
                    this._variant === 'darker',
                'avonni-progress-bar-reference-line-border-vertical-color_success':
                    this._variant === 'success',
                'avonni-progress-bar-reference-line-border-vertical-color_warning':
                    this._variant === 'warning',
                'avonni-progress-bar-reference-line-border-vertical-color_error':
                    this._variant === 'error',
                'avonni-progress-bar-reference-line-border-vertical-color_lightest':
                    this._variant === 'lightest'
            })
            .toString();
    }

    get computedStyle() {
        return this.isHorizontal
            ? `width: ${this._value}%`
            : `height: ${this._value}%`;
    }
}
