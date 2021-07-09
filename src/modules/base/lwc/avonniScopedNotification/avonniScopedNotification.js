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

const SCOPED_NOTIFICATION_VARIANTS = {valid: ['base', 'light', 'dark', 'warning', 'error', 'success'], default: 'base'};
const ICON_SIZES = {valid: ['xx-small', 'x-small', 'small', 'medium', 'large'], default: 'medium'};

export default class AvonniScopedNotification extends LightningElement {
    @api title;
    @api iconName;

    _variant = SCOPED_NOTIFICATION_VARIANTS.default;
    _iconSize = ICON_SIZES.default;
    showTitle = true;

    renderedCallback() {
        if (this.titleSlot) {
            this.showTitle = this.titleSlot.assignedElements().length !== 0;
        }
    }

    get titleSlot() {
        return this.template.querySelector('slot[name=title]');
    }

    @api get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: SCOPED_NOTIFICATION_VARIANTS.default,
            validValues: SCOPED_NOTIFICATION_VARIANTS.valid
        });
    }

    @api get iconSize() {
        return this._iconSize;
    }

    set iconSize(iconSize) {
        this._iconSize = normalizeString(iconSize, {
            fallbackValue: ICON_SIZES.default,
            validValues: ICON_SIZES.valid
        });
    }

    get computedNotificationClass() {
        return classSet('slds-scoped-notification slds-media slds-media_center')
            .add({
                'slds-scoped-notification_light': this.variant === 'light',
                'slds-scoped-notification_dark': this.variant === 'dark',
                'avonni-scoped-notification_warning':
                    this.variant === 'warning',
                'avonni-scoped-notification_error': this.variant === 'error',
                'avonni-scoped-notification_success': this.variant === 'success'
            })
            .toString();
    }

    get computedIconVariant() {
        return classSet()
            .add({
                inverse: this.variant === 'dark',
                warning: this.variant === 'warning',
                error: this.variant === 'error',
                success: this.variant === 'success'
            })
            .toString();
    }
}
