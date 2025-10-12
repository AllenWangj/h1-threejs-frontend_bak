<template>
    <div class="flex flex-shrink-0 w-[100%] h-[100%] relative">
        <div ref="container" class="w-[100%] h-[100%] canvas-container"></div>
        <!-- 下载控制面板 -->
        <div class="download-panel">
            <h3>📡 卫星影像下载器</h3>
            <p class="subtitle">EPSG:4326 坐标系统</p>
            <div class="control-group">
                <label>经度范围:</label>
                <input v-model.number="lonMin" type="number" step="0.1" placeholder="最小经度" />
                <span>~</span>
                <input v-model.number="lonMax" type="number" step="0.1" placeholder="最大经度" />
            </div>
            <div class="control-group">
                <label>纬度范围:</label>
                <input v-model.number="latMin" type="number" step="0.1" placeholder="最小纬度" />
                <span>~</span>
                <input v-model.number="latMax" type="number" step="0.1" placeholder="最大纬度" />
            </div>
            <div class="control-group">
                <label>缩放级别:</label>
                <select v-model.number="zoom">
                    <option :value="10">10 级 (低精度,快)</option>
                    <option :value="11">11 级 (中等)</option>
                    <option :value="12">12 级 (推荐)</option>
                    <option :value="13">13 级 (高精度)</option>
                    <option :value="14">14 级 (超高精度,慢)</option>
                    <option :value="15">15 级 (极高精度,很慢)</option>
                </select>
            </div>
            <button @click="downloadSatellite" class="download-btn" :disabled="downloading">
                {{ downloading ? '下载中...' : '🚀 开始下载卫星图' }}
            </button>
            <div v-if="progress" class="progress-info">
                <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: progress + '%' }"></div>
                </div>
                <p>{{ progressText }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const container = ref(null)
let scene, camera, renderer, controls, animationId

// 下载参数
const lonMin = ref(106)
const lonMax = ref(107)
const latMin = ref(26)
const latMax = ref(27)
const zoom = ref(14)
const downloading = ref(false)
const progress = ref(0)
const progressText = ref('')

async function downloadSatellite() {
    downloading.value = true
    progress.value = 0
    progressText.value = '准备下载...'

    try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // EPSG:4326 坐标系统 - 与 DEM 保持一致
        // 计算 Web Mercator 瓦片坐标
        function lonLatToTile(lon, lat, z) {
            const x = Math.floor((lon + 180) / 360 * Math.pow(2, z))
            const latRad = lat * Math.PI / 180
            const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * Math.pow(2, z))
            return { x, y }
        }

        // 计算瓦片在 EPSG:4326 中的精确地理范围
        function getTileBounds(x, y, z) {
            const n = Math.pow(2, z)
            const lonMin = x / n * 360 - 180
            const lonMax = (x + 1) / n * 360 - 180
            const latMaxRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)))
            const latMinRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n)))
            return {
                lonMin,
                lonMax,
                latMin: latMinRad * 180 / Math.PI,
                latMax: latMaxRad * 180 / Math.PI
            }
        }

        const minTile = lonLatToTile(lonMin.value, latMax.value, zoom.value)
        const maxTile = lonLatToTile(lonMax.value, latMin.value, zoom.value)
        const tilesX = maxTile.x - minTile.x + 1
        const tilesY = maxTile.y - minTile.y + 1
        const totalTiles = tilesX * tilesY

        // 计算实际覆盖的地理范围 (EPSG:4326)
        const firstTileBounds = getTileBounds(minTile.x, minTile.y, zoom.value)
        const lastTileBounds = getTileBounds(maxTile.x, maxTile.y, zoom.value)
        const actualBounds = {
            lonMin: firstTileBounds.lonMin,
            lonMax: lastTileBounds.lonMax,
            latMin: lastTileBounds.latMin,
            latMax: firstTileBounds.latMax
        }

        console.log('下载参数:')
        console.log(`请求范围 (EPSG:4326): [${lonMin.value}, ${lonMax.value}] x [${latMin.value}, ${latMax.value}]`)
        console.log(`实际范围 (EPSG:4326): [${actualBounds.lonMin.toFixed(4)}, ${actualBounds.lonMax.toFixed(4)}] x [${actualBounds.latMin.toFixed(4)}, ${actualBounds.latMax.toFixed(4)}]`)
        console.log(`瓦片数量: ${tilesX}x${tilesY} = ${totalTiles}`)

        progressText.value = `需要下载 ${totalTiles} 个瓦片 (${tilesX}x${tilesY})`

        // 加载瓦片
        const loadTile = (x, y) => {
            return new Promise((resolve) => {
                const img = new Image()
                img.crossOrigin = 'anonymous'
                img.src = `https://webst02.is.autonavi.com/appmaptile?style=6&x=${x}&y=${y}&z=${zoom.value}`

                img.onload = () => resolve(img)
                img.onerror = () => {
                    const img2 = new Image()
                    img2.crossOrigin = 'anonymous'
                    img2.src = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom.value}/${y}/${x}`
                    img2.onload = () => resolve(img2)
                    img2.onerror = () => resolve(null)
                }
            })
        }

        // 批量加载瓦片
        const tiles = []
        let loaded = 0

        for (let ty = minTile.y; ty <= maxTile.y; ty++) {
            for (let tx = minTile.x; tx <= maxTile.x; tx++) {
                const tile = await loadTile(tx, ty)
                tiles.push(tile)
                loaded++
                progress.value = Math.floor((loaded / totalTiles) * 100)
                progressText.value = `已加载 ${loaded}/${totalTiles} 个瓦片`
            }
        }

        // 拼接瓦片
        progressText.value = '拼接瓦片中...'
        const tileSize = 256
        canvas.width = tilesX * tileSize
        canvas.height = tilesY * tileSize

        let tileIndex = 0
        for (let ty = 0; ty < tilesY; ty++) {
            for (let tx = 0; tx < tilesX; tx++) {
                const tile = tiles[tileIndex++]
                if (tile) {
                    ctx.drawImage(tile, tx * tileSize, ty * tileSize, tileSize, tileSize)
                }
            }
        }    // 下载图片
        progressText.value = '生成下载链接...'
        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/jpeg', 0.95)

        // 文件名包含 EPSG:4326 坐标信息
        const filename = `satellite_epsg4326_lon${lonMin.value}_${lonMax.value}_lat${latMin.value}_${latMax.value}_zoom${zoom.value}.jpg`
        link.download = filename
        link.click()

        // 保存地理信息到控制台和剪贴板
        const geoInfo = {
            coordinateSystem: 'EPSG:4326',
            bounds: {
                lonMin: lonMin.value,
                lonMax: lonMax.value,
                latMin: latMin.value,
                latMax: latMax.value
            },
            actualBounds: actualBounds,
            zoom: zoom.value,
            resolution: {
                width: canvas.width,
                height: canvas.height
            },
            pixelSize: {
                lon: (actualBounds.lonMax - actualBounds.lonMin) / canvas.width,
                lat: (actualBounds.latMax - actualBounds.latMin) / canvas.height
            }
        }

        console.log('🌍 地理信息 (EPSG:4326):')
        console.log(JSON.stringify(geoInfo, null, 2))

        progressText.value = `✅ 下载完成! ${canvas.width}x${canvas.height}px (EPSG:4326)`

        setTimeout(() => {
            progress.value = 0
            progressText.value = ''
            downloading.value = false
        }, 3000)

    } catch (error) {
        console.error('下载失败:', error)
        alert('下载失败: ' + error.message)
        downloading.value = false
    }
}

function init() {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87ceeb)

    camera = new THREE.PerspectiveCamera(60, container.value.clientWidth / container.value.clientHeight, 0.1, 1000)
    camera.position.set(0, 3, 5)

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.value.clientWidth, container.value.clientHeight)
    container.value.appendChild(renderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)

    // 添加一个简单的平面作为预览
    const geometry = new THREE.PlaneGeometry(8, 8)
    const material = new THREE.MeshBasicMaterial({ color: 0x4CAF50, wireframe: true })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.x = -Math.PI / 2
    scene.add(mesh)

    function animate() {
        animationId = requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
    }
    animate()
}

onMounted(() => {
    setTimeout(() => init(), 100)
})

onUnmounted(() => {
    if (animationId) cancelAnimationFrame(animationId)
    if (renderer) renderer.dispose()
})
</script>

<style scoped>
.canvas-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.download-panel {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    width: 420px;
    z-index: 10000;
}

.download-panel h3 {
    margin: 0 0 5px 0;
    color: #333;
    font-size: 18px;
}

.download-panel .subtitle {
    margin: 0 0 15px 0;
    font-size: 12px;
    color: #4CAF50;
    font-weight: 600;
}

.control-group {
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.control-group label {
    font-size: 14px;
    color: #666;
    min-width: 80px;
}

.control-group input,
.control-group select {
    width: 100px;
    flex: 1;
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.control-group span {
    color: #999;
}

.download-btn {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 15px;
}

.download-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.download-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.progress-info {
    margin-top: 15px;
}

.progress-bar {
    width: 100%;
    height: 20px;
    background: #f0f0f0;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 8px;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4CAF50, #8BC34A);
    transition: width 0.3s;
}

.progress-info p {
    font-size: 13px;
    color: #666;
    margin: 0;
    text-align: center;
}
</style>