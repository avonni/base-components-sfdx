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

import { AutoPosition, Direction } from 'c/positionLibrary';
import { guid, normalizeAriaAttribute, normalizeString } from 'c/utilsPrivate';
import { classSet } from 'c/utils';

export { Direction } from 'c/positionLibrary';

const DEFAULT_ALIGN = {
    horizontal: 'left',
    vertical: 'bottom'
};

const BUBBLE_ID = `salesforce-lightning-tooltip-bubble_${guid()}`;

function isResizeObserverSupported() {
    return window.ResizeObserver != null;
}

function buildResizeObserver(callback) {
    if (isResizeObserverSupported()) {
        return new ResizeObserver(callback);
    }
    return {
        observe() {},

        unobserve() {}
    };
}
/**
 * Shared instance of a primitive bubble used as a tooltip by most components. This was originally
 * defined in the helptext component which is where the minWidth style came from.
 * TODO: We may want to revisit the minWidth style with the PO and/or UX.
 */
let CACHED_BUBBLE_ELEMENT;
let CONTENT;
let ALIGN = {};

function getCachedBubbleElement() {
    if (!CACHED_BUBBLE_ELEMENT) {
        CACHED_BUBBLE_ELEMENT = document.createElement(
            'avonni-primitive-bubble'
        );
        CACHED_BUBBLE_ELEMENT.setAttribute('id', BUBBLE_ID);
        CACHED_BUBBLE_ELEMENT.setAttribute('role', 'tooltip');
        CACHED_BUBBLE_ELEMENT.style.position = 'absolute';
        CACHED_BUBBLE_ELEMENT.style.minWidth = 'fit-content';

        CACHED_BUBBLE_ELEMENT.classList.add('slds-hide');
        CACHED_BUBBLE_ELEMENT.addEventListener('transitionend', () => {
            if (!CACHED_BUBBLE_ELEMENT.visible) {
                CACHED_BUBBLE_ELEMENT.classList.add('slds-hide');
            }
        });

        CONTENT = document.createElement('div');
        CONTENT.classList.add('slds-popover__body');
        CONTENT.addEventListener('mouseleave', () => {
            handleMouseLeave();
        });

        CACHED_BUBBLE_ELEMENT.appendChild(CONTENT);
    }

    return CACHED_BUBBLE_ELEMENT;
}

function handleMouseLeave() {
    CACHED_BUBBLE_ELEMENT.visible = false;
}

function updateClassList(align) {
    const tooltip = getCachedBubbleElement();
    const classes = classSet('slds-popover').add('slds-popover_tooltip');

    // show or hide bubble
    classes.add({
        'slds-rise-from-ground': CACHED_BUBBLE_ELEMENT.visible,
        'slds-fall-into-ground': !CACHED_BUBBLE_ELEMENT.visible
    });

    // apply the proper nubbin CSS class
    const { horizontal, vertical } = align;
    classes.add({
        'slds-nubbin_top-left': horizontal === 'left' && vertical === 'top',
        'slds-nubbin_top-right': horizontal === 'right' && vertical === 'top',
        'slds-nubbin_bottom-left':
            horizontal === 'left' && vertical === 'bottom',
        'slds-nubbin_bottom-right':
            horizontal === 'right' && vertical === 'bottom',
        'slds-nubbin_bottom': horizontal === 'center' && vertical === 'bottom',
        'slds-nubbin_top': horizontal === 'center' && vertical === 'top',
        'slds-nubbin_left': horizontal === 'left' && vertical === 'center',
        'slds-nubbin_right': horizontal === 'right' && vertical === 'center'
    });

    Object.keys(classes).forEach((key) => {
        if (typeof key === 'string' && key.length) {
            if (classes[key]) {
                tooltip.classList.add(key);
            } else {
                tooltip.classList.remove(key);
            }
        }
    });
}

const ARIA_DESCRIBEDBY = 'aria-describedby';

