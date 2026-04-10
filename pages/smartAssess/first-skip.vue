<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="header">
			<CommonBackButton class="back-btn-position" />
			<text class="header-title">智能评估</text>
		</view>
		
		<!-- 顶部广告图 -->
		<view class="ad-banner">
			<image 
				class="ad-image" 
				src="/static/icons/smartAssessActivity/firstSkip/advertising_board.png" 
				mode="aspectFill"
			/>
		</view>
		
		<!-- 评估卡片列表 -->
		<view class="assess-cards">
		<!-- 身体机能卡片 -->
		<view class="card card-skill" @click="goToSkillAssess">
			<image 
				class="card-bg" 
				src="/static/icons/smartAssessActivity/firstSkip/bg_jineng.svg" 
				mode="aspectFill"
			/>
			<view class="card-content">
				<text class="card-title">身体机能</text>
				<text class="card-desc">请按照指示运动体能测试并身体各项机能分析</text>
			</view>
		</view>		<!-- 体态姿势卡片 -->
		<view class="card card-posture" @click="goToPostureAssess">
			<image 
				class="card-bg" 
				src="/static/icons/smartAssessActivity/firstSkip/bg_zishi.svg" 
				mode="aspectFill"
			/>
			<view class="card-content">
				<text class="card-title">体态姿势</text>
				<text class="card-desc">通过AI拍摄并行人体体态姿势全方位分析</text>
			</view>
		</view>			<!-- 部位力量卡片 -->
			<view class="card card-strength" @click="goToStrengthAssess">
				<image 
					class="card-bg" 
					src="/static/icons/smartAssessActivity/firstSkip/bg_liliang.svg" 
					mode="aspectFill"
				/>
				<view class="card-content">
					<text class="card-title">部位力量</text>
					<text class="card-desc">进行六个部位的评估力量评估</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import CommonBackButton from '@/components/ui-box/common-back-button.vue'

// 智能评估首页 - 三大评估入口

// 跳转到身体机能评估
const goToSkillAssess = () => {
	uni.navigateTo({
		url: '/pages/smartAssess/body-function-assess/body-function-assess'
	})
}

// 跳转到体态姿势评估
const goToPostureAssess = () => {
	uni.navigateTo({
		url: '/pages/smartAssess/body-posture-assess/body-posture-assess'
	})
}

// 跳转到部位力量评估
const goToStrengthAssess = () => {
	uni.navigateTo({
		url: '/pages/smartAssess/body-strength-assess/strength-overview'
	})
}
</script>

<style scoped>
.container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #F5F5F5;
	overflow: hidden;
}

/* 自定义导航栏 */
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

/* 顶部广告图 */
.ad-banner {
	flex-shrink: 0;
	height: 350rpx;
	overflow: hidden;
	margin: 0 30rpx;
	border-radius: 24rpx;
}

.ad-image {
	width: 100%;
	height: 100%;
}

/* 评估卡片容器 */
.assess-cards {
	flex: 1;
	display: flex;
	flex-direction: column;
	padding: 30rpx;
	gap: 20rpx;
}

/* 卡片基础样式 */
.card {
	position: relative;
	flex: 1;
	border-radius: 24rpx;
	overflow: hidden;
	display: flex;
	align-items: flex-start;
	padding: 30rpx;
	box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);
	transition: transform 0.2s;
}

.card:active {
	transform: scale(0.98);
}

/* 卡片背景图 */
.card-bg {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 0;
}

/* 卡片内容 */
.card-content {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
}

.card-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #000000;
	margin-bottom: 12rpx;
}

.card-desc {
	font-size: 24rpx;
	color: #333333;
	line-height: 1.6;
}
</style>
