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
    normalizeArray,
    keyCodes,
    deepCopy
} from 'c/utilsPrivate';
import { generateUUID, classSet } from 'c/utils';
import CalendarDate from './avonniDate';

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

/**
 * @class
 * @name Calendar
 * @descriptor avonni-calendar
 * @storyId example-calendar--base
 * @public
 */
export default class AvonniCalendar extends LightningElement {
    _dateLabels = [];
    _disabled = false;
    _disabledDates = [];
    _hideNavigation = false;
    _markedDates = [];
    _max = DEFAULT_MAX;
    _min = DEFAULT_MIN;
    _selectionMode = SELECTION_MODES.default;
    _value = [];
    _weekNumber = false;

    _focusDate;
    _connected = false;
    displayDate = DEFAULT_DATE; // The calendar displays this date's month
    year;
    month;
    months = MONTHS;
    day;
    calendarData;

    connectedCallback() {
        let setDate = new Date(DEFAULT_DATE);
        if (this._value[0]) {
            setDate = new Date(this._value[0]);
        }
        if (setDate < this.min) {
            setDate = new Date(this.min);
        }
        if (setDate > this.max) {
            setDate = new Date(this.max);
        }

        this.displayDate = new Date(setDate);
        this._connected = true;
        this.validateCurrentDayValue();
        this.updateDateParameters();
        this.computeFocus(false);
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Array of date label objects. If a date has several labels, the first one in the array will be used.
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
     * Specifies if the calendar header should be hidden.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get hideNavigation() {
        return this._hideNavigation;
    }
    set hideNavigation(value) {
        this._hideNavigation = normalizeBoolean(value);
    }

    /**
     * Array of marked date objects. A maximum of three markers can be displayed on a same date.
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
        const date = new Date(max);
        const normalizedMax = this.isInvalidDate(date) ? DEFAULT_MAX : date;
        this._max = this.formattedWithTimezoneOffset(normalizedMax);
        this._max.setHours(0, 0, 0, 0);
        if (this._connected) {
            this.validateCurrentDayValue();
        }
        if (this.displayDate > this.max) {
            this.displayDate = new Date(this.max);
            this.updateDateParameters();
        }
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
        const date = new Date(min);
        const normalizedMin = this.isInvalidDate(date) ? DEFAULT_MIN : date;
        this._min = this.formattedWithTimezoneOffset(normalizedMin);
        this._min.setHours(0, 0, 0, 0);
        if (this._connected) {
            this.validateCurrentDayValue();
        }
        if (this.displayDate < this.min) {
            this.displayDate = new Date(this.min);
            this.updateDateParameters();
        }
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
        const dates = Array.isArray(value) ? value : [value];
        this._value = dates.map((date) => {
            const normalizedDate = this.formattedWithTimezoneOffset(
                new Date(date)
            );
            normalizedDate.setHours(0, 0, 0, 0);
            return normalizedDate;
        });
        this._value.sort((a, b) => a - b);

        if (this._connected) {
            this.validateCurrentDayValue();
        }
        this.updateDate();
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
    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Check if all values are outside the min-max interval.
     *
     * @return {boolean}
     */
    get allValuesOutsideMinAndMax() {
        return this._value.every(
            (value) => this.isBeforeMin(value) || this.isAfterMax(value)
        );
    }

    /**
     * Compute days from week.
     */
    get days() {
        const days = [];
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
        let disabled = deepCopy(this.disabled);
        let previousDate = new Date(this.displayDate);
        previousDate.setMonth(this.displayDate.getMonth() - 1);
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
        let nextDate = new Date(this.displayDate);
        nextDate.setMonth(this.displayDate.getMonth() + 1);
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
     * Check if current date is between the min-max interval.
     */
    get isCurrentDateBetweenMinAndMax() {
        return (
            this.min.getTime() <= new Date().getTime() &&
            new Date().getTime() <= this.max.getTime()
        );
    }

    get isMultiSelect() {
        return (
            this.selectionMode === 'interval' ||
            this.selectionMode === 'multiple'
        );
    }

    get normalizedValue() {
        if (!this.value.length) {
            return this.selectionMode === 'single' ? null : [];
        }

        const stringDates = this.value.map((date) => {
            return date.toISOString();
        });
        return this.selectionMode === 'single' ? stringDates[0] : stringDates;
    }

    /**
     *
     * @type {string}
     */
    get tableClasses() {
        const isLabeled = this._dateLabels.length > 0;
        return classSet('slds-datepicker__month')
            .add({ 'avonni-calendar__date-with-labels': isLabeled })
            .toString();
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Set the focus on a given date.
     *
     * @param {Date} date A value to be focused, which can be a Date object, timestamp, or an ISO8601 formatted string.
     * @public
     */
    @api
    focusDate(dateValue) {
        const value = new Date(dateValue);
        if (value && !value.getTime()) {
            return;
        }

        this.displayDate = new Date(value);
        this._focusDate = new Date(value);
        this.computeFocus(true);
    }

    /**
     * Set the focus on the first focusable element of the calendar.
     *
     * @public
     */
    @api
    focus() {
        const button = this.template.querySelector(
            '[data-element-id="previous-lightning-button-icon"]'
        );
        if (button) {
            button.focus();
        }
    }

    /**
     * Move the position of the calendar so the specified date is visible.
     *
     * @param {string | number | Date} date Date the calendar should be positioned on.
     * @public
     */
    @api
    goToDate(date) {
        const selectedDate = this.formattedWithTimezoneOffset(new Date(date));
        if (this.isInvalidDate(selectedDate)) {
            console.warn(`The date ${date} is not valid.`);
            return;
        }
        this.displayDate = selectedDate;
        this.updateDateParameters();
    }

    /**
     * Simulates a click on the next month button
     *
     * @public
     */
    @api
    nextMonth() {
        this.handlerNextMonth();
    }

    /**
     * Simulates a click on the previous month button
     *
     * @public
     */
    @api
    previousMonth() {
        this.handlerPreviousMonth();
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */
    /**
     * Returns the first day of the current month.
     */
    getFirstDayOfMonth(date) {
        const dateValue = new Date(date);
        dateValue.setDate(1);
        return dateValue.toISOString();
    }

    /**
     * Check if value is after max date.
     */
    isAfterMax(value) {
        return value.getTime() > this.max.getTime();
    }

    /**
     * Check if value is before min date.
     */
    isBeforeMin(value) {
        return value.getTime() < this.min.getTime();
    }

    /**
     * Check if value is an invalid date.
     */
    isInvalidDate(value) {
        return value.toString() === 'Invalid Date';
    }

    /**
     * Create Dates array.
     *
     * @param {object[]} array
     * @returns dates
     */
    fullDatesFromArray(array) {
        const dates = [];

        array.forEach((date) => {
            if (typeof date === 'object') {
                const newDate = this.formattedWithTimezoneOffset(
                    new Date(date)
                );
                dates.push(newDate.setHours(0, 0, 0, 0));
            }
        });

        return dates;
    }

    getLabel(date) {
        const weekday = DAYS[date.getDay()];
        return this.dateLabels.find((label) => {
            const labelAsNumber = Number(label.date);
            let labelAsTime;
            if (!this.isInvalidDate(label.date)) {
                const labelAsDate = this.formattedWithTimezoneOffset(
                    new Date(label.date)
                );
                labelAsDate.setHours(0, 0, 0, 0);
                labelAsTime = labelAsDate.getTime();
            }

            return (
                labelAsTime === date.getTime() ||
                labelAsNumber === date.getDate() ||
                weekday === label.date
            );
        });
    }

    /**
     * Check if both dates have the same month.
     *
     * @param {Date} dateA A value to be focused, which can be a Date object, timestamp, or an ISO8601 formatted string.
     * @param {Date} dateB A value to be focused, which can be a Date object, timestamp, or an ISO8601 formatted string.
     * @returns {boolean}
     */
    haveSameMonth(dateA, dateB) {
        return new Date(dateA).getMonth() === new Date(dateB).getMonth();
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
     * Update value, date and refresh calendar.
     */
    updateDate() {
        this._value = this._value.filter((date) => {
            return date.getTime() !== NULL_DATE;
        });
        if (this._value[0]) {
            this.displayDate = new Date(this._value[0]);
        }
        this.updateDateParameters();
    }

    /**
     * Update date : year, month, day.
     */
    updateDateParameters() {
        this.year = this.displayDate.getFullYear();
        this.month = MONTHS[this.displayDate.getMonth()];
        this.day = this.displayDate.getDay();
        this.generateViewData();
    }

    /**
     * Compute view data for Calendar.
     */
    generateViewData() {
        const calendarData = [];
        const today = new Date().setHours(0, 0, 0, 0);
        const currentMonth = this.displayDate.getMonth();
        const date = new Date(this.displayDate);
        date.setDate(1);

        if (date.getDay() > 0) {
            date.setDate(-date.getDay() + 1);
        }

        const mode = this.selectionMode;
        const firstValue = this.value[0];
        const lastValue = this.value[this.value.length - 1];
        const isInterval = mode === 'interval' && this.value.length >= 2;

        // Add an array per week
        for (let i = 0; i < 6; i++) {
            let weekData = [];

            if (this.weekNumber) {
                // Week number
                weekData.push(
                    new CalendarDate({
                        date: date.getTime(),
                        isWeekNumber: true
                    })
                );
            }

            // Add 7 days to each week array
            for (let a = 0; a < 7; a++) {
                const time = date.getTime();
                const disabledDate = this.isInArray(date, this.disabledDates);
                const outsideOfMinMax = time < this.min || time > this.max;
                const markers = this.getMarkers(date);
                const label = this.getLabel(date);
                const isPartOfInterval =
                    isInterval && firstValue <= time && lastValue >= time;

                let selected;
                if (this.isMultiSelect) {
                    selected = this.value.find((value) => {
                        return value.getTime() === time;
                    });
                } else if (firstValue) {
                    selected = time === firstValue.getTime();
                }

                weekData.push(
                    new CalendarDate({
                        adjacentMonth: date.getMonth() !== currentMonth,
                        date: time,
                        disabled:
                            this.disabled || disabledDate || outsideOfMinMax,
                        isPartOfInterval,
                        isToday: today === time,
                        chip: label,
                        markers,
                        selected
                    })
                );
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
        let time = new Date(date).setHours(0, 0, 0, 0);
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
    getMarkers(date) {
        const markers = [];
        const time = new Date(date).setHours(0, 0, 0, 0);
        const weekDay = date.getDay();
        const monthDay = date.getDate();

        this.markedDates.forEach((marker) => {
            const dateArray = [marker.date];
            if (
                this.fullDatesFromArray(dateArray).indexOf(time) > -1 ||
                this.weekDaysFromArray(dateArray).indexOf(weekDay) > -1 ||
                this.monthDaysFromArray(dateArray).indexOf(monthDay) > -1
            ) {
                markers.push(`background-color: ${marker.color}`);
            }
        });
        // A maximum of 3 markers are displayed per date
        return markers.slice(0, 3);
    }

    /**
     * Remove all values outside of min-max interval. If the array of values is empty, set the display date to current day or min.
     */
    removeValuesOutsideRange() {
        // Remove all out of range values
        this._value = this._value.filter((date) => {
            return (
                !this.isInvalidDate(date) &&
                !this.isAfterMax(date) &&
                !this.isBeforeMin(date)
            );
        });
    }

    /**
     * Set interval when only one value is valid (in min-max range) and the other one is outside range.
     */
    setIntervalWithOneValidValue(minValue, maxValue) {
        if (
            this.isBeforeMin(minValue) &&
            minValue.getTime() < this._value[0].getTime()
        ) {
            this._value[1] = this._value[0];
            this._value[0] = this.min;
        } else if (
            this.isAfterMax(maxValue) &&
            maxValue.getTime() > this._value[0].getTime()
        ) {
            this._value[1] = this.max;
        }
    }

    /**
     * Returns current date if it is between the min-max interval. If not, returns the min.
     * @return {Date}
     */
    setValueToCurrentDayOrMin() {
        if (this.isCurrentDateBetweenMinAndMax) {
            return new Date();
        }
        return new Date(this.min);
    }

    /**
     * If invalid current day, center calendar's current day to closest date in min-max interval
     */
    validateCurrentDayValue() {
        if (!this._value[0]) {
            return;
        }

        switch (this._selectionMode) {
            case 'interval':
                this.validateValueIntervalMode();
                break;
            case 'single':
                this.validateValueSingleMode();
                break;
            case 'multiple':
                this.validateValueMultipleMode();
                break;
            default:
        }
    }

    /**
     * Validate values for interval selection mode.
     */
    validateValueIntervalMode() {
        const minValue = this._value[0];
        const maxValue = this._value[this._value.length - 1];

        if (this.allValuesOutsideMinAndMax) {
            if (this.isBeforeMin(minValue) && this.isAfterMax(maxValue)) {
                this._value[0] = this.min;
                this._value[1] = this.max;
            } else {
                this._value = [];
                this.displayDate = this.setValueToCurrentDayOrMin();
            }
            this.updateDate();
        } else {
            this.removeValuesOutsideRange();
            if (this._value.length) {
                // Check if previous min-max values saved were outside of range to create interval
                if (this._value.length === 1) {
                    this.setIntervalWithOneValidValue(minValue, maxValue);
                }
                this.updateDate();
            }
        }
    }

    /**
     * Validate value for multiple selection mode.
     */
    validateValueMultipleMode() {
        this.removeValuesOutsideRange();
        // Find valid date to re-center calendar
        if (this.value.length && !this.allValuesOutsideMinAndMax) {
            this.displayDate = this.value.find((date) => {
                return (
                    !this.isInvalidDate(date) &&
                    !this.isAfterMax(date) &&
                    !this.isBeforeMin(date)
                );
            });
            this.updateDate();
        }
    }

    /**
     * Validate value for single selection mode.
     */
    validateValueSingleMode() {
        // If multiple values are selected, we remove those outside range
        if (this._value && this._value.length > 1) {
            this.removeValuesOutsideRange();
        }
        // If one single value, we check if it's in interval and set to closest value if not
        else {
            if (this.isInvalidDate(this._value[0])) {
                this._value = [];
                this.displayDate = this.setValueToCurrentDayOrMin();
            } else if (this.isAfterMax(this._value[0])) {
                this._value = [];
                this.displayDate = new Date(this.max);
            } else if (this.isBeforeMin(this._value[0])) {
                this._value = [];
                this.displayDate = new Date(this.min);
            }
            this.updateDateParameters();
        }
    }

    /**
     * Year change handler.
     *
     * @param {object} event
     */
    handleYearChange(event) {
        this.displayDate.setFullYear(event.detail.value);

        if (this.displayDate.getTime() < this.min.getTime()) {
            this.displayDate.setMonth(this.min.getMonth());
        }

        if (this.displayDate.getTime() > this.max.getTime()) {
            this.displayDate.setMonth(this.max.getMonth());
        }

        this.dispatchNavigateEvent(new Date(this.displayDate).toISOString());
        this.updateDateParameters();
        event.stopPropagation();
        this.computeFocus(true);
    }

    /**
     * Previous month handler.
     */
    handlerPreviousMonth() {
        this.displayDate.setMonth(this.displayDate.getMonth() - 1);
        this.updateDateParameters();
        this.computeFocus(false);
        this.dispatchNavigateEvent(this.displayDate);
    }

    /**
     * Next month handler.
     */
    handlerNextMonth() {
        this.displayDate.setMonth(this.displayDate.getMonth() + 1);
        this.updateDateParameters();
        this.computeFocus(false);
        this.dispatchNavigateEvent(this.displayDate);
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
    handleSelectDate(event) {
        this.handleDateFocus(event);
        if (!event.currentTarget.dataset.fullDate) {
            return;
        }

        this._selectionMethod = event.pointerType === '' ? 'keyboard' : 'mouse';
        let date = new Date(Number(event.target.dataset.fullDate));
        const disabledDate = event.target.classList.contains(
            'avonni-calendar__disabled-cell'
        );

        if (date && !disabledDate) {
            if (this._selectionMode === 'single') {
                this._value =
                    this._value.length > 0 &&
                    this._value[0].getTime() === date.getTime()
                        ? []
                        : [new Date(date)];
            } else if (this._selectionMode === 'multiple') {
                this._value = this.isSelectedMultiple(this._value, date);
            } else if (this._selectionMode === 'interval') {
                this._value = this.isSelectedInterval(this._value, date);
            }
            this._clickedDate = date.toISOString();
            this.displayDate = new Date(date);

            this.updateDateParameters();
            this.dispatchChange();
            this.computeFocus(true);
        }
    }

    // EVENT HANDLERS //

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
         * @param {string} clickedDate Clicked date, as an ISO8601 formatted string.
         */
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value: this.normalizedValue,
                    clickedDate: this._clickedDate
                }
            })
        );
    }

    /**
     * The event fired when the month is changed.
     *
     * @event
     * @public
     * @name navigate
     * @param {string} date First day of the new visible month, as an ISO8601 formatted string.
     */
    dispatchNavigateEvent(date) {
        const firstDayOfMonth = this.getFirstDayOfMonth(date);
        this.dispatchEvent(
            new CustomEvent('navigate', {
                detail: {
                    date: firstDayOfMonth
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
     * Record focus if a cell is clicked.
     */
    handleDateFocus(event) {
        if (!event.currentTarget) {
            return;
        }

        let focusDate = new Date(Number(event.currentTarget.dataset.fullDate));
        if (focusDate) {
            this._focusDate = focusDate;
        }
    }

    // HOVERED DATES AND RANGES APPEARANCE

    /**
     * Mouse over handler.
     */
    handleMouseOver(event) {
        const day = event.target.getAttribute('data-full-date');
        const dayCell = this.template.querySelector(
            `[data-full-date="${day}"]`
        );
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
                            x.getAttribute('data-full-date') >= timeArray[0] &&
                            x.getAttribute('data-full-date') <= day
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
                            x.getAttribute('data-full-date') <= timeArray[0] &&
                            x.getAttribute('data-full-date') >= day
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
                            x.getAttribute('data-full-date') >= timeArray[1] &&
                            x.getAttribute('data-full-date') <= day
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
                            x.getAttribute('data-full-date') <= timeArray[0] &&
                            x.getAttribute('data-full-date') >= day
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

    // KEYBOARD NAVIGATION

    /**
     * Keyboard navigation handler.
     *
     * @param {Event} event
     */
    handleKeyDown(event) {
        const initialFocusDate = new Date(
            parseInt(event.target.dataset.fullDate, 10)
        );
        const initialFocusDateCopy = new Date(initialFocusDate);
        let nextDate;

        if (event.altKey) {
            if (event.keyCode === keyCodes.pageup) {
                event.preventDefault();
                nextDate = new Date(
                    initialFocusDate.setFullYear(
                        initialFocusDate.getFullYear() - 1
                    )
                );
                this.dispatchNavigateEvent(new Date(nextDate).toISOString());
            }
            if (event.keyCode === keyCodes.pagedown) {
                event.preventDefault();
                nextDate = initialFocusDate.setFullYear(
                    initialFocusDate.getFullYear() + 1
                );
                this.dispatchNavigateEvent(new Date(nextDate).toISOString());
            }
        } else {
            switch (event.keyCode) {
                case keyCodes.left:
                    event.preventDefault();
                    nextDate = initialFocusDate.setDate(
                        initialFocusDate.getDate() - 1
                    );
                    if (!this.haveSameMonth(initialFocusDateCopy, nextDate))
                        this.dispatchNavigateEvent(
                            new Date(nextDate).toISOString()
                        );
                    break;
                case keyCodes.right:
                    event.preventDefault();
                    nextDate = initialFocusDate.setDate(
                        initialFocusDate.getDate() + 1
                    );
                    if (!this.haveSameMonth(initialFocusDateCopy, nextDate))
                        this.dispatchNavigateEvent(
                            new Date(nextDate).toISOString()
                        );
                    break;
                case keyCodes.up:
                    event.preventDefault();
                    nextDate = initialFocusDate.setDate(
                        initialFocusDate.getDate() - 7
                    );
                    if (!this.haveSameMonth(initialFocusDateCopy, nextDate))
                        this.dispatchNavigateEvent(
                            new Date(nextDate).toISOString()
                        );
                    break;
                case keyCodes.down:
                    event.preventDefault();
                    nextDate = initialFocusDate.setDate(
                        initialFocusDate.getDate() + 7
                    );
                    if (!this.haveSameMonth(initialFocusDateCopy, nextDate))
                        this.dispatchNavigateEvent(
                            new Date(nextDate).toISOString()
                        );
                    break;
                case keyCodes.home:
                    event.preventDefault();
                    nextDate = initialFocusDate.setDate(
                        initialFocusDate.getDate() - initialFocusDate.getDay()
                    );
                    if (!this.haveSameMonth(initialFocusDateCopy, nextDate))
                        this.dispatchNavigateEvent(
                            new Date(nextDate).toISOString()
                        );
                    break;
                case keyCodes.end:
                    event.preventDefault();
                    nextDate = initialFocusDate.setDate(
                        initialFocusDate.getDate() +
                            (6 - initialFocusDate.getDay())
                    );
                    if (!this.haveSameMonth(initialFocusDateCopy, nextDate))
                        this.dispatchNavigateEvent(
                            new Date(nextDate).toISOString()
                        );
                    break;
                case keyCodes.pagedown:
                    event.preventDefault();
                    nextDate = initialFocusDate.setMonth(
                        initialFocusDate.getMonth() - 1
                    );
                    this.dispatchNavigateEvent(
                        new Date(nextDate).toISOString()
                    );
                    break;
                case keyCodes.pageup:
                    event.preventDefault();
                    nextDate = initialFocusDate.setMonth(
                        initialFocusDate.getMonth() + 1
                    );
                    this.dispatchNavigateEvent(
                        new Date(nextDate).toISOString()
                    );
                    break;
                case keyCodes.space:
                case keyCodes.enter:
                    event.preventDefault();
                    {
                        const selectedDay = event.target.querySelector(
                            '[data-element-id="span-day-label"]'
                        );
                        if (selectedDay) {
                            selectedDay.click();
                        }
                    }
                    break;
                default:
            }
        }

        if (!nextDate) {
            return;
        }

        if (nextDate < this.min) {
            this._focusDate = this.min;
        } else if (nextDate > this.max) {
            this._focusDate = this.max;
        } else {
            this._focusDate = new Date(nextDate);
        }
        this.displayDate = this._focusDate;
        this.updateDateParameters();
        this.computeFocus(true);
    }

    /**
     * Place focus according to keyboard selection
     *
     * @param {boolean} applyFocus Focus point is always computed, but is only focused if applyFocus is true.
     */
    computeFocus(applyFocus) {
        // if a date was previously selected or focused, focus the same date in this month.
        let selectedMonthDate;
        if (this._focusDate) {
            selectedMonthDate = new Date(this.displayDate);
            selectedMonthDate.setDate(this._focusDate.getDate());
            selectedMonthDate = selectedMonthDate.getTime();
        }
        const monthFirst = new Date(this.displayDate);
        monthFirst.setDate(1);
        monthFirst.setHours(0, 0, 0, 0);
        const firstOfMonthDate = monthFirst.getTime();
        const rovingDate = this._focusDate && this._focusDate.getDate();

        requestAnimationFrame(() => {
            const rovingFocusDate = this.template.querySelector(
                `td[data-date="${rovingDate}"]`
            );
            let selectedDate = this.template.querySelectorAll(
                'td.slds-is-selected'
            );
            selectedDate = selectedDate.length === 0 ? null : selectedDate;
            const todaysDate = this.template.querySelector(
                `td[data-full-date="${new Date().setHours(0, 0, 0, 0)}"]`
            );
            const firstOfMonth = this.template.querySelector(
                `span[data-full-date="${firstOfMonthDate}"].slds-day:not(.avonni-calendar__disabled-cell)`
            );
            let firstOfMonthCell;
            if (firstOfMonth) {
                firstOfMonthCell = firstOfMonth.parentElement;
            }
            const rovingMonthDate = this.template.querySelector(
                `td[data-full-date="${selectedMonthDate}"]`
            );
            const firstValidDate = this.template.querySelector(
                'span.slds-day:not(.avonni-calendar__disabled-cell)'
            );
            let firstValidDateCell;
            if (firstValidDate) {
                firstValidDateCell = firstValidDate.parentElement;
            }

            const focusTarget =
                rovingFocusDate ||
                selectedDate ||
                rovingMonthDate ||
                todaysDate ||
                firstOfMonthCell ||
                firstValidDateCell;

            const existingFocusPoints =
                this.template.querySelectorAll('td[tabindex="0"]');
            if (existingFocusPoints) {
                existingFocusPoints.forEach((focusPoint) => {
                    focusPoint.setAttribute('tabindex', '-1');
                });
            }

            if (selectedDate) {
                if (this.selectionMode === 'single') {
                    selectedDate[0].setAttribute('tabindex', '0');
                } else if (this.selectionMode === 'multiple') {
                    selectedDate.forEach((target) => {
                        target.setAttribute('tabindex', '0');
                    });
                } else if (this.selectionMode === 'interval') {
                    selectedDate[0].setAttribute('tabindex', '0');
                    selectedDate[selectedDate.length - 1].setAttribute(
                        'tabindex',
                        '0'
                    );
                }
            }

            if (focusTarget) {
                if (focusTarget.length > 0) {
                    focusTarget[0].setAttribute('tabindex', '0');
                    if (applyFocus) focusTarget[0].focus();
                } else {
                    focusTarget.setAttribute('tabindex', '0');
                    if (applyFocus) {
                        focusTarget.focus();
                    }
                }
            }
        });
    }
}
