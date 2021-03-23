import { LightningElement, api } from 'lwc';
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';

const validVariants = ['base', 'shade'];

export default class AvonniVerticalProgressIndicator extends LightningElement {
    @api currentStep;

    _variant = 'base';
    _hasError = false;
    _contentInLine = false;

    renderedCallback() {
        let elements = this.template.querySelector('slot').assignedElements();
        let indexCompleted = 0;

        elements.forEach((element, index) => {
            element.setAttributes(this.contentInLine, this.variant === 'shade');

            if (element.getAttribute('data-step') === this.currentStep) {
                indexCompleted = index;
            }
        });

        elements.forEach((element, index) => {
            if (indexCompleted > index) {
                element.classList.add('slds-is-completed');
                element.setIcon('utility:success');
            } else if (indexCompleted === index) {
                if (this.hasError && this.variant === 'base') {
                    element.setIcon('utility:error');
                    element.classList.add('slds-has-error');
                } else {
                    element.classList.add('slds-is-active');
                }
            }
        });
    }

    @api get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: 'base',
            validValues: validVariants
        });
    }

    @api get hasError() {
        return this._hasError;
    }

    set hasError(value) {
        this._hasError = normalizeBoolean(value);
    }

    @api get contentInLine() {
        return this._contentInLine;
    }

    set contentInLine(value) {
        this._contentInLine = normalizeBoolean(value);
    }

    get computedProgressClass() {
        return this.variant === 'base'
            ? 'slds-progress slds-progress_vertical slds-progress_success'
            : 'slds-progress slds-progress_vertical slds-progress_success slds-progress_shade';
    }

    get computedProgressListClass() {
        return this.contentInLine
            ? 'slds-progress__list slds-progress__list-bordered'
            : 'slds-progress__list';
    }
}
