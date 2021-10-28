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
import { FieldConstraintApi, InteractingState } from 'c/inputUtils';

const DATE_TYPES = {
    valid: ['date', 'datetime'],
    default: 'date'
};
const DATE_STYLES = {
    valid: ['short', 'medium', 'long'],
    defaultDate: 'medium',
    defaultTime: 'short'
};
const LABEL_VARIANTS = {
    valid: ['standard', 'label-hidden'],
    default: 'standard'
};

/**
 * @class
 * @public
 * @storyId example-input-date-range--base
 * @descriptor avonni-input-date-range
 */
export default class AvonniInputDateRange extends LightningElement {
    /**
     * Help text detailing the purpose and function of the input.
     * This attribute isn't supported for file, radio, toggle, and checkbox-button types.
     *
     * @type {string}
     * @public
     */
    @api fieldLevelHelp;

    /**
     * Text label for the input.
     *
     * @type {string}
     * @required
     * @public
     */
    @api label;

    /**
     * Text label for the start input.
     *
     * @type {string}
     * @public
     */
    @api labelStartDate;

    /**
     * If type is datetime, text label for the start time input.
     *
     * @type {string}
     * @public
     */
    @api labelStartTime;

    /**
     * Text label for the end input.
     *
     * @type {string}
     * @public
     */
    @api labelEndDate;

    /**
     * If type is datetime, text label for the end time input.
     *
     * @type {string}
     * @public
     */
    @api labelEndTime;

    /**
     * Error message to be displayed when the start-date is missing.
     *
     * @type {string}
     * @public
     */
    @api messageWhenValueMissing;

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

    helpMessage;
    _valid = true;

    connectedCallback() {
        this.interactingState = new InteractingState();
        this.interactingState.onleave(() => this.showHelpMessageIfInvalid());
    }

    renderedCallback() {
        this.updateClassListWhenError();
    }

    /**
     * Specifies the value of the start date input.
     *
     * @type {string}
     * @public
     */
    @api
    get startDate() {
        return this._startDate;
    }

    set startDate(value) {
        this._startDate = value;
        this.initialStartDate = value;
        this.initStartDate();
    }

    /**
     * Specifies the value of the end date input.
     *
     * @type {string}
     * @public
     */
    @api
    get endDate() {
        return this._endDate;
    }

    set endDate(value) {
        this._endDate = value;
        this.initialEndDate = value;
        this.initEndtDate();
    }

    /**
     * Specifies the time zone used when type='datetime' only.
     * This value defaults to the user's Salesforce time zone setting.
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
        this.initStartDate();
        this.initEndtDate();
    }

    /**
     * The display style of the date when type='date' or type='datetime'.
     * Valid values are short, medium and long. The format of each style is specific to the locale.
     * On mobile devices this attribute has no effect.
     *
     * @type {string}
     * @default medium
     * @public
     */
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

    /**
     * The display style of the time when type='time' or type='datetime'.
     * Valid values are short, medium and long. Currently, medium and long styles look the same.
     * On mobile devices this attribute has no effect.
     *
     * @type {string}
     * @default short
     * @public
     */
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

    /**
     * Valid types include date and datetime.
     *
     * @type {string}
     * @default date
     * @public
     */
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

    /**
     * If present, the input field is disabled and users cannot interact with it.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    /**
     * If present, the input is read-only and cannot be edited by users.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get readOnly() {
        return this._readOnly;
    }

    set readOnly(value) {
        this._readOnly = normalizeBoolean(value);
    }

    /**
     * If present, the input field must be filled out before the form is submitted.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get required() {
        return this._required;
    }

    set required(value) {
        this._required = normalizeBoolean(value);
    }

    /**
     * The variant changes the appearance of an input field.
     * Accepted variants include standard and label-hidden.
     * This value defaults to standard, which displays the label above the field.
     * Use label-hidden to hide the label but make it available to assistive technology.
     *
     * @type {string}
     * @default standard
     * @public
     */
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

    /**
     * Represents the validity states that an element can be in, with respect to constraint validation.
     *
     * @type {string}
     * @public
     */
    @api
    get validity() {
        return this._constraint.validity;
    }

    /**
     * Start date input.
     *
     * @type {element}
     */
    get startDateInput() {
        return this.template.querySelector(
            '[data-element-id="input-start-date"]'
        );
    }

