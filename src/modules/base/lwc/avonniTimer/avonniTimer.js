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

const BUTTON_VARIANTS = {
    valid: [
        'base',
        'neutral',
        'brand',
        'brand-outline',
        'destructive',
        'destructive-text',
        'inverse',
        'success'
    ],
    default: 'neutral'
};

const COUNT_TYPES = { valid: ['count-up', 'count-down'], default: 'count-up' };
const ICON_POSITIONS = { valid: ['left', 'right'], default: 'left' };
const TIME_FORMATS = {
    valid: [
        'hh:mm:ss',
        'mm:ss',
        'hh:mm',
        'mm:ss.ms',
        'ss.ms',
        'hh',
        'mm',
        'ss'
    ],
    default: 'hh:mm:ss'
};

const DEFAULT_START_TIME = 0;
const DEFAULT_DURATION = 10000;
const DEFAULT_AUTO_START = false;
const DEFAULT_REPEAT = false;
const MAX_TIMER_VALUE = 86400000;

/**
 * @class
 * @descriptor avonni-timer
 * @storyId example-timer--base
 * @public
 */
export default class AvonniTimer extends LightningElement {
    /**
     * The Lightning Design System name of the icon. Names are written in the format 'utility:down' where 'utility' is the category, and 'down' is the specific icon to be displayed.
     *
     * @type {string}
     * @public
     */
    @api iconName;

    _autoStart = DEFAULT_AUTO_START;
    _format = TIME_FORMATS.default;
    _duration = DEFAULT_DURATION;
    _iconPosition = ICON_POSITIONS.default;
    _repeat = DEFAULT_REPEAT;
    _type = COUNT_TYPES.default;
    _variant = BUTTON_VARIANTS.default;
    _startTime = DEFAULT_START_TIME;
    _value = DEFAULT_START_TIME;

    startDate = null;
    play = false;
    interval = null;
    pauseBuffer = 0;

