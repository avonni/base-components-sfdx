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
import eraser from './avonniEraser.html';
import inkPen from './avonniInkPen.html';

const NAMES = {
    default: 'eraser',
    valid: ['eraser', 'inkPen']
};

/**
 * Primitive component used to display SVG icons. Contains one HTML template per SVG icon.
 *
 * @class
 * @descriptor c-primitive-svg-icon
 */
export default class AvonniPrimitiveSvgIcon extends LightningElement {
    /**
     * CSS classes to apply to the SVG tag.
     *
     * @type {string}
     * @public
     */
    @api svgClass;

    _name = NAMES.default;

    render() {
        switch (this.name) {
            case 'eraser':
                return eraser;
            case 'inkPen':
                return inkPen;
            default:
                return eraser;
        }
    }

    /**
     * Name of the icon. Valid values include eraser and inkPen.
     *
     * @type {string}
     * @default eraser
     * @public
     */
    @api
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = normalizeString(value, {
            fallbackValue: NAMES.default,
            validValues: NAMES.valid,
            toLowerCase: false
        });
    }
}
