<!--
 * 力量评估页面 - 跳过步骤1（部位选择）
 * 功能：部位力量评估 - 训练部位选择
 * 结构：全屏背景图 + 浮层控件
 -->
<template>
	<view class="page">
		<!-- 全屏背景图 -->
		<image 
			class="background-image" 
			src="/static/icons/smartAssessActivity/li-liang/bg_powerful_Girl.png" 
			mode="aspectFill"
		/>
		
		<!-- 自定义导航栏（浮在背景上） -->
		<view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<view class="back-btn" @click="goBack">
					<image 
						class="back-icon" 
						src="/static/icons/smartAssessActivity/li-liang/btn_back.svg" 
						mode="aspectFit"
					/>
				</view>
				<text class="nav-title">力量评估</text>
			</view>
		</view>
		
		<!-- AI教练气泡对话框 -->
		<view class="coach-dialog-section" :style="{ top: (statusBarHeight + 88) + 'px' }">
			<BubbleDialogBox
				:roleLabel="coachRoleLabel"
				:avatarUrl="coachAvatarUrl"
				:badgeBackground="coachBadgeBackground"
				text="点击我可以切换AI教练哦~"
				contentBackground="rgba(255, 255, 255, 0.85)"
				:showShadow="true"
				:clickable="true"
				@coach-click="openCoachModal"
			/>
		</view>
		
		<!-- 开发调试数据看板（仅开发阶段使用，右下角） -->
		<view v-if="DEBUG_PANEL_VISIBLE" class="debug-panel">
			<text class="debug-title">📊 Debug Panel</text>
			<view class="debug-row">
				<text class="debug-label">设定力量:</text>
				<text class="debug-value">{{ debugData.setForce }} kg</text>
			</view>
			<view class="debug-row">
				<text class="debug-label">力量模式:</text>
				<text class="debug-value">{{ debugData.setForceMode }} ({{ debugData.setForceModeText }})</text>
			</view>
			<view class="debug-row">
				<text class="debug-label">左手次数:</text>
				<text class="debug-value">{{ debugData.leftCount }}</text>
			</view>
			<view class="debug-row">
				<text class="debug-label">左手力量:</text>
				<text class="debug-value">{{ debugData.leftForce }} kg</text>
			</view>
			<view class="debug-row">
				<text class="debug-label">右手次数:</text>
				<text class="debug-value">{{ debugData.rightCount }}</text>
			</view>
			<view class="debug-row">
				<text class="debug-label">右手力量:</text>
				<text class="debug-value">{{ debugData.rightForce }} kg</text>
			</view>
		</view>
		
		<!-- 力量柱状图区域（下一行，均匀分布） -->
		<view class="strength-bars-section" :style="{ top: (statusBarHeight + 88 + 160) + 'px' }">
			<StrengthBarCard 
				label="最大值" 
				:values="strengthData.card1" 
				:maxValue="100" 
			/>
			<StrengthBarCard 
				label="最大值" 
				:values="strengthData.card2" 
				:maxValue="100" 
			/>
			<StrengthBarCard 
				label="最大值" 
				:values="strengthData.card3" 
				:maxValue="100" 
			/>
		</view>
		
		<!-- 视频/图片缩略图区域 -->
		<view class="thumbnail-section">
			<view class="thumbnail-container" @click="handleThumbnailClick">
				<!-- 图片（后期可换成 video） -->
				<image 
					class="thumbnail-content"
					src="/static/icons/smartAssessActivity/li-liang/pic_thumbnail_image.jpg"
					mode="aspectFill"
				/>
				<!-- 播放按钮图标（右下角） -->
				<view class="play-icon">
					<image 
						class="play-icon-img" 
						src="/static/icons/general/btn_playing.svg" 
						mode="aspectFit"
					/>
				</view>
			</view>
		</view>
		
		<!-- 开始评估按钮（居中） -->
		<view class="start-btn-section">
			<view 
				class="start-assess-btn" 
				:class="{ 'btn-disabled': isAssessing }"
				@click="handleStartAssess"
			>
				<text class="start-btn-text">{{ isAssessing ? '评估中...' : '开始评估' }}</text>
			</view>
		</view>
		
		<!-- 部位选择区域 -->
		<view class="body-parts-section">
			<!-- 左侧主按钮 -->
			<view class="parts-main-btn">
				<text class="parts-main-text">部位</text>
				<text class="parts-main-text">选择</text>
			</view>
			
			<!-- 右侧部位列表 -->
			<scroll-view class="parts-scroll" scroll-x :show-scrollbar="false">
				<view class="parts-list">
					<view 
						v-for="part in bodyParts" 
						:key="part.id"
						class="part-item"
						:class="{ 'part-active': selectedPartId === part.id }"
						@click="selectPart(part.id)"
					>
						<image class="part-icon" :src="part.icon" mode="aspectFit" />
						<text class="part-name">{{ part.name }}</text>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 评估完成弹窗 -->
		<AssessmentCompleteModal 
			v-model:visible="showCompleteModal"
			:currentPartId="selectedPartId"
			nextPartId="chest"
			:countdownSeconds="5"
			@start="handleStartNext"
			@cancel="handleCancelNext"
			@timeout="handleTimeout"
		/>
		
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
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AssessmentCompleteModal from '@/components/modals/assessment-complete-modal.vue'
import BubbleDialogBox from '@/components/ui-box/bubble-dialog-box.vue'
import CoachDetailModal from '@/components/modals/coach-detail-modal.vue'
import StrengthBarCard from './components/strength-bar-card.vue'
import { getSelectedCoach, setSelectedCoach } from '@/utils/coachManager.js'

