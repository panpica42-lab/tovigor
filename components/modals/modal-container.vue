<!--
 * 通用弹窗容器组件（精简版）
 * 功能：遮罩层 + 居中弹窗 + 淡入动画
 * 可配置：宽度、圆角、背景色、点击遮罩关闭
 -->
<template>
	<view 
		v-if="visible" 
		class="modal-overlay" 
		:class="{ 'modal-visible': visible }"
		@click="handleOverlayClick"
	>
		<view 
			class="modal-box" 
			:class="{ 'modal-box-show': visible }"
			:style="boxStyle"
			@click.stop
		>
			<slot></slot>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	// 是否显示
	visible: {
		type: Boolean,
		default: false
	},
	// 点击遮罩关闭
	closeOnClickOverlay: {
		type: Boolean,
		default: true
	},
	// 宽度（rpx）
	width: {
		type: [String, Number],
		default: 600
	},
	// 圆角（rpx）
	borderRadius: {
		type: [String, Number],
		default: 24
	},
	// 背景色
	backgroundColor: {
		type: String,
		default: '#FFFFFF'
	}
})

const emit = defineEmits(['update:visible', 'close'])

// 弹窗样式
const boxStyle = computed(() => ({
	width: typeof props.width === 'number' ? `${props.width}rpx` : props.width,
	borderRadius: typeof props.borderRadius === 'number' ? `${props.borderRadius}rpx` : props.borderRadius,
	backgroundColor: props.backgroundColor
}))

// 点击遮罩
const handleOverlayClick = () => {
	if (props.closeOnClickOverlay) {
		emit('update:visible', false)
		emit('close')
	}
}
</script>

<style scoped lang="scss">
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 9999;
	opacity: 0;
	transition: opacity 0.3s ease;
}

.modal-visible {
	opacity: 1;
}

.modal-box {
	background: #FFFFFF;
	box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.2);
	overflow: hidden;
	opacity: 0;
	transition: opacity 0.3s ease;
}

.modal-box-show {
	opacity: 1;
}
</style>
