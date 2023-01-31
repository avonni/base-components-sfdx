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

import { nextAllowedDay } from './avonniDateComputations';

/**
 * Occurrence of a scheduler event.
 *
 * @class
 * @param {number[]} availableDaysOfTheWeek Array of available days of the week. If the occurrence spans on multiple days, some of them may be unavailable.
 * @param {number[]} availableMonths Array of available months. If the occurrence spans on multiple months, some of them may be unavailable.
 * @param {number} eventKey Unique key of the event this occurrence belongs to.
 * @param {DateTime} from Start date of the occurrence.
 * @param {string} key Unique key of the occurrence.
 * @param {number} level Level of the occurrence in its cell group.
 * @param {number} numberOfEventsInThisTimeFrame Number of events in the same time frame than the occurrence.
 * @param {number} offsetSide Offset of the occurrence in the schedule, used to prevent it from overlapping another occurrence.
 * @param {boolean} overflowsCell Used only by the calendar display. If true, the occurrence overflows the cell it is in.
 * @param {string} resourceName Name of the resource this occurrence belongs to.
 * @param {string[]} resourceNames Names of the resources the occurrence's event belongs to.
 * @param {boolean} endsInLaterCell Used only by the calendar and agenda displays. If true, the occurrence ends in a later schedule cell.
 * @param {boolean} startsInPreviousCell Used only by the calendar and agenda displays. If true, the occurrence starts in a previous schedule cell.
 * @param {string} title Title of the occurrence.
 * @param {DateTime} to End date of the occurrence.
 * @param {DateTime} weekStart Used only by the calendar display. If the occurrence is a placeholder for a multi-week occurrence, this is the start date of the placeholder's week.
 */
export class SchedulerEventOccurrence {
    constructor(props) {
        this.offsetSide = 0;
        Object.assign(this, props);
    }

    /**
     * End of the day, of the end date of the occurrence.
     *
     * @type {DateTime}
     */
    get endOfTo() {
        return this.to.endOf('day');
    }

    /**
     * Start of the day, of the start date of the occurrence.
     *
     * @type {DateTime}
     */
    get startOfFrom() {
        return this.from.startOf('day');
    }

    /**
     * If the occurrence spans on multiple days, and some weekdays/months are unavailable, this is the first available date.
     *
     * @type {DateTime}
     */
    get firstAllowedDate() {
        const { availableMonths, availableDaysOfTheWeek } = this;
        if (!availableMonths || !availableDaysOfTheWeek) {
            return this.from;
        }
        const start = this.weekStart || this.from;
        return nextAllowedDay(start, availableMonths, availableDaysOfTheWeek);
    }

    /**
     * Weekday number of the first allowed date.
     *
     * @type {number}
     */
    get firstAllowedWeekday() {
        const weekday = this.firstAllowedDate.weekday;
        return weekday === 7 ? 0 : weekday;
    }
}
