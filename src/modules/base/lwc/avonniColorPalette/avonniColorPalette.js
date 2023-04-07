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
import {
    normalizeArray,
    normalizeBoolean,
    normalizeString,
    generateColors,
    isLightColor
} from 'c/utilsPrivate';
import { classSet, generateUUID } from 'c/utils';
import grid from './avonniGrid.html';
import list from './avonniList.html';

const DEFAULT_COLORS = [
    '#e3abec',
    '#c2dbf7',
    '#9fd6ff',
    '#9de7da',
    '#9df0bf',
    '#fff099',
    '#fed49a',
    '#d073df',
    '#86b9f3',
    '#5ebbff',
    '#44d8be',
    '#3be281',
    '#ffe654',
    '#ffb758',
    '#bd35bd',
    '#5778c1',
    '#1b96ff',
    '#00aea9',
    '#3bba4c',
    '#f4bc25',
    '#f99120',
    '#580d8c',
    '#001870',
    '#0a2399',
    '#097476',
    '#096a50',
    '#b67d11',
    '#b85d0d'
];

const DEFAULT_TILE_WIDTH = 20;
const DEFAULT_TILE_HEIGHT = 20;

const VARIANTS = {
    default: 'grid',
    valid: ['grid', 'list']
};

/**
 * @class
 * @descriptor avonni-color-palette
 * @storyId example-color-palette--base
 * @public
 */
export default class AvonniColorPalette extends LightningElement {
    _colors = DEFAULT_COLORS;
    _columns;
    _disabled = false;
    _groups = [];
    _hideOutline = false;
    _isLoading = false;
    _readOnly = false;
    _showCheckmark = false;
    _tileWidth = DEFAULT_TILE_WIDTH;
    _tileHeight = DEFAULT_TILE_HEIGHT;
    _value;
    _variant = VARIANTS.default;

    computedGroups = [];
    _isConnected = false;

    connectedCallback() {
        this.initGroups();
        this._isConnected = true;
    }

    renderedCallback() {
        this.initContainer();
    }

