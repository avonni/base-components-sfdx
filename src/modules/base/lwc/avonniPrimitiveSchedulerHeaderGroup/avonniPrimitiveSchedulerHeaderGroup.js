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
    normalizeArray,
    normalizeString,
    normalizeBoolean,
    removeFromDate,
    equal
} from 'c/utilsPrivate';
import SchedulerHeader from './avonniSchedulerHeader';
import { classSet } from 'c/utils';

const UNITS = ['minute', 'hour', 'day', 'week', 'month', 'year'];
const DEFAULT_START_DATE = dateTimeObjectFrom(new Date());
const DEFAULT_AVAILABLE_MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const DEFAULT_AVAILABLE_DAYS_OF_THE_WEEK = [0, 1, 2, 3, 4, 5, 6];
const DEFAULT_AVAILABLE_TIME_FRAMES = ['00:00-23:59'];
const DEFAULT_TIME_SPAN = {
    unit: 'day',
    span: 1
};
const DEFAULT_AVAILABLE_TIME_SPANS = [
    { unit: 'day', span: 1, label: 'Day', headers: 'hourAndDay' },
    { unit: 'week', span: 1, label: 'Week', headers: 'hourAndDay' },
    { unit: 'month', span: 1, label: 'Month', headers: 'dayAndMonth' },
    { unit: 'year', span: 1, label: 'Year', headers: 'dayAndMonth' }
];
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

const VARIANTS = {
    valid: ['horizontal', 'vertical'],
    default: 'horizontal'
};

/**
 * @class
 * @descriptor avonni-primitive-scheduler-header-group
 */
export default class AvonniPrimitiveSchedulerHeaderGroup extends LightningElement {
    _availableDaysOfTheWeek = DEFAULT_AVAILABLE_DAYS_OF_THE_WEEK;
    _availableMonths = DEFAULT_AVAILABLE_MONTHS;
    _availableTimeFrames = DEFAULT_AVAILABLE_TIME_FRAMES;
    _availableTimeSpans = DEFAULT_AVAILABLE_TIME_SPANS;
    _headers = DEFAULT_HEADERS;
    _scrollLeftOffset = 0;
    _start = DEFAULT_START_DATE;
    _timeSpan = DEFAULT_TIME_SPAN;
    _variant = VARIANTS.default;
    _zoomToFit = false;

    _connected = false;
    _initHeadersTimeout;
    computedHeaders = [];

    connectedCallback() {
        this.initHeaders();
        this._connected = true;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

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
        if (equal(value, this._availableDaysOfTheWeek)) {
            return;
        }

        this._availableDaysOfTheWeek = normalizeArray(value);
        if (this._connected) {
            this.initHeaders();
        }
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
        if (equal(value, this._availableMonths)) {
            return;
        }

        this._availableMonths = normalizeArray(value);
        if (this._connected) {
            this.initHeaders();
        }
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
        if (equal(value, this._availableTimeFrames)) {
            return;
        }

        this._availableTimeFrames = normalizeArray(value);
        if (this._connected) {
            this.initHeaders();
        }
    }

    /**
     * Array of available time spans. Each time span object must have the following properties:
     * * unit: The unit of the time span.
     * * span: The span of the time span.
     *
     * @type {object[]}
     * @public
     */
    @api
    get availableTimeSpans() {
        return this._availableTimeSpans;
    }
    set availableTimeSpans(value) {
        if (equal(value, this._availableTimeSpans)) {
            return;
        }

        this._availableTimeSpans = normalizeArray(value, 'object');
        if (this._connected) {
            this.initHeaders();
        }
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
        if (equal(value, this._headers)) {
            return;
        }

        this._headers = normalizeArray(value);
        if (this._connected) {
            this.initHeaders();
        }
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

        if (!this.isVertical) {
            if (this.zoomToFit) {
                this.computeCellSize();
            }
            requestAnimationFrame(() => {
                this.updateStickyLabels();
            });
        }
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
        const msStart = start && start.ts;
        if (msStart === this._start.ts) {
            return;
        }

        this._start =
            start instanceof DateTime
                ? start
                : dateTimeObjectFrom(DEFAULT_START_DATE);

        if (this._connected) {
            this.initHeaders();
        }
    }

