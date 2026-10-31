import { validateEvent } from '../../../../contracts/src/event.mjs';
function canonical(value){
  if(value && typeof value==='object' && !Array.isArray(value)) return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])]));
  return value;
}
function observation(event){
  const {received_at,original_record_reference,...facts}=event;
  return JSON.stringify(canonical(facts));
}
// Requires one exclusively checked-out pg Client, not pool.query across transactions.
export async function saveEvent(client,event){
  validateEvent(event);
  await client.query('BEGIN');
  try{
    await client.query(`INSERT INTO endpoint_devices(id,manager_id,first_received_at,last_received_at)
      VALUES($1,$2,$3,$3) ON CONFLICT(id) DO UPDATE SET
      first_received_at=LEAST(endpoint_devices.first_received_at,EXCLUDED.first_received_at),
      last_received_at=GREATEST(endpoint_devices.last_received_at,EXCLUDED.last_received_at)`,[event.device_id,event.manager_id,event.received_at]);
    const result=await client.query(`INSERT INTO endpoint_events(id,device_id,event_time,received_at,event_type,channel,source_reference,payload)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8::jsonb) ON CONFLICT(id) DO NOTHING RETURNING id`,
      [event.event_id,event.device_id,event.event_time,event.received_at,event.event_type,event.channel,event.original_record_reference,JSON.stringify(event)]);
    if(!result.rows.length){
      const existing=await client.query('SELECT payload FROM endpoint_events WHERE id=$1',[event.event_id]);
      if(!existing.rows.length || observation(existing.rows[0].payload)!==observation(event)) throw new Error('EVENT_ID_COLLISION');
    }
    await client.query('COMMIT');return result.rows.length?'inserted':'duplicate';
  }catch(error){await client.query('ROLLBACK');throw error;}
}
