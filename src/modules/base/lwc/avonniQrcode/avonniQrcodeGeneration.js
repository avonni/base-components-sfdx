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

/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
/* eslint-disable no-constant-condition */
/* eslint-disable no-throw-literal */
/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */

/**
 * @module qrcode-generator-es6
 */

const PAD0 = 0xec;
const PAD1 = 0x11;

export default class AvonniqrcodeGeneration {
    constructor(typeNumber, errorCorrectionLevel) {
        this._typeNumber = typeNumber;
        this._errorCorrectionLevel =
            QRErrorCorrectionLevel[errorCorrectionLevel];
        this._modules = null;
        this._moduleCount = 0;
        this._dataCache = null;
        this._dataList = [];

        this.makeImpl = (test, maskPattern) => {
            this._moduleCount = this._typeNumber * 4 + 17;
            this._modules = (function (moduleCount) {
                let modules = new Array(moduleCount);
                for (let row = 0; row < moduleCount; row += 1) {
                    modules[row] = new Array(moduleCount);
                    for (let col = 0; col < moduleCount; col += 1) {
                        modules[row][col] = null;
                    }
                }
                return modules;
            })(this._moduleCount);

            this.setupPositionProbePattern(0, 0);
            this.setupPositionProbePattern(this._moduleCount - 7, 0);
            this.setupPositionProbePattern(0, this._moduleCount - 7);
            this.setupPositionAdjustPattern();
            this.setupTimingPattern();
            this.setupTypeInfo(test, maskPattern);

            if (this._typeNumber >= 7) {
                this.setupTypeNumber(test);
            }

            if (this._dataCache == null) {
                this._dataCache = this.createData(
                    this._typeNumber,
                    this._errorCorrectionLevel,
                    this._dataList
                );
            }

            this.mapData(this._dataCache, maskPattern);
        };

        this.setupPositionProbePattern = (row, col) => {
            for (let r = -1; r <= 7; r += 1) {
                if (row + r <= -1 || this._moduleCount <= row + r) continue;

                for (let c = -1; c <= 7; c += 1) {
                    if (col + c <= -1 || this._moduleCount <= col + c) continue;

                    if (
                        (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
                        (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
                        (2 <= r && r <= 4 && 2 <= c && c <= 4)
                    ) {
                        this._modules[row + r][col + c] = true;
                    } else {
                        this._modules[row + r][col + c] = false;
                    }
                }
            }
        };

        this.getBestMaskPattern = () => {
            let minLostPoint = 0;
            let pattern = 0;

            for (let i = 0; i < 8; i += 1) {
                this.makeImpl(true, i);

                let lostPoint = QRUtil.getLostPoint(this);

                if (i === 0 || minLostPoint > lostPoint) {
                    minLostPoint = lostPoint;
                    pattern = i;
                }
            }

            return pattern;
        };

        this.setupTimingPattern = () => {
            for (let r = 8; r < this._moduleCount - 8; r += 1) {
                if (this._modules[r][6] != null) {
                    continue;
                }
                this._modules[r][6] = r % 2 === 0;
            }

            for (let c = 8; c < this._moduleCount - 8; c += 1) {
                if (this._modules[6][c] != null) {
                    continue;
                }
                this._modules[6][c] = c % 2 === 0;
            }
        };

        this.setupPositionAdjustPattern = () => {
            let pos = QRUtil.getPatternPosition(this._typeNumber);

            for (let i = 0; i < pos.length; i += 1) {
                for (let j = 0; j < pos.length; j += 1) {
                    let row = pos[i];
                    let col = pos[j];

                    if (this._modules[row][col] != null) {
                        continue;
                    }

                    for (let r = -2; r <= 2; r += 1) {
                        for (let c = -2; c <= 2; c += 1) {
                            if (
                                r === -2 ||
                                r === 2 ||
                                c === -2 ||
                                c === 2 ||
                                (r === 0 && c === 0)
                            ) {
                                this._modules[row + r][col + c] = true;
                            } else {
                                this._modules[row + r][col + c] = false;
                            }
                        }
                    }
                }
            }
        };

        this.setupTypeNumber = (test) => {
            let bits = QRUtil.getBCHTypeNumber(this._typeNumber);

            for (let i = 0; i < 18; i += 1) {
                const mod = !test && ((bits >> i) & 1) === 1;
                this._modules[Math.floor(i / 3)][
                    (i % 3) + this._moduleCount - 8 - 3
                ] = mod;
            }

            for (let i = 0; i < 18; i += 1) {
                const mod = !test && ((bits >> i) & 1) === 1;
                this._modules[(i % 3) + this._moduleCount - 8 - 3][
                    Math.floor(i / 3)
                ] = mod;
            }
        };

        this.setupTypeInfo = (test, maskPattern) => {
            let data = (this._errorCorrectionLevel << 3) | maskPattern;
            let bits = QRUtil.getBCHTypeInfo(data);

            for (let i = 0; i < 15; i += 1) {
                const mod = !test && ((bits >> i) & 1) === 1;

                if (i < 6) {
                    this._modules[i][8] = mod;
                } else if (i < 8) {
                    this._modules[i + 1][8] = mod;
                } else {
                    this._modules[this._moduleCount - 15 + i][8] = mod;
                }
            }

            for (let i = 0; i < 15; i += 1) {
                const mod = !test && ((bits >> i) & 1) === 1;

                if (i < 8) {
                    this._modules[8][this._moduleCount - i - 1] = mod;
                } else if (i < 9) {
                    this._modules[8][15 - i - 1 + 1] = mod;
                } else {
                    this._modules[8][15 - i - 1] = mod;
                }
            }

            this._modules[this._moduleCount - 8][8] = !test;
        };

        this.mapData = (data, maskPattern) => {
            let inc = -1;
            let row = this._moduleCount - 1;
            let bitIndex = 7;
            let byteIndex = 0;
            let maskFunc = QRUtil.getMaskFunction(maskPattern);

            for (let col = this._moduleCount - 1; col > 0; col -= 2) {
                if (col === 6) col -= 1;

                while (true) {
                    for (let c = 0; c < 2; c += 1) {
                        if (this._modules[row][col - c] == null) {
                            let dark = false;

                            if (byteIndex < data.length) {
                                dark =
                                    ((data[byteIndex] >>> bitIndex) & 1) === 1;
                            }

                            let mask = maskFunc(row, col - c);

                            if (mask) {
                                dark = !dark;
                            }

                            this._modules[row][col - c] = dark;
                            bitIndex -= 1;

                            if (bitIndex === -1) {
                                byteIndex += 1;
                                bitIndex = 7;
                            }
                        }
                    }

                    row += inc;

                    if (row < 0 || this._moduleCount <= row) {
                        row -= inc;
                        inc = -inc;
                        break;
                    }
                }
            }
        };

        this.createBytes = (buffer, rsBlocks) => {
            let offset = 0;

            let maxDcCount = 0;
            let maxEcCount = 0;

            let dcdata = new Array(rsBlocks.length);
            let ecdata = new Array(rsBlocks.length);

            for (let r = 0; r < rsBlocks.length; r += 1) {
                let dcCount = rsBlocks[r].dataCount;
                let ecCount = rsBlocks[r].totalCount - dcCount;

                maxDcCount = Math.max(maxDcCount, dcCount);
                maxEcCount = Math.max(maxEcCount, ecCount);

                dcdata[r] = new Array(dcCount);

                for (let i = 0; i < dcdata[r].length; i += 1) {
                    dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
                }
                offset += dcCount;

                let rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
                let rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

                let modPoly = rawPoly.mod(rsPoly);
                ecdata[r] = new Array(rsPoly.getLength() - 1);
                for (let i = 0; i < ecdata[r].length; i += 1) {
                    let modIndex = i + modPoly.getLength() - ecdata[r].length;
                    ecdata[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
                }
            }

            let totalCodeCount = 0;
            for (let i = 0; i < rsBlocks.length; i += 1) {
                totalCodeCount += rsBlocks[i].totalCount;
            }

            let data = new Array(totalCodeCount);
            let index = 0;

            for (let i = 0; i < maxDcCount; i += 1) {
                for (let r = 0; r < rsBlocks.length; r += 1) {
                    if (i < dcdata[r].length) {
                        data[index] = dcdata[r][i];
                        index += 1;
                    }
                }
            }

            for (let i = 0; i < maxEcCount; i += 1) {
                for (let r = 0; r < rsBlocks.length; r += 1) {
                    if (i < ecdata[r].length) {
                        data[index] = ecdata[r][i];
                        index += 1;
                    }
                }
            }

            return data;
        };

        this.createData = (typeNumber, errorCorrectionLevel, dataList) => {
            let rsBlocks = QRRSBlock.getRSBlocks(
                typeNumber,
                errorCorrectionLevel
            );

            let buffer = qrBitBuffer();

            for (let i = 0; i < dataList.length; i += 1) {
                let data = dataList[i];
                buffer.put(data.getMode(), 4);
                buffer.put(
                    data.getLength(),
                    QRUtil.getLengthInBits(data.getMode(), typeNumber)
                );
                data.write(buffer);
            }

            let totalDataCount = 0;
            for (let i = 0; i < rsBlocks.length; i += 1) {
                totalDataCount += rsBlocks[i].dataCount;
            }

            if (buffer.getLengthInBits() > totalDataCount * 8) {
                throw (
                    'code length overflow. (' +
                    buffer.getLengthInBits() +
                    '>' +
                    totalDataCount * 8 +
                    ')'
                );
            }

            if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
                buffer.put(0, 4);
            }

            while (buffer.getLengthInBits() % 8 !== 0) {
                buffer.putBit(false);
            }

            while (true) {
                if (buffer.getLengthInBits() >= totalDataCount * 8) {
                    break;
                }
                buffer.put(PAD0, 8);

                if (buffer.getLengthInBits() >= totalDataCount * 8) {
                    break;
                }
                buffer.put(PAD1, 8);
            }

            return this.createBytes(buffer, rsBlocks);
        };
    }

    addData(data, mode) {
        mode = mode || 'Byte';

        let newData = generateByte(data, mode);

        this._dataList.push(newData);
        this._dataCache = null;
    }

    isDark(row, col) {
        if (
            row < 0 ||
            this._moduleCount <= row ||
            col < 0 ||
            this._moduleCount <= col
        ) {
            throw row + ',' + col;
        }
        return this._modules[row][col];
    }

    getModuleCount() {
        return this._moduleCount;
    }

    make() {
        if (this._typeNumber < 1) {
            let typeNumber = 1;

            for (; typeNumber < 40; typeNumber++) {
                let rsBlocks = QRRSBlock.getRSBlocks(
                    typeNumber,
                    this._errorCorrectionLevel
                );
                let buffer = qrBitBuffer();

                for (let i = 0; i < this._dataList.length; i++) {
                    let data = this._dataList[i];
                    buffer.put(data.getMode(), 4);
                    buffer.put(
                        data.getLength(),
                        QRUtil.getLengthInBits(data.getMode(), typeNumber)
                    );
                    data.write(buffer);
                }

                let totalDataCount = 0;
                for (let i = 0; i < rsBlocks.length; i++) {
                    totalDataCount += rsBlocks[i].dataCount;
                }

                if (buffer.getLengthInBits() <= totalDataCount * 8) {
                    break;
                }
            }

            this._typeNumber = typeNumber;
        }

        this.makeImpl(false, this.getBestMaskPattern());
    }

    /**
     * @param {Object} args
     * @param {function} [args.drawCell] A callback with arguments `column, row, x, y` to draw a cell.  `x, y` are the coordinates to draw it at.  `c, y` are the QR code module indexes.  Returns the svg element child string for the cell.
     * @param {function} [args.cellColor] A callback which returns the color for the cell.  By default, a function that returns `black`.  Unused if `drawCell` is provided.
     * @param {integer} [args.margin] The margin to draw around the QR code, by number of cells.
     * @param {Object} [args.bg] The background. White by default.
     * @param {boolean} args.bg.enabled Draw a background
     * @param {String} args.bg.fill Fill color of the background
     * @param {Object} [args.obstruction] An image to place in the center of the QR code.
     * @param {integer} args.obstruction.width Width of the obstruction as a percentage of QR code width.
     * @param {integer} args.obstruction.height Height of the obstruction as a percentage of QR code height.
     * @param {String} args.obstruction.path The path of the obstruction image. Exclusive with svgData.
     * @param {String} args.obstruction.svgData The SVG data to embed as an obstruction. Must start with `<svg`. Exclusive with path.
     * @param {String} args.svgSize SVG size
     * @returns {String} An svg tag as a string.
     */

    createSvgTag({
        drawCell,
        cellColor,
        cellSize,
        margin,
        bg,
        obstruction,
        border,
        svgSize
    }) {
        drawCell =
            drawCell ||
            ((c, r, x, y) =>
                '<rect ' +
                'width="' +
                cellSize +
                '" ' +
                'height="' +
                cellSize +
                '" ' +
                'x="' +
                x +
                '" ' +
                'y="' +
                y +
                '" ' +
                'fill="' +
                cellColor(c, r) +
                '" ' +
                'shape-rendering="crispEdges" ' +
                ' />');
        cellColor = cellColor || (() => 'black');
        cellSize = cellSize || 2;
        margin = typeof margin == 'undefined' ? cellSize * 4 : margin;
        let size = this.getModuleCount() * cellSize + margin * 2;
        let qrSvg = '';

        qrSvg += '<svg version="1.1"';
        qrSvg += ' xmlns="http://www.w3.org/2000/svg"';
        qrSvg += ' xmlns:xlink="http://www.w3.org/1999/xlink"';
        qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '"';
        if (svgSize) {
            qrSvg += ' width="' + svgSize + '" height="' + svgSize + '"';
        }
        qrSvg += ' preserveAspectRatio="xMinYMin meet">';
        if (!bg) {
            bg = {
                enabled: true,
                fill: 'white'
            };
        }
        if (bg.enabled) {
            qrSvg +=
                '<rect width="100%" height="100%" fill="' +
                bg.fill +
                '" x="0" y="0"' +
                '/>';
        }

        const modCount = this.getModuleCount();
        const totalSize = modCount * cellSize + margin * 2;
        let obstructionCRStart, obstructionCREnd;
        if (obstruction) {
            const { width, height } = obstruction;
            const spans = [
                Math.ceil(width * modCount),
                Math.ceil(height * modCount)
            ];
            obstructionCRStart = spans.map((s) =>
                Math.floor(modCount / 2 - s / 2)
            );
            obstructionCREnd = spans.map((s) =>
                Math.ceil(modCount / 2 + s / 2)
            );
        }

        for (let r = 0; r < modCount; r += 1) {
            const mr = r * cellSize + margin;
            for (let c = 0; c < modCount; c += 1) {
                const mc = c * cellSize + margin;
                if (
                    obstruction &&
                    c >= obstructionCRStart[0] &&
                    c < obstructionCREnd[0] &&
                    r >= obstructionCRStart[1] &&
                    r < obstructionCREnd[1]
                ) {
                    if (
                        c === obstructionCRStart[0] &&
                        r === obstructionCRStart[1]
                    ) {
                        const img_attrs =
                            'x="' +
                            (
                                totalSize *
                                (1.0 - obstruction.width) *
                                0.5
                            ).toFixed(3) +
                            '" ' +
                            'y="' +
                            (
                                totalSize *
                                (1.0 - obstruction.height) *
                                0.5
                            ).toFixed(3) +
                            '" ' +
                            'width="' +
                            (totalSize * obstruction.width).toFixed(3) +
                            '" ' +
                            'height="' +
                            (totalSize * obstruction.height).toFixed(3) +
                            '" ' +
                            'preserveAspectRatio="xMidYMid meet" ';
                        if (obstruction.path) {
                            qrSvg +=
                                '<image ' +
                                img_attrs +
                                'xlink:href="' +
                                obstruction.path +
                                '" />';
                        } else {
                            qrSvg +=
                                '<svg ' +
                                img_attrs +
                                obstruction.svgData.substring(4);
                        }
                    }
                } else if (this.isDark(r, c)) {
                    qrSvg += drawCell(c, r, mc, mr);
                }
            }
        }

        qrSvg += '</svg>';

        return qrSvg;
    }
}

export const stringToBytes = function (s) {
    let bytes = [];
    for (let i = 0; i < s.length; i += 1) {
        let c = s.charCodeAt(i);
        bytes.push(c & 0xff);
    }
    return bytes;
};

const QRMode = {
    MODE_NUMBER: 1 << 0,
    MODE_ALPHA_NUM: 1 << 1,
    MODE_8BIT_BYTE: 1 << 2,
    MODE_KANJI: 1 << 3
};

export const QRErrorCorrectionLevel = {
    L: 1,
    M: 0,
    Q: 3,
    H: 2
};

const QRMaskPattern = {
    PATTERN000: 0,
    PATTERN001: 1,
    PATTERN010: 2,
    PATTERN011: 3,
    PATTERN100: 4,
    PATTERN101: 5,
    PATTERN110: 6,
    PATTERN111: 7
};

const QRUtil = (function () {
    const PATTERN_POSITION_TABLE = [
        [],
        [6, 18],
        [6, 22],
        [6, 26],
        [6, 30],
        [6, 34],
        [6, 22, 38],
        [6, 24, 42],
        [6, 26, 46],
        [6, 28, 50],
        [6, 30, 54],
        [6, 32, 58],
        [6, 34, 62],
        [6, 26, 46, 66],
        [6, 26, 48, 70],
        [6, 26, 50, 74],
        [6, 30, 54, 78],
        [6, 30, 56, 82],
        [6, 30, 58, 86],
        [6, 34, 62, 90],
        [6, 28, 50, 72, 94],
        [6, 26, 50, 74, 98],
        [6, 30, 54, 78, 102],
        [6, 28, 54, 80, 106],
        [6, 32, 58, 84, 110],
        [6, 30, 58, 86, 114],
        [6, 34, 62, 90, 118],
        [6, 26, 50, 74, 98, 122],
        [6, 30, 54, 78, 102, 126],
        [6, 26, 52, 78, 104, 130],
        [6, 30, 56, 82, 108, 134],
        [6, 34, 60, 86, 112, 138],
        [6, 30, 58, 86, 114, 142],
        [6, 34, 62, 90, 118, 146],
        [6, 30, 54, 78, 102, 126, 150],
        [6, 24, 50, 76, 102, 128, 154],
        [6, 28, 54, 80, 106, 132, 158],
        [6, 32, 58, 84, 110, 136, 162],
        [6, 26, 54, 82, 110, 138, 166],
        [6, 30, 58, 86, 114, 142, 170]
    ];
    const G15 =
        (1 << 10) |
        (1 << 8) |
        (1 << 5) |
        (1 << 4) |
        (1 << 2) |
        (1 << 1) |
        (1 << 0);
    const G18 =
        (1 << 12) |
        (1 << 11) |
        (1 << 10) |
        (1 << 9) |
        (1 << 8) |
        (1 << 5) |
        (1 << 2) |
        (1 << 0);
    const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    let _this = {};

    let getBCHDigit = function (data) {
        let digit = 0;
        while (data !== 0) {
            digit += 1;
            data >>>= 1;
        }
        return digit;
    };

    _this.getBCHTypeInfo = function (data) {
        let d = data << 10;
        while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
            d ^= G15 << (getBCHDigit(d) - getBCHDigit(G15));
        }
        return ((data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function (data) {
        let d = data << 12;
        while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
            d ^= G18 << (getBCHDigit(d) - getBCHDigit(G18));
        }
        return (data << 12) | d;
    };

    _this.getPatternPosition = function (typeNumber) {
        return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function (maskPattern) {
        switch (maskPattern) {
            case QRMaskPattern.PATTERN000:
                return function (i, j) {
                    return (i + j) % 2 === 0;
                };
            case QRMaskPattern.PATTERN001:
                return function (i, _) {
                    return i % 2 === 0;
                };
            case QRMaskPattern.PATTERN010:
                return function (i, j) {
                    return j % 3 === 0;
                };
            case QRMaskPattern.PATTERN011:
                return function (i, j) {
                    return (i + j) % 3 === 0;
                };
            case QRMaskPattern.PATTERN100:
                return function (i, j) {
                    return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
                };
            case QRMaskPattern.PATTERN101:
                return function (i, j) {
                    return ((i * j) % 2) + ((i * j) % 3) === 0;
                };
            case QRMaskPattern.PATTERN110:
                return function (i, j) {
                    return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
                };
            case QRMaskPattern.PATTERN111:
                return function (i, j) {
                    return (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
                };

            default:
                throw 'bad maskPattern:' + maskPattern;
        }
    };

    _this.getErrorCorrectPolynomial = function (errorCorrectLength) {
        let a = qrPolynomial([1], 0);
        for (let i = 0; i < errorCorrectLength; i += 1) {
            a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0));
        }
        return a;
    };

    _this.getLengthInBits = function (mode, type) {
        if (1 <= type && type < 10) {
            switch (mode) {
                case QRMode.MODE_NUMBER:
                    return 10;
                case QRMode.MODE_ALPHA_NUM:
                    return 9;
                case QRMode.MODE_8BIT_BYTE:
                    return 8;
                case QRMode.MODE_KANJI:
                    return 8;
                default:
                    throw 'mode:' + mode;
            }
        } else if (type < 27) {
            switch (mode) {
                case QRMode.MODE_NUMBER:
                    return 12;
                case QRMode.MODE_ALPHA_NUM:
                    return 11;
                case QRMode.MODE_8BIT_BYTE:
                    return 16;
                case QRMode.MODE_KANJI:
                    return 10;
                default:
                    throw 'mode:' + mode;
            }
        } else if (type < 41) {
            switch (mode) {
                case QRMode.MODE_NUMBER:
                    return 14;
                case QRMode.MODE_ALPHA_NUM:
                    return 13;
                case QRMode.MODE_8BIT_BYTE:
                    return 16;
                case QRMode.MODE_KANJI:
                    return 12;
                default:
                    throw 'mode:' + mode;
            }
        } else {
            throw 'type:' + type;
        }
    };

    _this.getLostPoint = function (qrcode) {
        let moduleCount = qrcode.getModuleCount();

        let lostPoint = 0;

        for (let row = 0; row < moduleCount; row += 1) {
            for (let col = 0; col < moduleCount; col += 1) {
                let sameCount = 0;
                let dark = qrcode.isDark(row, col);

                for (let r = -1; r <= 1; r += 1) {
                    if (row + r < 0 || moduleCount <= row + r) {
                        continue;
                    }

                    for (let c = -1; c <= 1; c += 1) {
                        if (col + c < 0 || moduleCount <= col + c) {
                            continue;
                        }

                        if (r === 0 && c === 0) {
                            continue;
                        }

                        if (dark === qrcode.isDark(row + r, col + c)) {
                            sameCount += 1;
                        }
                    }
                }

                if (sameCount > 5) {
                    lostPoint += 3 + sameCount - 5;
                }
            }
        }

        for (let row = 0; row < moduleCount - 1; row += 1) {
            for (let col = 0; col < moduleCount - 1; col += 1) {
                let count = 0;
                if (qrcode.isDark(row, col)) count += 1;
                if (qrcode.isDark(row + 1, col)) count += 1;
                if (qrcode.isDark(row, col + 1)) count += 1;
                if (qrcode.isDark(row + 1, col + 1)) count += 1;
                if (count === 0 || count === 4) {
                    lostPoint += 3;
                }
            }
        }

        for (let row = 0; row < moduleCount; row += 1) {
            for (let col = 0; col < moduleCount - 6; col += 1) {
                if (
                    qrcode.isDark(row, col) &&
                    !qrcode.isDark(row, col + 1) &&
                    qrcode.isDark(row, col + 2) &&
                    qrcode.isDark(row, col + 3) &&
                    qrcode.isDark(row, col + 4) &&
                    !qrcode.isDark(row, col + 5) &&
                    qrcode.isDark(row, col + 6)
                ) {
                    lostPoint += 40;
                }
            }
        }

        for (let col = 0; col < moduleCount; col += 1) {
            for (let row = 0; row < moduleCount - 6; row += 1) {
                if (
                    qrcode.isDark(row, col) &&
                    !qrcode.isDark(row + 1, col) &&
                    qrcode.isDark(row + 2, col) &&
                    qrcode.isDark(row + 3, col) &&
                    qrcode.isDark(row + 4, col) &&
                    !qrcode.isDark(row + 5, col) &&
                    qrcode.isDark(row + 6, col)
                ) {
                    lostPoint += 40;
                }
            }
        }

        let darkCount = 0;

        for (let col = 0; col < moduleCount; col += 1) {
            for (let row = 0; row < moduleCount; row += 1) {
                if (qrcode.isDark(row, col)) {
                    darkCount += 1;
                }
            }
        }

        let ratio =
            Math.abs((100 * darkCount) / moduleCount / moduleCount - 50) / 5;
        lostPoint += ratio * 10;

        return lostPoint;
    };

    return _this;
})();

let QRMath = (function () {
    let EXP_TABLE = new Array(256);
    let LOG_TABLE = new Array(256);

    for (let i = 0; i < 8; i += 1) {
        EXP_TABLE[i] = 1 << i;
    }
    for (let i = 8; i < 256; i += 1) {
        EXP_TABLE[i] =
            EXP_TABLE[i - 4] ^
            EXP_TABLE[i - 5] ^
            EXP_TABLE[i - 6] ^
            EXP_TABLE[i - 8];
    }
    for (let i = 0; i < 255; i += 1) {
        LOG_TABLE[EXP_TABLE[i]] = i;
    }

    let _this = {};

    _this.glog = function (n) {
        if (n < 1) {
            throw 'glog(' + n + ')';
        }

        return LOG_TABLE[n];
    };

    _this.gexp = function (n) {
        while (n < 0) {
            n += 255;
        }

        while (n >= 256) {
            n -= 255;
        }

        return EXP_TABLE[n];
    };

    return _this;
})();

function qrPolynomial(num, shift) {
    if (typeof num.length == 'undefined') {
        throw num.length + '/' + shift;
    }

    let _num = (function () {
        let offset = 0;
        while (offset < num.length && num[offset] === 0) {
            offset += 1;
        }
        let _num = new Array(num.length - offset + shift);
        for (let i = 0; i < num.length - offset; i += 1) {
            _num[i] = num[i + offset];
        }
        return _num;
    })();

    let _this = {};

    _this.getAt = function (index) {
        return _num[index];
    };

    _this.getLength = function () {
        return _num.length;
    };

    _this.multiply = function (e) {
        let num = new Array(_this.getLength() + e.getLength() - 1);

        for (let i = 0; i < _this.getLength(); i += 1) {
            for (let j = 0; j < e.getLength(); j += 1) {
                num[i + j] ^= QRMath.gexp(
                    QRMath.glog(_this.getAt(i)) + QRMath.glog(e.getAt(j))
                );
            }
        }

        return qrPolynomial(num, 0);
    };

    _this.mod = function (e) {
        if (_this.getLength() - e.getLength() < 0) {
            return _this;
        }

        let ratio = QRMath.glog(_this.getAt(0)) - QRMath.glog(e.getAt(0));

        let num = new Array(_this.getLength());
        for (let i = 0; i < _this.getLength(); i += 1) {
            num[i] = _this.getAt(i);
        }

        for (let i = 0; i < e.getLength(); i += 1) {
            num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i)) + ratio);
        }

        return qrPolynomial(num, 0).mod(e);
    };

