<template>
  <div class="show-modal-wrapper" v-loading="loading" :element-loading-text="message">
    <div class="show-modal-three" ref="three"></div>
    <div class="model-info">
      <el-descriptions title="模型信息" :column="1">
        <el-descriptions-item label="长度" :span="1" width="140px">{{ boxReactive.width.toFixed(2)
        }}mm</el-descriptions-item>
        <el-descriptions-item label="宽度" :span="1" width="140px">{{ boxReactive.height
          .toFixed(2) }}mm</el-descriptions-item>
        <el-descriptions-item label="高度" :span="1" width="140px">{{ boxReactive.deepth.toFixed(2)
        }}mm</el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from "vue"
import type { ModelItem } from "~/types/model"
const { LibaryModal } = useThree()
const three = ref()
const loading = ref(false)
const message = ref("正在加载")
let optObj: InstanceType<typeof LibaryModal> | null = null
const boxReactive = reactive({
  width: 0,
  height: 0,
  deepth: 0,
})
const props = defineProps<{ item: ModelItem }>()
const init = (item: ModelItem) => {
  loading.value = true
  const { url } = item
  console.log(item);
  setTimeout(() => {
    const obj = new LibaryModal(three.value, {
      progress: (progress) => {
        message.value = `正在加载${progress}%`
      }
    })
    obj.handleLoadModelByUrl(url, (box) => {
      boxReactive.width = box.width
      boxReactive.height = box.height
      boxReactive.deepth = box.len
    }).then(() => {
      loading.value = false
    }, () => {
      loading.value = false

    })
    optObj = obj
  }, 100)
}
watch(
  () => props,
  (newVal) => {
    if (newVal && newVal.item) {
      init(newVal.item)
    }
  },
  { immediate: true, deep: true }
)
</script>
<style lang="less" scoped>
.show-modal-wrapper {
  width: 100%;
  height: 50vh;
  position: relative;

  .show-modal-three {
    width: 100%;
    height: 100%;
  }

  .model-info {
    position: absolute;
    top: 10px;
    right: 10px;
    background: #ffff;
    padding: 20px
  }

}
</style>
