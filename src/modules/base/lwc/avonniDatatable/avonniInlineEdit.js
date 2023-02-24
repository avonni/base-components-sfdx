/**
 * Get row index by the key field value.
 *
 * @param {Object} state - the datatable state
 * @param {string} key - key field of the row
 */
export function getRowIndexByKey(state, key) {
    if (!state.indexes[key]) {
        return undefined;
    }

    return state.indexes[key].rowIndex;
}

/**
 * Get row the key field value.
 *
 * @param {Object} state - the datatable state
 * @param {string} key - key field of the row
 */
export function getRowByKey(state, key) {
    const rows = state.rows;
    return rows[getRowIndexByKey(state, key)];
}

/**
 * Gets the cell value by the rowKeyValue and colKeyValue.
 *
 * @param {Object} state - state of the datatable
 * @param {string} rowKeyValue - the row key of the edited cell
 * @param {string} colKeyValue - the column key of the edited cell
 */
export function getCellValue(state, rowKeyValue, colKeyValue) {
    const row = getRowByKey(state, rowKeyValue);
    const colIndex = state.headerIndexes[colKeyValue];

    return row.cells[colIndex].value;
}

/**
 * Gets the selected rows keys.
 *
 * @param {Object} state - state of the datatable
 */
export function getSelectedRowsKeys(state) {
    return Object.keys(state.selectedRowsKeys).filter(
        (key) => state.selectedRowsKeys[key]
    );
}

/**
 * Gets the current selection length.
 *
 * @param {Object} state - state of the datatable
 */
export function getCurrentSelectionLength(state) {
    return getSelectedRowsKeys(state).length;
}

/**
 * Return true if the row is selected.
 *
 * @param {Object} state - state of the datatable
 * @param {string} rowKeyValue - the row key of the edited cell
 */
export function isSelectedRow(state, rowKeyValue) {
    return !!state.selectedRowsKeys[rowKeyValue];
}

/* -------------- processInlineEditFinish ------------- */

/**
 * Validates if it's a valid cell.
 *
 * @param {Object} state - state of the datatable
 * @param {string} rowKeyValue - the row key of the edited cell
 * @param {string} colKeyValue - the column key of the edited cell
 */
export function isValidCell(state, rowKeyValue, colKeyValue) {
    const row = getRowByKey(state, rowKeyValue);
    const colIndex = state.headerIndexes[colKeyValue];

    return row && row.cells[colIndex];
}

/**
 * Will update the dirty values specified in rowColKeyValues.
 *
 * @param {Object} state - state of the datatable
 * @param {Object} rowColKeyValues - An object in the form of { rowKeyValue: { colKeyValue1: value, ..., colKeyValueN: value } ... }
 */
export function updateDirtyValues(state, rowColKeyValues) {
    const dirtyValues = state.inlineEdit.dirtyValues;

    Object.keys(rowColKeyValues).forEach((rowKey) => {
        if (!Object.prototype.hasOwnProperty.call(dirtyValues, rowKey)) {
            dirtyValues[rowKey] = {};
        }

        Object.assign(dirtyValues[rowKey], rowColKeyValues[rowKey]);
    });
}

/**
 * It will process when the datatable had finished an edition.
 *
 * @param {Object} dtState - the datatable state
 * @param {string} reason - the reason to finish the edition. valid reasons are: edit-canceled | loosed-focus | tab-pressed | submit-action | on-change
 * @param {string} rowKeyValue - the row key of the edited cell
 * @param {string} colKeyValue - the column key of the edited cell
 * @param {string} value - the edited value
 * @param {boolean} valid - boolean value that indicates if the edited value is valid or not
 * @param {boolean} massEdit -  boolean value that indicates if the edition it's more than one row edited
 */
export function processInlineEditFinishCustom(
    dtState,
    reason,
    rowKeyValue,
    colKeyValue,
    value,
    valid,
    massEdit
) {
    const state = dtState;
    const inlineEditState = state.inlineEdit;
    const shouldSaveData =
        reason !== 'edit-canceled' &&
        !(inlineEditState.massEditEnabled && reason === 'loosed-focus') &&
        isValidCell(state, rowKeyValue, colKeyValue);

    if (shouldSaveData) {
        const editValue = value;
        const isValidEditValue = valid;
        const updateAllSelectedRows = massEdit;
        const currentValue = getCellValue(state, rowKeyValue, colKeyValue);

        if (
            isValidEditValue &&
            (editValue !== currentValue || updateAllSelectedRows)
        ) {
            const cellChange = {};
            cellChange[rowKeyValue] = {};
            cellChange[rowKeyValue][colKeyValue] = editValue;

            if (updateAllSelectedRows) {
                const selectedRowKeys = getSelectedRowsKeys(state);
                selectedRowKeys.forEach((rowKey) => {
                    cellChange[rowKey] = {};
                    cellChange[rowKey][colKeyValue] = editValue;
                });
            }
            updateDirtyValues(state, cellChange);
        }
    }
}

/**
 * Dispatches the `cellchange` event with the `draftValues` in the
 * detail object.
 *
 * @param {Object} dtInstance - datatable instance
 * @param {Object} cellChange - object containing cell changes
 */
export function dispatchCellChangeEvent(dtInstance, cellChange) {
    dtInstance.dispatchEvent(
        new CustomEvent('cellchange', {
            detail: {
                draftValues: getResolvedCellChanges(
                    dtInstance.state,
                    cellChange
                )
            }
        })
    );
}

/**
 * Constructs an array of resolved cell changes made via inline edit
 * Each array item consists of an identifier of the row and column in order to locate
 * the cell in which the changes were made
 *
 * It follows this format: [{ <columnName>: "<changes>", <keyField>: "<keyFieldIdentifier>" }]
 * Ex. [{ name: "My changes", id: "2" }]; where column name is 'name' and 'id' is the keyField
 * The keyField can be used to identify the row.
 *
 * @param {Object} state - datatable state object
 * @param {Object} changes - list of cell changes to be resolved
 * @returns {Array} - array containing changes and identifiers of column and row where the changes
 *                    should be applied
 */
function getResolvedCellChanges(state, changes) {
    const keyField = state.keyField;

    return Object.keys(changes).reduce((result, rowKey) => {
        // Get the changes made by column
        const cellChanges = getCellChangesByColumn(state, changes[rowKey]);

        if (Object.keys(cellChanges).length > 0) {
            // Add identifier for which row has change
            cellChanges[keyField] = rowKey;
            result.push(cellChanges);
        }

        return result;
    }, []);
}

/**
 * Retrieves the changes in cells in a particular column
 * Returns an object where each item follows this format:
 * { <columnName>: "<changes>"} -> Ex. { name: "My changes" }
 *
 * @param {Object} state - Datatable state
 * @param {Object} changes - The internal representation of changes in a row
 * @returns {Object} - the list of customer changes in a column
 */
function getCellChangesByColumn(state, changes) {
    return Object.keys(changes).reduce((result, colKey) => {
        const columns = state.columns;
        const columnIndex = state.headerIndexes[colKey];
        const columnDef = columns[columnIndex];

        result[columnDef.columnKey || columnDef.fieldName] = changes[colKey];

        return result;
    }, {});
}
