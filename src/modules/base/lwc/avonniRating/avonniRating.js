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
     * The Lightning Design System name of the icon. Specify the name in the format 'utility:favorite' where 'utility' is the category, and 'favorite' is the specific icon to be displayed.
     *
     * @type {string}
     * @public
     */
    @api iconName;
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

    init = false;
    initStyles = false;
    helpMessage;

    connectedCallback() {
        this.interactingState = new InteractingState();
        this.interactingState.onleave(() => this.showHelpMessageIfInvalid());
    }

    renderedCallback() {
        this.ratingRecalculation();

        if (!this.initStyles) {
            let selectedIcons = this.template.querySelector(
                '[data-element-id="lightning-button-icon"]'
            );

            if (selectedIcons) {
                const style = document.createElement('style');
                style.innerText = `
                    .avonni-icon-selected .slds-button:disabled svg {fill: #a5a4a2;}
                    .avonni-icon-selected svg {fill: #1b5297 !important;}
                    .avonni-rating:hover .avonni-active-star.avonni-continuous-star svg {
                        fill: #1b5297;
                        opacity: 1;
                    }
                    .avonni-active-star.avonni-continuous-star svg {
                        fill: #c9c7c5;
                    }
                    .avonni-active-star.avonni-continuous-star:hover ~ .avonni-active-star.avonni-continuous-star svg {
                        fill: #c9c7c5;
                        opacity: 1;
                    }
                    .avonni-icon button, 
                    .avonni-icon button:active, 
                    .avonni-icon button:focus {
                        box-shadow: none;
                    }
                `;
                selectedIcons.appendChild(style);
                this.initStyles = true;
            }
        }

        this.init = true;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
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

        if (this.init) {
            this.ratingRecalculation();
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
        this._max = isNaN(parseInt(value, 10)) ? DEFAULT_MAX : value;

        if (this.init) {
            this.ratingRecalculation();
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
        this._min = isNaN(parseInt(value, 10)) ? DEFAULT_MIN : value;

        if (this.init) {
            this.ratingRecalculation();
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

        if (this.init) {
            this.ratingRecalculation();
        }
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

        if (this.init) {
            this.ratingRecalculation();
        }
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

        if (this.init) {
            this.ratingRecalculation();
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
     * Compute items to display with min and max ratings.
     *
     * @type {object[]}
     */
    get items() {
        let items = [];

        for (let i = Number(this.min); i <= this.max; i++) {
            items.push(i);
        }

        return items;
    }

    /**
     * Computed container class styling for label inline and stacked.
     *
     * @type {string}
     */
    get computedContainerClass() {
        return classSet()
            .add({
                'slds-form-element_stacked': this.variant === 'label-stacked',
                'avonni-rating__label_inline': this.variant === 'label-inline'
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
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Get rating value and dispatch the change as the selected event.
     *
     * @param {Event} event
     */
    selectRating(event) {
        if (!this._readOnly) {
            this._value = Number(event.target.value);

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

            this.ratingRecalculation();
        }
    }

    /**
     * Calculate rating button and icon button classes and styling based on rating value selection and attributes.
     */
    ratingRecalculation() {
        let buttons = this.template.querySelectorAll(
            '[data-element-id="button"]'
        );

        buttons.forEach((button) => {
            button.classList.remove('slds-button_outline-brand');
            button.classList.remove('slds-button_brand');

            if (this.selection === 'continuous') {
                button.classList.add('avonni-continuous');

                if (Number(button.title) <= Number(this.value)) {
                    button.classList.add('slds-button_brand');
                } else {
                    button.classList.add('slds-button_outline-brand');
                }
            } else if (Number(button.title) === Number(this.value)) {
                button.classList.remove('avonni-continuous');
                button.classList.add('slds-button_brand');
            } else {
                button.classList.remove('avonni-continuous');
                button.classList.add('slds-button_outline-brand');
            }

            if (!this._disabled && !this._readOnly) {
                button.classList.add('avonni-active');
            } else {
                button.classList.remove('avonni-active');
            }
        });

        let iconButtons = this.template.querySelectorAll(
            '[data-element-id="lightning-button-icon"]'
        );

        iconButtons.forEach((button) => {
            button.classList.remove('avonni-icon-selected');

            if (this.selection === 'continuous') {
                button.classList.add('avonni-continuous-star');

                if (Number(button.title) <= Number(this.value)) {
                    button.classList.add('avonni-icon-selected');
                }
            } else if (Number(button.title) === Number(this.value)) {
                button.classList.remove('avonni-continuous-star');
                button.classList.add('avonni-icon-selected');
            }

            if (!this._disabled && !this._readOnly) {
                button.classList.add('avonni-active-star');
            } else {
                button.classList.remove('avonni-active');
            }
        });
    }
}
