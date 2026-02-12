/**
 * serialService.js - 串口通信服务层（单例模式）
 * 
 * 职责：
 * - 单例管理串口连接
 * - 事件订阅/分发
 * - 帧解析（拆包/粘包处理）+ CRC 校验
 * - 轮询定时器管理
 * 
 * 支持的帧类型：
 * - A9 上行帧（设备→App）：96字节，包类型 0x09
 * - D180 下行帧（App→设备）：9字节，包类型 0xB4
 * 
 * CRC 算法（特殊口径）：
 * - 范围：CRC 字段之前的所有字节
 * - 预处理：补0到4的倍数 + 每4字节分组倒序
 * - 算法：CRC-32 非反射(MSB-first), Poly=0x04C11DB7, Init=0xFFFFFFFF, xorOut=0
 * - 取值：低16位，大端存储
 * 
 * 调用关系：
 * Vue 页面 --> serialService.js --> UTS 插件 (wzl-serialbridge) --> AAR --> 硬件
 */

import { 
  openSerial, 
  writeSerial, 
  readSerial, 
  closeSerial,
  listDevices,
  getVersion
} from '@/uni_modules/wzl-serialbridge'

// ============================================================================
// 单例状态
// ============================================================================

let portId = 0
let isConnected = false
let readTimer = null
let uiRefreshTimer = null
let rxBuffer = ''  // 接收缓冲区，用于帧拼接

// 连接配置（记录当前连接参数，便于重连）
let currentConfig = {
  path: '/dev/ttyS3',
  baudRate: 115200,
  dataBits: 8,
  stopBits: 1,
  parity: 'none'
}

// 事件监听器
const listeners = {
  frame: [],      // 收到完整帧（已解析）
  raw: [],        // 收到原始数据（调试用）
  connect: [],    // 连接成功
  disconnect: [], // 断开连接
  error: []       // 错误
}

// ============================================================================
// 配置常量
// ============================================================================

const FRAME_HEAD = 0x73       // 帧头 's'
const FRAME_TAIL = 0x65       // 帧尾 'e'

// A9 上行帧（设备→App）
const A9_FRAME_LENGTH = 96    // 帧长度(字节)
const A9_FRAME_HEX_LENGTH = 192  // HEX 字符串长度
const A9_PACK_TYPE = 0x09     // 包类型
const A9_CRC_OFFSET = 93      // CRC 字段偏移 [93..94]

// D180 下行帧（App→设备）
const D180_FRAME_LENGTH = 9   // 帧长度(字节)
const D180_FRAME_HEX_LENGTH = 18  // HEX 字符串长度
const D180_PACK_TYPE = 0xB4   // 包类型 (180)
const D180_CRC_OFFSET = 6     // CRC 字段偏移 [6..7]

// 力量模式枚举
const FORCE_MODE = {
  OFF: 0,        // 关闭
  CONST: 1,      // 恒力
  ECC_ISO: 2,    // 离心等张
  CONC_ISO: 3,   // 向心等张
  ELASTIC: 4,    // 弹力绳
  FLUID: 5,      // 流体阻力
  BALANCE: 6,    // 平衡
  ROPE_B1: 7     // 绳索B1
}

const READ_INTERVAL = 50      // 轮询间隔(ms)
const READ_TIMEOUT = 30       // 读取超时(ms)
const READ_LENGTH = 96        // 单次读取字节数

// ============================================================================
// CRC 工具函数（移植自 PacketCrc.java）
// ============================================================================

/**
 * HEX 字符串转字节数组
 * @param {string} hex - HEX 字符串（如 "73B4000A01002AF365"）
 * @returns {Uint8Array} 字节数组
 */
function hexToBytes(hex) {
  const len = hex.length / 2
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return bytes
}

/**
 * 字节数组转 HEX 字符串
 * @param {Uint8Array} bytes - 字节数组
 * @returns {string} 大写 HEX 字符串
 */
function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join('')
}

/**
 * 预处理：补0到4的倍数 + 每4字节分组倒序
 * @param {Uint8Array} src - 原始数据
 * @returns {Uint8Array} 预处理后的数据
 */
