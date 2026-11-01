import { translate } from "./i18n";
// 사람에게 보여 줄 오류. 한국어 문장을 열쇠로 들고 있다가 화면 언어로 바꿔 보여 준다.
// 값 가운데 what·path는 항목 이름(한국어 열쇠)이라 함께 바꾼다.
type Vars = Record<string, string | number>;
type Tr = (text: string, vars?: Vars) => string;
const NAMED = ["what", "path"];
function fill(t: Tr, key: string, vars: Vars) {
  const v = { ...vars };
  for (const k of NAMED) if (typeof v[k] === "string") v[k] = t(v[k] as string);
  return t(key, v);
}
export class AppError extends Error {
  constructor(
    readonly key: string,
    readonly vars: Vars = {},
  ) {
    super(fill((s, x) => translate("ko", s, x), key, vars));
  }
}
// 화면에 보여 줄 오류 문장. 브라우저가 만든 오류는 그대로 둔다.
export function errorText(e: unknown, t: Tr, fallback = "") {
  if (e instanceof AppError) return fill(t, e.key, e.vars);
  return e instanceof Error ? e.message : fallback;
}
