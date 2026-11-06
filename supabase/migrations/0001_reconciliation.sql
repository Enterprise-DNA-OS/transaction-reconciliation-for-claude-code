create table accounts (
 id uuid primary key default gen_random_uuid(), name text not null unique,
 currency text not null check(currency in ('NZD','AUD','USD','GBP','EUR')),
 jurisdiction text not null check(jurisdiction in ('NZ','AU')),
 owner text not null check(length(trim(owner))>0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table imports (
 id uuid primary key default gen_random_uuid(), account_id uuid not null references accounts,
 side text not null check(side in ('ledger','statement')), source_name text not null,
 sha256 text not null check(sha256 ~ '^[0-9a-f]{64}$'), mapping jsonb not null,
 row_count integer not null check(row_count>0), total_cents bigint not null,
 period_end date not null, retain_until date not null, actor text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(account_id,side,sha256), check(retain_until >= period_end + interval '7 years')
);
create table transactions (
 id uuid primary key default gen_random_uuid(), account_id uuid not null references accounts,
 import_id uuid references imports, side text not null check(side in ('ledger','statement')),
 external_id text not null check(length(trim(external_id))>0), booked_on date not null,
 reference text not null check(length(trim(reference))>0), description text not null default '',
 amount_cents bigint not null check(abs(amount_cents)<=9000000000000), source_row jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(account_id,side,external_id)
);
create table matches (
 id uuid primary key default gen_random_uuid(), account_id uuid not null references accounts,
 status text not null default 'proposed' check(status in ('proposed','approved','reversed')),
 reason text not null check(length(trim(reason))>0), proposed_by text not null,
 approved_by text, approved_at timestamptz, reversed_by text, reversed_at timestamptz,
 reversal_reason text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(approved_by is null or lower(trim(approved_by)) <> lower(trim(proposed_by))),
 check(status <> 'approved' or (approved_by is not null and approved_at is not null)),
 check(status <> 'reversed' or (reversed_by is not null and reversal_reason is not null))
);
create table match_members (
 id uuid primary key default gen_random_uuid(), match_id uuid not null references matches,
 transaction_id uuid not null references transactions, active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(match_id,transaction_id)
);
create unique index one_active_match on match_members(transaction_id) where active;
create table cases (
 id uuid primary key default gen_random_uuid(), transaction_id uuid not null references transactions,
 title text not null check(length(trim(title))>0), owner text not null check(length(trim(owner))>0),
 due_on date not null, status text not null default 'open' check(status in ('open','resolved')),
 resolution text, resolved_by text, resolved_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(status <> 'resolved' or (resolution is not null and resolved_by is not null and resolved_at is not null))
);
create unique index one_open_case on cases(transaction_id) where status='open';
create table events (
 id uuid primary key default gen_random_uuid(), entity_type text not null, entity_id uuid not null,
 action text not null, actor text not null check(length(trim(actor))>0), detail jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create function touch_updated() returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end $$;
create function immutable_record() returns trigger language plpgsql as $$
begin raise exception 'Source records and events are immutable; import a correction with a new external id'; end $$;
do $$ declare tab text; begin
 foreach tab in array array['accounts','imports','transactions','matches','match_members','cases','events'] loop
 execute format('create trigger updated before update on %I for each row execute function touch_updated()',tab);
 execute format('alter table %I enable row level security',tab);
 execute format('revoke all on %I from public',tab);
 end loop;
 foreach tab in array array['imports','transactions','events'] loop
 execute format('create trigger immutable before update or delete on %I for each row execute function immutable_record()',tab);
 end loop;
end $$;
create view transaction_status as
 select t.*,a.name account,a.currency,a.owner account_owner,
 m.id match_id,coalesce(m.status,'unmatched') match_status,
 c.id case_id,c.title case_title,c.owner case_owner,c.due_on
 from transactions t join accounts a on a.id=t.account_id
 left join match_members mm on mm.transaction_id=t.id and mm.active
 left join matches m on m.id=mm.match_id
 left join cases c on c.transaction_id=t.id and c.status='open';
create view match_candidates as
 with pairs as (
 select l.id ledger_id,s.id statement_id,l.account_id,l.account,l.currency,l.reference,l.amount_cents,
 abs(l.booked_on-s.booked_on) date_gap,
 count(*) over(partition by l.id) ledger_choices,count(*) over(partition by s.id) statement_choices
 from transaction_status l join transaction_status s on s.account_id=l.account_id
 and s.side='statement' and l.side='ledger' and s.match_status='unmatched' and l.match_status='unmatched'
 and lower(trim(s.reference))=lower(trim(l.reference)) and s.amount_cents=l.amount_cents
 and abs(s.booked_on-l.booked_on)<=3)
 select *,case when ledger_choices=1 and statement_choices=1 then 'unique' else 'ambiguous' end decision from pairs;
create view account_coverage as
 select a.id,a.name account,a.currency,a.owner,
 count(t.id)::int transactions,
 count(t.id) filter(where t.match_status='unmatched')::int unmatched,
 count(t.id) filter(where t.match_status='proposed')::int proposed,
 count(t.id) filter(where t.match_status='approved')::int approved,
 coalesce(sum(t.amount_cents) filter(where t.side='ledger'),0)::bigint ledger_cents,
 coalesce(sum(t.amount_cents) filter(where t.side='statement'),0)::bigint statement_cents,
 (coalesce(sum(t.amount_cents) filter(where t.side='ledger'),0)-coalesce(sum(t.amount_cents) filter(where t.side='statement'),0))::bigint difference_cents
 from accounts a left join transaction_status t on t.account_id=a.id group by a.id;
create view attention_queue as
 select t.id,t.account,t.currency,t.side,t.reference,t.amount_cents,
 current_date-t.booked_on age_days,t.match_status,coalesce(t.case_owner,t.account_owner) owner,
 t.case_title,t.due_on,
 case when t.due_on<current_date then 'overdue investigation' when t.match_status='proposed' then 'needs independent review'
 when current_date-t.booked_on>7 then 'unmatched over seven days' else 'unmatched' end issue
 from transaction_status t where t.match_status<>'approved' or t.case_id is not null;
create view owner_backlog as
 select owner,currency,count(*)::int items,max(age_days) oldest_days,
 count(*) filter(where due_on<current_date)::int overdue_cases,
 sum(abs(amount_cents))::bigint gross_cents
 from attention_queue group by owner,currency;
create view duplicate_references as
 select account,account_id,currency,side,lower(trim(reference)) reference,amount_cents,count(*)::int occurrences
 from transaction_status group by account,account_id,currency,side,lower(trim(reference)),amount_cents having count(*)>1;
create view compliance_findings as
 select 'SOURCE' rule,t.id record_id,a.name account,'Missing imported source evidence' finding
 from transactions t join accounts a on a.id=t.account_id where t.import_id is null
 union all
 select 'RETENTION',i.id,a.name,'Retention ends before the seven-year evidence policy'
 from imports i join accounts a on a.id=i.account_id where i.retain_until<i.period_end+interval '7 years'
 union all
 select 'REVIEW',m.id,a.name,'Match awaits an independent reviewer'
 from matches m join accounts a on a.id=m.account_id where m.status='proposed'
 union all
 select 'CASE',c.id,a.name,'Investigation is overdue'
 from cases c join transactions t on t.id=c.transaction_id join accounts a on a.id=t.account_id
 where c.status='open' and c.due_on<current_date;
