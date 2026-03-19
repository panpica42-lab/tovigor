import App from './App'

// 解决 "Unable to preventDefault inside passive event listener" 警告
// Android WebView 和 H5 都会触发此警告，统一处理
if (typeof EventTarget !== 'undefined' && EventTarget.prototype) {
	const originalAddEventListener = EventTarget.prototype.addEventListener
	EventTarget.prototype.addEventListener = function(type, listener, options) {
		const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'mousewheel', 'touchend']
		if (passiveEvents.includes(type)) {
			if (typeof options === 'boolean') {
				options = { capture: options, passive: false }
			} else if (typeof options === 'object' || options === undefined) {
				options = { ...options, passive: false }
			}
		}
		return originalAddEventListener.call(this, type, listener, options)
	}
}

// 全局注册通用弹窗组件
import ModalDialog from '@/components/modals/modal-dialog.vue'

// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
Vue.component('ModalDialog', ModalDialog)
App.mpType = 'app'
const app = new Vue({
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
	const app = createSSRApp(App)
	// Vue 3 全局注册组件
	app.component('ModalDialog', ModalDialog)
	return {
		app
	}
}
// #endif
