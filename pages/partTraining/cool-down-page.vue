<!--
 * 练后拉伸页面
 * 功能：训练结束后的拉伸指导，展示动态进度和AI教练建议
 * 结构：全屏背景图 + 返回按钮 + 进度条 + 气泡对话框 + 虚拟形象缩略图
 -->
<template>
	<view class="cool-down-page">
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
					<text class="control-btn-text">正式训练</text>
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
					<text class="control-btn-text">训练完成</text>
				</view>
			</view>
			
			<!-- 退出训练按钮（底部居中） -->
			<view class="exit-btn" @click.stop="handleExitTraining">
				<text class="exit-btn-text">退出训练</text>
			</view>
		</view>
		
		<!-- 返回按钮（左上角浮层） -->
		<CommonBackButton class="back-btn-position" :useDefault="false" @click="handleBack" />
		
		<!-- 标题（顶部居中） -->
		<view class="header-title">
			<text class="title-text">练后拉伸</text>
		</view>
		
		<!-- 进度条（顶部下方） -->
		<view class="progress-section">
			<StepBar :totalSteps="12" :currentStep="currentStep" />
		</view>
		
		<!-- AI教练气泡对话框 -->
		<view class="coach-dialog-section">
			<CoachBox
				:text="currentStretchTip"
				@modal-open="handleCoachModalOpen"
				@modal-close="handleCoachModalClose"
				@coach-changed="handleCoachChanged"
			></CoachBox>
		</view>
		
		<!-- 虚拟形象模拟缩略图（左下角） -->
		<view class="virtual-character-container">
			<!-- 左上角关闭按钮 -->
			<image 
				class="close-btn-svg" 
				src="/static/icons/general/btn_general_close.svg" 
				mode="aspectFit"
				@click="closeVirtualCharacter"
			/>
			
			<!-- 居中标题文字 -->
			<text class="virtual-title">虚拟形象模拟</text>
			
			<!-- 人物图片 -->
			<image 
				class="virtual-character-image" 
				src="/static/icons/partTrainingActivity/startTraining/virtual-character.png" 
				mode="aspectFit"
			/>
		</view>
		
		<!-- 测试按钮：跳过拉伸，直接完成 -->
		<view v-if="SHOW_TEST_BUTTON" class="test-btn" @click="skipToComplete">
			<text class="test-btn-text">跳过拉伸</text>
		</view>
		
		<!-- 训练完成弹窗 -->
		<TrainingCompleteWindow
			v-model:visible="isFinishModalVisible"
			@confirm="closeFinishModal"
		/>
		
	</view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CommonBackButton from '@/components/ui-box/common-back-button.vue'
import StepBar from '@/components/ui-box/step-bar.vue'
import CoachBox from '@/components/coach/coach-box-entry.vue'
import TrainingCompleteWindow from '@/components/modals/training-complete-window.vue'
import { navigateBackOrReLaunch, navigateBackToRoute } from '@/utils/navigation.js'

// ========== 测试开关 ==========
const SHOW_TEST_BUTTON = ref(true)

// ========== 配置项 ==========
const STEP_INTERVAL_MS = 30000  // 每段进度的时间间隔（毫秒）

// 教练弹窗打开时暂停进度，关闭后恢复，避免用户切换教练时计时继续流逝。
const handleCoachModalOpen = () => {
	clearProgressTimer()  // 暂停进度
}

const handleCoachModalClose = () => {
	startProgressTimer()
}

const handleCoachChanged = (coachData) => {
	uni.showToast({
		title: `已切换为${coachData.label}`,
		icon: 'success'
	})
}

// 拉伸建议列表（6个阶段，每个阶段对应2段进度条）
const stretchTips = [
	'上半身保持竖直，尽量不要耸肩',
	'慢慢放松肌肉，深呼吸',
	'保持拉伸姿势15-30秒',
	'感受肌肉的舒展，不要过度用力',
	'左右两侧均匀拉伸',
	'拉伸完成，辛苦了！'
]

