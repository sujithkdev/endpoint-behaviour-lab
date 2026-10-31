import {open} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {parseArgs} from 'node:util';
import {readJsonLines} from './jsonl.mjs';
import {mapWazuh} from '../../../packages/adapters/src/wazuh/event-mapper.mjs';
import {connect} from '../../../packages/adapters/src/postgres/connection.mjs';
import {saveEvent} from '../../../packages/adapters/src/postgres/repositories/events.mjs';

const {values}=parseArgs({options:{file:{type:'string'},manager:{type:'string'},epoch:{type:'string'},generation:{type:'string'},'dry-run':{type:'boolean',default:false}}});
if(!values.file||!values.manager||!values.epoch) throw new Error('Usage: --file IMMUTABLE_ARCHIVE --manager ID --epoch ENROLLMENT_EPOCH [--generation LOG_GENERATION] [--dry-run]');
const input=await open(values.file,'r');
let client;
const runId=randomUUID(), counts={records:0,valid:0,inserted:0,duplicate:0,rejected:0};
try{
  const before=await input.stat();
  if(!before.isFile()) throw new Error('REGULAR_FILE_REQUIRED');
  const digest=createHash('sha256');
  for await(const bytes of input.createReadStream({autoClose:false,start:0})) digest.update(bytes);
  const sourceDigest=digest.digest('hex');
  if(!values['dry-run']){
    client=await connect();
    await client.query('INSERT INTO endpoint_ingestion_runs(id,source_digest,status) VALUES($1,$2,$3)',[runId,sourceDigest,'running']);
  }
  for await(const item of readJsonLines(input.createReadStream({autoClose:false,start:0}))){
    if(item.empty) continue;
    counts.records++;
    let event;
    try{
      if(item.error) throw new Error(item.error);
      event=mapWazuh(item.value,{managerId:values.manager,enrollmentEpoch:values.epoch,sourceGeneration:values.generation,
        recordReference:`sha256:${sourceDigest}:line:${item.line}`});
    }catch(error){counts.rejected++;if(counts.rejected<=20) console.error(JSON.stringify({line:item.line,error:error.message}));continue;}
    counts.valid++;
    if(client) counts[await saveEvent(client,event)]++;
  }
  const after=await input.stat();
  if(before.size!==after.size||before.mtimeMs!==after.mtimeMs) throw new Error('SOURCE_CHANGED_DURING_IMPORT');
  if(client) await client.query('UPDATE endpoint_ingestion_runs SET completed_at=now(),status=$2,counts=$3::jsonb WHERE id=$1',
    [runId,counts.rejected?'partial':'completed',JSON.stringify(counts)]);
  console.log(JSON.stringify({mode:values['dry-run']?'validation-only':'postgres-import',run_id:runId,source_digest:sourceDigest,...counts,live_collection_verified:false}));
  process.exitCode=counts.rejected?2:0;
}catch(error){
  if(client) await client.query('UPDATE endpoint_ingestion_runs SET completed_at=now(),status=$2,counts=$3::jsonb WHERE id=$1',[runId,'failed',JSON.stringify(counts)]).catch(()=>{});
  console.error(JSON.stringify({error:'IMPORT_FAILED',detail:error.code??'CHECK_INPUT_AND_DATABASE',run_id:runId}));process.exitCode=1;
}finally{await input.close();if(client) await client.end();}
