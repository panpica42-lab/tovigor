<!--
	产品语义说明：
	这个组件对应用户点击“AI推荐”后，第一步看到的“基础信息弹窗”。
	它不是结果页，而是推荐前的信息收集层。
	
	用户肉眼看到的内容包括：
	1. 顶部蓝色提示条：“请填写以下信息，AI教练帮你推荐课程”
	2. 基本信息表单
	3. 性别、身高、体重、训练目的、训练部位、难度、训练方式
	4. 底部“开始分析”按钮
	
	这个弹窗在产品上的作用不是让用户自己筛课，
	而是让用户快速补充几个关键条件，好让系统帮他做一次推荐决策。
-->
<template>
	<view v-if="visible" class="modal-overlay" @click="handleMaskClick">
		<view class="modal-shell" @click.stop>
			<view class="modal-close" @click="handleClose">
				<text class="modal-close-text">×</text>
			</view>

			<view class="modal-banner">
				<text class="modal-banner-text">请填写以下信息，AI教练帮你推荐课程</text>
				<image
					class="modal-banner-avatar"
					src="/static/icons/partTrainingActivity/AI_coach_Vince.png"
					mode="aspectFit"
				/>
			</view>

			<view class="modal-card">
				<text class="modal-title">基本信息</text>

				<view class="modal-body">
					<view class="section-block">
						<text class="section-label">性别</text>
						<view class="chip-row chip-row--compact">
							<view
								v-for="option in genderOptions"
								:key="option.value"
								class="choice-chip"
								:class="{ 'choice-chip--active': form.gender === option.value }"
								@click="setSingleChoice('gender', option.value)"
							>
								<text
									class="choice-chip-text"
									:class="{ 'choice-chip-text--active': form.gender === option.value }"
								>
									{{ option.label }}
								</text>
							</view>
						</view>
					</view>

					<view class="section-block">
						<view class="section-head">
							<text class="section-label">身高</text>
							<text class="section-unit">单位：cm</text>
						</view>
						<text class="metric-value">{{ form.height }}</text>
						<view
							id="height-ruler"
							class="ruler-scale"
							@click="handleRulerTap('height', $event)"
							@touchstart.stop="handleRulerTouch('height', $event)"
							@touchmove.stop.prevent="handleRulerTouch('height', $event)"
						>
							<view class="ruler-track">
								<view
									v-for="tick in heightTicks"
									:key="'height-' + tick"
									class="ruler-tick"
									:class="{
										'ruler-tick--major': tick % 5 === 0,
										'ruler-tick--active': tick === heightActiveTick
									}"
								></view>
							</view>
							<view class="ruler-indicator" :style="heightIndicatorStyle">
								<view class="ruler-indicator-dot"></view>
							</view>
						</view>
					</view>

					<view class="section-block">
						<view class="section-head">
							<text class="section-label">体重</text>
							<text class="section-unit">单位：KG</text>
						</view>
						<text class="metric-value">{{ form.weight }}</text>
						<view
							id="weight-ruler"
							class="ruler-scale"
							@click="handleRulerTap('weight', $event)"
							@touchstart.stop="handleRulerTouch('weight', $event)"
							@touchmove.stop.prevent="handleRulerTouch('weight', $event)"
						>
							<view class="ruler-track">
								<view
									v-for="tick in weightTicks"
									:key="'weight-' + tick"
									class="ruler-tick"
									:class="{
										'ruler-tick--major': tick % 5 === 0,
										'ruler-tick--active': tick === weightActiveTick
									}"
								></view>
							</view>
							<view class="ruler-indicator" :style="weightIndicatorStyle">
								<view class="ruler-indicator-dot"></view>
							</view>
						</view>
					</view>

					<view class="section-block">
						<text class="section-label">训练目的</text>
						<view class="chip-row">
							<view
								v-for="option in goalOptions"
								:key="option.value"
								class="choice-chip"
								:class="{ 'choice-chip--active': form.goal === option.value }"
								@click="setSingleChoice('goal', option.value)"
							>
								<text
									class="choice-chip-text"
									:class="{ 'choice-chip-text--active': form.goal === option.value }"
								>
									{{ option.label }}
								</text>
							</view>
						</view>
					</view>

					<view class="section-block">
						<text class="section-label">训练部位</text>
						<view class="chip-row">
							<view
								v-for="option in partOptions"
								:key="option.value"
								class="choice-chip"
								:class="{ 'choice-chip--active': form.part === option.value }"
								@click="setSingleChoice('part', option.value)"
							>
								<text
									class="choice-chip-text"
									:class="{ 'choice-chip-text--active': form.part === option.value }"
								>
									{{ option.label }}
								</text>
							</view>
						</view>
					</view>

					<view class="section-block">
						<text class="section-label">难度</text>
						<view class="chip-row chip-row--compact">
							<view
								v-for="option in levelOptions"
								:key="option.value"
								class="choice-chip"
								:class="{ 'choice-chip--active': form.level === option.value }"
								@click="setSingleChoice('level', option.value)"
							>
								<text
									class="choice-chip-text"
									:class="{ 'choice-chip-text--active': form.level === option.value }"
								>
									{{ option.label }}
								</text>
							</view>
						</view>
					</view>

					<view class="section-block section-block--last">
						<text class="section-label">训练方式</text>
						<view class="chip-row chip-row--compact">
							<view
								v-for="option in methodOptions"
								:key="option.value"
								class="choice-chip"
								:class="{ 'choice-chip--active': form.method === option.value }"
								@click="setSingleChoice('method', option.value)"
							>
								<text
									class="choice-chip-text"
									:class="{ 'choice-chip-text--active': form.method === option.value }"
								>
									{{ option.label }}
								</text>
							</view>
						</view>
					</view>
				</view>

				<view class="action-wrap">
					<view class="action-button" @click="handleStart">
						<text class="action-button-text">开始分析</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, watch, nextTick, getCurrentInstance } from 'vue'

