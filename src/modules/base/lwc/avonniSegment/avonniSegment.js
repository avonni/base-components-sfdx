import { LightningElement, api } from 'lwc';
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';

const validVariants = ['shade', 'success', 'warning', 'error'];

export default class AvonniSegment extends LightningElement {
    @api value;

    _variant = 'shade';
    _disabled = false;

    renderedCallback() {
        this.moveSwitch(this.value);

        if (this.disabled) {
            let buttons = this.template
                .querySelector('slot')
                .assignedElements();

            buttons.forEach((button) => {
                button.disableButton();
            });
        }
    }

    @api get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: 'shade',
            validValues: validVariants
        });
    }

    @api get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    get computedSegmentClass() {
        return `avonni-segment-container avonni-segment-${this.variant}`;
    }

    handleClick(event) {
        if (event.detail.value !== undefined) {
            this.moveSwitch(event.detail.value);

            this.dispatchEvent(
                new CustomEvent('change', {
                    bubbles: true,
                    cancelable: true,
                    detail: {
                        value: event.detail.value
                    }
                })
            );
        }
    }

    moveSwitch(value) {
        let segmentButton = this.querySelector(`[data-value='${value}']`);
        let switchContainer = this.template.querySelector(
            '.avonni-switch-container'
        );

        if (segmentButton) {
            switchContainer.style.left = `${segmentButton.offsetLeft - 4}px`;
            switchContainer.style.width = `${segmentButton.offsetWidth + 1}px`;
        }
    }
}
