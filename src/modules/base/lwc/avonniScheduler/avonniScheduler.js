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
    equal,
    normalizeArray,
    normalizeBoolean,
    normalizeString,
    dateTimeObjectFrom,
    addToDate,
    deepCopy,
    removeFromDate
} from 'c/utilsPrivate';
import {
    getDisabledWeekdaysLabels,
    parseTimeFrame,
    positionPopover,
    previousAllowedDay,
    previousAllowedMonth,
    previousAllowedTime
} from 'c/avonniSchedulerUtils';
import { classSet, generateUUID } from 'c/utils';
import {
    EDIT_MODES,
    EVENTS_THEMES,
    EVENTS_PALETTES,
    DEFAULT_AVAILABLE_DAYS_OF_THE_WEEK,
    DEFAULT_AVAILABLE_MONTHS,
    DEFAULT_AVAILABLE_TIME_FRAMES,
    DEFAULT_COLUMNS,
    DEFAULT_DATE_FORMAT,
    DEFAULT_DIALOG_LABELS,
    DEFAULT_EVENTS_LABELS,
    DEFAULT_EVENTS_DISPLAY_FIELDS,
    DEFAULT_CONTEXT_MENU_EMPTY_SPOT_ACTIONS,
    DEFAULT_CONTEXT_MENU_EVENT_ACTIONS,
    DEFAULT_LOADING_STATE_ALTERNATIVE_TEXT,
    DEFAULT_START_DATE,
    DEFAULT_SELECTED_TIME_SPAN,
    DISPLAYS,
    PALETTES,
    SIDE_PANEL_POSITIONS,
    TIME_SPANS,
    VARIANTS
} from './avonniDefaults';

/**
 * @class
 * @descriptor avonni-scheduler
 * @storyId example-scheduler--base
 * @public
 */
export default class AvonniScheduler extends LightningElement {
    _dialogLabels = DEFAULT_DIALOG_LABELS;
    _availableDaysOfTheWeek = DEFAULT_AVAILABLE_DAYS_OF_THE_WEEK;
    _availableMonths = DEFAULT_AVAILABLE_MONTHS;
    _availableTimeFrames = DEFAULT_AVAILABLE_TIME_FRAMES;
    _columns = DEFAULT_COLUMNS;
    _contextMenuEmptySpotActions = [];
    _contextMenuEventActions = [];
    _customEventsPalette = [];
    _collapseDisabled = false;
    _dateFormat = DEFAULT_DATE_FORMAT;
    _disabledDatesTimes = [];
    _events = [];
    _eventsDisplayFields = DEFAULT_EVENTS_DISPLAY_FIELDS;
    _eventsLabels = DEFAULT_EVENTS_LABELS;
    _eventsPalette = EVENTS_PALETTES.default;
    _eventsTheme = EVENTS_THEMES.default;
    _hiddenDisplays = [];
    _hideResourcesFilter = false;
    _hideSidePanel = false;
    _hideToolbar = false;
    _isLoading = false;
    _loadingStateAlternativeText = DEFAULT_LOADING_STATE_ALTERNATIVE_TEXT;
    _readOnly = false;
    _recurrentEditModes = EDIT_MODES;
    _referenceLines = [];
    _resizeColumnDisabled = false;
    _resources = [];
    _selectedDisplay = DISPLAYS.default;
    _selectedResources = [];
    _selectedTimeSpan = DEFAULT_SELECTED_TIME_SPAN;
    _sidePanelPosition = SIDE_PANEL_POSITIONS.default;
    _start = DEFAULT_START_DATE;
    _timeSpans = TIME_SPANS.default;
    _timezone;
    _toolbarActions = [];
    _variant = VARIANTS.default;
    _zoomToFit = false;

    _closeDetailPopoverTimeout;
    _connected = false;
    _focusCalendarPopover;
    _openDetailPopoverTimeout;
    _toolbarCalendarDisabledWeekdays = [];
    _toolbarCalendarIsFocused = false;
    computedDisabledDatesTimes = [];
    computedHeaders = [];
    computedReferenceLines = [];
    computedResources = [];
    @track computedEvents = [];
    computedSelectedDisplay = {};
    contextMenuActions = [];
    currentTimeSpan = {};
    detailPopoverFields = [];
    selectedDate;
    showContextMenu = false;
    showEditDialog = false;
    showDeleteConfirmationDialog = false;
    showDetailPopover = false;
    showRecurrenceDialog = false;
    showToolbarCalendar = false;
    toolbarCalendarDisabledDates = [];
    visibleIntervalLabel;

    connectedCallback() {
        this.selectedDate = this.createDate(this.start);
        this.initReferenceLines();
        this.initCurrentTimeSpan();
        this.updateSelectedDisplay();
        this.initEvents();
        this.initResources();
        this.initToolbarCalendarDisabledDates();
        this.computeVisibleIntervalLabel(
            this.computedStart,
            this.computedStart
        );
        this._connected = true;

        this.classList.add('slds-is-relative');
        this.classList.add('slds-show');
    }

