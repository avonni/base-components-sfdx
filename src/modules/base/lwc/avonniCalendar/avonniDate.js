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

import { classSet } from 'c/utils';
import {
    getWeekNumber,
    normalizeArray,
    normalizeBoolean,
    normalizeObject
} from 'c/utilsPrivate';
import Label from './avonniDateLabel';

export default class AvonniCalendarDate {
    constructor(props) {
        this.adjacentMonth = props.adjacentMonth;
        this.date = props.date;
        this.disabled = normalizeBoolean(props.disabled);
        this.isPartOfInterval = normalizeBoolean(props.isPartOfInterval);
        this.isToday = normalizeBoolean(props.isToday);
        this.isWeekNumber = normalizeBoolean(props.isWeekNumber);
        this.chip = new Label(normalizeObject(props.chip));
        this.markers = normalizeArray(props.markers);
        this.selected = normalizeBoolean(props.selected);
    }

    get ariaCurrent() {
        return this.isToday ? 'date' : null;
    }

    get hasChip() {
        return this.chip.iconName || this.chip.label;
    }

    get label() {
        if (this.isWeekNumber) {
            return getWeekNumber(this.date);
        }
        return new Date(this.date).getDate();
    }

    get labelClass() {
        return classSet({
            'slds-day': !this.isWeekNumber,
            'avonni-calendar__disabled-cell': this.disabled
        }).toString();
    }

    get wrapperClass() {
        return classSet({
            'avonni-calendar__date-cell': !this.isWeekNumber,
            'avonni-calendar__week-cell': this.isWeekNumber,
            'slds-day_adjacent-month': this.adjacentMonth,
            'slds-is-today': this.isToday,
            'slds-is-selected': this.selected || this.isPartOfInterval,
            'slds-is-selected-multi': this.isPartOfInterval
        }).toString();
    }
}
