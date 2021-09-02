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
    valid: ['hh:mm:ss', 'mm:ss', 'hh:mm', 'hh', 'mm', 'ss'],
    default: 'hh:mm:ss'
};

const DEFAULT_VALUE = 0;
const DEFAULT_DURATION = 1;
const DEFAULT_AUTO_START = false;
const DEFAULT_REPEAT = false;

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

    _value = DEFAULT_VALUE;
    _duration = DEFAULT_DURATION;
    _variant = BUTTON_VARIANTS.default;
    _type = COUNT_TYPES.default;
    _iconPosition = ICON_POSITIONS.default;
    _format = TIME_FORMATS.default;
    _autoStart = DEFAULT_AUTO_START;
    _repeat = DEFAULT_REPEAT;

    step;
    play = false;
    interval = null;

    disconnectedCallback() {
        clearInterval(this.interval);
    }

    /**
     * Default value of the timer.
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
        this._value =
            typeof value === 'number' ? Number(value / 1000) : DEFAULT_VALUE;
    }

    /**
     * How long a timer runs in milliseconds. There is no maximum value.
     *
     * @type {number}
     * @public
     * @default 1000
     */
    @api
    get duration() {
        return this._duration;
    }

    set duration(value) {
        if (typeof value === 'number') {
            if (value > 86400000) {
                this._duration = 86400;
            } else {
                this._duration = value / 1000;
            }
        } else {
            this._duration = DEFAULT_DURATION;
        }
    }

    /**
     * The variant changes the appearance of the timer. Accepted variants include base, neutral, brand, brand-outline, destructive, destructive-text, inverse, and success.
     *
     * @type {string}
     * @public
     * @default neutral
     */
    @api get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: BUTTON_VARIANTS.default,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    /**
     * Type of the timer. Valid values include count-up and count-down.
     *
     * @type {string}
     * @public
     * @default count-up
     */
    @api get type() {
        return this._type;
    }

    set type(value) {
        this._type = normalizeString(value, {
            fallbackValue: COUNT_TYPES.default,
            validValues: COUNT_TYPES.valid
        });
    }

    /**
     * Describes the position of the icon with respect to body. Valid options include left and right.
     *
     * @type {string}
     * @public
     * @default left
     */
    @api get iconPosition() {
        return this._iconPosition;
    }

    set iconPosition(value) {
        this._iconPosition = normalizeString(value, {
            fallbackValue: ICON_POSITIONS.default,
            validValues: ICON_POSITIONS.valid
        });
    }

    /**
     * Format of the timer. Valid values include "hh:mm:ss", "mm:ss", "hh:mm", “hh”, “mm”, “ss”.
     *
     * @type {string}
     * @public
     * @default "hh:mm:ss"
     */
    @api get format() {
        return this._format;
    }

    set format(value) {
        this._format = normalizeString(value, {
            fallbackValue: TIME_FORMATS.default,
            validValues: TIME_FORMATS.valid
        });
    }

    /**
     * Whether the timer control automatically starts to play when the user navigates to the component.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api get autoStart() {
        return this._autoStart;
    }

    set autoStart(value) {
        this._autoStart = normalizeBoolean(value);

        if (this._autoStart) {
            this.start();
        }
    }

    /**
     * Whether a timer automatically restarts when it finishes running.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api get repeat() {
        return this._repeat;
    }

    set repeat(value) {
        this._repeat = normalizeBoolean(value);
    }

    /**
     * Return the time format to display based on inputted format ( hh, mm, ss ).
     *
     * @type {string|number}
     */
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

    /**
     * Retrieve the timer value.
     *
     * @type {number}
     */
    get timerValue() {
        if (this.type === 'count-up') {
            return this.value;
        }

        return this.duration - this.value;
    }

    /**
     * Compute the hours based on the timer value.
     *
     * @type {number}
     */
    get hours() {
        let time = parseFloat(this.timerValue).toFixed(3);
        return Math.floor(time / 60 / 60);
    }

    /**
     * Compute the minutes based on the timer value.
     *
     * @type {number}
     */
    get minutes() {
        let time = parseFloat(this.timerValue).toFixed(3);
        return Math.floor(time / 60) % 60;
    }

    /**
     * Compute the minutes based on the timer value.
     *
     * @type {number}
     */
    get seconds() {
        let time = parseFloat(this.timerValue).toFixed(3);
        return Math.floor(time - this.minutes * 60);
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
        this.play = true;
        this.dispatchTimerStart();
    }

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
     * Stop the timer.
     *
     * @public
     */
    @api
    stop() {
        this.play = false;
        this._value = 0;
        this.dispatchTimerStop();
    }

    /**
     * Reset the timer.
     *
     * @public
     */
    @api
    reset() {
        this._value = 0;
        this.dispatchTimerReset();
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
     * Create timer interval.
     */
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

    /**
     * Clear the current interval.
     */
    clearCurrentInterval() {
        clearInterval(this.interval);
        this.interval = null;
        this._value = 0;
        this.dispatchTimerStop();
    }

    /**
     * Compute format time.
     *
     * @param {number} num
     * @param {number} size
     * @returns {string} formatTime
     */
    formatTime(num, size) {
        return ('000' + num).slice(-size);
    }
}
