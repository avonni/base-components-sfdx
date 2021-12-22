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
import { normalizeString } from 'c/utilsPrivate';

const SCOPED_NOTIFICATION_VARIANTS = {
    valid: ['base', 'dark', 'warning', 'error', 'success'],
    default: 'base'
};
const ICON_SIZES = {
    valid: ['xx-small', 'x-small', 'small', 'medium', 'large'],
    default: 'medium'
};

/**
 * @class
 * @descriptor avonni-scoped-notification
 * @storyId example-scoped-notification--base
 * @public
 */
export default class AvonniScopedNotification extends LightningElement {
    /**
     * Title of the notification.
     *
     * @type {string}
     * @public
     */
    @api title;
    /**
     * The name of the icon to be used in the format 'utility:down'.
     *
     * @type {}
     * @public
     * @default
     */
    @api iconName;

    _variant = SCOPED_NOTIFICATION_VARIANTS.default;
    _iconSize = ICON_SIZES.default;
    showTitle = true;

    renderedCallback() {
        if (this.titleSlot) {
            this.showTitle = this.titleSlot.assignedElements().length !== 0;
        }
    }

    /**
     * Get the title slot DOM element.
     */
    get titleSlot() {
        return this.template.querySelector('slot[name=title]');
    }

    /**
     * The variant changes the look of the scoped notification. Valid values include base, dark, warning, error, success.
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
            fallbackValue: SCOPED_NOTIFICATION_VARIANTS.default,
            validValues: SCOPED_NOTIFICATION_VARIANTS.valid
        });
    }

    /**
     * The size of the icon. Valid options include xx-small, x-small, small, medium, or large.
     *
     * @type {string}
     * @public
     * @default medium
     */
    @api get iconSize() {
        return this._iconSize;
    }

    set iconSize(iconSize) {
        this._iconSize = normalizeString(iconSize, {
            fallbackValue: ICON_SIZES.default,
            validValues: ICON_SIZES.valid
        });
    }

    /**
     * Computed notification class styling.
     *
     * @type {string}
     */
    get computedNotificationClass() {
        return classSet('slds-scoped-notification slds-media slds-media_center')
            .add(`avonni-scoped-notification_theme-${this._variant}`)
            .toString();
    }

    /**
     * Computed Icon variant class based on selection.
     *
     * @type {string}
     */
    get computedIconVariant() {
        return classSet()
            .add({
                inverse:
                    this.variant === 'dark' ||
                    this.variant === 'success' ||
                    this.variant === 'error'
            })
            .toString();
    }
}
