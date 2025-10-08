export const useLayout = () => {
  const expand = useState('menu-expand', () => true)
  const tableMaxHeight = computed(() => {
    return getComputedStyle(document.documentElement).getPropertyValue('--h1-layout-table-max-height').trim()
  })
  const updateExpand = (value: boolean) => {
    expand.value = value
  }

  return {
    expand,
    tableMaxHeight,
    updateExpand
  }
}
