<template>
	<view class="game-container" @touchstart="handleTap">
		<!-- 背景层：天空 -->
		<image class="bg-sky" src="/static/icons/games/flappyBirdGame/bg_sky.png" mode="aspectFill"></image>
		<!-- 背景层：地面 -->
		<image class="bg-ground" src="/static/icons/games/flappyBirdGame/bg_ground.png" mode="aspectFill"></image>
		
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<image 
				class="back-btn" 
				src="/static/icons/general/btn_general_back.svg" 
				mode="aspectFit"
				@click.stop="goBack"
			></image>
			<text class="nav-title">管道小鸟</text>
			<view class="nav-placeholder"></view>
		</view>
		
		<!-- 计时器显示 -->
		<view class="timer-display">
			<text class="timer-text">{{ formatTime(gameTime) }}</text>
		</view>
		
		<!-- 游戏区域 -->
		<view class="game-area">
			<!-- 小鸟 -->
			<view 
				class="bird" 
				:style="{ 
					transform: `translateY(${birdY}px) rotate(${birdRotation}deg)`,
					transition: gameStarted ? 'none' : 'transform 0.1s'
				}"
			>
				<image 
					class="bird-img" 
					src="/static/icons/games/flappyBirdGame/ic_bird.png" 
					mode="aspectFit"
				></image>
			</view>
			
			<!-- 管道组 -->
			<view 
				v-for="pipe in pipes" 
				:key="pipe.id"
				class="pipe-group"
				:style="{ transform: `translateX(${pipe.x}px)` }"
			>
				<!-- 上管道（从天花板向下生长） -->
				<view 
					class="pipe pipe-top" 
					:style="{ height: pipe.topHeight + 'px' }"
				>
					<view class="pipe-body"></view>
					<view class="pipe-head pipe-head-bottom"></view>
				</view>
				<!-- 下管道（从地面向上生长） -->
				<view 
					class="pipe pipe-bottom" 
					:style="{ top: (pipe.topHeight + pipe.gap) + 'px', bottom: '0px' }"
				>
					<view class="pipe-head pipe-head-top"></view>
					<view class="pipe-body"></view>
				</view>
			</view>
			
			<!-- 分数显示 -->
			<view class="score-display" v-if="gameStarted">
				<text class="score-text">{{ score }}</text>
			</view>
		</view>
		
		<!-- 底部控制区 -->
		<view class="bottom-panel" :class="{ 'panel-transparent': gameStarted && !gameOver }">
			<!-- 游戏未开始时显示开始按钮 -->
			<view v-if="!gameStarted && !gameOver" class="start-btn" @click.stop="startGame">
				<text class="start-btn-text">开始游戏</text>
			</view>
			
			<!-- 游戏结束时显示结果 -->
			<view v-if="gameOver" class="game-over-panel">
				<text class="game-over-title">游戏结束</text>
				<text class="game-over-score">得分: {{ score }}</text>
				<view class="restart-btn" @click.stop="restartGame">
					<text class="restart-btn-text">再来一次</text>
				</view>
			</view>
			
			<!-- 游戏进行中不显示提示（保持底部面板空间用于点击） -->
		</view>
		
		<!-- 调试面板（开发时使用） -->
		<view v-if="DEBUG_PANEL" class="debug-panel">
			<text class="debug-text">birdY: {{ Math.round(birdY) }}</text>
			<text class="debug-text">velocity: {{ Math.round(birdVelocity * 100) / 100 }}</text>
			<text class="debug-text">force: {{ currentForce }}</text>
			<text class="debug-text">pipes: {{ pipes.length }}</text>
		</view>
	</view>
</template>

<script setup>
import { ref, shallowRef, triggerRef, onMounted, onUnmounted, computed } from 'vue'
import { onBackPress } from '@dcloudio/uni-app'

// ==================== 配置常量 ====================
const DEBUG_PANEL = true  // 调试面板开关，发布时改为 false

// 输入模式：'simulate' = 点击模拟 | 'serial' = 串口力量值
const inputMode = ref('simulate')

// 游戏物理参数（固定值）
const GRAVITY = 0.4          // 重力加速度（每帧下落速度增量）
const JUMP_FORCE = -8        // 跳跃初速度（负值向上）
const MAX_FALL_SPEED = 10    // 最大下落速度
const BIRD_SIZE = 50         // 小鸟尺寸（像素）
const PIPE_WIDTH = 60        // 管道宽度（像素）- 头部宽度
const GROUND_RATIO = 0.20    // 地面占屏幕高度比例（20%）

