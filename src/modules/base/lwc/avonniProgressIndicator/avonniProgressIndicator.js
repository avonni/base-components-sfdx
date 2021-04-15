import { LightningElement, api } from 'lwc';
import { normalizeString, normalizeArray } from 'c/utilsPrivate';
import { classSet } from 'c/utils';

const TYPES = { valid: ['base', 'arrow'], default: 'base' };

const VARIANTS = { valid: ['base', 'shaded'], default: 'base' };

export default class AvonniProgressIndicator extends LightningElement {
    @api currentStep;
    @api errorSteps = [];
    @api warningSteps = [];
    @api completedSteps = [];
    @api disabledSteps = [];

    _variant = 'base';
    _type = 'base';
    _initialRender = true;

    renderedCallback() {
        if (this._initialRender) {
            this.updateErrorSteps();
            this.updateWarningSteps();
            this.updateCompletedSteps();
            this.updateCurrentStep();
        }
        this._initialRender = false;
    }

    @api
    get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: VARIANTS.default,
            validValues: VARIANTS.valid
        });
    }

    @api
    get type() {
        return this._type;
    }

    set type(type) {
        this._type = normalizeString(type, {
            fallbackValue: TYPES.default,
            validValues: TYPES.valid
        });
    }

    @api
    get steps() {
        return this._steps;
    }

    set steps(value) {
        this._steps = normalizeArray(value);
    }

    get computedOuterClass() {
        return classSet('slds-progress slds-progress_horizontal')
            .add({
                'slds-progress_shade':
                    this._variant === 'shaded' && this._type === 'base'
            })
            .toString();
    }

    // Set what type of step (active, completed, warning, error, disabled)
    getSteps() {
        return Array.from(
            this.template.querySelectorAll(
                '[data-name="primitiveProgressStep"]'
            )
        );
    }

    updateCurrentStep() {
        const steps = this.getSteps();
        steps.forEach((step) => {
            if (step.getAttribute('data-step') === this.currentStep) {
                step.classList.add('slds-is-active');
            }
        });
    }

    updateErrorSteps() {
        const steps = this.getSteps();
        steps.forEach((step) => {
            Array.from(this.errorSteps).forEach((error) => {
                if (step.getAttribute('data-step') === error) {
                    step.setIcon('utility:error');
                    step.classList.add('slds-has-error');
                }
            });
        });
    }

    updateWarningSteps() {
        const steps = this.getSteps();
        steps.forEach((step) => {
            Array.from(this.warningSteps).forEach((warning) => {
                if (step.getAttribute('data-step') === warning) {
                    step.setIcon('utility:warning');
                    step.classList.add('slds-has-warning');
                    if (this._variant === 'shaded') {
                        step.classList.remove('slds-has-warning');
                        step.classList.add('slds-has-warning-shaded');
                    }
                }
            });
        });
    }

    updateCompletedSteps() {
        const steps = this.getSteps();
        steps.forEach((step) => {
            Array.from(this.completedSteps).forEach((completed) => {
                if (step.getAttribute('data-step') === completed) {
                    step.setIcon('utility:success');
                    step.classList.add('slds-is-completed');
                }
            });
        });
    }
}
