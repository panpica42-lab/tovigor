<!--
 * 调整器械页面
 * 功能：训练前的器械调整和准备
 * 内容：四个器械示意卡片 + 参数显示 + 开始训练按钮
 -->
<!-- pages/partTraining/adjust-equipment.vue -->
<template>
  <view class="page">
    <!-- 顶部栏 -->
    <view class="header">
      <CommonBackButton class="back" />
      <text class="title">调整器械</text>
    </view>

    <view class="content">
      <!-- ① 浅灰托盘卡：左参数 + 右封面 -->
      <view class="adjust-card" v-if="adjustCard">
        <view class="param-col">
          <view class="param-line">
            <text class="k">高度：</text><text class="v">{{ params.height }}</text>
          </view>
          <view class="param-line">
            <text class="k">角度：</text><text class="v">{{ params.angle }}</text>
          </view>
          <view class="param-line">
            <text class="k">开启：</text><text class="v">{{ params.open }}</text>
          </view>
        </view>

        <view class="preview" @tap="playVideo(adjustCard.videoUrl)">
          <image class="preview-img" :src="adjustCard.poster" mode="aspectFill" />
          <text v-if="adjustCard.overlayText" class="preview-label">{{ adjustCard.overlayText }}</text>

          <!-- 播放按钮：右上角 -->
          <view class="play-corner">
            <image :src="icons.play" mode="scaleToFit" />
          </view>
        </view>
      </view>

      <!-- ② 标题行：左胶囊 + 中标题 + 右播放 -->
      <view class="section-row">
        <view class="chip">
          <image class="chip-icon" :src="section.chipIcon" mode="scaleToFit" />
          <text class="chip-text">{{ section.chipText }}</text>
        </view>

        <text class="section-title">{{ section.title }}</text>

        <view class="play-round" @tap="playVideo(section.videoUrl)">
          <image :src="icons.play" mode="scaleToFit" />
        </view>
      </view>

      <!-- ③ 大图卡 -->
      <view
        v-for="card in largeCards"
        :key="card.id"
        class="video-card large"
        @tap="playVideo(card.videoUrl)"
      >
        <image class="card-img" :src="card.poster" mode="aspectFill" />
        <view class="play-center">
          <image :src="icons.play" mode="scaleToFit" />
        </view>
      </view>

      <!-- ④ 两个半宽卡 -->
      <view class="grid">
        <view
          v-for="card in halfCards"
          :key="card.id"
          class="video-card half"
          :class="{ muted: card.overlayStyle === 'muted' }"
          @tap="playVideo(card.videoUrl)"
        >
          <image class="card-img" :src="card.poster" mode="aspectFill" />

          <text
            v-if="card.overlayText"
            class="card-tag"
            :class="{ light: card.overlayStyle === 'light' || card.overlayStyle === 'muted' }"
          >
            {{ card.overlayText }}
          </text>

          <view class="play-corner">
            <image :src="icons.play" mode="scaleToFit" />
          </view>
        </view>
      </view>
    </view>

    <!-- 底部按钮托盘 -->
    <view class="bottom-bar">
      <button class="start-btn" @tap="startTraining">开始训练</button>
    </view>

    <!-- 视频弹窗 -->
    <view v-if="showVideoModal" class="video-modal" @tap="closeVideo">
      <view class="video-box" @tap.stop>
        <view class="close-btn" @tap="closeVideo">×</view>

        <!-- key 用来确保每次打开都重新加载/从头播放 -->
        <video
          :key="videoKey"
          class="video"
          :src="videoSrc"
          controls
          autoplay
          object-fit="contain"
          :show-center-play-btn="false"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import CommonBackButton from '@/components/ui-box/common-back-button.vue'

/** 顶部参数（你后面接真实数据就改这里即可） */
const params = ref({
  height: 'K',
  angle: '5',
  open: '30°', // 你要 30% 也行
})

/** 资源（建议统一用 /static/...，跨端最稳） */
const icons = {
  play: '/static/icons/partTrainingActivity/startTraining/btn-vedio-play.svg',
  hand: '/static/icons/partTrainingActivity/startTraining/grip.jpg',
}

/** “握法展示 / 器材准备”标题行 */
const section = ref({
  chipText: '握法展示',
  chipIcon: icons.hand,
  title: '器材准备',
  videoUrl: '/static/icons/partTrainingActivity/startTraining/vedio-placeHolder.mp4',
})

/** 卡片数据（之后你换成接口数据也很顺） */
const cards = ref([
  {
    id: 'adjust-1',
    layout: 'adjust', // 第一块特殊布局
    poster: '/static/icons/partTrainingActivity/startTraining/adjust-1.jpg',
    videoUrl: '/static/icons/partTrainingActivity/startTraining/vedio-placeHolder.mp4',
    overlayText: '调整力量的视频',
    overlayStyle: 'dark',
  },
  {
    id: 'adjust-2',
    layout: 'large',
    poster: '/static/icons/partTrainingActivity/startTraining/adjust-2.jpg',
    videoUrl: '/static/icons/partTrainingActivity/startTraining/vedio-placeHolder.mp4',
  },
  {
    id: 'adjust-3',
    layout: 'half',
    poster: '/static/icons/partTrainingActivity/startTraining/adjust-3.jpg',
    videoUrl: '/static/icons/partTrainingActivity/startTraining/vedio-placeHolder.mp4',
    overlayText: '站立姿势',
    overlayStyle: 'dark',
  },
  {
    id: 'adjust-4',
    layout: 'half',
    poster: '/static/icons/partTrainingActivity/startTraining/adjust-4.jpg',
    videoUrl: '/static/icons/partTrainingActivity/startTraining/vedio-placeHolder.mp4',
    overlayText: '站姿肩关节环绕',
    overlayStyle: 'muted', // 右边那张更“淡”
  },
])

