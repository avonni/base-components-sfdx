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
import { classSet } from 'c/utils';
import {
    normalizeBoolean,
    normalizeString,
    observePosition
} from 'c/utilsPrivate';

const POPOVER_SIZES = {
    valid: ['small', 'medium', 'large'],
    default: 'medium'
};
const POPOVER_PLACEMENTS = {
    valid: [
        'auto',
        'left',
        'center',
        'right',
        'bottom-left',
        'bottom-center',
        'bottom-right'
    ],
    default: 'left'
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

const POPOVER_TRIGGERS = { valid: ['click', 'hover', 'focus'], default: 'click' };

const POPOVER_VARIANTS = {
    valid: ['base', 'warning', 'error', 'walkthrough'],
    default: 'base'
};
const ICON_POSITIONS = { valid: ['left', 'right'], default: 'left' };

export default class AvonniButtonPopover extends LightningElement {
    @api accessKey;
    @api label;
    @api title;
    @api iconName;
    @api loadingStateAlternativeText;

    _disabled = false;
    _isLoading = false;
    _iconPosition = ICON_POSITIONS.default;
    _popoverSize = POPOVER_SIZES.default;
    _placement = POPOVER_PLACEMENTS.default;
    _variant = BUTTON_VARIANTS.default;
    _triggers = POPOVER_TRIGGERS.default;
    _popoverVariant = POPOVER_VARIANTS.default;
    popoverVisible = false;
    showTitle = true;
    showFooter = true;
    _boundingRect = {};

    connectedCallback() {
        this.classList.add(
            'slds-dropdown-trigger',
            'slds-dropdown-trigger_click'
        );
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

    @api
    get popoverSize() {
        return this._popoverSize;
    }

    set popoverSize(popoverSize) {
        this._popoverSize = normalizeString(popoverSize, {
            fallbackValue: POPOVER_SIZES.default,
            validValues: POPOVER_SIZES.valid
        });
    }

    @api
    get iconPosition() {
        return this._iconPosition;
    }

    set iconPosition(iconPosition) {
        this._iconPosition = normalizeString(iconPosition, {
            fallbackValue: ICON_POSITIONS.default,
            validValues: ICON_POSITIONS.valid
        });
    }

    @api
    get placement() {
        return this._placement;
    }

    set placement(placement) {
        this._placement = normalizeString(placement, {
            fallbackValue: POPOVER_PLACEMENTS.default,
            validValues: POPOVER_PLACEMENTS.valid
        });
    }

    @api
    get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: BUTTON_VARIANTS.default,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    @api
    get triggers() {
        return this._triggers;
    }

    set triggers(triggers) {
        this._triggers = normalizeString(triggers, {
            fallbackValue: POPOVER_TRIGGERS.default,
            validValues: POPOVER_TRIGGERS.valid
        });
    }

    @api
    get popoverVariant() {
        return this._popoverVariant;
    }

    set popoverVariant(popoverVariant) {
        this._popoverVariant = normalizeString(popoverVariant, {
            fallbackValue: POPOVER_VARIANTS.default,
            validValues: POPOVER_VARIANTS.valid
        });
    }

    @api
    get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    @api
    get isLoading() {
        return this._isLoading;
    }

    set isLoading(value) {
        this._isLoading = normalizeBoolean(value);
    }

    get hasStringTitle() {
        return !!this.title;
    }

    @api
    click() {
        if (this.isConnected) {
            this.clickOnButton();
        }
    }

    @api
    focus() {
        if (this.isConnected) {
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
            function () {
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
            function () {
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
                if (this.isConnected) {
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
