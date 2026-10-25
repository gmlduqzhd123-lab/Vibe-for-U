# GitHub 연동·공개 배포 기록

2026-10-25, 사용자가 지정한 저장소에 기존 앱을 연결했습니다.

## 연결

- 저장소: [gmlduqzhd123-lab/Vibe-for-U](https://github.com/gmlduqzhd123-lab/Vibe-for-U)
- 실제 공개 주소: **[뚝딱 바이브 공작소](https://gmlduqzhd123-lab.github.io/Vibe-for-U/)**
- 기본 브랜치: `main`
- 로컬 앱 폴더: `outputs/ttukttak-vibe`
- 원격 `origin`: `https://github.com/gmlduqzhd123-lab/Vibe-for-U.git`
- 첫 확인: 공개 저장소, 크기 0, 원격 커밋·기존 파일 없음. 연결 계정의 쓰기·관리 권한 확인
- 사용자 지정 저장소로 초기 커밋을 푸시하고 `main`의 upstream을 `origin/main`으로 설정. 강제 푸시·기존 이력 삭제 없음

## 배포

- Pages 게시 방식: GitHub Actions (`build_type: workflow`)
- 워크플로: `.github/workflows/pages.yml`
- 트리거: `main` 푸시 / `workflow_dispatch`
- 순서: 설치 → 핵심 테스트 → TypeScript·프로덕션 빌드 → Pages 아티팩트 업로드 → 배포
- 최초 앱 게시 커밋: [`4b927e8cf14b27c694bcfc898516cf6de2536297`](https://github.com/gmlduqzhd123-lab/Vibe-for-U/commit/4b927e8cf14b27c694bcfc898516cf6de2536297)
- 최초 배포 실행: [Actions 40191065221 · 성공](https://github.com/gmlduqzhd123-lab/Vibe-for-U/actions/runs/40191065221)

커밋·푸시·GitHub Actions 배포 성공·공개 페이지 확인을 각각 확인했습니다. 공개 주소는 GitHub Pages API가 반환한 주소를 사용했습니다. 로컬 검사 결과를 공개 배포 성공으로 대신하지 않았습니다.

## 공개 주소 검증

`https://gmlduqzhd123-lab.github.io/Vibe-for-U/`를 실제로 요청하여 HTTP 200, 제목 「뚝딱 바이브 공작소」, JS·CSS의 하위 경로 로딩을 확인했습니다. 런타임 자산은 `index-CqK-IQLh.js`, `index-Bzt7yHr8.css`입니다.

```powershell
npx playwright test -c playwright.public.config.ts
```

**실제 공개 페이지를 대상으로 16개 시나리오가 모두 통과했습니다(41.3초).** 로컬 서버는 이 공개 검사에서 실행하지 않았습니다. 격리된 Edge 브라우저 컨텍스트와 가상 시계를 사용하며, 학습 기록은 해당 테스트 브라우저에만 저장됩니다.

| 공개 검사 | 결과 |
|---|---|
| 가입 없이 시작, 요청·예상·중복 점수 발견·수정·재검사·성찰·새로고침 | 통과 |
| 정상 퀴즈 정답·오답·최종 결과·상태 초기화 | 통과 |
| 이야기 경로 수정·두 결말 방문·시작 복귀 | 통과 |
| 타이머 시작·멈춤·재개·종료 한 번·화면 이동 정리 | 통과 |
| 실제 JSON 다운로드·가져오기, 손상·비지원 파일 거절 | 통과 |
| 저장 실패 주입 시 실패 안내·편집 유지·백업 | 통과 |
| 다음 사용자·선택 기록·작품·앱 전체 삭제, 다른 앱 저장소 보존 | 통과 |
| 실제 AI 기록과 기본 연습 구분, 복사만으로 완료하지 않음 | 통과 |
| 클립보드 실패 시 직접 선택 대안 | 통과 |
| 12미션·8차시·검사표·평가표·미션 새로고침·교사 자료 인쇄 | 통과 |
| 360×640 / 768×1024 / 1440×1000 화면·가로 넘침·axe 검사 | 통과 |
| 키보드 시작·입력·단계 이동 | 통과 |
| 직접 검사 작성·선택 삭제·버전 삭제·대화상자 접근성 | 통과 |
| 다른 단계·작품 선반·포트폴리오·자료실·미션 화면 접근성과 모드 전환 | 통과 |

로컬 핵심 테스트도 연동 시 **17개 통과**, 프로덕션 빌드도 성공했습니다. 공개 검사는 이 앱의 테스트 시나리오 범위이며 실제 휴대전화·학교 기기·Safari·스크린리더·물리 프린터·수업 운영 검증을 뜻하지 않습니다. 외부 AI 도구에서 생성하는 활동 자체도 별도입니다.

이 기록과 공개 테스트 설정을 추가하는 후속 커밋은 문서·검증 설정만 바꾸며 실행 앱의 소스와 빌드 자산은 그대로입니다. 이후 푸시의 최신 결과는 [Actions 목록](https://github.com/gmlduqzhd123-lab/Vibe-for-U/actions)에서 확인할 수 있습니다.

## 이후 변경 반영

```powershell
npm test
npm run build
git add <수정한 파일>
git commit -m "변경 내용"
git push
```

`main` 푸시 후 배포 성공을 확인하고 실제 공개 주소에서 관련 흐름을 재검사하세요. JSON 백업과 브라우저 저장은 여전히 로컬 데이터입니다. GitHub에 푸시하는 소스와 학생의 로컬 학습 기록은 별개입니다.
