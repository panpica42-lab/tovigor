<!--
 * 评估完成弹窗组件
 * 功能：显示部位评估完成状态，自动倒计时跳转到下一部位
 * 使用场景：力量评估完成某个部位后弹出
 -->
<template>
	<view v-if="visible" class="modal-overlay" @click="handleOverlayClick">
		<!-- 包装器：垂直排列弹窗卡片 + 关闭按钮 -->
		<view class="modal-wrapper" @click.stop>
			<view class="modal-card">
				<!-- 上半部分：绿色区域 -->
			<view class="modal-header">
				<!-- 顶部胶囊把手 -->
				<view class="handle-bar"></view>
				
				<!-- 标题区域 -->
				<view class="title-section">
					<!-- 左侧图标 -->
					<image 
						class="icon-left" 
						src="/static/icons/smartAssessActivity/li-liang/pop-up_elementA.png" 
						mode="aspectFit"
					/>
					
					<!-- 中间标题文案 -->
					<text class="title-text">" 已完成{{ currentPartName }} "</text>
					
					<!-- 右侧插画人物 -->
					<image 
						class="icon-right" 
						src="/static/icons/smartAssessActivity/li-liang/pop-up_elementB.png" 
						mode="aspectFit"
					/>
				</view>
				
				<!-- 副标题：倒计时文案 -->
				<text class="subtitle-text">{{ countdown }}S后自动跳转{{ nextPartName }}评估</text>
			</view>
			
				<!-- 下半部分：白色区域 - 按钮组 -->
				<view class="modal-footer">
					<view class="btn-group">
						<!-- 主按钮：直接开始 -->
						<view class="btn btn-primary" @click="handleStart">
							<text class="btn-text btn-primary-text">直接开始</text>
						</view>
						
						<!-- 次按钮：取消 -->
						<view class="btn btn-secondary" @click="handleCancel">
							<text class="btn-text btn-secondary-text">取消</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 游离关闭按钮（在卡片下方） -->
			<view class="floating-close-btn" @click="handleCancel">
				<image 
					class="close-icon" 
					src="/static/icons/general/btn_general_close.svg" 
					mode="aspectFit"
				/>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

// Props
const props = defineProps({
	// 是否显示弹窗
	visible: {
		type: Boolean,
		default: false
	},
	// 当前完成的部位ID
	currentPartId: {
		type: String,
		default: 'shoulder'
	},
	// 下一个部位ID
	nextPartId: {
		type: String,
		default: 'chest'
	},
	// 倒计时秒数
	countdownSeconds: {
		type: Number,
		default: 5
	}
})

// Emits
const emit = defineEmits(['update:visible', 'start', 'cancel', 'timeout'])

// 部位映射表
const partNameMap = {
	shoulder: '肩部',
	chest: '胸部',
	back: '背部',
	arm: '手臂',
	hip: '臀部',
	leg: '腿部'
}

// 当前部位名称
const currentPartName = computed(() => {
	return partNameMap[props.currentPartId] || '未知部位'
})

// 下一个部位名称
const nextPartName = computed(() => {
	return partNameMap[props.nextPartId] || '未知部位'
})

// 倒计时
const countdown = ref(props.countdownSeconds)
let countdownTimer = null

// 监听弹窗显示状态，启动/停止倒计时
watch(() => props.visible, (newVal) => {
	if (newVal) {
		// 弹窗显示时，重置并启动倒计时
		countdown.value = props.countdownSeconds
		startCountdown()
	} else {
		// 弹窗隐藏时，停止倒计时
		stopCountdown()
	}
})

// 启动倒计时
const startCountdown = () => {
	stopCountdown() // 先清除之前的定时器
	
	countdownTimer = setInterval(() => {
		countdown.value--
		
		if (countdown.value <= 0) {
			stopCountdown()
			// 倒计时结束，自动跳转
			emit('timeout')
			closeModal()
		}
	}, 1000)
}

// 停止倒计时
const stopCountdown = () => {
	if (countdownTimer) {
		clearInterval(countdownTimer)
		countdownTimer = null
	}
}

// 关闭弹窗
const closeModal = () => {
	emit('update:visible', false)
}

// 点击遮罩层（可选：是否允许点击遮罩关闭）
const handleOverlayClick = () => {
	// 如果需要点击遮罩关闭，取消注释下面这行
	// closeModal()
}

// 点击"直接开始"按钮
const handleStart = () => {
	stopCountdown()
	
	// TODO: 发送串口通信协议 - 开始下一部位评估
	console.log('[串口通信] 发送开始命令，跳转到:', props.nextPartId)
	
	emit('start', {
		currentPartId: props.currentPartId,
		nextPartId: props.nextPartId
	})
	
	closeModal()
}

// 点击"取消"按钮
const handleCancel = () => {
	stopCountdown()
	
	// TODO: 发送串口通信协议 - 取消跳转
	console.log('[串口通信] 发送取消命令')
	
	emit('cancel')
	
	closeModal()
}

// 组件卸载时清除定时器
onUnmounted(() => {
	stopCountdown()
})
</script>

<style scoped lang="scss">
/* ========== 遮罩层 ========== */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
	padding: 60rpx;
}

/* ========== 弹窗包装器（垂直排列卡片+关闭按钮） ========== */
.modal-wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 40rpx;
	width: 100%;
	max-width: 600rpx;
}

/* ========== 弹窗卡片 ========== */
.modal-card {
	width: 100%;
	background: #FFFFFF;
	border-radius: 32rpx;
	overflow: hidden;
	box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.2);
}

/* ========== 上半部分：绿色区域 ========== */
.modal-header {
	position: relative;
	background: linear-gradient(135deg, #00C853, #4CAF50);
	padding: 32rpx 40rpx 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

/* 顶部胶囊把手 */
.handle-bar {
	width: 80rpx;
	height: 8rpx;
	background: rgba(255, 255, 255, 0.8);
	border-radius: 4rpx;
	margin-bottom: 24rpx;
}

/* 标题区域 */
.title-section {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
	margin-bottom: 20rpx;
}

.icon-left {
	width: 60rpx;
	height: 60rpx;
}

.title-text {
	font-size: 40rpx;
	font-weight: bold;
	color: #FFFFFF;
	text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.icon-right {
	width: 120rpx;
	height: 120rpx;
}

/* 副标题 */
.subtitle-text {
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.9);
	line-height: 1.5;
}

/* ========== 下半部分：白色区域 - 按钮组 ========== */
.modal-footer {
	padding: 40rpx;
	background: #FFFFFF;
}

.btn-group {
	display: flex;
	gap: 20rpx;
}

.btn {
	flex: 1;
	height: 88rpx;
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s;
}

.btn:active {
	transform: scale(0.97);
}

/* 主按钮：绿色 */
.btn-primary {
	background: linear-gradient(135deg, #00C853, #4CAF50);
	box-shadow: 0 8rpx 24rpx rgba(0, 200, 83, 0.3);
}

/* 次按钮：灰色 */
.btn-secondary {
	background: #E0E0E0;
}

.btn-text {
	font-size: 32rpx;
	font-weight: 600;
}

.btn-primary-text {
	color: #FFFFFF;
}

.btn-secondary-text {
	color: #666666;
}

/* ========== 游离关闭按钮 ========== */
.floating-close-btn {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	border: 4rpx solid rgba(255, 255, 255, 0.6);
	background: transparent;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s;
}

.floating-close-btn:active {
	transform: scale(0.9);
	border-color: rgba(255, 255, 255, 0.9);
}

.close-icon {
	width: 48rpx;
	height: 48rpx;
}
</style>
