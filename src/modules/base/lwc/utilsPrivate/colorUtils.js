const HEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const HEXA = /^#([A-Fa-f0-9]{8}|[A-Fa-f0-9]{4})$/;
const RGB = /^rgb\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){2}|((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s)){2})((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]))|((((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){2}|((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){2})(([1-9]?\d(\.\d+)?)|100|(\.\d+))%))\)$/;
const RGBA = /^rgba\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){3})|(((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){3}))|(((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s){3})|(((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){3}))\/\s)((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/;
const HSL = /^hsl\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}|(\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2})\)$/;
const HSLA = /^hsla\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)(((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2},\s?)|((\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}\s\/\s))((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/;

export function generateColors(color) {
    let colors = {
        hex: '',
        hexa: '',
        rgb: '',
        rgba: '',
        hsl: '',
        hsla: '',
        hsv: {
            h: '',
            s: '',
            v: ''
        },
        R: '',
        G: '',
        B: '',
        A: '',
        H: '',
        S: '',
        L: ''
    };

    let type = colorType(color);

    if (type === null) {
        return colors;
    }

    if (type === 'hex') {
        colors.hex = color;
        colors.rgb = hexToRGB(color);
    }

    if (type === 'hexa') {
        colors.hexa = color;
        colors.rgba = hexAToRGBA(color);
    }

    if (type === 'rgb') {
        colors.rgb = color;
    }

    if (type === 'rgba') {
        colors.rgba = color;
    }

    if (type === 'hsl') {
        colors.hsl = color;
        colors.rgb = HSLToRGB(color);
    }

    if (type === 'hsla') {
        colors.hsla = color;
        colors.rgba = HSLAToRGBA(color);
    }

    if (type === 'hex' || type === 'rgb' || type === 'hsl') {
        colors.rgba = RGBtoRGBA(colors.rgb);
    }

    if (type === 'hexa' || type === 'rgba' || type === 'hsla') {
        colors.rgb = RGBAtoRGB(colors.rgba);
    }

    if (type !== 'hexa') {
        colors.hexa = RGBAToHexA(colors.rgba);
    }

    if (type !== 'hsl') {
        colors.hsl = RGBToHSL(colors.rgb);
    }

    if (type !== 'hsla') {
        colors.hsla = RGBAToHSLA(colors.rgba);
    }

    if (type !== 'hex') {
        colors.hex = RGBToHex(colors.rgb);
    }

    let rgbValues = colors.rgba
        .replace('rgba(', '')
        .replace(')', '')
        .split(',');

    colors.R = rgbValues[0].trim();
    colors.G = rgbValues[1].trim();
    colors.B = rgbValues[2].trim();
    colors.A = rgbValues[3].trim();

    let hslaValues = colors.hsla
        .replace('hsla(', '')
        .replace(')', '')
        .split(',');

    colors.H = hslaValues[0].trim();
    colors.S = hslaValues[1].replace('%', '').trim();
    colors.L = hslaValues[2].replace('%', '').trim();

    colors.hsv = RGBtoHSV(colors.R, colors.G, colors.B);
    return colors;
}

export function colorType(value) {
    if (HEX.test(value)) {
        return 'hex';
    }

    if (HEXA.test(value)) {
        return 'hexa';
    }

    if (RGB.test(value)) {
        return 'rgb';
    }

    if (RGBA.test(value)) {
        return 'rgba';
    }

    if (HSL.test(value)) {
        return 'hsl';
    }

    if (HSLA.test(value)) {
        return 'hsla';
    }

    return null;
}

export function RGBToHex(rgb) {
    let sep = rgb.indexOf(',') > -1 ? ',' : ' ';

    rgb = rgb
        .substr(4)
        .split(')')[0]
        .split(sep);

    for (let i in rgb) {
        if (rgb.hasOwnProperty(i)) {
            if (rgb[i].indexOf('%') > -1) {
                rgb[i] = Math.round(
                    (rgb[i].substr(0, rgb[i].length - 1) / 100) * 255
                );
            }
        }
    }

    let r = (+rgb[0]).toString(16);
    let g = (+rgb[1]).toString(16);
    let b = (+rgb[2]).toString(16);

    if (r.length === 1) {
        r = '0' + r;
    }

    if (g.length === 1) {
        g = '0' + g;
    }

    if (b.length === 1) {
        b = '0' + b;
    }

    return '#' + r + g + b;
}

export function RGBAToHexA(rgba) {
    let sep = rgba.indexOf(',') > -1 ? ',' : ' ';
    rgba = rgba
        .substr(5)
        .split(')')[0]
        .split(sep);
    if (rgba.indexOf('/') > -1) {
        rgba.splice(3, 1);
    }

    for (let i in rgba) {
        if (rgba.hasOwnProperty(i)) {
            if (rgba[i].indexOf('%') > -1) {
                let p = rgba[i].substr(0, rgba[i].length - 1) / 100;
    
                if (i < 3) {
                    rgba[i] = Math.round(p * 255);
                } else {
                    rgba[i] = p;
                }
            }
        }
    }

    let r = (+rgba[0]).toString(16);
    let g = (+rgba[1]).toString(16);
    let b = (+rgba[2]).toString(16);
    let a = Math.round(+rgba[3] * 255).toString(16);

    if (r.length === 1) {
        r = '0' + r;
    }

    if (g.length === 1) {
        g = '0' + g;
    }

    if (b.length === 1) {
        b = '0' + b;
    }

    if (a.length === 1) {
        a = '0' + a;
    }

    return '#' + r + g + b + a;
}

export function hexToRGB(h) {
    let r = 0;
    let g = 0;
    let b = 0;

    if (h.length === 4) {
        r = '0x' + h[1] + h[1];
        g = '0x' + h[2] + h[2];
        b = '0x' + h[3] + h[3];
    } else if (h.length === 7) {
        r = '0x' + h[1] + h[2];
        g = '0x' + h[3] + h[4];
        b = '0x' + h[5] + h[6];
    }

    return 'rgb(' + +r + ',' + +g + ',' + +b + ')';
}

export function hexAToRGBA(h) {
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 1;

    if (h.length === 5) {
        r = '0x' + h[1] + h[1];
        g = '0x' + h[2] + h[2];
        b = '0x' + h[3] + h[3];
        a = '0x' + h[4] + h[4];
    } else if (h.length === 9) {
        r = '0x' + h[1] + h[2];
        g = '0x' + h[3] + h[4];
        b = '0x' + h[5] + h[6];
        a = '0x' + h[7] + h[8];
    }
    a = +(a / 255).toFixed(3);

    return 'rgba(' + +r + ',' + +g + ',' + +b + ',' + +a + ')';
}

export function RGBToHSL(rgb) {
    let sep = rgb.indexOf(',') > -1 ? ',' : ' ';
    rgb = rgb
        .substr(4)
        .split(')')[0]
        .split(sep);

    for (let i in rgb) {
        if (rgb.hasOwnProperty(i)) {
            if (rgb[i].indexOf('%') > -1) {
                rgb[i] = Math.round(
                    (rgb[i].substr(0, rgb[i].length - 1) / 100) * 255
                );
            }
        }
    }

    let r = rgb[0] / 255;
    let g = rgb[1] / 255;
    let b = rgb[2] / 255;
    let cmin = Math.min(r, g, b);
    let cmax = Math.max(r, g, b);
    let delta = cmax - cmin;
    let h = 0;
    let s = 0;
    let l = 0;

    if (delta === 0) {
        h = 0;
    } else if (cmax === r) {
        h = ((g - b) / delta) % 6;
    } else if (cmax === g) {
        h = (b - r) / delta + 2;
    } else {
        h = (r - g) / delta + 4;
    }

    h = Math.round(h * 60);

    if (h < 0) {
        h += 360;
    }

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}

export function RGBAToHSLA(rgba) {
    let sep = rgba.indexOf(',') > -1 ? ',' : ' ';
    rgba = rgba
        .substr(5)
        .split(')')[0]
        .split(sep);

    if (rgba.indexOf('/') > -1) {
        rgba.splice(3, 1);
    }

    for (let i in rgba) {
        if (rgba.hasOwnProperty(i)) {
            if (rgba[i].indexOf('%') > -1) {
                let p = rgba[i].substr(0, rgba[i].length - 1) / 100;
    
                if (i < 3) {
                    rgba[i] = Math.round(p * 255);
                } else {
                    rgba[i] = p;
                }
            }
        }
    }

    let r = rgba[0] / 255;
    let g = rgba[1] / 255;
    let b = rgba[2] / 255;
    let a = rgba[3];

    let cmin = Math.min(r, g, b);
    let cmax = Math.max(r, g, b);
    let delta = cmax - cmin;
    let h = 0;
    let s = 0;
    let l = 0;

    if (delta === 0) {
        h = 0;
    } else if (cmax === r) {
        h = ((g - b) / delta) % 6;
    } else if (cmax === g) {
        h = (b - r) / delta + 2;
    } else {
        h = (r - g) / delta + 4;
    }

    h = Math.round(h * 60);

    if (h < 0) {
        h += 360;
    }

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
}

export function HSLToRGB(hsl) {
    let sep = hsl.indexOf(',') > -1 ? ',' : ' ';
    hsl = hsl
        .substr(4)
        .split(')')[0]
        .split(sep);

    let h = hsl[0];
    let s = hsl[1].substr(0, hsl[1].length - 1) / 100;
    let l = hsl[2].substr(0, hsl[2].length - 1) / 100;

    if (h.indexOf('deg') > -1) {
        h = h.substr(0, h.length - 3);
    } else if (h.indexOf('rad') > -1) {
        h = Math.round(h.substr(0, h.length - 3) * (180 / Math.PI));
    } else if (h.indexOf('turn') > -1) {
        h = Math.round(h.substr(0, h.length - 4) * 360);
    }

    if (h >= 360) {
        h %= 360;
    }

    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = l - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

export function HSLAToRGBA(hsla) {
    let sep = hsla.indexOf(',') > -1 ? ',' : ' ';
    hsla = hsla
        .substr(5)
        .split(')')[0]
        .split(sep);

    if (hsla.indexOf('/') > -1) {
        hsla.splice(3, 1);
    }

    let h = hsla[0];
    let s = hsla[1].substr(0, hsla[1].length - 1) / 100;
    let l = hsla[2].substr(0, hsla[2].length - 1) / 100;
    let a = hsla[3];

    if (h.indexOf('deg') > -1) {
        h = h.substr(0, h.length - 3);
    } else if (h.indexOf('rad') > -1) {
        h = Math.round(h.substr(0, h.length - 3) * (180 / Math.PI));
    } else if (h.indexOf('turn') > -1) {
        h = Math.round(h.substr(0, h.length - 4) * 360);
    }

    if (h >= 360) {
        h %= 360;
    }

    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = l - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

export function hexToHSL(H) {
    let r = 0;
    let g = 0;
    let b = 0;

    if (H.length === 4) {
        r = '0x' + H[1] + H[1];
        g = '0x' + H[2] + H[2];
        b = '0x' + H[3] + H[3];
    } else if (H.length === 7) {
        r = '0x' + H[1] + H[2];
        g = '0x' + H[3] + H[4];
        b = '0x' + H[5] + H[6];
    }

    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b);
    let cmax = Math.max(r, g, b);
    let delta = cmax - cmin;
    let h = 0;
    let s = 0;
    let l = 0;

    if (delta === 0) {
        h = 0;
    } else if (cmax === r) {
        h = ((g - b) / delta) % 6;
    } else if (cmax === g) {
        h = (b - r) / delta + 2;
    } else {
        h = (r - g) / delta + 4;
    }

    h = Math.round(h * 60);

    if (h < 0) {
        h += 360;
    }

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}

export function hexAToHSLA(H) {
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 1;

    if (H.length === 5) {
        r = '0x' + H[1] + H[1];
        g = '0x' + H[2] + H[2];
        b = '0x' + H[3] + H[3];
        a = '0x' + H[4] + H[4];
    } else if (H.length === 9) {
        r = '0x' + H[1] + H[2];
        g = '0x' + H[3] + H[4];
        b = '0x' + H[5] + H[6];
        a = '0x' + H[7] + H[8];
    }

    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b);
    let cmax = Math.max(r, g, b);
    let delta = cmax - cmin;
    let h = 0;
    let s = 0;
    let l = 0;

    if (delta === 0) {
        h = 0;
    } else if (cmax === r) {
        h = ((g - b) / delta) % 6;
    } else if (cmax === g) {
        h = (b - r) / delta + 2;
    } else {
        h = (r - g) / delta + 4;
    }

    h = Math.round(h * 60);

    if (h < 0) {
        h += 360;
    }

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    a = (a / 255).toFixed(3);

    return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
}

export function HSLToHex(hsl) {
    let sep = hsl.indexOf(',') > -1 ? ',' : ' ';
    hsl = hsl
        .substr(4)
        .split(')')[0]
        .split(sep);

    let h = hsl[0];
    let s = hsl[1].substr(0, hsl[1].length - 1) / 100;
    let l = hsl[2].substr(0, hsl[2].length - 1) / 100;

    if (h.indexOf('deg') > -1) {
        h = h.substr(0, h.length - 3);
    } else if (h.indexOf('rad') > -1) {
        h = Math.round(h.substr(0, h.length - 3) * (180 / Math.PI));
    } else if (h.indexOf('turn') > -1) {
        h = Math.round(h.substr(0, h.length - 4) * 360);
    }

    if (h >= 360) {
        h %= 360;
    }

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
        m = l - c / 2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
    }

    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);

    if (r.length === 1) {
        r = '0' + r;
    }

    if (g.length === 1) {
        g = '0' + g;
    }

    if (b.length === 1) {
        b = '0' + b;
    }

    return '#' + r + g + b;
}

