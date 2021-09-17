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
import { normalizeBoolean } from 'c/utilsPrivate';
import { generateUUID } from 'c/utils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

const DEFAULT_MAX = new Date(2099, 11, 31);

const DEFAULT_MIN = new Date(1900, 0, 1);

const DEFAULT_DATE = new Date(new Date().setHours(0, 0, 0, 0));

/**
 * @class
 * @name Calendar
 * @descriptor avonni-calendar
 * @storyId example-calendar--base
 * @public
 */
export default class AvonniCalendar extends LightningElement {
    _disabledDates = [];
    _markedDates = [];
    _value;
    _max = DEFAULT_MAX;
    _min = DEFAULT_MIN;
    _multiValue;
    _disabled = false;
    _weekNumber = false;
    year;
    month;
    day;
    date = DEFAULT_DATE;
    calendarData;

    months = MONTHS;

    connectedCallback() {
        this.updateDateParameters();
    }

    /**
     * An array that will be used to determine which dates to be disabled in the calendar.
     * 
     * @public
     * @type {object[]}
     */
    @api
    get disabledDates() {
        return this._disabledDates;
    }

    set disabledDates(value) {
        this._disabledDates = value;
        this.updateDateParameters();
    }

    /**
     * An array that will be used to determine which dates to be marked in the calendar.
     * 
     * @public
     * @type {object[]}
     */
    @api
    get markedDates() {
        return this._markedDates;
    }

    set markedDates(value) {
        this._markedDates = value;
        this.updateDateParameters();
    }

    /**
     * The value of the date selected, which can be a Date object, timestamp, or an ISO8601 formatted string.
     * 
     * @public
     * @type {string}
     */
    @api
    get value() {
        return this._value;
    }

    set value(value) {
        if (value) {
            this._value = new Date(value);
            this.date = new Date(value);
            this._value.setHours(0, 0, 0, 0);
            this.date.setHours(0, 0, 0, 0);
            this.updateDateParameters();
        }
    }

    /**
     * Specifies the maximum date, which the calendar can show.
     * 
     * @public
     * @type {object}
     * @default Date(2099, 11, 31)
     */
    @api
    get max() {
        return this._max;
    }

    set max(value) {
        this._max = new Date(value);
        this._max.setHours(0, 0, 0, 0);
        this.updateDateParameters();
    }

    /**
     * Specifies the minimum date, which the calendar can show.
     * 
     * @public
     * @type {object}
     * @default Date(1900, 0, 1)
     */
    @api
    get min() {
        return this._min;
    }

    set min(value) {
        this._min = new Date(value);
        this._min.setHours(0, 0, 0, 0);
        this.updateDateParameters();
    }

    /**
     * The value of the date which will use for the draw multi-select line. Multi-value can be before or after the selected date value.
     * 
     * @public
     * @type {string}
     */
    @api
    get multiValue() {
        return this._multiValue;
    }

    set multiValue(value) {
        if (value) {
            this._multiValue = new Date(value);
            this._multiValue.setHours(0, 0, 0, 0);
            this.updateDateParameters();
        }
    }

    /**
     * If true, the calendar is disabled.
     * 
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
        this.updateDateParameters();
    }

    /**
     * If true, display a week number column.
     * 
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get weekNumber() {
        return this._weekNumber;
    }

    set weekNumber(value) {
        this._weekNumber = normalizeBoolean(value);
        this.updateDateParameters();
    }

    /**
     * Compute days from week.
     */
    get days() {
        let days = [];

        if (this.weekNumber) {
            days.push('');
        }

        return days.concat(DAYS);
    }

    /**
     * Compute year list spread from min and max.
     */
    get yearsList() {
        let startYear = this.min.getFullYear();
        let endYear = this.max.getFullYear();

        return [...Array(endYear - startYear + 1).keys()].map((x) => {
            let year = x + startYear;
            return { label: year, value: year };
        });
    }

