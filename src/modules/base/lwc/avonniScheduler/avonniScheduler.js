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
    addToDate
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
    DEFAULT_TIME_SPAN,
    HEADERS,
    PALETTES,
    PRESET_HEADERS
} from './avonniDefaults';
import SchedulerRow from './avonniRow';
import SchedulerEvent from './avonniEvent';

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
    _isLoading = false;
    _loadingStateAlternativeText = DEFAULT_LOADING_STATE_ALTERNATIVE_TEXT;
    _readOnly = false;
    _recurrentEditModes = EDIT_MODES;
    _referenceLines = [];
    _resizeColumnDisabled = false;
    _rows = [];
    _rowsKeyField;
    _start = dateTimeObjectFrom(DEFAULT_START_DATE);
    _timeSpan = DEFAULT_TIME_SPAN;

    _allEvents = [];
    _datatableRowsHeight;
    datatableWidth = 0;
    _draggedEvent;
    _draggedSplitter = false;
    _initialDatatableWidth;
    _initialState = {};
    _mouseIsDown = false;
    _numberOfVisibleCells = 0;
    _resizedEvent;
    _headerHeightChange = false;
    _visibleInterval;
    cellWidth = 0;
    computedDisabledDatesTimes = [];
    computedHeaders = [];
    computedReferenceLines = [];
    computedRows = [];
    @track computedEvents = [];
    contextMenuActions = [];
    datatableIsHidden = false;
    datatableIsOpen = false;
    scrollHeadersTo = () => {
        return true;
    };
    selectedEvent;
    showContextMenu = false;
    showEditDialog = false;
    showDeleteConfirmationDialog = false;
    showDetailPopover = false;
    showRecurrenceDialog = false;
    smallestHeader;

    connectedCallback() {
        this.crud = eventCrudMethods(this);
        this.initHeaders();
        this._connected = true;
    }

    renderedCallback() {
        if (this._headerHeightChange) {
            // The first header primitive render will set this variable to true
            // and trigger a re-render. So we return to prevent running the other calculations twice.
            this.updateDatatablePosition();
            this._headerHeightChange = false;
            return;
        }

        // Save the default datatable column width
        if (!this._initialDatatableWidth) {
            this._initialDatatableWidth = this.datatableCol.getBoundingClientRect().width;
            this.datatableWidth = this._initialDatatableWidth;
        }

        // Save the datatable row height and update the body styles
        if (!this._datatableRowsHeight) {
            this.updateDatatableRowsHeight();
        }
        this.updateOccurrencesOffsetTop();
        this.updateRowsStyle();

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
            this.template.querySelector('[data-element-id="avonni-dialog"]').focusOnCloseButton();
        }
    }

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

        // The variable change will trigger the primitive header rerender,
        // which will trigger the creation of events and rows if they are empty
        if (this._connected) {
            this.computedRows = [];
            this.computedEvents = [];
        }
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

        // The variable change will trigger the primitive header rerender,
        // which will trigger the creation of events and rows if they are empty
        if (this._connected) {
            this.computedRows = [];
            this.computedEvents = [];
        }
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

        // The variable change will trigger the primitive header rerender,
        // which will trigger the creation of events and rows if they are empty
        if (this._connected) {
            this.computedRows = [];
            this.computedEvents = [];
        }
    }

    /**
     * Array of datatable column objects. The columns are displayed to the left of the schedule. For more details on the allowed object keys, see the Data Table component.
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

        if (this._connected) this.initRows();
    }

    /**
     * Array of header objects. If present, it will overwrite the predefined headers.
     *
     * @type {object[]}
     * @public
     */
    @api
    get customHeaders() {
        return this._customHeaders;
    }
    set customHeaders(value) {
        this._customHeaders = normalizeArray(value);

        if (this._connected) {
            this.computedEvents = [];
            this.computedRows = [];
            this.initHeaders();
        }
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
     * The date format to use in the events' details popup and the labels. See {@link https://moment.github.io/luxon/#/formatting?id=table-of-tokens Luxon’s documentation} for accepted format. If you want to insert text in the label, you need to escape it using single quote.
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
            this.updateVisibleRows();
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
            this.updateVisibleRows();
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
            this.updateVisibleRows();
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
            this.initRows();
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
            this.updateVisibleRows();
        }
    }

    /**
     * Name of the header preset to use. The headers are displayed in rows above the schedule, and used to create its columns. Valid values include:
     * * minuteAndHour
     * * minuteHourAndDay
     * * hourAndDay
     * * hourDayAndWeek
     * * dayAndWeek
     * * dayLetterAndWeek
     * * dayWeekAndMonth
     * * weekAndMonth
     * * weekMonthAndYear
     * * monthAndYear
     * * quartersAndYear
     * * fiveYears
     *
     * @type {string}
     * @public
     * @default hourAndDay
     */
    @api
    get headers() {
        return this._headers;
    }
    set headers(value) {
        this._headers = normalizeString(value, {
            fallbackValue: HEADERS.default,
            validValues: HEADERS.valid,
            toLowerCase: false
        });

        if (this._connected) {
            this.computedRows = [];
            this.computedEvents = [];
            this.initHeaders();
        }
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
            this.updateVisibleRows();
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
     * Array of datatable data objects. Each object represents a row of the scheduler. For more details, see the Data Table component.
     *
     * @type {object[]}
     * @public
     * @required
     */
    @api
    get rows() {
        return this._rows;
    }
    set rows(value) {
        this._rows = normalizeArray(value);

        if (this._connected) this.initRows();
    }

    /**
     * Name of a key of the row objects. This key needs to be present in all row objects. Its value needs to be unique to a row, as it will be used as the row identifier.
     *
     * @type {string}
     * @public
     * @required
     */
    @api
    get rowsKeyField() {
        return this._rowsKeyField;
    }
    set rowsKeyField(value) {
        this._rowsKeyField = value.toString();

        if (this._connected) this.initRows();
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

        if (this._connected) this.initHeaders();
    }

    /**
     * Object used to set the duration of the scheduler. It has two keys:
     * * <code>unit</code>. Valid values include minute, hour, day, week, month and year.
     * * <code>span</code>. The number of unit the scheduler will show.
     * For example, if the scheduler should be four-day long, the value would be: <code>{ unit: ‘day’, span: 4 }</code>
     *
     * @type {object}
     * @public
     * @default { unit: ‘hour’, span: 12 }
     * @required
     */
    @api
    get timeSpan() {
        return this._timeSpan;
    }
    set timeSpan(value) {
        this._timeSpan = typeof value === 'object' ? value : DEFAULT_TIME_SPAN;

        if (this._connected) this.initHeaders();
    }

    /**
     * Array of resources options. The objects have two keys: label and value. Used in the edit form to generate a combobox of key fields.
     *
     * @type {object[]}
     */
    get resourcesComboboxOptions() {
        const options = [];
        this.rows.forEach((row) => {
            if (row.resourceName) {
                options.push({
                    label: row.resourceName,
                    value: row[this.rowsKeyField]
                });
            }
        });
        return options;
    }

    /**
     * Datatable HTML Element.
     *
     * @type {HTMLElement}
     */
    get datatable() {
        return this.template.querySelector('[data-element-id="avonni-datatable"]');
    }

    /**
     * Datatable column HTML Element.
     *
     * @type {HTMLElement}
     */
    get datatableCol() {
        return this.template.querySelector('.avonni-scheduler__datatable-col');
    }

    /**
     * Class list of the datable column.
     *
     * @type {string}
     * @default 'slds-border_right avonni-scheduler__datatable-col slds-grid'
     */
    get datatableColClass() {
        return classSet(
            'slds-border_right avonni-scheduler__datatable-col slds-grid'
        )
            .add({
                'avonni-scheduler__datatable-col_hidden': this
                    .datatableIsHidden,
                'avonni-scheduler__datatable-col_open': this.datatableIsOpen
            })
            .toString();
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
        return !this.collapseDisabled && !this.datatableIsHidden;
    }

    /**
     * If true, the right collapse button is displayed on the splitter bar.
     *
     * @type {boolean}
     * @default true
     */
    get showCollapseRight() {
        return !this.collapseDisabled && !this.datatableIsOpen;
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
     * If true, a loading spinner is displayed on the left of the schedule.
     *
     * @type {boolean}
     * @default false
     */
    get showLeftInfiniteLoadSpinner() {
        if (!this.smallestHeader || this.isLoading) return false;

        const firstVisibleColumn = this.smallestHeader.columns[0];
        const firstVisibleTime =
            firstVisibleColumn && dateTimeObjectFrom(firstVisibleColumn.start);
        return firstVisibleTime > this.smallestHeader.start;
    }

    /**
     * If true, a loading spinner is displayed on the right of the schedule.
     *
     * @type {boolean}
     * @default false
     */
    get showRightInfiniteLoadSpinner() {
        if (!this.smallestHeader || this.isLoading) return false;

        const lastVisibleColumn = this.smallestHeader.columns[
            this.smallestHeader.columns.length - 1
        ];
        const lastVisibleTime =
            lastVisibleColumn && dateTimeObjectFrom(lastVisibleColumn.end);
        return lastVisibleTime < this.smallestHeader.end;
    }

    /**
     * Duration of one column of the smallest unit header, in milliseconds.
     *
     * @type {number}
     * @default 0
     */
    get smallestColumnDuration() {
        const header = this.smallestHeader;
        if (!header) return 0;

        const headerColumnEnd =
            addToDate(header.start, header.unit, header.span) - 1;
        return dateTimeObjectFrom(headerColumnEnd).diff(header.start)
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
                'avonni-scheduler__splitter_disabled': this
                    .resizeColumnDisabled,
                'slds-grid_align-end': this.datatableIsOpen
            })
            .toString();
    }

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

    /**
     * Create the computed headers.
     */
    initHeaders() {
        // Use the custom headers or a preset
        let headers = [...this.customHeaders];
        if (!headers.length) {
            const presetConfig = PRESET_HEADERS.find(
                (preset) => preset.name === this.headers
            );
            headers = presetConfig.headers;
        }

        this.computedHeaders = headers;
    }

    /**
     * Create the computed events.
     */
    initEvents() {
        if (!this.smallestHeader) return;

        // The disabled dates/times and reference lines are special events
        this._allEvents = this.events
            .concat(this.computedDisabledDatesTimes)
            .concat(this.computedReferenceLines);

        if (!this._allEvents.length) return;

        this._allEvents.sort((first, second) => {
            return (
                dateTimeObjectFrom(first.from) < dateTimeObjectFrom(second.from)
            );
        });

        // Create only the visible events
        this.computedEvents = this.createVisibleEvents();
    }

    /**
     * Create the computed rows.
     */
    initRows() {
        if (!this.smallestHeader || !this.rows || !this.rowsKeyField) return;

        let colorIndex = 0;
        this.computedRows = this.rows.map((row) => {
            const rowKey = row[this.rowsKeyField];

            // If there is no color left in the palette,
            // restart from the beginning
            if (!this.palette[colorIndex]) {
                colorIndex = 0;
            }

            const occurrences = this.getOccurrencesFromRowKey(rowKey);

            const computedRow = new SchedulerRow({
                color: this.palette[colorIndex],
                key: rowKey,
                referenceColumns: this.smallestHeader.columns,
                events: occurrences,
                // We store the initial row object in a variable,
                // in case one of its fields is used by an event's label
                data: { ...row }
            });

            // If there's already been a render and we know the datatable rows height,
            // assign the min-height of the row
            if (this._datatableRowsHeight) {
                const dataRowHeight = this._datatableRowsHeight.find(
                    (dataRow) => dataRow.rowKey === rowKey
                ).height;
                computedRow.minHeight = dataRowHeight;
            }

            colorIndex += 1;
            return computedRow;
        });
    }

    /**
     * Set the initial state of a dragged or resized event.
     *
     * @param {number} mouseX The position of the mouse on the horizontal axis.
     * @param {number} mouseY The position of the mouse on the vertical axis.
     */
    initDraggedEventState(mouseX, mouseY) {
        // Save the initial position values
        const scheduleElement = this.template.querySelector(
            '.avonni-scheduler__body'
        );
        const schedulePosition = scheduleElement.getBoundingClientRect();
        const eventPosition = this._draggedEvent.getBoundingClientRect();

        const leftBoundary =
            this._resizeSide === 'right'
                ? eventPosition.left + 24
                : schedulePosition.left + (mouseX - eventPosition.left);
        const rightBoundary =
            this._resizeSide === 'left'
                ? eventPosition.right - 24
                : schedulePosition.right + (mouseX - eventPosition.right);

        this._initialState = {
            mouseX,
            mouseY,
            initialX: this._draggedEvent.x,
            initialY: this._draggedEvent.y,
            eventLeft: eventPosition.left,
            eventRight: eventPosition.right,
            eventWidth: eventPosition.width,
            left: leftBoundary,
            right: rightBoundary,
            top: schedulePosition.top + (mouseY - eventPosition.top),
            bottom: schedulePosition.bottom + (mouseY - eventPosition.bottom),
            row: this.getRowFromPosition(mouseY)
        };
    }

    /**
     * Set the rows height and cell width.
     */
    updateRowsStyle() {
        const rows = this.template.querySelectorAll('.avonni-scheduler__row');

        rows.forEach((row, index) => {
            const key = row.dataset.key;
            const computedRow = this.getRowFromKey(key);
            const rowHeight = computedRow.height;

            const dataRowHeight = this._datatableRowsHeight.find(
                (dataRow) => dataRow.rowKey === key
            ).height;

            row.style = `
                min-height: ${dataRowHeight}px;
                height: ${rowHeight}px;
                --avonni-scheduler-cell-width: ${this.cellWidth}px;
            `;

            if (index === 0) {
                this.datatable.setRowHeight(key, rowHeight - 1);
            } else {
                this.datatable.setRowHeight(key, rowHeight);
            }
        });
    }

    /**
     * Update the cell width property if the cells grew because the splitter moved.
     */
    updateCellWidth() {
        const cell = this.template.querySelector('.avonni-scheduler__cell');
        const cellWidth = cell.getBoundingClientRect().width;
        if (cellWidth !== this.cellWidth) {
            this.cellWidth = cellWidth;
            this._updateOccurrencesWidth = true;
        }
    }

    /**
     * Vertically align the datatable header with the smallest unit schedule header.
     */
    updateDatatablePosition() {
        const headers = this.template.querySelector(
            '[data-element-id="avonni-primitive-scheduler-header-group"]'
        );
        this.datatable.style.marginTop = `${headers.offsetHeight - 39}px`;
    }

    /**
     * Save the datatable rows heights and use them as a min-height for the schedule rows.
     */
    updateDatatableRowsHeight() {
        if (!this.datatable || !this.computedRows.length) return;

        this._datatableRowsHeight = [];
        this.computedRows.forEach((row) => {
            const rowKey = row.key;
            const height = this.datatable.getRowHeight(rowKey);
            this._datatableRowsHeight.push({ rowKey, height });
            row.minHeight = height;
        });
    }

    /**
     * Update the width of the resized event.
     */
    updateDraggedEventStyleAfterResize(x) {
        const side = this._resizeSide;
        const eventWidth = this._initialState.eventWidth;
        const event = this._draggedEvent;
        const multiplier = side === 'left' ? -1 : 1;
        const computedX = side === 'left' ? x + this._initialState.initialX : x;

        const width = eventWidth + x * multiplier;
        event.style.width = `${width}px`;

        if (side === 'left') {
            event.x = computedX;
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
        event.schedulerEnd = this._visibleInterval.e;
        event.schedulerStart = this._visibleInterval.s;
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
     * Compute the vertical position of the events and the rows height, so the events don't overlap.
     */
    updateOccurrencesOffsetTop() {
        const schedule = this.template.querySelector('.avonni-scheduler__body');
        const scheduleRightBorder = schedule.getBoundingClientRect().right;

        // For each row
        this.computedRows.forEach((row) => {
            let rowHeight = 0;
            let levelHeight = 0;

            // Get all the event occurrences of the row
            const occurrenceElements = Array.from(
                this.template.querySelectorAll(
                    `.avonni-scheduler__primitive-event[data-row-key="${row.key}"]`
                )
            );

            if (occurrenceElements.length) {
                // Sort the occurrences by ascending start date
                occurrenceElements.sort((a, b) => a.from - b.from);

                // Compute the vertical level of the occurrences
                const previousOccurrences = [];
                occurrenceElements.forEach((occElement) => {
                    const left = occElement.leftPosition;
                    const level = this.computeEventVerticalLevel(
                        previousOccurrences,
                        left
                    );

                    // If the occurrence is taller than the previous ones,
                    // update the default level height
                    const height = occElement.getBoundingClientRect().height;
                    if (height > levelHeight) {
                        levelHeight = height;
                    }

                    const occurrence = row.events.find(
                        (occ) => occ.key === occElement.occurrenceKey
                    );

                    previousOccurrences.unshift({
                        level,
                        left,
                        right: occElement.rightPosition,
                        occurrence:
                            occurrence ||
                            (this.selection && this.selection.occurrence)
                    });

                    // Hide the right label
                    if (occElement.labels.right) {
                        const elementRightBorder =
                            occElement.getBoundingClientRect().right +
                            occElement.rightLabelWidth;
                        if (elementRightBorder >= scheduleRightBorder) {
                            occElement.hideRightLabel();
                        } else {
                            occElement.showRightLabel();
                        }
                    }
                });

                // Add the corresponding offset to the top of the occurrences
                previousOccurrences.forEach((position) => {
                    const offsetTop = position.level * levelHeight;
                    position.occurrence.offsetTop = offsetTop;

                    // If the occurrence offset is bigger than the previous occurrences,
                    // update the row height
                    const totalHeight = levelHeight + offsetTop;
                    if (totalHeight > rowHeight) {
                        rowHeight = totalHeight;
                    }
                });
            }

            // Add 10 pixels to the row for padding
            row.height = rowHeight + 10;
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
            if (occurrence.disabled) {
                occurrence.updateHeight();
            }
            if (this._updateOccurrencesWidth) {
                occurrence.updateWidth();
            }
            occurrence.updatePosition();
        });
        this._updateOccurrencesWidth = false;
    }

    /**
     * Update the columns and events of the currently loaded rows.
     */
    updateVisibleRows() {
        this.computedRows.forEach((computedRow) => {
            computedRow.events = this.getOccurrencesFromRowKey(computedRow.key);
            computedRow.referenceColumns = this.smallestHeader.columns;
            computedRow.initColumns();
        });
    }

    /**
     * Find the cell element at a given schedule position.
     *
     * @param {HTMLElement} row The row element the cell is in.
     * @param {number} x The horizontal position of the cell.
     * @returns {(HTMLElement|undefined)} The cell element or undefined.
     */
    getCellFromPosition(row, x) {
        const cells = Array.from(
            row.querySelectorAll('.avonni-scheduler__cell')
        );

        return cells.find((td, index) => {
            const left = td.getBoundingClientRect().left;
            const right = td.getBoundingClientRect().right;

            // Handle the cases where the events are on the side
            // and the mouse moved out of the schedule
            if (index === 0 && left >= x) return td;
            if (index === cells.length - 1 && x > right) return td;

            if (x >= left && x < right) return td;
            return undefined;
        });
    }

    /**
     * Find the event occurrences for a given row key field.
     *
     * @param {string} key The unique key of the row.
     * @returns {object[]} Array of occurrence objects.
     */
    getOccurrencesFromRowKey(key) {
        const occurrences = [];
        this.computedEvents.forEach((event) => {
            if (!event.disabled) {
                const occ = event.occurrences.filter((occurrence) => {
                    return occurrence.rowKey === key;
                });
                occurrences.push(occ);
            }
        });

        return occurrences.flat();
    }

    /**
     * Find a computed row from its key field value.
     *
     * @param {string} key The unique key of the row.
     * @returns {SchedulerRow} The computed row object.
     */
    getRowFromKey(key) {
        return this.computedRows.find((row) => row.key === key);
    }

    /**
     * Find a row element from its position in the schedule.
     *
     * @param {number} y The vertical position of the row.
     * @returns {(HTMLElement|undefined)} The row element or undefined.
     */
    getRowFromPosition(y) {
        const rows = Array.from(
            this.template.querySelectorAll('.avonni-scheduler__row')
        );
        return rows.find((tr) => {
            const top = tr.getBoundingClientRect().top;
            const bottom = tr.getBoundingClientRect().bottom;

            if (y >= top && y <= bottom) return tr;
            return undefined;
        });
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
        const lastColumn = this.columns[this.columns.length - 1];
        if (lastColumn.initialWidth) {
            lastColumn.initialWidth = undefined;
            this._columns = [...this.columns];
        }
    }

    /**
     * Push an event occurrence down a level, until it doesn't overlap another occurrence.
     *
     * @param {object[]} previousOccurrences Array of previous occurrences for which the vertical level has already been computed.
     * @param {number} left Left position of the occurrence.
     * @param {number} level Vertical level of the occurrence. It starts at 0, so the occurrence is at the top of its row.
     * @returns {number} Vertical level of the occurrence.
     */
    computeEventVerticalLevel(previousOccurrences, left, level = 0) {
        // Find the last event with the same level
        const sameOffset = previousOccurrences.find((occ) => {
            return occ.level === level;
        });

        // If we find an event and their dates overlap, add one to the level
        // and make sure there isn't another event at the same height
        if (sameOffset && left < sameOffset.right) {
            level += 1;
            level = this.computeEventVerticalLevel(
                previousOccurrences,
                left,
                level
            );
        }

        return level;
    }

    /**
     * Create the computed events that are included in the currently loaded interval of time.
     */
    createVisibleEvents() {
        const interval = this._visibleInterval;
        if (!interval) return [];

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
     * Make sure the currently resized event occurrence doesn't overlap another event. If it is, save the resizing to the event so the schedule rerenders. Else, visually resize it without saving the change in the event.
     *
     * @param {number} x New horizontal position of the occurrence.
     */
    resizeEventToX(x) {
        const occurrence = this.selection.occurrence;
        const { row, mouseX } = this._initialState;
        const distanceMoved = x - mouseX;

        // If a new event is created through click and drag,
        // Set the direction the user is going to
        if (this.selection.newEvent) {
            this._resizeSide = distanceMoved >= 0 ? 'right' : 'left';
        }

        const labelWidth =
            this._resizeSide === 'left'
                ? this._draggedEvent.leftLabelWidth * -1
                : this._draggedEvent.rightLabelWidth;
        const computedX = x + labelWidth;

        // Get the events present in the cell crossed
        const hoveredCell = this.getCellFromPosition(row, computedX);
        const computedRow = this.getRowFromKey(row.dataset.key);
        const computedCell = computedRow.getColumnFromStart(
            Number(hoveredCell.dataset.start)
        );
        const cellEvents = computedCell.events;

        // Check if any event in the cell has the same offsetTop
        const eventIsHovered = cellEvents.some((cellEvent) => {
            return (
                cellEvent.offsetTop === occurrence.offsetTop &&
                cellEvent.key !== occurrence.key
            );
        });

        // If one of them do, the dragged event is overlapping it.
        // We have to rerender the scheduler so the row height enlarges.
        if (eventIsHovered) {
            const cell = labelWidth
                ? hoveredCell
                : this.getCellFromPosition(row, x);
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

        // Remove the occurrence from the row
        const rowKey = occurrence.rowKey;
        const row = this.getRowFromKey(rowKey);
        row.removeEvent(occurrence);

        if (side === 'right') {
            // Update the end date if the event was resized from the right
            occurrence.to = dateTimeObjectFrom(Number(cell.dataset.end) + 1);
        } else if (side === 'left') {
            // Update the start date if the event was resized from the left
            occurrence.from = dateTimeObjectFrom(Number(cell.dataset.start));
        }

        // Add the occurrence to the row with the updated start/end date
        row.events.push(occurrence);
        row.addEventToColumns(occurrence);

        // Force the rerender
        this.computedEvents = [...this.computedEvents];
    }

    /**
     * Drag an event to a cell and save the change.
     *
     * @param {HTMLElement} row The row element the event is being dragged to.
     * @param {HTMLElement} cell The cell element the event is being dragged to.
     */
    dragEventTo(row, cell) {
        const { occurrence, draftValues } = this.selection;

        // Update the start and end date
        const duration = occurrence.to - occurrence.from;
        const start = dateTimeObjectFrom(Number(cell.dataset.start));
        draftValues.from = start.toUTC().toISO();
        draftValues.to = addToDate(start, 'millisecond', duration + 1)
            .toUTC()
            .toISO();

        // Update the rows
        const rowKey = row.dataset.key;
        const previousRowKey = occurrence.rowKey;

        if (previousRowKey !== rowKey) {
            const keyFieldIndex = occurrence.keyFields.findIndex(
                (key) => key === previousRowKey
            );
            draftValues.keyFields = [...occurrence.keyFields];
            draftValues.keyFields.splice(keyFieldIndex, 1);

            if (!draftValues.keyFields.includes(rowKey)) {
                draftValues.keyFields.push(rowKey);
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
     * Handle the privateheaderregister event fired by the primitive header. Save the header callback method to a variable.
     */
    handleHeaderRegister(event) {
        this.scrollHeadersTo = event.detail.callbacks.scrollHeadersTo;
    }

    /**
     * Handle the privatecellwidthchange event fired by the primitive header. Save the smallest unit header cell width to a variable.
     */
    handleHeaderCellWidthChange(event) {
        this.cellWidth = event.detail.cellWidth;
    }

    /**
     * Handle the privateheaderchange event fired by the primitive header. Save the smallest unit header to a variable and make sure the datatable position will be updated on next render.
     */
    handleHeaderChange(event) {
        this.smallestHeader = event.detail.smallestHeader;
        this._headerHeightChange = true;
    }

    /**
     * Handle the privatevisibleheaderchange event fired by the primitive header. Create the computed events and computed rows of the new visible interval.
     */
    handleHeaderVisibleCellsChange(event) {
        const { direction, visibleCells, visibleInterval } = event.detail;
        this._numberOfVisibleCells = visibleCells;
        this._visibleInterval = visibleInterval;

        // Create the visible events
        if (!this.computedEvents.length) {
            this.initEvents();
        } else {
            this.computedEvents = this.createVisibleEvents();
        }
        // Create the rows or update the visible columns
        if (!this.computedRows.length) {
            this.initRows();
        } else {
            this.updateVisibleRows();
        }

        if (direction) {
            const schedule = this.template.querySelector(
                '.avonni-scheduler__wrapper'
            );
            const scrollOffset = this.cellWidth * visibleCells;
            const scrollValue =
                schedule.scrollLeft <= scrollOffset * 2
                    ? schedule.scrollLeft + scrollOffset
                    : schedule.scrollLeft - scrollOffset;
            schedule.scrollTo({ left: scrollValue });
        }
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
        if (mouseEvent.button || this.readOnly) return;

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
        if (this._mouseIsDown || this.showContextMenu) return;

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
     * Handle the mousemove event fired by the schedule. If the splitter is being clicked, compute its movement. If an event is being clicked, compute its resizong or dragging.
     */
    handleMouseMove(mouseEvent) {
        if (!this._mouseIsDown) return;

        // Prevent scrolling
        mouseEvent.preventDefault();

        // The splitter between the datatable and the schedule is being dragged
        if (this._draggedSplitter) {
            const { mouseX, datatableWidth } = this._initialState;
            const x = mouseEvent.clientX;
            const width = datatableWidth + (x - mouseX);

            this.datatable.style.width = `${width}px`;
            this.datatableCol.style.width = `${width}px`;
            this.datatableWidth = width;
            this.updateCellWidth();

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
                this.resizeEventToX(position.x);
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
            this.updateVisibleRows();
        }
    }

    /**
     * Handle the mouseup event fired by the schedule. Save the splitter or the dragged/resized event new position.
     */
    handleMouseUp(mouseEvent) {
        this._mouseIsDown = false;
        if (mouseEvent.button !== 0) return;

        if (this._draggedSplitter) {
            this._draggedSplitter = false;
        } else if (this.selection && this.selection.isMoving) {
            // Get the new position
            const { mouseX, eventLeft, eventRight } = this._initialState;
            const { draftValues, newEvent, event, occurrence } = this.selection;
            const side = this._resizeSide;
            const position = this.normalizeMousePosition(
                mouseEvent.clientX,
                mouseEvent.clientY
            );
            const leftX = position.x - (mouseX - eventLeft);
            const rightX = position.x + (eventRight - mouseX);
            const x = side === 'right' ? rightX : leftX;
            const y = position.y;

            // Find the row and cell the event was dropped on
            const rowElement = this.getRowFromPosition(y);
            const cellElement = this.getCellFromPosition(rowElement, x);

            // Update the draft values
            const to = dateTimeObjectFrom(Number(cellElement.dataset.end) + 1);
            const from = dateTimeObjectFrom(Number(cellElement.dataset.start));
            switch (side) {
                case 'right':
                    draftValues.to = to.toUTC().toISO();
                    if (newEvent) occurrence.to = to;
                    break;
                case 'left':
                    draftValues.from = from.toUTC().toISO();
                    if (newEvent) occurrence.from = from;
                    break;
                default:
                    this.dragEventTo(rowElement, cellElement);
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
                this.updateVisibleRows();
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
            this._datatableRowsHeight = undefined;
            this.computedRows.forEach((row) => {
                row.minHeight = undefined;
            });
            this.computedRows = [...this.computedRows];
        } else {
            this.updateDatatableRowsHeight();
            this.updateRowsStyle();
        }
    }

    /**
     * Handle the privatecontextmenu event fired by a primitive event occurrence. Select the event and open its context menu.
     */
    handleEventContextMenu(mouseEvent) {
        const target = mouseEvent.currentTarget;
        if (target.disabled || target.referenceLine) return;

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
     * Handle the change event fired by the edit dialog key fields combobox. Save the new row keys to the draft values.
     */
    handleEventKeyFieldsChange(event) {
        const keyFields = event.detail.value;
        this.selection.draftValues.keyFields = keyFields;
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
            const row = this._initialState.row;
            let x;
            if (this._resizeSide === 'left') {
                x = this._initialState.eventLeft;
            } else {
                x = this._initialState.eventRight;
            }
            const initialCell = this.getCellFromPosition(row, x);
            this.resizeEventToCell(initialCell);
        }
        this.cleanDraggedElement();
        this.cleanSelection();
        this.hideRecurrenceDialog();
        this.updateVisibleRows();
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
            if (occurrence.from !== event.from) event._from = occurrence.from;
            if (occurrence.to !== event.to) event._to = occurrence.to;
            if (occurrence.title !== event.title)
                event.title = occurrence.title;
            if (occurrence.keyFields !== event.keyFields)
                event.keyFields = occurrence.keyFields;

            // Update the event with the draft values from the edit form
            this.crud.saveEvent();
        }

        this.updateVisibleRows();
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
            this.template.querySelector('[data-element-id^="avonni-dialog"]').focusOnCloseButton();
        }
    }

    /**
     * Handle the scroll event fired by the schedule. Trigger the headers, events and rows reloading if the scroll is big enough. Hide the popovers of the events that are scrolled out of the screen.
     */
    handleScroll() {
        if (this.showDetailPopover) {
            // Hide the detail popover only if it goes off screen
            const right = this._draggedEvent.getBoundingClientRect().right;
            if (right < 0) this.hideDetailPopover();
        } else {
            this.hideDetailPopover();
            this.hideContextMenu();
        }

        const schedule = this.template.querySelector(
            '.avonni-scheduler__wrapper'
        );
        const scroll = schedule.scrollLeft;
        const scrollOffset = this.cellWidth * this._numberOfVisibleCells;
        const startOfSchedule =
            this._visibleInterval.s.ts === this.smallestHeader.start.ts;
        const loadLeftSchedule = !startOfSchedule && scroll <= scrollOffset;
        const loadRightSchedule = scroll >= scrollOffset * 3;

        // If the scroll value is at less or more than a quarter of the visible interval,
        // reload the schedule with a new interval
        if (loadRightSchedule || loadLeftSchedule) {
            const direction = loadRightSchedule ? 'right' : 'left';
            this.scrollHeadersTo(direction);
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
        this._initialState = {
            mouseX: mouseEvent.clientX,
            datatableWidth: this.datatable.offsetWidth
        };
        this.datatableIsHidden = false;
        this.datatableIsOpen = false;
        this.hideAllPopovers();
    }

    /**
     * Handle the click event fired by the splitter left collapse button. If the datatable column was taking the full screen, resize it to its initial width. Else, hide the datatable column.
     */
    handleHideDatatable() {
        this.hideAllPopovers();
        this.datatableCol.style.width = null;

        if (this.datatableIsOpen) {
            this.datatableIsOpen = false;
            this.datatable.style.width = null;
            this.datatableWidth = this._initialDatatableWidth;
        } else {
            this.datatableIsHidden = true;
            this.datatable.style.width = 0;
            this.datatableWidth = 0;
        }

        this.updateCellWidth();
    }

    /**
     * Handle the click event fired by the splitter right collapse button. If the datatable column was hidden, resize it to its initial width. Else, make it full screen.
     */
    handleOpenDatatable() {
        this.hideAllPopovers();
        this.datatableCol.style.width = null;
        this.datatable.style.width = null;
        this.clearDatatableColumnWidth();

        if (this.datatableIsHidden) {
            this.datatableIsHidden = false;
            this.datatable.style.width = `${this._initialDatatableWidth}px`;
            this.datatableWidth = this._initialDatatableWidth;
            this.updateCellWidth();
        } else {
            this.datatableIsOpen = true;
            const width = this.template.host.getBoundingClientRect().width;
            this.datatable.style.width = `${width}px`;
            this.datatableWidth = width;
        }
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
