<template>
	<view class="container" @touchmove.prevent>
		<!-- 自定义导航栏 -->
		<view class="nav-bar">
			<image 
				class="back-btn" 
				src="/static/icons/general/btn_general_back.svg" 
				mode="aspectFit"
				@click="goBack"
			></image>
			<text class="nav-title">自由训练</text>
			<view class="nav-placeholder"></view>
		</view>

		<!-- 数据看板 -->
		<view class="stat-board">
			<image class="board-bg" src="/static/icons/freeTrainingActivity/bg_statBoard.png" mode="aspectFill"></image>
			
			<view class="stat-row">
				<!-- 组数/次数 -->
				<view class="stat-item">
					<image class="stat-icon" src="/static/icons/freeTrainingActivity/ic_counts.png" mode="aspectFit"></image>
					<view class="stat-content">
						<text class="stat-label">组数/次数</text>
						<text class="stat-value">{{ statBoard.sets }}</text>
					</view>
				</view>
				
				<image class="separator" src="/static/icons/freeTrainingActivity/ic_separate.png" mode="aspectFit"></image>
				
				<!-- 训练时间 -->
				<view class="stat-item">
					<image class="stat-icon" src="/static/icons/freeTrainingActivity/ic_train_time.png" mode="aspectFit"></image>
					<view class="stat-content">
						<text class="stat-label">训练时间</text>
						<text class="stat-value">{{ statBoard.duration }}</text>
					</view>
				</view>
				
				<image class="separator" src="/static/icons/freeTrainingActivity/ic_separate.png" mode="aspectFit"></image>
				
				<!-- 单量/千卡 -->
				<view class="stat-item">
					<image class="stat-icon" src="/static/icons/freeTrainingActivity/ic_calories.png" mode="aspectFit"></image>
					<view class="stat-content">
						<text class="stat-label">千卡(kcal)</text>
						<text class="stat-value">{{ statBoard.calories }}</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 力量曲线面板（占位图） -->
		<view class="force-curve-panel">
			<image class="force-curve-img" src="/static/icons/freeTrainingActivity/force-curve-fake.jpg" mode="aspectFit"></image>
		</view>
		
		<!-- 力量控制区：旋钮组件 -->
		<view class="control-center">
			<PowerDial
				ref="powerDialRef"
				v-model="dialValue"
				:min="5"
				:max="55"
				:initial-power-on="false"
				:mode-name="currentModeName"
				@change="onDialChange"
				@power-change="onPowerChange"
			/>
		</view>
		
		<!-- 底部模式选择（开机时隐藏但占位） -->
		<view class="bottom-panel" :class="{ 'bottom-panel--hidden': powerOn }">
			<view class="mode-label mode-label--active">
				<text class="mode-label-text">模式</text>
				<text class="mode-label-text">选择</text>
			</view>
			<view class="mode-grid">
				<view 
					class="mode-item" 
					v-for="(mode, index) in modes" 
					:key="mode.key"
					:class="{ 'selected': selectedMode === index }"
					@click="selectMode(index)">
					<image class="mode-icon" :src="mode.icon" mode="aspectFit"></image>
					<text class="mode-name">{{ mode.shortName }}</text>
				</view>
			</view>
		</view>
		
		<!-- 训练安全须知弹窗 -->
		<ModalDialog 
			v-model:show="showSafetyModal" 
			title="训练安全须知"
			confirm-text="我知道了"
			@confirm="handleModalConfirm"
		>
			<view class="safety-content">
				<view class="safety-item">1. 进行力量训练前，请先进行基础热身</view>
				<view class="safety-item">2. 使用力量力臂进行训练前，请确认力臂档位已锁好</view>
				<view class="safety-item">3. 请勿将整个人或其他重物挂在力臂上</view>
				<view class="safety-item">4. 请勿用硬物击打设备屏幕</view>
				<view class="safety-item">5. 结束训练后，请及时将力臂还原至初始状态并锁好</view>
			</view>
		</ModalDialog>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { onReady, onBackPress, onLoad } from '@dcloudio/uni-app'
import PowerDial from '@/components/ui-box/power-dial.vue'
import serialService, { FORCE_MODE } from '@/utils/serialService.js'

