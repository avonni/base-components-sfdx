import { LightningElement, api } from 'lwc';
import { classSet } from 'c/utils';
import { normalizeString, normalizeArray } from 'c/utilsPrivate';

const validSizes = [
    'x-small',
    'small',
    'medium',
    'large',
    'x-large',
    'xx-large'
];
const validLayouts = ['stack', 'grid', 'list'];

const validVariants = ['empty', 'square', 'circle'];

const validButtonIconPositions = ['left', 'right'];

const validButtonVariants = [
    'neutral',
    'base',
    'brand',
    'brand-outline',
    'destructive',
    'destructive-text',
    'inverse',
    'success'
];

export default class AvonniAvatarGroup extends LightningElement {
    @api listButtonLabel = 'Show more';
    @api listButtonIconName;

    _items = [];
    _maxCount;
    _size = 'medium';
    _layout = 'stack';
    _allowBlur = false;
    _listButtonVariant = 'neutral';
    _listButtonIconPosition = 'left';
    _variant = 'square';
    showPopover = false;
    hiddenItems = [];

    connectedCallback() {
        if (!this.maxCount) {
            this._maxCount = this.layout === 'stack' ? 5 : 11;
        }
    }

    renderedCallback() {
        if (!this.isClassic) {
            let avatars = this.template.querySelectorAll(
                '.avonni-avatar-group_in-line'
            );

            avatars.forEach((avatar, index) => {
                avatar.style.zIndex = avatars.length - index;
            });
        }
    }

    @api
    get items() {
        return this._items;
    }

    set items(value) {
        this._items = normalizeArray(value);
    }

    @api
    get maxCount() {
        return this._maxCount;
    }

    set maxCount(value) {
        this._maxCount = value;
    }

    @api get size() {
        return this._size;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: 'medium',
            validValues: validSizes
        });
    }

    @api get layout() {
        return this._layout;
    }

    set layout(value) {
        this._layout = normalizeString(value, {
            fallbackValue: 'stack',
            validValues: validLayouts
        });
    }

    @api get listButtonVariant() {
        return this._listButtonVariant;
    }

    set listButtonVariant(value) {
        this._listButtonVariant = normalizeString(value, {
            fallbackValue: 'neutral',
            validValues: validButtonVariants
        });
    }

    @api get listButtonIconPosition() {
        return this._listButtonIconPosition;
    }

    set listButtonIconPosition(value) {
        this._listButtonIconPosition = normalizeString(value, {
            fallbackValue: 'left',
            validValues: validButtonIconPositions
        });
    }

    @api get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: 'square',
            validValues: validVariants
        });
    }

    get primaryItem() {
        if (this.items.length === 2) {
            return this.items[0];
        }

        return {};
    }

    get secondaryItem() {
        if (this.items.length === 2) {
            return this.items[1];
        }

        return {};
    }

    get listItems() {
        let length = this.items.length;
        let maxCount = this.maxCount;
        let items = JSON.parse(JSON.stringify(this.items));

        if (isNaN(maxCount)) {
            maxCount = this.layout === 'stack' ? 5 : 11;
        }

        if (length > maxCount) {
            items = items.slice(0, maxCount);

            items.push({
                initials: `+${length - maxCount}`,
                showMore: true
            });
        }

        items.forEach((item, index) => {
            item.key = 'avatar-key-' + index;
        });

        return items;
    }

    get listHiddenItems() {
        let length = this.items.length;
        let maxCount = this.maxCount;
        let items = JSON.parse(JSON.stringify(this.items));

        if (isNaN(maxCount)) {
            maxCount = this.layout === 'stack' ? 5 : 11;
        }

        if (length > maxCount) {
            items = items.slice(maxCount);
            items.forEach((item, index) => {
                item.key = 'avatar-key-hidden-' + index;
            });

            return items;
        }

        return [];
    }

    get avatarGroupClass() {
        return classSet('slds-avatar-group avonni-avatar-group__avatar')
            .add({
                'slds-avatar-group_x-small': this.size === 'x-small',
                'slds-avatar-group_small': this.size === 'small',
                'slds-avatar-group_medium': this.size === 'medium',
                'slds-avatar-group_large': this.size === 'large',
                'avonni-avatar-group_x-large': this.size === 'x-large',
                'avonni-avatar-group_xx-large': this.size === 'xx-large',
                'avonni-avatar-group_circle': this.variant === 'circle'
            })
            .toString();
    }

    get avatarInlineClass() {
        return classSet('avonni-avatar-group__avatar')
            .add({
                'avonni-avatar-group_in-line': this.layout === 'stack'
            })
            .add(`avonni-avatar-${this.size}`)
            .toString();
    }

    get avatarInlinePlusClass() {
        return classSet('avonni-avatar-group__avatar avonni-avatar-group__plus')
            .add({
                'avonni-avatar-group_in-line': this.layout === 'stack'
            })
            .add(`avonni-avatar-${this.size}`)
            .toString();
    }

    get avatarWrapperClass() {
        return classSet('avonni-avatar-group__avatar-container').add({
            'slds-show': this.layout === 'list',
            'avonni-avatar-group_circle': this.variant === 'circle'
        });
    }

    get isClassic() {
        return this.layout === 'stack' && this.items.length === 2;
    }

    get isNotList() {
        return !(this.layout === 'list');
    }

    allowBlur() {
        this._allowBlur = true;
    }

    cancelBlur() {
        this._allowBlur = false;
    }

    handleBlur() {
        if (!this._allowBlur) {
            return;
        }

        this.showPopover = false;
    }

    handleAvatarClick(event) {
        if (event.type === 'keyup' && event.key !== 'Enter') return;

        const itemId = event.target.dataset.itemId;
        const type = event.target.dataset.type;
        let item;

        if (type === 'show') {
            item = this.listItems[itemId];
        } else {
            item = this.listHiddenItems[itemId];
        }

        if (item.showMore) {
            this.showPopover = true;
            this.template.querySelector('.slds-dropdown-trigger').focus();
            this.allowBlur();
        } else {
            this.dispatchEvent(
                new CustomEvent('avatarclick', {
                    bubbles: true,
                    cancelable: true,
                    detail: {
                        item
                    }
                })
            );

            this.showPopover = false;
            this.cancelBlur();
        }
    }
}
