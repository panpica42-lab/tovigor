<template>
	<scroll-view class="page-scroll" scroll-y>
		<view class="page">
			<view class="hero">
				<text class="hero-title">Qiun Chart Dynamic Test</text>
				<text class="hero-copy">This page keeps the original static charts and adds controlled live updates, so we can verify both first render and in-place data refresh.</text>
			</view>

			<view class="control-panel">
				<view class="control-copy">
					<text class="control-title">Live refresh probe</text>
					<text class="control-note">Use this to test whether the same chart instance redraws after `chartData` changes.</text>
				</view>
				<view class="control-actions">
					<button class="control-btn control-btn-primary" @click="startAutoRefresh" :disabled="autoRefreshing">
						Start Auto
					</button>
					<button class="control-btn" @click="stopAutoRefresh" :disabled="!autoRefreshing">
						Stop
					</button>
					<button class="control-btn" @click="tickOnce">
						Tick Once
					</button>
					<button class="control-btn" @click="resetProbe">
						Reset
					</button>
				</view>
			</view>

			<view class="status-panel">
				<view class="status-row">
					<text class="status-label">Line chart</text>
					<text class="status-value" :class="lineStatusClass">{{ lineStatus }}</text>
				</view>
				<view class="status-row">
					<text class="status-label">Column chart</text>
					<text class="status-value" :class="columnStatusClass">{{ columnStatus }}</text>
				</view>
				<view class="status-row">
					<text class="status-label">Auto refresh</text>
					<text class="status-value" :class="autoRefreshing ? 'status-ok' : 'status-waiting'">
						{{ autoRefreshing ? 'running' : 'stopped' }}
					</text>
				</view>
				<view class="status-row">
					<text class="status-label">Data updates</text>
					<text class="status-value status-neutral">{{ updateCount }}</text>
				</view>
				<view class="status-row">
					<text class="status-label">Last update</text>
					<text class="status-value status-neutral">{{ lastUpdatedAt }}</text>
				</view>
				<view class="status-row">
					<text class="status-label">Line complete events</text>
					<text class="status-value status-neutral">{{ lineCompleteCount }}</text>
				</view>
				<view class="status-row">
					<text class="status-label">Column complete events</text>
					<text class="status-value status-neutral">{{ columnCompleteCount }}</text>
				</view>
			</view>

			<view class="chart-card">
				<view class="chart-head">
					<text class="chart-title">Weekly Force Trend</text>
					<text class="chart-note">If live refresh works, the line shape should keep changing and complete events should continue increasing.</text>
				</view>
				<view class="chart-box">
					<qiun-data-charts
						canvasId="lineChartProbe"
						type="line"
						style="width: 100%; height: 100%;"
						:chartData="lineChartData"
						:opts="lineOpts"
						background="#FFFFFF"
						@complete="handleLineComplete"
						@error="handleLineError"
					/>
				</view>
			</view>

			<view class="chart-card">
				<view class="chart-head">
					<text class="chart-title">Left vs Right Power</text>
					<text class="chart-note">The grouped columns should also update in place without navigating away or remounting the page.</text>
				</view>
				<view class="chart-box">
					<qiun-data-charts
						canvasId="columnChartProbe"
						type="column"
						style="width: 100%; height: 100%;"
						:chartData="columnChartData"
						:opts="columnOpts"
						background="#FFFFFF"
						@complete="handleColumnComplete"
						@error="handleColumnError"
					/>
				</view>
			</view>

			<view class="info-card">
				<text class="info-title">What this verifies</text>
				<text class="info-copy">1. The plugin still compiles and renders correctly on first load.</text>
				<text class="info-copy">2. Updating `chartData` in Vue 3 triggers redraws on the existing chart component instance.</text>
				<text class="info-copy">3. The plugin continues to emit `complete` after later redraws, not only after the first render.</text>
				<text class="info-copy">4. If a redraw fails, the status panel should switch from `rendered` to an `error:` message.</text>
			</view>
		</view>
	</scroll-view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

const AUTO_REFRESH_INTERVAL = 1600
const baseLineCategories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const baseLineValues = [12, 18, 21, 27, 24, 30]
const baseColumnCategories = ['Set 1', 'Set 2', 'Set 3', 'Set 4']
const baseLeftValues = [82, 96, 108, 114]
const baseRightValues = [78, 92, 105, 118]

