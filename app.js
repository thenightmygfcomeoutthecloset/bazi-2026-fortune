/**
 * 命运星盘 — 统一应用控制器 (app.js)
 */

import { calculateBaZi } from './bazi-engine.js';
import { analyzeFortune } from './fortune-analyzer.js';
import { TAROT_SPREADS, generateCardSvg } from './tarot-data.js';
import { shuffleDeck, performReading } from './tarot-engine.js';

// 全局状态
let activeMode = 'portal';

// 塔罗状态
let tarotSpread = TAROT_SPREADS[0];
let tarotDeck = [];
let tarotSelectedIndexes = [];
let REGION_DATA = {};
let currentGeoLongitude = null; // Store fetched geolocation if any
let tarotStep = 'init';

// ============================================================
//  1. 页面模式与导航控制器
// ============================================================

export function switchMode(mode) {
    if (document.startViewTransition) {
        document.startViewTransition(() => performSwitchMode(mode));
    } else {
        performSwitchMode(mode);
    }
}

function performSwitchMode(mode) {
    activeMode = mode;

    const portalSection = document.getElementById('portalSection');
    const baziSection = document.getElementById('baziSection');
    const tarotSection = document.getElementById('tarotSection');

    const navBtns = {
        portal: document.getElementById('navHomeBtn'),
        bazi: document.getElementById('navBaziBtn'),
        tarot: document.getElementById('navTarotBtn'),
    };

    Object.keys(navBtns).forEach(k => {
        if (navBtns[k]) {
            if (k === mode) navBtns[k].classList.add('active');
            else navBtns[k].classList.remove('active');
        }
    });

    if (portalSection) portalSection.classList.add('hidden');
    if (baziSection) baziSection.classList.add('hidden');
    if (tarotSection) tarotSection.classList.add('hidden');

    if (mode === 'portal' && portalSection) {
        portalSection.classList.remove('hidden');
    } else if (mode === 'bazi' && baziSection) {
        baziSection.classList.remove('hidden');
    } else if (mode === 'tarot' && tarotSection) {
        tarotSection.classList.remove('hidden');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 暴露出 switchMode 给全局全局调用
window.switchMode = switchMode;

function initNavigation() {
    // 导航按鈕由 JS 统一管理， HTML onclick 仅作备用调用，不会冲突
    // 这里只绑定纯导航元素，首页卡片由 HTML inline onclick 处理
    const bindNav = (id, mode) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', (e) => { e.stopPropagation(); switchMode(mode); });
    };
    bindNav('navLogo', 'portal');
    bindNav('navHomeBtn', 'portal');
    bindNav('navBaziBtn', 'bazi');
    bindNav('navTarotBtn', 'tarot');
}

// ============================================================
//  2. 八字模块 (含出生城市与真太阳时计算)
// ============================================================

export function resetBaziForm() {
    document.getElementById('baziFormCard').classList.remove('hidden');
    document.getElementById('baziResultSection').classList.add('hidden');
}
window.resetBaziForm = resetBaziForm;

function initBaziForm() {
    const yearSelect = document.getElementById('birthYear');
    const monthSelect = document.getElementById('birthMonth');
    const daySelect = document.getElementById('birthDay');
    const hourSelect = document.getElementById('birthHour');
    const minuteSelect = document.getElementById('birthMinute');

    if (!yearSelect) return;

    // 年
    for (let y = 2026; y >= 1940; y--) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = `${y}年`;
        if (y === 1995) opt.selected = true;
        yearSelect.appendChild(opt);
    }

    // 月
    for (let m = 1; m <= 12; m++) {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = `${m}月`;
        monthSelect.appendChild(opt);
    }

    // 日
    function updateDays() {
        const y = parseInt(yearSelect.value);
        const m = parseInt(monthSelect.value);
        const daysInMonth = new Date(y, m, 0).getDate();
        const curDay = parseInt(daySelect.value) || 1;

        daySelect.innerHTML = '';
        for (let d = 1; d <= daysInMonth; d++) {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = `${d}日`;
            if (d === Math.min(curDay, daysInMonth)) opt.selected = true;
            daySelect.appendChild(opt);
        }
    }
    yearSelect.addEventListener('change', updateDays);
    monthSelect.addEventListener('change', updateDays);
    updateDays();

    // 小时
    const unknownOpt = document.createElement('option');
    unknownOpt.value = -1;
    unknownOpt.textContent = `🤷 我不记得了 (默认吉时)`;
    hourSelect.appendChild(unknownOpt);

    for (let h = 0; h < 24; h++) {
        const opt = document.createElement('option');
        opt.value = h;
        opt.textContent = `${String(h).padStart(2, '0')} 点 (${h}时)`;
        if (h === 12) opt.selected = true;
        hourSelect.appendChild(opt);
    }

    // 地区三级联动
    const provinceSelect = document.getElementById('birthProvince');
    const citySelect = document.getElementById('birthCity');
    const districtSelect = document.getElementById('birthDistrict');
    
    if (provinceSelect && citySelect && districtSelect) {
        // 填充省份
        Object.keys(REGION_DATA).forEach(prov => {
            const opt = document.createElement('option');
            opt.value = prov;
            opt.textContent = prov;
            if (prov === '北京') opt.selected = true;
            provinceSelect.appendChild(opt);
        });

        // 更新城市
        function updateCities() {
            const prov = provinceSelect.value;
            
            const cityGroup = document.getElementById('cityGroup');
            const districtGroup = document.getElementById('districtGroup');
            const customLngGroup = document.getElementById('customLongitudeGroup');
            const customLngInput = document.getElementById('customLongitude');
            
            if (prov === '海外 / 自定义') {
                if (cityGroup) cityGroup.style.display = 'none';
                if (districtGroup) districtGroup.style.display = 'none';
                if (customLngGroup) customLngGroup.style.display = 'block';
                if (customLngInput) customLngInput.required = true;
            } else {
                if (cityGroup) cityGroup.style.display = 'block';
                if (districtGroup) districtGroup.style.display = 'block';
                if (customLngGroup) customLngGroup.style.display = 'none';
                if (customLngInput) customLngInput.required = false;
            }

            citySelect.innerHTML = '';
            if (REGION_DATA[prov]) {
                Object.keys(REGION_DATA[prov]).forEach((city, index) => {
                    const opt = document.createElement('option');
                    opt.value = city;
                    opt.textContent = city;
                    if (index === 0) opt.selected = true; // 默认选第一个城市
                    citySelect.appendChild(opt);
                });
            }
            updateDistricts();
        }

        // 更新区县
        function updateDistricts() {
            const prov = provinceSelect.value;
            const city = citySelect.value;
            districtSelect.innerHTML = '';
            if (REGION_DATA[prov] && REGION_DATA[prov][city]) {
                Object.entries(REGION_DATA[prov][city]).forEach(([dist, lng], index) => {
                    const opt = document.createElement('option');
                    opt.value = lng;
                    opt.textContent = dist;
                    if (index === 0) opt.selected = true;
                    districtSelect.appendChild(opt);
                });
            }
        }

        provinceSelect.addEventListener('change', updateCities);
        citySelect.addEventListener('change', updateDistricts);

        // 初始填充
        updateCities();
    }

    // 性别
    const gMale = document.getElementById('genderMale');
    const gFemale = document.getElementById('genderFemale');
    if (gMale && gFemale) {
        gMale.addEventListener('click', () => { gMale.classList.add('active'); gFemale.classList.remove('active'); });
        gFemale.addEventListener('click', () => { gFemale.classList.add('active'); gMale.classList.remove('active'); });
    }

    // 表单提交
    document.getElementById('baziForm').addEventListener('submit', handleBaziSubmit);

    // 测算侧重点卡片点击逻辑
    const focusGrid = document.getElementById('baziFocusGrid');
    const focusInput = document.getElementById('baziFocusArea');
    if (focusGrid && focusInput) {
        focusGrid.querySelectorAll('.spread-card').forEach(card => {
            card.addEventListener('click', () => {
                focusGrid.querySelectorAll('.spread-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                focusInput.value = card.dataset.focus;
            });
        });
    }
}

function handleBaziSubmit(e) {
    e.preventDefault();

    const year = parseInt(document.getElementById('birthYear').value);
    const month = parseInt(document.getElementById('birthMonth').value);
    const day = parseInt(document.getElementById('birthDay').value);
    
    let hour = parseInt(document.getElementById('birthHour').value);
    let minute = parseInt(document.getElementById('birthMinute').value);
    
    // 处理我不记得了 / 默认填 0 的情况
    if (isNaN(minute)) minute = 0;
    if (hour === -1) {
        hour = 12; // 默认吉时 午时
        minute = 0;
    }
    const province = document.getElementById('birthProvince').value;
    
    let longitude;
    if (province === '海外 / 自定义') {
        longitude = parseFloat(document.getElementById('customLongitude').value);
    } else {
        longitude = parseFloat(document.getElementById('birthDistrict').value);
    }
    
    const genderEl = document.querySelector('input[name="gender"]:checked');
    const gender = genderEl ? genderEl.value : 'male';
    const focusArea = document.getElementById('baziFocusArea') ? document.getElementById('baziFocusArea').value : 'overall';

    showLoading('紫微真太阳时推演中…');

    setTimeout(() => {
        try {
            const bazi = calculateBaZi(year, month, day, hour, minute, longitude, gender);
            let fortune = analyzeFortune(bazi, focusArea);
            
            const updateDOM = () => {
                renderBaziResults(bazi, fortune, focusArea);
                hideLoading();
                document.getElementById('baziFormCard').classList.add('hidden');
                document.getElementById('baziResultSection').classList.remove('hidden');
            };

            if (document.startViewTransition) {
                document.startViewTransition(updateDOM);
            } else {
                updateDOM();
            }
        } catch (err) {
            hideLoading();
            console.error('[BaZi] 排盘错误:', err);
            alert('排盘计算出现异常，请检查输入信息后重试。\n错误信息：' + err.message);
        }
    }, 1200);
}

function renderBaziResults(bazi, fortune, focusArea = 'overall') {
    const banner = document.getElementById('solarTimeBanner');
    const ts = bazi.trueSolar;
    const offsetStr = ts.offsetMinutes >= 0 ? `+${ts.offsetMinutes}` : `${ts.offsetMinutes}`;
    
    banner.innerHTML = `
        <strong>🌍 真太阳时校正结果：</strong><br>
        • 输入北京时间：<code>${ts.originalTime}</code><br>
        • 经度校正 (经度 ${ts.longitude}°E)：经度时差约 <code>${offsetStr} 分钟</code><br>
        • 校正后真太阳时：<code>${ts.adjustedTime}</code>（以真太阳时判定时柱与日柱）
    `;

    const pillarsContainer = document.getElementById('fourPillars');
    pillarsContainer.innerHTML = '';
    const keys = ['year', 'month', 'day', 'hour'];
    const labels = ['年柱', '月柱', '日柱', '时柱'];

    keys.forEach((k, idx) => {
        const p = bazi.fourPillars[k];
        const card = document.createElement('div');
        card.className = 'pillar-card';
        card.innerHTML = `
            <div class="pillar-label">${labels[idx]}</div>
            <div class="pillar-stem">${p.stemChar}</div>
            <div class="pillar-branch">${p.branchChar}</div>
            <div class="pillar-element">${p.stemElement} / ${p.branchElement}</div>
            <div class="pillar-nayin">${p.naYin}</div>
            <div class="pillar-ten-god">${k === 'day' ? '日主' : (bazi.tenGods[k] || '')}</div>
            <div class="pillar-shensha" style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px; justify-content: center;">
                ${(p.shenSha || []).map(s => `<span style="font-size:0.65rem; padding: 2px 6px; background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3); border-radius: 4px; color: #a78bfa;">${s}</span>`).join('')}
            </div>
        `;
        pillarsContainer.appendChild(card);
    });

    const dm = fortune.dayMasterDesc;
    document.getElementById('dayMasterCard').innerHTML = `
        <h3 style="color: var(--gold-light); font-family: var(--font-serif); margin-bottom: 8px;">
            日主：${bazi.dayMaster.char} (${dm.title} · ${bazi.dayMaster.yinYang}${bazi.dayMaster.element})
        </h3>
        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.8; margin-bottom: 12px;">${dm.description}</p>
        <div style="font-size: 0.85rem; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid var(--gold);">
            【${dm.strength}】 ${dm.strengthDesc}
        </div>
    `;

    const wx = bazi.wuXing;
    const maxCount = Math.max(...wx.counts, 1);
    const wuXingColors = ['#f59e0b', '#4ade80', '#60a5fa', '#f87171', '#fbbf24']; // 金木水火土 (近似色)
    
    let wxHtml = '<div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">';
    wx.names.forEach((name, i) => {
        const count = wx.counts[i];
        const pct = (count / maxCount) * 100;
        wxHtml += `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; font-weight: bold; color: var(--gold-light); text-align: right;">${name}</div>
            <div style="flex: 1; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden;">
                <div style="width: ${pct}%; height: 100%; background: ${wuXingColors[i]}; border-radius: 4px; transition: width 1s ease-out;"></div>
            </div>
            <div style="width: 40px; font-size: 0.85rem; color: var(--text-secondary); text-align: left;">${count}</div>
        </div>`;
    });
    wxHtml += '</div>';
    wxHtml += `<div style="font-size:0.88rem; color:var(--gold-light); text-align:center;">
        喜神：<b>${bazi.dayMasterAnalysis.xiYong.name}</b> | 用神：<b>${bazi.dayMasterAnalysis.jiYong.name}</b> | 忌神：<b>${bazi.dayMasterAnalysis.jiShen.name}</b>
    </div>`;
    document.getElementById('wuXingCard').innerHTML = wxHtml;

    const lucky = fortune.luckyInfo;
    document.getElementById('luckyCard').innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; text-align: center;">
            <div><div style="font-size:0.75rem; color:var(--text-muted);">幸运色</div><div style="color:var(--gold-light); font-weight:bold;">${lucky.colors.join('、')}</div></div>
            <div><div style="font-size:0.75rem; color:var(--text-muted);">开运方位</div><div style="color:var(--gold-light); font-weight:bold;">${lucky.direction}</div></div>
            <div><div style="font-size:0.75rem; color:var(--text-muted);">幸运数</div><div style="color:var(--gold-light); font-weight:bold;">${lucky.numbers.join('、')}</div></div>
            <div><div style="font-size:0.75rem; color:var(--text-muted);">饮食建议</div><div style="color:var(--gold-light); font-weight:bold;">${lucky.foods.join('、')}</div></div>
        </div>
    `;

    // 渲染大运流年
    if (fortune.currentDaYun) {
        document.getElementById('daYunCard').innerHTML = `
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(212,175,55,0.3); border-radius:12px; padding:16px;">
                <p style="font-size:0.95rem; line-height:1.6; color:var(--text-secondary); margin:0;">
                    ${fortune.currentDaYun.desc.replace(/\n/g, '<br/>')}
                </p>
            </div>
        `;
    }

    if (bazi.daYun && bazi.daYun.pillars) {
        document.getElementById('daYunTimeline').innerHTML = bazi.daYun.pillars.map(p => {
            const isCurrent = fortune.currentDaYun && fortune.currentDaYun.index === p.index;
            return `
                <div style="
                    min-width: 80px; 
                    padding: 12px 8px; 
                    text-align: center; 
                    border-radius: 8px; 
                    background: ${isCurrent ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)'};
                    border: 1px solid ${isCurrent ? 'var(--gold)' : 'rgba(255,255,255,0.1)'};
                    transition: all 0.3s;
                ">
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:4px;">${p.ageStart}岁起运</div>
                    <div style="font-family:var(--font-serif); font-size:1.1rem; color:var(--gold-light); font-weight:bold; margin-bottom:4px;">
                        ${p.ganZhi}
                    </div>
                    <div style="font-size:0.7rem; color:var(--text-secondary);">${p.yearStart}-${p.yearEnd}</div>
                </div>
            `;
        }).join('');
    }

    document.getElementById('monthCards').innerHTML = fortune.months.map(m => `
        <div style="background:var(--bg-card); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:20px; margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <div style="font-family:var(--font-serif); font-size:1.1rem; color:var(--gold-light);">
                    ${m.theme.icon} ${m.monthName} (${m.ganZhi}月 · ${m.gregorian})
                </div>
                <div style="font-family:var(--font-serif); font-size:1.4rem; color:var(--gold); font-weight:bold;">
                    ${m.focusScore} 分
                </div>
            </div>
            <div style="font-size:0.9rem; color:var(--text-secondary); line-height:1.7;">${m.focusText}</div>
        </div>
    `).join('');

    // 绘制趋势柱状图
    const trendChartContainer = document.querySelector('.trend-chart-container');
    if (trendChartContainer) {
        trendChartContainer.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-end; height:150px; padding:20px 10px; background:rgba(255,255,255,0.02); border-radius:12px;">
                ${fortune.months.map(m => `
                    <div style="display:flex; flex-direction:column; align-items:center; width:12%;">
                        <div style="font-size:0.75rem; color:var(--gold); margin-bottom:4px;">${m.focusScore}</div>
                        <div style="width:100%; max-width:24px; background:linear-gradient(to top, var(--gold-dark), var(--gold-light)); border-radius:4px 4px 0 0; height:${m.focusScore}px; transition:height 1s ease;"></div>
                        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:8px;">${m.monthName}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    document.getElementById('trendSummary').innerHTML = `
        <div style="text-align:center; padding:16px; background:rgba(255,255,255,0.03); border-radius:12px;">
            <div style="font-size:0.75rem; color:var(--text-muted);">整体走向</div>
            <div style="color:var(--gold-light); font-weight:bold; font-size:1.1rem;">${fortune.overall.trendLabel}</div>
        </div>
        <div style="text-align:center; padding:16px; background:rgba(255,255,255,0.03); border-radius:12px;">
            <div style="font-size:0.75rem; color:var(--text-muted);">最佳月份</div>
            <div style="color:var(--gold-light); font-weight:bold; font-size:1.1rem;">${fortune.overall.bestMonth.name} (${fortune.overall.bestMonth.score}分)</div>
        </div>
    `;
}

// ============================================================
//  3. 塔罗牌模块
// ============================================================

function initTarot() {
    const grid = document.getElementById('spreadGrid');
    if (!grid) return;

    grid.innerHTML = TAROT_SPREADS.map((s, idx) => `
        <div class="spread-card ${idx === 0 ? 'active' : ''}" data-id="${s.id}">
            <div class="spread-name">${s.name}</div>
            <div class="spread-desc">${s.description}</div>
        </div>
    `).join('');

    grid.querySelectorAll('.spread-card').forEach(card => {
        card.addEventListener('click', () => {
            grid.querySelectorAll('.spread-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            tarotSpread = TAROT_SPREADS.find(s => s.id === card.dataset.id);
            resetTarotStage();
        });
    });

    tarotSpread = TAROT_SPREADS[0]; // 默认选中第一个牌阵
    resetTarotStage();
    const actionBtn = document.getElementById('tarotActionBtn');
    const resetBtn = document.getElementById('tarotResetBtn');

    if (actionBtn) actionBtn.addEventListener('click', handleTarotShuffle);
    if (resetBtn) resetBtn.addEventListener('click', () => {
        document.getElementById('readingStage').style.display = 'block';
        resetTarotStage();
    });
}

function resetTarotStage() {
    tarotStep = 'init';
    tarotSelectedIndexes = [];
    document.getElementById('stageStatus').textContent = '点击下方按钮开启洗牌仪式';
    const actionBtn = document.getElementById('tarotActionBtn');
    if (actionBtn) {
        actionBtn.textContent = '开 始 洗 牌';
        actionBtn.style.display = 'inline-block';
    }
    document.getElementById('tarotResultsSection').classList.add('hidden');

    const container = document.getElementById('deckContainer');
    if (!container) return;
    container.innerHTML = '';
    container.className = 'deck-container';
    // 初始状态：展示一叠牌
    for (let i = 0; i < 6; i++) {
        const c = document.createElement('div');
        c.className = 'tarot-card-3d';
        c.style.transform = `translate(${i * 2}px, ${-i * 2}px)`;
        c.innerHTML = `<div class="card-face card-back"><div class="card-back-symbol">✦</div></div>`;
        container.appendChild(c);
    }
}

function handleTarotShuffle() {
    playTarotSound('shuffle');
    const allowReversed = document.getElementById('allowReversed') ? document.getElementById('allowReversed').checked : true;
    tarotDeck = shuffleDeck(78, allowReversed);
    document.getElementById('stageStatus').textContent = '正在洗牌与凝聚能量…';

    const container = document.getElementById('deckContainer');
    // 切换为全牌网格模式
    container.className = 'deck-container deck-grid';
    container.innerHTML = '';

    const actionBtn = document.getElementById('tarotActionBtn');
    if (actionBtn) actionBtn.style.display = 'none';

    // 洗牌动画延迟后铺开全部78张
    setTimeout(() => {
        tarotDeck.forEach((card, i) => {
            const c = document.createElement('div');
            c.className = 'tarot-card-mini';
            c.innerHTML = `<div class="card-back-symbol">✦</div>`;
            c.addEventListener('click', () => onTarotPick(i, c));
            // 轻微随机旋转，增加仪式感
            const rot = (Math.random() - 0.5) * 6;
            c.style.transform = `rotate(${rot}deg)`;
            container.appendChild(c);

            // 入场动画（分批淡入）
            c.style.opacity = '0';
            setTimeout(() => { c.style.opacity = '1'; }, i * 8);
        });

        tarotStep = 'picking';
        document.getElementById('stageStatus').textContent = `凭直觉从 78 张牌中选择 ${tarotSpread.cardsCount} 张 (0/${tarotSpread.cardsCount})`;
    }, 800);
}

function onTarotPick(idx, el) {
    if (tarotStep !== 'picking' || tarotSelectedIndexes.includes(idx)) return;

    playTarotSound('flip');
    tarotSelectedIndexes.push(idx);
    el.classList.add('selected');
    document.getElementById('stageStatus').textContent = `已选择 ${tarotSelectedIndexes.length}/${tarotSpread.cardsCount} 张 · ${tarotSpread.cardsCount - tarotSelectedIndexes.length > 0 ? '继续凭直觉选牌' : '解读中…'}`;

    if (tarotSelectedIndexes.length === tarotSpread.cardsCount) {
        tarotStep = 'done';
        setTimeout(displayTarotResults, 600);
    }
}

function displayTarotResults() {
    const reading = performReading(tarotSpread.id, tarotSelectedIndexes, tarotDeck);

    const updateDOM = () => {
        document.getElementById('readingStage').style.display = 'none';
        const resSec = document.getElementById('tarotResultsSection');
        resSec.classList.remove('hidden');

        const cardsGrid = document.getElementById('tarotCardsGrid');
        cardsGrid.className = 'result-cards-grid';
        if (reading.spread.id === 'celtic_cross') {
            cardsGrid.classList.add('celtic-cross-layout');
        }

        cardsGrid.innerHTML = reading.drawnCards.map((c, i) => `
            <div class="result-card-item">
                <div style="font-size:0.8rem; color:var(--gold-light); margin-bottom:8px;">${c.positionLabel}</div>
                <div class="tarot-card-3d" id="tarotResCard-${i}" style="position:relative; margin:0 auto 12px;">
                    <div class="card-face card-back"><div class="card-back-symbol">☯</div></div>
                    <div class="card-face card-front">${generateCardSvg(c, c.isReversed)}</div>
                </div>
                <div style="font-weight:bold; color:var(--gold-light); font-size:0.9rem;">${c.name} (${c.orientationLabel})</div>
            </div>
        `).join('');

        document.getElementById('tarotReport').innerHTML = `
            <h3 style="color:var(--gold-light); font-family:var(--font-serif); text-align:center; margin-bottom:20px;">
                ${reading.spread.name} · 命运启示录
            </h3>
            ${reading.drawnCards.map(c => `
                <div style="background:rgba(255,255,255,0.03); border-radius:12px; padding:16px; margin-bottom:12px;">
                    <div style="font-weight:bold; color:var(--gold-light);">${c.positionLabel} ── 【${c.name}】 ${c.orientationLabel}位</div>
                    <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:6px;">${c.meaningDesc}</div>
                </div>
            `).join('')}
            <div style="margin-top:20px; padding:16px; background:rgba(212,168,83,0.1); border-radius:12px; border-left:3px solid var(--gold);">
                <strong>🌟 综合命运指引：</strong> ${reading.overallAdvice}
            </div>
        `;
    };

    if (document.startViewTransition) {
        document.startViewTransition(updateDOM).finished.then(triggerFlips);
    } else {
        updateDOM();
        triggerFlips();
    }

    function triggerFlips() {
        reading.drawnCards.forEach((c, i) => {
            setTimeout(() => {
                const cardEl = document.getElementById(`tarotResCard-${i}`);
                if (cardEl) {
                    cardEl.classList.add('flipped');
                    if (!c.isMinor) {
                        playTarotSound('reveal');
                    } else {
                        playTarotSound('flip');
                }
            }, (i + 1) * 350);
        });
    }
}

function showLoading(text) {
    const el = document.getElementById('loadingOverlay');
    if (el) {
        document.getElementById('loadingText').textContent = text;
        el.classList.add('active');
    }
}

function hideLoading() {
    const el = document.getElementById('loadingOverlay');
    if (el) el.classList.remove('active');
}

function initCanvas() {
    const canvas = document.getElementById('appCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    });

    const particles = Array.from({ length: 100 }, () => ({
        x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.5, a: Math.random()
    }));

    function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            ctx.fillStyle = `rgba(212, 168, 83, ${p.a})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// ============================================================
//  Web Audio 音效合成
// ============================================================
let audioCtx;
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playTarotSound(type) {
    if (!audioCtx) initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'shuffle') {
        // 白噪声沙沙声模拟洗牌
        const bufferSize = audioCtx.sampleRate * 0.5;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 1000;
        noise.connect(noiseFilter);
        noiseFilter.connect(gain);
        
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
        noise.start(t);
        noise.stop(t + 0.5);
        return;
    } else if (type === 'flip') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
    } else if (type === 'reveal') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(440, t + 0.5);
        const osc2 = audioCtx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(222, t);
        osc2.frequency.exponentialRampToValueAtTime(444, t + 0.5);
        osc2.connect(gain);
        osc2.start(t);
        osc2.stop(t + 1);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 1);
        osc.start(t);
        osc.stop(t + 1);
    }
}
// 初始化执行 (异步加载地区数据)
fetch('region-data.json')
    .then(r => r.json())
    .then(data => {
        REGION_DATA = data;
        document.addEventListener('click', () => initAudio(), { once: true });
        initCanvas();
        initNavigation();
        initBaziForm();
        initTarot();
    })
    .catch(err => {
        console.error("Failed to load region data:", err);
        alert("全国地区数据加载失败，请检查网络！");
    });
