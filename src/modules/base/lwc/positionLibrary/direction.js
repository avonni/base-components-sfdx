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

import { normalizeString } from 'c/utilsPrivate';
import { WindowManager } from './util';

// TODO: Remove, not currently in use.
const ALIGN_REGEX = /^(left|right|center)\s(top|bottom|center)$/;

export const Direction = {
    Center: 'center',
    Middle: 'middle',
    Right: 'right',
    Left: 'left',
    Bottom: 'bottom',
    Top: 'top',
    Default: 'default'
};

const VerticalMap = {
    top: Direction.Top,
    bottom: Direction.Bottom,
    center: Direction.Middle
};

const HorizontalMap = {
    left: Direction.Left,
    right: Direction.Right,
    center: Direction.Center
};

const FlipMap = {
    left: Direction.Right,
    right: Direction.Left,
    top: Direction.Bottom,
    bottom: Direction.Top,
    center: Direction.Center,
    default: Direction.Right
};

function getContainerSize(parent) {
    if (parent) {
        return parent.getBoundingClientRect();
    }

    const rect = {
        width:
            WindowManager.window.innerWidth || document.body.clientWidth || 0,
        height:
            WindowManager.window.innerHeight || document.body.clientHeight || 0,
        top: 0,
        left: 0
    };

    rect.bottom = rect.height;
    rect.right = rect.width;
    return rect;
}

export function normalizeDirection(direction, defaultValue) {
    return normalizeString(direction, {
        fallbackValue: defaultValue || Direction.Default,
        validValues: [
            Direction.Center,
            Direction.Right,
            Direction.Left,
            Direction.Bottom,
            Direction.Top,
            Direction.Middle,
            Direction.Default
        ]
    });
}

export function mapToHorizontal(value) {
    value = normalizeDirection(value, Direction.Left);
    return HorizontalMap[value];
}

export function mapToVertical(value) {
    value = normalizeDirection(value, Direction.Left);
    return VerticalMap[value];
}

export function flipDirection(value) {
    value = normalizeDirection(value, Direction.Left);
    return FlipMap[value];
}

// TODO: Remove, not currently in use.
export function isValidDirection(value) {
    return value && value.match(ALIGN_REGEX);
}

export function checkFlipPossibility(parent, element, target, leftAsBoundary) {
    const viewPort = getContainerSize(parent);
    const elemRect = element.getBoundingClientRect();
    const referenceElemRect = target.getBoundingClientRect();
    const height =
        typeof elemRect.height !== 'undefined'
            ? elemRect.height
            : elemRect.bottom - elemRect.top;
    const width =
        typeof elemRect.width !== 'undefined'
            ? elemRect.width
            : elemRect.right - elemRect.left;

    // TODO: We'll need to revisit the leftAsBoundary config property. Either we'll need a better
    // name to cover the RTL language cases and maybe open up the possibility of bounding the
    // element to the target in both the horizontal and vertical directions.

    // The boundary shrinks the available area to the edge of the target rather than the viewport.
    let rightAsBoundary = false;
    if (document.dir === 'rtl') {
        rightAsBoundary = leftAsBoundary;
        leftAsBoundary = false;
    }

    // Bug Fix for https://gus.lightning.force.com/lightning/r/ADM_Work__c/a07B0000008DxOhIAK/view
    // If viewport is scrollableParent, then should count the top of scrollerParent,
    // otherwise, window top is 0. no change to original logic.
    // When used in console app, console's viewport is not window, but a scrollable div, then popup can be cut off easily.
    // scrollable parent => if any parent element set overflow-y:auto, then inner element won't popup, unless use position:fix.
    const aboveSpace = referenceElemRect.top - viewPort.top - height;
    const belowSpace = viewPort.height - referenceElemRect.bottom - height;

    // If there is scrollable parent, always check aboveSpace > 0
    const hasSpaceAbove =
        aboveSpace >= 0 ||
        (parent == null && belowSpace < 0 && aboveSpace > belowSpace);
    const hasSpaceBelow =
        belowSpace >= 0 || (aboveSpace < 0 && belowSpace > aboveSpace);

    // Assuming left alignment is specified this tests if:
    // - there's room to accommodate the element with right alignment
    // - there's not enough room to accommodate the element with left alignment
    const shouldAlignToRight =
        referenceElemRect.right >= width &&
        referenceElemRect.left + width >
            (rightAsBoundary ? referenceElemRect.right : viewPort.width);

    // Assuming right alignment is specified this tests if:
    // - there's room to accommodate the element with left alignment
    // - there's not enough room to accommodate the element with right alignment
    const shouldAlignToLeft =
        referenceElemRect.left + width <= viewPort.width &&
        referenceElemRect.right - width <
            (leftAsBoundary ? referenceElemRect.left : 0);

    // Assuming center alignment, does the viewport have space to fit half of the element around
    // the target?
    const centerOverflow = {
        left: referenceElemRect.left - width * 0.5 < 0,
        right: referenceElemRect.right + width * 0.5 > viewPort.width,
        top: referenceElemRect.top - height * 0.5 < 0,
        bottom: referenceElemRect.bottom + height * 0.5 > viewPort.height
    };

    return {
        shouldAlignToLeft,
        shouldAlignToRight,
        hasSpaceAbove,
        hasSpaceBelow,
        centerOverflow
    };
}
