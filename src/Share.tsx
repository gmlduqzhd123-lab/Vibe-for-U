import { Icon } from "./ui";
import { useT } from "./i18n";
// 휴대전화·태블릿의 기본 공유 창(Web Share API)으로 파일을 메신저·메일·드라이브에 바로 보낸다.
// 파일 공유를 지원하지 않는 기기에서는 버튼을 숨기고, 내려받기 버튼을 그대로 쓴다.
const jsonFile = (name: string, text: string) =>
  new File([text], name, { type: "application/json" });
export function canShareFiles() {
  try {
    return (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [jsonFile("check.json", "{}")] })
    );
  } catch {
    return false;
  }
}
export function ShareButton({
  name,
  text,
  title,
  message,
  label = "공유로 보내기",
}: {
  name: string;
  // 누를 때 파일 내용을 만든다(백업이 너무 크면 오류를 알린다).
  text: () => string;
  title: string;
  message: (s: string) => void;
  label?: string;
}) {
  const t = useT();
  if (!canShareFiles()) return null;
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.share({ files: [jsonFile(name, text())], title });
          message(t("공유 창으로 파일을 보냈어요."));
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") return;
          message(
            `${t("공유하지 못했어요. 내려받기로 저장해 보내 주세요.")} ${e instanceof Error ? e.message : ""}`,
          );
        }
      }}
    >
      <Icon name="send" />
      {t(label)}
    </button>
  );
}
