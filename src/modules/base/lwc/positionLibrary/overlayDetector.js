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

import { isShadowRoot } from './util';

export const OVERLAY_TYPE = {
    NONE: 'none',
    MODAL: 'uiModal',
    DIALOG: 'lightning-dialog',
    POPOVER: 'lightning-popover',
    PANEL: 'uiPanel'
};

export function isOverlay(element) {
    const isDialog = element.localName === OVERLAY_TYPE.DIALOG;
    if (isDialog) {
        return OVERLAY_TYPE.DIALOG;
    }

    const isPopover = element.localName === OVERLAY_TYPE.POPOVER;
    if (isPopover) {
        return OVERLAY_TYPE.POPOVER;
    }

    const isModal =
        element.classList && element.classList.contains(OVERLAY_TYPE.MODAL);
    if (isModal) {
        return OVERLAY_TYPE.MODAL;
    }

    const isPanel =
        element.classList && element.classList.contains(OVERLAY_TYPE.PANEL);
    if (isPanel) {
        return OVERLAY_TYPE.PANEL;
    }
    return OVERLAY_TYPE.NONE;
}

function isInsideOverlay(element) {
    if (!element) {
        return {
            isInside: false,
            type: null,
            overlay: null
        };
    }

    const type = isOverlay(element);

    if (type !== OVERLAY_TYPE.NONE) {
        return {
            isInside: true,
            type,
            overlay: element
        };
    }

    if (!element.parentNode) {
        return {
            isInside: false,
            type: null,
            overlay: null
        };
    }

    return isInsideOverlay(
        isShadowRoot(element.parentNode)
            ? element.parentNode.host
            : element.parentNode
    );
}

export class OverlayDetector {
    constructor(element) {
        this._element = element;
        this._detection = isInsideOverlay(this._element) || {
            isInside: false,
            overlay: null
        };
    }

    get isInsideModal() {
        return (
            this.isInside &&
            (this._detection.type === OVERLAY_TYPE.MODAL ||
                this._detection.type === OVERLAY_TYPE.DIALOG)
        );
    }

    get isInside() {
        return this._detection.isInside;
    }

    get overlay() {
        return this._detection.overlay;
    }
}
