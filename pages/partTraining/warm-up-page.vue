<!--
 * 练前热身页面
 * 功能：课程开始前的热身指导，展示动态进度和AI教练建议
 * 结构：全屏背景图 + 返回按钮 + 进度条 + 气泡对话框 + 虚拟形象缩略图
 -->
<template>
	<view class="warm-up-page">
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
					<text class="control-btn-text">下一环节</text>
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
			<text class="title-text">练前热身</text>
		</view>
		
		<!-- 进度条（顶部下方） -->
		<view class="progress-section">
			<StepBar :totalSteps="12" :currentStep="currentStep" />
		</view>
		
		<!-- AI教练气泡对话框 -->
		<view class="coach-dialog-section">
			<BubbleDialogBox
				:roleLabel="coachRoleLabel"
				:avatarUrl="coachAvatarUrl"
				:badgeBackground="coachBadgeBackground"
				:text="currentWarmupTip"
				contentBackground="rgba(255, 255, 255, 0.85)"
				:showShadow="true"
				:clickable="true"
				@coach-click="openCoachModal"
			/>
		</view>
		
		<!-- 虚拟形象模拟缩略图（左下角） -->
		<view class="virtual-character-container">
			<!-- 左上角关闭按钮：直接使用静态资源 SVG，无背景容器 -->
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
		
		<!-- 测试按钮：跳过热身，直接进入下一页 -->
		<view v-if="SHOW_TEST_BUTTON" class="test-btn" @click="skipToNextPage">
			<text class="test-btn-text">跳过热身</text>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CommonBackButton from '@/components/ui-box/common-back-button.vue'
import StepBar from '@/components/ui-box/step-bar.vue'
import BubbleDialogBox from '@/components/ui-box/bubble-dialog-box.vue'
import CoachDetailModal from '@/components/modals/coach-detail-modal.vue'
import { getSelectedCoach, setSelectedCoach } from '@/utils/coachManager.js'

// ========== 测试开关：设置为 false 关闭测试按钮 ==========
const SHOW_TEST_BUTTON = ref(true)

// ========== 配置项 ==========
// 每段进度的时间间隔（毫秒），可在此修改
const STEP_INTERVAL_MS = 30000  // 默认 3 秒

// AI教练信息（响应式，从本地存储读取）
const selectedCoach = ref(null)
const coachRoleLabel = computed(() => selectedCoach.value?.fullName || 'Vince 艾斯')
const coachAvatarUrl = computed(() => selectedCoach.value?.avatar || '/static/icons/partTrainingActivity/AI_coach_Vince.png')
const coachBadgeBackground = computed(() => selectedCoach.value?.badgeBackground || 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)')

// 教练选择弹窗状态
const showCoachModal = ref(false)

// 打开教练选择弹窗
const openCoachModal = () => {
	clearProgressTimer()  // 暂停进度
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
	startProgressTimer()  // 恢复进度
}

// 热身建议列表（6个阶段，每个阶段对应2段进度条）
const warmupTips = [
	'1. 上半身保持竖直，膝盖不要弯曲',
	'2. 双手自然下垂，放松肩部肌肉',
	'3. 缓慢转动颈部，活动颈椎关节',
	'4. 深呼吸，吸气时腹部膨胀，呼气时收紧',
	'5. 轻轻扭动腰部，左右各转动3-5次',
	'6. 准备完成，即将开始正式训练！'
]

// ========== 响应式状态 ==========
const currentStep = ref(1)  // 当前进度（1-12）
let progressTimer = null    // 定时器引用

// 根据当前步骤计算对应的热身建议（每2步一个阶段）
const currentWarmupTip = computed(() => {
	const stageIndex = Math.ceil(currentStep.value / 2) - 1  // 0-5
	return warmupTips[stageIndex] || warmupTips[0]
})

// ========== 生命周期 ==========
onMounted(() => {
	// 读取选中的教练信息
	selectedCoach.value = getSelectedCoach()
	console.log('当前选中的教练:', selectedCoach.value)
	
	startProgressTimer()
})

// 页面显示时重置并重新开始计时
onShow(() => {
	resetProgress()
	startProgressTimer()
})

onBeforeUnmount(() => {
	clearProgressTimer()
})

// ========== 进度控制函数 ==========
// 开始进度计时
const startProgressTimer = () => {
	clearProgressTimer()  // 先清除旧定时器
	
	progressTimer = setInterval(() => {
		if (currentStep.value < 12) {
			currentStep.value++
		} else {
			// 进度完成，自动跳转到下一页
			clearProgressTimer()
			navigateToNextPage()
		}
	}, STEP_INTERVAL_MS)
}

// 清除定时器
const clearProgressTimer = () => {
	if (progressTimer) {
		clearInterval(progressTimer)
		progressTimer = null
	}
}

// 重置进度
const resetProgress = () => {
	currentStep.value = 1
}

// ========== 页面跳转 ==========
// 跳转到下一页：调整器械
const navigateToNextPage = () => {
	uni.navigateTo({
		url: '/pages/partTraining/adjust-equipment'  
	})
}

