import type { Work } from "./model";
import { initialPattern, patternMoves, stepPattern } from "./engines";
// 작품을 혼자 열리는 HTML 파일 하나로 만든다. 앱 없이 가족·친구에게 보여 줄 수 있다.
// 파일에는 작품 설정과 화면 글자만 담고, 실행 코드는 앱이 준비한 작은 실행기만 쓴다.
// 학생 글은 textContent로만 넣고, 외부 요청은 콘텐츠 보안 정책으로 막는다.
type Tr = (text: string, vars?: Record<string, string | number>) => string;
const PLAYER = String.raw`
(function () {
  var data = JSON.parse(document.getElementById("app-data").textContent);
  var c = data.config, T = data.texts, root = document.getElementById("app");
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = String(text);
    return e;
  }
  function button(text, onClick, cls) {
    var b = el("button", cls, text);
    b.type = "button";
    b.onclick = onClick;
    return b;
  }
  function fill(s, vars) {
    return s.replace(/\{(\w+)\}/g, function (all, k) {
      return k in vars ? String(vars[k]) : all;
    });
  }
  function clear() {
    while (root.firstChild) root.removeChild(root.firstChild);
  }
  function quiz() {
    var s = { i: 0, score: 0, answered: false, done: false, note: "" };
    function render() {
      clear();
      if (s.done) {
        root.appendChild(el("h2", null, T.result));
        root.appendChild(el("p", "big", fill(T.points, { n: s.score })));
        root.appendChild(button(T.restart, function () {
          s = { i: 0, score: c.resetScore ? 0 : s.score, answered: false, done: false, note: "" };
          render();
        }));
        return;
      }
      var q = c.questions[s.i];
      root.appendChild(el("p", "muted", fill(T.question, { i: s.i + 1, n: c.questions.length }) + " · " + fill(T.points, { n: s.score })));
      root.appendChild(el("h2", null, q.text));
      var row = el("div", "choices");
      q.choices.forEach(function (label, k) {
        row.appendChild(button(label, function () {
          var right = k === q.correct;
          if (right && (c.scoring === "attempt" || !s.answered)) s.score += c.points;
          s.answered = true;
          s.note = right ? c.correctFeedback : c.wrongFeedback;
          render();
        }));
      });
      root.appendChild(row);
      var note = el("p", "note", s.note);
      note.setAttribute("role", "status");
      root.appendChild(note);
      var next = button(s.i === c.questions.length - 1 ? T.finish : T.next, function () {
        if (s.i === c.questions.length - 1) s.done = true;
        else { s.i++; s.answered = false; s.note = ""; }
        render();
      }, "primary");
      next.disabled = !s.answered;
      root.appendChild(next);
    }
    render();
  }
  function story() {
    function show(id) {
      clear();
      var scene = c.scenes.filter(function (x) { return x.id === id; })[0];
      if (!scene) { root.appendChild(el("p", null, T.missing)); root.appendChild(button(T.restart, function () { show(c.start); })); return; }
      root.appendChild(el("h2", null, scene.title));
      root.appendChild(el("p", "story-text", scene.text));
      var row = el("div", "choices");
      scene.choices.forEach(function (ch) {
        row.appendChild(button(ch.label, function () { show(ch.to); }));
      });
      root.appendChild(row);
      if (scene.ending || !scene.choices.length) {
        root.appendChild(el("p", "note", T.ending));
        root.appendChild(button(T.restart, function () { show(c.start); }, "primary"));
      }
    }
    show(c.start);
  }
  function timer() {
    var left = c.seconds * 1000, deadline = 0, tick = 0, ended = false;
    var face = el("p", "clock"), msg = el("p", "note");
    msg.setAttribute("role", "status");
    var start = button(T.start, function () {
      if (tick || ended) return;
      deadline = Date.now() + left;
      tick = setInterval(update, 200);
      update();
    }, "primary");
    var pause = button(T.pause, function () {
      if (!tick) return;
      clearInterval(tick); tick = 0;
      left = Math.max(0, deadline - Date.now());
      update();
    });
    var reset = button(T.restart, function () {
      clearInterval(tick); tick = 0; ended = false;
      left = c.seconds * 1000; msg.textContent = ""; update();
    });
    function update() {
      var remain = tick ? Math.max(0, deadline - Date.now()) : left;
      face.textContent = fill(T.seconds, { n: Math.ceil(remain / 1000) });
      if (tick && remain === 0) {
        clearInterval(tick); tick = 0; left = 0; ended = true;
        if (c.showEnd) msg.textContent = c.endMessage || T.timeUp;
      }
    }
    var row = el("div", "choices");
    row.appendChild(start); row.appendChild(pause); row.appendChild(reset);
    root.appendChild(face); root.appendChild(row); root.appendChild(msg);
    update();
  }
  function pattern() {
    var frames = data.frames, at = 0, run = 0;
    var board = el("div", "board");
    board.style.gridTemplateColumns = "repeat(" + c.size + ", 1fr)";
    board.setAttribute("role", "img");
    var cells = {};
    for (var y = 0; y < c.size; y++) for (var x = 0; x < c.size; x++) {
      var id = x + "," + y, d = el("span", c.target.indexOf(id) >= 0 ? "target" : "");
      cells[id] = d; board.appendChild(d);
    }
    var status = el("p", "note");
    status.setAttribute("role", "status");
    function paint() {
      var painted = frames[at];
      Object.keys(cells).forEach(function (k) {
        cells[k].className = (c.target.indexOf(k) >= 0 ? "target " : "") + (painted.indexOf(k) >= 0 ? "painted" : "");
      });
      board.setAttribute("aria-label", fill(T.board, { n: c.size, p: painted.length }));
      status.textContent = at === frames.length - 1 ? (data.match ? T.match : T.differ) : "";
    }
    var draw = button(T.draw, function () {
      if (run) return;
      if (at === frames.length - 1) at = 0;
      run = setInterval(function () {
        if (at >= frames.length - 1) { clearInterval(run); run = 0; return; }
        at++; paint();
      }, 180);
    }, "primary");
    var reset = button(T.restart, function () { clearInterval(run); run = 0; at = 0; paint(); });
    var row = el("div", "choices");
    row.appendChild(draw); row.appendChild(reset);
    root.appendChild(board); root.appendChild(row); root.appendChild(status);
    paint();
  }
  ({ quiz: quiz, story: story, timer: timer, pattern: pattern })[c.kind]();
})();
`;
const STYLE = `
:root{color-scheme:light dark;--bg:#fbfaf6;--fg:#262320;--muted:#6b655f;--line:#d9d3c7;--accent:#2f6b4f}
@media (prefers-color-scheme:dark){:root{--bg:#1d1c1a;--fg:#f1eee8;--muted:#b6aea4;--line:#4a4640;--accent:#7cc39d}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.6 system-ui,"Malgun Gothic","Apple SD Gothic Neo",sans-serif}
main{max-width:640px;margin:0 auto;padding:24px 16px}h1{font-size:22px;margin:0 0 4px}h2{font-size:20px}
.muted,footer{color:var(--muted);font-size:14px}.big{font-size:32px;font-weight:700}.clock{font-size:48px;font-weight:700;margin:12px 0}
.choices{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}button{font:inherit;padding:10px 16px;border:1px solid var(--line);border-radius:10px;background:transparent;color:inherit;cursor:pointer}
button.primary{background:var(--accent);border-color:var(--accent);color:#fff}button:disabled{opacity:.45;cursor:not-allowed}button:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.note{min-height:1.6em;font-weight:600}.story-text{white-space:pre-wrap}
.board{display:grid;gap:3px;max-width:360px;aspect-ratio:1}.board span{border:1px solid var(--line);border-radius:4px}
.board span.target{outline:2px dashed var(--muted);outline-offset:-4px}.board span.painted{background:var(--accent)}
footer{margin-top:32px;border-top:1px solid var(--line);padding-top:12px}
`;
// </script> 같은 글자가 학생 글에 있어도 스크립트 밖으로 나가지 않게 바꾼다.
const safeJson = (v: unknown) =>
  JSON.stringify(v)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ]!,
  );