// ==================== 状态管理 ====================
const showSafetyModal = ref(false)

// 顶部看板数据
const statBoard = ref({
	sets: '00/00',
	duration: '00:00:00',
	calories: '00.00'
})

// 力量旋钮组件引用和状态
const powerDialRef = ref(null)
const DEFAULT_FORCE = 15
const dialValue = ref(DEFAULT_FORCE)
let lastForce = DEFAULT_FORCE  // 力量记忆（页面销毁后失效）
const powerOn = ref(false)

// 模式列表（恒力排在最前面）
const modes = ref([
	{
		key: 'hengli',
		name: '恒力',
		shortName: '恒力',
		icon: '/static/icons/freeTrainingActivity/ic_force_hengli.png'
	},
	{
		key: 'xiangxin',
		name: '向心等张',
		shortName: '向心',
		icon: '/static/icons/freeTrainingActivity/ic_force_xiangxin.png'
	},
	{
		key: 'lixin',
		name: '离心等张',
		shortName: '离心',
		icon: '/static/icons/freeTrainingActivity/ic_force_lixin.png'
	},
	{
		key: 'liuti',
		name: '流体阻力',
		shortName: '流体',
		icon: '/static/icons/freeTrainingActivity/ic_force_liuti.png'
	},
	{
		key: 'dengsu',
		name: '等速',
		shortName: '等速',
		icon: '/static/icons/freeTrainingActivity/ic_force_dengsu.png'
	},
	{
		key: 'tanli',
		name: '弹力',
		shortName: '弹力',
		icon: '/static/icons/freeTrainingActivity/ic_force_tanli.png'
	}
])

const selectedMode = ref(0) // 默认选中恒力（索引 0）

// UI 模式 key 到 FORCE_MODE 的映射
const MODE_KEY_MAP = {
	'hengli': FORCE_MODE.CONST,      // 恒力
	'xiangxin': FORCE_MODE.CONC_ISO, // 向心等张
	'lixin': FORCE_MODE.ECC_ISO,     // 离心等张
	'liuti': FORCE_MODE.FLUID,       // 流体阻力
	'dengsu': FORCE_MODE.BALANCE,    // 等速（暂用平衡模式）
	'tanli': FORCE_MODE.ELASTIC      // 弹力
}

// 组数计数器（每次开机 +1，页面销毁归零）
let setCount = 0
let countBaseline = 0        // 每组开始时的 sportCount 基准值
let needCaptureBaseline = false  // 开机后等待第一帧来捕获基准

// ---- 运动计时（JS 端，仅绳子在动时累加）----
const SPEED_THRESHOLD = 10   // mm/s，任一手速度绝对值 > 此值视为在运动
const IDLE_WINDOW = 2000     // ms，超过此时长无活跃帧则暂停计时
let activeSeconds = 0        // 累计运动秒数（跨组累加，页面销毁归零）
let lastActiveTs = 0         // 最近一次检测到运动的时间戳
let activeTimer = null       // 1 秒 setInterval

// ==================== 辅助函数 ====================

// 秒数 → HH:MM:SS
function formatTime(totalSeconds) {
	const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
	const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
	const s = String(totalSeconds % 60).padStart(2, '0')
	return `${h}:${m}:${s}`
}

// 组数/次数 → "01/03" 格式
function formatSets(sets, count) {
	return `${String(sets).padStart(2, '0')}/${String(count).padStart(2, '0')}`
}

// ==================== 计算属性 ====================

// 当前模式名（传给 PowerDial 显示）
const currentModeName = computed(() => {
	const m = modes.value[selectedMode.value]
	return m ? m.shortName : '恒力'
})

const hasMode = computed(() => {
	return selectedMode.value !== null
})

const pageTitle = computed(() => {
	if (!hasMode.value) return '自由训练'
	const m = modes.value[selectedMode.value]
	if (!m) return '自由训练'
	if (m.key === 'liuti') return '流体阻力模式'
	return m.name + '模式'
})

// ==================== 生命周期 ====================
// 接收上一页传递的模式参数
onLoad((options) => {
	if (options.modeKey) {
		// 根据 key 找到对应的索引
		const index = modes.value.findIndex(m => m.key === options.modeKey)
		if (index !== -1) {
			selectedMode.value = index
		}
	}
	// 如果没有传参数，保持默认值 0（恒力）
})

