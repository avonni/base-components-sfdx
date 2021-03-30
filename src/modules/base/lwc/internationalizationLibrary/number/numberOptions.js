/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {
    updateFractionPart,
    updateIntegerPart,
    updateCurrencySymbol,
    getCurrency
} from './utils';

const numberFormat = '#, ##0.###';
const percentFormat = '#, ###0%';
const currencyFormat = '#, ##0.00';
const currency = 'USD';

function NumberOptions(options) {
    this.options = options || {};
}

NumberOptions.prototype.isCurrency = function () {
    return this.options.style === 'currency';
};

NumberOptions.prototype.isPercent = function () {
    return this.options.style === 'percent';
};

NumberOptions.prototype.isDefaultCurrency = function () {
    return !this.options.currency || currency === this.options.currency;
};

NumberOptions.prototype.getDefaultSkeleton = function () {
    return this.isCurrency()
        ? currencyFormat
        : this.isPercent()
        ? percentFormat
        : numberFormat;
};

NumberOptions.prototype.getSkeleton = function () {
    const options = this.options;
    const defaultSkeleton = this.getDefaultSkeleton();
    let skeleton = updateFractionPart(defaultSkeleton, options);
    skeleton = updateIntegerPart(skeleton, options);
    if (!this.isDefaultCurrency()) {
        skeleton = updateCurrencySymbol(
            skeleton,
            getCurrency(options),
            options
        );
    }
    return skeleton;
};

export { NumberOptions };
