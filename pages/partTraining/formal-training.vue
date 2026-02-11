<!--
 * 正式训练页面
 * 功能：训练过程中的主界面，包含力量控制、数据看板、AI教练指导
 * 结构：全屏背景 + 控制面板 + AI气泡 + 数据看板 + 力量滑块 + 心率曲线
 -->
<template>
	<view class="formal-training-page">
		<!-- 全屏背景图（占位图，后续替换为视频）- 点击显示控制面板 -->
		<image 
			class="background-image" 
			src="/static/icons/partTrainingActivity/startTraining/trainingActivity_placeHolder.webp" 
			mode="aspectFill"
			@click="showControlPanel"
		/>
		
		<!-- 控制面板遮罩层 -->
		<view 
			v-if="isControlPanelVisible" 
			class="control-panel-overlay"
			@click="hideControlPanel"
		>
			<!-- 按钮组容器 - 阻止点击冒泡 -->
			<view class="control-buttons" @click.stop>
				<!-- 上一训练环节按钮 -->
				<view class="control-btn prev-btn" @click="handlePrevStep">
					<image 
						class="control-btn-icon" 
						src="/static/icons/general/btn_last_step.svg" 
						mode="aspectFit"
					/>
					<text class="control-btn-text">练前热身</text>
				</view>
				
				<!-- 继续播放按钮 -->
				<view class="control-btn continue-btn" @click="handleContinue">
					<image 
						class="control-btn-icon" 
						src="/static/icons/general/btn_playing_white.svg" 
						mode="aspectFit"
					/>
				</view>
				
				<!-- 下一训练环节按钮 -->
				<view class="control-btn next-btn" @click="handleNextStep">
					<image 
						class="control-btn-icon" 
						src="/static/icons/general/btn_next_step.svg" 
						mode="aspectFit"
					/>
					<text class="control-btn-text">练后拉伸</text>
				</view>
			</view>
			
			<!-- 退出训练按钮（底部居中） -->
			<view class="exit-btn" @click.stop="handleExitTraining">
				<text class="exit-btn-text">退出训练</text>
			</view>
		</view>
		
		<!-- 返回按钮（左上角浮层） -->
		<CommonBackButton class="back-btn-position" />
		
		<!-- 标题（顶部居中） -->
		<view class="header-title">
			<text class="title-text">{{ currentExerciseName }}</text>
		</view>
		
		<!-- 进度条（顶部下方） -->
		<view class="progress-section">
			<StepBar :totalSteps="totalSteps" :currentStep="currentStep" />
		</view>
		
		<!-- AI教练气泡对话框 -->
		<view class="coach-dialog-section">
			<BubbleDialogBox
				:roleLabel="coachRoleLabel"
				:avatarUrl="coachAvatarUrl"
				:badgeBackground="coachBadgeBackground"
				:text="currentCoachTip"
				contentBackground="rgba(255, 255, 255, 0.85)"
				:showShadow="true"
				:clickable="true"
				@coach-click="openCoachModal"
			/>
		</view>
		
		<!-- 右侧数据看板区域 -->
		<view class="data-panels">
			<!-- 组数/次数看板 -->
			<DataPanel
				icon="/static/icons/partTrainingActivity/startTraining/icon-sets.svg"
				label="组数/次数"
				:value="`${currentSet}/${currentRep}`"
			/>
			
			<!-- 热量/千卡看板 -->
			<DataPanel
				icon="/static/icons/partTrainingActivity/startTraining/icon-calories.svg"
				label="热量/千卡"
				:value="calories"
				:decimals="2"
			/>
		</view>
		
		<!-- 虚拟形象模拟缩略图（左下角） -->
		<view class="virtual-character-container">
			<image 
				class="close-btn-svg" 
				src="/static/icons/general/btn_general_close.svg" 
				mode="aspectFit"
				@click="closeVirtualCharacter"
			/>
			<text class="virtual-title">虚拟形象模拟</text>
			<image 
				class="virtual-character-image" 
				src="/static/icons/partTrainingActivity/startTraining/virtual-character.png" 
				mode="aspectFit"
			/>
		</view>
		
		<!-- 力量标签（虚拟形象下方） -->
		<view class="strength-label">
			<image class="strength-icon" src="/static/icons/partTrainingActivity/startTraining/icon-strength.svg" mode="aspectFit" />
			<text class="strength-text">力量</text>
		</view>
		
		<!-- 心率显示区域 -->
		<view class="heart-rate-section">
			<!-- 心率看板 -->
			<DataPanel
				icon="/static/icons/partTrainingActivity/startTraining/ic_heart.png"
				label="心率"
				:value="heartRate"
				unit="次/分钟"
				valueColor="#E53935"
				labelColor="#E53935"
				unitColor="#E53935"
			/>
			<!-- 心率曲线图（占位） -->
			<view class="heart-rate-curve">
				<image 
					class="curve-image" 
					src="/static/icons/partTrainingActivity/startTraining/heart-rate-curve.png" 
					mode="widthFix"
				/>
			</view>
		</view>
		
		<!-- 底部力量控制区域 -->
		<view class="strength-control-section">
			<!-- 顶部行：配重标签左上，力量值右上 -->
			<view class="control-header">
				<view class="weight-label">
					<view class="weight-badge">KG</view>
					<text class="weight-text">配重</text>
				</view>
				<text class="weight-value">{{ displayWeight }}KG</text>
			</view>
			
			<!-- 开关按钮（居中） -->
			<view 
				class="switch-btn" 
				:class="{ 'switch-on': isPowerOn, 'switch-off': !isPowerOn }"
				@click="togglePower"
			>
				<image 
					:src="isPowerOn ? '/static/icons/partTrainingActivity/startTraining/ic_switch_on.svg' : '/static/icons/partTrainingActivity/startTraining/ic_switch_off.svg'" 
					mode="aspectFit"
					class="switch-icon"
				/>
			</view>
			
			<!-- 力量调节滑块区域 -->
			<view class="slider-row" :class="{ 'slider-disabled': !isPowerOn }">
				<!-- 减少按钮 -->
				<view class="adjust-btn minus-btn" :class="{ 'btn-disabled': !isPowerOn }" @click="decreaseWeight">
					<text class="adjust-btn-text">−</text>
				</view>
				
				<!-- 高性能滑块组件 -->
				<view class="power-slider-container" :class="{ 'slider-disabled': !isPowerOn }">
					<PowerSlider
						v-model="currentWeight"
						:min="sliderMin"
						:max="sliderMax"
						:disabled="!isPowerOn"
						@dragging="onSliderDragging"
						@change="onSliderChange"
					/>
				</view>
				
				<!-- 增加按钮 -->
				<view class="adjust-btn plus-btn" :class="{ 'btn-disabled': !isPowerOn }" @click="increaseWeight">
					<text class="adjust-btn-text">+</text>
				</view>
			</view>
		</view>
		
		<!-- AI教练选择弹窗 -->
		<CoachDetailModal
			v-model:show="showCoachModal"
			:coachData="selectedCoach"
			:switchable="true"
			@select="handleCoachSelect"
		/>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CommonBackButton from '@/components/ui-box/common-back-button.vue'
