import { Model, ModelCtor, FindOptions } from 'sequelize'

export abstract class BaseService<T extends Model> {
    protected model: ModelCtor<T>

    constructor(model: ModelCtor<T>) {
        this.model = model
    }

    async findById(id: number | string) {
        return this.model.findByPk(id)
    }

    async findOne(options: FindOptions<T>) {
        return this.model.findOne(options)
    }

    async list(options: FindOptions<T> & { limit?: number; offset?: number }) {
        const { limit, offset, ...rest } = options

        const { rows, count } = await this.model.findAndCountAll({
            ...rest,
            limit,
            offset,
            distinct: true,
        })

        return { items: rows, total: count }
    }

    async create(data: Partial<T>) {
        return this.model.create(data as any)
    }

    async update(id: number | string, data: Partial<T>) {
        const entity = await this.findById(id)
        return entity?.update(data) ?? null
    }

    async delete(id: number | string) {
        const entity = await this.findById(id)
        if (!entity) return false
        await entity.destroy()
        return true
    }
}