/**
 * Used as a position offset to compensate for the nubbin. The dimensions of the nubbin are not
 * included in the position library bounding box calculations. This is the size in pixels of the
 * nubbin.
 * TODO: We may want to measure this instead in cases it changes.
 */
const NUBBIN_SIZE = 16;

/**
 * Used in the calculation that moves the tooltip to a location that places the nubbin at the
 * center of the target element. This is the nubbin offset from the edge of the bubble in pixels
 * when using slds-nubbin_bottom-left or slds-nubbin_bottom-right.
 * TODO: We may want to measure this instead in case it changes.
 */
const NUBBIN_OFFSET = 24;

/**
 * Known tooltip types:
 * - info: used in cases where target already has click handlers such as button-icon
 * - toggle: used in cases where target only shows a tooltip such as helptext
 */
export const TooltipType = {
    Info: 'info',
    Toggle: 'toggle'
};

/**
 * Allows us to attach a tooltip to components. Typical usage is as follows:
 * - Create an instance of Tooltip
 * - Call Tooltip.initialize() to add the appropriate listeners to the element that needs a tooltip
 * See buttonIcon and buttonMenu for example usage.
 */
export class Tooltip {
    _autoPosition = null;
    _disabled = true;
    _initialized = false;
    _visible = false;

    _config = {};

    /**
     * A shared instance of primitiveBubble is used when an element is not specified in the config
     * object.
     * @param {string} value the content of the tooltip
     * @param {object} config specifies the root component, target element of the tooltip
     */
    constructor(value, config) {
        if (!config.target) {
            console.warn('target for tooltip is undefined or missing');
        }

        this.value = value;

        this._root = config.root;
        this._target = config.target;

        this._config = { ...config };
        this._config.align = config.align || {};
        this._config.targetAlign = config.targetAlign || {};

        this._type = normalizeString(config.type, {
            fallbackValue: TooltipType.Info,
            validValues: Object.values(TooltipType)
        });

        // If a tooltip element is not given, fall back on the globally shared instance.
        this._element = config.element;
        if (!this._element) {
            this._element = getCachedBubbleElement;
            updateClassList(DEFAULT_ALIGN);
            const bubbleElement = getCachedBubbleElement();
            if (bubbleElement.parentNode === null) {
                document.body.appendChild(bubbleElement);
            }
        }
        this.handleDocumentTouch = this.handleDocumentTouch.bind(this);
    }

    /**
     * Disables the tooltip.
     */
    detach() {
        this._disabled = true;
    }

    /**
     * Enables the tooltip.
     */
    attach() {
        this._disabled = false;
    }

    /**
     * Adds the appropriate event listeners to the target element to make the tooltip appear. Also
     * links the tooltip and target element via the aria-describedby attribute for screen readers.
     */
    initialize() {
        const target = this._target();
        if (!this._initialized && target) {
            switch (this._type) {
                case TooltipType.Toggle:
                    this.addToggleListeners();
                    break;
                case TooltipType.Info:
                default:
                    this.addInfoListeners();
                    break;
            }
            const ariaDescribedBy = normalizeAriaAttribute([
                target.getAttribute(ARIA_DESCRIBEDBY),
                this._element().id
            ]);
            target.setAttribute(ARIA_DESCRIBEDBY, ariaDescribedBy);

            this._initialized = true;
        }
    }

    addInfoListeners() {
        const target = this._target();
        if (!this._initialized && target) {
            ['mouseenter', 'focus'].forEach((name) =>
                target.addEventListener(name, () => this.show())
            );
            // Unlike the tooltip in Aura, we want clicks and keys to dismiss the tooltip.
            ['mouseleave', 'blur', 'click', 'keydown'].forEach((name) =>
                target.addEventListener(name, (event) =>
                    this.hideIfNotSelfCover(event)
                )
            );
        }
    }

