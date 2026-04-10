<!--
自由训练页当前“力量开关按钮”行为说明
============================================================================

一、先说结论
1. 这个页面里的 PowerDial 开关现在不是“点一下组件自己就切换成开/关”的乐观模式。
2. 它已经改成“受控模式”：
   - 用户点击按钮，只代表“提出一个开机/关机请求”
   - 页面收到请求后，去发送对应的串口命令
   - 只有下位机回包确认后，页面里的 powerOn 真状态才会改变
   - PowerDial 的视觉状态只跟这个 powerOn 真状态走
3. 所以现在按钮不会在点击瞬间立刻变亮或变灰。
   它只有在“设备确认已经开”或“设备确认已经关”之后，才会真正切换视觉状态。

二、为什么要这样做
1. 之前 PowerDial 是自管理状态组件：
   - 一收到点击事件，就先把自己切成“开”或“关”
   - 再通知页面去发串口命令
2. 这种写法的风险是：
   - UI 先说自己已经关了，但电机未必真的关了
   - UI 先说自己已经开了，但下位机未必已经切到工作态
3. 这会造成“视觉状态”和“设备真实状态”脱节，用户看到的开关状态不可靠。
4. 现在这版的目标就是：按钮只显示“真状态”，不显示“点击意图”。

三、现在点击“开”时到底会发生什么
1. PowerDial 在受控模式下不会自己翻转 powerOn，而是发出 request-power-change 事件。
2. 页面收到这个事件后，进入“等待开机确认”流程：
   - 记录 pendingPowerAction = 'opening'
   - 记录本次准备下发的目标力量值和目标模式
   - 调用 serialService.startWorking(...)
3. 在等待确认期间：
   - PowerDial 会被禁用，防止重复点击或继续拖拽
   - 页面不会立刻把 powerOn 设为 true
4. 后续只要收到一帧回包，同时满足：
   - p.setForceMode === 本次目标模式
   - p.setForce === 本次目标力量
   就认定“真开启成功”
5. 只有到这一步，页面才会执行：
   - powerOn.value = true
   - 清除 pendingPowerAction
   - PowerDial 才会真正显示为开启状态

四、现在点击“关”时到底会发生什么
1. PowerDial 同样只发 request-power-change 事件，不自己先变灰。
2. 页面收到关闭请求后，进入“等待关机确认”流程：
   - 记录 pendingPowerAction = 'closing'
   - 调用 serialService.stopForce(...)
3. 这里的 stopForce 不是只发 1 次 OFF，而是：
   - 连续发送一段时间的 OFF 帧，确保下位机能收到关闭命令
4. 与之前不同的是：
   - 这次 stopForce 会带 keepPolling: true
   - 也就是说，停力发送期间不会立刻停止读取
   - 页面仍然可以继续接收下位机回包，用来确认“是否真的关掉了”
5. 后续只要收到一帧回包满足：
   - p.setForceMode === FORCE_MODE.OFF
   就认定“真关闭成功”
6. 只有到这一步，页面才会执行：
   - powerOn.value = false
   - 清除 pendingPowerAction
   - 停止用于确认的读取
   - PowerDial 才会真正显示为关闭状态

五、为什么关闭时还要额外保留读取
1. serialService.stopForce() 内部原本会先 stopWorking()
2. stopWorking() 以前会直接停掉轮询读取
3. 如果关闭时立刻停读，就拿不到“mode == 0”的确认回包
4. 所以这里专门让 stopForce 在自由训练页支持：
   - 停力发送继续执行
   - 读取暂时保留
   - 等收到关闭确认回包后，再主动 stopReading()

六、关闭的“发送时间”和“确认等待时间”现在是分开的
1. stopForce 的 OFF 连续发送时间默认仍然是 2 秒左右
2. 但本页对“关闭确认”的等待窗口是 POWER_CONFIRM_TIMEOUT
3. 当前 POWER_CONFIRM_TIMEOUT = 5000ms
4. 这意味着：
   - 前 2 秒主要做停力命令补发
   - 最长 5 秒内都允许继续等关闭确认回包
5. 这样做是为了避免把 OFF 命令硬发 5 秒，但仍然给下位机足够的回包确认时间