// ========== 串口通信服务 ==========
import { 
	on, 
	off, 
	startWorking, 
	stopWorking,
	updateWorkingForce,
	getStatus 
} from '@/utils/serialService.js'

// ========== 开发调试开关 ==========
const DEBUG_PANEL_VISIBLE = true  // 【开关】true=显示调试面板, false=隐藏

// 调试数据（从串口回包中提取）
const debugData = reactive({
	setForce: 0,           // 设定力量
	setForceMode: 0,       // 力量模式
	setForceModeText: '关闭',
	leftCount: 0,          // 左手次数
	leftForce: 0,          // 左手力量
	rightCount: 0,         // 右手次数
	rightForce: 0          // 右手力量
})

// 获取系统状态栏高度
const statusBarHeight = ref(0)

onMounted(() => {
	const systemInfo = uni.getSystemInfoSync()
	statusBarHeight.value = systemInfo.statusBarHeight || 0
	
	// 初始化教练信息
	selectedCoach.value = getSelectedCoach()
	
	// 初始化串口连接
	initSerial()
})

// 页面显示时刷新教练信息（从其他页面切换回来时）
onShow(() => {
	selectedCoach.value = getSelectedCoach()
})

// 页面卸载时清理串口资源
onBeforeUnmount(() => {
	cleanupSerial()
})

// 弹窗控制
const showCompleteModal = ref(false)

// ========== AI教练信息 ==========
const selectedCoach = ref(null)
const coachRoleLabel = computed(() => selectedCoach.value?.fullName || 'Vince(艾斯)')
const coachAvatarUrl = computed(() => selectedCoach.value?.avatar || '/static/icons/partTrainingActivity/AI_coach_Vince.png')
const coachBadgeBackground = computed(() => selectedCoach.value?.badgeBackground || 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)')

// 教练选择弹窗状态
const showCoachModal = ref(false)

// ========== 力量数据（3个卡片，每卡片2个柱子）==========
const strengthData = reactive({
	card1: [0, 0],  // 第一个卡片的两个力量条
	card2: [0, 0],  // 第二个卡片
	card3: [0, 0]   // 第三个卡片
})

// ========== 串口通信 ==========
const serialConnected = ref(false)
const isAssessing = ref(false)  // 是否正在评估中

// 处理接收到的帧数据
const handleFrame = (data) => {
	const frame = data.parsed
	
	if (frame.type === 'A9') {
		// 更新力量柱状图数据
		strengthData.card1[0] = frame.left.instantForce
		strengthData.card1[1] = frame.right.instantForce
		
		// 更新调试面板数据
		if (DEBUG_PANEL_VISIBLE) {
			debugData.setForce = frame.setForce
			debugData.setForceMode = frame.setForceMode
			debugData.setForceModeText = frame.setForceModeText
			debugData.leftCount = frame.left.count
			debugData.leftForce = frame.left.instantForce
			debugData.rightCount = frame.right.count
			debugData.rightForce = frame.right.instantForce
		}
		
		console.log('[skip1] 收到力量数据:', 
			'左手', frame.left.instantForce, 'kg',
			'右手', frame.right.instantForce, 'kg'
		)
	}
}

