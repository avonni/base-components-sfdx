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

import {
    deepCopy,
    normalizeArray,
    normalizeBoolean,
    normalizeString,
    addToDate,
    dateTimeObjectFrom
} from 'c/utilsPrivate';
import { generateUUID } from 'c/utils';
import { Interval } from 'c/luxon';
import { SchedulerEventOccurrence } from './avonniEventOccurrence';
import { containsAllowedDateTimes } from './avonniDateComputations';
import {
    DEFAULT_AVAILABLE_DAYS_OF_THE_WEEK,
    DEFAULT_AVAILABLE_MONTHS,
    DEFAULT_AVAILABLE_TIME_FRAMES,
    DEFAULT_EVENTS_LABELS,
    RECURRENCES,
    EVENTS_THEMES,
    REFERENCE_LINE_VARIANTS
} from './avonniDefaults';

/**
 * @class
 * @param {boolean} allDay If true, the event will be applied to the whole day(s). Defaults to false.
 *
 * @param {number[]} availableDaysOfTheWeek Array of available days of the week. The days are represented by a number, starting from 0 for Sunday, and ending with 6 for Saturday.
 *
 * @param {number[]} availableMonths Array of available months. The months are represented by a number, starting from 0 for January, and ending with 11 for December.
 *
 * @param {string[]} availableTimeFrames Array of available time frames. Each time frame string must follow the pattern 'start-end', with start and end being ISO8601 formatted time strings.
 *
 * @param {string} color Custom color for the event. If present, it will overwrite the default color. It has to be a Hexadecimal or an RGB color.
 *
 * @param {object} data Original event object. It is used to generate labels based on custom fields.
 *
 * @param {boolean} disabled If true, the event will be considered a disabled date/time. Defaults to false.
 *
 * @param {(Date|number|string)} from Required. Start of the event. It can be a Date object, timestamp, or an ISO8601 formatted string.
 *
 * @param {string} iconName The Lightning Design System name of the icon used if the event is disabled. Names are written in the format utility:user. The icon is appended to the left of the title.
 *
 * @param {string[]} resourceNames Required. Array of unique resource IDs. The event will be shown in the scheduler for each of these resources.
 *
 * @param {object} labels Labels of the events. See Scheduler for more details on the structure.
 *
 * @param {string} name Required. Unique name for the event. It will be returned by the eventclick and actionclick events.
 *
 * @param {string} recurrence Recurrence of the event. Valid values include daily, weekly, monthly and yearly.
 *
 * @param {object} recurrenceAttributes Attributes specific to the recurrence type (see Scheduler for more details).
 *
 * @param {number} recurrenceCount Number of times the event will be repeated before the recurrence stops.
 * If a recurrenceEndDate is also given, the earliest ending date will be used.
 *
 * @param {(Date|number|string)} recurrenceEndDate End of the recurrence. It can be a Date object, timestamp, or an ISO8601 formatted string.
 * If a recurrenceCount is also given, the earliest ending date will be used.
 *
 * @param {boolean} referenceLine If true, the event will be displayed as a reference line. Defaults to false.
 *
 * @param {DateTime} schedulerEnd Required for recurring events. Ending date of the scheduler.
 *
 * @param {DateTime} schedulerStart Starting date of the scheduler.
 *
 * @param {string[]} selectedResources Array of selected resources name. If present, only the occurrences belonging to these resources will be created.
 *
 * @param {SchedulerHeader} smallestHeader Required. Scheduler header with the smallest unit.
 *
 * @param {string} theme Custom theme for the event. If present, it will overwrite the default event theme. Valid values include default, transparent, line, hollow and rounded.
 *
 * @param {string} timezone Time zone of the event, in a valid IANA format.
 *
 * @param {string} title Title of the event.
 *
 * @param {(Date|number|string)} to Required if allDay is not true. End of the event. It can be a Date object, timestamp, or an ISO8601 formatted string.
 *
 */

export default class AvonniSchedulerEvent {
    constructor(props) {
        this.timezone = props.timezone;
        this.key = generateUUID();
        this.allDay = props.allDay;
        this.availableMonths = props.availableMonths;
        this.availableDaysOfTheWeek = props.availableDaysOfTheWeek;
        this.availableTimeFrames = props.availableTimeFrames;
        this.color = props.color;
        this.data = props.data;
        this.disabled = props.disabled;
        this.schedulerEnd = props.schedulerEnd;
        this.schedulerStart = props.schedulerStart;
        this.selectedResources = normalizeArray(props.selectedResources);
        this.smallestHeader = props.smallestHeader;
        this.from = props.from;
        this.to = props.to;
        this.iconName = props.iconName;
        this.resourceNames = props.resourceNames;
        this.labels = props.labels || DEFAULT_EVENTS_LABELS;
        this.referenceLine = props.referenceLine;
        this.recurrence = props.recurrence;
        this.recurrenceAttributes = props.recurrenceAttributes;
        this.recurrenceCount = props.recurrenceCount;
        this.recurrenceEndDate = props.recurrenceEndDate;
        this.name = props.name;
        this.theme = props.theme;
        this.title = props.title;

        this.initOccurrences();
    }

