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

// Cache for promises that import icon templates
const importPromises = {};
const iconTemplateCache = {};

export function hasIconLibrary(dir, category) {
    const cacheKey = makeCacheKey(dir, category);
    return !!iconTemplateCache[cacheKey];
}

export function getIconLibrary(dir, category) {
    const cacheKey = makeCacheKey(dir, category);
    return iconTemplateCache[cacheKey] || null;
}

export function fetchIconLibrary(dir, category) {
    const cacheKey = makeCacheKey(dir, category);

    // If icon template is being requested, return the cached promise
    if (importPromises[cacheKey]) {
        return importPromises[cacheKey];
    }

    const promise = fetchIconTemplate(dir, category);

    promise
        .then((tmpl) => {
            iconTemplateCache[cacheKey] = tmpl;
            delete importPromises[cacheKey];
        })
        .catch(() => {
            delete importPromises[cacheKey];
        });

    // Cache the promise to import
    importPromises[cacheKey] = promise;

    return promise;
}

function makeCacheKey(dir, category) {
    return `${category}${dir}`;
}

// eslint-disable-next-line @lwc/lwc/no-async-await
async function fetchIconTemplate(dir, category) {
    if (dir === 'rtl') {
        switch (category) {
            case 'utility': {
                // eslint-disable-next-line @lwc/lwc/no-async-await
                const { default: Lib } = await import(
                    'lightning/iconSvgTemplatesUtilityRtl'
                );
                return Lib;
            }
            case 'action': {
                // eslint-disable-next-line @lwc/lwc/no-async-await
                const { default: Lib } = await import(
                    'lightning/iconSvgTemplatesActionRtl'
                );
                return Lib;
            }
            case 'standard': {
                // eslint-disable-next-line @lwc/lwc/no-async-await
                const { default: Lib } = await import(
                    'lightning/iconSvgTemplatesStandardRtl'
                );
                return Lib;
            }
            case 'doctype': {
                // eslint-disable-next-line @lwc/lwc/no-async-await
                const { default: Lib } = await import(
                    'lightning/iconSvgTemplatesDoctypeRtl'
                );
                return Lib;
            }
            case 'custom': {
                // eslint-disable-next-line @lwc/lwc/no-async-await
                const { default: Lib } = await import(
                    'lightning/iconSvgTemplatesCustomRtl'
                );
                return Lib;
            }
            default:
                return null;
        }
    } else {
        switch (category) {
            case 'utility': {
                // eslint-disable-next-line @lwc/lwc/no-async-await
                const { default: Lib } = await import(
                    'lightning/iconSvgTemplatesUtility'
                );
                return Lib;
            }
            case 'action': {
                // eslint-disable-next-line @lwc/lwc/no-async-await
                const { default: Lib } = await import(
                    'lightning/iconSvgTemplatesAction'
                );
                return Lib;
            }
            case 'standard': {
                // eslint-disable-next-line @lwc/lwc/no-async-await
                const { default: Lib } = await import(
                    'lightning/iconSvgTemplatesStandard'
                );
                return Lib;
            }
            case 'doctype': {
                // eslint-disable-next-line @lwc/lwc/no-async-await
                const { default: Lib } = await import(
                    'lightning/iconSvgTemplatesDoctype'
                );
                return Lib;
            }
            case 'custom': {
                // eslint-disable-next-line @lwc/lwc/no-async-await
                const { default: Lib } = await import(
                    'lightning/iconSvgTemplatesCustom'
                );
                return Lib;
            }
            default:
                return null;
        }
    }
}
