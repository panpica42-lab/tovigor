<!--
 * 训练筛选侧边栏组件
 * 功能：左侧垂直筛选栏，包含 AI 推荐头像和多个筛选项
 * 使用场景：部位训练、动作库等需要筛选功能的页面
 -->
<template>
	<view class="sidebar">
		<!-- 顶部 AI 推荐头像块 -->
		<view class="ai-header">
			<view class="ai-recommend-btn" @click="goToAIRecommend">
				<image
					class="ai-avatar"
					src="/static/icons/partTrainingActivity/AI_coach_Vince.png"
					mode="aspectFit"
				/>
				<text class="ai-text">AI推荐</text>
			</view>
		</view>

		<!-- 筛选项列表（不需要滚动，内容不会超出屏幕） -->
		<view class="filter-list">

			<!-- 筛选 - 不可点击的标题 -->
			<view class="filter-title">
				<text class="filter-title-text">筛选</text>
			</view>

			<!-- 性别 -->
			<filter-pill
				label="性别"
				:active="expanded.gender"
				:showArrow="true"
				@click="toggleSection('gender')"
			/>
			<view v-if="expanded.gender" class="filter-options">
				<view
					v-for="option in genderOptions"
					:key="option.value"
					class="option-chip"
					:class="{ 'option-chip--active': isOptionActive('gender', option.value) }"
					@click="onOptionClick('gender', option)"
				>
					<text class="option-text">{{ option.label }}</text>
				</view>
			</view>

			<!-- 目的 -->
			<filter-pill
				label="目的"
				:active="expanded.goal"
				:showArrow="true"
				@click="toggleSection('goal')"
			/>
			<view v-if="expanded.goal" class="filter-options">
				<view
					v-for="option in goalOptions"
					:key="option.value"
					class="option-chip"
					:class="{ 'option-chip--active': isOptionActive('goal', option.value) }"
					@click="onOptionClick('goal', option)"
				>
					<text class="option-text">{{ option.label }}</text>
				</view>
			</view>

			<!-- 难度 -->
			<filter-pill
				label="难度"
				:active="expanded.level"
				:showArrow="true"
				@click="toggleSection('level')"
			/>
			<view v-if="expanded.level" class="filter-options">
				<view
					v-for="option in levelOptions"
					:key="option.value"
					class="option-chip"
					:class="{ 'option-chip--active': isOptionActive('level', option.value) }"
					@click="onOptionClick('level', option)"
				>
					<text class="option-text">{{ option.label }}</text>
				</view>
			</view>

			<!-- 部位 -->
			<filter-pill
				label="部位"
				:active="expanded.part"
				:showArrow="true"
				@click="toggleSection('part')"
			/>
			<view v-if="expanded.part" class="filter-options">
				<view
					v-for="option in partOptions"
					:key="option.value"
					class="option-chip"
					:class="{ 'option-chip--active': isOptionActive('part', option.value) }"
					@click="onOptionClick('part', option)"
				>
					<text class="option-text">{{ option.label }}</text>
				</view>
			</view>

			<!-- 训练方式 -->
			<filter-pill
				label="训练方式"
				:active="expanded.method"
				:showArrow="true"
				@click="toggleSection('method')"
			/>
			<view v-if="expanded.method" class="filter-options">
				<view
					v-for="option in methodOptions"
					:key="option.value"
					class="option-chip"
					:class="{ 'option-chip--active': isOptionActive('method', option.value) }"
					@click="onOptionClick('method', option)"
				>
					<text class="option-text">{{ option.label }}</text>
				</view>
			</view>

			<!-- 时长 -->
			<filter-pill
				label="时长"
				:active="expanded.duration"
				:showArrow="true"
				@click="toggleSection('duration')"
			/>
			<view v-if="expanded.duration" class="filter-options">
				<view
					v-for="option in durationOptions"
					:key="option.value"
					class="option-chip"
					:class="{ 'option-chip--active': isOptionActive('duration', option.value) }"
					@click="onOptionClick('duration', option)"
				>
					<text class="option-text">{{ option.label }}</text>
				</view>
			</view>

			<!-- 配件 -->
			<filter-pill
				label="配件"
				:active="expanded.equipment"
				:showArrow="true"
				@click="toggleSection('equipment')"
			/>
			<view v-if="expanded.equipment" class="filter-options">
				<view
					v-for="option in equipmentOptions"
					:key="option.value"
					class="option-chip"
					:class="{ 'option-chip--active': isOptionActive('equipment', option.value) }"
					@click="onOptionClick('equipment', option)"
				>
					<text class="option-text">{{ option.label }}</text>
				</view>
			</view>

			<!-- AI教练 -->
			<filter-pill
				label="AI教练"
				:active="expanded.coach"
				:showArrow="true"
				@click="toggleSection('coach')"
			/>
			<view v-if="expanded.coach" class="coach-options">
				<view
					v-for="coach in coachOptions"
					:key="coach.value"
					class="coach-card"
					:class="{ 'coach-card--active': isOptionActive('coach', coach.value) }"
					@click="onOptionClick('coach', coach)"
				>
					<image class="coach-avatar" :src="coach.avatar" mode="aspectFit" />
					<text class="coach-name">{{ coach.label }}</text>
				</view>
			</view>

		</view>
		
		<!-- AI教练详情弹窗 -->
		<CoachDetailModal
			v-model:show="showCoachModal"
			:coachData="currentCoachData"
			@select="handleCoachSelect"
		/>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import FilterPill from '@/components/ui-box/filter-pill.vue'
