/**
 * 布局状态管理 Composable
 * @description 管理左侧菜单的展开/折叠状态及表格最大高度
 */
export const useLayout = () => {
  /** 菜单展开状态，true 为展开，false 为折叠 */
  const expand = useState('menu-expand', () => true)
  
  /** 表格最大高度，从 CSS 变量中读取 */
  const tableMaxHeight = computed(() => {
    return getComputedStyle(document.documentElement).getPropertyValue('--h1-layout-table-max-height').trim()
  })
  
  /**
   * 更新菜单展开状态
   * @param value 新的展开状态
   */
  const updateExpand = (value: boolean) => {
    expand.value = value
  }

  return {
    expand,
    tableMaxHeight,
    updateExpand
  }
}
