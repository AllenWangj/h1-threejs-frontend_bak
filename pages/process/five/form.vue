<template>
  <div v-loading="pageLoading" element-loading-background="rgba(0,0,0,0.5)" class="form-page-container">
    <div class="w-[100%] h-[100%] flex flex-col bg-[#022E67] rounded-[16px]">
      <div class="form-page-header">
        <span class="text-[16px] text-[#3689F7] ml-[8px]">部件生产</span>
      </div>

      <div class="form-page-body">
        <div class="flex-grow-[1]">
          <File :source="5" />
        </div>

        <div class="flex-grow-[3] flex flex-col">
          <div class="px-[14px] py-[14px]">
            <el-switch v-model="status" active-text="算法" inactive-text="系统">
            </el-switch>
            <el-form ref="ProjectFormRef" :model="formData" size="large" label-position="top" label-width="120px"
              class="w-full">
              <div class="w-full px-[14px] py-[10px] mb-[14px] rounded-[4px]" v-for="item in formData.projectForm"
                :key="item.field">
                <el-form-item label="">
                  <template #label>
                    <div class="flex items-center">
                      <span v-if="status">{{ item.label }}</span>
                      <el-checkbox v-else size="large" v-model="item.tag" class="checkbox-class">{{ item.label
                      }}</el-checkbox>
                      <template v-if="item.field === 'custom'">
                        <el-upload class="ml-[20px]" accept=".json" :auto-upload="false" :show-file-list="false"
                          :on-change="(e) => handleFileChange(e, item)">
                          <el-button type="primary">选择 JSON 文件</el-button>
                        </el-upload>
                      </template>
                    </div>
                  </template>
                  <template v-if="item.field === 'custom'">
                    <!-- 显示JSON字符串，并按格式换行缩进 -->
                    <div class="w-[100%]">
                      <pre v-if="item.value" class="text-[#69AAEE] text-[16px]">{{ item.value }}</pre>
                    </div>
                  </template>
                  <ez-select v-else-if="item.type === 'select'" v-model="item.value" placeholder="请选择" :clearable="true"
                    style="width: 100%" :options="item.options" />
                  <el-input-number v-else-if="item.type === 'inputNumber'" v-model="item.value" placeholder="请选择"
                    :clearable="true" style="width: 100%" :controls="false" />
                  <el-input v-else-if="item.type === 'input'" v-model="item.value" placeholder="请选择" :clearable="true"
                    style="width: 100%" :controls="false" />
                  <ez-select v-else-if="item.type === 'multiple'" v-model="item.value" placeholder="请选择"
                    :clearable="true" multiple style="width: 100%" :options="item.options" />

                  <el-select v-else-if="item.type === 'multiple-create'" v-model="item.value" filterable allow-create
                    multiple placeholder="请输入">
                  </el-select>
                  <div v-else-if="item.type === 'multiple-dynamic'" class="w-full">
                    <ez-select v-model="item.value" placeholder="请选择" :clearable="true" multiple style="width: 100%"
                      :options="item.options" />
                    <div v-for="(options, index) in item.valueConfig" :key="options.field">
                      <div v-if="item.value.includes(options.field)" class="flex items-center mt-[8px]">
                        <div class="text-[#69AAEE] text-[16px] min-w-[60px] text-right mr-[15px]">
                          {{ getArrayLabel(options.field, item.options) }}
                        </div>
                        <el-input v-model="options.value" oninput="value=value.replace(/[^\d]/g,'')" class="w-[200px]">
                          <template #append>{{ options.unit }}</template>
                        </el-input>
                        <!-- 可以输入数字和小数点得正则 -->
                        <el-input v-if="options.unit2" v-model="options.value2"
                          oninput="value=value.replace(/[^\d.]/g,'')" class="w-[200px] ml-[10px]">
                          <template #append>{{ options.unit2 }}</template>
                        </el-input>
                      </div>
                    </div>
                  </div>
                </el-form-item>
              </div>
            </el-form>
          </div>
        </div>
      </div>
    </div>

    <div class="form-page-foooter">
      <el-button class="def-plain-button" size="large" :disabled="saveLoading" @click="handleReset">重置</el-button>
      <el-button class="def-plain-button" size="large" :loading="saveLoading" @click="handleSave">保存</el-button>
      <el-button class="def-primary-button" size="large" :disabled="saveLoading"
        @click="handleGenerateSolution">生成方案</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import File from '~/pages/process/components/file.vue'
