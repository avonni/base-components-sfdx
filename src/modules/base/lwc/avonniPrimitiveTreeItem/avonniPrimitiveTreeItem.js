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
import { classSet, generateUUID } from 'c/utils';
import { keyCodes, normalizeArray, normalizeBoolean } from 'c/utilsPrivate';

const i18n = {
    collapseBranch: 'Collapse Branch',
    expandBranch: 'Expand Branch'
};

const POPOVER_FOOTER_HEIGHT = 55;
const DEFAULT_EDIT_FIELDS = [
    'label',
    'metatext',
    'name',
    'href',
    'expanded',
    'disabled',
    'isLoading'
];

/**
 * @class
 * @descriptor avonni-primitive-tree-item
 */
export default class AvonniPrimitiveTreeItem extends LightningElement {
    /**
     * The alternative text used to describe the reason for the wait and need for a spinner.
     *
     * @type {string}
     * @public
     */
    @api loadingStateAlternativeText;

    /**
     * Unique key of the item.
     *
     * @type {string}
     * @public
     * @required
     */
    @api nodeKey;

    _actions = [];
    _actionsWhenDisabled = [];
    _allowInlineEdit = false;
    _avatar;
    _childItems = [];
    _disabled = false;
    _editableFields = DEFAULT_EDIT_FIELDS;
    _fields = [];
    _href;
    _expanded = false;
    _independentMultiSelect = false;
    _isLeaf = false;
    _isLoading = false;
    _label;
    _level;
    _metatext;
    _name;
    _selected = false;
    _showCheckbox = false;
    _sortable = false;

    buttonActions = [];
    labelIsEdited = false;
    menuActions = [];
    draftValues = {};
    hasError = false;
    popoverVisible = false;
    _checkboxIsIndeterminate = false;
    _focusOn = false;
    _connected = false;
    _menuIsOpen = false;

    connectedCallback() {
        /**
         * The event fired when the item is inserted into the DOM.
         *
         * @event
         * @name privateregisteritem
         * @param {function} bounds Callback function to get the bounds of the item.
         * @param {function} focus Callback function to set the focus on the item.
         * @param {function} removeBorder Callback function to remove the border of the item.
         * @param {function} setBorder Callback function to set the border of the item.
         * @param {function} setSelected Callback function to set the selected state of the item.
         * @param {function} unfocus Callback function to remove the focus from the item.
         * @param {string} key Unique key of the item.
         * @bubbles
         * @composed
         */
        this.dispatchEvent(
            new CustomEvent('privateregisteritem', {
                composed: true,
                bubbles: true,
                detail: {
                    bounds: this.getBounds,
                    closePopover: this.closePopover,
                    focus: this.focusChild,
                    removeBorder: this.removeBorder,
                    setBorder: this.setBorder,
                    setSelected: this.setSelected,
                    unfocus: this.unfocusChild,
                    key: this.nodeKey
                }
            })
        );

        this.addEventListener('keydown', this.handleKeydown);
        this.addEventListener('mousedown', this.handleMouseDown);
        this.splitActions();
        this.computeSelection();
        this._connected = true;
    }

    renderedCallback() {
        if (this._focusOn) {
            const focusedElement = this.template.querySelector(
                `[data-element-id="${this._focusOn}"]`
            );
            if (focusedElement) focusedElement.focus();
            this._focusOn = null;
        }

        if (this.popoverVisible) this.positionPopover();
        if (this.level) this.updateLevel();
        this.updateCheckboxStatus();
    }

