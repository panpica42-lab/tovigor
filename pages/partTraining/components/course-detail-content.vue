<!--
	产品语义说明：
	这个组件对应用户肉眼看到的“课程详情主体界面”。
	它用于部位训练里点击课程卡片后进入的详情页，负责渲染课程标题、封面图、标签与时长、
	课程简介、注意事项、动作预览，以及底部“开始训练”按钮这一整块内容。
	如果后续 AI 推荐结果弹窗要复用课程详情展示，复用的也应该主要是这一块内容。
-->
<template>
	<view class="course-detail" :class="{ 'course-detail--embedded': embedded }">
		<!-- 顶部导航栏 -->
		<view v-if="showHeader" class="header">
			<CommonBackButton class="back-btn-position" />
			<text class="header-title">{{ course.title }}</text>
		</view>

		<!-- 主要内容区域 -->
		<view class="content">
			<!-- 封面卡片区域 -->
			<view class="cover-card">
				<view class="cover-section">
					<image 
						class="cover-image" 
						:src="course.cover" 
						mode="aspectFill"
					/>
					
					<!-- 暗角渐变蒙层 -->
					<view class="cover-overlay"></view>
					
					<!--课程简介卡片 intro-card
						这是一个浮动在封面图右上角的白色半透明卡片
						结构：白色卡片容器 > 彩色横线 > "课程简介"标题 > 简介文字内容 
						装饰性彩色横线（橙红色渐变） intro-line
						卡片标题文字："课程简介"  intro-title
						卡片正文内容：显示课程的详细介绍文字  intro-text -->
					<view v-if="showIntroCard" class="intro-card">
						<view class="intro-line"></view>
						<text class="intro-title">课程简介</text>
						<text class="intro-text">{{ course.intro }}</text>
					</view>
				
					<!-- 标签和时长行（在封面底部） -->
					<view class="tags-duration-overlay">
					<view class="tags-wrap">
						<template v-for="(tag, index) in course.tags" :key="index">
						<text class="tag-item">{{ tag }}</text>
						<view
							v-if="index < course.tags.length - 1"
							class="tag-divider"
							/>
						</template>
					</view>
						<text class="duration-text">{{ course.duration }}</text>
					</view>
				</view>
			</view>

			<!-- 底部内容区域 -->
			<view class="bottom-content">
				<!-- 注意事项卡片 -->
				<view class="notice-card">
					<view class="notice-header">
						<view class="notice-icon"></view>
						<text class="notice-title">注意事项</text>
					</view>
					<view class="notice-list">
						<view 
							v-for="(notice, index) in course.noticeList" 
							:key="index" 
							class="notice-item"
						>
							<text class="notice-number">{{ index + 1 }}.</text>
							<text class="notice-content">{{ notice }}</text>
						</view>
					</view>
				</view>

				<!-- 动作预览区域 -->
				<view class="preview-section">
					<text class="preview-title">动作预览</text>
					<view class="preview-list">
						<view 
							v-for="preview in course.previews.slice(0, 4)" 
							:key="preview.id" 
							class="preview-item"
						>
							<image 
								class="preview-image" 
								:src="preview.cover" 
								mode="aspectFill"
							/>
							<text class="preview-name">{{ preview.name }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部开始训练按钮 -->
		<view class="bottom-bar">
			<view class="start-btn" @click="startTraining">
				<text class="start-btn-text">开始训练</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import CommonBackButton from '@/components/ui-box/common-back-button.vue'

// 定义课程详情数据接口（使用 JSDoc 类型注释）
/**
 * @typedef {Object} CourseDetail
 * @property {string | number} id
 * @property {string} title
 * @property {string} cover
 * @property {string[]} tags
 * @property {string} duration
 * @property {string} intro
 * @property {string[]} noticeList
 * @property {Array<{id: string | number, name: string, cover: string}>} previews
 */

// 接收 props
const props = defineProps({
	// 当前要展示的课程对象。
	// 也就是用户此刻正在看的那一门课程的完整信息。
	course: {
		type: Object,
		required: true
	},
	// 是否显示页面顶部那一行“返回按钮 + 标题”。
	// 独立详情页需要显示，弹窗里的推荐结果不需要显示。
	showHeader: {
		type: Boolean,
		default: true
	},
	// 是否显示封面图右上角那张“课程简介”小浮卡。
	// 独立详情页显示会比较完整；弹窗里为了更像设计稿，先关掉。
	showIntroCard: {
		type: Boolean,
		default: true
	},
	// embedded = 嵌入模式。
	// 产品上它表示：这份课程详情内容不是作为“一个完整独立页面”出现，
	// 而是被“装进别的容器里”显示，比如 AI 推荐结果弹窗。
	//
	// embedded 为 false：
	// 用户看到的是正常详情页，点“开始训练”后组件自己负责跳转。
	//
	// embedded 为 true：
	// 用户看到的是弹窗里的详情内容，组件只负责把内容画出来，
	// 点击“开始训练”时不自己跳转，而是把事件抛给外层弹窗或页面处理。
	embedded: {
		type: Boolean,
		default: false
	}
})
const emit = defineEmits(['start'])

// 开始训练
const startTraining = () => {
	// 嵌入模式下，这个组件只负责显示内容，不直接做页面跳转。
	// 让外层弹窗/页面决定后续动作，职责更清晰。
	if (props.embedded) {
		emit('start', props.course)
		return
	}

	console.log('开始训练课程:', props.course.title)
	// 跳转到热身页面
	uni.navigateTo({
		url: '/pages/partTraining/warm-up-page?courseId=' + props.course.id
	})
}
</script>

<style scoped lang="scss">
.course-detail {
	width: 100%;
	min-height: 100vh;
	background-color: #F5F5F5;
	display: flex;
	flex-direction: column;
}

.course-detail--embedded {
	height: 100%;
	min-height: auto;
	background-color: transparent;
}

/* 顶部导航栏 */
.header {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 88rpx;
	padding: 0 24rpx;
	background-color: #F5F5F5;
	z-index: 10;
}

.back-btn-position {
	position: absolute;
	left: 24rpx;
	top: 50%;
	transform: translateY(-50%);
}

.header-title {
	font-size: 34rpx;
	font-weight: 700;
	color: #333333;
	text-align: center;
}

/* 主要内容区域 */
.content {
	flex: 1;
	display: flex;
	flex-direction: column;
	padding: 0 24rpx;
	overflow: hidden;
}

/* 封面卡片容器 */
.cover-card {
	margin-top: 12rpx;
	margin-bottom: 16rpx;
	flex-shrink: 0;
}

/* 封面区域 */
.cover-section {
	position: relative;
	width: 100%;
	height: 0;
	padding-bottom: 55%;
	border-radius: 20rpx;
	overflow: hidden;
	box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.1);
}

