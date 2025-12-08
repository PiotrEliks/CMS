export interface ISluggable {
  /**
   * Generate slug from title
   */
  generateSlug(title: string, existingId?: string | number): Promise<string>;

  /**
   * Get entity by slug
   */
  getBySlug(slug: string): Promise<any | null>;
}
