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
    ContentMutation,
    synchronizeAttrs,
    getRealDOMId,
    normalizeBoolean,
    normalizeString,
    normalizeAriaAttribute
} from 'c/utilsPrivate';
import { classSet } from 'c/utils';
import {
    InteractingState,
    FieldConstraintApiWithProxyInput,
    normalizeVariant,
    VARIANT
} from 'c/inputUtils';

const i18n = {
    required: 'required'
};

const ARIA_CONTROLS = 'aria-controls';
const ARIA_DESCRIBEDBY = 'aria-describedby';
const ARIA_LABELEDBY = 'aria-labelledby';

const INPUT_SIZES = {
    valid: ['x-small', 'small', 'medium', 'large'],
    default: 'medium'
};

const DEFAULT_MESSAGE_TOGGLE_ACTIVE = 'Active';
const DEFAULT_MESSAGE_TOGGLE_INACTIVE = 'Inactive';

/**
 * @class
 * @public
 * @storyId example-input-toggle--base
 * @descriptor avonni-input-toggle
 */
export default class AvonniInputToggle extends LightningElement {
    /**
     * Specifies a shortcut key to activate or focus an element.
     *
     * @type {string}
     * @public
     */
    @api accessKey;

    /**
     * Describes the input to assistive technologies.
     *
     * @type {string}
     * @public
     */
    @api ariaLabel;

    /**
     * Help text detailing the purpose and function of the input.
     * This attribute isn't supported for file, radio, toggle, and checkbox-button types.
     *
     * @type {string}
     * @public
     */
    @api fieldLevelHelp;

    /**
     * Text label for the input.
     *
     * @type {string}
     * @required
     * @public
     */
    @api label;

    /**
     * Text shown for the active state of a toggle.
     *
     * @type {string}
     * @public
     */
    @api messageToggleActive = DEFAULT_MESSAGE_TOGGLE_ACTIVE;

    /**
     * Text shown for the inactive state of a toggle.
     *
     * @type {string}
     * @public
     */
    @api messageToggleInactive = DEFAULT_MESSAGE_TOGGLE_INACTIVE;

    /**
     * Error message to be displayed when the value is missing.
     * The valueMissing error can be returned when you specify the required attribute for any input type.
     *
     * @type {string}
     * @public
     */
    @api messageWhenValueMissing;

    /**
     * Specifies the name of an input element.
     *
     * @type {string}
     * @public
     */
    @api name;

    /**
     * Specifies the value of an input element.
     *
     * @type {string}
     * @public
     */
    @api value;

    _ariaControls;
    _ariaDescribedBy;
    _checked;
    _disabled;
    _hideMark = false;
    _messageWhenValueMissing;
    _readOnly;
    _required;
    _size = INPUT_SIZES.default;
    _variant;

    _rendered;
    helpMessage;

    constructor() {
        super();
        this.ariaObserver = new ContentMutation(this);
    }

    connectedCallback() {
        this.classList.add('slds-form-element');
        this.interactingState = new InteractingState();
        this.interactingState.onleave(() => this.showHelpMessageIfInvalid());
    }

    renderedCallback() {
        if (!this._rendered) this._rendered = true;
        this._synchronizeA11y();
    }

    /**
     * Synchronize all inputs Aria help element ID.
     */
    _synchronizeA11y() {
        const input = this.template.querySelector('[data-element-id="input"]');

        if (input) {
            synchronizeAttrs(input, {
                [ARIA_DESCRIBEDBY]: this.computedAriaDescribedBy,
                [ARIA_CONTROLS]: this.computedAriaControls,
                [ARIA_LABELEDBY]: this.computedAriaLabelledBy
            });
        }
    }

    /**
     * A space-separated list of element IDs whose presence or content is controlled by the input.
     *
     * @type {string}
     * @public
     */
    @api
    get ariaControls() {
        return this._ariaControls;
    }

    set ariaControls(references) {
        this._ariaControls = normalizeAriaAttribute(references);
        this.ariaObserver.link(
            '[data-element-id="input"]',
            'aria-controls',
            this._ariaControls,
            '[data-aria]'
        );
    }

    /**
     * A space-separated list of element IDs that provide descriptive labels for the input.
     *
     * @type {string}
     * @public
     */
    @api
    get ariaDescribedBy() {
        return this._ariaDescribedBy;
    }

