// Lightweight health/ping endpoint compatible with Cache Components
// Keep Node runtime defaults (no explicit route segment config)

export async function GET() {
  return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
