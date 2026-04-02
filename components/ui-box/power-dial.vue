<!--
 * 力量旋钮控制器组件
 * 功能：圆弧形力量调节，支持触摸拖动
 * 技术：renderjs + conic-gradient，高频操作完全在渲染层消化
 * 
 * 交互逻辑：
 * - 关机状态：中心显示电源图标，点击开机
 * - 开机状态：中心显示模式名+kg值，点击关机（力量归零）
 -->
<template>
	<view 
		class="power-dial"
		:id="dialId"
		:prop="syncData"
		:change:prop="bindDial.onDataChange"
	>
		<!-- 圆弧背景轨道（灰色） -->
		<view class="dial-arc-track"></view>
		
		<!-- 圆弧进度填充（绿色，conic-gradient） -->
		<view class="dial-arc-progress"></view>

		<!-- 小圆点指示器（绕圆心旋转） -->
		<view class="dial-indicator-rotator">
			<view class="dial-indicator-dot"></view>
		</view>

		<!-- 装饰图片 -->
		<image class="dial-decoration" src="/static/icons/freeTrainingActivity/ic_decoration.png" mode="aspectFit" />

		<!-- 中心按钮：关机状态显示电源图标 -->
		<view v-if="!viewPowerOn" class="dial-center-btn" @tap.stop="onPowerTap">
			<image class="power-icon" src="/static/icons/freeTrainingActivity/ic_power.svg" mode="aspectFit" />
		</view>
		
		<!-- 中心按钮：开机状态显示模式名+kg值 -->
		<view v-else class="dial-center-btn dial-center-btn--on" @tap.stop="onPowerTap">
			<text class="mode-name">{{ modeName }}</text>
			<text class="kg-value">{{ displayValue }}</text>
			<text class="kg-unit">kg</text>
		</view>
	</view>
</template>

<script>
/**
 * 逻辑层：负责数据管理和与父组件通信
 */
let instanceCounter = 0
const POWER_DIAL_TRACE_ENABLED = true

function formatTraceTime(ts = Date.now()) {
	const date = new Date(ts)
	const h = String(date.getHours()).padStart(2, '0')
	const m = String(date.getMinutes()).padStart(2, '0')
	const s = String(date.getSeconds()).padStart(2, '0')
	const ms = String(date.getMilliseconds()).padStart(3, '0')
	return `${h}:${m}:${s}.${ms}`
}

function tracePowerDial(event, payload = {}) {
	if (!POWER_DIAL_TRACE_ENABLED) return
	console.log(`[powerDialTrace ${formatTraceTime()}] ${event}`, payload)
}

export default {
	name: 'PowerDial',
	props: {
		modelValue: {
			type: Number,
			default: 0
		},
		min: {
			type: Number,
			default: 5
		},
		max: {
			type: Number,
			default: 55
		},
		disabled: {
			type: Boolean,
			default: false
		},
		controlledPower: {
			type: Boolean,
			default: false
		},
		powerOn: {
			type: Boolean,
			default: false
		},
		initialPowerOn: {
			type: Boolean,
			default: false
		},
		modeName: {
			type: String,
			default: '恒力'
		}
	},
	emits: ['update:modelValue', 'change', 'powerChange', 'requestPowerChange'],
	data() {
		return {
			internalPowerOn: this.initialPowerOn,
			dragValue: this.modelValue,
			isDragging: false,
			dialId: `power-dial-${++instanceCounter}-${Date.now()}`
		}
	},
	computed: {
		syncData() {
			return {
				value: this.modelValue,
				min: this.min,
				max: this.max,
				disabled: this.disabled,
				powerOn: this.viewPowerOn,
				dialId: this.dialId
			}
		},
		viewPowerOn() {
			return this.controlledPower ? this.powerOn : this.internalPowerOn
		},
		displayValue() {
			return this.isDragging ? this.dragValue : this.modelValue
		}
	},
	watch: {
		modelValue(newVal) {
			if (!this.isDragging) {
				this.dragValue = newVal
			}
		},
		initialPowerOn(newVal) {
			if (!this.controlledPower) {
				this.internalPowerOn = newVal
			}
		}
	},
	methods: {
		// 开关按钮点击
		onPowerTap() {
			if (this.disabled) return
			const previousPower = this.viewPowerOn
			const nextPower = !previousPower

			if (!this.controlledPower) {
				this.internalPowerOn = nextPower
				
				if (!nextPower) {
					// 关机：力量归零
					this.dragValue = this.min
					this.$emit('update:modelValue', this.min)
				}
			}

			tracePowerDial('tap power button', {
				previousPower,
				nextPower,
				controlledPower: this.controlledPower,
				modelValue: this.modelValue,
				dragValue: this.dragValue,
				min: this.min
			})

			if (this.controlledPower) {
				this.$emit('requestPowerChange', nextPower)
				return
			}

			this.$emit('powerChange', nextPower)
		},
		
		// renderjs 回调（仅 touchend 时调用）
		onDragEnd(value) {
			this.isDragging = false
			this.dragValue = value
			this.$emit('update:modelValue', value)
			this.$emit('change', value)
		},
		
		// 拖拽开始
		onDragStart() {
			this.isDragging = true
		},
		
		// 暴露方法
		setPower(on) {
			if (this.controlledPower) {
				this.$emit('requestPowerChange', on)
				return
			}

			this.internalPowerOn = on
			if (!on) {
				this.dragValue = this.min
				this.$emit('update:modelValue', this.min)
			}
			this.$emit('powerChange', on)
		},
		setValue(val) {
			if (!this.viewPowerOn) return
			const clamped = Math.max(this.min, Math.min(val, this.max))
			this.dragValue = clamped
			this.$emit('update:modelValue', clamped)
		},
		getPower() {
			return this.viewPowerOn
		},
		getValue() {
			return this.modelValue
		}
	}
}
</script>

