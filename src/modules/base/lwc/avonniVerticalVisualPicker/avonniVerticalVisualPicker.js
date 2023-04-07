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

const ITEM_SIZES = {
    valid: ['small', 'medium', 'large', 'responsive'],
    default: 'medium'
};

const ITEM_TYPES = { valid: ['radio', 'checkbox'], default: 'radio' };

const ITEM_VARIANTS = {
    valid: ['coverable', 'non-coverable'],
    default: 'non-coverable'
};

const DEFAULT_DISABLED = false;
const DEFAULT_HIDE_CHECK_MARK = false;
const DEFAULT_REQUIRED = false;

/**
 * @class
 * @descriptor avonni-vertical-visual-picker
 * @storyId example-verticalvisualpicker--base
 * @public
 */
export default class AvonniVerticalVisualPicker extends LightningElement {
    /**
     * Text label to title the vertical visual picker.
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
     * The name of the vertical visual picker.
     *
     * @type {string}
     * @public
     * @required
     */
    @api name = generateUUID();

    _disabled = DEFAULT_DISABLED;
    _hideCheckMark = DEFAULT_HIDE_CHECK_MARK;
    _items = [];
    _required = DEFAULT_REQUIRED;
    _size = ITEM_SIZES.default;
    _type = ITEM_TYPES.default;
    _variant = ITEM_VARIANTS.default;
    _value = [];

    helpMessage;

    connectedCallback() {
        this.interactingState = new InteractingState();
        this.interactingState.onleave(() => this.showHelpMessageIfInvalid());
    }

