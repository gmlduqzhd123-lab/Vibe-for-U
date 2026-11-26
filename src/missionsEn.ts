import type { Mission } from "./model";
// 미션 본문 영어 번역. 설정 화면의 항목 이름은 아직 한국어라 괄호 안에 함께 적는다.
export type MissionText = Pick<
  Mission,
  "title" | "goal" | "prediction" | "tests" | "task" | "hints" | "closing"
>;
export const missionsEn: Record<string, MissionText> = {
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
  "rule-1": {
    title: "If you collect 5",
    goal: "Change the sticker count with buttons and show a celebration message when it reaches 5.",
    prediction:
      "How many times must you press +1 to see the celebration? What shows after 4 presses?",
    tests: [
      {
        label: "When it reaches 5",
        expected: "Pressing +1 five times shows the celebration message.",
      },
      {
        label: "Start over",
        expected:
          "Pressing Start over goes back to 0 stickers and the first message.",
      },
    ],
    task: "Change the message of the condition “if stickers are 5 or more” to fit your class, then check again.",
    hints: [
      "The value the app remembers is the number of stickers.",
      "The condition is “5 or more”, so it also matches at 5.",
      "At 4 no condition matches, so the “otherwise” message shows.",
    ],
    closing:
      "Without an “if …” condition, could the app know when to celebrate?",
  },
  "rule-2": {
    title: "Not below zero",
    goal: "Check that the stickers never go below 0, even if you press −1 many times.",
    prediction: "With 0 stickers, what happens when you press −1?",
    tests: [
      {
        label: "Take away at 0",
        expected: "At 0 stickers, pressing −1 keeps it at 0.",
      },
      {
        label: "Collect again",
        expected: "After taking away, pressing +1 counts up from 1.",
      },
    ],
    task: "Clear the “smallest value” setting, compare what changes, then set it back to 0.",
    hints: [
      "Find the “smallest value” in the settings.",
      "Without a smallest value it can go down to −1, −2 and so on.",
      "You can't have fewer than 0 stickers, so make 0 the smallest value.",
    ],
    closing:
      "Why does a value the app remembers sometimes need a promise like “never go below this”?",
  },
  "rule-3": {
    title: "Huh? The best message never shows!",
    goal: "Find out why “Amazing!” doesn't show at 6 stickers and fix the order of the conditions.",
    prediction: "Which message should show at 6 stickers? What actually shows?",
    tests: [
      {
        label: "When it reaches 6",
        expected: "At 6 stickers the “Amazing!” message shows.",
      },
      {
        label: "When it reaches 3",
        expected: "From 3 to 5 stickers the “Nice” message shows.",
      },
    ],
    task: "Conditions are checked from the top. Change the order so “6 or more” is checked first.",
    hints: [
      "6 matches both “3 or more” and “6 or more”.",
      "The app uses only the first condition that matches, from the top.",
      "Try moving the “6 or more” condition up.",
    ],
    closing:
      "When several conditions match, explain in which order the app checks them.",
  },
  "rule-4": {
    title: "Only when it's exactly right",
    goal: "Show the treasure message only at exactly 10 steps, and compare “equals” with “or more”.",
    prediction: "If +2 takes you from 9 to 11, does the treasure message show?",
    tests: [
      {
        label: "Exactly 10 steps",
        expected: "The treasure message shows only when steps are exactly 10.",
      },
      {
        label: "Going past 10",
        expected:
          "At 11 the “still walking” message shows instead of the treasure.",
      },
    ],
    task: "Change the condition from “equals 10” to “10 or more”, compare the results, then choose one and write why.",
    hints: [
      "“Equals” matches only that exact value.",
      "From 9, pressing +2 jumps over 10.",
      "With “or more” it also matches at 11.",
    ],
    closing:
      "For a treasure-hunt game, which condition fits better, “equals” or “or more”, and why?",
  },
  "sort-1": {
    title: "Sort by number of legs",
    goal: "Put animal cards into the right baskets by their number of legs.",
    prediction:
      "Which basket will the snake card go into? What happens if no basket condition matches?",
    tests: [
      {
        label: "Put all",
        expected:
          "Cat and dog go to four-legged, chicken and sparrow to two-legged, and the snake to other animals.",
      },
      {
        label: "Start over",
        expected:
          "Start over empties the baskets and puts cards again from the first one.",
      },
    ],
    task: "Add a six-legged animal (ant) card and a basket for it, then put the cards again to check.",
    hints: [
      "The app looks only at each card's number of legs to pick a basket.",
      "“Equals 4” matches only when it is exactly 4.",
      "A card that matches no condition goes to the leftover basket.",
    ],
    closing:
      "Without basket conditions, could the app know where to put each card?",
  },
  "sort-2": {
    title: "Exactly 120 cm can ride too",
    goal: "Check where a friend who is exactly at the ride's height limit goes.",
    prediction: "Haneul is exactly 120 cm tall. Which basket will she go into?",
    tests: [
      {
        label: "Exactly the limit",
        expected: "Haneul at 120 cm goes into “Can ride”.",
      },
      {
        label: "One below the limit",
        expected: "Mint at 119 cm goes into “Ride next time”.",
      },
    ],
    task: "Change the condition from “120 or more” to “121 or more”, see who changes, then change it back and write why.",
    hints: [
      "“Or more” includes the value itself.",
      "Always test with one card that is exactly the limit.",
      "With “121 or more”, the 120 card no longer matches.",
    ],
    closing: "How are “or more” and “more than” different at the limit?",
  },
  "sort-3": {
    title: "The “many legs” basket is empty",
    goal: "Fix the basket order so ants and spiders go into “Many legs”.",
    prediction: "Which basket does the ant (6 legs) go into right now?",
    tests: [
      {
        label: "Many legs",
        expected: "The ant and spider go into “Many legs”.",
      },
      {
        label: "Some legs",
        expected: "The chicken and cat still go into “Has legs”.",
      },
    ],
    task: "Change the basket order so the narrow condition is checked first, then put the cards again.",
    hints: [
      "The ant's 6 legs also match “2 or more”.",
      "The app puts a card only into the first basket that matches, from the top.",
      "Move the “6 or more” basket above “2 or more”.",
    ],
    closing:
      "When a broad and a narrow condition are both there, which should be checked first?",
  },
  "sort-4": {
    title: "Medium goes to the leftover basket",
    goal: "Give conditions only for light and heavy things, and send the rest to “Medium”.",
    prediction:
      "Which basket will the 500 g book go into? What about the bottle that is exactly 1000 g?",
    tests: [
      {
        label: "Middle weight",
        expected: "The book matches no condition and goes into “Medium”.",
      },
      {
        label: "Both ends",
        expected:
          "The bottle and watermelon go to heavy, the pencil and eraser to light.",
      },
    ],
    task: "Rename the leftover basket, then change the light limit to 200 g and see who changes.",
    hints: [
      "The leftover basket has no condition. It is used when no basket above matches.",
      "“100 or less” includes 100 g.",
      "After changing a limit, check the cards near it first.",
    ],
    closing: "Why don't you have to write a condition for every case?",
  },
  "sort-5": {
    title: "It needs wings to be a flying insect",
    goal: "Join two features with “and” to pick only insects that have 6 legs and wings too.",
    prediction:
      "The ant has 6 legs but no wings. Which basket will it go into?",
    tests: [
      {
        label: "When both match",
        expected:
          "The butterfly and bee match both conditions and go into “Flying insects”.",
      },
      {
        label: "When only one matches",
        expected:
          "The ant matches only the legs and goes into “Walking insects”.",
      },
    ],
    task: "Change “and” to “or”, see where the sparrow goes, then change it back and write why.",
    hints: [
      "“And” needs both conditions to match.",
      "The ant has 0 wings, so the second condition does not match.",
      "With “or”, wings alone are enough, so the sparrow goes in too.",
    ],
    closing: "Which accepts more cards, “and” or “or”?",
  },
  "sort-6": {
    title: "Indoors if it is hot or dusty",
    goal: "Join two features with “or” so that one match is enough to send the day to indoor PE.",
    prediction:
      "Wednesday is 28 degrees but fine dust is 95. Where will PE be held?",
    tests: [
      {
        label: "One match is enough",
        expected: "Tuesday (hot) and Wednesday (dusty) go into “Indoor PE”.",
      },
      {
        label: "When neither matches",
        expected: "Monday and Friday go into “Playground PE”.",
      },
    ],
    task: "Change “or” to “and”, see who changes, then change it back and write why.",
    hints: [
      "“Or” needs only one of the two conditions to match.",
      "Fine dust 79 does not match “80 or more”.",
      "With “and”, only Thursday, which is both hot and dusty, is left.",
    ],
    closing: "For a safety rule, which fits better, “and” or “or”?",
  },
  "loop-1": {
    title: "A week of saving",
    goal: "Use a loop to find out how much you have after saving 500 won a day for 7 days.",
    prediction:
      "After pressing “Repeat once” 3 times, how much is in the piggy bank? And after 7?",
    tests: [
      {
        label: "Repeat one at a time",
        expected: "It grows by 500 won each press.",
      },
      {
        label: "Repeat to the end",
        expected: "It repeats 7 times and stops at 3500 won.",
      },
    ],
    task: "Change the daily saving to 700 won, fix the goal value to match, then check again.",
    hints: [
      "The value the app remembers is the money in the piggy bank.",
      "Each repeat adds the same amount.",
      "The goal value is “change per repeat × number of repeats”.",
    ],
    closing:
      "How is writing the same thing 7 times different from writing “repeat 7 times”?",
  },
  "loop-2": {
    title: "When there is a starting value",
    goal: "You already read 20 pages. Find the page you reach after reading 15 more pages a day for 4 days.",
    prediction: "After 4 repeats, is it 60 pages or 80 pages?",
    tests: [
      {
        label: "Starting value",
        expected: "It starts at 20 pages before any repeat.",
      },
      {
        label: "Final value",
        expected: "After 4 repeats it is 80 pages.",
      },
    ],
    task: "Change the starting value to 0 and see how the final value changes, then set it back to 20 and write why.",
    hints: [
      "A loop starts from the starting value.",
      "15 pages 4 times adds 60 pages.",
      "The final value is the starting value plus what was added.",
    ],
    closing:
      "Which three things do you need to know to work out the final value in advance?",
  },
  "loop-3": {
    title: "Huh? It jumped one more time!",
    goal: "It should do 5 sets of 10 jumps, but it ends at 60. Find out why and fix it.",
    prediction: "How many jumps will there be after “Repeat to the end”?",
    tests: [
      {
        label: "Number of repeats",
        expected: "It does only 5 sets and stops.",
      },
      {
        label: "Final value",
        expected: "It ends at 50 jumps.",
      },
    ],
    task: "Fix “How repeats are counted” so it stops at 5 sets, then check again.",
    hints: [
      "Count how many dots are lit.",
      "The app should count the repeats and stop when it reaches the set number.",
      "In the settings, change how repeats are counted to “exactly the set number”.",
    ],
    closing: "Why is it easy to make a loop run one time too many or too few?",
  },
  "loop-4": {
    title: "A loop that counts down",
    goal: "Share 20 candies with 6 friends, 3 each, and find out how many are left.",
    prediction: "How many candies are left after 6 repeats?",
    tests: [
      {
        label: "Decreasing value",
        expected: "It goes down by 3 each press.",
      },
      {
        label: "Final value",
        expected: "After 6 repeats, 2 are left.",
      },
    ],
    task: "Change it to 7 friends and see what happens, then fix the numbers so the candies don't run out.",
    hints: [
      "The change per repeat is −3.",
      "3 each for 6 friends takes away 18.",
      "7 friends need 21, so the value goes below 0.",
    ],
    closing: "When a value must not go below 0, what should the app check?",
  },
  "loop-5": {
    title: "Stop when you reach the goal",
    goal: "Save 700 won a week, and make the loop stop once you have 3000 won or more.",
    prediction:
      "After “Repeat to the end”, in which week and at how much will it stop?",
    tests: [
      {
        label: "Stop condition",
        expected:
          "It stops at 3000 won or more, even if repeats are left over.",
      },
      {
        label: "Value when it stops",
        expected: "It stops in week 5 at 3500 won.",
      },
    ],
    task: "Change the stop condition value to 5000, work out where it stops, and fix the goal value to match.",
    hints: [
      "Before each repeat, the app first checks whether the value meets the condition.",
      "2800 won is not “3000 or more”, so it repeats once more.",
      "The number of repeats, 10, is the most it will ever do.",
    ],
    closing:
      "When is “repeat 7 times” better, and when is “repeat until 3000 won” better?",
  },
  "loop-6": {
    title: "Huh? It won't stop!",
    goal: "It should stop when the bottle has 1000 mL, but it pours to the very end. Find out why and fix it.",
    prediction:
      "Pouring 300 mL a cup, is there ever a moment with exactly 1000 mL?",
    tests: [
      {
        label: "Stop condition",
        expected: "It stops at 1000 mL or more.",
      },
      {
        label: "Value when it stops",
        expected: "It stops at cup 4 with 1200 mL.",
      },
    ],
    task: "Change the stop condition to “or more” so it stops before the water spills, then check again.",
    hints: [
      "The value goes 300, 600, 900, 1200.",
      "It is never exactly 1000, so the “equals” condition never matches.",
      "In the settings, change how it stops to “stop when the value is at least”.",
    ],
    closing: "Why can “equals” be risky as a stop condition?",
  },
  "list-1": {
    title: "A picnic packing list",
    goal: "Add the things to take on a picnic one by one to make a list.",
    prediction:
      "If you add “water” first and then “lunch box”, what is in place 1?",
    tests: [
      {
        label: "Order of adding",
        expected: "Items go to the end of the list in the order you press.",
      },
      {
        label: "Number of items",
        expected: "The count goes up by 1 each time you add.",
      },
    ],
    task: "Change the words to things you would pack, add one more word, then check again.",
    hints: [
      "A list remembers the order you added things.",
      "A new word always goes to the end.",
      "In the settings, edit the words and press “+ Add word”.",
    ],
    closing: "Why is it handy that a list remembers order?",
  },
  "list-2": {
    title: "Full means stop",
    goal: "Put things in a small bag that holds only three, and see what happens when it is full.",
    prediction:
      "After adding three things, what happens when you press a fourth?",
    tests: [
      {
        label: "When it is full",
        expected: "The fourth thing does not go in and a message appears.",
      },
      {
        label: "Take out, then add",
        expected: "After taking one out, you can add another thing.",
      },
    ],
    task: "Change the most items to 4, rewrite the full message kindly, then check again.",
    hints: [
      "Before adding, the app counts the items in the list.",
      "If the count equals the most items, it does not add.",
      "“Take one out” removes the thing at the end.",
    ],
    closing:
      "What would happen if the app did not check the count before adding?",
  },
  "list-3": {
    title: "Huh? The same name twice!",
    goal: "Find out why the same name gets on the attendance list twice, and fix it.",
    prediction: "If you press “Haneul” twice, how many people are on the list?",
    tests: [
      {
        label: "Adding the same name again",
        expected: "The same name goes in only once.",
      },
      {
        label: "Adding a different name",
        expected: "A different name goes to the end.",
      },
    ],
    task: "Fix “When the same word is added again” so a name goes in only once, then check again.",
    hints: [
      "Press “Haneul” twice and count the items.",
      "Before adding, the app should check whether it is already in the list.",
      "In the settings, change “When the same word is added again” to “Don't add”.",
    ],
    closing: "Which lists must never hold the same thing twice?",
  },
  "list-4": {
    title: "First come, first served",
    goal: "Make a list where the first thing added comes out first, like a lunch line.",
    prediction:
      "Add the Haneul, Bada and Namu groups in order, then press “Take one out”. Who comes out?",
    tests: [
      {
        label: "Taking out the first one",
        expected: "The group at the front comes out first.",
      },
      {
        label: "Moving up",
        expected: "When one comes out, the groups behind move forward.",
      },
    ],
    task: "Change where “Take one out” removes from to the end and see what changes, then set it back to suit a lunch line.",
    hints: [
      "In a line, the person who came first leaves first.",
      "When the front one leaves, number 2 becomes number 1.",
      "A stack of plates is a list you take from the end (the top).",
    ],
    closing:
      "Where would you use a list that takes from the front, and one that takes from the end?",
  },
  "loop-7": {
    title: "An “if” inside a loop",
    goal: "Make a loop that gives 1 sticker a day, plus 3 bonus stickers on every 5th day.",
    prediction:
      "In 10 days, how many times do you get the bonus? How many stickers in all?",
    tests: [
      { label: "Bonus days", expected: "Only day 5 and day 10 give 3 more." },
      {
        label: "Final value",
        expected: "After 10 days there are 16 stickers.",
      },
    ],
    task: "Change the bonus to every 3rd time, work out the final value, and fix the goal value to match.",
    hints: [
      "On each repeat, the app checks which repeat number it is.",
      "The multiples of 5 are 5 and 10, so twice.",
      "The final value is 10 daily stickers plus 6 bonus stickers.",
    ],
    closing: "What can you do by putting an “if” inside a loop?",
  },
  "list-5": {
    title: "Add them all with a loop",
    goal: "Instead of pressing each word, use a loop to add them in order and make a speaking order.",
    prediction:
      "If you press “Add all in order”, how many of the six people get on the list?",
    tests: [
      {
        label: "Adding with a loop",
        expected: "The first four go in, in order.",
      },
      {
        label: "When it is full",
        expected: "From the fifth on, nothing goes in and a message appears.",
      },
    ],
    task: "Change the most items to 6 so everyone fits, then press “Take one out” twice and check who is left.",
    hints: [
      "“Add all in order” repeats “add” for every word.",
      "Before each add, it first checks whether the list is full.",
      "The most items is 4, so it stops at four people.",
    ],
    closing:
      "How is pressing the same thing many times different from leaving it to a loop?",
  },
};
