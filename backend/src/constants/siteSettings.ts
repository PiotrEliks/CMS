// System KeyValue keys for site settings
// These constants define the keys used in the key_value table

export const SITE_SETTINGS = {
  // Site header/brand name displayed in navbar
  SITE_HEADER_NAME: 'SITE_HEADER_NAME',

  // Site description for SEO/footer
  SITE_DESCRIPTION: 'SITE_DESCRIPTION',

  // Contact information
  SITE_EMAIL: 'SITE_EMAIL',
  SITE_PHONE: 'SITE_PHONE',
  SITE_ADDRESS: 'SITE_ADDRESS',

  // Social media links
  SITE_FACEBOOK: 'SITE_FACEBOOK',
  SITE_INSTAGRAM: 'SITE_INSTAGRAM',
  SITE_TWITTER: 'SITE_TWITTER',
} as const;

export type SiteSettingKey = typeof SITE_SETTINGS[keyof typeof SITE_SETTINGS];

// Default values for site settings
export const SITE_SETTINGS_DEFAULTS: Record<SiteSettingKey, { value: string; description: string }> = {
  [SITE_SETTINGS.SITE_HEADER_NAME]: {
    value: 'Hairsal',
    description: 'Site name displayed in the header/navbar',
  },
  [SITE_SETTINGS.SITE_DESCRIPTION]: {
    value: 'Professional hair salon services',
    description: 'Site description for SEO and footer',
  },
  [SITE_SETTINGS.SITE_EMAIL]: {
    value: 'kontakt@example.com',
    description: 'Contact email address',
  },
  [SITE_SETTINGS.SITE_PHONE]: {
    value: '+48 123 456 789',
    description: 'Contact phone number',
  },
  [SITE_SETTINGS.SITE_ADDRESS]: {
    value: 'ul. Przykładowa 1, Warszawa',
    description: 'Business address',
  },
  [SITE_SETTINGS.SITE_FACEBOOK]: {
    value: '',
    description: 'Facebook page URL',
  },
  [SITE_SETTINGS.SITE_INSTAGRAM]: {
    value: '',
    description: 'Instagram profile URL',
  },
  [SITE_SETTINGS.SITE_TWITTER]: {
    value: '',
    description: 'Twitter/X profile URL',
  },
};
