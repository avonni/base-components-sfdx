import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';
import { classSet } from 'c/utils';

const SELECTION_TYPES = {
    valid: ['continuous', 'single'],
    default: 'continuous'
};

export default class AvonniAvonniRatingItem {
    constructor(props) {
        this.disabled = normalizeBoolean(props.disabled);
        this.iconName = props.iconName;
        this.readOnly = normalizeBoolean(props.readOnly);
        this.selected = normalizeBoolean(props.selected);
        this.selectionType = normalizeString(props.selectionType, {
            fallbackValue: SELECTION_TYPES.default,
            validValues: SELECTION_TYPES.valid
        });
        this.value = parseInt(props.value, 10);
    }

    get buttonClass() {
        const isContinuous = this.selectionType === 'continuous';
        const classes = classSet('slds-button avonni-rating__button');
        if (this.iconName) {
            classes
                .add(
                    'slds-button_icon slds-button_icon-bare avonni-rating__button-icon'
                )
                .add({
                    'avonni-rating__continuous-icon': isContinuous,
                    'avonni-rating__icon_selected': this.selected,
                    'avonni-rating__active-icon':
                        !this.disabled && !this.readOnly,
                    'avonni-rating__icon_read-only': this.readOnly
                });
        } else {
            classes.add({
                'slds-button_outline-brand': !this.selected,
                'slds-button_brand': this.selected,
                'avonni-rating__continuous': isContinuous,
                'avonni-rating__active': !this.disabled && !this.readOnly,
                'avonni-rating__icon_read-only': this.readOnly
            });
        }
        return classes.toString();
    }
}
