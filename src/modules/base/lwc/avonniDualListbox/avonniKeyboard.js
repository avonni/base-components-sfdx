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

import { keyCodes } from 'c/utilsPrivate';

function preventDefaultAndStopPropagation(event) {
    event.preventDefault();
    event.stopPropagation();
}

function setFocusOnNextOption(option, moveUp, intf) {
    const index = parseInt(option.getAttribute('data-index'), 10);
    const i = index + (moveUp ? -1 : 1);
    const options = intf.getElementsOfList(option.getAttribute('data-type'));
    const next = options[i];
    if (next) {
        next.focus();
    }
}

function selectNextOption(option, moveUp, intf) {
    const selected = option.getAttribute('aria-selected') === 'true';
    const index = parseInt(option.getAttribute('data-index'), 10);
    const i = index + (selected ? (moveUp ? -1 : 1) : 0);
    const options = intf.getElementsOfList(option.getAttribute('data-type'));
    const next = options[i];
    if (next) {
        intf.updateSelectedOptions(next, true, false);
    }
}

function selectNextOptionFromShift(option, moveUp, isMultiple, intf) {
    const curr = parseInt(option.getAttribute('data-index'), 10);
    if (intf.getShiftIndex() < 0) {
        intf.setShiftIndex(curr);
        intf.setLastShift(moveUp);
    }
    const next = curr + (intf.getLastShift() !== moveUp ? 0 : moveUp ? -1 : 1);
    const pos = next < intf.getShiftIndex();
    const shiftAdd = pos === moveUp || intf.getShiftIndex() === next;
    const options = intf.getElementsOfList(option.getAttribute('data-type'));
    const nextOption = options[next];
    if (nextOption) {
        intf.updateSelectedOptions(nextOption, shiftAdd, true);
        intf.setLastShift(moveUp);
    }
}

export function handleKeyDownOnOption(event, keyboardInterface) {
    if (event.metaKey || event.ctrlKey) {
        keyboardInterface.setShiftIndex(-1);
        const keyCodesA = 'A'.charCodeAt(0);
        const selected = event.target.getAttribute('aria-selected') === 'true';
        switch (event.keyCode) {
            case keyCodes.up:
                preventDefaultAndStopPropagation(event);
                setFocusOnNextOption(event.target, true, keyboardInterface);
                break;
            case keyCodes.down:
                preventDefaultAndStopPropagation(event);
                setFocusOnNextOption(event.target, false, keyboardInterface);
                break;
            case keyCodes.right:
                preventDefaultAndStopPropagation(event);
                keyboardInterface.moveOptionsBetweenLists(true);
                break;
            case keyCodes.left:
                preventDefaultAndStopPropagation(event);
                keyboardInterface.moveOptionsBetweenLists(false);
                break;
            case keyCodes.space:
                preventDefaultAndStopPropagation(event);
                keyboardInterface.updateSelectedOptions(
                    event.target,
                    !selected,
                    true
                );
                break;
            case keyCodesA:
                preventDefaultAndStopPropagation(event);
                keyboardInterface.selectAllOptions(event.target);
                break;
            default:
            // do nothing
        }
    } else if (event.shiftKey) {
        switch (event.keyCode) {
            case keyCodes.up:
                preventDefaultAndStopPropagation(event);
                selectNextOptionFromShift(
                    event.target,
                    true,
                    true,
                    keyboardInterface
                );
                break;
            case keyCodes.down:
                preventDefaultAndStopPropagation(event);
                selectNextOptionFromShift(
                    event.target,
                    false,
                    true,
                    keyboardInterface
                );
                break;
            default:
            // do nothing
        }
    } else {
        keyboardInterface.setShiftIndex(-1);
        switch (event.keyCode) {
            case keyCodes.up:
                preventDefaultAndStopPropagation(event);
                selectNextOption(event.target, true, keyboardInterface);
                break;
            case keyCodes.down:
                preventDefaultAndStopPropagation(event);
                selectNextOption(event.target, false, keyboardInterface);
                break;
            default:
            // do nothing
        }
    }
}
