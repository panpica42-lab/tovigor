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
			<!-- AI 助手标签 -->
			<view class="ai-badge">
				<text class="ai-text">AI助手</text>
			</view>
			
			<!-- 提示文字框 -->
			<view class="tip-card">
				<text class="tip-text">请按照指示连接外部体脂秤进行评估</text>
			</view>
			
			<!-- 体脂秤图片 -->
			<view class="device-image-wrapper">
				<image 
					class="device-image" 
					src="/static/icons/smartAssessActivity/ji-neng/ic_body_fat_scale.png" 
					mode="widthFix"
				/>
			</view>
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

/* AI 助手标签 */
.ai-badge {
	background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
	border-radius: 50rpx;
	padding: 12rpx 32rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(255, 165, 0, 0.3);
}

.ai-text {
	font-size: 26rpx;
	font-weight: bold;
	color: #FFFFFF;
	letter-spacing: 2rpx;
}

/* 提示文字框 */
.tip-card {
	width: 100%;
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 30rpx 24rpx;
	margin-bottom: 60rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.tip-text {
	font-size: 28rpx;
	color: #333333;
	text-align: center;
	line-height: 1.6;
	display: block;
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
