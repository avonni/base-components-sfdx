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
 * @param {object[]} cells Array of cell objects. Each object has three keys: start, end and label.
 *
 * @param {number[]} cellWidths Array of cell widths in pixels.
 *
 * @param {number} duration Total number of reference units (it is the span of the scheduler visibleSpan).
 *
 * @param {boolean} isHidden If true, the header will be hidden.
 *
 * @param {boolean} isReference If true, the header unit is the one used by the visibleSpan of the parent Scheduler.
 *
 * @param {string} key Unique identifier for the header.
 *
 * @param {string} label Pattern used to create the cells labels.
 *
 * @param {number} numberOfCells Total number of cells of the header.
 *
 * @param {number} span Number of unit in one cell of the header.
 *
 * @param {DateTime} start Starting date of the header.
 *
 * @param {boolean} canExpandOverEndOfUnit If true, the header end does not have to stop at the exact end of its unit.
 *
 * @param {string} unit Unit used by the header (minute, hour, day, week, month or year).
 */
export default class AvonniSchedulerHeader {
    constructor(props) {
        this.availableDaysOfTheWeek = props.availableDaysOfTheWeek;
        this.availableMonths = props.availableMonths;
        this.availableTimeFrames = props.availableTimeFrames;
        this.canExpandOverEndOfUnit = props.canExpandOverEndOfUnit;
        this._end = props.end;
        this.cells = [];
        this.cellWidths = [];
        this.duration = props.duration;
        this.isHidden = props.isHidden;
        this.isReference = props.isReference;
        this.key = generateUUID();
        this.label = props.label;
        this.numberOfCells = props.numberOfCells;
        this.span = props.span;
        this.start = props.start;
        this.unit = props.unit;

        this.initCells();
    }

    get end() {
        return this._end;
    }
    set end(value) {
        this._end =
            value instanceof DateTime ? value : dateTimeObjectFrom(value);

        if (this.cells.length) {
            this.cells[this.cells.length - 1].end = value.ts;
        }
    }

    /**
     * Create the header cells.
     */
    initCells() {
        const { unit, label, span, isReference } = this;
        let iterations = this.numberOfCells;
        this.cells = [];
        let date = this.start;

        for (let i = 0; i < iterations; i++) {
            // If this is not the first cell, we start the month on the first day
            // Else we want to keep the chosen start day
            date = nextAllowedMonth(
                date,
                this.availableMonths,
                this.cells.length > 0
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

            // Recalculate the number of week cells if the start date changed
            // because of the allowed dates/times
            if (
                isReference &&
                i === 0 &&
                date.ts !== this.start.ts &&
                unit === 'week'
            ) {
                const pushedEnd = addToDate(
                    this.end,
                    'day',
                    date.diff(this.start, 'days').days
                );
                this.numberOfCells =
                    numberOfUnitsBetweenDates(unit, date, pushedEnd) / span;
            }

            // Compute the cell end
            let cellEnd = addToDate(date, unit, span - 1);
            cellEnd =
                unit === 'week'
                    ? cellEnd.plus({ day: 1 }).endOf(unit).minus({ day: 1 })
                    : cellEnd.endOf(unit);

            // If the current date is bigger than the reference end, stop adding cells
            if (!isReference && this.dateIsBiggerThanEnd(date)) {
                this.cells[this.cells.length - 1].end = this.end.ts;
                break;
            }

            this.cells.push({
                label: date.startOf(unit).toFormat(label),
                start: date.ts,
                end: cellEnd.ts
            });

            // Set date to the next cell's start
            date = addToDate(cellEnd, unit, 1);
            date =
                unit === 'week'
                    ? date.plus({ day: 1 }).startOf(unit).minus({ day: 1 })
                    : date.startOf(unit);
        }

        this.start = DateTime.fromMillis(this.cells[0].start);
        this.setHeaderEnd();
        this.cleanEmptyLastCell();
        this.numberOfCells = this.cells.length;
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

        return endUnit < dateUnit;
    }

    /**
     * Make sure the last cell contains allowed dates/times and remove it if not.
     */
    cleanEmptyLastCell() {
        if (this.cells.length <= 1) {
            return;
        }

        const lastCell = this.cells[this.cells.length - 1];
        const nextDay = nextAllowedDay(
            DateTime.fromMillis(lastCell.start),
            this.availableMonths,
            this.availableDaysOfTheWeek
        );
        const nextMonth = nextAllowedMonth(
            DateTime.fromMillis(lastCell.start),
            this.availableMonths
        );

        if (
            lastCell.start > lastCell.end ||
            nextMonth > lastCell.end ||
            nextDay > lastCell.end
        ) {
            this.cells.splice(-1);
            this.numberOfCells = this.cells.length;
        }
    }

    /**
     * Adjust the header end when the start or end is in the middle of a unit.
     */
    setHeaderEnd() {
        const {
            unit,
            cells,
            isReference,
            numberOfCells,
            canExpandOverEndOfUnit
        } = this;
        const lastCell = cells[cells.length - 1];
        const start = DateTime.fromMillis(cells[0].start);
        let end = DateTime.fromMillis(lastCell.end);

        // If the header has a span bigger than 1, the last cell may not be fully visible
        const partialCell = numberOfCells % 1;
        if (partialCell > 0) {
            const lastCellStart = DateTime.fromMillis(lastCell.start);
            end = addToDate(lastCellStart, unit, partialCell);
            end = DateTime.fromMillis(end.ts - 1);
        }

        if (isReference) {
            if (canExpandOverEndOfUnit) {
                // If the start date is in the middle of the unit,
                // make sure the end date is too
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
                if (unit !== 'hour' && start.hour !== 0) {
                    end = end.set({ hours: start.hour - 1 });
                }
                if (start.minute !== 0) {
                    end = end.set({ minutes: start.minute - 1 });
                }
            }

            lastCell.end = end.ts;
            this._end = end;
        } else if (lastCell.end > this.end) {
            lastCell.end = this.end.ts;
        }
    }

    /**
     * Compute the width of each cell and creates the cellWidths array.
     *
     * @param {number} cellWidth The width of one cell of the smallest unit header.
     * @param {object[]} smallestCells Array containing the cells of the smallest unit header.
     */
    computeCellWidths(cellWidth, smallestCells) {
        const { cells, unit, span } = this;
        const cellWidths = [];

        if (this.cells === smallestCells) {
            // The cells of the header with the shortest unit all have the same width
            cells.forEach(() => {
                cellWidths.push(cellWidth);
            });
        } else {
            // The other headers base their cell widths on the header with the shortest unit
            let cellIndex = 0;
            cells.forEach((cell, index) => {
                let width = 0;
                let start =
                    index === 0
                        ? DateTime.fromMillis(smallestCells[0].start)
                        : DateTime.fromMillis(cell.start);
                const end = addToDate(start, unit, span);

                while (cellIndex < smallestCells.length) {
                    start = DateTime.fromMillis(
                        smallestCells[cellIndex].start
                    );

                    // Normalize the beginning of the week, because Luxon's week start on Monday
                    const normalizedStart =
                        unit === 'week' ? addToDate(start, 'day', 1) : start;
                    const normalizedEnd =
                        unit === 'week' ? addToDate(end, 'day', 1) : end;

                    const startUnit = normalizedStart.startOf(unit);
                    const endUnit = normalizedEnd.startOf(unit);

                    // Stop if the next smallestHeader cell belongs to the next header unit
                    if (endUnit <= startUnit) {
                        break;
                    }

                    width += cellWidth;
                    cellIndex += 1;
                }
                cellWidths.push(width);
            });
        }

        this.cellWidths = cellWidths;
    }
}
