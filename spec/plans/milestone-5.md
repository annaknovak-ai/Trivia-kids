# תוכנית — Milestone 5: PWA ופריסה ל־Production

**מטרה:** אפשר להתקין את חידונצ'יק כאפליקציה (PWA), נקודת ה־API מוגנת מפני שימוש חריג (Rate Limiting), והאתר זמין לציבור ב־Production בכתובת קבועה.

**מקורות:** `PRD.md` §1.ג, §5.א (PWA, קישוריות), §5.ב (פרטיות ילדים, תקרת הוצאה), §6 (אין Offline ליצירת שאלות); `ARCHITECTURE.md` §1.4, §5.1–5.3, §6, §7; `MILESTONES.md` Milestone 5. תיעוד Next.js המקומי: `node_modules/next/dist/docs/01-app/02-guides/progressive-web-apps.md`, `offline-support.md`, `03-api-reference/03-file-conventions/01-metadata/manifest.md`, `app-icons.md`.

---

## 0. החלטות — אושרו על ידי בעל המוצר (25.10.2026)

- **אייקון:** אייקון המוח בלבן על ריבוע Grape (`#6C4CF5`) — ההצעה בסעיף 0.1.
- **Rate Limiting:** עד **10 בקשות לדקה לכל כתובת IP** ל־`/api/trivia` — ההצעה בסעיף 0.2.

### השאלות כפי שהוצגו

1. **אייקון האפליקציה (מסך הבית בטלפון).** `DESIGN.md` לא מגדיר אייקון אפליקציה. **הצעה:** אייקון המוח (`BrainIcon`, כבר קיים בסט האייקונים ומופיע במסך הטעינה) בלבן, על ריבוע בצבע Grape (`#6C4CF5`). בלי טקסט — האות/שם לא קריאים בגודל קטן. אפשרות חלופית: האות `ח` בגופן Rubik בלבן על Grape.
2. **סף ה־Rate Limiting.** לא מוגדר במסמכים. **הצעה:** עד **10 בקשות לדקה** לכל כתובת IP ל־`/api/trivia`. ילד שמשחק רגיל מבקש 2–4 שאלות בדקה, כך שהוא לא ירגיש בזה; סקריפט שמנסה "לשאוב" שאלות נחסם. (בבית ספר כמה ילדים עשויים לחלוק אותה כתובת IP — אם זה תרחיש צפוי, אפשר להעלות ל־20.)

> שתי ההחלטות התקבלו; הן יתועדו כ־ADR בזמן הבנייה.

---

## 1. מה כבר קיים ולא משתנה

- `fetchQuestion` (`src/lib/apiClient.ts`) ממפה כל כשל רשת (כולל Offline) וכל תגובה שאינה `200`/`422` — **כולל `429` מה־Rate Limiting** — ל־`QUESTION_UNAVAILABLE`, כלומר למסך השגיאה הידידותי `אופס!` עם `נסו שוב`. לכן מצב Offline ובקשה שנחסמה **לא דורשים שינוי בממשק או במסך חדש**. נבדק בפועל בבנייה.
- `viewport.themeColor` (`#F8F6FF`, Canvas) ו־`lang="he"`/`dir="rtl"` כבר מוגדרים ב־`src/app/layout.tsx`.
- Vercel כבר מחובר ל־GitHub (מ־Milestone 1).
- **לא** מפעילים את `experimental.useOffline` של Next.js: הוא מטפל בניווטים ובקריאות Server Actions, לא בקריאת `fetch` שלנו, ומוסיף התנהגות "ממתין עד שהרשת תחזור" שסותרת את הדרישה להציג הודעת שגיאה.

---

## 2. Web App Manifest

**קובץ חדש:** `src/app/manifest.ts` (קובץ המוסכמה של Next.js, מוגש ב־`/manifest.webmanifest` ומקושר אוטומטית מה־`<head>`).

