/**
 * 串口配置集中定义
 *
 * 切换 Android 板卡时，只改 ACTIVE_SERIAL_BOARD 一处即可。
 */
export const SERIAL_BOARD_PRESETS = {
	'3568': {
		motor: {
			path: '/dev/ttyS9',
			baudRate: 115200,
			dataBits: 8,
			stopBits: 1,
			parity: 'none'
		},
		lightStrip: {
			path: '/dev/ttyS4',
			baudRate: 115200,
			dataBits: 8,
			stopBits: 1,
			parity: 'none'
		}
	},
	'3576': {
		motor: {
			path: '/dev/ttyS8',
			baudRate: 115200,
			dataBits: 8,
			stopBits: 1,
			parity: 'none'
		},
		lightStrip: {
			path: '/dev/ttyS6',
			baudRate: 115200,
			dataBits: 8,
			stopBits: 1,
			parity: 'none'
		}
	}
}

// 可选值：'3568' | '3576'
export const ACTIVE_SERIAL_BOARD = '3576'

const activeBoardConfig = SERIAL_BOARD_PRESETS[ACTIVE_SERIAL_BOARD]

if (!activeBoardConfig) {
	throw new Error(`[serialConfig] 未知板卡配置: ${ACTIVE_SERIAL_BOARD}`)
}

export const SERIAL_DEVICES = activeBoardConfig
/**
 * 当前默认使用 3568：
 * - 电机串口（232）：/dev/ttyS9
 * - 灯带串口（485）：/dev/ttyS4
 *
 * 3576 对应：
 * - 电机串口（232）：/dev/ttyS8
 * - 灯带串口（485）：/dev/ttyS6
 */
