/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2021, Avonni Labs, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * - Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { LightningElement, api } from 'lwc';
import {
    colorType,
    generateColors,
    observePosition,
    normalizeBoolean,
    normalizeString,
    normalizeArray
} from 'c/utilsPrivate';
import { FieldConstraintApi, InteractingState } from 'c/inputUtils';

import { classSet } from 'c/utils';
import { generateUUID } from 'c/utils';

const VARIANTS = {
    valid: ['standard', 'label-inline', 'label-hidden', 'label-stacked'],
    default: 'standard'
};

const TYPES = {
    valid: ['base', 'custom', 'predefined', 'tokens'],
    default: 'base'
};

const MENU_VARIANTS = {
    valid: [
        'bare',
        'container',
        'border',
        'border-filled',
        'bare-inverse',
        'border-inverse'
    ],
    default: 'border'
};

const MENU_ICON_SIZES = {
    valid: ['xx-small', 'x-small', 'small', 'medium', 'large'],
    default: 'x-small'
};

const MENU_ALIGNMENTS = {
    valid: [
        'left',
        'center',
        'right',
        'bottom-left',
        'bottom-center',
        'bottom-right'
    ],
    default: 'left'
};

const DEFAULT_COLORS = [
    '#e3abec',
    '#c2dbf6',
    '#9fd6ff',
    '#9de7da',
    '#9df0bf',
    '#fff099',
    '#fed49a',
    '#d073df',
    '#86b9f3',
    '#5ebbff',
    '#44d8be',
    '#3be281',
    '#ffe654',
    '#ffb758',
    '#bd35bd',
    '#5778c1',
    '#5ebbff',
    '#00aea9',
    '#3bba4c',
    '#f4bc25',
    '#f99120',
    '#580d8c',
    '#001870',
    '#0a2399',
    '#097476',
    '#096a50',
    '#b67d11',
    '#b85d0d'
];

const DEFAULT_COLUMNS = 7;
const DEFAULT_TAB = 'default';
const MINIMUM_TILE_SIZE = 5;

/**
 * @class
 * @descriptor avonni-color-picker
 * @storyId example-color-picker--base
 * @public
 */
export default class AvonniColorPicker extends LightningElement {
    /**
     * Specifies a shortcut key to activate or focus an element.
     *
     * @public
     * @type {string}
     */
    @api accessKey;
    /**
     * Help text detailing the purpose and function of the input.
     *
     * @public
     * @type {string}
     */
    @api fieldLevelHelp;
    /**
     * Text label for the input.
     *
     * @public
     * @type {string}
     * @required
     */
    @api label;
    /**
     * The Lightning Design System name of the icon to use as a button icon, instead of the color dropdown. Names are written in the format 'standard:account' where 'standard' is the category, and 'account' is the specific icon to be displayed.
     *
     * @public
     * @type {string}
     */
    @api menuIconName;
    /**
     * Optional text to be shown on the button.
     *
     * @public
     * @type {string}
     */
    @api menuLabel;
    /**
     * Error message to be displayed when a bad input is detected.
     *
     * @type {string}
     * @public
     */
    @api messageWhenBadInput;
    /**
     * Error message to be displayed when the value is missing and input is required.
     *
     * @type {string}
     * @public
     */
    @api messageWhenValueMissing;

    _colors = DEFAULT_COLORS;
    _columns = DEFAULT_COLUMNS;
    _disabled = false;
    _groups = [];
    _hideColorInput = false;
    _isLoading = false;
    _menuAlignment = MENU_ALIGNMENTS.default;
    _menuNubbin = false;
    _menuIconSize = MENU_ICON_SIZES.default;
    _menuVariant = MENU_VARIANTS.default;
    _name;
    _opacity = false;
    _readOnly = false;
    _required = false;
    _tokens = [];
    _type = TYPES.default;
    _value;
    _variant = VARIANTS.default;

    _currentTab = DEFAULT_TAB;
    _draftToken = {};

    currentToken = {};
    dropdownOpened = false;
    dropdownVisible = false;
    helpMessage;
    newValue;
    showError = false;
    tabPressed = false;
    shiftPressed = false;
    isInsideMenu = false;
    denyBlurOnMenuButtonClick = false;

    _inputValue = '';
    _isConnected = false;
    _rendered = false;

