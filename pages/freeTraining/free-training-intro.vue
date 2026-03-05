<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<image 
				class="back-btn" 
				src="/static/icons/general/btn_general_back.svg" 
				mode="aspectFit"
				@click="goBack"
			></image>
			<text class="nav-title">自由训练</text>
			<view class="nav-placeholder"></view>
		</view>

		<!-- 动作库卡片 -->
		<view class="action-library-card" @click="goToActionLibrary">
			<view class="card-tag" @click.stop="goToActionLibrary">
				<text class="tag-text">动作库</text>
			</view>
			<text class="card-desc">现有力量训练动作库，快速选择动作开始力量训练</text>
		</view>

		<!-- 训练模式列表 -->
		<view class="mode-list">
			<view 
				class="mode-item" 
				v-for="(mode, index) in trainingModes" 
				:key="index"
				:class="{ selected: selectedModeIndex === index }"
				@click="selectMode(index)"
			>
				<image class="mode-icon" :src="mode.icon" mode="aspectFit"></image>
				<view class="mode-info">
					<text class="mode-title">{{ mode.title }}</text>
					<text class="mode-desc">{{ mode.description }}</text>
				</view>
			</view>
		</view>

		<!-- 底部开始按钮 -->
		<view class="bottom-btn-area">
			<view class="start-btn" @click="startTraining">
				<text class="start-btn-text">直接开始</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'

// 训练模式数据
const trainingModes = ref([
	{
		title: '向心等张模式',
		description: '增肌、减脂、塑性、适合游泳、跑步、滑冰等项目',
		icon: '/static/icons/freeTrainingActivity/ic_force_xiangxin.png'
	},
	{
		title: '离心等张模式',
		description: '促进内分泌循环，带来更大肌肉维度，促进肌肉生长',
		icon: '/static/icons/freeTrainingActivity/ic_force_lixin.png'
	},
	{
		title: '流体阻力模式',
		description: '模仿风阻、水阻划船器特性，可以达到一个全身肌肉有氧练习效果',
		icon: '/static/icons/freeTrainingActivity/ic_force_liuti.png'
	},
	{
		title: '等速模式',
		description: '出拳速度恒定，适合康复运动',
		icon: '/static/icons/freeTrainingActivity/ic_force_dengsu.png'
	},
	{
		title: '弹力模式',
		description: '弹性阻力随伸长率变化，有效改善肌力、灵活性，提高运动成绩',
		icon: '/static/icons/freeTrainingActivity/ic_force_tanli.png'
	},
	{
		title: '恒力模式',
		description: '阻力大小恒定，贴近日常生活和工作',
		icon: '/static/icons/freeTrainingActivity/ic_force_hengli.png'
	}
])

// 当前选中的模式索引
const selectedModeIndex = ref(0)

// 返回上一页
const goBack = () => {
	uni.navigateBack()
}

// 跳转到动作库
const goToActionLibrary = () => {
	uni.navigateTo({
		url: '/pages/freeTraining/action-library'
	})
}

// 选择训练模式
const selectMode = (index) => {
	selectedModeIndex.value = index
}

// 开始训练
const startTraining = () => {
	uni.navigateTo({
		url: `/pages/freeTraining/free-training?modeIndex=${selectedModeIndex.value}`
	})
}
</script>

<style scoped>
.container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f5f5f5;
	padding: 0 24rpx;
	box-sizing: border-box;
	overflow: hidden;
	touch-action: none; /* 禁用默认触摸行为，解决 passive event listener 警告 */
}

/* 顶部导航栏 */
.nav-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 80rpx;
	padding-top: 16rpx;
	flex-shrink: 0;
}

.back-btn {
	width: 56rpx;
	height: 56rpx;
}

.nav-title {
	font-size: 34rpx;
	font-weight: bold;
	color: #333;
}

.nav-placeholder {
	width: 56rpx;
}

/* 动作库卡片 */
.action-library-card {
	position: relative;
	background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
	border-radius: 20rpx;
	padding: 20rpx 24rpx;
	margin-top: 16rpx;
	margin-bottom: 16rpx;
	flex-shrink: 0;
}

.card-tag {
	display: inline-flex;
	background-color: #4CAF50;
	border-radius: 26rpx;
	padding: 8rpx 28rpx;
	margin-bottom: 10rpx;
}

.tag-text {
	color: #fff;
	font-size: 26rpx;
	font-weight: bold;
}

.card-desc {
	display: block;
	color: #4CAF50;
	font-size: 22rpx;
	line-height: 1.4;
}

/* 训练模式列表 */
.mode-list {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	overflow: hidden;
}

.mode-item {
	display: flex;
	align-items: center;
	background-color: #fff;
	border-radius: 20rpx;
	padding: 16rpx 20rpx;
	border: 3rpx solid transparent;
	transition: all 0.2s ease;
}

.mode-item.selected {
	border-color: #4CAF50;
	background-color: #f1f8e9;
}

.mode-icon {
	width: 80rpx;
	height: 80rpx;
	margin-right: 20rpx;
	flex-shrink: 0;
}

.mode-info {
	display: flex;
	flex-direction: column;
	flex: 1;
	min-width: 0;
}

.mode-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 4rpx;
}

.mode-desc {
	font-size: 20rpx;
	color: #999;
	line-height: 1.3;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

/* 底部按钮区域 */
.bottom-btn-area {
	padding: 16rpx 0 30rpx;
	display: flex;
	justify-content: center;
	flex-shrink: 0;
}

.start-btn {
	background-color: #4CAF50;
	border-radius: 44rpx;
	padding: 20rpx 70rpx;
	box-shadow: 0 6rpx 16rpx rgba(76, 175, 80, 0.3);
}

.start-btn-text {
	color: #fff;
	font-size: 30rpx;
	font-weight: bold;
}
</style>