import StepBar from '@/components/ui-box/step-bar.vue'
import BubbleDialogBox from '@/components/ui-box/bubble-dialog-box.vue'
import DataPanel from '@/components/ui-box/data-panel.vue'
import PowerSlider from '@/components/ui-box/power-slider.vue'
import CoachDetailModal from '@/components/modals/coach-detail-modal.vue'
import { getSelectedCoach, setSelectedCoach } from '@/utils/coachManager.js'
import serialService, { buildD180Frame, FORCE_MODE } from '@/utils/serialService.js'

// ========== 训练数据 ==========
const currentExerciseName = ref('站姿肩关节环绕')

// ========== 进度条 ==========
const totalSteps = ref(12)    // 胶囊总数（固定12个）
const currentStep = ref(8)    // 当前进度

// ========== 训练数据 ==========
const totalSets = ref(5)      // 总组数
const currentSet = ref(5)     // 当前组
const currentRep = ref(13)    // 当前次数
const calories = ref(68.88)   // 消耗热量
const heartRate = ref(33)     // 心率

// ========== 力量控制 ==========
const currentWeight = ref(30) // 当前配重 KG
const isPowerOn = ref(false)   // 电源状态（默认关闭）

// 滑块相关常量
const sliderMin = 5
const sliderMax = 55