    get allDay() {
        return this._allDay;
    }
    set allDay(value) {
        this._allDay = normalizeBoolean(value);
    }

    get availableDaysOfTheWeek() {
        return this._availableDaysOfTheWeek;
    }
    set availableDaysOfTheWeek(value) {
        this._availableDaysOfTheWeek = normalizeArray(value).length
            ? normalizeArray(value)
            : DEFAULT_AVAILABLE_DAYS_OF_THE_WEEK;
    }

    get availableMonths() {
        return this._availableMonths;
    }
    set availableMonths(value) {
        this._availableMonths = normalizeArray(value).length
            ? normalizeArray(value)
            : DEFAULT_AVAILABLE_MONTHS;
    }

    get availableTimeFrames() {
        return this._availableTimeFrames;
    }
    set availableTimeFrames(value) {
        this._availableTimeFrames = normalizeArray(value).length
            ? normalizeArray(value)
            : DEFAULT_AVAILABLE_TIME_FRAMES;
    }

    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    get from() {
        return this._from;
    }
    set from(value) {
        this._from = this.createDate(value);
    }

    get resourceNames() {
        return this._resourceNames;
    }
    set resourceNames(value) {
        this._resourceNames = JSON.parse(JSON.stringify(normalizeArray(value)));
    }

    get name() {
        return this._name;
    }
    set name(value) {
        this._name =
            value ||
            (!this.referenceLine && !this.disabled && 'new-event') ||
            'disabled';
    }

    get recurrence() {
        return this._recurrence;
    }
    set recurrence(value) {
        const recurrence = RECURRENCES.find(
            (recurrenceObject) => recurrenceObject.name === value
        );
        this._recurrence = recurrence || undefined;
    }

    get recurrenceAttributes() {
        return this._recurrenceAttributes;
    }
    set recurrenceAttributes(value) {
        this._recurrenceAttributes =
            typeof value === 'object' ? value : undefined;
    }

    get recurrenceCount() {
        return this._recurrenceCount;
    }
    set recurrenceCount(value) {
        this._recurrenceCount = Number.isInteger(value) ? value : Infinity;
    }

    get recurrenceEndDate() {
        return this._recurrenceEndDate;
    }
    set recurrenceEndDate(value) {
        this._recurrenceEndDate = this.createDate(value);
    }

    get referenceLine() {
        return this._referenceLine;
    }
    set referenceLine(value) {
        this._referenceLine = normalizeBoolean(value);
    }

    get schedulerEnd() {
        return this._schedulerEnd;
    }
    set schedulerEnd(value) {
        this._schedulerEnd = this.createDate(value);
    }

    get schedulerStart() {
        return this._schedulerStart;
    }
    set schedulerStart(value) {
        this._schedulerStart = this.createDate(value);
    }

    get theme() {
        return this._theme;
    }
    set theme(value) {
        this._theme = normalizeString(value, {
            fallbackValue: this.referenceLine
                ? REFERENCE_LINE_VARIANTS.default
                : EVENTS_THEMES.default,
            validValues: this.referenceLine
                ? REFERENCE_LINE_VARIANTS.valid
                : EVENTS_THEMES.valid
        });
    }

    get to() {
        return this._to;
    }
    set to(value) {
        this._to = this.createDate(value);
    }

    /**
     * Computed starting date of the event.
     *
     * @type {DateTime}
     */
    get computedFrom() {
        const from = this.allDay ? this.from.startOf('day') : this.from;
        return !this.schedulerStart ||
            this.recurrence ||
            from > this.schedulerStart
            ? from
            : this.schedulerStart;
    }

    /**
     * Computed ending date of the event.
     *
     * @type {DateTime}
     */
    get computedTo() {
        let to = this.to;

        if (this.allDay && to) {
            to = to.endOf('day');
        } else if (this.from && (this.allDay || to < this.from)) {
            to = this.from.endOf('day');
        }

        return !this.schedulerEnd || this.recurrence || to < this.schedulerEnd
            ? to
            : this.schedulerEnd;
    }

    /**
     * Create the event occurrences.
     */
    initOccurrences() {
        this.occurrences = [];

        // Leave occurrences empty if we miss one needed property
        if (
            !this.from ||
            !this.computedTo ||
            !this.smallestHeader ||
            !this.availableDaysOfTheWeek ||
            !this.availableMonths ||
            !this.availableTimeFrames
        )
            return;

        if (this.recurrence) {
            this.computeRecurrence();
        } else {
            this.addOccurrence(this.computedFrom, this.computedTo);
        }
    }

