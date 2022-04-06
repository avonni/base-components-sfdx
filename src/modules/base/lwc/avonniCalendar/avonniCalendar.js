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
import {
    normalizeBoolean,
    normalizeString,
    normalizeArray
} from 'c/utilsPrivate';
import { generateUUID, classSet } from 'c/utils';

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

const NULL_DATE = new Date('12/31/1969').setHours(0, 0, 0, 0);

const SELECTION_MODES = {
    valid: ['single', 'multiple', 'interval'],
    default: 'single'
};

const LABEL_ICON_POSITIONS = {
    valid: ['left', 'right'],
    default: 'left'
};

/**
 * @class
 * @name Calendar
 * @descriptor avonni-calendar
 * @storyId example-calendar--base
 * @public
 */
export default class AvonniCalendar extends LightningElement {
    _disabled = false;
    _disabledDates = [];
    _markedDates = [];
    _max = DEFAULT_MAX;
    _min = DEFAULT_MIN;
    _selectionMode = SELECTION_MODES.default;
    _value = [];
    _dateLabels = [];
    _weekNumber = false;
    date = DEFAULT_DATE;
    year;
    month;
    day;
    calendarData;

    months = MONTHS;

    connectedCallback() {
        this.updateDateParameters();
    }

    /**
     * Array of date label objects. Priority is given to dates placed toward the end of the array.
     *
     * @public
     * @type {object[]}
     */
    @api
    get dateLabels() {
        return this._dateLabels;
    }

