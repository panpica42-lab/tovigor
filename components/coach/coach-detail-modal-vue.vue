<template>
	<view v-if="show" class="modal-overlay">
		<view class="modal-mask" @click="handleMaskClick"></view>

		<view class="modal-card" :style="themeCardStyle">
			<text class="modal-close" :style="themeCloseStyle" @click="handleClose">×</text>
			<text class="modal-title" :style="themeTitleStyle">AI教练</text>

			<view class="switch-row">
				<view
					v-for="coach in allCoaches"
					:key="coach.value"
					class="switch-btn"
					:style="coach.value === currentCoachValue ? activeSwitchStyle : inactiveSwitchStyle"
					:class="{ 'switch-btn--active': currentCoachValue === coach.value }"
					@click="switchCoach(coach.value)"
				>
					<text class="switch-btn-text" :style="coach.value === currentCoachValue ? activeSwitchTextStyle : inactiveSwitchTextStyle">{{ coach.fullName }}</text>
				</view>
			</view>

			<view class="avatar-wrap">
				<image
					class="coach-avatar-large"
					:src="displayCoach.avatar"
					mode="aspectFit"
				/>
			</view>

			<text class="coach-name" :style="themeTitleStyle">{{ displayCoach.label }}</text>
			<text class="coach-english-name" :style="themeSubtitleStyle">{{ displayCoach.englishName }}</text>
			<text class="coach-intro" :style="themeBodyStyle">{{ displayCoach.intro }}</text>

			<view class="coach-tags">
				<view
					v-for="(tag, index) in displayCoach.tags"
					:key="index"
					class="tag-chip"
					:style="themeTagStyle"
				>
					<text class="tag-text" :style="themeTagTextStyle">{{ tag }}</text>
				</view>
			</view>

			<view class="select-btn" @click="handleSelect">
				<text class="select-btn-text">选择{{ displayCoach.label }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getAllCoaches, getCoachByValue } from '@/utils/coachManager.js'

const props = defineProps({
	show: {
		type: Boolean,
		default: false
	},
	coachData: {
		type: Object,
		default: () => ({
			value: '',
			label: '',
			englishName: '',
			avatar: '',
			intro: '',
			tags: []
		})
	},
	switchable: {
		type: Boolean,
		default: false
	}
})

const emits = defineEmits(['update:show', 'select'])

const coachesObj = getAllCoaches()
const allCoaches = computed(() => Object.values(coachesObj))
const currentCoachValue = ref('')

const displayCoach = computed(() => {
	if (currentCoachValue.value) {
		return getCoachByValue(currentCoachValue.value) || props.coachData
	}
	return props.coachData
})

const isVeraTheme = computed(() => displayCoach.value?.value === 'vera')

const themeCardStyle = computed(() => ({
	background: isVeraTheme.value
		? 'linear-gradient(180deg, #FFE1EC 0%, #FFCFE0 100%)'
		: 'linear-gradient(180deg, #DDF0FF 0%, #C8E0FF 100%)'
}))

const themeTitleStyle = computed(() => ({
	color: '#243B53'
}))

const themeSubtitleStyle = computed(() => ({
	color: 'rgba(36, 59, 83, 0.72)'
}))

const themeBodyStyle = computed(() => ({
	color: 'rgba(36, 59, 83, 0.88)'
}))

const themeCloseStyle = computed(() => ({
	color: 'rgba(36, 59, 83, 0.68)'
}))

const themeTagStyle = computed(() => ({
	background: isVeraTheme.value ? 'rgba(255, 255, 255, 0.56)' : 'rgba(255, 255, 255, 0.58)',
	borderColor: isVeraTheme.value ? 'rgba(232, 134, 174, 0.45)' : 'rgba(90, 145, 220, 0.38)'
}))

const themeTagTextStyle = computed(() => ({
	color: isVeraTheme.value ? '#C25787' : '#3D76C5'
}))

const activeSwitchStyle = computed(() => ({
	background: '#00C853',
	borderColor: '#00C853'
}))

const inactiveSwitchStyle = computed(() => ({
	background: 'rgba(255, 255, 255, 0.42)',
	borderColor: 'rgba(36, 59, 83, 0.14)'
}))

const activeSwitchTextStyle = computed(() => ({
	color: '#FFFFFF'
}))

const inactiveSwitchTextStyle = computed(() => ({
	color: '#36506B'
}))

const syncCurrentCoachValue = () => {
	currentCoachValue.value = props.coachData?.value || 'vince'
}

watch(() => props.show, (newVal) => {
	if (newVal) {
		syncCurrentCoachValue()
	}
})

watch(() => props.coachData?.value, () => {
	if (props.show) {
		syncCurrentCoachValue()
	}
})

const switchCoach = (coachValue) => {
	currentCoachValue.value = coachValue
}

const handleClose = () => {
	emits('update:show', false)
}

const handleMaskClick = () => {
	handleClose()
}

const handleSelect = () => {
	emits('select', displayCoach.value)
	handleClose()
}
</script>

<style scoped lang="scss">
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
}

.modal-mask {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
}

.modal-card {
	width: 560rpx;
	border-radius: 32rpx;
	padding: 48rpx 32rpx 32rpx;
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	z-index: 1;
}

.modal-close {
	position: absolute;
	top: 20rpx;
	left: 20rpx;
	font-size: 40rpx;
	line-height: 40rpx;
	color: rgba(255, 255, 255, 0.7);
}

.modal-title {
	font-size: 36rpx;
	font-weight: 700;
	margin-bottom: 24rpx;
}

.switch-row {
	display: flex;
	flex-direction: row;
	justify-content: center;
	margin-bottom: 24rpx;
}

.switch-btn {
	padding: 12rpx 32rpx;
	border-radius: 24rpx;
	border: 2rpx solid transparent;
	margin-left: 12rpx;
	margin-right: 12rpx;
}

.switch-btn--active {
}

.switch-btn-text {
	font-size: 24rpx;
	font-weight: 700;
}

.avatar-wrap {
	width: 100%;
	display: flex;
	justify-content: center;
	margin-bottom: 32rpx;
}

.coach-avatar-large {
	width: 200rpx;
	height: 200rpx;
	border-radius: 50%;
}

.coach-name {
	font-size: 40rpx;
	font-weight: 700;
	margin-bottom: 8rpx;
}

.coach-english-name {
	font-size: 24rpx;
	margin-bottom: 24rpx;
}

.coach-intro {
	font-size: 26rpx;
	line-height: 42rpx;
	text-align: center;
	margin-bottom: 24rpx;
	padding: 0 16rpx;
}

.coach-tags {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	margin-bottom: 28rpx;
}

.tag-chip {
	padding: 8rpx 20rpx;
	border-radius: 20rpx;
	border: 1rpx solid transparent;
	margin-left: 6rpx;
	margin-right: 6rpx;
	margin-bottom: 12rpx;
}

.tag-text {
	font-size: 22rpx;
	font-weight: 700;
}

.select-btn {
	width: 480rpx;
	height: 88rpx;
	background-color: #00C853;
	border-radius: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.select-btn-text {
	font-size: 32rpx;
	font-weight: 700;
	color: #FFFFFF;
}
</style>
