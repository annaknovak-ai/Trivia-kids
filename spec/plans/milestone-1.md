# תוכנית — Milestone 1: הקמת הפרויקט ומעטפת האפליקציה

מבוסס על: `MILESTONES.md` (Milestone 1), `DESIGN.md`, `ARCHITECTURE.md`, `PRD.md`, והתמונות `wireframes.png`, `mockups.png`, `style-guide.png`.

## 1. מטרה

פרויקט Next.js שרץ מקומית, עם השפה העיצובית המלאה (tokens + רכיבים משותפים), מסך בית ומסך אודות בעיצוב הסופי, ומסלול שאלות ריק (Top bar בלבד). ניווט בין שלושת המסלולים עובד.

**לא בטווח של Milestone זה:** קריאה ל־API / OpenAI, משתני סביבה, מצב משחק, Score chip פעיל, מסכי טעינה/שגיאה/משוב, PWA (Manifest / Service Worker — Milestone 5), חיבור GitHub/Vercel (בשלב הדחיפה, בהדרכה למשתמש), Tests אוטומטיים (מתחילים ב־Milestone 2).

## 2. הקמת הפרויקט

1. יצירת פרויקט Next.js (הגרסה היציבה האחרונה) עם TypeScript, App Router, ESLint, **בלי Tailwind**, בתיקייה זמנית (התיקייה הנוכחית אינה ריקה), והעתקת הקבצים לשורש הפרויקט:
   `npx create-next-app@latest <temp> --ts --app --eslint --no-tailwind --src-dir --import-alias "@/*" --use-npm --disable-git`
   - **לא** להעתיק את ה־`.gitignore` שנוצר ואת `README.md` — ה־`.gitignore` הקיים נשמר.
   - להסיר את קובצי הדוגמה של התבנית (`page.module.css` הדיפולטיבי, תמונות SVG של Next/Vercel ב־`public/`).
2. `.gitignore` — כבר מחריג `.env*` (למעט `.env.example`), `node_modules/`, `.next/`, `*.tsbuildinfo`. להוסיף רק `next-env.d.ts` (כמקובל ב־Next.js). לא להסיר שום שורה.
3. **משתני סביבה:** אין צורך באף משתנה ב־Milestone זה, לכן לא נוצרים `.env.example` / `.env`. ייווצרו ב־Milestone 2 (`OPENAI_API_KEY`, `OPENAI_MODEL`).
4. אין תלויות נוספות מעבר למה ש־create-next-app מתקין (אייקונים ואיורים — SVG שנכתב ידנית, ראו סעיף 5).

## 3. מבנה קבצים

```
src/
  app/
    layout.tsx            # <html lang="he" dir="rtl">, fonts, metadata, app frame
    globals.css           # design tokens (CSS variables) + reset + base typography
    page.tsx              # Home screen  (/)
    page.module.css
    about/
      page.tsx            # About screen (/about)
      page.module.css
    questions/
      page.tsx            # Questions route placeholder (/questions) – Top bar only
      page.module.css
  components/
    Button.tsx / Button.module.css        # variant: primary | secondary, optional icon, as link or button
    TextInput.tsx / TextInput.module.css  # maxLength 40, placeholder, focus ring
    Card.tsx / Card.module.css            # general content card (radius 20, shadow L1)
    TopBar.tsx / TopBar.module.css        # 56px, centered title, back button on the left
    BottomTabBar.tsx / BottomTabBar.module.css  # 3 tabs, active state from current path
    Chip.tsx / Chip.module.css            # variant: grape (version) | sunny (score – used from M2/M3)
    TopicIllustrations.tsx (+ css)        # row of 4 topic tiles on the Home screen
    icons.tsx                             # inline SVG icon set
```

## 4. Design tokens (`globals.css`)

כ־CSS variables על `:root`, לפי `DESIGN.md` סעיף 2:

- **צבעים:** Grape `#6C4CF5`, Grape Soft `#EFEBFF`, Sunny `#FFC83D`, Sky `#3DB5FF`, Mint `#22C55E`, Mint Soft `#E3F9EC`, Coral `#FF5C61`, Tangerine `#FF9F1C`, Ink `#2B2559`, Muted `#6E6A8F`, Line `#E6E1FA`, Canvas `#F8F6FF`, White `#FFFFFF`.
- **צבעים נגזרים** (אין להם HEX במקור — DESIGN מורה לגזור): Grape Dark ≈ `#5136D6`, Sunny Soft ≈ `#FFF4D6`, Coral Soft ≈ `#FFE4E5`, Sky Soft ≈ `#E3F4FF`, Stone (placeholder) ≈ `#A9A5C2`. נבחרים כגוונים של צבעי הבסיס ונבדקים חזותית מול ה־Mockups.
- **טיפוגרפיה:** Display 32/40·800, H1 24/32·700, H2 20/30·600, H3 17/24·600 (Rubik); Body 15/24·400, Caption 13/18·400, Micro 12/16·500 (Heebo); Button 16/24·600 (Rubik). Fallback: Arial.
- **Radius:** 10 / 14 / 16 / 20 / full.
- **צללים:** Level 1 `0 2px 8px` Grape 10%; Level 2 `0 4px 0` Grape Dark.
- **Spacing:** 4, 8, 12, 16, 24, 32, 48.
- רקע `body`: Canvas. טקסט: Ink.

