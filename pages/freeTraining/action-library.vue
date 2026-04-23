<template>
	<view class="container">
		<view class="nav-bar">
			<image
				class="back-btn"
				src="/static/icons/general/btn_general_back.svg"
				mode="aspectFit"
				@click="goBack"
			/>
			<text class="nav-title">动作库</text>
			<view
				class="done-btn"
				:class="{ 'done-btn--disabled': selectedCount === 0 }"
				@click="handleDone"
			>
				<text class="done-btn-text">添加完成</text>
				<view v-if="selectedCount > 0" class="badge">
					<text class="badge-text">{{ selectedCount }}</text>
				</view>
			</view>
		</view>

		<view class="main-content">
			<ActionLibrarySidebar
				:filters="filters"
				:hasPendingChanges="hasPendingFilterChanges"
				:hasAppliedFilters="hasAppliedActionFilters"
				:filterCount="filterButtonCount"
				@changeFilter="handleFilterChange"
				@applyFilters="handleApplyFilters"
				@goCourseLibrary="handleGoCourseLibrary"
			/>

			<scroll-view class="action-grid-scroll" scroll-y :show-scrollbar="false">
				<view class="action-grid">
					<view
						v-for="action in filteredActions"
						:key="action.id"
						class="action-card-wrapper"
					>
						<ActionCard
							:action="action"
							:selected="isSelected(action.id)"
							@click="toggleSelect(action.id)"
							@detail="handleDetail"
						/>
					</view>
				</view>
			</scroll-view>
		</view>

		<ActionDetailModal
			v-model:visible="showDetailModal"
			:action="currentDetailAction"
			:is-selected="currentDetailAction ? isSelected(currentDetailAction.id) : false"
			@select="handleSelectFromModal"
		/>

		<CustomToast ref="toastRef" />
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import ActionLibrarySidebar from '@/components/ui-box/ActionLibrarySidebar.vue'
import ActionCard from './components/action-card.vue'
import ActionDetailModal from './components/action-detail-modal.vue'
import CustomToast from '@/components/modals/custom-toast.vue'
import { navigateBackToRoute } from '@/utils/navigation.js'

/*
 * 动作默认模式预设。
 * key 给训练页映射到 serialService.FORCE_MODE，
 * label 给页面显示中文文案。
 */
const FORCE_MODE_PRESETS = {
	CONST: { key: 'CONST', label: '恒力' },
	CONC_ISO: { key: 'CONC_ISO', label: '向心等张' },
	ECC_ISO: { key: 'ECC_ISO', label: '离心等张' },
	FLUID: { key: 'FLUID', label: '流体阻力' },
	BALANCE: { key: 'BALANCE', label: '等速' },
	ELASTIC: { key: 'ELASTIC', label: '弹力' }
}

const createFilterState = () => ({
	part: [],
	method: [],
	equipment: [],
	coach: []
})

const ACTION_FILTER_KEYS = ['part', 'method', 'equipment']

const cloneFilters = (source) => ({
	part: [...(source.part || [])],
	method: [...(source.method || [])],
	equipment: [...(source.equipment || [])],
	coach: [...(source.coach || [])]
})

const filters = ref(createFilterState())
const appliedFilters = ref(createFilterState())

const handleFilterChange = (payload) => {
	const { key, values } = payload
	filters.value[key] = values
}

const handleApplyFilters = () => {
	appliedFilters.value = cloneFilters(filters.value)
}

const getFilterValues = (source, key) => source[key] || []

const getActionFilterCount = (source) => {
	return ACTION_FILTER_KEYS.reduce((count, key) => {
		return count + getFilterValues(source, key).length
	}, 0)
}

const areFilterValuesEqual = (leftValues, rightValues) => {
	if (leftValues.length !== rightValues.length) {
		return false
	}

	const sortedLeft = [...leftValues].sort()
	const sortedRight = [...rightValues].sort()
	return sortedLeft.every((value, index) => value === sortedRight[index])
}

const hasPendingFilterChanges = computed(() => {
	return ACTION_FILTER_KEYS.some((key) => {
		return !areFilterValuesEqual(
			getFilterValues(filters.value, key),
			getFilterValues(appliedFilters.value, key)
		)
	})
})

const hasAppliedActionFilters = computed(() => getActionFilterCount(appliedFilters.value) > 0)

const filterButtonCount = computed(() => {
	return hasPendingFilterChanges.value
		? getActionFilterCount(filters.value)
		: getActionFilterCount(appliedFilters.value)
})

