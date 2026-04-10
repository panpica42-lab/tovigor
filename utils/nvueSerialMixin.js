/**
 * nvue 串口生命周期 Mixin
 * 
 * 解决问题：
 *   nvue 页面有独立 JS 上下文，无法共享 App.vue 中建立的串口连接。
 *   每个 nvue 页面需要自行管理串口连接，但重复写连接/断开代码不优雅。
 * 
 * 用法：
 *   import nvueSerialMixin from '@/utils/nvueSerialMixin.js'
 *   export default {
 *     mixins: [nvueSerialMixin],
 *     mounted() {
 *       // mixin 已自动连接串口，可直接使用
 *       this.$serial.on('frame', this.handleFrame)
 *       this.$serial.startWorking(15, this.$FORCE_MODE.FLUID, 200)
 *     },
 *     beforeDestroy() {
 *       this.$serial.off('frame', this.handleFrame)
 *       this.$serial.stopForce()
 *     }
 *   }
 * 
 * 提供：
 *   this.$serial       - serialService 实例（on/off/startWorking/stopForce/sendOnce 等）
 *   this.$FORCE_MODE    - 力量模式枚举常量
 *   this.serialReady    - 响应式布尔值，串口是否已连接就绪
 */

import serialService, { FORCE_MODE } from '@/utils/serialService.js'

// ============================================================================
// 串口配置（统一管理，修改一处即可）
// ============================================================================
const SERIAL_CONFIG = {
  path: '/dev/ttyS9',
  baudRate: 115200
}

export default {
  data() {
    return {
      serialReady: false  // 串口连接是否就绪
    }
  },

  // 通过 computed 或 created 挂载到 this，让页面方便访问
  created() {
    this.$serial = serialService
    this.$FORCE_MODE = FORCE_MODE
  },

  mounted() {
    this._nvueSerialConnect()
  },

  beforeDestroy() {
    this._nvueSerialDisconnect()
  },

  methods: {
    /**
     * nvue 上下文串口连接（mounted 自动调用）
     */
    async _nvueSerialConnect() {
      const status = serialService.getStatus()
      if (status.isConnected) {
        console.log('[nvueSerialMixin] 串口已连接，跳过')
        this.serialReady = true
        return
      }

      console.log('[nvueSerialMixin] nvue 独立上下文，正在建立串口连接...')
      try {
        await serialService.connect(SERIAL_CONFIG)
        this.serialReady = true
        console.log('[nvueSerialMixin] 串口连接成功')
      } catch (err) {
        this.serialReady = false
        console.error('[nvueSerialMixin] 串口连接失败:', err)
        uni.showToast({ title: '设备连接失败', icon: 'none', duration: 2000 })
      }
    },

    /**
     * nvue 上下文串口断开（beforeDestroy 自动调用）
     * 注意：只断开连接，不负责 stopWorking / off 等业务清理
     *       业务清理由页面自己在 beforeDestroy 中处理（mixin 的 beforeDestroy 之后执行）
     */
    _nvueSerialDisconnect() {
      this.serialReady = false
      serialService.disconnect()
      console.log('[nvueSerialMixin] 串口连接已断开')
    }
  }
}
