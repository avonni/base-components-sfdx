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
import {
    normalizeArray,
    normalizeBoolean,
    normalizeString,
    normalizeObject,
    deepCopy
} from 'c/utilsPrivate';
import { classSet, generateUUID } from 'c/utils';
import { AvonniResizeObserver } from 'c/resizeObserver';
import Item from './avonniItem';

const ICON_POSITIONS = {
    valid: ['left', 'right'],
    default: 'right'
};

const DIVIDER = {
    valid: ['top', 'bottom', 'around']
};

const DEFAULT_LOAD_MORE_OFFSET = 20;

const IMAGE_SIZE = {
    valid: ['small', 'medium', 'large'],
    default: 'large'
};
const IMAGE_CROP_FIT = {
    valid: ['cover', 'contain', 'fill', 'none'],
    default: 'cover'
};
const CROP_POSITION_DEFAULT = 50;
const IMAGE_POSITION = {
    valid: ['top', 'bottom', 'left', 'right', 'background', 'overlay'],
    default: 'left'
};

const VARIANTS = {
    valid: ['base', 'single-line'],
    default: 'base'
};

const MEDIA_QUERY_BREAKPOINTS = {
    small: 480,
    medium: 768,
    large: 1024
};

const COLUMNS = { valid: [1, 2, 3, 4, 6, 12], default: 1 };

/**
 * @class
 * @storyId example-list--base
 * @description The List component allows to enumerate items in a vertical list form, in a grid form or in a paginated single-line form.
 * @descriptor avonni-list
 * @public
 */
export default class AvonniList extends LightningElement {
    /**
     * Alternative text used to describe the list. If the list is sortable, it should describe its behavior, for example: “Sortable menu. Press spacebar to grab or drop an item. Press up and down arrow keys to change position. Press escape to cancel.”
     *
     * @type {string}
     * @public
     */
    @api alternativeText;
    /**
     * Text label for the list.
     *
     * @type {string}
     * @public
     */
    @api label;
    /**
     * The Lightning Design System name of the sortable icon. Names are written in the format 'standard:account' where 'standard' is the category, and 'account' is the specific icon to be displayed.
     *
     * @type {string}
     * @public
     */
    @api sortableIconName;

    _actions = [];
    computedActions = [];
    _mediaActions = [];
    computedMediaActions = [];
    computedItems = [];
    _cols = 1;
    _smallContainerCols;
    _mediumContainerCols;
    _largeContainerCols;
    _divider;
    _enableInfiniteLoading = false;
    _imageAttributes = {
        position: 'left',
        size: 'large',
        cropPositionX: 50,
        cropPositionY: 50,
        cropFit: 'cover'
    };
    _isLoading = false;
    _items = [];
    _loadMoreOffset = DEFAULT_LOAD_MORE_OFFSET;
    _sortable = false;
    _sortableIconPosition = ICON_POSITIONS.default;
    _variant = VARIANTS.default;

    _columnsSizes = {
        default: 1
    };
    _imageSizes = {
        height: {
            small: 48,
            medium: 96,
            large: 192
        },
        width: {
            small: 48,
            medium: 72,
            large: 128
        }
    };
    _currentItemDraggedHeight;
    _currentColumnCount = 1;
    _initialY;
    _itemElements;
    _menuTop;
    _menuBottom;
    _savedComputedItems;
    _draggedElement;
    _draggedIndex;
    _hoveredIndex;
    _keyboardMoveIndex;
    listHasImages = false;
    _resizeObserver;
    _scrollingInterval;
    _singleLinePage = 0;
    _singleLinePageFirstIndex;
    _scrollTop = 0;
    _previousScrollTop;
    _initialScrollHeight = 0;
    _restrictMotion = false;
    _dragging = false;
    _hasUsedInfiniteLoading = false;

    renderedCallback() {
        if (!this._resizeObserver) {
            this.initWrapObserver();
        }

        this.restoreScrollPosition();
        this.listResize();

        if ((this._dragging || this._keyboardDragged) && this._draggedElement) {
            this.recoverDraggedElement();
        }

        this._itemElements = Array.from(
            this.template.querySelectorAll('[data-element-id="li-item"]')
        );

        // Wait for the card to render before checking if the bottom is reached.
        window.requestAnimationFrame(() => {
            this.handleScroll();
        });
    }

    hasConnected = false;
    connectedCallback() {
        this.setItemProperties();
        this.hasConnected = true;
    }

    disconnectedCallback() {
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = undefined;
        }
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Array of action objects.
     *
     * @type {object}
     * @public
     */
    @api
    get actions() {
        return this._actions;
    }
    set actions(proxy) {
        this._actions = normalizeArray(proxy);
        this.computedActions = JSON.parse(JSON.stringify(this._actions));
    }

    /**
     * Array of action objects displayed in the image.
     *
     * @type {object[]}
     * @public
     */
    @api
    get mediaActions() {
        return this._mediaActions;
    }
    set mediaActions(proxy) {
        this._mediaActions = normalizeArray(proxy);
        this.computedMediaActions = JSON.parse(
            JSON.stringify(this._mediaActions)
        );
    }

    /**
     * Position of the item divider. Valid values include top, bottom and around.
     *
     * @type {string}
     * @public
     */
    @api
    get divider() {
        return this._divider;
    }
    set divider(value) {
        this._divider = normalizeString(value, {
            validValues: DIVIDER.valid
        });
    }

    /**
     * If present, you can load a subset of data and then display more when users scroll to the end of the list or reach the last page of items in a single-line variant.
     * Use with the loadmore event handler to retrieve more data.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get enableInfiniteLoading() {
        return this._enableInfiniteLoading;
    }
    set enableInfiniteLoading(value) {
        this._enableInfiniteLoading = normalizeBoolean(value);

        if (this._enableInfiniteLoading) {
            this._hasUsedInfiniteLoading = true;
        }
    }

    /**
     * If true a loading animation is shown.
     *
     * @type {boolean}
     * @default false
     * @public
     */
    @api
    get isLoading() {
        return this._isLoading;
    }
    set isLoading(value) {
        this._isLoading = normalizeBoolean(value);

        if (this._isLoading) {
            // Wait for the list to render because the showLoading method needs to measure the list's scroll position.
            window.requestAnimationFrame(() => {
                this.showLoading();
            });
        }
    }

    /**
     * Deprecated. Use 'size' attribute instead.
     *
     * @type {string}
     * @default large
     * @deprecated
     */
    @api
    get imageWidth() {
        return this._imageAttributes.size;
    }

