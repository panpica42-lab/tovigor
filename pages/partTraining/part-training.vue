<template>
	<view class="page">
		<!-- 顶部导航 -->
		<view class="header">
			<CommonBackButton class="back-btn-position" />
			<text class="header-title">部位训练</text>
		</view>

		<!-- 主体内容：左右两列 -->
		<view class="content">
			<!-- 左列：sidebar -->
			<TrainingFilterSidebar
				class="sidebar"
				:filters="filters"
				@changeFilter="handleFilterChange"
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
							v-for="course in courseList"
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
	</view>
</template>

<script setup>
import { ref } from 'vue'
import CommonBackButton from '@/components/ui-box/common-back-button.vue'
import TrainingFilterSidebar from '@/components/ui-box/training-filter-sidebar.vue'
import TrainingCourseCard from '@/components/course-list/training-course-card.vue'

const searchKeyword = ref('')

// 筛选状态 - 改为数组形式支持多选
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

const courseList = ref([
	{
		id: 1,
		title: '美人肩塑形',
		duration: '15min',
		cover: '/static/icons/partTrainingActivity/course_pic_01.jpg',
		tags: ['减脂塑形', '中等', '三角肌后束']
	},
	{
		id: 2,
		title: '基础臀部塑形',
		duration: '45min',
		cover: '/static/icons/partTrainingActivity/course_pic_02.jpg',
		tags: ['塑形紧致', '较难', '臀大肌']
	},
	{
		id: 3,
		title: '肩部肌群训练',
		duration: '25min',
		cover: '/static/icons/partTrainingActivity/course_pic_03.jpg',
		tags: ['力量增强', '中等', '三角肌外侧']
	},
	{
		id: 4,
		title: '美背新训练',
		duration: '30min',
		cover: '/static/icons/partTrainingActivity/course_pic_04.jpg',
		tags: ['塑形紧致', '中等', '背阔肌']
	},
	{
		id: 5,
		title: '爆发腿部燃脂',
		duration: '20min',
		cover: '/static/icons/partTrainingActivity/course_pic_05.jpg',
		tags: ['高效燃脂', '较难', '股四头肌']
	},
	{
		id: 6,
		title: '核心塑型进阶',
		duration: '18min',
		cover: '/static/icons/partTrainingActivity/course_pic_06.jpg',
		tags: ['核心稳定', '中等', '腹横肌']
	},
	{
		id: 7,
		title: '蜜桃臀养成',
		duration: '35min',
		cover: '/static/icons/partTrainingActivity/course_pic_01.jpg',
		tags: ['臀部塑形', '中等', '臀中肌']
	},
	{
		id: 8,
		title: '全身燃脂HIIT',
		duration: '22min',
		cover: '/static/icons/partTrainingActivity/course_pic_02.jpg',
		tags: ['高效燃脂', '较难', '全身']
	},
	{
		id: 9,
		title: '手臂线条雕刻',
		duration: '28min',
		cover: '/static/icons/partTrainingActivity/course_pic_03.jpg',
		tags: ['力量增强', '中等', '肱二头肌']
	},
	{
		id: 10,
		title: '腹肌撕裂者',
		duration: '16min',
		cover: '/static/icons/partTrainingActivity/course_pic_04.jpg',
		tags: ['核心强化', '较难', '腹直肌']
	}
])

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

const handleCoursePlay = (course) => {
	uni.showToast({
		title: `播放 ${course.title}`,
		icon: 'none'
	})
}

// 筛选变更事件
const handleFilterChange = (data) => {
	console.log('筛选变更:', data)
	filters.value[data.key] = data.values
	
	// TODO: 根据筛选条件重新加载课程列表
	uni.showToast({
		title: `筛选: ${data.option.label}`,
		icon: 'none'
	})
}
</script>

<style scoped lang="scss">
.page {
	height: 100vh ;
	background-color: #F5F5F5;
	display: flex;
	flex-direction: column;
	padding: 4rpx 28rpx 0 16rpx;
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
	gap: 24rpx;
	overflow: hidden; // 建议加上，避免横向多余滚动
}

.sidebar {
	flex-shrink: 0;
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