export function HSLAToHexA(hsla) {
    let sep = hsla.indexOf(',') > -1 ? ',' : ' ';
    hsla = hsla
        .substr(5)
        .split(')')[0]
        .split(sep);

    if (hsla.indexOf('/') > -1) {
        hsla.splice(3, 1);
    }

    let h = hsla[0];
    let s = hsla[1].substr(0, hsla[1].length - 1) / 100;
    let l = hsla[2].substr(0, hsla[2].length - 1) / 100;
    let a = hsla[3];

    if (h.indexOf('deg') > -1) {
        h = h.substr(0, h.length - 3);
    } else if (h.indexOf('rad') > -1) {
        h = Math.round(h.substr(0, h.length - 3) * (180 / Math.PI));
    } else if (h.indexOf('turn') > -1) {
        h = Math.round(h.substr(0, h.length - 4) * 360);
    }

    if (h >= 360) {
        h %= 360;
    }

    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = l - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
    }

    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);

    a = Math.round(a * 255).toString(16);

    if (r.length === 1) {
        r = '0' + r;
    }

    if (g.length === 1) {
        g = '0' + g;
    }

    if (b.length === 1) {
        b = '0' + b;
    }

    if (a.length === 1) {
        a = '0' + a;
    }

    return '#' + r + g + b + a;
}

