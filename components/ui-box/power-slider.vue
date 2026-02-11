<!--
 * 高性能力量滑块组件
 * App 平台：使用 renderjs + addEventListener 在渲染层直接处理触摸事件，零延迟
 * H5 平台：使用逻辑层事件处理（fallback）
 -->
<template>
	<view 
		class="power-slider"
		:class="{ 'is-disabled': disabled }"
		:prop="syncData"
		:change:prop="bindSlider.onDataChange"
	>
		<!-- 轨道背景 -->
		<view class="slider-track"></view>
		<!-- 已选区填充 -->
		<view 
			class="slider-fill"
			:style="fillStyle"
		></view>
		<!-- 滑块按钮 -->
		<view 
			class="slider-thumb"
			:style="thumbStyle"
		></view>
		<!-- 触摸热区（由 renderjs 绑定原生事件） -->
		<view 
			class="slider-touch-area"
			:id="touchAreaId"
		></view>
	</view>
</template>

<script>
/**
 * 逻辑层：负责数据管理和与父组件通信
 */
let instanceCounter = 0

export default {
	name: 'PowerSlider',
	props: {
		modelValue: {
			type: Number,
			default: 30
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
		}
	},
	emits: ['update:modelValue', 'change', 'dragging'],
	data() {
		return {
			dragValue: this.modelValue,
			isDragging: false,
			sliderRect: null,
			// 每个实例生成唯一 ID
			touchAreaId: `slider-touch-${++instanceCounter}-${Date.now()}`
		}
	},
	computed: {
		syncData() {
			return {
				value: this.modelValue,
				min: this.min,
				max: this.max,
				disabled: this.disabled,
				touchAreaId: this.touchAreaId
			}
		},
		fillScale() {
			const val = this.isDragging ? this.dragValue : this.modelValue
			const range = this.max - this.min
			if (range <= 0) return 0
			const scale = (val - this.min) / range
			return Math.max(0, Math.min(1, scale))
		},
		fillStyle() {
			return { transform: `scaleX(${this.fillScale})` }
		},
		thumbStyle() {
			const percent = this.fillScale * 100
			return { transform: `translateX(calc(${percent}cqw - 24rpx))` }
		}
	},
	watch: {
		modelValue(newVal) {
			if (!this.isDragging) {
				this.dragValue = newVal
			}
		}
	},
	// #ifndef APP-PLUS
	// H5 平台：在逻辑层挂载触摸事件
	mounted() {
		this.$nextTick(() => {
			const query = uni.createSelectorQuery().in(this)
			query.select('.power-slider').boundingClientRect((rect) => {
				this.sliderRect = rect
			}).exec()
		})
	},
	// #endif
	methods: {
		// ========== renderjs 回调（App 平台） ==========
		onDragUpdate(value) {
			this.isDragging = true
			this.dragValue = value
			this.$emit('dragging', value)
		},
		onDragEnd(value) {
			this.isDragging = false
			this.dragValue = value
			this.$emit('update:modelValue', value)
			this.$emit('change', value)
		},
		onDragCancel() {
			this.isDragging = false
			this.dragValue = this.modelValue
		},
		
		// ========== H5 Fallback ==========
		// #ifndef APP-PLUS
		handleTouchStart(e) {
			if (this.disabled) return
			e.preventDefault()
			e.stopPropagation()
			
			this.isDragging = true
			
			const query = uni.createSelectorQuery().in(this)
			query.select('.power-slider').boundingClientRect((rect) => {
				this.sliderRect = rect
				if (rect && e.touches && e.touches[0]) {
					this.updateValueFromTouch(e.touches[0].clientX)
				}
			}).exec()
		},
		handleTouchMove(e) {
			if (this.disabled || !this.isDragging) return
			if (e.cancelable) e.preventDefault()
			
			if (e.touches && e.touches[0] && this.sliderRect) {
				this.updateValueFromTouch(e.touches[0].clientX)
			}
		},
		handleTouchEnd(e) {
			if (!this.isDragging) return
			e.preventDefault()
			
			this.isDragging = false
			this.$emit('update:modelValue', this.dragValue)
			this.$emit('change', this.dragValue)
		},
		updateValueFromTouch(touchX) {
			if (!this.sliderRect) return
			
			let offsetX = touchX - this.sliderRect.left
			offsetX = Math.max(0, Math.min(offsetX, this.sliderRect.width))
			
			const scale = offsetX / this.sliderRect.width
			const newValue = Math.round(this.min + scale * (this.max - this.min))
			
			if (newValue !== this.dragValue) {
				this.dragValue = newValue
				this.$emit('dragging', newValue)
			}
		}
		// #endif
	}
}
</script>

