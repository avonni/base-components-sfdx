import { LightningElement, api } from 'lwc';
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';
import { classSet } from 'c/utils';
import { generateUniqueId } from 'c/inputUtils';

const validAligns = ['left', 'center', 'right', 'fill'];

export default class AvonniPagination extends LightningElement {
    @api perPage = 20;
    @api totalRows = 0;
    @api ellipsisText = '...';
    @api ellipsisClass;
    @api firstButtonLabel;
    @api firstButtonIconName;
    @api previousButtonLabel;
    @api nextButtonLabel;
    @api lastButtonLabel;
    @api lastButtonIconName;

    _value = 1;
    _limit = 5;
    _nextButtonIconName;
    _previousButtonIconName;
    _align = 'left';
    _disabled = false;
    init = false;

    renderedCallback() {
        if (!this.init) {
            let container = this.template.querySelector(
                '.avonni-pagination-container'
            );
            let style = document.createElement('style');

            style.innerText = `
                lightning-button-icon:focus,
                lightning-button:focus,
                .slds-button:focus {
                    outline: none;
                    box-shadow: none;
                }
                .avonni-navigation-button button:not(:disabled):hover {
                    background-color: #f4f6f9
                }
                .avonni-pagination-icon {
                    fill: #1b5297;
                }
                .avonni-button-active button:not(:disabled) {
                    border-color: #1b5297;
                    background-color: #1b5297;
                    color: #ffffff;
                }
                .avonni-pagination-container-fill .avonni-pagination-button {
                    flex: auto;
                    display: flex;
                }   
                .avonni-pagination-container-fill .avonni-pagination-button button {
                    flex: 1;
                }                 
            `;

            container.appendChild(style);
            this.init = true;
        }
        this.setActiveButton();
    }

    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = Number(value);
    }

    @api
    get limit() {
        return this._limit;
    }

    set limit(value) {
        this._limit = Number(value);

        if (this._limit < 3) {
            this._limit = 3;
        }
    }

    @api
    get nextButtonIconName() {
        if (!this.nextButtonLabel && !this._nextButtonIconName) {
            return 'utility:chevronright';
        }

        return this._nextButtonIconName;
    }

    set nextButtonIconName(value) {
        this._nextButtonIconName = value;
    }

    @api
    get previousButtonIconName() {
        if (!this.previousButtonLabel && !this._previousButtonIconName) {
            return 'utility:chevronleft';
        }

        return this._previousButtonIconName;
    }

    set previousButtonIconName(value) {
        this._previousButtonIconName = value;
    }

    @api get align() {
        return this._align;
    }

    set align(align) {
        this._align = normalizeString(align, {
            fallbackValue: 'left',
            validValues: validAligns
        });
    }

    @api get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    get index() {
        return this.limit === 3 ? 2 : this.limit - Math.ceil(this.limit / 3);
    }

    get paginationSize() {
        let size = Math.ceil(this.totalRows / this.perPage);
        return size === 0 ? 1 : size;
    }

    get uniqueKey() {
        return generateUniqueId();
    }

    get disabledLeftButtons() {
        return this._disabled || this.value === 1;
    }

    get disabledRightButtons() {
        return this._disabled || this.value === this.paginationSize;
    }

    get showFirstButton() {
        return this.firstButtonLabel || this.firstButtonIconName;
    }

    get firstButtonIcon() {
        return !this.firstButtonLabel && this.firstButtonIconName;
    }

    get showLastButton() {
        return this.lastButtonLabel || this.lastButtonIconName;
    }

    get lastButtonIcon() {
        return !this.lastButtonLabel && this.lastButtonIconName;
    }

    get computedContainerClass() {
        return classSet('avonni-pagination-container')
            .add(`avonni-pagination-container-${this._align}`)
            .toString();
    }

    get paginationButtons() {
        let paginationButtons = [
            ...Array(this.paginationSize + 1).keys()
        ].slice(1);

        let firstIndex = this.value - this.index;
        let lastIndex = this.limit + firstIndex;

        if (this.limit < this.paginationSize) {
            if (this.limit === 3) {
                if (this.value < this.paginationSize - 1) {
                    if (this.value > 2) {
                        paginationButtons = paginationButtons.slice(
                            firstIndex,
                            lastIndex
                        );
                    } else {
                        paginationButtons = paginationButtons.slice(
                            0,
                            this.limit
                        );
                    }
                } else {
                    paginationButtons = paginationButtons.slice(
                        this.paginationSize - this.limit,
                        this.paginationSize
                    );
                }
            } else {
                if (this.value < this.paginationSize - 2) {
                    if (this.value >= this.limit - 2) {
                        paginationButtons = paginationButtons.slice(
                            firstIndex,
                            lastIndex
                        );
                        paginationButtons[0] = this.ellipsisText;
                    } else {
                        paginationButtons = paginationButtons.slice(
                            0,
                            this.limit
                        );
                    }
                    paginationButtons[this.limit - 1] = this.ellipsisText;
                } else {
                    paginationButtons = paginationButtons.slice(
                        this.paginationSize - this.limit,
                        this.paginationSize
                    );
                    paginationButtons[0] = this.ellipsisText;
                }
            }
        }

        return paginationButtons;
    }

    @api
    first() {
        this.value = 1;
        this.handlerChange();
    }

    @api
    previous() {
        if (this.value > 1) {
            this.value = this.value - 1;
            this.handlerChange();
        }
    }

    @api
    next() {
        if (this.value < this.paginationSize) {
            this.value = this.value + 1;
            this.handlerChange();
        }
    }

    @api
    last() {
        this.value = this.paginationSize;
        this.handlerChange();
    }

    @api
    goto(index) {
        this.value = Number(index);
        this.handlerChange();
    }

    goToIndex(event) {
        if (event.target.value !== this.ellipsisText) {
            this.goto(Number(event.target.value));
        }
    }

    handlerChange() {
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value: this.value
                }
            })
        );
    }

    setActiveButton() {
        [
            ...this.template.querySelectorAll('.avonni-pagination-button')
        ].forEach(button => {
            if (Number(button.value) === this.value) {
                button.classList.add('avonni-button-active');
            } else {
                button.classList.remove('avonni-button-active');
            }
        });
    }
}
