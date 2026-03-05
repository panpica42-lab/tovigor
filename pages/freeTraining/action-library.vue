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
			<text class="nav-title">动作库</text>
			<view class="nav-placeholder"></view>
		</view>

		<!-- 占位内容 -->
		<view class="placeholder-area">
			<text class="placeholder-icon">🏋️</text>
			<text class="placeholder-text">动作库正在开发中...</text>
		</view>
	</view>
</template>

<script setup>
// 返回上一页
const goBack = () => {
	uni.navigateBack()
}
</script>

<style scoped>
.container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f5f5f5;
	padding: 0 32rpx;
	box-sizing: border-box;
}

/* 顶部导航栏 */
.nav-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 100rpx;
	padding-top: 20rpx;
}

.back-btn {
	width: 60rpx;
	height: 60rpx;
}

.nav-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.nav-placeholder {
	width: 60rpx;
}

/* 占位区域 */
.placeholder-area {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.placeholder-icon {
	font-size: 120rpx;
	margin-bottom: 32rpx;
}

.placeholder-text {
	font-size: 32rpx;
	color: #999;
}
</style>