function preprocessPadZeroReverse4(src) {
  const len = src.length
  const padded = (len + 3) & ~3  // 向上取整到4的倍数
  const out = new Uint8Array(padded)
  out.set(src)  // 复制原数据，剩余自动为0
  
  // 每4字节倒序
  for (let i = 0; i < padded; i += 4) {
    const t0 = out[i], t1 = out[i + 1]
    out[i] = out[i + 3]
    out[i + 1] = out[i + 2]
    out[i + 2] = t1
    out[i + 3] = t0
  }
  return out
}

/**
 * CRC-32 非反射(MSB-first)，Init=0xFFFFFFFF，xorOut=0
 * @param {Uint8Array} data - 预处理后的数据
 * @returns {number} 32位 CRC 值
 */
function crc32NonRefNoXor(data) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < data.length; i++) {
    crc ^= (data[i] << 24)
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x80000000) !== 0) {
        crc = ((crc << 1) ^ 0x04C11DB7) >>> 0  // >>> 0 确保无符号
      } else {
        crc = (crc << 1) >>> 0
      }
    }
  }
  return crc >>> 0
}

/**
 * 计算 CRC16（固定口径）
 * 对 [0 .. crcOffset-1] 的数据进行预处理后计算 CRC32，取低16位
 * @param {Uint8Array} pkt - 完整报文
 * @param {number} crcOffset - CRC 字段起始偏移
 * @returns {number} 16位 CRC 值
 */
function computeCrc16Fixed(pkt, crcOffset) {
  // 取 CRC 之前的数据
  const data = pkt.slice(0, crcOffset)
  // 预处理
  const pre = preprocessPadZeroReverse4(data)
  // 计算 CRC32 并取低16位
  const crc32 = crc32NonRefNoXor(pre)
  return crc32 & 0xFFFF
}

/**
 * 从报文中读取大端(BE) 16位 CRC
 * @param {Uint8Array} pkt - 报文
 * @param {number} crcOffset - CRC 字段偏移
 * @returns {number} 16位 CRC 值
 */
function readCrcBE(pkt, crcOffset) {
  return ((pkt[crcOffset] & 0xFF) << 8) | (pkt[crcOffset + 1] & 0xFF)
}

/**
 * 向报文写入大端(BE) 16位 CRC
 * @param {Uint8Array} pkt - 报文
 * @param {number} crcOffset - CRC 字段偏移
 * @param {number} crc16 - 16位 CRC 值
 */
function writeCrcBE(pkt, crcOffset, crc16) {
  pkt[crcOffset] = (crc16 >>> 8) & 0xFF
  pkt[crcOffset + 1] = crc16 & 0xFF
}

/**
 * 校验报文 CRC
 * @param {Uint8Array} pkt - 完整报文
 * @param {number} crcOffset - CRC 字段偏移
 * @returns {object} { valid, expected, actual }
 */
function verifyCrc(pkt, crcOffset) {
  const expected = readCrcBE(pkt, crcOffset)
  const actual = computeCrc16Fixed(pkt, crcOffset)
  return {
    valid: expected === actual,
    expected,
    actual
  }
}

// ============================================================================
// 事件订阅机制
// ============================================================================

/**
 * 订阅事件
 * @param {string} event - 事件类型: 'frame' | 'raw' | 'connect' | 'disconnect' | 'error'
 * @param {function} callback - 回调函数
 */
export function on(event, callback) {
  if (listeners[event] && typeof callback === 'function') {
    listeners[event].push(callback)
  }
}

/**
 * 取消订阅
 * @param {string} event - 事件类型
 * @param {function} callback - 要取消的回调函数
 */
export function off(event, callback) {
  if (listeners[event]) {
    const index = listeners[event].indexOf(callback)
    if (index > -1) {
      listeners[event].splice(index, 1)
    }
  }
}

/**
 * 触发事件（内部使用）
 */
function emit(event, data) {
  if (listeners[event]) {
    listeners[event].forEach(cb => {
      try {
        cb(data)
      } catch (e) {
        console.error(`[serialService] 事件回调执行错误 (${event}):`, e)
      }
    })
  }
}

