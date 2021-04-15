import { LightningElement, api } from 'lwc';
import { generateUniqueId, classSet } from 'c/utils';
import { normalizeArray } from 'c/utilsPrivate';

export default class AvonniPrimitiveRelationshipGraphItem extends LightningElement {
    @api label;
    @api name;
    @api avatarSrc;
    @api avatarFallbackIconName;
    @api href;
    @api contentData;
    @api groups;
    @api hideDefaultActions;
    @api theme;
    @api defaultActions;
    @api variant;

    _customActions;
    wrapperClass;

    connectedCallback() {
        this.updateClasses();
    }

    @api
    get customActions() {
        return this._customActions;
    }
    set customActions(value) {
        this._customActions = normalizeArray(value);
    }

    @api
    get activeSelection() {
        return this._activeSelection;
    }
    set activeSelection(value) {
        this._activeSelection = value;
        this.updateClasses();
    }

    @api
    get selected() {
        return this._selected;
    }
    set selected(value) {
        this._selected = value;
        this.updateClasses();
    }

    updateClasses() {
        this.wrapperClass = classSet(
            'slds-box slds-box_small slds-m-bottom_small slds-is-relative item'
        ).add({
            'item_has-groups': this.groups,
            'item_has-children': this.hasChildren,
            'item_is-selected': this.selected,
            'item_is-active': this.activeSelection,
            item_horizontal: this.variant === 'horizontal',
            'slds-theme_shade slds-text-color_default': this.theme === 'shade',
            'avonni-theme_inverse': this.theme === 'inverse',
            'slds-theme_default': this.theme === 'default'
        });
    }

    get hasChildren() {
        if (!this.groups) return false;

        return this.groups.some((group) => group.items);
    }

    get generateKey() {
        return generateUniqueId();
    }

    get hasAvatar() {
        return this.avatarFallbackIconName || this.avatarSrc;
    }

    get actions() {
        const allActions = this.defaultActions.concat(this.customActions);

        if (this.hideDefaultActions && this.customActions.length > 0) {
            return this.customActions;
        } else if (!this.hideDefaultActions && allActions.length > 0) {
            return allActions;
        }

        return false;
    }

    get buttonMenuVariant() {
        return this.theme === 'inverse' ? 'border-inverse' : 'border';
    }

    get ariaExpanded() {
        if (this.groups && !this.selected) {
            return false;
        } else if (this.groups && this.selected) {
            return true;
        }
        return undefined;
    }

    handleClick(event) {
        // Stop event if click was on action menu button
        const target = event.target.tagName;
        if (
            target === 'LIGHTNING-BUTTON-MENU' ||
            target === 'LIGHTNING-MENU-ITEM'
        )
            return;
        // Stop event if pressed key is not Enter of Space bar
        if (
            event.type === 'keyup' &&
            !['Enter', ' ', 'Spacebar'].includes(event.key)
        )
            return;

        this._selected = true;
        this._activeSelection = true;
        this.updateClasses();

        this.dispatchEvent(
            new CustomEvent('select', {
                detail: {
                    name: this.name
                }
            })
        );
    }

    handleActionClick(event) {
        const name = event.currentTarget.value;

        this.dispatchEvent(
            new CustomEvent('actionclick', {
                detail: {
                    name: name,
                    targetName: this.name,
                    itemData: this.contentData
                }
            })
        );
    }
}
