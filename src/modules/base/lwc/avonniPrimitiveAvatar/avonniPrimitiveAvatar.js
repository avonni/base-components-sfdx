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
import { normalizeString, normalizeArray } from 'c/utilsPrivate';
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
    entityDefault: 'top-left',
    actionDefault: 'bottom-left'
};
const PRESENCE = {
    valid: ['online', 'busy', 'focus', 'offline', 'blocked', 'away'],
    default: null
};

const DEFAULT_ALTERNATIVE_TEXT = 'Avatar';
const DEFAULT_ENTITY_TITLE = 'Entity';
const DEFAULT_PRESENCE_TITLE = 'Presence';
const DEFAULT_STATUS_TITLE = 'Status';
const DEFAULT_ICON_MENU_ICON = 'utility:down';

export default class AvonniPrimitiveAvatar extends LightningElement {
    @api entityInitials;
    @api fallbackIconName;
    @api initials;

    avatarClass;
    entityClass;
    presenceClass;
    statusComputed;
    wrapperClass;
    fallbackIconClass;

    _alternativeText = DEFAULT_ALTERNATIVE_TEXT;
    _entityIconName;
    _entityPosition = POSITIONS.entityDefault;
    _entitySrc;
    _entityTitle = DEFAULT_ENTITY_TITLE;
    _entityVariant = AVATAR_VARIANTS.default;
    _presence = PRESENCE.default;
    _presencePosition = POSITIONS.presenceDefault;
    _presenceTitle = DEFAULT_PRESENCE_TITLE;
    _size = AVATAR_SIZES.default;
    _src = '';
    _actions = [];
    _actionPosition = POSITIONS.actionDefault;
    _actionMenuIcon = DEFAULT_ICON_MENU_ICON;
    _actionTitle = '';
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

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Actions
     */
    @api
    get actions() {
        return this._actions;
    }

    set actions(value) {
        this._actions = normalizeArray(value);
    }

    get actionMenu() {
        return this.actions.length > 1;
    }

    get action() {
        return this.actions[0];
    }

    @api
    get actionPosition() {
        return this._actionPosition;
    }

    set actionPosition(value) {
        this._actionPosition = normalizeString(value, {
            fallbackValue: POSITIONS.actionDefault,
            validValues: POSITIONS.valid
        });
    }

    @api
    get actionMenuIcon() {
        return this._actionMenuIcon;
    }

    set actionMenuIcon(icon) {
        if (icon) {
            this._actionMenuIcon = icon;
        } else {
            this._actionMenuIcon = DEFAULT_ICON_MENU_ICON;
        }
    }

    @api
    get alternativeText() {
        return this._alternativeText;
    }

    set alternativeText(value) {
        this._alternativeText =
            typeof value === 'string' ? value.trim() : DEFAULT_ALTERNATIVE_TEXT;
    }

    /**
     * Entity
     */

    @api
    get entityIconName() {
        return this._entityIconName;
    }

    set entityIconName(value) {
        this._entityIconName = value;
        this._computeEntityClasses();
    }

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

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    get actionMenuSize() {
        switch (this.size) {
            case 'x-large':
                return 'x-small';
            case 'large':
                return 'xx-small';
            case 'medium':
                return 'xx-small';
            default:
                return 'small';
        }
    }

    get computedInitialsClass() {
        return classSet(
            'slds-avatar__initials avonni-avatar__initials_text-color'
        )
            .add({
                'slds-avatar-grouped__initials': this.groupedAvatar
            })
            .add(computeSldsClass(this.fallbackIconName))
            .toString();
    }

    get computedActionClasses() {
        return classSet('avonni-avatar__actions').add(
            `avonni-avatar_${this._actionPosition}`
        );
    }

    get computedEntityInitialsClass() {
        return classSet('slds-avatar__initials')
            .add(computeSldsClass(this.entityIconName))
            .toString();
    }

    get computedActionMenuIcon() {
        if (this.actions.length === 1 && this.actions[0].iconName) {
            return this.actions[0].iconName;
        }
        return this.actionMenuIcon;
    }

    get groupedAvatar() {
        return Array.from(this.classList).includes('slds-avatar-grouped');
    }

    get showActions() {
        const { size, actions } = this;
        let _showAction = true;
        if (
            size === 'small' ||
            size === 'x-small' ||
            size === 'xx-small' ||
            (actions && !actions.length > 0)
        ) {
            _showAction = false;
        }
        return _showAction;
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

    _updateClassList() {
        const { size, variant, groupedAvatar } = this;
        const wrapperClass = classSet(
            'slds-is-relative avonni-avatar__display_inline-block'
        )
            .add(`avonni-avatar_${variant}`)
            .add(`avonni-avatar_${size}`);

        const avatarClass = classSet('avonni-avatar')
            .add({
                'avonni-avatar__border-radius_circle': variant === 'circle'
            })
            .add(computeSldsClass(this.fallbackIconName));

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
            .add(`avonni-avatar__status_${status}`)
            .add(`avonni-avatar_${statusPosition}`);

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

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    _computePresenceClasses() {
        const { presence, presencePosition } = this;

        this.presenceClass = classSet('avonni-avatar__presence')
            .add(`avonni-avatar__presence_${presence}`)
            .add(`avonni-avatar_${presencePosition}`);
    }

    _computeEntityClasses() {
        const { entityVariant, entityPosition, entityIconName } = this;

        const iconFullName =
            typeof entityIconName === 'string' ? entityIconName.trim() : ':';
        const iconCategory = iconFullName.split(':')[0];
        const iconName = iconFullName.split(':')[1]
            ? iconFullName.split(':')[1].replace(/_/g, '-')
            : '';

        this.entityClass = classSet(
            `avonni-avatar slds-current-color avonni-avatar__entity slds-icon-${iconCategory}-${iconName}`
        )
            .add(`avonni-avatar_${entityPosition}`)
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

    /**
     * Action clicked event handler.
     *
     * @param {event}
     */
    handleActionClick(event) {
        /**
         * The event fired when a user clicks on an action.
         *
         * @event
         * @name actionclick
         * @bubbles
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('actionclick', {
                bubbles: true,
                detail: {
                    name: event.currentTarget.value
                }
            })
        );
    }
}
