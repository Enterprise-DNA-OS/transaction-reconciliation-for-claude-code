---
description: Open an investigation for a transaction.
---

Read CLAUDE.md. Open an investigation for a transaction.

```bash
npm run reconcile -- open-case "<transaction>" --title="<issue>" --owner="<owner>" --due=YYYY-MM-DD --actor="<operator>"
```

Replace placeholders with verified records. Names are case-insensitive and unique partial IDs work. List ambiguous candidates and ask the operator to choose. Add --json when inspecting complete fields. Every mutation requires the actual operator's --actor.

Present the answer and the unresolved findings. Drafts stay in drafts/. Nothing sends, posts a journal or moves money.