const props = defineProps({
	visible: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['update:visible', 'start'])

const genderOptions = [
	{ value: 'female', label: '女' },
	{ value: 'male', label: '男' }
]

const goalOptions = [
	{ value: 'fat-loss', label: '减脂塑形' },
	{ value: 'muscle', label: '增肌增力' },
	{ value: 'health', label: '全面健康' },
	{ value: 'wellness', label: '健康养生' },
	{ value: 'youth', label: '青少年适能' }
]

const partOptions = [
	{ value: 'shoulder', label: '肩部' },
	{ value: 'arm', label: '手臂' },
	{ value: 'back', label: '背部' },
	{ value: 'chest', label: '胸部' },
	{ value: 'core', label: '腰腹' },
	{ value: 'leg', label: '臀腿' },
	{ value: 'full-body', label: '全身' }
]

const levelOptions = [
	{ value: 'beginner', label: '初级' },
	{ value: 'intermediate', label: '中级' },
	{ value: 'advanced', label: '高级' }
]

const methodOptions = [
	{ value: 'resistance', label: '有力臂' },
	{ value: 'no-resistance', label: '无力臂' }
]

const form = ref({
	gender: 'female',
	height: 160,
	weight: 45,
	goal: 'fat-loss',
	part: 'shoulder',
	level: 'intermediate',
	method: 'resistance'
})

const heightRange = {
	min: 140,
	max: 200
}

const weightRange = {
	min: 30,
	max: 90
}

const heightTicks = Array.from({ length: 25 }, (_, index) => index)
const weightTicks = Array.from({ length: 25 }, (_, index) => index)
const rulerRects = ref({
	height: {
		left: 0,
		width: 0
	},
	weight: {
		left: 0,
		width: 0
	}
})
const instance = getCurrentInstance()

const getIndicatorPercent = (value, range) => {
	return ((value - range.min) / (range.max - range.min)) * 100
}

const getActiveTick = (value, range, tickCount) => {
	return Math.round(((value - range.min) / (range.max - range.min)) * (tickCount - 1))
}

const heightIndicatorStyle = computed(() => ({
	left: `${getIndicatorPercent(form.value.height, heightRange)}%`
}))

const weightIndicatorStyle = computed(() => ({
	left: `${getIndicatorPercent(form.value.weight, weightRange)}%`
}))

const heightActiveTick = computed(() => {
	return getActiveTick(form.value.height, heightRange, heightTicks.length)
})

const weightActiveTick = computed(() => {
	return getActiveTick(form.value.weight, weightRange, weightTicks.length)
})

const setSingleChoice = (key, value) => {
	form.value[key] = value
}

const getTouchClientX = (event) => {
	const touch = event?.changedTouches?.[0] || event?.touches?.[0]
	return touch?.clientX ?? event?.detail?.x ?? 0
}

const getMetricConfig = (type) => {
	return type === 'height'
		? { key: 'height', range: heightRange }
		: { key: 'weight', range: weightRange }
}

const clampMetricValue = (value, range) => {
	return Math.min(range.max, Math.max(range.min, value))
}

const updateMetricByPosition = (type, clientX) => {
	const rect = rulerRects.value[type]
	if (!rect || rect.width <= 0) {
		return
	}

	const { key, range } = getMetricConfig(type)
	const offsetX = Math.min(rect.width, Math.max(0, clientX - rect.left))
	const ratio = offsetX / rect.width
	const rawValue = range.min + ratio * (range.max - range.min)
	form.value[key] = Math.round(clampMetricValue(rawValue, range))
}

const handleRulerTouch = (type, event) => {
	updateMetricByPosition(type, getTouchClientX(event))
}

const handleRulerTap = (type, event) => {
	updateMetricByPosition(type, getTouchClientX(event))
}

const measureRulers = () => {
	if (!instance?.proxy) {
		return
	}

	const query = uni.createSelectorQuery().in(instance.proxy)
	query.select('#height-ruler').boundingClientRect()
	query.select('#weight-ruler').boundingClientRect()
	query.exec((rects) => {
		if (rects?.[0]) {
			rulerRects.value.height = {
				left: rects[0].left,
				width: rects[0].width
			}
		}

		if (rects?.[1]) {
			rulerRects.value.weight = {
				left: rects[1].left,
				width: rects[1].width
			}
		}
	})
}

const handleClose = () => {
	emit('update:visible', false)
}

const handleMaskClick = () => {
	handleClose()
}

const handleStart = () => {
	emit('start', {
		...form.value
	})
}

watch(
	() => props.visible,
	async (visible) => {
		if (!visible) {
			return
		}

		await nextTick()
		measureRulers()
	},
	{ immediate: true }
)
</script>

<style scoped lang="scss">
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 9998;
	background: rgba(0, 0, 0, 0.24);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 18rpx;
	box-sizing: border-box;
}

