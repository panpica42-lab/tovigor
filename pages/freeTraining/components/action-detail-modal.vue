<!--
 * 动作详情弹窗组件
 * 功能：展示动作详情，支持选择添加
 * 使用场景：动作库页面的私有组件
 -->
<template>
	<ModalBase
		v-model:visible="showModal"
		:width="500"
		:border-radius="32"
		:close-on-click-overlay="true"
		@close="handleClose"
	>
		<view class="modal-content">
			<!-- 关闭按钮 -->
			<view class="close-btn" @click="handleClose">
				<image 
					class="close-icon" 
					src="/static/icons/general/btn_general_close.svg" 
					mode="aspectFit"
				/>
			</view>
			
			<!-- 动作名称 -->
			<text class="action-title">{{ action?.name }}</text>
			
			<!-- 动作图片 -->
			<view class="image-container">
				<image 
					class="action-image" 
					:src="action?.cover" 
					mode="aspectFit"
				/>
			</view>
			
			<!-- 选择添加按钮 -->
			<view 
				class="select-btn"
				:class="{ 'select-btn--selected': isSelected }"
				@click="handleSelect"
			>
				<text class="select-btn-text">{{ isSelected ? '已添加' : '选择添加' }}</text>
			</view>
		</view>
	</ModalBase>
</template>

<script setup>
import { computed } from 'vue'
import ModalBase from '@/components/modals/modal-base.vue'

const props = defineProps({
	// 控制弹窗显示
	visible: {
		type: Boolean,
		default: false
	},
	// 动作数据
	action: {
		type: Object,
		default: null
	},
	// 是否已选中
	isSelected: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['update:visible', 'select', 'close'])

// 双向绑定 visible
const showModal = computed({
	get: () => props.visible,
	set: (val) => emit('update:visible', val)
})

// 关闭弹窗
const handleClose = () => {
	emit('update:visible', false)
	emit('close')
}

// 选择添加
const handleSelect = () => {
	emit('select', props.action)
	// 选中后自动关闭弹窗
	handleClose()
}
</script>

<style scoped>
.modal-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 32rpx 32rpx 40rpx;
	position: relative;
}

/* 关闭按钮 */
.close-btn {
	position: absolute;
	left: 16rpx;
	top: 16rpx;
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.close-icon {
	width: 36rpx;
	height: 36rpx;
	opacity: 0.6;
}

/* 动作标题 */
.action-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	text-align: center;
	margin-bottom: 24rpx;
}

/* 图片容器 */
.image-container {
	width: 420rpx;
	height: 420rpx;
	border-radius: 24rpx;
	overflow: hidden;
	background-color: #f8f8f8;
	margin-bottom: 32rpx;
}

.action-image {
	width: 100%;
	height: 100%;
}

/* 选择按钮 */
.select-btn {
	width: 280rpx;
	height: 72rpx;
	background-color: #00C853;
	border-radius: 36rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.select-btn--selected {
	background-color: #999999;
}

.select-btn-text {
	font-size: 28rpx;
	font-weight: 600;
	color: #ffffff;
}
</style>
