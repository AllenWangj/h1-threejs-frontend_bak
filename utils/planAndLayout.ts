import Three from "./threejs";
import * as THREE from 'three';

export enum EnumLayoutCategory {
    EnumLayoutCategory_75 = "75",
    EnumLayoutCategory_150 = "150",
    EnumLayoutCategory_300 = "300",
    EnumLayoutCategory_600 = "600",
}
interface IOptipn {
    enumLayoutCategory: EnumLayoutCategory, //规划布局的类型
    loadSceneCBK: (progress: number) => void,//加载大场景的进度回调
    loadCompleteSceneCBK: () => void //场景加载完成回调
    loadSceneErrorCBK: (err: string) => void //加载场景失败回调
}
class PlanAndLayout extends Three {
    private option: IOptipn //类的可选参数设置
    public isCompleteLoadScene = false //大的场景是否加载完成
    private isLoadAIStart = false//是否开始加载AI数据
    private wrapper: THREE.Group //元素包裹器
    private wrapperName = "__WRAPPER__"
    private defaultGroup: THREE.Object3D | null
    private raycaster: THREE.Raycaster;//发射射线
    private mouse: THREE.Vector2//鼠标坐标
    static DEFINE_SCENE_NAME = "root" //代表默认模型的所在位置
    private currentStartMoveMode:THREE.Object3D | null  = null //代表选中的模型
    private previousMousePosition: THREE.Vector2 = new THREE.Vector2() //记录初始化移动位置
    constructor(node: HTMLElement, option?: IOptipn) {
        super(node)
        this.option = Object.assign({
            enumLayoutCategory: EnumLayoutCategory.EnumLayoutCategory_75,
            loadSceneCBK: (progress) => { },
            loadCompleteSceneCBK: () => { },
            loadSceneErrorCBK: () => { },
        }, option)
        this.initRaycaster()
        this.addEventListeners()
        this.wrapper = new THREE.Group()
        this.wrapper.name = this.wrapperName
        this.scene.add( this.wrapper)
        this.handleLoadDefaultScene()
    }