    /**
     * Create one occurrence of the event from the starting and ending dates. If it is valid, push the occurrence in the occurrences property.
     *
     * @param {DateTime} from Starting date of the occurrence.
     * @param {DateTime} to Ending date of the occurrence.
     */
    addOccurrence(from, to) {
        const { schedulerEnd, schedulerStart, resourceNames } = this;
        const computedTo = to || this.computeOccurenceEnd(from);

        if (
            (schedulerStart &&
                from < schedulerStart &&
                computedTo < schedulerStart) ||
            (schedulerEnd && from > schedulerEnd && computedTo > schedulerEnd)
        )
            return;

        const containsAllowedTimes = containsAllowedDateTimes(
            from,
            computedTo,
            this.availableMonths,
            this.availableDaysOfTheWeek,
            this.availableTimeFrames,
            this.smallestHeader.unit,
            this.smallestHeader.span
        );

        if (containsAllowedTimes) {
            if (this.referenceLine) {
                const key = `${this.title}-${this.occurrences.length}`;
                this.occurrences.push(
                    new SchedulerEventOccurrence({
                        eventKey: this.key,
                        from,
                        to,
                        key,
                        title: this.title
                    })
                );
            } else {
                resourceNames.forEach((name) => {
                    if (
                        !this.selectedResources.length ||
                        this.selectedResources.includes(name)
                    ) {
                        this.occurrences.push(
                            new SchedulerEventOccurrence({
                                availableDaysOfTheWeek:
                                    this.availableDaysOfTheWeek,
                                availableMonths: this.availableMonths,
                                eventKey: this.key,
                                from,
                                key: `${this.name}-${name}-${from.ts}`,
                                resourceName: name,
                                resourceNames,
                                title: this.title,
                                to: computedTo
                            })
                        );
                    }
                });
            }
        }
    }

    /**
     * Create a Luxon DateTime object from a date, including the timezone.
     *
     * @param {string|number|Date} date Date to convert.
     * @returns {DateTime|boolean} Luxon DateTime object or false if the date is invalid.
     */
    createDate(date) {
        return dateTimeObjectFrom(date, { zone: this.timezone });
    }

    /**
     * Remove an occurrence from the occurrences property.
     *
     * @param {string} key The unique key of the occurrence that should be removed.
     */
    removeOccurrence(key) {
        const index = this.occurrences.findIndex((occ) => occ.key === key);
        this.occurrences.splice(index, 1);
    }

    /**
     * Compute the occurrence end when the event is recurrent.
     *
     * @param {DateTime} start Starting time of the occurrence.
     * @returns {DateTime} Ending date/time of the occurrence.
     */
    computeOccurenceEnd(start) {
        const { recurrence, recurrenceAttributes } = this;
        const from = this.computedFrom;
        const to = this.computedTo;

        const hours = to.hour < from.hour ? 23 : to.hour;
        const minutes =
            hours === from.hour && to.minute < from.minute ? 59 : to.minute;
        const seconds =
            hours === from.hour &&
            minutes === from.minute &&
            to.second < from.second
                ? 59
                : to.second;
        let end;

        switch (recurrence.name) {
            case 'weekly': {
                // If weekdays are given, the event will span on one day
                // Else, the event can span on several days
                const weekdays =
                    recurrenceAttributes &&
                    recurrenceAttributes.weekdays &&
                    recurrenceAttributes.weekdays.length;

                if (weekdays) {
                    end = start.set({
                        hours: to.hour,
                        minutes: to.minute,
                        seconds: to.second
                    });

                    // If "to" has no time (00:00:00) or its time is before start,
                    // the event will span on the whole day
                    if (to.ts === to.startOf('day').ts || end < start) {
                        end = start.endOf('day');
                    }
                } else {
                    end = start.set({
                        weekday: to.weekday,
                        hours: to.hour,
                        minutes: to.minute,
                        seconds: to.second
                    });
                }
                break;
            }
            case 'monthly':
                end = to.set({
                    month: start.month,
                    year: start.year
                });
                break;
            case 'yearly':
                end = to.set({
                    year: start.year
                });
                break;
            default:
                // The event can only span on one day, even if "from" and "to" are on different dates
                end = start.set({ hours, minutes, seconds });
                break;
        }
        if (this.referenceLine && end.ts === start.ts) {
            end = addToDate(end, 'minute', 1);
        }
        return end;
    }

