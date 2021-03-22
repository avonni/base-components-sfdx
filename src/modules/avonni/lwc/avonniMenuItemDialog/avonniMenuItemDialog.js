import { LightningElement, api } from 'lwc';
import { normalizeBoolean, keyCodes } from 'c/utilsPrivate';

export default class AvonniMenuItemDialog extends LightningElement {
    @api value;
    @api accessKey;
    @api draftAlternativeText;
    @api iconName;
    @api label;
    @api prefixIconName;

    _tabIndex = '0';
    _disabled = false;
    _isDraft = false;

    connectedCallback() {
        this.classList.add('slds-dropdown__item');
        this.setAttribute('role', 'presentation');
    }

    @api get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    @api get isDraft() {
        return this._isDraft;
    }

    set isDraft(value) {
        this._isDraft = normalizeBoolean(value);
    }

    @api get tabIndex() {
        return this._tabIndex;
    }

    set tabIndex(newValue) {
        this._tabIndex = newValue;
    }

    @api
    focus() {
        this.template.querySelector('a').focus();
        this.dispatchEvent(new CustomEvent('focus'));
    }

    handleBlur() {
        this.dispatchEvent(new CustomEvent('blur'));

        this.dispatchEvent(
            new CustomEvent('privateblur', {
                composed: true,
                bubbles: true,
                cancelable: true
            })
        );
    }

    handleFocus() {
        this.dispatchEvent(
            new CustomEvent('privatefocus', {
                bubbles: true,
                cancelable: true
            })
        );
    }

    handleClick(event) {
        if (this.disabled) {
            event.preventDefault();
            return;
        }

        event.preventDefault();
        this.dispatchSelect();
    }

    handleKeyDown(event) {
        if (this.disabled) {
            return;
        }

        if (event.keyCode === keyCodes.space) {
            if (this.href) {
                this.template.querySelector('a').click();
            }
        }
    }

    dispatchSelect() {
        if (!this.disabled) {
            this.dispatchEvent(
                new CustomEvent('privateselect', {
                    bubbles: true,
                    cancelable: true,
                    detail: {
                        value: this.value,
                        type: 'dialog'
                    }
                })
            );
        }
    }
}