    hideIfNotSelfCover(event) {
        if (event.type === 'mouseleave' && event.clientX && event.clientY) {
            // In any chance, if mouseleave is caused by tooltip itself, it would means
            // tooltip cover the target which mostly caused by dynamic resize of tooltip by CSS or JS.
            try {
                const elementMouseIsOver = document.elementFromPoint
                    ? document.elementFromPoint(event.clientX, event.clientY)
                    : null;
                if (elementMouseIsOver === this._element()) {
                    if (!isResizeObserverSupported()) {
                        this.startPositioning();
                    }
                    return;
                }
            } catch (ex) {
                // Jest Throw Exception
            }
        }
        this.hide();
    }

    handleDocumentTouch() {
        if (this._visible) {
            this.hide();
        }
    }

    addToggleListeners() {
        const target = this._target();
        if (!this._initialized && target) {
            target.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                this.toggle();
            });

            ['mouseenter', 'focus'].forEach((name) =>
                target.addEventListener(name, () => this.show())
            );
            ['mouseleave', 'blur'].forEach((name) =>
                target.addEventListener(name, (event) =>
                    this.hideIfNotSelfCover(event)
                )
            );
        }
    }

    get resizeObserver() {
        if (!this._resizeObserver) {
            this._resizeObserver = buildResizeObserver(() => {
                if (this._visible && this._autoPosition) {
                    this.startPositioning();
                }
            });
        }
        return this._resizeObserver;
    }

    show() {
        if (this._disabled) {
            return;
        }

        this._visible = true;
        const tooltip = this._element();

        /* We only change the visibility of the cached bubble element here,
           for custom bubble elements, we expect them to react to `visible`
           property change */
        if (CACHED_BUBBLE_ELEMENT) {
            // Show cached bubble element
            CACHED_BUBBLE_ELEMENT.classList.remove('slds-hide');
        }

        CONTENT.textContent = this._value;

        this.startPositioning();

        document.addEventListener('touchstart', this.handleDocumentTouch);

        this.resizeObserver.observe(tooltip);
    }

    hide() {
        this._visible = false;
        const tooltip = this._element();
        CACHED_BUBBLE_ELEMENT.visible = this._visible;
        updateClassList(ALIGN);

        this.stopPositioning();

        document.removeEventListener('touchstart', this.handleDocumentTouch);

        this.resizeObserver.unobserve(tooltip);
    }

    toggle() {
        if (this._visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this._disabled = !value;
    }

    get initialized() {
        return this._initialized;
    }

    get visible() {
        return this._visible;
    }

    startPositioning() {
        if (!this._autoPosition) {
            this._autoPosition = new AutoPosition(this._root);
        }

        // The lightning-helptext component was originally left aligned.
        const align = {
            horizontal: this._config.align.horizontal || Direction.Left,
            vertical: this._config.align.vertical || Direction.Bottom
        };
        const targetAlign = {
            horizontal: this._config.targetAlign.horizontal || Direction.Left,
            vertical: this._config.targetAlign.vertical || Direction.Top
        };

        // Pads the tooltip so its nubbin is at the center of the target element.
        const targetBox = this._target().getBoundingClientRect();
        const padLeft = targetBox.width * 0.5 - NUBBIN_OFFSET;

        this._autoPosition
            .start({
                target: this._target,
                element: this._element,
                align,
                targetAlign,
                autoFlip: true,
                padTop: NUBBIN_SIZE,
                padLeft
            })
            .then((autoPositionUpdater) => {
                // The calculation above may have flipped the alignment of the tooltip. When the
                // tooltip changes alignment we need to update the nubbin class to have it draw in
                // the appropriate place.
                if (autoPositionUpdater) {
                    CACHED_BUBBLE_ELEMENT.visible = this._visible;
                    ALIGN = autoPositionUpdater.config.align;
                    updateClassList(ALIGN);
                }
            });
    }

    stopPositioning() {
        if (this._autoPosition) {
            this._autoPosition.stop();
        }
    }
}
