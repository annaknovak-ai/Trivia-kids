# תוכנית — Milestone 2: יצירת שאלה והצגתה (מקצה לקצה)

מבוסס על: `MILESTONES.md` (Milestone 2), `PRD.md`, `ARCHITECTURE.md` (סעיפים 2.3, 3.2, 4, 5), `DESIGN.md` (סעיפים 1.2, 1.3, 1.6, 2), `mockups.png`, והקוד הקיים מ־Milestone 1.

## 1. מטרה

לחיצה על `התחילו` (עם נושא או בלי) מובילה למסך טעינה, ומשם למסך שאלה עם שאלת טריוויה אמיתית בעברית וארבע אפשרויות שנוצרו ב־OpenAI דרך ה־Backend. כל כשל מוביל למסך שגיאה ידידותי עם `נסו שוב` ו־`חזרה לבית`.

**לא בטווח של Milestone זה:** בחירת תשובה, משוב, ניקוד ו־Score chip (Milestone 3); שליחה בפועל של `recentQuestions` מהלקוח (Milestone 3 — ה־API כבר יקבל את השדה); התנהגות מיוחדת של הלשונית `שאלות` (Milestone 3); Moderation, תגובת `422` ומסך "נושא לא מתאים" (Milestone 4); Rate Limiting ו־PWA (Milestone 5).

## 2. שלבים שהמשתמש מבצע (בהדרכה צעד אחר צעד, בתחילת הבנייה)

הבנייה **נעצרת** בנקודות האלה ומחכה למשתמש. אין קריאה ל־OpenAI לפני שלבים 1–3.

1. **אישור המודל.** המלצה (נבדקה בתיעוד OpenAI ב־25.10.2026):
   - **`gpt-6-luna`** — המודל הזול והמהיר ביותר ברשימת המודלים המומלצים של OpenAI ($0.10 / $0.50 למיליון טוקנים קלט/פלט), תומך ב־Structured Outputs, ומאפשר `reasoning effort = none` לתגובה מהירה. שאלה אחת עולה בערך שבריר של סנט.
   - חלופות: `gpt-6.1-sol` (איכותי יותר, פי 20 יקר), `gpt-6-astra` (היקר ביותר). `gpt-5` מסומן Deprecated (ARCHITECTURE 1.3).
   - בבנייה: להציג את ההמלצה, לקבל אישור מפורש, ורק אז להגדיר. **אין להחליף מודל בשקט.**
2. **מפתח OpenAI לפיתוח:** הדרכה ליצירת Project ו־API key ייעודי לפיתוח ב־platform.openai.com.
3. **תקרת הוצאה:** הדרכה להגדרת תקרה קשיחה והתראות לפני הקריאה הראשונה. ההגנה הקשיחה ביותר: טעינת קרדיט מראש בסכום קטן (למשל $5) עם **Auto-recharge כבוי**, ובנוסף Budget והתראת מייל ל־Project. (בזמן ההדרכה לבדוק במסך ההגדרות העדכני של OpenAI מה בדיוק זמין.) המשתמש מאשר שביצע.
4. **משתני סביבה:** Claude יוצר `.env.example` עם `OPENAI_API_KEY=` ו־`OPENAI_MODEL=` (ללא ערכים), ומעתיק אותו פעם אחת ל־`.env`. המשתמש ממלא את הערכים ב־`.env`. Claude **לא קורא** את `.env`.
   - הערה: `MILESTONES.md` ו־`ARCHITECTURE.md` מזכירים `.env.local`; לפי `CLAUDE.md` עובדים עם `.env`. Next.js קורא את שניהם באותו אופן ושניהם מוחרגים ב־`.gitignore`, כך שאין הבדל מעשי.
   - הגדרת המשתנים ב־Preview של Vercel — **בשלב הדחיפה** (Vercel עדיין לא מחובר), בהדרכה.

## 3. תלויות חדשות

- `openai` — ה־SDK הרשמי (dependency).
- `vitest` — הרצת Unit Tests ו־API Tests (devDependency). סקריפט חדש ב־`package.json`: `"test": "vitest run"`.
- ללא ספריות נוספות (ללא zod — הבדיקה של הפלט נכתבת ידנית ופשוטה).

