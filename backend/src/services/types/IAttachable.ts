export interface IAttachable {
  /**
   * Attach related entity (e.g., content to category)
   */
  attach(entityId: string | number, relatedId: string | number, metadata?: Record<string, any>): Promise<void>;

  /**
   * Detach related entity
   */
  detach(entityId: string | number, relatedId: string | number): Promise<void>;

  /**
   * Get all related entities
   */
  getRelated(entityId: string | number): Promise<any[]>;

  /**
   * Check if entities are attached
   */
  isAttached(entityId: string | number, relatedId: string | number): Promise<boolean>;
}
