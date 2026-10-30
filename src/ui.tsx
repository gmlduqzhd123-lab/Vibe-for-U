import { useId } from "react";
import type { ReactNode } from "react";
import { LIMITS } from "./model";
import { useT } from "./i18n";
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    home: (
      <>
        <path d="m3 10 9-7 9 7v10H3z" />
        <path d="M9 20v-7h6v7" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    folder: <path d="M3 7V4h7l2 3h9v13H3V7z" />,
    book: (
      <>
        <path d="M12 5v16M12 5C7 2 3 4 3 4v15s4-2 9 2c5-4 9-2 9-2V4s-4-2-9 1Z" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    plus: <path d="M12 4v16M4 12h16" />,
    play: <path d="m8 4 13 8-13 8z" />,
    check: <path d="m5 12 4 4L20 5" />,
    quiz: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="3" />
        <path d="M9 8h6M8 13l2 2 5-5M8 18h8" />
      </>
    ),
    story: (
      <>
        <path d="M12 21V10M12 14 5 7M12 14l7-7M3 3h5v5H3zM17 3h5v5h-5z" />
      </>
    ),
    send: (
      <>
        <path d="M21 3 3 10l7 3 3 7z" />
        <path d="m10 13 4-4" />
      </>
    ),
    sound: (
      <>
        <path d="M4 9v6h4l5 4V5L8 9H4z" />
        <path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" />
      </>
    ),
    pattern: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
        <path
          d="M3.5 3.5h5v5h-5zM9.5 9.5h5v5h-5zM15.5 15.5h5v5h-5z"
          fill="currentColor"
        />
      </>
    ),
    timer: (
      <>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 8v5l3 2M9 2h6M12 2v3" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 2.7 6.3L21 12l-6.3 2.7L12 21l-2.7-6.3L3 12l6.3-2.7z" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4 2l-1.5 1v2M12 17v.1" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6" />
      </>
    ),
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    copy: (
      <>
        <rect x="8" y="8" width="12" height="13" rx="2" />
        <path d="M16 8V3H3v13h5" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M8 6V3h8v3M5 6l1 15h12l1-15M9 10v7M15 10v7" />
      </>
    ),
    print: (
      <>
        <path d="M6 8V3h12v5M6 17H3V8h18v9h-3M6 14h12v7H6z" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.spark}
    </svg>
  );
}
export function Mascot({ mini = false }: { mini?: boolean }) {
  const t = useT();
  return (
    <svg
      className={mini ? "mascot-mini" : "mascot"}
      viewBox="0 0 300 240"
      role="img"
      aria-label={t("작은 생각을 만드는 공작소 친구")}
    >
      <ellipse cx="151" cy="215" rx="88" ry="12" fill="#dfcdb8" opacity=".5" />
      <path
        d="m89 153-29 19-15-15m166-4 22 16 17-18"
        fill="none"
        stroke="#574675"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="m115 181-5 27m76-27 6 27"
        stroke="#574675"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <rect
        x="82"
        y="56"
        width="140"
        height="136"
        rx="31"
        fill="#efb94e"
        stroke="#c28c3b"
        strokeWidth="2"
      />
      <path
        d="M82 91h140M119 56v136M184 56v136"
        stroke="#ffe0a0"
        strokeWidth="4"
      />
      <rect
        x="72"
        y="42"
        width="161"
        height="31"
        rx="10"
        fill="#f5d280"
        stroke="#c28c3b"
        strokeWidth="2"
      />
      <path
        d="m138 43 10-25h28l-5 25"
        fill="#9a88c8"
        stroke="#7661a9"
        strokeWidth="2"
      />
      <circle cx="128" cy="117" r="6" fill="#453653" />
      <circle cx="179" cy="117" r="6" fill="#453653" />
      <ellipse cx="110" cy="131" rx="9" ry="5" fill="#ed957e" />
      <ellipse cx="197" cy="131" rx="9" ry="5" fill="#ed957e" />
      <path
        d="M140 135q13 15 26 0"
        fill="none"
        stroke="#453653"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="m42 71 4-12 4 12 12 4-12 4-4 12-4-12-12-4zM247 42l3-9 3 9 9 3-9 3-3 9-3-9-9-3z"
        fill="#a791ce"
      />
      <circle cx="251" cy="113" r="5" fill="#e4a870" />
    </svg>
  );
}
export function Field({
  label,
  value,
  onChange,
  placeholder,
  area = false,
  max = LIMITS.text,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  area?: boolean;
  max?: number;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {area ? (
        <textarea
          id={id}
          rows={3}
          value={value}
          maxLength={max}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          value={value}
          maxLength={max}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}
export function Pill({
  children,
  tone = "purple",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`pill ${tone}`}>{children}</span>;
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty">
      <Icon name="folder" size={36} />
      <h3>{title}</h3>
      {children}
    </div>
  );
}
export function Hint({
  hints,
  onOpen,
}: {
  hints: string[];
  // 힌트를 펼치면 몇 번째 힌트인지(1부터) 알린다.
  onOpen?: (n: number) => void;
}) {
  const t = useT();
  return (
    <details className="hint">
      <summary>
        <Icon name="help" /> {t("막히면 힌트를 열어 보세요")}
      </summary>
      {hints.map((h, i) => (
        <details
          key={h}
          onToggle={(e) => {
            if (e.currentTarget.open) onOpen?.(i + 1);
          }}
        >
          <summary>{t("힌트 {n}", { n: i + 1 })}</summary>
          <p>{h}</p>
        </details>
      ))}
    </details>
  );
}
