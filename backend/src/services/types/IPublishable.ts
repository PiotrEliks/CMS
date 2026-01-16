export interface IPublishable {
  publish(id: string | number): Promise<any>

  unpublish(id: string | number): Promise<any>
}
