import { LightningElement, api } from 'lwc';
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';

const validVariants = [
    'base',
    'neutral',
    'brand',
    'brand-outline',
    'destructive',
    'destructive-text',
    'inverse',
    'success'
];
const validIconPositions = ['left', 'right'];

export default class AvonniButtonDialog extends LightningElement {
    @api accessKey;
    @api label;
    @api iconName;

    _disabled;
    _variant = 'neutral';
    _iconPosition = 'left';

    @api
    get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: 'border',
            validValues: validVariants
        });
    }

    @api
    get iconPosition() {
        return this._iconPosition;
    }

    set iconPosition(iconPosition) {
        this._iconPosition = normalizeString(iconPosition, {
            fallbackValue: 'left',
            validValues: validIconPositions
        });
    }

    @api
    get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    @api
    click() {
        let dialogSlot = this.template.querySelector('slot');

        if (dialogSlot.assignedElements().length !== 0) {
            dialogSlot.assignedElements()[0].show();
        }
    }

    @api
    focus() {
        this.template.querySelector('button').focus();
    }
}
