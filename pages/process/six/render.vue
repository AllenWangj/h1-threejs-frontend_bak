<template>
  <div class="flex flex-shrink-0 w-[100%] h-[100%] relative">
    <schemes-list :list="schemeList" :current="currentAcviteScheme" @tap-scheme="tapScheme"></schemes-list>
    <div class="flex-1 relative border border-[1px] border-[#adcdf7] relative">
      <el-button class="opt-btn" type="primary" @click="handleDeliveEvt">运输路线</el-button>
      <SixComponent v-if="!isDelive" :planId="currentAcviteScheme" />
      <delivery v-else :planId="currentAcviteScheme" :dem-url="demUrl" :satellite-url="satelliteUrl" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPackingDetail } from '@/apis/project'
import SixComponent from "@/components/six-component/index.vue"
import Delivery from "./components/delivery.vue"

const currentAcviteScheme = ref(-1)
const isDelive = ref(false)
const tapScheme = (item) => {
  console.log('点击了运输保障方案', item)
  currentAcviteScheme.value = item.id
}
const demUrl = ref('https://support.maxtan.cn/geoserver/h1/wcs?service=WCS&version=2.0.1&request=GetCoverage&coverageId=h1:dem_107252456638910473&format=image/tiff&subset=Long(106.2,106.3)&subset=Lat(26.1,26.2)&resx=0.001&resy=0.001')
const satelliteUrl= ref('https://static.maxtan.cn/h1-static/uploads/20251023/90f6842eff314ee4f3c52fc4.jpg')

function handleDeliveEvt() {
  isDelive.value = !isDelive.value
}
const projectId = ref('')
const route = useRoute()
const schemeList = ref<any[]>([])

onMounted(() => {
  if (route.query.projectId) {
    projectId.value = route.query.projectId as string
  }
  fetchDetail();
})
async function fetchDetail() {
  try {
    const { data } = await getPackingDetail({
      projectId: projectId.value,
      type: 6
    })
    schemeList.value = data || []
    if (schemeList.value.length) {
      currentAcviteScheme.value = schemeList.value[0].id
      // planDetail({ planId: currentAcviteScheme.value }).then(res => {
      //   const { data: { layouts } } = res
      //   // handleLoadInitModel(layouts)
      //   // renderPlanLayout!.loadSceneModels(layouts)
      // })
    }
    console.log('获取运输保障详情', data)
  } catch (error) {
    console.error('获取运输保障详情失败', error)
  } finally {
  }
}
</script>

<style lang="less" scoped>
.opt-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 9999;
}
</style>