**גופנים:** `next/font/google` — Rubik (600, 700, 800) ו־Heebo (400, 500), subsets `hebrew` + `latin`, מוגדרים כ־CSS variables ב־`layout.tsx`.

**מסגרת האפליקציה:** עמודה אחת, Mobile-first. במסכים רחבים התוכן ממורכז ברוחב מרבי של ~480px (כדי שבמחשב ייראה כמו טלפון). שוליים צדדיים 16px. `overflow-x` נמנע — בלי גלילה אופקית ב־360–430px.

## 5. רכיבים משותפים

| רכיב | פרטים |
|---|---|
| **Button** | רוחב מלא, גובה 52px, radius 14, טקסט בסגנון Button, ממורכז. *Primary:* רקע Grape, טקסט לבן, בסיס "candy" 4px Grape Dark (`box-shadow`), במצב `:active` שוקע 3px. *Secondary:* רקע לבן, מסגרת 1.5px Line, טקסט Ink, אייקון Grape. תומך באייקון לפני הטקסט (בצד ימין ב־RTL), ובשימוש כקישור (`next/link`) או כ־`<button>`. |
| **TextInput** | radius 14, מסגרת 1.5px Line, placeholder בצבע Stone, Body/Heebo. Focus: מסגרת 2px Grape + glow ring רך. `maxLength={40}` — אי אפשר להקליד מעבר. `aria-label` עם כותרת הכרטיס. |
| **Card** | רקע לבן, radius 20, צל Level 1, ריפוד 16–24. |
| **TopBar** | גובה 56px, רקע לבן, קו תחתון Line. כותרת ממורכזת (H3). כפתור חזרה בצד **שמאל**: חץ chevron שמאלה בצבע Grape על משטח Grape Soft מעוגל, אזור לחיצה ≥44px, `aria-label="חזרה"`. לחיצה: `router.back()`, ואם אין היסטוריה באתר — מעבר לבית. |
| **BottomTabBar** | רקע לבן, קו עליון Line, גובה ~60px, קבוע בתחתית. שלוש לשוניות שוות, **משמאל לימין: `אודות`, `בית`, `שאלות`** (ב־RTL סדר ה־DOM הפוך: שאלות, בית, אודות). אייקון מעל תווית Micro. לשונית פעילה (לפי `usePathname`): אייקון filled Grape על pill Grape Soft, תווית מודגשת Grape, `aria-current="page"`. לא פעילה: outline + Muted. כל לשונית ≥44px גובה. מופיע בבית ובאודות בלבד. ריפוד תחתון ל־safe area של iPhone (`env(safe-area-inset-bottom)`). |
| **Chip** | radius 10, Micro, ריפוד 8. *grape:* רקע Grape Soft, טקסט/אייקון Grape (chip הגרסה). *sunny:* רקע Sunny Soft + כוכב מלא Sunny (Score chip — נבנה עכשיו כרכיב, בשימוש מ־Milestone 2–3). |
| **icons.tsx** | SVG ידני, גריד 24px, stroke 1.9, `stroke-linecap/linejoin: round`, `currentColor`: home (outline + filled), list/questions, info (outline + filled), star (filled), chevron-left, retry, brain. (retry ו־brain מוכנים לשימוש ב־Milestone 2.) |
| **TopicIllustrations** | שורה של 4 משטחים (radius 16, ~56px) בגווני רקע בהירים, ובכל אחד איור שטוח־גאומטרי 2–3 צבעים: כוכב (Sunny על Sunny Soft), מבחנה (Sky/Coral על Sky Soft), עלה (Mint על Mint Soft), כוכב לכת עם טבעת (Grape/Sunny על Grape Soft). סדר מימין לשמאל כמו ב־Mockup: כוכב לכת, עלה, מבחנה, כוכב. `aria-hidden` — דקורטיבי (שמש את דרישת ה־PRD ל"תמונה הקשורה לטריוויה"). |

## 6. מסכים

### 6.1 מסך הבית — `/`
מלמעלה למטה (ריווח hero עליון 48px), לפי `DESIGN.md` 1.1 וה־Mockup:
1. `חידונצ'יק` — Display, Grape, ממורכז (`<h1>`).
2. `שאלות טריוויה מותאמות במיוחד בשבילכם` — Muted, ממורכז.
3. TopicIllustrations.
4. Card: `איזה נושא מעניין אתכם?` (H3, מיושר לימין) + TextInput עם placeholder `לדוגמה: חיות, חלל, מדע ועוד...`, מוגבל ל־40 תווים.
5. Button Primary `התחילו` → ניווט ל־`/questions`. (שדה ריק תקין. העברת הנושא בפועל תמומש ב־Milestone 2; בשלב זה ערך השדה נשמר רק בתוך הדף.) לחיצה על Enter בשדה = כמו `התחילו`.
6. Button Secondary `אודות` עם אייקון info → `/about`.
7. BottomTabBar, `בית` פעילה.

