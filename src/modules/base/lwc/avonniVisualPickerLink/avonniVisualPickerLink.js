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
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';
import { classSet } from 'c/utils';
import visualPickerLink from './avonniVisualPickerLink.html';
import visualPickerLinkInfoOnly from './avonniVisualPickerLinkInfoOnly.html';

const ICON_POSITIONS = { valid: ['left', 'right'], default: 'left' };

/**
 * @class
 * @descriptor avonni-visual-picker-link
 * @storyId example-visualpickerlink--base
 * @public
 */
export default class AvonniVisualPickerLink extends LightningElement {
    /**
     * The Lightning Design System name of the icon. Names are written in the format 'utility:down' where 'utility' is the category, and 'down' is the specific icon to be displayed.
     *
     * @type {string}
     * @public
     */
    @api iconName;
    /**
     * Title of the visual picker link. To include additional markup or another component, use the title slot.
     *
     * @type {string}
     * @public
     */
    @api title;
    /**
     * The URL of the page that the link goes to.
     *
     * @type {string}
     * @public
     */
    @api href;

    _iconPosition = ICON_POSITIONS.default;
    _completed = false;
    _infoOnly = false;
    showTitle = true;

    render() {
        return this._infoOnly ? visualPickerLinkInfoOnly : visualPickerLink;
    }

    renderedCallback() {
        if (this.titleSlot) {
            this.showTitle = this.titleSlot.assignedElements().length !== 0;
        }
    }

    /**
     * Get slot dom element.
     *
     * @type {Element}
     */
    get titleSlot() {
        return this.template.querySelector('slot[name=title]');
    }

    /**
     * Position of the icon. Valid values include left and right.
     *
     * @type {string}
     * @public
     * @default left
     */
    @api
    get iconPosition() {
        return this._iconPosition;
    }

    set iconPosition(iconPosition) {
        this._iconPosition = normalizeString(iconPosition, {
            fallbackValue: ICON_POSITIONS.default,
            validValues: ICON_POSITIONS.valid
        });
    }

    /**
     * If present, the picker is displayed as <a href="https://www.lightningdesignsystem.com/components/welcome-mat/#With-Completed-Steps">completed</a>.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get completed() {
        return this._completed;
    }

    set completed(value) {
        this._completed = normalizeBoolean(value);
    }

    /**
     * If present, the picker is displayed as <a href="https://www.lightningdesignsystem.com/components/welcome-mat/#Info-only">info only</a>.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get infoOnly() {
        return this._infoOnly;
    }

    set infoOnly(value) {
        this._infoOnly = normalizeBoolean(value);
    }

    /**
     * Computed container class styling.
     *
     * @type {string}
     */
    get computedContainerClass() {
        return classSet('slds-welcome-mat__tile')
            .add({
                'slds-welcome-mat__tile_complete':
                    this._completed && !this._infoOnly,
                'slds-welcome-mat__tile_info-only': this._infoOnly
            })
            .toString();
    }

    /**
     * Computed tile body class styling.
     *
     * @type {string}
     */
    get computedTileBodyClass() {
        return classSet('slds-welcome-mat__tile-body')
            .add({
                'avonni-welcome-mat__tile-body-right':
                    this._iconPosition === 'right',
                'avonni-welcome-mat__tile-no-icon': !this.iconName
            })
            .toString();
    }

    /**
     * Computed icon container class styling.
     *
     * @type {string}
     */
    get computedIconContainerClass() {
        return classSet(
            'slds-media__figure slds-media__figure_fixed-width slds-align_absolute-center'
        )
            .add({
                'avonni-media__figure-right': this._iconPosition === 'right'
            })
            .toString();
    }

    /**
     * Verify if icon is left.
     *
     * @type {boolean}
     */
    get leftPosition() {
        return this._iconPosition === 'left';
    }

    /**
     * Click event handler.
     */
    handleClick() {
        /**
         * The event fired when the visual picker is clicked.
         *
         * @event
         * @name click
         * @public
         */
        this.dispatchEvent(new CustomEvent('click'));
    }
}
