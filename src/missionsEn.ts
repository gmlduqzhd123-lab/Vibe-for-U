import type { Mission } from "./model";
import type { Lang } from "./i18n";
// 미션 본문 영어 번역. 설정 화면의 항목 이름은 아직 한국어라 괄호 안에 함께 적는다.
type Text = Pick<
  Mission,
  "title" | "goal" | "prediction" | "tests" | "task" | "hints" | "closing"
>;
export const missionsEn: Record<string, Text> = {
  "quiz-1": {
    title: "When a choice meets the answer",
    goal: "Make a quiz that shows the right message for the answer you pick.",
    prediction:
      "What message will appear when you press the right answer, and when you press a wrong one?",
    tests: [
      {
        label: "Pick the right answer",
        expected: "The correct message and 1 point appear.",
      },
      {
        label: "Pick a wrong answer",
        expected:
          "The wrong-answer message appears and the score stays the same.",
      },
    ],
    task: "Rewrite the right and wrong answer messages so a friend can easily understand them.",
    hints: [
      "Pick one answer in the first question.",
      "Compare the number of the right answer with the number you picked.",
      "In the settings, change the correct message (정답 안내) and the wrong message (오답 안내).",
    ],
    closing: "Which condition did your choice meet?",
  },
  "quiz-2": {
    title: "Points add up to a result",
    goal: "Collect the points of each question and show the final result.",
    prediction:
      "If you get both questions right, how many points will you have?",
    tests: [
      {
        label: "Adding up points",
        expected: "Correct answers × points per question are shown.",
      },
      {
        label: "Last question",
        expected: "After the last question, the final result appears.",
      },
    ],
    task: "Change points per question to 2 and predict the final score for the two questions.",
    hints: [
      "Find the current score and the question number.",
      "The score must not be erased when you go to the next question.",
      "Check: 2 questions × 2 points = 4 points in total.",
    ],
    closing:
      "Why does the app remember the question number and the score separately?",
  },
  "quiz-3": {
    title: "Huh? The score keeps going up!",
    goal: "Find and fix the extra points you get by pressing the right answer many times.",
    prediction:
      "If you press the same right answer three times, how many points will you get? How many should you get?",
    tests: [
      {
        label: "Press the same right answer three times",
        expected: "Each question gives its points only once.",
      },
      {
        label: "Test again after fixing",
        expected: "Pressing the right answer three times still gives 1 point.",
      },
    ],
    task: "Change the scoring rule (채점 규칙) to once per question (문제당 한 번) and run the same test again.",
    hints: [
      "Press the right answer of the first question several times.",
      "The app can remember whether you already answered.",
      "Change the scoring rule (채점 규칙) to once per question (문제당 한 번) and run it again.",
    ],
    closing: "Which value must the app remember to stop extra points?",
  },
  "quiz-4": {
    title: "A clean restart",
    goal: "Reset the score and the question number together.",
    prediction:
      "After solving two questions and restarting, which values should change?",
    tests: [
      {
        label: "Restart",
        expected: "Score 0, question 1, and no answer chosen yet.",
      },
    ],
    task: "Turn on resetting the score when restarting, then check the starting state.",
    hints: [
      "Solve the questions and press restart.",
      "Compare three values: score, question number and whether you answered.",
      "Turn on “reset the score when restarting” (다시 시작할 때 점수 초기화) in the settings.",
    ],
    closing: "Is it enough if only the screen goes back to the start?",
  },
  "story-1": {
    title: "My choice makes the path",
    goal: "Understand how a choice connects to the next scene.",
    prediction: "If you choose the way to the tree, which scene will appear?",
    tests: [
      {
        label: "First choice",
        expected: "Choosing the tree goes to the tree library.",
      },
      { label: "Back to start", expected: "You return to the first scene." },
    ],
    task: "Rename a choice and check that it still matches the scene it leads to.",
    hints: [
      "Press the first choice and read the next scene.",
      "Each choice has the name tag of the next scene.",
      "In the scene settings, compare each choice with its destination scene.",
    ],
    closing: "If you only rename a choice, does its destination change too?",
  },
  "story-2": {
    title: "Two paths, two endings",
    goal: "Make different endings with different choices.",
    prediction: "Can you reach a new ending on the second path too?",
    tests: [
      {
        label: "Reach the endings",
        expected: "Both the tree library and the sunny garden can be reached.",
      },
    ],
    task: "Rewrite each ending and walk both paths.",
    hints: [
      "After seeing the first ending, go back to the start.",
      "Try the second path as well.",
      "Compare the titles and texts of the two endings.",
    ],
    closing:
      "How is adding an ending different from making a path that reaches it?",
  },
  "story-3": {
    title: "I think we took a wrong turn",
    goal: "Find and fix a path that is connected differently from what you meant.",
    prediction:
      "If choosing the sunny way shows the tree library, which connection would you change?",
    tests: [
      {
        label: "Check the path",
        expected: "Choosing the sunny way goes to the sunny garden.",
      },
      {
        label: "Check blocked endings",
        expected: "Every intended ending can be reached.",
      },
    ],
    task: "Fix the sunny choice so it leads to the sunny garden.",
    hints: [
      "Try each of the two choices.",
      "Look at the destination scene setting, not the choice text.",
      "Change the destination of the second choice (도착 장면 2) to the sunny garden.",
    ],
    closing: "Why couldn't you reach a scene that existed?",
  },
  "story-4": {
    title: "A better story from a friend's words",
    goal: "Listen to what a friend noticed and improve confusing guidance.",
    prediction: "Can your friend read a choice and predict the next scene?",
    tests: [
      {
        label: "Friend's feedback",
        expected:
          "Your friend tries it and writes down what was clear and what was confusing.",
      },
    ],
    task: "Write your friend's feedback on a check card and improve one choice or description.",
    hints: [
      "Decide who is the driver and who is the observer.",
      "Before your friend chooses, ask what the next scene will be.",
      "Write what you observed and what you want to fix separately.",
    ],
    closing: "Which feedback did you use, and why?",
  },
  "timer-1": {
    title: "Time starts to count down",
    goal: "Find out how pressing start relates to the time left.",
    prediction: "If you press start many times, will the time go down faster?",
    tests: [
      {
        label: "Start many times",
        expected: "Even if you press start many times, only one timer runs.",
      },
    ],
    task: "Change the time to 10 seconds and observe the values before and after starting.",
    hints: [
      "Write down the starting time left.",
      "Press the start button several times in a row.",
      "Time left is the difference between the start time and now.",
    ],
    closing: "After which actions does the time left change?",
  },
  "timer-2": {
    title: "Pause for a moment, then go on",
    goal: "Keep the time left when you pause and resume.",
    prediction:
      "If you pause, wait, and then resume, from what time will it count down?",
    tests: [
      {
        label: "Pause",
        expected: "The time left stays the same while paused.",
      },
      {
        label: "Resume",
        expected: "It counts down again from where it stopped.",
      },
    ],
    task: "Take turns with a friend to start, pause and resume, and record the time left.",
    hints: [
      "Start, then press pause.",
      "Write down the paused time and wait a little.",
      "After resuming, check that the number doesn't jump back to the start.",
    ],
    closing: "What is the difference between pause and reset?",
  },
  "timer-3": {
    title: "Tell me when it hits zero",
    goal: "Test and fix the end condition and the end message.",
    prediction: "What message should appear when the timer reaches 0 seconds?",
    tests: [
      {
        label: "End message",
        expected: "The message appears once at 0 seconds.",
      },
      {
        label: "Lowest time",
        expected: "The time left never goes below 0.",
      },
    ],
    task: "Turn on the end message, set the time to 2 seconds, and check what happens at the end.",
    hints: [
      "With 2 seconds you can check it quickly.",
      "If it's quiet at 0 seconds, look at the end message setting.",
      "Turn on the end message (종료 안내 표시), reset and run it again.",
    ],
    closing: "How are the end condition and the end message connected?",
  },
  "timer-4": {
    title: "Start again, as many times as you like",
    goal: "Check that the same rules apply after resetting and using it again.",
    prediction:
      "If you reset while it's running, what happens to the time left and the running state?",
    tests: [
      { label: "Reset", expected: "It goes back to the set time and stops." },
      {
        label: "Run again",
        expected: "The end message still appears only once per run.",
      },
    ],
    task: "Compare before and after reset, then visit another screen and check it is stopped when you come back.",
    hints: [
      "Start, then press reset.",
      "Check that it went back to the set time.",
      "Go to another screen and come back: it starts stopped.",
    ],
    closing:
      "When you save your record, should a running clock keep running too?",
  },
  "pattern-1": {
    title: "Commands move in order",
    goal: "Paint squares in the order of the commands to draw a shape.",
    prediction:
      "With the commands right 3 and down 3, what shape will you get?",
    tests: [
      {
        label: "Command order",
        expected:
          "It paints 3 squares right, then 3 squares down, making an L shape.",
      },
      {
        label: "Back to start",
        expected: "It starts again from the first square of an empty board.",
      },
    ],
    task: "Predict how the shape changes if you swap the two commands, then run it.",
    hints: [
      "Use “draw one step” to see where the first command ends.",
      "Commands run in order from the top.",
      "Swap the directions of command 1 and command 2.",
    ],
    closing:
      "Why do the same commands make a different shape in a different order?",
  },
  "pattern-2": {
    title: "Repeat it and you get stairs",
    goal: "Repeat a group of commands to keep drawing the same pattern.",
    prediction:
      "If you repeat right 1 and down 1 three times, how many squares will be painted?",
    tests: [
      {
        label: "Number of repeats",
        expected: "The command group runs 3 times and makes stairs.",
      },
      {
        label: "Painted squares",
        expected: "7 squares are painted, including the first one.",
      },
    ],
    task: "Before changing the repeat to 4, predict how many squares will be painted, and add one more stair to the target shape.",
    hints: [
      "Count how many squares one repeat paints.",
      "The first square is painted from the start.",
      "Painted squares = 1 + repeats × 2.",
    ],
    closing:
      "How is writing the same command many times different from using repeat?",
  },
  "pattern-3": {
    title: "Huh? The drawing comes out on the other side!",
    goal: "Find and fix moves that jump from one edge of the board to the other.",
    prediction:
      "What happens if commands are left after the stairs reach the edge of the board?",
    tests: [
      {
        label: "Check the edge",
        expected: "It stops at the edge and doesn't paint the other side.",
      },
      {
        label: "Test again after fixing",
        expected: "It matches the 9-square target stairs.",
      },
    ],
    task: "Change the edge rule (판 가장자리 규칙) to stop at the edge (가장자리에서 멈추기) and test the same drawing again.",
    hints: [
      "Use “draw one step” and watch the end of the stairs.",
      "Check where the move after (4,4) goes.",
      "Change the board edge rule (판 가장자리 규칙) to stop (멈추기).",
    ],
    closing:
      "What should the app check at the moment a move would leave the board?",
  },
  "pattern-4": {
    title: "Follow step by step to finish the square",
    goal: "Run one step at a time, record the position and find the missing command.",
    prediction:
      "Will three commands close the square? Where will the last position be?",
    tests: [
      {
        label: "Position at each step",
        expected: "You can record where each command ends.",
      },
      {
        label: "Square complete",
        expected: "All 12 squares around a 4×4 square are painted.",
      },
    ],
    task: "Record the positions with “draw one step”, then add the missing command to finish the square.",
    hints: [
      "Write down the current position each time a command ends.",
      "How many squares are left from the last position to the first square?",
      "Try adding a command that goes up 2 squares.",
    ],
    closing: "What can you find more easily when you run one step at a time?",
  },
  "pattern-5": {
    title: "Turn when blocked to draw the border",
    goal: "Draw the border with just one command and the condition “if blocked, turn right”.",
    prediction:
      "Can one command, right 15, paint the whole border of the board?",
    tests: [
      {
        label: "Run without the condition",
        expected:
          "It gets blocked at the edge and paints only the 5 squares of the top row.",
      },
      {
        label: "Test again with the condition",
        expected:
          "It turns right each time it is blocked and paints all 16 border squares.",
      },
    ],
    task: "Change the condition rule (조건 규칙) to turn right and keep going (오른쪽으로 돌아서 계속 가기), then draw again with the same command.",
    hints: [
      "Without the condition, count where it stops.",
      "The edge of the board is a “blocked square”. You can decide what to do when blocked.",
      "Change the condition rule (조건 규칙) to turn right and keep going (오른쪽으로 돌아서 계속 가기).",
    ],
    closing:
      "Without an “if … then …” condition, how many commands would you need to draw the same border?",
  },
};
// 화면 언어에 맞춘 미션. 번역이 없으면 원래 미션을 그대로 쓴다.
export function localizeMission(m: Mission, lang: Lang): Mission {
  const en = lang === "en" ? missionsEn[m.id] : undefined;
  if (!en) return m;
  return {
    ...m,
    ...en,
    guide: `Predict first, then run it. ${en.task}`,
    completion: `Record a prediction → check ${en.tests.map((t) => t.label).join(", ")} yourself → explain the fix and how it works`,
  };
}