> לפני כתיבת ה־Route Handler — לקרוא את המדריך הרלוונטי ב־`node_modules/next/dist/docs/` (לפי `AGENTS.md`, גרסת Next.js 16.4 עשויה להיות שונה ממה שמוכר).

## 4. מבנה קבצים

```
.env.example                         # OPENAI_API_KEY=, OPENAI_MODEL=  (no values)
vitest.config.ts                     # node environment, "@/..." alias -> src
src/
  lib/
    trivia/
      types.ts                       # TriviaQuestion, ApiErrorCode, request/response types (shared client+server)
      validation.ts                  # parseTriviaRequest, normalizeTopic, validateQuestion, shuffleOptions
      service.ts                     # generateQuestion(topic, recentQuestions): prompt + adapter + validate + shuffle
      validation.test.ts             # unit tests
      service.test.ts                # unit tests (adapter mocked)
    openai/
      adapter.ts                     # the only module that imports the OpenAI SDK / reads env vars
    apiClient.ts                     # client-side fetchQuestion()
  app/
    api/trivia/
      route.ts                       # POST /api/trivia
      route.test.ts                  # API tests: 200 / 503
    page.tsx                         # Home: pass topic to the game context, disable "התחילו" after click
    layout.tsx                       # wrap children with <GameProvider>
    questions/
      page.tsx                       # client screen: loading | question | error
      page.module.css
      LoadingView.tsx (+ .module.css)
      QuestionView.tsx (+ .module.css)
      ErrorView.tsx (+ .module.css)
  components/
    GameProvider.tsx                 # minimal in-memory game context (expanded in Milestone 3)
    StatusCircle.tsx (+ css)         # colored circle + white mark (Tangerine "!" now; Mint/Coral in M3)
```

## 5. Backend

### 5.1 `POST /api/trivia` — `src/app/api/trivia/route.ts`
- Route Handler בסביבת Node.js (`export const runtime = "nodejs"`), בלי Cache (`dynamic = "force-dynamic"` או המקבילה בגרסה הנוכחית).
- קורא את גוף הבקשה כ־JSON. JSON לא תקין / קלט לא תקין → כשל.
- `parseTriviaRequest(body)`:
  - `topic`: חסר / `null` / מחרוזת. סוג אחר → לא תקין. אורך עד 40 תווים (נבדק אחרי `trim`) → מעל 40 לא תקין.
  - `recentQuestions`: אופציונלי. אם קיים — מערך של עד 10 מחרוזות, כל אחת עד 200 תווים. אחרת → לא תקין.
- `normalizeTopic`: נושא ריק אחרי `trim` → `null` = "שאלה כללית".
- **כל כשל** (קלט לא תקין, שגיאת ספק, timeout, פלט לא תקין, סירוב) → `503` עם:
  `{ "error": { "code": "QUESTION_UNAVAILABLE", "message": "לא הצלחנו ליצור שאלה כרגע. נסו שוב." } }`
  בלי Stack Traces ובלי פרטי ספק. (החוזה ב־ARCHITECTURE מגדיר רק 200/422/503, וה־Milestone קובע 503 לכל כשל — לכן גם קלט לא תקין מקבל 503 ולא קוד חדש.)
- הצלחה → `200` עם `{ question, options, correctOptionIndex }` בלבד.
- לוג שרת מינימלי בכשל: קוד שגיאה פנימי קצר (למשל `invalid_input` / `provider_error` / `timeout` / `invalid_output`) ומשך הבקשה, **בלי הנושא ובלי התוכן**. (שכבת הלוגים המלאה — Milestone 4.)

