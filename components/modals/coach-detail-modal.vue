<!--
 * AI教练详情弹窗组件
 * 功能：展示教练的详细信息，包括头像、姓名、简介、特长等
 * 使用场景：在筛选栏点击教练卡片时弹出，或在训练页点击气泡切换教练
 -->
<template>
	<view v-if="show" class="modal-mask" @click.self="handleMaskClick">
		<view class="modal-container">
			<!-- 关闭按钮 -->
			<image 
				class="close-btn" 
				src="/static/icons/general/btn_general_close.svg" 
				mode="aspectFit"
				@click="handleClose"
			/>
			
			<!-- 标题（可切换模式下显示） -->
			<text v-if="switchable" class="modal-title">AI教练</text>
			
			<!-- 切换按钮区域 -->
			<view v-if="switchable" class="switch-buttons">
				<view 
					v-for="coach in allCoaches" 
					:key="coach.value"
					class="switch-btn"
					:class="{ 'switch-btn-active': currentCoachValue === coach.value }"
					@click="switchCoach(coach.value)"
				>
					<text class="switch-btn-text">{{ coach.fullName }}</text>
				</view>
			</view>
			
			<!-- 教练头像 -->
			<view class="coach-avatar-section">
				<image 
					class="coach-avatar-large" 
					:src="displayCoach.avatar" 
					mode="aspectFit"
				/>
			</view>
			
			<!-- 教练信息 -->
			<view class="coach-info-section">
				<!-- 教练姓名 -->
				<text class="coach-name">{{ displayCoach.label }}</text>
				
				<!-- 教练英文名 -->
				<text class="coach-english-name">{{ displayCoach.englishName }}</text>
				
				<!-- 教练简介 -->
				<text class="coach-intro">{{ displayCoach.intro }}</text>
				
				<!-- 教练特长标签 -->
				<view class="coach-tags">
					<view 
						v-for="(tag, index) in displayCoach.tags" 
						:key="index"
						class="tag-chip"
					>
						<text class="tag-text">{{ tag }}</text>
					</view>
				</view>
			</view>
			
			<!-- 选择按钮 -->
			<view class="select-btn" @click="handleSelect">
				<text class="select-btn-text">选择{{ displayCoach.label }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getAllCoaches, getCoachByValue } from '@/utils/coachManager.js'

// Props
const props = defineProps({
	// 是否显示弹窗
	show: {
		type: Boolean,
		default: false
	},
	// 教练数据（外部传入，用于非切换模式）
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
	// 是否可切换教练（训练页使用时为 true）
	switchable: {
		type: Boolean,
		default: false
	}
})

// Emits
const emits = defineEmits(['update:show', 'select'])

// 获取所有教练
const coachesObj = getAllCoaches()
const allCoaches = computed(() => Object.values(coachesObj))

// 当前选中的教练 value（用于切换模式）
const currentCoachValue = ref('')

// 显示的教练数据
const displayCoach = computed(() => {
	if (props.switchable && currentCoachValue.value) {
		return getCoachByValue(currentCoachValue.value) || props.coachData
	}
	return props.coachData
})

// 监听弹窗显示，初始化当前教练
watch(() => props.show, (newVal) => {
	if (newVal && props.switchable) {
		currentCoachValue.value = props.coachData.value || 'vince'
	}
})

// 切换教练
const switchCoach = (coachValue) => {
	currentCoachValue.value = coachValue
}

// 关闭弹窗
const handleClose = () => {
	emits('update:show', false)
}

// 点击遮罩关闭
const handleMaskClick = () => {
	handleClose()
}

// 选择教练
const handleSelect = () => {
	emits('select', displayCoach.value)
	handleClose()
}
</script>

<style scoped lang="scss">
/* ========== 遮罩层 ========== */
.modal-mask {
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

/* ========== 弹窗容器 ========== */
.modal-container {
	width: 560rpx;
	background: linear-gradient(180deg, #1E3A8A 0%, #0F172A 100%);
	border-radius: 32rpx;
	padding: 48rpx 32rpx 32rpx;
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
}

/* ========== 关闭按钮 ========== */
.close-btn {
	position: absolute;
	top: 16rpx;
	left: 16rpx;
	width: 32rpx;
	height: 32rpx;
	z-index: 10;
	
	&:active {
		opacity: 0.7;
	}
}

/* ========== 标题 ========== */
.modal-title {
	font-size: 36rpx;
	font-weight: 700;
	color: #FFFFFF;
	margin-bottom: 24rpx;
}

/* ========== 切换按钮区域 ========== */
.switch-buttons {
	display: flex;
	flex-direction: row;
	gap: 24rpx;
	margin-bottom: 24rpx;
}

.switch-btn {
	padding: 12rpx 32rpx;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.1);
	border: 2rpx solid rgba(255, 255, 255, 0.3);
}

.switch-btn-active {
	background: linear-gradient(135deg, #00C853 0%, #00E676 100%);
	border-color: transparent;
}

.switch-btn-text {
	font-size: 24rpx;
	font-weight: 500;
	color: #FFFFFF;
}

.switch-btn:active {
	opacity: 0.8;
}

/* ========== 教练头像区域 ========== */
.coach-avatar-section {
	width: 100%;
	display: flex;
	justify-content: center;
	margin-bottom: 32rpx;
}

.coach-avatar-large {
	width: 200rpx;
	height: 200rpx;
	border-radius: 50%;
	border: 4rpx solid rgba(255, 255, 255, 0.3);
	background-color: rgba(255, 255, 255, 0.1);
}

/* ========== 教练信息区域 ========== */
.coach-info-section {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 32rpx;
}

.coach-name {
	font-size: 40rpx;
	font-weight: 700;
	color: #FFFFFF;
	margin-bottom: 8rpx;
}

.coach-english-name {
	font-size: 24rpx;
	font-weight: 500;
	color: rgba(255, 255, 255, 0.7);
	margin-bottom: 24rpx;
}

.coach-intro {
	font-size: 26rpx;
	line-height: 1.6;
	color: rgba(255, 255, 255, 0.85);
	text-align: center;
	margin-bottom: 24rpx;
	padding: 0 16rpx;
}

/* ========== 特长标签 ========== */
.coach-tags {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 12rpx;
}

.tag-chip {
	padding: 8rpx 20rpx;
	border-radius: 20rpx;
	background: rgba(59, 130, 246, 0.3);
	border: 1rpx solid rgba(59, 130, 246, 0.5);
}

.tag-text {
	font-size: 22rpx;
	color: #60A5FA;
	font-weight: 500;
}

/* ========== 选择按钮 ========== */
.select-btn {
	width: 100%;
	height: 88rpx;
	background: linear-gradient(135deg, #00C853 0%, #00E676 100%);
	border-radius: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(0, 200, 83, 0.4);
	transition: all 0.2s ease;
	
	&:active {
		opacity: 0.8;
		transform: scale(0.98);
	}
}

.select-btn-text {
	font-size: 32rpx;
	font-weight: 700;
	color: #FFFFFF;
	letter-spacing: 2rpx;
}
</style>
