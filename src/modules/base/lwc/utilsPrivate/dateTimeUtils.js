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
const dateTimeObjectFrom = (date) => {
    let time;
    if (date instanceof Date) {
        time = date.getTime();
    } else if (!isNaN(new Date(date).getTime())) {
        time = new Date(date).getTime();
    } else if (date instanceof DateTime) {
        return new DateTime(date);
    }

    if (time) return DateTime.fromMillis(time);
    return false;
};

/**
 * Check if a time is included in a time frame.
 *
 * @param {DateTime} date DateTime object.
 * @param {string} timeFrame The time frame of reference, in the format '00:00-00:00'.
 * @returns {boolean} true or false.
 */
const isInTimeFrame = (date, timeFrame) => {
    const startMatch = timeFrame.match(/^([0-9:]+)-/);
    const endMatch = timeFrame.match(/-([0-9:]+)$/);
    if (!startMatch || !endMatch) {
        console.error(
            `Wrong time frame format for ${timeFrame}. The time frame needs to follow the pattern ‘start-end’, with start and end being ISO8601 formatted time strings.`
        );
        return true;
    }

    const start = DateTime.fromISO(startMatch[1]);
    const end = DateTime.fromISO(endMatch[1]);
    if (end < start) {
        console.error(
            `Wrong time frame format for ${timeFrame}. The end time is smaller than the start time.`
        );
        return true;
    }

    const time = date.set({
        year: start.year,
        month: start.month,
        day: start.day
    });

    return time < end && time >= start;
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

/**
 * Check if the date day of the week is allowed.
 *
 * @param {DateTime} date Date to check.
 * @param {number[]} allowedDays Array of allowed days. The days are represented by a number, starting from 0 for Sunday, and ending with 6 for Saturday.
 * @returns {boolean} true or false.
 */
const isAllowedDay = (date, allowedDays) => {
    // Luxon week days start at Monday = 1
    const normalizedDate = date.weekday % 7;
    return allowedDays.includes(normalizedDate);
};

/**
 * Check if the date month is allowed.
 *
 * @param {DateTime} date Date to check.
 * @param {number[]} allowedMonths Array of allowed months. The months are represented by a number, starting from 0 for January, and ending with 11 for December.
 * @returns {boolean} true or false.
 */
const isAllowedMonth = (date, allowedMonths) => {
    // Luxon months start at 1
    return allowedMonths.includes(date.month - 1);
};

/**
 * Check if the date time is in an allowed time frame.
 *
 * @param {DateTime} date Date to check.
 * @param {string[]} allowedTimeFrames Array of allowed time frames. Each time frame string must follow the pattern 'start-end', with start and end being ISO8601 formatted time strings.
 * @returns {boolean} true or false.
 */
const isAllowedTime = (date, allowedTimeFrames) => {
    let i = 0;
    let isAllowed = false;
    while (!isAllowed && i < allowedTimeFrames.length) {
        isAllowed = isInTimeFrame(date, allowedTimeFrames[i]);
        i += 1;
    }
    return isAllowed;
};

/**
 * Find the next allowed month, based on a starting date. If the date month is already allowed, returns the original date.
 *
 * @param {DateTime} startDate The date we start from.
 * @param {number[]} allowedMonths Array of allowed months. The months are represented by a number, starting from 0 for January, and ending with 11 for December.
 * @param {boolean} startNewMonthOnFirstDay If false, the original day of the date will be kept, even if the original date month is not allowed. Defaults to true.
 * @returns {DateTime} Date of the next allowed month.
 */
const nextAllowedMonth = (
    startDate,
    allowedMonths,
    startNewMonthOnFirstDay = true
) => {
    let date = DateTime.fromMillis(startDate.ts);
    if (!isAllowedMonth(date, allowedMonths)) {
        // Add a month
        date = date.plus({ months: 1 });
        if (startNewMonthOnFirstDay) {
            date = date.set({ day: 1 });
        }
        date = nextAllowedMonth(date, allowedMonths, startNewMonthOnFirstDay);
    }
    return date;
};

/**
 * Find the next allowed day of the week, based on a starting date. If the date day is already allowed, returns the original date.
 *
 * @param {DateTime} startDate The date we start from.
 * @param {number[]} allowedMonths Array of allowed months. The months are represented by a number, starting from 0 for January, and ending with 11 for December.
 * @param {number[]} allowedDays Array of allowed days of the week. The days are represented by a number, starting from 0 for Sunday, and ending with 6 for Saturday.
 * @returns {DateTime} Date of the next allowed day of the week.
 */
const nextAllowedDay = (startDate, allowedMonths, allowedDays) => {
    let date = DateTime.fromMillis(startDate.ts);
    if (!isAllowedDay(date, allowedDays)) {
        // Add a day
        date = date
            .plus({ days: 1 })
            .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
        date = nextAllowedDay(date, allowedMonths, allowedDays);

        // If the next day available is another month, make sure the month is allowed
        if (date.diff(startDate, 'months') > 0) {
            date = nextAllowedMonth(date, allowedMonths);
            date = nextAllowedDay(date, allowedMonths, allowedDays);
        }
    }
    return date;
};

/**
 * Find the next allowed time, based on a starting date. If the date time is already allowed, returns the original date.
 *
 * @param {DateTime} startDate The date we start from.
 * @param {number[]} allowedMonths Array of allowed months. The months are represented by a number, starting from 0 for January, and ending with 11 for December.
 * @param {number[]} allowedDays Array of allowed days of the week. The days are represented by a number, starting from 0 for Sunday, and ending with 6 for Saturday.
 * @param {string[]} allowedTimeFrames Array of allowed time frames. Each time frame string must follow the pattern 'start-end', with start and end being ISO8601 formatted time strings.
 * @param {string} unit The time unit (hour or minute).
 * @param {number} span Duration of each unit span. For example, the value would be 30 if the time spans are 30 minutes long.
 * @returns {DateTime} Date of the next allowed time.
 */
const nextAllowedTime = (
    startDate,
    allowedMonths,
    allowedDays,
    allowedTimeFrames,
    unit,
    span
) => {
    let date = DateTime.fromMillis(startDate.ts);

    if (!isAllowedTime(date, allowedTimeFrames)) {
        // Go to next time slot
        date = addToDate(date, unit, span);
        date = nextAllowedTime(
            date,
            allowedMonths,
            allowedDays,
            allowedTimeFrames,
            unit,
            span
        );

        // If the next time available is in another day, make sure the day is allowed
        if (date.diff(startDate, 'day') > 0) {
            date = nextAllowedDay(date, allowedMonths, allowedDays);
            date = nextAllowedTime(
                date,
                allowedMonths,
                allowedDays,
                allowedTimeFrames,
                unit,
                span
            );
        }
    }

    return date;
};

/**
 * Find the previous allowed month, based on a starting date. If the date month is already allowed, returns the original date.
 *
 * @param {DateTime} startDate The date we start from.
 * @param {number[]} allowedMonths Array of allowed months. The months are represented by a number, starting from 0 for January, and ending with 11 for December.
 * @param {boolean} startNewMonthOnFirstDay If false, the original day of the date will be kept, even if the original date month is not allowed. Defaults to true.
 * @returns {DateTime} Date of the previous allowed month.
 */
const previousAllowedMonth = (
    startDate,
    allowedMonths,
    startNewMonthOnFirstDay = true
) => {
    let date = DateTime.fromMillis(startDate.ts);
    if (!isAllowedMonth(date, allowedMonths)) {
        // Remove a month
        date = removeFromDate(date, 'months', 1);
        if (startNewMonthOnFirstDay) {
            date = date.set({ day: 1 });
        }
        date = previousAllowedMonth(
            date,
            allowedMonths,
            startNewMonthOnFirstDay
        );
    }
    return date;
};

/**
 * Find the previous allowed day of the week, based on a starting date. If the date day is already allowed, returns the original date.
 *
 * @param {DateTime} startDate The date we start from.
 * @param {number[]} allowedMonths Array of allowed months. The months are represented by a number, starting from 0 for January, and ending with 11 for December.
 * @param {number[]} allowedDays Array of allowed days of the week. The days are represented by a number, starting from 0 for Sunday, and ending with 6 for Saturday.
 * @returns {DateTime} Date of the previous allowed day of the week.
 */
const previousAllowedDay = (startDate, allowedMonths, allowedDays) => {
    let date = DateTime.fromMillis(startDate.ts);
    if (!isAllowedDay(date, allowedDays)) {
        // Remove a day
        date = removeFromDate(date, 'days', 1).set({
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0
        });
        date = previousAllowedDay(date, allowedMonths, allowedDays);

        // If the previous day available is another month, make sure the month is allowed
        if (date.diff(startDate, 'months') < 0) {
            date = previousAllowedMonth(date, allowedMonths);
            date = previousAllowedDay(date, allowedMonths, allowedDays);
        }
    }
    return date;
};

/**
 * Find the previous allowed time, based on a starting date. If the date time is already allowed, returns the original date.
 *
 * @param {DateTime} startDate The date we start from.
 * @param {number[]} allowedMonths Array of allowed months. The months are represented by a number, starting from 0 for January, and ending with 11 for December.
 * @param {number[]} allowedDays Array of allowed days of the week. The days are represented by a number, starting from 0 for Sunday, and ending with 6 for Saturday.
 * @param {string[]} allowedTimeFrames Array of allowed time frames. Each time frame string must follow the pattern 'start-end', with start and end being ISO8601 formatted time strings.
 * @param {string} unit The time unit (hour or minute).
 * @param {number} span Duration of each unit span. For example, the value would be 30 if the time spans are 30 minutes long.
 * @returns {DateTime} Date of the previous allowed time.
 */
const previousAllowedTime = (
    startDate,
    allowedMonths,
    allowedDays,
    allowedTimeFrames,
    unit,
    span
) => {
    let date = DateTime.fromMillis(startDate.ts);

    if (!isAllowedTime(date, allowedTimeFrames)) {
        // Go to previous time slot
        date = removeFromDate(date, unit, span);
        date = previousAllowedTime(
            date,
            allowedMonths,
            allowedDays,
            allowedTimeFrames,
            unit,
            span
        );

        // If the previous time available is in another day, make sure the day is allowed
        if (date.diff(startDate, 'day') < 0) {
            date = previousAllowedDay(date, allowedMonths, allowedDays);
            date = previousAllowedTime(
                date,
                allowedMonths,
                allowedDays,
                allowedTimeFrames,
                unit,
                span
            );
        }
    }

    return date;
};

/**
 * Check if an interval of time contains allowed dates/times.
 *
 * @param {DateTime} start The starting date of the interval.
 * @param {DateTime} end The ending date of the interval.
 * @param {number[]} allowedMonths Array of allowed months. The months are represented by a number, starting from 0 for January, and ending with 11 for December.
 * @param {number[]} allowedDays Array of allowed days of the week. The days are represented by a number, starting from 0 for Sunday, and ending with 6 for Saturday.
 * @param {string[]} allowedTimeFrames Array of allowed time frames. Each time frame string must follow the pattern 'start-end', with start and end being ISO8601 formatted time strings.
 * @param {string} unit The time unit (minute, hour, day, week, month or year).
 * @param {number} span Duration of each unit span. For example, the value would be 30 if the time spans are 30 minutes long.
 * @returns {DateTime} Date of the next allowed time.
 */
const containsAllowedDateTimes = (
    start,
    end,
    allowedMonths,
    allowedDays,
    allowedTimeFrames,
    unit,
    span
) => {
    const firstAllowedMonth = nextAllowedMonth(start, allowedMonths);
    if (firstAllowedMonth > end) return false;

    const firstAllowedDay = nextAllowedDay(
        firstAllowedMonth,
        allowedMonths,
        allowedDays
    );
    if (firstAllowedDay > end) return false;

    if (unit === 'minute' || unit === 'hour') {
        const computedUnit = unit === 'minute' ? 'minute' : 'hour';
        const firstAllowedTime = nextAllowedTime(
            firstAllowedDay,
            allowedMonths,
            allowedDays,
            allowedTimeFrames,
            computedUnit,
            span
        );
        return firstAllowedTime < end;
    }

    return true;
};

export {
    addToDate,
    containsAllowedDateTimes,
    dateTimeObjectFrom,
    getWeekNumber,
    nextAllowedDay,
    nextAllowedMonth,
    nextAllowedTime,
    numberOfUnitsBetweenDates,
    previousAllowedDay,
    previousAllowedMonth,
    previousAllowedTime,
    removeFromDate
};
