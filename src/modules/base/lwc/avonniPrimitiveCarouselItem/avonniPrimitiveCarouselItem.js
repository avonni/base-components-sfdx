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
import { classSet } from 'c/utils';
import { normalizeString, normalizeBoolean } from 'c/utilsPrivate';
import tag from './avonniTag.html';
import noTag from './avonniNoTag.html';

const ACTIONS_POSITIONS = {
    valid: [
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
        'bottom-center'
    ],
    default: 'bottom-center'
};

const ACTIONS_VARIANTS = {
    valid: ['bare', 'border', 'menu'],
    default: 'border'
};

const DEFAULT_CAROUSEL_HEIGHT = 6.625;

export default class AvonniPrimitiveCarouselItem extends LightningElement {
    @api title;
    @api description;
    @api infos;
    @api imageAssistiveText;
    @api href;
    @api name;
    @api src;

    @api itemIndex;
    @api panelIndex;
    @api panelItems;

    _actions = [];
    _actionsPosition = ACTIONS_POSITIONS.default;
    _actionsVariant = ACTIONS_VARIANTS.default;
    _carouselContentHeight = DEFAULT_CAROUSEL_HEIGHT;

    render() {
        return normalizeBoolean(this.href) ? tag : noTag;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Valid values include bare, border and menu.
     *
     * @type {string}
     * @public
     * @default border
     */
    @api
    get actions() {
        return this._actions;
    }

    set actions(actions) {
        this._actions = actions;
        this.initializeCarouselHeight();
    }

    /**
     * Valid values include top-left, top-right,  bottom-left, bottom-right and bottom-center.
     *
     * @type {string}
     * @public
     * @default bottom-center
     */
    @api
    get actionsPosition() {
        return this._actionsPosition;
    }

    set actionsPosition(position) {
        this._actionsPosition = normalizeString(position, {
            fallbackValue: ACTIONS_POSITIONS.default,
            validValues: ACTIONS_POSITIONS.valid
        });
    }

    /**
     * Valid values include bare, border and menu.
     *
     * @type {string}
     * @public
     * @default border
     */
    @api
    get actionsVariant() {
        return this._actionsVariant;
    }

    set actionsVariant(variant) {
        this._actionsVariant = normalizeString(variant, {
            fallbackValue: ACTIONS_VARIANTS.default,
            validValues: ACTIONS_VARIANTS.valid
        });
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Retrieve image class - set to relative if not in bottom position.
     *
     * @type {string}
     */
    get computedCarouselImageClass() {
        return classSet('slds-carousel__image')
            .add({
                'slds-is-relative': !this.isBottomPosition
            })
            .toString();
    }

    /**
     * Computed actions container class styling based on action position attributes.
     *
     * @type {string}
     */
    get computedActionsContainerClass() {
        return classSet('avonni-carousel__actions')
            .add({
                'avonni-carousel__actions-bottom-center':
                    this._actionsPosition === 'bottom-center',
                'avonni-carousel__actions-right':
                    this._actionsPosition === 'bottom-right' ||
                    this._actionsPosition === 'top-right',
                'avonni-carousel__actions-left':
                    this._actionsPosition === 'bottom-left' ||
                    this._actionsPosition === 'top-left'
            })
            .add({
                'slds-p-around_small': !this.isBottomPosition,
                'slds-is-absolute': !this.isBottomPosition
            })
            .toString();
    }

    /**
     * Set actions variant button icon to bare if the action variant is bare, if not , set the button icon to border-filled.
     *
     * @type {string}
     */
    get computedActionsVariantButtonIcon() {
        return this._actionsVariant === 'bare' ? 'bare' : 'border-filled';
    }

    /**
     * Action button icon class styling based on attributes.
     *
     * @type {string}
     */
    get computedLightningButtonIconActionClass() {
        return classSet('')
            .add({
                'slds-m-horizontal_xx-small': this._actionsVariant === 'border',
                'slds-m-right_x-small slds-m-top_xx-small':
                    this._actionsVariant === 'bare',
                'avonni-carousel__button-icon-top':
                    this._actionsPosition === 'top-right' ||
                    this._actionsPosition === 'top-left',
                'avonni-carousel__button-icon-bottom':
                    this._actionsPosition === 'bottom-right' ||
                    this._actionsPosition === 'bottom-left' ||
                    this._actionsPosition === 'bottom-center'
            })
            .toString();
    }

    get computedLightningButtonMenuActionClass() {
        return classSet('').add({
            'slds-hide_small': this.isMenuVariant === false
        });
    }

    /**
     * Computed carousel content class - set to display content bottom if position is bottom.
     *
     * @type {string}
     */
    get computedCarouselContentClass() {
        return classSet(
            'slds-carousel__content avonni-primitive-carousel-item__content_background'
        )
            .add({
                'avonni-carousel__content-bottom': this.isBottomPosition
            })
            .toString();
    }

    /**
     * Set actions variant button to base if the action variant is bare, if not , set the button to neutral.
     *
     * @type {string}
     */
    get computedActionsVariantButton() {
        return this._actionsVariant === 'bare' ? 'base' : 'neutral';
    }

    /**
     * Verify if actions position is at the bottom.
     */
    get isBottomPosition() {
        return this._actionsPosition.indexOf('bottom') > -1;
    }

    /**
     * Verify if actions are present.
     */
    get hasActions() {
        return this._actions.length > 0;
    }

    /**
     * Verify if the actions variant is menu.
     */
    get isMenuVariant() {
        return this._actionsVariant === 'menu';
    }

    /**
     * Computed Carousle content size height styling.
     *
     * @type {string}
     */
    get computedCarouselContentSize() {
        return `height: ${this._carouselContentHeight}rem`;
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Carousel height initialization.
     */
    initializeCarouselHeight() {
        this._carouselContentHeight =
            this.actions.length > 0 && this.isBottomPosition ? 7.5 : 6.625;
    }

    /**
     * Item clicked event handler.
     *
     * @param {event}
     */
    handleItemClick() {
        const {
            title,
            description,
            src,
            href,
            actions,
            imageAssistiveText,
            name
        } = this;
        /**
         * The event fired when an item is clicked.
         *
         * @event
         * @name itemclick
         * @param {object} item The item data clicked.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('itemclick', {
                detail: {
                    item: {
                        title,
                        description,
                        src,
                        href,
                        actions,
                        imageAssistiveText,
                        name
                    }
                }
            })
        );
    }

    /**
     * Action click event handler.
     *
     * @param {Event}
     */
    handleActionClick(event) {
        event.preventDefault();
        const actionName = event.currentTarget.name;
        this.actionDispatcher(actionName);
    }

    /**
     * Menu select event handler
     *
     * @param {Event}
     */
    handleMenuSelect(event) {
        const actionName = event.currentTarget.name;
        this.actionDispatcher(actionName);
    }

    actionDispatcher(actionName) {
        const {
            title,
            description,
            src,
            href,
            actions,
            imageAssistiveText,
            name
        } = this;

        /**
         * The event fired when a user clicks on an action.
         *
         * @event
         * @name actionclick
         * @param {string} name Name of the action clicked.
         * @param {object} item Item clicked.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('actionclick', {
                detail: {
                    name: actionName,
                    item: {
                        title,
                        description,
                        name,
                        src,
                        href,
                        actions,
                        imageAssistiveText
                    }
                }
            })
        );
    }

    /**
     * Prevent the default event browser behavior
     *
     * @param {Event}
     */
    preventDefault(event) {
        event.preventDefault();
    }
}
