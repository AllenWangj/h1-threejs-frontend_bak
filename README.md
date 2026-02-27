# H1-ThreeJS-Frontend

工业级三维可视化前端平台，基于 Nuxt 3 + Three.js，聚焦 BIM/GIS 融合与七阶段工艺流程。

## 项目简介

本项目用于工业场景的三维可视化与流程管理，核心能力包括：

- 地形高程/等高线分析（GeoTIFF）
- 三维模型加载与交互编辑（Three.js）
- 七阶段流程业务页面（规划、设计、生产、运输、组装）

## 技术架构

- Nuxt 3 / Vue 3 / TypeScript
- Three.js / IFC.js / GeoTIFF
- Element Plus / TailwindCSS
- pnpm / Docker / Nginx

## 目录结构（核心）

- `pages/process/`：七阶段核心流程页面
	- `one/`：地形测绘（高程图、等高线）
	- `two~four/`：布局与结构/构件设计
	- `five~seven/`：生产、运输、现场组装
- `composables/use-three.ts`：Three.js 基础封装（场景、相机、渲染器、资源释放）
- `apis/`：接口定义
- `types/`：类型定义
- `deploy/`：Docker / Nginx 部署配置

## 快速开始

### 环境要求

- Node.js 22+
- pnpm 10+

### 安装

```bash
pnpm install
```

### 开发

```bash
pnpm dev
```

默认访问：http://localhost:3000

### 构建

```bash
# 测试环境
pnpm build:test

# 生产环境
pnpm build

# 本地预览
pnpm preview
```

## 环境变量

在 `.env` 中设置：

```bash
MODE=DEV
# MODE=TEST
# MODE=PROD
```

## 核心流程

| 阶段 | 功能说明 |
| --- | --- |
| ① 地形测绘 | DEM 地形分析、等高线/高程可视化 |
| ② 基础设计 | 布局编辑、方案管理 |
| ③ 结构设计 | 结构模型装配与可视化 |
| ④ 构件设计 | 构件级模型与清单管理 |
| ⑤ 部件生产 | 物料/生产信息展示 |
| ⑥ 物流运输 | 路径生成与运输动画 |
| ⑦ 现场组装 | 组装过程与信息联动 |

## 开发约定（简版）

- 组件优先使用 Composition API
- 业务逻辑优先沉淀在 `composables/`
- Three.js 资源在销毁时需显式 `dispose()`
- API 统一收口在 `apis/`

## 部署

```bash
docker build -t h1-threejs-frontend:latest -f deploy/prod/Dockerfile .
docker run -d -p 80:80 h1-threejs-frontend:latest
```

项目为 SPA 模式（`ssr: false`）。
