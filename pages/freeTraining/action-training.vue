<!--
 * 动作训练页面
 * 功能：执行已选动作的训练流程
 * 使用场景：从已选动作页点击"开始训练"进入
 * 与 free-training 的区别：无模式选择栏，有视频缩略图和力量曲线面板
 -->
<template>
	<view class="container">
		<!-- ==================== 小窗模式 ==================== -->
		<view v-if="!isVideoFullscreen" class="mode-small">
			<!-- 悬浮视频小窗 -->
			<view
				v-if="videoVisible"
				class="floating-video-window"
				:style="floatingVideoStyle"
			>
				<video
					id="actionVideo"
					class="floating-video-player"
					:src="VIDEO_PLACEHOLDER_SRC"
					autoplay
					loop
					muted
					:controls="false"
					:show-center-play-btn="false"
					:show-play-btn="false"
					:enable-progress-gesture="false"
					object-fit="cover"
				></video>
				<cover-view class="floating-video-touch-layer" @tap="handleVideoTap"></cover-view>
			</view>

			<!-- 正常内容层 -->
			<view class="content-layer">
				<view class="nav-bar">
					<image class="back-btn" src="/static/icons/general/btn_general_back.svg" mode="aspectFit" @click="goBack" />
					<text class="nav-title">{{ currentActionName }}</text>
					<view class="nav-placeholder"></view>
				</view>

				<view class="stat-board">
					<image class="board-bg" src="/static/icons/freeTrainingActivity/bg_statBoard.png" mode="aspectFill"></image>
					<view class="stat-row">
						<view class="stat-item">
							<image class="stat-icon" src="/static/icons/freeTrainingActivity/ic_counts.png" mode="aspectFit"></image>
							<view class="stat-content">
								<text class="stat-label">组数/次数</text>
								<text class="stat-value">{{ statBoard.sets }}</text>
							</view>
						</view>
						<image class="separator" src="/static/icons/freeTrainingActivity/ic_separate.png" mode="aspectFit"></image>
						<view class="stat-item">
							<image class="stat-icon" src="/static/icons/freeTrainingActivity/ic_train_time.png" mode="aspectFit"></image>
							<view class="stat-content">
								<text class="stat-label">训练时间</text>
								<text class="stat-value">{{ statBoard.duration }}</text>
							</view>
						</view>
						<image class="separator" src="/static/icons/freeTrainingActivity/ic_separate.png" mode="aspectFit"></image>
						<view class="stat-item">
							<image class="stat-icon" src="/static/icons/freeTrainingActivity/ic_calories.png" mode="aspectFit"></image>
							<view class="stat-content">
								<text class="stat-label">热量/千卡</text>
								<text class="stat-value">{{ statBoard.calories }}</text>
							</view>
						</view>
					</view>
				</view>

				<view class="middle-area">
					<view class="dial-section">
						<PowerDial
							ref="powerDialRef"
							v-model="dialValue"
							:min="5"
							:max="55"
							:initial-power-on="false"
							:mode-name="currentModeName"
							@change="onDialChange"
							@power-change="onPowerChange"
						/>
					</view>
				</view>

				<view class="heart-rate-row">
					<text class="heart-icon">❤️</text>
					<text class="heart-text">心率: {{ heartRate }}次/分钟</text>
				</view>

				<view class="force-curve-panel">
					<text class="force-curve-label">🔵 力量</text>
					<text class="force-curve-value">{{ statBoard.forceDisplay }}</text>
				</view>
			</view>
		</view>

		<!-- ==================== 伪全屏模式 ==================== -->
		<view v-else class="mode-fullscreen">
			<!-- 视频占据上方大面积区域（不铺满，不和控件重叠） -->
			<view class="fs-video-area">
				<video
					id="actionVideo"
					class="fs-video-player"
					:src="VIDEO_PLACEHOLDER_SRC"
					autoplay
					loop
					muted
					:controls="false"
					:show-center-play-btn="false"
					:show-play-btn="false"
					:enable-progress-gesture="false"
					object-fit="cover"
				></video>
				<cover-view class="fs-video-touch-layer" @tap="handleVideoTap"></cover-view>
			</view>

			<!-- 下方控件区（普通 view，和视频不重叠） -->
			<view class="fs-controls">
				<view class="fs-controls-top">
					<view class="fs-back" @click="exitFullscreen">
						<text class="fs-back-text">◀ 返回小窗</text>
					</view>
					<text class="fs-action-name">{{ currentActionName }}</text>
				</view>

				<view class="fs-data-row">
					<view class="fs-data-item">
						<text class="fs-data-label">组/次</text>
						<text class="fs-data-value">{{ statBoard.sets }}</text>
					</view>
					<view class="fs-data-item">
						<text class="fs-data-label">时间</text>
						<text class="fs-data-value">{{ statBoard.duration }}</text>
					</view>
					<view class="fs-data-item">
						<text class="fs-data-label">力量</text>
						<text class="fs-data-value">{{ statBoard.forceDisplay }}kg</text>
					</view>
					<view class="fs-data-item">
						<text class="fs-data-label">千卡</text>
						<text class="fs-data-value">{{ statBoard.calories }}</text>
					</view>
				</view>

				<view class="fs-dial-row">
					<PowerDial
						ref="powerDialRef"
						v-model="dialValue"
						:min="5"
						:max="55"
						:initial-power-on="false"
						:mode-name="currentModeName"
						@change="onDialChange"
						@power-change="onPowerChange"
					/>
				</view>
			</view>
		</view>

		<!-- 训练安全须知弹窗 -->
		<ModalDialog 
			v-model:show="showSafetyModal" 
			title="训练安全须知"
			confirm-text="我知道了"
			@confirm="handleModalConfirm"
		>
			<view class="safety-content">
				<view class="safety-item">1. 进行力量训练前，请先进行基础热身</view>
				<view class="safety-item">2. 使用力量力臂进行训练前，请确认力臂档位已锁好</view>
				<view class="safety-item">3. 请勿将整个人或其他重物挂在力臂上</view>
				<view class="safety-item">4. 请勿用硬物击打设备屏幕</view>
				<view class="safety-item">5. 结束训练后，请及时将力臂还原至初始状态并锁好</view>
			</view>
		</ModalDialog>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { onLoad, onBackPress } from '@dcloudio/uni-app'
