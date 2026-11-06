---
description: Write a reconciliation movement statement for internal review.
---

Read CLAUDE.md. Write a reconciliation movement statement for internal review.

```bash
npm run reconcile -- draft-statement "<account>"
```

Replace placeholders with verified records. Names are case-insensitive and unique partial IDs work. List ambiguous candidates and ask the operator to choose. Add --json when inspecting complete fields. Every mutation requires the actual operator's --actor.

Present the answer and the unresolved findings. Drafts stay in drafts/. Nothing sends, posts a journal or moves money.