> הערה: ה־Mockup וה־Wireframe מציגים `התחל` ו"אותך" ביחיד — לפי `DESIGN.md` 2.5 משתמשים בלשון רבים (`התחילו`, `אתכם`).

### 6.2 מסך אודות — `/about`
לפי `DESIGN.md` 1.7:
1. TopBar עם הכותרת `אודות` וכפתור חזרה.
2. `חידונצ'יק` (Display, Grape) + `שאלות טריוויה מותאמות במיוחד בשבילכם`, ממורכזים.
3. קו מפריד Line.
4. Card עם טקסט ממורכז: `אפליקציית טריוויה חכמה לילדים בגילאי 9–12, עם שאלות מעניינות בנושאים מגוונים, המותאמות בדיוק לגיל ולתחומי העניין שלכם.` (בידוד `9–12` כ־LTR כדי שיוצג נכון.)
5. Card `איך משחקים?` (H3) ושלוש שורות Body מיושרות לימין:
   - `כותבים נושא שמעניין אתכם, או משאירים ריק לשאלה כללית.`
   - `בוחרים אחת מארבע התשובות.`
   - `על כל תשובה נכונה מקבלים נקודה!`
6. שתי שורות Caption, Muted, ממורכזות:
   - `השאלות נוצרות על ידי בינה מלאכותית, ולפעמים היא עלולה לטעות.`
   - `אנחנו לא שומרים שום מידע עליכם.`
7. Chip grape `גרסה 1.0` עם אייקון info (המספר מבודד LTR).
8. BottomTabBar, `אודות` פעילה.

התוכן נגלל אם אינו נכנס; ה־BottomTabBar קבוע והתוכן מקבל ריפוד תחתון כדי שלא יוסתר.

### 6.3 מסלול שאלות — `/questions`
TopBar עם הכותרת `חידונצ'יק` וכפתור חזרה בלבד, גוף ריק. ללא BottomTabBar (לפי `DESIGN.md` 1.9 — מסכי זרימת השאלה ללא תפריט). נגיש מ־`התחילו` ומהלשונית `שאלות`. התוכן — Milestone 2; התנהגות הלשונית — Milestone 3.

### 6.4 Metadata
`<title>חידונצ'יק</title>`, `description` קצר בעברית, `viewport` עם `width=device-width`, `viewport-fit=cover`, ו־`themeColor` Canvas.

## 7. נגישות ו־RTL
- `<html lang="he" dir="rtl">`.
- כל אזורי הלחיצה (כפתורים, לשוניות, חזרה) ≥44px.
- Focus גלוי (`:focus-visible`) בצבע Grape.
- מספרים/סימנים בתוך טקסט עברי (`9–12`, `1.0`) עטופים ב־`<bdi>`/`dir="ltr"` לפי הצורך.

## 8. תיעוד
- **ADR-1** ב־`ARCHITECTURE.md` (סעיף `## החלטות מרכזיות (ADRs)` חדש בסוף הקובץ): עיצוב באמצעות CSS Modules + CSS variables, ואייקונים/איורים כ־SVG ידני במקום ספריית אייקונים — כדי להתאים בדיוק ל־Style Guide (stroke 1.9, וריאנט filled) בלי תלות נוספת.
- `CLAUDE.md` → **פקודות הרצה:** dev = `npm run dev`; בדיקות = "אין עדיין (מתווספות ב־Milestone 2)".
- `MILESTONES.md` → סימון 🟡 ליד Milestone 1 בסיום הבנייה.

## 9. בדיקה עצמית בסיום הבנייה (מול ה־Definition of Done)

| תנאי DoD | איך נבדק |
|---|---|
| `npm run build` עובר | הרצה, ללא שגיאות TypeScript/ESLint |
| Preview Deployment ב־Vercel | **לא בבנייה** — בשלב הדחיפה, בהדרכה למשתמש |
| בית ואודות תואמים Mockups/DESIGN | הרצת `npm run dev`, צילומי מסך בדפדפן המובנה ברוחב 375 והשוואה ל־`mockups.png` (צבעים, גופנים, RTL, טקסטים ברבים) |
| שדה עד 40 תווים | הקלדת 50 תווים → נשארים 40 |
| Bottom tab bar מנווט ומסמן לשונית פעילה | לחיצה על כל לשונית, בדיקת ה־URL והסימון |
| `אודות` ו־`התחילו` מנווטים נכון | לחיצה ובדיקת ה־URL |
| 360–430px, בלי גלילה אופקית, ≥44px | בדיקה ב־360, 375, 430: `scrollWidth <= clientWidth`, ומדידת גובה אזורי הלחיצה ב־JS |
| אין `.env` עם ערכים ב־repo | `git status` / חיפוש קבצים — לא נוצר שום `.env` |

בסיום — סגירת שרת ה־dev, בלי commit.
