import { LightningElement, api } from 'lwc';
import { normalizeColumns, normalizeRecords } from './avonniNormalizer';
import {
    normalizeArray,
    normalizeBoolean,
    arraysEqual,
    normalizeAriaAttribute
} from 'c/utilsPrivate';

const DEFAULT_MAX_WIDTH = 1000;
const DEFAULT_MIN_WIDTH = 50;
const DEFAULT_ROW_NUMBER_OFFSET = 0;

/**
 * @description Displays a hierarchical view of data in a table.
 *
 * @class
 * @descriptor avonni-tree-grid
 * @storyId example-tree-grid--base
 * @public
 */
export default class AvonniTreeGrid extends LightningElement {
    _ariaLabel;
    _columns;
    _expandedRows = [];
    _hideCheckboxColumn = false;
    _isLoading = false;
    _keyField;
    _maxColumnWidth = DEFAULT_MAX_WIDTH;
    _minColumnWidth = DEFAULT_MIN_WIDTH;
    _records;
    _resizeColumnDisabled = false;
    _rowNumberOffset = DEFAULT_ROW_NUMBER_OFFSET;
    _selectedRows = [];
    _showRowNumberColumn = false;

    // raw values passed in
    _rawColumns;
    _rawRecords;

    // toggle all rows
    _toggleAllRecursionCounter = 1;

    _publicExpandedRows = [];

    constructor() {
        super();
        this.template.addEventListener(
            'privatetogglecell',
            this.handleToggle.bind(this)
        ); // event received by the tree cell type
        this.template.addEventListener(
            'toggleallheader',
            this.handleToggleAll.bind(this)
        ); // event received by the tree column header
    }

    /**
     * Pass through for aria-label on datatable.
     * @type {string}
     * @public
     */
    @api
    get ariaLabel() {
        return this._ariaLabel;
    }
    set ariaLabel(value) {
        this._ariaLabel = normalizeAriaAttribute(value);
    }

    /**
     * Array of the columns object that's used to define the data types.
     * Required properties include 'label', 'fieldName', and 'type'. The default type is 'text'.
     * See the Documentation tab for more information.
     * @type {object[]}
     * @public
     */
    @api
    get columns() {
        return this._rawColumns;
    }

    set columns(value) {
        this._rawColumns = value;
        this._columns = normalizeColumns(value);
    }

    /**
     * The array of records to be displayed.
     * @type {object[]}
     * @public
     */
    @api
    // eslint-disable-next-line @lwc/lwc/valid-api
    get records() {
        return this._rawRecords;
    }

    set records(value) {
        this._rawRecords = value;
        this.flattenData();
    }

    /**
     * The array of unique row IDs for rows that are expanded.
     * @type {string[]}
     * @public
     */
    @api
    get expandedRows() {
        // if we have changes then update the public value
        if (!arraysEqual(this._expandedRows, this._publicExpandedRows)) {
            this._publicExpandedRows = Object.assign([], this._expandedRows);
        }

        // otherwise simply return the current public value
        return this._publicExpandedRows;
    }

    set expandedRows(value) {
        this._publicExpandedRows = Object.assign([], value);
        this._expandedRows = Object.assign([], value);
        this.flattenData();
    }

    /**
     * If present, the checkbox column for row selection is hidden.
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get hideCheckboxColumn() {
        return this._hideCheckboxColumn;
    }

    set hideCheckboxColumn(value) {
        this._hideCheckboxColumn = normalizeBoolean(value);
    }

    /**
     * If present, a spinner is displayed to indicate that more data is being loaded.
     * @type {boolean}
     * @default false
     */
    @api
    get isLoading() {
        return this._isLoading;
    }

    set isLoading(value) {
        this._isLoading = normalizeBoolean(value);
    }

    /**
     * Required for better performance. Associates each row with a unique ID.
     * @type {string}
     * @public
     */
    @api
    get keyField() {
        return this._keyField;
    }

    set keyField(value) {
        this._keyField = value;
        this.flattenData();
    }

    /**
     * The maximum width for all columns. The default is 1000px.
     * @type {number}
     * @default 1000
     * @public
     */
    @api
    get maxColumnWidth() {
        return this._maxColumnWidth;
    }

    set maxColumnWidth(value) {
        const number = isNaN(parseInt(value, 10)) ? DEFAULT_MAX_WIDTH : value;
        this._maxColumnWidth = number;
    }