// 初始化串口通信（连接已在 App.vue 中完成，这里只需订阅事件）
const initSerial = () => {
	// 订阅帧事件
	on('frame', handleFrame)
	
	// 检查连接状态
	const status = getStatus()
	if (status.isConnected) {
		serialConnected.value = true
		console.log('[skip1] 串口已连接，等待用户点击开始评估')
	} else {
		console.warn('[skip1] 串口未连接，请检查 App.vue 初始化')
	}
}

// 处理开始评估按钮点击
/**
 * TODO: 评估流程待完善
 * 1. 开始评估按钮是通信开启的开关，页面创建时不会尝试建立连接而是检查连接状态
 * 2. 不会直接开始串口通信而是等待开始评估按钮这个开关打开
 * 3. 打开之后的通信逻辑还没有添加（如何填满三组柱状图）
 * 4. 结束标志也没有添加（何时认为评估完成、如何触发完成弹窗）
 */
const handleStartAssess = () => {
	if (isAssessing.value) {
		console.log('[skip1] 已在评估中，忽略重复点击')
		return
	}
	
	if (!serialConnected.value) {
		uni.showToast({
			title: '设备未连接',
			icon: 'none'
		})
		return
	}
	
	// 启动工作状态：周期发送指令 + 轮询读取
	// 参数：力量值(kg), 力量模式(1=恒力), 发送间隔(ms)
	startWorking(0, 1, 200)
	isAssessing.value = true
	
	uni.showToast({
		title: `开始${bodyParts.value.find(p => p.id === selectedPartId.value)?.name || ''}评估`,
		icon: 'none'
	})
	console.log('[skip1] 开始评估，已启动串口工作状态')
}

// 清理串口资源
const cleanupSerial = () => {
	// 取消订阅
	off('frame', handleFrame)
	
	// 停止工作状态（停止发送和轮询，但不断开连接）
	stopWorking()
	isAssessing.value = false
	
	console.log('[skip1] 串口资源已清理')
}

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

// 部位数据
const bodyParts = ref([
	{ id: 'shoulder', name: '肩部', icon: '/static/icons/smartAssessActivity/li-liang/ic_muscle_shoulder.svg' },
	{ id: 'chest', name: '胸部', icon: '/static/icons/smartAssessActivity/li-liang/ic_muscle_chest.svg' },
	{ id: 'back', name: '背部', icon: '/static/icons/smartAssessActivity/li-liang/ic_muscle_back.svg' },
	{ id: 'arm', name: '手臂', icon: '/static/icons/smartAssessActivity/li-liang/ic_muscle_arm.svg' },
	{ id: 'hip', name: '臀部', icon: '/static/icons/smartAssessActivity/li-liang/ic_muscle_hip.svg' },
	{ id: 'leg', name: '腿部', icon: '/static/icons/smartAssessActivity/li-liang/ic_muscle_leg.svg' }
])
const selectedPartId = ref('shoulder')

// 返回上一页
const goBack = () => {
	uni.navigateBack()
}

// 选择部位
const selectPart = (partId) => {
	selectedPartId.value = partId
	console.log('选中部位:', partId)
	
	uni.showToast({
		title: `已选择${bodyParts.value.find(p => p.id === partId).name}`,
		icon: 'none'
	})
}

// 点击缩略图（后期可播放视频）
const handleThumbnailClick = () => {
	console.log('点击缩略图')
	// TODO: 后期换成视频播放逻辑
	uni.showToast({
		title: '视频功能开发中',
		icon: 'none'
	})
}

// ========== 弹窗事件处理 ==========
// 处理"直接开始"
const handleStartNext = (data) => {
	console.log('点击直接开始:', data)
	uni.showToast({
		title: `开始${bodyParts.value.find(p => p.id === data.nextPartId)?.name || ''}评估`,
		icon: 'none'
	})
}

// 处理"取消"
const handleCancelNext = () => {
	console.log('点击取消')
	uni.showToast({
		title: '已取消跳转',
		icon: 'none'
	})
}

// 处理倒计时结束
const handleTimeout = () => {
	console.log('倒计时结束，自动跳转')
	uni.showToast({
		title: '自动跳转下一部位',
		icon: 'none'
	})
}
</script>

<style scoped lang="scss">
@import '@/uni.scss';

/* ========== 页面容器（全屏背景） ========== */
.page {
	position: relative;
	width: 100%;
	min-height: 100vh;
	overflow: hidden;
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

/* ========== 自定义导航栏（浮层） ========== */
.custom-nav {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
	background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0) 100%);
}

.nav-content {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 88rpx;
	padding: 0 30rpx;
}

