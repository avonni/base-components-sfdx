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
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';

const INDICATOR_VARIANTS = { valid: ['base', 'shaded'], default: 'base' };

export default class AvonniVerticalProgressIndicator extends LightningElement {
    @api currentStep;

    _variant = INDICATOR_VARIANTS.default;
    _hasError = false;
    _contentInLine = false;

    renderedCallback() {
        let elements = this.template.querySelector('slot').assignedElements();
        let indexCompleted = 0;

        elements.forEach((element, index) => {
            element.setAttributes(
                this.contentInLine,
                this.variant === 'shaded'
            );

            if (element.getAttribute('data-step') === this.currentStep) {
                indexCompleted = index;
            }
        });

        elements.forEach((element, index) => {
            element.classList.remove('slds-has-error');
            element.classList.remove('slds-is-active');
            element.classList.remove('slds-is-completed');
            element.setIcon(undefined);

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
            fallbackValue: INDICATOR_VARIANTS.default,
            validValues: INDICATOR_VARIANTS.valid
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
