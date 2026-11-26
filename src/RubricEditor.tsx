import { useRef, useState } from "react";
import {
  RUBRIC_FORMAT,
  defaultRubric,
  isCustomRubric,
  resetRubric,
  rubric,
  saveRubric,
} from "./lessonData";
import { TRANSLATION_EVENT, useT } from "./i18n";
import { downloadText } from "./storage";
import { Field, Icon } from "./ui";
// 평가 기준 맞춤: 과정 평가표 네 항목의 이름과 단계 설명을 학교 기준에 맞게 고쳐 이 기기에 저장하고,
// 파일로 내보내 동료 교사와 나눈다. 학생 기기는 파일 가져오기로 같은 평가표를 쓸 수 있다.
const levels = ["시작 단계", "수행 단계", "설명·적용 단계"];
export function RubricEditor({ message }: { message: (s: string) => void }) {
  const t = useT();
  const [rows, setRows] = useState(() => rubric.map((r) => [...r]));
  const [custom, setCustom] = useState(isCustomRubric);
  const input = useRef<HTMLInputElement>(null);
  // 저장한 평가표를 이미 열린 화면(위의 표, 평가 카드)에도 바로 보이게 한다.
  const redraw = () => dispatchEvent(new Event(TRANSLATION_EVENT));
  const set = (i: number, k: number, v: string) =>
    setRows(
      rows.map((r, a) => (a === i ? r.map((c, b) => (b === k ? v : c)) : r)),
    );
  const store = (next: unknown, done: string) => {
    try {
      saveRubric(next);
      setRows(rubric.map((r) => [...r]));
      setCustom(true);
      redraw();
      message(done);
    } catch {
      message(
        t(
          "평가표를 저장하지 못했어요. 네 항목의 이름과 세 단계를 모두 적어 주세요.",
        ),
      );
    }
  };
  return (
    <details className="panel rubric-editor no-print">
      <summary>
        {t(
          custom
            ? "평가표 고쳐 쓰기 · 지금 이 기기는 고친 평가표를 써요"
            : "평가표 고쳐 쓰기 · 우리 학교 기준에 맞추기",
        )}
      </summary>
      <p className="small muted">
        {t(
          "항목 네 개의 이름과 단계 설명을 고칠 수 있어요. 항목 수와 단계 수는 평가 기록과 맞아야 해서 바꾸지 않아요. 고친 평가표는 이 기기의 평가 화면·포트폴리오·CSV에 쓰여요.",
        )}
      </p>
      {rows.map((row, i) => (
        <fieldset className="rule-edit" key={i}>
          <legend>{t("항목 {n}", { n: i + 1 })}</legend>
          <Field
            label={t("항목 {n} 이름", { n: i + 1 })}
            max={200}
            value={row[0]}
            onChange={(v) => set(i, 0, v)}
          />
          {levels.map((name, k) => (
            <Field
              key={k}
              area
              label={t("항목 {n} · {level}", { n: i + 1, level: t(name) })}
              max={200}
              value={row[k + 1]}
              onChange={(v) => set(i, k + 1, v)}
            />
          ))}
        </fieldset>
      ))}
      <div className="button-row">
        <button
          type="button"
          className="primary"
          onClick={() => store(rows, t("고친 평가표를 이 기기에 저장했어요."))}
        >
          {t("평가표 저장")}
        </button>
        <button
          type="button"
          onClick={() =>
            downloadText(
              "뚝딱-평가표.json",
              JSON.stringify(
                { format: RUBRIC_FORMAT, version: 1, rubric: rows },
                null,
                2,
              ),
              "application/json",
            )
          }
        >
          <Icon name="download" />
          {t("평가표 파일 내려받기")}
        </button>
        <button type="button" onClick={() => input.current?.click()}>
          <Icon name="folder" />
          {t("평가표 파일 가져오기")}
        </button>
        <button
          type="button"
          className="text-button"
          disabled={!custom}
          onClick={() => {
            resetRubric();
            setRows(defaultRubric.map((r) => [...r]));
            setCustom(false);
            redraw();
            message(t("기본 평가표로 되돌렸어요."));
          }}
        >
          {t("기본 평가표로 되돌리기")}
        </button>
        <input
          ref={input}
          className="sr-only"
          tabIndex={-1}
          type="file"
          accept=".json,application/json"
          aria-label={t("평가표 JSON 파일")}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (input.current) input.current.value = "";
            if (!file) return;
            try {
              const data = JSON.parse(await file.text());
              if (data?.format !== RUBRIC_FORMAT || data.version !== 1)
                throw new Error("format");
              store(data.rubric, t("평가표 파일을 가져와 저장했어요."));
            } catch {
              message(t("평가표 파일을 골라 주세요."));
            }
          }}
        />
      </div>
    </details>
  );
}
