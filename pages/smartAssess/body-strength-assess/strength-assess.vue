<!--
 * 力量评估页面 - 跳过步骤1（部位选择）
 * 功能：部位力量评估 - 训练部位选择
 * 结构：全屏背景图 + 浮层控件
 *
 * 评估定位（产品语义）：
 * - 这不是“检测用户绝对力量”，而是“标准阻力下的完成能力评估”
 * - 系统先按部位输出一个固定评估阻力，再根据用户拉绳峰值行程，映射出推荐训练值
 * - 最终输出 3 个结果：热身值、训练值、冲刺值
 *
 * 默认评估力量值（产品初始值 / 标准评估阻力，单位kg）：
 * - 肩部：15
 * - 胸部：20
 * - 背部：25
 * - 手臂：15
 * - 臀部：25
 * - 腿部：25
 *
 * 第一版伪算法：
 * 1. 用户选择部位后，系统读取该部位的默认评估力量值 baseForce
 * 2. 点击“开始评估”后，设备按 baseForce 输出固定阻力
 * 3. 用户完成一次标准拉绳动作
 * 4. 第一版只看本次动作的峰值行程 peakDistanceCm，不做姿态识别，不做稳定性识别
 * 5. 以 90cm 作为理论满行程，以 80cm 作为“完成标准动作”的主要判断基准
 * 6. 根据 peakDistanceCm 所在区间，先计算推荐训练值 trainingValue
 * 7. 再由训练值得到：
 *    - 热身值 warmupValue = trainingValue * 80%
 *    - 冲刺值 sprintValue = trainingValue 对应的更高档位建议
 * 8. 所有结果不显示小数，统一吸附到最近档位
 *
 * 行程区间规则（按峰值行程判断）：
 * - peakDistanceCm >= 80：
 *   说明可完整完成标准动作
 *   trainingValue = baseForce * 130%
 *   sprintValue = baseForce * 160%
 * - 60 <= peakDistanceCm < 80：
 *   说明大部分完成，当前阻力基本匹配
 *   trainingValue = baseForce * 100%
 *   sprintValue = baseForce * 125%
 * - 40 <= peakDistanceCm < 60：
 *   说明只能部分完成，当前阻力偏高
 *   trainingValue = baseForce * 80%
 *   sprintValue = baseForce * 100%
 * - 20 <= peakDistanceCm < 40：
 *   说明明显吃力，当前阻力过高
 *   trainingValue = baseForce * 60%
 *   sprintValue = baseForce * 80%
 * - peakDistanceCm < 20：
 *   说明几乎无法完成动作
 *   trainingValue = baseForce * 40%
 *   sprintValue = baseForce * 60%
 *
 * 热身值规则：
 * - warmupValue = trainingValue * 80%
 * - 热身值同样需要吸附到最近档位
 *
 * 档位吸附规则：
 * - 结果不显示小数，计算结束后统一吸附到最近档位
 * - 当前建议档位池：8 / 10 / 12 / 15 / 20 / 25 / 30（单位kg）
 * - 页面展示时输出：热身值 / 训练值 / 冲刺值
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
				label="第1-2次" 
				:values="strengthData.card1" 
				:maxValue="90"
				unit="CM"
			/>
			<StrengthBarCard 
				label="第3-4次" 
				:values="strengthData.card2" 
				:maxValue="90"
				unit="CM"
			/>
			<StrengthBarCard 
				label="第5-6次" 
				:values="strengthData.card3" 
				:maxValue="90"
				unit="CM"
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
			:nextPartId="nextPartId"
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
import CoachDetailModal from '@/components/coach/coach-detail-modal-vue.vue'
import StrengthBarCard from './components/strength-bar-card.vue'
import { getSelectedCoach, setSelectedCoach } from '@/utils/coachManager.js'
import {
	STRENGTH_ASSESS_STORAGE_KEY,
	getBodyParts,
	getDefaultStrengthOverview,
	PART_BASE_FORCE_MAP,
	buildStrengthResult
} from './strength-assess-config.js'

