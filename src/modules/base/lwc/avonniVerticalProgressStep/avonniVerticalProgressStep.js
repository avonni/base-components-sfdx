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

export default class AvonniVerticalProgressStep extends LightningElement {
    @api label;

    _value;
    iconName;
    contentInLine = false;

    connectedCallback() {
        this.classList.add('slds-progress__item');
    }

    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this.setAttribute('data-step', value);
    }

    @api
    setAttributes(contentInLine, shade) {
        if (contentInLine) {
            this.contentInLine = contentInLine;
            this.classList.add('avonni-content-in-line');
        }
        if (shade) {
            this.classList.add('avonni-spread');
        }
    }

    @api
    setIcon(iconName) {
        this.iconName = iconName;
    }

    get slotItems() {
        return this.template.querySelector('slot');
    }

    handleMouseEnter() {
        this.dispatchEvent(
            new CustomEvent('stepmouseenter', {
                bubbles: true,
                cancelable: true,
                detail: {
                    value: this.value
                }
            })
        );
    }

    handleMouseLeave() {
        this.dispatchEvent(
            new CustomEvent('stepmouseleave', {
                bubbles: true,
                cancelable: true,
                detail: {
                    value: this.value
                }
            })
        );
    }

    handleFocus() {
        this.dispatchEvent(
            new CustomEvent('stepfocus', {
                bubbles: true,
                cancelable: true,
                detail: {
                    value: this.value
                }
            })
        );
    }

    handleBlur() {
        this.dispatchEvent(
            new CustomEvent('stepblur', {
                bubbles: true,
                cancelable: true,
                detail: {
                    value: this.value
                }
            })
        );
    }
}
