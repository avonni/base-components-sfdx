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
import { classSet } from 'c/utils';
import { normalizeString as normalize } from 'c/utilsPrivate';
import * as iconUtils from 'c/iconUtils';
import standardTemplate from './avonniPrimitiveIcon.html';
import { getIconSvgTemplates } from 'c/configProvider';

const ICON_SIZES = {valid:['xx-small', 'x-small', 'small', 'medium', 'large'] , default: 'medium'}

const ICON_VARIANTS = {valid: ['bare', 'error', 'inverse', 'warning', 'success'], default: ''}

export default class AvonniPrimitiveIcon extends LightningElement {
    @api iconName;
    @api src;
    @api svgClass;
    @api svgStyle;
    @api size = ICON_SIZES.default;
    @api variant;

    privateIconSvgTemplates = getIconSvgTemplates();

    get inlineSvgProvided() {
        return !!this.privateIconSvgTemplates;
    }

    renderedCallback() {
        if (this.iconName !== this.prevIconName && !this.inlineSvgProvided) {
            this.prevIconName = this.iconName;
            const svgElement = this.template.querySelector('[data-element-id="svg"]');
            iconUtils.polyfill(svgElement);
        }
    }

    get href() {
        return this.src || iconUtils.getIconPath(this.iconName, '');
    }

    get name() {
        return iconUtils.getName(this.iconName);
    }

    get normalizedSize() {
        return normalize(this.size, {
            fallbackValue: ICON_SIZES.default,
            validValues: ICON_SIZES.valid
        });
    }

    get normalizedVariant() {
        return normalize(this.variant, {
            fallbackValue: ICON_VARIANTS.default,
            validValues: ICON_VARIANTS.valid
        });
    }

    get computedClass() {
        const { normalizedSize, normalizedVariant } = this;
        const classes = classSet(this.svgClass);

        if (normalizedVariant !== 'bare') {
            classes.add('slds-icon');
        }

        switch (normalizedVariant) {
            case 'error':
                classes.add('slds-icon-text-error');
                break;
            case 'warning':
                classes.add('slds-icon-text-warning');
                break;
            case 'success':
                classes.add('slds-icon-text-success');
                break;
            case 'inverse':
            case 'bare':
                break;
            default:
                if (!this.src) {
                    classes.add('slds-icon-text-default');
                }
        }

        if (normalizedSize !== 'medium') {
            classes.add(`slds-icon_${normalizedSize}`);
        }

        return classes.toString();
    }

    resolveTemplate() {
        const name = this.iconName;
        if (iconUtils.isValidName(name)) {
            const [spriteName, iconName] = name.split(':');
            const template = this.privateIconSvgTemplates[
                `${spriteName}_${iconName}`
            ];

            if (template) {
                return template;
            }
        }
        return standardTemplate;
    }

    render() {
        if (this.inlineSvgProvided) {
            return this.resolveTemplate();
        }
        return standardTemplate;
    }
}
