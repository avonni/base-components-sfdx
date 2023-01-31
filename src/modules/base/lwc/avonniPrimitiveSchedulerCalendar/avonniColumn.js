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

import { SchedulerCellGroup } from 'c/schedulerUtils';
import { dateTimeObjectFrom, normalizeArray } from 'c/utilsPrivate';

/**
 * Column of the calendar (day, week and month views), or multi-day event row (day and week views).
 *
 * @class
 * @extends SchedulerCellGroup
 * @param {SchedulerCell[]} cells Inherited. See SchedulerCellGroup.
 * @param {object[]} disabledEvents Array of disabled event objects that cross the column.
 * @param {object[]} multiDayPlaceholders Array of placeholder objects. The placeholders are used in the month view to keep track of the room a multi-day event is taking, and compute correctly the occurrences offset.
 * @param {object[]} events Inherited. See SchedulerCellGroup.
 * @param {object[]} referenceCells Inherited. See SchedulerCellGroup.
 */
export default class AvonniSchedulerCalendarColumn extends SchedulerCellGroup {
    constructor(props) {
        super(props);
        this.disabledEvents = normalizeArray(props.disabledEvents);
        this.multiDayPlaceholders = normalizeArray(props.multiDayPlaceholders);
    }

    /**
     * Start date of the column.
     *
     * @type {DateTime}
     */
    get start() {
        const start = dateTimeObjectFrom(this.cells[0].start, {
            zone: this.timezone
        });
        return start.startOf('day');
    }

    /**
     * End date of the column.
     *
     * @type {DateTime}
     */
    get end() {
        const end = dateTimeObjectFrom(this.cells[0].end, {
            zone: this.timezone
        });
        return end.endOf('day');
    }

    /**
     * Week day number of the start date.
     */
    get weekday() {
        return this.start.weekday === 7 ? 0 : this.start.weekday;
    }

    /**
     * Initialize the cells array.
     */
    initCells() {
        super.initCells();

        if (this.multiDayPlaceholders) {
            // Order the placeholders that are spanning on multiple weeks
            // from the latest to the earliest, so the last cells do not
            // use the first week's placeholder as their occurrence
            this.multiDayPlaceholders.sort((a, b) => {
                if (!a.weekStart) return 1;
                if (!b.weekStart) return -1;
                return b.weekStart - a.weekStart;
            });
            this.multiDayPlaceholders.forEach((placeholder) => {
                this.addEventToCells(placeholder, 'placeholders');
            });
        }
    }
}
