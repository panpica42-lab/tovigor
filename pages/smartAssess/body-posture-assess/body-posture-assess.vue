<!--
 * 体态姿势评估页面
 * 功能：通过 AI 拍摄进行人体体态姿势全方位分析
 -->
<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="header">
			<CommonBackButton class="back-btn-position" />
			<text class="header-title">体态姿势</text>
		</view>
		
		<!-- 胶囊进度条 -->
		<view class="progress-section">
			<StepBar :totalSteps="totalSteps" :currentStep="currentStep" />
		</view>
		
		<!-- 内容区域 -->
		<view class="content">
			<view class="assess-card">
				<!-- 评估标题 -->
				<text class="assess-title">{{ currentPhase.title }}</text>
				
				<!-- AI教练气泡对话框 -->
				<BubbleDialogBox
					:roleLabel="coachRoleLabel"
					:avatarUrl="coachAvatarUrl"
					:badgeBackground="coachBadgeBackground"
					:text="currentPhase.tip"
					contentBackground="rgba(255, 255, 255, 0.85)"
					:showShadow="true"
					:clickable="true"
					@coach-click="openCoachModal"
					class="bubble-tip"
				/>
				
				<!-- 人体姿势图 -->
				<view class="posture-image-wrapper">
					<image 
						class="posture-image" 
						:src="currentPhase.image" 
						mode="aspectFit"
					/>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import CommonBackButton from '@/components/ui-box/common-back-button.vue'
import StepBar from '@/components/ui-box/step-bar.vue'
import BubbleDialogBox from '@/components/ui-box/bubble-dialog-box.vue'
import CoachDetailModal from '@/components/coach/coach-detail-modal-vue.vue'
import { getSelectedCoach, setSelectedCoach } from '@/utils/coachManager.js'

// ========== 评估流程配置 ==========
// 四组评估，每组 3 个胶囊，顺序：正面 → 左侧 → 右侧 → 正面
const PHASES = [
	{
		title: '正面评估',
		tip: '面向镜头，平视前方，身体站直，双臂自然下垂',
		image: '/static/icons/smartAssessActivity/ti-tai/human_silhouette-front.png'
	},
	{
		title: '左侧评估',
		tip: '向左转，平视前方，身体站直，双臂自然下垂',
		image: '/static/icons/smartAssessActivity/ti-tai/human_silhouette-left.png'
	},
	{
		title: '右侧评估',
		tip: '向右转，平视前方，身体站直，双臂自然下垂',
		image: '/static/icons/smartAssessActivity/ti-tai/human_silhouette-right.png'
	},
	{
		title: '背面评估',
		tip: '转身背对镜头，身体站直，双臂自然下垂',
		image: '/static/icons/smartAssessActivity/ti-tai/human_silhouette-front.png'
	}
]

const STEP_INTERVAL = 5000    // 每个胶囊 5 秒
const STEPS_PER_PHASE = 3     // 每组 3 个胶囊

// ========== 进度条 ==========
const totalSteps = ref(12)
const currentStep = ref(0)

// 当前阶段（根据胶囊进度自动计算）
const currentPhase = computed(() => {
	const phaseIndex = Math.min(Math.floor(currentStep.value / STEPS_PER_PHASE), PHASES.length - 1)
	return PHASES[phaseIndex]
})

// ========== 定时器 ==========
let stepTimer = null

const startAssessment = () => {
	currentStep.value = 0
	stepTimer = setInterval(() => {
		if (currentStep.value < totalSteps.value) {
			currentStep.value++
		} else {
			// 全部完成
			clearInterval(stepTimer)
			stepTimer = null
			handleAssessComplete()
		}
	}, STEP_INTERVAL)
}

const stopAssessment = () => {
	if (stepTimer) {
		clearInterval(stepTimer)
		stepTimer = null
	}
}

const handleAssessComplete = () => {
	uni.showToast({
		title: '体态评估完成',
		icon: 'success'
	})
}

// ========== AI教练信息 ==========
const selectedCoach = ref(getSelectedCoach())
const coachRoleLabel = computed(() => selectedCoach.value?.fullName || 'Vince(艾斯)')
const coachAvatarUrl = computed(() => selectedCoach.value?.avatar || '/static/icons/partTrainingActivity/AI_coach_Vince.png')
const coachBadgeBackground = computed(() => selectedCoach.value?.badgeBackground || 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)')

// 教练选择弹窗
const showCoachModal = ref(false)

const openCoachModal = () => {
	showCoachModal.value = true
}

const handleCoachSelect = (coachData) => {
	setSelectedCoach(coachData.value)
	selectedCoach.value = coachData
	uni.showToast({
		title: `已切换为${coachData.label}`,
		icon: 'success'
	})
}

// ========== 生命周期 ==========
onMounted(() => {
	startAssessment()
})

onBeforeUnmount(() => {
	stopAssessment()
})
</script>

<style scoped lang="scss">
.container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #F5F5F5;
}

/* ========== 自定义导航栏 ========== */
.header {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 96rpx;
	flex-shrink: 0;
}

.back-btn-position {
	position: absolute;
	left: 21rpx;
	top: 50%;
	transform: translateY(-50%);
}

.header-title {
	font-size: 34rpx;
	font-weight: 700;
	color: #333333;
}

/* ========== 进度条 ========== */
.progress-section {
	flex-shrink: 0;
	padding: 10rpx 0 20rpx;
}

/* ========== 内容区域 ========== */
.content {
	flex: 1;
	display: flex;
	flex-direction: column;
	padding: 6rpx 30rpx 20rpx;
	overflow: hidden;
}

/* 白色卡片容器 */
.assess-card {
	flex: 1;
	display: flex;
	flex-direction: column;
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 24rpx 24rpx 30rpx;
	box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.06);
	overflow: hidden;
}

.assess-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 10rpx;
	text-align: center;
}

/* AI教练气泡 */
.bubble-tip {
	width: 100%;
	margin-bottom: 16rpx;
}

/* 人体姿势图 */
.posture-image-wrapper {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
}

.posture-image {
	width: 100%;
	max-width: 500rpx;
	height: 600rpx;
}
</style>
