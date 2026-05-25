"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equipmentCatalog = void 0;
exports.getEquipmentCard = getEquipmentCard;
exports.equipmentCatalog = [
    {
        "id": "seated-chest-press",
        "zhName": "坐姿推胸机",
        "enName": "Seated Chest Press",
        "category": "chest",
        "primaryMuscles": [
            "胸大肌"
        ],
        "secondaryMuscles": [
            "前三角肌",
            "肱三头肌"
        ],
        "summary": "固定轨迹胸推器械，适合新手建立推的发力感。",
        "adjustment": "将座椅调到把手与胸中部齐平，双脚踩稳，肩胛自然后收。",
        "steps": [
            "坐稳并收紧核心。",
            "握住把手后向前推出。",
            "手臂接近伸直时停顿，再控制回到起点。"
        ],
        "safety": [
            "全程保持肩膀下沉，不要耸肩。",
            "不要为了重量牺牲活动幅度。"
        ],
        "commonErrors": [
            "座椅太低导致推举轨迹偏上。",
            "锁死肘关节并猛推。"
        ],
        "beginnerTip": "先从能稳定完成 10 次的轻重量开始。",
        "recognitionHints": [
            "坐姿固定推举器械，两个把手位于胸前，从胸前向前推出。",
            "通常有靠背和座椅，没有像拥抱一样向中间夹拢的长摆臂轨迹。"
        ],
        "videoRecommendation": {
            "platform": "Bilibili",
            "title": "坐姿推胸机使用教学",
            "searchQuery": "坐姿推胸机 正确使用 教学"
        },
        "similarEquipmentIds": [
            "pec-deck-fly",
            "shoulder-press-machine"
        ]
    },
    {
        "id": "pec-deck-fly",
        "zhName": "蝴蝶机夹胸",
        "enName": "Pec Deck Fly",
        "category": "chest",
        "primaryMuscles": [
            "胸大肌"
        ],
        "secondaryMuscles": [
            "前三角肌"
        ],
        "summary": "通过夹胸动作强化胸部收缩感的固定器械。",
        "adjustment": "调到肘部与肩同高，背部贴住靠垫。",
        "steps": [
            "双臂打开至胸部轻微拉伸。",
            "像拥抱一样向中间夹拢。",
            "停顿一秒后缓慢还原。"
        ],
        "safety": [
            "手肘保持微屈，不要完全伸直。",
            "若肩前侧不适，缩小动作幅度。"
        ],
        "commonErrors": [
            "借惯性猛夹。",
            "肩膀前顶导致胸部发力下降。"
        ],
        "beginnerTip": "把注意力放在胸部向中间夹紧，而不是手臂摆动。",
        "recognitionHints": [
            "双臂从身体两侧向胸前夹拢，轨迹像拥抱一样，不是向后拉到躯干。",
            "常见为座椅加靠背，胸前两侧各有一根摆臂或肘垫，主要是胸部夹胸器械。"
        ],
        "videoRecommendation": {
            "platform": "Bilibili",
            "title": "蝴蝶机夹胸教学",
            "searchQuery": "蝴蝶机夹胸 正确使用 教学"
        },
        "similarEquipmentIds": [
            "seated-chest-press",
            "shoulder-press-machine"
        ]
    },
    {
        "id": "lat-pulldown",
        "zhName": "高位下拉",
        "enName": "Lat Pulldown",
        "category": "back",
        "primaryMuscles": [
            "背阔肌"
        ],
        "secondaryMuscles": [
            "肱二头肌",
            "菱形肌"
        ],
        "summary": "适合新手学习背部下拉发力模式的固定器械。",
        "adjustment": "调好腿垫让大腿被固定，握距略宽于肩。",
        "steps": [
            "先沉肩并挺胸。",
            "将横杆拉向锁骨上方。",
            "控制横杆回到顶部。"
        ],
        "safety": [
            "不要把横杆拉到脖子后面。",
            "避免身体大幅后仰借力。"
        ],
        "commonErrors": [
            "耸肩代偿。",
            "回放时完全放松导致重量砸回。"
        ],
        "beginnerTip": "先学会沉肩再拉肘，背阔肌感觉会更明显。",
        "recognitionHints": [
            "头顶上方有横杆，从上往下拉，常配有固定大腿的腿垫。",
            "是竖直下拉轨迹，不是水平向后拉到腹部的坐姿划船。"
        ],
        "videoRecommendation": {
            "platform": "Bilibili",
            "title": "高位下拉新手教学",
            "searchQuery": "高位下拉 正确使用 教学"
        },
        "similarEquipmentIds": [
            "assisted-pull-up-dip",
            "seated-row"
        ]
    },
    {
        "id": "seated-row",
        "zhName": "坐姿划船",
        "enName": "Seated Row",
        "category": "back",
        "primaryMuscles": [
            "背阔肌",
            "菱形肌"
        ],
        "secondaryMuscles": [
            "肱二头肌",
            "后三角肌"
        ],
        "summary": "帮助新手学习水平拉的背部器械。",
        "adjustment": "胸口贴垫或坐稳，双手握住把手时肩膀不过度前探。",
        "steps": [
            "先沉肩并收紧核心。",
            "向后拉肘，把把手拉向下腹。",
            "控制回程到背部被拉长。"
        ],
        "safety": [
            "保持腰背稳定，不要甩动。",
            "回程不要塌肩。"
        ],
        "commonErrors": [
            "只用手臂拉而不带动肘部。",
            "身体前后摆动过大。"
        ],
        "beginnerTip": "想象用肘部带动动作，而不是用手拽。",
        "recognitionHints": [
            "前方有把手，动作是水平向后拉到躯干或下腹，不是向胸前夹拢。",
            "常见有胸垫、脚踏或低位拉柄，属于背部水平拉器械。"
        ],
        "videoRecommendation": {
            "platform": "Bilibili",
            "title": "坐姿划船教学",
            "searchQuery": "坐姿划船器械 正确使用 教学"
        },
        "similarEquipmentIds": [
            "lat-pulldown",
            "back-extension-machine"
        ]
    },
    {
        "id": "shoulder-press-machine",
        "zhName": "肩推机",
        "enName": "Shoulder Press Machine",
        "category": "shoulders",
        "primaryMuscles": [
            "三角肌前束",
            "三角肌中束"
        ],
        "secondaryMuscles": [
            "肱三头肌"
        ],
        "summary": "固定轨迹肩推器械，适合新手建立肩上推举感觉。",
        "adjustment": "把座椅调到把手略低于耳朵位置。",
        "steps": [
            "背部贴靠垫坐稳。",
            "向上推出把手。",
            "控制下放到起始位置。"
        ],
        "safety": [
            "下放到肩膀舒适范围即可。",
            "如果肩部不适，立刻减轻重量。"
        ],
        "commonErrors": [
            "耸肩代偿。",
            "腰部过度反弓。"
        ],
        "beginnerTip": "全程保持肋骨回收，别为了推高而挺腰。",
        "recognitionHints": [
            "把手从肩膀附近向头顶上方推起，轨迹偏竖直。",
            "主要训练肩部，不是胸前夹胸，也不是胸前平推。"
        ],
        "videoRecommendation": {
            "platform": "Bilibili",
            "title": "肩推机教学",
            "searchQuery": "肩推机 正确使用 教学"
        },
        "similarEquipmentIds": [
            "seated-chest-press",
            "pec-deck-fly"
        ]
    },
    {
        "id": "leg-press",
        "zhName": "腿举机",
        "enName": "Leg Press",
        "category": "legs",
        "primaryMuscles": [
            "股四头肌",
            "臀大肌"
        ],
        "secondaryMuscles": [
            "腘绳肌"
        ],
        "summary": "下肢复合固定器械，适合新手做腿部力量入门。",
        "adjustment": "双脚与肩同宽踩在踏板中部，臀部和腰部贴靠垫。",
        "steps": [
            "解锁安全扣后缓慢下放。",
            "下放到大腿与腹部接近时停住。",
            "脚跟发力把踏板推回。"
        ],
        "safety": [
            "整个过程不要让腰部离开靠垫。",
            "膝盖不要内扣。"
        ],
        "commonErrors": [
            "下放太深导致骨盆后卷。",
            "膝盖完全锁死。"
        ],
        "beginnerTip": "先用中等脚位，等熟悉后再调整脚位体验不同刺激。",
        "videoRecommendation": {
            "platform": "Bilibili",
            "title": "腿举机使用教学",
            "searchQuery": "腿举机 正确使用 教学"
        },
        "similarEquipmentIds": [
            "hack-squat-machine",
            "calf-raise-machine"
        ]
    },
    {
        "id": "leg-extension",
        "zhName": "腿屈伸机",
        "enName": "Leg Extension",
        "category": "legs",
        "primaryMuscles": [
            "股四头肌"
        ],
        "secondaryMuscles": [],
        "summary": "针对股四头肌的孤立器械。",
        "adjustment": "膝关节对准转轴，脚背卡在滚轮下方。",
        "steps": [
            "坐稳后收紧核心。",
            "将小腿向前抬起到接近伸直。",
            "控制下放回起点。"
        ],
        "safety": [
            "不要猛甩小腿。",
            "如果膝盖不适，缩小活动范围。"
        ],
        "commonErrors": [
            "动作太快。",
            "上顶时锁死膝盖。"
        ],
        "beginnerTip": "轻重量慢速做，更容易感受到大腿前侧发力。",
        "videoRecommendation": {
            "platform": "Bilibili",
            "title": "腿屈伸机教学",
            "searchQuery": "腿屈伸机 正确使用 教学"
        },
        "similarEquipmentIds": [
            "seated-leg-curl",
            "leg-press"
        ]
    },
    {
        "id": "seated-leg-curl",
        "zhName": "坐姿腿弯举",
        "enName": "Seated Leg Curl",
        "category": "legs",
        "primaryMuscles": [
            "腘绳肌"
        ],
        "secondaryMuscles": [
            "腓肠肌"
        ],
        "summary": "坐姿版本的腿后侧孤立训练器械。",
        "adjustment": "膝盖对准转轴，脚踝贴住滚轮，靠垫压稳大腿。",
        "steps": [
            "坐直并抓稳把手。",
            "向下勾小腿。",
            "控制回程直到腿后侧被拉长。"
        ],
        "safety": [
            "不要借腰部后仰。",
            "不要为了重量牺牲完整回程。"
        ],
        "commonErrors": [
            "只做半程。",
            "动作末端猛弹回去。"
        ],
        "beginnerTip": "把脚尖轻微勾起，常能更好感受到腿后侧。",
        "videoRecommendation": {
            "platform": "Bilibili",
            "title": "坐姿腿弯举教学",
            "searchQuery": "坐姿腿弯举 正确使用 教学"
        },
        "similarEquipmentIds": [
            "lying-leg-curl",
            "leg-extension"
        ]
    },
    {
        "id": "lying-leg-curl",
        "zhName": "俯卧腿弯举",
        "enName": "Lying Leg Curl",
        "category": "legs",
        "primaryMuscles": [
            "腘绳肌"
        ],
        "secondaryMuscles": [
            "腓肠肌"
        ],
        "summary": "俯卧版本的腿后侧孤立训练器械。",
        "adjustment": "膝盖与转轴对齐，滚轮压在脚踝上方。",
        "steps": [
            "俯卧贴稳身体。",
            "向臀部方向弯曲小腿。",
            "慢慢下放还原。"
        ],
        "safety": [
            "骨盆保持稳定，不要塌腰。",
            "出现膝后侧刺痛时立即停止。"
        ],
        "commonErrors": [
            "抬头挺腰借力。",
            "放下时失控。"
        ],
        "beginnerTip": "可以把腹部轻轻收紧，帮助骨盆更稳定。",
        "videoRecommendation": {
            "platform": "Bilibili",
            "title": "俯卧腿弯举教学",
            "searchQuery": "俯卧腿弯举 正确使用 教学"
        },
        "similarEquipmentIds": [
            "seated-leg-curl",
            "leg-extension"
        ]
    },
    {
        "id": "hip-abductor",
        "zhName": "髋外展机",
        "enName": "Hip Abductor",
        "category": "glutes",
        "primaryMuscles": [
            "臀中肌"
        ],
        "secondaryMuscles": [
            "臀小肌"
        ],
        "summary": "针对臀部外侧的固定器械。",
        "adjustment": "坐稳后把膝盖贴在护垫内侧，起始位置不要过窄。",
        "steps": [
            "保持上身稳定。",
            "向外打开双腿。",
            "控制回到起点。"
        ],
        "safety": [
            "不要快速弹开弹回。",
            "腰部不要左右晃动。"
        ],
        "commonErrors": [
            "身体前后甩动。",
            "完全靠惯性把腿甩开。"
        ],
        "beginnerTip": "动作慢一点，臀部外侧发力会更清楚。",
        "videoRecommendation": {
            "platform": "Bilibili",
            "title": "髋外展机教学",
            "searchQuery": "髋外展机 正确使用 教学"
        },
        "similarEquipmentIds": [
            "hip-adductor",
            "glute-kickback"
        ]
    },
    {
        "id": "hip-adductor",
        "zhName": "髋内收机",
        "enName": "Hip Adductor",
        "category": "legs",
        "primaryMuscles": [
            "内收肌群"
        ],
        "secondaryMuscles": [],
        "summary": "针对大腿内侧的固定器械。",
        "adjustment": "让膝盖外侧靠住护垫，保持坐姿端正。",
        "steps": [
            "双腿从打开位开始。",
            "向中间夹拢双腿。",
            "慢慢回到起点。"
        ],
        "safety": [
            "动作幅度在舒适范围内。",
            "不要用惯性猛夹。"
        ],
        "commonErrors": [
            "夹到中间直接放掉。",
            "含胸塌腰。"
        ],
        "beginnerTip": "重量偏轻时更容易保持动作控制。",
        "videoRecommendation": {
            "platform": "Bilibili",
            "title": "髋内收机教学",
            "searchQuery": "髋内收机 正确使用 教学"
        },
        "similarEquipmentIds": [
            "hip-abductor",
            "leg-press"
        ]
    },
    {
        "id": "glute-kickback",
        "zhName": "后踢腿机",
        "enName": "Glute Kickback Machine",
        "category": "glutes",
        "primaryMuscles": [
            "臀大肌"
        ],
        "secondaryMuscles": [
            "腘绳肌"
        ],
        "summary": "通过髋伸动作强化臀大肌发力。",
        "adjustment": "上身贴稳支撑垫，脚掌踩稳踏板或滚轮。",
        "steps": [
            "核心收紧并固定骨盆。",
            "向后蹬出训练腿。",
            "控制回到起始位置。"
        ],
        "safety": [
            "不要通过扭腰增加幅度。",
            "避免动作末端甩腿。"
        ],
        "commonErrors": [
            "腰部代偿。",
            "脚踝和膝盖过度发力。"
        ],
        "beginnerTip": "想象把大腿向后推，而不是小腿乱甩。",
        "videoRecommendation": {
            "platform": "Bilibili",
            "title": "后踢腿机教学",
            "searchQuery": "后踢腿机 正确使用 教学"
        },
        "similarEquipmentIds": [
            "hip-thrust-machine",
            "hip-abductor"
        ]
    },
    {
        "id": "hip-thrust-machine",
        "zhName": "臀推机",
        "enName": "Hip Thrust Machine",
        "category": "glutes",
        "primaryMuscles": [
            "臀大肌"
        ],
        "secondaryMuscles": [
            "腘绳肌"
        ],
        "summary": "适合新手学习髋伸和顶髋发力的臀部器械。",
        "adjustment": "让上背稳定贴住靠垫，脚掌位于膝盖正下方附近。",
        "steps": [
            "从髋部下沉位开始。",
            "脚跟发力向上顶髋。",
            "顶端收紧臀部后控制下放。"
        ],
        "safety": [
            "不要过度仰头和挺腰。",
            "顶端保持肋骨回收。"
        ],
        "commonErrors": [
            "脚位太远导致腿后侧代偿。",
            "用下背发力顶起。"
        ],
        "beginnerTip": "先找臀部顶紧的感觉，再逐渐加重量。",
        "videoRecommendation": {
            "platform": "Bilibili",
            "title": "臀推机教学",
            "searchQuery": "臀推机 正确使用 教学"
        },
        "similarEquipmentIds": [
            "glute-kickback",
            "leg-press"
        ]
    },
    {
        "id": "biceps-curl-machine",
        "zhName": "二头弯举机",
        "enName": "Biceps Curl Machine",
        "category": "arms",
        "primaryMuscles": [
            "肱二头肌"
        ],
        "secondaryMuscles": [
            "肱肌"
        ],
        "summary": "帮助新手稳定训练手臂前侧的器械。",
        "adjustment": "腋窝贴住垫子，肘部与器械转轴大致对齐。",
        "steps": [
            "手臂自然伸直起始。",
            "弯曲手肘把把手拉起。",
            "缓慢下放。"
        ],
        "safety": [
            "不要耸肩。",
            "不要用身体抬起重量。"
        ],
        "commonErrors": [
            "上半身晃动借力。",
            "放下时完全失控。"
        ],
        "beginnerTip": "动作末端停顿半秒，二头肌感觉更明显。",
        "videoRecommendation": {
            "platform": "Bilibili",
            "title": "二头弯举机教学",
            "searchQuery": "二头弯举机 正确使用 教学"
        },
        "similarEquipmentIds": [
            "triceps-extension-machine",
            "seated-row"
        ]
    },
    {
        "id": "triceps-extension-machine",
        "zhName": "三头伸展机",
        "enName": "Triceps Extension Machine",
        "category": "arms",
        "primaryMuscles": [
            "肱三头肌"
        ],
        "secondaryMuscles": [],
        "summary": "针对手臂后侧的固定训练器械。",
        "adjustment": "坐稳后让肘部自然固定在器械运动轨迹内。",
        "steps": [
            "从手肘弯曲位开始。",
            "向下或向前伸直手臂。",
            "控制回到起点。"
        ],
        "safety": [
            "手腕保持中立。",
            "肘部不要过度外张。"
        ],
        "commonErrors": [
            "耸肩代偿。",
            "借惯性猛甩。"
        ],
        "beginnerTip": "重量略轻时更容易感受到三头肌持续紧张。",
        "videoRecommendation": {
            "platform": "Bilibili",
            "title": "三头伸展机教学",
            "searchQuery": "三头伸展机 正确使用 教学"
        },
        "similarEquipmentIds": [
            "biceps-curl-machine",
            "shoulder-press-machine"
        ]
    },
    {
        "id": "ab-crunch-machine",
        "zhName": "卷腹机",
        "enName": "Ab Crunch Machine",
        "category": "core",
        "primaryMuscles": [
            "腹直肌"
        ],
        "secondaryMuscles": [
            "腹斜肌"
        ],
        "summary": "提供阻力的腹部屈曲训练器械。",
        "adjustment": "把手和靠垫调到能让胸廓自然向骨盆卷起的位置。",
        "steps": [
            "收紧腹部并微含胸。",
            "向前卷曲上半身。",
            "缓慢还原到腹部有拉伸的位置。"
        ],
        "safety": [
            "不要用手臂猛拉把手。",
            "腰部不适时减轻重量。"
        ],
        "commonErrors": [
            "动作变成单纯低头。",
            "利用惯性摆动。"
        ],
        "beginnerTip": "想象肋骨向骨盆靠近，而不是头往下冲。",
        "videoRecommendation": {
            "platform": "Bilibili",
            "title": "卷腹机教学",
            "searchQuery": "卷腹机 正确使用 教学"
        },
        "similarEquipmentIds": [
            "back-extension-machine",
            "assisted-pull-up-dip"
        ]
    },
    {
        "id": "back-extension-machine",
        "zhName": "背部伸展机",
        "enName": "Back Extension Machine",
        "category": "core",
        "primaryMuscles": [
            "竖脊肌"
        ],
        "secondaryMuscles": [
            "臀大肌",
            "腘绳肌"
        ],
        "summary": "针对后链和下背稳定能力的器械。",
        "adjustment": "支撑垫高度放在髋部以下，让髋可以自然折叠。",
        "steps": [
            "从身体前屈位开始。",
            "用臀部和下背力量抬起躯干。",
            "到身体接近一条线时停住后再下放。"
        ],
        "safety": [
            "不要过度后仰。",
            "全程保持颈部中立。"
        ],
        "commonErrors": [
            "在顶端过度折腰。",
            "抬起时速度过快。"
        ],
        "beginnerTip": "先做小幅度，确认没有下背不适后再增加范围。",
        "videoRecommendation": {
            "platform": "Bilibili",
            "title": "背部伸展机教学",
            "searchQuery": "背部伸展机 正确使用 教学"
        },
        "similarEquipmentIds": [
            "ab-crunch-machine",
            "seated-row"
        ]
    },
    {
        "id": "assisted-pull-up-dip",
        "zhName": "辅助引体向上/双杠臂屈伸机",
        "enName": "Assisted Pull-up Dip",
        "category": "compound",
        "primaryMuscles": [
            "背阔肌",
            "肱三头肌"
        ],
        "secondaryMuscles": [
            "胸大肌",
            "肱二头肌"
        ],
        "summary": "通过配重辅助完成引体或双杠臂屈伸的复合器械。",
        "adjustment": "先确认膝垫配重，辅助越大配重通常越重。",
        "steps": [
            "踩上踏板并跪稳膝垫。",
            "选择引体或双杠握位完成动作。",
            "控制身体回到起始位置。"
        ],
        "safety": [
            "上下器械时一定扶稳。",
            "不要突然松手让膝垫弹回。"
        ],
        "commonErrors": [
            "把配重逻辑理解反。",
            "动作底部完全塌肩。"
        ],
        "beginnerTip": "第一次用时先从辅助更大的重量开始。",
        "recognitionHints": [
            "有站台、膝垫或踏板，用户通常跪或站在辅助垫上完成引体或双杠动作。",
            "器械整体较高，支持向上拉或向下压，不是坐姿拉或夹胸设备。"
        ],
        "videoRecommendation": {
            "platform": "Bilibili",
            "title": "辅助引体机教学",
            "searchQuery": "辅助引体向上机 正确使用 教学"
        },
        "similarEquipmentIds": [
            "lat-pulldown",
            "triceps-extension-machine"
        ]
    },
    {
        "id": "hack-squat-machine",
        "zhName": "哈克深蹲机",
        "enName": "Hack Squat Machine",
        "category": "legs",
        "primaryMuscles": [
            "股四头肌",
            "臀大肌"
        ],
        "secondaryMuscles": [
            "腘绳肌"
        ],
        "summary": "固定轨迹深蹲器械，适合练下肢力量。",
        "adjustment": "肩膀顶住护垫，脚位略靠前，双脚与肩同宽。",
        "steps": [
            "解锁安全把手。",
            "屈膝下蹲到合适深度。",
            "脚掌踩实向上推回。"
        ],
        "safety": [
            "膝盖方向跟随脚尖。",
            "不要在底部失控反弹。"
        ],
        "commonErrors": [
            "膝盖内扣。",
            "脚跟抬起。"
        ],
        "beginnerTip": "先用较浅范围熟悉轨迹，再逐步加深。",
        "videoRecommendation": {
            "platform": "Bilibili",
            "title": "哈克深蹲机教学",
            "searchQuery": "哈克深蹲机 正确使用 教学"
        },
        "similarEquipmentIds": [
            "leg-press",
            "calf-raise-machine"
        ]
    },
    {
        "id": "calf-raise-machine",
        "zhName": "提踵机",
        "enName": "Calf Raise Machine",
        "category": "legs",
        "primaryMuscles": [
            "腓肠肌",
            "比目鱼肌"
        ],
        "secondaryMuscles": [],
        "summary": "针对小腿肌群的固定器械。",
        "adjustment": "前脚掌踩在踏板边缘，肩部或髋部顶住支撑垫。",
        "steps": [
            "从脚跟略低于踏板开始。",
            "向上踮起脚尖。",
            "缓慢下放到拉伸位。"
        ],
        "safety": [
            "动作不要弹震。",
            "脚踝活动范围以舒适为准。"
        ],
        "commonErrors": [
            "只做上半程。",
            "借膝盖晃动。"
        ],
        "beginnerTip": "顶端停顿一秒，会更容易感受到小腿收缩。",
        "videoRecommendation": {
            "platform": "Bilibili",
            "title": "提踵机教学",
            "searchQuery": "提踵机 正确使用 教学"
        },
        "similarEquipmentIds": [
            "leg-press",
            "hack-squat-machine"
        ]
    }
];
function getEquipmentCard(id) {
    var _a;
    return (_a = exports.equipmentCatalog.find((item) => item.id === id)) !== null && _a !== void 0 ? _a : null;
}
