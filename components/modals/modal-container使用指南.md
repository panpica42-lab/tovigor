<!-- markdownlint-disable -->
# ModalContainer 通用弹窗组件使用指南

## 📦 组件概述

`modal-container.vue` 是一个高度灵活的通用弹窗容器组件，负责弹窗的**容器逻辑**（遮罩、动画、显示/隐藏、位置、样式配置），不包含任何具体业务内容。所有内容通过**插槽**完全自定义。

---

## 🎨 可 DIY 配置项

### 1. 基础显示控制
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `v-model:visible` | Boolean | `false` | 控制弹窗显示/隐藏（双向绑定） |
| `closeOnClickOverlay` | Boolean | `true` | 是否点击遮罩层关闭弹窗 |

### 2. 位置与动画
| 属性 | 类型 | 可选值 | 默认值 | 说明 |
|------|------|--------|--------|------|
| `position` | String | `center` / `top` / `bottom` | `center` | 弹窗出现位置 |
| `animation` | String | `fade` / `slide` / `zoom` | `fade` | 动画效果 |

**动画效果说明：**
- `fade` - 淡入淡出
- `slide` - 从指定方向滑入（配合 position 使用）
- `zoom` - 缩放弹出

### 3. 样式定制
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `width` | String/Number | `600` | 弹窗宽度（单位 rpx） |
| `maxHeight` | String/Number | `''` | 弹窗最大高度（单位 rpx，空则不限制） |
| `borderRadius` | String/Number | `24` | 弹窗圆角（单位 rpx） |
| `backgroundColor` | String | `#FFFFFF` | 弹窗背景色 |
| `overlayOpacity` | Number | `0.5` | 遮罩层透明度（0-1） |
| `zIndex` | Number | `9999` | 弹窗层级 |

### 4. 插槽系统
| 插槽名 | 说明 |
|--------|------|
| `header` | 头部区域（标题、关闭按钮等） |
| `default` | 主体内容区域 |
| `footer` | 底部区域（按钮组等） |

### 5. 事件
| 事件名 | 参数 | 说明 |
|--------|------|------|
| `@open` | - | 弹窗打开时触发 |
| `@close` | - | 弹窗关闭时触发 |
| `@overlay-click` | - | 点击遮罩层时触发 |
| `@update:visible` | Boolean | 显示状态变化（v-model 用） |

---

## 📚 基础使用示例

### 示例 1：简单居中弹窗
```vue
<template>
  <view>
    <button @click="showModal = true">打开弹窗</button>
    
    <ModalContainer v-model:visible="showModal">
      <view style="padding: 40rpx;">
        <text>这是一个简单的弹窗内容</text>
      </view>
    </ModalContainer>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import ModalContainer from '@/components/modal-container.vue'

const showModal = ref(false)
</script>
```

### 示例 2：使用插槽的完整弹窗
```vue
<ModalContainer 
  v-model:visible="showModal"
  :width="650"
  :border-radius="32"
  animation="zoom"
>
  <!-- 头部 -->
  <template #header>
    <view class="modal-header">
      <text class="title">提示</text>
      <view class="close-btn" @click="showModal = false">×</view>
    </view>
  </template>
  
  <!-- 主体内容 -->
  <view class="modal-body">
    <text>确定要删除这条记录吗？</text>
  </view>
  
  <!-- 底部按钮 -->
  <template #footer>
    <view class="modal-footer">
      <button @click="showModal = false">取消</button>
      <button @click="handleConfirm">确定</button>
    </view>
  </template>
</ModalContainer>
```

### 示例 3：底部抽屉弹窗
```vue
<ModalContainer 
  v-model:visible="showDrawer"
  position="bottom"
  animation="slide"
  :width="750"
  :border-radius="32"
  :max-height="800"
>
  <view class="drawer-content">
    <text>从底部滑出的抽屉内容</text>
  </view>
</ModalContainer>
```

