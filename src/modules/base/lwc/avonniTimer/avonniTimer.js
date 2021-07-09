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

export default class AvonniTimer extends LightningElement {
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

    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value =
            typeof value === 'number' ? Number(value / 1000) : DEFAULT_VALUE;
    }

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

    @api get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: BUTTON_VARIANTS.default,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    @api get type() {
        return this._type;
    }

    set type(value) {
        this._type = normalizeString(value, {
            fallbackValue: COUNT_TYPES.default,
            validValues: COUNT_TYPES.valid
        });
    }

    @api get iconPosition() {
        return this._iconPosition;
    }

    set iconPosition(value) {
        this._iconPosition = normalizeString(value, {
            fallbackValue: ICON_POSITIONS.default,
            validValues: ICON_POSITIONS.valid
        });
    }

    @api get format() {
        return this._format;
    }

    set format(value) {
        this._format = normalizeString(value, {
            fallbackValue: TIME_FORMATS.default,
            validValues: TIME_FORMATS.valid
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
        this._value = 0;
        this.dispatchTimerStop();
    }

    @api
    reset() {
        this._value = 0;
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
        this._value = 0;
        this.dispatchTimerStop();
    }

    formatTime(num, size) {
        return ('000' + num).slice(-size);
    }
}
