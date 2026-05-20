export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── /api/chat: Dify プロキシ ──────────────────────────
    if (url.pathname === '/api/chat') {
      const CORS = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: CORS });
      }
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405, headers: CORS });
      }

      try {
        const body = await request.json();
        const res = await fetch('https://api.dify.ai/v1/chat-messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + env.DIFY_API_KEY,
          },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        return new Response(JSON.stringify(data), {
          status: res.status,
          headers: { ...CORS, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { ...CORS, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── それ以外: 静的ファイルを配信 ───────────────────────
    return env.ASSETS.fetch(request);
  },
};
