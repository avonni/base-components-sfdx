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

import { LightningElement, api, track } from 'lwc';
import {
    normalizeBoolean,
    normalizeString,
    normalizeArray
} from 'c/utilsPrivate';
import { classSet } from 'c/utils';
import { Tooltip } from 'c/tooltipLibrary';

const PATH_FORMATS = {
    valid: ['linear', 'non-linear'],
    default: 'linear'
};

const ICON_POSITIONS = {
    valid: ['left', 'right'],
    default: 'left'
};

const DEFAULT_KEYFIELDS_LABEL = 'Key Fields';
const DEFAULT_GUIDANCE_LABEL = 'Guidance for Success';
const DEFAULT_NEXT_BUTTON_LABEL = 'Mark as Complete';
const DEFAULT_SELECT_BUTTON_LABEL = 'Mark as Current Stage';
const DEFAULT_CHANGE_COMPLETION_OPTION_LABEL = 'Change Completion Status';
const DEFAULT_COMPLETED_OPTION = 'base';

const CONFETTI_FREQUENCY = {
    valid: [
        {
            label: 'rarely',
            value: 0.25
        },
        {
            label: 'sometimes',
            value: 0.5
        },
        {
            label: 'often',
            value: 0.75
        },
        {
            label: 'always',
            value: 1
        }
    ],
    default: {
        label: 'sometimes',
        value: 0.5
    }
};

/**
 * @class
 * @descriptor avonni-path
 * @storyId example-path--base
 * @public
 */
export default class AvonniPath extends LightningElement {
    /**
     * The Lightning Design System name of the icon used for the path update button.
     * Specify the name in the format 'utility:down' where 'utility' is the category, and 'down' is the specific icon to be displayed.
     *
     * @type {string}
     * @public
     */
    @api nextButtonIconName;
    /**
     * The Lightning Design System name of the icon used for the path update button. Specify the name in the format 'utility:down' where 'utility' is the category, and 'down' is the specific icon to be displayed.
     *
     * @type {string}
     * @public
     * @default Mark as Current Stage
     */
    @api selectButtonIconName;

    _actions = [];
    _changeCompletionStatusLabel = DEFAULT_CHANGE_COMPLETION_OPTION_LABEL;
    _currentStep;
    _disabled = false;
    _format = PATH_FORMATS.default;
    _guidanceLabel = DEFAULT_GUIDANCE_LABEL;
    _hideButtons = false;
    _hideCoaching = false;
    _keyFieldsLabel = DEFAULT_KEYFIELDS_LABEL;
    _nextButtonIconPosition = ICON_POSITIONS.default;
    _nextButtonLabel = DEFAULT_NEXT_BUTTON_LABEL;
    _selectButtonIconPosition = ICON_POSITIONS.default;
    _selectButtonLabel = DEFAULT_SELECT_BUTTON_LABEL;
    @track _steps = [];

    _status = DEFAULT_COMPLETED_OPTION;
    _activeStep;
    _candidateStep;
    _isConnected = false;
    coachingIsVisible = false;
    computedCurrentStep;
    completedOptions;
    showDialog;

    connectedCallback() {
        this.initSteps();
        this.initCurrentStep(this.currentStep);
        this._isConnected = true;
    }