七、如果 5 秒内一直收不到确认回包怎么办
1. 当前实现不会无限卡住
2. 页面会触发“确认超时”逻辑：
   - opening 超时：调用 serialService.stopWorking()
   - closing 超时：调用 serialService.stopReading()
   - 然后清掉 pendingPowerAction，重新允许用户操作
3. 也就是说：
   - 不会因为一次确认失败就把旋钮永久锁死
   - 但在超时之前，按钮会维持“尚未确认”的真状态显示

八、这套逻辑的核心原则
1. 点击按钮不是状态真相，回包确认才是状态真相
2. PowerDial 只负责展示真状态，不负责自己拍板“我已经开了/关了”
3. 页面 powerOn 是唯一可信状态源
4. UI 可以慢几十到几百毫秒，但不能假装已经切换成功

九、后续排查这段逻辑时，建议优先看这些关键词日志
1. request-power-change
2. onPowerRequest received
3. doPowerOn begin / doPowerOff begin
4. power on confirmed by frame
5. power off confirmed by frame
6. power confirm timeout

============================================================================
-->
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
			<view class="force-curve-head">
				<view class="force-curve-copy">
					<text class="force-curve-title">拉绳长度</text>
					<view class="force-curve-legend">
						<view class="force-curve-legend-item">
							<view class="force-curve-dot force-curve-dot--history"></view>
							<text class="force-curve-legend-text">已完成</text>
						</view>
						<view class="force-curve-legend-item">
							<view class="force-curve-dot force-curve-dot--live"></view>
							<text class="force-curve-legend-text">当前</text>
						</view>
					</view>
				</view>
				<view class="force-curve-metric">
					<text class="force-curve-metric-label">{{ liveBarVisible ? '当前峰值' : '最近一次' }}</text>
					<text class="force-curve-metric-value">{{ chartMetricText }}</text>
				</view>
			</view>
			<view class="force-curve-chart-box">
				<qiun-data-charts
					class="force-curve-history-chart"
					canvasId="freeTrainingLengthChart"
					type="column"
					style="width: 100%; height: 100%;"
					:chartData="barChartData"
					:opts="barChartOpts"
					:animation="false"
					background="transparent"
				/>
				<view v-if="liveBarVisible" class="force-curve-live-overlay">
					<view
						v-for="slotIndex in MAX_VISIBLE_BARS"
						:key="`live-slot-${slotIndex}`"
						class="force-curve-live-slot"
					>
						<view
							v-if="slotIndex - 1 === liveBarSlotIndex"
							class="force-curve-live-bar"
							:style="liveBarStyle"
						></view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 力量控制区：旋钮组件 -->
		<view class="control-center">
			<PowerDial
				ref="powerDialRef"
				v-model="dialValue"
				:min="5"
				:max="55"
				:disabled="pendingPowerAction !== null"
				:controlled-power="true"
				:power-on="powerOn"
				:initial-power-on="false"
				:mode-name="currentModeName"
				@change="onDialChange"
				@request-power-change="onPowerRequest"
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { onBackPress, onLoad } from '@dcloudio/uni-app'
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
const pendingPowerAction = ref(null)
const POWER_TRACE_ENABLED = true
const POWER_CONFIRM_TIMEOUT = 5000
let powerActionSeq = 0
let lastDeviceSetForce = null
let lastDeviceSetForceMode = null
let lastDeviceSleepState = null
let pendingConfirmForce = null
let pendingConfirmMode = null
let pendingPowerTimeout = null

function formatTraceTime(ts = Date.now()) {
	const date = new Date(ts)
	const h = String(date.getHours()).padStart(2, '0')
	const m = String(date.getMinutes()).padStart(2, '0')
	const s = String(date.getSeconds()).padStart(2, '0')
	const ms = String(date.getMilliseconds()).padStart(3, '0')
	return `${h}:${m}:${s}.${ms}`
}

function tracePower(event, payload = {}) {
	if (!POWER_TRACE_ENABLED) return
	console.log(`[freeTrainingTrace ${formatTraceTime()}] ${event}`, payload)
}

