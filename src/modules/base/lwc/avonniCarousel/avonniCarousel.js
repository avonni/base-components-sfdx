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
import {
    keyCodes,
    normalizeBoolean,
    normalizeString,
    normalizeArray
} from 'c/utilsPrivate';
import { AvonniResizeObserver } from 'c/resizeObserver';
import { generateUUID } from 'c/utils';

const INDICATOR_ACTION =
    'slds-carousel__indicator-action avonni-carousel__progress-indicator_inactive';
const INDICATOR_ACTION_SHADED =
    'slds-carousel__indicator-action avonni-carousel__progress-indicator_shaded-inactive';
const SLDS_ACTIVE = 'slds-is-active avonni-carousel__progress-indicator_active';
const SLDS_ACTIVE_SHADED =
    'slds-is-active avonni-carousel__progress-indicator_shaded-active';
const FALSE_STRING = 'false';
const TRUE_STRING = 'true';

const ACTIONS_POSITIONS = {
    valid: [
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
        'bottom-center'
    ],
    default: 'bottom-center'
};
const ACTIONS_VARIANTS = {
    valid: ['bare', 'border', 'menu'],
    default: 'border'
};

const ITEMS_PER_PANEL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const MEDIA_QUERY_BREAKPOINTS = {
    small: 480,
    medium: 768,
    large: 1024
};

const INDICATOR_VARIANTS = { valid: ['base', 'shaded'], default: 'base' };

const DEFAULT_ITEMS_PER_PANEL = 1;
const DEFAULT_SCROLL_DURATION = 5;
const DEFAULT_ASSISTIVE_TEXT_AUTOPLAY_BUTTON = 'Play / Stop auto-play';
const DEFAULT_ASSISTIVE_TEXT_PREVIOUS_PANEL = 'Previous Panel';
const DEFAULT_ASSISTIVE_TEXT_NEXT_PANEL = 'Next Panel';
const DEFAULT_AUTOCROLL_PLAY_ICON = 'utility:play';
const DEFAULT_AUTOCROLL_PAUSE_ICON = 'utility:pause';

const i18n = {
    nextPanel: DEFAULT_ASSISTIVE_TEXT_NEXT_PANEL,
    previousPanel: DEFAULT_ASSISTIVE_TEXT_PREVIOUS_PANEL,
    autoplayButton: DEFAULT_ASSISTIVE_TEXT_AUTOPLAY_BUTTON
};

/**
 * @class
 * @descriptor avonni-carousel
 * @storyId example-carousel--base
 * @public
 */
export default class AvonniCarousel extends LightningElement {
    /**
     * Dictates the currently active/visible carousel panel. Use item’s name to select current panel.
     *
     * @type {string}
     * @public
     */
    @api currentPanel;
    /**
     * If present, the carousel doesn't loop after the last image is displayed.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api disableAutoRefresh;
    /**
     * If present, images do not automatically scroll and users must click the indicators to scroll.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api disableAutoScroll;
    /**
     * If present, the left and right arrows of the carousel are hidden.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api hidePreviousNextPanelNavigation;
    /**
     * If present, the carousel will loop when reaching the last panel.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api isInfinite;
    /**
     * Auto scroll delay. The default is 5 seconds, after which the next image is displayed.
     *
     * @type {number}
     * @public
     * @default 5
     */
    @api scrollDuration = DEFAULT_SCROLL_DURATION;

    _assistiveText = {
        nextPanel: i18n.nextPanel,
        previousPanel: i18n.previousPanel,
        autoplayButton: i18n.autoplayButton
    };
    _carouselItems = [];
    _itemsPerPanel = DEFAULT_ITEMS_PER_PANEL;
    initialRender = true;
    _indicatorVariant = INDICATOR_VARIANTS.default;
    _hideIndicator = false;
    _actionsPosition = ACTIONS_POSITIONS.default;
    _actionsVariant = ACTIONS_VARIANTS.default;

    activeIndexPanel;
    autoScrollIcon = DEFAULT_AUTOCROLL_PLAY_ICON;
    autoScrollTimeOut;
    autoScrollOn;
    columnsCount = {
        default: 1
    };
    currentPanelIndex = 0;
    currentItemsPerPanel;
    panelItems = [];
    paginationItems = [];
    panelStyle;
    resizeObserver;

    renderedCallback() {
        if (this.initialRender) {
            this.initCarousel();
            if (!this.disableAutoScroll) {
                this.play();
            }
        }

        if (!this.resizeObserver) {
            this.initWrapObserver();
        }

        this.computeItemsPerPanel();
        this.initialRender = false;
    }

