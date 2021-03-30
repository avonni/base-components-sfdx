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

export default class AvonniAutoDataType extends LightningElement {
    @api card = {};
    @api label;
    @api fieldName;
    @api typeAttributes = {};

    _type = 'text';

    @api get type() {
        return this._type;
    }

    set type(value) {
        this._type = normalizeString(value, {
            fallbackValue: 'text',
            validValues: validTypes
        });
    }

    get value() {
        if (this.isBoolean) {
            return (
                this.card[this.fieldName] === 'true' ||
                this.card[this.fieldName]
            );
        }

        return this.card[this.fieldName];
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
