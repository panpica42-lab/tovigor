<!-- 这是通用模态框组件 -->
<template>
  <view v-if="show" class="modal-mask" @touchmove.stop.prevent @click="handleMaskClick">
    <view class="modal-box" @click.stop>
      <!-- 顶部装饰横条 -->
      <view class="modal-decoration-bar"></view>
      
      <!-- 标题 -->
      <view v-if="title" class="modal-title">
        <text>{{ title }}</text>
      </view>
      
      <!-- 内容区域 - 支持插槽 -->
      <view class="modal-content">
        <slot>
          <text class="modal-text">{{ content }}</text>
        </slot>
      </view>
      
      <!-- 按钮区域 -->
      <view class="modal-footer">
        <view v-if="showCancel" class="modal-btn modal-btn-cancel" @click="handleCancel">
          <text>{{ cancelText }}</text>
        </view>
        <view class="modal-btn modal-btn-confirm" @click="handleConfirm">
          <text>{{ confirmText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ModalGeneral',
  props: {
    // 是否显示
    show: {
      type: Boolean,
      default: false
    },
    // 标题
    title: {
      type: String,
      default: ''
    },
    // 内容文本（当不使用插槽时）
    content: {
      type: String,
      default: ''
    },
    // 是否显示取消按钮
    showCancel: {
      type: Boolean,
      default: false
    },
    // 确认按钮文字
    confirmText: {
      type: String,
      default: '确定'
    },
    // 取消按钮文字
    cancelText: {
      type: String,
      default: '取消'
    },
    // 点击遮罩是否关闭
    maskClosable: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleConfirm() {
      this.$emit('confirm');
      this.$emit('update:show', false);
    },
    handleCancel() {
      this.$emit('cancel');
      this.$emit('update:show', false);
    },
    handleMaskClick() {
      if (this.maskClosable) {
        this.$emit('update:show', false);
      }
    }
  }
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 0 60rpx;
}

.modal-box {
  position: relative;
  width: 100%;
  max-width: 600rpx;
  background: linear-gradient(180deg, #E8910C 0%, #F5B041 35%, #FCDC97 70%, #FFF8E7 100%);
  border-radius: 32rpx;
  padding: 60rpx 40rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
  overflow: hidden;
}

/* 顶部装饰横条 */
.modal-decoration-bar {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120rpx;
  height: 10rpx;
  background: linear-gradient(90deg, #8D6E63, #6D4C41, #8D6E63);
  border-radius: 0 0 10rpx 10rpx;
}

@keyframes modalSlideIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #000000;
  text-align: center;
  margin-bottom: 30rpx;
  line-height: 1.4;
}

.modal-content {
  margin-bottom: 40rpx;
}

.modal-text {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.8;
  text-align: left;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  justify-content: center;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  transition: all 0.2s;
}

.modal-btn:active {
  transform: scale(0.95);
}

.modal-btn-cancel {
  background-color: rgba(255, 255, 255, 0.5);
  color: #333333;
}

.modal-btn-confirm {
  background-color: #333333;
  color: #FFFFFF;
}

/* 单按钮时占满宽度 */
.modal-footer .modal-btn:only-child {
  flex: none;
  width: 100%;
}
</style>
