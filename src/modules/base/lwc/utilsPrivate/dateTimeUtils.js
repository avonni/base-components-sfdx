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

import { DateTime, Interval } from 'c/luxon';

/**
 * Convert a timestamp or a date object into a Luxon DateTime object.
 *
 * @param {(number | Date)} date Timestamp or date object to convert.
 * @returns {(DateTime | false)} DateTime object or false.
 */
const dateTimeObjectFrom = (date, options) => {
    let time;
    if (date instanceof Date) {
        time = date.getTime();
    } else if (date instanceof DateTime) {
        time = date.ts;
        if (!options) {
            options = { zone: date.zoneName };
        }
    } else if (!isNaN(new Date(date).getTime())) {
        time = new Date(date).getTime();
    } else if (typeof date === 'string') {
        // Add support for Salesforce format 2023-01-25, 12:00 p.m.
        let normalizedDate = date.replace('p.m.', 'PM');
        normalizedDate = normalizedDate.replace('a.m.', 'AM');

        const dateTime = DateTime.fromFormat(normalizedDate, 'yyyy-MM-dd, t', {
            locale: 'default'
        });
        if (dateTime.isValid) {
            time = dateTime.ts;
        }
    }

    if (time) {
        const dateTime = DateTime.fromMillis(time, options);
        if (dateTime.invalidExplanation) {
            // Ignore invalid options but log the error
            console.error(dateTime.invalidExplanation);
            return DateTime.fromMillis(time);
        }
        return dateTime;
    }
    return false;
};

/**
 * Get the weekday of a date, starting the weeks from Sunday.
 *
 * @param {Date|DateTime|number|string} date The date we want to get the weekday of.
 * @returns {number|null} The weekday or null if the date is not a valid date. Weekdays go from 0 (Sunday) to 6 (Saturday).
 */
const getWeekday = (date) => {
    let normalizedDate = date;
    if (!(date instanceof DateTime)) {
        normalizedDate = dateTimeObjectFrom(date);
        if (!normalizedDate) return null;
    }

    const weekday = normalizedDate.weekday;
    return weekday === 7 ? 0 : weekday;
};

/**
 * Add unit * span to the date.
 *
 * @param {DateTime} date The date we want to add time to.
 * @param {string} unit The time unit (minute, hour, day, week, month or year).
 * @param {number} span The number of unit to add.
 * @returns {DateTime} DateTime object with the added time.
 */
const addToDate = (date, unit, span) => {
    const options = {};
    options[unit] = span;
    return date.plus(options);
};

/**
 * Remove unit * span from the date.
 *
 * @param {DateTime} date The date we want to remove time from.
 * @param {string} unit The time unit (minute, hour, day, week, month or year).
 * @param {number} span The number of unit to remove.
 * @returns {DateTime} DateTime object with the removed time.
 */
const removeFromDate = (date, unit, span) => {
    const options = {};
    options[unit] = -span;
    return date.plus(options);
};

const getStartOfWeek = (date) => {
    const isSunday = date.weekday === 7;
    if (isSunday) {
        return date.startOf('day');
    }
    const monday = date.startOf('week');
    return removeFromDate(monday, 'day', 1);
};

/**
 * Get the week number of a date, starting the weeks from Sunday.
 *
 * @param {Date|DateTime|number|string} date The date we want to get the week number of.
 * @returns {number|null} The week number or null if the date is not a valid date.
 */
const getWeekNumber = (date) => {
    let normalizedDate = date;
    if (!(date instanceof DateTime)) {
        normalizedDate = dateTimeObjectFrom(date);
        if (!normalizedDate) return null;
    }

    if (normalizedDate.weekday === 7) {
        normalizedDate = addToDate(normalizedDate, 'day', 1);
    }
    return normalizedDate.weekNumber;
};

/**
 * Calculate the number of units between two dates, including partial units.
 *
 * @param {string} unit The time unit (minute, hour, day, week, month or year).
 * @param {DateTime} start The starting date.
 * @param {DateTime} end The ending date.
 * @returns {number} Number of units between the start and end dates.
 */
const numberOfUnitsBetweenDates = (unit, start, end) => {
    // Compensate the fact that luxon weeks start on Monday
    const isWeek = unit === 'week';
    let normalizedStart = isWeek ? addToDate(start, 'day', 1) : start;
    let normalizedEnd = isWeek ? addToDate(end, 'day', 1) : end;

    const interval = Interval.fromDateTimes(normalizedStart, normalizedEnd);
    return interval.count(unit);
};

const formatDateFromStyle = (
    dateTime,
    { showTime = false, dateStyle = 'medium', timeStyle = 'short' }
) => {
    let formattedDate;

    switch (dateStyle) {
        case 'long':
            formattedDate = dateTime.toFormat('DDD');
            break;
        case 'short':
            formattedDate = dateTime.toFormat('D');
            break;
        default:
            formattedDate = dateTime.toFormat('DD');
            break;
    }

    if (showTime) {
        formattedDate += ' ';
        switch (timeStyle) {
            case 'long':
                formattedDate += dateTime.toFormat('ttt');
                break;
            case 'short':
                formattedDate += dateTime.toFormat('t');
                break;
            default:
                formattedDate += dateTime.toFormat('tt');
                break;
        }
    }

    return formattedDate;
};

export {
    addToDate,
    dateTimeObjectFrom,
    formatDateFromStyle,
    getStartOfWeek,
    getWeekday,
    getWeekNumber,
    numberOfUnitsBetweenDates,
    removeFromDate
};
