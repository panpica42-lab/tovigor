/*
 * 页面栈导航辅助工具
 *
 * 这个文件专门处理“训练流程里如何正确返回上一页”这件事。
 * 这次部位训练链路同时涉及 part-training、warm-up、formal-training、
 * cool-down，以及 vue / nvue 两套页面；如果把相同的页面栈判断逻辑分散
 * 写在每个页面里，就会出现大量重复代码，而且后面一旦要调整返回规则，
 * 需要到多个文件里同步修改，容易漏改。
 *
 * 这里统一封装两类能力：
 * 1. 已知目标页面时，优先回退到页面栈里“已经存在”的那一页；
 * 2. 当前页面前面没有可返回页面时，按约定 reLaunch 到兜底页面。
 *
 * 这样做的目的，是避免在业务页里继续硬编码 delta 或直接重建页面，
 * 从而让训练流程保持稳定的页面栈结构：
 * 首页 -> 训练列表 -> 课程详情 -> 热身 -> 调整器械 -> 正式训练 -> 拉伸
 *
 * 后续如果别的训练流程也有同样的“按目标页回退 / 栈空兜底”需求，
 * 也应该优先复用这里，而不是在页面里再次手写 getCurrentPages 判断。
 */
const normalizeRoute = (route) => {
	if (!route) return ''
	const cleanRoute = String(route).split('?')[0]
	if (!cleanRoute) return ''
	return cleanRoute.startsWith('/') ? cleanRoute : '/' + cleanRoute
}

const getPages = () => {
	if (typeof getCurrentPages !== 'function') {
		return []
	}
	return getCurrentPages()
}

const getPageRoute = (page) => {
	if (!page) return ''
	if (page.route) {
		return normalizeRoute(page.route)
	}
	if (page.$page && page.$page.route) {
		return normalizeRoute(page.$page.route)
	}
	if (page.$page && page.$page.fullPath) {
		return normalizeRoute(page.$page.fullPath)
	}
	return ''
}

const findPreviousRouteDelta = (targetRoute) => {
	const normalizedTarget = normalizeRoute(targetRoute)
	if (!normalizedTarget) return 0

	const pages = getPages()
	for (let index = pages.length - 2; index >= 0; index -= 1) {
		if (getPageRoute(pages[index]) === normalizedTarget) {
			return pages.length - 1 - index
		}
	}

	return 0
}

export const navigateBackToRoute = (targetRoute, fallbackUrl = targetRoute) => {
	const delta = findPreviousRouteDelta(targetRoute)
	if (delta > 0) {
		uni.navigateBack({
			delta
		})
		return
	}

	const normalizedFallback = normalizeRoute(fallbackUrl)
	if (normalizedFallback) {
		uni.reLaunch({
			url: normalizedFallback
		})
	}
}

export const navigateBackOrReLaunch = (fallbackUrl) => {
	const pages = getPages()
	if (pages.length > 1) {
		uni.navigateBack()
		return
	}

	const normalizedFallback = normalizeRoute(fallbackUrl)
	if (normalizedFallback) {
		uni.reLaunch({
			url: normalizedFallback
		})
	}
}
