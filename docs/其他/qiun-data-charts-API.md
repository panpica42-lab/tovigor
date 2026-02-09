<!-- markdownlint-disable -->
# qiun-data-charts 图表组件 API 文档

> **版本**: 2.5.0-20230101  
> **组件类型**: 秋云 uCharts / ECharts 高性能跨全端图表组件  
> **支持平台**: H5、App、微信小程序、支付宝小程序、百度小程序、字节跳动小程序、QQ小程序等  
> **Vue 版本**: 支持 Vue 2 和 Vue 3

---

## 快速开始

### 1. 基础使用

```vue
<template>
  <view class="chart-container">
    <qiun-data-charts 
      type="line"
      :chartData="chartData"
      :opts="opts"
      @complete="complete"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'

const chartData = ref({})
const opts = ref({
  color: ['#1890FF', '#91CB74', '#FAC858'],
  padding: [15, 15, 0, 15],
  legend: {},
  xAxis: {
    disableGrid: true
  },
  yAxis: {
    data: [{ min: 0 }]
  },
  extra: {
    line: {
      type: 'straight',  // 'curve' 平滑曲线
      width: 2
    }
  }
})

// 初始化图表数据
const initChart = () => {
  chartData.value = {
    categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
    series: [{
      name: '目标值',
      data: [35, 36, 31, 33, 13, 34]
    }, {
      name: '现量',
      data: [18, 27, 21, 24, 6, 28]
    }]
  }
}

const complete = (e) => {
  console.log('图表渲染完成', e)
}

initChart()
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400rpx;
}
</style>
```

---

## 组件属性 (Props)

### 核心属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| **type** | String | - | **必填**。图表类型：`line` 折线图、`column` 柱状图、`area` 区域图、`ring` 圆环图、`pie` 饼图、`radar` 雷达图、`gauge` 仪表盘等 |
| **chartData** | Object | `{categories: [], series: []}` | **必填**。图表数据对象 |
| **opts** | Object | `{}` | uCharts 配置项（详见下方配置说明） |
| **eopts** | Object | `{}` | ECharts 配置项（使用 ECharts 渲染时） |

### 样式与交互

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| **background** | String | `'rgba(0,0,0,0)'` | 图表背景色 |
| **animation** | Boolean | `true` | 是否开启动画 |
| **canvasId** | String | `'uchartsid'` | Canvas ID（自动生成随机ID） |
| **canvas2d** | Boolean | `false` | 是否使用新版 Canvas 2D（小程序） |
| **disableScroll** | Boolean | `false` | 是否禁止滚动 |
| **inScrollView** | Boolean | `false` | 是否在 scroll-view 中 |

### 提示窗配置

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| **tooltipShow** | Boolean | `true` | 是否显示提示窗 |
| **tooltipFormat** | String | `undefined` | 提示窗格式化函数字符串 |
| **tooltipCustom** | Object | `undefined` | 自定义提示窗配置 |

### 交互事件开关

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| **ontap** | Boolean | `true` | 是否启用点击事件 |
| **ontouch** | Boolean | `false` | 是否启用触摸事件 |
| **onmouse** | Boolean | `true` | 是否启用鼠标事件（H5/App） |
| **onmovetip** | Boolean | `false` | 移动时是否显示提示 |
| **onzoom** | Boolean | `false` | 是否启用双指缩放 |
| **tapLegend** | Boolean | `true` | 是否允许点击图例 |

### 加载与错误

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| **loadingType** | Number | `2` | 加载动画类型（1-5） |
| **errorShow** | Boolean | `true` | 是否显示错误信息 |
| **errorReload** | Boolean | `true` | 是否允许点击重新加载 |
| **errorMessage** | String | `null` | 自定义错误消息 |

### 高级配置

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| **optsWatch** | Boolean | `true` | 是否监听 opts 变化 |
| **reshow** | Boolean | `false` | 重新显示图表（改变时触发） |
| **reload** | Boolean | `false` | 重新加载图表（改变时触发） |
| **echartsH5** | Boolean | `false` | H5 端强制使用 ECharts |
| **echartsApp** | Boolean | `false` | App 端强制使用 ECharts |
| **directory** | String | `'/'` | ECharts 文件目录 |
| **pageScrollTop** | Number | `0` | 页面滚动距离（inScrollView 时使用） |

---

## chartData 数据格式

### 基础格式

```javascript
{
  categories: ['分类1', '分类2', '分类3'],  // X 轴分类（必填）
  series: [                                 // 数据系列（必填）
    {
      name: '系列1',     // 系列名称
      data: [10, 20, 30] // 数据值
    },
    {
      name: '系列2',
      data: [15, 25, 35]
    }
  ]
}
```

### 高级配置（单个系列）

