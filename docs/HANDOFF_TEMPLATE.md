📎 docs/HANDOFF\_TEMPLATE.md



Title: NADU — Session Handoff

Purpose: Portable project memory

Language: English only



NADU — HANDOFF



Project: NADU

Repository: nadu-chatgpt

Branch: main

Date: {{YYYY-MM-DD}}



1\. High-Level Status



Firebase project: nadu-chatgpt



Firestore: rules v1 active and compiled



Auth: Email/Password only (no anonymous)



Functions: createChat, sendMessage



Emulators: Auth / Firestore / Functions running successfully



2\. What Is Already Working



Firestore rules validated (dry-run OK)



Firebase Functions load correctly in emulator



Auth Emulator contains seeded users



seed-auth.ps1 works



seed-chat.ps1 signs in users successfully



3\. Locked Decisions



Clients do not write chat messages directly



All mutations go through Cloud Functions



Firestore rules must remain strict



No edits/deletes for messages in v1



4\. Current Open Issue



createChat fails from seed-chat.ps1



Errors observed: BAD\_REQUEST, INTERNAL



Root cause likely:



Payload mismatch vs Function contract



Requirement:



Fix by providing a full updated seed script



No partial edits to existing files



5\. Task for This Session



👉 Deliver a fully updated seed-chat.ps1 that:



Creates a DM chat successfully



Returns chatId



Sends at least one message successfully



6\. Working Rules



This session operates under:

WORKING RULES — NADU v1

