import { useRef, useState } from "react";
import { lessons } from "./data";
import { qrData } from "./qrData";
import { Icon } from "./ui";

export default function SharePage({
  go,
  copy,
}: {
  go: (path: string) => void;
  copy: (text: string) => void;
}) {
  const [selection, setSelection] = useState("home");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const poster = useRef<SVGSVGElement>(null);
  const destinations = [
    {
      id: "home",
      title: "앱 전체 소개",
      detail: "예제부터 눌러보고 내 작품으로 이어가요.",
    },
    {
      id: "try",
      title: "3분 첫 체험",
      detail: "같은 정답을 세 번 누르고 점수 규칙을 고쳐요.",
    },
    ...lessons.map((lesson, index) => ({
      id: `lesson-${index + 1}`,
      title: `${index + 1}차시 ${lesson.title}`,
      detail: "오늘의 목표와 활동지를 보고, 연결된 미션에서 시작해요.",
    })),
  ];
  const selected = destinations.find((item) => item.id === selection)!;
  const qr = qrData[selection];
  const message = `뚝딱 바이브 공작소에서 퀴즈·이야기·타이머를 만들고 고치며 코딩의 원리를 배워요.\n오늘의 안내: ${selected.title}\n${selected.detail}\n학생 가입 없이 시작할 수 있어요.\n${qr.url}`;
  const saveImage = async () => {
    if (!poster.current) return;
    setBusy(true);
    setStatus("");
    let svgUrl = "";
    let pngUrl = "";
    try {
      await document.fonts.ready;
      const source = new XMLSerializer().serializeToString(poster.current);
      svgUrl = URL.createObjectURL(
        new Blob([source], { type: "image/svg+xml;charset=utf-8" }),
      );
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("이미지 변환 실패"));
        image.src = svgUrl;
      });
      const canvas = document.createElement("canvas");
      canvas.width = 1000;
      canvas.height = 1180;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("이미지 저장 미지원");
      context.drawImage(image, 0, 0, 1000, 1180);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (value) =>
            value ? resolve(value) : reject(new Error("이미지 변환 실패")),
          "image/png",
        ),
      );
      pngUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `뚝딱_바이브_${selected.title.replaceAll(" ", "_")}_QR카드.png`;
      document.body.append(link);
      link.click();
      link.remove();
      setStatus(
        "PNG 이미지 다운로드를 요청했어요. 브라우저의 다운로드 목록을 확인해 주세요.",
      );
    } catch {
      setStatus(
        "이미지 저장을 완료하지 못했어요. 카드 인쇄를 사용하거나 소개 문구와 주소를 복사해 주세요.",
      );
    } finally {
      if (svgUrl) URL.revokeObjectURL(svgUrl);
      if (pngUrl) {
        const savedUrl = pngUrl;
        setTimeout(() => URL.revokeObjectURL(savedUrl), 1000);
      }
      setBusy(false);
    }
  };
  return (
    <div className="share-page">
      <div className="page-heading no-print">
        <div>
          <span className="eyebrow">함께 시작하는 수업</span>
          <h1>QR 소개 카드 만들기</h1>
          <p>
            전체 앱이나 오늘의 차시를 골라 인쇄하고, PNG 이미지와 소개 문구로
            나눠요.
          </p>
        </div>
        <button onClick={() => go("home")}>홈으로</button>
      </div>
      <section className="panel share-controls no-print">
        <label className="field">
          <span>QR 카드로 안내할 곳</span>
          <select
            value={selection}
            onChange={(event) => {
              setSelection(event.target.value);
              setStatus("");
            }}
          >
            {destinations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <p>{selected.detail}</p>
        <div className="button-row">
          <button className="primary" onClick={() => window.print()}>
            <Icon name="print" /> 카드 인쇄
          </button>
          <button onClick={() => void saveImage()} disabled={busy}>
            <Icon name="download" />{" "}
            {busy ? "이미지 만드는 중…" : "카드 PNG 저장"}
          </button>
          <button onClick={() => copy(message)}>
            <Icon name="copy" /> 소개 문구 복사
          </button>
          <button onClick={() => copy(qr.url)}>주소 복사</button>
        </div>
        <p role="status">{status}</p>
        <p className="small muted">
          QR은 공개 웹앱 주소로 연결돼요. 학생 작품이나 기록은 포함하지 않아요.
          휴대전화·태블릿에서 QR을 읽거나 아래 주소를 직접 열 수 있어요.
        </p>
      </section>
      <article
        className="share-poster"
        aria-label={`${selected.title} 인쇄용 QR 소개 카드`}
      >
        <svg
          ref={poster}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 1180"
          width="1000"
          height="1180"
          role="img"
          aria-label={`${selected.title} QR 카드`}
          style={{ fontFamily: "Malgun Gothic, Noto Sans KR, sans-serif" }}
        >
          <title>{selected.title} QR 소개 카드</title>
          <rect width="1000" height="1180" fill="#fcfaf6" />
          <rect
            x="40"
            y="40"
            width="920"
            height="1100"
            rx="30"
            fill="white"
            stroke="#ddd5e8"
            strokeWidth="3"
          />
          <text x="85" y="125" fill="#5d478f" fontSize="29" fontWeight="700">
            뚝딱 바이브 공작소
          </text>
          <text x="85" y="220" fill="#302f38" fontSize="52" fontWeight="700">
            퀴즈·이야기·타이머를
          </text>
          <text x="85" y="292" fill="#302f38" fontSize="52" fontWeight="700">
            만들고 고치며 배워요
          </text>
          <text x="85" y="363" fill="#625d69" fontSize="27">
            코드를 몰라도, 규칙 하나부터 직접 바꿔봐요.
          </text>
          <rect
            x="85"
            y="409"
            width="830"
            height="116"
            rx="18"
            fill="#f0eaf8"
          />
          <text x="115" y="458" fill="#5d478f" fontSize="25">
            오늘 함께할 활동
          </text>
          <text x="115" y="500" fill="#302f38" fontSize="29" fontWeight="700">
            {selected.title}
          </text>
          <text
            x="500"
            y="583"
            textAnchor="middle"
            fill="#302f38"
            fontSize="27"
          >
            예상하기 → 눌러보기 → 고치기 → 설명하기
          </text>
          <svg
            x="310"
            y="620"
            width="380"
            height="380"
            viewBox={`0 0 ${qr.size} ${qr.size}`}
            shapeRendering="crispEdges"
            data-testid="share-qr"
          >
            <rect width={qr.size} height={qr.size} fill="white" />
            <path d={qr.path} fill="black" />
          </svg>
          <text
            x="500"
            y="1042"
            textAnchor="middle"
            fill="#5d478f"
            fontSize="26"
            fontWeight="700"
          >
            QR을 읽고 바로 시작하세요 · 학생 가입 없이
          </text>
          <text
            x="500"
            y="1095"
            textAnchor="middle"
            fill="#625d69"
            fontSize="19"
          >
            gmlduqzhd123-lab.github.io/Vibe-for-U/
          </text>
        </svg>
        <a
          className="share-destination"
          href={qr.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {selected.title} 직접 열기 · 새 탭
        </a>
      </article>
    </div>
  );
}
