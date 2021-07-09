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
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';
import { FieldConstraintApi } from 'c/inputUtils';
import { classSet } from 'c/utils';
import TIME_ZONES from './avonniTimeZones.js';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DATE_TIME_VARIANTS = {
    valid: ['daily', 'weekly', 'inline', 'timeline', 'monthly'],
    default: 'daily'
};
const DATE_TIME_TYPES = {
    valid: ['radio', 'checkbox'],
    default: 'radio'
};
const DATE_TIME_FORMATS = {
    valid: ['numeric', '2-digit'],
    dayDefault: 'numeric',
    hourDefault: 'numeric',
    minuteDefault: '2-digit'
};
const WEEKDAY_FORMATS = {
    valid: ['narrow', 'short', 'long'],
    default: 'short'
};
const MONTH_FORMATS = {
    valid: ['2-digit', 'numeric', 'narrow', 'short', 'long'],
    default: 'long'
};

const DEFAULT_START_TIME = 46800000;
const DEFAULT_END_TIME = 82800000;
const DEFAULT_TIME_SLOT_DURATION = 1800000;
const DEFAULT_MAX = new Date(new Date(2099, 11, 31).setHours(0, 0, 0, 0));
const DEFAULT_MIN = new Date(new Date(1900, 0, 1).setHours(0, 0, 0, 0));
const DEFAULT_DAY_CLASS = 'avonni-date-time-picker__day';

export default class AvonniDateTimePicker extends LightningElement {
    @api fieldLevelHelp;
    @api label;
    @api messageWhenValueMissing;
    @api name;
    @api readOnly = false;
    @api required = false;
    @api disabledDateTimes = [];

    _hideLabel;
    _variant = DATE_TIME_VARIANTS.default;
    _max = DEFAULT_MAX;
    _min = DEFAULT_MIN;
    _value;
    _startTime = DEFAULT_START_TIME;
    _endTime = DEFAULT_END_TIME;
    _timeSlotDuration = DEFAULT_TIME_SLOT_DURATION;
    _timeSlots;
    _timeFormatHour;
    _timeFormatHour12;
    _timeFormatMinute;
    _timeFormatSecond;
    _dateFormatDay = DATE_TIME_FORMATS.dayDefault;
    _dateFormatWeekday = WEEKDAY_FORMATS.default;
    _dateFormatMonth = MONTH_FORMATS.default;
    _dateFormatYear;
    _showEndTime;
    _showDisabledDates;
    _type = DATE_TIME_TYPES.default;
    _showTimeZone = false;
    _hideNavigation = false;
    _hideDatePicker = false;
    _disabled = false;

    table;
    today;
    firstWeekDay;
    lastWeekDay;
    selectedDayTime = {};
    timeZones = TIME_ZONES;
    selectedTimeZone;
    helpMessage = null;
    datePickerValue;
    dayClass = DEFAULT_DAY_CLASS;
    calendarDisabledDates = [];

    connectedCallback() {
        this._processValue();
        this.selectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        this._initTimeSlots();
        const now = new Date();
        this.today = now;
        this.datePickerValue = now.toISOString();

        const firstDay = this.today < this.min ? this.min : this.today;
        this._setFirstWeekDay(firstDay);

        // If no time format is provided, defaults to hour:minutes (0:00)
        // The default is set here so it is possible to have only the hour, minutes:seconds, etc.
        this._initTimeFormat();

        if (this.isMonthly) {
            this._disableMonthlyCalendarDates();
        }

        this._generateTable();
    }

    @api
    get hideLabel() {
        return this._hideLabel;
    }

    set hideLabel(boolean) {
        this._hideLabel = normalizeBoolean(boolean);
    }

