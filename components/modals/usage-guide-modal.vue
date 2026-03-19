<!--
 * 使用指南弹窗组件
 * 功能：展示产品使用指南列表和详情，支持列表/详情视图切换
 * 使用场景：产品使用说明、视频教程引导
 -->
<template>
	<ModalBase 
		:visible="visible"
		@update:visible="$emit('update:visible', $event)"
		:width="690"
		:border-radius="32"
		:close-on-click-overlay="false"
	>
		<!-- 列表视图 -->
		<view v-if="currentView === 'list'" class="guide-modal">
			<!-- 头部 -->
			<view class="modal-header">
				<text class="header-title">使用指南</text>
				<view class="close-btn" @click="handleClose">
					<image 
						class="close-icon" 
						src="/static/icons/general/btn_general_close.svg" 
						mode="aspectFit"
					/>
				</view>
			</view>
			
			<!-- 内容卡片 -->
			<view class="content-card">
				<!-- 欢迎文案 -->
				<view class="welcome-section">
					<text class="welcome-title">欢迎使用 tovigor 的 AI 智能健身镜</text>
					<text class="welcome-subtitle">请查收本产品的使用指南！</text>
				</view>
				
				<!-- 分割线 -->
				<view class="divider"></view>
				
				<!-- 指南列表 -->
				<view class="guide-list">
					<view 
						v-for="(item, index) in guideItems" 
						:key="index"
						class="guide-item"
						:class="{ 'guide-item-border': index < guideItems.length - 1 }"
						@click="handleItemClick(item)"
					>
						<text class="guide-item-text">{{ item.title }}</text>
						<text class="guide-item-arrow">›</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 详情视图 -->
		<view v-else class="guide-detail">
			<!-- 头部 -->
			<view class="detail-header">
				<view class="back-btn" @click="handleBack">
					<image 
						class="back-icon" 
						src="/static/icons/general/btn_general_back.svg" 
						mode="aspectFit"
					/>
				</view>
				<text class="header-title">使用指南</text>
				<view class="close-btn" @click="handleClose">
					<image 
						class="close-icon" 
						src="/static/icons/general/btn_general_close.svg" 
						mode="aspectFit"
					/>
				</view>
			</view>
			
			<!-- 详情内容卡片 -->
			<view class="detail-card">
				<text class="detail-title">{{ currentGuide.title }}</text>
				
				<!-- 图片容器 -->
				<view class="image-container">
					<image 
						class="guide-image" 
						:src="currentGuide.image" 
						mode="aspectFill"
					/>
					<!-- 文字标签 -->
					<view class="text-label">
						<text class="label-text">{{ currentGuide.textLabel || '文字指导' }}</text>
					</view>
				</view>
			</view>
		</view>
	</ModalBase>
</template>

<script setup>
import { ref, computed } from 'vue'
import ModalBase from './modal-base.vue'

// Props
const props = defineProps({
	// 是否显示弹窗
	visible: {
		type: Boolean,
		default: false
	},
	// 指南列表数据
	guideItems: {
		type: Array,
		default: () => [
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
		]
	}
})

// Emits
const emit = defineEmits(['update:visible', 'item-click', 'back', 'close'])

// 当前视图：list(列表) / detail(详情)
const currentView = ref('list')

// 当前选中的指南项
const currentGuide = ref({})

// 点击列表项
const handleItemClick = (item) => {
	currentGuide.value = item
	currentView.value = 'detail'
	emit('item-click', item)
}

// 点击返回
const handleBack = () => {
	currentView.value = 'list'
	emit('back')
}

// 点击关闭
const handleClose = () => {
	// 重置视图
	currentView.value = 'list'
	emit('update:visible', false)
	emit('close')
}

// 暴露方法
defineExpose({
	showDetail: (item) => {
		currentGuide.value = item
		currentView.value = 'detail'
	},
	showList: () => {
		currentView.value = 'list'
	}
})
</script>

<style scoped lang="scss">
/* ========== 列表视图 ========== */
.guide-modal {
	display: flex;
	flex-direction: column;
	background: #F5F5F5;
}

/* 头部 */
.modal-header {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 88rpx;
	background: #F5F5F5;
	border-bottom: 1rpx solid #E5E5E5;
}

.header-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

.close-btn {
	position: absolute;
	left: 24rpx;
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(0, 0, 0, 0.05);
	border-radius: 50%;
	transition: all 0.2s;
}

.close-btn:active {
	opacity: 0.7;
	transform: scale(0.95);
}

.close-icon {
	width: 24rpx;
	height: 24rpx;
}

/* 内容卡片 */
.content-card {
	margin: 30rpx 24rpx;
	background: #FFFFFF;
	border-radius: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
	overflow: hidden;
}

/* 欢迎区域 */
.welcome-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 40rpx 30rpx 30rpx;
	gap: 12rpx;
}

.welcome-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	text-align: center;
	line-height: 1.4;
}

.welcome-subtitle {
	font-size: 26rpx;
	color: #666666;
	text-align: center;
	line-height: 1.5;
}

/* 分割线 */
.divider {
	height: 1rpx;
	background: #E5E5E5;
	margin: 0 30rpx;
}

/* 指南列表 */
.guide-list {
	padding: 10rpx 0;
}

.guide-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx 30rpx;
	transition: all 0.2s;
}

.guide-item:active {
	background: rgba(0, 0, 0, 0.03);
	transform: scale(0.98);
}

.guide-item-border {
	border-bottom: 1rpx solid #F0F0F0;
}

.guide-item-text {
	font-size: 28rpx;
	color: #333333;
	line-height: 1.5;
}

.guide-item-arrow {
	font-size: 44rpx;
	color: #999999;
	font-weight: 300;
	line-height: 1;
	margin-left: 20rpx;
}

/* ========== 详情视图 ========== */
.guide-detail {
	display: flex;
	flex-direction: column;
	background: #F5F5F5;
	height: 100%;
}

/* 详情头部 */
.detail-header {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 88rpx;
	background: #F5F5F5;
	border-bottom: 1rpx solid #E5E5E5;
}

.back-btn {
	position: absolute;
	left: 24rpx;
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(0, 0, 0, 0.05);
	border-radius: 50%;
	transition: all 0.2s;
}

.back-btn:active {
	opacity: 0.7;
	transform: scale(0.95);
}

.back-icon {
	width: 24rpx;
	height: 24rpx;
}

.detail-header .close-btn {
	left: auto;
	right: 24rpx;
}

/* 详情卡片 */
.detail-card {
	margin: 30rpx 24rpx;
	padding: 32rpx 24rpx;
	background: #FFFFFF;
	border-radius: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
	display: flex;
	flex-direction: column;
	align-items: center;
}

.detail-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #333333;
	text-align: center;
	margin-bottom: 24rpx;
	line-height: 1.4;
}

/* 图片容器 */
.image-container {
	position: relative;
	width: 100%;
	border-radius: 20rpx;
	overflow: hidden;
}

.guide-image {
	width: 100%;
	height: 480rpx;
	display: block;
}

/* 文字标签 */
.text-label {
	position: absolute;
	bottom: 24rpx;
	left: 50%;
	transform: translateX(-50%);
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(10rpx);
	padding: 12rpx 32rpx;
	border-radius: 50rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.label-text {
	font-size: 24rpx;
	color: #333333;
	font-weight: 500;
}
</style>
