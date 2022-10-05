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

import { ElementProxy } from './elementProxy';
import { WindowManager, POSITION_ATTR_NAME } from './util';

class ProxyCache {
    proxyCache = {};

    get count() {
        return Object.keys(this.proxyCache).length;
    }

    bakeOff() {
        for (const proxy in this.proxyCache) {
            if (this.proxyCache[proxy].el.isDirty()) {
                this.proxyCache[proxy].el.bake();
            }
        }
    }
    getReferenceCount(proxy) {
        const id = proxy.id;
        if (!id || !this.proxyCache[id]) {
            return 0;
        }
        return this.proxyCache[id].refCount;
    }

    release(proxy) {
        const proxyInstance = this.proxyCache[proxy.id];
        if (proxyInstance) {
            --proxyInstance.refCount;
        }
        if (proxyInstance && proxyInstance.refCount <= 0) {
            delete this.proxyCache[proxy.id];
        }
    }

    reset() {
        this.proxyCache = {};
    }

    create(element) {
        let key = 'window';
        if (!WindowManager.isWindow(element)) {
            key = element ? element.getAttribute(POSITION_ATTR_NAME) : null;
            // 1 - Node.ELEMENT_NODE, 11 - Node.DOCUMENT_FRAGMENT_NODE
            if (
                !key ||
                !element.nodeType ||
                !(element.nodeType !== 1 || element.nodeType !== 11)
            ) {
                throw new Error(
                    `Element Proxy requires an element and has property ${POSITION_ATTR_NAME}`
                );
            }
        }

        if (this.proxyCache[key]) {
            this.proxyCache[key].refCount++;
            return this.proxyCache[key].el;
        }

        const newProxy = new ElementProxy(element, key);
        newProxy.setReleaseCallback(release, newProxy);

        this.proxyCache[key] = {
            el: newProxy,
            refCount: 1
        };

        return this.proxyCache[key].el;
    }
}

const elementProxyCache = new ProxyCache();

export function bakeOff() {
    elementProxyCache.bakeOff();
}

export function getReferenceCount(proxy) {
    return elementProxyCache.getReferenceCount(proxy);
}

export function release(proxy) {
    return elementProxyCache.release(proxy);
}

export function reset() {
    elementProxyCache.reset();
}

export function createProxy(element) {
    return elementProxyCache.create(element);
}

export function count() {
    return elementProxyCache.count;
}
