import { LightningElement, api } from 'lwc';
import { classSet } from 'c/utils';
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';

const validVariants = ['base', 'error', 'offline', 'warning'];

export default class AvonniAlert extends LightningElement {
    @api iconName;
    @api closeAction;

    hideAlert;
    _variant = 'base';
    _textured = false;
    _isDismissible = false;

    @api
    get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: 'base',
            validValues: validVariants
        });
    }

    @api
    get textured() {
        return this._textured;
    }

    set textured(value) {
        this._textured = normalizeBoolean(value);
    }

    @api
    get isDismissible() {
        return this._isDismissible;
    }

    set isDismissible(value) {
        this._isDismissible = normalizeBoolean(value);
    }

    get variantInverse() {
        return this.variant === 'warning' ? 'bare' : 'inverse';
    }

    get iconClass() {
        return this.variant === 'warning' ? '' : 'slds-button_icon-inverse';
    }

    get variantClass() {
        return classSet('slds-notify slds-notify_alert')
            .add({
                'slds-theme_info': this.variant === 'base',
                'slds-theme_error': this.variant === 'error',
                'slds-theme_offline': this.variant === 'offline',
                'slds-theme_warning': this.variant === 'warning',
                'slds-theme_alert-texture': this.textured
            })
            .toString();
    }

    closeAlert() {
        this.hideAlert = true;
        this.closeAction();
    }
}
