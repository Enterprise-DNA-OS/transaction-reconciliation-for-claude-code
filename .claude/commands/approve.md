---
description: Record a second person's review of a proposed match.
---

Read CLAUDE.md. Record a second person's review of a proposed match.

```bash
npm run reconcile -- approve "<match id>" --actor="<reviewer>"
```

Replace placeholders with verified records. Names are case-insensitive and unique partial IDs work. List ambiguous candidates and ask the operator to choose. Add --json when inspecting complete fields. Every mutation requires the actual operator's --actor.

The actor must be the actual reviewer. Never invent another identity to satisfy the independent-review check. The operator must confirm the reviewer and the evidence. These are attributed names, not authenticated identities.

Present the answer and the unresolved findings. Drafts stay in drafts/. Nothing sends, posts a journal or moves money.
