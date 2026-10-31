// Synthetic records only; no recovered customer data or vulnerability claims.
const assets = [
  { id: 'demo-host-1', hostname: 'lab-workstation', platform: 'Windows', lastSeen: null },
  { id: 'demo-host-2', hostname: 'lab-server', platform: 'Linux', lastSeen: null },
];
const vulnerabilities = [
  { id: 'demo-finding-1', assetId: 'demo-host-1', title: 'Synthetic high-severity finding', severity: 'high', status: 'open', source: 'fixture' },
  { id: 'demo-finding-2', assetId: 'demo-host-2', title: 'Synthetic medium-severity finding', severity: 'medium', status: 'open', source: 'fixture' },
];
export function createDemoRepository() {
  return { assets: () => structuredClone(assets), vulnerabilities: () => structuredClone(vulnerabilities) };
}
