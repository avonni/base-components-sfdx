import { LightningElement, api } from 'lwc';
import { normalizeString, normalizeBoolean } from 'c/utilsPrivate';

const POSITIONS = {
    valid: ['left', 'right'],
    defaultButtonPreviousIcon: 'left',
    defaultButtonNextIcon: 'left',
    defaultButtonFinishIcon: 'left',
    defaultAction: 'left'
};
const BUTTON_VARIANTS = {
    valid: [
        'bare',
        'neutral',
        'brand',
        'brand-outline',
        'inverse',
        'destructive',
        'destructive-text',
        'success'
    ],
    defaultButtonPrevious: 'neutral',
    defaultButtonNext: 'neutral',
    defaultButtonFinish: 'neutral'
};
const INDICATOR_TYPES = {
    valid: ['base', 'base-shaded', 'path', 'bullet', 'fractions', 'bar'],
    default: 'base'
};

const DEFAULT_BUTTON_PREVIOUS_LABEL = 'Previous';
const DEFAULT_BUTTON_NEXT_LABEL = 'Next';
const DEFAULT_BUTTON_FINISH_LABEL = 'Finish';
const DEFAULT_FRACTION_PREFIX_LABEL = 'Step';
const DEFAULT_FRACTION_LABEL = 'of';

export default class AvonniPrimitiveWizardNavigation extends LightningElement {
    @api position;
    @api indicatorPosition;
    @api buttonPreviousIconName;
    @api buttonNextIconName;
    @api buttonFinishIconName;

    _steps = [];
    _currentStep;
    _rendered = false;
    _indicatorType = INDICATOR_TYPES.default;
    _hideIndicator = false;
    _buttonPreviousIconPosition = POSITIONS.defaultButtonPreviousIcon;
    _buttonPreviousLabel = DEFAULT_BUTTON_PREVIOUS_LABEL;
    _buttonPreviousVariant = BUTTON_VARIANTS.defaultButtonPrevious;
    _buttonNextIconPosition = POSITIONS.defaultButtonNextIcon;
    _buttonNextLabel = DEFAULT_BUTTON_NEXT_LABEL;
    _buttonNextVariant = BUTTON_VARIANTS.defaultButtonNext;
    _buttonFinishIconPosition = POSITIONS.defaultButtonFinishIcon;
    _buttonFinishLabel = DEFAULT_BUTTON_FINISH_LABEL;
    _buttonFinishVariant = BUTTON_VARIANTS.defaultButtonFinish;
    _buttonAlignmentBump;
    _actionPosition = POSITIONS.defaultAction;
    _fractionPrefixLabel = DEFAULT_FRACTION_PREFIX_LABEL;
    _fractionLabel = DEFAULT_FRACTION_LABEL;

    lastStep;
    progressIndicatorVariant = 'base';
    progressIndicatorType = 'base';
    progressBarValue = 0;
    fractionCurrentStep;
    fractionTotalSteps;
    showBulletIndicator;
    showProgressIndicator;
    showFractionIndicator;
    showBarIndicator;
    hidePreviousButton;
    hideNextFinishButton;
    previousButtonColClass;
    progressColClass = 'slds-text-align_left';
    actionsNextFinishButtonColClass;
    actionsSlotColClass;
    nextFinishButtonColClass;

    connectedCallback() {
        // Apply buttonAlignmentBump and actionPosition.
        this._reorderColumns();
    }

    renderedCallback() {
        if (!this._rendered && this.steps.length > 0 && this.currentStep) {
            this._rendered = true;

            if (!this.hideIndicator) this._initIndicator();
            this._normalizeProxySteps();
            this._updateSteps();
        }
    }

    // Tranform the read only proxy object into an array
    // Needed by the bullet indicator to add keys to the steps
    _normalizeProxySteps() {
        this._steps = this.steps.map((proxyStep) => {
            return {
                name: proxyStep.name,
                label: proxyStep.label,
                hidePreviousButton: proxyStep.hidePreviousButton,
                hideNextFinishButton: proxyStep.hideNextFinishButton
            };
        });
    }