    renderedCallback() {
        // Position the detail popover
        if (this.showDetailPopover) {
            const popover = this.template.querySelector(
                '[data-element-id="div-detail-popover"]'
            );
            positionPopover(this.bounds, popover, this.selection);
        }

        // Position the context menu
        if (this.showContextMenu && this.contextMenuActions.length) {
            const contextMenu = this.template.querySelector(
                '[data-element-id="avonni-primitive-dropdown-menu"]'
            );
            positionPopover(this.bounds, contextMenu, this.selection);
        }

        // If the edit dialog is opened, focus on the first input
        if (this.showEditDialog || this.showRecurrenceDialog) {
            this.template
                .querySelector('[data-element-id="avonni-dialog"]')
                .focusOnCloseButton();
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
        const days = normalizeArray(value);
        this._availableDaysOfTheWeek =
            days.length > 0 ? days : DEFAULT_AVAILABLE_DAYS_OF_THE_WEEK;

        if (this._connected) {
            this.initToolbarCalendarDisabledDates();
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
        const months = normalizeArray(value);
        this._availableMonths =
            months.length > 0 ? months : DEFAULT_AVAILABLE_MONTHS;
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
        const timeFrames = normalizeArray(value, 'string');
        const validTimeFrames = timeFrames.filter((timeFrame) => {
            return parseTimeFrame(timeFrame).valid;
        });
        this._availableTimeFrames =
            validTimeFrames.length > 0
                ? validTimeFrames
                : DEFAULT_AVAILABLE_TIME_FRAMES;
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
     * Array of data table column objects (see [Data Table](/components/datatable/) for allowed keys). The columns are displayed to the left of the schedule and visible only for the timeline display, in horizontal variant.
     * The columns will be bound to the resources. If needed, extra keys can be added to the resource objects.
     *
     * @type {object[]}
     * @default [
     *   {
     *      label: 'Resource',
     *      fieldName: 'avatarSrc',
     *      type: 'avatar',
     *      typeAttributes: {
     *          alternativeText: { fieldName: 'name' },
     *          fallbackIconName: { fieldName: 'avatarFallbackIconName' },
     *          initials: { fieldName: 'avatarInitials' },
     *          primaryText: { fieldName: 'label' }
     *      }
     *   }
     * ]
     * @public
     */
    @api
    get columns() {
        return this._columns;
    }
    set columns(value) {
        const columns = deepCopy(normalizeArray(value, 'object'));
        this._columns = columns.length ? columns : DEFAULT_COLUMNS;
    }

    /**
     * Array of action objects. These actions will be displayed in the context menu that appears when a user right-clicks on an empty space of the schedule.
     *
     * @type {object[]}
     * @public
     * @default ['Standard.Scheduler.AddEvent']
     */
    @api
    get contextMenuEmptySpotActions() {
        return this._contextMenuEmptySpotActions;
    }
    set contextMenuEmptySpotActions(value) {
        this._contextMenuEmptySpotActions = normalizeArray(value);
    }

    /**
     * Array of action objects. These actions will be displayed in the events context menu and detail popover.
     *
     * @type {object[]}
     * @public
     * @default ['Standard.Scheduler.EditEvent', 'Standard.Scheduler.DeleteEvent']
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
     * The color strings have to be a Hexadecimal or RGB color. For example `#3A7D44` or `rgb(58, 125, 68)`.
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
            this.initEvents();
        }
    }

    /**
     * Default palette used for the event colors. Valid values include aurora, bluegrass, dusk, fire, heat, lake, mineral, nightfall, ocean, pond, sunrise, water, watermelon and wildflowers (see Palette table for more information).
     *
     * @type {string}
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
     * Array of data objects, displayed in the popover visible on hover on an event. See [Output Data](/components/output-data) for valid keys.
     * The value of each field should be a key of the selected event object.
     *
     * @type {object[]}
     * @default [
     *  {
     *     type: 'date',
     *     value: 'from'
     *  },
     *  {
     *     type: 'date',
     *     value: 'to'
     *  }
     * ]
     * @public
     */
    @api
    get eventsDisplayFields() {
        return this._eventsDisplayFields;
    }
    set eventsDisplayFields(value) {
        const fields = normalizeArray(value, 'object');
        this._eventsDisplayFields = fields.length
            ? fields
            : DEFAULT_EVENTS_DISPLAY_FIELDS;
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
     * Array of display names that should not appear in the toolbar options. Valid values include agenda, calendar and timeline.
     * If one or zero display is visible, the toolbar button will be hidden.
     *
     * @type {string[]}
     * @public
     */
    @api
    get hiddenDisplays() {
        return this._hiddenDisplays;
    }
    set hiddenDisplays(value) {
        const displays = normalizeArray(value, 'string');
        this._hiddenDisplays = displays.filter((display) => {
            return DISPLAYS.valid.includes(display);
        });
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
     * If present, the side panel will be hidden. This attribute only affects the agenda and calendar displays.
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

        if (this._connected) {
            this.initReferenceLines();
            this.initEvents();
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
     * Selected display of the scheduler. Valid values include agenda, calendar and timeline.
     *
     * @type {string}
     * @default timeline
     * @public
     */
    @api
    get selectedDisplay() {
        return this._selectedDisplay;
    }
    set selectedDisplay(value) {
        this._selectedDisplay = normalizeString(value, {
            fallbackValue: DISPLAYS.default,
            validValues: DISPLAYS.valid
        });

        if (this._connected) {
            this.updateSelectedDisplay();
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
            this.computeVisibleIntervalLabel(
                this.computedStart,
                this.computedStart
            );
        }
    }

    /**
     * Position of the side panel, relative to the schedule. This attribute only affects the agenda and calendar displays.
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
     * Starting date of the schedule. It can be a Date object, timestamp, or an ISO8601 formatted string.
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
        this._start = this.createDate(value) ? value : DEFAULT_START_DATE;

        if (this._connected) {
            this.selectedDate = this.createDate(this.start);
            this.computeVisibleIntervalLabel(
                this.computedStart,
                this.computedStart
            );
        }
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
            this.selectedDate = this.createDate(this.start);
            this.initReferenceLines();
            this.initEvents();
        }
    }

    /**
     * Array of action objects. If present, the actions will be shown in the toolbar.
     *
     * @type {object[]}
     * @public
     */
    @api
    get toolbarActions() {
        return this._toolbarActions;
    }
    set toolbarActions(value) {
        const actions = normalizeArray(value, 'object');
        if (equal(this._toolbarActions, actions)) {
            return;
        }
        this._toolbarActions = actions;
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
     * Orientation of the scheduler when the selected display is timeline. Valid values include horizontal and vertical.
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
     * Coordinates of the schedule's bounding box.
     *
     * @type {DOMRect}
     */
    get bounds() {
        return this.template.host.getBoundingClientRect();
    }

    /**
     * Display options visible in the toolbar.
     *
     * @type {object[]}
     */
    get displayOptions() {
        const allOptions = deepCopy(DISPLAYS.options);
        return allOptions.filter((display) => {
            display.checked = display.value === this.selectedDisplay;
            return !this.hiddenDisplays.includes(display.value);
        });
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
     * Start date as a Luxon DateTime object, including the timezone.
     *
     * @type {DateTime}
     */
    get computedStart() {
        return this.createDate(this.start);
    }

    get displayButtonClass() {
        return classSet('avonni-scheduler__display-menu')
            .add({
                'avonni-scheduler__toolbar-button-group_first':
                    this.toolbarActions.length
            })
            .toString();
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
     * Array of action objects, to be displayed as buttons in the event detail popover.
     *
     * @type {object[]}
     */
    get firstEventActions() {
        return this.computedContextMenuEvent.slice(0, 2);
    }

    get toolbarActionButtonClass() {
        return classSet({
            'avonni-scheduler__toolbar-button-group_last':
                this.moreThanOneDisplay
        }).toString();
    }

    /**
     * True if the selected display is agenda.
     *
     * @type {boolean}
     */
    get isAgenda() {
        return this.selectedDisplay === 'agenda';
    }

    /**
     * True if the selected display is calendar.
     *
     * @type {boolean}
     */
    get isCalendar() {
        return this.selectedDisplay === 'calendar';
    }

    /**
     * True if the selected display is timeline.
     *
     * @type {boolean}
     */
    get isTimeline() {
        return this.selectedDisplay === 'timeline';
    }

    /**
     * Array of action objects, to be displayed in a button menu, in the event detail popover.
     *
     * @type {object[]}
     */
    get lastEventActions() {
        return this.computedContextMenuEvent.slice(2);
    }

    /**
     * True if more than one display is selectable.
     *
     * @type {boolean}
     */
    get moreThanOneDisplay() {
        return this.displayOptions.length > 1;
    }

    /**
     * True if there is more than one toolbar action.
     *
     * @type {boolean}
     */
    get moreThanOneToolbarAction() {
        return this.toolbarActions.length > 1;
    }

    /**
     * If only one toolbar action is present, and it has a label, returns the action object.
     * Otherwise, returns false.
     *
     * @type {object|boolean}
     */
    get oneToolbarActionButton() {
        if (this.toolbarActions.length === 1 && this.toolbarActions[0].label) {
            return this.toolbarActions[0];
        }
        return false;
    }

    /**
     * If only one toolbar action is present, and it doesn't have a label but it has an icon, returns the action object.
     * Otherwise, returns false.
     *
     * @type {object|boolean}
     */
    get oneToolbarActionButtonIcon() {
        if (
            this.toolbarActions.length === 1 &&
            this.toolbarActions[0].iconName &&
            !this.toolbarActions[0].label
        ) {
            return this.toolbarActions[0];
        }
        return false;
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
     * Type attributes of the toolbar resource filter, visible in the timeline display.
     *
     * @type {object}
     */
    get resourceFilterTypeAttributes() {
        return {
            allowSearch: true,
            isMultiSelect: true,
            items: this.resourceOptions
        };
    }

    /**
     * Array of resources options. The objects have two keys: label and value. Used in the edit form to generate a combobox of key fields.
     *
     * @type {object[]}
     */
    get resourceOptions() {
        return this.resources.map((res) => {
            return {
                label: res.label || res.name,
                value: res.name
            };
        });
    }

    /**
     * True if the empty timeline message should be displayed.
     *
     * @type {boolean}
     */
    get showEmptyTimelineMessage() {
        return this.isTimeline && !this.showTimeline;
    }

    /**
     * If true, when editing a recurring event, the user always have the choice to save the changes only for the occurrence or for every occurrences of the event.
     *
     * @type {boolean}
     */
    get showRecurrenceSaveOptions() {
        return (
            this.recurrentEditModes.length > 1 &&
            this.selection.event.recurrence
        );
    }

    /**
     * True if the resource filter should be shown in the toolbar.
     *
     * @type {boolean}
     */
    get showResourceFilter() {
        return this.isTimeline && !this.hideResourcesFilter;
    }

    /**
     * True if the timeline should be displayed.
     *
     * @type {boolean}
     */
    get showTimeline() {
        if (!this.isTimeline) {
            return false;
        }
        return this.resources.some((res) => {
            return this.selectedResources.includes(res.name);
        });
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
     * HTML element of the primitive schedule: timeline, agenda or calendar.
     *
     * @type {HTMLElement}
     */
    get schedule() {
        if (this.isCalendar) {
            return this.template.querySelector(
                '[data-element-id="avonni-primitive-scheduler-calendar"]'
            );
        }
        if (this.isAgenda) {
            return this.template.querySelector(
                '[data-element-id="avonni-primitive-scheduler-agenda"]'
            );
        }
        return this.template.querySelector(
            '[data-element-id="avonni-primitive-scheduler-timeline"]'
        );
    }

    /**
     * Computed CSS classes for the calendar selector of the toolbar.
     *
     * @type {string}
     */
    get toolbarCalendarWrapperClass() {
        return classSet('avonni-scheduler__flex-col slds-has-flexi-truncate')
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

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Collapse the side panel. If the panel was fully expanded, collapse it to its original position. Otherwise, hide it.
     *
     * @public
     */
    @api
    collapseSidePanel() {
        if (!this.schedule) {
            return;
        }
        this.schedule.collapseSidePanel();
    }

    /**
     * Create a new event.
     *
     * @param {object} event Event object of the new event.
     * @public
     */
    @api
    createEvent(eventObject) {
        if (!this.schedule) {
            console.warn(
                `The ${this.selectedDisplay} is not available. Failed to create the event.`
            );
            return;
        }
        this.schedule.createEvent(eventObject);
    }

    /**
     * Delete an event.
     *
     * @param {string} name Unique name of the event to delete.
     * @public
     */
    @api
    deleteEvent(eventName) {
        if (!this.schedule) {
            console.warn(
                `The ${this.selectedDisplay} is not available. Failed to delete the event ${eventName}.`
            );
            return;
        }
        this.schedule.deleteEvent(eventName);
    }

    /**
     * Expand the side panel. If the panel was already opened, expand it fully. Otherwise, open it.
     *
     * @public
     */
    @api
    expandSidePanel() {
        if (!this.schedule) {
            return;
        }
        this.schedule.expandSidePanel();
    }

    /**
     * Set the focus on an event.
     *
     * @param {string} name Unique name of the event to set the focus on.
     * @public
     */
    @api
    focusEvent(eventName) {
        if (!this.schedule) {
            console.warn(
                `The ${this.selectedDisplay} is not available. Failed to set the focus on ${eventName}.`
            );
            return;
        }
        this._programmaticFocus = true;
        this.schedule.focusEvent(eventName);
    }

    /**
     * Move the position of the scheduler so the specified date is visible. The difference with setting the start attribute is that the current time span is taken into account, so the scheduler won’t necessarily start with the given date.
     *
     * @param {string | number | Date} date Date the scheduler should be positioned on.
     * @public
     */
    @api
    goToDate(date) {
        const selectedDate = this.createDate(date);
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

        if (start !== this.start) {
            /**
             * The event fired when the start date changes.
             *
             * @event
             * @name startchange
             * @param {string} value New start date, as an ISO 8601 formatted string.
             * @public
             */
            this.dispatchEvent(
                new CustomEvent('startchange', {
                    detail: { value: start.toISO() }
                })
            );
        }
        this._start = start.ts;
    }

    /**
     * Open the edit event dialog.
     *
     * @param {string} name Unique name of the event to edit.
     * @public
     */
    @api
    openEditEventDialog(eventName) {
        if (!this.schedule) {
            console.warn(
                `The ${this.selectedDisplay} is not available. Failed to open the edit event dialog.`
            );
            return;
        }

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
        if (!this.schedule) {
            console.warn(
                `The ${this.selectedDisplay} is not available. Failed to open the new event dialog.`
            );
            return;
        }
        this.selection = this.schedule.newEvent();
        if (this.selection) {
            this.hideAllPopovers();
            this.showEditDialog = true;
        }
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
     * Create the computed events.
     */
    initEvents() {
        // The disabled dates/times and reference lines are special events
        const events = this.events
            .concat(this.computedDisabledDatesTimes)
            .concat(this.computedReferenceLines);

        if (!events.length) {
            this.computedEvents = [];
            return;
        }

        events.sort((first, second) => {
            return this.createDate(first.from) < this.createDate(second.from)
                ? -1
                : 1;
        });
        this.computedEvents = events;
    }

    /**
     * Create the computed reference lines, taking the timezone into account.
     */
    initReferenceLines() {
        this.computedReferenceLines = this._referenceLines.map((line) => {
            const from = line.date
                ? this.createDate(line.date)
                : this.createDate(Date.now());
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
    }

    /**
     * Create the computed resources.
     */
    initResources() {
        let colorIndex = 0;
        this.computedResources = this.resources.map((resource) => {
            // If there is no color left in the palette,
            // restart from the beginning
            if (!this.palette[colorIndex]) {
                colorIndex = 0;
            }

            const computedResource = {
                ...resource,
                color: this.palette[colorIndex]
            };
            colorIndex += 1;
            return computedResource;
        });
    }

    /**
     * Initialize the toolbar calendar disabled dates.
     */
    initToolbarCalendarDisabledDates() {
        const disabled = getDisabledWeekdaysLabels(this.availableDaysOfTheWeek);
        this._toolbarCalendarDisabledWeekdays = disabled;
        this.toolbarCalendarDisabledDates = [...disabled];
    }

    /**
     * Compute the time interval label displayed in the toolbar.
     *
     * @param {DateTime} start Start of the time interval.
     * @param {DateTime} end End of the time interval.
     */
    computeVisibleIntervalLabel(start, end) {
        const { unit, span } = this.currentTimeSpan;
        let format;
        switch (unit) {
            case 'day':
            case 'week': {
                format = 'ccc, LLLL d, kkkk';
                break;
            }
            case 'year': {
                format = 'yyyy';
                break;
            }
            case 'month': {
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

        if (
            this.isCalendar &&
            (unit === 'month' || unit === 'year') &&
            span <= 1
        ) {
            const formatted = addToDate(start, 'week', 1).toFormat(format);
            this.visibleIntervalLabel = formatted;
        } else {
            const formattedStart = start.toFormat(format);
            const formattedEnd = end.toFormat(format);
            this.visibleIntervalLabel =
                formattedStart === formattedEnd
                    ? formattedStart
                    : `${formattedStart} - ${formattedEnd}`;
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
     * Hide the detail popover, the context menu, the edit dialog, the delete dialog and the recurrence dialog.
     */
    hideAllPopovers() {
        this.hideDetailPopover();
        this.hideContextMenu();
        this.hideEditDialog();
        this.hideDeleteConfirmationDialog();
        this.hideRecurrenceDialog();
    }

    /**
     * Hide the context menu.
     */
    hideContextMenu() {
        this.contextMenuActions.splice(0);
        this.showContextMenu = false;

        if (this.isCalendar && this._focusCalendarPopover) {
            this._focusCalendarPopover();
            this._focusCalendarPopover = null;
        }
    }

    /**
     * Hide the detail popover.
     */
    hideDetailPopover() {
        clearTimeout(this._closeDetailPopoverTimeout);
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

    /**
     * Normalize the given date to be on the first day of the month.
     *
     * @param {DateTime} date Date to normalize.
     * @returns {DateTime} First day of the month.
     */
    normalizeDateToStartOfMonth(date) {
        date = addToDate(date, 'week', 1);
        return date.startOf('month');
    }

    /**
     * Update the computed selected display object.
     */
    updateSelectedDisplay() {
        const selectedDisplay = DISPLAYS.options.find((display) => {
            return display.value === this.selectedDisplay;
        });
        this.computedSelectedDisplay = { ...selectedDisplay };
    }

    /*
     * ------------------------------------------------------------
     *  EVENT HANDLERS AND DISPATCHERS
     * -------------------------------------------------------------
     */

    /**
     * Handle the click on an action.
     *
     * @param {Event} selectEvent `privateselect` event fired by the context menu, or `select` event fired by the detail popover button menu, or `click` event fired by a detail popover button.
     */
    handleActionSelect(selectEvent) {
        const name =
            selectEvent.detail.name ||
            selectEvent.detail.value ||
            selectEvent.currentTarget.name;
        const { event, from, to } = this.selection;

        /**
         * The event fired when a user clicks on an action.
         *
         * @event
         * @name actionclick
         * @param {string} name Name of the action clicked.
         * @param {string} targetName If the action came from an existing event, name of the event.
         * @public
         * @bubbles
         */
        this.dispatchEvent(
            new CustomEvent('actionclick', {
                detail: {
                    from,
                    name,
                    targetName: event ? event.name : undefined,
                    to
                },
                bubbles: true
            })
        );

        switch (name) {
            case 'Standard.Scheduler.EditEvent':
                this.showEditDialog = true;
                break;
            case 'Standard.Scheduler.DeleteEvent':
                this.showDeleteConfirmationDialog = true;
                break;
            case 'Standard.Scheduler.AddEvent':
                this.showEditDialog = true;
                this.selection = this.schedule.newEvent(this.selection);
                this.computedEvents.push(event);
                break;
            default:
                this.schedule.cleanSelection(true);
                break;
        }
    }

    /**
     * Handle a change of the selected date.
     *
     * @param {Event} event
     */
    handleSelectedDateChange(event) {
        this.goToDate(event.detail.value);
    }

    /**
     * Handle the closing of the delete confirmation dialog.
     */
    handleCloseDeleteConfirmationDialog() {
        this.schedule.cleanSelection();
        this.hideDeleteConfirmationDialog();
    }

    /**
     * Handle a key up on the event detail popover.
     *
     * @param {Event} event `keyup` event.
     */
    handleDetailPopoverKeyUp(event) {
        if (event.key === 'Escape') {
            this.hideDetailPopover();
        }
    }

    /**
     * Handle the cursor entering the event detail popover.
     */
    handleDetailPopoverMouseEnter() {
        clearTimeout(this._closeDetailPopoverTimeout);
    }

    /**
     * Handle the cursor leaving the event detail popover.
     */
    handleDetailPopoverMouseLeave() {
        clearTimeout(this._closeDetailPopoverTimeout);
        this._closeDetailPopoverTimeout = setTimeout(() => {
            this.hideDetailPopover();
        }, 200);
    }

    /**
     * Handle the selection of a display.
     *
     * @param {Event} event
     */
    handleDisplaySelect(event) {
        this._selectedDisplay = event.detail.value;
        this.updateSelectedDisplay();

        /**
         * The event fired when a user selects a display.
         *
         * @event
         * @name displayselect
         * @param {string} name Name of the selected display.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('displayselect', {
                detail: {
                    name: this.selectedDisplay
                }
            })
        );
    }

    /**
     * Handle the click event fired by the delete button. Delete the selected event.
     */
    handleEventDelete() {
        const name = this.selection.event.name;
        this.deleteEvent(name);

        /**
         * The event fired when a user deletes an event.
         *
         * @event
         * @name eventdelete
         * @param {string} name Unique name of the deleted event.
         * @public
         * @bubbles
         */
        this.dispatchEvent(
            new CustomEvent('eventdelete', {
                detail: {
                    name
                },
                bubbles: true
            })
        );
        this.hideAllPopovers();
    }

    /**
     * Handle the selection of an event.
     *
     * @param {Event} event
     */
    handleEventSelect(event) {
        event.stopPropagation();
        if (this._programmaticFocus) {
            this._programmaticFocus = false;
            return;
        }

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
                detail: event.detail,
                bubbles: true
            })
        );
    }

    /**
     * Handle the opening of the context menu on an event.
     *
     * @param {Event} event
     */
    handleEventContextMenu(event) {
        if (!this.computedContextMenuEvent.length) {
            return;
        }
        clearTimeout(this._openDetailPopoverTimeout);
        this.hideDetailPopover();
        this.contextMenuActions = [...this.computedContextMenuEvent];
        this.selection = event.currentTarget.selectEvent(event.detail);
        this.showContextMenu = true;

        if (this.isCalendar) {
            this._focusCalendarPopover = event.detail.focusPopover;
        }
    }

    /**
     * Handle the `contextmenu` event fired by an empty spot of the schedule, or a disabled primitive event occurrence. Open the context menu and prepare for the creation of a new event at this position.
     */
    handleEmptySpotContextMenu(event) {
        if (!this.computedContextMenuEmptySpot.length) {
            return;
        }
        this.hideAllPopovers();
        this.contextMenuActions = [...this.computedContextMenuEmptySpot];
        this.showContextMenu = true;
        this.selection = event.detail;
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
        this.schedule.cleanSelection(true);
        this.selection = null;
        this.hideAllPopovers();
    }

    /**
     * Handle the closedialog event fired by the recurring event save dialog. Cancel the changes and close the dialog.
     */
    handleCloseRecurrenceDialog() {
        this.schedule.cleanSelection(true);
        this.selection = null;
        this.hideRecurrenceDialog();
    }

    /**
     * Handle the click event fired by the save buttons of the edit or recurring event dialogs. Save the changes made to the event and close the dialog.
     */
    handleSaveEvent(mouseEvent) {
        const recurrenceMode =
            mouseEvent.detail.value || mouseEvent.currentTarget.value;

        this.schedule.saveSelection(recurrenceMode);
        this.selection = null;
        this.hideAllPopovers();
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
     * Handle the change of an event.
     *
     * @param {Event} event
     */
    handleEventChange(event) {
        event.stopPropagation();

        /**
         * The event fired when a user edits an event.
         *
         * @event
         * @name eventchange
         * @param {string} name Unique name of the event.
         * @param {object} draftValues Object containing one key-value pair per changed attribute.
         * @param {object} recurrenceDates If the event is recurrent, and only one occurrence has been changed, this object will contain two keys:
         * * from
         * * to
         * @public
         * @bubbles
         */
        this.dispatchEvent(
            new CustomEvent('eventchange', {
                detail: event.detail,
                bubbles: true
            })
        );
    }

    /**
     * Handle the creation of an event.
     *
     * @param {Event} event
     */
    handleEventCreate(event) {
        event.stopPropagation();

        /**
         * The event fired when a user creates an event.
         *
         * @event
         * @name eventcreate
         * @param {object} event The event created.
         * @public
         * @bubbles
         */
        this.dispatchEvent(
            new CustomEvent('eventcreate', {
                detail: event.detail,
                bubbles: true
            })
        );
    }

    /**
     * Handle the mouse entering on an event.
     *
     * @param {Event} event
     */
    handleEventMouseEnter(event) {
        if (this.showContextMenu) {
            return;
        }

        clearTimeout(this._openDetailPopoverTimeout);
        this._openDetailPopoverTimeout = setTimeout(() => {
            clearTimeout(this._closeDetailPopoverTimeout);

            if (
                this.showDetailPopover &&
                this.selection &&
                this.selection.occurrence.key === event.detail.key
            ) {
                return;
            }
            this.showDetailPopover = true;
            this.selection = this.schedule.selectEvent(event.detail);

            this.detailPopoverFields = this.eventsDisplayFields.map((field) => {
                const { type, label, variant } = field;
                const eventData = this.selection.event.data;
                const occurrenceData = this.selection.occurrence;
                let value =
                    occurrenceData[field.value] || eventData[field.value];

                const isDate = type === 'date' && this.createDate(value);
                if (isDate) {
                    value = this.createDate(value);
                    value = value.toFormat(this.dateFormat);
                }

                return {
                    key: generateUUID(),
                    label,
                    type: isDate ? 'text' : type,
                    value,
                    variant
                };
            });

            requestAnimationFrame(() => {
                const closeButton = this.template.querySelector(
                    '[data-element-id="lightning-button-icon-detail-popover-close-button"]'
                );
                if (closeButton) {
                    closeButton.focus();
                }
            });
        }, 500);
    }

    handleEventMouseLeave(event) {
        clearTimeout(this._openDetailPopoverTimeout);
        const key = event.detail.key;
        if (this.showDetailPopover && key === this.selection.occurrence.key) {
            this.handleDetailPopoverMouseLeave();
        }
    }

    /**
     * Handle a click on a toolbar action.
     *
     * @param {Event} event click or select event.
     */
    handleToolbarActionSelect(event) {
        const name = event.detail.value || event.currentTarget.value;

        /**
         * The event fired when a user clicks on a toolbar action.
         *
         * @event
         * @name toolbaractionclick
         * @param {string} name Name of the action clicked.
         * @public
         * @bubbles
         */
        this.dispatchEvent(
            new CustomEvent('toolbaractionclick', {
                detail: { name },
                bubbles: true
            })
        );
    }

    /**
     * Handle the `hidepopovers` event dispatched by a primitive schedule. Hide the appropriate popovers.
     *
     * @param {Event} event
     */
    handleHidePopovers(event) {
        clearTimeout(this._openDetailPopoverTimeout);
        const list = event.detail.list;
        if (!list) {
            this.hideAllPopovers();
            return;
        }

        list.forEach((popover) => {
            switch (popover) {
                case 'detail':
                    this.hideDetailPopover();
                    break;
                case 'context':
                    this.hideContextMenu();
                    break;
                default:
                    break;
            }
        });
    }

    /**
     * Handle the opening of the edit dialog.
     *
     * @param {Event} event
     */
    handleOpenEditDialog(event) {
        this.showEditDialog = true;
        this.selection = event.detail.selection;
    }

    /**
     * Handle the opening of the recurrence dialog.
     *
     * @param {Event} event
     */
    handleOpenRecurrenceDialog(event) {
        this.showRecurrenceDialog = true;
        this.selection = event.detail.selection;
    }

    /**
     * Handle the selection of a resource.
     *
     * @param {Event} event
     */
    handleResourceSelect(event) {
        const { selectedResources, name } = event.detail;
        this._selectedResources = selectedResources;
        this.dispatchResourceSelectEvent(name);
    }

    /**
     * Handle a click on a time slot of the schedule.
     *
     * @param {Event} event `scheduleclick` event coming a primitive.
     */
    handleScheduleClick(event) {
        event.stopPropagation();

        /**
         * The event fired when the user clicks on a time slot of the schedule.
         *
         * @event
         * @name scheduleclick
         * @param {string} from Start of the clicked cell as an ISO 8601 string.
         * @param {string} to End of the clicked cell as an ISO 8601 string.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('scheduleclick', {
                detail: event.detail
            })
        );
    }

    /**
     * Handle the toggling of the toolbar calendar.
     *
     * @param {Event} event
     */
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

    /**
     * Handle a change in the toolbar calendar.
     *
     * @param {Event} event
     */
    handleToolbarCalendarChange(event) {
        this.showToolbarCalendar = false;
        const { value } = event.detail;
        if (!value) {
            return;
        }

        this.goToDate(value);
    }

    /**
     * Handle a focus in the toolbar calendar.
     */
    handleToolbarCalendarFocusin() {
        this._toolbarCalendarIsFocused = true;
    }

    /**
     * Handle a focus out of the toolbar calendar.
     */
    handleToolbarCalendarFocusout() {
        this._toolbarCalendarIsFocused = false;

        requestAnimationFrame(() => {
            if (!this._toolbarCalendarIsFocused) {
                this.showToolbarCalendar = false;
            }
        });
    }

    /**
     * Handle a navigate event coming from the toolbar calendar.
     *
     * @param {Event} event
     */
    handleToolbarCalendarNavigate(event) {
        const date = new Date(event.detail.date);
        const month = date.getMonth();
        this.toolbarCalendarDisabledDates = [
            ...this._toolbarCalendarDisabledWeekdays
        ];

        if (!this.availableMonths.includes(month)) {
            for (let day = 1; day < 32; day++) {
                this.toolbarCalendarDisabledDates.push(day);
            }
        }
    }

    /**
     * Handle a click on the "Next" button of the toolbar.
     */
    handleToolbarNextClick() {
        const { unit, span } = this.currentTimeSpan;
        let date = this.createDate(this.computedStart);

        if (this.isCalendar && unit === 'month') {
            // Make sure the start is on the first day of the month
            date = this.normalizeDateToStartOfMonth(date);
        }
        date = addToDate(date, unit, span);
        this.goToDate(date);
    }

    /**
     * Handle a click on the "Previous" button of the toolbar.
     */
    handleToolbarPrevClick() {
        const { unit, span } = this.currentTimeSpan;

        // If the date is set to one that is not available,
        // the headers will automatically go to the next available date,
        // preventing the schedule from going in the past
        let date = removeFromDate(this.computedStart, unit, span);
        if (unit === 'year' || unit === 'month') {
            if (this.isCalendar) {
                // Make sure the start is on the first day of the month
                date = this.normalizeDateToStartOfMonth(date);
            }
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
     * Handle the selection of a resource through the toolbar filter menu.
     *
     * @param {Event} event
     */
    handleToolbarResourceSelect(event) {
        const selectedResources = [...event.detail.value];
        let name;
        if (selectedResources.length > this.selectedResources.length) {
            name = selectedResources.find(
                (res) => !this.selectedResources.includes(res)
            );
        } else {
            name = this.selectedResources.find(
                (res) => !selectedResources.includes(res)
            );
        }
        this._selectedResources = selectedResources;
        this.dispatchResourceSelectEvent(name);
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
        const today = new Date().setHours(0, 0, 0, 0);
        if (today === this.selectedDate.ts) {
            return;
        }
        this.goToDate(today);
    }

    /**
     * Handle a change of the visible interval.
     *
     * @param {Event} event
     */
    handleVisibleIntervalChange(event) {
        if (event.detail.start.ts !== this.computedStart.ts) {
            this._start = event.detail.start.ts;
        }
        const { s, e } = event.detail.visibleInterval;
        this.computeVisibleIntervalLabel(s, e);
    }

    /**
     * Dispatch the resourceselect event.
     *
     * @param {string} name Name of the selected or unselected resource.
     */
    dispatchResourceSelectEvent(name) {
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
                    selectedResources: this.selectedResources,
                    name
                }
            })
        );
    }
}