import PowerDial from '@/components/ui-box/power-dial.vue'
import ModalDialog from '@/components/modals/modal-dialog.vue'
import serialService, { FORCE_MODE } from '@/utils/serialService.js'

// ==================== 状态管理 ====================
// 初始为 true，避免首次渲染时 video 组件先创建再销毁导致 getBoundingClientRect 空指针
const showSafetyModal = ref(true)

// 接收到的训练动作列表
const trainingActions = ref([])
// 当前训练的动作索引
const currentActionIndex = ref(0)

// 当前动作名称
const currentActionName = computed(() => {
	const action = trainingActions.value[currentActionIndex.value]
	return action ? action.name : '动作训练'
})

// 当前动作封面图
const currentActionCover = computed(() => {
	const action = trainingActions.value[currentActionIndex.value]
	return action ? action.cover : ''
})

// 视频占位素材与显示状态
const VIDEO_PLACEHOLDER_SRC = '/static/icons/general/video-placeholder.mp4'
const isVideoFullscreen = ref(false)
// 视频在弹窗关闭后才显示，避免首帧就创建原生 video 组件
const videoVisible = computed(() => !showSafetyModal.value)
// 视频上下文，用于主动控制播放
let videoCtx = null

const floatingVideoRect = ref({
	left: 0,
	top: 0,
	width: 0,
	height: 0
})

