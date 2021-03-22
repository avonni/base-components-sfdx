import { LightningElement, api, track } from 'lwc';
import { normalizeString, normalizeBoolean } from 'c/utilsPrivate';
import { classSet } from 'c/utils';

const validVariants = ['base', 'comment'];

export default class AvonniPublisher extends LightningElement {
    
    @api placeholder;
    @api buttonLabel;
    @api submitAction;

    @track _variant = 'base';
    @track _disabled;
    @track isActive = false;
    @track _value;
    @track showFigureSlot = true;
    @track showActionsSlot = true;

    renderedCallback() {
        if (this.isActive) {
            this.template.querySelector('.richTextPublisher').focus();
        }

        if (this.figureSlot) {
            this.showFigureSlot =
                this.figureSlot.assignedElements().length !== 0 &&
                this._variant === 'comment';
        }

        if (this.actionsSlot) {
            this.showActionsSlot =
                this.actionsSlot.assignedElements().length !== 0;
        }
    }

    get figureSlot() {
        return this.template.querySelector('slot[name=figure]');
    }

    get actionsSlot() {
        return this.template.querySelector('slot[name=actions]');
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

    @api get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    @api get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }

    get publisherClass() {
        return classSet('slds-publisher')
            .add({
                'slds-is-active': this.isActive
            })
            .toString();
    }

    get actionsSectionClass() {
        return classSet('slds-publisher__actions slds-grid')
            .add({
                'slds-grid_align-spread': this.showActionsSlot,
                'slds-grid_align-end': !this.showActionsSlot
            })
            .toString();
    }

    @api
    focus() {
        this.isActive = true;
    }

    @api
    blur() {
        if (this.isActive) {
            this.template.querySelector('.richTextPublisher').blur();
        }
    }

    handleChange(e) {
        this.value = e.detail.value;
    }

    hanlerClick() {
        if (this.isActive) {
            const selectedEvent = new CustomEvent('submit', {
                detail: this._value
            });
            this.dispatchEvent(selectedEvent);

            this.isActive = false;
            this._value = '';
        } else {
            this.isActive = true;
        }
    }

    get buttonDisabled() {
        return (this.isActive && !this.value) || this._disabled;
    }

    get renderButton() {
        return this._variant === 'base' || this.isActive;
    }
}
