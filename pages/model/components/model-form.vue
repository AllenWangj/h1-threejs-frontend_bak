<template>
  <el-form ref="formRef" :model="formData" label-width="auto" :rules="rules">
    <el-form-item label="模型类型" prop="type">
      <ez-select v-model="formData.type" :options="typeOptions" />
    </el-form-item>
    <el-form-item label="模型名称" prop="name">
      <el-input v-model="formData.name" clearable />
    </el-form-item>
    <el-form-item label="模型编码" prop="code">
      <el-input v-model="formData.code" clearable />
    </el-form-item>
    <el-form-item label="模型文件" prop="url">
      <el-upload multiple :file-list="fileList" :on-exceed="handleExceed" :limit="1" ref="uploadRef" accept="gltf"
        action="" :auto-upload="false" :on-change="uploadFile" :before-remove="removeFile" :show-file-list="true">
        <el-button type="primary" :loading="uploadLoading">
          {{ uploadLoading ? '上传中...' : '点击上传' }}
        </el-button>
      </el-upload>
    </el-form-item>
    <el-form-item label="长度(单位mm)" prop="length">
      <el-input-number v-model="formData.length" clearable :controls="false" style="width:100%" align="left" />
    </el-form-item>
    <el-form-item label="宽度(单位mm)" prop="width">
      <el-input-number v-model="formData.width" clearable :controls="false" style="width:100%" align="left" />
    </el-form-item>
    <el-form-item label="高度(单位mm)" prop="height">
      <el-input-number v-model="formData.height" clearable :controls="false" style="width:100%" align="left" />
    </el-form-item>
  </el-form>
</template>
<script setup lang="ts">
import { reactive } from "vue"
import { useOss } from "~~/composables/use-oss"
import { genFileId, type FormInstance, type FormRules } from 'element-plus'
import type { ModelItem } from "~/types/model"
import { getModelDetail } from "~/apis/model"
interface PropsType {
  recordId?: string
}
const props = defineProps<PropsType>()
const typeOptions = [
  { label: 'glb', value: 1 },
  { label: 'gltf', value: 2 },
]
const formRef = ref<FormInstance>()
const { putFile } = useOss()
const fileList = ref([])
const formData = ref<Partial<ModelItem>>({
  name: '',
  code: '',
  type: 1,
  length: null,
  width: null,
  height: null,
  url: '',
  hash: ''
})
const { uploadLoading, uploadFile, removeFile, handleExceed, uploadRef } = createdUploadFile()
function createdUploadFile() {
  const uploadRef = ref(null)
  const uploadLoading = ref(false)
  /**
   * 处理文件上传
   * @param {File} file - 上传的文件对象
   */
  const uploadFile = (file: any) => {
    // formData.name = file.name
    submitFile(file)
  }

  /**
   * 移除已上传的文件
   */
  const removeFile = () => {
    formData.value.url = ''
    formData.value.hash = ''
    return true
  }
  const handleExceed = (files) => {
    uploadRef.value!.clearFiles()
    const file = files[0]
    file.uid = genFileId()
    uploadRef.value!.handleStart(file)
  }
  /**
   * 提交文件到服务器
   * @param {File} file - 要上传的文件
   */
  const submitFile = async (file: any) => {
    try {
      const { data } = await putFile(file.raw)
      formData.value.url = data.url
      formData.value.hash = data.hash
    } catch (error) {
      formData.value.url = ''
    } finally {
      uploadLoading.value = false
    }
  }
  return {
    uploadRef,
    uploadLoading,
    uploadFile,
    removeFile,
    handleExceed
  }
}
const rules = reactive<FormRules>({
  name: { required: true, message: '请输入模型名称', trigger: 'blur' },
  code: { required: true, message: '请输入模型编码', trigger: 'blur' },
  url: { required: true, message: '请上传模型文件', trigger: 'blur' },
  length: { required: true, message: '请输入模型长度(单位mm)', trigger: 'blur' },
  width: { required: true, message: '请输入模型宽度(单位mm)', trigger: 'blur' },
  height: { required: true, message: '请输入模型高度(单位mm)', trigger: 'blur' },
})
const getDetail = async (id: string) => {
  try {
    const { data } = await getModelDetail({ id })
    formData.value = { ...data }
  } catch (error) {
    console.error('获取模型详情失败', error)
  }
}
const getFormData = async () => {
  try {
    await formRef.value.validate()
    return formData.value
  } catch (error) {
    ElMessage.error('表单验证失败，请检查输入项')
    throw error
  }

}
watch(
  () => props.recordId,
  (newVal) => {
    if (newVal) {
      getDetail(newVal)
    }
  },
  { immediate: true }
)
defineExpose({
  getFormData
})
</script>