import { LightningElement, api } from 'lwc';
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';

const validSizes = ['xx-small', 'x-small', 'small', 'medium'];
const validVariants = [
    'bare',
    'container',
    'brand',
    'border',
    'border-filled',
    'bare-inverse',
    'border-inverse'
];

export default class AvonniButtonIconDialog extends LightningElement {
    @api accessKey;
    @api alternativeText;
    @api tooltip;
    @api iconClass;
    @api iconName;

    _disabled;
    _size = 'medium';
    _variant = 'border';

    @api get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: 'medium',
            validValues: validSizes
        });
    }

    @api get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: 'border',
            validValues: validVariants
        });
    }

    @api get disabled() {
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