// 串口帧回调 —— 更新看板数据
const handleFrame = (data) => {
	const p = data.parsed
	if (!p) return
	// 开机后第一帧：捕获基准值
	if (needCaptureBaseline) {
		countBaseline = p.sportCount
		needCaptureBaseline = false
	}
	// 检测运动：任一手速度绝对值超过阈值 → 刷新活跃时间戳
	if (Math.abs(p.left.speed) > SPEED_THRESHOLD || Math.abs(p.right.speed) > SPEED_THRESHOLD) {
		lastActiveTs = Date.now()
	}
	const currentCount = p.sportCount - countBaseline
	statBoard.value = {
		sets: formatSets(setCount, currentCount),
		duration: formatTime(activeSeconds),
		calories: (p.calories / 1000).toFixed(2)
	}
}

onMounted(() => {
	showSafetyModal.value = true
	// 订阅串口帧事件
	serialService.on('frame', handleFrame)
})



onBeforeUnmount(() => {
	console.log('自由训练页 - 页面卸载，清理资源')
	// 停止运动计时
	if (activeTimer) { clearInterval(activeTimer); activeTimer = null }
	// 取消串口帧订阅
	serialService.off('frame', handleFrame)
	// 确保停止力量输出（包含任何进行中的关机序列）
	if (powerOn.value) {
		serialService.stopForce()
	}
})

// Android 返回键处理
onBackPress(() => {
	if (showSafetyModal.value) {
		showSafetyModal.value = false
		return true // 阻止默认返回行为
	}
	return false // 允许返回
})

// ==================== 事件处理 ====================
const goBack = () => {
	uni.navigateBack()
}

const handleModalConfirm = () => {
	// console.log('用户已确认安全须知')
}

// 力量旋钮值变化回调（仅 touchend 时触发）
const onDialChange = (value) => {
	console.log('力量值确认:', value)
	lastForce = value  // 记忆力量值
	// 如果已开机，通知下位机更新力量
	if (powerOn.value) {
		serialService.updateWorkingForce(value)
	}
}

// 开关状态变化回调
const onPowerChange = (isOn) => {
	powerOn.value = isOn
	console.log('开关状态:', isOn ? '开' : '关')
	
	if (isOn) {
		// 如果在关机发送序列中重新开机，立即停止关机序列
		// 开启：组数 +1，下一帧捕获次数基准（实现组内次数归零）
		setCount++
		needCaptureBaseline = true
		// 启动运动计时器（1 秒窗口：窗口内有活跃帧 → +1s）
		lastActiveTs = 0
		activeTimer = setInterval(() => {
			if (lastActiveTs > 0 && (Date.now() - lastActiveTs) < IDLE_WINDOW) {
				activeSeconds++
			}
		}, 1000)
		const mode = modes.value[selectedMode.value]
		const forceMode = MODE_KEY_MAP[mode.key] || FORCE_MODE.CONST
		serialService.startWorking(dialValue.value, forceMode, 200)  // 5Hz
	} else {
		// 关闭：停止运动计时 + 安全停力（持续发 OFF 确保下位机收到）
		if (activeTimer) { clearInterval(activeTimer); activeTimer = null }
		serialService.stopForce()  // stopWorking + 持续发 2s OFF 帧
		// 恢复到上次使用的力量值（PowerDial 关机会把值设为 min）
		dialValue.value = lastForce
	}
}

// 模式选择（选择即确认，不依赖开关状态）
const selectMode = (index) => {
	if (selectedMode.value === index) return // 防止重复选择同一个
	
	selectedMode.value = index
	
	// 如果已开机，更新下位机的力量模式（下个 tick 自动生效，无顿挫）
	if (powerOn.value) {
		const mode = modes.value[index]
		const forceMode = MODE_KEY_MAP[mode.key] || FORCE_MODE.CONST
		serialService.updateWorkingForce(dialValue.value, forceMode)
	}
}


</script>

<style scoped>
.container {
	position: relative;
	display: flex;
	flex-direction: column;
	height: 100vh;
	width: 100vw;
	background-color: #FFFFFF;
	padding: 0 40rpx 40rpx 40rpx;
	overflow: hidden;
	box-sizing: border-box;
}

