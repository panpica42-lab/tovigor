<!--
 * 力量滑块组件（nvue 兼容版）
 * 用途：提供与训练页一致的拖动中 / 提交后事件接口
 *
 * nvue 兼容说明：
 *   - 使用原生 slider，避免 renderjs / DOM 依赖
 *   - 不依赖自定义组件 v-model，统一走 value + dragging/change 事件
 *   - 不使用 scoped / scss
 -->
<template>
	<view class="nps-slider-wrap" :style="wrapStyle">
		<slider
			class="nps-slider"
			:value="innerValue"
			:min="min"
			:max="max"
			:step="step"
			:disabled="disabled"
			:activeColor="activeTrackColor"
			:backgroundColor="trackColor"
			:block-color="thumbColor"
			:block-size="blockSize"
			@changing="handleChanging"
			@change="handleChange"
		></slider>
	</view>
</template>

<script>
export default {
	name: 'PowerSlider',

	props: {
		value: {
			type: Number,
			default: 30
		},
		min: {
			type: Number,
			default: 5
		},
		max: {
			type: Number,
			default: 55
		},
		step: {
			type: Number,
			default: 1
		},
		disabled: {
			type: Boolean,
			default: false
		},
		blockSize: {
			type: Number,
			default: 22
		}
	},

	data() {
		return {
			innerValue: this.value
		}
	},

	computed: {
		wrapStyle() {
			return {
				opacity: this.disabled ? 0.55 : 1
			}
		},

		activeTrackColor() {
			return this.disabled ? '#BDBDBD' : '#4CAF50'
		},

		trackColor() {
			return this.disabled ? '#D9D9D9' : '#E8E8E8'
		},

		thumbColor() {
			return this.disabled ? '#E0E0E0' : '#FFFFFF'
		}
	},

	watch: {
		value(newValue) {
			this.innerValue = newValue
		}
	},

	methods: {
		handleChanging(e) {
			const value = e && e.detail ? e.detail.value : this.innerValue
			this.innerValue = value
			this.$emit('dragging', value)
		},

		handleChange(e) {
			const value = e && e.detail ? e.detail.value : this.innerValue
			this.innerValue = value
			this.$emit('change', value)
		}
	}
}
</script>

<style>
.nps-slider-wrap {
	height: 48rpx;
	justify-content: center;
}

.nps-slider {
	flex: 1;
	height: 48rpx;
}
</style>
