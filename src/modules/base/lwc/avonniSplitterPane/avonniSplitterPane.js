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
import { normalizeBoolean } from 'c/utilsPrivate';

/**
 * @class
 * @descriptor avonni-splitter-pane
 * @storyId example-splitter--base
 * @public
 */
export default class AvonniSplitterPane extends LightningElement {
    _collapsed = false;
    _collapsedSize;
    _scrollable = false;
    _resizable = false;
    _collapsible = false;
    _max;
    _min;
    _size;

    startX;
    startY;
    startWidth;
    startHeight;

    connectedCallback() {
        if (this.max) {
            this.setAttribute('max', this.max);
        }

        if (this.min) {
            this.setAttribute('min', this.min);
        }

        if (this.size) {
            this.setAttribute('size', this.size);
        }

        if (this.collapsedSize) {
            this.setAttribute('collapsedSize', this.collapsedSize);
        }

        this.setAttribute('resizable', this._resizable);
        this.setAttribute('scrollable', this._scrollable);
        this.setAttribute('collapsed', this._collapsed);
        this.setAttribute('collapsible', this._collapsible);
    }

    renderedCallback() {
        let slotElements = this.template
            .querySelector('[data-element-id="slot-default"]')
            .assignedElements();

        if (slotElements.length > 0) {
            slotElements.forEach((element) => {
                if (element.localName.indexOf('-splitter') > -1) {
                    element.classList.add('horizontal');
                } else {
                    element.classList.add('vertical');
                }
            });
        }
    }

    /**
     * Specifies whether a pane is initially collapsed (true) or expanded (false).
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get collapsed() {
        return this._collapsed;
    }

    set collapsed(value) {
        this._collapsed = normalizeBoolean(value);
        this.setAttribute('collapsed', this._collapsed);
    }

    /**
     * Specifies the size of a collapsible pane when collapsed, defined as pixels (i.e. "200px") or as a percentage (i.e. "50%").
     *
     * @type {string}
     * @public
     */
    @api
    get collapsedSize() {
        return this._collapsedSize;
    }

    set collapsedSize(value) {
        this._collapsedSize = value;
        this.setAttribute('collapsedSize', this._collapsedSize);
    }

    /**
     * Specifies whether a pane is scrollable (true) or not scrollable (false).
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get scrollable() {
        return this._scrollable;
    }

    set scrollable(value) {
        this._scrollable = normalizeBoolean(value);
        this.setAttribute('scrollable', this._scrollable);
    }

    /**
     * Specifies whether a pane is collapsible (true) or not collapsible (false).
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get collapsible() {
        return this._collapsible;
    }

    set collapsible(value) {
        this._collapsible = normalizeBoolean(value);
        this.setAttribute('collapsible', this._collapsible);
    }

    /**
     * Specifies if the user is allowed to resize the pane and provide space for other panes.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get resizable() {
        return this._resizable;
    }

    set resizable(value) {
        this._resizable = normalizeBoolean(value);
        this.setAttribute('resizable', this._resizable);
    }

    /**
     * Specifies the maximum size of a pane defined as pixels (i.e. "200px") or as a percentage (i.e. "50%").
     *
     * @type {string}
     * @public
     */
    @api
    get max() {
        return this._max;
    }

    set max(value) {
        this._max = value;
        this.setAttribute('max', this._max);
    }

    /**
     * Specifies the minimum size of a pane defined as pixels (i.e. "200px") or as a percentage (i.e. "50%").
     *
     * @type {string}
     * @public
     */
    @api
    get min() {
        return this._min;
    }

    set min(value) {
        this._min = value;
        this.setAttribute('min', this._min);
    }

    /**
     * Specifies the size of a pane defined as pixels (i.e. "200px") or as a percentage (i.e. "50%").
     *
     * @type {string}
     * @public
     */
    @api
    get size() {
        return this._size;
    }

    set size(value) {
        this._size = value;
        this.setAttribute('size', this._size);
    }
}
