import Three from "../threejs"
import * as THREE from 'three';

class LibaryModal extends Three {
    private wrapper = new THREE.Group()
    constructor(node: HTMLElement, public opt: {
        progress: (progress: number) => void
    }) {
        super(node, {

        })
        this.scene.add(this.wrapper)
    }
    public handleLoadModelByUrl(url: string, cbk: (a: {
        len: number
        width: number
        height: number
    }) => void) {
        return new Promise((resolve, reject) => {
            this.loadGLTFResource(url, (progress) => {
                this.opt.progress(progress)
            }).then(res => {
                this.wrapper.add(res.scene)
                const size = this.calculateGroupDimensions(this.wrapper)
                const number = size.maxDim
                this.camera!.position.set(size.center.x, size.center.y - number, size.center.z + number)
                this.controls.target.set(size.center.x, size.center.y, size.center.z)
                cbk&&cbk({
                    len:size.depth,
                    width:size.width,
                    height:size.height
                })
                resolve(true)
            }, (err) => {
                reject(err)
            })
        })

    }
    public handleDestoryResource() {
        const children = this.wrapper.children[0] as THREE.Group
        children.traverse(object => {
            if (object instanceof THREE.Mesh) {
                // 处理几何体
                if (object.geometry) {
                    object.geometry.dispose();
                    object.material.dispose()
                }
            }
        })
        children.parent.remove(children)
        this.wrapper.parent.remove(this.wrapper)
    }
}
export default LibaryModal