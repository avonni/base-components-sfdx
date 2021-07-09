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

import { isInDom, WindowManager } from './util';

export class ElementProxy {
    constructor(el, id) {
        this.id = id;
        this.width = 0;
        this.height = 0;
        this.left = 0;
        this.top = 0;
        this.right = 0;
        this.bottom = 0;
        this._dirty = false;
        this._node = null;
        this._releaseCb = null;

        if (!el) {
            throw new Error('Element missing');
        }

        // W-3262919
        // for some reason I cannot figure out sometimes the
        // window, which clearly a window object, is not the window object
        // this will correct that. It might be related to locker
        if (WindowManager.isWindow(el)) {
            el = WindowManager.window;
        }

        this._node = el;
        this.setupObserver();
        this.refresh();
    }

    setupObserver() {
        // this check is because phantomjs does not support
        // mutation observers. The consqeuence here
        // is that any browser without mutation observers will
        // fail to update dimensions if they changwe after the proxy
        // is created and the proxy is not not refreshed
        if (WindowManager.MutationObserver && !this._node.isObserved) {
            // Use mutation observers to invalidate cache. It's magic!
            this._observer = new WindowManager.MutationObserver(
                this.refresh.bind(this)
            );

            // do not observe the window
            if (!WindowManager.isWindow(this._node)) {
                this._observer.observe(this._node, {
                    attributes: true,
                    childList: true,
                    characterData: true,
                    subtree: true
                });
                this._node.isObserved = true;
            }
        }
    }

    setReleaseCallback(cb, scope) {
        const scopeObj = scope || this;
        this._releaseCb = cb.bind(scopeObj);
    }

    refresh() {
        const w = WindowManager.window;

        if (!this.isDirty()) {
            let box, x, scrollTop, scrollLeft;

            if (typeof w.pageYOffset !== 'undefined') {
                scrollTop = w.pageYOffset;
                scrollLeft = w.pageXOffset;
            } else {
                scrollTop = w.scrollY;
                scrollLeft = w.scrollX;
            }

            if (!WindowManager.isWindow(this._node)) {
                // force paint
                // eslint-disable-next-line no-unused-vars
                const offsetHeight = this._node.offsetHeight;
                box = this._node.getBoundingClientRect();

                // not using integers causes weird rounding errors
                // eslint-disable-next-line guard-for-in
                for (x in box) {
                    this[x] = Math.floor(box[x]);
                }
                this.top = Math.floor(this.top + scrollTop);
                this.bottom = Math.floor(this.top + box.height);
                this.left = Math.floor(this.left + scrollLeft);
                this.right = Math.floor(this.left + box.width);
            } else {
                box = {};
                this.width = WindowManager.documentElement.clientWidth;
                this.height = WindowManager.documentElement.clientHeight;
                this.left = scrollLeft;
                this.top = scrollTop;
                this.right =
                    WindowManager.documentElement.clientWidth + scrollLeft;
                this.bottom = WindowManager.documentElement.clientHeight;
            }

            this._dirty = false;
        }
        return this._dirty;
    }

    getNode() {
        return this._node;
    }

    isDirty() {
        return this._dirty;
    }

    bake() {
        const w = WindowManager.window;
        const absPos = this._node.getBoundingClientRect();
        const style = w.getComputedStyle(this._node) || this._node.style;

        const hasPageOffset = typeof w.pageYOffset !== 'undefined';
        const scrollTop = hasPageOffset ? w.pageYOffset : w.scrollY;
        const scrollLeft = hasPageOffset ? w.pageXOffset : w.scrollX;

        const originalLeft = style.left.match(/auto|fixed/)
            ? '0'
            : parseInt(style.left.replace('px', ''), 10);
        const originalTop = style.top.match(/auto|fixed/)
            ? '0'
            : parseInt(style.top.replace('px', ''), 10);

        const leftDif = Math.round(this.left - (absPos.left + scrollLeft));
        const topDif = this.top - (absPos.top + scrollTop);

        this._node.style.left = `${originalLeft + leftDif}px`;
        this._node.style.top = `${originalTop + topDif}px`;

        if (this._restoreSize) {
            // Only store the first height/width which is the original height/width.
            if (this.originalHeight === undefined) {
                this.originalHeight = this._node.style.height;
            }
            if (this.originalWidth === undefined) {
                this.originalWidth = this._node.style.width;
            }

            this._node.style.width = `${this.width}px`;
            this._node.style.height = `${this.height}px`;
        }

        this._dirty = false;
    }

    setDirection(direction, val) {
        this[direction] = val;
        this._dirty = true;
        // if size is changed, should restore the original size.
        if (direction === 'height' || direction === 'width') {
            this._restoreSize = true;
        }
    }

    release() {
        if (this._restoreSize) {
            this._node.style.width = this.originalWidth;
            this._node.style.height = this.originalHeight;
            if (this._removeMinHeight) {
                this._node.style.minHeight = '';
            }
        }
        if (this._releaseCb) {
            this._releaseCb(this);
        }

        // Due to https://github.com/salesforce/lwc/pull/1423
        // require to call disconnect explicitly.
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
    }

    querySelectorAll(selector) {
        return this._node.querySelectorAll(selector);
    }
}
