<!--
 * 部位力量卡片组件
 * 显示单个身体部位的力量评估数据
 -->
<template>
	<view class="part-card" :class="positionClass">
		<!-- 主信息行 -->
		<view class="main-row">
			<text class="part-name">{{ name }}</text>
			<text class="part-weight">{{ displayWeight }}KG</text>
		</view>
		
		<!-- 子项列表（热身、训练、挑战） -->
		<view class="sub-items">
			<view class="sub-item" v-for="(item, index) in subItems" :key="index">
				<text class="sub-label">{{ item.label }}</text>
				<text class="sub-value">{{ formatSubValue(item.value) }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	// 部位名称
	name: {
		type: String,
		required: true
	},
	// 主重量值
	weight: {
		type: Number,
		default: 0
	},
	// 子项数据 [{ label: '热身', value: 0 }, ...]
	subItems: {
		type: Array,
		default: () => [
			{ label: '热身', value: 0 },
			{ label: '训练', value: 0 },
			{ label: '挑战', value: 0 }
		]
	},
	// 位置：left / right，决定对齐方向
	position: {
		type: String,
		default: 'left'
	}
})

// 格式化重量显示
const displayWeight = computed(() => {
	return String(props.weight).padStart(2, '0')
})

// 位置样式类
const positionClass = computed(() => {
	return `position-${props.position}`
})

// 格式化子项值
const formatSubValue = (value) => {
	return String(value).padStart(2, '0') + 'KG'
}
</script>

<style scoped>
.part-card {
	display: flex;
	flex-direction: column;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 10rpx;
	padding: 10rpx 14rpx;
	box-shadow: 0 3rpx 12rpx rgba(0, 0, 0, 0.08);
	min-width: 150rpx;
	transform: scale(0.85);
	transform-origin: center center;
}

/* 左侧卡片 - 左对齐 */
.part-card.position-left {
	align-items: flex-start;
	transform-origin: left center;
}

/* 右侧卡片 - 右对齐 */
.part-card.position-right {
	align-items: flex-end;
	transform-origin: right center;
}

.main-row {
	display: flex;
	flex-direction: row;
	align-items: baseline;
	justify-content: space-between;
	width: 100%;
	margin-bottom: 6rpx;
}

.part-name {
	font-size: 24rpx;
	font-weight: 600;
	color: #333333;
}

.part-weight {
	font-size: 24rpx;
	font-weight: bold;
	color: #4CAF50;
}

.sub-items {
	display: flex;
	flex-direction: row;
	gap: 12rpx;
}

.sub-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2rpx;
}

.sub-label {
	font-size: 18rpx;
	color: #999999;
}

.sub-value {
	font-size: 18rpx;
	color: #666666;
}
</style>
