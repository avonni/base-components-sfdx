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
    @api colKeyValue;
    @api columnDef;
    @api editedValue;
    @api isMassEditEnabled = false;
    @api numberOfSelectedRows;
    @api rowKeyValue;
    @api visible = false;

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

        this.template.addEventListener('inlineeditchange', (event) =>
            this.processOnChange(event)
        );
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

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

    /**
     * Returns validity object of inputable element inside inline edit panel.
     *
     * @type {object}
     */
    @api
    get validity() {
        return this.inputableElement ? this.inputableElement.validity : {};
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

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

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
     * Returns true if column type is counter.
     *
     * @type {boolean}
     */
    get isTypeCounter() {
        return this.columnDef.type === 'counter';
    }

    /**
     * Returns true if column type is lookup.
     *
     * @type {boolean}
     */
    get isTypeLookup() {
        return this.columnDef.type === 'lookup';
    }

    /**
     * Returns true if column type is textarea.
     *
     * @type {boolean}
     */
    get isTypeTextArea() {
        return this.columnDef.type === 'textarea';
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
            this.isTypeColorPicker ||
            this.isTypeCounter ||
            this.isTypeTextArea ||
            (this.isTypeCombobox && this.isMultiSelect)
        );
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
     * Returns true if column type is a type that needs apply or cancel button for inline editing.
     *
     * @type {boolean}
     */
    get showButtons() {
        return this.isMassEditEnabled || this.isTypeWithMenu;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    @api
    focus() {
        this.interactingState.enter();

        if (this.inputableElement) {
            this.inputableElement.focus();
        }
    }

    @api
    getPositionedElement() {
        return this.template.querySelector('section');
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    cancelEdition() {
        this.triggerEditFinished({
            reason: 'edit-canceled'
        });
    }

    comboboxFormattedValue(value) {
        switch (value.length) {
            case 0:
                return undefined;
            case 1:
                return value[0];
            default:
                return value;
        }
    }

    dateRangeFormattedValue(value) {
        return {
            startDate: value.startDate,
            endDate: value.endDate
        };
    }

    dispatchCellChangeEvent(state) {
        const dirtyValues = state.inlineEdit.dirtyValues;
        dirtyValues[this.rowKeyValue][this.colKeyValue] = this.value;

        this.dispatchEvent(
            new CustomEvent('cellchangecustom', {
                detail: {
                    draftValues: this.getResolvedCellChanges(state, dirtyValues)
                },
                bubbles: true,
                composed: true
            })
        );
    }

    focusLastElement() {
        this.template.querySelector('[data-form-last-element="true"]').focus();
    }

    getCellChangesByColumn(state, changes) {
        return Object.keys(changes).reduce((result, colKey) => {
            const columns = state.columns;
            const columnIndex = state.headerIndexes[colKey];
            const columnDef = columns[columnIndex];

            result[columnDef.columnKey || columnDef.fieldName] =
                changes[colKey];

            return result;
        }, {});
    }

    getResolvedCellChanges(state, dirtyValues) {
        const keyField = state.keyField;

        return Object.keys(dirtyValues).reduce((result, rowKey) => {
            // Get the changes made by column
            const cellChanges = this.getCellChangesByColumn(
                state,
                dirtyValues[rowKey]
            );

            if (Object.keys(cellChanges).length > 0) {
                // Add identifier for which row has change
                cellChanges[keyField] = rowKey;
                result.push(cellChanges);
            }

            return result;
        }, []);
    }

    handleCellKeydown(event) {
        const { keyCode } = event;

        if (keyCode === 27) {
            // Esc key
            event.stopPropagation();
            this.cancelEdition();
        }
    }

    handleEditFormSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!this.isMassEditEnabled && !this.isTypeColorPicker) {
            this.processSubmission();
        }

        return false;
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

    handleMassEditCheckboxClick() {
        if (this.inputableElement && !this.isTypeDateRange) {
            this.inputableElement.focus();
        }
    }

    handlePanelLoosedFocus() {
        if (this.isTypeLookup && this.visible) {
            this.processSubmission();
        } else if (this.visible) {
            this.triggerEditFinished({
                reason: 'loosed-focus'
            });
        }
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

    processSubmission() {
        const validity =
            this.isTypeRichText || this.inputableElement.validity.valid;
        this.triggerEditFinished({ reason: 'submit-action', validity });

        const detail = {
            rowKeyValue: this.rowKeyValue,
            colKeyValue: this.colKeyValue,
            value: this.isTypeDateRange
                ? this.dateRangeFormattedValue(this.value)
                : this.value,
            callbacks: {
                dispatchCellChangeEvent: this.dispatchCellChangeEvent.bind(this)
            }
        };
        if (this.isTypeRichText || validity) {
            this.dispatchEvent(
                new CustomEvent('privateeditcustomcell', {
                    detail,
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
            this.triggerEditFinished({
                reason: 'on-change',
                validity: event.detail.validity
            });
        } else {
            this.inputableElement.showHelpMessageIfInvalid();
        }
    };

    triggerEditFinished(detail) {
        const details = {
            rowKeyValue: detail.rowKeyValue || this.rowKeyValue,
            colKeyValue: detail.colKeyValue || this.colKeyValue,
            valid: this.isTypeRichText ? true : detail.validity,
            isMassEditChecked: this.isMassEditChecked
        };

        if (this.isTypeCombobox) {
            details.value = this.comboboxFormattedValue(this.value);
        } else {
            details.value = this.isTypeDateRange
                ? this.dateRangeFormattedValue(this.value)
                : this.value;
        }

        this.dispatchEvent(
            new CustomEvent('ieditfinishedcustom', {
                detail: details,
                bubbles: true,
                composed: true
            })
        );
    }
}
