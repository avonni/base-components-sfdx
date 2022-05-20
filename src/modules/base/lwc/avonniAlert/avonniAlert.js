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
import { classSet } from 'c/utils';
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';

const ALERT_VARIANTS = {
    valid: ['base', 'error', 'offline', 'warning'],
    default: 'base'
};

/**
 * Alert banners communicate a state that affects the entire system, not just a feature or page. It persists over a session and appears without the user initiating the action.
 * @class
 * @name Alert
 * @public
 * @storyId example-alert--base
 * @descriptor avonni-alert
 */
export default class AvonniAlert extends LightningElement {
    /**
     * The Lightning Design System name of the icon. Specify the name in the format 'utility:down' where 'utility' is the category, and 'down' is the specific icon to be displayed.
     * @type {string}
     * @public
     */
    @api iconName;

    /**
     * Custom function to execute when the user closes the alert.
     * @type {function}
     * @public
     */
    @api closeAction;

    hideAlert;
    _variant = ALERT_VARIANTS.default;
    _isDismissible = false;

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * The variant change the apparence of the alert. Valid values include base, error, offline and warning.
     * @type {string}
     * @default base
     * @public
     */
    @api
    get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: ALERT_VARIANTS.default,
            validValues: ALERT_VARIANTS.valid
        });
    }

    /**
     * Specify if the alert can be closed.
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get isDismissible() {
        return this._isDismissible;
    }
    set isDismissible(value) {
        this._isDismissible = normalizeBoolean(value);
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Wrapper div class, depending on the variant value.
     * @type {string}
     */
    get variantClass() {
        return classSet('avonni-notify_alert')
            .add(`avonni-alert_${this._variant}`)
            .toString();
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Hide the alert and execute the close action.
     */
    closeAlert() {
        this.hideAlert = true;
        this.closeAction();
    }
}