export function standaloneHtml(w: Work, t: Tr, lang: string) {
  const c = w.draft.config;
  const title = w.draft.title || t("제목 없는 작품");
  const extra: Record<string, unknown> = {};
  if (c.kind === "pattern") {
    // 패턴은 앱의 실행기로 미리 한 칸씩 그려 두고, 파일에서는 그 순서대로 보여 준다.
    const frames: string[][] = [];
    let s = initialPattern();
    frames.push(s.painted);
    for (let i = 0; i < patternMoves(c).length; i++) {
      s = stepPattern(c, s);
      frames.push(s.painted);
    }
    const last = new Set(s.painted);
    extra.frames = frames;
    extra.match =
      last.size === c.target.length && c.target.every((x) => last.has(x));
  }
  const texts = {
    result: t("결과"),
    points: t("{n}점"),
    question: t("문제 {i} / {n}"),
    next: t("다음 문제"),
    finish: t("결과 보기"),
    restart: t("↺ 처음으로"),
    missing: t("없는 장면이에요."),
    ending: t("이야기가 끝났어요."),
    start: t("시작"),
    pause: t("멈춤"),
    seconds: t("{n}초"),
    timeUp: t("시간이 끝났어요!"),
    draw: t("그리기"),
    board: t("{n}×{n} 판 · 칠한 칸 {p}개"),
    match: t("다 그렸어요. 목표 모양과 같아요!"),
    differ: t("다 그렸어요. 목표 모양과 달라요."),
  };
  const data = { config: c, texts, ...extra };
  return `<!doctype html>
<html lang="${lang === "en" ? "en" : "ko"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'">
<title>${escapeHtml(title)}</title>
<style>${STYLE}</style>
</head>
<body>
<main>
<h1>${escapeHtml(title)}</h1>
<p class="muted">${escapeHtml(t("뚝딱 바이브 공작소에서 만든 작은 앱"))}</p>
<div id="app" aria-live="polite"></div>
<footer>${escapeHtml(t("이 파일에는 작품 설정만 들어 있고 학습 기록은 들어 있지 않아요. 인터넷 없이 열려요."))}</footer>
</main>
<script type="application/json" id="app-data">${safeJson(data)}</script>
<script>${PLAYER}</script>
</body>
</html>
`;
}
