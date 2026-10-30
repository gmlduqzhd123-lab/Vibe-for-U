import { useState } from "react";
import type { Kind } from "./model";
import { kindNames } from "./model";
import { Icon } from "./ui";
import { SpeakButton } from "./Speak";
import { translate, useT } from "./i18n";
// 3~4학년이 글자를 많이 쓰지 않고 낱말 블록을 골라 요청문의 원문을 만든다.
type Tr = (text: string, vars?: Record<string, string | number>) => string;
const ko: Tr = (text, vars) => translate("ko", text, vars);
// t를 넘기면 화면 언어로 블록을 만든다(문장을 이을 때도 같은 t를 써야 한다).
export function blockGroups(
  kind: Kind,
  t: Tr = ko,
): { title: string; blocks: string[] }[] {
  const what: Record<Kind, [string[], string[]]> = {
    quiz: [
      [
        "답을 누르면 맞았는지 알려 줘요.",
        "점수를 보여 줘요.",
        "마지막에 결과를 보여 줘요.",
      ],
      [
        "같은 답을 여러 번 눌러도 점수는 한 번만 올라요.",
        "다시 시작하면 0점이 돼요.",
      ],
    ],
    story: [
      ["고른 길에 따라 다른 장면이 나와요.", "결말이 두 개 있어요."],
      ["모든 길은 있는 장면으로 가요.", "처음으로 돌아갈 수 있어요."],
    ],
    timer: [
      [
        "시작을 누르면 시간이 줄어요.",
        "멈췄다가 이어 갈 수 있어요.",
        "0초가 되면 알려 줘요.",
      ],
      [
        "시작을 여러 번 눌러도 하나만 돌아가요.",
        "시간은 0보다 작아지지 않아요.",
      ],
    ],
    pattern: [
      [
        "명령대로 칸을 칠해요.",
        "같은 명령을 반복해요.",
        "목표 모양과 비교해요.",
      ],
      ["판 끝에서 멈춰요.", "처음으로 누르면 빈 판이 돼요."],
    ],
  };
  return [
    {
      title: t("누가 쓰나요?"),
      blocks: [t("우리 반 친구가 쓸"), t("동생이 쓸"), t("선생님이 쓸")],
    },
    {
      title: t("무엇을 만들까요?"),
      blocks: [t("{kind}를 만들고 싶어요.", { kind: t(kindNames[kind]) })],
    },
    {
      title: t("누르면 어떻게 되나요?"),
      blocks: what[kind][0].map((b) => t(b)),
    },
    { title: t("꼭 지킬 약속"), blocks: what[kind][1].map((b) => t(b)) },
  ];
}
// 고른 블록을 묶음 순서대로 이어 한 문장으로 만든다.
export function blockSentence(kind: Kind, picked: string[], t: Tr = ko) {
  return blockGroups(kind, t)
    .flatMap((g) => g.blocks.filter((b) => picked.includes(b)))
    .join(" ");
}
export function BlockPrompt({
  kind,
  current,
  onInsert,
}: {
  kind: Kind;
  current: string;
  onInsert: (text: string) => void;
}) {
  const t = useT();
  const [picked, setPicked] = useState<string[]>([]);
  const sentence = blockSentence(kind, picked, t);
  return (
    <section className="block-prompt" aria-labelledby="block-prompt-title">
      <h3 id="block-prompt-title">{t("낱말 블록으로 요청 만들기")}</h3>
      <p className="small">
        {t(
          "블록을 눌러 고르고, 다시 누르면 빠져요. 다 고르면 아래 버튼으로 원문에 넣어요.",
        )}
      </p>
      {blockGroups(kind, t).map((g) => (
        <div
          className="block-group"
          role="group"
          aria-label={g.title}
          key={g.title}
        >
          <b>{g.title}</b>
          <div className="block-row">
            {g.blocks.map((b) => (
              <button
                key={b}
                type="button"
                className="block-chip"
                aria-pressed={picked.includes(b)}
                onClick={() =>
                  setPicked((p) =>
                    p.includes(b) ? p.filter((x) => x !== b) : [...p, b],
                  )
                }
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      ))}
      <p className="block-sentence" aria-live="polite">
        {sentence || t("아직 고른 블록이 없어요.")}
      </p>
      <div className="button-row">
        <button
          className="primary"
          disabled={!sentence}
          onClick={() => {
            onInsert(current.trim() ? `${current}\n${sentence}` : sentence);
            setPicked([]);
          }}
        >
          <Icon name="plus" />
          {t(current.trim() ? "원문에 이어 붙이기" : "이 문장을 원문으로 쓰기")}
        </button>
        {sentence ? (
          <SpeakButton text={sentence} label={t("만든 문장 듣기")} />
        ) : null}
      </div>
    </section>
  );
}
// 예상 칸에 넣을 문장 시작 블록
export const predictionStarters = [
  "이렇게 누르면",
  "이렇게 될 것 같아요.",
  "왜냐하면",
];
