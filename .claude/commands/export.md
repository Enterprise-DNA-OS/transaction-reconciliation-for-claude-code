---
description: Export all records to JSON and transaction presentation to CSV.
---

Read CLAUDE.md. Export all records to JSON and transaction presentation to CSV.

```bash
npm run reconcile -- export
```

Replace placeholders with verified records. Names are case-insensitive and unique partial IDs work. List ambiguous candidates and ask the operator to choose. Add --json when inspecting complete fields. Every mutation requires the actual operator's --actor.

Present the answer and the unresolved findings. Drafts stay in drafts/. Nothing sends, posts a journal or moves money.
