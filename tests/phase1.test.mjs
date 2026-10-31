import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyProbe } from '../scripts/check-environment/verify-phase1-events.mjs';

const probeId = 'phase1-' + 'a'.repeat(32);
const options = {agentId:'001', probeId};
const event = (id='001', eventID='11', filename=probeId+'.txt') => JSON.stringify({
  agent:{id}, timestamp:'2026-10-31T00:00:01Z', data:{win:{
    system:{channel:'Microsoft-Windows-Sysmon/Operational',eventID,systemTime:'2026-10-31T00:00:00Z'},
    eventdata:{targetFilename:'C:\\Temp\\EndpointPhase1\\'+filename}
  }}
});
test('probe verification requires endpoint, channel, event type and exact marker', async () => {
  assert.equal((await verifyProbe([event()],options)).verified,true);
  for (const wrong of [event('002'),event('001','1'),event('001','11','prefix-'+probeId+'.txt'),
    JSON.stringify({agent:{id:'001'},message:probeId})]) {
    assert.equal((await verifyProbe([wrong],options)).verified,false);
  }
});
test('empty and malformed exports do not masquerade as collection success', async () => {
  assert.equal((await verifyProbe([],options)).verified,false);
  const result=await verifyProbe(['broken',event()],options);
  assert.equal(result.malformed,1); assert.equal(result.verified,true);
});
test('invalid marker identity is rejected', async () => {
  await assert.rejects(verifyProbe([],{agentId:'001',probeId:''}));
});
