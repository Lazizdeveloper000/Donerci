// DONERCI — Telegram buyurtma proxy (Cloudflare Workers)
// Token saytda ochiq turmasligi uchun shu yerda maxfiy saqlanadi.
//
// O'rnatish:
//  1) dash.cloudflare.com → Workers & Pages → Create → "Hello World" worker → shu kodni qo'ying → Deploy
//  2) Worker → Settings → Variables and Secrets:
//       BOT_TOKEN  (Secret)  = bot tokeningiz
//       CHAT_ID    (Text)    = 8990585770
//       ALLOWED_ORIGIN (Text) = saytingiz manzili, masalan https://donerci.uz  (ixtiyoriy, himoya uchun)
//  3) Worker manzilini index.html dagi TELEGRAM.proxyUrl ga yozing, botToken ni "" qiling.

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allow = env.ALLOWED_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": allow,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });
    if (env.ALLOWED_ORIGIN && origin !== env.ALLOWED_ORIGIN) {
      return new Response("Forbidden", { status: 403, headers: cors });
    }

    let body;
    try { body = await request.json(); } catch { return new Response("Bad request", { status: 400, headers: cors }); }
    const text = String(body.text || "").slice(0, 3500);
    if (!text) return new Response("Empty", { status: 400, headers: cors });

    const tg = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.CHAT_ID, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
    return new Response(tg.ok ? "ok" : "telegram error", { status: tg.ok ? 200 : 502, headers: cors });
  },
};
