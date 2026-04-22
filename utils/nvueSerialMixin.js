/**
 * nvue 串口生命周期 Mixin
 *
 * 解决问题：
 *   nvue 页面有独立 JS 上下文，无法共享 WebView 侧 App.vue 中建立的串口连接。
 *   这里把连接提升为 nvue 上下文级单例：首次进入任意 nvue 串口页时自动连接，
 *   后续页面只复用连接并同步 serialReady，不再在页面销毁时断开。
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
 *     methods: {
 *       _nvueSerialBeforeStopForceOnHide() {
 *         // 可选：页面隐藏/退后台前同步本页的 UI 状态
 *       }
 *     }
 *   }
 *
 * 提供：
 *   this.$serial       - serialService 实例（on/off/startWorking/stopForce/sendOnce 等）
 *   this.$FORCE_MODE    - 力量模式枚举常量
 *   this.serialReady    - 响应式布尔值，串口是否已连接就绪
 */

import serialService, { FORCE_MODE } from '@/utils/serialService.js'
import { SERIAL_DEVICE_PATH, SERIAL_BAUD_RATE } from '@/utils/serialConfig.js'

// ============================================================================
// 串口配置（统一管理，修改一处即可）
// ============================================================================
const SERIAL_CONFIG = {
  path: SERIAL_DEVICE_PATH,
  baudRate: SERIAL_BAUD_RATE
}

const nvueSerialContext = {
  connectPromise: null,
  connectAttemptId: 0
}

function syncSerialReady(vm) {
  vm.serialReady = serialService.getStatus().isConnected
}

function ensureNvueContextConnected() {
  const status = serialService.getStatus()
  if (status.isConnected) {
    return Promise.resolve({ portId: status.portId, message: '已连接' })
  }

  if (nvueSerialContext.connectPromise) {
    return nvueSerialContext.connectPromise
  }

  const attemptId = ++nvueSerialContext.connectAttemptId
  if (status.state !== 'connecting') {
    console.log('[nvueSerialMixin] nvue 串口上下文启动，正在建立连接...')
  }

  const promise = serialService.ensureConnected(SERIAL_CONFIG)
    .then((res) => {
      if (nvueSerialContext.connectPromise === promise) {
        console.log('[nvueSerialMixin] nvue 串口连接就绪')
      }
      return res
    })
    .catch((err) => {
      if (nvueSerialContext.connectPromise === promise && attemptId === nvueSerialContext.connectAttemptId) {
        console.error('[nvueSerialMixin] nvue 串口连接失败:', err)
        uni.showToast({ title: '设备连接失败', icon: 'none', duration: 2000 })
      }
      throw err
    })
    .finally(() => {
      if (nvueSerialContext.connectPromise === promise) {
        nvueSerialContext.connectPromise = null
      }
    })

  nvueSerialContext.connectPromise = promise
  return promise
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
    this._nvueSerialHandleConnect = () => {
      syncSerialReady(this)
    }
    this._nvueSerialHandleDisconnect = () => {
      syncSerialReady(this)
    }
    syncSerialReady(this)
  },

  mounted() {
    this._bindNvueSerialStatusListeners()
    this._nvueSerialConnect()
  },

  onShow() {
    this._syncNvueSerialReady()
    this._nvueSerialConnect()
  },

  onHide() {
    this._nvueSerialStopForceOnHide()
  },

  beforeDestroy() {
    this._unbindNvueSerialStatusListeners()
  },

  methods: {
    _syncNvueSerialReady() {
      syncSerialReady(this)
    },

    _bindNvueSerialStatusListeners() {
      if (this._nvueSerialListenersBound) return
      serialService.on('connect', this._nvueSerialHandleConnect)
      serialService.on('disconnect', this._nvueSerialHandleDisconnect)
      this._nvueSerialListenersBound = true
    },

    _unbindNvueSerialStatusListeners() {
      if (!this._nvueSerialListenersBound) return
      serialService.off('connect', this._nvueSerialHandleConnect)
      serialService.off('disconnect', this._nvueSerialHandleDisconnect)
      this._nvueSerialListenersBound = false
    },

    /**
     * nvue 上下文串口连接（首次进入自动建连，后续页面复用）
     */
    async _nvueSerialConnect() {
      this._syncNvueSerialReady()
      if (this.serialReady) {
        return
      }

      try {
        await ensureNvueContextConnected()
      } catch (err) {
        // 错误已经在共享连接入口里统一上报，这里只同步本页状态。
      } finally {
        this._syncNvueSerialReady()
      }
    },

    /**
     * 页面隐藏/退后台时执行“停力保连”，底层串口保持连接。
     */
    _nvueSerialStopForceOnHide() {
      const shouldStopForce = serialService.isWorking() || this.powerOn === true
      if (!shouldStopForce) return

      if (typeof this._nvueSerialBeforeStopForceOnHide === 'function') {
        try {
          this._nvueSerialBeforeStopForceOnHide()
        } catch (err) {
          console.error('[nvueSerialMixin] 页面隐藏前同步 UI 状态失败:', err)
        }
      }

      console.log('[nvueSerialMixin] 页面隐藏，执行停力保连')
      serialService.stopForce()
      this._syncNvueSerialReady()
    },

    /**
     * 兼容旧调用点：页面层已不再负责断开连接。
     */
    _nvueSerialDisconnect() {}
  }
}
