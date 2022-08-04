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
    normalizeArray,
    normalizeBoolean,
    normalizeString
} from 'c/utilsPrivate';
import disabled from './avonniDisabled.html';
import eventOccurrence from './avonniEventOccurrence.html';
import referenceLine from './avonniReferenceLine.html';

const DEFAULT_DATE_FORMAT = 'ff';
const VARIANTS = {
    default: 'horizontal',
    valid: ['horizontal', 'vertical']
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
     * Theme of the occurrence. Valid values include default, transparent, line, hollow and rounded.
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
        if (!this.disabled)
            this.template.host.classList.add(
                'avonni-scheduler__primitive-event'
            );

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
     * The cells of the shortest header unit of the scheduler.
     *
     * @type {object[]}
     * @public
     * @required
     */
    @api
    get headerCells() {
        return this._headerCells;
    }
    set headerCells(value) {
        this._headerCells = normalizeArray(value);

        if (this._connected) {
            this.updatePosition();
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
        this._from =
            value instanceof DateTime ? value : dateTimeObjectFrom(value);

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
        this._to =
            value instanceof DateTime ? value : dateTimeObjectFrom(value);

        if (this._connected) {
            this.updateLength();
            this.updateStickyLabels();
        }
    }

    /**
     * Orientation of the scheduler. Valid values include horizontal and vertical.
     *
     * @type {string}
     * @public
     * @default horizontal
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
            'avonni-scheduler__event_horizontal': this._variant === 'horizontal'
        });
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

    /**
     * Computed class of the occurrence.
     *
     * @type {string}
     */
    get computedClass() {
        const theme = this.theme;
        return classSet(
            `avonni-scheduler__event slds-p-horizontal_x-small slds-grid slds-has-flexi-truncate avonni-scheduler__event_${theme}`
        )
            .add({
                'slds-text-color_inverse slds-current-color':
                    theme === 'default' ||
                    theme === 'rounded' ||
                    (this._focused && theme === 'transparent'),
                'avonni-scheduler__event-wrapper_focused': this._focused,
                'slds-p-vertical_xx-small':
                    theme !== 'line' && !this.isVertical,
                'avonni-scheduler__event_vertical':
                    theme !== 'line' && this.isVertical,
                'slds-p-bottom_xx-small': theme === 'line'
            })
            .toString();
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
     * Computed CSS classes of the event occurence center label.
     *
     * @type {string}
     */
    get eventOccurrenceCenterLabelClass() {
        return classSet(
            'slds-truncate slds-grid avonni-scheduler__event-label_center'
        )
            .add({
                'slds-p-horizontal_x-small': !this.isVertical,
                'slds-m-top_small': this.isVertical && this.theme === 'line'
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
                'slds-grid_vertical-align-center slds-p-vertical_x-small':
                    !this.isVertical,
                'avonni-scheduler__event-wrapper_vertical': this.isVertical
            })
            .toString();
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
     * True if the variant is vertical.
     *
     * @type {boolean}
     */
    get isVertical() {
        return this.variant === 'vertical';
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
     * Computed CSS classes of the reference line.
     *
     * @type {string}
     */
    get referenceLineClass() {
        return classSet('avonni-scheduler__reference-line slds-is-absolute')
            .add({
                'avonni-scheduler__reference-line_vertical': this.isVertical
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

    /**
     * If true, the title HTML element will be displayed. This property is only used by disabled occurrences.
     *
     * @type {boolean}
     * @default false
     */
    get showTitle() {
        return this.disabled && (this.title || this.iconName);
    }

    /**
     * Computed inline style of the occurrence.
     *
     * @type {string}
     */
    get style() {
        const { computedColor, transparentColor, theme } = this;
        const isDefault = theme === 'default';
        const isTransparent = theme === 'transparent';
        const isRounded = theme === 'rounded';
        const isHollow = theme === 'hollow';
        const isLine = theme === 'line';

        let style = '';
        if (isDefault || isRounded || (isTransparent && this._focused)) {
            style += `background-color: ${computedColor};`;
        } else if (isTransparent && !this._focused) {
            style += `background-color: ${transparentColor};`;
        }
        if (isTransparent) {
            style += `border-left-color: ${computedColor};`;
        }
        if (isHollow || isLine) {
            style += `border-color: ${computedColor}`;
        }

        return style;
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
            return `rgba(${isRGB[1]}, .3)`;
        }
        return this.computedColor;
    }

    /**
     * Set the focus on the occurrence.
     *
     * @public
     */
    @api
    focus() {
        this.template
            .querySelector('[data-element-id="div-event-occurrence"]')
            .focus();
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
        const { from, headerCells, cellHeight, cellWidth } = this;

        // Find the cell where the event starts
        let i = headerCells.findIndex((column) => {
            return column.end > from;
        });

        if (i < 0) return;

        // Place the event at the right header
        if (this.isVertical) {
            this._y = i * cellHeight;
        } else {
            this._x = i * cellWidth;
        }

        // Place the event at the right resource,
        if (!this.referenceLine && !this.isVertical) {
            const resources = this.resources;
            let y = 0;
            for (let j = 0; j < resources.length; j++) {
                const resourceKey = resources[j].name;
                if (resourceKey === this.resourceKey) break;

                y += resources[j].height;
            }
            y += this.offsetSide;
            this._y = y;
        } else if (!this.referenceLine && this.isVertical) {
            const resourceIndex = this.resources.findIndex((resource) => {
                return resource.name === this.resourceKey;
            });
            this._x = resourceIndex * cellWidth;
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
        const { from, to, headerCells, cellHeight, cellWidth, cellDuration } =
            this;
        const cellSize = this.isVertical ? cellHeight : cellWidth;

        // Find the cell where the event starts
        let i = headerCells.findIndex((column) => {
            return column.end > from;
        });

        if (i < 0) return;

        let length = 0;

        // If the event starts in the middle of a cell,
        // add only the appropriate length in the first cell
        if (headerCells[i].start < from) {
            const cellEnd = DateTime.fromMillis(headerCells[i].end);
            const eventDuration = cellEnd.diff(from).milliseconds;
            const emptyDuration = cellDuration - eventDuration;
            const emptyPercentageOfCell = emptyDuration / cellDuration;
            this._offsetStart = cellSize * emptyPercentageOfCell;
            this.updateHostTranslate();
            if (this.referenceLine) return;

            const eventPercentageOfCell = eventDuration / cellDuration;
            const offsetSize = cellSize * eventPercentageOfCell;
            length += offsetSize;

            // If the event ends before the end of the first column
            // remove the appropriate length of the first column
            if (cellEnd > to) {
                const durationLeft = cellEnd.diff(to).milliseconds;
                const percentageLeft = durationLeft / cellDuration;
                length = length - percentageLeft * cellSize;
                this.setLength(length);
                return;
            }

            i += 1;
        } else if (this.referenceLine) return;

        // Add the length of the header cells completely filled by the event
        while (i < headerCells.length) {
            if (headerCells[i].start + cellDuration > to) break;
            length += cellSize;
            i += 1;
        }

        // If the event ends in the middle of a column,
        // add the remaining length
        if (headerCells[i] && headerCells[i].start < to) {
            const cellStart = DateTime.fromMillis(headerCells[i].start);
            const eventDurationLeft = to.diff(cellStart).milliseconds;
            const colPercentEnd = eventDurationLeft / cellDuration;
            length += cellSize * colPercentEnd;
        }
        this.setLength(length);
    }

    /**
     * Update the height of the occurrence in the scheduler grid.
     *
     * @public
     */
    @api
    updateThickness() {
        if (!this.disabled) return;

        const element = this.hostElement;
        if (this.isVertical) {
            element.style.width = `${this.cellWidth}px`;
        } else {
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

        if (this.isVertical) {
            const top = this.scrollOffset - this.y - this._offsetStart;
            stickyLabel.style.top = `${top}px`;
        } else if (!this.zoomToFit) {
            const left = this.scrollOffset - this.x - this._offsetStart;
            stickyLabel.style.left = `${left}px`;
        }
    }

    /**
     * Initialize the labels values.
     */
    initLabels() {
        if (!this.eventData || !this.resources.length || !this.resourceKey)
            return;

        const labels = {};
        const resource = this.resources.find(
            (res) => res.name === this.resourceKey
        );

        if (resource) {
            for (let i = 0; i < Object.entries(this.labels).length; i++) {
                const label = Object.entries(this.labels)[i];
                const position = label[0];
                if (this.isVertical && position !== 'center') {
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
                    labels[position].value =
                        computedValue instanceof DateTime
                            ? computedValue.toFormat(this.dateFormat)
                            : computedValue;
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
        const x = this.isVertical
            ? this.x + this.offsetSide
            : this.x + this._offsetStart;
        const y = this.isVertical ? this.y + this._offsetStart : this.y;
        if (this.hostElement) {
            this.hostElement.style.transform = `translate(${x}px, ${y}px)`;
        }
    }

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

        /**
         * The event fired when the user opens the context menu of a disabled or reference line occurrence.
         *
         * @event
         * @name privatedisabledcontextmenu
         * @param {number} x Horizontal position of the occurrence.
         * @param {number} y Vertical position of the occurrence.
         */
        this.dispatchEvent(
            new CustomEvent('privatedisabledcontextmenu', {
                detail: {
                    x: event.clientX,
                    y: event.clientY
                }
            })
        );
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
        if (this.readOnly) return;

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
        if (this.readOnly) return;

        /**
         * The event fired when the user double-clicks on a disabled or reference line occurrence.
         *
         * @event
         * @name privatedisableddblclick
         * @param {number} x Horizontal position of the occurrence.
         * @param {number} y Vertical position of the occurrence.
         */
        this.dispatchEvent(
            new CustomEvent('privatedisableddblclick', {
                detail: {
                    x: event.clientX,
                    y: event.clientY
                }
            })
        );
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
        if (event.button !== 0 || this.readOnly) return;
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
