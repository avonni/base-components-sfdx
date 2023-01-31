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
import { AvonniResizeObserver } from 'c/resizeObserver';
import { HorizontalActivityTimeline } from './avonniHorizontalActivityTimeline';
import horizontalTimeline from './avonniHorizontalActivityTimeline.html';
import verticalTimeline from './avonniVerticalActivityTimeline.html';
import {
    deepCopy,
    normalizeBoolean,
    normalizeString,
    normalizeArray
} from 'c/utilsPrivate';

const BUTTON_ICON_POSITIONS = { valid: ['left', 'right'], default: 'left' };

const BUTTON_VARIANTS = {
    valid: [
        'neutral',
        'base',
        'brand',
        'brand-outline',
        'destructive',
        'destructive-text',
        'inverse',
        'success'
    ],
    default: 'neutral'
};

const DEFAULT_BUTTON_SHOW_MORE_LABEL = 'Show more';
const DEFAULT_BUTTON_SHOW_LESS_LABEL = 'Show less';
const DEFAULT_ITEM_DATE_FORMAT = 'LLLL dd, yyyy, t';
const DEFAULT_ITEM_ICON_SIZE = 'small';
const DEFAULT_MAX_VISIBLE_ITEMS_HORIZONTAL = 10;
const GROUP_BY_OPTIONS = {
    valid: ['week', 'month', 'year'],
    default: undefined
};

const ICON_SIZES = {
    valid: ['xx-small', 'x-small', 'small', 'medium', 'large'],
    default: 'medium'
};

const ORIENTATIONS = {
    valid: ['vertical', 'horizontal'],
    default: 'vertical'
};

const SORTED_DIRECTIONS = {
    valid: ['asc', 'desc'],
    default: 'desc'
};

/**
 * @class
 * @descriptor avonni-activity-timeline
 * @storyId example-activity-timeline--base
 * @public
 */
export default class AvonniActivityTimeline extends LightningElement {
    /**
     * The Lightning Design System name of the icon displayed in the header, before the title. Specify the name in the format 'utility:down' where 'utility' is the category, and 'down' is the specific icon to be displayed.
     * When omitted, a simplified timeline bullet replaces it.
     *
     * @public
     * @type {string}
     */
    @api iconName;

    /**
     * Title of the timeline, displayed in the header.
     *
     * @public
     * @type {string}
     */
    @api title;

    /**
     * The Lightning Design System name of the show less button icon. Specify the name in the format 'utility:down' where 'utility' is the category, and 'down' is the specific icon to be displayed. This attribute is supported only for the vertical orientation.
     * @type {string}
     * @public
     */
    @api buttonShowLessIconName;

    /**
     * Label of the button that appears when all items are displayed and max-visible-items value is set. This attribute is supported only for the vertical orientation.
     * @type {string}
     * @default Show less
     * @public
     */
    @api buttonShowLessLabel = DEFAULT_BUTTON_SHOW_LESS_LABEL;

    /**
     * The Lightning Design System name of the show more button icon. Specify the name in the format 'utility:down' where 'utility' is the category, and 'down' is the specific icon to be displayed. This attribute is supported only for the vertical orientation.
     * @type {string}
     * @public
     */
    @api buttonShowMoreIconName;

    /**
     * Label of the button that appears when the number of item exceeds the max-visible-items number. This attribute is supported only for the vertical orientation.
     * @type {string}
     * @default Show more
     * @public
     */
    @api buttonShowMoreLabel = DEFAULT_BUTTON_SHOW_MORE_LABEL;

    /**
     * Time zone used, in a valid IANA format. If empty, the browser's time zone is used.
     *
     * @type {string}
     * @public
     */
    @api timezone;

    _actions = [];
    _buttonShowLessIconPosition = BUTTON_ICON_POSITIONS.default;
    _buttonShowMoreIconPosition = BUTTON_ICON_POSITIONS.default;
    _buttonVariant = BUTTON_VARIANTS.default;
    _closed = false;
    _collapsible = false;
    _groupBy = GROUP_BY_OPTIONS.default;
    _hideItemDate = false;
    _iconSize = ICON_SIZES.default;
    _itemDateFormat = DEFAULT_ITEM_DATE_FORMAT;
    _itemIconSize = DEFAULT_ITEM_ICON_SIZE;
    _items = [];
    _maxVisibleItems;
    _orientation = ORIENTATIONS.default;
    _sortedDirection = SORTED_DIRECTIONS.default;

