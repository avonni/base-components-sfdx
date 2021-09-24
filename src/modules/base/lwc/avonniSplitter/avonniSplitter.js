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

const SPLITTER_ORIENTATIONS = {
    valid: ['horizontal', 'vertical'],
    default: 'horizontal'
};

/**
 * @class
 * @descriptor avonni-splitter
 * @storyId example-splitter--base
 * @public
 */
export default class AvonniSplitter extends LightningElement {
    _orientation = SPLITTER_ORIENTATIONS.default;
    down = false;
    data;
    selectedSeparator;

    renderedCallback() {
        let splitter = this.template.querySelector(
            '.' + this.computedOrientationClass
        );
        let slot = this.template.querySelector('[data-element-id="slot-default"]');
        let slotElements = slot.assignedElements();

        if (slotElements.length > 0) {
            let amount = 1;
            let containerComponents = 0;
            let isSeparator = false;
            let isStatic = false;
            let separatorName = '';

            slotElements.forEach((element) => {
                if (element.localName.indexOf('-splitter-pane') > -1) {
                    containerComponents++;
                }
            });

            slotElements.forEach((element) => {
                const nextElement = element.nextSibling;

                if (element.localName.indexOf('-splitter-pane') > -1) {
                    element.classList.add('container');
                    element.classList.add('slot-' + amount);
                    element.setAttribute('slot-id', amount);
                    splitter.appendChild(element);

                    let resizable =
                        element.getAttribute('resizable') === 'true';
                    let collapsible =
                        element.getAttribute('collapsible') === 'true';
                    let collapsed =
                        element.getAttribute('collapsed') === 'true';

                    if (isSeparator) {
                        let previousSeparator = this.template.querySelector(
                            separatorName
                        );
                        if (
                            previousSeparator.lastChild.className ===
                                'separator-icon-horizontal' ||
                            previousSeparator.lastChild.className ===
                                'separator-icon-vertical'
                        ) {
                            isStatic = true;
                        }
                    }

                    if (collapsible && isSeparator) {
                        let previousSeparator = this.template.querySelector(
                            separatorName
                        );

                        if (
                            previousSeparator.getAttribute('is-colapsed') ===
                            'true'
                        ) {
                            let previousIndex =
                                previousSeparator.getAttribute('separator-id') -
                                1;
                            let leftSeparator = this.template.querySelector(
                                '.separator-' + previousIndex
                            );
                            if (leftSeparator) {
                                while (leftSeparator.firstChild) {
                                    leftSeparator.removeChild(
                                        leftSeparator.lastChild
                                    );
                                }

                                let leftIcon = document.createElement('div');
                                leftIcon.setAttribute(
                                    'c-splitter_splitter',
                                    ''
                                );
                                leftIcon.classList.add('left-colapsed');

                                leftIcon.addEventListener(
                                    'click',
                                    this.colapsedLeft.bind(this)
                                );

                                leftSeparator.appendChild(leftIcon);
                                leftSeparator.setAttribute(
                                    'is-left-colapsed',
                                    'true'
                                );
                            }
                        } else if (amount < containerComponents || !collapsed) {
                            let rightIcon = document.createElement('div');
                            rightIcon.setAttribute('c-splitter_splitter', '');
                            rightIcon.classList.add('right-colapsed');

                            rightIcon.addEventListener(
                                'click',
                                this.colapsedRight.bind(this)
                            );

                            previousSeparator.appendChild(rightIcon);
                        }

                        previousSeparator.setAttribute(
                            'is-right-colapsed',
                            'true'
                        );
                    }

                    if (
                        amount < containerComponents &&
                        (resizable || collapsible)
                    ) {
                        let separator = document.createElement('div');
                        separator.setAttribute('c-splitter_splitter', '');
                        separator.setAttribute('separator-id', amount);
                        separator.classList.add('separator-' + amount);
                        separatorName = '.separator-' + amount;
                        separator.classList.add(this.computedSeparatorClass);

                        if (collapsed) {
                            let rightIcon = document.createElement('div');
                            rightIcon.setAttribute('c-splitter_splitter', '');
                            rightIcon.classList.add('right-colapsed');

                            rightIcon.addEventListener(
                                'click',
                                this.openLeft.bind(this)
                            );

                            separator.appendChild(rightIcon);
                            separator.style.cursor = 'auto';
                            separator.setAttribute('is-colapsed', 'true');
                            separator.setAttribute('is-left-colapsed', 'true');

                            if (resizable) {
                                separator.setAttribute('is-resizable', 'true');
                            }
                        } else {
                            if (collapsible) {
                                let leftIcon = document.createElement('div');
                                leftIcon.setAttribute(
                                    'c-splitter_splitter',
                                    ''
                                );
                                leftIcon.classList.add('left-colapsed');

                                if (
                                    nextElement &&
                                    nextElement.getAttribute('collapsed') ===
                                        'true'
                                ) {
                                    leftIcon.addEventListener(
                                        'click',
                                        this.openRight.bind(this)
                                    );
                                    separator.style.cursor = 'auto';
                                } else {
                                    leftIcon.addEventListener(
                                        'click',
                                        this.colapsedLeft.bind(this)
                                    );
                                }

                                separator.appendChild(leftIcon);
                                separator.setAttribute(
                                    'is-left-colapsed',
                                    'true'
                                );
                            }

                            if (resizable) {
                                if (
                                    nextElement &&
                                    nextElement.getAttribute('collapsed') !==
                                        'true'
                                ) {
                                    let separatorIcon = document.createElement(
                                        'div'
                                    );
                                    separatorIcon.setAttribute(
                                        'c-splitter_splitter',
                                        ''
                                    );
                                    separatorIcon.classList.add(
                                        'separator-icon-' + this._orientation
                                    );
                                    separator.appendChild(separatorIcon);
                                }

                                separator.setAttribute('is-resizable', 'true');
                            } else {
                                separator.style.cursor = 'auto';
                            }
                            separator.setAttribute('is-colapsed', 'false');
                        }

                        separator.addEventListener(
                            'mousedown',
                            this.onMouseDown.bind(this)
                        );
                        splitter.appendChild(separator);
                        isSeparator = true;
                    } else if (amount < containerComponents) {
                        let line = document.createElement('div');
                        line.setAttribute('c-splitter_splitter', '');
                        line.classList.add('line-' + this.orientation);
                        splitter.appendChild(line);
                        isSeparator = false;
                        separatorName = '';
                    }

                    amount++;

                    if (element.getAttribute('size')) {
                        element.style.flexBasis = element.getAttribute('size');
                        element.classList.add('state-static');
                        element.setAttribute('is-static', 'true');
                    } else if (!resizable && !isStatic) {
                        element.classList.add('state-static');
                        element.setAttribute('is-static', 'true');
                    } else {
                        element.setAttribute('is-static', 'false');
                    }

                    if (element.getAttribute('collapsed') === 'true') {
                        if (this.orientation === 'vertical') {
                            element.classList.add('state-hidden-height');
                        } else {
                            element.classList.add('state-hidden-width');
                        }

                        if (element.getAttribute('collapsedSize')) {
                            if (this.orientation === 'vertical') {
                                element.style.maxHeight = element.getAttribute(
                                    'collapsedSize'
                                );
                            } else {
                                element.style.maxWidth = element.getAttribute(
                                    'collapsedSize'
                                );
                            }
                        }
                    }

                    if (element.getAttribute('scrollable') === 'false') {
                        element.style.overflow = 'hidden';
                    }

                    isStatic = false;
                }
            });
        }
        // slot.remove();

        this.template
            .querySelectorAll('.splitter-orientation-horizontal')
            .forEach((element) => {
                element.style.height = `${element.offsetHeight}px`;
            });

        this.listenerOnMouseUp = this.onMouseUp.bind(this);
        this.listenerOnMouseMove = this.onMouseMove.bind(this);

        window.addEventListener('mousemove', this.listenerOnMouseMove);
        window.addEventListener('mouseup', this.listenerOnMouseUp);
    }

