import { LightningElement, api } from 'lwc';
import {
    classListMutation,
    ContentMutation,
    synchronizeAttrs,
    getRealDOMId,
    normalizeBoolean,
    normalizeString,
    normalizeAriaAttribute
} from 'c/utilsPrivate';
import { classSet } from 'c/utils';
import {
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

const validSizes = ['x-small', 'small', 'medium', 'large'];

export default class AvonniInputToggle extends LightningElement {
    @api accessKey;
    @api ariaLabel;
    @api fieldLevelHelp;
    @api label;
    @api messageToggleActive = 'Active';
    @api messageToggleInactive = 'Inactive';
    @api name;
    @api value;

    _ariaControls;
    _ariaDescribedBy;
    _checked;
    _disabled;
    _hideMark = false;
    _messageWhenValueMissing;
    _readOnly;
    _required;
    _size = 'medium';
    _variant;

    _rendered;
    helpMessage;
    valid = true;

    constructor() {
        super();
        this.ariaObserver = new ContentMutation(this);
    }

    connectedCallback() {
        this.classList.add('slds-form-element');
        this.updateClassList();
    }

    renderedCallback() {
        if (!this._rendered) this._rendered = true;
        this._synchronizeA11y();
    }

    _synchronizeA11y() {
        const input = this.template.querySelector('input');

        if (input) {
            synchronizeAttrs(input, {
                [ARIA_DESCRIBEDBY]: this.computedAriaDescribedBy,
                [ARIA_CONTROLS]: this.computedAriaControls,
                [ARIA_LABELEDBY]: this.computedAriaLabelledBy
            });
        }
    }

    @api
    get ariaControls() {
        return this._ariaControls;
    }
    set ariaControls(references) {
        this._ariaControls = normalizeAriaAttribute(references);
        this.ariaObserver.link(
            'input',
            'aria-controls',
            this._ariaControls,
            '[data-aria]'
        );
    }

    @api
    get ariaDescribedBy() {
        return this._ariaDescribedBy;
    }

    set ariaDescribedBy(references) {
        this._ariaDescribedBy = normalizeAriaAttribute(references);
        this.ariaObserver.link(
            'input',
            'aria-describedby',
            this._ariaDescribedBy,
            '[data-aria]'
        );
    }

    @api
    get ariaLabelledBy() {
        return this._ariaLabelledBy;
    }

    set ariaLabelledBy(references) {
        this._ariaLabelledBy = normalizeAriaAttribute(references);
        this.ariaObserver.link(
            'input',
            'aria-labelledby',
            this._ariaLabelledBy,
            '[data-aria]'
        );
    }

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
        return this._messageWhenValueMissing;
    }

    set messageWhenValueMissing(value) {
        this._messageWhenValueMissing = normalizeString(value, {
            toLowerCase: false
        });
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
        this._updateProxyInputAttributes('required');
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
        if (this._rendered) {
            this.template.querySelector('input').blur();
        }
    }

    @api
    checkValidity() {
        return this._constraint.checkValidity();
    }

    @api
    focus() {
        if (this._rendered) {
            this.template.querySelector('input').focus();
        }
    }

    @api
    reportValidity() {
        return this._constraint.reportValidity((message) => {
            this.helpMessage = this.messageWhenValueMissing || message;
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

    get computedWrapperClass() {
        return classSet('slds-checkbox_toggle label').add({
            'slds-form-element_stacked': this.variant === VARIANT.LABEL_STACKED,
            'slds-grid': this.variant === VARIANT.LABEL_INLINE
        });
    }

    get computedFauxToggleClass() {
        return classSet('slds-checkbox_faux').add({
            'faux_x-small': this.size === 'x-small',
            faux_small: this.size === 'small',
            faux_large: this.size === 'large',
            'faux_hide-mark': this.hideMark === true
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

    get computedUniqueHelpElementId() {
        return getRealDOMId(this.template.querySelector('[data-help-message]'));
    }

    get computedUniqueToggleElementDescribedById() {
        const toggle = this.template.querySelector('[data-toggle-description]');
        return getRealDOMId(toggle);
    }

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

    get computedAriaControls() {
        const ariaValues = [];

        if (this.ariaControls) {
            ariaValues.push(this.ariaControls);
        }

        return normalizeAriaAttribute(ariaValues);
    }

    get computedAriaLabelledBy() {
        const ariaValues = [];

        if (this.ariaLabelledBy) {
            ariaValues.push(this.ariaLabelledBy);
        }

        return normalizeAriaAttribute(ariaValues);
    }

    get _inputElement() {
        return this.template.querySelector('input');
    }

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

    _updateProxyInputAttributes(attributes) {
        if (this._constraintApiProxyInputUpdater) {
            this._constraintApiProxyInputUpdater(attributes);
        }
    }

    updateClassList() {
        classListMutation(this.classList, {
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
        if (this.readOnly) {
            this._inputElement.checked = this.checked;
            return;
        }

        this._checked = this._inputElement.checked;
        this._updateProxyInputAttributes('checked');

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
