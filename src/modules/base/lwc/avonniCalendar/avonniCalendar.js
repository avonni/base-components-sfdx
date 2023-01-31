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
    dateTimeObjectFrom,
    equal,
    getStartOfWeek,
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
    _timezone;
    _value;
    _weekNumber = false;

    _focusDate;
    _computedDateLabels = [];
    _computedDisabledDates = [];
    _computedMarkedDates = [];
    _computedMax;
    _computedMin;
    _computedValue = [];
    _connected = false;
    displayDate; // The calendar displays this date's month
    year;
    month;
    months = MONTHS;
    day;
    calendarData;

    connectedCallback() {
        this.initDates();
        this.initDisplayDate();
        this.validateCurrentDayValue();
        this.updateDateParameters();
        this.computeFocus(false);
        this._connected = true;
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
        this._dateLabels = deepCopy(normalizeArray(value, 'object'));

        if (this._connected) {
            this.initDateLabels();
            this.generateViewData();
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

        if (this._connected) {
            this.generateViewData();
        }
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
        this._disabledDates =
            value && !Array.isArray(value) ? [value] : normalizeArray(value);

        if (this._connected) {
            this.initDisabledDates();
            this.generateViewData();
        }
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
        this._markedDates = normalizeArray(value, 'object');

        if (this._connected) {
            this.initMarkedDates();
            this.generateViewData();
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
        this._max = this.isInvalidDate(value) ? DEFAULT_MAX : value;

        if (this._connected) {
            this._computedMax = this.getDateWithTimezone(this.max);
            this.validateCurrentDayValue();

            if (this.displayDate > this._computedMax) {
                this.displayDate = this.getDateWithTimezone(this._computedMax);
            }
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

    set min(value) {
        this._min = this.isInvalidDate(value) ? DEFAULT_MIN : value;

        if (this._connected) {
            this._computedMin = this.getDateWithTimezone(this.min);
            this.validateCurrentDayValue();

            if (this.displayDate < this._computedMin) {
                this.displayDate = this.getDateWithTimezone(this._computedMin);
            }
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
        if (this._connected) {
            this.validateCurrentDayValue();
            this.updateDateParameters();
        }
    }

    /**
     * Time zone used, in a valid IANA format. If empty, the browser's time zone is used.
     *
     * @type {string}
     * @public
     */
    @api
    get timezone() {
        return this._timezone;
    }
    set timezone(value) {
        this._timezone = value;

        if (this._connected) {
            this.initDates();
            this.updateDateParameters();
        }
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
        if (equal(value, this._value)) {
            return;
        }
        this._value = value;

        if (this._connected) {
            this.initValue();
            if (this._computedValue[0]) {
                this.displayDate = this.getDateWithTimezone(
                    this._computedValue[0]
                );
            }
            this.validateCurrentDayValue();
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

        if (this._connected) {
            this.generateViewData();
        }
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
        return this._computedValue.every(
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
     * Disable interaction on next date layout.
     */
    get disabledNext() {
        let disabled = this.disabled;
        const month = this.displayDate.month + 1;
        const nextDate = this.displayDate.set({ month, day: 1 });
        const maxDate = this._computedMax.set({ day: 1 });

        if (nextDate > maxDate) {
            disabled = true;
        }

        return disabled;
    }

    /**
     * Disable interaction on previous date layout.
     */
    get disabledPrevious() {
        let disabled = this.disabled;
        const month = this.displayDate.month - 1;
        const previousDate = this.displayDate.set({ month, day: 1 });
        const minDate = this._computedMin.set({ day: 1 });

        if (previousDate < minDate) {
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
            this._computedMin.ts <= new Date().getTime() &&
            new Date().getTime() <= this._computedMax.ts
        );
    }

    get isMultiSelect() {
        return (
            this.selectionMode === 'interval' ||
            this.selectionMode === 'multiple'
        );
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

    /**
     * Compute year list spread from min and max.
     */
    get yearsList() {
        let startYear = this._computedMin.year;
        let endYear = this._computedMax.year;

        return [...Array(endYear - startYear + 1).keys()].map((x) => {
            let year = x + startYear;
            return { label: year, value: year };
        });
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

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
     * Set the focus on a given date.
     *
     * @param {Date} date A value to be focused, which can be a Date object, timestamp, or an ISO8601 formatted string.
     * @public
     */
    @api
    focusDate(dateValue) {
        if (this.isInvalidDate(dateValue)) {
            return;
        }

        this.displayDate = this.getDateWithTimezone(dateValue);
        this._focusDate = this.getDateWithTimezone(dateValue);
        this.computeFocus(true);
    }

    /**
     * Move the position of the calendar so the specified date is visible.
     *
     * @param {string | number | Date} date Date the calendar should be positioned on.
     * @public
     */
    @api
    goToDate(date) {
        const selectedDate = this.getDateWithTimezone(date);
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
     * Initialize the date labels to include the timezone.
     */
    initDateLabels() {
        this._computedDateLabels = this.dateLabels.map((label) => {
            return {
                ...label,
                date: this.getDateWithTimezone(label.date)
            };
        });
    }

    /**
     * Initialize all the properties depending on dates, to include the timezone and set them to the beginning of the day.
     */
    initDates() {
        this._computedMax = this.getDateWithTimezone(this.max).startOf('day');
        this._computedMin = this.getDateWithTimezone(this.min).startOf('day');
        this.initDateLabels();
        this.initDisabledDates();
        this.initMarkedDates();
        this.initValue();

        if (this.displayDate) {
            this.displayDate = this.getDateWithTimezone(
                this.displayDate
            ).startOf('day');
        }
    }

    /**
     * Initialize the disabled dates to include the timezone and set them to the beginning of the day.
     */
    initDisabledDates() {
        this._computedDisabledDates = this.disabledDates.map((date) => {
            if (this.isInvalidDate(date)) {
                return date;
            }
            const fullDate = this.getDateWithTimezone(date);
            return fullDate.startOf('day');
        });
    }

    /**
     * Initialize the displayed date to center the calendar on the appropriate month.
     */
    initDisplayDate() {
        let setDate = this.getDateWithTimezone(DEFAULT_DATE);
        if (this._computedValue[0]) {
            setDate = this._computedValue[0];
        } else if (setDate < this._computedMin) {
            setDate = this._computedMin;
        } else if (setDate > this._computedMax) {
            setDate = this._computedMax;
        }
        this.displayDate = this.getDateWithTimezone(setDate);
    }

    /**
     * Initialize the marked dates to include the timezone and set them to the beginning of the day.
     */
    initMarkedDates() {
        this._computedMarkedDates = this.markedDates.map((marker) => {
            return {
                color: marker.color,
                date: this.isInvalidDate(marker.date)
                    ? marker.date
                    : this.getDateWithTimezone(marker.date).startOf('day')
            };
        });
    }

    /**
     * Initialize the value to include the timezone, sort them and set them to the beginning of the day.
     */
    initValue() {
        const normalizedValue =
            this.value && !Array.isArray(this.value)
                ? [this.value]
                : normalizeArray(this.value);
        const computedValues = [];
        normalizedValue.forEach((date) => {
            if (!this.isInvalidDate(date)) {
                const normalizedDate =
                    this.getDateWithTimezone(date).startOf('day');
                computedValues.push(normalizedDate);
            }
        });
        computedValues.sort((a, b) => a.ts - b.ts);
        this._computedValue = computedValues;
    }

    /**
     * Place focus according to keyboard selection
     *
     * @param {boolean} applyFocus Focus point is always computed, but is only focused if applyFocus is true.
     */
    computeFocus(applyFocus) {
        // if a date was previously selected or focused, focus the same date in this month.
        let selectedMonthDate, rovingDate;
        if (this._focusDate) {
            rovingDate = this._focusDate.day;
            selectedMonthDate = this.displayDate.set({
                day: this._focusDate.day
            }).ts;
        }
        const firstOfMonthDate = this.displayDate
            .set({ day: 1 })
            .startOf('day').ts;

        requestAnimationFrame(() => {
            const rovingFocusDate = this.template.querySelector(
                `[data-element-id="td"][data-date="${rovingDate}"]`
            );
            const selectedDates = this.template.querySelectorAll(
                '[data-selected="true"]'
            );
            const todaysDate = this.template.querySelector(
                '[data-today="true"]'
            );
            const firstOfMonth = this.template.querySelector(
                `[data-element-id="td"][data-full-date="${firstOfMonthDate}"]:not([data-disabled="true"])`
            );
            const rovingMonthDate = this.template.querySelector(
                `[data-element-id="td"][data-full-date="${selectedMonthDate}"]`
            );
            const firstValidDate = this.template.querySelector(
                '[data-element-id="td"]:not([data-disabled="true"])'
            );

            const focusTarget =
                rovingFocusDate ||
                selectedDates[0] ||
                rovingMonthDate ||
                todaysDate ||
                firstOfMonth ||
                firstValidDate;

            const existingFocusPoints = this.template.querySelectorAll(
                '[data-element-id="td"][tabindex="0"]'
            );
            existingFocusPoints.forEach((focusPoint) => {
                focusPoint.setAttribute('tabindex', '-1');
            });

            if (selectedDates.length) {
                if (this.selectionMode === 'single') {
                    selectedDates[0].setAttribute('tabindex', '0');
                } else if (this.selectionMode === 'multiple') {
                    selectedDates.forEach((target) => {
                        target.setAttribute('tabindex', '0');
                    });
                } else if (this.selectionMode === 'interval') {
                    selectedDates[0].setAttribute('tabindex', '0');
                    selectedDates[selectedDates.length - 1].setAttribute(
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

    /**
     * Filter the valid dates from the given array.
     *
     * @param {object[]} array Array to filter.
     * @returns Array of DateTime objects, set to the beginning of the day.
     */
    fullDatesFromArray(array) {
        const dates = [];

        array.forEach((date) => {
            if (typeof date === 'object') {
                const newDate = this.getDateWithTimezone(date);
                dates.push(newDate.startOf('day').ts);
            }
        });

        return dates;
    }

    /**
     * Generate the calendar data.
     */
    generateViewData() {
        const calendarData = [];
        const today = this.getDateWithTimezone(new Date()).startOf('day');
        const currentMonth = this.displayDate.month;
        let date = getStartOfWeek(this.displayDate.set({ day: 1 }));

        const mode = this.selectionMode;
        const firstValue = this._computedValue[0];
        const lastValue = this._computedValue[this._computedValue.length - 1];
        const isInterval =
            mode === 'interval' && this._computedValue.length >= 2;

        // Add an array per week
        for (let i = 0; i < 6; i++) {
            let weekData = [];

            if (this.weekNumber) {
                // Week number
                weekData.push(
                    new CalendarDate({
                        date: date.ts,
                        isWeekNumber: true
                    })
                );
            }

            // Add 7 days to each week array
            for (let a = 0; a < 7; a++) {
                const time = date.ts;
                const disabledDate = this.isDisabled(date);
                const outsideOfMinMax =
                    time < this._computedMin || time > this._computedMax;
                const markers = this.getMarkers(date);
                const label = this.getLabel(date);
                const isPartOfInterval =
                    isInterval && firstValue.ts <= time && lastValue.ts >= time;

                let selected;
                if (this.isMultiSelect) {
                    selected = this._computedValue.find((value) => {
                        return value.startOf('day').ts === time;
                    });
                } else if (firstValue) {
                    selected = time === firstValue.startOf('day').ts;
                }

                weekData.push(
                    new CalendarDate({
                        adjacentMonth: date.month !== currentMonth,
                        date: this.getDateWithTimezone(time),
                        disabled:
                            this.disabled || disabledDate || outsideOfMinMax,
                        isPartOfInterval,
                        isToday: today.ts === time,
                        chip: label,
                        markers,
                        selected
                    })
                );
                date = date.plus({ day: 1 });
            }
            calendarData.push(weekData);
        }

        this.calendarData = calendarData;
    }

    /**
     * Returns current date if it is between the min-max interval. If not, returns the min.
     *
     * @return {DateTime}
     */
    getCurrentDateOrMin() {
        if (this.isCurrentDateBetweenMinAndMax) {
            return this.getDateWithTimezone(new Date());
        }
        return this.getDateWithTimezone(this._computedMin);
    }

    /**
     * If possible, transform the given value into a DateTime including the timezone.
     *
     * @param {any} value Value to be transformed. If it is an invalid date, it will be returned as is.
     * @returns DateTime object, or value as is.
     */
    getDateWithTimezone(value) {
        const date = dateTimeObjectFrom(value, {
            zone: this.timezone,
            locale: 'en-US'
        });
        if (!date || date.startOf('day').ts === NULL_DATE) {
            return value;
        }
        return date;
    }

    /**
     * Get the label object for the given date.
     *
     * @param {DateTime} date Date to get the label for.
     * @returns {object} Label object.
     */
    getLabel(date) {
        const dayIndex = date.weekday === 7 ? 0 : date.weekday;
        const weekday = DAYS[dayIndex];
        return this._computedDateLabels.find((label) => {
            const labelAsNumber = Number(label.date);
            let labelAsTime;
            if (!this.isInvalidDate(label.date)) {
                const labelAsDate = this.getDateWithTimezone(label.date);
                labelAsTime = labelAsDate.startOf('day').ts;
            }

            return (
                labelAsTime === date.ts ||
                labelAsNumber === date.day ||
                weekday === label.date
            );
        });
    }

    /**
     * Get the markers for the given date.
     *
     * @param {DateTime} date Date to get the markers for.
     * @returns {string[]} Array of marker styles.
     */
    getMarkers(date) {
        const markers = [];
        const time = date.startOf('day').ts;
        const weekday = date.weekdayShort;
        const monthDay = date.day;

        this._computedMarkedDates.forEach((marker) => {
            const dateArray = [marker.date];
            if (
                this.fullDatesFromArray(dateArray).indexOf(time) > -1 ||
                this.weekDaysFromArray(dateArray).indexOf(weekday) > -1 ||
                this.monthDaysFromArray(dateArray).indexOf(monthDay) > -1
            ) {
                markers.push(`background-color: ${marker.color}`);
            }
        });
        // A maximum of 3 markers are displayed per date
        return markers.slice(0, 3);
    }

    /**
     * Check if the given date is disabled.
     *
     * @param {DateTime} date Date to check.
     * @returns {boolean} True if the date is disabled.
     */
    isDisabled(date) {
        const dates = this._computedDisabledDates;
        const time = date.startOf('day').ts;
        const weekday = date.weekdayShort;
        const monthDay = date.day;

        return (
            this.fullDatesFromArray(dates).indexOf(time) > -1 ||
            this.weekDaysFromArray(dates).indexOf(weekday) > -1 ||
            this.monthDaysFromArray(dates).indexOf(monthDay) > -1
        );
    }

    /**
     * Check if value is after max date.
     */
    isAfterMax(value) {
        return value.ts > this._computedMax.ts;
    }

    /**
     * Check if value is before min date.
     */
    isBeforeMin(value) {
        return value.ts < this._computedMin.ts;
    }

    /**
     * Check if value is an invalid date.
     */
    isInvalidDate(value) {
        const date = dateTimeObjectFrom(value);
        return !date || date.startOf('day').ts === NULL_DATE;
    }

    /**
     * Returns an array of dates based on the selection mode interval.
     *
     * @param {object[]} array - array of dates
     * @param {string | Date} newDate - new date
     * @returns array of dates
     */
    isSelectedInterval(array, newDate) {
        const timestamp = newDate.ts;
        const timestamps = array.map((x) => x.ts).sort((a, b) => a - b);

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

        return timestamps.map((x) => this.getDateWithTimezone(x));
    }

    /**
     * Returns an array of dates base on the selection mode multiple.
     *
     * @param {object[]} array - array of dates
     * @param {string | Date} newDate - new date
     * @returns array of dates
     */
    isSelectedMultiple(array, newDate) {
        const timestamp = newDate.ts;
        const timestamps = array.map((x) => x.ts);

        if (!timestamps.includes(timestamp)) {
            timestamps.push(timestamp);
        } else {
            timestamps.splice(timestamps.indexOf(timestamp), 1);
        }
        return timestamps.map((x) => this.getDateWithTimezone(x));
    }

    /**
     * Filter the numbers from the given array.
     *
     * @param {object[]} array Array to filter.
     * @returns Array of numbers.
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
     * Remove invalid values, or values outside of min-max interval, from the computed value.
     */
    removeValuesOutsideRange() {
        this._computedValue = this._computedValue.filter((date) => {
            return (
                !this.isInvalidDate(date) &&
                !this.isAfterMax(date) &&
                !this.isBeforeMin(date)
            );
        });
    }

    /**
     * Set interval when only one value is valid (in min-max range) and the other one is outside range.
     *
     * @param {DateTime} minValue Minimum valid value.
     * @param {DateTime} maxValue Maximum valid value.
     */
    setIntervalWithOneValidValue(minValue, maxValue) {
        if (
            this.isBeforeMin(minValue) &&
            minValue.ts < this._computedValue[0].ts
        ) {
            this._computedValue[1] = this._computedValue[0];
            this._computedValue[0] = this._computedMin;
        } else if (
            this.isAfterMax(maxValue) &&
            maxValue.ts > this._computedValue[0].ts
        ) {
            this._computedValue[1] = this._computedMax;
        }
    }

    /**
     * Update the dates displayed and generate the view data.
     */
    updateDateParameters() {
        this.year = this.displayDate.year;
        this.month = MONTHS[this.displayDate.month - 1];
        this.day =
            this.displayDate.weekday === 7 ? 0 : this.displayDate.weekday;
        this.generateViewData();
    }

    /**
     * Update the value with the current computed value.
     */
    updateValue() {
        if (!this._computedValue.length) {
            this._value = this.selectionMode === 'single' ? null : [];
            return;
        }

        const stringDates = this._computedValue.map((date) => {
            return date.toISO();
        });
        this._value =
            this.selectionMode === 'single' ? stringDates[0] : stringDates;
    }

    /**
     * Filter the strings from the given array.
     *
     * @param {object[]} array Array to filter.
     * @returns Array of strings.
     */
    weekDaysFromArray(array) {
        let dates = [];

        array.forEach((date) => {
            if (typeof date === 'string') {
                dates.push(date);
            }
        });

        return dates;
    }

    /**
     * If invalid current day, center calendar's current day to closest date in min-max interval
     */
    validateCurrentDayValue() {
        if (!this._computedValue.length) {
            return;
        }

        switch (this.selectionMode) {
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
        const minValue = this._computedValue[0];
        const maxValue = this._computedValue[this._computedValue.length - 1];

        if (this.allValuesOutsideMinAndMax) {
            if (this.isBeforeMin(minValue) && this.isAfterMax(maxValue)) {
                this._computedValue[0] = this.getDateWithTimezone(
                    this._computedMin
                );
                this._computedValue[1] = this.getDateWithTimezone(
                    this._computedMax
                );
                this.displayDate = this.getDateWithTimezone(this._computedMin);
            } else {
                this._computedValue = [];
                this.displayDate = this.getCurrentDateOrMin();
            }
            this.updateDateParameters();
        } else {
            this.removeValuesOutsideRange();

            if (this._computedValue.length) {
                // Check if previous min-max values saved were outside of range to create interval
                if (this._computedValue.length === 1) {
                    this.setIntervalWithOneValidValue(minValue, maxValue);
                }
                this.displayDate = this.getDateWithTimezone(
                    this._computedValue[0]
                );
                this.updateDateParameters();
            }
        }
    }

    /**
     * Validate value for multiple selection mode.
     */
    validateValueMultipleMode() {
        this.removeValuesOutsideRange();

        if (this._computedValue.length) {
            this.displayDate = this._computedValue[0];
            this.updateDateParameters();
        }
    }

    /**
     * Validate value for single selection mode.
     */
    validateValueSingleMode() {
        // If multiple values are selected, we remove those outside range
        if (this._computedValue && this._computedValue.length > 1) {
            this.removeValuesOutsideRange();
        }
        // If one single value, we check if it's in interval and set to closest value if not
        else {
            if (this.isInvalidDate(this._computedValue[0])) {
                this._computedValue = [];
                this.displayDate = this.getCurrentDateOrMin();
            } else if (this.isAfterMax(this._computedValue[0])) {
                this._computedValue = [];
                this.displayDate = this.getDateWithTimezone(this._computedMax);
            } else if (this.isBeforeMin(this._computedValue[0])) {
                this._computedValue = [];
                this.displayDate = this.getDateWithTimezone(this._computedMin);
            }
            this.updateDateParameters();
        }
    }

    /*
     * ------------------------------------------------------------
     *  EVENT HANDLERS AND DISPATCHERS
     * -------------------------------------------------------------
     */

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

        const focusDate = this.getDateWithTimezone(
            Number(event.currentTarget.dataset.fullDate)
        );
        if (focusDate) {
            this._focusDate = focusDate;
        }
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
     * Keyboard navigation handler.
     *
     * @param {Event} event
     */
    handleKeyDown(event) {
        const fullDate = Number(event.target.dataset.fullDate);
        if (!fullDate) {
            return;
        }

        const initialDate = this.getDateWithTimezone(fullDate);
        const { year, day, month } = initialDate;
        let nextDate;

        if (event.altKey) {
            if (event.keyCode === keyCodes.pageup) {
                nextDate = initialDate.set({ year: year - 1 });
            }
            if (event.keyCode === keyCodes.pagedown) {
                nextDate = initialDate.set({ year: year + 1 });
            }
        } else {
            switch (event.keyCode) {
                case keyCodes.left:
                    nextDate = initialDate.set({ day: day - 1 });
                    break;
                case keyCodes.right:
                    nextDate = initialDate.set({ day: day + 1 });
                    break;
                case keyCodes.up:
                    nextDate = initialDate.set({ day: day - 7 });
                    break;
                case keyCodes.down:
                    nextDate = initialDate.set({ day: day + 7 });
                    break;
                case keyCodes.home:
                    nextDate = getStartOfWeek(initialDate);
                    break;
                case keyCodes.end:
                    if (initialDate.weekday === 7) {
                        nextDate = initialDate.plus({ days: 6 });
                    } else {
                        nextDate = initialDate.set({ weekday: 6 });
                    }
                    break;
                case keyCodes.pagedown:
                    nextDate = initialDate.set({ month: month - 1 });
                    break;
                case keyCodes.pageup:
                    nextDate = initialDate.set({ month: month + 1 });
                    break;
                case keyCodes.space:
                case keyCodes.enter:
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

        event.preventDefault();

        if (nextDate && (month !== nextDate.month || year !== nextDate.year)) {
            this.dispatchNavigateEvent(nextDate);
        }

        if (nextDate < this._computedMin) {
            this._focusDate = this._computedMin;
        } else if (nextDate > this._computedMax) {
            this._focusDate = this._computedMax;
        } else {
            this._focusDate = this.getDateWithTimezone(nextDate);
        }
        this.displayDate = this._focusDate;
        this.updateDateParameters();
        this.computeFocus(true);
    }

    /**
     * Mouse over handler.
     */
    handleMouseOver(event) {
        const day = event.target.getAttribute('data-full-date');
        const dayCell = this.template.querySelector(
            `[data-full-date="${day}"]`
        );
        const timeArray = this._computedValue
            .map((x) => x.ts)
            .sort((a, b) => a - b);
        if (this.selectionMode === 'interval' && !!day) {
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

    /**
     * Next month handler.
     */
    handlerNextMonth() {
        const month = this.displayDate.month + 1;
        this.displayDate = this.displayDate.set({ month });
        this.updateDateParameters();
        this.computeFocus(false);
        this.dispatchNavigateEvent(this.displayDate);
    }

    /**
     * Previous month handler.
     */
    handlerPreviousMonth() {
        const month = this.displayDate.month - 1;
        this.displayDate = this.displayDate.set({ month });
        this.updateDateParameters();
        this.computeFocus(false);
        this.dispatchNavigateEvent(this.displayDate);
    }

    /**
     * Date selection handler.
     *
     * @param {object} event
     */
    handleSelectDate(event) {
        this.handleDateFocus(event);

        const { fullDate, disabled } = event.currentTarget.dataset;
        const date = this.getDateWithTimezone(Number(fullDate));
        if (this.isInvalidDate(date) || disabled === 'true') {
            return;
        }

        switch (this.selectionMode) {
            case 'interval':
                this._computedValue = this.isSelectedInterval(
                    this._computedValue,
                    date
                );
                break;
            case 'multiple':
                this._computedValue = this.isSelectedMultiple(
                    this._computedValue,
                    date
                );
                break;
            default: {
                const unselect =
                    this._computedValue.length &&
                    this._computedValue[0].ts === date.ts;
                this._computedValue = unselect ? [] : [date];
                break;
            }
        }
        const clickedDate = date.toISO();
        this.displayDate = this.getDateWithTimezone(date);
        this.updateDateParameters();
        this.updateValue();

        /**
         * The event fired when the selected date is changed.
         *
         * @event
         * @public
         * @name change
         * @param {DOMRect} bounds The size and position of the clicked date in the viewport.
         * @param {string|string[]} value Selected date(s), as an ISO8601 formatted string. Returns a string if the selection mode is single. Returns an array of dates otherwise.
         * @param {string} clickedDate Clicked date, as an ISO8601 formatted string.
         */
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    bounds: event.currentTarget.getBoundingClientRect(),
                    value: this.value,
                    clickedDate
                }
            })
        );

        this.computeFocus(true);
    }

    /**
     * Year change handler.
     *
     * @param {object} event
     */
    handleYearChange(event) {
        this.displayDate = this.displayDate.set({ year: event.detail.value });

        if (this.displayDate.ts < this._computedMin.ts) {
            this.displayDate = this.displayDate.set({
                month: this._computedMin.month
            });
        }

        if (this.displayDate.ts > this._computedMax.ts) {
            this.displayDate = this.displayDate.set({
                month: this._computedMax.month
            });
        }

        this.dispatchNavigateEvent(this.displayDate);
        this.updateDateParameters();
        event.stopPropagation();
        this.computeFocus(true);
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
        const firstDayOfMonth = date.set({ day: 1 });

        this.dispatchEvent(
            new CustomEvent('navigate', {
                detail: {
                    date: firstDayOfMonth.toISO()
                }
            })
        );
    }
}
