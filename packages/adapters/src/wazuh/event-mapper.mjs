import { createHash } from 'node:crypto';
import { validateEvent } from '../../../contracts/src/event.mjs';
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const names={1:'process_start',5:'process_end',11:'file_create',12:'registry_change',13:'registry_change',14:'registry_change',3:'network_connect',22:'dns_query',4:'collector_status',16:'collector_status',255:'collector_status'};
const object=value=>value && typeof value==='object' && !Array.isArray(value);
export function mapWazuh(raw, context){
  if(!object(raw)||!object(raw.agent)||!/^\d+$/.test(String(raw.agent.id))) throw new Error('AGENT_ID_INVALID');
  if(!context.managerId||!context.enrollmentEpoch||!context.recordReference) throw new Error('SOURCE_CONTEXT_REQUIRED');
  const win=raw.data?.win, system=win?.system;
  if(!object(system)||!system.channel) throw new Error('UNSUPPORTED_EVENT');
  const sourceTime=system.systemTime ?? null;
  const validTime=typeof sourceTime==='string' && /(?:Z|[+-]\d\d:\d\d)$/.test(sourceTime) && Number.isFinite(Date.parse(sourceTime));
  const attributes=win.eventdata ?? {};
  if(!object(attributes)||Object.keys(attributes).some(k=>['__proto__','constructor','prototype'].includes(k))) throw new Error('ATTRIBUTES_INVALID');
  const deviceId=hash([context.managerId,context.enrollmentEpoch,String(raw.agent.id)]);
  const recordId=system.eventRecordID == null ? null : String(system.eventRecordID);
  const generation=context.sourceGeneration ?? null;
  // Unknown log generation: distinguish records by immutable export identity/line.
  // Never collapse equal message text across independent events.
  const strong=Boolean(generation && recordId && validTime);
  const identity=strong ? [deviceId,system.channel,generation,recordId,sourceTime] : [deviceId,system.channel,context.recordReference];
  const event={schema_version:1,event_id:hash(identity),device_id:deviceId,manager_id:context.managerId,
    source:'wazuh-windows',channel:system.channel,source_event_id:recordId,source_generation:generation,
    identity_quality:strong?'source-generation':'record-reference',event_time:validTime?new Date(sourceTime).toISOString():null,
    source_time:sourceTime,received_at:context.receivedAt ?? new Date().toISOString(),
    event_type:system.channel==='Microsoft-Windows-Sysmon/Operational'?(names[system.eventID]??'windows_event'):'windows_event',
    event_code:String(system.eventID),attributes,collector_config_version:context.configVersion??null,
    original_record_reference:context.recordReference,process_guid:attributes.processGuid??null,parent_process_guid:attributes.parentProcessGuid??null};
  return validateEvent(event);
}
