<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<image 
				class="back-btn" 
				src="/static/icons/general/btn_general_back.svg" 
				mode="aspectFit"
				@click="handleBack"
			/>
			<text class="nav-title">选中动作</text>
			<view class="nav-placeholder"></view>
		</view>

		<!-- 动作列表 -->
		<scroll-view class="action-list" scroll-y :show-scrollbar="false">
			<view 
				v-for="(item, index) in actionList" 
				:key="item.id"
				class="card-wrapper"
				@longpress="startDrag(index)"
				@touchmove.stop.prevent="onTouchMove"
				@touchend="endDrag"
			>
				<SelectedActionCard
					:action="item"
					:index="index"
					:is-dragging="draggingIndex === index"
					@update:sets="(val) => item.sets = val"
					@update:reps="(val) => item.reps = val"
				/>
			</view>
		</scroll-view>

		<!-- 底部按钮 -->
		<view class="bottom-bar">
			<view class="start-btn" @click="startTraining">
				<text class="start-btn-text">开始训练</text>
			</view>
		</view>

		<!-- 返回确认弹窗 -->
		<ModalBase 
			v-model:visible="showBackModal"
			:width="500"
			:border-radius="32"
		>
			<view class="confirm-modal">
				<text class="confirm-title">确认返回</text>
				<text class="confirm-text">返回将丢失当前配置，确定要返回吗？</text>
				<view class="confirm-btns">
					<view class="confirm-btn confirm-btn--cancel" @click="showBackModal = false">
						<text class="btn-text">取消</text>
					</view>
					<view class="confirm-btn confirm-btn--confirm" @click="confirmBack">
						<text class="btn-text btn-text--white">确认</text>
					</view>
				</view>
			</view>
		</ModalBase>
	</view>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import { onLoad, onBackPress } from '@dcloudio/uni-app'
import ModalBase from '@/components/modals/modal-base.vue'
import SelectedActionCard from './components/selected-action-card.vue'

// ========== 常量 ==========
const DEFAULT_SETS = 1
const DEFAULT_REPS = 12

// ========== 状态 ==========
const actionList = ref([])
const showBackModal = ref(false)

// 拖拽状态
const draggingIndex = ref(-1)
const startY = ref(0)

// ========== 生命周期 ==========
onLoad(() => {
	const instance = getCurrentInstance()
	if (instance && instance.proxy) {
		const eventChannel = instance.proxy.getOpenerEventChannel()
		if (eventChannel && eventChannel.on) {
			eventChannel.on('selectedActions', (data) => {
				// 为每个动作添加组数和次数的默认值
				actionList.value = data.map(action => ({
					...action,
					sets: DEFAULT_SETS,
					reps: DEFAULT_REPS
				}))
				console.log('接收到的动作数据：', actionList.value)
			})
		}
	}
})

// Android 返回键处理
onBackPress((options) => {
	// 代码调用的返回（navigateBack），不拦截
	if (options.from === 'navigateBack') {
		return false
	}
	// 弹窗已显示，关闭弹窗
	if (showBackModal.value) {
		showBackModal.value = false
		return true
	}
	// 显示确认弹窗
	showBackModal.value = true
	return true
})

// ========== 拖拽排序 ==========
const startDrag = (index) => {
	draggingIndex.value = index
	uni.vibrateShort()
}

const onTouchMove = (e) => {
	if (draggingIndex.value === -1) return
	
	const touch = e.touches[0]
	const currentY = touch.clientY
	
	if (startY.value === 0) {
		startY.value = currentY
		return
	}
	
	const deltaY = currentY - startY.value
	const threshold = 80
	
	if (Math.abs(deltaY) > threshold) {
		const direction = deltaY > 0 ? 1 : -1
		const newIndex = draggingIndex.value + direction
		
		if (newIndex >= 0 && newIndex < actionList.value.length) {
			// 交换位置
			const temp = actionList.value[draggingIndex.value]
			actionList.value[draggingIndex.value] = actionList.value[newIndex]
			actionList.value[newIndex] = temp
			draggingIndex.value = newIndex
			startY.value = currentY
			uni.vibrateShort()
		}
	}
}

const endDrag = () => {
	draggingIndex.value = -1
	startY.value = 0
}

// ========== 事件处理 ==========
const handleBack = () => {
	showBackModal.value = true
}

const confirmBack = () => {
	showBackModal.value = false
	uni.navigateBack()
}

const startTraining = () => {
	if (actionList.value.length === 0) {
		uni.showToast({
			title: '请先添加动作',
			icon: 'none'
		})
		return
	}
	
	uni.navigateTo({
		url: '/pages/freeTraining/action-training',
		success: (res) => {
			res.eventChannel.emit('trainingActions', actionList.value)
		}
	})
}
</script>

<style scoped>
.container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f5f5f5;
	padding: 0 24rpx;
	box-sizing: border-box;
}

/* ========== 顶部导航栏 ========== */
.nav-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 100rpx;
	padding-top: 20rpx;
	flex-shrink: 0;
}

.back-btn {
	width: 60rpx;
	height: 60rpx;
}

.nav-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.nav-placeholder {
	width: 60rpx;
}

/* ========== 动作列表 ========== */
.action-list {
	flex: 1;
	margin-top: 20rpx;
}

.card-wrapper {
	margin-bottom: 20rpx;
}

/* ========== 底部按钮 ========== */
.bottom-bar {
	padding: 20rpx 0 40rpx;
	flex-shrink: 0;
}

.start-btn {
	width: 100%;
	height: 88rpx;
	background-color: #00C853;
	border-radius: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.start-btn:active {
	background-color: #00a844;
}

.start-btn-text {
	font-size: 32rpx;
	font-weight: 600;
	color: #ffffff;
}

/* ========== 确认弹窗 ========== */
.confirm-modal {
	padding: 40rpx 32rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.confirm-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 24rpx;
}

.confirm-text {
	font-size: 28rpx;
	color: #666666;
	text-align: center;
	margin-bottom: 40rpx;
}

.confirm-btns {
	display: flex;
	flex-direction: row;
	gap: 24rpx;
	width: 100%;
}

.confirm-btn {
	flex: 1;
	height: 80rpx;
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.confirm-btn--cancel {
	background-color: #f0f0f0;
}

.confirm-btn--confirm {
	background-color: #00C853;
}

.btn-text {
	font-size: 28rpx;
	font-weight: 600;
	color: #333333;
}

.btn-text--white {
	color: #ffffff;
}
</style>
