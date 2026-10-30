import type { Mission } from "./model";
import { addTranslations } from "./i18n";
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
export function localizeMission(m: Mission, lang: Lang): Mission {
  const en = lang === "en" ? english?.[m.id] : undefined;
  if (!en) return m;
  return {
    ...m,
    ...en,
    guide: `Predict first, then run it. ${en.task}`,
    completion: `Record a prediction → check ${en.tests.map((t) => t.label).join(", ")} yourself → explain the fix and how it works`,
  };
}