const matchesAppliedFilter = (selectedValues, actionValue) => {
	if (!selectedValues || selectedValues.length === 0) {
		return true
	}

	if (actionValue === undefined || actionValue === null) {
		return true
	}

	const actionValues = Array.isArray(actionValue) ? actionValue : [actionValue]
	return selectedValues.some(value => actionValues.includes(value))
}

/*
 * 动作库基础数据。
 * 每个动作对象都直接带着完整配置：
 * part: 动作部位分类
 *   chest=胸部，shoulder=肩部，arm=手臂，core=腰腹，back=背部，leg=腿部
 * method: 动作方式分类
 *   resistance=有力臂，no-resistance=无力臂
 * equipment: 动作配件分类
 *   double-handle=双肩把手，ankle-strap=脚环，triangle-handle=三角把手，
 *   short-bar=中杆，lat-bar=横杆，rope=绳索
 * defaultMode: 默认 force mode
 * defaultResistance: 默认阻力值
 * recommendedSets / recommendedReps: 建议组数 / 次数
 */
const actionList = ref([
	{
		id: 1,
		name: '低位上拉',
		cover: '/static/icons/freeTrainingActivity/action-library/ic_action_01.jpg',
		part: 'back',
		method: 'resistance',
		equipment: 'lat-bar',
		defaultMode: FORCE_MODE_PRESETS.CONST,
		defaultResistance: 15,
		recommendedSets: 4,
		recommendedReps: 10
	},
	{
		id: 2,
		name: '站姿颈后臂屈伸',
		cover: '/static/icons/freeTrainingActivity/action-library/ic_action_02.jpg',
		part: 'arm',
		method: 'resistance',
		equipment: 'rope',
		defaultMode: FORCE_MODE_PRESETS.CONST,
		defaultResistance: 15,
		recommendedSets: 4,
		recommendedReps: 10
	},
	{
		id: 3,
		name: '进阶脚环弓步上提',
		cover: '/static/icons/freeTrainingActivity/action-library/ic_action_03.jpg',
		part: 'leg',
		method: 'no-resistance',
		equipment: 'ankle-strap',
		defaultMode: FORCE_MODE_PRESETS.ELASTIC,
		defaultResistance: 20,
		recommendedSets: 3,
		recommendedReps: 12
	},
	{
		id: 4,
		name: '站姿交替前平举',
		cover: '/static/icons/freeTrainingActivity/action-library/ic_action_04.jpg',
		part: 'shoulder',
		method: 'no-resistance',
		equipment: 'double-handle',
		defaultMode: FORCE_MODE_PRESETS.CONC_ISO,
		defaultResistance: 12,
		recommendedSets: 3,
		recommendedReps: 10
	},
	{
		id: 5,
		name: '站姿交替弯举',
		cover: '/static/icons/freeTrainingActivity/action-library/ic_action_05.jpg',
		part: 'arm',
		method: 'resistance',
		equipment: 'double-handle',
		defaultMode: FORCE_MODE_PRESETS.CONST,
		defaultResistance: 13,
		recommendedSets: 3,
		recommendedReps: 12
	},
	{
		id: 6,
		name: '脚环站立后蹬',
		cover: '/static/icons/freeTrainingActivity/action-library/ic_action_06.jpg',
		part: 'leg',
		method: 'no-resistance',
		equipment: 'ankle-strap',
		defaultMode: FORCE_MODE_PRESETS.FLUID,
		defaultResistance: 22,
		recommendedSets: 4,
		recommendedReps: 10
	},
	{
		id: 7,
		name: '俯身划船',
		cover: '/static/icons/freeTrainingActivity/action-library/ic_action_01.jpg',
		part: 'back',
		method: 'resistance',
		equipment: 'triangle-handle',
		defaultMode: FORCE_MODE_PRESETS.ECC_ISO,
		defaultResistance: 16,
		recommendedSets: 4,
		recommendedReps: 10
	},
	{
		id: 8,
		name: '肩部推举',
		cover: '/static/icons/freeTrainingActivity/action-library/ic_action_02.jpg',
		part: 'shoulder',
		method: 'resistance',
		equipment: 'short-bar',
		defaultMode: FORCE_MODE_PRESETS.CONST,
		defaultResistance: 15,
		recommendedSets: 3,
		recommendedReps: 10
	},
	{
		id: 9,
		name: '胸部飞鸟',
		cover: '/static/icons/freeTrainingActivity/action-library/ic_action_03.jpg',
		part: 'chest',
		method: 'no-resistance',
		equipment: 'double-handle',
		defaultMode: FORCE_MODE_PRESETS.ELASTIC,
		defaultResistance: 12,
		recommendedSets: 3,
		recommendedReps: 15
	},
	{
		id: 10,
		name: '深蹲提拉',
		cover: '/static/icons/freeTrainingActivity/action-library/ic_action_04.jpg',
		part: 'leg',
		method: 'resistance',
		equipment: 'rope',
		defaultMode: FORCE_MODE_PRESETS.BALANCE,
		defaultResistance: 24,
		recommendedSets: 4,
		recommendedReps: 8
	},
	{
		id: 11,
		name: '背部下拉',
		cover: '/static/icons/freeTrainingActivity/action-library/ic_action_05.jpg',
		part: 'back',
		method: 'resistance',
		equipment: 'lat-bar',
		defaultMode: FORCE_MODE_PRESETS.FLUID,
		defaultResistance: 18,
		recommendedSets: 4,
		recommendedReps: 12
	},
	{
		id: 12,
		name: '三头肌下压',
		cover: '/static/icons/freeTrainingActivity/action-library/ic_action_06.jpg',
		part: 'arm',
		method: 'resistance',
		equipment: 'rope',
		defaultMode: FORCE_MODE_PRESETS.CONC_ISO,
		defaultResistance: 11,
		recommendedSets: 3,
		recommendedReps: 12
	}
])

