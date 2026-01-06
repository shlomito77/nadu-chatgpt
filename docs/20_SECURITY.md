\# NADU — Security Model

\*\*File:\*\* docs/20\_SECURITY.md  

\*\*Status:\*\* Authoritative  

\*\*Scope:\*\* Authentication, Authorization, Data Protection, Abuse Prevention  

\*\*Applies to:\*\* All environments (dev / staging / production)



---



\## 1. Security Philosophy



Security in NADU is \*\*architectural\*\*, not cosmetic.



The system assumes:

\- Users are authenticated but not trusted

\- Clients are hostile by default

\- All enforcement must occur server-side or via Firestore rules

\- UI is never a security boundary



There is no reliance on “good behavior” or UI hiding.



---



\## 2. Identity \& Authentication



\### 2.1 Authentication Method

\- Firebase Authentication

\- Email / Password only

\- Email verification \*\*mandatory\*\*

\- No anonymous users

\- No guest access

\- No social login at MVP



Unauthenticated users:

\- Cannot read any user-generated content

\- Cannot read metadata about conversations or users



\### 2.2 Identity Guarantees

Each authenticated user is uniquely identified by:



