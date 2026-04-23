<template>
	<view class="sidebar">
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

		<view class="filter-list">
			<view
				class="filter-title"
				:class="{
					'filter-title--applied': hasAppliedFilters && !hasPendingChanges,
					'filter-title--pending': hasPendingChanges
				}"
				hover-class="filter-title--pressed"
				@click="handleApplyFilters"
			>
				<text
					class="filter-title-text"
					:class="{
						'filter-title-text--applied': hasAppliedFilters && !hasPendingChanges,
						'filter-title-text--pending': hasPendingChanges
					}"
				>
					{{ hasPendingChanges ? '应用筛选' : '筛选' }}
				</text>
				<view
					v-if="filterCount > 0"
					class="filter-count-badge"
					:class="{
						'filter-count-badge--applied': hasAppliedFilters && !hasPendingChanges,
						'filter-count-badge--pending': hasPendingChanges
					}"
				>
					<text
						class="filter-count-text"
						:class="{
							'filter-count-text--pending': hasPendingChanges
						}"
					>
						{{ filterCount }}
					</text>
				</view>
			</view>

			<view class="library-switch">
				<view class="library-switch-btn" @click="handleGoCourseLibrary">
					<text class="library-switch-text">课程库</text>
				</view>
				<view class="library-switch-btn library-switch-btn--active">
					<text class="library-switch-text library-switch-text--active">动作库</text>
				</view>
			</view>

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

			<filter-pill
				label="方式选择"
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
					:class="[
						`coach-card--${coach.value}`,
						{ 'coach-card--active': isOptionActive('coach', coach.value) }
					]"
					@click="onOptionClick('coach', coach)"
				>
					<image class="coach-avatar" :src="coach.avatar" mode="aspectFit" />
					<text class="coach-name">{{ coach.label }}</text>
				</view>
			</view>
		</view>

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

const props = defineProps({
	filters: {
		type: Object,
		default: () => ({
			part: [],
			method: [],
			equipment: [],
			coach: []
		})
	},
	hasPendingChanges: {
		type: Boolean,
		default: false
	},
	hasAppliedFilters: {
		type: Boolean,
		default: false
	},
	filterCount: {
		type: Number,
		default: 0
	}
})

const emits = defineEmits(['changeFilter', 'applyFilters', 'goCourseLibrary'])

const showCoachModal = ref(false)
const currentCoachData = ref(null)

const expanded = ref({
	part: true,
	method: true,
	equipment: true,
	coach: true
})

const partOptions = [
	{ value: 'chest', label: '胸部' },
	{ value: 'shoulder', label: '肩部' },
	{ value: 'arm', label: '手臂' },
	{ value: 'core', label: '腰腹' },
	{ value: 'back', label: '背部' },
	{ value: 'full-body', label: '全身' },
	{ value: 'biceps', label: '肱二头肌' },
	{ value: 'triceps', label: '肱三头肌' }
]

const methodOptions = [
	{ value: 'resistance', label: '有力臂' },
	{ value: 'no-resistance', label: '无力臂' }
]

