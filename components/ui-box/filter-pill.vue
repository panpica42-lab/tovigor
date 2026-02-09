<template>
  <view
    class="filter-pill"
    :class="{ 'filter-pill--active': active }"
    @click="handleClick"
  >
    <text class="label">{{ label }}</text>

    <view class="right-wrap">
      <!-- 右侧内容：当前选中值（可选） -->
      <text v-if="value" class="value">{{ value }}</text>

      <!-- 下拉箭头 -->
      <view v-if="showArrow" class="arrow-icon" />
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  label: { type: String, required: true }, // “性别”
  value: { type: String, default: '' },    // “男 / 女 / 全部”
  active: { type: Boolean, default: false },
  showArrow: { type: Boolean, default: true }
})

const emits = defineEmits(['click'])

const handleClick = () => {
  emits('click')
}
</script>

<style scoped>
.filter-pill {
  height: 36rpx;
  padding: 0 10rpx;
  border-radius: 18rpx;
  background: rgba(229, 229, 229, 0.4);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
}

.filter-pill--active {
  background: rgba(101, 177, 254, 0.2);
}

.label {
  font-size: 18rpx;
  color: #333333;
  font-weight: 500;
}

.right-wrap {
  flex-direction: row;
  align-items: center;
  display: flex;
}

.value {
  font-size: 16rpx;
  color: #888888;
  margin-right: 4rpx;
}

/* 简单的下拉小箭头 */
.arrow-icon {
  width: 0;
  height: 0;
  border-left: 5rpx solid transparent;
  border-right: 5rpx solid transparent;
  border-top: 6rpx solid #999999;
}
</style>
