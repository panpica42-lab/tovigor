<template>
	<view class="page">
		<!-- 顶部导航 -->
		<view class="header">
			<CommonBackButton class="back-btn-position" :useDefault="false" @click="handleBack" />
			<text class="header-title">部位训练</text>
		</view>

		<!-- 主体内容：左右两列 -->
		<view class="content">
			<!-- 左列：sidebar -->
			<CourseLibrarySidebar
				class="sidebar"
				:filters="filters"
				:hasPendingChanges="hasPendingFilterChanges"
				:hasAppliedFilters="hasAppliedCourseFilters"
				:filterCount="filterButtonCount"
				@changeFilter="handleFilterChange"
				@applyFilters="handleApplyFilters"
				@goActionLibrary="handleGoActionLibrary"
				@openAiRecommend="handleOpenAiRecommend"
			/>

			<!-- 右列：main-column -->
			<view class="main-column">
				<!-- 搜索栏 -->
				<view class="search-bar">
					<view class="search-box">
						<view class="search-icon"></view>
						<input
							class="search-input"
							type="text"
							placeholder="搜索训练课程..."
							:placeholder-style="'color: #B0B0B0; font-size: 24rpx;'"
							confirm-type="search"
							@confirm="handleSearchConfirm"
						/>
					</view>
				</view>

				<!-- 课程列表 -->
				<scroll-view
					class="course-scroll"
					scroll-y="true"
					:show-scrollbar="false"
				>
					<view class="course-grid">
						<view
							v-for="course in filteredCourses"
							:key="course.id"
							class="course-item"
						>
							<TrainingCourseCard
								:course="course"
								@click="handleCourseClick"
								@play="handleCoursePlay"
							/>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>

		<AiRecommendModal
			:visible="showAiRecommendModal"
			@update:visible="showAiRecommendModal = $event"
			@start="handleStartAiRecommend"
		/>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import CommonBackButton from '@/components/ui-box/common-back-button.vue'
import CourseLibrarySidebar from '@/components/ui-box/CourseLibrarySidebar.vue'
import TrainingCourseCard from '@/components/course-list/training-course-card.vue'
import AiRecommendModal from '@/components/modals/ai-recommend-modal.vue'
import { navigateBackOrReLaunch } from '@/utils/navigation.js'

const searchKeyword = ref('')
const showAiRecommendModal = ref(false)

const createFilterState = () => ({
	gender: [],
	goal: [],
	level: [],
	part: [],
	method: [],
	duration: [],
	equipment: [],
	coach: []
})

const COURSE_FILTER_KEYS = ['gender', 'goal', 'level', 'part', 'method', 'duration', 'equipment']

const cloneFilters = (source) => ({
	gender: [...(source.gender || [])],
	goal: [...(source.goal || [])],
	level: [...(source.level || [])],
	part: [...(source.part || [])],
	method: [...(source.method || [])],
	duration: [...(source.duration || [])],
	equipment: [...(source.equipment || [])],
	coach: [...(source.coach || [])]
})

const filters = ref(createFilterState())
const appliedFilters = ref(createFilterState())

/*
 * 课程库基础数据。
 * 每个课程对象都带筛选字段：
 * gender: all=全部，female=女性，male=男性
 * goal: fat-loss=减脂塑形，muscle=增肌增力，health=全面健康，wellness=健康养生，youth=适能训练
 * level: beginner=初级，intermediate=中级，advanced=高级
 * part: shoulder=肩部，chest=胸部，back=背部，arm=手臂，core=腹部，leg=臀腿，full-body=全身
 * method: resistance=有力臂，no-resistance=无力臂
 * durationRange: 0-15=<15分，15-25=15-25分，25-40=25-40分，40+=40分以上
 * equipment:
 *   short-bar=短杆，ankle-strap=脚环，triangle-handle=三角把，middle-bar=中杆，yoga-mat=瑜伽垫，
 *   lat-bar=横杆，foam-roller=泡沫轴，resistance-band=弹力带，dual-rope=两头绳，fitness-bench=健身椅
 */
