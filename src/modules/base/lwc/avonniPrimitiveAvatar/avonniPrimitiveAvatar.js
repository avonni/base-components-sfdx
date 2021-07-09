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
import { normalizeString } from 'c/utilsPrivate';
import { computeSldsClass } from 'c/iconUtils';

const AVATAR_SIZES = {
    valid: [
        'xx-small',
        'x-small',
        'small',
        'medium',
        'large',
        'x-large',
        'xx-large'
    ],
    default: 'medium'
};
const AVATAR_VARIANTS = {
    valid: ['circle', 'square'],
    default: 'square'
};
const STATUS = {
    valid: ['approved', 'locked', 'declined', 'unknown'],
    default: null
};
const POSITIONS = {
    valid: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    presenceDefault: 'bottom-right',
    statusDefault: 'top-right',
    entityDefault: 'top-left'
};
const PRESENCE = {
    valid: ['online', 'busy', 'focus', 'offline', 'blocked', 'away'],
    default: null
};

const DEFAULT_ALTERNATIVE_TEXT = 'Avatar';
const DEFAULT_ENTITY_TITLE = 'Entity';
const DEFAULT_PRESENCE_TITLE = 'Presence';
const DEFAULT_STATUS_TITLE = 'Status';

export default class AvonniPrimitiveAvatar extends LightningElement {
    @api entityInitials;
    @api entityIconName;
    @api fallbackIconName;
    @api initials;

    avatarClass;
    entityClass;
    presenceClass;
    statusComputed;
    wrapperClass;
    fallbackIconClass;

    _alternativeText = DEFAULT_ALTERNATIVE_TEXT;
    _entityPosition = POSITIONS.entityDefault;
    _entitySrc;
    _entityTitle = DEFAULT_ENTITY_TITLE;
    _entityVariant = AVATAR_VARIANTS.default;
    _presence = PRESENCE.default;
    _presencePosition = POSITIONS.presenceDefault;
    _presenceTitle = DEFAULT_PRESENCE_TITLE;
    _size = AVATAR_SIZES.default;
    _src = '';
    _status = STATUS.default;
    _statusPosition = POSITIONS.statusDefault;
    _statusTitle = DEFAULT_STATUS_TITLE;
    _variant = AVATAR_VARIANTS.default;

    /**
     * Main avatar logic
     */

    connectedCallback() {
        this._updateClassList();

        if (this.status) this._computeStatus();
        if (this.presence) this._computePresenceClasses();
        if (this.showEntity) this._computeEntityClasses();
    }

    @api
    get alternativeText() {
        return this._alternativeText;
    }

    set alternativeText(value) {
        this._alternativeText =
            typeof value === 'string' ? value.trim() : DEFAULT_ALTERNATIVE_TEXT;
    }

    @api
    get size() {
        return this._size;
    }

    set size(value) {
        this._size = normalizeString(value, {
            fallbackValue: AVATAR_SIZES.default,
            validValues: AVATAR_SIZES.valid
        });
        this._updateClassList();
    }

    @api
    get src() {
        return this._src;
    }

    set src(value) {
        this._src = (typeof value === 'string' && value.trim()) || '';
    }

