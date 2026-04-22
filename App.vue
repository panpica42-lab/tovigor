<script>
import serialService from '@/utils/serialService.js'
import { SERIAL_DEVICE_PATH, SERIAL_BAUD_RATE } from '@/utils/serialConfig.js'

// ========== 调试开关 ==========
const DEBUG_MODE = false  // true: 禁用串口连接，false: 启用串口连接
const APP_SERIAL_CONNECT_CONFIG = {
  path: SERIAL_DEVICE_PATH,
  baudRate: SERIAL_BAUD_RATE
}

export default {
  onLaunch() {
    console.log('App Launch')
    
    // 全局串口初始化（仅 App 平台）
    // #ifdef APP-PLUS
    if (!DEBUG_MODE) {
      this.initSerialConnection()
    } else {
      console.log('[App] 调试模式，跳过串口连接')
    }
    // #endif
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')

    // #ifdef APP-PLUS
    if (!DEBUG_MODE && serialService.isWorking()) {
      console.log('[App] App 进入后台，执行停力保连')
      serialService.stopForce()
    }
    // #endif
  },
  methods: {
    // 初始化串口连接
    async initSerialConnection() {
      console.log('[App] 正在初始化串口连接...')
      try {
        const result = await serialService.ensureConnected(APP_SERIAL_CONNECT_CONFIG)
        console.log('[App] 串口连接成功:', result)
      } catch (err) {
        console.error('[App] 串口连接失败:', err)
        uni.showToast({
          title: '设备连接失败，请检查硬件',
          icon: 'none',
          duration: 3000
        })
      }
    }
  }
}
</script>

<style>
@import './uni.scss';

/* 全局页面基础样式 */
page {
  background-color: #F5F5F5;
  height: 100% !important;
  overflow: hidden !important;  /* ⭐ 防止被后面的默认样式覆盖 */
}

/* html/body 样式仅 H5 需要，Android App 无需此块 */
</style>
