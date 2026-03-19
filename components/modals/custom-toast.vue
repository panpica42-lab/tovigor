<!--
 * 自定义轻量提示组件
 * 功能：居中显示提示文字，自动消失
 * 使用方式：通过 ref 调用 show(message, duration) 方法
 -->
<template>
	<view v-if="visible" class="custom-toast">
		<text class="custom-toast-text">{{ message }}</text>
	</view>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
let timer = null

/**
 * 显示提示
 * @param {string} msg - 提示文字
 * @param {number} duration - 显示时长（毫秒），默认 1500
 */
const show = (msg, duration = 1500) => {
	if (timer) clearTimeout(timer)
	message.value = msg
	visible.value = true
	timer = setTimeout(() => {
		visible.value = false
	}, duration)
}

// 暴露方法给父组件
defineExpose({ show })
</script>

<style scoped>
.custom-toast {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	padding: 24rpx 48rpx;
	background-color: rgba(0, 0, 0, 0.75);
	border-radius: 16rpx;
	z-index: 10000;
}

.custom-toast-text {
	font-size: 28rpx;
	color: #ffffff;
	white-space: nowrap;
}
</style>