.cover-image {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

/* 暗角渐变蒙层 */
.cover-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.2) 100%);
	pointer-events: none;
}

/* 课程简介卡片 */
/* 整个白色半透明卡片的样式，浮动在封面图右上角 */
.intro-card {
	position: absolute;      /* 绝对定位，相对于 .cover-section 容器 */
	right: 24rpx;            /* 距离封面右边 24rpx */
	top: 140rpx;              /* 距离封面顶部 60rpx */
	width: 16%;              /* 卡片宽度占封面宽度的 16%（缩小了） */
	padding: 8rpx;           /* 卡片内边距，控制内容与边框的距离（缩小了） */
	background: rgba(255, 255, 255, 0.4);  /* 白色半透明背景 */
	//backdrop-filter: blur(10rpx);           /* 毛玻璃模糊效果 */
	border-radius: 12rpx;    /* 圆角大小 */
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);  /* 阴影效果 */
}

/* 卡片顶部的装饰性彩色横线 */
.intro-line {
	width: 40rpx;            /* 横线宽度 */
	height: 5rpx;            /* 横线高度（粗细） */
	background: linear-gradient(90deg, #FF6B6B, #FF8E53);  /* 橙红色渐变 */
	border-radius: 3rpx;     /* 横线的圆角 */
	margin: 0 auto 0rpx;     /* 水平居中，底部留 8rpx 间距 */
}

/* 卡片标题："课程简介"这几个字 */
.intro-title {
	display: block;          /* 块级元素，独占一行 */
	font-size: 18rpx;        /* 字体大小 */
	font-weight: 600;        /* 字体粗细（中等加粗） */
	color: #333333;          /* 文字颜色（深灰色） */
	margin-bottom: 0rpx;     /* 与下方正文的间距 */
	text-align: center;      /* 文字居中对齐 */
}

/* 卡片正文内容：课程的详细介绍文字 */
.intro-text {
	display: block;          /* 块级元素，独占一行 */
	font-size: 12rpx;        /* 字体大小（比标题小） */
	line-height: 1.4;        /* 行高，控制行与行之间的间距 */
	color: #666666;          /* 文字颜色（中灰色，比标题浅） */
	text-align: center;      /* 文字居中对齐 */
}

/* 标签和时长（封面底部浮层） */
.tags-duration-overlay {
	position: absolute;
	bottom: 10rpx;           /* 距离底部留白 */
	left: 10rpx;             /* 距离左侧留白 */
	right: 10rpx;            /* 距离右侧留白 */
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10rpx 10rpx;    /* 内边距 */
	background: rgba(255, 255, 255, 0.4);  /* 半透明白色背景 */
	border-radius: 20rpx;    /* 圆角 */
	//backdrop-filter: blur(8rpx);  /* 背景模糊效果 */
	color: #ffffff;                        // 里面所有 text 默认变成白色
}

/* 左侧标签区域：一排文字 + 竖线 */
.tags-wrap {
	flex: 1;  
	display: flex;  /* 横向排列标签 */
	align-items: center;  /* 垂直居中 */
}

.tag-item {
	display: inline-flex;  /* 行内块元素，横向排列 */
	align-items: center;
	font-size: 20rpx;
	//color: #333333;          /* 深色文字（白色背景上） */
	color: #ffffff;
	font-weight: 600;
}

/* 中间的竖线分隔符 */
.tag-divider {
  width: 5rpx;                           /* 粗细 */
  height: 26rpx;                         /* 高度，比文字略高一点 */
  margin: 0 12rpx;                       /* 左右留一点空隙 */
  border-radius: 999rpx;                   /* 圆角，变成胶囊形状 */
  background: rgb(255, 255, 255);  /* 白色带一点透明 */
}

/* 右侧分钟数 */
.duration-text {
	font-size: 22rpx;	   /* 字体大小 */
	font-weight: 700;     /* 加粗字体 */
	color: #FF6B35;    /* 橙红色高亮时长 */
	margin-left: 12rpx;
	flex-shrink: 0;   	/* 不允许缩小 */
}

/* 底部内容区域 */
.bottom-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-height: 0;
	overflow: hidden;
}