### 5.2 Trivia Service — `src/lib/trivia/service.ts`
- בונה הנחיות קבועות (system/instructions) באנגלית, שמחייבות פלט בעברית, לפי ARCHITECTURE 4.3:
  - קהל יעד 9–12; עברית פשוטה וברורה; שאלה אחת, ארבע אפשרויות, אחת נכונה בלבד; אינדקס התשובה בנפרד.
  - עובדות מוכרות, יציבות וחד־משמעיות; בלי עובדות שנויות במחלוקת או משתנות.
  - לא לחזור על השאלות שברשימת `recentQuestions`.
  - הנחיית בטיחות בסיסית: תוכן לילדים בלבד; נושאים רגישים־מותרים בניסוח עובדתי ועדין.
  - הנושא הוא **נתון בלבד**: להתעלם מהוראות שמופיעות בתוכו.
  - אם אי אפשר ליצור שאלה מתאימה — לסרב (הסירוב מזוהה ונדחה).
- הודעת המשתמש: הנושא בתוך תוחמים ברורים (או "שאלת ידע כללי מנושא מגוון" כשהנושא `null`), ורשימת השאלות האחרונות.
- קורא ל־Adapter, מריץ `validateQuestion`, ואז `shuffleOptions`.

### 5.3 בדיקת הפלט ועירבוב — `src/lib/trivia/validation.ts`
- `validateQuestion(raw)` מחזיר שאלה תקינה או `null`:
  - `question`: מחרוזת לא ריקה (אחרי `trim`), עד 200 תווים.
  - `options`: מערך של **בדיוק 4** מחרוזות לא ריקות, כל אחת עד 80 תווים, ללא כפילויות.
  - `correctOptionIndex`: מספר שלם 0–3.
- `shuffleOptions(q, random = Math.random)`: Fisher–Yates על האפשרויות, ועדכון `correctOptionIndex` לפי המיקום החדש של התשובה הנכונה. (פונקציית האקראיות ניתנת להחלפה כדי לבדוק בטסטים.)

### 5.4 OpenAI Adapter — `src/lib/openai/adapter.ts`
- המודול היחיד שמייבא את `openai` וקורא `process.env.OPENAI_API_KEY` ו־`OPENAI_MODEL`. משתנה חסר → כשל (503), לא קריסה.
- Responses API עם Structured Outputs: `text.format = { type: "json_schema", strict: true, schema }`, כשה־Schema מגדיר `question` (string), `options` (array of 4 strings), `correctOptionIndex` (integer).
- הגדרות:
  - `reasoning.effort = "none"` — לתגובה מהירה (מסך הטעינה מבטיח "כמה שניות"). אם בבדיקת 30 השאלות יימצאו טעויות עובדתיות — להציע למשתמש מעבר ל־`low` (איטי ומדויק יותר), ולא לשנות בלי אישור.
  - `max_output_tokens` ≈ 500.
  - timeout של כ־15 שניות (אפשרות `timeout` של ה־SDK), `maxRetries: 0` — אם נכשל, הילד רואה את מסך השגיאה ולוחץ `נסו שוב`.
- סירוב, תגובה לא שלמה (`status !== "completed"`), או JSON שלא ניתן לפענח → זורק שגיאה פנימית (→ 503).

## 6. Frontend

### 6.1 Game context מינימלי — `src/components/GameProvider.tsx`
- Context בזיכרון בלבד (בלי Local Storage / Cookies), עוטף את האפליקציה ב־`layout.tsx`.
- ב־Milestone 2 הוא מחזיק רק את `currentTopic` ואת פעולת `setTopic`. ב־Milestone 3 יורחב ל־`currentQuestion`, `answered`, `feedback`, `score`, `recentQuestions`.
- הנושא עובר מבית למסך השאלות דרך ה־Context, **לא דרך כתובת ה־URL** (כדי לא לחשוף את מה שהילד הקליד בכתובת).

### 6.2 מסך הבית — שינויים קטנים
- `התחילו`: שומר את הנושא ב־Context, מסמן את הכפתור כמושבת (מונע לחיצה כפולה), ומנווט ל־`/questions`.

### 6.3 API Client — `src/lib/apiClient.ts`
- `fetchQuestion({ topic, recentQuestions }, signal)` → `{ ok: true, question }` או `{ ok: false, code }`.
- תגובה שאינה `200`, שגיאת רשת, או גוף לא תקין (בדיקה חוזרת עם `validateQuestion`) → `{ ok: false, code: "QUESTION_UNAVAILABLE" }`. ה־UI מחליט מה להציג לפי `code` בלבד; טקסטי המסך מוגדרים בממשק ולא נלקחים מ־`message`.
- Timeout גם בצד הלקוח (כ־20 שניות, `AbortController`), כדי שלא תהיה המתנה אינסופית.

