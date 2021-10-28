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

const validVariants = ['base', 'comment'];

/**
 * @class
 * @descriptor avonni-publisher
 * @storyId example-publisher--variant-base
 * @public
 */
export default class AvonniPublisher extends LightningElement {
    /**
     * Text that is displayed when the field is empty, to prompt the user for a valid entry.
     *
     * @type {string}
     * @public
     */
    @api placeholder;
    /**
     * Optional text to be shown on the button.
     *
     * @type {string}
     * @public
     */
    @api buttonLabel;
    @api submitAction; //? in use ??

    _variant = 'base';
    _disabled;
    isActive = false;
    _value;
    showFigureSlot = true;
    showActionsSlot = true;

    renderedCallback() {
        if (this.isActive) {
            this.template.querySelector('.richTextPublisher').focus();
        }

        if (this.figureSlot) {
            this.showFigureSlot =
                this.figureSlot.assignedElements().length !== 0 &&
                this._variant === 'comment';
        }

        if (this.actionsSlot) {
            this.showActionsSlot =
                this.actionsSlot.assignedElements().length !== 0;
        }
    }

    /**
     * Get figure slot DOM element.
     *
     * @type {Element}
     */
    get figureSlot() {
        return this.template.querySelector('slot[name=figure]');
    }

    /**
     * Get figure slot DOM element.
     *
     * @type {Element}
     */
    get actionsSlot() {
        return this.template.querySelector('slot[name=actions]');
    }

    /**
     * Valid variants include base and comment
     *
     * @type {string}
     * @public
     * @default base
     */
    @api get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: 'base',
            validValues: validVariants
        });
    }

    /**
     * If present, the publisher can't be used by users.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    /**
     * The HTML content in the rich text editor.
     *
     * @type {string}
     * @public
     */
    @api get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }

    /**
     * Compute Publisher class isActive.
     *
     * @type {string}
     */
    get publisherClass() {
        return classSet('slds-publisher')
            .add({
                'slds-is-active': this.isActive
            })
            .toString();
    }

    /**
     * Compute actions section class.
     *
     * @type {string}
     */
    get actionsSectionClass() {
        return classSet('slds-publisher__actions slds-grid')
            .add({
                'slds-grid_align-spread': this.showActionsSlot,
                'slds-grid_align-end': !this.showActionsSlot
            })
            .toString();
    }

    /**
     * Set focus on the publisher.
     *
     * @public
     */
    @api
    focus() {
        this.isActive = true;
    }

    /**
     * Removes focus from the publisher.
     *
     * @public
     */
    @api
    blur() {
        if (this.isActive) {
            this.template.querySelector('.richTextPublisher').blur();
        }
    }

    /**
     * Change event handler.
     *
     * @param {Event} event
     */
    handleChange(event) {
        this._value = event.detail.value;
    }

    /**
     * Click submit event handler.
     */
    handlerClick() {
        if (this.isActive) {
            /**
             * The event fired when the publisher submit data.
             *
             * @event
             * @name submit
             * @param {string} value The input value.
             * @public
             */
            const selectedEvent = new CustomEvent('submit', {
                detail: {
                    value: this._value
                }
            });
            this.dispatchEvent(selectedEvent);

            this.isActive = false;
            this._value = '';
        } else {
            this.isActive = true;
        }
    }

    /**
     * Check if the button is disabled.
     *
     * @type {boolean}
     */
    get buttonDisabled() {
        return (this.isActive && !this.value) || this._disabled;
    }

    /**
     * Render button on base variant or isActive.
     */
    get renderButton() {
        return this._variant === 'base' || this.isActive;
    }
}
