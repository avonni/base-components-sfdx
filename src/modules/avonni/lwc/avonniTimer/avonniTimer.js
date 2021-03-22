import { LightningElement, api } from 'lwc';
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';

const validVariants = [
    'base',
    'neutral',
    'brand',
    'brand-outline',
    'destructive',
    'destructive-text',
    'inverse',
    'success'
];

const validTypes = ['count-up', 'count-down'];
const validIconPositions = ['left', 'right'];
const validFormats = ['hh:mm:ss', 'mm:ss', 'hh:mm', 'hh', 'mm', 'ss'];

export default class AvonniTimer extends LightningElement {
    @api iconName;

    _value = 0;
    _duration = 1;
    _variant = 'neutral';
    _type = 'count-up';
    _iconPosition = 'left';
    _format = 'hh:mm:ss';
    _autoStart = false;
    _repeat = false;

    step;
    play = false;
    interval = null;

    disconnectedCallback() {
        clearInterval(this.interval);
    }

    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = Number(value / 1000);
    }

    @api
    get duration() {
        return this._duration;
    }

    set duration(value) {
        if (value > 86400000) {
            this._duration = 86400;
        } else {
            this._duration = value / 1000;
        }
    }

    @api get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: 'neutral',
            validValues: validVariants
        });
    }

    @api get type() {
        return this._type;
    }

    set type(value) {
        this._type = normalizeString(value, {
            fallbackValue: 'count-up',
            validValues: validTypes
        });
    }

    @api get iconPosition() {
        return this._iconPosition;
    }

    set iconPosition(value) {
        this._iconPosition = normalizeString(value, {
            fallbackValue: 'left',
            validValues: validIconPositions
        });
    }

    @api get format() {
        return this._format;
    }

    set format(value) {
        this._format = normalizeString(value, {
            fallbackValue: 'hh:mm:ss',
            validValues: validFormats
        });
    }

    @api get autoStart() {
        return this._autoStart;
    }

    set autoStart(value) {
        this._autoStart = normalizeBoolean(value);

        if (this._autoStart) {
            this.start();
        }
    }

    @api get repeat() {
        return this._repeat;
    }

    set repeat(value) {
        this._repeat = normalizeBoolean(value);
    }

    get time() {
        if (this.format === 'hh:mm:ss') {
            return (
                this.formatTime(
                    this.hours,
                    String(this.hours).length > 2
                        ? String(this.hours).length
                        : 2
                ) +
                ':' +
                this.formatTime(
                    this.minutes,
                    String(this.minutes).length > 2
                        ? String(this.minutes).length
                        : 2
                ) +
                ':' +
                this.formatTime(this.seconds, 2)
            );
        }
        if (this.format === 'mm:ss') {
            let minutes = this.hours * 60 + this.minutes;
            return (
                this.formatTime(
                    minutes,
                    String(minutes).length > 2 ? String(minutes).length : 2
                ) +
                ':' +
                this.formatTime(this.seconds, 2)
            );
        }
        if (this.format === 'hh:mm') {
            return (
                this.formatTime(
                    this.hours,
                    String(this.hours).length > 2
                        ? String(this.hours).length
                        : 2
                ) +
                ':' +
                this.formatTime(
                    this.minutes,
                    String(this.minutes).length > 2
                        ? String(this.minutes).length
                        : 2
                )
            );
        }
        if (this.format === 'hh') {
            return this.formatTime(
                this.hours,
                String(this.hours).length > 2 ? String(this.hours).length : 2
            );
        }
        if (this.format === 'mm') {
            let minutes = this.hours * 60 + this.minutes;
            return this.formatTime(
                this.hours * 60 + this.minutes,
                String(minutes).length > 2 ? String(minutes).length : 2
            );
        }

        return this.value;
    }

    get timerValue() {
        if (this.type === 'count-up') {
            return this.value;
        }

        return this.duration - this.value;
    }

    get hours() {
        let time = parseFloat(this.timerValue).toFixed(3);
        return Math.floor(time / 60 / 60);
    }

    get minutes() {
        let time = parseFloat(this.timerValue).toFixed(3);
        return Math.floor(time / 60) % 60;
    }

    get seconds() {
        let time = parseFloat(this.timerValue).toFixed(3);
        return Math.floor(time - this.minutes * 60);
    }

    @api
    start() {
        if (this.interval === null) {
            this.createInterval();
        }
        this.play = true;
        this.dispatchTimerStart();
    }

    @api
    pause() {
        this.play = false;
        this.dispatchTimerPause();
    }

    @api
    stop() {
        this.play = false;
        this.value = 0;
        this.dispatchTimerStop();
    }

    @api
    reset() {
        this.value = 0;
        this.dispatchTimerReset();
    }

    dispatchTimerStart() {
        this.dispatchEvent(
            new CustomEvent('timerstart', {
                detail: {
                    time: this.time,
                    hours: this.hours,
                    minutes: this.minutes,
                    seconds: this.seconds,
                    duration: this.duration,
                    format: this.format,
                    type: this.type
                }
            })
        );
    }

    dispatchTimerPause() {
        this.dispatchEvent(
            new CustomEvent('timerpause', {
                detail: {
                    time: this.time,
                    hours: this.hours,
                    minutes: this.minutes,
                    seconds: this.seconds,
                    duration: this.duration,
                    format: this.format,
                    type: this.type
                }
            })
        );
    }

    dispatchTimerStop() {
        this.dispatchEvent(
            new CustomEvent('timerstop', {
                detail: {
                    time: this.time,
                    hours: this.hours,
                    minutes: this.minutes,
                    seconds: this.seconds,
                    duration: this.duration,
                    format: this.format,
                    type: this.type
                }
            })
        );
    }

    dispatchTimerReset() {
        this.dispatchEvent(
            new CustomEvent('timerreset', {
                detail: {
                    time: this.time,
                    hours: this.hours,
                    minutes: this.minutes,
                    seconds: this.seconds,
                    duration: this.duration,
                    format: this.format,
                    type: this.type
                }
            })
        );
    }

    createInterval() {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.interval = setInterval(() => {
            if (this.play) {
                this._value = this.value + 1;
            }

            if (this.type === 'count-up') {
                if (this.timerValue >= this.duration) {
                    if (this.repeat) {
                        this._value = 0;
                        this.dispatchTimerReset();
                    } else {
                        this.clearCurrentInterval();
                    }
                }
            } else {
                if (this.timerValue === 0) {
                    if (this.repeat) {
                        this._value = 0;
                        this.dispatchTimerReset();
                    } else {
                        this.clearCurrentInterval();
                    }
                }
            }
        }, 1000);
    }

    clearCurrentInterval() {
        clearInterval(this.interval);
        this.interval = null;
        this.value = 0;
        this.dispatchTimerStop();
    }

    formatTime(num, size) {
        return ('000' + num).slice(-size);
    }
}
