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
import { normalizeArray, normalizeBoolean } from 'c/utilsPrivate';
import { generateUUID } from 'c/utils';

export default class AvonniPrimitiveComboboxGroup extends LightningElement {
    @api label;
    @api name;

    _groups = [];
    _options = [];
    _removeSelectedOptions = false;

    renderedCallback() {
        // The group is added to the id to be able to make the difference between
        // the two versions of the same option, when an option is in several groups.
        const options = this.template.querySelectorAll('.combobox__option');
        options.forEach((option, index) => {
            option.id = `${this.name}-${index}`;
        });
    }

    @api
    get options() {
        return this._options;
    }
    set options(value) {
        this._options = normalizeArray(value);
    }

    @api
    get groups() {
        return this._groups;
    }
    set groups(value) {
        this._groups = normalizeArray(value);
    }

    @api
    get removeSelectedOptions() {
        return this._removeSelectedOptions;
    }
    set removeSelectedOptions(value) {
        this._removeSelectedOptions = normalizeBoolean(value);
    }

    @api
    get titleElement() {
        return this.template.querySelector('.combobox__group-title');
    }

    @api
    get optionElements() {
        if (!this.options) return null;

        const options = Array.from(
            this.template.querySelectorAll('.combobox__option')
        );

        if (this.groups) {
            const groups = Array.from(
                this.template.querySelectorAll('[data-element-id^="avonni-primitive-combobox-group"]')
            );
            groups.forEach((group) => {
                options.push(group.optionElements);
            });
        }
        return options.flat();
    }

    get generateKey() {
        return generateUUID();
    }

    handleAction(event) {
        this.dispatchEvent(
            new CustomEvent(`privateoption${event.type}`, {
                detail: {
                    id: event.currentTarget.id
                },
                bubbles: true,
                composed: true
            })
        );
    }
}
