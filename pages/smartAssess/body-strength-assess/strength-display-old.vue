<!--
 * 力量评估页面
 * 功能：部位力量评估 - 配重设置与训练部位选择
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
		
	<!-- 步骤进度条（浮在导航栏下方） -->
	<view class="step-bar-overlay" :style="{ top: (statusBarHeight + 88) + 'rpx' }">
		<StepBar :totalSteps="12" :currentStep="currentStep" />
	</view>		<!-- 底部配重面板 -->
		<view class="weight-panel">
			<!-- 配重信息行 -->
			<view class="weight-info-row">
				<text class="weight-label">配重</text>
				<text class="weight-value">{{ displayWeight }}KG</text>
				<view class="weight-unit">
					<image class="unit-icon" src="/static/icons/smartAssessActivity/li-liang/ic_KG.png" mode="aspectFit" />
					<text class="unit-text">单位：KG</text>
				</view>
			</view>
			
			<!-- 控制行：电源按钮 + 滑块 -->
			<view class="control-row">
				<!-- 电源按钮 -->
				<view class="power-btn" :class="{ 'power-on': powerOn }" @click="togglePower">
					<image 
						class="power-icon" 
						:src="powerOn ? '/static/icons/smartAssessActivity/li-liang/ic_power_on.svg' : '/static/icons/smartAssessActivity/li-liang/ic_power_off.svg'" 
						mode="aspectFit"
					/>
				</view>
				
				<!-- 滑块 -->
				<view class="slider-wrapper">
					<slider 
						class="weight-slider"
						:value="weightValue"
						:min="0"
						:max="100"
						:disabled="!powerOn"
						active-color="rgba(0, 200, 83, 0.7)"
						background-color="rgba(224, 224, 224, 0.5)"
						block-size="24"
						@change="onWeightChange"
					/>
				</view>
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
		
		<!-- 测试按钮：唤起弹窗 -->
		<view v-if="SHOW_TEST_BUTTON" class="test-btn" @click="openTestModal">
			<text class="test-btn-text">测试弹窗</text>
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
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import StepBar from '@/components/ui-box/step-bar.vue'
import AssessmentCompleteModal from '@/components/modals/assessment-complete-modal.vue'

// ========== 测试开关：设置为 false 关闭测试按钮 ==========
const SHOW_TEST_BUTTON = true

// 获取系统状态栏高度
const statusBarHeight = ref(0)

onMounted(() => {
	const systemInfo = uni.getSystemInfoSync()
	statusBarHeight.value = systemInfo.statusBarHeight || 0
})

// 当前步骤 (1-10)
const currentStep = ref(1)

// 弹窗控制
const showCompleteModal = ref(false)

// 配重相关
const powerOn = ref(false)
const weightValue = ref(0)

// 格式化显示的重量（始终2位数）
const displayWeight = computed(() => {
	return String(weightValue.value).padStart(2, '0')
})

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

// 切换电源
const togglePower = () => {
	powerOn.value = !powerOn.value
	if (!powerOn.value) {
		// 关机时重置重量
		weightValue.value = 0
	}
}

// 滑块变化
const onWeightChange = (e) => {
	weightValue.value = e.detail.value
	console.log('当前配重:', weightValue.value, 'KG')
}

// 选择部位
const selectPart = (partId) => {
	selectedPartId.value = partId
	console.log('选中部位:', partId)
	
	// TODO: 根据部位切换评估流程
	uni.showToast({
		title: `已选择${bodyParts.value.find(p => p.id === partId).name}`,
		icon: 'none'
	})
}

// ========== 弹窗事件处理 ==========
// 打开测试弹窗
const openTestModal = () => {
	showCompleteModal.value = true
}

// 处理“直接开始”
const handleStartNext = (data) => {
	console.log('点击直接开始:', data)
	uni.showToast({
		title: `开始${bodyParts.value.find(p => p.id === data.nextPartId)?.name || ''}评估`,
		icon: 'none'
	})
	// TODO: 跳转到下一部位评估
}

// 处理“取消”
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
	// TODO: 自动跳转到下一部位
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

/* ========== 步骤进度条（浮层） ========== */
.step-bar-overlay {
	position: absolute;
	left: 0;
	right: 0;
	z-index: 90;
	padding: 20rpx 24rpx;
}

/* ========== 底部配重面板（半透明浮层） ========== */
.weight-panel {
	position: absolute;
	bottom: 140rpx;
	left: 30rpx;
	right: 30rpx;
	z-index: 80;
	background: rgba(255, 255, 255, 0.75);
	backdrop-filter: blur(30rpx);
	border-radius: 24rpx;
	padding: 24rpx 28rpx;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
}

.weight-info-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24rpx;
}

.weight-label {
	font-size: 28rpx;
	color: #333333;
	font-weight: 500;
}

.weight-value {
	font-size: 64rpx;
	font-weight: bold;
	color: #000000;
	letter-spacing: 4rpx;
}

.weight-unit {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.unit-icon {
	width: 32rpx;
	height: 32rpx;
}

.unit-text {
	font-size: 24rpx;
	color: #666666;
}

.control-row {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.power-btn {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	background-color: rgba(224, 224, 224, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s;
	flex-shrink: 0;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.power-btn:active {
	transform: scale(0.95);
}

.power-btn.power-on {
	background: rgba(0, 200, 83, 0.15);
	box-shadow: 0 4rpx 16rpx rgba(0, 200, 83, 0.2);
}

.power-icon {
	width: 50rpx;
	height: 50rpx;
}

.slider-wrapper {
	flex: 1;
}

.weight-slider {
	width: 100%;
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

/* ========== 测试按钮 ========== */
.test-btn {
	position: absolute;
	top: 50%;
	right: 30rpx;
	z-index: 200;
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #FF6B6B, #FF8E53);
	box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.4);
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s;
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
</style>
