/**
 * nakshatraAgent.js — связь накшатр с агентами AWARA
 *
 * 27 накшатр → 21 агент (циклическое отображение с учётом стихий).
 * Читает натальную карту из localStorage и определяет
 * агента-проводника по лунной накшатре игрока.
 */

var NAKSHATRA_AGENT_MAP = {
  'Ашвини':             { agentSlug: 'svet_ra',    reason: 'солнечный импульс начала' },
  'Бхарани':            { agentSlug: 'shakti',     reason: 'энергия трансформации' },
  'Криттика':           { agentSlug: 'agni',       reason: 'очищающий огонь' },
  'Рохини':             { agentSlug: 'lakshmi',    reason: 'плодородие, материальное творение' },
  'Мригашира':          { agentSlug: 'sarasvati',  reason: 'поиск знания, любопытство ума' },
  'Ардра':              { agentSlug: 'shiva',      reason: 'буря обновления, разрушение старого' },
  'Пунарвасу':          { agentSlug: 'vishnu',     reason: 'возвращение домой, восстановление' },
  'Пушья':              { agentSlug: 'brahma',     reason: 'питание духа, космическое творение' },
  'Ашлеша':             { agentSlug: 'karma',      reason: 'скрытые связи, кармические узлы' },
  'Магха':              { agentSlug: 'dharma',     reason: 'наследие рода, закон предков' },
  'Пурва Пхалгуни':    { agentSlug: 'tejas',      reason: 'творческое сияние, наслаждение' },
  'Уттара Пхалгуни':   { agentSlug: 'prema',      reason: 'покровительство, дружба' },
  'Хаста':              { agentSlug: 'jnana',      reason: 'мастерство, точное знание' },
  'Читра':              { agentSlug: 'akasha',     reason: 'архитектор форм, пространство' },
  'Свати':              { agentSlug: 'vayu',       reason: 'свобода ветра, независимость' },
  'Вишакха':            { agentSlug: 'agni',       reason: 'целеустремлённость, двойной огонь' },
  'Анурадха':           { agentSlug: 'iskra',      reason: 'синхронность, космический союз' },
  'Джьештха':           { agentSlug: 'prithvi',    reason: 'устойчивость, старшинство' },
  'Мула':               { agentSlug: 'shiva',      reason: 'корень, разрушение иллюзий' },
  'Пурва Ашадха':       { agentSlug: 'varuna',     reason: 'омовение, очищение водой' },
  'Уттара Ашадха':      { agentSlug: 'ananda',     reason: 'блаженство всеобщей победы' },
  'Шравана':            { agentSlug: 'sarasvati',  reason: 'слушание, космический слух' },
  'Дханишта':           { agentSlug: 'shanti',     reason: 'гармония ритма, мир' },
  'Шатабхиша':          { agentSlug: 'varuna',     reason: 'сто целителей, океан тайн' },
  'Пурва Бхадрапада':   { agentSlug: 'parvati',    reason: 'аскеза, преображение' },
  'Уттара Бхадрапада':  { agentSlug: 'vishnu',     reason: 'глубинная мудрость, хранение' },
  'Ревати':             { agentSlug: 'svet_ra',    reason: 'завершение цикла, свет нового' }
};

var STORAGE_CHART = 'awara_natal_chart';

/**
 * Получить агента-проводника по лунной накшатре из натальной карты.
 * @returns {Object|null} { nakshatra, agentSlug, reason, moonSign } или null
 */
export function getNakshatraGuide() {
  try {
    var raw = localStorage.getItem(STORAGE_CHART);
    if (!raw) return null;
    var chart = JSON.parse(raw);
    if (!chart.data || !chart.data.planets) return null;

    var moon = null;
    for (var i = 0; i < chart.data.planets.length; i++) {
      if (chart.data.planets[i].id === 'moon') {
        moon = chart.data.planets[i];
        break;
      }
    }
    if (!moon || !moon.nakshatra) return null;

    var mapping = NAKSHATRA_AGENT_MAP[moon.nakshatra];
    if (!mapping) return null;

    return {
      nakshatra: moon.nakshatra,
      agentSlug: mapping.agentSlug,
      reason: mapping.reason,
      moonSign: moon.sign
    };
  } catch (e) {
    return null;
  }
}

/**
 * Найти данные агента по slug из массива agents.json.
 * @param {Array} agents — массив агентов из data/agents.json
 * @param {string} slug
 * @returns {Object|null}
 */
export function findAgentBySlug(agents, slug) {
  for (var i = 0; i < agents.length; i++) {
    if (agents[i].slug === slug) return agents[i];
  }
  return null;
}

/**
 * Отрендерить блок «Проводник по накшатре» в контейнер.
 * @param {HTMLElement} container
 * @param {Object} guide — из getNakshatraGuide()
 * @param {Object|null} agent — из findAgentBySlug()
 */
export function renderNakshatraGuide(container, guide, agent) {
  var agentName = agent ? agent.name : guide.agentSlug;
  var agentDomain = agent ? agent.domain : '';
  var agentElement = agent ? agent.element : '';

  var ELEMENT_ICONS = {
    'Огонь': '🔥', 'Земля': '🌍', 'Воздух': '💨',
    'Вода': '💧', 'Эфир': '✦'
  };
  var elemIcon = ELEMENT_ICONS[agentElement] || '✦';

  var html = '';
  html += '<div style="text-align:center;margin-bottom:10px;">';
  html += '<div style="font-size:28px;margin-bottom:4px;filter:drop-shadow(0 0 8px rgba(201,168,76,0.5));">☽</div>';
  html += '<div style="font-family:Cinzel,serif;font-size:clamp(13px,3.2vw,16px);color:#c9a84c;letter-spacing:0.12em;">' + agentName + '</div>';
  if (agentDomain) {
    html += '<div style="font-size:clamp(9px,2vw,10px);color:rgba(201,168,76,0.45);margin-top:2px;">' + agentDomain + '</div>';
  }
  html += '</div>';

  html += '<div style="display:flex;flex-direction:column;gap:6px;font-size:clamp(11px,2.8vw,12px);color:rgba(220,210,190,0.7);line-height:1.4;">';
  html += '<div style="display:flex;align-items:center;gap:8px;"><span style="color:rgba(201,168,76,0.5);width:70px;font-size:9px;letter-spacing:0.1em;">НАКШАТРА</span><span>' + guide.nakshatra + '</span></div>';
  if (agentElement) {
    html += '<div style="display:flex;align-items:center;gap:8px;"><span style="color:rgba(201,168,76,0.5);width:70px;font-size:9px;letter-spacing:0.1em;">СТИХИЯ</span><span>' + elemIcon + ' ' + agentElement + '</span></div>';
  }
  html += '<div style="display:flex;align-items:center;gap:8px;"><span style="color:rgba(201,168,76,0.5);width:70px;font-size:9px;letter-spacing:0.1em;">ВЛИЯНИЕ</span><span style="font-style:italic;">' + guide.reason + '</span></div>';
  html += '</div>';

  container.innerHTML = html;
}
