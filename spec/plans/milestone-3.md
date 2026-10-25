# Milestone 3 — מענה, משוב וניקוד (לולאת המשחק המלאה)

תוכנית בנייה ל־Milestone 3 לפי `MILESTONES.md`. מבוססת על `PRD.md`, `DESIGN.md` (סעיפים 1.3–1.5, 1.9, 2.3), `ARCHITECTURE.md` (סעיפים 3.3, 4.1, 8, ADR-4) ועל הקוד הקיים.

## החלטות שהתקבלו בתכנון

- **התווית `+1 נקודה`** במסך תשובה נכונה — **נכללת** (אישור בעל המוצר, 25.10.2026). תווית קטנה עם כוכב מלא, `+1` מבודד כ־LTR (`<bdi dir="ltr">` או `unicode-bidi: isolate`) כדי שלא יוצג כ־`1+` (DESIGN 2.5).
- **מצב המשחק עובר במלואו ל־`GameProvider`** (הרחבה של ADR-4). התוצאה של הבקשה האחרונה (שאלה / שגיאה), הבחירה והמשוב נשמרים ב־Context, לא ב־state מקומי של מסך השאלות. כך לשונית `שאלות` תמיד מציגה את המצב האחרון, גם אם Next.js פרק את המסך.
- **לוגיקת המשחק כפונקציות טהורות** (בלי React) בקובץ נפרד, כדי שאפשר יהיה לבדוק אותה ב־Unit Tests בסביבת node הקיימת.
- **UI Tests** דורשים סביבת דפדפן מדומה: מוסיפים devDependencies `@testing-library/react`, `@testing-library/user-event` ו־`jsdom`. בדיקות UI בקובצי `*.test.tsx` רצים ב־jsdom; שאר הבדיקות נשארות ב־node. יתועד כ־ADR-5.
- **אין שינוי ב־API** (`/api/trivia`) — הוא כבר מקבל `recentQuestions` (עד 10). אין שינוי במסמכי PRD/DESIGN/ARCHITECTURE מלבד הוספת ADR.

## מבנה מצב המשחק (Game State)

ב־`src/lib/game/gameState.ts` (חדש, טהור, בלי React):

```ts
type View =
  | { kind: "idle" }                       // still loading / nothing yet
  | { kind: "question"; question: TriviaQuestion; selected: number | null; phase: "choosing" | "reveal" | "feedback" }
  | { kind: "error" };

type GameData = {
  started: boolean;          // true after the first "התחילו" / first question request
  currentTopic: string;
  requestKey: number;        // increases on every new request (start / next / retry)
  view: View;                // result of the current request
  score: number;
  recentQuestions: string[]; // max 10, newest last
};
```

פונקציות (כל אחת מחזירה אובייקט חדש):
- `startGame(state, topic)` — נושא חדש, `started=true`, `requestKey+1`, `view=idle`. הניקוד וה־`recentQuestions` נשמרים.
- `nextQuestion(state)` — אותו נושא, `requestKey+1`, `view=idle`.
- `retry(state)` — כמו `nextQuestion` (אותה בקשה בדיוק, ADR-4).
- `receiveQuestion(state, key, question)` — מתעלם אם `key` אינו הבקשה הנוכחית. אחרת `view=question/choosing` ומוסיף את טקסט השאלה ל־`recentQuestions` (חותך ל־10 האחרונות).
- `receiveError(state, key)` — מתעלם אם `key` ישן; אחרת `view=error`.
- `selectAnswer(state, index)` — **רק אם** `phase === "choosing"`: שומר `selected`, עובר ל־`reveal`, ומעלה את `score` ב־1 אם `index === correctOptionIndex`. כל קריאה נוספת מחזירה את אותו state (בחירה ראשונה בלבד, ניקוד פעם אחת לכל היותר).
- `showFeedback(state)` — `reveal` → `feedback`.
- `addRecentQuestion(list, q)` ו־`isCorrect(view)` — עזרים.

השדות `answered` ו־`feedback` מ־ARCHITECTURE 3.3 נגזרים מ־`selected !== null` ומ־`isCorrect`.

## קבצים ליצור / לשנות

