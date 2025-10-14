import { ref, onMounted, onUnmounted, nextTick } from 'vue'

/**
 * F11 全屏 + 退出 + 容器自适应
 * @param containerRef 容器 ref
 * @param onResize 自定义 resize 回调
 */
export function useFullScreenResize(containerRef: any, onResize: () => void) {
  const isFullScreen = ref(false)
  const originalStyle = ref<{ width: string; height: string }>({ width: '', height: '' })

  const enterFullScreen = async () => {
    const el = containerRef.value
    if (!el) return

    // 保存原始样式
    originalStyle.value = {
      width: containerRef.value.clientWidth || '',
      height: containerRef.value.clientHeight || '',
    }

    try {
      await el.requestFullscreen()
      el.style.width = '100vw'
      el.style.height = '100vh'
      isFullScreen.value = true
      nextTick(() => onResize())
    } catch (err) {
      console.warn('全屏失败：', err)
    }
  }

  const exitFullScreen = async () => {
    const el = containerRef.value
    if (!el) return

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      }
      // 恢复原始样式
      el.style.width = originalStyle.value.width
      el.style.height = originalStyle.value.height
      isFullScreen.value = false
      nextTick(() => onResize())
    } catch (err) {
      console.warn('退出全屏失败：', err)
    }
  }

  const toggleFullScreen = async () => {
    if (document.fullscreenElement) {
      await exitFullScreen()
    } else {
      await enterFullScreen()
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'F11') {
      e.preventDefault() // 阻止浏览器默认 F11 行为
      toggleFullScreen()
    }
  }

  const handleWindowResize = () => {
    if (containerRef.value) onResize()
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  // 监听浏览器全屏状态变化（手动退出、ESC 等）
  document.addEventListener('fullscreenchange', () => {
    const el = containerRef.value
    if (!el) return
    if (!document.fullscreenElement && isFullScreen.value) {
      console.log('originalStyle2', originalStyle.value)
      // 恢复原始样式
      el.style.width = `${originalStyle.value.width}px`
      el.style.height = `${originalStyle.value.height}px`
      isFullScreen.value = false
      nextTick(() => onResize())
    }
  })

  return { isFullScreen, toggleFullScreen, enterFullScreen, exitFullScreen }
}
