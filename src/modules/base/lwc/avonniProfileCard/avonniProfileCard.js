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
import { normalizeString } from 'c/utilsPrivate';
import { classSet } from 'c/utils';

const AVATAR_SIZES = {
    valid: ['x-small', 'small', 'medium', 'large', 'x-large'],
    default: 'medium'
};
const AVATAR_POSITIONS = {
    valid: [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right'
    ],
    default: 'top-left'
};
const AVATAR_VARIANTS = { valid: ['circle', 'square'], default: 'circle' };

export default class AvonniProfileCard extends LightningElement {
    @api title;
    @api subtitle;
    @api backgroundColor;
    @api backgroundSrc;
    @api backgroundAlternativeText;
    @api avatarSrc;
    @api avatarAlternativeText;
    @api avatarFallbackIconName;

    _size = AVATAR_SIZES.default;
    _avatarPosition = AVATAR_POSITIONS.default;
    _avatarMobilePosition = AVATAR_POSITIONS.default;
    _avatarVariant = AVATAR_VARIANTS.default;
    isError = false;
    showActions = true;
    showFooter = true;
    showAvatarActions = true;

    renderedCallback() {
        let header = this.template.querySelector('header');

        if (this.backgroundColor) {
            header.style.backgroundColor = this.backgroundColor;
        }

        if (this.backgroundSrc) {
            header.style.backgroundImage = `url(${this.backgroundSrc})`;
        }

        if (this.avatarActionsSlot) {
            this.showAvatarActions =
                this.avatarActionsSlot.assignedElements().length !== 0;
        }

        if (this.actionsSlot) {
            this.showActions = this.actionsSlot.assignedElements().length !== 0;

            if (
                this.showActions &&
                this._avatarPosition.indexOf('right') > -1
            ) {
                let actionsContainer = this.template.querySelector(
                    '.avonni-actions'
                );
                actionsContainer.classList.add('avonni-actions-left');
            } else {
                let actionsContainer = this.template.querySelector(
                    '.avonni-actions'
                );
                actionsContainer.classList.add('avonni-actions-right');
            }
            if (
                this.showActions &&
                this._avatarMobilePosition.indexOf('right') > -1
            ) {
                let actionsContainer = this.template.querySelector(
                    '.avonni-actions'
                );
                actionsContainer.classList.add('avonni-mobile-actions-left');
            } else {
                let actionsContainer = this.template.querySelector(
                    '.avonni-actions'
                );
                actionsContainer.classList.add('avonni-mobile-actions-right');
            }
        }

        if (this.footerSlot) {
            this.showFooter = this.footerSlot.assignedElements().length !== 0;
        }
    }

    get avatarActionsSlot() {
        return this.template.querySelector('slot[name=avataractions]');
    }

    get actionsSlot() {
        return this.template.querySelector('slot[name=actions]');
    }

    get footerSlot() {
        return this.template.querySelector('slot[name=footer]');
    }

    @api
    get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: AVATAR_SIZES.default,
            validValues: AVATAR_SIZES.valid
        });
    }

    @api
    get avatarPosition() {
        return this._avatarPosition;
    }

    set avatarPosition(avatarPosition) {
        this._avatarPosition = normalizeString(avatarPosition, {
            fallbackValue: AVATAR_POSITIONS.default,
            validValues: AVATAR_POSITIONS.valid
        });
    }

    @api
    get avatarMobilePosition() {
        return this._avatarMobilePosition;
    }

    set avatarMobilePosition(avatarMobilePosition) {
        this._avatarMobilePosition = normalizeString(avatarMobilePosition, {
            fallbackValue: AVATAR_POSITIONS.default,
            validValues: AVATAR_POSITIONS.valid
        });
    }

    @api
    get avatarVariant() {
        return this._avatarVariant;
    }

    set avatarVariant(avatarVariant) {
        this._avatarVariant = normalizeString(avatarVariant, {
            fallbackValue: AVATAR_VARIANTS.default,
            validValues: AVATAR_VARIANTS.valid
        });
    }

    get computedContainerClass() {
        return classSet('avonni-flex-container')
            .add({
                'avonni-flex-align-center':
                    this._avatarPosition === 'top-center' ||
                    this._avatarPosition === 'bottom-center',
                'avonni-flex-align-end':
                    this._avatarPosition === 'top-right' ||
                    this._avatarPosition === 'bottom-right'
            })
            .add({
                'avonni-flex-mobile-align-center':
                    this._avatarMobilePosition === 'top-center' ||
                    this._avatarMobilePosition === 'bottom-center',
                'avonni-flex-mobile-align-end':
                    this._avatarMobilePosition === 'top-right' ||
                    this._avatarMobilePosition === 'bottom-right'
            })
            .toString();
    }

    get computedMainContainerClass() {
        return classSet('')
            .add({
                'top-left-desktop': this._avatarPosition === 'top-left',
                'bottom-left-desktop': this._avatarPosition === 'bottom-left',
                'bottom-right-desktop': this._avatarPosition === 'bottom-right',
                'top-right-desktop': this._avatarPosition === 'top-right',
                'top-center-desktop': this._avatarPosition === 'top-center',
                'bottom-center-desktop':
                    this._avatarPosition === 'bottom-center'
            })
            .add({
                'mobile-top-left': this._avatarMobilePosition === 'top-left',
                'mobile-bottom-left':
                    this._avatarMobilePosition === 'bottom-left',
                'mobile-bottom-right':
                    this._avatarMobilePosition === 'bottom-right',
                'mobile-top-right': this._avatarMobilePosition === 'top-right',
                'mobile-top-center':
                    this._avatarMobilePosition === 'top-center',
                'mobile-bottom-center':
                    this._avatarMobilePosition === 'bottom-center'
            })
            .add(`card-${this._size}`)
            .toString();
    }

    get computedHeaderClass() {
        return classSet('slds-media slds-media_center slds-has-flexi-truncate')
            .add(`background-${this._size}`)
            .toString();
    }

    get computedAvatarClass() {
        return classSet('avatar-img')
            .add(`avatar-${this._size}`)
            .add({
                'avatar-img-circle': this._avatarVariant === 'circle',
                'avonni-icon-container': this.isError
            })
            .toString();
    }

    get showHeaderSlot() {
        return !this.title && !this.subtitle;
    }

    get isCircle() {
        return this._avatarVariant === 'circle' ? 'avatar-img-circle' : '';
    }

    setFallbackIcon() {
        if (
            this.avatarFallbackIconName &&
            (this.avatarFallbackIconName.indexOf('standard') > -1 ||
                this.avatarFallbackIconName.indexOf('custom') > -1)
        ) {
            this.isError = true;
        }
    }
}
