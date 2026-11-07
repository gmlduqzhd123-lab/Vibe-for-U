import { useEffect, useMemo, useState } from "react";
import {
  englishEntries,
  originalEnglish,
  readEnglishFixes,
  sameSlots,
  saveEnglishFix,
  useT,
} from "./i18n";
import { loadEnglishMissions } from "./missionText";
import { downloadText } from "./storage";
import { Icon } from "./ui";
// 영어 번역 고치기: 자동 번역으로 넣은 영어 문장 가운데 어색한 것을 교사가 바로 고친다.
// 고친 문장은 이 기기에만 두고, 파일로 내보내 저장소의 번역표(src/i18nEn.ts)에 반영한다.
export const FIXES_FORMAT = "ttukttak-vibe-en-fixes";
const SHOW = 30;
export function TranslationFix({ message }: { message: (s: string) => void }) {
  const t = useT();
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [fixes, setFixes] = useState(readEnglishFixes);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  useEffect(() => {
    let alive = true;
    loadEnglishMissions().then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);
  const rows = useMemo(() => {
    if (!ready) return [];
    const q = query.trim().toLowerCase();
    const all = englishEntries();
    const hit = q
      ? all.filter(
          ([ko, en]) =>
            ko.toLowerCase().includes(q) || en.toLowerCase().includes(q),
        )
      : all.filter(([ko]) => ko in fixes);
    return hit.slice(0, SHOW);
  }, [ready, query, fixes]);
  const save = (ko: string) => {
    const text = (drafts[ko] ?? "").trim();
    if (!text) return;
    if (!sameSlots(ko, text)) {
      message(
        t(
          "고친 영어에도 한국어와 같은 {값} 자리가 있어야 해요. 중괄호 안 이름은 그대로 두세요.",
        ),
      );
      return;
    }
    saveEnglishFix(ko, text);
    setFixes(readEnglishFixes());
    setDrafts((d) => {
      const next = { ...d };
      delete next[ko];
      return next;
    });
    message(t("번역을 고쳤어요. 영어 화면에 바로 나와요."));
  };
  const count = Object.keys(fixes).length;
  return (
    <section className="panel translation-fix">
      <h2>{t("영어 번역 고치기")}</h2>
      <p className="small muted">
        {t(
          "영어 문장은 자동 번역으로 넣었어요. 수업에서 어색한 문장을 찾아 고치면 이 기기의 영어 화면에 바로 나와요. 고친 문장 파일을 저장소 관리자에게 보내면 모든 기기에 반영할 수 있어요.",
        )}
      </p>
      <label className="field">
        <span>{t("한국어나 영어로 찾기")}</span>
        <input
          type="search"
          value={query}
          placeholder={t("예: 다음 문제")}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <div className="button-row">
        <button
          type="button"
          disabled={!count}
          onClick={() =>
            downloadText(
              `뚝딱-영어-번역-고침-${new Date().toISOString().slice(0, 10)}.json`,
              JSON.stringify(
                { format: FIXES_FORMAT, version: 1, fixes },
                null,
                2,
              ),
              "application/json",
            )
          }
        >
          <Icon name="download" />
          {t("고친 문장 {n}개 파일로 받기", { n: count })}
        </button>
      </div>
      {!ready ? (
        <p role="status">{t("영어 번역표를 불러오고 있어요…")}</p>
      ) : !rows.length ? (
        <p className="small muted">
          {t(
            query.trim()
              ? "찾는 문장이 없어요."
              : "아직 고친 문장이 없어요. 위에서 고칠 문장을 찾아보세요.",
          )}
        </p>
      ) : (
        <ul className="fix-list">
          {rows.map(([ko, en]) => (
            <li key={ko} className={ko in fixes ? "fixed" : ""}>
              <p lang="ko">{ko}</p>
              {ko in fixes ? (
                <p className="small muted" lang="en">
                  {t("원래 번역: {en}", { en: originalEnglish(ko) })}
                </p>
              ) : null}
              <label className="field">
                <span>{t("영어 문장")}</span>
                <textarea
                  rows={2}
                  lang="en"
                  value={drafts[ko] ?? en}
                  onChange={(e) =>
                    setDrafts((d) => ({ ...d, [ko]: e.target.value }))
                  }
                />
              </label>
              <div className="button-row">
                <button
                  type="button"
                  className="primary"
                  disabled={drafts[ko] === undefined || drafts[ko] === en}
                  onClick={() => save(ko)}
                >
                  {t("고친 번역 저장")}
                </button>
                {ko in fixes ? (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      saveEnglishFix(ko, null);
                      setFixes(readEnglishFixes());
                      message(t("원래 번역으로 되돌렸어요."));
                    }}
                  >
                    {t("원래대로")}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
