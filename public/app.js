const form = document.getElementById('chatForm');
const input = document.getElementById('textInput');
const messages = document.getElementById('messages');

function appendMessage(text, cssClass, isHtml, senderName) {
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

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  appendMessage(text, 'user');
  input.value = '';

  try {
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await resp.json();
        if (data.url) {
          appendMessage(data.reply, 'bot');
          // Send raw URL in href; the browser will handle encoding for navigation.
          appendMessage(`<a href="${data.url}" target="_blank" rel="noopener noreferrer">資料を開く</a>`, 'bot', true);
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
    appendMessage('サーバーエラーが発生しました。', 'bot');
    console.error(err);
  }
});

// 初期メッセージ（運営） — ○○ の部分はあとで編集できます
const initialText = '今回、調査に協力してくれてありがとうございます。あなたの調査をもとに記事を作成したいので情報をいただいてもいいですか？まず初めに○○の教室にいた幽霊について教えてください。';
appendMessage(initialText, 'bot', false, '運営');

// (Public URL UI removed — local-only build)