// 基于屏幕尺寸的动态参数（在 onMounted 中计算）
let PIPE_SPEED = 4           // 管道移动速度（像素/帧）
let PIPE_GAP = 200           // 管道上下间隙（像素）
let PIPE_SPAWN_DISTANCE = 300  // 管道生成间距（像素）

// ==================== 游戏状态 ====================
const gameStarted = ref(false)
const gameOver = ref(false)
const score = ref(0)
const gameTime = ref(0)       // 游戏时间（秒）

// 小鸟状态
const birdY = ref(200)        // 小鸟 Y 坐标
const birdVelocity = ref(0)   // 小鸟垂直速度
const birdRotation = computed(() => {
	// 根据速度计算旋转角度，下落时低头，上升时抬头
	return Math.min(Math.max(birdVelocity.value * 3, -30), 90)
})

// 管道数组（使用 shallowRef 减少响应式开销）
const pipes = shallowRef([])
let pipeIdCounter = 0

// 游戏循环时间控制
let lastFrameTime = 0

// 力量输入
const currentForce = ref(0)

// 游戏区域尺寸
const gameAreaHeight = ref(500)
const gameAreaWidth = ref(375)

// 定时器
let gameLoop = null
let timeCounter = null

// ==================== 生命周期 ====================
onMounted(() => {
	// 获取游戏区域尺寸
	const sysInfo = uni.getSystemInfoSync()
	const W = sysInfo.windowWidth
	const H = sysInfo.windowHeight
	
	gameAreaWidth.value = W
	// 游戏区域高度 = 屏幕高度 - 地面高度（管道从地面长出，不是屏幕底部）
	const groundHeight = H * GROUND_RATIO
	gameAreaHeight.value = H - groundHeight
	
	// 基于屏幕尺寸计算游戏参数
	// 管道移动速度：0.24W/s，转换为像素/帧（60fps）
	PIPE_SPEED = (0.24 * W) / 60
	// 管道缺口高度：0.40H（基于游戏区域高度）- 更宽松
	PIPE_GAP = 0.40 * gameAreaHeight.value
	// 管道生成间距：0.68W
	PIPE_SPAWN_DISTANCE = 0.68 * W
	
	console.log(`游戏参数 - 速度: ${PIPE_SPEED.toFixed(2)}px/帧, 缺口: ${PIPE_GAP.toFixed(0)}px, 间距: ${PIPE_SPAWN_DISTANCE.toFixed(0)}px`)
	
	// 初始化小鸟位置（垂直居中偏上）
	birdY.value = gameAreaHeight.value / 2 - BIRD_SIZE / 2 - 50
})

onUnmounted(() => {
	stopGame()
})

onBackPress(() => {
	if (gameStarted.value && !gameOver.value) {
		// 游戏进行中，暂停并返回
		stopGame()
	}
	return false
})

// ==================== 游戏控制 ====================
const startGame = () => {
	gameStarted.value = true
	gameOver.value = false
	score.value = 0
	gameTime.value = 0
	pipes.value = []
	birdY.value = gameAreaHeight.value / 2 - BIRD_SIZE / 2
	birdVelocity.value = 0
	lastFrameTime = 0
	
	// 启动游戏循环（requestAnimationFrame 更流畅）
	const gameLoopRAF = (currentTime) => {
		if (!gameStarted.value || gameOver.value) return
		
		// 控制帧率约 60fps
		if (lastFrameTime === 0) lastFrameTime = currentTime
		const deltaTime = currentTime - lastFrameTime
		
		if (deltaTime >= 16) {  // ~60fps
			lastFrameTime = currentTime
			updateGame()
		}
		
		gameLoop = requestAnimationFrame(gameLoopRAF)
	}
	gameLoop = requestAnimationFrame(gameLoopRAF)
	
	// 启动计时器
	timeCounter = setInterval(() => {
		gameTime.value++
	}, 1000)
}

const stopGame = () => {
	if (gameLoop) {
		cancelAnimationFrame(gameLoop)
		gameLoop = null
	}
	if (timeCounter) {
		clearInterval(timeCounter)
		timeCounter = null
	}
}

const restartGame = () => {
	stopGame()
	startGame()
}

const endGame = () => {
	stopGame()
	gameOver.value = true
}

