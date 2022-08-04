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
import { classSet } from 'c/utils';
import { normalizeString } from 'c/utilsPrivate';

const MEDIA_POSITIONS = {
    valid: [
        'left',
        'right',
        'top',
        'bottom',
        'center',
        'background',
        'overlay'
    ],
    default: 'top'
};

/**
 * @class
 * @name Card
 * @descriptor avonni-card
 * @storyId example-card--base
 * @public
 */
export default class AvonniCard extends LightningElement {
    /**
     * The title in the header of the card, right of the icon. The title attribute supersedes the title slot.
     *
     * @type {string}
     * @public
     */
    @api title;
    /**
     * The Lightning Design System name displayed left of the title in the header.
     * Names are written in the format 'standard:account' where 'standard' is the category, and 'account' is the specific icon to be displayed.
     *
     * @type {string}
     * @public
     */
    @api iconName;
    /**
     * Source for the image or media.
     *
     * @type {string}
     * @public
     */
    @api mediaSrc;

    _mediaPosition = MEDIA_POSITIONS.default;

    showMediaSlot = true;
    showTitleSlot = true;
    showActionsSlot = true;
    showDefaultSlot = true;
    showFooterSlot = true;
    showCenterMediaContent = true;

    renderedCallback() {
        this.showMediaSlot =
            !this.mediaSrc &&
            this.mediaSlot &&
            this.mediaSlot.assignedElements().length !== 0;
        this.showActionsSlot =
            this.actionsSlot &&
            this.actionsSlot.assignedElements().length !== 0;
        this.showDefaultSlot =
            (this.defaultSlot &&
                this.defaultSlot.assignedElements().length !== 0) ||
            (this.defaultSlot &&
                this.defaultSlot.innerText &&
                this.defaultSlot.innerText.trim().length !== 0);
        this.showTitleSlot =
            !this.title &&
            this.titleSlot &&
            this.titleSlot.assignedElements().length !== 0;
        this.showFooterSlot =
            this.footerSlot && this.footerSlot.assignedElements().length !== 0;

        this.showCenterMediaContent =
            this.showDefaultSlot && this.mediaPosition === 'center';
    }

    /*
     * -------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Position of the media relative to the card.
     * Valid values are "top", "center", "left", "right", "bottom", "background", and "overlay".
     *
     * @type {string}
     * @public
     * @default top
     */
    @api
    get mediaPosition() {
        return this._mediaPosition;
    }

    set mediaPosition(value) {
        this._mediaPosition = normalizeString(value, {
            fallbackValue: MEDIA_POSITIONS.default,
            validValues: MEDIA_POSITIONS.valid
        });
    }

    /*
     * -------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /*** Slots ***/

    /**
     * Get the media slot DOM element.
     *
     * @type {Element}
     */
    get mediaSlot() {
        return this.template.querySelector('slot[name=media]');
    }

    /**
     * Get the media actions slot DOM element.
     *
     * @type {Element}
     */
    get mediaActionsSlot() {
        return this.template.querySelector('slot[name=media-actions]');
    }

    /**
     * Get the title slot DOM element.
     *
     * @type {Element}
     */
    get titleSlot() {
        return this.template.querySelector('slot[name=title]');
    }

    /**
     * Get the actions slot DOM element.
     *
     * @type {Element}
     */
    get actionsSlot() {
        return this.template.querySelector('slot[name=actions]');
    }
    /**
     * Get the footer slot DOM element.
     *
     * @type {Element}
     */
    get footerSlot() {
        return this.template.querySelector('slot[name=footer]');
    }

    /**
     * Get the actions slot DOM element.
     *
     * @type {Element}
     */
    get defaultSlot() {
        return this.template.querySelector(
            'slot[data-element-id="avonni-card-default-slot"], slot[data-element-id="avonni-card-center-default-slot"]'
        );
    }

    /**
     * Get show media.
     *
     * @type {boolean}
     */
    get showMedia() {
        return this.mediaSrc || this.showMediaSlot;
    }

