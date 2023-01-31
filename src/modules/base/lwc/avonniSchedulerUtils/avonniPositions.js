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

import {
    CELL_SELECTOR,
    MONTH_DAY_LABEL_HEIGHT,
    MONTH_EVENT_HEIGHT
} from './avonniDefaults';

/**
 * Find an HTML element from its position on the horizontal axis.
 *
 * @param {HTMLElement} parentElement The parent element the element should be searched in.
 * @param {number} x The position of the element on the horizontal axis.
 * @param {string} selector The query selector used to find the element.
 * @returns {HTMLElement|undefined} The found element, or undefined if not found.
 */
export function getElementOnXAxis(parentElement, x, selector = CELL_SELECTOR) {
    const elements = Array.from(parentElement.querySelectorAll(selector));
    return elements.find((div, index) => {
        const divPosition = div.getBoundingClientRect();
        const start = divPosition.left;
        const end = divPosition.right;

        const isFirstElement = index === 0;
        const isLastElement = index === elements.length - 1;
        const isBeforeFirstElement = isFirstElement && start >= x;
        const isAfterLastElement = isLastElement && x >= end;
        const isInCell = x >= start && x < end;
        return isBeforeFirstElement || isAfterLastElement || isInCell;
    });
}

/**
 * Find an HTML element from its position on the vertical axis.
 *
 * @param {HTMLElement} parentElement The parent element the element should be searched in.
 * @param {number} y The position of the element on the vertical axis.
 * @param {string} selector The query selector used to find the element.
 * @returns {HTMLElement|undefined} The found element, or undefined if not found.
 */
export function getElementOnYAxis(parentElement, y, selector = CELL_SELECTOR) {
    const elements = Array.from(parentElement.querySelectorAll(selector));
    return elements.find((div, index) => {
        const divPosition = div.getBoundingClientRect();
        const start = divPosition.top;
        const end = divPosition.bottom;

        const isFirstElement = index === 0;
        const isLastElement = index === elements.length - 1;
        const isBeforeFirstElement = isFirstElement && start >= y;
        const isAfterLastElement = isLastElement && y >= end;
        const isInElement = y >= start && y < end;
        return isBeforeFirstElement || isAfterLastElement || isInElement;
    });
}

/**
 * Get the total number of event occurrences that overlap one.
 *
 * @param {object[]} previousOccurrences The computed occurrences that appear before the current one.
 * @param {number} startPosition Start position of the evaluated occurrence, on the X axis (horizontal variant) or the Y axis (vertical variant).
 * @param {number} minOverlap Minimum overlapped occurrences. This number correspond to the occurrence level + 1.
 * @returns {number} The total number of occurrences overlapping, including the one evaluated.
 */
function getTotalOfOccurrencesOverlapping(
    previousOccurrences,
    startPosition,
    minOverlap
) {
    let numberOfOverlap = minOverlap;

    const overlappingOccurrences = previousOccurrences.filter((occ) => {
        return startPosition < occ.end;
    });

    overlappingOccurrences.forEach((occ) => {
        if (occ.numberOfOverlap >= numberOfOverlap) {
            numberOfOverlap = occ.numberOfOverlap;
        } else {
            // Update the total of levels of the overlapped event occurrence
            occ.numberOfOverlap = numberOfOverlap;
            numberOfOverlap = getTotalOfOccurrencesOverlapping(
                previousOccurrences,
                occ.start,
                numberOfOverlap
            );
        }
    });

    return numberOfOverlap;
}

/**
 * Find the level an occurrence should have to not overlap another occurrence.
 *
 * @param {boolean} isVertical If true, the occurrences levels are horizontal, instead of vertical. The number of overlapped occurrences should be computed, to be able to set the width of the occurrence.
 * @param {object[]} previousOccurrences Array of previous occurrences for which the level has already been computed.
 * @param {number} startPosition Start position of the evaluated occurrence, on the X axis (horizontal) or the Y axis (vertical).
 * @param {number} level Level of the occurrence in their cell group. It starts at 0, so the occurrence is at the top (horizontal) or the left (vertical) of its group.
 * @returns {object} Object with two keys:
 * * level (number): level of the event occurrence in the cell group.
 * * numberOfOverlap (number): Total of occurrences overlapping, including the evaluated one.
 */
function computeEventLevelInCellGroup(
    isVertical,
    previousOccurrences,
    startPosition,
    level = 0
) {
    // Find the last event with the same level
    const sameLevelEvent = previousOccurrences.find((occ) => {
        return occ.level === level && !occ.occurrence.overflowsCell;
    });

    const overlapsEvent = sameLevelEvent && startPosition < sameLevelEvent.end;
    if (overlapsEvent) {
        level += 1;

        // Make sure there isn't another event at the same position
        level = computeEventLevelInCellGroup(
            isVertical,
            previousOccurrences,
            startPosition,
            level
        ).level;
    }

    let numberOfOverlap = level + 1;
    if (isVertical) {
        numberOfOverlap = getTotalOfOccurrencesOverlapping(
            previousOccurrences,
            startPosition,
            numberOfOverlap
        );
    }

    return { level, numberOfOverlap };
}

/**
 * Position a popover in the viewport.
 *
 * @param {HTMLElement} popover HTML element of the popover.
 * @param {object} position Position of the popover. Valid keys are x and y.
 * @param {boolean} horizontalCenter If true, the popover should be centered horizontally.
 */
