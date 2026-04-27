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

		<AiRecommendResultModal
			:visible="showAiRecommendResultModal"
			:course="recommendedCourse"
			@update:visible="showAiRecommendResultModal = $event"
			@startTraining="handleStartRecommendedCourse"
		/>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import CommonBackButton from '@/components/ui-box/common-back-button.vue'
import CourseLibrarySidebar from '@/components/ui-box/CourseLibrarySidebar.vue'
import TrainingCourseCard from '@/components/course-list/training-course-card.vue'
import AiRecommendModal from '@/components/modals/ai-recommend-modal.vue'
import AiRecommendResultModal from '@/components/modals/ai-recommend-result-modal.vue'
import { navigateBackOrReLaunch } from '@/utils/navigation.js'
import { partTrainingCourses } from './course-data.js'

const searchKeyword = ref('')
const showAiRecommendModal = ref(false)
const showAiRecommendResultModal = ref(false)
const recommendedCourse = ref(null)

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

const courseList = ref(partTrainingCourses)

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

/*
 * AI 推荐逻辑说明：
 * 真正的“轻量推荐打分”写在当前页面 part-training.vue，
 * 不写在 ai-recommend-modal.vue 里。
 *
 * 原因：
 * 1. ai-recommend-modal.vue 只负责收集用户输入并把表单抛出来；
 * 2. 课程总数据 courseList 也在当前页面更容易拿到；
 * 3. 推荐结果弹窗、后续跳转也都由当前页面统一控制。
 *
 * 所以职责分工是：
 * - ai-recommend-modal.vue：采集表单
 * - part-training.vue：根据表单给课程打分并挑出推荐课
 * - ai-recommend-result-modal.vue：展示推荐结果
 */

/*
 * 当前这版不是“先硬筛选再推荐”，而是“遍历所有课程后给每门课打分”。
 * 分数越高，说明这门课越接近用户在 AI 推荐弹窗里填写的条件。
 *
 * 当前参与打分的字段，全都来自 partTrainingCourses 里已经存在的课程字段：
 * - gender
 * - goal
 * - part
 * - level
 * - method
 *
 * 对应的用户输入字段来自 AI 推荐弹窗表单：
 * - form.gender
 * - form.goal
 * - form.part
 * - form.level
 * - form.method
 *
 * 注意：
 * - 用户填写的 height / weight 目前还没有参与打分，只是先收集了表单值。
 * - course.durationRange / equipment / coach 等字段目前都没有纳入 AI 推荐打分。
 */
const getAiRecommendationScore = (form, course) => {
	let score = 0

	// 性别完全匹配：+4；课程标记为 all：+2
	if (course.gender === form.gender) {
		score += 4
	} else if (course.gender === 'all') {
		score += 2
	}

	// 训练目的匹配：+5
	if (course.goal === form.goal) {
		score += 5
	}

	// 训练部位匹配：+5
	if (course.part === form.part) {
		score += 5
	}

	// 难度匹配：+3
	if (course.level === form.level) {
		score += 3
	}

	// 训练方式匹配：+2
	if (course.method === form.method) {
		score += 2
	}

	return score
}

// 把所有课程按得分从高到低排序，当前只取第一名作为推荐结果。
// 如果后面要改成推荐 Top 3，这里就是最直接的改造入口。
const getRecommendedCourse = (form) => {
	const rankedCourses = [...courseList.value].sort((left, right) => {
		const scoreDiff = getAiRecommendationScore(form, right) - getAiRecommendationScore(form, left)
		if (scoreDiff !== 0) {
			return scoreDiff
		}

		return left.id - right.id
	})

	return rankedCourses[0] || null
}

const handleStartAiRecommend = (form) => {
	recommendedCourse.value = getRecommendedCourse(form)
	showAiRecommendModal.value = false

	if (!recommendedCourse.value) {
		uni.showToast({
			title: '暂无可推荐课程',
			icon: 'none'
		})
		return
	}

	showAiRecommendResultModal.value = true
}

const handleStartRecommendedCourse = (course) => {
	showAiRecommendResultModal.value = false
	uni.navigateTo({
		url: '/pages/partTraining/warm-up-page?courseId=' + course.id
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
