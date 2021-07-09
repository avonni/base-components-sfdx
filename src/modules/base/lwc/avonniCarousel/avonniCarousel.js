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
import { keyCodes } from 'c/utilsPrivate';
import {
    normalizeBoolean,
    normalizeString,
    normalizeArray
} from 'c/utilsPrivate';

const INDICATOR_ACTION = 'slds-carousel__indicator-action';
const INDICATOR_ACTION_SHADED =
    'slds-carousel__indicator-action avonni-carousel-progress-indicator-shaded-inactive';
const SLDS_ACTIVE = 'slds-is-active';
const SLDS_ACTIVE_SHADED =
    'slds-is-active avonni-carousel-progress-indicator-shaded-active';
const FALSE_STRING = 'false';
const TRUE_STRING = 'true';

const INDICATOR_VARIANTS = { valid: ['base', 'shaded'], default: 'base' };

const DEFAULT_ITEMS_PER_PANEL = 1;
const DEFAULT_SCROLL_DURATION = 5;
const DEFAULT_ASSISTIVE_TEXT_AUTOPLAY_BUTTON = 'Start / Stop auto-play';
const DEFAULT_ASSISTIVE_TEXT_PREVIOUS_PANEL = 'Previous Panel';
const DEFAULT_ASSISTIVE_TEXT_NEXT_PANEL = 'Next Panel';
const DEFAULT_AUTOCROLL_PLAY_ICON = 'utility:play';
const DEFAULT_AUTOCROLL_PAUSE_ICON = 'utility:pause';

const i18n = {
    nextPanel: DEFAULT_ASSISTIVE_TEXT_NEXT_PANEL,
    previousPanel: DEFAULT_ASSISTIVE_TEXT_PREVIOUS_PANEL,
    autoplayButton: DEFAULT_ASSISTIVE_TEXT_AUTOPLAY_BUTTON
};

export default class AvonniCarousel extends LightningElement {
    @api currentPanel;
    @api disableAutoRefresh;
    @api disableAutoScroll;
    @api hidePreviousNextPanelNavigation;
    @api isInfinite;
    @api scrollDuration = DEFAULT_SCROLL_DURATION;

    _assistiveText = {
        nextPanel: i18n.nextPanel,
        previousPanel: i18n.previousPanel,
        autoplayButton: i18n.autoplayButton
    };
    _carouselItems = [];
    _itemsPerPanel = DEFAULT_ITEMS_PER_PANEL;
    _initialRender = false;
    _indicatorVariant = INDICATOR_VARIANTS.default;
    _hideIndicator = false;
    _carouselContentHeight = 6.625;

    activeIndexPanel;
    autoScrollIcon = DEFAULT_AUTOCROLL_PLAY_ICON;
    autoScrollTimeOut;
    autoScrollOn;
    panelItems = [];
    paginationItems = [];
    panelStyle;

    connectedCallback() {
        this.initCarousel();
    }

    renderedCallback() {
        if (!this._initialRender) {
            if (!this.disableAutoScroll) {
                this.start();
            }
        }
        this._initialRender = true;
    }

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

    @api
    get items() {
        return this._carouselItems;
    }

    set items(value) {
        const allItems = normalizeArray(value);
        allItems.forEach((item) => {
            this._carouselItems.push({
                key: item.id,
                title: item.title,
                description: item.description,
                buttonLabel: item.buttonLabel || null,
                buttonIconName: item.buttonIconName,
                buttonIconPosition: item.buttonIconPosition,
                buttonVariant: item.buttonVariant,
                buttonDisabled: item.buttonDisabled,
                secondaryButtonLabel: item.secondaryButtonLabel || null,
                secondaryButtonIconName: item.secondaryButtonIconName,
                secondaryButtonIconPosition: item.secondaryButtonIconPosition,
                secondaryButtonVariant: item.secondaryButtonVariant,
                secondaryButtonDisabled: item.secondaryButtonDisabled,
                imageAssistiveText: item.imageAssistiveText || item.title,
                href: item.href,
                src: item.src
            });
        });
        if (this.isConnected) {
            this.initCarousel();
        }
    }

    @api
    get itemsPerPanel() {
        return this._itemsPerPanel;
    }

    set itemsPerPanel(value) {
        const number =
            typeof value === 'number' ? value : DEFAULT_ITEMS_PER_PANEL;
        this._itemsPerPanel = parseInt(number, 10);
    }

    @api
    get indicatorVariant() {
        return this._indicatorVariant;
    }

    set indicatorVariant(variant) {
        this._indicatorVariant = normalizeString(variant, {
            fallbackValue: INDICATOR_VARIANTS.default,
            validValues: INDICATOR_VARIANTS.valid
        });
        if (this.isConnected) {
            this.initCarousel();
        }
    }

    @api
    get hideIndicator() {
        return this._hideIndicator;
    }

    set hideIndicator(value) {
        this._hideIndicator = normalizeBoolean(value);
    }

    // Sets the width of each item, depending on the number of items per panel
    get carouselItemStyle() {
        const flexBasis = 100 / this.itemsPerPanel;
        return `flex-basis: ${flexBasis}%;`;
    }

    get previousPanelNavigationDisabled() {
        return !this.isInfinite ? this.activeIndexPanel === 0 : null;
    }

    get nextPanelNavigationDisabled() {
        return !this.isInfinite
            ? this.activeIndexPanel === this.paginationItems.length - 1
            : null;
    }

