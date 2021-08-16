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

/**
 * @class
 * @descriptor avonni-visual-picker
 * @storyId example-visualpicker--base
 * @public
 */
export default class AvonniVisualPicker extends LightningElement {
    /**
     * Text label to title the visual picker.
     *
     * @type {string}
     * @public
     */
    @api label;
    /**
     * Array of items with attributes populating the visual picker.
     *
     * @type {object[]}
     * @public
     */
    @api items = [];
    /**
     * Optional message to be displayed when no checkbox is selected and the required attribute is set.
     *
     * @type {string}
     * @public
     */
    @api messageWhenValueMissing;
    /**
     * The name of the visual picker.
     *
     * @type {string}
     * @public
     * @required
     */
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

    /**
     * Value of the selected item. For the checkbox type, the value is an array (Ex: [value1, value2]
     *
     * @type {string}
     * @public
     */
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

    /**
     * Changes the appearance of the visual picker. Valid values include coverable, non-coverable and vertical.
     *
     * @type {string}
     * @public
     * @default non-coverable
     */
    @api get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: VISUAL_PICKER_VARIANTS.default,
            validValues: VISUAL_PICKER_VARIANTS.valid
        });
    }

    /**
     * Valid values include radio and checkbox.
     *
     * @type {string}
     * @public
     * @default radio
     */
    @api get type() {
        return this._type;
    }

    set type(type) {
        this._type = normalizeString(type, {
            fallbackValue: INPUT_TYPES.default,
            validValues: INPUT_TYPES.valid
        });
    }

    /**
     * The size of the items. Valid values include xx-small (4rem x 4 rem), x-small (6rem x 6 rem), small (8rem x 8rem), medium and large.
     *
     * @type {string}
     * @public
     * @default medium
     */
    @api get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: VISUAL_PICKER_SIZES.default,
            validValues: VISUAL_PICKER_SIZES.valid
        });
    }

    /**
     * The ratio of the items. Valid values include 1-by-1, 4-by-3 and 16-by-9.
     *
     * @type {string}
     * @public
     * @default 1-by-1
     */
    @api get ratio() {
        return this._ratio;
    }

    set ratio(ratio) {
        this._ratio = normalizeString(ratio, {
            fallbackValue: VISUAL_PICKER_RATIOS.default,
            validValues: VISUAL_PICKER_RATIOS.valid
        });
    }

    /**
     * If present, at least one item must be selected.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api get required() {
        return this._required;
    }

    set required(value) {
        this._required = normalizeBoolean(value);
    }

    /**
     * If present, the visual picker is disabled.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    /**
     * If present, hide the border and box-shadow on item picker. Still displayed border on hover.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api get hideBorder() {
        return this._hideBorder;
    }

    set hideBorder(value) {
        this._hideBorder = normalizeBoolean(value);
    }

    /**
     * If present, hide the check mark.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api get hideCheckMark() {
        return this._hideCheckMark;
    }

    set hideCheckMark(value) {
        this._hideCheckMark = normalizeBoolean(value);
    }

    /**
     * Compute layout styling for items in visual picker.
     *
     * @return {object[]} result
     */
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

    /**
     * Verify if variant is coverable.
     *
     * @type {string}
     */
    get isCoverable() {
        return this._variant === 'coverable';
    }

    /**
     * Verify if layout is vertical.
     *
     * @type {string}
     */
    get isVertical() {
        return this._variant === 'vertical';
    }

    /**
     * Compute visual picker class styling based on selected attributes. ( orientation, size, ratio)
     *
     * @type {string}
     */
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

    /**
     * Compute visual picker type class styling based on selected attributes.
     *
     * @type {string}
     */
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

    /**
     * Compute icon container class styling.
     *
     * @type {string}
     */
    get iconContainerClass() {
        return classSet('slds-icon_container')
            .add({
                'slds-visual-picker__text-check': this._variant !== 'coverable'
            })
            .toString();
    }

    /**
     * Compute element control class styling.
     *
     * @type {string}
     */
    get elementControlClass() {
        return classSet('slds-form-element__control')
            .add({
                'slds-grid slds-wrap': this._variant !== 'vertical'
            })
            .toString();
    }

    /**
     * Compute text heading class styling.
     *
     * @type {string}
     */
    get textHeadingClass() {
        return classSet()
            .add({
                'slds-text-heading_large': this._variant !== 'vertical',
                'slds-text-heading_medium slds-m-bottom_x-small':
                    this._variant === 'vertical'
            })
            .toString();
    }

    /**
     * Compute selected class styling.
     *
     * @type {string}
     */
    get selectedClass() {
        return this._variant === 'coverable' ? 'slds-is-selected' : '';
    }

    /**
     * Compute NOT selected class styling.
     *
     * @type {string}
     */
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

    /**
     * Change event handler.
     *
     * @param {Event} event
     */
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

        /**
         * The event fired when the value changed.
         *
         * @event
         * @name change
         * @param {string} value The visual picker value.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value: value.toString()
                }
            })
        );
    }
}