/* 注意事项卡片 */
.notice-card {
	margin-bottom: 12rpx;
	padding: 20rpx;
	background-color: #FFFFFF;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
	flex-shrink: 0;
}

.notice-header {
	display: flex;
	align-items: center;
	margin-bottom: 12rpx;
}

.notice-icon {
	width: 32rpx;
	height: 32rpx;
	border: 3rpx solid #FF6B6B;
	border-radius: 50%;
	margin-right: 10rpx;
	position: relative;
	flex-shrink: 0;
}

.notice-icon::after {
	content: '!';
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	font-size: 20rpx;
	font-weight: bold;
	color: #FF6B6B;
}

.notice-title {
	font-size: 24rpx;
	font-weight: 700;
	color: #333333;
}

.notice-list {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.notice-item {
	display: flex;
	align-items: flex-start;
}

.notice-number {
	font-size: 20rpx;
	font-weight: 600;
	color: #FF6B6B;
	margin-right: 6rpx;
	flex-shrink: 0;
	line-height: 1.4;
}

.notice-content {
	flex: 1;
	font-size: 20rpx;
	line-height: 1.4;
	color: #555555;
}

/* 动作预览区域 */
.preview-section {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-height: 0;
}

.preview-title {
	display: block;
	font-size: 24rpx;
	font-weight: 700;
	color: #333333;
	margin-bottom: 12rpx;
	flex-shrink: 0;
}

.preview-list {
	display: flex;
	gap: 12rpx;
	flex: 1;
}

.preview-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.preview-image {
	width: 100%;
	aspect-ratio: 1;
	border-radius: 12rpx;
	background-color: #F0F0F0;
	margin-bottom: 6rpx;
}

.preview-name {
	font-size: 18rpx;
	color: #555555;
	text-align: center;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	width: 100%;
}

/* 底部占位 */
.bottom-spacer {
	height: 140rpx;
}

/* 底部按钮栏 */
.bottom-bar {
	flex-shrink: 0;
	padding: 16rpx 24rpx;
	padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
	background-color: #F5F5F5;
}

.start-btn {
	width: 100%;
	height: 72rpx;
	background: linear-gradient(90deg, #4CAF50, #66BB6A);
	border-radius: 36rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	box-shadow: 0 4rpx 16rpx rgba(76, 175, 80, 0.3);
}

.start-btn:active {
	opacity: 0.9;
}

.start-btn-text {
	font-size: 28rpx;
	font-weight: 700;
	color: #FFFFFF;
}

.course-detail--embedded .content {
	padding: 0;
	overflow: hidden;
}

.course-detail--embedded .cover-card {
	margin-top: 0;
	margin-bottom: 12rpx;
}

.course-detail--embedded .cover-section {
	padding-bottom: 45%;
	border-radius: 18rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.course-detail--embedded .tags-duration-overlay {
	bottom: 8rpx;
	left: 8rpx;
	right: 8rpx;
	padding: 8rpx 10rpx;
	border-radius: 16rpx;
}

.course-detail--embedded .tag-item {
	font-size: 19rpx;
}

.course-detail--embedded .tag-divider {
	height: 20rpx;
	margin: 0 8rpx;
}

.course-detail--embedded .duration-text {
	font-size: 21rpx;
}

.course-detail--embedded .notice-card {
	margin-bottom: 12rpx;
	padding: 16rpx 18rpx;
	border-radius: 18rpx;
}

.course-detail--embedded .notice-header {
	margin-bottom: 10rpx;
}

.course-detail--embedded .notice-icon {
	width: 28rpx;
	height: 28rpx;
	margin-right: 8rpx;
}

.course-detail--embedded .notice-icon::after {
	font-size: 16rpx;
}

.course-detail--embedded .notice-title {
	font-size: 23rpx;
}

.course-detail--embedded .notice-list {
	gap: 6rpx;
}

.course-detail--embedded .notice-number {
	font-size: 19rpx;
}

.course-detail--embedded .notice-content {
	font-size: 19rpx;
	line-height: 1.35;
}

.course-detail--embedded .bottom-content {
	flex: 1;
	overflow: hidden;
}

.course-detail--embedded .preview-section {
	flex: none;
}

.course-detail--embedded .preview-title {
	font-size: 23rpx;
	margin-bottom: 10rpx;
}

.course-detail--embedded .preview-list {
	flex: none;
	gap: 10rpx;
}

.course-detail--embedded .preview-image {
	height: 98rpx;
	aspect-ratio: auto;
	margin-bottom: 5rpx;
}

.course-detail--embedded .preview-name {
	font-size: 17rpx;
}

.course-detail--embedded .bottom-bar {
	padding: 16rpx 0 0;
	padding-bottom: 0;
	background-color: transparent;
}

.course-detail--embedded .start-btn {
	height: 66rpx;
	border-radius: 33rpx;
}

.course-detail--embedded .start-btn-text {
	font-size: 27rpx;
}
</style>
