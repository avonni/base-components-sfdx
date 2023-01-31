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
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';
import { classSet } from 'c/utils';
import { generateUUID } from 'c/inputUtils';

const PAGINATION_ALIGNS = {
    valid: ['left', 'center', 'right', 'fill'],
    default: 'left'
};

const DEFAULT_PER_PAGE = 20;
const DEFAULT_TOTAL_ROWS = 0;
const DEFAULT_ELLIPSIS_TEXT = '...';
const DEFAULT_VALUE = 1;
const DEFAULT_LIMIT = 5;

/**
 * @class
 * @descriptor avonni-pagination
 * @storyId example-pagination--base
 * @public
 */
export default class AvonniPagination extends LightningElement {
    /**
     * Content to place in the ellipsis placeholder.
     *
     * @type {string}
     * @public
     * @default ...
     */
    @api ellipsisText = DEFAULT_ELLIPSIS_TEXT;
    /**
     * The name of an icon to display after the label of the first button.
     *
     * @type {string}
     * @public
     */
    @api firstButtonIconName;
    /**
     * Label for the first button.
     *
     * @type {string}
     * @public
     */
    @api firstButtonLabel;
    /**
     * The name of an icon to display after the label for the last button.
     *
     * @type {string}
     * @public
     */
    @api lastButtonIconName;
    /**
     * Label for the last button.
     *
     * @type {string}
     * @public
     */
    @api lastButtonLabel;
    /**
     * Label for the next button.
     *
     * @type {string}
     * @public
     */
    @api nextButtonLabel;
    /**
     * Number of rows per page
     *
     * @type {number}
     * @public
     * @default 20
     */
    @api perPage = DEFAULT_PER_PAGE;
    /**
     * Label for the previous button.
     *
     * @type {string}
     * @public
     */
    @api previousButtonLabel;
    /**
     * Total number of rows in the dataset.
     *
     * @type {number}
     * @public
     * @default 0
     */
    @api totalRows = DEFAULT_TOTAL_ROWS;

    _align = PAGINATION_ALIGNS.default;
    _disabled = false;
    _limit = DEFAULT_LIMIT;
    _nextButtonIconName;
    _previousButtonIconName;
    _value = DEFAULT_VALUE;

