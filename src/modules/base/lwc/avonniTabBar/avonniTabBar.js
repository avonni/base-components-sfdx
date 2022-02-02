import { LightningElement, api, track } from 'lwc';
import { classSet } from 'c/utils';
import { generateUUID } from 'c/utils';
import { normalizeArray } from 'c/utilsPrivate';

/**
 * @class
 * @description The Tab Bar component allows the user to separate information into logical sections based on functionality or use case.
 * @descriptor avonni-tab-bar
 * @storyId example-tab-bar--base
 * @public
 */
export default class AvonniTabBar extends LightningElement {
    _labels = [];
    _tabsHidden = 0;
    _defaultTab;

    @track visibleTabs;
    showHiddenTabsDropdown = false;
    denyDropDownBlur = false;

    connectedCallback() {
        this.initializeVisibleTabs();
        this.initializeEventListeners();
    }

    /**
     * List of tab labels used to separate information.
     *
     * @type {string[]}
     * @public
     */
    @api
    get labels() {
        return this._labels;
    }

    set labels(value) {
        this._labels = normalizeArray(value);
    }

    /**
     * Number of hidden tabs.
     *
     * @type {number}
     * @public
     */
    @api
    get tabsHidden() {
        return this._tabsHidden;
    }

    set tabsHidden(value) {
        this._tabsHidden = value;
    }

    /**
     * The label of the active tab by default.
     *
     * @type {string}
     * @public
     */
    @api
    get defaultTab() {
        return this._defaultTab;
    }

    set defaultTab(value) {
        this._defaultTab = value;
    }

    /**
     * Whether the tab bar contains tabs.
     * @type {boolean}
     */
    get hasTabs() {
        return this.labels.length > 0;
    }

    /**
     * Whether the tabs should be visible.
     * When the number of tabs hidden matches the number of tabs, this will block the selected tab from appearing in the tab bar.
     * @type {boolean}
     */
    get showTabs() {
        return this.tabsHidden < this.labels.length;
    }

    /**
     * Whether the overflow arrow should be visible.
     * @type {boolean}
     */
    get showOverflowArrow() {
        return this.tabsHidden > 0;
    }

    /**
     * A list of the labels of the hidden tabs.
     * @type {string[]}
     */
    get hiddenTabs() {
        let visibleTabsName = [];
        this.visibleTabs.forEach((tab) => visibleTabsName.push(tab.title));
        return this.labels.slice().filter((n) => !visibleTabsName.includes(n));
    }

    /**
     * Initializes the event listeners.
     * The keyup event is used to reset the state of the variable responsible for denying a blur of the dropdown.
     */
    initializeEventListeners() {
        this.template.addEventListener('keyup', () => {
            this.denyDropDownBlur = false;
        });
    }

    /**
     * Returns the computed CSS classes of a given tab during initialization.
     * @param {string} tabName - The name of the tab.
     * @return {string}
     */
    computedTabClass(tabName) {
        if (!this.defaultTab || !this.labels.includes(this.defaultTab)) {
            this._defaultTab = tabName;
        }
        const classes = classSet('slds-tabs_default__item');
        classes.add({ 'slds-is-active': tabName === this._defaultTab });
        return classes.toString();
    }

    /**
     * Initializes the visible tabs and computes their CSS classes.
     */
    initializeVisibleTabs() {
        this.visibleTabs = [];
        const nVisibleTabs = Math.max(0, this.labels.length - this.tabsHidden);
        if (nVisibleTabs === 0) return;

        if (this.labels.indexOf(this.defaultTab) < nVisibleTabs) {
            for (let i = 0; i < nVisibleTabs; i++) {
                this.visibleTabs.push({
                    id: generateUUID(),
                    title: this.labels[i],
                    classes: this.computedTabClass(this.labels[i]),
                    tabIndex: this.defaultTab === this.labels[i] ? 0 : -1,
                    ariaSelected: this.defaultTab === this.labels[i]
                });
            }
        } else {
            // The default tab is in the hidden tabs and will be swapped a visible tab.
            for (let i = 0; i < nVisibleTabs - 1; i++) {
                this.visibleTabs.push({
                    id: generateUUID(),
                    title: this.labels[i],
                    classes: this.computedTabClass(this.labels[i]),
                    tabIndex: -1,
                    ariaSelected: false
                });
            }
            this.visibleTabs.push({
                id: generateUUID(),
                title: this.defaultTab,
                classes: this.computedTabClass(this.defaultTab),
                tabIndex: 0,
                ariaSelected: true
            });
        }
    }

    /**
     * Handles a click on a visible tab.
     * @param {Event} event
     */
    handleTabClick(event) {
        event.preventDefault();

        const tabName = event.target.title;

        for (let i = 0; i < this.visibleTabs.length; i++) {
            this.visibleTabs[i].classes = classSet('slds-tabs_default__item')
                .add({
                    'slds-is-active': this.visibleTabs[i].title === tabName
                })
                .toString();
            this.visibleTabs[i].tabIndex =
                this.visibleTabs[i].title === tabName ? 0 : -1;
            this.visibleTabs[i].ariaSelected =
                this.visibleTabs[i].title === tabName;
        }

        this.dispatchTabChange(event.target.title);
    }

