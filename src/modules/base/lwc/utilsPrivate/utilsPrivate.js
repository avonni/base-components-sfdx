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

export { assert } from './assert';
export { EventEmitter } from './eventEmitter';
export { toNorthAmericanPhoneNumber } from './phonify';
export * from './linkUtils';
export { deepCopy, arraysEqual, ArraySlice, equal } from './utility';
export { guid } from './guid';
export { classListMutation } from './classListMutation';
export {
    normalizeBoolean,
    normalizeString,
    normalizeArray,
    normalizeAriaAttribute,
    normalizeObject
} from './normalize';
export {
    generateColors,
    colorType,
    RGBToHex,
    RGBAToHexA,
    hexToRGB,
    hexAToRGBA,
    RGBToHSL,
    RGBAToHSLA,
    HSLToRGB,
    HSLAToRGBA,
    hexToHSL,
    hexAToHSLA,
    HSLToHex,
    HSLAToHexA,
    RGBAtoRGB,
    RGBtoRGBA,
    RGBtoHSV,
    HSVToHSL
} from './colorUtils';
export { getChartColors } from './chartColorPalette';
export {
    keyCodes,
    runActionOnBufferedTypedCharacters,
    normalizeKeyValue,
    isShiftMetaOrControlKey
} from './keyboard';
export { getListHeight } from './listHeight';
export { raf } from './scroll';
export { isChrome, isIE11, isSafari } from './browser';
export { ContentMutation } from './contentMutation';
export { observePosition } from './observers';
export { hasOnlyAllowedVideoIframes } from './videoUtils';
export {
    addToDate,
    containsAllowedDateTimes,
    dateTimeObjectFrom,
    nextAllowedDay,
    nextAllowedMonth,
    nextAllowedTime,
    numberOfUnitsBetweenDates,
    previousAllowedDay,
    previousAllowedMonth,
    previousAllowedTime,
    removeFromDate
} from './dateTimeUtils';
import { smartSetAttribute } from './smartSetAttribute';

export function synchronizeAttrs(element, values) {
    if (!element) {
        return;
    }
    const attributes = Object.keys(values);
    attributes.forEach((attribute) => {
        smartSetAttribute(element, attribute, values[attribute]);
    });
}

export function getRealDOMId(el) {
    if (el && typeof el === 'string') {
        return el;
    } else if (el) {
        return el.getAttribute('id');
    }
    return null;
}

const URL_CHECK_REGEX = /^(\/+|\.+|ftp|http(s?):\/\/)/i;

export function isAbsoluteUrl(url) {
    return URL_CHECK_REGEX.test(url);
}

export function getShadowActiveElement() {
    let activeElement = document.activeElement;
    while (activeElement.shadowRoot && activeElement.shadowRoot.activeElement) {
        activeElement = activeElement.shadowRoot.activeElement;
    }
    return activeElement;
}

export function getShadowActiveElements() {
    let activeElement = document.activeElement;
    const shadowActiveElements = [];
    while (
        activeElement &&
        activeElement.shadowRoot &&
        activeElement.shadowRoot.activeElement
    ) {
        shadowActiveElements.push(activeElement);
        activeElement = activeElement.shadowRoot.activeElement;
    }
    if (activeElement) {
        shadowActiveElements.push(activeElement);
    }
    return shadowActiveElements;
}

export function isRTL() {
    return document.dir === 'rtl';
}

export function isUndefinedOrNull(value) {
    return value === null || value === undefined;
}

export function isNotUndefinedOrNull(value) {
    return !isUndefinedOrNull(value);
}

const DEFAULT_ZINDEX_BASELINE = 9000;

export function getZIndexBaseline() {
    const value = (
        window.getComputedStyle(document.documentElement) ||
        document.documentElement.style
    ).getPropertyValue('--lwc-zIndexModal');

    const base = parseInt(value, 10);

    return isNaN(base) ? DEFAULT_ZINDEX_BASELINE : base;
}

export function timeout(interval) {
    return new Promise((resolve) => {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(resolve, interval);
    });
}

export function animationFrame() {
    return new Promise((resolve) => {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        window.requestAnimationFrame(resolve);
    });
}

export const BUTTON_GROUP_ORDER = {
    FIRST: 'first',
    MIDDLE: 'middle',
    LAST: 'last',
    ONLY: 'only'
};

/**
 * returns the SLDS class for the given group order
 * @param groupOrder
 * @returns {string}
 */
export function buttonGroupOrderClass(groupOrder) {
    return {
        [BUTTON_GROUP_ORDER.FIRST]: 'slds-button_first',
        [BUTTON_GROUP_ORDER.MIDDLE]: 'slds-button_middle',
        [BUTTON_GROUP_ORDER.LAST]: 'slds-button_last',
        [BUTTON_GROUP_ORDER.ONLY]: 'single-button'
    }[groupOrder];
}
