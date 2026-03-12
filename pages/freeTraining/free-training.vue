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
						<text class="stat-label">单量/千卡</text>
						<text class="stat-value">{{ statBoard.calories }}</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 力量曲线面板（占位图） -->
		<view class="force-curve-panel">
			<image class="force-curve-img" src="/static/icons/freeTrainingActivity/force-curve-fake.jpg" mode="aspectFit"></image>
		</view>
		
		<!-- 力量控制区：旋钮 + 开关 -->
		<view class="control-center">
			<!-- 力量旋钮区域 -->
			<view class="dial-wrapper"
				@touchstart="onDialTouch"
				@touchmove.stop.prevent="onDialTouch">
				
				<!-- 圆弧背景（灰色底） -->
				<image class="dial-arc dial-arc-bg" 
					src="/static/icons/freeTrainingActivity/ic_resistance_adjust.svg" 
					mode="aspectFit" 
					:class="{ 'dial-arc--off': !powerOn }" />
				
				<!-- 圆弧进度（彩色，通过遮罩显示进度） -->
				<view v-if="powerOn" class="dial-arc-progress-wrapper" 
					:style="{ '--progress-angle': (dial.currentAngle + 120) + 'deg' }">
					<image class="dial-arc dial-arc-active" 
						src="/static/icons/freeTrainingActivity/ic_resistance_adjust.svg" 
						mode="aspectFit" />
				</view>
				
				<!-- 装饰图片（仅开机时显示） -->
				<image v-if="powerOn" class="dial-decoration" 
					src="/static/icons/freeTrainingActivity/ic_decoration.png" 
					mode="aspectFit" />
				
				<!-- 圆形中心区域 -->
				<view class="dial-circle" :class="{ 'dial-circle--on': powerOn }">
					<!-- 力量值显示 -->
					<text class="dial-value">{{ dial.currentValue }}</text>
					<text class="dial-unit">kg</text>
				</view>
				
				<!-- 开关按钮（位于圆球正中央） -->
				<view class="dial-power-btn" 
					@tap.stop="togglePower"
					@touchstart.stop
					@touchmove.stop>
					<image class="power-icon" 
						src="/static/icons/freeTrainingActivity/ic_power.svg" 
						mode="aspectFit" />
				</view>
			</view>
		</view>
		
		<!-- 底部模式选择 -->
		<view :class="bottomPanelClass">
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
		<ModalGeneral 
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
		</ModalGeneral>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onReady, onBackPress, onLoad } from '@dcloudio/uni-app'

// ==================== 状态管理 ====================
const showSafetyModal = ref(false)

// 顶部看板数据
const statBoard = ref({
	sets: '00/00',
	duration: '00:00:00',
	calories: '00.00'
})

// 是否开启
const powerOn = ref(false)

// 力量旋钮
const dial = ref({
	startAngle: -120,   // 圆弧起点角度（左侧）
	endAngle: 120,      // 圆弧终点角度（右侧）
	minValue: 0,        // 最小力量值 = 0kg
	maxValue: 100,      // 最大力量值 = 100kg
	currentAngle: -120, // 当前滑块所处角度（实时更新）
	currentValue: 0,    // 当前力量值（实时更新）
	center: null        // {x,y} 记录圆心，用于触摸计算
})

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

// 定时器
let trainingTimer = null

// ==================== 计算属性 ====================
const handleStyle = computed(() => {
	return `transform: translate(-50%, -50%) rotate(${dial.value.currentAngle}deg);`
})

// 计算进度百分比（0~1）
const progressRatio = computed(() => {
	const startAngle = dial.value.startAngle // -120°
	const endAngle = dial.value.endAngle     // +120°
	const currentAngle = dial.value.currentAngle
	return (currentAngle - startAngle) / (endAngle - startAngle)
})

