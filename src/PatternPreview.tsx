import { useState } from "react";
import {
  cell,
  dirNames,
  initialPattern,
  patternMatch,
  patternMoves,
  runPattern,
  stepPattern,
} from "./engines";
import type { PatternConfig } from "./model";
import { Icon, Pill } from "./ui";
import { useT } from "./i18n";
export function PatternBoard({
  size,
  painted = [],
  target = [],
  current,
  label,
}: {
  size: number;
  painted?: string[];
  target?: string[];
  current?: string;
  label: string;
}) {
  return (
    <div
      className="pattern-board"
      role="img"
      aria-label={label}
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
    >
      {Array.from({ length: size * size }, (_, i) => {
        const id = cell(i % size, Math.floor(i / size));
        return (
          <span
            key={id}
            className={[
              painted.includes(id) ? "painted" : "",
              target.includes(id) ? "target" : "",
              id === current ? "current" : "",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}
export function PatternPreview({
  config,
  onRun,
}: {
  config: PatternConfig;
  onRun: () => void;
}) {
  const t = useT();
  const [s, setS] = useState(initialPattern);
  const [showTarget, setShowTarget] = useState(true);
  const total = patternMoves(config).length;
  const finished = s.step >= total;
  const { missing, extra } = patternMatch(config, s.painted);
  return (
    <div className="preview-inner">
      <div className="preview-caption">
        <Pill tone="green">{t("실행 화면")}</Pill>
        <span>{t("준비된 패턴 그리기 템플릿")}</span>
      </div>
      <PatternBoard
        size={config.size}
        painted={s.painted}
        target={showTarget ? config.target : []}
        current={cell(s.x, s.y)}
        label={`${t("{n}×{n} 판 · 칠한 칸 {p}개 · 현재 위치 {at}", { n: config.size, p: s.painted.length, at: cell(s.x, s.y) })}${showTarget ? ` · ${t("점선은 목표 칸 {n}개", { n: config.target.length })}` : ""}`}
      />
      <label className="checkbox">
        <input
          type="checkbox"
          checked={showTarget}
          onChange={(e) => setShowTarget(e.target.checked)}
        />
        {t("목표 모양을 점선으로 보기")}
      </label>
      <div className="button-row">
        <button
          className="primary"
          disabled={finished}
          onClick={() => {
            onRun();
            setS((p) => runPattern(config, p));
          }}
        >
          <Icon name="play" />
          {t("모두 그리기")}
        </button>
        <button
          disabled={finished}
          onClick={() => {
            onRun();
            setS((p) => stepPattern(config, p));
          }}
        >
          {t("한 칸씩 그리기")}
        </button>
        <button
          onClick={() => {
            onRun();
            setS(initialPattern());
          }}
        >
          {t("↺ 처음으로")}
        </button>
      </div>
      <p className="timer-end" role="status">
        {finished
          ? missing.length || extra.length
            ? t("다 그렸어요. 목표와 달라요: 빠진 칸 {m}개, 더 칠한 칸 {e}개", {
                m: missing.length,
                e: extra.length,
              })
            : t("다 그렸어요. 목표 모양과 같아요!")
          : t("그리기 전에 어떤 모양이 나올지 예상해 보세요.")}
      </p>
      <details className="trace" open>
        <summary>{t("동작 설명 · 지금 앱이 기억하는 값")}</summary>
        <p>
          {t("명령 묶음을 {n}번 반복 → 한 칸씩 이동 →", { n: config.repeat })}{" "}
          {config.turn === "right"
            ? t("만약 다음 칸이 막혀 있으면 오른쪽으로 돌기")
            : t(
                config.edge === "stop"
                  ? "판 밖이면 멈추기"
                  : "판 밖이면 반대편으로 넘어가기",
              )}{" "}
          {t("→ 도착한 칸 칠하기")}
        </p>
        <dl>
          <div>
            <dt>{t("현재 위치")}</dt>
            <dd>{cell(s.x, s.y)}</dd>
          </div>
          <div>
            <dt>{t("칠한 칸")}</dt>
            <dd data-testid="painted">{s.painted.length}</dd>
          </div>
          <div>
            <dt>{t("이동")}</dt>
            <dd>
              {s.step} / {total}
            </dd>
          </div>
          <div>
            <dt>{t("넘어감 · 멈춤")}</dt>
            <dd>
              {s.wrapped} · {s.blocked}
            </dd>
          </div>
          {config.turn === "right" ? (
            <div>
              <dt>{t("조건으로 돈 횟수")}</dt>
              <dd>{s.turns}</dd>
            </div>
          ) : null}
        </dl>
        <p>{s.event}</p>
        <small>
          {t("명령:")}{" "}
          {config.commands
            .map((m) =>
              t("{dir} {n}칸", { dir: t(dirNames[m.dir]), n: m.count }),
            )
            .join(" → ")}
        </small>
      </details>
    </div>
  );
}