import CoachDetailModal from '@/components/modals/coach-detail-modal.vue'
import { getCoachByValue, getSelectedCoach, setSelectedCoach } from '@/utils/coachManager.js'

// Props
const props = defineProps({
	// 由父组件传入当前筛选状态
	filters: {
		type: Object,
		default: () => ({
			gender: [],
			goal: [],
			level: [],
			part: [],
			method: [],
			duration: [],
			equipment: [],
			coach: []
		})
	}
})

// Emits - 简化为只需要 changeFilter 事件
const emits = defineEmits(['changeFilter'])

// 教练详情弹窗状态
const showCoachModal = ref(false)
const currentCoachData = ref(null)

// 展开状态
const expanded = ref({
	gender: false,
	goal: false,
	level: false,
	part: false,
	method: false,
	duration: false,
	equipment: false,
	coach: true
})

// 选项数据定义
const genderOptions = [
	{ value: 'all', label: '全部' },
	{ value: 'female', label: '女性' },
	{ value: 'male', label: '男性' }
]

const goalOptions = [
	{ value: 'fat-loss', label: '减脂塑形' },
	{ value: 'muscle', label: '增肌增力' },
	{ value: 'health', label: '全面健康' },
	{ value: 'wellness', label: '健康养生' },
	{ value: 'youth', label: '适能训练' }
]

const levelOptions = [
	{ value: 'beginner', label: '初级' },
	{ value: 'intermediate', label: '中级' },
	{ value: 'advanced', label: '高级' }
]

const partOptions = [
	{ value: 'shoulder', label: '肩部' },
	{ value: 'chest', label: '胸部' },
	{ value: 'back', label: '背部' },
	{ value: 'arm', label: '手臂' },
	{ value: 'core', label: '腹部' },
	{ value: 'leg', label: '臀腿' },
	{ value: 'full-body', label: '全身' }
]

const methodOptions = [
	{ value: 'resistance', label: '有力臂' },
	{ value: 'no-resistance', label: '无力臂' }
]

const durationOptions = [
	{ value: '0-15', label: '<15分' },
	{ value: '15-25', label: '15-25分' },
	{ value: '25-40', label: '25-40分' },
	{ value: '40+', label: '>40分' }
]

const equipmentOptions = [
	{ value: 'dumbbell', label: '哑铃' },
	{ value: 'barbell', label: '杠铃' },
	{ value: 'kettlebell', label: '壶铃' },
	{ value: 'resistance-band', label: '弹力带' },
	{ value: 'foam-roller', label: '泡沫轴' },
	{ value: 'yoga-mat', label: '瑜伽垫' },
	{ value: 'pull-up-bar', label: '单杠' },
	{ value: 'rope', label: '绳索' }
]

const coachOptions = [
	{
		value: 'vince',
		label: 'Vince\n艾斯',
		avatar: '/static/icons/partTrainingActivity/AI_coach_Vince.png'
	},
	{
		value: 'vera',
		label: 'Vela\n维拉',
		avatar: '/static/icons/partTrainingActivity/AI_coach_Vera.png'
	}
]

// 切换展开/收起
const toggleSection = (key) => {
	expanded.value[key] = !expanded.value[key]
}

// 选项点击
const onOptionClick = (groupKey, option) => {
	// 如果是教练选项，弹出详情弹窗而非直接选中
	if (groupKey === 'coach') {
		openCoachDetail(option)
		return
	}
	
	const currentValues = props.filters[groupKey] || []
	let newValues = []
	
	if (currentValues.includes(option.value)) {
		// 取消选中
		newValues = currentValues.filter(v => v !== option.value)
	} else {
		// 添加选中
		newValues = [...currentValues, option.value]
	}
	
	emits('changeFilter', {
		key: groupKey,
		values: newValues,
		option: option
	})
}

