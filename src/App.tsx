import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Mode, Work, Mission, Snapshot, Version } from "./model";
import { APP_PREFIX, LIMITS, makeWork, modes, uid, now, clone } from "./model";
import { missions } from "./data";
import {
  clearWorks,
  deleteWork,
  downloadWorks,
  importWorks,
  readAllWorks,
  downloadText,
  parseImport,
  saveWork,
  jsonBytes,
} from "./storage";
import { Home, Library, Missions, MissionDetail, Teacher } from "./Pages";
import { Workspace, stageNames } from "./Workspace";
import { Portfolio } from "./Portfolio";
import { Icon, Mascot, Empty, Field } from "./ui";
import { Explore, Prepare, QuickTry, LessonLanding } from "./Welcome";
import { announceChange, useChanges, useWorkLock } from "./tabLock";
import { ErrorBoundary } from "./ErrorBoundary";
import "./Welcome.css";
import { LangContext, langs, translate } from "./i18n";
import type { Lang } from "./i18n";
const SharePage = lazy(() => import("./SharePage"));
function getSetting<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(APP_PREFIX + key);
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
}
type Dialog = {
  title: string;
  body: string;
  action: () => Promise<void> | void;
  backup: Work[];
  label?: string;
};
const readRoute = () => location.hash.replace(/^#\/?/, "") || "home";
export default function App() {
  const [route, setRoute] = useState(readRoute);
  const [runtimeEpoch, setRuntimeEpoch] = useState(0);
  const [mode, setModeState] = useState<Mode>(() => {
    const saved = getSetting<string>("mode", "child");
    return modes.includes(saved as Mode) ? (saved as Mode) : "child";
  });
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = getSetting<string>("lang", "ko");
    return langs.some((l) => l.id === saved) ? (saved as Lang) : "ko";
  });
  const t = (s: string) => translate(lang, s);
  const [works, setWorks] = useState<Work[]>([]);
  const worksRef = useRef<Work[]>([]);
  const [hidden, setHidden] = useState<string[]>(() => {
    const v = getSetting<unknown>("hidden", []);
    return Array.isArray(v)
      ? v.filter((id): id is string => typeof id === "string")
      : [];
  });
  const [lastId, setLastId] = useState<string>(() => getSetting("last", ""));
  const [loading, setLoading] = useState(true);
  const [storageStatus, setStorageStatus] = useState("불러오는 중");
  const [storageError, setStorageError] = useState("");
  const [unreadable, setUnreadable] = useState<unknown[]>([]);
  // 작품별 되돌리기 기록(현재 탭에서만 기억)
  const histories = useRef(
    new Map<string, { undo: Snapshot[]; redo: Snapshot[]; at: number }>(),
  );
  const historyOf = (id: string) => {
    let h = histories.current.get(id);
    if (!h) histories.current.set(id, (h = { undo: [], redo: [], at: 0 }));
    return h;
  };
  const [toast, setToast] = useState("");
  const [copyFallback, setCopyFallback] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [dialogBusy, setDialogBusy] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [announce, setAnnounce] = useState("");
  const firstRoute = useRef(true);
  const importInput = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const pending = useRef(new Map<string, Work>());
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const queue = useRef(Promise.resolve());
  const message = useCallback((s: string) => setToast(s), []);
  const setting = useCallback(
    (key: string, value: unknown) => {
      try {
        localStorage.setItem(APP_PREFIX + key, JSON.stringify(value));
        return true;
      } catch {
        message(
          "기기 설정을 저장하지 못했어요. 현재 화면에서는 계속 사용할 수 있어요. 파일 백업을 권장해요.",
        );
        return false;
      }
    },
    [message],
  );
  const setAll = useCallback((all: Work[]) => {
    worksRef.current = all;
    setWorks(all);
  }, []);
  const flushOne = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    const work = pending.current.get(id);
    if (!work) return;
    queue.current = queue.current.then(async () => {
      try {
        await saveWork(work);
        announceChange();
        if (pending.current.get(id) === work) pending.current.delete(id);
        if (!pending.current.size) {
          setStorageStatus("기기에 저장됨");
          setStorageError("");
        }
      } catch (error) {
        setStorageStatus("저장 실패 · 편집 내용 유지 중");
        setStorageError(
          `기기에 저장하지 못했어요. 브라우저의 저장 공간과 권한을 확인하고 다시 시도하거나 파일로 내보내세요. ${error instanceof Error ? error.message : ""}`,
        );
      }
    });
  }, []);
  const flush = useCallback(async () => {
    for (const id of pending.current.keys()) flushOne(id);
    await queue.current;
  }, [flushOne]);
  const persist = useCallback(
    (work: Work) => {
      const next = { ...work, updatedAt: now() };
      setAll([...worksRef.current.filter((w) => w.id !== next.id), next]);
      pending.current.set(next.id, next);
      setStorageStatus("저장 대기 중");
      const old = timers.current.get(next.id);
      if (old) clearTimeout(old);
      timers.current.set(
        next.id,
        setTimeout(() => flushOne(next.id), 400),
      );
    },
    [flushOne, setAll],
  );
  // 다른 탭이 저장·삭제하면 아직 저장 전인 이 탭의 편집본은 그대로 두고 목록을 새로 읽는다.
  const refresh = useCallback(() => {
    void readAllWorks()
      .then(({ works: all, unreadable }) => {
        setUnreadable(unreadable);
        const ids = new Set(all.map((w) => w.id));
        setAll([
          ...all.map((w) => pending.current.get(w.id) ?? w),
          ...[...pending.current.values()].filter((w) => !ids.has(w.id)),
        ]);
      })
      .catch(() => {});
  }, [setAll]);
  useChanges(refresh);
  useEffect(() => {
    let alive = true;
    readAllWorks()
      .then(({ works: all, unreadable }) => {
        if (alive) {
          setAll(all);
          setUnreadable(unreadable);
          setStorageStatus("기기에 저장됨");
        }
      })
      .catch(() => {
        if (alive) {
          setStorageStatus("저장소 연결 실패");
          setStorageError(
            "기기 저장소를 열 수 없어요. 편집은 계속할 수 있으며, 파일로 내보내어 보관해 주세요.",
          );
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [setAll]);
  useEffect(() => {
    const listener = () => setRoute(readRoute());
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, []);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (pending.current.size) {
        void flush();
        e.preventDefault();
      }
    };
    const hiddenSave = () => {
      if (document.hidden) void flush();
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("visibilitychange", hiddenSave);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("visibilitychange", hiddenSave);
    };
  }, [flush]);
  useEffect(() => {
    const ready = () => setUpdateReady(true);
    addEventListener("ttukttak:update", ready);
    return () => removeEventListener("ttukttak:update", ready);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 6000);
    return () => clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    if (dialog || copyFallback !== null) {
      previousFocus.current = document.activeElement as HTMLElement;
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
      previousFocus.current?.focus();
    }
  }, [dialog, copyFallback]);
  const go = useCallback(
    (path: string) => {
      void flush();
      location.hash = "/" + path;
      window.scrollTo({ top: 0, behavior: "instant" });
    },
    [flush],
  );
  const setLang = (v: Lang) => {
    setLangState(v);
    setting("lang", v);
  };
  const setMode = (v: Mode) => {
    setModeState(v);
    setting("mode", v);
  };
  const create = (
    m: Mission,
    normal = false,
    starter?: { prediction: string; reason: string },
  ) => {
    const work = makeWork(m, normal);
    if (starter) {
      work.draft.prediction = starter.prediction;
      work.draft.change.reason = starter.reason;
      work.draft.change.behavior = "같은 문제는 한 번만 채점하기";
    }
    persist(work);
    setLastId(work.id);
    setting("last", work.id);
    go(`work/${work.id}/0`);
  };
  const parts = route.split("/");
  const active = works.find((w) => w.id === parts[1]);
  const lock = useWorkLock(
    parts[0] === "work" ? active?.id : undefined,
    refresh,
  );
  const readOnly = lock.state === "other";
  const blocked = () => {
    if (readOnly)
      message(
        "다른 탭에서 이 작품을 편집하고 있어요. 이 탭에서 편집하기를 누른 뒤 다시 시도해 주세요.",
      );
    return readOnly;
  };
  const mission = missions.find(
    (m) => m.id === (active?.missionId ?? parts[1]),
  );
  useEffect(() => {
    if (active && parts[0] === "work") {
      setLastId(active.id);
      setting("last", active.id);
    }
  }, [active?.id, parts[0], setting]);
  const edit = (fn: (d: Snapshot) => Snapshot, track = true) => {
    if (!active || readOnly) return;
    const current = worksRef.current.find((w) => w.id === active.id)!;
    if (track) {
      const h = historyOf(active.id);
      // 잇달아 입력하는 글자는 한 번의 되돌리기로 묶는다.
      const stamp = Date.now();
      if (stamp - h.at > 800 || !h.undo.length) {
        h.undo.push(current.draft);
        if (h.undo.length > 50) h.undo.shift();
      }
      h.at = stamp;
      h.redo = [];
    }
    persist({
      ...current,
      draft: fn(current.draft),
      editingLabel: current.editingLabel.includes("복원")
        ? current.editingLabel
        : "현재 편집본",
    });
  };
  const moveInHistory = (from: "undo" | "redo") => {
    if (!active || blocked()) return;
    const h = historyOf(active.id);
    const target = h[from].pop();
    if (!target) return;
    const current = worksRef.current.find((w) => w.id === active.id)!;
    h[from === "undo" ? "redo" : "undo"].push(current.draft);
    h.at = 0;
    persist({ ...current, draft: target });
    message(
      from === "undo" ? "한 단계 되돌렸어요." : "되돌린 것을 다시 했어요.",
    );
  };
  const history = active ? historyOf(active.id) : undefined;
  const copy = async (text: string) => {
    if (!text.trim()) {
      message("먼저 복사할 내용을 작성해 주세요.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      message("클립보드에 복사했어요.");
    } catch {
      setCopyFallback(text);
    }
  };
  const backup = (items: Work[]) => {
    try {
      const count = downloadWorks(items);
      message(
        count > 1
          ? `${count}개로 나눈 파일의 다운로드를 요청했어요. 브라우저의 여러 파일 다운로드를 허용하고 모두 보관해 주세요.`
          : "작품 JSON 파일의 다운로드를 요청했어요.",
      );
    } catch (e) {
      message(
        e instanceof Error
          ? e.message
          : "파일을 만들지 못했어요. 불필요한 버전을 백업 후 정리해 주세요.",
      );
    }
  };
  const exportAll = () => {
    if (worksRef.current.length) backup(worksRef.current);
    else message("백업할 작품이 없어요.");
  };
  const ask = (d: Dialog) => setDialog(d);
  const remove = (w: Work) =>
    ask({
      title: "이 작품을 삭제할까요?",
      body: `「${w.draft.title}」의 현재 편집본, 버전 ${w.versions.length}개와 모든 검사 기록을 이 기기에서 삭제해요. 먼저 파일로 백업할 수 있어요.`,
      backup: [w],
      action: async () => {
        await flush();
        await deleteWork(w.id);
        announceChange();
        pending.current.delete(w.id);
        setAll(worksRef.current.filter((t) => t.id !== w.id));
        if (lastId === w.id) {
          setLastId("");
          setting("last", "");
        }
        message("선택한 작품을 삭제했어요.");
      },
    });
  const clearAll = () =>
    ask({
      title: "이 앱의 데이터 전체를 삭제할까요?",
      body: `이 브라우저의 뚝딱 작품 ${works.length}개와 모든 버전·학습 기록·모드 설정을 삭제해요. 같은 주소의 다른 앱 데이터는 지우지 않아요.`,
      backup: works,
      action: async () => {
        await flush();
        await clearWorks();
        announceChange();
        pending.current.clear();
        setAll([]);
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key?.startsWith(APP_PREFIX)) localStorage.removeItem(key);
        }
        setHidden([]);
        setLastId("");
        setModeState("child");
        setStorageError("");
        setStorageStatus("이 앱의 데이터 삭제됨");
        go("home");
      },
    });
  const nextUser = () =>
    ask({
      title: "다음 사용자를 시작할까요?",
      body: "기존 작품은 삭제하지 않지만 목록에서 접어 두고, 이어서 학습 연결을 비워요. 공용 기록은 내 작품 화면에서 명시적으로 다시 열 수 있어요. 다음 사용자는 새 미션부터 시작해요.",
      backup: works,
      action: async () => {
        await flush();
        const ids = worksRef.current.map((w) => w.id);
        setting("hidden", ids);
        setting("last", "");
        setHidden(ids);
        setLastId("");
        go("home");
        message("다음 사용자는 새 작품으로 시작해요.");
      },
      label: "다음 사용자로 시작",
    });
  const saveVersion = (label: string) => {
    if (!active || blocked()) return;
    if (active.versions.length >= LIMITS.versions) {
      message("버전은 작품당 30개까지예요. 파일로 백업해 주세요.");
      return;
    }
    if (!label.trim()) {
      message("버전 이름을 적어 주세요.");
      return;
    }
    const version: Version = {
      id: uid(),
      label: label.slice(0, LIMITS.short),
      at: now(),
      reason: active.draft.change.reason || "현재 학습 과정 보관",
      data: clone(active.draft),
    };
    const versions = [...active.versions, version];
    if (jsonBytes(versions) > LIMITS.historyBytes) {
      message(
        "수정 버전 묶음은 600KB까지예요. 파일 백업 후 새 작품으로 이어 가거나 불필요한 버전을 삭제해 주세요.",
      );
      return;
    }
    persist({ ...active, versions });
    message(
      `「${version.label}」을 버전으로 저장 중이에요. 저장 상태를 확인해 주세요.`,
    );
  };
  const restore = (v: Version) => {
    if (!active || blocked()) return;
    if (active.versions.length >= LIMITS.versions) {
      message(
        "복원 전 편집본을 보존할 공간이 필요해요. 먼저 파일로 백업해 주세요.",
      );
      return;
    }
    const before: Version = {
      id: uid(),
      label: "복원 전 편집본",
      reason: "이전 버전을 복원하기 전 현재 내용 보존",
      at: now(),
      data: clone(active.draft),
    };
    const versions = [...active.versions, before];
    if (jsonBytes(versions) > LIMITS.historyBytes) {
      message(
        "복원 전 편집본을 보존할 공간이 부족해요. 먼저 파일로 백업하고 불필요한 버전을 삭제해 주세요.",
      );
      return;
    }
    setRuntimeEpoch((n) => n + 1);
    persist({
      ...active,
      draft: clone(v.data),
      editingLabel: `${v.label}에서 복원한 편집본`,
      versions,
    });
    message(
      "선택한 설정과 검사 기록을 복원했어요. 실행은 처음·정지 상태로 열려요.",
    );
  };
  const deleteChecks = (ids: string[]) => {
    if (!active || blocked()) return;
    ask({
      title: "선택한 학습 기록을 삭제할까요?",
      body: `「${active.draft.title}」에서 선택한 검사 기록 ${ids.length}개를 현재 편집본과 저장 버전에서 삭제해요. 작품 설정과 나머지 기록은 유지돼요.`,
      backup: [active],
      action: () => {
        const filter = (d: Snapshot) => ({
          ...d,
          checks: d.checks.filter((c) => !ids.includes(c.id)),
        });
        persist({
          ...active,
          draft: filter(active.draft),
          versions: active.versions.map((v) => ({
            ...v,
            data: filter(v.data),
          })),
        });
      },
    });
  };
  // 힌트 사용과 자기 평가는 편집본이 아닌 작품 전체의 기록이라 되돌리기에 넣지 않는다.
  const updateWork = (patch: Partial<Work>) => {
    if (!active || readOnly) return;
    const current = worksRef.current.find((w) => w.id === active.id)!;
    persist({ ...current, ...patch });
  };
  const deleteVersion = (v: Version) => {
    if (!active || active.versions[0].id === v.id || blocked()) return;
    ask({
      title: "이 수정 버전을 삭제할까요?",
      body: `「${v.label}」의 저장된 설정과 검사 묶음을 삭제해요. 현재 편집본과 다른 버전은 유지돼요. 처음 시작 버전은 보존해요.`,
      backup: [active],
      action: () =>
        persist({
          ...active,
          versions: active.versions.filter((t) => t.id !== v.id),
        }),
    });
  };
  const importFile = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > LIMITS.bytes)
        throw new Error("파일은 2MB 이하여야 해요.");
      const imported = parseImport(await file.text());
      await flush();
      await importWorks(imported);
      announceChange();
      setAll([...worksRef.current, ...imported]);
      message(`작품 ${imported.length}개를 새 ID의 복사본으로 가져왔어요.`);
      go("library");
    } catch (e) {
      message(
        `가져오지 못했어요. ${e instanceof Error ? e.message : "내보낸 JSON 파일을 다시 선택해 주세요."} 기존 작품은 그대로예요.`,
      );
    } finally {
      if (importInput.current) importInput.current.value = "";
    }
  };
  const visible = works.filter((w) => !hidden.includes(w.id));
  const lastWork = visible.find((w) => w.id === lastId);
  const navActive = ["home", "explore", "try", "share", "lesson"].includes(
    parts[0],
  )
    ? "home"
    : ["teacher", "prepare"].includes(parts[0])
      ? "teacher"
      : parts[0] === "library" || parts[0] === "portfolio"
        ? "library"
        : "missions";
  const step = Math.max(0, Math.min(4, Number(parts[2]) || 0));
  const pageName = t(
    parts[0] === "explore"
      ? "학생 체험하기"
      : parts[0] === "try"
        ? "3분 첫 체험"
        : parts[0] === "prepare"
          ? "교사 수업 준비"
          : parts[0] === "share"
            ? "QR 소개 카드"
            : navActive === "home"
              ? "공작소 홈"
              : navActive === "missions"
                ? "미션 공작대"
                : navActive === "library"
                  ? "내 작품 선반"
                  : "교사 자료실",
  );
  const pageTitle =
    parts[0] === "work" && active
      ? `${active.draft.title || "제목 없는 작품"} · ${t(stageNames[step])}`
      : parts[0] === "mission" && mission
        ? mission.title
        : pageName;
  useEffect(() => {
    document.title = `${pageTitle} · ${translate(lang, "뚝딱 바이브 공작소")}`;
  }, [pageTitle, lang]);
  useEffect(() => {
    document.documentElement.lang =
      langs.find((l) => l.id === lang)?.html ?? "ko";
  }, [lang]);
  // 화면이 바뀌면 화면 낭독기에 새 화면 이름을 알리고, 누른 버튼이 사라져
  // 초점을 잃었으면 본문으로 옮긴다.
  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    setAnnounce(pageTitle);
    const frame = requestAnimationFrame(() => {
      const focused = document.activeElement;
      if (!focused || focused === document.body || !focused.isConnected)
        document.getElementById("main-content")?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
    // 화면 경로가 바뀔 때만 알린다.
  }, [route]);
  return (
    <LangContext.Provider value={lang}>
      <div
        className={`app mode-${mode}${parts[0] === "home" ? " home-screen" : ""}`}
      >
        <a
          className="skip-link"
          href="#main-content"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("main-content")?.focus();
          }}
        >
          {t("본문으로 건너뛰기")}
        </a>
        <aside className="sidebar no-print">
          <button className="brand" onClick={() => go("home")}>
            <span className="brand-symbol">
              <Mascot mini />
            </span>
            <span>
              <b>뚝딱 바이브</b>
              <strong>공작소</strong>
            </span>
          </button>
          <span className="sidebar-label">{t("나의 작은 앱 만들기")}</span>
          <nav aria-label={t("주 메뉴")}>
            {[
              ["home", "home", "공작소 홈"],
              ["missions", "grid", "미션 공작대"],
              ["library", "folder", "내 작품 선반"],
              ["teacher", "book", "교사 자료실"],
            ].map(([path, icon, label]) => (
              <button
                key={path}
                className={navActive === path ? "active" : ""}
                aria-current={navActive === path ? "page" : undefined}
                onClick={() => go(path)}
              >
                <Icon name={icon} />
                {t(label)}
                {navActive === path ? <span className="nav-dot" /> : null}
              </button>
            ))}
          </nav>
          <div className="sidebar-tip">
            <span className="tip-spark">✦</span>
            <b>
              잘 고치는 것도
              <br />
              멋진 만들기예요.
            </b>
            <p>
              한 번에 완벽하지 않아도
              <br />
              괜찮아요. 다시 해 봐요!
            </p>
            <button
              className="text-button"
              onClick={() => go("mission/quiz-3")}
            >
              {t("버그 탐정 도전")} <Icon name="arrow" size={16} />
            </button>
          </div>
          <div className="sidebar-footer">
            <Icon name="shield" size={17} />
            <span>
              {t("가입 없이, 내 기기에 저장")}
              <br />
              <small>{t("생각을 키우는 안전한 연습실")}</small>
            </span>
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar no-print">
            <div className="breadcrumbs">
              {t("나의 배움 공간")} <Icon name="chevron" size={13} />
              <b>{pageName}</b>
            </div>
            <div className="topbar-actions">
              <span
                className={`save-state ${storageError ? "error" : ""}`}
                role="status"
              >
                <span className="status-dot" />
                {t(storageStatus)}
              </span>
              <label className="mode-select">
                <span className="sr-only">{t("안내 모드")}</span>
                <select
                  aria-label={t("안내 모드")}
                  value={mode}
                  onChange={(e) => setMode(e.target.value as Mode)}
                >
                  <option value="child">{t("어린이 모드")}</option>
                  <option value="easy">{t("쉬운 모드 (3~4학년)")}</option>
                  <option value="adult">{t("일반 입문자 모드")}</option>
                </select>
              </label>
              <label className="mode-select">
                <span className="sr-only">언어 · Language</span>
                <select
                  aria-label="언어 · Language"
                  value={lang}
                  onChange={(e) => setLang(e.target.value as Lang)}
                >
                  {langs.map((l) => (
                    <option key={l.id} value={l.id} lang={l.html}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </header>
          <main id="main-content" tabIndex={-1}>
            {updateReady ? (
              <div role="status" className="update-banner no-print">
                <p>
                  {t(
                    "새 버전이 준비됐어요. 지금 편집 내용을 저장한 뒤 새로고침하면 적용돼요.",
                  )}
                </p>
                <div className="button-row">
                  <button
                    className="primary"
                    onClick={async () => {
                      await flush();
                      location.reload();
                    }}
                  >
                    {t("저장하고 새로고침")}
                  </button>
                  <button onClick={() => setUpdateReady(false)}>
                    {t("나중에")}
                  </button>
                </div>
              </div>
            ) : null}
            {storageError ? (
              <div role="alert" className="storage-error no-print">
                <p>{storageError}</p>
                <div className="button-row">
                  <button onClick={() => void flush()}>
                    {t("저장 다시 시도")}
                  </button>
                  <button disabled={!works.length} onClick={exportAll}>
                    {t("편집 내용 파일로 내보내기")}
                  </button>
                </div>
              </div>
            ) : null}
            {unreadable.length && !loading ? (
              <div role="alert" className="warning no-print">
                <p>
                  이 기기에 읽지 못한 기록이 {unreadable.length}개 있어요. 더
                  새로운 앱에서 만들었거나 손상된 기록일 수 있어요. 나머지
                  작품은 그대로 쓸 수 있고, 읽지 못한 기록은 지우지 않았어요.
                </p>
                <button
                  onClick={() =>
                    downloadText(
                      "뚝딱-읽지-못한-기록.json",
                      JSON.stringify(unreadable),
                      "application/json",
                    )
                  }
                >
                  읽지 못한 기록 원본 내려받기
                </button>
              </div>
            ) : null}
            <ErrorBoundary
              resetKey={`${route}:${runtimeEpoch}`}
              onLibrary={() => go("library")}
            >
              {loading ? (
                <div className="empty">
                  <p>{t("이 기기의 작품을 불러오고 있어요…")}</p>
                </div>
              ) : parts[0] === "home" ? (
                <Home {...{ mode, setMode, lastWork, go, create }} />
              ) : parts[0] === "missions" ? (
                <Missions filter={parts[1]} works={visible} go={go} />
              ) : parts[0] === "explore" ? (
                <Explore go={go} />
              ) : parts[0] === "try" ? (
                <QuickTry go={go} create={create} />
              ) : parts[0] === "prepare" ? (
                <Prepare go={go} />
              ) : parts[0] === "lesson" && /^[1-8]$/.test(parts[1] ?? "") ? (
                <LessonLanding number={Number(parts[1])} go={go} />
              ) : parts[0] === "share" ? (
                <Suspense
                  fallback={<p role="status">소개 카드를 준비하고 있어요…</p>}
                >
                  <SharePage go={go} copy={copy} />
                </Suspense>
              ) : parts[0] === "mission" && mission ? (
                <MissionDetail mission={mission} create={create} share={copy} />
              ) : parts[0] === "teacher" ? (
                <Teacher
                  create={create}
                  go={go}
                  copy={copy}
                  message={message}
                />
              ) : parts[0] === "library" ? (
                <Library
                  works={visible}
                  go={go}
                  exportAll={() => backup(visible)}
                  importFile={() => importInput.current?.click()}
                  remove={remove}
                  nextUser={nextUser}
                  clearAll={clearAll}
                  hiddenCount={works.length - visible.length}
                  message={message}
                  reveal={() => {
                    setHidden([]);
                    setting("hidden", []);
                  }}
                />
              ) : parts[0] === "work" && active && mission ? (
                <Workspace
                  key={active.id + runtimeEpoch}
                  work={active}
                  mission={mission}
                  {...{
                    step,
                    mode,
                    go,
                    edit,
                    copy,
                    message,
                    saveVersion,
                    restore,
                    deleteChecks,
                    deleteVersion,
                    readOnly,
                  }}
                  takeOver={lock.takeOver}
                  updateWork={updateWork}
                  undo={
                    history?.undo.length
                      ? () => moveInHistory("undo")
                      : undefined
                  }
                  redo={
                    history?.redo.length
                      ? () => moveInHistory("redo")
                      : undefined
                  }
                  exportWork={() => backup([active])}
                />
              ) : parts[0] === "portfolio" && active ? (
                <Portfolio
                  work={active}
                  go={go}
                  exportWork={() => backup([active])}
                />
              ) : (
                <Empty title={t("이 작품이나 미션을 찾을 수 없어요")}>
                  <p>
                    현재 브라우저에 저장된 작품 목록을 확인하거나 작품 파일을
                    가져와 주세요.
                  </p>
                  <button onClick={() => go("library")}>
                    {t("작품 선반으로")}
                  </button>
                </Empty>
              )}
            </ErrorBoundary>
          </main>
          <footer className="page-footer no-print">
            <span>{t("뚝딱 바이브 공작소")}</span>
            <span>{t("정답을 만드는 시간보다, 생각을 키우는 시간.")}</span>
            <p className="ys-credit">
              © 2026 엽쌤. All rights reserved. ·{" "}
              <a
                href="https://gmlduqzhd123-lab.github.io/YScode/"
                target="_blank"
                rel="noopener"
              >
                엽쌤의 다른 앱 보기 →
              </a>
            </p>
          </footer>
        </div>
        <input
          className="sr-only"
          tabIndex={-1}
          ref={importInput}
          type="file"
          accept=".json,application/json"
          aria-label="작품 JSON 파일"
          onChange={(e) => void importFile(e.target.files?.[0])}
        />
        {toast ? (
          <div className="toast no-print" role="status">
            <span>{toast}</span>
            <button aria-label={t("알림 닫기")} onClick={() => setToast("")}>
              ×
            </button>
          </div>
        ) : null}
        <dialog
          ref={dialogRef}
          aria-labelledby="app-dialog-title"
          onCancel={() => {
            setDialog(null);
            setCopyFallback(null);
          }}
          className="app-dialog"
        >
          {copyFallback !== null ? (
            <>
              <h2 id="app-dialog-title">직접 선택해서 복사해 주세요</h2>
              <p>
                브라우저가 클립보드 쓰기를 허용하지 않았어요. 아래 내용을 선택한
                뒤 Ctrl+C 또는 기기의 복사 메뉴를 사용해 주세요.
              </p>
              <Field
                area
                label="복사할 내용"
                value={copyFallback}
                onChange={setCopyFallback}
              />
              <div className="button-row">
                <button
                  onClick={() =>
                    dialogRef.current?.querySelector("textarea")?.select()
                  }
                >
                  내용 전체 선택
                </button>
                <button
                  className="primary"
                  onClick={() => setCopyFallback(null)}
                >
                  닫기
                </button>
              </div>
            </>
          ) : dialog ? (
            <>
              <h2 id="app-dialog-title">{dialog.title}</h2>
              <p>{dialog.body}</p>
              <div className="button-row">
                {dialog.backup.length ? (
                  <button onClick={() => backup(dialog.backup)}>
                    <Icon name="download" />
                    삭제 전 파일 백업
                  </button>
                ) : null}
                <button disabled={dialogBusy} onClick={() => setDialog(null)}>
                  {t("취소")}
                </button>
                <button
                  className="danger"
                  disabled={dialogBusy}
                  onClick={async () => {
                    setDialogBusy(true);
                    try {
                      await dialog.action();
                      setDialog(null);
                    } catch (e) {
                      message(
                        `처리하지 못했어요. 다시 시도해 주세요. ${e instanceof Error ? e.message : ""}`,
                      );
                    } finally {
                      setDialogBusy(false);
                    }
                  }}
                >
                  {dialogBusy ? t("처리 중…") : (dialog.label ?? "대상 삭제")}
                </button>
              </div>
            </>
          ) : null}
        </dialog>
        <p className="sr-only" role="status" aria-live="polite">
          {announce}
        </p>
      </div>
    </LangContext.Provider>
  );
}
