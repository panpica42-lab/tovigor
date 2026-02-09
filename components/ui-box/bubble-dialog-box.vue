<!--
 * 气泡对话框组件
 * 功能：展示带角色标签和头像的气泡提示框
 * 使用场景：训练提示、教程引导、AI对话、操作提示等
 * 
 * 设计结构：
 * - 上方小气泡：蓝色胶囊（名字 + 头像）
 * - 下方大气泡：白色对话框（对话内容）
 * - 两个气泡紧密连接，视觉上是一个整体
 -->
<template>
	<view class="bubble-dialog">
		<!-- 上方小气泡：角色名字 + 头像 -->
		<view 
			class="bubble-header" 
			:class="{ 'bubble-header-clickable': clickable }"
			:style="{ background: badgeBackground }"
			@click="handleHeaderClick"
		>
			<text class="role-text">{{ roleLabel }}</text>
			<image class="role-avatar" :src="avatarUrl" mode="aspectFit" />
		</view>

		<!-- 下方大气泡：对话内容 -->
		<view class="bubble-content" :style="{
			background: contentBackground,
			boxShadow: showShadow ? '0 6rpx 20rpx rgba(0, 0, 0, 0.15)' : 'none'
		}">
			<!-- 插槽优先，如果没有插槽内容则显示 text -->
			<slot>
				<text class="bubble-text" :style="{ color: textColor }">{{ text }}</text>
			</slot>
		</view>
	</view>
</template>

<script setup>
// Props
const props = defineProps({
	// 是否可点击切换教练
	clickable: {
		type: Boolean,
		default: false
	},
	// 角色标签文字（例如："Vince(艾斯)"、"AI助手"）
	roleLabel: {
		type: String,
		default: 'AI助手'
	},
	// 头像图片地址
	avatarUrl: {
		type: String,
		default: '/static/icons/homeActivity/trimming.png'
	},
	// 标签背景色/渐变
	badgeBackground: {
		type: String,
		default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
	},
	// 提示文字内容（如果使用插槽则忽略此参数）
	text: {
		type: String,
		default: ''
	},
	// 文字颜色
	textColor: {
		type: String,
		default: '#333333'
	},
	// 内容框背景色
	contentBackground: {
		type: String,
		default: 'rgba(255, 255, 255, 0.85)'  // 这里改默认透明度
	},
	// 是否显示阴影
	showShadow: {
		type: Boolean,
		default: true
	}
})

// Emits
const emits = defineEmits(['coach-click'])

// 点击头部处理
const handleHeaderClick = () => {
	if (props.clickable) {
		emits('coach-click')
	}
}
</script>

<style scoped lang="scss">
/* ========== 整体容器 ========== */
.bubble-dialog {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	/* 贴左对齐 */
}

/* ========== 上方小气泡：名字 + 头像（胶囊形状） ========== */

.bubble-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	align-self: flex-start;
	padding: 0rpx 10rpx;    /* 上下内边距稍微小一点，左右内边距宽一点 */
	border-radius: 24rpx 24rpx 0 0;   /* 只保留上边两个圆角，下面是直线 */
	margin-left: 30rpx;    /* 整个小气泡向右偏一点，数值你可以按视觉再微调 */
	margin-bottom: -6rpx;  /* 与下方大气泡做一点重叠，看起来是连在一起的 */
	overflow: hidden;
	/* 保证底边是干净的一条直线 */
}

/* 可点击状态 */
.bubble-header-clickable {
	cursor: pointer;
}

.bubble-header-clickable:active {
	opacity: 0.8;
}

/* 角色名字文字 */
.role-text {
	font-size: 24rpx;
	font-weight: 600;
	color: #FFFFFF;
	margin-right: 12rpx;
}

/* 头像：直接展示整张透明 PNG，不再裁成圆形 */
.role-avatar {
	width: 66rpx;  /* 这里按你图的比例调 */
	height: 66rpx;
	margin-left: 10rpx;
	border-radius: 0;
	border: none;
	flex-shrink: 0;
}

/* ========== 下方大气泡：对话内容 ========== */
.bubble-content {
	padding: 16rpx 16rpx;  /* 内边距 */
	border-radius: 24rpx;  /* 四个角都是圆角 */
	transition: all 0.2s ease;
	/* 移除 align-self: stretch，让气泡根据内容自适应宽度 */
	max-width: 100%;  /* 防止超出容器 */
	/* 横向拉伸填满容器 */
}

/* 对话文字 */
.bubble-text {
	font-size: 26rpx;
	line-height: 1.5;
	display: block;
	word-wrap: break-word;  /* 长文本自动换行 */
}
</style>
