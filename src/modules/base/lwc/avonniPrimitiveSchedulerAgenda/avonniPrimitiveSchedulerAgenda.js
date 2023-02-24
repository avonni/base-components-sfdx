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

import { api } from 'lwc';
import { addToDate, normalizeBoolean, normalizeString } from 'c/utilsPrivate';
import { Interval } from 'c/luxon';
import {
    getElementOnYAxis,
    isAllDay,
    isAllowedDay,
    nextAllowedDay,
    nextAllowedMonth,
    spansOnMoreThanOneDay,
    ScheduleBase
} from 'c/avonniSchedulerUtils';
import DayGroup from './avonniDayGroup';
import { classSet } from 'c/utils';

const DEFAULT_SELECTED_DATE = new Date();
const SIDE_PANEL_POSITIONS = {
    valid: ['left', 'right'],
    default: 'left'
};

/**
 * Main part of the scheduler, when the selected display is "agenda".
 *
 * @class
 * @descriptor c-primitive-scheduler-agenda
 * @extends ScheduleBase
 */
export default class AvonniPrimitiveSchedulerAgenda extends ScheduleBase {
    _hideResourcesFilter = false;
    _hideSidePanel = false;
    _selectedDate = DEFAULT_SELECTED_DATE;
    _sidePanelPosition = SIDE_PANEL_POSITIONS.default;

    _computedEvents = [];
    computedGroups = [];
    start;

