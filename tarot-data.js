/**
 * 塔罗牌元数据 (22张大阿卡纳 Major Arcana)
 */
export const MAJOR_ARCANA = [
    { id: 0, name: '愚者', nameEn: 'The Fool', element: '风', keywordsUpright: ['新的开始', '冒险', '自由', '纯真'], keywordsReversed: ['轻率', '盲目风险', '逃避现实'], uprightDesc: '愚者象征着一段崭新旅程的开端。怀揣纯粹好奇心与勇气，迈向未知世界。', reversedDesc: '逆位提醒注意盲目冒进。此时可能缺乏准备，忽略潜藏风险。', advice: '保持开放心态，脚踏实地。', iconSymbol: '🎒' },
    { id: 1, name: '魔术师', nameEn: 'The Magician', element: '风', keywordsUpright: ['创造力', '资源整合', '行动力'], keywordsReversed: ['能力受阻', '意图模糊', '资源浪费'], uprightDesc: '魔术师拥有将想法变为现实的强大能量。手头已具备实现目标的一切资源。', reversedDesc: '逆位意味着潜能未能完全释放。警惕自满与虚张声势。', advice: '相信你的能力，将心念转化为切实的行动。', iconSymbol: '🪄' },
    { id: 2, name: '女祭司', nameEn: 'The High Priestess', element: '水', keywordsUpright: ['直觉', '潜意识', '静谧'], keywordsReversed: ['忽视直觉', '情绪压抑', '不安'], uprightDesc: '女祭司守卫着深沉的内在智慧与直觉之门。向内探索，答案早已藏在潜意识中。', reversedDesc: '逆位暗示过于依赖理性而忽略内心真实声音。', advice: '聆听潜意识的细语，静心冥想。', iconSymbol: '🌙' },
    { id: 3, name: '皇后', nameEn: 'The Empress', element: '土', keywordsUpright: ['丰盈', '滋养', '创造', '美与爱'], keywordsReversed: ['创造力受阻', '过度依赖', '匮乏感'], uprightDesc: '皇后代表着大自然的丰饶与无私滋养。爱情与事业迎来繁茂生长期。', reversedDesc: '逆位暗示感到精力透支或匮乏感。学会先给予自己关爱。', advice: '关爱自己的心灵，耐心等待丰硕果实。', iconSymbol: '👑' },
    { id: 4, name: '皇帝', nameEn: 'The Emperor', element: '火', keywordsUpright: ['秩序', '领导力', '稳定', '权威'], keywordsReversed: ['控制欲强', '固执己见', '结构混乱'], uprightDesc: '皇帝象征坚固的秩序与掌控力。展现清晰逻辑与领导才能。', reversedDesc: '逆位提示避免过度固执或强行控制周围环境。', advice: '用理性建立秩序，用胸怀赢得尊重。', iconSymbol: '🏛️' },
    { id: 5, name: '教皇', nameEn: 'The Hierophant', element: '土', keywordsUpright: ['传统', '导师指引', '信仰'], keywordsReversed: ['打破常规', '盲从权威', '观念冲突'], uprightDesc: '教皇代表传统智慧与导师提携。遵从既定规范将助你顺遂渡过难关。', reversedDesc: '逆位鼓励寻找属于你个人的独特信仰，不必盲从教条。', advice: '尊崇传统智慧的同时，保持独立思考。', iconSymbol: '📜' },
    { id: 6, name: '恋人', nameEn: 'The Lovers', element: '风', keywordsUpright: ['和谐选择', '契合', '亲密关系'], keywordsReversed: ['选择困难', '价值观分歧', '关系失衡'], uprightDesc: '恋人牌象征深层联结与重要人生抉择。真诚与理解带你走向和谐。', reversedDesc: '逆位面临价值观分歧。警惕因冲动偏离初衷。', advice: '跟随内心最真实的价值观做决定。', iconSymbol: '💖' },
    { id: 7, name: '战车', nameEn: 'The Chariot', element: '水', keywordsUpright: ['意志力', '突破阻碍', '胜利'], keywordsReversed: ['失控', '方向模糊', '力不从心'], uprightDesc: '战车象征靠强烈的意志力驾驭对立能量。坚定前行必获胜利。', reversedDesc: '逆位警示能量失衡。冲动驾驶容易偏离轨道。', advice: '握紧心里的缰绳，平衡理智与情感。', iconSymbol: '🛡️' },
    { id: 8, name: '力量', nameEn: 'Strength', element: '火', keywordsUpright: ['柔能克刚', '包容', '自信'], keywordsReversed: ['自我怀疑', '情绪失控', '焦躁'], uprightDesc: '力量是以温柔与从容驾驭凶猛。用爱与包容化解危机。', reversedDesc: '逆位自我怀疑侵蚀了勇气。接纳自己的软弱亦是力量。', advice: '温和地面对世界，坚定守护内心。', iconSymbol: '🦁' },
    { id: 9, name: '隐士', nameEn: 'The Hermit', element: '土', keywordsUpright: ['内省', '寻求真理', '独处沉淀'], keywordsReversed: ['孤立孤僻', '逃避社交', '迷茫'], uprightDesc: '隐士在寂静中寻求真理。适合暂时远离喧嚣，沉淀自我。', reversedDesc: '逆位警惕过度封闭走向孤僻。独处是为了蓄力。', advice: '照亮你脚下的路，不必急于求成。', iconSymbol: '🕯️' },
    { id: 10, name: '命运之轮', nameEn: 'Wheel of Fortune', element: '火', keywordsUpright: ['契机', '转折点', '好运降临'], keywordsReversed: ['阻滞', '不测变数', '低谷蓄力'], uprightDesc: '命运之轮轰然转动，带来意料之外的转机。顺应天时把握机遇。', reversedDesc: '逆位处于暂时的运势低谷。低谷正是蓄势待发之机。', advice: '顺势而为，不以物喜不以己悲。', iconSymbol: '☸️' },
    { id: 11, name: '正义', nameEn: 'Justice', element: '风', keywordsUpright: ['公平', '因果报应', '理性裁决'], keywordsReversed: ['不公', '偏见', '推卸责任'], uprightDesc: '天平衡量因果。你的付出将得到公正回报，决定基于诚实客观。', reversedDesc: '逆位警惕偏见与自我合理化。勇敢承担应有责任。', advice: '以客观视角审视问题，心存坦荡。', iconSymbol: '⚖️' },
    { id: 12, name: '倒吊人', nameEn: 'The Hanged Man', element: '水', keywordsUpright: ['换位思考', '顺从等待', '灵感顿悟'], keywordsReversed: ['无谓牺牲', '停滞不前', '挣扎'], uprightDesc: '倒吊人自愿悬挂以换取全新视角。暂停盲动，换个角度思考。', reversedDesc: '逆位提示避免无谓牺牲。学会自我解脱重新出发。', advice: '倒过来看世界，往往能发现真相。', iconSymbol: '🙃' },
    { id: 13, name: '死神', nameEn: 'Death', element: '水', keywordsUpright: ['终结与新生', '彻底改变', '蜕变'], keywordsReversed: ['恐惧改变', '藕断丝连', '僵局'], uprightDesc: '死神代表旧阶段的终结与新起点。勇敢告别不再适合的过去。', reversedDesc: '逆位紧抱早已过时的人事物。勇敢放手拥抱新光明。', advice: '接纳终结，就是迎接新生。', iconSymbol: '🦋' },
    { id: 14, name: '节制', nameEn: 'Temperance', element: '火', keywordsUpright: ['调和', '中庸之道', '身心平衡'], keywordsReversed: ['极端失衡', '缺乏节制', '冲突'], uprightDesc: '节制天使在两只杯子间平稳倾倒圣水。保持适度与中庸，身心得到疗愈。', reversedDesc: '逆位警示生活处于极端状态。急需找回内在平衡。', advice: '不张扬，在水火交融中寻找最舒适的节奏。', iconSymbol: '🏺' },
    { id: 15, name: '恶魔', nameEn: 'The Devil', element: '土', keywordsUpright: ['欲望束缚', '执念', '沉迷'], keywordsReversed: ['摆脱枷锁', '觉醒', '自由'], uprightDesc: '恶魔揭示被欲望或执念绑架的状态。脚下锁链来自于内心的恐惧。', reversedDesc: '逆位代表觉醒！主动斩断束缚自我的锁链，重获自由。', advice: '直面内心的欲望，随时有解开枷锁的力量。', iconSymbol: '🔗' },
    { id: 16, name: '高塔', nameEn: 'The Tower', element: '火', keywordsUpright: ['突发震荡', '假象破灭', '重构'], keywordsReversed: ['化险为夷', '隐秘危机', '勉强维持'], uprightDesc: '闪电击碎虚妄高塔。虽然瞬间震荡，但正是清除幻象重构之机。', reversedDesc: '逆位危机被暂时推迟。不要在危楼上添砖加瓦。', advice: '地基不稳终会坍塌。破旧立新。', iconSymbol: '⚡' },
    { id: 17, name: '星星', nameEn: 'The Star', element: '风', keywordsUpright: ['希望', '灵感爆发', '宁静疗愈'], keywordsReversed: ['沮丧绝望', '缺乏灵感', '空想'], uprightDesc: '风暴过后亮起璀璨明星。星星带来无尽希望与疗愈。', reversedDesc: '逆位悲观遮蔽了希望。重新找回对生活的信心。', advice: '仰望星空，柔和星光指引你走出黑夜。', iconSymbol: '⭐' },
    { id: 18, name: '月亮', nameEn: 'The Moon', element: '水', keywordsUpright: ['不安神秘', '潜意识恐惧', '直觉'], keywordsReversed: ['云开雾散', '看清真相', '澄清'], uprightDesc: '月色朦胧，投影出潜意识的恐惧。凭借敏锐直觉小心穿行。', reversedDesc: '逆位迷雾消散，误会澄清。战胜不安，重见清明。', advice: '接纳暗夜的不安，月光亦能照亮前路。', iconSymbol: '🌔' },
    { id: 19, name: '太阳', nameEn: 'The Sun', element: '火', keywordsUpright: ['光明辉煌', '喜悦', '成功', '活力'], keywordsReversed: ['阴云笼罩', '延迟成功', '小挫折'], uprightDesc: '太阳放射出炽热光芒！充沛活力与成功正与你相拥。', reversedDesc: '逆位太阳被云层暂时遮挡。成功稍有延迟，保持乐观。', advice: '尽情享受当下的温暖，将光芒分享他人。', iconSymbol: '☀️' },
    { id: 20, name: '审判', nameEn: 'Judgement', element: '火', keywordsUpright: ['号角召唤', '重大觉醒', '重生'], keywordsReversed: ['自我怀疑', '逃避抉择', '自责'], uprightDesc: '号角呼唤灵魂觉醒。总结经验，准备迈向更高阶人生境界。', reversedDesc: '逆位深陷过去的悔恨自责。学会原谅自己。', advice: '听从内心的天命召唤，坦然迎接新生。', iconSymbol: '🎺' },
    { id: 21, name: '世界', nameEn: 'The World', element: '土', keywordsUpright: ['圆满完成', '大功告成', '自由'], keywordsReversed: ['未臻完善', '缺乏收尾', '迟延'], uprightDesc: '一段漫长旅程迎来了辉煌终点。身心灵达到高度统一与自由。', reversedDesc: '逆位距离圆满还差最后一步。坚持到底方能功德圆满。', advice: '庆祝你所取得的成就，天地辽阔。', iconSymbol: '🌍' }
];

