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

const editableClassNameTrue =
    'avonni-primitive-summarization-table-td_vertical-align_top avonni-primitive-summarization-table__padding_right';
const editableClassNameFalse =
    'avonni-primitive-summarization-table-td_vertical-align_top';
const isNumberTypeClassNameTrue =
    'avonni-primitive-summarization-table__display-flex_end';
const isNumberTypeClassNameFalse =
    'avonni-primitive-summarization-table__display-flex_start';

/**
 * Method to count numbers of element in array.
 *
 * @param {object} array Array of elements to count.
 * @returns {number} Number of elements.
 */
const count = (array) => {
    return array.length;
};

/**
 * Method to count unique numbers of element in array.
 *
 * @param {object} array Array of elements to count.
 * @returns {number} Number of unique elements.
 */
const countUnique = (array) => {
    return new Set(array).size;
};

/**
 * Method to sum elements in array.
 *
 * @param {object} array Array of elements to sum.
 * @returns {number} Sum of array.
 */
const sum = (array) => {
    return array.reduce((a, b) => a + b, 0);
};

/**
 * Method to do the average of the array.
 *
 * @param {object} array Array of elements to average.
 * @returns {number} Average of array.
 */
const average = (array) => {
    return parseInt((sum(array) / count(array)).toFixed(5), 10);
};

/**
 * Method to find the median of the array.
 *
 * @param {object} array Array of elements.
 * @returns {number} Median of the array.
 */
