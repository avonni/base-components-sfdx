/**
 * Method to verify if it's a number type column (number, progress and custom).
 *
 * @param {array} formattedRecord Array of formatted records.
 * @returns {array} Array of formatted records without undefined values.
 */
const removeUndefined = (formattedRecord) => {
    const noUndefinedResult = [];
    formattedRecord.forEach((result) => {
        if (result.label === 'undefined') {
            noUndefinedResult.push();
        } else {
            noUndefinedResult.push(result);
        }
    });
    return noUndefinedResult;
};

/**
 * Method count the number of rows depending on a condition (used to count rows without undefined).
 *
 * @param {array} '[first, ...rest]' Array of formatted records.
 * @param {function} condition condition for counting.
 * @param {number} accumulator accumulator for counting.
 * @returns {number} number of rows.
 */
const countingRows = ([first, ...rest], condition, accumulator = 0) => {
    return (
        condition(first) && ++accumulator,
        rest.length ? countingRows(rest, condition, accumulator) : accumulator
    );
};

/**
 * Method to verify if it's a number type column (number, progress and custom).
 *
 * @param {string} value label value.
 * @returns {string} return the undefined string if it's undefined or the value if not.
 */
const isUndefined = (value) => {
    return value === undefined ? 'undefined' : value;
};

/**
 * Method to preformat the records.
 *
 * @param {array} records Array of records from the datatable.
 * @param {string} field First element of groupBy Array.
 * @param {array} groupBy List of group-bys.
 * @param {number} level Level of the group-by.
 * @returns {array} Array of formatted records before recursive group-by.
 */
const formattingRecursiveRecord = (records, field, groupBy, level) => {
    return Object.values(
        records.reduce((obj, current) => {
            if (!obj[current[field]])
                obj[current[field]] = {
                    label: isUndefined(current[field]),
                    group: [],
                    multiLevelGroupBy: groupBy.length !== 1,
                    level: level
                };
            obj[current[field]].group.push(current);
            return obj;
        }, {})
    );
};

/**
 * Method to format the records for the markup in datatable.
 *
 * @param {array} records Array of records from the datatable.
 * @param {array} groupBy List of group-bys.
 * @param {number} level Level of the group-by.
 * @param {number} rowNumberOffset Attribute to set the row number.
 * @returns {array} Array of formatted records for the markup in datatable.
 */
const recursiveGroupBy = (records, groupBy, level, rowNumberOffsetAtt) => {
    // we need to make sure that groupBy is an array.
    if (typeof groupBy === 'string') {
        groupBy = groupBy.split();
    }
    let field = groupBy[0];
    if (!field) return records;
    let recursiveData = formattingRecursiveRecord(
        records,
        field,
        groupBy,
        level
    );

    if (groupBy.length) {
        let rowNumberOffset = rowNumberOffsetAtt;
        recursiveData.forEach((obj) => {
            obj.size = obj.group.length;
            obj.rowNumberOffset = rowNumberOffset;
            rowNumberOffset += obj.size;
            obj.group = recursiveGroupBy(
                obj.group,
                groupBy.slice(1),
                level + 1,
                obj.rowNumberOffset
            );
        });
    }
    return recursiveData;
};

/**
 * Method to format the records for the markup in datatable with no undefined groups.
 *
 * @param {array} records Array of records from the datatable.
 * @param {array} groupBy List of group-bys.
 * @param {number} level Level of the group-by.
 * @param {number} rowNumberOffset Attribute to set the row number.
 * @returns {array} Array of formatted records for the markup in datatable.
 */
const recursiveGroupByNoUndefined = (
    records,
    groupBy,
    level,
    rowNumberOffsetAtt
) => {
    // we need to make sure that groupBy is an array.
    if (typeof groupBy === 'string') {
        groupBy = groupBy.split();
    }
    let field = groupBy[0];
    if (!field) return records;

    let recursiveData = formattingRecursiveRecord(
        records,
        field,
        groupBy,
        level
    );

    if (groupBy.length) {
        let rowNumberOffset = rowNumberOffsetAtt;
        recursiveData.forEach((obj) => {
            obj.size = countingRows(records, (row) => {
                let noUndefined = true;
                for (let i = 1; i < groupBy.length; i++) {
                    if (row[groupBy[i]] === undefined) {
                        noUndefined = false;
                        break;
                    }
                }
                return row[groupBy[0]] === obj.label && noUndefined;
            });
            obj.rowNumberOffset = rowNumberOffset;
            rowNumberOffset += obj.size;
            obj.group = recursiveGroupByNoUndefined(
                obj.group,
                groupBy.slice(1),
                level + 1,
                obj.rowNumberOffset
            );
        });
    }
    return removeUndefined(recursiveData);
};

export { recursiveGroupBy, recursiveGroupByNoUndefined };
