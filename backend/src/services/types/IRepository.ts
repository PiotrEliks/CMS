export interface PaginationOptions {
  limit: number;
  offset: number;
}

export interface FindOptions {
  where?: any;
  include?: any;
  order?: any;
}

export interface IRepository<T> {
  /**
   * Find entity by primary key
   */
  findById(id: string | number): Promise<T | null>;

  /**
   * Find single entity by conditions
   */
  findOne(options: FindOptions): Promise<T | null>;

  /**
   * List entities with pagination and filtering
   */
  list(options: FindOptions & PaginationOptions): Promise<{ items: T[]; total: number }>;

  /**
   * Create new entity
   */
  create(data: Partial<T>): Promise<T>;

  /**
   * Update entity
   */
  update(id: string | number, data: Partial<T>): Promise<T | null>;

  /**
   * Delete entity
   */
  delete(id: string | number): Promise<boolean>;

  /**
   * Bulk delete by conditions
   */
  deleteWhere(conditions: any): Promise<number>;
}
