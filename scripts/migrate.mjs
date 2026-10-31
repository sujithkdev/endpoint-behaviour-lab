import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {connect} from '../packages/adapters/src/postgres/connection.mjs';
export async function migrate(client){
  const sql=await readFile(new URL('../database/migrations/001_phase2.sql',import.meta.url),'utf8');
  const digest=createHash('sha256').update(sql).digest('hex');
  await client.query('BEGIN');
  try{
    await client.query('SELECT pg_advisory_xact_lock(7102301)');
    await client.query(sql);
    const prior=await client.query('SELECT checksum FROM endpoint_schema_migrations WHERE version=1');
    if(prior.rows.length && prior.rows[0].checksum!==digest) throw new Error('MIGRATION_CHECKSUM_MISMATCH');
    await client.query('INSERT INTO endpoint_schema_migrations(version,checksum) VALUES(1,$1) ON CONFLICT DO NOTHING',[digest]);
    await client.query('COMMIT');
  }catch(error){await client.query('ROLLBACK');throw error;}
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
  const client=await connect();try{await migrate(client);console.log('Phase 2 migration applied/verified.');}finally{await client.end();}
}