    @api
    get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: AVATAR_VARIANTS.default,
            validValues: AVATAR_VARIANTS.valid
        });
        this._updateClassList();
    }

    /**
     * Status
     */

    @api
    get status() {
        return this._status;
    }

    set status(value) {
        this._status = normalizeString(value, {
            fallbackValue: STATUS.default,
            validValues: STATUS.valid
        });
        this._computeStatus();
    }

    @api
    get statusTitle() {
        return this._statusTitle;
    }

    set statusTitle(value) {
        this._statusTitle =
            typeof value === 'string' ? value.trim() : DEFAULT_STATUS_TITLE;
        this._computeStatus();
    }

    @api
    get statusPosition() {
        return this._statusPosition;
    }

    set statusPosition(value) {
        this._statusPosition = normalizeString(value, {
            fallbackValue: POSITIONS.statusDefault,
            validValues: POSITIONS.valid
        });
        this._computeStatus();
    }

    /**
     * Presence
     */

    @api
    get presence() {
        return this._presence;
    }

    set presence(value) {
        this._presence = normalizeString(value, {
            fallbackValue: PRESENCE.default,
            validValues: PRESENCE.valid
        });
        this._computePresenceClasses();
    }

    @api
    get presencePosition() {
        return this._presencePosition;
    }

    set presencePosition(value) {
        this._presencePosition = normalizeString(value, {
            fallbackValue: POSITIONS.presenceDefault,
            validValues: POSITIONS.valid
        });
        this._computePresenceClasses();
    }

    @api
    get presenceTitle() {
        return this._presenceTitle;
    }

    set presenceTitle(value) {
        this._presenceTitle =
            typeof value === 'string' ? value.trim() : DEFAULT_PRESENCE_TITLE;
    }

    /**
     * Entity
     */

    @api
    get entityPosition() {
        return this._entityPosition;
    }

    set entityPosition(value) {
        this._entityPosition = normalizeString(value, {
            fallbackValue: POSITIONS.entityDefault,
            validValues: POSITIONS.valid
        });
        this._computeEntityClasses();
    }

    @api
    get entitySrc() {
        return this._entitySrc;
    }

    set entitySrc(value) {
        this._entitySrc = (typeof value === 'string' && value.trim()) || '';
    }

    @api
    get entityTitle() {
        return this._entityTitle;
    }

    set entityTitle(value) {
        this._entityTitle =
            (typeof value === 'string' && value.trim()) || DEFAULT_ENTITY_TITLE;
    }

    @api
    get entityVariant() {
        return this._entityVariant;
    }

    set entityVariant(value) {
        this._entityVariant = normalizeString(value, {
            fallbackValue: AVATAR_VARIANTS.default,
            validValues: AVATAR_VARIANTS.valid
        });
        this._computeEntityClasses();
    }

    get computedInitialsClass() {
        return classSet('slds-avatar__initials')
            .add({
                'slds-avatar-grouped__initials': this.groupedAvatar
            })
            .add(computeSldsClass(this.fallbackIconName))
            .toString();
    }

    get groupedAvatar() {
        return this.template.host.classList.contains('slds-avatar-grouped');
    }

    get showAvatar() {
        return this.src || this.initials || this.fallbackIconName;
    }

    get showInitials() {
        return !this._src && this.initials;
    }

    get showIcon() {
        return !this._src && !this.initials;
    }

    get showEntityIcon() {
        return !this.entitySrc && !this.entityInitials;
    }

    get showEntity() {
        return this.entitySrc || this.entityInitials || this.entityIconName;
    }

    get computedEntityInitialsClass() {
        return classSet('slds-avatar__initials')
            .add(computeSldsClass(this.entityIconName))
            .toString();
    }

    _updateClassList() {
        const { size, variant, groupedAvatar } = this;
        const wrapperClass = classSet('avonni-avatar slds-is-relative')
            .add({
                'avonni-avatar_square': variant === 'square',
                'avonni-avatar_circle': variant === 'circle'
            })
            .add({
                'avonni-avatar_xx-small': size === 'xx-small',
                'slds-avatar_x-small': size === 'x-small',
                'slds-avatar_small': size === 'small',
                'slds-avatar_medium': size === 'medium',
                'slds-avatar_large': size === 'large',
                'avonni-avatar_x-large': size === 'x-large',
                'avonni-avatar_xx-large': size === 'xx-large'
            });

        const avatarClass = classSet('slds-avatar').add({
            'slds-avatar_circle': variant === 'circle'
        });

        const fallbackIconClass = classSet('avonni-avatar__icon').add({
            'slds-avatar-grouped__icon': groupedAvatar
        });

        this.avatarClass = avatarClass;
        this.wrapperClass = wrapperClass;
        this.fallbackIconClass = fallbackIconClass;
    }

    _computeStatus() {
        const { status, statusPosition, statusTitle } = this;
        const classes = classSet('avonni-avatar__status slds-current-color')
            .add({
                'avonni-avatar__status_approved': status === 'approved',
                'avonni-avatar__status_locked': status === 'locked',
                'avonni-avatar__status_declined': status === 'declined',
                'avonni-avatar__status_unknown': status === 'unknown'
            })
            .add({
                'avonni-avatar_top-right': statusPosition === 'top-right',
                'avonni-avatar_top-left': statusPosition === 'top-left',
                'avonni-avatar_bottom-left': statusPosition === 'bottom-left',
                'avonni-avatar_bottom-right': statusPosition === 'bottom-right'
            });

        let iconName;
        switch (status) {
            case 'approved':
                iconName = 'utility:check';
                break;
            case 'locked':
                iconName = 'utility:lock';
                break;
            case 'declined':
                iconName = 'utility:close';
                break;
            default:
                iconName = 'utility:help';
                break;
        }

        this.statusComputed = {
            class: classes,
            iconName: iconName,
            type: status,
            title: statusTitle
        };
    }

    _computePresenceClasses() {
        const { presence, presencePosition } = this;

        this.presenceClass = classSet('avonni-avatar__presence')
            .add({
                'avonni-avatar__presence_online': presence === 'online',
                'avonni-avatar__presence_busy': presence === 'busy',
                'avonni-avatar__presence_focus': presence === 'focus',
                'avonni-avatar__presence_offline': presence === 'offline',
                'avonni-avatar__presence_blocked': presence === 'blocked',
                'avonni-avatar__presence_away': presence === 'away'
            })
            .add({
                'avonni-avatar_top-right': presencePosition === 'top-right',
                'avonni-avatar_top-left': presencePosition === 'top-left',
                'avonni-avatar_bottom-left': presencePosition === 'bottom-left',
                'avonni-avatar_bottom-right':
                    presencePosition === 'bottom-right'
            });
    }

    _computeEntityClasses() {
        const { entityVariant, entityPosition, entityIconName } = this;

        const iconFullName =
            typeof entityIconName === 'string' ? entityIconName.trim() : ':';
        const iconCategory = iconFullName.split(':')[0];
        const iconName = iconFullName.split(':')[1];

        this.entityClass = classSet(
            `slds-avatar slds-current-color avonni-avatar__entity slds-icon-${iconCategory}-${iconName}`
        )
            .add({
                'avonni-avatar_top-right': entityPosition === 'top-right',
                'avonni-avatar_top-left': entityPosition === 'top-left',
                'avonni-avatar_bottom-left': entityPosition === 'bottom-left',
                'avonni-avatar_bottom-right': entityPosition === 'bottom-right'
            })
            .add({
                'slds-avatar_circle': entityVariant === 'circle'
            });
    }

    handleImageError(event) {
        // eslint-disable-next-line no-console
        console.warn(
            `Avatar component Image with src="${event.target.src}" failed to load.`
        );
        this._src = '';
    }
}
