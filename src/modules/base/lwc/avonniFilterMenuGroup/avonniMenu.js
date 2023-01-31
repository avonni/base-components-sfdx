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

import {
    dateTimeObjectFrom,
    formatDateFromStyle,
    normalizeArray,
    normalizeObject
} from 'c/utilsPrivate';
import { numberFormat } from 'c/internationalizationLibrary';

/**
 * @class
 * @param {string} accessKey The keyboard shortcut for the button menu (horizontal variant) or the checkbox group (vertical variant).
 * @param {string} alternativeText The assistive text for the button menu.
 * This property isn’t supported for the vertical variant.
 * @param {string} buttonVariant The button variant changes the look of the horizontal variant’s button. Accepted variants include bare, container, border, border-filled, bare-inverse, and border-inverse.
 * This property isn’t supported for the vertical variant.
 * @param {boolean} disabled If true, the menu cannot be used by users. Defaults to false.
 * @param {string} dropdownAlignment Alignment of the dropdown menu relative to the button. Available options are: auto, left, center, right, bottom-left, bottom-center, bottom-right. The auto option aligns the dropdown menu based on available space. Defaults to left.
 * This key isn’t supported for the vertical variant.
 * @param {boolean} dropdownNubbin If true, a nubbin is present on the dropdown menu. A nubbin is a stub that protrudes from the menu item towards the button menu. The nubbin position is based on the menu-alignment. Defaults to false.
 * This key isn’t supported for the vertical variant.
 * @param {string} iconName The name of the icon to be used in the format 'utility:down'. For the horizontal variant, if an icon other than 'utility:down' or 'utility:chevrondown' is used, a utility:down icon is appended to the right of that icon.
 * @param {string} iconSize Size of the icon. Options include xx-small, x-small, small, medium or large. Defaults to medium.
 * @param {boolean} isLoading If true, the menu is in a loading state and shows a spinner. Defaults to false.
 * @param {string} label Label of the menu.
 * @param {string} loadingStateAlternativeText Message displayed while the menu is in the loading state. Defaults to “Loading”.
 * @param {string} name Required. A unique name for the menu.
 * @param {string} title Title of the button (horizontal variant) or the label (vertical variant).
 * @param {string} tooltip The tooltip is displayed on hover or focus on the button (horizontal variant), or on the help icon (vertical variant).
 * @param {string} type Type of the filter menu. Valid values include date-range, list and range. Defaults to list.
 * @param {object} typeAttributes Attributes specific to the type (see Types and Type Attributes in Filter Menu).
 */
export default class AvonniFilterMenuGroupMenu {
    constructor(props) {
        Object.assign(this, props);
    }

    get value() {
        return this._value;
    }
    set value(value) {
        this._value =
            typeof value === 'string' ? [value] : normalizeArray(value);
    }

    /**
     * Array of selected items, as valid pill container items.
     *
     * @type {object[]}
     */
    get selectedItems() {
        return this.type === 'date-range' || this.type === 'range'
            ? this.selectedRangeItems
            : this.selectedListItems;
    }

    /**
     * Array of selected list items, as valid pill container items.
     *
     * @type {object[]}
     */
    get selectedListItems() {
        const typeAttributes = normalizeObject(this.typeAttributes);
        const items = normalizeArray(typeAttributes.items, 'object');
        const selectedItems = items.filter((item) => {
            return this.value.includes(item.value);
        });
        return selectedItems.map((item) => {
            return {
                label: item.label,
                name: `${this.name}.${item.value}`,
                menuName: this.name,
                itemValue: item.value
            };
        });
    }

    /**
     * Array of selected range or date-range items, as valid pill container items.
     *
     * @type {object[]}
     */
    get selectedRangeItems() {
        const { dateStyle, timeStyle, timezone, type, unit, unitAttributes } =
            this.typeAttributes;

        const selection = this.value.reduce((string, value) => {
            let normalizedValue = '';
            if (
                this.type === 'date-range' &&
                value &&
                !isNaN(new Date(value))
            ) {
                // Date range
                const date = dateTimeObjectFrom(value, { zone: timezone });
                normalizedValue = formatDateFromStyle(date, {
                    dateStyle,
                    showTime: type === 'datetime',
                    timeStyle
                });
            } else if (this.type === 'range' && !isNaN(value)) {
                // Range
                const attributes = normalizeObject(unitAttributes);
                const options = {
                    style: unit,
                    ...attributes
                };
                normalizedValue = value.toString();
                normalizedValue = numberFormat(options).format(normalizedValue);
            }
            return string.length
                ? `${string} - ${normalizedValue}`
                : normalizedValue;
        }, '');

        return selection.length
            ? [
                  {
                      label: selection,
                      name: `${this.name}.${selection}`,
                      menuName: this.name
                  }
              ]
            : [];
    }
}
