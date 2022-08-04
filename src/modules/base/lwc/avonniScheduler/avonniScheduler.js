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

import { LightningElement, api, track } from 'lwc';
import {
    normalizeArray,
    normalizeBoolean,
    normalizeString,
    dateTimeObjectFrom,
    addToDate,
    deepCopy,
    previousAllowedDay,
    previousAllowedMonth,
    previousAllowedTime,
    removeFromDate
} from 'c/utilsPrivate';
import { classSet } from 'c/utils';
import { eventCrudMethods } from './avonniEventCrud';
import {
    EDIT_MODES,
    EVENTS_THEMES,
    EVENTS_PALETTES,
    DEFAULT_AVAILABLE_DAYS_OF_THE_WEEK,
    DEFAULT_AVAILABLE_MONTHS,
    DEFAULT_AVAILABLE_TIME_FRAMES,
    DEFAULT_DATE_FORMAT,
    DEFAULT_DIALOG_LABELS,
    DEFAULT_EVENTS_LABELS,
    DEFAULT_CONTEXT_MENU_EMPTY_SPOT_ACTIONS,
    DEFAULT_CONTEXT_MENU_EVENT_ACTIONS,
    DEFAULT_LOADING_STATE_ALTERNATIVE_TEXT,
    DEFAULT_START_DATE,
    DEFAULT_SELECTED_TIME_SPAN,
    DISPLAYS,
    HEADERS,
    PALETTES,
    PRESET_HEADERS,
    TIME_SPANS,
    UNITS,
    VARIANTS
} from './avonniDefaults';
import SchedulerResource from './avonniResource';
import SchedulerEvent from './avonniEvent';
import { AvonniResizeObserver } from 'c/resizeObserver';

/**
 * @class
 * @descriptor avonni-scheduler
 * @storyId example-scheduler--base
 * @public
 */
export default class AvonniScheduler extends LightningElement {
    _dialogLabels = DEFAULT_DIALOG_LABELS;
    _displays = DISPLAYS.default;
    _availableDaysOfTheWeek = DEFAULT_AVAILABLE_DAYS_OF_THE_WEEK;
    _availableMonths = DEFAULT_AVAILABLE_MONTHS;
    _availableTimeFrames = DEFAULT_AVAILABLE_TIME_FRAMES;
    _columns = [];
    _contextMenuEmptySpotActions = [];
    _contextMenuEventActions = [];
    _customEventsPalette = [];
    _collapseDisabled = false;
    _customHeaders = [];
    _dateFormat = DEFAULT_DATE_FORMAT;
    _disabledDatesTimes = [];
    _events = [];
    _eventsLabels = DEFAULT_EVENTS_LABELS;
    _eventsPalette = EVENTS_PALETTES.default;
    _eventsTheme = EVENTS_THEMES.default;
    _headers = HEADERS.default;
    _hideToolbar = false;
    _isLoading = false;
    _loadingStateAlternativeText = DEFAULT_LOADING_STATE_ALTERNATIVE_TEXT;
    _readOnly = false;
    _recurrentEditModes = EDIT_MODES;
    _referenceLines = [];
    _resizeColumnDisabled = false;
    _resources = [];
    _selectedTimeSpan = DEFAULT_SELECTED_TIME_SPAN;
    _start = dateTimeObjectFrom(DEFAULT_START_DATE);
    _timeSpans = TIME_SPANS.default;
    _variant = VARIANTS.default;
    _zoomToFit = false;

    _allEvents = [];
    _connected = false;
    _draggedEvent;
    _draggedSplitter = false;
    _headersAreLoading = false;
    _initialFirstColWidth;
    _initialState = {};
    _mouseIsDown = false;
    _numberOfVisibleCells = 0;
    _resizedEvent;
    _resizeObserver;
    _rowsHeight = [];
    _toolbarCalendarIsFocused = false;
    cellHeight = 0;
    cellWidth = 0;
    computedDisabledDatesTimes = [];
    computedHeaders = [];
    computedReferenceLines = [];
    computedResources = [];
    @track computedEvents = [];
    contextMenuActions = [];
    currentTimeSpan = {};
    firstColumnIsHidden = false;
    firstColumnIsOpen = false;
    firstColumnWidth = 0;
    selectedDate = dateTimeObjectFrom(DEFAULT_START_DATE);
    selectedEvent;
    showContextMenu = false;
    showEditDialog = false;
    showDeleteConfirmationDialog = false;
    showDetailPopover = false;
    showRecurrenceDialog = false;
    showToolbarCalendar = false;
    smallestHeader;

    connectedCallback() {
        this.initCurrentTimeSpan();
        this.crud = eventCrudMethods(this);
        this.initHeaders();
        this.initEvents();
        this._connected = true;
    }

    renderedCallback() {
        if (!this.smallestHeader) return;

        // Save the default first column width
        if (!this._initialFirstColWidth) {
            this.resetFirstColumnWidth();
        }

        // Save the datatable row height and update the body styles
        if (!this._rowsHeight.length) {
            this.updateRowsHeight();
        }
        this.updateOccurrencesOffset();
        this.updateResourcesStyle();

        // Update the position and height of occurrences
        this.updateOccurrencesPosition();

        // Position the detail popover
        if (this.showDetailPopover) {
            const popover = this.template.querySelector(
                '.avonni-scheduler__event-detail-popover'
            );
            this.positionPopover(popover);
        }

        // Position the context menu
        if (this.showContextMenu && this.contextMenuActions.length) {
            const contextMenu = this.template.querySelector(
                '.avonni-scheduler__context-menu'
            );
            this.positionPopover(contextMenu);
        }

        // If a new event was just created, set the dragged event
        if (this.selection && this.selection.newEvent && !this._draggedEvent) {
            this._draggedEvent = this.template.querySelector(
                `[data-element-id="avonni-primitive-scheduler-event-occurrence"][data-key="${this.selection.occurrence.key}"]`
            );
            if (this._draggedEvent) {
                this.initDraggedEventState(
                    this._initialState.mouseX,
                    this._initialState.mouseY
                );
            }
        }

        // If the edit dialog is opened, focus on the first input
        if (this.showEditDialog || this.showRecurrenceDialog) {
            this.template
                .querySelector('[data-element-id="avonni-dialog"]')
                .focusOnCloseButton();
        }

        if (!this._resizeObserver) {
            this._resizeObserver = this.initResizeObserver();
        }
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
     * For example, if the available days are Monday to Friday, the value would be: <code>[1, 2, 3, 4, 5]</code>
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
        const days = normalizeArray(value);
        this._availableDaysOfTheWeek =
            days.length > 0 ? days : DEFAULT_AVAILABLE_DAYS_OF_THE_WEEK;
    }

    /**
     * Array of available months. If present, the scheduler will only show the available months. Defaults to all months being available.
     * The months are represented by a number, starting from 0 for January, and ending with 11 for December.
     * For example, if the available months are January, February, June, July, August and December, the value would be: <code>[0, 1, 5, 6, 7, 11]</code>
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
        const months = normalizeArray(value);
        this._availableMonths =
            months.length > 0 ? months : DEFAULT_AVAILABLE_MONTHS;
    }

    /**
     * Array of available time frames. If present, the scheduler will only show the available time frames. Defaults to the full day being available.
     * Each time frame string must follow the pattern ‘start-end’, with start and end being ISO8601 formatted time strings.
     * For example, if the available times are from 10am to 12pm, and 2:30pm to 6:45pm, the value would be: <code>['10:00-11:59', '14:30-18:44']</code>
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
    }

    /**
     * Array of data table column objects (see [Data Table](/components/datatable/) for allowed keys). The columns are displayed to the left of the schedule and visible only for the horizontal variant.
     *
     * @type {object[]}
     * @public
     */
    @api
    get columns() {
        return this._columns;
    }
    set columns(value) {
        this._columns = JSON.parse(JSON.stringify(normalizeArray(value)));
    }

    /**
     * Array of action objects. These actions will be displayed in the context menu that appears when a user right-clicks on an empty space of the schedule.
     *
     * @type {object[]}
     * @public
     * @default Add event
     */
    @api
    get contextMenuEmptySpotActions() {
        return this._contextMenuEmptySpotActions;
    }
    set contextMenuEmptySpotActions(value) {
        this._contextMenuEmptySpotActions = normalizeArray(value);
    }

    /**
     * Array of action objects. These actions will be displayed in the context menu that appears when a user right-clicks on an event.
     *
     * @type {object[]}
     * @public
     * @default Edit and Delete
     */
    @api
    get contextMenuEventActions() {
        return this._contextMenuEventActions;
    }
    set contextMenuEventActions(value) {
        this._contextMenuEventActions = normalizeArray(value);
    }

    /**
     * Array of colors to use as a palette for the events. If present, it will overwrite the events-palette selected.
     * The color strings have to be a Hexadecimal or RGB color. For example <code>#3A7D44</code> or <code>rgb(58, 125, 68)</code>.
     *
     * @type {string[]}
     * @public
     */
    @api
    get customEventsPalette() {
        return this._customEventsPalette;
    }
    set customEventsPalette(value) {
        this._customEventsPalette = normalizeArray(value);

        if (this._connected) {
            this.initResources();
        }
    }