.back-btn {
	position: absolute;
	left: 30rpx;
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	background-color: rgba(66, 66, 66, 0.8);
	display: flex;
	align-items: center;
	justify-content: center;
	transition: opacity 0.2s;
	backdrop-filter: blur(10rpx);
}

.back-btn:active {
	opacity: 0.7;
}

.back-icon {
	width: 40rpx;
	height: 40rpx;
}

.nav-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #FFFFFF;
	text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
}

/* ========== AI教练气泡区域 ========== */
.coach-dialog-section {
	position: absolute;
	left: 24rpx;
	max-width: 400rpx;
	z-index: 80;
}

/* ========== 开发调试数据看板（右下角） ========== */
.debug-panel {
	position: absolute;
	right: 24rpx;
	bottom: 250rpx;
	z-index: 90;
	background: rgba(0, 0, 0, 0.7);
	border-radius: 12rpx;
	padding: 10rpx 14rpx;
	backdrop-filter: blur(8rpx);
}

.debug-title {
	font-size: 18rpx;
	font-weight: bold;
	color: #00FF88;
	margin-bottom: 6rpx;
	display: block;
}

.debug-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 3rpx 0;
	gap: 16rpx;
}

.debug-label {
	font-size: 18rpx;
	color: rgba(255, 255, 255, 0.6);
}

.debug-value {
	font-size: 18rpx;
	font-weight: 600;
	color: #00FF88;
	font-family: 'Courier New', monospace;
}

/* ========== 力量柱状图区域（均匀分布） ========== */
.strength-bars-section {
	position: absolute;
	left: 80rpx;
	right: 80rpx;
	z-index: 80;
	display: flex;
	justify-content: space-between;
}

/* ========== 视频/图片缩略图区域 ========== */
.thumbnail-section {
	position: absolute;
	left: 24rpx;
	bottom: 250rpx;
	z-index: 80;
}

.thumbnail-container {
	position: relative;
	width: 280rpx;
	height: 180rpx;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

.thumbnail-content {
	width: 100%;
	height: 100%;
}

/* 播放按钮 - 右下角 */
.play-icon {
	position: absolute;
	bottom: 12rpx;
	right: 12rpx;
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.play-icon-img {
	width: 100%;
	height: 100%;
}

/* ========== 开始评估按钮区域 ========== */
.start-btn-section {
	position: absolute;
	bottom: 140rpx;
	left: 0;
	right: 0;
	z-index: 86;
	display: flex;
	justify-content: center;
	padding: 0 24rpx;
}

.start-assess-btn {
	width: 400rpx;
	height: 88rpx;
	background: linear-gradient(135deg, #00C853 0%, #00E676 50%, #69F0AE 100%);
	border-radius: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(0, 200, 83, 0.4);
	transition: all 0.3s;
}

.start-assess-btn:active {
	transform: scale(0.95);
	box-shadow: 0 4rpx 12rpx rgba(0, 200, 83, 0.3);
}

.start-assess-btn.btn-disabled {
	background: linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 100%);
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
}

.start-btn-text {
	font-size: 32rpx;
	font-weight: bold;
	color: #FFFFFF;
	letter-spacing: 4rpx;
}

/* ========== 部位选择区域（浮层） ========== */
.body-parts-section {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 85;
	display: flex;
	align-items: stretch;
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20rpx);
	padding: 16rpx;
	gap: 12rpx;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.parts-main-btn {
	width: 90rpx;
	height: 90rpx;
	background: linear-gradient(135deg, #00C853, #4CAF50);
	border-radius: 16rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 4rpx;
	flex-shrink: 0;
}

.parts-main-text {
	font-size: 28rpx;
	font-weight: bold;
	color: #FFFFFF;
	line-height: 1.2;
}

.parts-scroll {
	flex: 1;
	white-space: nowrap;
}

.parts-list {
	display: inline-flex;
	gap: 12rpx;
}

.part-item {
	display: inline-flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 90rpx;
	height: 90rpx;
	border-radius: 16rpx;
	background-color: $light-grey;
	transition: all 0.3s;
}

.part-item:active {
	transform: scale(0.95);
}

.part-item.part-active {
	background: linear-gradient(135deg, #00C853, #4CAF50);
	box-shadow: 0 4rpx 12rpx rgba(0, 200, 83, 0.3);
}

.part-icon {
	width: 48rpx;
	height: 48rpx;
	margin-bottom: 6rpx;
}

.part-name {
	font-size: 22rpx;
	color: #333333;
	font-weight: 500;
}

.part-item.part-active .part-name {
	color: #FFFFFF;
	font-weight: bold;
}
</style>
