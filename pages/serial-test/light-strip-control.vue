<template>
	<view class="page">
		<view class="header">
			<text class="title">灯带控制</text>
			<text class="subtitle">CM-XS / 485 / 固定串口</text>
		</view>

		<view class="section">
			<text class="section-title">设备信息</text>
			<view class="info-row">
				<text class="label">设备路径</text>
				<text class="value">{{ devicePath }}</text>
			</view>
			<view class="info-row">
				<text class="label">串口参数</text>
				<text class="value">{{ serialParamsText }}</text>
			</view>
			<view class="status-card" :class="{ connected: isConnected }">
				<text class="status-dot"></text>
				<text class="status-text">{{ isConnected ? '已连接' : '未连接' }}</text>
				<text v-if="portId > 0" class="status-extra">portId: {{ portId }}</text>
			</view>
			<button class="btn primary" :disabled="isConnected || isBusy" @click="handleConnect">连接灯带串口</button>
		</view>

		<view class="section">
			<text class="section-title">内置指令</text>
			<view class="command-grid">
				<button class="btn command on" hover-class="command-pressed" :hover-stay-time="80" :disabled="!isConnected" @click="handleBroadcastTurnOn">广播开启</button>
				<button class="btn command off" hover-class="command-pressed" :hover-stay-time="80" :disabled="!isConnected" @click="handleBroadcastTurnOff">广播关闭</button>
				<button class="btn command direct-on" hover-class="command-pressed" :hover-stay-time="80" :disabled="!isConnected" @click="handleDirectTurnOn">灯带开启</button>
				<button class="btn command direct-off" hover-class="command-pressed" :hover-stay-time="80" :disabled="!isConnected" @click="handleDirectTurnOff">灯带关闭</button>
			</view>
			<view class="effect-card">
				<view class="effect-head">
					<text class="effect-title">内置花样</text>
					<text class="effect-preview">{{ builtInEffectPreview }}</text>
				</view>
				<view class="effect-actions">
					<picker class="effect-picker" :range="builtInEffectOptions" range-key="label" :value="builtInEffectIndex" @change="handleBuiltInEffectChange">
						<view class="picker-value">花样值：{{ builtInEffectLabel }}</view>
					</picker>
					<button class="btn command effect-btn" hover-class="command-pressed" :hover-stay-time="80" :disabled="!isConnected" @click="handleBuiltInEffectSend">发送花样</button>
				</view>
			</view>
			<view class="hex-tip">
				<text>广播开启(0x00)：5E5F0000000200045AFE</text>
				<text>广播关闭(0x00)：5E5F00000002FFFF5AFE</text>
				<text>灯带开启(0x55)：5E5F5500000200045AFE</text>
				<text>灯带关闭(0x55)：5E5F55000002FFFF5AFE</text>
				<text>内置花样(0x55，花样值 0x01~0x0F)：{{ builtInEffectPreview }}</text>
			</view>
		</view>

		<view class="section">
			<text class="section-title">发送区</text>
			<textarea
				v-model="manualHex"
				class="hex-input"
				placeholder="请输入 HEX，例如：5E5F5500000200045AFE"
				auto-height
			/>
			<view class="manual-actions">
				<button class="btn primary manual-btn" :disabled="!isConnected" @click="handleManualSend">发送 HEX</button>
				<button class="btn manual-btn" @click="clearManualHex">清空输入</button>
			</view>
		</view>

		<view class="section receive-section">
			<view class="receive-header">
				<text class="section-title">接收区</text>
				<button class="btn small" @click="clearMessages">清空</button>
			</view>
			<scroll-view class="receive-list" scroll-y>
				<view v-for="(msg, index) in messages" :key="index" class="message">
					<view class="message-top">
						<text class="message-time">{{ msg.time }}</text>
						<text class="message-tag" :class="msg.type">{{ msg.label }}</text>
					</view>
					<text class="message-data">{{ msg.data }}</text>
				</view>
				<view v-if="messages.length === 0" class="empty">
					<text>暂无接收数据</text>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import lightStripService from '@/utils/lightStripService.js'
import { SERIAL_DEVICES } from '@/utils/serialConfig.js'

const lightStripConfig = SERIAL_DEVICES.lightStrip
const devicePath = lightStripConfig.path
const serialParamsText = `${lightStripConfig.baudRate} / ${lightStripConfig.dataBits} / ${lightStripConfig.stopBits} / ${lightStripConfig.parity}`
const ADDRESS_BROADCAST = 0x00
const ADDRESS_DEFAULT = 0x55
const isConnected = ref(false)
const isBusy = ref(false)
const portId = ref(0)
const messages = ref([])
const manualHex = ref('5E5F5500000200045AFE')
const builtInEffectOptions = Array.from({ length: 15 }, (_, index) => {
	const value = index + 1
	return {
		value,
		label: `0x${value.toString(16).padStart(2, '0').toUpperCase()}`
	}
})
const builtInEffectIndex = ref(9)
const builtInEffectLabel = computed(() => builtInEffectOptions[builtInEffectIndex.value]?.label || '0x00')
const builtInEffectPreview = computed(() => {
	const effectCode = builtInEffectOptions[builtInEffectIndex.value]?.value ?? 0
	return `5E5F${ADDRESS_DEFAULT.toString(16).padStart(2, '0').toUpperCase()}00000200${effectCode.toString(16).padStart(2, '0').toUpperCase()}5AFE`
})