```javascript
{
  name: '销售额',
  data: [120, 132, 101, 134, 90, 230, 210],
  color: '#1890FF',           // 系列颜色
  lineType: 'dash',           // 线型：'solid' 实线, 'dash' 虚线
  pointShape: 'circle',       // 点形状
  disableLegend: false,       // 是否禁用图例
  textColor: '#666',          // 文本颜色
  textSize: 11,               // 文本大小
  linearColor: [              // 渐变色（折线图）
    [0, '#0EE2F8'],
    [0.5, '#1890FF'],
    [1, '#9A60B4']
  ],
  setShadow: [2, 2, 10, 'rgba(0,0,0,0.3)']  // 阴影设置
}
```

---

## opts 配置项（uCharts）

### 全局配置

```javascript
{
  // 颜色主题
  color: ['#1890FF', '#91CB74', '#FAC858', '#EE6666'],
  
  // 内边距 [上, 右, 下, 左]
  padding: [15, 15, 0, 15],
  
  // 图表标题（很少使用，通常在外部添加）
  title: {
    name: '图表标题',
    fontSize: 15,
    color: '#333',
    offsetX: 0,
    offsetY: 0
  },
  
  // 副标题
  subtitle: {
    name: '副标题',
    fontSize: 12,
    color: '#999'
  },
  
  // 图例配置
  legend: {
    show: true,
    position: 'bottom',  // 'top', 'bottom', 'left', 'right'
    float: 'center',     // 'left', 'center', 'right'
    padding: 5,
    margin: 5,
    fontSize: 13,
    lineHeight: 11,
    fontColor: '#333',
    format: {}           // 自定义图例文本
  },
  
  // 背景色
  background: '#FFFFFF',
  
  // 是否启用滚动条
  enableScroll: false,
  
  // 是否启用标记点
  enableMarkLine: false,
  
  // 其他全局配置...
}
```

### X 轴配置

```javascript
{
  xAxis: {
    disabled: false,           // 是否禁用
    disableGrid: false,        // 是否不绘制网格线
    gridType: 'solid',         // 网格线类型：'solid', 'dash', 'dot'
    gridColor: '#E5E5E5',      // 网格线颜色
    gridEval: 1,               // 网格密度
    fontColor: '#666',         // 字体颜色
    fontSize: 13,              // 字体大小
    lineHeight: 20,            // 字体行高
    marginTop: 0,              // 文字距离轴线距离
    rotateLabel: false,        // 是否旋转标签
    rotateAngle: 45,           // 旋转角度
    labelCount: 'auto',        // 显示标签数量（'auto' 或数字）
    boundaryGap: 'center',     // 数据点位置：'center', 'justify'
    axisLine: true,            // 是否显示轴线
    axisLineColor: '#666',     // 轴线颜色
    
    // X 轴标题
    title: '时间',
    titleFontSize: 13,
    titleFontColor: '#666',
    titleOffsetY: 0,           // 标题Y偏移
    titleOffsetX: 0,           // 标题X偏移
    
    // 滚动条配置
    scrollShow: false,         // 是否显示滚动条
    scrollAlign: 'left',       // 滚动对齐方式
    itemCount: 5              // 显示项目数量（启用滚动时）
  }
}
```

### Y 轴配置

```javascript
{
  yAxis: {
    disabled: false,
    disableGrid: false,
    gridType: 'solid',
    gridColor: '#E5E5E5',
    fontColor: '#666',
    fontSize: 13,
    splitNumber: 5,            // 分割段数
    showTitle: false,          // 是否显示标题
    
    // 数据配置（支持多Y轴）
    data: [
      {
        min: 0,                // 最小值（'auto' 或数字）
        max: 'auto',           // 最大值
        tofix: 0,              // 小数位数
        format: '',            // 格式化函数
        title: 'Y轴标题',
        titleFontSize: 13,
        titleFontColor: '#666',
        titleOffsetX: 0,
        titleOffsetY: 0
      }
    ]
  }
}
```

### 图表类型专属配置 (extra)

#### 折线图 (line)

```javascript
{
  extra: {
    line: {
      type: 'straight',        // 'straight' 直线, 'curve' 平滑曲线
      width: 2,                // 线宽
      activeType: 'hollow',    // 激活指示点：'none', 'hollow', 'solid'
      linearType: 'custom',    // 渐变类型：'none', 'custom'
      onShadow: false,         // 是否开启阴影
      animation: 'vertical'    // 动画方向：'vertical', 'horizontal'
    }
  }
}
```

#### 区域图 (area)

```javascript
{
  extra: {
    area: {
      type: 'straight',
      width: 2,
      opacity: 0.2,            // 区域透明度
      addLine: true,           // 是否绘制线条
      activeType: 'hollow'
    }
  }
}
```

#### 柱状图 (column)

