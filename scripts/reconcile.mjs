#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { getDb, REPO_ROOT, dataDir } from './lib/db.mjs';
import { parseCsv } from './lib/csv.mjs';
import { table } from './lib/format.mjs';
import { page, table as htmlTable, writeOut } from './lib/render.mjs';

export const commands = ['help','accounts','transactions','transaction','imports','coverage','candidates','matches','exceptions','attention','aged','duplicates','owner-load','daily-reconcile','weekly-review','compliance','add-account','add','import','match','approve','reverse','open-case','assign','resolve','log','export','draft-statement','draft-investigation'];
const mutations = new Set(['add-account','add','import','match','approve','reverse','open-case','assign','resolve','log']);
export function options(args) {
 const pos=[],opts={};
 for(const arg of args) {
  if(!arg.startsWith('--')) {pos.push(arg);continue;}
  const eq=arg.indexOf('='); const key=arg.slice(2,eq<0?undefined:eq);
  if(key in opts) throw Error(`Duplicate option --${key}`);
  opts[key]=eq<0?true:arg.slice(eq+1);
 }
 return {pos,opts};
}
function required(o,k) { if(typeof o[k]!=='string'||!o[k].trim()) throw Error(`Required: --${k}=value`); return o[k].trim(); }
export function cents(v) {
 if(!/^-?\d{1,10}(\.\d{1,2})?$/.test(String(v))) throw Error('Amount must be a signed decimal with at most two places, no separators');
 const [a,b='']=String(v).replace('-','').split('.'); const n=Number(a)*100+Number(b.padEnd(2,'0'));
 if(!Number.isSafeInteger(n)||n>9000000000000) throw Error('Amount is outside the supported range');
 return String(v).startsWith('-')?-n:n;
}
export function date(v) { if(!/^\d{4}-\d{2}-\d{2}$/.test(String(v))||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v) throw Error('Date must be a valid YYYY-MM-DD');return v; }
function today(){return new Date().toISOString().slice(0,10);}
async function audit(db,type,id,action,actor,detail){await db.query('insert into events(entity_type,entity_id,action,actor,detail) values($1,$2,$3,$4,$5)',[type,id,action,actor,JSON.stringify(detail)]);}
async function selectOne(db,kind,ref) {
 if(!ref) throw Error(`Supply a ${kind} reference`);
 const specs={account:['accounts','name'],transaction:['transactions','external_id'],match:['matches','reason'],case:['cases','title']};
 const [tab,col]=specs[kind]; const all=await db.query(`select * from ${tab} order by created_at,id`);
 const q=String(ref).toLowerCase();let rows=all.filter(r=>r.id===ref||String(r[col]).toLowerCase()===q);
 if(rows.length!==1) rows=all.filter(r=>r.id.startsWith(q)||String(r[col]).toLowerCase().includes(q));
 if(rows.length!==1) throw Error(`${kind} reference ${JSON.stringify(ref)} ${rows.length?'is ambiguous':'was not found'}. Candidates: ${(rows.length?rows:all).map(r=>`${r.id} ${r[col]}`).join('; ')}`);
 return rows[0];
}
async function lockAccount(db,id){await db.query('select id from accounts where id=$1 for update',[id]);}
const queries={
 accounts:'select id,name,currency,jurisdiction,owner from accounts order by name',
 transactions:'select id,account,side,external_id,booked_on,reference,currency,amount_cents,match_status from transaction_status order by account,booked_on,external_id',
 imports:'select i.id,a.name account,i.side,i.source_name,i.row_count,i.total_cents,i.period_end,i.retain_until,i.sha256 from imports i join accounts a on a.id=i.account_id order by i.created_at',
 coverage:'select * from account_coverage order by account',
 candidates:'select account,reference,currency,amount_cents,date_gap,decision,ledger_id,statement_id from match_candidates order by account,reference,ledger_id',
 matches:'select m.id,a.name account,a.currency,m.status,m.reason,m.proposed_by,m.approved_by,m.reversal_reason from matches m join accounts a on a.id=m.account_id order by m.created_at',
 exceptions:'select c.id,a.name account,t.external_id,c.title,c.owner,c.due_on,c.status,c.resolution from cases c join transactions t on t.id=c.transaction_id join accounts a on a.id=t.account_id order by c.due_on',
 attention:'select account,side,reference,currency,amount_cents,age_days,owner,issue from attention_queue order by age_days desc,account,reference,side',
 aged:"select account,side,reference,currency,amount_cents,age_days,owner from attention_queue where age_days>7 order by age_days desc,account,reference",
 duplicates:'select * from duplicate_references order by account,reference',
 'owner-load':'select * from owner_backlog order by owner,currency',
 compliance:'select * from compliance_findings order by rule,account,record_id'
};
async function verifySources(db){
 const problems=[];
 for(const r of await db.query('select id,sha256 from imports')){
  const file=path.join(dataDir(),'sources',r.sha256+'.csv');
  if(!fs.existsSync(file))problems.push({rule:'FILE',record_id:r.id,finding:'Archived source file missing'});
  else if(createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==r.sha256)problems.push({rule:'FILE',record_id:r.id,finding:'Archived source hash changed'});
 }
 return problems;
}
export async function run(db,args){
 const {pos,opts:o}=options(args);const cmd=pos[0]||'help';
 if(!commands.includes(cmd))throw Error(`Unknown command ${cmd}. Run help.`);
 const allowed={
 'add-account':['name','currency','jurisdiction','owner'],add:['account','side','id','date','reference','description','amount','reason'],import:['file','mapping','account','side','period-end','dry-run'],
 match:['ledger','statement','reason'],approve:[],reverse:['reason'],'open-case':['title','owner','due'],assign:['owner','due'],resolve:['reason'],log:['type','note'],export:[]
 };
 const general=['json',...(mutations.has(cmd)?['actor']:[])];
 for(const key of Object.keys(o))if(![...general,...(allowed[cmd]||[])].includes(key))throw Error(`Unknown option --${key} for ${cmd}`);
 const expectedPos = ['transaction','approve','reverse','open-case','assign','resolve','log','draft-statement','draft-investigation','import'].includes(cmd)?2:1;
 if(pos.length>expectedPos)throw Error('Unexpected positional argument; quote names containing spaces');
 if(cmd==='help')return commands.map(command=>({command}));
 const actor=mutations.has(cmd)?required(o,'actor'):null;
 await db.exec(mutations.has(cmd)?'BEGIN ISOLATION LEVEL SERIALIZABLE':'BEGIN READ ONLY');
 try {
 let out;
 if(queries[cmd]){out=await db.query(queries[cmd]);if(cmd==='compliance')out.push(...await verifySources(db));}
 else if(cmd==='transaction'){
  const t=await selectOne(db,'transaction',pos[1]);
  out={transaction:(await db.query('select * from transaction_status where id=$1',[t.id]))[0],events:await db.query("select * from events where entity_id=$1 order by created_at",[t.id]),cases:await db.query('select c.* from cases c where c.transaction_id=$1 order by c.created_at',[t.id]),case_events:await db.query('select e.* from events e join cases c on c.id=e.entity_id where c.transaction_id=$1 order by e.created_at',[t.id]),matches:await db.query('select m.* from matches m join match_members mm on mm.match_id=m.id where mm.transaction_id=$1 order by m.created_at',[t.id])};
 }else if(cmd==='daily-reconcile'||cmd==='weekly-review'){
  out={coverage:await db.query(queries.coverage),candidates:await db.query(queries.candidates),attention:await db.query(queries.attention)};
  if(cmd==='weekly-review')out.owners=await db.query(queries['owner-load']);
 }else if(cmd==='add-account'){
  const currency=required(o,'currency').toUpperCase(),jurisdiction=required(o,'jurisdiction').toUpperCase();
  out=(await db.query('insert into accounts(name,currency,jurisdiction,owner) values($1,$2,$3,$4) returning *',[required(o,'name'),currency,jurisdiction,required(o,'owner')]))[0];
  await audit(db,'account',out.id,'created',actor,{name:out.name});
 }else if(cmd==='add'){
  const a=await selectOne(db,'account',required(o,'account'));await lockAccount(db,a.id);
  const booked=date(required(o,'date'));if(booked>today())throw Error('Future-dated source transactions require separate review');
  out=(await db.query('insert into transactions(account_id,side,external_id,booked_on,reference,description,amount_cents,source_row) values($1,$2,$3,$4,$5,$6,$7,$8) returning *',[a.id,required(o,'side'),required(o,'id'),booked,required(o,'reference'),o.description||'',cents(required(o,'amount')),JSON.stringify({manual:true,reason:required(o,'reason')})]))[0];
  await audit(db,'transaction',out.id,'manual entry',actor,{reason:o.reason});
 }else if(cmd==='import'){
  if(pos[1]!=='reconart')throw Error('Use import reconart');
  const a=await selectOne(db,'account',required(o,'account'));await lockAccount(db,a.id);
  const side=required(o,'side');if(!['ledger','statement'].includes(side))throw Error('Side must be ledger or statement');
  const file=path.resolve(required(o,'file'));const raw=fs.readFileSync(file);const sha=createHash('sha256').update(raw).digest('hex');
  const map=JSON.parse(fs.readFileSync(required(o,'mapping'),'utf8'));
  for(const k of ['external_id','booked_on','reference','amount'])if(typeof map[k]!=='string'||!map[k].trim())throw Error(`Mapping requires ${k}`);
  const period=date(required(o,'period-end'));if(period>today())throw Error('Period end cannot be in the future');
  const rows=parseCsv(raw.toString('utf8'));if(!rows.length)throw Error('Export contains no data rows');
  const prepared=rows.map((r,i)=>{
   for(const k of Object.values(map))if(!(k in r))throw Error(`Row ${i+2}: missing mapped column ${k}`);
   const booked=date(r[map.booked_on]);if(booked>period)throw Error(`Row ${i+2}: date after period end`);
   if(!r[map.external_id].trim()||!r[map.reference].trim())throw Error(`Row ${i+2}: missing id or reference`);
   return {external_id:r[map.external_id].trim(),booked_on:booked,reference:r[map.reference].trim(),amount_cents:cents(r[map.amount]),description:map.description?r[map.description]:'',source_row:r};
  });
  if(new Set(prepared.map(r=>r.external_id)).size!==prepared.length)throw Error('Duplicate source id in file');
  const prior=(await db.query('select * from imports where account_id=$1 and side=$2 and sha256=$3',[a.id,side,sha]))[0];
  if(prior){
   if(JSON.stringify(prior.mapping)!==JSON.stringify(JSON.parse(JSON.stringify(map,Object.keys(map).sort())))){
    const keys=Object.keys(map);if(keys.length!==Object.keys(prior.mapping).length||keys.some(k=>map[k]!==prior.mapping[k]))throw Error('Existing source was imported with a different mapping');
   }
   if(prior.period_end!==period)throw Error('Existing source has a different period end');
   out={repeated:true,inserted:0,source_rows:prior.row_count};
  }else{
   const total=prepared.reduce((n,r)=>n+BigInt(r.amount_cents),0n);if(total>9000000000000000n||total< -9000000000000000n)throw Error('Source total exceeds supported range');
   const unseen=[];
   for(const r of prepared){
    const old=(await db.query('select * from transactions where account_id=$1 and side=$2 and external_id=$3',[a.id,side,r.external_id]))[0];
    if(old){if(old.booked_on!==r.booked_on||old.reference!==r.reference||Number(old.amount_cents)!==r.amount_cents||old.description!==r.description||JSON.stringify(Object.entries(old.source_row).sort())!==JSON.stringify(Object.entries(r.source_row).sort()))throw Error(`Source id ${r.external_id} changed; preserve history and import an explicit correction with a new id`);}
    else unseen.push(r);
   }
   // Conservative evidence policy: seven years beyond this period's tax-year end.
   const year=Number(period.slice(0,4));const yearEnd=a.jurisdiction==='NZ'?'03-31':'06-30';const taxEnd=`${period.slice(5)>yearEnd?year+1:year}-${yearEnd}`;
   const retain=`${Number(taxEnd.slice(0,4))+7}-${yearEnd}`;
   out={dry_run:!!o['dry-run'],inserted:unseen.length,source_rows:rows.length,source_total_cents:Number(total),currency:a.currency,retain_until:retain,sha256:sha};
   if(!o['dry-run']){
    const archive=path.join(dataDir(),'sources');fs.mkdirSync(archive,{recursive:true,mode:0o700});const archived=path.join(archive,sha+'.csv');
    if(fs.existsSync(archived)&&createHash('sha256').update(fs.readFileSync(archived)).digest('hex')!==sha)throw Error('Archived source hash mismatch; investigate before import');
    if(!fs.existsSync(archived))fs.writeFileSync(archived,raw,{mode:0o600,flag:'wx'});
    const b=(await db.query('insert into imports(account_id,side,source_name,sha256,mapping,row_count,total_cents,period_end,retain_until,actor) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning id',[a.id,side,path.basename(file),sha,JSON.stringify(map),rows.length,String(total),period,retain,actor]))[0];
    for(const r of unseen)await db.query('insert into transactions(account_id,import_id,side,external_id,booked_on,reference,description,amount_cents,source_row) values($1,$2,$3,$4,$5,$6,$7,$8,$9)',[a.id,b.id,side,r.external_id,r.booked_on,r.reference,r.description,r.amount_cents,JSON.stringify(r.source_row)]);
    await audit(db,'import',b.id,'imported',actor,out);out.import_id=b.id;
   }
  }
 }else if(cmd==='match'){
  const left=required(o,'ledger').split(','),right=required(o,'statement').split(',');
  const records=[];for(const ref of [...left,...right])records.push(await selectOne(db,'transaction',ref));
  if(new Set(records.map(r=>r.id)).size!==records.length)throw Error('A transaction may appear only once in a match');
  if(new Set(records.map(r=>r.account_id)).size!==1)throw Error('Cannot match across accounts or currencies');
  await lockAccount(db,records[0].account_id);
  if(records.some((r,i)=>r.side!==(i<left.length?'ledger':'statement')))throw Error('Transaction is on the wrong side');
  const sum=rs=>rs.reduce((n,r)=>n+BigInt(r.amount_cents),0n);
  if(sum(records.slice(0,left.length))!==sum(records.slice(left.length)))throw Error('Ledger and statement totals differ; investigate rather than write off');
  const active=await db.query('select transaction_id from match_members where active and transaction_id=any($1::uuid[])',[records.map(r=>r.id)]);if(active.length)throw Error('Transaction is already reserved by a match');
  out=(await db.query('insert into matches(account_id,reason,proposed_by) values($1,$2,$3) returning *',[records[0].account_id,required(o,'reason'),actor]))[0];
  for(const t of records)await db.query('insert into match_members(match_id,transaction_id) values($1,$2)',[out.id,t.id]);
  await audit(db,'match',out.id,'proposed',actor,{transactions:records.map(r=>r.id),reason:o.reason});
 }else if(cmd==='approve'||cmd==='reverse'){
  let m=await selectOne(db,'match',pos[1]);await lockAccount(db,m.account_id);m=(await db.query('select * from matches where id=$1 for update',[m.id]))[0];
  if(cmd==='approve'){
   if(m.status!=='proposed')throw Error('Only proposed matches can be approved');
   if(m.proposed_by.trim().toLowerCase()===actor.toLowerCase())throw Error('Approval needs a different reviewer');
   const members=await db.query('select t.* from transactions t join match_members mm on mm.transaction_id=t.id where mm.match_id=$1 and mm.active',[m.id]);
   const left=members.filter(r=>r.side==='ledger'),right=members.filter(r=>r.side==='statement');
   const sum=rs=>rs.reduce((n,r)=>n+BigInt(r.amount_cents),0n);
   if(!left.length||!right.length||members.some(r=>r.account_id!==m.account_id)||sum(left)!==sum(right))throw Error('Match members fail integrity checks');
   const cases=await db.query("select c.id from cases c join match_members mm on mm.transaction_id=c.transaction_id where mm.match_id=$1 and mm.active and c.status='open'",[m.id]);if(cases.length)throw Error('Resolve open investigations before approval');
   out=(await db.query("update matches set status='approved',approved_by=$2,approved_at=now() where id=$1 returning *",[m.id,actor]))[0];
  }else{
   if(m.status==='reversed')throw Error('Match is already reversed');
   out=(await db.query("update matches set status='reversed',reversed_by=$2,reversed_at=now(),reversal_reason=$3 where id=$1 returning *",[m.id,actor,required(o,'reason')]))[0];
   await db.query('update match_members set active=false where match_id=$1',[m.id]);
  }
  await audit(db,'match',m.id,cmd,actor,{reason:o.reason||'independent review'});
 }else if(cmd==='open-case'){
  const t=await selectOne(db,'transaction',pos[1]);await lockAccount(db,t.account_id);
  out=(await db.query('insert into cases(transaction_id,title,owner,due_on) values($1,$2,$3,$4) returning *',[t.id,required(o,'title'),required(o,'owner'),date(required(o,'due'))]))[0];
  await audit(db,'case',out.id,'opened',actor,{transaction_id:t.id});
 }else if(cmd==='assign'||cmd==='resolve'){
  const c=await selectOne(db,'case',pos[1]);const t=await selectOne(db,'transaction',c.transaction_id);await lockAccount(db,t.account_id);
  const current=(await db.query('select * from cases where id=$1 for update',[c.id]))[0];if(current.status!=='open')throw Error('Case is already resolved');
  if(cmd==='assign')out=(await db.query('update cases set owner=$2,due_on=$3 where id=$1 returning *',[c.id,required(o,'owner'),date(required(o,'due'))]))[0];
  else out=(await db.query("update cases set status='resolved',resolution=$2,resolved_by=$3,resolved_at=now() where id=$1 returning *",[c.id,required(o,'reason'),actor]))[0];
  await audit(db,'case',c.id,cmd,actor,{owner:o.owner,reason:o.reason});
 }else if(cmd==='log'){
  const type=required(o,'type');if(!['account','transaction','match','case'].includes(type))throw Error('Type must be account, transaction, match or case');
  const r=await selectOne(db,type,pos[1]);await audit(db,type,r.id,'note',actor,{note:required(o,'note')});out={record_id:r.id,logged:true};
 }else if(cmd==='export'){
  const bundle={version:1,exported_at:new Date().toISOString(),records:{}};
  for(const tab of ['accounts','imports','transactions','matches','match_members','cases','events'])bundle.records[tab]=await db.query(`select * from ${tab} order by created_at,id`);
  const dir=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,'exports');fs.mkdirSync(dir,{recursive:true,mode:0o700});
  const name=`reconciliation-${Date.now()}`;const file=path.join(dir,name+'.json');fs.writeFileSync(file,JSON.stringify(bundle,null,2)+'\n',{mode:0o600,flag:'wx'});
  const rows=await db.query(queries.transactions),cols=['id','account','side','external_id','booked_on','reference','currency','amount_cents','match_status'];
  const csv=v=>'"'+String(v??'').replaceAll('"','""')+'"';
  const csvFile=path.join(dir,name+'.csv');fs.writeFileSync(csvFile,[cols,...rows.map(r=>cols.map(c=>typeof r[c]==='string'&&/^[=+@\t\r-]/.test(r[c])?"'"+r[c]:r[c]))].map(row=>row.map(csv).join(',')).join('\r\n')+'\r\n',{mode:0o600,flag:'wx'});
  out={file,csv:csvFile,transactions:rows.length,note:'Archive .data/db/sources separately with the database. JSON preserves exact values; CSV is spreadsheet-safe presentation.'};
 }else if(cmd==='draft-statement'){
  const a=await selectOne(db,'account',pos[1]);
  const coverage=await db.query('select * from account_coverage where id=$1',[a.id]);
  const items=await db.query('select side,external_id,reference,currency,amount_cents,match_status from transaction_status where account_id=$1 order by booked_on,external_id',[a.id]);
  out={file:writeOut('drafts',`statement-${a.id}`,page({title:'Draft transaction reconciliation statement',subtitle:a.name,sections:[{title:'Period movement coverage',note:'Transaction totals are movements, not bank or ledger balances. Review completeness of source periods before sign-off.',html:htmlTable(coverage)},{title:'Supporting items',html:htmlTable(items)}]}))};
 }else if(cmd==='draft-investigation'){
  const c=await selectOne(db,'case',pos[1]);const rows=await db.query('select * from transaction_status where id=$1',[c.transaction_id]);const notes=await db.query('select action,actor,detail,created_at from events where entity_id=$1 order by created_at',[c.id]);
  out={file:writeOut('drafts',`investigation-${c.id}`,page({title:'Draft investigation worksheet',subtitle:c.title,sections:[{title:'Case',html:htmlTable([c])},{title:'Transaction',html:htmlTable(rows)},{title:'Recorded notes',html:htmlTable(notes)}]}))};
 }
 await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');return out;
 }catch(e){await db.exec('ROLLBACK');throw e;}
}
export function human(value){
 if(Array.isArray(value)){if(!value.length)return '  (none)';return table(value,Object.keys(value[0]).map(key=>({key,label:key.replace(/_cents$/,''),width:70,format:v=>key.endsWith('_cents')?(Number(v)/100).toFixed(2):key==='id'||key.endsWith('_id')?String(v||'').slice(0,8):v&&typeof v==='object'?JSON.stringify(v):v})));}
 if(value&&typeof value==='object'&&Object.values(value).some(Array.isArray))return Object.entries(value).map(([k,v])=>`${k}\n${Array.isArray(v)?human(v):human([v])}`).join('\n\n');
 return human([value]);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 let db;try{db=await getDb();const args=process.argv.slice(2);const out=await run(db,args);console.log(args.includes('--json')?JSON.stringify(out,null,2):human(out));}
 catch(e){console.error(`reconcile: ${e.message}`);process.exitCode=1;}finally{await db?.close();}
}
