<template>
  <div class="flex flex-shrink-0 w-[100%] h-[100%] relative">
    <div ref="container" class="w-[100%] h-[100%]"></div>
    
    <!-- 加载提示 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <h3>{{ loadingText }}</h3>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: loadingProgress + '%' }"></div>
        </div>
        <p class="progress-text">{{ loadingProgress }}%</p>
      </div>
    </div>
    
    <!-- 说明文字 -->
    <div class="info-panel">
      <p>📍 坐标系统: EPSG:4326</p>
      <p>📊 DEM 数据: 106-107°E, 26-27°N</p>
      <p>🛰️ 卫星图: public/satellite.jpg</p>
    </div>
    
    <!-- 点位数据弹窗 -->
    <div v-if="selectedPoint" class="point-info-panel">
      <div class="point-header">
        <h3>{{ selectedPoint.name }}</h3>
        <button @click="closePointInfo" class="close-btn">✕</button>
      </div>
      <div class="point-content">
        <p><strong>经度:</strong> {{ selectedPoint.lon }}°E</p>
        <p><strong>纬度:</strong> {{ selectedPoint.lat }}°N</p>
        <p><strong>海拔:</strong> {{ selectedPoint.elevation }}m</p>
        <p><strong>类型:</strong> {{ selectedPoint.type }}</p>
        <p><strong>描述:</strong> {{ selectedPoint.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { fromArrayBuffer } from 'geotiff'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const container = ref(null)
let scene, camera, renderer, controls, animationId
let terrainMesh = null
let satelliteTexture = null
let raycaster, mouse
let pointMarkers = []
const selectedPoint = ref(null)

// 加载状态
const loading = ref(false)
const loadingText = ref('初始化场景...')
const loadingProgress = ref(0)

// 示例点位数据 (EPSG:4326 坐标系统)
const pointsData = [
  {
    id: 1,
    name: '观测站A',
    lon: 106.3,
    lat: 26.5,
    elevation: 1200,
    type: '气象站',
    description: '主要观测温度、湿度、降雨量'
  },
  {
    id: 2,
    name: '观测站B',
    lon: 106.7,
    lat: 26.3,
    elevation: 1500,
    type: '水文站',
    description: '监测河流水位和流量'
  },
  {
    id: 3,
    name: '观测站C',
    lon: 106.5,
    lat: 26.7,
    elevation: 1800,
    type: '地质站',
    description: '地质灾害监测点'
  }
]

// 加载小范围 DEM
async function loadDEM(url) {
  const resp = await fetch(url)
  const buffer = await resp.arrayBuffer()
  const tiff = await fromArrayBuffer(buffer)
  const image = await tiff.getImage()
  const raster = await image.readRasters({ interleave: true })
  return { raster, width: image.getWidth(), height: image.getHeight() }
}

// 获取最小/最大值
function getMinMax(array) {
  let min = Infinity,
    max = -Infinity
  for (let i = 0; i < array.length; i++) {
    const v = array[i]
    if (v < min) min = v
    if (v > max) max = v
  }
  return { min, max }
}

// 处理窗口大小变化
function onWindowResize() {
  if (camera && renderer && container.value) {
    camera.aspect = container.value.clientWidth / container.value.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  }
}

// 关闭点位信息面板
function closePointInfo() {
  selectedPoint.value = null
}

// 将地理坐标转换为 3D 空间坐标
function geoToWorld(lon, lat, elevation, demBounds, terrainSize, minElevation, maxElevation) {
  // 归一化到 0-1 范围
  const x = (lon - demBounds.lonMin) / (demBounds.lonMax - demBounds.lonMin)
  const y = (lat - demBounds.latMin) / (demBounds.latMax - demBounds.latMin)
  
  // 不使用 elevation 参数,而是根据经纬度查询 DEM 数据获取实际地形高度
  // 这里先用简化版本,让标记贴在地形表面附近
    // 转换到世界坐标 (考虑地形旋转)
  return {
    x: (x - 0.5) * terrainSize,
    y: 0.5, // 提高高度,让标记更明显
    z: -(y - 0.5) * terrainSize // 负号因为地形旋转了
  }
}

// 创建点位标记
function createPointMarker(pointData, worldPos) {
  // 创建标记几何体 (圆柱体) - 增大尺寸,更明显
  const geometry = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 16)
  const material = new THREE.MeshStandardMaterial({
    color: 0xff4444,
    emissive: 0xff0000,
    emissiveIntensity: 0.8
  })
  const marker = new THREE.Mesh(geometry, material)
  marker.position.set(worldPos.x, worldPos.y, worldPos.z)
  
  // 添加顶部球体 - 增大尺寸
  const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16)
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    emissive: 0xffaa00,
    emissiveIntensity: 1.0
  })
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.position.y = 0.35
  marker.add(sphere)
  
  // 保存点位数据
  marker.userData = pointData
  
  return marker
}