// 拖动时的实时值（用于显示）
const dragDisplayValue = ref(30)
const isDraggingSlider = ref(false)

// 显示用的数值：拖动时显示实时值，否则显示 currentWeight
const displayWeight = computed(() => {
	return isDraggingSlider.value ? dragDisplayValue.value : currentWeight.value
})

// ========== 串口通信 ==========
let lastSendTime = 0
const SEND_THROTTLE_MS = 1000  // 1Hz 节流

// ========== AI教练信息 ==========
const selectedCoach = ref(null)
const coachRoleLabel = computed(() => selectedCoach.value?.fullName || 'Vince(艾斯)')
const coachAvatarUrl = computed(() => selectedCoach.value?.avatar || '/static/icons/partTrainingActivity/AI_coach_Vince.png')
const coachBadgeBackground = computed(() => selectedCoach.value?.badgeBackground || 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)')

// 教练选择弹窗状态
const showCoachModal = ref(false)

// 打开教练选择弹窗
const openCoachModal = () => {
	showCoachModal.value = true
}

// 处理教练选择
const handleCoachSelect = (coachData) => {
	setSelectedCoach(coachData.value)
	selectedCoach.value = coachData
	uni.showToast({
		title: `已切换为${coachData.label}`,
		icon: 'success'
	})
}

// AI教练提示语
const coachTips = [
	'上半身保持竖直，膝盖不要弯曲',
	'保持呼吸节奏，发力时呼气',
	'动作要慢，感受肌肉发力',
	'核心收紧，不要借力',
	'很棒！保持这个节奏'
]
const currentTipIndex = ref(0)
const currentCoachTip = computed(() => coachTips[currentTipIndex.value])

// ========== 控制面板 ==========
const isControlPanelVisible = ref(false)

const showControlPanel = () => {
	isControlPanelVisible.value = true
}

const hideControlPanel = () => {
	isControlPanelVisible.value = false
}

const handleContinue = () => {
	hideControlPanel()
}

const handlePrevStep = () => {
	isControlPanelVisible.value = false
	// 跳转到练前热身
	uni.navigateTo({
		url: '/pages/partTraining/warm-up-page'
	})
}

const handleNextStep = () => {
	isControlPanelVisible.value = false
	// 跳转到练后拉伸
	uni.navigateTo({
		url: '/pages/partTraining/cool-down-page'
	})
}

const handleExitTraining = () => {
	isControlPanelVisible.value = false
	uni.navigateBack({
		delta: 3  // 返回到课程列表
	})
}

// ========== 力量控制方法 ==========

// 滑块拖动中回调（用于实时显示数值）
const onSliderDragging = (value) => {
	isDraggingSlider.value = true
	dragDisplayValue.value = value
}

// 滑块拖动结束回调
const onSliderChange = (value) => {
	isDraggingSlider.value = false
	dragDisplayValue.value = value
	
	// 发送力量命令（1Hz 节流）
	if (isPowerOn.value) {
		sendForceCommand(value, FORCE_MODE.CONST)
	}
}

const increaseWeight = () => {
	if (!isPowerOn.value) return
	if (currentWeight.value < sliderMax) {
		currentWeight.value = Math.min(currentWeight.value + 5, sliderMax)
	}
}

const decreaseWeight = () => {
	if (!isPowerOn.value) return
	if (currentWeight.value > sliderMin) {
		currentWeight.value = Math.max(currentWeight.value - 5, sliderMin)
	}
}

const togglePower = () => {
	isPowerOn.value = !isPowerOn.value
	
	if (isPowerOn.value) {
		// 开启：发送当前力量值 + 恒力模式
		sendForceCommand(currentWeight.value, FORCE_MODE.CONST)
	} else {
		// 关闭：发送 force=5, forceMode=OFF（注意：force=0+mode=0 是紧急停车，不使用）
		sendForceCommand(5, FORCE_MODE.OFF)
	}
}