```ts
{
  name: "חידונצ'יק",
  short_name: "חידונצ'יק",          // 9 תווים — נכנס מתחת לאייקון
  description: "שאלות טריוויה מותאמות במיוחד בשבילכם",
  lang: "he",
  dir: "rtl",
  start_url: "/",
  scope: "/",
  display: "standalone",
  orientation: "portrait",
  background_color: "#F8F6FF",       // Canvas — רקע מסך הפתיחה
  theme_color: "#F8F6FF",            // תואם ל־viewport.themeColor הקיים
  icons: [ 192, 512, 512 maskable ]  // ראו §3
}
```

- **אין להוסיף** `shortcuts`, `screenshots`, `share_target` וכו' — לא מוגדרים ב־spec.

---

## 3. אייקונים

נוצרים **בקוד** בזמן ה־build עם `ImageResponse` של `next/og` (מובנה ב־Next.js, בלי תלות חדשה ובלי קובצי תמונה ידניים), לפי ההחלטה בשאלה 0.1:

| קובץ | גודל | שימוש |
|---|---|---|
| `src/app/icon.tsx` + `generateImageMetadata` | 192×192, 512×512 | Android / Chrome, ה־Manifest |
| `src/app/icon.tsx` (מזהה `maskable`) | 512×512, עם שוליים בטוחים (~20%) | Android adaptive icon (`purpose: "maskable"`) |
| `src/app/apple-icon.tsx` | 180×180, בלי שקיפות ובלי פינות מעוגלות (iOS מעגל בעצמו) | iOS "הוספה למסך הבית" |

- ה־SVG של המוח מועתק מ־`BrainIcon` (`src/components/icons.tsx`) לתוך ה־JSX של `ImageResponse` (Satori תומך ב־`<svg>` פשוט). אם יתברר שהרינדור לא תקין — חלופה: קובצי PNG סטטיים ב־`public/icons/` שמופקים פעם אחת מהקוד הזה.
- ה־Manifest מפנה לכתובות שה־build מייצר (לבדוק ב־build את הנתיבים בפועל, למשל `/icon/192`). כתובות ה־icons נכנסות גם לרשימת המטמון של ה־Service Worker.
- `src/app/favicon.ico` הקיים נשאר.

---

## 4. Service Worker מינימלי

**קובץ חדש:** `public/sw.js` — JavaScript רגיל, כתוב ידנית, **בלי ספרייה** (Serwist / Workbox מיותרים לגודל הזה).

**מטמון אחד בשם עם גרסה:** `hidonchik-shell-v1`. בכל שינוי ב־`sw.js` מעלים את המספר; באירוע `activate` מוחקים כל מטמון אחר שמתחיל ב־`hidonchik-`.

**`install`:** שמירה מראש של מעטפת האפליקציה: `/`, `/about`, `/questions`, `/manifest.webmanifest` וכתובות האייקונים. `skipWaiting()`.

**`activate`:** ניקוי מטמונים ישנים, `clients.claim()`.

**`fetch` — כללי החלטה (הסדר חשוב):**

| בקשה | התנהגות |
|---|---|
| לא `GET` (כולל `POST /api/trivia`) | **לא נוגעים** — עובר ישר לרשת |
| כתובת ממקור אחר (cross-origin) | לא נוגעים |
| נתיב שמתחיל ב־`/api/` | **לא נוגעים, לעולם לא נשמר** |
| בקשת RSC של Next.js (header `RSC` או פרמטר `_rsc`) | לא נוגעים (ניווט פנימי; Next.js מטפל בעצמו) |
| ניווט (`request.mode === "navigate"`) | **Network-first:** מהרשת, ובמקרה הצלחה מעדכנים את העותק במטמון; אם אין רשת — העותק מהמטמון של אותו נתיב, ואם אין — של `/` |
| `/_next/static/*`, אייקונים, `manifest.webmanifest` | **Cache-first:** מהמטמון, ואם אין — מהרשת ושומרים (קבצים אלה עם hash בשם ולא משתנים) |
| כל השאר | לא נוגעים |

