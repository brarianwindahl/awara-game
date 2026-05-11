/**
 * oracle.js — Оракул AWARA (LLM через OpenRouter)
 *
 * API-ключ хранится ТОЛЬКО в localStorage (§6.5 — никогда в коде).
 * Контекст: агент дня, матрица, стихия, натальные данные.
 */

const ORACLE_KEY_STORAGE = 'awara_oracle_apikey';
const ORACLE_HISTORY_STORAGE = 'awara_oracle_history';
const ORACLE_MODEL_STORAGE = 'awara_oracle_model';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.5-flash';

export const AVAILABLE_MODELS = [
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'быстрый, дешёвый, философский' },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'глубокий, дороже' },
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet', desc: 'точный, премиум' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', desc: 'компактный, быстрый' },
  { id: 'meta-llama/llama-4-maverick', name: 'Llama 4 Maverick', desc: 'открытый, бесплатный*' },
];
const MAX_HISTORY = 20;

export function getApiKey() {
  return localStorage.getItem(ORACLE_KEY_STORAGE) || '';
}

export function setApiKey(key) {
  if (key) {
    localStorage.setItem(ORACLE_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(ORACLE_KEY_STORAGE);
  }
}

export function getModel() {
  return localStorage.getItem(ORACLE_MODEL_STORAGE) || DEFAULT_MODEL;
}

export function setModel(model) {
  localStorage.setItem(ORACLE_MODEL_STORAGE, model || DEFAULT_MODEL);
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(ORACLE_HISTORY_STORAGE) || '[]');
  } catch { return []; }
}

export function saveHistory(messages) {
  const trimmed = messages.slice(-MAX_HISTORY);
  localStorage.setItem(ORACLE_HISTORY_STORAGE, JSON.stringify(trimmed));
}

export function clearHistory() {
  localStorage.removeItem(ORACLE_HISTORY_STORAGE);
}

function buildSystemPrompt(context) {
  let prompt = `Ты — Оракул AWARA, мудрый проводник в священной операционной системе реальности.
Ты говоришь на языке пользователя (обычно русский).
Твоя задача — давать глубокие, но практичные ответы, соединяя древнюю мудрость с повседневной жизнью.
Ты НЕ притворяешься человеком. Ты — Оракул, часть игры AWARA.
Отвечай кратко (2-5 предложений), мудро, с уважением к вопрошающему.`;

  if (context.agent) {
    prompt += `\n\nАгент дня игрока: ${context.agent.name} (${context.agent.culture}).`;
  }
  if (context.matrix) {
    prompt += `\nАктивная матрица восприятия: ${context.matrix}.`;
  }
  if (context.element) {
    prompt += `\nСтихия дня: ${context.element}.`;
  }
  if (context.question) {
    prompt += `\nВопрос дня: «${context.question}»`;
  }
  if (context.natal) {
    prompt += `\nНатальные данные: Лагна ${context.natal.ascSign}, Солнце ${context.natal.sunSign}, Луна ${context.natal.moonSign}.`;
  }
  prompt += `\n\nИспользуй эти данные как контекст, если они релевантны вопросу. Не упоминай их принудительно.`;
  return prompt;
}

function gatherContext() {
  const ctx = {};
  try {
    const stateRaw = localStorage.getItem('awara_v258_state');
    if (stateRaw) {
      const state = JSON.parse(stateRaw);
      ctx.matrix = state.activeSystem || null;
    }
  } catch {}

  try {
    const chartRaw = localStorage.getItem('awara_natal_chart');
    if (chartRaw) {
      const chart = JSON.parse(chartRaw);
      if (chart.data) {
        ctx.natal = {
          ascSign: chart.data.ascendant?.signName || null,
          sunSign: chart.data.planets?.[0]?.signName || null,
          moonSign: chart.data.planets?.[1]?.signName || null
        };
      }
    }
  } catch {}

  return ctx;
}

export async function sendMessage(userText, history) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }

  const context = gatherContext();
  const systemMsg = { role: 'system', content: buildSystemPrompt(context) };

  const messages = [systemMsg, ...history, { role: 'user', content: userText }];

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://victorianpieraverdi-dev.github.io/awara-game/',
      'X-Title': 'AWARA Oracle'
    },
    body: JSON.stringify({
      model: getModel(),
      messages: messages,
      max_tokens: 500,
      temperature: 0.8
    })
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 401) throw new Error('API_KEY_INVALID');
    if (response.status === 402) throw new Error('API_CREDITS_EMPTY');
    if (response.status === 429) throw new Error('API_RATE_LIMIT');
    throw new Error(`API_ERROR: ${response.status} ${err}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || '';
  if (!reply) throw new Error('API_EMPTY_RESPONSE');

  return reply;
}
