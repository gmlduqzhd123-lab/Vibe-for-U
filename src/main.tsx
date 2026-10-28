import { createRoot } from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./ErrorBoundary";
import "./styles.css";
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);

// 홈 화면 설치·오프라인 열기 (배포판에서만)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  // 처음 설치할 때는 알리지 않고, 이미 쓰던 캐시가 새 배포본으로 바뀔 때만 알린다.
  const hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hadController) dispatchEvent(new Event("ttukttak:update"));
  });
  addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then((r) => r.update())
      .catch(() => {});
  });
}
