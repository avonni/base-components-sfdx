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
import {
    normalizeString,
    normalizeBoolean,
    normalizeArray
} from 'c/utilsPrivate';

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

const TEXT_POSITIONS = {
    valid: ['left', 'right', 'center'],
    default: 'right'
};

const DEFAULT_ALTERNATIVE_TEXT = 'Avatar';
const DEFAULT_ENTITY_TITLE = 'Entity';
const DEFAULT_PRESENCE_TITLE = 'Presence';
const DEFAULT_STATUS_TITLE = 'Status';

/**
 * @class
 * @descriptor avonni-avatar
 * @storyId example-avatar--base
 * @public
 */
export default class AvonniAvatar extends LightningElement {
    /**
     * The Lightning Design System name of the icon used as a fallback for the entity icon when the image fails to load. The initials fallback relies on this for its background color.
     * Names are written in the format 'standard:account' where 'standard' is the category, and 'account' is the specific icon to be displayed. Only icons from the standard and custom categories are allowed.
     *
     * @public
     * @type {string}
     */
    @api entityIconName;
    /**
     * Entity initials. If the record name contains two words, like first and last name, use the first capitalized letter of each. For records that only have a single word name, use the first two letters of that word using one capital and one lower case letter.
     *
     * @public
     * @type {string}
     */
    @api entityInitials;
    /**
     * The Lightning Design System name of the icon used as a fallback when the image fails to load. The initials fallback relies on this for its background color. Names are written in the format 'standard:account' where 'standard' is the category, and 'account' is the specific icon to be displayed. Only icons from the standard and custom categories are allowed.
     *
     * @public
     * @type {string}
     */
    @api fallbackIconName;
    /**
     * If the record name contains two words, like first and last name, use the first capitalized letter of each. For records that only have a single word name, use the first two letters of that word using one capital and one lower case letter.
     *
     * @public
     * @type {string}
     */
    @api initials;
    /**
     * primary-text.
     *
     * @public
     * @type {string}
     */
    @api primaryText;
    /**
     * Secondary text to display, usually the role of the user.
     *
     * @public
     * @type {string}
     */
    @api secondaryText;
    /**
     * Tertiary text to display, usually the status of the user. The tertiary text will only be shown when using size x-large and xx-large.
     *
     * @public
     * @type {string}
     */
    @api tertiaryText;

    mediaObjectClass;

    _alternativeText = DEFAULT_ALTERNATIVE_TEXT;
    _entityPosition = POSITIONS.entityDefault;
    _entitySrc;
    _entityTitle = DEFAULT_ENTITY_TITLE;
    _entityVariant = AVATAR_VARIANTS.default;
    _hideAvatarDetails = false;
    _presence = PRESENCE.default;
    _presencePosition = POSITIONS.presenceDefault;
    _presenceTitle = DEFAULT_PRESENCE_TITLE;
    _size = AVATAR_SIZES.default;
    _src;
    _status = STATUS.default;
    _statusPosition = POSITIONS.statusDefault;
    _statusTitle = DEFAULT_STATUS_TITLE;
    _variant = AVATAR_VARIANTS.default;
    _textPosition = TEXT_POSITIONS.default;
    _tags;
    _computedTags;

    connectedCallback() {
        this._updateClassList();
    }

    /**
     * The alternative text used to describe the avatar, which is displayed as hover text on the image.
     *
     * @public
     * @type {string}
     * @required
     * @default Avatar
     */
    @api
    get alternativeText() {
        return this._alternativeText;
    }

    set alternativeText(value) {
        this._alternativeText =
            typeof value === 'string' ? value.trim() : DEFAULT_ALTERNATIVE_TEXT;
    }

    /**
     * Position of the entity icon. Valid values include top-left, top-right, bottom-left and bottom-right.
     *
     * @public
     * @type {string}
     * @default top-left
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
    }

    /**
     * The URL for the entity image.
     *
     * @public
     * @type {string}
     */
    @api
    get entitySrc() {
        return this._entitySrc;
    }

    set entitySrc(value) {
        this._entitySrc = (typeof value === 'string' && value.trim()) || '';
    }

    /**
     * Entity title to be shown as a tooltip on hover over the presence icon.
     *
     * @public
     * @type {string}
     * @default Entity
     */
    @api
    get entityTitle() {
        return this._entityTitle;
    }

    set entityTitle(value) {
        this._entityTitle =
            (typeof value === 'string' && value.trim()) || DEFAULT_ENTITY_TITLE;
    }

    /**
     * The variant changes the shape of the entity. Valid values are empty, circle, and square.
     *
     * @public
     * @type {string}
     * @default square
     */
    @api
    get entityVariant() {
        return this._entityVariant;
    }

    set entityVariant(value) {
        this._entityVariant = normalizeString(value, {
            fallbackValue: AVATAR_VARIANTS.default,
            validValues: AVATAR_VARIANTS.valid
        });
    }

    /**
     * Hide primary, secondary and tertiary text.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    @api
    get hideAvatarDetails() {
        return this._hideAvatarDetails;
    }

    set hideAvatarDetails(value) {
        this._hideAvatarDetails = normalizeBoolean(value);
    }

    /**
     * Presence of the user to display. Valid values include online, busy, focus, offline, blocked and away.
     *
     * @public
     * @type {string}
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
    }

    /**
     * Presence title to be shown as a tooltip on hover over the presence icon.
     *
     * @public
     * @type {string}
     * @default bottom-right
     */
    @api
    get presencePosition() {
        return this._presencePosition;
    }

