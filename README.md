# Tovigor 健身应用

基于 **uni-app (Vue 3)** 的智能健身应用，运行在 HBuilderX 中，主要目标平台是 Android App。核心特点是通过自定义 UTS 插件与硬件设备（串口通信）集成，实现智能健身设备控制。

## 技术栈

- **框架**: uni-app Vue 3 (Composition API + script setup)
- **构建工具**: HBuilderX + @dcloudio/uni-cli
- **平台**: Android App (app-android)，H5 仅用于 UI 调试
- **原生集成**: UTS 插件系统 + Kotlin AAR 库
- **图表库**: qiun-data-charts

## 目录结构

```
tovigor_v1/
├── pages/                        # 页面目录
│   ├── idle/                     # 待机页（应用入口）
│   ├── index/                    # 首页（卡片式导航 + 控制面板）
│   ├── freeTraining/             # 自由训练（力量旋钮控制）
│   ├── partTraining/             # 部位训练模块
│   │   ├── part-training.vue         # 部位选择
│   │   ├── part-training-detail-adapter.vue  # 课程列表
│   │   ├── warm-up-page.vue           # 热身页
│   │   ├── adjust-equipment.vue       # 器材调整
│   │   ├── formal-training.vue        # 正式训练
│   │   ├── cool-down-page.vue         # 拉伸放松
│   │   └── components/                # 模块专属组件
│   │       ├── ai-recommend.vue           # AI推荐
│   │       ├── course-detail.vue          # 课程详情
│   │       └── training-filter-sidebar.vue # 筛选侧边栏
│   ├── smartAssess/              # 智能评估模块
│   │   ├── first-skip.vue            # 评估入口（三大评估选择）
│   │   ├── body-function-assess/     # 身体机能评估
│   │   │   └── body-function-assess.vue
│   │   ├── body-strength-assess/     # 部位力量评估
│   │   │   ├── body-strength-assess-new.vue  # 评估入口页
│   │   │   ├── body-strength-assess.vue      # 旧版（代码资源库）
│   │   │   └── components/
│   │   │       └── body-part-card.vue        # 部位卡片组件
│   │   └── body-posture-assess/      # 体态姿势评估
│   │       └── body-posture-assess.vue
│   └── serial-test/              # 串口调试工具
├── components/                   # 全局公共组件
│   ├── modals/                       # 弹窗组件
│   ├── ui-box/                       # 通用UI组件
│   └── course-list/                  # 课程列表组件
├── uni_modules/                  # uni-app 插件
│   ├── wzl-serialbridge/             # 串口通信 UTS 插件
│   └── qiun-data-charts/             # 图表组件库
├── utils/                        # 工具函数
│   ├── coachManager.js               # AI教练管理器
│   └── serialService.js              # 串口通信服务
├── static/                       # 静态资源
│   └── icons/                        # 图标资源
├── docs/                         # 项目文档
│   ├── 开发日志/                     # 开发日志
│   ├── 通信模块/                     # 串口通信文档
│   └── 其他/                         # 其他文档
├── manifest.json                 # 应用配置
├── pages.json                    # 页面路由配置
└── uni.scss                      # 全局样式变量
```

## 公共组件说明

### modals - 弹窗组件

| 组件名 | 说明 | 主要功能 |
|--------|------|----------|
| `modal-container-light.vue` | 轻量级弹窗容器 | 仅提供遮罩层，无预设样式，完全自定义 |
| `modal-base.vue` | 基础弹窗容器 | 提供遮罩+居中盒子，样式可配置 |
| `modal-dialog.vue` | 对话框弹窗 | 完整对话框结构（标题+内容+按钮），适用于确认框、提示框 |
| `usage-guide-modal.vue` | 使用指南弹窗 | 产品使用说明、视频教程列表 |
| `coach-detail-modal.vue` | AI教练详情弹窗 | 展示教练信息，支持切换教练 |
| `assessment-complete-modal.vue` | 评估完成弹窗 | 评估完成提示，带自动倒计时跳转 |

弹窗组件层级关系：
```
ModalContainerLight（极简容器）
  → ModalBase（基础容器）
    → 业务弹窗组件
```

### ui-box - 通用UI组件

| 组件名 | 说明 | 使用场景 |
|--------|------|----------|
| `common-back-button.vue` | 返回按钮 | 页面左上角返回，支持自定义点击事件 |
| `common-close-button.vue` | 关闭按钮 | 弹窗、浮层关闭，CSS绘制X图标 |
| `bubble-dialog-box.vue` | 气泡对话框 | 训练提示、AI对话、教程引导 |
| `step-bar.vue` | 步骤进度条 | 多步骤流程进度展示（类似Stories） |
| `filter-pill.vue` | 筛选胶囊 | 筛选条件标签，支持选中态和下拉箭头 |

### course-list - 课程组件

| 组件名 | 说明 | 使用场景 |
|--------|------|----------|
| `training-course-card.vue` | 训练课程卡片 | 展示课程封面、标题、时长、标签 |

## 页面路由

| 页面路径 | 功能说明 |
|----------|----------|
| `/pages/idle/idle` | 待机页（应用入口） |
| `/pages/index/index` | 首页导航 |
| `/pages/freeTraining/free-training` | 自由训练 |
| `/pages/partTraining/part-training` | 部位训练选择 |
| `/pages/partTraining/part-training-detail-adapter` | 课程列表 |
| `/pages/partTraining/warm-up-page` | 热身引导 |
| `/pages/partTraining/adjust-equipment` | 器材调整 |
| `/pages/partTraining/formal-training` | 正式训练 |
| `/pages/partTraining/cool-down-page` | 拉伸放松 |
| `/pages/smartAssess/first-skip` | 智能评估入口 |
| `/pages/smartAssess/body-function-assess/body-function-assess` | 身体机能评估 |
| `/pages/smartAssess/body-strength-assess/body-strength-assess-new` | 部位力量评估 |
| `/pages/smartAssess/body-posture-assess/body-posture-assess` | 体态姿势评估 |
| `/pages/serial-test/serial-test` | 串口调试工具 v1 |
| `/pages/serial-test/serial-test-v2` | 串口调试工具 v2 |

