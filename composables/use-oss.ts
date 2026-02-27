import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { createOssRecord, getOssAuth } from '~/apis/resource'

export const useOss = () => {
  /** OSS 配置缓存，包含访问凭证和过期时间 */
  const ossConfig = useState('oss-config', () => ({
    expired: Date.now(), // token 过期时间戳（毫秒）
    config: {
      endpoint: '', // OSS 服务端点
      bucket: '', // 存储桶名称
      region: 'us-east-1',
      credentials: {
        accessKeyId: '', // 访问密钥ID
        secretAccessKey: '', // 访问密钥
        sessionToken: '' // 会话 token（临时凭证）
      },
      forcePathStyle: true
    }
  }))
  /**
   * 获取上传凭证
   * @description 智能 token 管理：
   * 1. 检查 token 是否过期（预留 100秒 buffer）
   * 2. 未过期且存在时直接返回缓存，避免重复请求
   * 3. 过期时重新请求并更新缓存
   */
  const getOssToken = async () => {
    try {
      const { expired, config } = ossConfig.value
      // 关键逻辑：token 未过期且存在时，直接返回缓存，不重复获取
      if (expired > Date.now() && config.credentials.sessionToken) {
        return ossConfig.value
      }
      
      // token 过期或不存在时，重新获取
      const { data } = await getOssAuth()
      ossConfig.value.config.endpoint = data.endpoint
      ossConfig.value.config.bucket = data.bucket
      ossConfig.value.config.credentials = {
        accessKeyId: data.accessKeyId,
        secretAccessKey: data.secretAccessKey,
        sessionToken: data.sessionToken
      }
      // 设置过期时间：3500秒（预留 100秒 buffer，避免在使用过程中过期）
      ossConfig.value.expired = Date.now() + 3500 * 1000
      return ossConfig.value
    } catch (error) {
      console.log(error)
    }
  }
  /**
   * 获取时间字符串
   */
  const getDateStr = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const monthStr = month >= 10 ? month : `0${month}`
    const day = now.getDate()
    const dayStr = day >= 10 ? day : `0${day}`
    return `${year}${monthStr}${dayStr}`
  }
  /**
   * 生成随机字符串
   */
  const guid = () => {
    return 'xxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
      const r = (Math.random() * 16) | 0
      return r.toString(16)
    })
  }
  /**
   * 获取上传key
   */
  const getFilePath = (fileName = '') => {
    const timeStr = getDateStr()
    const randomStr = guid()
    const extStr = fileName.substring(fileName.lastIndexOf('.'))
    return `uploads/${timeStr}/${randomStr}${extStr.toLowerCase()}`
  }
  /**
   * 单文件上传
   * @param file 要上传的文件对象
   * @description 完整上传流程：
   * 1. 获取 OSS 上传凭证
   * 2. 创建 S3 客户端
   * 3. 将文件转换为 ArrayBuffer
   * 4. 生成唯一的存储路径
   * 5. 上传到 OSS
   * 6. 创建数据库记录
   */
  const putFile = async (file: File) => {
    try {
      // 第一步：确保 OSS 凭证有效
      await getOssToken()
      const { config } = ossConfig.value
      // 第二步：创建 S3 客户端
      const s3Client = new S3Client(config)
      // 第三步：读取文件二进制数据
      const fileArrayBuffer = await file.arrayBuffer()
      // 第四步：生成唯一的存储路径（格式：uploads/YYYYMMDD/随机字符串.扩展名）
      const key = getFilePath(file.name)
      // 第五步：创建上传命令
      const command = new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: new Uint8Array(fileArrayBuffer),
        ContentType: file.type
      })
      // 第六步：执行上传
      const s3Result = await s3Client.send(command)
      // 第七步：构造完整的文件访问 URL
      const url = `${config.endpoint}/${config.bucket}/${key}`
      const params = {
        name: file.name,
        url,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        timestamp: Date.now(),
        hash: s3Result.ETag.replaceAll('\"', '') // ETag 作为文件唯一标识
      }
      // 第八步：创建数据库记录，保存文件元数据
      return createOssRecord(params)
    } catch (error) {
      console.error(error)
    }
  }
  return {
    putFile
  }
}
