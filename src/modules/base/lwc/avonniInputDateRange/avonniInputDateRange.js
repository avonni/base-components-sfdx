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
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';
import { parseDateTime } from 'c/internationalizationLibrary';
import { classSet } from 'c/utils';

const DATE_TYPES = {
    valid: ['date', 'datetime'],
    default: 'date'
};
const DATE_STYLES = {
    valid: ['short', 'medium', 'long'],
    defaultDate: 'medium',
    defaultTime:'short'
};
const LABEL_VARIANTS = {
    valid: ['standard', 'label-hidden', 'label-inline', 'label-stacked'],
    default: 'standard'
};

export default class AvonniInputDateRange extends LightningElement {
    @api fieldLevelHelp;
    @api label;
    @api labelStartDate;
    @api labelEndDate;

    _timezone;
    _startDate;
    _endDate;

    _dateStyle = DATE_STYLES.defaultDate;
    _timeStyle = DATE_STYLES.defaultTime;
    _type = DATE_TYPES.default;
    _disabled = false;
    _required = false;
    _readOnly = false;
    _variant = LABEL_VARIANTS.default;

    startTime;
    endTime;
    isOpenStartDate = false;
    isOpenEndDate = false;
    _cancelBlurStartDate = false;
    _cancelBlurEndDate = false;

    @api
    get startDate() {
        return this._startDate;
    }

    set startDate(value) {
        this._startDate = value;
        this.initialStartDate = value;
        this.initStartDate();
    }

    @api
    get endDate() {
        return this._endDate;
    }

    set endDate(value) {
        this._endDate = value;
        this.initialEndDate = value;
        this.initEndtDate();
    }

    @api
    get timezone() {
        return this._timezone;
    }

    set timezone(value) {
        this._timezone = value;
        this.initStartDate();
        this.initEndtDate();
    }

    @api 
    get dateStyle() {
        return this._dateStyle;
    }

    set dateStyle(value) {
        this._dateStyle = normalizeString(value, {
            fallbackValue: DATE_STYLES.defaultDate,
            validValues: DATE_STYLES.valid
        });
    }

    @api 
    get timeStyle() {
        return this._timeStyle;
    }

    set timeStyle(value) {
        this._timeStyle = normalizeString(value, {
            fallbackValue: DATE_STYLES.defaultTime,
            validValues: DATE_STYLES.valid
        });
    }

    @api 
    get type() {
        return this._type;
    }

    set type(type) {
        this._type = normalizeString(type, {
            fallbackValue: DATE_TYPES.default,
            validValues: DATE_TYPES.valid
        });
        this.initStartDate();
        this.initEndtDate();
    }

    @api 
    get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    @api 
    get readOnly() {
        return this._readOnly;
    }

    set readOnly(value) {
        this._readOnly = normalizeBoolean(value);
    }

    @api 
    get required() {
        return this._required;
    }

    set required(value) {
        this._required = normalizeBoolean(value);
    }