    /**
     * Disable interaction on previous date layout.
     */
    get disabledPrevious() {
        let disabled = this.disabled;
        let previousDate = new Date(this.date);
        previousDate.setMonth(this.date.getMonth() - 1);
        previousDate.setDate(1);

        let minDate = new Date(this.min);
        minDate.setDate(1);

        if (previousDate < minDate) {
            disabled = true;
        }

        return disabled;
    }

    /**
     * Disable interaction on next date layout.
     */
    get disabledNext() {
        let disabled = this.disabled;
        let nextDate = new Date(this.date);
        nextDate.setMonth(this.date.getMonth() + 1);
        nextDate.setDate(1);

        let maxDate = new Date(this.max);
        maxDate.setDate(1);

        if (nextDate > maxDate) {
            disabled = true;
        }

        return disabled;
    }

    /**
     * Generate unique ID key.
     */
    get generateKey() {
        return generateUUID();
    }

    /**
     * Create Dates array.
     * 
     * @param {object[]} array
     * @returns dates
     */
    fullDatesFromArray(array) {
        let dates = [];

        array.forEach((date) => {
            if (typeof date === 'object') {
                dates.push(date.setHours(0, 0, 0, 0));
            }
        });

        return dates;
    }

    /**
     * Create weekdays from dates array.
     * 
     * @param {object[]} array
     * @returns dates
     */
    weekDaysFromArray(array) {
        let dates = [];

        array.forEach((date) => {
            if (typeof date === 'string') {
                dates.push(DAYS.indexOf(date));
            }
        });

        return dates;
    }

    /**
     * Create days + months from dates array.
     * 
     * @param {object[]} array
     * @returns dates
     */
    monthDaysFromArray(array) {
        let dates = [];

        array.forEach((date) => {
            if (typeof date === 'number') {
                dates.push(date);
            }
        });

        return dates;
    }

    /**
     * Update date : year, month, day.
     */
    updateDateParameters() {
        this.year = this.date.getFullYear();
        this.month = MONTHS[this.date.getMonth()];
        this.day = this.date.getDay();
        this.generateViewData();
    }

    /**
     * Compute view data for Calendar.
     */
    generateViewData() {
        let calendarData = [];
        let today = new Date().setHours(0, 0, 0, 0);
        let currentMonth = this.date.getMonth();
        let date = new Date(this.date.getTime());
        let dateMonth = date.getMonth();
        date.setDate(1);

        if (date.getDay() > 0) {
            date.setDate(-date.getDay() + 1);
        }

        for (let i = 0; i < 6; i++) {
            let weekData = [];

            if (this.weekNumber) {
                let week = date.getWeek();

                if (dateMonth === 0 && week > 51) {
                    week = 1;
                }

                weekData.push({
                    label: week,
                    class: 'avonni-week-cell',
                    dayClass: '',
                    selected: false,
                    currentDate: false,
                    fullDate: ''
                });
            }

            for (let a = 0; a < 7; a++) {
                let currentDate = false;
                let selected = false;

                let dateClass = '';
                let dayClass = 'slds-day';
                let fullDate = '';
                let disabled = this.isInArray(date, this.disabledDates);
                const marked = this.isInArray(date, this.markedDates);
                let time = date.getTime();
                let valueTime = this.value ? this.value.getTime() : '';

                if (date.getMonth() !== currentMonth || disabled) {
                    if (i > 3 && a === 0) {
                        weekData.splice(-1, 1);
                        break;
                    }

                    dateClass = 'slds-day_adjacent-month';
                    dayClass = 'avonni-disabled-cell';
                } else if (this.disabled) {
                    dateClass = 'slds-day_adjacent-month';
                    dayClass = 'avonni-disabled-cell';
                } else {
                    fullDate = time;
                }

                if (today === time) {
                    dateClass += ' slds-is-today';
                    currentDate = true;
                }

                if (
                    this.value &&
                    this.multiValue &&
                    ((this.multiValue.getTime() <= time && time <= valueTime) ||
                        (valueTime <= time &&
                            time <= this.multiValue.getTime()))
                ) {
                    dateClass += ' slds-is-selected slds-is-selected-multi';
                } else if (this.value && valueTime === time) {
                    dateClass += ' slds-is-selected';
                }

                let label = '';

                if (time >= this.min.getTime() && time <= this.max.getTime()) {
                    label = date.getDate();
                } else {
                    dayClass = 'avonni-disabled-cell';
                    fullDate = '';
                }

                if (marked && label > 0) {
                    dayClass += ' avonni-marked-cell';
                }

                weekData.push({
                    label: label,
                    class: dateClass,
                    dayClass: dayClass,
                    selected: selected,
                    currentDate: currentDate,
                    fullDate: fullDate
                });

                date.setDate(date.getDate() + 1);
            }

            calendarData.push(weekData);
        }

        this.calendarData = calendarData;
    }

