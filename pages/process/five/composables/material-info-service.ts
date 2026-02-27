export const materialInfoService = (): any[] => {
    // 返回流程5的物料分组清单（用于表格展示与统计）
    // 窗
    const windowData = [
        {
            no: 'LT1',
            spec: 'W01',
            length: 1290,
            quantity: 23,
            material: 'Q235B',
            weight: 52.052
        }
    ]
    // 门
    const doorData = [
        {
            no: 'LT1',
            spec: 'D01',
            length: 2000,
            quantity: 19,
            material: 'Q235B',
            weight: 52.052
        }
    ]
    // 屋面板
    const housePanelData = [
        {
            no: 'LT1',
            spec: 'F03',
            length: 2900,
            quantity: 187,
            material: 'Q235B',
            weight: 52.052
        }
    ]

    // 屋顶
    const roofPanelData = [
        {
            no: 'LT1',
            spec: 'P02',
            length: 2900,
            quantity: 20,
            material: 'Q235B',
            weight: 52.052
        }
    ]

    // 墙
    const wallData = [
        {
            no: 'LT1',
            spec: 'Q02',
            length: 2900,
            quantity: 48,
            material: 'Q235B',
            weight: 52.052
        },
        {
            no: '屋架',
            spec: 'Q03',
            length: 6000,
            quantity: 10,
            material: 'Q235B',
            weight: null
        },
        {
            no: 'QL1',
            spec: 'Q04',
            length: 2600,
            quantity: 14,
            material: 'Q235B',
            weight: 30.4
        },
        {
            no: 'QL2',
            spec: 'Q07',
            length:1600,
            quantity: 144,
            material: 'Q235B',
            weight: 90.4
        },
        {
            no: 'QL3',
            spec: 'Q08',
            length: 1800,
            quantity: 36,
            material: 'Q235B',
            weight: 62.4
        },{
            no: 'QL4',
            spec: 'Q09',
            length: 2000,
            quantity: 18,
            material: 'Q235B',
            weight: 42.4
        },
    ]
    // 地板
    const groundData = [
        {
            no: 'LT1',
            spec: 'F01',
            length: 2900,
            quantity: 20,
            material: 'Q235B',
            weight: 52.052
        },
    ]
    // 顶底板
    const floorData = [
        {
            no: 'LT1',
            spec: 'T01',
            length: 2900,
            quantity: 10,
            material: 'Q235B',
            weight: 52.052
        },
         {
            no: 'LT2',
            spec: 'T02',
            length: 180,
            quantity: 17,
            material: 'Q235B',
            weight: 52.052
        },
    ]
    // 柱
    const columnData = [
        {
            no: 'GKZ1',
            spec: 'M01',
            length: 5800,
            quantity: 48,
            material: 'Q235B',
            weight: 76.2
        },
        {
            no: 'GZ1短',
            spec: 'M02',
            length: 4500,
            quantity: 48,
            material: 'Q235B',
            weight: 55.24
        },
    ]
    // 梁
    const beamData = [
        {
            no: 'GKL1长',
            spec: 'B01',
            length: 5800,
            quantity: 48,
            material: 'Q235B',
            weight: 107.822
        },
        {
            no: 'GKL1短',
            spec: 'B03',
            length: 2800,
            quantity: 95,
            material: 'Q235B',
            weight: 52.052
        },
        {
            no: 'GKL2',
            spec: 'B05',
            length: 2800,
            quantity: 18,
            material: 'Q235B',
            weight: 56.77
        },
        {
            no: 'GKL3',
            spec: 'B06',
            length: 2800,
            quantity: 20,
            material: 'Q235B',
            weight: 56.77
        }
    ]
    // 连接器
    const connectorData = [
        {
            no: 'LT1',
            spec: 'L01',
            length: 40,
            quantity: 560,
            material: 'Q235B',
            weight: 52.02
        }
    ]


    // 统一返回结构：name(分类名) + value(分类编码) + infoList(明细)
    return [{
        name: '窗',
        value: 1,
        infoList: windowData,
        state:true
    },
    {
        name: '门',
        value: 2,
        infoList: doorData,
        state:true
    },
    {
        name: '屋面板',
        value: 3,
        infoList: housePanelData,
        state:true
    },
    {
        name: '屋顶',
        value: 4,
        infoList: roofPanelData,
        state:true
    },
    {
        name: '墙',
        value: 5,
        infoList: wallData,
        state:true
    },
    {
        name: '地板',
        value: 6,
        infoList: groundData,
        state:true
    },
    {
        name: '顶底板',
        value: 7,
        infoList: floorData,
        state:true
    },
    {
        name: '柱',
        value: 8,
        infoList: columnData,
        state:true
    },
    {
        name: '梁',
        value: 9,
        infoList: beamData,
        state:true
    },
    {
        name: '连接器',
        value: 10,
        infoList: connectorData,
        state:true
    }]
}