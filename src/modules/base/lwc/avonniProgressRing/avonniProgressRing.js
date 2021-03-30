import { LightningElement, api } from 'lwc';
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';
import { classSet } from 'c/utils';

const validVariants = [
    'base',
    'active-step',
    'warning',
    'expired',
    'base-autocomplete'
];
const validDirections = ['fill', 'drain'];
const validSizes = ['medium', 'large'];

export default class AvonniProgressRing extends LightningElement {
    _direction = 'fill';
    _size = 'medium';
    _value = 0;
    _variant = 'base';
    _hideIcon = false;

    @api
    get direction() {
        return this._direction;
    }

    set direction(direction) {
        this._direction = normalizeString(direction, {
            fallbackValue: 'fill',
            validValues: validDirections
        });
    }

    @api
    get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: 'medium',
            validValues: validSizes
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
            fallbackValue: 'base',
            validValues: validVariants
        });
    }

    @api
    get hideIcon() {
        return this._hideIcon;
    }

    set hideIcon(value) {
        this._hideIcon = normalizeBoolean(value);
    }

    get computedOuterClass() {
        return classSet('slds-progress-ring')
            .add({
                'slds-progress-ring_large': this._size === 'large',
                'slds-progress-ring_warning': this._variant === 'warning',
                'slds-progress-ring_expired': this._variant === 'expired',
                'slds-progress-ring_active-step':
                    this._variant === 'active-step',
                'slds-progress-ring_complete':
                    this._variant === 'base-autocomplete' && this._value === 100
            })
            .toString();
    }

    get computedIconTheme() {
        return classSet('slds-icon_container').add({
            'slds-icon-utility-warning': this._variant === 'warning',
            'slds-icon-utility-error': this._variant === 'expired',
            'slds-icon-utility-check': this._variant === 'base-autocomplete'
        });
    }

    get d() {
        const fillPercent = this._value / 100;
        const filldrain = this.direction === 'drain' ? 1 : 0;
        const inverter = this.direction === 'drain' ? 1 : -1;
        const islong = fillPercent > 0.5 ? 1 : 0;
        const subCalc = 2 * Math.PI * fillPercent;
        const arcx = Math.cos(subCalc);
        const arcy = Math.sin(subCalc) * inverter;

        return `M 1 0 A 1 1 0 ${islong} ${filldrain} ${arcx} ${arcy} L 0 0`;
    }

    get computedAltText() {
        if (this.variant === 'warning') {
            return 'Warning';
        }
        if (this.variant === 'expired') {
            return 'Expired';
        }
        if (this.isComplete) {
            return 'Complete';
        }
        return undefined;
    }

    get iconName() {
        if (this._variant === 'warning') {
            return 'utility:warning';
        } else if (this._variant === 'expired') {
            return 'utility:error';
        } else if (this._variant === 'base-autocomplete') {
            return 'utility:check';
        }
        return null;
    }

    get iconPresence() {
        if (
            (this._variant === 'base-autocomplete' &&
                this._value === 100 &&
                this._hideIcon === false) ||
            (this._variant === 'warning' && this._hideIcon === false) ||
            (this._variant === 'expired' && this._hideIcon === false)
        ) {
            return true;
        }
        return false;
    }

    get showIcon() {
        return !this.hideIcon && this.iconPresence;
    }

    get showSlot() {
        return !this.iconPresence || (this.iconPresence && this.hideIcon);
    }
}
