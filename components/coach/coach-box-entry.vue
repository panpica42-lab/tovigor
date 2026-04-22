<!--
 * AI 教练框统一入口
 *
 * 职责：
 *   1. 对页面暴露统一导入路径
 *   2. 按平台分发到 vue / nvue 实现
 *   3. 转发教练切换与弹窗事件
 -->
<template>
	<!-- #ifdef APP-NVUE -->
	<CoachBoxNvue
		:text="text"
		:bubble-width="bubbleWidth"
		@coach-changed="handleCoachChanged"
		@modal-open="handleModalOpen"
		@modal-close="handleModalClose"
	></CoachBoxNvue>
	<!-- #endif -->

	<!-- #ifndef APP-NVUE -->
	<CoachBox
		:text="text"
		:bubble-width="bubbleWidth"
		:content-background="contentBackground"
		:clickable="clickable"
		@coach-changed="handleCoachChanged"
		@modal-open="handleModalOpen"
		@modal-close="handleModalClose"
	></CoachBox>
	<!-- #endif -->
</template>

<script>
import CoachBox from '@/components/coach/coach-box.vue'
import CoachBoxNvue from '@/components/coach/coach-box-nvue.vue'

export default {
	components: {
		CoachBox,
		CoachBoxNvue
	},

	props: {
		text: {
			type: String,
			default: ''
		},
		bubbleWidth: {
			type: String,
			default: ''
		},
		contentBackground: {
			type: String,
			default: 'rgba(255, 255, 255, 0.85)'
		},
		clickable: {
			type: Boolean,
			default: true
		}
	},

	emits: ['coach-changed', 'modal-open', 'modal-close'],

	methods: {
		handleCoachChanged(coachData) {
			this.$emit('coach-changed', coachData)
		},

		handleModalOpen() {
			this.$emit('modal-open')
		},

		handleModalClose() {
			this.$emit('modal-close')
		}
	}
}
</script>