- **אין** במטמון שאלות, תשובות, ניקוד או תגובות API: השאלה מגיעה רק מ־`POST /api/trivia` (לא נשמר), והניקוד חי רק בזיכרון React (ADR-5). דפי ה־HTML שנשמרים הם המעטפת הסטטית, שלא מכילה מצב משחק.
- שומרים במטמון רק תגובות `200` רגילות (`response.ok && response.type === "basic"`).

**רישום:** רכיב לקוח קטן חדש `src/components/ServiceWorkerRegister.tsx` (`"use client"`, מחזיר `null`), שמוכנס ב־`src/app/layout.tsx`:
- נרשם **רק ב־Production** (`process.env.NODE_ENV === "production"`), כדי שהמטמון לא יפריע בפיתוח (`npm run dev`).
- `navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })`, בתוך `useEffect`, רק אם `"serviceWorker" in navigator`. כשל ברישום נבלע בשקט (האתר עובד גם בלי).

**Headers** ב־`next.config.ts` עבור `/sw.js` (לפי מדריך ה־PWA של Next.js): `Cache-Control: no-cache, no-store, must-revalidate` ו־`Content-Type: application/javascript; charset=utf-8` — כדי שעדכונים של ה־Service Worker יגיעו מיד.

**לא מוסיפים** כפתור "התקינו את האפליקציה" או הודעת התקנה ל־iOS — לא מוגדרים ב־`DESIGN.md`. הדפדפן מציע התקנה בעצמו.

---

## 5. מצב Offline

- **פתיחה/טעינה מחדש Offline** (אחרי ביקור אחד לפחות): ה־Service Worker מגיש את המעטפת מהמטמון — מסך הבית, אודות ומסך השאלות נטענים.
- **ניסיון ליצור שאלה Offline:** `fetch` נכשל → `QUESTION_UNAVAILABLE` → מסך `אופס!` עם `נסו שוב` ו־`חזרה לבית` (קיים, בלי שינוי). כשהרשת חוזרת, `נסו שוב` עובד.
- ללא באנר "אין חיבור" ובלי טקסט חדש — לא מוגדרים ב־spec.

---

## 6. Rate Limiting — Vercel WAF

**ממצא (נבדק 25.10.2026 בתיעוד של Vercel):** WAF Rate Limiting זמין בכל התוכניות, **כולל Hobby**: כלל Rate Limit אחד לכל פרויקט, חלון זמן קבוע (Fixed window, 10 שניות עד 10 דקות), מפתח ספירה לפי IP, ומיליון בקשות מותרות בחודש כלולות. לכן **אין צורך לעצור** לפי סעיף ה־"אם אין כלי" — אבל הסף דורש אישור (שאלה 0.2).
מקורות: https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting , https://vercel.com/changelog/rate-limiting-now-available-on-hobby-with-higher-included-usage-on-pro

**מימוש — הגדרה בלוח הבקרה של Vercel, בלי קוד** (בעל המוצר מבצע בהדרכה צעד אחר צעד):
- Project → Firewall → Configure → New Rule.
- שם: `trivia-api-rate-limit`.
- תנאי: `Request Path` **equals** `/api/trivia`.
- פעולה: **Rate Limit** — Fixed Window, חלון 60 שניות, מספר בקשות לפי ההחלטה (מוצע 10), מפתח: IP.
- תגובה בחריגה: ברירת המחדל (`429 Too Many Requests`).
- שמירה ו־Publish.

**בצד הקוד:** אין שינוי. `429` → מסך השגיאה הידידותי (ראו §1). נוסיף **API/Unit Test** קטן ל־`fetchQuestion` שמוודא ש־`429` ממופה ל־`QUESTION_UNAVAILABLE` (מגן על ההתנהגות מפני שינוי עתידי).

**בדיקה ב־Production (אחרי הפריסה):** סקריפט קטן שולח ברצף ~15 בקשות עם קלט **לא תקין** (נושא של 41 תווים → `503 invalid_input` אצלנו, **בלי קריאה ל־OpenAI ובלי עלות**). מצופה: הראשונות `503`, ואחרי הסף `429`. מראים את התוצאה לבעל המוצר.

