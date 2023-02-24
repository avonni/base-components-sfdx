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
import { classSet } from 'c/utils';
import { DateTime } from 'c/luxon';
import {
    classListMutation,
    dateTimeObjectFrom,
    getWeekday,
    getWeekNumber,
    normalizeArray,
    normalizeBoolean,
    normalizeObject,
    normalizeString
} from 'c/utilsPrivate';
import { isAllDay, spansOnMoreThanOneDay } from 'c/avonniSchedulerUtils';
import disabled from './avonniDisabled.html';
import eventOccurrence from './avonniEventOccurrence.html';
import referenceLine from './avonniReferenceLine.html';

const DEFAULT_DATE_FORMAT = 'ff';
const VARIANTS = {
    default: 'timeline-horizontal',
    valid: [
        'agenda',
        'calendar-horizontal',
        'calendar-month',
        'calendar-vertical',
        'timeline-horizontal',
        'timeline-vertical'
    ]
};

/**
 * Event occurrence displayed by the scheduler.
 *
 * @class
 * @descriptor c-primitive-scheduler-event-occurrence
 */
export default class AvonniPrimitiveSchedulerEventOccurrence extends LightningElement {
    /**
     * Background color of the occurrence.
     *
     * @type {string}
     * @public
     */
    @api color;

    /**
     * Unique name of the event this occurrence belongs to.
     *
     * @type {string}
     * @public
     */
    @api eventName;

    /**
     * The Lightning Design System name of the icon. Names are written in the format utility:user.
     * The icon is only used by the disabled occurrences and is appended to the left of the title.
     *
     * @type {string}
     * @public
     */
    @api iconName;

    /**
     * Unique key of the occurrence.
     *
     * @type {string}
     * @public
     */
    @api occurrenceKey;

    /**
     * Theme of the occurrence.
     * If the event is a reference line, valid values include default, inverse, success, warning, error and lightest. Otherwise, valid values include default, transparent, line, hollow and rounded.
     *
     * @type {string}
     * @public
     */
    @api theme;

    _cellDuration = 0;
    _cellHeight = 0;
    _cellWidth = 0;
    _headerCells = [];
    _dateFormat = DEFAULT_DATE_FORMAT;
    _eventData = {};
    _scrollOffset = 0;
    _disabled = false;
    _event;
    _from;
    _labels = {};
    _occurrence = {};
    _readOnly = false;
    _referenceLine = false;
    _resourceKey;
    _resources = [];
    _timezone;
    _title;
    _to;
    _variant = VARIANTS.default;
    _x = 0;
    _y = 0;
    _zoomToFit = false;

    _focused = false;
    _offsetStart = 0;
    computedLabels = {};

    connectedCallback() {
        this.initLabels();
        this._connected = true;
    }

    renderedCallback() {
        this.updatePosition();
        this.updateLength();
        this.updateThickness();
        this.updateStickyLabels();
    }

