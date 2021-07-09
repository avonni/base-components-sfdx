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

import fetchSvg from './fetchSvg';
import supportsSvg from './supportsSvg';

const svgTagName = /svg/i;
const isSvgElement = (el) => el && svgTagName.test(el.nodeName);

const requestCache = {};
const symbolEls = {};
const svgFragments = {};

const spritesContainerId = 'slds-svg-sprites';
let spritesEl;

export function polyfill(el) {
    if (!supportsSvg && isSvgElement(el)) {
        if (!spritesEl) {
            spritesEl = document.createElement('svg');
            spritesEl.xmlns = 'http://www.w3.org/2000/svg';
            spritesEl['xmlns:xlink'] = 'http://www.w3.org/1999/xlink';
            spritesEl.style.display = 'none';
            spritesEl.id = spritesContainerId;

            document.body.insertBefore(spritesEl, document.body.childNodes[0]);
        }

        Array.from(el.getElementsByTagName('use')).forEach((use) => {
            const src =
                use.getAttribute('xlink:href') || use.getAttribute('href');

            if (src) {
                const parts = src.split('#');
                const url = parts[0];
                const id = parts[1];
                const namespace = url.replace(/[^\w]/g, '-');
                const href = `#${namespace}-${id}`;

                if (url.length) {
                    if (use.getAttribute('xlink:href')) {
                        use.setAttribute('xlink:href', href);
                    } else {
                        use.setAttribute('href', href);
                    }

                    if (!requestCache[url]) {
                        requestCache[url] = fetchSvg(url);
                    }

                    requestCache[url].then((svgContent) => {
                        if (!svgFragments[url]) {
                            const svgFragment = document
                                .createRange()
                                .createContextualFragment(svgContent);

                            svgFragments[url] = svgFragment;
                        }
                        if (!symbolEls[href]) {
                            const svgFragment = svgFragments[url];
                            const symbolEl = svgFragment.querySelector(
                                `#${id}`
                            );

                            symbolEls[href] = true;
                            symbolEl.id = `${namespace}-${id}`;
                            spritesEl.appendChild(symbolEl);
                        }
                    });
                }
            }
        });
    }
}