### חדשים
| קובץ | תוכן |
|---|---|
| `src/lib/game/gameState.ts` | הטיפוסים והפונקציות הטהורות לעיל |
| `src/lib/game/gameState.test.ts` | Unit Tests: חישוב ניקוד, בחירה ראשונה בלבד, התעלמות מתוצאות ישנות, חיתוך `recentQuestions` ל־10, שמירת ניקוד בהחלפת נושא |
| `src/app/questions/FeedbackView.tsx` + `.module.css` | מסכי תשובה נכונה / שגויה (DESIGN 1.4–1.5) |
| `src/components/ScoreChip.tsx` | `Chip` בגוון sunny עם `StarFilledIcon` והטקסט `ניקוד: N` (המספר מבודד LTR) |
| `src/app/questions/QuestionsScreen.test.tsx` | UI Tests (ראו למטה) |
| `vitest.setup.ts` (אם צריך) | ניקוי DOM בין בדיקות |

### שינויים
| קובץ | שינוי |
|---|---|
| `src/components/GameProvider.tsx` | מחזיק `GameData` ב־`useState`/`useReducer` ומספק פעולות: `startGame`, `nextQuestion`, `retry`, `receiveQuestion`, `receiveError`, `selectAnswer`, `showFeedback`. בזיכרון בלבד. |
| `src/app/questions/QuestionsScreen.tsx` | קורא את `view` מה־Context במקום state מקומי. **שליפת שאלה:** אם `view.kind === "idle"` שולח `fetchQuestion({ topic, recentQuestions })` עם `requestKey` (נשמר מנגנון ה־`setTimeout(0)` + `AbortController` מ־ADR-4). אם עדיין לא התחילו לשחק (`started=false`) — קורא ל־`startGame("")` כדי ליצור שאלה כללית. **טיימר הסימון:** כש־`phase === "reveal"` — `setTimeout(showFeedback, 1000)`, עם ניקוי ביציאה. אם חוזרים למסך כשה־phase עדיין `reveal`, הטיימר פשוט מתחיל מחדש. מציג `LoadingView` / `QuestionView` / `FeedbackView` / `ErrorView` לפי המצב. |
| `src/app/questions/QuestionView.tsx` | מקבל `selected` ו־`onSelect`. Score chip מעל כרטיס השאלה (צד שמאל). כל אפשרות מקבלת class לפי מצב: Default / Correct (✓) / Wrong (✕) / Locked (שקיפות 45%), לפי טבלת DESIGN 1.3. אחרי בחירה כל הכפתורים `disabled` + `aria-disabled`; גם `onSelect` עצמו מוגן ב־`selectAnswer`. מצב Selected (לבן + מסגרת Grape) לא נדרש, כי מעבר הבחירה ישר לסימון Correct/Wrong. |
| `src/app/questions/QuestionView.module.css` | סגנונות מצבי Correct / Wrong / Locked ואייקוני ✓/✕ |
| `src/app/questions/ErrorView.tsx` | ללא שינוי בתצוגה; `onRetry` מחובר ל־`retry` של ה־Context |
| `src/components/TopBar.tsx` | prop אופציונלי `backHref`: אם קיים, כפתור החזרה עושה `router.push(backHref)` במקום `router.back()` |
| `src/app/questions/page.tsx` | ה־TopBar עובר לתוך `QuestionsScreen` (או מקבל `backHref="/"` כשמוצג משוב), כי כפתור החזרה במסכי המשוב מחזיר לבית (DESIGN 1.4) |
| `src/components/icons.tsx` | אייקונים `CheckIcon` (✓) ו־`CloseIcon` (✕) בסגנון ה־Style Guide (stroke 1.9, קצוות מעוגלים), לשימוש באפשרויות, בעיגולי הסטטוס ובתיבת התשובה הנכונה |
| `src/app/page.tsx` | ללא שינוי לוגי — `startGame(topic)` כבר קיים; ידאג רק שהניקוד נשמר (מובטח מ־`gameState`) |
| `vitest.config.mts` | `include` מורחב ל־`src/**/*.test.{ts,tsx}`; `environmentMatchGlobs`/`// @vitest-environment jsdom` לקובצי UI |
| `package.json` | devDependencies לבדיקות UI |
| `spec/ARCHITECTURE.md` | ADR-5 (בדיקות UI ב־jsdom + Testing Library), ועדכון קצר ל־ADR-4 שמצב המשחק המלא עבר ל־Context |
| `spec/MILESTONES.md` | 🟡 ליד Milestone 3 בסיום הבנייה |

## מסכי המשוב (FeedbackView)

