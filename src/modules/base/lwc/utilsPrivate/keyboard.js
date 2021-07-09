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

export const keyCodes = {
    tab: 9,
    backspace: 8,
    enter: 13,
    escape: 27,
    space: 32,
    pageup: 33,
    pagedown: 34,
    end: 35,
    home: 36,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    delete: 46,
    shift: 16
};

export function normalizeKeyValue(value) {
    switch (value) {
        case 'Spacebar':
            return ' ';
        case 'Esc':
            return 'Escape';
        case 'Del':
            return 'Delete';
        case 'Left':
            return 'ArrowLeft';
        case 'Right':
            return 'ArrowRight';
        case 'Down':
            return 'ArrowDown';
        case 'Up':
            return 'ArrowUp';
        default:
            return value;
    }
}

const buffer = {};

export function isShiftMetaOrControlKey(event) {
    return event.shiftKey || event.metaKey || event.ctrlKey;
}

export function runActionOnBufferedTypedCharacters(event, action) {
    const letter = event.key;

    if (letter.length > 1) {
        return;
    }

    if (buffer._clearBufferId) {
        clearTimeout(buffer._clearBufferId);
    }

    buffer._keyBuffer = buffer._keyBuffer || [];
    buffer._keyBuffer.push(letter);

    const matchText = buffer._keyBuffer.join('').toLowerCase();

    action(matchText);

    // eslint-disable-next-line @lwc/lwc/no-async-operation
    buffer._clearBufferId = setTimeout(() => {
        buffer._keyBuffer = [];
    }, 700);
}