function formatTime() {
	const date = new Date()
	const hh = String(date.getHours()).padStart(2, '0')
	const mm = String(date.getMinutes()).padStart(2, '0')
	const ss = String(date.getSeconds()).padStart(2, '0')
	return `${hh}:${mm}:${ss}`
}

function addMessage(label, data, type = 'info') {
	messages.value.unshift({
		time: formatTime(),
		label,
		data,
		type
	})
}

function syncStatus() {
	const status = lightStripService.getStatus()
	isConnected.value = status.isConnected
	portId.value = status.portId
}

async function handleConnect() {
	isBusy.value = true
	try {
		const res = await lightStripService.connect()
		syncStatus()
		addMessage('连接', `灯带串口连接成功，portId=${res.portId || portId.value}`, 'success')
	} catch (err) {
		addMessage('错误', JSON.stringify(err), 'error')
	} finally {
		isBusy.value = false
	}
}

async function runCommand(label, commandText, task) {
	if (isBusy.value) {
		addMessage('提示', '上一条灯带指令还在执行，已忽略本次点击', 'warn')
		return
	}

	isBusy.value = true
	addMessage('发送', commandText, 'send')
	try {
		const res = await task()
		if (res && res.noResponseExpected) {
			addMessage(label, '本次为广播发送，无需应答', 'info')
		} else if (res && res.bytesRead > 0) {
			addMessage(label, res.data, 'receive')
		} else {
			addMessage(label, '未读到灯带应答', 'warn')
		}
	} catch (err) {
		addMessage('错误', JSON.stringify(err), 'error')
	} finally {
		isBusy.value = false
	}
}

function handleBroadcastTurnOn() {
	return runCommand(
		'应答',
		'广播开启：5E5F0000000200045AFE',
		() => lightStripService.turnOn({ address: ADDRESS_BROADCAST })
	)
}

function handleBroadcastTurnOff() {
	return runCommand(
		'应答',
		'广播关闭：5E5F00000002FFFF5AFE',
		() => lightStripService.turnOff({ address: ADDRESS_BROADCAST })
	)
}

function handleDirectTurnOn() {
	return runCommand(
		'应答',
		'灯带开启：5E5F5500000200045AFE',
		() => lightStripService.turnOn({ address: ADDRESS_DEFAULT })
	)
}

function handleDirectTurnOff() {
	return runCommand(
		'应答',
		'灯带关闭：5E5F55000002FFFF5AFE',
		() => lightStripService.turnOff({ address: ADDRESS_DEFAULT })
	)
}

function handleBuiltInEffectChange(event) {
	builtInEffectIndex.value = Number(event.detail.value || 0)
}

function handleBuiltInEffectSend() {
	const effectCode = builtInEffectOptions[builtInEffectIndex.value]?.value ?? 0
	return runCommand(
		'应答',
		`内置花样(${builtInEffectLabel.value})：${builtInEffectPreview.value}`,
		() => lightStripService.runBuiltInEffect({
			address: ADDRESS_DEFAULT,
			effectCode
		})
	)
}

function clearMessages() {
	messages.value = []
}

function clearManualHex() {
	manualHex.value = ''
}

function handleManualSend() {
	return runCommand(
		'应答',
		`手动发送：${manualHex.value}`,
		() => lightStripService.sendHex(manualHex.value)
	)
}

onMounted(() => {
	syncStatus()
})
</script>

<style scoped>
.page {
	min-height: 100vh;
	padding: 32rpx;
	background: #F4F6F8;
	box-sizing: border-box;
}

.header {
	margin-bottom: 28rpx;
}

.title {
	display: block;
	font-size: 44rpx;
	font-weight: 700;
	color: #17212B;
}

.subtitle {
	display: block;
	margin-top: 8rpx;
	font-size: 24rpx;
	color: #6C7A89;
}

.section {
	margin-bottom: 24rpx;
	padding: 28rpx;
	background: #FFFFFF;
	border-radius: 22rpx;
	box-shadow: 0 8rpx 22rpx rgba(24, 39, 75, 0.08);
}

.section-title {
	display: block;
	margin-bottom: 22rpx;
	font-size: 30rpx;
	font-weight: 700;
	color: #17212B;
}

