<template>
	<view class="container">
		<!-- 顶部标题区域 -->
		<view class="header">
			<view class="header-title">
				<text class="title-main">HI,Tovigor</text>
				<view class="header-right">
					<!-- 控制小面板 -->
					<view class="control-panel">
						<image 
							class="control-icon" 
							:class="{ active: controlStates.light }"
							src="/static/icons/homeActivity/ic_control_light.svg" 
							mode="aspectFit"
							@click="toggleControl('light')"
						></image>
						<image 
							class="control-icon" 
							:class="{ active: controlStates.wifi }"
							src="/static/icons/homeActivity/ic_control_wifi.svg" 
							mode="aspectFit"
							@click="toggleControl('wifi')"
						></image>
						<image 
							class="control-icon" 
							:class="{ active: controlStates.voice }"
							src="/static/icons/homeActivity/ic_control_voice.svg" 
							mode="aspectFit"
							@click="toggleControl('voice')"
						></image>
						<image 
							class="control-icon" 
							:class="{ active: controlStates.bluetooth }"
							src="/static/icons/homeActivity/ic_control_bluetooth.svg" 
							mode="aspectFit"
							@click="toggleControl('bluetooth')"
						></image>
						<image 
							class="control-icon" 
							:class="{ active: controlStates.setting }"
							src="/static/icons/homeActivity/ic_setting_system.svg" 
							mode="aspectFit"
							@click="toggleControl('setting')"
						></image>
						<image 
							class="control-icon" 
							:class="{ active: controlStates.power }"
							src="/static/icons/homeActivity/ic_control_on-off.svg" 
							mode="aspectFit"
							@click="toggleControl('power')"
						></image>
					</view>
					<!-- 使用指南按钮 -->
					<image 
						class="usage-guide-btn" 
						src="/static/icons/homeActivity/btn_usage_guide.svg" 
						mode="aspectFit"
						@click="showUsageGuide"
					></image>
				</view>
				<!-- <image class="title-icon" src="/static/icons/homeActivity/trimming.png" mode="aspectFill"></image> -->
			</view>
			<text class="title-sub">Tovigor的健身世界，活力一触即发！</text>
		</view>

		<!-- 功能卡片区域 -->
		<view class="card-grid">
			<!-- 自由训练 -->
			<view class="card-left" @click="goToFreeTraining">
				<view class="card card-large card-free">
					<image class="card-bg-img" src="/static/icons/homeActivity/bg_free_training.svg" mode="aspectFill"></image>
					<view class="card-content">
						<text class="card-title">自由训练</text>
						<text class="card-subtitle">数字力量 自由掌握</text>
					</view>
				</view>
			</view>

			<!-- 右侧卡片组 -->
			<view class="card-right">
			<!-- 部位训练 -->
			<view class="card card-small card-body" @click="goToPartTraining">
					<image class="card-bg-img" src="/static/icons/homeActivity/bg_body_training.svg" mode="aspectFill"></image>
					<view class="card-content">
						<text class="card-title">部位训练</text>
						<text class="card-subtitle">针对各部位的系统设计</text>
					</view>
				</view>

				<!-- 智能评估 -->
				<view class="card card-small card-assess" @click="goToSmartAssess">
					<image class="card-bg-img" src="/static/icons/homeActivity/bg_smart_assess.svg" mode="aspectFill"></image>
					<view class="card-content">
						<text class="card-title">智能评估</text>
						<text class="card-subtitle">定制专属自己的健康方案</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 娱乐休闲 + 智慧AI咨询 + 添加训练 -->
		<view class="function-row">
			<view class="function-item">
				<image class="function-icon" src="/static/icons/homeActivity/ic_games.svg" mode="aspectFit"></image>
				<text class="function-text">娱乐休闲</text>
			</view>
			<view class="function-item function-middle">
				<image class="function-avatar" src="/static/icons/homeActivity/trimming.png" mode="aspectFill"></image>
				<text class="function-text">智慧AI咨询</text>
			</view>
			<view class="function-item function-add">
				<text class="add-icon">+</text>
				<text class="function-text">添加训练</text>
			</view>
		</view>

		<!-- 课程推荐 -->
		<view class="course-section">
			<view class="section-header">
				<text class="section-title">课程推荐</text>
				<view class="serial-test-btn" @click="goToSerialTest">
					<text class="serial-test-text">串口v1</text>
				</view>
				<view class="serial-test-btn serial-test-btn-v2" @click="goToSerialTestV2">
					<text class="serial-test-text">串口v2</text>
				</view>
			</view>

			<!-- 课程列表 - 纵向滚动，2列布局 -->
			<scroll-view 
				class="course-scroll" 
				scroll-y 
				:show-scrollbar="false"
				:style="{ height: scrollHeight + 'px' }"
			>
				<view class="course-grid">
					<view class="course-item" v-for="(course, index) in courseList" :key="index">
						<view class="course-image-wrapper">
							<image class="course-image" :src="course.image" mode="aspectFill"></image>
							<view class="play-btn">
								<view class="play-triangle"></view>
							</view>
						</view>
						<view class="course-info">
							<text class="course-name">{{ course.name }}</text>
							<text class="course-duration">{{ course.duration }}</text>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 使用指南弹窗 -->
		<UsageGuideModal 
			v-model:visible="showGuideModal"
			:guide-items="guideItems"
		/>
	</view>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import UsageGuideModal from '@/components/modals/usage-guide-modal.vue'

