/**
 * dosha.js — расчёт конституции (5 стихий) из натальной карты
 *
 * Принцип: каждая планета (граха) находится в знаке зодиака,
 * каждый знак связан со стихией. Весовые коэффициенты:
 * Лагна/Солнце/Луна = 3, остальные грахи = 2, Раху/Кету → Эфир = 1.
 */

const SIGN_ELEMENTS = [
  'Огонь',  // Овен 0
  'Земля',  // Телец 1
  'Воздух', // Близнецы 2
  'Вода',   // Рак 3
  'Огонь',  // Лев 4
  'Земля',  // Дева 5
  'Воздух', // Весы 6
  'Вода',   // Скорпион 7
  'Огонь',  // Стрелец 8
  'Земля',  // Козерог 9
  'Воздух', // Водолей 10
  'Вода',   // Рыбы 11
];

const PLANET_WEIGHTS = {
  sun: 3,
  moon: 3,
  mars: 2,
  mercury: 2,
  jupiter: 2,
  venus: 2,
  saturn: 2,
  rahu: 1,
  ketu: 1
};

const ELEMENTS = ['Огонь', 'Земля', 'Воздух', 'Вода', 'Эфир'];

const ELEMENT_META = {
  'Огонь':  { icon: '🔥', color: '#ff6633', cssVar: '--fire' },
  'Земля':  { icon: '🌍', color: '#8b7355', cssVar: '--earth' },
  'Воздух': { icon: '💨', color: '#88bbff', cssVar: '--air' },
  'Вода':   { icon: '💧', color: '#4488cc', cssVar: '--water' },
  'Эфир':   { icon: '✦',  color: '#bb88ff', cssVar: '--ether' }
};

const ASC_WEIGHT = 3;

/**
 * Рассчитать конституцию из данных натальной карты.
 * @param {Object} chart — объект из calculateChart()
 *   { planets: [{id, sign, ...}], ascSign: number }
 * @returns {Object} { scores, percentages, dominant, elements: sorted array }
 */
export function calculateDosha(chart) {
  var scores = { 'Огонь': 0, 'Земля': 0, 'Воздух': 0, 'Вода': 0, 'Эфир': 0 };

  var ascElement = SIGN_ELEMENTS[chart.ascSign];
  scores[ascElement] += ASC_WEIGHT;

  for (var i = 0; i < chart.planets.length; i++) {
    var planet = chart.planets[i];
    var weight = PLANET_WEIGHTS[planet.id] || 1;
    if (planet.id === 'rahu' || planet.id === 'ketu') {
      scores['Эфир'] += weight;
    } else {
      var element = SIGN_ELEMENTS[planet.sign];
      scores[element] += weight;
    }
  }

  var total = 0;
  for (var k = 0; k < ELEMENTS.length; k++) {
    total += scores[ELEMENTS[k]];
  }

  var percentages = {};
  var sorted = [];
  for (var j = 0; j < ELEMENTS.length; j++) {
    var el = ELEMENTS[j];
    var pct = Math.round((scores[el] / total) * 100);
    percentages[el] = pct;
    sorted.push({ name: el, score: scores[el], pct: pct, meta: ELEMENT_META[el] });
  }
  sorted.sort(function(a, b) { return b.score - a.score; });

  return {
    scores: scores,
    percentages: percentages,
    dominant: sorted[0].name,
    elements: sorted,
    total: total
  };
}

/**
 * Отрендерить блок конституции в контейнер.
 * @param {HTMLElement} container
 * @param {Object} dosha — результат calculateDosha()
 */
export function renderDosha(container, dosha) {
  var html = '';

  html += '<div style="text-align:center;margin-bottom:14px;">';
  html += '<div style="font-family:Cinzel,serif;font-size:9px;letter-spacing:0.2em;color:rgba(100,160,255,0.35);">ДОМИНАНТНАЯ СТИХИЯ</div>';
  html += '<div style="font-size:28px;margin:6px 0;">' + ELEMENT_META[dosha.dominant].icon + '</div>';
  html += '<div style="font-family:Cinzel,serif;font-size:clamp(14px,3.5vw,18px);color:' + ELEMENT_META[dosha.dominant].color + ';letter-spacing:0.15em;">' + dosha.dominant.toUpperCase() + '</div>';
  html += '</div>';

  html += '<div style="display:flex;flex-direction:column;gap:8px;">';
  for (var i = 0; i < dosha.elements.length; i++) {
    var el = dosha.elements[i];
    html += '<div style="display:flex;align-items:center;gap:8px;">';
    html += '<div style="width:24px;text-align:center;font-size:14px;">' + el.meta.icon + '</div>';
    html += '<div style="width:60px;font-size:11px;color:rgba(255,248,214,0.7);">' + el.name + '</div>';
    html += '<div style="flex:1;height:14px;border-radius:7px;background:rgba(255,255,255,0.06);overflow:hidden;">';
    html += '<div style="height:100%;width:' + el.pct + '%;border-radius:7px;background:' + el.meta.color + ';transition:width 0.6s ease;"></div>';
    html += '</div>';
    html += '<div style="width:36px;text-align:right;font-family:\'JetBrains Mono\',monospace;font-size:11px;color:' + el.meta.color + ';">' + el.pct + '%</div>';
    html += '</div>';
  }
  html += '</div>';

  container.innerHTML = html;
}

export { ELEMENTS, ELEMENT_META };
