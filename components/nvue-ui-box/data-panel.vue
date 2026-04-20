<!--
 * 通用数据看板组件（nvue 兼容版）
 * 用途：展示训练相关数据（组数、热量、心率等）
 * 特点：可配置图标、标签、数值、单位，支持多种布局
 *
 * nvue 兼容说明：
 *   - Options API（不用 <script setup>）
 *   - 无 scoped / scss
 *   - 无 box-shadow / gap
 *   - padding / border-radius 拆写为四方向
 *   - image 宽高用内联 style
 *   - gap 用 margin 替代
 -->
<template>
	<view class="ndp-panel" :style="panelStyle">
		<!-- 图标区域 -->
		<view class="ndp-icon-wrap" v-if="icon">
			<image
				class="ndp-icon"
				:src="icon"
				mode="aspectFit"
				:style="{ width: '40rpx', height: '40rpx' }"
			></image>
		</view>

		<!-- 内容区域 -->
		<view class="ndp-content">
			<text class="ndp-label" :style="labelStyle">{{ label }}</text>
			<view class="ndp-value-row">
				<text class="ndp-value" :style="valueStyle">{{ formattedValue }}</text>
				<text class="ndp-unit" v-if="unit" :style="unitStyle">{{ unit }}</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	props: {
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
		// 圆角大小（rpx 数值，不含单位）
		borderRadius: {
			type: Number,
			default: 16
		}
	},

	computed: {
		formattedValue() {
			if (typeof this.value === 'number' && this.decimals > 0) {
				return this.value.toFixed(this.decimals)
			}
			return this.value
		},

		panelStyle() {
			const r = this.borderRadius + 'rpx'
			return {
				backgroundColor: this.background,
				borderTopLeftRadius: r,
				borderTopRightRadius: r,
				borderBottomLeftRadius: r,
				borderBottomRightRadius: r
			}
		},

		labelStyle() {
			return { color: this.labelColor }
		},

		valueStyle() {
			return { color: this.valueColor }
		},

		unitStyle() {
			return { color: this.unitColor }
		}
	}
}
</script>

<style>
.ndp-panel {
	flex-direction: row;
	align-items: center;
	padding-top: 10rpx;
	padding-bottom: 10rpx;
	padding-left: 14rpx;
	padding-right: 14rpx;
}

.ndp-icon-wrap {
	width: 48rpx;
	height: 48rpx;
	align-items: center;
	justify-content: center;
	margin-right: 8rpx;
}

.ndp-icon {
	width: 40rpx;
	height: 40rpx;
}

.ndp-content {
	flex: 1;
	flex-direction: column;
}

.ndp-label {
	font-size: 20rpx;
	color: #666666;
}

.ndp-value-row {
	flex-direction: row;
	align-items: baseline;
}

.ndp-value {
	font-size: 28rpx;
	font-weight: 700;
	color: #333333;
	margin-right: 4rpx;
}

.ndp-unit {
	font-size: 20rpx;
	color: #666666;
}
</style>
