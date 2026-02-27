<!--
 * 体态姿势评估页面
 * 功能：通过 AI 拍摄进行人体体态姿势全方位分析
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
			<text class="header-title">体态姿势</text>
		</view>
		
		<!-- 内容区域 -->
		<view class="content">
			<text class="placeholder-text">体态姿势评估页面 - 待开发</text>
		</view>
	</view>
</template>

<script setup>
// 返回上一页
const goBack = () => {
	uni.navigateBack()
}
</script>

<style scoped lang="scss">
.container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #F5F5F5;
}

.header {
	display: flex;
	align-items: center;
	padding: 20rpx 30rpx;
	padding-top: calc(var(--status-bar-height, 44px) + 20rpx);
	background-color: #FFFFFF;
}

.back-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon {
	width: 40rpx;
	height: 40rpx;
}

.header-title {
	flex: 1;
	text-align: center;
	font-size: 32rpx;
	font-weight: 600;
	color: #333333;
	margin-right: 60rpx;
}

.content {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
}

.placeholder-text {
	font-size: 28rpx;
	color: #999999;
}
</style>