    renderedCallback() {
        this._refreshCheckedAttributes();
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * If present, the visual picker is disabled and the user cannot interact with it.
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
     * Array of items with attributes populating the vertical visual picker.
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
     * It defines the width of the item. Valid values include small, medium, large and responsive.
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
            fallbackValue: ITEM_SIZES.default,
            validValues: ITEM_SIZES.valid
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
            fallbackValue: ITEM_TYPES.default,
            validValues: ITEM_TYPES.valid
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
     * Value of the selected item. For the checkbox type, the value can be an array. Ex: [value1, value2], 'value1' or ['value1'].
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
     * It changes the appearance of the item when selected. Valid values include coverable and non-coverable.
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
            fallbackValue: ITEM_VARIANTS.default,
            validValues: ITEM_VARIANTS.valid
        });
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIESs
     * -------------------------------------------------------------
     */

    /**
     * Computed list of items for vertical visual picker.
     *
     * @return {object[]} result
     */
    get computedListItems() {
        return this.items.map((item, index) => {
            let {
                avatar,
                description,
                imgSrc,
                mediaPosition,
                subItems,
                subItemsMultiSelect,
                tags,
                title,
                value
            } = item;
            mediaPosition = mediaPosition || 'left';
            const key = `vertical-visual-picker-key-${index}`;
            const mediaIsLeft = mediaPosition === 'left' && (avatar || imgSrc);
            const mediaIsRight =
                mediaPosition === 'right' && (avatar || imgSrc);
            const bodyClass = classSet(
                'slds-p-around_small slds-has-flexi-truncate'
            ).add({
                'slds-border_left': mediaIsLeft,
                'slds-border_right': mediaIsRight
            });
            const descriptionClass = classSet(
                'slds-text-title avonni-vertical-visual-picker__item-description'
            ).add({
                'slds-truncate': tags && this._size === 'small',
                'slds-line-clamp_x-small': tags && this._size !== 'small',
                'slds-line-clamp_small': !tags
            });
            const disabled = this._disabled || item.disabled;
            const alternativeText = avatar
                ? avatar.alternativeText || avatar.iconName || avatar.initials
                : '';
            const isChecked = this._isItemChecked(value, subItems);

            return {
                key,
                avatar,
                description,
                disabled,
                imgSrc,
                subItems,
                subItemsMultiSelect,
                title,
                tags,
                value: value ? value : key,
                mediaIsLeft,
                mediaIsRight,
                bodyClass,
                descriptionClass,
                alternativeText,
                isChecked,
                showSubItems: isChecked && subItems
            };
        });
    }

    /**
     * Verify if variant is coverable.
     *
     * @type {boolean}
     */
    get isCoverable() {
        return this._variant === 'coverable';
    }

    /**
     * Returns true if one of the items has tags.
     *
     * @type {boolean}
     */
    get hasTags() {
        return this.items.some((item) => item.tags);
    }

    /**
     * Compute visual picker type class styling based on selected attributes.
     *
     * @type {string}
     */
    get verticalVisualPickerClass() {
        return classSet('slds-visual-picker slds-visual-picker_vertical')
            .add(`avonni-vertical-visual-picker__item_size-${this._size}`)
            .toString();
    }

    /**
     * Compute visual picker type class styling based on selected attributes.
     *
     * @type {string}
     */
    get verticalVisualPickerTypeClass() {
        return classSet(
            'slds-visual-picker__figure avonni-vertical-visual-picker__figure slds-align_absolute-left'
        )
            .add(`avonni-vertical-visual-picker__item_size-${this._size}`)
            .add({
                'slds-visual-picker__text': !this.isCoverable,
                'slds-visual-picker__icon': this.isCoverable,
                'avonni-hide-check-mark': this._hideCheckMark,
                'avonni-vertical-visual-picker__figure-with-tags': this.hasTags
            })
            .toString();
    }

    /**
     * Compute NOT selected class styling.
     *
     * @type {string}
     */
    get notSelectedClass() {
        return classSet('avonni-vertical-visual-picker__content_container')
            .add({
                'slds-is-not-selected':
                    this.isCoverable && !this._hideCheckMark,
                'avonni-is-not-selected':
                    this.isCoverable && this._hideCheckMark
            })
            .toString();
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
     * Sets focus on the input element.
     *
     * @public
     */
    @api
    focus() {
        this.input.focus();
    }

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
     * Dispatch the 'change' event.
     */
    _dispatchChange() {
        const dispatchString =
            this.type === 'radio' &&
            this._items.every((item) => !item.subItems);
        /**
         * The event fired when the value changed.
         *
         * @event
         * @name change
         * @param {string|string[]} value Selected items' value. Returns a string if the type is radio and no items have subItems. Otherwise returns an array of string.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value: dispatchString ? this._value[0] || null : this._value
                }
            })
        );
    }

    /**
     * Verifies if the item should be checked.
     * @param {string} value item value
     * @param {object[]} subItems item subitems
     * @returns
     */
    _isItemChecked(value, subItems) {
        const isPickerSelected = this._value.includes(value);
        if (!subItems) return isPickerSelected;
        const isSubItemSelected = subItems.some((subItem) =>
            this._value.includes(subItem.value)
        );
        return isPickerSelected || isSubItemSelected;
    }

    /**
     * Goes through every visual picker and sets the "checked" attribute.
     */
    _refreshCheckedAttributes() {
        if (this.inputs) {
            this.inputs.forEach((input) => {
                const item = this._items.find(
                    ({ value }) => value === input.value
                );
                input.checked =
                    item && this._isItemChecked(item.value, item.subItems);
            });
        }
    }

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
        const targetValue = event.currentTarget.value;
        const targetChecked = event.currentTarget.checked;

        let newValue;
        const item = this._items.find(({ value }) => value === targetValue);
        if (this.type === 'radio' && targetChecked) {
            newValue = [targetValue];
        } else {
            newValue = [...this._value];
            if (targetChecked) {
                newValue.push(targetValue);
            } else {
                newValue = newValue.filter((value) => value !== targetValue);
                if (item && item.subItems) {
                    const subItemsValue = item.subItems.map(
                        ({ value }) => value
                    );
                    // Remove all subItems values from current value.
                    newValue = newValue.filter(
                        (value) => !subItemsValue.includes(value)
                    );
                }
            }
        }

        this._value = newValue;
        this._dispatchChange();
    }

    /**
     * Input keyup event handler.
     *
     * @param {Event} event
     */
    handleKeyUp(event) {
        if (event.key !== 'Enter') return;
        event.currentTarget.click();
    }

    /**
     * Sub Items change event handler.
     *
     * @param {Event} event
     */
    handleSubItemsChange(event) {
        event.stopPropagation();
        const subItemsValue = event.detail.value;
        const subItemsSelected =
            typeof subItemsValue === 'string' ? [subItemsValue] : subItemsValue;

        let newValue = [...this._value];
        const item = this._items.find(
            ({ value }) => value === event.currentTarget.dataset.value
        );
        const subItemsValues = item.subItems.map(({ value }) => value);

        // Remove all subItems values from current value.
        newValue = newValue.filter((value) => !subItemsValues.includes(value));

        // Add the currently selected values of the input-choice-set.
        newValue.push(...subItemsSelected);

        this._value = newValue;
        this._dispatchChange();
        this._refreshCheckedAttributes();
    }
}
