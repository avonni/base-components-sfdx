import { LightningElement, api } from 'lwc';

export default class AvonniVerticalProgressStep extends LightningElement {
    @api label;

    _value;
    iconName;
    contentInLine = false;

    connectedCallback() {
        this.classList.add('slds-progress__item');
    }

    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this.setAttribute('data-step', value);
    }

    @api
    setAttributes(contentInLine, shade) {
        if (contentInLine) {
            this.contentInLine = contentInLine;
            this.classList.add('avonni-content-in-line');
        }
        if (shade) {
            this.classList.add('avonni-spread');
        }
    }

    @api
    setIcon(iconName) {
        this.iconName = iconName;
    }

    get slotItems() {
        return this.template.querySelector('slot');
    }

    handleMouseEnter() {
        this.dispatchEvent(
            new CustomEvent('stepmouseenter', {
                bubbles: true,
                cancelable: true,
                detail: {
                    value: this.value
                }
            })
        );
    }

    handleMouseLeave() {
        this.dispatchEvent(
            new CustomEvent('stepmouseleave', {
                bubbles: true,
                cancelable: true,
                detail: {
                    value: this.value
                }
            })
        );
    }

    handleFocus() {
        this.dispatchEvent(
            new CustomEvent('stepfocus', {
                bubbles: true,
                cancelable: true,
                detail: {
                    value: this.value
                }
            })
        );
    }

    handleBlur() {
        this.dispatchEvent(
            new CustomEvent('stepblur', {
                bubbles: true,
                cancelable: true,
                detail: {
                    value: this.value
                }
            })
        );
    }
}
