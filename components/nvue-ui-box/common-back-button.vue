<!--
 * 通用返回按钮组件（nvue 兼容版）
 * 功能：标准化的返回按钮，提供统一的视觉效果和交互体验
 * 使用场景：nvue 页面中需要返回功能的地方
 *
 * nvue 兼容说明：
 *   - Options API（不用 <script setup>）
 *   - 无 scoped / scss
 *   - 无 cursor / user-select / :active / pointer-events
 *   - image 宽高用内联 style
 -->
<template>
	<view class="nbb-back-btn" @click="handleClick">
		<view class="nbb-back-arrow"></view>
	</view>
</template>

<script>
export default {
	props: {
		// 是否使用默认返回行为（uni.navigateBack）
		useDefault: {
			type: Boolean,
			default: true
		}
	},

	emits: ['click'],

	methods: {
		handleClick() {
			this.$emit('click')
			if (this.useDefault) {
				uni.navigateBack()
			}
		}
	}
}
</script>

<style>
.nbb-back-btn {
	width: 70rpx;
	height: 70rpx;
	align-items: center;
	justify-content: center;
	border-radius: 35rpx;
	background-color: rgba(58, 58, 60, 0.82);
}

.nbb-back-arrow {
	width: 22rpx;
	height: 22rpx;
	border-left-width: 5rpx;
	border-left-style: solid;
	border-left-color: #FFFFFF;
	border-bottom-width: 5rpx;
	border-bottom-style: solid;
	border-bottom-color: #FFFFFF;
	transform: rotate(45deg);
	margin-left: 6rpx;
}
</style>
