import path from 'path'

export function normalizeFilename(originalName: string): string {
    const ext = path.extname(originalName)
    const name = path.basename(originalName, ext)

    const translitMap: Record<string, string> = {
        ą: 'a',
        ć: 'c',
        ę: 'e',
        ł: 'l',
        ń: 'n',
        ó: 'o',
        ś: 's',
        ź: 'z',
        ż: 'z',
        Ą: 'A',
        Ć: 'C',
        Ę: 'E',
        Ł: 'L',
        Ń: 'N',
        Ó: 'O',
        Ś: 'S',
        Ź: 'Z',
        Ż: 'Z',

        ä: 'a',
        ö: 'o',
        ü: 'u',
        ß: 'ss',
        Ä: 'A',
        Ö: 'O',
        Ü: 'U',

        à: 'a',
        â: 'a',
        é: 'e',
        è: 'e',
        ê: 'e',
        ë: 'e',
        î: 'i',
        ï: 'i',
        ô: 'o',
        ù: 'u',
        û: 'u',
        ü: 'u',
        ÿ: 'y',
        ç: 'c',
        À: 'A',
        Â: 'A',
        É: 'E',
        È: 'E',
        Ê: 'E',
        Ë: 'E',
        Î: 'I',
        Ï: 'I',
        Ô: 'O',
        Ù: 'U',
        Û: 'U',
        Ÿ: 'Y',
        Ç: 'C',

        ñ: 'n',
        Ñ: 'N',

        å: 'a',
        æ: 'ae',
        ø: 'o',
        Å: 'A',
        Æ: 'AE',
        Ø: 'O',
    }

    let base = name
        .split('')
        .map((char) => translitMap[char] || char)
        .join('')

    base = base.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')

    base = base
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase()

    return `${base || 'file'}${ext.toLowerCase()}`
}
