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
  findById(id: string | number): Promise<T | null>;

  findOne(options: FindOptions): Promise<T | null>;

  list(options: FindOptions & PaginationOptions): Promise<{ items: T[]; total: number }>;

  create(data: Partial<T>): Promise<T>;

  update(id: string | number, data: Partial<T>): Promise<T | null>;

  delete(id: string | number): Promise<boolean>;

  deleteWhere(conditions: any): Promise<number>;
}
