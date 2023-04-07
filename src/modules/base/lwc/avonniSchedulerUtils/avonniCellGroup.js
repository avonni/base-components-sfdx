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
import Cell from './avonniCell';

/**
 * Group of scheduler cells. Corresponds to the resources rows/columns in the timeline display, or the day columns in the calendar display.
 *
 * @class
 * @param {SchedulerCell[]} cells Array of `SchedulerCell` objects.
 * @param {object[]} events Array of event objects.
 * @param {object[]} referenceCells Array of cell objects used as a reference to create the cells.
 */
export class SchedulerCellGroup {
    constructor(props) {
        this.cells = [];
        this.referenceCells = normalizeArray(props.referenceCells);
        this.events = normalizeArray(props.events);
        this.timezone = props.timezone;
        this.initCells();
    }

    /**
     * Initialize the cells array.
     */
    initCells() {
        this.cells = [];
        this.referenceCells.forEach((element, index) => {
            const cell = new Cell({ ...element, timezone: this.timezone });
            const nextCell = this.referenceCells[index + 1];
            if (nextCell) {
                const hasSameStart = nextCell.start === cell.start;
                const isOneHour = cell.end - cell.start === 3600000 - 1;
                if (hasSameStart && isOneHour) {
                    cell.removedByTimeChange = true;
                }
            }
            this.cells.push(cell);
        });

        const events = this.events;
        events.forEach((event) => {
            this.addEventToCells(event);
        });
    }

    /**
     * Add the event to the each cell it crosses.
     *
     * @param {object} Event Event to add to the cells.
     * @param {string} eventType Type of the event. Used by the calendar display, in the SchedulerCalendarColumn child class. The event will be added to the corresponding property, depending on its type.
     */
    addEventToCells(event, eventType = 'events') {
        const cells = this.cells;
        event.offsetSide = 0;

        // Find the cell where the event starts
        let i = cells.findIndex((cell) => {
            // If the event is a calendar month placeholder
            // that spans on multiple weeks,
            // use the beginning of the current week as a start
            const start = event.weekStart || event.from;
            return cell.end >= start;
        });

        if (i > -1) {
            // If the event is a reference line,
            // use the start date as an end date too
            const to = event.to || event.from;

            // Add the event to every cell it crosses
            while (i < cells.length && to >= cells[i].start) {
                // If the event is a calendar month placeholder,
                // make sure it hasn't been added already
                const exists = cells[i][eventType].find(
                    (evt) => evt.key === event.key
                );
                if (!exists) {
                    cells[i][eventType].push(event);
                    cells[i][eventType].sort((a, b) => a.from - b.from);
                }
                i += 1;
                if (event.weekStart) {
                    // If the event is a visible calendar month placeholder,
                    // add it only to the first week it crosses
                    break;
                }
            }
        }
    }

    /**
     * Remove the event from the cells it crosses.
     *
     * @param {object} event Event to remove from the cells.
     */
    removeEvent(event) {
        const { cells, events } = this;

        // Remove the event from the cells
        let i = cells.findIndex((cell) => cell.end >= event.from);
        if (i > -1) {
            while (i < cells.length && event.to > cells[i].start) {
                const eventIndex = cells[i].events.findIndex(
                    (evt) => evt.key === event.key
                );
                cells[i].events.splice(eventIndex, 1);
                i += 1;
            }
        }

        // Remove the event
        const eventIndex = events.findIndex((evt) => evt.key === event.key);
        events.splice(eventIndex, 1);
    }

    /**
     * Get a cell from its start date.
     *
     * @param {number} start Start of the cell to find.
     * @returns {SchedulerCell|undefined} Cell found, or undefined if not found.
     */
    getCellFromStart(start) {
        return this.cells.find((cell) => cell.start === start);
    }
}