    disconnectedCallback() {
        this.removeEventListener('keydown', this.handleKeydown);
        this.removeEventListener('mousedown', this.handleMouseDown);
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Array of action objects to display to the riht of the item header.
     *
     * @type {object[]}
     * @public
     */
    @api
    get actions() {
        return this._actions;
    }
    set actions(value) {
        this._actions = normalizeArray(value);
        if (this._connected) this.splitActions();
    }

    /**
     * Array of action objects to display to the right of the item header, when the item is disabled.
     *
     * @type {object[]}
     * @public
     */
    @api
    get actionsWhenDisabled() {
        return this._actionsWhenDisabled;
    }
    set actionsWhenDisabled(value) {
        this._actionsWhenDisabled = normalizeArray(value);
        if (this._connected) this.splitActions();
    }

    /**
     * If present, the item label can be edited by double-clicking on it.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get allowInlineEdit() {
        return this._allowInlineEdit;
    }
    set allowInlineEdit(value) {
        this._allowInlineEdit = normalizeBoolean(value);
    }

    /**
     * Avatar object. If present, the avatar is displayed to the left of the item.
     *
     * @type {object}
     * @public
     */
    @api
    get avatar() {
        return this._avatar;
    }
    set avatar(value) {
        this._avatar = value instanceof Object ? value : null;
    }

    /**
     * Nested item objects.
     *
     * @type {object[]}
     * @public
     */
    @api
    get childItems() {
        return this._childItems;
    }
    set childItems(value) {
        this._childItems = normalizeArray(value);
        if (this._connected) this.computeSelection();
    }

    /**
     * Array of fields that should be visible in the item edit form. The item edit form can be opened through the standard edit action.
     *
     * @type {string[]}
     * @default ['label', 'metatext', 'name', 'href', 'expanded', 'disabled', 'isLoading']
     * @public
     */
    @api
    get editableFields() {
        return this._editableFields;
    }
    set editableFields(value) {
        this._editableFields = normalizeArray(value);
        if (this.popoverVisible) this.togglePopoverVisibility();
    }

    /**
     * Array of output data objects. See Output Data for valid keys. The fields are visible only when the item is expanded.
     *
     * @type {object[]}
     * @public
     */
    @api
    get fields() {
        return this._fields;
    }
    set fields(value) {
        this._fields = normalizeArray(value);
    }

    /**
     * If the item label should be a link, URL of the link.
     * Links are incompatible with inline edition and multi-select trees.
     *
     * @type {string}
     * @public
     */
    @api
    get href() {
        return this._href;
    }
    set href(value) {
        this._href = value;
    }

    /**
     * If present, the item is disabled. A disabled item is grayed out and can't be focused.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = normalizeBoolean(value);
        if (this._connected) this.splitActions();
    }

    /**
     * If present, the item selection will not extend to its children.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get independentMultiSelect() {
        return this._independentMultiSelect;
    }
    set independentMultiSelect(value) {
        this._independentMultiSelect = normalizeBoolean(value);
        if (this._connected) this.computeSelection();
    }

    /**
     * If present, a loading spinner is visible when the item is expanded.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get isLoading() {
        return this._isLoading;
    }
    set isLoading(value) {
        this._isLoading = normalizeBoolean(value);
    }

    /**
     * If present, the item branch is expanded. An expanded branch displays its nested items visually.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get expanded() {
        return this._expanded;
    }
    set expanded(value) {
        this._expanded = normalizeBoolean(value);
    }

    /**
     * If present, the item is not expandable.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get isLeaf() {
        return this._isLeaf;
    }
    set isLeaf(value) {
        this._isLeaf = normalizeBoolean(value);
    }

    /**
     * Label of the item.
     *
     * @type {string}
     * @required
     * @public
     */
    @api
    get label() {
        return this._label;
    }
    set label(value) {
        this._label = value;
    }

    /**
     * Level of the item in the tree.
     *
     * @type {number}
     * @public
     */
    @api
    get level() {
        return this._level;
    }
    set level(value) {
        this._level = value;
        this.updateLevel();
    }

    /**
     * Text to provide users with supplemental information and aid with identification or disambiguation.
     *
     * @type {string}
     * @public
     */
    @api
    get metatext() {
        return this._metatext;
    }
    set metatext(value) {
        this._metatext = value;
    }

    /**
     * The unique name of the item. It will be returned by the <code>onselect</code> event handler.
     *
     * @type {string}
     * @required
     * @public
     */
    @api
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }

