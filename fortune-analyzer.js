/**
 * 运势分析模块 (Fortune Analyzer)
 * 
 * 根据八字排盘结果，分析2026下半年每月运势。
 * 基于十神关系映射到五个维度：事业、财运、感情、健康、贵人
 * 生成运势评分、文案描述和幸运提示。
 */

import {
    TIAN_GAN, DI_ZHI, WU_XING_NAMES, WU_XING_EN,
    STEM_TO_ELEMENT, BRANCH_TO_ELEMENT, BRANCH_HIDDEN_STEMS,
    getTenGod, getTenGodCategory, H2_2026_MONTHS,
} from './bazi-engine.js';

// ============================================================
//  十神 → 运势维度映射
// ============================================================

/**
 * 十神对五个运势维度的影响分数 (1-5 基础)
 * 维度: [事业, 财运, 感情, 健康, 贵人]
 */
const TEN_GOD_SCORES = {
    '比肩': [3, 2, 3, 4, 4],
    '劫财': [3, 1, 2, 3, 3],
    '食神': [3, 3, 4, 5, 3],
    '伤官': [4, 3, 2, 3, 2],
    '偏财': [3, 5, 4, 3, 4],
    '正财': [3, 4, 5, 3, 3],
    '七杀': [4, 3, 2, 2, 3],
    '正官': [5, 3, 4, 3, 5],
    '偏印': [3, 2, 2, 3, 3],
    '正印': [4, 2, 3, 5, 5],
};

/**
 * 十神运势主题关键词
 */
const TEN_GOD_THEMES = {
    '比肩': { theme: '合作共赢', icon: '🤝', color: '#4ade80' },
    '劫财': { theme: '竞争拼搏', icon: '⚔️', color: '#f87171' },
    '食神': { theme: '才华横溢', icon: '🌟', color: '#fbbf24' },
    '伤官': { theme: '锐意创新', icon: '💡', color: '#a78bfa' },
    '偏财': { theme: '财源广进', icon: '💰', color: '#f59e0b' },
    '正财': { theme: '稳中求进', icon: '🏦', color: '#34d399' },
    '七杀': { theme: '乘风破浪', icon: '🌊', color: '#60a5fa' },
    '正官': { theme: '步步高升', icon: '👑', color: '#c084fc' },
    '偏印': { theme: '韬光养晦', icon: '📚', color: '#94a3b8' },
    '正印': { theme: '厚积薄发', icon: '🎓', color: '#2dd4bf' },
};

// ============================================================
//  运势文案库
// ============================================================