const createLineChartData = (categories = baseLineCategories, values = baseLineValues) => ({
	categories: [...categories],
	series: [
		{
			name: 'Force',
			data: [...values]
		}
	]
})

const createColumnChartData = (leftValues = baseLeftValues, rightValues = baseRightValues) => ({
	categories: [...baseColumnCategories],
	series: [
		{
			name: 'Left',
			data: [...leftValues]
		},
		{
			name: 'Right',
			data: [...rightValues]
		}
	]
})

const lineStatus = ref('waiting')
const columnStatus = ref('waiting')
const lineCompleteCount = ref(0)
const columnCompleteCount = ref(0)
const autoRefreshing = ref(false)
const updateCount = ref(0)
const lastUpdatedAt = ref('never')
const lineChartData = ref(createLineChartData())
const columnChartData = ref(createColumnChartData())

let refreshTimer = null
let tickCursor = baseLineCategories.length

const lineOpts = {
	color: ['#2563EB'],
	padding: [18, 18, 8, 12],
	dataLabel: false,
	enableScroll: false,
	legend: {
		position: 'top'
	},
	xAxis: {
		disableGrid: true
	},
	yAxis: {
		gridType: 'dash',
		dashLength: 2
	},
	extra: {
		line: {
			type: 'curve',
			width: 3,
			activeType: 'hollow'
		}
	}
}

const columnOpts = {
	color: ['#16A34A', '#F59E0B'],
	padding: [18, 18, 8, 12],
	dataLabel: true,
	enableScroll: false,
	legend: {
		position: 'top'
	},
	xAxis: {
		disableGrid: true
	},
	yAxis: {
		gridType: 'dash',
		dashLength: 2
	},
	extra: {
		column: {
			type: 'group',
			width: 18,
			activeBgColor: '#0F172A',
			activeBgOpacity: 0.08
		}
	}
}

const lineStatusClass = computed(() => {
	return lineStatus.value.startsWith('error:') ? 'status-error' : lineStatus.value === 'rendered' ? 'status-ok' : 'status-waiting'
})

const columnStatusClass = computed(() => {
	return columnStatus.value.startsWith('error:') ? 'status-error' : columnStatus.value === 'rendered' ? 'status-ok' : 'status-waiting'
})

const clamp = (value, min, max) => {
	return Math.max(min, Math.min(max, value))
}

const formatClock = (timestamp) => {
	const date = new Date(timestamp)
	const h = String(date.getHours()).padStart(2, '0')
	const m = String(date.getMinutes()).padStart(2, '0')
	const s = String(date.getSeconds()).padStart(2, '0')
	return `${h}:${m}:${s}`
}

const applyNextDataset = () => {
	const previousCategories = lineChartData.value.categories
	const previousForceData = lineChartData.value.series[0].data
	const lastForce = previousForceData[previousForceData.length - 1]
	const nextForce = clamp(lastForce + Math.round((Math.random() - 0.5) * 12), 8, 36)
	const nextLabel = `T${tickCursor + 1}`

	lineChartData.value = createLineChartData(
		[...previousCategories.slice(1), nextLabel],
		[...previousForceData.slice(1), nextForce]
	)

	const leftValues = baseLeftValues.map((value, index) => {
		return clamp(value + ((tickCursor + index) % 5) * 4 - 6, 60, 140)
	})
	const rightValues = baseRightValues.map((value, index) => {
		return clamp(value + ((tickCursor + index + 2) % 6) * 3 - 7, 60, 140)
	})

	columnChartData.value = createColumnChartData(leftValues, rightValues)
	updateCount.value += 1
	lastUpdatedAt.value = formatClock(Date.now())
	tickCursor += 1
}

const clearRefreshTimer = () => {
	if (refreshTimer) {
		clearInterval(refreshTimer)
		refreshTimer = null
	}
}

const startAutoRefresh = () => {
	if (autoRefreshing.value) {
		return
	}
	autoRefreshing.value = true
	clearRefreshTimer()
	refreshTimer = setInterval(() => {
		applyNextDataset()
	}, AUTO_REFRESH_INTERVAL)
}

const stopAutoRefresh = () => {
	autoRefreshing.value = false
	clearRefreshTimer()
}

const tickOnce = () => {
	applyNextDataset()
}

