/* eslint-disable no-unused-expressions */
import { LightningElement, api } from 'lwc';
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';
import { FieldConstraintApi } from 'c/inputUtils';
import TIME_ZONES from './timeZones.js';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const VARIANTS = ['daily', 'weekly'];
const TYPES = ['radio', 'checkbox'];
const DATE_TIME_FORMAT = ['numeric', '2-digit'];
const WEEKDAY_FORMAT = ['narrow', 'short', 'long'];

const MONTH_FORMAT = ['2-digit', 'numeric', 'narrow', 'short', 'long'];

export default class AvonniDateTimePicker extends LightningElement {
    @api disabled;
    @api fieldLevelHelp;
    @api label;
    @api messageWhenValueMissing;
    @api name;
    @api readOnly;
    @api required;
    @api disabledDateTimes;

    _hideLabel;
    _variant;
    _max;
    _min;
    _value;
    _startTime;
    _endTime;
    _timeSlotDuration;
    _timeSlots;
    _timeFormatHour;
    _timeFormatHour12;
    _timeFormatMinute;
    _timeFormatSecond;
    _dateFormatDay;
    _dateFormatWeekday;
    _dateFormatMonth;
    _dateFormatYear;
    _showEndTime;
    _type;
    _showTimeZone;
    _hideNavigation;
    _hideDatePicker;

    table;
    today;
    firstWeekDay;
    lastWeekDay;
    selectedDayTime = {};
    timeZones = TIME_ZONES;
    selectedTimeZone;
    helpMessage = null;
    datePickerValue;

    connectedCallback() {
        this._processValue();
        this.selectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        this._initTimeSlots();
        const now = new Date();
        this.today = now;
        this.datePickerValue = now.toISOString();

        this.today < this.min
            ? this._setFirstWeekDay(this.min)
            : this._setFirstWeekDay(this.today);

        // If no time format is provided, defaults to hour:minutes (0:00)
        // The default is set here so it is possible to have only the hour, minutes:seconds, etc.
        if (
            !this.timeFormatHour &&
            !this.timeFormatMinute &&
            !this.timeFormatSecond
        ) {
            this._timeFormatHour = 'numeric';
            this._timeFormatMinute = '2-digit';
        }
        this._generateTable();
    }