function getDialPowerState() {
	const getter = powerDialRef.value?.getPower
	return typeof getter === 'function' ? getter.call(powerDialRef.value) : null
}

function clearPendingPowerConfirm() {
	if (pendingPowerTimeout) {
		clearTimeout(pendingPowerTimeout)
		pendingPowerTimeout = null
	}
	pendingPowerAction.value = null
	pendingConfirmForce = null
	pendingConfirmMode = null
}

function schedulePendingPowerConfirmTimeout(action) {
	if (pendingPowerTimeout) {
		clearTimeout(pendingPowerTimeout)
	}
	pendingPowerTimeout = setTimeout(() => {
		pendingPowerTimeout = null
		tracePower('power confirm timeout', {
			action,
			actionId: powerActionSeq,
			pagePowerOn: powerOn.value,
			dialPowerOn: getDialPowerState()
		})
		if (action === 'opening') {
			serialService.stopForce()
		}
		if (action === 'closing') {
			serialService.stopReading()
		}
		clearPendingPowerConfirm()
	}, POWER_CONFIRM_TIMEOUT)
}

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
let lastSportCount = null

const MAX_DISTANCE_CM = 80
const CHART_AXIS_MAX = 5
const LIVE_BAR_TRIGGER_CM = 4
const MAX_VISIBLE_BARS = 12
const historyBars = ref([])
const liveBarPeakCm = ref(0)
const liveBarVisible = ref(false)
const barChartData = ref(createBarChartData())

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

function toDistanceCm(rawDistance) {
	const safeDistance = Math.max(0, Number(rawDistance) || 0)
	return Number((safeDistance / 10).toFixed(1))
}

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value))
}

function normalizeDistanceCm(distanceCm) {
	const unitHeight = MAX_DISTANCE_CM / CHART_AXIS_MAX
	return Number((clamp(distanceCm, 0, MAX_DISTANCE_CM) / unitHeight).toFixed(2))
}

function createPlaceholderBar() {
	return {
		distanceCm: 0,
		placeholder: true
	}
}

function createBarChartData() {
	return {
		categories: Array.from({ length: MAX_VISIBLE_BARS }, () => ''),
		series: [
			{
				name: 'ropeLength',
				data: Array.from({ length: MAX_VISIBLE_BARS }, () => ({
					value: 0,
					color: 'rgba(0,0,0,0)'
				}))
			}
		]
	}
}

function resetLiveBar() {
	liveBarPeakCm.value = 0
	liveBarVisible.value = false
}

