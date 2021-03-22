import { LightningElement, api } from 'lwc';
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';
import { classSet } from 'c/utils';

const validVariants = [
    'standard',
    'label-inline',
    'label-hidden',
    'label-stacked'
];

export default class AvonniInputCounter extends LightningElement {
    @api name;
    @api label;
    @api messageWhenBadInput;
    @api messageWhenPatternMismatch;
    @api messageWhenRangeOverflow;
    @api messageWhenRangeUnderflow;
    @api messageWhenStepMismatch;
    @api messageWhenTooShort;
    @api messageWhenTooLong;
    @api messageWhenTypeMismatch;
    @api messageWhenValueMissing;
    @api messageToggleActive;
    @api messageToggleInactive;
    @api ariaLabel;
    @api ariaControls;
    @api ariaLabelledBy;
    @api ariaDescribedBy;
    @api max;
    @api min;
    @api step = 1;
    @api value;
    @api fieldLevelHelp;
    @api accessKey;

    _variant = 'standard';
    _disabled;
    _readOnly;
    _required;
    labelVariant;
    labelFieldLevelHelp;
    init = false;

    renderedCallback() {
        if (!this.init) {
            let srcElement = this.template.querySelector(
                '.avonni-input-counter'
            );

            if (srcElement) {
                const style = document.createElement('style');
                style.innerText =
                    '.avonni-input-counter .slds-input {text-align: center;padding: 0 var(--lwc-spacingXxLarge,3rem);}';
                srcElement.appendChild(style);
            }

            this.init = true;
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

        if (this._variant === 'label-inline') {
            this.labelVariant = 'label-hidden';
            this.classList.add('avonni-flex-container');
        } else {
            this.labelVariant = this._variant;
            this.labelFieldLevelHelp =
                this._variant !== 'label-hidden' ? this.fieldLevelHelp : null;
        }
    }

    @api get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    @api get readOnly() {
        return this._readOnly;
    }

    set readOnly(value) {
        this._readOnly = normalizeBoolean(value);
    }

    @api get required() {
        return this._required;
    }

    set required(value) {
        this._required = normalizeBoolean(value);
    }

    get formElementClass() {
        return classSet('slds-form-element')
            .add({
                'slds-has-error': this.showError
            })
            .toString();
    }

    get buttonIncrementClass() {
        return classSet('slds-input__button_increment')
            .add({
                'avonni-standart-top':
                    this._variant !== 'label-inline' &&
                    this._variant !== 'label-hidden',
                'avonni-hidden-top': this._variant === 'label-hidden'
            })
            .toString();
    }

    get buttonDecrementClass() {
        return classSet('slds-input__button_decrement')
            .add({
                'avonni-standart-top':
                    this._variant !== 'label-inline' &&
                    this._variant !== 'label-hidden',
                'avonni-hidden-top': this._variant === 'label-hidden'
            })
            .toString();
    }

    get inputClass() {
        return this._readOnly ? '' : 'avonni-input-counter';
    }

    get isInline() {
        return this.variant === 'label-inline';
    }

    get computedAriaControls() {
        return this.ariaControls || null;
    }

    get computedAriaLabelledBy() {
        return this.ariaLabelledBy || null;
    }

    get computedAriaDescribedBy() {
        return this.ariaDescribedBy || null;
    }


    @api
    setCustomValidity() {
        this.template.querySelector('lightning-input').setCustomValidity();
    }

    @api
    reportValidity() {
        this.template.querySelector('lightning-input').reportValidity();
    }

    @api
    focus() {
        this.template.querySelector('lightning-input').focus();
    }

    @api
    blur() {
        this.template.querySelector('lightning-input').blur();
    }

    @api
    showHelpMessageIfInvalid() {
        this.template
            .querySelector('lightning-input')
            .showHelpMessageIfInvalid();
    }

    decrementValue() {
        if (this.value !== undefined && !isNaN(this.value)) {
            this.value = Number(this.value) - Number(this.step);
            this.updateValue(this.value);
        } else {
            this.value = -1;
            this.updateValue(this.value);
        }
    }

    incrementValue() {
        if (this.value !== undefined && !isNaN(this.value)) {
            this.value = Number(this.value) + Number(this.step);
            this.updateValue(this.value);
        } else {
            this.value = 1;
            this.updateValue(this.value);
        }
    }

    updateValue(value) {
        [...this.template.querySelectorAll('lightning-input')].forEach(
            element => {
                element.value = value;
            }
        );

        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value: this.value
                }
            })
        );

        this.validateValue();
    }

    validateValue() {
        [...this.template.querySelectorAll('lightning-input')].reduce(
            (validSoFar, inputCmp) => {
                inputCmp.reportValidity();
                return validSoFar && inputCmp.checkValidity();
            },
            true
        );
    }

    handlerChange(event) {
        this.value = event.target.value;
        this.validateValue();
    }

    handlerFocus() {
        this.dispatchEvent(new CustomEvent('focus'));
    }

    handlerBlur() {
        this.dispatchEvent(new CustomEvent('blur'));
    }
}
