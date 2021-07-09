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

const SEGMENT_VARIANTS = {valid: ['shade', 'success', 'warning', 'error'], default: 'shade'};

export default class AvonniSegment extends LightningElement {
    @api value;

    _variant = SEGMENT_VARIANTS.default;
    _disabled = false;

    renderedCallback() {
        this.moveSwitch(this.value);

        if (this.disabled) {
            let buttons = this.template
                .querySelector('slot')
                .assignedElements();

            buttons.forEach((button) => {
                button.disableButton();
            });
        }
    }

    @api get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: SEGMENT_VARIANTS.default,
            validValues: SEGMENT_VARIANTS.valid
        });
    }

    @api get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    get computedSegmentClass() {
        return `avonni-segment-container avonni-segment-${this.variant}`;
    }

    handleClick(event) {
        if (event.detail.value !== undefined) {
            this.moveSwitch(event.detail.value);

            this.dispatchEvent(
                new CustomEvent('change', {
                    bubbles: true,
                    cancelable: true,
                    detail: {
                        value: event.detail.value
                    }
                })
            );
        }
    }

    moveSwitch(value) {
        let segmentButton = this.querySelector(`[data-value='${value}']`);
        let switchContainer = this.template.querySelector(
            '.avonni-switch-container'
        );

        if (segmentButton) {
            switchContainer.style.left = `${segmentButton.offsetLeft - 4}px`;
            switchContainer.style.width = `${segmentButton.offsetWidth + 1}px`;
        }
    }
}