    disconnectedCallback() {
        window.removeEventListener('mouseup', this.listenerOnMouseUp);
        window.removeEventListener('mousemove', this.listenerOnMouseMove);
    }

    /**
     * Specifies the orientation of the widget. Supported values are "horizontal" and "vertical".
     *
     * @type {string}
     * @public
     * @default horizontal
     */
    @api get orientation() {
        return this._orientation;
    }

    set orientation(orientation) {
        this._orientation = normalizeString(orientation, {
            fallbackValue: SPLITTER_ORIENTATIONS.default,
            validValues: SPLITTER_ORIENTATIONS.valid
        });
    }

    /**
     * Computed orientation class based on vertical or horizontal display.
     * 
     * @type {string}
     */
    get computedOrientationClass() {
        return this._orientation === 'vertical'
            ? 'splitter-orientation-vertical'
            : 'splitter-orientation-horizontal';
    }

    /**
     * Computed separator class based on vertical or horizontal display.
     * 
     * @type {string}
     */
    get computedSeparatorClass() {
        return this._orientation === 'vertical'
            ? 'separator-vertical'
            : 'separator-horizontal';
    }

    /**
     * On mouse down event method.
     *
     * @param {Event} event
     */
    onMouseDown(event) {
        let selectedSeparator = event.target;

        if (selectedSeparator.className.indexOf('icon') > -1) {
            selectedSeparator = selectedSeparator.parentNode;
        }

        let first = selectedSeparator.previousSibling;
        let second = selectedSeparator.nextSibling;
        this.selectedSeparator = selectedSeparator;

        this.data = {
            event,
            offsetLeft: selectedSeparator.offsetLeft,
            offsetTop: selectedSeparator.offsetTop,
            firstWidth: first.offsetWidth,
            firstHeight: first.offsetHeight,
            secondWidth: second.offsetWidth,
            secondHeight: second.offsetHeight
        };

        if (selectedSeparator.style.cursor !== 'auto') {
            this.down = true;
        }
    }

