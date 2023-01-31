const DEFAULT_START_DATE = new Date();
const HEADERS = {
    valid: [
        'minuteAndHour',
        'minuteHourAndDay',
        'hourAndDay',
        'hourDayAndWeek',
        'dayAndWeek',
        'dayAndMonth',
        'dayLetterAndWeek',
        'dayWeekAndMonth',
        'weekAndMonth',
        'weekMonthAndYear',
        'monthAndYear',
        'quartersAndYear',
        'fiveYears'
    ],
    default: 'hourAndDay'
};
const PRESET_HEADERS = {
    minuteAndHour: [
        {
            unit: 'minute',
            span: 30,
            label: 'mm'
        },
        {
            unit: 'hour',
            span: 1,
            label: 'h a'
        }
    ],
    minuteHourAndDay: [
        {
            unit: 'minute',
            span: 30,
            label: 'mm'
        },
        {
            unit: 'hour',
            span: 1,
            label: 'h a'
        },
        {
            unit: 'day',
            span: 1,
            label: 'ccc, LLL d'
        }
    ],
    hourAndDay: [
        {
            unit: 'hour',
            span: 1,
            label: 'h a'
        },
        {
            unit: 'day',
            span: 1,
            label: 'ccc, LLL d'
        }
    ],
    hourDayAndWeek: [
        {
            unit: 'hour',
            span: 1,
            label: 'h a'
        },
        {
            unit: 'day',
            span: 1,
            label: 'ccc, LLL d'
        },
        {
            unit: 'week',
            span: 1,
            label: "'w.'W 'of' yyyy"
        }
    ],
    dayAndMonth: [
        {
            unit: 'day',
            span: 1,
            label: 'dd'
        },
        {
            unit: 'month',
            span: 1,
            label: 'LLLL'
        }
    ],
    dayAndWeek: [
        {
            unit: 'day',
            span: 1,
            label: 'ccc, LLL d'
        },
        {
            unit: 'week',
            span: 1,
            label: "'w.'W 'of' yyyy"
        }
    ],
    dayLetterAndWeek: [
        {
            unit: 'day',
            span: 1,
            label: 'ccccc'
        },
        {
            unit: 'week',
            span: 1,
            label: "'w.'W 'of' yyyy"
        }
    ],
    dayWeekAndMonth: [
        {
            unit: 'day',
            span: 1,
            label: 'dd'
        },
        {
            unit: 'week',
            span: 1,
            label: "'w.'W 'of' yyyy"
        },
        {
            unit: 'month',
            span: 1,
            label: 'LLLL yyyy'
        }
    ],
    weekAndMonth: [
        {
            unit: 'week',
            span: 1,
            label: "'w.'W 'of' yyyy"
        },
        {
            unit: 'month',
            span: 1,
            label: 'LLLL yyyy'
        }
    ],
    weekMonthAndYear: [
        {
            unit: 'week',
            span: 1,
            label: "'w.'W 'of' yyyy"
        },
        {
            unit: 'month',
            span: 1,
            label: 'LLLL'
        },
        {
            unit: 'year',
            span: 1,
            label: 'yyyy'
        }
    ],
    monthAndYear: [
        {
            unit: 'month',
            span: 1,
            label: 'LLLL'
        },
        {
            unit: 'year',
            span: 1,
            label: 'yyyy'
        }
    ],
    quartersAndYear: [
        {
            unit: 'month',
            span: 4,
            label: 'LLL'
        },
        {
            unit: 'year',
            span: 1,
            label: 'yyyy'
        }
    ],
    fiveYears: [
        {
            unit: 'year',
            span: 5,
            label: 'yyyy'
        }
    ]
};
const UNITS = ['minute', 'hour', 'day', 'week', 'month', 'year'];
const ORIENTATIONS = {
    valid: ['horizontal', 'vertical'],
    default: 'horizontal'
};

export { DEFAULT_START_DATE, HEADERS, PRESET_HEADERS, UNITS, ORIENTATIONS };
