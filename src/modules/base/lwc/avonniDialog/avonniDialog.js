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

const DIALOG_SIZES = { valid: ['small', 'medium', 'large'], default: 'medium' };

export default class AvonniDialog extends LightningElement {
    @api dialogName;
    @api title;
    @api loadingStateAlternativeText;

    _size = DIALOG_SIZES.default;
    _isLoading;
    _showDialog = false;
    showFooter = true;
    showHeader = true;

    connectedCallback() {
        this.setAttribute('dialog-name', this.dialogName);
    }

    renderedCallback() {
        if (this.titleSlot) {
            this.showTitleSlot = this.titleSlot.assignedElements().length !== 0;
            this.showHeader = this.title || this.showTitleSlot;
        }

        if (this.footerSlot) {
            this.showFooter = this.footerSlot.assignedElements().length !== 0;
        }
    }

    get titleSlot() {
        return this.template.querySelector('slot[name=title]');
    }

    get footerSlot() {
        return this.template.querySelector('slot[name=footer]');
    }

    @api
    get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: DIALOG_SIZES.default,
            validValues: DIALOG_SIZES.valid
        });
    }

    @api
    get isLoading() {
        return this._isLoading;
    }

    set isLoading(value) {
        this._isLoading = normalizeBoolean(value);
    }

    @api
    get showDialog() {
        return this._showDialog;
    }

    set showDialog(value) {
        this._showDialog = normalizeBoolean(value);
    }

    get hasStringTitle() {
        return !!this.title;
    }

    @api
    show() {
        this._showDialog = true;
    }

    @api
    hide() {
        this._showDialog = false;
        this.dispatchEvent(new CustomEvent('closedialog'));
    }

    get computedHeaderClass() {
        return classSet('slds-modal__header')
            .add({
                'slds-modal__header_empty': !this.showHeader
            })
            .toString();
    }

    get computedModalClass() {
        return classSet('slds-modal slds-fade-in-open')
            .add({
                'slds-modal_small': this._size === 'small',
                'slds-modal_medium': this._size === 'medium',
                'slds-modal_large': this._size === 'large'
            })
            .toString();
    }
}
