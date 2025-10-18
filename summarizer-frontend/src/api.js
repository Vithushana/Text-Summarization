// simple, robust fetch to your FastAPI
export async function summarize(text, { timeoutMs = 180000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  const res = await fetch("http://localhost:8000/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    signal: ctrl.signal,
  }).finally(() => clearTimeout(t));

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }
  return await res.json();
}