const equipmentOptions = [
	{ value: 'double-handle', label: '双肩把手' },
	{ value: 'ankle-strap', label: '脚环' },
	{ value: 'triangle-handle', label: '三角把手' },
	{ value: 'short-bar', label: '中杆' },
	{ value: 'lat-bar', label: '横杆' },
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

const toggleSection = (key) => {
	expanded.value[key] = !expanded.value[key]
}

const onOptionClick = (groupKey, option) => {
	if (groupKey === 'coach') {
		openCoachDetail(option)
		return
	}

	const currentValues = props.filters[groupKey] || []
	let newValues = []

	if (currentValues.includes(option.value)) {
		newValues = currentValues.filter(v => v !== option.value)
	} else {
		newValues = [...currentValues, option.value]
	}

	emits('changeFilter', {
		key: groupKey,
		values: newValues,
		option
	})
}

const isOptionActive = (groupKey, optionValue) => {
	return (props.filters[groupKey] || []).includes(optionValue)
}

const goToAIRecommend = () => {
	uni.navigateTo({
		url: '/pages/partTraining/components/ai-recommend'
	})
}

const handleGoCourseLibrary = () => {
	emits('goCourseLibrary')
}

const handleApplyFilters = () => {
	emits('applyFilters')
}

const openCoachDetail = (coachOption) => {
	const fullCoachData = getCoachByValue(coachOption.value)
	if (fullCoachData) {
		currentCoachData.value = fullCoachData
		showCoachModal.value = true
	}
}

const handleCoachSelect = (coachData) => {
	setSelectedCoach(coachData.value)

	emits('changeFilter', {
		key: 'coach',
		values: [coachData.value],
		option: {
			value: coachData.value,
			label: coachData.fullName,
			avatar: coachData.avatar
		}
	})

	uni.showToast({
		title: `已选择${coachData.label}`,
		icon: 'success',
		duration: 1500
	})
}

onMounted(() => {
	const selectedCoach = getSelectedCoach()
	if (selectedCoach) {
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

.filter-list {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.filter-title {
	height: 42rpx;
	padding: 0 10rpx;
	border-radius: 10rpx;
	background: rgba(200, 200, 200, 0.3);
	display: flex;
	align-items: center;
	justify-content: space-between;
	border: 1rpx solid transparent;
	transition: all 0.2s ease;
}

.filter-title--applied {
	background: rgba(183, 239, 74, 0.18);
	border-color: rgba(128, 183, 27, 0.28);
}

.filter-title--pending {
	background: #B7EF4A;
	border-color: #B7EF4A;
	box-shadow: 0 6rpx 16rpx rgba(183, 239, 74, 0.32);
}

.filter-title--pressed {
	opacity: 0.9;
}

.filter-title-text {
	font-size: 18rpx;
	color: #666666;
	font-weight: 600;
}

.filter-title-text--applied {
	color: #6F8F17;
}

.filter-title-text--pending {
	color: #FFFFFF;
}

.filter-count-badge {
	min-width: 28rpx;
	height: 28rpx;
	padding: 0 8rpx;
	border-radius: 14rpx;
	background: rgba(255, 255, 255, 0.82);
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
}

.filter-count-badge--applied {
	background: rgba(128, 183, 27, 0.16);
}

.filter-count-badge--pending {
	background: rgba(255, 255, 255, 0.22);
}

.filter-count-text {
	font-size: 16rpx;
	line-height: 1;
	font-weight: 700;
	color: #6F8F17;
}

.filter-count-text--pending {
	color: #FFFFFF;
}

.library-switch {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4rpx;
	padding: 2rpx 0;
}

.library-switch-btn {
	width: 132rpx;
	height: 34rpx;
	border-radius: 10rpx;
	background: rgba(255, 255, 255, 0.85);
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1rpx solid rgba(200, 200, 200, 0.5);
}

.library-switch-btn--active {
	background: #B7EF4A;
	border-color: #B7EF4A;
}

.library-switch-text {
	font-size: 16rpx;
	color: #999999;
	font-weight: 600;
}

.library-switch-text--active {
	color: #FFFFFF;
}

.filter-options {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 4rpx;
	padding: 2rpx 0;
}

.option-chip {
	min-height: 28rpx;
	padding: 4rpx 6rpx;
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

.coach-options {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4rpx;
	padding: 2rpx 0;
	margin-top: auto;
}

.coach-card {
	width: 132rpx;
	height: 44rpx;
	padding: 4rpx 6rpx;
	border-radius: 10rpx;
	background: rgba(255, 255, 255, 0.92);
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 4rpx;
	transition: all 0.2s ease;
	border: 2rpx solid transparent;
	box-sizing: border-box;
}

.coach-card--vince {
	background: rgba(101, 177, 254, 1);
}

.coach-card--vera {
	background: #FFC5DC;
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
	color: #1F2937;
	font-weight: 600;
	line-height: 1.1;
	white-space: pre-line;
}
</style>
