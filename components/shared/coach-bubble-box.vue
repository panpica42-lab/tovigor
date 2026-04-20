<!--
 * AI教练气泡组件（vue / nvue 通用版）
 *
 * 目标：
 *   1. 统一教练气泡的视觉和交互
 *   2. 统一教练选择弹窗逻辑，页面只关心提示文案和少量事件
 *   3. 样式收敛到 nvue 可用子集，避免双实现继续漂移
 -->
<template>
	<view class="ccb-root" :style="rootStyle">
		<view class="ccb-bubble" :style="bubbleStyle">
			<view
				class="ccb-header"
				:style="{ backgroundColor: currentBadgeColor }"
				@click="handleHeaderClick"
			>
				<text class="ccb-header-role">{{ currentCoach.fullName }}</text>
				<image
					class="ccb-header-avatar"
					:src="currentCoach.avatar"
					:style="{ width: '66rpx', height: '66rpx' }"
				></image>
			</view>

			<view class="ccb-content" :style="contentStyle">
				<text class="ccb-content-text">{{ text }}</text>
			</view>
		</view>

		<view v-if="modalVisible" class="ccb-modal-overlay">
			<view class="ccb-modal-mask" @click="closeModal"></view>

			<view class="ccb-modal-card">
				<text class="ccb-modal-close" @click="closeModal">×</text>
				<text class="ccb-modal-title">AI教练</text>

				<view class="ccb-switch-row">
					<view
						v-for="coach in allCoaches"
						:key="coach.value"
						class="ccb-switch-btn"
						:style="coach.value === previewValue ? activeSwitchStyle : inactiveSwitchStyle"
						@click="previewCoach(coach.value)"
					>
						<text class="ccb-switch-text">{{ coach.fullName }}</text>
					</view>
				</view>

				<view class="ccb-avatar-wrap">
					<image
						:src="previewCoachData.avatar"
						:style="{ width: '200rpx', height: '200rpx', borderRadius: '100rpx' }"
					></image>
				</view>

				<text class="ccb-coach-name">{{ previewCoachData.label }}</text>
				<text class="ccb-coach-ename">{{ previewCoachData.englishName }}</text>
				<text class="ccb-coach-intro">{{ previewCoachData.intro }}</text>

				<view class="ccb-tags-row">
					<view
						v-for="(tag, index) in previewCoachData.tags"
						:key="index"
						class="ccb-tag"
					>
						<text class="ccb-tag-text">{{ tag }}</text>
					</view>
				</view>

				<view class="ccb-select-btn" @click="confirmSelect">
					<text class="ccb-select-text">选择{{ previewCoachData.label }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getSelectedCoach, setSelectedCoach, getAllCoaches, getCoachByValue } from '@/utils/coachManager.js'

function getFirstColor(backgroundText) {
	if (!backgroundText) return '#667eea'
	const colorMatch = backgroundText.match(/(#[0-9A-Fa-f]{3,8}|rgba?\([^)]+\))/)
	return colorMatch ? colorMatch[0] : '#667eea'
}

export default {
	props: {
		text: {
			type: String,
			default: ''
		},
		bubbleWidth: {
			type: String,
			default: ''
		},
		contentBackground: {
			type: String,
			default: 'rgba(255, 255, 255, 0.85)'
		},
		clickable: {
			type: Boolean,
			default: true
		}
	},

	emits: ['coach-changed', 'modal-open', 'modal-close'],

	data() {
		const currentCoach = getSelectedCoach()
		return {
			currentCoach,
			allCoaches: Object.values(getAllCoaches()),
			modalVisible: false,
			previewValue: currentCoach.value,
			activeSwitchStyle: {
				backgroundColor: '#00C853',
				borderColor: '#00C853'
			},
			inactiveSwitchStyle: {
				backgroundColor: 'rgba(255,255,255,0.1)',
				borderColor: 'rgba(255,255,255,0.3)'
			}
		}
	},

	computed: {
		rootStyle() {
			if (!this.bubbleWidth) return {}
			return {
				width: this.bubbleWidth,
				minWidth: this.bubbleWidth
			}
		},

		bubbleStyle() {
			if (!this.bubbleWidth) return {}
			return {
				width: '100%',
				minWidth: '100%'
			}
		},

		currentBadgeColor() {
			return getFirstColor(this.currentCoach.badgeBackground)
		},

		contentStyle() {
			const style = {
				backgroundColor: this.contentBackground
			}
			if (this.bubbleWidth) {
				style.width = '100%'
				style.minWidth = '100%'
			}
			return style
		},

		previewCoachData() {
			return getCoachByValue(this.previewValue) || this.currentCoach
		}
	},

	methods: {
		syncCurrentCoach() {
			this.currentCoach = getSelectedCoach()
		},

		handleHeaderClick() {
			if (!this.clickable) return
			this.openModal()
		},

		openModal() {
			this.syncCurrentCoach()
			this.previewValue = this.currentCoach.value
			this.modalVisible = true
			this.$emit('modal-open')
		},

		closeModal() {
			if (!this.modalVisible) return
			this.modalVisible = false
			this.$emit('modal-close')
		},

		previewCoach(coachValue) {
			this.previewValue = coachValue
		},

		confirmSelect() {
			if (this.previewValue !== this.currentCoach.value) {
				const saved = setSelectedCoach(this.previewValue)
				if (saved) {
					this.currentCoach = getCoachByValue(this.previewValue) || this.currentCoach
					this.$emit('coach-changed', this.currentCoach)
				}
			}
			this.closeModal()
		}
	}
}
</script>

<style>
.ccb-root {
	display: flex;
	flex-direction: column;
}

.ccb-bubble {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}

.ccb-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding-top: 4rpx;
	padding-bottom: 4rpx;
	padding-left: 16rpx;
	padding-right: 10rpx;
	border-top-left-radius: 24rpx;
	border-top-right-radius: 24rpx;
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;
	margin-left: 30rpx;
	margin-bottom: -2rpx;
}

.ccb-header-role {
	font-size: 24rpx;
	font-weight: bold;
	color: #FFFFFF;
	margin-right: 12rpx;
}

.ccb-header-avatar {
	width: 66rpx;
	height: 66rpx;
}

.ccb-content {
	padding-top: 16rpx;
	padding-bottom: 16rpx;
	padding-left: 20rpx;
	padding-right: 20rpx;
	border-top-left-radius: 24rpx;
	border-top-right-radius: 24rpx;
	border-bottom-left-radius: 24rpx;
	border-bottom-right-radius: 24rpx;
}

.ccb-content-text {
	width: 100%;
	font-size: 26rpx;
	line-height: 40rpx;
	color: #333333;
}

.ccb-modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
}

