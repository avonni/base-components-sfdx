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
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';

const SLIDES_DIRECTIONS = {
    valid: ['horizontal', 'vertical'],
    default: 'horizontal'
};
const SLIDES_EFFECTS = {
    valid: ['slide', 'fade', 'cube', 'coverflow', 'flip', 'none'],
    default: 'slide'
};
const ICON_POSITIONS = {
    valid: ['left', 'right'],
    defaultPrevious: 'left',
    defaultNext: 'right'
};
const BUTTON_POSITIONS = {
    valid: ['top', 'middle', 'bottom'],
    default: 'middle'
};
const BUTTON_VARIANTS = {
    valid: [
        'bare',
        'neutral',
        'brand',
        'brand-outline',
        'inverse',
        'destructive',
        'destructive-text',
        'success'
    ],
    default: 'neutral'
};

const INDICATOR_TYPES = {
    valid: ['progress-bar', 'bullets', 'dynamic-bullets', 'fractions'],
    default: 'bullets'
};

const INDICATOR_POSITIONS = {
    valid: [
        'top-left',
        'bottom-left',
        'top-right',
        'bottom-right',
        'top-center',
        'bottom-center'
    ],
    default: 'bottom-center'
};

const DEFAULT_SLIDES_PER_VIEW = 1;

const DEFAULT_SPACE_BETWEEN = 0;

const DEFAULT_SPEED = 300;

const DEFAULT_PREVIOUS_BUTTON_ICON_NAME = 'utility:left';

const DEFAULT_NEXT_BUTTON_ICON_NAME = 'utility:right';

const DEFAULT_FRACTION_LABEL = '/';

const DEFAULT_INITIAL_SLIDE = 0

export default class AvonniSlides extends LightningElement {
    @api slidesPerView = DEFAULT_SLIDES_PER_VIEW;
    @api spaceBetween = DEFAULT_SPACE_BETWEEN;
    @api autoplayDelay;
    @api speed = DEFAULT_SPEED;
    @api previousButtonIconName = DEFAULT_PREVIOUS_BUTTON_ICON_NAME;
    @api previousButtonLabel;
    @api nextButtonIconName = DEFAULT_NEXT_BUTTON_ICON_NAME;
    @api nextButtonLabel;
    @api fractionPrefixLabel;
    @api fractionLabel = DEFAULT_FRACTION_LABEL;
    @api width;
    @api height;
    @api coverflowSlideWidth;
    @api coverflowSlideHeight;

    _direction = SLIDES_DIRECTIONS.default;
    _effect = SLIDES_EFFECTS.default;
    _previousButtonIconPosition = ICON_POSITIONS.defaultPrevious;
    _previousButtonVariant = BUTTON_VARIANTS.default;
    _nextButtonIconPosition = ICON_POSITIONS.defaultNext;
    _nextButtonVariant = BUTTON_VARIANTS.default;
    _buttonPosition = BUTTON_POSITIONS.default;
    _indicatorType = INDICATOR_TYPES.default;
    _indicatorPosition = INDICATOR_POSITIONS.default;
    _initialSlide = DEFAULT_INITIAL_SLIDE;

    _navigation = false;
    _buttonInner = false;
    _indicators = false;
    _indicatorInner = false;
    _loop = false;

    container;
    slideList;
    startPosition;
    slide = 0;
    slides = 0;
    containerWidth;
    containerHeight;
    slideWidth;
    slideHeight;
    maxWidth;
    minWidth;
    maxHeight;
    minHeight;
    opacity = 0;
    bullets = [];
    autoplayPause = false;
    isMouseDown = false;
    init = false;

    connectedCallback() {
        this.spaceBetween = Number(this.spaceBetween);
        this.slide = Number(this.initialSlide);

        if (this.isVertical) {
            this.classList.add('avonni-swiper-container-vertical');
        }

        if (this.effect !== 'slide' && this.effect !== 'none') {
            this.slidesPerView = 1;
            this.spaceBetween = 0;
        }

        if (this.effect !== 'none') {
            this.onMouseUp = this.handlerMouseUp.bind(this);
            this.onMouseMove = this.handlerMouseMove.bind(this);

            window.addEventListener('mousemove', this.onMouseMove);
            window.addEventListener('mouseup', this.onMouseUp);
        } else {
            this.speed = 0;
        }

        this.classList.add(`avonni-flex-${this.buttonPosition}`);

        if (this.buttonInner) {
            this.classList.add('avonni-button-inner');
        }
    }

