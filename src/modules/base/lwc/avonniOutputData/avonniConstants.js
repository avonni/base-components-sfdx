const SUPPORTED_TYPE_ATTRIBUTES = {
    currency: [
        'currencyCode',
        'currencyDisplayAs',
        'minimumIntegerDigits',
        'minimumFractionDigits',
        'maximumFractionDigits',
        'minimumSignificantDigits',
        'maximumSignificantDigits'
    ],
    date: [
        'day',
        'era',
        'hour',
        'hour12',
        'minute',
        'month',
        'second',
        'timeZone',
        'timeZoneName',
        'weekday',
        'year'
    ],
    email: ['hideIcon'],
    location: ['latitude', 'longitude'],
    number: [
        'minimumIntegerDigits',
        'minimumFractionDigits',
        'maximumFractionDigits',
        'minimumSignificantDigits',
        'maximumSignificantDigits'
    ],
    percent: [
        'minimumIntegerDigits',
        'minimumFractionDigits',
        'maximumFractionDigits',
        'minimumSignificantDigits',
        'maximumSignificantDigits'
    ],
    url: ['label', 'target', 'tooltip'],
    text: ['linkify']
};

const TYPES = {
    valid: [
        'boolean',
        'currency',
        'date',
        'email',
        'location',
        'number',
        'percent',
        'phone',
        'text',
        'url'
    ],
    default: 'text'
};

const TYPE_ATTRIBUTES = [
    {
        name: 'currencyCode',
        type: 'string'
    },
    {
        name: 'currencyDisplayAs',
        type: 'string',
        valid: ['symbol', 'code', 'name'],
        default: 'symbol'
    },
    {
        name: 'day',
        type: 'string',
        valid: ['numeric', '2-digit']
    },
    {
        name: 'era',
        type: 'string',
        valid: ['narrow', 'short', 'long']
    },
    {
        name: 'hideIcon',
        type: 'boolean',
        default: false
    },
    {
        name: 'hour',
        type: 'string',
        valid: ['numeric', '2-digit']
    },
    {
        name: 'hour12',
        type: 'boolean'
    },
    {
        name: 'label',
        type: 'string'
    },
    {
        name: 'latitude',
        type: 'number'
    },
    {
        name: 'linkify',
        type: 'boolean',
        default: false
    },
    {
        name: 'longitude',
        type: 'number'
    },
    {
        name: 'maximumFractionDigits',
        type: 'number'
    },
    {
        name: 'maximumSignificantDigits',
        type: 'number'
    },
    {
        name: 'minimumFractionDigits',
        type: 'number'
    },
    {
        name: 'minimumIntegerDigits',
        type: 'number'
    },
    {
        name: 'minimumSignificantDigits',
        type: 'number'
    },
    {
        name: 'minute',
        type: 'string',
        valid: ['numeric', '2-digit']
    },
    {
        name: 'month',
        type: 'string',
        valid: ['2-digit', 'narrow', 'short', 'long']
    },
    {
        name: 'second',
        type: 'string',
        valid: ['numeric', '2-digit']
    },
    {
        name: 'target',
        type: 'string',
        valid: ['_blank', '_self', '_parent', '_top'],
        default: '_self'
    },
    {
        name: 'timeZone',
        type: 'string'
    },
    {
        name: 'timeZoneName',
        type: 'string',
        valid: ['short', 'long']
    },
    {
        name: 'tooltip',
        type: 'string'
    },
    {
        name: 'weekday',
        type: 'string',
        valid: ['narrow', 'short', 'long']
    },
    {
        name: 'year',
        type: 'string',
        valid: ['numeric', '2-digit']
    }
];

const VARIANTS = {
    default: 'standard',
    valid: ['standard', 'label-hidden', 'label-inline', 'label-stacked']
};

export { SUPPORTED_TYPE_ATTRIBUTES, TYPES, TYPE_ATTRIBUTES, VARIANTS };
