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

const SEGMENT_BUTTON_TYPES = {
    valid: ['button', 'reset', 'submit'],
    default: 'button'
};

/**
 * @class
 * @descriptor avonni-segment-button
 * @storyId example-segment--base
 */
export default class AvonniSegmentButton extends LightningElement {
    /**
     * The button label.
     *
     * @type {string}
     * @public
     */
    @api label;
    /**
     * The name of the icon to be used in the format 'utility:down'.
     *
     * @type {string}
     * @public
     */
    @api iconName;
    /**
     * The name of an icon to display before the text of the button.
     *
     * @type {string}
     * @public
     */
    @api prefixIconName;

    _value;
    _type = SEGMENT_BUTTON_TYPES.default;
    _disabled = false;

    /**
     * The value of the segment button.
     *
     * @type {string}
     * @public
     */
    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this.setAttribute('data-value', value);
    }

    /**
     * The type of the button. Values include button, reset, submit.
     *
     * @type {string}
     * @public
     * @default button
     */
    @api get type() {
        return this._type;
    }

    set type(value) {
        this._type = normalizeString(value, {
            fallbackValue: SEGMENT_BUTTON_TYPES.default,
            validValues: SEGMENT_BUTTON_TYPES.valid
        });
    }

    /**
     * If true, the user cannot interact with the segment button.
     *
     * @type {boolean}
     * @public
     */
    @api get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    /**
     * Button disabled method.
     */
    @api
    disableButton() {
        this._disabled = true;
    }

    /**
     * Button click event handler.
     *
     * @param {Event} event
     */
    handleButtonClick(event) {
        /**
         * The event fired when the button is clicked.
         *
         * @event
         * @name click
         * @param {string} value
         * @public
         * @bubbles
         * @cancelable
         */
        this.dispatchEvent(
            new CustomEvent('click', {
                bubbles: true,
                cancelable: true,
                detail: {
                    value: this.value
                }
            })
        );

        event.stopPropagation();
    }
}
