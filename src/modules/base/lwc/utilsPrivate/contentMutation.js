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

import { guid } from './guid';
import { smartSetAttribute } from './smartSetAttribute';

const CONTENT_SEPARATOR = '\n';

function getAttr(elm, attr) {
    if (elm.tagName.match(/lightning/i)) {
        return elm[attr];
    }
    return elm.getAttribute(attr);
}

function extractElements(root, selector) {
    if (typeof selector !== 'string' || selector === '') {
        return [];
    }
    return [].slice.call(root.querySelectorAll(selector));
}

function extractContent(elements) {
    return elements
        .map((element) => element.textContent)
        .filter((text) => text.length)
        .join(CONTENT_SEPARATOR);
}

function splitIds(ids) {
    return (ids + '').trim().split(/\s+/);
}

function hashIds(ids) {
    return (ids + '')
        .trim()
        .split(/\s+/)
        .reduce((r, v) => {
            r[v] = 1;
            return r;
        }, {});
}

function addAriaRefWhenNeeded(elm, attrName, computedIds) {
    const newIds = splitIds(computedIds);
    const oldIds = getAttr(elm, attrName) || '';
    const oldIdsHash = hashIds(oldIds);
    const suffix = [];
    for (let i = 0; i < newIds.length; i += 1) {
        if (!oldIdsHash[newIds[i]]) {
            suffix.push(newIds[i]);
        }
    }

    if (suffix.length !== 0) {
        smartSetAttribute(
            elm,
            attrName,
            oldIds + (oldIds.length === 0 ? '' : ' ') + suffix.join(' ')
        );
    }
}

function removeAriaRefWhenPossible(elm, attrName, computedIds) {
    const newIds = splitIds(computedIds);
    const oldIds = getAttr(elm, attrName) || '';
    const oldIdsHash = hashIds(oldIds);
    const newValues = [];
    for (let i = 0; i < newIds.length; i += 1) {
        if (!oldIdsHash[newIds[i]]) {
            newValues.push(newIds[i]);
        }
    }
    smartSetAttribute(elm, attrName, newValues.join(' '));
}

export class ContentMutation {
    constructor(component) {
        this.template = component.template;
        this.isNative = this.template.constructor
            .toString()
            .match(/\[native code\]/);
        this.state = {};
        this.liveIds = {};
        this.guid = guid();
    }

    connectLiveIdRef(refs, callback) {
        const selector = (refs + '')
            .trim()
            .split(/\s+/)
            .map((ref) => `[id*="${ref}"]`)
            .join(',');
        const liveId = { selector, callback };
        this.liveIds[refs] = liveId;
    }

    link(innerSelector, attrName, ids, placeholderContainerSelector) {
        let attrState = this.state[attrName];
        if (attrState) {
            if (!this.isNative) {
                const elm = this.template.querySelector(innerSelector);
                if (elm) {
                    removeAriaRefWhenPossible(elm, attrName, attrState.ids);
                }
                attrState.ids = ids;
            }
        } else {
            attrState = this.state[attrName] = {
                ids,
                innerSelector,
                placeholderContainerSelector
            };
        }
        if (this.isNative) {
            attrState.outerSelector = (ids + '')
                .trim()
                .split(/\s+/)
                .map((ref) => `#${ref}`)
                .join(',');
            attrState.placeholder = document.createElement('span');
            attrState.placeholder.id = `auto-link-${attrName}-${this.guid}`;
        }
        if (this.template.host.parentNode) {
            this.privateUpdate(attrName);
        }
    }

    sync() {
        if (!this.template.host.parentNode) {
            throw new Error(
                `Invalid sync invocation. It can only be invoked during renderedCallback().`
            );
        }
        if (this.isNative && !this.mo) {
            this.privateConnect();
        }
        for (const attrName in this.state) {
            if (Object.prototype.hasOwnProperty.call(this.state, attrName)) {
                this.privateUpdate(attrName);
            }
        }

        if (!this.isNative) {
            this.privateUpdateLiveIds();
        }
    }

    privateExtractIds(elements) {
        return elements
            .map((el) => {
                return el.getAttribute('id');
            })
            .join(' ');
    }

    privateUpdateLiveIds() {
        const root = this.template.host.getRootNode();

        if (!root) {
            return;
        }
        for (const liveId in this.liveIds) {
            if (Object.prototype.hasOwnProperty.call(this.liveIds, liveId)) {
                const thisId = this.liveIds[liveId];
                if (!thisId.elements) {
                    thisId.elements = Array.prototype.slice.call(
                        root.querySelectorAll(thisId.selector)
                    );
                }
                const newIds = this.privateExtractIds(thisId.elements);

                if (newIds !== thisId.ids) {
                    thisId.callback(newIds);
                    thisId.ids = newIds;
                }
            }
        }
    }

    privateUpdate(attrName) {
        const { innerSelector } = this.state[attrName];
        const elm = this.template.querySelector(innerSelector);
        if (!elm) {
            return;
        }
        let computedIds;
        if (this.isNative) {
            const {
                outerSelector,
                content,
                placeholder,
                placeholderContainerSelector
            } = this.state[attrName];
            const newContent = extractContent(
                extractElements(this.root, outerSelector)
            );

            if (content !== newContent) {
                this.state[
                    attrName
                ].content = placeholder.textContent = newContent;
            }
            if (!placeholder.parentNode) {
                const container = this.template.querySelector(
                    placeholderContainerSelector
                );

                if (container) {
                    container.appendChild(placeholder);
                }
            }
            computedIds = placeholder.id;
        } else {
            computedIds = this.state[attrName].ids;
        }
        addAriaRefWhenNeeded(elm, attrName, computedIds);
    }

    privateConnect() {
        this.root = this.template.host.getRootNode();

        const mo = new MutationObserver(() => {
            if (!this.template.host.parentNode) {
                return;
            }
            this.sync();
        });
        mo.observe(this.root, {
            characterData: true,
            childList: true,
            subtree: true
        });
    }
}
