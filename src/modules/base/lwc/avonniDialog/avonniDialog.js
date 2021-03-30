import { LightningElement, api } from 'lwc';
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';
import { classSet } from 'c/utils';

const validSizes = ['small', 'medium', 'large'];

export default class AvonniDialog extends LightningElement {
    @api dialogName;
    @api title;
    @api loadingStateAlternativeText;

    _size = 'medium';
    _isLoading;
    _showDialog = false;
    showTitleSlot = true;
    showFooter = true;
    showHeader = true;

    connectedCallback() {
        this.setAttribute('dialog-name', this.dialogName);
    }

    renderedCallback() {
        if (this.titleSlot) {
            this.showTitleSlot = this.titleSlot.assignedElements().length !== 0;
            this.showHeader = this.title || this.showTitleSlot;
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
    get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: 'medium',
            validValues: validSizes
        });
    }

    @api
    get isLoading() {
        return this._isLoading;
    }

    set isLoading(value) {
        this._isLoading = normalizeBoolean(value);
    }

    @api
    get showDialog() {
        return this._showDialog;
    }

    set showDialog(value) {
        this._showDialog = normalizeBoolean(value);
    }

    @api
    show() {
        this._showDialog = true;
    }

    @api
    hide() {
        this._showDialog = false;
        this.dispatchEvent(new CustomEvent('closedialog'));
    }

    get computedHeaderClass() {
        return classSet('slds-modal__header')
            .add({
                'slds-modal__header_empty': !this.showHeader
            })
            .toString();
    }

    get computedModalClass() {
        return classSet('slds-modal slds-fade-in-open')
            .add({
                'slds-modal_small': this._size === 'small',
                'slds-modal_medium': this._size === 'medium',
                'slds-modal_large': this._size === 'large'
            })
            .toString();
    }
}
