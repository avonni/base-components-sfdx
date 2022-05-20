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

export default class AvonniPrimitiveDatatableIeditPanelCustom extends LightningElement {
    @api visible;
    @api rowKeyValue;
    @api colKeyValue;
    @api editedValue;
    @api columnDef;
    @api isMassEditEnabled = false;
    @api numberOfSelectedRows;

    //shared
    @api disabled;
    @api label;
    @api name;
    @api placeholder;
    @api type;

    // Primitive cell color-picker
    @api colors;
    @api hideColorInput;
    @api menuAlignment;
    @api menuIconName;
    @api menuIconSize;
    @api menuVariant;
    @api opacity;

    // Primitive cell combobox
    @api dropdownLength;
    @api isMultiSelect;
    @api options;

    // Primitive cell counter
    @api max;
    @api min;
    @api step;

    // Primitive cell date-range
    @api startDate;
    @api endDate;
    @api dateStyle;
    @api timeStyle;
    @api timezone;
    @api labelStartDate;
    @api labelEndDate;

    // primitive cell textarea
    @api maxLength;
    @api minLength;

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

    /**
     * Returns the checkbox label when mass edit.
     *
     * @type {string}
     */
    get massEditCheckboxLabel() {
        return `Update ${this.numberOfSelectedRows} selected items`;
    }

    /**
     * Returns true if column is required.
     *
     * @type {boolean}
     */
    get required() {
        return (
            this.columnDef.typeAttributes &&
            this.columnDef.typeAttributes.required
        );
    }

    /**
     * Returns true if column type is rich-text.
     *
     * @type {boolean}
     */
    get isTypeRichText() {
        return this.columnDef.type === 'rich-text';
    }

    /**
     * Returns true if column type is date-range.
     *
     * @type {boolean}
     */
    get isTypeDateRange() {
        return this.columnDef.type === 'date-range';
    }

    /**
     * Returns true if column type is color-picker.
     *
     * @type {boolean}
     */
    get isTypeColorPicker() {
        return this.columnDef.type === 'color-picker';
    }

    /**
     * Returns true if column type is combobox.
     *
     * @type {boolean}
     */
    get isTypeCombobox() {
        return this.columnDef.type === 'combobox';
    }

    /**
     * Returns true if column type is type with menu.
     *
     * @type {boolean}
     */
    get isTypeWithMenu() {
        return (
            this.isTypeRichText ||
            this.isTypeDateRange ||
            this.isTypeColorPicker
        );
    }

    /**
     * Returns true if column type is a type that needs apply or cancel button for inline editing.
     *
     * @type {boolean}
     */
    get showButtons() {
        return (
            this.isMassEditEnabled ||
            this.isTypeWithMenu ||
            this.columnDef.type === 'counter' ||
            this.columnDef.type === 'textarea'
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

    editedFormattedValue(value) {
        return this.isTypeDateRange
            ? {
                  startDate: value.startDate,
                  endDate: value.endDate
              }
            : value;
    }

    triggerEditFinished(detail) {
        // for combobox we need to make sure that the value is only set if the there is a change, a submit or a valid value.
        if (
            !this.isTypeCombobox ||
            (this.isTypeCombobox && this.value.length !== 0)
        ) {
            detail.rowKeyValue = detail.rowKeyValue || this.rowKeyValue;
            detail.colKeyValue = detail.colKeyValue || this.colKeyValue;
            detail.valid = this.isTypeRichText ? true : this.validity.valid;
            detail.isMassEditChecked = this.isMassEditChecked;
            detail.value = this.editedFormattedValue(this.value);
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
        this.interactingState.enter();

        if (this.inputableElement) {
            this.inputableElement.focus();
        }
    }

    /**
     * Returns element inputable element inside inline edit panel.
     *
     * @type {element}
     */
    get inputableElement() {
        return this.template.querySelector(
            '[data-element-id="dt-type-edit-factory-custom"]'
        );
    }

    /**
     * Returns value of inputable element inside inline edit panel.
     *
     * @type {(string|object)}
     */
    @api
    get value() {
        return this.inputableElement ? this.inputableElement.value : undefined;
    }

    /**
     * Returns validity object of inputable element inside inline edit panel.
     *
     * @type {object}
     */
    @api
    get validity() {
        return this.inputableElement
            ? this.inputableElement.validity
            : undefined;
    }

    /**
     * Returns true if massEdit is enabled and checkbox is checked.
     *
     * @type {boolean}
     */
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
        if (
            this.visible &&
            !this.template.activeElement &&
            !this.isTypeWithMenu
        ) {
            this.interactingState.leave();
        }
        if (this.isTypeWithMenu && this._allowBlur) {
            this.interactingState.leave();
        }
    }

    handleTypeElemFocus() {
        this.interactingState.enter();
    }

    handleTypeElemMouseLeave() {
        this._allowBlur = true;
    }

    handleTypeElemMouseEnter() {
        this._allowBlur = false;
    }

    handleEditFormSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!this.isMassEditEnabled && !this.isTypeColorPicker) {
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
        this.triggerEditFinished({ reason: 'submit-action' });
        // if type input rich text, there is no validity check.
        if (this.isTypeRichText) {
            this.dispatchEvent(
                new CustomEvent('privateeditcustomcell', {
                    detail: {
                        rowKeyValue: this.rowKeyValue,
                        colKeyValue: this.colKeyValue,
                        value: this.value
                    },
                    bubbles: true,
                    composed: true
                })
            );
        } else if (this.validity.valid) {
            this.dispatchEvent(
                new CustomEvent('privateeditcustomcell', {
                    detail: {
                        rowKeyValue: this.rowKeyValue,
                        colKeyValue: this.colKeyValue,
                        value: this.editedFormattedValue(this.value)
                    },
                    bubbles: true,
                    composed: true
                })
            );
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

    handleMassEditCheckboxClick() {
        if (this.inputableElement && !this.isTypeDateRange) {
            this.inputableElement.focus();
        }
    }
}
