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

import { numberFormat } from 'c/internationalizationLibrary';

const NUMBER_SYMBOLS = ['+', '-'];

function isEmptyString(s) {
    return (
        s === undefined ||
        s === null ||
        (typeof s === 'string' && s.trim() === '')
    );
}

function buildFormatNumberOptions(type, fractionDigits, step) {
    const options = {
        style: type
    };
    // Use the min/max fraction digits from the formatFractionDigits provided by the user if available.
    // Otherwise, use the number of digits calculated from step
    if (fractionDigits !== undefined) {
        options.minimumFractionDigits = fractionDigits;
        options.maximumFractionDigits = fractionDigits;
    } else {
        let digitsFromStep = calculateFractionDigitsFromStep(step);
        // if formatting percentages, when calculating digits from step, take into
        // consideration that the formatted number is effectively multiplied by 10^2, ie. 0.1 is 10%
        // so we need to subtract 2 digits;
        if (type === 'percent' && typeof digitsFromStep === 'number') {
            digitsFromStep -= 2;
            if (digitsFromStep < 0) {
                digitsFromStep = 0;
            }
        }

        options.minimumFractionDigits = digitsFromStep;
        options.maximumFractionDigits = digitsFromStep;
    }
    return options;
}

function calculateFractionDigitsFromStep(step) {
    let calculatedFractionDigits;

    if (step) {
        const stepAsString = String(step).toLowerCase();
        if (stepAsString !== 'any') {
            // lowering the case because we're checking for exponent format as well
            let fractionDigits = 0;
            if (
                stepAsString.indexOf('.') >= 0 &&
                stepAsString.indexOf('e') < 0
            ) {
                const fractionalPart = stepAsString.split('.')[1];
                // we're parsing to account for cases where the step is
                // '1.0', or '1.000', etc.
                if (parseInt(fractionalPart, 10) > 0) {
                    fractionDigits = fractionalPart.length;
                }
            } else if (stepAsString.indexOf('e-') > 0) {
                // exponent form eg. 1.5e-5
                const splitOnExponent = stepAsString.split('e-');
                const fractionalPart = splitOnExponent[0].split('.')[1];
                const exponentPart = splitOnExponent[1];
                const fractionalPartLength = fractionalPart
                    ? fractionalPart.length
                    : 0;
                fractionDigits =
                    parseInt(exponentPart, 10) + fractionalPartLength;
            }
            calculatedFractionDigits = fractionDigits;
        }
    }
    return calculatedFractionDigits;
}

export function formatNumber(number, type, fractionDigits, step) {
    const numberAsString = number.toString();
    if (isEmptyString(numberAsString)) {
        return '';
    }

    let formattedValue = numberAsString;
    const options = buildFormatNumberOptions(type, fractionDigits, step);

    try {
        formattedValue = numberFormat(options).format(numberAsString) || '';
    } catch (ignore) {
        // ignore any errors
    }
    if (type === 'number' && fractionDigits) {
        // Add the missing 0s after the decimal point
        formattedValue = parseFloat(formattedValue).toFixed(fractionDigits);
    }
    return formattedValue;
}

export function hasValidNumberSymbol(value) {
    const validSymbols = NUMBER_SYMBOLS.join('');
    const matchSymbols = new RegExp(`[${validSymbols}]`);
    return value.match(matchSymbols) ? true : false;
}

export function increaseNumberByStep({
    value,
    increment,
    step,
    fractionDigits
}) {
    const startingValue = value === '' || value == null ? '0' : value;
    const stepAsFloat = parseFloat(step);

    let result;
    if (isNaN(stepAsFloat)) {
        result = parseFloat(startingValue) + increment;
    } else {
        const increaseBy = increment * stepAsFloat;
        result = parseFloat(startingValue) + increaseBy;
    }
    return Number(result.toFixed(fractionDigits));
}