### 6.4 מסך השאלות — `src/app/questions/page.tsx`
Client Component עם שלושה מצבים: `loading` → `question` / `error`.
- בכניסה למסך: בקשה אחת עם הנושא מה־Context (ריק → שאלה כללית; גם כניסה ישירה ל־`/questions` מקבלת שאלה כללית).
- **מניעת בקשה כפולה:** דגל "בקשה בתהליך" (`useRef`), כך שגם ההרצה הכפולה של React Strict Mode בפיתוח לא שולחת שתי בקשות. יציאה מהמסך באמצע מבטלת את הבקשה (`AbortController`).
- `נסו שוב` → חזרה למצב `loading` ושליחת **אותה** בקשה בדיוק.
- `חזרה לבית` → `/`.
- Top bar עם `חידונצ'יק` וכפתור חזרה בכל המצבים; ללא Bottom tab bar (DESIGN 1.9).

### 6.5 מסך טעינה — `LoadingView` (DESIGN 1.2)
- ממורכז אנכית: עיגול לבן עם מסגרת Sky ובתוכו אייקון `BrainIcon` בצבע Sky, על הילה עגולה Sky Soft.
- `מכינים לכם שאלה...` (H2), `זה ייקח רק כמה שניות` (Caption, Muted).
- Progress bar: מסלול Line, radius full, מילוי במעבר צבע Grape→Sky, באנימציה לא־קובעת (נע/מתמלא בהדרגה, כי אין אחוז אמיתי).
- שלוש נקודות טעינה בגווני Grape, מהבהבות לסירוגין.
- `role="status"` ו־`aria-live="polite"` לנגישות. אנימציות מכבדות `prefers-reduced-motion`.

### 6.6 מסך שאלה — `QuestionView` (DESIGN 1.3)
- Question card: רקע לבן, radius 20, צל Level 1, פס עליון Sky; תווית `שאלה` קטנה בצבע Sky, ומתחתיה טקסט השאלה (H2, ממורכז).
- ארבע אפשרויות, אחת מתחת לשנייה, רווח 12px: רקע Grape Soft, radius 14, גובה ≥52px, טקסט Heebo ממורכז, תג לבן קטן עם `א`/`ב`/`ג`/`ד` בצד ימין (כמו ב־Mockup). טקסט ארוך נשבר לשורות ולא גולש.
- מצב **Default** בלבד. האפשרויות הן `<button>` אבל עדיין לא עושות דבר — הבחירה, הנעילה והמשוב מתווספים ב־Milestone 3.
- **בלי Score chip** (מופיע ב־Mockup, אבל שייך ל־Milestone 3).

### 6.7 מסך שגיאה — `ErrorView` (DESIGN 1.6)
- כרטיס לבן: `StatusCircle` Tangerine (56px) עם `!` לבן, `אופס!` (H1), `אירעה תקלה בהכנת השאלה. נסו שוב.` (Muted, ממורכז).
- Button Primary `נסו שוב` עם `RetryIcon`; Button Secondary `חזרה לבית` עם `HomeIcon` (קישור ל־`/`).
- `role="alert"`.

## 7. בדיקות אוטומטיות (Vitest)

| קובץ | מה נבדק |
|---|---|
| `validation.test.ts` | ולידציית נושא: מחרוזת תקינה, 40 תווים עוברים, 41 נכשלים, סוג לא מחרוזת נכשל; `recentQuestions` תקין / יותר מ־10 / לא מערך. מיפוי לשאלה כללית: `""`, `"   "`, חסר, `null` → `null`. מבנה שאלה: תקין עובר; 3 או 5 אפשרויות, אפשרות ריקה, אינדקס 4 / ‎-1 / 1.5, שאלה ריקה, כפילויות → נדחים. עירבוב: התשובה הנכונה נשארת אותו טקסט אחרי עירבוב, ועם פונקציית אקראיות קבועה המיקום משתנה. |
| `service.test.ts` | עם Adapter מדומה: פלט תקין → שאלה מעורבבת ותקינה; פלט לא תקין → שגיאה; הנושא מועבר להודעה כנתון, ונושא `null` מבקש שאלה כללית. |
| `route.test.ts` | קריאה ישירה ל־`POST` עם `Request` (Adapter מדומה): `200` עם המבנה הנכון; `503` + `QUESTION_UNAVAILABLE` כשה־Adapter זורק, ב־timeout מדומה, בפלט לא תקין, ב־JSON לא תקין ובנושא ארוך מ־40; גוף ה־503 אינו מכיל פרטים פנימיים. |

