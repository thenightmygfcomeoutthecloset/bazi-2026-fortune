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
export const REGION_DATA = {
    "北京": { "北京": { "东城区": 116.41, "西城区": 116.36, "朝阳区": 116.48, "海淀区": 116.29, "丰台区": 116.28, "石景山区": 116.22 } },
    "上海": { "上海": { "黄浦区": 121.49, "徐汇区": 121.43, "长宁区": 121.42, "静安区": 121.44, "普陀区": 121.39, "浦东新区": 121.52 } },
    "天津": { "天津": { "和平区": 117.19, "河东区": 117.22, "河西区": 117.22, "南开区": 117.15, "河北区": 117.19, "红桥区": 117.16 } },
    "重庆": { "重庆": { "渝中区": 106.56, "大渡口区": 106.48, "江北区": 106.57, "沙坪坝区": 106.45, "九龙坡区": 106.51, "南岸区": 106.56 } },
    "广东": { "广州": { "越秀区": 113.26, "天河区": 113.36, "海珠区": 113.31, "荔湾区": 113.24, "白云区": 113.27 }, "深圳": { "福田区": 114.05, "罗湖区": 114.13, "南山区": 113.93, "宝安区": 113.88, "龙岗区": 114.24 }, "东莞": { "莞城街道": 113.75, "长安镇": 113.80, "虎门镇": 113.67 } },
    "四川": { "成都": { "锦江区": 104.08, "青羊区": 104.06, "金牛区": 104.05, "武侯区": 104.04, "成华区": 104.10 }, "绵阳": { "涪城区": 104.73, "游仙区": 104.74 } },
    "浙江": { "杭州": { "上城区": 120.16, "拱墅区": 120.14, "西湖区": 120.13, "滨江区": 120.21, "萧山区": 120.26 }, "宁波": { "海曙区": 121.55, "江北区": 121.55, "鄞州区": 121.54 } },
    "江苏": { "南京": { "玄武区": 118.79, "秦淮区": 118.79, "建邺区": 118.73, "鼓楼区": 118.76, "浦口区": 118.62 }, "苏州": { "姑苏区": 120.61, "虎丘区": 120.57, "吴中区": 120.63, "相城区": 120.64, "吴江区": 120.64 } },
    "山东": { "济南": { "历下区": 117.07, "市中区": 116.99, "槐荫区": 116.90, "天桥区": 116.98, "历城区": 117.07 }, "青岛": { "市南区": 120.38, "市北区": 120.37, "黄岛区": 120.19, "崂山区": 120.46, "李沧区": 120.43 } },
    "福建": { "福州": { "鼓楼区": 119.29, "台江区": 119.30, "仓山区": 119.31, "马尾区": 119.45, "晋安区": 119.32 }, "厦门": { "思明区": 118.08, "海沧区": 118.03, "湖里区": 118.14, "集美区": 118.09, "同安区": 118.15 } },
    "湖北": { "武汉": { "江岸区": 114.30, "江汉区": 114.27, "硚口区": 114.26, "汉阳区": 114.27, "武昌区": 114.31, "洪山区": 114.34 }, "宜昌": { "西陵区": 111.28, "伍家岗区": 111.31 } },
    "湖南": { "长沙": { "芙蓉区": 113.03, "天心区": 112.98, "岳麓区": 112.93, "开福区": 112.98, "雨花区": 113.01 }, "株洲": { "天元区": 113.12, "芦淞区": 113.15 } },
    "河南": { "郑州": { "中原区": 113.61, "二七区": 113.63, "管城回族区": 113.68, "金水区": 113.66, "上街区": 113.30 }, "洛阳": { "老城区": 112.46, "西工区": 112.43 } },
    "河北": { "石家庄": { "长安区": 114.53, "桥西区": 114.46, "新华区": 114.46, "井陉矿区": 114.06, "裕华区": 114.53 }, "唐山": { "路南区": 118.17, "路北区": 118.19 } },
    "陕西": { "西安": { "新城区": 108.96, "碑林区": 108.93, "莲湖区": 108.94, "雁塔区": 108.94, "未央区": 108.94, "灞桥区": 109.06 }, "宝鸡": { "渭滨区": 107.14, "金台区": 107.15 } },
    "黑龙江": { "哈尔滨": { "道里区": 126.61, "南岗区": 126.66, "道外区": 126.64, "平房区": 126.63, "松北区": 126.56 }, "齐齐哈尔": { "龙沙区": 123.95, "建华区": 123.95 } },
    "吉林": { "长春": { "南关区": 125.35, "宽城区": 125.32, "朝阳区": 125.28, "二道区": 125.38, "绿园区": 125.25 }, "吉林": { "昌邑区": 126.57, "龙潭区": 126.56 } },
    "辽宁": { "沈阳": { "和平区": 123.41, "沈河区": 123.45, "大东区": 123.47, "皇姑区": 123.42, "铁西区": 123.37 }, "大连": { "中山区": 121.65, "西岗区": 121.61, "沙河口区": 121.58 } },
    "安徽": { "合肥": { "瑶海区": 117.31, "庐阳区": 117.26, "蜀山区": 117.26, "包河区": 117.30 }, "芜湖": { "镜湖区": 118.38, "弋江区": 118.37 } },
    "江西": { "南昌": { "东湖区": 115.89, "西湖区": 115.87, "青云谱区": 115.91, "青山湖区": 115.96 }, "赣州": { "章贡区": 114.94, "南康区": 114.76 } },
    "山西": { "太原": { "小店区": 112.56, "迎泽区": 112.56, "杏花岭区": 112.57, "尖草坪区": 112.54, "万柏林区": 112.51 }, "大同": { "平城区": 113.29, "云冈区": 113.16 } },
    "云南": { "昆明": { "五华区": 102.70, "盘龙区": 102.71, "官渡区": 102.74, "西山区": 102.66, "东川区": 103.18 }, "大理": { "大理市": 100.22, "漾濞县": 99.95 } },
    "贵州": { "贵阳": { "南明区": 106.71, "云岩区": 106.72, "花溪区": 106.67, "乌当区": 106.75, "白云区": 106.65 }, "遵义": { "红花岗区": 106.92, "汇川区": 106.93 } },
    "广西": { "南宁": { "兴宁区": 108.36, "青秀区": 108.34, "江南区": 108.27, "西乡塘区": 108.31, "良庆区": 108.31 }, "柳州": { "城中区": 109.41, "鱼峰区": 109.42 } },
    "海南": { "海口": { "秀英区": 110.29, "龙华区": 110.30, "琼山区": 110.35, "美兰区": 110.34 }, "三亚": { "海棠区": 109.73, "吉阳区": 109.51, "天涯区": 109.50 } },
    "甘肃": { "兰州": { "城关区": 103.82, "七里河区": 103.77, "西固区": 103.62, "安宁区": 103.71, "红古区": 102.86 }, "天水": { "秦州区": 105.72, "麦积区": 105.89 } },
    "宁夏": { "银川": { "兴庆区": 106.28, "西夏区": 106.14, "金凤区": 106.23 } },
    "青海": { "西宁": { "城东区": 101.80, "城中区": 101.77, "城西区": 101.76, "城北区": 101.76 } },
    "新疆": { "乌鲁木齐": { "天山区": 87.63, "沙依巴克区": 87.59, "新市区": 87.57, "水磨沟区": 87.64, "头屯河区": 87.40 }, "伊犁": { "伊宁市": 81.32 } },
    "西藏": { "拉萨": { "城关区": 91.13, "堆龙德庆区": 90.99, "达孜区": 91.36 } },
    "内蒙古": { "呼和浩特": { "新城区": 111.68, "回民区": 111.62, "玉泉区": 111.67, "赛罕区": 111.70 }, "包头": { "东河区": 110.04, "昆都仑区": 109.83 } },
    "香港": { "香港": { "中西区": 114.15, "湾仔区": 114.17, "东区": 114.22, "南区": 114.15, "油尖旺区": 114.17 } },
    "澳门": { "澳门": { "花地玛堂区": 113.55, "圣安多尼堂区": 113.54, "大堂区": 113.54, "望德堂区": 113.55, "风顺堂区": 113.53 } },
    "台湾": { "台北": { "中正区": 121.51, "大同区": 121.51, "中山区": 121.53, "松山区": 121.57, "大安区": 121.53 }, "高雄": { "盐埕区": 120.28, "鼓山区": 120.27 } }
};

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