    renderedCallback() {
        // TODO:
        // Show disabled dates in date picker
        const element = this.template.querySelector('lightning-input');

        if (element) {
            this.template.querySelector('lightning-input').reportValidity();
        }
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
            fallbackValue: 'daily',
            validValues: VARIANTS
        });
    }

    @api
    get max() {
        return this._max;
    }
    set max(value) {
        const date = this._processDate(value);
        if (date) {
            this._max = new Date(date.setHours(0, 0, 0, 0));
        } else {
            this._max = new Date(new Date(2099, 11, 31).setHours(0, 0, 0, 0));
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
        } else {
            this._min = new Date(new Date(1900, 0, 1).setHours(0, 0, 0, 0));
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
        this._startTime = isNaN(start.getTime()) ? 46800000 : start.getTime();
    }

    @api
    get endTime() {
        return this._endTime;
    }
    set endTime(value) {
        const end = new Date(`1970-01-01T${value}`);
        // Return end time in ms. Default value is 18:00.
        this._endTime = isNaN(end.getTime()) ? 82800000 : end.getTime();
    }

    @api
    get timeSlotDuration() {
        return this._timeSlotDuration;
    }
    set timeSlotDuration(value) {
        const duration = value.match(/(\d{2}):(\d{2}):?(\d{2})?/);
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
            durationMilliseconds > 0 ? durationMilliseconds : 1800000;
    }

    @api
    get timeFormatHour() {
        return this._timeFormatHour || undefined;
    }
    set timeFormatHour(value) {
        this._timeFormatHour = normalizeString(value, {
            validValues: DATE_TIME_FORMAT
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
            validValues: DATE_TIME_FORMAT
        });
    }

    @api
    get timeFormatSecond() {
        return this._timeFormatSecond || undefined;
    }
    set timeFormatSecond(value) {
        this._timeFormatSecond = normalizeString(value, {
            validValues: DATE_TIME_FORMAT
        });
    }

    @api
    get dateFormatDay() {
        return this._dateFormatDay;
    }
    set dateFormatDay(value) {
        this._dateFormatDay = normalizeString(value, {
            fallbackValue: 'numeric',
            validValues: DATE_TIME_FORMAT
        });
    }

    @api
    get dateFormatMonth() {
        return this._dateFormatMonth;
    }
    set dateFormatMonth(value) {
        this._dateFormatMonth = normalizeString(value, {
            fallbackValue: 'long',
            validValues: MONTH_FORMAT
        });
    }

    @api
    get dateFormatWeekday() {
        return this._dateFormatWeekday;
    }
    set dateFormatWeekday(value) {
        this._dateFormatWeekday = normalizeString(value, {
            fallbackValue: 'short',
            validValues: WEEKDAY_FORMAT
        });
    }

    @api
    get dateFormatYear() {
        return this._dateFormatYear;
    }
    set dateFormatYear(value) {
        this._dateFormatYear = normalizeString(value, {
            validValues: DATE_TIME_FORMAT
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
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = normalizeString(value, {
            fallbackValue: 'radio',
            validValues: TYPES
        });
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

    _setFirstWeekDay(date) {
        if (this.variant === 'daily') {
            this.firstWeekDay = date;
        } else {
            const dateDay = date.getDate() - date.getDay();
            const dateTime = new Date(date).setDate(dateDay);
            this.firstWeekDay = new Date(dateTime);
        }
    }

    _generateTable() {
        const processedTable = [];
        const daysDisplayed = this.variant === 'daily' ? 1 : 7;

        for (let i = 0; i < daysDisplayed; i++) {
            const day = new Date(
                new Date(this.firstWeekDay).setDate(
                    this.firstWeekDay.getDate() + i
                )
            );

            // Create dayTime object
            const dayTime = {
                key: i,
                day: day,
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
        const dayIsDisabled =
            this.disabledDateTimes && this._isDisabled(dayTime.day);

        this._timeSlots.forEach((timeSlot) => {
            const hour = parseInt(timeSlot.slice(0, 2), 10);
            const minutes = parseInt(timeSlot.slice(3, 5), 10);
            const seconds = parseInt(timeSlot.slice(6, 8), 10);
            const day = dayTime.day;
            day.setHours(hour, minutes, seconds, 0);
            const time = day.getTime();

            const timeIsSelected =
                this._selectedDayTime && this._isSelected(time);

            if (timeIsSelected) dayTime.selected = true;

            const timeIsDisabled =
                this.disabledDateTimes &&
                this._disabledFullDateTimes.indexOf(time) > -1;

            dayTime.times.push({
                startTimeISO: day.toISOString(),
                endTimeISO: new Date(
                    time + this.timeSlotDuration
                ).toISOString(),
                disabled: this.disabled || dayIsDisabled || timeIsDisabled,
                selected: timeIsSelected
            });
        });
    }

    _isSelected(time) {
        const selection = this._selectedDayTime;

        return Array.isArray(selection)
            ? selection.indexOf(time) > -1
            : selection === time;
    }

    _isDisabled(dayObject) {
        // TODO:
        // Disable whole day from date.
        //   Maybe pass an object to disable specific times, instead of passing a date with the right time?
        //   => If a date object is given, disable whole day.
        //   => If this object structure is given, disable only the specific time.
        //   {
        //       date: Date Object,
        //       time: ISO time string
        //   }

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

        return this.variant === 'daily'
            ? `${firstWeekDay}, ${firstDay}`
            : `${firstDay} - ${lastDay}`;
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

    handleTimeZoneChange(event) {
        this.selectedTimeZone = event.detail.value;
    }

    handleTodayClick() {
        this.datePickerValue = this.today.toISOString();
        this._setFirstWeekDay(this.today);
        this._generateTable();
    }

    handlePrevNextClick(event) {
        const dayRange = this.variant === 'daily' ? 1 : 7;
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

    handleDatePickerChange(event) {
        const dateString = event.currentTarget.value;
        if (dateString) {
            this.datePickerValue = dateString;

            // Cut date string into pieces to make sure new date is created with current time zone
            const year = parseInt(dateString.slice(0, 4), 10);
            const month = parseInt(dateString.slice(5, 7), 10) - 1;
            const day = parseInt(dateString.slice(8, 10), 10);
            const date = new Date(year, month, day);
            this._setFirstWeekDay(date);
            this._generateTable();
        }
    }

    handleTimeSlotClick(event) {
        if (this.readOnly) return;

        const dateTimeISO = event.currentTarget.firstChild.value;
        const date = new Date(dateTimeISO);

        // Select/unselect the date
        if (this.type === 'checkbox') {
            const valueIndex = this.value.indexOf(dateTimeISO);
            valueIndex > -1
                ? this._value.splice(valueIndex, 1)
                : this._value.push(dateTimeISO);
            const selectIndex = this._selectedDayTime.indexOf(date.getTime());
            selectIndex > -1
                ? this._selectedDayTime.splice(selectIndex, 1)
                : this._selectedDayTime.push(date.getTime());
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
                    value: this.type === 'checkbox' ? this.value.join() : this.value,
                    name: this.name
                }
            })
        );
    }
}
