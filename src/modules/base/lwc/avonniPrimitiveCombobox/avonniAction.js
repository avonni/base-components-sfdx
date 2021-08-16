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

import { classSet } from 'c/utils';
import { normalizeAriaAttribute, normalizeBoolean } from 'c/utilsPrivate';

/**
 * Action
 * 
 * @class
 * @param {string} key Unique identifier for the header
 * @property {string} label Required. The action label.
 * @property {string} name Required. The name of the action, which identifies the selected action. It will be returned by the actionclick event.
 * @property {string} iconName The Lightning Design System name of the icon. Names are written in the format standard:opportunity. The icon is appended to the left of the label.
 * @property {boolean} disabled Specifies whether the action can be selected. If true, the action item is shown as disabled. This value defaults to false.
 * @property {string} position Position of the action in the drop-down. Valid values include top and bottom. Defaults to top.
 * @property {boolean} isBackLink
 */
export default class AvonniAction {
    constructor(action) {
        this.name = action.name;
        this.label = action.label;
        this.iconName = action.iconName;
        this.position = action.position || 'top';
        this.isBackLink = false;
        this.disabled = normalizeBoolean(action.disabled);
    }

    /**
     * Class of the action.
     * 
     * @type {string}
     */
    get computedClass() {
        return classSet(
            'slds-listbox__item slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_term'
        )
            .add({
                'slds-border_bottom': this.isBackLink,
                combobox__action_top: this.position === 'top',
                combobox__action_bottom: this.position === 'bottom',
                combobox__action_disabled: this.disabled
            })
            .toString();
    }

    /**
     * String of true or false.
     * 
     * @type {string}
     */
    get computedAriaDisabled() {
        return normalizeAriaAttribute(this.disabled.toString());
    }
}
