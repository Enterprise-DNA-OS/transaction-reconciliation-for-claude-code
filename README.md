# Transaction Reconciliation for Claude Code

Match ledger movements to statement items, investigate the gaps and keep the evidence in a database you own.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free, MIT. Install and try the demo. | Your exports, matching rules, review controls and documents. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |

[Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=reconart) · [Instead of ReconArt](https://enterprisedna.co/omni/instead-of/reconart?utm_source=github&utm_medium=readme&utm_campaign=reconart)

## Start with the daily review

Node 20 or later.

```bash
git clone https://github.com/Enterprise-DNA-OS/transaction-reconciliation-for-claude-code.git
cd transaction-reconciliation-for-claude-code
npm install
npm test
npm run demo
npm run reconcile -- daily-reconcile
npm run docs
npm run view
```

Open the folder with Claude Code, Codex, OpenCode or Cursor. CLAUDE.md and AGENTS.md use the same 31 slash-command recipes and 29 CLI commands. Every CLI command accepts --json. Names match without case sensitivity, unique partial IDs work, and ambiguous references list candidates and exit 1.

PGlite runs locally without a server. DATABASE_URL selects PostgreSQL. DATA_DIR chooses the embedded database and the source-file archive, including with PostgreSQL. OUTPUT_DIR selects private outputs. Back up the database and DATA_DIR/sources together. The demo is fictional and contains overdue items, short settlements, duplicate references, grouped receipts and NZD/AUD accounts. Never seed a live database. PostgreSQL demo seeding requires ALLOW_DEMO_DATABASE=1.

## Five finance rituals

- /daily-reconcile: compare imported movements, inspect candidate pairs and review outstanding items.
- /match and /approve: propose an equal-total group, then record a different person's review.
- /open-case, /assign, /log and /resolve: investigate differences with an owner, due date and written conclusion.
- /weekly-review: combine coverage, candidates, attention and owner workload for Monday.
- /compliance and /draft-statement: check evidence and prepare the review paperwork.

## Matching you can inspect

Candidate suggestions require the same account, equal signed amounts, matching reference ignoring case/outer spaces and dates within three days. Multiple possible pairs are labelled ambiguous. Suggestions never create or approve a match. Explicit grouped matches support one-to-many and many-to-many settlements with exact signed totals. Different accounts and currencies cannot mix. Unequal amounts remain an investigation; the base never writes them off.

Approvals require a different actor name and no open investigation on a member. Actor names are attribution, not authenticated identity. Use trusted local operators; configure authenticated identities and database roles for shared use. A reversal releases the source items and keeps the old group and review record. Source rows and event notes are immutable through normal database operations. A privileged database owner can bypass controls, so this is not tamper-proof storage.

A zero movement difference is not proof that an account reconciles. Check unmatched items, period completeness and opening balances separately. Values are in integer cents; supported account currencies are NZD, AUD, USD, GBP and EUR, with at most two decimal places. There are no exchange-rate conversions. Owner workload is gross exposure across both sides, not an estimated loss.

## Ten questions this build answers

These are working analyses, not a claim that ReconArt cannot provide custom reports.

1. Which accounts have unexplained differences in their imported movements? Run `coverage`.
2. Which identical references have more than one possible match? Run `candidates`.
3. Which unmatched receipts are more than a week old? Run `aged`.
4. Who owns the oldest investigation and how much work is waiting? Run `owner-load`.
5. Which settlements combine several receipts? Run `matches`.
6. Which proposed matches still need a second reviewer? Run `matches`.
7. Which transactions have no imported source evidence? Run `compliance`.
8. Which source files have changed since we imported them? Run `compliance`.
9. Which references repeat on the same side of an account? Run `duplicates`.
10. Which investigation notes explain why a match was reversed? Run `transaction`.

## Bring your ReconArt records

ReconArt exports have configurable columns. Supply the actual heading map and import one CSV per account and side. The original source file, row data and hash are preserved. A dry run changes nothing. Repeating an unchanged export creates no duplicates. Changed records stop the import instead of overwriting history.

```bash
npm run reconcile -- import reconart --file=fixtures/reconart-ledger.csv --mapping=fixtures/reconart-mapping.json --account="Kauri Wholesale NZ" --side=ledger --period-end=2026-10-31 --actor="Your name" --dry-run
```

The fixtures are illustrative configured exports, not universal vendor headings. Existing vendor matches, approvals and attachments require separate migration. [Export, map and reconcile the switch](docs/replace-reconart.md).

## Documents, views and controls

Edit brand.json for the business name, logo and colours. npm run docs renders reconciliation statements, investigation worksheets and match review records. npm run view renders the daily review, investigation backlog and review controls. /draft-statement and /draft-investigation write individual files to drafts/. Nothing sends or publishes.

/compliance checks source links, archived-file hashes, retention metadata, outstanding reviews and overdue cases. [Legal sources and policy boundaries](docs/compliance.md). Imported files receive a conservative retention marker, and there is no delete command. The free version never moves money, posts journals, connects bank feeds or certifies regulated client-money accounts. [What a screen adds](docs/why-no-front-end.md).

## Your first hour: ten things to ask for

1. Put our business name and logo on the statement.
2. Import one account without saving it.
3. Map the headings in our actual export.
4. Show the oldest unresolved receipts.
5. Explain every ambiguous reference.
6. Group the receipts in one known settlement.
7. Add our evidence reference to investigations.
8. Change the aged-item threshold with a tested migration.
9. Show workloads separately for each currency.
10. Draft the Monday reconciliation review.

/customise changes fields and rules through a tested migration. /new-view adds a read-only report. The operator owns the rules, exports and review process.

## Commands

| Command | Job |
|---|---|
| `accounts` | List the reconciliation accounts and owners. |
| `coverage` | Review imported transaction counts and movement totals by account. |
| `candidates` | Find unique and ambiguous pairs under the exact-reference rule. |
| `matches` | Review proposed, approved and reversed matching groups. |
| `transactions` | Read transactions with their matching status. |
| `transaction` | Read one item, its source data and matching history. |
| `imports` | Review source counts, totals, hashes and retention dates. |
| `exceptions` | Read the investigation register. |
| `attention` | List unmatched items, proposals and overdue investigations. |
| `aged` | Review unmatched and unresolved items older than seven days. |
| `duplicates` | Find repeated references and amounts on the same account side. |
| `owner-load` | Review investigation workload without mixing currencies. |
| `daily-reconcile` | Run the daily coverage, candidate and attention review. |
| `weekly-review` | Run the Monday coverage, candidate, attention and owner review. |
| `compliance` | Check source evidence, retention metadata, archived hashes and independent reviews. |
| `add-account` | Create an account with its currency, jurisdiction and responsible person. |
| `add` | Record a manual transaction with a reason. Missing imported evidence remains a finding. |
| `import` | Bring a configured ReconArt CSV export across after a dry run. |
| `match` | Propose an exact-total group from the recorded source items. |
| `approve` | Record a second person's review of a proposed match. |
| `reverse` | Reverse a proposal or approved match while keeping the history. |
| `open-case` | Open an investigation for a transaction. |
| `assign` | Reassign an open investigation and its due date. |
| `resolve` | Record the investigation conclusion. This does not match or write off a transaction. |
| `log` | Append a note to an account, transaction, match or case. |
| `export` | Export all records to JSON and transaction presentation to CSV. |
| `draft-statement` | Write a reconciliation movement statement for internal review. |
| `draft-investigation` | Write a case worksheet with notes and source details. |
| `help` | Read the available CLI commands. |

## Verification and price context

npm test uses a temporary database and exercises all 29 CLI commands, including exact and grouped matches, ambiguity, cross-account rejection, independent review, open-case blocking, reversal history, invalid imports, rollback, repeats, altered source files, exports and escaped documents. The workflow runs Node 20/22 on Windows/Linux and PostgreSQL 17. Read the actual workflow results before claiming a platform passed. TEST_DATABASE_URL must be an empty disposable database.

ReconArt now quotes its annual editions privately. A reseller listing annualises to five figures; this is not a current vendor quote or a verified NZ/AU customer invoice. [Selection evidence and all six scores](docs/research.md).

Enterprise DNA maps agreed exports, configures your review controls and runs your version through Omni by Enterprise DNA, for one setup fee then a retainer. [Book 30 minutes with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=reconart).

MIT. Not affiliated with ReconArt or Anthropic. Hosting, storage and coding-agent usage have their own costs.
