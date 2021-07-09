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
    normalizeBoolean,
    normalizeString,
    synchronizeAttrs,
    getRealDOMId,
    classListMutation
} from 'c/utilsPrivate';
import {
    FieldConstraintApi,
    debounce,
    normalizeVariant,
    VARIANT
} from 'c/inputUtils';
import { classSet } from 'c/utils';
import InputChoiceOption from './avonniInputChoiceOption';

const i18n = {
    required: 'required'
};

const DEBOUNCE_PERIOD = 200;

const INPUT_CHOICE_ORIENTATIONS = {
    valid: ['vertical', 'horizontal'],
    default: 'vertical'
};
const INPUT_CHOICE_TYPES = { valid: ['default', 'button'], default: 'default' };

export default class AvonniInputChoiceSet extends LightningElement {
    static delegatesFocus = true;

    @api label;
    @api options;
    @api messageWhenValueMissing;
    @api name;

    _orientation = INPUT_CHOICE_ORIENTATIONS.default;
    _type = INPUT_CHOICE_TYPES.default;
    _helpMessage;
    _disabled = false;
    _required = false;
    _value = [];
    _isMultiSelect = false;

    constructor() {
        super();
        this.itemIndex = 0;

        this.debouncedShowIfBlurred = debounce(() => {
            if (!this.containsFocus) {
                this.showHelpMessageIfInvalid();
            }
        }, DEBOUNCE_PERIOD);
    }

    synchronizeA11y() {
        const inputs = this.template.querySelectorAll('input');
        Array.prototype.slice.call(inputs).forEach((input) => {
            synchronizeAttrs(input, {
                'aria-describedby': this.computedUniqueHelpElementId
            });
        });
    }

    connectedCallback() {
        this.classList.add('slds-form-element');
        this.updateClassList();
    }

    updateClassList() {
        classListMutation(this.classList, {
            'slds-form-element_stacked': this.variant === VARIANT.LABEL_STACKED,
            'slds-form-element_horizontal':
                this.variant === VARIANT.LABEL_INLINE
        });
    }

    renderedCallback() {
        this.synchronizeA11y();
    }

    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }

    @api
    get disabled() {
        return this._disabled || false;
    }
    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    @api
    get orientation() {
        return this._orientation;
    }

    set orientation(orientation) {
        this._orientation = normalizeString(orientation, {
            fallbackValue: INPUT_CHOICE_ORIENTATIONS.default,
            validValues: INPUT_CHOICE_ORIENTATIONS.valid
        });
    }

    @api
    get isMultiSelect() {
        return this._isMultiSelect || false;
    }
    set isMultiSelect(value) {
        this._isMultiSelect = normalizeBoolean(value);
    }

    @api
    get required() {
        return this._required || false;
    }
    set required(value) {
        this._required = normalizeBoolean(value);
    }

    @api
    get variant() {
        return this._variant || VARIANT.STANDARD;
    }

    set variant(value) {
        this._variant = normalizeVariant(value);
        this.updateClassList();
    }

    @api
    get type() {
        return this._type;
    }

    set type(type) {
        this._type = normalizeString(type, {
            fallbackValue: INPUT_CHOICE_TYPES.default,
            validValues: INPUT_CHOICE_TYPES.valid
        });
    }

    get checkboxVariant() {
        return this.type === 'default';
    }

    get i18n() {
        return i18n;
    }

    get transformedOptions() {
        const { options, value } = this;
        if (Array.isArray(options)) {
            return options.map((option) => {
                return new InputChoiceOption(option, value, this.itemIndex++);
            });
        }
        return [];
    }

    @api
    get validity() {
        return this._constraint.validity;
    }

    @api
    checkValidity() {
        return this._constraint.checkValidity();
    }

    @api
    reportValidity() {
        return this._constraint.reportValidity((message) => {
            this._helpMessage = message;
        });
    }

    @api
    setCustomValidity(message) {
        this._constraint.setCustomValidity(message);
    }

    @api
    showHelpMessageIfInvalid() {
        this.reportValidity();
    }

    get computedUniqueHelpElementId() {
        const helpElement = this.template.querySelector('[data-helptext]');
        return getRealDOMId(helpElement);
    }

    @api
    focus() {
        const firstCheckbox = this.template.querySelector('input');
        if (firstCheckbox) {
            firstCheckbox.focus();
        }
    }

    handleFocus() {
        this.containsFocus = true;
        this.dispatchEvent(new CustomEvent('focus'));
    }

    handleBlur() {
        this.containsFocus = false;
        this.dispatchEvent(new CustomEvent('blur'));
    }

    handleClick(event) {
        if (this.template.activeElement !== event.target) {
            event.target.focus();
        }
    }

    handleChange(event) {
        event.stopPropagation();

        let value = event.target.value;
        const checkboxes = this.template.querySelectorAll('input');
        if (this.isMultiSelect) {
            value = Array.from(checkboxes)
                .filter((checkbox) => checkbox.checked)
                .map((checkbox) => checkbox.value);
        } else {
            const checkboxesToUncheck = Array.from(checkboxes).filter(
                (checkbox) => checkbox.value !== value
            );
            checkboxesToUncheck.forEach((checkbox) => {
                checkbox.checked = false;
            });
        }
        if (this.type === 'button') {
            checkboxes.forEach((checkbox) => {
                const label = checkbox.labels[0];
                let icon = label.querySelector('lightning-icon');
                if (icon) {
                    if (value.includes(label.control.value))
                        icon.variant = 'inverse';
                    else icon.variant = '';

                    if (!checkbox.checked && icon.variant === 'inverse') {
                        icon.variant = '';
                    }
                }
            });
        }

        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value
                },
                composed: true,
                bubbles: true,
                cancelable: true
            })
        );
    }

    get _constraint() {
        if (!this._constraintApi) {
            this._constraintApi = new FieldConstraintApi(() => this, {
                valueMissing: () =>
                    !this.disabled && this.required && this.value.length === 0
            });
        }
        return this._constraintApi;
    }

    get computedLegendClass() {
        const classnames = classSet(
            'slds-form-element__legend slds-form-element__label'
        );

        return classnames
            .add({
                'slds-assistive-text': this.variant === VARIANT.LABEL_HIDDEN
            })
            .toString();
    }

    get computedButtonClass() {
        return this.checkboxVariant
            ? ''
            : `slds-checkbox_button-group ${this.orientation}`;
    }

    get computedCheckboxContainerClass() {
        const checkboxClass = this.isMultiSelect
            ? `slds-checkbox ${this.orientation}`
            : `slds-radio ${this.orientation}`;
        const buttonClass = `slds-button slds-checkbox_button ${this.orientation}`;

        return this.checkboxVariant ? checkboxClass : buttonClass;
    }

    get computedLabelClass() {
        const buttonLabelClass = `slds-checkbox_button__label slds-align_absolute-center ${this.orientation}`;
        const checkboxLabelClass =
            this.isMultiSelect && this.checkboxVariant
                ? 'slds-checkbox__label'
                : 'slds-radio__label';

        return this.checkboxVariant ? checkboxLabelClass : buttonLabelClass;
    }

    get computedInputType() {
        return this.isMultiSelect || !this.checkboxVariant
            ? 'checkbox'
            : 'radio';
    }

    get computedCheckboxShapeClass() {
        return this.isMultiSelect ? 'slds-checkbox_faux' : 'slds-radio_faux';
    }
}
