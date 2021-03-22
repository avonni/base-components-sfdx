import { LightningElement, api } from 'lwc';
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';

const validTypes = ['button', 'reset', 'submit'];

export default class AvonniSegmentButton extends LightningElement {
    @api label;
    @api iconName;
    @api prefixIconName;

    _value;
    _type = 'button';
    _disabled = false;

    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this.setAttribute('data-value', value);
    }

    @api get type() {
        return this._type;
    }

    set type(value) {
        this._type = normalizeString(value, {
            fallbackValue: 'button',
            validValues: validTypes
        });
    }

    @api get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    @api
    disableButton() {
        this._disabled = true;
    }

    handleButtonClick(event) {
        this.dispatchEvent(
            new CustomEvent('click', {
                bubbles: true,
                cancelable: true,
                detail: {
                    value: this.value
                }
            })
        );

        event.stopPropagation();
    }
}