    renderedCallback() {
        this.initTooltips();
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Array of action objects, used as default step actions.
     *
     * @type {object[]}
     * @public
     */
    @api
    get actions() {
        return this._actions;
    }
    set actions(value) {
        this._actions = normalizeArray(value);

        if (this.isConnected) this.initSteps();
    }

    /**
     * Label of the menu item that appears when the previous step had completed options.
     * On click on the menu item, the dialog will reopen, and the user will be able to change the completion status.
     *
     * @type {string}
     * @public
     * @default Change Completion Status
     */
    @api
    get changeCompletionStatusLabel() {
        return this._changeCompletionStatusLabel;
    }
    set changeCompletionStatusLabel(value) {
        this._changeCompletionStatusLabel =
            typeof value === 'string'
                ? value.trim()
                : DEFAULT_CHANGE_COMPLETION_OPTION_LABEL;
    }

    /**
     * Name of the current step.
     *
     * @type {string}
     * @public
     */
    @api
    get currentStep() {
        return this._currentStep;
    }
    set currentStep(value) {
        if (typeof value === 'string') {
            this._currentStep = value;

            if (this._isConnected) this.initCurrentStep(this.currentStep);
        }
    }

    /**
     * If present, the path is disabled.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get disabled() {
        return this._disabled;
    }
    set disabled(bool) {
        this._disabled = normalizeBoolean(bool);
    }

    /**
     * Sets the progression format of the path. Valid values include linear and non-linear.
     *
     * @type {string}
     * @public
     * @default linear
     */
    @api
    get format() {
        return this._format;
    }
    set format(value) {
        this._format = normalizeString(value, {
            fallbackValue: PATH_FORMATS.default,
            validValues: PATH_FORMATS.valid
        });
    }

    /**
     * Label of the guidance section.
     *
     * @type {string}
     * @public
     * @default Guidance for Success
     */
    @api
    get guidanceLabel() {
        return this._guidanceLabel;
    }
    set guidanceLabel(value) {
        this._guidanceLabel =
            typeof value === 'string' ? value.trim() : DEFAULT_GUIDANCE_LABEL;
    }

    /**
     * If present, the path buttons will be hidden.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get hideButtons() {
        return this._hideButtons;
    }
    set hideButtons(bool) {
        this._hideButtons = normalizeBoolean(bool);
    }

    /**
     * If present, the coaching section will be hidden.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get hideCoaching() {
        return this._hideCoaching;
    }
    set hideCoaching(bool) {
        this._hideCoaching = normalizeBoolean(bool);
    }

    /**
     * Label of the key fields section.
     *
     * @type {string}
     * @public
     * @default Key Fields
     */
    @api
    get keyFieldsLabel() {
        return this._keyFieldsLabel;
    }
    set keyFieldsLabel(value) {
        this._keyFieldsLabel =
            typeof value === 'string' ? value.trim() : DEFAULT_KEYFIELDS_LABEL;
    }

    /**
     * Position of the next button. Valid values include left and right.
     *
     * @type {string}
     * @public
     * @default left
     */
    @api
    get nextButtonIconPosition() {
        return this._nextButtonIconPosition;
    }
    set nextButtonIconPosition(value) {
        this._nextButtonIconPosition = normalizeString(value, {
            fallbackValue: ICON_POSITIONS.default,
            validValues: ICON_POSITIONS.valid
        });
    }

    /**
     * Default label of the path button. On click on the button, the path will go to the next step.
     *
     * @type {string}
     * @public
     * @default Mark as Complete
     */
    @api
    get nextButtonLabel() {
        return this._nextButtonLabel;
    }
    set nextButtonLabel(value) {
        this._nextButtonLabel =
            typeof value === 'string'
                ? value.trim()
                : DEFAULT_NEXT_BUTTON_LABEL;
    }

    /**
     * Position of the select button. Valid values include left and right.
     *
     * @type {string}
     * @public
     * @default left
     */
    @api
    get selectButtonIconPosition() {
        return this._selectButtonIconPosition;
    }
    set selectButtonIconPosition(value) {
        this._selectButtonIconPosition = normalizeString(value, {
            fallbackValue: ICON_POSITIONS.default,
            validValues: ICON_POSITIONS.valid
        });
    }

    /**
     * Label of the path button, when the user clicked on a different step than the current one. On click on the button, the selected step will become the current step.
     *
     * @type {string}
     * @public
     * @default Mark as Current Stage
     */
    @api
    get selectButtonLabel() {
        return this._selectButtonLabel;
    }
    set selectButtonLabel(value) {
        this._selectButtonLabel =
            typeof value === 'string'
                ? value.trim()
                : DEFAULT_SELECT_BUTTON_LABEL;
    }

    /**
     * Array of step objects.
     *
     * @type {object[]}
     * @public
     * @required
     */
    @api
    get steps() {
        return this._steps;
    }
    set steps(proxy) {
        const array = normalizeArray(proxy);
        this._steps = JSON.parse(JSON.stringify(array));

        if (this._isConnected) {
            this.initSteps();
            this.initCurrentStep(this.currentStep);
        }
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Toggle to display Coaching icon.
     *
     * @type {string}
     */
    get toggleCoachingIcon() {
        return this.coachingIsVisible
            ? 'utility:chevrondown'
            : 'utility:chevronright';
    }

    /**
     * Name string of the last step.
     *
     * @type {string}
     */
    get lastStepName() {
        return this.steps[this.steps.length - 1].name;
    }

    /**
     * Check if the last Step is the current step.
     *
     * @type {string}
     */
    get lastStepIsCurrent() {
        return this.lastStepName === this.currentStep;
    }

    /**
     * Verify if the current step is also the active step.
     *
     * @type {boolean}
     */
    get currentStepIsActive() {
        return this._activeStep && this._activeStep.name === this.currentStep;
    }

    /**
     * Upon fulfilling completed options show the Change Completion Status button.
     *
     * @type {boolean}
     */
    get showChangeCompletionStatusButton() {
        const previousStep = this.steps[this.currentStepIndex - 1];
        return (
            previousStep &&
            previousStep.completedOptions &&
            previousStep.completedOptions.length > 1
        );
    }

    /**
     * Display the Select button when active step and is not the current step.
     *
     * @type {boolean}
     */
    get showSelectButton() {
        return this._activeStep && !this.currentStepIsActive;
    }

    /**
     * Display next button when not at end of steps and the current step is the active one.
     *
     * @type {boolean}
     */
    get showNextButton() {
        return (
            !this.lastStepIsCurrent &&
            (!this._activeStep || this.currentStepIsActive)
        );
    }

    /**
     * Find current Step index
     *
     * @type {number}
     */
    get currentStepIndex() {
        return this.steps.findIndex((step) => step.name === this.currentStep);
    }

    /**
     * Computed path class based on attribute selections.
     *
     * @type {string}
     */
    get pathClass() {
        const isComplete = this.currentStepIndex === this.steps.length - 1;
        const isLinear = this.format === 'linear';

        return classSet('slds-path slds-path_has-coaching')
            .add({
                'slds-is-expanded': this.coachingIsVisible,
                'slds-is-won':
                    this._status === 'success' && (isComplete || !isLinear),
                'slds-is-lost':
                    this._status === 'error' && (isComplete || !isLinear),
                'path-is-complete': isComplete || !isLinear,
                'path-is-complete_warning':
                    this._status === 'warning' && (isComplete || !isLinear),
                'path-is-complete_offline':
                    this._status === 'offline' && (isComplete || !isLinear),
                'path-is-complete_base':
                    this._status === 'base' && (isComplete || !isLinear)
            })
            .toString();
    }

    /**
     * Return label for Stage Title based on active step or computed Current step.
     *
     * @type {string}
     */
    get stageTitle() {
        return this._activeStep
            ? this._activeStep.label
            : this.computedCurrentStep.label;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Display the next step of the path.
     *
     * @public
     */
    @api
    next() {
        const toIndex = this.currentStepIndex + 1;

        if (toIndex <= this.steps.length - 1) {
            this.computeMovement({ toIndex });
        }
    }

    /**
     * Display the previous step of the path.
     *
     * @public
     */
    @api
    previous() {
        const toIndex = this.currentStepIndex - 1;

        if (toIndex >= 0) {
            this.computeMovement({ toIndex });
        }
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Initialize steps properties. ( keyFields, actions, tooltip )
     */
    initSteps() {
        this.steps.forEach((step) => {
            step.keyFields = normalizeArray(step.keyFields);
            step.actions = normalizeArray(step.actions);

            if (!step.hideDefaultActions) {
                step.actions = step.actions.concat(this.actions);
            }

            if (step.tooltip) {
                const tooltip = new Tooltip(step.tooltip, {
                    root: this,
                    target: () =>
                        this.template.querySelector(
                            `a[data-step-name=${step.name}]`
                        ),
                    align: { horizontal: 'center' },
                    targetAlign: { horizontal: 'center' }
                });
                step.tooltip = tooltip;
            }
        });
    }

    /**
     * Initialize Current step.
     *
     * @param {string} name
     */
    initCurrentStep(name) {
        const currentStep = this.getStepFromName(name);

        if (currentStep) {
            this._currentStep = name;
            this.computedCurrentStep = currentStep;
            this._activeStep = currentStep;
        } else {
            // Sets current step to first step
            this._currentStep = this.steps[0].name;
            this.computedCurrentStep = this.steps[0];
            this._activeStep = this.steps[0];
        }

        this.updateStepsStatus();
    }

    /**
     * Initialize the tooltips parameters.
     */
    initTooltips() {
        this.steps.forEach((step) => {
            if (step.tooltip) {
                step.tooltip.initialize();
            }
        });
    }

    /**
     * Compute path step movement.
     *
     * @param {object} param0 toIndex, toName
     */
    computeMovement({ toIndex, toName }) {
        const toStep = toName
            ? this.getStepFromName(toName)
            : this.steps[toIndex];

        // The completed options come from the step just before the step we are moving to
        const i =
            toIndex || this.steps.findIndex((step) => step.name === toName);
        const options = this.steps[i - 1] && this.steps[i - 1].completedOptions;

        // If there are many completed options, open the dialog
        if (options && options.length > 1) {
            this._candidateStep = toStep;
            this.completedOptions = options;
            this.showDialog = true;
        } else {
            // If there is only one completed option,
            // the new status of the path will be its variant.
            if (options && options.length === 1) {
                this._status = options[0].variant;
                this._completedOptionValue = options[0].value;
            } else {
                // If there is no completed option, the default is used
                this._status = DEFAULT_COMPLETED_OPTION;
                this._completedOptionValue = undefined;
            }

            const fromName = this.currentStep;
            this.moveToStep(toStep.name);
            this.dispatchChange(fromName);
        }
    }

    /**
     * Move the current step to the selected step name.
     *
     * @param {string} name
     */
    moveToStep(name) {
        this._currentStep = name;
        this.computedCurrentStep = this.getStepFromName(name);
        this._activeStep = undefined;
        this.updateStepsStatus();
        this.fireConfetti();
    }

    /**
     * Retrieve step name
     *
     * @param {string} name
     * @returns {string} step.name
     */
    getStepFromName(name) {
        return this.steps.find((step) => step.name === name);
    }

    /**
     * For each step status update method. Assign path step styling and class based on current attributes.
     */
    updateStepsStatus() {
        const base = this._status === 'base';
        const success = this._status === 'success';
        const error = this._status === 'error';
        const warning = this._status === 'warning';
        const offline = this._status === 'offline';
        const linear = this.format === 'linear';

        if (!this._activeStep) this._activeStep = this.computedCurrentStep;

        let currentStepPassed = false;

        this.steps.forEach((step, index) => {
            const isCurrentStep = (step.isCurrentStep =
                step.name === this.currentStep);
            if (linear && isCurrentStep) {
                currentStepPassed = true;
            }

            const isActive = this._activeStep.name === step.name;
            const isComplete = (step.isComplete = linear && !currentStepPassed);
            const isLast = index === this.steps.length - 1;
            const isError = error && isComplete && !isActive;
            const isWarning = warning && isComplete && !isActive;
            const isOffline = offline && isComplete && !isActive;

            step.class = classSet('slds-path__item')
                .add({
                    'slds-is-complete': isComplete && success,
                    'slds-is-current': isCurrentStep,
                    'slds-is-incomplete':
                        !isCurrentStep && (base || !isComplete),
                    'slds-is-active': isActive,
                    path__item_error: isError,
                    path__item_warning: isWarning,
                    path__item_offline: isOffline,
                    path__item: isError || isWarning || isOffline,
                    'path__item-last':
                        (isLast && linear) || (isCurrentStep && !linear)
                })
                .toString();

            if (isWarning || isError) {
                step.iconName = `utility:${this._status}`;
            } else if (isOffline) {
                step.iconName = 'utility:routing_offline';
            } else {
                step.iconName = 'utility:check';
            }
        });
    }

    /**
     * Hide dialog in case step is not defined.
     */
    hideDialog() {
        this._candidateStep = undefined;
        this.showDialog = false;
    }

    /**
     * Fire confetti method based on showConfetti attribute and previousStep completion.
     */
    fireConfetti() {
        const previousStep = this.steps[this.currentStepIndex - 1];
        const showConfetti = previousStep && previousStep.showConfetti;

        if (showConfetti) {
            const stepFrequency = CONFETTI_FREQUENCY.valid.find((frequency) => {
                return frequency.label === previousStep.confettiFrequency;
            });
            const frequency = stepFrequency
                ? stepFrequency.value
                : CONFETTI_FREQUENCY.default.value;
            const randomConfetti = Math.random() < frequency;
            if (randomConfetti) {
                this.template.querySelector('.path__confetti').fire();
            }
        }
    }

    /**
     * Save the value of current dialog handler.
     */
    handleSaveDialog() {
        this._completedOptionValue =
            this.template.querySelector('lightning-combobox').value;
        if (!this._completedOptionValue) return;

        // Get the new path status (base, success, etc.)
        const selectedOption = this.completedOptions.find(
            (option) => option.value === this._completedOptionValue
        );
        this._status = selectedOption.variant;

        // Save the current step to dispatch it later
        const previousStep = this.currentStep;

        // Go to new step
        this.moveToStep(this._candidateStep.name);
        this.hideDialog();
        this.dispatchChange(previousStep);
    }

    /**
     * Change completion status Handler.
     */
    handleChangeCompletionStatus() {
        const previousStep = this.steps[this.currentStepIndex - 1];
        this.completedOptions = previousStep.completedOptions;
        this._candidateStep = this.computedCurrentStep;
        this.showDialog = true;
    }

    /**
     * Click on step handler.
     *
     * @param {Event} event
     */
    handlePathStepClick(event) {
        event.preventDefault();

        if (!this.disabled) {
            const name = event.currentTarget.dataset.stepName;
            this._activeStep = this.steps.find((step) => step.name === name);
            this.updateStepsStatus();
        }
    }

    /**
     * Click on select button handler.
     */
    handleSelectButtonClick() {
        const toName = this._activeStep.name;
        this.computeMovement({ toName });
    }

    /**
     * Action button click event handler.
     *
     * @param {Event} event
     */
    handleActionClick(event) {
        /**
         * The event fired when a user clicks on an action button.
         *
         * @event
         * @name actionclick
         * @param {string} name Name of the action clicked.
         * @param {string} targetName Name of the step the action is related to.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('actionclick', {
                detail: {
                    name: event.currentTarget.name,
                    targetName: event.currentTarget.dataset.stepName
                }
            })
        );
    }

    /**
     * Coaching visibility toggle handler.
     */
    handleToggleCoaching() {
        this.coachingIsVisible = !this.coachingIsVisible;
    }

    /**
     * Change dispatcher.
     *
     * @param {string} oldStep
     */
    dispatchChange(oldStep) {
        /**
         * The event fired when the path advances or goes back following the configured step flow.
         *
         * @event
         * @name change
         * @param {string} currentStep Step name the path is moving to.
         * @param {string} oldStep Step name the path is moving from.
         * @param {string} completedValue Value of the completed option selected.
         * @param {boolean} lastStep True if the current step is the last step.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    currentStep: this.currentStep,
                    oldStep: oldStep,
                    completedValue: this._completedOptionValue,
                    lastStep: this.lastStepIsCurrent
                }
            })
        );
    }
}