<!-- #ifdef APP-PLUS -->
<script module="bindSlider" lang="renderjs">
/**
 * 渲染层（仅 App 平台）
 * 通过 onDataChange 的 instance 参数获取 DOM 元素
 */
export default {
	data() {
		return {
			sliderRect: null,
			sliderEl: null,
			fillEl: null,
			thumbEl: null,
			halfThumbPx: 12, // 默认值，会在 bindEvents 中测量实际值
			currentValue: 30,
			min: 5,
			max: 55,
			disabled: false,
			isDragging: false,
			ownerInstance: null,
			bindDone: false,
			// 事件回调引用（用于解绑）
			_onStart: null,
			_onMove: null,
			_onEnd: null
		}
	},
	beforeDestroy() {
		// 组件销毁时解绑事件，防止内存泄漏
		this.unbindEvents()
	},
	methods: {
		// 接收逻辑层数据变化 - 这是获取 DOM 的唯一可靠入口
		onDataChange(newData, oldData, ownerInstance, instance) {
			this.ownerInstance = ownerInstance
			
			if (newData) {
				this.currentValue = newData.value
				this.min = newData.min
				this.max = newData.max
				this.disabled = newData.disabled
			}
			
			// 只绑定一次事件
			if (!this.bindDone && instance && instance.$el) {
				this.bindDone = true
				this.bindEvents(instance.$el)
			}
		},
		
		// 解绑触摸事件
		unbindEvents() {
			if (this.sliderEl && this._onStart) {
				this.sliderEl.removeEventListener('touchstart', this._onStart)
				this.sliderEl.removeEventListener('touchmove', this._onMove)
				this.sliderEl.removeEventListener('touchend', this._onEnd)
				this.sliderEl.removeEventListener('touchcancel', this._onEnd)
			}
			this._onStart = null
			this._onMove = null
			this._onEnd = null
			this.sliderEl = null
			this.fillEl = null
			this.thumbEl = null
			this.bindDone = false
		},
		
		// 绑定触摸事件
		bindEvents(el) {
			if (!el) return
			
			this.sliderEl = el
			this.fillEl = el.querySelector('.slider-fill')
			this.thumbEl = el.querySelector('.slider-thumb')
			
			// 测量 thumb 实际像素宽度（rpx 在不同设备转换值不同）
			if (this.thumbEl) {
				const thumbRect = this.thumbEl.getBoundingClientRect()
				this.halfThumbPx = thumbRect.width / 2
			}
			
			// 绑定回调并保存引用（解决 this 指向问题 + 方便卸载）
			this._onStart = (e) => this.onTouchStart(e)
			this._onMove = (e) => this.onTouchMove(e)
			this._onEnd = (e) => this.onTouchEnd(e)
			
			el.addEventListener('touchstart', this._onStart, { passive: false })
			el.addEventListener('touchmove', this._onMove, { passive: false })
			el.addEventListener('touchend', this._onEnd, { passive: false })
			el.addEventListener('touchcancel', this._onEnd, { passive: false })
		},
		
		// 触摸开始
		onTouchStart(e) {
			e.preventDefault()
			e.stopPropagation()
			
			if (this.disabled) return
			
			this.isDragging = true
			
			if (this.sliderEl) {
				this.sliderRect = this.sliderEl.getBoundingClientRect()
			}
			
			if (e.touches && e.touches[0]) {
				this.updatePosition(e.touches[0].clientX)
			}
		},
		
		// 触摸移动
		onTouchMove(e) {
			e.preventDefault()
			e.stopPropagation()
			
			if (this.disabled || !this.isDragging || !this.sliderRect) return
			
			if (e.touches && e.touches[0]) {
				this.updatePosition(e.touches[0].clientX)
			}
		},
		
		// 触摸结束
		onTouchEnd(e) {
			e.preventDefault()
			e.stopPropagation()
			
			if (!this.isDragging) return
			
			this.isDragging = false
			this.sliderRect = null
			
			if (this.ownerInstance) {
				this.ownerInstance.callMethod('onDragEnd', this.currentValue)
			}
		},
		
		// 更新位置（完全在渲染层执行）
		updatePosition(touchX) {
			if (!this.sliderRect) return
			
			let offsetX = touchX - this.sliderRect.left
			offsetX = Math.max(0, Math.min(offsetX, this.sliderRect.width))
			
			const scale = this.sliderRect.width > 0 
				? Math.max(0, Math.min(1, offsetX / this.sliderRect.width))
				: 0
			
			// 视觉每次都更新（连续），不受整数值约束
			if (this.fillEl) {
				this.fillEl.style.transform = `scaleX(${scale})`
			}
			if (this.thumbEl) {
				const thumbOffset = scale * this.sliderRect.width
				this.thumbEl.style.transform = `translateX(${thumbOffset - this.halfThumbPx}px)`
			}
			
			// ✅ 业务值只有变化时才更新并回调（离散）
			const newValue = Math.round(this.min + scale * (this.max - this.min))
			if (newValue !== this.currentValue) {
				this.currentValue = newValue
				if (this.ownerInstance) {
					this.ownerInstance.callMethod('onDragUpdate', newValue)
				}
			}
		}
	}
}
</script>
<!-- #endif -->

