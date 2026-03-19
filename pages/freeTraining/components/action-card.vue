<!--
 * 动作卡片组件
 * 功能：展示单个动作，支持选中状态
 * 使用场景：动作库页面的私有组件
 -->
<template>
	<view 
		class="action-card"
		:class="{ 'action-card--selected': selected }"
		@click="handleClick"
	>
		<!-- 封面图 -->
		<view class="card-cover">
			<image class="cover-img" :src="action.cover" mode="aspectFill" />
			<!-- 选中标记 -->
			<view v-if="selected" class="selected-badge">
				<view class="check-icon"></view>
			</view>
		</view>
		<!-- 底部信息 -->
		<view class="card-info">
			<text class="action-name">{{ action.name }}</text>
			<text class="detail-btn" @click.stop="handleDetail">详情</text>
		</view>
	</view>
</template>

<script setup>
const props = defineProps({
	// 动作数据
	action: {
		type: Object,
		required: true
		// 示例：
		// {
		//   id: 1,
		//   name: '低位上拉',
		//   cover: '/static/icons/.../ic_action_01.jpg',
		//   part: 'back'
		// }
	},
	// 是否选中
	selected: {
		type: Boolean,
		default: false
	}
})

const emits = defineEmits(['click', 'detail'])

const handleClick = () => {
	emits('click', props.action)
}

const handleDetail = () => {
	emits('detail', props.action)
}
</script>

<style scoped>
.action-card {
	width: 100%;
	background-color: #ffffff;
	border-radius: 24rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	border: 4rpx solid transparent;
	transition: all 0.2s ease;
}

.action-card--selected {
	border-color: #00C853;
	box-shadow: 0 4rpx 20rpx rgba(0, 200, 83, 0.25);
}

/* 封面区域 */
.card-cover {
	position: relative;
	width: 100%;
	height: 0;
	padding-bottom: 75%;
	overflow: hidden;
}

.cover-img {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
}

/* 选中标记 */
.selected-badge {
	position: absolute;
	right: 12rpx;
	top: 12rpx;
	width: 44rpx;
	height: 44rpx;
	background-color: #00C853;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* CSS 绘制勾选图标 */
.check-icon {
	width: 20rpx;
	height: 12rpx;
	border-left: 4rpx solid #ffffff;
	border-bottom: 4rpx solid #ffffff;
	transform: rotate(-45deg);
	margin-top: -4rpx;
}

/* 底部信息 */
.card-info {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
	padding: 16rpx 20rpx;
}

.action-name {
	font-size: 24rpx;
	font-weight: 600;
	color: #333333;
	text-align: center;
}

.detail-btn {
	font-size: 22rpx;
	color: #666666;
	padding: 4rpx 12rpx;
	background-color: #f0f0f0;
	border-radius: 16rpx;
}
</style>