    /**
     * The minimum width for all columns. The default is 50px.
     * @type {number}
     * @default 50
     * @public
     */
    @api
    get minColumnWidth() {
        return this._minColumnWidth;
    }

    set minColumnWidth(value) {
        const number = isNaN(parseInt(value, 10)) ? DEFAULT_MIN_WIDTH : value;
        this._minColumnWidth = number;
    }

    /**
     * If present, column resizing is disabled.
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get resizeColumnDisabled() {
        return this._resizeColumnDisabled;
    }

    set resizeColumnDisabled(value) {
        this._resizeColumnDisabled = normalizeBoolean(value);
    }

    /**
     * Determines where to start counting the row number. The default is 0.
     * @type {number}
     * @default 0
     * @public
     */
    @api
    get rowNumberOffset() {
        return this._rowNumberOffset;
    }

    set rowNumberOffset(value) {
        const number = isNaN(parseInt(value, 10))
            ? DEFAULT_ROW_NUMBER_OFFSET
            : value;
        this._rowNumberOffset = number;
    }

    /**
     * The array of unique row IDs that are selected.
     * @type {string[]}
     * @public
     */
    @api
    get selectedRows() {
        return this._selectedRows;
    }

    set selectedRows(value) {
        this._selectedRows = normalizeArray(value);
    }

    /**
     * If present, the row number column are shown in the first column.
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get showRowNumberColumn() {
        return this._showRowNumberColumn;
    }

    set showRowNumberColumn(value) {
        this._showRowNumberColumn = normalizeBoolean(value);
    }

    get normalizedColumns() {
        return this._columns;
    }

    get normalizedRecords() {
        return this._records;
    }

    // Methods

    /**
     * Returns data in each selected row.
     * @returns {array} An array of data in each selected row.
     *
     * @public
     */
    @api
    getSelectedRows() {
        return this.template
            .querySelector('avonni-datatable')
            .getSelectedRows();
    }

    /**
     * Returns an array of rows that are expanded.
     * @returns {array} The IDs for all rows that are marked as expanded
     *
     * @public
     */
    @api
    getCurrentExpandedRows() {
        return this.expandedRows;
    }

    /**
     * Expand all rows with children content
     *
     * @public
     */
    @api
    expandAll() {
        this.toggleAllRows(this.records, true);
    }

    /**
     * Collapse all rows
     *
     * @public
     */
    @api
    collapseAll() {
        this.toggleAllRows(this.records, false);
    }

    // Event handlers

    handleToggle(event) {
        event.stopPropagation();
        const { name, nextState } = event.detail;
        // toggle row in user provided data
        this.toggleRow(this.records, name, nextState);
    }

    handleToggleAll(event) {
        event.stopPropagation();
        const { nextState } = event.detail;
        // toggle all rows in user provided data
        this.toggleAllRows(this.records, nextState);
    }

    handleRowSelection(event) {
        event.stopPropagation();
        // pass the event through
        this.fireSelectedRowsChange(event.detail);
    }

    handleHeaderAction(event) {
        event.stopPropagation();
        // pass the event through
        this.fireHeaderAction(event.detail);
    }

    handleRowAction(event) {
        event.stopPropagation();
        // pass the event through
        this.fireRowAction(event.detail);
    }

    // Events

    // fires when a row is toggled and its expanded state changes
    fireRowToggleChange(name, isExpanded, hasChildrenContent, row) {
        /**
         * The event fired when a row is expanded or collapsed.
         *
         * @event
         * @name toggle
         * @param {string} name The unique ID for the row that's toggled.
         * @param {boolean} isExpanded Specifies whether the row is expanded or not.
         * @param {boolean} hasChildrenContent Specifies whether any data is available for the nested items of this row. When value is false, _children is null, undefined, or an empty array. When value is true, _children has a non-empty array.
         * @param {object} row The toggled row data.
         * @public
         */
        const event = new CustomEvent('toggle', {
            detail: { name, isExpanded, hasChildrenContent, row }
        });
        this.dispatchEvent(event);
    }

    // fires when all rows are toggled
    fireToggleAllChange(isExpanded) {
        /**
         * The event fired when all rows are expanded or collapsed.
         *
         * @event
         * @name toggleall
         * @param {boolean} isExpanded Specifies whether the row is expanded or not.
         * @public
         */
        const event = new CustomEvent('toggleall', {
            detail: { isExpanded }
        });
        this.dispatchEvent(event);
    }

