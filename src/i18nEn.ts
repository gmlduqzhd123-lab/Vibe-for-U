// 학생 화면 전체의 영어 번역. 영어를 고를 때만 불러온다(src/missionText.ts).
// 한국어 문장이 열쇠이며, {n}처럼 중괄호 안 이름은 화면에서 값으로 바뀐다.
export const en: Record<string, string> = {
  "{n}개로 나눈 파일의 다운로드를 요청했어요. 브라우저의 여러 파일 다운로드를 허용하고 모두 보관해 주세요.":
    "Requested download of {n} split files. Please allow multiple downloads in your browser and keep them all.",
  "「{title}」의 현재 편집본, 버전 {n}개와 모든 검사 기록을 이 기기에서 삭제해요. 먼저 파일로 백업할 수 있어요.":
    "This deletes the current draft of “{title}”, its {n} versions, and all check records from this device. You can back it up to a file first.",
  "이 브라우저의 뚝딱 작품 {n}개와 모든 버전·학습 기록·모드 설정·학급 평가 목록을 삭제해요. 같은 주소의 다른 앱 데이터는 지우지 않아요.":
    "This deletes all {n} Ttukttak works in this browser, plus all versions, learning records, mode settings, and the class review list. Other apps' data at the same address is not deleted.",
  "「{label}」을 버전으로 저장 중이에요. 저장 상태를 확인해 주세요.":
    "Saving “{label}” as a version. Please check the save status.",
  "「{title}」에서 선택한 검사 기록 {n}개를 현재 편집본과 저장 버전에서 삭제해요. 작품 설정과 나머지 기록은 유지돼요.":
    "This deletes {n} selected check records of “{title}” from the current draft and saved versions. The work's settings and other records stay.",
  "「{label}」의 저장된 설정과 검사 묶음을 삭제해요. 현재 편집본과 다른 버전은 유지돼요. 처음 시작 버전은 보존해요.":
    "This deletes the saved settings and checks of “{label}”. The current draft and other versions stay. The first starting version is kept.",
  "{who}의 검사 결과를 ‘친구·교사 의견’ 기록으로 더했어요.":
    "Added {who}'s check results as a “Friend & teacher feedback” record.",
  친구: "Friend",
  "작품 {n}개를 새 ID의 복사본으로 가져왔어요.":
    "Imported {n} works as copies with new IDs.",
  "가져오지 못했어요.": "Couldn't import.",
  "내보낸 JSON 파일을 다시 선택해 주세요.":
    "Please choose the exported JSON file again.",
  "기존 작품은 그대로예요.": "Your existing works are unchanged.",
  "수업 진행 화면": "Class presentation view",
  "제목 없는 작품": "Untitled work",
  "잘 고치는 것도 멋진 만들기예요.": "Fixing things well is great making, too.",
  "한 번에 완벽하지 않아도 괜찮아요. 다시 해 봐요!":
    "It's okay if it's not perfect the first time. Try again!",
  "이 기기에 읽지 못한 기록이 {n}개 있어요. 더 새로운 앱에서 만들었거나 손상된 기록일 수 있어요. 나머지 작품은 그대로 쓸 수 있고, 읽지 못한 기록은 지우지 않았어요.":
    "There are {n} records on this device that couldn't be read. They may be from a newer app or damaged. Your other works still work, and the unread records were not deleted.",
  "읽지 못한 기록 원본 내려받기": "Download unread original records",
  "합치지 못했어요.": "Couldn't merge.",
  "현재 브라우저에 저장된 작품 목록을 확인하거나 작품 파일을 가져와 주세요.":
    "Check the list of works saved in this browser, or import a work file.",
  "엽쌤의 다른 앱 보기 →": "See Yeopssam's other apps →",
  "작품 JSON 파일": "Work JSON file",
  "직접 선택해서 복사해 주세요": "Please select and copy it yourself",
  "브라우저가 클립보드 쓰기를 허용하지 않았어요. 아래 내용을 선택한 뒤 Ctrl+C 또는 기기의 복사 메뉴를 사용해 주세요.":
    "The browser didn't allow copying to the clipboard. Select the text below, then use Ctrl+C or your device's copy menu.",
  "복사할 내용": "Text to copy",
  "내용 전체 선택": "Select all",
  닫기: "Close",
  "삭제 전 파일 백업": "Back up to a file before deleting",
  "처리하지 못했어요. 다시 시도해 주세요.":
    "Something went wrong. Please try again.",
  "대상 삭제": "Delete",
  "누가 쓰나요?": "Who will use it?",
  "우리 반 친구가 쓸": "Friends in my class",
  "동생이 쓸": "My younger sibling",
  "선생님이 쓸": "My teacher",
  "무엇을 만들까요?": "What will you make?",
  "{kind}를 만들고 싶어요.": "I want to make a {kind}.",
  "누르면 어떻게 되나요?": "What happens when you press it?",
  "꼭 지킬 약속": "Rules it must follow",
  "낱말 블록으로 요청 만들기": "Build a request with word blocks",
  "블록을 눌러 고르고, 다시 누르면 빠져요. 다 고르면 아래 버튼으로 원문에 넣어요.":
    "Tap a block to pick it, tap again to remove it. When you're done, use the button below to add it to the original text.",
  "아직 고른 블록이 없어요.": "No blocks picked yet.",
  "원문에 이어 붙이기": "Add to the original text",
  "이 문장을 원문으로 쓰기": "Use this sentence as the original text",
  "검사 이름·기대한 결과 바꾸기": "Edit check name & expected result",
  "검사 이름": "Check name",
  "{label} 기대한 결과": "{label} expected result",
  "검사 기록은 100개까지예요. 백업 후 필요 없는 기록을 선택해 삭제해 주세요.":
    "You can keep up to 100 check records. Back up, then select and delete records you don't need.",
  "{label} 기록 선택": "Select {label} record",
  "자동 검사": "Auto check",
  "학습자 직접 확인": "Checked by me",
  "친구·교사 의견": "Friend & teacher feedback",
  기대: "Expected",
  "어떤 결과여야 하는지 적어 주세요.": "Write what the result should be.",
  실제: "Actual",
  통과: "Pass",
  "수정 필요": "Needs fixing",
  미확인: "Not checked",
  "{label} 실제 결과": "{label} actual result",
  "어떤 버튼을 눌렀고, 실제로 무엇이 보였나요?":
    "Which button did you press, and what did you actually see?",
  "예상과 달라도 실제로 본 내용을 그대로 적어요.":
    "Even if it's different from your prediction, write exactly what you saw.",
  "{label} 확인 상태": "{label} check status",
  "검사 이름, 기대한 결과와 직접 관찰한 실제 결과를 먼저 적어 주세요.":
    "First write the check name, the expected result, and the actual result you saw.",
  "아직 확인하지 않음": "Not checked yet",
  "직접 확인함": "Checked it myself",
  "수정할 점이 있음": "Something to fix",
  "검사 순서와 기록": "Check steps and records",
  "세 가지만 차례로 해 봐요": "Just do these three steps in order",
  "‘자동 검사’로 앱의 규칙을 확인해요.":
    "Use “Auto check” to test the app's rules.",
  "준비된 카드대로 직접 누르고 ‘실제 결과와 확인 상태’를 적어요.":
    "Follow the ready cards, press the buttons yourself, and write the “actual result and check status.”",
  "바꿀 점을 고친 뒤 같은 검사를 다시 하고, ‘이유’를 적어요.":
    "Fix what needs changing, run the same check again, and write the “reason.”",
  "자동 검사 {p}/{n}개 통과": "Auto check: {p}/{n} passed",
  "자동 검사 전": "Before auto check",
  "직접 관찰 {o}/{n}개 기록": "Observed: {o}/{n} recorded",
  "검사 기록을 준비하지 못했어요.": "Couldn't prepare the check records.",
  "현재 설정 자동 검사": "Auto check current settings",
  "이 버튼으로 직접 확인 카드도 함께 준비해요. 자동 검사는 템플릿의 동작만 확인하며, 직접 봤다는 기록을 대신 쓰지 않아요.":
    "This button also prepares your hands-on check cards. Auto check only tests the template's behavior. It doesn't write your “I saw it” records for you.",
  "내 눈으로 확인해요": "Check with your own eyes",
  "위의 자동 검사 버튼을 누르면 이번 미션의 직접 확인 카드가 나와요.":
    "Press the auto check button above to get this mission's hands-on check cards.",
  "자동 검사 결과 {n}개": "{n} auto check results",
  "수정할 규칙이 있어요": "Some rules need fixing",
  "모두 통과했어요": "All passed",
  "검사 카드·친구 의견 더하기": "Add check cards & friend feedback",
  "미션 직접 확인 카드 추가": "Add mission check cards",
  "나의 검사": "My checks",
  "나의 검사 추가": "Add my check",
  "직접 사용한 뒤 의견 듣기": "Get feedback after using it",
  "친구·교사 의견 추가": "Add friend & teacher feedback",
  "이전 설정의 검사 {n}개는 포트폴리오에 보존돼요. 현재 설정에서는 다시 확인해 주세요.":
    "{n} checks from earlier settings are kept in the portfolio. Please check again with the current settings.",
  "선택한 학습 기록 {n}개 삭제": "Delete {n} selected learning records",
  "예상 → 실행 → {test} → 수정": "Predict → Run → {test} → Fix",
  "미션 {n}": "Mission {n}",
  "학습용 오류가 있는 시작 작품": "Starting work with a practice bug",
  "정상 규칙으로 시작하는 작품": "Work that starts with correct rules",
  "이번에는 이렇게 해 봐요": "Try this time",
  "먼저 예상하기": "Predict first",
  "검사할 것": "What to check",
  "완료 기준": "Done when",
  "마무리 질문": "Wrap-up question",
  "생각할 준비 됐나요?": "Ready to think?",
  "여기서는 준비된 코드와 규칙을 바꿔요. 자유로운 요청문 자체를 코드로 실행하지 않아요.":
    "Here you change ready-made code and rules. Your free-form request is not run as code.",
  "이 미션 시작하기": "Start this mission",
  "정상 규칙의 새 작품 만들기": "Make a new work with correct rules",
  "같은 미션 링크 복사": "Copy link to this mission",
  "링크에는 미션 번호만 들어가요. 내 학습 기록은 공유되지 않아요.":
    "The link only has the mission number. Your learning records are not shared.",
  "현재 기기와 브라우저에 저장돼요. 다른 기기에서 이어 하려면 파일로 내보내세요. 공용 기기의 기록은 개인별로 비밀 보호되지 않아요.":
    "Saved on this device and browser. To continue on another device, export to a file. Records on a shared device are not kept private.",
  "이전 사용자의 작품 {n}개는 이어서 학습에 연결하지 않았어요.":
    "{n} works from the previous user were not linked to your learning.",
  "공용 기기 기록을 명시적으로 열기": "Open shared device records on purpose",
  "{n} / 5단계 기록": "{n} / 5 steps recorded",
  "버전 {n}개": "{n} versions",
  "최근 수정": "Last edited",
  "{title} 삭제": "Delete {title}",
  "첫 생각을 담을 빈 선반이에요": "An empty shelf for your first ideas",
  "미션 하나를 골라 작품을 만들어 보세요. 백업 파일이 있다면 가져올 수도 있어요.":
    "Pick a mission and make a work. If you have a backup file, you can import it too.",
  "미션 고르기": "Choose a mission",
  "다음 사용자는 이전 기록을 자동으로 이어받지 않아요. 삭제 전에는 파일 백업을 선택할 수 있어요.":
    "The next user won't automatically get earlier records. You can back up to a file before deleting.",
  "가져오기: JSON 2MB 이하 · 한 파일 최대 50작품 · 작품당 버전 30개 · 문항 20개 · 장면 24개 · 글 4,000자":
    "Import: JSON up to 2MB · up to 50 works per file · 30 versions per work · 20 questions · 24 scenes · 4,000 characters",
  "실행 화면": "Run view",
  "준비된 패턴 그리기 템플릿": "Ready-made pattern drawing template",
  "{n}×{n} 판 · 칠한 칸 {p}개 · 현재 위치 {at}":
    "{n}×{n} board · {p} cells colored · now at {at}",
  "점선은 목표 칸 {n}개": "Dotted lines show {n} target cells",
  "목표 모양을 점선으로 보기": "Show target shape with dotted lines",
  "모두 그리기": "Draw all",
  "한 칸씩 그리기": "Draw one cell",
  "↺ 처음으로": "↺ Start over",
  "다 그렸어요. 목표와 달라요: 빠진 칸 {m}개, 더 칠한 칸 {e}개":
    "Done drawing. It doesn't match the target: {m} cells missing, {e} extra cells",
  "다 그렸어요. 목표 모양과 같아요!":
    "Done drawing. It matches the target shape!",
  "그리기 전에 어떤 모양이 나올지 예상해 보세요.":
    "Before drawing, predict what shape will appear.",
  "동작 설명 · 지금 앱이 기억하는 값":
    "How it works · values the app remembers now",
  "명령 묶음을 {n}번 반복 → 한 칸씩 이동 →":
    "Repeat the command set {n} times → move one cell at a time →",
  "만약 다음 칸이 막혀 있으면 오른쪽으로 돌기":
    "If the next cell is blocked, turn right",
  "판 밖이면 멈추기": "Stop if off the board",
  "판 밖이면 반대편으로 넘어가기": "Wrap to the other side if off the board",
  "→ 도착한 칸 칠하기": "→ Color the cell you land on",
  "현재 위치": "Current position",
  "칠한 칸": "Colored cells",
  이동: "Moves",
  "넘어감 · 멈춤": "Wrapped · Stopped",
  "조건으로 돈 횟수": "Turns by condition",
  "명령:": "Commands:",
  "{dir} {n}칸": "{dir} {n} cells",
  "판 크기 ({a}~{b}칸)": "Board size ({a}–{b} cells)",
  "명령 묶음 반복 (1~{n}번)": "Repeat command set (1–{n} times)",
  "판 가장자리 규칙": "Board edge rule",
  "가장자리에서 멈추기 (정상 규칙)": "Stop at the edge (correct rule)",
  "반대편으로 넘어가기 (학습용 규칙)": "Wrap to the other side (practice rule)",
  "조건 규칙 · 만약 다음 칸이 막혀 있으면 (판 끝·이미 칠한 칸)":
    "Condition rule · If the next cell is blocked (board edge or already colored)",
  "조건 없음 (가장자리 규칙을 따름)": "No condition (follow the edge rule)",
  "오른쪽으로 돌아서 계속 가기": "Turn right and keep going",
  "명령 묶음 · 위에서부터 차례대로": "Command set · in order from the top",
  "명령 {n} 방향": "Command {n} direction",
  "명령 {n} 칸 수": "Command {n} cells",
  "명령 {n} 삭제": "Delete command {n}",
  "명령 추가": "Add command",
  "목표 모양 · 칸을 눌러 넣고 빼요":
    "Target shape · tap cells to add or remove",
  "목표 칸 고르기": "Choose target cells",
  "목표 칸 {id}": "Target cell {id}",
  "명령은 {n}개까지, 한 명령은 {k}칸까지예요. 칸 이름은 (가로, 세로)이고 왼쪽 위가 (0,0)이에요.":
    "Up to {n} commands, and up to {k} cells per command. Cells are named (across, down), and the top left is (0,0).",
  "아직 기록하지 않았어요.": "Not recorded yet.",
  확인됨: "Checked",
  "만든 결과와, 만들어 온 과정": "What you made, and how you made it",
  "나의 과정 포트폴리오": "My process portfolio",
  "쓴 문장의 길이가 아닌, 생각과 검사의 근거를 모아요.":
    "We collect the reasons behind your thinking and checks, not how long you wrote.",
  "이어서 기록하기": "Keep recording",
  "뚝딱 작품": "Ttukttak work",
  "작품 파일": "Work file",
  "인쇄 / PDF 저장": "Print / Save PDF",
  "과정 기록": "Process record",
  "{n}단계": "Step {n}",
  "기록 남음": "Recorded",
  "01. 만들 앱과 처음 정한 요구사항": "01. The app and first requirements",
  "사용할 사람": "Who will use it",
  "해결할 문제": "Problem to solve",
  "처음 정한 기능": "First planned features",
  "처음 완료 조건": "First done-when rules",
  "현재 완료 조건": "Current done-when rules",
  "입력과 예외": "Inputs and exceptions",
  "처음 쓴 요청문": "First request",
  "정리한 요청문": "Cleaned-up request",
  "02. 실행 전 예상": "02. Prediction before running",
  "현재 설정 실행 기록:": "Current settings run record:",
  "직접 버튼을 눌러 봄": "Pressed the buttons myself",
  "현재 설정은 아직 실행하지 않음": "Current settings not run yet",
  "03. 기대와 실제 · 검사 기록": "03. Expected vs. actual · check records",
  "자동 검사는 기본 연습 템플릿의 동작을 확인합니다. 직접 확인과 의견은 사용자가 기록한 내용입니다.":
    "Auto check tests the basic practice template's behavior. Hands-on checks and feedback are what users recorded.",
  "학습 검사 기록표 · 좌우 방향키로 이동해 읽기":
    "Learning check table · use left/right arrow keys to read",
  "검사한 작품 / 출처": "Checked work / source",
  "검사와 기대": "Check and expected result",
  "실제 결과": "Actual result",
  판정: "Result",
  "아직 검사 기록이 없어요.": "No check records yet.",
  "04. 발견한 문제와 수정 · 재검사": "04. Problems found, fixes, and rechecks",
  "수정 전후 버전": "Versions before and after fixing",
  "저장한 이유:": "Reason saved:",
  "수정 이유:": "Reason for fix:",
  "해당 설정 검사:": "Checks for these settings:",
  미기록: "Not recorded",
  "원본 설정 데이터 보기": "View original settings data",
  "05. 작동 원리와 새로운 과제에 적용":
    "05. How it works and using it in new tasks",
  "도움받은 내용": "Help I got",
  "미션 힌트:": "Mission hint:",
  "{n}번째 힌트까지 열어 봄": "Opened up to hint {n}",
  "열어 보지 않음": "Not opened",
  "06. 실제 AI 제작 활동 (별도 기록)":
    "06. Real AI build activity (separate record)",
  "사용 도구:": "Tool used:",
  "도움:": "Help:",
  "실행 전 예상:": "Prediction before running:",
  "검사 기준:": "Check criteria:",
  "실제 관찰:": "What I actually saw:",
  "사용자 판정:": "My judgment:",
  "기준 충족을 관찰함": "Saw that it met the criteria",
  "수정할 점을 관찰함": "Saw something to fix",
  "수정 요청:": "Fix request:",
  "요청문 복사 여부로 실제 AI 제작 완료를 판단하지 않으며, 외부 AI 코드를 자동으로 검증하지 않습니다.":
    "Copying a request does not mean the real AI build is done, and code from outside AI is not checked automatically.",
  "07. 과정 평가 · 나와 선생님": "07. Process assessment · Me and my teacher",
  "작품 기록을 근거로 매긴 단계예요. 앱이 자동으로 매긴 점수가 아니에요.":
    "These levels are based on your work records. They are not scores the app gave automatically.",
  "과정 평가 비교표 · 좌우 방향키로 이동해 읽기":
    "Process assessment comparison table · Use the left and right arrow keys to read",
  "관찰 항목": "What we looked at",
  "나의 평가": "My assessment",
  "선생님의 평가": "Teacher's assessment",
  "스스로 돌아보며 다음에 해 볼 것": "Looking back: what I'll try next",
  "선생님 · 확인한 근거와 다음 도움":
    "Teacher · Evidence checked and next help",
  "선생님 평가:": "Teacher's assessment:",
  "준비된 퀴즈 템플릿": "Ready-made quiz template",
  완료: "Done",
  "문제 {i} / {n}": "Question {i} / {n}",
  "{n}점": "{n} pts",
  "퀴즈를 모두 풀었어요!": "You finished the quiz!",
  "최종 점수": "Final score",
  "결과 보기": "See results",
  "다음 문제": "Next question",
  "답이라고 생각하는 것을 눌러 보세요.": "Tap the answer you think is right.",
  "↺ 다시 시작": "↺ Start over",
  점수: "Score",
  "문제 번호": "Question number",
  "이미 답함": "Already answered",
  예: "Yes",
  아니요: "No",
  "채점 규칙:": "Scoring rule:",
  "아직 답하지 않았을 때만 점수 반영": "Add points only if not answered yet",
  "누를 때마다 점수 반영 (학습용)": "Add points on every tap (practice)",
  "문제당 {n}점": "{n} pts per question",
  "준비된 이야기 템플릿": "Ready-made story template",
  "나의 선택, 새로운 장면": "My choice, a new scene",
  "이야기의 결말": "The end of the story",
  "↺ 처음으로 돌아가기": "↺ Back to the start",
  "동작 설명 · 장면의 연결": "How it works · Linking scenes",
  "선택 → 연결된 장면 ID 확인 → 현재 장면 변경 → 새 장면 표시":
    "Choice → Check linked scene ID → Change current scene → Show new scene",
  "현재 장면:": "Current scene:",
  "준비된 타이머 템플릿": "Ready-made timer template",
  "시간이 흐르고 있어요": "Time is running",
  "시간 종료": "Time's up",
  "멈춘 상태": "Paused",
  시작: "Start",
  재개: "Resume",
  일시정지: "Pause",
  초기화: "Reset",
  "종료 안내 표시가 꺼져 있어요.": "The time's-up message is turned off.",
  "시작 전 시간을 예상해 보세요.":
    "Before you start, guess how long it will take.",
  "동작 설명 · 시간과 상태": "How it works · Time and state",
  "시작 → 실행 중인지 확인 → 종료 시각 기억 → 현재 시각과의 차이 표시":
    "Start → Check if running → Remember end time → Show difference from current time",
  "남은 초": "Seconds left",
  "실행 중": "Running",
  "안내 횟수": "Message count",
  "멈추면 남은 시간을 기억해요. 화면을 떠나면 실행을 정리하며, 다시 열면 정지 상태예요.":
    "When paused, it remembers the time left. If you leave the screen, it stops running, and it will be stopped when you open it again.",
  "뚝딱 바이브 공작소 홈": "Ttukttak Vibe Workshop home",
  앱: "App",
  설치: "Install",
  "QR 코드로 접속": "Open with QR code",
  "전체 메뉴": "All menus",
  "첫 작품 만들기": "Make your first work",
  "작은 앱으로 배우는 코딩의 원리": "Learn how coding works with tiny apps",
  "누가 사용하나요": "Who is it for?",
  "퀴즈·이야기·타이머를 만들고 고치며 배워요":
    "Learn by making and fixing quizzes, stories, and timers",
  "직접 해 보고 싶어요": "I want to try it myself",
  "학생으로 시작": "Start as a student",
  "3분 체험에서 작은 퀴즈를 고쳐봐요": "Fix a small quiz in a 3-minute tryout",
  "체험 시작": "Start tryout",
  "수업에 활용하고 싶어요": "I want to use it in class",
  "교사로 시작": "Start as a teacher",
  "40분 수업과 활동지를 준비해요":
    "Get a 40-minute lesson and worksheets ready",
  "수업 준비": "Prepare lesson",
  "전에 만든 작품이 있나요?": "Have you made a work before?",
  "이어서 만들기": "Keep making",
  "가입 없이 시작해요": "Start without signing up",
  "학습 기록은 내 기기에 남아요": "Your learning records stay on your device",
  "채점 규칙": "Scoring rule",
  "문제당 한 번 (정상 규칙)": "Once per question (normal rule)",
  "누를 때마다 (학습용 규칙)": "On every tap (practice rule)",
  "문제당 점수 (1~10)": "Points per question (1–10)",
  "다시 시작할 때 점수 초기화": "Reset score when starting over",
  "정답 안내": "Correct answer message",
  "오답 안내": "Wrong answer message",
  "문항 {n}": "Question {n}",
  "문항 {n} 내용": "Question {n} text",
  "문항 {n} 선택지 {k}": "Question {n} choice {k}",
  "문항 {n} 정답": "Question {n} answer",
  "{n}번": "No. {n}",
  "새 선택지": "New choice",
  "선택지 추가": "Add choice",
  "마지막 선택지 삭제": "Delete last choice",
  "문항 삭제": "Delete question",
  "새 문제를 적어 주세요.": "Write a new question.",
  "선택 1": "Choice 1",
  "선택 2": "Choice 2",
  "문항 추가": "Add question",
  "최대 문항 20개 · 선택지 6개. 설정을 바꾸면 실행 화면은 처음으로 돌아가요.":
    "Up to 20 questions · 6 choices. Changing settings sends the run screen back to the start.",
  "시작 장면": "Start scene",
  "장면 {n}": "Scene {n}",
  "장면 {n} 제목": "Scene {n} title",
  "장면 {n} 설명": "Scene {n} description",
  다음으로: "Next",
  "결말 장면": "Ending scene",
  "도달해야 하는 결말에 포함": "Include in endings to reach",
  "장면 {n} 선택 {k}": "Scene {n} choice {k}",
  "도착 장면 {n}": "Goes to scene {n}",
  "이 선택 삭제": "Delete this choice",
  "새로운 길": "A new path",
  "선택 추가": "Add choice",
  "장면 삭제": "Delete scene",
  "새로운 결말": "A new ending",
  "어떤 일이 생겼나요?": "What happened?",
  "새 장면 추가": "Add new scene",
  "최대 장면 24개 · 장면마다 선택 6개. 장면을 삭제하면 해당 장면으로 가던 길은 시작 장면으로 연결돼요.":
    "Up to 24 scenes · 6 choices per scene. If you delete a scene, paths that led to it will link to the start scene.",
  "제한 시간 (1~3,600초)": "Time limit (1–3,600 seconds)",
  "0초가 되면 종료 안내 표시": "Show time's-up message at 0 seconds",
  "종료 안내 문장": "Time's-up message",
  "시작을 여러 번 눌러도 한 번만 실행해요. 남은 시간은 0보다 작아지지 않고, 종료 안내는 한 번만 나와요.":
    "Pressing Start many times runs it only once. Time left never goes below 0, and the time's-up message shows only once.",
  "공유 창으로 파일을 보냈어요.": "Sent the file with the share window.",
  "공유하지 못했어요. 내려받기로 저장해 보내 주세요.":
    "Couldn't share. Please download it and send it.",
  "장면 연결 지도": "Scene link map",
  "시작에서 갈 수 없는 장면 {n}개": "Scenes not reachable from start: {n}",
  "모든 장면에 갈 수 있어요": "Every scene can be reached",
  "닿을 수 없는 목표 결말 {n}개": "Goal endings that can't be reached: {n}",
  "장면 {n}개의 연결 지도. 아래 목록에 같은 연결이 있어요.":
    "Link map of {n} scenes. The list below shows the same links.",
  "갈 수 없음": "Can't reach",
  "목표 결말": "Goal ending",
  결말: "Ending",
  장면: "Scene",
  "시작에서 갈 수 없어요": "Can't be reached from the start",
  "기본 연습실": "Basic practice room",
  "실제 AI 제작 활동": "Real AI build activity",
  "이 탭은 읽기 전용이에요. 두 탭에서 함께 고치면 나중에 저장한 쪽이 앞의 내용을 덮어쓸 수 있어요.":
    "This tab is read-only. If you edit in two tabs, the one saved last may overwrite the other.",
  "실행 화면도 이 설정을 사용해요": "The run screen uses these settings too",
  "학습용 오류 규칙 포함": "Include practice bug rules",
  "현재 설정으로 검사해 보세요": "Check with the current settings",
  "실제 AI 제작 기록": "Real AI build record",
  "준비된 코드와 규칙을 바꾸며 연습해요.":
    "Practice by changing ready-made code and rules.",
  "외부 도구는 교사·성인이 조작해요.":
    "A teacher or adult uses the outside tools.",
  "실제 AI 활동": "Real AI activity",
  "요청은 여기서, 실제 제작은 외부 도구에서":
    "Write the request here, build it in an outside tool",
  "내가 쓴 요청문과 검사 조건을 교사·성인에게 전달해요. 교사·성인이 외부 AI 도구로 만들고 실행하면, 그 결과를 함께 관찰해요.":
    "Give your request and check conditions to a teacher or adult. When they build and run it with an outside AI tool, watch the result together.",
  "외부 AI 개발 도구에 요청문을 붙여 넣어 생성·실행한 뒤 직접 관찰한 결과를 기록하세요.":
    "Paste the request into an outside AI coding tool, build and run it, then record what you saw yourself.",
  "복사만으로 실제 제작이 완료되지는 않아요.":
    "Copying alone does not finish the real build.",
  "제작 요청문 복사": "Copy build request",
  "수정 요청문 복사": "Copy fix request",
  "실제로 사용한 외부 AI 도구명": "Name of the outside AI tool you used",
  "도구에서 도움받은 내용": "How the tool helped",
  "외부 실행 전 예상": "Prediction before running outside",
  "외부 결과의 검사 기준": "Check criteria for the outside result",
  "실제로 실행하여 관찰한 결과": "What I saw when I actually ran it",
  "내가 확인한 외부 결과": "Outside result I checked",
  "직접 검사 기준 충족을 관찰함": "Saw it meet my check criteria myself",
  "수정할 동작을 관찰함": "Saw a behavior to fix",
  "외부 AI에 보낼 수정 요청문": "Fix request to send to outside AI",
  "이 수정 요청문 복사": "Copy this fix request",
  "아래 실행 화면과 자동 검사는 기본 연습 템플릿만 확인해요. 외부 AI 코드의 동작을 자동 검증하지 않아요.":
    "The run screen and auto check below only check the basic practice template. They do not check outside AI code automatically.",
  "아래 내용은 시작 예시예요. 내 생각에 맞게 고치고, 아래의 ‘이 약속으로 만들기’를 눌러 확인해요.":
    "This is a starting example. Change it to match your idea, then tap “Make with this promise” below to check.",
  "작품 제목": "Work title",
  "입력 · 조건 · 앱이 기억하는 값":
    "Input · Condition · Values the app remembers",
  "입력은 내가 누른 답이에요. 조건은 “정답인가? 이미 답했나?”를 확인하는 약속이에요. 앱은 점수와 문제 번호처럼 다음 행동에도 필요한 값을 기억해요.":
    "Input is the answer you tapped. A condition is a rule that checks “Is it right? Was it already answered?” The app remembers values it needs next, like the score and question number.",
  "글쓰기가 어렵다면 · 낱말 블록으로 만들기":
    "If writing is hard · Build with word blocks",
  "내가 처음 쓴 요청문 (원문)": "My first request (original text)",
  "우리 반 친구가 쓸 퀴즈를 만들고 싶어요. 답을 고르면…":
    "I want to make a quiz for my classmates. When you pick an answer…",
  "목적과 원하는 기능을 자유롭게 적으세요.":
    "Write your goal and the features you want.",
  "만들기 약속으로 요청문 정리": "Tidy up the request with build promises",
  "정리한 제작 요청문": "Tidied-up build request",
  "원문은 따로 보존해요. 자유롭게 적은 문장을 실행 코드로 바꾸지 않아요. 실행 결과는 다음 단계에서 확인한 설정과 규칙에 따라 결정돼요.":
    "The original text is kept separately. Free writing is not turned into code. What happens when it runs depends on the settings and rules you check in the next step.",
  "실행 전 나의 예상": "My prediction before running",
  "이렇게 누르면… 이렇게 될 것 같아요. 왜냐하면…":
    "If I tap this… I think this will happen. Because…",
  "예상 문장 시작 블록": "Prediction sentence starter blocks",
  "설정과 규칙": "Settings and rules",
  "설정을 바꾸면 새 설정 버전이 생겨요. 이전 검사 기록은 보존되며 재검사가 필요해요.":
    "Changing settings makes a new settings version. Earlier check records are kept, and you need to check again.",
  "이번 수정 과제": "This fix task",
  "바꾼 내용과 이유를 남겨요": "Write what you changed and why",
  "바꾸려는 동작": "Behavior to change",
  "예: 한 번 답한 문제는 다시 채점하지 않게 바꿨어요.":
    "e.g. I changed it so a question already answered isn't scored again.",
  "왜 이렇게 수정했나요?": "Why did you fix it this way?",
  "문제가 없었다면, 무엇을 더 좋게 바꾸었거나 그대로 둔 이유를 적어도 좋아요.":
    "If there was no problem, you can write what you made better or why you left it as is.",
  "수정 요청문을 보낼 때 · 자세한 기록":
    "When sending a fix request · Detailed record",
  "친구에게 검사 부탁하기": "Ask a friend to check",
  "요청 파일에는 앱 설정과 검사 항목만 들어가요. 친구가 자기 기기의 ‘친구 작품 검사하기’에서 열어 결과 파일을 돌려주면, ‘파일 가져오기’로 열어 친구 의견 기록으로 더해요.":
    "The request file only has the app settings and check items. When your friend opens it in “Check a friend's work” on their device and sends back a result file, open it with “Import file” to add it as friend feedback.",
  "친구 검사 요청 파일 만들기": "Make a peer check request file",
  "친구 검사 요청": "Peer check request",
  "요청 파일 공유로 보내기": "Send request file with share",
  "설정으로 돌아가 수정하기": "Go back to settings to fix",
  "작동 원리와 배운 점": "How it works and what I learned",
  "내가 누른 것 → 적용한 규칙 → 기억하는 값 → 화면에 나온 결과":
    "What I tapped → Rule used → Value remembered → Result on screen",
  "친구·교사·도구에게 도움받은 내용": "Help from friends, teachers, or tools",
  "어떤 도움을 받았나요? 혼자 했다면 그렇게 적어도 좋아요.":
    "What help did you get? If you did it alone, you can write that.",
  "✓ 검사 확인 기록": "✓ Check record",
  "✓ 설정 변경 후 재검사 기록": "✓ Re-check recorded after changing settings",
  "✓ 수정 이유 작성": "✓ Wrote a reason for the fix",
  "배지는 확인 가능한 기록에 연결돼요. 이해도나 창의성 점수는 자동으로 매기지 않아요.":
    "Badges link to records you can check. Understanding and creativity are not scored automatically.",
  "나의 과정 스스로 평가하기": "Assess my own process",
  "내 기록을 보고 네 가지 항목에서 어디까지 했는지 골라요. 선생님 평가와 함께 포트폴리오에 나와요.":
    "Look at your records and pick how far you got in each of the four areas. It shows in your portfolio with your teacher's rating.",
  "포트폴리오 모아 보기": "View portfolio",
  "이 단계의 기록이 채워졌어요.": "This step's records are filled in.",
  "예시를 읽고, 내 약속을 정한 뒤 아래 버튼으로 확인해 주세요.":
    "Read the example, set your own promise, then check it with the button below.",
  "원문과 정리한 요청문을 모두 적어 주세요.":
    "Please write both the original text and your cleaned-up request.",
  "예상을 적고 현재 설정의 앱을 눌러 보세요.":
    "Write your prediction, then try the app with the current settings.",
  "직접 관찰·수정 이유를 적고, 미확인·수정 필요 항목을 다시 검사해요.":
    "Write what you saw and why you fixed it, then re-check items that are unchecked or need fixing.",
  "작동 원리와 도움받은 내용을 적어 주세요.":
    "Write how it works and what help you got.",
  "빈 만들기 약속을 먼저 채워 주세요.":
    "Please fill in the empty making promises first.",
  "설명과 성찰 기록": "Explanation and reflection",
  "직접 해 보는 작은 앱": "A tiny app to try yourself",
  "기본 연습": "Basic practice",
  "누르기 전에, 어떻게 될지 예상해 볼까요?":
    "Before you tap, can you guess what will happen?",
  "예상을 적은 다음 직접 실행하면 과정 기록으로 남아요.":
    "Write a prediction, then run it, and it is saved in your process record.",
  "먼저 예상 적기": "Write a prediction first",
  "예상과 달라도 괜찮아요.":
    "It's okay if it's different from your prediction.",
  "어떤 규칙 때문인지 찾아보는 게 배움이에요.":
    "Finding which rule caused it is how you learn.",
  "{n} / 30개": "{n} / 30",
  "버전은 고치기 전후의 모습을 이름 붙여 남긴 것이에요. 저장한 모습을 비교하거나 다시 열 수 있어요.":
    "A version is a named snapshot from before or after a fix. You can compare saved versions or open them again.",
  "이번 버전 이름": "Name for this version",
  "예: 중복 점수 수정 후 재검사": "e.g. Re-check after fixing double points",
  "현재 편집본을 버전으로 저장": "Save current draft as a version",
  "자동 저장은 현재 편집 내용을 보관해요. 버전 저장은 설정·검사·수정 이유를 한 묶음으로 남겨요. 복원 전 편집본도 버전으로 보존해요. 버전은 30개·묶음 600KB까지, 직접 검사 글은 항목당 500자까지 보관해요.":
    "Autosave keeps what you are editing now. Saving a version keeps settings, checks, and fix reasons together. The draft from before a restore is also kept as a version. You can keep up to 30 versions (600KB total), and up to 500 characters per check note.",
  "이 버전 복원": "Restore this version",
  "이 버전 삭제": "Delete this version",
  "두 버전에서 바뀐 점": "What changed between the two versions",
  "설정과 기록이 같아요.": "Settings and records are the same.",
  "설정과 규칙은 같아요.": "Settings and rules are the same.",
  "이전에만 있음:": "Only in the earlier one:",
  "다음에 새로 생김:": "New in the later one:",
  "요약에 드러나지 않는 설정(문항·장면 내용 등)이 바뀌었어요.":
    "Settings not shown in the summary (like question or scene content) changed.",
  "바뀐 기록:": "Changed records:",
  "나란히 실행 닫기": "Close side-by-side run",
  "두 버전 나란히 실행해 보기": "Run two versions side by side",
  "이전 버전 실행": "Run earlier version",
  "다음 버전 실행": "Run later version",
  "나란히 실행은 비교용이에요. 여기서 누른 결과는 실행 기록으로 남지 않아요.":
    "Side-by-side run is just for comparing. What you tap here is not saved as a run record.",
  "비교할 이전 버전": "Earlier version to compare",
  "비교할 다음 버전": "Later version to compare",
  "현재 편집본": "Current draft",
  "설정 {rev} · 검사 {n}개": "Settings {rev} · {n} checks",
  "예상:": "Prediction:",
  "원문:": "Original text:",
  "정리한 요청:": "Cleaned-up request:",
  "설정과 해당 검사 기록 자세히 보기": "See settings and their check records",
  "문항 {n}개 · 문제당 {p}점": "{n} questions · {p} points each",
  "채점: {v}": "Scoring: {v}",
  "문제마다 한 번만": "Only once per question",
  "정답을 누를 때마다 (학습용 오류)":
    "Every time the right answer is tapped (practice bug)",
  "다시 시작: {v}": "Restart: {v}",
  "점수·문제 번호·응답 상태 모두 초기화":
    "Reset score, question number, and answers",
  "점수는 유지하고 문제 번호·응답 상태 초기화":
    "Keep score, reset question number and answers",
  "정답 안내: {v}": "Right-answer message: {v}",
  "오답 안내: {v}": "Wrong-answer message: {v}",
  "장면 {n}개 · 도달해야 할 결말 {e}개": "{n} scenes · {e} endings to reach",
  "시작: {v}": "Start: {v}",
  "{from}에서 ‘{choice}’ → {to}": "From {from}, ‘{choice}’ → {to}",
  "판 {s}×{s} · 명령 묶음 {r}번 반복":
    "Board {s}×{s} · repeat commands {r} times",
  "명령: {v}": "Commands: {v}",
  "가장자리: {v}": "At the edge: {v}",
  멈추기: "Stop",
  "반대편으로 넘어가기 (학습용 오류)": "Wrap to the other side (practice bug)",
  "조건: 만약 다음 칸이 막히면 오른쪽으로 돌기":
    "Condition: if the next cell is blocked, turn right",
  "목표 칸 {n}개": "{n} target cells",
  "제한 시간: {n}초": "Time limit: {n} sec",
  "종료 안내: {v}": "End message: {v}",
  표시함: "Shown",
  "표시하지 않음 (학습용 오류)": "Not shown (practice bug)",
  "안내 문장: {v}": "Message: {v}",
  "다시 열면 정지 상태로 시작": "Starts stopped when reopened",
  "이전 설정 (버전 저장 전)": "Earlier settings (before saving a version)",
  "발생 상황": "When it happened",
  "기대한 결과": "Expected result",
  "유지할 동작": "Behavior to keep",
  "수정 후 검사": "Check after fixing",
  "수정 이유": "Reason for fix",
  "기록 보존 상태": "Record safety status",
  "보존 요청 허락됨": "Keep request allowed",
  "보존 요청 전": "Keep not requested yet",
  "사용 중": "In use",
  "사용 가능 약 {n}": "About {n} available",
  "브라우저 저장 공간이 부족해도 이 앱의 기록을 먼저 지우지 않아요. 브라우저 데이터를 직접 삭제하면 지워지니 파일 백업도 함께 해 주세요.":
    "Even if browser storage runs low, this app's records won't be erased first. Deleting browser data yourself will erase them, so back up to a file too.",
  "보존을 요청하지 않으면 저장 공간이 부족할 때 브라우저가 기록을 지울 수 있어요. 공용 기기라면 꼭 파일로도 백업해 주세요.":
    "If you don't ask to keep records, the browser may erase them when storage runs low. On a shared device, be sure to back up to a file too.",
  "저장 공간이 거의 찼어요. 오래된 작품을 백업한 뒤 정리해 주세요.":
    "Storage is almost full. Back up old works, then clean them up.",
  "이 기기에 기록 보존 요청": "Ask to keep records on this device",
  "작은 생각을 만드는 공작소 친구": "Your workshop buddy for small ideas",
  "막히면 힌트를 열어 보세요": "Stuck? Open a hint",
  "힌트 {n}": "Hint {n}",
  "기기 설정을 저장하지 못했어요. 현재 화면에서는 계속 사용할 수 있어요. 파일 백업을 권장해요.":
    "Couldn't save device settings. You can keep using this screen. Backing up to a file is recommended.",
  "기기 저장소를 열 수 없어요. 편집은 계속할 수 있으며, 파일로 내보내어 보관해 주세요.":
    "Can't open device storage. You can keep editing, but please export to a file to keep it.",
  "다른 탭에서 이 작품을 편집하고 있어요. 이 탭에서 편집하기를 누른 뒤 다시 시도해 주세요.":
    "This work is being edited in another tab. Tap Edit in this tab, then try again.",
  "한 단계 되돌렸어요.": "Undid one step.",
  "되돌린 것을 다시 했어요.": "Redid what you undid.",
  "먼저 복사할 내용을 작성해 주세요.": "Please write something to copy first.",
  "클립보드에 복사했어요.": "Copied to clipboard.",
  "작품 JSON 파일의 다운로드를 요청했어요.":
    "Requested download of the work JSON file.",
  "파일을 만들지 못했어요. 불필요한 버전을 백업 후 정리해 주세요.":
    "Couldn't make the file. Back up and remove versions you don't need.",
  "백업할 작품이 없어요.": "No works to back up.",
  "선택한 작품을 삭제했어요.": "Deleted the selected work.",
  "다음 사용자는 새 작품으로 시작해요.":
    "The next user starts with a new work.",
  "버전은 작품당 30개까지예요. 파일로 백업해 주세요.":
    "Each work can have up to 30 versions. Please back up to a file.",
  "버전 이름을 적어 주세요.": "Please name the version.",
  "수정 버전 묶음은 600KB까지예요. 파일 백업 후 새 작품으로 이어 가거나 불필요한 버전을 삭제해 주세요.":
    "Versions can total up to 600KB. Back up to a file and continue in a new work, or delete versions you don't need.",
  "복원 전 편집본을 보존할 공간이 필요해요. 먼저 파일로 백업해 주세요.":
    "Space is needed to keep the draft from before restoring. Please back up to a file first.",
  "복원 전 편집본을 보존할 공간이 부족해요. 먼저 파일로 백업하고 불필요한 버전을 삭제해 주세요.":
    "Not enough space to keep the draft from before restoring. Back up to a file first and delete versions you don't need.",
  "선택한 설정과 검사 기록을 복원했어요. 실행은 처음·정지 상태로 열려요.":
    "Restored the selected settings and check records. The app opens at the start, stopped.",
  "친구 검사 요청 파일이에요. 친구 작품 검사하기 화면에서 열었어요.":
    "This is a peer check request file. It opened in the Check a friend's work screen.",
  "평가 목록을 이 기기에 보관하지 못했어요. CSV나 평가 파일로 내려받아 두세요.":
    "Couldn't keep the rating list on this device. Download it as a CSV or rating file.",
  "이번 미션의 카드는 이미 준비되어 있어요. 실제 결과와 확인 상태를 기록해 주세요.":
    "Cards for this mission are already ready. Record the actual results and check status.",
  "친구 작품을 열었어요. 먼저 예상하고 직접 눌러 보세요.":
    "Opened your friend's work. Predict first, then try it yourself.",
  "파일을 다시 골라 주세요.": "Please choose the file again.",
  "검사 결과 파일을 만들었어요. 친구에게 돌려주면 친구가 ‘파일 가져오기’로 열어요.":
    "Made the check result file. Give it back to your friend, who opens it with ‘Import file’.",
  "완성 예제 눌러보기": "Try finished examples",
  "8차시 수업 안내": "8-lesson class guide",
  "검사표 · 짝 활동": "Checklist · pair activity",
  "과정 평가표": "Process rubric",
  "학급 작품 모으기": "Collect class works",
  "시범 작품": "Demo work",
  "어떤 상황에서 생긴 문제인가요?": "When did the problem happen?",
  "그대로 유지할 동작": "Behavior to keep the same",
  "수정 후 다시 할 검사": "Check to do again after fixing",
  "브라우저가 이 기기의 기록 보존을 허락했어요.":
    "The browser allowed keeping records on this device.",
  "브라우저가 보존을 허락하지 않았어요. 앱을 홈 화면에 설치하거나 자주 쓰면 허락될 수 있어요. 파일 백업을 권장해요.":
    "The browser didn't allow keeping records. Installing the app on your home screen or using it often may help. Backing up to a file is recommended.",
  "이 작품을 삭제할까요?": "Delete this work?",
  "이 앱의 데이터 전체를 삭제할까요?": "Delete all of this app's data?",
  "다음 사용자를 시작할까요?": "Start the next user?",
  "기존 작품은 삭제하지 않지만 목록에서 접어 두고, 이어서 학습 연결을 비워요. 공용 기록은 내 작품 화면에서 명시적으로 다시 열 수 있어요. 다음 사용자는 새 미션부터 시작해요.":
    "Existing works are not deleted, but they are folded away in the list and the continue-learning link is cleared. Shared records can be reopened on purpose from the My works screen. The next user starts from a new mission.",
  "다음 사용자로 시작": "Start as next user",
  "복원 전 편집본": "Draft before restore",
  "선택한 학습 기록을 삭제할까요?": "Delete the selected learning records?",
  "이 수정 버전을 삭제할까요?": "Delete this fixed version?",
  "답을 누르면 맞았는지 알려 줘요.": "Tap an answer to see if it's right.",
  "점수를 보여 줘요.": "Shows the score.",
  "마지막에 결과를 보여 줘요.": "Shows the result at the end.",
  "같은 답을 여러 번 눌러도 점수는 한 번만 올라요.":
    "Tapping the same answer many times adds points only once.",
  "다시 시작하면 0점이 돼요.": "Restarting sets the score to 0.",
  "고른 길에 따라 다른 장면이 나와요.":
    "Different paths lead to different scenes.",
  "결말이 두 개 있어요.": "There are two endings.",
  "모든 길은 있는 장면으로 가요.": "Every path goes to a real scene.",
  "처음으로 돌아갈 수 있어요.": "You can go back to the start.",
  "시작을 누르면 시간이 줄어요.": "Tap Start and the time counts down.",
  "멈췄다가 이어 갈 수 있어요.": "You can pause and keep going.",
  "0초가 되면 알려 줘요.": "It tells you when it hits 0 seconds.",
  "시작을 여러 번 눌러도 하나만 돌아가요.":
    "Tapping Start many times runs only one timer.",
  "시간은 0보다 작아지지 않아요.": "Time never goes below 0.",
  "명령대로 칸을 칠해요.": "Colors cells by the commands.",
  "같은 명령을 반복해요.": "Repeats the same commands.",
  "목표 모양과 비교해요.": "Compares with the target shape.",
  "판 끝에서 멈춰요.": "Stops at the edge of the board.",
  "처음으로 누르면 빈 판이 돼요.": "Tap Start over for an empty board.",
  "이렇게 누르면": "If I tap this",
  "이렇게 될 것 같아요.": "I think this will happen.",
  왜냐하면: "Because",
  오른쪽: "Right",
  아래: "Down",
  왼쪽: "Left",
  위: "Up",
  "문제와 요구사항": "Problem and needs",
  "사용할 사람과 불편한 점을 고른다.":
    "Picks who will use it and what bothers them.",
  "목적·기능·완료 조건을 연결한다.":
    "Connects goal, features, and done conditions.",
  "다른 사용자의 문제에 맞게 조건을 바꾸고 설명한다.":
    "Changes conditions to fit another user's problem and explains them.",
  "작동 원리 이해": "Understanding how it works",
  "입력과 화면 결과를 찾는다.": "Finds inputs and screen results.",
  "규칙과 앱이 기억하는 값을 연결한다.":
    "Connects rules with values the app remembers.",
  "상태 변화와 예외 상황의 원리를 설명하고 적용한다.":
    "Explains and applies how states change and how special cases work.",
  "검사와 수정": "Checking and fixing",
  "예상과 관찰을 기록한다.": "Records predictions and observations.",
  "기대·실제 결과를 비교하고 수정 후 재검사한다.":
    "Compares expected and actual results, and re-checks after fixing.",
  "검사 근거로 수정 이유를 설명하고 새로운 검사를 설계한다.":
    "Explains fix reasons with check evidence and designs new checks.",
  "설명과 새로운 과제에 적용": "Explaining and applying to new tasks",
  "바꾼 부분을 말한다.": "Tells what was changed.",
  "도움받은 내용과 변경 이유를 설명한다.":
    "Explains what help was used and why things changed.",
  "다른 조건의 과제에 배운 방법을 옮겨 설명한다.":
    "Explains how to use learned methods on a task with different conditions.",
  미평가: "Not rated",
  수행: "Doing",
  "설명·적용": "Explaining & applying",
  "관찰 기록 있음": "Has observation notes",
  "실제 결과 미기록": "Actual result not recorded",
  "시작 작품 · 현재 편집본": "Starter work · current draft",
  "가져온 복사본 · 현재 편집본": "Imported copy · current draft",
  "같은 정답 세 번": "Same right answer three times",
  "오답 점수": "Points for wrong answers",
  "마지막 결과": "Final result",
  "다시 시작 상태": "Restart state",
  "모든 선택의 연결": "All choices connected",
  "의도한 결말 도달": "Reaching the intended ending",
  "처음 장면": "First scene",
  "연속 시작": "Starting many times",
  "멈춤과 재개": "Pause and resume",
  "0초와 종료 안내": "0 seconds and end message",
  "목표 모양": "Target shape",
  "판 가장자리": "Board edge",
  "반복 실행": "Repeat run",
  "처음으로 다시 그리기": "Start over and redraw",
  "선생님 미션 「{title}」을 미션 공작대에 더했어요.":
    "Added the teacher's mission “{title}” to Mission Crew.",
  "수업 끝 정리 도우미": "End-of-class cleanup helper",
  "QR로 받기": "Get by QR",
  "화면 보기": "Display",
  "고대비 화면": "High-contrast screen",
  "읽기 쉬운 글꼴 · 넓은 줄 간격": "Easy-to-read font · Wider line spacing",
  "앱이 찾은 문제와 맞춤 힌트": "Problems the app found and hints for you",
  "힌트 보기": "See hint",
  "규칙으로 찾은 힌트예요. 고친 뒤에는 ‘현재 설정 자동 검사’를 다시 눌러 확인하고, 직접 눌러 본 결과도 기록해요.":
    "This hint comes from the rules. After you fix it, press ‘Auto-check current settings’ again, and write down what you saw when you tried it yourself.",
  "선생님 미션": "Teacher's mission",
  "방향키로 칸을 옮기고 Enter나 스페이스로 넣고 빼요.":
    "Use the arrow keys to move between cells. Press Enter or Space to add or remove.",
  "열지 못했어요.": "Couldn't open it.",
  "짝 활동 · 관찰자": "Pair activity · Observer",
  "친구가 보낸 요청 파일을 열어 앱을 직접 써 보고, 본 것을 적어 돌려줘요. 이 기기에는 저장하지 않아요.":
    "Open the request file your friend sent, try the app yourself, and write what you saw to send back. Nothing is saved on this device.",
  "친구 검사 요청 파일 열기": "Open a friend's check request file",
  "친구 검사 요청 파일": "Friend's check request file",
  "아직 연 요청 파일이 없어요": "No request file opened yet",
  "친구가 작업실의 검사 단계에서":
    "Open the file your friend made in the workshop's Check step with",
  "로 만든 파일을 열어 주세요.": ".",
  "비난 대신 본 것을 적어요. “~을 눌렀더니 ~이 나왔어요.”처럼요.":
    "Write what you saw, not blame. Like: “When I pressed ~, ~ showed up.”",
  "검사한 친구 (이름이나 별명)": "Friend who checked (name or nickname)",
  "기대:": "Expected:",
  "실제로 본 결과": "What I actually saw",
  "기대대로 됨": "Worked as expected",
  "고칠 점이 있음": "Something to fix",
  "이해된 점과 헷갈린 점": "What made sense and what was confusing",
  "검사 결과 파일 내려받기": "Download check result file",
  "친구 검사 결과": "Friend's check result",
  "친구가 만든 앱": "App made by a friend",
  "붙일 친구 검사 결과가 없어요": "No friend's check result to add",
  "내 작품 선반의 파일 가져오기로 친구 검사 결과 파일을 열어 주세요.":
    "Open the friend's check result file with ‘Import file’ on My Works shelf.",
  "검사 결과를 붙일 작품 고르기": "Choose a work to add the check result to",
  "요청을 보낸 작품을 이 기기에서 찾지 못했어요. 작품을 파일로 옮기면 작품 이름표가 새로 바뀌어요.":
    "Couldn't find the requested work on this device. Moving a work by file gives it a new ID.",
  "요청한 작품: 「{title}」.": "Requested work: “{title}”.",
  "같은 작품을 골라 주세요.": "Please choose the same work.",
  "같은 미션": "Same mission",
  "「{title}」에 검사 결과 합치기": "Add check result to “{title}”",
  "이 작품에 합치기": "Add to this work",
  "이 기기에 작품이 없어요": "No works on this device",
  "먼저 작품 파일을 가져온 뒤 검사 결과 파일을 다시 열어 주세요.":
    "Import the work file first, then open the check result file again.",
  "앱 파일(HTML)을 내려받았어요. 인터넷 없이 브라우저에서 열려요.":
    "Downloaded the app file (HTML). It opens in a browser without the internet.",
  "앱 파일로 내보내기": "Export as app file",
  "QR에 담기에는 작품이 커요. 파일 내려받기나 공유로 보내 주세요.":
    "This work is too big for a QR code. Send it by downloading a file or sharing.",
  "받기 주소가 담긴 QR 코드": "QR code with the receive link",
  "받을 기기의 카메라 앱으로 QR을 비춰요.":
    "Point the receiving device's camera app at the QR code.",
  "열린 주소에서 ‘받기’를 눌러요.": "On the page that opens, press ‘Receive’.",
  "QR에는 작품 설정만 들어가고 다른 학습 기록은 들어가지 않아요. 주소의 # 뒤쪽은 서버로 보내지지 않아요.":
    "The QR code holds only the work's settings, not other learning records. The part of the link after # is never sent to a server.",
  "받기 주소를 복사했어요.": "Copied the receive link.",
  "주소를 복사하지 못했어요. QR을 비춰 주세요.":
    "Couldn't copy the link. Please scan the QR code.",
  "주소 복사": "Copy link",
  "QR로 받은 내용을 읽고 있어요…": "Reading what came from the QR code…",
  "작품 「{title}」이 왔어요": "The work “{title}” has arrived",
  "친구가 「{title}」 검사를 부탁했어요":
    "A friend asked you to check “{title}”",
  "받으면 이 기기에 새 작품으로 더해요. 보낸 사람의 작품은 바뀌지 않아요.":
    "Receiving adds it as a new work on this device. The sender's work won't change.",
  "친구 작품 검사하기 화면에서 열어요. 이 기기에는 저장하지 않아요.":
    "Opens in ‘Check a friend's work’. Nothing is saved on this device.",
  "새 작품으로 받기": "Receive as new work",
  "친구 작품 검사하기로 열기": "Open in ‘Check a friend's work’",
  "받지 않기": "Don't receive",
  "낯선 말은 쉽게 풀어볼까요?": "Want tricky words explained simply?",
  "5초가 끝났어요! 잠깐 쉬어 가요.": "5 seconds are up! Take a short break.",
  "완성 예제부터 눌러보세요": "Start by trying a finished example",
  "어떤 앱을 만드는 곳인가요?": "What kind of apps do you make here?",
  "답을 고르고, 길을 바꾸고, 시간을 멈춰 보세요. 이 체험은 작품을 저장하지 않아요.":
    "Pick answers, change paths, and stop the clock. This demo doesn't save any work.",
  "완성 예제 선택": "Choose a finished example",
  "이제 내가 고쳐보기 · 3분": "Now fix it yourself · 3 min",
  "저장하지 않는 완성 예제": "Finished example (not saved)",
  "다섯 장면으로 보는 앱 만들기": "Making an app in five scenes",
  "완성 화면보다 예상하고 고친 이유가 중요해요.":
    "Your predictions and reasons for fixes matter more than the finished screen.",
  "작업실의 {stage}": "Workshop: {stage}",
  "{stage} 실제 화면 크게 보기 (새 탭)":
    "See the real {stage} screen bigger (new tab)",
  "{stage} 단계의 실제 작업실 화면":
    "The real workshop screen for the {stage} step",
  "규칙 비교 예제": "Rule comparison example",
  "이렇게 고치며 원리를 배워요": "Learn how it works by fixing it",
  "같은 문제의 같은 정답을 세 번 눌렀을 때, 두 규칙을 비교해 보세요.":
    "Press the same right answer to the same question three times and compare the two rules.",
  "고치기 전": "Before fixing",
  "누를 때마다 점수가 올라가요": "The score goes up every time you press",
  "버튼을 누를 때마다 1점씩 더하는 규칙":
    "A rule that adds 1 point every time you press the button",
  "고친 후": "After fixing",
  "한 문제는 한 번만 채점해요": "Each question is scored only once",
  "이미 답한 문제인지 기억하고 확인하는 규칙":
    "A rule that remembers and checks if a question was already answered",
  "같은 정답 세 번 비교하기": "Compare the same answer three times",
  "내 손으로 고쳐보기 →": "Fix it yourself →",
  "고친 까닭: 누른 횟수보다 맞힌 문제 수를 세려면, 이미 답했는지 기억해야 해요.":
    "Why we fixed it: To count correct questions instead of presses, the app must remember if you already answered.",
  "우리 수업에서는 이렇게 써요": "How we use it in class",
  "수업 아이디어예요. 문항·이야기·시간은 배운 내용에 맞게 바꿔요.":
    "These are class ideas. Change the questions, stories, and times to fit what you learned.",
  "{subject} 수업 아이디어": "{subject} class ideas",
  "{subject} 활동 안내 열기": "Open {subject} activity guide",
  "선생님의 수업 준비": "Teacher's class prep",
  "내일 바로 하는 40분 수업": "A 40-minute lesson you can teach tomorrow",
  "기기 1대당 2명 · 활동지 1인 1부 · 학생 계정 가입 없이 시작해요.":
    "2 students per device · 1 worksheet each · Start without student accounts.",
  "준비할 차시": "Lesson to prepare",
  "{n}차시": "Lesson {n}",
  "오늘의 목표": "Today's goal",
  준비물: "Materials",
  "브라우저에서 미션과 저장 상태를 먼저 확인하세요.":
    "First, check the mission and save status in the browser.",
  "도입 5분": "Intro 5 min",
  "활동 30분": "Activity 30 min",
  "정리 5분": "Wrap-up 5 min",
  "이 수업 미션 열기": "Open this lesson's mission",
  "이 차시 활동지 받기 · 2쪽": "Get this lesson's worksheet · 2 pages",
  "교사용 안내서 열기 · 새 탭": "Open teacher's guide · New tab",
  "전체 자료와 8차시 안내": "All materials and the 8-lesson guide",
  "다른 차시도 준비하기": "Prepare another lesson",
  "6차시의 외부 AI 도구는 교사·성인이 조작해요. 사전 예제를 준비하고 생성·미실행을 구별해 기록해요.":
    "In Lesson 6, a teacher or adult runs the outside AI tool. Prepare examples ahead, and record what was made and what wasn't run separately.",
  "수업에서 살펴볼 것": "What to watch for in class",
  "기기 문제가 생기면": "If a device has problems",
  "도움 조절": "Adjusting support",
  "3~4학년은 교사가 읽어 주고 선택 카드로 말해요. 5~6학년은 짝과 예상·실제·이유를 기록해요. 빠른 학생은 조건을 하나 더 바꾸고 재검사해요.":
    "For grades 3–4, the teacher reads aloud and students answer with choice cards. Grades 5–6 record prediction, actual result, and reason with a partner. Fast finishers change one more condition and check again.",
  "먼저 눌러보고, 하나만 고쳐봐요": "Try it first, then fix just one thing",
  "처음이어도 괜찮아요. 예제에서 시작하고 내 작품으로 이어갈 수 있어요.":
    "It's OK if you're new. Start from an example and continue with your own work.",
  홈으로: "Home",
  "처음이라면 · 예제 눌러보기": "New here? · Try an example",
  "3~4학년 · 선생님과 말로 설명":
    "Grades 3–4 · Explain out loud with the teacher",
  "5~6학년 · 짝과 예상·검사": "Grades 5–6 · Predict and check with a partner",
  "다음은 3분 첫 체험": "Next: 3-minute first try",
  "정답을 세 번 누르고 점수 규칙을 직접 고쳐봐요. 시간 제한은 없어요.":
    "Press the right answer three times and fix the scoring rule yourself. No time limit.",
  "3분 체험 시작 →": "Start the 3-minute try →",
  "한 차시를 골라 바로 준비하세요": "Pick a lesson and get ready right away",
  "설치나 학생 가입 없이, 예제·미션·활동지를 함께 준비합니다.":
    "Prepare examples, missions, and worksheets together, with no installs or student sign-ups.",
  "학급에 오늘의 미션 안내하기": "Share today's mission with the class",
  "차시를 고르면 학생이 바로 들어갈 QR 카드와 소개 문구가 준비돼요.":
    "Pick a lesson to get a QR card and intro text students can use to jump right in.",
  "수업 QR 카드 만들기 →": "Make a class QR card →",
  "오늘의 학생 활동 · 40분": "Today's student activity · 40 min",
  "오늘 할 일을 확인하고, 활동지를 준비한 뒤 미션을 시작해요.":
    "Check today's tasks, get your worksheet ready, then start the mission.",
  "함께 생각하기 5분": "Think together 5 min",
  "직접 해 보기 30분": "Try it yourself 30 min",
  "배운 점 말하기 5분": "Share what you learned 5 min",
  "지난 시간 작품이 있으면 내 작품 선반에서 열어 이어가요. 아직 작품이 없다면 연결된 미션에서 새로 시작할 수 있어요.":
    "If you have a work from last time, open it from My Works shelf and keep going. If not, start a new one from the linked mission.",
  "외부 AI 도구는 선생님·성인이 조작해요. 나는 요청과 예상, 실제로 본 결과를 기록해요.":
    "A teacher or adult runs the outside AI tool. I write down my request, my prediction, and the actual result I saw.",
  "오늘의 미션 안내 열기 →": "Open today's mission guide →",
  "지난 작품 이어하기": "Continue a past work",
  "{n}차시 활동지 열기 · 2쪽 · 새 탭":
    "Open Lesson {n} worksheet · 2 pages · New tab",
  "3분 첫 체험 · 시간 제한 없음": "3-minute first try · No time limit",
  "점수가 또 올라가요": "The score went up again",
  "한 문제는 1점. 같은 정답을 세 번 눌러도 한 문제의 점수만 받아야 해요.":
    "1 point per question. Even if you press the same right answer three times, you should only get points for one question.",
  "첫 체험 순서": "First-try steps",
  "1 먼저 예상해요": "1 Predict first",
  "같은 문제의 정답을 세 번 누르면 몇 점이어야 할까요?":
    "If you press the right answer to the same question three times, how many points should you get?",
  "예상은 틀려도 괜찮아요. 실제 결과와 비교할 내 생각을 먼저 남겨요.":
    "It's OK if your prediction is wrong. Write down your idea first to compare with the actual result.",
  "내 예상으로 실행해 보기 →": "Run it with my prediction →",
  "2 같은 정답을 세 번 눌러요": "2 Press the same right answer three times",
  "3 한 가지 규칙을 고치고 다시 검사해요": "3 Fix one rule and check again",
  "내 예상": "My prediction",
  "· 같은 정답 세 번 · 문제당 1점":
    "· Same answer 3 times · 1 point per question",
  "누를 때마다 1점": "1 point per press",
  "문제당 한 번만 1점": "1 point only once per question",
  "규칙을 바꾸면 0점부터 같은 검사를 다시 시작해요.":
    "When you change the rule, the same check starts again from 0 points.",
  "식물이 자라는 데 필요한 것은?": "What do plants need to grow?",
  "정답 햇빛과 물": "Answer: Sunlight and water",
  "누른 횟수 {n}/3 · 현재 점수": "Presses {n}/3 · Current score",
  실제로는: "Actually it became",
  "3점": "3 points",
  "이 되었어요. 누를 때마다 1점을 더하는 규칙 때문이에요. 우리가 정한 “한 문제는 한 번” 약속과 다르네요.":
    ". That's because of the rule that adds 1 point every press. It's different from our “one question, once” promise.",
  "규칙 하나 고치기 →": "Fix one rule →",
  "같은 행동으로 확인했어요": "Checked with the same actions",
  "1점": "1 point",
  "이미 답한 문제인지 기억하면, 또 눌러도 점수를 더하지 않을 수 있어요.":
    "If the app remembers that a question was already answered, it can skip adding points when you press again.",
  "내 말로 설명하기 · 왜 이렇게 고쳤나요?":
    "Explain in my own words · Why did I fix it this way?",
  "맞힌 문제 수를 세려면…": "To count correct questions…",
  "체험만 하면 기록은 남지 않아요. 새 작품을 만들면 내 예상과 설명을 옮겨요. 새 작품에서 실행·검사는 다시 해요.":
    "Just trying it doesn't save a record. If you make a new work, your prediction and explanation move over. You'll run and check again in the new work.",
  "같은 정답을 세 번 누르면 {n}점일 것 같아요.":
    "I think pressing the same right answer three times will give {n} points.",
  "고친 규칙으로 내 작품 만들기 →": "Make my work with the fixed rule →",
  "체험 처음부터 다시": "Start the demo over",
  "다른 완성 예제 눌러보기": "Try another finished example",
  "QR로 보내기": "Send by QR",
  "요청을 QR로 보내기": "Send request by QR",
  "{n}단계 완료": "Step {n} done",
  "세 단계를 차례로 하면 다음 사람이 이 기기의 기록을 이어 쓰지 않아요.":
    "Do the three steps in order so the next person doesn't continue your records on this device.",
  "저장이 끝났는지 확인해요": "Check that saving is done",
  "모든 편집이 이 기기에 저장됐어요.": "All edits are saved on this device.",
  "아직 저장 중이거나 저장에 실패한 작품이 있어요. 잠시 뒤 다시 확인해 주세요.":
    "Some works are still saving or failed to save. Please check again in a moment.",
  "모든 작품을 파일로 받아요": "Download all works as files",
  "작품 {n}개를 파일로 받아 학교가 정한 곳(학급 드라이브 등)에 보관해요.":
    "Download {n} works as files and keep them where your school decides (like a class drive).",
  "모든 작품 파일로 받기": "Download all works as files",
  "이미 백업했거나 보관하지 않아도 돼요":
    "Already backed up, or no need to keep them",
  "이 기기에 보관할 작품이 없어요.": "No works to keep on this device.",
  "다음에 이 기기를 쓸 상황을 골라요":
    "Choose how this device will be used next",
  "2단계에서 파일을 받거나 건너뛰기를 고르면 버튼이 켜져요.":
    "The button turns on after you download files or choose to skip in step 2.",
  "다음 반·다음 학생이 바로 써요":
    "The next class or student will use it right away",
  "작품을 지우지 않고 목록에서 접어요. 되돌리기 기록과 최근 작품 연결은 비워요.":
    "Folds works out of the list without deleting them. Clears undo history and recent work links.",
  "기기를 반납하거나 학기가 끝났어요":
    "Returning the device or the term is over",
  "이 앱의 작품·설정·학급 평가 목록·되돌리기 기록을 모두 지워요. 다른 앱 데이터는 지우지 않아요.":
    "Deletes all of this app's works, settings, class review lists, and undo history. Other apps' data is not deleted.",
  "아직 답을 고르지 않았어요.": "You haven't chosen an answer yet.",
  "선택 {n} → {rule} → 점수 {a} → {b} → {fb}":
    "Choice {n} → {rule} → score {a} → {b} → {fb}",
  "이미 답했는지 확인": "Check if already answered",
  "시도할 때마다 채점": "Score every try",
  "마지막 문제 확인 → 최종 결과 표시":
    "Check last question → Show final result",
  "다음 문제 → 문제 번호 1 증가 → 답한 상태 초기화":
    "Next question → Question number +1 → Reset answered state",
  "다시 시작 → 문제 번호 1, 답한 상태 비움, 점수 {n}":
    "Restart → Question number 1, answered state cleared, score {n}",
  "첫 칸(0,0)에서 시작해요.": "Start at the first cell (0,0).",
  "{dir} 막힘 → 오른쪽으로 돌아도 막힘 → 멈춤 (위치 {at})":
    "{dir} blocked → Turning right is blocked too → Stop (position {at})",
  "{dir} 막힘 → 만약 막히면 오른쪽으로 돌기 → {turn} 한 칸 → 위치 {at} 칠하기":
    "{dir} blocked → If blocked, turn right → {turn} one cell → Paint position {at}",
  "{dir} 한 칸 → 판 가장자리 → 멈춤 (위치 {at})":
    "{dir} one cell → Board edge → Stop (position {at})",
  "{dir} 한 칸 → 판 밖 → 반대편으로 넘어감 → 위치 {at} 칠하기":
    "{dir} one cell → Off the board → Wrap to the other side → Paint position {at}",
  "{dir} 한 칸 → 위치 {at} 칠하기": "{dir} one cell → Paint position {at}",
  "명령 {n}칸을 모두 실행했어요.": "Ran all {n} cells of commands.",
  "{n}점만 반영": "Only {n} points counted",
  "{screen}, {n}점": "{screen}, {n} points",
  "결과 화면": "Result screen",
  "문제 화면": "Question screen",
  "{n}점 · {i}번 문제 · {a}": "{n} points · Question {i} · {a}",
  "답하지 않음": "Not answered",
  답함: "Answered",
  "존재하는 장면으로 연결": "Links to scenes that exist",
  "모두 유효한 장면": "All scenes are valid",
  "없는 장면 발견": "Missing scene found",
  "{n}개 결말에 도달 가능": "{n} endings reachable",
  "시작 장면이 존재": "Start scene exists",
  없음: "None",
  "목표 칸 {n}개와 같은 모양": "Same shape as the {n} target cells",
  "칠한 칸 {p}개 · 빠진 칸 {m}개, 더 칠한 칸 {e}개":
    "{p} cells painted · {m} missing, {e} extra",
  "칠한 칸 {p}개 · 목표와 같음": "{p} cells painted · Matches the target",
  "판 밖으로 넘어가지 않음": "Doesn't go off the board",
  "반대편으로 {n}번 넘어감": "Wrapped to the other side {n} times",
  "가장자리에서 {n}번 멈춤": "Stopped at the edge {n} times",
  "넘어간 이동 없음": "No moves went past the edge",
  "명령 묶음 {r}번 · {n}칸 이동": "Command group {r} · moved {n} cells",
  "{n}칸 이동": "Moved {n} cells",
  "빈 판의 첫 칸(0,0)에서 시작":
    "Start at the first cell (0,0) of an empty board",
  "칠한 칸 {p}개 · 위치 {at}": "{p} cells colored · position {at}",
  "원래 종료 시각 유지": "Keeps the original end time",
  "같은 종료 시각": "Same end time",
  "종료 시각 변경": "End time changed",
  "남은 시간을 유지하고 재개": "Resume with the time left",
  "유지 후 재개": "Keep time, then resume",
  불일치: "Mismatch",
  "{s}초 · 안내 {n}번": "{s} sec · {n} end messages",
  "{s}초 · 정지": "{s} sec · paused",
  결과: "Result",
  "없는 장면이에요.": "That scene doesn't exist.",
  "이야기가 끝났어요.": "The story is over.",
  멈춤: "Pause",
  "{n}초": "{n} sec",
  "시간이 끝났어요!": "Time's up!",
  그리기: "Draw",
  "{n}×{n} 판 · 칠한 칸 {p}개": "{n}×{n} board · {p} cells colored",
  "다 그렸어요. 목표 모양과 달라요.":
    "Drawing done. It doesn't match the target shape.",
  "뚝딱 바이브 공작소에서 만든 작은 앱":
    "A tiny app made in Ttukttak Vibe Workshop",
  "이 파일에는 작품 설정만 들어 있고 학습 기록은 들어 있지 않아요. 인터넷 없이 열려요.":
    "This file has only the work's settings, not learning records. It opens without the internet.",
  "QR로 받은 작품을 새 작품으로 더했어요.":
    "Added the work from the QR code as a new work.",
  "미션 만들기": "Create a mission",
  "QR로 받은 작품": "Work from a QR code",
  "다른 탭을 닫은 뒤 다시 시도해 주세요.": "Close other tabs and try again.",
  "저장하지 못했어요.": "Couldn't save.",
  "저장이 취소되었어요.": "Saving was canceled.",
  "작품 형식을 알 수 없어요.": "Unknown work format.",
  "가져오기 저장 실패": "Couldn't save the import",
  "한 작품의 파일이 2MB를 넘어요. 백업할 검사 기록과 버전을 줄여 주세요.":
    "One work's file is over 2MB. Keep fewer check records and versions in the backup.",
  "{path}: 객체 형식이 필요해요.": "{path}: Must be an object.",
  "{path}: {max}자 이내의 글자여야 해요.":
    "{path}: Must be text of {max} characters or fewer.",
  "{path}: 참/거짓 값이 필요해요.": "{path}: Must be true or false.",
  "{path}: {min}~{max}의 정수여야 해요.":
    "{path}: Must be a whole number from {min} to {max}.",
  "{path}: 항목 {min}~{max}개가 필요해요.": "{path}: Needs {min}–{max} items.",
  "{path}: 지원하지 않는 값이에요.": "{path}: This value isn't supported.",
  "{path}: 올바른 날짜가 아니에요.": "{path}: Not a valid date.",
  "{path}: 이름표가 비었거나 중복돼요.":
    "{path}: A label is empty or repeated.",
  설정: "Settings",
  "프로젝트 종류": "Project type",
  "판 크기": "Board size",
  명령: "Commands",
  "명령 방향": "Command direction",
  "명령 칸 수": "Command cells",
  "목표 칸": "Target cells",
  "목표 칸: 판 안의 칸이어야 해요.":
    "Target cells: Must be cells on the board.",
  "반복 횟수": "Repeat count",
  "가장자리 규칙": "Edge rule",
  "조건 규칙": "Condition rule",
  문항: "Questions",
  선택지: "Choices",
  "문항 이름표": "Question label",
  문제: "Question",
  "정답 번호": "Correct answer number",
  "문제당 점수": "Points per question",
  "점수 초기화": "Score reset",
  "장면 이름표": "Scene label",
  "장면 제목": "Scene title",
  "장면 설명": "Scene description",
  "결말 여부": "Is it an ending?",
  "장면 선택지": "Scene choices",
  "장면 선택": "Scene choice",
  "선택 문장": "Choice text",
  "도착 장면": "Destination scene",
  "의도한 결말": "Intended endings",
  "결말 이름표": "Ending label",
  "장면 연결: 존재하는 장면과 결말을 연결해 주세요.":
    "Scene links: Connect to scenes and endings that exist.",
  "장면: 결말에는 선택지가 없어야 하고, 진행 장면에는 선택지가 필요해요.":
    "Scenes: Endings must have no choices, and other scenes need choices.",
  "제한 시간": "Time limit",
  "종료 안내": "End message",
  "종료 표시": "End display",
  "작품 내용": "Work content",
  "작품과 버전의 프로젝트 종류가 달라요.":
    "The work and the version have different project types.",
  "만들기 약속": "Building promises",
  "AI 기록": "AI records",
  도구명: "Tool name",
  도움: "Help",
  "AI 실제 결과": "AI actual result",
  "AI 예상": "AI prediction",
  "AI 검사 기준": "AI check criteria",
  "AI 판정": "AI verdict",
  "AI 수정 요청": "AI fix request",
  "수정 기록": "Fix records",
  "검사 기록": "Check records",
  검사: "Check",
  "검사 ID": "Check ID",
  "기대 결과": "Expected result",
  "검사 종류": "Check type",
  "검사 상태": "Check status",
  "검사 버전": "Checked version",
  "검사 시각": "Check time",
  "설정 버전": "Settings version",
  "만들기 약속 확인": "Building promises check",
  원문: "Original text",
  "정리 요청문": "Tidied-up request",
  예상: "Prediction",
  "실행 설정 버전": "Run settings version",
  성찰: "Reflection",
  "도움 기록": "Help records",
  "활동 종류": "Activity type",
  "{what}의 스키마 버전을 알 수 없어요. 이 앱은 {supported}를 읽어요.":
    "Unknown schema version for {what}. This app reads {supported}.",
  "더 새로운 앱에서 만든 {what}이에요(스키마 버전 {v}). 이 앱은 {supported}를 읽어요. 최신 주소에서 새로고침한 뒤 다시 가져와 주세요.":
    "This {what} was made in a newer app (schema version {v}). This app reads {supported}. Refresh at the latest address and import again.",
  작품: "Work",
  "평가 단계": "Review stage",
  "평가 의견": "Review comment",
  "평가 시각": "Review time",
  미션: "Mission",
  "지원하지 않는 미션이에요.": "This mission isn't supported.",
  버전: "Version",
  "버전 ID": "Version ID",
  "버전 제목": "Version title",
  "버전 이유": "Version reason",
  "버전 시각": "Version time",
  "수정 버전 묶음은 600KB까지예요. 필요한 버전만 남긴 파일을 선택해 주세요.":
    "A fix version bundle can be up to 600KB. Choose a file with only the versions you need.",
  "작품 ID": "Work ID",
  "만든 시각": "Created",
  "고친 시각": "Edited",
  "편집본 이름": "Current draft name",
  "힌트 사용": "Hints used",
  "파일은 2MB 이하여야 해요. 작품을 나누어 내보내 주세요.":
    "Files must be 2MB or smaller. Export your works separately.",
  "JSON 파일을 읽을 수 없어요. 원래 내보낸 .json 파일을 선택해 주세요.":
    "Can't read the JSON file. Choose the original exported .json file.",
  파일: "File",
  "뚝딱 백업 파일({supported})을 선택해 주세요.":
    "Choose a Ttukttak backup file ({supported}).",
  "백업 파일": "Backup file",
  "작품 목록": "Work list",
  "평가 목록을 저장하지 못했어요.": "Couldn't save the review list.",
  "{what}: 객체 형식이 필요해요.": "{what}: Must be an object.",
  "{what}: {max}자 이내의 글자여야 해요.":
    "{what}: Must be text of {max} characters or fewer.",
  "{what}: 항목이 {max}개 이하여야 해요.":
    "{what}: Must have {max} items or fewer.",
  "지원하지 않는 친구 검사 요청 파일이에요.":
    "This friend check request file isn't supported.",
  "검사 항목": "Check items",
  "지원하지 않는 친구 검사 결과 파일이에요.":
    "This friend check result file isn't supported.",
  "검사 시각이 올바르지 않아요.": "The check time isn't valid.",
  "검사한 친구": "Friend who checked",
  "검사 결과": "Check results",
  "검사 판정: 지원하지 않는 값이에요.":
    "Check verdict: This value isn't supported.",
  "친구 의견": "Friend's comment",
  "친구가 적은 검사 결과가 없어요.":
    "Your friend didn't write any check results.",
  "검사 기록은 100개까지예요. 필요 없는 기록을 정리한 뒤 다시 가져와 주세요.":
    "You can have up to 100 check records. Clean up ones you don't need, then import again.",
  "검사 기록은 100개까지예요. 파일로 백업한 뒤 필요 없는 기록을 선택해 삭제해 주세요.":
    "You can have up to 100 check records. Back them up to a file, then select and delete ones you don't need.",
  "QR 주소를 읽지 못했어요. QR을 다시 비추거나 파일로 주고받아 주세요.":
    "Couldn't read the QR address. Scan the QR again or share by file.",
  "{what}: {max}자 이내로 적어 주세요.":
    "{what}: Write {max} characters or fewer.",
  "미션 파일 형식을 알 수 없어요.": "Unknown mission file format.",
  "검사 항목은 1~6개여야 해요.": "Check items must be 1–6.",
  "힌트는 1~3개여야 해요.": "Hints must be 1–3.",
  "미션 제목": "Mission title",
  "이번 과제": "This task",
  "미션 목표": "Mission goal",
  "예상 질문": "Prediction question",
  힌트: "Hint",
  "선생님 미션은 이 기기에 {n}개까지 둘 수 있어요.":
    "This device can hold up to {n} teacher's missions.",
  요청문: "Request",
  "만들고 싶은 것과 지켜야 할 약속을 설명하는 말이에요.":
    "Words that explain what you want to make and the promises it must keep.",
  "내 생각대로 움직이는지 직접 확인하는 일이에요.":
    "Seeing for yourself if it works the way you think.",
  버그: "Bug",
  "기대한 것과 다르게 움직이는 부분이에요.":
    "A part that works differently from what you expected.",
  상태: "State",
  "점수나 남은 시간처럼 앱이 지금 기억하는 값이에요.":
    "A value the app is remembering right now, like the score or time left.",
  "고치기 전후의 모습을 이름 붙여 남긴 것이에요.":
    "A named snapshot of how it looked before and after a fix.",
  "예상·검사·수정 이유를 모아 내가 배운 것을 소개하는 기록이에요.":
    "A record of your predictions, checks, and fix reasons that shows what you learned.",
  "퀴즈 눌러보기": "Try the quiz",
  "정답을 고르면 안내와 점수가 나와요.":
    "Pick an answer to see a message and your score.",
  "이야기 눌러보기": "Try the story",
  "내 선택에 따라 다른 결말로 가요.": "Your choices lead to different endings.",
  "타이머 눌러보기": "Try the timer",
  "5초를 시작하고 멈췄다가 이어 가요.":
    "Start 5 seconds, pause, then keep going.",
  생각하기: "Think",
  "누가 쓸까요?": "Who will use it?",
  "친구가 쓸 퀴즈를 만들래요.": "I'll make a quiz for my friends.",
  설명하기: "Explain",
  "무엇이 나와야 할까요?": "What should happen?",
  "같은 문제는 한 번만 채점해 줘.": "Score each question only once.",
  실행하기: "Run",
  "먼저 예상하고 눌러요.": "Predict first, then press.",
  "세 번 눌러도 1점일 것 같아요.":
    "I think it'll be 1 point even if I press three times.",
  고치기: "Fix",
  "다르면 규칙을 바꿔요.": "If it's different, change the rule.",
  "3점이네? 한 번만 채점하도록 고칠래요.":
    "3 points? I'll fix it to score only once.",
  소개하기: "Share",
  "바꾼 까닭을 말해요.": "Tell why you changed it.",
  "이미 답했는지 기억하면 돼요.":
    "It just needs to remember if I already answered.",
  과학: "Science",
  "배운 내용을 확인하는 퀴즈": "A quiz to check what you learned",
  "식물에게 필요한 것을 묻고, 정답·오답 안내를 바꿔요.":
    "Ask what plants need, and change the right/wrong messages.",
  국어: "Korean language arts",
  "내 선택으로 이어지는 이야기": "A story shaped by your choices",
  "갈림길의 선택과 결말을 연결하고 친구가 읽기 쉽게 고쳐요.":
    "Link choices at the forks to endings, and make it easy for friends to read.",
  체육: "PE",
  "운동과 휴식을 알리는 타이머": "A timer for exercise and rest",
  "운동할 시간을 정하고 멈춤·재개·종료 안내를 검사해요.":
    "Set the exercise time and check the pause, resume, and end messages.",
  예상하기: "Predict",
  "이상한 점수 발견": "Found a strange score",
  "규칙 수정과 재검사": "Fix the rule and check again",
  "같은 정답을 여러 번 누르면 점수가 또 올라요.":
    "Pressing the same right answer again keeps raising the score.",
  "설정의 ‘채점 규칙’을 ‘문제당 한 번 (정상 규칙)’으로 바꿔 보세요. 앱이 ‘이미 답했는지’를 기억해야 해요.":
    "In Settings, change ‘Scoring rule’ to ‘Once per question (normal rule)’. The app needs to remember ‘if it was already answered’.",
  "다시 시작해도 점수가 남아 있어요.": "The score stays even after restarting.",
  "설정의 ‘다시 시작할 때 점수 초기화’를 켜 보세요. 처음으로 돌아갈 때 앱이 기억하던 점수도 0으로 돌아가야 해요.":
    "In Settings, turn on ‘Reset score on restart’. When you go back to the start, the score the app remembered should go back to 0 too.",
  "없는 장면으로 가는 선택이 {n}개 있어요.":
    "{n} choices go to scenes that don't exist.",
  "「{scene}」 장면의 ‘도착 장면’을 지금 있는 장면으로 골라 주세요.":
    "Set the ‘Destination scene’ of the “{scene}” scene to a scene that exists.",
  "목표 결말 {n}개에 갈 수 없어요.": "{n} target endings can't be reached.",
  "장면 연결 지도에서 「{scene}」이 ‘갈 수 없음’으로 보여요. 시작에서 갈 수 있는 장면 가운데 하나의 ‘도착 장면’을 「{scene}」으로 바꿔 길을 이어 보세요.":
    "In the Scene connection map, “{scene}” shows as ‘Unreachable’. Change the ‘Destination scene’ of a scene you can reach from the start to “{scene}” to connect the path.",
  "0초가 돼도 끝났다는 안내가 나오지 않아요.":
    "No end message appears at 0 seconds.",
  "설정의 ‘0초가 되면 종료 안내 표시’를 켜 보세요.":
    "In Settings, turn on ‘Show end message at 0 seconds’.",
  "그림이 판 밖으로 나가 반대편에서 다시 나와요.":
    "The drawing goes off the board and comes back on the other side.",
  "설정의 ‘판 가장자리 규칙’을 ‘가장자리에서 멈추기 (정상 규칙)’로 바꿔 보세요. 앱은 다음 칸이 판 안인지 먼저 확인해야 해요.":
    "In Settings, change ‘Board edge rule’ to ‘Stop at the edge (normal rule)’. The app should first check if the next cell is on the board.",
  "목표인데 칠하지 않은 칸이 {n}개 있어요.": "{n} target cells aren't colored.",
  "마지막 위치는 {at}이에요. 가장 가까운 빠진 칸 {to}까지 ‘{dir} {k}칸’ 명령을 더해 보세요.":
    "The last position is {at}. Add a ‘{dir} {k} cells’ command to reach the nearest missing cell {to}.",
  "목표에 없는 칸을 {n}개 더 칠했어요.":
    "You colored {n} extra cells that aren't in the target.",
  "‘한 칸씩 그리기’로 따라가며 처음 목표 밖으로 나가는 명령을 찾고, 그 명령의 칸 수나 반복 횟수를 줄여 보세요.":
    "Use ‘Draw one step’ to find the first command that goes outside the target, then lower its cell count or repeat count.",
  "QR로 받은 복사본 · 현재 편집본": "QR copy · current draft",
  "버그 탐정 {n}번 · {title}": "Bug detective #{n} · {title}",
  "개인정보처럼 보이는 글이 {n}곳 있어요: {list}. 실제 이름·전화번호·주소는 지우고 보내는 게 안전해요. 그래도 보낼까요?":
    "Found {n} spots that look like personal info: {list}. It's safer to delete real names, phone numbers and addresses before sending. Send anyway?",
  "버그 탐정 무한 연습": "Bug detective endless practice",
  "오늘 수업 키트": "Today's lesson kit",
  "나의 미션 지도": "My mission map",
  "학기말 성장 포트폴리오": "End-of-term growth portfolio",
  "정상 작품에 앱이 몰래 버그 하나를 숨겨 둬요. 예상하고 실행해 보며 이상한 점을 찾고, 규칙을 고친 뒤 자동 검사로 확인해요.":
    "The app secretly hides one bug in a working app. Predict, run it, spot what's odd, fix the rule, then confirm with the auto check.",
  "새 도전 받기": "Get a new challenge",
  "아무 종류나": "Any type",
  "어디가 틀렸는지는 알려 주지 않아요. 막히면 ‘검사하고 수정’ 단계에서 자동 검사를 누르고 맞춤 힌트를 열어 보세요.":
    "It won't tell you where the bug is. If you're stuck, press the auto check in the ‘Check and fix’ step and open a custom hint.",
  "찾아 고친 버그 {n}개 / 도전 {m}개":
    "Bugs found and fixed: {n} / Challenges: {m}",
  고쳤어요: "Fixed",
  "버그가 숨어 있어요": "A bug is hiding",
  "다시 보기": "Review",
  "이어서 찾기": "Keep looking",
  "아직 받은 도전이 없어요.": "No challenges yet.",
  "{label}: {n}명 / {total}명": "{label}: {n} / {total} students",
  "{n}명": "{n} students",
  "학급 진행 요약 그래프": "Class progress summary chart",
  "가장 많은 학생({n}명)이 「{stage}」 단계에서 멈춰 있어요. 다음 차시 도입에서 이 단계를 함께 짚어 보세요.":
    "Most students ({n}) are stuck at the “{stage}” step. Go over this step together in the next lesson's Opening.",
  "모든 학생이 다섯 단계를 모두 기록했어요.":
    "All students have recorded all five steps.",
  "다음에 기록할 단계별 학생 수": "Students by next step to record",
  "미션 힌트를 연 정도": "How many mission hints were opened",
  "자기 평가와 선생님 평가 (평균 단계)":
    "Self-rating vs. teacher rating (average level)",
  스스로: "Self",
  선생님: "Teacher",
  "{label}: 스스로 {self} · 선생님 {teacher} ({n}명)":
    "{label}: self {self} · teacher {teacher} ({n} students)",
  "{label}: 둘 다 평가한 작품 없음": "{label}: no work rated by both",
  "{label}: 스스로 평균 {self}, 선생님 평균 {teacher}":
    "{label}: self average {self}, teacher average {teacher}",
  "{label}: 비교할 평가 없음": "{label}: no ratings to compare",
  "스스로 평가와 선생님 평가를 모두 넣은 작품이 생기면 비교가 나와요.":
    "A comparison appears once some work has both a self-rating and a teacher rating.",
  "「{label}」에서 학생들이 스스로를 더 높게 봤어요(평균 차이 {gap}단계). 근거를 함께 이야기해 보세요.":
    "In “{label}”, students rated themselves higher (average gap: {gap} levels). Talk through the evidence together.",
  "「{label}」에서 학생들이 스스로를 더 낮게 봤어요(평균 차이 {gap}단계). 근거를 함께 이야기해 보세요.":
    "In “{label}”, students rated themselves lower (average gap: {gap} levels). Talk through the evidence together.",
  "표로 보기": "View as table",
  항목: "Item",
  값: "Value",
  "다음 단계 · {label}": "Next step · {label}",
  "힌트 · {label}": "Hints · {label}",
  "평가 · {label}": "Rating · {label}",
  "스스로 {self} · 선생님 {teacher} ({n}명)":
    "Self {self} · teacher {teacher} ({n} students)",
  "비교할 평가 없음": "No ratings to compare",
  "파일은 2MB 이하여야 해요.": "Files must be 2MB or smaller.",
  "읽지 못했어요.": "Couldn't read it.",
  "작품 {n}개를 읽었어요. 파일 {failed}개는 읽지 못했어요.":
    "Read {n} works. Couldn't read {failed} files.",
  "작품 {n}개를 읽었어요.": "Read {n} works.",
  학생이: "Select several JSON files at once that students exported with",
  "내 작품 선반 → 목록 백업": "My work shelf → Back up list",
  "또는 작업실의": "or the workshop's",
  "으로 낸 JSON 파일을 여러 개 한꺼번에 고르세요. 파일 이름을 학생 번호·이름으로 바꿔 받으면 누구의 작품인지 알아보기 쉬워요.":
    ". If students rename files with their number and name, it's easy to tell whose work is whose.",
  "평가 중인 목록은 이 기기에만 임시로 보관해 새로고침해도 이어서 열려요. 서버에는 올리지 않고, 학생 작품 선반과도 섞이지 않아요. 평가를 마치면 CSV나 평가 파일로 내려받고":
    "The list you're rating is kept temporarily on this device only, so it reopens after a refresh. It isn't uploaded to a server or mixed with the student work shelf. When you finish, download a CSV or rating files, then clear it with",
  "목록 비우기": "Clear list",
  "로 지워 주세요.": ".",
  "학생 작품 파일 고르기": "Choose student work files",
  "표 CSV로 내려받기": "Download table as CSV",
  "평가를 넣은 작품 파일 {n}개의 다운로드를 요청했어요. 여러 파일 다운로드를 허용해 주세요.":
    "Requested downloads of {n} rated work files. Please allow multiple file downloads.",
  "평가 파일 모두 내려받기": "Download all rating files",
  "작품 발표 화면": "Work presentation screen",
  "칭찬·질문 카드 인쇄": "Print praise & question cards",
  "학생 작품 JSON 파일 여러 개": "Multiple student work JSON files",
  "읽지 못한 파일": "Files that couldn't be read",
  "한눈에 보기": "At a glance",
  "작품 {n}개 · 다섯 단계 모두 기록 {done}개 · 평가 완료 {graded}개":
    "{n} works · all five steps recorded: {done} · rated: {graded}",
  "학급 작품 요약표 · 좌우 방향키로 이동해 읽기":
    "Class work summary table · use the left and right arrow keys to move and read",
  "파일 / 작품": "File / Work",
  "직접 확인": "Checked myself",
  평가: "Rating",
  "✓ 완료": "✓ Done",
  남음: "Left",
  "통과 {n}": "Passed {n}",
  " · 남은 {n}": " · {n} left",
  " · 재검사함": " · rechecked",
  "{n}개": "{n}",
  "{n}번째까지": "Up to #{n}",
  "안 봄": "Not viewed",
  "평가 완료": "Rated",
  "평가 전": "Not rated yet",
  "단계별 완료": "Steps done",
  "아직 읽은 작품이 없어요": "No work read yet",
  "학생 작품 파일을 고르면 단계 기록 표와 평가 카드가 나와요.":
    "Choose student work files to see the step record table and rating cards.",
  "{title} · {n} / 5단계": "{title} · {n} / 5 steps",
  "실행 전 예상": "Prediction before running",
  "바꾼 동작과 이유": "What I changed and why",
  "직접 확인한 검사": "Checks I did myself",
  "학생 자기 평가": "Student self-rating",
  "과정 평가": "Process rating",
  "확인한 근거와 다음 도움": "Evidence checked & next support",
  "평가를 넣은 작품 파일 내려받기": "Download rated work file",
  "학생이 이 파일을": "When the student opens this file with",
  "로 열면 포트폴리오에서 평가와 의견을 볼 수 있어요.":
    ", they can see the ratings and comments in their portfolio.",
  "내가 만들고 고쳐 온 길": "The path of making and fixing",
  "작품 {n}개 · {from} ~ {to}": "{n} works · {from} – {to}",
  "다섯 단계를 모두 기록한 작품 {n}개":
    "{n} works with all five steps recorded",
  "아직 작품이 없어요. 미션을 하나 골라 시작해 보세요.":
    "No work yet. Pick a mission to get started.",
  "스스로 평가한 단계의 변화": "How my self-rating changed",
  처음: "First",
  마지막: "Last",
  자랐어요: "I grew!",
  "자기 평가를 한 작품이 두 개 이상이면 처음과 마지막을 비교해요.":
    "Once two or more works have a self-rating, the first and last are compared.",
  "A4 한 장으로 인쇄": "Print on one A4 page",
  "교사 자료실로": "To teacher resources",
  "뚝딱 바이브 공작소 · 오늘 수업 키트":
    "Ttukttak Vibe Workshop · Today's lesson kit",
  "{n}차시 · {title}": "Lesson {n} · {title}",
  "{title} 미션 주소 QR 코드": "QR code for the {title} mission link",
  "카메라로 비추면 오늘 미션이 열려요":
    "Scan with a camera to open today's mission",
  "진행 순서 (40분)": "Lesson flow (40 min)",
  "미션에서 할 일": "What to do in the mission",
  "준비와 살펴볼 것": "Preparation & what to watch for",
  "{n}차시 학생 활동지(앞뒤 2쪽)":
    "Lesson {n} student worksheet (2 pages, front and back)",
  "핵심 질문": "Key question",
  "살펴볼 것": "What to watch for",
  "수업 전 확인": "Before the lesson",
  "□ 기기마다 QR로 미션이 열리고 ‘기기에 저장됨’이 보여요":
    "□ Each device opens the mission via QR and shows ‘Saved on device’",
  "□ 짝 역할(운전자·관찰자)과 교대 시간을 정했어요":
    "□ Partner roles (driver & observer) and switch times are set",
  "□ 수업 끝에 ‘수업 끝 정리 도우미’로 백업·정리할 시간을 남겼어요":
    "□ Time is left at the end to back up and tidy up with the ‘End-of-lesson wrap-up helper’",
  "미션 주소: {url}": "Mission link: {url}",
  "미션을 만들지 못했어요.": "Couldn't create the mission.",
  "선생님 미션 만들기": "Make a teacher's mission",
  "시작 설정과 검사 항목을 정해 우리 반 미션을 만들어요. 이 기기에 더하면 미션 공작대에 바로 나오고, 미션 파일을 나눠 주면 학생이 ‘파일 가져오기’로 더해요.":
    "Set the starting setup and checks to make a mission for your class. Add it to this device and it appears in the Mission workshop right away; share the mission file and students add it with ‘Import file’.",
  "미션 목표 (학생이 무엇을 만들고 확인하나요?)":
    "Mission goal (What will students make and check?)",
  "먼저 예상하기 질문": "Predict-first question",
  "이번 과제 (무엇을 고치거나 바꾸나요?)":
    "This task (What will students fix or change?)",
  "시작 설정": "Starting setup",
  "학생이 처음 여는 앱이에요. 일부러 틀린 규칙을 넣었다면 아래 ‘학습용 오류 포함’을 켜 주세요.":
    "This is the app students open first. If you put in a wrong rule on purpose, turn on ‘Includes practice bug’ below.",
  "학습용 오류 포함 (학생이 찾아 고칠 규칙이 있어요)":
    "Includes practice bug (there's a rule for students to find and fix)",
  "검사 항목 (1~6개)": "Checks (1–6)",
  "검사 {n}": "Check {n}",
  "검사 {n} 이름": "Check {n} name",
  "검사 {n} 기대 결과": "Check {n} expected result",
  "검사 {n} 삭제": "Delete check {n}",
  "검사 항목 추가": "Add a check",
  "힌트 (1~3개, 차례로 열려요)": "Hints (1–3, open one at a time)",
  "「{title}」을 이 기기의 미션 공작대에 더했어요.":
    "Added “{title}” to this device's Mission workshop.",
  "이 기기에 미션 더하기": "Add mission to this device",
  "미션 파일을 내려받았어요. 학생은 내 작품 선반의 ‘파일 가져오기’로 더해요.":
    "Mission file downloaded. Students add it with ‘Import file’ on My work shelf.",
  "미션 파일 내려받기": "Download mission file",
  "이 기기의 선생님 미션 {n}개": "Teacher's missions on this device: {n}",
  " · 이 미션의 작품 {n}개": " · {n} works from this mission",
  "미션 보기": "View mission",
  "파일 다시 받기": "Download file again",
  "이 미션으로 만든 작품이 있어 지울 수 없어요.":
    "This mission can't be deleted because there's work made with it.",
  "「{title}」을 이 기기에서 지웠어요.": "Deleted “{title}” from this device.",
  지우기: "Delete",
  "아직 만든 미션이 없어요.": "No missions made yet.",
  "내가 걸어온 길": "The path I've taken",
  "다섯 단계를 모두 기록한 미션 {n}개 / 전체 {m}개":
    "Missions with all five steps recorded: {n} / {m}",
  "지도 표시": "Map legend",
  "오늘의 활동 · {title}": "Today's activity · {title}",
  "오늘의 미션": "Today's mission",
  "목표: {goal}": "Goal: {goal}",
  "활동 시간이 끝났어요.": "Activity time is up.",
  " · {n}차시": " · Lesson {n}",
  "전체 화면": "Full screen",
  "이 기기는 전체 화면을 지원하지 않아요. 기기를 가로로 놓거나 브라우저 메뉴의 ‘홈 화면에 추가’로 열면 화면을 넓게 쓸 수 있어요.":
    "This device doesn't support full screen. Turn the device sideways or open it with ‘Add to Home Screen’ in the browser menu to use more of the screen.",
  "수업 진행 끝내기": "End lesson presentation",
  "진행 단계": "Lesson stages",
  "← 이전": "← Back",
  "다음 →": "Next →",
  "활동 타이머": "Activity timer",
  도입: "Opening",
  전개: "Activity",
  정리: "Wrap-up",
  "{n}분": "{n} min",
  "10분마다 짝 역할 교대 알림": "Partner role-switch alert every 10 minutes",
  "소리로도 알리기 (교대 두 번, 종료 세 번)":
    "Also alert with sound (switch: two beeps, end: three)",
  "운전자:": "Driver:",
  "짝 B": "Partner B",
  "짝 A": "Partner A",
  "관찰자:": "Observer:",
  "다음 교대까지 {time}": "Next switch in {time}",
  "활동 시간이 끝났어요. 정리해 볼까요?":
    "Activity time is over. Ready to wrap up?",
  "역할을 바꿔요!": "Switch roles!",
  "이제 운전자는 {driver}, 관찰자는 {observer}예요.":
    "Now {driver} is the driver and {observer} is the observer.",
  확인: "OK",
  "지나온 길 {n}개": "Path so far: {n}",
  "준비된 만약 규칙 템플릿": "Ready-made if-then rule templates",
  "만약 {cond} → 「{msg}」": "If {cond} → “{msg}”",
  "지금 맞는 조건": "Condition that matches now",
  "그 밖에 → 「{msg}」": "Otherwise → “{msg}”",
  "기억하는 값 이름": "Remembered value name",
  "처음 값": "Starting value",
  "가장 작은 값 (비우면 제한 없음)":
    "Smallest value (leave blank for no limit)",
  "버튼 (1~4개)": "Buttons (1–4)",
  "버튼 {n} 이름": "Button {n} name",
  "버튼 {n}이 바꾸는 값": "Value button {n} changes",
  "버튼 {n} 삭제": "Delete button {n}",
  "새 버튼": "New button",
  "버튼 추가": "Add button",
  "조건 · 위에서부터 확인하고 처음 맞는 것 하나만 써요":
    "Conditions · checked from the top; only the first match is used",
  "조건 {n}": "Condition {n}",
  "조건 {n} 종류": "Condition {n} type",
  "이상이면 (≥)": "Or more (≥)",
  "이하이면 (≤)": "Or less (≤)",
  "같으면 (=)": "Equals (=)",
  "조건 {n} 값": "Condition {n} value",
  "조건 {n} 문구": "Condition {n} message",
  "조건 {n} 위로": "Move condition {n} up",
  "조건 {n} 아래로": "Move condition {n} down",
  "조건 {n} 삭제": "Delete condition {n}",
  "새 조건 문구": "New condition message",
  "조건 추가": "Add condition",
  "그 밖에 문구 (어떤 조건에도 맞지 않을 때)":
    "Otherwise message (when no condition matches)",
  "앱 전체 소개": "Whole app introduction",
  "예제부터 눌러보고 내 작품으로 이어가요.":
    "Try the examples first, then move on to your own work.",
  "같은 정답을 세 번 누르고 점수 규칙을 고쳐요.":
    "Press the same right answer three times, then fix the scoring rule.",
  "{n}차시 {title}": "Lesson {n} {title}",
  "오늘의 목표와 활동지를 보고, 연결된 미션에서 시작해요.":
    "Check today's goal and worksheet, then start from the linked mission.",
  "뚝딱 바이브 공작소에서 퀴즈·이야기·타이머를 만들고 고치며 코딩의 원리를 배워요.\\\\n오늘의 안내: {title}\\\\n{detail}\\\\n학생 가입 없이 시작할 수 있어요.\\\\n{url}":
    "At Ttukttak Vibe Workshop, students learn how coding works by making and fixing quizzes, stories and timers.\\\\nToday: {title}\\\\n{detail}\\\\nStart without student sign-up.\\\\n{url}",
  "이미지 변환 실패": "Image conversion failed",
  "이미지 저장 미지원": "Image saving not supported",
  "PNG 이미지 다운로드를 요청했어요. 브라우저의 다운로드 목록을 확인해 주세요.":
    "PNG download requested. Please check your browser's downloads.",
  "이미지 저장을 완료하지 못했어요. 카드 인쇄를 사용하거나 소개 문구와 주소를 복사해 주세요.":
    "Couldn't save the image. Print the card, or copy the intro text and link instead.",
  "함께 시작하는 수업": "Start the lesson together",
  "QR 소개 카드 만들기": "Make a QR intro card",
  "전체 앱이나 오늘의 차시를 골라 인쇄하고, PNG 이미지와 소개 문구로 나눠요.":
    "Pick the whole app or today's lesson, then print it or share it as a PNG image and intro text.",
  "QR 카드로 안내할 곳": "Where the QR card leads",
  "카드 인쇄": "Print card",
  "이미지 만드는 중…": "Making image…",
  "카드 PNG 저장": "Save card as PNG",
  "소개 문구 복사": "Copy intro text",
  "QR은 공개 웹앱 주소로 연결돼요. 학생 작품이나 기록은 포함하지 않아요. 휴대전화·태블릿에서 QR을 읽거나 아래 주소를 직접 열 수 있어요.":
    "The QR links to the public web app. It contains no student work or records. Scan the QR on a phone or tablet, or open the link below directly.",
  "{title} 인쇄용 QR 소개 카드": "Printable QR intro card for {title}",
  "{title} QR 카드": "{title} QR card",
  "{title} QR 소개 카드": "{title} QR intro card",
  "퀴즈·이야기·타이머를": "Make and fix quizzes,",
  "만들고 고치며 배워요": "stories and timers to learn",
  "코드를 몰라도, 규칙 하나부터 직접 바꿔봐요.":
    "No coding needed. Start by changing one rule yourself.",
  "오늘 함께할 활동": "Today's activity",
  "예상하기 → 눌러보기 → 고치기 → 설명하기": "Predict → Run → Fix → Explain",
  "QR을 읽고 바로 시작하세요 · 학생 가입 없이":
    "Scan the QR and start right away · no sign-up",
  "{title} 직접 열기 · 새 탭": "Open {title} directly · new tab",
  "작품 {n} / {total} · {file}": "Work {n} / {total} · {file}",
  "✕ 발표 끝내기": "✕ End presentation",
  "발표 장면": "Presentation slide",
  "누르기 전에 이렇게 예상했어요": "Before running, I predicted this",
  "직접 눌러 보니": "When I ran it",
  "이상했던 점": "What seemed wrong",
  "이렇게 바꿨어요": "What I changed",
  "바꾼 까닭": "Why I changed it",
  "이 앱은 이렇게 움직여요": "How this app works",
  "←·→ 방향키로 넘기고 Esc로 끝내요": "Use ←·→ keys to move, Esc to end",
  "칭찬·질문 카드": "Praise & question card",
  "작품: {title}": "Work: {title}",
  "좋았던 점 ________________________________":
    "What I liked ________________________________",
  "궁금한 점 ________________________________":
    "What I wonder ________________________________",
  "적은 친구 ____________": "Written by ____________",
  "모두에게 열린 학습 자료": "Learning materials open to everyone",
  "40분 × 8차시. 아이의 생각과 검사 과정을 함께 살펴보세요.":
    "40 minutes × 8 lessons. Look at students' thinking and their checking process together.",
  "화면 안내 인쇄": "Print screen guide",
  "공개 학습 자료예요. 모드 선택은 교사 인증이나 접근 통제가 아니에요. 3~4학년은 선택 카드와 짝 활동을 활용해 주세요.":
    "These are public learning materials. Choosing a mode is not teacher verification or access control. For grades 3–4, use choice cards and partner activities.",
  "수업 자료 내려받기": "Download lesson materials",
  "초등 5~6학년 기준 · 40분씩 8차시 · PDF로 인쇄하고 Word로 수정하세요.":
    "For grades 5–6 · 8 lessons of 40 minutes · print as PDF, edit in Word.",
  "모두 받기 · ZIP": "Download all · ZIP",
  "{n}쪽 · PDF / Word": "{n} pages · PDF / Word",
  "{title} PDF 열기 (새 탭)": "Open {title} PDF (new tab)",
  "PDF 열기": "Open PDF",
  "{title} PDF 내려받기": "Download {title} PDF",
  "PDF 내려받기": "Download PDF",
  "{title} Word 수정본 내려받기": "Download editable Word file of {title}",
  "Word 수정본": "Editable Word",
  "오늘 쓸 활동지만 필요하면 아래 차시를 펼쳐 받으세요. 한 면당 한 쪽으로 인쇄하고, 양면 인쇄는 긴 쪽 넘김을 선택하세요. 6차시 외부 AI 도구는 교사·성인이 조작해요.":
    "If you only need today's worksheet, expand a lesson below to download it. Print one page per sheet; for double-sided printing, choose long-edge flip. In Lesson 6, the external AI tool is operated by the teacher or another adult.",
  "이 차시에 연결한 미션 · {title}": "Mission linked to this lesson · {title}",
  "미션 안내 열기": "Open mission guide",
  "수업 키트 한 장 인쇄": "Print one-page lesson kit",
  "학생용 미션 주소 복사": "Copy student mission link",
  "주소에는 미션만 들어가요. 학생의 기록은 각자 기기에 남아요.":
    "The link contains only the mission. Student records stay on each device.",
  "{n}차시 학생 활동지 · 앞뒤 2쪽":
    "Lesson {n} student worksheet · 2 pages, front and back",
  "{n}차시 학생 활동지 PDF 열기 (새 탭)":
    "Open Lesson {n} student worksheet PDF (new tab)",
  "활동지 PDF 열기": "Open worksheet PDF",
  "{n}차시 학생 활동지 내려받기": "Download Lesson {n} student worksheet",
  "활동지 내려받기": "Download worksheet",
  "전개 30분": "Activity 30 min",
  "교사 발문": "Teacher questions",
  "관찰 기준": "Observation criteria",
  "기기 문제 대안": "If devices fail",
  "짝 활동 · 역할을 바꿔요": "Partner activity · switch roles",
  "운전자: 버튼을 누르고 규칙을 수정해요. 관찰자: 실행 전에 예상하고, 결과와 이유를 적어요.":
    "Driver: presses buttons and edits rules. Observer: predicts before running, then records the result and the reason.",
  "10분마다 역할을 교대해요. 먼저 답을 알려 주기보다 “어떻게 검사할까?”를 물어보세요.":
    "Switch roles every 10 minutes. Rather than giving the answer first, ask “How could we check it?”",
  "인쇄용 검사 카드": "Printable check card",
  "검사표 프로젝트": "Check sheet project",
  "모든 프로젝트": "All projects",
  "기대한 결과는 정상 규칙의 예시예요. 작품의 약속에 맞게 조정해서 사용하고, 실제 결과는 직접 관찰한 뒤 적어 주세요.":
    "Expected results are examples of the correct rule. Adjust them to fit each work's rules, and write actual results only after observing them.",
  "검사표 · 좌우 방향키로 이동해 읽기":
    "Check sheet · use left/right arrow keys to scroll",
  "검사 행동": "Check action",
  "실제 결과 / 판정": "Actual result / verdict",
  "실제: __________________": "Actual: __________________",
  "□ 확인 □ 수정 필요 □ 미확인": "□ OK □ Needs fixing □ Not checked",
  "수정과 재검사": "Fix and recheck",
  "발생 상황: _____________________": "What happened: _____________________",
  "바꾼 규칙과 이유: _____________________":
    "Rule changed and why: _____________________",
  "같은 행동으로 다시 검사한 결과: _____________________":
    "Result of rechecking with the same action: _____________________",
  "친구의 관찰 의견: _____________________":
    "Partner's observation: _____________________",
  "프롬프트 길이, 코드 줄 수, 장식의 양으로 이해도를 평가하지 않습니다. 실제 기록과 설명을 근거로 단계와 의견을 적습니다.":
    "Understanding is not assessed by prompt length, lines of code or amount of decoration. Levels and comments are based on actual records and explanations.",
  "과정 평가표 · 좌우 방향키로 이동해 읽기":
    "Process rubric · use left/right arrow keys to scroll",
  "확인한 근거 / 다음 도움: _____________________________________":
    "Evidence checked / next support: _____________________________________",
  "시범 작품 열기": "Open sample work",
  "처음 값 {v}에서 시작해요.": "Starts at the starting value {v}.",
  "맞는 조건 없음 → 그 밖에 문구": "No condition matches → otherwise message",
  "조건 {n}번이 처음으로 맞음": "Condition {n} is the first match",
  "처음으로 → {name} {v}": "Reset → {name} {v}",
  "모든 조건의 문구가 어떤 값에서는 나온다":
    "Every condition's message appears for some value",
  "앞 조건에 가려 나올 수 없는 조건 {n}개":
    "{n} condition(s) hidden by earlier conditions and can never appear",
  "모든 조건이 나올 수 있음": "Every condition can appear",
  "버튼을 누른 만큼 {name}이 바뀐다":
    "{name} changes each time a button is pressed",
  "3번 눌러 {a} → {b}": "Press 3 times: {a} → {b}",
  "{name} {v}에서 다시 시작": "Start again from {name} {v}",
  "가장 작은 값 제한 없음": "No smallest value limit",
  "{v}보다 작아지지 않음": "Never goes below {v}",
  "20번 줄여 {v}": "Decrease 20 times: {v}",
  "기억하는 값: {name} · 처음 {v}": "Remembered value: {name} · starts at {v}",
  "가장 작은 값: {v}": "Smallest value: {v}",
  "제한 없음": "No limit",
  "버튼 「{label}」: {name} {change}": "Button “{label}”: {name} {change}",
  "조건 {n}: 만약 {cond} 「{msg}」": "Condition {n}: if {cond} “{msg}”",
  "그 밖에: 「{msg}」": "Otherwise: “{msg}”",
  "{date}까지 평가하던 작품 {n}개를 이어서 열었어요.":
    "Reopened {n} works you were assessing until {date}.",
  "보내기 전에 확인해요": "Check before sending",
  "그대로 보내기": "Send as is",
  "가장 작은 값": "Smallest value",
  버튼: "Button",
  "버튼 이름": "Button name",
  "버튼이 바꾸는 값": "Value the button changes",
  조건: "Condition",
  "조건 종류": "Condition type",
  "조건 값": "Condition value",
  "조건 문구": "Condition message",
  "그 밖에 문구": "Otherwise message",
  "버튼을 누르면 숫자가 바뀌어요.": "Pressing a button changes the number.",
  "만약 숫자가 5 이상이면 축하해요.": "If the number is 5 or more, celebrate.",
  "어떤 조건에도 안 맞으면 다른 문구를 보여 줘요.":
    "If no condition matches, show a different message.",
  "숫자는 0보다 작아지지 않아요.": "The number never goes below 0.",
  "더 좁은 조건을 먼저 확인해요.": "Check narrower conditions first.",
  "「{msg}」 문구는 앞 조건에 가려서 나올 수 없어요.":
    "The message “{msg}” can never show because an earlier condition hides it.",
  "앱은 조건을 위에서부터 확인하고 처음 맞는 것 하나만 써요. 조건 {n}번을 조건 {k}번보다 위로 올려 보세요.":
    "The app checks conditions from the top and uses only the first one that matches. Try moving condition {n} above condition {k}.",
  "교사용 사용 안내서": "Teacher's guide",
  "앱 사용법, 차시별 시간표와 발문, 과정 평가, 저장·백업 안내":
    "How to use the app, lesson-by-lesson schedules and questions, process assessment, saving and backup",
  "차시별 학생 활동지 전체": "All student worksheets by lesson",
  "1~8차시 예상·관찰·수정·재검사 기록지 · 차시마다 앞뒤 2쪽":
    "Prediction, observation, fix and re-check sheets for Lessons 1–8 · 2 pages (front and back) per lesson",
  "새 기능 수업 보충 안내": "Supplementary guide for new features",
  "패턴 그리기·쉬운 모드·친구 검사·자기 평가·수업 진행·맞춤 힌트·앱 파일·QR·화면 보기·선생님 미션 · 친구 검사 기록지 1쪽":
    "Pattern drawing · easy mode · partner check · self-assessment · lesson presentation · tailored hints · app files · QR · screen view · teacher's missions · 1-page partner check sheet",
  "학생 활동지 영어판 (Student worksheets in English)":
    "Student worksheets in English",
  "1~8차시 활동지를 같은 배치로 옮긴 영어판 · 영어 화면으로 배우는 학생용":
    "English version of the Lesson 1–8 worksheets with the same layout · for students learning with the English screen",
  "같은 정답을 세 번 누르기": "Press the same correct answer three times",
  "한 문제의 점수는 한 번만 반영된다.":
    "Each question's score counts only once.",
  "마지막 문제까지 풀기": "Solve through the last question",
  "마지막 문제 뒤에 최종 점수와 결과가 나온다.":
    "After the last question, the final score and result appear.",
  "다시 시작하기": "Start over",
  "점수 0점·첫 문제·답하지 않은 상태로 돌아간다.":
    "Returns to 0 points, the first question and no answer chosen.",
  "두 갈림길 모두 가 보기": "Try both paths",
  "각 선택이 의도한 장면으로 연결되고 모든 결말에 도달한다.":
    "Each choice leads to the intended scene, and every ending can be reached.",
  "처음으로 돌아가기": "Go back to the beginning",
  "시작 장면으로 돌아가고 지나온 길이 비워진다.":
    "Returns to the starting scene and clears the path taken.",
  "시작을 연속으로 누르기": "Press Start several times in a row",
  "타이머 하나만 실행되고 시간이 두 배로 줄지 않는다.":
    "Only one timer runs, and time doesn't count down twice as fast.",
  "일시정지 후 기다렸다가 재개하기": "Pause, wait, then resume",
  "멈춘 동안 남은 시간이 유지되고 그 지점부터 이어진다.":
    "The remaining time is kept while paused and continues from that point.",
  "0초가 된 뒤 기다리기": "Wait after it reaches 0 seconds",
  "0초보다 작아지지 않고 종료 안내가 한 번 나온다.":
    "It doesn't go below 0 seconds, and the end message appears once.",
  "초기화한 다음 다시 시작하기": "Reset, then start again",
  "설정한 시간·정지 상태로 돌아간 뒤 다시 실행된다.":
    "Returns to the set time in a stopped state, then runs again.",
  "그리기 전에 모양을 예상하고 모두 그리기":
    "Predict the shape before drawing, then draw it all",
  "명령 순서대로 칸이 칠해지고 목표 모양과 같다.":
    "Squares are filled in command order and match the target shape.",
  "한 칸씩 그리며 위치 기록하기":
    "Draw one square at a time and record the position",
  "이동할 때마다 현재 위치가 한 칸씩 바뀐다.":
    "The current position moves one square with each move.",
  "판 끝에 닿은 뒤에도 그리기":
    "Keep drawing after reaching the edge of the board",
  "판 끝에서 멈추고 반대편 칸을 칠하지 않는다.":
    "It stops at the edge and doesn't fill squares on the opposite side.",
  "시작 단계": "Beginning",
  "수행 단계": "Doing",
  "설명·적용 단계": "Explaining & applying",
  "모두 기록": "Record all",
  "1번째": "1st",
  "2번째": "2nd",
  "3번째까지": "Up to 3rd",
  "작품 실행": "Running the work",
  "예상과 실제": "Prediction and actual",
  "고친 이유": "Reason for the fix",
  "작동 원리": "How it works",
  "만약 규칙": "If-then rule",
  "작은 문제를 앱으로": "Small problems into apps",
  "생활 속 작은 문제를 골라 첫 작품을 실행하고 한 가지를 바꾼다.":
    "Pick a small everyday problem, run a first work, and change one thing.",
  "기기 1대/짝, 퀴즈 첫 미션, 종이 메모":
    "1 device per pair, first quiz mission, paper notes",
  "불편했던 순간을 이야기하고 필요한 앱을 고른다.":
    "Talk about an inconvenient moment and choose an app that would help.",
  "목표와 사용할 사람 정하기 7분 → 첫 퀴즈 예상·실행 10분 → 안내 한 가지 수정·재검사 13분":
    "Set the goal and users 7 min → predict and run the first quiz 10 min → change one message and re-check 13 min",
  "무엇을 왜 바꿨는지 짝에게 설명한다.":
    "Explain to a partner what was changed and why.",
  "이 앱을 누가 언제 쓰면 도움이 될까요?": "Who would this app help, and when?",
  "문제와 기능을 연결하고 변경 이유를 말하는가?":
    "Does the student connect the problem to a feature and give a reason for the change?",
  "인쇄한 화면 카드에서 답을 고르고 점수 토큰으로 실행한다.":
    "Choose answers on printed screen cards and run it with score tokens.",
  "구체적으로 설명하기": "Explaining specifically",
  "목적·기능·완료 조건을 포함한 요청문을 쓴다.":
    "Write a request that includes the purpose, features and completion criteria.",
  "요청문 도우미, 수정 전 요청문": "Request helper, request before revision",
  "두 요청문을 비교해 모호한 말을 찾는다.":
    "Compare two requests and find vague words.",
  "원문 작성 8분 → 여섯 질문 채우기 12분 → 요청문 정리와 전후 비교 10분":
    "Write the original 8 min → answer the six questions 12 min → finalize the request and compare before/after 10 min",
  "새로 추가한 완료 조건 한 가지를 읽는다.":
    "Read one newly added completion criterion.",
  "잘 만들어 줘 대신 무엇을 확인하면 될까요?":
    "Instead of “make it nice,” what could we check?",
  "원문을 보존하며 검사 가능한 조건을 추가하는가?":
    "Does the student keep the original and add checkable criteria?",
  "여섯 질문을 종이에 적고 짝이 요청을 읽어 준다.":
    "Write the six questions on paper and have a partner read the request aloud.",
  "입력과 조건 알아보기": "Exploring inputs and conditions",
  "선택에 따른 결과를 예상하고 실행 결과와 비교한다.":
    "Predict results for each choice and compare them with the actual run.",
  "갈림길 이야기 미션, 장면 카드": "Branching story mission, scene cards",
  "갈림길 선택 하나의 결과를 예상한다.":
    "Predict the result of one branching choice.",
  "입력·조건 찾기 8분 → 두 길 예상·실행 12분 → 연결 수정과 비교 10분":
    "Find inputs and conditions 8 min → predict and run both paths 12 min → fix links and compare 10 min",
  "선택 → 규칙 → 결과를 설명한다.": "Explain choice → rule → result.",
  "같은 선택을 하면 항상 같은 장면에 도착하나요?":
    "Does the same choice always lead to the same scene?",
  "선택지 문장과 연결 규칙을 구별하는가?":
    "Does the student distinguish choice text from link rules?",
  "바닥에 장면 카드를 놓고 화살표로 연결한다.":
    "Lay scene cards on the floor and connect them with arrows.",
  "앱이 기억하는 값": "Values the app remembers",
  "점수·문제 번호·남은 시간을 찾아 초기화 전후를 비교한다.":
    "Find the score, question number and time left, and compare them before and after reset.",
  "퀴즈·타이머, 기록표": "Quiz and timer, record sheet",
  "앱이 잠깐 기억해야 할 값을 찾아본다.":
    "Find values the app needs to remember for a while.",
  "상태 값 관찰 10분 → 실행·멈춤·초기화 비교 12분 → 원리 설명 8분":
    "Observe state values 10 min → compare run, pause and reset 12 min → explain how it works 8 min",
  "초기화해야 하는 값 두 가지를 적는다.":
    "Write down two values that must be reset.",
  "화면이 처음으로 돌아가도 점수가 남아 있으면 어떨까요?":
    "What if the screen goes back to the start but the score stays?",
  "입력과 상태 값을 구별하고 초기화를 설명하는가?":
    "Does the student distinguish inputs from state values and explain resetting?",
  "점수판과 종이 타이머를 역할극으로 운영한다.":
    "Run a scoreboard and a paper timer as a role-play.",
  "버그 탐정 되기": "Becoming a bug detective",
  "준비된 오류를 재현하고 한 가지 규칙을 고쳐 재검사한다.":
    "Reproduce a prepared bug, fix one rule and re-check.",
  "퀴즈 중복 점수 미션, 검사 카드": "Quiz duplicate-score mission, check cards",
  "같은 답을 세 번 누르면 몇 점이어야 할지 이야기한다.":
    "Discuss how many points pressing the same answer three times should give.",
  "오류 재현·검사 10분 → 규칙 수정과 이유 10분 → 같은 조건으로 재검사·버전 저장 10분":
    "Reproduce and check the bug 10 min → fix the rule and give a reason 10 min → re-check under the same conditions and save a version 10 min",
  "기대한 결과와 실제 결과를 나란히 설명한다.":
    "Explain the expected result and actual result side by side.",
  "어떤 행동을 다시 해 보면 고쳤다고 말할 수 있나요?":
    "What action could you repeat to say it's fixed?",
  "설정 한 가지를 바꾸고 동일 검사를 다시 수행하는가?":
    "Does the student change one setting and run the same check again?",
  "반복 채점 규칙과 한 번 채점 규칙을 점수 토큰으로 비교한다.":
    "Compare repeat-scoring and score-once rules with score tokens.",
  "실제 AI와 만들기": "Building with real AI",
  "교사가 외부 AI를 조작하고 학생은 결과를 관찰·검사한다.":
    "The teacher operates an external AI tool while students observe and check the results.",
  "교사가 준비한 외부 AI 개발 도구, 사전 생성 예제, 요청문·검사표":
    "External AI coding tool prepared by the teacher, pre-generated examples, request and check sheets",
  "기본 연습과 실제 AI 제작 활동의 차이를 확인한다.":
    "Identify how basic practice differs from building with real AI.",
  "학생 요청·검사 조건 10분 → 교사가 외부 도구에서 생성·실행 10분 → 학생 검사·수정 요청 10분":
    "Student requests and check criteria 10 min → teacher generates and runs in the external tool 10 min → students check and request fixes 10 min",
  "사용한 도구·도움·관찰 결과를 기록한다.":
    "Record the tools used, help received and observations.",
  "복사한 사실과 실제 실행을 관찰한 사실은 어떻게 다를까요?":
    "How is copying a fact different from observing an actual run?",
  "실제 결과를 직접 기록하고 도구의 도움을 밝히는가?":
    "Does the student record actual results firsthand and disclose help from tools?",
  "생성이 늦거나 인터넷이 끊기면 교사가 준비한 사전 예제로 같은 검사를 진행하고 그 사실을 기록한다.":
    "If generation is slow or the internet drops, the teacher runs the same check with a prepared example and notes that.",
  "친구가 사용해 보기": "Letting a friend try it",
  "짝의 관찰 의견으로 안내와 동작을 개선한다.":
    "Improve messages and behavior using a partner's observations.",
  "각자의 작품, 짝 활동 검사표":
    "Each student's work, pair-activity check sheet",
  "비난 대신 관찰한 사실을 말하는 방법을 연습한다.":
    "Practice stating observed facts instead of blaming.",
  "운전자·관찰자 1차 사용 10분 → 역할 교대 10분 → 의견을 반영해 수정·재검사 10분":
    "Driver and observer, first use 10 min → switch roles 10 min → revise using feedback and re-check 10 min",
  "반영한 의견과 유지한 동작을 설명한다.":
    "Explain which feedback was used and which behavior was kept.",
  "친구가 멈칫한 순간에 어떤 안내가 필요했나요?":
    "When your friend hesitated, what guidance was needed?",
  "의견과 자동 검사 결과를 구분하고 수정 근거로 사용하는가?":
    "Does the student separate feedback from automatic check results and use them as reasons for fixes?",
  "인쇄한 장면·버튼 카드로 사용 상황을 재현한다.":
    "Act out use cases with printed scene and button cards.",
  "새 문제에 적용하기": "Applying to a new problem",
  "다른 조건의 과제로 옮겨 요청·예상·검사를 설계한다.":
    "Transfer to a task with different conditions and plan the request, prediction and check.",
  "포트폴리오, 새 과제 카드: 운동 20초·휴식 안내 타이머":
    "Portfolio, new task card: 20-second exercise and rest reminder timer",
  "기존 예제와 다른 사용자와 조건을 확인한다.":
    "Identify users and conditions that differ from the earlier example.",
  "새 요구와 요청 8분 → 예상·제작·검사 14분 → 포트폴리오 정리·설명 8분":
    "New needs and request 8 min → predict, build and check 14 min → organize and explain the portfolio 8 min",
  "다른 앱에도 적용할 검사 방법을 공유한다.":
    "Share check methods that work for other apps too.",
  "사용자가 달라져도 그대로 쓸 수 있는 검사와 바꿀 검사는 무엇인가요?":
    "Which checks still work for different users, and which need to change?",
  "새 상황에 완료 조건을 조정하고 원리와 근거를 설명하는가?":
    "Does the student adjust completion criteria for the new situation and explain how it works and why?",
  "종이에 요청문과 검사 계획을 작성하고 모의 실행으로 결과를 기록한다.":
    "Write a request and check plan on paper and record results with a mock run.",
  "햇빛과 물": "Sunlight and water",
  리모컨: "Remote control",
  장난감: "Toy",
  "친구와 함께 앱을 만들 때 좋은 방법은?":
    "What's a good way to build an app with a friend?",
  "혼자만 누르기": "Only one person presses",
  "생각을 나누고 번갈아 하기": "Share ideas and take turns",
  "검사하지 않기": "Skip checking",
  "정답이에요! 잘 생각했어요.": "Correct! Great thinking.",
  "괜찮아요. 다음 문제도 도전해 봐요.": "That's okay. Try the next one!",
  "숲속의 작은 갈림길": "The Little Fork in the Forest",
  "도서관에서 빌린 지도를 따라 숲에 도착했어요. 두 갈래 길 중 어디로 갈까요?":
    "You followed a map from the library into the forest. Which of the two paths will you take?",
  "커다란 나무 쪽으로": "Toward the big tree",
  "햇빛이 비치는 쪽으로": "Toward the sunlight",
  "나무 도서관": "Tree library",
  "나뭇가지 사이에 작은 도서관이 있었어요. 다람쥐와 책을 읽으며 하루를 보냈답니다.":
    "There was a tiny library among the branches. You spent the day reading books with a squirrel.",
  "햇살 정원": "Sunshine garden",
  "꽃이 가득한 정원을 찾았어요. 친구들과 씨앗을 심고 다음 만남을 약속했답니다.":
    "You found a garden full of flowers. You planted seeds with friends and promised to meet again.",
  "약속한 시간이 끝났어요! 잠깐 쉬어 가요.":
    "Time's up! Let's take a short break.",
  스티커: "Stickers",
  "+1 스티커 붙이기": "+1 Add a sticker",
  "−1 스티커 떼기": "−1 Remove a sticker",
  "우와, 스티커 5개를 모았어요!": "Wow, you collected 5 stickers!",
  "스티커를 모아 볼까요?": "Shall we collect some stickers?",
  "좋아요, 3개 넘게 모았어요!": "Nice, you got more than 3!",
  "최고예요! 6개를 모았어요!": "Awesome! You collected 6!",
  걸음: "Steps",
  "+1 한 걸음": "+1 One step",
  "+2 두 걸음": "+2 Two steps",
  "−1 뒤로": "−1 Back",
  "딱 10걸음, 보물 도착!": "Exactly 10 steps, you found the treasure!",
  "이제 막 출발했어요.": "You just set off.",
  "보물을 향해 걷는 중이에요.": "Walking toward the treasure.",
  "조건마다 나올 수 있음": "Can show for each condition",
  "버튼과 기억하는 값": "Buttons and remembered values",
  "처음으로 다시": "Start over",
  "뚝딱 바이브 공작소에서 퀴즈·이야기·타이머를 만들고 고치며 코딩의 원리를 배워요.\n오늘의 안내: {title}\n{detail}\n학생 가입 없이 시작할 수 있어요.\n{url}":
    "At Ttukttak Vibe Workshop, kids learn how coding works by making and fixing quizzes, stories and timers.\nToday's guide: {title}\n{detail}\nNo student sign-up needed.\n{url}",
  "{list} — 이 기기의 미션을 새 판으로 바꿀까요? 이미 만든 작품은 그대로 남고, 새로 시작하는 작품부터 새 판을 써요.":
    "{list} — Replace the mission on this device with the new edition? Works you already made stay as they are; new works use the new edition.",
  "선생님 미션 {n}개를 새 판으로 바꿨어요.":
    "Updated {n} teacher's mission(s) to the new edition.",
  "「{title}」은 이미 같은 판이 이 기기에 있어요.":
    "“{title}” is already on this device in the same edition.",
  "「{title}」 {v}판을 고치는 중이에요. 저장하면 {next}판이 되고, 이 미션을 이미 받은 기기는 다음에 파일을 열 때 새 판으로 바꿀지 물어요.":
    "Editing “{title}” edition {v}. Saving makes edition {next}; devices that already have this mission will be asked to update the next time they open a file.",
  "고치기 그만두기": "Stop editing",
  "영어 글 함께 적기 (선택)": "Add English text (optional)",
  "영어 화면을 쓰는 학급에 나눠 줄 때 채워요. 다섯 칸을 모두 적고 검사·힌트 줄 수가 한국어와 같아야 영어 화면에 나와요. 비워 두면 영어 화면에서도 한국어 글을 보여 줘요.":
    "Fill this in for classes that use the English screen. All five fields must be filled and the number of check and hint lines must match the Korean for it to show in English. Left empty, the Korean text is shown in English too.",
  "Checks · 한 줄에 하나, 「이름 | 기대 결과」 ({n}줄)":
    "Checks · one per line, “name | expected result” ({n} lines)",
  "Hints · 한 줄에 하나 ({n}줄)": "Hints · one per line ({n} lines)",
  "고쳐서 새 판 만들기": "Edit as new edition",
  "선생님 미션의 새 판이 왔어요":
    "A new edition of a teacher's mission arrived",
  "새 판으로 바꾸기": "Update to new edition",
  "1~8차시 예상·관찰·수정·재검사 기록지와 보충 차시(만약 규칙 앱) · 차시마다 앞뒤 2쪽":
    "Predict · observe · fix · re-check sheets for Lessons 1–8 plus the extra lesson (If-then rule app) · 2 pages per lesson",
  "1~8차시와 보충 차시(만약 규칙 앱) 활동지를 같은 배치로 옮긴 영어판 · 영어 화면으로 배우는 학생용":
    "English edition of the Lesson 1–8 and extra-lesson worksheets, same layout · for students using the English screen",
  "교사용 안내서 영어판 (Teacher guide in English)": "Teacher guide in English",
  "14쪽 안내서를 같은 배치로 옮긴 영어판 · 영어로 수업하는 교사용":
    "English edition of the 14-page guide, same layout · for teachers teaching in English",
  "새 기능 보충 안내 영어판 (New features supplement in English)":
    "New features supplement in English",
  "6쪽 보충 안내의 영어판": "English edition of the 6-page supplement",
  "코스 「{title}」을 받았어요. 나의 미션 지도에서 순서대로 열어요.":
    "Received the course “{title}”. Open it in order from My mission map.",
  "최근 되돌리기 기록도 함께 왔어요.": "Recent undo steps came along too.",
  "선생님 평가를 받았어요.": "Received the teacher’s assessment.",
  "차시별 진행": "Progress by lesson",
  "8차시 계획의 미션별로 읽은 작품을 셌어요. 같은 미션을 쓰는 차시는 같은 작품이 보여요. ‘많이 멈춘 단계’는 아직 기록하지 않은 첫 단계가 가장 많은 곳이에요.":
    "Works are counted by the mission of each lesson in the 8-lesson plan. Lessons that share a mission show the same works. ‘Most stuck at’ is the first unrecorded step that the most students are on.",
  "차시별 진행표 · 좌우 방향키로 이동해 읽기":
    "Progress by lesson table · use the left and right arrow keys to read",
  차시: "Lesson",
  "다섯 단계 완료": "All five steps done",
  "많이 멈춘 단계": "Most stuck at",
  "{stage} · {n}명": "{stage} · {n} students",
  "평가를 QR로 돌려주기": "Return assessment by QR",
  "내가 설계한 검사 · 앱에게 실험 시키기":
    "My own test · let the app run the experiment",
  "‘이렇게 누르면 이런 결과가 나올 거야’를 적어요. 앱이 대신 눌러 본 결과와 비교해 ‘학습자 직접 확인’ 카드로 남겨요.":
    "Write ‘if I press it like this, this should happen’. The app presses for you, compares the result and saves a ‘Checked by learner’ card.",
  "어떻게 눌러 볼까요?": "How should the app press?",
  "예상 결과 (숫자나 문구)": "Expected result (a number or phrase)",
  "예: 점수 2": "e.g. score 2",
  "실험할 것: {label}": "Experiment: {label}",
  "예상 결과를 먼저 적어 주세요.": "Write the expected result first.",
  "예상대로였어요! 카드에 기록했어요.": "Just as expected! Saved to a card.",
  "예상과 달랐어요. 왜 다른지 생각해 보고 카드에 적어요.":
    "Not as expected. Think about why and write it on the card.",
  "실험하고 기록하기": "Run and record",
  "자동 검사 결과 듣기": "Listen to the automatic test results",
  "힌트 듣기": "Listen to the hint",
  "미션 묶음(코스) 만들기": "Make a mission course",
  "기본 미션과 선생님 미션을 순서대로 묶어요. 학생이 코스 파일을 가져오면 나의 미션 지도에 ‘우리 반 코스’ 길이 생기고, 담긴 선생님 미션도 함께 더해져요.":
    "Bundle built-in and teacher missions in order. When a student imports the course file, a ‘Our class course’ path appears on their mission map and the teacher missions inside are added too.",
  "코스 이름": "Course name",
  "넣을 미션": "Mission to add",
  "코스에 더하기": "Add to course",
  "코스 순서": "Course order",
  "{n}번 미션을 앞으로": "Move mission {n} up",
  "{n}번 미션 빼기": "Remove mission {n}",
  빼기: "Remove",
  "아직 넣은 미션이 없어요.": "No missions added yet.",
  "코스 「{title}」을 이 기기에 더했어요.":
    "Added the course “{title}” to this device.",
  "이 기기에 코스 더하기": "Add course to this device",
  "코스 파일을 내려받았어요. 학생은 내 작품 선반의 ‘파일 가져오기’로 더해요.":
    "Course file downloaded. Students add it with ‘Import file’ on My shelf.",
  "코스 파일 내려받기": "Download course file",
  "이 기기의 코스 {n}개": "{n} courses on this device",
  "미션 {n}개": "{n} missions",
  "코스 「{title}」을 이 기기에서 지웠어요.":
    "Removed the course “{title}” from this device.",
  "우리 반 코스 · {title}": "Our class course · {title}",
  "{n} / {m} 완료": "{n} / {m} done",
  "다음에 할 미션": "Next mission",
  "결과 듣기": "Listen to the result",
  "친구가 물어본 것": "What your friend asked",
  "질문 {n}: {q}": "Question {n}: {q}",
  "누르기 전에 예상한 것": "Predicted before pressing",
  "눌러 본 뒤": "After pressing",
  예상대로였어요: "As I expected",
  "예상과 달랐어요": "Different from my prediction",
  "아직 표시하지 않았어요.": "Not marked yet.",
  "선택 {n}": "Choice {n}",
  "점수 {a} → {b}": "Score {a} → {b}",
  "점수 {n}점": "Score {n}",
  "문제 {i} · 점수 {n}": "Question {i} · score {n}",
  "장면 듣기": "Listen to the scene",
  "장면 {a} → {b}": "Scene {a} → {b}",
  "처음 장면으로 돌아감": "Back to the first scene",
  "남은 시간 {n}초": "{n} s left",
  "시계가 흐르기 시작함": "Clock started",
  "남은 시간을 기억하고 멈춤": "Paused, remembering the time left",
  "설정 시간으로 돌아가 정지": "Reset to the set time and stopped",
  "선생님 평가가 왔어요 · 「{title}」":
    "A teacher assessment arrived · “{title}”",
  "받으면 이 작품의 포트폴리오 ‘과정 평가 · 나와 선생님’에 선생님 평가가 들어가요.":
    "If you accept, the teacher assessment goes into this work’s portfolio under ‘Process assessment · me and my teacher’.",
  "이 기기에 「{title}」 작품이 없어요. 작품을 먼저 가져온 뒤 다시 비춰 주세요.":
    "The work “{title}” is not on this device. Import the work first, then scan again.",
  "평가 받기": "Accept assessment",
  "실제로 눌러 보니 예상과 어땠나요?":
    "After pressing, how did it compare with your prediction?",
  "무엇이 달랐나요? 틀린 예상도 소중한 배움이에요":
    "What was different? A wrong prediction is valuable learning too",
  "어떤 점이 맞았나요?": "What did you get right?",
  "친구에게 물어볼 것 (선택 · 한 줄에 하나, 5개까지)":
    "Questions for your friend (optional · one per line, up to 5)",
  "예: 점수가 두 번 오르는지 확인해 줘":
    "e.g. Check whether the score goes up twice",
  "문제 {a}에서 {b}번 답 고르기 → 점수":
    "Pick answer {b} on question {a} → score",
  "답 번호": "Answer number",
  "문제 {a}에서 정답을 두 번 고르기 → 점수":
    "Pick the correct answer twice on question {a} → score",
  "모든 문제를 정답으로 풀기 → 최종 점수":
    "Answer every question correctly → final score",
  "{a}번 버튼을 {b}번 누르기 → 값과 문구":
    "Press button {a} {b} times → value and message",
  "버튼 번호": "Button number",
  "누르는 횟수": "Number of presses",
  "시작하고 {a}초 기다리기 → 남은 시간": "Start and wait {a} s → time left",
  "기다리는 초": "Seconds to wait",
  "명령을 모두 실행하기 → 칠한 칸 수": "Run all commands → painted cells",
  "시작 장면에서 {a}번 선택하기 → 다음 장면":
    "Pick choice {a} on the first scene → next scene",
  "선택 번호": "Choice number",
  "점수 {n}": "Score {n}",
  "최종 점수 {n}": "Final score {n}",
  "{name} {v} · 문구 「{m}」": "{name} {v} · message “{m}”",
  "남은 시간 0초 · {end}": "0 s left · {end}",
  "종료 안내 표시": "End message shown",
  "종료 안내 없음": "No end message",
  "칠한 칸 {n}개 · 목표와 다른 칸 {m}개":
    "{n} cells painted · {m} cells differ from the target",
  "장면 「{title}」": "Scene “{title}”",
  "이어지는 장면이 없어요": "No scene follows",
  "내가 설계한 검사": "My own test",
  "앱이 대신 눌러 봤어요": "The app pressed for you",
  "실행 기록 되감기 · {n}번 눌렀어요": "Rewind the run log · {n} presses",
  "한 칸 앞으로 되감기": "Rewind one step",
  "실행 기록 위치": "Run log position",
  "한 칸 뒤로": "Forward one step",
  "지난 기록을 보고 있어요. 실행 화면은 지금 값을 보여 줘요.":
    "You are viewing a past step. The app view shows the current values.",
  "예상 확인": "prediction check",
  "예상 확인 메모": "prediction check note",
  "되돌리기 기록": "undo history",
  "되돌리기 단계": "undo step",
  질문: "Question",
  "질문 답": "question answer",
  답: "answer",
  "평가가 비어 있어요.": "The assessment is empty.",
  "코스 파일 형식을 알 수 없어요.": "Unknown course file format.",
  "코스에는 미션을 1~{n}개 넣어 주세요.": "A course needs 1 to {n} missions.",
  "코스는 이 기기에 {n}개까지 둘 수 있어요.":
    "This device can hold up to {n} courses.",
};
