const form = document.getElementById('chatForm');
const input = document.getElementById('textInput');
const messages = document.getElementById('messages');

function appendMessage(text, cssClass = 'bot', isHtml = false, senderName) {
  const el = document.createElement('div');
  el.className = `message ${cssClass}`;
  if (senderName) {
    const label = document.createElement('div');
    label.style.fontSize = '12px';
    label.style.opacity = '0.85';
    label.style.marginBottom = '6px';
    label.textContent = senderName;
    el.appendChild(label);
  }
  const bubble = document.createElement('div');
  bubble.className = `bubble ${cssClass}`;
  if (isHtml) bubble.innerHTML = text; else bubble.textContent = text;
  el.appendChild(bubble);
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
}

function apiUrl(path) {
  try {
    const host = window.location.host || '';
    if (host !== 'localhost:3000') {
      return `http://localhost:3000${path}`;
    }
  } catch (e) {
    // ignore
  }
  return path;
}

// Resolvable backend base ('' means same-origin relative)
let backendBase = null;

async function resolveBackend(timeoutMs = 1500) {
  if (backendBase !== null) return backendBase;
  const candidates = [];
  // 1) same-origin relative
  candidates.push('');
  // 2) same hostname but port 3000
  try {
    const proto = window.location.protocol || 'http:';
    const hostOnly = window.location.hostname;
    if (hostOnly) candidates.push(`${proto}//${hostOnly}:3000`);
  } catch (e) {}
  // 3) explicit localhost:3000
  candidates.push('http://localhost:3000');

  for (const base of candidates) {
    const url = (base === '') ? '/health' : `${base}/health`;
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      const resp = await fetch(url, { signal: controller.signal, mode: 'cors' });
      clearTimeout(id);
      if (resp.ok) {
        backendBase = base; // cache for future
        console.debug('[chat] resolved backend base ->', backendBase === '' ? '(same-origin)' : backendBase);
        return backendBase;
      }
    } catch (e) {
      console.debug('[chat] health check failed for', url, e && e.message ? e.message : e);
    }
  }
  backendBase = null;
  return null;
}

function buildUrl(path) {
  if (backendBase === null) return path;
  return backendBase === '' ? path : `${backendBase}${path}`;
}

// Check backend health with timeout (returns true if healthy)
async function checkHealth(timeoutMs = 2000) {
  const url = apiUrl('/health');
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return resp.ok;
  } catch (e) {
    return false;
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  appendMessage(text, 'user');
  input.value = '';

  try {
    // resolve backend URL before attempting POST (tries multiple candidates)
    await resolveBackend(1500);
    if (backendBase === null) {
      // show a clearer actionable message and a clickable link for non-technical users
      const suggested = 'http://localhost:3000';
      appendMessage(`サーバーが応答していません。少し待ってから再試行してください。（バックエンドに接続できるホスト/ポートが見つかりません）<br><br>対処法: ブラウザで <a href="${suggested}" target="_blank" rel="noopener noreferrer">${suggested}</a> を開いて、同じサーバー上でアプリを表示してください。`, 'bot', true);
      // also show the top notice banner if present
      try {
        const notice = document.getElementById('serverNotice');
        if (notice) {
          notice.style.display = 'block';
          const link = document.getElementById('openBackendLink');
          if (link) link.href = suggested;
        }
      } catch (e) {}
      console.warn('[chat] backend could not be resolved before POST');
      return;
    }

    const url = buildUrl('/api/chat');
    console.debug('[chat] POST ->', url, { message: text });

    // try fetch with retries for transient network/server failures
    const maxRetries = 3;
    let attempt = 0;
    let resp;
    while (attempt < maxRetries) {
      try {
        resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        break; // success or non-network error (we'll check resp.ok below)
      } catch (err) {
        attempt++;
        console.warn(`[chat] fetch attempt ${attempt} failed:`, err && err.message ? err.message : err);
        appendMessage(`サーバーに接続できません（再試行中 ${attempt}/${maxRetries}）...`, 'bot');
        // small backoff
        await new Promise(r => setTimeout(r, 400 * attempt));
        if (attempt >= maxRetries) throw err;
      }
    }

    if (!resp.ok) {
      let errText = `ステータス ${resp.status}`;
      try {
        const errJson = await resp.json();
        if (errJson && errJson.error) errText += `: ${errJson.error}`;
      } catch (e) {
        try { const t = await resp.text(); if (t) errText += `: ${t}`; } catch (_) {}
      }
      appendMessage(`サーバーエラーが発生しました。 (${errText})`, 'bot');
      return;
    }

    const data = await resp.json();
    if (data.url) {
      appendMessage(data.reply, 'bot');
      const url = String(data.url || '');
      if (url.toLowerCase().endsWith('.pdf')) {
        appendMessage(`<div style="margin-top:8px;"><iframe src="${url}" style="width:100%;height:480px;border:1px solid #ddd;border-radius:6px;"></iframe></div>`, 'bot', true);
        appendMessage(`<a href="${url}" target="_blank" rel="noopener noreferrer">新しいタブで開く（PDF表示）</a>`, 'bot', true);
      } else {
        appendMessage(`<a href="${url}" target="_blank" rel="noopener noreferrer">資料を開く</a>`, 'bot', true);
      }
    } else if (data.urls && Array.isArray(data.urls)) {
      appendMessage(data.reply, 'bot');
      for (const u of data.urls) {
        appendMessage(`<a href="${u}" target="_blank" rel="noopener noreferrer">${u}</a>`, 'bot', true);
      }
    } else if (data.reply) {
      appendMessage(data.reply, 'bot');
    } else if (data.error) {
      appendMessage(`Error: ${data.error}`, 'bot');
    }
  } catch (err) {
    // Network-level or repeated failure
    appendMessage(`サーバーエラーが発生しました。 (${err && err.message ? err.message : err})`, 'bot');
    console.error('[chat] Fetch error (final):', err);
  }
});

// 初期メッセージ（運営） — ○○ の部分はあとで編集できます
const initialText = '今回、調査に協力してくれてありがとうございます。あなたの調査をもとに記事を作成したいので情報をいただいてもいいですか？まず初めに○○の教室にいた幽霊について教えてください。';
appendMessage(initialText, 'bot', false, '運営');

// (Public URL UI removed — local-only build)
