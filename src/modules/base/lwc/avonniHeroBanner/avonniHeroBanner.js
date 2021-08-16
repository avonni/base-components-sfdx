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
import { normalizeString } from 'c/utilsPrivate';
import { classSet } from 'c/utils';

const horizontal_alignement_options = {
    valid: ['left', 'center', 'right'],
    default: 'left'
};
const vertical_alignement_options = {
    valid: ['top', 'center', 'bottom'],
    default: 'center'
};

const DEFAULT_HEIGHT = 400;
const DEFAULT_MAX_WIDTH = 960;
const DEFAULT_CONTENT_WIDTH = 100;

/**
 * @class
 * @descriptor avonni-hero-banner
 * @storyId example-hero-banner--base
 * @public
 */
export default class AvonniHeroBanner extends LightningElement {
    /**
     * The title can include text, and is displayed in the banner.
     *
     * @type {string}
     * @public
     */
    @api title;

    /**
     * The caption can include text, and is displayed over the title.
     *
     * @type {string}
     * @public
     */
    @api caption;

    /**
     * The subtitle can include text, and is displayed under the title.
     *
     * @type {string}
     * @public
     */
    @api subtitle;

    /**
     * URL for the background image.
     *
     * @type {string}
     * @public
     */
    @api src;

    /**
     * The text to be displayed inside the primary button.
     *
     * @type {string}
     * @public
     */
    @api primaryButtonLabel;

    /**
     * The text to be displayed inside the secondary button.
     *
     * @type {string}
     * @public
     */
    @api secondaryButtonLabel;

    _contentHorizontalAlignment = horizontal_alignement_options.default;
    _contentVerticalAlignment = vertical_alignement_options.default;
    _height = DEFAULT_HEIGHT;
    _maxWidth = DEFAULT_MAX_WIDTH;
    _contentWidth = DEFAULT_CONTENT_WIDTH;

    _rendered = false;
    showSlot = true;
    showFooterSlot = true;

    renderedCallback() {
        if (!this._rendered) {
            this._rendered = true;
            if (this.slot) {
                this.showSlot = this.slot.assignedElements().length !== 0;
            }

            if (this.footerSlot) {
                this.showFooterSlot =
                    this.footerSlot.assignedElements().length !== 0;
            }
        }
    }

    /**
     * Returns slot element.
     *
     * @type {element}
     */
    get slot() {
        return this.template.querySelector('slot');
    }

    /**
     * Returns footer slot element.
     *
     * @type {element}
     */
    get footerSlot() {
        return this.template.querySelector('slot[name=footer]');
    }

    /**
     * Defines the horizontal alignment of the title, caption and description.
     * Valid values include left, center and right.
     *
     * @type {string}
     * @default left
     * @public
     */
    @api
    get contentHorizontalAlignment() {
        return this._contentHorizontalAlignment;
    }

    set contentHorizontalAlignment(alignement) {
        this._contentHorizontalAlignment = normalizeString(alignement, {
            fallbackValue: horizontal_alignement_options.default,
            validValues: horizontal_alignement_options.valid
        });
    }

    /**
     * Defines the vertical alignment of the title, caption and description.
     * Valid values include top, center and bottom.
     *
     * @type {string}
     * @default center
     * @public
     */
    @api
    get contentVerticalAlignment() {
        return this._contentVerticalAlignment;
    }

    set contentVerticalAlignment(alignement) {
        this._contentVerticalAlignment = normalizeString(alignement, {
            fallbackValue: vertical_alignement_options.default,
            validValues: vertical_alignement_options.valid
        });
    }

    /**
     * Defines the height of the banner in px.
     *
     * @type {number}
     * @default 400
     * @public
     */
    @api
    get height() {
        return this._height;
    }

    set height(value) {
        const number = typeof value === 'number' ? value : DEFAULT_HEIGHT;
        this._height = parseInt(number, 10);
    }

    /**
     * Defines the width inside of the banner in px.
     *
     * @type {number}
     * @default 960
     * @public
     */
    @api
    get maxWidth() {
        return this._maxWidth;
    }

    set maxWidth(value) {
        const number = typeof value === 'number' ? value : DEFAULT_MAX_WIDTH;
        this._maxWidth = parseInt(number, 10);
    }

    /**
     * Defines the width of the content inside of the banner in percentage.
     *
     * @type {number}
     * @default 100
     * @public
     */
    @api
    get contentWidth() {
        return this._contentWidth;
    }

    set contentWidth(value) {
        const number =
            typeof value === 'number' ? value : DEFAULT_CONTENT_WIDTH;
        this._contentWidth = parseInt(number, 10);
    }

    /**
     * Styling of the image.
     *
     * @type {string}
     */
    get imgSrc() {
        return `background-image: linear-gradient(var(--avonni-hero-banner-linear-gradient, rgba(0,0,0,0.4), rgba(0,0,0,0.4))), url(${this.src}); height: ${this.height}px;`;
    }

    /**
     * Computed width for the width container based on the attribute maxWidth.
     *
     * @type {string}
     */
    get computedMaxWidth() {
        return `width: ${this._maxWidth}px;`;
    }

    /**
     * Computed width for the content container based on the attribute contentWidth.
     *
     * @type {string}
     */
    get computedContentStyling() {
        return `width: ${this.contentWidth}%`;
    }

    /**
     * Computed Content Container Class styling.
     *
     * @type {string}
     */
    get computedContentContainer() {
        return classSet('avonni-hero-banner-content-container')
            .add({
                'avonni-hero-banner-text-container-without-slot': !this
                    .showFooterSlot,
                'avonni-hero-banner-text-container-with-slot': this
                    .showFooterSlot,
                'avonni-hero-banner-vertical-alignement_bottom':
                    this.contentVerticalAlignment === 'bottom',
                'avonni-hero-banner-vertical-alignement_center':
                    this.contentVerticalAlignment === 'center',
                'avonni-hero-banner-vertical-alignement_top':
                    this.contentVerticalAlignment === 'top'
            })
            .toString();
    }

    /**
     * Computed Width Container Class styling.
     *
     * @type {string}
     */
    get computedWidthContainer() {
        return classSet('slds-grid avonni-hero-banner-width-container')
            .add({
                'avonni-hero-banner-horizontal-alignment_left':
                    this.contentHorizontalAlignment === 'left',
                'avonni-hero-banner-horizontal-alignment_center':
                    this.contentHorizontalAlignment === 'center',
                'avonni-hero-banner-horizontal-alignment_right':
                    this.contentHorizontalAlignment === 'right'
            })
            .toString();
    }

    /**
     * Computed Button Class styling.
     *
     * @type {string}
     */
    get computedButtonClass() {
        return classSet('slds-grid slds-m-top_small')
            .add({
                'avonni-hero-banner-horizontal-alignment_right':
                    this.contentHorizontalAlignment === 'right',
                'avonni-hero-banner-horizontal-alignment_center':
                    this.contentHorizontalAlignment === 'center'
            })
            .toString();
    }

    /**
     * True if there is a label for the primary button or the secondary.
     *
     * @type {boolean}
     */
    get hasButton() {
        return this.primaryButtonLabel || this.secondaryButtonLabel;
    }

    /**
     * True if there are labels for the primary button and the secondary.
     *
     * @type {boolean}
     */
    get hasButtons() {
        return this.primaryButtonLabel && this.secondaryButtonLabel;
    }
}
