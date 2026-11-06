---
description: Record a manual transaction with a reason. Missing imported evidence remains a finding.
---

Read CLAUDE.md. Record a manual transaction with a reason. Missing imported evidence remains a finding.

```bash
npm run reconcile -- add --account="<account>" --side=ledger --id="<source id>" --date=YYYY-MM-DD --reference="<reference>" --amount=10.25 --reason="<evidence and purpose>" --actor="<operator>"
```

Replace placeholders with verified records. Names are case-insensitive and unique partial IDs work. List ambiguous candidates and ask the operator to choose. Add --json when inspecting complete fields. Every mutation requires the actual operator's --actor.

Present the answer and the unresolved findings. Drafts stay in drafts/. Nothing sends, posts a journal or moves money.