// ========== 串口通信服务 ==========
import { 
	on, 
	off, 
	startWorking, 
	stopForce,
	updateWorkingForce,
	sendOnce,
	isWorking,
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

// 部位数据
const bodyParts = ref(getBodyParts())
const selectedPartId = ref('shoulder')

// ========== 力量数据（3个卡片，每卡片2个柱子）==========
const strengthData = reactive({
	card1: [0, 0],  // 第一个卡片的两个力量条
	card2: [0, 0],  // 第二个卡片
	card3: [0, 0]   // 第三个卡片
})

// ========== 串口通信 ==========
const serialConnected = ref(false)
const isAssessing = ref(false)  // 是否正在评估中
const hasNextPart = computed(() => {
	const currentIndex = bodyParts.value.findIndex(part => part.id === selectedPartId.value)
	return currentIndex > -1 && currentIndex < bodyParts.value.length - 1
})
const nextPartId = computed(() => {
	const currentIndex = bodyParts.value.findIndex(part => part.id === selectedPartId.value)
	if (currentIndex === -1) {
		return bodyParts.value[0]?.id || 'shoulder'
	}
	return bodyParts.value[currentIndex + 1]?.id || bodyParts.value[currentIndex]?.id || 'shoulder'
})

const assessState = reactive({
	lastCount: null,
	currentPeakDistanceMm: 0,
	completedRepCount: 0,
	repDistancesCm: []
})

let completeModalTimer = null

const resetStrengthBars = () => {
	strengthData.card1[0] = 0
	strengthData.card1[1] = 0
	strengthData.card2[0] = 0
	strengthData.card2[1] = 0
	strengthData.card3[0] = 0
	strengthData.card3[1] = 0
}

const resetAssessState = () => {
	assessState.lastCount = null
	assessState.currentPeakDistanceMm = 0
	assessState.completedRepCount = 0
	assessState.repDistancesCm = []
	resetStrengthBars()
}

const clearFinishTimers = () => {
	if (completeModalTimer) {
		clearTimeout(completeModalTimer)
		completeModalTimer = null
	}
}

const applyAssessForce = (force, { seamless = false } = {}) => {
	if (seamless && isWorking()) {
		updateWorkingForce(force, 1)
		sendOnce(force, 1)
		console.log('[skip1] 无缝切换评估阻力:', force)
		return
	}

	startWorking(force, 1, 200)
	console.log('[skip1] 启动评估阻力:', force)
}

const setDistanceBarValue = (repIndex, distanceCm) => {
	const safeDistance = Math.max(0, Math.round(distanceCm))
	if (repIndex === 0) strengthData.card1[0] = safeDistance
	if (repIndex === 1) strengthData.card1[1] = safeDistance
	if (repIndex === 2) strengthData.card2[0] = safeDistance
	if (repIndex === 3) strengthData.card2[1] = safeDistance
	if (repIndex === 4) strengthData.card3[0] = safeDistance
	if (repIndex === 5) strengthData.card3[1] = safeDistance
}

const loadStoredOverview = () => {
	const stored = uni.getStorageSync(STRENGTH_ASSESS_STORAGE_KEY)
	if (stored && typeof stored === 'object') {
		return {
			...getDefaultStrengthOverview(),
			...stored
		}
	}
	return getDefaultStrengthOverview()
}

const saveCurrentPartResult = () => {
	const currentPartId = selectedPartId.value
	const peakDistanceCm = assessState.repDistancesCm.length
		? Math.max(...assessState.repDistancesCm)
		: 0
	const overview = loadStoredOverview()

	overview[currentPartId] = buildStrengthResult(
		currentPartId,
		peakDistanceCm,
		assessState.repDistancesCm
	)

	uni.setStorageSync(STRENGTH_ASSESS_STORAGE_KEY, overview)
	console.log('[skip1] 已保存部位评估结果:', currentPartId, overview[currentPartId])
}

const goToOverviewPage = () => {
	uni.redirectTo({
		url: '/pages/smartAssess/body-strength-assess/strength-result'
	})
}

const finishCurrentAssessment = () => {
	saveCurrentPartResult()
	clearFinishTimers()
	console.log('[skip1] 当前部位6次动作完成，1秒后弹出完成弹窗')

	completeModalTimer = setTimeout(() => {
		completeModalTimer = null
		showCompleteModal.value = true
		console.log('[skip1] 当前部位评估完成，已弹出完成弹窗，保持当前阻力等待下一步')
	}, 1000)
}

const commitRepPeakDistance = () => {
	if (assessState.completedRepCount >= 6) {
		return
	}

	const peakDistanceCm = assessState.currentPeakDistanceMm / 10
	setDistanceBarValue(assessState.completedRepCount, peakDistanceCm)
	assessState.repDistancesCm.push(peakDistanceCm)
	assessState.completedRepCount += 1
	assessState.currentPeakDistanceMm = 0

	console.log('[skip1] 记录动作峰值行程:', {
		rep: assessState.completedRepCount,
		peakDistanceCm: Math.round(peakDistanceCm)
	})

	if (assessState.completedRepCount >= 6) {
		finishCurrentAssessment()
	}
}

const moveToNextPart = ({ autoStart = false, seamless = false } = {}) => {
	if (!hasNextPart.value) {
		goToOverviewPage()
		return {
			navigatedToOverview: true,
			nextPartName: ''
		}
	}

	selectedPartId.value = nextPartId.value
	resetAssessState()
	console.log('[skip1] 切换到下一个部位:', selectedPartId.value)

	if (autoStart) {
		handleStartAssess({ silentToast: true, seamless })
	}

	return {
		navigatedToOverview: false,
		nextPartName: bodyParts.value.find(p => p.id === selectedPartId.value)?.name || ''
	}
}

// 处理接收到的帧数据
const handleFrame = (data) => {
	const frame = data.parsed
	
	if (frame.type === 'A9') {
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

		if (isAssessing.value) {
			const currentDistanceMm = Math.max(frame.left.distance, frame.right.distance, 0)
			const currentCount = Math.max(frame.left.count, frame.right.count)

			// 设备 count 是历史累计值，评估开始后的第一帧只用于建立本次基线。
			if (assessState.lastCount === null) {
				assessState.lastCount = currentCount
				assessState.currentPeakDistanceMm = 0
				console.log('[skip1] 建立评估次数基线:', currentCount)
				return
			}

			if (currentCount < assessState.lastCount) {
				assessState.lastCount = currentCount
				assessState.currentPeakDistanceMm = 0
				console.log('[skip1] 次数回退，重置评估次数基线:', currentCount)
				return
			}

			assessState.currentPeakDistanceMm = Math.max(
				assessState.currentPeakDistanceMm,
				currentDistanceMm
			)

			if (currentCount > assessState.lastCount) {
				const increment = currentCount - assessState.lastCount
				for (let i = 0; i < increment && assessState.completedRepCount < 6; i++) {
					commitRepPeakDistance()
				}
				assessState.lastCount = currentCount
			}
		}
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
// 当前流程：
// 1. 按部位读取默认评估阻力并启动工作状态
// 2. 首帧 A9 回包建立本次评估的历史 count 基线
// 3. 后续 A9 回包按左右手最大距离累计单次动作峰值
// 4. 当最大次数计数递增时，结算一次峰值行程并写入 6 个柱子之一
// 5. 6 次柱状图全部填满后，停止输出并弹出完成弹窗
const handleStartAssess = ({ silentToast = false, seamless = false } = {}) => {
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

	showCompleteModal.value = false
	clearFinishTimers()
	resetAssessState()

	const baseForce = PART_BASE_FORCE_MAP[selectedPartId.value] || 0
	
	// 首次开始时启动工作状态；跨部位自动开始时保持工作态并无缝改力。
	applyAssessForce(baseForce, { seamless })
	isAssessing.value = true
	
	if (!silentToast) {
		uni.showToast({
			title: `开始${bodyParts.value.find(p => p.id === selectedPartId.value)?.name || ''}评估`,
			icon: 'none'
		})
	}
	console.log('[skip1] 开始评估, force:', baseForce, 'seamless:', seamless)
}

// 清理串口资源
const cleanupSerial = () => {
	clearFinishTimers()

	// 取消订阅
	off('frame', handleFrame)
	
	// 停止工作状态（停止发送和轮询，但不断开连接）
	stopForce()
	isAssessing.value = false
	resetAssessState()
	
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

// 返回上一页
const goBack = () => {
	uni.navigateBack()
}

// 选择部位
const selectPart = (partId) => {
	if (isAssessing.value) {
		uni.showToast({
			title: '评估进行中，暂不可切换部位',
			icon: 'none'
		})
		return
	}

	selectedPartId.value = partId
	resetAssessState()
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
	clearFinishTimers()
	isAssessing.value = false
	const result = moveToNextPart({ autoStart: true, seamless: true })
	uni.showToast({
		title: result.navigatedToOverview ? '已进入评估总览' : `开始${result.nextPartName}评估`,
		icon: 'none'
	})
}

// 处理"取消"
const handleCancelNext = () => {
	console.log('点击取消')
	clearFinishTimers()
	stopForce()
	isAssessing.value = false
	goToOverviewPage()
}

// 处理倒计时结束
const handleTimeout = () => {
	console.log('倒计时结束，自动跳转')
	clearFinishTimers()
	isAssessing.value = false
	const result = moveToNextPart({ autoStart: true, seamless: true })
	uni.showToast({
		title: result.navigatedToOverview ? '已进入评估总览' : `自动开始${result.nextPartName}评估`,
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