    _redrawHorizontalTimeline = true;

    // Horizontal Activity Timeline
    _resizeObserver;
    intervalDaysLength;
    intervalMaxDate;
    intervalMinDate;
    showItemPopOver = false;
    selectedItem;
    horizontalTimeline;

    _key;
    _isConnected = false;
    _presentDates = [];
    _pastDates = [];
    _upcomingDates = [];

    showMore = true;

    @track orderedDates = [];

    connectedCallback() {
        this._isConnected = true;
        this.initActivityTimeline();

        if (this.isTimelineHorizontal) {
            this.initializeHorizontalTimeline();
        }
    }

    renderedCallback() {
        if (this.isTimelineHorizontal) {
            this.renderedCallbackHorizontalTimeline();
        }
    }

    renderedCallbackHorizontalTimeline() {
        if (!this._resizeObserver) {
            this._resizeObserver = this.initResizeObserver();
        }

        if (!this.horizontalTimeline) {
            this.initializeHorizontalTimeline();
        }

        if (this._redrawHorizontalTimeline) {
            this.horizontalTimeline.createHorizontalActivityTimeline(
                this.sortedItems,
                this._maxVisibleItems,
                this.divHorizontalTimeline.clientWidth
            );
            this._redrawHorizontalTimeline = false;
        }

        this.updateHorizontalTimelineHeader();

        if (
            this.showItemPopOver &&
            !this.horizontalTimeline._isTimelineMoving
        ) {
            this.horizontalTimeline.initializeItemPopover(this.selectedItem);
        }
    }

