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

import { SchedulerCellGroup } from 'c/schedulerUtils';

export default class AvonniSchedulerResource extends SchedulerCellGroup {
    constructor(props) {
        super(props);
        this.avatarSrc = props.avatarSrc;
        this.avatarFallbackIconName = props.avatarFallbackIconName;
        this.avatarInitials = props.avatarInitials;
        this.color = props.color;
        this.label = props.label;
        this.data = props.data;
        this.minHeight = 0;
        this.name = props.name;
        this._height = 0;
    }

    get height() {
        return this._height > this.minHeight ? this._height : this.minHeight;
    }
    set height(value) {
        this._height = value;
    }

    get avatar() {
        if (
            this.avatarFallbackIconName ||
            this.avatarInitials ||
            this.avatarSrc
        ) {
            return {
                src: this.avatarSrc,
                fallbackIconName: this.avatarFallbackIconName,
                initials: this.avatarInitials
            };
        }
        return null;
    }
}