const SUITS = [
    { id: 'wands', name: '权杖', element: '火', icon: '🪵', desc: '行动、创造、激情与灵感' },
    { id: 'cups', name: '圣杯', element: '水', icon: '🏆', desc: '情感、直觉、人际与爱' },
    { id: 'swords', name: '宝剑', element: '风', icon: '⚔️', desc: '思想、冲突、理智与决断' },
    { id: 'pentacles', name: '星币', element: '土', icon: '🪙', desc: '物质、财富、现实与成就' }
];

const NUMBERS = [
    { id: 1,  name: '王牌(Ace)',   nameEn: 'Ace',    keyword: '纯粹的起始' },
    { id: 2,  name: '数字2',      nameEn: 'Two',    keyword: '平衡与选择' },
    { id: 3,  name: '数字3',      nameEn: 'Three',  keyword: '初步的成果' },
    { id: 4,  name: '数字4',      nameEn: 'Four',   keyword: '稳定与停滞' },
    { id: 5,  name: '数字5',      nameEn: 'Five',   keyword: '冲突与改变' },
    { id: 6,  name: '数字6',      nameEn: 'Six',    keyword: '和谐与恢复' },
    { id: 7,  name: '数字7',      nameEn: 'Seven',  keyword: '反思与挑战' },
    { id: 8,  name: '数字8',      nameEn: 'Eight',  keyword: '专注与力量' },
    { id: 9,  name: '数字9',      nameEn: 'Nine',   keyword: '接近顶峰' },
    { id: 10, name: '数字10',     nameEn: 'Ten',    keyword: '终极状态' },
    { id: 11, name: '侍从(Page)', nameEn: 'Page',   keyword: '新消息与学习' },
    { id: 12, name: '骑士(Knight)',nameEn: 'Knight', keyword: '行动与推进' },
    { id: 13, name: '王后(Queen)', nameEn: 'Queen',  keyword: '内化与掌控' },
    { id: 14, name: '国王(King)',  nameEn: 'King',   keyword: '外显与权威' }
];