// ========== 虚拟形象 ==========
const closeVirtualCharacter = () => {
	uni.showToast({
		title: '功能开发中',
		icon: 'none'
	})
}

// ========== 生命周期 ==========
onMounted(() => {
	selectedCoach.value = getSelectedCoach()
	console.log('正式训练页 - 当前教练:', selectedCoach.value)
})

// ========== 串口通信方法 ==========
/**
 * 发送力量命令（带 1Hz 节流）
 * @param {number} force - 力量值 (kg)
 * @param {number} forceMode - 力量模式
 */
const sendForceCommand = async (force, forceMode) => {
	const now = Date.now()
	
	// 1Hz 节流：如果距离上次发送不足 1 秒，跳过（开关操作除外）
	if (forceMode !== FORCE_MODE.OFF && now - lastSendTime < SEND_THROTTLE_MS) {
		console.log('[formal-training] 节流跳过，距离上次发送:', now - lastSendTime, 'ms')
		return
	}
	lastSendTime = now
	
	// 构建 D180 下行帧
	const frame = buildD180Frame({
		force: force,
		forceMode: forceMode
	})
	
	console.log('[formal-training] 发送力量命令:', {
		force,
		forceMode,
		hex: frame.hex
	})
	
	// 检查连接状态
	const status = serialService.getStatus()
	if (!status.isConnected) {
		console.warn('[formal-training] 串口未连接，无法发送')
		uni.showToast({
			title: '设备未连接',
			icon: 'none'
		})
		return
	}
	
	// 发送命令
	try {
		await serialService.send(frame.hex)
		console.log('[formal-training] 发送成功')
	} catch (err) {
		console.error('[formal-training] 发送失败:', err)
	}
}
</script>

<style scoped lang="scss">
/* ========== 页面容器 ========== */
.formal-training-page {
	position: relative;
	width: 100%;
	min-height: 100vh;
	overflow: hidden;
	background-color: #000000;
}

/* 全屏背景图 */
.background-image {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 0;
}

/* ========== 返回按钮 ========== */
.back-btn-position {
	position: absolute;
	left: 24rpx;
	top: 24rpx;
	z-index: 100;
}

/* ========== 标题 ========== */
.header-title {
	position: absolute;
	top: 24rpx;
	left: 0;
	right: 0;
	z-index: 90;
	display: flex;
	justify-content: center;
	align-items: center;
	height: 88rpx;
}

.title-text {
	font-size: 36rpx;
	font-weight: 700;
	color: #FFFFFF;
	text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.5);
}

/* ========== 进度条 ========== */
.progress-section {
	position: absolute;
	top: 120rpx;
	left: 24rpx;
	right: 24rpx;
	z-index: 90;
}

/* ========== AI教练气泡 ========== */
.coach-dialog-section {
	position: absolute;
	top: 180rpx;
	left: 24rpx;
	right: 240rpx;
	z-index: 80;
}

/* ========== 右侧数据看板 ========== */
.data-panels {
	position: absolute;
	top: 180rpx;
	right: 24rpx;
	z-index: 80;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

/* ========== 虚拟形象缩略图 ========== */
.virtual-character-container {
	position: absolute;
	left: 24rpx;
	bottom: 380rpx;
	z-index: 70;
	width: 140rpx;
	padding: 20rpx;
	background-color: rgba(255, 255, 255, 0.4);
	backdrop-filter: blur(10rpx);
	border-radius: 16rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
	display: flex;
	flex-direction: column;
	align-items: center;
}

.close-btn-svg {
	position: absolute;
	top: 8rpx;
	left: 8rpx;
	z-index: 10;
	width: 18rpx;
	height: 18rpx;
}

.virtual-title {
	font-size: 18rpx;
	font-weight: 600;
	color: #333333;
	text-align: center;
	margin-bottom: 12rpx;
}

.virtual-character-image {
	width: 140rpx;
	height: 140rpx;
}

/* ========== 力量标签 ========== */
.strength-label {
	position: absolute;
	left: 24rpx;
	bottom: 320rpx;
	z-index: 70;
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 8rpx;
}

.strength-icon {
	width: 24rpx;
	height: 24rpx;
}

.strength-text {
	font-size: 24rpx;
	color: #333333;
	font-weight: 500;
}

/* ========== 心率区域 ========== */
.heart-rate-section {
	position: absolute;
	right: 24rpx;
	bottom: 280rpx;
	z-index: 70;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 12rpx;
}

.heart-rate-curve {
	width: 300rpx;
	height: 60rpx;
	overflow: hidden;
}

.curve-image {
	width: 100%;
}

/* ========== 底部力量控制区域 ========== */
.strength-control-section {
	position: absolute;
	left: 24rpx;
	right: 24rpx;
	bottom: 24rpx;
	z-index: 100;
	padding: 16rpx 28rpx 20rpx;
	background: rgba(255, 255, 255, 0.85);
	border-radius: 24rpx;
	display: flex;
	flex-direction: column;
}

/* 配重标签 */
.control-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	margin-bottom: 2rpx;
}