.info-row {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	margin-bottom: 18rpx;
}

.label {
	font-size: 26rpx;
	color: #6C7A89;
}

.value {
	font-size: 26rpx;
	font-weight: 600;
	color: #17212B;
}

.status-card {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin: 18rpx 0 24rpx;
	padding: 20rpx;
	background: #FFF4F2;
	border-radius: 16rpx;
}

.status-card.connected {
	background: #ECFFF4;
}

.status-dot {
	width: 18rpx;
	height: 18rpx;
	margin-right: 12rpx;
	background: #E74C3C;
	border-radius: 50%;
}

.status-card.connected .status-dot {
	background: #22C55E;
}

.status-text {
	font-size: 28rpx;
	font-weight: 700;
	color: #17212B;
}

.status-extra {
	margin-left: 18rpx;
	font-size: 24rpx;
	color: #6C7A89;
}

.btn {
	height: 76rpx;
	line-height: 76rpx;
	margin: 0;
	border-radius: 16rpx;
	font-size: 26rpx;
	font-weight: 700;
	color: #17212B;
	background: #EDF1F5;
}

.btn::after {
	border: none;
}

.btn[disabled] {
	opacity: 0.45;
}

.primary {
	color: #FFFFFF;
	background: linear-gradient(135deg, #2563EB 0%, #0891B2 100%);
}

.command-grid {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 18rpx;
}

.command {
	width: calc(50% - 9rpx);
	color: #FFFFFF;
	transition: transform 0.08s ease, opacity 0.08s ease;
}

.command-pressed {
	opacity: 0.86;
	transform: scale(0.97);
}

.on {
	background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
}

.off {
	background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);
}

.direct-on {
	background: linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%);
}

.direct-off {
	background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
}

.hex-tip {
	display: flex;
	flex-direction: column;
	margin-top: 20rpx;
	gap: 8rpx;
	font-size: 22rpx;
	color: #6C7A89;
}

.effect-card {
	margin-top: 20rpx;
	padding: 20rpx;
	background: #F8FAFC;
	border: 2rpx solid #D8E0E8;
	border-radius: 16rpx;
}

.effect-head {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	gap: 12rpx;
	margin-bottom: 16rpx;
}

.effect-title {
	font-size: 26rpx;
	font-weight: 700;
	color: #17212B;
}

.effect-preview {
	flex: 1;
	font-size: 22rpx;
	color: #6C7A89;
	text-align: right;
	word-break: break-all;
}

.effect-actions {
	display: flex;
	flex-direction: row;
	gap: 18rpx;
}

.effect-picker {
	flex: 1;
}

.picker-value {
	height: 76rpx;
	line-height: 76rpx;
	padding: 0 20rpx;
	background: #FFFFFF;
	border-radius: 16rpx;
	font-size: 26rpx;
	font-weight: 600;
	color: #17212B;
}

.effect-btn {
	flex: 1;
	background: linear-gradient(135deg, #7C3AED 0%, #2563EB 100%);
}

.hex-input {
	width: 100%;
	min-height: 120rpx;
	padding: 20rpx;
	margin-bottom: 18rpx;
	background: #F8FAFC;
	border: 2rpx solid #D8E0E8;
	border-radius: 16rpx;
	box-sizing: border-box;
	font-size: 26rpx;
	color: #17212B;
}

.manual-actions {
	display: flex;
	flex-direction: row;
	gap: 18rpx;
}

.manual-btn {
	flex: 1;
}

.receive-section {
	min-height: 420rpx;
}

.receive-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
}

.small {
	width: 120rpx;
	height: 56rpx;
	line-height: 56rpx;
	font-size: 22rpx;
}

.receive-list {
	height: 360rpx;
	padding: 16rpx;
	background: #111827;
	border-radius: 16rpx;
	box-sizing: border-box;
}

.message {
	margin-bottom: 16rpx;
	padding-bottom: 16rpx;
	border-bottom: 1rpx solid rgba(255, 255, 255, 0.08);
}

.message-top {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 8rpx;
}

.message-time {
	margin-right: 12rpx;
	font-size: 22rpx;
	color: #94A3B8;
}

.message-tag {
	padding: 4rpx 12rpx;
	border-radius: 999rpx;
	font-size: 20rpx;
	color: #FFFFFF;
	background: #475569;
}

.message-tag.success,
.message-tag.receive {
	background: #16A34A;
}

.message-tag.send {
	background: #2563EB;
}

.message-tag.warn {
	background: #D97706;
}

.message-tag.error {
	background: #DC2626;
}

.message-data {
	font-size: 24rpx;
	color: #E5E7EB;
	word-break: break-all;
}

.empty {
	padding-top: 130rpx;
	text-align: center;
}

.empty text {
	font-size: 26rpx;
	color: #64748B;
}
</style>
