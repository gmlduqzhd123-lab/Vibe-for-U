import { createContext, useContext } from "react";
import type { Work } from "./model";
// 작품을 기기 밖으로 보내기 전에(파일·공유·QR·앱 파일) 개인정보처럼 보이는 글이 있는지 확인한다.
// 앱이 확인 창을 띄우고, 학생이 '그대로 보내기'를 누르면 send를 실행한다.
export type SendGuard = (works: Work[], send: () => void) => void;
export const SendGuardContext = createContext<SendGuard>((_, send) => send());
export const useSendGuard = () => useContext(SendGuardContext);
