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

import LightningDatatable from 'lightning/datatable';
import { api } from 'lwc';
import { normalizeArray, normalizeString } from 'c/utilsPrivate';
import {
    getCellValue,
    getCurrentSelectionLength,
    isSelectedRow,
    getChangesForCustomer,
    processInlineEditFinishCustom
} from './avonniInlineEdit';

import avatar from './avonniAvatar.html';
import avatarGroup from './avonniAvatarGroup.html';
import badge from './avonniBadge.html';
import checkboxButton from './avonniCheckboxButton.html';
import colorPicker from './avonniColorPicker.html';
import combobox from './avonniCombobox.html';
import dynamicIcon from './avonniDynamicIcon.html';
import formattedRichText from './avonniFormattedRichText.html';
import image from './avonniImage.html';
import inputCounter from './avonniInputCounter.html';
import inputDateRange from './avonniInputDateRange.html';
import inputRichText from './avonniInputRichText.html';
import inputToggle from './avonniInputToggle.html';
import progressBar from './avonniProgressBar.html';
import progressCircle from './avonniProgressCircle.html';
import progressRing from './avonniProgressRing.html';
import qrcode from './avonniQrcode.html';
import rating from './avonniRating.html';
import textarea from './avonniTextarea.html';
import slider from './avonniSlider.html';
import urls from './avonniUrls.html';

const CUSTOM_TYPES_ALWAYS_WRAPPED = [
    'avatar',
    'badge',
    'avatar-group',
    'checkbox-button',
    'color-picker',
    'combobox',
    'dynamic-icon',
    'image',
    'input-counter',
    'input-date-range',
    'input-rich-text',
    'input-toggle',
    'progress-bar',
    'progress-circle',
    'progress-ring',
    'qrcode',
    'rating',
    'slider',
    'urls'
];

const CUSTOM_TYPES_EDITABLE = [
    'checkbox-button',
    'color-picker',
    'combobox',
    'input-counter',
    'input-date-range',
    'input-rich-text',
    'input-toggle',
    'rating',
    'slider'
];

const COLUMN_WIDTHS_MODES = { valid: ['fixed', 'auto'], default: 'fixed' };

const SORT_DIRECTIONS = { valid: ['asc', 'desc'], default: 'desc' };

/**
 * Lightning datatable with custom cell types and extended functionalities.
 *
 * @class
 * @descriptor avonni-datatable
 * @storyId example-datatable--data-types-from-a-to-b
 * @public
 */
export default class AvonniDatatable extends LightningDatatable {
    static customTypes = {
        avatar: {
            template: avatar,
            typeAttributes: [
                'alternativeText',
                'entityIconName',
                'entitySrc',
                'fallbackIconName',
                'initials',
                'size',
                'presence',
                'primaryText',
                'secondaryText',
                'status',
                'variant'
            ]
        },
        'avatar-group': {
            template: avatarGroup,
            typeAttributes: [
                'layout',
                'maxCount',
                'size',
                'variant',
                'actionIconName',
                'name'
            ]
        },
        badge: {
            template: badge,
            typeAttributes: ['variant']
        },
        'checkbox-button': {
            template: checkboxButton,
            typeAttributes: ['disabled', 'label', 'name']
        },
        'color-picker': {
            template: colorPicker,
            typeAttributes: [
                'colors',
                'disabled',
                'hideColorInput',
                'label',
                'menuAlignment',
                'menuIconName',
                'menuIconSize',
                'menuVariant',
                'name',
                'opacity',
                'type'
            ]
        },
        combobox: {
            template: combobox,
            typeAttributes: [
                'disabled',
                'dropdownAlignment',
                'dropdownLength',
                'isMultiSelect',
                'placeholder',
                'options'
            ]
        },
        'dynamic-icon': {
            template: dynamicIcon,
            typeAttributes: ['alternativeText', 'option']
        },
        'formatted-rich-text': {
            template: formattedRichText,
            typeAttributes: ['disableLinkify']
        },
        image: {
            template: image,
            typeAttributes: [
                'alt',
                'blank',
                'blankColor',
                'height',
                'rounded',
                'sizes',
                'srcset',
                'thumbnail',
                'width'
            ]
        },
        'input-counter': {
            template: inputCounter,
            typeAttributes: ['disabled', 'label', 'max', 'min', 'name', 'step']
        },
        'input-date-range': {
            template: inputDateRange,
            typeAttributes: [
                'dateStyle',
                'disabled',
                'label',
                'labelStartDate',
                'labelEndDate',
                'timeStyle',
                'timezone',
                'type'
            ]
        },
        'input-rich-text': {
            template: inputRichText,
            typeAttributes: ['disabled', 'placeholder', 'variant']
        },
        'input-toggle': {
            template: inputToggle,
            typeAttributes: [
                'disabled',
                'hideMark',
                'label',
                'messageToggleActive',
                'messageToggleInactive',
                'name',
                'size'
            ]
        },
        'progress-bar': {
            template: progressBar,
            typeAttributes: [
                'label',
                'referenceLines',
                'showValue',
                'textured',
                'theme',
                'thickness',
                'valueLabel',
                'valuePostion',
                'variant'
            ]
        },
        'progress-ring': {
            template: progressRing,
            typeAttributes: ['direction', 'hideIcon', 'size', 'variant']
        },
        'progress-circle': {
            template: progressCircle,
            typeAttributes: [
                'color',
                'direction',
                'label',
                'size',
                'thickness',
                'variant'
            ]
        },
        qrcode: {
            template: qrcode,
            typeAttributes: [
                'background',
                'borderColor',
                'borderWidth',
                'color',
                'encoding',
                'errorCorrection',
                'padding',
                'size'
            ]
        },
        rating: {
            template: rating,
            typeAttributes: [
                'disabled',
                'iconName',
                'iconSize',
                'label',
                'max',
                'min',
                'selection',
                'valueHidden'
            ]
        },
        slider: {
            template: slider,
            typeAttributes: ['disabled', 'label', 'max', 'min', 'size', 'step']
        },
        textarea: {
            template: textarea,
            typeAttributes: [
                'disabled',
                'label',
                'maxlength',
                'name',
                'placeholder'
            ]
        },
        urls: {
            template: urls,
            typeAttributes: ['urls']
        }
    };