// ==================== 游戏逻辑 ====================
const updateGame = () => {
	if (!gameStarted.value || gameOver.value) return
	
	// 1. 更新小鸟位置（应用重力）
	birdVelocity.value += GRAVITY
	birdVelocity.value = Math.min(birdVelocity.value, MAX_FALL_SPEED)
	birdY.value += birdVelocity.value
	
	// 2. 边界检测
	if (birdY.value < 0) {
		birdY.value = 0
		birdVelocity.value = 0
	}
	if (birdY.value > gameAreaHeight.value - BIRD_SIZE) {
		// 碰到地面，游戏结束
		endGame()
		return
	}
	
	// 3. 更新管道位置（直接操作数组，最后手动触发更新）
	const birdLeft = 80  // 小鸟固定 X 坐标
	const birdRight = birdLeft + BIRD_SIZE
	const birdTop = birdY.value
	const birdBottom = birdY.value + BIRD_SIZE
	const pipeArray = pipes.value
	let needTrigger = false
	
	for (let i = pipeArray.length - 1; i >= 0; i--) {
		const pipe = pipeArray[i]
		pipe.x -= PIPE_SPEED
		needTrigger = true
		
		// 移出屏幕，移除管道
		if (pipe.x < -PIPE_WIDTH) {
			pipeArray.splice(i, 1)
			continue
		}
		
		// 4. 碰撞检测
		const pipeLeft = pipe.x
		const pipeRight = pipe.x + PIPE_WIDTH
		
		// 检查小鸟是否与管道在 X 轴重叠
		if (birdRight > pipeLeft && birdLeft < pipeRight) {
			// 检查是否碰到上管道或下管道
			const hitTop = birdTop < pipe.topHeight
			const hitBottom = birdBottom > pipe.topHeight + pipe.gap
			
			if (hitTop || hitBottom) {
				endGame()
				return
			}
		}
		
		// 5. 计分：小鸟通过管道
		if (!pipe.passed && pipe.x + PIPE_WIDTH < birdLeft) {
			pipe.passed = true
			score.value++
		}
	}
	
	// 6. 基于距离生成新管道
	const lastPipe = pipeArray[pipeArray.length - 1]
	const shouldSpawn = !lastPipe || (gameAreaWidth.value - lastPipe.x >= PIPE_SPAWN_DISTANCE)
	if (shouldSpawn) {
		spawnPipe()
		needTrigger = true
	}
	
	// 7. 手动触发管道数组更新（减少响应式开销）
	if (needTrigger) {
		triggerRef(pipes)
	}
}

const spawnPipe = () => {
	if (!gameStarted.value || gameOver.value) return
	
	// 随机生成上管道高度
	const minTopHeight = 80
	const maxTopHeight = gameAreaHeight.value - PIPE_GAP - 80
	const topHeight = Math.random() * (maxTopHeight - minTopHeight) + minTopHeight
	
	pipes.value.push({
		id: pipeIdCounter++,
		x: gameAreaWidth.value,
		topHeight: topHeight,
		gap: PIPE_GAP,
		passed: false
	})
}

// ==================== 输入处理 ====================
const handleTap = () => {
	if (!gameStarted.value || gameOver.value) return
	
	if (inputMode.value === 'simulate') {
		// 模拟模式：点击 = 跳跃
		jump()
		currentForce.value = 50  // 模拟力量值
		setTimeout(() => currentForce.value = 0, 200)
	}
}

const jump = () => {
	birdVelocity.value = JUMP_FORCE
}

// 串口模式下的力量输入处理（预留接口）
const handleForceInput = (force) => {
	if (!gameStarted.value || gameOver.value) return
	
	currentForce.value = force
	
	// 力量值超过阈值时跳跃
	if (force > 20) {
		// 力量越大，跳跃越高
		const jumpPower = JUMP_FORCE * (0.5 + (force / 100) * 0.8)
		birdVelocity.value = Math.max(jumpPower, JUMP_FORCE * 1.5)
	}
}

// ==================== 工具函数 ====================
const formatTime = (seconds) => {
	const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
	const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
	const s = (seconds % 60).toString().padStart(2, '0')
	return `${h}:${m}:${s}`
}

const goBack = () => {
	stopGame()
	uni.navigateBack()
}

// ==================== 暴露给外部的接口（串口模式用） ====================
defineExpose({
	handleForceInput,
	inputMode
})
</script>

<style scoped>
.game-container {
	position: relative;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
	background-color: #87CEEB;
}

/* 天空背景 - 全屏显示 */
.bg-sky {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 0;
}

/* 地面背景 - 底部装饰 */
.bg-ground {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 20%;
	z-index: 1;
}