const bottomPanelClass = computed(() => {
	return 'bottom-panel'
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

onMounted(() => {
	showSafetyModal.value = true
})

// 页面渲染完成后计算圆心坐标（只算一次）
onReady(() => {
	uni.createSelectorQuery()
		.select('.dial-circle')
		.boundingClientRect(data => {
			if (!data) return
			dial.value.center = {
				x: data.left + data.width / 2,
				y: data.top + data.height / 2
			}
		})
		.exec()
})

onUnmounted(() => {
	if (trainingTimer) {
		clearInterval(trainingTimer)
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

// 开关按钮
const togglePower = () => {
	powerOn.value = !powerOn.value
	
	// 关机时把力量设为0，滑块回到起点
	if (!powerOn.value) {
		dial.value.currentValue = 0
		dial.value.currentAngle = dial.value.startAngle
	}
	
	// TODO: 通知下位机开/关机
	// if (powerOn.value) {
	//   const mode = modes.value[selectedMode.value]
	//   startWorking(dial.value.currentValue, FORCE_MODE[mode.key.toUpperCase()])
	// } else {
	//   stopWorking()
	// }
}

// 模式选择（选择即确认，不依赖开关状态）
const selectMode = (index) => {
	if (selectedMode.value === index) return // 防止重复选择同一个
	
	selectedMode.value = index
	
	// TODO: 如果已开机，通知下位机切换模式
	// if (powerOn.value) {
	//   const mode = modes.value[index]
	//   sendModeToDevice(mode.key)
	// }
}

// 旋钮拖动（触摸开始/移动触发）
// 节流变量
let lastUpdateTime = 0
const UPDATE_INTERVAL = 20 // 约60fps，降低更新频率避免卡顿
const onDialTouch = (e) => {
	if (!powerOn.value) return // 关机时不允许调节
	if (!dial.value.center) return // 圆心未计算完成，跳过
	
	// 节流：限制更新频率
	const now = Date.now()
	if (now - lastUpdateTime < UPDATE_INTERVAL) return
	lastUpdateTime = now
	
	// 1. 读取触点坐标
	const touch = e.touches[0]
	const touchX = touch.clientX || touch.x
	const touchY = touch.clientY || touch.y
	
	// 2. 计算指向向量
	const dx = touchX - dial.value.center.x
	const dy = touchY - dial.value.center.y
	
	// 3. 转换为角度（atan2 返回 -180° ~ 180°）
	let angleRaw = Math.atan2(dy, dx) * 180 / Math.PI
	// 让正上方成为 0°（atan2 中右侧是0°，需要旋转90°）
	let angle = angleRaw + 90
	
	// 处理角度跨越 ±180° 边界的情况
	if (angle > 180) {
		angle = angle - 360
	} else if (angle < -180) {
		angle = angle + 360
	}
	
	// 4. 将角度限制在圆弧范围 [startAngle, endAngle]
	const startAngle = dial.value.startAngle // -120°
	const endAngle = dial.value.endAngle     // +120°
	
	// 限制在圆弧范围内
	angle = Math.max(startAngle, Math.min(angle, endAngle))
	
	// 5. 根据角度映射到 0~100kg
	const ratio = (angle - startAngle) / (endAngle - startAngle) // 0~1
	const value = dial.value.minValue + ratio * (dial.value.maxValue - dial.value.minValue) // 0~100
	
	// 6. 更新状态（批量更新减少响应式开销）
	dial.value.currentAngle = angle
	dial.value.currentValue = Math.round(value)
	
	// 7. 通知下位机
	// TODO: sendStrengthToDevice(dial.value.currentValue)
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

.dial-wrapper {
	position: relative;
	width: 400rpx;
	height: 400rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: visible;
}

/* 圆弧背景（灰色底） */
.dial-arc {
	position: absolute;
	width: 100%;
	height: 100%;
	pointer-events: none;
}

.dial-arc-bg {
	opacity: 0.3;
	transition: opacity 0.3s;
}

.dial-arc--off {
	opacity: 0.2;
	filter: grayscale(100%);
}

/* 圆弧进度容器（用于裁剪进度） */
.dial-arc-progress-wrapper {
	position: absolute;
	width: 100%;
	height: 100%;
	pointer-events: none;
	overflow: hidden;
	/* 使用CSS变量接收角度值 */
	--progress-angle: 0deg;
}

/* 圆弧进度（彩色高亮） */
.dial-arc-active {
	opacity: 1;
	filter: drop-shadow(0 0 10rpx rgba(76, 175, 80, 0.6));
	/* 通过遮罩实现进度效果 */
	mask-image: conic-gradient(
		from -120deg at 50% 50%,
		#000 0deg,
		#000 var(--progress-angle),
		#0000 var(--progress-angle)
	);
	-webkit-mask-image: conic-gradient(
		from -120deg at 50% 50%,
		#000 0deg,
		#000 var(--progress-angle),
		#0000 var(--progress-angle)
	);
}

/* 装饰图片（光环平面效果） */
.dial-decoration {
	position: absolute;
	width: 550rpx;
	height: 300rpx;
	bottom: -60rpx;
	left: 50%;
	transform: translateX(-50%);
	pointer-events: none;
	z-index: 1;
}

/* 圆形中心区域 */
.dial-circle {
	position: relative;
	width: 200rpx;
	height: 200rpx;
	border-radius: 50%;
	background: linear-gradient(180deg, #f5f5f5 0%, #e0e0e0 100%);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-shadow: 
		0 12rpx 30rpx rgba(0, 0, 0, 0.15),
		inset 0 2rpx 4rpx rgba(255, 255, 255, 0.8);
	transition: all 0.3s;
	z-index: 2;
}

.dial-circle--on {
	background: linear-gradient(180deg, rgba(139, 195, 74, 0.6) 0%, rgba(76, 175, 80, 0.7) 100%);
	box-shadow: 
		0 12rpx 40rpx rgba(76, 175, 80, 0.5),
		inset 0 2rpx 4rpx rgba(255, 255, 255, 0.5);
}

/* 力量值显示 */
.dial-value {
	font-size: 52rpx;
	font-weight: bold;
	color: #333333;
	line-height: 1;
}

.dial-unit {
	font-size: 22rpx;
	color: #666666;
	margin-top: 2rpx;
}

/* 开关按钮（位于圆球正中央） */
.dial-power-btn {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 90rpx;
	height: 90rpx;
	border-radius: 50%;
	background: linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 
		0 6rpx 16rpx rgba(0, 0, 0, 0.2),
		inset 0 1rpx 2rpx rgba(255, 255, 255, 0.9);
	transition: all 0.3s;
	z-index: 3;
}

.dial-power-btn:active {
	transform: translate(-50%, -50%) scale(0.95);
}

.power-icon {
	width: 48rpx;
	height: 48rpx;
	opacity: 0.7;
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
	transition: opacity 0.3s;
}

.bottom-panel--off {
	opacity: 0.4;
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
