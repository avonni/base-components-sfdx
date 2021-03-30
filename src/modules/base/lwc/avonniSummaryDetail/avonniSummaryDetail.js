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

    connectedCallback() {
        if (this.fullWidth) {
            this.titleClass = 'slds-col';
            this.bodyClass = 'slds-col';
        }

        this.contentClass = classSet('slds-summary-detail__content')
            .add({
                'avonni-summary-detail__content_no-indent': this
                    .removeBodyIndentation
            })
            .toString();
    }

    @api get shrinkIconName() {
        return this._shrinkIconName;
    }
    set shrinkIconName(name) {
        this._shrinkIconName = name;
    }

    @api get expandIconName() {
        return this._expandIconName;
    }
    set expandIconName(name) {
        this._expandIconName = name;
    }

    @api get fullWidth() {
        return this._fullWidth;
    }
    set fullWidth(boolean) {
        this._fullWidth = normalizeBoolean(boolean);
    }

    @api get removeBodyIndentation() {
        return this._removeBodyIndentation;
    }
    set removeBodyIndentation(boolean) {
        this._removeBodyIndentation = normalizeBoolean(boolean);
    }

    @api get closed() {
        return this._closed;
    }
    set closed(value) {
        this._closed = normalizeBoolean(value);
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
    }
}
