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
					<view class="ruler-scale">
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
						<view class="ruler-indicator" :style="heightIndicatorStyle"></view>
					</view>
				</view>

				<view class="section-block">
					<view class="section-head">
						<text class="section-label">体重</text>
						<text class="section-unit">单位：KG</text>
					</view>
					<text class="metric-value">{{ form.weight }}</text>
					<view class="ruler-scale">
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
						<view class="ruler-indicator" :style="weightIndicatorStyle"></view>
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
import { ref, computed } from 'vue'

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
	left: 64rpx;
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
}

.modal-banner-text {
	font-size: 20rpx;
	font-weight: 600;
	color: #FFFFFF;
	line-height: 1.3;
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
	padding: 32rpx 24rpx 22rpx;
	box-sizing: border-box;
	box-shadow: 0 22rpx 52rpx rgba(0, 0, 0, 0.16);
	max-height: 78vh;
	overflow-y: auto;
}

.modal-title {
	display: block;
	text-align: center;
	font-size: 30rpx;
	font-weight: 700;
	color: #1F2937;
	margin-bottom: 18rpx;
}

.section-block {
	margin-bottom: 16rpx;
}

.section-block--last {
	margin-bottom: 20rpx;
}

.section-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 6rpx;
}

.section-label {
	display: block;
	font-size: 24rpx;
	font-weight: 700;
	color: #111827;
	margin-bottom: 8rpx;
}

.section-unit {
	font-size: 18rpx;
	font-weight: 600;
	color: #374151;
}

.metric-value {
	display: block;
	text-align: center;
	font-size: 30rpx;
	font-weight: 700;
	color: #1F2937;
	margin-bottom: 6rpx;
}

.ruler-scale {
	position: relative;
	height: 44rpx;
	border-radius: 22rpx;
	background: #F3F4F6;
	padding: 0 16rpx;
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
	height: 14rpx;
	border-radius: 999rpx;
	background: #9CA3AF;
	opacity: 0.92;
}

.ruler-tick--major {
	height: 22rpx;
	background: #6B7280;
}

.ruler-tick--active {
	background: #A3D63D;
}

.ruler-indicator {
	position: absolute;
	top: 7rpx;
	width: 4rpx;
	height: 30rpx;
	border-radius: 999rpx;
	background: #A3D63D;
	transform: translateX(-50%);
	box-shadow: 0 0 0 4rpx rgba(163, 214, 61, 0.12);
}

.chip-row {
	display: flex;
	flex-wrap: wrap;
	gap: 10rpx;
}

.chip-row--compact {
	gap: 12rpx;
}

.choice-chip {
	min-width: 82rpx;
	height: 38rpx;
	padding: 0 14rpx;
	border-radius: 19rpx;
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
	font-size: 18rpx;
	font-weight: 600;
	color: #9CA3AF;
	line-height: 1;
}

.choice-chip-text--active {
	color: #FFFFFF;
}

.action-wrap {
	padding: 0 100rpx;
}

.action-button {
	height: 60rpx;
	border-radius: 30rpx;
	background: linear-gradient(180deg, #B5E74A 0%, #9DD738 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 10rpx 20rpx rgba(157, 215, 56, 0.22);
}

.action-button-text {
	font-size: 28rpx;
	font-weight: 700;
	color: #FFFFFF;
}
</style>