    set ariaDescribedBy(references) {
        this._ariaDescribedBy = normalizeAriaAttribute(references);
        this.ariaObserver.link(
            '[data-element-id="input"]',
            'aria-describedby',
            this._ariaDescribedBy,
            '[data-aria]'
        );
    }

    /**
     * A space-separated list of element IDs that provide labels for the input.
     *
     * @type {string}
     * @public
     */
    @api
    get ariaLabelledBy() {
        return this._ariaLabelledBy;
    }

    set ariaLabelledBy(references) {
        this._ariaLabelledBy = normalizeAriaAttribute(references);
        this.ariaObserver.link(
            '[data-element-id="input"]',
            'aria-labelledby',
            this._ariaLabelledBy,
            '[data-aria]'
        );
    }

    /**
     * If present, the toggle is selected.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get checked() {
        return this._checked;
    }
    set checked(value) {
        this._checked = normalizeBoolean(value);

        if (this._rendered) {
            this._inputElement.checked = this._checked;
        }
        this._updateProxyInputAttributes('checked');
    }

    /**
     * If present, the input field is disabled and users cannot interact with it.
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
    }

    /**
     * If present, hides the mark.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get hideMark() {
        return this._hideMark;
    }
    set hideMark(value) {
        this._hideMark = normalizeBoolean(value);
    }

    /**
     * If present, the input field is read-only and cannot be edited by users.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get readOnly() {
        return this._readOnly;
    }

    set readOnly(value) {
        this._readOnly = normalizeBoolean(value);
    }

    /**
     * If present, the input field must be filled out before the form is submitted.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get required() {
        return this._required;
    }

    set required(value) {
        this._required = normalizeBoolean(value);
        this._updateProxyInputAttributes('required');
    }

    /**
     * The size of the input toggle. Valid values include x-small, small, medium and large.
     *
     * @type {string}
     * @default medium
     * @public
     */
    @api
    get size() {
        return this._size;
    }

    set size(toggleSize) {
        this._size = normalizeString(toggleSize, {
            fallbackValue: INPUT_SIZES.default,
            validValues: INPUT_SIZES.valid
        });
    }

    /**
     * The variant changes the appearance of an input field.
     * Accepted variants include standard, label-inline, label-hidden, and label-stacked.
     * This value defaults to standard, which displays the label above the field.
     * Use label-hidden to hide the label but make it available to assistive technology.
     * Use label-inline to horizontally align the label and input field.
     * Use label-stacked to place the label above the input field.
     *
     * @type {string}
     * @default standard
     * @public
     */
    @api
    get variant() {
        return this._variant || VARIANT.STANDARD;
    }

