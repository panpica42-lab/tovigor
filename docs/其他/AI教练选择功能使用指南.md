<!-- markdownlint-disable -->
# AI 教练选择功能使用指南

## 功能概述

该功能实现了完整的 AI 教练选择流程：
1. 在筛选栏点击教练卡片弹出详情
2. 查看教练详细信息（头像、姓名、简介、特长）
3. 点击选择按钮保存教练信息
4. 在热身页面自动显示选中的教练

## 文件结构

```
tovigor_v1/
├── utils/
│   └── coachManager.js                      # 教练数据管理工具类
├── components/
│   ├── modals/
│   │   └── coach-detail-modal.vue           # 教练详情弹窗组件
│   └── ui-box/
│       ├── CourseLibrarySidebar.vue         # 课程库筛选栏（集成教练选择）
│       └── ActionLibrarySidebar.vue         # 动作库筛选栏（集成教练选择）
└── pages/
    └── partTraining/
        └── warm-up-page.vue                 # 热身页（显示选中的教练）
```

## 组件拆分说明

早期方案中，课程库和动作库共用 `training-filter-sidebar.vue`。

后续产品语义发生分化：
- 课程库侧边栏服务于“找课程”，包含课程库/动作库切换、课程筛选和 AI 推荐入口
- 动作库侧边栏服务于“找动作”，交互重点和文案与课程库不再一致

因此当前实现已经不再共用 `training-filter-sidebar.vue`，而是拆分为两个各自承担业务语义的组件：
- `components/ui-box/CourseLibrarySidebar.vue`
- `components/ui-box/ActionLibrarySidebar.vue`

旧的 `training-filter-sidebar.vue` 已移除，本文档中的筛选栏说明以 `CourseLibrarySidebar.vue` 为主，`ActionLibrarySidebar.vue` 的 AI 教练逻辑与其保持同构。

## 核心组件说明

### 1. coachManager.js - 教练数据管理

**位置**: `utils/coachManager.js`

**功能**:
- 管理所有教练的配置数据（Vince 和 Vera）
- 提供本地存储的读写接口
- 统一教练数据格式

**主要 API**:

```javascript
// 获取所有教练配置
getAllCoaches()

// 根据 value 获取教练详细信息
getCoachByValue('vince')  // 返回 Vince 的完整信息

// 获取当前选中的教练（默认 Vince）
getSelectedCoach()

// 设置选中的教练
setSelectedCoach('vera')

// 清除选中的教练（重置为默认）
clearSelectedCoach()

// 获取教练选项列表（用于筛选栏展示）
getCoachOptions()

// 获取完整的教练信息（包含 BubbleDialogBox 所需属性）
getCoachDetailInfo('vince')
```

**教练数据结构**:

```javascript
{
  value: 'vince',                    // 唯一标识
  label: 'Vince',                    // 简称
  fullName: 'Vince 艾斯',            // 全名
  englishName: 'Vince Anderson',     // 英文名
  avatar: '/static/icons/...',       // 头像路径
  intro: '经验丰富的力量训练专家...',  // 简介
  tags: ['力量训练', '体能提升'],     // 特长标签
  gender: 'male',                    // 性别
  badgeBackground: 'linear-gradient(...)'  // 气泡背景色
}
```

### 2. coach-detail-modal.vue - 教练详情弹窗

**位置**: `components/modals/coach-detail-modal.vue`

**功能**:
- 展示教练的详细信息
- 提供选择按钮
- 支持关闭和遮罩点击

**Props**:

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| show | Boolean | false | 是否显示弹窗 |
| coachData | Object | {} | 教练数据对象 |

**Events**:

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:show | Boolean | 更新显示状态（v-model） |
| select | Object | 选择教练时触发，传递教练数据 |

**使用示例**:

```vue
<CoachDetailModal
  v-model:show="showModal"
  :coachData="currentCoach"
  @select="handleSelect"
/>
```

### 3. CourseLibrarySidebar.vue / ActionLibrarySidebar.vue - 筛选栏（集成教练选择）

**位置**:
- `components/ui-box/CourseLibrarySidebar.vue`
- `components/ui-box/ActionLibrarySidebar.vue`

**改动说明**:

1. **导入依赖**:
   ```javascript
   import CoachDetailModal from '@/components/modals/coach-detail-modal.vue'
   import { getCoachByValue, getSelectedCoach, setSelectedCoach } from '@/utils/coachManager.js'
   ```

2. **添加状态**:
   ```javascript
   const showCoachModal = ref(false)      // 控制弹窗显示
   const currentCoachData = ref(null)     // 当前查看的教练数据
   ```

