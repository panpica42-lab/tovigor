<template>
	<!-- #ifdef APP-NVUE -->
	<NvueCoachBubbleBox
		:text="text"
		:bubble-width="bubbleWidth"
		@coach-changed="handleCoachChanged"
		@modal-open="handleModalOpen"
		@modal-close="handleModalClose"
	></NvueCoachBubbleBox>
	<!-- #endif -->

	<!-- #ifndef APP-NVUE -->
	<SharedCoachBubbleBox
		:text="text"
		:bubble-width="bubbleWidth"
		:content-background="contentBackground"
		:clickable="clickable"
		@coach-changed="handleCoachChanged"
		@modal-open="handleModalOpen"
		@modal-close="handleModalClose"
	></SharedCoachBubbleBox>
	<!-- #endif -->
</template>

<script>
import SharedCoachBubbleBox from '@/components/shared/coach-bubble-box.vue'
import NvueCoachBubbleBox from '@/components/nvue-ui-box/coach-bubble-box.vue'

export default {
	components: {
		SharedCoachBubbleBox,
		NvueCoachBubbleBox
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
