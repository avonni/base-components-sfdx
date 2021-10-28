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
import { InteractingState } from 'c/inputUtils';

export default class AvonniPrimitiveDatatableIeditPanel extends LightningElement {
    @api visible;
    @api rowKeyValue;
    @api colKeyValue;
    @api editedValue;
    @api columnDef;
    @api isMassEditEnabled = false;
    @api numberOfSelectedRows;

    // Primitive cell combobox
    @api disabled;
    @api dropdownLength;
    @api isMultiSelect;
    @api options;
    @api placeholder;

    connectedCallback() {
        this.interactingState = new InteractingState({
            duration: 10,
            debounceInteraction: true
        });
        this.interactingState.onleave(() => this.handlePanelLoosedFocus());

        this.template.addEventListener(
            'inlineeditchange',
            this.processOnChange
        );
    }

    /**
     * Computed panel class.
     *
     * @type {string}
     */
    get computedPanelClass() {
        return classSet('slds-popover slds-popover_edit')
            .add({
                'slds-show': this.visible,
                'slds-hide': !this.visible
            })
            .toString();
    }

    get inputKey() {
        return this.rowKeyValue + this.colKeyValue;
    }

    get massEditCheckboxLabel() {
        return `Update ${this.numberOfSelectedRows} selected items`;
    }

    get required() {
        return (
            this.columnDef.typeAttributes &&
            this.columnDef.typeAttributes.required
        );
    }

    handleFormStartFocus() {
        this.interactingState.enter();

        if (this.isMassEditEnabled) {
            // on mass edit the panel dont loses the focus with the keyboard.
            this.focusLastElement();
        } else {
            this.triggerEditFinished({
                reason: 'tab-pressed-prev'
            });
        }
    }

    handleFormEndsFocus() {
        this.interactingState.enter();

        if (this.isMassEditEnabled) {
            // on mass edit the panel dont loses the focus with the keyboard.
            this.focus();
        } else {
            this.triggerEditFinished({
                reason: 'tab-pressed-next'
            });
        }
    }

    triggerEditFinished(detail) {
        // for combobox we need to make sure that the value is only set if the there is a change or a submit.
        if (this.value.length !== 0 && typeof this.value !== 'string') {
            detail.rowKeyValue = detail.rowKeyValue || this.rowKeyValue;
            detail.colKeyValue = detail.colKeyValue || this.colKeyValue;
            detail.value = this.value;
            detail.valid = this.validity.valid;
            detail.isMassEditChecked = this.isMassEditChecked;
        }
        this.dispatchEvent(
            new CustomEvent('ieditfinishedcustom', {
                detail: detail,
                bubbles: true,
                composed: true
            })
        );
    }

    @api
    focus() {
        const elem = this.inputableElement;
        this.interactingState.enter();

        if (elem) {
            elem.focus();
        }
    }

    get inputableElement() {
        return this.template.querySelector('.dt-type-edit-factory');
    }

    @api
    get value() {
        return this.inputableElement ? this.inputableElement.value : null;
    }

    @api
    get validity() {
        return this.inputableElement.validity;
    }

    @api
    get isMassEditChecked() {
        return (
            this.isMassEditEnabled &&
            this.template.querySelector('[data-mass-selection="true"]').checked
        );
    }

    @api
    getPositionedElement() {
        return this.template.querySelector('section');
    }

    handleTypeElemBlur() {
        if (this.visible && !this.template.activeElement) {
            this.interactingState.leave();
        }
    }

    handleTypeElemFocus() {
        this.interactingState.enter();
    }

    handleEditFormSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!this.isMassEditEnabled) {
            this.processSubmission();
        }

        return false;
    }

    handleCellKeydown(event) {
        const { keyCode } = event;

        if (keyCode === 27) {
            // Esc key
            event.stopPropagation();
            this.cancelEdition();
        }
    }

    handlePanelLoosedFocus() {
        if (this.visible) {
            this.triggerEditFinished({
                reason: 'loosed-focus'
            });
        }
    }

    focusLastElement() {
        this.template.querySelector('[data-form-last-element="true"]').focus();
    }

    processSubmission() {
        if (this.validity.valid) {
            this.triggerEditFinished({ reason: 'submit-action' });
        } else {
            this.inputableElement.showHelpMessageIfInvalid();
        }
    }

    processOnChange = (event) => {
        if (event.detail.validity) {
            this.triggerEditFinished({ reason: 'on-change' });
        } else {
            this.inputableElement.showHelpMessageIfInvalid();
        }
    };

    cancelEdition() {
        this.triggerEditFinished({
            reason: 'edit-canceled'
        });
    }
}