    /**
     * Handles a click on the hidden tabs menu button.
     * @param {Event} event
     */
    handleShowHiddenTabsClick(event) {
        this.showHiddenTabsDropdown = !this.showHiddenTabsDropdown;

        if (this.showHiddenTabsDropdown) {
            const button = event.currentTarget;
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => {
                button.nextSibling.firstChild.firstChild.firstChild.focus();
            }, 0);
        }
    }

    /**
     * Handles a click on a hidden tab.
     * @param {Event} event
     */
    changeLastCategory(event) {
        const newTabName = event.target.title;

        for (let i = 0; i < this.visibleTabs.length - 1; i++) {
            this.visibleTabs[i].classes = classSet(
                'slds-tabs_default__item'
            ).toString();
            this.visibleTabs[i].tabIndex = -1;
            this.visibleTabs[i].ariaSelected = false;
        }

        this.visibleTabs.splice(this.visibleTabs.length - 1, 1);
        this.visibleTabs.push({
            id: generateUUID(),
            title: newTabName,
            classes: classSet(
                'slds-tabs_default__item slds-is-active'
            ).toString(),
            tabIndex: 0,
            ariaSelected: true
        });

        this.dispatchTabChange(newTabName);

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            const links = [...this.template.querySelectorAll('a')];
            if (links && links[this.labels.length - this.tabsHidden - 1]) {
                links[this.labels.length - this.tabsHidden - 1].focus();
            }
        }, 0);
    }

    /**
     * Dispatches a 'select' event for a tab change.
     * @param {string} tab - The name of the selected tab.
     */
    dispatchTabChange(tab) {
        /**
         * The event fired when a tab is selected.
         *
         * @event
         * @name select
         * @param {string} tab Name of the selected tab.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('select', {
                detail: {
                    value: tab
                }
            })
        );
    }

    /**
     * Handles a blur of any element of the Tab Bar component.
     * If no Tab Bar element is focused, a 'blur' event is dispatched.
     */
    triggerBlur() {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            if (!this.template.activeElement) {
                this.dispatchEvent(new CustomEvent('blur'));
            }
        }, 0);
    }

    /**
     * Handles a blur of the hidden tabs menu.
     * @param {Event} event
     */
    dropdownBlur(event) {
        let isMenuButton = false;
        if (event.relatedTarget) {
            isMenuButton = event.relatedTarget.tagName === 'BUTTON';
        }

        if (!this.denyDropDownBlur && !isMenuButton) {
            this.showHiddenTabsDropdown = false;
            this.triggerBlur();
        }
    }

    /**
     * Handles a focus on the hidden tabs menu button.
     * This mimics the mouseover effect on the button in case of keyboard navigation.
     * @param {Event} event
     */
    handleDropDownButtonFocus(event) {
        event.currentTarget.parentElement.parentElement.classList.add(
            'slds-is-active'
        );
    }

    /**
     * Handles a blur of the hidden tabs menu button.
     * The mouseover effect on the button is removed.
     * @param {Event} event
     */
    handleDropDownButtonBlur(event) {
        event.currentTarget.parentElement.parentElement.classList.remove(
            'slds-is-active'
        );
        this.triggerBlur();
    }

    /**
     * Handles a keydown event when the hidden tabs menu is opened.
     * The dropdown options can be navigated using the up and down arrows.
     * The Enter key adds the selected option to the visible tabs and places focus on it.
     * The Escape key closes the dropdown and places the focus on the menu button.
     * The Tab key closes the dropdown and places the focus on the next element.
     * @param {Event} event
     */
    handleDropDownItemKeyDown(event) {
        this.denyDropDownBlur = true;
        if (event.keyCode === 40) {
            // Down arrow
            if (event.currentTarget.nextSibling) {
                event.currentTarget.nextSibling.firstChild.focus();
            } else {
                event.currentTarget.parentElement.firstChild.firstChild.focus();
            }
        } else if (event.keyCode === 38) {
            // Up arrow
            if (event.currentTarget.previousSibling) {
                event.currentTarget.previousSibling.firstChild.focus();
            } else {
                event.currentTarget.parentElement.lastChild.firstChild.focus();
            }
        } else if (event.keyCode === 13) {
            // Enter key
            this.changeLastCategory(event);
            this.showHiddenTabsDropdown = false;
        } else if (event.keyCode === 27 || event.keyCode === 9) {
            // Escape key and Tab key
            this.showHiddenTabsDropdown = false;
            this.template.querySelector('button').focus();
        }
    }

    /**
     * Handles a keydown event when the hidden tabs menu is opened.
     * Tabs can be navigated using the side arrows.
     * @param {Event} event
     */
    handleVisibleTabKeyDown(event) {
        if (event.keyCode === 39) {
            // Right arrow
            for (let i = 0; i < this.visibleTabs.length; i++) {
                this.visibleTabs[i].tabIndex = 0;
            }
            if (
                event.currentTarget.nextSibling &&
                event.currentTarget.nextSibling.title !== 'More icons'
            ) {
                event.currentTarget.nextSibling.firstChild.focus();
            } else {
                event.currentTarget.parentElement.firstChild.firstChild.focus();
            }
        } else if (event.keyCode === 37) {
            // Left arrow
            for (let i = 0; i < this.visibleTabs.length; i++) {
                this.visibleTabs[i].tabIndex = 0;
            }
            if (event.currentTarget.previousSibling) {
                event.currentTarget.previousSibling.firstChild.focus();
            } else if (
                event.currentTarget.parentElement.lastChild.title ===
                'More icons'
            ) {
                event.currentTarget.parentElement.lastChild.previousSibling.firstChild.focus();
            } else {
                event.currentTarget.parentElement.lastChild.firstChild.focus();
            }
        } else if (event.keyCode === 9) {
            // Tab key
            for (let i = 0; i < this.visibleTabs.length; i++) {
                if (!this.visibleTabs[i].ariaSelected) {
                    this.visibleTabs[i].tabIndex = -1;
                }
            }
        }
    }
}
