import type { Config, Mission } from "./model";
import { addTranslations, translate } from "./i18n";
import type { Lang } from "./i18n";
import type { MissionText } from "./missionsEn";
// 영어 미션 글은 영어 화면을 고를 때만 불러온다(한국어 사용자의 첫 화면을 가볍게).
let english: Record<string, MissionText> | null = null;
export async function loadEnglishMissions() {
  if (!english) {
    const [m, more] = await Promise.all([
      import("./missionsEn"),
      import("./i18nEn"),
    ]);
    addTranslations("en", more.en);
    english = m.missionsEn;
  }
  return english;
}
export const englishReady = () => english !== null;
// 화면 언어에 맞춘 미션. 번역을 아직 불러오지 않았거나 없으면 원래 미션을 쓴다.
// 시작 설정의 글(문제·선택지·장면·안내·버튼·조건 문구)을 화면 언어로 바꾼다. 이름표(id)는 그대로 둔다.
export function localizeConfig(c: Config, lang: Lang): Config {
  if (lang === "ko") return c;
  const t = (s: string) => translate(lang, s);
  if (c.kind === "quiz")
    return {
      ...c,
      questions: c.questions.map((q) => ({
        ...q,
        text: t(q.text),
        choices: q.choices.map(t),
      })),
      correctFeedback: t(c.correctFeedback),
      wrongFeedback: t(c.wrongFeedback),
    };
  if (c.kind === "story")
    return {
      ...c,
      scenes: c.scenes.map((s) => ({
        ...s,
        title: t(s.title),
        text: t(s.text),
        choices: s.choices.map((ch) => ({ ...ch, label: t(ch.label) })),
      })),
    };
  if (c.kind === "timer") return { ...c, endMessage: t(c.endMessage) };
  if (c.kind === "rule")
    return {
      ...c,
      variable: t(c.variable),
      buttons: c.buttons.map((b) => ({ ...b, label: t(b.label) })),
      rules: c.rules.map((r) => ({ ...r, message: t(r.message) })),
      otherwise: t(c.otherwise),
    };
  return c;
}
// 시작 설정에 들어 있는 사람이 읽는 글 모두(번역표 검사용)
export function configStrings(c: Config): string[] {
  if (c.kind === "quiz")
    return [
      ...c.questions.flatMap((q) => [q.text, ...q.choices]),
      c.correctFeedback,
      c.wrongFeedback,
    ];
  if (c.kind === "story")
    return c.scenes.flatMap((s) => [
      s.title,
      s.text,
      ...s.choices.map((ch) => ch.label),
    ]);
  if (c.kind === "timer") return [c.endMessage];
  if (c.kind === "rule")
    return [
      c.variable,
      ...c.buttons.map((b) => b.label),
      ...c.rules.map((r) => r.message),
      c.otherwise,
    ];
  return [];
}
export function localizeMission(m: Mission, lang: Lang): Mission {
  const en = lang === "en" ? english?.[m.id] : undefined;
  if (!en) return m;
  return {
    ...m,
    ...en,
    starter: localizeConfig(m.starter, lang),
    guide: `Predict first, then run it. ${en.task}`,
    completion: `Record a prediction → check ${en.tests.map((t) => t.label).join(", ")} yourself → explain the fix and how it works`,
  };
}