import {
  updatePartsProductionParams,
  generatePartsProductionPlan,
  partsProductionDetail,
  algorithmGenerate
} from '@/apis/project'
import { ref, computed } from "vue"
const status = ref(false)
const route = useRoute()

const projectId = ref('')

const saveLoading = ref(false)

const pageLoading = ref(false)

const BuildingFunctional = 'building_functional' // 建筑功能
const StructuralPlan = 'structural_plan' // 结构方案
const ComponentSpecifications = 'component_pecifications' // 构件规格
const { dictMap, getDictMap, getArrayLabel } = useDict()
const componentLocationOptions = [
  {
    label: '默认',
    value: '0'
  }
]
const customOptions = []

const defaultOptions = [
  {
    label: '默认',
    value: '0'
  }
]

// label映射
const LABLE_MAP = {
  layout: '建筑布局',
  structuralPlan: '结构方案',
  componentLocation: '构部件位置',
  componentSpecifications: '构部件规格',
  custom: '自定义参数'
}
// 字典映射
const DICT_MAP = computed(() => {
  return {
    layout: [...defaultOptions, ...(dictMap.value.get(BuildingFunctional) || [])],
    structuralPlan: [...defaultOptions, ...(dictMap.value.get(StructuralPlan) || [])],
    componentLocation: componentLocationOptions || [],
    componentSpecifications: [...defaultOptions, ...(dictMap.value.get(ComponentSpecifications) || [])],
    custom: customOptions || []
  }
})
// 表单数据
const formData = ref({
  projectForm: []
})
const initProjectForm = ref({})

// 处理文件选择
const handleFileChange = (file: any, item: any) => {
  const rawFile = file.raw
  if (!rawFile) return

  // 判断文件类型
  if (!rawFile.name.endsWith('.json')) {
    ElMessage.error('请选择 JSON 文件')
    return
  }

  // 使用 FileReader 读取文件内容
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const result = e.target?.result as string
      item.value = result
      ElMessage.success('JSON 文件读取成功！')
    } catch (err) {
      console.error(err)
      ElMessage.error('JSON 解析失败，请检查文件内容')
    }
  }
  reader.readAsText(rawFile)
}

const handleReset = () => {
  if (status.value) {
    formData.value.projectForm = (defData).map((item) => {
      // item.label = LABLE_MAP[item.field] || item.field
      // item.options = DICT_MAP.value[item.field] || []
      return item
    })
  } else {
    formData.value = JSON.parse(JSON.stringify(initProjectForm.value))
  }
}

const handleSave = async () => {
  try {
    saveLoading.value = true
    // if(status.value) {}
    const params = JSON.parse(JSON.stringify(formData.value.projectForm))
    await updatePartsProductionParams({
      projectId: projectId.value,
      params
    })
    ElMessage.success('保存成功')
    initProjectForm.value = JSON.parse(JSON.stringify(formData.value))
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saveLoading.value = false
  }
}

const handleGenerateSolution = async () => {
  try {
    saveLoading.value = true
    const params = JSON.parse(JSON.stringify(formData.value.projectForm))
    // debugger
    if (status.value) {
      const params1 = params.reduce((target, ele) => {
        target[ele.field] = ele.value
        return target
      }, { projectId: projectId.value, })
      await algorithmGenerate(params1)
    } else {
      await generatePartsProductionPlan({
        projectId: projectId.value,
        source: 5,
        params
      })
    }

    ElMessageBox.alert('方案生成中，请稍后去生成方案中查看', '温馨提示', {
      confirmButtonText: '知道了'
    })
  } catch (error) {
    ElMessage.error('方案生成失败')
  } finally {
    saveLoading.value = false
  }
}