<script module="bindDial" lang="renderjs">
/**
 * 渲染层：高频触摸操作完全在这里消化，只有 touchend 才回调逻辑层
 */
export default {
	data() {
		return {
			dialEl: null,
			arcProgressEl: null,
			indicatorEl: null,
			centerBtnEl: null,
			valueEl: null,
			decorationEl: null,
			
			currentValue: 0,
			min: 5,
			max: 55,
			disabled: false,
			powerOn: false,
			isDragging: false,
			
			centerX: 0,
			centerY: 0,
			
			startAngle: -120,
			endAngle: 120,
			totalAngle: 240,
			
			ownerInstance: null,
			bindDone: false,
			
			// RAF 合帧
			_rafId: null,
			_pendingX: 0,
			_pendingY: 0,
			
			_onStart: null,
			_onMove: null,
			_onEnd: null
		}
	},
	beforeDestroy() {
		this.unbindEvents()
	},
	methods: {
		onDataChange(newData, oldData, ownerInstance, instance) {
			this.ownerInstance = ownerInstance
			
			if (newData) {
				const val = Number(newData.value)
				this.min = newData.min
				this.max = newData.max
				this.currentValue = isNaN(val) ? this.min : Math.max(this.min, Math.min(val, this.max))
				this.disabled = newData.disabled
				// 开关状态变化时，清除 kg-value 缓存（v-if 会重建 DOM）
				if (this.powerOn !== newData.powerOn) {
					this.valueEl = null
				}
				this.powerOn = newData.powerOn
			}
			
			if (!this.bindDone && instance && instance.$el) {
				this.bindDone = true
				this.bindEvents(instance.$el)
			}
			
			if (!this.isDragging) {
				this.syncView()
			}
		},
		
		bindEvents(el) {
			if (!el) return
			
			this.dialEl = el
			this.arcProgressEl = el.querySelector('.dial-arc-progress')
			this.indicatorEl = el.querySelector('.dial-indicator-rotator')
			this.decorationEl = el.querySelector('.dial-decoration')
			this.valueEl = el.querySelector('.kg-value')
			
			this._onStart = (e) => this.onTouchStart(e)
			this._onMove = (e) => this.onTouchMove(e)
			this._onEnd = (e) => this.onTouchEnd(e)
			
			el.addEventListener('touchstart', this._onStart, { passive: false })
			el.addEventListener('touchmove', this._onMove, { passive: false })
			el.addEventListener('touchend', this._onEnd, { passive: false })
			el.addEventListener('touchcancel', this._onEnd, { passive: false })
		},
		
		unbindEvents() {
			if (this.dialEl && this._onStart) {
				this.dialEl.removeEventListener('touchstart', this._onStart)
				this.dialEl.removeEventListener('touchmove', this._onMove)
				this.dialEl.removeEventListener('touchend', this._onEnd)
				this.dialEl.removeEventListener('touchcancel', this._onEnd)
			}
		},
		
		onTouchStart(e) {
			if (this.disabled || !this.powerOn) return
			
			// 检查是否点击了中心按钮区域（让逻辑层处理）
			const target = e.target
			if (target && target.classList && target.classList.contains('dial-center-btn')) return
			if (target && target.closest && target.closest('.dial-center-btn')) return
			
			e.preventDefault()
			e.stopPropagation()
			
			// 使用圆弧元素的中心作为圆心（弧有 top: 20rpx 偏移，比根节点更准）
			const refEl = this.arcProgressEl || this.dialEl
			if (!refEl) return
			const rect = refEl.getBoundingClientRect()
			this.centerX = rect.left + rect.width / 2
			this.centerY = rect.top + rect.height / 2
			
			// 环形命中判断：触点必须落在弧线附近才允许拖动
			// 弧线可见区域 50%~60% 半径，容差放宽到 35%~80%
			if (e.touches && e.touches[0]) {
				const dx = e.touches[0].clientX - this.centerX
				const dy = e.touches[0].clientY - this.centerY
				const dist = Math.sqrt(dx * dx + dy * dy)
				const radius = rect.width / 2
				const ratio = dist / radius
				if (ratio < 0.35 || ratio > 0.80) return  // 太靠内或太靠外，忽略
			}
			
			this.isDragging = true
			
			if (this.ownerInstance) {
				this.ownerInstance.callMethod('onDragStart')
			}
			
			if (e.touches && e.touches[0]) {
				this.updateFromTouch(e.touches[0].clientX, e.touches[0].clientY)
			}
		},
		
		onTouchMove(e) {
			if (this.disabled || !this.powerOn || !this.isDragging) return
			
			e.preventDefault()
			e.stopPropagation()
			
			if (e.touches && e.touches[0]) {
				this._pendingX = e.touches[0].clientX
				this._pendingY = e.touches[0].clientY
				if (!this._rafId) {
					this._rafId = requestAnimationFrame(() => {
						this._rafId = null
						if (this.isDragging) {
							this.updateFromTouch(this._pendingX, this._pendingY)
						}
					})
				}
			}
		},
		
		onTouchEnd(e) {
			if (!this.isDragging) return
			
			e.preventDefault()
			e.stopPropagation()
			
			// 取消未执行的 RAF，用最新坐标做最终更新
			if (this._rafId) {
				cancelAnimationFrame(this._rafId)
				this._rafId = null
				this.updateFromTouch(this._pendingX, this._pendingY)
			}
			
			this.isDragging = false
			
			if (this.ownerInstance) {
				this.ownerInstance.callMethod('onDragEnd', this.currentValue)
			}
		},
		
		updateFromTouch(touchX, touchY) {
			const dx = touchX - this.centerX
			const dy = touchY - this.centerY
			
			let angleRaw = Math.atan2(dy, dx) * 180 / Math.PI
			let angle = angleRaw + 90
			
			if (angle > 180) angle -= 360
			if (angle < -180) angle += 360
			
			angle = Math.max(this.startAngle, Math.min(angle, this.endAngle))
			
			const ratio = (angle - this.startAngle) / this.totalAngle
			const value = Math.round(this.min + ratio * (this.max - this.min))
			
			this.currentValue = value
			this.updateDOM(ratio)
		},
		
		updateDOM(ratio) {
			const angle = ratio * this.totalAngle
			
			if (this.arcProgressEl) {
				this.arcProgressEl.style.setProperty('--progress-angle', angle + 'deg')
			}
			
			// 小圆点跟随进度旋转（起始 -120°）
			if (this.indicatorEl) {
				this.indicatorEl.style.transform = 'rotate(' + (this.startAngle + angle) + 'deg)'
			}
			
			// 更新 kg 值显示（懒缓存：开机后首次拖动时才查询）
			if (!this.valueEl) {
				this.valueEl = this.dialEl ? this.dialEl.querySelector('.kg-value') : null
			}
			if (this.valueEl) {
				this.valueEl.textContent = this.currentValue
			}
		},
		
		syncView() {
			const range = this.max - this.min
			if (range <= 0) return
			
			const ratio = Math.max(0, Math.min(1, (this.currentValue - this.min) / range))
			const angle = ratio * this.totalAngle
			
			if (this.arcProgressEl) {
				if (this.powerOn && angle > 0) {
					this.arcProgressEl.style.setProperty('--progress-angle', angle + 'deg')
					this.arcProgressEl.style.opacity = '1'
				} else {
					this.arcProgressEl.style.opacity = '0'
				}
			}
			
			if (this.indicatorEl) {
				if (this.powerOn && angle > 0) {
					this.indicatorEl.style.transform = 'rotate(' + (this.startAngle + angle) + 'deg)'
					this.indicatorEl.style.opacity = '1'
				} else {
					this.indicatorEl.style.opacity = '0'
				}
			}
			
			if (this.decorationEl) {
				this.decorationEl.style.opacity = this.powerOn ? '1' : '0'
			}
		}
	}
}
</script>

