<template>
    <ez-dialog v-bind="$attrs" v-model="dialogVisible" @ok="handleOkEvt">
        <slot></slot>
        <template #footer>
            <slot name="footer"></slot>
        </template>
        <!--  -->
    </ez-dialog>
</template>
<script setup lang="ts">
import { fa } from "element-plus/es/locales.mjs"
import {ref,getCurrentInstance} from "vue"
const dialogVisible = ref(false)
const emit  = defineEmits(['register','ok'])
const modalInstannce = {
    openModal:(status:boolean) =>{
        dialogVisible.value = status
    },
    closeModal:() =>{
        dialogVisible.value = false
    }   
}
function handleCancelEvt(){
    dialogVisible.value = false

}

function handleComfirmEvt(){
    emit("ok")
}
emit('register',{
    modalInstannce:modalInstannce,
    uuid:getCurrentInstance().uid
})
function handleOkEvt(){
    console.log("1111111111")
}
</script>