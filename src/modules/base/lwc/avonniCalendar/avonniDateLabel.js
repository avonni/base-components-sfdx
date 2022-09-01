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

import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';
import { classSet } from 'c/utils';

const POSITIONS = {
    valid: ['left', 'right'],
    default: 'left'
};
const VARIANTS = {
    valid: [
        'alt-inverse',
        'base',
        'brand',
        'error',
        'info',
        'inverse',
        'offline',
        'success',
        'warning'
    ],
    default: 'base'
};

const ICON_VARIANTS = {
    valid: ['bare', 'error', 'inverse', 'warning', 'success'],
    default: 'bare'
};

export default class AvonniCalendarDateLabel {
    constructor(props) {
        this.iconName = props.iconName;
        this.iconPosition = normalizeString(props.iconPosition, {
            fallbackValue: POSITIONS.default,
            validValues: POSITIONS.valid
        });
        this.iconVariant = normalizeString(props.iconVariant, {
            fallbackValue: ICON_VARIANTS.default,
            validValues: ICON_VARIANTS.valid
        });
        this.label = props.label;
        this.outline = normalizeBoolean(props.outline);
        this.variant = normalizeString(props.variant, {
            fallbackValue: VARIANTS.default,
            validValues: VARIANTS.valid
        });
    }

    get computedClass() {
        return classSet('avonni-calendar__chip-label')
            .add({
                'avonni-calendar__chip-icon-only': this.iconName && !this.label,
                'avonni-calendar__chip-without-icon': !this.iconName
            })
            .toString();
    }

    get showLeftIcon() {
        return this.iconName && this.iconPosition === 'left';
    }

    get showRightIcon() {
        return this.iconName && this.iconPosition === 'right';
    }
}