const FORTUNE_TEXTS = {
    // ---- 事业 ----
    career: {
        '比肩': [
            '本月适合团队协作，与同事并肩作战，事业上会有志同道合之人相助。保持开放心态，合作共赢才是上策。',
            '工作中容易遇到竞争对手，但也是互相促进的好机会。保持谦虚，用实力说话。',
        ],
        '劫财': [
            '职场竞争加剧，需要提防小人是非。不过压力即动力，只要坚守本心，反而能脱颖而出。',
            '工作上可能会有人事变动，保持冷静观察，不宜冲动决策。韬光养晦，静待时机。',
        ],
        '食神': [
            '创意灵感迸发的时期！适合提出新方案、展现才华。上级对你的能力刮目相看。',
            '工作氛围轻松愉快，适合发挥创造力。如果有创业或副业的想法，这是个不错的筹备期。',
        ],
        '伤官': [
            '你的创新思维在本月格外活跃，有打破常规的冲动。适合技术创新和方案改革，但注意表达方式。',
            '工作中可能对现状不满，想要推动变革。建议以数据说话，避免与领导正面冲突。',
        ],
        '偏财': [
            '事业上有意外机遇降临！可能收到猎头邀请或跨界合作机会。保持敏锐，果断出击。',
            '本月人脉资源丰富，社交活动增多。通过应酬和人际交往，事业版图有望扩大。',
        ],
        '正财': [
            '事业运稳步提升，踏实工作会获得相应回报。本月适合巩固成果，不宜冒进。',
            '工作效率高，完成质量好。领导对你的表现认可，有望获得稳定的晋升机会。',
        ],
        '七杀': [
            '事业上面临重大挑战与机遇并存！压力虽大但正是证明自己的时候。勇敢面对，方能破茧成蝶。',
            '工作节奏加快，可能承担更重的责任。这是锻炼能力的好时机，扛过去就是新台阶。',
        ],
        '正官': [
            '事业运大旺！有升职加薪的机会，或获得重要项目的主导权。行事正派，必有贵人相助。',
            '本月在职场中的权威和地位提升，适合展示领导才能。贵人运强，上级对你青睐有加。',
        ],
        '偏印': [
            '事业上需要深度思考和学习新技能。不宜急于求成，先充实自己，机会自然到来。',
            '工作中可能感到有些疲惫或迷茫，这是内在沉淀的过程。多阅读多思考，灵感会不期而至。',
        ],
        '正印': [
            '有来自长辈或上级的强力支持！适合学习进修或考取资质证书。知识就是力量，厚积薄发。',
            '贵人运极佳，可能得到重要人物的提携和指导。抓住学习机会，为未来打下坚实基础。',
        ],
    },

    // ---- 财运 ----
    wealth: {
        '比肩': [
            '财运平稳，收入与支出基本持平。适合合伙经营或共同投资，独自理财效果一般。',
            '不宜做大额投资决策。日常开支可能增加，建议做好预算管理，量入为出。',
        ],
        '劫财': [
            '财运需谨慎！本月有破财风险，不宜借贷或担保。管好自己的钱包，谨防受骗。',
            '可能会有意外支出或朋友借钱。学会拒绝，保护好自己的财务安全才是要务。',
        ],
        '食神': [
            '财运不错，主要来自才华和技能变现。副业收入有望增加，适合知识付费和技术服务。',
            '花钱较多但多用于享受生活和提升品质，属于良性消费。生活质量与收入同步上升。',
        ],
        '伤官': [
            '财运起伏，有意外收入的可能，但也容易冲动消费。理性控制购物欲，把钱花在刀刃上。',
            '凭借独特的眼光和创意，可能发现新的赚钱途径。但不宜把所有鸡蛋放在一个篮子里。',
        ],
        '偏财': [
            '偏财运极旺！可能有意外之财、投资收益或额外奖金。抓住机会，但见好就收。',
            '本月财路广开，各种进财渠道都可能有惊喜。适合短线投资，但不宜贪心恋战。',
        ],
        '正财': [
            '正财运旺盛，工资、奖金等固定收入稳步提升。理财效果好，适合做长期投资规划。',
            '财运稳定上升，收入来源可靠。本月适合购置资产、做稳健型投资，回报可期。',
        ],
        '七杀': [
            '财运有波动，可能先破后立。前期需要投入，但后期回报丰厚。耐心等待，勿急躁。',
            '投资理财需保守策略，避免高风险操作。把精力放在主业上，正财才是根基。',
        ],
        '正官': [
            '财运因事业提升而水涨船高。有升职加薪或项目奖金的进账，正当收入增加。',
            '本月适合规范化理财，可考虑咨询专业人士做资产配置。官星生财，前景看好。',
        ],
        '偏印': [
            '财运一般，进账速度较慢。可能有学习培训方面的开支，但这是值得的投资。',
            '不宜投机取巧，踏实赚钱才靠谱。可能收到小额意外收入，聊胜于无。',
        ],
        '正印': [
            '财运中等偏上，可能因为获取新知识或新技能而带来间接的财务收益。',
            '本月花在自我提升上的钱最值得。投资头脑就是最好的投资，长远来看必有回报。',
        ],
    },

    // ---- 感情 ----
    love: {
        '比肩': [
            '感情上容易遇到同频的伙伴。已有伴侣的人关系平稳，单身者社交圈可能出现心动对象。',
            '桃花运一般，但友谊可能升温。不要急于表白，先建立深厚的了解和信任。',
        ],
        '劫财': [
            '感情上需要警惕第三者或烂桃花的出现。已有伴侣者注意沟通，避免误会升级。',
            '本月情感波动较大，容易因小事争吵。退一步海阔天空，冷静处理矛盾。',
        ],
        '食神': [
            '桃花运旺盛！单身者有望遇到浪漫的邂逅。有伴侣者感情甜蜜，适合约会和制造小惊喜。',
            '感情生活丰富多彩，适合表达爱意。送一份用心的礼物，或安排一次难忘的约会吧。',
        ],
        '伤官': [
            '感情上个性突出，容易说出伤人的话。要学会换位思考，给对方一些空间。',
            '单身者桃花运不弱但易错过。已有伴侣者可能对现状不满，沟通时注意态度。',
        ],
        '偏财': [
            '异性缘极佳！各种社交场合都是邂逅的机会。已有伴侣者需保持距离感，避免暧昧。',
            '感情生活精彩纷呈，但不宜脚踏多条船。认真对待每一段关系，真心方能换真心。',
        ],
        '正财': [
            '感情运极佳！有望遇到踏实可靠的另一半。已有伴侣者关系更加稳固，考虑下一步发展。',
            '本月感情发展水到渠成，适合表白、确定关系或谈婚论嫁。珍惜眼前人。',
        ],
        '七杀': [
            '感情中可能遇到强势或有魅力的对象。火花四溅但也容易产生摩擦，理性看待。',
            '本月感情容易有戏剧性的发展。已有伴侣者注意对方情绪，适当包容和忍让。',
        ],
        '正官': [
            '正缘桃花出现！可能遇到品行端正、事业有成的优质对象。已有伴侣者关系和谐升温。',
            '感情发展稳健有保障。如果考虑结婚或同居，本月是一个吉利的时机。',
        ],
        '偏印': [
            '感情上比较被动，容易沉浸在自己的世界里。需要主动打开心扉，才能遇到对的人。',
            '已有伴侣者关系平淡，可能各忙各的。抽出时间陪伴对方，别让距离产生隔阂。',
        ],
        '正印': [
            '可能遇到温柔体贴、照顾你的对象。感情中被呵护的感觉让人安心。',
            '已有伴侣者可能收到暖心的惊喜。家庭关系和睦，长辈也可能帮你介绍对象。',
        ],
    },

    // ---- 健康 ----
    health: {
        '比肩': [
            '身体状况良好，精力充沛。适合运动健身，与朋友一起锻炼效果更佳。',
            '整体健康不错，但需注意劳逸结合。加班太多的话记得补充睡眠。',
        ],
        '劫财': [
            '注意运动安全，避免过于激烈的竞技运动。身体小毛病可能反复，及时就医。',
            '睡眠质量可能下降，压力管理很重要。尝试冥想或瑜伽来放松身心。',
        ],
        '食神': [
            '健康运极佳！食欲好、睡眠好、心情好。适合享受美食，但注意别吃太多哦。',
            '身心状态平衡，精神愉悦。可以尝试新的养生方式，泡温泉或做SPA犒劳自己。',
        ],
        '伤官': [
            '思虑过多可能导致头疼或失眠。学会放下执念，适当做些放松的活动。',
            '身体可能出现一些小状况，不要忽视。定期体检，有问题及时处理。',
        ],
        '偏财': [
            '健康总体不错，但社交应酬多可能伤肠胃。注意饮食有度，少喝酒。',
            '精力旺盛但容易透支。合理安排作息，别让忙碌的社交生活影响了身体。',
        ],
        '正财': [
            '健康运稳定。适合规律作息、均衡饮食。可以制定一个健身计划并坚持执行。',
            '身体底子不错，小毛病也能快速恢复。养成良好的生活习惯，受益终身。',
        ],
        '七杀': [
            '本月需特别注意安全和健康。避免过度疲劳，注意交通安全和意外伤害。',
            '压力较大时身体容易发出警报。多关注心脏和血压，及时释放负面情绪。',
        ],
        '正官': [
            '健康有保障，生活规律有序。心态平和，身体自然跟着好起来。',
            '适合做全面的健康管理计划。保持运动习惯，注重饮食营养搭配。',
        ],
        '偏印': [
            '可能出现倦怠感或亚健康状态。多补充维生素，保持充足的睡眠很关键。',
            '精神状态起伏不定，容易多思多虑。培养一个放松的爱好，有助于身心平衡。',
        ],
        '正印': [
            '健康运极佳！身体恢复力强，适合调理旧疾。多亲近自然，呼吸新鲜空气。',
            '身心状态都很好，有被照顾和呵护的温暖。合理的作息让你焕发光彩。',
        ],
    },

    // ---- 贵人 ----
    noble: {
        '比肩': [
            '同辈朋友是你的贵人！遇到困难时不要独自扛，找朋友帮忙会事半功倍。',
            '同事和同行中藏着贵人。多参加行业活动，拓展人脉圈。',
        ],
        '劫财': [
            '贵人运较弱，需靠自己的努力。识人要谨慎，不要轻信他人的花言巧语。',
            '本月人际关系略显复杂，保持真诚和底线。真正的贵人往往不声不响。',
        ],
        '食神': [
            '才华就是你最大的贵人。展现你的能力和作品，自然会吸引到伯乐。',
            '晚辈或下属可能给你带来意外的帮助和灵感。善待身边每一个人。',
        ],
        '伤官': [
            '独立思考是你的贵人。不人云亦云，坚持自己的判断，结果不会差。',
            '可能遇到让你又爱又恨的人，但从他们身上能学到很多。感恩每一次碰撞。',
        ],
        '偏财': [
            '人脉就是财脉！本月贵人多从社交和应酬中出现。保持热情和真诚。',
            '异地或异性贵人运旺。一次偶然的交谈，可能为你打开新的大门。',
        ],
        '正财': [
            '配偶或亲密伴侣是你本月的贵人。家人的支持是最温暖的后盾。',
            '稳定的合作伙伴为你保驾护航。珍惜那些一直陪在你身边的人。',
        ],
        '七杀': [
            '严厉的上级反而是你的贵人。虽然要求严格，但在压力下你会成长得更快。',
            '逆境中方见真朋友。本月贵人可能以挑战者的面貌出现，别急着拒绝。',
        ],
        '正官': [
            '贵人运极旺！长辈、领导或有权势的人会主动伸出援手。',
            '本月遇到的每一位正直的人都可能是贵人。保持谦逊有礼，福报自然来。',
        ],
        '偏印': [
            '老师、导师或某个领域的专家可能给你关键指点。虚心求教，受益匪浅。',
            '独处时的灵感就是内心贵人的指引。安静下来，答案自然浮现。',
        ],
        '正印': [
            '母亲或长辈是你最强的贵人！他们的经验和智慧为你照亮前方的路。',
            '来自师长或学术界的贵人特别多。学习和交流中遇到的人，值得长期维系。',
        ],
    },
};