    return _this;
}

const QRRSBlock = (function () {
    let RS_BLOCK_TABLE = [
        // L
        // M
        // Q
        // H

        // 1
        [1, 26, 19],
        [1, 26, 16],
        [1, 26, 13],
        [1, 26, 9],

        // 2
        [1, 44, 34],
        [1, 44, 28],
        [1, 44, 22],
        [1, 44, 16],

        // 3
        [1, 70, 55],
        [1, 70, 44],
        [2, 35, 17],
        [2, 35, 13],

        // 4
        [1, 100, 80],
        [2, 50, 32],
        [2, 50, 24],
        [4, 25, 9],

        // 5
        [1, 134, 108],
        [2, 67, 43],
        [2, 33, 15, 2, 34, 16],
        [2, 33, 11, 2, 34, 12],

        // 6
        [2, 86, 68],
        [4, 43, 27],
        [4, 43, 19],
        [4, 43, 15],

        // 7
        [2, 98, 78],
        [4, 49, 31],
        [2, 32, 14, 4, 33, 15],
        [4, 39, 13, 1, 40, 14],

        // 8
        [2, 121, 97],
        [2, 60, 38, 2, 61, 39],
        [4, 40, 18, 2, 41, 19],
        [4, 40, 14, 2, 41, 15],

        // 9
        [2, 146, 116],
        [3, 58, 36, 2, 59, 37],
        [4, 36, 16, 4, 37, 17],
        [4, 36, 12, 4, 37, 13],

        // 10
        [2, 86, 68, 2, 87, 69],
        [4, 69, 43, 1, 70, 44],
        [6, 43, 19, 2, 44, 20],
        [6, 43, 15, 2, 44, 16],

        // 11
        [4, 101, 81],
        [1, 80, 50, 4, 81, 51],
        [4, 50, 22, 4, 51, 23],
        [3, 36, 12, 8, 37, 13],

        // 12
        [2, 116, 92, 2, 117, 93],
        [6, 58, 36, 2, 59, 37],
        [4, 46, 20, 6, 47, 21],
        [7, 42, 14, 4, 43, 15],

        // 13
        [4, 133, 107],
        [8, 59, 37, 1, 60, 38],
        [8, 44, 20, 4, 45, 21],
        [12, 33, 11, 4, 34, 12],

        // 14
        [3, 145, 115, 1, 146, 116],
        [4, 64, 40, 5, 65, 41],
        [11, 36, 16, 5, 37, 17],
        [11, 36, 12, 5, 37, 13],

        // 15
        [5, 109, 87, 1, 110, 88],
        [5, 65, 41, 5, 66, 42],
        [5, 54, 24, 7, 55, 25],
        [11, 36, 12, 7, 37, 13],

        // 16
        [5, 122, 98, 1, 123, 99],
        [7, 73, 45, 3, 74, 46],
        [15, 43, 19, 2, 44, 20],
        [3, 45, 15, 13, 46, 16],

        // 17
        [1, 135, 107, 5, 136, 108],
        [10, 74, 46, 1, 75, 47],
        [1, 50, 22, 15, 51, 23],
        [2, 42, 14, 17, 43, 15],

        // 18
        [5, 150, 120, 1, 151, 121],
        [9, 69, 43, 4, 70, 44],
        [17, 50, 22, 1, 51, 23],
        [2, 42, 14, 19, 43, 15],

        // 19
        [3, 141, 113, 4, 142, 114],
        [3, 70, 44, 11, 71, 45],
        [17, 47, 21, 4, 48, 22],
        [9, 39, 13, 16, 40, 14],

        // 20
        [3, 135, 107, 5, 136, 108],
        [3, 67, 41, 13, 68, 42],
        [15, 54, 24, 5, 55, 25],
        [15, 43, 15, 10, 44, 16],

        // 21
        [4, 144, 116, 4, 145, 117],
        [17, 68, 42],
        [17, 50, 22, 6, 51, 23],
        [19, 46, 16, 6, 47, 17],

        // 22
        [2, 139, 111, 7, 140, 112],
        [17, 74, 46],
        [7, 54, 24, 16, 55, 25],
        [34, 37, 13],

        // 23
        [4, 151, 121, 5, 152, 122],
        [4, 75, 47, 14, 76, 48],
        [11, 54, 24, 14, 55, 25],
        [16, 45, 15, 14, 46, 16],

        // 24
        [6, 147, 117, 4, 148, 118],
        [6, 73, 45, 14, 74, 46],
        [11, 54, 24, 16, 55, 25],
        [30, 46, 16, 2, 47, 17],

        // 25
        [8, 132, 106, 4, 133, 107],
        [8, 75, 47, 13, 76, 48],
        [7, 54, 24, 22, 55, 25],
        [22, 45, 15, 13, 46, 16],

        // 26
        [10, 142, 114, 2, 143, 115],
        [19, 74, 46, 4, 75, 47],
        [28, 50, 22, 6, 51, 23],
        [33, 46, 16, 4, 47, 17],

        // 27
        [8, 152, 122, 4, 153, 123],
        [22, 73, 45, 3, 74, 46],
        [8, 53, 23, 26, 54, 24],
        [12, 45, 15, 28, 46, 16],

        // 28
        [3, 147, 117, 10, 148, 118],
        [3, 73, 45, 23, 74, 46],
        [4, 54, 24, 31, 55, 25],
        [11, 45, 15, 31, 46, 16],

        // 29
        [7, 146, 116, 7, 147, 117],
        [21, 73, 45, 7, 74, 46],
        [1, 53, 23, 37, 54, 24],
        [19, 45, 15, 26, 46, 16],

        // 30
        [5, 145, 115, 10, 146, 116],
        [19, 75, 47, 10, 76, 48],
        [15, 54, 24, 25, 55, 25],
        [23, 45, 15, 25, 46, 16],

        // 31
        [13, 145, 115, 3, 146, 116],
        [2, 74, 46, 29, 75, 47],
        [42, 54, 24, 1, 55, 25],
        [23, 45, 15, 28, 46, 16],

        // 32
        [17, 145, 115],
        [10, 74, 46, 23, 75, 47],
        [10, 54, 24, 35, 55, 25],
        [19, 45, 15, 35, 46, 16],

        // 33
        [17, 145, 115, 1, 146, 116],
        [14, 74, 46, 21, 75, 47],
        [29, 54, 24, 19, 55, 25],
        [11, 45, 15, 46, 46, 16],

        // 34
        [13, 145, 115, 6, 146, 116],
        [14, 74, 46, 23, 75, 47],
        [44, 54, 24, 7, 55, 25],
        [59, 46, 16, 1, 47, 17],

        // 35
        [12, 151, 121, 7, 152, 122],
        [12, 75, 47, 26, 76, 48],
        [39, 54, 24, 14, 55, 25],
        [22, 45, 15, 41, 46, 16],

        // 36
        [6, 151, 121, 14, 152, 122],
        [6, 75, 47, 34, 76, 48],
        [46, 54, 24, 10, 55, 25],
        [2, 45, 15, 64, 46, 16],

        // 37
        [17, 152, 122, 4, 153, 123],
        [29, 74, 46, 14, 75, 47],
        [49, 54, 24, 10, 55, 25],
        [24, 45, 15, 46, 46, 16],

        // 38
        [4, 152, 122, 18, 153, 123],
        [13, 74, 46, 32, 75, 47],
        [48, 54, 24, 14, 55, 25],
        [42, 45, 15, 32, 46, 16],

        // 39
        [20, 147, 117, 4, 148, 118],
        [40, 75, 47, 7, 76, 48],
        [43, 54, 24, 22, 55, 25],
        [10, 45, 15, 67, 46, 16],

        // 40
        [19, 148, 118, 6, 149, 119],
        [18, 75, 47, 31, 76, 48],
        [34, 54, 24, 34, 55, 25],
        [20, 45, 15, 61, 46, 16]
    ];

    let qrRSBlock = function (totalCount, dataCount) {
        let _this = {};
        _this.totalCount = totalCount;
        _this.dataCount = dataCount;
        return _this;
    };

    let _this = {};

    let getRsBlockTable = function (typeNumber, errorCorrectionLevel) {
        switch (errorCorrectionLevel) {
            case QRErrorCorrectionLevel.L:
                return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
            case QRErrorCorrectionLevel.M:
                return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
            case QRErrorCorrectionLevel.Q:
                return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
            case QRErrorCorrectionLevel.H:
                return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
            default:
                return undefined;
        }
    };

    _this.getRSBlocks = function (typeNumber, errorCorrectionLevel) {
        let rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

        if (typeof rsBlock == 'undefined') {
            throw (
                'bad rs block @ typeNumber:' +
                typeNumber +
                '/errorCorrectionLevel:' +
                errorCorrectionLevel
            );
        }

        let length = rsBlock.length / 3;

        let list = [];

        for (let i = 0; i < length; i += 1) {
            let count = rsBlock[i * 3 + 0];
            let totalCount = rsBlock[i * 3 + 1];
            let dataCount = rsBlock[i * 3 + 2];

            for (let j = 0; j < count; j += 1) {
                list.push(qrRSBlock(totalCount, dataCount));
            }
        }

        return list;
    };

    return _this;
})();

