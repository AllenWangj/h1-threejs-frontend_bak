export interface IBody<T> {
    current: number
    pages: number
    records: T[]
    size: number
    total: number
}
export interface IRecord {
    createBy:string
    createTime:string
    height:string
    id:string
    length:string
    name:string
    url:string
    width:string

}