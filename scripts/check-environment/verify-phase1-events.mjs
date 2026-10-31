import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { pathToFileURL } from 'node:url';

// Checks a controlled probe in Wazuh JSON archives, not arbitrary alert text.
export async function verifyProbe(lines, {agentId, probeId}) {
  if (!/^\d+$/.test(agentId ?? '') || !/^phase1-[a-f0-9]{32}$/.test(probeId ?? '')) {
    throw new Error('Supply a numeric agent ID and phase1-<32 hex> probe ID');
  }
  let parsed = 0, malformed = 0;
  const matches = [];
  for await (const line of lines) {
    if (!line.trim()) continue;
    let event;
    try { event = JSON.parse(line); } catch { malformed++; continue; }
    parsed++;
    const win = event?.data?.win;
    const target = win?.eventdata?.targetFilename;
    if (String(event?.agent?.id) !== agentId ||
        win?.system?.channel !== 'Microsoft-Windows-Sysmon/Operational' ||
        String(win?.system?.eventID) !== '11' || typeof target !== 'string') continue;
    if (target.replaceAll('\\', '/').split('/').at(-1) !== `${probeId}.txt`) continue;
    if (matches.length < 10) matches.push({ agent_id: agentId, event_time: win.system.systemTime ?? null,
      received_at: event.timestamp ?? null, record_id: win.system.eventRecordID ?? null });
  }
  return { verified: matches.length > 0, parsed, malformed, matches,
    scope: 'Probe receipt only; does not establish complete telemetry or malware detection.' };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [file, agentId, probeId] = process.argv.slice(2);
    if (!file) throw new Error('Usage: node verify-phase1-events.mjs ARCHIVES.json AGENT_ID PROBE_ID');
    const stream = createReadStream(file, {encoding:'utf8'});
    const lines = createInterface({input:stream, crlfDelay:Infinity});
    stream.on('error', error => lines.close());
    let inputError;
    stream.on('error', error => { inputError = error; });
    const result = await verifyProbe(lines, {agentId, probeId});
    if (inputError) throw inputError;
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.verified ? 0 : 2;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