    renderedCallback() {
        this.setActiveButton();
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Alignment of the page buttons. Values include left, center, right and fill.
     *
     * @type {string}
     * @public
     * @default left
     */
    @api
    get align() {
        return this._align;
    }

    set align(align) {
        this._align = normalizeString(align, {
            fallbackValue: PAGINATION_ALIGNS.default,
            validValues: PAGINATION_ALIGNS.valid
        });
    }

    /**
     * If present, the pagination is disabled and the user cannot interact with it.
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
     * Maximum number of buttons to show (including ellipsis if shown, but excluding the bookend buttons). The minimum value is 3.
     *
     * @type {number}
     * @public
     * @default 5
     */
    @api
    get limit() {
        return this._limit;
    }

    set limit(value) {
        this._limit = Number(value);

        if (this._limit < 3) {
            this._limit = 3;
        }
    }

    /**
     * The name of an icon to display after the label for the next button.
     *
     * @type {string}
     * @public
     * @default utility:chevronright
     */
    @api
    get nextButtonIconName() {
        if (!this.nextButtonLabel && !this._nextButtonIconName) {
            return 'utility:chevronright';
        }

        return this._nextButtonIconName;
    }

    set nextButtonIconName(value) {
        this._nextButtonIconName = value;
    }

    /**
     * The name of an icon to display after the label for the previous button.
     *
     * @type {string}
     * @public
     * @default utility:chevronleft
     */
    @api
    get previousButtonIconName() {
        if (!this.previousButtonLabel && !this._previousButtonIconName) {
            return 'utility:chevronleft';
        }

        return this._previousButtonIconName;
    }

    set previousButtonIconName(value) {
        this._previousButtonIconName = value;
    }

    /**
     * Current page number, starting from 1
     *
     * @type {number}
     * @public
     * @default 1
     */
    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = Number(value);
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Computed CSS classes of the main pagination buttons.
     *
     * @type {string}
     */
    get computedButtonClass() {
        return classSet('slds-button slds-button_neutral')
            .add({
                'slds-button_stretch': this.align === 'fill'
            })
            .toString();
    }

    /**
     * Get index of pagination buttons.
     *
     * @type {number}
     */
    get index() {
        return this.limit === 3 ? 2 : this.limit - Math.ceil(this.limit / 3);
    }

    /**
     * Check pagination size to display.
     *
     * @type {number}
     */
    get paginationSize() {
        let size = Math.ceil(this.totalRows / this.perPage);
        return size === 0 ? 1 : size;
    }

    /**
     * Generate unique Key iD for buttons.
     *
     * @type {string}
     */
    get uniqueKey() {
        return generateUUID();
    }

    /**
     * Check whether Left button is disabled.
     *
     * @type {boolean | number}
     */
    get disabledLeftButtons() {
        return this._disabled || this.value === 1;
    }

    /**
     * Check whether Right button is disabled.
     *
     * @type {boolean | number}
     */
    get disabledRightButtons() {
        return this._disabled || this.value === this.paginationSize;
    }

    /**
     * Check which label or icon to display on the first button.
     *
     * @type {boolean}
     */
    get showFirstButton() {
        return this.firstButtonLabel || this.firstButtonIconName;
    }

    /**
     * Check whether the label is not specified and that the icon is present to display on the first button.
     *
     * @type {string}
     */
    get firstButtonIcon() {
        return !this.firstButtonLabel && this.firstButtonIconName;
    }

    /**
     * Check which label or icon to display on the last button.
     *
     * @type {boolean}
     */
    get showLastButton() {
        return this.lastButtonLabel || this.lastButtonIconName;
    }

    /**
     * Check whether the label is not specified and that the icon is present to display on the first button.
     *
     * @type {string}
     */
    get lastButtonIcon() {
        return !this.lastButtonLabel && this.lastButtonIconName;
    }

    /**
     * Computed container class styling for alignment attribute.
     *
     * @type {string}
     */
    get computedContainerClass() {
        return classSet({
            'slds-grid slds-grid_align-center': this.align === 'center',
            'slds-grid slds-grid_align-end': this.align === 'right',
            'avonni-pagination__container_fill': this.align === 'fill'
        }).toString();
    }

    /**
     * Compute pagination buttons to array object and display according to index and limit.
     *
     * @type {object}
     */
    get paginationButtons() {
        let paginationButtons = [
            ...Array(this.paginationSize + 1).keys()
        ].slice(1);

        let firstIndex = this.value - this.index;
        let lastIndex = this.limit + firstIndex;

        if (this.limit < this.paginationSize) {
            if (this.limit === 3) {
                if (this.value < this.paginationSize - 1) {
                    if (this.value > 2) {
                        paginationButtons = paginationButtons.slice(
                            firstIndex,
                            lastIndex
                        );
                    } else {
                        paginationButtons = paginationButtons.slice(
                            0,
                            this.limit
                        );
                    }
                } else {
                    paginationButtons = paginationButtons.slice(
                        this.paginationSize - this.limit,
                        this.paginationSize
                    );
                }
            } else {
                if (this.value < this.paginationSize - 2) {
                    if (this.value >= this.limit - 2) {
                        paginationButtons = paginationButtons.slice(
                            firstIndex,
                            lastIndex
                        );
                        paginationButtons[0] = this.ellipsisText;
                    } else {
                        paginationButtons = paginationButtons.slice(
                            0,
                            this.limit
                        );
                    }
                    paginationButtons[this.limit - 1] = this.ellipsisText;
                } else {
                    paginationButtons = paginationButtons.slice(
                        this.paginationSize - this.limit,
                        this.paginationSize
                    );
                    paginationButtons[0] = this.ellipsisText;
                }
            }
        }

        return paginationButtons;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Go to first page.
     *
     * @public
     */
    @api
    first() {
        this._value = 1;
        this.handlerChange();
    }

    /**
     * Go to previous page.
     *
     * @public
     */
    @api
    previous() {
        if (this.value > 1) {
            this._value = this.value - 1;
            this.handlerChange();
        }
    }

    /**
     * Go to next page.
     *
     * @public
     */
    @api
    next() {
        if (this.value < this.paginationSize) {
            this._value = this.value + 1;
            this.handlerChange();
        }
    }

    /**
     * Go to last page.
     *
     * @public
     */
    @api
    last() {
        this._value = this.paginationSize;
        this.handlerChange();
    }

    /**
     * Go to page at index.
     *
     * @param {number} index Index of the page.
     */
    @api
    goto(index) {
        this._value = Number(index);
        this.handlerChange();
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Go to button index event handler.
     *
     * @param {Event} event
     */
    goToIndex(event) {
        if (event.target.value !== this.ellipsisText) {
            this.goto(Number(event.target.value));
        }
    }

    /**
     * Change event handler.
     */
    handlerChange() {
        /**
         * The event fired when the page changed.
         *
         * @event
         * @name change
         * @param {string} value The page number selected.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value: this.value
                }
            })
        );
    }

    /**
     * Function to set the currently selected button as "avonni-button-active".
     */
    setActiveButton() {
        const buttons = this.template.querySelectorAll(
            '[data-element-id="button"]'
        );
        buttons.forEach((button) => {
            if (Number(button.value) === this.value) {
                button.classList.add('slds-button_brand');
            } else {
                button.classList.remove('slds-button_brand');
            }
        });
    }
}
