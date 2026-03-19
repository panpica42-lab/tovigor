<template>
	<!-- 整屏盖住，任何点击都算"有人来了" -->
	<view class="idle-page">
		<video
			class="bg-video"
			src="/static/icons/ads/idle.mp4"
			autoplay
			loop
			muted
			:controls="false"
			:show-center-play-btn="false"
			:show-fullscreen-btn="false"
			:show-progress="false"
			:enable-progress-gesture="false"
			:show-mute-btn="false"
			:enable-play-gesture="false"
			:vslide-gesture="false"
			:show-casting-button="false"
			object-fit="cover"
		>
			<!-- cover-view 才能覆盖原生 video 组件 -->
			<cover-view class="touch-mask" @click="goHome"></cover-view>
		</video>
		
		<!-- 预加载关键图片（不可见） -->
		<view class="preload-images">
			<image v-for="img in preloadList" :key="img" :src="img" mode="aspectFit" />
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 首页关键图片列表 - 预加载
const preloadList = ref([
	'/static/icons/homeActivity/bg_free_training.svg',
	'/static/icons/homeActivity/bg_body_training.svg',
	'/static/icons/homeActivity/bg_smart_assess.svg',
	'/static/icons/homeActivity/btn_usage_guide.svg',
	'/static/icons/homeActivity/ic_control_light.svg',
	'/static/icons/homeActivity/ic_control_wifi.svg',
	'/static/icons/homeActivity/ic_control_voice.svg',
	'/static/icons/homeActivity/ic_control_bluetooth.svg',
	'/static/icons/homeActivity/ic_setting_system.svg',
	'/static/icons/homeActivity/ic_control_on-off.svg',
	'/static/icons/games/flappyBirdGame/ic_bird.png',
	'/static/icons/partTrainingActivity/ic_1x.jpg',
	'/static/icons/partTrainingActivity/ic_2x.jpg',
	'/static/icons/partTrainingActivity/ic_4x.jpg'
])

// 防止重复触发
let isNavigating = false

const goHome = () => {
	// 防止快速多次点击
	if (isNavigating) return
	isNavigating = true
	
	// 使用 redirectTo 替代 reLaunch，性能更好
	// 因为 idle 页面不需要保留在页面栈中
	uni.redirectTo({
		url: '/pages/index/index',
		fail: () => {
			// 如果 redirectTo 失败（比如 index 是 tabBar 页面），降级用 reLaunch
			uni.reLaunch({
				url: '/pages/index/index'
			})
		},
		complete: () => {
			// 重置标志，以防跳转失败后用户再次点击
			setTimeout(() => {
				isNavigating = false
			}, 500)
		}
	})
}

onMounted(() => {
	console.log('[idle] 开始预加载首页图片资源...')
	// 注意：uni.preloadPage 对 Vue 页面不支持，只能依赖图片预加载
})
</script>

<style scoped>
.idle-page {
	width: 100vw;
	height: 100vh;
	background-color: #000;
	overflow: hidden;
	position: relative;
}

.bg-video {
	width: 100%;
	height: 100%;
}

/* cover-view 遮罩层 - 覆盖整个视频，拦截所有触摸事件 */
.touch-mask {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	/* cover-view 需要有背景才能响应点击，用极低透明度 */
	background-color: rgba(0, 0, 0, 0.01);
}

/* 预加载图片容器 - 不可见但会触发图片加载 */
.preload-images {
	position: absolute;
	left: -9999rpx;
	top: -9999rpx;
	width: 1rpx;
	height: 1rpx;
	overflow: hidden;
	opacity: 0;
	pointer-events: none;
}

.preload-images image {
	width: 1rpx;
	height: 1rpx;
}
</style>
