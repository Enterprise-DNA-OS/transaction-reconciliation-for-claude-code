---
description: Append a note to an account, transaction, match or case.
---

Read CLAUDE.md. Append a note to an account, transaction, match or case.

```bash
npm run reconcile -- log "<record>" --type=case --note="<note>" --actor="<operator>"
```

Replace placeholders with verified records. Names are case-insensitive and unique partial IDs work. List ambiguous candidates and ask the operator to choose. Add --json when inspecting complete fields. Every mutation requires the actual operator's --actor.

Present the answer and the unresolved findings. Drafts stay in drafts/. Nothing sends, posts a journal or moves money.
