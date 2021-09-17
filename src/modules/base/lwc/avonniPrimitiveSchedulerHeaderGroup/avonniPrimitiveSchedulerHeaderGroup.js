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
import { DateTime, Interval } from 'c/luxon';
import {
    addToDate,
    dateTimeObjectFrom,
    numberOfUnitsBetweenDates,
    normalizeArray
} from 'c/utilsPrivate';
import SchedulerHeader from './avonniSchedulerHeader';

const UNITS = ['minute', 'hour', 'day', 'week', 'month', 'year'];
const DEFAULT_START_DATE = dateTimeObjectFrom(new Date());
const DEFAULT_AVAILABLE_MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const DEFAULT_AVAILABLE_DAYS_OF_THE_WEEK = [0, 1, 2, 3, 4, 5, 6];
const DEFAULT_AVAILABLE_TIME_FRAMES = ['00:00-23:59'];
const DEFAULT_TIME_SPAN = {
    unit: 'hour',
    span: '12'
};
const DEFAULT_HEADERS = [
    {
        unit: 'hour',
        span: 1,
        label: 'h a'
    },
    {
        unit: 'day',
        span: 1,
        label: 'ccc, LLL d'
    }
];

/**
 * @class
 * @descriptor avonni-primitive-scheduler-header-group
 */
export default class AvonniPrimitiveSchedulerHeaderGroup extends LightningElement {
    _availableDaysOfTheWeek = DEFAULT_AVAILABLE_DAYS_OF_THE_WEEK;
    _availableMonths = DEFAULT_AVAILABLE_MONTHS;
    _availableTimeFrames = DEFAULT_AVAILABLE_TIME_FRAMES;
    _headers = DEFAULT_HEADERS;
    _scrollLeftOffset = 0;
    _start = DEFAULT_START_DATE;
    _timeSpan = DEFAULT_TIME_SPAN;

    _cellWidth = 0;
    _numberOfVisibleCells = 0;
    _previousStartTimes = [];
    computedHeaders = [];

    connectedCallback() {
        /**
         * The event fired when the header group is connected.
         *
         * @event
         * @name privateheaderregister
         * @param {function} scrollHeadersTo Takes the direction of the scroll as an argument and creates the new header columns accordingly.
         */
        this.dispatchEvent(
            new CustomEvent('privateheaderregister', {
                detail: {
                    callbacks: {
                        scrollHeadersTo: this.scrollHeadersTo.bind(this)
                    }
                }
            })
        );
        this.initHeaders();
    }

    renderedCallback() {
        if (!this._cellWidth) {
            const cellText = this.template.querySelector(
                '.avonni-scheduler__header-row:last-of-type .avonni-scheduler__header-cell span'
            );
            // We add 20 pixels for padding
            this._cellWidth =
                Math.ceil(cellText.getBoundingClientRect().width) + 20;
            this.dispatchCellWidth();
        }

        if (!this._numberOfVisibleCells) {
            const totalWidth = this.template.host.getBoundingClientRect().width;
            this._numberOfVisibleCells = Math.ceil(
                totalWidth / this._cellWidth
            );

            // If the maximum number of visible cells on the screen is bigger
            // than the actual number of cells, recompute the cell width so the
            // schedule takes the full screen
            if (
                this.smallestHeader.numberOfColumns < this._numberOfVisibleCells
            ) {
                this._numberOfVisibleCells = this.smallestHeader.numberOfColumns;
                this._cellWidth = totalWidth / this._numberOfVisibleCells;
                this.dispatchCellWidth();
            }

            this.scrollHeadersTo();
            return;
        }

        this.updateCellsWidths();
        this.updateStickyLabels();
    }

    /**
     * Array of available days of the week. The days are represented by a number, starting from 0 for Sunday, and ending with 6 for Saturday.
     *
     * @type {number[]}
     * @public
     */
    @api
    get availableDaysOfTheWeek() {
        return this._availableDaysOfTheWeek;
    }
    set availableDaysOfTheWeek(value) {
        this._availableDaysOfTheWeek = normalizeArray(value);
        if (this.isConnected) this.initHeaders();
    }

    /**
     * Array of available months. The months are represented by a number, starting from 0 for January, and ending with 11 for December.
     *
     * @type {number[]}
     * @public
     */
    @api
    get availableMonths() {
        return this._availableMonths;
    }
    set availableMonths(value) {
        this._availableMonths = normalizeArray(value);
        if (this.isConnected) this.initHeaders();
    }

    /**
     * Array of available time frames. Each time frame string must follow the pattern ‘start-end’, with start and end being ISO8601 formatted time strings.
     *
     * @type {string[]}
     * @public
     */
    @api
    get availableTimeFrames() {
        return this._availableTimeFrames;
    }
    set availableTimeFrames(value) {
        this._availableTimeFrames = normalizeArray(value);
        if (this.isConnected) this.initHeaders();
    }

