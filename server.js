const express = require('express');
const path = require('path');
const os = require('os');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// Serve PDF files from current_newsparer folder at /files
app.use('/files', express.static(path.join(__dirname, 'current_newsparer')));

// Request logging for debugging intermittent errors
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} Origin=${req.get('Origin') || '-'} IP=${req.ip}`);
  next();
});

// Simple CORS + preflight handler to allow requests from Live Server or other origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    // Preflight request - respond with no content
    return res.sendStatus(204);
  }
  next();
});

// Helpful GET handler for /api/chat so accidental GETs return an informative message
app.get('/api/chat', (req, res) => {
  res.json({ error: 'このエンドポイントは POST を期待します。JSON ボディで { message: "..." } を送ってください。' });
});

// Simple health check endpoint for clients to verify backend availability
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Map trigger words to URLs. Customize as needed.
const triggers = {
  'help': 'https://example.com/help',
  'docs': 'https://example.com/docs',
  'pricing': 'https://example.com/pricing'
};

function generateReply(message) {
  const normalized = (message || '').toLowerCase();

  // Find which trigger keys appear in the message (distinct)
  const matched = Object.keys(triggers).filter(k => normalized.includes(k));

  // Require at least 3 distinct trigger words to 'pass'
  if (matched.length >= 3) {
    // When 3+ keywords match, return the PDF URL for the "第一幽霊の過去.pdf"
    const reply = '有難うございます。過去の資料にこちらがございました。もしかしたら何かの手掛かりになるかもしれません。';
    // serve the PDF from /files/<filename>
    return { reply, url: '/files/第一幽霊の過去.pdf', matched };
  }

  if (matched.length > 0) {
    return { reply: `キーワードが${matched.length}個見つかりましたが、3個以上必要です。見つかったキーワード: ${matched.join(', ')}` };
  }

  return { reply: 'ごめんなさい、そのワードには対応していません。' };
}

app.post('/api/chat', (req, res) => {
  try {
    const { message } = req.body;
    if (typeof message !== 'string') {
      console.warn('Bad request: message not string', req.body);
      return res.status(400).json({ error: 'message must be a string' });
    }
    const result = generateReply(message);
    res.json(result);
  } catch (err) {
    console.error('Error handling /api/chat:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'サーバー内部エラーが発生しました。' });
  }
});

// (QR endpoint removed - this build is for local use only)

// (Public URL endpoint removed - this build is for local use only)

// Start server bound to all interfaces so other hosts can reach it if firewall allows
app.listen(port, () => {
  console.log(`Chat server listening at http://localhost:${port}`);
});
