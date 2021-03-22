import { LightningElement, api } from 'lwc';
import { classSet } from 'c/utils';
import {
    normalizeBoolean,
    normalizeString,
    observePosition
} from 'c/utilsPrivate';

const validPopoverSizes = ['small', 'medium', 'large'];
const validPlacements = [
    'auto',
    'left',
    'center',
    'right',
    'bottom-left',
    'bottom-center',
    'bottom-right'
];
const validVariants = [
    'base',
    'neutral',
    'brand',
    'brand-outline',
    'destructive',
    'destructive-text',
    'inverse',
    'success'
];

const validTriggers = ['click', 'hover', 'focus'];
const validPopoverVariants = ['base', 'warning', 'error', 'walkthrough'];
const validIconPositions = ['left', 'right'];

export default class AvonniButtonPopover extends LightningElement {
    @api accessKey;
    @api label;
    @api title;
    @api iconName;
    @api loadingStateAlternativeText;

    _disabled = false;
    _isLoading = false;
    _iconPosition = 'left';
    _popoverSize = 'medium';
    _placement = 'left';
    _variant = 'neutral';
    _triggers = 'click';
    _popoverVariant = 'base';
    popoverVisible = false;
    showTitle = true;
    showFooter = true;
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
        if (this.titleSlot) {
            this.showTitle = this.titleSlot.assignedElements().length !== 0;
        }
        if (this.footerSlot) {
            this.showFooter = this.footerSlot.assignedElements().length !== 0;
        }
    }

    get titleSlot() {
        return this.template.querySelector('slot[name=title]');
    }

    get footerSlot() {
        return this.template.querySelector('slot[name=footer]');
    }

    @api get popoverSize() {
        return this._popoverSize;
    }

    set popoverSize(popoverSize) {
        this._popoverSize = normalizeString(popoverSize, {
            fallbackValue: 'medium',
            validValues: validPopoverSizes
        });
    }

    @api get iconPosition() {
        return this._iconPosition;
    }

    set iconPosition(iconPosition) {
        this._iconPosition = normalizeString(iconPosition, {
            fallbackValue: 'left',
            validValues: validIconPositions
        });
    }

    @api get placement() {
        return this._placement;
    }

    set placement(placement) {
        this._placement = normalizeString(placement, {
            fallbackValue: 'left',
            validValues: validPlacements
        });
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

    @api get triggers() {
        return this._triggers;
    }

    set triggers(triggers) {
        this._triggers = normalizeString(triggers, {
            fallbackValue: 'click',
            validValues: validTriggers
        });
    }

    @api get popoverVariant() {
        return this._popoverVariant;
    }

    set popoverVariant(popoverVariant) {
        this._popoverVariant = normalizeString(popoverVariant, {
            fallbackValue: 'base',
            validValues: validPopoverVariants
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
    click() {
        if (this._connected) {
            this.clickOnButton();
        }
    }

    @api
    focus() {
        if (this._connected) {
            this.focusOnButton();
        }
    }

    @api
    close() {
        if (this.popoverVisible) {
            this.toggleMenuVisibility();
        }
    }

    clickOnButton() {
        if (!this._disabled) {
            this.allowBlur();
            this.focusOnButton();

            if (this._triggers === 'click') {
                this.toggleMenuVisibility();
            }

            this.dispatchEvent(new CustomEvent('click'));
        }
    }

    focusOnButton() {
        this.template.querySelector('lightning-button').focus();
        if (
            this._triggers === 'focus' &&
            !this.popoverVisible &&
            !this._disabled
        ) {
            this.toggleMenuVisibility();
        }
    }

    handleBlur() {
        if (this._cancelBlur) {
            return;
        }

        if (this.popoverVisible) {
            this.toggleMenuVisibility();
        }
    }

    handleMouseEnter() {
        if (
            this._triggers === 'hover' &&
            this.popoverVisible &&
            !this._disabled &&
            !this._cancelBlur
        ) {
            this.cancelBlur();
        }
        if (
            this._triggers === 'hover' &&
            !this.popoverVisible &&
            !this._disabled
        ) {
            this.allowBlur();
            this.toggleMenuVisibility();
        }
    }

    handleMouseLeave() {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(
            function() {
                if (
                    !this._cancelBlur &&
                    this._triggers === 'hover' &&
                    this.popoverVisible &&
                    !this._disabled
                ) {
                    this.cancelBlur();
                    this.toggleMenuVisibility();
                }
                if (
                    this._cancelBlur &&
                    this._triggers === 'hover' &&
                    this.popoverVisible &&
                    !this._disabled
                ) {
                    this.allowBlur();
                }
            }.bind(this),
            250
        );
    }

    handleMouseEnterBody() {
        if (
            this._triggers === 'hover' &&
            this.popoverVisible &&
            !this._disabled
        ) {
            this.cancelBlur();
        }
    }

    handleMouseLeaveBody() {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(
            function() {
                if (
                    !this._cancelBlur &&
                    this._triggers === 'hover' &&
                    this.popoverVisible &&
                    !this._disabled
                ) {
                    this.cancelBlur();
                    this.toggleMenuVisibility();
                }
                if (
                    this._cancelBlur &&
                    this._triggers === 'hover' &&
                    this.popoverVisible &&
                    !this._disabled
                ) {
                    this.allowBlur();
                }
            }.bind(this),
            250
        );
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

    allowBlur() {
        this._cancelBlur = false;
    }

    cancelBlur() {
        this._cancelBlur = true;
    }

    toggleMenuVisibility() {
        if (!this.disabled) {
            this.popoverVisible = !this.popoverVisible;

            if (this.popoverVisible) {
                this._boundingRect = this.getBoundingClientRect();
                this.pollBoundingRect();
            }

            this.classList.toggle('slds-is-open');
        }
    }

    pollBoundingRect() {
        if (this.isAutoAlignment() && this.popoverVisible) {
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

    get computedAriaExpanded() {
        return String(this.popoverVisible);
    }

    get computedPopoverClass() {
        return classSet('slds-popover')
            .add({
                'slds-dropdown_left':
                    this._placement === 'left' || this.isAutoAlignment(),
                'slds-dropdown_center': this._placement === 'center',
                'slds-dropdown_right': this._placement === 'right',
                'slds-dropdown_bottom': this._placement === 'bottom-center',
                'slds-dropdown_bottom slds-dropdown_right slds-dropdown_bottom-right':
                    this._placement === 'bottom-right',
                'slds-dropdown_bottom slds-dropdown_left slds-dropdown_bottom-left':
                    this._placement === 'bottom-left',
                'slds-nubbin_top-left': this._placement === 'left',
                'slds-nubbin_top-right': this._placement === 'right',
                'slds-nubbin_top': this._placement === 'center',
                'slds-nubbin_bottom-left': this._placement === 'bottom-left',
                'slds-nubbin_bottom-right': this._placement === 'bottom-right',
                'slds-nubbin_bottom': this._placement === 'bottom-center',
                'slds-p-vertical_large': this._isLoading,
                'slds-popover_warning': this._popoverVariant === 'warning',
                'slds-popover_error': this._popoverVariant === 'error',
                'slds-popover_walkthrough':
                    this._popoverVariant === 'walkthrough',
                'slds-popover_small': this._popoverSize === 'small',
                'slds-popover_medium': this._popoverSize === 'medium',
                'slds-popover_large': this._popoverSize === 'large'
            })
            .toString();
    }

    isAutoAlignment() {
        return this._placement.startsWith('auto');
    }
}