משותף לשני המצבים, לפי DESIGN 1.4–1.5 ו־mockups.png:
1. Score chip (`ניקוד: N`, כבר מעודכן).
2. Feedback card:
   - **נכון:** רקע Mint Soft, מסגרת ירוקה בהירה, `StatusCircle variant="mint"` עם ✓, `כל הכבוד!` (H1, ירוק כהה), `התשובה נכונה` (Muted), ותווית `+1 נקודה` עם כוכב (רקע לבן, מסגרת Mint, Micro).
   - **שגוי:** רקע ורוד בהיר (Coral Soft), מסגרת ורודה, `StatusCircle variant="coral"` עם ✕, `לא נכון` (H1, אדום), `התשובה הנכונה היא:`, ותיבה לבנה עם מסגרת 2px Mint, טקסט ירוק ואייקון ✓ ובה טקסט התשובה הנכונה.
3. כפתור ראשי `שאלה הבאה` → `nextQuestion()` (מעבר דרך מסך הטעינה).
4. כפתור משני `החליפו נושא` עם אייקון home → `router.push("/")`.
5. כפתור החזרה ב־Top bar → `/` (כמו `החליפו נושא`).

הודעות המשוב עטופות ב־`role="status"` / `aria-live="polite"` כדי שקוראי מסך יכריזו עליהן.

## התנהגות הלשונית `שאלות`

- `started=false` (עוד לא לחצו `התחילו` ולא קיבלו שאלה) → `startGame("")` → שאלה כללית.
- `started=true` → מוצג ה־`view` האחרון כמו שהוא: טעינה, שאלה (כולל הבחירה אם נבחרה), משוב או שגיאה. אין בקשה חדשה.
- טעינה מחדש של הדף → ה־Provider נוצר מחדש: ניקוד 0, `recentQuestions` ריק, `started=false`.

## החלפת נושא

`החליפו נושא` / כפתור החזרה במשוב → מסך הבית. שם הילד מקליד נושא חדש ו־`התחילו` קורא ל־`startGame(topic)`: נושא חדש, ניקוד ו־`recentQuestions` נשמרים. (תיבת הנושא בבית שומרת את מה שהוקלד קודם — זו ההתנהגות הקיימת; ריקון התיבה נדרש רק במסך "נושא לא מתאים" של Milestone 4.)

## בדיקות

### Unit Tests — `gameState.test.ts`
- תשובה נכונה → `score+1`; תשובה שגויה → `score` לא משתנה.
- קריאה שנייה ל־`selectAnswer` (אותה אפשרות או אחרת) → ה־state לא משתנה, הניקוד לא עולה שוב.
- `selectAnswer` במצב `idle` / `error` / `feedback` → אין שינוי.
- `receiveQuestion` עם `key` ישן → מתעלם.
- `recentQuestions` נחתך ל־10 האחרונות ונשלח בבקשה הבאה.
- `startGame` לנושא חדש שומר ניקוד.

### UI Tests — `QuestionsScreen.test.tsx` (jsdom, `fetchQuestion` ו־`next/navigation` ב־mock, טיימרים מדומים)
- לחיצה על אפשרות → כל האפשרויות נעולות; לחיצות נוספות לא משנות את הבחירה.
- סימון Correct/Wrong מוצג, ואחרי ~1 שנייה מוצג מסך המשוב.
- תשובה נכונה → `כל הכבוד!`, `+1 נקודה`, `ניקוד: 1`.
- תשובה שגויה → `לא נכון` ותיבה עם טקסט התשובה הנכונה, `ניקוד: 0`.
- `שאלה הבאה` → בקשה חדשה עם אותו נושא ועם השאלה הקודמת ב־`recentQuestions`.

### בדיקות ידניות (בדפדפן, בסיום הבנייה)
- לולאה מלאה: נושא → שאלה → תשובה → משוב → `שאלה הבאה` כמה פעמים; לוודא שהשאלות לא חוזרות.
- לחיצות מהירות על כמה אפשרויות.
- `החליפו נושא` וכפתור החזרה → בית; נושא חדש; הניקוד נשמר.
- לשונית `שאלות` מהבית/אודות: לפני התחלה (שאלה כללית) ואחרי (חוזר למצב האחרון, כולל באמצע הסימון).
- רענון הדף מאפס ניקוד; ב־DevTools → Application אין Local Storage / Cookies של המשחק.
- רוחב 360–430px, RTL, `+1` ו־`ניקוד: N` מוצגים נכון.
- `npm test`, `npm run lint`, `npm run build` עוברים.

## מחוץ לטווח של Milestone זה
- מסך "נושא לא מתאים", Moderation ו־`422` — Milestone 4.
- PWA, Rate Limiting ו־Production — Milestone 5.
