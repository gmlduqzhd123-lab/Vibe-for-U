import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { downloadText, downloadWorks, readAllWorks } from "./storage";
// 화면을 그리다 오류가 나도 앱 전체가 빈 화면이 되지 않게, 기록을 지킬 수 있는 안전 화면을 보여 준다.
type Props = {
  children: ReactNode;
  // 이 값이 바뀌면(다른 화면으로 이동 등) 오류 화면을 닫고 다시 그린다.
  resetKey?: string;
  onLibrary?: () => void;
};
type State = { error: Error | null; resetKey?: string; backup: string };
export async function backupEverything() {
  const { works, unreadable } = await readAllWorks();
  if (unreadable.length)
    downloadText(
      "뚝딱-읽지-못한-기록.json",
      JSON.stringify(unreadable),
      "application/json",
    );
  return works.length ? downloadWorks(works) : 0;
}
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, resetKey: this.props.resetKey, backup: "" };
  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }
  static getDerivedStateFromProps(props: Props, state: State) {
    return props.resetKey !== state.resetKey
      ? { error: null, resetKey: props.resetKey, backup: "" }
      : null;
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("화면 오류", error, info.componentStack);
  }
  render() {
    const { error, backup } = this.state;
    if (!error) return this.props.children;
    return (
      <section className="panel crash" role="alert">
        <h1>화면을 그리다 문제가 생겼어요</h1>
        <p>
          지금까지 저장된 작품은 기기에 그대로 있어요. 걱정되면 먼저 모든 작품을
          파일로 백업한 뒤 다시 열어 보세요.
        </p>
        <div className="button-row">
          <button
            className="primary"
            onClick={() => {
              this.setState({ backup: "백업 파일을 만드는 중이에요…" });
              backupEverything()
                .then((n) =>
                  this.setState({
                    backup: n
                      ? `작품 백업 파일 ${n}개의 다운로드를 요청했어요.`
                      : "백업할 작품이 없어요.",
                  }),
                )
                .catch(() =>
                  this.setState({
                    backup:
                      "기기 저장소를 열지 못해 백업하지 못했어요. 브라우저를 다시 열어 주세요.",
                  }),
                );
            }}
          >
            모든 작품 파일로 백업
          </button>
          <button onClick={() => this.setState({ error: null })}>
            이 화면 다시 열기
          </button>
          {this.props.onLibrary ? (
            <button onClick={this.props.onLibrary}>작품 선반으로</button>
          ) : (
            <button onClick={() => location.reload()}>앱 새로고침</button>
          )}
        </div>
        {backup ? <p role="status">{backup}</p> : null}
        <details>
          <summary>선생님께 알려 줄 오류 내용</summary>
          <pre>{error.message}</pre>
        </details>
      </section>
    );
  }
}
