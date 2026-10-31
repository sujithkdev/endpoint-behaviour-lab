import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {mapWazuh} from '../packages/adapters/src/wazuh/event-mapper.mjs';
import {readJsonLines} from '../apps/ingest/src/jsonl.mjs';
import {validateEvent} from '../packages/contracts/src/event.mjs';
import {PGlite} from '@electric-sql/pglite';
import {migrate} from '../scripts/migrate.mjs';
import {saveEvent} from '../packages/adapters/src/postgres/repositories/events.mjs';
const raw=()=>({agent:{id:'001'},data:{win:{system:{channel:'Microsoft-Windows-Sysmon/Operational',eventID:'1',eventRecordID:'42',systemTime:'2026-10-31T01:00:00Z'},eventdata:{processGuid:'{test-process}',image:'C:\\Windows\\notepad.exe'}}}});
const context={managerId:'test-manager',enrollmentEpoch:'fixture-enrollment',recordReference:'fixture:line:1',receivedAt:'2026-10-31T01:00:01Z'};
test('stable replay identity, separate records, log generations and enrollments',()=>{
  const a=mapWazuh(raw(),context);
  assert.equal(a.event_id,mapWazuh(raw(),{...context,receivedAt:'2026-10-31T02:00:00Z'}).event_id);
  for(const override of [{recordReference:'fixture:line:2'},{enrollmentEpoch:'new'},{managerId:'different'}]) assert.notEqual(a.event_id,mapWazuh(raw(),{...context,...override}).event_id);
  const strong=mapWazuh(raw(),{...context,sourceGeneration:'generation1'});
  assert.equal(strong.identity_quality,'source-generation');
  assert.notEqual(strong.event_id,mapWazuh(raw(),{...context,sourceGeneration:'generation2'}).event_id);
});
test('missing timestamps/GUIDs stay unknown and source time is retained',()=>{
  const r=raw();r.data.win.system.systemTime='invalid';r.data.win.eventdata={};
  const e=mapWazuh(r,context);assert.equal(e.event_time,null);assert.equal(e.source_time,'invalid');assert.equal(e.process_guid,null);
});
test('hostile nesting, invalid fields and oversized attributes fail validation',()=>{
  const r=raw();r.data.win.eventdata={nested:{deep:true}};assert.throws(()=>mapWazuh(r,context));
  r.data.win.eventdata={commandLine:'x'.repeat(9000)};assert.throws(()=>mapWazuh(r,context));
  const e=mapWazuh(raw(),context);assert.throws(()=>validateEvent({...e,unexpected:true}));
  assert.throws(()=>mapWazuh(raw(),{...context,managerId:''}));
});
test('bounded JSONL reader recovers after oversized and malformed lines across chunks',async()=>{
  const bytes=Buffer.from('x'.repeat(100)+'\n{bad}\n{"ok":"é"}\n');
  const records=[];for await(const r of readJsonLines(Readable.from([bytes.subarray(0,9),bytes.subarray(9,116),bytes.subarray(116)]),32)) records.push(r);
  assert.equal(records[0].error,'RECORD_TOO_LARGE');assert.equal(records[1].error,'INVALID_JSON');assert.equal(records[2].value.ok,'é');
});
test('actual PostgreSQL engine applies migration, deduplicates and rolls back failed insert',async()=>{
  const db=new PGlite();
  // PGlite runs PostgreSQL in-process; multi-statement SQL uses exec.
  const client={query:async(sql,args)=> !args && sql.includes('CREATE TABLE') ? (await db.exec(sql)).at(-1) : db.query(sql,args)};
  try{
    await migrate(client);await migrate(client);
    const e=mapWazuh(raw(),context);
    assert.equal(await saveEvent(client,e),'inserted');assert.equal(await saveEvent(client,e),'duplicate');
    await assert.rejects(saveEvent(client,{...e,attributes:{...e.attributes,image:'changed.exe'}}),/EVENT_ID_COLLISION/);
    const other=mapWazuh(raw(),{...context,recordReference:'fixture:line:2'});
    assert.equal(await saveEvent(client,other),'inserted');
    assert.equal((await db.query('SELECT count(*)::int AS n FROM endpoint_events')).rows[0].n,2);
    await db.exec("ALTER TABLE endpoint_events ADD CONSTRAINT test_failure CHECK (event_type <> 'file_create')");
    const broken=mapWazuh(raw(),{...context,managerId:'rollback-device'});broken.event_type='file_create';
    await assert.rejects(saveEvent(client,broken));
    assert.equal((await db.query('SELECT count(*)::int AS n FROM endpoint_devices WHERE id=$1',[broken.device_id])).rows[0].n,0);
    await db.query("UPDATE endpoint_schema_migrations SET checksum='tampered' WHERE version=1");
    await assert.rejects(migrate(client),/CHECKSUM/);
  }finally{await db.close();}
});