    set imageWidth(size) {
        this._imageAttributes.size = normalizeString(size, {
            fallbackValue: IMAGE_SIZE.default,
            validValues: IMAGE_SIZE.valid
        });
        console.warn(
            "'imageWidth' is deprecated. Use image-attributes 'size' instead."
        );
    }

    /**
     * Image attributes: cropFit, position, size, width, height and cropPosition.
     *
     * @type {object}
     * @public
     */
    @api
    get imageAttributes() {
        return this._imageAttributes;
    }
    set imageAttributes(value) {
        const normalizedImgAttributes = normalizeObject(value);

        this._imageAttributes.width = !isNaN(normalizedImgAttributes.width)
            ? normalizedImgAttributes.width
            : null;

        this._imageAttributes.height = !isNaN(normalizedImgAttributes.height)
            ? normalizedImgAttributes.height
            : null;

        this._imageAttributes.size = normalizeString(
            normalizedImgAttributes.size,
            {
                fallbackValue: IMAGE_SIZE.default,
                validValues: IMAGE_SIZE.valid
            }
        );

        this._imageAttributes.cropPositionX = !isNaN(
            normalizedImgAttributes.cropPositionX
        )
            ? normalizedImgAttributes.cropPositionX
            : CROP_POSITION_DEFAULT;
        this._imageAttributes.cropPositionY = !isNaN(
            normalizedImgAttributes.cropPositionY
        )
            ? normalizedImgAttributes.cropPositionY
            : CROP_POSITION_DEFAULT;

        this._imageAttributes.cropFit = normalizeString(
            normalizedImgAttributes.cropFit,
            {
                fallbackValue: IMAGE_CROP_FIT.default,
                validValues: IMAGE_CROP_FIT.valid
            }
        );

        this._imageAttributes.position = normalizeString(
            normalizedImgAttributes.position,
            {
                fallbackValue: IMAGE_POSITION.default,
                validValues: IMAGE_POSITION.valid
            }
        );

        if (this.hasConnected) {
            this.setItemProperties();
        }
    }

    /**
     * Default number of columns on smaller container widths. Valid values include 1, 2, 3, 4, 6 and 12.
     *
     * @type {number}
     * @default 1
     * @public
     */
    @api
    get cols() {
        return this._cols;
    }
    set cols(value) {
        this._cols = this.normalizeColumns(value) || COLUMNS.default;
        this._columnsSizes.default = this._cols;
        this.listResize();
    }

    /**
     * Number of columns on small container widths. Valid values include 1, 2, 3, 4, 6 and 12.
     * @type {number}
     * @public
     */
    @api
    get smallContainerCols() {
        return this._smallContainerCols;
    }
    set smallContainerCols(value) {
        this._smallContainerCols = this.normalizeColumns(value);
        this._columnsSizes.small = this._smallContainerCols;
        this.listResize();
    }

    /**
     * Number of columns on medium container widths. Valid values include 1, 2, 3, 4, 6 and 12.
     *
     * @type {number}
     * @public
     */
    @api
    get mediumContainerCols() {
        return this._mediumContainerCols;
    }
    set mediumContainerCols(value) {
        this._mediumContainerCols = this.normalizeColumns(value);
        this._columnsSizes.medium = this._mediumContainerCols;
        this.listResize();
    }

    /**
     * Number of columns on large container widths and above. Valid values include 1, 2, 3, 4, 6 and 12.
     *
     * @type {number}
     * @public
     */
    @api
    get largeContainerCols() {
        return this._largeContainerCols;
    }
    set largeContainerCols(value) {
        this._largeContainerCols = this.normalizeColumns(value);
        this._columnsSizes.large = this._largeContainerCols;
        this.listResize();
    }

    /**
     * Array of item objects.
     *
     * @type {object[]}
     * @public
     */
    @api
    get items() {
        return this._items;
    }
    set items(proxy) {
        this._items = normalizeArray(proxy, 'object');

        if (this.hasConnected) {
            this.setItemProperties();
        }
    }

    /**
     * Determines when to trigger infinite loading based on how many pixels the table's scroll position is from the bottom of the table.
     *
     * @type {Number}
     * @public
     * @default 20
     */
    @api
    get loadMoreOffset() {
        return this._loadMoreOffset;
    }

    set loadMoreOffset(value) {
        this._loadMoreOffset = Number.isNaN(parseInt(value, 10))
            ? DEFAULT_LOAD_MORE_OFFSET
            : parseInt(value, 10);
    }

    /**
     * If true, it is be possible to reorder the list items. Only the base variant supports item sorting.
     *
     * @type {boolean}
     * @public
     * @default false
     */
    @api
    get sortable() {
        return this._sortable;
    }
    set sortable(bool) {
        this._sortable = normalizeBoolean(bool);
    }

    /**
     * Position of the sortable icon. Valid values include left and right.
     *
     * @type {string}
     * @public
     * @default right
     */
    @api
    get sortableIconPosition() {
        return this._sortableIconPosition;
    }
    set sortableIconPosition(value) {
        this._sortableIconPosition = normalizeString(value, {
            fallbackValue: ICON_POSITIONS.default,
            validValues: ICON_POSITIONS.valid
        });
    }

