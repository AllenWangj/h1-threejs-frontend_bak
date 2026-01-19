<template>
  <div>
    <ez-fast-table ref="tableRef" v-model:params="searchParams" v-model:loading="loading" :columns="columns"
      :api="getStudentSettledPage" :max-height="tableMaxHeight">
      <template #form>
        <el-form :model="searchParams" inline label-width="auto" @submit.prevent @keyup.enter="search">
          <el-col :span="8">
            <el-form-item label="模型名称">
              <el-input v-model="searchParams.name" clearable />
            </el-form-item>
          </el-col>
        </el-form>
      </template>
      <template #header>
        <el-button type="primary" :icon="Plus" @click="addItem">新增</el-button>
      </template>
      <template #operation="{ row }">
        <el-button link type="primary" @click="viewItem(row)">查看模型</el-button>
        <el-button link type="primary" @click="editItem(row)">编辑</el-button>
        <el-button link type="primary" @click="deleteItem(row)">删除</el-button>
      </template>
        <template #createTime="{ row }">
          {{ dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template #length="{ row }">
          {{ row.length }}mm
        </template>
        <template #width="{ row }">
                   {{ row.width }}mm

        </template>
        <template #height="{ row }">
             {{ row.height }}mm
        </template>
    </ez-fast-table>
    <UpdateModal @register="register" @success="handleSuccessEvt"/>
    <ShowModeModal @register="registerOfShow"/>

  </div>
</template>
<script setup lang="ts">
import { Plus } from '@maxtan/ez-ui-icons'
import type { SelectOption, TableColumn } from '@maxtan/ez-ui'
import UpdateModal from "./update-modal.vue"
import {useModal} from "~~/component/BaseModel/index"
import { getModelList } from '~/apis/model'
import dayjs from 'dayjs';
import ShowModeModal from "./show-modal.vue"
import { removeModel} from '~/apis/model'

// getModelList
definePageMeta({
  layout: 'management',
  permissions: 'management'
})
const router = useRouter()
const [register,{openModal}] = useModal()
const [registerOfShow,{openModal:opennShowModal}] = useModal()

const loading = ref(false)
const { formatTime } = useUtils()
const { tableMaxHeight } = useLayout()
const searchParams = reactive({
  name: '',
  current: 1,
  size: 10
})
const columns = reactive<TableColumn<any>[]>([
  { prop: 'name', label: '模型名称', width: 200, fixed: 'left', sortable: true },
  // {
  //   prop: 'url',
  //   label: '模型地址'
  // },
  {
    prop: 'length',
    label: '长度'
  },
  {
    prop: 'width',
    label: '宽度'
  },
  {
    prop: 'height',
    label: '高度'
  },
   {
    prop: 'createTime',
    label: '创建时间'
  },
  { prop: 'operation', label: '操作', width: 200, fixed: 'right' }
])
function handleSuccessEvt(){
  search()
}
const tableRef = ref()
/**
 * 搜索
 */
const search = () => {
  searchParams.current = 1
  tableRef.value.search()
}

/**
 * 新增
 */
const addItem = () => {
  // dialogVisible.value = true
  openModal(true,{
     update:false,
  })
}

/**
 * 查看
 */
const viewItem = (_item) => {
  //查看模型
  opennShowModal(true,{
    record:_item
  })
  // router.push(`/student/bank/detail?id=${_item.id}`)
}

/**
 * 编辑
 */
const editItem = (_item) => {
  // router.push(`/student/bank/edit?id=${_item.id}`)
    openModal(true,{
      update:true,
      record:_item
    })
}

/**
 * 删除
 */
const deleteItem = async (_item) => {
  // 删除逻辑
    try {
    const confirm = await ElMessageBox.confirm('是否删除?', '提示')
    if (confirm === 'confirm') {
      await removeModel({ id: _item.id })
      ElMessage.success('操作成功！')
      search()
    }
  } catch (error) {}
}

onMounted(() => {
  search()
})

/**
 * 模拟请求
 */
const getStudentSettledPage = async (params) => {
  return new Promise((resolve) => {
    getModelList(params).then(res=>{
      resolve(res)
    })
  })
}

</script>
