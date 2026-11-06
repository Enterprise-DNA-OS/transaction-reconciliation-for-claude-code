---
description: Reverse a proposal or approved match while keeping the history.
---

Read CLAUDE.md. Reverse a proposal or approved match while keeping the history.

```bash
npm run reconcile -- reverse "<match id>" --reason="<why>" --actor="<operator>"
```

Replace placeholders with verified records. Names are case-insensitive and unique partial IDs work. List ambiguous candidates and ask the operator to choose. Add --json when inspecting complete fields. Every mutation requires the actual operator's --actor.

Present the answer and the unresolved findings. Drafts stay in drafts/. Nothing sends, posts a journal or moves money.