    /**
     * Variant to display the items as list or single line. Accepted values are base or single-line. The base variant displays a list. The variant defaults to base.
     *
     * @type {string}
     * @public
     * @default list
     */
    @api
    get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: VARIANTS.default,
            validValues: VARIANTS.valid
        });
        this.computedItems.forEach((item) => {
            item.variant = this._variant;
        });

        if (this.hasConnected) {
            this.setItemProperties();
        }
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE PROPERTIES
     * -------------------------------------------------------------
     */

    /**
     * Size of the button icon visible when only one action is set.
     *
     * @type {string}
     */
    get actionButtonIconSize() {
        return this.imageAttributes.position === 'overlay' ? 'small' : 'medium';
    }

    /**
     * Variant of the button icon visible when only one action is set.
     *
     * @type {string}
     */
    get actionButtonIconVariant() {
        return this.imageAttributes.position === 'overlay'
            ? 'border-filled'
            : 'bare';
    }

    /**
     * Apply object fit classes to images.
     */
    get computedImageMediaClass() {
        return classSet('avonni-list__item-img').add({
            'avonni-list__item-image_object-fit-contain':
                this.imageAttributes.cropFit === 'contain',
            'avonni-list__item-image_object-fit-fill':
                this.imageAttributes.cropFit === 'fill',
            'avonni-list__item-image_object-fit-none':
                this.imageAttributes.cropFit === 'none'
        });
    }

    /**
     * Apply object position style to images.
     */
    get computedImageStyle() {
        const size = this.imageAttributes.size;
        const setHeight =
            this.imageAttributes.height || this._imageSizes.height[size];
        const setWidth =
            this.imageAttributes.width || this._imageSizes.width[size];
        const imageObjectPosition = `object-position: ${this.imageAttributes.cropPositionX}% ${this.imageAttributes.cropPositionY}%;`;
        const objectFit = `object-fit: ${this.imageAttributes.cropFit};`;

        let widthStyle = 'width: 100%;';
        let heightStyle = 'height: 100%;';

        if (
            this.imageAttributes.position === 'left' ||
            this.imageAttributes.position === 'right'
        ) {
            widthStyle = `min-width: ${setWidth}px; width: ${setWidth}px; height: 100%;`;
        }
        if (
            this.imageAttributes.position === 'background' ||
            this.imageAttributes.position === 'overlay'
        ) {
            widthStyle = `min-width: 100%; width: 100%; height: ${setHeight}px;`;
        }
        if (
            this.imageAttributes.position === 'top' ||
            this.imageAttributes.position === 'bottom'
        ) {
            heightStyle = `height: ${setHeight}px; min-height: ${setHeight}px; width: 100%;`;
        }

        return `${heightStyle} ${widthStyle} ${imageObjectPosition} ${objectFit}`;
    }

    /**
     * Query selector for the list container.
     */
    get listContainer() {
        return this.template.querySelector(
            '[data-element-id="list-container"]'
        );
    }

    /**
     * Get the first Action.
     *
     * @type {object}
     */
    get firstAction() {
        return this.computedActions[0];
    }

    /**
     * Get the first Media Action.
     *
     * @type {object}
     */
    get firstMediaAction() {
        return this.computedMediaActions[0];
    }

    get generateKey() {
        return generateUUID();
    }

    /**
     * Check if there are any Actions.
     *
     * @type {boolean}
     */
    get hasActions() {
        return this._actions.length;
    }

    /**
     * Check if there are any Media Actions.
     *
     * @type {boolean}
     */
    get hasMediaActions() {
        return this.computedMediaActions.length;
    }

    /**
     * Check if there is more than one Action.
     *
     * @type {boolean}
     */
    get hasMultipleActions() {
        return this._actions.length > 1;
    }

    /**
     * Check if there is more than one Media Actions.
     *
     * @type {boolean}
     */
    get hasMultipleMediaActions() {
        return this.computedMediaActions.length > 1;
    }

    /**
     * Show the loading spinner at the end of the list.
     */
    get isLoadingBelow() {
        return this.isLoading && this.variant !== 'single-line';
    }

    /**
     * ARIA role of the items, if the list is sortable.
     *
     * @type {string|undefined}
     */
    get itemRole() {
        return this.sortable ? 'option' : undefined;
    }

    /**
     * ARIA role of the menu, if the list is sortable.
     *
     * @type {string|undefined}
     */
    get menuRole() {
        return this.sortable ? 'listbox' : undefined;
    }

    /**
     * Check if Icon is to be shown to the right.
     *
     * @type {boolean}
     */
    get showSortIconRight() {
        return (
            this._currentColumnCount === 1 &&
            this.variant === 'base' &&
            this.sortable &&
            this.sortableIconName &&
            this.sortableIconPosition === 'right'
        );
    }

    /**
     * Check if Icon is left of the image.
     *
     * @type {boolean}
     */
    get showSortIconInLeftImage() {
        return (
            this._currentColumnCount === 1 &&
            this.variant === 'base' &&
            this.sortable &&
            !!this.sortableIconName &&
            this.listHasImages &&
            this.imageAttributes.position === 'left' &&
            this.sortableIconPosition === 'left'
        );
    }

    get showSortIconLeftOfContent() {
        return (
            this._currentColumnCount === 1 &&
            !this.showSortIconInLeftImage &&
            this.variant === 'base' &&
            this.sortable &&
            !!this.sortableIconName &&
            this.sortableIconPosition === 'left'
        );
    }

    /**
     * Items to be displayed in the list. On single-line lists, displayed items
     * are a portion of total computed items to display on a single page of item.
     *
     * @type {array}
     */
    get displayedItems() {
        if (this.variant === 'single-line') {
            return this.computedSingleLineItems();
        }
        return this.computedItems;
    }

    /**
     * On single-line variant, show pagination arrows.
     *
     * @type {boolean}
     */
    get showPaginationButtons() {
        return this.variant === 'single-line';
    }

    /**
     * On single-line variant, get the total number of pages.
     *
     * @type {number}
     */
    get totalPages() {
        return (
            Math.ceil(this.computedItems.length / this._currentColumnCount) || 1
        );
    }

    /**
     * On single-line variant, if there are items on the previous page, enable the previous page button.
     *
     * @type {boolean}
     */
    get previousPageDisabled() {
        return this._singleLinePage <= 0;
    }

    /**
     * On single-line variant, if there are items on the next page, enable the next page button.
     *
     * @type {boolean}
     */
    get nextPageDisabled() {
        return this._singleLinePage >= this.totalPages - 1;
    }

    /**
     * Check if Image is present and set the list class styling according to attributes.
     *
     * @type {string}
     */
    get computedListClass() {
        return classSet(
            'avonni-list__item-menu slds-grid slds-is-relative avonni-list__flex-col'
        )
            .add({
                'slds-grid_vertical': this._currentColumnCount === 1,
                'slds-wrap':
                    this._currentColumnCount > 1 && this.variant === 'base',
                'avonni-list__items-without-divider': this.divider === '',
                'avonni-list__has-card-style': this.divider === 'around',
                'slds-has-dividers_top-space avonni-list__items-have-top-divider':
                    this.divider === 'top',
                'slds-has-dividers_bottom-space avonni-list__items-have-bottom-divider':
                    this.divider === 'bottom'
            })
            .toString();
    }

    /**
     * Computed item class styling based on user specified attributes.
     *
     * @type {string}
     */
    get computedItemClass() {
        return classSet()
            .add({
                'avonni-list__item-borderless': this.divider !== 'around',
                'avonni-list__item-card-style': this.divider === 'around'
            })
            .toString();
    }

    /**
     * Computed item class styling based on user specified attributes.
     *
     * @type {string}
     */
    get computedItemWrapperClass() {
        return classSet('avonni-list__item-wrapper avonni-list__item')
            .add({
                'avonni-list__item-sortable':
                    this.sortable &&
                    this._currentColumnCount === 1 &&
                    this.variant === 'base',
                'avonni-list__item-divider_top': this.divider === 'top',
                'avonni-list__item-divider_bottom': this.divider === 'bottom',
                'avonni-list__flex-col slds-size_12-of-12':
                    this._currentColumnCount === 1,
                'avonni-list__flex-col slds-size_6-of-12':
                    this._currentColumnCount === 2,
                'avonni-list__flex-col slds-size_4-of-12':
                    this._currentColumnCount === 3,
                'avonni-list__flex-col slds-size_3-of-12':
                    this._currentColumnCount === 4,
                'avonni-list__flex-col slds-size_2-of-12':
                    this._currentColumnCount === 6,
                'avonni-list__flex-col slds-size_1-of-12':
                    this._currentColumnCount === 12
            })
            .toString();
    }

    /**
     * Only enable scrolling if enable or has been used
     */
    get computedListContainerClass() {
        return classSet({
            'slds-grid avonni-list__flex-col': this.variant === 'single-line',
            'slds-scrollable_y':
                this._hasUsedInfiniteLoading && this.variant === 'base'
        }).toString();
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Get the size and position of a list item in the viewport.
     *
     * @param {string} name Name of the item we want the position of.
     * @returns {DOMRect} Size and position of the item in the viewport.
     * @public
     */
    @api
    getItemPosition(name) {
        const item = this.template.querySelector(
            `[data-element-id="li-item"][data-name="${name}"]`
        );
        if (item) {
            return item.getBoundingClientRect();
        }
        console.warn(`No item with the name ${name} was found.`);
        return null;
    }

    /**
     * If the items have been sorted by the user, reset the items to their original order.
     *
     * @public
     */
    @api
    reset() {
        this.clearSelection();
        this.computedItems = JSON.parse(JSON.stringify(this.items));
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Handle moving elements with the keyboard.
     *
     * @param {HTMLElement} currentItem
     * @param {HTMLElement} targetItem
     */
    accessMoveItem(currentItem, targetItem) {
        this._keyboardDragged = true;
        const currentIndex = Number(currentItem.dataset.elementTempIndex);
        const targetIndex = Number(targetItem.dataset.elementTempIndex);
        const currentItemHeight = this.computeItemHeight(currentItem);
        const targetItemHeight = this.computeItemHeight(targetItem);

        this._draggedElement = currentItem;
        this._hoveredIndex = targetIndex;

        let currentItemYTransform = currentItem.style.transform.match(
            /translateY\((-?\d+(?:\.\d*)?)px/
        );
        if (currentItemYTransform) {
            currentItemYTransform = parseInt(currentItemYTransform[1], 10) || 0;
        }

        if (currentIndex < targetIndex) {
            currentItem.style.transform = `translateY(${
                currentItemYTransform + targetItemHeight
            }px)`;
            targetItem.style.transform = `translateY(${-currentItemHeight}px)`;
            this.checkIfKeyboardMoved(targetItem);
        } else if (currentIndex > targetIndex) {
            currentItem.style.transform = `translateY(${
                currentItemYTransform - targetItemHeight
            }px)`;
            targetItem.style.transform = `translateY(${currentItemHeight}px)`;
            this.checkIfKeyboardMoved(targetItem);
        }

        this.scrollItemIntoView(currentItem);
        targetItem.dataset.elementTempIndex = currentIndex;
        currentItem.dataset.elementTempIndex = targetIndex;

        this._keyboardMoveIndex = targetIndex;
    }

    /**
     * Apply transform style to hovered item and items in-between.
     *
     * @param {HTMLElement} hoveredItem
     */
    animateHoveredItem(hoveredItem) {
        const hoveredIndex = this._hoveredIndex;
        const draggedIndex = this._draggedIndex;
        const hoveredElementIndex = parseInt(hoveredItem.dataset.index, 10);
        const tempHoveredIndex = parseInt(
            hoveredItem.dataset.elementTempIndex,
            10
        );

        // This breaks when the transform is animated with css because the item remains hovered for
        // a few milliseconds, reversing the animation unpredictably.
        const itemHasMoved = hoveredItem.dataset.moved === 'moved';
        const itemHoveringSmallerItem =
            draggedIndex > hoveredIndex || tempHoveredIndex > hoveredIndex;
        const itemHoveringLargerItem =
            draggedIndex < hoveredIndex || tempHoveredIndex < hoveredIndex;

        if (itemHasMoved) {
            delete hoveredItem.dataset.moved;
            hoveredItem.style.transform = 'translateY(0px)';
            hoveredItem.dataset.elementTempIndex = hoveredElementIndex;
        } else if (itemHoveringSmallerItem) {
            hoveredItem.dataset.moved = 'moved';
            hoveredItem.style.transform = `translateY(${this._currentItemDraggedHeight}px)`;
            hoveredItem.dataset.elementTempIndex = tempHoveredIndex + 1;
        } else if (itemHoveringLargerItem) {
            hoveredItem.dataset.moved = 'moved';
            hoveredItem.style.transform = `translateY(-${this._currentItemDraggedHeight}px)`;
            hoveredItem.dataset.elementTempIndex = tempHoveredIndex - 1;
        }

        // Get all items in between the dragged and hovered.
        const itemsBetween = this._itemElements.filter((item) => {
            const itemIndex = Number(item.dataset.index);
            const itemMovedAndBetweenDraggedAndHovered =
                ((itemIndex > draggedIndex && itemIndex < hoveredIndex) ||
                    (itemIndex < draggedIndex && itemIndex > hoveredIndex)) &&
                !item.dataset.moved === 'moved';
            if (itemMovedAndBetweenDraggedAndHovered) {
                return item;
            }
            return undefined;
        });

        if (itemsBetween.length) {
            if (draggedIndex > hoveredIndex) {
                itemsBetween.forEach((item) => {
                    const tempIndex = parseInt(
                        item.dataset.elementTempIndex,
                        10
                    );
                    item.dataset.moved = 'moved';
                    item.style.transform = `translateY(${this._currentItemDraggedHeight}px)`;
                    item.dataset.elementTempIndex = tempIndex + 1;
                });
            } else if (draggedIndex < hoveredIndex) {
                itemsBetween.forEach((item) => {
                    const tempIndex = parseInt(
                        item.dataset.elementTempIndex,
                        10
                    );
                    item.dataset.moved = 'moved';
                    item.style.transform = `translateY(-${this._currentItemDraggedHeight}px)`;
                    item.dataset.elementTempIndex = tempIndex - 1;
                });
            }
        }
    }

    /**
     * Process the animation of the dragged item, and the hovered items.
     *
     * @param {number} currentY
     */
    animateItems(currentY) {
        if (currentY && this._draggedElement) {
            this._draggedElement.style.transform = `translate( 0px, ${
                currentY - this._initialY
            }px)`;

            const hoveredItem = this.getHoveredItem(currentY);
            if (hoveredItem) {
                this.animateHoveredItem(hoveredItem);
            }
        }
    }

    /**
     * Scroll when an item is dragged near the top or bottom of the list.
     *
     * @param {number} currentY
     */
    autoScroll(currentY) {
        this._scrollStep = this.computeScrollStep(currentY);

        if (!this._scrollingInterval && this._draggedElement) {
            this._scrollingInterval = window.setInterval(() => {
                const overflowY =
                    this.listContainer.scrollHeight > this._initialScrollHeight;

                if (!overflowY) {
                    this.listContainer.scrollBy(0, this._scrollStep);

                    this.animateItems(currentY);

                    this._restrictMotion = true;
                    window.requestAnimationFrame(() => {
                        this._restrictMotion = false;
                    });
                }
            }, 20);
        }

        if (this._scrollStep === 0) {
            window.clearInterval(this._scrollingInterval);
            this._scrollingInterval = null;
        }
    }

    checkIfKeyboardMoved(targetItem) {
        const itemHasMoved = targetItem.dataset.moved === 'keyboard-moved';
        if (itemHasMoved) {
            delete targetItem.dataset.moved;
            targetItem.style.transform = `translateY(0px)`;
        } else {
            targetItem.dataset.moved = 'keyboard-moved';
        }
    }

    /**
     * Erase the list styles and dataset - clear tracked variables.
     */
    clearSelection() {
        // Clean the styles and dataset
        this._itemElements.forEach((item, index) => {
            item.style = undefined;
            item.dataset.index = index;
            item.dataset.elementTempIndex = index;
            delete item.dataset.moved;
        });
        if (this._draggedElement) {
            this._draggedElement.classList.remove(
                'avonni-list__item-sortable_dragged'
            );
        }

        this.template.querySelector(
            '.slds-assistive-text[aria-live="assertive"]'
        ).textContent = '';

        // Clean the tracked variables
        this._draggedElement =
            this._draggedIndex =
            this._hoveredIndex =
            this._hoveredIndex =
            this._initialY =
            this._savedComputedItems =
                null;
    }

    cleanUpItem(item) {
        const itemCopy = deepCopy(item);
        delete itemCopy.index;
        delete itemCopy.imagePosition;
        delete itemCopy.variant;
        delete itemCopy.listHasImages;
        delete itemCopy.infos;
        delete itemCopy.icons;

        return itemCopy;
    }

    /**
     * Calculate the height of an item, including the row gap.
     * @param {HTMLElement} item
     */
    computeItemHeight(itemElement) {
        const list = this.template.querySelector(
            '[data-element-id="list-element"]'
        );
        let rowGap;
        if (list) {
            rowGap = parseInt(getComputedStyle(list).rowGap.split('px')[0], 10);
        }
        return itemElement.offsetHeight + (rowGap || 0);
    }

    /**
     * Compute whether to scroll up, down or none.
     *
     * @param {number} currentY
     * @return {string}
     */
    computeScrollStep(currentY) {
        let scrollStep = 0;

        const closeToTop =
            currentY - this.listContainer.getBoundingClientRect().top < 50;
        const closeToBottom =
            this.listContainer.getBoundingClientRect().bottom - currentY < 50;
        const scrolledTop = this.listContainer.scrollTop === 0;
        const scrolledBottom =
            this.listContainer.scrollHeight - this.listContainer.scrollTop ===
            this.listContainer.clientHeight;

        if (closeToTop) {
            scrollStep = -5;
        } else if (closeToBottom) {
            scrollStep = 5;
        }

        if ((scrolledTop && closeToTop) || (scrolledBottom && closeToBottom)) {
            scrollStep = 0;
        }

        return scrollStep;
    }

    computedSingleLineItems() {
        // the first index is the first item to display
        const pageStart = this._currentColumnCount * this._singleLinePage;
        let pageItems = this.computedItems.slice(
            pageStart,
            this._currentColumnCount + pageStart
        );
        let nextPageItems = this.computedItems.slice(
            this._currentColumnCount + pageStart,
            this._currentColumnCount * 2 + pageStart
        );
        if (
            nextPageItems.length === 0 &&
            !this.isLoading &&
            this.enableInfiniteLoading
        ) {
            // window.requestAnimationFrame required because handleLoadMore() cannot be called while updating template
            window.requestAnimationFrame(() => {
                this.handleLoadMore();
            });
        }
        this._singleLinePageFirstIndex = pageStart;
        return pageItems;
    }

    /**
     * When the single-line page is resized, the first item on the page previously
     * displayed will be on a different page.
     */
    findNewPageOfItem(index, columns) {
        let page = 0;
        for (let i = 0; i < this.computedItems.length; i += columns) {
            const chunk = this.computedItems.slice(i, i + columns);
            const chunkIndexes = [];
            chunk.forEach((item) => {
                chunkIndexes.push(item.index);
            });
            if (chunkIndexes.includes(index)) {
                return page;
            }
            page++;
        }
        return page;
    }

    /**
     * Get the item the cursor has entered.
     *
     * @param {number} cursorY
     * @returns {object} item
     */
    getHoveredItem(cursorY) {
        return this._itemElements.find((item) => {
            if (item !== this._draggedElement) {
                const itemIndex = Number(item.dataset.index);
                const itemPosition = item.getBoundingClientRect();
                const hoverTop = itemPosition.top + 10;
                const hoverBottom = itemPosition.bottom - 10;

                // keep the current hovered item and don't set to null if hovering a gap.
                if (
                    cursorY > hoverTop &&
                    cursorY < hoverBottom &&
                    itemIndex != null
                ) {
                    if (item.dataset.elementTempIndex != null) {
                        this._hoveredIndex = parseInt(
                            item.dataset.elementTempIndex,
                            10
                        );
                    } else {
                        this._hoveredIndex = itemIndex;
                    }
                    return item;
                }
            }
            return undefined;
        });
    }

    /**
     * Get initial list menu position and initial Y position on user interaction.
     *
     * @param {Event} event
     */
    initPositions(event) {
        let menuPosition;
        if (this.listContainer) {
            menuPosition = this.listContainer.getBoundingClientRect();
        }
        this._menuTop = menuPosition.top;
        this._menuBottom = menuPosition.bottom;
        this._initialScrollHeight = this.listContainer.scrollHeight;
        this._initialScrollHeight = this.listContainer.scrollHeight;

        this._initialY =
            event.type === 'touchstart'
                ? event.touches[0].clientY
                : event.clientY;
    }

    /**
     * Setup the screen resize observer. That counts the number of wrapped chips.
     *
     * @returns {AvonniResizeObserver} Resize observer.
     */
    initWrapObserver() {
        if (!this.listContainer) {
            return;
        }
        this._resizeObserver = new AvonniResizeObserver(
            this.listContainer,
            this.listResize.bind(this)
        );
    }

    /**
     * Calculate the number of columns depending on the width of the list.
     */
    listResize() {
        const previousColumnCount = this._currentColumnCount;
        if (!this.listContainer) {
            return;
        }
        const listWidth = this.listContainer.offsetWidth;

        let setSize = 'default';
        if (
            listWidth >= MEDIA_QUERY_BREAKPOINTS.large &&
            this.largeContainerCols > 0
        ) {
            setSize = 'large';
        } else if (
            listWidth >= MEDIA_QUERY_BREAKPOINTS.medium &&
            this.mediumContainerCols
        ) {
            setSize = 'medium';
        } else if (
            listWidth >= MEDIA_QUERY_BREAKPOINTS.small &&
            this.smallContainerCols
        ) {
            setSize = 'small';
        }

        // If this._currentColumnCount is set at each resize, it causes unnecessary rerenders.
        const calculatedColumns = this._columnsSizes[setSize];
        if (calculatedColumns !== this._currentColumnCount) {
            this._currentColumnCount = calculatedColumns;
        }

        // Go to page on which the page's first item appears.
        if (
            this.variant === 'single-line' &&
            previousColumnCount !== this._currentColumnCount
        ) {
            const firstItem = this.template.querySelector(
                '[data-element-id="li-item"]'
            );

            let firstIndex;
            if (firstItem) {
                firstIndex = parseInt(firstItem.dataset.index, 10);
            }
            if (!isNaN(firstIndex)) {
                this._singleLinePage = this.findNewPageOfItem(
                    firstIndex,
                    this._currentColumnCount
                );
            }
        }
    }

    /**
     * On single-line variant, go to the next page of elements. On next page load, check
     */
    nextPage() {
        window.requestAnimationFrame(() => {
            const pageStart = this._currentColumnCount * this._singleLinePage;
            let nextPageItems = this.computedItems.slice(
                this._currentColumnCount + pageStart,
                this._currentColumnCount * 2 + pageStart
            );
            if (nextPageItems.length === 0 && !this.isLoading) {
                this.handleLoadMore();
            }
        });

        if (this._singleLinePage < this.totalPages - 1) {
            this._singleLinePage++;
        }
    }

    /**
     * Only accept predetermined number of columns.
     *
     * @param {number} value
     * @returns {number}
     */
    normalizeColumns(value) {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) {
            return null;
        }

        if (COLUMNS.valid.includes(numValue)) {
            return numValue;
        }
        return null;
    }

    /**
     * On single-line variant, go to the previous page of elements.
     */
    previousPage() {
        if (this._singleLinePage > 0) {
            this._singleLinePage--;
        }
    }

    /**
     * Make sure all used properties are set before they are used in items.
     */
    setItemProperties() {
        this.listHasImages = this.items.some((item) => item.imageSrc);
        this.computedItems = this.items.map((item, index) => {
            // With image position == background or overlay,
            // if the image is missing fallback to default list layout.
            let usedImagePosition = this.imageAttributes.position;
            const layoutRequiresImage =
                usedImagePosition === 'background' ||
                usedImagePosition === 'overlay';
            if (!item.imageSrc && layoutRequiresImage) {
                usedImagePosition = 'top';
            }
            const newItem = new Item(item);
            newItem.index = index;
            newItem.imagePosition = usedImagePosition;
            newItem.listHasImages = this.listHasImages;
            newItem.variant = this.variant;
            return newItem;
        });
    }

    scrollItemIntoView(draggedItem) {
        const draggedItemPosition = draggedItem.getBoundingClientRect();
        const containerSize = this.listContainer.getBoundingClientRect();
        const moveUpWithItem = draggedItemPosition.top < 0;
        const moveDownWithItem =
            draggedItemPosition.bottom > containerSize.height;

        if (moveUpWithItem) {
            draggedItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        if (moveDownWithItem) {
            draggedItem.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }

    /**
     * After a rerender, recover the element being dragged and keep it.
     */
    recoverDraggedElement() {
        this._draggedElement = this.template.querySelector(
            `[data-index="${this._initialDraggedIndex}"]`
        );
        this._draggedIndex = this._initialDraggedIndex;

        if (this._dragging) {
            this.animateItems(this._currentY);
            this._initialScrollHeight = this.listContainer.scrollHeight;
        }
        if (this._keyboardDragged && this._draggedElement) {
            this._draggedElement.focus();
            this.restoreItemsTransform(
                this._draggedIndex,
                this._keyboardMoveIndex
            );
        }
    }

    /**
     * Remove transform style and class from all items.
     */
    resetItemsAnimations() {
        this._itemElements.forEach((item) => {
            if (item.dataset.moved === 'moved') {
                delete item.dataset.moved;
                item.style.transform = 'translateY(0px)';
            }
        });
    }

    /**
     * Restore the scroll position when the list is rerendered. Needed when loading more items.
     */
    restoreScrollPosition() {
        const scrollTop = this.listContainer
            ? this.listContainer.scrollTop
            : null;

        if (scrollTop != null) {
            window.requestAnimationFrame(() => {
                this.listContainer.scrollTop = scrollTop;
            });
        }
    }

    restoreItemsTransform(draggedIndex, targetIndex) {
        setTimeout(() => {
            const draggedItem = this._itemElements.find(
                (item) => Number(item.dataset.index) === draggedIndex
            );
            draggedItem.dataset.elementTempIndex = targetIndex;
            const draggedItemHeight = this.computeItemHeight(draggedItem);

            const itemsBetween = this._itemElements.filter(
                (item) =>
                    Number(item.dataset.index) > draggedIndex &&
                    Number(item.dataset.index) <= targetIndex
            );
            let draggedItemTransform = 0;
            itemsBetween.forEach((item) => {
                draggedItemTransform += this.computeItemHeight(item);
                item.style.transform = `translateY(${-draggedItemHeight}px)`;
                item.dataset.moved = 'keyboard-moved';
                item.dataset.elementTempIndex = Number(item.dataset.index) - 1;
            });
            draggedItem.style.transform = `translateY(${draggedItemTransform}px)`;
        }, 0);
    }

    /**
     * When the user has reached the bottom of the list, and the load-more spinner appears,
     * scroll to view the spinner.
     */
    showLoading() {
        if (!this.listContainer) {
            return;
        }
        const offsetFromBottom =
            this.listContainer.scrollHeight -
            (this.listContainer.scrollTop + this.listContainer.clientHeight);

        // Show the spinner if close to bottom, and not scrolled to the top
        const closeToBottom =
            offsetFromBottom < 100 && this.listContainer.scrollTop > 0;
        if (closeToBottom) {
            setTimeout(() => {
                const spinner = this.template.querySelector(
                    '[data-element-id="loading-spinner-below"]'
                );
                if (spinner) {
                    this.listContainer.scrollTop =
                        this.listContainer.scrollHeight;
                }
            }, 20);
        }
    }

    /**
     * Compute swap between dragged items.
     *
     * @param {number} hoveredIndex
     * @param {number} draggedIndex
     */
    switchWithItem(draggedIndex, hoveredIndex) {
        const draggedItem = this.computedItems.splice(draggedIndex, 1)[0];
        this.computedItems.splice(hoveredIndex, 0, draggedItem);

        // Update indexes
        this.computedItems.forEach((item, index) => {
            item.index = index;
        });

        this.computedItems = [...this.computedItems];
        this.resetItemsAnimations();
        this.updateAssistiveText();
    }

    /**
     * Stop the propagation of an event.
     *
     * @param {Event} event
     */
    stopPropagation(event) {
        event.stopPropagation();
    }

    /**
     * Update assistive text based on new item ordering.
     */
    updateAssistiveText() {
        const label = this.computedItems[this._draggedIndex].label;
        const position = this._draggedIndex + 1;
        const total = this.computedItems.length;
        const element = this.template.querySelector(
            '.slds-assistive-text[aria-live="assertive"]'
        );
        // We don't use a variable to avoid rerendering
        element.textContent = `${label}. ${position} / ${total}`;
    }

    /*
     * ------------------------------------------------------------
     *  EVENT HANDLING
     * -------------------------------------------------------------
     */

    /**
     * Compute drag event start element positions and indexes // Prevent certain elements from being dragged.
     *
     * @param {Event} event
     */
    dragStart(event) {
        if (event.button === 0) {
            const index = Number(event.currentTarget.dataset.index);
            const item = this.computedItems[index];

            /**
             * The event fired when the mouse is pressed on an item.
             *
             * @event
             * @name itemmousedown
             * @param {object} item Item clicked.
             * @param {string} name Name of the item clicked.
             * @public
             * @bubbles
             */
            const itemMouseDownEvent = new CustomEvent('itemmousedown', {
                detail: {
                    item: this.cleanUpItem(item),
                    name: item.name
                },
                bubbles: true
            });
            itemMouseDownEvent.clientX = event.clientX;
            itemMouseDownEvent.clientY = event.clientY;
            itemMouseDownEvent.pageX = event.pageX;
            itemMouseDownEvent.pageY = event.pageY;
            this.dispatchEvent(itemMouseDownEvent);
        }

        if (this._keyboardDragged) {
            this._keyboardDragged = false;
            return;
        }

        // Stop dragging if the click was on a button menu
        if (
            this._currentColumnCount > 1 ||
            this.variant !== 'base' ||
            !this.sortable
        ) {
            return;
        }

        this._itemElements = Array.from(
            this.template.querySelectorAll('[data-element-id="li-item"]')
        );

        this._draggedElement = event.currentTarget;
        this._currentItemDraggedHeight = this.computeItemHeight(
            event.currentTarget
        );

        this._draggedIndex = Number(this._draggedElement.dataset.index);
        this._initialDraggedIndex = this._draggedIndex;
        this._initialDraggedIndex = this._draggedIndex;

        if (event.type !== 'keydown') {
            this.initPositions(event);
        } else {
            this._savedComputedItems = [...this.computedItems];
        }

        this.updateAssistiveText();

        if (event.type === 'touchstart') {
            // Make sure touch events don't trigger mouse events
            event.preventDefault();
            // Close any open button menu
            this._draggedElement.focus();
        }
    }

    /**
     * Compute drag event logic.
     *
     * @param {Event} event
     */
    drag(event) {
        if (!this._draggedElement || this._keyboardDragged) {
            return;
        }

        this._dragging = true;

        this._dragging = true;
        this._draggedElement.classList.add(
            'avonni-list__item-sortable_dragged'
        );

        const mouseY =
            event.type === 'touchmove'
                ? event.touches[0].clientY
                : event.clientY;
        const menuTop = this._menuTop;
        const menuBottom = this._menuBottom;

        // Make sure it is not possible to drag the item out of the menu
        let currentY;
        if (mouseY < menuTop) {
            currentY = menuTop;
        } else if (mouseY > menuBottom) {
            currentY = menuBottom;
        } else {
            currentY = mouseY;
        }
        this._currentY = currentY;

        if (!this._scrollStep) {
            // Stick the dragged item to the mouse position
            this.animateItems(this._currentY);
        }

        const buttonMenu = event.currentTarget.querySelector(
            '[data-element-id="lightning-button-menu"]'
        );
        if (buttonMenu) {
            buttonMenu.classList.remove('slds-is-open');
        }

        this.stopPropagation(event);
        this.autoScroll(this._currentY);
    }

    /**
     * When dragging is finished, reorder items or reset the list.
     *
     * @param {Event} event
     */
    /**
     * When dragging is finished, reorder items or reset the list.
     *
     * @param {Event} event
     */
    dragEnd(event) {
        window.clearInterval(this._scrollingInterval);
        this._scrollingInterval = null;
        this._dragging = false;

        if (this._draggedIndex === null) {
            return;
        }

        if (event && event.button === 0) {
            const index = Number(event.currentTarget.dataset.index);
            const item = this.computedItems[index];

            /**
             * The event fired when the mouse is released on an item.
             *
             * @event
             * @name itemmouseup
             * @param {object} item Item clicked.
             * @param {string} name Name of the item clicked.
             * @public
             * @bubbles
             */
            const itemMouseUpEvent = new CustomEvent('itemmouseup', {
                detail: {
                    item: this.cleanUpItem(item),
                    name: item.name
                },
                bubbles: true
            });
            itemMouseUpEvent.clientX = event.clientX;
            itemMouseUpEvent.clientY = event.clientY;
            itemMouseUpEvent.pageX = event.pageX;
            itemMouseUpEvent.pageY = event.pageY;
            this.dispatchEvent(itemMouseUpEvent);
        }

        if (!this._draggedElement) {
            return;
        }

        if (this._draggedIndex != null && this._hoveredIndex != null) {
            this.switchWithItem(this._draggedIndex, this._hoveredIndex);
        }
        const orderHasChanged = this._itemElements.some((item) => {
            return (
                Number(item.dataset.index) !==
                Number(item.dataset.elementTempIndex)
            );
        });

        if (orderHasChanged) {
            this.computedItems = [...this.computedItems];
            const cleanItems = [];
            this.computedItems.forEach((item) => {
                cleanItems.push(this.cleanUpItem(item));
            });
            /**
             * The event fired when a user reordered the items.
             *
             * @event
             * @name reorder
             * @param {object} items The items in their new order.
             * @public
             */
            this.dispatchEvent(
                new CustomEvent('reorder', {
                    detail: {
                        items: cleanItems
                    }
                })
            );
        }

        this.clearSelection();
    }

    /**
     * Handles a click on an item's action.
     *
     * @param {Event} event
     */
    handleActionClick(event) {
        event.stopPropagation();
        const actionName = this.hasMultipleActions
            ? event.detail.value
            : event.currentTarget.value;
        const itemIndex = event.currentTarget.dataset.itemIndex;
        /**
         * The event fired when a user clicks on an action.
         *
         * @event
         * @name actionclick
         * @param {string} name  Name of the action clicked.
         * @param {object} item Item clicked.
         * @param {string} targetName Name of the item.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('actionclick', {
                detail: {
                    name: actionName,
                    item: this.cleanUpItem(this.computedItems[itemIndex]),
                    targetName: this.computedItems[itemIndex].name
                }
            })
        );
    }

    /**
     * Handles a click on an item's media action.
     *
     * @param {Event} event
     */
    handleMediaActionClick(event) {
        event.stopPropagation();
        const actionName = this.hasMultipleMediaActions
            ? event.detail.value
            : event.currentTarget.value;
        const itemIndex = event.currentTarget.dataset.itemIndex;

        /**
         * The event fired when a user clicks on a media action.
         *
         * @event
         * @name mediaactionclick
         * @param {string} name  Name of the media action clicked.
         * @param {object} item Item clicked.
         * @param {string} targetName Name of the item.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('mediaactionclick', {
                detail: {
                    name: actionName,
                    item: this.cleanUpItem(this.computedItems[itemIndex]),
                    targetName: this.computedItems[itemIndex].name
                }
            })
        );
    }

    /**
     * Prevent ghost image on avatar drag.
     *
     * @param {Event} event
     */
    handleAvatarDragStart(event) {
        event.preventDefault();
    }

    /**
     * Handle a key pressed on an item.
     *
     * @param {Event} event
     */
    handleKeyDown(event) {
        // If space bar is pressed, select or drop the item
        if (event.key === 'Enter') {
            this.handleItemClick(event);
        } else if (
            this.sortable &&
            (event.key === ' ' || event.key === 'Spacebar')
        ) {
            event.preventDefault();
            if (this._draggedElement) {
                this.dragEnd();
                this._keyboardDragged = false;
            } else {
                this.dragStart(event);
                this._keyboardDragged = true;
            }
        } else if (this.sortable && this._draggedElement) {
            if (event.key === 'Escape' || event.key === 'Esc') {
                this.clearSelection();
            }

            // If up/down arrow is pressed, move the item
            const index = Number(event.currentTarget.dataset.elementTempIndex);
            let targetIndex;

            if (
                this._currentColumnCount === 1 &&
                this.variant === 'base' &&
                event.key === 'ArrowDown' &&
                index + 1 < this.computedItems.length
            ) {
                targetIndex = index + 1;
            } else if (
                this._currentColumnCount === 1 &&
                this.variant === 'base' &&
                event.key === 'ArrowUp'
            ) {
                targetIndex = index - 1;
            }

            if (targetIndex != null) {
                const targetItem = this._itemElements.find(
                    (item) =>
                        Number(item.dataset.elementTempIndex) === targetIndex
                );

                if (event.currentTarget && targetItem) {
                    event.preventDefault();
                    this.accessMoveItem(event.currentTarget, targetItem);
                }
            }
        }
    }

    /**
     * In the case the user loses control of the dragged element, clicking anywhere will reset the list.
     */
    handleListClick() {
        if (this._draggedElement) {
            this.clearSelection();
            this._scrollStep = 0;
        }
    }

    /**
     * Handles a click on an item.
     * The click event will not dispatch an event if the clicked element already has a purpose (action or link).
     *
     * @param {Event} event
     */
    handleItemClick(event) {
        const itemIndex = Number(event.currentTarget.dataset.index);
        const item = this.computedItems[itemIndex];

        /**
         * The event fired when a user clicks on an item.
         *
         * @event
         * @name itemclick
         * @param {object}  item Item clicked.
         * @param {DOMRect} bounds The size and position of the item in the viewport.
         * @param {string}  name Name of the clicked item.
         * @public
         */
        this.dispatchEvent(
            new CustomEvent('itemclick', {
                detail: {
                    item: this.cleanUpItem(item),
                    bounds: event.currentTarget.getBoundingClientRect(),
                    name: item.name
                }
            })
        );
    }

    /**
     * Dispatch loadmore event.
     */
    handleLoadMore() {
        if (this.enableInfiniteLoading) {
            /**
             * The event fired when the end of the list is reached.
             *
             * @event
             * @name loadmore
             * @public
             */
            this.dispatchEvent(new CustomEvent('loadmore'));
        }
    }

    /**
     * Determine scroll position to trigger loadmore and adjust dragged item position.
     */
    handleScroll() {
        if (this.variant === 'single-line') {
            return;
        }

        this._previousScrollTop = this._scrollTop;
        this._scrollTop = this.listContainer.scrollTop;
        this._initialY -= this._scrollTop - this._previousScrollTop;

        if (!this.enableInfiniteLoading) {
            return;
        }

        const offsetFromBottom =
            this.listContainer.scrollHeight -
            this.listContainer.scrollTop -
            this.listContainer.clientHeight;

        if (
            (offsetFromBottom <= this.loadMoreOffset && !this.isLoading) ||
            (this.listContainer.scrollTop === 0 &&
                this.listContainer.scrollHeight ===
                    this.listContainer.clientHeight &&
                !this.isLoading)
        ) {
            this.handleLoadMore();
        }
    }

    /**
     * Handle a keydown event on an action button. If the button is actioned, prevent the `itemclick` event from being dispatched.
     *
     * @param {Event} event `keydown` event.
     */
    handleStopKeyDown(event) {
        if (
            event.key === 'Enter' ||
            event.key === ' ' ||
            event.key === 'Spacebar'
        ) {
            event.stopPropagation();
        }
    }
}
