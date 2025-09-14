<template>
    <div class="flex-shrink-0 flex flex-col w-[160px] flex-shrink-0 px-[14px] py-[20px] border-r border-[#adcdf7]">
        <el-button type="primary" :class="{ 'is-active': isActiveTab === 1 }" @click="change(1)">
            <img v-if="isActiveTab === 1" src="../../assets/images/home/shangchuan-2.svg" width="30" height="30" alt="">
            <img v-else src="../../assets/images/home/shangchuan-1.svg" width="30" height="30" alt="">
            <span class="ml-[8px] text-[16px]" :class="isActiveTab === 1 ? 'font-bold' : ''">上传文件</span>
        </el-button>
        <el-button type="primary" :class="{ 'is-active': isActiveTab === 2 }" @click="change(2)">
            <img v-if="isActiveTab === 2" src="../../assets/images/home/canshu-2.svg" width="30" height="30" alt="">
            <img v-else src="../../assets/images/home/canshu-1.svg" width="30" height="30" alt="">
            <span class="ml-[8px] text-[16px]" :class="isActiveTab === 2 ? 'font-bold' : ''">输入参数</span>
        </el-button>
        <el-button type="primary" :class="{ 'is-active': isActiveTab === 3 }" @click="change(3)">
            <img v-if="isActiveTab === 3" src="../../assets/images/home/fangan-2.svg" width="30" height="30" alt="">
            <img v-else src="../../assets/images/home/fangan-1.svg" width="30" height="30" alt="">
            <span class="ml-[8px] text-[16px]" :class="isActiveTab === 3 ? 'font-bold' : ''">生产方案</span>
        </el-button>
    </div>
</template>
<script setup lang="ts">

const emit = defineEmits<{
    (e: 'on-change', tab: number): void
}>()
const props = defineProps({
    /** 1: 上传文件 2: 输入参数 3: 生产方案 */
    activeTab: {
        type: Number,
        default: 1
    }
})

const isActiveTab = ref(props.activeTab)

watch(() => props.activeTab, (newVal) => {
    isActiveTab.value = newVal
})

const change = (tab: number) => {
    isActiveTab.value = tab
    emit('on-change', tab)
}


</script>
<style lang="less" scoped>
.el-button+.el-button {
    margin-top: 15px;
    margin-left: 0px;
}

.el-button {
    width: 132px;
    height: 60px;
    display: flex;
    align-items: center;
    background: linear-gradient(180deg, #fff, #deecff);
    border-color: #adcdf7;
    color: #333;
}

;

.el-button.is-active {
    background: #3a83fc;
    border-color: #3a88fc;
    color: #fff;
}
</style>