    connectedCallback() {
        this.setStartToBeginningOfUnit();
        super.connectedCallback();
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Array of available days of the week. If present, the scheduler will only show the available days of the week. Defaults to all days being available.
     * The days are represented by a number, starting from 0 for Sunday, and ending with 6 for Saturday.
     * For example, if the available days are Monday to Friday, the value would be: `[1, 2, 3, 4, 5]`
     *
     * @type {number[]}
     * @public
     * @default [0, 1, ... , 5, 6]
     */
    @api
    get availableDaysOfTheWeek() {
        return super.availableDaysOfTheWeek;
    }
    set availableDaysOfTheWeek(value) {
        super.availableDaysOfTheWeek = value;

        if (this._connected) {
            this.setStartToBeginningOfUnit();
        }
    }

    /**
     * Array of available months. If present, the scheduler will only show the available months. Defaults to all months being available.
     * The months are represented by a number, starting from 0 for January, and ending with 11 for December.
     * For example, if the available months are January, February, June, July, August and December, the value would be: `[0, 1, 5, 6, 7, 11]`
     *
     * @type {number[]}
     * @public
     * @default [0, 1, … , 10, 11]
     */
    @api
    get availableMonths() {
        return super.availableMonths;
    }
    set availableMonths(value) {
        super.availableMonths = value;

        if (this._connected) {
            this.setStartToBeginningOfUnit();
        }
    }

    /**
     * If present, the resources filter is hidden.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get hideResourcesFilter() {
        return this._hideResourcesFilter;
    }
    set hideResourcesFilter(value) {
        this._hideResourcesFilter = normalizeBoolean(value);
    }

    /**
     * If present, the side panel will be hidden.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get hideSidePanel() {
        return this._hideSidePanel;
    }
    set hideSidePanel(value) {
        this._hideSidePanel = normalizeBoolean(value);
    }

    /**
     * Specifies the selected date/time on which the calendar should be centered. It can be a Date object, timestamp, or an ISO8601 formatted string.
     *
     * @type {(Date|number|string)}
     * @public
     * @default new Date()
     */
    @api
    get selectedDate() {
        return this._selectedDate;
    }
    set selectedDate(value) {
        this._selectedDate = this.createDate(value)
            ? value
            : DEFAULT_SELECTED_DATE;

        if (this._connected) {
            this.setStartToBeginningOfUnit();
            this.initLeftPanelCalendarDisabledDates();
        }
    }

    /**
     * Position of the side panel, relative to the schedule.
     *
     * @type {string}
     * @default left
     * @public
     */
    @api
    get sidePanelPosition() {
        return this._sidePanelPosition;
    }
    set sidePanelPosition(value) {
        this._sidePanelPosition = normalizeString(value, {
            fallbackValue: SIDE_PANEL_POSITIONS.default,
            validValues: SIDE_PANEL_POSITIONS.valid
        });
    }

    /**
     * Object used to set the duration of the timeline. It should have two keys:
     * * unit (minute, hour, day, week, month or year)
     * * span (number).
     *
     * @type {object}
     * @public
     * @default { unit: 'day', span: 1 }
     */
    @api
    get timeSpan() {
        return super.timeSpan;
    }
    set timeSpan(value) {
        super.timeSpan = value;

        if (this._connected) {
            this.setStartToBeginningOfUnit();
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
        return super.timezone;
    }
    set timezone(value) {
        super.timezone = value;

        if (this._connected) {
            this.setStartToBeginningOfUnit();
            this.initLeftPanelCalendarDisabledDates();
            this.initEvents();
        }
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Events computed by the `SchedulerEventData` class instance. The setter is called every time the events are refreshed in `_eventData`, allowing for the groups to be updated too.
     *
     * @type {object[]}
     */
    get computedEvents() {
        return this._computedEvents;
    }
    set computedEvents(value) {
        this._computedEvents = value;
        this.initEventGroups();
    }

    /**
     * Computed CSS classes for the right panel.
     *
     * @type {string}
     */
    get mainSectionClass() {
        return classSet(
            'avonni-scheduler__main-border_top avonni-scheduler__main-border_bottom avonni-scheduler__main-section slds-scrollable'
        )
            .add({
                'avonni-scheduler__main-border_left':
                    this.hideSidePanel || this.sidePanelPosition === 'right',
                'avonni-scheduler__main-border_right':
                    this.hideSidePanel || this.sidePanelPosition === 'left'
            })
            .toString();
    }

    /**
     * Computed resource options, displayed in the left panel as checkboxes.
     *
     * @type {object[]}
     */
    get resourceOptions() {
        return this.resources.map((res) => {
            const style = `
                --sds-c-checkbox-color-background-checked: ${res.color}; --slds-c-checkbox-color-border: ${res.color};
                --slds-c-checkbox-mark-color-foreground: #fff;
                --sds-c-checkbox-shadow-focus: 0 0 3px ${res.color};
                --slds-c-checkbox-color-border-focus: ${res.color};
            `;
            return {
                label: res.label || res.name,
                selected: this.selectedResources.includes(res.name),
                style,
                value: res.name
            };
        });
    }

    /**
     * Computed CSS classes for the side panel.
     *
     * @type {string}
     */
    get sidePanelClass() {
        return classSet(
            'avonni-scheduler__panel slds-scrollable avonni-scheduler__main-border_top avonni-scheduler__main-border_bottom'
        )
            .add({
                'avonni-scheduler__panel_collapsed': this._isCollapsed,
                'avonni-scheduler__panel_expanded': this._isExpanded,
                'avonni-scheduler__main-border_left':
                    this.sidePanelPosition === 'left' || !this.showSplitter,
                'avonni-scheduler__main-border_right':
                    this.sidePanelPosition === 'right' || !this.showSplitter
            })
            .toString();
    }

    /**
     * True if the left side panel should be visible.
     *
     * @type {boolean}
     */
    get showLeftPanel() {
        return !this.hideSidePanel && this.sidePanelPosition === 'left';
    }

    /**
     * True if the right side panel should be visible.
     *
     * @type {boolean}
     */
    get showRightPanel() {
        return !this.hideSidePanel && this.sidePanelPosition === 'right';
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Add a new event to the agenda, without necessarily saving it.
     *
     * @param {number} x Position of the new event on the X axis.
     * @param {number} y Position of the new event on the Y axis.
     * @param {boolean} saveEvent If true, the event will be saved.
     * @public
     */
    @api
    newEvent(detail = {}) {
        if (!this.firstSelectedResource) {
            return null;
        }
        const boundaries = this._eventData.getDraggingBoundaries();
        const x = isNaN(detail.x) ? boundaries.x : detail.x;
        const y = isNaN(detail.y) ? boundaries.y : detail.y;
        const dayGroupElement = getElementOnYAxis(
            this.template,
            y,
            '[data-element-id="div-day-group"]'
        );
        const from = this.createDate(Number(dayGroupElement.dataset.start));
        const to = this.createDate(Number(dayGroupElement.dataset.end));
        const resourceNames = [this.firstSelectedResource.name];
        this._eventData.newEvent(
            { from, resourceNames, to, x, y },
            detail.saveEvent
        );
        return this._eventData.selection;
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Initialize the event groups.
     */
    initEventGroups() {
        // Add the occurrences to each day it crosses in the map
        const dayMap = {};
        this.computedEvents.forEach((event) => {
            event.occurrences.forEach((occ) => {
                const from = occ.from;
                const to = event.referenceLine ? from.endOf('day') : occ.to;
                const interval = Interval.fromDateTimes(from, to);
                const days = interval.count('days');
                let date = from;

                for (let i = 0; i < days; i++) {
                    const isVisible = this.visibleInterval.contains(date);
                    const isAllowed = isAllowedDay(
                        date,
                        this.availableDaysOfTheWeek
                    );
                    if (!isVisible || !isAllowed) {
                        // Do not display the days outside of the visible interval
                        date = addToDate(date, 'day', 1);
                        continue;
                    }

                    const ISODay = date.startOf('day').toISO();

                    if (!dayMap[ISODay]) {
                        dayMap[ISODay] = [];
                    }
                    dayMap[ISODay].push({
                        ...occ,
                        endsInLaterCell: to.day > date.day,
                        event,
                        startsInPreviousCell: from.day < date.day,
                        time: this.formatTime(event, from, to)
                    });
                    date = addToDate(date, 'day', 1);
                }
            });
        });

        if (!Object.keys(dayMap).length) {
            this.computedGroups = [];
            return;
        }

        // Sort the days and create a group for each
        const days = Object.entries(dayMap).sort((a, b) => {
            return new Date(a[0]) - new Date(b[0]);
        });
        const groups = [];
        let currentMonth;
        days.forEach(([ISODay, events]) => {
            const date = this.createDate(ISODay);
            const today = this.createDate(new Date()).startOf('day');
            groups.push(
                new DayGroup({
                    date,
                    events,
                    isFirstDayOfMonth:
                        this.isYear && date.month !== currentMonth,
                    isToday: ISODay === today.toISO()
                })
            );
            currentMonth = date.month;
        });
        this.computedGroups = groups;
    }

    /**
     * Initialize the events.
     */
    initEvents() {
        super.initEvents();
        this._eventData.smallestHeader = { unit: 'hour', span: 1 };
        this._eventData.isAgenda = true;
        this._eventData.initEvents();
    }

    /**
     * Initialize the resources.
     */
    initResources() {
        this.computedResources = this.resources.map((res) => {
            return { ...res, height: 0, data: { res } };
        });
    }

    /**
     * Format an event time.
     *
     * @param {object} event Event of which the time should be formatted.
     * @param {DateTime} from Starting date of the event.
     * @param {DateTime} to Ending date of the event.
     * @returns {string} Formatted time describing the event duration.
     */
    formatTime(event, from, to) {
        if (event.referenceLine) {
            return from.toFormat('t');
        } else if (isAllDay(event, from, to)) {
            return 'All Day';
        } else if (spansOnMoreThanOneDay(event, from, to)) {
            return `${from.toFormat('dd LLL')} - ${to.toFormat('dd LLL')}`;
        }
        return `${from.toFormat('t')} - ${to.toFormat('t')}`;
    }

    /**
     * Set the selected date to the first available date.
     */
    setSelectedDateToAvailableDate() {
        this._selectedDate = nextAllowedMonth(
            this.selectedDate,
            this.availableMonths
        );
        this._selectedDate = nextAllowedDay(
            this.selectedDate,
            this.availableMonths,
            this.availableDaysOfTheWeek
        );
    }

    /**
     * Set the starting date of the agenda.
     */
    setStartToBeginningOfUnit() {
        super.setStartToBeginningOfUnit();

        const { span, unit } = this.timeSpan;
        if (unit === 'month') {
            this.start = this.selectedDate.startOf('month');
        }

        const end = this.createDate(addToDate(this.start, unit, span) - 1);
        this.visibleInterval = Interval.fromDateTimes(this.start, end);
        this.dispatchVisibleIntervalChange(this.start, this.visibleInterval);
        this.initEvents();
    }

    /*
     * ------------------------------------------------------------
     *  EVENT HANDLERS AND DISPATCHERS
     * -------------------------------------------------------------
     */

    handleClick(event) {
        const { start, end } = event.currentTarget.dataset;
        this.dispatchScheduleClick({ from: start, to: end });
    }

    handleEmptySpotContextMenu(event) {
        if (!this.firstSelectedResource) {
            return;
        }

        super.handleEmptySpotContextMenu(event);
    }
}