const floatingVideoStyle = computed(() => ({
	left: `${floatingVideoRect.value.left}px`,
	top: `${floatingVideoRect.value.top}px`,
	width: `${floatingVideoRect.value.width}px`,
	height: `${floatingVideoRect.value.height}px`
}))



// 心率（暂无真实数据，占位显示）
const heartRate = ref('00')

// 顶部看板数据
const statBoard = ref({
	sets: '00',
	duration: '00:00:00',
	calories: '00',
	forceDisplay: '00'
})

// 力量旋钮组件引用和状态
const powerDialRef = ref(null)
const DEFAULT_FORCE = 15
const dialValue = ref(DEFAULT_FORCE)
let lastForce = DEFAULT_FORCE
const powerOn = ref(false)

// 当前力量模式（动作训练模式固定，暂时默认流体阻力）
const currentModeName = computed(() => '流体阻力')
const currentForceMode = FORCE_MODE.FLUID

// 组数计数器
let setCount = 0
let countBaseline = 0
let needCaptureBaseline = false

// 运动计时
const SPEED_THRESHOLD = 10
const IDLE_WINDOW = 2000
let activeSeconds = 0
let lastActiveTs = 0
let activeTimer = null

// 关机发送序列
const SHUTDOWN_DURATION = 2000
const SHUTDOWN_INTERVAL = 200
let shutdownTimer = null
let shutdownTimeout = null

// ==================== 辅助函数 ====================

function formatTime(totalSeconds) {
	const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
	const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
	const s = String(totalSeconds % 60).padStart(2, '0')
	return `${h}:${m}:${s}`
}

function formatSets(sets, count) {
	return `${String(sets).padStart(2, '0')}/${String(count).padStart(2, '0')}`
}

function stopShutdownSequence() {
	if (shutdownTimer) { clearInterval(shutdownTimer); shutdownTimer = null }
	if (shutdownTimeout) { clearTimeout(shutdownTimeout); shutdownTimeout = null }
}

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value))
}

function initFloatingVideoWindow() {
	const sys = uni.getSystemInfoSync()
	const width = Math.round(sys.windowWidth * 0.26 * 0.7)
	const height = Math.round((width * 1920) / 1080)
	const left = 12
	const top = Math.round(sys.windowHeight * 0.62)
	const maxLeft = sys.windowWidth - width
	const maxTop = sys.windowHeight - height

	floatingVideoRect.value = {
		width,
		height,
		left: clamp(left, 0, maxLeft),
		top: clamp(top, 0, maxTop)
	}
}

// ==================== 生命周期 ====================

onLoad(() => {
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	const eventChannel = currentPage && currentPage.getOpenerEventChannel ? currentPage.getOpenerEventChannel() : null
	if (!eventChannel) return

	eventChannel.on('trainingActions', (data) => {
		trainingActions.value = data
		console.log('动作训练页 - 接收到训练数据：', data)
	})
})

// 串口帧回调
const handleFrame = (data) => {
	const p = data.parsed
	if (!p) return

	// 开机后第一帧：捕获基准值
	if (needCaptureBaseline) {
		countBaseline = p.sportCount
		needCaptureBaseline = false
	}

	// 检测运动
	if (Math.abs(p.left.speed) > SPEED_THRESHOLD || Math.abs(p.right.speed) > SPEED_THRESHOLD) {
		lastActiveTs = Date.now()
	}

	const currentCount = p.sportCount - countBaseline
	statBoard.value = {
		sets: formatSets(setCount, currentCount),
		duration: formatTime(activeSeconds),
		calories: (p.calories / 1000).toFixed(0),
		forceDisplay: String(Math.max(p.left.force || 0, p.right.force || 0)).padStart(2, '0')
	}
}

onMounted(() => {
	initFloatingVideoWindow()
	serialService.on('frame', handleFrame)
})

onBeforeUnmount(() => {
	console.log('动作训练页 - 页面卸载，清理资源')
	if (activeTimer) { clearInterval(activeTimer); activeTimer = null }
	stopShutdownSequence()
	serialService.off('frame', handleFrame)
	if (powerOn.value) {
		serialService.stopWorking()
		serialService.sendOnce(5, FORCE_MODE.OFF)
	}
})