const filteredActions = computed(() => {
	return actionList.value.filter((action) => {
		return matchesAppliedFilter(appliedFilters.value.part, action.part) &&
			matchesAppliedFilter(appliedFilters.value.method, action.method) &&
			matchesAppliedFilter(appliedFilters.value.equipment, action.equipment)
	})
})

const selectedIds = ref([])

const isSelected = (id) => {
	return selectedIds.value.includes(id)
}

const toggleSelect = (id) => {
	const index = selectedIds.value.indexOf(id)
	if (index > -1) {
		selectedIds.value.splice(index, 1)
	} else {
		selectedIds.value.push(id)
	}
}

const selectedCount = computed(() => selectedIds.value.length)

const showDetailModal = ref(false)
const currentDetailAction = ref(null)
const toastRef = ref(null)

const goBack = () => {
	uni.navigateBack()
}

const handleGoCourseLibrary = () => {
	navigateBackToRoute('/pages/partTraining/part-training')
}

const handleDone = () => {
	if (selectedIds.value.length === 0) {
		toastRef.value?.show('请先选择动作')
		return
	}

	const selectedActions = actionList.value.filter(a => selectedIds.value.includes(a.id))

	uni.navigateTo({
		url: '/pages/freeTraining/selected-action',
		success: (res) => {
			res.eventChannel.emit('selectedActions', selectedActions)
		}
	})
}

const handleDetail = (action) => {
	currentDetailAction.value = action
	showDetailModal.value = true
}

const handleSelectFromModal = (action) => {
	if (action && !isSelected(action.id)) {
		selectedIds.value.push(action.id)
	}
}
</script>

<style scoped>
.container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f5f5f5;
	padding: 0 24rpx 0 12rpx;
	box-sizing: border-box;
}

.nav-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 100rpx;
	padding-top: 20rpx;
	flex-shrink: 0;
}

.back-btn {
	width: 60rpx;
	height: 60rpx;
}

.nav-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.done-btn {
	position: relative;
	height: 56rpx;
	padding: 0 24rpx;
	background-color: #00C853;
	border-radius: 28rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.done-btn-text {
	font-size: 24rpx;
	font-weight: 600;
	color: #ffffff;
}

.badge {
	position: absolute;
	top: -8rpx;
	right: -8rpx;
	width: 28rpx;
	height: 28rpx;
	background-color: #FF3B30;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.badge-text {
	font-size: 18rpx;
	font-weight: bold;
	color: #ffffff;
}

.main-content {
	flex: 1;
	display: flex;
	flex-direction: row;
	gap: 12rpx;
	overflow: hidden;
	padding-bottom: 24rpx;
}

.action-grid-scroll {
	flex: 1;
	height: 100%;
	width: 0;
}

.action-grid {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 20rpx;
	width: 100%;
	box-sizing: border-box;
	padding: 8rpx;
}

.action-card-wrapper {
	width: calc(50% - 10rpx);
}

.done-btn--disabled {
	background-color: #cccccc;
}
</style>
