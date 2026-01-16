import { Op } from 'sequelize'
import {
    ContentSection,
    SectionType,
    SectionSettings,
} from '../models/contentSection.model.js'

export interface CreateSectionData {
    content_id: string
    section_type: SectionType
    order_index?: number
    display_order?: number
    heading?: string
    subheading?: string
    body?: string
    media_ids?: string[]
    settings?: SectionSettings
}

export interface UpdateSectionData {
    section_type?: SectionType
    order_index?: number
    display_order?: number
    heading?: string
    subheading?: string
    body?: string
    media_ids?: string[]
    settings?: SectionSettings
    status?: boolean
}

export interface ReorderItem {
    section_id: string
    order_index: number
}

export interface DisplayOrderItem {
    section_id: string
    display_order: number
}

export class ContentSectionService {
    async getSectionsByContentId(contentId: string) {
        const sections = await ContentSection.findAll({
            where: { content_id: contentId },
            order: [
                ['display_order', 'ASC'],
                ['order_index', 'ASC'],
            ],
        })

        return sections
    }

    async getSectionById(sectionId: string) {
        const section = await ContentSection.findByPk(sectionId)

        if (!section) {
            throw new Error('Section not found')
        }

        return section
    }

    async createSection(data: CreateSectionData) {
        if (data.order_index === undefined) {
            const maxOrder = await ContentSection.max('order_index', {
                where: { content_id: data.content_id },
            })
            data.order_index = (maxOrder ?? -1) + 1
        }

        if (data.display_order === undefined) {
            const maxDisplay = await ContentSection.max('display_order', {
                where: { content_id: data.content_id },
            })
            data.display_order = (maxDisplay ?? -1) + 1
        }

        const section = await ContentSection.create({
            ...data,
            status: true,
        } as any)

        return section
    }

    async updateSection(sectionId: string, data: UpdateSectionData) {
        const section = await ContentSection.findByPk(sectionId)

        if (!section) {
            throw new Error('Section not found')
        }

        await section.update(data)

        return section
    }

    async deleteSection(sectionId: string) {
        const section = await ContentSection.findByPk(sectionId)

        if (!section) {
            throw new Error('Section not found')
        }

        const contentId = section.content_id
        const deletedOrder = section.order_index
        const deletedDisplay = section.display_order

        await section.destroy()

        await ContentSection.update(
            {
                order_index: (ContentSection as any).sequelize.literal(
                    'order_index - 1'
                ),
            },
            {
                where: {
                    content_id: contentId,
                    order_index: { [Op.gt]: deletedOrder },
                },
            }
        )

        if (deletedDisplay !== null && deletedDisplay !== undefined) {
            await ContentSection.update(
                {
                    display_order: (ContentSection as any).sequelize.literal(
                        'display_order - 1'
                    ),
                },
                {
                    where: {
                        content_id: contentId,
                        display_order: { [Op.gt]: deletedDisplay },
                    },
                }
            )
        }

        return true
    }

    async reorderSections(contentId: string, items: ReorderItem[]) {
        const sectionIds = items.map((item) => item.section_id)
        const sections = await ContentSection.findAll({
            where: {
                section_id: { [Op.in]: sectionIds },
                content_id: contentId,
            },
        })

        if (sections.length !== items.length) {
            throw new Error('Some sections do not belong to this content')
        }

        const updates = items.map((item) =>
            ContentSection.update(
                { order_index: item.order_index },
                { where: { section_id: item.section_id } }
            )
        )

        await Promise.all(updates)

        return await this.getSectionsByContentId(contentId)
    }

    async reorderDisplayOrder(contentId: string, items: DisplayOrderItem[]) {
        const sectionIds = items.map((item) => item.section_id)
        const sections = await ContentSection.findAll({
            where: {
                section_id: { [Op.in]: sectionIds },
                content_id: contentId,
            },
        })

        if (sections.length !== items.length) {
            throw new Error('Some sections do not belong to this content')
        }

        const updates = items.map((item) =>
            ContentSection.update(
                { display_order: item.display_order },
                { where: { section_id: item.section_id } }
            )
        )

        await Promise.all(updates)

        return await this.getSectionsByContentId(contentId)
    }

    async duplicateSection(sectionId: string) {
        const original = await ContentSection.findByPk(sectionId)

        if (!original) {
            throw new Error('Section not found')
        }

        const maxOrder = await ContentSection.max('order_index', {
            where: { content_id: original.content_id },
        })

        const maxDisplay = await ContentSection.max('display_order', {
            where: { content_id: original.content_id },
        })

        const duplicate = await ContentSection.create({
            content_id: original.content_id,
            section_type: original.section_type,
            order_index: (maxOrder ?? 0) + 1,
            display_order: (maxDisplay ?? 0) + 1,
            heading: original.heading ? `${original.heading} (kopia)` : null,
            subheading: original.subheading,
            body: original.body,
            media_ids: original.media_ids,
            settings: original.settings,
            status: original.status,
        } as any)

        return duplicate
    }

    async getPublishedSections(contentId: string) {
        const sections = await ContentSection.findAll({
            where: {
                content_id: contentId,
                status: true,
            },
            order: [
                ['display_order', 'ASC'],
                ['order_index', 'ASC'],
            ],
            attributes: {
                exclude: ['created_at', 'updated_at'],
            },
        })

        return sections
    }

    async deleteSectionsByContentId(contentId: string) {
        await ContentSection.destroy({
            where: { content_id: contentId },
        })
    }
}

export const contentSectionService = new ContentSectionService()