    /**
     * If present, the item is selected.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get selected() {
        return this._selected;
    }
    set selected(value) {
        this._selected = normalizeBoolean(value);
        if (this._connected) this.computeSelection();
    }

    /**
     * If present, a checkbox is displayed to the left of the label, and is used to show the selection state of the item.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get showCheckbox() {
        return this._showCheckbox;
    }
    set showCheckbox(value) {
        this._showCheckbox = normalizeBoolean(value);
        if (this._connected) this.computeSelection();
    }

    /**
     * If present, the item is sortable in its parent.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get sortable() {
        return this._sortable;
    }
    set sortable(value) {
        this._sortable = normalizeBoolean(value);
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Array of computed edit field objects.
     *
     * @type {object[]}
     */
    get computedEditableFields() {
        return this.editableFields.map((field) => {
            return {
                checked: this.draftValues[field],
                label: this.camelCaseToStartCase(field),
                name: field,
                required: field === 'name' || field === 'label',
                type:
                    typeof this.draftValues[field] === 'boolean'
                        ? 'toggle'
                        : 'text',
                value: this.draftValues[field]
            };
        });
    }

    /**
     * Name of the expand button icon.
     *
     * @type {string}
     */
    get expandButtonIconName() {
        return document.dir === 'rtl'
            ? 'utility:chevronleft'
            : 'utility:chevronright';
    }

    /**
     * CSS class of the expand button.
     *
     * @type {string}
     * @public
     */
    get expandButtonClass() {
        return classSet(
            'slds-m-right_x-small slds-p-vertical_xx-small avonni-primitive-tree-item__chevron'
        )
            .add({
                'slds-hidden': this.isLeaf || this.disabled,
                'avonni-primitive-tree-item__chevron_expanded': this.expanded,
                'slds-p-top_xx-small': this.metatext
            })
            .toString();
    }

    /**
     * Label of the expand button.
     *
     * @type {string}
     * @default Expand Branch
     */
    get expandButtonLabel() {
        if (this.expanded) {
            return i18n.collapseBranch;
        }
        return i18n.expandBranch;
    }

    /**
     * Value of the expand button tabindex attribute.
     *
     * @type {string}
     */
    get expandButtonTabindex() {
        return this.showCheckbox ? '0' : '-1';
    }

    /**
     * Main HTML element of the item.
     *
     * @type {HTMLElement}
     */
    get itemElement() {
        return this.template.querySelector('[data-element-id="div-item"]');
    }

    /**
     * CSS class of the label.
     *
     * @type {string}
     */
    get labelClass() {
        return classSet('slds-truncate')
            .add({
                'slds-p-vertical_xx-small': !this.buttonActions.length
            })
            .toString();
    }

    /**
     * True if the child items should be visible.
     *
     * @type {boolean}
     */
    get showChildren() {
        return !this.disabled && this.expanded;
    }

    /**
     * True if the fields should be visible.
     *
     * @type {boolean}
     */
    get showFields() {
        return this.fields.length && !this.disabled && this.expanded;
    }

    /**
     * True if the label and metatext are links.
     *
     * @type {boolean}
     */
    get showLink() {
        return !this.disabled && !this.allowInlineEdit && this.href;
    }

    /**
     * Unique generated key.
     *
     * @type {string}
     */
    get uniqueKey() {
        return generateUUID();
    }

    /**
     * Array of visible action objects.
     *
     * @type {object[]}
     */
    get visibleActions() {
        return this.disabled ? this.actionsWhenDisabled : this.actions;
    }