export function RGBAtoRGB(rgba) {
    let data = rgba.replace('rgba', 'rgb').split(',');
    data.pop();
    return data.join(',') + ')';
}

export function RGBtoRGBA(rgb) {
    return rgb.replace(')', ',1)').replace('rgb', 'rgba');
}

export function RGBtoHSV(r, g, b) {
    const R1 = r / 255;
    const G1 = g / 255;
    const B1 = b / 255;

    const MaxC = Math.max(R1, G1, B1);
    const MinC = Math.min(R1, G1, B1);

    const DeltaC = MaxC - MinC;

    let H = 0;

    if (DeltaC === 0) {
        H = 0;
    } else if (MaxC === R1) {
        H = 60 * (((G1 - B1) / DeltaC) % 6);
    } else if (MaxC === G1) {
        H = 60 * ((B1 - R1) / DeltaC + 2);
    } else if (MaxC === B1) {
        H = 60 * ((R1 - G1) / DeltaC + 4);
    }

    if (H < 0) {
        H = 360 + H;
    }

    let S = 0;
    let V = MaxC;

    if (MaxC === 0) {
        S = 0;
    } else {
        S = DeltaC / MaxC;
    }

    return { h: H, s: S, v: V };
}

export function HSVToHSL(hue, sat, val) {
    let hsl = {
        H: '',
        S: '',
        L: ''
    };

    hsl.H = hue;

    let hueVal = (2 - sat) * val;

    if (hueVal < 1) {
        hsl.S = (sat * val) / hueVal;
    } else if (hueVal === 2) {
        hsl.S = 0;
    } else {
        hsl.S = (sat * val) / (2 - hueVal);
    }

    hsl.L = hueVal / 2;

    return hsl;
}