    disconnectedCallback() {
        if (this.effect !== 'none') {
            window.removeEventListener('mouseup', this.onMouseUp);
            window.removeEventListener('mousemove', this.onMouseMove);
        }
    }

    renderedCallback() {
        if (!this.init) {
            if (this.effect === 'cube' || this.effect === 'flip') {
                this.template.querySelector('.avonni-container').style.width =
                    'fit-content';
            }

            this.slideList = this.template
                .querySelector('slot')
                .assignedElements();
            this.slides = this.slideList.length;

            if (this.slides > 0) {
                if (this.loop) {
                    let slot = this.template.querySelector('slot');

                    this.slideList.forEach((slide, index) => {
                        slide.setAttribute('slide-id', index);
                    });

                    for (let i = 0; i < this.slides * 2; i++) {
                        let cloneElement = this.slideList[i].cloneNode(true);
                        slot.appendChild(cloneElement);
                        this.slideList.push(cloneElement);
                    }
                }

                let arraySize = this.slides - this.slidesPerView + 1;
                this.bullets = [...Array(arraySize < 1 ? 1 : arraySize).keys()];

                this.container = this.template.querySelector(
                    '.avonni-swiper-wrapper'
                );

                let mainContainer = this.template.querySelector(
                    '.avonni-swiper-container'
                );

                mainContainer.style.width = this.width;
                mainContainer.style.height = this.height;

                this.initAttributes();

                this.setTransformValue(
                    this.translateValue,
                    this.slidePosition * 90,
                    -this.slidePosition * 90
                );

                if (
                    this.effect === 'cube' ||
                    this.effect === 'coverflow' ||
                    this.effect === 'flip'
                ) {
                    mainContainer.classList.add('avonni-swiper-container-3d');
                    mainContainer.classList.add(
                        `avonni-swiper-container-${this.effect}`
                    );
                }

                if (this.effect === 'cube') {
                    let z = this.isVertical
                        ? this.slideHeight
                        : this.slideWidth;
                    this.container.style.transformOrigin = `50% 50% -${
                        z / 2
                    }px`;
                    this.setSlideVisibility(this.slidePosition);
                }

                if (this.effect === 'coverflow' && !this.isVertical) {
                    let x =
                        (this.containerWidth - this.slideWidth) / 2 -
                        this.slidePosition * this.slideWidth;
                    this.container.style.transform = `translate3d(${x}px,0px,0px)`;
                }

                let cube = 0;
                let cubeIndex = 1;

                this.slideList.forEach((slide, index) => {
                    if (this.isVertical) {
                        slide.style.height = `${this.slideHeight}px`;
                        slide.style.marginBottom = `${this.spaceBetween}px`;
                    } else {
                        slide.style.width = `${this.slideWidth}px`;
                        slide.style.marginRight = `${this.spaceBetween}px`;
                    }

                    if (this.effect === 'fade') {
                        this.initFadeAttributes(slide, index);
                    }

                    if (this.effect === 'cube') {
                        this.initCubeAttributes(slide, index, cube, cubeIndex);
                        cube = cubeIndex === 4 ? cube + 1 : cube;
                        cubeIndex = cubeIndex === 4 ? 1 : cubeIndex + 1;
                    }

                    if (this.effect === 'coverflow') {
                        this.setCoverflowStyle(this.slidePosition);
                    }

                    if (this.effect === 'flip') {
                        this.setFlipStyle();
                        slide.style.backfaceVisibility = 'hidden';
                        slide.style.webkitBackfaceVisibility = 'hidden';
                    }
                });

                if (this.indicators) {
                    this.initIndicators(mainContainer);
                }

                // eslint-disable-next-line @lwc/lwc/no-async-operation
                setTimeout(() => {
                    this.updateSpeed();
                    this.updateSlides();
                }, this.speed);

                if (this.autoplayDelay) {
                    // eslint-disable-next-line @lwc/lwc/no-async-operation
                    setInterval(() => {
                        if (!this.autoplayPause) {
                            if (
                                this.slide ===
                                    this.slides - this.slidesPerView &&
                                !this.loop
                            ) {
                                this.slide = 0;
                                if (this.effect === 'fade') {
                                    this.opacity = 0;
                                    this.slideList[
                                        this.slides - 1
                                    ].style.opacity = 0;
                                }
                            } else {
                                this.slide += 1;
                            }

                            this.updateSpeed();
                            this.updateSlides();
                        }
                    }, this.autoplayDelay);
                }
            }

            this.init = true;
        }

        if (this.init) {
            if (this.showDynamicBullets) {
                this.template
                    .querySelectorAll('.slds-carousel__indicator-action')
                    .forEach((bullet) => {
                        let slideId = Number(bullet.getAttribute('slide-id'));
                        let size = 0.5 / Math.abs(slideId - this.slide);

                        if (this.slide === slideId) {
                            bullet.classList.add('slds-is-active');
                            bullet.style.width = '0.75rem';
                            bullet.style.height = '0.75rem';
                        } else {
                            bullet.classList.remove('slds-is-active');
                            bullet.style.width = `${size}rem`;
                            bullet.style.height = `${size}rem`;
                        }
                    });
            }
        }
    }

