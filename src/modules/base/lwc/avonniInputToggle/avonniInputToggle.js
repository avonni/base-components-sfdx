import { LightningElement, api } from 'lwc';
import {
    classListMutation,
    normalizeBoolean,
    normalizeString
} from 'c/utilsPrivate';
import { classSet } from 'c/utils';
import {
    FieldConstraintApi,
    normalizeVariant,
    VARIANT
} from 'c/inputUtils';

const i18n = {
    required: 'required'
};

const validSizes = ['x-small', 'small', 'medium', 'large'];

export default class AvonniInputToggle extends LightningElement {
    @api accessKey;
    @api ariaControls;
    @api ariaDescribedBy;
    @api ariaLabel;
    @api ariaLabelledBy;
    @api fieldLevelHelp;
    @api label = 'Toggle Label';
    @api messageToggleActive = 'Active';
    @api messageToggleInactive = 'Inactive';
    @api name;
    @api value = '';

    _checked;
    _disabled;
    _hideMark = false;
    _invalidMessage = 'Complete this field';
    _readOnly;
    _required;
    _size = 'medium';
    _variant;

    _connected;
    _helpMessage = null;
    valid = true;

    connectedCallback() {
        this._connected = true;
        this.classList.add('slds-form-element');
        this.updateClassList();
    }

    @api
    get checked() {
        return this._checked;
    }

    set checked(value) {
        this._checked = normalizeBoolean(value);
    }

    @api
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    @api
    get hideMark() {
        return this._hideMark;
    }
    set hideMark(value) {
        this._hideMark = normalizeBoolean(value);
    }

    @api
    get messageWhenValueMissing() {
        return this._invalidMessage;
    }

    set messageWhenValueMissing(value) {
        this._invalidMessage = value || 'Complete this field';
    }

    @api
    get readOnly() {
        return this._readOnly;
    }

    set readOnly(value) {
        this._readOnly = normalizeBoolean(value);
    }

    @api
    get required() {
        return this._required;
    }

    set required(value) {
        this._required = normalizeBoolean(value);
    }

    @api
    get size() {
        return this._size;
    }

    set size(toggleSize) {
        this._size = normalizeString(toggleSize, {
            fallbackValue: 'medium',
            validValues: validSizes
        });
    }

    @api
    get variant() {
        return this._variant || VARIANT.STANDARD;
    }

    set variant(toggleVariant) {
        this._variant = normalizeVariant(toggleVariant);
        this.updateClassList();
    }

    @api
    get validity() {
        return this._constraint.validity;
    }

    @api
    blur() {
        if (this._connected) {
            this.template.querySelector('input').blur();
        }
    }

    @api
    checkValidity() {
        return this._constraint.checkValidity();
    }

    @api
    focus() {
        if (this._connected) {
            this.template.querySelector('input').focus();
        }
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

    get i18n() {
        return i18n;
    }

    get computedFauxToggleClass() {
        return classSet('slds-checkbox_faux').add({
            'avonni-input-toggle__faux_x-small': this.size === 'x-small',
            'avonni-input-toggle__faux_small': this.size === 'small',
            'avonni-input-toggle__faux_large': this.size === 'large',
            'avonni-input-toggle__faux_hide-mark': this.hideMark === true
        });
    }

    get computedLabelClass() {
        return classSet(
            'slds-form-element slds-form-element__label slds-m-bottom_none'
        ).add({
            'slds-assistive-text': this.variant === VARIANT.LABEL_HIDDEN,
            'slds-p-top_xx-small slds-m-top_xxx-small': this.size === 'large'
        });
    }

    get _constraint() {
        if (!this._constraintApi) {
            this._constraintApi = new FieldConstraintApi(() => this, {
                checked: () => this.checked
            });
        }
        return this._constraintApi;
    }

    updateClassList() {
        classListMutation(this.classList, {
            'slds-form-element_stacked': this.variant === VARIANT.LABEL_STACKED,
            'slds-form-element_horizontal':
                this.variant === VARIANT.LABEL_INLINE,
            'slds-has-error': !this.valid
        });
    }

    handleBlur() {
        if (this.required && !this.checked) {
            this.valid = false;
        } else {
            this.valid = true;
        }
        this.updateClassList();
    }

    handleChange(event) {
        this._checked = event.target.checked;

        this.dispatchEvent(
            new CustomEvent('change', {
                detail: event.target.checked,
                bubbles: true,
                cancelable: false,
                composed: true
            })
        );
    }
}
