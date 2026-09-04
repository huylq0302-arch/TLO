"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── QUOTES ──────────────────────────────────────────────
const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
];

const GREETINGS = [
  { range: [5, 12], text: "Chào buổi sáng" },
  { range: [12, 18], text: "Chào buổi chiều" },
  { range: [18, 22], text: "Chào buổi tối" },
  { range: [22, 24], text: "Thức khuya vậy" },
  { range: [0, 5], text: "Đêm khuya rồi" },
];

// ── TYPES ────────────────────────────────────────────────
interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

// ── HOOKS ────────────────────────────────────────────────
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) setValue(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, [key]);

  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
        return next;
      });
    },
    [key]
  );

  return [value, set, loaded] as const;
}

// ── CLOCK ────────────────────────────────────────────────
function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const h = time.getHours().toString().padStart(2, "0");
  const m = time.getMinutes().toString().padStart(2, "0");
  const s = time.getSeconds().toString().padStart(2, "0");

  const greeting =
    GREETINGS.find(
      (g) =>
        (g.range[0] < g.range[1] &&
          time.getHours() >= g.range[0] &&
          time.getHours() < g.range[1]) ||
        (g.range[0] >= g.range[1] &&
          (time.getHours() >= g.range[0] || time.getHours() < g.range[1]))
    )?.text ?? "Xin chào";

  const dateStr = time.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="text-center select-none">
      <p className="text-white/50 text-sm tracking-widest uppercase mb-3 font-mono">
        {dateStr}
      </p>
      <div className="flex items-center justify-center gap-1 mb-2">
        <span className="text-white font-mono font-light" style={{ fontSize: "clamp(72px, 14vw, 140px)", lineHeight: 1, letterSpacing: "-0.02em" }}>
          {h}:{m}
        </span>
        <span className="text-white/30 font-mono self-end pb-3" style={{ fontSize: "clamp(28px, 5vw, 52px)" }}>
          :{s}
        </span>
      </div>
      <p className="text-white/60 text-xl font-light tracking-wide">{greeting} 👋</p>
    </div>
  );
}

// ── QUOTE ────────────────────────────────────────────────
function QuoteWidget() {
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  return (
    <div className="text-center max-w-lg mx-auto px-4">
      <p className="text-white/70 text-base leading-relaxed italic">"{quote.text}"</p>
      <p className="text-white/40 text-sm mt-2">— {quote.author}</p>
    </div>
  );
}

// ── FOCUS ────────────────────────────────────────────────
function FocusWidget() {
  const [focus, setFocus, loaded] = useLocalStorage("momentum-focus", "");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const start = () => {
    setDraft(focus);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const save = () => {
    setFocus(draft.trim());
    setEditing(false);
  };

  if (!loaded) return null;

  return (
    <div className="text-center">
      <p className="text-white/40 text-xs tracking-widest uppercase mb-3 font-mono">
        Mục tiêu hôm nay
      </p>
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
          placeholder="Hôm nay tôi muốn..."
          className="bg-transparent border-b border-white/30 text-white text-center text-xl font-light w-80 pb-1 placeholder-white/25 focus:border-indigo-400 transition-colors"
          style={{ caretColor: "#818cf8" }}
        />
      ) : focus ? (
        <button
          onClick={start}
          className="text-white text-xl font-light hover:text-indigo-300 transition-colors cursor-text border-b border-transparent hover:border-white/20 pb-1"
        >
          {focus}
        </button>
      ) : (
        <button
          onClick={start}
          className="text-white/30 text-xl font-light hover:text-white/60 transition-colors border-b border-white/10 hover:border-white/30 pb-1"
        >
          Hôm nay tôi muốn…
        </button>
      )}
    </div>
  );
}

