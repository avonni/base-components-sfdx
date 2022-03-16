export const allowlistedColumnKeys = [
    'actions',
    'cellAttributes',
    'fieldName',
    'iconLabel',
    'iconName',
    'iconPosition',
    'initialWidth',
    'label',
    'type',
    'typeAttributes',
    'wrapText'
];

/**
 * Normalize, flatten, the the data passed to tree-grid to make it consumable by datatable
 * @param {object[]} data - tree-grid data
 * @param {array} expandedRows - array containing list of row IDs that are expanded
 * @param {string} keyField - name of key field, source of a row's unique ID
 * @param {number} depth - recursive depth tracking
 * @param {object[]} flattenedData - recursive data aggregation
 * @returns {object[]} normalized/flattened data
 */
export const normalizeRecords = function (
    data,
    expandedRows,
    keyField,
    depth,
    flattenedData = []
) {
    // track depth, initialize if not a number
    if (typeof depth === 'number') {
        depth++;
    } else {
        depth = 1;
    }

    // If we don't have a valid array return an empty array
    if (!Array.isArray(data)) {
        return [];
    }

    // Iterate over the provided nested data array and generate a single level array to pass to the datatable component
    data.forEach((row, index) => {
        // create new object
        const flatRow = getObjectWithoutKeys(row, ['_children']);

        // add to flattened data
        flatRow.level = depth;
        flatRow.posInSet = index + 1; // shift to root = 1 instead of 0(zero)
        flatRow.setSize = data.length;

        const rowId = flatRow[keyField];

        if (expandedRows.indexOf(rowId) > -1) {
            flatRow.isExpanded = true;
        } else {
            flatRow.isExpanded = false; // default
        }

        // eslint-disable-next-line no-prototype-builtins
        if (row.hasOwnProperty('_children')) {
            flatRow.hasChildren = true;
            flattenedData.push(flatRow);

            // validate _children key
            let hasChildrenContent = false;
            if (Array.isArray(row._children) && row._children.length > 0) {
                hasChildrenContent = true;
            }

            // only continue deeper into the tree if row is set to be expanded and has children content
            if (flatRow.isExpanded && hasChildrenContent) {
                normalizeRecords(
                    row._children,
                    expandedRows,
                    keyField,
                    depth,
                    flattenedData
                );
                // if we have a row being expanded but we don't have children content don't expand it
            } else if (flatRow.isExpanded && !hasChildrenContent) {
                flattenedData[flattenedData.length - 1].isExpanded = false;
            }
        } else {
            flattenedData.push(flatRow);
        }
    });
    return flattenedData;
};

/**
 * Normalize, transform first column to a tree column, the column object passed to tree-grid to make it consumable by datatable
 * Remove any unsupported features or settings in the column definitions such as sorting.
 * @param {object[]} columns - columns definition object
 * @returns {object[]} normalized column definition object
 */
export const normalizeColumns = function (columns) {
    const normalizedColumns = [];

    // generate a new column object to replace the first column passed in
    if (Array.isArray(columns) && columns.length > 0) {
        const treeColumn = getObjectWithoutKeys(
            getSanitizedObject(columns[0], allowlistedColumnKeys),
            ['typeAttributes']
        );
        treeColumn.typeAttributes = {};

        // move current typeAttributes to typeAttributes.subTypeAttributes
        if (columns[0].typeAttributes) {
            treeColumn.typeAttributes.subTypeAttributes =
                columns[0].typeAttributes || {};
        }

        // transform the first column definition
        // add needed type attributes for the tree type
        treeColumn.typeAttributes.level = { fieldName: 'level' };
        treeColumn.typeAttributes.setSize = { fieldName: 'setSize' };
        treeColumn.typeAttributes.posInSet = { fieldName: 'posInSet' };
        treeColumn.typeAttributes.hasChildren = { fieldName: 'hasChildren' };
        treeColumn.typeAttributes.isExpanded = { fieldName: 'isExpanded' };
        treeColumn.typeAttributes.subType = columns[0].type;
        // change type to tree
        treeColumn.type = 'tree';

        // replace column with proper tree version
        normalizedColumns[0] = treeColumn;

        // iterate over remaining columns and remove any unsupported settings/keys
        for (let i = 1; i < columns.length; i++) {
            normalizedColumns.push(
                getSanitizedObject(columns[i], allowlistedColumnKeys)
            );
        }
    }

    return normalizedColumns;
};

// return a new object including only the list of specified keys
function getSanitizedObject(object, allowlistedKeys) {
    const newObj = {};
    const objKeys = Object.keys(object);

    objKeys.forEach((key) => {
        if (allowlistedKeys.includes(key)) {
            newObj[key] = object[key];
        }
    });

    return newObj;
}

// return a new object excluding the list of ignored keys
function getObjectWithoutKeys(object, ignoredKeys) {
    const newObj = {};
    const objKeys = Object.keys(object);

    // iterate over the object's keys
    objKeys.forEach((key) => {
        // if we hit a key listed in the ignore list, skip it
        if (ignoredKeys.includes(key)) {
            // skip it
        } else {
            newObj[key] = object[key];
        }
    });

    return newObj;
}
