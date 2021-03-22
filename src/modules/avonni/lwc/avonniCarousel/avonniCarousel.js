import { LightningElement, api } from 'lwc';
import { keyCodes } from 'c/utilsPrivate';

const INDICATOR_ACTION = 'slds-carousel__indicator-action';
const SLDS_ACTIVE = 'slds-is-active';
const FALSE_STRING = 'false';
const TRUE_STRING = 'true';

const i18n = {
    nextPanel: 'Next Panel',
    previousPanel: 'Previous Panel',
    autoplayButton: 'Start / Stop auto-play'
};

export default class AvonniCarousel extends LightningElement {
    @api currentPanel;
    @api disableAutoRefresh;
    @api disableAutoScroll;
    @api hidePreviousNextPanelNavigation;
    @api isInfinite;
    @api scrollDuration = 5;

    _assistiveText = {
        nextPanel: i18n.nextPanel,
        previousPanel: i18n.previousPanel,
        autoplayButton: i18n.autoplayButton
    };
    _carouselItems = [];
    _itemsPerPanel = 1;
    _initialRender = true;

    activeIndexPanel;
    autoScrollIcon = 'utility:play';
    autoScrollTimeOut;
    autoScrollOn;
    panelItems = [];
    paginationItems = [];
    panelStyle;

    connectedCallback() {
        const numberOfPanels = Math.ceil(
            this._carouselItems.length / this.itemsPerPanel
        );

        this.initializeCurrentPanel(numberOfPanels);
        this.initializePaginationItems(numberOfPanels);
        this.initializePanels();
    }

    renderedCallback() {
        if (this._initialRender) {
            if (!this.disableAutoScroll) {
                this.setAutoScroll();
            }
        }
        this._initialRender = false;
    }

    @api
    get assistiveText() {
        return this._assistiveText;
    }

    set assistiveText(value) {
        this._assistiveText = {
            autoplayButton:
                value.autoplayButton || this._assistiveText.autoplayButton,
            nextPanel: value.nextPanel || this._assistiveText.nextPanel,
            previousPanel:
                value.previousPanel || this._assistiveText.previousPanel
        };
    }

    @api
    get items() {
        return this._carouselItems;
    }

    set items(allItems) {
        allItems.forEach((item) => {
            this._carouselItems.push({
                key: item.id,
                heading: item.heading,
                description: item.description,
                buttonLabel: item.buttonLabel || null,
                buttonIconName: item.buttonIconName,
                buttonIconPosition: item.buttonIconPosition,
                buttonVariant: item.buttonVariant,
                buttonDisabled: item.buttonDisabled,
                imageAssistiveText: item.imageAssistiveText || item.heading,
                href: item.href,
                src: item.src
            });
        });
    }

    @api
    get itemsPerPanel() {
        return this._itemsPerPanel;
    }

    set itemsPerPanel(number) {
        this._itemsPerPanel = parseInt(number, 10);
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

    initializePaginationItems(numberOfPanels) {
        for (let i = 0; i < numberOfPanels; i++) {
            const isItemActive = i === this.activeIndexPanel;
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

    setAutoScroll() {
        const scrollDuration = parseInt(this.scrollDuration, 10) * 1000;
        const carouselPanelsLength = this.panelItems.length;

        if (
            this.activeIndexPanel === carouselPanelsLength - 1 &&
            (this.disableAutoRefresh || !this.isInfinite)
        ) {
            this.cancelAutoScrollTimeOut();
            return;
        }

        this.cancelAutoScrollTimeOut();
        this.autoScrollTimeOut = setTimeout(
            this.startAutoScroll.bind(this),
            scrollDuration
        );

        this.autoScrollOn = true;
        this.autoScrollIcon = 'utility:pause';
    }

    startAutoScroll() {
        this.selectNextSibling();
        this.setAutoScroll();
    }

    cancelAutoScrollTimeOut() {
        clearTimeout(this.autoScrollTimeOut);
        this.autoScrollOn = false;
        this.autoScrollIcon = 'utility:play';
    }

    handleItemClicked(event) {
        const panelNumber = parseInt(
            event.currentTarget.dataset.panelIndex,
            10
        );
        const itemNumber = parseInt(event.currentTarget.dataset.itemIndex, 10);
        const itemData = this.panelItems[panelNumber].items[itemNumber];
        this.dispatchEvent(new CustomEvent('itemclick', { detail: itemData }));
    }

    keyDownHandler(event) {
        const key = event.keyCode;
        let indicatorActionsElements = this.indicatorActionsElements;

        if (key === keyCodes.right) {
            event.preventDefault();
            event.stopPropagation();

            this.cancelAutoScrollTimeOut();
            if (
                this.activeIndexPanel < this.panelItems.length - 1 ||
                this.isInfinite
            ) {
                this.selectNextSibling();
            }
        }

        if (key === keyCodes.left) {
            event.preventDefault();
            event.stopPropagation();

            this.cancelAutoScrollTimeOut();
            if (this.activeIndexPanel > 0 || this.isInfinite) {
                this.selectPreviousSibling();
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

    onPanelSelect(event) {
        const currentTarget = event.currentTarget;
        const itemIndex = parseInt(currentTarget.dataset.index, 10);
        this.cancelAutoScrollTimeOut();

        if (this.activeIndexPanel !== itemIndex) {
            this.unselectCurrentPanel();
            this.selectNewPanel(itemIndex);
        }
    }

    selectNewPanel(panelIndex) {
        const activePaginationItem = this.paginationItems[panelIndex];
        const activePanelItem = this.panelItems[panelIndex];

        activePanelItem.ariaHidden = FALSE_STRING;
        activePaginationItem.tabIndex = '0';
        activePaginationItem.ariaHidden = TRUE_STRING;
        activePaginationItem.className = INDICATOR_ACTION + ' ' + SLDS_ACTIVE;

        this.panelStyle = `transform:translateX(-${panelIndex * 100}%);`;
        this.activeIndexPanel = panelIndex;
    }

    unselectCurrentPanel() {
        const activePaginationItem = this.paginationItems[
            this.activeIndexPanel
        ];
        const activePanelItem = this.panelItems[this.activeIndexPanel];

        activePanelItem.ariaHidden = TRUE_STRING;
        activePaginationItem.tabIndex = '-1';
        activePaginationItem.ariaSelected = FALSE_STRING;
        activePaginationItem.className = INDICATOR_ACTION;
    }

    selectPreviousSibling() {
        this.cancelAutoScrollTimeOut();
        this.unselectCurrentPanel();
        if (this.activeIndexPanel > 0) {
            this.activeIndexPanel -= 1;
        } else {
            this.activeIndexPanel = this.paginationItems.length - 1;
        }
        this.selectNewPanel(this.activeIndexPanel);
    }

    selectNextSibling() {
        this.cancelAutoScrollTimeOut();
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
        this.autoScrollOn
            ? this.cancelAutoScrollTimeOut()
            : this.setAutoScroll();
    }
}
