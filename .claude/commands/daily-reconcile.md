---
description: Run the daily coverage, candidate and attention review.
---

Read CLAUDE.md. Run the daily coverage, candidate and attention review.

```bash
npm run reconcile -- daily-reconcile
```

Replace placeholders with verified records. Names are case-insensitive and unique partial IDs work. List ambiguous candidates and ask the operator to choose. Add --json when inspecting complete fields. Every mutation requires the actual operator's --actor.

Present the answer and the unresolved findings. Drafts stay in drafts/. Nothing sends, posts a journal or moves money.
