const element = (tag, text, className) => { const node = document.createElement(tag); node.textContent = text; if (className) node.className = className; return node; };
async function get(path) { const response = await fetch(`/api/v1/${path}`); if (!response.ok) throw new Error(`Unable to load ${path} (${response.status})`); return (await response.json()).data; }
function row(target, values) { const tr = document.createElement('tr'); for (const value of values) tr.append(element('td', value)); document.querySelector(target).append(tr); }
try {
  const [summary, assets, findings, modules] = await Promise.all(['dashboard', 'assets', 'vulnerabilities', 'modules'].map(get));
  for (const [label, value] of [['Demo assets', summary.assets], ['Demo findings', summary.vulnerabilities], ['Critical', summary.bySeverity.critical], ['Affected assets', summary.affectedAssets]]) {
    const card = element('article', '', 'card'); card.append(element('p', label), element('strong', String(value))); document.querySelector('#cards').append(card);
  }
  assets.forEach(a => row('#asset-rows', [a.hostname, a.platform, a.lastSeen ?? 'Not observed']));
  findings.forEach(v => row('#finding-rows', [v.title, v.assetId, v.severity, v.status]));
  modules.forEach(m => { const card = element('article', '', 'module'); card.append(element('h3', m.name), element('p', m.description), element('span', m.status, 'status')); document.querySelector('#module-list').append(card); });
} catch (error) { const box = document.querySelector('#error'); box.hidden = false; box.textContent = error.message; }