    connectedCallback() {
        this._connected = true;
    }

    disconnectedCallback() {
        this._connected = false;
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = undefined;
        }
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Position of the actions. Valid values include top-left, top-right,  bottom-left, bottom-right and bottom-center.
     *
     * @type {string}
     * @public
     * @default bottom-center
     */
    @api
    get actionsPosition() {
        return this._actionsPosition;
    }

    set actionsPosition(position) {
        this._actionsPosition = normalizeString(position, {
            fallbackValue: ACTIONS_POSITIONS.default,
            validValues: ACTIONS_POSITIONS.valid
        });
    }

    /**
     * Changes the appearance of the actions. Valid values include bare, border and menu.
     *
     * @type {string}
     * @public
     * @default border
     */
    @api
    get actionsVariant() {
        return this._actionsVariant;
    }

    set actionsVariant(variant) {
        this._actionsVariant = normalizeString(variant, {
            fallbackValue: ACTIONS_VARIANTS.default,
            validValues: ACTIONS_VARIANTS.valid
        });
    }

    /**
     * Description of the carousel items for screen-readers.
     *
     * @type {object}
     * @public
     * @default <code>{ autoplayButton: 'Play / Stop auto-play', nextPanel: 'Next Panel', previousPanel: 'Previous Panel' }</code>
     */
    @api
    get assistiveText() {
        return this._assistiveText;
    }

    set assistiveText(value) {
        const text = typeof value === 'object' && value !== null ? value : {};
        this._assistiveText = {
            autoplayButton:
                text.autoplayButton || DEFAULT_ASSISTIVE_TEXT_AUTOPLAY_BUTTON,
            nextPanel: text.nextPanel || DEFAULT_ASSISTIVE_TEXT_NEXT_PANEL,
            previousPanel:
                text.previousPanel || DEFAULT_ASSISTIVE_TEXT_PREVIOUS_PANEL
        };
    }

    /**
     * If present, the progress indicator is hidden.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get hideIndicator() {
        return this._hideIndicator;
    }

    set hideIndicator(value) {
        this._hideIndicator = normalizeBoolean(value);
    }

    /**
     * Changes the appearance of the progress indicators. Valid values are base or shaded.
     *
     * @type {string}
     * @public
     * @default base
     */
    @api
    get indicatorVariant() {
        return this._indicatorVariant;
    }

    set indicatorVariant(variant) {
        this._indicatorVariant = normalizeString(variant, {
            fallbackValue: INDICATOR_VARIANTS.default,
            validValues: INDICATOR_VARIANTS.valid
        });
    }

    /**
     * Array of item objects to display in the carousel.
     *
     * @type {object[]}
     * @public
     * @required
     */
    @api
    get items() {
        return this._carouselItems;
    }

    set items(value) {
        let allItems = [];
        allItems = normalizeArray(value);
        this._carouselItems = [];
        allItems.forEach((item) => {
            this._carouselItems.push({
                name: item.name,
                title: item.title,
                description: item.description,
                imageAssistiveText: item.imageAssistiveText || item.title,
                href: item.href,
                src: item.src,
                actions: item.actions || []
            });
        });
        if (this._connected) {
            this.initCarousel();
        }
    }

    /**
     * Number of items to be displayed at a time in the carousel. Maximum of 10 items per panel.
     *
     * @type {number}
     * @public
     * @default 1
     */
    @api
    get itemsPerPanel() {
        return this._itemsPerPanel;
    }

    set itemsPerPanel(value) {
        if (ITEMS_PER_PANEL.includes(value)) {
            this._itemsPerPanel = value;
        } else {
            this._itemsPerPanel = 1;
        }

        this.columnsCount.default = this._itemsPerPanel;
        this.computeItemsPerPanel();
    }

    /**
     * Number of items to be displayed at a time when the component is 480px wide or more. Maximum of 10 items per panel.
     *
     * @type {number}
     * @public
     */
    @api
    get smallItemsPerPanel() {
        return this._smallItemsPerPanel;
    }

    set smallItemsPerPanel(value) {
        this._smallItemsPerPanel = this.normalizeItemsPerPanel(value, 'small');
        this.computeItemsPerPanel();
    }

    /**
     * Number of items to be displayed at a time when the component is 768px wide or more. Maximum of 10 items per panel.
     *
     * @type {number}
     * @public
     */
    @api
    get mediumItemsPerPanel() {
        return this._mediumItemsPerPanel;
    }

