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

import { normalizeArray } from 'c/utilsPrivate';
import { classSet } from 'c/utils';

/**
 * Option
 * 
 * @class
 * @property {string} avatarFallbackIconName The Lightning Design System name of the icon used as a fallback when the image fails to load. The initials fallback relies on this for its background color.
 * Names are written in the format 'standard:account' where 'standard' is the category, and 'account' is the specific icon to be displayed. Only icons from the standard and custom categories are allowed.
 * @property {string} avatarSrc Image URL for the option avatar.
 * @property {string[]} groups Array of group names this option belongs to.
 * @property {string} label Label of the option.
 * @property {object[]} options Array of option objects. If present:
 * * The icon utility:chevronright will be displayed to the right of the option to indicate it has children.
 * * The option is not selectable. On click on it, the children options will replace the current options in the drop-down.
 * @property {string} secondaryText Secondary text to display below the label.
 * @property {string} value Required. A unique value for the option.
 * @property {boolean} hasAvatar Present if avatarFallbackIconName or avatarSrc
 */
export default class AvonniOption {
    constructor(option) {
        this.avatarFallbackIconName = option.avatarFallbackIconName;
        this.avatarSrc = option.avatarSrc;
        this.iconName = option.iconName;
        this.groups = normalizeArray(option.groups);
        this.label = option.label;
        this.options = normalizeArray(option.options);
        this.secondaryText = option.secondaryText;
        this.value = option.value;
        this.hasAvatar = this.avatarFallbackIconName || this.avatarSrc;
    }

    /**
     * Class of the option.
     * 
     * @type {string}
     */
    get computedClass() {
        return classSet(
            'slds-media slds-media_small slds-media_center slds-listbox__item slds-listbox__option slds-listbox__option_plain slds-listbox__option_entity combobox__option'
        )
            .add({
                'slds-is-selected': this.selected || this.hasSelectedChildren()
            })
            .toString();
    }

    /**
     * Class of the option's icon.
     * 
     * @type {string}
     */
    get computedIconClass() {
        return this.selected || this.hasSelectedChildren()
            ? 'slds-current-color'
            : undefined;
    }

    /**
     * Return the icon chosen or utility:check.
     * 
     * @type {string}
     */
    get computedCheckmarkIconName() {
        return this.iconName || 'utility:check';
    }

    /**
     * True if selected, options or icon-name.
     * 
     * @type {boolean}
     */
    get showCheckmark() {
        return (
            this.selected ||
            (this.options.length && this.hasSelectedChildren()) ||
            this.iconName
        );
    }

    /**
     * Array of option's options.
     * 
     * @param {object[]} options Array of option objects.
     * @returns {object[]} Array of option's options
     */
    hasSelectedChildren(options = this.options) {
        return options.some((option) => {
            return (
                option.selected ||
                (option.options.length &&
                    this.hasSelectedChildren(option.options))
            );
        });
    }
}
