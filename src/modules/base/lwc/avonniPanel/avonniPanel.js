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

import { LightningElement, api } from 'lwc';
import { normalizeString, normalizeBoolean } from 'c/utilsPrivate';
import { classSet } from 'c/utils';

const PANEL_POSITIONS = { valid: ['right', 'left'], default: 'right' };

const PANEL_SIZES = {
    valid: ['small', 'medium', 'large', 'x-large', 'full'],
    default: 'medium'
};

/**
 * @class
 * @descriptor avonni-panel
 * @storyId example-panel--base
 * @public
 */
export default class AvonniPagination extends LightningElement {
    /**
     * The title can include text, and is displayed in the panel header. To include additional markup or another component, use the title slot.
     *
     * @type {string}
     * @public
     */
    @api title;

    _position = PANEL_POSITIONS.default;
    _size = PANEL_SIZES.default;
    _showPanel = false;
    _isRight = true;

    showTitleSlot = true;
    showPanelBodySlot = true;

    renderedCallback() {
        if (this.titleSlot) {
            this.showTitleSlot = this.titleSlot.assignedElements().length !== 0;
        }

        if (this.panelBodySlot) {
            this.showPanelBodySlot =
                this.panelBodySlot.assignedElements().length !== 0;
        }
    }

    /**
     * Get title slot DOM element.
     *
     * @type {Element}
     */
    get titleSlot() {
        return this.template.querySelector('slot[name=title]');
    }

    /**
     * Get Panel body slot DOM element.
     *
     * @type {Element}
     */
    get panelBodySlot() {
        return this.template.querySelector('slot[name=panel-body]');
    }

    /**
     * Position of the panel. Valid values include left and right.
     *
     * @type {string}
     * @public
     * @default right
     */
    @api
    get position() {
        return this._position;
    }

    set position(position) {
        this._position = normalizeString(position, {
            fallbackValue: PANEL_POSITIONS.default,
            validValues: PANEL_POSITIONS.valid
        });
    }

    /**
     * It defines the width of the panel. Valid values include small, medium, large, x-large and full.
     *
     * @type {string}
     * @public
     * @default medium
     */
    @api
    get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: PANEL_SIZES.default,
            validValues: PANEL_SIZES.valid
        });
    }

    /**
     * Attribute that toggles displaying the Panel.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get showPanel() {
        return this._showPanel;
    }

    set showPanel(value) {
        this._showPanel = normalizeBoolean(value);
    }

    /**
     * Computed Outer class styling basedf on selected attributes.
     *
     * @type {string}
     */
    get computedOuterClass() {
        return classSet('slds-panel slds-panel_docked')
            .add({
                'slds-size_small': this._size === 'small',
                'slds-size_medium': this._size === 'medium',
                'slds-size_large': this._size === 'large',
                'slds-size_x-large': this._size === 'x-large',
                'slds-size_full': this._size === 'full'
            })
            .add({
                'slds-panel_docked-right': this._position === 'right',
                'slds-panel_docked-left': this._position === 'left'
            })
            .add({
                'slds-is-open': this._showPanel === true,
                'slds-is-hidden': this._showPanel === false
            })
            .toString();
    }

    /**
     * Check if Title has text.
     *
     * @type {string}
     */
    get hasStringTitle() {
        return !!this.title;
    }

    /**
     * Close the panel.
     *
     * @public
     */
    @api
    close() {
        this._showPanel = false;
    }

    /**
     * Toggle the panel.
     *
     * @public
     */
    @api
    toggle() {
        this._showPanel = !this._showPanel;
    }

    /**
     * Open the panel.
     *
     * @public
     */
    @api
    open() {
        this._showPanel = true;
    }
}
