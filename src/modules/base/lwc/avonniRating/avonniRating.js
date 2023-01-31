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
import { normalizeString, normalizeBoolean } from 'c/utilsPrivate';
import { generateUUID, classSet } from 'c/utils';
import { FieldConstraintApi, InteractingState } from 'c/inputUtils';
import Item from './avonniItem';

const RATING_SELECTIONS = {
    valid: ['continuous', 'single'],
    default: 'continuous'
};

const RATING_SIZES = {
    valid: ['x-small', 'small', 'medium', 'large'],
    default: 'large'
};

const LABEL_VARIANTS = {
    valid: ['standard', 'label-inline', 'label-hidden', 'label-stacked'],
    default: 'standard'
};

const DEFAULT_MIN = 1;
const DEFAULT_MAX = 5;

/**
 * @class
 * @descriptor avonni-rating
 * @storyId example-rating--base
 * @public
 */
export default class AvonniRating extends LightningElement {
    /**
     * Help text detailing the purpose and function of the rating component.
     *
     * @type {string}
     * @public
     */
    @api fieldLevelHelp;
    /**
     * Label for the rating component.
     *
     * @type {string}
     * @public
     */
    @api label;
    /**
     * Assign a unique ID through the name of the rating component.
     *
     * @type {string}
     */
    @api name = generateUUID();

    _disabled = false;
    _iconSize = RATING_SIZES.default;
    _max = DEFAULT_MAX;
    _min = DEFAULT_MIN;
    _readOnly = false;
    _selection = RATING_SELECTIONS.default;
    _value;
    _valueHidden = false;
    _variant = LABEL_VARIANTS.default;
    _required = false;

    items = [];
    helpMessage;
    _connected = false;

    connectedCallback() {
        this.interactingState = new InteractingState();
        this.interactingState.onleave(() => this.showHelpMessageIfInvalid());
        this.initItems();
        this._connected = true;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * If present, the rating component is disabled and users cannot interact with it.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);

