/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { duration, displayDuration } from '../localizationService';
const MINUTE_MILLISECONDS = 1000 * 60;

export function relativeFormat() {
    return {
        format: (value) => {
            const now = Date.now();
            const timestamp = Number(value);

            if (!isFinite(timestamp)) {
                throw new Error(
                    `RelativeFormat: The value attribute accepts either a Date object or a timestamp, but we are getting the ${typeof value} value "${value}" instead.`
                );
            }

            const getDiffInMinutes = (timestamp - now) / MINUTE_MILLISECONDS;
            const durationData = duration(getDiffInMinutes, 'minutes');
            return displayDuration(durationData, true);
        }
    };
}
