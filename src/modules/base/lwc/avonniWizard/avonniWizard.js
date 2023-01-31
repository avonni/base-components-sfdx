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
import { normalizeString, normalizeBoolean } from 'c/utilsPrivate';
import { classSet } from 'c/utils';
import BaseView from './avonniBase.html';
import ModalView from './avonniModal.html';
import CardView from './avonniCard.html';
import QuickActionPanelView from './avonniQuickActionPanel.html';

const VARIANTS = {
    valid: ['base', 'modal', 'card', 'quickActionPanel'],
    default: 'base'
};
const INDICATOR_POSITIONS = {
    valid: ['top', 'bottom', 'right', 'left'],
    default: 'bottom'
};

const INDICATOR_TYPES = {
    valid: ['base', 'base-shaded', 'path', 'bullet', 'fractions', 'bar'],
    default: 'base'
};

const BUTTON_VARIANTS = {
    valid: [
        'bare',
        'neutral',
        'brand',
        'brand-outline',
        'inverse',
        'destructive',
        'destructive-text',
        'success'
    ],
    defaultPreviousButton: 'neutral',
    defaultNextButton: 'neutral',
    defaultFinishButton: 'neutral'
};

const POSITIONS = {
    valid: ['left', 'right'],
    defaultPreviousButtonIcon: 'left',
    defaultNextButtonIcon: 'left',
    defaultFinishButtonIcon: 'left',
    defaultAction: 'left'
};

const DEFAULT_PREVIOUS_BUTTON_LABEL = 'Previous';
const DEFAULT_NEXT_BUTTON_LABEL = 'Next';
const DEFAULT_FINISH_BUTTON_LABEL = 'Finish';
const DEFAULT_FRACTION_PREFIX_LABEL = 'Step';
const DEFAULT_FRACTION_LABEL = 'of';

/**
 * @class
 * @descriptor avonni-wizard
 * @storyId example-wizard--base
 * @public
 */
export default class AvonniWizard extends LightningElement {
    /**
     * The name of an icon to display for the finish button.
     *
     * @type {string}
     * @public
     */
    @api finishButtonIconName;
    /**
     * The name of an icon to display for the next button.
     *
     * @type {string}
     * @public
     */
    @api nextButtonIconName;
    /**
     * The name of an icon to display for the previous button.
     *
     * @type {string}
     * @public
     */
    @api previousButtonIconName;

    _actionPosition = POSITIONS.defaultAction;
    _buttonAlignmentBump;
    _currentStep;
    _finishButtonIconPosition = POSITIONS.defaultFinishButtonIcon;
    _finishButtonLabel = DEFAULT_FINISH_BUTTON_LABEL;
    _finishButtonVariant = BUTTON_VARIANTS.defaultFinishButton;
    _fractionLabel = DEFAULT_FRACTION_LABEL;
    _fractionPrefixLabel = DEFAULT_FRACTION_PREFIX_LABEL;
    _hideIndicator = false;
    _hideNavigation = false;
    _indicatorPosition = INDICATOR_POSITIONS.default;
    _indicatorType = INDICATOR_TYPES.default;
    _initialCurrentStep;
    _nextButtonIconPosition = POSITIONS.defaultNextButtonIcon;
    _nextButtonLabel = DEFAULT_NEXT_BUTTON_LABEL;
    _nextButtonVariant = BUTTON_VARIANTS.defaultNextButton;
    _previousButtonIconPosition = POSITIONS.defaultPreviousButtonIcon;
    _previousButtonLabel = DEFAULT_PREVIOUS_BUTTON_LABEL;
    _previousButtonVariant = BUTTON_VARIANTS.defaultPreviousButton;
    _variant = VARIANTS.default;

    errorMessage;
    steps = [];
    showAction = true;
    showTitleSlot = true;
    showWizard = true;
    _showHeader = true;

    handleStepRegister(event) {
        event.stopPropagation();

        const step = event.detail;
        this.steps.push(step);

        this._initSteps();
    }

    connectedCallback() {
        if (this.variant === 'modal') this.hide();
    }

    renderedCallback() {
        if (this.steps.length > 0) {
            const navigations = this.template.querySelectorAll(
                '[data-element-id^="avonni-primitive-wizard-navigation"]'
            );
            navigations.forEach((nav) => {
                nav.steps = this.steps;
            });
        }

        if (this.actionSlot)
            this.showAction = this.actionSlot.assignedElements().length !== 0;

        if (this.titleSlot)
            this.showTitleSlot = this.titleSlot.assignedElements().length !== 0;

        this._showHeader = this.title || this.showTitleSlot || this.iconName;
    }

    /**
     * Get action slot dom element.
     *
     * @type {Element}
     */
    get actionSlot() {
        return this.template.querySelector('slot[name=action]');
    }

