import type { BaseItem } from './base'

export interface ModelItem extends BaseItem {
  id: string
  height: string
  length: string
  name: string
  url: string
  sourceUrl: string
  hash: string
  sourceHash: string
  material: string
  effect: string
  type: number
  code: string
  width: string
}