        if (this._connected) {
            this.initItems();
        }
    }

    /**
     * The Lightning Design System name of the icon. Specify the name in the format 'utility:favorite' where 'utility' is the category, and 'favorite' is the specific icon to be displayed.
     *
     * @type {string}
     * @public
     */
    @api
    get iconName() {
        return this._iconName;
    }
    set iconName(value) {
        this._iconName = value;

        if (this._connected) {
            this.initItems();
        }
    }

    /**
     * Valid values include x-small, small, medium and large.
     *
     * @type {string}
     * @public
     * @default large
     */
    @api
    get iconSize() {
        return this._iconSize;
    }

    set iconSize(size) {
        this._iconSize = normalizeString(size, {
            fallbackValue: RATING_SIZES.default,
            validValues: RATING_SIZES.valid
        });
    }

    /**
     * The maximum acceptable value for the rating component.
     *
     * @type {number}
     * @public
     * @default 5
     */
    @api
    get max() {
        return this._max;
    }

    set max(value) {
        this._max = isNaN(parseInt(value, 10))
            ? DEFAULT_MAX
            : parseInt(value, 10);

        if (this._connected) {
            this.initItems();
        }
    }

    /**
     * The minimum acceptable value for the rating component.
     *
     * @type {number}
     * @public
     * @default 1
     */
    @api
    get min() {
        return this._min;
    }

    set min(value) {
        this._min = isNaN(parseInt(value, 10))
            ? DEFAULT_MIN
            : parseInt(value, 10);

        if (this._connected) {
            this.initItems();
        }
    }

    /**
     * If present, the rating component is read-only and cannot be edited by users.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get readOnly() {
        return this._readOnly;
    }

    set readOnly(value) {
        this._readOnly = normalizeBoolean(value);

        if (this._connected) {
            this.initItems();
        }
    }

    /**
     * If present, the input field must be filled out before the form is submitted.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get required() {
        return this._required;
    }

    set required(value) {
        this._required = normalizeBoolean(value);
    }

    /**
     * Valid values include continuous and single.
     *
     * @type {string}
     * @public
     * @default continuous
     */
    @api
    get selection() {
        return this._selection;
    }

    set selection(selection) {
        this._selection = normalizeString(selection, {
            fallbackValue: RATING_SELECTIONS.default,
            validValues: RATING_SELECTIONS.valid
        });

        if (this._connected) {
            this.initItems();
        }
    }

    /**
     * Specifies the value of the rating.
     *
     * @type {string}
     * @public
     */
    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = Number(value);

        if (this._connected) {
            this.initItems();
        }
    }

    /**
     * Represents the validity states that an element can be in, with respect to constraint validation.
     *
     * @type {string}
     * @public
     */
    @api
    get validity() {
        return this._constraint.validity;
    }

    /**
     * Hide the rating fraction representation (e.g. "4/5" rating).
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get valueHidden() {
        return this._valueHidden;
    }

    set valueHidden(value) {
        this._valueHidden = normalizeBoolean(value);
    }

    /**
     * The variant changes the appearance of an input field. Accepted variants include standard, label-inline, label-hidden, and label-stacked.
     * This value defaults to standard, which displays the label above the field. Use label-hidden to hide the label but make it available to assistive technology.
     * Use label-inline to horizontally align the label and input field. Use label-stacked to place the label above the input field.
     *
     * @type {string}
     * @public
     * @default standard
     */
    @api
    get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: LABEL_VARIANTS.default,
            validValues: LABEL_VARIANTS.valid
        });
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Display the rating.
     *
     * @type {boolean}
     */
    get showRating() {
        return !this._valueHidden && this.value;
    }

    /**
     * Computed container class styling for label inline and stacked.
     *
     * @type {string}
     */
    get computedContainerClass() {
        return classSet({
            'slds-grid slds-grid_vertical-align-center slds-wrap':
                this.variant === 'label-inline',
            'slds-form-element_stacked': this.variant === 'label-stacked'
        }).toString();
    }

    /**
     * Computed CSS classes for the button icon SVG.
     *
     * @type {string}
     */
    get computedIconClass() {
        return classSet('slds-button__icon')
            .add({
                'slds-button__icon_large': this.iconSize === 'large',
                'avonni-rating__icon_medium': this.iconSize === 'medium',
                'slds-button__icon_small': this.iconSize === 'small',
                'slds-button__icon_x-small': this.iconSize === 'x-small'
            })
            .toString();
    }

    /**
     * Computed legend class styling.
     *
     * @type {string}
     */
    get computedLegendClass() {
        return classSet(
            'slds-form-element__label slds-no-flex avonni-rating__label'
        )
            .add({
                'slds-assistive-text': this.variant === 'label-hidden'
            })
            .toString();
    }

    /**
     * Gets FieldConstraintApi.
     *
     * @type {object}
     */
    get _constraint() {
        if (!this._constraintApi) {
            this._constraintApi = new FieldConstraintApi(() => this, {
                valueMissing: () =>
                    !this.disabled && this.required && !this._value
            });
        }
        return this._constraintApi;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Checks if the input is valid.
     *
     * @returns {boolean} True if the element meets all constraint validations.
     * @public
     */
    @api
    checkValidity() {
        return this._constraint.checkValidity();
    }

    /**
     * Displays the error messages. If the input is valid, <code>reportValidity()</code> clears displayed error messages.
     *
     * @returns {boolean} False if invalid, true if valid.
     * @public
     */
    @api
    reportValidity() {
        return this._constraint.reportValidity((message) => {
            this.helpMessage = message;
        });
    }

    /**
     * Sets a custom error message to be displayed when a form is submitted.
     *
     * @param {string} message The string that describes the error. If message is an empty string, the error message is reset.
     * @public
     */
    @api
    setCustomValidity(message) {
        this._constraint.setCustomValidity(message);
    }

    /**
     * Displays error messages on invalid fields.
     * An invalid field fails at least one constraint validation and returns false when <code>checkValidity()</code> is called.
     *
     * @public
     */
    @api
    showHelpMessageIfInvalid() {
        this.reportValidity();
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Initialize the rating items array.
     */
    initItems() {
        const items = [];
        for (let i = this.min; i <= this.max; i++) {
            const isSelected =
                this.selection === 'continuous'
                    ? i <= this.value
                    : i === this.value;
            items.push(
                new Item({
                    disabled: this.disabled,
                    iconName: this.iconName,
                    readOnly: this.readOnly,
                    selected: isSelected,
                    selectionType: this.selection,
                    value: i
                })
            );
        }
        this.items = items;
    }

    /**
     * Handle a click on a rating item. Update the value and dispatch the change event.
     *
     * @param {Event} event
     */
    handleItemClick(event) {
        if (this.readOnly || this.disabled) {
            return;
        }

        this._value = Number(event.currentTarget.value);

        /**
         * The event fired when the value change..
         *
         * @event
         * @name change
         * @param {string} value Value of the selected rating.
         * @public
         */
        const selectedEvent = new CustomEvent('change', {
            detail: {
                value: this._value
            }
        });
        this.dispatchEvent(selectedEvent);
        this.initItems();
    }
}