// 处理鼠标点击事件
function onMouseClick(event) {
  if (!camera || !renderer) return
  
  // 计算鼠标在归一化设备坐标中的位置
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  
  // 更新射线
  raycaster.setFromCamera(mouse, camera)
  
  // 检测与点位标记的交互
  const intersects = raycaster.intersectObjects(pointMarkers, true)
  
  if (intersects.length > 0) {
    // 找到最近的标记
    let markerObj = intersects[0].object
    while (markerObj.parent && !markerObj.userData.id) {
      markerObj = markerObj.parent
    }
    
    if (markerObj.userData.id) {
      selectedPoint.value = markerObj.userData
      console.log('选中点位:', markerObj.userData)
    }
  }
}

async function init() {
  try {
    loading.value = true
    loadingProgress.value = 0
    loadingText.value = '初始化场景...'
    
    // 确保容器已经挂载
    if (!container.value) {
      console.error('容器元素未挂载')
      loading.value = false
      return
    }

    // 检查 WebGL 支持
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    
    if (!gl) {
      console.error('浏览器不支持 WebGL 或 WebGL 已被禁用')
      alert('您的浏览器不支持 WebGL,无法加载 3D 地形。请使用 Chrome、Firefox 或 Edge 浏览器。')
      loading.value = false
      return
    }
    
    // 清理测试 canvas
    canvas.remove()
    
    loadingProgress.value = 10
    loadingText.value = '创建 WebGL 渲染器...'
    
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87ceeb) // 天蓝色背景
    scene.fog = new THREE.Fog(0x87ceeb, 1, 100) // 添加雾效果
    camera = new THREE.PerspectiveCamera(60, container.value.clientWidth / container.value.clientHeight, 0.1, 1000)
    camera.position.set(0, 3, 5)
    camera.lookAt(0, 0, 0)
    
    // 创建 WebGL 渲染器,添加上下文丢失处理
    try {
      renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false
      })    } catch (error) {
      console.error('创建 WebGL 渲染器失败:', error)
      alert('创建 3D 渲染器失败,请刷新页面重试或关闭其他占用 GPU 的网页。')
      loading.value = false
      return
    }
    
    renderer.setSize(container.value.clientWidth, container.value.clientHeight)    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)) // 降低像素比,减少渲染负担
    renderer.shadowMap.enabled = false // 关闭阴影以避免 Shader Error
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    
    loadingProgress.value = 20
    loadingText.value = '设置光照和控制器...'
    
    // 添加 WebGL 上下文丢失/恢复事件监听
    const rendererCanvas = renderer.domElement
    rendererCanvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault()
      console.warn('WebGL 上下文丢失,停止渲染')
      if (animationId) {
        cancelAnimationFrame(animationId)
        animationId = null
      }
    })
    
    rendererCanvas.addEventListener('webglcontextrestored', () => {
      console.log('WebGL 上下文已恢复,重新初始化')
      setTimeout(() => init(), 100)
    })
    
    container.value.appendChild(renderer.domElement)

  // 添加轨道控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.screenSpacePanning = false
  controls.minDistance = 0.5
  controls.maxDistance = 50
  controls.maxPolarAngle = Math.PI / 2

  // 改进的光照系统
  const ambientLight = new THREE.AmbientLight(0x404040, 0.3) // 降低环境光
  scene.add(ambientLight)
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0)
  dirLight.position.set(10, 20, 10)
  scene.add(dirLight)
  // 添加天光
  const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x362d1b, 0.5)
  scene.add(hemiLight)

  loadingProgress.value = 30
  loadingText.value = '加载 DEM 高程数据...'

  // 加载 DEM 小片
  const dem = await loadDEM(
    'https://geoserver.spic.cc/geoserver/h1/wcs?' +
      'service=WCS&version=2.0.1&request=GetCoverage&coverageId=h1:my3dlayer' +
      '&format=image/tiff&subset=Long(106,107)&subset=Lat(26,27)&resx=0.001&resy=0.001'
  )
  // 降采样（减少降采样步长获得更高分辨率）
  const step = 4 // 增加降采样步长,减少顶点数量 (原来是 2)
  const width = Math.floor(dem.width / step)
  const height = Math.floor(dem.height / step)
  const raster = new Float32Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      raster[y * width + x] = dem.raster[y * step * dem.width + x * step]
    }
  }
  const { min, max } = getMinMax(raster)
  const scale = 1.0 // 增强高度差异

  loadingProgress.value = 50
  loadingText.value = '生成地形网格...'

  // 添加高度数据统计信息
  console.log(`DEM 数据统计:`)
  console.log(`最小高度: ${min}m`)
  console.log(`最大高度: ${max}m`)
  console.log(`高度差: ${max - min}m`)
  console.log(`网格大小: ${width} x ${height}`)

  // 创建PlaneGeometry并设置高度
  const geometry = new THREE.PlaneGeometry(8, 8, width - 1, height - 1) // 增加地形尺寸
  const positions = geometry.attributes.position.array

  // 优化高度映射算法
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      const index = j * width + i
      const normalizedHeight = (raster[index] - min) / (max - min)
      // 使用平滑曲线增强地形起伏
      const heightValue = Math.pow(normalizedHeight, 0.8) * scale
      positions[index * 3 + 2] = heightValue
    }  }  geometry.attributes.position.needsUpdate = true
  geometry.computeVertexNormals()

  loadingProgress.value = 70
  loadingText.value = '加载卫星影像...'

  // 加载离线卫星影像纹理
  async function loadOfflineSatelliteTexture(imagePath) {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader()
      loader.load(
        imagePath,
        (texture) => {
          texture.wrapS = THREE.ClampToEdgeWrapping
          texture.wrapT = THREE.ClampToEdgeWrapping
          texture.minFilter = THREE.LinearFilter
          texture.magFilter = THREE.LinearFilter
          console.log('✅ 离线卫星影像加载成功')
          resolve(texture)
        },
        undefined,
        (error) => {
          console.error('❌ 离线卫星影像加载失败')
          alert('请将 satellite.jpg 文件放到 public 目录下!')
          reject(error)
        }
      )
    })
  }
  // 加载离线卫星纹理
  satelliteTexture = await loadOfflineSatelliteTexture('https://cdn.spic.cc/h1-static/uploads/20251012/5e292ebca0acff28bde92611.jpg')
  
  loadingProgress.value = 80
  loadingText.value = '创建地形模型...'
  
  // 创建地形材质 - 直接使用卫星图 + 高程地形
  const material = new THREE.MeshStandardMaterial({
    map: satelliteTexture,
    flatShading: false,
    side: THREE.DoubleSide
  })
    // 使用带高程的地形几何体 + 卫星图纹理
  terrainMesh = new THREE.Mesh(geometry, material)  
  terrainMesh.rotation.x = -Math.PI / 2
  scene.add(terrainMesh)
  
  loadingProgress.value = 90
  loadingText.value = '添加点位标记...'
  
  // 初始化射线投射器用于点击检测
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()
  
  // 添加点位标记
  const demBounds = {
    lonMin: 106,
    lonMax: 107,
    latMin: 26,
    latMax: 27
  }
  
  pointsData.forEach(point => {
    const worldPos = geoToWorld(
      point.lon,
      point.lat,
      point.elevation,
      demBounds,
      8, // 地形尺寸
      min,
      max
    )
      const marker = createPointMarker(point, worldPos)
    scene.add(marker)
    pointMarkers.push(marker)
    
    console.log(`添加点位: ${point.name} at (${point.lon}, ${point.lat}), 世界坐标: (${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)}, ${worldPos.z.toFixed(2)})`)
  })
    // 添加鼠标点击事件监听
  renderer.domElement.addEventListener('click', onMouseClick)
  
  loadingProgress.value = 100
  loadingText.value = '加载完成!'
  
  // 延迟隐藏加载提示
  setTimeout(() => {
    loading.value = false
  }, 500)
  
  // 渲染循环 - 优化性能
  function animate() {
    if (!renderer || !scene || !camera) return
    
    animationId = requestAnimationFrame(animate)
    
    // 只在控制器有变化时才渲染
    if (controls.enabled) {
      controls.update()
    }
    
    renderer.render(scene, camera)
  }
  animate()
  
  window.addEventListener('resize', onWindowResize)
    } catch (error) {
    console.error('初始化失败:', error)
    alert('3D 场景初始化失败: ' + error.message)
    loading.value = false
  }
}

