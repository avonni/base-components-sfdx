import { LightningElement, api } from 'lwc';
import { normalizeBoolean } from 'c/utilsPrivate';

export default class AvonniWizardStep extends LightningElement {
    @api label;
    @api name;
    @api beforeChange = function () {
        return true;
    };
    @api beforeChangeErrorMessage;

    stepClass;
    _hidePreviousButton = false;
    _hideNextFinishButton = false;

    connectedCallback() {
        const stepRegister = new CustomEvent('wizardstepregister', {
            bubbles: true,
            detail: {
                callbacks: {
                    setClass: this.setClass,
                    beforeChange:
                        typeof this.beforeChange === 'function'
                            ? this.beforeChange.bind(this)
                            : null
                },
                name: this.name,
                label: this.label,
                hidePreviousButton: this.hidePreviousButton,
                hideNextFinishButton: this.hideNextFinishButton,
                beforeChangeErrorMessage: this.beforeChangeErrorMessage
            }
        });

        this.dispatchEvent(stepRegister);
    }

    setClass = (value) => {
        this.stepClass = value;
    };

    @api
    get hidePreviousButton() {
        return this._hidePreviousButton;
    }
    set hidePreviousButton(value) {
        this._hidePreviousButton = normalizeBoolean(value);
    }

    @api
    get hideNextFinishButton() {
        return this._hideNextFinishButton;
    }
    set hideNextFinishButton(value) {
        this._hideNextFinishButton = normalizeBoolean(value);
    }
}
