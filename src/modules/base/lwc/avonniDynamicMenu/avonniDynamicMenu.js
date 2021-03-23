import { LightningElement, api } from 'lwc';
import { classSet } from 'c/utils';
import {
    normalizeBoolean,
    normalizeString,
    observePosition
} from 'c/utilsPrivate';

const validMenuAlignments = [
    'left',
    'center',
    'right',
    'bottom-left',
    'bottom-center',
    'bottom-right'
];

const validVariants = [
    'border',
    'border-inverse',
    'border-filled',
    'bare',
    'bare-inverse',
    'container'
];

export default class AvonniDynamicMenu extends LightningElement {
    @api iconName;
    @api value;
    @api alternativeText;
    @api loadingStateAlternativeText;
    @api label;
    @api withSearch;
    @api accessKey;
    @api title;
    @api searchInputPlaceholder = 'Search…';
    @api tooltip;

    _items = [];
    _isLoading;
    _variant = 'border';
    _menuAlignment = 'left';
    _disabled;
    queryTerm;
    _dropdownVisible = false;
    _dropdownOpened = false;
    showFooter = true;
    filteredItems = [];
    _boundingRect = {};

    connectedCallback() {
        this._connected = true;

        this.classList.add(
            'slds-dropdown-trigger',
            'slds-dropdown-trigger_click'
        );
    }

    disconnectedCallback() {
        this._connected = false;
    }

    renderedCallback() {
        if (this.footerSlot) {
            this.showFooter = this.footerSlot.assignedElements().length !== 0;
        }
    }

    get footerSlot() {
        return this.template.querySelector('slot[name=footer]');
    }

    @api
    get items() {
        return this._items;
    }

    set items(value) {
        let result = [];

        value.forEach((item, key) => {
            let cloneItem = Object.assign({}, item);
            cloneItem.metaJoin = cloneItem.meta.join(' • ');
            cloneItem.key = `item-key-${key}`
            result.push(cloneItem);
        });

        this._items = result;
        this.filteredItems = result;
    }

    @api get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: 'border',
            validValues: validVariants
        });
    }

    @api get menuAlignment() {
        return this._menuAlignment;
    }

    set menuAlignment(value) {
        this._menuAlignment = normalizeString(value, {
            fallbackValue: 'left',
            validValues: validMenuAlignments
        });
    }

    @api get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    @api get isLoading() {
        return this._isLoading;
    }

    set isLoading(value) {
        this._isLoading = normalizeBoolean(value);
    }

    @api
    focus() {
        if (this._connected) {
            this.focusOnButton();
        }
    }

    @api
    click() {
        if (this._connected) {
            if (this.label) {
                this.template.querySelector('lightning-button').click();
            } else {
                this.template.querySelector('lightning-button-icon').click();
            }
        }
    }

    get computedAriaExpanded() {
        return String(this._dropdownVisible);
    }

    get computedDropdownClass() {
        return classSet('slds-dropdown slds-popover slds-dynamic-menu')
            .add({
                'slds-dropdown_left':
                    this.menuAlignment === 'left' || this.isAutoAlignment(),
                'slds-dropdown_center': this.menuAlignment === 'center',
                'slds-dropdown_right': this.menuAlignment === 'right',
                'slds-dropdown_bottom': this.menuAlignment === 'bottom-center',
                'slds-dropdown_bottom slds-dropdown_right slds-dropdown_bottom-right':
                    this.menuAlignment === 'bottom-right',
                'slds-dropdown_bottom slds-dropdown_left slds-dropdown_bottom-left':
                    this.menuAlignment === 'bottom-left',
                'slds-nubbin_top-left': this.menuAlignment === 'left',
                'slds-nubbin_top-right': this.menuAlignment === 'right',
                'slds-nubbin_top': this.menuAlignment === 'center',
                'slds-nubbin_bottom-left': this.menuAlignment === 'bottom-left',
                'slds-nubbin_bottom-right':
                    this.menuAlignment === 'bottom-right',
                'slds-nubbin_bottom': this.menuAlignment === 'bottom-center',
                'slds-p-vertical_large': this.isLoading
            })
            .toString();
    }

    get showItems() {
        return this.filteredItems.length > 0;
    }

    handleButtonClick() {
        this.allowBlur();
        this.toggleMenuVisibility();
        this.focusOnButton();
    }

    handleButtonMouseDown(event) {
        const mainButton = 0;
        if (event.button === mainButton) {
            this.cancelBlur();
        }
    }

    handleDropdownMouseDown(event) {
        const mainButton = 0;
        if (event.button === mainButton) {
            this.cancelBlur();
        }
    }

    handleDropdownMouseUp() {
        this.allowBlur();
    }

    handleDropdownScroll(event) {
        event.stopPropagation();
    }

    focusOnButton() {
        if (this.label) {
            this.template.querySelector('lightning-button').focus();
        } else {
            this.template.querySelector('lightning-button-icon').focus();
        }
    }

    isAutoAlignment() {
        return this.menuAlignment.startsWith('auto');
    }

    toggleMenuVisibility() {
        if (!this.disabled) {
            this._dropdownVisible = !this._dropdownVisible;
            this._dropdownOpened = !this._dropdownOpened;

            if (this._dropdownVisible) {
                this.dispatchEvent(new CustomEvent('open'));
                this._boundingRect = this.getBoundingClientRect();
                this.pollBoundingRect();
            } else {
                this.filteredItems = this.items;
            }

            this.classList.toggle('slds-is-open');
        }
    }

    handleFocus() {
        this.dispatchEvent(new CustomEvent('focus'));
    }

    handleBlur() {
        if (this._cancelBlur) {
            return;
        }

        if (this._dropdownVisible) {
            this.toggleMenuVisibility();
        }

        this.dispatchEvent(new CustomEvent('blur'));
    }

    allowBlur() {
        this._cancelBlur = false;
    }

    cancelBlur() {
        this._cancelBlur = true;
    }

    close() {
        if (this._dropdownVisible) {
            this.toggleMenuVisibility();
        }
    }

    pollBoundingRect() {
        if (this.isAutoAlignment() && this._dropdownVisible) {
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => {
                if (this._connected) {
                    observePosition(this, 300, this._boundingRect, () => {
                        this.close();
                    });

                    this.pollBoundingRect();
                }
            }, 250);
        }
    }

    handleKeyUp(event) {
        let filter = event.target.value.toLowerCase();
        this.filteredItems = this.items.filter(item => {
            return item.label.toLowerCase().indexOf(filter) > -1;
        });
    }

    handleClick(event) {
        let index = event.currentTarget.id.split('-')[0];
        let item = this.items[index];

        const selectedEvent = new CustomEvent('select', { detail: item });
        this.dispatchEvent(selectedEvent);

        this.toggleMenuVisibility();
    }

    clearFilter(event) {
        if (!event.target.value) {
            this.filteredItems = this.items;
        }
    }
}
