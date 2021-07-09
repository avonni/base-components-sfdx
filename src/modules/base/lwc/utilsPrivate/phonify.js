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

//import locale from '@salesforce/i18n/locale';

const locale = 'US';
const NA_PHONE_NUMBER = '($1) $2-$3';
const IS_TEN_DIGITS = /^\d{10}$/;
const TEN_TO_NA = /(\d{3})(\d{3})(\d{4})/;
const IS_ELEVEN_DIGITS = /^1\d{10}/;
const ELEVEN_TO_NA = /1(\d{3})(\d{3})(\d{4})$/;

export function toNorthAmericanPhoneNumber(value, userLocale) {
    if (!isNorthAmericanCountry(userLocale || locale)) {
        return value;
    }
    if (IS_TEN_DIGITS.test(value)) {
        return value.replace(TEN_TO_NA, NA_PHONE_NUMBER);
    } else if (IS_ELEVEN_DIGITS.test(value)) {
        return value.replace(ELEVEN_TO_NA, NA_PHONE_NUMBER);
    }
    return value || '';
}

function isNorthAmericanCountry(userLocale) {
    const localeCountry = getLocaleCountry(userLocale);
    if (localeCountry === 'US' || localeCountry === 'CA') {
        return true;
    }
    return false;
}

function getLocaleCountry(userLocale) {
    if (!userLocale) {
        return null;
    }
    const [, country] = userLocale.split('-');
    return country;
}