function finalizeLiveBar() {
	if (!liveBarVisible.value || liveBarPeakCm.value <= 0) {
		resetLiveBar()
		return
	}
	historyBars.value = [...historyBars.value, clamp(liveBarPeakCm.value, 0, MAX_DISTANCE_CM)]
	resetLiveBar()
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
const historyDisplayBars = computed(() => {
	const maxHistoryBars = liveBarVisible.value ? (MAX_VISIBLE_BARS - 1) : MAX_VISIBLE_BARS
	return historyBars.value.slice(-maxHistoryBars)
})

const chartMetricText = computed(() => {
	if (liveBarVisible.value) {
		return `${liveBarPeakCm.value.toFixed(1)}cm`
	}
	const latestHistory = historyBars.value[historyBars.value.length - 1]
	if (typeof latestHistory === 'number') {
		return `${latestHistory.toFixed(1)}cm`
	}
	return '--'
})

const displayBars = computed(() => {
	if (historyDisplayBars.value.length === 0) {
		return Array.from({ length: MAX_VISIBLE_BARS }, () => createPlaceholderBar())
	}
	const placeholders = Array.from({
		length: Math.max(0, MAX_VISIBLE_BARS - historyDisplayBars.value.length)
	}, () => createPlaceholderBar())
	return [
		...historyDisplayBars.value.map((distanceCm) => ({
			distanceCm,
			placeholder: false
		})),
		...placeholders
	]
})

const liveBarSlotIndex = computed(() => {
	if (!liveBarVisible.value) {
		return -1
	}
	return Math.min(historyDisplayBars.value.length, MAX_VISIBLE_BARS - 1)
})

const liveBarStyle = computed(() => {
	const heightPercent = Number(((clamp(liveBarPeakCm.value, 0, MAX_DISTANCE_CM) / MAX_DISTANCE_CM) * 100).toFixed(2))
	return {
		height: `${Math.max(heightPercent, 0)}%`
	}
})

watch(displayBars, (bars) => {
	barChartData.value = {
		categories: Array.from({ length: MAX_VISIBLE_BARS }, () => ''),
		series: [
			{
				name: 'ropeLength',
				data: bars.map((bar) => ({
					value: normalizeDistanceCm(bar.distanceCm),
					color: bar.placeholder
						? 'rgba(0,0,0,0)'
						: '#5B8FF9'
				}))
			}
		]
	}
}, {
	immediate: true
})

const barChartOpts = {
	padding: [16, 18, 0, 8],
	enableScroll: false,
	animation: false,
	dataLabel: false,
	legend: {
		show: false
	},
	xAxis: {
		disabled: true,
		disableGrid: true,
		axisLine: false
	},
	yAxis: {
		data: [{
			min: 0,
			max: CHART_AXIS_MAX
		}],
		splitNumber: 5,
		gridType: 'dash',
		dashLength: 3,
		padding: 10
	},
	extra: {
		column: {
			type: 'group',
			width: 16,
			barBorderRadius: [10, 10, 0, 0]
		},
		tooltip: {
			showCategory: false,
			legendShow: false,
			borderRadius: 8
		}
	}
}

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
	if (
		p.setForce !== lastDeviceSetForce ||
		p.setForceMode !== lastDeviceSetForceMode ||
		p.sleepState !== lastDeviceSleepState
	) {
		lastDeviceSetForce = p.setForce
		lastDeviceSetForceMode = p.setForceMode
		lastDeviceSleepState = p.sleepState
		tracePower('device frame state changed', {
			setForce: p.setForce,
			setForceMode: p.setForceMode,
			setForceModeText: p.setForceModeText,
			sleepState: p.sleepState,
			leftInstantForce: p.left?.instantForce,
			rightInstantForce: p.right?.instantForce,
			pagePowerOn: powerOn.value,
			dialPowerOn: getDialPowerState()
		})
	}
	if (
		pendingPowerAction.value === 'opening' &&
		p.setForceMode === pendingConfirmMode &&
		p.setForce === pendingConfirmForce
	) {
		powerOn.value = true
		tracePower('power on confirmed by frame', {
			actionId: powerActionSeq,
			setForce: p.setForce,
			setForceMode: p.setForceMode,
			setForceModeText: p.setForceModeText
		})
		clearPendingPowerConfirm()
	}
	if (
		pendingPowerAction.value === 'closing' &&
		p.setForceMode === FORCE_MODE.OFF
	) {
		powerOn.value = false
		tracePower('power off confirmed by frame', {
			actionId: powerActionSeq,
			setForce: p.setForce,
			setForceMode: p.setForceMode,
			setForceModeText: p.setForceModeText
		})
		clearPendingPowerConfirm()
		serialService.stopReading()
	}
	// 开机后第一帧：捕获基准值
	if (needCaptureBaseline) {
		countBaseline = p.sportCount
		needCaptureBaseline = false
	}
	const currentSportCount = Number(p.sportCount) || 0
	if (lastSportCount === null || currentSportCount < lastSportCount) {
		lastSportCount = currentSportCount
	}
	const currentDistanceCm = Math.max(
		toDistanceCm(p.left?.distance),
		toDistanceCm(p.right?.distance)
	)
	if (currentDistanceCm >= LIVE_BAR_TRIGGER_CM) {
		liveBarVisible.value = true
		liveBarPeakCm.value = Math.max(liveBarPeakCm.value, currentDistanceCm)
	}
	if (currentSportCount > lastSportCount) {
		finalizeLiveBar()
		lastSportCount = currentSportCount
	}
	// 检测运动：任一手速度绝对值超过阈值 → 刷新活跃时间戳
	if (Math.abs(p.left.speed) > SPEED_THRESHOLD || Math.abs(p.right.speed) > SPEED_THRESHOLD) {
		lastActiveTs = Date.now()
	}
	const currentCount = Math.max(0, currentSportCount - countBaseline)
	statBoard.value = {
		sets: formatSets(setCount, currentCount),
		duration: formatTime(activeSeconds),
		calories: (p.calories / 1000).toFixed(2)
	}
}

