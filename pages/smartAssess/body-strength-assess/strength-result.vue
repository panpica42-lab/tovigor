<!--
 * 力量评估结果页
 * 功能：展示六个部位的热身 / 训练 / 冲刺推荐值，并承接后续训练计划入口
 -->
<template>
	<view class="page">
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<CommonBackButton></CommonBackButton>
				<text class="nav-title">力量评估</text>
				<view class="nav-placeholder"></view>
			</view>
		</view>

		<view class="screen-content">
			<view class="overview-card">
				<view class="body-model-area">
					<image
						class="body-image"
						src="/static/icons/smartAssessActivity/li-liang/bg_body.png"
						mode="aspectFit"
					></image>

					<view class="cards-left">
						<BodyPartCard
							name="背部"
							:weight="partsData.back.weight"
							:sub-items="partsData.back.subItems"
							position="left"
						></BodyPartCard>
						<BodyPartCard
							name="手臂"
							:weight="partsData.arm.weight"
							:sub-items="partsData.arm.subItems"
							position="left"
						></BodyPartCard>
						<BodyPartCard
							name="腿部"
							:weight="partsData.leg.weight"
							:sub-items="partsData.leg.subItems"
							position="left"
						></BodyPartCard>
					</view>

					<view class="cards-right">
						<BodyPartCard
							name="肩部"
							:weight="partsData.shoulder.weight"
							:sub-items="partsData.shoulder.subItems"
							position="right"
							:highlighted="partsData.shoulder.weight > 0"
						></BodyPartCard>
						<BodyPartCard
							name="胸部"
							:weight="partsData.chest.weight"
							:sub-items="partsData.chest.subItems"
							position="right"
						></BodyPartCard>
						<BodyPartCard
							name="臀部"
							:weight="partsData.hip.weight"
							:sub-items="partsData.hip.subItems"
							position="right"
						></BodyPartCard>
					</view>
				</view>

				<view class="summary-tip">
					<text class="summary-title">评估完成</text>
					<text class="summary-desc">已根据峰值行程生成热身、训练、冲刺推荐值</text>
				</view>

				<view class="plan-btn" @click="handlePlanPress">
					<text class="plan-btn-text">制定训练计划</text>
				</view>
			</view>

			<view class="recommend-section">
				<view class="section-header">
					<text class="section-title">课程推荐</text>
					<view class="more-link" @click="handleMoreCourses">
						<text class="more-text">更多</text>
						<text class="more-arrow">{{ moreArrowText }}</text>
					</view>
				</view>

				<scroll-view class="course-scroll" scroll-y show-scrollbar="false" enhanced>
					<view class="course-list">
						<view
							v-for="course in visibleCourses"
							:key="course.id"
							class="course-card"
							@click="handleCourseClick(course)"
						>
							<image class="course-image" :src="course.cover" mode="aspectFill"></image>
							<view class="course-overlay">
								<view class="course-tag">
									<text class="course-tag-text">{{ course.tags && course.tags.length ? course.tags[0] : '精选课程' }}</text>
								</view>
								<text class="course-title">{{ course.title }}</text>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>

		<TrainingCompleteWindow
			v-model:visible="showTrainingCompleteWindow"
			@close="handleTrainingCompleteClose"
		/>
	</view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import BodyPartCard from './components/body-part-card.vue'
import CommonBackButton from '@/components/ui-box/common-back-button.vue'
import TrainingCompleteWindow from '@/components/modals/training-complete-window.vue'
import { partTrainingCourses } from '@/pages/partTraining/course-data.js'
import {
	STRENGTH_ASSESS_STORAGE_KEY,
	getDefaultStrengthOverview
} from './strength-assess-config.js'

const statusBarHeight = ref(0)
const visibleCourses = partTrainingCourses.slice(0, 8)
const moreArrowText = '>>'
const showTrainingCompleteWindow = ref(false)

const partsData = reactive({
	shoulder: createDisplayPart(),
	back: createDisplayPart(),
	arm: createDisplayPart(),
	leg: createDisplayPart(),
	chest: createDisplayPart(),
	hip: createDisplayPart()
})

function createDisplayPart() {
	return {
		weight: 0,
		subItems: [
			{ label: '热身', value: 0 },
			{ label: '训练', value: 0 },
			{ label: '冲刺', value: 0 }
		]
	}
}

function loadOverviewData() {
	const stored = uni.getStorageSync(STRENGTH_ASSESS_STORAGE_KEY)
	const overview = getDefaultStrengthOverview()

	if (stored && typeof stored === 'object') {
		Object.keys(stored).forEach((key) => {
			overview[key] = stored[key]
		})
	}

	Object.keys(partsData).forEach((partId) => {
		const item = overview[partId] || {}
		partsData[partId].weight = item.trainingValue || 0
		partsData[partId].subItems = [
			{ label: '热身', value: item.warmupValue || 0 },
			{ label: '训练', value: item.trainingValue || 0 },
			{ label: '冲刺', value: item.sprintValue || 0 }
		]
	})
}

