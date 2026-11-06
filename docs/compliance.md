# Evidence and review controls

Sources checked 6 November 2026. These checks support record keeping; they do not certify accounts, perform tax calculations or operate a regulated payment service.

| Rule | Implemented check | Basis |
|---|---|---|
| SOURCE | Every manually entered transaction remains flagged until its evidence is dealt with outside this base. Imported items link to the original source rows and file hash. | Evidence policy supporting the NZ and AU record duties below. |
| FILE | Rehash every archived CSV and flag changed or missing bytes. | Local evidence integrity policy. Hashes do not prove the supplier file was correct. |
| RETENTION | Source metadata cannot end retention less than seven years beyond the entered period end. Import uses seven years after the next March year end for NZ or June year end for AU. | Conservative local policy, not a calculation of every legal disposal date. |
| REVIEW | Proposals need a different named reviewer. Open investigations block approval. | Local separation-of-duties policy. No claim that this exact rule is statutory. |
| CASE | Flag open cases past their entered due date. | Operator-set deadlines and a local seven-day aged-item threshold. |

New Zealand Inland Revenue requires business records for at least seven tax years, including electronic records. English or Māori and approval for offshore storage are also relevant. This base does not inspect language or verify hosting approval. Confirm tax balance dates, extensions and storage approval with the responsible adviser. [IRD record keeping](https://www.ird.govt.nz/managing-my-tax/record-keeping).

Australian Government guidance says most business records need five years from the later of obtaining the records or completing the related transactions or actions. Some, including company records, need seven years. The base keeps a conservative seven-year minimum policy but does not know when every related action was completed. Extend retention where required and keep holds outside this calculation. [Australian Government record keeping](https://business.gov.au/finance/payments-and-invoicing/record-keeping).

There is no delete or automatic disposal command. A retention date is a minimum review marker, never permission to destroy evidence. Keep original bank statements, period completeness checks, approvals and any longer retention requirements. Database triggers protect normal edits; a database owner can bypass them. Actor names are not independently authenticated. Use trusted operators locally, and configure identity, restricted roles, backups and access monitoring for shared use.

The demo deliberately contains manual records, so SOURCE findings are expected. A zero currency difference is not proof of completeness. Matching does not send money or post to the ledger.
