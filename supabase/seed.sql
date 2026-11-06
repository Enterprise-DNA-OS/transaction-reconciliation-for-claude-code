do $$
declare nz uuid; au uuid; nz2 uuid; tx uuid;
begin
 if exists(select 1 from accounts where name='Kauri Wholesale NZ') then return; end if;
 insert into accounts(name,currency,jurisdiction,owner) values('Kauri Wholesale NZ','NZD','NZ','Mere') returning id into nz;
 insert into accounts(name,currency,jurisdiction,owner) values('Kauri Wholesale AU','AUD','AU','Priya') returning id into au;
 insert into accounts(name,currency,jurisdiction,owner) values('Kauri Reserve NZ','NZD','NZ','Sione') returning id into nz2;
 insert into transactions(account_id,side,external_id,booked_on,reference,description,amount_cents,source_row) values
 (nz,'ledger','L-100',current_date-2,'SALE-100','Shop receipts',125050,'{"demo":true}'),
 (nz,'statement','S-100',current_date-1,'SALE-100','Bank settlement',125050,'{"demo":true}'),
 (nz,'ledger','L-200',current_date-20,'SALE-200','Older receipt with short settlement',80000,'{"demo":true}'),
 (nz,'statement','S-200',current_date-19,'SALE-200','Short settlement',79500,'{"demo":true}'),
 (nz,'ledger','L-300',current_date-4,'DUP-300','First identical amount',42000,'{"demo":true}'),
 (nz,'ledger','L-301',current_date-4,'DUP-300','Second identical amount',42000,'{"demo":true}'),
 (nz,'statement','S-300',current_date-3,'DUP-300','Ambiguous receipt',42000,'{"demo":true}'),
 (nz,'ledger','L-400',current_date-2,'BATCH-400','First part of batch',30000,'{"demo":true}'),
 (nz,'ledger','L-401',current_date-2,'BATCH-400','Second part of batch',20000,'{"demo":true}'),
 (nz,'statement','S-400',current_date-1,'BATCH-400','Combined settlement',50000,'{"demo":true}'),
 (nz,'ledger','L-500',current_date-40,'REFUND-500','Refund not yet on statement',-6500,'{"demo":true}'),
 (au,'ledger','AU-L-100',current_date-2,'SALE-100','Australian receipts',125050,'{"demo":true}'),
 (au,'statement','AU-S-100',current_date-1,'SALE-100','Australian settlement',125050,'{"demo":true}'),
 (au,'statement','AU-S-900',current_date-11,'FEE-900','Unrecorded bank fee',-1500,'{"demo":true}');
 select id into tx from transactions where external_id='L-200' and account_id=nz;
 insert into cases(transaction_id,title,owner,due_on) values(tx,'Investigate short settlement','Mere',current_date-5);
 insert into events(entity_type,entity_id,action,actor,detail) values('account',nz,'demo seeded','Demo','{"fictional":true}');
end $$;
