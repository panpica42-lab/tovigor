  <!-- markdownlint-disable -->
  结论已经比较清楚了：现在不是“真连了两次”，而是“同一个连接 Promise 被两个页面生命周期同时 await 了”，外加页面级 beforeDestroy 又把连接关掉，所以日志看起来像“反复连断”。
  还差一个产品策略要锁定：App 退到后台时，串口是继续保持，还是跟前台页面一样暂停/断开。这个会直接决定连接生命周期挂在哪一层。

• Questions 1/1 answered
  • App 进入后台时，nvue 串口连接希望怎么处理？
    answer: 后台停力保连

• 你这个日志，核心问题不是“底层真的多次连接又断开”，而是现在的生命周期设计把“连接职责”放错层了。

  先说我根据现有代码看到的真实行为：

  1. App.vue 启动时会自动 serialService.connect() 一次。
     位置在 /C:/wzl/HX-proj/tovigor_v1/tovigor_v1/App.vue。
  2. 但 nvue 页面又在 mounted() 里自动 _nvueSerialConnect()，并且在 onShow() 里如果 serialReady 还是 false，还会再调一次。
     位置在 /C:/wzl/HX-proj/tovigor_v1/tovigor_v1/utils/nvueSerialMixin.js 和 /C:/wzl/HX-proj/tovigor_v1/tovigor_v1/pages/partTraining/formal-training.nvue。
  3. 因为第一次连接还没完成时，第二次调用进来，serialService.connect() 会直接复用 runtime.connectPromise，所以原生层通常只真开一次串口；但两个调用方都会各自打印“正在建立串口连
     接...”和“串口连接成功”，于是日志看起来像连了两次。
  4. 真正的“断开”来自页面级断连。现在 nvueSerialMixin.beforeDestroy() 里是无条件 serialService.disconnect()。这就意味着你一离开 nvue 页面，页面销毁就把串口断了。
     这和你想要的“像 App.vue 一样，应用级保活”是冲突的。

  所以你的判断是对的：
  nvue 不能继续维持现在这种“页面自己 connect / 页面自己 disconnect”的模型。
  应该改成“nvue 上下文内也有自己的应用级自动连接，页面只订阅和用，不负责断开”。

• Proposed Plan


  ## nvue 串口生命周期改造

  ### Summary

  把 nvue 串口从“页面级连接/断开”改成“nvue 上下文级常驻连接”。
  目标行为：

  - 首次进入任意 nvue 串口页时自动建立连接
  - nvue 页面之间跳转不再断开
  - 页面销毁只做事件解绑和停力，不做 disconnect()
  - App 退到后台时执行“停力保连”
  - 只有应用显式清理/退出时才真正 disconnect()/cleanup()

  ### Key Changes

  - 重构 /C:/wzl/HX-proj/tovigor_v1/tovigor_v1/utils/nvueSerialMixin.js
      - 去掉 beforeDestroy() 中的无条件 disconnect()
      - 去掉重复触发的页面级自动连接日志
      - 改为统一调用一个“ensure connected”入口，支持并发复用，不重复打印“正在连接”
      - serialReady 不再只靠本页布尔值，改为基于 service 当前状态同步
  - 在 nvue 侧补一个连接守护层
      - 推荐直接放在 serialService 周边，新增 nvue 专用的 ensureConnected() / markNvuePageActive() / markNvuePageInactive() 一类轻量接口
      - 页面进入时只声明“我需要串口”
      - 页面离开时只声明“我离开了”，不主动断线
      - 真正的断线条件只剩应用退出或显式 cleanup
  - 调整 /C:/wzl/HX-proj/tovigor_v1/tovigor_v1/pages/partTraining/formal-training.nvue 和其他使用 nvueSerialMixin 的 nvue 页
      - 删除页面里的 _nvueSerialDisconnect() 调用和延迟断连逻辑
      - 保留页面级 stopForce() / off('frame')
      - 保证从一个 nvue 训练页跳到另一个 nvue 页时，旧页先停力，新页直接复用已有连接
  - App 后台策略
      - onHide 时执行“停力保连”：停止力量输出、停止业务读写态，但不断开底层串口

  ### Public Interfaces / Behavior

  - 页面不再直接承担 disconnect() 责任
  - disconnect() 保留给应用退出、调试页显式关闭、或故障恢复流程使用

  ### Test Plan

  - 冷启动进入普通 .vue 页，确认自动连接一次，无重复“连接成功”日志
  - 从 .vue 页进入 formal-training.nvue，确认不重复开串口，不出现双重 connect success
  - 在 warm-up -> formal-training -> cool-down 之间来回跳转，确认不发生页面切换断连
  - 离开训练页但仍停留在 App 内，确认串口保持连接、力量已停止
  - App 退后台，确认执行“停力保连”，不触发 disconnect()
  - App 回前台，确认无需重连即可继续使用
  - 应用退出或显式 cleanup 时，确认只断开一次

  ### Assumptions

  - nvue 页之间共享同一套 nvue JS 上下文单例；当前日志表现符合这个前提
  - 后台策略按你刚确认的“后台停力保连”执行
  - 页面级职责只保留“订阅/解绑事件 + 开停力量”，不再管理连接生命周期

  顺手把你这段日志直接翻译成人话，就是：

  - 15:33:14.428 第一次页面发起连接
  - 15:33:14.906 第二次页面生命周期又来了一次，但其实复用了同一个 connectPromise
  - 后面两条“串口连接成功”是两个 await 调用各自打印，不是底层真连了两次
  - 15:33:24.xxx 那次断开，才是真正调用了 disconnect()


  所以问题不在串口插件，而在我们现在把连接绑在页面生命周期上了。这个方向改对以后，日志会干净很多，行为也会跟你预期一致。