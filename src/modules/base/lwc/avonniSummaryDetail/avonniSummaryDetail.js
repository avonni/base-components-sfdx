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
import { classSet } from 'c/utils';

const DEFAULT_SHRINK_ICON_NAME = 'utility:chevrondown';
const DEFAULT_EXPAND_ICON_NAME = 'utility:chevronright';

export default class AvonniSummaryDetail extends LightningElement {
    @api title;

    _removeBodyIndentation;
    _shrinkIconName = DEFAULT_SHRINK_ICON_NAME;
    _expandIconName = DEFAULT_EXPAND_ICON_NAME;
    _fullWidth;
    _closed;
    _hideIcon;

    @api
    get shrinkIconName() {
        return this._shrinkIconName;
    }
    set shrinkIconName(name) {
        this._shrinkIconName = (typeof name === 'string' && name.trim()) || '';
    }

    @api
    get expandIconName() {
        return this._expandIconName;
    }
    set expandIconName(name) {
        this._expandIconName = (typeof name === 'string' && name.trim()) || '';
    }

    @api
    get fullWidth() {
        return this._fullWidth;
    }
    set fullWidth(boolean) {
        this._fullWidth = normalizeBoolean(boolean);
    }

    @api
    get removeBodyIndentation() {
        return this._removeBodyIndentation;
    }
    set removeBodyIndentation(boolean) {
        this._removeBodyIndentation = normalizeBoolean(boolean);
    }

    @api
    get closed() {
        return this._closed;
    }
    set closed(value) {
        this._closed = normalizeBoolean(value);
    }

    @api
    get hideIcon() {
        return this._hideIcon;
    }
    set hideIcon(value) {
        this._hideIcon = normalizeBoolean(value);
    }

    get sectionIsOpen() {
        return !this._closed;
    }

    get sectionClass() {
        return classSet('slds-summary-detail')
            .add({
                'slds-is-open': this.sectionIsOpen
            })
            .toString();
    }

    get titleClass() {
        return classSet('avonni-min-width_0').add({
            'slds-col': this.fullWidth
        });
    }

    get bodyClass() {
        return classSet('avonni-min-width_0').add({
            'slds-col': this.fullWidth
        });
    }

    get contentClass() {
        return classSet('slds-summary-detail__content').add({
            'content_no-indent': this.removeBodyIndentation && !this.hideIcon
        });
    }

    get iconName() {
        return this.closed ? this.expandIconName : this.shrinkIconName;
    }

    changeSectionStatus() {
        this._closed = !this._closed;

        this.dispatchEvent(
            new CustomEvent('toggle', {
                detail: {
                    closed: this._closed
                }
            })
        );
    }
}