// 判断选项是否选中
const isOptionActive = (groupKey, optionValue) => {
	return (props.filters[groupKey] || []).includes(optionValue)
}

// 获取当前选中的标签文本
const getSelectedLabels = (groupKey, options) => {
	const selected = props.filters[groupKey] || []
	if (selected.length === 0) return ''
	
	const labels = options
		.filter(opt => selected.includes(opt.value))
		.map(opt => opt.label)
	
	return labels.join('、')
}

// 跳转到AI推荐页面
const goToAIRecommend = () => {
	uni.navigateTo({
		url: '/pages/partTraining/components/ai-recommend'
	})
}

// ========== AI教练详情弹窗相关方法 ==========
// 打开教练详情弹窗
const openCoachDetail = (coachOption) => {
	// 获取完整的教练信息
	const fullCoachData = getCoachByValue(coachOption.value)
	if (fullCoachData) {
		currentCoachData.value = fullCoachData
		showCoachModal.value = true
	}
}

// 处理教练选择
const handleCoachSelect = (coachData) => {
	// 保存到本地存储
	setSelectedCoach(coachData.value)
	
	// 更新筛选状态（单选，替换为当前选中的教练）
	emits('changeFilter', {
		key: 'coach',
		values: [coachData.value],
		option: {
			value: coachData.value,
			label: coachData.fullName,
			avatar: coachData.avatar
		}
	})
	
	// 显示成功提示
	uni.showToast({
		title: `已选择${coachData.label}`,
		icon: 'success',
		duration: 1500
	})
}

// 页面加载时，从本地存储恢复已选教练
onMounted(() => {
	const selectedCoach = getSelectedCoach()
	if (selectedCoach) {
		// 如果有已选教练，同步到筛选状态
		emits('changeFilter', {
			key: 'coach',
			values: [selectedCoach.value],
			option: {
				value: selectedCoach.value,
				label: selectedCoach.fullName,
				avatar: selectedCoach.avatar
			}
		})
	}
})
</script>

<style scoped lang="scss">
.sidebar {
	width: 160rpx;
	padding: 8rpx 8rpx 12rpx;
	border-radius: 16rpx;
	background-color: rgba(243, 244, 246, 0.95);
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
}

/* ========== 顶部 AI 推荐块 ========== */
.ai-header {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 8rpx;
	flex-shrink: 0;
}

.ai-recommend-btn {
	width: 100%;
	height: 56rpx;
	border-radius: 28rpx;
	background: rgba(101, 177, 254, 1);
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	gap: 6rpx;
	position: relative;
	padding: 0 8rpx;
}

.ai-avatar {
	width: 40rpx;
	height: 40rpx;
	flex-shrink: 0;
}

.ai-text {
	font-size: 18rpx;
	font-weight: bold;
	color: #000000;
	letter-spacing: 1rpx;
}

/* ========== 筛选列表 ========== */
.filter-list {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

/* 筛选标题 */
.filter-title {
	height: 36rpx;
	padding: 0 10rpx;
	border-radius: 10rpx;
	background: rgba(200, 200, 200, 0.3);
	display: flex;
	align-items: center;
	justify-content: flex-start;
}

.filter-title-text {
	font-size: 18rpx;
	color: #666666;
	font-weight: 600;
}

/* ========== 展开选项区域 ========== */
.filter-options {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 4rpx;
	padding: 2rpx 0;
}

.option-chip {
	height: 28rpx;
	padding: 0 6rpx;
	border-radius: 14rpx;
	background: rgba(255, 255, 255, 0.8);
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
	border: 1rpx solid rgba(200, 200, 200, 0.5);
}

.option-chip--active {
	background: #00C853;
	border-color: #00C853;
}

.option-text {
	font-size: 14rpx;
	color: #333333;
	white-space: nowrap;
}

.option-chip--active .option-text {
	color: #FFFFFF;
	font-weight: 600;
}

/* ========== AI 教练卡片 ========== */
.coach-options {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
	padding: 2rpx 0;
}

.coach-card {
	height: 44rpx;
	padding: 4rpx 6rpx;
	border-radius: 10rpx;
	background: #1E3A8A;
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 4rpx;
	transition: all 0.2s ease;
	border: 2rpx solid transparent;
}

.coach-card--active {
	border-color: #00C853;
	box-shadow: 0 2rpx 8rpx rgba(0, 200, 83, 0.3);
}

.coach-avatar {
	width: 32rpx;
	height: 32rpx;
	flex-shrink: 0;
}

.coach-name {
	flex: 1;
	font-size: 16rpx;
	color: #FFFFFF;
	font-weight: 600;
	line-height: 1.1;
	white-space: pre-line;
}
</style>
