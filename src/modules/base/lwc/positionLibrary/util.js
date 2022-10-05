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

export const POSITION_ATTR_NAME = 'data-position-id';

class BrowserWindow {
    get window() {
        if (!this._window) {
            this._window = window;

            // JTEST/Ingtegration: getComputedStyle may be null
            if (!this.window.getComputedStyle) {
                this.window.getComputedStyle = (node) => {
                    return node.style;
                };
            }
        }
        return this._window;
    }
    mockWindow(value) {
        // For test, allow mock window.
        this._window = value;
    }
    get documentElement() {
        if (!this.window.document) {
            throw new Error('Missing window.document');
        }
        return this.window.document.documentElement;
    }

    get MutationObserver() {
        return this.window.MutationObserver;
    }

    isWindow(element) {
        return element && element.toString() === '[object Window]';
    }
}

export const WindowManager = new BrowserWindow();

export function isShadowRoot(node) {
    return node && node.nodeType === 11;
}

function enumerateParent(elem, stopEl, checker) {
    // document.body is not necessarily a body tag, because of the (very rare)
    // case of a frameset.
    if (!elem || elem === stopEl || elem === document.body) {
        return null;
    }
    // if overflow is auto and overflow-y is also auto,
    // however in firefox the opposite is not true
    try {
        // getComputedStyle throws an exception
        // if elem is not an element
        // (can happen during unrender)
        const computedStyle = WindowManager.window.getComputedStyle(elem);

        if (!computedStyle) {
            return null;
        }

        if (checker(computedStyle)) {
            return elem;
        }

        return enumerateParent(
            isShadowRoot(elem.parentNode)
                ? elem.parentNode.host
                : elem.parentNode,
            stopEl,
            checker
        );
    } catch (e) {
        return null;
    }
}

export function getScrollableParent(elem, stopEl) {
    return enumerateParent(elem, stopEl, (computedStyle) => {
        const overflow = computedStyle['overflow-y'];
        return overflow === 'auto' || overflow === 'scroll';
    });
}

export function getScrollableParentFromEventPath(eventPath) {
    var computedStyle;
    var overflow;
    for (let i = 0; i < eventPath.length; i++) {
        let element = eventPath[i];
        if (element instanceof HTMLElement) {
            computedStyle = WindowManager.window.getComputedStyle(element);
            overflow = computedStyle['overflow-y'];
            if (overflow === 'auto' || overflow === 'scroll') {
                return element;
            }
        }
    }
    return null;
}

function queryOverflowHiddenParent(elem, stopEl) {
    return enumerateParent(elem, stopEl, (computedStyle) => {
        return (
            computedStyle['overflow-x'] === 'hidden' ||
            computedStyle['overflow-y'] === 'hidden'
        );
    });
}

export function isInDom(el) {
    if (el === WindowManager.window) {
        return true;
    }

    if (
        !isShadowRoot(el.parentNode) &&
        el.parentNode &&
        el.parentNode.tagName &&
        el.parentNode.tagName.toUpperCase() === 'BODY'
    ) {
        return true;
    }

    if (isShadowRoot(el.parentNode) && el.parentNode.host) {
        return isInDom(el.parentNode.host);
    }

    if (el.parentNode) {
        return isInDom(el.parentNode);
    }
    return false;
}

export function isScrolling(elem) {
    return elem.scrollHeight > elem.clientHeight;
}

export function isDomNode(obj) {
    return obj.nodeType && (obj.nodeType === 1 || obj.nodeType === 11);
}

export function computeAbsPos(target) {
    const val = {
        top: target.offsetTop,
        left: target.offsetLeft
    };

    if (target.offsetParent) {
        const val2 = computeAbsPos(target.offsetParent);
        val.top += val2.top;
        val.left += val2.left;
    }
    return val;
}

export function timeout(time) {
    return new Promise((resolve) => {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            resolve();
        }, time);
    });
}

export function containsScrollingElement(list) {
    const len = list.length;
    if (!len) {
        return false;
    }

    for (let i = 0; i < len; i++) {
        if (isScrolling(list[i])) {
            return true;
        }
    }
    return false;
}

export function queryScrollableChildren(element) {
    return element.querySelectorAll('[data-scoped-scroll="true"]');
}

export function getPositionTarget(element) {
    return element.tagName === 'TEXTAREA'
        ? isShadowRoot(element.parentNode)
            ? element.parentNode.host
            : element.parentNode
        : element;
}

let lastId = 1000000;
export function generateUniqueSelector() {
    return `lgcp-${lastId++}`;
}

export function normalizeElement(element) {
    const selector = generateUniqueSelector();
    element.setAttribute(POSITION_ATTR_NAME, selector);
    element =
        // eslint-disable-next-line @lwc/lwc/no-document-query
        document.querySelector(`[${POSITION_ATTR_NAME}="${selector}"]`) ||
        element;
    return element;
}

export function normalizePosition(
    element,
    overlay,
    nextIndex,
    target,
    alignWidth
) {
    // Set element position to fixed
    // 1. element is inside overlay
    // or 2. When element isn't align with target's width, and target's parent has overflow-x:hidden setting.
    const isFixed =
        overlay.isInside ||
        (!alignWidth &&
            queryOverflowHiddenParent(target, WindowManager.window, true));
    element.style.position = isFixed ? 'fixed' : 'absolute';
    element.style.zIndex = nextIndex || 0;

    // W-8042285 For RTL, left is positive value instead of negative.
    element.style.left = '99999px'; // Avoid flicker
    // we always position from the left, but in RTL mode Omakase swaps left and right properties.
    // To always allow positioning from the left we set right to auto so position library can do its work.
    element.style.right = 'auto';
    element.style.top = '0px'; // Avoid flicker

    return {
        element,
        overlay
    };
}

export function requestAnimationFrameAsPromise() {
    return new Promise((resolve) => {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        requestAnimationFrame(() => resolve());
    });
}
