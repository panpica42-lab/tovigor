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
			>
				<view class="delete-action" @click.stop="deleteAction(index)">
					<text class="delete-action-text">删除</text>
				</view>
				<view
					ref="swipeContentRefs"
					class="swipe-content"
					:style="getSwipeContentStyle(index)"
					@longpress="startDrag(index, $event)"
					@touchstart="onTouchStart(index, $event)"
					@touchmove="onTouchMove(index, $event)"
					@touchend="onTouchEnd(index)"
					@touchcancel="onTouchEnd(index)"
				>
					<SelectedActionCard
						:action="item"
						:index="index"
						:is-dragging="draggingIndex === index"
						@update:sets="(val) => item.sets = val"
						@update:reps="(val) => item.reps = val"
					/>
				</view>
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

		<CustomToast ref="toastRef" />
	</view>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import { onLoad, onBackPress } from '@dcloudio/uni-app'
import ModalBase from '@/components/modals/modal-base.vue'
import CustomToast from '@/components/modals/custom-toast.vue'
import SelectedActionCard from './components/selected-action-card.vue'

// ========== 常量 ==========
const FALLBACK_SETS = 1
const FALLBACK_REPS = 12
const DELETE_ACTION_WIDTH = uni.upx2px(160)
const SWIPE_DIRECTION_THRESHOLD = 12
const SWIPE_OPEN_THRESHOLD = DELETE_ACTION_WIDTH / 2
const DRAG_REORDER_THRESHOLD = 80

// ========== 状态 ==========
const actionList = ref([])
const showBackModal = ref(false)
const toastRef = ref(null)

// 拖拽状态
const draggingIndex = ref(-1)
const startY = ref(0)

// 左滑删除状态（仅 openIndex / deletingIndex 需要响应式驱动模板）
const deletingIndex = ref(-1)
const swipeOpenIndex = ref(-1)

// 以下为高频触摸变量，不走 Vue 响应式，避免每帧触发 v-for 重渲染
let swipeMovingIndex = -1
let swipeOffsetX = 0
let touchStartX = 0
let touchStartY = 0
let touchStartOffsetX = 0
let gestureMode = ''

// swipe-content DOM 节点集合（v-for 模板 ref）
const swipeContentRefs = ref([])