    /**
     * Deprecated. Set the custom headers in each time span instead.
     *
     * @type {object[]}
     * @deprecated
     */
    @api
    get customHeaders() {
        return null;
    }
    set customHeaders(value) {
        console.warn(
            'The "custom-headers" attribute is deprecated. Set the custom headers in each time span instead.'
        );
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
     * For example, the format of "Jan 14 day shift" would be <code>"LLL dd 'day shift'"</code>.
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
     * Array of disabled date/time objects.
     *
     * @type {object[]}
     * @public
     */
    @api
    get disabledDatesTimes() {
        return this._disabledDatesTimes;
    }
    set disabledDatesTimes(value) {
        this._disabledDatesTimes = normalizeArray(value);

        this.computedDisabledDatesTimes = this._disabledDatesTimes.map(
            (evt) => {
                const event = { ...evt };
                event.disabled = true;
                return event;
            }
        );

        if (this._connected) {
            this.initEvents();
            this.updateVisibleResources();
        }
    }

    /**
     * Labels used in the edit and delete dialogs.
     *
     * @type {object}
     * @public
     * @default {
     *   title: 'Title',
     *   from: 'From',
     *   to: 'To',
     *   resources: 'Resources',
     *   saveButton: 'Save',
     *   saveOneRecurrent: 'Only this event',
     *   saveAllRecurrent: 'All events',
     *   editRecurrent: 'Edit recurring event.',
     *   cancelButton: 'Cancel',
     *   deleteButton: 'Delete',
     *   deleteTitle: 'Delete Event',
     *   deleteMessage: 'Are you sure you want to delete this event?',
     *   newEventTitle: 'New event'
     * }
     */
    @api
    get dialogLabels() {
        return this._dialogLabels;
    }
    set dialogLabels(value) {
        if (value) {
            const labels = {};
            labels.title = value.title || DEFAULT_DIALOG_LABELS.title;
            labels.from = value.from || DEFAULT_DIALOG_LABELS.from;
            labels.to = value.to || DEFAULT_DIALOG_LABELS.to;
            labels.resources =
                value.resources || DEFAULT_DIALOG_LABELS.resources;
            labels.saveButton =
                value.saveButton || DEFAULT_DIALOG_LABELS.saveButton;
            labels.saveOneRecurrent =
                value.saveOneRecurrent ||
                DEFAULT_DIALOG_LABELS.saveOneRecurrent;
            labels.saveAllRecurrent =
                value.saveAllRecurrent ||
                DEFAULT_DIALOG_LABELS.saveAllRecurrent;
            labels.editRecurrent =
                value.editRecurrent || DEFAULT_DIALOG_LABELS.editRecurrent;
            labels.cancelButton =
                value.cancelButton || DEFAULT_DIALOG_LABELS.cancelButton;
            labels.deleteButton =
                value.deleteButton || DEFAULT_DIALOG_LABELS.deleteButton;
            labels.deleteTitle =
                value.deleteTitle || DEFAULT_DIALOG_LABELS.deleteTitle;
            labels.deleteMessage =
                value.deleteMessage || DEFAULT_DIALOG_LABELS.deleteMessage;
            labels.newEventTitle =
                value.newEventTitle || DEFAULT_DIALOG_LABELS.newEventTitle;

            this._dialogLabels = labels;
        } else {
            this._dialogLabels = DEFAULT_DIALOG_LABELS;
        }
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
        this._events = normalizeArray(value);

        if (this._connected) {
            this.initEvents();
            this.updateVisibleResources();
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
     * Not supported for vertical variant.
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
            this.initEvents();
            this.updateVisibleResources();
        }
    }

    /**
     * Default palette used for the event colors. Valid values include aurora, bluegrass, dusk, fire, heat, lake, mineral, nightfall, ocean, pond, sunrise, water, watermelon and wildflowers (see Palette table for more information).
     *
     * @type {string[]}
     * @public
     * @default aurora
     */
    @api
    get eventsPalette() {
        return this._eventsPalette;
    }
    set eventsPalette(value) {
        this._eventsPalette = normalizeString(value, {
            fallbackValue: EVENTS_PALETTES.default,
            validValues: EVENTS_PALETTES.valid
        });

        if (this._connected) {
            this.initResources();
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
            this.initEvents();
            this.updateVisibleResources();
        }
    }

    /**
     * Deprecated. Set the headers in each time span instead.
     *
     * @type {string}
     * @deprecated
     */
    @api
    get headers() {
        return null;
    }
    set headers(value) {
        console.warn(
            'The "headers" attribute is deprecated. Set the headers in each time span instead.'
        );
    }

    /**
     * If present, the toolbar is hidden.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get hideToolbar() {
        return this._hideToolbar;
    }
    set hideToolbar(value) {
        this._hideToolbar = normalizeBoolean(value);
    }

    /**
     * If present, a loading spinner will be visible.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get isLoading() {
        return this._isLoading;
    }
    set isLoading(value) {
        this._isLoading = normalizeBoolean(value);
    }

    /**
     * Alternative text of the loading spinner.
     *
     * @type {string}
     * @public
     * @default Loading
     */
    @api
    get loadingStateAlternativeText() {
        return this._loadingStateAlternativeText;
    }
    set loadingStateAlternativeText(value) {
        this._loadingStateAlternativeText =
            typeof value === 'string'
                ? value
                : DEFAULT_LOADING_STATE_ALTERNATIVE_TEXT;
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
     * * <code>all</code>: All recurrent event occurrences will be updated when a change is made to one occurrence.
     * * <code>one</code>: Only the selected occurrence will be updated when a change is made.
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
    }

    /**
     * Array of reference line objects.
     *
     * @type {object[]}
     * @public
     */
    @api
    get referenceLines() {
        return this._referenceLines;
    }
    set referenceLines(value) {
        this._referenceLines = normalizeArray(value);

        this.computedReferenceLines = this._referenceLines.map((line) => {
            const from = line.date
                ? dateTimeObjectFrom(line.date)
                : dateTimeObjectFrom(Date.now());
            const to = addToDate(from, 'millisecond', 1);

            return {
                title: line.label,
                theme: line.variant,
                from,
                to,
                recurrence: line.recurrence,
                recurrenceEndDate: line.recurrenceEndDate,
                recurrenceCount: line.recurrenceCount,
                recurrenceAttributes: line.recurrenceAttributes,
                referenceLine: true
            };
        });

        if (this._connected) {
            this.initEvents();
            this.updateVisibleResources();
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
     * Deprecated. The `name` field of the resource objects is used by default.
     *
     * @type {string}
     * @deprecated
     */
    @api
    get resourcesKeyField() {
        return 'name';
    }
    set resourcesKeyField(value) {
        console.warn(
            'The "resources-key-field" attribute is deprecated. The "name" field of the resource objects is used by default.'
        );
    }

    /**
     * Deprecated. Use `resources` instead.
     *
     * @type {object[]}
     * @deprecated
     */
    @api
    get rows() {
        return this.resources;
    }
    set rows(value) {
        // eslint-disable-next-line @lwc/lwc/no-api-reassignments
        this.resources = value;
        console.warn(
            'The "rows" attribute is deprecated. Use "resources" instead.'
        );
    }

    /**
     * Deprecated. The `name` field of the resource objects is used by default.
     *
     * @type {string}
     * @deprecated
     */
    @api
    get rowsKeyField() {
        return 'name';
    }
    set rowsKeyField(value) {
        console.warn(
            'The "rows-key-field" attribute is deprecated. The "name" field of the resource objects is used by default.'
        );
    }

    /**
     * Unique name of the selected time span. The selected time span will determine the visible duration of the scheduler.
     *
     * @type {string}
     * @default Standard.Scheduler.DayTimeSpan
     * @public
     */
    @api
    get selectedTimeSpan() {
        return this._selectedTimeSpan;
    }
    set selectedTimeSpan(value) {
        this._selectedTimeSpan =
            typeof value === 'string' ? value : DEFAULT_SELECTED_TIME_SPAN;

        if (this._connected) {
            this.initCurrentTimeSpan();
            this.initHeaders();
        }
    }

    /**
     * Specifies the starting date/timedate of the schedule. It can be a Date object, timestamp, or an ISO8601 formatted string.
     *
     * @type {(Date|number|string)}
     * @public
     * @default new Date()
     */
    @api
    get start() {
        return this._start;
    }
    set start(value) {
        const computedDate = dateTimeObjectFrom(value);
        this._start = computedDate || dateTimeObjectFrom(DEFAULT_START_DATE);
        this.selectedDate = dateTimeObjectFrom(this._start);
    }

    /**
     * Deprecated. Use the `time-spans` and the `selected-time-spans` instead.
     *
     * @type {object}
     * @deprecated
     */
    @api
    get timeSpan() {
        return this.currentTimeSpan;
    }
    set timeSpan(value) {
        console.warn(
            'The "time-span" attribute is deprecated. Use the "time-spans" and the "selected-time-span" instead.'
        );
    }

    /**
    * Array of time span objects.
    * The time spans will be displayed in the toolbar. Only three options can be visible, the others will be listed in a button menu.
    *
    * @type {object[]}
    * @public
    * @required
    * @default [
        {
            headers: 'hourAndDay',
            label: 'Day',
            name: 'Standard.Scheduler.DayTimeSpan',
            span: 1,
            unit: 'day'
        },
        {
            headers: 'hourAndDay',
            label: 'Week',
            name: 'Standard.Scheduler.WeekTimeSpan',
            span: 1,
            unit: 'week'
        },
        {
            headers: 'dayAndMonth',
            label: 'Month',
            name: 'Standard.Scheduler.MonthTimeSpan',
            span: 1,
            unit: 'month'
        },
        {
            headers: 'dayAndMonth',
            label: 'Year',
            name: 'Standard.Scheduler.YearTimeSpan',
            span: 1,
            unit: 'year'
        }
    ]
    */
    @api
    get timeSpans() {
        return this._timeSpans;
    }
    set timeSpans(value) {
        const normalizedTimeSpans = deepCopy(normalizeArray(value, 'object'));
        let timeSpans = normalizedTimeSpans.filter((tsp) => {
            return tsp.name;
        });
        if (!timeSpans.length) {
            timeSpans = TIME_SPANS.default;
        }
        timeSpans.forEach((tsp) => {
            if (!tsp.unit) {
                tsp.unit = TIME_SPANS.defaultUnit;
            }
            if (!tsp.headers) {
                tsp.headers = TIME_SPANS.defaultHeaders;
            }
            if (!tsp.span) {
                tsp.span = TIME_SPANS.defaultSpan;
            }
        });
        this._timeSpans = timeSpans;

        if (this._connected) {
            this.initCurrentTimeSpan();
            this.initHeaders();
        }
    }

    /**
     * Deprecated. Use the `time-spans` instead.
     *
     * @type {object[]}
     * @deprecated
     */
    @api
    get toolbarTimeSpans() {
        return this.timeSpans;
    }
    set toolbarTimeSpans(value) {
        // eslint-disable-next-line @lwc/lwc/no-api-reassignments
        this.timeSpans = value;

        console.warn(
            'The "toolbar-time-spans" attribute is deprecated. Use "time-spans" instead.'
        );
    }

    /**
     * Orientation of the scheduler. Valid values include horizontal and vertical.
     *
     * @type {string}
     * @default horizontal
     * @public
     */
    @api
    get variant() {
        return this._variant;
    }
    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: VARIANTS.default,
            validValues: VARIANTS.valid
        });

        this._initialFirstColWidth = null;
    }

    /**
     * If present, horizontal scrolling will be prevented.
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
     * Computed CSS classes of the cells.
     *
     * @type {string}
     */
    get cellClass() {
        return classSet(
            'slds-border_right slds-border_bottom slds-p-around_none slds-wrap avonni-scheduler__cell'
        )
            .add({
                'slds-col': !this.isVertical,
                'avonni-scheduler__cell_vertical': this.isVertical,
                'avonni-scheduler__cell_zoom-to-fit': this.zoomToFit
            })
            .toString();
    }

    /**
     * Array of resources options. The objects have two keys: label and value. Used in the edit form to generate a combobox of key fields.
     *
     * @type {object[]}
     */
    get resourcesComboboxOptions() {
        return this.computedResources.map((resource) => {
            return {
                label: resource.label,
                value: resource.name
            };
        });
    }

    /**
     * Datatable HTML Element.
     *
     * @type {HTMLElement}
     */
    get datatable() {
        return this.template.querySelector(
            '[data-element-id="avonni-datatable"]'
        );
    }

