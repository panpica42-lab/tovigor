<!--
 * 步骤进度条组件（nvue 兼容版）
 * 功能：显示多步骤流程的当前进度（类似 Instagram Stories 的进度条）
 * 用途：用于多页面引导流程、问卷调查、分步表单等场景
 *
 * 使用示例：
 *   <NvueStepBar :totalSteps="5" :currentStep="2" />
 *   表示总共5步，当前在第2步（前2个进度条会高亮）
 *
 * nvue 兼容说明：
 *   - Options API（不用 <script setup>）
 *   - 无 scoped / scss / @import uni.scss
 *   - 无 transition / :last-child 伪类
 *   - padding 拆写为四方向
 *   - $emerald-green 替换为 #00C853 字面量
 *   - 用 margin 逻辑替代 :last-child（最后一项用 computed 控制）
 -->
<template>
	<view class="nsb-step-bar">
		<view
			v-for="(item, index) in totalSteps"
			:key="index"
			class="nsb-step-item"
			:style="stepItemStyle(index)"
		></view>
	</view>
</template>

<script>
export default {
	props: {
		totalSteps: {
			type: Number,
			required: true
		},
		currentStep: {
			type: Number,
			required: true
		}
	},

	methods: {
		stepItemStyle(index) {
			const isActive = index < this.currentStep
			const isLast = index === this.totalSteps - 1
			return {
				backgroundColor: isActive ? '#00C853' : '#e0e0e0',
				marginRight: isLast ? '0' : '8rpx'
			}
		}
	}
}
</script>

<style>
.nsb-step-bar {
	flex-direction: row;
	align-items: center;
	padding-top: 0;
	padding-bottom: 0;
	padding-left: 24rpx;
	padding-right: 24rpx;
}

.nsb-step-item {
	flex: 1;
	height: 8rpx;
	border-radius: 4rpx;
	background-color: #e0e0e0;
}
</style>
