import App from './App'
import { createSSRApp } from 'vue'
import ModalDialog from '@/components/modals/modal-dialog.vue'

// Keep touch listeners non-passive so preventDefault continues to work
// in Android WebView and H5 previews.
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

export function createApp() {
	const app = createSSRApp(App)
	app.component('ModalDialog', ModalDialog)
	return {
		app
	}
}
