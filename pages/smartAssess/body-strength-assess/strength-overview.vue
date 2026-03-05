<!--
 * 力量评估 - 入口页面
 * 功能：展示人体模型和六个部位的力量数据概览，引导用户开始评估
 -->
<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
			<CommonBackButton />
			<text class="nav-title">力量评估</text>
			<view class="nav-placeholder"></view>
		</view>
		</view>
		
		<!-- 内容区域 -->
		<view class="content">
			<!-- 人体模型区域 -->
			<view class="body-model-area">
				<!-- 临时按钮：查看旧版 -->
				<view class="temp-btn" @click="goToOldVersion">
					<text class="temp-btn-text">旧版</text>
				</view>
				
				<!-- 人体图片 -->
				<image 
					class="body-image" 
					src="/static/icons/smartAssessActivity/li-liang/bg_body.png" 
					mode="aspectFit"
				/>
				
				<!-- 左侧部位卡片：背、臂、腿 -->
				<view class="cards-left">
					<BodyPartCard 
						name="背部" 
						:weight="partsData.back.weight"
						:sub-items="partsData.back.subItems"
						position="left"
					/>
					<BodyPartCard 
						name="手臂" 
						:weight="partsData.arm.weight"
						:sub-items="partsData.arm.subItems"
						position="left"
					/>
					<BodyPartCard 
						name="腿部" 
						:weight="partsData.leg.weight"
						:sub-items="partsData.leg.subItems"
						position="left"
					/>
				</view>
				
				<!-- 右侧部位卡片：肩、胸、臀 -->
				<view class="cards-right">
					<BodyPartCard 
						name="肩部" 
						:weight="partsData.shoulder.weight"
						:sub-items="partsData.shoulder.subItems"
						position="right"
					/>
					<BodyPartCard 
						name="胸部" 
						:weight="partsData.chest.weight"
						:sub-items="partsData.chest.subItems"
						position="right"
					/>
					<BodyPartCard 
						name="臀部" 
						:weight="partsData.hip.weight"
						:sub-items="partsData.hip.subItems"
						position="right"
					/>
				</view>
			</view>
			
			<!-- 底部区域 -->
			<view class="bottom-area">
				<!-- 提示文字 -->
				<view class="tip-text">
					<text class="tip-line">下面将进行一个短暂的部位力量评估</text>
					<text class="tip-line">帮助获取合适的健身重量数据</text>
				</view>
				
				<!-- 快速开始按钮 -->
				<view class="start-btn" @click="handleStartAssess">
					<text class="start-btn-text">快速开始</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import BodyPartCard from './components/body-part-card.vue'
import CommonBackButton from '@/components/ui-box/common-back-button.vue'

// 状态栏高度
const statusBarHeight = ref(0)

onMounted(() => {
	const systemInfo = uni.getSystemInfoSync()
	statusBarHeight.value = systemInfo.statusBarHeight || 0
})

// 六个部位的数据
const partsData = reactive({
	shoulder: {
		weight: 0,
		subItems: [
			{ label: '热身', value: 0 },
			{ label: '训练', value: 0 },
			{ label: '挑战', value: 0 }
		]
	},
	back: {
		weight: 0,
		subItems: [
			{ label: '热身', value: 0 },
			{ label: '训练', value: 0 },
			{ label: '挑战', value: 0 }
		]
	},
	arm: {
		weight: 0,
		subItems: [
			{ label: '热身', value: 0 },
			{ label: '训练', value: 0 },
			{ label: '挑战', value: 0 }
		]
	},
	leg: {
		weight: 0,
		subItems: [
			{ label: '热身', value: 0 },
			{ label: '训练', value: 0 },
			{ label: '挑战', value: 0 }
		]
	},
	chest: {
		weight: 0,
		subItems: [
			{ label: '热身', value: 0 },
			{ label: '训练', value: 0 },
			{ label: '挑战', value: 0 }
		]
	},
	hip: {
		weight: 0,
		subItems: [
			{ label: '热身', value: 0 },
			{ label: '训练', value: 0 },
			{ label: '挑战', value: 0 }
		]
	}
})

// 开始评估
const handleStartAssess = () => {
	console.log('开始力量评估')
	uni.navigateTo({
		url: '/pages/smartAssess/body-strength-assess/strength-assess'
	})
}

// 临时：跳转到旧版页面
const goToOldVersion = () => {
	uni.navigateTo({
		url: '/pages/smartAssess/body-strength-assess/strength-display-old'
	})
}
</script>

<style scoped lang="scss">
.page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #E8E8E8;
}

/* ========== 导航栏 ========== */
.nav-bar {
	flex-shrink: 0;
	background-color: #E8E8E8;
}

.nav-content {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	height: 88rpx;
	padding: 0 30rpx;
}

.nav-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #333333;
}

.nav-placeholder {
	width: 60rpx;
}

/* ========== 内容区域 ========== */
.content {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

/* ========== 人体模型区域 ========== */
.body-model-area {
	flex: 1;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.body-image {
	width: 500rpx;
	height: 900rpx;
}

/* 左侧卡片容器：背、臂、腿 - 向下偏移实现交错 */
.cards-left {
	position: absolute;
	left: 10rpx;
	top: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	padding: 100rpx 0 60rpx;
}

/* 右侧卡片容器：肩、胸、臀 - 向上偏移实现交错 */
.cards-right {
	position: absolute;
	right: 10rpx;
	top: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	padding: 40rpx 0 120rpx;
}

/* ========== 底部区域 ========== */
.bottom-area {
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 30rpx 40rpx 60rpx;
	gap: 30rpx;
}

.tip-text {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
}

.tip-line {
	font-size: 26rpx;
	color: #666666;
	line-height: 1.5;
}

.start-btn {
	width: 400rpx;
	height: 88rpx;
	background: linear-gradient(135deg, #4CAF50, #66BB6A);
	border-radius: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(76, 175, 80, 0.3);
	transition: all 0.2s;
}

.start-btn:active {
	transform: scale(0.98);
	opacity: 0.9;
}

.start-btn-text {
	font-size: 32rpx;
	font-weight: 600;
	color: #FFFFFF;
}

/* 临时按钮 - 绝对定位右上角 */
.temp-btn {
	position: absolute;
	top: 10rpx;
	right: 10rpx;
	z-index: 100;
	padding: 10rpx 20rpx;
	background: rgba(0, 0, 0, 0.5);
	border-radius: 6rpx;
}

.temp-btn-text {
	font-size: 20rpx;
	color: #FFFFFF;
}
</style>
