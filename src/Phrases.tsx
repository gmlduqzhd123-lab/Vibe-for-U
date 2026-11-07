import { useState } from "react";
import { APP_PREFIX, LIMITS } from "./model";
import { rubric } from "./data";
import { Icon } from "./ui";
import { useT } from "./i18n";
// 평가 의견 문장 모음: 과정 평가 의견에 자주 쓰는 문장을 눌러 넣는다.
// 기본 문장은 평가표 네 항목마다 '잘한 점'과 '다음 도움'이 있고, 교사 문장은 이 기기에만 둔다.
export const builtInPhrases: string[][] = [
  [
    "사용할 사람과 불편한 점을 분명하게 골랐어요.",
    "완료 조건을 한 가지 더 적어 보면 무엇을 확인할지 분명해져요.",
  ],
  [
    "누른 것과 앱이 기억하는 값을 연결해 설명했어요.",
    "값이 바뀌는 순간을 실행 기록에서 찾아 설명해 보세요.",
  ],
  [
    "예상과 실제 결과를 나란히 적고 고친 뒤 다시 검사했어요.",
    "고친 뒤 같은 검사를 한 번 더 해서 기록을 남겨 보세요.",
  ],
  [
    "바꾼 이유를 자기 말로 설명했어요.",
    "다른 친구의 문제에도 이 방법을 쓸 수 있는지 적어 보세요.",
  ],
];
const KEY = `${APP_PREFIX}phrases`;
export const PHRASE_LIMIT = 30;
function readMine(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw)
      ? raw
          .filter((x): x is string => typeof x === "string")
          .slice(0, PHRASE_LIMIT)
      : [];
  } catch {
    return [];
  }
}
function writeMine(list: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // 저장할 수 없으면 이번 화면에서만 쓴다.
  }
}
// 의견 끝에 문장을 한 줄로 붙인다(이미 있으면 넣지 않는다).
export function appendPhrase(note: string, phrase: string) {
  const text = note.trimEnd();
  if (text.split("\n").some((l) => l.trim() === phrase.trim())) return note;
  return (text ? `${text}\n` : "") + phrase;
}
export function PhraseBank({
  note,
  onChange,
}: {
  note: string;
  onChange: (note: string) => void;
}) {
  const t = useT();
  const [mine, setMine] = useState(readMine);
  const [draft, setDraft] = useState("");
  const put = (p: string) => {
    const next = appendPhrase(note, p);
    if (next.length <= LIMITS.text) onChange(next);
  };
  const save = (list: string[]) => {
    setMine(list);
    writeMine(list);
  };
  return (
    <details className="phrase-bank">
      <summary>{t("자주 쓰는 의견 문장")}</summary>
      {rubric.map((row, i) => (
        <div key={i} className="phrase-group">
          <b>{t(row[0])}</b>
          <div className="button-row">
            {builtInPhrases[i].map((p) => (
              <button
                key={p}
                type="button"
                className="phrase"
                onClick={() => put(t(p))}
              >
                {t(p)}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="phrase-group">
        <b>{t("내 문장 (이 기기에만 저장)")}</b>
        <div className="button-row">
          {mine.map((p, i) => (
            <span key={i} className="phrase-mine">
              <button type="button" className="phrase" onClick={() => put(p)}>
                {p}
              </button>
              <button
                type="button"
                className="text-button"
                aria-label={t("내 문장 「{p}」 지우기", { p })}
                onClick={() => save(mine.filter((_, k) => k !== i))}
              >
                <Icon name="trash" size={16} />
              </button>
            </span>
          ))}
        </div>
        <div className="phrase-add">
          <label className="field">
            <span>{t("새 문장")}</span>
            <input
              value={draft}
              maxLength={LIMITS.short}
              onChange={(e) => setDraft(e.target.value)}
            />
          </label>
          <button
            type="button"
            disabled={
              !draft.trim() ||
              mine.length >= PHRASE_LIMIT ||
              mine.includes(draft.trim())
            }
            onClick={() => {
              save([...mine, draft.trim()]);
              setDraft("");
            }}
          >
            <Icon name="plus" />
            {t("내 문장으로 저장")}
          </button>
        </div>
      </div>
    </details>
  );
}
