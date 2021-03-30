import { LightningElement, api } from 'lwc';
import { normalizeBoolean, normalizeString } from 'c/utilsPrivate';
import { classSet } from 'c/utils';

const validRounded = ['top', 'right', 'bottom', 'left', 'circle', '0'];

export default class AvonniImage extends LightningElement {
    @api alt;

    _src;
    _width;
    _height;
    _blankColor = 'transparent';
    _srcset;
    _sizes;
    _block = false;
    _fluid = false;
    _fluidGrow = false;
    _rounded = false;
    _thumbnail = false;
    _left = false;
    _right = false;
    _center = false;
    _blank = false;

    @api
    get src() {
        return this._src;
    }

    set src(value) {
        if (!this.blank) {
            this._src = value;
        }
    }

    @api
    get width() {
        return this._width;
    }

    set width(value) {
        this._width = value;
        this.initBlank();
    }

    @api
    get height() {
        return this._height;
    }

    set height(value) {
        this._height = value;
        this.initBlank();
    }

    @api
    get blankColor() {
        return this._blankColor;
    }

    set blankColor(value) {
        this._blankColor = value;
        this.initBlank();
    }

    @api
    get srcset() {
        return this._srcset;
    }

    set srcset(value) {
        if (Array.isArray(value)) {
            this._srcset = value.join(',');
        } else {
            this._srcset = value;
        }
    }

    @api
    get sizes() {
        return this._sizes;
    }

    set sizes(value) {
        if (Array.isArray(value)) {
            this._sizes = value.join(',');
        } else {
            this._sizes = value;
        }
    }

    @api
    get block() {
        return this._block;
    }

    set block(value) {
        this._block = normalizeBoolean(value);
    }

    @api
    get fluid() {
        return this._fluid;
    }

    set fluid(value) {
        this._fluid = normalizeBoolean(value);
    }

    @api
    get fluidGrow() {
        return this._fluidGrow;
    }

    set fluidGrow(value) {
        this._fluidGrow = normalizeBoolean(value);
    }

    @api
    get rounded() {
        return this._rounded;
    }

    set rounded(value) {
        let roundedValue = normalizeString(value, {
            fallbackValue: null,
            validValues: validRounded
        });

        if (roundedValue !== null) {
            this._rounded = value;
        } else {
            this._rounded = normalizeBoolean(value);
        }
    }

    @api
    get thumbnail() {
        return this._thumbnail;
    }

    set thumbnail(value) {
        this._thumbnail = normalizeBoolean(value);
    }

    @api
    get left() {
        return this._left;
    }

    set left(value) {
        this._left = normalizeBoolean(value);
    }

    @api
    get right() {
        return this._right;
    }

    set right(value) {
        this._right = normalizeBoolean(value);
    }

    @api
    get center() {
        return this._center;
    }

    set center(value) {
        this._center = normalizeBoolean(value);
    }

    @api
    get blank() {
        return this._blank;
    }

    set blank(value) {
        this._blank = normalizeBoolean(value);
        this.initBlank();
    }

    get computedImageClass() {
        return classSet({
            'avonni-img-fluid': this.fluid || this.fluidGrow,
            'avonni-img-fluid-grow': this.fluidGrow,
            'avonni-img-thumbnail': this.thumbnail,
            'avonni-rounded': this.rounded === true,
            'avonni-rounded-top': this.rounded === 'top',
            'avonni-rounded-right': this.rounded === 'right',
            'avonni-rounded-bottom': this.rounded === 'bottom',
            'avonni-rounded-left': this.rounded === 'left',
            'avonni-rounded-circle': this.rounded === 'circle',
            'avonni-not-rounded': this.rounded === '0',
            'avonni-float-left': this.left,
            'avonni-float-right': this.right,
            'avonni-margin-auto': this.center,
            'avonni-display-block': this.center || this.block
        }).toString();
    }

    initBlank() {
        if (this.blank) {
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            canvas.width = this.width;
            canvas.height = this.height;

            ctx.beginPath();
            ctx.rect(0, 0, this.width, this.height);
            ctx.fillStyle = this.blankColor;
            ctx.fill();

            this._src = canvas.toDataURL('image/png', '');
        }
    }
}
