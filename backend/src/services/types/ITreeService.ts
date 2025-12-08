export interface ITreeService<T> {
  /**
   * Get flat list of items with parent relationships
   */
  getTree(): Promise<T[]>;

  /**
   * Add item to tree under parent
   */
  addItem(data: Partial<T>, parentId?: string | number | null): Promise<T>;

  /**
   * Update item in tree
   */
  updateItem(id: string | number, data: Partial<T>): Promise<T | null>;

  /**
   * Reorder items (change order_index and parent relationships)
   */
  reorder(items: Array<{ id: string | number; order_index: number; parent_id?: string | number | null }>): Promise<T[]>;

  /**
   * Delete item from tree (optionally cascade children)
   */
  deleteItem(id: string | number, cascadeChildren?: boolean): Promise<boolean>;
}