### 示例 4：监听事件
```vue
<ModalContainer 
  v-model:visible="showModal"
  @open="handleOpen"
  @close="handleClose"
  @overlay-click="handleOverlayClick"
>
  <view>内容</view>
</ModalContainer>

<script setup>
const handleOpen = () => {
  console.log('弹窗打开了')
}

const handleClose = () => {
  console.log('弹窗关闭了')
}

const handleOverlayClick = () => {
  console.log('点击了遮罩层')
}
</script>
```

---

## 🚀 如何基于 ModalContainer 创建业务弹窗

### 方法 1：直接组合使用（推荐简单场景）
直接在页面中使用 `ModalContainer` + 自定义内容：

```vue
<ModalContainer v-model:visible="showConfirm" animation="zoom">
  <view class="my-confirm-modal">
    <text class="title">{{ title }}</text>
    <text class="content">{{ content }}</text>
    <view class="btn-group">
      <button @click="handleCancel">取消</button>
      <button @click="handleConfirm">确定</button>
    </view>
  </view>
</ModalContainer>
```

### 方法 2：封装成独立业务组件（推荐复用场景）
创建 `confirm-modal.vue` 封装 ModalContainer：

```vue
<!-- components/confirm-modal.vue -->
<template>
  <ModalContainer 
    v-model:visible="visible"
    animation="zoom"
    :width="600"
    @close="handleClose"
  >
    <view class="confirm-modal">
      <text class="title">{{ title }}</text>
      <text class="content">{{ content }}</text>
      <view class="btn-group">
        <button class="btn-cancel" @click="handleCancel">取消</button>
        <button class="btn-confirm" @click="handleConfirm">确定</button>
      </view>
    </view>
  </ModalContainer>
</template>

<script setup>
import ModalContainer from './modal-container.vue'

const props = defineProps({
  visible: Boolean,
  title: String,
  content: String
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const handleConfirm = () => {
  emit('confirm')
  emit('update:visible', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
.confirm-modal {
  padding: 40rpx;
}
.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}
/* ...更多样式 */
</style>
```

**使用封装后的组件：**
```vue
<ConfirmModal 
  v-model:visible="showConfirm"
  title="提示"
  content="确定要删除吗？"
  @confirm="handleDelete"
  @cancel="handleCancel"
/>
```

---

## 🎯 如何命令 AI 创建业务弹窗

### 场景 1：快速实现简单弹窗
**你的指令：**
> "基于 ModalContainer 帮我创建一个确认删除弹窗，包含标题、内容文字、确定和取消按钮。直接写在当前页面中使用，不需要单独封装组件。"

**AI 会做什么：**
- 在当前页面添加 `<ModalContainer>` 使用代码
- 添加自定义内容结构（标题、内容、按钮）
- 添加对应的样式和事件处理逻辑

---

### 场景 2：封装可复用的业务组件
**你的指令：**
> "基于 ModalContainer 封装一个通用的确认弹窗组件 `confirm-modal.vue`，支持传入 title、content、confirmText、cancelText 等参数，有确认和取消两个事件。组件放在 components 目录。"

**AI 会做什么：**
1. 创建 `components/confirm-modal.vue` 文件
2. 内部使用 `<ModalContainer>` 作为容器
3. 实现 props、emits、样式
4. 提供使用示例代码

---

### 场景 3：复杂业务弹窗（如评估完成弹窗）
**你的指令：**
> "基于 ModalContainer 创建一个力量评估完成弹窗 `assessment-complete-modal.vue`：
> - 上半部分绿色渐变背景，显示完成的部位名称（如"已完成肩部"）
> - 有倒计时文案"5S后自动跳转下一部位"，数字每秒递减
> - 底部两个按钮："直接开始"（绿色）和"取消"（灰色）
> - 支持传入当前部位和下一部位参数
> - 倒计时结束自动触发事件"

**AI 会做什么：**
1. 创建组件文件，内部使用 `<ModalContainer>` + 自定义插槽内容
2. 实现倒计时逻辑（`setInterval`）
3. 实现部位名称动态显示
4. 实现按钮事件和样式
5. 提供完整的 props、emits、使用示例

---

### 场景 4：修改现有弹窗样式
**你的指令：**
> "把 `assessment-complete-modal.vue` 的圆角改成 40rpx，遮罩透明度改为 0.7，动画改成从底部滑入。"