    /**
     * On mouse move event method.
     *
     * @param {Event} event
     */
    onMouseMove(event) {
        if (this.down) {
            let separator = this.selectedSeparator;
            let first = separator.previousSibling;
            let second = separator.nextSibling;

            let delta = {
                x: event.clientX - this.data.event.x,
                y: event.clientY - this.data.event.y
            };

            if (this.orientation === 'horizontal') {
                delta.x = Math.min(
                    Math.max(delta.x, -this.data.firstWidth),
                    this.data.secondWidth
                );

                let firstDelta = Number(this.data.firstWidth + delta.x);
                let secondDelta = Number(this.data.secondWidth - delta.x);

                let firstAvailable = this.validate(firstDelta, first);
                let secondAvailable = this.validate(secondDelta, second);
                let maxWidthValidation = firstDelta >= 0 && secondDelta >= 0;

                if (firstAvailable && secondAvailable && maxWidthValidation) {
                    separator.style.left =
                        this.data.offsetLeft + delta.x + 'px';

                    first.style.flexBasis = firstDelta + 'px';
                    first.classList.add('state-static');
                    first.setAttribute('is-static', 'true');

                    second.style.flexBasis = secondDelta + 'px';
                    second.classList.add('state-static');
                    second.setAttribute('is-static', 'true');
                }
            } else {
                delta.y = Math.min(
                    Math.max(delta.y, -this.data.firstHeight),
                    this.data.secondHeight
                );

                let firstDelta = Number(this.data.firstHeight + delta.y);
                let secondDelta = Number(this.data.secondHeight - delta.y);

                let firstAvailable = this.validate(firstDelta, first);
                let secondAvailable = this.validate(secondDelta, second);

                if (firstAvailable && secondAvailable) {
                    separator.style.top = this.data.offsetTop + delta.y + 'px';

                    first.style.flexBasis = firstDelta + 'px';
                    first.classList.add('state-static');
                    first.setAttribute('is-static', 'true');

                    second.style.flexBasis = secondDelta + 'px';
                    second.classList.add('state-static');
                    second.setAttribute('is-static', 'true');

                    this.querySelectorAll(
                        '.slot-' +
                            first.getAttribute('slot-id') +
                            ' .horizontal'
                    ).forEach((element) => {
                        element.changeHeight(firstDelta);
                    });
                    this.querySelectorAll(
                        '.slot-' +
                            second.getAttribute('slot-id') +
                            ' .horizontal'
                    ).forEach((element) => {
                        element.changeHeight(secondDelta);
                    });
                }
            }
        }
    }

    /**
     * On mouse up method.
     */
    onMouseUp() {
        this.down = false;
    }

    /**
     * Validate size constraints.
     *
     * @param {number} delta
     * @param {Element} element
     * @returns {boolean} valide
     */
    validate(delta, element) {
        let valide = true;
        let min = element.getAttribute('min');
        let max = element.getAttribute('max');
        let parentSize =
            this.orientation === 'horizontal'
                ? element.parentNode.offsetWidth
                : element.parentNode.offsetHeight;

        if (min) {
            if (min.indexOf('%') > 0) {
                let minSize = Number(min.replace('%', ''));
                let minContainerSize = (parentSize * minSize) / 100;
                valide = delta >= minContainerSize;
            }

            if (min.indexOf('px') > 0) {
                let minSize = Number(min.replace('px', ''));
                valide = delta >= minSize;
            }
        }

        if (max && valide) {
            if (max.indexOf('%') > 0) {
                let maxSize = Number(max.replace('%', ''));
                let maxContainerSize = (parentSize * maxSize) / 100;
                valide = delta <= maxContainerSize;
            }

            if (max.indexOf('px') > 0) {
                let maxSize = Number(max.replace('px', ''));
                valide = delta <= maxSize;
            }
        }

        return valide;
    }

