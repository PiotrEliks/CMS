export interface IAttachable {

  attach(entityId: string | number, relatedId: string | number, metadata?: Record<string, any>): Promise<void>;


  detach(entityId: string | number, relatedId: string | number): Promise<void>;

  getRelated(entityId: string | number): Promise<any[]>;

  isAttached(entityId: string | number, relatedId: string | number): Promise<boolean>;
}
