import { LightningElement, api } from 'lwc';
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';
import { classSet } from 'c/utils';
import { FieldConstraintApiWithProxyInput } from 'c/inputUtils';

const defaultMin = 0;
const defaultMax = 100;
const defaultStep = 1;

const validSizes = ['x-small', 'small', 'medium', 'large'];
const validTypes = ['horizontal', 'vertical'];
const validVariants = ['standard', 'label-hidden'];
const validUnit = ['decimal', 'currency', 'percent'];

export default class AvonniRange extends LightningElement {
    @api label;
    @api messageWhenRangeOverflow;
    @api messageWhenRangeUnderflow;
    @api messageWhenStepMismatch;
    @api messageWhenValueMissing;
    @api messageWhenTooLong;
    @api messageWhenBadInput;
    @api messageWhenPatternMismatch;
    @api messageWhenTypeMismatch;
    @api unitAttributes = {};

    _min = defaultMin;
    _max = defaultMax;
    _step = defaultStep;
    _valueLower;
    _valueUpper;
    _size = '';
    _type = 'horizontal';
    _variant = 'standard';
    _unit = 'decimal';
    _pin = false;
    _disabled = false;
    _helpMessage;

    init;

    renderedCallback() {
        if (!this.init) {
            this.initRange();
            this.init = true;
        }
    }

    @api
    get min() {
        return this._min;
    }

    set min(value) {
        this._min = Number(value);

        if (this.init) {
            this.initRange();
        }
    }

    @api
    get max() {
        return this._max;
    }

    set max(value) {
        this._max = Number(value);

        if (this.init) {
            this.initRange();
        }
    }

    @api
    get step() {
        return this._step;
    }

    set step(value) {
        this._step = Number(value);

        if (this.init) {
            this.initRange();
        }
    }

    @api
    get valueLower() {
        return this._valueLower ? this._valueLower : this.min;
    }

    set valueLower(value) {
        this._valueLower = Number(value);

        if (this.init) {
            this.initRange();
        }
    }

    @api
    get valueUpper() {
        if (!this._valueUpper) {
            return this.valueLower > this.min
                ? Number(this.valueLower) + Number(this.step)
                : this.min;
        }

        return this._valueUpper;
    }

    set valueUpper(value) {
        this._valueUpper = Number(value);

        if (this.init) {
            this.initRange();
        }
    }

