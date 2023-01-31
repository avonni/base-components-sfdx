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
import { generateUUID } from 'c/inputUtils';
import { normalizeBoolean, normalizeArray } from 'c/utilsPrivate';
import { classSet } from 'c/utils';
import { AvonniResizeObserver } from 'c/resizeObserver';

const DEFAULT_ALTERNATIVE_TEXT = 'Selected Options:';

/**
 * @class
 * @name ChipContainer
 * @descriptor avonni-chip-container
 * @description List of items displayed as chips. Avatars and icons can be displayed in the chips as well.
 * @storyId example-chip-container--base
 * @public
 */
export default class AvonniChipContainer extends LightningElement {
    _items = [];
    _alternativeText = DEFAULT_ALTERNATIVE_TEXT;
    _isCollapsible = false;
    _isExpanded = false;

    _wrappedChips = 0;
    _resizeObserver;

    renderedCallback() {
        if (this.showMore) {
            // set the wrapper height to be as high as the biggest element
            this.calculateWrappedNodes();
            this.initWrapObserver();
        } else {
            if (this._resizeObserver) {
                this._resizeObserver.disconnect();
                this._resizeObserver = undefined;
            }
        }
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Alternative text used to describe the chip container.
     *
     * @type {string}
     * @default Selected Options:
     * @public
     */
    @api
    get alternativeText() {
        return this._alternativeText;
    }
    set alternativeText(value) {
        this._alternativeText = value;
    }

    /**
     * If present, the chip list can be collapsed. Use `is-collapsible` with the `is-expanded` attribute to expand and collapse the list of chips.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get isCollapsible() {
        return this._isCollapsible;
    }
    set isCollapsible(value) {
        this._isCollapsible = normalizeBoolean(value);
    }

    /**
     * If present and `is-collapsible` too, the list of chips is expanded. This attribute is ignored when `is-collapsible` is false, and the list of chips is expanded even if `is-expanded` is false or not set.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get isExpanded() {
        return this._isExpanded;
    }
    set isExpanded(value) {
        this._isExpanded = normalizeBoolean(value);
    }

    /**
     * Items to display as chips
     *
     * @type {Object[]}
     * @public
     */
    @api
    get items() {
        return this._items;
    }
    set items(value) {
        this._items = normalizeArray(value, 'object');
        this.checkForMedia();
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * True of the chip container is considered expanded.
     *
     * @type {boolean}
     */
    get computedIsExpanded() {
        return (this.isCollapsible && this.isExpanded) || !this.isCollapsible;
    }

    /**
     * True if the "show more" button should be visible.
     *
     * @type {boolean}
     */
    get showMore() {
        return this.isCollapsible && !this.isExpanded;
    }

    /**
     * Label of the "show more" button.
     *
     * @type {string}
     */
    get computedShowMoreLabel() {
        if (this.computedIsExpanded || this._wrappedChips <= 0) {
            return undefined;
        }
        return `+${this._wrappedChips} more`;
    }

    /**
     * Computes the wrapper class. Adds a class if showMore button is visible.
     */
    get computedWrapperClass() {
        return classSet(
            'slds-listbox_selection-group avonni-chip-container__list-box_height'
        ).add({
            'avonni-chip-container__wrapper_is-collapsed': this.showMore
        });
    }

    /**
     * Get a unique key for li element.
     */
    get uniqueKey() {
        return generateUUID();
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Sets isExpanded to true on expand button click
     */
    handleMoreClick() {
        this._isExpanded = true;
    }

    /**
     * Setup the screen resize observer. That counts the number of wrapped chips.
     *
     * @returns {AvonniResizeObserver} Resize observer.
     */
    initWrapObserver() {
        const container = this.template.querySelector(
            '[data-element-id="chip-container-list"]'
        );
        if (!container || this._resizeObserver) {
            return;
        }
        this._resizeObserver = new AvonniResizeObserver(
            container,
            this.calculateWrappedNodes.bind(this)
        );
    }

    calculateWrappedNodes() {
        let wrappedChips = 0;
        const items = this.template.querySelectorAll(
            '[data-element-id="chip"]'
        );
        for (let i = 0; i < items.length; i++) {
            const node = items[i];
            node.hidden = false;
            if (node.offsetTop > 18) {
                wrappedChips += 1;
                node.hidden = true;
            }
        }
        this._wrappedChips = wrappedChips;
    }

    checkForMedia() {
        this.template.host.style.removeProperty(
            '--avonni-chip-line-height',
            '20px'
        );
        for (const item of this.items) {
            if (item.avatar || item.prefixIconName || item.suffixIconName) {
                this.template.host.style.setProperty(
                    '--avonni-chip-line-height',
                    '20px'
                );
                break;
            }
        }
    }
}