```javascript
{
  extra: {
    column: {
      type: 'group',           // 'group' 分组, 'stack' 堆叠
      width: 30,               // 柱宽（像素或百分比如 '30%'）
      meterBorder: 1,          // 边框宽度
      meterFillColor: '#FFFFFF', // 填充色
      activeBgColor: '#000000',  // 激活背景色
      activeBgOpacity: 0.08,     // 激活透明度
      barBorderCircle: false,    // 是否圆角
      barBorderRadius: [5, 5, 0, 0], // 圆角配置
      seriesGap: 2,              // 系列间距
      categoryGap: 2,            // 分类间距
      labelPosition: 'outside'   // 标签位置：'outside', 'insideTop', 'center', 'bottom'
    }
  }
}
```

#### 饼图/圆环图 (pie/ring)

```javascript
{
  extra: {
    pie: {
      activeOpacity: 0.5,      // 激活透明度
      activeRadius: 10,        // 激活扩展半径
      offsetAngle: 0,          // 起始角度偏移
      labelWidth: 15,          // 标签宽度
      ringWidth: 30,           // 圆环宽度（ring图）
      border: true,            // 是否显示边框
      borderWidth: 2,
      borderColor: '#FFFFFF',
      centerText: {            // 中心文字（ring图）
        text: '总计',
        fontSize: 20,
        color: '#333'
      }
    }
  }
}
```

#### 雷达图 (radar)

```javascript
{
  extra: {
    radar: {
      gridType: 'radar',       // 'radar' 圆形, 'polygon' 多边形
      gridColor: '#E5E5E5',
      gridCount: 3,            // 网格圈数
      opacity: 0.2,            // 区域透明度
      max: 100,                // 最大值
      labelShow: true,         // 是否显示标签
      radius: 'auto'           // 半径（'auto' 或数字）
    }
  }
}
```

#### 仪表盘 (gauge)

```javascript
{
  extra: {
    gauge: {
      type: 'default',         // 'default', 'progress'
      width: 15,               // 仪表盘宽度
      startAngle: 0.75,        // 起始角度
      endAngle: 0.25,          // 结束角度
      splitLine: {
        fixRadius: 0,
        splitNumber: 10,
        width: 15,
        color: '#E5E5E5',
        childNumber: 5,
        childWidth: 5
      },
      pointer: {
        width: 15,
        color: 'auto'
      }
    }
  }
}
```

### 提示窗配置 (tooltip)

```javascript
{
  extra: {
    tooltip: {
      showBox: true,           // 是否显示提示框
      showArrow: true,         // 是否显示箭头
      showCategory: false,     // 是否显示分类
      borderWidth: 0,          // 边框宽度
      borderRadius: 0,         // 圆角
      borderColor: '#000',
      bgColor: '#000',
      bgOpacity: 0.7,
      fontColor: '#FFF',
      fontSize: 13,
      lineHeight: 20,
      boxPadding: 3,           // 内边距
      legendShow: true,        // 是否显示图例
      legendShape: 'auto',     // 图例形状
      activeBgColor: '#000',
      activeBgOpacity: 0.08
    }
  }
}
```

### 标记线配置 (markLine)

```javascript
{
  extra: {
    markLine: {
      type: 'solid',           // 'solid', 'dash'
      dashLength: 4,
      data: [
        {
          value: 50,           // 标记值
          lineColor: '#CA2824',
          showLabel: true,
          labelText: '平均值',
          labelFontSize: 13,
          labelPadding: 6,
          labelFontColor: '#CA2824',
          labelBgColor: '#FFF',
          labelBgOpacity: 0.8
        }
      ]
    }
  }
}
```

---

## 组件方法

通过 `ref` 调用组件方法：

```vue
<template>
  <qiun-data-charts ref="chartRef" :chartData="chartData" :opts="opts" />
</template>

<script setup>
import { ref } from 'vue'

const chartRef = ref(null)

// 调用方法示例
const updateChart = () => {
  // 更新数据（推荐方式）
  chartData.value = newChartData
  
  // 或使用组件方法
  chartRef.value.updateData({
    scrollPosition: 'right',  // 滚动到右侧
    animation: true
  })
}

// 导出图片
const exportImage = () => {
  chartRef.value.getImage((res) => {
    console.log('图片Base64:', res.base64)
  })
}

// 滚动图表（启用滚动时）
const scrollChart = () => {
  chartRef.value.scrollLeft()   // 向左滚动
  chartRef.value.scrollRight()  // 向右滚动
}

// 显示提示窗
const showTooltip = () => {
  chartRef.value.showToolTip({
    index: 2  // 显示第3个数据点的提示
  })
}

// 停止动画
const stopAnimation = () => {
  chartRef.value.stopAnimation()
}

// 重新渲染
const reRender = () => {
  chartRef.value.rerender()
}
</script>
```

---

## 组件事件

