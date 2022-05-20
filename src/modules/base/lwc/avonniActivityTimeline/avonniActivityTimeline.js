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
const DEFAULT_ITEM_ICON_SIZE = 'small';

const GROUP_BY_OPTIONS = {
    valid: ['week', 'month', 'year'],
    default: undefined
};

const ICON_SIZES = {
    valid: ['xx-small', 'x-small', 'small', 'medium', 'large'],
    default: 'medium'
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
     * Label of the button that appears when the number of item exceeds the max-visible-items number.
     * @type {string}
     * @default Show more
     * @public
     */
    @api buttonShowMoreLabel = DEFAULT_BUTTON_SHOW_MORE_LABEL;

    /**
     * Label of the button that appears when all items are displayed and max-visible-items value is set.
     * @type {string}
     * @default Show less
     * @public
     */
    @api buttonShowLessLabel = DEFAULT_BUTTON_SHOW_LESS_LABEL;

    /**
     * The Lightning Design System name of the show more button icon. Specify the name in the format 'utility:down' where 'utility' is the category, and 'down' is the specific icon to be displayed.
     * @type {string}
     * @public
     */
    @api buttonShowMoreIconName;

    /**
     * The Lightning Design System name of the show less button icon. Specify the name in the format 'utility:down' where 'utility' is the category, and 'down' is the specific icon to be displayed.
     * @type {string}
     * @public
     */
    @api buttonShowLessIconName;

    _actions = [];
    _buttonShowMoreIconPosition = BUTTON_ICON_POSITIONS.default;
    _buttonShowLessIconPosition = BUTTON_ICON_POSITIONS.default;
    _buttonVariant = BUTTON_VARIANTS.default;
    _closed = false;
    _collapsible = false;
    _groupBy = GROUP_BY_OPTIONS.default;
    _items = [];
    _maxVisibleItems;
    _iconSize = ICON_SIZES.default;
    _itemIconSize = DEFAULT_ITEM_ICON_SIZE;
    _sortedDirection = SORTED_DIRECTIONS.default;

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
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Array of action objects. The actions are displayed at the top right of each item.
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
     * Position of the show less button’s icon. Valid values include left and right.
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
     * Position of the show more button’s icon. Valid values include left and right.
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
     * Variant of the button that appears when the number of items exceeds the max-visible-items number.
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
     * If present, the group sections are closed by default.
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
     * If present, the section is collapsible and the collapse icon is visible.
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
     * If present, the value will define how the items will be grouped. Valid values include week, month or year.
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
        this._items = normalizeArray(value);
        if (this._isConnected) {
            this.initActivityTimeline();
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
        }
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
     * The size of all the items' icon. Valid values are xx-small, x-small, small, medium and large.
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
     * If present, the value will define how the items will be grouped. Valid values include week, month or year.
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
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

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

    /**
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
        return this.showMore && !this.isShowButtonHidden && this.maxVisibleItems
            ? items.splice(0, this.maxVisibleItems)
            : items;
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

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
     * Sort the item dates by year, month, week.
     */
    sortDates() {
        this._upcomingDates = [];
        this._presentDates = [];
        this._pastDates = [];

        this.sortedItems.forEach((item) => {
            const date = new Date(item.datetimeValue);
            const dateYear = date.getFullYear();
            const today = new Date();
            const currentYear = today.getFullYear();
            const isUpcomingYear = dateYear > currentYear;
            const isPastYear = dateYear < currentYear;
            if (this._groupBy === 'month') {
                if (
                    (date.getMonth() > today.getMonth() && !isPastYear) ||
                    isUpcomingYear
                ) {
                    this._upcomingDates.push(item);
                } else if (
                    date.getMonth() === today.getMonth() &&
                    !isPastYear
                ) {
                    this._presentDates.push(item);
                } else {
                    this._pastDates.push(item);
                }
            } else if (this._groupBy === 'year') {
                if (isUpcomingYear) {
                    this._upcomingDates.push(item);
                } else if (isPastYear) {
                    this._pastDates.push(item);
                } else {
                    this._presentDates.push(item);
                }
            } else {
                if (
                    (this.getNumberOfWeek(date) > this.getNumberOfWeek(today) &&
                        !isPastYear) ||
                    isUpcomingYear
                ) {
                    this._upcomingDates.push(item);
                } else if (
                    this.getNumberOfWeek(date) ===
                        this.getNumberOfWeek(today) &&
                    !isPastYear
                ) {
                    this._presentDates.push(item);
                } else {
                    this._pastDates.push(item);
                }
            }
        });
    }

    /**
     * Create section's label for each group.
     */
    displayDates(array, isUpcoming) {
        return array.reduce((prev, cur) => {
            if (!isUpcoming) {
                const date = new Date(cur.datetimeValue);
                if (this._groupBy === 'month') {
                    this._key = `${date.toLocaleString('en-EN', {
                        month: 'long'
                    })} ${date.getFullYear()}`;
                } else if (this._groupBy === 'week') {
                    this._key = `Week: ${this.getNumberOfWeek(
                        date
                    )}, ${date.getFullYear()}`;
                } else if (this._groupBy === 'year') {
                    this._key = `${date.getFullYear()}`;
                }
            } else {
                this._key = 'Upcoming';
            }

            if (!prev[this._key]) {
                prev[this._key] = [cur];
            } else {
                prev[this._key].push(cur);
            }
            return prev;
        }, []);
    }

    /**
     * Regroup each groups in order.
     */
    regroupDates(array) {
        Object.keys(array).forEach((date) => {
            this.orderedDates.push({
                label: date,
                items: array[date]
            });
        });
    }

    /**
     * Group upcomingDates presentDates and beforeDates by year, month or week.
     */
    groupDates() {
        this.orderedDates = [];
        this._upcomingDates = this.displayDates(this._upcomingDates, true);
        this._presentDates = this.displayDates(this._presentDates, false);
        this._pastDates = this.displayDates(this._pastDates, false);

        this.regroupDates(this._upcomingDates);
        this.regroupDates(this._presentDates);
        this.regroupDates(this._pastDates);
    }

    /**
     * Component initialized states.
     */
    initActivityTimeline() {
        this.sortDates();
        this.groupDates();
    }

    /**
     * Handle the click on an action. Dispatch the actionclick event.
     *
     * @param {Event} event
     */
    handleActionClick(event) {
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
                detail: {
                    ...event.detail,
                    targetName: event.currentTarget.dataset.name
                }
            })
        );
    }

    handleButtonClick(event) {
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
                    targetName: event.currentTarget.dataset.name
                }
            })
        );
    }

    handleCheck(event) {
        event.stopPropagation();

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
                    checked: event.detail.checked,
                    targetName: event.currentTarget.dataset.name
                }
            })
        );
    }

    /**
     * Toggle the show more button
     */
    handleToggleShowMoreButton() {
        this.showMore = !this.showMore;
        this.initActivityTimeline();
    }
}
