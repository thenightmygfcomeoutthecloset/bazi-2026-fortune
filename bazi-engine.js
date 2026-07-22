/**
 * 八字排盘引擎 (BaZi Engine) — 升级版 (含真太阳时经度校正)
 * 
 * 核心功能：
 * - 城市经度库与真太阳时(True Solar Time)算法
 * - 四柱（年月日时）天干地支计算
 * - 五行分析、十神推导、日主强弱与喜用神
 * - 2026下半年流月数据
 */

// ============================================================
//  全国主要城市经度数据库 (用于真太阳时换算，基准为北京时间 120°E)
// ============================================================
// REGION_DATA is now loaded dynamically via region-data.json in app.js

/**
 * 计算真太阳时 (True Solar Time)
 */
export function calculateTrueSolarTime(year, month, day, hour, minute, longitude) {
    const longitudeOffsetMinutes = (longitude - 120.0) * 4;
    const startOfYear = new Date(year, 0, 1);
    const currentDate = new Date(year, month - 1, day);
    const dayOfYear = Math.floor((currentDate - startOfYear) / (24 * 60 * 60 * 1000)) + 1;
    const b = (2 * Math.PI * (dayOfYear - 81)) / 364;
    const eotMinutes = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);

    const totalOffsetMinutes = Math.round(longitudeOffsetMinutes + eotMinutes);

    const baseDate = new Date(year, month - 1, day, hour, minute);
    const adjustedDate = new Date(baseDate.getTime() + totalOffsetMinutes * 60 * 1000);

    const adjHour = adjustedDate.getHours();
    const adjMinute = adjustedDate.getMinutes();

    let hourBranch;
    if ((adjHour === 23) || (adjHour === 0 && adjMinute <= 59)) {
        hourBranch = 0; // 子时
    } else {
        hourBranch = Math.floor((adjHour + 1) / 2) % 12;
    }

    return {
        originalTime: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} (北京时间)`,
        adjustedTime: `${adjustedDate.getFullYear()}-${String(adjustedDate.getMonth() + 1).padStart(2, '0')}-${String(adjustedDate.getDate()).padStart(2, '0')} ${String(adjustedDate.getHours()).padStart(2, '0')}:${String(adjustedDate.getMinutes()).padStart(2, '0')}`,
        offsetMinutes: totalOffsetMinutes,
        longitude,
        adjustedYear: adjustedDate.getFullYear(),
        adjustedMonth: adjustedDate.getMonth() + 1,
        adjustedDay: adjustedDate.getDate(),
        adjustedHour: adjustedDate.getHours(),
        hourBranch,
    };
}

// ============================================================
//  八字基础常量
// ============================================================
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const WU_XING_NAMES = ['木', '火', '土', '金', '水'];
export const WU_XING_EN = ['wood', 'fire', 'earth', 'metal', 'water'];
export const STEM_TO_ELEMENT = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
export const BRANCH_TO_ELEMENT = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];

export function isYang(stemIndex) {
    return stemIndex % 2 === 0;
}

export const BRANCH_HIDDEN_STEMS = [
    [9], [5, 9, 7], [0, 2, 4], [1], [4, 1, 9], [2, 4, 6],
    [3, 5], [5, 3, 1], [6, 4, 8], [7], [4, 7, 3], [8, 0]
];

const HIDDEN_STEM_WEIGHTS = [1.0, 0.3, 0.15];
export const TEN_GODS = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'];

const SHENG = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 0 };
const KE   = { 0: 2, 1: 3, 2: 4, 3: 0, 4: 1 };
const SHENG_BY = { 0: 4, 1: 0, 2: 1, 3: 2, 4: 3 };
const KE_BY   = { 0: 3, 1: 4, 2: 0, 3: 1, 4: 2 };

export const H2_2026_MONTHS = [
    { index: 0, stem: 1, branch: 7,  ganZhi: '乙未', monthName: '七月',   element: '木/土', period: '小暑 — 立秋',   gregorian: '7月7日 — 8月6日',   season: '盛夏' },
    { index: 1, stem: 2, branch: 8,  ganZhi: '丙申', monthName: '八月',   element: '火/金', period: '立秋 — 白露',   gregorian: '8月7日 — 9月7日',   season: '初秋' },
    { index: 2, stem: 3, branch: 9,  ganZhi: '丁酉', monthName: '九月',   element: '火/金', period: '白露 — 寒露',   gregorian: '9月8日 — 10月7日',  season: '仲秋' },
    { index: 3, stem: 4, branch: 10, ganZhi: '戊戌', monthName: '十月',   element: '土/土', period: '寒露 — 立冬',   gregorian: '10月8日 — 11月6日', season: '深秋' },
    { index: 4, stem: 5, branch: 11, ganZhi: '己亥', monthName: '十一月', element: '土/水', period: '立冬 — 大雪',   gregorian: '11月7日 — 12月6日', season: '初冬' },
    { index: 5, stem: 6, branch: 0,  ganZhi: '庚子', monthName: '十二月', element: '金/水', period: '大雪 — 小寒',   gregorian: '12月7日 — 1月5日',  season: '隆冬' },
];

function gregorianToJDN(year, month, day) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    return day + Math.floor((153 * m + 2) / 5) + 365 * y
        + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function getYearPillar(year, month, day) {
    let adjustedYear = year;
    if (month < 2 || (month === 2 && day < 4)) {
        adjustedYear -= 1;
    }
    const stem = ((adjustedYear - 4) % 10 + 10) % 10;
    const branch = ((adjustedYear - 4) % 12 + 12) % 12;
    return { stem, branch };
}

function getMonthPillar(year, month, day, yearStem) {
    const dateNum = month * 100 + day;
    let monthBranch;

    if (dateNum >= 204 && dateNum < 306)       monthBranch = 2;
    else if (dateNum >= 306 && dateNum < 405)  monthBranch = 3;
    else if (dateNum >= 405 && dateNum < 506)  monthBranch = 4;
    else if (dateNum >= 506 && dateNum < 606)  monthBranch = 5;
    else if (dateNum >= 606 && dateNum < 707)  monthBranch = 6;
    else if (dateNum >= 707 && dateNum < 807)  monthBranch = 7;
    else if (dateNum >= 807 && dateNum < 908)  monthBranch = 8;
    else if (dateNum >= 908 && dateNum < 1008) monthBranch = 9;
    else if (dateNum >= 1008 && dateNum < 1107) monthBranch = 10;
    else if (dateNum >= 1107 && dateNum < 1207) monthBranch = 11;
    else if (dateNum >= 1207 || dateNum < 106)  monthBranch = 0;
    else monthBranch = 1;

    const monthStemStarts = [2, 4, 6, 8, 0];
    const monthStemStart = monthStemStarts[yearStem % 5];
    const monthOrder = ((monthBranch - 2) + 12) % 12;
    const stem = (monthStemStart + monthOrder) % 10;

    return { stem, branch: monthBranch };
}

function getDayPillar(year, month, day) {
    const jdn = gregorianToJDN(year, month, day);
    const stem = ((jdn + 9) % 10 + 10) % 10;
    const branch = ((jdn + 1) % 12 + 12) % 12;
    return { stem, branch };
}

function getHourPillar(hourBranch, dayStem) {
    const hourStemStarts = [0, 2, 4, 6, 8];
    const hourStemStart = hourStemStarts[dayStem % 5];
    const stem = (hourStemStart + hourBranch) % 10;
    return { stem, branch: hourBranch };
}

export function getTenGod(dayStem, otherStem) {
    if (dayStem === otherStem) return '比肩';
    const dayEl = STEM_TO_ELEMENT[dayStem];
    const otherEl = STEM_TO_ELEMENT[otherStem];
    const samePolarity = (dayStem % 2) === (otherStem % 2);

    if (dayEl === otherEl) return samePolarity ? '比肩' : '劫财';
    if (SHENG[dayEl] === otherEl) return samePolarity ? '食神' : '伤官';
    if (SHENG_BY[dayEl] === otherEl) return samePolarity ? '偏印' : '正印';
    if (KE[dayEl] === otherEl) return samePolarity ? '偏财' : '正财';
    if (KE_BY[dayEl] === otherEl) return samePolarity ? '七杀' : '正官';
    return '未知';
}

export function getTenGodCategory(tenGod) {
    const map = {
        '比肩': 'companion', '劫财': 'rob',
        '食神': 'eating',    '伤官': 'hurting',
        '偏财': 'indirect_wealth', '正财': 'direct_wealth',
        '七杀': 'seven_kill',     '正官': 'direct_officer',
        '偏印': 'indirect_seal',  '正印': 'direct_seal',
    };
    return map[tenGod] || 'unknown';
}

function analyzeWuXing(pillars) {
    const counts = [0, 0, 0, 0, 0];
    for (const p of pillars) {
        counts[STEM_TO_ELEMENT[p.stem]] += 1.0;
        counts[BRANCH_TO_ELEMENT[p.branch]] += 0.7;
        const hidden = BRANCH_HIDDEN_STEMS[p.branch];
        hidden.forEach((s, i) => {
            counts[STEM_TO_ELEMENT[s]] += HIDDEN_STEM_WEIGHTS[i] * 0.5;
        });
    }

    let dominant = 0, weak = 0;
    for (let i = 1; i < 5; i++) {
        if (counts[i] > counts[dominant]) dominant = i;
        if (counts[i] < counts[weak]) weak = i;
    }

    return {
        counts: counts.map(c => Math.round(c * 100) / 100),
        dominant,
        weak,
        names: WU_XING_NAMES,
    };
}

function analyzeDayMaster(dayStem, pillars) {
    const dayElement = STEM_TO_ELEMENT[dayStem];
    const producesMe = SHENG_BY[dayElement];
    const sameAsMe = dayElement;

    let supportPower = 0;
    let drainPower = 0;

    for (const p of pillars) {
        const stemEl = STEM_TO_ELEMENT[p.stem];
        const branchEl = BRANCH_TO_ELEMENT[p.branch];

        for (const el of [stemEl, branchEl]) {
            if (el === sameAsMe || el === producesMe) supportPower += 1;
            else drainPower += 1;
        }
    }

    const isStrong = supportPower >= drainPower;

    let xiYong, jiYong, jiShen;
    if (isStrong) {
        xiYong = KE_BY[dayElement];
        jiYong = SHENG[dayElement];
        jiShen = dayElement;
    } else {
        xiYong = SHENG_BY[dayElement];
        jiYong = dayElement;
        jiShen = KE_BY[dayElement];
    }

    return {
        element: dayElement,
        elementName: WU_XING_NAMES[dayElement],
        isStrong,
        strengthLabel: isStrong ? '身强' : '身弱',
        xiYong: { index: xiYong, name: WU_XING_NAMES[xiYong] },
        jiYong: { index: jiYong, name: WU_XING_NAMES[jiYong] },
        jiShen: { index: jiShen, name: WU_XING_NAMES[jiShen] },
    };
}

const NA_YIN_TABLE = [
    '海中金', '海中金', '炉中火', '炉中火', '大林木', '大林木',
    '路旁土', '路旁土', '剑锋金', '剑锋金', '山头火', '山头火',
    '涧下水', '涧下水', '城头土', '城头土', '白蜡金', '白蜡金',
    '杨柳木', '杨柳木', '泉中水', '泉中水', '屋上土', '屋上土',
    '霹雳火', '霹雳火', '松柏木', '松柏木', '长流水', '长流水',
    '砂石金', '砂石金', '山下火', '山下火', '平地木', '平地木',
    '壁上土', '壁上土', '金箔金', '金箔金', '覆灯火', '覆灯火',
    '天河水', '天河水', '大驿土', '大驿土', '钗环金', '钗环金',
    '桑柘木', '桑柘木', '大溪水', '大溪水', '沙中土', '沙中土',
    '天上火', '天上火', '石榴木', '石榴木', '大海水', '大海水',
];

function getNaYin(stem, branch) {
    for (let i = 0; i < 60; i++) {
        if (i % 10 === stem && i % 12 === branch) return NA_YIN_TABLE[i];
    }
    return '';
}

export const SHENG_XIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

// ============================================================
//  大运计算算法 (Da Yun)
// ============================================================
const JIE_DATES = [5, 4, 5, 4, 5, 5, 7, 7, 7, 8, 7, 7];

function getJieDate(year, month) {
    let day = JIE_DATES[month - 1];
    if (month >= 3 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
        day -= 1;
    }
    return new Date(year, month - 1, day);
}

function calculateDaYun(year, month, day, yearStem, monthStem, monthBranch, gender) {
    const isYangYear = yearStem % 2 === 0;
    const isMale = gender === 'male';
    const isForward = (isYangYear && isMale) || (!isYangYear && !isMale);

    const birthDate = new Date(year, month - 1, day);
    
    let currentJie = getJieDate(year, month);
    let prevJie, nextJie;

    if (birthDate >= currentJie) {
        prevJie = currentJie;
        let nextMonth = month + 1;
        let nextYear = year;
        if (nextMonth > 12) { nextMonth = 1; nextYear++; }
        nextJie = getJieDate(nextYear, nextMonth);
    } else {
        nextJie = currentJie;
        let prevMonth = month - 1;
        let prevYear = year;
        if (prevMonth < 1) { prevMonth = 12; prevYear--; }
        prevJie = getJieDate(prevYear, prevMonth);
    }

    let diffDays = 0;
    if (isForward) {
        diffDays = (nextJie - birthDate) / (1000 * 60 * 60 * 24);
    } else {
        diffDays = (birthDate - prevJie) / (1000 * 60 * 60 * 24);
    }
    if (diffDays < 0) diffDays = 0;

    const startAge = Math.max(1, Math.round(diffDays / 3)); 
    const startYear = year + startAge;

    const daYun = [];
    let curStem = monthStem;
    let curBranch = monthBranch;

    for (let i = 0; i < 8; i++) {
        if (isForward) {
            curStem = (curStem + 1) % 10;
            curBranch = (curBranch + 1) % 12;
        } else {
            curStem = (curStem + 9) % 10;
            curBranch = (curBranch + 11) % 12;
        }
        
        const ageStart = startAge + i * 10;
        const yearStart = startYear + i * 10;
        const yearEnd = yearStart + 9;

        daYun.push({
            index: i,
            stem: curStem,
            branch: curBranch,
            ganZhi: TIAN_GAN[curStem] + DI_ZHI[curBranch],
            ageStart,
            yearStart,
            yearEnd
        });
    }

    return {
        isForward,
        startAge,
        startYear,
        pillars: daYun
    };
}

function calculateShenSha(dayStem, dayBranch, yearBranch) {
    const shenSha = {};
    DI_ZHI.forEach(zhi => { shenSha[zhi] = new Set(); });

    // 天乙贵人
    const tianYiMap = {
        0: ['丑', '未'], 4: ['丑', '未'],
        1: ['子', '申'], 5: ['子', '申'],
        2: ['亥', '酉'], 3: ['亥', '酉'],
        6: ['寅', '午'], 7: ['寅', '午'],
        8: ['卯', '巳'], 9: ['卯', '巳'],
    };
    (tianYiMap[dayStem] || []).forEach(z => shenSha[z].add('天乙贵人'));

    // 桃花与驿马
    const taoHuaGroups = [[8,0,4], [11,3,7], [2,6,10], [5,9,1]];
    const taoHuaStars  = [9, 0, 3, 6];  // 酉子卯午
    const yiMaStars    = [2, 5, 8, 11]; // 寅巳申亥
    for (let i = 0; i < 4; i++) {
        const group = taoHuaGroups[i];
        const matchDay  = group.includes(dayBranch);
        const matchYear = group.includes(yearBranch);
        if (matchDay || matchYear) {
            shenSha[DI_ZHI[taoHuaStars[i]]].add('桃花');
            shenSha[DI_ZHI[yiMaStars[i]]].add('驿马');
        }
    }

    // 文昌贵人
    const wenChangMap = { 0:'巳', 1:'午', 2:'申', 3:'酉', 4:'申', 5:'酉', 6:'亥', 7:'子', 8:'寅', 9:'卯' };
    shenSha[wenChangMap[dayStem]].add('文昌贵人');

    // 将 Set 转换为数组
    const result = {};
    for (const zhi of DI_ZHI) {
        result[zhi] = [...shenSha[zhi]];
    }
    return result;
}

/**
 * 主入口：排盘（支持真太阳时经度校正）
 */
export function calculateBaZi(year, month, day, hour, minute, longitude = 120.0, gender = 'male') {
    const trueSolar = calculateTrueSolarTime(year, month, day, hour, minute, longitude);

    const yearPillar = getYearPillar(trueSolar.adjustedYear, trueSolar.adjustedMonth, trueSolar.adjustedDay);
    const monthPillar = getMonthPillar(trueSolar.adjustedYear, trueSolar.adjustedMonth, trueSolar.adjustedDay, yearPillar.stem);
    const dayPillar = getDayPillar(trueSolar.adjustedYear, trueSolar.adjustedMonth, trueSolar.adjustedDay);
    const hourPillar = getHourPillar(trueSolar.hourBranch, dayPillar.stem);

    const makePillarData = (pillar, label) => ({
        label,
        stem: pillar.stem,
        branch: pillar.branch,
        stemChar: TIAN_GAN[pillar.stem],
        branchChar: DI_ZHI[pillar.branch],
        ganZhi: TIAN_GAN[pillar.stem] + DI_ZHI[pillar.branch],
        stemElement: WU_XING_NAMES[STEM_TO_ELEMENT[pillar.stem]],
        branchElement: WU_XING_NAMES[BRANCH_TO_ELEMENT[pillar.branch]],
        naYin: getNaYin(pillar.stem, pillar.branch),
        hiddenStems: BRANCH_HIDDEN_STEMS[pillar.branch].map(s => ({
            stem: s,
            char: TIAN_GAN[s],
            element: WU_XING_NAMES[STEM_TO_ELEMENT[s]],
        })),
    });

    const pillarsArray = [yearPillar, monthPillar, dayPillar, hourPillar];

    const fourPillars = {
        year: makePillarData(yearPillar, '年柱'),
        month: makePillarData(monthPillar, '月柱'),
        day: makePillarData(dayPillar, '日柱'),
        hour: makePillarData(hourPillar, '时柱'),
    };

    const dayStem = dayPillar.stem;
    const dayMaster = {
        stem: dayStem,
        char: TIAN_GAN[dayStem],
        element: WU_XING_NAMES[STEM_TO_ELEMENT[dayStem]],
        yinYang: isYang(dayStem) ? '阳' : '阴',
    };

    const tenGods = {
        year: getTenGod(dayStem, yearPillar.stem),
        month: getTenGod(dayStem, monthPillar.stem),
        hour: getTenGod(dayStem, hourPillar.stem),
    };

    const wuXing = analyzeWuXing(pillarsArray);
    const dayMasterAnalysis = analyzeDayMaster(dayStem, pillarsArray);
    const zodiac = SHENG_XIAO[yearPillar.branch];

    const monthlyTenGods = H2_2026_MONTHS.map(m => ({
        ...m,
        stemTenGod: getTenGod(dayStem, m.stem),
        branchTenGod: getTenGod(dayStem, BRANCH_HIDDEN_STEMS[m.branch][0]),
    }));

    const daYun = calculateDaYun(
        trueSolar.adjustedYear, trueSolar.adjustedMonth, trueSolar.adjustedDay,
        yearPillar.stem, monthPillar.stem, monthPillar.branch, gender
    );

    const keys = ['year', 'month', 'day', 'hour'];
    const shenShaMap = calculateShenSha(dayPillar.stem, dayPillar.branch, yearPillar.branch);
    keys.forEach(k => {
        fourPillars[k].shenSha = shenShaMap[fourPillars[k].branchChar] || [];
    });

    return {
        input: { year, month, day, hour, minute, longitude, gender },
        trueSolar,
        fourPillars,
        dayMaster,
        dayMasterAnalysis,
        tenGods,
        wuXing,
        zodiac,
        monthlyTenGods,
        daYun,
        shenShaMap,
    };
}
