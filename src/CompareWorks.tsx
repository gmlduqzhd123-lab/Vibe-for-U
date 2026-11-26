import "./late.css";
import { useState } from "react";
import type { Work } from "./model";
import { kindNames } from "./model";
import { compareSnapshots, configSummary } from "./learning";
import { Preview } from "./Preview";
import { Empty, Pill } from "./ui";
import { useT } from "./i18n";
import type { Navigate } from "./Pages";
// 작품 나란히 비교: 내 작품 두 개를 골라 설정이 어떻게 다른지 보고, 나란히 실행해 본다.
// (작업실의 버전 비교는 한 작품 안에서만 된다.) 여기서 실행한 것은 작품에 기록하지 않는다.
export function CompareWorks({ works, go }: { works: Work[]; go: Navigate }) {
  const t = useT();
  const list = [...works].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  const [aId, setA] = useState(list[0]?.id ?? "");
  const [bId, setB] = useState(list[1]?.id ?? "");
  const a = list.find((w) => w.id === aId);
  const b = list.find((w) => w.id === bId);
  const name = (w: Work) =>
    `${w.draft.title || t("제목 없는 작품")} · ${t(kindNames[w.kind])}`;
  const pick = (label: string, value: string, set: (id: string) => void) => (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => set(e.target.value)}>
        {list.map((w) => (
          <option key={w.id} value={w.id}>
            {name(w)}
          </option>
        ))}
      </select>
    </label>
  );
  if (list.length < 2)
    return (
      <Empty title={t("비교하려면 작품이 두 개 있어야 해요.")}>
        <button className="primary" onClick={() => go("missions")}>
          {t("미션 고르러 가기")}
        </button>
      </Empty>
    );
  const diff = a && b ? compareSnapshots(a.draft, b.draft, t) : null;
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("내 작품 선반")}</span>
          <h1>{t("작품 나란히 비교")}</h1>
          <p>
            {t(
              "작품 두 개를 골라 규칙이 어떻게 다른지 보고 나란히 눌러 봐요. 여기서 누른 것은 작품에 기록하지 않아요.",
            )}
          </p>
        </div>
        <div className="button-row">
          <button onClick={() => go("library")}>{t("작품 선반으로")}</button>
        </div>
      </div>
      <div className="panel compare-pick">
        <div className="form-grid">
          {pick(t("왼쪽 작품"), aId, setA)}
          {pick(t("오른쪽 작품"), bId, setB)}
        </div>
        {a && b && diff ? (
          a.id === b.id ? (
            <p role="status">
              {t("같은 작품이에요. 다른 작품을 골라 주세요.")}
            </p>
          ) : a.kind !== b.kind ? (
            <p role="status">
              {t(
                "종류가 다른 작품이에요. 규칙을 한 줄씩 비교하지는 못하지만 나란히 실행해 볼 수 있어요.",
              )}
            </p>
          ) : diff.sameConfig ? (
            <p role="status">{t("두 작품의 규칙이 같아요.")}</p>
          ) : (
            <p role="status">
              {t("규칙이 다른 곳 {n}줄을 아래에 표시했어요.", {
                n: diff.removed.length + diff.added.length,
              })}
            </p>
          )
        ) : null}
      </div>
      {a && b && diff && a.id !== b.id ? (
        <div className="compare-works">
          {[a, b].map((w, i) => {
            const changed = i === 0 ? diff.removed : diff.added;
            return (
              <section className="panel" key={w.id} aria-label={name(w)}>
                <h2>{w.draft.title || t("제목 없는 작품")}</h2>
                <Pill tone="paper">{t(kindNames[w.kind])}</Pill>
                <ul className="compare-rules">
                  {configSummary(w.draft.config, t).map((line, k) => (
                    <li
                      key={k}
                      className={
                        a.kind === b.kind && changed.includes(line)
                          ? "changed"
                          : ""
                      }
                    >
                      {a.kind === b.kind && changed.includes(line) ? (
                        <b>{t("다른 곳")} · </b>
                      ) : null}
                      {line}
                    </li>
                  ))}
                </ul>
                <Preview
                  key={`${w.id}:${w.draft.revision}`}
                  config={w.draft.config}
                  onRun={() => {}}
                />
                <button onClick={() => go(`work/${w.id}/2`)}>
                  {t("이 작품 열기")}
                </button>
              </section>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
