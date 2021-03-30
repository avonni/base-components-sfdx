import { LightningElement, api } from 'lwc';
import { normalizeString } from 'c/utilsPrivate';
import { classSet } from 'c/utils';
import pageHeader from './avonniPageHeader.html';
import pageHeaderVertical from './avonniPageHeaderVertical.html';
import { computeSldsClass } from 'c/iconUtils';

const VARIANTS = {
    valid: ['base', 'object-home', 'record-home', 'record-home-vertical'],
    default: 'base'
};

export default class AvonniPageHeader extends LightningElement {
    @api iconName;
    @api label;
    @api title;
    @api info;

    _variant = 'base';
    _items = [];
    showTitle = true;
    showLabel = true;
    showActions = true;
    showDetails = true;
    showInfo = true;
    showControls = true;

    render() {
        if (this._variant === 'record-home-vertical') {
            return pageHeaderVertical;
        }
        return pageHeader;
    }

    renderedCallback() {
        if (this.titleSlot) {
            this.showTitle = this.titleSlot.assignedElements().length !== 0;
        }
        if (this.labelSlot) {
            this.showLabel = this.labelSlot.assignedElements().length !== 0;
        }
        if (this.actionsSlot) {
            this.showActions = this.actionsSlot.assignedElements().length !== 0;
        }
        if (this.detailsSlot) {
            this.showDetails = this.detailsSlot.assignedElements().length !== 0;
        }
        if (this.infoSlot) {
            this.showInfo = this.infoSlot.assignedElements().length !== 0;
        }
        if (this.controlsSlot) {
            this.showControls =
                this.controlsSlot.assignedElements().length !== 0;
        }
    }

    get titleSlot() {
        return this.template.querySelector('slot[name=title]');
    }

    get labelSlot() {
        return this.template.querySelector('slot[name=label]');
    }

    get actionsSlot() {
        return this.template.querySelector('slot[name=actions]');
    }

    get detailsSlot() {
        return this.template.querySelector('slot[name=details]');
    }

    get infoSlot() {
        return this.template.querySelector('slot[name=info]');
    }

    get controlsSlot() {
        return this.template.querySelector('slot[name=controls]');
    }

    @api
    get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: VARIANTS.default,
            validValues: VARIANTS.valid
        });
    }

    @api
    get items() {
        return this._items;
    }

    set items(value) {
        this._items = Array.isArray(value) ? value : [];
    }

    get computedOuterClass() {
        return classSet('slds-page-header')
            .add({
                'slds-page-header_object-home': this._variant === 'object-home',
                'slds-page-header_record-home': this._variant === 'record-home'
            })
            .toString();
    }

    get computedIconClass() {
        return classSet('slds-icon_container')
            .add(computeSldsClass(this.iconName))
            .toString();
    }

    get isBaseVariant() {
        return this._variant === 'base';
    }

    get isObjectHomeVariant() {
        return this._variant === 'object-home';
    }

    get isRecordHomeVariant() {
        return this._variant === 'record-home';
    }

    get hasStringTitle() {
        return !!this.title;
    }

    get hasStringLabel() {
        return !!this.label;
    }

    get hasStringInfo() {
        return !!this.info;
    }

    get itemsIsEmpty() {
        return this._items.length === 0;
    }
}
