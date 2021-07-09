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

// default implementation of localization service for en-US locale. This covers the current usage of the localizationService in the code base.
// This should be removed when the framework team moves auraLocalizationService to a separate module
import {
    isValidISOTimeString,
    isValidISODateTimeString,
    removeTimeZoneSuffix,
    STANDARD_TIME_FORMAT,
    STANDARD_DATE_FORMAT,
    TIME_SEPARATOR
} from 'c/iso8601Utils';
import Duration from './defaultDurationConfig';

const MONTH_NAMES = [
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
const DATE_FORMAT = {
    short: 'M/d/yyyy',
    medium: 'MMM d, yyyy',
    long: 'MMMM d, yyyy'
};
const TIME_FORMAT = {
    short: 'h:mm a',
    medium: 'h:mm:ss a',
    long: 'h:mm:ss a'
};

// The parseTime method normalizes the time format so that minor deviations are accepted
const TIME_FORMAT_SIMPLE = {
    short: 'h:m a',
    medium: 'h:m:s a',
    long: 'h:m:s a'
};

// Only works with dates and iso strings
// formats the date object by ignoring the timezone offset
// e.g. assume date is Mar 11 2019 00:00:00 GMT+1100:
// formatDate(date, 'YYYY-MM-DD') -> 2019-03-11
function formatDate(value, format) {
    let isUTC = false;
    let dateString = value;
    if (typeof value === 'string') {
        dateString = value.split(TIME_SEPARATOR)[0];
        isUTC = true;
    }
    return formatDateInternal(dateString, format, isUTC);
}

// Only works with date objects.
// formats the date object according to UTC.
// e.g. assume date is Mar 11 2019 00:00:00 GMT+1100:
// formatDateUTC(date, 'YYYY-MM-DD') -> 2019-03-10
function formatDateUTC(value, format) {
    return formatDateInternal(value, format, true);
}

// Only works with a date object
function formatTime(date, format) {
    if (!isDate(date)) {
        return new Date('');
    }

    const hours = ((date.getHours() + 11) % 12) + 1;
    const suffix = date.getHours() >= 12 ? 'PM' : 'AM';

    switch (format) {
        case STANDARD_TIME_FORMAT:
            // 16:12:32.000
            return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
                date.getSeconds()
            )}.${doublePad(date.getMilliseconds())}`;
        case TIME_FORMAT.short:
            // 4:12 PM;
            return `${hours}:${pad(date.getMinutes())} ${suffix}`;
        case TIME_FORMAT.medium:
        case TIME_FORMAT.long:
        default:
            // 4:12:32 PM;
            return `${hours}:${pad(date.getMinutes())}:${pad(
                date.getSeconds()
            )} ${suffix}`;
    }
}

// Only works with a date object
// formats the date object according to UTC.
// e.g. assume date is Mar 11 2019 00:00:00 GMT+1100:
// formatDateTimeUTC(date) -> 2019-03-10  1:00:00 PM
function formatDateTimeUTC(value) {
    if (!isDate(value)) {
        return new Date('');
    }
    const date = new Date(value.getTime());
    return `${formatDateUTC(date)}, ${formatTime(addTimezoneOffset(date))}`;
}

// parses ISO8601 date/time strings. Currently only used to parse ISO time strings without a TZD. Some examples:
// 20:00:00.000             -> Feb 26 2019 20:00:00 GMT-0500
// 2019-03-11               -> Mar 11 2019 00:00:00 GMT-0400
// 2019-03-11T00:00:00.000Z -> Mar 10 2019 20:00:00 GMT-0400
function parseDateTimeISO8601(value) {
    let isoString = null;
    let shouldAddOffset = true;
    if (isValidISOTimeString(value)) {
        isoString = `${getTodayInISO()}T${addTimezoneSuffix(value)}`;
    } else if (isValidISODateTimeString(value)) {
        if (value.indexOf(TIME_SEPARATOR) > 0) {
            isoString = addTimezoneSuffix(value);
            shouldAddOffset = false;
        } else {
            isoString = `${value}T00:00:00.000Z`;
        }
    }

    if (isoString) {
        // Browsers differ on how they treat iso strings without a timezone offset (local vs utc time)
        const parsedDate = new Date(isoString);
        if (shouldAddOffset) {
            addTimezoneOffset(parsedDate);
        }
        return parsedDate;
    }
    return null;
}

// called by the datepicker and calendar for parsing iso and formatted date strings
// called by the timepicker to parse the formatted time string
function parseDateTime(value, format) {
    if (format === STANDARD_DATE_FORMAT && isValidISODateTimeString(value)) {
        return parseDateTimeISO8601(value);
    }
    if (Object.values(DATE_FORMAT).includes(format)) {
        return parseFormattedDate(value, format);
    }
    if (Object.values(TIME_FORMAT_SIMPLE).includes(format)) {
        return parseFormattedTime(value);
    }
    return null;
}

// The input to this method is always an ISO string with timezone offset.
function parseDateTimeUTC(value) {
    return parseDateTimeISO8601(addTimezoneSuffix(value));
}

function isBefore(date1, date2, unit) {
    const normalizedDate1 = getDate(date1);
    const normalizedDate2 = getDate(date2);
    if (!normalizedDate1 || !normalizedDate2) {
        return false;
    }
    return (
        startOf(normalizedDate1, unit).getTime() <
        startOf(normalizedDate2, unit).getTime()
    );
}

// unit can be millisecond, minute, day
function isAfter(date1, date2, unit) {
    const normalizedDate1 = getDate(date1);
    const normalizedDate2 = getDate(date2);
    if (!normalizedDate1 || !normalizedDate2) {
        return false;
    }
    return (
        startOf(normalizedDate1, unit).getTime() >
        startOf(normalizedDate2, unit).getTime()
    );
}

// We're not doing timezone conversion in the default config. Only converting from UTC to system timezone
function UTCToWallTime(date, timezone, callback) {
    const utcDate = new Date(date.getTime());
    callback(subtractTimezoneOffset(utcDate));
}

// We're not doing timezone conversion in the default config. Only converting from system timezone to UTC
function WallTimeToUTC(date, timezone, callback) {
    const localDate = new Date(date.getTime());
    callback(addTimezoneOffset(localDate));
}

// We're assuming en-US locale so we don't need translation between calendar systems
function translateToOtherCalendar(date) {
    return date;
}

// We're assuming en-US locale so we don't need translation between calendar systems
function translateFromOtherCalendar(date) {
    return date;
}

// We're assuming en-US locale so we don't need translation of digits
function translateToLocalizedDigits(input) {
    return input;
}

// We're assuming en-US locale so we don't need translation of digits
function translateFromLocalizedDigits(input) {
    return input;
}

// This is called from the numberFormat library when the value exceeds the safe length.
// We currently rely on aura to format large numbers
function getNumberFormat() {
    return {
        format: (value) => {
            // eslint-disable-next-line no-console
            console.warn(
                `The current environment does not support large numbers and the original value of ${value} will be returned.`
            );
            return value;
        }
    };
}

// relativeDateTime (currently the only user of duration) uses unit="minutes"
// The default implementation here assumes the unit is always minutes.
function duration(minutes) {
    return new Duration(minutes * 60 * 1000);
}

function displayDuration(value) {
    return value.humanize('en');
}

// parses a time string formatted in en-US locale i.e. h:mm:ss a
function parseFormattedTime(value) {
    // for time strings it's easier to just split on :.\s
    const values = value.trim().split(/[:.\s*]/);
    // at least two parts i.e. 12 PM, and at most 5 parts i.e. 12:34:21.432 PM
    const length = values.length;
    if (!values || length < 2 || length > 5) {
        return null;
    }
    const ampm = values[length - 1];
    const isBeforeNoon = ampm.toLowerCase() === 'am';
    const isAfternoon = ampm.toLowerCase() === 'pm';
    // remove ampm
    values.splice(-1, 1);
    const allNumbers = values.every((item) => !isNaN(item));
    if ((!isAfternoon && !isBeforeNoon) || !allNumbers) {
        return null;
    }
    const hours = values[0];
    const hour24 = pad(isAfternoon ? (hours % 12) + 12 : hours % 12);

    const minutes = (length >= 3 && values[1]) || '0';
    const seconds = (length >= 4 && values[2]) || '0';
    const milliseconds = (length === 5 && values[3]) || '0';

    const newDate = new Date(getTodayInISO());
    newDate.setHours(hour24, minutes, seconds, milliseconds);

    return isDate(newDate) ? newDate : null;
}

// parses a date string formatted in en-US locale, i.e. MMM d, yyyy
function parseFormattedDate(value, format) {
    // default to medium style pattern
    let pattern = /^([a-zA-Z]{3})\s*(\d{1,2}),\s*(\d{4})$/;
    switch (format) {
        case DATE_FORMAT.short:
            pattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
            break;
        case DATE_FORMAT.long:
            pattern = /^([a-zA-Z]+)\s*(\d{1,2}),\s*(\d{4})$/;
            break;
        default:
    }

    // matches[1]: month, matches[2]: day, matches[3]: year
    const match = pattern.exec(value.trim());
    if (!match) {
        return null;
    }

    let month = match[1];
    const day = match[2];
    const year = match[3];

    // for long and medium style formats, we need to find the month index
    if (format !== DATE_FORMAT.short) {
        month = MONTH_NAMES.findIndex((item) =>
            item.toLowerCase().includes(month.toLowerCase())
        );
        // the actual month for the ISO string is 1 more than the index
        month += 1;
    }

    const isoValue = `${year}-${pad(month)}-${pad(day)}`;
    const newDate = new Date(`${isoValue}T00:00:00.000Z`);

    return isDate(newDate) ? addTimezoneOffset(newDate) : null;
}

function formatDateInternal(value, format, isUTC) {
    const date = getDate(value);
    if (!date) {
        // return Invalid Date
        return new Date('');
    }
    if (isUTC && isDate(value)) {
        // if value is an ISO string, we already add the timezone offset when parsing the date string.
        addTimezoneOffset(date);
    }

    switch (format) {
        case STANDARD_DATE_FORMAT:
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
                date.getDate()
            )}`;
        case DATE_FORMAT.short:
            return `${
                date.getMonth() + 1
            }/${date.getDate()}/${date.getFullYear()}`;
        case DATE_FORMAT.long:
            return `${
                MONTH_NAMES[date.getMonth()]
            } ${date.getDate()}, ${date.getFullYear()}`;
        case DATE_FORMAT.medium:
        default: {
            const shortMonthName = MONTH_NAMES[date.getMonth()].substring(0, 3);
            return `${shortMonthName} ${date.getDate()}, ${date.getFullYear()}`;
        }
    }
}

