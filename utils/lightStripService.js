/**
 * CM-XS 灯带串口最小服务
 *
 * 目标：独立打开 /dev/ttyS4，发送灯带控制命令，方便验证硬件链路。
 *
 * 协议说明：
 * - 帧格式固定为：5E5F + 地址(1B) + 000002 + 数据(2B) + 5AFE
 * - 当前单灯地址使用 0x55，广播地址使用 0x00
 * - 内置花样值范围为 0x01~0x0F，写入最后 1 字节数据位，不是目标地址
 * - 当前内置开启命令使用：播放模式 0x00 + 花样号 0x04（白色）
 * - 回包固定 10 字节，读取时按帧头 5E5F / 帧尾 5AFE 做完整帧提取，兼容拆包/粘包
 */

import {
	openSerial,
	writeSerial,
	readSerial,
	closeSerial
} from '@/uni_modules/wzl-serialbridge'
import { SERIAL_DEVICES } from '@/utils/serialConfig.js'

const config = SERIAL_DEVICES.lightStrip

const ADDRESS_BROADCAST = 0x00
const ADDRESS_DEFAULT = 0x55
const EFFECT_ON = 0x0004 // 白色：播放模式 0x00，花样号 0x04
const EFFECT_OFF = 0xFFFF
const ACK_BYTES = 10
const ACK_HEX_LENGTH = ACK_BYTES * 2
const FRAME_HEAD = '5E5F'
const FRAME_TAIL = '5AFE'
const READ_CHUNK_BYTES = 32

let portId = 0
let connectPromise = null
let rxBuffer = ''

function normalizeHex(hex) {
	return String(hex || '').replace(/\s+/g, '').toUpperCase()
}

function toHex8(value) {
	return (value & 0xFF).toString(16).padStart(2, '0').toUpperCase()
}

function toHex16(value) {
	return (value & 0xFFFF).toString(16).padStart(4, '0').toUpperCase()
}

function buildRunEffectFrame(effectCode, address = ADDRESS_DEFAULT) {
	return `5E5F${toHex8(address)}000002${toHex16(effectCode)}5AFE`
}

function findFrameHeadIndex(hex, from = 0) {
	const start = from % 2 === 0 ? from : from + 1
	for (let i = start; i <= hex.length - FRAME_HEAD.length; i += 2) {
		if (hex.substring(i, i + FRAME_HEAD.length) === FRAME_HEAD) {
			return i
		}
	}
	return -1
}

function trimRxBufferForNextHead() {
	if (rxBuffer.endsWith(FRAME_HEAD.substring(0, 2))) {
		rxBuffer = rxBuffer.substring(rxBuffer.length - 2)
		return
	}
	rxBuffer = ''
}

function extractAckFrame() {
	while (true) {
		const headIndex = findFrameHeadIndex(rxBuffer)
		if (headIndex === -1) {
			trimRxBufferForNextHead()
			return null
		}

		if (headIndex > 0) {
			rxBuffer = rxBuffer.substring(headIndex)
		}

		if (rxBuffer.length < ACK_HEX_LENGTH) {
			return null
		}

		const frameHex = rxBuffer.substring(0, ACK_HEX_LENGTH)
		if (!frameHex.endsWith(FRAME_TAIL)) {
			rxBuffer = rxBuffer.substring(2)
			continue
		}

		rxBuffer = rxBuffer.substring(ACK_HEX_LENGTH)
		return frameHex
	}
}

function parseFrameAddress(hex) {
	const normalizedHex = normalizeHex(hex)
	if (normalizedHex.length < 8 || !normalizedHex.startsWith('5E5F')) {
		return null
	}
	return parseInt(normalizedHex.substring(4, 6), 16)
}

function ensurePortId() {
	if (portId <= 0) {
		throw { errCode: 10005, errMsg: '灯带串口未连接' }
	}
}

export function connect() {
	if (portId > 0) {
		console.log('[lightStripService] 灯带串口已连接, portId:', portId)
		return Promise.resolve({ portId, message: '已连接' })
	}

	if (connectPromise) {
		return connectPromise
	}

	console.log('[lightStripService] 正在连接灯带串口...', config)

	connectPromise = new Promise((resolve, reject) => {
		openSerial({
			path: config.path,
			config: {
				baudRate: config.baudRate,
				dataBits: config.dataBits,
				stopBits: config.stopBits,
				parity: config.parity
			},
			success: (res) => {
				portId = res.portId
				rxBuffer = ''
				console.log('[lightStripService] 灯带串口连接成功, portId:', portId)
				resolve(res)
			},
			fail: (err) => {
				console.error('[lightStripService] 灯带串口连接失败:', err)
				reject(err)
			}
		})
	})

	return connectPromise.finally(() => {
		connectPromise = null
	})
}