**AI 会做什么：**
- 修改 `<ModalContainer>` 的 `border-radius`、`overlay-opacity`、`position`、`animation` 等属性

---

## 📋 指令模板参考

### 创建新弹窗组件
```
基于 ModalContainer 创建一个 [业务名称] 弹窗组件 [文件名.vue]：
- 布局：[描述布局结构]
- 功能：[列出功能点]
- 参数：[需要传入的参数]
- 事件：[需要触发的事件]
- 样式：[特殊样式要求]
```

### 修改现有弹窗
```
修改 [组件名.vue] 弹窗：
- 将 [具体部分] 改成 [新的样式/逻辑]
- 添加 [新功能]
- 调整 [某个配置项]
```

### 快速使用（不封装）
```
在当前页面使用 ModalContainer 实现一个 [功能描述] 弹窗，
包含 [内容列表]，样式要求 [样式描述]。
```

---

## 💡 最佳实践建议

### 1. 何时直接使用 ModalContainer
- ✅ 页面中只用一次的弹窗
- ✅ 结构简单的临时弹窗
- ✅ 快速原型验证

### 2. 何时封装业务组件
- ✅ 多个页面需要复用的弹窗
- ✅ 复杂逻辑的弹窗（如倒计时、表单验证等）
- ✅ 需要维护一致性的标准弹窗（确认框、提示框等）

### 3. 命名规范
- 业务弹窗组件命名：`[业务名]-modal.vue`（如 `confirm-modal.vue`、`assessment-complete-modal.vue`）
- 导入时使用 PascalCase：`import ConfirmModal from '@/components/confirm-modal.vue'`

### 4. 组件层级
```
ModalContainer（通用容器）
  ↓
StandardModal（标准对话框：标题+内容+按钮）
  ↓
ConfirmModal / AlertModal / FormModal（具体业务弹窗）
  ↓
AssessmentCompleteModal / OrderDetailModal（页面专用弹窗）
```

---

## 🔧 常见问题

### Q1：弹窗内容太长怎么办？
设置 `max-height` 属性，内容会自动滚动：
```vue
<ModalContainer :max-height="1000">
  <!-- 长内容 -->
</ModalContainer>
```

### Q2：如何禁止点击遮罩关闭？
设置 `close-on-click-overlay` 为 `false`：
```vue
<ModalContainer :close-on-click-overlay="false">
```

### Q3：如何自定义遮罩透明度？
```vue
<ModalContainer :overlay-opacity="0.7">
```

### Q4：如何实现多层弹窗？
设置不同的 `z-index`：
```vue
<ModalContainer :z-index="9999">第一层</ModalContainer>
<ModalContainer :z-index="10000">第二层</ModalContainer>
```

### Q5：已有的弹窗组件（如 assessment-complete-modal）需要改成基于 ModalContainer 吗？
- 如果现有组件工作正常且不需要大改，**不必强制重构**
- 如果需要新增类似弹窗或修改现有弹窗，**推荐使用 ModalContainer**
- 可以逐步迁移，新弹窗用 ModalContainer，旧弹窗保持不变

---

## 📦 现有项目中的弹窗资产

| 组件名 | 类型 | 是否基于 ModalContainer | 建议 |
|--------|------|-------------------|------|
| `modal-general.vue` | 通用弹窗 | ❌ 独立实现 | 可保留，功能单一时使用 |
| `assessment-complete-modal.vue` | 业务弹窗 | ❌ 独立实现 | 工作正常可保留，需修改时考虑重构 |
| `modal-container.vue` | 通用容器 | ✅ 新创建 | **未来所有新弹窗优先使用此组件** |

---

## 🎉 总结

- **ModalContainer 是什么？** 配置化容器，提供标准的弹窗样式和行为
- **怎么用？** 通过插槽 + 配置项自由组合
- **怎么扩展？** 在 ModalContainer 基础上封装业务组件
- **怎么命令 AI？** 描述清楚：布局、功能、参数、事件、样式

**核心原则：ModalContainer 负责"弹窗怎么弹"，你负责"弹窗长什么样"！**

