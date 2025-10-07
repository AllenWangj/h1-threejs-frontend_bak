import type { BaseItem } from '~/types/base'
export interface FileItem extends BaseItem {
  id: string
  name: string
  size: number
  url: string
  hash: string
  bucket: string
  owner: string
  mimeType: string
  channel: number
}
