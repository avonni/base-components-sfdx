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

const DEFAULT_TAB_INDEX = '0';

export default class AvonniSubmenu extends LightningElement {
    @api accessKey;
    @api draftAlternativeText;
    @api iconName;
    @api label;
    @api prefixIconName;

    _tabIndex = DEFAULT_TAB_INDEX;
    _disabled = false;
    _isDraft = false;
    isOpen = false;
    init = false;

    connectedCallback() {
        this.classList.add('slds-dropdown__item');
        this.classList.add('avonni-submenu');
    }

    @api get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    @api get isDraft() {
        return this._isDraft;
    }

    set isDraft(value) {
        this._isDraft = normalizeBoolean(value);
    }

    @api get tabIndex() {
        return this._tabIndex;
    }

    set tabIndex(newValue) {
        this._tabIndex = newValue;
    }

    @api
    focus() {
        this.template.querySelector('a').focus();
        this.dispatchEvent(new CustomEvent('focus'));
    }

    @api
    close() {
        this.isOpen = false;
    }

    handleBlur() {
        this.dispatchEvent(new CustomEvent('blur'));

        this.dispatchEvent(
            new CustomEvent('privateblur', {
                composed: true,
                bubbles: true,
                cancelable: true
            })
        );
    }

    handleFocus() {
        this.dispatchEvent(
            new CustomEvent('privatefocus', {
                bubbles: true,
                cancelable: true
            })
        );
    }

    handleMouseEnter(event) {
        if (!this._disabled) {
            if (this.isOpen) {
                this.querySelectorAll('.avonni-submenu').forEach((submenu) => {
                    submenu.close();
                });
            } else {
                this.dispatchSelect();
            }

            this.isOpen = true;
            event.stopPropagation();
        }

        event.preventDefault();
    }

    dispatchSelect() {
        this.dispatchEvent(
            new CustomEvent('privateselect', {
                bubbles: true,
                cancelable: true,
                detail: {
                    type: 'submenu'
                }
            })
        );
    }
}
