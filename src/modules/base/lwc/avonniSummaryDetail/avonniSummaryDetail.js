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

/**
 * @class
 * @descriptor avonni-summary-detail
 * @storyId example-summary-detail--base
 * @public
 */
export default class AvonniSummaryDetail extends LightningElement {
    /**
     * The title can include text, and is displayed in the header. To include additional markup or another component, use the title slot.
     *
     * @type {string}
     * @public
     */
    @api title;

    _removeBodyIndentation;
    _shrinkIconName = DEFAULT_SHRINK_ICON_NAME;
    _expandIconName = DEFAULT_EXPAND_ICON_NAME;
    _fullWidth;
    _closed;
    _hideIcon;

    /**
     * Name of the icon used to close the summary detail, in the format utility:down.
     *
     * @type {string}
     * @public
     * @default utility:chevrondown
     */
    @api
    get shrinkIconName() {
        return this._shrinkIconName;
    }
    set shrinkIconName(name) {
        this._shrinkIconName = (typeof name === 'string' && name.trim()) || '';
    }

    /**
     * Name of the icon used to expand the summary detail, in the format utility:down.
     *
     * @type {string}
     * @public
     * @default utility:chevronright
     */
    @api
    get expandIconName() {
        return this._expandIconName;
    }
    set expandIconName(name) {
        this._expandIconName = (typeof name === 'string' && name.trim()) || '';
    }

    /**
     * If present, the summary detail will take the full width available.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get fullWidth() {
        return this._fullWidth;
    }
    set fullWidth(boolean) {
        this._fullWidth = normalizeBoolean(boolean);
    }

    /**
     * If present, the body left indentation will be removed.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get removeBodyIndentation() {
        return this._removeBodyIndentation;
    }
    set removeBodyIndentation(boolean) {
        this._removeBodyIndentation = normalizeBoolean(boolean);
    }

    /**
     * If present, the summary detail is closed by default.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get closed() {
        return this._closed;
    }
    set closed(value) {
        this._closed = normalizeBoolean(value);
    }

    /**
     * If present, the icon to close/expand is hidden.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get hideIcon() {
        return this._hideIcon;
    }
    set hideIcon(value) {
        this._hideIcon = normalizeBoolean(value);
    }

    /**
     * Verify if the section is opened.
     *
     * @type {boolean}
     */
    get sectionIsOpen() {
        return !this._closed;
    }

    /**
     * Compute section class based on open status.
     *
     * @type {string}
     */
    get sectionClass() {
        return classSet('slds-summary-detail')
            .add({
                'slds-is-open': this.sectionIsOpen
            })
            .toString();
    }

    /**
     * Compute title class based on fullwidth.
     *
     * @type {string}
     */
    get titleClass() {
        return classSet('avonni-summary-detail_min-width').add({
            'slds-col': this.fullWidth
        });
    }

    /**
     * Compute body class based on fullwidth.
     *
     * @type {string}
     */
    get bodyClass() {
        return classSet('avonni-summary-detail_min-width').add({
            'slds-col': this.fullWidth
        });
    }

    /**
     * Compute content class based on body identation and icon visible.
     *
     * @type {string}
     */
    get contentClass() {
        return classSet('slds-summary-detail__content').add({
            'avonni-summary-detail__content_no-indent':
                this.removeBodyIndentation && !this.hideIcon
        });
    }

    /**
     * If present, expand the icon name , else shrink it.
     */
    get iconName() {
        return this.closed ? this.expandIconName : this.shrinkIconName;
    }

    /**
     * Toggle status of the section from closed to open.
     */
    changeSectionStatus() {
        this._closed = !this._closed;

        /**
         * The event fired when a user clicks on the icon to open or close the summary detail. An external toggle by changing the closed attribute does not emit this event.
         *
         * @event
         * @name toggle
         * @param {boolean} closed True if the summary is closed.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('toggle', {
                detail: {
                    closed: this._closed
                }
            })
        );
    }
}