onBackPress(() => {
	if (showSafetyModal.value) {
		showSafetyModal.value = false
		return true
	}
	return false
})

// ==================== 事件处理 ====================

const goBack = () => {
	uni.navigateBack()
}

const handleModalConfirm = () => {
	showSafetyModal.value = false
	// 等视图层完成 video 原生组件的 DOM 创建后，主动调用 play()
	setTimeout(() => {
		videoCtx = uni.createVideoContext('actionVideo')
		if (videoCtx) videoCtx.play()
	}, 300)
}

// 统一的双击切换处理（小窗 ↔ 全屏背景）
let lastVideoTapTs = 0
const handleVideoTap = () => {
	const now = Date.now()
	if (now - lastVideoTapTs < 300) {
		isVideoFullscreen.value = !isVideoFullscreen.value
		lastVideoTapTs = 0
		return
	}
	lastVideoTapTs = now
}

// 全屏模式下点击返回按钮退出
const exitFullscreen = () => {
	isVideoFullscreen.value = false
}

// 力量旋钮值变化
const onDialChange = (value) => {
	console.log('力量值确认:', value)
	lastForce = value
	if (powerOn.value) {
		serialService.updateWorkingForce(value)
	}
}

// 开关状态变化
const onPowerChange = (isOn) => {
	powerOn.value = isOn
	console.log('开关状态:', isOn ? '开' : '关')

	if (isOn) {
		stopShutdownSequence()
		setCount++
		needCaptureBaseline = true

		lastActiveTs = 0
		activeTimer = setInterval(() => {
			if (lastActiveTs > 0 && (Date.now() - lastActiveTs) < IDLE_WINDOW) {
				activeSeconds++
			}
		}, 1000)

		serialService.startWorking(dialValue.value, currentForceMode, 200)
	} else {
		if (activeTimer) { clearInterval(activeTimer); activeTimer = null }
		serialService.stopWorking()

		serialService.sendOnce(5, FORCE_MODE.OFF)
		shutdownTimer = setInterval(() => {
			serialService.sendOnce(5, FORCE_MODE.OFF)
		}, SHUTDOWN_INTERVAL)
		shutdownTimeout = setTimeout(() => {
			stopShutdownSequence()
			console.log('关机发送序列结束')
		}, SHUTDOWN_DURATION)

		dialValue.value = lastForce
	}
}
</script>

<style scoped>
.container {
	position: relative;
	height: 100vh;
	width: 100vw;
	background-color: #1a1a2e;
	overflow: hidden;
	box-sizing: border-box;
}

/* ==================== 小窗模式：正常布局 ==================== */
.mode-small {
	position: relative;
	height: 100%;
	width: 100%;
}

.mode-fullscreen {
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;
}

.content-layer {
	position: relative;
	display: flex;
	flex-direction: column;
	height: 100%;
	padding: 0 40rpx 40rpx 40rpx;
	box-sizing: border-box;
}

.floating-video-window {
	position: absolute;
	z-index: 8;
	border-radius: 16rpx;
	overflow: hidden;
	background: #000;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.28);
	border: 2rpx solid rgba(255, 255, 255, 0.7);
}

.floating-video-player {
	width: 100%;
	height: 100%;
	pointer-events: none;
}

.floating-video-touch-layer {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 1;
}

/* ==================== 自定义导航栏 ==================== */
.nav-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 90rpx;
	padding-top: 20rpx;
	margin-bottom: 20rpx;
	flex-shrink: 0;
}

.back-btn {
	width: 56rpx;
	height: 56rpx;
}

.nav-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #FFFFFF;
}

.nav-placeholder {
	width: 56rpx;
}

