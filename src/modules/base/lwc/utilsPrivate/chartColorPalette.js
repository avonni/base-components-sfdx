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

const PALETTE = {
    aurora: ['#3296ed', '#77b9f2', '#9d53f2', '#c398f5', '#26aba4', '#4ed4cd'],
    nightfall: [
        '#faca9b',
        '#ce86bc',
        '#9232e0',
        '#5d19d4',
        '#2a2396',
        '#053661'
    ],
    wildflowers: [
        '#00a1e0',
        '#16325c',
        '#76ded9',
        '#08a69e',
        '#e2ce7d',
        '#e69f00'
    ],
    sunrise: ['#f5de98', '#f5c062', '#f59623', '#ce6716', '#762f3d', '#300561'],
    bluegrass: [
        '#c7f296',
        '#94e7a8',
        '#51d2bb',
        '#27aab0',
        '#116985',
        '#053661'
    ],
    ocean: ['#96f2a9', '#64cfc6', '#289ee3', '#1c6bd0', '#40308a', '#61054f'],
    heat: ['#c7f296', '#d8e167', '#e3c52c', '#d19214', '#934214', '#610514'],
    dusk: ['#98c9f5', '#bac6a4', '#e0bc3d', '#d49b08', '#966002', '#613102'],
    pond: ['#c398f5', '#8593f5', '#358aef', '#0c7fc5', '#0a6e67', '#0a611b'],
    watermelon: [
        '#f598a7',
        '#f56580',
        '#f4284e',
        '#c11c2f',
        '#5c3f22',
        '#0a611b'
    ],
    fire: ['#f5de98', '#f5c066', '#f59527', '#d56613', '#952f13', '#610514'],
    water: ['#96F2EE', '#68CEEE', '#2D9CED', '#0E6ECE', '#073E92', '#051C61'],
    lake: ['#98c9f5', '#72c9bd', '#44c972', '#38ab3d', '#4d6719', '#613102'],
    mineral: ['#529ee0', '#d9a6c2', '#08916d', '#f59b00', '#006699', '#f0e442'],
    extension: [
        '#3296ed',
        '#77b9f2',
        '#9d53f2',
        '#c398f5',
        '#26aba4',
        '#4ed4cd',
        '#f7a452',
        '#faca9b',
        '#f2536d',
        '#f598a7',
        '#96d44e',
        '#537bf2',
        '#7796f2',
        '#f253d2',
        '#f598e2'
    ]
};

export function getChartColors(type) {
    return PALETTE[type];
}