    /**
     * Object used to set the duration of the headers. It should have two keys:
     * * unit (minute, hour, day, week, month or year)
     * * span (number).
     *
     * @type {object}
     * @public
     * @default { unit: 'day', span: 1 }
     */
    @api
    get timeSpan() {
        return this._timeSpan;
    }
    set timeSpan(value) {
        if (equal(value, this._timeSpan)) {
            return;
        }

        this._timeSpan = typeof value === 'object' ? value : DEFAULT_TIME_SPAN;
        if (this._connected) {
            this.initHeaders();
        }
    }

    /**
     * Orientation of the headers. Valid values include horizontal or vertical.
     *
     * @type {string}
     * @default horizontal
     * @public
     */
    @api
    get variant() {
        return this._variant;
    }
    set variant(value) {
        this._variant = normalizeString(value, {
            validValues: VARIANTS.valid,
            fallbackValue: VARIANTS.default
        });

        if (this.isVertical) {
            requestAnimationFrame(() => {
                this.updateStickyLabels();
            });
        }
    }

    /**
     * If present, horizontal scrolling will be prevented.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get zoomToFit() {
        return this._zoomToFit;
    }
    set zoomToFit(value) {
        this._zoomToFit = normalizeBoolean(value);

        if (this._connected) {
            this.computeCellSize();
        }
    }

    /**
     * Interval of time between the current start and end.
     *
     * @type {Interval}
     * @public
     */
    @api
    get visibleInterval() {
        if (!this.smallestHeader) {
            return undefined;
        }

        const cells = this.smallestHeader.cells;
        const lastIndex = cells.length - 1;
        const start = dateTimeObjectFrom(cells[0].start);
        const end = dateTimeObjectFrom(cells[lastIndex].end);
        return Interval.fromDateTimes(start, end);
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Computed end date of the headers.
     *
     * @type {DateTime}
     */
    get end() {
        if (this._referenceHeader && this._referenceHeader.end) {
            return this._referenceHeader.end;
        }

        const { unit, span } = this.timeSpan;
        let start = this.start;
        if (this.endOnTimeSpanUnit) {
            // Compensate the fact that Luxon weeks start on Monday
            if (unit === 'week' && start.weekday === 7) {
                // Start is on Sunday and the unit is week
                start = start.startOf('day');
            } else {
                start = this.start.startOf(unit);

                if (unit === 'week') {
                    // Start is not on a Sunday and the unit is week
                    start = removeFromDate(start, 'day', 1);
                }
            }
        }
        const timeSpanEnd = addToDate(start, unit, span);

        // We take one millisecond off to exclude the next unit
        return DateTime.fromMillis(timeSpanEnd - 1);
    }

    /**
     * True if the headers must stop at the end of the time span unit. If false, the headers can end in the middle of the time span unit.
     *
     * @type {boolean}
     */
    get endOnTimeSpanUnit() {
        return this.availableTimeSpans.find((timeSpan) => {
            return (
                timeSpan.unit === this.timeSpan.unit &&
                timeSpan.span === this.timeSpan.span
            );
        });
    }

    /**
     * Computed CSS class of each header cell.
     *
     * @type {string}
     */
    get headerClass() {
        return classSet('slds-grid slds-is-relative')
            .add({
                'slds-grid_vertical avonni-scheduler-header-group__header_vertical':
                    this.isVertical
            })
            .toString();
    }

    get isVertical() {
        return this.variant === 'vertical';
    }

    /**
     * Header with the smallest unit.
     *
     * @type {SchedulerHeader}
     */
    get smallestHeader() {
        if (!this.computedHeaders.length) {
            return null;
        }

        const lastIndex = this.computedHeaders.length - 1;
        return this.computedHeaders[lastIndex];
    }

    /**
     * Computed CSS classes of the wrapper div.
     *
     * @type {string}
     */
    get wrapperClass() {
        return classSet()
            .add({
                'slds-grid': this.isVertical
            })
            .toString();
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Create the headers.
     */
    initHeaders() {
        // We use a timeout to prevent the method from being called
        // by several property changes at the same time
        clearTimeout(this._initHeadersTimeout);
        this._initHeadersTimeout = setTimeout(() => {
            this._referenceHeader = null;

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

            const referenceCells = numberOfUnitsBetweenDates(
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
                numberOfCells: referenceCells / referenceSpan,
                isReference: true,
                canExpandOverEndOfUnit: !this.endOnTimeSpanUnit,
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
                    const cells = numberOfUnitsBetweenDates(
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
                        numberOfCells: cells / header.span
                    });
                }

                headerObjects.push(headerObject);

                // Update the reference end if the current header ended before the reference
                if (headerObject.end < reference.end) {
                    reference.end = headerObject.end;
                }
            });

            this.computedHeaders = headerObjects;

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

            requestAnimationFrame(() => {
                this.computeCellSize();
            });
        }, 0);
    }

    computeCellSize() {
        if (!this.smallestHeader) {
            return;
        }
        const totalWidth = this.template.host.getBoundingClientRect().width;
        const totalNumberOfCells = this.smallestHeader.numberOfCells;
        let cellSize = 0;

        if (this.zoomToFit && !this.isVertical) {
            cellSize = totalWidth / totalNumberOfCells;
        } else {
            const cellText = this.template.querySelector(
                '[data-element-id="div-row"]:last-of-type [data-element-id^="span-label"]'
            );
            if (!cellText) {
                return;
            }

            const cellDimensions = cellText.getBoundingClientRect();
            const cellTextSize = this.isVertical
                ? cellDimensions.height
                : cellDimensions.width;
            // We add 20 pixels for padding
            cellSize = Math.ceil(cellTextSize) + 20;

            const numberOfVisibleCells = Math.ceil(totalWidth / cellSize);

            // If the maximum number of visible cells on the screen is bigger
            // than the actual number of cells, recompute the cell width so the
            // schedule takes the full screen
            if (totalNumberOfCells < numberOfVisibleCells) {
                cellSize = totalWidth / totalNumberOfCells;
            }
        }
        this.computedHeaders.forEach((header) => {
            header.computeCellWidths(cellSize, this.smallestHeader.cells);
        });
        this.dispatchCellSizeChange(cellSize);
        this.updateCellsSize();
    }

    /**
     * Update the header cells style with their computed width.
     */
    updateCellsSize() {
        // Get rows and sort them from the shortest unit to the longest
        const rows = Array.from(
            this.template.querySelectorAll('[data-element-id="div-row"]')
        ).reverse();

        rows.forEach((row) => {
            const header = this.computedHeaders.find((computedHeader) => {
                return computedHeader.key === row.dataset.key;
            });

            // Give cells their width/height
            const cells = row.querySelectorAll('[data-element-id="div-cell"]');
            cells.forEach((cell, index) => {
                cell.style = `--avonni-scheduler-cell-size: ${header.cellWidths[index]}px`;
            });
        });
    }

    /**
     * Set the left position of the sticky labels.
     */
    updateStickyLabels() {
        const stickyLabels = this.template.querySelectorAll(
            '[data-element-id="span-label-sticky"]'
        );
        if (stickyLabels.length && this.zoomToFit) {
            stickyLabels.forEach((stickyLabel) => {
                stickyLabel.style.left = 'auto';
            });
        } else if (stickyLabels.length) {
            stickyLabels.forEach((label) => {
                label.style.left = `${this.scrollLeftOffset}px`;
            });
        }
    }

    /**
     * Dispatch the privatecellsizechange event.
     */
    dispatchCellSizeChange(size) {
        /**
         * The event fired when the cell size is changed.
         *
         * @event
         * @name privatecellsizechange
         * @param {number} cellSize The new cell size value, in pixels.
         */
        this.dispatchEvent(
            new CustomEvent('privatecellsizechange', {
                detail: {
                    cellSize: size
                }
            })
        );
    }
}
