import { useEffect, useMemo, useRef, useState } from "react";
import { summarize } from "./api";

export default function App() {
  // ---------- state ----------
  const [text, setText] = useState("");
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [focused, setFocused] = useState(false);
  const [isTwoCols, setIsTwoCols] = useState(false);

  // compute once after mount to avoid window SSR issues
  useEffect(() => {
    const setCols = () => setIsTwoCols(window.innerWidth >= 900);
    setCols();
    window.addEventListener("resize", setCols);
    return () => window.removeEventListener("resize", setCols);
  }, []);

  const MAX_CHARS = 12000;
  const words = useMemo(() => (text.trim() ? text.trim().split(/\s+/).length : 0), [text]);
  const firstRun = useRef(true);

  // ---------- actions ----------
  async function runSummarize() {
    if (!text.trim()) return;
    setBusy(true); setErr(""); setOut(""); setCopied(false);

    const slowNote = setTimeout(() => {
      if (firstRun.current) setErr("First run may be slow (model download). Please wait…");
    }, 6000);

    try {
      const res = await summarize(text);
      if (res.error) setErr(res.error);
      setOut(res.summary || "");
      firstRun.current = false;
    } catch (e) {
      setErr(e.name === "AbortError" ? "Timed out. Is backend running on :8000?" : e.message);
    } finally {
      clearTimeout(slowNote);
      setBusy(false);
    }
  }

  async function copySummary() {
    try { await navigator.clipboard.writeText(out || ""); setCopied(true); setTimeout(()=>setCopied(false), 1000); } catch {}
  }

  // ---------- styles ----------
  const s = {
    page: {
      minHeight: "100vh",
      background:
        "radial-gradient(1200px 600px at 10% -10%, rgba(120,119,198,0.25), transparent 40%)," +
        "radial-gradient(1200px 600px at 110% 10%, rgba(0,153,255,0.2), transparent 40%)," +
        "linear-gradient(180deg, #0e1217 0%, #0b0f14 100%)",
      color: "#eee9e7ff",
      fontFamily:
        "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,'Noto Sans',sans-serif",
    },
    container: {
      margin: "0 auto",
      padding: "26px 14px 56px",
    },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
    brand: { display: "flex", gap: 12, alignItems: "center" },
    logo: {
      width: 40, height: 40, borderRadius: 12,
      background: "conic-gradient(from 220deg, #79c0ff, #8a5cf6, #79c0ff)",
      boxShadow: "0 8px 28px rgba(138,92,246,.45)",
    },
    title: { fontSize: 22, fontWeight: 700 },
    hint: { fontSize: 13, opacity: 0.75 },
    badge: {
      fontSize: 12, color: "#0e1217",
      background: "linear-gradient(180deg,#b9f3ff 0%, #7edbff 100%)",
      padding: "2px 8px", borderRadius: 999,
      display: "inline-block",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: isTwoCols ? "1.1fr 0.9fr" : "1fr",
      gap: 16,
    },
    card: {
      background: "rgba(22, 27, 34, 0.72)",
      border: "1px solid rgba(148,163,184,0.15)",
      backdropFilter: "blur(8px)",
      borderRadius: 16,
      padding: 14,
      boxShadow: "0 12px 28px rgba(0,0,0,0.35)",
    },
    labelRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 },
    label: { fontSize: 14, opacity: 0.9 },
    counter: { fontSize: 12, color: "#9aa4b2" },
    textareaWrap: {
      borderRadius: 12,
      border: `1.5px solid ${focused ? "#7aa2ff" : "rgba(148,163,184,0.25)"}`,
      background: "rgba(13, 17, 23, 0.6)",
      transition: "border-color .15s ease",
    },
    textarea: {
      width: "100%",
      height: 260,
      resize: "vertical",
      padding: "14px",
      border: "none", outline: "none",
      color: "#e7e9ee", background: "transparent",
      fontSize: 15.5, lineHeight: 1.5, caretColor: "#7aa2ff",
    },
    rowEnd: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
    tiny: { fontSize: 12.5, color: "#9aa4b2" },
    actions: { display: "flex", gap: 10, flexWrap: "wrap" },
    btn: {
      appearance: "none", cursor: "pointer",
      border: "1px solid rgba(148,163,184,0.2)", borderRadius: 12,
      padding: "10px 14px", fontSize: 14, fontWeight: 600,
      color: "#0e1217",
      background: "linear-gradient(180deg, #a8c1ff 0%, #7aa2ff 45%, #5a86ff 100%)",
      boxShadow: "0 8px 22px rgba(90,134,255,.35)",
    },
    btnDisabled: { opacity: 0.6, cursor: "not-allowed", boxShadow: "none", filter: "grayscale(20%)" },
    btnGhost: {
      color: "#e7e9ee", background: "transparent",
      border: "1px solid rgba(148,163,184,0.25)", boxShadow: "none",
    },
    err: {
      background: "rgba(255, 77, 79, 0.12)",
      border: "1px solid rgba(255, 99, 99, 0.4)",
      color: "#ffb3b3", padding: "10px 12px", borderRadius: 12,
      fontSize: 14, marginTop: 12,
    },
    resultHead: { display: "flex", alignItems: "center", justifyContent: "space-between" },
    copyBtn: {
      appearance: "none", border: "1px solid rgba(148,163,184,0.25)",
      borderRadius: 10, padding: "6px 10px", fontSize: 13, fontWeight: 600,
      color: "#e7e9ee", background: "rgba(13,17,23,.65)", cursor: "pointer",
    },
    copiedDot: { display: "inline-block", marginLeft: 8, width: 8, height: 8, borderRadius: "50%", background: "#66ffb2", boxShadow: "0 0 12px #66ffb2" },
    resultBox: {
      marginTop: 8, background: "rgba(8, 12, 18, 0.75)",
      border: "1px solid rgba(148,163,184,0.18)",
      borderRadius: 12, padding: 14, color: "#dce3ea",
      whiteSpace: "pre-wrap", lineHeight: 1.6, fontSize: 15.5, minHeight: 120,
    },
    spinner: {
      width: 16, height: 16, borderRadius: "50%",
      border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff",
      animation: "spin .7s linear infinite", display: "inline-block", verticalAlign: "middle", marginRight: 8,
    },
  };

  return (
    <div style={s.page}>
      <style>{`@keyframes spin {from{transform:rotate(0)} to{transform:rotate(360deg)}}`}</style>

      <div style={s.container}>
        {/* header */}
        <div style={s.header}>
          <div style={s.brand}>
            <div style={s.logo} />
            <div>
              <div style={s.title}>Summarizer</div>
              <div style={s.hint}>Paste text · Get a clear summary</div>
            </div>
          </div>
        </div>

        {/* layout */}
        <div style={s.grid}>
          {/* input */}
          <div style={s.card}>
            <div style={s.labelRow}>
              <div style={s.label}>Your text</div>
              <div style={s.counter}>{words} words · {text.length}/{MAX_CHARS} chars</div>
            </div>

            <div style={s.textareaWrap}>
              <textarea
                style={s.textarea}
                value={text}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v.length <= MAX_CHARS) setText(v);
                }}
                placeholder="Paste long text here (article, report, notes...)"
                rows={12}
              />
            </div>

            <div style={s.rowEnd}>
              {/* <div style={s.tiny}>Tip: Backend should run at <code>http://localhost:8000</code></div> */}
              <div style={s.actions}>
                <button
                  style={{ ...s.btn, ...(busy || !text.trim() ? s.btnDisabled : null) }}
                  disabled={busy || !text.trim()}
                  onClick={runSummarize}
                >
                  {busy ? (<><span style={s.spinner} /> Summarizing…</>) : "Summarize"}
                </button>
                <button
                  style={{ ...s.btn, ...s.btnGhost }}
                  onClick={() => { setText(""); setOut(""); setErr(""); setCopied(false); }}
                >
                  Clear
                </button>
              </div>
            </div>

            {err ? <div style={s.err}>{err}</div> : null}
          </div>

          {/* result */}
          <div style={s.card}>
            <div style={s.resultHead}>
              <div style={s.label}>Summary</div>
              <div>
                <button
                  style={{ ...s.copyBtn, opacity: out ? 1 : 0.5, cursor: out ? "pointer" : "not-allowed" }}
                  onClick={copySummary}
                  disabled={!out}
                  title="Copy summary"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
                {copied ? <span style={s.copiedDot} /> : null}
              </div>
            </div>
            <div style={s.resultBox}>{out || "—"}</div>
            {/* <div style={{ ...s.hint, marginTop: 10 }}>
              Model: <code>sshleifer/distilbart-cnn-12-6</code>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
