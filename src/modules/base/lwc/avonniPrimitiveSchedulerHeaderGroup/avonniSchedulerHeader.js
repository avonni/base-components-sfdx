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

import { generateUUID } from 'c/utils';
import { DateTime } from 'c/luxon';
import {
    dateTimeObjectFrom,
    nextAllowedDay,
    nextAllowedMonth,
    nextAllowedTime,
    addToDate,
    numberOfUnitsBetweenDates
} from 'c/utilsPrivate';

// Number of cells displayed on a 4K screen, if the label was empty
const MAX_VISIBLE_COLUMNS = Math.ceil(3840 / 17);

/**
 * Represent one row of the scheduler header group.
 *
 * @class
 * @param {string[]} availableTimeFrames Array of available time frames.
 *
 * @param {number[]} availableDaysOfTheWeek Array of available days of the week.
 *
 * @param {number[]} availableMonths Array of available months.
 *
 * @param {DateTime} end End date of the header.
 *
 * @param {object[]} columns Array of column objects. Each object has three keys: start, end and label.
 *
 * @param {number[]} columnWidths Array of column widths in pixels.
 *
 * @param {number} duration Total number of reference units (it is the span of the scheduler visibleSpan).
 *
 * @param {boolean} isHidden If true, the header will be hidden.
 *
 * @param {boolean} isReference If true, the header unit is the one used by the visibleSpan of the parent Scheduler.
 *
 * @param {string} key Unique identifier for the header.
 *
 * @param {string} label Pattern used to create the columns labels.
 *
 * @param {number} numberOfColumns Total number of columns of the header.
 *
 * @param {number} span Number of unit in one column of the header.
 *
 * @param {DateTime} start Starting date of the header.
 *
 * @param {string} unit Unit used by the header (minute, hour, day, week, month or year).
 */
export default class AvonniSchedulerHeader {
    constructor(props) {
        this.availableDaysOfTheWeek = props.availableDaysOfTheWeek;
        this.availableMonths = props.availableMonths;
        this.availableTimeFrames = props.availableTimeFrames;
        this._end = props.end;
        this.columns = [];
        this.columnWidths = [];
        this.duration = props.duration;
        this.isHidden = props.isHidden;
        this.isReference = props.isReference;
        this.key = generateUUID();
        this.label = props.label;
        this.numberOfColumns = props.numberOfColumns;
        this.span = props.span;
        this.start = props.start;
        this.unit = props.unit;

        this.initColumns(DateTime.fromMillis(this.start.ts), true);
    }

    get end() {
        return this._end;
    }
    set end(value) {
        this._end =
            value instanceof DateTime ? value : dateTimeObjectFrom(value);

        if (this.columns.length) {
            this.columns[this.columns.length - 1].end = value.ts;
        }
    }

    /**
     * Create the header columns.
     *
     * @param {DateTime} startDate Starting date of the header.
     * @param {boolean} firstRender If true, this is the first render of the header. Only one column will be created.
     */
    initColumns(startDate, firstRender = false) {
        const { unit, label, span, isReference } = this;
        let iterations = this.computeNumberOfColumns(firstRender);
        this.columns = [];
        let date = startDate;

        for (let i = 0; i < iterations; i++) {
            // If this is not the first column, we start the month on the first day
            // Else we want to keep the chosen start day
            date = nextAllowedMonth(
                date,
                this.availableMonths,
                this.columns.length > 0
            );

            // We don't want to take the day or time of the date into account if the header does not use them.
            // If the unit is "week", we want to start counting the weeks from the first available day, and then ignore the days availability
            if (
                unit !== 'month' &&
                unit !== 'year' &&
                !(unit === 'week' && i > 0)
            ) {
                date = nextAllowedDay(
                    date,
                    this.availableMonths,
                    this.availableDaysOfTheWeek
                );
                if (unit !== 'day' && unit !== 'week') {
                    date = nextAllowedTime(
                        date,
                        this.availableMonths,
                        this.availableDaysOfTheWeek,
                        this.availableTimeFrames,
                        unit,
                        span
                    );
                }
            }

            // Recalculate the number of week columns if the start date changed
            // because of the allowed dates/times
            if (
                isReference &&
                firstRender &&
                i === 0 &&
                date.ts !== this.start.ts &&
                unit === 'week'
            ) {
                const pushedEnd = addToDate(
                    this.end,
                    'day',
                    date.diff(this.start, 'days').days
                );
                this.numberOfColumns =
                    numberOfUnitsBetweenDates(unit, date, pushedEnd) / span;
            }

            // Compensate the fact that luxon weeks start on Monday
            let columnEnd = addToDate(date, unit, span - 1);

            columnEnd =
                unit === 'week'
                    ? columnEnd.plus({ day: 1 }).endOf(unit).minus({ day: 1 })
                    : columnEnd.endOf(unit);

            // If the current date is bigger than the reference end, stop adding columns
            if (!isReference && this.dateIsBiggerThanEnd(date)) {
                this.columns[this.columns.length - 1].end = this.end.ts;
                this.setHeaderEnd();
                this.cleanEmptyLastColumn();
                break;
            }

            this.columns.push({
                label: date.startOf(unit).toFormat(label),
                start: date.ts,
                end: columnEnd.ts
            });

            // Compensate the fact that luxon week starts on Monday
            date = addToDate(columnEnd, unit, 1);
            date =
                unit === 'week'
                    ? date.plus({ day: 1 }).startOf(unit).minus({ day: 1 })
                    : date.startOf(unit);
        }

        if (firstRender) {
            this.start = DateTime.fromMillis(this.columns[0].start);
        } else {
            this.setHeaderEnd();
            this.cleanEmptyLastColumn();
        }
    }