export const MINOR_ARCANA = [];
SUITS.forEach(suit => {
    NUMBERS.forEach(num => {
        MINOR_ARCANA.push({
            id: `minor_${suit.id}_${num.id}`,
            name: `${suit.name}${num.name}`,
            nameEn: `${num.nameEn} of ${suit.id.charAt(0).toUpperCase() + suit.id.slice(1)}`,
            element: suit.element,
            keywordsUpright: [suit.desc, num.keyword, '正向发展'],
            keywordsReversed: ['元素受阻', '发展不顺', '逆境'],
            uprightDesc: `${suit.name}代表的【${suit.desc}】能量，在【${num.keyword}】的阶段得到了正向发挥。建议顺势而为。`,
            reversedDesc: `${suit.name}能量受阻或过度，导致在【${num.keyword}】阶段出现波折。建议调整心态，寻找根源。`,
            advice: `结合${suit.name}的特质，在当前局面中寻找突破口。`,
            iconSymbol: suit.icon,
            isMinor: true
        });
    });
});

export const FULL_DECK = [...MAJOR_ARCANA, ...MINOR_ARCANA];

export const TAROT_SPREADS = [
    {
        id: 'celtic_cross',
        name: '凯尔特十字牌阵',
        cardsCount: 10,
        description: '最经典的深度塔罗牌阵，全方位剖析复杂问题的核心、内外因素及最终结果。',
        positions: [
            { label: '1.现状(核心)' },
            { label: '2.阻碍(挑战)' },
            { label: '3.目标(意识)' },
            { label: '4.根基(潜意识)' },
            { label: '5.过去(近期)' },
            { label: '6.未来(短期)' },
            { label: '7.自我(态度)' },
            { label: '8.环境(外界)' },
            { label: '9.希望与恐惧' },
            { label: '10.最终结果' }
        ]
    },
    {
        id: 'h2_2026',
        name: '2026 下半年运势流月牌阵',
        cardsCount: 6,
        description: '抽取6张牌，对应2026年7月至12月的流月能量与关键指引。',
        positions: [
            { label: '7月 (乙未) · 契机与起点' },
            { label: '8月 (丙申) · 阻碍与突破' },
            { label: '9月 (丁酉) · 关系与沟通' },
            { label: '10月 (戊戌) · 财务与资源' },
            { label: '11月 (己亥) · 心灵与内省' },
            { label: '12月 (庚子) · 总结与新局' }
        ]
    },
    {
        id: 'three_cards',
        name: '时间之流牌阵',
        cardsCount: 3,
        description: '探索过去因素、当下现状与未来发展趋势。',
        positions: [
            { label: '过去 (Past)' },
            { label: '现状 (Present)' },
            { label: '未来 (Future)' }
        ]
    },
    {
        id: 'triangle',
        name: '圣三角启示牌阵',
        cardsCount: 3,
        description: '分析问题核心、行动建议与预测结果。',
        positions: [
            { label: '问题核心' },
            { label: '指引建议' },
            { label: '可能结果' }
        ]
    },
    {
        id: 'single',
        name: '单牌直觉求问',
        cardsCount: 1,
        description: '抽取1张牌，获得今日运势或即时灵感指引。',
        positions: [
            { label: '启示牌' }
        ]
    }
];