    /**
     * Get ttitle slot dom element.
     *
     * @type {Element}
     */
    get titleSlot() {
        return this.template.querySelector('slot[name=title]');
    }

    render() {
        switch (this.variant) {
            case 'modal':
                return ModalView;
            case 'card':
                return CardView;
            case 'quickActionPanel':
                return QuickActionPanelView;
            default:
                return BaseView;
        }
    }

    /**
     * Initialize steps.
     */
    _initSteps() {
        // Make sure all steps have a name
        this.steps.forEach((step, index) => {
            step.name = step.name || `step-${index}`;
        });

        // If no current step was given, set current step to first step
        const stepNames = this.steps.map((step) => step.name);
        const index = stepNames.indexOf(this._initialCurrentStep);
        this._currentStep =
            index === -1 ? this.steps[0].name : this.steps[index].name;

        this._updateStepDisplay();
    }

    /**
     * Update step display visibility.
     */
    _updateStepDisplay() {
        this.steps.forEach((step) => {
            step.callbacks.setClass('slds-hide');
        });
        this.steps[this.currentStepIndex].callbacks.setClass(undefined);
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Position of the actions. Valid values include left and right.
     *
     * @type {string}
     * @public
     * @default left
     */
    @api
    get actionPosition() {
        return this._actionPosition;
    }
    set actionPosition(position) {
        this._actionPosition = normalizeString(position, {
            fallbackValue: POSITIONS.defaultAction,
            validValues: POSITIONS.valid
        });
    }

    /**
     * Bump to apply to the buttons. Valid values include left and right.
     *
     * @type {string}
     * @public
     */
    @api
    get buttonAlignmentBump() {
        return this._buttonAlignmentBump;
    }
    set buttonAlignmentBump(position) {
        this._buttonAlignmentBump = normalizeString(position, {
            fallbackValue: null,
            validValues: POSITIONS.valid
        });
    }

    /**
     * Set current-step to match the value attribute of one of wizard-step components. If current-step is not provided, the value of the first wizard-step component is used.
     *
     * @type {string}
     * @public
     * @default base
     */
    @api
    get currentStep() {
        return this._currentStep;
    }
    set currentStep(name) {
        this._currentStep = (typeof name === 'string' && name.trim()) || '';
        this._initialCurrentStep = this._currentStep;
    }

    /**
     * Describes the position of the icon with respect to body. Options include left and right.
     *
     * @type {string}
     * @public
     * @default left
     */
    @api
    get finishButtonIconPosition() {
        return this._finishButtonIconPosition;
    }
    set finishButtonIconPosition(position) {
        this._finishButtonIconPosition = normalizeString(position, {
            fallbackValue: POSITIONS.defaultfinishButtonIcon,
            validValues: POSITIONS.valid
        });
    }

    /**
     * Label for the finish button.
     *
     * @type {string}
     * @public
     * @default Finish
     */
    @api
    get finishButtonLabel() {
        return this._finishButtonLabel;
    }
    set finishButtonLabel(label) {
        this._finishButtonLabel =
            (typeof label === 'string' && label.trim()) ||
            DEFAULT_FINISH_BUTTON_LABEL;
    }

    /**
     * Change the appearance of the finish button. Valid values include bare, neutral, brand, brand-outline, inverse, destructive, destructive-text, success.
     *
     * @type {string}
     * @public
     * @default neutral
     */
    @api
    get finishButtonVariant() {
        return this._finishButtonVariant;
    }
    set finishButtonVariant(variant) {
        this._finishButtonVariant = normalizeString(variant, {
            fallbackValue: BUTTON_VARIANTS.defaultfinishButton,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    /**
     * Label displayed between the current index and the maximum number of slides. For example, if "of" is used, the indicator would display "1 of 3". Only used by the fractions indicator type.
     *
     * @type {string}
     * @public
     * @default of
     */
    @api
    get fractionLabel() {
        return this._fractionLabel;
    }
    set fractionLabel(label) {
        this._fractionLabel =
            (typeof label === 'string' && label.trim()) ||
            DEFAULT_FRACTION_LABEL;
    }

    /**
     * Label displayed before the fraction indicator. For example, if "Page" is used, the indicator would display "Page 1 of 3". Only used by the fractions indicator type.
     *
     * @type {string}
     * @public
     * @default step
     */
    @api
    get fractionPrefixLabel() {
        return this._fractionPrefixLabel;
    }
    set fractionPrefixLabel(prefix) {
        this._fractionPrefixLabel =
            (typeof prefix === 'string' && prefix.trim()) ||
            DEFAULT_FRACTION_PREFIX_LABEL;
    }

    /**
     * If present, hide the indicator.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get hideIndicator() {
        return this._hideIndicator;
    }
    set hideIndicator(value) {
        this._hideIndicator = normalizeBoolean(value);
    }

    /**
     * If true, hide the navigation (buttons and indicator).
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get hideNavigation() {
        return this._hideNavigation;
    }
    set hideNavigation(boolean) {
        this._hideNavigation = normalizeBoolean(boolean);
    }

    /**
     * The Lightning Design System name of the icon. Specify the name in the format 'utility:down' where 'utility' is the category, and 'down' is the specific icon to be displayed. The icon is displayed in the header before the title.
     *
     * @type {string}
     * @public
     */
    @api
    get iconName() {
        return this._iconName;
    }

    set iconName(value) {
        this._iconName = value;
        this._showHeader = value || this.title || this.titleSlot;
    }

    /**
     * Changes the indicator position. Valid values are top, bottom, left and right.
     *
     * @type {string}
     * @public
     * @default bottom
     */
    @api
    get indicatorPosition() {
        return this._indicatorPosition;
    }
    set indicatorPosition(position) {
        this._indicatorPosition = normalizeString(position, {
            fallbackValue: INDICATOR_POSITIONS.default,
            validValues: INDICATOR_POSITIONS.valid
        });
    }

    /**
     * Changes the visual pattern of the indicator. Valid values are base, base-shaded, path, bullet, fractions and bar.
     * NB: If the available space is smaller than 480px, the indicator type will always be `bar`.
     *
     * @type {string}
     * @public
     * @default base
     */
    @api
    get indicatorType() {
        return this._indicatorType;
    }
    set indicatorType(type) {
        this._indicatorType = normalizeString(type, {
            fallbackValue: INDICATOR_TYPES.default,
            validValues: INDICATOR_TYPES.valid
        });
    }

    /**
     * Position of the icon with respect to body. Options include left and right.
     *
     * @type {string}
     * @public
     * @default left
     */
    @api
    get nextButtonIconPosition() {
        return this._nextButtonIconPosition;
    }
    set nextButtonIconPosition(position) {
        this._nextButtonIconPosition = normalizeString(position, {
            fallbackValue: POSITIONS.defaultnextButtonIcon,
            validValues: POSITIONS.valid
        });
    }

    /**
     * Label for the next button.
     *
     * @type {string}
     * @public
     * @default Next
     */
    @api
    get nextButtonLabel() {
        return this._nextButtonLabel;
    }
    set nextButtonLabel(label) {
        this._nextButtonLabel =
            (typeof label === 'string' && label.trim()) ||
            DEFAULT_NEXT_BUTTON_LABEL;
    }

    /**
     * Changes the appearance of the next button. Valid values include bare, neutral, brand, brand-outline, inverse, destructive, destructive-text and success.
     *
     * @type {string}
     * @public
     * @default neutral
     */
    @api
    get nextButtonVariant() {
        return this._nextButtonVariant;
    }
    set nextButtonVariant(variant) {
        this._nextButtonVariant = normalizeString(variant, {
            fallbackValue: BUTTON_VARIANTS.defaultnextButton,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    /**
     * Position of the icon with respect to the body. Options include left and right.
     *
     * @type {string}
     * @public
     * @default left
     */
    @api
    get previousButtonIconPosition() {
        return this._previousButtonIconPosition;
    }
    set previousButtonIconPosition(value) {
        this._previousButtonIconPosition = normalizeString(value, {
            fallbackValue: POSITIONS.defaultpreviousButtonIcon,
            validValues: POSITIONS.valid
        });
    }

    /**
     * Label for the previous button.
     *
     * @type {string}
     * @public
     * @default Previous
     */
    @api
    get previousButtonLabel() {
        return this._previousButtonLabel;
    }
    set previousButtonLabel(label) {
        this._previousButtonLabel =
            (typeof label === 'string' && label.trim()) ||
            DEFAULT_PREVIOUS_BUTTON_LABEL;
    }

    /**
     * Changes the appearance of the previous button. Valid values include bare, neutral, brand, brand-outline, inverse, destructive, destructive-text and success.
     *
     * @type {string}
     * @public
     * @default neutral
     */
    @api
    get previousButtonVariant() {
        return this._previousButtonVariant;
    }
    set previousButtonVariant(value) {
        this._previousButtonVariant = normalizeString(value, {
            fallbackValue: BUTTON_VARIANTS.defaultpreviousButton,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    /**
     * Title of the wizard, displayed in the header.
     * To include additional markup or another component, use the title slot.
     *
     * @type {string}
     * @public
     */
    @api
    get title() {
        return this._title;
    }
    set title(value) {
        this._title = value;
        this._showHeader = this.title || this.iconName || this.titleSlot;
    }

    /**
     * Variant of the wizard. Valid values include base, modal, quickActionPanel and card.
     *
     * @type {string}
     * @public
     * @default base
     */
    @api
    get variant() {
        return this._variant;
    }
    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: VARIANTS.default,
            validValues: VARIANTS.valid,
            toLowerCase: false
        });
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */
    get currentStepHasError() {
        return normalizeBoolean(this.errorMessage);
    }

    /**
     * Get index of the current step.
     *
     * @type {number}
     */
    get currentStepIndex() {
        const stepNames = this.steps.map((step) => step.name);
        return stepNames.indexOf(this.currentStep);
    }

    /**
     * Verify if indicator is visible top.
     *
     * @type {boolean}
     */
    get indicatorInHeader() {
        return !this.hideIndicator && this.indicatorPosition === 'top';
    }

    /**
     * Verify if indicator is visible and left or right.
     *
     * @type {boolean}
     */
    get indicatorOnSide() {
        return (
            !this.hideIndicator &&
            !this.hideNavigation &&
            (this.indicatorPosition === 'left' ||
                this.indicatorPosition === 'right')
        );
    }

    /**
     * Computed wrapper class styling.
     *
     * @type {string}
     */
    get wrapperClass() {
        return classSet().add({
            'slds-p-around_medium slds-modal__content':
                this.variant === 'quickActionPanel',
            'slds-grid slds-gutters slds-has-flexi-truncate slds-grid_vertical-stretch':
                this.indicatorPosition === 'right' ||
                this.indicatorPosition === 'left'
        });
    }

    /**
     * Computed main column class styling.
     *
     * @type {string}
     */
    get mainColClass() {
        return classSet('main-col').add({
            'avonni-wizard__flex-col':
                this.indicatorPosition === 'right' ||
                this.indicatorPosition === 'left',
            'slds-order_2': this.indicatorPosition === 'left'
        });
    }

    /**
     * Computed side column class styling.
     *
     * @type {string}
     */
    get sideColClass() {
        return classSet('slds-container_small side-col').add({
            'slds-align-bottom': this.indicatorType === 'fractions',
            'slds-p-right_medium': this.indicatorPosition === 'right',
            'slds-p-left_medium': this.indicatorPosition === 'left',
            'slds-p-bottom_medium':
                this.variant === 'base' && !this.indicatorType === 'fractions',
            'slds-p-bottom_large':
                this.variant === 'base' && this.indicatorType === 'fractions'
        });
    }

    /**
     * Returns true if there is a title, a title slot or a iconName.
     *
     * @type {boolean}
     */
    get showHeader() {
        return this._showHeader;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Display the wizard.
     *
     * @public
     */
    @api
    show() {
        this.showWizard = true;
    }

    /**
     * Hide the wizard.
     *
     * @public
     */
    @api
    hide() {
        this.showWizard = false;
        this.steps = [];
    }

    /**
     * Go to the next step of the wizard.
     *
     * @public
     */
    @api
    next() {
        const oldStep = this.currentStep;
        this._currentStep = this.steps[this.currentStepIndex + 1].name;

        /**
         * The event fired when the wizard advances or goes back following the configured step flow. An external change by setting the attribute current-step does not emit this event.
         *
         * @event
         * @name change
         * @param {string} currentStep The step name the wizard is moving to.
         * @param {string} oldStep The step name the wizard is moving from.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    currentStep: this.currentStep,
                    oldStep: oldStep
                }
            })
        );

        this._updateStepDisplay();
    }

    /**
     * Go to the previous step of the wizard.
     *
     * @public
     */
    @api
    previous() {
        const oldStep = this.currentStep;
        this._currentStep = this.steps[this.currentStepIndex - 1].name;

        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    currentStep: this.currentStep,
                    oldStep: oldStep
                }
            })
        );

        this._updateStepDisplay();
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * State of step before change.
     *
     * @param {object} step
     * @returns {boolean}
     */
    beforeChange(step) {
        return new Promise((resolve) => {
            if (!step.callbacks.beforeChange) {
                return resolve(true);
            }

            return resolve(step.callbacks.beforeChange());
        });
    }

    /**
     * Change event handler.
     *
     * @param {Event} event
     */
    async handleChange(event) {
        this.errorMessage = undefined;

        // Execute beforeChange function set on the step
        // If the function returns false, the change does not happen
        const hasError = !(await this.beforeChange(
            this.steps[this.currentStepIndex]
        ));
        if (hasError) {
            this.errorMessage =
                this.steps[this.currentStepIndex].beforeChangeErrorMessage;
            return;
        }

        const action = event.detail.action;

        switch (action) {
            case 'finish':
                /**
                 * The event fired when the wizard finishes and the user clicks on Finish button.
                 *
                 * @event
                 * @name complete
                 * @public
                 */
                this.dispatchEvent(new CustomEvent('complete'));
                break;
            case 'previous':
                this.previous();
                break;
            case 'next':
                this.next();
                break;
            default:
                break;
        }
    }

    /**
     * Close dialog handler.
     */
    handleCloseDialog() {
        this.hide();
    }
}