    @api get direction() {
        return this._direction;
    }

    set direction(direction) {
        this._direction = normalizeString(direction, {
            fallbackValue: SLIDES_DIRECTIONS.default,
            validValues: SLIDES_DIRECTIONS.valid
        });
    }

    @api get effect() {
        return this._effect;
    }

    set effect(effect) {
        this._effect = normalizeString(effect, {
            fallbackValue: SLIDES_EFFECTS.default,
            validValues: SLIDES_EFFECTS.valid
        });
    }

    @api get previousButtonIconPosition() {
        return this._previousButtonIconPosition;
    }

    set previousButtonIconPosition(position) {
        this._previousButtonIconPosition = normalizeString(position, {
            fallbackValue: ICON_POSITIONS.defaultPrevious,
            validValues: ICON_POSITIONS.valid
        });
    }

    @api get previousButtonVariant() {
        return this._previousButtonVariant;
    }

    set previousButtonVariant(variant) {
        this._previousButtonVariant = normalizeString(variant, {
            fallbackValue: BUTTON_VARIANTS.default,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    @api get nextButtonIconPosition() {
        return this._nextButtonIconPosition;
    }

    set nextButtonIconPosition(position) {
        this._nextButtonIconPosition = normalizeString(position, {
            fallbackValue: ICON_POSITIONS.defaultNext,
            validValues: ICON_POSITIONS.valid
        });
    }

    @api get nextButtonVariant() {
        return this._nextButtonVariant;
    }

    set nextButtonVariant(variant) {
        this._nextButtonVariant = normalizeString(variant, {
            fallbackValue: BUTTON_VARIANTS.default,
            validValues: BUTTON_VARIANTS.valid
        });
    }

    @api get buttonPosition() {
        return this._buttonPosition;
    }

    set buttonPosition(position) {
        this._buttonPosition = normalizeString(position, {
            fallbackValue: BUTTON_POSITIONS.default,
            validValues: BUTTON_POSITIONS.valid
        });

        const wrapperClasses = Array.from(this.classList);
        const currentClass = wrapperClasses.find((wrapperClass) => {
            return wrapperClass.match(/avonni-flex-(middle|top|bottom)/);
        });
        this.classList.remove(currentClass);
        this.classList.add(`avonni-flex-${this._buttonPosition}`);
    }

    @api get indicatorType() {
        return this._indicatorType;
    }

    set indicatorType(type) {
        this._indicatorType = normalizeString(type, {
            fallbackValue: INDICATOR_TYPES.default,
            validValues: INDICATOR_TYPES.valid
        });
    }

    @api get indicatorPosition() {
        return this._indicatorPosition;
    }

    set indicatorPosition(position) {
        this._indicatorPosition = normalizeString(position, {
            fallbackValue: INDICATOR_POSITIONS.default,
            validValues: INDICATOR_POSITIONS.valid
        });
    }

    @api
    get initialSlide() {
        return this._initialSlide;
    }
    set initialSlide(value) {
        this._initialSlide = isNaN(Number(value)) ? 0 : Number(value);

        this.slide = Number(this.initialSlide);
    }

    @api get navigation() {
        return this._navigation;
    }

    set navigation(value) {
        this._navigation = normalizeBoolean(value);
    }

    @api get buttonInner() {
        return this._buttonInner;
    }

    set buttonInner(value) {
        this._buttonInner = normalizeBoolean(value);

        if (this._buttonInner) {
            this.classList.add('avonni-button-inner');
        } else {
            this.classList.remove('avonni-button-inner');
        }
    }

    @api get indicators() {
        return this._indicators;
    }

    set indicators(value) {
        this._indicators = normalizeBoolean(value);
    }

    @api get indicatorInner() {
        return this._indicatorInner;
    }

    set indicatorInner(value) {
        this._indicatorInner = normalizeBoolean(value);
    }

    @api get loop() {
        return this._loop;
    }

    set loop(value) {
        this._loop = normalizeBoolean(value);
    }

    get isVertical() {
        return this.direction === 'vertical';
    }

    get translateValue() {
        let size = this.isVertical ? this.slideHeight : this.slideWidth;
        return -1 * this.slidePosition * (size + this.spaceBetween);
    }

    get progressValue() {
        let value = ((this.slide + 1) / this.slides) * 100;
        return `${value > 100 ? 100 : value}%`;
    }

    get leftButtonDisabled() {
        return this.slide === 0 && !this.loop;
    }

    get rightButtonDisabled() {
        return this.slide > this.slides - this.slidesPerView - 1 && !this.loop;
    }

    get showProgressBar() {
        return this.indicators && this.indicatorType === 'progress-bar';
    }

    get showFractions() {
        return this.indicators && this.indicatorType === 'fractions';
    }

    get showBullets() {
        return this.indicators && this.indicatorType === 'bullets';
    }

    get showDynamicBullets() {
        return this.indicators && this.indicatorType === 'dynamic-bullets';
    }

    get isBullets() {
        return this.showBullets || this.showDynamicBullets;
    }

    get dynamicBullets() {
        let startIndex = this.slide < 3 ? 0 : this.slide - 2;
        let endIndex =
            this.slide + 2 < this.slides ? this.slide + 3 : this.slides;
        let bullets =
            endIndex > -1 ? this.bullets.slice(startIndex, endIndex) : [];
        return bullets;
    }

    get bulletList() {
        return this.indicatorType === 'bullets'
            ? this.bullets
            : this.dynamicBullets;
    }

    get fractions() {
        return `${this.fractionPrefixLabel ? this.fractionPrefixLabel : ''} ${
            this.slide + 1
        } ${this.fractionLabel} ${this.slides}`;
    }

    get slidePosition() {
        return this.loop ? this.slide + this.slides : this.slide;
    }

    @api
    first() {
        this.slide = this.loop ? this.slides : 0;
        this.updateSpeed();
        this.updateSlides();
    }

    @api
    last() {
        this.slide =
            this.slides - this.slidesPerView + this.loop ? this.slides : 0;
        this.updateSpeed();
        this.updateSlides();
    }

    @api
    next() {
        this.slide = this.slide + 1;
        this.updateSpeed();
        this.updateSlides();
    }

    @api
    previous() {
        this.slide = this.slide - 1;
        this.updateSpeed();
        this.updateSlides();
    }

    @api
    pause() {
        this.autoplayPause = !this.autoplayPause;
    }

    @api
    setSlide(value) {
        this.slide = this.loop ? value + this.slides : value;
        this.updateSpeed();
        this.updateSlides();
    }

    initAttributes() {
        this.containerWidth = this.container.offsetWidth;
        this.containerHeight = this.container.offsetHeight;

        if (this.slidesPerView > 1) {
            this.slideWidth =
                (this.containerWidth -
                    (this.slidesPerView - 1) * this.spaceBetween) /
                this.slidesPerView;

            this.slideHeight =
                (this.containerHeight -
                    (this.slidesPerView - 1) * this.spaceBetween) /
                this.slidesPerView;
        } else {
            this.slideWidth = this.containerWidth;
            this.slideHeight = this.containerHeight;
        }

        this.maxWidth = this.slideWidth / 2;
        this.minWidth = -(
            (this.slideWidth + this.spaceBetween) *
                (this.slides - this.slidesPerView) +
            this.slideWidth / 2
        );

        this.maxHeight = this.slideHeight / 2;
        this.minHeight = -(
            (this.slideHeight + this.spaceBetween) *
                (this.slides - this.slidesPerView) +
            this.slideHeight / 2
        );

        if (this.effect === 'coverflow') {
            if (this.coverflowSlideHeight) {
                this.slideHeight = Number(this.coverflowSlideHeight);
            }
            if (this.coverflowSlideWidth) {
                this.slideWidth = Number(this.coverflowSlideWidth);
            }
        }
    }

    initFadeAttributes(slide, index) {
        let x = -this.slideWidth * index;
        let y = -this.slideHeight * index;

        if (this.isVertical) {
            slide.style.transform = `translate3d(0px,${y}px,0px)`;
        } else {
            slide.style.transform = `translate3d(${x}px,0px,0px)`;
        }

        if (this.slidePosition === index) {
            slide.style.opacity = 1;
        } else {
            slide.style.opacity = 0;
        }
    }

    initCubeAttributes(slide, index, cube, cubeIndex) {
        let x;
        let y;
        let z;
        let rotateX = this.isVertical ? -index * 90 : 0;
        let rotateY = this.isVertical ? 0 : index * 90;

        if (cubeIndex === 1) {
            x = this.isVertical ? 0 : -4 * cube * this.slideWidth;
            y = this.isVertical ? -4 * cube * this.slideHeight : 0;
            z = 0;
        }

        if (cubeIndex === 2) {
            x = 0;
            y = 0;
            z =
                -4 *
                cube *
                (this.isVertical ? this.slideHeight : this.slideWidth);
        }

        if (cubeIndex === 3) {
            x = this.isVertical
                ? 0
                : 4 * cube * this.slideWidth + this.slideWidth;
            y = this.isVertical
                ? 4 * cube * this.slideHeight + this.slideHeight
                : 0;
            z = this.isVertical ? this.slideHeight : this.slideWidth;
        }

        if (cubeIndex === 4) {
            x = this.isVertical ? 0 : -this.slideWidth;
            y = this.isVertical ? -this.slideHeight : 0;
            z = index * (this.isVertical ? this.slideHeight : this.slideWidth);
        }

        slide.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${x}px, ${y}px, ${z}px)`;
        slide.style.transformOrigin = '0 0';
        slide.style.backfaceVisibility = 'hidden';
        slide.style.webkitBackfaceVisibility = 'hidden';
    }

    initIndicators(mainContainer) {
        if (this.indicatorType === 'progress-bar') {
            this.template.querySelector(
                '.slds-progress-bar__value'
            ).style.width = this.progressValue;

            let progressBar = this.template.querySelector('.slds-progress-bar');

            if (this.indicatorInner) {
                progressBar.style.zIndex = 2;
            } else {
                mainContainer.style.marginTop = '0.5rem';
                mainContainer.style.marginBottom = '0.5rem';
            }

            if (this.indicatorPosition.indexOf('top') > -1) {
                progressBar.style.top = 0;
            } else {
                progressBar.style.bottom = 0;
            }
        }

        if (this.indicatorType === 'fractions') {
            let fractions = this.template.querySelector('.avonni-fractions');
            fractions.classList.add(
                `avonni-indicators-${this.indicatorPosition}`
            );

            if (this.indicatorInner) {
                fractions.style.zIndex = 2;
            } else {
                mainContainer.style.marginTop = '2rem';
                mainContainer.style.marginBottom = '2rem';
            }
        }

        if (
            this.indicatorType === 'bullets' ||
            this.indicatorType === 'dynamic-bullets'
        ) {
            let bullets = this.template.querySelector('.avonni-bullets');
            bullets.classList.add(
                `avonni-indicators-${this.indicatorPosition}`
            );

            if (this.indicatorInner) {
                bullets.style.zIndex = 2;
            } else {
                bullets.style.padding = 0;
                mainContainer.style.marginTop = '1.5rem';
                mainContainer.style.marginBottom = '2rem';
            }
        }
    }

    setTransformValue(value, translateX, translateY) {
        if (
            this.effect === 'slide' ||
            this.effect === 'coverflow' ||
            this.effect === 'none'
        ) {
            if (this.isVertical) {
                this.container.style.transform = `translate3d(0px,${value}px,0px)`;
            } else {
                this.container.style.transform = `translate3d(${value}px,0px,0px)`;
            }
        }

        if (this.effect === 'cube') {
            if (this.isVertical) {
                this.container.style.transform = `translate3d(0px,0px,0px) rotateX(${translateX}deg) rotateY(0deg)`;
            } else {
                this.container.style.transform = `translate3d(0px,0px,0px) rotateX(0deg) rotateY(${translateY}deg)`;
            }
        }
    }

    setOpacityValue(value, slide) {
        let opacityDiff = Number(value) + slide;
        let sign = Math.sign(opacityDiff);
        let previusSlide = slide - 1 < 0 && !this.loop ? null : slide - 1;
        let nextSlide = slide + 1 < this.slides || this.loop ? slide + 1 : null;

        if (value === 1) {
            this.slideList.forEach((element, index) => {
                if (slide === index) {
                    element.style.opacity = 1;
                } else {
                    element.style.opacity = 0;
                }
            });
        } else {
            this.slideList[slide].style.opacity = 1 - sign * opacityDiff;

            if (sign === 1 && previusSlide !== null) {
                this.slideList[previusSlide].style.opacity = 0 + opacityDiff;
            }

            if (sign === -1 && nextSlide !== null) {
                this.slideList[nextSlide].style.opacity = 0 - opacityDiff;
            }
        }
    }

    setSlideVisibility(slide) {
        let previusSlide = slide - 1 < 0 && !this.loop ? null : slide - 1;
        let nextSlide = slide + 1 < this.slides || this.loop ? slide + 1 : null;

        this.slideList.forEach((element) => {
            element.style.visibility = 'hidden';
        });

        this.slideList[slide].style.visibility = 'visible';

        if (previusSlide !== null) {
            this.slideList[previusSlide].style.visibility = 'visible';
        }

        if (nextSlide !== null) {
            this.slideList[nextSlide].style.visibility = 'visible';
        }
    }

    setCoverflowStyle(value) {
        this.slideList.forEach((slide, i) => {
            let index = i - value;
            let x = 0;
            let y = 0;
            let z = Math.sign(index) === 1 ? -index * 100 : index * 100;
            let rotateX = this.isVertical ? index * 50 : 0;
            let rotateY = this.isVertical ? 0 : -index * 50;

            slide.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            slide.style.zIndex = 1 - index;
        });
    }

    setFlipStyle() {
        this.slideList.forEach((slide, index) => {
            let x = -index * this.slideWidth;
            let y = -index * this.slideHeight;
            let rotate = this.slidePosition === index ? 0 : 180;

            if (this.isVertical) {
                slide.style.transform = `translate3d(0px, ${y}px, 0px) rotateX(${-rotate}deg) rotateY(0deg)`;
            } else {
                slide.style.transform = `translate3d(${x}px, 0px, 0px) rotateX(0deg) rotateY(${rotate}deg)`;
            }

            slide.style.zIndex = this.slidePosition === index ? 1 : 0;
        });
    }

    handlerBulletClick(event) {
        event.preventDefault();
        this.slide = Number(event.target.getAttribute('slide-id'));
        this.updateSpeed();
        this.updateSlides();
    }

    handlerMouseDown(event) {
        this.isMouseDown = true;
        this.startPosition = this.isVertical ? event.clientY : event.clientX;
    }

    handlerMouseUp(event) {
        if (this.isMouseDown) {
            let size = this.isVertical ? this.slideHeight : this.slideWidth;
            let position = this.isVertical ? event.clientY : event.clientX;
            let diff = position - this.startPosition;
            let diffInPrecent = Math.abs((diff / size).toFixed(2));
            let sign = Math.sign(diff);
            let slides = Math.round(diffInPrecent);
            let slide = this.slide - sign * slides;

            if (
                (this.slide > 0 || sign < 0) &&
                (this.slide < this.slides - this.slidesPerView || sign > 0) &&
                diffInPrecent > 0.5
            ) {
                if (slide < 0) {
                    this.slide = 0;
                } else if (slide > this.slides - this.slidesPerView) {
                    this.slide = this.slides - this.slidesPerView;
                } else {
                    this.slide = slide;
                }
            }

            if (this.loop) {
                this.slide = slide;
            }

            this.updateSpeed();
            this.updateSlides();
            this.isMouseDown = false;
        }
    }

    handlerMouseMove(event) {
        event.preventDefault();

        if (this.isMouseDown) {
            let size = this.isVertical ? this.slideHeight : this.slideWidth;
            let position = this.isVertical ? event.clientY : event.clientX;
            position =
                position - this.slidePosition * (size + this.spaceBetween);
            let diff = position - this.startPosition;
            let diffSize = (diff / size).toFixed(2);
            let diffInPrecent = Math.abs(diffSize);
            let sign = Math.sign(diff);

            if (
                (this.isVertical &&
                    diff > this.minHeight &&
                    diff < this.maxHeight) ||
                (!this.isVertical &&
                    diff > this.minWidth &&
                    diff < this.maxWidth) ||
                this.loop
            ) {
                this.container.style.setProperty('--speed', 0);

                this.slideList.forEach((element) => {
                    element.style.setProperty('--speed', 0);
                });

                if (this.effect === 'slide') {
                    this.setTransformValue(diff, 0, 0);
                }

                if (this.effect === 'fade') {
                    this.setOpacityValue(diffSize, Math.floor(diffInPrecent));
                }

                if (this.effect === 'cube') {
                    let translateX = -sign * diffInPrecent * 90;
                    let translateY = sign * diffInPrecent * 90;

                    if (!this.loop) {
                        if (translateX < 0) {
                            translateX = 0;
                        }

                        if (translateX > (this.slides - 1) * 90) {
                            translateX = (this.slides - 1) * 90;
                        }

                        if (translateY > 0) {
                            translateY = 0;
                        }

                        if (translateY < (-this.slides + 1) * 90) {
                            translateY = (-this.slides + 1) * 90;
                        }
                    }

                    this.setTransformValue(diff, translateX, translateY);
                    this.setSlideVisibility(Math.round(diffInPrecent));
                }

                if (this.effect === 'coverflow') {
                    let defaultX = (this.containerWidth - this.slideWidth) / 2;
                    let index = -this.slides + 1;
                    let translateX =
                        defaultX + sign * diffInPrecent * this.slideWidth;
                    let translateY = sign * diffInPrecent * this.slideHeight;

                    if (!this.loop) {
                        if (translateX > defaultX) {
                            translateX = defaultX;
                        }

                        if (translateX < index * this.slideWidth + defaultX) {
                            translateX = index * this.slideWidth + defaultX;
                        }

                        if (translateY > 0) {
                            translateY = 0;
                        }

                        if (translateY < index * this.slideHeight) {
                            translateY = index * this.slideHeight;
                        }
                    }

                    this.setTransformValue(
                        this.isVertical ? translateY : translateX,
                        0,
                        0
                    );

                    if ((diffSize > index && diffSize < 0) || this.loop) {
                        this.setCoverflowStyle(diffInPrecent);
                    }
                }

                if (this.effect === 'flip') {
                    let mainSlide = Math.floor(diffInPrecent);
                    let chieldSlide = mainSlide - sign;
                    let mainRotate = (mainSlide - diffInPrecent) * 180;
                    let chieldRotate = 180 + mainRotate;

                    let mainX = -mainSlide * this.slideWidth;
                    let chieldX = -chieldSlide * this.slideWidth;
                    let mainY = -mainSlide * this.slideHeight;
                    let chieldY = -chieldSlide * this.slideHeight;

                    if (
                        (chieldSlide > 0 && chieldSlide < this.slides) ||
                        this.loop
                    ) {
                        this.slideList.forEach((slide, index) => {
                            if (Math.round(diffInPrecent) === index) {
                                slide.style.visibility = 'visible';
                            } else {
                                slide.style.visibility = 'hidden';
                            }
                        });

                        if (this.isVertical) {
                            this.slideList[
                                mainSlide
                            ].style.transform = `translate3d(0px, ${mainY}px, 0px) rotateX(${-mainRotate}deg) rotateY(0deg)`;

                            this.slideList[
                                chieldSlide
                            ].style.transform = `translate3d(0px, ${chieldY}px, 0px) rotateX(${-chieldRotate}deg) rotateY(0deg)`;
                        } else {
                            this.slideList[
                                mainSlide
                            ].style.transform = `translate3d(${mainX}px, 0px, 0px) rotateX(0deg) rotateY(${mainRotate}deg)`;

                            this.slideList[
                                chieldSlide
                            ].style.transform = `translate3d(${chieldX}px, 0px, 0px) rotateX(0deg) rotateY(${chieldRotate}deg)`;
                        }
                    }
                }
            }
        }
    }

    updateSlides() {
        if (this.showBullets || this.showDynamicBullets) {
            this.template
                .querySelectorAll('.slds-carousel__indicator-action')
                .forEach((bullet) => {
                    let slideId = Number(bullet.getAttribute('slide-id'));

                    if (this.slide === slideId) {
                        bullet.classList.add('slds-is-active');
                    } else {
                        bullet.classList.remove('slds-is-active');
                    }
                });
        }

        if (this.effect === 'slide' || this.effect === 'none') {
            this.setTransformValue(this.translateValue, 0, 0);
        }

        if (this.effect === 'cube') {
            this.setSlideVisibility(this.slidePosition);
            this.setTransformValue(
                this.translateValue,
                this.slidePosition * 90,
                -this.slidePosition * 90
            );
        }

        if (this.effect === 'coverflow') {
            let translateX =
                (this.containerWidth - this.slideWidth) / 2 -
                this.slidePosition * this.slideWidth;
            let translateY = -this.slidePosition * this.slideHeight;

            this.setTransformValue(
                this.isVertical ? translateY : translateX,
                0,
                0
            );
            this.setCoverflowStyle(this.slidePosition);
        }

        if (this.effect === 'flip') {
            this.slideList[this.slidePosition].style.visibility = 'visible';
            this.setFlipStyle();
        }

        if (this.effect === 'fade') {
            this.setOpacityValue(1, this.slidePosition);
        }

        if (this.indicators) {
            if (this.indicatorType === 'progress-bar') {
                this.template.querySelector(
                    '.slds-progress-bar__value'
                ).style.width = this.progressValue;
            }
        }

        if (this.loop && (this.slide < 0 || this.slide > this.slides - 1)) {
            this.reassignSlide();
        } else {
            this.dispatchChange();
        }
    }

    updateSpeed() {
        this.container.style.setProperty('--speed', this.speed);

        this.slideList.forEach((element) => {
            element.style.setProperty('--speed', this.speed);
        });
    }

    reassignSlide() {
        if (this.slide < 0) {
            this.slide = this.slide + this.slides;
        }

        if (this.slide > this.slides - 1) {
            this.slide = this.slide - this.slides;
        }

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            this.container.style.setProperty('--speed', 0);
            this.slideList.forEach((element) => {
                element.style.setProperty('--speed', 0);
            });
            this.updateSlides();
        }, this.speed);
    }

    dispatchChange() {
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: {
                    value: this.slide
                }
            })
        );
    }
}