export function positionPopover(bounds, popover, { x, y }, horizontalCenter) {
    // Make sure the popover is not outside of the screen
    const height = popover.offsetHeight;
    const width = popover.offsetWidth;
    const popoverBottom = y + height;
    const popoverRight = x + width;
    const { left, top, right } = bounds;

    const bottomView = window.innerHeight;
    const yTransform = popoverBottom > bottomView ? (height + 10) * -1 : 10;

    let xTransform = 10;
    if (popoverRight > right) {
        xTransform = (width + 10) * -1;
    } else if (horizontalCenter) {
        xTransform = (width / 2) * -1;
    }

    // The context menu is in fixed position by default,
    // to prevent a scroll jump when appearing
    popover.classList.remove('slds-is-fixed');
    popover.classList.add('slds-is-absolute');

    popover.style.transform = `translate(${xTransform}px, ${yTransform}px)`;
    popover.style.top = `${y - top}px`;
    popover.style.left = `${x - left}px`;
}

/**
 * Prevent the events from overlapping. In the horizontal view, compute the vertical position of the events and the rows height. In the vertical view, compute the horizontal position of the events.
 * @param {HTMLElement[]} occurrenceElements Array of HTML elements of the occurrences.
 * @param {boolean} isVertical If true, the view is vertical.
 * @param {number} cellSize Cell size used to determine if the occurrence should be hidden in the calendar month view, and to compute the offset of the occurrence in the vertical view.
 * @param {boolean} isCalendarMonth If true, the view is the calendar month view.
 */
export function updateOccurrencesOffset({
    occurrenceElements,
    isVertical,
    cellSize = this.cellWidth,
    isCalendarMonth
}) {
    let rowHeight = 0;
    let levelHeight = 0;

    // Sort the occurrences by ascending start date
    occurrenceElements.sort((a, b) => a.from - b.from);

    // Compute the level of the occurrences in the resource
    const previousOccurrences = [];
    occurrenceElements.forEach((occElement) => {
        occElement.updatePosition();
        const isPlaceholder = occElement.dataset.isPlaceholder;
        const occurrence = occElement.occurrence;
        const isVisiblePlaceholder = occElement.dataset.columnIndex === '0';
        const start = occElement.startPosition;

        let level = 0;
        let numberOfOverlap = 0;

        if (isCalendarMonth && isPlaceholder && !isVisiblePlaceholder) {
            // Do not change the level of the original occurrence
            // if the current occurrence is a placeholder
            // placed in a subsequent month cell
            level = occurrence.level;
        } else {
            const position = computeEventLevelInCellGroup(
                isVertical,
                previousOccurrences,
                start
            );
            level = position.level;
            numberOfOverlap = position.numberOfOverlap;
        }

        if (isCalendarMonth && (!isPlaceholder || isVisiblePlaceholder)) {
            occurrence.level = level;

            // If the current occurrence is overflowing the cell height,
            // it will only be displayed in the "show more" popover
            const availableHeight = cellSize / (level + 2);
            occurrence.overflowsCell = availableHeight < MONTH_EVENT_HEIGHT;
        }

        // Remove any previous display: none,
        // to make sure the occElement.endPosition is right
        occElement.style.display = null;

        const selection = this._eventData.selection;
        previousOccurrences.unshift({
            level,
            numberOfOverlap,
            start,
            end: occElement.endPosition,
            isHidden: isPlaceholder && !isVisiblePlaceholder,
            occurrence: occurrence || (selection && selection.occurrence),
            width: occElement.width
        });

        if (!isVertical && !occurrence.overflowsCell) {
            // If the occurrence is taller than the previous ones,
            // update the default level height
            const height = occElement.getBoundingClientRect().height;
            if (height > levelHeight) {
                levelHeight = height;
            }
        }
    });

    // Add the corresponding offset to the top (horizontal display)
    // or left (vertical display) of the occurrences
    for (let i = 0; i < previousOccurrences.length; i++) {
        const { level, occurrence, numberOfOverlap, width, isHidden } =
            previousOccurrences[i];
        if (isHidden) {
            continue;
        }
        let offsetSide = isCalendarMonth ? MONTH_DAY_LABEL_HEIGHT : 0;

        if (isVertical) {
            offsetSide += (level * cellSize) / numberOfOverlap;
            occurrence.numberOfEventsInThisTimeFrame = numberOfOverlap;
            occurrence.right = offsetSide + width;
            this._updateOccurrencesLength = true;
        } else {
            offsetSide += level * levelHeight;
            occurrence.numberOfEventsInThisTimeFrame = null;

            // If the occurrence offset is bigger than the previous occurrences,
            // update the row height
            const totalHeight = levelHeight + offsetSide;
            if (totalHeight > rowHeight) {
                rowHeight = totalHeight;
            }
        }
        occurrence.offsetSide = offsetSide;
    }

    if (!isVertical) {
        // Add 10 pixels to the row for padding
        return rowHeight + 10;
    }
    return 0;
}

/**
 * Update the event occurrences height, width and position.
 */
export function updateOccurrencesPosition() {
    const eventOccurrences = this.template.querySelectorAll(
        '[data-element-id^="avonni-primitive-scheduler-event-occurrence"]'
    );
    eventOccurrences.forEach((occurrence) => {
        if (this._updateOccurrencesLength) {
            occurrence.updateLength();
        }
        if (occurrence.disabled) {
            occurrence.updateThickness();
        }
        occurrence.updatePosition();
    });
    this._updateOccurrencesLength = false;
}
