import { LightningElement, api } from 'lwc';
import { normalizeString } from 'c/utilsPrivate';
import { classSet } from 'c/utils';

const validVariants = ['standard', 'value-hidden'];
const validDirections = ['fill', 'drain'];
const validSizes = ['x-small', 'small', 'medium', 'large', 'x-large'];

export default class AvonniProgressCircle extends LightningElement {
    @api label;

    _value = 0;
    _variant = 'standard';
    _direction = 'fill';
    _size = 'medium';
    _color = '#1589ee';

    @api get value() {
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

    @api get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: 'standard',
            validValues: validVariants
        });
    }

    @api get direction() {
        return this._direction;
    }

    set direction(direction) {
        this._direction = normalizeString(direction, {
            fallbackValue: 'fill',
            validValues: validDirections
        });
    }

    @api get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: 'medium',
            validValues: validSizes
        });
    }

    @api get color() {
        return this._color;
    }

    set color(color) {
        let styles = new Option().style;
        styles.color = color;

        if (styles.color === color || this.isHexColor(color.replace('#', ''))) {
            this._color = color;
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
            .toString();
    }

    get progressLabelClass() {
        return classSet('slds-grid slds-grid_align-center')
            .add({
                'avonni-progress-label-x-small': this._size === 'x-small',
                'avonni-progress-label-small': this._size === 'small',
                'avonni-progress-label-medium': this._size === 'medium',
                'avonni-progress-label-large': this._size === 'large',
                'avonni-progress-label-x-large': this._size === 'x-large'
            })
            .toString();
    }

    get showValue() {
        return this._variant === 'standard';
    }

    get progressLabelStyles() {
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
}
