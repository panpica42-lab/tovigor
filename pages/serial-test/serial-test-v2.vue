<!--
  串口通信测试页面 v2
  使用 serialService.js 服务层架构
  
  与 v1 的区别：
  - 不再直接调用 UTS 插件，而是通过 serialService 中间层
  - 使用事件订阅模式接收数据
  - 帧解析由 serialService 统一处理
-->
<template>
  <view class="container">
    <view class="header">
      <text class="title">串口测试 v2 (Service架构)</text>
    </view>
    
    <!-- 设备选择 -->
    <view class="section">
      <text class="section-title">1. 设备配置</text>
      <view class="form-item">
        <text class="label">设备路径:</text>
        <input v-model="devicePath" class="input" placeholder="/dev/ttyUSB0" />
      </view>
      <view class="form-item">
        <text class="label">波特率:</text>
        <picker :value="baudRateIndex" :range="baudRates" @change="onBaudRateChange">
          <view class="picker">{{ baudRates[baudRateIndex] }}</view>
        </picker>
      </view>
      <button @click="handleScanDevices" class="btn btn-secondary">扫描设备</button>
    </view>
    
    <!-- 连接控制 -->
    <view class="section">
      <text class="section-title">2. 连接控制</text>
      <view class="status-bar" :class="{ connected: isConnected }">
        <text class="status-text">状态: {{ isConnected ? '已连接' : '未连接' }}</text>
        <text v-if="isConnected" class="status-info">{{ devicePath }}</text>
      </view>
      <view class="button-group">
        <button @click="handleConnect" :disabled="isConnected" class="btn btn-primary">
          打开串口
        </button>
        <button @click="handleDisconnect" :disabled="!isConnected" class="btn btn-danger">
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
        <button @click="handleSend" :disabled="!isConnected" class="btn btn-primary">
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
    
    <!-- 数据接收 - 完整帧 -->
    <view class="section">
      <text class="section-title">4. 接收数据 (已解析帧)</text>
      <view class="received-header">
        <text>收到 {{ frameMessages.length }} 帧</text>
        <button @click="clearFrames" class="btn btn-small">清空</button>
      </view>
      <scroll-view class="received-list" scroll-y>
        <view 
          v-for="(msg, index) in frameMessages" 
          :key="'frame-' + index" 
          class="message-item message-frame"
        >
          <view class="message-header">
            <text class="message-time">{{ formatTime(msg.ts) }}</text>
            <text class="message-bytes">{{ msg.bytes }} 字节 (完整帧)</text>
          </view>
          <text class="message-data">{{ msg.raw }}</text>
        </view>
        <view v-if="frameMessages.length === 0" class="empty-state">
          <text>暂无完整帧</text>
        </view>
      </scroll-view>
    </view>
    
    <!-- 原始数据 (调试用) -->
    <view class="section">
      <text class="section-title">5. 原始数据 (调试)</text>
      <view class="received-header">
        <text>收到 {{ rawMessages.length }} 条原始数据</text>
        <button @click="clearRaw" class="btn btn-small">清空</button>
      </view>
      <scroll-view class="received-list received-list-small" scroll-y>
        <view 
          v-for="(msg, index) in rawMessages" 
          :key="'raw-' + index" 
          class="message-item message-raw"
        >
          <view class="message-header">
            <text class="message-time">{{ formatTime(msg.ts) }}</text>
            <text class="message-bytes">{{ msg.bytes }} 字节</text>
          </view>
          <text class="message-data">{{ msg.data }}</text>
        </view>
        <view v-if="rawMessages.length === 0" class="empty-state">
          <text>暂无数据</text>
        </view>
      </scroll-view>
    </view>
    
    <!-- 统计信息 -->
    <view class="section">
      <text class="section-title">6. 统计信息</text>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-label">完整帧数</text>
          <text class="stat-value">{{ frameMessages.length }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">原始包数</text>
          <text class="stat-value">{{ rawMessages.length }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">接收字节</text>
          <text class="stat-value">{{ totalBytesRx }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">插件版本</text>
          <text class="stat-value">{{ pluginVersion }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as serial from '@/utils/serialService'

// ============ 响应式状态 ============
const devicePath = ref('/dev/ttyUSB0')
const baudRates = ref([9600, 19200, 38400, 57600, 115200, 230400, 460800])
const baudRateIndex = ref(4) // 默认 115200
const isConnected = ref(false)
const sendData = ref('')
const pluginVersion = ref('')

// 消息列表
const frameMessages = ref([])  // 完整帧（经过帧解析）
const rawMessages = ref([])    // 原始数据（调试用）
const maxMessages = 200

// 压测相关
const isStressTesting = ref(false)
let stressTestTimer = null

// 压测2相关（固定200条）
const isStressTesting2 = ref(false)
const stressTest2Remaining = ref(0)
let stressTest2Timer = null

// UI 刷新相关
let frameBuffer = []
let rawBuffer = []
let uiRefreshTimer = null
const UI_REFRESH_INTERVAL = 200  // 200ms 刷新一次 UI

// 统计
const totalBytesRx = computed(() => {
  return rawMessages.value.reduce((sum, msg) => sum + msg.bytes, 0)
})

// ============ 事件回调函数 ============

// 收到完整帧
const handleFrame = (data) => {
  frameBuffer.unshift({
    raw: data.raw,
    parsed: data.parsed,
    bytes: data.bytes,
    ts: data.ts
  })
  if (frameBuffer.length > maxMessages) {
    frameBuffer.pop()
  }
}

// 收到原始数据
const handleRaw = (data) => {
  rawBuffer.unshift({
    data: data.data,
    bytes: data.bytes,
    ts: data.ts
  })
  if (rawBuffer.length > maxMessages) {
    rawBuffer.pop()
  }
}

// 连接成功
const handleConnect = async () => {
  if (!devicePath.value) {
    uni.showToast({ title: '请输入设备路径', icon: 'none' })
    return
  }
  
  uni.showLoading({ title: '连接中...' })
  
  try {
    await serial.connect({
      path: devicePath.value,
      baudRate: baudRates.value[baudRateIndex.value]
    })
    isConnected.value = true
    uni.hideLoading()
    uni.showToast({ title: '连接成功', icon: 'success' })
  } catch (err) {
    uni.hideLoading()
    uni.showModal({
      title: '连接失败',
      content: err.errMsg || '未知错误',
      showCancel: false
    })
  }
}

// 断开连接
const handleDisconnect = async () => {
  try {
    await serial.disconnect()
    isConnected.value = false
    uni.showToast({ title: '已断开', icon: 'success' })
  } catch (err) {
    uni.showToast({ title: '断开失败', icon: 'none' })
  }
}

// 连接状态变化回调
const onConnectEvent = (info) => {
  console.log('[v2] 连接事件:', info)
  isConnected.value = true
}

const onDisconnectEvent = (info) => {
  console.log('[v2] 断开事件:', info)
  isConnected.value = false
  stopStressTest()
}

const onErrorEvent = (err) => {
  console.error('[v2] 错误事件:', err)
}

// ============ 生命周期 ============

onMounted(() => {
  console.log('=== 串口测试页面 v2 已挂载 ===')
  
  // 获取插件版本
  pluginVersion.value = serial.getPluginVersion()
  
  // 检查是否已连接（单例复用）
  const status = serial.getStatus()
  if (status.isConnected) {
    isConnected.value = true
    devicePath.value = status.config.path
    console.log('[v2] 复用已有连接:', status)
  }
  
  // 订阅事件
  serial.on('frame', handleFrame)
  serial.on('raw', handleRaw)
  serial.on('connect', onConnectEvent)
  serial.on('disconnect', onDisconnectEvent)
  serial.on('error', onErrorEvent)
  
  // 启动 UI 刷新定时器
  startUiRefresh()
  
  uni.showToast({ title: 'v2 架构已加载', icon: 'success', duration: 1500 })
})

onBeforeUnmount(() => {
  console.log('[v2] 页面销毁，取消订阅')
  
  // 停止压测
  stopStressTest()
  stopStressTest2()
  
  // 停止 UI 刷新
  stopUiRefresh()
  
  // 取消订阅（重要！防止内存泄漏）
  serial.off('frame', handleFrame)
  serial.off('raw', handleRaw)
  serial.off('connect', onConnectEvent)
  serial.off('disconnect', onDisconnectEvent)
  serial.off('error', onErrorEvent)
  
  // 注意：不在这里调用 disconnect()
  // 让 serialService 保持连接，其他页面可以复用
})

// ============ UI 刷新 ============

const startUiRefresh = () => {
  stopUiRefresh()
  uiRefreshTimer = setInterval(() => {
    // 批量同步到响应式变量
    if (frameBuffer.length > 0) {
      frameMessages.value = [...frameBuffer]
    }
    if (rawBuffer.length > 0) {
      rawMessages.value = [...rawBuffer]
    }
  }, UI_REFRESH_INTERVAL)
}

const stopUiRefresh = () => {
  if (uiRefreshTimer) {
    clearInterval(uiRefreshTimer)
    uiRefreshTimer = null
  }
}

// ============ 发送相关 ============

const handleSend = async () => {
  if (!sendData.value.trim()) {
    uni.showToast({ title: '请输入数据', icon: 'none' })
    return
  }
  
  // 移除空格
  const data = sendData.value.replace(/\s+/g, '')
  
  // 验证 HEX 格式
  if (!/^[0-9A-Fa-f]*$/.test(data)) {
    uni.showToast({ title: '请输入有效的HEX数据', icon: 'none' })
    return
  }
  
  if (data.length % 2 !== 0) {
    uni.showToast({ title: 'HEX长度必须为偶数', icon: 'none' })
    return
  }
  
  try {
    const res = await serial.send(data)
    uni.showToast({ title: `已发送 ${res.bytesWritten} 字节`, icon: 'success', duration: 1000 })
  } catch (err) {
    uni.showToast({ title: `发送失败: ${err.errMsg}`, icon: 'none' })
  }
}

const handleSendQuick = (data) => {
  sendData.value = data
}

// ============ 扫描设备 ============

const handleScanDevices = async () => {
  try {
    const devices = await serial.scanDevices()
    console.log('扫描到设备:', devices)
    
    if (devices.length === 0) {
      uni.showToast({ title: '未找到设备', icon: 'none' })
      return
    }
    
    uni.showActionSheet({
      itemList: devices,
      success: (res) => {
        devicePath.value = devices[res.tapIndex]
        uni.showToast({ title: `已选择: ${devicePath.value}`, icon: 'none' })
      }
    })
  } catch (err) {
    uni.showToast({ title: '扫描失败', icon: 'none' })
  }
}

// ============ 压测 ============

const toggleStressTest = async () => {
  if (!isConnected.value) {
    uni.showToast({ title: '请先连接串口', icon: 'none' })
    return
  }
  
  if (isStressTesting.value) {
    stopStressTest()
    uni.showToast({ title: '压测已停止', icon: 'none' })
  } else {
    isStressTesting.value = true
    const stressData = '73B4000A01002AF365'
    
    // 5Hz
    stressTestTimer = setInterval(async () => {
      if (!isConnected.value) {
        stopStressTest()
        return
      }
      try {
        await serial.send(stressData)
      } catch (err) {
        console.error('压测发送失败:', err)
        stopStressTest()
      }
    }, 200)
    
    uni.showToast({ title: '压测已开始 (5Hz)', icon: 'none' })
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
const toggleStressTest2 = async () => {
  if (!isConnected.value) {
    uni.showToast({ title: '请先连接串口', icon: 'none' })
    return
  }
  
  if (isStressTesting2.value) {
    stopStressTest2()
    uni.showToast({ title: '压测2已停止', icon: 'none' })
  } else {
    isStressTesting2.value = true
    stressTest2Remaining.value = 200
    const stressData = '73B4000A01002AF365'
    
    // 5Hz = 每200ms发送一次
    stressTest2Timer = setInterval(async () => {
      if (!isConnected.value) {
        stopStressTest2()
        return
      }
      
      if (stressTest2Remaining.value <= 0) {
        stopStressTest2()
        uni.showToast({ title: '压测2完成 (200条)', icon: 'success', duration: 1500 })
        return
      }
      
      try {
        await serial.send(stressData)
        stressTest2Remaining.value--
      } catch (err) {
        console.error('压测2发送失败:', err)
        stopStressTest2()
      }
    }, 200)
    
    uni.showToast({ title: '压测2已开始 (200条@5Hz)', icon: 'none' })
  }
}

const stopStressTest2 = () => {
  if (stressTest2Timer) {
    clearInterval(stressTest2Timer)
    stressTest2Timer = null
  }
  isStressTesting2.value = false
}

// ============ 清空 ============

const clearFrames = () => {
  frameBuffer = []
  frameMessages.value = []
}

const clearRaw = () => {
  rawBuffer = []
  rawMessages.value = []
}

// ============ 工具函数 ============

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
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
}

.title {
  font-size: 40rpx;
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
  border-left-color: #2ecc71;
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
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: #fff;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
}

.btn-danger {
  background-color: #e74c3c;
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
  max-height: 400rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 20rpx;
}

.received-list-small {
  max-height: 250rpx;
}

.message-item {
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 10rpx;
  margin-bottom: 15rpx;
  border-left: 4rpx solid #2ecc71;
}

.message-frame {
  border-left-color: #2ecc71;
  background-color: #e8f5e9;
}

.message-raw {
  border-left-color: #95a5a6;
  background-color: #f9f9f9;
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
  color: #2ecc71;
  font-weight: bold;
}

.message-data {
  font-size: 24rpx;
  color: #333;
  font-family: monospace;
  word-break: break-all;
}

.empty-state {
  text-align: center;
  padding: 40rpx;
  color: #999;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
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
  color: #2ecc71;
  display: block;
}
</style>
