import { LightningElement, api } from 'lwc';
import { normalizeString } from 'c/utilsPrivate';
import { classSet } from 'c/utils';
import SVG_URL from '@salesforce/resourceUrl/illustrationLibrary';

const validSizes = ['small', 'large'];

const validVariants = [
    'text-only',
    'going-camping',
    'gone_fishing',
    'maintenance',
    'desert',
    'open-road',
    'no-access',
    'no-connection',
    'not-available-in-lightning',
    'page-not-available',
    'walkthrough-not-available',
    'fishing-deals',
    'lake-mountain',
    'no-events',
    'no-events-2',
    'no-task',
    'no-task-2',
    'setup',
    'gone-fishing',
    'no-access-2',
    'no-content',
    'no-preview',
    'preview',
    'research'
];

export default class AvonniIllustration extends LightningElement {
    @api title;
    _size = 'small';
    _variant = 'text-only';

    @api get variant() {
        return this._variant;
    }

    set variant(variant) {
        this._variant = normalizeString(variant, {
            fallbackValue: 'text-only',
            validValues: validVariants
        });
    }

    @api get size() {
        return this._variant;
    }

    set size(size) {
        this._size = normalizeString(size, {
            fallbackValue: 'small',
            validValues: validSizes
        });
    }

    get illustrationClass() {
        return classSet('slds-illustration')
            .add({
                'slds-illustration_small': this._size === 'small',
                'slds-illustration_large': this._size === 'large'
            })
            .toString();
    }

    get svgURL() {
        return SVG_URL + '/' + this._variant + '.svg';
    }

    get showSvg() {
        return this._variant !== 'text-only';
    }
}
