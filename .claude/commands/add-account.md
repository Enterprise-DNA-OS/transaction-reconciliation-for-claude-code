---
description: Create an account with its currency, jurisdiction and responsible person.
---

Read CLAUDE.md. Create an account with its currency, jurisdiction and responsible person.

```bash
npm run reconcile -- add-account --name="<account>" --currency=NZD --jurisdiction=NZ --owner="<owner>" --actor="<operator>"
```

Replace placeholders with verified records. Names are case-insensitive and unique partial IDs work. List ambiguous candidates and ask the operator to choose. Add --json when inspecting complete fields. Every mutation requires the actual operator's --actor.

Present the answer and the unresolved findings. Drafts stay in drafts/. Nothing sends, posts a journal or moves money.