// unit can be 'day' or 'minute', otherwise will default to milliseconds. These are the only units that are currently used in the codebase.
function startOf(date, unit) {
    switch (unit) {
        case 'day':
            date.setHours(0);
            date.setMinutes(0);
        // falls through
        case 'minute':
            date.setSeconds(0);
            date.setMilliseconds(0);
            break;
        default:
    }

    return date;
}

function isDate(value) {
    return (
        Object.prototype.toString.call(value) === '[object Date]' &&
        !isNaN(value.getTime())
    );
}

function addTimezoneSuffix(value) {
    // first remove TZD if the string has one, and then add Z
    return removeTimeZoneSuffix(value) + 'Z';
}

function addTimezoneOffset(date) {
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date;
}

function subtractTimezoneOffset(date) {
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date;
}

function getDate(value) {
    if (!value) {
        return null;
    }
    if (isDate(value)) {
        return new Date(value.getTime());
    }
    if (
        isFinite(value) &&
        (typeof value === 'number' || typeof value === 'string')
    ) {
        return new Date(parseInt(value, 10));
    }
    if (typeof value === 'string') {
        return parseDateTimeISO8601(value);
    }
    return null;
}

function getTodayInISO() {
    return new Date().toISOString().split('T')[0];
}

function pad(n) {
    return Number(n) < 10 ? '0' + n : n;
}

function doublePad(n) {
    return Number(n) < 10 ? '00' + n : Number(n) < 100 ? '0' + n : n;
}

export default {
    formatDate,
    formatDateUTC,
    formatTime,
    formatDateTimeUTC,
    parseDateTimeISO8601,
    parseDateTime,
    parseDateTimeUTC,
    isBefore,
    isAfter,
    UTCToWallTime,
    WallTimeToUTC,
    translateToOtherCalendar,
    translateFromOtherCalendar,
    translateToLocalizedDigits,
    translateFromLocalizedDigits,
    getNumberFormat,
    duration,
    displayDuration
};