// ============================================================================
// 连接管理
// ============================================================================

/**
 * 连接串口
 * @param {object} options - 连接选项
 * @param {string} options.path - 设备路径，默认 '/dev/ttyS3'
 * @param {number} options.baudRate - 波特率，默认 115200
 * @param {number} options.dataBits - 数据位，默认 8
 * @param {number} options.stopBits - 停止位，默认 1
 * @param {string} options.parity - 校验位，默认 'none'
 * @returns {Promise}
 */
export function connect(options = {}) {
  return new Promise((resolve, reject) => {
    // 合并配置
    currentConfig = {
      path: options.path || currentConfig.path,
      baudRate: options.baudRate || currentConfig.baudRate,
      dataBits: options.dataBits || currentConfig.dataBits,
      stopBits: options.stopBits || currentConfig.stopBits,
      parity: options.parity || currentConfig.parity
    }

    // 已连接则直接返回
    if (isConnected && portId > 0) {
      console.log('[serialService] 已连接，复用现有连接')
      resolve({ portId, message: '已连接' })
      return
    }

    console.log('[serialService] 正在连接...', currentConfig)

    openSerial({
      path: currentConfig.path,
      config: {
        baudRate: currentConfig.baudRate,
        dataBits: currentConfig.dataBits,
        stopBits: currentConfig.stopBits,
        parity: currentConfig.parity
      },
      success: (res) => {
        portId = res.portId
        isConnected = true
        rxBuffer = ''  // 清空缓冲区
        
        console.log('[serialService] 连接成功, portId:', portId)
        
        // 注意：不在连接时自动启动轮询
        // 轮询由业务层通过 startWorking() 控制
        
        emit('connect', { 
          portId, 
          path: currentConfig.path,
          config: currentConfig 
        })
        
        resolve(res)
      },
      fail: (err) => {
        console.error('[serialService] 连接失败:', err)
        emit('error', { type: 'connect', ...err })
        reject(err)
      }
    })
  })
}

/**
 * 断开串口连接
 * @returns {Promise}
 */
export function disconnect() {
  return new Promise((resolve, reject) => {
    if (!isConnected || portId === 0) {
      console.log('[serialService] 未连接，无需断开')
      resolve({ message: '未连接' })
      return
    }

    console.log('[serialService] 正在断开连接...')
    
    // 先停止轮询
    stopPolling()

    closeSerial({
      portId,
      success: (res) => {
        const oldPortId = portId
        isConnected = false
        portId = 0
        rxBuffer = ''
        
        console.log('[serialService] 已断开连接')
        
        emit('disconnect', { portId: oldPortId })
        resolve(res)
      },
      fail: (err) => {
        console.error('[serialService] 断开失败:', err)
        emit('error', { type: 'disconnect', ...err })
        reject(err)
      }
    })
  })
}

// ============================================================================
// 数据发送
// ============================================================================

/**
 * 发送数据
 * @param {string} data - 要发送的数据（HEX 字符串）
 * @param {object} options - 可选配置
 * @param {string} options.format - 数据格式，默认 'hex'
 * @param {number} options.timeout - 超时时间，默认 1000ms
 * @returns {Promise}
 */
export function send(data, options = {}) {
  return new Promise((resolve, reject) => {
    if (!isConnected || portId === 0) {
      const err = { errCode: 10005, errMsg: '串口未连接' }
      emit('error', { type: 'send', ...err })
      reject(err)
      return
    }

    const format = options.format || 'hex'
    const timeout = options.timeout || 1000

    writeSerial({
      portId,
      data,
      format,
      timeout,
      success: (res) => {
        resolve(res)
      },
      fail: (err) => {
        console.error('[serialService] 发送失败:', err)
        emit('error', { type: 'send', ...err })
        reject(err)
      }
    })
  })
}

/**
 * 发送命令的便捷方法（自动构建帧格式）
 * @param {string} cmdData - 命令数据部分（不含帧头帧尾）
 * @returns {Promise}
 */
export function sendCommand(cmdData) {
  // 如果需要自动添加帧头帧尾，在这里处理
  // 当前直接发送原始数据
  return send(cmdData)
}

