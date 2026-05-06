<template>
	<view class="page">
		<view class="header">
			<view class="back-btn" @click="goBack">
				<text class="back-icon">‹</text>
			</view>
			<text class="title">WIFI</text>
			<view class="header-placeholder"></view>
		</view>

		<view class="panel">
			<view class="section">
				<view class="row row-switch">
					<text class="row-title">无线区域网</text>
					<switch
						:checked="wifiEnabled"
						color="#9dd532"
						@change="handleWifiSwitch"
					/>
				</view>
				<view v-if="wifiEnabled" class="current-network">
					<view class="current-left current-left-full">
						<text class="check-mark">✓</text>
						<text class="network-name">{{ currentWifiName }}</text>
					</view>
				</view>
			</view>

			<view v-if="wifiEnabled" class="section section-list">
				<view class="section-head">
					<text class="section-label">更多网络</text>
					<text class="refresh-text" @click="refreshWifiList">重新扫描</text>
				</view>

				<view v-if="scanMessage" class="scan-tip">
					<text class="scan-tip-text">{{ scanMessage }}</text>
				</view>

				<view
					v-for="item in wifiList"
					:key="item.bssid || item.ssid"
					class="network-card"
					:class="{ selected: selectedWifi && selectedWifi.ssid === item.ssid }"
				>
					<view class="network-row" @click="selectWifi(item)">
						<view class="network-left">
							<text class="network-name">{{ item.ssid }}</text>
							<text
								v-if="selectedWifi && selectedWifi.ssid === item.ssid"
								class="network-status"
							>{{ item.secure ? '安全' : '开放网络' }}</text>
						</view>
					</view>

					<view v-if="selectedWifi && selectedWifi.ssid === item.ssid" class="password-panel">
						<text class="password-label">输入网络安全密钥</text>
						<view class="password-box">
							<input
								v-model="wifiPassword"
								class="password-input"
								type="password"
								password
								placeholder="请输入密码"
								placeholder-class="password-placeholder"
							/>
							<text class="eye-icon">◉</text>
						</view>
						<view class="action-row">
							<view class="action-btn action-btn-primary" @click="connectWifi">
								<text class="action-btn-text primary-text">连接</text>
							</view>
							<view class="action-btn action-btn-disabled" @click="cancelSelection">
								<text class="action-btn-text disabled-text">取消</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
	connectWifiNetwork,
	ensureWifiSupport,
	getConnectedWifi,
	getSystemWifiEnabled,
	getWifiErrorMessage,
	initWifiService,
	scanWifiList,
	stopWifiService
} from '@/utils/system/wifi/wifi-service'

const wifiEnabled = ref(true)
const currentWifi = ref(null)
const wifiList = ref([])
const selectedWifi = ref(null)
const wifiPassword = ref('')
const scanMessage = ref('正在扫描附近 WiFi...')

const currentWifiName = computed(() => {
	return currentWifi.value && currentWifi.value.ssid
		? currentWifi.value.ssid
		: '未连接网络'
})

const handleWifiListChange = (list) => {
	wifiList.value = list
	scanMessage.value = wifiList.value.length ? '' : '未发现可用网络'

	if (
		selectedWifi.value &&
		!wifiList.value.some(item => item.ssid === selectedWifi.value.ssid)
	) {
		selectedWifi.value = null
		wifiPassword.value = ''
	}
}

const handleWifiConnected = (wifi) => {
	currentWifi.value = wifi
	selectedWifi.value = null
	wifiPassword.value = ''
	uni.showToast({
		title: 'WiFi 已连接',
		icon: 'none'
	})
	refreshWifiList()
}

const goBack = () => {
	uni.navigateBack()
}

const initWifiModule = async () => {
	const supportState = ensureWifiSupport()
	if (!supportState.supported) {
		scanMessage.value = supportState.message
		return
	}

	try {
		scanMessage.value = '正在扫描附近 WiFi...'
		await initWifiService({
			onWifiListChange: handleWifiListChange,
			onWifiConnected: handleWifiConnected
		})

		await refreshConnectedWifi()
		await refreshWifiList()
	} catch (error) {
		handleWifiError(error, 'WiFi 初始化失败')
	}
}

const refreshConnectedWifi = async () => {
	const supportState = ensureWifiSupport()
	if (!supportState.supported) {
		scanMessage.value = supportState.message
		return
	}

	try {
		currentWifi.value = await getConnectedWifi()
	} catch (error) {
		currentWifi.value = null
	}
}

const refreshWifiList = async () => {
	const supportState = ensureWifiSupport()
	if (!wifiEnabled.value || !supportState.supported) {
		if (!supportState.supported) {
			scanMessage.value = supportState.message
		}
		return
	}

	try {
		scanMessage.value = '正在扫描附近 WiFi...'
		await scanWifiList()
	} catch (error) {
		handleWifiError(error, '扫描 WiFi 失败')
	}
}

const handleWifiError = (error, fallbackMessage) => {
	const message = getWifiErrorMessage(error, fallbackMessage)
	scanMessage.value = message
	uni.showToast({
		title: message,
		icon: 'none'
	})
}

