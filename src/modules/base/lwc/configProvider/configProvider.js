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

import { getDefaultConfig } from './defaultConfig';

// Closure to hold the APIs if and when available
let configProvided = false;
const { assign, freeze } = Object;
let PROVIDED_IMPL = getDefaultConfig();

function resolveServiceApiProps(serviceAPI = {}) {
    const serviceApiMap = {
        getPathPrefix: serviceAPI.getPathPrefix,
        getToken: serviceAPI.getToken,
        getLocalizationService: serviceAPI.getLocalizationService,
        iconSvgTemplates: serviceAPI.iconSvgTemplates,
        getOneConfig:
            serviceAPI.getInitializer && serviceAPI.getInitializer('oneConfig')
    };
    return Object.keys(serviceApiMap).reduce((seed, prop) => {
        if (serviceApiMap[prop] !== undefined) {
            seed[prop] = serviceApiMap[prop];
        }
        return seed;
    }, {});
}

export default function configProviderService(serviceAPI) {
    if (!configProvided) {
        PROVIDED_IMPL = freeze(
            assign({}, PROVIDED_IMPL, resolveServiceApiProps(serviceAPI))
        );
        configProvided = true;
    } else {
        throw new Error(
            'ConfigProvider can only be set once at initilization time'
        );
    }

    return { name: 'lightning-config-provider' };
}

export function getPathPrefix() {
    return (
        (PROVIDED_IMPL &&
            PROVIDED_IMPL.getPathPrefix &&
            PROVIDED_IMPL.getPathPrefix()) ||
        ''
    );
}

export function getToken(name) {
    return (
        PROVIDED_IMPL && PROVIDED_IMPL.getToken && PROVIDED_IMPL.getToken(name)
    );
}

export function getLocalizationService() {
    return (
        PROVIDED_IMPL &&
        PROVIDED_IMPL.getLocalizationService &&
        PROVIDED_IMPL.getLocalizationService()
    );
}

export function getIconSvgTemplates() {
    return PROVIDED_IMPL && PROVIDED_IMPL.iconSvgTemplates;
}

export function getOneConfig() {
    return (
        (PROVIDED_IMPL && PROVIDED_IMPL.getOneConfig) || {
            densitySetting: ''
        }
    );
}
