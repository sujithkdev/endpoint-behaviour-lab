import Ajv from 'ajv';
import { readFileSync } from 'node:fs';
const schema=JSON.parse(readFileSync(new URL('./event.schema.json',import.meta.url),'utf8'));
const check=new Ajv({strict:true,allowUnionTypes:true}).compile(schema);
export function validateEvent(event){
  if(!check(event)) throw new Error('EVENT_SCHEMA_INVALID');
  for(const key of ['event_time','received_at']) {
    if(event[key]!==null && (!/^\d{4}-\d\d-\d\dT.*(?:Z|[+-]\d\d:\d\d)$/.test(event[key]) || !Number.isFinite(Date.parse(event[key])))) throw new Error('EVENT_TIME_INVALID');
  }
  if(Buffer.byteLength(JSON.stringify(event))>131072) throw new Error('EVENT_TOO_LARGE');
  return event;
}