// ============================================================
//  综合运势文案
// ============================================================

const OVERALL_THEMES = {
    '比肩': '本月以团队协作和友谊为主旋律，适合联合作战，共同成长。',
    '劫财': '本月挑战与机遇并存，保持警觉和底线，在竞争中锤炼自我。',
    '食神': '本月是享受生活、释放才华的好时光。心情愉悦，创意无限。',
    '伤官': '本月灵感爆棚但也容易情绪化。把创意落地实施，但注意人际关系。',
    '偏财': '本月财运当头，机遇纷至。社交活动多，把握每一次可能改变命运的相遇。',
    '正财': '本月稳扎稳打，收获实打实的成果。适合储蓄和规划，稳中有升。',
    '七杀': '本月是突破自我的关键期。挑战虽大但成长也快，勇敢面对，蜕变重生。',
    '正官': '本月运势高光！事业有成、贵人相助。行得正坐得端，好运自然来。',
    '偏印': '本月适合内省和充电。放慢脚步，沉淀自我，为下一个高峰做准备。',
    '正印': '本月被智慧和温暖包围。学有所成，贵人护航，身心皆安。',
};


// ============================================================
//  幸运提示
// ============================================================

const LUCKY_COLORS = {
    '木': ['翠绿色', '青色', '墨绿色'],
    '火': ['红色', '紫色', '橙色'],
    '土': ['黄色', '咖啡色', '米色'],
    '金': ['白色', '银色', '金色'],
    '水': ['黑色', '深蓝色', '灰色'],
};

