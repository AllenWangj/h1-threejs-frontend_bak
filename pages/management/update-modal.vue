<template>
    <BasicModal @register="register" width="500px" title="上传模型" @ok="handleComfirmEvt">
        <el-form ref="formRef" :model="formData" label-width="120px" :rules="rules">
            <el-form-item label="模型名称" prop="name">
                <el-input v-model="formData.name" clearable />
            </el-form-item>
            <el-form-item label="模型地址" prop="url">
                <!-- :disabled="!!formData.url" -->
                <el-upload multiple :file-list="fileList" :on-exceed="handleExceed" :limit="1" ref="uploadRef"
                    accept="gltf" action="" :auto-upload="false" :on-change="uploadFile" :before-remove="removeFile"
                    :show-file-list="true">
                    <el-button type="primary" :loading="uploadLoading">
                        {{ uploadLoading ? '上传中...' : '点击上传' }}
                    </el-button>
                </el-upload>
            </el-form-item>
            <el-form-item label="长度(单位mm)" prop="length">
                <el-input-number v-model="formData.length" clearable :controls="false" style="width:100%"
                    align="left" />
            </el-form-item>
            <el-form-item label="宽度(单位mm)" prop="width">
                <el-input-number v-model="formData.width" clearable :controls="false" style="width:100%" align="left" />
            </el-form-item>
            <el-form-item label="高度(单位mm)" prop="height">
                <el-input-number v-model="formData.height" clearable :controls="false" style="width:100%"
                    align="left" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="closeModal">取消</el-button>
            <el-button type="primary" @click="handleComfirmEvt">确定</el-button>
        </template>
    </BasicModal>
</template>
<script setup lang="ts">
import { reactive } from "vue"
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { BasicModal, useInnnerModal } from "~~/component/BaseModel/index"
import { useUpload } from "~~/composables/use-upload"
import { getAddModel,updateModal } from '~/apis/model'
import { genFileId } from 'element-plus'
import { nextTick } from "vue"
const isUpdate = ref(false)
let id  = -1
const [register, { closeModal }] = useInnnerModal((data) => {
    const { update, record } = data
    fileList.value = []
    isUpdate.value = update
    if (update) {
        // 代表是更新
        formData.name = record.name
        formData.length = record.length
        formData.width = record.width
        formData.height = record.height
        formData.url = record.url
        const pathNameList = record.url.split("/")
        const pathNammme = pathNameList[pathNameList.length - 1]
        fileList.value.push({
            name: pathNammme,
            url: record.url,
        })
         id = record.id
    } else {
        debugger
        // 代表是新增
        formData.name = ""
        formData.length = ""
        formData.width = ""
        formData.height = ""
        formData.url = ""
    }

})

const fileList = ref([])
const formRef = ref()
const { loadFile, fetchOssAuth } = useUpload()
const formData = reactive({
    name: '',
    length: undefined,//高度
    width: undefined,//宽度
    height: undefined,//高度
    url: '',
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
        // uploadRef.value?.clearFiles()
        formData.url = ''
        // fileList.value = []
        // debugger
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
            const res = await loadFile(file.raw)
            formData.url = res.url
        } catch (error) {
            formData.url = ''
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
const rules = reactive({
    name: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
    url: [{ required: true, message: '请输入模型地址', trigger: 'blur' }],
    length: [{ required: true, message: '请输入模型长度(单位mm)', trigger: 'blur' }],
    width: [{ required: true, message: '请输入模型宽度(单位mm)', trigger: 'blur' }],
    height: [{ required: true, message: '请输入模型高度(单位mm)', trigger: 'blur' }],
})
const emit = defineEmits(['success'])
function handleComfirmEvt() {
    formRef.value.validate((result) => {
        if (result) {
            if (!isUpdate.value) {
                getAddModel(formData).then(res => {
                    ElMessage.success("保存成功")
                    emit('success')
                    formRef.value.resetFields()
                    closeModal()
                })
            }else {
                updateModal({...formData,id}).then(res => {
                    ElMessage.success("修改成功")
                    emit('success')
                    formRef.value.resetFields()
                    closeModal()
                })
                 
            }
        } 

    })
}
</script>
<style lang="scss" scoped></style>