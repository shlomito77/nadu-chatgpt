📘 docs/WORKING\_RULES.md



Title: NADU — Working Rules v1

Status: Binding / Active

Audience: Human + AI collaborators

Language: English only

Scope: All project work, all chats, all tools



NADU — WORKING RULES v1

Purpose



These rules exist to guarantee continuity, correctness, and production-grade discipline when building NADU across many conversations, tools, and environments.



They are mandatory unless explicitly overridden.



1\. No Assumptions Rule



If something is not written, it is not assumed.



Ambiguity must be marked as OPEN and clarified before implementation.



Guessing is forbidden.



2\. Full-File Replacement Rule (Critical)



If a change is required in any file:



ChatGPT must provide the entire updated file, end-to-end.



The user will paste it as a single block.



❌ No partial edits



❌ No “replace line X”



❌ No “add below Y”



This rule prevents drift, merge bugs, and silent corruption.



3\. Single Source of Truth



The Git repository is the source of truth.



Chat history is not a source of truth.



Documentation under /docs is authoritative.



4\. One Session = One Task



Each chat session works on one task only.



If scope changes → open a new chat with a handoff.



Parallel problem solving inside one chat is forbidden.



5\. Locked Artifacts



The following are locked and must not be changed unless explicitly approved:



docs/00\_MASTER\_CONTEXT.md



Firestore Security Rules (v1)



Core architectural principles (Chat-first, no anonymous users, PAYG)



6\. Output Contract



Every response must clearly state:



What was done



Current status



Next concrete step



7\. Language Policy



All permanent artifacts: English only



Conversations: Any language (Hebrew allowed and expected)



Authority



These rules are binding for all future work on NADU.



📎 docs/HANDOFF\_TEMPLATE.md



Title: NADU — Session Handoff

Purpose: Portable project memory

Language: English only