const courseList = ref([
	{
		image: '/static/icons/partTrainingActivity/ic_1x.jpg',
		name: '肩部塑形训练',
		duration: '25min'
	},
	{
		image: '/static/icons/partTrainingActivity/ic_2x.jpg',
		name: '核心力量训练',
		duration: '30min'
	},
	{
		image: '/static/icons/partTrainingActivity/ic_4x.jpg',
		name: '有氧燃脂训练',
		duration: '20min'
	},
	{
		image: '/static/logo.png',
		name: '腿部训练课程',
		duration: '35min'
	},
	{
		image: '/static/logo.png',
		name: '背部强化训练',
		duration: '28min'
	}
])
const scrollHeight = ref(0)
let resizeHandler = null

// 使用指南弹窗
const showGuideModal = ref(false)
const guideItems = ref([
	{
		id: 1,
		title: '如何调节力臂？- 演示视频',
		image: '/static/icons/homeActivity/ic_course_01.png',
		textLabel: '文字指导'
	},
	{
		id: 2,
		title: '如何更换配件？- 演示视频',
		image: '/static/icons/homeActivity/ic_course_02.png',
		textLabel: '文字指导'
	}
])

const showUsageGuide = () => {
	showGuideModal.value = true
}

// 控制面板状态
const controlStates = ref({
	light: false,
	wifi: false,
	voice: false,
	bluetooth: false,
	setting: false,
	power: false
})

const toggleControl = (key) => {
	controlStates.value[key] = !controlStates.value[key]
}

const calcScrollHeight = () => {
	const { windowHeight } = uni.getSystemInfoSync()
	const instance = getCurrentInstance()
	
	// 下一帧再测量，确保布局完成
	nextTick(() => {
		uni.createSelectorQuery()
			.in(instance)
			.select('.course-scroll')
			.boundingClientRect(rect => {
				if (!rect) return
				const h = Math.max(0, Math.floor(windowHeight - rect.top))
				scrollHeight.value = h
			})
			.exec()
	})
}

// 跳转到自由训练页面（先跳转到前置介绍页）
const goToFreeTraining = () => {
	uni.navigateTo({
		url: '/pages/freeTraining/free-training-intro'
	})
}

// 跳转到部位训练页面
const goToPartTraining = () => {
	uni.navigateTo({
		url: '/pages/partTraining/part-training'
	})
}

// 跳转到智能评估页面
const goToSmartAssess = () => {
	uni.navigateTo({
		url: '/pages/smartAssess/first-skip'
	})
}

// 跳转到串口测试页面 v1
const goToSerialTest = () => {
	uni.navigateTo({
		url: '/pages/serial-test/serial-test'
	})
}

// 跳转到串口测试页面 v2 (Service 架构)
const goToSerialTestV2 = () => {
	uni.navigateTo({
		url: '/pages/serial-test/serial-test-v2'
	})
}

onMounted(() => {
	calcScrollHeight()
	// 监听窗口尺寸变化（仅 H5/APP 生效，无小程序依赖）
	if (uni.onWindowResize) {
		resizeHandler = () => calcScrollHeight()
		uni.onWindowResize(resizeHandler)
	}
})

onBeforeUnmount(() => {
	if (uni.offWindowResize && resizeHandler) {
		uni.offWindowResize(resizeHandler)
	}
})
</script>

<style scoped>
page {
	height: 100%;
	overflow: hidden;
}

.container {
	background-color: #F5F5F5;
	padding: 40rpx 30rpx;
	height: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

/* 头部样式 */
.header {
	margin-bottom: 30rpx;
	flex-shrink: 0;
}

.header-title {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 10rpx;
}

.header-right {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 16rpx;
}

/* 控制小面板 */
.control-panel {
	display: flex;
	flex-direction: row;
	align-items: center;
	height: 48rpx;
	padding: 0 12rpx;
	background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 100%);
	border-radius: 8rpx;
	box-shadow: 
		0 2rpx 8rpx rgba(0, 0, 0, 0.1),
		0 1rpx 2rpx rgba(0, 0, 0, 0.06),
		inset 0 1rpx 0 rgba(255, 255, 255, 0.8),
		inset 0 -1rpx 0 rgba(0, 0, 0, 0.05);
	gap: 12rpx;
}

.control-icon {
	width: 28rpx;
	height: 28rpx;
	opacity: 0.4;
	transition: all 0.2s;
	filter: grayscale(100%) brightness(0.5);
}

.control-icon.active {
	opacity: 1;
	filter: none;
	/* 绿色滤镜效果 */
	filter: brightness(0) saturate(100%) invert(56%) sepia(74%) saturate(459%) hue-rotate(93deg) brightness(95%) contrast(89%);
}

