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
import { normalizeString } from 'c/utilsPrivate';
import './avonniConfettiLib';

const CONFETTI_VARIANTS = {
    valid: [
        'base',
        'random-direction',
        'realistic',
        'fireworks',
        'snow',
        'pride'
    ],
    default: 'base'
};

const DEFAULT_COLORS = [
    '#529EE0',
    '#F0E442',
    '#FFB03B',
    '#E16032',
    '#4FD2D2',
    '#006699',
    '#E287B2'
];

const DEFAULT_ORIGIN_X = 0.5;

const DEFAULT_ORIGIN_Y = 0.5;

const DEFAULT_Z_INDEX = 100;

/**
 * @class
 * @public
 * @descriptor avonni-confetti
 * @storyId example-confetti--base
 */
export default class AvonniConfetti extends LightningElement {
    /**
     * An array of color strings, in the HEX format.
     *
     * @public
     * @type {string[]}
     * @default ['#529EE0','#F0E442','#FFB03B','#E16032','#4FD2D2','#006699','#E287B2']
     */
    @api colors = DEFAULT_COLORS;
    /**
     * The x position on the page, with 0 being the left edge and 1 being the right edge.
     *
     * @public
     * @type {number}
     * @default 0.5
     */
    @api originX = DEFAULT_ORIGIN_X;
    /**
     * The y position on the page, with 0 being the top edge and 1 being the bottom edge.
     *
     * @public
     * @type {number}
     * @default 0.5
     */
    @api originY = DEFAULT_ORIGIN_Y;
    /**
     * The confetti should be on top, after all. But if you have a crazy high page, you can set it even higher.
     *
     * @public
     * @type {number}
     * @default 100
     */
    @api zIndex = DEFAULT_Z_INDEX;

    _variant = CONFETTI_VARIANTS.default;
    _name;

    /**
     * The variant changes the appearance of the confetti. Accepted variants include include base, random-direction, realistic, fireworks, snow and pride.
     *
     * @public
     * @type {string}
     * @default base
     */
    @api
    get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: CONFETTI_VARIANTS.default,
            validValues: CONFETTI_VARIANTS.valid
        });
    }

    /**
     * Name of the confetti.
     *
     * @public
     * @type {string}
     */
    @api
    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
        this.setAttribute('name', value);
    }

    /**
     * Confetti Fire method.
     *
     * @public
     */
    @api
    fire() {
        switch (this.variant) {
            case 'base':
                this.base();
                break;
            case 'random-direction':
                this.randomDirection();
                break;
            case 'realistic':
                this.realistic();
                break;
            case 'fireworks':
                this.fireworks();
                break;
            case 'snow':
                this.snow();
                break;
            case 'pride':
                this.pride();
                break;
            default:
                this.base();
        }
    }

    /**
     * Base variant.
     */
    base() {
        // eslint-disable-next-line no-undef
        confetti({
            particleCount: 100,
            spread: 70,
            origin: {
                x: this.originX,
                y: this.originY
            },
            colors: this.colors,
            zIndex: this.zIndex
        });
    }

    /**
     * Random Direction variant.
     */
    randomDirection() {
        // eslint-disable-next-line no-undef
        confetti({
            angle: this.randomInRange(55, 125),
            spread: this.randomInRange(50, 70),
            particleCount: this.randomInRange(50, 100),
            origin: {
                x: this.originX,
                y: this.originY
            },
            colors: this.colors,
            zIndex: this.zIndex
        });
    }

    /**
     * Realistic variant.
     */
    realistic() {
        let count = 200;
        let defaults = {
            origin: {
                x: this.originX,
                y: this.originY
            },
            colors: this.colors,
            zIndex: this.zIndex
        };

        function start(particleRatio, opts) {
            // eslint-disable-next-line no-undef
            confetti(
                Object.assign({}, defaults, opts, {
                    particleCount: Math.floor(count * particleRatio)
                })
            );
        }

        start(0.25, {
            spread: 26,
            startVelocity: 55
        });

        start(0.2, {
            spread: 60
        });

        start(0.35, {
            spread: 100,
            decay: 0.91
        });

        start(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92
        });

        start(0.1, {
            spread: 120,
            startVelocity: 45
        });
    }

    /**
     * Fireworks variant.
     */
    fireworks() {
        let animationEnd = Date.now() + 6000;

        // eslint-disable-next-line consistent-return
        this.interval = setInterval(() => {
            let timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(this.interval);
            }

            let particleCount = 300;

            // eslint-disable-next-line no-undef
            confetti({
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                particleCount,
                origin: {
                    x: Math.random(),
                    y: Math.random() - 0.2
                },
                colors: this.colors,
                zIndex: this.zIndex
            });
        }, 250);
    }

    /**
     * Snow variant.
     */
    snow() {
        let animationEnd = Date.now() + 6000;
        let skew = 1;

        // eslint-disable-next-line consistent-return
        this.interval = setInterval(() => {
            let timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(this.interval);
            }

            let ticks = Math.max(200, 500 * (timeLeft / 6000));
            skew = Math.max(0.8, skew - 0.001);

            this.colors.forEach((color) => {
                // eslint-disable-next-line no-undef
                confetti({
                    particleCount: 1,
                    startVelocity: 0,
                    ticks: ticks,
                    gravity: 0.5,
                    origin: {
                        x: Math.random(),
                        y: Math.random() * skew - 0.2
                    },
                    colors: [color],
                    zIndex: this.zIndex,
                    shapes: ['circle']
                });
            });
        }, 10);
    }

    /**
     * Pride variant.
     */
    pride() {
        let end = Date.now() + 6000;

        // eslint-disable-next-line consistent-return
        this.interval = setInterval(() => {
            if (Date.now() > end) {
                return clearInterval(this.interval);
            }

            // eslint-disable-next-line no-undef
            confetti({
                angle: 60,
                spread: 55,
                origin: {
                    x: 0
                },
                colors: this.colors,
                zIndex: this.zIndex
            });
            // eslint-disable-next-line no-undef
            confetti({
                angle: 120,
                spread: 55,
                origin: {
                    x: 1
                },
                colors: this.colors,
                zIndex: this.zIndex
            });
        }, 150);
    }

    /**
     * Random number generator for min max range.
     *
     * @param {number} min
     * @param {number} max
     * @returns number
     */
    randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }
}
