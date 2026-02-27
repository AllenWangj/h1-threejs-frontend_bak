import * as THREE from 'three';
import { type GLTF } from 'three/addons/loaders/GLTFLoader.js';
const { BaseThree } = useThree()
const { getModelUrl, getModelMap } = useModelMap()
class ProcessFour extends BaseThree {
    // 流程4模型根节点
    wrapper: THREE.Group
    // 待加载的模型 code 列表
    private gltfCode: string[] = []
    public promiseFactories: (() => Promise<{
        wrapper: THREE.Group,
        object: GLTF,
        position: { x: number, y: number, z: number },
        roation: { x: number, y: number, z: number },
        scale: { x: number, y: number, z: number },
        name: string
    }>)[] = [];
    constructor(node: HTMLElement, public opt: {
        progress: (progress: number) => void
    }) {
        super(node, {

        })
        // 初始化业务根分组
        this.wrapper = new THREE.Group()
        this.scene.add(this.wrapper)
        // this.handleOriginModel(position)


    }
    public async handleOriginModel(position: any) {
                // 清理上一次模型状态
        this.gltfCode = []
          this.handleClearnJunk(this.wrapper)
                // 递归解析结构树，构建加载任务
        this.handleLoadUrl(position, this.wrapper)
                // 批量获取模型映射并并发加载
        await getModelMap(this.gltfCode)
        const results = await this.runWithConcurrency(this.promiseFactories, 500)
        // 将加载结果按位姿参数挂载到对应父节点
        results.forEach(ele => {
            const { object, wrapper, position, roation, scale, name } = ele
            object.scene.position.set(
                position.x,
                position.y,
                position.z,
            )
            object.scene.rotation.set(
                roation.x,
                roation.y,
                roation.z,
            )
            object.scene.scale.set(
                scale.x,
                scale.y,
                scale.z,
            )
            // wrapper.name = name
            wrapper.add(object.scene)
        })
        // 以整体包围盒为基准设置相机视角
        const size = this.calculateGroupDimensions(this.wrapper)



        //  const group2 = this.wrapper.getObjectByName("Group_89")
        // group2.visible =false

        //    const group3 = this.wrapper.getObjectByName("Group_317")
        // group3.visible =false

        //  const group4 = this.wrapper.getObjectByName("Group_380")
        // group4.visible =false

        //   const group5 = this.wrapper.getObjectByName("Group_273")
        // group5.visible =false

        //  const group6 = this.wrapper.getObjectByName("Group_25")
        // group6.visible =false
        const number = 600
        this.camera!.position.set(size.center.x- number, size.center.y , size.center.z)
        this.controls.target.set(size.center.x, size.center.y, size.center.z)
    }
     protected handleClearnJunk(group: THREE.Group): void {
            if (!group || !group.parent) {
                console.warn('⚠️ 尝试释放无效的组')
                return
            }
            // 递归释放网格资源
            group.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    // 释放几何体
                    object.geometry?.dispose()
                    object.material?.dispose()
                }
            })
            group.clear()
        }
    private handleLoadUrl(object: any, parent: any) {
        if (object.code) {
            // 叶子节点：依据 code 加载模型
            const code = object.code == '10404' ? "04_01_" +object.code :object.code
            this.gltfCode.push(code)
            this.promiseFactories.push(() => {
                return new Promise((reslove) => {
                    const modelUrl = getModelUrl(code)
                    this.loadGLTFResource(modelUrl).then(res => {
                        reslove({
                            wrapper: parent,
                            object: res,
                            position: object.position,
                            roation: object.roation,
                            scale: object.scale,
                            name: object.name
                        })
                    })
                })
            })
        }
        else if (object.name.indexOf("<组件#") != -1) {
            // 组件节点：区分“继续递归”与“直接加载模型文件”两种路径
            let name = ""
            if (object.children && object.children.length > 0) {
                const children = object.children[0]
                name = children.name
            }
            if (name && name.indexOf("<组件#") != -1) {
                // 仍是容器节点，创建 group 后继续递归
                const group = new THREE.Group()
                group.name = object.name
                group.position.set(
                    object.position.x,
                    object.position.y,
                    object.position.z,
                )
                group.rotation.set(
                    object.roation.x,
                    object.roation.y,
                    object.roation.z,
                )
                group.scale.set(
                    object.scale.x,
                    object.scale.y,
                    object.scale.z,
                )
                parent.add(group)
                object.children.forEach(ele => {
                    this.handleLoadUrl(ele, group)
                })
            } else {
                // 叶子组件：按约定路径加载 xfour 资源
                const result = object.name.replace(/<组件#(\d+)>.*/, "model$1");
                // const name = (result as string).split("model")
                // object.code = "102"+name[name.length -1]
                // this.promiseFactories.push(() =>this.loadGLTFResource(`/gltf/5/libary/${result}.gltf`))
                this.promiseFactories.push(() => {
                    return new Promise((reslove) => {
                        const code = object.code || result

                        this.loadGLTFResource(`/xfour/${code}.gltf`).then(res => {
                            reslove({
                                wrapper: parent,
                                object: res,
                                position: object.position,
                                roation: object.roation,
                                scale: object.scale,
                                name: object.name
                            })
                        })
                    })
                })
            }
        }
        else if (object.children && object.children.length > 0) {
            // 普通分组节点递归
            const group = new THREE.Group()
            group.name = object.name
            group.position.set(
                object.position.x,
                object.position.y,
                object.position.z,

            )
            group.rotation.set(
                object.roation.x,
                object.roation.y,
                object.roation.z,
            )
            parent.add(group)
            object.children.forEach(ele => {
                this.handleLoadUrl(ele, group)
            })
        }
    }
}
export const useRender = () => {
    return { ProcessFour }
}