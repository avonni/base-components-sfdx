import { LightningElement, api } from 'lwc';
import { classSet } from 'c/utils';
import { normalizeString } from 'c/utilsPrivate';

const validSizes = ['x-small', 'small', 'medium', 'large'];
const validVariants = ['stack', 'grid'];

export default class AvonniAvatarGroup extends LightningElement {
    _items = [];
    _maxCount;
    _size = 'medium';
    _variant = 'stack';
    _allowBlur = false;
    showPopever = false;
    hiddenItems = [];

    renderedCallback() {
        if (!this.isClassic) {
            let avatars = this.template.querySelectorAll(
                '.avonni-avatar-in-line'
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
        this._items = value;
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

    @api get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: 'stack',
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
            maxCount = this.variant === 'stack' ? 5 : 11;
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
            maxCount = this.variant === 'stack' ? 5 : 11;
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
        return classSet('slds-avatar-group')
            .add({
                'slds-avatar-group_x-small': this.size === 'x-small',
                'slds-avatar-group_small': this.size === 'small',
                'slds-avatar-group_medium': this.size === 'medium',
                'slds-avatar-group_large': this.size === 'large'
            })
            .toString();
    }

    get avatarInlineClass() {
        return classSet('avonni-avatar')
            .add({
                'avonni-avatar-in-line': this.variant === 'stack',
                'avonni-avatar-grid': this.variant === 'grid'
            })
            .add(`avonni-avatar-${this.size}`)
            .toString();
    }

    get avatarInlinePlusClass() {
        return classSet('avonni-avatar avonni-avatar-plus')
            .add({
                'avonni-avatar-in-line': this.variant === 'stack',
                'avonni-avatar-grid': this.variant === 'grid'
            })
            .add(`avonni-avatar-${this.size}`)
            .toString();
    }

    get isClassic() {
        return this.variant === 'stack' && this.items.length === 2;
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

        this.showPopever = false;
    }

    handlAvatarclick(event) {
        let itemId = event.target.dataset.itemId;
        let type = event.target.dataset.type;
        let item;

        if (type === 'show') {
            item = this.listItems[itemId];
        } else {
            item = this.listHiddenItems[itemId];
        }

        if (item.showMore) {
            this.showPopever = true;
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

            this.showPopever = false;
            this.cancelBlur();
        }
    }
}