// 获取详情
let paramsData = null
async function fetchDetail() {
  try {
    pageLoading.value = true
    const { data } = await partsProductionDetail({
      projectId: projectId.value
    })
    console.log('获取部件生产详情', data)
    // data.params ||
    if (data.params && data.params.length > 0) {
      const { type } = data.params[0]

      if (type == 'input') {
        status.value = true
      paramsData = null
        nextTick(() => {
          formData.value.projectForm = (defData).map((item, index) => {
            // item.label = LABLE_MAP[item.field] || item.field
            // item.options = DICT_MAP.value[item.field] || []
            item.value = data.params[index].value
            return item
          })
        })

      } else {
        paramsData = data.params
        status.value = false
        nextTick(() => {
          formData.value.projectForm = (data.params || defData).map((item) => {
            item.label = LABLE_MAP[item.field] || item.field
            item.options = DICT_MAP.value[item.field] || []
            return item
          })
        })


      }
    } else {
      status.value = false
      paramsData = null
      nextTick(() => {
        formData.value.projectForm = (data.params || defData).map((item) => {
          item.label = LABLE_MAP[item.field] || item.field
          item.options = DICT_MAP.value[item.field] || []
          return item
        })
      })


    }

    initProjectForm.value = JSON.parse(JSON.stringify(formData.value))
  } catch (error) {
    console.error('获取部件生产详情失败', error)
  } finally {
    pageLoading.value = false
  }
}

onMounted(async () => {
  await getDictMap([BuildingFunctional, StructuralPlan, ComponentSpecifications])
  if (route.query.projectId) {
    projectId.value = route.query.projectId as string
    fetchDetail()
  }
})
const formDataList = computed(() => {
  if (status.value === true) {
    return defData
  } else {
    return defData1
  }
})