    disconnectedCallback() {
        clearInterval(this.interval);
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * If present, the timer automatically starts.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get autoStart() {
        return this._autoStart;
    }

    set autoStart(value) {
        this._autoStart = normalizeBoolean(value);

        if (this._autoStart) {
            this.startDate = Date.now();
            // start after short delay to account for properties initialization
            requestAnimationFrame(() => {
                this.start();
            });
        }
    }

    /**
     * How long a timer runs in milliseconds. Duration caps at 24 hours.
     *
     * @type {number}
     * @public
     * @default 10000
     */
    @api
    get duration() {
        return this._duration;
    }

    set duration(value) {
        if (!isNaN(parseInt(value, 10)) && parseInt(value, 10) >= 0) {
            this._duration = Math.min(parseInt(value, 10), MAX_TIMER_VALUE);
        } else {
            this._duration = DEFAULT_DURATION;
        }
    }

    /**
     * Format of the timer. Valid values include "hh:mm:ss", "mm:ss", "hh:mm", "mm:ss.ms", "ss.ms", "hh", "mm", "ss".
     *
     * @type {string}
     * @public
     * @default "hh:mm:ss"
     */
    @api
    get format() {
        return this._format;
    }

    set format(value) {
        this._format = normalizeString(value, {
            fallbackValue: TIME_FORMATS.default,
            validValues: TIME_FORMATS.valid
        });
    }

    /**
     * Describes the position of the icon with respect to body. Valid options include left and right.
     *
     * @type {string}
     * @public
     * @default left
     */
    @api
    get iconPosition() {
        return this._iconPosition;
    }

    set iconPosition(value) {
        this._iconPosition = normalizeString(value, {
            fallbackValue: ICON_POSITIONS.default,
            validValues: ICON_POSITIONS.valid
        });
    }

    /**
     * If present, the timer automatically restarts when it finishes running.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get repeat() {
        return this._repeat;
    }

    set repeat(value) {
        this._repeat = normalizeBoolean(value);
    }

    /**
     * Type of the timer. Valid values include count-up and count-down.
     *
     * @type {string}
     * @public
     * @default count-up
     */
    @api
    get type() {
        return this._type;
    }

    set type(value) {
        this._type = normalizeString(value, {
            fallbackValue: COUNT_TYPES.default,
            validValues: COUNT_TYPES.valid
        });
    }

    /**
     * Starting value of the timer in milliseconds. Getting this attribute will provide the current timer value in milliseconds.
     *
     * @type {number}
     * @public
     * @default 0
     */
    @api
    get value() {
        return this._value;
    }

    set value(value) {
        if (isNaN(parseInt(value, 10))) {
            this._startTime = DEFAULT_START_TIME;
        } else {
            this._startTime =
                parseInt(value, 10) > 0
                    ? Math.min(parseInt(value, 10), MAX_TIMER_VALUE)
                    : Math.max(parseInt(value, 10), -MAX_TIMER_VALUE);
        }
        this._value = this._startTime;
    }

    /**
     * The variant changes the appearance of the timer. Accepted variants include base, neutral, brand, brand-outline, destructive, destructive-text, inverse, and success.
     *
     * @type {string}
     * @public
     * @default neutral
     */
    @api
    get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: BUTTON_VARIANTS.default,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Compute the hours based on the timer value.
     *
     * @type {number}
     */
    get hours() {
        const hours = Math.floor(this._value / 60 / 60 / 1000);
        return hours >= 0 ? Math.abs(hours) : Math.abs(hours) - 1;
    }

    /**
     * Boolean, is true if _value is negative.
     *
     * @type {number}
     */
    get isNegative() {
        return this._value < 0;
    }

    /**
     * Compute the milliseconds based on the timer value.
     *
     * @type {number}
     */
    get milliseconds() {
        const milliseconds = Math.abs(Math.floor(this._value % 1000));
        return milliseconds >= 0 ? milliseconds : Math.abs(milliseconds) - 1;
    }

    /**
     * Compute the minutes based on the timer value.
     *
     * @type {number}
     */
    get minutes() {
        const minutes = Math.floor(this._value / 60 / 1000) % 60;
        return minutes >= 0 ? Math.abs(minutes) : Math.abs(minutes) - 1;
    }

    /**
     * Compute the minutes based on the timer value.
     *
     * @type {number}
     */
    get seconds() {
        const seconds = Math.floor(this._value / 1000) % 60;
        return seconds >= 0 ? Math.abs(seconds) : Math.abs(seconds) - 1;
    }

    /**
     * Return the time format to display based on inputted format ( hh, mm, ss ).
     *
     * @type {string|number}
     */
    get time() {
        let timeFormats = this.format.split(new RegExp('[.:]')); // splits string at ":" and "." into array character
        timeFormats[0] = this.formatToString(timeFormats[0], true);
        for (let i = 1; i < timeFormats.length; i++) {
            timeFormats[i] = this.formatToString(timeFormats[i], false);
        }
        let formattedTime = timeFormats.join(':');
        if (this.format.includes('ms')) {
            formattedTime = formattedTime.replace(
                new RegExp('(:)(?!.*:)'),
                '.'
            ); // replaces last ":" character with "."
        }
        return !this.isNegative ? formattedTime : '-'.concat(formattedTime);
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Pause the timer.
     *
     * @public
     */
    @api
    pause() {
        this.play = false;
        this.dispatchTimerPause();
    }

    /**
     * Reset the timer. Will keep on going if is still playing.
     *
     * @public
     */
    @api
    reset() {
        this.startDate = null;
        this.pauseBuffer = 0;
        this.stop();
        this._value = this._startTime;
        if (this.autoStart) {
            this.start();
        }
        this.dispatchTimerReset();
    }

    /**
     * Start the timer.
     *
     * @public
     */
    @api
    start() {
        if (this.interval === null) {
            this.createInterval();
        }
        this.consumePauseBuffer();
        this.play = true;
        this.dispatchTimerStart();
    }

    /**
     * Stop the timer.
     *
     * @public
     */
    @api
    stop() {
        this.play = false;
        this.startDate = null;
        this.pauseBuffer = 0;
        this.clearCurrentInterval();
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Clear the current interval.
     */
    clearCurrentInterval() {
        clearInterval(this.interval);
        this.interval = null;
        this.consumePauseBuffer();
        this.dispatchTimerStop();
    }

    /**
     *  Consumes pause buffer.
     */
    consumePauseBuffer() {
        if (this.startDate !== null) {
            this.startDate += this.pauseBuffer;
        }
        this.pauseBuffer = 0;
    }

    /**
     * Create timer interval.
     */
    createInterval() {
        if (this.startDate === null) {
            this.startDate = Date.now();
        }
        this.interval = setInterval(
            () => {
                const isCountUp = this.type === 'count-up';

                const maxDuration = isCountUp
                    ? this._startTime + this.duration
                    : this._startTime - this.duration;

                if (this.play && isCountUp) {
                    this._value =
                        this._startTime + (Date.now() - this.startDate);
                }
                if (this.play && !isCountUp) {
                    this._value =
                        this._startTime - (Date.now() - this.startDate);
                }

                const isTimerOverflow =
                    Math.abs(this._value) >= MAX_TIMER_VALUE;
                const hasEndedCountUp = isCountUp && this._value >= maxDuration;
                const hasEndedCountDown =
                    !isCountUp && this._value <= maxDuration;

                let state;
                if (isTimerOverflow) {
                    state = 'TIMER_OVERFLOW';
                } else if (this.play && hasEndedCountUp) {
                    state = 'COUNT_UP_ENDED';
                } else if (this.play && hasEndedCountDown) {
                    state = 'COUNT_DOWN_ENDED';
                } else if (!this.play && isCountUp) {
                    state = 'COUNT_UP_PAUSE';
                } else if (!this.play && !isCountUp) {
                    state = 'COUNT_DOWN_PAUSE';
                }

                let hasEnded = this.handleTimerState(state, maxDuration);

                if (hasEnded) {
                    if (this.repeat) {
                        this.reset();
                        this.start();
                    } else this.stop();
                }
            },
            this.format.includes('ms') ? 50 : 200
        );
    }

    /**
     * Timer pause event dispatcher.
     */
    dispatchTimerPause() {
        /**
         * The event fired when the timer is paused.
         *
         * @event
         * @name timerpause
         * @param {string} time the time value.
         * @param {string} hours the hours value.
         * @param {string} minutes the minutes value.
         * @param {string} seconds the seconds value.
         * @param {string} duration the duration value.
         * @param {string} format the format value.
         * @param {string} type the type value.
         * @public
         */
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

    /**
     * Timer reset event dispatcher.
     */
    dispatchTimerReset() {
        /**
         * The event fired when the timer start.
         *
         * @event
         * @name timerreset
         * @param {string} time the time value.
         * @param {string} hours the hours value.
         * @param {string} minutes the minutes value.
         * @param {string} seconds the seconds value.
         * @param {string} duration the duration value.
         * @param {string} format the format value.
         * @param {string} type the type value.
         * @public
         */
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

    /**
     * Timer start event dispatcher.
     */
    dispatchTimerStart() {
        /**
         * The event fired when the timer start.
         *
         * @event
         * @name timerstart
         * @param {string} time the time value.
         * @param {string} hours the hours value.
         * @param {string} minutes the minutes value.
         * @param {string} seconds the seconds value.
         * @param {string} duration the duration value.
         * @param {string} format the format value.
         * @param {string} type the type value.
         * @public
         */
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

    /**
     * Timer stop event dispatcher.
     */
    dispatchTimerStop() {
        /**
         * The event fired when the timer stop.
         *
         * @event
         * @name timerstop
         * @param {string} time the time value.
         * @param {string} hours the hours value.
         * @param {string} minutes the minutes value.
         * @param {string} seconds the seconds value.
         * @param {string} duration the duration value.
         * @param {string} format the format value.
         * @param {string} type the type value.
         * @public
         */
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

    /**
     *  Transforms format string to _value equivalent.
     *  @param format the string to transform.
     *  @param isFirst is the first element in the timer.
     */
    formatToString(format, isFirst) {
        if (isFirst) {
            switch (format) {
                case 'hh':
                    return `${this.hours}`.padStart(2, '0');
                case 'mm':
                    return `${this.minutes + this.hours * 60}`.padStart(2, '0');
                case 'ss':
                    return `${
                        this.seconds + this.minutes * 60 + this.hours * 3600
                    }`;
                default:
                    return '??';
            }
        } else {
            switch (format) {
                case 'hh':
                    return `${this.hours}`.padStart(2, '0');
                case 'mm':
                    return `${this.minutes}`.padStart(2, '0');
                case 'ss':
                    return `${this.seconds}`.padStart(2, '0');
                case 'ms':
                    return `${this.milliseconds}`.padStart(3, '0');
                default:
                    return '??';
            }
        }
    }

    /**
     *  Handles the state of the timer after an increment/decrement
     *  @param state the state the timer is currently in
     *  @param state the maximum duration for which the timer should run
     *  @returns {boolean} if the timer has ended after state handling
     */
    handleTimerState(state, maxDuration) {
        let hasEnded = false;

        switch (state) {
            case 'TIMER_OVERFLOW':
                this._value =
                    this._value < 0 ? MAX_TIMER_VALUE : -MAX_TIMER_VALUE;
                hasEnded = true;
                break;
            case 'COUNT_UP_ENDED':
                this._value = maxDuration;
                hasEnded = true;
                break;
            case 'COUNT_DOWN_ENDED':
                if (maxDuration < 0) {
                    this._value = maxDuration - 1000;
                } else {
                    this._value = maxDuration;
                }
                hasEnded = true;
                break;
            case 'COUNT_UP_PAUSE':
                this.pauseBuffer =
                    Date.now() -
                    this.startDate -
                    (this._value - this._startTime);
                break;
            case 'COUNT_DOWN_PAUSE':
                this.pauseBuffer =
                    Date.now() -
                    this.startDate +
                    (this._value - this._startTime);
                break;
            default:
                break;
        }
        return hasEnded;
    }
}