    /**
     * Array of header objects. See the Scheduler for allowed keys.
     *
     * @type {object[]}
     * @public
     */
    @api
    get headers() {
        return this._headers;
    }
    set headers(value) {
        this._headers = normalizeArray(value);
        if (this.isConnected) this.initHeaders();
    }

    /**
     * Scrolling offset, used to push the border the labels need to stick to when scrolling right.
     *
     * @type {number}
     * @public
     */
    @api
    get scrollLeftOffset() {
        return this._scrollLeftOffset;
    }
    set scrollLeftOffset(value) {
        this._scrollLeftOffset = !isNaN(Number(value)) ? Number(value) : 0;
        this.updateStickyLabels();
    }

    /**
     * Starting date of the headers.
     *
     * @type {(Date|number|string)}
     * @public
     * @default new Date()
     */
    @api
    get start() {
        return this._start;
    }
    set start(value) {
        const start =
            value instanceof DateTime ? value : dateTimeObjectFrom(value);
        this._start =
            start instanceof DateTime
                ? start
                : dateTimeObjectFrom(DEFAULT_START_DATE);

        if (this.isConnected) this.initHeaders();
    }

    /**
     * Object used to set the duration of the headers. It should have two keys:
     * * unit (minute, hour, day, week, month or year)
     * * span (number).
     *
     * @type {object}
     * @public
     * @default { unit: 'hour', span: 12 }
     */
    @api
    get timeSpan() {
        return this._timeSpan;
    }
    set timeSpan(value) {
        this._timeSpan = typeof value === 'object' ? value : DEFAULT_TIME_SPAN;
        if (this.isConnected) this.initHeaders();
    }

    /**
     * Interval of time between the start and end of the currently loaded header columns.
     *
     * @type {Interval}
     * @public
     */
    @api
    get visibleInterval() {
        if (!this.smallestHeader) return undefined;

        const columns = this.smallestHeader.columns;
        const lastIndex = columns.length - 1;
        const start = dateTimeObjectFrom(columns[0].start);
        const end = dateTimeObjectFrom(columns[lastIndex].end);
        return Interval.fromDateTimes(start, end);
    }

    /**
     * Computed end date of the headers.
     *
     * @type {DateTime}
     */
    get end() {
        if (this._referenceHeader && this._referenceHeader.end) {
            return this._referenceHeader.end;
        }
        const timeSpanEnd = addToDate(
            this.start,
            this.timeSpan.unit,
            this.timeSpan.span
        );
        // We take one millisecond off to exclude the next unit
        return DateTime.fromMillis(timeSpanEnd - 1);
    }

    /**
     * Header with the smallest unit.
     *
     * @type {SchedulerHeader}
     */
    get smallestHeader() {
        if (!this.computedHeaders.length) return null;

        const lastIndex = this.computedHeaders.length - 1;
        return this.computedHeaders[lastIndex];
    }

    /**
     * Update the headers columns depending on the direction of the scroll.
     *
     * @param {string} direction Direction of the scroll. Valid values are 'left' or 'right'.
     */
    scrollHeadersTo(direction) {
        let startTime;
        if (!this._previousStartTimes.length) {
            startTime = DateTime.fromMillis(this.start.ts);
            this._previousStartTimes = [startTime];
        } else if (direction === 'left') {
            const lastIndex = this._previousStartTimes.length - 1;
            if (lastIndex > -1) {
                startTime = this._previousStartTimes[lastIndex];
                this._previousStartTimes.pop();
            } else return;
        } else {
            const startColumn = this.smallestHeader.columns[
                this._numberOfVisibleCells
            ];
            if (startColumn) {
                startTime = dateTimeObjectFrom(startColumn.start);
                this._previousStartTimes.push(startTime);
            } else return;
        }

        [...this.computedHeaders].reverse().forEach((header) => {
            if (header !== this.smallestHeader) {
                const lastIndex = this.smallestHeader.columns.length - 1;
                const lastColumn = this.smallestHeader.columns[lastIndex];
                const lastColumnStart = dateTimeObjectFrom(lastColumn.start);
                const lastColumnEnd =
                    addToDate(
                        lastColumnStart,
                        this.smallestHeader.unit,
                        this.smallestHeader.span
                    ) - 1;
                header.end = lastColumnEnd;
            }

            header.initColumns(startTime);
            header.computeColumnWidths(
                this._cellWidth,
                this.smallestHeader.columns
            );
        });
        this.computedHeaders = [...this.computedHeaders];

        this.dispatchEvent(
            new CustomEvent('privatevisibleheaderchange', {
                detail: {
                    direction,
                    visibleCells: this._numberOfVisibleCells,
                    visibleInterval: this.visibleInterval
                }
            })
        );
    }

