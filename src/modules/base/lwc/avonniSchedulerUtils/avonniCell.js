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

import {
    dateTimeObjectFrom,
    getWeekNumber,
    normalizeArray
} from 'c/utilsPrivate';
import { classSet } from 'c/utils';

/**
 * Cell of the scheduler.
 *
 * @class
 * @param {number} currentMonth Used by the calendar display. Current visible month number.
 * @param {number} start Start timestamp of the cell.
 * @param {number} end End timestamp of the cell.
 * @param {object[]} events Array of event objects that cross this cell.
 * @param {object[]} placeholders Used by the calendar display. Array of event objects used as placeholders, that cross this cell.
 */
export default class AvonniSchedulerCell {
    constructor(props) {
        this.currentMonth = props.currentMonth;
        this.start = props.start;
        this.end = props.end;
        this.events = normalizeArray(props.events);
        this.placeholders = normalizeArray(props.placeholders);
        this.timezone = props.timezone;
        this._startDate = dateTimeObjectFrom(this.start, {
            zone: this.timezone
        });
    }

    /**
     * Day of the start date.
     *
     * @type {number}
     */
    get day() {
        return this._startDate.day;
    }

    /**
     * Array of disabled events that cross this cell.
     *
     * @type {object[]}
     */
    get disabledEvents() {
        return this.events.filter((ev) => ev.disabled);
    }

    /**
     * Computed CSS classes for the cell.
     *
     * @type {string}
     */
    get computedClass() {
        return classSet(
            'avonni-scheduler__calendar-cell avonni-scheduler__border_right slds-border_bottom slds-p-around_none'
        ).add({
            'avonni-scheduler__calendar-cell_outside-of-current-month':
                this.currentMonth && this.currentMonth !== this.month,
            'avonni-scheduler__calendar-cell_today': this.isToday
        });
    }

    get isToday() {
        const today = dateTimeObjectFrom(Date.now(), {
            zone: this.timezone
        });
        return (
            this._startDate.year === today.year &&
            this._startDate.month === today.month &&
            this._startDate.day === today.day
        );
    }

    /**
     * Month of the start date.
     *
     * @type {number}
     */
    get month() {
        return this._startDate.month;
    }

    /**
     * Used by the calendar display. Array of events that overflow the cell.
     *
     * @type {object[]}
     */
    get overflowingEvents() {
        const events = this.events.concat(this.placeholders);
        return events.filter((event) => event.overflowsCell);
    }

    /**
     * Label of the "show more" button, in the calendar month display.
     *
     * @type {string}
     */
    get showMoreLabel() {
        return `+${this.overflowingEvents.length} more`;
    }

    /**
     * Week number of the start date.
     *
     * @type {number}
     */
    get weekNumber() {
        return getWeekNumber(this._startDate);
    }
}
