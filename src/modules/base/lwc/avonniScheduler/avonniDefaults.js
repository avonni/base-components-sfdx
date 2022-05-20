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

const DEFAULT_AVAILABLE_TIME_FRAMES = ['00:00-23:59'];
const DEFAULT_AVAILABLE_DAYS_OF_THE_WEEK = [0, 1, 2, 3, 4, 5, 6];
const DEFAULT_AVAILABLE_MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const DEFAULT_START_DATE = new Date();
const DEFAULT_TIME_SPAN = {
    unit: 'day',
    span: 1
};
const DEFAULT_TOOLBAR_TIME_SPANS = [
    { unit: 'day', span: 1, label: 'Day', headers: 'hourAndDay' },
    { unit: 'week', span: 1, label: 'Week', headers: 'hourAndDay' },
    { unit: 'month', span: 1, label: 'Month', headers: 'dayAndMonth' },
    { unit: 'year', span: 1, label: 'Year', headers: 'dayAndMonth' }
];
const DEFAULT_CONTEXT_MENU_EVENT_ACTIONS = [
    {
        name: 'edit',
        label: 'Edit',
        iconName: 'utility:edit'
    },
    {
        name: 'delete',
        label: 'Delete',
        iconName: 'utility:delete'
    }
];
const DEFAULT_CONTEXT_MENU_EMPTY_SPOT_ACTIONS = [
    {
        name: 'add-event',
        label: 'Add event',
        iconName: 'utility:add'
    }
];

const DEFAULT_DIALOG_LABELS = {
    title: 'Title',
    from: 'From',
    to: 'To',
    resources: 'Resources',
    saveButton: 'Save',
    saveOneRecurrent: 'Only this event',
    saveAllRecurrent: 'All events',
    editRecurrent: 'Edit recurring event.',
    cancelButton: 'Cancel',
    deleteButton: 'Delete',
    deleteTitle: 'Delete Event',
    deleteMessage: 'Are you sure you want to delete this event?',
    newEventTitle: 'New event'
};

const DEFAULT_EVENTS_LABELS = {
    center: {
        fieldName: 'title'
    }
};

const DEFAULT_LOADING_STATE_ALTERNATIVE_TEXT = 'Loading';

const EDIT_MODES = ['all', 'one'];

const DEFAULT_DATE_FORMAT = 'ff';

const EVENTS_THEMES = {
    valid: ['default', 'transparent', 'line', 'hollow', 'rounded'],
    default: 'default'
};

const EVENTS_PALETTES = {
    valid: [
        'aurora',
        'bluegrass',
        'dusk',
        'fire',
        'heat',
        'lake',
        'mineral',
        'nightfall',
        'ocean',
        'pond',
        'sunrise',
        'water',
        'watermelon',
        'wildflowers'
    ],
    default: 'aurora'
};

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

const PALETTES = {
    aurora: ['#3296ed', '#77b9f2', '#9d53f2', '#c398f5', '#26aba4', '#4ed4cd'],
    bluegrass: [
        '#c7f296',
        '#94e7a8',
        '#51d2bb',
        '#27aab0',
        '#116985',
        '#053661'
    ],
    dusk: ['#98c9f5', '#bac6a4', '#e0bc3d', '#d49b08', '#966002', '#613102'],
    fire: ['#f5de98', '#f5c066', '#f59527', '#d56613', '#952f13', '#610514'],
    heat: ['#c7f296', '#d8e167', '#e3c52c', '#d19214', '#934214', '#610514'],
    lake: ['#98c9f5', '#72c9bd', '#44c972', '#38ab3d', '#4d6719', '#613102'],
    mineral: ['#529ee0', '#d9a6c2', '#08916d', '#f59b00', '#006699', '#f0e442'],
    nightfall: [
        '#faca9b',
        '#ce86bc',
        '#9232e0',
        '#5d19d4',
        '#2a2396',
        '#053661'
    ],
    ocean: ['#96f2a9', '#64cfc6', '#289ee3', '#1c6bd0', '#40308a', '#61054f'],
    pond: ['#c398f5', '#8593f5', '#358aef', '#0c7fc5', '#0a6e67', '#0a611b'],
    sunrise: ['#f5de98', '#f5c062', '#f59623', '#ce6716', '#762f3d', '#300561'],
    water: ['#96F2EE', '#68CEEE', '#2D9CED', '#0E6ECE', '#073E92', '#051C61'],
    watermelon: [
        '#f598a7',
        '#f56580',
        '#f4284e',
        '#c11c2f',
        '#5c3f22',
        '#0a611b'
    ],
    wildflowers: [
        '#00a1e0',
        '#16325c',
        '#76ded9',
        '#08a69e',
        '#e2ce7d',
        '#e69f00'
    ]
};

const RECURRENCES = [
    {
        name: 'daily',
        unit: 'day'
    },
    {
        name: 'weekly',
        unit: 'week'
    },
    {
        name: 'monthly',
        unit: 'month'
    },
    {
        name: 'yearly',
        unit: 'year'
    }
];

const REFERENCE_LINE_VARIANTS = {
    valid: ['default', 'inverse', 'success', 'warning', 'error', 'lightest'],
    default: 'default'
};

export {
    DEFAULT_AVAILABLE_DAYS_OF_THE_WEEK,
    DEFAULT_AVAILABLE_TIME_FRAMES,
    DEFAULT_AVAILABLE_MONTHS,
    DEFAULT_CONTEXT_MENU_EMPTY_SPOT_ACTIONS,
    DEFAULT_CONTEXT_MENU_EVENT_ACTIONS,
    DEFAULT_DATE_FORMAT,
    DEFAULT_DIALOG_LABELS,
    DEFAULT_EVENTS_LABELS,
    DEFAULT_LOADING_STATE_ALTERNATIVE_TEXT,
    DEFAULT_START_DATE,
    DEFAULT_TIME_SPAN,
    DEFAULT_TOOLBAR_TIME_SPANS,
    EDIT_MODES,
    EVENTS_THEMES,
    EVENTS_PALETTES,
    HEADERS,
    PALETTES,
    PRESET_HEADERS,
    RECURRENCES,
    REFERENCE_LINE_VARIANTS
};
