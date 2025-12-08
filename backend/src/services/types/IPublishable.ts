export interface IPublishable {
  /**
   * Publish entity - set status to published and published_at timestamp
   */
  publish(id: string | number): Promise<any>;

  /**
   * Unpublish entity - set status to draft
   */
  unpublish(id: string | number): Promise<any>;
}