const LUCKY_DIRECTIONS = {
    '木': '东方', '火': '南方', '土': '中央',
    '金': '西方', '水': '北方',
};

const LUCKY_NUMBERS = {
    '木': [3, 8], '火': [2, 7], '土': [5, 0],
    '金': [4, 9], '水': [1, 6],
};

const LUCKY_FOODS = {
    '木': ['绿色蔬菜', '水果', '酸味食物'],
    '火': ['烤肉', '辣椒', '苦味食物'],
    '土': ['五谷杂粮', '红薯', '甜食'],
    '金': ['白萝卜', '银耳', '辛味食物'],
    '水': ['鱼虾海鲜', '黑芝麻', '咸味食物'],
};


// ============================================================
//  评分计算
// ============================================================

/**
 * 根据十神和日主强弱计算月度各维度评分
 */
function calcMonthScores(stemTenGod, branchTenGod, dayMasterAnalysis) {
    const baseScores = TEN_GOD_SCORES[stemTenGod] || [3, 3, 3, 3, 3];
    const branchScores = TEN_GOD_SCORES[branchTenGod] || [3, 3, 3, 3, 3];

    // 天干影响 70%, 地支影响 30%
    const scores = baseScores.map((s, i) => {
        let score = s * 0.7 + branchScores[i] * 0.3;
        return score;
    });

    // 喜用神加持：如果流月五行与喜用神一致，整体加分
    // (这个逻辑在外部调用时附加)

    // 四舍五入到 0.5
    return scores.map(s => Math.round(s * 2) / 2);
}

