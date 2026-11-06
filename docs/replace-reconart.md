# Replace the daily ReconArt matching desk

ReconArt documents CSV and XLS account-reconciliation exports and configurable export headings. There is no universal fixed CSV schema. This importer consumes a configured CSV export with an explicit mapping, not a fabricated vendor default.

Sources checked 6 November 2026: [CSV exports](https://www.reconart.com/blog/account-reconciliation-for-insurance-boosts-efficiency-with-reconart/) and [report/export configuration](https://www.reconart.com/blog/how-to-transform-financial-reporting-with-reconart-smart-automation/).

## Export and map

1. In ReconArt, use an export template to select each matching account, each side and the agreed complete period. Include stable transaction IDs, booking dates, reference, signed amount and description. Export both matched and outstanding source items for your selected scope. Keep source totals and original exports.
2. Choose CSV. The Matching Grid also documents an Excel export; convert it carefully to UTF-8 CSV and retain the original. Convert dates to YYYY-MM-DD and amounts to signed decimals with no thousands separators, symbols or accounting parentheses. Confirm that both sides use the same economic sign convention. Do not invert a column without understanding it.
3. Copy fixtures/reconart-mapping.json and replace its headings with your actual export headings. Map external_id, booked_on, reference, amount and optionally description. The fixture is an illustrative configured export, not a captured customer export.
4. Create the matching account with its actual currency and jurisdiction, then run one command per side. Inspect the dry run and repeat without --dry-run when counts, totals and mapping agree.

```bash
npm run reconcile -- add-account --name="Our operating account" --currency=NZD --jurisdiction=NZ --owner="Mere" --actor="Mere"
npm run reconcile -- import reconart --file=imports/ledger.csv --mapping=imports/map.json --account="Our operating account" --side=ledger --period-end=2026-10-31 --actor="Mere" --dry-run
```

Use --side=statement for the other file. Currency comes from the chosen account, never from a guessed symbol. Split mixed-currency files before import. Dates later than the entered period end and invalid amounts are rejected. Source IDs must be unique per account and side.

## What comes across

Stable IDs, dates, references, signed amounts, descriptions and all original source columns are retained. The raw CSV is archived with its hash. A repeat is idempotent. A changed record with an existing ID stops the whole import; reverse the affected match and import an explicit correction with a new ID. An unchanged overlap between export periods is retained once.

Existing ReconArt match groups, approvals, attachments, rule definitions, scheduled feeds and audit history are not reconstructed from transaction CSVs. Preserve those exports separately and map them as a migration project. The base supports exact candidate suggestions, explicit equal-total grouped matches and investigations. Enterprise-scale matching volumes and regulated reconciliation certifications require separate assessment.

## Reconcile the switch

Compare account/side counts and signed totals with each source export. Check the complete date range and opening balances separately. Run coverage, candidates, duplicates and compliance. Review every ambiguous suggestion before proposing a match, and have a second real person approve it. Run both processes on a complete sample period and confirm corrections before retiring the old one. Archive original source files and vendor history.

One configured CSV is a one-command import. A whole business migration depends on validated mappings, source completeness and approval history. Enterprise DNA scopes that work with the owner.