let qrBitBuffer = function () {
    let _buffer = [];
    let _length = 0;

    let _this = {};

    _this.getBuffer = function () {
        return _buffer;
    };

    _this.getAt = function (index) {
        let bufIndex = Math.floor(index / 8);
        return ((_buffer[bufIndex] >>> (7 - (index % 8))) & 1) === 1;
    };

    _this.put = function (num, length) {
        for (let i = 0; i < length; i += 1) {
            _this.putBit(((num >>> (length - i - 1)) & 1) === 1);
        }
    };

    _this.getLengthInBits = function () {
        return _length;
    };

    _this.putBit = function (bit) {
        let bufIndex = Math.floor(_length / 8);
        if (_buffer.length <= bufIndex) {
            _buffer.push(0);
        }

        if (bit) {
            _buffer[bufIndex] |= 0x80 >>> _length % 8;
        }

        _length += 1;
    };

    return _this;
};

const generateByte = function (data, mode) {
    let _mode = QRMode.MODE_8BIT_BYTE;
    let _bytes;

    if (mode === 'ISO_8859_1') {
        _bytes = stringToBytes(data);
    } else {
        _bytes = new TextEncoder().encode(data);
    }

    let _this = {};

    _this.getMode = function () {
        return _mode;
    };

    _this.getLength = function (_) {
        return _bytes.length;
    };

    _this.write = function (buffer) {
        for (let i = 0; i < _bytes.length; i += 1) {
            buffer.put(_bytes[i], 8);
        }
    };

    return _this;
};