    render() {
        if (this.disabled) return disabled;
        if (this.referenceLine) return referenceLine;
        return eventOccurrence;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Duration of a scheduler column, in milliseconds.
     *
     * @type {number}
     * @public
     * @default 0
     */
    @api
    get cellDuration() {
        return this._cellDuration;
    }
    set cellDuration(value) {
        this._cellDuration = !isNaN(Number(value)) ? Number(value) : 0;

        if (this._connected) {
            this.updateLength();
            this.updateStickyLabels();
        }
    }

    /**
     * Height of a cell, in pixels.
     *
     * @type {number}
     * @public
     * @default 0
     */
    @api
    get cellHeight() {
        return this._cellHeight;
    }
    set cellHeight(value) {
        this._cellHeight = !isNaN(Number(value)) ? Number(value) : 0;

        if (this._connected) {
            this.updatePosition();
            this.updateLength();
        }
    }

    /**
     * Width of a cell, in pixels.
     *
     * @type {number}
     * @public
     * @default 0
     */
    @api
    get cellWidth() {
        return this._cellWidth;
    }
    set cellWidth(value) {
        this._cellWidth = !isNaN(Number(value)) ? Number(value) : 0;

        if (this._connected) {
            this.updatePosition();
            this.updateLength();
            this.updateStickyLabels();
        }
    }

    /**
     * Luxon date format to use in the labels.
     *
     * @type {string}
     * @public
     */
    @api
    get dateFormat() {
        return this._dateFormat;
    }
    set dateFormat(value) {
        this._dateFormat =
            typeof value === 'string' ? value : DEFAULT_DATE_FORMAT;

        if (this._connected) this.initLabels();
    }

    /**
     * If present, the occurrence is a disabled date/time.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = normalizeBoolean(value);

        if (this._connected) {
            this.updateThickness();
        }
    }

    /**
     * Initial event object, before it was computed and transformed into a SchedulerEvent.
     * It may be used by the labels.
     *
     * @type {object}
     * @public
     */
    @api
    get eventData() {
        return this._eventData;
    }
    set eventData(value) {
        this._eventData = typeof value === 'object' ? value : {};

        if (this._connected) this.initLabels();
    }

    /**
     * Start date of the occurrence.
     *
     * @type {DateTime}
     * @public
     * @required
     */
    @api
    get from() {
        return this._from;
    }
    set from(value) {
        this._from = value instanceof DateTime ? value : this.createDate(value);

        if (this._connected) {
            this.updatePosition();
            this.updateLength();
            this.updateStickyLabels();
        }
    }

    /**
     * The header cells used to position and size the event. Two keys are allowed: xAxis and yAxis. If present, each key must be an array of cell objects.
     *
     * @type {object}
     * @public
     * @required
     */
    @api
    get headerCells() {
        return this._headerCells;
    }
    set headerCells(value) {
        const normalized =
            typeof value === 'string'
                ? JSON.parse(value)
                : normalizeObject(value);
        this._headerCells = normalized;

        if (this._connected) {
            this.updatePosition();
            this.updateLength();
            this.updateStickyLabels();
        }
    }

    /**
     * Labels of the event, by their position.
     *
     * @type {object}
     * @public
     */
    @api
    get labels() {
        return this._labels;
    }
    set labels(value) {
        this._labels = typeof value === 'object' ? { ...value } : {};

        if (this._connected) this.initLabels();
    }

    /**
     * Event occurrence object this component is based on. The object is used to make sure the changes made in the scheduler are taken into account, even without a re-render.
     *
     * @type {object}
     * @public
     * @required
     */
    @api
    get occurrence() {
        return this._occurrence;
    }
    set occurrence(value) {
        this._occurrence = typeof value === 'object' ? value : {};
    }

    /**
     * If true, the occurrence cannot be dragged, resized or edited in any way.
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
     * If true, the occurrence is a referenceLine.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get referenceLine() {
        return this._referenceLine;
    }
    set referenceLine(value) {
        this._referenceLine = normalizeBoolean(value);
    }

    /**
     * Unique key of the scheduler resource this occurrence appears on.
     *
     * @type {string}
     * @public
     * @required
     */
    @api
    get resourceKey() {
        return this._resourceKey;
    }
    set resourceKey(value) {
        this._resourceKey = value;

        if (this._connected) this.initLabels();
    }

    /**
     * Array of the scheduler resource objects.
     *
     * @type {object[]}
     * @public
     */
    @api
    get resources() {
        return this._resources;
    }
    set resources(value) {
        this._resources = normalizeArray(value);

        if (this._connected) this.initLabels();
    }

    /**
     * Deprecated. Use `resource-key` instead.
     *
     * @type {string}
     * @deprecated
     */
    @api
    get rowKey() {
        return this._resourceKey;
    }
    set rowKey(value) {
        this._resourceKey = value;

        if (this._connected) this.initLabels();
    }

    /**
     * Deprecated. Use `resources` instead.
     *
     * @type {object[]}
     * @deprecated
     */
    @api
    get rows() {
        return this._resources;
    }
    set rows(value) {
        this._resources = normalizeArray(value);

        if (this._connected) this.initLabels();
    }

    /**
     * Deprecated. Use `scrollOffset` instead.
     *
     * @type {number}
     * @deprecated
     */
    @api
    get scrollLeftOffset() {
        return this._scrollOffset;
    }
    set scrollLeftOffset(value) {
        this._scrollOffset = !isNaN(Number(value)) ? Number(value) : 0;
        if (this._connected) this.updateStickyLabels();
    }

    /**
     * Width of the scheduler datatable column. It is used as an offset by the sticky labels.
     *
     * @type {number}
     * @public
     * @default 0
     */
    @api
    get scrollOffset() {
        return this._scrollOffset;
    }
    set scrollOffset(value) {
        this._scrollOffset = !isNaN(Number(value)) ? Number(value) : 0;
        if (this._connected) this.updateStickyLabels();
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
            this.updatePosition();
            this.updateLength();
        }
    }

    /**
     * Title of the occurrence.
     *
     * @type {string}
     * @public
     */
    @api
    get title() {
        return this._title;
    }
    set title(value) {
        this._title = value;

        if (this._connected) this.initLabels();
    }

    /**
     * End date of the occurrence.
     *
     * @type {DateTime}
     * @public
     * @required
     */
    @api
    get to() {
        return this._to;
    }
    set to(value) {
        this._to = value instanceof DateTime ? value : this.createDate(value);

        if (this._connected) {
            this.updateLength();
            this.updateStickyLabels();
        }
    }

    /**
     * Orientation of the scheduler. Valid values include timeline-horizontal, timeline-vertical and calendar.
     *
     * @type {string}
     * @public
     * @default timeline-horizontal
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

        classListMutation(this.classList, {
            'avonni-scheduler__event_horizontal':
                this._variant === 'timeline-horizontal',
            'avonni-scheduler__standalone-event': this.isStandalone
        });

        if (this._connected) {
            this.updatePosition();
            this.updateLength();
            this.updateThickness();
            this.updateStickyLabels();
        }
    }

    /**
     * Horizontal position of the occurrence in the scheduler, in pixels.
     *
     * @type {number}
     * @public
     * @default 0
     */
    @api
    get x() {
        return this._x;
    }
    set x(value) {
        this._x = parseInt(value, 10);

        if (this._connected) {
            this.updateHostTranslate();
            this.updateStickyLabels();
        }
    }

    /**
     * Vertical position of the occurrence in the scheduler, in pixels.
     *
     * @type {number}
     * @public
     * @default 0
     */
    @api
    get y() {
        return this._y;
    }
    set y(value) {
        this._y = parseInt(value, 10);

        if (this._connected) this.updateHostTranslate();
    }

    /**
     * If present, the event is in a zoom-to-fit scheduler.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get zoomToFit() {
        return this._zoomToFit;
    }
    set zoomToFit(value) {
        this._zoomToFit = normalizeBoolean(value);
        this.updateStickyLabels();
    }

    /**
     * Position of the end extremity of the occurrence. Right for horizontal, bottom for vertical.
     *
     * @type {number}
     * @public
     * @default 0
     */
    @api
    get endPosition() {
        if (this.isVertical) {
            return (
                this.startPosition +
                this.hostElement.getBoundingClientRect().height
            );
        }
        return (
            this.x +
            this._offsetStart +
            this.hostElement.getBoundingClientRect().width +
            this.rightLabelWidth
        );
    }

    /**
     * Left label element width.
     *
     * @type {HTMLElement}
     * @public
     * @default 0
     */
    @api
    get leftLabelWidth() {
        const label = this.template.querySelector(
            '.avonni-scheduler__event-label_left'
        );
        return label ? label.getBoundingClientRect().width : 0;
    }

