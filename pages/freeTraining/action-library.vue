<template>
	<view class="container">
		<!-- 顶部导航栏 -->
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
				<!-- 选中数量徽章 -->
				<view v-if="selectedCount > 0" class="badge">
					<text class="badge-text">{{ selectedCount }}</text>
				</view>
			</view>
		</view>

		<!-- 主体区域 -->
		<view class="main-content">
			<!-- 左侧筛选栏 -->
			<TrainingFilterSidebar
				:filters="filters"
				@changeFilter="handleFilterChange"
			/>

			<!-- 右侧动作卡片网格 -->
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

		<!-- 动作详情弹窗 -->
		<ActionDetailModal
			v-model:visible="showDetailModal"
			:action="currentDetailAction"
			:is-selected="currentDetailAction ? isSelected(currentDetailAction.id) : false"
			@select="handleSelectFromModal"
		/>

		<!-- 自定义轻量提示 -->
		<CustomToast ref="toastRef" />
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import TrainingFilterSidebar from '@/components/ui-box/training-filter-sidebar.vue'
import ActionCard from './components/action-card.vue'
import ActionDetailModal from './components/action-detail-modal.vue'
import CustomToast from '@/components/modals/custom-toast.vue'

// ========== 筛选状态 ==========
const filters = ref({
	gender: [],
	goal: [],
	level: [],
	part: [],
	method: [],
	duration: [],
	equipment: [],
	coach: []
})

// 处理筛选变化
const handleFilterChange = (payload) => {
	const { key, values } = payload
	filters.value[key] = values
}

// ========== Mock 动作数据 ==========
const actionList = ref([
	{ id: 1, name: '低位上拉', cover: '/static/icons/freeTrainingActivity/action-library/ic_action_01.jpg', part: 'back' },
	{ id: 2, name: '站姿颈后臂屈伸', cover: '/static/icons/freeTrainingActivity/action-library/ic_action_02.jpg', part: 'arm' },
	{ id: 3, name: '进阶脚环弓步上提', cover: '/static/icons/freeTrainingActivity/action-library/ic_action_03.jpg', part: 'leg' },
	{ id: 4, name: '站姿交替前平举', cover: '/static/icons/freeTrainingActivity/action-library/ic_action_04.jpg', part: 'shoulder' },
	{ id: 5, name: '站姿交替弯矩', cover: '/static/icons/freeTrainingActivity/action-library/ic_action_05.jpg', part: 'arm' },
	{ id: 6, name: '脚环竞上后踢', cover: '/static/icons/freeTrainingActivity/action-library/ic_action_06.jpg', part: 'leg' },
	{ id: 7, name: '俯身划船', cover: '/static/icons/freeTrainingActivity/action-library/ic_action_01.jpg', part: 'back' },
	{ id: 8, name: '肩部推举', cover: '/static/icons/freeTrainingActivity/action-library/ic_action_02.jpg', part: 'shoulder' },
	{ id: 9, name: '胸部飞鸟', cover: '/static/icons/freeTrainingActivity/action-library/ic_action_03.jpg', part: 'chest' },
	{ id: 10, name: '深蹲提拉', cover: '/static/icons/freeTrainingActivity/action-library/ic_action_04.jpg', part: 'leg' },
	{ id: 11, name: '背部下拉', cover: '/static/icons/freeTrainingActivity/action-library/ic_action_05.jpg', part: 'back' },
	{ id: 12, name: '三头肌下压', cover: '/static/icons/freeTrainingActivity/action-library/ic_action_06.jpg', part: 'arm' },
])

// 根据筛选条件过滤动作（简化版，仅演示）
const filteredActions = computed(() => {
	// 暂时不做实际筛选，返回全部
	return actionList.value
})

// ========== 选择状态 ==========
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

// 选中数量
const selectedCount = computed(() => selectedIds.value.length)

// ========== 详情弹窗状态 ==========
const showDetailModal = ref(false)
const currentDetailAction = ref(null)

// ========== 自定义提示 ==========
const toastRef = ref(null)

// ========== 事件处理 ==========
// 返回上一页
const goBack = () => {
	uni.navigateBack()
}

// 添加完成
const handleDone = () => {
	// 校验：至少选择一个动作
	if (selectedIds.value.length === 0) {
		toastRef.value?.show('请先选择动作')
		return
	}
	
	// 获取选中的动作数据
	const selectedActions = actionList.value.filter(a => selectedIds.value.includes(a.id))
	
	// 跳转到已选动作页面，传递数据
	uni.navigateTo({
		url: '/pages/freeTraining/selected-action',
		success: (res) => {
			res.eventChannel.emit('selectedActions', selectedActions)
		}
	})
}

// 查看详情
const handleDetail = (action) => {
	currentDetailAction.value = action
	showDetailModal.value = true
}

// 从弹窗中选择添加
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

/* ========== 顶部导航栏 ========== */
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

/* 数量徽章 */
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

/* ========== 主体区域 ========== */
.main-content {
	flex: 1;
	display: flex;
	flex-direction: row;
	gap: 12rpx;
	overflow: hidden;
	padding-bottom: 24rpx;
}

/* ========== 右侧动作网格 ========== */
.action-grid-scroll {
	flex: 1;
	height: 100%;
	width: 0; /* 关键：flex 子项必须有明确宽度基准，否则内容会撑开 */
}

.action-grid {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 20rpx;
	width: 100%;
	box-sizing: border-box;
	padding: 8rpx; /* 给 box-shadow 留空间 */
}

/* 卡片容器 - 控制宽度 */
.action-card-wrapper {
	width: calc(50% - 10rpx);
}

/* 按钮禁用状态 */
.done-btn--disabled {
	background-color: #cccccc;
}
</style>
