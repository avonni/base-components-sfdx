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
import { classSet, generateUniqueId } from 'c/utils';
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';

const VISUAL_PICKER_VARIANTS = {
    valid: ['coverable', 'non-coverable', 'vertical'],
    default: 'non-coverable'
};
const INPUT_TYPES = { valid: ['radio', 'checkbox'], default: 'radio' };
const VISUAL_PICKER_SIZES = {
    valid: ['xx-small', 'x-small', 'small', 'medium', 'large'],
    default: 'medium'
};
const VISUAL_PICKER_RATIOS = {
    valid: ['1-by-1', '4-by-3', '16-by-9'],
    default: '1-by-1'
};

const DEFAULT_REQUIRED = false;
const DEFAULT_DISABLED = false;
const DEFAULT_HIDE_BORDER = false;
const DEFAULT_HIDE_CHECK_MARK = false;

export default class AvonniVisualPicker extends LightningElement {
    @api label;
    @api items = [];
    @api messageWhenValueMissing;
    @api name = generateUniqueId();

    _value = [];
    _variant = VISUAL_PICKER_VARIANTS.default;
    _type = INPUT_TYPES.default;
    _size = VISUAL_PICKER_SIZES.default;
    _required = DEFAULT_REQUIRED;
    _disabled = DEFAULT_DISABLED;
    _hideBorder = DEFAULT_HIDE_BORDER;
    _hideCheckMark = DEFAULT_HIDE_CHECK_MARK;
    _ratio = VISUAL_PICKER_RATIOS.default;

    renderedCallback() {
        const inputs = this.template.querySelectorAll('input');

        if (inputs) {
            Array.from(inputs).forEach((item) => {
                if (this._value.indexOf(item.value) > -1) {
                    item.checked = true;
                }
            });
        }
    }

    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;

        const inputs = this.template.querySelectorAll('input');

