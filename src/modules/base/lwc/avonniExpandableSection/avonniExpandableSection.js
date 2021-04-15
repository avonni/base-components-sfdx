import { LightningElement, api } from 'lwc';
import { classSet } from 'c/utils';
import { normalizeBoolean } from 'c/utilsPrivate';

export default class AvonniExpandableSection extends LightningElement {
    @api title;

    _closed = false;
    _collapsible = false;

    @api
    get closed() {
        return this._closed;
    }

    set closed(value) {
        this._closed = normalizeBoolean(value);
    }

    @api
    get collapsible() {
        return this._collapsible;
    }

    set collapsible(value) {
        this._collapsible = normalizeBoolean(value);
    }

    get sectionClass() {
        return classSet('slds-section')
            .add({
                'slds-is-open': !this.collapsible || !this.closed
            })
            .toString();
    }

    get sectionTitleClass() {
        return classSet('slds-section__title')
            .add({
                'slds-theme_shade': !this.collapsible
            })
            .toString();
    }

    changeSectionStatus() {
        this._closed = !this._closed;
    }
}