    @api 
    get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: LABEL_VARIANTS.default,
            validValues: LABEL_VARIANTS.valid
        });
    }

    get showTime() {
        return this.type === 'datetime';
    }

    get startDateString() {
        let dateStr = '';

        if (this.startDate) {
            dateStr = this.dateFormat(this.startDate);
        }

        return dateStr;
    }

    get endDateString() {
        let dateStr = '';

        if (this.endDate) {
            dateStr = this.dateFormat(this.endDate);
        }

        return dateStr;
    }

    get computedLabelClass() {
        return classSet('avonni-label-container').add({
            'slds-assistive-text': this.variant === 'label-hidden',
            'slds-m-right_small': this.variant === 'label-inline'
        }).toString();
    }

    get computedWrapperClass() {
        return classSet().add({
            'slds-grid': this.variant === 'label-inline'
        }).toString();
    }

    @api
    focus() {
        this.template.querySelector('.start-date').focus();
    }

    @api
    blur() {
        this.template.querySelector('.start-date').blur();
        this.template.querySelector('.end-date').blur();
    }

    initStartDate() {
        if (this.startDate) {
            if (this.timezone) {
                this._startDate = new Date(
                    new Date(this.initialStartDate).toLocaleString('default', {
                        timeZone: this.timezone
                    })
                );
            } else {
                this._startDate = new Date(this.initialStartDate);
            }

            if (this.type === 'datetime') {
                this.startTime = this._startDate.toTimeString().substr(0, 5);
            }

            this._startDate.setHours(0, 0, 0, 0);
        }
    }

    initEndtDate() {
        if (this.endDate) {
            if (this.timezone) {
                this._endDate = new Date(
                    new Date(this.initialEndDate).toLocaleString('default', {
                        timeZone: this.timezone
                    })
                );
            } else {
                this._endDate = new Date(this.initialEndDate);
            }

            if (this.type === 'datetime') {
                this.endTime = this._endDate.toTimeString().substr(0, 5);
            }

            this._endDate.setHours(0, 0, 0, 0);
        }
    }

    handleChangeStartTime(event) {
        event.stopPropagation();
        event.preventDefault();
        this.startTime = event.target.value;
        this.dispatchChange();
    }

    handleChangeEndTime(event) {
        event.stopPropagation();
        event.preventDefault();
        this.endTime = event.target.value;
        this.dispatchChange();
    }

    handleChangeStartDate(event) {
        // Date format received is: YYYY-MM-DD
        const date = event.detail.value.split('-');
        const year = Number(date[0]);
        const month = Number(date[1]) - 1;
        const day = Number(date[2]);

        this.startDate = new Date(year, month, day);
        event.stopPropagation();
        this._cancelBlurStartDate = false;
        this.handleBlurStartDate();
    }

    handleFocusStartDate() {
        if (this.readOnly) return;

        this.allowBlurStartDate();

        if (!this.isOpenStartDate) {
            this.toggleStartDateVisibility();
        }
    }

    handleBlurStartDate(event) {
        if (this._cancelBlurStartDate) {
            return;
        }

        if (this.isOpenStartDate) {
            if (event !== undefined && isNaN(event.target.value)) {
                let date = parseDateTime(event.target.value);

                if (date) {
                    this.startDate = date;
                    this.startDate.setHours(0, 0, 0, 0);
                }
            }

            this.toggleStartDateVisibility();

            if (
                this.startDate &&
                (!this.endDate ||
                    this.startDate.getTime() > this.endDate.getTime())
            ) {
                let endDate = new Date(this.startDate).setDate(
                    this.startDate.getDate() + 1
                );
                this.endDate = new Date(new Date(endDate).setHours(0, 0, 0, 0));
                this.template.querySelector('.end-date').focus();
            }

            this.dispatchChange();
        }
    }

    handlePrivateBlurStartDate(event) {
        event.stopPropagation();
        this.allowBlurStartDate();
        this.handleBlurStartDate();
    }

    handlePrivateFocusStartDate(event) {
        event.stopPropagation();
        this.cancelBlurStartDate();
        this.handleFocusStartDate();
    }

    allowBlurStartDate(event) {
        if (event !== undefined) {
            this._cancelBlurStartDate = false;
        }
    }

    cancelBlurStartDate() {
        this._cancelBlurStartDate = true;
    }

    toggleStartDateVisibility() {
        this.isOpenStartDate = !this.isOpenStartDate;
        if (!this.isOpenStartDate) {
            this.template.querySelector('.start-date').blur();
        }
    }

    handleChangeEndDate(event) {
        // Date format received is: YYYY-MM-DD
        const date = event.detail.value.split('-');
        const year = Number(date[0]);
        const month = Number(date[1]) - 1;
        const day = Number(date[2]);
        
        this.endDate = new Date(year, month, day);
        event.stopPropagation();
        this._cancelBlurEndDate = false;
        this.handleBlurEndDate();
    }

    handleFocusEndDate() {
        if (this.readOnly) return;
        
        this.allowBlurEndDate();

        if (!this.isOpenEndDate) {
            this.toggleEndDateVisibility();
        }
    }

    handleBlurEndDate(event) {
        if (this._cancelBlurEndDate) {
            return;
        }

        if (this.isOpenEndDate) {
            if (event !== undefined && isNaN(event.target.value)) {
                let date = parseDateTime(event.target.value);

                if (date) {
                    this.endDate = date;
                    this.endDate.setHours(0, 0, 0, 0);
                }
            }

            this.toggleEndDateVisibility();

            if (
                this.endDate &&
                (!this.startDate ||
                    this.startDate.getTime() > this.endDate.getTime())
            ) {
                let startDate = new Date(this.endDate).setDate(
                    this.endDate.getDate() - 1
                );
                this.startDate = new Date(
                    new Date(startDate).setHours(0, 0, 0, 0)
                );
                this.template.querySelector('.start-date').focus();
            }

            this.dispatchChange();
        }
    }

    handlePrivateBlurEndDate(event) {
        event.stopPropagation();
        this.allowBlurEndDate();
        this.handleBlurEndDate();
    }

    handlePrivateFocusEndDate(event) {
        event.stopPropagation();
        this.handleBlurEndDate();
        this.handleFocusEndDate();
    }

    allowBlurEndDate(event) {
        if (event !== undefined) {
            this._cancelBlurEndDate = false;
        }
    }

    cancelBlurEndDate() {
        this._cancelBlurEndDate = true;
    }

    toggleEndDateVisibility() {
        this.isOpenEndDate = !this.isOpenEndDate;
        if (!this.isOpenEndDate) {
            this.template.querySelector('.end-date').blur();
        }
    }

    dateFormat(value) {
        let date = value.getDate();
        let year = value.getFullYear();
        let month = value.getMonth() + 1;

        if (this.dateStyle === 'medium') {
            month = value.toLocaleString('default', { month: 'short' });
            return `${month} ${date}, ${year}`;
        }

        if (this.dateStyle === 'long') {
            month = value.toLocaleString('default', { month: 'long' });
            return `${month} ${date}, ${year}`;
        }

        return `${month}/${date}/${year}`;
    }

    dispatchChange() {
        let startDate = this.startTime
            ? `${this.startDateString} ${this.startTime}`
            : this.startDateString;
        let endDate = this.endTime
            ? `${this.endDateString} ${this.endTime}`
            : this.endDateString;

        if (this.timezone) {
            startDate = new Date(startDate).toLocaleString('default', {
                timeZone: this.timezone
            });
            endDate = new Date(endDate).toLocaleString('default', {
                timeZone: this.timezone
            });
        }

        startDate = this.startDateString
            ? new Date(startDate).toISOString()
            : startDate;
        endDate = this.endDateString
            ? new Date(endDate).toISOString()
            : endDate;

        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    startDate: startDate,
                    endDate: endDate
                }
            })
        );
    }
}
