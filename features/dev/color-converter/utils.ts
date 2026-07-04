// features/dev/color-converter/utils.ts
export interface RGB {
    r: number;
    g: number;
    b: number;
}

export interface HSL {
    h: number;
    s: number;
    l: number;
}

export interface HSV {
    h: number;
    s: number;
    v: number;
}

export interface CMYK {
    c: number;
    m: number;
    y: number;
    k: number;
}

export interface ColorFormats {
    hex: string;
    rgb: RGB;
    hsl: HSL;
    hsv: HSV;
    cmyk: CMYK;
}

/*  HEX conversions  */

export function hexToRgb(hex: string): RGB | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
    return (
        "#" +
        [r, g, b]
            .map((x) => {
                const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            })
            .join("")
    );
}

/*  RGB to HSL  */

export function rgbToHsl(r: number, g: number, b: number): HSL {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}

export function hslToRgb(h: number, s: number, l: number): RGB {
    h /= 360;
    s /= 100;
    l /= 100;

    let r: number, g: number, b: number;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
}

/*  RGB to HSV  */

export function rgbToHsv(r: number, g: number, b: number): HSV {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;

    if (max !== min) {
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100),
    };
}

export function hsvToRgb(h: number, s: number, v: number): RGB {
    h /= 360;
    s /= 100;
    v /= 100;

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    let r: number, g: number, b: number;

    switch (i % 6) {
        case 0:
            (r = v), (g = t), (b = p);
            break;
        case 1:
            (r = q), (g = v), (b = p);
            break;
        case 2:
            (r = p), (g = v), (b = t);
            break;
        case 3:
            (r = p), (g = q), (b = v);
            break;
        case 4:
            (r = t), (g = p), (b = v);
            break;
        case 5:
            (r = v), (g = p), (b = q);
            break;
        default:
            r = g = b = 0;
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
}

/*  RGB to CMYK  */

export function rgbToCmyk(r: number, g: number, b: number): CMYK {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const k = 1 - Math.max(rNorm, gNorm, bNorm);
    const c = k === 1 ? 0 : (1 - rNorm - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - gNorm - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - bNorm - k) / (1 - k);

    return {
        c: Math.round(c * 100),
        m: Math.round(m * 100),
        y: Math.round(y * 100),
        k: Math.round(k * 100),
    };
}

export function cmykToRgb(c: number, m: number, y: number, k: number): RGB {
    const r = 255 * (1 - c / 100) * (1 - k / 100);
    const g = 255 * (1 - m / 100) * (1 - k / 100);
    const b = 255 * (1 - y / 100) * (1 - k / 100);

    return {
        r: Math.round(r),
        g: Math.round(g),
        b: Math.round(b),
    };
}

/*  Parse any color input  */

export function parseColor(input: string): ColorFormats | null {
    input = input.trim();

    // Try HEX
    if (/^#?[0-9A-Fa-f]{6}$/.test(input)) {
        const hex = input.startsWith("#") ? input : "#" + input;
        const rgb = hexToRgb(hex);
        if (rgb) {
            return {
                hex,
                rgb,
                hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
                hsv: rgbToHsv(rgb.r, rgb.g, rgb.b),
                cmyk: rgbToCmyk(rgb.r, rgb.g, rgb.b),
            };
        }
    }

    // Try RGB
    const rgbMatch = input.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (rgbMatch) {
        const rgb = {
            r: parseInt(rgbMatch[1]),
            g: parseInt(rgbMatch[2]),
            b: parseInt(rgbMatch[3]),
        };
        return {
            hex: rgbToHex(rgb.r, rgb.g, rgb.b),
            rgb,
            hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
            hsv: rgbToHsv(rgb.r, rgb.g, rgb.b),
            cmyk: rgbToCmyk(rgb.r, rgb.g, rgb.b),
        };
    }

    // Try HSL
    const hslMatch = input.match(/hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/i);
    if (hslMatch) {
        const hsl = {
            h: parseInt(hslMatch[1]),
            s: parseInt(hslMatch[2]),
            l: parseInt(hslMatch[3]),
        };
        const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        return {
            hex: rgbToHex(rgb.r, rgb.g, rgb.b),
            rgb,
            hsl,
            hsv: rgbToHsv(rgb.r, rgb.g, rgb.b),
            cmyk: rgbToCmyk(rgb.r, rgb.g, rgb.b),
        };
    }

    return null;
}

/*  Color manipulation  */

export function adjustLightness(hex: string, amount: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.l = Math.max(0, Math.min(100, hsl.l + amount));

    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

export function adjustSaturation(hex: string, amount: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.s = Math.max(0, Math.min(100, hsl.s + amount));

    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

export function adjustHue(hex: string, amount: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.h = (hsl.h + amount + 360) % 360;

    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/*  Generate color schemes  */

export function generateComplementary(hex: string): string[] {
    return [hex, adjustHue(hex, 180)];
}

export function generateTriadic(hex: string): string[] {
    return [hex, adjustHue(hex, 120), adjustHue(hex, 240)];
}

export function generateTetradic(hex: string): string[] {
    return [hex, adjustHue(hex, 90), adjustHue(hex, 180), adjustHue(hex, 270)];
}

export function generateAnalogous(hex: string): string[] {
    return [adjustHue(hex, -30), hex, adjustHue(hex, 30)];
}

export function generateMonochromatic(hex: string): string[] {
    return [
        adjustLightness(hex, -40),
        adjustLightness(hex, -20),
        hex,
        adjustLightness(hex, 20),
        adjustLightness(hex, 40),
    ];
}

export function generateShades(hex: string, count: number = 10): string[] {
    const shades: string[] = [];
    const step = 100 / (count - 1);

    for (let i = 0; i < count; i++) {
        const lightness = step * i;
        const rgb = hexToRgb(hex);
        if (!rgb) continue;

        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        hsl.l = lightness;

        const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        shades.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    }

    return shades;
}

export function generateTints(hex: string, count: number = 5): string[] {
    const tints: string[] = [];
    const rgb = hexToRgb(hex);
    if (!rgb) return [hex];

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const step = (100 - hsl.l) / count;

    for (let i = 0; i <= count; i++) {
        tints.push(adjustLightness(hex, step * i));
    }

    return tints;
}

export function generateTones(hex: string, count: number = 5): string[] {
    const tones: string[] = [];
    const rgb = hexToRgb(hex);
    if (!rgb) return [hex];

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const step = hsl.s / count;

    for (let i = count; i >= 0; i--) {
        const newHsl = { ...hsl, s: step * i };
        const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
        tones.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    }

    return tones;
}

/*  Accessibility  */

export function getContrastRatio(hex1: string, hex2: string): number {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    if (!rgb1 || !rgb2) return 0;

    const getLuminance = (r: number, g: number, b: number) => {
        const [rs, gs, bs] = [r, g, b].map((c) => {
            c /= 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
}

export function getWCAGCompliance(ratio: number): {
    AA_normal: boolean;
    AA_large: boolean;
    AAA_normal: boolean;
    AAA_large: boolean;
} {
    return {
        AA_normal: ratio >= 4.5,
        AA_large: ratio >= 3,
        AAA_normal: ratio >= 7,
        AAA_large: ratio >= 4.5,
    };
}

/*  Color names  */

export function getColorName(hex: string): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return "Unknown";

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Determine base hue
    let hueName = "";
    if (hsl.s < 10) {
        if (hsl.l > 90) return "White";
        if (hsl.l < 10) return "Black";
        return "Gray";
    }

    if (hsl.h >= 0 && hsl.h < 15) hueName = "Red";
    else if (hsl.h >= 15 && hsl.h < 45) hueName = "Orange";
    else if (hsl.h >= 45 && hsl.h < 75) hueName = "Yellow";
    else if (hsl.h >= 75 && hsl.h < 150) hueName = "Green";
    else if (hsl.h >= 150 && hsl.h < 200) hueName = "Cyan";
    else if (hsl.h >= 200 && hsl.h < 260) hueName = "Blue";
    else if (hsl.h >= 260 && hsl.h < 330) hueName = "Purple";
    else hueName = "Red";

    // Add lightness modifier
    if (hsl.l > 80) return `Light ${hueName}`;
    if (hsl.l < 20) return `Dark ${hueName}`;

    return hueName;
}