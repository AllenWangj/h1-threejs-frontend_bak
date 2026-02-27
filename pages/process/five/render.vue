<template>
  <div class="flex flex-shrink-0 w-[100%] h-[100%] relative">
    <schemes-list :list="schemeList" :current="currentAcviteScheme" @tap-scheme="tapScheme"></schemes-list>
    <NewRender v-if="isNew" :id="currentAcviteScheme"/>
    <OldRender v-else :id="currentAcviteScheme"/>

    <!-- v-loading="loading" :element-loading-text="loadingText" -->
    <!-- <div ref="fullscreenContainer" class="flex-1 relative border border-[1px] border-[#adcdf7]">
      <div ref="threeContainer" class="three-container" />
    </div> -->
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import SchemesList from '@/components/schemes-list/index.vue'
import OldRender from './oldRender.vue'
import NewRender from './newRender.vue'
// import BuildInfo from './components/build-info.vue'
// import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import { modeService } from './composables/mode-service'
// import { materialInfoService } from './composables/material-info-service'
import { getPartsProductionDetail, algorithmGenerate, planDetail } from '@/apis/project'
// import ModelWrapper from "@/components/model-wrapper/index.vue"
// 全屏相关

const { baseURL } = useRuntimeConfig().public
const route = useRoute()
/** 项目ID，从路由参数获取 */
const projectId = ref('')
/** 部件生产方案列表 */
const schemeList = ref<any[]>([])
/** 当前激活的方案ID */
const currentAcviteScheme = ref('')

/**
 * 切换激活方案
 * @param item 方案对象，包含 id、type 等信息
 * @description 根据方案类型(type=3为新版，其他为旧版)切换渲染组件
 */
const tapScheme = (item) => {
  currentAcviteScheme.value = item.id
  const {type} = item
  // 根据方案类型切换新旧渲染器
  if(type == 3) {
    isNew.value =true
  }else {
    isNew.value =false

  }
  console.log('点击了部件生成方案', item)
  // algorithmGenerate({})
//   planDetail({ id: currentAcviteScheme.value }).then(res => {
//     // console.log("res----", res)
//       const { data: { layouts, status } } = res
//         if (status == 1) {
//           ElMessage({
//             type: 'warning',
//             message: '待处理'
//           })
//         } else if (status == 2) {
//           ElMessage({
//             type: 'warning',
//             message: '方案生成中'
//           })
//         } else if (status == 3) {
//           opt?.handleLoad(layouts)

//         } else {
//           ElMessage({
//             type: 'error',
//             message: '方案生成失败'
//           })
//         }
//   })
}
/**
 * 获取部件生产方案详情
 * @description 加载项目的所有部件生产方案，并自动选中第一个方案
 */
async function fetchDetail() {
  try {
    const { data } = await getPartsProductionDetail({
      projectId: projectId.value,
      source: 5 // 流程5：部件生产
    })
    schemeList.value = data || []
    if (schemeList.value.length > 0) {
      currentAcviteScheme.value = schemeList.value[0].id
      // 获取方案详细信息并判断使用新旧渲染器
      planDetail({ id: currentAcviteScheme.value }).then(res => {
        const { data: { layouts, status,type } } = res
        // 根据方案类型切换渲染器
        if(type==3) {
          isNew.value =true
        }else {
          isNew.value =false
        }
        // if (status == 1) {
        //   ElMessage({
        //     type: 'warning',
        //     message: '待处理'
        //   })
        // } else if (status == 2) {
        //   ElMessage({
        //     type: 'warning',
        //     message: '方案生成中'
        //   })
        // } else if (status == 3) {
        //   opt?.handleLoad(layouts)

        // } else {
        //   ElMessage({
        //     type: 'error',
        //     message: '方案生成失败'
        //   })
        // }
      })
    }
    // console.log('获取部件生产详情', data)
  } catch (error) {
    console.error('获取部件生产详情失败', error)
  } finally {
  }
}
/** 是否使用新版渲染器（type=3 为新版，支持更复杂的装配动画） */
const isNew =ref(false)
// const threeContainer = ref(null)
// let opt: any | null = null
onMounted(() => {
  if (route.query.projectId) {
    projectId.value = route.query.projectId as string
  }
  // algorithmGenerate({
  //   projectId: projectId.value
  // })
  // const IfcRender = useRender()
  // const ifc = new IfcRender.IFC(threeContainer.value)
  // opt = ifc
  fetchDetail();
})
</script>
<style scoped lang="less">
.three-container {
  width: 100%;
  height: 100%;
  display: block;
}

.toolbar-container {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 100px;
  // max-height: 200px;
  // overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  // background: rgba(0, 0, 0, 0.1);
  padding: 20px 10px 10px;
  // border: 1px solid #ccc;
  border-radius: 8px;


  .el-button {
    margin: 0;
    width: 150px;
    margin: 0 10px 10px;
  }
}

.toolbar-content {
  position: absolute;
  bottom: 20px;
  height: 630px;
  left: 10px;
  width: 508px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  // background: rgba(0, 0, 0, 0.3);
  padding: 10px 10px 0;
  border: 1px solid #ccc;
  border-radius: 8px;

  background: #568FCC;
  border-radius: 8px;
  border: 1px solid #3A78C0;
}

.opt {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: center;
  width: 100%;

  .opt-content {
    width: 800px;
    height: 40px;

    border-radius: 8px;
    border: 1px solid #3A78C0;
    display: flex;
    flex-direction: row;
    overflow: hidden;

    .opt-btn {
      flex: 1;
      text-align: center;
      color: #fff;
      line-height: 38px;
      height: 38px;
      cursor: pointer;
      background: #568FCC;

      &:hover {
        background: #568FCC90
      }
    }

  }

}
</style>
