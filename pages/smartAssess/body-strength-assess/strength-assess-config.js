export const STRENGTH_ASSESS_STORAGE_KEY = 'smartAssessStrengthOverview'

export const PART_ORDER = ['shoulder', 'chest', 'back', 'arm', 'hip', 'leg']

export const PART_META_MAP = {
	shoulder: {
		id: 'shoulder',
		name: '肩部',
		icon: '/static/icons/smartAssessActivity/li-liang/ic_muscle_shoulder.svg'
	},
	chest: {
		id: 'chest',
		name: '胸部',
		icon: '/static/icons/smartAssessActivity/li-liang/ic_muscle_chest.svg'
	},
	back: {
		id: 'back',
		name: '背部',
		icon: '/static/icons/smartAssessActivity/li-liang/ic_muscle_back.svg'
	},
	arm: {
		id: 'arm',
		name: '手臂',
		icon: '/static/icons/smartAssessActivity/li-liang/ic_muscle_arm.svg'
	},
	hip: {
		id: 'hip',
		name: '臀部',
		icon: '/static/icons/smartAssessActivity/li-liang/ic_muscle_hip.svg'
	},
	leg: {
		id: 'leg',
		name: '腿部',
		icon: '/static/icons/smartAssessActivity/li-liang/ic_muscle_leg.svg'
	}
}

export const PART_BASE_FORCE_MAP = {
	shoulder: 15,
	chest: 20,
	back: 25,
	arm: 15,
	hip: 25,
	leg: 25
}

export const FORCE_LEVELS = [8, 10, 12, 15, 20, 25, 30]

export const DISTANCE_RULES = [
	{ min: 80, trainingMultiplier: 1.3, sprintMultiplier: 1.6, levelText: '完整完成' },
	{ min: 60, trainingMultiplier: 1.0, sprintMultiplier: 1.25, levelText: '大部分完成' },
	{ min: 40, trainingMultiplier: 0.8, sprintMultiplier: 1.0, levelText: '部分完成' },
	{ min: 20, trainingMultiplier: 0.6, sprintMultiplier: 0.8, levelText: '明显吃力' },
	{ min: 0, trainingMultiplier: 0.4, sprintMultiplier: 0.6, levelText: '几乎无法完成' }
]

export const DEFAULT_PART_RESULT = {
	peakDistanceCm: 0,
	warmupValue: 0,
	trainingValue: 0,
	sprintValue: 0,
	levelText: '待评估',
	finished: false,
	repDistances: []
}

export const COURSE_RECOMMENDATIONS = [
	{
		id: 'course-1',
		title: '肩背激活课',
		tag: '课程推荐',
		image: '/static/icons/partTrainingActivity/course_pic_01.jpg'
	},
	{
		id: 'course-2',
		title: '胸臂力量进阶',
		tag: '人气课程',
		image: '/static/icons/partTrainingActivity/course_pic_02.jpg'
	},
	{
		id: 'course-3',
		title: '臀腿稳定训练',
		tag: '课程推荐',
		image: '/static/icons/partTrainingActivity/course_pic_03.jpg'
	}
]

export function getBodyParts() {
	return PART_ORDER.map((id) => {
		return {
			id: PART_META_MAP[id].id,
			name: PART_META_MAP[id].name,
			icon: PART_META_MAP[id].icon
		}
	})
}

export function getDefaultStrengthOverview() {
	return PART_ORDER.reduce((result, id) => {
		result[id] = {
			peakDistanceCm: DEFAULT_PART_RESULT.peakDistanceCm,
			warmupValue: DEFAULT_PART_RESULT.warmupValue,
			trainingValue: DEFAULT_PART_RESULT.trainingValue,
			sprintValue: DEFAULT_PART_RESULT.sprintValue,
			levelText: DEFAULT_PART_RESULT.levelText,
			finished: DEFAULT_PART_RESULT.finished,
			repDistances: []
		}
		return result
	}, {})
}

export function snapToNearestForceLevel(value) {
	if (value <= 0) {
		return 0
	}

	return FORCE_LEVELS.reduce((nearest, current) => {
		return Math.abs(current - value) < Math.abs(nearest - value) ? current : nearest
	}, FORCE_LEVELS[0])
}

export function getDistanceRule(peakDistanceCm) {
	return DISTANCE_RULES.find(rule => peakDistanceCm >= rule.min) || DISTANCE_RULES[DISTANCE_RULES.length - 1]
}

export function buildStrengthResult(partId, peakDistanceCm, repDistances = []) {
	const baseForce = PART_BASE_FORCE_MAP[partId] || 0
	const rule = getDistanceRule(peakDistanceCm)
	const trainingValue = snapToNearestForceLevel(baseForce * rule.trainingMultiplier)
	const warmupValue = snapToNearestForceLevel(trainingValue * 0.8)
	const sprintValue = snapToNearestForceLevel(baseForce * rule.sprintMultiplier)

	return {
		peakDistanceCm: Math.max(0, Math.round(peakDistanceCm)),
		warmupValue,
		trainingValue,
		sprintValue,
		levelText: rule.levelText,
		finished: true,
		repDistances: repDistances.map(distance => Math.max(0, Math.round(distance)))
	}
}
