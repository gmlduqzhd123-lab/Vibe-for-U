import { useEffect, useState } from "react";
import { Icon } from "./ui";
// 브라우저의 음성 합성으로 안내 글을 소리 내어 읽는다. 지원하지 않으면 버튼을 숨긴다.
const supported = () =>
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  typeof SpeechSynthesisUtterance !== "undefined";
export function SpeakButton({
  text,
  label = "읽어 주기",
}: {
  text: string;
  label?: string;
}) {
  const [speaking, setSpeaking] = useState(false);
  useEffect(
    () => () => {
      if (speaking && supported()) speechSynthesis.cancel();
    },
    [speaking],
  );
  if (!supported()) return null;
  return (
    <button
      type="button"
      className="speak-button"
      aria-pressed={speaking}
      onClick={() => {
        speechSynthesis.cancel();
        if (speaking) return setSpeaking(false);
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "ko-KR";
        u.rate = 0.9;
        u.onend = u.onerror = () => setSpeaking(false);
        setSpeaking(true);
        speechSynthesis.speak(u);
      }}
    >
      <Icon name="sound" size={17} />
      {speaking ? "읽기 멈추기" : label}
    </button>
  );
}