    private handleInitScene() {
        // 初始化大的场景
        this.loadGLTFResource("/gltf/test/75/landmark.gltf", (progress) => {
            this.option.loadSceneCBK(progress)
        }).then(res => {
            console.log("scene", res)
            this.wrapper.add(res.scene)
            const size = this.calculateGroupDimensions(this.wrapper)
            console.log("size.center", size.center)
            const number = 3000
            this.camera!.position.set(size.center.x, size.center.y, size.center.z + number)
            this.controls.target.set(size.center.x, size.center.y, size.center.z)
            this.isCompleteLoadScene = true
            this.option.loadCompleteSceneCBK()
        }, (err) => {
            this.option.loadSceneErrorCBK(err)
        })
    }
    private initRaycaster(): void {
        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = 10000; // 根据场景大小调整
        this.raycaster.ray.direction.normalize();
        this.mouse = new THREE.Vector2();
    }
    private handleLoadDefaultScene() {
        this.isLoadAIStart = false
        const sceneGLTF = {
            [EnumLayoutCategory.EnumLayoutCategory_75]: "/75-test/75-test.skp.gltf"
        }
        this.loadGLTFResource(`/gltf/${sceneGLTF[this.option.enumLayoutCategory]}`, (progress) => {
            this.option.loadSceneCBK(progress)
        }).then(res => {
            const root = res.scene.getObjectByName(PlanAndLayout.DEFINE_SCENE_NAME)
            this.defaultGroup = this.wrapper
            this.wrapper.add(...root.children)
            const size = this.calculateGroupDimensions(this.wrapper)
         
            // - number
            const number = 3000
            this.camera!.position.set(size.center.x, size.center.y-number , size.center.z+number )
            this.controls.target.set(size.center.x, size.center.y, size.center.z)
            this.defaultGroup.traverse((object) => {
                // console.log("object.type---",object.type,"名字：",object.name)
                if (object.type === 'Group' && object.name.indexOf("Group_") != -1  ) {
                    // &&"Group_86" !=object.name
                    // 代表是对象
                    object.visible = false
                    // raycaster.push(object)
                }
            })
        })
    }
    public handleAIData() {
        // 开始AI数据
        this.isLoadAIStart = true
        // 清楚默认场景的数据，释放内存
        this.disposeGLTFGroup(this.wrapper)
        this.defaultGroup = null
    }
    get raycasterList() {
        // 获取可以交互的数据
        const raycaster: THREE.Object3D[] = []
        if (!this.isLoadAIStart) {
            // 代表是默认场景的交互数据
            this.defaultGroup.traverse((object) => {
                // console.log("object.type---",object.type,"名字：",object.name)
                if (object.type === 'Group' && object.name.indexOf("Group_") != -1  ) {
                    // &&"Group_86" !=object.name
                    // 代表是对象
                    raycaster.push(object)
                }
            })
        }
        
        return raycaster
    }
    private addEventListeners(): void {
        // 窗口大小变化事件
        //  window.addEventListener('resize', () => this.onWindowResize());

        // 鼠标事件
        this.renderer.domElement.addEventListener('mousedown', (e) => this.handleOnMouseDown(e));
        this.renderer.domElement.addEventListener('mousemove', (e) => this.handleOnMouseMove(e));
        this.renderer.domElement.addEventListener('mouseup', (e) => this.handleOnMouseUp(e));
        // this.renderer.domElement.addEventListener('mouseleave', () => this.onMouseUp());

        // 按钮事件
        //this.addModelBtn.addEventListener('click', () => this.addNewModel());
        //this.rotateModeBtn.addEventListener('click', () => this.setInteractionMode('rotate'));
        //this.dragModeBtn.addEventListener('click', () => this.setInteractionMode('drag'));
    }
    private handleOnMouseDown(event: MouseEvent) {
        // 鼠标按下
        // this.controls.enabled = false
        const dpX = event.clientX;
        const dpY = event.clientY;
        
        // 转换为标准化设备坐标
        const ndc = this.convertDpToNdc(dpX, dpY);
        this.mouse.x = ndc.x;
        this.mouse.y = ndc.y;
        // 更新射线投射器
        this.raycaster.setFromCamera(this.mouse, this.camera);
        // 检查射线与哪些物体相交
        const intersects = this.raycaster.intersectObjects(this.raycasterList,true);
        if (intersects.length > 0) {
            // 代表选中了目标
            const {object}=intersects[0]
            let selectObject =  object
            let stop = false
            
            while(selectObject.name.indexOf("Group") ==-1 || stop) {
                // 代表没有找到目标元素
                selectObject = selectObject.parent
                if(selectObject.name === this.wrapperName) {
                    // 
                    stop = true
                }
            }
            if(stop == true) {
                // 代表是没有找到的
                // todo 提示报错
                return 
            }
            // 代表找到了这个模型，需要移动了
            this.currentStartMoveMode = selectObject
            this.previousMousePosition.copy(this.mouse);
            this.controls.enabled = false
        }
    }
    private handleOnMouseUp(event: MouseEvent) {
        this.handleOnMouseMove(event)
        this.currentStartMoveMode = null
    }
    private handleOnMouseMove(event: MouseEvent) {
        // 代表需要移动了
        if(!this.currentStartMoveMode) {
            return
        }
        const dpX = event.clientX;
        const dpY = event.clientY;
        const ndc = this.convertDpToNdc(dpX, dpY);
        // this.mouse.x = ndc.x;
        // this.mouse.y = ndc.y;
       const mouseX =  ndc.x;
       const mouseY = ndc.y;
        const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
        vector.unproject(this.camera);
        // console.log("vector---",vector.clone())

        const dir = vector.sub(this.camera.position).normalize();
        const distance = -this.camera.position.z / dir.z;
        const pos = this.camera.position.clone().add(dir.multiplyScalar(distance));
        console.log("vecthis.currentStartMoveMode.positiontor---",pos.y )
        console.log("this.currentStartMoveMode.position.y--",this.currentStartMoveMode.position.y)

        this.currentStartMoveMode.position.x += (pos.x -  this.currentStartMoveMode.position.x) * 0.1;
        this.currentStartMoveMode.position.y += (pos.y -  this.currentStartMoveMode.position.y) * 0.1;
    }
   private convertDpToNdc(dpX:number, dpY:number) {
        // 获取渲染器元素的边界矩形
        const rect = this.renderer.domElement.getBoundingClientRect();
        // 计算相对于渲染器的dp坐标
        const relativeX = dpX - rect.left;
        const relativeY = dpY - rect.top;
        // 转换为0-1范围的坐标
        const normalizedX = relativeX / rect.width;
        const normalizedY = relativeY / rect.height;
        
        // 转换为Three.js的标准化设备坐标(-1到1)
        return {
            x:  normalizedX * 2 - 1,
            y: -(normalizedY * 2 - 1)
        };
    }

}
export default PlanAndLayout