const courseList = ref([
	{
		id: 1,
		title: '美人肩塑形',
		duration: '15min',
		cover: '/static/icons/partTrainingActivity/course_pic_01.jpg',
		gender: 'female',
		goal: 'fat-loss',
		level: 'intermediate',
		part: 'shoulder',
		method: 'no-resistance',
		durationRange: '15-25',
		equipment: ['short-bar', 'fitness-bench'],
		tags: ['减脂塑形', '中等', '三角肌后束']
	},
	{
		id: 2,
		title: '基础臀部塑形',
		duration: '45min',
		cover: '/static/icons/partTrainingActivity/course_pic_02.jpg',
		gender: 'female',
		goal: 'fat-loss',
		level: 'advanced',
		part: 'leg',
		method: 'no-resistance',
		durationRange: '40+',
		equipment: ['ankle-strap', 'resistance-band'],
		tags: ['塑形紧致', '较难', '臀大肌']
	},
	{
		id: 3,
		title: '肩部肌群训练',
		duration: '25min',
		cover: '/static/icons/partTrainingActivity/course_pic_03.jpg',
		gender: 'male',
		goal: 'muscle',
		level: 'intermediate',
		part: 'shoulder',
		method: 'resistance',
		durationRange: '15-25',
		equipment: ['triangle-handle', 'middle-bar'],
		tags: ['力量增强', '中等', '三角肌外侧']
	},
	{
		id: 4,
		title: '美背新训练',
		duration: '30min',
		cover: '/static/icons/partTrainingActivity/course_pic_04.jpg',
		gender: 'female',
		goal: 'wellness',
		level: 'intermediate',
		part: 'back',
		method: 'resistance',
		durationRange: '25-40',
		equipment: ['lat-bar', 'dual-rope'],
		tags: ['塑形紧致', '中等', '背阔肌']
	},
	{
		id: 5,
		title: '爆发腿部燃脂',
		duration: '20min',
		cover: '/static/icons/partTrainingActivity/course_pic_05.jpg',
		gender: 'all',
		goal: 'fat-loss',
		level: 'advanced',
		part: 'leg',
		method: 'resistance',
		durationRange: '15-25',
		equipment: ['ankle-strap', 'dual-rope'],
		tags: ['高效燃脂', '较难', '股四头肌']
	},
	{
		id: 6,
		title: '核心塑型进阶',
		duration: '18min',
		cover: '/static/icons/partTrainingActivity/course_pic_06.jpg',
		gender: 'all',
		goal: 'health',
		level: 'intermediate',
		part: 'core',
		method: 'no-resistance',
		durationRange: '15-25',
		equipment: ['yoga-mat', 'foam-roller'],
		tags: ['核心稳定', '中等', '腹横肌']
	},
	{
		id: 7,
		title: '蜜桃臀养成',
		duration: '35min',
		cover: '/static/icons/partTrainingActivity/course_pic_01.jpg',
		gender: 'female',
		goal: 'fat-loss',
		level: 'intermediate',
		part: 'leg',
		method: 'no-resistance',
		durationRange: '25-40',
		equipment: ['ankle-strap', 'fitness-bench'],
		tags: ['臀部塑形', '中等', '臀中肌']
	},
	{
		id: 8,
		title: '全身燃脂HIIT',
		duration: '22min',
		cover: '/static/icons/partTrainingActivity/course_pic_02.jpg',
		gender: 'all',
		goal: 'youth',
		level: 'advanced',
		part: 'full-body',
		method: 'no-resistance',
		durationRange: '15-25',
		equipment: ['resistance-band', 'yoga-mat'],
		tags: ['高效燃脂', '较难', '全身']
	},
	{
		id: 9,
		title: '手臂线条雕刻',
		duration: '28min',
		cover: '/static/icons/partTrainingActivity/course_pic_03.jpg',
		gender: 'female',
		goal: 'muscle',
		level: 'intermediate',
		part: 'arm',
		method: 'resistance',
		durationRange: '25-40',
		equipment: ['short-bar', 'dual-rope'],
		tags: ['力量增强', '中等', '肱二头肌']
	},
	{
		id: 10,
		title: '腹肌撕裂者',
		duration: '16min',
		cover: '/static/icons/partTrainingActivity/course_pic_04.jpg',
		gender: 'male',
		goal: 'muscle',
		level: 'advanced',
		part: 'core',
		method: 'no-resistance',
		durationRange: '15-25',
		equipment: ['yoga-mat', 'fitness-bench'],
		tags: ['核心强化', '较难', '腹直肌']
	}
])

const getFilterValues = (source, key) => source[key] || []

const getCourseFilterCount = (source) => {
	return COURSE_FILTER_KEYS.reduce((count, key) => count + getFilterValues(source, key).length, 0)
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
	return COURSE_FILTER_KEYS.some((key) => {
		return !areFilterValuesEqual(
			getFilterValues(filters.value, key),
			getFilterValues(appliedFilters.value, key)
		)
	})
})