    set variant(toggleVariant) {
        this._variant = normalizeVariant(toggleVariant);
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
     * Removes keyboard focus from the input element.
     *
     * @public
     */
    @api
    blur() {
        if (this._rendered) {
            this.template.querySelector('[data-element-id="input"]').blur();
        }
    }

    /**
     * Checks if the input is valid.
     *
     * @returns {boolean} Indicates whether the element meets all constraint validations.
     * @public
     */
    @api
    checkValidity() {
        return this._constraint.checkValidity();
    }

    /**
     * Sets focus on the input element.
     *
     * @public
     */
    @api
    focus() {
        if (this._rendered) {
            this.template.querySelector('[data-element-id="input"]').focus();
        }
    }

    /**
     * Displays the error messages and returns false if the input is invalid.
     * If the input is valid, reportValidity() clears displayed error messages and returns true.
     *
     * @returns {boolean} - The validity status of the input fields.
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
     * @param {string} message - The string that describes the error.
     * If message is an empty string, the error message is reset.
     * @public
     */
    @api
    setCustomValidity(message) {
        this._constraint.setCustomValidity(message);
    }

    /**
     * Displays error messages on invalid fields.
     * An invalid field fails at least one constraint validation and returns false when checkValidity() is called.
     *
     * @public
     */
    @api
    showHelpMessageIfInvalid() {
        this.reportValidity();
    }

    /**
     * Localization.
     */
    get i18n() {
        return i18n;
    }

    /**
     * Computed Wrapper Class styling.
     *
     * @type {string}
     */
    get computedWrapperClass() {
        return classSet('slds-checkbox_toggle label').add({
            'slds-form-element_stacked': this.variant === VARIANT.LABEL_STACKED,
            'slds-grid': this.variant === VARIANT.LABEL_INLINE
        });
    }

    /**
     * Computed Faux Toggle Class styling.
     *
     * @type {string}
     */
    get computedFauxToggleClass() {
        return classSet('slds-checkbox_faux').add({
            'faux_x-small': this.size === 'x-small',
            faux_small: this.size === 'small',
            faux_large: this.size === 'large',
            'faux_hide-mark': this.hideMark === true
        });
    }

    /**
     * Computed Label Class styling.
     *
     * @type {string}
     */
    get computedLabelClass() {
        return classSet(
            'slds-form-element slds-form-element__label slds-m-bottom_none'
        ).add({
            'slds-assistive-text': this.variant === VARIANT.LABEL_HIDDEN,
            'slds-p-top_xx-small slds-m-top_xxx-small': this.size === 'large'
        });
    }

    /**
     * Gets element unique help ID.
     *
     * @type {string}
     */
    get computedUniqueHelpElementId() {
        return getRealDOMId(this.template.querySelector('[data-help-message]'));
    }

    /**
     * Gets element described by ID.
     *
     * @type {string}
     */
    get computedUniqueToggleElementDescribedById() {
        const toggle = this.template.querySelector('[data-toggle-description]');
        return getRealDOMId(toggle);
    }

    /**
     * Gets Aria Described By.
     */
    get computedAriaDescribedBy() {
        const ariaValues = [];

        if (this.messageWhenValueMissing) {
            ariaValues.push(this.computedUniqueHelpElementId);
        }

        if (this.isTypeToggle) {
            ariaValues.push(this.computedUniqueToggleElementDescribedById);
        }

        if (this.ariaDescribedBy) {
            ariaValues.push(this.ariaDescribedBy);
        }

        return normalizeAriaAttribute(ariaValues);
    }

    /**
     * Gets Aria Controls.
     */
    get computedAriaControls() {
        const ariaValues = [];

        if (this.ariaControls) {
            ariaValues.push(this.ariaControls);
        }

        return normalizeAriaAttribute(ariaValues);
    }

    /**
     * Gets Aria Labelled by.
     */
    get computedAriaLabelledBy() {
        const ariaValues = [];

        if (this.ariaLabelledBy) {
            ariaValues.push(this.ariaLabelledBy);
        }

        return normalizeAriaAttribute(ariaValues);
    }

    /**
     * Gets input element.
     *
     * @type {element}
     */
    get _inputElement() {
        return this.template.querySelector('[data-element-id="input"]');
    }

    /**
     * Gets FieldConstraintApi.
     *
     * @type {object}
     */
    get _constraint() {
        if (!this._constraintApi) {
            this._constraintApi = new FieldConstraintApiWithProxyInput(
                () => this
            );

            this._constraintApiProxyInputUpdater = this._constraintApi.setInputAttributes(
                {
                    type: () => 'checkbox',
                    checked: () => this.checked,
                    required: () => this.required
                }
            );
        }
        return this._constraintApi;
    }

    /**
     * Updates proxy input attributes.
     *
     * @param {string} attributes
     */
    _updateProxyInputAttributes(attributes) {
        if (this._constraintApiProxyInputUpdater) {
            this._constraintApiProxyInputUpdater(attributes);
        }
    }

    /**
     * Dispatches the blur event.
     */
    handleBlur() {
        this.interactingState.leave();

        /**
         * The event fired when the focus is removed from the input toggle.
         *
         * @event
         * @name blur
         * @public
         */
        this.dispatchEvent(new CustomEvent('blur'));
    }

    /**
     * Dispatches the focus event.
     */
    handleFocus() {
        this.interactingState.enter();

        /**
         * The event fired when you focus the input toggle.
         *
         * @event
         * @name focus
         * @public
         */
        this.dispatchEvent(new CustomEvent('focus'));
    }

    /**
     * Dispatches the change event.
     */
    handleChange(event) {
        event.stopPropagation();

        if (this.readOnly) {
            this._inputElement.checked = this.checked;
            return;
        }

        this._checked = this._inputElement.checked;
        this._updateProxyInputAttributes('checked');

        /**
         * The event fired when a value is changed in the input toggle.
         *
         * @event
         * @name change
         * @param {boolean} checked For input types checkbox and checkbox-button, the value of checked attribute.
         * @bubbles
         * @composed
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    checked: event.target.checked
                },
                bubbles: true,
                cancelable: false,
                composed: true
            })
        );
    }
}
