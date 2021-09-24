/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2021, Avonni Labs, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * - Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { LightningElement, api } from 'lwc';
import { normalizeString, normalizeBoolean } from 'c/utilsPrivate';
import { classSet } from 'c/utils';

const BUTTON_POSITIONS = {
    valid: ['left', 'right'],
    defaultPreviousButtonIcon: 'left',
    defaultNextButtonIcon: 'left',
    defaultFinishButtonIcon: 'left',
    defaultAction: 'left'
};

const POSITIONS = {
    valid: ['top', 'bottom', 'side'],
    default: 'bottom'
};

const INDICATOR_POSITIONS = {
    valid: ['top', 'bottom', 'right', 'left'],
    default: 'bottom'
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
    defaultPreviousButton: 'neutral',
    defaultNextButton: 'neutral',
    defaultFinishButton: 'neutral'
};
const INDICATOR_TYPES = {
    valid: ['base', 'base-shaded', 'path', 'bullet', 'fractions', 'bar'],
    default: 'base'
};

const DEFAULT_PREVIOUS_BUTTON_LABEL = 'Previous';
const DEFAULT_NEXT_BUTTON_LABEL = 'Next';
const DEFAULT_FINISH_BUTTON_LABEL = 'Finish';
const DEFAULT_FRACTION_PREFIX_LABEL = 'Step';
const DEFAULT_FRACTION_LABEL = 'of';

export default class AvonniPrimitiveWizardNavigation extends LightningElement {
    @api previousButtonIconName;
    @api nextButtonIconName;
    @api finishButtonIconName;

    _steps = [];
    _currentStep;
    _currentStepHasError = false;
    _rendered = false;
    _indicatorType = INDICATOR_TYPES.default;
    _hideIndicator = false;
    _previousButtonIconPosition = BUTTON_POSITIONS.defaultPreviousButtonIcon;
    _previousButtonLabel = DEFAULT_PREVIOUS_BUTTON_LABEL;
    _previousButtonVariant = BUTTON_VARIANTS.defaultPreviousButton;
    _nextButtonIconPosition = BUTTON_POSITIONS.defaultNextButtonIcon;
    _nextButtonLabel = DEFAULT_NEXT_BUTTON_LABEL;
    _nextButtonVariant = BUTTON_VARIANTS.defaultNextButton;
    _finishButtonIconPosition = BUTTON_POSITIONS.defaultFinishButtonIcon;
    _finishButtonLabel = DEFAULT_FINISH_BUTTON_LABEL;
    _finishButtonVariant = BUTTON_VARIANTS.defaultFinishButton;
    _buttonAlignmentBump;
    _actionPosition = BUTTON_POSITIONS.defaultAction;
    _fractionPrefixLabel = DEFAULT_FRACTION_PREFIX_LABEL;
    _fractionLabel = DEFAULT_FRACTION_LABEL;
    _indicatorPosition = INDICATOR_POSITIONS.default;
    _position = POSITIONS.default;

    lastStep = false;
    progressIndicatorVariant = INDICATOR_TYPES.default;
    progressIndicatorType = INDICATOR_TYPES.default;
    progressBarValue = 0;
    progressBarOrientation = 'horizontal';
    fractionCurrentStep;
    fractionTotalSteps;
    showBulletIndicator = false;
    showProgressIndicator = false;
    showFractionIndicator = false;
    showBarIndicator = false;
    hidePreviousButton = false;
    hideNextFinishButton = false;

