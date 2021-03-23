import { LightningElement, api } from 'lwc';
import { normalizeBoolean } from 'c/utilsPrivate';

export default class AvonniSplitterPane extends LightningElement {
    @api max;
    @api min;
    @api size;
    @api collapsedSize;

    _collapsed = false;
    _scrollable = false;
    _resizable = false;
    _collapsible = false;

    startX;
    startY;
    startWidth;
    startHeight;

    connectedCallback() {
        if (this.max) {
            this.setAttribute('max', this.max);
        }

        if (this.min) {
            this.setAttribute('min', this.min);
        }

        if (this.size) {
            this.setAttribute('size', this.size);
        }

        if (this.collapsedSize) {
            this.setAttribute('collapsedSize', this.collapsedSize);
        }

        this.setAttribute('resizable', this._resizable);
        this.setAttribute('scrollable', this._scrollable);
        this.setAttribute('collapsed', this._collapsed);
        this.setAttribute('collapsible', this._collapsible);
    }

    renderedCallback() {
        let slotElements = this.template
            .querySelector('slot')
            .assignedElements();

        if (slotElements.length > 0) {
            slotElements.forEach(element => {
                if (element.localName.indexOf('-splitter') > -1) {
                    element.classList.add('horizontal');
                } else {
                    element.classList.add('vertical');
                }
            });
        }
    }

    @api get collapsed() {
        return this._collapsed;
    }

    set collapsed(value) {
        this._collapsed = normalizeBoolean(value);
    }

    @api get scrollable() {
        return this._scrollable;
    }

    set scrollable(value) {
        this._scrollable = normalizeBoolean(value);
    }

    @api get collapsible() {
        return this._collapsible;
    }

    set collapsible(value) {
        this._collapsible = normalizeBoolean(value);
    }

    @api get resizable() {
        return this._resizable;
    }

    set resizable(value) {
        this._resizable = normalizeBoolean(value);
    }
}
