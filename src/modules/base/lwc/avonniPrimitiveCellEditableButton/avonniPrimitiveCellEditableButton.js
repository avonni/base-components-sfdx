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

const i18n = {
    edit: 'Edit',
    editHasError: 'Error'
};

export default class AvonniPrivateCellEditableButton extends LightningElement {
    @api columnLabel;
    @api hasError;

    _htmlButton = null;

    @api
    focus() {
        if (this.htmlButton) {
            this.htmlButton.focus();
        }
    }

    @api
    click() {
        if (this.htmlButton) {
            this.htmlButton.click();
        }
    }

    @api
    get tabIndex() {
        return this.getAttribute('tabindex');
    }

    set tabIndex(value) {
        this.setAttribute('tabindex', value);
    }

    get htmlButton() {
        if (!this._htmlButton) {
            this._htmlButton = this.template.querySelector('button');
        }

        return this._htmlButton;
    }

    disconnectedCallback() {
        this._htmlButton = null;
    }

    get assistiveText() {
        const suffix = this.hasError ? ` ${i18n.editHasError}` : '';

        return `${i18n.edit} ${this.columnLabel}${suffix}`;
    }
}
