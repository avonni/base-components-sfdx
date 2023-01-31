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
    deepCopy,
    getStartOfWeek,
    normalizeArray,
    normalizeBoolean,
    normalizeString
} from 'c/utilsPrivate';
import { classSet, generateUUID } from 'c/utils';
import {
    DEFAULT_AVAILABLE_DAYS_OF_THE_WEEK,
    DEFAULT_AVAILABLE_MONTHS,
    DEFAULT_AVAILABLE_TIME_FRAMES,
    DEFAULT_DATE_FORMAT,
    DEFAULT_EVENTS_LABELS,
    DEFAULT_NEW_EVENT_TITLE,
    DEFAULT_TIME_SPAN,
    EDIT_MODES,
    EVENTS_THEMES
} from './avonniDefaults';
import EventData from './avonniEventData';
import {
    getDisabledWeekdaysLabels,
    getFirstAvailableWeek
} from './avonniDateComputations';

/**
 * Base parent, extended by the primitive scheduler calendar, timeline and agenda.
 *
 * @class
 */
export class ScheduleBase extends LightningElement {
    /**
     * Alternative text of the loading spinner.
     *
     * @type {string}
     * @public
     */
    @api loadingStateAlternativeText;

    _availableDaysOfTheWeek = DEFAULT_AVAILABLE_DAYS_OF_THE_WEEK;
    _availableMonths = DEFAULT_AVAILABLE_MONTHS;
    _availableTimeFrames = DEFAULT_AVAILABLE_TIME_FRAMES;
    _availableTimeSpans = [];
    _collapseDisabled = false;
    _dateFormat = DEFAULT_DATE_FORMAT;
    _events = [];
    _eventsLabels = DEFAULT_EVENTS_LABELS;
    _eventsTheme = EVENTS_THEMES.default;
    _newEventTitle = DEFAULT_NEW_EVENT_TITLE;
    _readOnly = false;
    _recurrentEditModes = EDIT_MODES;
    _resizeColumnDisabled = false;
    _resources = [];
    _selectedResources = [];
    _timeSpan = DEFAULT_TIME_SPAN;
    _timezone;
    _zoomToFit = false;

    _connected = false;
    _isCollapsed = false;
    _isExpanded = false;
    _resizeObserver;
    navCalendarDisabledWeekdays = [];
    navCalendarDisabledDates = [];

    connectedCallback() {
        this.initResources();
        this.initLeftPanelCalendarDisabledDates();
        this._connected = true;
    }