    connectedCallback() {
        this.interactingState = new InteractingState();
        this.interactingState.onleave(() => this.showHelpMessageIfInvalid());
        this.computeToken();
        this._isConnected = true;
    }

    renderedCallback() {
        if (!this._rendered) {
            this.initSwatchColor();
            this._rendered = true;
        }

        const palette = this.template.querySelector(
            '[data-element-id^="avonni-color-palette"]'
        );
        if (this.dropdownVisible && palette) {
            const paletteWidth = palette.clientWidth;
            const tileWidth = Math.floor(paletteWidth / this.columns - 8);
            const tileSize =
                tileWidth > MINIMUM_TILE_SIZE ? tileWidth : MINIMUM_TILE_SIZE;
            palette.tileWidth = tileSize;
            palette.tileHeight = tileSize;
        }
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Array of colors displayed in the default palette. Each color can either be a string, or a color object. The color objects are used in conjunction with the groups attribute, to split the colors into different groups.
     *
     * @public
     * @type {string[]}
     * @default [“#e3abec”, “#c2dbf6”, ”#9fd6ff”, ”#9de7da”, ”#9df0bf”, ”#fff099”, ”#fed49a”, ”#d073df”, ”#86b9f3”, ”#5ebbff”, ”#44d8be”, ”#3be281”, ”#ffe654”, ”#ffb758”, ”#bd35bd”, ”#5778c1”, ”#5ebbff”, ”#00aea9”, ”#3bba4c”, ”#f4bc25”, ”#f99120”, ”#580d8c”, ”#001870”, ”#0a2399”, ”#097476”, ”#096a50”, ”#b67d11”, ”#b85d0d”]
     */
    @api
    get colors() {
        return this._colors;
    }

    set colors(value) {
        const colors = normalizeArray(value);
        this._colors = colors.length > 0 ? colors : DEFAULT_COLORS;
    }

    /**
     * Number of columns in the palette.
     *
     * @public
     * @type {number}
     * @default 7
     */
    @api
    get columns() {
        return this._columns;
    }

    set columns(value) {
        const normalizedValue = parseInt(value, 10);
        this._columns =
            !isNaN(normalizedValue) && normalizedValue
                ? parseInt(value, 10)
                : DEFAULT_COLUMNS;
    }

    /**
     * If present, the input field is disabled and users cannot interact with it.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = normalizeBoolean(value);
    }

    /**
     * Array of group objects. Groups can be used by the tokens and the predefined palette.
     *
     * @type {object[]}
     * @public
     */
    @api
    get groups() {
        return this._groups;
    }

    set groups(value) {
        this._groups = normalizeArray(value);
    }

    /**
     * If true, hide the input color value.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get hideColorInput() {
        return this._hideColorInput;
    }

    set hideColorInput(value) {
        this._hideColorInput = normalizeBoolean(value);
    }

    /**
     * If present, a spinner is displayed to indicate that data is loading.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get isLoading() {
        return this._isLoading;
    }

    set isLoading(value) {
        this._isLoading = normalizeBoolean(value);
    }

    /**
     * Determines the alignment of the menu relative to the button. Available options are: auto, left, center, right, bottom-left, bottom-center, bottom-right. The auto option aligns the dropdown menu based on available space.
     *
     * @public
     * @type {string}
     * @default left
     */
    @api
    get menuAlignment() {
        return this._menuAlignment;
    }

    set menuAlignment(value) {
        this._menuAlignment = normalizeString(value, {
            fallbackValue: MENU_ALIGNMENTS.default,
            validValues: MENU_ALIGNMENTS.valid
        });
    }

    /**
     * Size of the icon. Options include xx-small, x-small, small, medium, or large.
     *
     * @public
     * @type {string}
     * @default x-small
     */
    @api
    get menuIconSize() {
        return this._menuIconSize;
    }

    set menuIconSize(size) {
        this._menuIconSize = normalizeString(size, {
            fallbackValue: MENU_ICON_SIZES.default,
            validValues: MENU_ICON_SIZES.valid
        });
    }

    /**
     * If present, a nubbin is present on the menu. A nubbin is a stub that protrudes from the menu item towards the button menu. The nubbin position is based on the menu-alignment.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get menuNubbin() {
        return this._menuNubbin;
    }

    set menuNubbin(value) {
        this._menuNubbin = normalizeBoolean(value);
    }

    /**
     * The variant changes the look of the button. Accepted variants include bare, container, border, border-filled, bare-inverse, and border-inverse.
     *
     * @public
     * @type {string}
     * @default border
     */
    @api
    get menuVariant() {
        return this._menuVariant;
    }

    set menuVariant(variant) {
        this._menuVariant = normalizeString(variant, {
            fallbackValue: MENU_VARIANTS.default,
            validValues: MENU_VARIANTS.valid
        });
    }

    /**
     * Specifies the name of an input element.
     *
     * @public
     * @type {string}
     */
    @api
    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value ? value : generateUUID();
    }

    /**
     * If present, the alpha slider will be displayed.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get opacity() {
        return this._opacity;
    }

    set opacity(value) {
        this._opacity = normalizeBoolean(value);
    }

    /**
     * If present, the input field is read-only and cannot be edited by users.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get readOnly() {
        return this._readOnly;
    }

    set readOnly(value) {
        this._readOnly = normalizeBoolean(value);
    }

    /**
     * If present, the input field must be filled out before the form is submitted.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get required() {
        return this._required;
    }

    set required(value) {
        this._required = normalizeBoolean(value);
    }

    /**
     * Array of token objects.
     *
     * @public
     * @type {object[]}
     */
    @api
    get tokens() {
        return this._tokens;
    }

    set tokens(value) {
        this._tokens = normalizeArray(value);
        if (this.isConnected) this.computeToken();
    }

    /**
     * Type of the color picker. The base type uses tabs for all the other types.
     * Valid values include base, custom, predefined and tokens.
     *
     * @public
     * @type {string}
     * @default base
     */
    @api
    get type() {
        return this._type;
    }

    set type(type) {
        this._type = normalizeString(type, {
            fallbackValue: TYPES.default,
            validValues: TYPES.valid
        });
    }

    /**
     * Specifies the value of an input element.
     *
     * @public
     * @type {string}
     */
    @api
    get value() {
        return this._value;
    }

    set value(value) {
        if (value && typeof value === 'string') {
            this._value = value;
            this.inputValue = value;
            if (this._isConnected) this.computeToken();
        } else {
            this._value = null;
            this._inputValue = '';
            this.currentToken = {};
        }
        this.initSwatchColor();
    }

    /**
     * The variant changes the appearance of an input field. Accepted variants include standard, label-inline, label-hidden, and label-stacked. This value defaults to standard, which displays the label above the field. Use label-hidden to hide the label but make it available to assistive technology. Use label-inline to horizontally align the label and input field. Use label-stacked to place the label above the input field.
     *
     * @public
     * @type {string}
     * @default standard
     */
    @api
    get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: VARIANTS.default,
            validValues: VARIANTS.valid
        });
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Variant of the color palette.
     *
     * @type {string}
     * @default grid
     */
    get colorPaletteVariant() {
        return this._currentTab === 'tokens' || this.type === 'tokens'
            ? 'list'
            : 'grid';
    }

    /**
     * Tokens array or colors array, depending on the selected tab.
     *
     * @type {(object[]|string[])}
     */
    get computedColors() {
        return this._currentTab === 'tokens' || this.type === 'tokens'
            ? this.tokens
            : this.colors;
    }

    /**
     * Computed value for the gradient component. If the value is empty, the gradient is initialized with a white color.
     *
     * @type {string}
     * @default #fff
     */
    get computedGradientValue() {
        if (!this.value) return '#fff';
        if (this.currentToken.color) return this.currentToken.color;
        return this.value;
    }

    /**
     * True if the type is 'base'.
     *
     * @type {boolean}
     * @default true
     */
    get isBase() {
        return this.type === 'base';
    }

    /**
     * Computed icon class.
     *
     * @type {string}
     */
    get computedIconClass() {
        return this.menuLabel ? 'slds-m-left_xx-small' : '';
    }

    /**
     * Value of the color input.
     *
     * @type {string}
     */
    get inputValue() {
        return this.currentToken.label || this._inputValue;
    }

    set inputValue(val) {
        this._inputValue = val || '';
    }

    /**
     * True if the input field contains a value.
     *
     * @type {string}
     */
    get isInputFilled() {
        let input = this.template.querySelector('[data-element-id="input"]');
        if (input == null) {
            return this.inputValue;
        }
        return !!this.inputValue;
    }

    /**
     * True if the input value is color type.
     *
     * @type {boolean}
     */
    get hasBadInput() {
        return (
            !this.tokens.length &&
            !(
                colorType(this.inputValue) === 'hex' ||
                (colorType(this.inputValue) === 'hexa' && this.opacity)
            )
        );
    }

    /**
     * HTML element for the swatch.
     *
     * @type {HTMLElement}
     */
    get elementSwatch() {
        return this.template.querySelector('[data-element-id="swatch"]');
    }

    /**
     * HTML element for the color gradient.
     *
     * @type {HTMLElement}
     */
    get colorGradient() {
        return this.template.querySelector(
            '[data-element-id="avonni-color-gradient"]'
        );
    }

    /**
     * Compute Aria Expanded for dropdown.
     *
     * @type {string}
     * @return {String} from dropdownVisible
     */
    get computedAriaExpanded() {
        return String(this.dropdownVisible);
    }

    /**
     * Computed container class styling.
     *
     * @type {string}
     */
    get computedContainerClass() {
        return classSet()
            .add({
                'slds-form-element_stacked': this.variant === 'label-stacked',
                'slds-grid slds-grid_vertical-align-center':
                    this.variant === 'label-inline'
            })
            .toString();
    }

    /**
     * Computed Legend class styling.
     *
     * @type {string}
     */
    get computedLabelClass() {
        return classSet('slds-form-element__label slds-no-flex')
            .add({
                'slds-assistive-text': this.variant === 'label-hidden'
            })
            .toString();
    }

    /**
     * Computed Button class styling.
     *
     * @type {string}
     */
    get computedButtonClass() {
        const isDropdownIcon = !this.computedShowDownIcon;
        const isBare =
            this.menuVariant === 'bare' || this.menuVariant === 'bare-inverse';

        const classes = classSet(
            'slds-button avonni-color-picker__main-button'
        );

        const useMoreContainer =
            this.menuVariant === 'container' ||
            this.menuVariant === 'bare-inverse' ||
            this.menuVariant === 'border-inverse';

        if (this.menuLabel && !this.readOnly) {
            classes.add({
                'slds-button_neutral':
                    this.menuVariant === 'border' && isDropdownIcon,
                'slds-button_inverse': this.menuVariant === 'border-inverse'
            });
        } else if (!this.menuLabel && !this.readOnly) {
            classes.add({
                'slds-button_icon': !isDropdownIcon,
                'slds-button_icon-bare': isBare,
                'slds-button_icon-more': !useMoreContainer && !isDropdownIcon,
                'slds-button_icon-container-more':
                    useMoreContainer && !isDropdownIcon,
                'slds-button_icon-container':
                    this.menuVariant === 'container' && isDropdownIcon,
                'slds-button_icon-border':
                    this.menuVariant === 'border' && isDropdownIcon,
                'slds-button_icon-border-filled':
                    this.menuVariant === 'border-filled',
                'slds-button_icon-border-inverse':
                    this.menuVariant === 'border-inverse',
                'slds-button_icon-inverse': this.menuVariant === 'bare-inverse',
                'slds-button_icon-xx-small':
                    this.menuIconSize === 'xx-small' &&
                    !isBare &&
                    this.menuLabel,
                'slds-button_icon-x-small':
                    this.menuIconSize === 'x-small' &&
                    !isBare &&
                    this.menuLabel,
                'slds-button_icon-small':
                    this.menuIconSize === 'small' && !isBare && this.menuLabel,
                'slds-icon_large':
                    this.menuIconSize === 'large' && this.menuIconName
            });
        } else {
            classes.add({
                'slds-swatch-read-only': this.readOnly
            });
        }
        return classes.toString();
    }

    /**
     * Compute show down Icon.
     *
     * @type {boolean}
     */
    get computedShowDownIcon() {
        return !(
            this.menuIconName === 'utility:down' ||
            this.menuIconName === 'utility:chevrondown'
        );
    }

    /**
     * Computed dropdown menu classs styling.
     *
     * @type {string}
     */
    get computedDropdownClass() {
        return classSet(
            'slds-color-picker__selector slds-p-around_none slds-dropdown avonni-color-picker__dropdown'
        )
            .add({
                'slds-dropdown_left':
                    this.menuAlignment === 'left' || this.isAutoAlignment(),
                'slds-dropdown_center': this.menuAlignment === 'center',
                'slds-dropdown_right': this.menuAlignment === 'right',
                'slds-dropdown_bottom': this.menuAlignment === 'bottom-center',
                'slds-dropdown_bottom slds-dropdown_right slds-dropdown_bottom-right':
                    this.menuAlignment === 'bottom-right',
                'slds-dropdown_bottom slds-dropdown_left slds-dropdown_bottom-left':
                    this.menuAlignment === 'bottom-left',
                'slds-nubbin_top-left':
                    this.menuNubbin && this.menuAlignment === 'left',
                'slds-nubbin_top-right':
                    this.menuNubbin && this.menuAlignment === 'right',
                'slds-nubbin_top':
                    this.menuNubbin && this.menuAlignment === 'center',
                'slds-nubbin_bottom-left':
                    this.menuNubbin && this.menuAlignment === 'bottom-left',
                'slds-nubbin_bottom-right':
                    this.menuNubbin && this.menuAlignment === 'bottom-right',
                'slds-nubbin_bottom':
                    this.menuNubbin && this.menuAlignment === 'bottom-center',
                'slds-p-vertical_large': this.isLoading
            })
            .toString();
    }

    get computedTabBodyClass() {
        return classSet()
            .add({
                'slds-tabs_default__content': this.isBase
            })
            .toString();
    }

    get showColorGradient() {
        return this.type === 'custom' || this._currentTab === 'custom';
    }

    /**
     * Represents the validity states that an element can be in, with respect to constraint validation.
     *
     * @type {string}
     * @public
     */
    @api
    get validity() {
        return this._constraint.validity;
    }

    /**
     * Gets FieldConstraintApi.
     *
     * @type {object}
     */
    get _constraint() {
        if (!this._constraintApi) {
            this._constraintApi = new FieldConstraintApi(() => this, {
                valueMissing: () =>
                    !this.disabled && this.required && !this.value,
                badInput: () => this.inputValue && this.hasBadInput
            });
        }
        return this._constraintApi;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Checks if the input is valid.
     *
     * @returns {boolean} True if the element meets all constraint validations.
     * @public
     */
    @api
    checkValidity() {
        return this._constraint.checkValidity();
    }

    /**
     * Displays the error messages. If the input is valid, <code>reportValidity()</code> clears displayed error messages.
     *
     * @returns {boolean} False if invalid, true if valid.
     * @public
     */
    @api
    reportValidity() {
        return this._constraint.reportValidity((message) => {
            this.helpMessage = message;
        });
    }

    /**
     * Sets a custom error message to be displayed when a form is submitted.
     *
     * @param {string} message The string that describes the error. If message is an empty string, the error message is reset.
     * @public
     */
    @api
    setCustomValidity(message) {
        this._constraint.setCustomValidity(message);
    }

    /**
     * Displays error messages on invalid fields.
     * An invalid field fails at least one constraint validation and returns false when <code>checkValidity()</code> is called.
     *
     * @public
     */
    @api
    showHelpMessageIfInvalid() {
        this.reportValidity();
    }

    /**
     * Sets focus on the input element.
     *
     * @public
     */
    @api
    focus() {
        const input = this.template.querySelector('[data-element-id="input"]');
        if (input) input.focus();
    }

    /**
     * Removes keyboard focus from the input element.
     *
     * @public
     */
    @api
    blur() {
        const input = this.template.querySelector('[data-element-id="input"]');
        if (input) input.blur();
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Initialize swatch colors.
     */
    initSwatchColor() {
        if (this.elementSwatch) {
            const color = this.currentToken.color || this.value;
            this.elementSwatch.style.background = color;
        }
    }

    /**
     * Set the current token value and initialize the swatch colors.
     */
    computeToken() {
        const isToken =
            typeof this.value === 'string' && this.value.match(/^--.+/);
        if (isToken) {
            this.currentToken =
                this.tokens.find((tok) => tok.value === this.value) || {};
        } else {
            this.currentToken = {};
        }
        this.initSwatchColor();
    }

    /**
     * Button focus handler.
     */
    focusOnButton() {
        this.template.querySelector('[data-element-id="button"]').focus();
    }

    /**
     * Clear color picker input.
     */
    clearInput() {
        // eslint-disable-next-line @lwc/lwc/no-api-reassignments
        this.value = undefined;
        this.inputValue = '';
        this.currentToken = {};
        this._draftToken = {};
        this.focus();

        this.dispatchClear();
    }

    /**
     * Handle a change in the value. Temporarily save the value, in case the user cancels the change.
     *
     * @param {Event} event
     */
    handleChange(event) {
        event.stopPropagation();

        if (event.detail) {
            this.newValue =
                this.opacity && Number(event.detail.alpha) < 1
                    ? event.detail.hexa
                    : event.detail.hex;
            this._draftToken = {
                label: event.detail.label,
                value: event.detail.token
            };
        }
    }

    /**
     * Handle a change in the color palette. Save and close the popover right away.
     *
     * @param {Event} event
     */
    handleDefaultAndTokenChange(event) {
        this.handleChange(event);
        this.handleDone();
    }

    /**
     * Handle new value change and update ui.
     */
    handleDone() {
        if (!this.readOnly && this.newValue) {
            // eslint-disable-next-line @lwc/lwc/no-api-reassignments
            this.value = this.newValue;
            this.currentToken = { ...this._draftToken };
            this.newValue = null;

            if (!this.menuIconName) {
                this.elementSwatch.style.background = this.value;
            }
            if (this.colorGradient) {
                this.colorGradient.renderValue(this.value);
            }

            this.dispatchChange(generateColors(this.value));
        }

        this.toggleMenuVisibility();
    }

    /**
     * Handle new value canceled.
     */
    handleCancel() {
        this.newValue = null;

        if (this.colorGradient) {
            this.colorGradient.renderValue(this.value);
        }
        this.toggleMenuVisibility();
    }

    /**
     * Button click handler.
     */
    handleButtonClick() {
        this.denyBlurOnMenuButtonClick = false;
        if (!this.readOnly) {
            this.toggleMenuVisibility();
        }
    }

    /**
     * Button mousedown handler.
     */
    handleButtonMouseDown(event) {
        if (this.dropdownOpened) {
            let clickedElement = event.target;
            while (
                clickedElement !== null &&
                clickedElement.tagName !== 'BUTTON'
            ) {
                clickedElement = clickedElement.parentElement;
            }

            if (
                clickedElement !== null &&
                clickedElement.tagName === 'BUTTON'
            ) {
                this.denyBlurOnMenuButtonClick = true;
            }
        }
    }

    /**
     * Handles a mouseenter in the color picker.
     *
     * @param {Event} event
     */
    handleMenuMouseEnter() {
        this.isInsideMenu = true;
    }

    /**
     * Handles a blur of any element in the color picker.
     *
     * @param {Event} event
     */
    handleMenuBlur() {
        if (
            !this.isInsideMenu &&
            this.dropdownVisible &&
            !this.denyBlurOnMenuButtonClick &&
            !this.tabPressed
        ) {
            this.toggleMenuVisibility();
        }
    }

    /**
     * Handles a mouseleave from the color picker.
     *
     * @param {Event} event
     */
    handleMenuMouseLeave() {
        this.isInsideMenu = false;
    }

    /**
     * Handles a keydown inside the popover.
     *
     * @param {Event} event
     */
    handleMenuKeydown(event) {
        if (event.keyCode === 9) {
            this.tabPressed = true;
        } else if (event.keyCode === 16) {
            this.shiftPressed = true;
        } else if (event.keyCode === 27) {
            this.handleCancel();
        }
    }

    /**
     * Handles a keyup inside the popover.
     *
     * @param {Event} event
     */
    handleMenuKeyup(event) {
        if (event.keyCode === 9) {
            this.tabPressed = false;
        } else if (event.keyCode === 16) {
            this.shiftPressed = false;
        }
    }

    /**
     * Dropdown menu visibility toggle.
     */
    toggleMenuVisibility() {
        if (!this.disabled) {
            this.dropdownVisible = !this.dropdownVisible;
            requestAnimationFrame(() => {
                const tab = this.template.querySelector(
                    '[data-element-id="default"]'
                );

                if (tab) {
                    tab.focus();
                }
            });
            if (!this.dropdownOpened && this.dropdownVisible) {
                this.dropdownOpened = true;
            }

            if (this.dropdownVisible) {
                this._boundingRect = this.getBoundingClientRect();
                this.pollBoundingRect();
            }

            this.template
                .querySelector('[data-element-id="div-dropdown-trigger"]')
                .classList.toggle('slds-is-open');
        }
    }

    /**
     * Check if auto aligned.
     *
     * @returns {boolean}
     */
    isAutoAlignment() {
        return this.menuAlignment.startsWith('auto');
    }

    /**
     * Poll bounding rect of the dropdown menu.
     */
    pollBoundingRect() {
        if (this.isAutoAlignment() && this.dropdownVisible) {
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => {
                if (this._isConnected) {
                    observePosition(this, 300, this._boundingRect, () => {
                        this.close();
                    });

                    this.pollBoundingRect();
                }
            }, 250);
        }
    }

    /**
     * Tab click event handler.
     *
     * @param {Event} event
     */
    handleTabClick(event) {
        event.preventDefault();

        this.template
            .querySelectorAll('[data-group-name="tabs"]')
            .forEach((tab) => {
                const tabName = tab.dataset.tabName;
                const targetName = event.currentTarget.dataset.tabName;

                if (tabName === targetName) {
                    tab.parentElement.classList.add('slds-is-active');
                    this._currentTab = tabName;
                } else {
                    tab.parentElement.classList.remove('slds-is-active');
                }
            });

        const palette = this.template.querySelector(
            '[data-element-id="avonni-color-palette-default"]'
        );
        if (palette) palette.colors = [...this.computedColors];
    }

    /**
     * Input color event handler.
     *
     * @param {Event} event
     */
    handleInputColor(event) {
        let color = event.target.value;
        this.inputValue = color;

        if (
            colorType(color) === 'hex' ||
            (colorType(color) === 'hexa' && this.opacity)
        ) {
            if (!this.menuIconName) {
                this.elementSwatch.style.background = color;
            }
            // eslint-disable-next-line @lwc/lwc/no-api-reassignments
            this.value = color;

            if (this.colorGradient) {
                this.colorGradient.renderValue(color);
            }
            this.dispatchChange(generateColors(color));
        } else if (color === '') {
            this.clearInput();
        }
        event.stopPropagation();
    }

    /*-------- Public events --------*/

    /**
     * Focus event dispatcher.
     *
     */
    handleInputFocus() {
        this.interactingState.enter();
        /**
         * The event fired when the focus is set on the color picker input.
         *
         * @event
         * @name focus
         * @public
         */
        this.dispatchEvent(new CustomEvent('focus'));
    }

    /**
     * Blur event dispatcher.
     *
     */
    handleInputBlur() {
        this.interactingState.leave();
        /**
         * The event fired when the focus is removed from the color picker input.
         *
         * @event
         * @name blur
         * @public
         */
        this.dispatchEvent(new CustomEvent('blur'));
    }

    /**
     * Change event dispatcher.
     *
     * @param {object} colors
     */
    dispatchChange(colors) {
        if (!this.disabled && !this.readOnly) {
            /**
             * The event fired when the color value changed.
             *
             * @event
             * @public
             * @name change
             * @param {string} hex Color in hexadecimal format.
             * @param {string} hexa Color in hexadecimal format with alpha.
             * @param {string} rgb Color in rgb format.
             * @param {string} rgba Color in rgba format.
             * @param {string} alpha Alpha value of the color.
             * @param {string} token Token value.
             * @bubbles
             * @cancelable
             */
            this.dispatchEvent(
                new CustomEvent('change', {
                    detail: {
                        hex: colors.hex,
                        hexa: colors.hexa,
                        rgb: colors.rgb,
                        rgba: colors.rgba,
                        alpha: colors.alpha,
                        token: this.currentToken.value
                    },
                    bubbles: true,
                    cancelable: true
                })
            );
        }
    }

    /**
     * Dispatches an event when the input is cleared.
     *
     */
    dispatchClear() {
        this.dispatchChange({
            hex: undefined,
            hexa: undefined,
            rgb: undefined,
            rgba: undefined,
            alpha: undefined,
            token: undefined
        });
    }
}
