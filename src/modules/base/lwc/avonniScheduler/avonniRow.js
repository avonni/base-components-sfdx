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

import { normalizeArray } from 'c/utilsPrivate';

export default class AvonniSchedulerRow {
    constructor(props) {
        this.color = props.color;
        this.data = props.data;
        this.key = props.key && props.key.toString();
        this.columns = [];
        this.minHeight = 0;
        this.referenceColumns = normalizeArray(props.referenceColumns);
        this.events = normalizeArray(props.events);
        this._height = 0;
        this.initColumns();
    }

    get height() {
        return this._height > this.minHeight ? this._height : this.minHeight;
    }
    set height(value) {
        this._height = value;
    }

    initColumns() {
        this.columns = [];
        this.referenceColumns.forEach((element) => {
            this.columns.push({
                start: element.start,
                end: element.end,
                events: []
            });
        });

        const events = this.events;
        events.forEach((event) => {
            this.addEventToColumns(event);
        });
    }

    addEventToColumns(event) {
        const columns = this.columns;
        event.offsetTop = 0;

        // Find the column where the event starts
        let i = columns.findIndex((column) => {
            return column.end >= event.from;
        });

        if (i > -1) {
            // Add the event to every column it crosses
            while (i < columns.length && event.to > columns[i].start) {
                columns[i].events.push(event);
                columns[i].events = columns[i].events.sort(
                    (a, b) => a.from - b.from
                );
                i += 1;
            }
        }
    }

    removeEvent(event) {
        const { columns, events } = this;

        // Remove the event from the columns
        let i = columns.findIndex((column) => column.end >= event.from);
        if (i > -1) {
            while (i < columns.length && event.to > columns[i].start) {
                const eventIndex = columns[i].events.findIndex(
                    (evt) => evt.key === event.key
                );
                columns[i].events.splice(eventIndex, 1);
                i += 1;
            }
        }

        // Remove the event
        const eventIndex = events.findIndex((evt) => evt.key === event.key);
        events.splice(eventIndex, 1);
    }

    getColumnFromStart(start) {
        return this.columns.find((column) => column.start === start);
    }
}