    /*** Styling Conditions ***/

    /**
     * Apply bottom border
     *
     * @type {boolean}
     */
    get mediaHasBottomBorder() {
        return (
            this.showMedia &&
            ((this.mediaPosition === 'top' &&
                (this.showDefaultSlot || this.hasHeader)) ||
                (this.mediaPosition === 'center' && this.showDefaultSlot))
        );
    }

    /**
     * Apply top border
     *
     * @type {boolean}
     */
    get mediaHasTopBorder() {
        return (
            this.showMedia &&
            ((this.mediaPosition === 'center' && this.hasHeader) ||
                (this.mediaPosition === 'bottom' &&
                    (this.hasHeader || this.showDefaultSlot)))
        );
    }

    /**
     * Is the header present?
     *
     * @type {boolean}
     */
    get hasHeader() {
        return (
            this.showTitleSlot ||
            this.title ||
            this.iconName ||
            this.showActionsSlot
        );
    }

    /**
     * Show default slot for center media.
     *
     * @type {boolean}
     */
    get cardHasCenterMedia() {
        return this.mediaPosition === 'center';
    }

    /*** Computed Classes ***/

    /**
     * Card body classes
     *
     * @type {string}
     */
    get computedCardClasses() {
        return classSet(
            'avonni-card__body-container slds-grid slds-is-relative slds-scrollable_none slds-scrollable_none slds-col'
        )
            .add({
                'avonni-card__media-top slds-grid_vertical avonni-card__media-top-left-radius avonni-card__media-top-right-radius':
                    this.mediaPosition === 'top'
            })
            .add({
                'avonni-card__media-left avonni-card__media-top-left-radius':
                    this.mediaPosition === 'left'
            })
            .add({
                'avonni-card__media-right avonni-card__media-top-right-radius':
                    this.mediaPosition === 'right'
            })
            .add({
                'slds-grid_vertical avonni-card__media-center':
                    this.mediaPosition === 'center'
            })
            .add({
                'slds-grid_vertical-reverse': this.mediaPosition === 'bottom'
            })
            .add({
                'avonni-card__media-top-left-radius avonni-card__media-top-right-radius':
                    this.mediaPosition === 'center' && !this.hasHeader
            })
            .add({
                'avonni-card__media-background avonni-card__media-top-left-radius avonni-card__media-top-right-radius':
                    this.mediaPosition === 'background'
            })
            .add({
                'avonni-card__media-overlay avonni-card__media-top-left-radius avonni-card__media-top-right-radius':
                    this.mediaPosition === 'overlay'
            })
            .add({
                'avonni-card__media-bottom-left-radius':
                    !this.showFooterSlot &&
                    (this.mediaPosition === 'left' ||
                        this.mediaPosition === 'background' ||
                        this.mediaPosition === 'overlay' ||
                        this.mediaPosition === 'bottom' ||
                        (this.mediaPosition === 'center' &&
                            !this.showDefaultSlot))
            })
            .add({
                'avonni-card__media-bottom-right-radius':
                    !this.showFooterSlot &&
                    (this.mediaPosition === 'right' ||
                        this.mediaPosition === 'background' ||
                        this.mediaPosition === 'overlay' ||
                        this.mediaPosition === 'bottom' ||
                        (this.mediaPosition === 'center' &&
                            !this.showDefaultSlot))
            })
            .toString();
    }

    /**
     * Media container classes
     *
     * @type {string}
     */
    get computedMediaClasses() {
        return classSet(
            'avonni-card__media-container slds-col slds-is-relative'
        )
            .add({
                'avonni-card__media-border-bottom': this.mediaHasBottomBorder
            })
            .add({ 'avonni-card__media-border-top': this.mediaHasTopBorder })
            .add({
                'avonni-card__media-border-left': this.mediaPosition === 'right'
            })
            .add({
                'avonni-card__media-border-right': this.mediaPosition === 'left'
            })
            .toString();
    }
}