    /**
     * Deprecated. Use `start-position` instead.
     *
     * @type {number}
     * @public
     * @default 0
     * @deprecated
     */
    @api
    get leftPosition() {
        return this.startPosition;
    }

    /**
     * Right label element width.
     *
     * @type {HTMLElement}
     * @public
     * @default 0
     */
    @api
    get rightLabelWidth() {
        const label = this.template.querySelector(
            '.avonni-scheduler__event-label_right'
        );
        return label ? label.getBoundingClientRect().width : 0;
    }

    /**
     * Deprecated. Use `end-position` instead.
     *
     * @type {number}
     * @public
     * @default 0
     * @deprecated
     */
    @api
    get rightPosition() {
        return this.endPosition;
    }

    /**
     * Position of the start extremity of the occurrence. Left for horizontal, top for vertical.
     *
     * @type {number}
     * @public
     * @default 0
     */
    @api
    get startPosition() {
        if (this.isVertical) {
            const top = this.y + this._offsetStart;
            return top;
        }
        const left = this.x + this._offsetStart - this.leftLabelWidth;
        return left > 0 ? left : 0;
    }

    /**
     * Total width of the occurrence, including the labels.
     *
     * @type {number}
     * @public
     * @default 0
     */
    @api
    get width() {
        if (this.hostElement) {
            const width = this.hostElement.getBoundingClientRect().width;
            return this.leftLabelWidth + width + this.rightLabelWidth;
        }
        return 0;
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Computed CSS classes of the occurrence.
     *
     * @type {string}
     */
    get computedClass() {
        const theme = this.theme;
        const centerLabel = normalizeObject(this.labels.center);
        let classes = classSet(
            'avonni-scheduler__event slds-grid slds-has-flexi-truncate avonni-primitive-scheduler-event-occurrence__flex-col'
        )
            .add({
                'slds-p-horizontal_x-small': !this.isVerticalCalendar,
                'slds-text-color_inverse slds-current-color':
                    !this.displayAsDot &&
                    (theme === 'default' ||
                        theme === 'rounded' ||
                        (this._focused && theme === 'transparent')),
                'avonni-scheduler__event_focused': this._focused,
                'slds-p-vertical_xx-small': centerLabel.iconName,
                'avonni-scheduler__event_vertical-animated':
                    theme !== 'line' && this.isVertical && !this.readOnly,
                'slds-p-bottom_xx-small': theme === 'line',
                'avonni-scheduler__event_display-as-dot': this.displayAsDot,
                'slds-theme_shade slds-theme_alert-texture slds-text-color_weak':
                    this.disabled,
                'avonni-scheduler__event_standalone-multi-day-starts-in-previous-cell':
                    !this.displayAsDot && this.occurrence.startsInPreviousCell,
                'avonni-scheduler__event_standalone-multi-day-ends-in-later-cell':
                    !this.displayAsDot && this.occurrence.endsInLaterCell,
                'avonni-scheduler__event_past': this.from < Date.now()
            })
            .toString();

        if (!this.displayAsDot) {
            classes += ` avonni-scheduler__event_${theme}`;
        }
        return classes;
    }

    /**
     * Computed background color of the occurrence.
     *
     * @type {string}
     */
    get computedColor() {
        return this.color || this.resourceColor;
    }

    /**
     * Computed CSS classes for the disabled events wrapper.
     *
     * @type {string}
     */
    get disabledClass() {
        return classSet(
            'slds-theme_alert-texture avonni-scheduler__disabled-date'
        )
            .add({
                'slds-theme_shade': this.isTimeline,
                'slds-is-absolute': !this.isStandalone,
                'avonni-scheduler__disabled-date_standalone slds-p-horizontal_x-small slds-m-bottom_xx-small slds-is-relative':
                    this.isStandalone,
                'avonni-scheduler__event_month-multi-day-starts-in-previous-cell':
                    !this.displayAsDot && this.occurrence.startsInPreviousCell,
                'avonni-scheduler__event_month-multi-day-ends-in-later-cell':
                    !this.displayAsDot && this.occurrence.endsInLaterCell
            })
            .toString();
    }

    /**
     * Computed CSS style for the disabled events wrapper.
     *
     * @type {string}
     */
    get disabledStyle() {
        return this.isTimeline
            ? null
            : `
                background-color: ${this.transparentColor};
                --avonni-primitive-scheduler-event-occurrence-background-color: ${this.transparentColor};
            `;
    }

    /**
     * Computed CSS classes of the disabled occurrences' title.
     *
     * @type {string}
     */
    get disabledTitleClass() {
        return classSet(
            'avonni-scheduler__disabled-date-title slds-text-body_small slds-p-around_xx-small slds-grid slds-grid-vertical-align_center slds-text-color_weak'
        )
            .add({
                'avonni-scheduler__disabled-date-title_vertical':
                    this.isVertical
            })
            .toString();
    }

    /**
     * True if the event should be displayed as a dot.
     *
     * @type {boolean}
     */
    get displayAsDot() {
        return this.isStandalone && !this.spansOnMoreThanOneDay;
    }

    /**
     * Computed CSS classes of the event occurence center label.
     *
     * @type {string}
     */
    get eventOccurrenceCenterLabelClass() {
        return classSet(
            'slds-truncate slds-grid avonni-scheduler__event-label_center'
        )
            .add({
                'slds-p-horizontal_x-small':
                    !this.isVerticalTimeline && !this.displayAsDot,
                'slds-m-top_small': this.isVertical && this.theme === 'line',
                'slds-grid_vertical-align-center': this.displayAsDot
            })
            .toString();
    }

    /**
     * Computed CSS classes of the event occurrences.
     *
     * @type {string}
     */
    get eventOccurrenceClass() {
        return classSet('slds-grid')
            .add({
                'slds-grid_vertical-align-center':
                    !this.isVerticalTimeline &&
                    !this.isVerticalCalendar &&
                    !this.displayAsDot,
                'avonni-scheduler__event-wrapper_vertical': this.isVertical,
                'avonni-scheduler__event-wrapper': !this.isVertical
            })
            .toString();
    }

    /**
     * True if the resize icons should be hidden.
     *
     * @type {boolean}
     */
    get hideResizeIcon() {
        return this.readOnly || this.isStandalone;
    }

    /**
     * Outermost HTML element of the component.
     *
     * @type {HTMLElement}
     */
    get hostElement() {
        return this.template.host;
    }

    /**
     * True if the variant is agenda.
     *
     * @type {boolean}
     */
    get isAgenda() {
        return this.variant === 'agenda';
    }

    /**
     * True if the event spans on one full day.
     *
     * @type {boolean}
     */
    get isAllDay() {
        return isAllDay(this.eventData, this.from, this.to);
    }

    /**
     * True if the event is part of a calendar.
     *
     * @type {boolean}
     */
    get isCalendar() {
        return this.variant.startsWith('calendar');
    }

    /**
     * True if the variant is calendar-horizontal.
     *
     * @type {boolean}
     */
    get isHorizontalCalendar() {
        return this.variant === 'calendar-horizontal';
    }

    /**
     * True if the variant is calendar-month.
     *
     * @type {boolean}
     */
    get isMonthCalendar() {
        return this.variant === 'calendar-month';
    }

    /**
     * True if the event is part of a calendar in the month view, and it doesn't span on more than one day.
     *
     * @type {boolean}
     */
    get isMonthCalendarSingleDay() {
        return this.isMonthCalendar && !this.spansOnMoreThanOneDay;
    }

    /**
     * True if the event orientation is horizontal, but it is not set to one row. The standalone events are positionned in absolute on a grid (in a calendar), or positionned statically (in an agenda).
     *
     * @type {boolean}
     */
    get isStandalone() {
        return this.isMonthCalendar || this.isAgenda;
    }

    /**
     * True if the event start and end are on different days.
     *
     * @type {boolean}
     */
    get spansOnMoreThanOneDay() {
        return spansOnMoreThanOneDay(this.eventData, this.from, this.to);
    }

    /**
     * True if the event is part of a timeline.
     *
     * @type {boolean}
     */
    get isTimeline() {
        return this.variant.startsWith('timeline');
    }

    /**
     * True if the orientation of the event is vertical.
     *
     * @type {boolean}
     */
    get isVertical() {
        return this.isVerticalTimeline || this.isVerticalCalendar;
    }

    /**
     * True if the variant is calendar-vertical.
     *
     * @type {boolean}
     */
    get isVerticalCalendar() {
        return this.variant === 'calendar-vertical';
    }

    /**
     * True if the variant is timeline-vertical.
     *
     * @type {boolean}
     */
    get isVerticalTimeline() {
        return this.variant === 'timeline-vertical';
    }

    /**
     * Total number of events (including this one) that overlap in this time frame.
     *
     * @type {number}
     */
    get numberOfEventsInThisTimeFrame() {
        return this.occurrence.numberOfEventsInThisTimeFrame || 0;
    }

    /**
     * Offset space between the start of the resource and the start position of the occurrence.
     *
     * @type {number}
     * @default 0
     */
    get offsetSide() {
        return this.occurrence.offsetSide || 0;
    }

    get overflowsCell() {
        return this.occurrence.overflowsCell;
    }

    /**
     * Computed CSS classes of the reference line.
     *
     * @type {string}
     */
    get referenceLineClass() {
        return classSet('avonni-scheduler__reference-line slds-is-absolute')
            .add({
                'avonni-scheduler__reference-line_vertical':
                    this.isVerticalTimeline || this.isVerticalCalendar,
                'avonni-scheduler__reference-line_standalone': this.isStandalone
            })
            .toString();
    }

    /**
     * Default color of the occurrence's resource.
     *
     * @type {string}
     */
    get resourceColor() {
        const resource = this.resources.find(
            (res) => res.name === this.resourceKey
        );
        return resource && resource.color;
    }

    get standaloneChipStyle() {
        return `background-color: ${this.computedColor};`;
    }

    get startTime() {
        return this.from ? this.from.toFormat('HH:mm') : '';
    }

    /**
     * Computed inline style of the occurrence.
     *
     * @type {string}
     */
    get style() {
        if (this.displayAsDot) {
            return '';
        }
        const { computedColor, transparentColor, theme } = this;
        const isDefault = theme === 'default';
        const isTransparent = theme === 'transparent';
        const isRounded = theme === 'rounded';
        const isHollow = theme === 'hollow';
        const isLine = theme === 'line';

        let style = '';
        if (isDefault || isRounded || (isTransparent && this._focused)) {
            style += `
                background-color: ${computedColor};
                --avonni-primitive-scheduler-event-occurrence-background-color: ${computedColor};
            `;
        } else if (isTransparent && !this._focused) {
            style += `
                background-color: ${transparentColor};
                --avonni-primitive-scheduler-event-occurrence-background-color: ${transparentColor};
            `;
        }
        if (isTransparent) {
            style += `border-left-color: ${computedColor};`;
        }
        if (isHollow || isLine) {
            style += `border-color: ${computedColor}`;
        }

        return style;
    }

    get timelineHeaderCells() {
        return this.isVerticalTimeline
            ? this.headerCells.yAxis
            : this.headerCells.xAxis;
    }

    /**
     * If the computedColor is a hexadecimal or RGB color, transparent version of the computedColor (30% of opacity). Else, it is equal to the computedColor.
     *
     * @type {string}
     */
    get transparentColor() {
        if (!this.computedColor) return undefined;

        const isHex = this.computedColor.match(
            /#([a-zA-Z0-9]{3}$|[a-zA-Z0-9]{6}$)/
        );
        if (isHex) {
            return isHex[0].length === 4
                ? `${isHex[0]}${isHex[1]}50`
                : `${isHex[0]}50`;
        }
        const isRGB = this.computedColor.match(
            /rgb\(([0-9]+,\s?[0-9]+,\s?[0-9]+)\)/
        );
        if (isRGB) {
            return `rgba(${isRGB[1]}, 0.3)`;
        }
        return this.computedColor;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Set the focus on the occurrence.
     *
     * @public
     */
    @api
    focus() {
        const wrapper = this.template.querySelector(
            '[data-element-id="div-event-occurrence"]'
        );
        if (wrapper) {
            wrapper.focus();
        }
    }

    /**
     * Hide the right label. Since the label is not part of the component width, it is used to make sure it doesn't overflow.
     *
     * @public
     */
    @api
    hideRightLabel() {
        const rightLabel = this.template.querySelector(
            '.avonni-scheduler__event-label_right'
        );
        if (rightLabel) {
            rightLabel.classList.add('slds-hide');
        }
    }

    /**
     * Display the right label.
     *
     * @public
     */
    @api
    showRightLabel() {
        const rightLabel = this.template.querySelector(
            '.avonni-scheduler__event-label_right'
        );
        if (rightLabel) {
            rightLabel.classList.remove('slds-hide');
        }
    }

    /**
     * Deprecated. Use `updateThickness` instead.
     * @deprecated
     */
    @api
    updateHeight() {
        this.updateThickness();
    }

    /**
     * Update the position of the occurrence in the scheduler grid.
     *
     * @public
     */
    @api
    updatePosition() {
        if (this.isTimeline || this.isHorizontalCalendar) {
            this.updatePositionInTimeline();
        } else {
            this.updatePositionInCalendar();
        }

        this.updateHostTranslate();
    }

    /**
     * Update the length of the occurrence in the scheduler grid.
     *
     * @public
     */
    @api
    updateLength() {
        if (this.isStandalone) {
            this.updateStandaloneLength();
            this._offsetStart = 0;
            return;
        } else if (this.hostElement) {
            this.hostElement.style.width = null;
        }
        const { cellHeight, cellWidth, cellDuration } = this;
        const from = this.getComparableTime(this.from);
        const headerCells = this.isVerticalCalendar
            ? this.headerCells.yAxis
            : this.timelineHeaderCells;

        let to = this.getComparableTime(this.to);
        const cellSize = this.isVertical ? cellHeight : cellWidth;
        if (!headerCells || !cellSize || !cellDuration) {
            return;
        }

        // Find the cell where the event starts
        let i = this.getStartCellIndex(headerCells);
        if (i < 0) return;

        let length = 0;
        const startsInMiddleOfCell =
            this.getComparableTime(headerCells[i].start) < from;

        if (startsInMiddleOfCell) {
            // If the event starts in the middle of a cell,
            // add only the appropriate length in the first cell
            const cellEnd = this.getComparableTime(headerCells[i].end);
            length += this.getOffsetStart(cellEnd, cellSize);
            if (this.referenceLine) return;

            if (cellEnd > to) {
                // If the event ends before the end of the first column
                // remove the appropriate length of the first column
                length -= this.getOffsetEnd(cellEnd, cellSize, to);
                this.setLength(length);
                return;
            }
            i += 1;
        } else if (this.referenceLine) return;

        // Add the length of the header cells completely filled by the event
        while (i < headerCells.length) {
            const cellStart = this.getComparableTime(headerCells[i].start);
            if (cellStart + cellDuration > to) break;
            length += cellSize;
            i += 1;
        }

        // If the event ends in the middle of a column,
        // add the remaining length
        const cell = headerCells[i];
        const cellStart = cell && this.getComparableTime(cell.start);
        if (cell && cellStart < to) {
            const eventDurationLeft = to - cellStart;
            const colPercentEnd = eventDurationLeft / cellDuration;
            length += cellSize * colPercentEnd;
        }
        this.setLength(length);
    }

    /**
     * Update the thickness of a disabled occurrence.
     *
     * @public
     */
    @api
    updateThickness() {
        if (!this.disabled || this.isStandalone) return;

        const element = this.hostElement;

        if (this.isVerticalTimeline) {
            // Vertical timeline
            element.style.width = `${this.cellWidth}px`;
        } else if (this.isVerticalCalendar) {
            // Calendar single-day event
            const width = this.cellWidth / this.numberOfEventsInThisTimeFrame;
            element.style.width = `${width}px`;
        } else if (this.isCalendar) {
            // Calendar day/week multi-day event
            const height = this.cellHeight / this.numberOfEventsInThisTimeFrame;
            element.style.height = `${height}px`;
        } else {
            // Horizontal timeline
            const resource = this.resources.find(
                (res) => res.name === this.resourceKey
            );

            if (resource) {
                const height = resource.height;
                element.style.height = `${height}px`;
            }
        }
    }

    /**
     * Deprecated. Use `updateLength` instead.
     *
     * @deprecated
     */
    @api
    updateWidth() {
        this.updateLength();
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Initialize the labels values.
     */
    initLabels() {
        if (!this.resources.length || !this.resourceKey) return;

        const labels = {};
        const resource = this.resources.find(
            (res) => res.name === this.resourceKey
        );

        if (resource) {
            for (let i = 0; i < Object.entries(this.labels).length; i++) {
                const label = Object.entries(this.labels)[i];
                const position = label[0];
                const hideLabels =
                    this.isVertical ||
                    this.isMonthCalendar ||
                    this.isAgenda ||
                    this.isHorizontalCalendar;
                if (hideLabels && position !== 'center') {
                    continue;
                }

                const { value, fieldName, iconName } = label[1];

                labels[position] = {};
                if (value) {
                    // If the label has a fixed value, prioritize it
                    labels[position].value = value;
                } else if (fieldName) {
                    // Else, search for a field name in the occurrence,
                    // then the event, then the resource
                    const computedValue =
                        this[fieldName] ||
                        this.eventData[fieldName] ||
                        resource.data[fieldName];

                    // If the field name is a date, parse it with the date format
                    if (
                        ['from', 'to', 'recurrenceEndDate'].includes(fieldName)
                    ) {
                        const dateValue = this.createDate(computedValue);
                        labels[position].value = dateValue
                            ? dateValue.toFormat(this.dateFormat)
                            : computedValue;
                    } else {
                        labels[position].value = computedValue;
                    }
                }
                labels[position].iconName = iconName;
            }
        }

        this.computedLabels = labels;

        requestAnimationFrame(() => {
            this.updateStickyLabels();
        });
    }

    /**
     * Align the event with its resource.
     */
    alignPositionWithResource() {
        if (this.referenceLine) {
            return;
        }

        if (this.isVerticalTimeline) {
            const resourceIndex = this.resources.findIndex((resource) => {
                return resource.name === this.resourceKey;
            });
            this._x = resourceIndex * this.cellWidth;
        } else {
            let y = 0;
            for (let i = 0; i < this.resources.length; i++) {
                const resource = this.resources[i];
                const resourceKey = resource.name;
                if (resourceKey === this.resourceKey) break;

                y += resource.height;
            }
            y += this.offsetSide;
            this._y = y;
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
     * If the event is in a vertical setup of a calendar, remove the year, month and day from the date, to allow for comparison of the time only.
     *
     * @param {Date} date Date to transform.
     * @returns {Date}
     */
    getComparableTime(date) {
        if (!this.isVerticalCalendar || !date) {
            return date;
        }
        const time = this.createDate(date);
        return time.set({ year: 1, month: 1, day: 1 });
    }

    /**
     * Get the size (in pixels) between the end of the event, and the end of the last cell it crosses.
     *
     * @param {Date} cellEnd Time at which the cell ends.
     * @param {number} cellSize Size of the cell, in pixels.
     * @param {DateTime} to End date of the event.
     * @returns {number} Size of the offset between the end of the event, and the end of the cell.
     */
    getOffsetEnd(cellEnd, cellSize, to) {
        const durationLeft = cellEnd - to;
        const percentageLeft = durationLeft / this.cellDuration;
        return percentageLeft * cellSize;
    }

    /**
     * Get the size (in pixels) between the start of the event, and the end of the first cell it crosses.
     *
     * @param {Date} cellEnd Time at which the cell ends.
     * @param {number} cellSize Size of the cell, in pixels.
     * @returns {number} Size of the offset between the start of the event, and the end of the cell.
     */
    getOffsetStart(cellEnd, cellSize) {
        const cellDuration = this.cellDuration;
        const from = this.getComparableTime(this.from);

        const eventDuration = cellEnd - from;
        const emptyDuration = cellDuration - eventDuration;
        const emptyPercentageOfCell = emptyDuration / cellDuration;
        this._offsetStart = cellSize * emptyPercentageOfCell;
        this.updateHostTranslate();
        if (this.referenceLine) return 0;

        const eventPercentageOfCell = eventDuration / cellDuration;
        return cellSize * eventPercentageOfCell;
    }

    /**
     * Get the first cell that the event crosses.
     *
     * @param {object[]} cells Array of cell objects.
     * @returns {object} First cell crossed.
     */
    getStartCellIndex(cells) {
        const start = this.occurrence.weekStart || this.from;
        return cells.findIndex((cell) => {
            return (
                this.getComparableTime(cell.end) > this.getComparableTime(start)
            );
        });
    }

    /**
     * Set the length of the event through its CSS style.
     *
     * @param {number} length Length of the event.
     */
    setLength(length) {
        const style = this.hostElement.style;
        if (this.isVertical) {
            style.height = `${length}px`;
            if (this.cellWidth && this.numberOfEventsInThisTimeFrame) {
                const width =
                    this.cellWidth / this.numberOfEventsInThisTimeFrame;
                style.width = `${width}px`;
            } else if (this.isCalendar) {
                style.width = `${this.cellWidth}px`;
            } else {
                style.width = null;
            }
        } else {
            style.width = `${length}px`;
            style.height = null;
        }
    }

    /**
     * Add the computed position to the inline style of the component host.
     */
    updateHostTranslate() {
        let x = this.x;
        if (this.isVertical && !this.referenceLine) {
            x = this.x + this.offsetSide;
        } else if (!this.isVertical) {
            x = this.x + this._offsetStart;
        }
        const y = this.isVertical ? this.y + this._offsetStart : this.y;
        if (this.hostElement) {
            this.hostElement.style.transform = `translate(${x}px, ${y}px)`;
        }
    }

    /**
     * Compute and update the length of a standalone event.
     */
    updateStandaloneLength() {
        const headerCells = this.headerCells.xAxis;
        const { to, cellWidth } = this;
        const isOneCellLength =
            this.referenceLine || !this.spansOnMoreThanOneDay || this.isAllDay;

        if ((isOneCellLength || !headerCells) && this.hostElement) {
            // The event should span on one cell
            this.hostElement.style.width = cellWidth ? `${cellWidth}px` : null;
            this.hostElement.style.height = null;
            return;
        }

        // The event should span on more than one cell.
        // Find the cell where it starts.
        const from = this.occurrence.firstAllowedDate;
        let i = headerCells.findIndex((cell) => {
            const cellStart = this.createDate(cell.start);
            return cellStart.weekday === from.weekday;
        });
        if (i < 0) return;

        let length = 0;

        // Add the full length of the cells the event passes through
        while (i < headerCells.length) {
            const cellStart = this.createDate(headerCells[i].start);
            const sameWeek = getWeekNumber(from) === getWeekNumber(to);
            if (getWeekday(cellStart) > getWeekday(to) && sameWeek) {
                break;
            }
            length += cellWidth;
            i += 1;
        }
        this.setLength(length);
    }

    /**
     * Update the position of the event if it is set in a calendar.
     */
    updatePositionInCalendar() {
        const style = this.hostElement.style;
        const isMonth = this.isMonthCalendar;

        // Hide the placeholders in the month calendar display
        const { isPlaceholder, columnIndex } = this.hostElement.dataset;
        const isHidden = isMonth && isPlaceholder && columnIndex !== '0';
        style.visibility = isHidden ? 'hidden' : 'visible';

        // Hide the overflowing events in the month calendar display
        let overflows = this.overflowsCell;
        const yAxis = this.headerCells.yAxis;
        if (yAxis && !overflows && !isPlaceholder) {
            const firstVisibleDate = this.createDate(yAxis[0].start);
            const startsBeforeBeginningOfMonth =
                this.from < firstVisibleDate &&
                this.to > firstVisibleDate.endOf('day');
            // The visible weeks placeholders will be displayed,
            // but not the original event
            overflows = startsBeforeBeginningOfMonth;
        }
        style.display = isMonth && overflows ? 'none' : null;

        const { cellHeight, headerCells, cellWidth } = this;
        if (
            !headerCells.xAxis ||
            !headerCells.yAxis ||
            !cellWidth ||
            !cellHeight
        ) {
            return;
        }

        // Get the vertical and horizontal cells indices
        const start = this.occurrence.firstAllowedDate;
        const yIndex = this.getStartCellIndex(headerCells.yAxis);
        const xIndex = headerCells.xAxis.findIndex((cell) => {
            const cellEnd = this.createDate(cell.end);
            const sameWeekDay = cellEnd.weekday === start.weekday;
            return cellEnd > start && (!this.isMonthCalendar || sameWeekDay);
        });

        if (yIndex < 0 || xIndex < 0) {
            return;
        }
        this._y = yIndex * cellHeight;
        this._x = xIndex * cellWidth;

        if (this.isMonthCalendar) {
            this._y += this.offsetSide;
        }
    }

    /**
     * Update the position of the event if it is set in a timeline.
     */
    updatePositionInTimeline() {
        const { cellHeight, cellWidth, timelineHeaderCells } = this;
        if (!timelineHeaderCells) {
            return;
        }

        // Find the cell where the event starts
        const i = this.getStartCellIndex(timelineHeaderCells);
        if (i < 0) return;

        // Place the event at the right header
        if (this.isVerticalTimeline) {
            this._y = i * cellHeight;
        } else {
            this._x = i * cellWidth;
        }

        this.alignPositionWithResource();
    }

    /**
     * Set the left position of the sticky label.
     */
    updateStickyLabels() {
        const stickyLabel = this.template.querySelector(
            '[data-element-id="div-center-label-wrapper"]'
        );
        if (!stickyLabel) {
            return;
        }

        if (this.isVerticalTimeline) {
            const top = this.scrollOffset - this.y - this._offsetStart;
            stickyLabel.style.top = `${top}px`;
        } else if (!this.zoomToFit) {
            const left = this.scrollOffset - this.x - this._offsetStart;
            stickyLabel.style.left = `${left}px`;
        }
    }

    /*
     * ------------------------------------------------------------
     *  EVENT HANDLERS AND DISPATCHERS
     * -------------------------------------------------------------
     */

    /**
     * Handle the contextmenu event fired by the occurrence if it is not disabled.
     * Dispatch a privatecontextmenu event.
     *
     * @param {Event} event
     */
    handleContextMenu(event) {
        event.preventDefault();

        /**
         * The event fired when the user opens the context menu of the occurrence, if it is not disabled.
         *
         * @event
         * @name privatecontextmenu
         * @param {string} eventName Name of the event this occurrence belongs to.
         * @param {string} key Key of this occurrence.
         * @param {number} x Horizontal position of the occurrence.
         * @param {number} y Vertical position of the occurrence.
         */
        this.dispatchCustomEvent('privatecontextmenu', event);
    }

    /**
     * Handle the contextmenu event fired by disabled and reference line occurrences.
     * Dispatch a privatedisabledcontextmenu event.
     *
     * @param {Event} event
     */
    handleDisabledContextMenu(event) {
        event.preventDefault();

        const customEvent = new CustomEvent('privatedisabledcontextmenu');
        customEvent.clientX = event.clientX;
        customEvent.clientY = event.clientY;

        /**
         * The event fired when the user opens the context menu of a disabled or reference line occurrence.
         *
         * @event
         * @name privatedisabledcontextmenu
         * @param {number} x Horizontal position of the occurrence.
         * @param {number} y Vertical position of the occurrence.
         */
        this.dispatchEvent(customEvent);
    }

    /**
     * Dispatch a custom event. The name of the event to dispatch is given as a parameter.
     *
     * @param {string} name
     * @param {Event} event
     */
    dispatchCustomEvent(name, event) {
        const x =
            event.clientX || event.currentTarget.getBoundingClientRect().x;
        const y =
            event.clientY || event.currentTarget.getBoundingClientRect().bottom;

        this.dispatchEvent(
            new CustomEvent(name, {
                detail: {
                    eventName: this.eventName,
                    key: this.occurrenceKey,
                    from: this.from,
                    to: this.to,
                    x,
                    y
                }
            })
        );
    }

    /**
     * Handle the mouseenter event fired by the occurrence if it is not disabled.
     * Dispatch a privatemouseenter event.
     *
     * @param {Event} event
     */
    handleMouseEnter(event) {
        /**
         * The event fired when the mouse enters the occurrence, if it is not disabled.
         *
         * @event
         * @name privatemouseenter
         * @param {string} eventName Name of the event this occurrence belongs to.
         * @param {string} key Key of this occurrence.
         * @param {number} x Horizontal position of the occurrence.
         * @param {number} y Vertical position of the occurrence.
         */
        this.dispatchCustomEvent('privatemouseenter', event);
    }

    /**
     * Handle the mouseleave event fired by the occurrence if it is not disabled.
     * Dispatch a privatemouseleave event.
     *
     * @param {Event} event
     */
    handleMouseLeave(event) {
        /**
         * The event fired when the mouse leaves the occurrence, if it is not disabled.
         *
         * @event
         * @name privatemouseleave
         * @param {string} eventName Name of the event this occurrence belongs to.
         * @param {string} key Key of this occurrence.
         * @param {number} x Horizontal position of the occurrence.
         * @param {number} y Vertical position of the occurrence.
         */
        this.dispatchCustomEvent('privatemouseleave', event);
    }

    /**
     * Handle the dblclick event fired by the occurrence if it is not disabled.
     * Dispatch a privatedblclick event.
     *
     * @param {Event} event
     */
    handleDoubleClick(event) {
        /**
         * The event fired when the user double-clicks on the occurrence, if it is not disabled.
         *
         * @event
         * @name privatedblclick
         * @param {string} eventName Name of the event this occurrence belongs to.
         * @param {string} key Key of this occurrence.
         * @param {number} x Horizontal position of the occurrence.
         * @param {number} y Vertical position of the occurrence.
         */
        this.dispatchCustomEvent('privatedblclick', event);
    }

    /**
     * Handle the dblclick event fired by the disabled and reference line occurrences.
     * Dispatch a privatedisableddblclick event.
     *
     * @param {Event} event
     */
    handleDisabledDoubleClick(event) {
        const customEvent = new CustomEvent('privatedisableddblclick');
        customEvent.clientX = event.clientX;
        customEvent.clientY = event.clientY;

        /**
         * The event fired when the user double-clicks on a disabled or reference line occurrence.
         *
         * @event
         * @name privatedisableddblclick
         * @param {number} x Horizontal position of the occurrence.
         * @param {number} y Vertical position of the occurrence.
         */
        this.dispatchEvent(customEvent);
    }

    /**
     * Handle the focus event fired by the occurrence if it is not disabled.
     * Dispatch a privatefocus event.
     *
     * @param {Event} event
     */
    handleFocus(event) {
        this._focused = true;

        /**
         * The event fired when the occurrence is focused, if it is not disabled.
         *
         * @event
         * @name privatefocus
         * @param {string} eventName Name of the event this occurrence belongs to.
         * @param {string} key Key of this occurrence.
         * @param {number} x Horizontal position of the occurrence.
         * @param {number} y Vertical position of the occurrence.
         */
        this.dispatchCustomEvent('privatefocus', event);
    }

    /**
     * Handle the blur event fired by the occurrence if it is not disabled.
     * Dispatch a privateblur event.
     *
     * @param {Event} event
     */
    handleBlur() {
        this._focused = false;

        /**
         * The event fired when the occurrence is blurred, if it is not disabled.
         *
         * @event
         * @name privateblur
         * @param {string} eventName Name of the event this occurrence belongs to.
         * @param {string} key Key of this occurrence.
         * @param {number} x Horizontal position of the occurrence.
         * @param {number} y Vertical position of the occurrence.
         */
        this.dispatchEvent(new CustomEvent('privateblur'));
    }

    /**
     * Handle the mousedown event fired by the occurrence if it is not disabled.
     * Dispatch a privatemousedown event.
     *
     * @param {Event} event
     */
    handleMouseDown(event) {
        if (event.button !== 0 || this.readOnly) return;

        const resize = event.target.dataset.resize;

        /**
         * The event fired when the mouse is pressed on the occurrence, if it is not disabled.
         *
         * @event
         * @name privatemousedown
         * @param {string} eventName Name of the event this occurrence belongs to.
         * @param {string} key Key of this occurrence.
         * @param {number} x Horizontal position of the occurrence.
         * @param {number} y Vertical position of the occurrence.
         */
        this.dispatchEvent(
            new CustomEvent('privatemousedown', {
                detail: {
                    eventName: this.eventName,
                    key: this.occurrenceKey,
                    from: this.from,
                    x: event.clientX,
                    y: event.clientY,
                    side: resize
                }
            })
        );
    }

    /**
     * Handle the mousedown event fired by disabled and reference line occurrences.
     * Dispatch a privatedisabledmousedown event.
     *
     * @param {Event} event
     */
    handleDisabledMouseDown(event) {
        if (event.button !== 0) return;

        /**
         * The event fired when the mouse is pressed on a disabled or reference line occurrence.
         *
         * @event
         * @name privatedisabledmousedown
         * @param {number} x Horizontal position of the occurrence.
         * @param {number} y Vertical position of the occurrence.
         */
        this.dispatchEvent(
            new CustomEvent('privatedisabledmousedown', {
                detail: {
                    x: event.clientX,
                    y: event.clientY
                }
            })
        );
    }

    /**
     * Handle the keydown event fired by the occurrence if it is not disabled.
     * Open the context menu if the space bar or enter were pressed.
     *
     * @param {Event} event
     */
    handleKeyDown(event) {
        const key = event.key;
        if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
            event.preventDefault();
            this.handleContextMenu(event);
        }
    }
}