.control-icon:active {
	transform: scale(0.9);
}

.usage-guide-btn {
	width: 48rpx;
	height: 48rpx;
	transition: all 0.2s;
}

.usage-guide-btn:active {
	opacity: 0.7;
	transform: scale(0.95);
}

.title-main {
	font-size: 48rpx;
	font-weight: bold;
	color: #000000;
}

/* .title-icon {
	width: 80rpx;
	height: 80rpx;
	margin-left: 10rpx;
} */

.title-sub {
	font-size: 24rpx;
	color: #999999;
}

/* 卡片网格 */
.card-grid {
	display: flex;
	flex-direction: row;
	margin-bottom: 20rpx;
	flex-shrink: 0;
}

.card-left {
	flex: 1;
	margin-right: 20rpx;
}

.card-right {
	flex: 1;  /* 右侧卡片组占一半宽度 */
	display: flex;
	flex-direction: column;
}

.card {
	border-radius: 24rpx;
	overflow: hidden;
	position: relative;
}

.card-bg-img {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 0;
}

.card-content {
	position: relative;
	z-index: 1;
	padding: 20rpx;
	display: flex;
	flex-direction: column;
}

.card-large {
	height: 300rpx;
}

.card-small {
	height: 140rpx;
	margin-bottom: 20rpx;
}

.card-small:last-child {
	margin-bottom: 0;
}

.card-free {
	background-color: #C5E86C;
}

.card-body {
	background-color: #7CE0C5;
}

.card-assess {
	background-color: #6DD4E0;
}

.card-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #000000;
	margin-bottom: 6rpx;
}

.card-subtitle {
	font-size: 20rpx;
	color: #333333;
}

/* 功能行 */
.function-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
	flex-shrink: 0;
}

.function-item {
	flex: 1;
	background-color: #FFFFFF;
	border-radius: 12rpx;
	padding: 15rpx 10rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	margin-right: 15rpx;
}

.function-item:last-child {
	margin-right: 0;
}

.function-middle {
	margin-left: 0;
	margin-right: 15rpx;
}

.function-icon {
	width: 40rpx;
	height: 40rpx;
	margin-bottom: 8rpx;
}

.function-avatar {
	width: 40rpx;
	height: 40rpx;
	border-radius: 20rpx;
	margin-bottom: 8rpx;
}

.function-text {
	font-size: 20rpx;
	color: #333333;
	text-align: center;
}

.add-icon {
	font-size: 36rpx;
	color: #333333;
	line-height: 40rpx;
	margin-bottom: 8rpx;
}

/* 课程推荐 */
.course-section {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	min-height: 0;
}

.section-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
	flex-shrink: 0;
}

.section-title {
	background-color: #333333;
	border-radius: 50rpx;
	padding: 15rpx 30rpx;
	font-size: 26rpx;
	font-weight: bold;
	color: #FFFFFF;
}

.serial-test-btn {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 50rpx;
	padding: 15rpx 30rpx;
	margin-left: 20rpx;
}

.serial-test-btn-v2 {
	background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
}

.serial-test-text {
	font-size: 26rpx;
	font-weight: bold;
	color: #FFFFFF;
}

.course-scroll {
  /* 高度由 :style 绑定 */
  overflow: auto; /* 兜底 */
  /* #ifdef H5 */
  overscroll-behavior: contain; /* 列表到顶/底不把滚动继续传给父容器 */
  touch-action: pan-y;           /* 明确只处理纵向手势 */
  -webkit-overflow-scrolling: touch; /* iOS 回弹/惯性 */
  /* #endif */
}

.course-grid {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: space-between;
	padding: 10rpx 0;
}

.course-item {
	width: 330rpx;
	margin-bottom: 20rpx;
	background-color: #FFFFFF;
	border-radius: 16rpx;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.course-image-wrapper {
	position: relative;
	width: 330rpx;
	height: 280rpx;
}

.course-image {
	width: 330rpx;
	height: 280rpx;
}

.play-btn {
	position: absolute;
	top: 15rpx;
	right: 15rpx;
	width: 50rpx;
	height: 50rpx;
	background-color: rgba(0, 0, 0, 0.6);
	border-radius: 25rpx;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
}

.play-triangle {
	width: 0;
	height: 0;
	border-left: 16rpx solid #FFFFFF;
	border-top: 10rpx solid transparent;
	border-bottom: 10rpx solid transparent;
	margin-left: 4rpx;
}

.course-info {
	padding: 15rpx;
	display: flex;
	flex-direction: column;
}

.course-name {
	font-size: 24rpx;
	color: #333333;
	margin-bottom: 6rpx;
}

.course-duration {
	font-size: 20rpx;
	color: #999999;
}
</style>

<style>
/* 全局根层禁止页面自身滚动 */
page { height: 100%; overflow: hidden; }

/* 仅 H5：把 html/body/#app 也锁住，否则外层还是会滚 */
/* #ifdef H5 */
html, body, #app { height: 100%; overflow: hidden; }
/* #endif */
</style>
