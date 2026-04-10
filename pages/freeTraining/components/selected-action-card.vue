<!--
 * 选中动作卡片组件
 * 功能：展示已选动作，支持组数/次数调节
 * 使用场景：已选动作页面的私有组件
 -->
<template>
	<view 
		class="selected-card"
		:class="{ 'selected-card--dragging': isDragging }"
	>
		<!-- 序号标签 -->
		<view class="card-index">
			<text class="index-text">动作{{ index + 1 }}</text>
		</view>
		
		<!-- 动作封面 -->
		<view class="card-cover">
			<image class="cover-img" :src="action.cover" mode="aspectFill" />
		</view>
		
		<!-- 动作信息区 -->
		<view class="card-info">
			<!-- 动作名称 -->
			<text class="action-name">{{ action.name }}</text>
			
			<!-- 组数/次数调节 -->
			<view class="adjust-row">
				<!-- 组数调节 -->
				<view class="adjust-group">
					<view class="adjust-btn" @click.stop="decreaseSets">
						<text class="adjust-btn-text">-</text>
					</view>
					<text class="adjust-value">{{ action.sets }} 组</text>
					<view class="adjust-btn" @click.stop="increaseSets">
						<text class="adjust-btn-text">+</text>
					</view>
				</view>
				
				<!-- 次数调节 -->
				<view class="adjust-group">
					<view class="adjust-btn" @click.stop="decreaseReps">
						<text class="adjust-btn-text">-</text>
					</view>
					<text class="adjust-value">{{ action.reps }} 次</text>
					<view class="adjust-btn" @click.stop="increaseReps">
						<text class="adjust-btn-text">+</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
const props = defineProps({
	// 动作数据（含 sets 和 reps）
	action: {
		type: Object,
		required: true
	},
	// 序号（从0开始）
	index: {
		type: Number,
		required: true
	},
	// 是否正在拖拽
	isDragging: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['update:sets', 'update:reps'])

// 组数范围
const SETS_MIN = 1
const SETS_MAX = 10

// 次数范围
const REPS_MIN = 1
const REPS_MAX = 20

// 组数调节
const increaseSets = () => {
	if (props.action.sets < SETS_MAX) {
		emit('update:sets', props.action.sets + 1)
	}
}

const decreaseSets = () => {
	if (props.action.sets > SETS_MIN) {
		emit('update:sets', props.action.sets - 1)
	}
}

// 次数调节
const increaseReps = () => {
	if (props.action.reps < REPS_MAX) {
		emit('update:reps', props.action.reps + 1)
	}
}

const decreaseReps = () => {
	if (props.action.reps > REPS_MIN) {
		emit('update:reps', props.action.reps - 1)
	}
}
</script>

<style scoped>
.selected-card {
	position: relative;
	display: flex;
	flex-direction: row;
	align-items: center;
	background-color: #ffffff;
	border-radius: 24rpx;
	padding: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.selected-card--dragging {
	transform: scale(1.02);
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
	background-color: #f0fff0;
}

/* 序号标签 */
.card-index {
	position: absolute;
	left: 24rpx;
	top: 24rpx;
	background-color: #00C853;
	padding: 6rpx 16rpx;
	border-radius: 8rpx;
	z-index: 1;
}

.index-text {
	font-size: 20rpx;
	color: #ffffff;
	font-weight: 600;
}

/* 动作封面 */
.card-cover {
	width: 160rpx;
	height: 160rpx;
	border-radius: 16rpx;
	overflow: hidden;
	flex-shrink: 0;
}

.cover-img {
	width: 100%;
	height: 100%;
}

/* 动作信息区 */
.card-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	margin-left: 24rpx;
	gap: 20rpx;
}

.action-name {
	font-size: 28rpx;
	font-weight: 600;
	color: #333333;
}

/* 调节行 */
.adjust-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 32rpx;
}

.adjust-group {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 12rpx;
}

.adjust-btn {
	width: 56rpx;
	height: 56rpx;
	background-color: #f0f0f0;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.adjust-btn:active {
	background-color: #e0e0e0;
}

.adjust-btn-text {
	font-size: 36rpx;
	color: #333333;
	font-weight: bold;
	line-height: 1;
}

.adjust-value {
	font-size: 26rpx;
	color: #333333;
	min-width: 80rpx;
	text-align: center;
}
</style>