<style scoped>
.power-dial {
	position: relative;
	width: 400rpx;
	height: 400rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	/* 禁用浏览器默认触摸行为，避免 passive event listener 警告 */
	touch-action: none;
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	user-select: none;
}

.dial-arc-track {
	position: absolute;
	width: 100%;
	height: 100%;
	top: 20rpx;
	border-radius: 50%;
	background: conic-gradient(
		from -120deg at 50% 50%,
		#e0e0e0 0deg,
		#e0e0e0 240deg,
		transparent 240deg
	);
	/* 内圈 52% 透明，外圈 72% 以外透明，圆弧宽度 20% */
	-webkit-mask: radial-gradient(circle, transparent 50%, black 50%, black 60%, transparent 60%);
	mask: radial-gradient(circle, transparent 50%, black 50%, black 60%, transparent 60%);
	pointer-events: none;
}

.dial-arc-progress {
	position: absolute;
	width: 100%;
	height: 100%;
	top: 20rpx;
	border-radius: 50%;
	--progress-angle: 0deg;
	background: conic-gradient(
		from -120deg at 50% 50%,
		#00C853 0deg,
		#00C853 var(--progress-angle),
		transparent var(--progress-angle),
		transparent 240deg
	);
	-webkit-mask: radial-gradient(circle, transparent 50%, black 50%, black 60%, transparent 60%);
	mask: radial-gradient(circle, transparent 50%, black 50%, black 60%, transparent 60%);
	pointer-events: none;
	opacity: 0;
	filter: drop-shadow(0 0 8px rgba(0, 200, 83, 0.5));
	transition: opacity 0.3s;
}