    /**
     * End date input.
     *
     * @type {element}
     */
    get endDateInput() {
        return this.template.querySelector(
            '[data-element-id="input-end-date"]'
        );
    }

    /**
     * Start time input.
     *
     * @type {element}
     */
    get startTimeInput() {
        return this.template.querySelector(
            '[data-element-id="lightning-input-start-time"]'
        );
    }

    /**
     * End time input.
     *
     * @type {element}
     */
    get endTimeInput() {
        return this.template.querySelector(
            '[data-element-id="lightning-input-end-time"]'
        );
    }

    /**
     * True if type is datetime.
     *
     * @type {boolean}
     */
    get showTime() {
        return this.type === 'datetime';
    }

    /**
     * Formatted start date string.
     *
     * @type {string}
     */
    get startDateString() {
        let dateStr = '';

        if (this.startDate) {
            dateStr = this.dateFormat(this.startDate);
        }

        return dateStr;
    }

    /**
     * Formatted end date string.
     *
     * @type {string}
     */
    get endDateString() {
        let dateStr = '';

        if (this.endDate) {
            dateStr = this.dateFormat(this.endDate);
        }

        return dateStr;
    }

    /**
     * Class of the label container.
     *
     * @type {string}
     */
    get computedLabelClass() {
        return classSet('avonni-label-container')
            .add({
                'slds-assistive-text': this.variant === 'label-hidden'
            })
            .toString();
    }

    /**
     * True if readOnly and startDateString.
     *
     * @type {boolean}
     */
    get readOnlyAndDate() {
        return this.readOnly && this.startDateString;
    }

    /**
     * Returns true if only the start date is present.
     *
     * @type {boolean}
     */
    get isOnlyStartDate() {
        return this.startDate && !this.endDate;
    }

    /**
     * Returns true if only the end date is present.
     *
     * @type {boolean}
     */
    get isOnlyEndDate() {
        return !this.startDate && this.endDate;
    }

    /**
     * Returns true if the start date and end date are present.
     *
     * @type {boolean}
     */
    get areBothDatePresent() {
        return this.startDate && this.endDate;
    }

    /**
     * Array with the start date and end date.
     *
     * @type {object}
     */
    get startDateEndDate() {
        return [this.startDate, this.endDate];
    }

    /**
     * Removes the slds-has-error class on the whole element if it's not valid.
     * Aplies it on every input we need it applied.
     * Removes it from every input when valid.
     */
    updateClassListWhenError() {
        if (!this._valid && !this._readOnly) {
            this.classList.remove('slds-has-error');
            this.startDateInput.classList.add('slds-has-error');
            this.startDateInput.classList.add(
                'avonni-input-date-rage-input-error'
            );
            this.endDateInput.classList.add('slds-has-error');
            this.endDateInput.classList.add(
                'avonni-input-date-rage-input-error'
            );
            if (this.showTime) {
                this.startTimeInput.classList.add('slds-has-error');
                this.endTimeInput.classList.add('slds-has-error');
            }
        }
        if (this._valid && !this._readOnly) {
            this.startDateInput.classList.remove('slds-has-error');
            this.startDateInput.classList.remove(
                'avonni-input-date-rage-input-error'
            );
            this.endDateInput.classList.remove('slds-has-error');
            this.endDateInput.classList.remove(
                'avonni-input-date-rage-input-error'
            );
            if (this.showTime) {
                this.startTimeInput.classList.remove('slds-has-error');
                this.endTimeInput.classList.remove('slds-has-error');
            }
        }
    }

    /**
     * Sets focus on the start date input.
     *
     * @public
     */
    @api
    focus() {
        this.startDateInput.focus();
    }

    /**
     * Removes keyboard focus from the start date input and end date input.
     *
     * @public
     */
    @api
    blur() {
        this.startDateInput.blur();
        this.endDateInput.blur();
    }

    /**
     * Checks if the input is valid.
     *
     * @returns {boolean} Indicates whether the element meets all constraint validations.
     * @public
     */
    @api
    checkValidity() {
        return this._constraint.checkValidity();
    }

    /**
     * Displays the error messages and returns false if the input is invalid.
     * If the input is valid, reportValidity() clears displayed error messages and returns true.
     *
     * @returns {boolean} - The validity status of the input fields.
     * @public
     */
    @api
    reportValidity() {
        return this._constraint.reportValidity((message) => {
            this.helpMessage = message;
        });
    }