    /**
     * Splitter elements collapsed left.
     */
    colapsedLeft() {
        let parent = this.selectedSeparator.parentNode;
        let rightElement = parent.nextSibling;
        let leftElement = parent.previousSibling;
        let leftSeparator = leftElement.previousSibling;

        if (leftElement.getAttribute('resizable') === 'true') {
            rightElement.classList.remove('state-static');
        }

        if (this.orientation === 'vertical') {
            leftElement.classList.add('state-hidden-height');
        } else {
            leftElement.classList.add('state-hidden-width');
        }

        if (leftElement.getAttribute('collapsedSize')) {
            if (this.orientation === 'vertical') {
                leftElement.style.maxHeight = leftElement.getAttribute(
                    'collapsedSize'
                );
            } else {
                leftElement.style.maxWidth = leftElement.getAttribute(
                    'collapsedSize'
                );
            }
        }

        parent.setAttribute('is-colapsed', 'true');

        while (parent.firstChild) {
            parent.removeChild(parent.lastChild);
        }

        let rightIcon = document.createElement('div');
        rightIcon.setAttribute('c-splitter_splitter', '');
        rightIcon.classList.add('right-colapsed');

        rightIcon.addEventListener('click', this.openLeft.bind(this));

        parent.appendChild(rightIcon);
        parent.style.cursor = 'auto';

        if (
            leftSeparator &&
            leftSeparator.getAttribute('is-colapsed') === 'false'
        ) {
            let needLeftColapsed = false;

            while (leftSeparator.firstChild) {
                if (leftSeparator.lastChild.classList[0] === 'left-colapsed') {
                    needLeftColapsed = true;
                }
                leftSeparator.removeChild(leftSeparator.lastChild);
            }

            if (needLeftColapsed) {
                let leftIcon = document.createElement('div');
                leftIcon.setAttribute('c-splitter_splitter', '');
                leftIcon.classList.add('left-colapsed');

                leftIcon.addEventListener(
                    'click',
                    this.colapsedLeft.bind(this)
                );

                leftSeparator.appendChild(leftIcon);
                leftSeparator.style.cursor = 'auto';
            }
        }
    }

    /**
     * Splitter elements collapsed right.
     */
    colapsedRight() {
        let parent = this.selectedSeparator.parentNode;
        let rightElement = parent.nextSibling;
        let leftElement = parent.previousSibling;
        let rightSeparator = rightElement.nextSibling;

        if (leftElement.getAttribute('resizable') === 'true') {
            leftElement.classList.remove('state-static');
        }

        if (this.orientation === 'vertical') {
            rightElement.classList.add('state-hidden-height');
        } else {
            rightElement.classList.add('state-hidden-width');
        }

        if (rightElement.getAttribute('collapsedSize')) {
            if (this.orientation === 'vertical') {
                rightElement.style.maxHeight = rightElement.getAttribute(
                    'collapsedSize'
                );
            } else {
                rightElement.style.maxWidth = rightElement.getAttribute(
                    'collapsedSize'
                );
            }
        }

        parent.setAttribute('is-colapsed', 'true');

        while (parent.firstChild) {
            parent.removeChild(parent.lastChild);
        }

        let leftIcon = document.createElement('div');
        leftIcon.setAttribute('c-splitter_splitter', '');
        leftIcon.classList.add('left-colapsed');

        leftIcon.addEventListener('click', this.openRight.bind(this));

        parent.appendChild(leftIcon);
        parent.style.cursor = 'auto';

        if (
            rightSeparator &&
            rightSeparator.getAttribute('is-colapsed') === 'false'
        ) {
            let needRightColapsed = false;

            while (rightSeparator.firstChild) {
                if (
                    rightSeparator.lastChild.classList[0] === 'right-colapsed'
                ) {
                    needRightColapsed = true;
                }
                rightSeparator.removeChild(rightSeparator.lastChild);
            }

            if (needRightColapsed) {
                let rightIcon = document.createElement('div');
                rightIcon.setAttribute('c-splitter_splitter', '');
                rightIcon.classList.add('right-colapsed');

                rightIcon.addEventListener(
                    'click',
                    this.colapsedRight.bind(this)
                );

                rightSeparator.appendChild(rightIcon);
                rightSeparator.style.cursor = 'auto';
            }
        }
    }