// ── POMODORO ─────────────────────────────────────────────
function PomodoroWidget() {
  const WORK = 25 * 60;
  const BREAK = 5 * 60;
  const [seconds, setSeconds] = useState(WORK);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(t);
          setRunning(false);
          if (mode === "work") {
            setSessions((n) => n + 1);
            setMode("break");
            return BREAK;
          } else {
            setMode("work");
            return WORK;
          }
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, mode]);

  const reset = () => {
    setRunning(false);
    setSeconds(mode === "work" ? WORK : BREAK);
  };

  const switchMode = (m: "work" | "break") => {
    setMode(m);
    setRunning(false);
    setSeconds(m === "work" ? WORK : BREAK);
  };

  const mm = Math.floor(seconds / 60).toString().padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");
  const total = mode === "work" ? WORK : BREAK;
  const progress = ((total - seconds) / total) * 100;
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Mode tabs */}
      <div className="flex gap-1 bg-white/5 rounded-full p-1">
        {(["work", "break"] as const).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              mode === m ? "bg-indigo-500 text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            {m === "work" ? "Tập trung" : "Nghỉ"}
          </button>
        ))}
      </div>

      {/* Ring timer */}
      <div className="relative">
        <svg width="128" height="128" className="-rotate-90">
          <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle
            cx="64" cy="64" r="54" fill="none"
            stroke={mode === "work" ? "#818cf8" : "#34d399"}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (progress / 100) * circumference}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white font-mono text-2xl font-light">{mm}:{ss}</span>
          {sessions > 0 && (
            <span className="text-white/30 text-xs font-mono mt-0.5">{sessions} 🍅</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={() => setRunning((r) => !r)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
            running
              ? "bg-white/10 text-white hover:bg-white/15"
              : "bg-indigo-500 text-white hover:bg-indigo-400"
          }`}
        >
          {running ? "Dừng" : "Bắt đầu"}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-full text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

// ── TODO ─────────────────────────────────────────────────
function TodoWidget() {
  const [todos, setTodos, loaded] = useLocalStorage<Todo[]>("momentum-todos", []);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  const add = () => {
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [
      { id: crypto.randomUUID(), text, done: false, createdAt: Date.now() },
      ...prev,
    ]);
    setInput("");
  };

  const toggle = (id: string) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id: string) =>
    setTodos((prev) => prev.filter((t) => t.id !== id));

  const clearDone = () => setTodos((prev) => prev.filter((t) => !t.done));

  const visible = todos.filter((t) =>
    filter === "all" ? true : filter === "active" ? !t.done : t.done
  );

  const doneCount = todos.filter((t) => t.done).length;

  if (!loaded) return null;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-white/40 text-xs tracking-widest uppercase font-mono">
          Công việc ({todos.length - doneCount} còn lại)
        </span>
        {doneCount > 0 && (
          <button
            onClick={clearDone}
            className="text-white/25 text-xs hover:text-white/50 transition-colors"
          >
            Xoá đã xong
          </button>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Thêm việc cần làm…"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:border-indigo-500/50 focus:bg-white/8 transition-all"
          style={{ caretColor: "#818cf8" }}
        />
        <button
          onClick={add}
          className="w-10 h-10 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white flex items-center justify-center transition-colors text-lg font-light"
        >
          +
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-1">
        {(["all", "active", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-xs transition-all ${
              filter === f ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
            }`}
          >
            {f === "all" ? "Tất cả" : f === "active" ? "Chưa xong" : "Đã xong"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
        {visible.length === 0 && (
          <p className="text-white/20 text-sm text-center py-4">
            {filter === "done" ? "Chưa hoàn thành việc nào" : "Trống — thêm việc đi nào!"}
          </p>
        )}
        {visible.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-3 group bg-white/3 hover:bg-white/6 rounded-xl px-3 py-2.5 transition-colors"
          >
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggle(todo.id)}
              className="w-4 h-4 rounded cursor-pointer flex-shrink-0"
            />
            <span
              className={`flex-1 text-sm transition-all ${
                todo.done ? "text-white/25 line-through" : "text-white/80"
              }`}
            >
              {todo.text}
            </span>
            <button
              onClick={() => remove(todo.id)}
              className="text-white/0 group-hover:text-white/30 hover:!text-white/60 transition-all text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {todos.length > 0 && (
        <div className="mt-1">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full transition-all duration-500"
              style={{ width: `${(doneCount / todos.length) * 100}%` }}
            />
          </div>
          <p className="text-white/25 text-xs mt-1 text-right font-mono">
            {Math.round((doneCount / todos.length) * 100)}% hoàn thành
          </p>
        </div>
      )}
    </div>
  );
}

