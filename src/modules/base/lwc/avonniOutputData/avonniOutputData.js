import { LightningElement, api } from 'lwc';
import { normalizeString } from 'c/utilsPrivate';

const validTypes = [
    'boolean',
    'currency',
    'date',
    'date-local',
    'email',
    'location',
    'number',
    'percent',
    'phone',
    'text',
    'url'
];

export default class AvonniOutputData extends LightningElement {
    @api label;
    @api typeAttributes = {};

    _type = 'text';
    _value;

    @api get type() {
        return this._type;
    }

    set type(value) {
        this._type = normalizeString(value, {
            fallbackValue: 'text',
            validValues: validTypes
        });
    }

    @api get value() {
        if (this.isBoolean) {
            return this._value === 'true' || this._value;
        }

        return this._value;
    }

    set value(value) {
        this._value = value;
    }

    get isBoolean() {
        return this.type === 'boolean';
    }

    get isCurrency() {
        return this.type === 'currency';
    }

    get isDate() {
        return this.type === 'date';
    }

    get isDateLocal() {
        return this.type === 'date-local';
    }

    get isEmail() {
        return this.type === 'email';
    }

    get isLocation() {
        return this.type === 'location';
    }

    get isNumber() {
        return this.type === 'number';
    }

    get isPercent() {
        return this.type === 'percent';
    }

    get isPhone() {
        return this.type === 'phone';
    }

    get isText() {
        return this.type === 'text';
    }

    get isUrl() {
        return this.type === 'url';
    }
}