.modal-shell {
	position: relative;
	width: 620rpx;
	padding-top: 76rpx;
}

.modal-close {
	position: absolute;
	left: 4rpx;
	top: 8rpx;
	width: 52rpx;
	height: 52rpx;
	border-radius: 26rpx;
	background: rgba(191, 225, 252, 0.96);
	border: 4rpx solid #1D2939;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 3;
	box-sizing: border-box;
}

.modal-close-text {
	font-size: 30rpx;
	line-height: 1;
	font-weight: 700;
	color: #111111;
}

.modal-banner {
	position: absolute;
	top: 0;
	right: 0;
	height: 68rpx;
	padding: 0 94rpx 0 24rpx;
	border-radius: 34rpx;
	background: linear-gradient(90deg, #76B6FF 0%, #4C94EC 100%);
	display: flex;
	align-items: center;
	box-sizing: border-box;
	z-index: 2;
	box-shadow: 0 10rpx 24rpx rgba(76, 148, 236, 0.24);
	width: auto;
	max-width: 556rpx;
}

.modal-banner-text {
	font-size: 20rpx;
	font-weight: 600;
	color: #FFFFFF;
	line-height: 1.3;
	white-space: nowrap;
}

.modal-banner-avatar {
	position: absolute;
	right: 8rpx;
	bottom: 0;
	width: 88rpx;
	height: 88rpx;
}

.modal-card {
	background: #FFFFFF;
	border-radius: 30rpx;
	padding: 26rpx 22rpx 20rpx;
	box-sizing: border-box;
	box-shadow: 0 22rpx 52rpx rgba(0, 0, 0, 0.16);
	height: 78vh;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.modal-title {
	display: block;
	text-align: center;
	font-size: 29rpx;
	font-weight: 700;
	color: #1F2937;
	margin-bottom: 14rpx;
}

.section-block {
	margin-bottom: 12rpx;
}

.section-block--last {
	margin-bottom: 0;
}

.modal-body {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.section-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 4rpx;
}

.section-label {
	display: block;
	font-size: 23rpx;
	font-weight: 700;
	color: #111827;
	margin-bottom: 6rpx;
}

.section-unit {
	font-size: 17rpx;
	font-weight: 600;
	color: #374151;
}

.metric-value {
	display: block;
	text-align: center;
	font-size: 29rpx;
	font-weight: 700;
	color: #1F2937;
	margin-bottom: 5rpx;
}

.ruler-scale {
	position: relative;
	height: 50rpx;
	border-radius: 25rpx;
	background: #F3F4F6;
	padding: 0 18rpx;
	display: flex;
	align-items: center;
	box-sizing: border-box;
}

.ruler-track {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.ruler-tick {
	width: 3rpx;
	height: 13rpx;
	border-radius: 999rpx;
	background: #9CA3AF;
	opacity: 0.92;
}

.ruler-tick--major {
	height: 20rpx;
	background: #6B7280;
}

.ruler-tick--active {
	background: #A3D63D;
}

.ruler-indicator {
	position: absolute;
	top: 5rpx;
	width: 23rpx;
	height: 40rpx;
	border-radius: 12rpx;
	background: #A3D63D;
	transform: translateX(-50%);
	box-shadow: 0 6rpx 12rpx rgba(163, 214, 61, 0.22);
	display: flex;
	align-items: center;
	justify-content: center;
}

.ruler-indicator-dot {
	width: 6rpx;
	height: 19rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.92);
}

.chip-row {
	display: flex;
	flex-wrap: wrap;
	gap: 9rpx;
}

.chip-row--compact {
	gap: 8rpx;
}

.choice-chip {
	min-width: 78rpx;
	height: 35rpx;
	padding: 0 12rpx;
	border-radius: 18rpx;
	background: #E5E7EB;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
}

.choice-chip--active {
	background: #A3D63D;
}

.choice-chip-text {
	font-size: 17rpx;
	font-weight: 600;
	color: #9CA3AF;
	line-height: 1;
}

.choice-chip-text--active {
	color: #FFFFFF;
}

.action-wrap {
	padding: 0 96rpx;
	margin-top: auto;
	padding-top: 14rpx;
}

.action-button {
	height: 56rpx;
	border-radius: 28rpx;
	background: linear-gradient(180deg, #B5E74A 0%, #9DD738 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 16rpx rgba(157, 215, 56, 0.2);
}

.action-button-text {
	font-size: 25rpx;
	font-weight: 700;
	color: #FFFFFF;
}
</style>