    /**
     * Create the headers.
     */
    initHeaders() {
        // Sort the headers from the longest unit to the shortest
        const sortedHeaders = [...this.headers].sort(
            (firstHeader, secondHeader) => {
                const firstIndex = UNITS.findIndex(
                    (unit) => unit === firstHeader.unit
                );
                const secondIndex = UNITS.findIndex(
                    (unit) => unit === secondHeader.unit
                );
                return secondIndex - firstIndex;
            }
        );

        // Create the reference header
        // The reference header is the header using the timeSpan unit
        const referenceUnit = this.timeSpan.unit;
        const referenceHeader = sortedHeaders.find(
            (header) => header.unit === referenceUnit
        );

        const referenceColumns = numberOfUnitsBetweenDates(
            referenceUnit,
            this.start,
            this.end
        );

        const referenceSpan = referenceHeader
            ? referenceHeader.span
            : this.timeSpan.span;

        const reference = new SchedulerHeader({
            unit: referenceUnit,
            span: referenceSpan,
            duration: this.timeSpan.span,
            label: referenceHeader ? referenceHeader.label : '',
            start: this.start,
            end: this.end,
            availableTimeFrames: this.availableTimeFrames,
            availableDaysOfTheWeek: this.availableDaysOfTheWeek,
            availableMonths: this.availableMonths,
            numberOfColumns: referenceColumns / referenceSpan,
            isReference: true,
            // If there is no header using the timeSpan unit,
            // hide the reference header
            isHidden: !referenceHeader
        });

        // Make sure the reference end is at the end of the smallest header unit
        reference.end = reference.end.endOf(
            sortedHeaders[sortedHeaders.length - 1].unit
        );

        this._referenceHeader = reference;

        // Create all headers
        const headerObjects = [];
        sortedHeaders.forEach((header) => {
            const unit = header.unit;
            let headerObject;

            // If the current header is the reference, use the already made header object
            if (
                reference &&
                referenceUnit === unit &&
                reference.label === header.label
            ) {
                headerObject = reference;
            } else {
                const columns = numberOfUnitsBetweenDates(
                    unit,
                    this.start,
                    this.end
                );

                headerObject = new SchedulerHeader({
                    unit: unit,
                    span: header.span,
                    label: header.label,
                    start: reference.start,
                    end: this.end,
                    availableTimeFrames: this.availableTimeFrames,
                    availableDaysOfTheWeek: this.availableDaysOfTheWeek,
                    availableMonths: this.availableMonths,
                    numberOfColumns: columns / header.span
                });
            }

            headerObjects.push(headerObject);

            // Update the reference end if the current header ended before the reference
            if (headerObject.end < reference.end) {
                reference.end = headerObject.end;
            }
        });

        this.computedHeaders = headerObjects;

        // On next render, reset the cells calculation
        this._cellWidth = undefined;
        this._numberOfVisibleCells = undefined;
        this._previousStartTimes = [];

        /**
         * The event fired when new headers are created.
         *
         * @event
         * @name privateheaderchange
         * @param {SchedulerHeader} smallestHeader Header with the smallest unit.
         */
        this.dispatchEvent(
            new CustomEvent('privateheaderchange', {
                detail: {
                    smallestHeader: this.smallestHeader
                }
            })
        );
    }

    /**
     * Update the header cells style with their computed width.
     */
    updateCellsWidths() {
        // Get rows and sort them from the shortest unit to the longest
        const rows = Array.from(
            this.template.querySelectorAll('.avonni-scheduler__header-row')
        ).reverse();

        rows.forEach((row) => {
            const header = this.computedHeaders.find((computedHeader) => {
                return computedHeader.key === row.dataset.key;
            });

            // Give cells their width
            const cells = row.querySelectorAll(
                '.avonni-scheduler__header-cell'
            );
            cells.forEach((cell, index) => {
                cell.style = `--avonni-scheduler-cell-width: ${header.columnWidths[index]}px`;
            });
        });
    }

    /**
     * Set the left position of the sticky labels.
     */
    updateStickyLabels() {
        const stickyLabel = this.template.querySelectorAll(
            '.avonni-scheduler__header-label_sticky'
        );
        if (stickyLabel.length) {
            stickyLabel.forEach((label) => {
                label.style.left = `${this.scrollLeftOffset}px`;
            });
        }
    }

    /**
     * Dispatch the privatecellwidthchange event.
     */
    dispatchCellWidth() {
        /**
         * The event fired when the cell width variable is changed.
         *
         * @event
         * @name privatecellwidthchange
         * @param {number} cellWidth The new cell width value, in pixels.
         */
        this.dispatchEvent(
            new CustomEvent('privatecellwidthchange', {
                detail: {
                    cellWidth: this._cellWidth
                }
            })
        );
    }
}