    /**
     * CSS class of the wrapper div.
     *
     * @type {string}
     */
    get wrapperClass() {
        return classSet('slds-is-relative')
            .add({
                'avonni-primitive-tree-item__single-selection':
                    !this.showCheckbox
            })
            .toString();
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Set the focus on the first focusable element inside the item.
     *
     * @public
     */
    @api
    focusContent() {
        if (!this.isLeaf && !this.disabled) {
            // Set focus on the expand button
            const expandButton = this.template.querySelector(
                '[data-element-id="lightning-button-icon-expand"]'
            );
            if (expandButton) expandButton.focus();
        } else if (this.showCheckbox) {
            // Set focus on the checkbox
            const checkbox = this.template.querySelector(
                '[data-element-id="input-checkbox"]'
            );
            if (checkbox) checkbox.focus();
        } else if (this.href) {
            // Set focus on the link
            const link = this.template.querySelector(
                '[data-group-name="link"]'
            );
            if (link) link.focus();
        } else if (this.buttonActions.length) {
            // Set focus on the action icons
            const buttonIcon = this.template.querySelector(
                '[data-element-id="lightning-button-icon-action"]'
            );
            if (buttonIcon) buttonIcon.focus();
        } else if (this.menuActions.length) {
            // Set focus on the action menu
            const buttonMenu = this.template.querySelector(
                '[data-element-id="lightning-button-menu"]'
            );
            if (buttonMenu) buttonMenu.focus();
        }
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Transform a camel case string to a start case string.
     *
     * @param {string} string String to transform.
     * @returns {string} String in start case.
     */
    camelCaseToStartCase(string) {
        const result = string.replace(/([A-Z])/g, ' $1');
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    closePopover = () => {
        if (this.popoverVisible) {
            this.togglePopoverVisibility();
        }
    };

    /**
     * Compute the selection state of the item, depending on the selection state of its children.
     */
    computeSelection() {
        if (
            !this.selected &&
            this.showCheckbox &&
            this.childItems.length &&
            !this.independentMultiSelect
        ) {
            const selectedChildren = this.childItems.filter(
                (child) => child.selected
            );

            if (selectedChildren.length === this.childItems.length) {
                // All children are selected
                this._selected = true;
                this._checkboxIsIndeterminate = false;
            } else {
                // Some or no children are selected
                this._selected = false;
                this._checkboxIsIndeterminate = !!selectedChildren.length;
            }
        } else {
            this._checkboxIsIndeterminate = false;
        }

        if (this.showCheckbox) {
            this.ariaSelected = this.selected ? 'true' : 'false';

            // Force the children update
            const items = this.template.querySelectorAll(
                '[data-element-id="avonni-primitive-tree-item"]'
            );
            if (this.childItems.length === items.length) {
                items.forEach((item, index) => {
                    item.selected = this.childItems[index].selected;
                });
            }
        }
        this.updateCheckboxStatus();
    }

    /**
     * Set the focus on a child item.
     *
     * @param {string} childKey Key of the child item receiving focus.
     * @param {boolean} shouldFocus If true, the child item should be focused.
     * @param {boolean} shouldSelect If true, the child item should be visually selected.
     */
    focusChild = (childKey, shouldFocus, shouldSelect) => {
        const child = this.getImmediateChildItem(childKey);
        if (child) {
            if (child.tabIndex !== '0') {
                child.tabIndex = '0';
            }
            if (shouldFocus && this.showCheckbox) {
                child.focusContent();
            } else if (shouldFocus) {
                child.focus();
            }
            if (shouldSelect) {
                child.ariaSelected = true;
            }
        }
    };

    /**
     * Get the bounds of the item.
     *
     * @returns {DOMRect} Bounds of the item.
     */
    getBounds = () => {
        if (this.itemElement) {
            return this.itemElement.getBoundingClientRect();
        }
        return {};
    };

    /**
     * Get the HTML element of a child item.
     *
     * @param {string} key Key of the child item.
     * @returns {HTMLElement} Element of the child item.
     */
    getImmediateChildItem(key) {
        return this.template.querySelector(
            `[data-element-id="avonni-primitive-tree-item"][data-key="${key}"]`
        );
    }

    /**
     * Hide the action buttons.
     */
    hideBranchButtons() {
        if (!this.popoverVisible && this.visibleActions.length) {
            this.template.querySelector(
                '[data-element-id="div-branch-buttons"]'
            ).style.opacity = 0;

            // Close button menu
            if (this._menuIsOpen) {
                const menu = this.template.querySelector(
                    '[data-element-id="lightning-button-menu"]'
                );
                if (menu) menu.click();
            }
        }
    }

    /**
     * Position the edit form popover.
     */
    positionPopover() {
        const popoverBody = this.template.querySelector(
            '[data-element-id="div-popover-body"]'
        );
        const topInWindow = popoverBody.getBoundingClientRect().top;
        const maxHeight =
            window.innerHeight - topInWindow - POPOVER_FOOTER_HEIGHT;
        popoverBody.style.maxHeight = `${maxHeight}px`;
    }

    /**
     * Remove the border displayed by the parent tree when an item is dragged over this item.
     */
    removeBorder = () => {
        if (!this.itemElement) return;
        this.itemElement.classList.remove(
            'avonni-primitive-tree-item__item_border-top'
        );
        this.itemElement.classList.remove(
            'avonni-primitive-tree-item__item_border-bottom'
        );
        this.itemElement.classList.remove(
            'avonni-primitive-tree-item__item_border'
        );
        this.itemElement.style = '';
    };

    /**
     * Display a border when an item is dragged over this item in the parent tree.
     *
     * @param {string} position Position of the border.
     * @param {number} level Level of the tree the border should extend to.
     */
    setBorder = (position, level) => {
        if (!this.itemElement) return;

        this.removeBorder();
        switch (position) {
            case 'top':
                this.itemElement.classList.add(
                    'avonni-primitive-tree-item__item_border-top'
                );
                break;
            case 'bottom':
                this.itemElement.classList.add(
                    'avonni-primitive-tree-item__item_border-bottom'
                );
                if (level) {
                    this.itemElement.style = `--avonni-tree-item-spacing-inline-start-border: ${level}rem;`;
                }
                break;
            default:
                this.itemElement.classList.add(
                    'avonni-primitive-tree-item__item_border'
                );
                break;
        }
    };

    /**
     * Set the selected state of the item.
     *
     * @param {boolean} value New value of the selected property.
     */
    setSelected = (value) => {
        this._selected = value;
        this.computeSelection();
    };

    /**
     * Display the action buttons.
     */
    showBranchButtons() {
        if (!this.popoverVisible && this.visibleActions.length) {
            this.template.querySelector(
                '[data-element-id="div-branch-buttons"]'
            ).style.opacity = 1;
        }
    }

    /**
     * Split the visible actions between the ones that are always visible as icons, and the ones that are hidden inside the action button menu.
     */
    splitActions() {
        const buttonActions = [];
        const menuActions = [];
        this.visibleActions.forEach((action) => {
            if (action.visible) {
                buttonActions.push(action);
            } else {
                menuActions.push(action);
            }
        });
        this.buttonActions = buttonActions;
        this.menuActions = menuActions;
    }

    /**
     * Toggle the edit popover visibility.
     */
    togglePopoverVisibility = () => {
        if (this.popoverVisible) {
            this.draftValues = {};
        } else {
            this.labelIsEdited = false;
            this._focusOn = 'lightning-button-icon-close';
            this.editableFields.forEach((field) => {
                this.draftValues[field] = this[field];
            });
        }

        this.popoverVisible = !this.popoverVisible;
        this.hideBranchButtons();
    };

    /**
     * Remove the visual selection of a child item.
     */
    unfocusChild = () => {
        this.ariaSelected = 'false';
        this.removeAttribute('tabindex');
    };

    /**
     * Set the indeterminate state of the checkbox.
     */
    updateCheckboxStatus() {
        const checkbox = this.template.querySelector(
            '[data-element-id="input-checkbox"]'
        );
        if (checkbox) {
            checkbox.indeterminate = this._checkboxIsIndeterminate;
        }
    }

    /**
     * Update the visual level offset of the item.
     */
    updateLevel() {
        const wrapper = this.template.querySelector(
            '[data-element-id="div-wrapper"]'
        );
        if (wrapper)
            wrapper.style = `--avonni-tree-item-spacing-inline-left: ${this.level}rem;`;
    }

    /**
     * Validate a required input. If the input is invalid, disable the save button of the edit form.
     *
     * @param {HTMLElement} input Input element to validate.
     */
    validate(input) {
        if (input.value.length === 0) {
            input.setCustomValidity('Cannot be empty');
            input.reportValidity();
            this.hasError = true;
            return false;
        }
        input.setCustomValidity('');
        input.reportValidity();
        this.hasError = false;
        return true;
    }

    /*
     * ------------------------------------------------------------
     *  EVENT HANDLERS AND DISPATCHERS
     * -------------------------------------------------------------
     */

    /**
     * Handle a click on an action.
     *
     * @param {Event} event
     */
    handleActionClick(event) {
        const name = event.detail.value || event.currentTarget.name;
        /**
         * The event fired when an action is clicked.
         *
         * @event
         * @name privateactionclick
         * @param {string} key Unique key of the item.
         * @param {string} name Unique name of the item.
         * @bubbles
         * @cancelable
         * @composed
         */
        const actionClickEvent = new CustomEvent('privateactionclick', {
            detail: {
                bounds: this.getBounds(),
                key: this.nodeKey,
                name
            },
            cancelable: true,
            composed: true,
            bubbles: true
        });
        this.dispatchEvent(actionClickEvent);

        if (name === 'edit' && !actionClickEvent.defaultPrevented) {
            this.togglePopoverVisibility();
        }
    }

    /**
     * Handle a key pressed on the action menu. Prevent the scroll if the space bar is pressed.
     *
     * @param {Event} event
     */
    handleActionMenuKeyDown(event) {
        if (event.key === ' ' || event.key === 'Spacebar') {
            event.preventDefault();
        }
    }

    /**
     * Handle the closing of the action button menu.
     */
    handleActionMenuClose() {
        this._menuIsOpen = false;
    }

    /**
     * Handle the opening of the action button menu.
     */
    handleActionMenuOpen() {
        this._menuIsOpen = true;
    }

    /**
     * Handle a click on the item.
     *
     * @param {Event} event
     */
    handleClick(event) {
        if (!this.disabled) {
            let target = 'anchor';
            if (
                event.target.dataset.elementId ===
                'lightning-button-icon-expand'
            ) {
                target = 'chevron';
            } else if (event.target.tagName === 'LIGHTNING-INPUT') {
                target = 'input';
            } else if (event.target.tagName === 'LIGHTNING-BUTTON-MENU') {
                target = 'menu';
            } else if (event.target.tagName === 'LIGHTNING-BUTTON-ICON') {
                target = 'icon';
            }

            if (this.showCheckbox && target === 'anchor') {
                this._selected = !this.selected;
                this._checkboxIsIndeterminate = false;
            }

            this.dispatchClick(target, event);
        }
    }

    /**
     * Handle a click on the "done" button of the edit form.
     */
    handleDone() {
        Object.entries(this.draftValues).forEach(([key, value]) => {
            this[`_${key}`] = value;
        });

        this.dispatchChange();
        this._isLeaf = !this.isLoading && this.childItems.length === 0;
        this.togglePopoverVisibility();
        this.splitActions();
    }

    /**
     * Handle the blur of an edit form input.
     *
     * @param {Event} event
     */
    handleEditInputBlur(event) {
        if (event.currentTarget.required) {
            this.validate(event.currentTarget);
        }
    }

    /**
     * Handle the focus on the expand button.
     */
    handleExpandButtonFocus() {
        if (this.showCheckbox) return;

        this.dispatchEvent(
            new CustomEvent('focus', {
                detail: {
                    key: this.nodeKey
                },
                bubbles: true
            })
        );
    }

    /**
     * Handle a change in an edit form input.
     *
     * @param {Event} event
     */
    handleInputChange(event) {
        event.stopPropagation();
        const name = event.currentTarget.name;
        const { checked, value } = event.detail;
        this.draftValues[name] = checked !== undefined ? checked : value;
    }

    /**
     * Handle a key down on the item.
     *
     * @param {Event} event
     */
    handleKeydown = (event) => {
        if (this.popoverVisible) return;
        switch (event.keyCode) {
            case keyCodes.enter: {
                this.preventDefaultAndStopPropagation(event);
                const link = this.template.querySelector(
                    '[data-element-id="a-label-link"]'
                );
                if (link) {
                    link.click();
                } else if (this.allowInlineEdit) {
                    this.handleLabelDoubleClick();
                }
                break;
            }
            case keyCodes.up:
            case keyCodes.down:
            case keyCodes.right:
            case keyCodes.left:
            case keyCodes.home:
            case keyCodes.end:
                this.preventDefaultAndStopPropagation(event);
                this.dispatchEvent(
                    new CustomEvent('privateitemkeydown', {
                        bubbles: true,
                        composed: true,
                        cancelable: true,
                        detail: {
                            key: this.nodeKey,
                            keyCode: event.keyCode
                        }
                    })
                );
                break;
            default:
                break;
        }
    };

    /**
     * Handle a double click on the label.
     */
    handleLabelDoubleClick() {
        if (!this.allowInlineEdit || this.disabled) return;

        if (this.popoverVisible) this.togglePopoverVisibility();
        this.labelIsEdited = true;
        this.draftValues.label = this.label;
        this._focusOn = 'lightning-input-inline-label';
    }

    /**
     * Handle a key down on the label input, when it is edited inline.
     *
     * @param {Event} event
     */
    handleLabelInlineKeyUp(event) {
        event.stopPropagation();
        this.draftValues.label = event.currentTarget.value;

        if (event.key === 'Enter') {
            this.handleSaveLabelInlineEdit();
        } else if (event.key === 'Escape') {
            this.draftValues = {};
            this.labelIsEdited = false;
        }
    }

    /**
     * Handle a mouse down on the item links.
     *
     * @param {Event} event
     */
    handleLinkMouseDown(event) {
        if (!this.sortable) return;

        // Prevent the link from being dragged,
        // to allow for dragging the whole item
        event.preventDefault();
    }

    /**
     * Handle the saving of the inline edition of the label.
     */
    handleSaveLabelInlineEdit() {
        const labelInput = this.template.querySelector(
            '[data-element-id="lightning-input-inline-label"]'
        );
        if (!labelInput || !this.validate(labelInput)) return;

        this._label = this.draftValues.label;
        this.draftValues = {};
        this.labelIsEdited = false;
        this.dispatchChange();
    }

    /**
     * Handle a mouse down on the item.
     *
     * @param {Event} event
     */
    handleMouseDown = (event) => {
        if (!this.sortable) return;
        event.stopPropagation();

        this.dispatchEvent(
            new CustomEvent('privatemousedown', {
                detail: {
                    key: this.nodeKey,
                    name: this.name
                },
                bubbles: true,
                composed: true
            })
        );
    };

    /**
     * Handle a key down on the close button of the edit form popover.
     *
     * @param {Event} event
     */
    handlePopoverCloseKeyDown(event) {
        // Trap the keyboard focus inside the popover
        if (event.keyCode === keyCodes.tab && event.shiftKey) {
            this.template
                .querySelector('[data-element-id="lightning-button-done"]')
                .focus();
            event.preventDefault();
        }
    }

    /**
     * Handle a mouse down on the "done" button of the edit form popover.
     *
     * @param {Event} event
     */
    handlePopoverDoneKeyDown(event) {
        // Trap the keyboard focus inside the popover
        if (event.keyCode === keyCodes.tab && !event.shiftKey) {
            this.template
                .querySelector(
                    '[data-element-id="lightning-button-icon-close"]'
                )
                .focus();
            event.preventDefault();
        }
    }

    /**
     * Dispatch the change event.
     */
    dispatchChange() {
        /**
         * The event fired when the item is edited.
         *
         * @event
         * @name change
         * @param {object} values New value of the item.
         * @param {string} key Unique key of the item.
         * @public
         * @bubbles
         * @composed
         */
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    bounds: this.getBounds(),
                    values: {
                        disabled: this.disabled,
                        expanded: this.expanded,
                        isLoading: this.isLoading,
                        href: this.href,
                        label: this.label,
                        metatext: this.metatext,
                        name: this.name
                    },
                    key: this.nodeKey
                },
                composed: true,
                bubbles: true
            })
        );
    }

    /**
     * Dispatch the click event.
     *
     * @param {string} target Target of the click.
     * @param {Event} event
     */
    dispatchClick(target, event) {
        /**
         * The event fired when the item is clicked.
         *
         * @event
         * @name privateitemclick
         * @param {string} name Unique name of the item.
         * @param {string} key Unique key of the item.
         * @param {string} target Name of the target the click originated from.
         * @bubbles
         * @cancelable
         * @composed
         */
        const customEvent = new CustomEvent('privateitemclick', {
            bubbles: true,
            composed: true,
            cancelable: true,
            detail: {
                bounds: this.getBounds(),
                name: this.name,
                key: this.nodeKey,
                target
            }
        });
        this.dispatchEvent(customEvent);
        if (customEvent.defaultPrevented && event.target.tagName !== 'INPUT') {
            event.preventDefault();
        }
    }

    /**
     * Prevent the default behavior and stop the propagation of an event.
     *
     * @param {Event} event
     */
    preventDefaultAndStopPropagation(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * Stop the propagation of an event.
     *
     * @param {Event} event
     */
    stopPropagation(event) {
        event.stopPropagation();
    }
}
