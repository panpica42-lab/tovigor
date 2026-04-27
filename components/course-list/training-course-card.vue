<!--
	产品语义说明：
	这个组件对应用户在课程列表里肉眼看到的“单张训练课程卡片”。
	它不是“一整列课程卡片容器”，而是列表中的一个课程项。
	
	在部位训练页面里，外层页面会用 v-for 循环渲染多次这个组件，
	于是用户最终看到的是右侧一列或一组课程卡片；但这个文件本身只负责其中一张卡片的展示和点击交互。
	
	这张卡片主要负责展示：
	1. 课程封面
	2. 课程标题
	3. 课程时长
	4. 课程标签摘要
	5. 右上角播放按钮
-->
<template>
  <view class="course-card" @click="handleClick">
    <!-- 封面区域 -->
    <view class="cover-wrap">
      <image
        class="cover-img"
        :src="course.cover"
        mode="aspectFill"
      />
      <!-- 右上角播放按钮 -->
      <view class="play-btn" @click.stop="handlePlay">
        <view class="play-icon-triangle" />
      </view>
    </view>

    <!-- 文本区域 -->
    <view class="info">
        <view class="title-row">
          <text class="title" :number-of-lines="1">{{ course.title }}</text>
          <text class="duration">{{ course.duration }}</text>
        </view>

        <!-- 标签行：合并成一行 -->
        <view class="tag-row" v-if="tagLine">
          <text class="tag-text">{{ tagLine }}</text>
        </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

// 这里不定义课程数据本体，只接收父页面传进来的单门课程对象。
// 在当前部位训练链路里，这个 course 实际来自 pages/partTraining/course-data.js。
// 这个卡片只消费它展示所需的几个字段：cover、title、duration、tags。
const props = defineProps({
  course: {
    type: Object,
    required: true
  }
})

// 把 tags 拼成一行字符串：减脂塑形 ｜ 中级 ｜ 三角把手
const tagLine = computed(() => {
  const tags = props.course && props.course.tags
  if (!tags || !tags.length) return ''
  return tags.join(' ｜ ')
})

const emits = defineEmits(['click', 'play'])

const handleClick = () => {
  emits('click', props.course)
}

const handlePlay = () => {
  emits('play', props.course)
}
</script>


<style scoped>
.course-card {
  width: 100%;
  border-radius: 24rpx;
  overflow: hidden;
  background-color: #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.06);
}

/* 封面 */
.cover-wrap {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 75%; /* 4:3 比例，可按设计改 */
  overflow: hidden;
}

.cover-img {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

/* 播放按钮 */
.play-btn {
  position: absolute;
  right: 16rpx;
  top: 16rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  display: flex;

  background: rgba(255, 255, 255, 0.3); /* 毛玻璃效果背景 */
  backdrop-filter: blur(10rpx);  /* 模糊效果 */
  border: 2rpx solid rgba(255, 255, 255, 0.5);  /* 半透明边框 */
}
/* background-color: rgba(0, 0, 0, 0.65); 黑色半透明 */
.play-icon-triangle {
  width: 0;
  height: 0;
  border-top: 10rpx solid transparent;
  border-bottom: 10rpx solid transparent;
  border-left: 16rpx solid #ffffff;
  margin-left: 4rpx; /* 让三角形略微居中 */
}

/* 信息区域 */
.info {
  padding: 10rpx 12rpx 4rpx; 
}

.title-row {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  display: flex;
  margin-bottom: -10rpx;
}

.title {
  flex: 1;
  font-size: 22rpx;
  font-weight: 600;
  color: #111111;
  margin-right: 10rpx;
  line-height: 1.1;
}

.duration {
  font-size: 18rpx;
  color: #111111;
  line-height: 1.1;
}

/* 标签行 */
.tag-row {
  margin-top: 0;
  padding: 0;
}

.tag-text {
  font-size: 14rpx; 
  color: #999999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.1;
}
</style>

<!--
📝 播放按钮样式调整指南

1️⃣ 调整按钮位置：
   .play-btn {
     right: 16rpx;    /* 距离右边缘，可改为 8rpx / 24rpx */
     top: 16rpx;      /* 距离顶边缘，可改为 8rpx / 24rpx */
     
     /* 如果要放在左上角： */
     /* left: 16rpx; */
     /* right: auto; */
     
     /* 如果要放在底部中央： */
     /* left: 50%; */
     /* bottom: 16rpx; */
     /* top: auto; */
     /* transform: translateX(-50%); */
   }

2️⃣ 调整按钮大小：
   .play-btn {
     width: 56rpx;    /* 改为 48rpx / 64rpx / 72rpx */
     height: 56rpx;   /* 保持和 width 一致（圆形） */
   }

3️⃣ 调整背景样式：
   .play-btn {
     background-color: rgba(0, 0, 0, 0.65);  /* 黑色半透明 */
     
     /* 纯色背景示例： */
     /* background-color: #00C853; */  /* 绿色 */
     /* background-color: #1976D2; */  /* 蓝色 */
     
     /* 渐变背景示例： */
     /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
     
     /* 模糊毛玻璃效果（需要配合 backdrop-filter）： */
     /* background-color: rgba(255, 255, 255, 0.3); */
     /* backdrop-filter: blur(10rpx); */
   }

4️⃣ 调整按钮形状：
   .play-btn {
     border-radius: 50%;  /* 圆形 */
     
     /* 圆角方形： */
     /* border-radius: 12rpx; */
     
     /* 胶囊形（需要配合宽度调整）： */
     /* width: 80rpx; */
     /* border-radius: 28rpx; */
   }

5️⃣ 调整播放图标大小/颜色：
   .play-icon-triangle {
     border-top: 10rpx solid transparent;     /* 改为 8rpx / 12rpx / 14rpx */
     border-bottom: 10rpx solid transparent;  /* 改为 8rpx / 12rpx / 14rpx */
     border-left: 16rpx solid #ffffff;        /* 宽度改为 12rpx / 20rpx */
     
     /* 改变图标颜色（把 #ffffff 改为其他颜色）： */
     /* border-left: 16rpx solid #00C853; */
     
     margin-left: 4rpx;  /* 微调三角形居中，可改为 2rpx / 6rpx */
   }

6️⃣ 添加动效/阴影：
   .play-btn {
     /* 阴影效果： */
     box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
     
     /* 点击缩放效果： */
     transition: transform 0.2s ease;
   }
   
   .play-btn:active {
     transform: scale(0.9);
   }

7️⃣ 添加边框：
   .play-btn {
     border: 2rpx solid #ffffff;  /* 白色边框 */
     /* border: 2rpx solid rgba(255, 255, 255, 0.5); */  /* 半透明边框 */
   }

💡 快速预设方案：

【方案A - 大号醒目】
.play-btn { width: 72rpx; height: 72rpx; background: rgba(255, 255, 255, 0.95); }
.play-icon-triangle { border-left: 20rpx solid #1976D2; }

【方案B - 绿色主题】
.play-btn { background: #00C853; box-shadow: 0 4rpx 12rpx rgba(0, 200, 83, 0.4); }

【方案C - 底部居中】
.play-btn { left: 50%; bottom: 16rpx; top: auto; transform: translateX(-50%); }

【方案D - 毛玻璃】
.play-btn { background: rgba(255, 255, 255, 0.3); backdrop-filter: blur(10rpx); border: 2rpx solid rgba(255, 255, 255, 0.5); }
-->

