# populate-docs.ps1
# Run from repo root: C:\Users\User\Documents\GitHub\nadu-chatgpt
$ErrorActionPreference = "Stop"

# Force UTF-8 without BOM (works well for Hebrew in git)
function Write-File($path, $content) {
  $dir = Split-Path $path -Parent
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  Set-Content -Path $path -Value $content -Encoding utf8
  Write-Host "Wrote: $path"
}

# -------- FILES MAP (I will keep appending here as we go) --------

$files = @{}

# 00_MASTER_CONTEXT.md (SPECS)
$files["docs/specs/00_MASTER_CONTEXT.md"] = @'
# NADU — Master Context (SPECS)
> Canonical product/system context. This file anchors all SPECS (WHAT/WHY).
> קובץ עוגן לכל ה־SPECS (מה/למה). כל מסמך מפרט חייב לציית אליו.

---

## HE — הקשר־על (Master Context)
### מטרת המערכת
NADU היא פלטפורמת קהילה שמאזנת בין:
- קהילה ושיח פתוח
- פרטיות והגנה על משתמשים
- ניהול הרשאות מדויק (מי רואה/מי כותב/מי יכול ליצור קשר)
- מודרציה/דיווח/חסימות ברמת מוצר + אכיפה טכנית

### עקרונות על (Non-Negotiables)
1. **Privacy by Default**: ברירות מחדל שמרניות, חשיפה רק בבחירה מודעת.
2. **Minimize Attack Surface**: פחות מידע גלוי, יותר שליטה למשתמש.
3. **Consistency**: `username` + `role` מוצגים בכל מקום (פוסטים/תגובות/צ׳אט/דמ״ים), **חוץ מפוסט אנונימי** שמוצג כ-`Anonymous`.
4. **Locked Identity Fields (Anti-Troll)**:
   - **מין / מגדר** — לא ניתן לשינוי אחרי יצירה.
   - **תאריך לידה / גיל** — לא ניתן לשינוי אחרי יצירה.
5. **Username Policy**:
   - תווים מותרים: **עברית + אנגלית + ספרות בלבד**
   - אורך/תקינות יוגדרו במסמך Onboarding.
6. **Bio/Description**:
   - מגבלת תוכן: עד **1000 תווים**
7. **Seniority (ותק)**:
   - מוצג לפי **תאריך הרשמה** (days since signup)
   - באדג׳ים בהמשך יישענו על זה.

### מין/מגדר (Gender / Sex)
המערכת תומכת לפחות ב:
- גבר
- אישה
- טראנסג׳נדר/ית
- (אופציונלי מומלץ) לא-בינארי/ת
- (אופציונלי) מעדיפ/ה לא לציין

**דרישת UI קריטית:**  
התפקידים (Role) מוצגים בלשון בהתאם לבחירה הראשונית:
- אם נבחר “גבר” ⇒ תפקידים בזכר
- אם נבחר “אישה” ⇒ תפקידים בנקבה
- אם נבחר “טראנס/לא-בינארי/לא מציין” ⇒ ניסוח ניטרלי (או בחירת לשון ידנית)

### תפקידים (Roles) — עקרון הצגה
- התפקיד הוא “תווית זהות” שמופיעה בכל מקום.
- תפקידים אפשריים (דוגמה מהמערכת הישנה): שולט/ת, סדיסט/ית, נשלט/ת, מזוכיסט/ית, מתחיל/ה, קינקי/ת, ונילי/ת.
- כל התפקידים זמינים לכל מגדר.  
- ההבדל היחיד: **שפת ההצגה**.

---

## EN — Master Context
### System Goal
NADU is a community platform that balances:
- Open community interaction
- Strong privacy & user safety
- Precise permissioning (who can see / write / contact)
- Moderation/reporting/blocking as product rules + technical enforcement

### Non-Negotiables
1. **Privacy by Default**: conservative defaults; exposure only by explicit choice.
2. **Minimize Attack Surface**: reveal less; give users control.
3. **Consistency**: `username` + `role` appear everywhere (posts/comments/chat/DMs) **except Anonymous Posts**, which show `Anonymous`.
4. **Locked Identity Fields (Anti-Troll)**:
   - **Sex/Gender** is immutable after onboarding.
   - **Birthdate/Age** is immutable after onboarding.
5. **Username Policy**:
   - Allowed chars: **Hebrew + English + digits only**
6. **Bio/Description**:
   - Max length: **1000 characters**
7. **Seniority**:
   - Based on **signup date** (days since signup)
   - Future badges can rely on it.

### Sex/Gender Options
Minimum support:
- Male
- Female
- Transgender
Recommended additions:
- Non-binary
- Prefer not to say

**Critical UI rule:**  
Role labels must follow the user’s initial selection:
- Male ⇒ masculine wording
- Female ⇒ feminine wording
- Trans/Non-binary/Prefer not ⇒ neutral wording (or allow manual grammatical preference)

### Roles — Display Principle
- Role is an identity label shown everywhere.
- All roles are available to all genders.
- Only the **wording** changes by selected grammatical form.

'@

# -------- WRITE ALL FILES IN MAP --------
foreach ($k in $files.Keys) {
  Write-File $k $files[$k]
}

Write-Host "`nDone. Add more files to `$files map and re-run." -ForegroundColor Green