const handleWifiSwitch = async (event) => {
	wifiEnabled.value = event.detail.value
	if (!wifiEnabled.value) {
		selectedWifi.value = null
		wifiPassword.value = ''
		wifiList.value = []
		scanMessage.value = 'WiFi 已关闭'
		return
	}

	await initWifiModule()
}

const selectWifi = (item) => {
	selectedWifi.value = item
	wifiPassword.value = ''
}

const cancelSelection = () => {
	selectedWifi.value = null
	wifiPassword.value = ''
}

const connectWifi = () => {
	if (!selectedWifi.value) {
		return
	}

	if (selectedWifi.value.secure && !wifiPassword.value.trim()) {
		uni.showToast({
			title: '请输入 WiFi 密码',
			icon: 'none'
		})
		return
	}

	connectWifiNetwork({
		ssid: selectedWifi.value.ssid,
		bssid: selectedWifi.value.bssid,
		password: wifiPassword.value,
		secure: selectedWifi.value.secure
	})
		.then((result) => {
			if (result.manualConnect) {
				uni.showToast({
					title: '已打开系统连接流程，请按系统提示完成连接',
					icon: 'none'
				})
				return
			}

			uni.showToast({
				title: '正在连接 WiFi...',
				icon: 'none'
			})
		})
		.catch((error) => {
			handleWifiError(error, '连接 WiFi 失败')
		})
}

onMounted(() => {
	wifiEnabled.value = getSystemWifiEnabled()
	if (wifiEnabled.value) {
		initWifiModule()
	} else {
		scanMessage.value = '系统 WiFi 未开启，请先在设备设置中打开'
	}
})

onBeforeUnmount(() => {
	stopWifiService()
})
</script>

<style scoped>
page {
	height: 100%;
	background: #efefef;
}

.page {
	min-height: 100%;
	padding: 72rpx 18rpx 32rpx;
	box-sizing: border-box;
	background: #efefef;
}

.header {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.back-btn {
	width: 56rpx;
	height: 56rpx;
	border-radius: 28rpx;
	background: #6c6c6c;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon {
	font-size: 42rpx;
	line-height: 42rpx;
	color: #ffffff;
	transform: translateY(-2rpx);
}

.title {
	font-size: 40rpx;
	font-weight: 700;
	color: #111111;
}

.header-placeholder {
	width: 56rpx;
	height: 56rpx;
}

.panel {
	background: #ffffff;
	border-radius: 34rpx;
	padding: 28rpx 20rpx;
	box-sizing: border-box;
}

.section {
	border: 1rpx solid #e7e7e7;
	border-radius: 24rpx;
	padding: 0 18rpx;
	background: #ffffff;
}

.section + .section {
	margin-top: 20rpx;
}

.row {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	min-height: 86rpx;
}

.row-switch {
	border-bottom: 1rpx solid #ececec;
}

.row-title {
	font-size: 28rpx;
	color: #212121;
}

.current-network {
	min-height: 82rpx;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
}

.current-left,
.network-row {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.current-left-full {
	width: 100%;
}

.check-mark {
	margin-right: 16rpx;
	font-size: 36rpx;
	color: #9dd532;
	font-weight: 700;
}

.network-name {
	font-size: 30rpx;
	color: #222222;
}

.section-list {
	padding-top: 18rpx;
	padding-bottom: 18rpx;
}

.section-head {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 14rpx;
}

.section-label {
	font-size: 26rpx;
	color: #444444;
}

.refresh-text {
	font-size: 24rpx;
	color: #9dd532;
}

.scan-tip {
	padding: 8rpx 0 12rpx;
}

.scan-tip-text {
	font-size: 22rpx;
	color: #8b8b8b;
}

.network-card {
	border-radius: 20rpx;
}

.network-card.selected {
	background: #f3f3f3;
	padding: 10rpx 14rpx 16rpx;
}

.network-card + .network-card {
	border-top: 1rpx solid #ececec;
}

.network-card.selected + .network-card {
	border-top: none;
}

.network-row {
	justify-content: space-between;
	min-height: 76rpx;
}

.network-left {
	display: flex;
	flex-direction: column;
}

.network-status {
	margin-top: 6rpx;
	font-size: 22rpx;
	color: #666666;
}

.lock-icon {
	margin-right: 12rpx;
	font-size: 24rpx;
	color: #1b1b1b;
}

.password-panel {
	padding-top: 6rpx;
}

.password-label {
	display: block;
	margin-bottom: 10rpx;
	font-size: 24rpx;
	color: #444444;
}

.password-box {
	height: 68rpx;
	padding: 0 16rpx;
	background: #ffffff;
	border-radius: 12rpx;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
}

.password-input {
	flex: 1;
	font-size: 28rpx;
	color: #222222;
}

.password-placeholder {
	color: #a5a5a5;
}

.eye-icon {
	margin-left: 12rpx;
	font-size: 24rpx;
	color: #444444;
}

.action-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	margin-top: 16rpx;
}

.action-btn {
	width: 180rpx;
	height: 52rpx;
	border-radius: 26rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.action-btn-primary {
	background: #9dd532;
}

.action-btn-disabled {
	background: #e3e3e3;
}

.action-btn-text {
	font-size: 24rpx;
}

.primary-text {
	color: #111111;
}

.disabled-text {
	color: #9f9f9f;
}
</style>