/**
 * 根据五行与喜用神关系调整分数
 */
function adjustForXiYong(scores, monthElement, dayMasterAnalysis) {
    const xiYong = dayMasterAnalysis.xiYong.index;
    const jiShen = dayMasterAnalysis.jiShen.index;

    if (monthElement === xiYong) {
        return scores.map(s => Math.min(5, s + 0.5));
    } else if (monthElement === jiShen) {
        return scores.map(s => Math.max(1, s - 0.5));
    }
    return scores;
}


// ============================================================
//  主入口：运势分析
// ============================================================

/**
 * 分析2026下半年运势
 * @param {object} baziResult - calculateBaZi() 的返回结果
 * @returns {object} 运势分析结果
 */
export function analyzeFortune(baziResult) {
    const { dayMaster, dayMasterAnalysis, monthlyTenGods, wuXing, daYun } = baziResult;

    // 大运流年分析 (针对 2026 丙午流年)
    let currentDaYun = null;
    if (daYun && daYun.pillars && daYun.pillars.length > 0) {
        const yearTarget = 2026;
        currentDaYun = daYun.pillars.find(p => yearTarget >= p.yearStart && yearTarget <= p.yearEnd);
        if (!currentDaYun) {
            if (yearTarget < daYun.startYear) {
                currentDaYun = {
                    isChild: true,
                    ganZhi: '未起运 (童限)',
                    stemTenGod: '未知',
                    desc: '目前处于童限（未起运）阶段，运势暂由月柱主导，需待起运后方见分晓。'
                };
            } else {
                currentDaYun = { ...daYun.pillars[daYun.pillars.length - 1], isLate: true }; 
            }
        }
        
        if (currentDaYun && !currentDaYun.isChild) {
            const daYunTenGod = getTenGod(dayMaster.stem, currentDaYun.stem);
            currentDaYun.stemTenGod = daYunTenGod;
            const daYunElement = STEM_TO_ELEMENT[currentDaYun.stem];
            
            const xiYong = dayMasterAnalysis.xiYong.index;
            const jiShen = dayMasterAnalysis.jiShen.index;
            
            let luckStatus = '平稳过渡';
            if (daYunElement === xiYong) luckStatus = '大吉 (喜用神当道)';
            else if (daYunElement === jiShen) luckStatus = '波折 (忌神当道)';
            
            currentDaYun.desc = `当前处于【${currentDaYun.ganZhi}】大运（${currentDaYun.yearStart} - ${currentDaYun.yearEnd}年），十神为${daYunTenGod}。此步大运五行属${WU_XING_NAMES[daYunElement]}，是您的${daYunElement === xiYong ? '喜用神' : (daYunElement === jiShen ? '忌神' : '平神')}，整体大运基调：${luckStatus}。

✨ **近三年流年运势走向**：
- **2026 丙午年 (马)**：流年天干为丙火，地支为午火。火气极旺，${dayMasterAnalysis.xiYong.index === 2 ? '大吉大利，事业财运双丰收！' : (dayMasterAnalysis.jiShen.index === 2 ? '需谨慎行事，避免情绪冲动和破财风险。' : '运势起伏，在变动中寻找机会。')}
- **2027 丁未年 (羊)**：流年天干为丁火，地支为未土。火土相生，${dayMasterAnalysis.xiYong.index === 3 || dayMasterAnalysis.xiYong.index === 2 ? '运势稳步上升，适合拓展人脉和资源。' : '宜保守理财，关注自身健康。'}
- **2028 戊申年 (猴)**：流年天干为戊土，地支为申金。土金相生，${dayMasterAnalysis.xiYong.index === 4 || dayMasterAnalysis.xiYong.index === 0 ? '金气显现，财运事业迎来新机遇，大展宏图之年！' : '可能面临一些压力与挑战，需稳扎稳打。'}`;
        }
    }

    // 幸运提示（基于喜用神五行）
    const xiYongElement = dayMasterAnalysis.xiYong.name;
    const luckyInfo = {
        colors: LUCKY_COLORS[xiYongElement] || ['白色'],
        direction: LUCKY_DIRECTIONS[xiYongElement] || '中央',
        numbers: LUCKY_NUMBERS[xiYongElement] || [5],
        foods: LUCKY_FOODS[xiYongElement] || ['五谷杂粮'],
        element: xiYongElement,
    };

    // 逐月分析
    const months = monthlyTenGods.map((m, idx) => {
        const stemTenGod = m.stemTenGod;
        const branchTenGod = m.branchTenGod;
        const monthElement = STEM_TO_ELEMENT[m.stem];

        // 评分
        let scores = calcMonthScores(stemTenGod, branchTenGod, dayMasterAnalysis);
        scores = adjustForXiYong(scores, monthElement, dayMasterAnalysis);

        // 取文案 (随机选一条)
        const pickText = (category, tenGod) => {
            const texts = FORTUNE_TEXTS[category]?.[tenGod];
            if (!texts || texts.length === 0) return '运势平稳，保持平常心即可。';
            // 用月份索引作为伪随机种子，确保同一用户每次看到的文案一致
            const seed = (dayMaster.stem + idx + category.length) % texts.length;
            return texts[seed];
        };

        const dimensions = [
            { key: 'career', label: '事业运', icon: '💼', score: scores[0], text: pickText('career', stemTenGod) },
            { key: 'wealth', label: '财运',   icon: '💎', score: scores[1], text: pickText('wealth', stemTenGod) },
            { key: 'love',   label: '感情运', icon: '💕', score: scores[2], text: pickText('love', stemTenGod) },
            { key: 'health', label: '健康运', icon: '🌿', score: scores[3], text: pickText('health', stemTenGod) },
            { key: 'noble',  label: '贵人运', icon: '🌟', score: scores[4], text: pickText('noble', stemTenGod) },
        ];

        // 总分
        const totalScore = dimensions.reduce((sum, d) => sum + d.score, 0);
        const avgScore = Math.round((totalScore / 5) * 10) / 10;

        // 主题
        const theme = TEN_GOD_THEMES[stemTenGod] || { theme: '平稳过渡', icon: '☯️', color: '#94a3b8' };
        const overall = OVERALL_THEMES[stemTenGod] || '运势平稳，顺其自然。';

        return {
            ...m,
            stemTenGod,
            branchTenGod,
            dimensions,
            totalScore,
            avgScore,
            theme,
            overall,
        };
    });

    // 整体趋势
    const avgScores = months.map(m => m.avgScore);
    const bestMonth = months.reduce((best, m) => m.avgScore > best.avgScore ? m : best, months[0]);
    const worstMonth = months.reduce((worst, m) => m.avgScore < worst.avgScore ? m : worst, months[0]);

    // 整体运势评语
    const trend = avgScores[avgScores.length - 1] > avgScores[0] ? 'rising' : avgScores[avgScores.length - 1] < avgScores[0] ? 'falling' : 'stable';
    const trendLabels = { rising: '渐入佳境', falling: '先扬后抑', stable: '稳如泰山' };

    // 日主简析文案
    const dayMasterDesc = generateDayMasterDescription(dayMaster, dayMasterAnalysis);

    return {
        months,
        overall: {
            avgScores,
            bestMonth: { name: bestMonth.monthName, ganZhi: bestMonth.ganZhi, score: bestMonth.avgScore },
            worstMonth: { name: worstMonth.monthName, ganZhi: worstMonth.ganZhi, score: worstMonth.avgScore },
            trend,
            trendLabel: trendLabels[trend],
        },
        luckyInfo,
        dayMasterDesc,
        currentDaYun
    };
}


