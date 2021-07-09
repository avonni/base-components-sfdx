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

export default class AvonniHeroBanner extends LightningElement {
    /**
     * The title can include text, and is displayed in the banner.
     *
     * @type {string}
     */
    @api title;

    /**
     * The caption can include text, and is displayed over the title.
     *
     * @type {string}
     */
    @api caption;

    /**
     * The subtitle can include text, and is displayed under the title.
     *
     * @type {string}
     */
    @api subtitle;

    /**
     * URL for the background image.
     *
     * @type {string}
     */
    @api src;

    /**
     * The text to be displayed inside the primary button.
     *
     * @type {string}
     */
    @api primaryButtonLabel;

    /**
     * The text to be displayed inside the secondary button.
     *
     * @type {string}
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

    get slot() {
        return this.template.querySelector('slot');
    }

    get footerSlot() {
        return this.template.querySelector('slot[name=footer]');
    }

    /**
     * Defines the horizontal alignment of the title, caption and description.
     * Valid values include left, center and right.
     *
     * @type {string}
     * @default left
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

    get imgSrc() {
        return `background-image: linear-gradient(var(--avonni-hero-banner-linear-gradient, rgba(0,0,0,0.4), rgba(0,0,0,0.4))), url(${this.src}); height: ${this.height}px;`;
    }

    get computedMaxWidth() {
        return `width: ${this._maxWidth}px;`;
    }

    get computedContentStyling() {
        return `width: ${this.contentWidth}%`;
    }

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

    get hasButton() {
        return this.primaryButtonLabel || this.secondaryButtonLabel;
    }

    get hasButtons() {
        return this.primaryButtonLabel && this.secondaryButtonLabel;
    }
}
