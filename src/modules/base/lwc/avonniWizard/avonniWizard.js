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
import BaseView from './avonniBase.html';
import ModalView from './avonniModal.html';
import CardView from './avonniCard.html';

const VARIANTS = {
    valid: ['base', 'modal', 'card'],
    default: 'base'
};
const INDICATOR_POSITIONS = {
    valid: ['top', 'bottom', 'right', 'left'],
    default: 'bottom'
};

const INDICATOR_TYPES = {
    valid: ['base', 'base-shaded', 'path', 'bullet', 'fractions', 'bar'],
    default: 'base'
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

const POSITIONS = {
    valid: ['left', 'right'],
    defaultPreviousButtonIcon: 'left',
    defaultNextButtonIcon: 'left',
    defaultFinishButtonIcon: 'left',
    defaultAction: 'left'
};

const DEFAULT_PREVIOUS_BUTTON_LABEL = 'Previous';
const DEFAULT_NEXT_BUTTON_LABEL = 'Next';
const DEFAULT_FINISH_BUTTON_LABEL = 'Finish';
const DEFAULT_FRACTION_PREFIX_LABEL = 'Step';
const DEFAULT_FRACTION_LABEL = 'of';

export default class AvonniWizard extends LightningElement {
    @api title;
    @api iconName;
    @api previousButtonIconName;
    @api nextButtonIconName;
    @api finishButtonIconName;

    _variant = VARIANTS.default;
    _hideNavigation = false;
    _indicatorPosition = INDICATOR_POSITIONS.default;
    _indicatorType = INDICATOR_TYPES.default;
    _hideIndicator = false;
    _currentStep;
    _initialCurrentStep;
    _previousButtonIconPosition = POSITIONS.defaultPreviousButtonIcon;
    _previousButtonLabel = DEFAULT_PREVIOUS_BUTTON_LABEL;
    _previousButtonVariant = BUTTON_VARIANTS.defaultPreviousButton;
    _nextButtonIconPosition = POSITIONS.defaultNextButtonIcon;
    _nextButtonLabel = DEFAULT_NEXT_BUTTON_LABEL;
    _nextButtonVariant = BUTTON_VARIANTS.defaultNextButton;
    _finishButtonIconPosition = POSITIONS.defaultFinishButtonIcon;
    _finishButtonLabel = DEFAULT_FINISH_BUTTON_LABEL;
    _finishButtonVariant = BUTTON_VARIANTS.defaultFinishButton;
    _buttonAlignmentBump;
    _actionPosition = POSITIONS.defaultAction;
    _fractionPrefixLabel = DEFAULT_FRACTION_PREFIX_LABEL;
    _fractionLabel = DEFAULT_FRACTION_LABEL;

    steps = [];
    showWizard = true;
    errorMessage;

    handleStepRegister(event) {
        event.stopPropagation();

        const step = event.detail;
        this.steps.push(step);

        this._initSteps();
    }

    connectedCallback() {
        if (this.variant === 'modal') this.hide();
    }

    renderedCallback() {
        if (this.steps.length > 0) {
            const navigations = this.template.querySelectorAll(
                'c-primitive-wizard-navigation'
            );
            navigations.forEach((nav) => {
                nav.steps = this.steps;
            });
        }
    }

    render() {
        if (this.variant === 'modal') {
            return ModalView;
        } else if (this.variant === 'card') {
            return CardView;
        }
        return BaseView;
    }

    _initSteps() {
        // Make sure all steps have a name
        this.steps.forEach((step, index) => {
            step.name = step.name || `step-${index}`;
        });

        // If no current step was given, set current step to first step
        const stepNames = this.steps.map((step) => step.name);
        const index = stepNames.indexOf(this._initialCurrentStep);
        this._currentStep =
            index === -1 ? this.steps[0].name : this.steps[index].name;

        this._updateStepDisplay();
    }

    _updateStepDisplay() {
        this.steps.forEach((step) => {
            step.callbacks.setClass('slds-hide');
        });
        this.steps[this.currentStepIndex].callbacks.setClass(undefined);
    }

    @api
    get currentStep() {
        return this._currentStep;
    }
    set currentStep(name) {
        this._currentStep = (typeof name === 'string' && name.trim()) || '';
        this._initialCurrentStep = this._currentStep;
    }

    @api
    get hideNavigation() {
        return this._hideNavigation;
    }
    set hideNavigation(boolean) {
        this._hideNavigation = normalizeBoolean(boolean);
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
    get indicatorPosition() {
        return this._indicatorPosition;
    }
    set indicatorPosition(position) {
        this._indicatorPosition = normalizeString(position, {
            fallbackValue: INDICATOR_POSITIONS.default,
            validValues: INDICATOR_POSITIONS.valid
        });
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
    set hideIndicator(value) {
        this._hideIndicator = normalizeBoolean(value);
    }

    @api
    get previousButtonIconPosition() {
        return this._previousButtonIconPosition;
    }
    set previousButtonIconPosition(value) {
        this._previousButtonIconPosition = normalizeString(value, {
            fallbackValue: POSITIONS.defaultpreviousButtonIcon,
            validValues: POSITIONS.valid
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
    set previousButtonVariant(value) {
        this._previousButtonVariant = normalizeString(value, {
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
            fallbackValue: POSITIONS.defaultnextButtonIcon,
            validValues: POSITIONS.valid
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
            fallbackValue: POSITIONS.defaultfinishButtonIcon,
            validValues: POSITIONS.valid
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
            (typeof prefix === 'string' && prefix.trim()) ||
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

    get currentStepIndex() {
        const stepNames = this.steps.map((step) => step.name);
        return stepNames.indexOf(this.currentStep);
    }

    get indicatorInHeader() {
        return !this.hideIndicator && this.indicatorPosition === 'top';
    }

    get indicatorOnSide() {
        return (
            !this.hideIndicator &&
            !this.hideNavigation &&
            (this.indicatorPosition === 'left' ||
                this.indicatorPosition === 'right')
        );
    }

    get wrapperClass() {
        return classSet().add({
            'slds-grid slds-gutters slds-has-flexi-truncate slds-grid_vertical-stretch':
                this.indicatorPosition === 'right' ||
                this.indicatorPosition === 'left'
        });
    }

    get mainColClass() {
        return classSet('main-col').add({
            'slds-col':
                this.indicatorPosition === 'right' ||
                this.indicatorPosition === 'left',
            'slds-order_2': this.indicatorPosition === 'left'
        });
    }

    get sideColClass() {
        return classSet('slds-container_small side-col').add({
            'slds-align-bottom': this.indicatorType === 'fractions',
            'slds-p-right_medium': this.indicatorPosition === 'right',
            'slds-p-left_medium': this.indicatorPosition === 'left',
            'slds-p-bottom_medium':
                this.variant === 'base' && !this.indicatorType === 'fractions',
            'slds-p-bottom_large':
                this.variant === 'base' && this.indicatorType === 'fractions'
        });
    }

    @api
    show() {
        this.showWizard = true;
    }

    @api
    hide() {
        this.showWizard = false;
        this.steps = [];
    }

    @api
    next() {
        const oldStep = this.currentStep;
        this._currentStep = this.steps[this.currentStepIndex + 1].name;

        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    currentStep: this.currentStep,
                    oldStep: oldStep
                }
            })
        );

        this._updateStepDisplay();
    }

    @api
    previous() {
        const oldStep = this.currentStep;
        this._currentStep = this.steps[this.currentStepIndex - 1].name;

        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    currentStep: this.currentStep,
                    oldStep: oldStep
                }
            })
        );

        this._updateStepDisplay();
    }

    beforeChange(step) {
        return new Promise((resolve) => {
            if (!step.callbacks.beforeChange) {
                return resolve(true);
            }

            return resolve(step.callbacks.beforeChange());
        });
    }

    async handleChange(event) {
        this.errorMessage = undefined;
        const verticalIndicator = this.template.querySelector(
            'c-vertical-progress-indicator'
        );
        if (verticalIndicator) {
            verticalIndicator.hasError = false;
        }

        // Execute beforeChange function set on the step
        // If the function returns false, the change does not happen
        const hasError = !(await this.beforeChange(
            this.steps[this.currentStepIndex]
        ));
        if (hasError) {
            this.errorMessage = this.steps[
                this.currentStepIndex
            ].beforeChangeErrorMessage;

            if (verticalIndicator) {
                verticalIndicator.hasError = true;
            }
            return;
        }

        const action = event.detail.action;

        switch (action) {
            case 'finish':
                this.dispatchEvent(new CustomEvent('complete'));
                break;
            case 'previous':
                this.previous();
                break;
            case 'next':
                this.next();
                break;
            default:
                break;
        }
    }

    handleCloseDialog() {
        this.hide();
    }
}
