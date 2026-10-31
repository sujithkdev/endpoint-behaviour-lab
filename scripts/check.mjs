import { readFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { catalog } from '../packages/domain/catalog.mjs';
const root=new URL('../',import.meta.url);
const contract=JSON.parse(await readFile(new URL('contracts/openapi.json',root),'utf8'));
if(new Set(catalog.map(m=>m.id)).size!==catalog.length) throw new Error('Duplicate module IDs');
for(const m of catalog){
  await readFile(new URL(`packages/modules/${m.id}/README.md`,root),'utf8');
  if(!contract.paths[`/api/v1/${m.id}`]) throw new Error(`Missing contract: ${m.id}`);
}
async function check(directory){
  for(const entry of await readdir(directory,{withFileTypes:true})){
    if(['node_modules','.git','var'].includes(entry.name)) continue;
    const path=new URL(entry.name+(entry.isDirectory()?'/':''),directory);
    if(entry.isDirectory()) await check(path);
    else if(/\.(mjs|js)$/.test(entry.name)){
      const result=spawnSync(process.execPath,['--check',fileURLToPath(path)],{encoding:'utf8'});
      if(result.status!==0) throw new Error(result.stderr);
    }
  }
}
await check(root); console.log(`Syntax and contract structure valid for ${catalog.length} modules. OpenAPI dialect validation is not included.`);
