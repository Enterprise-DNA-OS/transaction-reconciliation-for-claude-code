---
description: Read one item, its source data and matching history.
---

Read CLAUDE.md. Read one item, its source data and matching history.

```bash
npm run reconcile -- transaction "<id or external id>"
```

Replace placeholders with verified records. Names are case-insensitive and unique partial IDs work. List ambiguous candidates and ask the operator to choose. Add --json when inspecting complete fields. Every mutation requires the actual operator's --actor.

Present the answer and the unresolved findings. Drafts stay in drafts/. Nothing sends, posts a journal or moves money.
