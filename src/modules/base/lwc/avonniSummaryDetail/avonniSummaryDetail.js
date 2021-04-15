import { LightningElement, api } from 'lwc';
import { normalizeBoolean } from 'c/utilsPrivate';
import { classSet } from 'c/utils';

export default class AvonniSummaryDetail extends LightningElement {
    @api title;

    titleClass;
    bodyClass;
    contentClass;
    _removeBodyIndentation;
    _shrinkIconName = 'utility:chevrondown';
    _expandIconName = 'utility:chevronright';
    _fullWidth;
    _closed;
    _hideIcon;

    connectedCallback() {
        this.titleClass = classSet('avonni-min-width_0').add({
            'slds-col': this.fullWidth
        });

        this.bodyClass = classSet('avonni-min-width_0').add({
            'slds-col': this.fullWidth
        });

        this.contentClass = classSet('slds-summary-detail__content').add({
            'content_no-indent': this.removeBodyIndentation && !this.hideIcon
        });
    }

    @api
    get shrinkIconName() {
        return this._shrinkIconName;
    }
    set shrinkIconName(name) {
        this._shrinkIconName = (typeof name === 'string' && name.trim()) || '';
    }

    @api
    get expandIconName() {
        return this._expandIconName;
    }
    set expandIconName(name) {
        this._expandIconName = (typeof name === 'string' && name.trim()) || '';
    }

    @api
    get fullWidth() {
        return this._fullWidth;
    }
    set fullWidth(boolean) {
        this._fullWidth = normalizeBoolean(boolean);
    }

    @api
    get removeBodyIndentation() {
        return this._removeBodyIndentation;
    }
    set removeBodyIndentation(boolean) {
        this._removeBodyIndentation = normalizeBoolean(boolean);
    }

    @api
    get closed() {
        return this._closed;
    }
    set closed(value) {
        this._closed = normalizeBoolean(value);
    }

    @api
    get hideIcon() {
        return this._hideIcon;
    }
    set hideIcon(value) {
        this._hideIcon = normalizeBoolean(value);
    }

    get sectionIsOpen() {
        return !this._closed;
    }

    get sectionClass() {
        return classSet('slds-summary-detail')
            .add({
                'slds-is-open': this.sectionIsOpen
            })
            .toString();
    }

    get iconName() {
        return this.closed ? this.expandIconName : this.shrinkIconName;
    }

    changeSectionStatus() {
        this._closed = !this._closed;

        this.dispatchEvent(
            new CustomEvent('toggle', {
                detail: {
                    closed: this._closed
                }
            })
        );
    }
}