// 测试按钮：跳过热身
const skipToNextPage = () => {
	clearProgressTimer()
	navigateToNextPage()
}

// 关闭虚拟形象模拟
const closeVirtualCharacter = () => {
	console.log('关闭虚拟形象模拟')
	// TODO: 可以添加隐藏逻辑或其他交互
	uni.showToast({
		title: '功能开发中',
		icon: 'none'
	})
}

// ========== 控制面板逻辑 ==========
const isControlPanelVisible = ref(false)

// 显示控制面板（暂停进度）
const showControlPanel = () => {
	isControlPanelVisible.value = true
	clearProgressTimer()  // 暂停进度
}

// 隐藏控制面板（继续进度）
const hideControlPanel = () => {
	isControlPanelVisible.value = false
	startProgressTimer()  // 恢复进度
}

// 继续播放
const handleContinue = () => {
	hideControlPanel()
}

// 上一训练环节（返回课程详情）
const handlePrevStep = () => {
	isControlPanelVisible.value = false
	clearProgressTimer()
	uni.navigateBack({
		delta: 1
	})
}

// 下一训练环节（调整器械）
const handleNextStep = () => {
	isControlPanelVisible.value = false
	clearProgressTimer()
	navigateToNextPage()
}

// 退出训练
const handleExitTraining = () => {
	isControlPanelVisible.value = false
	clearProgressTimer()
	uni.navigateBack({
		delta: 2  // 返回两级（跳过课程详情页，回到课程列表）
	})
}
</script>

<style scoped lang="scss">
/* ========== 页面容器（全屏背景） ========== */
.warm-up-page {
	position: relative;
	width: 100%;
	min-height: 100vh;
	overflow: hidden;
	background-color: #000000;  /* 背景色兜底 */
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

/* ========== 返回按钮（浮层） ========== */
.back-btn-position {
	position: absolute;
	left: 24rpx;
	top: 24rpx;
	z-index: 100;
}

/* ========== 标题（浮层） ========== */
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

/* ========== 进度条区域（浮层） ========== */
.progress-section {
	position: absolute;
	top: 120rpx;
	left: 24rpx;
	right: 24rpx;
	z-index: 90;
}

/* ========== AI教练气泡对话框（浮层） ========== */
.coach-dialog-section {
	position: absolute;
	top: 140rpx;
	left: 24rpx;
	right: 200rpx;  /* 右侧留白，避免遮挡人物 */
	z-index: 80;
}

/* ========== 虚拟形象模拟容器（左下角矩形） ========== */
.virtual-character-container {
	position: absolute;  /* 相对于页面定位 */
	left: 24rpx;
	bottom: 200rpx;       /* 距离底部的距离 */
	z-index: 70;         /* 保证在进度条和气泡对话框下方 */
	width: 140rpx;
	padding: 20rpx;
	background-color: rgba(255, 255, 255, 0.4);  /* 40% 不透明度 */
	backdrop-filter: blur(10rpx);
	border-radius: 16rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
	display: flex;
	flex-direction: column;
	align-items: center;
	/* 注意：这里不能再写 position: relative，会覆盖上面的 absolute */
	/* 关闭按钮的 absolute 定位会自动找到最近的非 static 祖先元素（这里就是自己的 absolute） */
}

/* 左上角关闭按钮（纯 SVG，无背景容器） */
.close-btn-svg {
	position: absolute;
	top: 8rpx;
	left: 8rpx;
	z-index: 10;
	width: 18rpx;
	height: 18rpx;
	cursor: pointer;
	user-select: none;
}

.close-btn-svg:active {
	opacity: 0.7;
}

/* 居中标题文字 */
.virtual-title {
	font-size: 18rpx;
	font-weight: 600;
	color: #333333;
	text-align: center;
	margin-bottom: 12rpx;
}

/* 人物图片 */
.virtual-character-image {
	width: 140rpx;
	height: 140rpx;
}

/* ========== 测试按钮（进度条下方） ========== */
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

/* 按钮组容器 - 水平排列，继续按钮居中 */
.control-buttons {
	position: relative;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	width: 100%;
}

/* 通用控制按钮样式 */
.control-btn {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

/* 继续播放按钮（居中，大图标） */
.continue-btn {
	position: relative;
}

.continue-btn .control-btn-icon {
	width: 160rpx;
	height: 160rpx;
}

/* 下一环节按钮（右侧，小图标） */
.next-btn {
	position: absolute;
	right: 80rpx;
	/* continue图标160rpx，中心80rpx；next图标90rpx，中心45rpx */
	/* 要让图标中心对齐：top = 80 - 45 = 35rpx */
	top: 35rpx;
	opacity: 0.9;
}

.next-btn .control-btn-icon {
	width: 90rpx;
	height: 90rpx;
}

/* 按钮文字 */
.control-btn-text {
	margin-top: 12rpx;
	font-size: 22rpx;
	color: #FFFFFF;
	text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.5);
}

.next-btn:active {
	opacity: 0.7;
}

/* 退出训练按钮（底部） */
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
