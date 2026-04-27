<!--
	产品语义说明：
	这个文件是“课程详情页壳子”。
	它本身不负责画复杂详情内容，只负责接住路由参数、读取课程数据，
	再把数据交给 course-detail-content.vue 去显示。
-->
<template>
	<view class="detail-page">
		<CourseDetailContent v-if="course" :course="course" />
		<view v-else class="loading">加载中...</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import CourseDetailContent from './components/course-detail-content.vue'
import { getPartTrainingCourseById } from './course-data.js'

const course = ref(null)

onLoad((options) => {
	course.value = getPartTrainingCourseById(options.id)
	
	if (!course.value) {
		uni.showToast({
			title: '课程不存在',
			icon: 'none'
		})
		setTimeout(() => {
			uni.navigateBack()
		}, 1500)
	}
})
</script>

<style scoped lang="scss">
.detail-page {
	min-height: 100vh;
	background-color: #F5F5F5;
}

.loading {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
	font-size: 28rpx;
	color: #999;
}
</style>