    set presencePosition(value) {
        this._presencePosition = normalizeString(value, {
            fallbackValue: POSITIONS.presenceDefault,
            validValues: POSITIONS.valid
        });
    }

    /**
     * Position of the presence icon. Valid values include top-left, top-right, bottom-left and bottom-right.
     *
     * @public
     * @type {string}
     * @default Presence
     */
    @api
    get presenceTitle() {
        return this._presenceTitle;
    }

    set presenceTitle(value) {
        this._presenceTitle =
            typeof value === 'string' ? value.trim() : DEFAULT_PRESENCE_TITLE;
    }

    /**
     * The size of the avatar. Valid values are x-small, small, medium, large, x-large and xx-large.
     *
     * @public
     * @type {string}
     * @default medium
     */
    @api
    get size() {
        return this._size;
    }

    set size(value) {
        this._size = normalizeString(value, {
            fallbackValue: AVATAR_SIZES.default,
            validValues: AVATAR_SIZES.valid
        });
    }

    /**
     * The URL for the image.
     *
     * @public
     * @type {string}
     * @required
     */
    @api
    get src() {
        return this._src;
    }

    set src(value) {
        this._src = (typeof value === 'string' && value.trim()) || '';
    }

    /**
     * Status of the user to display. Valid values include approved, locked, declined and unknown.
     *
     * @public
     * @type {string}
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
    }

    /**
     * Position of the status icon. Valid values include top-left, top-right, bottom-left and bottom-right.
     *
     * @public
     * @type {string}
     * @default top-right
     */
    @api
    get statusPosition() {
        return this._statusPosition;
    }

    set statusPosition(value) {
        this._statusPosition = normalizeString(value, {
            fallbackValue: POSITIONS.statusDefault,
            validValues: POSITIONS.valid
        });
    }

    /**
     * Status title to be shown as a tooltip on hover over the status icon.
     *
     * @public
     * @type {string}
     * @default Status
     */
    @api
    get statusTitle() {
        return this._statusTitle;
    }

    set statusTitle(value) {
        this._statusTitle =
            typeof value === 'string' ? value.trim() : DEFAULT_STATUS_TITLE;
    }

    /**
     * Array of tag objects. The tags are displayed as badges in the details.
     *
     * @public
     * @type {object[]}
     */
    @api
    get tags() {
        return this._tags;
    }
    set tags(tags) {
        this._tags = normalizeArray(tags);
    }

    /**
     * Position of the details text, relatively to the avatar. Valid values include right, left or center.
     *
     * @public
     * @type {string}
     * @default right
     */
    @api
    get textPosition() {
        return this._textPosition;
    }

    set textPosition(position) {
        this._textPosition = normalizeString(position, {
            fallbackValue: TEXT_POSITIONS.default,
            validValues: TEXT_POSITIONS.valid
        });
        this._updateClassList();
    }

    /**
     * The variant changes the shape of the avatar. Valid values are circle, and square.
     *
     * @public
     * @type {string}
     * @default square
     */
    @api
    get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: AVATAR_VARIANTS.default,
            validValues: AVATAR_VARIANTS.valid
        });
    }

    /**
     * Text position centered.
     *
     * @type {boolean}
     */
    get computedMediaObjectInline() {
        return this.textPosition === 'center';
    }

    /**
     * Computed JSON string of tags object.
     *
     * @type {object[]}
     */
    get computedTags() {
        this._computedTags = JSON.parse(JSON.stringify(this._tags));
        this._computedTags.forEach((tag) => {
            if (tag) {
                tag.class = this._determineBadgeStyle(tag);
            }
        });
        return this._computedTags;
    }

    /**
     * Check if Avatar exists.
     *
     * @type {boolean}
     */
    get showAvatar() {
        return this.src || this.initials || this.fallbackIconName;
    }

    /**
     * Tertiary text show.
     *
     * @type {boolean}
     */
    get showTertiaryText() {
        return this.size === 'x-large' || this.size === 'xx-large';
    }

    /**
     * Text position left.
     *
     * @type {boolean}
     */
    get textPositionLeft() {
        return this.textPosition === 'left';
    }

    /**
     * Media object layout based on text position.
     *
     * @type {string}
     */
    _updateClassList() {
        this.mediaObjectClass = classSet('').add({
            'slds-text-align_right': this.textPosition === 'left',
            'slds-text-align_center': this.textPosition === 'center'
        });
    }

    /**
     * Computed badge style based on tag object variant value.
     *
     * @param {object[]} tag
     * @returns {string} slds badge style
     */
    _determineBadgeStyle(tag) {
        switch (tag.variant) {
            case 'inverse':
                return 'slds-badge_inverse';
            case 'lightest':
                return 'slds-badge_lightest';
            case 'success':
                return 'slds-badge slds-theme_success';
            case 'warning':
                return 'slds-badge slds-theme_warning';
            case 'error':
                return 'slds-badge slds-theme_error';
            default:
                return 'slds-badge';
        }
    }
}
