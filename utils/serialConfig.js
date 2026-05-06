/**
 * 串口配置集中定义
 *
 * 需要手动切换默认串口设备路径时，优先修改这里。
 */
export const SERIAL_DEVICE_PATH = '/dev/ttyS9'
export const SERIAL_BAUD_RATE = 115200

export const SERIAL_DEVICES = {
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
}

export const LIGHT_STRIP_DEVICE_PATH = SERIAL_DEVICES.lightStrip.path
export const LIGHT_STRIP_BAUD_RATE = SERIAL_DEVICES.lightStrip.baudRate
