import { ref, watchEffect, reactive } from "vue"
const modalInstanceSaveData: {
    [key in string]: any
} = reactive({})
export function useModal() {
    const modalInstance = ref<any>()
    const uid = ref("")
    function register(data) {
        
        modalInstance.value = data.modalInstannce
        uid.value = data.uuid
    }
    function openModal(state: boolean, data: Record<string, any>) {
        modalInstance.value.openModal(state)
        modalInstanceSaveData[uid.value] = data
    }
    return [register, { openModal }]
}
export function useInnnerModal(cbk) {
    const modalInstance = ref<any>()
    const uid = ref("")
    function register(data) {

        modalInstance.value = data.modalInstannce
        uid.value = data.uuid
    }
    const method = {
        closeModal: () => {
            modalInstance.value.closeModal()
            modalInstanceSaveData[uid.value] = null
        }
    }
    watchEffect(() => {
        if (modalInstanceSaveData[uid.value]) {
            cbk && cbk(modalInstanceSaveData[uid.value])
        }
    })
    return [
        register, method
    ]

}