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
import pageHeader from './avonniPageHeader.html';
import pageHeaderVertical from './avonniPageHeaderVertical.html';
import { computeSldsClass } from 'c/iconUtils';

const PAGE_HEADER_VARIANTS = {
    valid: ['base', 'object-home', 'record-home', 'record-home-vertical'],
    default: 'base'
};

export default class AvonniPageHeader extends LightningElement {
    @api iconName;
    @api label;
    @api title;
    @api info;

    _variant = PAGE_HEADER_VARIANTS.default;
    showTitle = true;
    showLabel = true;
    showActions = true;
    showDetails = true;
    showInfo = true;
    showControls = true;

    render() {
        if (this._variant === 'record-home-vertical') {
            return pageHeaderVertical;
        }
        return pageHeader;
    }

    renderedCallback() {
        if (this.titleSlot) {
            this.showTitle = this.titleSlot.assignedElements().length !== 0;
        }
        if (this.labelSlot) {
            this.showLabel = this.labelSlot.assignedElements().length !== 0;
        }
        if (this.actionsSlot) {
            this.showActions = this.actionsSlot.assignedElements().length !== 0;
        }
        if (this.detailsSlot) {
            this.showDetails = this.detailsSlot.assignedElements().length !== 0;
        }
        if (this.infoSlot) {
            this.showInfo = this.infoSlot.assignedElements().length !== 0;
        }
        if (this.controlsSlot) {
            this.showControls =
                this.controlsSlot.assignedElements().length !== 0;
        }
    }

    get titleSlot() {
        return this.template.querySelector('slot[name=title]');
    }

    get labelSlot() {
        return this.template.querySelector('slot[name=label]');
    }

    get actionsSlot() {
        return this.template.querySelector('slot[name=actions]');
    }

    get detailsSlot() {
        return this.template.querySelector('slot[name=details]');
    }

    get infoSlot() {
        return this.template.querySelector('slot[name=info]');
    }

    get controlsSlot() {
        return this.template.querySelector('slot[name=controls]');
    }

    @api
    get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: PAGE_HEADER_VARIANTS.default,
            validValues: PAGE_HEADER_VARIANTS.valid
        });
    }

    get computedOuterClass() {
        return classSet('slds-page-header')
            .add({
                'slds-page-header_object-home': this._variant === 'object-home',
                'slds-page-header_record-home': this._variant === 'record-home'
            })
            .toString();
    }

    get computedIconClass() {
        return classSet('slds-icon_container slds-show_small')
            .add(computeSldsClass(this.iconName))
            .toString();
    }

    get computedMobileIconClass() {
        return classSet('slds-icon_container slds-hide_small')
            .add(computeSldsClass(this.iconName))
            .toString();
    }

    get isBaseVariant() {
        return this._variant === 'base';
    }

    get isObjectHomeVariant() {
        return this._variant === 'object-home';
    }

    get isRecordHomeVariant() {
        return this._variant === 'record-home';
    }

    get hasStringTitle() {
        return !!this.title;
    }

    get hasStringLabel() {
        return !!this.label;
    }

    get hasStringInfo() {
        return !!this.info;
    }

    get showActionsOrDetails() {
        return this.showActions || this.showDetails;
    }
}