        if (inputs && this._value) {
            Array.from(inputs).forEach((item) => {
                if (this._value.indexOf(item.value) > -1) {
                    item.checked = true;
                }
            });
        }
    }

    @api get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: VISUAL_PICKER_VARIANTS.default,
            validValues: VISUAL_PICKER_VARIANTS.valid
        });
    }

    @api get type() {
        return this._type;
    }

    set type(type) {
        this._type = normalizeString(type, {
            fallbackValue: INPUT_TYPES.default,
            validValues: INPUT_TYPES.valid
        });
    }

    @api get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: VISUAL_PICKER_SIZES.default,
            validValues: VISUAL_PICKER_SIZES.valid
        });
    }

    @api get ratio() {
        return this._ratio;
    }

    set ratio(ratio) {
        this._ratio = normalizeString(ratio, {
            fallbackValue: VISUAL_PICKER_RATIOS.default,
            validValues: VISUAL_PICKER_RATIOS.valid
        });
    }

    @api get required() {
        return this._required;
    }

    set required(value) {
        this._required = normalizeBoolean(value);
    }

    @api get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    @api get hideBorder() {
        return this._hideBorder;
    }

    set hideBorder(value) {
        this._hideBorder = normalizeBoolean(value);
    }

    @api get hideCheckMark() {
        return this._hideCheckMark;
    }

    set hideCheckMark(value) {
        this._hideCheckMark = normalizeBoolean(value);
    }

    get itemList() {
        let result = [];

        this.items.forEach((item, index) => {
            let cloneItem = Object.assign({}, item);
            let iconPosition = cloneItem.figure.iconPosition;

            cloneItem.key = `visual-picker-key-${index}`;

            if (this.disabled) {
                cloneItem.disabled = true;
            }

            if (this._variant === 'vertical' && iconPosition !== 'right') {
                iconPosition = 'left';
            } else if (
                this._variant !== 'vertical' &&
                iconPosition !== 'bottom'
            ) {
                iconPosition = 'top';
            }

            cloneItem.isTop =
                (iconPosition === 'left' || iconPosition === 'top') &&
                (cloneItem.figure.iconName || cloneItem.figure.iconSrc);

            cloneItem.isBottom =
                (iconPosition === 'bottom' || iconPosition === 'right') &&
                (cloneItem.figure.iconName || cloneItem.figure.iconSrc);

            if (cloneItem.isTop && this._variant === 'vertical') {
                cloneItem.bodyClass = 'slds-border_left slds-p-around_small';
            }

            if (cloneItem.isBottom && this._variant === 'vertical') {
                cloneItem.bodyClass = 'slds-border_right slds-p-around_small';
            }

            cloneItem.iconClass = classSet('');

            if (
                (this._size !== 'medium' || this._size !== 'large') &&
                this._variant !== 'vertical'
            ) {
                if (iconPosition === 'top') {
                    cloneItem.iconClass
                        .add(`slds-m-bottom_${this._size}`)
                        .toString();
                }
                if (iconPosition === 'bottom') {
                    cloneItem.iconClass
                        .add(`slds-m-top_${this._size}`)
                        .toString();
                }
                if (iconPosition === 'right') {
                    cloneItem.iconClass
                        .add(`slds-m-left_${this._size}`)
                        .toString();
                }
                if (iconPosition === 'left') {
                    cloneItem.iconClass
                        .add(`slds-m-right_${this._size}`)
                        .toString();
                }
            } else {
                cloneItem.iconClass
                    .add({
                        'slds-m-bottom_small': iconPosition === 'top',
                        'slds-m-top_small': iconPosition === 'bottom',
                        'slds-m-left_small': iconPosition === 'right',
                        'slds-m-right_small': iconPosition === 'left'
                    })
                    .toString();
            }

            if (
                (this._size !== 'medium' || this._size !== 'large') &&
                (cloneItem.figure.title || cloneItem.figure.description)
            ) {
                cloneItem.iconSize = this._size;
            } else {
                cloneItem.iconSize = cloneItem.figure.iconSize;
            }

            result.push(cloneItem);
        });

        return result;
    }

    get isCoverable() {
        return this._variant === 'coverable';
    }

    get isVertical() {
        return this._variant === 'vertical';
    }

    get visualPickerClass() {
        return classSet('slds-visual-picker')
            .add({
                'avonni-visual-picker_xx-small':
                    this._size === 'xx-small' && this._variant !== 'vertical',
                'avonni-visual-picker_x-small':
                    this._size === 'x-small' && this._variant !== 'vertical',
                'avonni-visual-picker_small':
                    this._size === 'small' && this._variant !== 'vertical',
                'slds-visual-picker_medium':
                    this._size === 'medium' && this._variant !== 'vertical',
                'slds-visual-picker_large':
                    this._size === 'large' && this._variant !== 'vertical',
                'slds-visual-picker_vertical': this._variant === 'vertical'
            })
            .add(`ratio-${this._ratio}`)
            .toString();
    }

    get visualPickerTypeClass() {
        return classSet('slds-visual-picker__figure')
            .add({
                'slds-visual-picker__text':
                    this._variant === 'non-coverable' ||
                    this._variant === 'vertical',
                'slds-visual-picker__icon': this._variant === 'coverable',
                'slds-align_absolute-left': this._variant === 'vertical',
                'slds-align_absolute-center': this._variant !== 'vertical',
                'avonni-hide-border': this._hideBorder,
                'avonni-hide-check-mark': this._hideCheckMark
            })
            .toString();
    }

    get iconContainerClass() {
        return classSet('slds-icon_container')
            .add({
                'slds-visual-picker__text-check': this._variant !== 'coverable'
            })
            .toString();
    }

    get elementControlClass() {
        return classSet('slds-form-element__control')
            .add({
                'slds-grid slds-wrap': this._variant !== 'vertical'
            })
            .toString();
    }

    get textHeadingClass() {
        return classSet()
            .add({
                'slds-text-heading_large': this._variant !== 'vertical',
                'slds-text-heading_medium slds-m-bottom_x-small':
                    this._variant === 'vertical'
            })
            .toString();
    }

    get selectedClass() {
        return this._variant === 'coverable' ? 'slds-is-selected' : '';
    }

    get notSelectedClass() {
        return classSet()
            .add({
                'slds-is-not-selected':
                    this._variant === 'coverable' && !this._hideCheckMark,
                'avonni-is-not-selected':
                    this._variant === 'coverable' && this._hideCheckMark,
                verticalContainer: this._variant === 'vertical'
            })
            .toString();
    }

    handleChange(event) {
        event.stopPropagation();

        if (this._variant === 'coverable' && this._hideCheckMark) {
            const labels = this.template.querySelectorAll('label');

            labels.forEach((label) => {
                let icon = label.querySelector('lightning-icon');
                if (label.previousSibling.checked) {
                    icon.variant = 'inverse';
                } else {
                    icon.variant = '';
                }
            });
        }

        const inputs = this.template.querySelectorAll('input');
        const value = Array.from(inputs)
            .filter((input) => input.checked)
            .map((input) => input.value);

        this._value = value;

        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value: value.toString()
                }
            })
        );
    }
}