// ── LINKS ────────────────────────────────────────────────
const DEFAULT_LINKS = [
  { label: "Gmail", url: "https://mail.google.com", icon: "✉️" },
  { label: "GitHub", url: "https://github.com", icon: "🐙" },
  { label: "Notion", url: "https://notion.so", icon: "📝" },
  { label: "YouTube", url: "https://youtube.com", icon: "▶️" },
  { label: "ChatGPT", url: "https://chat.openai.com", icon: "🤖" },
  { label: "Claude", url: "https://claude.ai", icon: "🧡" },
];

function LinksWidget() {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {DEFAULT_LINKS.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/20 rounded-xl text-white/60 hover:text-white text-sm transition-all group"
        >
          <span className="text-base">{link.icon}</span>
          <span className="font-medium text-xs">{link.label}</span>
        </a>
      ))}
    </div>
  );
}

// ── BACKGROUND ───────────────────────────────────────────
const BG_GRADIENTS = [
  "from-[#0f0c29] via-[#1a1542] to-[#24243e]",
  "from-[#0d1b2a] via-[#1b2838] to-[#0d2137]",
  "from-[#1a0533] via-[#2d1052] to-[#1a0533]",
  "from-[#0b1220] via-[#162032] to-[#0b1220]",
  "from-[#07111d] via-[#0d2137] to-[#1a2a0d]",
];

// ── MAIN ─────────────────────────────────────────────────
export default function Home() {
  const [bg] = useState(() => BG_GRADIENTS[Math.floor(Math.random() * BG_GRADIENTS.length)]);
  const [panel, setPanel] = useState<"todo" | "pomodoro" | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <main
      className={`min-h-screen bg-gradient-to-br ${bg} flex flex-col relative overflow-hidden`}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-900/15 blur-[100px]" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-8 pt-6">
        <span className="text-white/25 text-sm font-mono tracking-widest">MOMENTUM</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPanel(panel === "pomodoro" ? null : "pomodoro")}
            className={`px-4 py-1.5 rounded-full text-xs transition-all border ${
              panel === "pomodoro"
                ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                : "border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
            }`}
          >
            🍅 Pomodoro
          </button>
          <button
            onClick={() => setPanel(panel === "todo" ? null : "todo")}
            className={`px-4 py-1.5 rounded-full text-xs transition-all border ${
              panel === "todo"
                ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                : "border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
            }`}
          >
            ✅ Việc cần làm
          </button>
        </div>
      </header>

      {/* Center */}
      <div className="flex-1 flex flex-col items-center justify-center gap-10 px-4 py-8 relative z-10">
        <div className="flex flex-col items-center gap-8 animate-fade-in">
          <Clock />
          <FocusWidget />
          <QuoteWidget />
          <LinksWidget />
        </div>
      </div>

      {/* Side panel */}
      {panel && (
        <aside className="fixed right-0 top-0 h-full w-80 bg-black/40 backdrop-blur-2xl border-l border-white/8 p-6 flex flex-col gap-6 z-20 animate-slide-up overflow-y-auto">
          <button
            onClick={() => setPanel(null)}
            className="self-end text-white/30 hover:text-white/70 transition-colors text-xl"
          >
            ×
          </button>
          {panel === "pomodoro" ? <PomodoroWidget /> : <TodoWidget />}
        </aside>
      )}

      {/* Footer */}
      <footer className="relative z-10 text-center pb-4">
        <p className="text-white/15 text-xs font-mono">
          {new Date().toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </footer>
    </main>
  );
}