/* 小圆点指示器：外层旋转器 */
.dial-indicator-rotator {
	position: absolute;
	width: 100%;
	height: 100%;
	top: 20rpx;
	border-radius: 50%;
	pointer-events: none;
	transform: rotate(-120deg);  /* 初始角度：弧线起点 */
	opacity: 0;
	transition: opacity 0.3s;
	z-index: 2;
}

/* 小圆点本体：在 rotator 本地坐标中放在 12 点钟方向、弧线中线处
   rotator 旋转后，dot 会跟着绕圆心走到实际角度位置 */
.dial-indicator-dot {
	position: absolute;
	width: 42rpx;
	height: 42rpx;
	border-radius: 50%;
	background: rgba(0, 0, 0, 0.5);
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
	/* mask 用 circle 默认 farthest-corner = 282.8rpx
	   弧线 50%~60% → 141~170rpx，中点 55% = 155rpx
	   top = 200 - 155 = 45rpx */
	top: 45rpx;
	left: 50%;
	transform: translate(-50%, -50%);
}

.dial-decoration {
	position: absolute;
	width: 700rpx;
	height: 380rpx;
	bottom: -80rpx;
	left: 50%;
	transform: translateX(-50%);
	pointer-events: none;
	z-index: 1;
	opacity: 0;
	transition: opacity 0.3s;
}

/* 中心按钮：关机状态 */
.dial-center-btn {
	position: relative;
	width: 160rpx;
	height: 160rpx;
	margin-top: 20rpx;
	border-radius: 50%;
	background: linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-shadow: 
		0 6rpx 20rpx rgba(0, 0, 0, 0.15),
		inset 0 1rpx 2rpx rgba(255, 255, 255, 0.9);
	transition: all 0.3s;
	z-index: 3;
}

.dial-center-btn:active {
	transform: scale(0.95);
}

/* 中心按钮：开机状态 */
.dial-center-btn--on {
	background: linear-gradient(180deg, #8BC34A 0%, #689F38 100%);
	box-shadow: 
		0 6rpx 24rpx rgba(139, 195, 74, 0.5),
		inset 0 1rpx 2rpx rgba(255, 255, 255, 0.3);
}

.power-icon {
	width: 64rpx;
	height: 64rpx;
	opacity: 0.6;
}

.mode-name {
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.9);
	font-weight: 500;
}

.kg-value {
	font-size: 48rpx;
	font-weight: bold;
	color: #FFFFFF;
	line-height: 1;
	margin-top: 2rpx;
}

.kg-unit {
	font-size: 18rpx;
	color: rgba(255, 255, 255, 0.8);
	margin-top: 2rpx;
}
</style>
