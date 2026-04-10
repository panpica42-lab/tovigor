<!--
 * 训练完成弹窗组件
 * 功能：训练结束后展示完成状态及统计数据，提供返回首页操作
 * 结构：上下均等两半（上：橙色渐变+标题+装饰物 / 下：白色+数据+按钮）+ 游离关闭按钮
 * 用法：
 *   <TrainingCompleteWindow
 *     v-model:visible="isFinishModalVisible"
 *     :duration="'12:35'"
 *     :calories="320"
 *     :completedSets="6"
 *     @confirm="handleConfirm"
 *   />
 -->
<template>
	<view v-if="visible" class="modal-overlay" @click="handleOverlayClick">
		<!-- 包装器：垂直排列弹窗卡片 + 游离关闭按钮 -->
		<view class="modal-wrapper" @click.stop>
			<view class="modal-card">
				<!-- ===== 上半部分：橙色渐变区域 ===== -->
				<view class="modal-top">
					<!-- 顶部胶囊把手 -->
					<view class="handle-bar"></view>
					
					<!-- 主标题 -->
					<text class="title-text">恭喜完成训练</text>
					
					<!-- 中间装饰物 -->
					<image
						class="ornament-img"
						src="/static/icons/general/ic_ornament_A.png"
						mode="aspectFit"
					/>
				</view>
				
				<!-- ===== 下半部分：白色区域 ===== -->
				<view class="modal-bottom">
					<!-- 扫码提示文字 -->
					<text class="qr-hint-top">使用微信扫一扫</text>
					
					<!-- 二维码 -->
					<image
						class="qr-code-img"
						src="/static/icons/general/QR_code_placeholder.png"
						mode="aspectFit"
					/>
					
					<!-- 副提示文字 -->
					<text class="qr-hint-bottom">扫描二维码登录小程序查询训练报告总结</text>
				</view>
			</view>
			
			<!-- 游离关闭按钮（在卡片下方居中） -->
			<view class="floating-close-btn" @click="handleClose">
				<image
					class="close-icon"
					src="/static/icons/general/btn_general_close.svg"
					mode="aspectFit"
				/>
			</view>
		</view>
	</view>
</template>

<script setup>
// TODO: 后续接入真实训练数据时，由父页面传入 duration / calories / completedSets

const props = defineProps({
	// 是否显示弹窗（v-model:visible）
	visible: {
		type: Boolean,
		default: false
	},
	// 是否允许点击遮罩关闭
	closeOnClickOverlay: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['update:visible', 'confirm', 'close'])

// 关闭弹窗（不触发确认逻辑）
const handleClose = () => {
	emit('update:visible', false)
	emit('close')
}

// 点击"返回首页"按钮
const handleConfirm = () => {
	emit('update:visible', false)
	emit('confirm')
}

// 点击遮罩层
const handleOverlayClick = () => {
	if (props.closeOnClickOverlay) {
		handleClose()
	}
}
</script>

<style scoped lang="scss">
/* ========== 遮罩层 ========== */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
	padding: 60rpx;
}

/* ========== 弹窗包装器（垂直排列卡片+关闭按钮） ========== */
.modal-wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 32rpx;
	width: 100%;
	max-width: 496rpx;
}

/* ========== 弹窗卡片 ========== */
.modal-card {
	width: 100%;
	background: #FFFFFF;
	border-radius: 32rpx;
	overflow: hidden;
	box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.3);
}

/* ========== 上半部分：橙色渐变区域 ========== */
.modal-top {
	position: relative;
	overflow: hidden;
	background: linear-gradient(160deg, #FFBE00 0%, #FFA200 50%, #FF8C00 100%);
	height: 320rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	padding-top: 22rpx;
}

/* 两根白色半透明渐变装饰柱 */
.modal-top::before,
.modal-top::after {
	content: '';
	position: absolute;
	top: -30rpx;
	width: 48rpx;
	height: 240rpx;
	border-radius: 24rpx;
	background: linear-gradient(to bottom, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0));
}

.modal-top::before {
	left: 12%;
	transform: rotate(-18deg);
}

.modal-top::after {
	right: 12%;
	transform: rotate(18deg);
}

/* 顶部胶囊把手 */
.handle-bar {
	width: 64rpx;
	height: 8rpx;
	background: rgba(255, 255, 255, 0.6);
	border-radius: 4rpx;
	margin-bottom: 26rpx;
}

.title-text {
	font-size: 38rpx;
	font-weight: bold;
	color: #FFFFFF;
	text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.15);
	letter-spacing: 4rpx;
	margin-bottom: 20rpx;
}

/* 中间装饰物 */
.ornament-img {
	width: 208rpx;
	height: 208rpx;
}

/* ========== 下半部分：白色区域 ========== */
.modal-bottom {
	height: 320rpx;
	background: #FFFFFF;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 0 38rpx;
	gap: 16rpx;
}

.qr-hint-top {
	font-size: 24rpx;
	font-weight: 600;
	color: #333333;
	letter-spacing: 1rpx;
}

.qr-code-img {
	width: 160rpx;
	height: 160rpx;
}

.qr-hint-bottom {
	font-size: 20rpx;
	color: #999999;
	text-align: center;
	line-height: 1.5;
}

/* ========== 游离关闭按钮 ========== */
.floating-close-btn {
	width: 58rpx;
	height: 58rpx;
	border-radius: 50%;
	border: 4rpx solid rgba(255, 255, 255, 0.6);
	background: transparent;
	display: flex;
	align-items: center;
	justify-content: center;
}

.floating-close-btn:active {
	transform: scale(0.9);
	border-color: rgba(255, 255, 255, 0.9);
}

.close-icon {
	width: 38rpx;
	height: 38rpx;
}
</style>
