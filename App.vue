<script>
import serialService from '@/utils/serialService.js'

export default {
  onLaunch() {
    console.log('App Launch')
    
    // 全局串口初始化（仅 App 平台）
    // #ifdef APP-PLUS
    this.initSerialConnection()
    // #endif
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  },
  methods: {
    // 初始化串口连接
    async initSerialConnection() {
      console.log('[App] 正在初始化串口连接...')
      try {
        const result = await serialService.connect({
          path: '/dev/ttyS9',
          baudRate: 115200
        })
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

/* 仅 H5 平台：锁死浏览器原生滚动，只允许内部 scroll-view 滚动 */
 /* #ifdef H5 */
html,
body,
#app {
  height: 100% !important;
  overflow: hidden !important;
}
 /* #endif */
</style>