<!-- #ifndef APP-PLUS -->
<script module="bindSlider" lang="renderjs">
/**
 * H5 平台占位模块（renderjs 在 H5 不生效，但需要定义避免报错）
 */
export default {
	methods: {
		onDataChange() {
			// H5 平台不使用 renderjs
		}
	}
}
</script>
<!-- #endif -->

<style scoped lang="scss">
.power-slider {
	position: relative;
	height: 48rpx;
	display: flex;
	align-items: center;
	container-type: inline-size;
	touch-action: none;
	-webkit-user-select: none;
	user-select: none;
}

.power-slider.is-disabled {
	opacity: 0.5;
	pointer-events: none;
}

/* 轨道背景 */
.slider-track {
	position: absolute;
	left: 0;
	right: 0;
	height: 20rpx;
	background: #E8E8E8;
	border-radius: 10rpx;
}

/* 已选区填充 */
.slider-fill {
	position: absolute;
	left: 0;
	width: 100%;
	height: 20rpx;
	background: linear-gradient(90deg, #66BB6A 0%, #4CAF50 100%);
	border-radius: 10rpx;
	transform-origin: left center;
	will-change: transform;
	pointer-events: none;
}

/* 滑块按钮 */
.slider-thumb {
	position: absolute;
	left: 0;
	width: 48rpx;
	height: 48rpx;
	background: #FFFFFF;
	border-radius: 50%;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.25);
	border: 2rpx solid rgba(0, 0, 0, 0.08);
	will-change: transform;
	z-index: 10;
	touch-action: none;
}

/* 触摸热区 */
.slider-touch-area {
	position: absolute;
	left: -20rpx;
	right: -20rpx;
	top: -20rpx;
	bottom: -20rpx;
	z-index: 15;
	touch-action: none;
}

/* 禁用状态 */
.power-slider.is-disabled .slider-fill {
	background: #CCCCCC;
}

.power-slider.is-disabled .slider-thumb {
	background: #E0E0E0;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);
}
</style>