    /**
    * Array of action objects, used by the context menu when opened on an empty spot of the schedule.
    *
    * @type {object[]}
    * @default [{
        name: 'add-event',
        label: 'Add event',
        iconName: 'utility:add'
    }]
    */
    get computedContextMenuEmptySpot() {
        const actions = this.contextMenuEmptySpotActions;
        return this.readOnly
            ? actions
            : (actions.length && actions) ||
                  DEFAULT_CONTEXT_MENU_EMPTY_SPOT_ACTIONS;
    }

    /**
    * Array of action objects, used by the context menu when opened on an event.
    *
    * @type {object[]}
    * @default [{
        name: 'edit',
        label: 'Edit',
        iconName: 'utility:edit'
    },
    {
        name: 'delete',
        label: 'Delete',
        iconName: 'utility:delete'
    }]
    */
    get computedContextMenuEvent() {
        const actions = this.contextMenuEventActions;
        return this.readOnly
            ? actions
            : (actions.length && actions) || DEFAULT_CONTEXT_MENU_EVENT_ACTIONS;
    }

    /**
     * Computed title of the edit dialog.
     *
     * @type {string}
     */
    get editDialogTitle() {
        return (
            (this.selection && this.selection.event.title) ||
            this.dialogLabels.newEventTitle
        );
    }

    /**
     * Width of the first column (horizontal variant) or height of the header row (vertical variant). Used by the events to make the labels sticky.
     *
     * @type {number}
     */
    get scrollOffset() {
        return this.isVertical ? 0 : this.firstColWidth;
    }

    /**
     * First column HTML Element. It contains the datatable (horizontal variant) or the headers (vertical variant).
     *
     * @type {HTMLElement}
     */
    get firstCol() {
        return this.template.querySelector(
            '[data-element-id="div-first-column"]'
        );
    }

    /**
     * Computed CSS classes for the first column.
     *
     * @type {string}
     */
    get firstColClass() {
        return classSet(
            'slds-border_right avonni-scheduler__first-col slds-grid'
        )
            .add({
                'avonni-scheduler__first-col_hidden': this.firstColumnIsHidden,
                'avonni-scheduler__first-col_open': this.firstColumnIsOpen,
                'avonni-scheduler__first-col_horizontal': !this.isVertical,
                'slds-p-right_x-small avonni-scheduler__first-col_vertical avonni-scheduler__grid_align-end':
                    this.isVertical
            })
            .toString();
    }

    /**
     * True if the variant is vertical.
     *
     * @type {boolean}
     */
    get isVertical() {
        return this.variant === 'vertical';
    }

    /**
     * If true, editing a recurring event only updates the occurrence, never the complete event.
     *
     * @type {boolean}
     * @default false
     */
    get onlyOccurrenceEditAllowed() {
        return (
            this.recurrentEditModes.length === 1 &&
            this.recurrentEditModes[0] === 'one'
        );
    }

    /**
     * Array of color strings.
     *
     * @type {string[]}
     */
    get palette() {
        return this.customEventsPalette.length
            ? this.customEventsPalette
            : PALETTES[this.eventsPalette];
    }

    /**
     * Computed CSS class for the schedule resources.
     *
     * @type {string}
     */
    get resourceClass() {
        return classSet('slds-grid slds-is-relative')
            .add({
                'slds-grid_vertical slds-col': this.isVertical
            })
            .toString();
    }

    /**
     * Computed CSS class for the schedule body.
     *
     * @type {string}
     */
    get scheduleBodyClass() {
        return classSet('slds-is-relative')
            .add({
                'slds-grid avonni-scheduler__schedule-body_vertical':
                    this.isVertical
            })
            .toString();
    }

    /**
     * Computed CSS class for the schedule column.
     *
     * @type {string}
     */
    get scheduleColClass() {
        return classSet(
            'slds-col slds-grid avonni-scheduler__schedule-col slds-theme_default'
        )
            .add({
                'slds-hide': this.firstColumnIsOpen,
                'avonni-scheduler__schedule-col_vertical': this.isVertical,
                'avonni-scheduler__schedule-col_zoom-to-fit': this.zoomToFit
            })
            .toString();
    }

    /**
     * Width of the schedule column, in pixels.
     *
     * @type {number}
     */
    get scheduleColWidth() {
        const wrapper = this.template.querySelector(
            '[data-element-id="div-schedule-wrapper"]'
        );
        const firstCol = this.firstCol;

        if (wrapper && firstCol) {
            const wrapperWidth = wrapper.getBoundingClientRect().width;
            const firstColWidth = firstCol.getBoundingClientRect().width;
            return wrapperWidth - firstColWidth;
        }
        return 0;
    }

    /**
     * Computed CSS class for the nested schedule column.
     *
     * @type {string}
     */
    get scheduleNestedCol() {
        return classSet('slds-col')
            .add({
                'avonni-scheduler__schedule-col_zoom-to-fit': this.zoomToFit
            })
            .toString();
    }

    /**
     * Position and dimensions of the schedule body.
     *
     * @type {object}
     */
    get schedulePosition() {
        const scheduleElement = this.template.querySelector(
            '[data-element-id="div-schedule-body"]'
        );
        return scheduleElement.getBoundingClientRect();
    }

    /**
     * Formated starting date of the currently selected event.
     *
     * @type {string}
     */
    get selectionFrom() {
        return this.selection.occurrence.from.toFormat(this.dateFormat);
    }

    /**
     * Formated ending date of the currently selected event.
     *
     * @type {string}
     */
    get selectionTo() {
        return this.selection.occurrence.to.toFormat(this.dateFormat);
    }

    /**
     * If true, the left collapse button is displayed on the splitter bar.
     *
     * @type {boolean}
     * @default true
     */
    get showCollapseLeft() {
        return !this.collapseDisabled && !this.firstColumnIsHidden;
    }

    /**
     * If true, the right collapse button is displayed on the splitter bar.
     *
     * @type {boolean}
     * @default true
     */
    get showCollapseRight() {
        return !this.collapseDisabled && !this.firstColumnIsOpen;
    }

    /**
     * If true, when editing a recurring event, the user always have the choice to save the changes only for the occurrence or for every occurrences of the event.
     *
     * @type {boolean}
     * @default true
     */
    get showRecurrenceSaveOptions() {
        return (
            this.recurrentEditModes.length > 1 &&
            this.selection.event.recurrence
        );
    }

    /**
     * True if the loading spinner should be displayed.
     *
     * @type {boolean}
     */
    get showSpinner() {
        return this.isLoading || this._headersAreLoading;
    }

    /**
     * True if the toolbar time span buttons should be visible.
     *
     * @type {boolean}
     */
    get showToolbarTimeSpans() {
        return this.timeSpans.length > 1;
    }

    /**
     * Duration of one cell of the smallest unit header, in milliseconds.
     *
     * @type {number}
     * @default 0
     */
    get smallestCellDuration() {
        const header = this.smallestHeader;
        if (!header) {
            return 0;
        }

        const headerCellEnd =
            addToDate(header.start, header.unit, header.span) - 1;
        return dateTimeObjectFrom(headerCellEnd).diff(header.start)
            .milliseconds;
    }

    /**
     * Class list of the splitter.
     *
     * @type {string}
     * @default 'avonni-scheduler__splitter slds-is-absolute slds-grid'
     */
    get splitterClass() {
        return classSet('avonni-scheduler__splitter slds-is-absolute slds-grid')
            .add({
                'avonni-scheduler__splitter_disabled':
                    this.resizeColumnDisabled,
                'slds-grid_align-end': this.firstColumnIsOpen,
                'avonni-scheduler__splitter_vertical': this.isVertical
            })
            .toString();
    }

    /**
     * Computed CSS classes for the calendar selector of the toolbar.
     *
     * @type {string}
     */
    get toolbarCalendarWrapperClass() {
        return classSet('slds-col slds-has-flexi-truncate')
            .add({
                'slds-text-align_center slds-p-horizontal_small':
                    this.showToolbarTimeSpans
            })
            .toString();
    }

    /**
     * Array of toolbar time spans that should be displayed as buttons in the toolbar.
     *
     * @type {object[]}
     */
    get toolbarTimeSpanButtons() {
        const buttons = deepCopy(this.timeSpans.slice(0, 3));
        buttons.forEach((button) => {
            if (button.name === this.currentTimeSpan.name) {
                button.variant = 'brand';
            } else {
                button.variant = 'neutral';
            }
        });
        return buttons;
    }

    /**
     * Array of toolbar time spans that should be displayed as menu items in the toolbar.
     *
     * @type {object[]}
     */
    get toolbarTimeSpanMenuItems() {
        const items = deepCopy(this.timeSpans.slice(3));
        items.forEach((item) => {
            if (item.name === this.currentTimeSpan.name) {
                item.checked = true;
            }
        });
        return items;
    }

    /**
     * Label of the toolbar interval button.
     *
     * @type {string}
     */
    get visibleIntervalLabel() {
        if (!this.visibleInterval) {
            return null;
        }

        const unit = this.currentTimeSpan.unit;
        let format;
        switch (unit) {
            case 'day':
            case 'week': {
                format = 'ccc, LLLL d, kkkk';
                break;
            }
            case 'month':
            case 'year': {
                format = 'LLLL yyyy';
                break;
            }
            case 'minute':
            case 'hour': {
                format = 't';
                break;
            }
            default:
                break;
        }

        const start = this.visibleInterval.s.toFormat(format);
        const end = this.visibleInterval.e.toFormat(format);
        return start === end ? start : `${start} - ${end}`;
    }

    /**
     * Currently visible date interval, as a Luxon Interval object.
     *
     * @type {Interval}
     */
    get visibleInterval() {
        const header = this.template.querySelector(
            '[data-element-id="avonni-primitive-scheduler-header-group"]'
        );
        if (header) {
            return header.visibleInterval;
        }
        return null;
    }