    /**
     * Find if date entry is in the date array.
     * 
     * @param {object | Date} date
     * @param {object[]} array
     * @returns disabled
     */
    isInArray(date, array) {
        let disabled = false;
        let time = date.getTime();
        let weekDay = date.getDay();
        let monthDay = date.getDate();

        if (
            this.fullDatesFromArray(array).indexOf(time) > -1 ||
            this.weekDaysFromArray(array).indexOf(weekDay) > -1 ||
            this.monthDaysFromArray(array).indexOf(monthDay) > -1
        ) {
            disabled = true;
        }

        return disabled;
    }

    /**
     * Year change handler.
     * 
     * @param {object} event
     */
    handleYearChange(event) {
        this.date.setFullYear(event.detail.value);

        if (this.date.getTime() < this.min.getTime()) {
            this.date.setMonth(this.min.getMonth());
        }

        if (this.date.getTime() > this.max.getTime()) {
            this.date.setMonth(this.max.getMonth());
        }

        this.updateDateParameters();
        event.stopPropagation();
    }

    /**
     * Previous month handler.
     */
    handlerPreviousMonth() {
        this.date.setMonth(this.date.getMonth() - 1);
        this.updateDateParameters();
    }

    /**
     * Next month handler.
     */
    handlerNextMonth() {
        this.date.setMonth(this.date.getMonth() + 1);
        this.updateDateParameters();
    }

    /**
     * Date selection handler.
     * 
     * @param {object} event
     */
    handlerSelectDate(event) {
        let date = event.target.dataset.day;

        if (date) {
            this.value = new Date(Number(date));
            this.date = new Date(Number(date));
            this.updateDateParameters();
            this.dispatchChange();
        }
    }

    /**
     * Change event dispatcher.
     */
    dispatchChange() {
        const date = this.date.getDate();
        const datePrefix = date < 10 ? '0' : '';
        const month = this.date.getMonth() + 1;
        const monthPrefix = month < 10 ? '0' : '';
        const year = this.date.getFullYear();

        const dateStr = `${year}-${monthPrefix}${month}-${datePrefix}${date}`;

        /**
         * The event fired when the selected date is changed.
         * 
         * @event
         * @public
         * @name change
         * @param {string} value dateStr ( the selected date )
         */
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value: dateStr
                }
            })
        );
    }

    /**
     * Private focus handler.
     */
    handleFocus() {
        /**
         * @event
         * @private
         * @name privatefocus
         * @bubbles
         * @cancelable
         */
        this.dispatchEvent(
            new CustomEvent('privatefocus', {
                bubbles: true,
                cancelable: true
            })
        );
    }

    /**
     * Private blur handler.
     */
    handleBlur() {
        /**
         * @event
         * @private
         * @name privateblur
         * @bubbles
         * @cancelable
         * @composed
         */
        this.dispatchEvent(
            new CustomEvent('privateblur', {
                composed: true,
                bubbles: true,
                cancelable: true
            })
        );
    }
}

/**
 * Compute week Number from date input.
 * 
 * @returns week number
 */
// eslint-disable-next-line no-extend-native
Date.prototype.getWeek = function () {
    let startDate = new Date(this.getFullYear(), 0, 1);
    let millisecsInDay = 86400000;

    return Math.ceil(
        ((this - startDate) / millisecsInDay + startDate.getDay() + 1) / 7
    );
};