    /**
     * Open splitter panel from left.
     */
    openLeft() {
        let parent = this.selectedSeparator.parentNode;
        let leftElement = parent.previousSibling;
        let rightElement = parent.nextSibling;
        let leftSeparator = leftElement.previousSibling;
        let rightSeparator = rightElement.nextSibling;

        if (
            (rightElement.getAttribute('is-static') === 'true' &&
                !rightSeparator) ||
            (rightElement.getAttribute('is-static') === 'true' &&
                rightSeparator &&
                rightSeparator.getAttribute('is-colapsed') === 'false')
        ) {
            rightElement.classList.add('state-static');
        }

        if (this.orientation === 'vertical') {
            leftElement.classList.remove('state-hidden-height');
        } else {
            leftElement.classList.remove('state-hidden-width');
        }

        if (leftElement.getAttribute('collapsedSize')) {
            if (this.orientation === 'vertical') {
                leftElement.style.maxHeight = 'none';
            } else {
                leftElement.style.maxWidth = 'none';
            }
        }

        parent.setAttribute('is-colapsed', 'false');

        while (parent.firstChild) {
            parent.removeChild(parent.lastChild);
        }

        let renderButtons = false;

        if (rightSeparator && rightSeparator.className.indexOf('line') === -1) {
            if (
                rightSeparator.getAttribute('is-colapsed') === 'false' ||
                rightElement.className.indexOf('state-hidden') === -1
            ) {
                renderButtons = true;
            }
        } else {
            renderButtons = true;
        }

        if (parent.getAttribute('is-left-colapsed') === 'true') {
            let leftIcon = document.createElement('div');
            leftIcon.setAttribute('c-splitter_splitter', '');
            leftIcon.classList.add('left-colapsed');

            leftIcon.addEventListener('click', this.colapsedLeft.bind(this));

            parent.appendChild(leftIcon);
        }

        if (renderButtons) {
            if (parent.getAttribute('is-resizable') === 'true') {
                parent.style.cursor =
                    this.orientation === 'horizontal'
                        ? 'col-resize'
                        : 'row-resize';

                let separatorIcon = document.createElement('div');
                separatorIcon.setAttribute('c-splitter_splitter', '');
                separatorIcon.classList.add(
                    'separator-icon-' + this._orientation
                );
                parent.appendChild(separatorIcon);
            }

            if (parent.getAttribute('is-right-colapsed') === 'true') {
                let rightIcon = document.createElement('div');
                rightIcon.setAttribute('c-splitter_splitter', '');
                rightIcon.classList.add('right-colapsed');

                rightIcon.addEventListener(
                    'click',
                    this.colapsedRight.bind(this)
                );

                parent.appendChild(rightIcon);
            }
        }

        if (
            leftSeparator &&
            leftSeparator.getAttribute('is-colapsed') === 'false'
        ) {
            while (leftSeparator.firstChild) {
                leftSeparator.removeChild(leftSeparator.lastChild);
            }

            if (leftSeparator.getAttribute('is-left-colapsed') === 'true') {
                let leftIcon = document.createElement('div');
                leftIcon.setAttribute('c-splitter_splitter', '');
                leftIcon.classList.add('left-colapsed');

                leftIcon.addEventListener(
                    'click',
                    this.colapsedLeft.bind(this)
                );

                leftSeparator.appendChild(leftIcon);
            }

            if (leftSeparator.getAttribute('is-resizable') === 'true') {
                leftSeparator.style.cursor =
                    this.orientation === 'horizontal'
                        ? 'col-resize'
                        : 'row-resize';

                let separatorIcon = document.createElement('div');
                separatorIcon.setAttribute('c-splitter_splitter', '');
                separatorIcon.classList.add(
                    'separator-icon-' + this._orientation
                );
                leftSeparator.appendChild(separatorIcon);
            }

            if (leftSeparator.getAttribute('is-right-colapsed') === 'true') {
                let rightIcon = document.createElement('div');
                rightIcon.setAttribute('c-splitter_splitter', '');
                rightIcon.classList.add('right-colapsed');

                rightIcon.addEventListener(
                    'click',
                    this.colapsedRight.bind(this)
                );

                leftSeparator.appendChild(rightIcon);
            }
        }
    }

