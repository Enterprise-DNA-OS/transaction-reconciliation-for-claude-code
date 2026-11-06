---
description: Reassign an open investigation and its due date.
---

Read CLAUDE.md. Reassign an open investigation and its due date.

```bash
npm run reconcile -- assign "<case>" --owner="<owner>" --due=YYYY-MM-DD --actor="<operator>"
```

Replace placeholders with verified records. Names are case-insensitive and unique partial IDs work. List ambiguous candidates and ask the operator to choose. Add --json when inspecting complete fields. Every mutation requires the actual operator's --actor.

Present the answer and the unresolved findings. Drafts stay in drafts/. Nothing sends, posts a journal or moves money.