const adjustCard = computed(() => cards.value.find(c => c.layout === 'adjust'))
const largeCards = computed(() => cards.value.filter(c => c.layout === 'large'))
const halfCards = computed(() => cards.value.filter(c => c.layout === 'half'))

/** 视频弹窗控制 */
const showVideoModal = ref(false)
const videoSrc = ref('')
const videoKey = ref(0)

const playVideo = (url) => {
  videoSrc.value = url
  videoKey.value += 1
  showVideoModal.value = true
}

const closeVideo = () => {
  showVideoModal.value = false
  videoSrc.value = '' // 关闭时断流，避免后台继续播放
}

/** 开始训练 - 跳转到正式训练页 */
const startTraining = () => {
  uni.navigateTo({
    url: '/pages/partTraining/formal-training'
  })
}
</script>

<style scoped lang="scss">
.page {
  height: 100vh;
  background: #f2f3f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部栏 */
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 96rpx;
  padding-top: var(--status-bar-height);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f3f5;
}
.back {
  position: absolute;
  left: 24rpx;
  top: calc(var(--status-bar-height) + 18rpx);
}
.title {
  font-size: 36rpx;
  font-weight: 700;
  color: #222;
}

.content {
  flex: 1;
  min-height: 0;
  padding: 16rpx 24rpx 0;
}

/* ① 浅灰托盘卡 */
.adjust-card {
  background: #e9eaee;
  border-radius: 24rpx;
  padding: 16rpx;
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.param-col {
  width: 170rpx;
  padding-left: 6rpx;
}
.param-line {
  font-size: 26rpx;
  line-height: 44rpx;
  color: #333;
}
.k { color: #333; font-weight: 600; }
.v { color: #111; font-weight: 800; }

.preview {
  flex: 1;
  height: 150rpx;
  border-radius: 18rpx;
  overflow: hidden;
  position: relative;
  background: #ddd;
}
.preview-img {
  width: 100%;
  height: 100%;
  display: block;
}
.preview-label {
  position: absolute;
  left: 16rpx;
  top: 14rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 600;
  text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.35);
}

/* 播放按钮：右上角 */
.play-corner {
  position: absolute;
  right: 6rpx;
  top: 6rpx;
  width: 52rpx;
  height: 52rpx;
  border-radius: 26rpx;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}
.play-corner image { width: 30rpx; height: 30rpx; }

/* ② 标题行 */
.section-row {
  margin-top: 18rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.chip {
  height: 52rpx;
  padding: 0 18rpx;
  border-radius: 26rpx;
  background: #111;
  display: flex;
  align-items: center;
  gap: 10rpx;
  z-index: 1;
}
.chip-icon { width: 28rpx; height: 28rpx; border-radius: 6rpx; }
.chip-text { color: #ffffff; font-size: 24rpx; font-weight: 600; }

.section-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 30rpx;
  font-weight: 700;
  color: #222;
}

.play-round {
  width: 52rpx;
  height: 52rpx;
  border-radius: 26rpx;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}
.play-round image { width: 28rpx; height: 28rpx; }

/* 通用卡片 */
.video-card {
  margin-top: 14rpx;
  border-radius: 22rpx;
  overflow: hidden;
  position: relative;
  background: #ddd;
  box-shadow: 0 10rpx 22rpx rgba(0, 0, 0, 0.08);
}
.video-card.large { height: 260rpx; }
.video-card.half { height: 240rpx; flex: 1; }

.card-img {
  width: 100%;
  height: 100%;
  display: block;
}

.play-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 72rpx;
  height: 72rpx;
  border-radius: 36rpx;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}
.play-center image { width: 40rpx; height: 40rpx; }

/* 半卡左上角文字 */
.card-tag {
  position: absolute;
  left: 16rpx;
  top: 14rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.35);
}
.card-tag.light {
  color: rgba(0, 0, 0, 0.35);
  text-shadow: none;
}

.grid {
  margin-top: 14rpx;
  display: flex;
  gap: 14rpx;
}
.video-card.muted { opacity: 0.92; }

/* 底部按钮托盘 */
.bottom-bar {
  flex-shrink: 0;
  padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));
  background: #f2f3f5;
}
.start-btn {
  width: 100%;
  height: 92rpx;
  border-radius: 46rpx;
  background: #66d056;
  color: #fff;
  font-size: 34rpx;
  font-weight: 800;
}

/* 视频弹窗 */
.video-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.video-box {
  width: 690rpx;
  height: 388rpx; /* 16:9 */
  border-radius: 18rpx;
  overflow: hidden;
  background: #000;
  position: relative;
}
.close-btn {
  position: absolute;
  right: 12rpx;
  top: 8rpx;
  z-index: 2;
  width: 56rpx;
  height: 56rpx;
  border-radius: 28rpx;
  background: rgba(0,0,0,.35);
  color: #fff;
  font-size: 40rpx;
  line-height: 56rpx;
  text-align: center;
}
.video {
  width: 100%;
  height: 100%;
}
</style>