    set mediumItemsPerPanel(value) {
        this._mediumItemsPerPanel = this.normalizeItemsPerPanel(
            value,
            'medium'
        );
        this.computeItemsPerPanel();
    }

    /**
     * Number of items to be displayed at a time in the carousel when the component is 1024px wide or more. Maximum of 10 items per panel.
     *
     * @type {number}
     * @public
     */
    @api
    get largeItemsPerPanel() {
        return this._largeItemsPerPanel;
    }

    set largeItemsPerPanel(value) {
        this._largeItemsPerPanel = this.normalizeItemsPerPanel(value, 'large');
        this.computeItemsPerPanel();
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    get carouselIsResponsive() {
        return (
            this.columnsCount.small != null ||
            this.columnsCount.medium != null ||
            this.columnsCount.large != null
        );
    }

    get carouselContainer() {
        return this.template.querySelector(
            '[data-element-id="avonni-carousel-container"]'
        );
    }

    /**
     * Sets the width of each item, depending on the number of items per panel
     */
    get carouselItemStyle() {
        const itemWidth = 100 / this.currentItemsPerPanel;
        return `flex-basis: ${itemWidth}%; width: ${itemWidth}%`;
    }

    /**
     * Change the button position depending if hideIndicator is true or false.
     *
     * @type {string}
     */
    get computedAutoScrollAutoplayButton() {
        return this._hideIndicator
            ? 'avonni-carousel__autoscroll-button-without-indicator'
            : 'avonni-carousel__autoscroll-button-with-indicator';
    }

    /**
     * Verify if actions are present.
     */
    get hasActions() {
        return this.items.map((item) => {
            return item.actions && item.actions.length > 0;
        });
    }

    /**
     * If not infinite - set next panel as disabled.
     *
     * @type {number}
     */
    get nextPanelNavigationDisabled() {
        return !this.isInfinite
            ? this.activeIndexPanel === this.paginationItems.length - 1
            : null;
    }

    /**
     * If navigation is not infinite - set previous panel as disabled.
     *
     * @type {number}
     */
    get previousPanelNavigationDisabled() {
        return !this.isInfinite ? this.activeIndexPanel === 0 : null;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Pause the slide cycle.
     *
     * @public
     */
    @api
    pause() {
        clearTimeout(this.autoScrollTimeOut);
        this.autoScrollOn = false;
        this.autoScrollIcon = DEFAULT_AUTOCROLL_PLAY_ICON;
    }

    /**
     * Play the slide cycle.
     *
     * @public
     */
    @api
    play() {
        const scrollDuration = parseInt(this.scrollDuration, 10) * 1000;
        const carouselPanelsLength = this.panelItems.length;

        if (
            this.activeIndexPanel === carouselPanelsLength - 1 &&
            (this.disableAutoRefresh || !this.isInfinite)
        ) {
            this.pause();
            return;
        }

        this.pause();
        this.autoScrollTimeOut = setTimeout(
            this.startAutoScroll.bind(this),
            scrollDuration
        );

        this.autoScrollOn = true;
        this.autoScrollIcon = DEFAULT_AUTOCROLL_PAUSE_ICON;
    }

    /**
     * Go to first slide.
     *
     * @public
     */
    @api
    first() {
        this.selectNewPanel(0);
    }

    /**
     * Go to last slide.
     *
     * @public
     */
    @api
    last() {
        this.selectNewPanel(this.paginationItems.length - 1);
    }

    /**
     * Go to previous slide.
     *
     * @public
     */
    @api
    previous() {
        this.pause();
        this.unselectCurrentPanel();
        if (this.activeIndexPanel > 0) {
            this.activeIndexPanel -= 1;
        } else {
            this.activeIndexPanel = this.paginationItems.length - 1;
        }
        this.selectNewPanel(this.activeIndexPanel);
    }

    /**
     * Go to next slide.
     *
     * @public
     */
    @api
    next() {
        this.pause();
        this.unselectCurrentPanel();
        if (this.activeIndexPanel < this.paginationItems.length - 1) {
            this.activeIndexPanel += 1;
        } else {
            this.activeIndexPanel = 0;
        }
        this.selectNewPanel(this.activeIndexPanel);
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Initialize current panel method.
     *
     * @param {number} numberOfPanels
     */
    initializeCurrentPanel(numberOfPanels) {
        const currentPanelIndex = this.currentPanel
            ? this.items.findIndex((item) => item.name === this.currentPanel)
            : 0;
        const firstPanel = parseInt(currentPanelIndex, 10);
        this.activeIndexPanel = firstPanel < numberOfPanels ? firstPanel : 0;
    }

    /**
     * Initialize Pagination items method.
     *
     * @param {number} numberOfPanels
     */
    initializePaginationItems(numberOfPanels) {
        this.paginationItems = [];
        for (let i = 0; i < numberOfPanels; i++) {
            const id = generateUUID();
            const isItemActive = i === this.activeIndexPanel;
            if (this.indicatorVariant === 'base') {
                this.paginationItems.push({
                    key: id,
                    id: `pagination-item-${i}`,
                    className: isItemActive
                        ? INDICATOR_ACTION + ' ' + SLDS_ACTIVE
                        : INDICATOR_ACTION,
                    tabIndex: isItemActive ? '0' : '-1',
                    ariaSelected: isItemActive ? TRUE_STRING : FALSE_STRING,
                    tabTitle: `Tab ${i}`
                });
            } else if (this.indicatorVariant === 'shaded') {
                this.paginationItems.push({
                    key: i,
                    id: `pagination-item-${i}`,
                    className: isItemActive
                        ? INDICATOR_ACTION_SHADED + ' ' + SLDS_ACTIVE_SHADED
                        : INDICATOR_ACTION_SHADED,
                    tabIndex: isItemActive ? '0' : '-1',
                    ariaSelected: isItemActive ? TRUE_STRING : FALSE_STRING,
                    tabTitle: `Tab ${i}`
                });
            }
        }
    }

    /**
     * Setup the carousel resize observer. Used to update the number of items per panel when the carousel is resized.
     *
     * @returns {AvonniResizeObserver} Resize observer.
     */
    initWrapObserver() {
        if (this.carouselIsResponsive) {
            const resizeObserver = new AvonniResizeObserver(() => {
                this.computeItemsPerPanel();
            });
            resizeObserver.observe(this.carouselContainer);
            this.resizeObserver = resizeObserver;
        }
    }

    /**
     * Creates an array of panels, each containing an array of items.
     */
    initializePanels() {
        const panelItems = [];
        let panelIndex = 0;
        for (
            let i = 0;
            i < this._carouselItems.length;
            i += this.currentItemsPerPanel
        ) {
            panelItems.push({
                index: panelIndex,
                key: `panel-${panelIndex}`,
                items: this._carouselItems.slice(
                    i,
                    i + this.currentItemsPerPanel
                ),
                ariaHidden:
                    this.activeIndexPanel === i ? FALSE_STRING : TRUE_STRING
            });
            panelIndex += 1;
        }
        this.panelItems = panelItems;
        this.panelStyle = `transform: translateX(-${
            this.activeIndexPanel * 100
        }%);`;
    }

    /**
     * Ensure items per panel is an accepted value, otherwise unset it.
     */
    normalizeItemsPerPanel(value, size) {
        let itemCount;
        if (ITEMS_PER_PANEL.includes(value)) {
            itemCount = value;
        }

        if (itemCount) {
            this.columnsCount[size] = itemCount;
        } else {
            this.columnsCount[size] = undefined;
        }

        return itemCount;
    }

    /**
     * Call the auto scroll.
     */
    startAutoScroll() {
        this.next();
        this.play();
    }

    /**
     * Item clicked event handler.
     *
     * @param {event}
     */
    handleItemClick(event) {
        /**
         * The event fired when an item is clicked.
         *
         * @event
         * @name itemclick
         * @param {object} item The item data clicked.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('itemclick', {
                detail: {
                    item: event.detail.item
                }
            })
        );
    }

    /**
     * Item clicked event handler.
     *
     * @param {event}
     */
    handleActionClick(event) {
        /**
         * The event fired when a user clicks on an action.
         *
         * @event
         * @name actionclick
         * @param {string} name Name of the action clicked.
         * @param {object} item Item clicked.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('actionclick', {
                detail: {
                    name: event.detail.name,
                    item: event.detail.item
                }
            })
        );
    }

    /**
     * Key down event handler.
     *
     * @param {Event}
     */
    keyDownHandler(event) {
        const key = event.keyCode;
        let indicatorActionsElements = this.indicatorActionsElements;

        if (key === keyCodes.right) {
            event.preventDefault();
            event.stopPropagation();

            this.pause();
            if (
                this.activeIndexPanel < this.panelItems.length - 1 ||
                this.isInfinite
            ) {
                this.next();
            }
        }

        if (key === keyCodes.left) {
            event.preventDefault();
            event.stopPropagation();

            this.pause();
            if (this.activeIndexPanel > 0 || this.isInfinite) {
                this.previous();
            }
        }

        // we cache them the first time
        if (!indicatorActionsElements) {
            indicatorActionsElements = this.template.querySelectorAll(
                '.slds-carousel__indicator-action'
            );
            this.indicatorActionsElements = indicatorActionsElements;
        }

        // we want to make sure that while we are using the keyboard
        // navigation we are focusing on the right indicator
        indicatorActionsElements[this.activeIndexPanel].focus();
    }

    computeItemsPerPanel() {
        if (!this.carouselContainer) {
            return;
        }

        const previousItemsPerPanel = this.currentItemsPerPanel;
        const carouselWidth = this.carouselContainer.offsetWidth;
        let setSize = 'default';

        if (
            this.largeItemsPerPanel > 0 &&
            carouselWidth >= MEDIA_QUERY_BREAKPOINTS.large
        ) {
            setSize = 'large';
        } else if (
            this.mediumItemsPerPanel > 0 &&
            carouselWidth >= MEDIA_QUERY_BREAKPOINTS.medium
        ) {
            setSize = 'medium';
        } else if (
            this.smallItemsPerPanel > 0 &&
            carouselWidth >= MEDIA_QUERY_BREAKPOINTS.small
        ) {
            setSize = 'small';
        }

        const calculatedItemsPerPanel = this.columnsCount[setSize];

        if (
            calculatedItemsPerPanel !== previousItemsPerPanel &&
            this._connected
        ) {
            this.currentItemsPerPanel = calculatedItemsPerPanel;
            this.initCarousel();
        }
    }

    /**
     * Initialize Carousel method.
     */
    initCarousel() {
        const numberOfPanels = Math.ceil(
            this._carouselItems.length / this.currentItemsPerPanel
        );

        this.initializeCurrentPanel(numberOfPanels);
        this.initializePaginationItems(numberOfPanels);
        this.initializePanels();
    }

    /**
     * Panel selection event method.
     *
     * @param {Event}
     */
    onPanelSelect(event) {
        const currentTarget = event.currentTarget;
        const itemIndex = parseInt(currentTarget.dataset.index, 10);
        this.pause();

        if (this.activeIndexPanel !== itemIndex) {
            this.unselectCurrentPanel();
            this.selectNewPanel(itemIndex);
        }
    }

    /**
     * New panel selection method.
     *
     * @param {number} panelIndex
     */
    selectNewPanel(panelIndex) {
        const activePaginationItem = this.paginationItems[panelIndex];
        const activePanelItem = this.panelItems[panelIndex];

        if (!activePaginationItem || !activePanelItem) return;

        activePanelItem.ariaHidden = FALSE_STRING;
        activePaginationItem.tabIndex = '0';
        activePaginationItem.ariaHidden = TRUE_STRING;
        if (this.indicatorVariant === 'base') {
            activePaginationItem.className =
                INDICATOR_ACTION + ' ' + SLDS_ACTIVE;
        } else if (this.indicatorVariant === 'shaded') {
            activePaginationItem.className =
                INDICATOR_ACTION_SHADED + ' ' + SLDS_ACTIVE_SHADED;
        }

        this.panelStyle = `transform:translateX(-${panelIndex * 100}%);`;
        this.activeIndexPanel = panelIndex;
    }

    /**
     * Selection removed from current panel.
     */
    unselectCurrentPanel() {
        const activePaginationItem =
            this.paginationItems[this.activeIndexPanel];
        const activePanelItem = this.panelItems[this.activeIndexPanel];

        if (!activePaginationItem || !activePanelItem) return;

        activePanelItem.ariaHidden = TRUE_STRING;
        activePaginationItem.tabIndex = '-1';
        activePaginationItem.ariaSelected = FALSE_STRING;
        if (this.indicatorVariant === 'shaded') {
            activePaginationItem.className = INDICATOR_ACTION_SHADED;
        } else {
            activePaginationItem.className = INDICATOR_ACTION;
        }
    }

    /**
     * Auto Scroll toggler method.
     */
    toggleAutoScroll() {
        /*eslint no-unused-expressions: ["error", { "allowTernary": true }]*/
        this.autoScrollOn ? this.pause() : this.play();
    }
}