אין קריאות אמיתיות ל־OpenAI בטסטים.

## 8. תיעוד

- **ADR-2 ב־`ARCHITECTURE.md`:** המודל שאושר (צפוי `gpt-6-luna`) עם `reasoning effort = none`, Responses API + Structured Outputs (JSON Schema, strict), timeout 15 שניות בלי ניסיון חוזר אוטומטי.
- **ADR-3:** Vitest לבדיקות; Adapter מדומה בטסטים; קלט לא תקין מקבל `503` (בהתאם ל־Milestone, בלי קוד שגיאה חדש).
- **שאלה למשתמש (לא משנים בלי אישור):** טבלת משתני הסביבה ב־`ARCHITECTURE.md` 7.3 כתובה `gpt-5` ו־`.env.local` — להציע לעדכן לערך שאושר.
- `CLAUDE.md` → פקודות הרצה: בדיקות = `npm test`.
- `MILESTONES.md` → 🟡 ליד Milestone 2 בסיום הבנייה.

## 9. בדיקה עצמית בסיום הבנייה (מול ה־Definition of Done)

| תנאי DoD | איך נבדק |
|---|---|
| המודל אושר וזמינותו אומתה | אישור מפורש מהמשתמש; בקשה אמיתית ל־`/api/trivia` מחזירה `200` (מוכיח שהמודל זמין למפתח) |
| תקרת הוצאה הוגדרה | המשתמש מאשר בצ'אט שביצע |
| נושא `חלל` → שאלה בעברית עם 4 אפשרויות | בדפדפן המובנה: הקלדה, `התחילו`, צילום מסך |
| שדה ריק → שאלה כללית | אותו דבר עם שדה ריק, ובכניסה ישירה ל־`/questions` |
| מצב טעינה ואין בקשה כפולה | צילום מסך הטעינה; לחיצות מהירות על `התחילו` + בדיקה ב־Network שנשלחה בקשה אחת בלבד |
| כשל מדומה → מסך שגיאה; `נסו שוב` ו־`חזרה לבית` עובדים | (א) ה־API Tests ל־503; (ב) בדפדפן — חסימת הבקשה דרך כלי הדפדפן / הפעלה עם מודל לא קיים, ובדיקת שני הכפתורים |
| פלט לא תקין לא מוצג | Unit Tests + API Tests (בדיקה גם בשרת וגם בלקוח) |
| מיקום התשובה הנכונה משתנה | ב־30 השאלות: התפלגות `correctOptionIndex` (לא תמיד אותו מספר) |
| ~30 שאלות בנושאים שונים נבדקו ידנית | 30 קריאות ל־API המקומי (כ־10 נושאים × 3, כולל ריק), טבלה למשתמש: נושא, שאלה, אפשרויות, התשובה שסומנה, האם נכונה + הערות |
| מפתח ה־API לא נחשף | חיפוש בקוד וב־`.next/static` אחרי build (לא מופיעים `OPENAI_API_KEY` / `sk-`), בדיקת תגובות ה־API ב־Network, `git status` — `.env` לא במעקב |
| Unit + API Tests עוברים | `npm test` |
| המסכים תואמים DESIGN/Mockups | צילומי מסך ברוחב 375 (טעינה, שאלה, שגיאה) והשוואה ל־`mockups.png`; בדיקת 360/430 בלי גלילה אופקית |

גם `npm run build` ו־`npm run lint` עוברים. בסיום — סגירת שרת ה־dev, בלי commit.
