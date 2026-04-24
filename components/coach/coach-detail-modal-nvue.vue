<template>
	<view v-if="show" class="cb-modal-mask" @click="handleMaskClick">
		<view class="cb-modal-card" :style="themeCardStyle" @click.stop="">
			<text class="cb-modal-close" :style="themeCloseStyle" @click="handleClose">✕</text>
			<text class="cb-modal-title" :style="themeTitleStyle">AI教练</text>

			<view class="cb-switch-row">
				<view
					v-for="coach in allCoaches"
					:key="coach.value"
					class="cb-switch-btn"
					:style="coach.value === currentCoachValue
						? activeSwitchStyle
						: inactiveSwitchStyle"
					@click="switchCoach(coach.value)"
				>
					<text
						class="cb-switch-text"
						:style="coach.value === currentCoachValue ? activeSwitchTextStyle : inactiveSwitchTextStyle"
					>{{ coach.fullName }}</text>
				</view>
			</view>

			<view class="cb-avatar-wrap">
				<image
					:src="displayCoach.avatar"
					:style="{ width: '200rpx', height: '200rpx', borderRadius: '100rpx' }"
				></image>
			</view>

			<text class="cb-coach-name" :style="themeTitleStyle">{{ displayCoach.label }}</text>
			<text class="cb-coach-ename" :style="themeSubtitleStyle">{{ displayCoach.englishName }}</text>
			<text class="cb-coach-intro" :style="themeBodyStyle">{{ displayCoach.intro }}</text>

			<view class="cb-tags-row">
				<view
					v-for="(tag, index) in displayCoach.tags"
					:key="index"
					class="cb-tag"
					:style="themeTagStyle"
				>
					<text class="cb-tag-text" :style="themeTagTextStyle">{{ tag }}</text>
				</view>
			</view>

			<view class="cb-select-btn" @click="handleSelect">
				<text class="cb-select-text">选择{{ displayCoach.label }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import { getAllCoaches, getCoachByValue } from '@/utils/coachManager.js'

export default {
	props: {
		show: {
			type: Boolean,
			default: false
		},
		coachData: {
			type: Object,
			default() {
				return {
					value: '',
					label: '',
					englishName: '',
					avatar: '',
					intro: '',
					tags: []
				}
			}
		},
		switchable: {
			type: Boolean,
			default: false
		}
	},

	emits: ['update:show', 'select'],

	data() {
		return {
			allCoaches: Object.values(getAllCoaches()),
			currentCoachValue: '',
			activeSwitchStyle: {
				backgroundColor: '#00C853',
				borderColor: '#00C853'
			},
			inactiveSwitchStyle: {
				backgroundColor: 'rgba(255,255,255,0.42)',
				borderColor: 'rgba(36,59,83,0.14)'
			},
			activeSwitchTextStyle: {
				color: '#FFFFFF'
			},
			inactiveSwitchTextStyle: {
				color: '#36506B'
			}
		}
	},

	computed: {
		displayCoach() {
			if (this.currentCoachValue) {
				return getCoachByValue(this.currentCoachValue) || this.coachData
			}
			return this.coachData
		},

		isVeraTheme() {
			return this.displayCoach && this.displayCoach.value === 'vera'
		},

		themeCardStyle() {
			return {
				backgroundColor: this.isVeraTheme ? '#FFE1EC' : '#DDF0FF'
			}
		},

		themeTitleStyle() {
			return {
				color: '#243B53'
			}
		},

		themeSubtitleStyle() {
			return {
				color: 'rgba(36,59,83,0.72)'
			}
		},

		themeBodyStyle() {
			return {
				color: 'rgba(36,59,83,0.88)'
			}
		},

		themeCloseStyle() {
			return {
				color: 'rgba(36,59,83,0.68)'
			}
		},

		themeTagStyle() {
			return {
				backgroundColor: this.isVeraTheme ? 'rgba(255,255,255,0.56)' : 'rgba(255,255,255,0.58)',
				borderColor: this.isVeraTheme ? 'rgba(232,134,174,0.45)' : 'rgba(90,145,220,0.38)'
			}
		},

		themeTagTextStyle() {
			return {
				color: this.isVeraTheme ? '#C25787' : '#3D76C5'
			}
		}
	},

	watch: {
		show(newVal) {
			if (newVal) {
				this.syncCurrentCoachValue()
			}
		},

		'coachData.value'() {
			if (this.show) {
				this.syncCurrentCoachValue()
			}
		}
	},

	methods: {
		syncCurrentCoachValue() {
			this.currentCoachValue = (this.coachData && this.coachData.value) || 'vince'
		},

		switchCoach(coachValue) {
			this.currentCoachValue = coachValue
		},

		handleClose() {
			this.$emit('update:show', false)
		},

		handleMaskClick() {
			this.handleClose()
		},

		handleSelect() {
			this.$emit('select', this.displayCoach)
			this.handleClose()
		}
	}
}
</script>

<style>
.cb-modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.6);
	align-items: center;
	justify-content: center;
}

.cb-modal-card {
	width: 560rpx;
	border-top-left-radius: 32rpx;
	border-top-right-radius: 32rpx;
	border-bottom-left-radius: 32rpx;
	border-bottom-right-radius: 32rpx;
	padding-top: 48rpx;
	padding-bottom: 32rpx;
	padding-left: 32rpx;
	padding-right: 32rpx;
	flex-direction: column;
	align-items: center;
}

.cb-modal-close {
	position: absolute;
	top: 20rpx;
	left: 20rpx;
	font-size: 32rpx;
}

.cb-modal-title {
	font-size: 36rpx;
	font-weight: bold;
	margin-bottom: 24rpx;
}

.cb-switch-row {
	flex-direction: row;
	justify-content: center;
	margin-bottom: 24rpx;
}

.cb-switch-btn {
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

.cb-switch-text {
	font-size: 24rpx;
	font-weight: bold;
}

.cb-avatar-wrap {
	align-items: center;
	justify-content: center;
	margin-bottom: 32rpx;
}

.cb-coach-name {
	font-size: 40rpx;
	font-weight: bold;
	margin-bottom: 8rpx;
}

.cb-coach-ename {
	font-size: 24rpx;
	margin-bottom: 24rpx;
}

.cb-coach-intro {
	font-size: 26rpx;
	text-align: center;
	line-height: 42rpx;
	margin-bottom: 24rpx;
	padding-left: 16rpx;
	padding-right: 16rpx;
}

.cb-tags-row {
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: center;
	margin-bottom: 28rpx;
}

.cb-tag {
	padding-top: 8rpx;
	padding-bottom: 8rpx;
	padding-left: 20rpx;
	padding-right: 20rpx;
	border-top-left-radius: 20rpx;
	border-top-right-radius: 20rpx;
	border-bottom-left-radius: 20rpx;
	border-bottom-right-radius: 20rpx;
	border-width: 1rpx;
	border-style: solid;
	margin-left: 6rpx;
	margin-right: 6rpx;
	margin-bottom: 12rpx;
}

.cb-tag-text {
	font-size: 22rpx;
	font-weight: bold;
}

.cb-select-btn {
	width: 480rpx;
	height: 88rpx;
	background-color: #00C853;
	border-top-left-radius: 44rpx;
	border-top-right-radius: 44rpx;
	border-bottom-left-radius: 44rpx;
	border-bottom-right-radius: 44rpx;
	align-items: center;
	justify-content: center;
}

.cb-select-text {
	font-size: 32rpx;
	font-weight: bold;
	color: #FFFFFF;
}
</style>