    /**
     * Computes the number of columns that should be created.
     *
     * @param {boolean} firstRender Should be true if it is the first render of the header.
     * @returns {number} Number of visible columns.
     */
    computeNumberOfColumns(firstRender) {
        // On the first render, we create only one column, to compute the default cell width.
        if (firstRender || this.numberOfColumns < 1) {
            return 1;
        }
        return this.numberOfColumns > MAX_VISIBLE_COLUMNS
            ? MAX_VISIBLE_COLUMNS
            : this.numberOfColumns;
    }

    /**
     * Check if the given date is bigger than the header end.
     *
     * @param {DateTime} date
     * @returns {boolean} True or false.
     */
    dateIsBiggerThanEnd(date) {
        const { end, unit } = this;
        let dateUnit;
        let endUnit;

        // Compensate the fact that luxon weeks start on Monday
        if (unit === 'week') {
            dateUnit = addToDate(date, 'day', 1).endOf(unit);
            endUnit = addToDate(end, 'day', 1).endOf(unit);
        } else {
            dateUnit = date.endOf(unit);
            endUnit = end.endOf(unit);
        }

        if (endUnit < dateUnit) return true;
        return false;
    }

    /**
     * Make sure the last column contains allowed dates/times and remove it if not.
     */
    cleanEmptyLastColumn() {
        const lastColumn = this.columns[this.columns.length - 1];
        const nextDay = nextAllowedDay(
            DateTime.fromMillis(lastColumn.start),
            this.availableMonths,
            this.availableDaysOfTheWeek
        );
        const nextMonth = nextAllowedMonth(
            DateTime.fromMillis(lastColumn.start),
            this.availableMonths
        );

        if (
            lastColumn.start > lastColumn.end ||
            nextMonth > lastColumn.end ||
            nextDay > lastColumn.end
        ) {
            this.columns.splice(-1);
            this.numberOfColumns = this.columns.length;
        }
    }

    /**
     * Adjust the header end when the start or end is in the middle of a unit.
     */
    setHeaderEnd() {
        const {
            unit,
            duration,
            span,
            columns,
            isReference,
            numberOfColumns
        } = this;
        const lastColumn = columns[columns.length - 1];
        const start = DateTime.fromMillis(columns[0].start);
        let end = DateTime.fromMillis(lastColumn.end);

        // If the header has a span bigger than 1, the last column may not be fully visible
        const partialColumn = numberOfColumns % 1;
        if (partialColumn > 0) {
            const lastColumnStart = DateTime.fromMillis(lastColumn.start);
            const visibleUnits =
                partialColumn * span > duration
                    ? duration
                    : partialColumn * span;
            end = DateTime.fromMillis(
                addToDate(lastColumnStart, unit, visibleUnits) - 1
            );
        }

        // If the start date is in the middle of the unit,
        // make sure the end date is too
        if (isReference) {
            if (unit === 'year') {
                end = end.set({ months: start.month });
            }
            if ((unit === 'month' || unit === 'year') && start.day > 1) {
                end = end.set({ days: start.day - 1 });
            }
            if (unit === 'week') {
                if (start.weekday === 1) {
                    end = addToDate(end, 'day', 1);
                }
                end = end.set({ weekday: start.weekday - 1 });
            }
            if (unit === 'day' && start.hour !== 0) {
                end = end.set({ hours: start.hour - 1 });
            }
            if (unit === 'hour' && start.minute !== 0) {
                end = end.set({ minutes: start.minute - 1 });
            }

            lastColumn.end = end.ts;
            this._end = end;
        } else if (lastColumn.end > this.end) {
            lastColumn.end = this.end.ts;
        }
    }

    /**
     * Compute the width of each column and creates the columnWidths array.
     *
     * @param {number} cellWidth The width of one cell of the smallest unit header.
     * @param {object[]} smallestColumns Array containing the columns of the smallest unit header.
     */
    computeColumnWidths(cellWidth, smallestColumns) {
        const { columns, unit, span } = this;
        const columnWidths = [];

        if (this.columns === smallestColumns) {
            // The columns of the header with the shortest unit all have the same width
            columns.forEach(() => {
                columnWidths.push(cellWidth);
            });
        } else {
            // The other headers base their column widths on the header with the shortest unit
            let columnIndex = 0;
            columns.forEach((column, index) => {
                let width = 0;
                let start =
                    index === 0
                        ? DateTime.fromMillis(smallestColumns[0].start)
                        : DateTime.fromMillis(column.start);
                const end = addToDate(start, unit, span);

                while (columnIndex < smallestColumns.length) {
                    start = DateTime.fromMillis(
                        smallestColumns[columnIndex].start
                    );

                    // Normalize the beginning of the week, because Luxon's week start on Monday
                    const normalizedStart =
                        unit === 'week' ? addToDate(start, 'day', 1) : start;
                    const normalizedEnd =
                        unit === 'week' ? addToDate(end, 'day', 1) : end;

                    const startUnit = normalizedStart.startOf(unit);
                    const endUnit = normalizedEnd.startOf(unit);

                    // Stop if the next smallestHeader column belongs to the next header unit
                    if (endUnit <= startUnit) break;

                    width += cellWidth;
                    columnIndex += 1;
                }
                columnWidths.push(width);
            });
        }

        this.columnWidths = columnWidths;
    }
}