    render() {
        if (this.isTimelineHorizontal) {
            return horizontalTimeline;
        }
        return verticalTimeline;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Array of action objects. The actions are displayed at the top right of each item. This attribute is supported only for the vertical orientation.
     *
     * @public
     * @type {object[]}
     */
    @api
    get actions() {
        return this._actions;
    }

    set actions(value) {
        this._actions = normalizeArray(value);
    }

    /**
     * Position of the show less button’s icon. Valid values include left and right. This attribute is supported only for the vertical orientation.
     * @type {string}
     * @default left
     * @public
     */
    @api
    get buttonShowLessIconPosition() {
        return this._buttonShowLessIconPosition;
    }

    set buttonShowLessIconPosition(value) {
        this._buttonShowLessIconPosition = normalizeString(value, {
            fallbackValue: BUTTON_ICON_POSITIONS.default,
            validValues: BUTTON_ICON_POSITIONS.valid
        });
    }

    /**
     * Position of the show more button’s icon. Valid values include left and right. This attribute is supported only for the vertical orientation.
     * @type {string}
     * @default left
     * @public
     */
    @api
    get buttonShowMoreIconPosition() {
        return this._buttonShowMoreIconPosition;
    }

    set buttonShowMoreIconPosition(value) {
        this._buttonShowMoreIconPosition = normalizeString(value, {
            fallbackValue: BUTTON_ICON_POSITIONS.default,
            validValues: BUTTON_ICON_POSITIONS.valid
        });
    }

    /**
     * Variant of the button that appears when the number of items exceeds the max-visible-items number. This attribute is supported only for the vertical orientation.
     * @type {string}
     * @default neutral
     * @public
     */
    @api
    get buttonVariant() {
        return this._buttonVariant;
    }

    set buttonVariant(value) {
        this._buttonVariant = normalizeString(value, {
            fallbackValue: BUTTON_VARIANTS.default,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    /**
     * If present, the group sections are closed by default. This attribute is supported only for the vertical orientation.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get closed() {
        return this._closed;
    }

    set closed(value) {
        this._closed = normalizeBoolean(value);
    }

    /**
     * If present, the section is collapsible and the collapse icon is visible. This attribute is supported only for the vertical orientation.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get collapsible() {
        return this._collapsible;
    }

    set collapsible(value) {
        this._collapsible = normalizeBoolean(value);
    }

    /**
     * If present, the value will define how the items will be grouped. Valid values include week, month or year. This attribute is supported only for the vertical orientation.
     *
     * @public
     * @type {string}
     */
    @api
    get groupBy() {
        return this._groupBy;
    }

    set groupBy(value) {
        this._groupBy = normalizeString(value, {
            fallbackValue: GROUP_BY_OPTIONS.default,
            validValues: GROUP_BY_OPTIONS.valid
        });

        if (this._isConnected) this.initActivityTimeline();
    }

    /**
     * If true, the date of each item is hidden.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get hideItemDate() {
        return this._hideItemDate;
    }

    set hideItemDate(value) {
        this._hideItemDate = normalizeBoolean(value);
    }

    /**
     * The size of the title's icon. Valid values are xx-small, x-small, small, medium and large.
     *
     * @public
     * @type {string}
     * @default medium
     */
    @api
    get iconSize() {
        return this._iconSize;
    }

    set iconSize(value) {
        this._iconSize = normalizeString(value, {
            fallbackValue: ICON_SIZES.default,
            validValues: ICON_SIZES.valid
        });
    }

    /**
     * The date format to use for each item. See [Luxon’s documentation](https://moment.github.io/luxon/#/formatting?id=table-of-tokens) for accepted format.
     * If you want to insert text in the label, you need to escape it using single quote.
     * For example, the format of "Jan 14 day shift" would be <code>"LLL dd 'day shift'"</code>.
     *
     * @type {string}
     * @default 'LLLL dd, yyyy, t'
     * @public
     */
    @api
    get itemDateFormat() {
        return this._itemDateFormat;
    }
    set itemDateFormat(value) {
        this._itemDateFormat =
            value && typeof value === 'string'
                ? value
                : DEFAULT_ITEM_DATE_FORMAT;
    }

    /**
     * The size of all the items' icon. Valid values are xx-small, x-small, small, medium and large. This attribute is supported only for the vertical orientation.
     *
     * @public
     * @type {string}
     * @default small
     */
    @api
    get itemIconSize() {
        return this._itemIconSize;
    }

    set itemIconSize(value) {
        this._itemIconSize = normalizeString(value, {
            fallbackValue: DEFAULT_ITEM_ICON_SIZE,
            validValues: ICON_SIZES.valid
        });
    }

    /**
     * Array of item objects.
     *
     * @public
     * @type {object[]}
     */
    @api
    get items() {
        return this._items;
    }

    set items(value) {
        this._items = deepCopy(normalizeArray(value, 'object'));
        if (this._isConnected) {
            this.initActivityTimeline();

            if (this.isTimelineHorizontal) {
                this.requestRedrawTimeline();
                this.renderedCallback();
            }
        }
    }

    /**
     * The maximum number of visible items to display
     * @type {number}
     * @public
     */
    @api
    get maxVisibleItems() {
        return this._maxVisibleItems;
    }

    set maxVisibleItems(value) {
        if (value && value > 0) {
            this._maxVisibleItems = value;

            if (this.isTimelineHorizontal) {
                this.requestRedrawTimeline();
                setTimeout(() => {
                    this.renderedCallback();
                }, 0);
            }
        }
    }

    /**
     * Orientation of the activity timeline. Valid values include vertical and horizontal.
     *
     * @public
     * @type {string}
     * @default vertical
     */
    @api
    get orientation() {
        return this._orientation;
    }

    set orientation(value) {
        this._orientation = normalizeString(value, {
            fallbackValue: ORIENTATIONS.default,
            validValues: ORIENTATIONS.valid
        });

        if (this.isTimelineHorizontal) {
            this.requestRedrawTimeline();
            setTimeout(() => {
                this.renderedCallback();
            }, 0);
        }
    }

    /**
     * If present, the value will define how the items will be grouped. Valid values include week, month or year. This attribute is supported only for the vertical orientation.
     *
     * @public
     * @type {string}
     */
    @api
    get sortedDirection() {
        return this._sortedDirection;
    }

    set sortedDirection(value) {
        this._sortedDirection = normalizeString(value, {
            fallbackValue: SORTED_DIRECTIONS.default,
            validValues: SORTED_DIRECTIONS.valid
        });

        if (this._isConnected) {
            this.initActivityTimeline();
        }
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Select only items in min-max interval for horizontal view of the timeline
     *
     * @type {array}
     */
    get displayedItemsLength() {
        return this.horizontalTimeline && this.horizontalTimeline.displayedItems
            ? this.horizontalTimeline.displayedItems.length
            : 0;
    }

    /**
     * Get the div container of horizontal activity timeline
     *
     * @type {object}
     */
    get divHorizontalTimeline() {
        return this.template.querySelector(
            '[data-element-id="avonni-activity-timeline__horizontal-timeline"]'
        );
    }

    /*
     * Computed item date format.
     * @type {string}
     */
    get computedItemDateFormat() {
        if (this._hideItemDate) {
            return '';
        }
        return this._itemDateFormat;
    }

    /**
     * Current label of the show button (show more or show less)
     * @type {string}
     */
    get currentShowButtonLabel() {
        return this.showMore
            ? this.buttonShowMoreLabel
            : this.buttonShowLessLabel;
    }

    /**
     * Current icon name of the show button (show more or show less)
     * @type {string}
     */
    get currentShowButtonIcon() {
        return this.showMore
            ? this.buttonShowMoreIconName
            : this.buttonShowLessIconName;
    }

    /**
     * Current icon position of the show button (show more or show less)
     * @type {string}
     */
    get currentShowButtonPosition() {
        return this.showMore
            ? this.buttonShowMoreIconPosition
            : this.buttonShowLessIconPosition;
    }

    /**
     * Verify if dates exist.
     *
     * @type {boolean}
     */
    get hasDates() {
        return this.orderedDates.length > 0;
    }

    /**
     * Assign header by title or icon-name.
     *
     * @type {boolean}
     */
    get hasHeader() {
        return this.title || this.iconName;
    }

    /*
     * Verify if show button should be hidden or not
     *
     * @type {boolean}
     */
    get isShowButtonHidden() {
        return (
            !this.maxVisibleItems || this.maxVisibleItems >= this.items.length
        );
    }

    /**
     * Check if timeline's orientation is horizontal
     *
     * @type {boolean}
     */
    get isTimelineHorizontal() {
        return this.orientation === 'horizontal';
    }

    /**
     * Toggle for grouping dates.
     *
     * @type {boolean}
     */
    get noGroupBy() {
        return !this._groupBy;
    }

    /**
     * Compute sortedItems and ungrouped array.
     */
    get sortedItems() {
        const items =
            this._sortedDirection === 'desc'
                ? [...this.items].sort(
                      (a, b) =>
                          new Date(b.datetimeValue) - new Date(a.datetimeValue)
                  )
                : [...this.items].sort(
                      (a, b) =>
                          new Date(a.datetimeValue) - new Date(b.datetimeValue)
                  );
        return this.showMore &&
            !this.isShowButtonHidden &&
            this.maxVisibleItems &&
            !this.isTimelineHorizontal
            ? items.splice(0, this.maxVisibleItems)
            : items;
    }

    /**
     * Get the size of the popover's icon.
     *
     * @return {string}
     */
    get popoverIconSize() {
        if (this.selectedItem.iconName.includes('action:')) {
            return 'x-small';
        }
        return 'medium';
    }

    /**
     * Formatted date with requested format (item-date-format) of popover's item for horizontal activity timeline.
     *
     * @return {string}
     */
    get selectedItemFormattedDate() {
        if (
            !this.selectedItem ||
            !this.selectedItem.datetimeValue ||
            !this.computedItemDateFormat
        ) {
            return '';
        }
        return this.horizontalTimeline.convertDateToFormat(
            this.selectedItem.datetimeValue,
            this.computedItemDateFormat
        );
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    getGroupLabel(date) {
        if (this._groupBy && date > new Date()) {
            return 'Upcoming';
        }
        switch (this._groupBy) {
            case 'month':
                return `${date.toLocaleString('en-EN', {
                    month: 'long'
                })} ${date.getFullYear()}`;
            case 'week':
                return `Week: ${this.getNumberOfWeek(
                    date
                )}, ${date.getFullYear()}`;
            case 'year':
                return date.getFullYear().toString();
            default:
                return '';
        }
    }

    /**
     * Compute Number of the week in the year.
     *
     * @param {Date} date
     * @type {(Date|number)}
     * @returns number
     */
    getNumberOfWeek(date) {
        const today = new Date(date);
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    /**
     * Component initialized states.
     */
    initActivityTimeline() {
        this.orderedDates = [];
        this.sortedItems.forEach((item) => {
            const date = new Date(item.datetimeValue);
            const label = this.getGroupLabel(date);
            const lastGroup = this.orderedDates[this.orderedDates.length - 1];

            if (!lastGroup || lastGroup.label !== label) {
                this.orderedDates.push({
                    label,
                    items: [item]
                });
            } else {
                lastGroup.items.push(item);
            }
        });
    }

    /**
     * Initialize horizontal activity timeline.
     */
    initializeHorizontalTimeline() {
        if (!this._maxVisibleItems) {
            this._maxVisibleItems = DEFAULT_MAX_VISIBLE_ITEMS_HORIZONTAL;
        }
        this.horizontalTimeline = new HorizontalActivityTimeline(
            this,
            this.sortedItems
        );
    }

    /**
     * Initialize the screen resize observer.
     *
     * @returns {AvonniResizeObserver} Resize observer.
     */
    initResizeObserver() {
        if (!this.divHorizontalTimeline) {
            return null;
        }
        return new AvonniResizeObserver(this.divHorizontalTimeline, () => {
            this.requestRedrawTimeline();
            this.renderedCallback();
        });
    }

    /**
     * Triggers a redraw of horizontal activity timeline.
     */
    requestRedrawTimeline() {
        this._redrawHorizontalTimeline = true;
    }

    /**
     * Update horizontal timeline header's value.
     */
    updateHorizontalTimelineHeader() {
        this.intervalDaysLength = this.horizontalTimeline.intervalDaysLength;
        this.intervalMaxDate = this.horizontalTimeline.intervalMaxDate;
        this.intervalMinDate = this.horizontalTimeline.intervalMinDate;
    }

    /**
     * Handle the click on an action. Dispatch the actionclick event.
     *
     * @param {Event} event
     */
    handleActionClick(event) {
        event.stopPropagation();

        /**
         * The event fired when a user clicks on an action.
         *
         * @event
         * @name actionclick
         * @param {string} name Name of the action clicked.
         * @param {string} targetName Unique name of the item the action belongs to.
         * @param {object[]} fieldData Value of the item's fields.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('actionclick', {
                detail: event.detail
            })
        );
    }

    /**
     * Handle the click on a button. Dispatch the buttonclick event.
     *
     * @param {Event} event
     */
    handleButtonClick(event) {
        event.stopPropagation();

        /**
         * The event fired when the button in the details section is clicked.
         *
         * @event
         * @name buttonclick
         * @param {string} targetName Unique name of the item the button belongs to.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('buttonclick', {
                detail: {
                    targetName: event.detail.name
                }
            })
        );
    }

    /**
     * Handle the check and uncheck event on an item. Dispatch the check event.
     *
     * @param {Event} event
     */
    handleCheck(event) {
        event.stopPropagation();
        const { checked, name } = event.detail;
        const item = this.items.find((it) => it.name === name);
        if (item) {
            item.checked = checked;
        }

        /**
         * The event fired when an item is checked or unchecked.
         *
         * @event
         * @name check
         * @param {boolean} checked True if the item is checked, false otherwise.
         * @param {string} targetName Unique name of the item.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('check', {
                detail: {
                    checked,
                    targetName: name
                }
            })
        );
    }

    /**
     * Handle the click on an item. Dispatch the itemclick event.
     *
     * @param {Event} event
     */
    handleItemClick(event) {
        event.stopPropagation();
        const name = event.detail.name || event.currentTarget.dataset.name;

        /**
         * The event fired when a user clicks on an item.
         *
         * @event
         * @name itemclick
         * @param {string} name Name of the item clicked.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('itemclick', {
                detail: { name }
            })
        );
    }

    /**
     * Handle close of item's tooltip for horizontal view timeline.
     */
    handleTooltipClose(event) {
        // To prevent item click event to be dispatch when closing tooltip
        if (event) {
            event.stopPropagation();
        }
        this.showItemPopOver = false;
        this.selectedItem = null;
    }

    /**
     * Handle the mouse over on item for horizontal view timeline.
     */
    handleItemMouseOver(item) {
        this.showItemPopOver = true;
        this.selectedItem = item;
    }

    /*
     * Toggle the show more button
     */
    handleToggleShowMoreButton() {
        this.showMore = !this.showMore;
        this.initActivityTimeline();
    }
}