3. **核心方法**:

   - `openCoachDetail(coachOption)`: 打开教练详情弹窗
     ```javascript
     const openCoachDetail = (coachOption) => {
       const fullCoachData = getCoachByValue(coachOption.value)
       if (fullCoachData) {
         currentCoachData.value = fullCoachData
         showCoachModal.value = true
       }
     }
     ```

   - `handleCoachSelect(coachData)`: 处理教练选择
     ```javascript
     const handleCoachSelect = (coachData) => {
       // 1. 保存到本地存储
       setSelectedCoach(coachData.value)
       
       // 2. 更新筛选状态
       emits('changeFilter', {
         key: 'coach',
         values: [coachData.value],
         option: { ... }
       })
       
       // 3. 显示成功提示
       uni.showToast({ title: `已选择${coachData.label}` })
     }
     ```

   - `onMounted()`: 页面加载时恢复已选教练状态
     ```javascript
     onMounted(() => {
       const selectedCoach = getSelectedCoach()
       if (selectedCoach) {
         // 同步到筛选状态
         emits('changeFilter', { ... })
       }
     })
     ```

4. **修改教练点击逻辑**:
   ```javascript
   const onOptionClick = (groupKey, option) => {
     // 如果是教练选项，弹出详情弹窗而非直接选中
     if (groupKey === 'coach') {
       openCoachDetail(option)
       return
     }
     // 其他选项的原有逻辑...
   }
   ```

### 4. warm-up-page.vue - 热身页（显示选中的教练）

**位置**: `pages/partTraining/warm-up-page.vue`

**改动说明**:

1. **导入依赖**:
   ```javascript
   import { getSelectedCoach, getCoachDetailInfo } from '@/utils/coachManager.js'
   ```

2. **改为响应式状态**:
   ```javascript
   // 原来是固定值
   // const coachAvatarUrl = '/static/icons/...'
   
   // 改为响应式
   const selectedCoach = ref(null)
   const coachRoleLabel = computed(() => selectedCoach.value?.fullName || 'Vince 艾斯')
   const coachAvatarUrl = computed(() => selectedCoach.value?.avatar || '/static/icons/...')
   const coachBadgeBackground = computed(() => selectedCoach.value?.badgeBackground || '...')
   ```

3. **读取选中的教练**:
   ```javascript
   onMounted(() => {
     // 读取选中的教练信息
     selectedCoach.value = getSelectedCoach()
     console.log('当前选中的教练:', selectedCoach.value)
     
     startProgressTimer()
   })
   ```

4. **更新模板绑定**:
   ```vue
   <BubbleDialogBox
     :roleLabel="coachRoleLabel"
     :avatarUrl="coachAvatarUrl"
     :badgeBackground="coachBadgeBackground"
     :text="currentWarmupTip"
     contentBackground="rgba(255, 255, 255, 0.85)"
     :showShadow="true"
   />
   ```

## 完整使用流程

### 流程图

```
用户进入部位训练页
    ↓
点击左侧筛选栏 "AI教练"
    ↓
展开显示 Vince 和 Vera 两个教练卡片
    ↓
点击其中一个教练卡片
    ↓
弹出教练详情弹窗（显示头像、姓名、简介、特长）
    ↓
查看详情后，点击底部绿色 "选择XX教练" 按钮
    ↓
弹窗关闭，显示 Toast 提示 "已选择XX"
    ↓
教练信息保存到本地存储 (uni.setStorageSync)
    ↓
筛选栏中该教练卡片显示为选中状态（绿边框高亮）
    ↓
点击课程卡片进入训练详情
    ↓
开始训练，进入热身页
    ↓
热身页的气泡对话框自动显示选中的教练（头像、姓名、配色）
    ↓
完成热身，后续训练页面也可使用该教练信息
```

### 代码调用流程

1. **用户点击教练卡片**:
   ```javascript
   // CourseLibrarySidebar.vue（ActionLibrarySidebar.vue 同理）
   @click="onOptionClick('coach', coach)"
   ```

2. **触发详情弹窗**:
   ```javascript
   onOptionClick('coach', coachOption)
     → openCoachDetail(coachOption)
       → getCoachByValue(coachOption.value)  // 获取完整数据
       → showCoachModal.value = true         // 显示弹窗
   ```

3. **用户点击选择按钮**:
   ```javascript
   // coach-detail-modal.vue
   @click="handleSelect"
     → emits('select', props.coachData)
   ```

4. **保存教练信息**:
   ```javascript
   // CourseLibrarySidebar.vue（ActionLibrarySidebar.vue 同理）
   @select="handleCoachSelect"
     → setSelectedCoach(coachData.value)     // 保存到本地存储
     → emits('changeFilter', ...)            // 更新筛选状态
     → uni.showToast(...)                    // 显示成功提示
   ```

5. **热身页读取教练**:
   ```javascript
   // warm-up-page.vue
   onMounted()
     → selectedCoach.value = getSelectedCoach()  // 从本地存储读取
     → coachRoleLabel.value 自动更新
     → coachAvatarUrl.value 自动更新
     → BubbleDialogBox 显示对应教练
   ```

## 本地存储说明

**存储键**: `selected_coach`

**存储内容**: 教练的 `value` 字段（'vince' 或 'vera'）

**操作接口**:
```javascript
// 写入
uni.setStorageSync('selected_coach', 'vera')

// 读取
const coachValue = uni.getStorageSync('selected_coach')  // 'vera'

// 删除
uni.removeStorageSync('selected_coach')
```

**注意事项**:
- 仅存储教练的标识符（value），不存储完整对象
- 读取时通过 `getCoachByValue()` 还原完整数据
- 如果本地存储为空，默认使用 Vince
- 存储是持久化的，关闭应用后再打开仍然保留