## 串口通信插件

核心文件位于 `uni_modules/wzl-serialbridge/`

```javascript
import { openSerial, writeSerial, readSerial, closeSerial, listDevices } from '@/uni_modules/wzl-serialbridge'

// 打开串口
openSerial({
  devicePath: '/dev/ttyS3',
  baudRate: 115200,
  success: (res) => { /* portId = res.portId */ },
  fail: (err) => { /* 处理错误 */ }
})

// 发送数据（HEX格式）
writeSerial({
  portId: 1,
  data: 'AA5532BB',
  format: 'hex',
  success: (res) => console.log('发送成功', res.bytesWritten)
})
```

注意：串口功能必须使用自定义基座，通过 `运行 → 制作自定义调试基座` 打包。

## 开发规范

### Vue 组件风格
- 使用 Composition API (`<script setup>`)
- 响应式数据使用 `ref`
- 生命周期使用 `onMounted`, `onBeforeUnmount` 等

### 样式规范
- 单位全部使用 `rpx`
- 布局使用 Flexbox
- 所有组件样式加 `<style scoped>`

### 文件命名
- 页面/组件：小写中划线（`part-training.vue`）
- 静态资源：下划线命名（`ic_power.svg`）

## 注意事项

1. H5 平台仅用于 UI 预览，串口功能必须在 Android 真机测试
2. 修改 UTS 插件或 AAR 后必须重新制作自定义基座
3. HBuilderX 版本需 >= 3.6.0 以支持 UTS 插件
4. 串口设备路径通常为 `/dev/ttyS*` 或 `/dev/ttyUSB*`

## 串口通信性能优化方案

本项目通过 UTS 插件实现串口通信，在高频率数据交互（20Hz+）时可能遇到性能瓶颈。以下是已识别的优化方向和实现状态。

### 物理层传输能力参考

| 波特率 | 每秒字节数 | 96字节包传输时间 | 理论最大频率 |
|----------|------------|------------------|---------------|
| 115200   | 11520 字节 | ≈ 8.3ms          | ≈ 120Hz       |
| 230400   | 23040 字节 | ≈ 4.2ms          | ≈ 240Hz       |
| 460800   | 46080 字节 | ≈ 2.1ms          | ≈ 480Hz       |

### 优化方案一：UI 渲染压力优化 [已实现]

**问题描述：** 每收到一条数据就触发 Vue 响应式更新，20Hz = 每秒重绘 20 次列表，造成 UI 卡顿。

**解决方案：** 批量 UI 更新 - 使用非响应式缓冲区收集数据，定时同步到显示层。

```javascript
// 数据缓冲区（非响应式，避免频繁触发 Vue 更新）
let messageBuffer = []

// 收到数据时只加入缓冲区
messageBuffer.push({ data, bytes, ts })

// UI 刷新定时器：每 200ms 批量同步到响应式变量（5Hz 刷新率足够人眼观察）
setInterval(() => {
  if (messageBuffer.length > 0) {
    receivedMessages.value = [...messageBuffer].slice(0, maxMessages)
  }
}, 200)
```

**效果：** 大幅减少 Vue 响应式更新次数，UI 流畅度显著提升。

### 优化方案二：虚拟列表渲染 [未实现]

**问题描述：** 消息列表超过 100 条后，DOM 节点过多导致渲染变慢。

**解决方案：** 使用 uni-app 的 `<recycle-list>` 或第三方虚拟列表组件，只渲染可视区域内的项目。

**实现难度：** 中等

### 优化方案三：UTS 层帧解析 [未实现]

**问题描述：** 当前 JS 层每次调用 `readSerial` 返回原始字节，可能包含不完整的帧（拆包）或多个帧（粘包）。

**解决方案：** 在 UTS 层（`index.uts`）实现帧解析逻辑：
- 维护接收缓冲区
- 根据帧头 `0x73` 和帧尾 `0x65` 提取完整帧
- 只向 JS 层返回完整的数据帧

**实现难度：** 较高（需修改 UTS 插件，重新打包基座）

### 优化方案四：AAR 层回调监听器 [未实现]

**问题描述：** 当前采用 JS 定时轮询 `readSerial`，调用链为：
```
JS setInterval → UTS → Kotlin AAR → 读串口 → 返回数据 → UTS → JS
```
每次轮询都有跨语言调用开销。

**解决方案：** 在 Kotlin AAR 层实现数据接收监听器，数据到达时主动回调到 UTS/JS 层：
```kotlin
// AAR 层
interface SerialDataListener {
    fun onDataReceived(data: ByteArray)
}

// 设置监听器后，数据到达自动回调，无需轮询
serialPort.setDataListener(listener)
```

**实现难度：** 高（需修改 Kotlin AAR + UTS + 重新打包基座）

**效果：** 最优方案，消除轮询开销，实现真正的事件驱动。

### 当前实现状态总结

| 优化方案 | 状态 | 改动范围 | 效果评估 |
|----------|------|----------|----------|
| 批量 UI 更新 | 已实现 | 仅 JS | 高 |
| 虚拟列表渲染 | 未实现 | 仅 Vue 模板 | 中 |
| UTS 层帧解析 | 未实现 | UTS + 重打包基座 | 高 |
| AAR 层回调监听 | 未实现 | Kotlin + UTS + 重打包 | 最高 |
