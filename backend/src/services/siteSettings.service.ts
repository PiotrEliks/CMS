import { SiteSetting, SiteSettingsData } from '../models/siteSettings.model.js';

export class SiteSettingsService {
  async get(key: string): Promise<SiteSettingsData | null> {
    const setting = await SiteSetting.findOne({ where: { key } });
    return setting ? (setting.value as SiteSettingsData) : null;
  }

  async getAll(): Promise<Record<string, SiteSettingsData>> {
    const settings = await SiteSetting.findAll();
    const result: Record<string, SiteSettingsData> = {};

    settings.forEach((setting) => {
      result[setting.key] = setting.value as SiteSettingsData;
    });

    return result;
  }

  async getAllGrouped(): Promise<{
    general: SiteSettingsData;
    header: SiteSettingsData;
    footer: SiteSettingsData;
    social_media: SiteSettingsData;
    contact: SiteSettingsData;
    seo: SiteSettingsData;
    analytics: SiteSettingsData;
    advanced: SiteSettingsData;
  }> {
    const all = await this.getAll();

    return {
      general: all.general || {},
      header: all.header || {},
      footer: all.footer || {},
      social_media: all.social_media || {},
      contact: all.contact || {},
      seo: all.seo || {},
      analytics: all.analytics || {},
      advanced: all.advanced || {},
    };
  }

  async set(key: string, value: Partial<SiteSettingsData>): Promise<SiteSetting> {
    const [setting] = await SiteSetting.upsert({
      key,
      value: value as any,
      updated_at: new Date(),
    });

    return setting;
  }

  async update(key: string, updates: Partial<SiteSettingsData>): Promise<SiteSetting> {
    let setting = await SiteSetting.findOne({ where: { key } });

    if (!setting) {
      console.log(`[SiteSettings] Creating new setting for key: ${key}`);
      const [created] = await SiteSetting.upsert({
        key,
        value: updates as any,
        updated_at: new Date(),
      });
      return created;
    }

    const currentValue = (setting.value as SiteSettingsData) || {};
    const newValue = { ...currentValue, ...updates };

    await setting.update({ value: newValue as any, updated_at: new Date() });

    return setting;
  }

  async delete(key: string): Promise<boolean> {
    const deleted = await SiteSetting.destroy({ where: { key } });
    return deleted > 0;
  }

  async getPublic(): Promise<{
    general: any;
    header: any;
    footer: any;
    social_media: any;
    contact: any;
  }> {
    const all = await this.getAllGrouped();

    return {
      general: {
        site_name: all.general.site_name,
        site_tagline: all.general.site_tagline,
        site_description: all.general.site_description,
      },
      header: {
        header_logo_media_id: all.header.header_logo_media_id,
        header_menu_id: all.header.header_menu_id,
        header_background_type: all.header.header_background_type,
        header_background_color: all.header.header_background_color,
        header_background_media_id: all.header.header_background_media_id,
        header_show_social: all.header.header_show_social,
      },
      footer: {
        footer_logo_media_id: all.footer.footer_logo_media_id,
        footer_menu_id: all.footer.footer_menu_id,
        footer_description: all.footer.footer_description,
        footer_background_color: all.footer.footer_background_color,
        footer_copyright_text: all.footer.footer_copyright_text,
        footer_show_social: all.footer.footer_show_social,
      },
      social_media: all.social_media,
      contact: all.contact,
    };
  }
}

export const siteSettingsService = new SiteSettingsService();