## 扩展和维护

### 添加新教练

1. 在 `utils/coachManager.js` 的 `DEFAULT_COACHES` 中添加新配置:
   ```javascript
   const DEFAULT_COACHES = {
     vince: { ... },
     vera: { ... },
     newCoach: {
       value: 'newCoach',
       label: 'NewCoach',
       fullName: 'NewCoach 新教练',
       englishName: 'New Coach',
       avatar: '/static/icons/...',
       intro: '专业描述...',
       tags: ['标签1', '标签2'],
       gender: 'male',  // or 'female'
       badgeBackground: 'linear-gradient(...)'
     }
   }
   ```

2. 在 `getCoachOptions()` 中添加选项:
   ```javascript
   export function getCoachOptions() {
     return [
       { value: 'vince', label: 'Vince 艾斯', avatar: '...' },
       { value: 'vera', label: 'Vera 维拉', avatar: '...' },
       { value: 'newCoach', label: 'NewCoach 新教练', avatar: '...' }
     ]
   }
   ```

3. 准备对应的头像图片资源

4. 无需修改其他文件，系统会自动识别新教练

### 修改教练信息

直接在 `utils/coachManager.js` 的 `DEFAULT_COACHES` 中修改对应教练的属性即可，所有使用该教练的地方会自动更新。

### 在其他页面使用教练信息

```javascript
import { getSelectedCoach } from '@/utils/coachManager.js'

// 获取当前选中的教练
const coach = getSelectedCoach()

// 使用教练信息
console.log(coach.fullName)    // "Vince 艾斯"
console.log(coach.avatar)      // "/static/icons/..."
console.log(coach.intro)       // "经验丰富的..."
```

## 样式定制

### 弹窗样式

在 `coach-detail-modal.vue` 中调整:

- **弹窗宽度**: `.modal-container { width: 560rpx; }`
- **背景渐变**: `background: linear-gradient(...)`
- **头像大小**: `.coach-avatar-large { width: 200rpx; height: 200rpx; }`
- **按钮颜色**: `.select-btn { background: linear-gradient(#00C853, #00E676); }`

### 教练卡片样式

在 `CourseLibrarySidebar.vue` 或 `ActionLibrarySidebar.vue` 中调整:

- **卡片高度**: `.coach-card { min-height: 72rpx; }`
- **背景色**: `background: #1E3A8A;`
- **选中边框**: `.coach-card--active { border-color: #00C853; }`

## 常见问题

### Q1: 选择教练后，热身页没有更新？

**原因**: 可能是在热身页打开之前选择的教练，页面已经挂载过了。

**解决**: 在 `warm-up-page.vue` 的 `onShow` 中也添加读取逻辑:
```javascript
onShow(() => {
  // 每次页面显示时重新读取教练
  selectedCoach.value = getSelectedCoach()
  resetProgress()
  startProgressTimer()
})
```

### Q2: 如何清除选中的教练？

```javascript
import { clearSelectedCoach } from '@/utils/coachManager.js'

clearSelectedCoach()  // 下次会使用默认教练（Vince）
```

### Q3: 本地存储的教练信息会过期吗？

不会过期，除非用户主动清除应用数据或调用 `clearSelectedCoach()`。

### Q4: 可以同时选择多个教练吗？

当前实现是单选模式。如需多选，需修改:
1. `coachManager.js` 中将 `selected_coach` 改为数组
2. `handleCoachSelect` 中支持追加而非替换
3. `warm-up-page.vue` 中决定显示哪个教练（如随机或轮换）

## 测试清单

- [ ] 点击 AI 教练筛选项，能展开显示 Vince 和 Vera
- [ ] 点击 Vince 卡片，弹出 Vince 详情弹窗
- [ ] 点击 Vera 卡片，弹出 Vera 详情弹窗
- [ ] 弹窗中显示正确的头像、姓名、简介、特长标签
- [ ] 点击 "选择XX教练" 按钮，弹窗关闭并显示 Toast
- [ ] 选中后，教练卡片显示绿色边框高亮
- [ ] 进入热身页，气泡对话框显示选中的教练头像和姓名
- [ ] 切换选择不同教练，热身页能正确更新
- [ ] 关闭应用重新打开，选中的教练仍然保留
- [ ] 点击弹窗外的遮罩，弹窗关闭
- [ ] 点击弹窗右上角关闭按钮，弹窗关闭

## 总结

该功能实现了完整的 AI 教练选择流程，关键点包括：

1. **数据管理集中化**: 所有教练数据和逻辑在 `coachManager.js` 中统一管理
2. **本地存储持久化**: 选中的教练通过 `uni.setStorageSync` 保存，跨页面共享
3. **组件解耦**: 详情弹窗是独立组件，可在其他地方复用
4. **状态同步**: 筛选栏和热身页通过本地存储自动同步
5. **用户体验**: 点击查看详情 → 确认选择 → 显示提示 → 全局生效

这个架构易于扩展和维护，可以方便地添加新教练或在其他页面使用教练信息。