    /**
     * Sets a custom error message to be displayed when a form is submitted.
     *
     * @param {string} message - The string that describes the error.
     * If message is an empty string, the error message is reset.
     * @public
     */
    @api
    setCustomValidity(message) {
        this._constraint.setCustomValidity(message);
    }

    /**
     * Displays error messages on invalid fields.
     * An invalid field fails at least one constraint validation and returns false when checkValidity() is called.
     *
     * @public
     */
    @api
    showHelpMessageIfInvalid() {
        this.reportValidity();
    }

    /**
     * Gets FieldConstraintApi.
     *
     * @type {object}
     */
    get _constraint() {
        if (!this._constraintApi) {
            this._constraintApi = new FieldConstraintApi(() => this, {
                valueMissing: () =>
                    !this.disabled && this.required && !this.startDate
            });
        }
        return this._constraintApi;
    }

    /**
     * Initialization of start date depending on timezone and type.
     */
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

    /**
     * Initialization of end date depending on timezone and type.
     */
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

    /**
     * Handles the change of start-time.
     */
    handleChangeStartTime(event) {
        event.stopPropagation();
        event.preventDefault();
        this.startTime = event.target.value;
        this.dispatchChange();
    }

    /**
     * Handles the change of end-time.
     */
    handleChangeEndTime(event) {
        event.stopPropagation();
        event.preventDefault();
        this.endTime = event.target.value;
        this.dispatchChange();
    }

    /**
     * Handles the change of start-date on c-calendar.
     */
    handleChangeStartDate(event) {
        const date = event.detail.value;

        // Handler if there is a start date and there is an end date.
        if (this.areBothDatePresent) {
            if (date[1] > this._endDate) {
                this._startDate = new Date(date[1]);
            } else if (date[0] < this._startDate) {
                this._startDate = new Date(date[0]);
                // If user click on the same date.
            } else if (date.length === 1) {
                this._startDate = null;
            } else {
                this._startDate = new Date(date[1]);
            }
            // If there is no start date, but there is an end date.
        } else if (this.isOnlyEndDate) {
            if (date[1] > this._endDate) {
                this._startDate = new Date(date[1]);
            } else if (date.length === 0) {
                this._startDate = this._endDate;
            } else {
                this._startDate = new Date(date[0]);
            }
            // If there is no start date and no end date.
        } else {
            this._startDate = date[0] ? new Date(date[0]) : null;
        }

        event.stopPropagation();

        this._cancelBlurStartDate = false;
        this.handleBlurStartDate();
    }

    /**
     * Handles focus for the start-date input.
     */
    handleFocusStartDate() {
        if (this.readOnly) return;

        this.allowBlurStartDate();

        if (!this.isOpenStartDate) {
            this.toggleStartDateVisibility();
        }
        this.interactingState.enter();
    }

    /**
     * Handles blur for the start-date input.
     */
    handleBlurStartDate(event) {
        this.interactingState.leave();

        this._valid = !(this.required && !this.startDate);
        if (this._cancelBlurStartDate) {
            return;
        }

        if (this.isOpenStartDate) {
            if (event !== undefined && isNaN(event.target.value)) {
                let date = parseDateTime(event.target.value);

                if (date) {
                    this._startDate = date;
                    this._startDate.setHours(0, 0, 0, 0);
                }
            }
            this.toggleStartDateVisibility();

            if (
                this.startDate &&
                (!this.endDate ||
                    this.startDate.getTime() > this.endDate.getTime())
            ) {
                this._endDate = null;
                this.endDateInput.focus();
            }

            this.dispatchChange();
        }
    }

    /**
     * Handles blur for the c-calendar for start-date.
     */
    handlePrivateBlurStartDate(event) {
        event.stopPropagation();
        this.allowBlurStartDate();
        this.handleBlurStartDate();
    }

    /**
     * Handles focus for the c-calendar for start-date.
     */
    handlePrivateFocusStartDate(event) {
        event.stopPropagation();
        this.cancelBlurStartDate();
        this.handleFocusStartDate();
    }

    /**
     * Sets the variable cancelBlurStartDate to false.
     */
    allowBlurStartDate(event) {
        if (event !== undefined) {
            this._cancelBlurStartDate = false;
        }
    }