    render() {
        return this.variant === 'list' ? list : grid;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Array of colors displayed in the default palette. Each color can either be a string or a color object.
     *
     * @type {(string[]|object[])}
     * @default [“#e3abec”, “#c2dbf7”, ”#9fd6ff”, ”#9de7da”, ”#9df0bf”, ”#fff099”, ”#fed49a”, ”#d073df”, ”#86b9f3”, ”#5ebbff”, ”#44d8be”, ”#3be281”, ”#ffe654”, ”#ffb758”, ”#bd35bd”, ”#5778c1”, ”#1b96ff”, ”#00aea9”, ”#3bba4c”, ”#f4bc25”, ”#f99120”, ”#580d8c”, ”#001870”, ”#0a2399”, ”#097476”, ”#096a50”, ”#b67d11”, ”#b85d0d”]
     * @public
     */
    @api
    get colors() {
        return this._colors;
    }
    set colors(value) {
        const colors = normalizeArray(value);
        this._colors = colors.length ? colors : DEFAULT_COLORS;
        if (this._isConnected) this.initGroups();
    }

    /**
     * Specifies the number of columns displayed. If unspecified, the tiles spread to the width of the container.
     *
     * @public
     * @type {number}
     */
    @api
    get columns() {
        return this._columns;
    }

    set columns(value) {
        this._columns = Number(value);
        this.initContainer();
    }

    /**
     * If present, the input field is disabled and users cannot interact with it.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
        this.initContainer();
    }

    /**
     * Array of group objects.
     *
     * @public
     * @type {object[]}
     */
    @api
    get groups() {
        return this._groups;
    }

    set groups(value) {
        this._groups = normalizeArray(value);

        if (this._isConnected) this.initGroups();
    }

    /**
     * If present, the selected outline is hidden.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get hideOutline() {
        return this._hideOutline;
    }

    set hideOutline(value) {
        this._hideOutline = normalizeBoolean(value);
        this.initContainer();
    }

    /**
     * If present, a spinner is displayed to indicate that data is loading.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get isLoading() {
        return this._isLoading;
    }

    set isLoading(value) {
        this._isLoading = normalizeBoolean(value);
        this.initContainer();
    }

    /**
     * If present, the palette is read-only and cannot be edited by users.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get readOnly() {
        return this._readOnly;
    }

    set readOnly(value) {
        this._readOnly = normalizeBoolean(value);
        this.initContainer();
    }

    /**
     * If present, the selected checkmark is shown.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get showCheckmark() {
        return this._showCheckmark;
    }

    set showCheckmark(value) {
        this._showCheckmark = normalizeBoolean(value);
        this.initContainer();
    }

    /**
     * Tile width in px.
     *
     * @public
     * @default 20
     * @type {number}
     */
    @api
    get tileWidth() {
        return this._tileWidth;
    }

    set tileWidth(value) {
        this._tileWidth = Number(value);
        this.initContainer();
    }

    /**
     * Tile height in px.
     *
     * @public
     * @default 20
     * @type {number}
     */
    @api
    get tileHeight() {
        return this._tileHeight;
    }

    set tileHeight(value) {
        this._tileHeight = Number(value);
        this.initContainer();
    }

    /**
     * Specifies the value of an input element.
     *
     * @public
     * @type {string}
     */
    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this.initContainer();
    }

    /**
     * Changes the appearance of the palette. Valid values include grid and list.
     *
     * @public
     * @default grid
     * @type {string}
     */
    @api
    get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: VARIANTS.default,
            validValues: VARIANTS.valid
        });
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * CSS class of the swatch trigger element.
     *
     * @type {string}
     */
    get computedSwatchTriggerClass() {
        return classSet('slds-color-picker__swatch-trigger')
            .add({
                'avonni-color-picker__show-selected-outline':
                    this.variant === 'grid' && !this._hideOutline,
                'avonni-color-picker__show-selected-checkmark':
                    this.variant === 'grid' && this._showCheckmark
            })
            .toString();
    }

    /**
     * Get the current color object.
     */
    get currentColor() {
        return (
            this.colors.find((col) => col.value && col.value === this.value) ||
            {}
        );
    }

    /**
     * CSS class of the group wrapping div.
     *
     * @type {string|undefined}
     */
    get groupClass() {
        return this.computedGroups.length > 1
            ? 'slds-m-bottom_x-small'
            : undefined;
    }

    /**
     * Generated unique ID key.
     */
    get generateKey() {
        return generateUUID();
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Clear the value.
     *
     * @public
     */
    @api
    reset() {
        // eslint-disable-next-line @lwc/lwc/no-api-reassignments
        this.value = '';
        this.dispatchChange(generateColors(''));
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Initialize Palette container.
     */
    initContainer() {
        const container = this.template.querySelector(
            '[data-element-id="div-palette-container"]'
        );
        if (container) {
            container.style.width = this.columns
                ? `${this.columns * (Number(this.tileWidth) + 8)}px`
                : '';
            container.style.minHeight = `${Number(this.tileHeight) + 8}px`;
        }

        [
            ...this.template.querySelectorAll('[data-element-id="span-swatch"]')
        ].forEach((element) => {
            const backgroundColor = this.disabled
                ? '#dddbda'
                : element.dataset.color;
            element.style.backgroundColor = backgroundColor;
            element.style.borderRadius =
                'var(--avonni-color-palette-swatch-border-radius, 0.125rem)';
            element.style.height = `${this.tileHeight}px`;
            element.style.width = `${this.tileWidth}px`;

            if (this.variant === 'grid') {
                // Style checkmark
                if (this._showCheckmark) {
                    const smallestLength = Math.min(
                        this.tileHeight,
                        this.tileWidth
                    );
                    const lengthStyle = `${
                        smallestLength - smallestLength * 0.4
                    }px`;
                    element.firstChild.style.height = lengthStyle;
                    element.firstChild.style.width = lengthStyle;

                    const { R, G, B } = generateColors(element.dataset.color);
                    const color = isLightColor(R, G, B) ? 'black' : 'white';
                    element.firstChild.style.fill = `var(--avonni-color-palette-swatch-selected-checkmark-color, ${color})`;
                }

                // Style outline
                if (!this._hideOutline) {
                    element.style.outlineColor = `var(--avonni-color-palette-swatch-selected-outline-color, ${backgroundColor})`;
                }
            }
        });

        this.selectColor();
    }

    /**
     * Initialize the computed groups, based on the given colors and groups.
     */
    initGroups() {
        const groups = {};
        const undefinedGroup = {
            name: generateUUID(),
            colors: []
        };

        this.colors.forEach((color) => {
            let hasBeenAddedToAGroup = false;

            if (color instanceof Object) {
                const colorGroups = normalizeArray(color.groups);

                if (this.groups.length && colorGroups.length) {
                    colorGroups.forEach((groupName) => {
                        // Make sure the group exists
                        const groupDefinition = this.groups.find(
                            (grp) => grp.name === groupName
                        );

                        if (groupDefinition) {
                            if (!groups[groupName]) {
                                // If the group does not exist yet, create its structure
                                groups[groupName] = {
                                    name: groupName,
                                    label: groupDefinition.label,
                                    colors: []
                                };
                            }
                            groups[groupName].colors.push(color);
                            hasBeenAddedToAGroup = true;
                        }
                    });
                }
            } else {
                color = {
                    color: color
                };
            }
            if (!hasBeenAddedToAGroup) {
                undefinedGroup.colors.push(color);
            }
        });

        // Create the computed groups, in the order of the groups array
        const computedGroups = [];
        this.groups.forEach((group) => {
            if (groups[group.name]) {
                computedGroups.push(groups[group.name]);
            }
        });

        // Add the undefined group at the beginning of the array
        if (undefinedGroup.colors.length) {
            computedGroups.unshift(undefinedGroup);
        }
        this.computedGroups = computedGroups;
    }

    /**
     * Mark a color as selected.
     */
    selectColor() {
        // Unselect last selected color.
        const selectedColor = this.template.querySelector('.slds-is-selected');
        if (selectedColor) selectedColor.classList.remove('slds-is-selected');

        // Select new token or color.
        const elem = this.currentColor.value
            ? this.template.querySelector(
                  `[data-selectable][data-token="${this.currentColor.value}"]`
              )
            : this.template.querySelector(
                  `[data-selectable][data-color="${this.value}"]`
              );
        if (elem) elem.classList.add('slds-is-selected');
    }

    /**
     * Private focus event handler.
     */
    handleFocus() {
        /**
         * The event fired when the focus is set on the palette.
         *
         * @event
         * @name focus
         * @public
         */
        this.dispatchEvent(new CustomEvent('focus'));

        /**
         * @event
         * @name privatefocus
         * @bubbles
         * @cancelable
         */
        this.dispatchEvent(
            new CustomEvent('privatefocus', {
                bubbles: true,
                cancelable: true
            })
        );
    }

    /**
     * Blur and private blur event handler.
     */
    handleBlur() {
        /**
         * The event fired when the focus is removed from the palette.
         * @event
         * @name blur
         * @public
         */
        this.dispatchEvent(new CustomEvent('blur'));

        /**
         * @event
         * @name privateblur
         * @composed
         * @bubbles
         * @cancelable
         */
        this.dispatchEvent(
            new CustomEvent('privateblur', {
                composed: true,
                bubbles: true,
                cancelable: true
            })
        );
    }

    /**
     * Click event handler.
     *
     * @param {object} event
     * @returns {string} value
     */
    handleClick(event) {
        if (this.disabled || this.readOnly) {
            event.preventDefault();
            return;
        }

        const { color, token } = event.currentTarget.dataset;
        // eslint-disable-next-line @lwc/lwc/no-api-reassignments
        this.value = token || color;
        event.preventDefault();
        this.dispatchChange(generateColors(color));
    }

    /**
     * Change event handler.
     */
    dispatchChange(colors) {
        if (!this.disabled && !this.readOnly) {
            const color = this.currentColor;
            /**
             * The event fired when the value is changed.
             *
             * @event
             * @public
             * @name change
             * @param {string} hex Color in hexadecimal format.
             * @param {string} hexa Color in hexadecimal format with alpha.
             * @param {string} rgb Color in rgb format.
             * @param {string} rgba Color in rgba format.
             * @param {string} alpha Alpha value of the color.
             * @param {string} label Color label.
             * @param {string} token Token value.
             * @bubbles
             * @cancelable
             */
            this.dispatchEvent(
                new CustomEvent('change', {
                    bubbles: true,
                    cancelable: true,
                    detail: {
                        hex: colors.hex,
                        hexa: colors.hexa,
                        rgb: colors.rgb,
                        rgba: colors.rgba,
                        alpha: colors.A,
                        label: color.label,
                        token: color.value
                    }
                })
            );
        }
    }

    /**
     * Double click event handler.
     *
     */
    handleDblClick() {
        /**
         * The event fired when a color is clicked twice.
         *
         * @event
         * @name colordblclick
         * @public
         * @bubbles
         * @composed
         */
        this.dispatchEvent(
            new CustomEvent('colordblclick', {
                bubbles: true,
                composed: true
            })
        );
    }
}
