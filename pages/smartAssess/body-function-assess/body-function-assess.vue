<!--
 * 身体机能评估页面
 * 功能：体脂秤连接提示页面，引导用户连接外部体脂秤进行体能评估
 -->
<template>
	<view class="container">
		<!-- 顶部返回按钮 -->
		<view class="header">
			<view class="back-btn" @click="goBack">
				<image 
					class="back-icon" 
					src="/static/icons/general/btn_general_back.svg" 
					mode="widthFix"
				/>
			</view>
			<text class="header-title">身体机能</text>
		</view>
		
		<!-- 内容区域 -->
		<view class="content">
			<!-- AI教练气泡对话框 -->
			<BubbleDialogBox
				:roleLabel="coachRoleLabel"
				:avatarUrl="coachAvatarUrl"
				:badgeBackground="coachBadgeBackground"
				text="请按照指示连接外部体脂秤进行评估"
				contentBackground="rgba(255, 255, 255, 0.85)"
				:showShadow="true"
				:clickable="true"
				@coach-click="openCoachModal"
				class="bubble-tip"
			/>
			
			<!-- 体脂秤图片 -->
			<view class="device-image-wrapper">
				<image 
					class="device-image" 
					src="/static/icons/smartAssessActivity/ji-neng/ic_body_fat_scale.png" 
					mode="widthFix"
				/>
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
import { ref, computed } from 'vue'
import BubbleDialogBox from '@/components/ui-box/bubble-dialog-box.vue'
import CoachDetailModal from '@/components/modals/coach-detail-modal.vue'
import { getSelectedCoach, setSelectedCoach } from '@/utils/coachManager.js'

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

// 返回上一页
const goBack = () => {
	uni.navigateBack()
}
</script>

<style scoped lang="scss">
.container {
	min-height: 100vh;
	background-color: #F5F5F5;
	display: flex;
	flex-direction: column;
}

/* ========== 顶部区域 ========== */
.header {
  position: relative;
  height: 112rpx;                /* 头部要足够高，别让 70rpx 的圆顶住 */
  padding: 0 24rpx;
  display: flex;
  align-items: center;           /* 中间标题垂直居中 */
  justify-content: center;
  background-color: #F5F5F5;
}

.back-btn{
  position: absolute;
  left: 21rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 70rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: transparent;              /* 关键：容器背景透明，这样就能去掉灰色圆环 */
  transition: transform .2s ease, opacity .2s ease;
}

.back-btn:active{
  transform: translateY(-50%) scale(.97);
  opacity: .7;
}


/* 图标：只给宽度，高度自适应；并放大约 10%（36→40rpx） */
.back-icon {
  width: 38rpx;              /* +10% */
  height: auto;              /* 让图标保持自身纵横比 */
  display: block;            /* 避免行内元素基线引起的视觉偏差 */
}

.header-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

/* ========== 内容区域 ========== */
.content {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 40rpx 30rpx;
}

/* AI 助手气泡 */
.bubble-tip {
	width: 100%;
	margin-bottom: 40rpx;
}

/* 设备图片 */
.device-image-wrapper {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 40rpx;
	margin: 0 30rpx;
}

.device-image {
	width: 100%;
	max-width: 500rpx;
	height: auto;
}
</style>