    @api
    get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: DATE_TIME_VARIANTS.default,
            validValues: DATE_TIME_VARIANTS.valid
        });

        this.dayClass = classSet('slds-text-align_center slds-grid').add({
            'avonni-date-time-picker__day_inline': this._variant === 'inline',
            'avonni-date-time-picker__day': this._variant !== 'inline'
        });

        if (this.isConnected) {
            if (this._variant === 'monthly') {
                this._disableMonthlyCalendarDates();
            }

            const firstDay = this.today < this.min ? this.min : this.today;
            this._setFirstWeekDay(firstDay);
            this._generateTable();
        }
    }

    @api
    get max() {
        return this._max;
    }

    set max(value) {
        const date = this._processDate(value);
        if (date) {
            this._max = new Date(date.setHours(0, 0, 0, 0));
        }

        if (this.isConnected) {
            this._generateTable();
        }
    }

    @api
    get min() {
        return this._min;
    }

    set min(value) {
        const date = this._processDate(value);
        if (date) {
            this._min = new Date(date.setHours(0, 0, 0, 0));
        }

        if (this.isConnected) {
            const firstDay = this.today < this.min ? this.min : this.today;
            this._setFirstWeekDay(firstDay);
            this._generateTable();
        }
    }

    @api get validity() {
        return this._constraint.validity;
    }

    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }

    @api
    get startTime() {
        return this._startTime;
    }

    set startTime(value) {
        const start = new Date(`1970-01-01T${value}`);
        // Return start time in ms. Default value is 08:00.
        this._startTime = isNaN(start.getTime())
            ? DEFAULT_START_TIME
            : start.getTime();
        if (this.isConnected) {
            this._initTimeSlots();
            this._generateTable();
        }
    }

    @api
    get endTime() {
        return this._endTime;
    }

    set endTime(value) {
        const end = new Date(`1970-01-01T${value}`);
        // Return end time in ms. Default value is 18:00.
        this._endTime = isNaN(end.getTime()) ? DEFAULT_END_TIME : end.getTime();
        if (this.isConnected) {
            this._initTimeSlots();
            this._generateTable();
        }
    }

    @api
    get timeSlotDuration() {
        return this._timeSlotDuration;
    }

    set timeSlotDuration(value) {
        const duration =
            typeof value === 'string' &&
            value.match(/(\d{2}):(\d{2}):?(\d{2})?/);
        let durationMilliseconds = 0;
        if (duration) {
            const durationHours = parseInt(duration[1], 10);
            const durationMinutes = parseInt(duration[2], 10);
            const durationSeconds = parseInt(duration[3], 10) || 0;
            durationMilliseconds =
                durationHours * 3600000 +
                durationMinutes * 60000 +
                durationSeconds * 1000;
        }

        // Return duration in ms. Default value is 00:30.
        this._timeSlotDuration =
            durationMilliseconds > 0
                ? durationMilliseconds
                : DEFAULT_TIME_SLOT_DURATION;

        if (this.isConnected) {
            this._initTimeSlots();
            this._generateTable();
        }
    }

    @api
    get timeFormatHour() {
        return this._timeFormatHour || undefined;
    }

    set timeFormatHour(value) {
        this._timeFormatHour = normalizeString(value, {
            validValues: DATE_TIME_FORMATS.valid
        });
    }

    @api
    get timeFormatHour12() {
        return this._timeFormatHour12;
    }

    set timeFormatHour12(boolean) {
        if (boolean !== undefined) {
            this._timeFormatHour12 = normalizeBoolean(boolean);
        }
    }

    @api
    get timeFormatMinute() {
        return this._timeFormatMinute || undefined;
    }

    set timeFormatMinute(value) {
        this._timeFormatMinute = normalizeString(value, {
            validValues: DATE_TIME_FORMATS.valid
        });
    }

    @api
    get timeFormatSecond() {
        return this._timeFormatSecond || undefined;
    }

    set timeFormatSecond(value) {
        this._timeFormatSecond = normalizeString(value, {
            validValues: DATE_TIME_FORMATS.valid
        });
    }

    @api
    get dateFormatDay() {
        return this._dateFormatDay;
    }

    set dateFormatDay(value) {
        this._dateFormatDay = normalizeString(value, {
            fallbackValue: DATE_TIME_FORMATS.dayDefault,
            validValues: DATE_TIME_FORMATS.valid
        });

        if (this.isConnected && this.variant === 'weekly')
            this._generateTable();
    }

    @api
    get dateFormatMonth() {
        return this._dateFormatMonth;
    }

    set dateFormatMonth(value) {
        this._dateFormatMonth = normalizeString(value, {
            fallbackValue: MONTH_FORMATS.default,
            validValues: MONTH_FORMATS.valid
        });
    }

    @api
    get dateFormatWeekday() {
        return this._dateFormatWeekday;
    }

    set dateFormatWeekday(value) {
        this._dateFormatWeekday = normalizeString(value, {
            fallbackValue: WEEKDAY_FORMATS.default,
            validValues: WEEKDAY_FORMATS.valid
        });

        if (this.isConnected && this.variant === 'weekly')
            this._generateTable();
    }

    @api
    get dateFormatYear() {
        return this._dateFormatYear;
    }

    set dateFormatYear(value) {
        this._dateFormatYear = normalizeString(value, {
            validValues: DATE_TIME_FORMATS.valid
        });
    }

    @api
    get showEndTime() {
        return this._showEndTime;
    }

    set showEndTime(boolean) {
        this._showEndTime = normalizeBoolean(boolean);
    }

    @api
    get showDisabledDates() {
        return this._showDisabledDates;
    }

    set showDisabledDates(boolean) {
        this._showDisabledDates = normalizeBoolean(boolean);

        if (this.isConnected) {
            this._generateTable();
        }
    }

    @api
    get type() {
        return this._type;
    }

    set type(value) {
        this._type = normalizeString(value, {
            fallbackValue: DATE_TIME_TYPES.default,
            validValues: DATE_TIME_TYPES.valid
        });
        if (this.isConnected) {
            this._processValue();
            this._generateTable();
        }
    }

    @api
    get showTimeZone() {
        return this._showTimeZone;
    }

    set showTimeZone(value) {
        this._showTimeZone = normalizeBoolean(value);
    }

    @api
    get hideNavigation() {
        return this._hideNavigation;
    }

    set hideNavigation(value) {
        this._hideNavigation = normalizeBoolean(value);
    }

    @api
    get hideDatePicker() {
        return this._hideDatePicker;
    }

    set hideDatePicker(value) {
        this._hideDatePicker = normalizeBoolean(value);
    }

    get _constraint() {
        if (!this._constraintApi) {
            this._constraintApi = new FieldConstraintApi(() => this, {
                valueMissing: () =>
                    !this.disabled && this.required && !this.value
            });
        }
        return this._constraintApi;
    }

    @api
    get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
        if (this.isConnected) {
            this._initTimeFormat();
            this._generateTable();
        }
    }

    @api
    checkValidity() {
        return this._constraint.checkValidity();
    }

    @api
    reportValidity() {
        return this._constraint.reportValidity((message) => {
            this.helpMessage = this.messageWhenValueMissing || message;
        });
    }

    @api
    setCustomValidity(message) {
        this._constraint.setCustomValidity(message);
    }

    @api
    showHelpMessageIfInvalid() {
        this.reportValidity();

        // Show errors on date picker
        const datePicker = this.template.querySelector('lightning-input');
        if (datePicker) datePicker.reportValidity();
    }

    _disableMonthlyCalendarDates() {
        this.disabledDateTimes.forEach((disabledDateTime) => {
            const type = typeof disabledDateTime;
            const isNumber = type === 'number';
            const isWeekDay =
                type === 'string' && DAYS.indexOf(disabledDateTime) > -1;
            if (isNumber || isWeekDay) {
                this.calendarDisabledDates.push(disabledDateTime);
            }
        });
    }

    // Returns a date object or null
    _processDate(value) {
        let date = null;
        if (value instanceof Date) date = value;
        if (!isNaN(new Date(value).getTime())) date = new Date(value);
        return date;
    }

    _processValue() {
        if (this.type === 'checkbox') {
            // Make sure the values are in an array
            if (!Array.isArray(this._value)) this._value = [this._value];

            const selectedDayTimes = [];
            const values = [];

            this._value.forEach((value) => {
                const date = this._processDate(value);
                if (date) {
                    selectedDayTimes.push(date.getTime());
                    values.push(date.toISOString());
                }
            });

            this._selectedDayTime = selectedDayTimes;
            this._value = values;
        } else {
            const date = this._processDate(this.value);
            if (date) {
                this._selectedDayTime = date.getTime();
                this._value = date.toISOString();
            }
        }
    }

    _initTimeSlots() {
        const timeSlots = [];
        let currentTime = this.startTime;

        while (currentTime < this.endTime) {
            timeSlots.push(
                new Date(currentTime).toLocaleTimeString('default', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                })
            );
            currentTime = currentTime + this.timeSlotDuration;
        }
        this._timeSlots = timeSlots;
    }

    _initTimeFormat() {
        if (
            !this.timeFormatHour &&
            !this.timeFormatMinute &&
            !this.timeFormatSecond
        ) {
            this._timeFormatHour = DATE_TIME_FORMATS.hourDefault;
            this._timeFormatMinute = DATE_TIME_FORMATS.minuteDefault;
        }
    }

    _setFirstWeekDay(date) {
        if (this.variant === 'weekly') {
            const dateDay = date.getDate() - date.getDay();
            const dateTime = new Date(date).setDate(dateDay);
            this.firstWeekDay = new Date(dateTime);
        } else {
            this.firstWeekDay = date;
        }
    }

    _generateTable() {
        const processedTable = [];
        const daysDisplayed = this.variant === 'weekly' ? 7 : 1;

        for (let i = 0; i < daysDisplayed; i++) {
            const day = new Date(
                new Date(this.firstWeekDay).setDate(
                    this.firstWeekDay.getDate() + i
                )
            );

            const disabled =
                this.disabled ||
                (this.disabledDateTimes && this._isDisabled(day));

            // Create dayTime object
            const dayTime = {
                key: i,
                day: day,
                disabled: disabled,
                show: !disabled || this.showDisabledDates,
                isToday:
                    this.today.toLocaleDateString() ===
                    day.toLocaleDateString(),
                times: []
            };

            // Add a label to the day only if variant is 'week'
            if (this.variant === 'weekly') {
                const labelWeekday = day.toLocaleString('default', {
                    weekday: this.dateFormatWeekday
                });
                const labelDay = day.toLocaleString('default', {
                    day: this.dateFormatDay
                });
                dayTime.label = `${labelWeekday} ${labelDay}`;
            }

            this._createTimeSlots(dayTime);
            processedTable.push(dayTime);
        }

        this.lastWeekDay = processedTable[processedTable.length - 1].day;
        this.table = processedTable;
    }

    //  /!\ Changes the dayTime object passed as argument.
    _createTimeSlots(dayTime) {
        this._timeSlots.forEach((timeSlot) => {
            // Add time to day
            const hour = parseInt(timeSlot.slice(0, 2), 10);
            const minutes = parseInt(timeSlot.slice(3, 5), 10);
            const seconds = parseInt(timeSlot.slice(6, 8), 10);
            const day = dayTime.day;
            day.setHours(hour, minutes, seconds, 0);

            const timestamp = day.getTime();

            const selected =
                this._selectedDayTime && this._isSelected(timestamp);

            if (selected) dayTime.selected = true;

            const disabled =
                dayTime.disabled ||
                (this.disabledDateTimes &&
                    this._disabledFullDateTimes.indexOf(timestamp) > -1);

            const time = {
                startTimeISO: day.toISOString(),
                endTimeISO: new Date(
                    timestamp + this.timeSlotDuration
                ).toISOString(),
                disabled: disabled,
                selected: selected,
                show: !disabled || this.showDisabledDates
            };

            // If the variant is 'timeline', pushes a two-level deep object into dayTime.times
            // {
            //     hour: ISO datetime,
            //     times: [ time objects ]
            // }
            if (this.isTimeline) {
                let timelineHour = new Date(day);
                timelineHour.setHours(hour, 0, 0, 0);
                timelineHour = timelineHour.toISOString();

                const index = dayTime.times.findIndex(
                    (timeObject) => timeObject.hour === timelineHour
                );

                if (index < 0) {
                    dayTime.times.push({
                        hour: timelineHour,
                        times: [time]
                    });
                } else {
                    dayTime.times[index].times.push(time);
                }
                // For other variants, pushes the time object directly into dayTime.times
            } else {
                dayTime.times.push(time);
            }
        });
    }

    _isSelected(time) {
        const selection = this._selectedDayTime;

        return Array.isArray(selection)
            ? selection.indexOf(time) > -1
            : selection === time;
    }

    _isDisabled(dayObject) {
        // Remove time from the date object
        const day = new Date(new Date(dayObject).setHours(0, 0, 0, 0));

        const outsideOfAllowedDates = day < this.min || day > this.max;
        const weekDay = day.getDay();
        const monthDay = day.getDate();

        return (
            outsideOfAllowedDates ||
            this._disabledWeekDays.indexOf(weekDay) > -1 ||
            this._disabledMonthDays.indexOf(monthDay) > -1
        );
    }

    get _disabledFullDateTimes() {
        let dateTimes = [];

        this.disabledDateTimes.forEach((dateTime) => {
            if (typeof dateTime === 'object') {
                dateTimes.push(dateTime.getTime());
            }
        });

        return dateTimes;
    }

    get _disabledWeekDays() {
        let dates = [];

        this.disabledDateTimes.forEach((date) => {
            if (typeof date === 'string') {
                dates.push(DAYS.indexOf(date));
            }
        });

        return dates;
    }

    get _disabledMonthDays() {
        let dates = [];

        this.disabledDateTimes.forEach((date) => {
            if (typeof date === 'number') {
                dates.push(date);
            }
        });

        return dates;
    }

    get currentDateRangeString() {
        const options = {
            month: this.dateFormatMonth,
            day: this.dateFormatDay
        };

        if (this.dateFormatYear) options.year = this.dateFormatYear;

        const firstWeekDay = this.firstWeekDay.toLocaleString('default', {
            weekday: this.dateFormatWeekday
        });
        const firstDay = this.firstWeekDay.toLocaleString('default', options);
        const lastDay = this.lastWeekDay.toLocaleString('default', options);

        return this.variant === 'weekly'
            ? `${firstDay} - ${lastDay}`
            : `${firstWeekDay}, ${firstDay}`;
    }

    get firstWeekDayToString() {
        return this.firstWeekDay.toISOString();
    }

    get minToString() {
        return this.min.toISOString();
    }

    get maxToString() {
        return this.max.toISOString();
    }

    get prevButtonIsDisabled() {
        return this.firstWeekDay <= this.min;
    }

    get nextButtonIsDisabled() {
        return this.lastWeekDay >= this.max;
    }

    get entirePeriodIsDisabled() {
        return this.table.every((day) => day.disabled === true);
    }

    get isTimeline() {
        return this.variant === 'timeline';
    }

    get isMonthly() {
        return this.variant === 'monthly';
    }

    handleTimeZoneChange(event) {
        this.selectedTimeZone = event.detail.value;
    }

    handleTodayClick() {
        this.datePickerValue = this.today.toISOString();
        this._setFirstWeekDay(this.today);
        this._generateTable();
    }

    handlePrevNextClick(event) {
        const dayRange = this.variant === 'weekly' ? 7 : 1;
        const direction = event.currentTarget.dataset.direction;
        const dayRangeSign = direction === 'next' ? dayRange : -dayRange;
        this.firstWeekDay = new Date(
            new Date(this.firstWeekDay).setDate(
                this.firstWeekDay.getDate() + dayRangeSign
            )
        );
        this._generateTable();
        this.datePickerValue = this.firstWeekDay.toISOString();
    }

    handleDateChange(event) {
        const dateString = event.detail.value.match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );

        if (dateString) {
            const year = dateString[1];
            const month = dateString[2] - 1;
            const day = dateString[3];
            const date = new Date(year, month, day);

            this._setFirstWeekDay(date);
            this._generateTable();
            this.datePickerValue = date.toISOString();
        }
    }

    handleTimeSlotClick(event) {
        if (this.readOnly) return;

        const dateTimeISO = event.currentTarget.firstChild.value;
        const date = new Date(dateTimeISO);

        // Select/unselect the date
        if (this.type === 'checkbox') {
            const valueIndex = this.value.indexOf(dateTimeISO);
            if (valueIndex > -1) {
                this._value.splice(valueIndex, 1);
            } else {
                this._value.push(dateTimeISO);
            }

            const selectIndex = this._selectedDayTime.indexOf(date.getTime());
            if (selectIndex > -1) {
                this._selectedDayTime.splice(selectIndex, 1);
            } else {
                this._selectedDayTime.push(date.getTime());
            }
        } else {
            this._value = this._value === dateTimeISO ? null : dateTimeISO;
            this._selectedDayTime =
                this._selectedDayTime === date.getTime()
                    ? null
                    : date.getTime();
        }

        // Refresh table to show selected time slot
        this._generateTable();

        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value: Array.isArray(this.value)
                        ? this.value.join()
                        : this.value,
                    name: this.name
                }
            })
        );
    }
}
