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

import { getPathPrefix, getToken } from 'lightning/configProvider';
import isIframeInEdge from './isIframeInEdge';

const validNameRe = /^([a-zA-Z]+):([a-zA-Z]\w*)$/;
const underscoreRe = /_/g;

let pathPrefix;

const tokenNameMap = Object.assign(Object.create(null), {
    action: 'lightning.actionSprite',
    custom: 'lightning.customSprite',
    doctype: 'lightning.doctypeSprite',
    standard: 'lightning.standardSprite',
    utility: 'lightning.utilitySprite'
});

const tokenNameMapRtl = Object.assign(Object.create(null), {
    action: 'lightning.actionSpriteRtl',
    custom: 'lightning.customSpriteRtl',
    doctype: 'lightning.doctypeSpriteRtl',
    standard: 'lightning.standardSpriteRtl',
    utility: 'lightning.utilitySpriteRtl'
});

const defaultTokenValueMap = Object.assign(Object.create(null), {
    'lightning.actionSprite': '/assets/icons/action-sprite/svg/symbols.svg',
    'lightning.actionSpriteRtl': '/assets/icons/action-sprite/svg/symbols.svg',
    'lightning.customSprite': '/assets/icons/custom-sprite/svg/symbols.svg',
    'lightning.customSpriteRtl': '/assets/icons/custom-sprite/svg/symbols.svg',
    'lightning.doctypeSprite': '/assets/icons/doctype-sprite/svg/symbols.svg',
    'lightning.doctypeSpriteRtl':
        '/assets/icons/doctype-sprite/svg/symbols.svg',
    'lightning.standardSprite': '/assets/icons/standard-sprite/svg/symbols.svg',
    'lightning.standardSpriteRtl':
        '/assets/icons/standard-sprite/svg/symbols.svg',
    'lightning.utilitySprite': '/assets/icons/utility-sprite/svg/symbols.svg',
    'lightning.utilitySpriteRtl': '/assets/icons/utility-sprite/svg/symbols.svg'
});

const getDefaultBaseIconPath = (category, nameMap) =>
    defaultTokenValueMap[nameMap[category]];

const getBaseIconPath = (category, direction) => {
    const nameMap = direction === 'rtl' ? tokenNameMapRtl : tokenNameMap;
    return (
        getToken(nameMap[category]) || getDefaultBaseIconPath(category, nameMap)
    );
};

const getMatchAtIndex = (index) => (iconName) => {
    const result = validNameRe.exec(iconName);
    return result ? result[index] : '';
};

const getCategory = getMatchAtIndex(1);
const getName = getMatchAtIndex(2);
export { getCategory, getName };

export const isValidName = (iconName) => validNameRe.test(iconName);

export const getIconPath = (iconName, direction = 'ltr') => {
    pathPrefix = pathPrefix !== undefined ? pathPrefix : getPathPrefix();

    if (isValidName(iconName)) {
        const baseIconPath = getBaseIconPath(getCategory(iconName), direction);
        if (baseIconPath) {
            if (isIframeInEdge) {
                const origin = `${window.location.protocol}//${window.location.host}`;
                return `${origin}${pathPrefix}${baseIconPath}#${getName(
                    iconName
                )}`;
            }
            return `${pathPrefix}${baseIconPath}#${getName(iconName)}`;
        }
    }
    return '';
};

export const computeSldsClass = (iconName) => {
    if (isValidName(iconName)) {
        const category = getCategory(iconName);
        const name = getName(iconName).replace(underscoreRe, '-');
        return `slds-icon-${category}-${name}`;
    }
    return '';
};

export { polyfill } from './polyfill';