// ============================================================================
// 数据接收（内部轮询）
// ============================================================================

/**
 * 启动轮询（内部使用）
 */
function startPolling() {
  stopPolling()
  
  console.log('[serialService] 启动轮询, 间隔:', READ_INTERVAL, 'ms')
  
  readTimer = setInterval(() => {
    if (!isConnected || portId === 0) {
      stopPolling()
      return
    }
    
    readSerial({
      portId,
      length: READ_LENGTH,
      format: 'hex',
      timeout: READ_TIMEOUT,
      success: (res) => {
        if (res.bytesRead > 0) {
          // 触发原始数据事件（调试用）
          emit('raw', {
            data: res.data,
            bytes: res.bytesRead,
            ts: Date.now()
          })
          
          // 帧解析
          handleReceivedData(res.data)
        }
      },
      fail: (err) => {
        // 如果是主动断开导致的错误，忽略（竞态条件：readSerial 请求在 closeSerial 之后返回）
        if (!isConnected) {
          return
        }
        // 超时（10003）忽略，其他错误上报
        if (err.errCode !== 10003) {
          console.error('[serialService] 读取失败:', err)
          emit('error', { type: 'read', ...err })
        }
      }
    })
  }, READ_INTERVAL)
}

/**
 * 停止轮询（内部使用）
 */
function stopPolling() {
  if (readTimer) {
    clearInterval(readTimer)
    readTimer = null
    console.log('[serialService] 轮询已停止')
  }
}

// ============================================================================
// 帧解析
// ============================================================================

/**
 * 处理接收到的数据（内部使用）
 * 实现帧头(0x73)和帧尾(0x65)的解析，处理拆包和粘包
 * @param {string} hexData - 接收到的 HEX 字符串
 */
function handleReceivedData(hexData) {
  // 追加到缓冲区
  rxBuffer += hexData.toUpperCase()
  
  // 循环提取完整帧
  let loopCount = 0
  const maxLoop = 10  // 防止死循环
  
  while (loopCount < maxLoop) {
    loopCount++
    
    // 查找帧头 0x73
    const headIndex = rxBuffer.indexOf('73')
    
    if (headIndex === -1) {
      // 没有帧头，清空缓冲区
      rxBuffer = ''
      break
    }
    
    // 丢弃帧头之前的无效数据
    if (headIndex > 0) {
      console.log('[serialService] 丢弃无效数据:', rxBuffer.substring(0, headIndex))
      rxBuffer = rxBuffer.substring(headIndex)
    }
    
    // 至少需要2字节才能判断包类型
    if (rxBuffer.length < 4) {
      break
    }
    
    // 读取包类型 [1]
    const packType = parseInt(rxBuffer.substring(2, 4), 16)
    
    // 根据包类型确定帧长度
    let frameHexLength, crcOffset
    if (packType === A9_PACK_TYPE) {
      frameHexLength = A9_FRAME_HEX_LENGTH
      crcOffset = A9_CRC_OFFSET
    } else if (packType === D180_PACK_TYPE) {
      frameHexLength = D180_FRAME_HEX_LENGTH
      crcOffset = D180_CRC_OFFSET
    } else {
      // 未知包类型，跳过这个帧头，继续查找
      console.warn('[serialService] 未知包类型:', packType.toString(16))
      rxBuffer = rxBuffer.substring(2)
      continue
    }
    
    // 检查是否有足够的数据构成完整帧
    if (rxBuffer.length < frameHexLength) {
      break
    }
    
    // 提取一帧
    const frameHex = rxBuffer.substring(0, frameHexLength)
    const frameBytes = hexToBytes(frameHex)
    
    // 验证帧尾
    const tailByte = frameBytes[frameBytes.length - 1]
    if (tailByte !== FRAME_TAIL) {
      console.warn('[serialService] 帧尾校验失败:', tailByte.toString(16), '期望: 65')
      rxBuffer = rxBuffer.substring(2)
      continue
    }
    
    // CRC 校验
    const crcResult = verifyCrc(frameBytes, crcOffset)
    
    if (!crcResult.valid) {
      console.warn('[serialService] CRC 校验失败:',
        '期望', crcResult.expected.toString(16).toUpperCase(),
        '实际', crcResult.actual.toString(16).toUpperCase())
    }
    
    // 解析帧内容
    let parsedFrame
    if (packType === A9_PACK_TYPE) {
      parsedFrame = parseA9Frame(frameBytes, crcResult)
    } else {
      parsedFrame = parseD180Frame(frameBytes, crcResult)
    }
    
    emit('frame', {
      raw: frameHex,
      parsed: parsedFrame,
      bytes: frameBytes.length,
      crcValid: crcResult.valid,
      ts: Date.now()
    })
    
    // 移除已处理的数据
    rxBuffer = rxBuffer.substring(frameHexLength)
  }
}

