import { LightningElement, api } from 'lwc';
import { classSet, generateUniqueId } from 'c/utils';
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';

const validVariants = ['coverable', 'non-coverable', 'vertical'];
const validTypes = ['radio', 'checkbox'];
const validSizes = ['xx-small', 'x-small', 'small', 'medium', 'large'];
const validRatio = ['1-by-1', '4-by-3', '16-by-9'];

export default class AvonniVisualPicker extends LightningElement {
    @api label;
    @api items = [];
    @api messageWhenValueMissing;
    @api name = generateUniqueId();

    _value = [];
    _variant = 'non-coverable';
    _type = 'radio';
    _size = 'medium';
    _required = false;
    _disabled = false;
    _hideBorder = false;
    _hideCheckMark = false;
    _ratio = '1-by-1';

    renderedCallback() {
        const inputs = this.template.querySelectorAll('input');

        if (inputs) {
            Array.from(inputs).forEach((item) => {
                if (this._value.indexOf(item.value) > -1) {
                    item.checked = true;
                }
            });
        }
    }

    @api
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;

        const inputs = this.template.querySelectorAll('input');

        if (inputs) {
            Array.from(inputs).forEach((item) => {
                if (this._value.indexOf(item.value) > -1) {
                    item.checked = true;
                }
            });
        }
    }

    @api get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: 'non-coverable',
            validValues: validVariants
        });
    }

    @api get type() {
        return this._type;
    }

    set type(type) {
        this._type = normalizeString(type, {
            fallbackValue: 'radio',
            validValues: validTypes
        });
    }

    @api get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: 'medium',
            validValues: validSizes
        });
    }

    @api get ratio() {
        return this._ratio;
    }

    set ratio(ratio) {
        this._ratio = normalizeString(ratio, {
            fallbackValue: '1-by-1',
            validValues: validRatio
        });
    }

    @api get required() {
        return this._required;
    }

    set required(value) {
        this._required = normalizeBoolean(value);
    }

    @api get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    @api get hideBorder() {
        return this._hideBorder;
    }

    set hideBorder(value) {
        this._hideBorder = normalizeBoolean(value);
    }

    @api get hideCheckMark() {
        return this._hideCheckMark;
    }

    set hideCheckMark(value) {
        this._hideCheckMark = normalizeBoolean(value);
    }

    get itemList() {
        let result = [];

        this.items.forEach((item, index) => {
            let cloneItem = Object.assign({}, item);
            let iconPosition = cloneItem.figure.iconPosition;

            cloneItem.key = `visual-picker-key-${index}`;

            if (this.disabled) {
                cloneItem.disabled = true;
            }

            if (this._variant === 'vertical' && iconPosition !== 'right') {
                iconPosition = 'left';
            } else if (
                this._variant !== 'vertical' &&
                iconPosition !== 'bottom'
            ) {
                iconPosition = 'top';
            }

            cloneItem.isTop =
                (iconPosition === 'left' || iconPosition === 'top') &&
                (cloneItem.figure.iconName || cloneItem.figure.iconSrc);

            cloneItem.isBottom =
                (iconPosition === 'bottom' || iconPosition === 'right') &&
                (cloneItem.figure.iconName || cloneItem.figure.iconSrc);

            if (cloneItem.isTop && this._variant === 'vertical') {
                cloneItem.bodyClass = 'slds-border_left slds-p-around_small';
            }

            if (cloneItem.isBottom && this._variant === 'vertical') {
                cloneItem.bodyClass = 'slds-border_right slds-p-around_small';
            }

            cloneItem.iconClass = classSet('');

            if (
                (this._size !== 'medium' || this._size !== 'large') &&
                this._variant !== 'vertical'
            ) {
                if (iconPosition === 'top') {
                    cloneItem.iconClass
                        .add(`slds-m-bottom_${this._size}`)
                        .toString();
                }
                if (iconPosition === 'bottom') {
                    cloneItem.iconClass
                        .add(`slds-m-top_${this._size}`)
                        .toString();
                }
                if (iconPosition === 'right') {
                    cloneItem.iconClass
                        .add(`slds-m-left_${this._size}`)
                        .toString();
                }
                if (iconPosition === 'left') {
                    cloneItem.iconClass
                        .add(`slds-m-right_${this._size}`)
                        .toString();
                }
            } else {
                cloneItem.iconClass
                    .add({
                        'slds-m-bottom_small': iconPosition === 'top',
                        'slds-m-top_small': iconPosition === 'bottom',
                        'slds-m-left_small': iconPosition === 'right',
                        'slds-m-right_small': iconPosition === 'left'
                    })
                    .toString();
            }

            if (
                (this._size !== 'medium' || this._size !== 'large') &&
                (cloneItem.figure.title || cloneItem.figure.description)
            ) {
                cloneItem.iconSize = this._size;
            } else {
                cloneItem.iconSize = cloneItem.figure.iconSize;
            }

            result.push(cloneItem);
        });

        return result;
    }

    get isCoverable() {
        return this._variant === 'coverable';
    }

    get isVertical() {
        return this._variant === 'vertical';
    }

    get visualPickerClass() {
        return classSet('slds-visual-picker')
            .add({
                'avonni-visual-picker_xx-small':
                    this._size === 'xx-small' && this._variant !== 'vertical',
                'avonni-visual-picker_x-small':
                    this._size === 'x-small' && this._variant !== 'vertical',
                'avonni-visual-picker_small':
                    this._size === 'small' && this._variant !== 'vertical',
                'slds-visual-picker_medium':
                    this._size === 'medium' && this._variant !== 'vertical',
                'slds-visual-picker_large':
                    this._size === 'large' && this._variant !== 'vertical',
                'slds-visual-picker_vertical': this._variant === 'vertical'
            })
            .add(`ratio-${this._ratio}`)
            .toString();
    }

    get visualPickerTypeClass() {
        return classSet('slds-visual-picker__figure')
            .add({
                'slds-visual-picker__text':
                    this._variant === 'non-coverable' ||
                    this._variant === 'vertical',
                'slds-visual-picker__icon': this._variant === 'coverable',
                'slds-align_absolute-left': this._variant === 'vertical',
                'slds-align_absolute-center': this._variant !== 'vertical',
                'avonni-hide-border': this._hideBorder,
                'avonni-hide-check-mark': this._hideCheckMark
            })
            .toString();
    }

    get iconContainerClass() {
        return classSet('slds-icon_container')
            .add({
                'slds-visual-picker__text-check': this._variant !== 'coverable'
            })
            .toString();
    }

    get elementControlClass() {
        return classSet('slds-form-element__control')
            .add({
                'slds-grid slds-wrap': this._variant !== 'vertical'
            })
            .toString();
    }

    get textHeadingClass() {
        return classSet()
            .add({
                'slds-text-heading_large': this._variant !== 'vertical',
                'slds-text-heading_medium slds-m-bottom_x-small':
                    this._variant === 'vertical'
            })
            .toString();
    }

    get selectedClass() {
        return this._variant === 'coverable' ? 'slds-is-selected' : '';
    }

    get notSelectedClass() {
        return classSet()
            .add({
                'slds-is-not-selected':
                    this._variant === 'coverable' && !this._hideCheckMark,
                'avonni-is-not-selected':
                    this._variant === 'coverable' && this._hideCheckMark,
                verticalContainer: this._variant === 'vertical'
            })
            .toString();
    }

    handleChange(event) {
        event.stopPropagation();

        if (this._variant === 'coverable' && this._hideCheckMark) {
            const labels = this.template.querySelectorAll('label');

            labels.forEach((label) => {
                let icon = label.querySelector('lightning-icon');
                if (label.previousSibling.checked) {
                    icon.variant = 'inverse';
                } else {
                    icon.variant = '';
                }
            });
        }

        const inputs = this.template.querySelectorAll('input');
        const value = Array.from(inputs)
            .filter((input) => input.checked)
            .map((input) => input.value);

        this._value = value;

        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value
                }
            })
        );
    }
}
