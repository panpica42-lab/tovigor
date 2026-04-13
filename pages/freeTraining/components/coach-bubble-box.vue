<!--
 * AI教练气泡对话框（nvue 自治业务组件）
 *
 * 功能：
 *   1. 展示教练气泡（名字胶囊 + 头像 + 对话文字）
 *   2. 点击胶囊区域弹出教练选择弹窗（内建，不依赖外部弹窗组件）
 *   3. 教练数据通过 coachManager.js 自动读取和持久化
 *
 * 对外 API：
 *   Props:
 *     text        - 气泡文字内容（必传，由页面控制提示语）
 *   Events:
 *     coach-changed(coachData)  - 教练切换后通知页面（可选监听）
 *
 * nvue 兼容说明：
 *   - Options API（不用 <script setup>）
 *   - 无 scoped / scss
 *   - 无 linear-gradient / box-shadow / transition / :active
 *   - padding / border-radius 全部拆写
 *   - image 宽高用内联 style
 -->
<template>
	<view class="cb-root">

		<!-- ===== 气泡区域 ===== -->
		<view class="cb-bubble">
			<!-- 上方胶囊：教练名字 + 头像，点击打开弹窗 -->
			<view
				class="cb-header"
				:style="{ backgroundColor: currentBadgeColor }"
				@click="openModal"
			>
				<text class="cb-header-role">{{ currentCoach.fullName }}</text>
				<image
					:src="currentCoach.avatar"
					:style="{ width: '66rpx', height: '66rpx' }"
				></image>
			</view>

			<!-- 下方对话气泡 -->
			<view class="cb-content">
				<text class="cb-content-text">{{ text }}</text>
			</view>
		</view>

		<!-- ===== 教练选择弹窗（内建） ===== -->
		<view v-if="modalVisible" class="cb-modal-mask" @click="closeModal">
			<view class="cb-modal-card" @click.stop="">

				<!-- 关闭按钮 -->
				<text class="cb-modal-close" @click="closeModal">✕</text>

				<!-- 标题 -->
				<text class="cb-modal-title">AI教练</text>

				<!-- 切换按钮 -->
				<view class="cb-switch-row">
					<view
						v-for="coach in allCoaches"
						:key="coach.value"
						class="cb-switch-btn"
						:style="coach.value === previewValue
							? { backgroundColor: '#00C853', borderColor: '#00C853' }
							: { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)' }"
						@click="previewCoach(coach.value)"
					>
						<text class="cb-switch-text">{{ coach.fullName }}</text>
					</view>
				</view>

				<!-- 预览头像 -->
				<view class="cb-avatar-wrap">
					<image
						:src="previewCoachData.avatar"
						:style="{ width: '200rpx', height: '200rpx', borderRadius: '100rpx' }"
					></image>
				</view>

				<!-- 教练信息 -->
				<text class="cb-coach-name">{{ previewCoachData.label }}</text>
				<text class="cb-coach-ename">{{ previewCoachData.englishName }}</text>
				<text class="cb-coach-intro">{{ previewCoachData.intro }}</text>

				<!-- 特长标签 -->
				<view class="cb-tags-row">
					<view
						v-for="(tag, i) in previewCoachData.tags"
						:key="i"
						class="cb-tag"
					>
						<text class="cb-tag-text">{{ tag }}</text>
					</view>
				</view>

				<!-- 选择按钮 -->
				<view class="cb-select-btn" @click="confirmSelect">
					<text class="cb-select-text">选择{{ previewCoachData.label }}</text>
				</view>
			</view>
		</view>

	</view>
</template>

<script>
import { getSelectedCoach, setSelectedCoach, getAllCoaches, getCoachByValue } from '@/utils/coachManager.js'

export default {
	props: {
		// 气泡文字（页面传入，组件不关心内容来源）
		text: {
			type: String,
			default: ''
		}
	},

	data() {
		const coach = getSelectedCoach()
		const coachesObj = getAllCoaches()
		return {
			currentCoach: coach,
			allCoaches: Object.values(coachesObj),
			modalVisible: false,
			previewValue: coach.value
		}
	},

	computed: {
		// nvue 不支持 linear-gradient，从渐变里提取第一个色值降级为纯色
		currentBadgeColor() {
			const bg = this.currentCoach.badgeBackground || ''
			const match = bg.match(/#[0-9A-Fa-f]{6}/)
			return match ? match[0] : '#667eea'
		},

		previewCoachData() {
			return getCoachByValue(this.previewValue) || this.currentCoach
		}
	},

	methods: {
		openModal() {
			this.previewValue = this.currentCoach.value
			this.modalVisible = true
		},

		closeModal() {
			this.modalVisible = false
		},

		previewCoach(val) {
			this.previewValue = val
		},

		confirmSelect() {
			setSelectedCoach(this.previewValue)
			this.currentCoach = getCoachByValue(this.previewValue)
			this.$emit('coach-changed', this.currentCoach)
			this.modalVisible = false
		}
	}
}
</script>

<style>
/* ==================== 气泡区域 ==================== */
.cb-root {
	flex-direction: column;
}

.cb-bubble {
	flex-direction: column;
	align-items: flex-start;
}

.cb-header {
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

.cb-header-role {
	font-size: 24rpx;
	font-weight: bold;
	color: #FFFFFF;
	margin-right: 12rpx;
}

.cb-content {
	background-color: rgba(255, 255, 255, 0.85);
	padding-top: 16rpx;
	padding-bottom: 16rpx;
	padding-left: 20rpx;
	padding-right: 20rpx;
	border-top-left-radius: 24rpx;
	border-top-right-radius: 24rpx;
	border-bottom-left-radius: 24rpx;
	border-bottom-right-radius: 24rpx;
}

.cb-content-text {
	font-size: 26rpx;
	color: #333333;
	line-height: 40rpx;
}

/* ==================== 弹窗遮罩 ==================== */
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

/* ==================== 弹窗卡片 ==================== */
.cb-modal-card {
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
	flex-direction: column;
	align-items: center;
}

/* 关闭按钮 */
.cb-modal-close {
	position: absolute;
	top: 20rpx;
	left: 20rpx;
	font-size: 32rpx;
	color: rgba(255, 255, 255, 0.7);
}

/* 标题 */
.cb-modal-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #FFFFFF;
	margin-bottom: 24rpx;
}

/* ==================== 切换按钮行 ==================== */
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
	color: #FFFFFF;
}

/* ==================== 头像 ==================== */
.cb-avatar-wrap {
	align-items: center;
	justify-content: center;
	margin-bottom: 32rpx;
}

/* ==================== 教练信息 ==================== */
.cb-coach-name {
	font-size: 40rpx;
	font-weight: bold;
	color: #FFFFFF;
	margin-bottom: 8rpx;
}

.cb-coach-ename {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.7);
	margin-bottom: 24rpx;
}

.cb-coach-intro {
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.85);
	text-align: center;
	line-height: 42rpx;
	margin-bottom: 24rpx;
	padding-left: 16rpx;
	padding-right: 16rpx;
}

/* ==================== 特长标签 ==================== */
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
	background-color: rgba(59, 130, 246, 0.3);
	border-width: 1rpx;
	border-style: solid;
	border-color: rgba(59, 130, 246, 0.5);
	margin-left: 6rpx;
	margin-right: 6rpx;
	margin-bottom: 12rpx;
}

.cb-tag-text {
	font-size: 22rpx;
	color: #60A5FA;
	font-weight: bold;
}

/* ==================== 选择按钮 ==================== */
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
