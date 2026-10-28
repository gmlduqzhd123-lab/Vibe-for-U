import { useCallback, useEffect, useState } from "react";
import { Icon, Pill } from "./ui";
// 브라우저가 저장 공간이 부족할 때 기록을 지우지 않도록 보존을 요청하고, 사용 용량을 보여 준다.
export type StorageHealth = {
  supported: boolean;
  persisted: boolean;
  usage: number;
  quota: number;
};
export async function readStorageHealth(): Promise<StorageHealth> {
  const s = typeof navigator !== "undefined" ? navigator.storage : undefined;
  if (!s?.persisted || !s.estimate)
    return { supported: false, persisted: false, usage: 0, quota: 0 };
  const [persisted, estimate] = await Promise.all([
    s.persisted(),
    s.estimate(),
  ]);
  return {
    supported: true,
    persisted,
    usage: estimate.usage ?? 0,
    quota: estimate.quota ?? 0,
  };
}
export function formatBytes(n: number) {
  if (n < 1024) return `${n}B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)}KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)}MB`;
  return `${(n / 1024 ** 3).toFixed(1)}GB`;
}
export function StoragePanel({ message }: { message: (s: string) => void }) {
  const [health, setHealth] = useState<StorageHealth | null>(null);
  const refresh = useCallback(
    () =>
      readStorageHealth()
        .then(setHealth)
        .catch(() => setHealth(null)),
    [],
  );
  useEffect(() => {
    void refresh();
  }, [refresh]);
  if (!health?.supported) return null;
  const ratio = health.quota ? health.usage / health.quota : 0;
  return (
    <section className="panel storage-health" aria-labelledby="storage-title">
      <div>
        <h2 id="storage-title">
          <Icon name="shield" /> 기록 보존 상태
        </h2>
        <p>
          {health.persisted ? (
            <Pill tone="green">보존 요청 허락됨</Pill>
          ) : (
            <Pill tone="orange">보존 요청 전</Pill>
          )}{" "}
          사용 중 <b>{formatBytes(health.usage)}</b>
          {health.quota ? ` / 사용 가능 약 ${formatBytes(health.quota)}` : ""}
        </p>
        <p className="small muted">
          {health.persisted
            ? "브라우저 저장 공간이 부족해도 이 앱의 기록을 먼저 지우지 않아요. 브라우저 데이터를 직접 삭제하면 지워지니 파일 백업도 함께 해 주세요."
            : "보존을 요청하지 않으면 저장 공간이 부족할 때 브라우저가 기록을 지울 수 있어요. 공용 기기라면 꼭 파일로도 백업해 주세요."}
        </p>
        {ratio > 0.8 ? (
          <p role="alert" className="warning">
            저장 공간이 거의 찼어요. 오래된 작품을 백업한 뒤 정리해 주세요.
          </p>
        ) : null}
      </div>
      {health.persisted ? null : (
        <button
          onClick={async () => {
            const ok = await navigator.storage.persist().catch(() => false);
            message(
              ok
                ? "브라우저가 이 기기의 기록 보존을 허락했어요."
                : "브라우저가 보존을 허락하지 않았어요. 앱을 홈 화면에 설치하거나 자주 쓰면 허락될 수 있어요. 파일 백업을 권장해요.",
            );
            void refresh();
          }}
        >
          이 기기에 기록 보존 요청
        </button>
      )}
    </section>
  );
}