    connectedCallback() {
        super.connectedCallback();

        this.template.addEventListener(
            'privateeditcustomcell',
            this.handleEditCell
        );

        this.template.addEventListener(
            'privateavatarclick',
            this.handleDispatchEvents
        );

        this.template.addEventListener(
            'privateactionclick',
            this.handleDispatchEvents
        );

        this.template.addEventListener(
            'editbuttonclickcustom',
            this.handleEditButtonClickCustom
        );

        this.template.addEventListener('ieditfinishedcustom', (event) => {
            this.handleInlineEditFinishCustom(event);
        });

        this.template.addEventListener('getdatatablestateandcolumns', (e) => {
            e.detail.callbacks.getStateAndColumns(this.state, this.columns);
        });
    }

    renderedCallback() {
        super.renderedCallback();

        this._data = JSON.parse(JSON.stringify(normalizeArray(super.data)));
        this.computeEditableOption();

        if (this.isLoading) {
            this.template.querySelector(
                'lightning-primitive-datatable-loading-indicator'
            ).style.height = '40px';
        }

        // Make sure custom edited cells stay yellow on hover
        // Make sure error cells appear edited and with a red border
        const edited = Array.from(
            this.template.querySelectorAll('td.slds-is-edited')
        );
        const error = Array.from(
            this.template.querySelectorAll('td.slds-has-error')
        );
        const editCells = edited.concat(error);

        editCells.forEach((cell) => {
            cell.classList.add('slds-cell-edit');
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        this.template.removeEventListener(
            'privateeditcustomcell',
            this.handleEditCell
        );
    }

    /**
     * Array of the columns object that's used to define the data types.
     * Required properties include 'label', 'fieldName', and 'type'. The default type is 'text'.
     * See the Documentation tab for more information.
     * @public
     * @type {array}
     */
    @api
    get columns() {
        return super.columns;
    }

    set columns(value) {
        super.columns = value;

        this._columns = JSON.parse(JSON.stringify(this._columns));
        this.removeWrapOption();
        this.computeEditableOption();
    }

    /**
     * Specifies how column widths are calculated. Set to 'fixed' for columns with equal widths.
     * Set to 'auto' for column widths that are based on the width of the column content and the table width. The default is 'fixed'.
     * @public
     * @type {string}
     * @default fixed
     */
    @api
    get columnWidthsMode() {
        return super.columnWidthsMode;
    }

    set columnWidthsMode(value) {
        super.columnWidthsMode = normalizeString(value, {
            fallbackValue: COLUMN_WIDTHS_MODES.default,
            validValues: COLUMN_WIDTHS_MODES.valid
        });
    }

    /**
     * Specifies the default sorting direction on an unsorted column.
     * Valid options include 'asc' and 'desc'.
     * The default is 'asc' for sorting in ascending order.
     * @public
     * @type {string}
     * @default asc
     */
    @api
    get defaultSortDirection() {
        return super.defaultSortDirection;
    }

    set defaultSortDirection(value) {
        super.defaultSortDirection = normalizeString(value, {
            fallbackValue: SORT_DIRECTIONS.default,
            validValues: SORT_DIRECTIONS.valid
        });
    }

    /**
     * Determines when to trigger infinite loading based on
     * how many pixels the table's scroll position is from the bottom of the table.
     * @public
     * @type {number}
     * @default 20
     */
    @api
    get loadMoreOffset() {
        return super.loadMoreOffset;
    }

    set loadMoreOffset(value) {
        if (value === undefined) return;
        super.loadMoreOffset = value;
    }

    /**
     * The maximum width for all columns.
     * @public
     * @type {number}
     * @default 1000px
     */
    @api
    get maxColumnWidth() {
        return super.maxColumnWidth;
    }

    set maxColumnWidth(value) {
        if (value === undefined) return;
        super.maxColumnWidth = value;
    }

    /**
     * The maximum number of rows that can be selected.
     * Checkboxes are used for selection by default,
     * and radio buttons are used when maxRowSelection is 1.
     * @public
     * @type {number}
     */
    @api
    get maxRowSelection() {
        return super.maxRowSelection;
    }

    set maxRowSelection(value) {
        if (value === undefined) return;
        super.maxRowSelection = value;
    }

    /**
     * The minimum width for all columns.
     * @public
     * @type {number}
     * @default 50px
     */
    @api
    get minColumnWidth() {
        return super.minColumnWidth;
    }

    set minColumnWidth(value) {
        if (value === undefined) return;
        super.minColumnWidth = value;
    }

    /**
     * The array of data to be displayed. The objects keys depend on the columns fieldNames.
     * @public
     * @type {array}
     */
    @api
    get records() {
        return super.data;
    }

    set records(value) {
        super.data = normalizeArray(value);
    }

    /**
     * The width to resize the column when a user presses left or right arrow.
     * @public
     * @type {number}
     * @default 10px
     */
    @api
    get resizeStep() {
        return super.resizeStep;
    }

    set resizeStep(value) {
        if (value === undefined) return;
        super.resizeStep = value;
    }

    /**
     * Determines where to start counting the row number.
     * @public
     * @type {number}
     * @default 0
     */
    @api
    get rowNumberOffset() {
        return super.rowNumberOffset;
    }

    set rowNumberOffset(value) {
        if (value === undefined) return;
        super.rowNumberOffset = value;
    }

    /**
     * Enables programmatic row selection with a list of key-field values.
     * @public
     * @type {string[]}
     */
    @api
    get selectedRows() {
        return super.selectedRows;
    }

    set selectedRows(value) {
        if (value === undefined) return;
        super.selectedRows = value;
    }

    /**
     * Specifies the sorting direction.
     * Sort the data using the onsort event handler.
     * Valid options include 'asc' and 'desc'.
     * @public
     * @type {string}
     */
    @api
    get sortedDirection() {
        return super.sortedDirection;
    }

    set sortedDirection(value) {
        super.sortedDirection = normalizeString(value, {
            fallbackValue: SORT_DIRECTIONS.default,
            validValues: SORT_DIRECTIONS.valid
        });
    }

    /**
     * This value specifies the number of lines after which the
     * content will be cut off and hidden. It must be at least 1 or more.
     * The text in the last line is truncated and shown with an ellipsis.
     * @public
     * @type {integer}
     */
    @api
    get wrapTextMaxLines() {
        return super.wrapTextMaxLines;
    }

    set wrapTextMaxLines(value) {
        if (value === undefined) return;
        super.wrapTextMaxLines = value;
    }

    /**
     * Gets a row height.
     *
     * @param {string} rowKeyField The key field value of the row.
     * @returns {number} The height of the row, in pixels.
     * @public
     */
    @api
    getRowHeight(rowKeyField) {
        const row = this.template.querySelector(
            `tr[data-row-key-value="${rowKeyField}"]`
        );

        if (row) {
            if (rowKeyField === this.data[0][this.keyField]) {
                // The first row has one pixel more because of the border
                return row.offsetHeight + 1;
            }
            return row.offsetHeight;
        }
        return null;
    }

    /**
     * Sets the height of a row.
     *
     * @param {string} rowKeyField The key field value of the row.
     * @param {number} height The new height of the row, in pixels.
     * @public
     */
    @api
    setRowHeight(rowKeyField, height) {
        const row = this.template.querySelector(
            `tr[data-row-key-value="${rowKeyField}"]`
        );

        if (row) {
            row.style.height = height ? `${height}px` : undefined;
        }
    }

    /**
     * Sets the wrapText and hideDefaultActions attributes to true for custom types that are always wrapped.
     */
    removeWrapOption() {
        this.columns.forEach((column) => {
            if (CUSTOM_TYPES_ALWAYS_WRAPPED.includes(column.type)) {
                column.wrapText = true;
                column.hideDefaultActions = true;
            }
        });
    }

    /**
     * If the data type is editable, transforms the value into an object containing the editable property.
     */
    computeEditableOption() {
        if (this.columns && this._data) {
            this.columns.forEach((column) => {
                if (CUSTOM_TYPES_EDITABLE.includes(column.type)) {
                    const fieldName = column.fieldName;
                    this._data.forEach((row) => {
                        const value = row[fieldName];
                        row[fieldName] = {
                            value: value,
                            editable: !!column.editable
                        };
                    });
                }
            });
        }
    }

    /**
     * Handles the edit button click event of each custom cell type.
     *
     * @param {event} event
     */
    handleEditButtonClickCustom(event) {
        event.stopPropagation();
        const { colKeyValue, rowKeyValue, state } = event.detail;
        // eslint-disable-next-line @lwc/lwc/no-api-reassignments
        this.state = state;
        const inlineEdit = this.state.inlineEdit;

        inlineEdit.panelVisible = true;
        inlineEdit.rowKeyValue = rowKeyValue;
        inlineEdit.colKeyValue = colKeyValue;
        inlineEdit.editedValue = getCellValue(
            this.state,
            rowKeyValue,
            colKeyValue
        );
        inlineEdit.massEditSelectedRows = getCurrentSelectionLength(this.state);
        inlineEdit.massEditEnabled =
            isSelectedRow(this.state, rowKeyValue) &&
            inlineEdit.massEditSelectedRows > 1;

        const colIndex = this.state.headerIndexes[colKeyValue];
        inlineEdit.columnDef = this.state.columns[colIndex];
    }

    /**
     * Handles the inline editing event of each custom cell type.
     *
     * @param {event} event
     */
    handleEditCell = (event) => {
        event.stopPropagation();
        const { colKeyValue, rowKeyValue, value } = event.detail;
        const dirtyValues = this.state.inlineEdit.dirtyValues;

        // If no values have been edited in the row yet,
        // create the row object in the state dirty values
        if (!dirtyValues[rowKeyValue]) {
            dirtyValues[rowKeyValue] = {};
        }

        // Add the new cell value to the state dirty values
        dirtyValues[rowKeyValue][colKeyValue] = value;

        const cellChange = { [rowKeyValue]: { [colKeyValue]: value } };

        this.dispatchEvent(
            new CustomEvent('cellchange', {
                detail: {
                    draftValues: getChangesForCustomer(cellChange, this.state)
                }
            })
        );
        // Show yellow background and save/cancel button
        super.updateRowsState(this.state);
    };

    /**
     * Dispatches event from the lighnting-datatable.
     *
     * @param {event} event
     */
    handleDispatchEvents(event) {
        event.stopPropagation();
        this.dispatchEvent(
            new CustomEvent(`${event.detail.type}`, {
                detail: event.detail.detail,
                bubbles: event.detail.bubbles,
                composed: event.detail.composed,
                cancelable: event.detail.cancelable
            })
        );
    }

    /**
     * Handles the finish of inline editing of custom cell type.
     *
     * @param {event} event
     */
    handleInlineEditFinishCustom = (event) => {
        const {
            reason,
            rowKeyValue,
            colKeyValue,
            value,
            valid,
            isMassEditChecked
        } = event.detail;
        processInlineEditFinishCustom(
            this.state,
            reason,
            rowKeyValue,
            colKeyValue,
            value,
            valid,
            isMassEditChecked
        );
    };
}
