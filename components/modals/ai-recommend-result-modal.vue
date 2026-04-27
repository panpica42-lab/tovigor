<!--
	产品语义说明：
	这个组件对应用户点击“AI推荐”并完成基础信息选择后，看到的“推荐结果弹窗”。
	它不是一个独立页面，而是悬浮在部位训练页面上方的一层弹窗。
	
	用户肉眼看到的内容包括：
	1. 顶部蓝色提示条：“已推荐最适合的健身课程”
	2. 中间白色弹窗卡片
	3. 卡片里的推荐课程详情
	4. 底部“开始训练”按钮
	
	这里没有重新写一套课程详情 UI，而是直接复用 course-detail-content.vue 的主体内容。
	原因是：推荐结果弹窗本质上展示的还是“某一门课程的详情”，只是展示容器从“独立页面”
	变成了“弹窗”。
-->
<template>
	<view v-if="visible && course" class="result-overlay" @click="handleMaskClick">
		<view class="result-shell" @click.stop>
			<view class="result-close" @click="handleClose">
				<text class="result-close-text">×</text>
			</view>

			<view class="result-banner">
				<text class="result-banner-text">已推荐最适合的健身课程</text>
				<image
					class="result-banner-avatar"
					src="/static/icons/partTrainingActivity/AI_coach_Vince.png"
					mode="aspectFit"
				/>
			</view>

			<view class="result-card">
				<text class="result-title">{{ course.title || '推荐课程' }}</text>

				<view class="result-body">
					<CourseDetailContent
						:course="course"
						:showHeader="false"
						:showIntroCard="false"
						:embedded="true"
						@start="handleStartTraining"
					/>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import CourseDetailContent from '@/pages/partTraining/components/course-detail-content.vue'

const props = defineProps({
	// 是否显示推荐结果弹窗。
	// 外层页面控制它的开关，这个组件自己不决定什么时候出现。
	visible: {
		type: Boolean,
		default: false
	},
	// 当前要展示的“推荐课程”对象。
	// 它来自外层页面的推荐逻辑，弹窗本身不负责算推荐结果。
	course: {
		type: Object,
		default: null
	}
})

const emit = defineEmits(['update:visible', 'startTraining'])

// 关闭弹窗：只通知外层把 visible 改掉。
const handleClose = () => {
	emit('update:visible', false)
}

// 点击遮罩层时关闭，符合普通弹窗交互。
const handleMaskClick = () => {
	handleClose()
}

// 这里接住 course-detail-content.vue 抛出来的开始训练事件，
// 再继续往外抛给 part-training.vue，由页面统一决定后续跳转。
const handleStartTraining = (course) => {
	emit('startTraining', course)
}
</script>

<style scoped lang="scss">
.result-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 9999;
	background: rgba(0, 0, 0, 0.24);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 18rpx;
	box-sizing: border-box;
}

.result-shell {
	position: relative;
	width: 620rpx;
	padding-top: 76rpx;
}

.result-close {
	position: absolute;
	left: 4rpx;
	top: 8rpx;
	width: 52rpx;
	height: 52rpx;
	border-radius: 26rpx;
	background: rgba(191, 225, 252, 0.96);
	border: 4rpx solid #1D2939;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 3;
	box-sizing: border-box;
}

.result-close-text {
	font-size: 30rpx;
	line-height: 1;
	font-weight: 700;
	color: #111111;
}

.result-banner {
	position: absolute;
	top: 0;
	right: 0;
	height: 68rpx;
	padding: 0 94rpx 0 24rpx;
	border-radius: 34rpx;
	background: linear-gradient(90deg, #76B6FF 0%, #4C94EC 100%);
	display: flex;
	align-items: center;
	box-sizing: border-box;
	z-index: 2;
	box-shadow: 0 10rpx 24rpx rgba(76, 148, 236, 0.24);
	width: auto;
	max-width: 556rpx;
}

.result-banner-text {
	font-size: 20rpx;
	font-weight: 600;
	color: #FFFFFF;
	line-height: 1.3;
	white-space: nowrap;
}

.result-banner-avatar {
	position: absolute;
	right: 8rpx;
	bottom: 0;
	width: 88rpx;
	height: 88rpx;
}

.result-card {
	background: #FFFFFF;
	border-radius: 30rpx;
	padding: 24rpx 22rpx 20rpx;
	box-sizing: border-box;
	box-shadow: 0 22rpx 52rpx rgba(0, 0, 0, 0.16);
	height: 78vh;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.result-title {
	display: block;
	text-align: center;
	font-size: 29rpx;
	font-weight: 700;
	color: #1F2937;
	margin-bottom: 12rpx;
}

.result-body {
	flex: 1;
	display: flex;
	min-height: 0;
	overflow: hidden;
}
</style>