---

## 7. בדיקת מדיניות OpenAI לאפליקציות לילדים

בזמן הבנייה: קריאה בתיעוד הרשמי העדכני של OpenAI — Usage Policies, Terms of Use / Services Agreement (גיל מינימלי, אחריות המפתח), והנחיות לבניית מוצרים לקטינים (כולל COPPA). **מסכמים לבעל המוצר בשפה פשוטה, עם קישורים:** מה מותר, מה נדרש מהמפתח, והאם יש משהו באפליקציה שצריך לשנות (למשל ניסוח באודות). **לא משנים** טקסטים או התנהגות בלי אישור — אם נדרש שינוי, עוצרים ושואלים. הממצאים מוצגים **לפני הפרסום** (הדחיפה).

---

## 8. סביבת Production והפריסה

**הקשר חשוב:** Vercel מחובר לענף `main`, ולכן כל Push ל־`main` **כבר** יוצר Production Deployment. בפועל, "הפרסום" של Milestone הזה הוא הדחיפה הרגילה בסוף ה־Milestone — **רק לאחר אישור מפורש** (CLAUDE.md: אין push בלי בקשה).

**לפני הדחיפה — הדרכה צעד אחר צעד לבעל המוצר (בעל המוצר מבצע, אני לא נוגע במפתחות):**
1. **מפתח OpenAI נפרד ל־Production:** platform.openai.com → API keys → Create new secret key, שם `hidonchik-production`. מעתיקים פעם אחת — לא שומרים במחשב ולא בקובץ.
2. **Vercel → Project → Settings → Environment Variables:**
   - `OPENAI_API_KEY` = המפתח החדש, מסומן **Production בלבד**, מסוג Sensitive.
   - `OPENAI_API_KEY` של הפיתוח — מוגדר רק ל־**Preview** (ו־Development אם קיים). לוודא שהמפתח של הפיתוח **לא** מסומן ל־Production.
   - `OPENAI_MODEL` = `gpt-6-luna` ל־Production (ול־Preview).
3. **תקרת הוצאה והתראות:** ב־OpenAI → Settings → Limits/Billing — לוודא שהתקרה הקשיחה וההתראות מוגדרות **ברמת הארגון/הפרויקט** שבו נוצר המפתח החדש (כך שהן חלות גם עליו). אם המפתחות בפרויקטים שונים ב־OpenAI — להגדיר תקרה גם בפרויקט של Production.
4. **תוכנית Vercel:** לוודא שהחשבון על **Hobby** (Settings → Billing) — מתאים למטרה אישית / לימודית.
5. **Rate Limiting:** הגדרת הכלל לפי §6.

**הדחיפה (רק כשבעל המוצר מבקש "דחוף"):** סימון ✅, commit, push ל־`main` → Vercel בונה ומפרסם ל־Production. בודקים יחד בלוח הבקרה של Vercel שה־Deployment הצליח, ואז Manual QA ב־Production (§10). אם משתני הסביבה הוגדרו אחרי Deployment קיים — Redeploy מהלוח.

---

## 9. קבצים

| קובץ | פעולה |
|---|---|
| `src/app/manifest.ts` | חדש — Manifest (§2) |
| `src/app/icon.tsx` | חדש — אייקונים 192/512/maskable (§3) |
| `src/app/apple-icon.tsx` | חדש — אייקון iOS 180 (§3) |
| `public/sw.js` | חדש — Service Worker (§4) |
| `src/components/ServiceWorkerRegister.tsx` | חדש — רישום ה־SW ב־Production (§4) |
| `src/app/layout.tsx` | הוספת `<ServiceWorkerRegister />` |
| `next.config.ts` | `headers()` ל־`/sw.js` |
| `src/app/manifest.test.ts` | חדש — Unit: שם, `short_name`, `start_url`, `display: "standalone"`, אייקונים 192 ו־512 |
| `src/lib/apiClient.test.ts` | חדש — `429`, כשל רשת (Offline) ו־`503` ממופים ל־`QUESTION_UNAVAILABLE` |
| `spec/ARCHITECTURE.md` | ADR-8 (PWA: Manifest, אייקונים ב־`ImageResponse`, SW ידני ואסטרטגיות המטמון), ADR-9 (Rate Limiting ב־Vercel WAF והסף שנבחר) |
| `spec/MILESTONES.md` | סימון 🟡 בסיום הבנייה |
| `CLAUDE.md` → פקודות הרצה | הוספת בדיקת PWA מקומית: `npm run build` ואז `npm start` |

