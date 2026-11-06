---
description: Propose an exact-total group from the recorded source items.
---

Read CLAUDE.md. Propose an exact-total group from the recorded source items.

```bash
npm run reconcile -- match --ledger="<id>,<id>" --statement="<id>" --reason="<matching evidence>" --actor="<operator>"
```

Replace placeholders with verified records. Names are case-insensitive and unique partial IDs work. List ambiguous candidates and ask the operator to choose. Add --json when inspecting complete fields. Every mutation requires the actual operator's --actor.

Read every source item first. Candidates are suggestions only. Ambiguity needs the operator's evidence, never an arbitrary first choice. Different amounts stay as an investigation. No tolerance or write-off.

Present the answer and the unresolved findings. Drafts stay in drafts/. Nothing sends, posts a journal or moves money.
