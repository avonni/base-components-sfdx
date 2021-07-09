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
import { classSet } from 'c/utils';

const CHIP_VARIANTS = {
    valid: [
        'base',
        'brand',
        'inverse',
        'alt-inverse',
        'success',
        'info',
        'warning',
        'error',
        'offline'
    ],
    default: 'base'
};

export default class AvonniChip extends LightningElement {
    @api label;

    _variant = CHIP_VARIANTS.default;
    _outline = false;
    renderLeft = true;
    renderRight = true;

    renderedCallback() {
        if (this.leftSlot) {
            this.renderLeft = this.leftSlot.assignedElements().length !== 0;
        }
        if (this.rightSlot) {
            this.renderRight = this.rightSlot.assignedElements().length !== 0;
        }
    }

    @api
    get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: CHIP_VARIANTS.default,
            validValues: CHIP_VARIANTS.valid
        });
    }

    @api
    get outline() {
        return this._outline;
    }

    set outline(value) {
        this._outline = normalizeBoolean(value);
    }

    get leftSlot() {
        return this.template.querySelector('slot[name=left]');
    }

    get rightSlot() {
        return this.template.querySelector('slot[name=right]');
    }

    get chipClass() {
        const classes = classSet('slds-badge');

        if (this._outline) {
            classes.add('avonni-outline');
        }

        classes.add(`slds-theme_${this._variant}`);

        return classes.toString();
    }
}
