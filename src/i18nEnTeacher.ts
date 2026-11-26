// 교사 화면(교사 자료실·학급 모으기·미션 만들기·수업 진행 화면 등)에서만 쓰는 영어 번역.
// 학생 화면 번역(src/i18nEn.ts)과 나눠 두어 파일 하나가 너무 커지지 않게 한다. 영어를 고르면 둘을 함께 불러온다.
export const enTeacher: Record<string, string> = {
  "평가 목록을 이 기기에 보관하지 못했어요. CSV나 평가 파일로 내려받아 두세요.":
    "Couldn't keep the rating list on this device. Download it as a CSV or rating file.",
  "8차시 수업 안내": "8-lesson class guide",
  "검사표 · 짝 활동": "Checklist · pair activity",
  "시범 작품": "Demo work",
  미평가: "Not rated",
  "설명·적용": "Explaining & applying",
  "미션 만들기": "Create a mission",
  "{what}: {max}자 이내로 적어 주세요.":
    "{what}: Write {max} characters or fewer.",
  "미션 파일 형식을 알 수 없어요.": "Unknown mission file format.",
  "검사 항목은 1~6개여야 해요.": "Check items must be 1–6.",
  "힌트는 1~3개여야 해요.": "Hints must be 1–3.",
  "미션 제목": "Mission title",
  "이번 과제": "This task",
  "미션 목표": "Mission goal",
  "예상 질문": "Prediction question",
  "선생님 미션은 이 기기에 {n}개까지 둘 수 있어요.":
    "This device can hold up to {n} teacher's missions.",
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
  "다음 단계 · {label}": "Next step · {label}",
  "힌트 · {label}": "Hints · {label}",
  "평가 · {label}": "Rating · {label}",
  "스스로 {self} · 선생님 {teacher} ({n}명)":
    "Self {self} · teacher {teacher} ({n} students)",
  "비교할 평가 없음": "No ratings to compare",
  "작품 {n}개를 읽었어요. 파일 {failed}개는 읽지 못했어요.":
    "Read {n} works. Couldn't read {failed} files.",
  "작품 {n}개를 읽었어요.": "Read {n} works.",
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
  "✓ 완료": "✓ Done",
  "통과 {n}": "Passed {n}",
  " · 남은 {n}": " · {n} left",
  " · 재검사함": " · rechecked",
  "{n}번째까지": "Up to #{n}",
  "안 봄": "Not viewed",
  "평가 완료": "Rated",
  "평가 전": "Not rated yet",
  "단계별 완료": "Steps done",
  "아직 읽은 작품이 없어요": "No work read yet",
  "학생 작품 파일을 고르면 단계 기록 표와 평가 카드가 나와요.":
    "Choose student work files to see the step record table and rating cards.",
  "{title} · {n} / 5단계": "{title} · {n} / 5 steps",
  "바꾼 동작과 이유": "What I changed and why",
  "직접 확인한 검사": "Checks I did myself",
  "평가를 넣은 작품 파일 내려받기": "Download rated work file",
  "학생이 이 파일을": "When the student opens this file with",
  "로 열면 포트폴리오에서 평가와 의견을 볼 수 있어요.":
    ", they can see the ratings and comments in their portfolio.",
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
  "학생이 처음 여는 앱이에요. 일부러 틀린 규칙을 넣었다면 아래 ‘학습용 오류 포함’을 켜 주세요.":
    "This is the app students open first. If you put in a wrong rule on purpose, turn on ‘Includes practice bug’ below.",
  "학습용 오류 포함 (학생이 찾아 고칠 규칙이 있어요)":
    "Includes practice bug (there's a rule for students to find and fix)",
  "검사 항목 (1~6개)": "Checks (1–6)",
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
  "아직 만든 미션이 없어요.": "No missions made yet.",
  "오늘의 활동 · {title}": "Today's activity · {title}",
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
  전개: "Activity",
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
  "작품 {n} / {total} · {file}": "Work {n} / {total} · {file}",
  "✕ 발표 끝내기": "✕ End presentation",
  "발표 장면": "Presentation slide",
  "누르기 전에 이렇게 예상했어요": "Before running, I predicted this",
  "직접 눌러 보니": "When I ran it",
  "이상했던 점": "What seemed wrong",
  "이렇게 바꿨어요": "What I changed",
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
  "{date}까지 평가하던 작품 {n}개를 이어서 열었어요.":
    "Reopened {n} works you were assessing until {date}.",
  "교사용 사용 안내서": "Teacher's guide",
  "앱 사용법, 차시별 시간표와 발문, 과정 평가, 저장·백업 안내":
    "How to use the app, lesson-by-lesson schedules and questions, process assessment, saving and backup",
  "차시별 학생 활동지 전체": "All student worksheets by lesson",
  "새 기능 수업 보충 안내": "Supplementary guide for new features",
  "패턴 그리기·쉬운 모드·친구 검사·자기 평가·수업 진행·맞춤 힌트·앱 파일·QR·화면 보기·선생님 미션 · 친구 검사 기록지 1쪽":
    "Pattern drawing · easy mode · partner check · self-assessment · lesson presentation · tailored hints · app files · QR · screen view · teacher's missions · 1-page partner check sheet",
  "학생 활동지 영어판 (Student worksheets in English)":
    "Student worksheets in English",
  "같은 정답을 세 번 누르기": "Press the same correct answer three times",
  "마지막 문제까지 풀기": "Solve through the last question",
  "마지막 문제 뒤에 최종 점수와 결과가 나온다.":
    "After the last question, the final score and result appear.",
  "점수 0점·첫 문제·답하지 않은 상태로 돌아간다.":
    "Returns to 0 points, the first question and no answer chosen.",
  "두 갈림길 모두 가 보기": "Try both paths",
  "각 선택이 의도한 장면으로 연결되고 모든 결말에 도달한다.":
    "Each choice leads to the intended scene, and every ending can be reached.",
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
  "시작 단계": "Beginning",
  "수행 단계": "Doing",
  "설명·적용 단계": "Explaining & applying",
  "1번째": "1st",
  "2번째": "2nd",
  "3번째까지": "Up to 3rd",
  "작품 실행": "Running the work",
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
  "1~8차시 예상·관찰·수정·재검사 기록지와 보충 차시(만약 규칙·분류하기 앱·반복 계산기) · 차시마다 앞뒤 2쪽":
    "Predict · observe · fix · re-check sheets for Lessons 1–8 plus the extra lessons (If-then rule app, Sorting app, Loop calculator) · 2 pages per lesson",
  "1~8차시와 보충 차시(만약 규칙·분류하기 앱·반복 계산기) 활동지를 같은 배치로 옮긴 영어판 · 영어 화면으로 배우는 학생용":
    "English edition of the Lesson 1–8 and extra-lesson worksheets, same layout · for students using the English screen",
  "교사용 안내서 영어판 (Teacher guide in English)": "Teacher guide in English",
  "14쪽 안내서를 같은 배치로 옮긴 영어판 · 영어로 수업하는 교사용":
    "English edition of the 14-page guide, same layout · for teachers teaching in English",
  "새 기능 보충 안내 영어판 (New features supplement in English)":
    "New features supplement in English",
  "6쪽 보충 안내의 영어판": "English edition of the 6-page supplement",
  "차시별 진행": "Progress by lesson",
  "8차시 계획의 미션별로 읽은 작품을 셌어요. 같은 미션을 쓰는 차시는 같은 작품이 보여요. ‘많이 멈춘 단계’는 아직 기록하지 않은 첫 단계가 가장 많은 곳이에요.":
    "Works are counted by the mission of each lesson in the 8-lesson plan. Lessons that share a mission show the same works. ‘Most stuck at’ is the first unrecorded step that the most students are on.",
  "차시별 진행표 · 좌우 방향키로 이동해 읽기":
    "Progress by lesson table · use the left and right arrow keys to read",
  "다섯 단계 완료": "All five steps done",
  "많이 멈춘 단계": "Most stuck at",
  "{stage} · {n}명": "{stage} · {n} students",
  "평가를 QR로 돌려주기": "Return assessment by QR",
  "미션 묶음(코스) 만들기": "Make a mission course",
  "기본 미션과 선생님 미션을 순서대로 묶어요. 학생이 코스 파일을 가져오면 나의 미션 지도에 ‘우리 반 코스’ 길이 생기고, 담긴 선생님 미션도 함께 더해져요.":
    "Bundle built-in and teacher missions in order. When a student imports the course file, a ‘Our class course’ path appears on their mission map and the teacher missions inside are added too.",
  "코스 이름": "Course name",
  "넣을 미션": "Mission to add",
  "코스에 더하기": "Add to course",
  "코스 순서": "Course order",
  "{n}번 미션을 앞으로": "Move mission {n} up",
  "{n}번 미션 빼기": "Remove mission {n}",
  "아직 넣은 미션이 없어요.": "No missions added yet.",
  "코스 「{title}」을 이 기기에 더했어요.":
    "Added the course “{title}” to this device.",
  "이 기기에 코스 더하기": "Add course to this device",
  "코스 파일을 내려받았어요. 학생은 내 작품 선반의 ‘파일 가져오기’로 더해요.":
    "Course file downloaded. Students add it with ‘Import file’ on My shelf.",
  "코스 파일 내려받기": "Download course file",
  "이 기기의 코스 {n}개": "{n} courses on this device",
  "코스 「{title}」을 이 기기에서 지웠어요.":
    "Removed the course “{title}” from this device.",
  "코스 파일 형식을 알 수 없어요.": "Unknown course file format.",
  "코스에는 미션을 1~{n}개 넣어 주세요.": "A course needs 1 to {n} missions.",
  "코스는 이 기기에 {n}개까지 둘 수 있어요.":
    "This device can hold up to {n} courses.",
  "코스에 적힌 미션 {n}개가 이 기기에 없어요. 미션 파일을 먼저 가져와 주세요.":
    "{n} missions in this course are not on this device. Import the mission files first.",
  "우리 반이 많이 만난 버그": "Bugs our class met most",
  "저장한 버전과 지금 편집본을 맞춤 힌트 규칙으로 살펴 셌어요. ‘지금은 고침’은 지금 편집본에서는 그 버그가 없는 학생 수예요.":
    "Counted by checking saved versions and the current draft with the smart-hint rules. ‘Fixed now’ is the number of students whose current draft no longer has that bug.",
  "버그 종류": "Bug type",
  "만난 학생": "Students who met it",
  "지금은 고침": "Fixed now",
  "읽은 작품에서 맞춤 힌트가 찾는 버그가 없었어요.":
    "The smart hints found no bugs in the works you loaded.",
  "제가 만든 작은 앱을 소개해요": "Here is a small app I made",
  "무엇을 만들었나요": "What I made",
  "고친 점과 이유": "What I fixed and why",
  "작품을 열어 보는 QR 코드": "QR code to open the work",
  "휴대전화 카메라로 비추고 ‘새 작품으로 받기’를 누르면 직접 눌러 볼 수 있어요.":
    "Scan it with a phone camera and press ‘Receive as a new work’ to try it yourself.",
  "뚝딱 바이브 공작소 · 가입과 서버 없이 학교에서 쓰는 코딩 학습 앱이에요. 점수가 아니라 예상하고 검사하고 고친 과정을 기록해요.":
    "Ttukttak Vibe Workshop · a coding app for school with no sign-up and no server. It records how students predicted, tested and fixed, not a score.",
  "고친 영어에도 한국어와 같은 {값} 자리가 있어야 해요. 중괄호 안 이름은 그대로 두세요.":
    "The fixed English needs the same {값} slots as the Korean. Keep the names inside the braces as they are.",
  "번역을 고쳤어요. 영어 화면에 바로 나와요.":
    "Translation fixed. It shows in the English screens right away.",
  "영어 번역 고치기": "Fix English translations",
  "영어 문장은 자동 번역으로 넣었어요. 수업에서 어색한 문장을 찾아 고치면 이 기기의 영어 화면에 바로 나와요. 고친 문장 파일을 저장소 관리자에게 보내면 모든 기기에 반영할 수 있어요.":
    "The English sentences were machine-translated. Find awkward ones and fix them, and the English screens on this device change right away. Send the file of fixes to the repository maintainer to apply them on every device.",
  "한국어나 영어로 찾기": "Search in Korean or English",
  "예: 다음 문제": "e.g. Next question",
  "고친 문장 {n}개 파일로 받기": "Download {n} fixed sentences as a file",
  "영어 번역표를 불러오고 있어요…": "Loading the English translations…",
  "찾는 문장이 없어요.": "No matching sentences.",
  "아직 고친 문장이 없어요. 위에서 고칠 문장을 찾아보세요.":
    "No fixed sentences yet. Search above for one to fix.",
  "원래 번역: {en}": "Original translation: {en}",
  "영어 문장": "English sentence",
  "고친 번역 저장": "Save fixed translation",
  "원래 번역으로 되돌렸어요.": "Restored the original translation.",
  "같은 정답에 점수가 또 올라요": "Score rises again on the same answer",
  "다시 시작해도 점수가 남아요": "Score stays after restarting",
  "없는 장면으로 가는 선택지": "Choice goes to a missing scene",
  "갈 수 없는 결말": "Unreachable ending",
  "0초가 돼도 안내가 없어요": "No message at 0 seconds",
  "앞 조건에 가린 조건": "Condition hidden by one above",
  "앞 조건에 가린 바구니": "Basket hidden by one above",
  "없는 바구니 이름": "Basket name that doesn't exist",
  "바구니 순서 때문에 다른 곳으로": "Wrong basket because of order",
  "기준 값에서 다른 곳으로": "Wrong basket at the limit",
  "판 밖으로 넘어가요": "Goes off the board",
  "목표에서 빠진 칸": "Cells missing from the target",
  "목표 밖 칸을 칠해요": "Paints cells outside the target",
  "평가 목록 파일 {n}개의 다운로드를 요청했어요. 다른 기기의 ‘학생 작품 파일 고르기’로 열면 이어서 평가해요.":
    "Requested the download of {n} assessment list files. Open them with ‘Choose student work files’ on another device to continue assessing.",
  "평가 목록 옮기기": "Move assessment list",
  "보호자용 소개 카드 모두 인쇄": "Print all family cards",
  "짝·일지": "Pair · journal",
  "역할 교대 {n}번": "{n} role switches",
  "일지 적음": "journal written",
  "{a} · {b} · 역할 교대 {n}번": "{a} · {b} · {n} role switches",
  "고친 문장 {n}개를 가져왔어요. 넘어간 문장 {m}개.":
    "Imported {n} fixed sentences. Skipped {m}.",
  "영어 번역 고침 파일을 골라 주세요.":
    "Choose an English translation fix file.",
  "고친 문장 파일 가져오기": "Import fixed sentences file",
  "고친 문장 JSON 파일": "Fixed sentences JSON file",
  "학급 과정 평가 요약": "Class process assessment summary",
  "과정 평가 평균 (1 시작 · 2 수행 · 3 설명·적용)":
    "Process assessment averages (1 starting · 2 doing · 3 explaining and applying)",
  "둘 다 평가한 작품": "Works assessed by both",
  "만난 학생 {n}명 · 지금은 고침 {m}명": "{n} students met it · {m} fixed now",
  "작품 {n}개 · 다섯 단계 완료 {m}개":
    "{n} works · {m} with all five steps done",
  "기록을 근거로 교사가 직접 매긴 평가의 요약이에요. 앱은 점수를 자동으로 매기지 않으며, 이 요약에는 학생 이름과 작품 글을 넣지 않았어요.":
    "This summarizes assessments the teacher gave based on the records. The app never scores automatically, and no student names or work text are included.",
  "학기 요약 한 장 인쇄": "Print one-page term summary",
  "걸러 보기": "Filter",
  정렬: "Sort",
  "작품 {n}개 가운데 {m}개를 보고 있어요.": "Showing {m} of {n} works.",
  "오늘 미션을 여는 QR 코드": "QR code that opens today's mission",
  "기기 카메라로 비추면 오늘 미션이 열려요.":
    "Scan with the device camera to open today's mission.",
  "지금 할 일": "Do now",
  "평가표를 저장하지 못했어요. 네 항목의 이름과 세 단계를 모두 적어 주세요.":
    "Couldn't save the rubric. Fill in the name and all three levels for each of the four items.",
  "평가표 고쳐 쓰기 · 지금 이 기기는 고친 평가표를 써요":
    "Edit the rubric · this device is using an edited rubric",
  "평가표 고쳐 쓰기 · 우리 학교 기준에 맞추기":
    "Edit the rubric · fit it to your school",
  "항목 네 개의 이름과 단계 설명을 고칠 수 있어요. 항목 수와 단계 수는 평가 기록과 맞아야 해서 바꾸지 않아요. 고친 평가표는 이 기기의 평가 화면·포트폴리오·CSV에 쓰여요.":
    "You can edit the names and level descriptions of the four items. The number of items and levels stays fixed so it matches the assessment records. The edited rubric is used in this device's assessment screens, portfolio and CSV.",
  "항목 {n}": "Item {n}",
  "항목 {n} 이름": "Item {n} name",
  "항목 {n} · {level}": "Item {n} · {level}",
  "고친 평가표를 이 기기에 저장했어요.":
    "Saved the edited rubric on this device.",
  "평가표 저장": "Save rubric",
  "평가표 파일 내려받기": "Download rubric file",
  "평가표 파일 가져오기": "Import rubric file",
  "기본 평가표로 되돌렸어요.": "Restored the default rubric.",
  "기본 평가표로 되돌리기": "Restore default rubric",
  "평가표 JSON 파일": "Rubric JSON file",
  "평가표 파일을 가져와 저장했어요.": "Imported and saved the rubric file.",
  "평가표 파일을 골라 주세요.": "Choose a rubric file.",
  "한 번 더 도는 반복": "Loop runs one extra time",
  "반복이 끝난 값이 목표와 달라요": "Final loop value differs from the goal",
  "평가 전인 작품": "Works not assessed yet",
  "다섯 단계를 다 기록하지 않은 작품": "Works without all five steps recorded",
  "지금 버그가 남은 작품": "Works with a bug still present",
  "읽은 순서": "Order loaded",
  "파일 이름 순서": "By file name",
  "기록한 단계가 적은 순서": "Fewest recorded steps first",
  "평가 차이 큼": "Big rating gap",
  "평가가 다른 항목": "Items rated differently",
  "두 단계 차이 · 이야기 나눠 보기": "Two levels apart · worth a chat",
  "{name}: 스스로 {a} · 선생님 {b}": "{name}: self {a} · teacher {b}",
  "이 활동 남은 시간 {time}": "Time left for this activity {time}",
  "다음: {next}": "Next: {next}",
  "멈춤 조건에 닿지 못하는 반복": "A loop that never meets its stop condition",
  "목록에 같은 낱말이 두 번": "The same word twice in a list",
  "스스로 평가와 선생님 평가가 다른 작품":
    "Works where self and teacher ratings differ",
};
