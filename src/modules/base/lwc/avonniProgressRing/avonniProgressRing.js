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
import { classSet } from 'c/utils';

const PROGRESS_RING_VARIANTS = {
    valid: ['base', 'active-step', 'warning', 'expired', 'base-autocomplete'],
    default: 'base'
};
const PROGRESS_RING_DIRECTIONS = { valid: ['fill', 'drain'], default: 'fill' };
const PROGRESS_RING_SIZES = { valid: ['medium', 'large'], default: 'medium' };

const DEFAULT_VALUE = 0;

/**
 * @class
 * @descriptor avonni-progress-ring
 * @storyId example-progress-ring--base
 * @public
 */
export default class AvonniProgressRing extends LightningElement {
    _direction = PROGRESS_RING_DIRECTIONS.default;
    _size = PROGRESS_RING_SIZES.default;
    _value = DEFAULT_VALUE;
    _variant = PROGRESS_RING_VARIANTS.default;
    _hideIcon = false;

    /**
     * Controls which way the color flows from the top of the ring, either clockwise or counterclockwise. Valid values include fill and drain.
     * The fill value corresponds to a color flow in the clockwise direction. The drain value indicates a color flow in the counterclockwise direction.
     *
     * @type {string}
     * @public
     * @default fill
     */
    @api
    get direction() {
        return this._direction;
    }

    set direction(direction) {
        this._direction = normalizeString(direction, {
            fallbackValue: PROGRESS_RING_DIRECTIONS.default,
            validValues: PROGRESS_RING_DIRECTIONS.valid
        });
    }

    /**
     * The size of the progress ring. Valid values include medium and large.
     *
     * @type {string}
     * @public
     * @default medium
     */
    @api
    get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: PROGRESS_RING_SIZES.default,
            validValues: PROGRESS_RING_SIZES.valid
        });
    }

    /**
     * The percentage value of the progress ring. The value must be a number from 0 to 100. A value of 50 corresponds to a color fill of half the ring in a clockwise or counterclockwise direction, depending on the direction attribute.
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
        if (typeof value === 'number') {
            if (value <= 0) {
                this._value = 0;
            } else if (value > 100) {
                this._value = 100;
            } else {
                this._value = value;
            }
        } else {
            this._value = DEFAULT_VALUE;
        }
    }

    /**
     * Changes the appearance of the progress ring. Accepted variants include base, active-step, warning, expired, base-autocomplete.
     *
     * @type {string}
     * @public
     * @default base
     */
    @api
    get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: PROGRESS_RING_VARIANTS.default,
            validValues: PROGRESS_RING_VARIANTS.valid
        });
    }

    /**
     * If present and the variant is equal to warning, base-autocomplete or expired, hide the icon in the progress ring content
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get hideIcon() {
        return this._hideIcon;
    }

    set hideIcon(value) {
        this._hideIcon = normalizeBoolean(value);
    }

    /**
     * Computed outer class styling based on selected attributes.
     *
     * @type {string}
     */
    get computedOuterClass() {
        return classSet('slds-progress-ring')
            .add({
                'slds-progress-ring_large': this._size === 'large',
                'slds-progress-ring_warning': this._variant === 'warning',
                'slds-progress-ring_expired': this._variant === 'expired',
                'slds-progress-ring_active-step':
                    this._variant === 'active-step',
                'slds-progress-ring_complete':
                    this._variant === 'base-autocomplete' && this._value === 100
            })
            .toString();
    }

    /**
     * Computed Icon theme variant class.
     *
     * @type {string}
     */
    get computedIconTheme() {
        return classSet('slds-icon_container').add({
            'slds-icon-utility-warning': this._variant === 'warning',
            'slds-icon-utility-error': this._variant === 'expired',
            'slds-icon-utility-check': this._variant === 'base-autocomplete'
        });
    }

    /**
     * Get progress ring draw coordinates and styling.
     *
     * @type {string}
     */
    get d() {
        const fillPercent = this._value / 100 || 0;
        const filldrain = this.direction === 'drain' ? 1 : 0;
        const inverter = this.direction === 'drain' ? 1 : -1;
        const islong = fillPercent > 0.5 ? 1 : 0;
        const subCalc = 2 * Math.PI * fillPercent;
        const arcx = Math.cos(subCalc);
        const arcy = Math.sin(subCalc) * inverter;

        return `M 1 0 A 1 1 0 ${islong} ${filldrain} ${arcx} ${arcy} L 0 0`;
    }

    /**
     * Computed alternative text based on variant.
     *
     * @type {string}
     */
    get computedAltText() {
        if (this.variant === 'warning') {
            return 'Warning';
        }
        if (this.variant === 'expired') {
            return 'Expired';
        }
        if (this._variant === 'base-autocomplete' && this._value === 100) {
            return 'Complete';
        }
        return undefined;
    }

    /**
     * Modify icon name value based on variant.
     *
     * @type {string}
     */
    get iconName() {
        if (this._variant === 'warning') {
            return 'utility:warning';
        } else if (this._variant === 'expired') {
            return 'utility:error';
        } else if (this._variant === 'base-autocomplete') {
            return 'utility:check';
        }
        return null;
    }

    /**
     * Verify icon presence.
     *
     * @type {boolean}
     */
    get iconPresence() {
        if (
            (this._variant === 'base-autocomplete' &&
                this._value === 100 &&
                this._hideIcon === false) ||
            (this._variant === 'warning' && this._hideIcon === false) ||
            (this._variant === 'expired' && this._hideIcon === false)
        ) {
            return true;
        }
        return false;
    }

    /**
     * Verify showing Icon.
     *
     * @type {boolean}
     */
    get showIcon() {
        return !this.hideIcon && this.iconPresence;
    }

    /**
     * Verify showing slot.
     *
     * @type {boolean}
     */
    get showSlot() {
        return !this.iconPresence || (this.iconPresence && this.hideIcon);
    }
}