    fireSelectedRowsChange(eventDetails) {
        /**
         * The event fired when a row is selected.
         *
         * @event
         * @name rowselection
         * @public
         */
        const event = new CustomEvent('rowselection', {
            detail: eventDetails
        });

        this.dispatchEvent(event);
    }

    fireHeaderAction(eventDetails) {
        /**
         * The event fired when a header-level action is run.
         *
         * @event
         * @name headeraction
         * @public
         */
        const event = new CustomEvent('headeraction', {
            detail: eventDetails
        });

        this.dispatchEvent(event);
    }

    fireRowAction(eventDetails) {
        /**
         * The event fired when a row-level action is run.
         *
         * @event
         * @name rowaction
         * @public
         */
        const event = new CustomEvent('rowaction', {
            detail: eventDetails
        });

        this.dispatchEvent(event);
    }

    // Utility methods
    flattenData() {
        // only flatten data if we have a key field defined
        if (this.keyField) {
            this._records = normalizeRecords(
                this.records,
                this.expandedRows,
                this.keyField
            );
        }
    }

    // update the expandedRows value for a single row
    updateExpandedRows(name, isExpanded) {
        // check if the ID isn't already in the array
        const itemPosition = this._expandedRows.indexOf(name);

        // :: if it is and isExpanded is false, remove it
        if (itemPosition > -1 && isExpanded === false) {
            this._expandedRows.splice(itemPosition, 1);
            // :: if it is not and isExpanded is true, add it
        } else if (itemPosition === -1 && isExpanded) {
            this._expandedRows.push(name);
        }
    }

    // does the provided row have a properly formatted _children key with content?
    hasChildrenContent(row) {
        let hasChildrenContent = false;
        if (
            // eslint-disable-next-line no-prototype-builtins
            row.hasOwnProperty('_children') &&
            Array.isArray(row._children) &&
            row._children.length > 0
        ) {
            hasChildrenContent = true;
        }

        return hasChildrenContent;
    }

    /**
     * Toggle a single row, update flattened data, and fire the `toggle` event
     * @param {object[]} data - tree-grid data
     * @param {string} name - the unique ID of the row to toggle
     * @param {boolean} isExpanded - boolean value specifying whether to expand (true) or collapse (false)
     */
    toggleRow(data, name, isExpanded) {
        // step through the array using recursion until we find the correct row to update
        data.forEach((row) => {
            const hasChildrenContent = this.hasChildrenContent(row);

            // if we find the matching row apply the changes and trigger the collapseChange event
            if (row[this.keyField] === name) {
                this.updateExpandedRows(name, isExpanded);

                // fire the collapseChange event
                this.fireRowToggleChange(
                    name,
                    isExpanded,
                    hasChildrenContent,
                    row
                );
                // if we didn't find the matching node and this node has children then continue deeper into the tree
            } else if (hasChildrenContent) {
                this.toggleRow(row._children, name, isExpanded);
            }
        });

        // update the data
        this.flattenData();
    }

    /**
     * Toggle all rows, update flattened data, and fire the `toggleall` event
     * @param {object[]} data - tree-grid data
     * @param {boolean} isExpanded - boolean value specifying whether to expand (true) or collapse (false)
     * @param {array} rowsToToggle - array of row unique IDs that will be toggled
     */
    toggleAllRows(data, isExpanded, rowsToToggle = []) {
        // if expanding all rows generate list of valid row IDs
        // :: otherwise simply pass the empty array to collapse all
        if (isExpanded) {
            // step through the array using recursion until we find the correct row to update
            data.forEach((row) => {
                const hasChildrenContent = this.hasChildrenContent(row);

                // if row has children content then expand it
                if (hasChildrenContent) {
                    rowsToToggle.push(row[this.keyField]);

                    // continue deeper into the tree if we have valid children content
                    this._toggleAllRecursionCounter++;
                    this.toggleAllRows(row._children, isExpanded, rowsToToggle);
                }
            });
        }

        if (--this._toggleAllRecursionCounter === 0) {
            this._toggleAllRecursionCounter = 1;
            // update the expandedRows value with all valid values
            this._expandedRows = rowsToToggle;

            // fire the toggleAllChange event
            this.fireToggleAllChange(isExpanded);

            // update the data
            this.flattenData();
        }
    }
}
