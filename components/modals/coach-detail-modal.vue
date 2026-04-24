<template>
	<CoachDetailModal
		:show="show"
		:coachData="coachData"
		:switchable="switchable"
		@update:show="handleUpdateShow"
		@select="handleSelect"
	></CoachDetailModal>
</template>

<script>
import CoachDetailModal from '@/components/coach/coach-detail-modal-vue.vue'

export default {
	components: {
		CoachDetailModal
	},

	props: {
		show: {
			type: Boolean,
			default: false
		},
		coachData: {
			type: Object,
			default: () => ({
				value: '',
				label: '',
				englishName: '',
				avatar: '',
				intro: '',
				tags: []
			})
		},
		switchable: {
			type: Boolean,
			default: false
		}
	},

	emits: ['update:show', 'select'],

	methods: {
		handleUpdateShow(value) {
			this.$emit('update:show', value)
		},

		handleSelect(coachData) {
			this.$emit('select', coachData)
		}
	}
}
</script>