// 通过 index 获取 swipe-content 真实 DOM 节点
const getSwipeEl = (index) => {
	const refItem = swipeContentRefs.value[index]
	if (!refItem) return null
	// uni-app 中 ref 可能是组件实例或 DOM 节点
	return refItem.$el || refItem
}

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
					sets: action.recommendedSets ?? FALLBACK_SETS,
					reps: action.recommendedReps ?? FALLBACK_REPS
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
	// 优先关闭已展开的删除操作
	if (swipeOpenIndex.value !== -1) {
		closeOpenedSwipe()
		return true
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
const startDrag = (index, e) => {
	closeSwipeState()
	draggingIndex.value = index
	gestureMode = 'drag'
	const touch = getTouchPoint(e)
	startY.value = touch ? touch.clientY : 0
	uni.vibrateShort()
}

const handleDragMove = (e) => {
	if (draggingIndex.value === -1) return
	
	const touch = getTouchPoint(e)
	if (!touch) return
	const currentY = touch.clientY
	
	if (startY.value === 0) {
		startY.value = currentY
		return
	}
	
	const deltaY = currentY - startY.value
	
	if (Math.abs(deltaY) > DRAG_REORDER_THRESHOLD) {
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
	resetTouchState()
}

// ========== 左滑删除 ==========
const getTouchPoint = (e) => {
	return e?.touches?.[0] || e?.changedTouches?.[0] || null
}

const closeOpenedSwipe = () => {
	swipeOpenIndex.value = -1
}

const closeSwipeState = () => {
	closeOpenedSwipe()
	swipeMovingIndex = -1
	swipeOffsetX = 0
	touchStartOffsetX = 0
}

const resetTouchState = () => {
	swipeMovingIndex = -1
	swipeOffsetX = 0
	touchStartX = 0
	touchStartY = 0
	touchStartOffsetX = 0
	gestureMode = ''
}

const onTouchStart = (index, e) => {
	if (draggingIndex.value !== -1) return

	const touch = getTouchPoint(e)
	if (!touch) return

	if (swipeOpenIndex.value !== -1 && swipeOpenIndex.value !== index) {
		closeOpenedSwipe()
	}

	touchStartX = touch.clientX
	touchStartY = touch.clientY
	touchStartOffsetX = swipeOpenIndex.value === index ? -DELETE_ACTION_WIDTH : 0
	swipeOffsetX = touchStartOffsetX
	swipeMovingIndex = -1
	gestureMode = ''
}

const onTouchMove = (index, e) => {
	if (draggingIndex.value === index) {
		handleDragMove(e)
		return
	}

	if (draggingIndex.value !== -1) return

	const touch = getTouchPoint(e)
	if (!touch) return

	const deltaX = touch.clientX - touchStartX
	const deltaY = touch.clientY - touchStartY

	if (!gestureMode) {
		if (
			Math.abs(deltaX) < SWIPE_DIRECTION_THRESHOLD &&
			Math.abs(deltaY) < SWIPE_DIRECTION_THRESHOLD
		) {
			return
		}

		if (Math.abs(deltaX) > Math.abs(deltaY)) {
			gestureMode = 'swipe'
			swipeMovingIndex = index
			// 关闭 CSS transition，让跟手时没有延迟
			const el = getSwipeEl(index)
			if (el) el.style.transition = 'none'
		} else {
			gestureMode = 'scroll'
			return
		}
	}

	if (gestureMode !== 'swipe') return

	// 水平滑动时阻止事件冒泡，避免触发 scroll-view 滚动
	e.stopPropagation && e.stopPropagation()

	let nextOffset = touchStartOffsetX + deltaX

	if (nextOffset > 0) {
		nextOffset = 0
	}

	if (nextOffset < -DELETE_ACTION_WIDTH) {
		nextOffset = -DELETE_ACTION_WIDTH
	}

	swipeOffsetX = nextOffset

	// 直接操作 DOM，完全绕过 Vue 响应式
	const el = getSwipeEl(index)
	if (el) {
		el.style.transform = `translate3d(${nextOffset}px, 0, 0)`
	}
}

const onTouchEnd = (index) => {
	if (draggingIndex.value === index) {
		endDrag()
		return
	}

	if (gestureMode === 'swipe' && swipeMovingIndex === index) {
		const shouldOpen = Math.abs(swipeOffsetX) >= SWIPE_OPEN_THRESHOLD

		// 恢复 CSS transition，让回弹/吸附有动画
		const el = getSwipeEl(index)
		if (el) {
			el.style.transition = 'transform 0.2s ease'
			el.style.transform = shouldOpen
				? `translate3d(${-DELETE_ACTION_WIDTH}px, 0, 0)`
				: 'translate3d(0, 0, 0)'
		}

		// 同步最终状态到 Vue ref（仅此一次触发响应式）
		swipeOpenIndex.value = shouldOpen ? index : -1
	}

	resetTouchState()
}

const getSwipeContentStyle = (index) => {
	// 删除动画：整张卡片滑出屏幕
	if (deletingIndex.value === index) {
		return {
			transform: 'translate3d(-100%, 0, 0)',
			transition: 'transform 0.25s ease-in'
		}
	}

	// 已展开的卡片保持展开位置
	if (swipeOpenIndex.value === index) {
		return {
			transform: `translate3d(${-DELETE_ACTION_WIDTH}px, 0, 0)`,
			transition: 'transform 0.2s ease'
		}
	}

	// 其他卡片：静态原位（不依赖任何高频变量）
	return {
		transform: 'translate3d(0, 0, 0)',
		transition: 'transform 0.2s ease'
	}
}

const deleteAction = (index) => {
	if (!actionList.value[index]) return
	if (deletingIndex.value !== -1) return // 防止连续点击

	// 先播放滑出动画
	deletingIndex.value = index
	closeSwipeState()

	// 动画结束后再移除数据
	setTimeout(() => {
		actionList.value.splice(index, 1)
		deletingIndex.value = -1
		resetTouchState()
		toastRef.value?.show('动作已删除')
	}, 250)
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
		url: '/pages/freeTraining/action-training-b',	// nvue 方案B
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
	position: relative;
	margin-bottom: 20rpx;
	border-radius: 24rpx;
	overflow: hidden;
}

.delete-action {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	width: 160rpx;
	background-color: #FF4D4F;
	display: flex;
	align-items: center;
	justify-content: center;
}

.delete-action-text {
	font-size: 30rpx;
	font-weight: 600;
	color: #ffffff;
}

.swipe-content {
	position: relative;
	z-index: 1;
	will-change: transform;
	backface-visibility: hidden;
	touch-action: pan-y;
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