### 核心事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| **@complete** | `{type, complete, id, opts}` | 图表渲染完成 |
| **@getIndex** | `{type, currentIndex, legendIndex, id, opts}` | 点击图表获取数据索引 |
| **@getImage** | `{type, base64}` | 获取图片回调 |
| **@error** | `{type, errorShow, msg, id}` | 图表错误 |

### 滚动事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| **@scrollLeft** | `{type, scrollLeft, id, opts}` | 滚动到左侧边界 |
| **@scrollRight** | `{type, scrollRight, id, opts}` | 滚动到右侧边界 |

### 触摸事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| **@getTouchStart** | `{type, event, id, opts}` | 触摸开始 |
| **@getTouchMove** | `{type, event, id, opts}` | 触摸移动 |
| **@getTouchEnd** | `{type, event, id, opts}` | 触摸结束 |

---

## 实时数据更新示例（适用于串口数据）

```vue
<template>
  <view class="page">
    <qiun-data-charts 
      type="line"
      :chartData="chartData"
      :opts="opts"
      @complete="chartComplete"
    />
  </view>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { readSerial } from '@/uni_modules/wzl-serialbridge'

const chartData = ref({})
const opts = ref({
  color: ['#1890FF'],
  padding: [15, 15, 0, 15],
  enableScroll: true,
  xAxis: {
    scrollShow: true,
    itemCount: 20,         // 显示最近20个点
    scrollAlign: 'right'   // 新数据在右侧
  },
  yAxis: {
    data: [{ min: 0, max: 100 }]
  },
  extra: {
    line: {
      type: 'curve',
      width: 2
    }
  }
})

// 数据存储
const timeStamps = ref([])
const forceValues = ref([])
const maxDataPoints = 100  // 最多保留100个数据点

let updateTimer = null
let currentPortId = 1

// 初始化图表
const initChart = () => {
  chartData.value = {
    categories: [],
    series: [{
      name: '力量值',
      data: []
    }]
  }
}

// 添加新数据点
const addDataPoint = (value) => {
  const now = new Date()
  const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
  
  timeStamps.value.push(timeStr)
  forceValues.value.push(value)
  
  // 限制数据点数量
  if (timeStamps.value.length > maxDataPoints) {
    timeStamps.value.shift()
    forceValues.value.shift()
  }
  
  // 更新图表
  updateChart()
}

// 更新图表数据
const updateChart = () => {
  chartData.value = {
    categories: timeStamps.value,
    series: [{
      name: '力量值',
      data: forceValues.value
    }]
  }
}

// 从串口读取数据（循环调用）
const startReading = () => {
  updateTimer = setInterval(() => {
    readSerial({
      portId: currentPortId,
      length: 1024,
      format: 'hex',
      timeout: 100,
      success: (res) => {
        if (res.bytesRead > 0) {
          // 解析HEX数据获取力量值（根据实际协议调整）
          const value = parseInt(res.data.substring(4, 6), 16)
          addDataPoint(value)
        }
      },
      fail: (err) => {
        // 读取失败处理（超时不处理）
        if (err.errCode !== 10003) {
          console.error('读取失败:', err)
        }
      }
    })
  }, 200)  // 每200ms读取一次
}

const stopReading = () => {
  if (updateTimer) {
    clearInterval(updateTimer)
    updateTimer = null
  }
}

const chartComplete = (e) => {
  console.log('图表渲染完成', e)
}

onMounted(() => {
  initChart()
  // startReading()  // 如果需要立即开始读取，取消注释
})

onBeforeUnmount(() => {
  stopReading()
})
</script>

<style scoped>
.page {
  padding: 20rpx;
}
</style>
```

---

## 常见问题

### 1. 图表不显示
- 确保容器有明确的宽高
- 检查 `chartData` 格式是否正确
- 查看控制台是否有错误信息

### 2. 数据更新不及时
- 确保 `chartData` 是响应式数据 (`ref` 或 `reactive`)
- 避免频繁更新（建议间隔 > 50ms）
- 检查 `optsWatch` 是否为 `true`

### 3. 在 scroll-view 中使用
- 设置 `inScrollView="true"`
- 传入 `pageScrollTop` 属性

### 4. 图表渲染性能优化
- 限制数据点数量（< 100 最佳）
- 使用 `enableScroll` 实现滚动查看历史数据
- 关闭不必要的动画 (`animation: false`)
- H5/App 可启用 ECharts 渲染 (`echartsH5`/`echartsApp`)

---

## 参考链接

- **官方网站**: https://www.ucharts.cn
- **官方文档**: https://www.ucharts.cn/v2/#/
- **插件市场**: https://ext.dcloud.net.cn/plugin?id=271
- **Gitee 仓库**: https://gitee.com/uCharts/uCharts
- **视频教程**: https://www.bilibili.com/video/BV1qA411Q7se/

---

## 许可证

Apache License 2.0 - 免费开源，可用于商业项目
