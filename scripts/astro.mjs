import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const command=process.argv[2];
if(!['dev','build','preview','check'].includes(command))throw Error('Invalid Astro command');
const result=spawnSync(process.execPath,[fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs',import.meta.url)),command,...process.argv.slice(3)],{stdio:'inherit',windowsHide:true,env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'}});
if(result.error)throw result.error;
process.exit(result.status??1);