    renderedCallback() {
        if (!this._rendered && this.steps.length > 0) {
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
        if (this.indicatorPosition === 'top' && this.position === 'bottom') {
            this._hideIndicator = true;
            return;
        } else if (this.hideAllButtons) {
            this.hidePreviousButton = true;
            this.hideNextFinishButton = true;
        }

        this.showProgressIndicator = this.showBulletIndicator = this.showFractionIndicator = this.showBarIndicator = false;

        switch (this.indicatorType) {
            case 'base-shaded':
                this.showProgressIndicator = true;
                this.progressIndicatorVariant = 'shade';
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
                this.progressBarOrientation = this.sideNavigation
                    ? 'vertical'
                    : 'horizontal';
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
        if (!this.hideAllButtons) {
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

    get currentStepIndex() {
        const stepNames = this.steps.map((step) => step.name);
        return stepNames.indexOf(this.currentStep);
    }

    get showIndicator() {
        return (
            this.steps &&
            !this.hideIndicator &&
            !(
                (this.indicatorPosition === 'right' ||
                    this.indicatorPosition === 'left') &&
                this.position === 'bottom'
            )
        );
    }

    get sideNavigation() {
        return this.position === 'side';
    }

    get hideAllButtons() {
        return (
            (this.indicatorPosition === 'top' && this.position === 'top') ||
            this.sideNavigation
        );
    }

    get carouselIndicatorClass() {
        return classSet('slds-carousel__indicator').add({
            'slds-grid slds-m-vertical_xx-small': this.sideNavigation
        });
    }

    get progressColClass() {
        return classSet('slds-text-align_left').add({
            'avonni-height_full': this.indicatorType === 'bar',
            'slds-align-middle': this.indicatorType !== 'fractions',
            'slds-order_1 slds-text-align_left':
                this.buttonAlignmentBump === 'right',
            'slds-order_3 slds-text-align_right':
                this.buttonAlignmentBump === 'left'
        });
    }

    get actionsNextFinishButtonColClass() {
        return classSet().add({
            'slds-order_3': this.buttonAlignmentBump === 'right',
            'slds-order_2': this.buttonAlignmentBump === 'left'
        });
    }

    get previousButtonColClass() {
        return classSet().add({
            'slds-order_2': this.buttonAlignmentBump === 'right',
            'slds-order_1': this.buttonAlignmentBump === 'left'
        });
    }

    get nextFinishButtonColClass() {
        return classSet().add({
            'slds-order_1': this.actionPosition === 'right'
        });
    }

    get actionsSlotColClass() {
        return classSet().add({
            'slds-order_2': this.actionPosition === 'right',
            'slds-hide': this.hideAllButtons
        });
    }

    @api
    get steps() {
        return this._steps;
    }
    set steps(proxy) {
        this._steps = proxy;

        if (this._rendered && this._steps.length > 0) {
            this._normalizeProxySteps();
            this._updateSteps();

            if (this.indicatorType === 'fractions' && !this.hideIndicator)
                this._initIndicator();
        }
    }

    @api
    get currentStep() {
        return this._currentStep;
    }
    set currentStep(name) {
        this._currentStep = (typeof name === 'string' && name.trim()) || '';

        if (this._rendered && this.steps.length > 0) {
            this._updateSteps();
        }
    }

    @api
    get currentStepHasError() {
        return this._currentStepHasError;
    }
    set currentStepHasError(value) {
        this._currentStepHasError = normalizeBoolean(value);
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

        this._initIndicator();
        if (this._rendered && this.steps.length > 0) {
            this._updateSteps();
        }
    }

    @api
    get hideIndicator() {
        return this._hideIndicator;
    }
    set hideIndicator(boolean) {
        this._hideIndicator = normalizeBoolean(boolean);
        this._initIndicator();
    }

    @api
    get indicatorPosition() {
        return this._indicatorPosition;
    }
    set indicatorPosition(value) {
        this._indicatorPosition = normalizeString(value, {
            validValues: INDICATOR_POSITIONS.valid,
            fallbackValue: INDICATOR_POSITIONS.default
        });

        this._initIndicator();
    }

    @api
    get previousButtonIconPosition() {
        return this._previousButtonIconPosition;
    }
    set previousButtonIconPosition(position) {
        this._previousButtonIconPosition = normalizeString(position, {
            fallbackValue: BUTTON_POSITIONS.defaultpreviousButtonIcon,
            validValues: BUTTON_POSITIONS.valid
        });
    }

    @api
    get previousButtonLabel() {
        return this._previousButtonLabel;
    }
    set previousButtonLabel(label) {
        this._previousButtonLabel =
            (typeof label === 'string' && label.trim()) ||
            DEFAULT_PREVIOUS_BUTTON_LABEL;
    }

    @api
    get previousButtonVariant() {
        return this._previousButtonVariant;
    }
    set previousButtonVariant(variant) {
        this._previousButtonVariant = normalizeString(variant, {
            fallbackValue: BUTTON_VARIANTS.defaultpreviousButton,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    @api
    get nextButtonIconPosition() {
        return this._nextButtonIconPosition;
    }
    set nextButtonIconPosition(position) {
        this._nextButtonIconPosition = normalizeString(position, {
            fallbackValue: BUTTON_POSITIONS.defaultnextButtonIcon,
            validValues: BUTTON_POSITIONS.valid
        });
    }

    @api
    get nextButtonLabel() {
        return this._nextButtonLabel;
    }
    set nextButtonLabel(label) {
        this._nextButtonLabel =
            (typeof label === 'string' && label.trim()) ||
            DEFAULT_NEXT_BUTTON_LABEL;
    }

    @api
    get nextButtonVariant() {
        return this._nextButtonVariant;
    }
    set nextButtonVariant(variant) {
        this._nextButtonVariant = normalizeString(variant, {
            fallbackValue: BUTTON_VARIANTS.defaultnextButton,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    @api
    get finishButtonIconPosition() {
        return this._finishButtonIconPosition;
    }
    set finishButtonIconPosition(position) {
        this._finishButtonIconPosition = normalizeString(position, {
            fallbackValue: BUTTON_POSITIONS.defaultfinishButtonIcon,
            validValues: BUTTON_POSITIONS.valid
        });
    }

    @api
    get finishButtonLabel() {
        return this._finishButtonLabel;
    }
    set finishButtonLabel(label) {
        this._finishButtonLabel =
            (typeof label === 'string' && label.trim()) ||
            DEFAULT_FINISH_BUTTON_LABEL;
    }

    @api
    get finishButtonVariant() {
        return this._finishButtonVariant;
    }
    set finishButtonVariant(variant) {
        this._finishButtonVariant = normalizeString(variant, {
            fallbackValue: BUTTON_VARIANTS.defaultfinishButton,
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
            validValues: BUTTON_POSITIONS.valid
        });
    }

    @api
    get actionPosition() {
        return this._actionPosition;
    }
    set actionPosition(position) {
        this._actionPosition = normalizeString(position, {
            fallbackValue: BUTTON_POSITIONS.defaultAction,
            validValues: BUTTON_POSITIONS.valid
        });
    }

    @api
    get fractionPrefixLabel() {
        return this._fractionPrefixLabel;
    }
    set fractionPrefixLabel(prefix) {
        this._fractionPrefixLabel =
            (typeof prefix === 'string' && prefix.trim()) ||
            DEFAULT_FRACTION_PREFIX_LABEL;

        this._initIndicator();
    }

    @api
    get fractionLabel() {
        return this._fractionLabel;
    }
    set fractionLabel(label) {
        this._fractionLabel =
            (typeof label === 'string' && label.trim()) ||
            DEFAULT_FRACTION_LABEL;

        this._initIndicator();
    }

    @api
    get position() {
        return this._position;
    }
    set position(value) {
        this._position = normalizeString(value, {
            validValues: POSITIONS.valid,
            fallbackValue: POSITIONS.default
        });

        this._initIndicator();
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
