const requestAndroidPermissions = (permissions, rejectMessage = '权限申请失败') => {
	// #ifdef APP-PLUS
	return new Promise((resolve, reject) => {
		plus.android.requestPermissions(
			permissions,
			(result) => {
				if (!result.deniedAlways.length && !result.deniedPresent.length) {
					resolve()
					return
				}

				reject(new Error(rejectMessage))
			},
			() => {
				reject(new Error(rejectMessage))
			}
		)
	})
	// #endif

	return Promise.resolve()
}

export const requestWifiPermissions = () => {
	return requestAndroidPermissions(
		[
			'android.permission.ACCESS_FINE_LOCATION',
			'android.permission.ACCESS_COARSE_LOCATION'
		],
		'需要定位权限才能扫描附近 WiFi'
	)
}
