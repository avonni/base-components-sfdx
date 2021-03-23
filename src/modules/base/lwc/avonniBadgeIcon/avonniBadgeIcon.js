import { LightningElement, api } from 'lwc';
import { classSet } from 'c/utils';
import { normalizeString } from 'c/utilsPrivate';

const validVariants = ['base', 'lightest', 'inverse'];
const validIconPositions = ['left', 'right'];

export default class AvonniBadgeIcon extends LightningElement {
    @api iconName;
    @api label;

    _variant = 'base';
    _iconPosition = 'left';

    @api get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: 'base',
            validValues: validVariants
        });
    }

    @api get iconPosition() {
        return this._iconPosition;
    }

    set iconPosition(position) {
        this._iconPosition = normalizeString(position, {
            fallbackValue: 'left',
            validValues: validIconPositions
        });
    }

    get badgeClass() {
        return classSet('slds-badge')
            .add({
                'slds-badge_inverse': this.variant === 'inverse',
                'slds-badge_lightest': this.variant === 'lightest'
            })
            .toString();
    }

    get positionLeft() {
        return this.iconPosition === 'left' && this.iconName;
    }

    get positionRight() {
        return this.iconPosition === 'right' && this.iconName;
    }

    get getIconVariant() {
        return this.variant === 'inverse' ? 'inverse' : '';
    }

    get iconClass() {
        return classSet('slds-badge__icon')
            .add({
                'slds-badge__icon_left': this.positionLeft && this.label,
                'slds-badge__icon_right': this.positionRight && this.label
            })
            .toString();
    }
}
