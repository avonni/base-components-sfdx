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
import { normalizeString, normalizeArray } from 'c/utilsPrivate';
import { classSet } from 'c/utils';

const PROGRESS_INDICATOR_TYPES = { valid: ['base', 'arrow'], default: 'base' };

const INDICATOR_VARIANTS = { valid: ['base', 'shaded'], default: 'base' };

export default class AvonniProgressIndicator extends LightningElement {
    @api currentStep;

    _completedSteps = [];
    _disabledSteps = [];
    _warningSteps = [];
    _errorSteps = [];
    _variant = PROGRESS_INDICATOR_TYPES.default;
    _type = INDICATOR_VARIANTS.default;
    _initialRender = true;
    _steps = [];

    renderedCallback() {
        this.updateErrorSteps();
        this.updateWarningSteps();
        this.updateCompletedSteps();
        this.updateCurrentStep();
    }

    @api
    get completedSteps() {
        return this._completedSteps;
    }
    set completedSteps(value) {
        this._completedSteps = normalizeArray(value);
    }

    @api
    get disabledSteps() {
        return this._disabledSteps;
    }
    set disabledSteps(value) {
        this._disabledSteps = normalizeArray(value);
    }

    @api
    get warningSteps() {
        return this._warningSteps;
    }
    set warningSteps(value) {
        this._warningSteps = normalizeArray(value);
    }

    @api
    get errorSteps() {
        return this._errorSteps;
    }
    set errorSteps(value) {
        this._errorSteps = normalizeArray(value);
    }

    @api
    get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: INDICATOR_VARIANTS.default,
            validValues: INDICATOR_VARIANTS.valid
        });
    }

    @api
    get type() {
        return this._type;
    }

    set type(type) {
        this._type = normalizeString(type, {
            fallbackValue: PROGRESS_INDICATOR_TYPES.default,
            validValues: PROGRESS_INDICATOR_TYPES.valid
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
            this.template.querySelectorAll('c-primitive-progress-step')
        );
    }

    updateCurrentStep() {
        const steps = this.getSteps();
        steps.forEach((step) => {
            if (step.value === this.currentStep) {
                step.classList.add('slds-is-active');
            }
        });
    }

    updateErrorSteps() {
        const steps = this.getSteps();
        steps.forEach((step) => {
            this.errorSteps.forEach((error) => {
                if (step.value === error) {
                    step.setIcon('utility:error');
                    step.classList.add('slds-has-error');
                }
            });
        });
    }

    updateWarningSteps() {
        const steps = this.getSteps();
        steps.forEach((step) => {
            this.warningSteps.forEach((warning) => {
                if (step.value === warning) {
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
            this.completedSteps.forEach((completed) => {
                if (step.value === completed) {
                    step.setIcon('utility:success');
                    step.classList.add('slds-is-completed');
                }
            });
        });
    }

    dispatchStepClick() {
        this.dispatchEvent(new CustomEvent('stepclick'));
    }

    dispatchStepBlur() {
        this.dispatchEvent(new CustomEvent('stepblur'));
    }

    dispatchStepFocus() {
        this.dispatchEvent(new CustomEvent('stepfocus'));
    }

    dispatchStepMouseEnter() {
        this.dispatchEvent(new CustomEvent('stepmouseenter'));
    }

    dispatchStepMouseLeave() {
        this.dispatchEvent(new CustomEvent('stepmouseleave'));
    }

    dispatchStepButtonClick() {
        this.dispatchEvent(new CustomEvent('stepbuttonclick'));
    }

    dispatchStepPopoverClick() {
        this.dispatchEvent(new CustomEvent('steppopoverclick'));
    }
}