    _initIndicator() {
        // If the indicator position is set to header, two navigations will be in the wizard:
        // One will be in the footer and will only display the buttons.
        // One will be in the header and will only display the indicator.
        if (this.indicatorPosition === 'header') {
            if (this.position === 'footer') {
                this._hideIndicator = true;
                return;
            }
            if (this.position === 'header') {
                this.hidePreviousButton = true;
                this.hideNextFinishButton = true;
                this.actionsSlotColClass = 'slds-hide';
            }
        }

        switch (this.indicatorType) {
            case 'base-shaded':
                this.showProgressIndicator = true;
                this.progressIndicatorVariant = 'shaded';
                this.progressIndicatorType = 'base';
                break;
            case 'path':
                this.showProgressIndicator = true;
                this.progressIndicatorType = 'path';
                break;
            case 'bullet':
                this.showBulletIndicator = true;
                break;
            case 'fractions':
                this.showFractionIndicator = true;
                this.fractionTotalSteps = this.steps.length;
                break;
            case 'bar':
                this.showBarIndicator = true;
                break;
            default:
                this.showProgressIndicator = true;
                break;
        }
    }

    _updateSteps() {
        const currentStepIndex =
            this.currentStepIndex > -1 ? this.currentStepIndex : 0;
        const currentStep = this.steps[currentStepIndex];

        // Update buttons if they are visible
        if (
            !(this.indicatorPosition === 'header' && this.position === 'header')
        ) {
            this.lastStep = currentStepIndex === this.steps.length - 1;

            // Hide previous button for first step
            if (currentStep === this.steps[0]) {
                this.hidePreviousButton = true;
            } else {
                this.hidePreviousButton = currentStep.hidePreviousButton;
            }

            this.hideNextFinishButton = currentStep.hideNextFinishButton;
        }

        // Update indicator if it is visible
        if (this.hideIndicator) return;

        if (this.showBarIndicator) {
            this.progressBarValue =
                (currentStepIndex / (this.steps.length - 1)) * 100;
        }

        if (this.showFractionIndicator) {
            this.fractionCurrentStep = currentStepIndex + 1;
        }

        if (this.showBulletIndicator) {
            this._steps.forEach((step) => {
                step.selected = false;
                step.bulletClass = 'slds-carousel__indicator-action';
            });
            currentStep.selected = true;
            currentStep.bulletClass =
                'slds-carousel__indicator-action slds-is-active';
        }
    }

    _reorderColumns() {
        const bump = this.buttonAlignmentBump;
        if (bump) {
            this.actionsNextFinishButtonColClass =
                bump === 'right' ? 'slds-order_3' : 'slds-order_2';
            this.progressColClass =
                bump === 'right'
                    ? 'slds-order_1 slds-text-align_left'
                    : 'slds-order_3 slds-text-align_right';
            this.previousButtonColClass =
                bump === 'right' ? 'slds-order_2' : 'slds-order_1';
        }

        if (this.actionPosition === 'right') {
            this.nextFinishButtonColClass = 'slds-order_1';
            this.actionsSlotColClass = 'slds-order_2';
        }
    }

    get currentStepIndex() {
        const stepNames = this.steps.map((step) => step.name);
        return stepNames.indexOf(this.currentStep);
    }

    get showIndicator() {
        return this.steps && !this.hideIndicator;
    }

    @api
    get steps() {
        return this._steps;
    }
    set steps(proxy) {
        this._steps = proxy;
    }

    @api
    get currentStep() {
        return this._currentStep;
    }
    set currentStep(name) {
        this._currentStep = (typeof name === 'string' && name.trim()) || '';

        if (this._rendered && this.steps) this._updateSteps();
    }

    @api
    get indicatorType() {
        return this._indicatorType;
    }
    set indicatorType(type) {
        this._indicatorType = normalizeString(type, {
            fallbackValue: INDICATOR_TYPES.default,
            validValues: INDICATOR_TYPES.valid
        });
    }

