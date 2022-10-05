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

const HORIZONTAL_ALIGNMENT_OPTIONS = {
    valid: ['left', 'center', 'right'],
    default: 'left'
};
const VERTICAL_ALIGNMENT_OPTIONS = {
    valid: ['top', 'center', 'bottom'],
    default: 'center'
};

const BUTTON_VARIANTS = {
    valid: [
        'base',
        'neutral',
        'brand',
        'brand-outline',
        'destructive',
        'destructive-text',
        'inverse',
        'success'
    ],
    default: 'neutral'
};

const ICON_POSITIONS = { valid: ['left', 'right'], default: 'left' };

const ICON_SIZES = {
    valid: ['xx-small', 'x-small', 'small', 'medium', 'large'],
    default: 'medium'
};

const IMAGE_LAYOUTS = {
    valid: [
        'scale-to-fill',
        'fit',
        'tile',
        'tile-horizontally',
        'tile-vertically'
    ],
    default: 'scale-to-fill'
};

const IMAGE_POSITIONS = {
    valid: [
        'center',
        'left',
        'right',
        'top-left',
        'top-right',
        'top-center',
        'bottom-center',
        'bottom-left',
        'bottom-right'
    ],
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
     * The caption can include text, and is displayed over the title.
     *
     * @type {string}
     * @public
     */
    @api caption;
    /**
     * The name of the icon to be used in the format 'utility:down'.
     *
     * @type {string}
     * @public
     */
    @api primaryButtonIconName;
    /**
     * The text to be displayed inside the primary button.
     *
     * @type {string}
     * @public
     */
    @api primaryButtonLabel;
    /**
     * The name of the icon to be used in the format 'utility:down'.
     *
     * @type {string}
     * @public
     */
    @api secondaryButtonIconName;
    /**
     * The text to be displayed inside the secondary button.
     *
     * @type {string}
     * @public
     */
    @api secondaryButtonLabel;
    /**
     * URL for the background image.
     *
     * @type {string}
     * @public
     */
    @api src;
    /**
     * The subtitle can include text, and is displayed under the title.
     *
     * @type {string}
     * @public
     */
    @api subtitle;
    /**
     * The title can include text, and is displayed in the banner.
     *
     * @type {string}
     * @public
     */
    @api title;

    _contentWidth = DEFAULT_CONTENT_WIDTH;
    _contentHorizontalAlignment = HORIZONTAL_ALIGNMENT_OPTIONS.default;
    _contentVerticalAlignment = VERTICAL_ALIGNMENT_OPTIONS.default;
    _height = DEFAULT_HEIGHT;
    _imageLayout = IMAGE_LAYOUTS.default;
    _imagePosition = IMAGE_POSITIONS.default;
    _maxWidth = DEFAULT_MAX_WIDTH;
    _primaryButtonIconPosition = ICON_POSITIONS.default;
    _primaryButtonIconSize = ICON_SIZES.default;
    _primaryButtonVariant = BUTTON_VARIANTS.default;
    _secondaryButtonIconPosition = ICON_POSITIONS.default;
    _secondaryButtonIconSize = ICON_SIZES.default;
    _secondaryButtonVariant = BUTTON_VARIANTS.default;

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
        return this.template.querySelector('[data-element-id="slot-default"]');
    }

    /**
     * Returns footer slot element.
     *
     * @type {element}
     */
    get footerSlot() {
        return this.template.querySelector('slot[name=footer]');
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Horizontal alignment of the title, caption and description.
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

    set contentHorizontalAlignment(alignment) {
        this._contentHorizontalAlignment = normalizeString(alignment, {
            fallbackValue: HORIZONTAL_ALIGNMENT_OPTIONS.default,
            validValues: HORIZONTAL_ALIGNMENT_OPTIONS.valid
        });
    }

    /**
     * Vertical alignment of the title, caption and description.
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

    set contentVerticalAlignment(alignment) {
        this._contentVerticalAlignment = normalizeString(alignment, {
            fallbackValue: VERTICAL_ALIGNMENT_OPTIONS.default,
            validValues: VERTICAL_ALIGNMENT_OPTIONS.valid
        });
    }

    /**
     * Width of the content inside of the banner in percentage.
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
        const number = isNaN(parseInt(value, 10))
            ? DEFAULT_CONTENT_WIDTH
            : value;
        this._contentWidth = number;
    }

    /**
     * Height of the banner in px.
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
        const number = isNaN(parseInt(value, 10)) ? DEFAULT_HEIGHT : value;
        this._height = number;
    }

    /**
     * Defines the layout of the background image. Valid layouts include scale-to-fill, fit, tile, tile-horizontally, tile-vertically.
     *
     * @public
     * @type {string}
     * @default scale-to-fill
     */
    @api
    get imageLayout() {
        return this._imageLayout;
    }

    set imageLayout(layout) {
        this._imageLayout = normalizeString(layout, {
            fallbackValue: IMAGE_LAYOUTS.default,
            validValues: IMAGE_LAYOUTS.valid
        });
    }

    /**
     * Defines the position of the background image. Valid positions include center, left, right, top-left, top-center, top-right, bottom-left, bottom-center, bottom-right.
     *
     * @public
     * @type {string}
     * @default center
     */
    @api
    get imagePosition() {
        return this._imagePosition;
    }

    set imagePosition(position) {
        this._imagePosition = normalizeString(position, {
            fallbackValue: IMAGE_POSITIONS.default,
            validValues: IMAGE_POSITIONS.valid
        });
    }

    /**
     * Width inside of the banner in px.
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
        const number = isNaN(parseInt(value, 10)) ? DEFAULT_MAX_WIDTH : value;
        this._maxWidth = number;
    }

    /**
     * Describes the position of the icon with respect to body of the primary button. Valid values include left and right.
     *
     * @public
     * @type {string}
     * @default left
     */
    @api
    get primaryButtonIconPosition() {
        return this._primaryButtonIconPosition;
    }

    set primaryButtonIconPosition(primaryButtonIconPosition) {
        this._primaryButtonIconPosition = normalizeString(
            primaryButtonIconPosition,
            {
                fallbackValue: ICON_POSITIONS.default,
                validValues: ICON_POSITIONS.valid
            }
        );
    }

    /**
     * The size of the icon inside the primary button. Valid values include xx-small, x-small, small, medium, or large.
     *
     * @public
     * @type {string}
     * @default medium
     */
    @api
    get primaryButtonIconSize() {
        return this._primaryButtonIconSize;
    }

    set primaryButtonIconSize(size) {
        this._primaryButtonIconSize = normalizeString(size, {
            fallbackValue: ICON_SIZES.default,
            validValues: ICON_SIZES.valid
        });
    }

    /**
     * The variant changes the appearance of the primary button. Accepted variants include base, neutral, brand, brand-outline, destructive, destructive-text, inverse, and success.
     *
     * @public
     * @type {string}
     * @default neutral
     */
    @api
    get primaryButtonVariant() {
        return this._primaryButtonVariant;
    }

    set primaryButtonVariant(primaryButtonVariant) {
        this._primaryButtonVariant = normalizeString(primaryButtonVariant, {
            fallbackValue: BUTTON_VARIANTS.default,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    /**
     * Describes the position of the icon with respect to body of the secondary button. Valid values include left and right..
     *
     * @public
     * @type {string}
     * @default left
     */
    @api
    get secondaryButtonIconPosition() {
        return this._secondaryButtonIconPosition;
    }

    set secondaryButtonIconPosition(secondaryButtonIconPosition) {
        this._secondaryButtonIconPosition = normalizeString(
            secondaryButtonIconPosition,
            {
                fallbackValue: ICON_POSITIONS.default,
                validValues: ICON_POSITIONS.valid
            }
        );
    }

    /**
     * The size of the icon inside the secondary button. Valid values include xx-small, x-small, small, medium, or large.
     *
     * @public
     * @type {string}
     * @default medium
     */
    @api
    get secondaryButtonIconSize() {
        return this._secondaryButtonIconSize;
    }

    set secondaryButtonIconSize(size) {
        this._secondaryButtonIconSize = normalizeString(size, {
            fallbackValue: ICON_SIZES.default,
            validValues: ICON_SIZES.valid
        });
    }

    /**
     * The variant changes the appearance of the secondary button. Accepted variants include base, neutral, brand, brand-outline, destructive, destructive-text, inverse, and success.
     *
     * @public
     * @type {string}
     * @default neutral
     */
    @api
    get secondaryButtonVariant() {
        return this._secondaryButtonVariant;
    }

    set secondaryButtonVariant(secondaryButtonVariant) {
        this._secondaryButtonVariant = normalizeString(secondaryButtonVariant, {
            fallbackValue: BUTTON_VARIANTS.default,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Sets the background of the hero banner depending on the image.
     *
     * @type {string}
     */
    get computedBackgroundStyle() {
        return this.src
            ? `background: url(${this.src}) ${this.computedPosition} ${this.computedLayout}; height: ${this.height}px;`
            : `height: ${this.height}px;`;
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
     * Computed css string based on the selected layout of the image .
     *
     * @type {string}
     */
    get computedLayout() {
        switch (this.imageLayout) {
            case 'scale-to-fill':
                return '/ cover';
            case 'fit':
                return '/ contain no-repeat';
            case 'tile':
                return 'repeat';
            case 'tile-horizontally':
                return 'repeat-x';
            case 'tile-vertically':
                return 'repeat-y';
            default:
                return this.imageLayout;
        }
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
     * Computed css string based on the selected position of the image .
     *
     * @type {string}
     */
    get computedPosition() {
        switch (this.imagePosition) {
            case 'left':
                return 'center left';
            case 'right':
                return 'center right';
            case 'center':
                return 'center center';
            case 'top-left':
                return 'top left';
            case 'top-center':
                return 'top center';
            case 'top-right':
                return 'top right';
            case 'bottom-left':
                return 'bottom left';
            case 'bottom-center':
                return 'bottom center';
            case 'bottom-right':
                return 'bottom right';
            default:
                return this.imagePosition;
        }
    }

    /**
     * Computed Content Container Class styling.
     *
     * @type {string}
     */
    get computedContentContainer() {
        return classSet('slds-var-p-around_medium')
            .add({
                'avonni-hero-banner__text-container-without-slot_height':
                    !this.showFooterSlot,
                'avonni-hero-banner__text-container-with-slot_height':
                    this.showFooterSlot
            })
            .add(
                `avonni-hero-banner__vertical-alignment_${this._contentVerticalAlignment}`
            )
            .toString();
    }

    /**
     * Computed Width Container Class styling.
     *
     * @type {string}
     */
    get computedWidthContainer() {
        return classSet('slds-grid')
            .add(
                `avonni-hero-banner__horizontal-alignment_${this._contentHorizontalAlignment}`
            )
            .toString();
    }

    /**
     * Computed Button Class styling.
     *
     * @type {string}
     */
    get computedButtonAlignmentClass() {
        return classSet('slds-grid slds-m-top_small')
            .add(
                `avonni-hero-banner__horizontal-alignment_${this._contentHorizontalAlignment}`
            )
            .toString();
    }

    /** PRIMARY BUTTON */
    /**
     * True if the primary button only has an icon.
     *
     * @type {boolean}
     */
    get isPrimaryButtonIcon() {
        return this.primaryButtonIconName && !this.primaryButtonLabel;
    }

    /**
     * True if there is a label or icon name for the primary button.
     *
     * @type {boolean}
     */
    get hasPrimaryButton() {
        return this.primaryButtonLabel || this.primaryButtonIconName;
    }

    /**
     * True if there is an icon name for the first button and his position is left.
     *
     * @type {boolean}
     */
    get primaryButtonIconNameLeft() {
        return (
            this.primaryButtonIconName &&
            this.primaryButtonIconPosition === 'left'
        );
    }

    /**
     * True if there is an icon name for the first button and his position is right.
     *
     * @type {boolean}
     */
    get primaryButtonIconNameRight() {
        return (
            this.primaryButtonIconName &&
            this.primaryButtonIconPosition === 'right'
        );
    }

    /**
     * Computed primary button class styling.
     *
     * @type {string}
     */
    get computedPrimaryButtonClass() {
        return classSet('avonni-hero-banner__primary-button')
            .add({
                'avonni-hero-banner__primary-button-icon':
                    this.isPrimaryButtonIcon,
                'slds-button_icon-xx-small':
                    this.isPrimaryButtonIcon &&
                    this.primaryButtonIconSize === 'xx-small',
                'slds-button_icon-x-small':
                    this.isPrimaryButtonIcon &&
                    this.primaryButtonIconSize === 'x-small',
                'slds-button_icon-small':
                    this.isPrimaryButtonIcon &&
                    this.primaryButtonIconSize === 'small',
                'avonni-hero-banner__primary-button-icon_medium':
                    this.isPrimaryButtonIcon &&
                    this.primaryButtonIconSize === 'medium',
                'slds-button_icon-large':
                    this.isPrimaryButtonIcon &&
                    this.primaryButtonIconSize === 'large',
                'avonni-hero-banner__primary-button_transition':
                    this.primaryButtonVariant !== 'base',
                'avonni-hero-banner__primary-button_variant-neutral':
                    this.primaryButtonVariant === 'neutral',
                'avonni-hero-banner__primary-button_variant-brand':
                    this.primaryButtonVariant === 'brand',
                'avonni-hero-banner__primary-button_variant-outline-brand':
                    this.primaryButtonVariant === 'brand-outline',
                'avonni-hero-banner__primary-button_variant-destructive':
                    this.primaryButtonVariant === 'destructive',
                'avonni-hero-banner__primary-button_variant-text-destructive':
                    this.primaryButtonVariant === 'destructive-text',
                'avonni-hero-banner__primary-button_variant-inverse':
                    this.primaryButtonVariant === 'inverse',
                'avonni-hero-banner__primary-button_variant-success':
                    this.primaryButtonVariant === 'success'
            })
            .toString();
    }

    /**
     * Computed primary primitive icon class styling.
     *
     * @type {string}
     */
    get computedPrimaryPrimitiveIconClass() {
        return classSet('slds-button__icon')
            .add({
                'slds-button__icon_left':
                    this._primaryButtonIconPosition === 'left' &&
                    this.primaryButtonLabel,
                'slds-button__icon_right':
                    this._primaryButtonIconPosition === 'right' &&
                    this.primaryButtonLabel,
                'slds-button__icon_x-small':
                    this.primaryButtonIconSize === 'x-small' ||
                    this.primaryButtonIconSize === 'xx-small',
                'slds-button__icon_small':
                    this.primaryButtonIconSize === 'small',
                'slds-button__icon_large':
                    this.primaryButtonIconSize === 'large'
            })
            .toString();
    }

    /** SECONDARY BUTTON */
    /**
     * True if the secondary button only has an icon.
     *
     * @type {boolean}
     */
    get isSecondaryButtonIcon() {
        return this.secondaryButtonIconName && !this.secondaryButtonLabel;
    }

    /**
     * True if there is a label or icon name for the second button.
     *
     * @type {boolean}
     */
    get hasSecondaryButton() {
        return this.secondaryButtonLabel || this.secondaryButtonIconName;
    }

    /**
     * True if there is an icon name for the second button and his position is left.
     *
     * @type {boolean}
     */
    get secondaryButtonIconNameLeft() {
        return (
            this.secondaryButtonIconName &&
            this.secondaryButtonIconPosition === 'left'
        );
    }

    /**
     * True if there is an icon name for the second button and his position is right.
     *
     * @type {boolean}
     */
    get secondaryButtonIconNameRight() {
        return (
            this.secondaryButtonIconName &&
            this.secondaryButtonIconPosition === 'right'
        );
    }

    /**
     * Computed secondary button class styling.
     *
     * @type {string}
     */
    get computedSecondaryButtonClass() {
        return classSet(
            'avonni-hero-banner__secondary-button slds-m-left_x-small'
        )
            .add({
                'avonni-hero-banner__secondary-button-icon':
                    this.isSecondaryButtonIcon,
                'slds-button_icon-xx-small':
                    this.isSecondaryButtonIcon &&
                    this.secondaryButtonIconSize === 'xx-small',
                'slds-button_icon-x-small':
                    this.isSecondaryButtonIcon &&
                    this.secondaryButtonIconSize === 'x-small',
                'slds-button_icon-small':
                    this.isSecondaryButtonIcon &&
                    this.secondaryButtonIconSize === 'small',
                'avonni-hero-banner__secondary-button-icon_medium':
                    this.isSecondaryButtonIcon &&
                    this.secondaryButtonIconSize === 'medium',
                'slds-button_icon-large':
                    this.isSecondaryButtonIcon &&
                    this.secondaryButtonIconSize === 'large',
                'avonni-hero-banner__secondary-button_transition':
                    this.secondaryButtonVariant !== 'base',
                'avonni-hero-banner__secondary-button_variant-neutral':
                    this.secondaryButtonVariant === 'neutral',
                'avonni-hero-banner__secondary-button_variant-brand':
                    this.secondaryButtonVariant === 'brand',
                'avonni-hero-banner__secondary-button_variant-outline-brand':
                    this.secondaryButtonVariant === 'brand-outline',
                'avonni-hero-banner__secondary-button_variant-destructive':
                    this.secondaryButtonVariant === 'destructive',
                'avonni-hero-banner__secondary-button_variant-text-destructive':
                    this.secondaryButtonVariant === 'destructive-text',
                'avonni-hero-banner__secondary-button_variant-inverse':
                    this.secondaryButtonVariant === 'inverse',
                'avonni-hero-banner__secondary-button_variant-success':
                    this.secondaryButtonVariant === 'success'
            })
            .toString();
    }

    /**
     * Computed secondary primitive icon class styling.
     *
     * @type {string}
     */
    get computedSecondaryPrimitiveIconClass() {
        return classSet('slds-button__icon')
            .add({
                'slds-button__icon_left':
                    this._secondaryButtonIconPosition === 'left' &&
                    this.secondaryButtonLabel,
                'slds-button__icon_right':
                    this._secondaryButtonIconPosition === 'right' &&
                    this.secondaryButtonLabel,
                'slds-button__icon_x-small':
                    this.secondaryButtonIconSize === 'x-small' ||
                    this.secondaryButtonIconSize === 'xx-small',
                'slds-button__icon_small':
                    this.secondaryButtonIconSize === 'small',
                'slds-button__icon_large':
                    this.secondaryButtonIconSize === 'large'
            })
            .toString();
    }
    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Handle the click on the primary button. Dispatch the primarybuttonclick event.
     *
     * @param {Event} event
     */
    handlePrimaryButtonClick() {
        /**
         * The event fired when the primary button is clicked.
         *
         * @event
         * @name primarybuttonclick
         * @public
         */
        this.dispatchEvent(new CustomEvent('primarybuttonclick'));
    }

    /**
     * Handle the click on the secondary button. Dispatch the secondarybuttonclick event.
     *
     * @param {Event} event
     */
    handleSecondaryButtonClick() {
        /**
         * The event fired when the secondary button is clicked.
         *
         * @event
         * @name secondarybuttonclick
         * @public
         */
        this.dispatchEvent(new CustomEvent('secondarybuttonclick'));
    }
}
