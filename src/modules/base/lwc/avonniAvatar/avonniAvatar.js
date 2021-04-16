import { LightningElement, api } from 'lwc';
import { classSet } from 'c/utils';
import { normalizeString, normalizeBoolean } from 'c/utilsPrivate';

const SIZE = {
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
const VARIANT = {
    valid: ['circle', 'square'],
    default: 'square'
};
const STATUS = {
    valid: ['approved', 'locked', 'declined', 'unknown'],
    default: null
};
const POSITION = {
    valid: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    presenceDefault: 'bottom-right',
    statusDefault: 'top-right',
    entityDefault: 'top-left'
};
const PRESENCE = {
    valid: ['online', 'busy', 'focus', 'offline', 'blocked', 'away'],
    default: null
};

const TEXT_POSITION = {
    valid: ['left', 'right', 'center'],
    default: 'right'
};

const DEFAULT_ALTERNATIVE_TEXT = 'Avatar';
const DEFAULT_ENTITY_TITLE = 'Entity';
const DEFAULT_PRESENCE_TITLE = 'Presence';
const DEFAULT_STATUS_TITLE = 'Status';

export default class AvonniAvatar extends LightningElement {
    @api entityInitials;
    @api entityIconName;
    @api fallbackIconName;
    @api initials;
    @api primaryText;
    @api secondaryText;
    @api tertiaryText;

    mediaObjectClass;

    _alternativeText = DEFAULT_ALTERNATIVE_TEXT;
    _entityPosition = POSITION.entityDefault;
    _entitySrc;
    _entityTitle = DEFAULT_ENTITY_TITLE;
    _entityVariant = VARIANT.default;
    _hideAvatarDetails = false;
    _presence = PRESENCE.default;
    _presencePosition = POSITION.presenceDefault;
    _presenceTitle = DEFAULT_PRESENCE_TITLE;
    _size = SIZE.default;
    _src = '';
    _status = STATUS.default;
    _statusPosition = POSITION.statusDefault;
    _statusTitle = DEFAULT_STATUS_TITLE;
    _variant = VARIANT.default;
    _textPosition = TEXT_POSITION.default;

    /**
     * Main avatar logic
     */

    connectedCallback() {
        this._updateClassList();
    }

    @api
    get hideAvatarDetails() {
        return this._hideAvatarDetails;
    }

    set hideAvatarDetails(value) {
        this._hideAvatarDetails = normalizeBoolean(value);
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
            fallbackValue: SIZE.default,
            validValues: SIZE.valid
        });
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
            fallbackValue: VARIANT.default,
            validValues: VARIANT.valid
        });
    }

    @api
    get textPosition() {
        return this._textPosition;
    }

    set textPosition(position) {
        this._textPosition = normalizeString(position, {
            fallbackValue: TEXT_POSITION.default,
            validValues: TEXT_POSITION.valid
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
    }

    @api
    get statusTitle() {
        return this._statusTitle;
    }

    set statusTitle(value) {
        this._statusTitle =
            typeof value === 'string' ? value.trim() : DEFAULT_STATUS_TITLE;
    }

    @api
    get statusPosition() {
        return this._statusPosition;
    }

    set statusPosition(value) {
        this._statusPosition = normalizeString(value, {
            fallbackValue: POSITION.statusDefault,
            validValues: POSITION.valid
        });
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
    }

    @api
    get presencePosition() {
        return this._presencePosition;
    }

    set presencePosition(value) {
        this._presencePosition = normalizeString(value, {
            fallbackValue: POSITION.presenceDefault,
            validValues: POSITION.valid
        });
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
            fallbackValue: POSITION.entityDefault,
            validValues: POSITION.valid
        });
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
            fallbackValue: VARIANT.default,
            validValues: VARIANT.valid
        });
    }

    get showAvatar() {
        return this.src || this.initials || this.fallbackIconName;
    }

    get showTertiaryText() {
        return this.size === 'x-large' || this.size === 'xx-large';
    }

    get textPositionLeft() {
        return this.textPosition === 'left';
    }

    get computedMediaObjectInline() {
        return this.textPosition === 'center';
    }

    _updateClassList() {
        this.mediaObjectClass = classSet('').add({
            'slds-text-align_right': this.textPosition === 'left',
            'slds-text-align_center': this.textPosition === 'center'
        });
    }
}