const resetProbe = () => {
	stopAutoRefresh()
	tickCursor = baseLineCategories.length
	updateCount.value = 0
	lastUpdatedAt.value = 'reset to baseline'
	lineStatus.value = 'waiting'
	columnStatus.value = 'waiting'
	lineCompleteCount.value = 0
	columnCompleteCount.value = 0
	lineChartData.value = createLineChartData()
	columnChartData.value = createColumnChartData()
}

const handleLineComplete = () => {
	lineStatus.value = 'rendered'
	lineCompleteCount.value += 1
}

const handleColumnComplete = () => {
	columnStatus.value = 'rendered'
	columnCompleteCount.value += 1
}

const handleLineError = (event) => {
	lineStatus.value = `error: ${event?.msg || 'unknown'}`
}

const handleColumnError = (event) => {
	columnStatus.value = `error: ${event?.msg || 'unknown'}`
}

onBeforeUnmount(() => {
	clearRefreshTimer()
})
</script>

<style scoped>
.page-scroll {
	height: 100vh;
	background:
		radial-gradient(circle at top right, rgba(37, 99, 235, 0.14), transparent 26%),
		linear-gradient(180deg, #eff6ff 0%, #f8fafc 44%, #eef2ff 100%);
}

.page {
	padding: 24rpx;
}

.hero {
	background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
	border-radius: 28rpx;
	padding: 34rpx 30rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 16rpx 40rpx rgba(15, 23, 42, 0.18);
}

.hero-title {
	display: block;
	font-size: 40rpx;
	font-weight: 700;
	color: #ffffff;
	margin-bottom: 12rpx;
}

.hero-copy {
	display: block;
	font-size: 25rpx;
	line-height: 1.6;
	color: rgba(255, 255, 255, 0.82);
}

.control-panel,
.status-panel,
.chart-card,
.info-card {
	background-color: rgba(255, 255, 255, 0.94);
	border-radius: 24rpx;
	padding: 24rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 10rpx 30rpx rgba(15, 23, 42, 0.06);
}

.control-copy {
	margin-bottom: 18rpx;
}

.control-title {
	display: block;
	font-size: 30rpx;
	font-weight: 700;
	color: #0f172a;
	margin-bottom: 8rpx;
}

.control-note {
	display: block;
	font-size: 24rpx;
	line-height: 1.6;
	color: #64748b;
}

.control-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 14rpx;
}

.control-btn {
	margin: 0;
	padding: 0 26rpx;
	height: 72rpx;
	line-height: 72rpx;
	border-radius: 999rpx;
	background-color: #e2e8f0;
	color: #0f172a;
	font-size: 24rpx;
	border: none;
}

.control-btn::after {
	border: none;
}

.control-btn-primary {
	background-color: #1d4ed8;
	color: #ffffff;
}

.control-btn[disabled] {
	opacity: 0.45;
}

.status-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20rpx;
	padding: 10rpx 0;
}

.status-label {
	font-size: 28rpx;
	font-weight: 600;
	color: #0f172a;
}

.status-value {
	max-width: 65%;
	font-size: 24rpx;
	line-height: 1.4;
	padding: 10rpx 16rpx;
	border-radius: 999rpx;
	word-break: break-all;
}

.status-ok {
	background-color: #dcfce7;
	color: #166534;
}

.status-error {
	background-color: #fee2e2;
	color: #991b1b;
}

.status-waiting {
	background-color: #e0f2fe;
	color: #075985;
}

.status-neutral {
	background-color: #e2e8f0;
	color: #334155;
}

.chart-head {
	margin-bottom: 18rpx;
}

.chart-title {
	display: block;
	font-size: 30rpx;
	font-weight: 700;
	color: #0f172a;
	margin-bottom: 8rpx;
}

.chart-note {
	display: block;
	font-size: 24rpx;
	line-height: 1.5;
	color: #64748b;
}

.chart-box {
	height: 520rpx;
	padding: 12rpx;
	border-radius: 20rpx;
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.98) 100%);
	border: 2rpx solid #e2e8f0;
}

.info-title {
	display: block;
	font-size: 30rpx;
	font-weight: 700;
	color: #0f172a;
	margin-bottom: 12rpx;
}

.info-copy {
	display: block;
	font-size: 24rpx;
	line-height: 1.7;
	color: #475569;
}
</style>
