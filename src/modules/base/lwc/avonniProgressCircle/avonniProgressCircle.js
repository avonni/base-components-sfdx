import { LightningElement, api } from 'lwc';
import { normalizeString, normalizeBoolean } from 'c/utilsPrivate';
import { classSet } from 'c/utils';

const VARIANTS = { valid: ['standard', 'value-hidden'], default: 'standard' };
const DIRECTIONS = { valid: ['fill', 'drain'], default: 'fill' };
const SIZES = {
    valid: ['x-small', 'small', 'medium', 'large', 'x-large'],
    default: 'medium'
};
const TITLE_POSITIONS = { valid: ['top', 'bottom'], default: 'bottom' };
const DEFAULT_COLOR = '#1589ee';

export default class AvonniProgressCircle extends LightningElement {
    @api title;
    @api label;

    _titlePosition = 'bottom';
    _value = 0;
    _variant = 'standard';
    _direction = 'fill';
    _size = 'medium';
    _thickness = 'medium';
    _round = false;
    _color = DEFAULT_COLOR;

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

    @api
    get value() {
        return this._value;
    }

    set value(value) {
        if (value < 0) {
            this._value = 0;
        } else if (value > 100) {
            this._value = 100;
        } else {
            this._value = value;
        }
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
    get direction() {
        return this._direction;
    }

    set direction(direction) {
        this._direction = normalizeString(direction, {
            fallbackValue: DIRECTIONS.default,
            validValues: DIRECTIONS.valid
        });
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
    get thickness() {
        return this._thickness;
    }

    set thickness(thickness) {
        this._thickness = normalizeString(thickness, {
            fallbackValue: SIZES.default,
            validValues: SIZES.valid
        });
    }

    @api
    get round() {
        return this._round;
    }

    set round(value) {
        this._round = normalizeBoolean(value);
    }

    @api
    get color() {
        return this._color;
    }

    set color(color) {
        if (typeof color === 'string') {
            let styles = new Option().style;
            styles.color = color;

            if (
                styles.color === color ||
                this.isHexColor(color.replace('#', ''))
            ) {
                this._color = color;
            }
        } else {
            this._color = DEFAULT_COLOR;
        }
    }

    isHexColor(hex) {
        return (
            typeof hex === 'string' &&
            hex.length === 6 &&
            !isNaN(Number('0x' + hex))
        );
    }

    get progressRingClass() {
        return classSet('avonni-progress-ring')
            .add({
                'avonni-progress-ring-with-title-top':
                    this._titlePosition === 'top',
                'avonni-progress-x-small': this._size === 'x-small',
                'avonni-progress-small': this._size === 'small',
                'avonni-progress-medium': this._size === 'medium',
                'avonni-progress-large': this._size === 'large',
                'avonni-progress-x-large': this._size === 'x-large'
            })
            .toString();
    }

    get progressRingContentClass() {
        return classSet('avonni-progress-content')
            .add({
                'avonni-progress-content-x-small': this._size === 'x-small',
                'avonni-progress-content-small': this._size === 'small',
                'avonni-progress-content-medium': this._size === 'medium',
                'avonni-progress-content-large': this._size === 'large',
                'avonni-progress-content-x-large': this._size === 'x-large'
            })
            .add({
                'avonni-progress-thickness-x-small-size-x-small':
                    this._thickness === 'x-small' && this._size === 'x-small',
                'avonni-progress-thickness-small-size-x-small':
                    this._thickness === 'small' && this._size === 'x-small',
                'avonni-progress-thickness-large-size-x-small':
                    this._thickness === 'large' && this._size === 'x-small',
                'avonni-progress-thickness-x-large-size-x-small':
                    this._thickness === 'x-large' && this._size === 'x-small',
                'avonni-progress-thickness-x-small-size-small':
                    this._thickness === 'x-small' && this._size === 'small',
                'avonni-progress-thickness-small-size-small':
                    this._thickness === 'small' && this._size === 'small',
                'avonni-progress-thickness-large-size-small':
                    this._thickness === 'large' && this._size === 'small',
                'avonni-progress-thickness-x-large-size-small':
                    this._thickness === 'x-large' && this._size === 'small',
                'avonni-progress-thickness-small-size-large':
                    this._thickness === 'small' && this._size === 'large',
                'avonni-progress-thickness-large-size-large':
                    this._thickness === 'large' && this._size === 'large',
                'avonni-progress-thickness-x-large-size-large':
                    this._thickness === 'x-large' && this._size === 'large',
                'avonni-progress-thickness-small-size-x-large':
                    this._thickness === 'small' && this._size === 'x-large',
                'avonni-progress-thickness-large-size-x-large':
                    this._thickness === 'large' && this._size === 'x-large',
                'avonni-progress-thickness-x-large-size-x-large':
                    this._thickness === 'x-large' && this._size === 'x-large',
                'avonni-progress-thickness-x-small':
                    this._thickness === 'x-small',
                'avonni-progress-thickness-small': this._thickness === 'small',
                'avonni-progress-thickness-large': this._thickness === 'large',
                'avonni-progress-thickness-x-large':
                    this._thickness === 'x-large'
            })
            .toString();
    }

    get progressTitleClass() {
        return classSet(
            'slds-grid slds-grid_align-center slds-text-align_center'
        )
            .add({
                'avonni-progress-title-x-small': this._size === 'x-small',
                'avonni-progress-title-small': this._size === 'small',
                'avonni-progress-title-medium': this._size === 'medium',
                'avonni-progress-title-large': this._size === 'large',
                'avonni-progress-title-x-large': this._size === 'x-large'
            })
            .toString();
    }

    get progressTitleClassTop() {
        return classSet(
            'slds-grid slds-grid_align-center slds-text-align_center avonni-progress-title-position-top'
        )
            .add({
                'avonni-progress-title-top-x-small': this._size === 'x-small',
                'avonni-progress-title-top-small': this._size === 'small',
                'avonni-progress-title-top-medium': this._size === 'medium',
                'avonni-progress-title-top-large': this._size === 'large',
                'avonni-progress-title-top-x-large': this._size === 'x-large'
            })
            .toString();
    }

    get progressLabelClass() {
        return classSet('slds-text-align_center avonni-progress-label-style')
            .add({
                'avonni-progress-label-style-x-small': this._size === 'x-small',
                'avonni-progress-label-style-small': this._size === 'small',
                'avonni-progress-label-style-medium': this._size === 'medium',
                'avonni-progress-label-style-large': this._size === 'large',
                'avonni-progress-label-style-x-large': this._size === 'x-large'
            })
            .toString();
    }

    get showValue() {
        return this._variant === 'standard';
    }

    get progressValueStyles() {
        return `color: ${this.color}`;
    }

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

    get showPositionBottom() {
        return this._titlePosition === 'bottom';
    }
}