    // Change the button position depending if hideIndicator is true or false
    get computedAutoScrollAutoplayButton() {
        return this._hideIndicator
            ? 'avonni-carousel__autoscroll-button-without-indicator'
            : 'avonni-carousel__autoscroll-button-with-indicator';
    }

    initializePaginationItems(numberOfPanels) {
        for (let i = 0; i < numberOfPanels; i++) {
            const isItemActive = i === this.activeIndexPanel;
            if (this._indicatorVariant === 'base') {
                this.paginationItems.push({
                    key: i,
                    id: `pagination-item-${i}`,
                    className: isItemActive
                        ? INDICATOR_ACTION + ' ' + SLDS_ACTIVE
                        : INDICATOR_ACTION,
                    tabIndex: isItemActive ? '0' : '-1',
                    ariaSelected: isItemActive ? TRUE_STRING : FALSE_STRING,
                    tabTitle: `Tab ${i}`
                });
            } else if (this._indicatorVariant === 'shaded') {
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

    initializeCurrentPanel(numberOfPanels) {
        const firstPanel = parseInt(this.currentPanel, 10);
        this.activeIndexPanel = firstPanel < numberOfPanels ? firstPanel : 0;
    }

    // Creates an array of panels, each containing an array of items
    initializePanels() {
        const panelItems = [];
        let panelIndex = 0;
        for (
            let i = 0;
            i < this._carouselItems.length;
            i += this.itemsPerPanel
        ) {
            panelItems.push({
                index: panelIndex,
                key: `panel-${panelIndex}`,
                items: this._carouselItems.slice(i, i + this.itemsPerPanel),
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

    @api
    start() {
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

    startAutoScroll() {
        this.next();
        this.start();
    }

    @api
    pause() {
        clearTimeout(this.autoScrollTimeOut);
        this.autoScrollOn = false;
        this.autoScrollIcon = DEFAULT_AUTOCROLL_PLAY_ICON;
    }

    handleItemClicked(event) {
        const panelNumber = parseInt(
            event.currentTarget.dataset.panelIndex,
            10
        );
        const itemNumber = parseInt(event.currentTarget.dataset.itemIndex, 10);
        const itemData = this.panelItems[panelNumber].items[itemNumber];
        this.dispatchEvent(
            new CustomEvent('itemclick', {
                detail: {
                    item: itemData
                }
            })
        );
    }

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

    initializeCarouselHeight() {
        let carouselContentHeights = this.items.map((item) => {
            return item.buttonLabel && item.secondaryButtonLabel
                ? 12
                : item.buttonLabel || item.secondaryButtonLabel
                ? 8.5
                : 6.625;
        });
        this._carouselContentHeight = Math.max(...carouselContentHeights);
    }

    initCarousel() {
        const numberOfPanels = Math.ceil(
            this._carouselItems.length / this.itemsPerPanel
        );

        this.initializeCurrentPanel(numberOfPanels);
        this.initializePaginationItems(numberOfPanels);
        this.initializePanels();
        this.initializeCarouselHeight();
    }

    onPanelSelect(event) {
        const currentTarget = event.currentTarget;
        const itemIndex = parseInt(currentTarget.dataset.index, 10);
        this.pause();

        if (this.activeIndexPanel !== itemIndex) {
            this.unselectCurrentPanel();
            this.selectNewPanel(itemIndex);
        }
    }

    selectNewPanel(panelIndex) {
        const activePaginationItem = this.paginationItems[panelIndex];
        const activePanelItem = this.panelItems[panelIndex];

        if (!activePaginationItem || !activePanelItem) return;

        activePanelItem.ariaHidden = FALSE_STRING;
        activePaginationItem.tabIndex = '0';
        activePaginationItem.ariaHidden = TRUE_STRING;
        if (this._indicatorVariant === 'base') {
            activePaginationItem.className =
                INDICATOR_ACTION + ' ' + SLDS_ACTIVE;
        } else if (this._indicatorVariant === 'shaded') {
            activePaginationItem.className =
                INDICATOR_ACTION_SHADED + ' ' + SLDS_ACTIVE_SHADED;
        }

        this.panelStyle = `transform:translateX(-${panelIndex * 100}%);`;
        this.activeIndexPanel = panelIndex;
    }

    unselectCurrentPanel() {
        const activePaginationItem = this.paginationItems[
            this.activeIndexPanel
        ];
        const activePanelItem = this.panelItems[this.activeIndexPanel];

        if (!activePaginationItem || !activePanelItem) return;

        activePanelItem.ariaHidden = TRUE_STRING;
        activePaginationItem.tabIndex = '-1';
        activePaginationItem.ariaSelected = FALSE_STRING;
        if (this._indicatorVariant === 'shaded') {
            activePaginationItem.className = INDICATOR_ACTION_SHADED;
        } else {
            activePaginationItem.className = INDICATOR_ACTION;
        }
    }

    @api
    first() {
        this.selectNewPanel(0);
    }

    @api
    last() {
        this.selectNewPanel(this.paginationItems.length - 1);
    }

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

    toggleAutoScroll() {
        /*eslint no-unused-expressions: ["error", { "allowTernary": true }]*/
        this.autoScrollOn ? this.pause() : this.start();
    }

    get computedCarouselContentSize() {
        return `height: ${this._carouselContentHeight}rem`;
    }
}