    /**
     * Sets the variable cancelBlurStartDate to true.
     */
    cancelBlurStartDate() {
        this._cancelBlurStartDate = true;
    }

    /**
     * Toggles the visibility of c-calendar for start-date.
     */
    toggleStartDateVisibility() {
        this.isOpenStartDate = !this.isOpenStartDate;
        if (!this.isOpenStartDate) {
            this.startDateInput.blur();
        }
    }

    /**
     * Handles the change of end-date on c-calendar.
     */
    handleChangeEndDate(event) {
        const date = event.detail.value;

        // Handler if there is an end date and there is no start date.
        if (date.length === 1 && !this._startDate) {
            this._endDate = new Date(date[0]);
            // Handler if there is no end date, but there is a start date.
        } else if (this.isOnlyStartDate) {
            if (date[1] > this._startDate) {
                this._endDate = new Date(date[1]);
            } else if (date.length === 0) {
                this._endDate = this._startDate;
            } else {
                this._endDate = new Date(date[0]);
            }
            // Handler if there is no end date and no start date or both date.
        } else {
            if (date[1]) {
                this._endDate = new Date(date[1]);
            } else {
                this._startDate = date[0] ? new Date(date[0]) : null;
                // For the case of clicking on the same date to delete it.
                this._endDate = null;
            }
        }

        event.stopPropagation();
        this._cancelBlurEndDate = false;
        this.handleBlurEndDate();
    }

    /**
     * Handles focus for the end date input.
     */
    handleFocusEndDate() {
        if (this.readOnly) return;

        this.allowBlurEndDate();

        if (!this.isOpenEndDate) {
            this.toggleEndDateVisibility();
        }
    }

    /**
     * Handles blur for the end date input.
     */
    handleBlurEndDate(event) {
        if (this._cancelBlurEndDate) {
            return;
        }

        if (this.isOpenEndDate) {
            if (event !== undefined && isNaN(event.target.value)) {
                let date = parseDateTime(event.target.value);

                if (date) {
                    this._endDate = date;
                    this._endDate.setHours(0, 0, 0, 0);
                }
            }

            this.toggleEndDateVisibility();

            if (
                this.areBothDatePresent &&
                this.startDate.getTime() > this.endDate.getTime()
            ) {
                let startDate = new Date(this.endDate).setDate(
                    this.endDate.getDate()
                );
                this._startDate = new Date(
                    new Date(startDate).setHours(0, 0, 0, 0)
                );
                this._endDate = null;
                this.endDateInput.focus();
            }

            this.dispatchChange();
        }
    }

    /**
     * Handles blur for the c-calendar for end-date.
     */
    handlePrivateBlurEndDate(event) {
        event.stopPropagation();
        this.allowBlurEndDate();
        this.handleBlurEndDate();
    }

    /**
     * Handles focus for the c-calendar for end-date.
     */
    handlePrivateFocusEndDate(event) {
        event.stopPropagation();
        this.handleBlurEndDate();
        this.handleFocusEndDate();
    }

    /**
     * Sets the variable cancelBlurEndDate to false.
     */
    allowBlurEndDate(event) {
        if (event !== undefined) {
            this._cancelBlurEndDate = false;
        }
    }

    /**
     * Sets the variable cancelBlurEndDate to true.
     */
    cancelBlurEndDate() {
        this._cancelBlurEndDate = true;
    }

    /**
     * Toggles the visibility of c-calendar for end-date.
     */
    toggleEndDateVisibility() {
        this.isOpenEndDate = !this.isOpenEndDate;
        if (!this.isOpenEndDate) {
            this.endDateInput.blur();
        }
    }

    /**
     * Change the date format depending on date style.
     *
     * @param {date}
     * @returns {date} formated date depending on the date style.
     */
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

    /**
     * Dispatch changes from start-date input, end-date input, c-calendar for start-date and c-calendar for end-date.
     */
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

        startDate = this.startDateString ? new Date(startDate) : startDate;
        endDate = this.endDateString ? new Date(endDate) : endDate;

        /**
         * The event fired when the value changed.
         *
         * @event
         * @name change
         * @param {string} startDate Start date value.
         * @param {string} endDate End date value
         * @public
         */
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
