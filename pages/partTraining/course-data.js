/*
 * 产品语义说明：
 * 这个文件不是页面，也不是组件。
 * 它只是“部位训练课程数据总表”，把课程库页、课程详情页、AI 推荐结果弹窗
 * 这几个地方都会用到的课程数据集中放在一起。
 *
 * 为什么要单独抽成一个文件：
 * 1. 避免课程库页写一份、详情页再写一份，后面越改越不一致。
 * 2. AI 推荐结果弹窗本质上推荐的也是课程，所以也应该读同一份课程数据。
 * 3. 后面如果你改某一门课的标题、封面、注意事项、动作预览，只改这里一处就够了。
 *
 * 可以把它理解成：
 * “部位训练模块的课程小数据库（前端静态版）”。
 *
 * 另外说明一下 AI 推荐会读取哪些字段：
 * 当前轻量推荐打分逻辑只会读取下面这些课程字段：
 * - gender 性别
 * - goal 目的
 * - part 部位
 * - level 等级
 * - method 方法
 *
 * 也就是说，当前 AI 推荐打分是严格建立在 partTrainingCourses
 * 这份数据里已经存在的字段之上的，并没有额外凭空造一套课程属性。
 */
export const partTrainingCourses = [
	{
		id: 1,
		title: '美人肩塑形',
		duration: '15min',
		cover: '/static/icons/partTrainingActivity/course_pic_01.jpg',
		gender: 'female',
		goal: 'fat-loss',
		level: 'intermediate',
		part: 'shoulder',
		method: 'no-resistance',
		durationRange: '15-25',
		equipment: ['short-bar', 'fitness-bench'],
		tags: ['减脂塑形', '中等', '三角肌后束'],
		intro: '本课程专注于肩部线条雕刻，通过科学的训练动作帮助你打造迷人的肩部曲线。适合有一定训练基础的学员，每周训练2-3次效果最佳。',
		noticeList: [
			'训练前请充分热身，特别是肩关节部位',
			'如有肩部伤病史，请咨询医生后再进行训练',
			'动作过程中保持核心收紧，避免借力',
			'感到疼痛时立即停止，不要勉强完成'
		],
		previews: [
			{ id: 1, name: '侧平举', cover: '/static/icons/partTrainingActivity/course_pic_01.jpg' },
			{ id: 2, name: '俯身飞鸟', cover: '/static/icons/partTrainingActivity/course_pic_02.jpg' },
			{ id: 3, name: '肩推举', cover: '/static/icons/partTrainingActivity/course_pic_03.jpg' },
			{ id: 4, name: '前平举', cover: '/static/icons/partTrainingActivity/course_pic_04.jpg' },
			{ id: 5, name: '拉力器', cover: '/static/icons/partTrainingActivity/course_pic_05.jpg' }
		]
	},
	{
		id: 2,
		title: '基础臀部塑形',
		duration: '45min',
		cover: '/static/icons/partTrainingActivity/course_pic_02.jpg',
		gender: 'female',
		goal: 'fat-loss',
		level: 'advanced',
		part: 'leg',
		method: 'no-resistance',
		durationRange: '40+',
		equipment: ['ankle-strap', 'resistance-band'],
		tags: ['塑形紧致', '较难', '臀大肌'],
		intro: '系统化的臀部训练课程，帮助你构建饱满有力的臀部线条。课程包含多角度臀部激活动作，适合想要提升臀部形态的训练者。',
		noticeList: [
			'训练前务必进行臀部激活练习',
			'注意动作顶峰收缩，充分感受臀部发力',
			'膝盖与脚尖保持同一方向，避免内扣',
			'训练后进行充分拉伸，促进恢复'
		],
		previews: [
			{ id: 1, name: '臀桥', cover: '/static/icons/partTrainingActivity/course_pic_02.jpg' },
			{ id: 2, name: '深蹲', cover: '/static/icons/partTrainingActivity/course_pic_03.jpg' },
			{ id: 3, name: '保加利亚蹲', cover: '/static/icons/partTrainingActivity/course_pic_04.jpg' },
			{ id: 4, name: '硬拉', cover: '/static/icons/partTrainingActivity/course_pic_05.jpg' }
		]
	},
	{
		id: 3,
		title: '肩部肌群训练',
		duration: '25min',
		cover: '/static/icons/partTrainingActivity/course_pic_03.jpg',
		gender: 'male',
		goal: 'muscle',
		level: 'intermediate',
		part: 'shoulder',
		method: 'resistance',
		durationRange: '15-25',
		equipment: ['triangle-handle', 'middle-bar'],
		tags: ['力量增强', '中等', '三角肌外侧'],
		intro: '全面发展肩部三角肌的综合训练课程，通过多角度刺激帮助你打造立体饱满的肩部。',
		noticeList: [
			'肩部训练需要严格控制重量，避免代偿',
			'每组之间充分休息，保证动作质量',
			'训练频率建议每周2次，给予充分恢复时间'
		],
		previews: [
			{ id: 1, name: '哑铃推举', cover: '/static/icons/partTrainingActivity/course_pic_03.jpg' },
			{ id: 2, name: '侧平举', cover: '/static/icons/partTrainingActivity/course_pic_04.jpg' },
			{ id: 3, name: '反向飞鸟', cover: '/static/icons/partTrainingActivity/course_pic_05.jpg' }
		]
	},
	{
		id: 4,
		title: '美背新训练',
		duration: '30min',
		cover: '/static/icons/partTrainingActivity/course_pic_04.jpg',
		gender: 'female',
		goal: 'wellness',
		level: 'intermediate',
		part: 'back',
		method: 'resistance',
		durationRange: '25-40',
		equipment: ['lat-bar', 'dual-rope'],
		tags: ['塑形紧致', '中等', '背阔肌'],
		intro: '针对背部线条打造的专项课程，帮助你拥有性感的背部曲线和良好的体态。',
		noticeList: [
			'背部训练重点在于顶峰收缩和肌肉感受',
			'保持肩胛骨后缩下沉，避免耸肩',
			'呼吸节奏要配合动作，发力时呼气'
		],
		previews: [
			{ id: 1, name: '高位下拉', cover: '/static/icons/partTrainingActivity/course_pic_04.jpg' },
			{ id: 2, name: '坐姿划船', cover: '/static/icons/partTrainingActivity/course_pic_05.jpg' },
			{ id: 3, name: '俯身划船', cover: '/static/icons/partTrainingActivity/course_pic_01.jpg' }
		]
	},
	{
		id: 5,
		title: '爆发腿部燃脂',
		duration: '20min',
		cover: '/static/icons/partTrainingActivity/course_pic_05.jpg',
		gender: 'all',
		goal: 'fat-loss',
		level: 'advanced',
		part: 'leg',
		method: 'resistance',
		durationRange: '15-25',
		equipment: ['ankle-strap', 'dual-rope'],
		tags: ['高效燃脂', '较难', '股四头肌'],
		intro: '高强度间歇训练模式的腿部课程，在锻炼腿部肌肉的同时实现高效燃脂。',
		noticeList: [
			'这是高强度训练，请确保身体状况良好',
			'训练中保持水分补充',
			'如感到头晕不适请立即停止休息',
			'建议有一定训练基础后再尝试'
		],
		previews: [
			{ id: 1, name: '跳跃深蹲', cover: '/static/icons/partTrainingActivity/course_pic_05.jpg' },
			{ id: 2, name: '箭步蹲', cover: '/static/icons/partTrainingActivity/course_pic_01.jpg' },
			{ id: 3, name: '波比跳', cover: '/static/icons/partTrainingActivity/course_pic_02.jpg' }
		]
	},
	{
		id: 6,
		title: '核心塑型进阶',
		duration: '18min',
		cover: '/static/icons/partTrainingActivity/course_pic_06.jpg',
		gender: 'all',
		goal: 'health',
		level: 'intermediate',
		part: 'core',
		method: 'no-resistance',
		durationRange: '15-25',
		equipment: ['yoga-mat', 'foam-roller'],
		tags: ['核心稳定', '中等', '腹横肌'],
		intro: '进阶版核心训练课程，不仅练表层腹肌，更注重深层核心肌群的激活和强化。',
		noticeList: [
			'核心训练重在质量而非数量',
			'保持腰椎中立位，避免过度拱背',
			'呼吸与动作配合，不要憋气'
		],
		previews: [
			{ id: 1, name: '平板支撑', cover: '/static/icons/partTrainingActivity/course_pic_06.jpg' },
			{ id: 2, name: '俄罗斯转体', cover: '/static/icons/partTrainingActivity/course_pic_01.jpg' },
			{ id: 3, name: '死虫式', cover: '/static/icons/partTrainingActivity/course_pic_02.jpg' }
		]
	},
	{
		id: 7,
		title: '蜜桃臀养成',
		duration: '35min',
		cover: '/static/icons/partTrainingActivity/course_pic_01.jpg',
		gender: 'female',
		goal: 'fat-loss',
		level: 'intermediate',
		part: 'leg',
		method: 'no-resistance',
		durationRange: '25-40',
		equipment: ['ankle-strap', 'fitness-bench'],
		tags: ['臀部塑形', '中等', '臀中肌'],
		intro: '专注臀部上缘和外侧的针对性训练，帮助你打造饱满翘挺的蜜桃臀。',
		noticeList: [
			'训练前进行臀部激活非常重要',
			'动作过程中避免腰部代偿',
			'顶峰收缩保持1-2秒效果更佳'
		],
		previews: [
			{ id: 1, name: '蚌式开合', cover: '/static/icons/partTrainingActivity/course_pic_01.jpg' },
			{ id: 2, name: '侧卧抬腿', cover: '/static/icons/partTrainingActivity/course_pic_02.jpg' },
			{ id: 3, name: '单腿臀桥', cover: '/static/icons/partTrainingActivity/course_pic_03.jpg' }
		]
	},
	{
		id: 8,
		title: '全身燃脂HIIT',
		duration: '22min',
		cover: '/static/icons/partTrainingActivity/course_pic_02.jpg',
		gender: 'all',
		goal: 'youth',
		level: 'advanced',
		part: 'full-body',
		method: 'no-resistance',
		durationRange: '15-25',
		equipment: ['resistance-band', 'yoga-mat'],
		tags: ['高效燃脂', '较难', '全身'],
		intro: '高强度间歇训练，短时间内最大化燃脂效果，适合时间紧张但想要高效训练的人群。',
		noticeList: [
			'HIIT强度大，建议有氧基础较好后再尝试',
			'训练中及时补水',
			'若感到心跳过快或不适请立即停止',
			'每周不超过3次HIIT训练'
		],
		previews: [
			{ id: 1, name: '开合跳', cover: '/static/icons/partTrainingActivity/course_pic_02.jpg' },
			{ id: 2, name: '高抬腿', cover: '/static/icons/partTrainingActivity/course_pic_03.jpg' },
			{ id: 3, name: '波比跳', cover: '/static/icons/partTrainingActivity/course_pic_04.jpg' },
			{ id: 4, name: '登山跑', cover: '/static/icons/partTrainingActivity/course_pic_05.jpg' }
		]
	},
	{
		id: 9,
		title: '手臂线条雕刻',
		duration: '28min',
		cover: '/static/icons/partTrainingActivity/course_pic_03.jpg',
		gender: 'female',
		goal: 'muscle',
		level: 'intermediate',
		part: 'arm',
		method: 'resistance',
		durationRange: '25-40',
		equipment: ['short-bar', 'dual-rope'],
		tags: ['力量增强', '中等', '肱二头肌'],
		intro: '针对手臂线条打造的专项课程，包含肱二头肌和肱三头肌的全面训练。',
		noticeList: [
			'手臂训练注重动作规范，避免借力摇晃',
			'控制离心过程，缓慢下放',
			'每组做到力竭前1-2个保证安全'
		],
		previews: [
			{ id: 1, name: '哑铃弯举', cover: '/static/icons/partTrainingActivity/course_pic_03.jpg' },
			{ id: 2, name: '三头臂屈伸', cover: '/static/icons/partTrainingActivity/course_pic_04.jpg' },
			{ id: 3, name: '锤式弯举', cover: '/static/icons/partTrainingActivity/course_pic_05.jpg' }
		]
	},
	{
		id: 10,
		title: '腹肌撕裂者',
		duration: '16min',
		cover: '/static/icons/partTrainingActivity/course_pic_04.jpg',
		gender: 'male',
		goal: 'muscle',
		level: 'advanced',
		part: 'core',
		method: 'no-resistance',
		durationRange: '15-25',
		equipment: ['yoga-mat', 'fitness-bench'],
		tags: ['核心强化', '较难', '腹直肌'],
		intro: '高强度腹部训练课程，通过多种变化动作全方位刺激腹部肌群，打造清晰腹肌线条。',
		noticeList: [
			'腹部训练需要配合饮食控制才能显现',
			'动作过程中下背部紧贴地面',
			'颈部放松，避免用手拉头部',
			'训练后进行腹部拉伸'
		],
		previews: [
			{ id: 1, name: '卷腹', cover: '/static/icons/partTrainingActivity/course_pic_04.jpg' },
			{ id: 2, name: '抬腿', cover: '/static/icons/partTrainingActivity/course_pic_05.jpg' },
			{ id: 3, name: '自行车卷腹', cover: '/static/icons/partTrainingActivity/course_pic_06.jpg' },
			{ id: 4, name: '平板支撑', cover: '/static/icons/partTrainingActivity/course_pic_01.jpg' }
		]
	}
]

export const getPartTrainingCourseById = (id) => {
	return partTrainingCourses.find(course => course.id === Number(id)) || null
}