onMounted(() => {
	showSafetyModal.value = true
	tracePower('page mounted', {
		powerOn: powerOn.value,
		dialValue: dialValue.value,
		selectedMode: selectedMode.value
	})
	// 订阅串口帧事件
	serialService.on('frame', handleFrame)
	serialService.on('error', handleSerialError)
})



onBeforeUnmount(() => {
	tracePower('page before unmount', {
		powerOn: powerOn.value,
		pendingPowerAction: pendingPowerAction.value,
		dialPowerOn: getDialPowerState(),
		dialValue: dialValue.value
	})
	// 停止运动计时
	if (activeTimer) { clearInterval(activeTimer); activeTimer = null }
	// 取消串口帧订阅
	resetLiveBar()
	lastSportCount = null
	serialService.off('frame', handleFrame)
	serialService.off('error', handleSerialError)
	// 确保停止力量输出（包含任何进行中的关机序列）
	if (powerOn.value || pendingPowerAction.value !== null) {
		serialService.stopForce()
	}
	clearPendingPowerConfirm()
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

const handleSerialError = (err) => {
	tracePower('serial error', err)
}

// 力量旋钮值变化回调（仅 touchend 时触发）
const onDialChange = (value) => {
	tracePower('dial value confirmed', {
		value,
		pagePowerOn: powerOn.value,
		dialPowerOn: getDialPowerState()
	})
	lastForce = value  // 记忆力量值
	// 如果已开机，通知下位机更新力量
	if (powerOn.value) {
		serialService.updateWorkingForce(value)
	}
}

// 开关状态变化回调
function getSelectedForceMode() {
	const mode = modes.value[selectedMode.value]
	return MODE_KEY_MAP[mode.key] || FORCE_MODE.CONST
}

function doPowerOn() {
	pendingPowerAction.value = 'opening'
	pendingConfirmForce = dialValue.value
	pendingConfirmMode = getSelectedForceMode()
	schedulePendingPowerConfirmTimeout('opening')
	tracePower('doPowerOn begin', {
		actionId: powerActionSeq,
		dialValue: dialValue.value,
		modeIndex: selectedMode.value,
		forceMode: pendingConfirmMode,
		pagePowerOn: powerOn.value,
		pendingPowerAction: pendingPowerAction.value,
		dialPowerOn: getDialPowerState()
	})
	setCount++
	needCaptureBaseline = true
	lastSportCount = null
	resetLiveBar()
	lastActiveTs = 0

	if (activeTimer) { clearInterval(activeTimer); activeTimer = null }
	activeTimer = setInterval(() => {
		if (lastActiveTs > 0 && (Date.now() - lastActiveTs) < IDLE_WINDOW) {
			activeSeconds++
		}
	}, 1000)

	serialService.startWorking(pendingConfirmForce, pendingConfirmMode, 200)
	tracePower('doPowerOn dispatched startWorking', {
		actionId: powerActionSeq,
		dialValue: pendingConfirmForce,
		forceMode: pendingConfirmMode,
		pagePowerOn: powerOn.value,
		pendingPowerAction: pendingPowerAction.value,
		dialPowerOn: getDialPowerState()
	})
}

function doPowerOff() {
	pendingPowerAction.value = 'closing'
	pendingConfirmForce = null
	pendingConfirmMode = FORCE_MODE.OFF
	schedulePendingPowerConfirmTimeout('closing')
	tracePower('doPowerOff begin', {
		actionId: powerActionSeq,
		dialValue: dialValue.value,
		lastForce,
		pagePowerOn: powerOn.value,
		pendingPowerAction: pendingPowerAction.value,
		dialPowerOn: getDialPowerState()
	})
	if (activeTimer) { clearInterval(activeTimer); activeTimer = null }
	lastSportCount = null
	resetLiveBar()
	serialService.stopForce({
		keepPolling: true,
		pollingDuration: POWER_CONFIRM_TIMEOUT
	})
	dialValue.value = lastForce
	tracePower('doPowerOff dispatched stopForce', {
		actionId: powerActionSeq,
		dialValue: dialValue.value,
		lastForce,
		pagePowerOn: powerOn.value,
		pendingPowerAction: pendingPowerAction.value,
		dialPowerOn: getDialPowerState()
	})
}

const onPowerRequest = (isOn) => {
	powerActionSeq += 1
	tracePower('onPowerRequest received', {
		actionId: powerActionSeq,
		isOn,
		pagePowerOn: powerOn.value,
		pendingPowerAction: pendingPowerAction.value,
		dialPowerOn: getDialPowerState(),
		dialValue: dialValue.value
	})
	if (pendingPowerAction.value !== null) {
		tracePower('onPowerRequest ignored: confirm pending', {
			actionId: powerActionSeq,
			isOn,
			pagePowerOn: powerOn.value,
			pendingPowerAction: pendingPowerAction.value,
			dialPowerOn: getDialPowerState()
		})
		return
	}
	if (powerOn.value === isOn) {
		tracePower('onPowerRequest ignored: same confirmed state', {
			actionId: powerActionSeq,
			isOn,
			pagePowerOn: powerOn.value,
			dialPowerOn: getDialPowerState()
		})
		return
	}
	isOn ? doPowerOn() : doPowerOff()
}

// 模式选择（选择即确认，不依赖开关状态）
const selectMode = (index) => {
	if (pendingPowerAction.value !== null) return
	if (selectedMode.value === index) return // 防止重复选择同一个
	
	selectedMode.value = index
	
	if (powerOn.value) {
		tracePower('selectMode update while power on', {
			index,
			modeKey: modes.value[index]?.key,
			dialValue: dialValue.value
		})
		serialService.updateWorkingForce(dialValue.value, getSelectedForceMode())
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
	height: 320rpx;
	margin-bottom: 24rpx;
	flex-shrink: 0;
	padding: 24rpx 24rpx 20rpx;
	box-sizing: border-box;
	border-radius: 24rpx;
	border: 3rpx solid #d0d0d0;
	box-shadow: 
		0 8rpx 24rpx rgba(0, 0, 0, 0.12),
		0 2rpx 6rpx rgba(0, 0, 0, 0.08),
		inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
	overflow: hidden;
}

.force-curve-head {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	margin-bottom: 12rpx;
}

.force-curve-copy {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.force-curve-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #1F2937;
}

.force-curve-legend {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.force-curve-legend-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.force-curve-dot {
	width: 14rpx;
	height: 14rpx;
	border-radius: 50%;
}

.force-curve-dot--history {
	background: #5B8FF9;
}

.force-curve-dot--live {
	background: #36CFC9;
}

.force-curve-legend-text {
	font-size: 22rpx;
	color: #6B7280;
}

.force-curve-metric {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 4rpx;
}

.force-curve-metric-label {
	font-size: 22rpx;
	color: #6B7280;
}

.force-curve-metric-value {
	font-size: 34rpx;
	font-weight: 700;
	color: #111827;
}

.force-curve-chart-box {
	position: relative;
	width: 100%;
	height: 220rpx;
	border-radius: 18rpx;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(244, 247, 251, 0.98));
	overflow: hidden;
}

.force-curve-history-chart {
	position: relative;
	z-index: 1;
}

.force-curve-live-overlay {
	position: absolute;
	top: 16rpx;
	right: 18rpx;
	bottom: 18rpx;
	left: 50rpx;
	display: flex;
	pointer-events: none;
	z-index: 2;
}

.force-curve-live-slot {
	flex: 1;
	display: flex;
	align-items: flex-end;
	justify-content: center;
}

.force-curve-live-bar {
	width: 16rpx;
	min-height: 2rpx;
	border-radius: 10rpx 10rpx 0 0;
	background: linear-gradient(180deg, #62F0E2 0%, #36CFC9 100%);
	box-shadow: 0 6rpx 14rpx rgba(54, 207, 201, 0.22);
	transition: height 0.16s linear;
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
