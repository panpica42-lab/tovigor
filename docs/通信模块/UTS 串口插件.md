<!-- markdownlint-disable -->
# UTS 串口插件 - 测试指南

## ✅ 已完成工作

### 1. UTS 插件结构
```
uni_modules/wzl-serialbridge/
├── package.json          ✅ 插件配置
├── interface.uts         ✅ TypeScript 接口定义
├── unierror.uts         ✅ 错误处理
├── readme.md            ✅ 使用文档
└── utssdk/
    └── app-android/
        ├── config.json          ✅ Android 配置
        ├── index.uts           ✅ Android 实现层
        └── libs/
            └── serialbridge-debug.aar  ✅ 你的 AAR (60KB)
```

### 2. 代码清理
- ✅ 删除 `nativeplugins/SerialBridge-Plugin/` 旧插件目录
- ✅ 删除 `SerialBridge-Studio/` Android Studio 项目
- ✅ 移除 `manifest.json` 中的 `nativePlugins` 配置

### 3. 测试页面更新
- ✅ `pages/serial-test/serial-test.vue` 已更新为使用新 UTS 插件
- ✅ 导入方式: `import { openSerial, ... } from '@/uni_modules/wzl-serialbridge'`
- ✅ API 调用方式: 回调函数风格 (success/fail/complete)

---

## 📱 下一步:制作自定义基座

### 步骤 1: 打开 HBuilderX

确保你的项目在 HBuilderX 中已打开。

### 步骤 2: 制作自定义调试基座

1. **菜单路径**:
   ```
   运行 → 运行到手机或模拟器 → 制作自定义调试基座
   ```

2. **或使用快捷方式**:
   - 点击工具栏的"运行"按钮旁边的下拉菜单
   - 选择"制作自定义调试基座"

3. **等待云端打包**:
   - HBuilderX 会将你的项目(包括 UTS 插件和 AAR)上传到云端
   - 云端编译需要 3-5 分钟
   - 控制台会显示打包进度

4. **下载自定义基座**:
   - 打包完成后,基座 APK 会自动下载到:
     ```
     项目目录/unpackage/debug/android_debug.apk
     ```

### 步骤 3: 安装自定义基座到手机

**方法 A: 使用 HBuilderX 自动安装**
```
运行 → 运行到手机或模拟器 → 运行到 Android App 基座
→ 选择你的设备
→ HBuilderX 会自动安装并运行
```

**方法 B: 手动安装**
```
adb install -r unpackage/debug/android_debug.apk
```

### 步骤 4: 运行测试

1. **确保基座已安装并运行**
2. **在 HBuilderX 中点击运行**:
   ```
   运行 → 运行到手机或模拟器 → 运行到 Android App 基座
   ```
3. **应用会热更新到基座中,无需重新打包**

---

## 🧪 测试功能

### 测试页面入口
```
首页 → 点击"串口测试"按钮 → 进入 serial-test 页面
```

### 测试步骤

#### 1. 扫描设备
- 点击"扫描设备"按钮
- 查看是否能找到 `/dev/ttyS3` 等设备
- **预期结果**: 弹出设备列表或提示"未找到设备"

#### 2. 打开串口
- 输入设备路径(如 `/dev/ttyS3`)
- 选择波特率(默认 115200)
- 点击"打开串口"
- **预期结果**: 
  - 成功:显示"串口已打开",状态栏变绿
  - 失败:显示错误信息和错误码

#### 3. 发送数据
- 在发送框输入 HEX 数据,如: `AA5501BB`
- 点击"发送"
- **预期结果**: 显示"已发送 X 字节"

#### 4. 接收数据
- 如果串口有数据返回,会自动显示在"数据接收"区域
- 每条消息显示:时间戳、字节数、HEX 数据
- **预期结果**: 实时接收并显示数据

#### 5. 关闭串口
- 点击"关闭串口"
- **预期结果**: 状态栏变灰,显示"串口已关闭"

---

## 🐛 可能的问题和解决方案

### 问题 1: 制作基座时报错
**错误**: "云端打包失败"

**解决方案**:
1. 检查 HBuilderX 版本(需要 3.6.0+)
2. 检查 manifest.json 中的 appid 是否正确
3. 检查网络连接
4. 查看 HBuilderX 控制台的详细错误信息

### 问题 2: 运行时找不到插件
**错误**: "Cannot read property 'openSerial' of undefined"

**解决方案**:
1. 确认使用的是**自定义基座**,不是标准基座
2. 重新制作自定义基座
3. 检查 AAR 文件是否正确放置

### 问题 3: 打开串口失败
**错误码 10001**: "打开串口失败"

**可能原因**:
1. 设备路径不存在(检查 `/dev/ttyS3` 是否存在)
2. 没有权限(需要 root 或特殊权限)
3. 设备已被其他程序占用

**解决方案**:
1. 使用 `adb shell ls -l /dev/tty*` 查看可用设备
2. 确认设备权限: `adb shell chmod 666 /dev/ttyS3`
3. 尝试其他设备路径

### 问题 4: Kotlin 版本冲突
**错误**: "Duplicate class kotlin.XXX found"

**解决方案**:
在 `config.json` 中排除 Kotlin 标准库:
```json
{
  "minSdkVersion": 21,
  "dependencies": [],
  "excludes": ["org.jetbrains.kotlin:kotlin-stdlib"]
}
```

---

## 📊 调试技巧

### 1. 查看日志
```bash
# 在 PC 上连接手机后
adb logcat | grep -i "serial\|wzl"
```

### 2. HBuilderX 控制台
- 查看 Console 面板的输出
- 所有 `console.log` 都会显示
- 插件版本信息会在启动时打印

### 3. 检查 AAR 是否正确打包
```bash
# 查看编译后的 APK 是否包含 AAR
adb pull /data/local/tmp/android_debug.apk
unzip -l android_debug.apk | grep serialbridge
```

---

## 🎉 成功标志

如果一切正常,你会看到:

1. ✅ HBuilderX 控制台输出:
   ```
   === 串口插件版本: 1.0.0 ===
   === 串口测试页面已挂载 ===
   插件已加载
   ```

2. ✅ 页面显示:
   - "插件已加载" Toast 提示
   - 所有按钮正常显示
   - 扫描设备能找到设备列表

3. ✅ 功能正常:
   - 打开串口成功
   - 发送数据成功
   - 接收数据实时显示

---

## 📝 开发建议

### 当前使用 Debug AAR
- ✅ 适合开发调试
- ✅ 可以打断点
- ⚠️ 体积较大
- ⚠️ 性能较差

### 发布时使用 Release AAR
在 Android Studio 中执行:
```bash
.\gradlew assembleRelease
```

将生成的 `serialbridge-release.aar` 替换 debug 版本。

---

## 📞 需要帮助?

如果遇到问题,请提供:
1. HBuilderX 版本号
2. 错误截图或控制台日志
3. 设备型号和 Android 版本
4. 具体的操作步骤

祝测试顺利! 🚀
