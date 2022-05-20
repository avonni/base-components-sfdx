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
import { normalizeBoolean } from 'c/utilsPrivate';

/**
 * The Wizard Step is used in the Wizard slot.
 *
 * @class
 * @descriptor avonni-wizard-step
 * @public
 */
export default class AvonniWizardStep extends LightningElement {
    /**
     * Custom function to execute before advancing to the next step or going back to the previous step. If the value returned is falsy, the step change will be prevented.
     *
     * @type {function}
     * @public
     */
    @api beforeChange = function () {
        return true;
    };
    /**
     * Error message displayed to the user if the before-change function returns false.
     *
     * @type {string}
     * @public
     */
    @api beforeChangeErrorMessage;
    /**
     * Label for the wizard step.
     *
     * @type {string}
     * @public
     */
    @api label;
    /**
     * Unique name of the wizard step.
     *
     * @type {string}
     * @public
     */
    @api name;

    _hideNextFinishButton = false;
    _hidePreviousButton = false;

    stepClass;

    connectedCallback() {
        /**
         * Register the step event.
         *
         * @event
         * @name wizardstepregister
         * @param {function} setClass
         * @param {object} beforeChange
         * @param {string} name
         * @param {string} label
         * @param {boolean} hidePreviousButton
         * @param {boolean} hideNextFinishButton
         * @param {string} beforeChangeErrorMessage
         * @bubbles
         */
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

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * If present, hide the next/finish button.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get hideNextFinishButton() {
        return this._hideNextFinishButton;
    }
    set hideNextFinishButton(value) {
        this._hideNextFinishButton = normalizeBoolean(value);
    }

    /**
     * If present, hide the previous button.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get hidePreviousButton() {
        return this._hidePreviousButton;
    }
    set hidePreviousButton(value) {
        this._hidePreviousButton = normalizeBoolean(value);
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Set the step class value.
     *
     * @param {string} value
     */
    setClass = (value) => {
        this.stepClass = value;
    };
}
