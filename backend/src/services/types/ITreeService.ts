export interface ITreeService<T> {
  getTree(): Promise<T[]>;

  addItem(data: Partial<T>, parentId?: string | number | null): Promise<T>;

  updateItem(id: string | number, data: Partial<T>): Promise<T | null>;

  reorder(
    items: Array<{ id: string | number; order_index: number; parent_id?: string | number | null }>
  ): Promise<T[]>;

  deleteItem(id: string | number, cascadeChildren?: boolean): Promise<boolean>;
}