/* 导航栏 */
.nav-bar {
	position: relative;
	z-index: 100;
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 90rpx;
	padding: 20rpx 30rpx 0;
}

.back-btn {
	width: 56rpx;
	height: 56rpx;
}

.nav-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.nav-placeholder {
	width: 56rpx;
}

/* 计时器 */
.timer-display {
	position: relative;
	z-index: 100;
	display: flex;
	justify-content: center;
	padding: 10rpx 0;
}

.timer-text {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

/* 游戏区域 - 绝对定位，从顶部到地面顶部 */
.game-area {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 20%;  /* 地面占 20%，游戏区域到地面顶部 */
	z-index: 10;
	overflow: hidden;
}

/* 小鸟 */
.bird {
	position: absolute;
	left: 80px;
	width: 50px;
	height: 50px;
	z-index: 20;
}

.bird-img {
	width: 100%;
	height: 100%;
}

/* 管道 */
.pipe-group {
	position: absolute;
	top: 0;
	width: 60px;
	height: 100%;
}

.pipe {
	position: absolute;
	width: 60px;
	display: flex;
	flex-direction: column;
	align-items: center;  /* 子元素水平居中 */
}

.pipe-top {
	top: 0;
	justify-content: flex-end;  /* head 在底部（管道末端） */
}

.pipe-bottom {
	/* top 和 bottom 都设置，让高度自动计算 */
	justify-content: flex-start;  /* head 在顶部（管道末端） */
}

/* 管道身体 - 绿色矩形 */
.pipe-body {
	flex: 1;
	width: 50px;
	background: linear-gradient(90deg, #5EBD3E 0%, #7ED957 50%, #5EBD3E 100%);
	border-left: 3px solid #2D5016;
	border-right: 3px solid #2D5016;
}

/* 管道头部 - 宽一点的矩形 */
.pipe-head {
	width: 60px;
	height: 30px;
	background: linear-gradient(90deg, #5EBD3E 0%, #7ED957 50%, #5EBD3E 100%);
	border: 3px solid #2D5016;
}

/* 上管道的头在底部 - 只有底部有圆角 */
.pipe-head-bottom {
	border-radius: 0 0 4px 4px;
}

/* 下管道的头在顶部 - 只有顶部有圆角 */
.pipe-head-top {
	border-radius: 4px 4px 0 0;
}

/* 分数显示 */
.score-display {
	position: absolute;
	top: 20rpx;
	left: 50%;
	transform: translateX(-50%);
	z-index: 50;
}

.score-text {
	font-size: 80rpx;
	font-weight: bold;
	color: #FFFFFF;
	text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

/* 底部面板 */
.bottom-panel {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 100;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
	background: linear-gradient(transparent, rgba(255, 255, 255, 0.9));
	transition: background 0.3s ease;
}

/* 游戏开始后去掉渐变 */
.panel-transparent {
	background: transparent;
}

.start-btn {
	background: linear-gradient(135deg, #8BC34A 0%, #4CAF50 100%);
	border-radius: 50rpx;
	padding: 30rpx 80rpx;
	box-shadow: 0 8rpx 20rpx rgba(76, 175, 80, 0.4);
}

.start-btn-text {
	font-size: 36rpx;
	font-weight: bold;
	color: #FFFFFF;
}

.game-over-panel {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20rpx;
}

.game-over-title {
	font-size: 48rpx;
	font-weight: bold;
	color: #E53935;
}

.game-over-score {
	font-size: 36rpx;
	color: #333;
}

.restart-btn {
	background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
	border-radius: 50rpx;
	padding: 24rpx 60rpx;
	margin-top: 20rpx;
	box-shadow: 0 8rpx 20rpx rgba(255, 152, 0, 0.4);
}

.restart-btn-text {
	font-size: 32rpx;
	font-weight: bold;
	color: #FFFFFF;
}

.force-hint {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10rpx;
}

.force-hint-text {
	font-size: 28rpx;
	color: #666;
}

.force-value {
	font-size: 32rpx;
	font-weight: bold;
	color: #4CAF50;
}

/* 调试面板 */
.debug-panel {
	position: absolute;
	left: 20rpx;
	top: 160rpx;
	z-index: 200;
	background: rgba(0, 0, 0, 0.6);
	padding: 12rpx 16rpx;
	border-radius: 8rpx;
}

.debug-text {
	display: block;
	font-size: 18rpx;
	color: #00FF00;
	font-family: monospace;
	line-height: 1.4;
}
</style>
