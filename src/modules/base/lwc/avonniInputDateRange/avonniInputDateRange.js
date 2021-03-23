import { LightningElement, api } from 'lwc';
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';
import { parseDateTime } from 'c/internationalizationLibrary';

const validTypes = ['date', 'datetime'];
const validDateStyle = ['short', 'medium', 'long'];

export default class AvonniInputDateRange extends LightningElement {
    @api fieldLevelHelp;
    @api label;
    @api labelStartDate;
    @api labelEndDate;

    _timezone;
    _startDate = '';
    _endDate = '';

    _dateStyle = 'medium';
    _timeStyle = 'short';
    _type = 'date';
    _disabled = false;
    _required = false;

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

    @api get dateStyle() {
        return this._dateStyle;
    }

    set dateStyle(value) {
        this._dateStyle = normalizeString(value, {
            fallbackValue: 'medium',
            validValues: validDateStyle
        });
    }

    @api get timeStyle() {
        return this._timeStyle;
    }

    set timeStyle(value) {
        this._timeStyle = normalizeString(value, {
            fallbackValue: 'medium',
            validValues: validDateStyle
        });
    }

    @api get type() {
        return this._type;
    }

    set type(type) {
        this._type = normalizeString(type, {
            fallbackValue: 'date',
            validValues: validTypes
        });
        this.initStartDate();
        this.initEndtDate();
    }

    @api get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    @api get required() {
        return this._required;
    }

    set required(value) {
        this._required = normalizeBoolean(value);
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
        this.startDate = new Date(event.detail.value);
        event.stopPropagation();
        this._cancelBlurStartDate = false;
        this.handleBlurStartDate();
    }

    handleFocusStartDate() {
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
        this.endDate = new Date(event.detail.value);
        event.stopPropagation();
        this._cancelBlurEndDate = false;
        this.handleBlurEndDate();
    }

    handleFocusEndDate() {
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

        startDate = this.startDateString ? new Date(startDate).toISOString() : startDate;
        endDate = this.endDateString ? new Date(endDate).toISOString() : endDate;

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