.weight-label {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 8rpx;
}

.weight-badge {
	padding: 4rpx 12rpx;
	background: #333333;
	border-radius: 6rpx;
	font-size: 20rpx;
	color: #FFFFFF;
	font-weight: 600;
}

.weight-text {
	font-size: 24rpx;
	color: #333333;
	font-weight: 500;
}

.weight-value {
	font-size: 36rpx;
	font-weight: 700;
	color: #333333;
}

/* 开关按钮 */
.switch-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	align-self: center;
	width: 98rpx;
	height: 98rpx;
	background: #FFFFFF;
	border-radius: 50%;
	margin-bottom: 48rpx;
	transition: all 0.3s ease;
}

.switch-btn.switch-on {
	box-shadow: 0 6rpx 20rpx rgba(76, 175, 80, 0.5);
}

.switch-btn.switch-off {
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.switch-icon {
	width: 68rpx;
	height: 68rpx;
}

.slider-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 16rpx;
	width: 100%;
}

/* 自定义滑块 */
/* PowerSlider 组件容器 */
.power-slider-container {
	flex: 1;
	height: 48rpx;
}

.adjust-btn {
	width: 44rpx;
	height: 44rpx;
	border-radius: 22rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.minus-btn {
	background: #FF9800;
}

.plus-btn {
	background: #4CAF50;
}

.adjust-btn-text {
	font-size: 32rpx;
	color: #FFFFFF;
	font-weight: 700;
	line-height: 1;
}

/* 禁用状态样式 - 配合 PowerSlider 组件 */
.slider-disabled {
	opacity: 0.6;
}

.btn-disabled {
	background: #CCCCCC !important;
	opacity: 0.6;
}

/* ========== 控制面板遮罩层 ========== */
.control-panel-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 500;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.control-buttons {
	position: relative;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	width: 100%;
}

.control-btn {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.continue-btn {
	position: relative;
}

.continue-btn .control-btn-icon {
	width: 160rpx;
	height: 160rpx;
}

/* 上一环节按钮（左侧） */
.prev-btn {
	position: absolute;
	left: 80rpx;
	top: 35rpx;
	opacity: 0.9;
}

.prev-btn .control-btn-icon {
	width: 90rpx;
	height: 90rpx;
}

.prev-btn:active {
	opacity: 0.7;
}

/* 下一环节按钮（右侧） */
.next-btn {
	position: absolute;
	right: 80rpx;
	top: 35rpx;
	opacity: 0.9;
}

.next-btn .control-btn-icon {
	width: 90rpx;
	height: 90rpx;
}

.control-btn-text {
	margin-top: 12rpx;
	font-size: 22rpx;
	color: #FFFFFF;
	text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.5);
}

.next-btn:active {
	opacity: 0.7;
}

.exit-btn {
	position: absolute;
	bottom: 200rpx;
	left: 50%;
	transform: translateX(-50%);
	padding: 32rpx 80rpx;
	background-color: rgba(255, 255, 255, 0.95);
	border: none;
	border-radius: 50rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
}

.exit-btn:active {
	background-color: rgba(240, 240, 240, 0.95);
}

.exit-btn-text {
	font-size: 36rpx;
	color: #333333;
	font-weight: 600;
}
</style>
