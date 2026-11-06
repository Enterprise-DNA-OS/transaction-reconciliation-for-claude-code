---
description: Record the investigation conclusion. This does not match or write off a transaction.
---

Read CLAUDE.md. Record the investigation conclusion. This does not match or write off a transaction.

```bash
npm run reconcile -- resolve "<case>" --reason="<evidence and conclusion>" --actor="<operator>"
```

Replace placeholders with verified records. Names are case-insensitive and unique partial IDs work. List ambiguous candidates and ask the operator to choose. Add --json when inspecting complete fields. Every mutation requires the actual operator's --actor.

Present the answer and the unresolved findings. Drafts stay in drafts/. Nothing sends, posts a journal or moves money.
