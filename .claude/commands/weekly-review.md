---
description: Run the Monday coverage, candidate, attention and owner review.
---

Read CLAUDE.md. Run the Monday coverage, candidate, attention and owner review.

```bash
npm run reconcile -- weekly-review
```

Replace placeholders with verified records. Names are case-insensitive and unique partial IDs work. List ambiguous candidates and ask the operator to choose. Add --json when inspecting complete fields. Every mutation requires the actual operator's --actor.

The CLI combines coverage, candidates and attention, plus the owner backlog. Report movement differences by account and currency, the oldest items and the named next actions. Do not add amounts across currencies.

Present the answer and the unresolved findings. Drafts stay in drafts/. Nothing sends, posts a journal or moves money.