onMounted(() => {
	const systemInfo = uni.getSystemInfoSync()
	statusBarHeight.value = systemInfo.statusBarHeight || 0
	loadOverviewData()
})

onShow(() => {
	loadOverviewData()
})

const handlePlanPress = () => {
	showTrainingCompleteWindow.value = true
}

const handleTrainingCompleteClose = () => {
	showTrainingCompleteWindow.value = false
	uni.reLaunch({
		url: '/pages/index/index'
	})
}

const handleMoreCourses = () => {
	uni.showToast({
		title: '更多课程开发中',
		icon: 'none'
	})
}

const handleCourseClick = (course) => {
	uni.navigateTo({
		url: '/pages/partTraining/course-detail-adapter?id=' + course.id
	})
}
</script>

<style scoped lang="scss">
.page {
	height: 100vh;
	overflow: hidden;
	background: linear-gradient(180deg, #E9E9E9 0%, #F6F6F6 22%, #F2F2F2 100%);
	overscroll-behavior: none;
	display: flex;
	flex-direction: column;
}

.nav-bar {
	background: transparent;
	flex-shrink: 0;
}

.nav-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 88rpx;
	padding: 0 24rpx;
}

.nav-title {
	font-size: 40rpx;
	font-weight: 600;
	color: #111111;
	letter-spacing: 2rpx;
}

.nav-placeholder {
	width: 72rpx;
}

.screen-content {
	flex: 1;
	height: 0;
	padding: 6rpx 14rpx 8rpx;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.overview-card {
	flex-shrink: 0;
	padding: 6rpx 0 8rpx;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, #F7F7F7 100%);
	border-radius: 24rpx;
	box-shadow: 0 14rpx 36rpx rgba(0, 0, 0, 0.08);
	display: flex;
	flex-direction: column;
	gap: 4rpx;
	touch-action: none;
}

.body-model-area {
	position: relative;
	height: 492rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.body-image {
	width: 264rpx;
	height: 484rpx;
}

.cards-left,
.cards-right {
	position: absolute;
	top: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
}

.cards-left {
	left: 0;
	padding: 28rpx 0 14rpx;
}

.cards-right {
	right: 0;
	padding: 12rpx 0 28rpx;
}

.summary-tip {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 0 34rpx;
	gap: 2rpx;
}

.summary-title {
	font-size: 24rpx;
	font-weight: 700;
	color: #1B1B1B;
}

.summary-desc {
	font-size: 18rpx;
	line-height: 1.3;
	color: #6D6D6D;
	text-align: center;
}

.plan-btn {
	width: 280rpx;
	height: 68rpx;
	margin: 2rpx auto 0;
	border-radius: 24rpx;
	background: linear-gradient(135deg, #A6D322 0%, #8EC400 100%);
	box-shadow: 0 10rpx 24rpx rgba(142, 196, 0, 0.28);
	display: flex;
	align-items: center;
	justify-content: center;
}

.plan-btn:active {
	transform: scale(0.98);
}

.plan-btn-text {
	font-size: 28rpx;
	font-weight: 600;
	color: #FFFFFF;
}

.recommend-section {
	flex: 1;
	min-height: 0;
	padding: 0 2rpx;
	display: flex;
	flex-direction: column;
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 10rpx;
}

.section-title {
	padding: 10rpx 20rpx;
	border-radius: 16rpx;
	background: #111111;
	font-size: 24rpx;
	font-weight: 600;
	color: #FFFFFF;
}

.more-link {
	display: flex;
	align-items: center;
	padding-right: 4rpx;
}

.more-text,
.more-arrow {
	font-size: 22rpx;
	color: #A3A3A3;
}

.course-scroll {
	flex: 1;
	min-height: 0;
}

.course-list {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 14rpx;
	padding-right: 8rpx;
	padding-bottom: 8rpx;
	align-content: flex-start;
}

.course-card {
	position: relative;
	width: 344rpx;
	height: 176rpx;
	border-radius: 22rpx;
	overflow: hidden;
	background: #DDDDDD;
	box-shadow: 0 10rpx 24rpx rgba(0, 0, 0, 0.08);
}

.course-image {
	width: 100%;
	height: 100%;
}

.course-overlay {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 12rpx;
	background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%);
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.course-tag {
	align-self: flex-start;
	padding: 4rpx 12rpx;
	border-radius: 999rpx;
	background: rgba(255, 184, 0, 0.92);
}

.course-tag-text {
	font-size: 15rpx;
	font-weight: 600;
	color: #3B2A00;
}

.course-title {
	font-size: 22rpx;
	font-weight: 600;
	color: #FFFFFF;
	line-height: 1.25;
}
</style>
