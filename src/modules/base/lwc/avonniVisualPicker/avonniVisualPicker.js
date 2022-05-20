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
import { classSet, generateUUID } from 'c/utils';
import {
    normalizeBoolean,
    normalizeString,
    normalizeArray
} from 'c/utilsPrivate';
import { InteractingState, FieldConstraintApi } from 'c/inputUtils';

const VISUAL_PICKER_VARIANTS = {
    valid: ['coverable', 'non-coverable'],
    default: 'non-coverable'
};
const INPUT_TYPES = { valid: ['radio', 'checkbox'], default: 'radio' };
const VISUAL_PICKER_SIZES = {
    valid: [
        'xx-small',
        'x-small',
        'small',
        'medium',
        'large',
        'x-large',
        'xx-large',
        'responsive'
    ],
    default: 'medium'
};
const VISUAL_PICKER_RATIOS = {
    valid: ['1-by-1', '4-by-3', '16-by-9', '3-by-4', '9-by-16'],
    default: '1-by-1'
};

const DEFAULT_REQUIRED = false;
const DEFAULT_DISABLED = false;
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
     * Error message to be displayed when no item is selected and the required attribute is set to true.
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
    @api name = generateUUID();

    _disabled = DEFAULT_DISABLED;
    _hideCheckMark = DEFAULT_HIDE_CHECK_MARK;
    _items = [];
    _ratio = VISUAL_PICKER_RATIOS.default;
    _required = DEFAULT_REQUIRED;
    _size = VISUAL_PICKER_SIZES.default;
    _type = INPUT_TYPES.default;
    _value = [];
    _variant = VISUAL_PICKER_VARIANTS.default;

    helpMessage;
    displayImg = false;
    displayImgC = false;
    displayImgT = false;

    renderedCallback() {
        if (this.inputs) {
            this.inputs.forEach((item) => {
                if (this._value.indexOf(item.value) > -1) {
                    item.checked = true;
                } else {
                    item.removeAttribute('checked');
                }
            });
        }
    }

    connectedCallback() {
        this.interactingState = new InteractingState();
        this.interactingState.onleave(() => this.showHelpMessageIfInvalid());
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * If present, the visual picker is disabled and the user cannot with it.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }
    /**
     * If present, hide the check mark when selected.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get hideCheckMark() {
        return this._hideCheckMark;
    }

    set hideCheckMark(value) {
        this._hideCheckMark = normalizeBoolean(value);
    }
    /**
     * Array of items with attributes populating the visual picker.
     *
     * @type {object[]}
     * @public
     */
    @api
    get items() {
        return this._items;
    }

    set items(value) {
        this._items = normalizeArray(value);
    }
    /**
     * The ratio of the items. Valid values include 1-by-1, 4-by-3, 16-by-9, 3-by-4 and 9-by-16.
     *
     * @type {string}
     * @public
     * @default 1-by-1
     */
    @api
    get ratio() {
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
    @api
    get required() {
        return this._required;
    }

    set required(value) {
        this._required = normalizeBoolean(value);
    }
    /**
     * The size of the items. Valid values include xx-small (4rem x 4 rem), x-small (6rem x 6 rem), small (8rem x 8rem), medium (12rem x 12rem), large (15rem x 15rem), x-large (18rem x 18rem), xx-large (21rem x 21rem) and responsive. Only avatar appears when x-small and xx-small.
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
            fallbackValue: VISUAL_PICKER_SIZES.default,
            validValues: VISUAL_PICKER_SIZES.valid
        });
    }
    /**
     * It defines the type of input. Valid values include radio and checkbox.
     *
     * @type {string}
     * @public
     * @default radio
     */
    @api
    get type() {
        return this._type;
    }

    set type(type) {
        this._type = normalizeString(type, {
            fallbackValue: INPUT_TYPES.default,
            validValues: INPUT_TYPES.valid
        });
    }

    /**
     * Represents the validity states that an element can be in, with respect to constraint validation.
     *
     * @type {string}
     * @public
     */
    @api
    get validity() {
        return this._constraint.validity;
    }

    /**
     * Value of the selected item. For the checkbox type, the value can be an array. Ex: [value1, value2], 'value1' or ['value1']
     *
     * @type {(string|string[])}
     * @public
     */
    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value =
            typeof value === 'string' ? [value] : normalizeArray(value);
    }

    /**
     * Changes the appearance of the item when selected. Valid values include coverable and non-coverable.
     *
     * @type {string}
     * @public
     * @default non-coverable
     */
    @api
    get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: VISUAL_PICKER_VARIANTS.default,
            validValues: VISUAL_PICKER_VARIANTS.valid
        });
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Computed list items
     * @type {object[]}
     */
    get listItems() {
        return this._items.map((item, index) => {
            let {
                avatar,
                avatarPosition,
                description,
                descriptionPosition,
                disabled,
                imgAlternativeText,
                imgSrc,
                itemDescription,
                itemTitle,
                tags,
                title,
                titlePosition,
                value
            } = item;
            const key = `visual-picker-key-${index}`;
            disabled = this._disabled ? true : disabled;

            // Check management
            const checked = this._value.includes(value);
            const displayCheckCoverable =
                !this.hideCheckMark && checked && this.isCoverable;
            const displayCheckNonCoverable =
                !this.hideCheckMark && checked && !this.isCoverable;
            const computedSelectedClass = this.isResponsive
                ? 'slds-is-selected avonni-visual-picker__check_absolute-center'
                : 'slds-is-selected';

            // Title management
            titlePosition = titlePosition || 'center';
            const displayTitle = title && this.isBiggerThanXSmall;
            const titleIsTop = titlePosition === 'top' && displayTitle;
            const titleIsCenter = titlePosition === 'center' && displayTitle;
            const titleIsBottom = titlePosition === 'bottom' && displayTitle;

            // Description management
            descriptionPosition = descriptionPosition || 'center';
            const displayDescription = description && this.isBiggerThanXSmall;
            const descriptionIsTop =
                descriptionPosition === 'top' && displayDescription;
            const descriptionIsCenter =
                descriptionPosition === 'center' && displayDescription;
            const descriptionIsBottom =
                descriptionPosition === 'bottom' && displayDescription;
            const computedDescriptionClass = classSet(
                'avonni-visual-picker__figure-description slds-line-clamp'
            ).add({
                'slds-p-around_small': this.truncateRatio,
                'slds-p-horizontal_xx-small':
                    descriptionPosition === titlePosition && !this.truncateRatio
            });

            // Avatar management
            avatarPosition = avatarPosition || 'left';
            const displayAvatar = avatar && this.isBiggerThanXSmall;
            const avatarAltText = displayAvatar
                ? avatar.alternativeText ||
                  avatar.iconName ||
                  avatar.initials ||
                  'avatar'
                : '';
            const avatarIsTop = avatarPosition === 'top' && displayAvatar;
            const avatarIsBottom = avatarPosition === 'bottom' && displayAvatar;
            const avatarIsCenter =
                avatar &&
                (avatarPosition === 'center' ||
                    !this.isBiggerThanXSmall ||
                    (!avatarIsBottom && !avatarIsTop && !displayTitle));

            // Image management
            const displayImgCenter =
                imgSrc &&
                ((this.isBiggerThanXSmall && titleIsTop) ||
                    (!this.isBiggerThanXSmall && !avatarIsCenter));
            const displayImgTop =
                imgSrc &&
                this.isBiggerThanXSmall &&
                (titleIsCenter || titleIsBottom);
            this.displayImgC = displayImgCenter;
            this.displayImgT = displayImgTop;
            return {
                key,
                itemTitle,
                avatar,
                itemDescription,
                disabled,
                value,
                checked,
                avatarPosition,
                avatarIsTop,
                avatarIsCenter,
                avatarIsBottom,
                avatarAltText,
                displayCheckCoverable,
                displayCheckNonCoverable,
                title,
                titleIsTop,
                titleIsBottom,
                titleIsCenter,
                description,
                descriptionIsTop,
                descriptionIsBottom,
                descriptionIsCenter,
                displayImgCenter,
                displayImgTop,
                displayAvatar,
                tags,
                imgAlternativeText,
                imgSrc,
                computedSelectedClass,
                computedDescriptionClass
            };
        });
    }

    /**
     * Compute visual picker class styling based on selected attributes. ( orientation, size, ratio)
     *
     * @type {string}
     */
    get visualPickerClass() {
        return classSet('slds-visual-picker')
            .add(`avonni-visual-picker_${this._size}`)
            .add(`ratio-${this._ratio}`)
            .add({ 'slds-m-around_none': this.isResponsive })
            .toString();
    }

    /**
     * Compute visual picker type class styling based on selected attributes.
     *
     * @type {string}
     */
    get visualPickerTypeClass() {
        return classSet(
            'slds-visual-picker__figure avonni-visual-picker__figure'
        )
            .add({
                'slds-visual-picker__text': !this.isCoverable,
                'slds-visual-picker__icon': this.isCoverable,
                'avonni-hide-check-mark': this.hideCheckMark,
                'slds-align_absolute-center': !this.isResponsive
            })
            .toString();
    }

    /**
     * Compute visual picker items class styling based on size attributes and presence of image.
     *
     * @type {string}
     */
    get visualPickerItemsClass() {
        return classSet('slds-has-flexi-truncate')
            .add({
                'avonni-visual-picker__items':
                    this.size !== 'responsive' ||
                    (this.size === 'responsive' && !this.displayImg),
                'avonni-visual-picker__items_responsive':
                    this.size === 'responsive' && this.displayImg
            })
            .toString();
    }

    /**
     * Compute visual picker items class styling based on size attributes and presence of image.
     *
     * @type {string}
     */
    get visualPickerItemsClassTop() {
        return classSet('slds-has-flexi-truncate')
            .add({
                'avonni-visual-picker__items':
                    this.size !== 'responsive' ||
                    (this.size === 'responsive' && !this.displayImgT),
                'avonni-visual-picker__items_responsive_image':
                    this.size === 'responsive' && this.displayImgT
            })
            .toString();
    }

    /**
     * Compute visual picker items class styling based on size attributes and presence of image.
     *
     * @type {string}
     */
    get visualPickerItemsClassCenter() {
        return classSet('slds-has-flexi-truncate')
            .add({
                'avonni-visual-picker__items':
                    this.size !== 'responsive' ||
                    (this.size === 'responsive' && !this.displayImgC),
                'avonni-visual-picker__items_responsive_image':
                    this.size === 'responsive' && this.displayImgC
            })
            .toString();
    }

    /**
     * Computed NOT selected class styling.
     *
     * @type {string}
     */
    get notSelectedClass() {
        return classSet('avonni-visual-picker__height')
            .add({
                'slds-is-not-selected': this.isCoverable && !this._hideCheckMark
            })
            .toString();
    }

    /**
     * Computed check icon container class styling.
     *
     * @type {string}
     */
    get computedCheckIconContainerClass() {
        return classSet('slds-icon_container slds-visual-picker__text-check')
            .add({
                'avonni-visual-picker__chek-icon': this.isResponsive
            })
            .toString();
    }

    /**
     * Verify if size is bigger than x-small.
     *
     * @type {boolean}
     */
    get isBiggerThanXSmall() {
        return !(this.size === 'x-small' || this.size === 'xx-small');
    }

    /**
     * Verify if variant is coverable.
     *
     * @type {boolean}
     */
    get isCoverable() {
        return this.variant === 'coverable';
    }

    /**
     * Verify if size is responsive.
     *
     * @type {boolean}
     */
    get isResponsive() {
        return this.size === 'responsive';
    }

    /**
     * Add horizontal padding when size is responsive.
     *
     * @type {string}
     */
    get responsivePadding() {
        return this.isResponsive ? 'horizontal-small' : '';
    }

    /**
     * Pull boundary small if size is responsive.
     *
     * @type {string}
     */
    get responsivePullBoundary() {
        return this.isResponsive ? 'small' : '';
    }

    /**
     * Verify if is a truncate description ratio.
     *
     * @type {boolean}
     */
    get truncateRatio() {
        return (
            (this._ratio === '4-by-3' || this._ratio === '16-by-9') &&
            !this.isResponsive
        );
    }

    /**
     * Get all inputs.
     *
     * @type {Element}
     */
    get inputs() {
        return Array.from(
            this.template.querySelectorAll('[data-element-id="input"]')
        );
    }

    /**
     * Get input.
     *
     * @type {Element}
     */
    get input() {
        return this.template.querySelector('[data-element-id="input"]');
    }

    /**
     * Validation with constraint Api.
     *
     * @type {object}
     */
    get _constraint() {
        if (!this._constraintApi) {
            this._constraintApi = new FieldConstraintApi(() => this, {
                valueMissing: () =>
                    !this.disabled && this.required && this.value.length === 0
            });
        }
        return this._constraintApi;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Removes keyboard focus from the input element.
     *
     * @public
     */
    @api
    blur() {
        this.input.blur();
    }

    /**
     * Sets focus on the input element.
     *
     * @public
     */
    @api
    focus() {
        this.input.focus();
    }

    /**
     * Checks if the input is valid.
     *
     * @returns {boolean} Indicates whether the element meets all constraint validations.
     * @public
     */
    @api
    checkValidity() {
        return this._constraint.checkValidity();
    }

    /**
     * Displays the error messages and returns false if the input is invalid.
     * If the input is valid, reportValidity() clears displayed error messages and returns true.
     *
     * @returns {boolean} - The validity status of the input fields.
     * @public
     */
    @api
    reportValidity() {
        return this._constraint.reportValidity((message) => {
            this.helpMessage = message;
        });
    }

    /**
     * Sets a custom error message to be displayed when a form is submitted.
     *
     * @param {string} message - The string that describes the error.
     * If message is an empty string, the error message is reset.
     * @public
     */
    @api
    setCustomValidity(message) {
        this._constraint.setCustomValidity(message);
    }

    /**
     * Displays error messages on invalid fields.
     * An invalid field fails at least one constraint validation and returns false when checkValidity() is called.
     *
     * @public
     */
    @api
    showHelpMessageIfInvalid() {
        this.reportValidity();
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Dispatches the blur event.
     */
    handleBlur() {
        this.interactingState.leave();
    }

    /**
     * Dispatches the focus event.
     */
    handleFocus() {
        this.interactingState.enter();
    }

    /**
     * Change event handler.
     *
     * @param {Event} event
     */
    handleChange(event) {
        event.stopPropagation();
        const value = this.inputs
            .filter((input) => input.checked)
            .map((input) => input.value);

        this._value = value;

        /**
         * The event fired when the value changed.
         *
         * @event
         * @name change
         * @param {string|string[]} value Selected items' value. Returns an array of string if the type is checkbox. Returns a string otherwise.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value: this.type === 'radio' ? value[0] || null : value
                }
            })
        );
    }
}
