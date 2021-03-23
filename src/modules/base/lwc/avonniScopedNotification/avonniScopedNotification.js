import { LightningElement, api } from 'lwc';
import { classSet } from 'c/utils';
import { normalizeString } from 'c/utilsPrivate';

const validVariants = ['base', 'light', 'dark', 'warning', 'error', 'success'];
const validIconSizes = ['xx-small', 'x-small', 'small', 'medium', 'large'];

export default class AvonniScopedNotification extends LightningElement {
    @api title;
    @api iconName;

    _variant = 'base';
    _iconSize = 'medium';
    showTitle = true;

    renderedCallback() {
        if (this.titleSlot) {
            this.showTitle = this.titleSlot.assignedElements().length !== 0;
        }
    }

    get titleSlot() {
        return this.template.querySelector('slot[name=title]');
    }

    @api get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: 'base',
            validValues: validVariants
        });
    }

    @api get iconSize() {
        return this._iconSize;
    }

    set iconSize(iconSize) {
        this._iconSize = normalizeString(iconSize, {
            fallbackValue: 'medium',
            validValues: validIconSizes
        });
    }

    get computedNotificationClass() {
        return classSet('slds-scoped-notification slds-media slds-media_center')
            .add({
                'slds-scoped-notification_light': this.variant === 'light',
                'slds-scoped-notification_dark': this.variant === 'dark',
                'avonni-scoped-notification_warning':
                    this.variant === 'warning',
                'avonni-scoped-notification_error': this.variant === 'error',
                'avonni-scoped-notification_success': this.variant === 'success'
            })
            .toString();
    }

    get computedIconVariant() {
        return classSet()
            .add({
                inverse: this.variant === 'dark',
                warning: this.variant === 'warning',
                error: this.variant === 'error',
                success: this.variant === 'success'
            })
            .toString();
    }
}
