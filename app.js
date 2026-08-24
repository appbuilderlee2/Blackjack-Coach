const VERSION = "1.0.0";
const STORAGE_KEY = "blackjack-coach-state-v1";
const SUITS = ["♠", "♥", "♦", "♣"];

const defaultState = {
  view: "home",
  records: [],
  streak: 0,
  rating: 1200,
  haptics: true,
  sound: false,
  installPrompt: null,
  session: null
};

let state = loadState();

function loadState() {
  try {
    return { ...defaultState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"), view: "home", session: null, installPrompt: null };
  } catch { return { ...defaultState }; }
}

function saveState() {
  const { records, streak, rating, haptics, sound } = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ records, streak, rating, haptics, sound }));
}

function vibrate(pattern = 18) {
  if (state.haptics && navigator.vibrate) navigator.vibrate(pattern);
}

function toast(message) {
  const el = document.querySelector("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2100);
}

function icon(name) {
  const paths = {
    home: '<path d="M3 11.5 12 4l9 7.5V21h-6v-6H9v6H3z"/>',
    train: '<path d="m3 10 9-5 9 5-9 5-9-5Zm3 3.5V18c3 2.5 9 2.5 12 0v-4.5"/>',
    stats: '<path d="M5 20V10h4v10H5Zm5 0V4h4v16h-4Zm5 0v-7h4v7h-4Z"/>',
    settings: '<path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"/><path d="m19.4 15 .1.1 1.4 2.4-2.4 2.4-2.4-1.4-.2-.1a8 8 0 0 1-1.5.9V22H9v-2.8a8 8 0 0 1-1.5-.9l-.2.1-2.4 1.4-2.4-2.4L4 15.1l.1-.2a8 8 0 0 1-.9-1.5H.5V10h2.8a8 8 0 0 1 .9-1.5L4 8.3 2.6 5.9l2.4-2.4L7.4 5l.2.1A8 8 0 0 1 9 4.2V1.5h3.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    back: '<path d="m15 18-6-6 6-6"/>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ""}</svg>`;
}

function glyph(name) {
  const paths = {
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H4v1a4 4 0 0 0 4 4m8-5h4v1a4 4 0 0 1-4 4m-4 2v4m-4 3h8m-6-3h4"/>',
    flame: '<path d="M12 22c4 0 7-3 7-7 0-5-3-8-5-11 0 3-2 5-4 6 0-2-1-4-2-5-2 3-3 6-3 10 0 4 3 7 7 7Z"/><path d="M9 18c0-2 1-3 3-5 0 2 3 3 3 5a3 3 0 0 1-6 0Z"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6m-3 0v3m7 2 2-2"/>',
    count: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 7h8M8 12h2m4 0h2m-8 4h2m4 0h2"/>',
    chart: '<path d="M5 20V11h3v9H5Zm5.5 0V5h3v15h-3Zm5.5 0v-7h3v7h-3Z"/>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}

function brandMark() {
  return `<svg class="brand-mark" viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M11 23 32 13l21 10v17c0 9-7 16-21 21C18 56 11 49 11 40V23Z" stroke="currentColor" stroke-width="3"/><path d="m20 16 5-8 7 7 7-7 5 8" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M32 25c-5 5-11 9-11 15a7 7 0 0 0 10 6l-3 7h8l-3-7a7 7 0 0 0 10-6c0-6-6-10-11-15Z" fill="currentColor"/></svg>`;
}

function nav(active) {
  const items = [["home","Home"],["train","Train"],["stats","Stats"],["settings","Settings"]];
  return `<nav class="bottom-nav" aria-label="Main navigation">${items.map(([id,label]) => `<button class="nav-btn ${active === id ? "active" : ""}" data-nav="${id}">${icon(id)}<span>${label}</span></button>`).join("")}</nav>`;
}

function accuracy() {
  if (!state.records.length) return 85;
  const correct = state.records.reduce((n, r) => n + r.correct, 0);
  const total = state.records.reduce((n, r) => n + r.total, 0);
  return total ? Math.round(correct / total * 100) : 0;
}

function home() {
  const acc = accuracy();
  return `<main class="shell screen">
    <header class="topbar"><div class="brand">${brandMark()}<div class="brand-name">Blackjack <em>Coach</em></div></div><button class="icon-btn" data-nav="settings" aria-label="Open settings">${icon("user")}</button></header>
    <div class="home-layout">
      <section class="metrics" aria-label="Progress summary">
        <div class="metric"><div class="metric-icon">${glyph("trophy")}</div><div><span class="metric-label">Skill Rating</span><strong class="metric-value">${state.rating}</strong><span class="metric-foot">${state.rating >= 1400 ? "Skilled" : state.rating >= 1250 ? "Intermediate" : "Developing"}</span></div></div>
        <div class="metric"><div class="metric-icon">${glyph("flame")}</div><div><span class="metric-label">Daily Streak</span><strong class="metric-value">${state.streak}</strong><span class="metric-foot">${state.streak === 1 ? "Day" : "Days"}</span></div></div>
      </section>
      <section class="hero-card">
        <div class="hero-row"><div class="card-stack"><div class="mini-card back">10</div><div class="mini-card front">A <span>♠</span></div></div><div><h2>Basic Strategy</h2><p>Master correct plays for every hand and rule set. Build a winning foundation.</p></div></div>
        <button class="primary" data-mode="strategy">Start Training <span aria-hidden="true">→</span></button>
      </section>
      <section class="mode-grid" aria-label="Training modes">
        <button class="mode-card" data-mode="count"><span class="mode-symbol">${glyph("count")}</span><span class="mode-title">Card Count</span></button>
        <button class="mode-card" data-mode="speed"><span class="mode-symbol">${glyph("timer")}</span><span class="mode-title">Speed Drill</span></button>
        <button class="mode-card" data-nav="stats"><span class="mode-symbol">${glyph("chart")}</span><span class="mode-title">Statistics</span></button>
      </section>
      <section class="panel performance">
        <div class="panel-head"><h2>Recent Performance</h2><span>Accuracy</span></div>
        <div class="performance-body"><div class="ring" style="--pct:${acc}"><strong>${acc}%</strong></div><div class="bars" aria-label="Recent accuracy chart">${[52,35,60,47,58,76,63].map(h=>`<i class="bar" style="--h:${h}%"></i>`).join("")}</div></div>
      </section>
    </div>${nav("home")}</main>`;
}

function randomFrom(items) { return items[Math.floor(Math.random() * items.length)]; }
function makeCard(rank) { return { rank, suit: randomFrom(SUITS) }; }
function cardHtml(card, small = false) {
  const red = card.suit === "♥" || card.suit === "♦";
  return `<div class="playing-card ${red ? "red" : ""} ${small ? "small" : ""}"><span>${card.rank}</span><span class="suit">${card.suit}</span></div>`;
}

const strategyScenarios = [
  { player:["10","6"], dealer:"10", answer:"Hit", why:"Hard 16 should hit against a dealer 10." },
  { player:["A","7"], dealer:"9", answer:"Hit", why:"Soft 18 should hit against a dealer 9." },
  { player:["8","8"], dealer:"10", answer:"Split", why:"Always split eights; two new hands improve the position." },
  { player:["A","8"], dealer:"6", answer:"Stand", why:"Soft 19 is strong enough to stand." },
  { player:["10","2"], dealer:"3", answer:"Hit", why:"Hard 12 hits against dealer 2 or 3." },
  { player:["9","9"], dealer:"7", answer:"Stand", why:"Stand on 18 against a dealer 7." },
  { player:["5","6"], dealer:"6", answer:"Double", why:"Double hard 11 against a dealer 6." },
  { player:["A","6"], dealer:"5", answer:"Double", why:"Double soft 17 against dealer 3–6 when allowed." },
  { player:["7","7"], dealer:"8", answer:"Hit", why:"Hard 14 should hit against a dealer 8." },
  { player:["10","10"], dealer:"6", answer:"Stand", why:"Never split tens in standard basic strategy." }
];

function startSession(mode) {
  if (mode === "strategy") state.session = { mode, index:0, total:10, correct:0, scenario: randomFrom(strategyScenarios), answered:false };
  if (mode === "count") state.session = { mode, index:0, total:12, correct:0, card: randomCountCard(), answered:false };
  if (mode === "speed") state.session = { mode, cards: Array.from({length:20}, randomCountCard), shown:0, running:0, input:"", started:Date.now(), finished:false };
  state.view = "training";
  render();
}

function randomCountCard() { return makeCard(randomFrom(["2","3","4","5","6","7","8","9","10","J","Q","K","A"])); }
function hilo(rank) { if (["2","3","4","5","6"].includes(rank)) return 1; if (["10","J","Q","K","A"].includes(rank)) return -1; return 0; }

function trainingHeader(title, current, total) {
  const pct = Math.round(current / total * 100);
  return `<header class="screen-head"><button class="back-btn" data-nav="home" aria-label="Back">${icon("back")}</button><h1 class="screen-title">${title}</h1><span class="screen-progress">${current}/${total}</span></header><div class="progress-track"><div class="progress-fill" style="--w:${pct}%"></div></div>`;
}

function strategyView(s) {
  const player = s.scenario.player.map(rank => makeCard(rank));
  if (!s.renderCards) s.renderCards = player;
  const dealer = s.renderDealer || (s.renderDealer = makeCard(s.scenario.dealer));
  const answers = ["Hit", "Stand", "Double", "Split"];
  return `<main class="shell screen">${trainingHeader("Basic Strategy", s.index + 1, s.total)}
    <section class="question-wrap"><p class="question-kicker">What is the right play?</p><h2 class="question-title">Choose your action</h2>
      <div class="table-area"><div class="dealer-label">Dealer</div><div class="playing-cards">${cardHtml(dealer)}</div><div class="hand-label">Your hand</div><div class="playing-cards">${s.renderCards.map(c=>cardHtml(c, true)).join("")}</div></div>
      <div class="answer-grid">${answers.map(a=>`<button class="answer-btn ${s.answered && a === s.scenario.answer ? "correct" : ""} ${s.answered && a === s.chosen && a !== s.scenario.answer ? "wrong" : ""}" data-answer="${a}" ${s.answered ? "disabled" : ""}>${a}</button>`).join("")}</div>
      <div class="feedback">${s.answered ? `<strong>${s.chosen === s.scenario.answer ? "Correct." : `Correct answer: ${s.scenario.answer}.`}</strong> ${s.scenario.why}<button class="primary" data-next>Next hand</button>` : "Choose the best move using standard multi-deck basic strategy."}</div>
    </section></main>`;
}

function countView(s) {
  const value = hilo(s.card.rank);
  const labels = [[-1,"−1"],[0,"0"],[1,"+1"]];
  return `<main class="shell screen">${trainingHeader("Card Count", s.index + 1, s.total)}
    <section class="question-wrap"><p class="question-kicker">Hi-Lo system</p><h2 class="question-title">What does this card count as?</h2>
      <div class="table-area"><div class="playing-cards">${cardHtml(s.card)}</div></div>
      <div class="answer-grid count">${labels.map(([n,l])=>`<button class="answer-btn ${s.answered && n === value ? "correct" : ""} ${s.answered && n === s.chosen && n !== value ? "wrong" : ""}" data-count-answer="${n}" ${s.answered ? "disabled" : ""}>${l}</button>`).join("")}</div>
      <div class="feedback">${s.answered ? `<strong>${s.chosen === value ? "Correct." : `Correct answer: ${value > 0 ? "+1" : value}.`}</strong> ${value === 1 ? "Low cards 2–6 add one." : value === 0 ? "Neutral cards 7–9 do not change the count." : "Tens, faces and aces subtract one."}<button class="primary" data-next>Next card</button>` : "Select −1, 0 or +1."}</div>
    </section></main>`;
}

function speedView(s) {
  const current = s.cards[Math.min(s.shown, s.cards.length - 1)];
  return `<main class="shell screen">${trainingHeader("Speed Drill", Math.min(s.shown + 1, s.cards.length), s.cards.length)}
    <section class="question-wrap"><p class="question-kicker">Running count</p><h2 class="question-title">${s.finished ? "Enter the final count" : "Count the shoe"}</h2>
      <div class="table-area"><div class="playing-cards">${cardHtml(current)}</div><div class="subtle">${s.finished ? "All 20 cards shown" : "Tap Next after counting this card"}</div>${s.finished ? `<div class="speed-count">${s.input || "0"}</div>` : `<button class="primary" data-speed-next>${s.shown === s.cards.length - 1 ? "Finish cards" : "Next card"}</button>`}</div>
      ${s.finished ? `<div class="keypad">${[1,2,3,4,5,6,7,8,9,"±",0,"⌫"].map(k=>`<button class="key" data-key="${k}">${k}</button>`).join("")}<button class="key done" data-speed-submit>Done</button></div>` : ""}
    </section></main>`;
}

function training() {
  const s = state.session;
  if (!s) return home();
  if (s.mode === "strategy") return strategyView(s);
  if (s.mode === "count") return countView(s);
  return speedView(s);
}

function completeSession(mode, correct, total) {
  const percent = Math.round(correct / total * 100);
  const today = new Date().toISOString().slice(0,10);
  const last = state.records[0]?.date;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
  if (last !== today) state.streak = last === yesterday ? state.streak + 1 : 1;
  state.rating = Math.max(900, state.rating + Math.round((percent - 70) / 2));
  state.records.unshift({ id: Date.now(), mode, correct, total, percent, date: today });
  state.records = state.records.slice(0,30);
  saveState();
  state.session = null;
  state.view = "stats";
  render();
  toast(`${percent}% complete — results saved`);
}

function stats() {
  const acc = accuracy();
  const totalHands = state.records.reduce((n,r)=>n+r.total,0);
  const best = state.records.length ? Math.max(...state.records.map(r=>r.percent)) : 0;
  const recent = state.records.slice(0,7).reverse();
  return `<main class="shell screen"><header class="topbar"><div><p class="eyeline">See the count work</p><h1>Statistics</h1><p class="subtle">Your training progress, stored on this device.</p></div></header>
    <section class="stats-grid"><div class="stat-box"><span class="subtle">Accuracy</span><strong>${acc}%</strong></div><div class="stat-box"><span class="subtle">Hands Played</span><strong>${totalHands}</strong></div><div class="stat-box"><span class="subtle">Best Session</span><strong>${best}%</strong></div><div class="stat-box"><span class="subtle">Skill Rating</span><strong>${state.rating}</strong></div></section>
    <section class="panel performance"><div class="panel-head"><h2>Accuracy over time</h2><span>7 recent</span></div><div class="chart">${(recent.length ? recent : [{percent:30},{percent:42},{percent:55},{percent:68},{percent:74},{percent:82},{percent:85}]).map((r,i)=>`<i class="chart-col" style="--h:${Math.max(8,r.percent)}%"><span>${i+1}</span></i>`).join("")}</div></section>
    <section class="panel performance"><div class="panel-head"><h2>Recent sessions</h2><span>${state.records.length}</span></div><ul class="history">${state.records.length ? state.records.slice(0,8).map(r=>`<li><div><strong>${r.mode === "strategy" ? "Basic Strategy" : r.mode === "count" ? "Card Count" : "Speed Drill"}</strong><small>${r.date} · ${r.correct}/${r.total} correct</small></div><span class="score-good">${r.percent}%</span></li>`).join("") : `<li><div><strong>No sessions yet</strong><small>Complete a drill to see it here.</small></div></li>`}</ul></section>${nav("stats")}</main>`;
}

function trainHub() {
  return `<main class="shell screen"><header class="topbar"><div><p class="eyeline">Choose your drill</p><h1>Train</h1><p class="subtle">Build accuracy first, then add speed.</p></div></header>
    <section class="hero-card"><div class="hero-row"><div class="card-stack"><div class="mini-card back">10</div><div class="mini-card front">A <span>♠</span></div></div><div><h2>Basic Strategy</h2><p>10 adaptive hands with instant feedback.</p></div></div><button class="primary" data-mode="strategy">Start Training</button></section>
    <section class="panel performance"><div class="panel-head"><h2>Card Count</h2><span>12 cards</span></div><p class="subtle">Learn the Hi-Lo value for every rank.</p><button class="primary" data-mode="count">Start Card Count</button></section>
    <section class="panel performance"><div class="panel-head"><h2>Speed Drill</h2><span>20 cards</span></div><p class="subtle">Keep a running count through a rapid shoe.</p><button class="primary" data-mode="speed">Start Speed Drill</button></section>${nav("train")}</main>`;
}

function settings() {
  return `<main class="shell screen"><header class="topbar"><div><p class="eyeline">Preferences</p><h1>Settings</h1><p class="subtle">Tune feedback and manage local progress.</p></div>${state.installPrompt ? `<button class="install" data-install>Install App</button>` : ""}</header>
    <section class="panel settings-list"><div class="setting-row"><div class="setting-label"><strong>Haptic feedback</strong><small>Vibrate on answers</small></div><button class="switch ${state.haptics ? "on" : ""}" data-setting="haptics" role="switch" aria-checked="${state.haptics}"></button></div><div class="setting-row"><div class="setting-label"><strong>Sound</strong><small>Reserved for future audio cues</small></div><button class="switch ${state.sound ? "on" : ""}" data-setting="sound" role="switch" aria-checked="${state.sound}"></button></div><div class="setting-row"><div class="setting-label"><strong>Version</strong><small>Blackjack Coach PWA</small></div><strong>${VERSION}</strong></div></section>
    <button class="danger" data-reset>Delete all training records</button><p class="legal">Training and educational simulator only. No real-money gambling or real-world winnings. Strategy examples use common multi-deck rules and may vary with table rules.</p>${nav("settings")}</main>`;
}

function render() {
  const root = document.querySelector("#app");
  root.innerHTML = state.view === "home" ? home() : state.view === "train" ? trainHub() : state.view === "training" ? training() : state.view === "stats" ? stats() : settings();
  bind();
}

function bind() {
  document.querySelectorAll("[data-nav]").forEach(el => el.addEventListener("click", () => { state.view = el.dataset.nav; if (state.view !== "training") state.session = null; render(); }));
  document.querySelectorAll("[data-mode]").forEach(el => el.addEventListener("click", () => startSession(el.dataset.mode)));
  document.querySelectorAll("[data-answer]").forEach(el => el.addEventListener("click", () => answerStrategy(el.dataset.answer)));
  document.querySelectorAll("[data-count-answer]").forEach(el => el.addEventListener("click", () => answerCount(Number(el.dataset.countAnswer))));
  document.querySelector("[data-next]")?.addEventListener("click", nextQuestion);
  document.querySelector("[data-speed-next]")?.addEventListener("click", speedNext);
  document.querySelectorAll("[data-key]").forEach(el => el.addEventListener("click", () => speedKey(el.dataset.key)));
  document.querySelector("[data-speed-submit]")?.addEventListener("click", speedSubmit);
  document.querySelectorAll("[data-setting]").forEach(el => el.addEventListener("click", () => { const key = el.dataset.setting; state[key] = !state[key]; saveState(); render(); }));
  document.querySelector("[data-reset]")?.addEventListener("click", resetRecords);
  document.querySelector("[data-install]")?.addEventListener("click", installApp);
}

function answerStrategy(answer) {
  const s = state.session; if (!s || s.answered) return;
  s.chosen = answer; s.answered = true; if (answer === s.scenario.answer) s.correct++;
  vibrate(answer === s.scenario.answer ? 15 : [20,40,20]); render();
}

function answerCount(answer) {
  const s = state.session; if (!s || s.answered) return;
  s.chosen = answer; s.answered = true; if (answer === hilo(s.card.rank)) s.correct++;
  vibrate(answer === hilo(s.card.rank) ? 15 : [20,40,20]); render();
}

function nextQuestion() {
  const s = state.session; s.index++;
  if (s.index >= s.total) return completeSession(s.mode, s.correct, s.total);
  s.answered = false; delete s.chosen;
  if (s.mode === "strategy") { s.scenario = randomFrom(strategyScenarios); delete s.renderCards; delete s.renderDealer; }
  else s.card = randomCountCard();
  render();
}

function speedNext() {
  const s = state.session; s.running += hilo(s.cards[s.shown].rank); s.shown++;
  if (s.shown >= s.cards.length) { s.shown = s.cards.length - 1; s.finished = true; }
  vibrate(8); render();
}

function speedKey(key) {
  const s = state.session;
  if (key === "⌫") s.input = s.input.slice(0,-1);
  else if (key === "±") s.input = s.input.startsWith("-") ? s.input.slice(1) : `-${s.input || ""}`;
  else if (s.input.replace("-","").length < 3) s.input += key;
  render();
}

function speedSubmit() {
  const s = state.session; const correct = Number(s.input || 0) === s.running ? 20 : 0;
  completeSession("speed", correct, 20);
}

function resetRecords() {
  if (!confirm("Delete all training records and reset your rating?")) return;
  state.records = []; state.rating = 1200; state.streak = 0; saveState(); render(); toast("Training records deleted");
}

async function installApp() {
  if (!state.installPrompt) return;
  state.installPrompt.prompt(); await state.installPrompt.userChoice; state.installPrompt = null; render();
}

window.addEventListener("beforeinstallprompt", event => { event.preventDefault(); state.installPrompt = event; if (state.view === "settings") render(); });
window.addEventListener("appinstalled", () => toast("Blackjack Coach installed"));

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
render();