const hasAppliedCourseFilters = computed(() => getCourseFilterCount(appliedFilters.value) > 0)

const filterButtonCount = computed(() => {
	return hasPendingFilterChanges.value
		? getCourseFilterCount(filters.value)
		: getCourseFilterCount(appliedFilters.value)
})

const matchesAppliedFilter = (selectedValues, courseValue) => {
	if (!selectedValues || selectedValues.length === 0) {
		return true
	}

	if (courseValue === undefined || courseValue === null) {
		return true
	}

	const courseValues = Array.isArray(courseValue) ? courseValue : [courseValue]
	return selectedValues.some(value => courseValues.includes(value))
}

const filteredCourses = computed(() => {
	return courseList.value.filter((course) => {
		return matchesAppliedFilter(appliedFilters.value.gender, course.gender) &&
			matchesAppliedFilter(appliedFilters.value.goal, course.goal) &&
			matchesAppliedFilter(appliedFilters.value.level, course.level) &&
			matchesAppliedFilter(appliedFilters.value.part, course.part) &&
			matchesAppliedFilter(appliedFilters.value.method, course.method) &&
			matchesAppliedFilter(appliedFilters.value.duration, course.durationRange) &&
			matchesAppliedFilter(appliedFilters.value.equipment, course.equipment)
	})
})

const handleSearchConfirm = (event) => {
	searchKeyword.value = event.detail.value
	uni.showToast({
		title: '搜索功能开发中',
		icon: 'none'
	})
}

const handleCourseClick = (course) => {
	uni.navigateTo({
		url: '/pages/partTraining/part-training-detail-adapter?id=' + course.id
	})
}

const handleBack = () => {
	navigateBackOrReLaunch('/pages/index/index')
}

const handleCoursePlay = (course) => {
	uni.showToast({
		title: `播放 ${course.title}`,
		icon: 'none'
	})
}

const handleGoActionLibrary = () => {
	uni.navigateTo({
		url: '/pages/freeTraining/action-library'
	})
}

const handleOpenAiRecommend = () => {
	showAiRecommendModal.value = true
}

const handleStartAiRecommend = () => {
	showAiRecommendModal.value = false
	uni.showToast({
		title: 'AI分析功能开发中',
		icon: 'none'
	})
}

const handleFilterChange = (data) => {
	filters.value[data.key] = data.values
}

const handleApplyFilters = () => {
	appliedFilters.value = cloneFilters(filters.value)
}
</script>

<style scoped lang="scss">
.page {
	height: 100vh ;
	background-color: #F5F5F5;
	display: flex;
	flex-direction: column;
	padding: 4rpx 28rpx 0 16rpx;
	box-sizing: border-box;
	overflow: hidden ;
}

.header {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 96rpx;
	flex-shrink: 0;  // 头部固定高
}

.back-btn-position {
	position: absolute;
	left: 21rpx;
	top: 50%;
	transform: translateY(-50%);
}

.header-title {
	font-size: 34rpx;
	font-weight: 700;
	color: #333333;
}

.content {
	display: flex;
	flex-direction: row;
	flex: 1;   // 填满 header 下方所有空间
	min-height: 0;
	gap: 24rpx;
	overflow: hidden; // 建议加上，避免横向多余滚动
}

.sidebar {
	flex-shrink: 0;
	min-height: 0;
}

.main-column {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
	min-height: 0;  // 关键：允许内部 flex 子项正确分配高度
}

.search-bar {
	flex-shrink: 0;
}

.search-box {
	display: flex;
	align-items: center;
	background: #FFFFFF;
	border-radius: 40rpx;
	padding: 0 24rpx;
	box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.08);
	height: 80rpx;
}

.search-icon {
	width: 28rpx;
	height: 28rpx;
	border-radius: 50%;
	border: 4rpx solid #B0B0B0;
	position: relative;
}

.search-icon::after {
	content: '';
	position: absolute;
	width: 14rpx;
	height: 4rpx;
	background: #B0B0B0;
	border-radius: 2rpx;
	bottom: -8rpx;
	right: -4rpx;
	transform: rotate(45deg);
}

.search-input {
	flex: 1;
	margin-left: 16rpx;
	font-size: 26rpx;
	color: #333333;
}

.course-scroll {
  flex: 1;           // 占满 main-column 剩余空间
  min-height: 0;     // 允许缩小，否则有些平台会撑破
  background: transparent;
}


.course-grid {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	row-gap: 24rpx;
	padding-bottom: 40rpx;
}

.course-item {
	width: calc(50% - 12rpx);
}
</style>
