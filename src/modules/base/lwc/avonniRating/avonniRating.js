import { LightningElement, api } from 'lwc';
import { normalizeString, normalizeBoolean } from 'c/utilsPrivate';
import { generateUniqueId, classSet } from 'c/utils';

const VALID_SELECTIONS = {
    valid: ['continuous', 'single'],
    default: 'continues'
};

const VALID_SIZES = {
    valid: ['x-small', 'small', 'medium', 'large'],
    default: 'large'
};

const VALID_LABEL_VARIANTS = {
    valid: ['standard', 'label-inline', 'label-hidden', 'label-stacked'],
    default: 'standard'
};

const DEFAULT_MIN = 1;
const DEFAULT_MAX = 5;
const DEFAULT_VARIANT = 'standard';
const DEFAULT_ICON_SIZE = 'large';
const DEFAULT_SELECTION = 'continuous';

export default class AvonniRating extends LightningElement {
    @api label;
    @api fieldLevelHelp;
    @api name = generateUniqueId();
    @api iconName;

    _min = DEFAULT_MIN;
    _max = DEFAULT_MAX;
    _value;
    _variant = DEFAULT_VARIANT;
    _iconSize = DEFAULT_ICON_SIZE;
    _selection = DEFAULT_SELECTION;
    _disabled;
    _readOnly;
    _valueHidden;
    init = false;
    initStyles = false;

    renderedCallback() {
        this.ratingRecalculation();

        if (!this.initStyles) {
            let selectedIcons = this.template.querySelector(
                'lightning-button-icon'
            );

            if (selectedIcons) {
                const style = document.createElement('style');
                style.innerText = `
                    .avonni-icon-selected .slds-button:disabled svg {fill: #a5a4a2;}
                    .avonni-icon-selected svg {fill: #1b5297 !important;}
                    .avonni-rating:hover .avonni-active-star.avonni-continuous-star:not(:hover) svg {
                        fill: #c9c7c5;
                        opacity: 0.85;
                    }
                    .avonni-rating:hover .avonni-active-star:hover svg{
                        fill: #1b5297;
                        opacity: 1;
                    }
                    .avonni-active-star.avonni-continuous-star svg {
                        fill: #c9c7c5;
                    }
                    .avonni-active-star.avonni-continuous-star:hover svg,
                    .avonni-active-star.avonni-continuous-star:hover ~ .avonni-active-star.avonni-continuous-star svg {
                        fill: #1b5297 !important;
                        opacity: 1 !important;
                    }
                    .avonni-icon button, 
                    .avonni-icon button:active, 
                    .avonni-icon button:focus {
                        box-shadow: none;
                    }
                    .avonni-icon.avonni-active-star svg {
                        fill: #c9c7c5;
                    }
                `;
                selectedIcons.appendChild(style);
                this.initStyles = true;
            }
        }

        this.init = true;
    }

    @api
    get min() {
        return this._min;
    }

    set min(value) {
        this._min = typeof value === 'number' ? Number(value) : DEFAULT_MIN;

        if (this.init) {
            this.ratingRecalculation();
        }
    }

    @api
    get max() {
        return this._max;
    }

    set max(value) {
        this._max = typeof value === 'number' ? Number(value) : DEFAULT_MAX;

        if (this.init) {
            this.ratingRecalculation();
        }
    }

    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = Number(value);

        if (this.init) {
            this.ratingRecalculation();
        }
    }

    @api
    get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            defaultValue: VALID_LABEL_VARIANTS.default,
            validValues: VALID_LABEL_VARIANTS.valid
        });
    }

    @api
    get iconSize() {
        return this._iconSize;
    }

    set iconSize(size) {
        this._iconSize = normalizeString(size, {
            defaultValue: VALID_SIZES.default,
            validValues: VALID_SIZES.valid
        });
    }

    @api
    get selection() {
        return this._selection;
    }

    set selection(selection) {
        this._selection = normalizeString(selection, {
            fallbackValue: VALID_SELECTIONS.default,
            validValues: VALID_SELECTIONS.valid
        });

        if (this.init) {
            this.ratingRecalculation();
        }
    }

    @api
    get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);

        if (this.init) {
            this.ratingRecalculation();
        }
    }

    @api
    get readOnly() {
        return this._readOnly;
    }

    set readOnly(value) {
        this._readOnly = normalizeBoolean(value);

        if (this.init) {
            this.ratingRecalculation();
        }
    }

    @api
    get valueHidden() {
        return this._valueHidden;
    }

    set valueHidden(value) {
        this._valueHidden = normalizeBoolean(value);
    }

    get showRating() {
        return !this._valueHidden && this.value;
    }

    get isNumber() {
        return this._variant === 'number';
    }

    get items() {
        let items = [];

        for (let i = Number(this.min); i <= this.max; i++) {
            items.push(i);
        }

        return items.reverse();
    }

    get computedContainerClass() {
        return classSet()
            .add({
                'slds-form-element_stacked': this.variant === 'label-stacked',
                'avonni-label-inline': this.variant === 'label-inline'
            })
            .toString();
    }

    get computedLegendClass() {
        return classSet('slds-form-element__label slds-no-flex')
            .add({
                'slds-assistive-text': this.variant === 'label-hidden'
            })
            .toString();
    }

    selectRating(event) {
        if (!this._readOnly) {
            this._value = Number(event.target.value);

            const selectedEvent = new CustomEvent('change', {
                detail: this._value
            });
            this.dispatchEvent(selectedEvent);

            this.ratingRecalculation();
        }
    }

    ratingRecalculation() {
        let buttons = this.template.querySelectorAll('button');

        buttons.forEach((button) => {
            button.classList.remove('slds-button_outline-brand');
            button.classList.remove('slds-button_brand');

            if (this.selection === 'continuous') {
                button.classList.add('avonni-continuous');

                if (Number(button.title) <= Number(this.value)) {
                    button.classList.add('slds-button_brand');
                } else {
                    button.classList.add('slds-button_outline-brand');
                }
            } else if (Number(button.title) === Number(this.value)) {
                button.classList.remove('avonni-continuous');
                button.classList.add('slds-button_brand');
            } else {
                button.classList.remove('avonni-continuous');
                button.classList.add('slds-button_outline-brand');
            }

            if (!this._disabled && !this._readOnly) {
                button.classList.add('avonni-active');
            } else {
                button.classList.remove('avonni-active');
            }
        });

        let iconButtons = this.template.querySelectorAll(
            'lightning-button-icon'
        );

        iconButtons.forEach((button) => {
            button.classList.remove('avonni-icon-selected');

            if (this.selection === 'continuous') {
                button.classList.add('avonni-continuous-star');

                if (Number(button.title) <= Number(this.value)) {
                    button.classList.add('avonni-icon-selected');
                }
            } else if (Number(button.title) === Number(this.value)) {
                button.classList.remove('avonni-continuous-star');
                button.classList.add('avonni-icon-selected');
            }

            if (!this._disabled && !this._readOnly) {
                button.classList.add('avonni-active-star');
            } else {
                button.classList.remove('avonni-active');
            }
        });
    }
}