function writeHex(hex) {
	ensurePortId()
	return new Promise((resolve, reject) => {
		writeSerial({
			portId,
			data: hex,
			format: 'hex',
			timeout: 300,
			success: resolve,
			fail: reject
		})
	})
}

function readChunk(timeout) {
	ensurePortId()
	return new Promise((resolve) => {
		readSerial({
			portId,
			length: READ_CHUNK_BYTES,
			format: 'hex',
			timeout,
			success: (res) => {
				if (res.bytesRead > 0) {
					console.log('[lightStripService] response:', res.data)
				}
				resolve(res)
			},
			fail: (err) => {
				console.warn('[lightStripService] 读取灯带应答失败，继续执行:', err)
				resolve({ bytesRead: 0, data: '' })
			}
		})
	})
}

async function tryReadAck(timeout = 300) {
	const bufferedFrame = extractAckFrame()
	if (bufferedFrame) {
		return {
			bytesRead: ACK_BYTES,
			data: bufferedFrame
		}
	}

	const deadline = Date.now() + timeout
	let lastBytesRead = 0

	while (Date.now() < deadline) {
		const remaining = Math.max(30, deadline - Date.now())
		const res = await readChunk(remaining)
		lastBytesRead = res.bytesRead || lastBytesRead

		if (res.bytesRead > 0 && res.data) {
			rxBuffer += normalizeHex(res.data)
			const frameHex = extractAckFrame()
			if (frameHex) {
				return {
					...res,
					bytesRead: ACK_BYTES,
					data: frameHex
				}
			}
		}
	}

	return {
		bytesRead: 0,
		data: '',
		partial: lastBytesRead > 0
	}
}

async function sendRunEffect(effectCode, label, address = ADDRESS_DEFAULT) {
	const hex = buildRunEffectFrame(effectCode, address)
	console.log(`[lightStripService] ${label} send:`, hex)
	await writeHex(hex)

	if (address === ADDRESS_BROADCAST) {
		return {
			bytesRead: 0,
			data: '',
			noResponseExpected: true,
			address
		}
	}

	return tryReadAck()
}

export async function sendHex(hex, {
	timeout = 300
} = {}) {
	const normalizedHex = normalizeHex(hex)

	if (!normalizedHex) {
		throw { errCode: 10006, errMsg: '发送数据不能为空' }
	}

	if (normalizedHex.length % 2 !== 0) {
		throw { errCode: 10006, errMsg: 'HEX 长度必须为偶数' }
	}

	if (!/^[0-9A-F]+$/.test(normalizedHex)) {
		throw { errCode: 10006, errMsg: 'HEX 数据格式无效' }
	}

	console.log('[lightStripService] custom send:', normalizedHex)
	await writeHex(normalizedHex)

	const address = parseFrameAddress(normalizedHex)
	if (address === ADDRESS_BROADCAST) {
		return {
			bytesRead: 0,
			data: '',
			noResponseExpected: true,
			address
		}
	}

	return tryReadAck(timeout)
}

export function turnOn({
	address = ADDRESS_DEFAULT,
	effectCode = EFFECT_ON
} = {}) {
	return sendRunEffect(effectCode, 'turnOn', address)
}

export function turnOff({
	address = ADDRESS_DEFAULT
} = {}) {
	return sendRunEffect(EFFECT_OFF, 'turnOff', address)
}

export function runBuiltInEffect({
	address = ADDRESS_DEFAULT,
	effectCode = EFFECT_ON
} = {}) {
	return sendRunEffect(effectCode & 0x000F, 'runBuiltInEffect', address)
}

export function cleanup() {
	if (portId <= 0) {
		rxBuffer = ''
		return
	}

	const closingPortId = portId
	portId = 0
	rxBuffer = ''

	closeSerial({
		portId: closingPortId,
		success: () => {
			console.log('[lightStripService] 灯带串口已关闭')
		},
		fail: (err) => {
			console.error('[lightStripService] 灯带串口关闭失败:', err)
		}
	})
}

export function getStatus() {
	return {
		isConnected: portId > 0,
		portId,
		path: config.path,
		baudRate: config.baudRate,
		defaultAddress: ADDRESS_DEFAULT,
		broadcastAddress: ADDRESS_BROADCAST
	}
}

export default {
	connect,
	sendHex,
	turnOn,
	turnOff,
	runBuiltInEffect,
	cleanup,
	getStatus
}
