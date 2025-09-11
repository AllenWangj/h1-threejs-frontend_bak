<template>
    <div class="plan-and-layout"  v-loading="loading">
        <div class="plan-and-plan_tree" ref="three"></div> 
    </div>
</template>
<script setup lang="ts">
import PlanAndLayout from "~~/utils/planAndLayout.ts"
import {ref,onMounted}from "vue"
let planAndLayout :PlanAndLayout | null = null
const progress =ref()
const three = ref()
const loading = ref(false)
onMounted(() =>{
   planAndLayout = new  PlanAndLayout(three.value)
})
</script>
<style lang="less" scoped>
.plan-and-layout {
    width:100%;
    height:100%;
    background:#f0f0f0;
    .plan-and-plan_tree {
        width:100%;
        height:100%;
        // background: #f00;
    }
}

</style>