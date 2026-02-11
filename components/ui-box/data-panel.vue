<!--
 * 通用数据看板组件
 * 用途：展示训练相关数据（组数、热量、心率等）
 * 特点：可配置图标、标签、数值、单位，支持多种布局
 -->
<template>
	<view class="data-panel" :style="panelStyle">
		<!-- 图标区域 -->
		<view class="panel-icon-wrap" v-if="icon">
			<image class="panel-icon" :src="icon" mode="aspectFit" />
		</view>
		
		<!-- 内容区域 -->
		<view class="panel-content">
			<text class="panel-label" :style="labelStyle">{{ label }}</text>
			<view class="panel-value-row">
				<text class="panel-value" :style="valueStyle">{{ formattedValue }}</text>
				<text class="panel-unit" v-if="unit" :style="unitStyle">{{ unit }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	// 图标路径
	icon: {
		type: String,
		default: ''
	},
	// 标签文本
	label: {
		type: String,
		required: true
	},
	// 数值（支持数字或字符串）
	value: {
		type: [Number, String],
		required: true
	},
	// 单位（可选，如 "次/分钟"）
	unit: {
		type: String,
		default: ''
	},
	// 小数位数（仅对数字类型生效）
	decimals: {
		type: Number,
		default: 0
	},
	// 背景颜色
	background: {
		type: String,
		default: 'rgba(255, 255, 255, 0.6)'
	},
	// 标签颜色
	labelColor: {
		type: String,
		default: '#666666'
	},
	// 数值颜色
	valueColor: {
		type: String,
		default: '#333333'
	},
	// 单位颜色
	unitColor: {
		type: String,
		default: '#666666'
	},
	// 圆角大小
	borderRadius: {
		type: String,
		default: '16rpx'
	},
	// 是否显示阴影
	showShadow: {
		type: Boolean,
		default: true
	}
})

// 格式化数值
const formattedValue = computed(() => {
	if (typeof props.value === 'number' && props.decimals > 0) {
		return props.value.toFixed(props.decimals)
	}
	return props.value
})

// 面板样式
const panelStyle = computed(() => ({
	background: props.background,
	borderRadius: props.borderRadius,
	boxShadow: props.showShadow ? '0 4rpx 12rpx rgba(0, 0, 0, 0.1)' : 'none'
}))

// 标签样式
const labelStyle = computed(() => ({
	color: props.labelColor
}))

// 数值样式
const valueStyle = computed(() => ({
	color: props.valueColor
}))

// 单位样式
const unitStyle = computed(() => ({
	color: props.unitColor
}))
</script>

<style scoped lang="scss">
.data-panel {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 8rpx;
	padding: 10rpx 14rpx;
}

.panel-icon-wrap {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.panel-icon {
	width: 40rpx;
	height: 40rpx;
}

.panel-content {
	display: flex;
	flex-direction: column;
	flex: 1;
}

.panel-label {
	font-size: 20rpx;
}

.panel-value-row {
	display: flex;
	flex-direction: row;
	align-items: baseline;
	gap: 4rpx;
}

.panel-value {
	font-size: 28rpx;
	font-weight: 700;
}

.panel-unit {
	font-size: 20rpx;
}
</style>
