<!--
 * 轻量级弹窗容器组件（最底层）
 * 功能：仅提供遮罩层和显示/隐藏逻辑，无任何样式和动画
 * 使用场景：需要完全自定义样式和动画的弹窗，或作为其他弹窗组件的最底层基础
 -->
<template>
	<view 
		v-if="visible" 
		class="modal-light-overlay"
		@click="handleOverlayClick"
	>
		<!-- 完全自定义的内容插槽 -->
		<slot></slot>
	</view>
</template>

<script setup>
// Props
const props = defineProps({
	// 是否显示弹窗
	visible: {
		type: Boolean,
		default: false
	},
	// 是否点击遮罩层关闭
	closeOnClickOverlay: {
		type: Boolean,
		default: true
	}
})

// Emits
const emit = defineEmits(['update:visible', 'overlay-click'])

// 点击遮罩层
const handleOverlayClick = (e) => {
	// 判断是否点击的是遮罩层本身（不是子元素）
	if (e.target === e.currentTarget && props.closeOnClickOverlay) {
		emit('overlay-click')
		emit('update:visible', false)
	}
}

// 关闭弹窗
const close = () => {
	emit('update:visible', false)
}

// 打开弹窗
const open = () => {
	emit('update:visible', true)
}

// 暴露方法给父组件
defineExpose({
	close,
	open
})
</script>

<style scoped>
/* 只提供最基础的遮罩层样式 */
.modal-light-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 9999;
}
</style>
