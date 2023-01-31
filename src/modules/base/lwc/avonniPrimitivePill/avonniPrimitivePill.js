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
import { normalizeArray, normalizeString, keyCodes } from 'c/utilsPrivate';
import { classSet } from '../utils/classSet';

const VARIANTS = {
    valid: ['base', 'list'],
    default: 'base'
};

/**
 * @class
 * @descriptor c-primitive-pill
 */
export default class AvonniPrimitivePill extends LightningElement {
    /**
     * Text to display in the pill.
     *
     * @type {string}
     * @public
     */
    @api label;
    /**
     * Name to identify the pill.
     *
     * @type {string}
     * @public;
     */
    @api name;

    _actions = [];
    _avatar;
    _href;
    _variant = VARIANTS.default;

    _focusedActions = false;

    connectedCallback() {
        this.addEventListener('keydown', this.handleKeyDown);
    }

    disconnectedCallback() {
        this.removeEventListener('keydown', this.handleKeyDown);
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Array of action objects. See pill container for allowed keys.
     *
     * @type {object[]}
     * @public
     */
    @api
    get actions() {
        return this._actions;
    }
    set actions(value) {
        this._actions = normalizeArray(value);
        this._focusedActions = false;
    }

    /**
     * Avatar object. See pill container for allowed keys.
     *
     * @type {object}
     * @public
     */
    @api
    get avatar() {
        return this._avatar;
    }
    set avatar(value) {
        this._avatar =
            value instanceof Object && Object.keys(value).length ? value : null;
    }

    /**
     * URL of the page that the pill’s link goes to.
     *
     * @type {string}
     * @public
     */
    @api
    get href() {
        return this._href;
    }
    set href(value) {
        this._href = value;
    }

    /**
     * Variant of the pill. Valid values include base and list.
     *
     * @type {string}
     * @default base
     * @public
     */
    @api
    get variant() {
        return this._variant;
    }
    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: VARIANTS.default,
            validValues: VARIANTS.valid
        });
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    get actionButtonAltText() {
        return this.actions.length > 1 ? 'Actions menu' : this.actions[0].label;
    }

    get actionButtonDisabled() {
        return this.actions.length > 1 ? false : this.actions[0].disabled;
    }

    get actionButtonIconName() {
        return this.actions.length > 1
            ? 'utility:down'
            : this.actions[0].iconName;
    }

    get wrapperClass() {
        return classSet('slds-pill avonni-primitive-pill')
            .add({
                'avonni-primitive-pill__action': !!this._href,
                'avonni-primitive-pill_list': this.variant === 'list'
            })
            .toString();
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Set the focus on the label link.
     */
    @api
    focusLink() {
        const link = this.template.querySelector('[data-element-id="a-label"]');
        if (link) link.focus();
    }

    /*
     * ------------------------------------------------------------
     *  EVENT HANDLERS AND DISPATCHERS
     * -------------------------------------------------------------
     */

    /**
     * Handle a click on an action.
     *
     * @param {Event} event
     */
    handleActionClick(event) {
        if (this.actions.length > 1) {
            this.dispatchEvent(
                new CustomEvent('openactionmenu', {
                    detail: {
                        targetName: this.name,
                        bounds: event.currentTarget.getBoundingClientRect()
                    },
                    bubbles: true
                })
            );
        } else {
            /**
             * The event fired when a user clicks on an action.
             *
             * @event
             * @name actionclick
             * @param {string} name Name of the action.
             * @param {string} targetName Name of the pill the action belongs to.
             * @public
             * @bubbles
             */
            this.dispatchEvent(
                new CustomEvent('actionclick', {
                    detail: {
                        name: this.actions[0].name,
                        targetName: this.name
                    },
                    bubbles: true
                })
            );
        }
    }

    /**
     * Handle a key pressed on the pill.
     *
     * @param {Event} event
     */
    handleKeyDown = (event) => {
        if (
            event.keyCode === keyCodes.tab &&
            this.actions.length &&
            !this._focusedActions &&
            !event.shiftKey
        ) {
            event.preventDefault();
            event.stopPropagation();

            this._focusedActions = true;
            const actionElement = this.template.querySelector(
                '[data-element-id="lightning-button-icon"]'
            );
            actionElement.focus();
        } else {
            this._focusedActions = false;
        }
    };

    /**
     * Handle a mouse button pressed on the pill link or avatar. Prevent them from being dragged, to allow for dragging the whole item when the pill is in a pill container.
     *
     * @param {Event} event
     */
    handleDraggableMouseDown(event) {
        event.preventDefault();
    }
}