    set dateLabels(value) {
        const _value = normalizeArray(value);

        this._dateLabels = _value.map((x) => {
            const labelDate =
                new Date(x.date).setHours(0, 0, 0, 0) !== NULL_DATE &&
                !isNaN(Date.parse(x.date))
                    ? this.formattedWithTimezoneOffset(new Date(x.date))
                    : x.date;
            return { date: labelDate, ...x };
        });
        this.updateDateParameters();
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
     * Array of disabled dates. The dates should be a Date object, a timestamp, or an ISO8601 formatted string.
     *
     * @public
     * @type {object[]}
     */
    @api
    get disabledDates() {
        return this._disabledDates;
    }

    set disabledDates(value) {
        const valueArray =
            typeof value === 'string' || !Array.isArray(value)
                ? [value]
                : value;
        this._disabledDates = valueArray.map((x) => {
            const isDate =
                new Date(x).setHours(0, 0, 0, 0) !== NULL_DATE &&
                !isNaN(Date.parse(x))
                    ? this.formattedWithTimezoneOffset(new Date(x))
                    : x;
            return isDate;
        });

        this.updateDateParameters();
    }

    /**
     * Array of marked date objects.
     *
     * @public
     * @type {object[]}
     */
    @api
    get markedDates() {
        return this._markedDates;
    }

    set markedDates(value) {
        this._markedDates = normalizeArray(value).map((x) => {
            const isDate =
                new Date(x.date).setHours(0, 0, 0, 0) !== NULL_DATE &&
                !isNaN(Date.parse(x.date))
                    ? this.formattedWithTimezoneOffset(new Date(x.date))
                    : x.date;
            return { date: isDate, color: x.color };
        });
        this.updateDateParameters();
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

    set max(max) {
        this._max = this.formattedWithTimezoneOffset(new Date(max));
        this._max.setHours(0, 0, 0, 0);
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

    set min(min) {
        this._min = this.formattedWithTimezoneOffset(new Date(min));
        this._min.setHours(0, 0, 0, 0);
    }

    /**
     * Specifies the selection mode of the calendar. Valid values include single, multiple and interval.
     * If single, only one date can be selected at a time. If multiple, the user can select multiple dates.
     * If interval, the user can only select a date range (two dates).
     *
     * @public
     * @type {string}
     * @default single
     */
    @api
    get selectionMode() {
        return this._selectionMode;
    }

    set selectionMode(value) {
        this._selectionMode = normalizeString(value, {
            validValues: SELECTION_MODES.valid,
            fallbackValue: SELECTION_MODES.default
        });
        this.updateDateParameters();
    }

    /**
     * The value of the selected date(s). Dates can be a Date object, timestamp, or an ISO8601 formatted string.
     *
     * @public
     * @type {string|string[]}
     */
    @api
    get value() {
        return this._value;
    }

    set value(value) {
        if (value) {
            this._value =
                typeof value === 'string' || !Array.isArray(value)
                    ? [this.formattedWithTimezoneOffset(new Date(value))]
                    : [
                          ...normalizeArray(
                              value.map((x) =>
                                  this.formattedWithTimezoneOffset(new Date(x))
                              )
                          )
                      ];
            this._value = this._value.filter(
                (x) => x.setHours(0, 0, 0, 0) !== NULL_DATE
            );
            this.date = this._value.length
                ? new Date(this._value[0])
                : DEFAULT_DATE;
            this.updateDateParameters();
        }
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

        let minDate = new Date(this._min);
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
     * Generate array of dates from marked dates object.
     */
    get markedDatesArray() {
        return this.markedDates.map((date) => {
            return date.date;
        });
    }

    get normalizedValue() {
        const stringDates = this.value.map((date) => {
            const stringDate = date.toISOString();
            return stringDate.match(/^\d{4}-\d{2}-\d{2}/)[0];
        });
        return this.selectionMode === 'single' ? stringDates[0] : stringDates;
    }

    /**
     * Generate array of dates from marked dates object.
     */
    get labeledDatesArray() {
        return this.dateLabels.map((date) => {
            return date.date;
        });
    }

    /**
     *
     * @returns string
     */
    get tableClasses() {
        const isLabeled = this._dateLabels.length > 0;
        return classSet('slds-datepicker__month')
            .add({ 'avonni-calendar__date-with-labels': isLabeled })
            .toString();
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
     * Returns last date of array.
     *
     * @param {object[]} array
     */
    endDateInInterval(array) {
        array.map((x) => x.getTime()).sort((a, b) => a - b);
        const length = array.length;
        this.endDate = array[length - 1];
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
                    class: 'avonni-calendar__week-cell',
                    dayClass: '',
                    selected: false,
                    currentDate: false,
                    fullDate: ''
                });
            }

            for (let a = 0; a < 7; a++) {
                let currentDate = false;
                let selected = false;

                let dateClass = 'avonni-calendar__date-cell';
                let dayClass = 'slds-day';
                let fullDate = '';
                let disabled = this.isInArray(date, this.disabledDates);
                const marked = this.isInArray(date, this.markedDatesArray);
                const markedColors = this.isInArrayMarker(date);
                let time = date.getTime();
                let valueTime = this._value.length
                    ? this._value[0].getTime()
                    : '';

                if (date.getMonth() !== currentMonth || disabled) {
                    if (i > 3 && a === 0) {
                        weekData.splice(-1, 1);
                        break;
                    }

                    dateClass = 'slds-day_adjacent-month';
                    dayClass = 'avonni-calendar__disabled-cell slds-day';
                } else if (this.disabled) {
                    dateClass = 'slds-day_adjacent-month';
                    dayClass = 'avonni-calendar__disabled-cell slds-day';
                } else {
                    fullDate = time;
                }

                if (today === time) {
                    dateClass += ' slds-is-today';
                    currentDate = true;
                }

                // chip label
                let labelIndex;
                let labeled = false;
                let iconPosition = 'left';
                let showLeft = false;
                let showRight = false;
                let labelClasses;
                if (this.isInArray(date, this.labeledDatesArray)) {
                    labelIndex = this.findArrayPosition(date, this._dateLabels);
                    labeled = true;
                    const labelItem = this._dateLabels[labelIndex];

                    iconPosition = normalizeString(labelItem.iconPosition, {
                        validValues: LABEL_ICON_POSITIONS.valid,
                        fallbackValue: LABEL_ICON_POSITIONS.default
                    });
                    if (iconPosition === 'left' && labelItem.iconName) {
                        showLeft = true;
                    }
                    if (iconPosition === 'right' && labelItem.iconName) {
                        showRight = true;
                    }

                    labelClasses = classSet('avonni-calendar__chip-label')
                        .add({
                            'avonni-calendar__chip-icon-only':
                                labelItem.iconName && !labelItem.label
                        })
                        .add({
                            'avonni-calendar__chip-without-icon':
                                !labelItem.iconName
                        })
                        .toString();
                }

                // interval
                this.endDateInInterval(this._value);
                if (
                    this._value.length >= 2 &&
                    this._selectionMode === 'interval' &&
                    ((this.endDate.getTime() <= time && time <= valueTime) ||
                        (valueTime <= time && time <= this.endDate.getTime()))
                ) {
                    dateClass += ' slds-is-selected slds-is-selected-multi';
                }

                // multiple choices
                else if (
                    this._value.length > 1 &&
                    this._selectionMode === 'multiple'
                ) {
                    this._value.forEach((day) => {
                        if (day.getTime() === time) {
                            dateClass += ' slds-is-selected';
                        }
                    });
                } else if (this._value && valueTime === time) {
                    dateClass += ' slds-is-selected';
                }

                let label = '';

                if (time >= this.min.getTime() && time <= this.max.getTime()) {
                    label = date.getDate();
                } else {
                    dayClass = 'avonni-calendar__disabled-cell slds-day';
                    fullDate = '';
                }

                let markedDate = false;
                if (marked && label > 0) {
                    markedDate = true;
                }

                dateClass += ' avonni-calendar__date-cell';

                weekData.push({
                    label: label,
                    class: dateClass,
                    dayClass: dayClass,
                    selected: selected,
                    currentDate: currentDate,
                    fullDate: fullDate,
                    marked: markedDate,
                    markedColors: markedColors,
                    labeled: labeled,
                    chip: {
                        showLeft: showLeft,
                        showRight: showRight,
                        classes: labelClasses,
                        ...this._dateLabels[labelIndex]
                    }
                });

                date.setDate(date.getDate() + 1);
            }
            calendarData.push(weekData);
        }

        this.calendarData = calendarData;
    }

    /**
     * Return an index if the days date is in the date array.
     *
     * @param {object | Date} date
     * @param {object[]} array
     * @returns index
     */
    findArrayPosition(day, array) {
        let index;

        // The dates are prioritize from last to first from the array.
        // We might wnat to fix this in the future.
        array
            .map((x) => x.date)
            .forEach((x, _index) => {
                if (DAYS.includes(x)) {
                    index = _index;
                }

                if (x === day.getDate()) {
                    index = _index;
                }

                if (typeof x === 'object' && x.getTime() === day.getTime()) {
                    index = _index;
                }
            });

        return index;
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
     * Find if date entry is in the markedDate array.
     *
     * @param {object | Date} date
     * @returns marked
     */
    isInArrayMarker(date) {
        let marked = [];
        let time = date.getTime();
        let weekDay = date.getDay();
        let monthDay = date.getDate();

        this._markedDates.forEach((marker) => {
            const dateArray = [marker.date];
            if (
                this.fullDatesFromArray(dateArray).indexOf(time) > -1 ||
                this.weekDaysFromArray(dateArray).indexOf(weekDay) > -1 ||
                this.monthDaysFromArray(dateArray).indexOf(monthDay) > -1
            ) {
                marked.push({
                    marked: true,
                    color: marker.color
                        ? `background-color: ${marker.color}`
                        : ''
                });
            }
        });
        return marked;
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
     * Returns an array of dates base on the selection mode multiple.
     *
     * @param {object[]} array - array of dates
     * @param {string | Date} newDate - new date
     * @returns array of dates
     */
    isSelectedMultiple(array, newDate) {
        const timestamp = newDate.getTime();
        let timestamps = array.map((x) => x.getTime());

        if (!timestamps.includes(timestamp)) {
            timestamps.push(timestamp);
        } else {
            timestamps.splice(timestamps.indexOf(timestamp), 1);
        }
        return timestamps.map((x) => new Date(x));
    }

    /**
     * Returns an array of dates base on the selection mode interval.
     *
     * @param {object[]} array - array of dates
     * @param {string | Date} newDate - new date
     * @returns array of dates
     */
    isSelectedInterval(array, newDate) {
        const timestamp = newDate.getTime();
        let timestamps = array.map((x) => x.getTime()).sort((a, b) => a - b);

        if (timestamps.includes(timestamp)) {
            timestamps.splice(timestamps.indexOf(timestamp), 1);
        } else {
            if (timestamps.length === 0) {
                timestamps.push(timestamp);
            } else if (timestamps.length === 1) {
                if (timestamp > timestamps[0]) {
                    timestamps.push(timestamp);
                } else {
                    timestamps.splice(0, 0, timestamp);
                }
            } else {
                if (timestamp > timestamps[0]) {
                    timestamps.splice(1, 1, timestamp);
                } else {
                    timestamps.splice(0, 1, timestamp);
                }
            }
        }

        return timestamps.map((x) => new Date(x));
    }

    /**
     * Returns a date formatted depending on the timezone offset.
     *
     * @param {string | Date} newDate - new date
     * @returns array of dates
     */
    formattedWithTimezoneOffset(date) {
        return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    }

    /**
     * Date selection handler.
     *
     * @param {object} event
     */
    handlerSelectDate(event) {
        // Prevent selecting week numbers
        if (!event.currentTarget.dataset.day) return;

        let date = new Date(Number(event.target.dataset.day));
        const disabledDate = Array.from(event.target.classList).includes(
            'avonni-calendar__disabled-cell'
        );

        if (date && !disabledDate) {
            if (this._selectionMode === 'single') {
                this._value =
                    this._value.length > 0 &&
                    this._value[0].getTime() === date.getTime()
                        ? []
                        : [date];
            } else if (this._selectionMode === 'multiple') {
                this._value = this.isSelectedMultiple(this._value, date);
            } else if (this._selectionMode === 'interval') {
                this._value = this.isSelectedInterval(this._value, date);
            }
            this.date = date;

            this.updateDateParameters();
            this.dispatchChange();
        }
    }

    /**
     * Change event dispatcher.
     */
    dispatchChange() {
        /**
         * The event fired when the selected date is changed.
         *
         * @event
         * @public
         * @name change
         * @param {string|string[]} value Selected date(s), as an ISO8601 formatted string. Returns a string if the selection mode is single. Returns an array of dates otherwise.
         */
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value: this.normalizedValue
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

    /**
     * Mouse over handler.
     */
    handleMouseOver(event) {
        const day = event.target.getAttribute('data-day');
        const dayCell = this.template.querySelector(`[data-day="${day}"]`);
        const timeArray = this._value
            .map((x) => x.getTime())
            .sort((a, b) => a - b);
        if (this._selectionMode === 'interval' && !!day) {
            if (timeArray.length === 1) {
                if (day > timeArray[0]) {
                    dayCell.classList.add(
                        'avonni-calendar__cell_bordered-right'
                    );
                    this.template.querySelectorAll('td').forEach((x) => {
                        if (
                            x.getAttribute('data-cell-day') >= timeArray[0] &&
                            x.getAttribute('data-cell-day') <= day
                        ) {
                            x.classList.add(
                                'avonni-calendar__cell_bordered-top_bottom'
                            );
                        }
                    });
                }
                if (day < timeArray[0]) {
                    dayCell.classList.add(
                        'avonni-calendar__cell_bordered-left'
                    );
                    this.template.querySelectorAll('td').forEach((x) => {
                        if (
                            x.getAttribute('data-cell-day') <= timeArray[0] &&
                            x.getAttribute('data-cell-day') >= day
                        ) {
                            x.classList.add(
                                'avonni-calendar__cell_bordered-top_bottom'
                            );
                        }
                    });
                }
            } else if (timeArray.length === 2) {
                if (day > timeArray[1]) {
                    dayCell.classList.add(
                        'avonni-calendar__cell_bordered-right'
                    );
                    this.template.querySelectorAll('td').forEach((x) => {
                        if (
                            x.getAttribute('data-cell-day') >= timeArray[1] &&
                            x.getAttribute('data-cell-day') <= day
                        ) {
                            x.classList.add(
                                'avonni-calendar__cell_bordered-top_bottom'
                            );
                        }
                    });
                }
                if (day < timeArray[0]) {
                    dayCell.classList.add(
                        'avonni-calendar__cell_bordered-left'
                    );
                    this.template.querySelectorAll('td').forEach((x) => {
                        if (
                            x.getAttribute('data-cell-day') <= timeArray[0] &&
                            x.getAttribute('data-cell-day') >= day
                        ) {
                            x.classList.add(
                                'avonni-calendar__cell_bordered-top_bottom'
                            );
                        }
                    });
                }
            }
        }
    }

    /**
     * Mouse out handler.
     */
    handleMouseOut() {
        this.template.querySelectorAll('td').forEach((x) => {
            x.classList.remove('avonni-calendar__cell_bordered-top_bottom');
            x.classList.remove('avonni-calendar__cell_bordered-right');
            x.classList.remove('avonni-calendar__cell_bordered-left');
        });
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
