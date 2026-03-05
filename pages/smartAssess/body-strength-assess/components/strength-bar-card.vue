<!--
 * 力量柱状图卡片组件
 * 功能：展示力量评估数据的双柱状图
 * 每个卡片包含2个垂直力量条槽
 -->
<template>
	<view class="strength-bar-card">
		<!-- 顶部标签 -->
		<text class="card-label">{{ label }}</text>
		
		<!-- 双柱容器 -->
		<view class="bars-container">
			<!-- 左侧力量条 -->
			<view class="bar-wrapper">
				<view class="bar-slot">
					<!-- 填充柱（从底部向上） -->
					<view 
						class="bar-fill"
						:class="{ 'bar-fill-active': values[0] > 0 }"
						:style="{ height: getBarHeight(0) }"
					></view>
				</view>
				<!-- 数值标签 -->
				<view 
					v-if="values[0] > 0" 
					class="value-tag"
					:style="{ bottom: getTagPosition(0) }"
				>
					<text class="value-text">{{ values[0] }}{{ unit }}</text>
				</view>
			</view>
			
			<!-- 右侧力量条 -->
			<view class="bar-wrapper">
				<view class="bar-slot">
					<!-- 填充柱（从底部向上） -->
					<view 
						class="bar-fill"
						:class="{ 'bar-fill-active': values[1] > 0 }"
						:style="{ height: getBarHeight(1) }"
					></view>
				</view>
				<!-- 数值标签 -->
				<view 
					v-if="values[1] > 0" 
					class="value-tag"
					:style="{ bottom: getTagPosition(1) }"
				>
					<text class="value-text">{{ values[1] }}{{ unit }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	// 卡片标签（如"最大值"）
	label: {
		type: String,
		default: '最大值'
	},
	// 两个力量条的数值 [left, right]
	values: {
		type: Array,
		default: () => [0, 0]
	},
	// 最大值（量程上限）
	maxValue: {
		type: Number,
		default: 100
	},
	// 单位
	unit: {
		type: String,
		default: 'KG'
	}
})

// 计算柱子高度百分比
const getBarHeight = (index) => {
	const value = props.values[index] || 0
	const percent = Math.min((value / props.maxValue) * 100, 100)
	return `${percent}%`
}

// 计算数值标签位置
const getTagPosition = (index) => {
	const value = props.values[index] || 0
	const percent = Math.min((value / props.maxValue) * 100, 100)
	// 标签位于柱子顶部
	return `${percent}%`
}
</script>

<style scoped lang="scss">
.strength-bar-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 16rpx 12rpx 0;
	background: rgba(255, 255, 255, 0.9);
	border-radius: 16rpx;
	min-width: 140rpx;
}

/* 顶部标签 */
.card-label {
	font-size: 22rpx;
	color: #666666;
	margin-bottom: 8rpx;
}

/* 数值显示区域（xxKG） */
.value-display {
	font-size: 28rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 16rpx;
	height: 36rpx;
}

/* 双柱容器 - 半开放式（底部开放） */
.bars-container {
	display: flex;
	gap: 12rpx;
	padding: 12rpx 12rpx 0;
	background: #E8E8E8;
	border-radius: 24rpx 24rpx 0 0;
}

/* 单个柱子包装器 */
.bar-wrapper {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
}

/* 柱子槽（外框）- 矩形无圆角 */
.bar-slot {
	width: 36rpx;
	height: 200rpx;
	background: #F5F5F5;
	border-radius: 0;
	overflow: hidden;
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
}

/* 填充柱（从底部向上）- 矩形无圆角 */
.bar-fill {
	width: 100%;
	background: #E0E0E0;
	border-radius: 0;
	transition: height 0.5s ease-out;
}

/* 激活状态：绿色渐变（底部深→顶部浅） */
.bar-fill-active {
	background: linear-gradient(to top, #4CAF50, #8BC34A, #C5E1A5);
}

/* 数值标签（柱子旁边） */
.value-tag {
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	background: linear-gradient(135deg, #4CAF50, #66BB6A);
	padding: 4rpx 10rpx;
	border-radius: 6rpx;
	white-space: nowrap;
	z-index: 10;
}

.value-text {
	font-size: 18rpx;
	color: #FFFFFF;
	font-weight: 500;
}
</style>