export function generateCardSvg(card, isReversed = false) {
    const isMinor = card.isMinor;
    const title = isMinor ? card.name : card.id;
    return `
        <svg viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg" class="tarot-card-svg ${isReversed ? 'svg-reversed' : ''}">
            <defs>
                <linearGradient id="goldGradTarot" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#f6e05e" />
                    <stop offset="50%" stop-color="#d69e2e" />
                    <stop offset="100%" stop-color="#975a16" />
                </linearGradient>
            </defs>
            <rect x="4" y="4" width="192" height="312" rx="12" fill="#120e24" stroke="url(#goldGradTarot)" stroke-width="2" />
            <rect x="10" y="10" width="180" height="300" rx="8" fill="none" stroke="url(#goldGradTarot)" stroke-width="1" stroke-dasharray="4,2" />
            <text x="100" y="36" font-family="serif" font-size="${isMinor ? '11' : '14'}" font-weight="bold" fill="url(#goldGradTarot)" text-anchor="middle">${title}</text>
            <g transform="translate(100, 150)">
                <circle r="42" fill="none" stroke="url(#goldGradTarot)" stroke-width="1" stroke-dasharray="3,3" opacity="0.6"/>
                <text x="0" y="14" font-size="44" text-anchor="middle">${card.iconSymbol}</text>
            </g>
            <rect x="30" y="260" width="140" height="32" rx="4" fill="rgba(18,14,36,0.9)" stroke="url(#goldGradTarot)" stroke-width="1" />
            <text x="100" y="278" font-family="serif" font-size="11" font-weight="bold" fill="#f7fafc" text-anchor="middle">${card.name}</text>
            ${isReversed ? `<text x="100" y="292" font-family="serif" font-size="10" font-weight="bold" fill="#f87171" text-anchor="middle">(逆位)</text>` : `<text x="100" y="292" font-family="serif" font-size="10" font-weight="bold" fill="#4ade80" text-anchor="middle">(正位)</text>`}
        </svg>
    `;
}
