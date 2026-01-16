/**
 * Convert string to URL-friendly slug
 * Handles Polish characters and other special characters
 *
 * Example:
 * - "Moja Główna Strona" → "moja-glowna-strona"
 * - "Produkty & Usługi" → "produkty-uslugí"
 */
export function stringToSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // Transliterate Polish characters
      .replace(/ą/g, 'a')
      .replace(/ć/g, 'c')
      .replace(/ę/g, 'e')
      .replace(/ł/g, 'l')
      .replace(/ń/g, 'n')
      .replace(/ó/g, 'o')
      .replace(/ś/g, 's')
      .replace(/ź/g, 'z')
      .replace(/ż/g, 'z')
      // Replace spaces and special chars with hyphens
      .replace(/[^\w\-]+/g, '-')
      // Remove consecutive hyphens
      .replace(/\-{2,}/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^\-+|\-+$/g, '')
  )
}

/**
 * Check if slug is valid (lowercase, hyphens, alphanumeric only)
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

/**
 * Make slug unique by appending counter if needed
 *
 * Example:
 * - "moja-strona" (exists) → "moja-strona-2"
 * - "moja-strona-2" (exists) → "moja-strona-3"
 */
export async function makeSlugUnique(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>,
  excludeId?: string | number
): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (await checkExists(slug)) {
    counter++
    slug = `${baseSlug}-${counter}`
  }

  return slug
}