/**
 * 解析 A9 上行帧（设备→App，96字节）
 * @param {Uint8Array} bytes - 帧字节数组
 * @param {object} crcResult - CRC 校验结果
 * @returns {object} 解析后的帧数据
 */
function parseA9Frame(bytes, crcResult) {
  return {
    type: 'A9',
    header: bytes[0],
    packType: bytes[1],
    index: bytes[2],
    
    // 左手数据
    left: {
      distance: readInt16BE(bytes, 3),      // [3..4] mm
      speed: readInt16BE(bytes, 5),         // [5..6] mm/s
      count: readUint32BE(bytes, 7),        // [7..10]
      power: readInt16BE(bytes, 11),        // [11..12] W
      instantForce: readUint16BE(bytes, 13) / 10  // [13..14] kg (原值0.1kg)
    },
    
    // 右手数据
    right: {
      distance: readInt16BE(bytes, 15),     // [15..16] mm
      speed: readInt16BE(bytes, 17),        // [17..18] mm/s
      count: readUint32BE(bytes, 19),       // [19..22]
      power: readInt16BE(bytes, 23),        // [23..24] W
      instantForce: readUint16BE(bytes, 25) / 10  // [25..26] kg
    },
    
    // 设定反馈
    setForce: bytes[27],                    // [27] kg
    setForceMode: bytes[28],                // [28] 模式
    setForceModeText: getForceModeText(bytes[28]),
    bothHandsPower: readUint16BE(bytes, 29), // [29..30] W
    
    // 运动汇总
    calories: readFloat32BE(bytes, 31),     // [31..34]
    sportTime: readUint32BE(bytes, 35),     // [35..38] 秒
    sportCount: readUint32BE(bytes, 39),    // [39..42]
    
    // LOG
    log: {
      count: bytes[43],
      level: bytes[44],
      event: bytes[45],
      i0: readInt32BE(bytes, 46),           // [46..49]
      f0: readFloat32BE(bytes, 50),         // [50..53]
      f1: readFloat32BE(bytes, 54)          // [54..57]
    },
    
    // 温度（原始值 - 55 = 摄氏度）
    temperature: {
      m0Mos: bytes[58] - 55,                // [58]
      m1Mos: bytes[59] - 55,                // [59]
      m0Motor: bytes[60] - 55,              // [60]
      m1Motor: bytes[61] - 55               // [61]
    },
    
    // 其它状态
    busVoltage: readUint16BE(bytes, 62),    // [62..63]
    remoteCmd: [bytes[64], bytes[65], bytes[66]], // [64..66]
    delay: {
      d2c: bytes[67],                       // [67]
      c2d: bytes[68],                       // [68]
      a2c: bytes[69]                        // [69]
    },
    driverStatus: bytes[70],                // [70]
    sleepState: bytes[71],                  // [71] 0=未休眠, 1=休眠
    
    // CRC
    crc: {
      field: crcResult.expected,
      calc: crcResult.actual,
      valid: crcResult.valid
    },
    
    tail: bytes[95]
  }
}

/**
 * 解析 D180 下行帧（App→设备，9字节）
 * @param {Uint8Array} bytes - 帧字节数组
 * @param {object} crcResult - CRC 校验结果
 * @returns {object} 解析后的帧数据
 */
