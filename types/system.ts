import type { BaseItem } from '~/types/base'
export interface DictItem extends BaseItem {
  parentId: string
  id: string
  code: string
  label: string
  value: string
  sort: number
  intro: string
}
export interface DictTree extends DictItem {
  children: DictTree[]
}