/* ==================== 数据看板 ==================== */
.stat-board {
	position: relative;
	width: 100%;
	height: 160rpx;
	margin-bottom: 24rpx;
	flex-shrink: 0;
	background: linear-gradient(145deg, #ffffff, #f0f0f0);
	border-radius: 24rpx;
	border: 3rpx solid #d0d0d0;
	box-shadow: 
		0 8rpx 24rpx rgba(0, 0, 0, 0.12),
		0 2rpx 6rpx rgba(0, 0, 0, 0.08),
		inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
	overflow: hidden;
}

.board-bg {
	position: absolute;
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
}

.stat-row {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-around;
	height: 100%;
	padding: 0 30rpx;
}

.stat-item {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.stat-icon {
	width: 60rpx;
	height: 60rpx;
}

.stat-content {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.stat-label {
	font-size: 24rpx;
	color: #666666;
}

.stat-value {
	font-size: 32rpx;
	font-weight: bold;
	color: #000000;
}

.separator {
	width: 2rpx;
	height: 80rpx;
}

/* ==================== 中部区域：力量旋钮 ==================== */
.middle-area {
	display: flex;
	flex-direction: row;
	align-items: stretch;
	flex: 1;
	min-height: 0;
	margin-bottom: 12rpx;
}

.heart-rate-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 8rpx;
	padding: 0 8rpx;
	margin-bottom: 16rpx;
}

.heart-icon {
	font-size: 28rpx;
}

.heart-text {
	font-size: 24rpx;
	color: #999999;
}

.dial-section {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* ==================== 底部力量曲线占位面板 ==================== */
.force-curve-panel {
	flex-shrink: 0;
	width: 100%;
	height: 120rpx;
	border-radius: 24rpx;
	background: linear-gradient(135deg, #f0f4f8, #e2e8f0);
	border: 3rpx solid #d0d0d0;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 0 40rpx;
	box-sizing: border-box;
}

.force-curve-label {
	font-size: 28rpx;
	font-weight: 600;
	color: #333333;
}

.force-curve-value {
	font-size: 56rpx;
	font-weight: bold;
	color: #333333;
}

/* ==================== 伪全屏模式 ==================== */

/* 视频区：占据上方大面积，不铺满全屏 */
.fs-video-area {
	position: relative;
	width: 100%;
	height: 65vh;
	background: #000;
	flex-shrink: 0;
}

.fs-video-player {
	width: 100%;
	height: 100%;
	pointer-events: none;
}

.fs-video-touch-layer {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 1;
}

/* 下方控件区：普通 view，和视频完全不重叠 */
.fs-controls {
	flex: 1;
	display: flex;
	flex-direction: column;
	padding: 16rpx 30rpx 30rpx 30rpx;
	box-sizing: border-box;
}

.fs-controls-top {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 16rpx;
}

.fs-back {
	padding: 10rpx 20rpx;
	border-radius: 12rpx;
	background-color: rgba(255, 255, 255, 0.15);
}

.fs-back-text {
	color: #FFFFFF;
	font-size: 26rpx;
}

.fs-action-name {
	color: #FFFFFF;
	font-size: 32rpx;
	font-weight: bold;
	margin-left: 20rpx;
}

.fs-data-row {
	display: flex;
	flex-direction: row;
	justify-content: space-around;
	margin-bottom: 16rpx;
	padding: 16rpx 0;
	border-radius: 16rpx;
	background-color: rgba(255, 255, 255, 0.08);
}

.fs-data-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4rpx;
}

.fs-data-label {
	color: rgba(255, 255, 255, 0.6);
	font-size: 22rpx;
}

.fs-data-value {
	color: #FFFFFF;
	font-size: 32rpx;
	font-weight: bold;
}

.fs-dial-row {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 0;
}

/* ==================== 安全须知弹窗 ==================== */
.safety-content {
	padding: 0 10rpx;
}

.safety-item {
	font-size: 28rpx;
	color: #333333;
	line-height: 2;
	margin-bottom: 10rpx;
	text-align: left;
}
</style>