    /**
     * Computed CSS style for the vertical resource header cells.
     *
     * @type {string}
     */
    get verticalResourceHeaderCellClass() {
        return classSet(
            'slds-border_right slds-p-horizontal_x-small avonni-scheduler__vertical-resource-header-cell slds-grid slds-grid_vertical-align-center'
        )
            .add({
                'avonni-scheduler__vertical-resource-header-cell_zoom-to-fit':
                    this.zoomToFit
            })
            .toString();
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Create a new event.
     *
     * @param {object} event Event object of the new event.
     * @public
     */
    @api
    createEvent(eventObject) {
        this.crud.createEvent(eventObject);
    }

    /**
     * Delete an event.
     *
     * @param {string} name Unique name of the event to delete.
     * @public
     */
    @api
    deleteEvent(eventName) {
        this.crud.deleteEvent(eventName);
    }

    /**
     * Set the focus on an event.
     *
     * @param {string} name Unique name of the event to set the focus on.
     * @public
     */
    @api
    focusEvent(eventName) {
        this._programmaticFocus = true;
        this.crud.focusEvent(eventName);
    }

    /**
     * Move the position of the scheduler so the specified date is visible. The difference with setting the start attribute is that the current time span is taken into account, so the scheduler won’t necessarily start with the given date.
     *
     * @param {string | number | Date} date Date the scheduler should be positioned on.
     * @public
     */
    @api
    goToDate(date) {
        const selectedDate = dateTimeObjectFrom(date);
        if (!selectedDate) {
            console.warn(`The date ${date} is not valid.`);
            return;
        }
        this.selectedDate = selectedDate;
        const unit = this.currentTimeSpan.unit;
        let start;

        // Compensate the fact that Luxon weeks start on Monday
        if (unit === 'week' && selectedDate.weekday === 7) {
            // Start is on Sunday and the unit is week
            start = selectedDate.startOf('day');
        } else {
            start = selectedDate.startOf(unit);

            if (unit === 'week') {
                // Start is not on a Sunday and the unit is week
                start = removeFromDate(start, 'day', 1);
            }
        }
        this._start = start;
    }

    /**
     * Open the edit event dialog.
     *
     * @param {string} name Unique name of the event to edit.
     * @public
     */
    @api
    openEditEventDialog(eventName) {
        this._draggedEvent = undefined;
        this.focusEvent(eventName);
        this.hideAllPopovers();
        this.showEditDialog = true;
    }

    /**
     * Open the new event dialog.
     *
     * @public
     */
    @api
    openNewEventDialog() {
        this.crud.newEvent();
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Set the current time span value.
     */
    initCurrentTimeSpan() {
        this.currentTimeSpan = this.timeSpans.find((tsp) => {
            return tsp.name === this.selectedTimeSpan;
        });

        if (
            !this.currentTimeSpan &&
            this.selectedTimeSpan !== DEFAULT_SELECTED_TIME_SPAN
        ) {
            // Set the current time span to the default time span, if it exists
            this.currentTimeSpan = this.timeSpans.find((tsp) => {
                return tsp.name === DEFAULT_SELECTED_TIME_SPAN;
            });
        }
        if (!this.currentTimeSpan) {
            // Set the selected time span to the first time span
            this.currentTimeSpan = this.timeSpans[0];
        }
    }

    /**
     * Create the computed headers.
     */
    initHeaders() {
        this._headersAreLoading = true;
        const { customHeaders, headers } = this.currentTimeSpan;

        if (customHeaders) {
            const normalizedHeaders = customHeaders.filter((hd) => {
                const validUnit = UNITS.includes(hd.unit);
                const validSpan = hd.span > 0;
                const validLabel = typeof hd.label === 'string';
                return validUnit && validSpan && validLabel;
            });

            if (normalizedHeaders.length) {
                this.computedHeaders = deepCopy(normalizedHeaders);
                return;
            }
        }

        const normalizedHeadersName = normalizeString(headers, {
            validValues: HEADERS.valid,
            fallbackValue: HEADERS.default,
            toLowerCase: false
        });

        this.computedHeaders = deepCopy(PRESET_HEADERS[normalizedHeadersName]);
    }

    /**
     * Create the computed events.
     */
    initEvents() {
        // The disabled dates/times and reference lines are special events
        this._allEvents = this.events
            .concat(this.computedDisabledDatesTimes)
            .concat(this.computedReferenceLines);

        if (!this._allEvents.length) {
            this.computedEvents = [];
            return;
        }

        this._allEvents.sort((first, second) => {
            return (
                dateTimeObjectFrom(first.from) < dateTimeObjectFrom(second.from)
            );
        });

        // Create only the visible events
        this.computedEvents = this.createVisibleEvents();
    }

    /**
     * Initialize the screen resize observer.
     *
     * @returns {AvonniResizeObserver} Resize observer.
     */
    initResizeObserver() {
        const resizeObserver = new AvonniResizeObserver(() => {
            this.updateCellWidth();
        });
        const schedule = this.template.querySelector(
            '[data-element-id="div-schedule-body"]'
        );
        resizeObserver.observe(schedule);
        return resizeObserver;
    }

    /**
     * Create the computed resources.
     */
    initResources() {
        if (!this.smallestHeader || !this.resources.length) {
            this.computedResources = [];
            return;
        }

        let colorIndex = 0;
        this.computedResources = this.resources.map((resource) => {
            const name = resource.name;

            // If there is no color left in the palette,
            // restart from the beginning
            if (!this.palette[colorIndex]) {
                colorIndex = 0;
            }

            const occurrences = this.getOccurrencesFromResourceName(name);

            const computedResource = new SchedulerResource({
                avatarFallbackIconName: resource.avatarFallbackIconName,
                avatarInitials: resource.avatarInitials,
                avatarSrc: resource.avatarSrc,
                color: this.palette[colorIndex],
                label: resource.label,
                name,
                referenceCells: this.smallestHeader.cells,
                events: occurrences,
                // We store the initial resource object in a variable,
                // in case one of its fields is used by an event's label
                data: { ...resource }
            });

            // Set the min-height to the datatable rows height
            if (this._rowsHeight.length && !this.isVertical) {
                const dataRowHeight = this._rowsHeight.find(
                    (dataRow) => dataRow.resourceName === name
                ).height;
                computedResource.minHeight = dataRowHeight;
            }

            colorIndex += 1;
            return computedResource;
        });

        if (this.isVertical) {
            requestAnimationFrame(() => {
                this.updateCellWidth();
            });
        }
    }

    /**
     * Set the initial state of a dragged or resized event.
     *
     * @param {number} mouseX The position of the mouse on the horizontal axis.
     * @param {number} mouseY The position of the mouse on the vertical axis.
     */
    initDraggedEventState(mouseX, mouseY) {
        // Save the initial position values
        const eventPosition = this._draggedEvent.getBoundingClientRect();
        const { right, left, top, bottom } = this.getDraggingBoundaries(
            eventPosition,
            mouseX,
            mouseY
        );

        const resourceAxis = this.isVertical ? mouseX : mouseY;
        const resource = this.getResourceElementFromPosition(resourceAxis);

        const eventStartPosition = this.isVertical
            ? eventPosition.top
            : eventPosition.left;

        const eventEndPosition = this.isVertical
            ? eventPosition.bottom
            : eventPosition.right;

        const eventSize = this.isVertical
            ? eventPosition.height
            : eventPosition.width;

        this._initialState = {
            mouseX,
            mouseY,
            initialX: this._draggedEvent.x,
            initialY: this._draggedEvent.y,
            eventStartPosition,
            eventEndPosition,
            eventSize,
            left,
            right,
            top,
            bottom,
            resource
        };
    }

    /**
     * Set the resources height and cell width.
     */
    updateResourcesStyle() {
        if (this.isVertical) {
            this.template.host.style = `
                --avonni-scheduler-cell-height: ${this.cellHeight}px;
            `;
            const resourceHeaders = this.template.querySelector(
                '[data-element-id="div-vertical-resource-headers"]'
            );
            const scheduleWrapper = this.template.querySelector(
                '[data-element-id="div-schedule-wrapper"]'
            );
            const scrollBarWidth =
                scheduleWrapper.offsetWidth - scheduleWrapper.clientWidth;
            resourceHeaders.style.paddingRight = `${scrollBarWidth}px`;
        } else {
            const resourceElements = this.template.querySelectorAll(
                '[data-element-id="div-resource"]'
            );

            resourceElements.forEach((resourceElement, index) => {
                const name = resourceElement.dataset.name;
                const computedResource = this.getResourceFromName(name);
                const rowHeight = computedResource.height;

                const dataRow = this._rowsHeight.find((row) => {
                    return row.resourceName === name;
                });
                const dataRowHeight = dataRow.height;

                const style = `
                    min-height: ${dataRowHeight}px;
                    height: ${rowHeight}px;
                    --avonni-scheduler-cell-width: ${this.cellWidth}px;
                `;

                // Patch inconsistency in the datatable row heights
                const normalizedHeight =
                    index === 0 ? rowHeight - 1 : rowHeight;
                // Reset the datatable row height, in case the height was set by events
                this.datatable.setRowHeight(name, normalizedHeight);

                resourceElement.style = style;
            });
        }
    }

    /**
     * Update the cell width property if the cells grew because the splitter moved.
     */
    updateCellWidth() {
        if (this.zoomToFit && !this.isVertical) {
            // The header is computing the cell width
            const headers = this.template.querySelector(
                '[data-element-id="avonni-primitive-scheduler-header-group"]'
            );
            if (headers) {
                headers.scrollLeftOffset = this.firstColWidth;
            }
            return;
        } else if (this.isVertical) {
            this.setResourceHeaderFirstCellWidth();
        }

        const cell = this.template.querySelector(
            '[data-element-id="div-cell"]'
        );
        if (!cell) return;
        const cellWidth = cell.getBoundingClientRect().width;
        if (cellWidth !== this.cellWidth) {
            this.cellWidth = cellWidth;
            this._updateOccurrencesLength = true;
        }
    }

    /**
     * Vertically align the datatable header with the smallest unit schedule header.
     */
    pushDatatableDown() {
        if (this.isVertical) {
            return;
        }

        const headers = this.template.querySelector(
            '[data-element-id="avonni-primitive-scheduler-header-group"]'
        );
        this.datatable.style.marginTop = `${headers.offsetHeight - 39}px`;
    }

    /**
     * Update the width of the resized event.
     */
    updateDraggedEventStyleAfterResize(distanceMoved) {
        const { eventSize, initialY, initialX } = this._initialState;
        const side = this._resizeSide;
        const event = this._draggedEvent;
        const multiplier = side === 'start' ? -1 : 1;

        const size = eventSize + distanceMoved * multiplier;
        if (this.isVertical) {
            event.style.height = `${size}px`;
        } else {
            event.style.width = `${size}px`;
        }

        if (side === 'start') {
            const initialPosition = this.isVertical ? initialY : initialX;
            const computedStart =
                side === 'start'
                    ? distanceMoved + initialPosition
                    : distanceMoved;

            if (this.isVertical) {
                event.y = computedStart;
            } else {
                event.x = computedStart;
            }
        }
    }

    /**
     * Set the default properties of the given event.
     *
     * @param {object} event The event object.
     */
    updateEventDefaults(event) {
        // We store the initial event object in a variable,
        // in case a custom field is used by the labels
        event.data = { ...event };
        event.schedulerEnd = this.visibleInterval.e;
        event.schedulerStart = this.visibleInterval.s;
        event.availableMonths = this.availableMonths;
        event.availableDaysOfTheWeek = this.availableDaysOfTheWeek;
        event.availableTimeFrames = this.availableTimeFrames;
        event.smallestHeader = this.smallestHeader;
        event.theme = event.disabled
            ? 'disabled'
            : event.theme || this.eventsTheme;

        event.labels =
            typeof event.labels === 'object' ? event.labels : this.eventsLabels;
    }

    /**
     * Prevent the events from overlapping. In the horizontal variant, compute the vertical position of the events and the rows height. In the vertical variant, compute the horizontal position of the events.
     */
    updateOccurrencesOffset() {
        const scheduleRightBorder = this.schedulePosition.right;

        // For each resource
        this.computedResources.forEach((resource) => {
            let rowHeight = 0;
            let levelHeight = 0;

            // Get all the event occurrences of the resource
            const occurrenceElements = Array.from(
                this.template.querySelectorAll(
                    `.avonni-scheduler__primitive-event[data-resource-name="${resource.name}"]`
                )
            );

            if (occurrenceElements.length) {
                // Sort the occurrences by ascending start date
                occurrenceElements.sort((a, b) => a.from - b.from);

                // Compute the level of the occurrences in the resource
                const previousOccurrences = [];
                occurrenceElements.forEach((occElement) => {
                    const start = occElement.startPosition;
                    const { level, numberOfOverlap } =
                        this.computeEventLevelInResource(
                            previousOccurrences,
                            start
                        );

                    const occurrence = resource.events.find((occ) => {
                        return occ.key === occElement.occurrenceKey;
                    });

                    previousOccurrences.unshift({
                        level,
                        numberOfOverlap,
                        start,
                        end: occElement.endPosition,
                        occurrence:
                            occurrence ||
                            (this.selection && this.selection.occurrence)
                    });

                    if (!this.isVertical) {
                        if (occElement.labels.right) {
                            // Hide the right label if it overflows the schedule
                            const elementRightBorder =
                                occElement.getBoundingClientRect().right +
                                occElement.rightLabelWidth;
                            if (elementRightBorder >= scheduleRightBorder) {
                                occElement.hideRightLabel();
                            } else {
                                occElement.showRightLabel();
                            }
                        }

                        // If the occurrence is taller than the previous ones,
                        // update the default level height
                        const height =
                            occElement.getBoundingClientRect().height;
                        if (height > levelHeight) {
                            levelHeight = height;
                        }
                    }
                });

                // Add the corresponding offset to the top (horizontal variant)
                // or left (vertical variant) of the occurrences
                previousOccurrences.forEach((position) => {
                    const { level, occurrence, numberOfOverlap } = position;
                    let offsetSide = 0;

                    if (this.isVertical) {
                        offsetSide = (level * this.cellWidth) / numberOfOverlap;
                        occurrence.numberOfEventsInThisTimeFrame =
                            numberOfOverlap;
                        this._updateOccurrencesLength = true;
                    } else {
                        offsetSide = level * levelHeight;

                        // If the occurrence offset is bigger than the previous occurrences,
                        // update the row height
                        const totalHeight = levelHeight + offsetSide;
                        if (totalHeight > rowHeight) {
                            rowHeight = totalHeight;
                        }
                    }

                    occurrence.offsetSide = offsetSide;
                });
            }

            if (!this.isVertical) {
                // Add 10 pixels to the row for padding
                resource.height = rowHeight + 10;
            }
        });
    }

    /**
     * Update the primitive occurrences height, width and position.
     */
    updateOccurrencesPosition() {
        const eventOccurrences = this.template.querySelectorAll(
            '[data-element-id="avonni-primitive-scheduler-event-occurrence"]'
        );
        eventOccurrences.forEach((occurrence) => {
            if (this._updateOccurrencesLength) {
                occurrence.updateLength();
            }
            if (occurrence.disabled) {
                occurrence.updateThickness();
            }
            occurrence.updatePosition();
        });
        this._updateOccurrencesLength = false;

        if (this.isVertical) {
            // Set the reference line height to the width of the schedule
            const schedule = this.template.querySelector(
                '[data-element-id="div-schedule-body"]'
            );
            const scheduleWidth = this.schedulePosition.width;
            schedule.style = `
                 --avonni-primitive-scheduler-event-reference-line-length: ${scheduleWidth}px
             `;
        }
    }

    /**
     * Save the datatable rows heights and use them as a min-height for the schedule rows.
     */
    updateRowsHeight() {
        if (this.isVertical || (!this.isVertical && !this.datatable)) {
            return;
        }

        this._rowsHeight = [];
        this.computedResources.forEach((resource) => {
            const resourceName = resource.name;
            const height = this.datatable.getRowHeight(resourceName);
            resource.minHeight = height;
            this._rowsHeight.push({ resourceName, height });
        });
    }

    /**
     * Update the cells and events of the currently loaded resources.
     */
    updateVisibleResources() {
        this.computedResources.forEach((resource) => {
            resource.events = this.getOccurrencesFromResourceName(
                resource.name
            );
            resource.referenceCells = this.smallestHeader.cells;
            resource.initCells();
        });
    }

    /**
     * Find the cell element at a given schedule position.
     *
     * @param {HTMLElement} resource The resource element the cell is in.
     * @param {number} position The position of the cell.
     * @returns {(HTMLElement|undefined)} The cell element or undefined.
     */
    getCellFromPosition(resource, position) {
        const cellElements = Array.from(
            resource.querySelectorAll('[data-element-id="div-cell"]')
        );

        return cellElements.find((cellElement, index) => {
            const cellPosition = cellElement.getBoundingClientRect();
            const start = this.isVertical
                ? cellPosition.top
                : cellPosition.left;
            const end = this.isVertical
                ? cellPosition.bottom
                : cellPosition.right;

            // Handle the cases where the events are on the side
            // and the mouse moved out of the schedule
            if (index === 0 && start >= position) {
                return cellElement;
            }
            if (index === cellElements.length - 1 && position > end) {
                return cellElement;
            }

            if (position >= start && position < end) {
                return cellElement;
            }
            return undefined;
        });
    }

    /**
     * Get the boundaries of the dragging/resizing zone.
     *
     * @param {DOMRect} eventPosition The position and dimensions of the dragged event.
     * @param {number} mouseX The position of the mouse on the X axis.
     * @param {number} mouseY The position of the mouse on the Y axis.
     * @returns {object} The dragging zone coordinates.
     */
    getDraggingBoundaries(eventPosition, mouseX, mouseY) {
        const resizeEnd = this._resizeSide === 'end';
        const isDragged = !this._resizeSide;
        const schedulePosition = this.schedulePosition;

        let right, left, top, bottom;
        if (this.isVertical) {
            const topOfEvent = eventPosition.top + 24;
            const topOfSchedule =
                schedulePosition.top + (mouseY - eventPosition.top);
            top = resizeEnd ? topOfEvent : topOfSchedule;

            const bottomOfEvent = eventPosition.bottom - 24;
            const bottomOfSchedule =
                schedulePosition.bottom + (mouseY - eventPosition.bottom);
            bottom = resizeEnd || isDragged ? bottomOfSchedule : bottomOfEvent;

            left = schedulePosition.left + (mouseX - eventPosition.left);
            right = schedulePosition.right + (mouseX - eventPosition.right);
        } else {
            const leftOfEvent = eventPosition.left + 24;
            const leftOfSchedule =
                schedulePosition.left + (mouseX - eventPosition.left);
            left = resizeEnd ? leftOfEvent : leftOfSchedule;

            const rightOfEvent = eventPosition.right - 24;
            const rightOfSchedule =
                schedulePosition.right + (mouseX - eventPosition.right);
            right = resizeEnd || isDragged ? rightOfSchedule : rightOfEvent;

            top = schedulePosition.top + (mouseY - eventPosition.top);
            bottom = schedulePosition.bottom + (mouseY - eventPosition.bottom);
        }

        return { right, left, top, bottom };
    }

    /**
     * Find the event occurrences for a given resource name.
     *
     * @param {string} name The unique name of the resource.
     * @returns {object[]} Array of occurrence objects.
     */
    getOccurrencesFromResourceName(name) {
        const occurrences = [];
        this.computedEvents.forEach((event) => {
            if (!event.disabled) {
                const occ = event.occurrences.filter((occurrence) => {
                    return occurrence.resourceName === name;
                });
                occurrences.push(occ);
            }
        });

        return occurrences.flat();
    }

    /**
     * Find a computed resource from its name.
     *
     * @param {string} name The unique name of the resource.
     * @returns {SchedulerResource} The computed resource object.
     */
    getResourceFromName(name) {
        return this.computedResources.find(
            (resource) => resource.name === name
        );
    }

    /**
     * Find a resource element from its position in the schedule.
     *
     * @param {number} position A position on the resource to find, on the Y axis (horizontal variant) or the X axis (vertical variant).
     * @returns {(HTMLElement|undefined)} The resource `<div>` element or undefined.
     */
    getResourceElementFromPosition(position) {
        const resources = Array.from(
            this.template.querySelectorAll('[data-element-id="div-resource"]')
        );
        return resources.find((div) => {
            const divPosition = div.getBoundingClientRect();
            const start = this.isVertical ? divPosition.left : divPosition.top;
            const end = this.isVertical
                ? divPosition.right
                : divPosition.bottom;

            return position >= start && position <= end;
        });
    }

    /**
     * Get the total number of event occurrences that overlap one.
     *
     * @param {object[]} previousOccurrences The computed occurrences that appear before the current one.
     * @param {number} startPosition Start position of the evaluated occurrence, on the X axis (horizontal variant) or the Y axis (vertical variant).
     * @param {number} numberOfOverlap Minimum overlapped occurrences. This number correspond to the occurrence level + 1.
     * @returns {number} The total number of occurrences overlapping, including the one evaluated.
     */
    getTotalOfOccurrencesOverlapping(
        previousOccurrences,
        startPosition,
        minOverlap
    ) {
        let numberOfOverlap = minOverlap;

        const overlappingOccurrences = previousOccurrences.filter((occ) => {
            return startPosition < occ.end;
        });

        overlappingOccurrences.forEach((occ) => {
            if (occ.numberOfOverlap >= numberOfOverlap) {
                numberOfOverlap = occ.numberOfOverlap;
            } else {
                // Update the total of levels of the overlapped event occurrence
                occ.numberOfOverlap = numberOfOverlap;
                numberOfOverlap = this.getTotalOfOccurrencesOverlapping(
                    previousOccurrences,
                    occ.start,
                    numberOfOverlap
                );
            }
        });

        return numberOfOverlap;
    }

    /**
     * Clear the dragged class and empty the _draggedEvent and _resizeSide variables.
     */
    cleanDraggedElement() {
        if (this._draggedEvent) {
            this._draggedEvent.classList.remove(
                'avonni-scheduler__event-dragged'
            );
            this._draggedEvent = undefined;
        }
        this._resizeSide = undefined;
    }

    /**
     * Clear the selected or new event.
     */
    cleanSelection() {
        // If a new event was being created, remove the unfinished event from the computedEvents
        const lastEvent = this.computedEvents[this.computedEvents.length - 1];
        if (
            this.selection &&
            this.selection.newEvent &&
            lastEvent === this.selection.event
        ) {
            this.computedEvents.pop();
        }
        this.selection = undefined;
    }

    /**
     * Remove the initial width of the datatable last column if there was one, so it will be resized when the splitter is moved.
     */
    clearDatatableColumnWidth() {
        if (this.isVertical) {
            return;
        }
        const lastColumn = this.columns[this.columns.length - 1];
        if (lastColumn.initialWidth) {
            lastColumn.initialWidth = undefined;
            this._columns = [...this.columns];
        }
    }

    /**
     * Push an event occurrence down a level, until it doesn't overlap another occurrence.
     *
     * @param {object[]} previousOccurrences Array of previous occurrences for which the level has already been computed.
     * @param {number} startPosition Start position of the evaluated occurrence, on the X axis (horizontal variant) or the Y axis (vertical variant).
     * @param {number} level Level of the occurrence in their resource. It starts at 0, so the occurrence is at the top (horizontal variant) or the left (vertical variant) of its resource.
     * @returns {object} Object with two keys:
     * * level (number): level of the event occurrence in the resource.
     * * numberOfOverlap (number): Total of occurrences overlaping, including the evaluated one.
     */
    computeEventLevelInResource(previousOccurrences, startPosition, level = 0) {
        // Find the last event with the same level
        const sameLevelEvent = previousOccurrences.find((occ) => {
            return occ.level === level;
        });

        const overlapsEvent =
            sameLevelEvent && startPosition < sameLevelEvent.end;
        if (overlapsEvent) {
            level += 1;

            // Make sure there isn't another event at the same position
            level = this.computeEventLevelInResource(
                previousOccurrences,
                startPosition,
                level
            ).level;
        }

        let numberOfOverlap = level + 1;
        if (this.isVertical) {
            numberOfOverlap = this.getTotalOfOccurrencesOverlapping(
                previousOccurrences,
                startPosition,
                numberOfOverlap
            );
        }

        return { level, numberOfOverlap };
    }

    /**
     * Create the computed events that are included in the currently visible interval of time.
     */
    createVisibleEvents() {
        const interval = this.visibleInterval;
        if (!interval) {
            return [];
        }

        const events = this._allEvents.filter((event) => {
            const from = dateTimeObjectFrom(event.from);
            const to = dateTimeObjectFrom(event.to);
            return (
                interval.contains(from) ||
                interval.contains(to) ||
                (interval.isAfter(from) && interval.isBefore(to)) ||
                event.recurrence
            );
        });

        return events.reduce((computedEvents, evt) => {
            const event = { ...evt };
            this.updateEventDefaults(event);
            const computedEvent = new SchedulerEvent(event);

            if (computedEvent.occurrences.length) {
                computedEvents.push(computedEvent);
            }
            return computedEvents;
        }, []);
    }

    /**
     * Update the given popover position so it is next to the currently selected event occurrence.
     *
     * @param {HTMLElement} popover Popover element.
     */
    positionPopover(popover) {
        // Make sure the popover is not outside of the screen
        const y = this.selection.y;
        const x = this.selection.x;
        const height = popover.offsetHeight;
        const width = popover.offsetWidth;
        const popoverBottom = y + height;
        const popoverRight = x + width;

        const bottomView = window.innerHeight;
        const rightView = window.innerWidth;

        const yTransform = popoverBottom > bottomView ? height * -1 : 0;
        const xTransform = popoverRight > rightView ? width * -1 : 0;

        popover.style.transform = `translate(${xTransform}px, ${yTransform}px)`;
        popover.style.top = `${y}px`;
        popover.style.left = `${x}px`;
    }

    /**
     * Set the selected event from an Event object.
     *
     * @param {Event} mouseEvent Event that triggered the selection.
     */
    selectEvent(mouseEvent) {
        const { eventName, from, x, y, key } = mouseEvent.detail;
        const computedEvent = this.computedEvents.find((evt) => {
            return evt.name === eventName;
        });
        const occurrences = computedEvent.occurrences.filter((occ) => {
            return occ.from.ts === from.ts;
        });
        const occurrence = occurrences.find((occ) => occ.key === key);

        this.selection = {
            event: computedEvent,
            occurrences,
            occurrence,
            x,
            y,
            draftValues: {}
        };
    }

    /**
     * Set the CSS style of the resource header first cell, in vertical variant.
     */
    setResourceHeaderFirstCellWidth() {
        const resourceHeaderFirstCell = this.template.querySelector(
            '[data-element-id="div-vertical-resource-header-first-cell"]'
        );
        resourceHeaderFirstCell.style.width = `${this.firstColWidth}px`;
        resourceHeaderFirstCell.style.minWidth = `${this.firstColWidth}px`;
    }

    /**
     * Reset the width of the first column to the width it had before being collapsed.
     */
    resetFirstColumnWidth() {
        const columnWidth = this.firstCol.getBoundingClientRect().width;
        this._initialFirstColWidth = columnWidth;
        this.firstColWidth = columnWidth;
        if (this.isVertical) {
            this.setResourceHeaderFirstCellWidth();
        }
    }

    /**
     * Make sure the currently resized event occurrence doesn't overlap another event. If it is, save the resizing to the event so the schedule rerenders. Else, visually resize it without saving the change in the event.
     *
     * @param {number} position New position of the occurrence.
     */
    resizeEventToPosition(position) {
        const occurrence = this.selection.occurrence;
        const { resource, mouseX, mouseY } = this._initialState;
        const distanceMoved = this.isVertical
            ? position - mouseY
            : position - mouseX;

        // If a new event is created through click and drag,
        // Set the direction the user is going to
        if (this.selection.newEvent) {
            this._resizeSide = distanceMoved >= 0 ? 'end' : 'start';
        }

        const labelWidth =
            this._resizeSide === 'start'
                ? this._draggedEvent.leftLabelWidth * -1
                : this._draggedEvent.rightLabelWidth;
        const computedPosition = position + labelWidth;

        // Get the events present in the cell crossed
        const hoveredCell = this.getCellFromPosition(
            resource,
            computedPosition
        );
        const computedResource = this.getResourceFromName(
            resource.dataset.name
        );
        const computedCell = computedResource.getCellFromStart(
            Number(hoveredCell.dataset.start)
        );
        const cellEvents = computedCell.events;

        // Check if any event in the cell has the same offsetTop
        const eventIsHovered = cellEvents.some((cellEvent) => {
            const isDifferent = cellEvent.key !== occurrence.key;
            if (this.isVertical) {
                return (
                    isDifferent &&
                    cellEvent.offsetSide === occurrence.offsetSide
                );
            }
            return (
                cellEvent.offsetSide === occurrence.offsetSide && isDifferent
            );
        });

        // If one of them do, the dragged event is overlapping it.
        // We have to rerender the scheduler so the resource height enlarges.
        if (eventIsHovered) {
            const cell = labelWidth
                ? hoveredCell
                : this.getCellFromPosition(resource, position);
            this.resizeEventToCell(cell);
        } else {
            // If we are not passing above another event,
            // change the styling of the dragged event to follow the cursor
            this.updateDraggedEventStyleAfterResize(distanceMoved);
        }
    }

    /**
     * Resize an event to a given cell element and save the change.
     *
     * @param {HTMLElement} cell The cell element.
     */
    resizeEventToCell(cell) {
        const side = this._resizeSide;
        const occurrence = this.selection.occurrence;

        // Remove the occurrence from the resource
        const resourceName = occurrence.resourceName;
        const resource = this.getResourceFromName(resourceName);
        resource.removeEvent(occurrence);

        if (side === 'end') {
            // Update the end date if the event was resized from the right
            occurrence.to = dateTimeObjectFrom(Number(cell.dataset.end) + 1);
        } else if (side === 'start') {
            // Update the start date if the event was resized from the left
            occurrence.from = dateTimeObjectFrom(Number(cell.dataset.start));
        }

        // Add the occurrence to the resource with the updated start/end date
        resource.events.push(occurrence);
        resource.addEventToCells(occurrence);

        // Force the rerender
        this.computedEvents = [...this.computedEvents];
    }

    /**
     * Drag an event to a cell and save the change.
     *
     * @param {HTMLElement} resource The resource element the event is being dragged to.
     * @param {HTMLElement} cell The cell element the event is being dragged to.
     */
    dragEventTo(resource, cell) {
        const { occurrence, draftValues } = this.selection;

        // Update the start and end date
        const duration = occurrence.to - occurrence.from;
        const start = dateTimeObjectFrom(Number(cell.dataset.start));
        draftValues.from = start.toUTC().toISO();
        draftValues.to = addToDate(start, 'millisecond', duration + 1)
            .toUTC()
            .toISO();

        // Update the resources
        const resourceName = resource.dataset.name;
        const previousResourceName = occurrence.resourceName;

        if (previousResourceName !== resourceName) {
            const resourceIndex = occurrence.resourceNames.findIndex(
                (name) => name === previousResourceName
            );
            draftValues.resourceNames = [...occurrence.resourceNames];
            draftValues.resourceNames.splice(resourceIndex, 1);

            if (!draftValues.resourceNames.includes(resourceName)) {
                draftValues.resourceNames.push(resourceName);
            }
        }
    }

    /**
     * Normalize the mouse position so it will take the schedule borders as a value if the mouse is outside of the schedule.
     *
     * @param {number} mouseX The horizontal position of the mouse.
     * @param {number} mouseY The vertical position of the mouse.
     * @returns {object} Object with two keys: x and y
     */
    normalizeMousePosition(mouseX, mouseY) {
        const { top, bottom, left, right } = this._initialState;

        let x = mouseX;
        let y = mouseY;

        if (y < top) {
            y = top;
        } else if (y > bottom) {
            y = bottom;
        }

        if (x < left) {
            x = left;
        } else if (x > right) {
            x = right;
        }

        return { x, y };
    }

    /**
     * Hide the detail popover, the context menu and the edit dialog if any was open.
     */
    hideAllPopovers() {
        this.hideDetailPopover();
        this.hideContextMenu();
        this.hideEditDialog();
        this.hideDeleteConfirmationDialog();
    }

    /**
     * Hide the context menu.
     */
    hideContextMenu() {
        this.contextMenuActions.splice(0);
        this.showContextMenu = false;
    }

    /**
     * Hide the detail popover.
     */
    hideDetailPopover() {
        this.showDetailPopover = false;
    }

    /**
     * Hide the edit dialog.
     */
    hideEditDialog() {
        this.showEditDialog = false;
    }

    /**
     * Hide the delete confirmation dialog.
     */
    hideDeleteConfirmationDialog() {
        this.showDeleteConfirmationDialog = false;
    }

    /**
     * Hide the recurring event saving options dialog.
     */
    hideRecurrenceDialog() {
        this.showRecurrenceDialog = false;
    }

    handleCloseDeleteConfirmationDialog() {
        this.cleanDraggedElement();
        this.cleanSelection();
        this.hideDeleteConfirmationDialog();
    }

    /**
     * Handle the privatecellsizechange event fired by the primitive header. Save the smallest unit header cell size to a variable.
     */
    handleHeaderCellSizeChange(event) {
        const cellSize = event.detail.cellSize;

        if (this.isVertical) {
            this.cellHeight = cellSize;
        } else {
            this.cellWidth = cellSize;
        }
    }

    /**
     * Handle the privateheaderchange event fired by the primitive header. Save the smallest unit header to a variable and make sure the datatable position will be updated on next render.
     */
    handleHeaderChange(event) {
        this.smallestHeader = event.detail.smallestHeader;

        // Update the start date in case it was not available
        this._start = this.smallestHeader.start;

        // Create the visible events
        this.computedEvents = this.createVisibleEvents();

        // Create the resources or update the existing ones
        if (!this.computedResources.length) {
            this.initResources();
        } else {
            this.updateVisibleResources();
        }

        this._initialFirstColWidth = 0;
        this._rowsHeight = [];

        requestAnimationFrame(() => {
            this.pushDatatableDown();
            this._headersAreLoading = false;
        });
    }

    /**
     * Handle the click event fired by the delete button. Delete the selected event.
     */
    handleEventDelete() {
        this.crud.deleteEvent();
    }

    /**
     * Handle the privatefocus event fired by a primitive event occurrence. Dispatch the eventselect event and trigger the behaviour a mouse movement would have.
     */
    handleEventFocus(event) {
        const detail = {
            name: event.detail.eventName
        };
        if (event.currentTarget.recurrence) {
            detail.recurrenceDates = {
                from: event.detail.from.toUTC().toISO(),
                to: event.detail.to.toUTC().toISO()
            };
        }

        if (!this._programmaticFocus) {
            /**
             * The event fired when the focus is set on an event. If the focus was set programmatically, the event will not be fired.
             *
             * @event
             * @name eventselect
             * @param {string} name Unique name of the event.
             * @param {object} recurrenceDates If the event is recurrent, this object will contain two keys: from and to.
             * @public
             * @bubbles
             */
            this.dispatchEvent(
                new CustomEvent('eventselect', {
                    detail,
                    bubbles: true
                })
            );
        }
        this._programmaticFocus = false;

        this.handleEventMouseEnter(event);
    }

    /**
     * Handle the mousedown event fired by an empty cell or a disabled primitive event occurrence. Prepare the scheduler for a new event to be created on drag.
     */
    handleMouseDown(mouseEvent) {
        if (mouseEvent.button || this.readOnly) {
            return;
        }

        this._mouseIsDown = true;
        this.hideAllPopovers();
        this.cleanDraggedElement();

        const x = mouseEvent.clientX || mouseEvent.detail.x;
        const y = mouseEvent.clientY || mouseEvent.detail.y;
        this._initialState = { mouseX: x, mouseY: y };
        this.crud.newEvent(x, y, false);
    }

    /**
     * Handle the privatemouseenter event fired by a primitive event occurrence. Select the hovered event and show the detail popover.
     */
    handleEventMouseEnter(event) {
        if (this._mouseIsDown || this.showContextMenu) {
            return;
        }

        this.selectEvent(event);
        this.showDetailPopover = true;
        this._draggedEvent = event.currentTarget;
    }

    /**
     * Handle the privatemousedown event fired by a primitive event occurrence. Select the event and prepare for it to be dragged or resized.
     */
    handleEventMouseDown(mouseEvent) {
        const { side, x, y } = mouseEvent.detail;
        this._mouseIsDown = true;
        this._resizeSide = side;
        this._draggedEvent = mouseEvent.currentTarget;
        this._draggedEvent.classList.add('avonni-scheduler__event-dragged');
        this.selectEvent(mouseEvent);
        this.hideAllPopovers();
        this.initDraggedEventState(x, y);
    }

    /**
     * Handle the mousemove event fired by the schedule. If the splitter is being clicked, compute its movement. If an event is being clicked, compute its resizing or dragging.
     */
    handleMouseMove(mouseEvent) {
        if (!this._mouseIsDown) {
            return;
        }

        // Prevent scrolling
        mouseEvent.preventDefault();

        // The splitter between the left column and the schedule is being dragged
        if (this._draggedSplitter) {
            const { mouseX, firstColWidth } = this._initialState;
            const x = mouseEvent.clientX;
            const width = firstColWidth + (x - mouseX);

            if (!this.isVertical) {
                this.datatable.style.width = `${width}px`;
            }
            this.firstCol.style.width = `${width}px`;
            this.firstCol.style.minWidth = `${width}px`;
            this.firstColWidth = width;

            if (this.isVertical && !this.zoomToFit) {
                // Update the resource header first cell width
                // even if the schedule body width has not changed (is scrolling).
                // The rest of the time, the resize observer will trigger the update.
                this.setResourceHeaderFirstCellWidth();
            }

            // An event is being dragged
        } else if (this._draggedEvent) {
            const { mouseX, mouseY, initialX, initialY } = this._initialState;

            this.selection.isMoving = true;

            // Prevent the event from being dragged out of the schedule grid,
            // or from being squished outside of its boundaries when resizing
            const position = this.normalizeMousePosition(
                mouseEvent.clientX,
                mouseEvent.clientY
            );

            if (this._resizeSide || this.selection.newEvent) {
                // Resizing
                const resizePosition = this.isVertical
                    ? position.y
                    : position.x;
                this.resizeEventToPosition(resizePosition);
            } else {
                // Drag and drop
                const x = position.x - mouseX;
                const y = position.y - mouseY;
                this._draggedEvent.x = x + initialX;
                this._draggedEvent.y = y + initialY;
            }

            // The user started the creation of a new event, through click and drag.
            // On the first move, display the new event on the schedule.
        } else if (this.selection && this.selection.newEvent) {
            this.computedEvents.push(this.selection.event);
            this.updateVisibleResources();
        }
    }

    /**
     * Handle the mouseup event fired by the schedule. Save the splitter or the dragged/resized event new position.
     */
    handleMouseUp(mouseEvent) {
        this._mouseIsDown = false;
        if (mouseEvent.button !== 0) {
            return;
        }

        if (this._draggedSplitter) {
            this._draggedSplitter = false;
        } else if (this.selection && this.selection.isMoving) {
            // Get the new position
            const { mouseX, mouseY, eventStartPosition, eventEndPosition } =
                this._initialState;
            const { draftValues, newEvent, event, occurrence } = this.selection;
            const side = this._resizeSide;
            const position = this.normalizeMousePosition(
                mouseEvent.clientX,
                mouseEvent.clientY
            );
            const startPosition = this.isVertical
                ? position.y - (mouseY - eventStartPosition)
                : position.x - (mouseX - eventStartPosition);

            const endPosition = this.isVertical
                ? position.y + (eventEndPosition - mouseY)
                : position.x + (eventEndPosition - mouseX);

            const valueOnTheResourceAxis =
                side === 'end' ? endPosition : startPosition;

            const valueOnTheHeadersAxis = this.isVertical
                ? position.x
                : position.y;

            // Find the resource and cell the event was dropped on
            const resourceElement = this.getResourceElementFromPosition(
                valueOnTheHeadersAxis
            );
            const cellElement = this.getCellFromPosition(
                resourceElement,
                valueOnTheResourceAxis
            );

            // Update the draft values
            const to = dateTimeObjectFrom(Number(cellElement.dataset.end) + 1);
            const from = dateTimeObjectFrom(Number(cellElement.dataset.start));
            switch (side) {
                case 'end':
                    draftValues.allDay = false;
                    draftValues.to = to.toUTC().toISO();
                    if (newEvent) {
                        occurrence.to = to;
                    }
                    break;
                case 'start':
                    draftValues.allDay = false;
                    draftValues.from = from.toUTC().toISO();
                    if (newEvent) {
                        occurrence.from = from;
                    }
                    break;
                default:
                    this.dragEventTo(resourceElement, cellElement);
                    break;
            }

            if (newEvent) {
                this.showEditDialog = true;
                this.selection.isMoving = false;
            } else {
                if (this.showRecurrenceSaveOptions) {
                    this.showRecurrenceDialog = true;
                    return;
                } else if (event.recurrence && this.onlyOccurrenceEditAllowed) {
                    this.crud.saveOccurrence();
                } else {
                    this.crud.saveEvent();
                }
                this.updateVisibleResources();
                this.cleanSelection();
            }
        } else if (this.selection) {
            this.cleanSelection();
        }
        this.cleanDraggedElement();
    }

    /**
     * Handle the resize event fired by the datatable. Update the rows heights.
     */
    handleDatatableResize(event) {
        if (event.detail.isUserTriggered) {
            this.datatable.style.width = null;
            this._rowsHeight = [];
            this.computedResources.forEach((resource) => {
                resource.minHeight = undefined;
            });
            this.firstCol.style.width = null;
            this.firstCol.style.minWidth = null;
            this.computedResources = [...this.computedResources];
        } else {
            this.updateRowsHeight();
            this.updateResourcesStyle();
        }
    }

    /**
     * Handle the privatecontextmenu event fired by a primitive event occurrence. Select the event and open its context menu.
     */
    handleEventContextMenu(mouseEvent) {
        const target = mouseEvent.currentTarget;
        if (target.disabled || target.referenceLine) {
            return;
        }

        if (this.computedContextMenuEvent.length) {
            this.hideAllPopovers();
            this.contextMenuActions = [...this.computedContextMenuEvent];
            this.selectEvent(mouseEvent);
            this.showContextMenu = true;
        }
    }

    /**
     * Handle the contextmenu event fired by an empty spot of the schedule, or a disabled primitive event occurrence. Open the context menu and prepare for the creation of a new event at this position.
     */
    handleEmptySpotContextMenu(mouseEvent) {
        mouseEvent.preventDefault();

        if (this.computedContextMenuEmptySpot.length) {
            this.hideAllPopovers();
            this.contextMenuActions = [...this.computedContextMenuEmptySpot];
            this.showContextMenu = true;
            const x = mouseEvent.clientX || mouseEvent.detail.x;
            const y = mouseEvent.clientY || mouseEvent.detail.y;
            this.crud.newEvent(x, y, false);
        }
    }

    /**
     * Handle the privateselect event fired by the context menu. Dispatch the action click event and process the selected action.
     */
    handleActionSelect(event) {
        const name = event.detail.name;

        /**
         * The event fired when a user clicks on an action.
         *
         * @event
         * @name actionclick
         * @param {string} name Name of the action clicked.
         * @param {string} targetName If the action came from the context menu of an event, name of the event.
         * @public
         * @bubbles
         */
        this.dispatchEvent(
            new CustomEvent('actionclick', {
                detail: {
                    name: name,
                    targetName: this.selection.event
                        ? this.selection.event.name
                        : undefined
                },
                bubbles: true
            })
        );

        switch (name) {
            case 'edit':
                this.showEditDialog = true;
                break;
            case 'delete':
                this.showDeleteConfirmationDialog = true;
                break;
            case 'add-event':
                this.showEditDialog = true;
                this.computedEvents.push(this.selection.event);
                break;
            default:
                this.cleanSelection();
                this.cleanDraggedElement();
                break;
        }
    }

    /**
     * Handle the dblclick event fired by an empty spot of the schedule or a disabled primitive event occurrence. Create a new event at this position and open the edit dialog.
     */
    handleDoubleClick(mouseEvent) {
        const x = !isNaN(mouseEvent.clientX)
            ? mouseEvent.clientX
            : mouseEvent.detail.x;
        const y = !isNaN(mouseEvent.clientY)
            ? mouseEvent.clientY
            : mouseEvent.detail.y;
        this.crud.newEvent(x, y, true);
    }

    /**
     * Handle the privatedblclick event fired by a primitive event occurrence. Open the edit dialog for this event.
     */
    handleEventDoubleClick(event) {
        this._draggedEvent = undefined;
        this.selectEvent(event);
        this.hideAllPopovers();
        this.showEditDialog = true;
    }

    /**
     * Handle the change event fired by the edit dialog title input. Save the new title to the draft values.
     */
    handleEventTitleChange(event) {
        const title = event.currentTarget.value;
        this.selection.draftValues.title = title;
    }

    /**
     * Handle the change event fired by the edit dialog date input. Save the new dates to the draft values.
     */
    handleEventDateChange(event) {
        const from = event.detail.startDate;
        const to = event.detail.endDate;

        this.selection.draftValues.from = from;
        this.selection.draftValues.to = to;
    }

    /**
     * Handle the change event fired by the edit dialog key fields combobox. Save the new resource keys to the draft values.
     */
    handleEventResourceNamesChange(event) {
        const resourceNames = event.detail.value;
        this.selection.draftValues.resourceNames = resourceNames;
    }

    /**
     * Handle the closedialog event fired by the edit dialog. Cancel the changes and close the dialog.
     */
    handleCloseEditDialog() {
        this.cleanDraggedElement();
        this.cleanSelection();
        this.hideAllPopovers();
    }

    /**
     * Handle the closedialog event fired by the recurring event save dialog. Cancel the changes and close the dialog.
     */
    handleCloseRecurrenceDialog() {
        if (this._resizeSide) {
            const resource = this._initialState.resource;
            let position;
            if (this._resizeSide === 'start') {
                position = this._initialState.eventStartPosition;
            } else {
                position = this._initialState.eventEndPosition;
            }
            const initialCell = this.getCellFromPosition(resource, position);
            this.resizeEventToCell(initialCell);
        }
        this.cleanDraggedElement();
        this.cleanSelection();
        this.hideRecurrenceDialog();
        this.updateVisibleResources();
    }

    /**
     * Handle the click event fired by the save buttons of the edit or recurring event dialogs. Save the changes made to the event and close the dialog.
     */
    handleSaveEvent(mouseEvent) {
        const { event, occurrence } = this.selection;
        const recurrentChange =
            mouseEvent.detail.value || mouseEvent.currentTarget.value;

        if (
            recurrentChange === 'one' ||
            (event.recurrence && this.onlyOccurrenceEditAllowed)
        ) {
            this.crud.saveOccurrence();
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
            this.crud.saveEvent();
        }

        this.updateVisibleResources();
        this.cleanDraggedElement();
        this.cleanSelection();

        if (this.showRecurrenceDialog) {
            this.hideRecurrenceDialog();
        } else {
            this.hideEditDialog();
        }
        this.hideDetailPopover();
        this.hideContextMenu();
    }

    /**
     * Handle the keydown event fired by the save buttons of the edit dialog. Prevent the focus from leaving the dialog.
     */
    handleEditSaveKeyDown(event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            this.template
                .querySelector('[data-element-id^="avonni-dialog"]')
                .focusOnCloseButton();
        }
    }

    /**
     * Handle the scroll event fired by the schedule. Hide the popovers of the events that are scrolled out of the screen.
     */
    handleScroll(event) {
        if (this.showDetailPopover) {
            // Hide the detail popover only if it goes off screen
            const eventPosition = this._draggedEvent.getBoundingClientRect();
            if (eventPosition.right < 0 || eventPosition.bottom < 0) {
                this.hideDetailPopover();
            }
        } else {
            this.hideDetailPopover();
            this.hideContextMenu();
        }

        if (this.isVertical && !this.zoomToFit) {
            // Create an artificial scroll for the resource headers in vertical
            const resourceHeaders = this.template.querySelector(
                '[data-element-id="div-resource-header-cells"]'
            );
            resourceHeaders.scroll(event.currentTarget.scrollLeft, 0);
        }
    }

    /**
     * Handle the mousedown event fired by the splitter bar. Prepare for a column resize.
     */
    handleSplitterMouseDown(mouseEvent) {
        if (
            this.resizeColumnDisabled ||
            mouseEvent.button !== 0 ||
            mouseEvent.target.tagName === 'LIGHTNING-BUTTON-ICON'
        )
            return;

        this.clearDatatableColumnWidth();
        this._mouseIsDown = true;
        this._draggedSplitter = true;
        const firstColWidth = this.isVertical
            ? this.firstCol.offsetWidth
            : this.datatable.offsetWidth;
        this._initialState = {
            mouseX: mouseEvent.clientX,
            firstColWidth
        };
        this.firstColumnIsHidden = false;
        this.firstColumnIsOpen = false;
        this.hideAllPopovers();
    }

    /**
     * Handle the click event fired by the splitter left collapse button. If the first column was taking the full screen, resize it to its initial width. Else, hide the first column.
     */
    handleHideFirstCol() {
        this.hideAllPopovers();
        this.firstCol.style.width = null;
        this.firstCol.style.minWidth = null;

        if (this.firstColumnIsOpen) {
            this.firstColumnIsOpen = false;
            this.firstColWidth = this._initialFirstColWidth;
            if (this.isVertical) {
                this.setResourceHeaderFirstCellWidth();
            } else {
                this.datatable.style.width = null;
            }
        } else {
            this.firstColumnIsHidden = true;
            this.firstColWidth = 0;
            if (this.isVertical) {
                this.setResourceHeaderFirstCellWidth();
            } else {
                this.datatable.style.width = 0;
            }
        }
    }

    /**
     * Handle the click event fired by the splitter right collapse button. If the first column was hidden, resize it to its initial width. Else, make it full screen.
     */
    handleOpenFirstCol() {
        this.hideAllPopovers();
        this.firstCol.style.width = null;
        this.clearDatatableColumnWidth();
        if (!this.isVertical) {
            this.datatable.style.width = null;
        }

        if (this.firstColumnIsHidden) {
            this.firstColumnIsHidden = false;
            this.firstColWidth = this._initialFirstColWidth;
            if (!this.isVertical) {
                this.datatable.style.width = `${this._initialFirstColWidth}px`;
            }
        } else {
            this.firstColumnIsOpen = true;
            const width = this.template.host.getBoundingClientRect().width;
            this.firstColWidth = width;
            if (!this.isVertical) {
                this.datatable.style.width = `${width}px`;
            }
        }
    }

    handleToggleToolbarCalendar() {
        this.showToolbarCalendar = !this.showToolbarCalendar;

        requestAnimationFrame(() => {
            const calendar = this.template.querySelector(
                '[data-element-id="calendar-toolbar"]'
            );
            if (calendar) {
                calendar.focus();
            }
        });
    }

    handleToolbarCalendarChange(event) {
        this.showToolbarCalendar = false;
        const { value } = event.detail;
        if (!value) {
            return;
        }

        this.goToDate(value);
    }

    handleToolbarCalendarFocusin() {
        this._toolbarCalendarIsFocused = true;
    }

    handleToolbarCalendarFocusout() {
        this._toolbarCalendarIsFocused = false;

        requestAnimationFrame(() => {
            if (!this._toolbarCalendarIsFocused) {
                this.showToolbarCalendar = false;
            }
        });
    }

    handleToolbarNextClick() {
        const { unit, span } = this.currentTimeSpan;
        const date = addToDate(this.start, unit, span);
        this.goToDate(date);
    }

    handleToolbarPrevClick() {
        const { unit, span } = this.currentTimeSpan;

        // If the date is set to one that is not available,
        // the headers will automatically go to the next available date,
        // preventing the schedule from going in the past
        let date = removeFromDate(this.start, unit, span);
        if (unit === 'year' || unit === 'month') {
            date = previousAllowedMonth(date, this.availableMonths);
        } else if (unit === 'week' || unit === 'day') {
            date = previousAllowedDay(
                date,
                this.availableMonths,
                this.availableDaysOfTheWeek
            );
        } else {
            date = previousAllowedTime(
                date,
                this.availableMonths,
                this.availableDaysOfTheWeek,
                this.availableTimeFrames,
                unit,
                span
            );
        }
        this.goToDate(date);
    }

    /**
     * Handle a click on one of the toolbar time span buttons.
     *
     * @param {Event} event
     */
    handleToolbarTimeSpanClick(event) {
        const name = event.target.value;
        if (!name || name === this._selectedTimeSpan) {
            return;
        }
        this._rowsHeight = [];
        this._selectedTimeSpan = name;
        const timeSpan = this.timeSpans.find((ts) => ts.name === name);
        this.currentTimeSpan = timeSpan;
        const selectedDate = this.selectedDate || this.start;
        this._start = selectedDate.startOf(timeSpan.unit);

        if (timeSpan.unit === 'week') {
            // Compensate the fact that luxon weeks start on Monday
            this._start = removeFromDate(this.start, 'day', 1);
        }

        this.initHeaders();

        /**
         * The event fired when the selected time span changes.
         *
         * @event
         * @name timespanselect
         * @param {string} name New selected time span name.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('timespanselect', {
                detail: { name }
            })
        );
    }

    /**
     * Handle a click on the toolbar "Today" button.
     */
    handleToolbarTodayClick() {
        this.goToDate(new Date());
    }

    /**
     * Dispatch the eventchange event.
     */
    dispatchChangeEvent(name, onlyOneOccurrence = false) {
        const detail = {
            name: name,
            draftValues: this.selection.draftValues
        };

        if (onlyOneOccurrence) {
            detail.recurrenceDates = {
                from: this.selection.occurrence.from.toUTC().toISO(),
                to: this.selection.occurrence.to.toUTC().toISO()
            };
        }

        /**
         * The event fired when a user edits an event.
         *
         * @event
         * @name eventchange
         * @param {string} name Unique name of the event.
         * @param {object} draftValues Object containing one key-value pair per changed attribute.
         * @param {object} recurrenceDates If the event is recurrent, and only one occurrence has been changed, this object will contain two keys: from and to.
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
}
