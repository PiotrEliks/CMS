export interface ISluggable {
  generateSlug(title: string, existingId?: string | number): Promise<string>

  getBySlug(slug: string): Promise<any | null>
}