    /**
     * Open splitter panel from right.
     */
    openRight() {
        let parent = this.selectedSeparator.parentNode;
        let rightElement = parent.nextSibling;
        let leftElement = parent.previousSibling;
        let rightSeparator = rightElement.nextSibling;
        let leftSeparator = leftElement.previousSibling;

        if (
            (leftElement.getAttribute('is-static') === 'true' &&
                !leftSeparator) ||
            (leftElement.getAttribute('is-static') === 'true' &&
                leftSeparator &&
                leftSeparator.getAttribute('is-colapsed') === 'false')
        ) {
            leftElement.classList.add('state-static');
        }

        if (this.orientation === 'vertical') {
            rightElement.classList.remove('state-hidden-height');
        } else {
            rightElement.classList.remove('state-hidden-width');
        }

        if (rightElement.getAttribute('collapsedSize')) {
            if (this.orientation === 'vertical') {
                rightElement.style.maxHeight = 'none';
            } else {
                rightElement.style.maxWidth = 'none';
            }
        }

        parent.setAttribute('is-colapsed', 'false');

        while (parent.firstChild) {
            parent.removeChild(parent.lastChild);
        }

        let renderButtons = false;

        if (leftSeparator && leftSeparator.className.indexOf('line') === -1) {
            if (
                leftSeparator.getAttribute('is-colapsed') === 'false' ||
                leftElement.className.indexOf('state-hidden') === -1
            ) {
                renderButtons = true;
            }
        } else {
            renderButtons = true;
        }

        if (renderButtons) {
            if (parent.getAttribute('is-left-colapsed') === 'true') {
                let leftIcon = document.createElement('div');
                leftIcon.setAttribute('c-splitter_splitter', '');
                leftIcon.classList.add('left-colapsed');

                leftIcon.addEventListener(
                    'click',
                    this.colapsedLeft.bind(this)
                );

                parent.appendChild(leftIcon);
            }

            if (parent.getAttribute('is-resizable') === 'true') {
                parent.style.cursor =
                    this.orientation === 'horizontal'
                        ? 'col-resize'
                        : 'row-resize';

                let separatorIcon = document.createElement('div');
                separatorIcon.setAttribute('c-splitter_splitter', '');
                separatorIcon.classList.add(
                    'separator-icon-' + this._orientation
                );
                parent.appendChild(separatorIcon);
            }
        }

        if (parent.getAttribute('is-right-colapsed') === 'true') {
            let rightIcon = document.createElement('div');
            rightIcon.setAttribute('c-splitter_splitter', '');
            rightIcon.classList.add('right-colapsed');

            rightIcon.addEventListener('click', this.colapsedRight.bind(this));

            parent.appendChild(rightIcon);
        }

        if (
            rightSeparator &&
            rightSeparator.getAttribute('is-colapsed') === 'false'
        ) {
            while (rightSeparator.firstChild) {
                rightSeparator.removeChild(rightSeparator.lastChild);
            }

            if (rightSeparator.getAttribute('is-left-colapsed') === 'true') {
                let leftIcon = document.createElement('div');
                leftIcon.setAttribute('c-splitter_splitter', '');
                leftIcon.classList.add('left-colapsed');

                leftIcon.addEventListener(
                    'click',
                    this.colapsedLeft.bind(this)
                );

                rightSeparator.appendChild(leftIcon);
            }

            if (rightSeparator.getAttribute('is-resizable') === 'true') {
                rightSeparator.style.cursor =
                    this.orientation === 'horizontal'
                        ? 'col-resize'
                        : 'row-resize';

                let separatorIcon = document.createElement('div');
                separatorIcon.setAttribute('c-splitter_splitter', '');
                separatorIcon.classList.add(
                    'separator-icon-' + this._orientation
                );
                rightSeparator.appendChild(separatorIcon);
            }

            if (rightSeparator.getAttribute('is-right-colapsed') === 'true') {
                let rightIcon = document.createElement('div');
                rightIcon.setAttribute('c-splitter_splitter', '');
                rightIcon.classList.add('right-colapsed');

                rightIcon.addEventListener(
                    'click',
                    this.colapsedRight.bind(this)
                );

                rightSeparator.appendChild(rightIcon);
            }
        }
    }

    /**
     * Change horizontal container height.
     *
     * @param {number} height
     * @public
     */
    @api
    changeHeight(height) {
        let horizontalContainer = this.template.querySelector(
            '.splitter-orientation-horizontal'
        );

        if (horizontalContainer) {
            horizontalContainer.style.height = height + 'px';
        }
    }
}