const defData1 = [
  {
    "tag": true,
    "type": "select",
    "field": "layout",
    "label": "建筑布局",
    "options": [],
    "valueConfig": null
  },
  {
    "tag": true,
    "type": "select",
    "field": "structuralPlan",
    "label": "结构方案",
    "options": [],
    "valueConfig": null
  },
  {
    "tag": true,
    "type": "select",
    "field": "componentLocation",
    "label": "构部件位置",
    "options": [],
    "valueConfig": null
  },
  {
    "tag": true,
    "type": "multiple-dynamic",
    "field": "componentSpecifications",
    "label": "构部件规格",
    "value": [],
    "options": [],
    "valueConfig": [
      {
        "type": "input",
        "unit": "kg",
        "field": "1",
        "value": ""
      }
    ]
  },
  {
    "tag": true,
    "type": "select",
    "field": "custom",
    "label": "自定义参数",
    "value": '',
    "options": [],
    "valueConfig": null
  }
]
const defData = [
  {
    "tag": true,
    "type": "input",
    "field": "encode",
    "label": "编码说明",
    "value":"",
    // "options": [],
    "valueConfig": null
  },
  {
    "tag": true,
    "type": "inputNumber",
    "field": "n",
    "label": "模块个数",
    "options": [],
    "valueConfig": null,
  

  },
  {
    "tag": true,
    "type": "input",
    "field": "material-1",
    "label": "第一种材料",
    "options": [],
    "value":"Q355B",

    "valueConfig": null
  },
  {
    "tag": true,
    "type": "input",
    "field": "material-2",
    "label": "第二种材料",
    "value":"Q235B",
    "options": [],
    "valueConfig": null
  },
  {
    "tag": true,
    "type": "multiple-create",
    "field": "module-size",
    "label": "模块尺寸",
    "options": [],
    "valueConfig": null,
    
  },
  {
    "tag": true,
    "type": "inputNumber",
    "field": "column_predefined",
    "label": "柱",
    "options": [],
    "valueConfig": null
  },

  {
    "tag": true,
    "type": "inputNumber",
    "field": "beam_predefined",
    "label": "横梁",
    "options": [],
    "valueConfig": null
  },
  {
    "tag": true,
    "type": "inputNumber",
    "field": "beam_predefined1",
    "label": "纵梁",
    "options": [],
    "valueConfig": null
  },

  {
    "tag": true,
    "type": "inputNumber",
    "field": "beam_predefined1",
    "label": "纵梁",
    "options": [],
    "valueConfig": null
  },

  {
    "tag": true,
    "type": "inputNumber",
    "field": "slab_a",
    "label": "底板横梁",
    "options": [],
    "valueConfig": null
  },
  {
    "tag": true,
    "type": "inputNumber",
    "field": "slab_a1",
    "label": "底板横梁护板",
    "options": [],
    "valueConfig": null
  },
  {
    "tag": true,
    "type": "inputNumber",
    "field": "slab_a2",
    "label": "地板",
    "options": [],
    "valueConfig": null
  }, {
    "tag": true,
    "type": "inputNumber",
    "field": "slab_a3",
    "label": "地板横向支撑板",
    "options": [],
    "valueConfig": null
  }, {
    "tag": true,
    "type": "inputNumber",
    "field": "slab_a4",
    "label": "地砖",
    "options": [],
    "valueConfig": null
  }, {
    "tag": true,
    "type": "inputNumber",
    "field": "slab_a5",
    "label": "顶板",
    "options": [],
    "valueConfig": null
  }, {
    "tag": true,
    "type": "inputNumber",
    "field": "slab_a6",
    "label": "底梁支撑板",
    "options": [],
    "valueConfig": null
  },
  {
    "tag": true,
    "type": "inputNumber",
    "field": "slab_a7",
    "label": "地板纵向支撑条",
    "options": [],
    "valueConfig": null
  }, {
    "tag": true,
    "type": "inputNumber",
    "field": "door",
    "label": "门",
    "options": [],
    "valueConfig": null
  }, {
    "tag": true,
    "type": "inputNumber",
    "field": "window",
    "label": "窗",
    "options": [],
    "valueConfig": null
  },
  {
    "tag": true,
    "type": "inputNumber",
    "field": "wall_predefined_profile_input_1",
    "label": "内饰墙板",
    "options": [],
    "valueConfig": null
  }, {
    "tag": true,
    "type": "inputNumber",
    "field": "wl7l",
    "label": "外墙",
    "options": [],
    "valueConfig": null
  },
  {
    "tag": true,
    "type": "inputNumber",
    "field": "column2",
    "label": "外包板",
    "options": [],
    "valueConfig": null
  }, {
    "tag": true,
    "type": "inputNumber",
    "field": "column3",
    "label": "挂檩",
    "options": [],
    "valueConfig": null
  }, {
    "tag": true,
    "type": "inputNumber",
    "field": "column4",
    "label": "连接件",
    "options": [],
    "valueConfig": null
  },






  // {
  //   "tag": true,
  //   "type": "multiple-dynamic",
  //   "field": "componentSpecifications",
  //   "label": "构部件规格",
  //   "value": [],
  //   "options": [],
  //   "valueConfig": [
  //     {
  //       "type": "input",
  //       "unit": "kg",
  //       "field": "1",
  //       "value": ""
  //     }
  //   ]
  // },
  // {
  //   "tag": true,
  //   "type": "select",
  //   "field": "custom",
  //   "label": "自定义参数",
  //   "value": '',
  //   "options": [],
  //   "valueConfig": null
  // }
]
watch(() => status.value, (newValue) => {
  if (newValue) {
    formData.value.projectForm = (defData).map((item) => {
      // item.label = LABLE_MAP[item.field] || item.field
      // item.options = DICT_MAP.value[item.field] || []
      return item
    })
  } else {
    formData.value.projectForm = (paramsData || defData1).map((item) => {
      item.label = LABLE_MAP[item.field] || item.field
      item.options = DICT_MAP.value[item.field] || []
      return item
    })
  }
})
</script>
