import { LightningElement, api } from 'lwc';
import { normalizeString, normalizeBoolean } from 'c/utilsPrivate';
import { classSet } from 'c/utils';

const VALID_POSITIONS = { valid: ['right', 'left'], default: 'right' };

const VALID_SIZES = {
    valid: ['small', 'medium', 'large', 'x-large', 'full'],
    default: 'medium'
};

export default class AvonniPagination extends LightningElement {
    @api title;

    _position = VALID_POSITIONS.default;
    _size = VALID_SIZES.default;
    _showPanel = false;
    _isRight = true;

    showTitleSlot = true;
    showPanelBodySlot = true;

    renderedCallback() {
        if (this.titleSlot) {
            this.showTitleSlot = this.titleSlot.assignedElements().length !== 0;
        }

        if (this.panelBodySlot) {
            this.showPanelBodySlot =
                this.panelBodySlot.assignedElements().length !== 0;
        }
    }

    get titleSlot() {
        return this.template.querySelector('slot[name=title]');
    }

    get panelBodySlot() {
        return this.template.querySelector('slot[name=panel-body]');
    }

    @api
    get position() {
        return this._position;
    }

    set position(position) {
        this._position = normalizeString(position, {
            fallbackValue: VALID_POSITIONS.default,
            validValues: VALID_POSITIONS.valid
        });
    }

    @api
    get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: VALID_SIZES.default,
            validValues: VALID_SIZES.valid
        });
    }

    @api
    get showPanel() {
        return this._showPanel;
    }

    set showPanel(value) {
        this._showPanel = normalizeBoolean(value);
    }

    get computedOuterClass() {
        return classSet('slds-panel slds-panel_docked')
            .add({
                'slds-size_small': this._size === 'small',
                'slds-size_medium': this._size === 'medium',
                'slds-size_large': this._size === 'large',
                'slds-size_x-large': this._size === 'x-large',
                'slds-size_full': this._size === 'full'
            })
            .add({
                'slds-panel_docked-right': this._position === 'right',
                'slds-panel_docked-left': this._position === 'left'
            })
            .add({
                'slds-is-open': this._showPanel === true,
                'slds-is-hidden': this._showPanel === false
            })
            .toString();
    }

    get hasStringTitle() {
        return !!this.title;
    }

    @api
    close() {
        this._showPanel = false;
    }

    @api
    toggle() {
        this._showPanel = !this._showPanel;
    }

    @api
    open() {
        this._showPanel = true;
    }
}