    /**
     * Compute the recurrence to create the occurrences.
     */
    computeRecurrence() {
        const { recurrence, schedulerEnd } = this;
        const from = this.computedFrom;
        const endDate = this.recurrenceEndDate;
        const attributes = this.recurrenceAttributes;
        const interval =
            attributes && attributes.interval ? attributes.interval : 1;
        const count = this.recurrenceCount;

        // Use the recurrence end date only if it happens before the scheduler end
        let end =
            !schedulerEnd || (endDate && endDate < schedulerEnd)
                ? endDate
                : schedulerEnd;

        let date = from;
        let occurrences = 0;

        switch (recurrence.name) {
            case 'daily': {
                while (date <= end && occurrences < count) {
                    this.addOccurrence(date);
                    date = addToDate(date, 'day', interval);
                    occurrences += 1;
                }
                break;
            }
            case 'weekly': {
                const normalizedWeekdays = normalizeArray(
                    attributes && attributes.weekdays
                );
                const weekdays = deepCopy(normalizedWeekdays);

                let weekdayIndex;
                if (weekdays.length) {
                    // Transform 0 into 7 because Luxon's week start on Monday = 1 instead of Sunday = 0
                    const sundayIndex = weekdays.findIndex((day) => day === 0);
                    if (sundayIndex >= 0) {
                        weekdays[sundayIndex] = 7;
                    }
                    weekdays.sort();

                    // Set the starting week day
                    let startingDate = this.createDate(from);
                    while (weekdayIndex === undefined) {
                        for (let i = 0; i < weekdays.length; i++) {
                            date = startingDate.set({ weekday: weekdays[i] });
                            if (date >= from) {
                                weekdayIndex = i;
                                break;
                            }
                        }

                        // If the first weekday is before the starting date,
                        // go to the next week
                        if (weekdayIndex === undefined) {
                            startingDate = addToDate(
                                startingDate,
                                'week',
                                1
                            ).startOf('week');
                        }
                    }
                } else {
                    weekdays.push(from.weekday);
                }

                while (date <= end && occurrences < count) {
                    while (
                        weekdayIndex < weekdays.length &&
                        date <= end &&
                        occurrences < count
                    ) {
                        this.addOccurrence(date);
                        occurrences += 1;
                        weekdayIndex += 1;

                        const nextStart = date.set({
                            weekday: weekdays[weekdayIndex]
                        });

                        if (nextStart <= date) {
                            date = addToDate(date, 'week', interval).set({
                                weekday: weekdays[0]
                            });
                        } else {
                            date = nextStart;
                        }
                    }
                    weekdayIndex = 0;
                }
                break;
            }
            case 'monthly': {
                // If sameDaySameWeek is true,
                // the event will be repeated every month, on the same occurrence of the from week day.
                // For example, monthly, on the third Sunday
                if (attributes && attributes.sameDaySameWeek) {
                    // Find the first occurrence of the week day (Sunday, Monday, etc.)
                    const startOfMonth = from.set({ day: 1 });
                    const dayOfWeek = startOfMonth.set({
                        weekday: from.weekday
                    });
                    let currentWeek =
                        dayOfWeek < startOfMonth
                            ? addToDate(dayOfWeek, 'week', 1)
                            : dayOfWeek;

                    // Get the number of weeks between the first occurrence of this
                    // week day in the month, and the start date
                    let weekCount = 1;
                    while (currentWeek < from) {
                        currentWeek = addToDate(currentWeek, 'week', 1);
                        weekCount += 1;
                    }

                    let to = this.createDate(this.to.ts);
                    const daysDuration = Math.floor(
                        Interval.fromDateTimes(date, to).length('days')
                    );

                    while (date < end && occurrences < count) {
                        this.addOccurrence(date, to);

                        // Go to the next month of the recurrence
                        const startOfNextMonth = addToDate(
                            date,
                            'month',
                            interval
                        ).set({ day: 1 });
                        const nextDayOfWeek = startOfNextMonth.set({
                            weekday: from.weekday
                        });
                        // Set the date to the first occurrence of the week day in the next month
                        date =
                            nextDayOfWeek < startOfNextMonth
                                ? addToDate(nextDayOfWeek, 'week', 1)
                                : nextDayOfWeek;

                        // Add the number of weeks needed to get to the right occurrence of this week day in the month
                        for (let i = 1; i < weekCount; i++) {
                            date = addToDate(date, 'week', 1);
                        }
                        // Update the end date
                        to = addToDate(date, 'day', daysDuration);
                        to = to.set({
                            hours: this.to.hour,
                            minutes: this.to.minute
                        });
                        occurrences += 1;
                    }

                    // If sameDaySameWeek is false,
                    // the event will be repeated every month, on the same day number.
                    // For example, every month, on the 4th
                } else {
                    while (date < end && occurrences < count) {
                        this.addOccurrence(date);
                        date = addToDate(date, 'month', interval).set({
                            day: from.day
                        });
                        occurrences += 1;
                    }
                }
                break;
            }
            case 'yearly': {
                while (date < end && occurrences < count) {
                    this.addOccurrence(date);
                    date = addToDate(date, 'year', interval);
                    occurrences += 1;
                }
                break;
            }
            default:
                break;
        }
    }
}
