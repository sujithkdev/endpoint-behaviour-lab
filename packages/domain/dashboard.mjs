export function dashboard(repository) {
  const assets = repository.assets();
  const vulnerabilities = repository.vulnerabilities();
  const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const item of vulnerabilities) if (item.severity in bySeverity) bySeverity[item.severity]++;
  return { assets: assets.length, vulnerabilities: vulnerabilities.length, bySeverity, affectedAssets: new Set(vulnerabilities.map(v => v.assetId)).size };
}