// ========== 响应式状态 ==========
const currentStep = ref(1)  // 当前进度（1-12）
let progressTimer = null    // 定时器引用
const isFinishModalVisible = ref(false)  // 训练完成弹窗是否可见

// 根据当前步骤计算对应的拉伸建议（每2步一个阶段）
const currentStretchTip = computed(() => {
	const stageIndex = Math.ceil(currentStep.value / 2) - 1  // 0-5
	return stretchTips[stageIndex] || stretchTips[0]
})

// ========== 生命周期 ==========
onMounted(() => {
	startProgressTimer()
})

onShow(() => {
	resetProgress()
	startProgressTimer()
})

onBeforeUnmount(() => {
	clearProgressTimer()
})

// ========== 进度控制函数 ==========
const startProgressTimer = () => {
	clearProgressTimer()
	
	progressTimer = setInterval(() => {
		if (currentStep.value < 12) {
			currentStep.value++
		} else {
			clearProgressTimer()
			navigateToComplete()
		}
	}, STEP_INTERVAL_MS)
}

const clearProgressTimer = () => {
	if (progressTimer) {
		clearInterval(progressTimer)
		progressTimer = null
	}
}

const resetProgress = () => {
	currentStep.value = 1
}

// ========== 控制面板 ==========
const isControlPanelVisible = ref(false)

const showControlPanel = () => {
	isControlPanelVisible.value = true
	clearProgressTimer()
}

const hideControlPanel = () => {
	isControlPanelVisible.value = false
	startProgressTimer()
}

const handleContinue = () => {
	hideControlPanel()
}

const handlePrevStep = () => {
	isControlPanelVisible.value = false
	clearProgressTimer()
	navigateBackToRoute('/pages/partTraining/formal-training', '/pages/partTraining/part-training')
}

const handleNextStep = () => {
	isControlPanelVisible.value = false
	clearProgressTimer()
	navigateToComplete()
}

const handleExitTraining = () => {
	isControlPanelVisible.value = false
	clearProgressTimer()
	navigateBackToRoute('/pages/partTraining/part-training')
}

// ========== 训练完成弹窗 ==========
const navigateToComplete = () => {
	// 显示训练完成弹窗
	isFinishModalVisible.value = true
}

const closeFinishModal = () => {
	isFinishModalVisible.value = false
	navigateBackToRoute('/pages/partTraining/part-training')
}

const skipToComplete = () => {
	clearProgressTimer()
	navigateToComplete()
}

const handleBack = () => {
	if (isFinishModalVisible.value) {
		isFinishModalVisible.value = false
		return
	}
	clearProgressTimer()
	navigateBackOrReLaunch('/pages/partTraining/part-training')
}

// 关闭虚拟形象模拟
const closeVirtualCharacter = () => {
	uni.showToast({
		title: '功能开发中',
		icon: 'none'
	})
}
</script>

<style scoped lang="scss">
/* ========== 页面容器 ========== */
.cool-down-page {
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
	top: 140rpx;
	left: 24rpx;
	right: 200rpx;
	z-index: 80;
}

/* ========== 虚拟形象缩略图 ========== */
.virtual-character-container {
	position: absolute;
	left: 24rpx;
	bottom: 200rpx;
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

/* ========== 测试按钮 ========== */
.test-btn {
	position: absolute;
	top: 180rpx;
	right: 30rpx;
	z-index: 200;
	padding: 16rpx 28rpx;
	border-radius: 30rpx;
	background: linear-gradient(135deg, #FF6B6B, #FF8E53);
	box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.4);
	display: flex;
	align-items: center;
	justify-content: center;
}

.test-btn:active {
	transform: scale(0.95);
}

.test-btn-text {
	font-size: 24rpx;
	font-weight: bold;
	color: #FFFFFF;
	text-align: center;
	line-height: 1.3;
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

/* 退出训练按钮 */
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

/* ========== 训练完成弹窗（由 TrainingCompleteWindow 组件负责样式） ========== */
</style>