אין משתני סביבה חדשים → `.env.example` לא משתנה.

---

## 10. בדיקות ואימות

**אוטומטי (בבנייה):** `npm test`, `npm run lint`, `npm run build` — הכל עובר.

**מקומית, ב־Production build** (`npm run build && npm start`, http://localhost:3000 — Service Worker עובד ב־localhost גם בלי HTTPS), בדפדפן המובנה:
- `/manifest.webmanifest` נטען ותקין; האייקונים נטענים בגדלים הנכונים.
- ה־Service Worker רשום ופעיל.
- **Offline** (ניתוק רשת בכלי הפיתוח / חסימת בקשות): טעינה מחדש של `/` ו־`/about` עובדת מהמטמון; `התחילו` מציג את מסך `אופס!`; חזרה לרשת → `נסו שוב` מביא שאלה.
- **תוכן המטמון** (Cache Storage): רק HTML של המעטפת, `/_next/static/*`, אייקונים ו־Manifest. **אין** `/api/trivia`, אין שאלות, אין ניקוד.
- ב־`npm run dev` ה־Service Worker **לא** נרשם.

**ב־Production (אחרי הדחיפה, יחד עם בעל המוצר):**
- האתר וה־API עובדים בכתובת הציבורית.
- בדיקת Rate Limiting לפי §6.
- **התקנה בפועל** (בעל המוצר, על הטלפונים): Chrome ב־Android → "התקנת אפליקציה"; Safari ב־iOS → שיתוף → "הוספה למסך הבית". נפתח בלי שורת כתובת (standalone), עם האייקון והשם `חידונצ'יק`.
- Manual QA מלא: נושא ריק, נושא תקין, נושא לא מתאים, תשובה נכונה ושגויה, לחיצה כפולה, שגיאה וניסיון חוזר (Offline), ניווט בין כל המסכים, RTL ומסך קטן (360–430px).

---

## 11. מיפוי ל־Definition of Done

| תנאי | איך מתקיים | מתי נבדק |
|---|---|---|
| משתני Production ב־Vercel בלבד, מפתח נפרד | §8 שלבים 1–2 | לפני הדחיפה (בעל המוצר מאשר) |
| Production Deployment הצליח, אתר ו־API עובדים | §8 דחיפה | אחרי הדחיפה |
| התקנה ו־standalone ב־Android וב־iOS | §2–§4 | מקומית (Manifest/SW) + בפועל אחרי הדחיפה |
| Offline: מעטפת נטענת, שגיאה ידידותית | §4–§5 | מקומית ב־build |
| SW לא שומר שאלות/תשובות/ניקוד | §4 | מקומית (Cache Storage) |
| Rate Limiting פעיל וחוסם | §6 | אחרי הדחיפה |
| מדיניות OpenAI נבדקה והוצגה | §7 | בבנייה, לפני הדחיפה |
| Manual QA מלא ב־Production | §10 | אחרי הדחיפה |
| כל הבדיקות האוטומטיות עוברות | §9–§10 | בבנייה |

> כמו ב־Milestone 1: הסעיפים שתלויים ב־Production נבדקים בשלב הדחיפה, לאחר אישור בעל המוצר, ולא במהלך הבנייה. בסיום הבנייה ה־Milestone מסומן 🟡, והסעיפים האלה מדווחים כ"ממתין לדחיפה".
