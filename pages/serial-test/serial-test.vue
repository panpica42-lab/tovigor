<!--
  ╔═══════════════════════════════════════════════════════════════════════════╗
  ║  ⚠️ TODO: 数据帧解析 (重要!)                                               ║
  ║                                                                           ║
  ║  当前页面仅做串口通信测试，数据接收采用简单轮询方式。                          ║
  ║  正式业务逻辑中必须实现协议帧解析：                                          ║
  ║    - 帧头: 0x73                                                           ║
  ║    - 帧尾: 0x65                                                           ║
  ║    - 需要处理: 拆包、粘包、校验                                             ║
  ║                                                                           ║
  ╚═══════════════════════════════════════════════════════════════════════════╝
-->
<template>
  <view class="container">
    <view class="header">
      <text class="title">串口通信测试</text>
    </view>
    
    <!-- 设备选择 -->
    <view class="section">
      <text class="section-title">1. 设备配置</text>
      <view class="form-item">
        <text class="label">设备路径:</text>
        <input v-model="devicePath" class="input" placeholder="/dev/ttyUSB0" />
      </view>
      <!-- 快捷串口选择按钮 -->
      <view class="quick-port-buttons">
        <text class="label">快捷选择:</text>
        <button 
          v-for="port in quickPorts" 
          :key="port"
          @click="devicePath = port" 
          class="btn btn-small"
          :class="{ 'btn-active': devicePath === port }"
        >{{ port.replace('/dev/tty', '') }}</button>
      </view>
      <view class="form-item">
        <text class="label">波特率:</text>
        <picker :value="baudRateIndex" :range="baudRates" @change="onBaudRateChange">
          <view class="picker">{{ baudRates[baudRateIndex] }}</view>
        </picker>
      </view>
      <button @click="handleListDevices" class="btn btn-secondary">扫描设备</button>
    </view>
    
    <!-- 连接控制 -->
    <view class="section">
      <text class="section-title">2. 连接控制</text>
      <view class="status-bar" :class="{ connected: isConnected }">
        <text class="status-text">状态: {{ isConnected ? '已连接' : '未连接' }}</text>
        <text v-if="isConnected" class="status-info">{{ devicePath }}</text>
      </view>
      <view class="button-group">
        <button @click="handleOpenPort" :disabled="isConnected" class="btn btn-primary">
          打开串口
        </button>
        <button @click="handleClosePort" :disabled="!isConnected" class="btn btn-danger">
          关闭串口
        </button>
      </view>
    </view>
    
    <!-- 数据发送 -->
    <view class="section">
      <text class="section-title">3. 数据发送</text>
      <view class="form-item">
        <text class="label">发送数据 (HEX):</text>
        <textarea v-model="sendData" class="textarea" placeholder="AA5501020304BB" />
      </view>
      <view class="button-group">
        <button @click="handleSendCommand" :disabled="!isConnected" class="btn btn-primary">
          发送
        </button>
        <button @click="sendData = ''" class="btn btn-secondary">清空</button>
      </view>
      <view class="quick-commands">
        <text class="label">快捷命令:</text>
        <button @click="handleSendQuick('73B4000A01002AF365')" class="btn btn-small">恒10</button>
        <button @click="handleSendQuick('73B400050000E1BB65')" class="btn btn-small">力量关闭</button>
        <button 
          @click="toggleStressTest" 
          class="btn btn-small btn-stress" 
          :class="{ 'btn-stress-active': isStressTesting }"
        >压测</button>
        <button 
          @click="toggleStressTest2" 
          class="btn btn-small btn-stress" 
          :class="{ 'btn-stress-active': isStressTesting2 }"
        >压测2 <text v-if="isStressTesting2">({{ stressTest2Remaining }})</text></button>
      </view>
    </view>
    
    <!-- 数据接收 -->
    <view class="section">
      <text class="section-title">4. 数据接收</text>
      <view class="received-header">
        <text>接收到 {{ receivedMessages.length }} 条消息</text>
        <button @click="clearReceived" class="btn btn-small">清空</button>
      </view>
      <scroll-view class="received-list" scroll-y>
        <view 
          v-for="(msg, index) in receivedMessages" 
          :key="index" 
          class="message-item"
        >
          <view class="message-header">
            <text class="message-time">{{ formatTime(msg.ts) }}</text>
            <text class="message-bytes">{{ msg.bytes }} 字节</text>
          </view>
          <text class="message-data">{{ msg.data }}</text>
        </view>
        <view v-if="receivedMessages.length === 0" class="empty-state">
          <text>暂无数据</text>
        </view>
      </scroll-view>
    </view>
    
    <!-- 统计信息 -->
    <view class="section">
      <text class="section-title">5. 统计信息</text>
      <button @click="handleGetStats" class="btn btn-secondary">刷新统计</button>
      <view v-if="stats" class="stats-grid">
        <view class="stat-item">
          <text class="stat-label">发送字节</text>
          <text class="stat-value">{{ stats.bytesTx }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">接收字节</text>
          <text class="stat-value">{{ stats.bytesRx }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">发送帧</text>
          <text class="stat-value">{{ stats.framesTx }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">接收帧</text>
          <text class="stat-value">{{ stats.framesRx }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">队列项</text>
          <text class="stat-value">{{ stats.queue ? stats.queue.items : 0 }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">队列字节</text>
          <text class="stat-value">{{ stats.queue ? stats.queue.bytes : 0 }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// 页面保持具名导入（不要 default）：
import {
  openSerial, 
  writeSerial, 
  readSerial, 
  closeSerial,
  listDevices,
  getVersion
} from '@/uni_modules/wzl-serialbridge'

onMounted(() => {
  console.log('=== 串口测试页面已挂载 ===')
  console.log('=== 插件版本 ===', getVersion())
  uni.showToast({ title: '插件已加载', icon: 'success', duration: 1500 })
})

const devicePath = ref('/dev/ttyS3')
const baudRates = ref([9600, 19200, 38400, 57600, 115200, 230400, 460800])
const baudRateIndex = ref(4) // 默认 115200

// 常用串口快捷列表（方便切换测试）
const quickPorts = ref([
  '/dev/ttyS0',
  '/dev/ttyS1', 
  '/dev/ttyS2',
  '/dev/ttyS3',
  '/dev/ttyS4',
  '/dev/ttyS5',
  '/dev/ttyS9'
])
const isConnected = ref(false)
const sendData = ref('')
const receivedMessages = ref([])
const stats = ref(null)
const maxMessages = 500  // 增大消息缓存，满足压测需求
let currentPortId = 0 // 当前串口句柄 ID

// 批量 UI 更新优化：使用非响应式缓冲区收集数据，定时同步到显示层
let messageBuffer = []  // 非响应式缓冲区
let uiRefreshTimer = null  // UI 刷新定时器
const UI_REFRESH_INTERVAL = 200  // UI 刷新间隔 (ms)，5Hz 足够人眼观察

// 压测相关
const isStressTesting = ref(false)
let stressTestTimer = null

// 压测2相关（固定200条）
const isStressTesting2 = ref(false)
const stressTest2Remaining = ref(0)
let stressTest2Timer = null


onBeforeUnmount(() => {
  // 页面销毁前停止所有定时器和关闭串口
  stopReading()       // 停止轮询（重要！）
  stopStressTest()
  stopStressTest2()
  if (isConnected.value && currentPortId > 0) {
    closeSerial({
      portId: currentPortId,
      success: () => {
        console.log('串口已自动关闭')
      }
    })
  }
})

const handleListDevices = () => {
  listDevices({
    prefixes: ['/dev/ttyS', '/dev/ttyUSB', '/dev/ttyAMA'],
    success: (res) => {
      console.log('找到设备:', res.devices)
      if (res.devices.length === 0) {
        uni.showToast({ 
          title: '未找到设备', 
          icon: 'none' 
        })
        return
      }
      
      // 显示设备列表供选择
      uni.showActionSheet({
        itemList: res.devices,
        success: (actionRes) => {
          devicePath.value = res.devices[actionRes.tapIndex]
          uni.showToast({
            title: `已选择: ${devicePath.value}`,
            icon: 'none'
          })
        }
      })
    },
    fail: (err) => {
      console.error('扫描失败:', err)
      uni.showToast({ 
        title: `扫描失败: ${err.errMsg}`, 
        icon: 'none' 
      })
    }
  })
}

const handleOpenPort = () => {
  if (!devicePath.value) {
    uni.showToast({ 
      title: '请输入设备路径', 
      icon: 'none' 
    })
    return
  }
  
  uni.showLoading({ title: '打开中...' })
  
  openSerial({
    path: devicePath.value,
    config: {
      baudRate: baudRates.value[baudRateIndex.value],
      dataBits: 8,
      stopBits: 1,
      parity: 'none'
    },
    success: (res) => {
      console.log('串口已打开:', res)
      currentPortId = res.portId
      isConnected.value = true
      uni.hideLoading()
      uni.showToast({ 
        title: '串口已打开', 
        icon: 'success' 
      })
      
      // 开始读取数据
      startReading()
    },
    fail: (err) => {
      console.error('打开失败:', err)
      uni.hideLoading()
      uni.showModal({
        title: '打开失败',
        content: `错误码 ${err.errCode}: ${err.errMsg}`,
        showCancel: false
      })
    }
  })
}

const handleClosePort = () => {
  closeSerial({
    portId: currentPortId,
    success: () => {
      console.log('串口已关闭')
      isConnected.value = false
      currentPortId = 0
      stopReading()
      uni.showToast({ 
        title: '串口已关闭', 
        icon: 'success' 
      })
    },
    fail: (err) => {
      console.error('关闭失败:', err)
      uni.showToast({ 
        title: `关闭失败: ${err.errMsg}`, 
        icon: 'none' 
      })
    }
  })
}

// 读取定时器
let readTimer = null

// TODO: ⚠️ 正式业务需实现帧解析！当前简单轮询会导致拆包/粘包，需根据帧头0x73和帧尾0x65进行协议解析
// 
// 轮询参数说明（针对 96 字节/包，115200 波特率）：
//   - 96字节包传输耗时 able 8.3ms
//   - 5Hz压测 = 每200ms发送一次，回传也约200ms一包
//   - 轮询间隔需 < 200ms 避免缓冲区积压
//   - 建议：轮询 50ms，timeout 30ms，可及时读取每个包
const READ_INTERVAL = 50   // 轮询间隔 (ms)
const READ_TIMEOUT = 30    // 读取超时 (ms)

const startReading = () => {
  stopReading() // 先停止之前的定时器
  
  // 启动 UI 刷新定时器（批量同步缓冲区到响应式变量）
  startUiRefresh()
  
  readTimer = setInterval(() => {
    if (!isConnected.value || currentPortId === 0) {
      stopReading()
      return
    }
    
    readSerial({
      portId: currentPortId,
      length: 96,  // 每次读取一个完整包的大小，避免粘包
      format: 'hex',
      timeout: READ_TIMEOUT,
      success: (res) => {
        if (res.bytesRead > 0) {
          // 写入非响应式缓冲区，避免频繁触发 Vue 更新
          messageBuffer.unshift({
            data: res.data,
            bytes: res.bytesRead,
            ts: Date.now()
          })
          
          // 限制缓冲区大小
          if (messageBuffer.length > maxMessages) {
            messageBuffer.pop()
          }
        }
      },
      fail: (err) => {
        // 如果是主动断开导致的错误，忽略（竞态条件）
        if (!isConnected.value) {
          return
        }
        // 超时不提示，其他错误提示
        if (err.errCode !== 10003) {
          console.error('读取失败:', err)
        }
      }
    })
  }, READ_INTERVAL)
}

const stopReading = () => {
  if (readTimer) {
    clearInterval(readTimer)
    readTimer = null
  }
  stopUiRefresh()
}

// UI 刷新定时器：批量同步缓冲区到响应式变量
const startUiRefresh = () => {
  stopUiRefresh()
  uiRefreshTimer = setInterval(() => {
    if (messageBuffer.length > 0) {
      // 一次性同步到响应式变量，只触发一次 Vue 更新
      receivedMessages.value = [...messageBuffer]
    }
  }, UI_REFRESH_INTERVAL)
}

const stopUiRefresh = () => {
  if (uiRefreshTimer) {
    clearInterval(uiRefreshTimer)
    uiRefreshTimer = null
  }
}

const handleSendCommand = () => {
  if (!sendData.value.trim()) {
    uni.showToast({ 
      title: '请输入数据', 
      icon: 'none' 
    })
    return
  }
  
  if (!isConnected.value || currentPortId === 0) {
    uni.showToast({ 
      title: '请先打开串口', 
      icon: 'none' 
    })
    return
  }
  
  // 移除空格和换行
  const data = sendData.value.replace(/\s+/g, '')
  
  // 验证 HEX 格式
  if (!/^[0-9A-Fa-f]*$/.test(data)) {
    uni.showToast({
      title: '数据格式错误，请输入HEX格式',
      icon: 'none'
    })
    return
  }
  
  if (data.length % 2 !== 0) {
    uni.showToast({
      title: 'HEX字符串长度必须为偶数',
      icon: 'none'
    })
    return
  }
  
  writeSerial({
    portId: currentPortId,
    data: data,
    format: 'hex',
    timeout: 1000,
    success: (res) => {
      // console.log('发送成功:', res) // 暂时注释日志打印
      uni.showToast({ 
        title: `已发送 ${res.bytesWritten} 字节`, 
        icon: 'success',
        duration: 1000
      })
    },
    fail: (err) => {
      console.error('发送失败:', err)
      uni.showToast({ 
        title: `发送失败: ${err.errMsg}`, 
        icon: 'none' 
      })
    }
  })
}

const handleSendQuick = (data) => {
  sendData.value = data
}

// 压测功能：以5Hz频率发送恒10命令
const toggleStressTest = () => {
  if (!isConnected.value || currentPortId === 0) {
    uni.showToast({ 
      title: '请先打开串口', 
      icon: 'none' 
    })
    return
  }
  
  if (isStressTesting.value) {
    // 停止压测
    stopStressTest()
    uni.showToast({ title: '压测已停止', icon: 'none', duration: 1000 })
  } else {
    // 开始压测
    isStressTesting.value = true
    const stressData = '73B4000A01002AF365' // 恒10命令
    
    // 5Hz = 每200ms发送一次
    stressTestTimer = setInterval(() => {
      if (!isConnected.value || currentPortId === 0) {
        stopStressTest()
        return
      }
      
      writeSerial({
        portId: currentPortId,
        data: stressData,
        format: 'hex',
        timeout: 100,
        success: () => {},
        fail: (err) => {
          console.error('压测发送失败:', err)
          stopStressTest()
        }
      })
    }, 200)
    
    uni.showToast({ title: '压测已开始 (5Hz)', icon: 'none', duration: 1000 })
  }
}

const stopStressTest = () => {
  if (stressTestTimer) {
    clearInterval(stressTestTimer)
    stressTestTimer = null
  }
  isStressTesting.value = false
}

// 压测2功能：以5Hz频率发送固定200条命令
const toggleStressTest2 = () => {
  if (!isConnected.value || currentPortId === 0) {
    uni.showToast({ 
      title: '请先打开串口', 
      icon: 'none' 
    })
    return
  }
  
  if (isStressTesting2.value) {
    // 停止压测2
    stopStressTest2()
    uni.showToast({ title: '压测2已停止', icon: 'none', duration: 1000 })
  } else {
    // 开始压测2
    isStressTesting2.value = true
    stressTest2Remaining.value = 200
    const stressData = '73B4000A01002AF365' // 恒10命令
    
    // 5Hz = 每200ms发送一次
    stressTest2Timer = setInterval(() => {
      if (!isConnected.value || currentPortId === 0) {
        stopStressTest2()
        return
      }
      
      if (stressTest2Remaining.value <= 0) {
        stopStressTest2()
        uni.showToast({ title: '压测2完成 (200条)', icon: 'success', duration: 1500 })
        return
      }
      
      writeSerial({
        portId: currentPortId,
        data: stressData,
        format: 'hex',
        timeout: 100,
        success: () => {
          stressTest2Remaining.value--
        },
        fail: (err) => {
          console.error('压测2发送失败:', err)
          stopStressTest2()
        }
      })
    }, 200)
    
    uni.showToast({ title: '压测2已开始 (200条@5Hz)', icon: 'none', duration: 1000 })
  }
}

const stopStressTest2 = () => {
  if (stressTest2Timer) {
    clearInterval(stressTest2Timer)
    stressTest2Timer = null
  }
  isStressTesting2.value = false
}

const clearReceived = () => {
  messageBuffer = []  // 清空缓冲区
  receivedMessages.value = []
  uni.showToast({
    title: '已清空',
    icon: 'success',
    duration: 1000
  })
}

const handleGetStats = () => {
  // UTS 插件不提供统计功能,显示基本信息
  stats.value = {
    bytesTx: 0,
    bytesRx: receivedMessages.value.reduce((sum, msg) => sum + msg.bytes, 0),
    framesTx: 0,
    framesRx: receivedMessages.value.length,
    queue: {
      items: 0,
      bytes: 0
    }
  }
  
  uni.showToast({
    title: '统计已更新',
    icon: 'success',
    duration: 1000
  })
}

const onBaudRateChange = (e) => {
  baudRateIndex.value = e.detail.value
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  const ms = String(date.getMilliseconds()).padStart(3, '0')
  return `${h}:${m}:${s}.${ms}`
}
</script>

<style scoped>
.container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
}

.title {
  font-size: 44rpx;
  font-weight: bold;
  color: #fff;
}

.section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.form-item {
  margin-bottom: 20rpx;
}

.label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.input, .textarea, .picker {
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.textarea {
  min-height: 120rpx;
}

.picker {
  background-color: #f9f9f9;
}

.status-bar {
  padding: 30rpx;
  background-color: #f5f5f5;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
  border-left: 6rpx solid #999;
}

.status-bar.connected {
  background-color: #e8f5e9;
  border-left-color: #4caf50;
}

.status-text {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.status-info {
  font-size: 24rpx;
  color: #666;
  display: block;
}

.button-group {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}

.btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 28rpx;
  border-radius: 10rpx;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
}

.btn-danger {
  background-color: #f44336;
  color: #fff;
}

.btn-small {
  height: 60rpx;
  line-height: 60rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
  margin-right: 10rpx;
}

.btn-stress {
  background-color: #f5f5f5;
  color: #333;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.15);
  transition: all 0.15s ease;
}

.btn-stress-active {
  background-color: #424242;
  color: #fff;
  box-shadow: inset 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.btn[disabled] {
  opacity: 0.5;
}

.quick-commands {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.received-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.received-list {
  max-height: 600rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 20rpx;
}

.message-item {
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 10rpx;
  margin-bottom: 15rpx;
  border-left: 4rpx solid #667eea;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.message-time {
  font-size: 24rpx;
  color: #999;
}

.message-bytes {
  font-size: 24rpx;
  color: #667eea;
  font-weight: bold;
}

.message-data {
  font-size: 26rpx;
  color: #333;
  font-family: monospace;
  word-break: break-all;
}

.empty-state {
  text-align: center;
  padding: 60rpx;
  color: #999;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-top: 20rpx;
}

.stat-item {
  background-color: #f9f9f9;
  padding: 30rpx;
  border-radius: 10rpx;
  text-align: center;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #667eea;
  display: block;
}

/* 快捷串口选择按钮 */
.quick-port-buttons {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 20rpx;
  gap: 10rpx;
}

.quick-port-buttons .btn-small {
  min-width: 80rpx;
}

.btn-active {
  background-color: #667eea !important;
  color: #fff !important;
}
</style>