    @api get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: '',
            validValues: validSizes
        });

        if (this.init) {
            this.initRange();
        }
    }

    @api get type() {
        return this._type;
    }

    set type(type) {
        this._type = normalizeString(type, {
            fallbackValue: 'horizontal',
            validValues: validTypes
        });

        if (this.init) {
            this.initRange();
        }
    }

    @api get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: 'standard',
            validValues: validVariants
        });

        if (this.init) {
            this.initRange();
        }
    }

    @api get unit() {
        return this._unit;
    }

    set unit(unit) {
        this._unit = normalizeString(unit, {
            fallbackValue: 'number',
            validValues: validUnit
        });

        if (this.init) {
            this.initRange();
        }
    }

    @api get pin() {
        return this._pin;
    }

    set pin(value) {
        this._pin = normalizeBoolean(value);

        if (this.init) {
            this.initRange();
        }
    }

    @api get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);

        if (this.init) {
            this.initRange();
        }
    }

    initRange() {
        this.showHelpMessageIfInvalid();
        this.setInputsWidth();
        this.addProgressLine();
        this.setBubblesPosition();
    }

    handleChangeLeft(event) {
        this.valueLower = event.target.value;
        this.setInputsWidth();
        this.addProgressLine();
        this.changeRange();
        this.setBubblesPosition();
    }

    handleChangeRight(event) {
        this.valueUpper = event.target.value;
        this.setInputsWidth();
        this.addProgressLine();
        this.changeRange();
        this.setBubblesPosition();
    }

    changeRange() {
        this._updateProxyInputLeftAttributes('value');
        this._updateProxyInputRightAttributes('value');

        const selectedEvent = new CustomEvent('change', {
            detail: {
                valueLower: Number(this.valueLower),
                valueUpper: Number(this.valueUpper)
            }
        });

        this.dispatchEvent(selectedEvent);
    }

    get computedLabelClass() {
        const classes = classSet();

        classes.add(
            this._variant === 'label-hidden'
                ? 'slds-assistive-text'
                : 'slds-slider-label__label'
        );

        return classes.toString();
    }

    get computedContainerClass() {
        const { size, type } = this;
        const classes = classSet('');

        if (size) {
            classes.add(`avonni-container_${size}`);
        }

        if (type === 'vertical') {
            classes.add('avoni-vertical');
        }

        return classes.toString();
    }

    get computedBubbleLeftClass() {
        return this._type === 'vertical'
            ? 'avonni-bubble-vertical left-bubble'
            : 'avonni-bubble left-bubble';
    }

    get computedBubbleRightClass() {
        return this._type === 'vertical'
            ? 'avonni-bubble-vertical right-bubble'
            : 'avonni-bubble right-bubble';
    }

    get isVertical() {
        return this._type === 'vertical';
    }

    get calculateMax() {
        return (
            Number(this.valueLower) +
            this.stepsCount('left') * this.step
        ).toFixed(3);
    }

    get calculateMin() {
        let minVaule =
            Number(this.valueUpper) - this.stepsCount('right') * this.step;
        if (minVaule === this.calculateMax) {
            minVaule = minVaule + Number(this.step);
        }

        return minVaule.toFixed(3);
    }

    stepsCount(position) {
        let stepCount = (this.valueUpper - this.valueLower) / this.step;
        let stepsForPosition = 0;

        stepsForPosition =
            position === 'left'
                ? Math.floor(stepCount / 2)
                : Math.round(stepCount / 2);

        return stepsForPosition;
    }

    setInputsWidth() {
        let inputWidth = this.max - this.min;
        let leftStep = this.stepsCount('left');

        let leftInputWidth =
            ((Number(this.valueLower - this.min) / this.step + leftStep) /
                (inputWidth / this.step)) *
            100;

        let rightInputWidth = 100 - leftInputWidth;

        let leftInput = this.template.querySelector('.inverse-right');

        leftInput.style.width = rightInputWidth + '%';

        let rightInput = this.template.querySelector('.inverse-left');

        rightInput.style.width = leftInputWidth + '%';
    }

    addProgressLine() {
        if (!this._disabled) {
            let leftInput = this.template.querySelector('.slider-left');
            let rightInput = this.template.querySelector('.slider-right');

            let leftProgressLine =
                ((this.calculateMax - this.valueLower) /
                    (this.calculateMax - this.min)) *
                100;
            let rightProgressLine =
                ((this.valueUpper - this.calculateMin) /
                    (this.max - this.calculateMin)) *
                100;

            leftInput.style.background =
                'linear-gradient(to left, #1a5296 0%, #1a5296 ' +
                leftProgressLine +
                '%, #ecebea ' +
                leftProgressLine +
                '%, #ecebea 100%)';

            rightInput.style.background =
                'linear-gradient(to right, #1a5296 0%, #1a5296 ' +
                rightProgressLine +
                '%, #ecebea ' +
                rightProgressLine +
                '%, #ecebea 100%)';
        }
    }

    showLeftBubble() {
        if (this._pin) {
            let bubbleLeft = this.template.querySelector('.left-bubble');
            bubbleLeft.style.opacity = '1';
        }
    }

    showRightBubble() {
        if (this._pin) {
            let bubbleRight = this.template.querySelector('.right-bubble');
            bubbleRight.style.opacity = '1';
        }
    }

    hideLeftBubble() {
        if (this._pin) {
            let bubbleLeft = this.template.querySelector('.left-bubble');
            bubbleLeft.style.opacity = '0';
        }
    }

    hideRightBubble() {
        if (this._pin) {
            let bubbleRight = this.template.querySelector('.right-bubble');
            bubbleRight.style.opacity = '0';
        }
    }

    setBubblesPosition() {
        if (this._pin) {
            setTimeout(() => {
                let bubbleLeft = this.template.querySelector('.left-bubble');
                let bubbleRight = this.template.querySelector('.right-bubble');

                let rightProgressBubble =
                    ((this.valueUpper - this.calculateMin) /
                        (this.max - this.calculateMin)) *
                    100;

                let leftProgressBubble =
                    (1 -
                        (this.calculateMax - this.valueLower) /
                            (this.calculateMax - this.min)) *
                    100;

                bubbleLeft.style.left =
                    'calc(' +
                    leftProgressBubble +
                    '% - ' +
                    (leftProgressBubble * 0.16 + 8) +
                    'px)';

                bubbleRight.style.left =
                    'calc(' +
                    rightProgressBubble +
                    '% - ' +
                    (rightProgressBubble * 0.16 + 8) +
                    'px)';
            }, 1)
        }
    }

    @api get validity() {
        return (
            this._constraintLeft.validity +
            ', ' +
            this._constraintRight.validity
        );
    }

    @api
    checkValidity() {
        return (
            this._constraintLeft.checkValidity() &&
            this._constraintRight.checkValidity()
        );
    }

    @api
    reportValidity() {
        let helpMessage = '';

        let leftInput = this._constraintLeft.reportValidity(message => {
            helpMessage = helpMessage + message;
        });

        let rightInput = this._constraintRight.reportValidity(message => {
            if (!leftInput) {
                helpMessage = helpMessage + ', ';
            }

            helpMessage = helpMessage + message;
        });

        this._helpMessage = helpMessage;

        return leftInput && rightInput;
    }

    @api
    setCustomValidity(message) {
        this._constraintLeft.setCustomValidity(message);
        this._constraintRight.setCustomValidity(message);
    }

    @api
    showHelpMessageIfInvalid() {
        this.reportValidity();
    }

    _updateProxyInputLeftAttributes(attributes) {
        if (this._constraintApiProxyInputLeftUpdater) {
            this._constraintApiProxyInputLeftUpdater(attributes);
        }
    }

    _updateProxyInputRightAttributes(attributes) {
        if (this._constraintApiProxyInputRightUpdater) {
            this._constraintApiProxyInputRightUpdater(attributes);
        }
    }

    get _constraintLeft() {
        if (!this._constraintApiLeft) {
            this._constraintApiLeft = new FieldConstraintApiWithProxyInput(
                () => this
            );

            this._constraintApiProxyInputLeftUpdater = this._constraintApiLeft.setInputAttributes(
                {
                    type: () => 'range',
                    value: () => this.valueLower,
                    max: () => this.max,
                    min: () => this.min,
                    step: () => this.step,
                    disabled: () => this.disabled
                }
            );
        }
        return this._constraintApiLeft;
    }

    get _constraintRight() {
        if (!this._constraintApiRight) {
            this._constraintApiRight = new FieldConstraintApiWithProxyInput(
                () => this
            );

            this._constraintApiProxyInputRightUpdater = this._constraintRight.setInputAttributes(
                {
                    type: () => 'range',
                    value: () => this.valueUpper,
                    max: () => this.max,
                    min: () => this.min,
                    step: () => this.step,
                    disabled: () => this.disabled
                }
            );
        }
        return this._constraintApiRight;
    }
}
