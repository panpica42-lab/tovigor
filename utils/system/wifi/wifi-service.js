import { requestWifiPermissions } from '../permission-service'

let isWifiReady = false
let wifiListListener = null
let wifiConnectedListener = null

const bindWifiListeners = ({ onWifiListChange, onWifiConnected } = {}) => {
	if (typeof uni.offGetWifiList === 'function' && wifiListListener) {
		uni.offGetWifiList(wifiListListener)
	}

	if (typeof uni.offWifiConnected === 'function' && wifiConnectedListener) {
		uni.offWifiConnected(wifiConnectedListener)
	}

	wifiListListener = (res) => {
		if (typeof onWifiListChange === 'function') {
			onWifiListChange(normalizeWifiList(res.wifiList || []))
		}
	}

	wifiConnectedListener = (res) => {
		if (typeof onWifiConnected === 'function') {
			onWifiConnected(normalizeWifiItem(res.wifi || {}))
		}
	}

	uni.onGetWifiList(wifiListListener)
	uni.onWifiConnected(wifiConnectedListener)
}

const getUniApiHandler = (apiName) => {
	switch (apiName) {
		case 'startWifi':
			return uni.startWifi
		case 'stopWifi':
			return uni.stopWifi
		case 'getConnectedWifi':
			return uni.getConnectedWifi
		case 'getWifiList':
			return uni.getWifiList
		case 'connectWifi':
			return uni.connectWifi
		default:
			return null
	}
}

const callUniApi = (apiName, options = {}) => {
	return new Promise((resolve, reject) => {
		const handler = getUniApiHandler(apiName)
		if (typeof handler !== 'function') {
			reject(new Error(`uni.${apiName} is not available`))
			return
		}

		handler({
			...options,
			success: (res) => {
				resolve(res || {})
			},
			fail: (err) => {
				reject(err || {})
			}
		})
	})
}

const isSecureWifi = (capabilities) => {
	if (!capabilities) {
		return false
	}

	return /WEP|WPA|PSK|EAP|SAE/i.test(capabilities)
}

const normalizeWifiItem = (item = {}) => {
	const ssid = item.SSID || item.ssid || ''
	const bssid = item.BSSID || item.bssid || ''
	const secure = typeof item.secure === 'boolean'
		? item.secure
		: isSecureWifi(item.capabilities || '')

	return {
		ssid,
		bssid,
		secure,
		signalStrength: item.signalStrength || 0
	}
}

const normalizeWifiList = (list = []) => {
	const ssidMap = new Map()

	list.forEach((item) => {
		const normalizedItem = normalizeWifiItem(item)
		if (!normalizedItem.ssid) {
			return
		}

		const existingItem = ssidMap.get(normalizedItem.ssid)
		if (!existingItem || normalizedItem.signalStrength > existingItem.signalStrength) {
			ssidMap.set(normalizedItem.ssid, normalizedItem)
		}
	})

	return Array.from(ssidMap.values()).sort((a, b) => b.signalStrength - a.signalStrength)
}

const getAndroidVersion = () => {
	const systemInfo = uni.getSystemInfoSync()
	const versionMatch = (systemInfo.system || '').match(/(\d+)/)
	return versionMatch ? Number(versionMatch[1]) : 0
}

export const getWifiErrorMessage = (error, fallbackMessage) => {
	const errCode = typeof error?.errCode === 'number' ? error.errCode : undefined

	if (errCode === 12005) {
		return '系统 WiFi 未开启，请先在设备设置中打开'
	}

	if (errCode === 12001) {
		return '当前系统不支持 WiFi 能力'
	}

	if (errCode === 12000) {
		return 'WiFi 模块未初始化'
	}

	if (error?.message) {
		return error.message
	}

	return fallbackMessage
}

export const ensureWifiSupport = () => {
	if (
		typeof uni.startWifi !== 'function' ||
		typeof uni.getWifiList !== 'function' ||
		typeof uni.connectWifi !== 'function'
	) {
		return {
			supported: false,
			message: '当前构建未启用 uni-WiFi 能力'
		}
	}

	// #ifndef APP-PLUS
	return {
		supported: false,
		message: 'H5 预览不支持真实 WiFi 扫描，请在 Android App 中调试'
	}
	// #endif

	return {
		supported: true,
		message: ''
	}
}

export const getSystemWifiEnabled = () => {
	try {
		const settings = uni.getSystemSetting ? uni.getSystemSetting() : null
		if (settings && typeof settings.wifiEnabled === 'boolean') {
			return settings.wifiEnabled
		}
	} catch (error) {
	}

	return true
}

export const initWifiService = async ({ onWifiListChange, onWifiConnected } = {}) => {
	const supportState = ensureWifiSupport()
	if (!supportState.supported) {
		throw new Error(supportState.message)
	}

	await requestWifiPermissions()

	if (!isWifiReady) {
		await callUniApi('startWifi')
		isWifiReady = true
	}

	bindWifiListeners({ onWifiListChange, onWifiConnected })
}

export const getConnectedWifi = async () => {
	const result = await callUniApi('getConnectedWifi')
	return normalizeWifiItem(result.wifi || {})
}

export const scanWifiList = async () => {
	await callUniApi('getWifiList')
}

export const connectWifiNetwork = async ({ ssid, bssid, password, secure }) => {
	const trimmedPassword = (password || '').trim()
	if (secure && !trimmedPassword) {
		throw new Error('请输入 WiFi 密码')
	}

	const manualConnect = getAndroidVersion() >= 10

	await callUniApi('connectWifi', {
		SSID: ssid,
		BSSID: bssid || undefined,
		password: trimmedPassword,
		maunal: manualConnect
	})

	return {
		manualConnect
	}
}

export const stopWifiService = () => {
	if (!isWifiReady) {
		return
	}

	if (typeof uni.offGetWifiList === 'function') {
		uni.offGetWifiList()
	}

	if (typeof uni.offWifiConnected === 'function') {
		uni.offWifiConnected()
	}

	if (typeof uni.stopWifi === 'function') {
		uni.stopWifi({
			success: () => {},
			fail: () => {},
			complete: () => {}
		})
	}

	wifiListListener = null
	wifiConnectedListener = null
	isWifiReady = false
}