function parseD180Frame(bytes, crcResult) {
  return {
    type: 'D180',
    header: bytes[0],
    packType: bytes[1],
    index: bytes[2],
    force: bytes[3],
    forceMode: bytes[4],
    forceModeText: getForceModeText(bytes[4]),
    lock: bytes[5],
    crc: {
      field: crcResult.expected,
      calc: crcResult.actual,
      valid: crcResult.valid
    },
    tail: bytes[8]
  }
}

// ============================================================================
// 字节读取辅助函数（大端序）
// ============================================================================

function readInt16BE(bytes, offset) {
  const val = (bytes[offset] << 8) | bytes[offset + 1]
  return val > 0x7FFF ? val - 0x10000 : val  // 有符号
}

function readUint16BE(bytes, offset) {
  return (bytes[offset] << 8) | bytes[offset + 1]
}

function readInt32BE(bytes, offset) {
  const val = (bytes[offset] << 24) | (bytes[offset + 1] << 16) |
              (bytes[offset + 2] << 8) | bytes[offset + 3]
  return val | 0  // 转为有符号32位
}

function readUint32BE(bytes, offset) {
  return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) |
          (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0
}

function readFloat32BE(bytes, offset) {
  const buffer = new ArrayBuffer(4)
  const view = new DataView(buffer)
  view.setUint8(0, bytes[offset])
  view.setUint8(1, bytes[offset + 1])
  view.setUint8(2, bytes[offset + 2])
  view.setUint8(3, bytes[offset + 3])
  return view.getFloat32(0, false)  // false = big-endian
}

function getForceModeText(mode) {
  const texts = ['关闭', '恒力', '离心等张', '向心等张', '弹力绳', '流体阻力', '平衡', '绳索B1']
  return texts[mode] || `未知(${mode})`
}

// ============================================================================
// D180 帧构建器
// ============================================================================

let d180Seq = 0  // 自动序号

/**
 * 构建 D180 下行帧
 * @param {object} options - 帧参数
 * @param {number} options.index - 序号 (-1 自动递增, 0-255 手动指定)
 * @param {number} options.force - 力量值 (0-255 kg)
 * @param {number} options.forceMode - 力量模式 (0-7)
 * @param {number} options.lock - 锁定值 (0-255)
 * @returns {object} { bytes: Uint8Array, hex: string }
 */
function buildD180Frame(options = {}) {
  const index = options.index === undefined || options.index < 0
    ? (d180Seq++ & 0xFF)
    : (options.index & 0xFF)
  const force = (options.force || 0) & 0xFF
  const forceMode = (options.forceMode || 0) & 0x07
  const lock = (options.lock || 0) & 0xFF
  
  const bytes = new Uint8Array(D180_FRAME_LENGTH)
  bytes[0] = FRAME_HEAD           // header
  bytes[1] = D180_PACK_TYPE       // type 0xB4
  bytes[2] = index
  bytes[3] = force
  bytes[4] = forceMode
  bytes[5] = lock
  
  // 计算并写入 CRC
  const crc16 = computeCrc16Fixed(bytes, D180_CRC_OFFSET)
  writeCrcBE(bytes, D180_CRC_OFFSET, crc16)
  
  bytes[8] = FRAME_TAIL           // tail
  
  return {
    bytes,
    hex: bytesToHex(bytes),
    crc16
  }
}

// ============================================================================
// 状态查询
// ============================================================================

/**
 * 获取当前连接状态
 * @returns {object} 状态信息
 */
export function getStatus() {
  return {
    isConnected,
    portId,
    config: { ...currentConfig }
  }
}

/**
 * 获取插件版本
 * @returns {string} 版本号
 */
export function getPluginVersion() {
  return getVersion()
}

/**
 * 列举可用串口设备
 * @param {array} prefixes - 设备路径前缀
 * @returns {Promise}
 */