    disconnectedCallback() {
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
        }
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
        return this._availableDaysOfTheWeek;
    }
    set availableDaysOfTheWeek(value) {
        const days = deepCopy(normalizeArray(value)).sort((a, b) => a - b);
        this._availableDaysOfTheWeek =
            days.length > 0 ? days : DEFAULT_AVAILABLE_DAYS_OF_THE_WEEK;

        if (this._connected) {
            this._eventData.updateAllEventsDefaults();
            this.initLeftPanelCalendarDisabledDates();
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
        return this._availableMonths;
    }
    set availableMonths(value) {
        const months = deepCopy(normalizeArray(value)).sort((a, b) => a - b);
        this._availableMonths =
            months.length > 0 ? months : DEFAULT_AVAILABLE_MONTHS;

        if (this._connected) {
            this._eventData.updateAllEventsDefaults();
        }
    }

    /**
     * Array of available time frames. If present, the scheduler will only show the available time frames. Defaults to the full day being available.
     * Each time frame string must follow the pattern ‘start-end’, with start and end being ISO8601 formatted time strings.
     * For example, if the available times are from 10am to 12pm, and 2:30pm to 6:45pm, the value would be: `['10:00-11:59', '14:30-18:44']`
     *
     * @type {string[]}
     * @public
     * @default ['00:00-23:59']
     */
    @api
    get availableTimeFrames() {
        return this._availableTimeFrames;
    }
    set availableTimeFrames(value) {
        const timeFrames = normalizeArray(value);
        this._availableTimeFrames =
            timeFrames.length > 0 ? timeFrames : DEFAULT_AVAILABLE_TIME_FRAMES;

        if (this._connected) {
            this._eventData.updateAllEventsDefaults();
        }
    }

    /**
     * Array of available time spans. Each time span object must have the following properties:
     * * unit: The unit of the time span.
     * * span: The span of the time span.
     *
     * @type {object[]}
     * @public
     */
    @api
    get availableTimeSpans() {
        return this._availableTimeSpans;
    }
    set availableTimeSpans(value) {
        this._availableTimeSpans = normalizeArray(value, 'object');
    }

    /**
     * If present, the schedule column is not collapsible or expandable.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get collapseDisabled() {
        return this._collapseDisabled;
    }
    set collapseDisabled(value) {
        this._collapseDisabled = normalizeBoolean(value);
    }

    /**
     * The date format to use in the events' details popup and the labels. See [Luxon’s documentation](https://moment.github.io/luxon/#/formatting?id=table-of-tokens) for accepted format. If you want to insert text in the label, you need to escape it using single quote.
     * For example, the format of "Jan 14 day shift" would be `"LLL dd 'day shift'"`.
     *
     * @type {string}
     * @public
     * @default ff
     */
    @api
    get dateFormat() {
        return this._dateFormat;
    }
    set dateFormat(value) {
        this._dateFormat =
            value && typeof value === 'string' ? value : DEFAULT_DATE_FORMAT;
    }

    /**
     * Array of event objects.
     *
     * @type {object[]}
     * @public
     */
    @api
    get events() {
        return this._events;
    }
    set events(value) {
        this._events = normalizeArray(value, 'object');

        if (this._connected) {
            this.initEvents();
        }
    }

    /**
     * Labels of the events. Valid keys include:
     * * top
     * * bottom
     * * left
     * * right
     * * center
     * The value of each key should be a label object.
     * Top, bottom, left and right labels are only supported for the timeline display with a horizontal variant.
     *
     * @type {object}
     * @public
     * @default {
     *   center: {
     *      fieldName: 'title'
     *   }
     * }
     */
    @api
    get eventsLabels() {
        return this._eventsLabels;
    }
    set eventsLabels(value) {
        this._eventsLabels =
            typeof value === 'object' ? value : DEFAULT_EVENTS_LABELS;

        if (this._connected) {
            this._eventData.eventsLabels = this._eventsLabels;
            this._eventData.updateAllEventsDefaults();
        }
    }

    /**
     * Theme of the events. Valid values include default, transparent, line, hollow and rounded.
     *
     * @type {string}
     * @public
     * @default default
     */
    @api
    get eventsTheme() {
        return this._eventsTheme;
    }
    set eventsTheme(value) {
        this._eventsTheme = normalizeString(value, {
            fallbackValue: EVENTS_THEMES.default,
            validValues: EVENTS_THEMES.valid
        });

        if (this._connected) {
            this._eventData.eventsTheme = this._eventsTheme;
            this._eventData.updateAllEventsDefaults();
        }
    }

    /**
     * Default title of the new events.
     *
     * @type {string}
     * @public
     * @default New event
     */
    @api
    get newEventTitle() {
        return this._newEventTitle;
    }
    set newEventTitle(value) {
        this._newEventTitle =
            typeof value === 'string' ? value : DEFAULT_NEW_EVENT_TITLE;

        if (this._eventData) {
            this._eventData.newEventTitle = this._newEventTitle;
        }
    }

    /**
     * If present, the scheduler is not editable. The events cannot be dragged and the default actions (edit, delete and add event) will be hidden from the context menus.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get readOnly() {
        return this._readOnly;
    }
    set readOnly(value) {
        this._readOnly = normalizeBoolean(value);
    }

    /**
     * Allowed edition modes for recurring events. Available options are:
     * * `all`: All recurrent event occurrences will be updated when a change is made to one occurrence.
     * * `one`: Only the selected occurrence will be updated when a change is made.
     *
     * @type {string[]}
     * @public
     * @default ['all', 'one']
     */
    @api
    get recurrentEditModes() {
        return this._recurrentEditModes;
    }
    set recurrentEditModes(value) {
        const modes = normalizeArray(value);
        this._recurrentEditModes = modes.filter((mode) => {
            return EDIT_MODES.includes(mode);
        });

        if (!this._recurrentEditModes.length) {
            this._recurrentEditModes = EDIT_MODES;
        }

        if (this._eventData) {
            this._eventData.recurrentEditModes = this._recurrentEditModes;
        }
    }

    /**
     * If present, column resizing is disabled.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get resizeColumnDisabled() {
        return this._resizeColumnDisabled;
    }
    set resizeColumnDisabled(value) {
        this._resizeColumnDisabled = normalizeBoolean(value);
    }

    /**
     * Array of resource objects. The resources can be bound to events.
     *
     * @type {object[]}
     * @public
     * @required
     */
    @api
    get resources() {
        return this._resources;
    }
    set resources(value) {
        this._resources = normalizeArray(value, 'object');

        if (this._connected) {
            this.initResources();
        }
    }

    /**
     * Array of selected resources names. Only the events of the selected resources will be visible.
     *
     * @type {string[]}
     * @public
     */
    @api
    get selectedResources() {
        return this._selectedResources;
    }
    set selectedResources(value) {
        this._selectedResources = normalizeArray(value, 'string');

        if (this._connected) {
            this._eventData.selectedResources = this._selectedResources;
            this.initEvents();
        }
    }

    /**
     * Object used to set the duration of the schedule. It should have two keys:
     * * unit (minute, hour, day, week, month or year)
     * * span (number).
     *
     * @type {object}
     * @public
     * @default { unit: 'day', span: 1 }
     */
    @api
    get timeSpan() {
        return this._timeSpan;
    }
    set timeSpan(value) {
        this._timeSpan = typeof value === 'object' ? value : DEFAULT_TIME_SPAN;
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
            this._eventData.updateAllEventsDefaults();
        }
    }

    /**
     * If present, horizontal scrolling will be prevented in the timeline view.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get zoomToFit() {
        return this._zoomToFit;
    }
    set zoomToFit(value) {
        this._zoomToFit = normalizeBoolean(value);
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Selected date as a Luxon DateTime object, including the timezone.
     *
     * @type {DateTime}
     */
    get computedSelectedDate() {
        return this.createDate(this.selectedDate);
    }

    /**
     * First column HTML Element.
     *
     * @type {HTMLElement}
     */
    get panelElement() {
        return this.template.querySelector('[data-element-id="div-panel"]');
    }

    /**
     * First selected resource object.
     *
     * @type {object}
     */
    get firstSelectedResource() {
        return this.resources.find((res) => {
            return this.selectedResources.includes(res.name);
        });
    }

    /**
     * True if the day display is used.
     *
     * @type {boolean}
     */
    get isDay() {
        const { span, unit } = this.timeSpan;
        return unit === 'day' && span < 7;
    }

    /**
     * True if the month display is used.
     *
     * @type {boolean}
     */
    get isMonth() {
        const { span, unit } = this.timeSpan;
        const manyDays = unit === 'day' && span > 7;
        const manyWeeks = unit === 'week' && span > 1 && span <= 4;
        const oneMonth = unit === 'month' && span <= 1;
        return oneMonth || manyWeeks || manyDays;
    }

    /**
     * True if the week display is used.
     *
     * @type {boolean}
     */
    get isWeek() {
        const { span, unit } = this.timeSpan;
        return (unit === 'week' && span <= 1) || (unit === 'day' && span === 7);
    }

    /**
     * True if the year display is used.
     *
     * @type {boolean}
     */
    get isYear() {
        const { span, unit } = this.timeSpan;
        return unit === 'year' || (unit === 'month' && span > 1);
    }

    /**
     * True if the splitter bar should be visible.
     *
     * @type {boolean}
     * @default false
     */
    get showSplitter() {
        return !this.collapseDisabled || !this.resizeColumnDisabled;
    }

    /**
     * True if the splitter collapse button should be visible.
     *
     * @type {boolean}
     */
    get showSplitterCollapse() {
        return !this.collapseDisabled && !this._isCollapsed;
    }

    /**
     * True if the splitter expand button should be visible.
     *
     * @type {boolean}
     */
    get showSplitterExpand() {
        return !this.collapseDisabled && !this._isExpanded;
    }

    /**
     * True if the splitter resize handle should be visible.
     *
     * @type {boolean}
     */
    get showSplitterResize() {
        return (
            !this.resizeColumnDisabled &&
            !this._isCollapsed &&
            !this._isExpanded
        );
    }

    /**
     * Computed CSS classes for the splitter.
     *
     * @type {boolean}
     */
    get splitterClass() {
        return classSet(
            'avonni-scheduler__splitter slds-grid slds-grid_vertical slds-grid_align-center slds-grid_vertical-align-center avonni-scheduler__main-border_top avonni-scheduler__main-border_bottom'
        )
            .add({
                'avonni-scheduler__splitter_resizable': this.showSplitterResize,
                'avonni-scheduler__border_left': !this._isCollapsed,
                'avonni-scheduler__border_right': !this._isExpanded
            })
            .toString();
    }

    /**
     * Automatically generated unique key.
     *
     * @type {string}
     */
    get uniqueKey() {
        return generateUUID();
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Clear the selected event.
     *
     * @param {boolean} cancelNewEvent If true and a new event was being created, the new event will be canceled.
     * @public
     */
    @api
    cleanSelection(cancelNewEvent) {
        this._eventData.cleanSelection(cancelNewEvent);
        this._eventData.refreshEvents();
    }

    @api
    collapseSidePanel() {
        if (this._isExpanded) {
            this._isExpanded = false;
        } else {
            this._isCollapsed = true;
        }

        if (this.panelElement) {
            this.panelElement.style.flexBasis = null;
        }
    }

    /**
     * Create a new event.
     *
     * @param {object} event New event object.
     * @public
     */
    @api
    createEvent(event) {
        this._eventData.createEvent(event);
    }

    /**
     * Delete an event.
     *
     * @param {string} name Unique name of the event to delete.
     * @public
     */
    @api
    deleteEvent(name) {
        this._eventData.deleteEvent(name);
    }

    @api
    expandSidePanel() {
        if (this._isCollapsed) {
            this._isCollapsed = false;
        } else {
            this._isExpanded = true;
        }

        if (this.panelElement) {
            this.panelElement.style.flexBasis = null;
        }
    }

    /**
     * Set the focus on an event.
     *
     * @param {string} name Unique name of the event to set the focus on.
     * @public
     */
    @api
    focusEvent(name) {
        const event = this.template.querySelector(
            `[data-element-id^="avonni-primitive-scheduler-event-occurrence"][data-event-name="${name}"]`
        );
        if (event) {
            event.focus();
        }
    }

    /**
     * Save the changes made to the selected event.
     *
     * @param {string} recurrenceMode Edition mode of the recurrent events. Valid values include one or all.
     * @public
     */
    @api
    saveSelection(recurrenceMode) {
        const { event, occurrence } = this._eventData.selection;
        if (
            recurrenceMode === 'one' ||
            (event.recurrence && this.onlyOccurrenceEditAllowed)
        ) {
            this._eventData.saveOccurrence();
        } else {
            // Update the event with the selected occurrence values,
            // in case the selected occurrence had already been edited
            if (occurrence.from !== event.from) {
                event._from = occurrence.from;
            }
            if (occurrence.to !== event.to) {
                event._to = occurrence.to;
            }
            if (occurrence.title !== event.title) {
                event.title = occurrence.title;
            }
            if (occurrence.resourceNames !== event.resourceNames) {
                event.resourceNames = occurrence.resourceNames;
            }

            // Update the event with the draft values from the edit form
            this._eventData.saveEvent();
        }
        this._eventData.cleanSelection();
    }

    /**
     * Select an event.
     *
     * @param {object} detail Details on the selected event. Valid keys are `eventName`, `from`, `x`, `y` and `key`.
     * @public
     */
    @api
    selectEvent(detail) {
        return this._eventData.selectEvent(detail);
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Initialize the event data.
     */
    initEvents() {
        this._eventData = new EventData(this, {
            events: this.events,
            eventsLabels: this.eventsLabels,
            eventsTheme: this.eventsTheme,
            newEventTitle: this.newEventTitle,
            recurrentEditModes: this.recurrentEditModes,
            selectedResources: this.selectedResources,
            visibleInterval: this.visibleInterval
        });
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
     * Initialize the disabled dates of the left panel calendar.
     */
    initLeftPanelCalendarDisabledDates() {
        const disabled = getDisabledWeekdaysLabels(this.availableDaysOfTheWeek);
        this.navCalendarDisabledWeekdays = disabled;
        this.navCalendarDisabledDates = [...disabled];
    }

    /**
     * Set the starting date of the schedule.
     */
    setStartToBeginningOfUnit() {
        this.setSelectedDateToAvailableDate();
        const unit = this.timeSpan.unit;

        let state;
        if (this.isDay) {
            state = 'START_OF_DAY';
        } else if (this.isWeek || (this.isMonth && unit !== 'month')) {
            state = 'START_OF_WEEK';
        } else if (this.isMonth && unit === 'month') {
            state = 'START_OF_MONTH_AND_WEEK';
        } else if (unit === 'month') {
            state = 'START_OF_MONTH';
        } else if (this.isYear) {
            state = 'START_OF_YEAR';
        }

        switch (state) {
            case 'START_OF_DAY':
                this.start = this.computedSelectedDate.startOf('day');
                break;
            case 'START_OF_WEEK':
                this.start = getStartOfWeek(this.computedSelectedDate);
                break;
            case 'START_OF_MONTH_AND_WEEK':
                this.start = this.computedSelectedDate.startOf('month');
                if (this.start.weekday !== 7) {
                    // Make sure there are available days in the current week.
                    // Otherwise, go to the next week.
                    this.start = getFirstAvailableWeek(
                        this.start,
                        this.availableDaysOfTheWeek
                    );
                }
                this.start = getStartOfWeek(this.start);
                break;
            case 'START_OF_MONTH':
                this.start = this.computedSelectedDate.startOf('month');
                break;
            case 'START_OF_YEAR':
                this.start = this.computedSelectedDate.startOf('year');
                break;
            default:
                break;
        }
    }

    /**
     * Update the cell width property with the DOM cell width.
     */
    updateCellWidth() {
        const cell = this.template.querySelector(
            '[data-element-id="div-cell"]'
        );
        if (cell) {
            const cellWidth = cell.getBoundingClientRect().width;
            if (cellWidth !== this.cellWidth) {
                this.cellWidth = cellWidth;
                this._updateOccurrencesLength = true;
            }
        }
    }

    /*
     * ------------------------------------------------------------
     *  EVENT HANDLERS AND DISPATCHERS
     * -------------------------------------------------------------
     */

    /**
     * Handle the selection of a new date in the left panel calendar.
     *
     * @param {Event} event
     */
    handleCalendarChange(event) {
        const value = event.detail.value;
        if (!value) {
            event.currentTarget.value = this.computedSelectedDate;
            return;
        }

        this._selectedDate = this.createDate(value).ts;

        /**
         * The event fired when the selected date changes.
         *
         * @event
         * @name datechange
         * @param {DateTime} value The new selected date.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('datechange', {
                detail: {
                    value: this.computedSelectedDate
                }
            })
        );
    }

    /**
     * Handle the `dblclick` event fired by an empty spot of the schedule or a disabled primitive event occurrence. Create a new event at this position and open the edit dialog.
     *
     * @param {Event} event
     */
    handleDoubleClick(event) {
        if (this.readOnly) {
            return;
        }
        const x = event.clientX;
        const y = event.clientY;
        this.newEvent({ x, y, saveEvent: true });
        this.dispatchOpenEditDialog(this._eventData.selection);
    }

    /**
     * Handle the `contextmenu` event fired by an empty spot of the schedule, or a disabled primitive event occurrence. Open the context menu and prepare for the creation of a new event at this position.
     *
     * @param {Event} event
     */
    handleEmptySpotContextMenu(event) {
        event.preventDefault();

        let from, to;
        const agendaDate = event.currentTarget.dataset.date;
        if (agendaDate) {
            from = this.createDate(Number(agendaDate));
            to = from.endOf('day');
        } else {
            from = this.createDate(Number(event.currentTarget.dataset.start));
            to = this.createDate(Number(event.currentTarget.dataset.end));
        }

        /**
         * The event fired when the context menu is opened on an empty spot of the schedule.
         *
         * @event
         * @name emptyspotcontextmenu
         * @param {number} x Position of the cursor on the X axis.
         * @param {number} y Position of the cursor on the Y axis.
         * @param {DateTime} from Start date of the cell clicked.
         * @param {DateTime} to End date of the cell clicked.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('emptyspotcontextmenu', {
                detail: {
                    x: event.clientX,
                    y: event.clientY,
                    from: from.toISO(),
                    to: to.toISO()
                }
            })
        );
    }

    /**
     * Handle the `privatecontextmenu` event fired by a primitive event occurrence. Select the event and open its context menu.
     *
     * @param {Event} event
     */
    handleEventContextMenu(event) {
        const target = event.currentTarget;
        if (target.disabled || target.referenceLine) {
            return;
        }

        /**
         * The event fired when the context menu is opened on an event.
         *
         * @event
         * @name eventcontextmenu
         * @param {string} eventName Name of the event.
         * @param {string} key Key of the event occurrence.
         * @param {number} x Horizontal position of the occurrence.
         * @param {number} y Vertical position of the occurrence.
         */
        this.dispatchEvent(
            new CustomEvent('eventcontextmenu', { detail: event.detail })
        );
    }

    /**
     * Handle the `privatedblclick` event fired by a primitive event occurrence. Open the edit dialog for this event.
     *
     * @param {Event} event
     */
    handleEventDoubleClick(event) {
        if (this.readOnly) {
            return;
        }
        this._eventData.cleanSelection(true);
        this.selectEvent(event.detail);
        this.dispatchHidePopovers();
        this.dispatchOpenEditDialog(this._eventData.selection);
    }

    /**
     * Handle the privatefocus event fired by a primitive event occurrence. Dispatch the `eventselect` event and trigger the behaviour a mouse movement would have.
     *
     * @param {Event} event
     */
    handleEventFocus(event) {
        const { eventName, from, to } = event.detail;
        const detail = { name: eventName };
        const computedEvent = this._eventData.events.find(
            (ev) => ev.name === eventName
        );
        if (computedEvent && computedEvent.recurrence) {
            detail.recurrenceDates = {
                from: from.toUTC().toISO(),
                to: to.toUTC().toISO()
            };
        }

        /**
         * The event fired when an event is selected.
         *
         * @event
         * @name eventselect
         * @param {string} name Name of the event.
         * @param {object} recurrenceDates If the event is recurrent, and only one occurrence has been changed, this object will contain two keys:
         * * from
         * * to
         */
        this.dispatchEvent(
            new CustomEvent('eventselect', {
                detail,
                bubbles: true
            })
        );
        this.handleEventMouseEnter(event);
    }

    /**
     * Handle the cursor entering an event.
     *
     * @param {Event} event `privatemouseenter` event fired by a primitive event occurrence.
     */
    handleEventMouseEnter(event) {
        if (this._mouseIsDown) {
            return;
        }

        /**
         * The event fired when the mouse enters an event.
         *
         * @event
         * @name eventmouseenter
         * @param {string} eventName Name of the event.
         * @param {string} key Key of the occurrence.
         * @param {number} x Horizontal position of the occurrence.
         * @param {number} y Vertical position of the occurrence.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('eventmouseenter', {
                detail: event.detail
            })
        );
    }

    /**
     * Handle the cursor leaving an event.
     *
     * @param {Event} event `privatemouseleave` event fired by a primitive event occurrence.
     */
    handleEventMouseLeave(event) {
        /**
         * The event fired when the mouse leaves an event.
         *
         * @event
         * @name eventmouseleave
         * @param {string} eventName Name of the event.
         * @param {string} key Key of the occurrence.
         * @param {number} x Horizontal position of the occurrence.
         * @param {number} y Vertical position of the occurrence.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('eventmouseleave', {
                detail: event.detail
            })
        );
    }

    /**
     * Handle navigation in the left panel calendar. Make sure the unavailable months and days are not selectable.
     *
     * @param {Event} event
     */
    handleLeftPanelCalendarNavigate(event) {
        const date = this.createDate(event.detail.date);
        const month = date.month - 1;
        this.navCalendarDisabledDates = [...this.navCalendarDisabledWeekdays];

        if (!this.availableMonths.includes(month)) {
            for (let day = 1; day < 32; day++) {
                this.navCalendarDisabledDates.push(day);
            }
        }
    }

    /**
     * Handle the selection or unselection of a resource.
     *
     * @param {Event} event
     */
    handleResourceToggle(event) {
        const name = event.currentTarget.value;
        const selected = event.detail.checked;
        if (selected) {
            this.selectedResources.push(name);
        } else {
            const index = this.selectedResources.indexOf(name);
            this.selectedResources.splice(index, 1);
        }
        this.initEvents();

        /**
         * The event fired when a resource is selected or unselected.
         *
         * @event
         * @name resourceselect
         * @param {string} name Name of the resource that was selected or unselected.
         * @param {string[]} selectedResources Updated list of selected resources names.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('resourceselect', {
                detail: {
                    name,
                    selectedResources: this.selectedResources
                }
            })
        );
    }

    /**
     * Handle a click on the splitter collapse button.
     */
    handleSplitterCollapse() {
        this.collapseSidePanel();
    }

    /**
     * Handle a click on the splitter expand button.
     */
    handleSplitterExpand() {
        this.expandSidePanel();
    }

    /**
     * Handle a mouse down on the splitter.
     */
    handleSplitterResizeMouseDown(event) {
        if (!this.showSplitterResize || event.button !== 0) {
            return;
        }
        const startX = event.clientX;
        const startWidth = this.panelElement.offsetWidth;

        const mouseMove = (moveEvent) => {
            const diff = moveEvent.clientX - startX;
            if (this.panelElement) {
                const direction = this.sidePanelPosition === 'right' ? -1 : 1;
                const width = startWidth + diff * direction;
                this.panelElement.style.flexBasis = `${width}px`;
            }
        };

        const mouseUp = () => {
            window.removeEventListener('mousemove', mouseMove);
            window.removeEventListener('mouseup', mouseUp);
        };

        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('mouseup', mouseUp);
    }

    /**
     * Dispatch the `eventchange` event.
     *
     * @param {Event} event
     */
    dispatchEventChange(detail) {
        /**
         * The event fired when a user edits an event.
         *
         * @event
         * @name eventchange
         * @param {string} name Name of the event.
         * @param {object} draftValues Object containing one key-value pair per changed attribute.
         * @param {object} recurrenceDates If the event is recurrent, and only one occurrence has been changed, this object will contain two keys:
         * * from
         * * to
         * @public
         * @bubbles
         */
        this.dispatchEvent(
            new CustomEvent('eventchange', {
                detail,
                bubbles: true
            })
        );
    }

    /**
     * Dispatch the `eventcreate` event.
     *
     * @param {Event} event
     */
    dispatchEventCreate(event) {
        /**
         * The event fired when a user creates an event.
         *
         * @event
         * @name eventcreate
         * @param {object} event Event created.
         * @public
         * @bubbles
         */
        this.dispatchEvent(
            new CustomEvent('eventcreate', {
                detail: {
                    event: {
                        from: event.from.toUTC().toISO(),
                        resourceNames: event.resourceNames,
                        name: event.name,
                        title: event.title,
                        to: event.to.toUTC().toISO()
                    }
                },
                bubbles: true
            })
        );
    }

    /**
     * Dispatch the `hidepopovers` event.
     *
     * @param {Event} event
     */
    dispatchHidePopovers(list) {
        /**
         * The event fired when one or several popovers should be hidden.
         *
         * @event
         * @name hidepopovers
         * @param {string[]} list List of popover names to hide.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('hidepopovers', {
                detail: { list }
            })
        );
    }

    /**
     * Dispatch the `openeditdialog` event.
     *
     * @param {Event} event
     */
    dispatchOpenEditDialog(selection) {
        /**
         * The event fired when the edit dialog should be opened.
         *
         * @event
         * @name openeditdialog
         * @param {object} selection Information about the selected event.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('openeditdialog', {
                detail: {
                    selection
                }
            })
        );
    }

    /**
     * Dispatch the `openrecurrencedialog` event.
     *
     * @param {Event} event
     */
    dispatchOpenRecurrenceDialog(selection) {
        /**
         * The event fired when the recurrence dialog should be opened.
         *
         * @event
         * @name openrecurrencedialog
         * @param {object} selection Information about the selected event.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('openrecurrencedialog', {
                detail: {
                    selection
                }
            })
        );
    }

    /**
     * Dispatch the `visibleintervalchange` event.
     *
     * @param {Event} event
     */
    dispatchVisibleIntervalChange(start, visibleInterval) {
        /**
         * The event fired when the visible interval changes.
         *
         * @event
         * @name visibleintervalchange
         * @param {DateTime} start Start of the visible interval.
         * @param {Interval} visibleInterval Visible interval.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('visibleintervalchange', {
                detail: { start, visibleInterval }
            })
        );
    }

    /**
     * Stop the propagation of an event.
     *
     * @param {Event} event
     */
    stopPropagation(event) {
        event.stopPropagation();
    }
}