    @api
    get hideIndicator() {
        return this._hideIndicator;
    }
    set hideIndicator(boolean) {
        this._hideIndicator = normalizeBoolean(boolean);
    }

    @api
    get buttonPreviousIconPosition() {
        return this._buttonPreviousIconPosition;
    }
    set buttonPreviousIconPosition(position) {
        this._buttonPreviousIconPosition = normalizeString(position, {
            fallbackValue: POSITIONS.defaultButtonPreviousIcon,
            validValues: POSITIONS.valid
        });
    }

    @api
    get buttonPreviousLabel() {
        return this._buttonPreviousLabel;
    }
    set buttonPreviousLabel(label) {
        this._buttonPreviousLabel =
            (typeof label === 'string' && label.trim()) ||
            DEFAULT_BUTTON_PREVIOUS_LABEL;
    }

    @api
    get buttonPreviousVariant() {
        return this._buttonPreviousVariant;
    }
    set buttonPreviousVariant(variant) {
        this._buttonPreviousVariant = normalizeString(variant, {
            fallbackValue: BUTTON_VARIANTS.defaultButtonPrevious,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    @api
    get buttonNextIconPosition() {
        return this._buttonNextIconPosition;
    }
    set buttonNextIconPosition(position) {
        this._buttonNextIconPosition = normalizeString(position, {
            fallbackValue: POSITIONS.defaultButtonNextIcon,
            validValues: POSITIONS.valid
        });
    }

    @api
    get buttonNextLabel() {
        return this._buttonNextLabel;
    }
    set buttonNextLabel(label) {
        this._buttonNextLabel =
            (typeof label === 'string' && label.trim()) ||
            DEFAULT_BUTTON_NEXT_LABEL;
    }

    @api
    get buttonNextVariant() {
        return this._buttonNextVariant;
    }
    set buttonNextVariant(variant) {
        this._buttonNextVariant = normalizeString(variant, {
            fallbackValue: BUTTON_VARIANTS.defaultButtonNext,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    @api
    get buttonFinishIconPosition() {
        return this._buttonFinishIconPosition;
    }
    set buttonFinishIconPosition(position) {
        this._buttonFinishIconPosition = normalizeString(position, {
            fallbackValue: POSITIONS.defaultButtonFinishIcon,
            validValues: POSITIONS.valid
        });
    }

    @api
    get buttonFinishLabel() {
        return this._buttonFinishLabel;
    }
    set buttonFinishLabel(label) {
        this._buttonFinishLabel =
            (typeof label === 'string' && label.trim()) ||
            DEFAULT_BUTTON_FINISH_LABEL;
    }

    @api
    get buttonFinishVariant() {
        return this._buttonFinishVariant;
    }
    set buttonFinishVariant(variant) {
        this._buttonFinishVariant = normalizeString(variant, {
            fallbackValue: BUTTON_VARIANTS.defaultButtonFinish,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    @api
    get buttonAlignmentBump() {
        return this._buttonAlignmentBump;
    }
    set buttonAlignmentBump(position) {
        this._buttonAlignmentBump = normalizeString(position, {
            fallbackValue: null,
            validValues: POSITIONS.valid
        });
    }

    @api
    get actionPosition() {
        return this._actionPosition;
    }
    set actionPosition(position) {
        this._actionPosition = normalizeString(position, {
            fallbackValue: POSITIONS.defaultAction,
            validValues: POSITIONS.valid
        });
    }

    @api
    get fractionPrefixLabel() {
        return this._fractionPrefixLabel;
    }
    set fractionPrefixLabel(prefix) {
        this._fractionPrefixLabel =
            (typeof label === 'string' && prefix.trim()) ||
            DEFAULT_FRACTION_PREFIX_LABEL;
    }

    @api
    get fractionLabel() {
        return this._fractionLabel;
    }
    set fractionLabel(label) {
        this._fractionLabel =
            (typeof label === 'string' && label.trim()) ||
            DEFAULT_FRACTION_LABEL;
    }

    handleButtonClick(event) {
        const action = event.currentTarget.dataset.action;

        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    action: action
                }
            })
        );
    }
}