export function scanDevices(prefixes = ['/dev/ttyS', '/dev/ttyUSB', '/dev/ttyAMA']) {
  return new Promise((resolve, reject) => {
    listDevices({
      prefixes,
      success: (res) => {
        resolve(res.devices)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

// ============================================================================
// 工作状态控制（发送+读取并行）
// ============================================================================

let sendTimer = null
let workingForce = 0
let workingMode = 0

/**
 * 启动工作状态（周期发送 + 轮询读取）
 * @param {number} force - 力量值 (kg)
 * @param {number} forceMode - 力量模式
 * @param {number} sendInterval - 发送间隔，默认 200ms (5Hz)
 */
export function startWorking(force, forceMode, sendInterval = 200) {
  // 先停止之前的
  stopWorking()
  
  workingForce = force
  workingMode = forceMode
  
  console.log('[serialService] 启动工作状态, force:', force, 'mode:', forceMode, 'interval:', sendInterval)
  
  // 启动发送定时器
  sendTimer = setInterval(() => {
    if (!isConnected || portId === 0) {
      console.warn('[serialService] 发送跳过：未连接')
      return
    }
    
    const frame = buildD180Frame({
      force: workingForce,
      forceMode: workingMode
    })
    
    // 不等待，直接发送
    writeSerial({
      portId,
      data: frame.hex,
      format: 'hex',
      timeout: 100,
      success: () => {},
      fail: (err) => {
        console.error('[serialService] 周期发送失败:', err)
      }
    })
  }, sendInterval)
  
  // 启动轮询读取
  startPolling()
}

/**
 * 停止工作状态
 */
export function stopWorking() {
  if (sendTimer) {
    clearInterval(sendTimer)
    sendTimer = null
    console.log('[serialService] 发送定时器已停止')
  }
  stopPolling()
}

/**
 * 更新工作力量值（不重启定时器）
 * @param {number} force - 新的力量值
 */
export function updateWorkingForce(force) {
  workingForce = force
  console.log('[serialService] 更新工作力量:', force)
}

/**
 * 发送单次命令（用于关闭等场景）
 * @param {number} force - 力量值
 * @param {number} forceMode - 力量模式
 */
export function sendOnce(force, forceMode) {
  if (!isConnected || portId === 0) {
    console.warn('[serialService] 单次发送跳过：未连接')
    return
  }
  
  const frame = buildD180Frame({ force, forceMode })
  
  console.log('[serialService] 单次发送:', { force, forceMode, hex: frame.hex })
  
  writeSerial({
    portId,
    data: frame.hex,
    format: 'hex',
    timeout: 100,
    success: () => {},
    fail: (err) => {
      console.error('[serialService] 单次发送失败:', err)
    }
  })
}

/**
 * 查询是否在工作状态
 */
export function isWorking() {
  return sendTimer !== null
}

// ============================================================================
// 应用生命周期
// ============================================================================

/**
 * 清理资源（应用退出时调用）
 */
export function cleanup() {
  console.log('[serialService] 清理资源...')
  
  stopWorking()  // 停止工作状态（包含 stopPolling）
  
  if (isConnected && portId > 0) {
    closeSerial({
      portId,
      success: () => {
        console.log('[serialService] 串口已关闭')
      },
      fail: (err) => {
        console.error('[serialService] 关闭失败:', err)
      }
    })
    isConnected = false
    portId = 0
  }
  
  rxBuffer = ''
  
  // 清空所有监听器
  Object.keys(listeners).forEach(key => {
    listeners[key] = []
  })
}

// ============================================================================
// 导出默认对象（可选，方便整体导入）
// ============================================================================

export default {
  // 连接管理
  connect,
  disconnect,
  
  // 工作状态控制
  startWorking,
  stopWorking,
  updateWorkingForce,
  sendOnce,
  isWorking,
  
  // 数据传输
  send,
  sendCommand,
  
  // 帧构建
  buildD180Frame,
  
  // 事件订阅
  on,
  off,
  
  // 状态查询
  getStatus,
  getPluginVersion,
  scanDevices,
  
  // 生命周期
  cleanup,
  
  // 常量
  FORCE_MODE
}

// 具名导出
export {
  // 帧构建
  buildD180Frame,
  
  // CRC 工具（调试用）
  computeCrc16Fixed,
  verifyCrc,
  hexToBytes,
  bytesToHex,
  
  // 常量
  FORCE_MODE
}
