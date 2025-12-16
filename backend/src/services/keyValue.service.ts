import { KeyValue } from '../models/keyValue.model.js';
import { SITE_SETTINGS, SITE_SETTINGS_DEFAULTS, SiteSettingKey } from '../constants/siteSettings.js';

export class KeyValueService {
  async get(key: string): Promise<string | null> {
    const record = await KeyValue.findByPk(key);
    return record?.value ?? null;
  }

  async set(key: string, value: string, description?: string, userId?: string): Promise<KeyValue> {
    const [record] = await KeyValue.upsert({
      key,
      value,
      description,
      user_id: userId,
    });
    return record;
  }

  async delete(key: string): Promise<boolean> {
    const deleted = await KeyValue.destroy({ where: { key } });
    return deleted > 0;
  }

  async getAll(): Promise<KeyValue[]> {
    return KeyValue.findAll({ order: [['key', 'ASC']] });
  }

  async getByKeys(keys: string[]): Promise<Record<string, string | null>> {
    const records = await KeyValue.findAll({ where: { key: keys } });
    const result: Record<string, string | null> = {};
    for (const key of keys) {
      const record = records.find(r => r.key === key);
      result[key] = record?.value ?? null;
    }
    return result;
  }

  // Site settings specific methods
  async getSiteSetting(key: SiteSettingKey): Promise<string> {
    const value = await this.get(key);
    return value ?? SITE_SETTINGS_DEFAULTS[key]?.value ?? '';
  }

  async getAllSiteSettings(): Promise<Record<SiteSettingKey, string>> {
    const keys = Object.values(SITE_SETTINGS);
    const records = await KeyValue.findAll({ where: { key: keys } });

    const result = {} as Record<SiteSettingKey, string>;
    for (const key of keys) {
      const record = records.find(r => r.key === key);
      result[key] = record?.value ?? SITE_SETTINGS_DEFAULTS[key]?.value ?? '';
    }
    return result;
  }

  async setSiteSetting(key: SiteSettingKey, value: string, userId?: string): Promise<KeyValue> {
    const description = SITE_SETTINGS_DEFAULTS[key]?.description;
    return this.set(key, value, description, userId);
  }

  // Initialize default site settings if they don't exist
  async ensureDefaultSettings(): Promise<void> {
    for (const [key, defaults] of Object.entries(SITE_SETTINGS_DEFAULTS)) {
      const existing = await KeyValue.findByPk(key);
      if (!existing) {
        await KeyValue.create({
          key,
          value: defaults.value,
          description: defaults.description,
        });
        console.log(`  ⚙️  Created setting: ${key}`);
      }
    }
  }
}

export const keyValueService = new KeyValueService();