/* ==================== 自定义导航栏 ==================== */
.nav-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 90rpx;
	padding-top: 20rpx;
	margin-bottom: 20rpx;
	flex-shrink: 0;
}

.back-btn {
	width: 56rpx;
	height: 56rpx;
}

.nav-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.nav-placeholder {
	width: 56rpx;
}

/* ==================== 数据看板 ==================== */
.stat-board {
	position: relative;
	width: 100%;
	height: 160rpx;
	margin-bottom: 24rpx;
	flex-shrink: 0;
	background: linear-gradient(145deg, #ffffff, #f0f0f0);
	border-radius: 24rpx;
	border: 3rpx solid #d0d0d0;
	box-shadow: 
		0 8rpx 24rpx rgba(0, 0, 0, 0.12),
		0 2rpx 6rpx rgba(0, 0, 0, 0.08),
		inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
	overflow: hidden;
}

.board-bg {
	position: absolute;
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
}

.stat-row {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-around;
	height: 100%;
	padding: 0 30rpx;
}

.stat-item {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.stat-icon {
	width: 60rpx;
	height: 60rpx;
}

.stat-content {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.stat-label {
	font-size: 24rpx;
	color: #666666;
}

.stat-value {
	font-size: 32rpx;
	font-weight: bold;
	color: #000000;
}

.separator {
	width: 2rpx;
	height: 80rpx;
}

/* ==================== 力量曲线面板 ==================== */
.force-curve-panel {
	position: relative;
	width: 100%;
	height: 280rpx;
	margin-bottom: 24rpx;
	flex-shrink: 0;
	border-radius: 24rpx;
	border: 3rpx solid #d0d0d0;
	box-shadow: 
		0 8rpx 24rpx rgba(0, 0, 0, 0.12),
		0 2rpx 6rpx rgba(0, 0, 0, 0.08),
		inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
	overflow: hidden;
}

.force-curve-img {
	width: 100%;
	height: 100%;
}

/* ==================== 力量控制区：旋钮 ==================== */
.control-center {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	flex: 1;
	min-height: 0;
	margin-bottom: 20rpx;
}

/* ==================== 底部模式选择区 ==================== */
.bottom-panel {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	background: #f5f5f5;
	border-radius: 50rpx;
	padding: 16rpx 24rpx;
	gap: 20rpx;
	transition: opacity 0.3s, visibility 0.3s;
}

.bottom-panel--hidden {
	opacity: 0;
	visibility: hidden;
	pointer-events: none;
}

.mode-label {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background: transparent;
	transition: all 0.25s ease;
}

.mode-label--active {
	background: #8BC34A;
}

.mode-label-text {
	font-size: 24rpx;
	color: #666666;
	font-weight: bold;
	line-height: 1.3;
	transition: color 0.25s ease;
}

.mode-label--active .mode-label-text {
	color: #FFFFFF;
}

.mode-grid {
	display: flex;
	flex: 1;
	justify-content: space-between;
	align-items: center;
	gap: 8rpx;
}

.mode-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 8rpx 12rpx;
	border-radius: 16rpx;
	background: transparent;
	transition: all 0.25s ease;
	gap: 4rpx;
}

.mode-item.selected {
	background: #8BC34A;
	box-shadow: 0 4rpx 12rpx rgba(139, 195, 74, 0.4);
}

.mode-item.disabled {
	opacity: 0.3;
	pointer-events: none;
}

.mode-icon {
	width: 48rpx;
	height: 48rpx;
	transition: all 0.25s ease;
}

.mode-item.selected .mode-icon {
	filter: brightness(0) invert(1);
}

.mode-name {
	font-size: 20rpx;
	color: #666666;
	transition: color 0.25s ease;
}

.mode-item.selected .mode-name {
	color: #FFFFFF;
}

/* ==================== 安全须知弹窗 ==================== */
.safety-content {
	padding: 0 10rpx;
}

.safety-item {
	font-size: 28rpx;
	color: #333333;
	line-height: 2;
	margin-bottom: 10rpx;
	text-align: left;
}
</style>
