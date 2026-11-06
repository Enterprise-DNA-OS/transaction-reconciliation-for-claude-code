---
description: Bring a configured ReconArt CSV export across after a dry run.
---

Read CLAUDE.md. Bring a configured ReconArt CSV export across after a dry run.

```bash
npm run reconcile -- import reconart --file="<export.csv>" --mapping="<mapping.json>" --account="<account>" --side=ledger --period-end=YYYY-MM-DD --actor="<operator>" --dry-run
```

Replace placeholders with verified records. Names are case-insensitive and unique partial IDs work. List ambiguous candidates and ask the operator to choose. Add --json when inspecting complete fields. Every mutation requires the actual operator's --actor.

Read docs/replace-reconart.md. Inspect the actual headings and signed amount convention. Confirm the account, side, complete period and control totals. Run the dry run first, then repeat without --dry-run within the authorised import. Compare counts and totals. Never call the illustrative fixture a vendor-standard schema.

Present the answer and the unresolved findings. Drafts stay in drafts/. Nothing sends, posts a journal or moves money.