const median = (array) => {
    const mid = Math.floor(count(array) / 2),
        nums = [...array].sort((a, b) => a - b);
    return count(array) % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

/**
 * Method to find the highest number of the array.
 *
 * @param {object} array Array of elements.
 * @returns {number} Highest number of the array.
 */
const max = (array) => {
    return Math.max(...array);
};

/**
 * Method to find the lowest number of the array.
 *
 * @param {object} array Array of elements.
 * @returns {number} Lowest number of the array.
 */
const min = (array) => {
    return Math.min(...array);
};

/**
 * Method to find which number appears the most often in the array.
 *
 * @param {object} array Array of elements.
 * @returns {number} Most frequent number of the array.
 */
const mode = (array) => {
    let modeObj = {};
    let maximum = 0,
        counter = 0;

    array.forEach((e) => {
        if (modeObj[e]) {
            modeObj[e]++;
        } else {
            modeObj[e] = 1;
        }

        if (counter < modeObj[e]) {
            maximum = e;
            counter = modeObj[e];
        }
    });

    return maximum;
};

/**
 * Method to compute the summarization depending on which summarize type.
 *
 * @param {object} array Array of elements.
 * @param {string} summarizeType Which summarize type to compute.
 * @returns {number} computed number depending on type.
 */
const summarizations = (array, summarizeType) => {
    switch (summarizeType) {
        default:
            return count(array);
        case 'countUnique':
            return countUnique(array);
        case 'sum':
            return sum(array);
        case 'average':
            return average(array);
        case 'median':
            return median(array);
        case 'max':
            return max(array);
        case 'min':
            return min(array);
        case 'mode':
            return mode(array);
    }
};

/**
 * Method to verify if it's a number type column.
 *
 * @param {string} type Type of column.
 * @returns {Boolean} True if it's a number type column, false otherwise.
 */
const isNumberType = (type) => {
    return type === 'number' || type === 'percent' || type === 'currency';
};

/**
 * Method to verify if it's a date type column.
 *
 * @param {string} type Type of column.
 * @returns {Boolean} True if it's a date type column, false otherwise.
 */
const isDateType = (type) => {
    return type === 'date' || type === 'date-local';
};

/**
 * Method to verify if it's a string type column.
 *
 * @param {string} type Type of column.
 * @returns {Boolean} True if it's a string type column, false otherwise.
 */
const isStringType = (type) => {
    return (
        type === 'email' ||
        type === 'text' ||
        type === 'url' ||
        type === 'formatted-rich-text' ||
        type === 'phone'
    );
};

/**
 * Method to verify if it's a custom type column with numbers as values.
 *
 * @param {string} type Type of column.
 * @returns {Boolean} True if it's a custom type column, false otherwise.
 */
const isCustomType = (type) => {
    return type === 'slider' || type === 'rating' || type === 'input-counter';
};

/**
 * Method to verify if it's a progress type column.
 *
 * @param {string} type Type of column.
 * @returns {Boolean} True if it's a progress type column, false otherwise.
 */
const isProgressType = (type) => {
    return (
        type === 'progress-circle' ||
        type === 'progress-ring' ||
        type === 'progress-bar'
    );
};

/**
 * Method to verify if it's a type column on which we cannot apply any summarize types.
 *
 * @param {string} type Type of column.
 * @returns {Boolean} True if it's a no summarize type of column, false otherwise.
 */
const isNoSummarizeType = (type) => {
    return (
        type === 'avatar' ||
        type === 'action' ||
        type === 'button' ||
        type === 'ButtonIcon'
    );
};

/**
 * Method to verify if it's a number type column (number, progress and custom).
 *
 * @param {string} type Type of column.
 * @returns {Boolean} True if it's a number type of column, false otherwise.
 */
const isFormattedNumberType = (type) => {
    return isNumberType(type) || isProgressType(type) || isCustomType(type);
};

/**
 * Method to verify if it's a number type column (number, progress and custom).
 *
 * @param {string} summarizeType Type of summarize.
 * @returns {Boolean} True if it's a count type of summarize, false otherwise.
 */
const isCountSummarizeType = (summarizeType) => {
    return summarizeType === 'count' || summarizeType === 'countUnique';
};

/**
 * Method to verify if it's a number type column (number, progress and custom).
 * The method is used to format the data and delete null and undefined if all the rows don't have data.
 *
 * @param {object} columns Array of object containing the columns with label, fieldName, type and typeAttributes.
 * @param {object} data Array of object containing the data.
 * @returns {object} return an array of array containing the data filtered and with the right format.
 */
const computeFilteredDataValues = (columns, data) => {
    let values = [];
    let filteredDataValues = [];
    filteredDataValues = columns.map((column) => {
        const fieldName = column.fieldName;
        const type = column.type;
        values = data.map((row) => {
            return row[fieldName];
        });
        if (isFormattedNumberType(type)) {
            return values.map(Number).filter(Number.isFinite);
        } else if (isDateType(type)) {
            // For date type, we need to format the date to be a timeStamp.
            return values
                .map((date) => {
                    return Date.parse(date);
                })
                .filter(Number);
        }
        return values.filter((e) => {
            return e !== null && e !== undefined;
        });
    });
    return filteredDataValues;
};

/**
 * Method to verify if it's a number type column (number, progress and custom).
 *
 * @param {string} summarizeType Type of summarize.
 * @param {string} type Type of column.
 * @returns {Boolean} True if it's a number type of column, false otherwise.
 */
const displaySumType = (summarizeType, type) => {
    const allowedStringSummarizeTypes = ['count', 'countUnique', 'mode'];
    const otherAllowedSummarizeTypes = ['count', 'countUnique'];
    if (isStringType(type)) {
        return allowedStringSummarizeTypes.includes(summarizeType)
            ? true
            : false;
    } else if (
        !isStringType(type) &&
        !isDateType(type) &&
        !isNumberType(type) &&
        !isCustomType(type) &&
        !isProgressType(type) &&
        !isNoSummarizeType(type)
    ) {
        return otherAllowedSummarizeTypes.includes(summarizeType)
            ? true
            : false;
    } else if (isNoSummarizeType(type)) {
        return false;
    }
    return true;
};

/**
 * Method to divide by 100 the computed value for the progress type of column except for count type of summarize.
 *
 * @param {string} summarizeType Type of summarize.
 * @param {string} type Type of column.
 * @returns {Boolean} True if it's a number type of column, false otherwise.
 */
const transformComputedValue = (value, progressType, summarizeType) => {
    if (progressType && !isCountSummarizeType(summarizeType)) {
        return value / 100;
    }
    return value;
};

/**
 * Method to verify if any column has a valid summarize type to display.
 *
 * @param {object} computedSummarizeArray Formatted array for the iteration in the markup.
 * @returns {Boolean} True if one of the column has a valid summarize type to display, false otherwise.
 */
const hasValidSummarizeType = (computedSummarizeArray) => {
    const summarized = [];
    computedSummarizeArray.forEach((column) => {
        const summarizeTypes = column.summarizeTypes;
        if (summarizeTypes) {
            summarizeTypes.forEach((type) => {
                summarized.push(type.displaySumType);
            });
        }
    });
    return summarized.includes(true);
};

/**
 * Method to format the number, custom and progress type of column.
 * Since the value is applied in a lightning-formatted-number, we need to make sure the type is decimal or percent and not number.
 *
 * @param {string} type Type of column.
 * @returns {string} returns decimal if type is custom or number and percent for progress type.
 */
const formatNumberType = (type) => {
    if (type === 'number' || isCustomType(type)) {
        return 'decimal';
    } else if (isProgressType(type)) {
        return 'percent';
    }
    return type;
};

/**
 *
 *
 * @param {object} columns Array of object containing the columns with label, fieldName, type and typeAttributes.
 * @param {object} values Array of number containing the different values of each column.
 * @returns {object} Array of object containing the information of each columns with the information needed to iterate in the markup.
 * It contains :
 * * fieldName
 * * type
 * * hasSummarizeType
 * * summarizeTypes
 * * formattedNumberType
 * * dateType
 * * values
 * * className
 * * formatType
 */
const computeSummarizeArray = (columns, data) => {
    const computedSummarizeArray = columns.map((column, index) => {
        let summarizeTypes = column.summarizeTypes;
        const columnType = column.type;
        const hasSummarizeType = column.summarizeTypes ? true : false;
        const isColumnEditable = column.editable ? true : false;
        const dateType = isDateType(columnType);
        const formattedNumberType = isFormattedNumberType(columnType);
        const filteredDataValues = computeFilteredDataValues(columns, data);
        const formatType = formatNumberType(columnType);
        // If the column is a numberType, the alignement is right, otherwise it's left.
        const className = isNumberType(columnType)
            ? isNumberTypeClassNameTrue
            : isNumberTypeClassNameFalse;
        // If the column is editable we need to add padding-right to match the styling.
        const editableClassName = isColumnEditable
            ? editableClassNameTrue
            : editableClassNameFalse;
        // Formatting of the object that we need to iterate on, in the markup.
        const summarizeColumnObject = {
            fieldName: column.fieldName,
            type: columnType,
            hasSummarizeType: hasSummarizeType,
            editableClassName: editableClassName,
            summarizeTypes: summarizeTypes,
            formattedNumberType: formattedNumberType,
            dateType: dateType,
            values: filteredDataValues[index],
            className: className,
            formatType: formatType
        };
        if (summarizeTypes) {
            // if there is only one summarizeType and as a string, we convert it to an array.
            if (typeof summarizeTypes === 'string') {
                summarizeTypes = summarizeTypes.split();
            }
            summarizeColumnObject.summarizeTypes = summarizeTypes.map(
                (summarizeType) => {
                    // The value is computed depending on what type of summarize.
                    const computedValue = summarizations(
                        summarizeColumnObject.values,
                        summarizeType
                    );

                    // Verification of if the type is a string and if the summarize type is mode to display the text in the markup.
                    const stringMode =
                        summarizeType === 'mode' && isStringType(columnType);

                    return {
                        label: summarizeType,
                        value: transformComputedValue(
                            computedValue,
                            isProgressType(columnType),
                            summarizeType
                        ),
                        type: formatType,
                        typeAttributes: column.typeAttributes
                            ? column.typeAttributes
                            : [],
                        mode: stringMode,
                        displaySumType: displaySumType(
                            summarizeType,
                            columnType
                        ),
                        count: isCountSummarizeType(summarizeType)
                    };
                }
            );
        }
        return summarizeColumnObject;
    });
    return computedSummarizeArray;
};

export { computeSummarizeArray, hasValidSummarizeType };
