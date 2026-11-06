---
description: Find repeated references and amounts on the same account side.
---

Read CLAUDE.md. Find repeated references and amounts on the same account side.

```bash
npm run reconcile -- duplicates
```

Replace placeholders with verified records. Names are case-insensitive and unique partial IDs work. List ambiguous candidates and ask the operator to choose. Add --json when inspecting complete fields. Every mutation requires the actual operator's --actor.

Present the answer and the unresolved findings. Drafts stay in drafts/. Nothing sends, posts a journal or moves money.
