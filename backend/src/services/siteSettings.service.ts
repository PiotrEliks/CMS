import { SiteSetting, SiteSettingsData } from '../models/siteSettings.model.js'
import { Media } from '../models/media.model.js'

export class SiteSettingsService {
  async get(key: string): Promise<SiteSettingsData | null> {
    const setting = await SiteSetting.findOne({ where: { key } })
    return setting ? (setting.value as SiteSettingsData) : null
  }

  async getAll(): Promise<Record<string, SiteSettingsData>> {
    const settings = await SiteSetting.findAll()
    const result: Record<string, SiteSettingsData> = {}

    settings.forEach((setting) => {
      result[setting.key] = setting.value as SiteSettingsData
    })

    return result
  }

  async getAllGrouped(): Promise<{
    general: SiteSettingsData
    header: SiteSettingsData
    footer: SiteSettingsData
    social_media: SiteSettingsData
    contact: SiteSettingsData
    seo: SiteSettingsData
    analytics: SiteSettingsData
    advanced: SiteSettingsData
  }> {
    const all = await this.getAll()

    return {
      general: all.general || {},
      header: all.header || {},
      footer: all.footer || {},
      social_media: all.social_media || {},
      contact: all.contact || {},
      seo: all.seo || {},
      analytics: all.analytics || {},
      advanced: all.advanced || {},
    }
  }

  async set(
    key: string,
    value: Partial<SiteSettingsData>
  ): Promise<SiteSetting> {
    const [setting] = await SiteSetting.upsert({
      key,
      value: value as any,
      updated_at: new Date(),
    })

    return setting
  }

  async update(
    key: string,
    updates: Partial<SiteSettingsData>
  ): Promise<SiteSetting> {
    let setting = await SiteSetting.findOne({ where: { key } })

    if (!setting) {
      console.log(`[SiteSettings] Creating new setting for key: ${key}`)
      const [created] = await SiteSetting.upsert({
        key,
        value: updates as any,
        updated_at: new Date(),
      })
      return created
    }

     const currentValue = (setting.value as SiteSettingsData) || {}
    
    const newValue = { ...currentValue }
    
    Object.keys(updates).forEach((updateKey) => {
      const value = updates[updateKey as keyof SiteSettingsData]
      
      if (value === undefined || value === null) {
        delete newValue[updateKey as keyof SiteSettingsData]
      } else {
        (newValue as any)[updateKey] = value
      }
    })

    await setting.update({ value: newValue as any, updated_at: new Date() })

    return setting
  }

  async delete(key: string): Promise<boolean> {
    const deleted = await SiteSetting.destroy({ where: { key } })
    return deleted > 0
  }

  private async getMediaUrls(mediaIds: (string | undefined)[]): Promise<Record<string, string>> {
    const validIds = mediaIds.filter(Boolean) as string[]
    
    if (validIds.length === 0) {
      return {}
    }

    const mediaList = await Media.findAll({
      where: { media_id: validIds },
      attributes: ['media_id', 'storage_path'],
    })

    const mediaMap: Record<string, string> = {}
    mediaList.forEach((media) => {
      const path = media.storage_path.startsWith('/uploads') 
        ? media.storage_path 
        : `/uploads/${media.storage_path}`
      
      mediaMap[media.media_id] = path
    })

    return mediaMap
  }

  async getPublic(): Promise<{
    general: any
    header: any
    footer: any
    social_media: any
    contact: any
  }> {
    const all = await this.getAllGrouped()

    const mediaIds = [
      all.header.header_logo_media_id,
      all.header.header_background_media_id,
      all.footer.footer_logo_media_id,
      all.seo.default_og_image_media_id,
      all.advanced.favicon_media_id,
    ]

    const mediaUrls = await this.getMediaUrls(mediaIds)

    return {
      general: {
        site_name: all.general.site_name,
        site_tagline: all.general.site_tagline,
        site_description: all.general.site_description,
      },
      header: {
        header_logo_url: all.header.header_logo_media_id 
          ? mediaUrls[all.header.header_logo_media_id] 
          : null,
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
    }
  }
}

export const siteSettingsService = new SiteSettingsService()