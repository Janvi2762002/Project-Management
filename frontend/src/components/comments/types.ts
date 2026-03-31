export type Comment = {
  _id?: string
  text: string
  user: {
    _id?: string
    name: string
  }
  createdAt: string
}