// ============================================================
//  日主描述生成
// ============================================================

const DAY_MASTER_DESCRIPTIONS = {
    '甲': { title: '参天大树', desc: '你如同一棵参天大树，有向上的决心和不屈的精神。性格正直、坚毅，有领导才能，天生适合做开创者。' },
    '乙': { title: '花草藤蔓', desc: '你如同柔韧的藤蔓，看似柔弱实则坚韧。善于适应环境，灵活变通，有极强的生存智慧和艺术天赋。' },
    '丙': { title: '太阳之火', desc: '你如同太阳般光芒万丈，热情洋溢、光明磊落。天生自带光环，有感染力和号召力，乐于照亮他人。' },
    '丁': { title: '烛光灯火', desc: '你如同温暖的烛光，柔和而坚定。心思细腻、善解人意，虽然低调但内心有着不灭的热忱和坚持。' },
    '戊': { title: '高山大地', desc: '你如同巍峨的高山，沉稳厚重、值得信赖。为人大度包容，有强大的承载力，是朋友圈中的定海神针。' },
    '己': { title: '田园沃土', desc: '你如同肥沃的田园，温和滋养、默默奉献。细心体贴、善于照顾他人，有很强的亲和力和共情能力。' },
    '庚': { title: '刚毅金刀', desc: '你如同锋利的宝刀，果断勇敢、雷厉风行。有侠义精神和正义感，做事干脆利落，不拖泥带水。' },
    '辛': { title: '精美珠宝', desc: '你如同精雕细琢的宝石，有品位、有质感。外表精致、内心坚强，追求完美，有独特的审美眼光。' },
    '壬': { title: '汪洋大海', desc: '你如同浩瀚的大海，胸襟开阔、智慧深沉。思维活跃、适应力强，有远大的理想和包容万物的气度。' },
    '癸': { title: '雨露清泉', desc: '你如同润物无声的细雨，温柔敏感、洞察力强。看似安静但内心丰富，有很强的第六感和想象力。' },
};

function generateDayMasterDescription(dayMaster, analysis) {
    const desc = DAY_MASTER_DESCRIPTIONS[dayMaster.char] || { title: '神秘之力', desc: '你有着独特的个性和能量。' };

    return {
        title: desc.title,
        description: desc.desc,
        element: dayMaster.element,
        yinYang: dayMaster.yinYang,
        strength: analysis.strengthLabel,
        xiYong: analysis.xiYong.name,
        jiShen: analysis.jiShen.name,
        strengthDesc: analysis.isStrong
            ? '你的命格属于身强之人，精力充沛、意志坚定，适合开拓进取，但需注意不要过于刚强。喜用克泄之力来平衡，事业和财运方面多下功夫会有收获。'
            : '你的命格属于身弱之人，心思细腻、谨慎稳重，适合稳步发展。需要生扶之力来加持，多亲近印星和比劫五行，贵人运是你的加分项。',
    };
}
