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

const GROUP_BY_OPTIONS = {
    valid: ['week', 'month', 'year'],
    default: undefined
};
/**
 * @class
 * @descriptor avonni-activity-timeline
 * @storyId example-activitytimeline--base
 * @public
 */
export default class AvonniActivityTimeline extends LightningElement {
    /**
     * The title can include text, and is displayed in the header.
     * 
     * @public
     * @type {string}
     */
    @api title;
    /**
     * The Lightning Design System name of the icon. Specify the name in the format 'utility:down' where 'utility' is the category, and 'down' is the specific icon to be displayed. The icon is displayed in the header before the title.
     * 
     * @public
     * @type {string}
     */
    @api iconName;

    _collapsible = false;
    _closed = false;
    _groupBy = GROUP_BY_OPTIONS.default;
    _items = [];
    _actions = [];

    _key;
    _sortedItems = [];
    _beforeDates = [];
    _upcomingDates = [];

    @track ungroupedItems = [];
    @track orderedDates = [];

    connectedCallback() {
        this.initActivityTimeline();
        this.connected = true;
    }

    /**
     * If true, the section is collapsible, the left icon is present.
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
     * If true, close the section.
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
     * If present, the value will define how the items will be grouped. Values can include week, month, year or undefined.
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
    }

    /**
     * See Activity Timeline Item.
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
        if (this.connected) {
            this.initActivityTimeline();
        }
    }

    /**
     * A list of different actions for dropdown menu.
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
     * Compute Number of the week in the year.
     * 
     * @param {Date} date
     * @type {Date|number}
     * @returns number
     */
    getNumberOfWeek(date) {
        const today = new Date(date);
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    /**
     * Compute sortedItems list array.
     */
    sortItems() {
        this._sortedItems = [...this.items];
        this._sortedItems.sort((a, b) => b.datetimeValue - a.datetimeValue);
    }

    /**
     * Sort the item dates by year, month, week.
     */
    sortDates() {
        this._sortedItems.forEach((item) => {
            const date = new Date(item.datetimeValue);
            const today = new Date();
            if (date.getFullYear() > today.getFullYear()) {
                this._upcomingDates.push(item);
            } else if (date.getFullYear() <= today.getFullYear()) {
                if (this._groupBy === 'month') {
                    if (date.getMonth() > today.getMonth()) {
                        this._upcomingDates.push(item);
                    } else if (date.getMonth() <= today.getMonth()) {
                        this._beforeDates.push(item);
                    }
                } else if (this._groupBy === 'year') {
                    this._beforeDates.push(item);
                } else if (this._groupBy === 'week' || !this._groupBy) {
                    if (
                        this.getNumberOfWeek(date) > this.getNumberOfWeek(today)
                    ) {
                        this._upcomingDates.push(item);
                    } else if (
                        this.getNumberOfWeek(date) <=
                        this.getNumberOfWeek(today)
                    ) {
                        this._beforeDates.push(item);
                    }
                }
            }
        });
    }

    /**
     * Group upcomingDates and beforeDates by year, month, week.
     */
    groupDates() {
        this._upcomingDates = this._upcomingDates.reduce((prev, cur) => {
            this._key = 'Upcoming';
            if (!prev[this._key]) {
                prev[this._key] = [cur];
            } else {
                prev[this._key].push(cur);
            }
            return prev;
        }, []);

        this._beforeDates = this._beforeDates.reduce((prev, cur) => {
            const date = new Date(cur.datetimeValue);
            if (this._groupBy === 'month') {
                this._key = `${date.toLocaleString('en-EN', {
                    month: 'long'
                })} ${date.getFullYear()}`;
            } else if (this._groupBy === 'week' || !this._groupBy) {
                this._key = `Week: ${this.getNumberOfWeek(
                    date
                )}, ${date.getFullYear()}`;
            } else if (this._groupBy === 'year') {
                this._key = `${date.getFullYear()}`;
            }

            if (!prev[this._key]) {
                prev[this._key] = [cur];
            } else {
                prev[this._key].push(cur);
            }
            return prev;
        }, []);

        Object.keys(this._upcomingDates).forEach((date) => {
            this.orderedDates.push({
                label: date,
                items: this._upcomingDates[date]
            });
        });

        Object.keys(this._beforeDates).forEach((date) => {
            this.orderedDates.push({
                label: date,
                items: this._beforeDates[date]
            });
        });
    }

    /**
     * Sort the orderedDates by hours.
     */
    sortHours() {
        this.orderedDates.forEach((object) => {
            object.items.sort((a, b) => a.datetimeValue - b.datetimeValue);
        });
    }

    /**
     * UngroupedItems ordered by dates and hours.
     */
    createUngroupedItems() {
        this.orderedDates.forEach((group) => {
            this.ungroupedItems.push(group.items);
        });
        this.ungroupedItems = this.ungroupedItems.reduce(
            (acc, val) => acc.concat(val),
            []
        );
    }

    /**
     * Component initialized states.
     */
    initActivityTimeline() {
        this.sortItems();
        this.sortDates();
        this.groupDates();
        this.sortHours();
        this.createUngroupedItems();
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
     * Toggle for grouping dates.
     * 
     * @type {boolean}
     */
    get noGroupBy() {
        return !this.groupBy;
    }
}
