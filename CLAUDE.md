# Transaction Reconciliation for Claude Code

For the finance operator who matches ledger movements to bank or processor statements and investigates the items left over. The fictional demo is Kauri Wholesale, with NZD and AUD accounts.

## Work from evidence

Read the CLI before answering. Use the exact account and currency. The database stores signed amounts in integer cents. Transaction totals are movements, not opening or closing balances. Do not claim an account reconciles because its difference is zero if unmatched items or missing source periods remain.

## Routing

| Command | Job |
|---|---|
| /accounts | List the reconciliation accounts and owners. |
| /coverage | Review imported transaction counts and movement totals by account. |
| /candidates | Find unique and ambiguous pairs under the exact-reference rule. |
| /matches | Review proposed, approved and reversed matching groups. |
| /transactions | Read transactions with their matching status. |
| /transaction | Read one item, its source data and matching history. |
| /imports | Review source counts, totals, hashes and retention dates. |
| /exceptions | Read the investigation register. |
| /attention | List unmatched items, proposals and overdue investigations. |
| /aged | Review unmatched and unresolved items older than seven days. |
| /duplicates | Find repeated references and amounts on the same account side. |
| /owner-load | Review investigation workload without mixing currencies. |
| /daily-reconcile | Run the daily coverage, candidate and attention review. |
| /weekly-review | Run the Monday coverage, candidate, attention and owner review. |
| /compliance | Check source evidence, retention metadata, archived hashes and independent reviews. |
| /add-account | Create an account with its currency, jurisdiction and responsible person. |
| /add | Record a manual transaction with a reason. Missing imported evidence remains a finding. |
| /import | Bring a configured ReconArt CSV export across after a dry run. |
| /match | Propose an exact-total group from the recorded source items. |
| /approve | Record a second person's review of a proposed match. |
| /reverse | Reverse a proposal or approved match while keeping the history. |
| /open-case | Open an investigation for a transaction. |
| /assign | Reassign an open investigation and its due date. |
| /resolve | Record the investigation conclusion. This does not match or write off a transaction. |
| /log | Append a note to an account, transaction, match or case. |
| /export | Export all records to JSON and transaction presentation to CSV. |
| /draft-statement | Write a reconciliation movement statement for internal review. |
| /draft-investigation | Write a case worksheet with notes and source details. |
| /help | Read the available CLI commands. |

/customise writes and tests a new migration. /new-view adds a read-only report. Recipes live only in .claude/commands. Claude Code, Codex, OpenCode and Cursor use the same database and instructions.

## Limits

- Every mutation requires the actual operator's --actor. Names are attribution, not authentication. Never impersonate a reviewer.
- Source rows and events are immutable through database triggers. Correct history with a new explicit source item and reverse the affected match. Never silently overwrite a transaction.
- Review candidate ambiguity. Propose a match only on recorded evidence. Equal totals alone do not prove an economic match.
- A different reviewer approves. Open investigations block approval. Resolve records only with a written conclusion. Never mark an item matched to clear a report.
- No payments, bank feeds, journal posting, regulated client-money certification, sends or deletions.
- Import requires a CSV, a verified column map, an account, a side and a period end. Read docs/replace-reconart.md before changing a map. Dry run before a real import.
- Never seed a working database. npm test uses a temporary database. TEST_DATABASE_URL must point to an empty disposable PostgreSQL database.
- All generated exports, views and documents are private. A named logo is a local brand setting. Read docs/compliance.md for retention and hosting requirements.

## Files

scripts/reconcile.mjs is the one CLI. supabase/migrations holds ordered migrations. DATABASE_URL chooses PostgreSQL, otherwise DATA_DIR chooses the embedded PGlite database. DATA_DIR/sources holds archived source files for either backend. OUTPUT_DIR chooses private output storage. Back up the database and source archive together.

Trust only authorised database operators. The base does not implement user authentication. A shared deployment needs authenticated identities, database roles, access controls and operational backups. Attributed history is not a tamper-proof audit service.

Built and run through Omni by Enterprise DNA: https://enterprisedna.co/omni/book/?offer=replace-software&utm_medium=readme&utm_campaign=reconart
