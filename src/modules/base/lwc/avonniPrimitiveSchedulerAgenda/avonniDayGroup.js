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

import { classSet } from 'c/utils';

/**
 * One day of the agenda.
 *
 * @class
 * @param {DateTime} date Date of the day.
 * @param {object[]} events Array of event objects happening on this day.
 * @param {boolean} isFirstDayOfMonth If true, the day is the first day to be visible in its month.
 * @param {boolean} isToday If true, the day is today.
 */
export default class AvonniSchedulerAgendaDayGroup {
    constructor(props) {
        Object.assign(this, props);
    }

    /**
     * Computed CSS classes of the day group.
     *
     * @type {string}
     */
    get dayClass() {
        return classSet(
            'avonni-scheduler__agenda-day slds-grid slds-m-right_small slds-grid_vertical-align-center slds-grid_align-center'
        )
            .add({
                'avonni-scheduler__agenda-day_today': this.isToday
            })
            .toString();
    }

    /**
     * Day number in the month.
     *
     * @type {number}
     */
    get day() {
        return this.date.day;
    }

    /**
     * End of the day.
     *
     * @type {DateTime}
     */
    get end() {
        return this.date.endOf('day');
    }

    /**
     * Full formatted month name.
     *
     * @type {string}
     */
    get fullMonth() {
        return this.date.toFormat('LLLL');
    }

    /**
     * Formatted month in its shorten version.
     *
     * @type {string}
     */
    get month() {
        return this.date.toFormat('LLL');
    }

    /**
     * Start of the day.
     *
     * @type {DateTime}
     */
    get start() {
        return this.date.startOf('day');
    }

    /**
     * Formatted week day.
     *
     * @type {string}
     */
    get weekday() {
        return this.date.toFormat('cccc');
    }

    /**
     * Formatted year.
     *
     * @type {string}
     */
    get year() {
        return this.date.toFormat('yyyy');
    }
}