onMounted(() => {
  // 使用 nextTick 确保 DOM 已完全渲染
  nextTick(() => {
    // 延迟初始化,避免与其他 WebGL 上下文冲突
    setTimeout(() => {
      console.log('开始初始化 Three.js 场景...')
      init()
    }, 100)
  })
})

onUnmounted(() => {
  // 停止动画循环
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  
  // 移除事件监听
  window.removeEventListener('resize', onWindowResize)
  if (renderer && renderer.domElement) {
    renderer.domElement.removeEventListener('click', onMouseClick)
  }
  
  // 清理 Three.js 资源
  if (terrainMesh) {
    terrainMesh.geometry.dispose()
    terrainMesh.material.dispose()
  }
  
  if (satelliteTexture) satelliteTexture.dispose()
  
  // 清理点位标记
  pointMarkers.forEach(marker => {
    if (marker.geometry) marker.geometry.dispose()
    if (marker.material) marker.material.dispose()
  })
  pointMarkers = []
  
  if (controls) controls.dispose()
  
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    renderer = null
  }
  
  if (scene) {
    scene.clear()
    scene = null
  }
  
  console.log('Three.js 资源已清理')
})
</script>

<style scoped>
.info-panel {
  position: fixed;
  bottom: 10px;
  left: 10px;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px 16px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.info-panel p {
  margin: 4px 0;
  font-size: 12px;
  color: #666;
}

.point-info-panel {
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  background: white;
  padding: 0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  width: 300px;
  z-index: 10000;
  overflow: hidden;
}

.point-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.point-header h3 {
  margin: 0;
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  font-size: 20px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: rotate(90deg);
}

.point-content {
  padding: 20px;
}

.point-content p {
  margin: 10px 0;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

.point-content strong {
  color: #667eea;
  display: inline-block;
  min-width: 60px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  pointer-events: none;
}

.loading-content {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  text-align: center;
  min-width: 320px;
  pointer-events: auto;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  border: 4px solid rgba(76, 175, 80, 0.2);
  border-top-color: #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-content h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(76, 175, 80, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin: 0 auto 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  margin: 0;
  font-size: 14px;
  color: #4CAF50;
  font-weight: bold;
}
</style>