.ccb-modal-mask {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.6);
}

.ccb-modal-card {
	width: 560rpx;
	background-color: #1E3A8A;
	border-top-left-radius: 32rpx;
	border-top-right-radius: 32rpx;
	border-bottom-left-radius: 32rpx;
	border-bottom-right-radius: 32rpx;
	padding-top: 48rpx;
	padding-bottom: 32rpx;
	padding-left: 32rpx;
	padding-right: 32rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	z-index: 1;
}

.ccb-modal-close {
	position: absolute;
	top: 20rpx;
	left: 20rpx;
	font-size: 40rpx;
	line-height: 40rpx;
	color: rgba(255, 255, 255, 0.7);
}

.ccb-modal-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #FFFFFF;
	margin-bottom: 24rpx;
}

.ccb-switch-row {
	display: flex;
	flex-direction: row;
	justify-content: center;
	margin-bottom: 24rpx;
}

.ccb-switch-btn {
	padding-top: 12rpx;
	padding-bottom: 12rpx;
	padding-left: 32rpx;
	padding-right: 32rpx;
	border-top-left-radius: 24rpx;
	border-top-right-radius: 24rpx;
	border-bottom-left-radius: 24rpx;
	border-bottom-right-radius: 24rpx;
	border-width: 2rpx;
	border-style: solid;
	margin-left: 12rpx;
	margin-right: 12rpx;
}

.ccb-switch-text {
	font-size: 24rpx;
	font-weight: bold;
	color: #FFFFFF;
}

.ccb-avatar-wrap {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 32rpx;
}

.ccb-coach-name {
	font-size: 40rpx;
	font-weight: bold;
	color: #FFFFFF;
	margin-bottom: 8rpx;
}

.ccb-coach-ename {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.7);
	margin-bottom: 24rpx;
}

.ccb-coach-intro {
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.85);
	text-align: center;
	line-height: 42rpx;
	margin-bottom: 24rpx;
	padding-left: 16rpx;
	padding-right: 16rpx;
}

.ccb-tags-row {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: center;
	margin-bottom: 28rpx;
}

.ccb-tag {
	padding-top: 8rpx;
	padding-bottom: 8rpx;
	padding-left: 20rpx;
	padding-right: 20rpx;
	border-top-left-radius: 20rpx;
	border-top-right-radius: 20rpx;
	border-bottom-left-radius: 20rpx;
	border-bottom-right-radius: 20rpx;
	background-color: rgba(59, 130, 246, 0.3);
	border-width: 1rpx;
	border-style: solid;
	border-color: rgba(59, 130, 246, 0.5);
	margin-left: 6rpx;
	margin-right: 6rpx;
	margin-bottom: 12rpx;
}

.ccb-tag-text {
	font-size: 22rpx;
	color: #60A5FA;
	font-weight: bold;
}

.ccb-select-btn {
	width: 480rpx;
	height: 88rpx;
	background-color: #00C853;
	border-top-left-radius: 44rpx;
	border-top-right-radius: 44rpx;
	border-bottom-left-radius: 44rpx;
	border-bottom-right-radius: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.ccb-select-text {
	font-size: 32rpx;
	font-weight: bold;
	color: #FFFFFF;
}
</style>
