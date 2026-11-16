import { spawnSync } from 'node:child_process';
const repository='biglazycat-writer/website';
const credential=spawnSync('git',['credential','fill'],{input:'protocol=https\nhost=github.com\n\n',encoding:'utf8',windowsHide:true,env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'Never'}});
const token=credential.stdout?.split(/\r?\n/).find(line=>line.startsWith('password='))?.slice(9);
if(!token) throw Error('GitHub credential unavailable');
async function request(route,method='GET',body){const response=await fetch(`https://api.github.com/repos/${repository}${route}`,{method,headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});if(response.status===404)return null;const data=response.status===204?null:await response.json();if(!response.ok)throw Error(`GitHub ${response.status}: ${data?.message}`);return data;}
const action=process.argv[2]||'status';
if(action==='status'){const repo=await request('');const pages=await request('/pages');const runs=await request('/actions/runs?per_page=3');console.log(JSON.stringify({permissions:repo?.permissions,pages,runs:runs?.workflow_runs.map(run=>({id:run.id,status:run.status,conclusion:run.conclusion,url:run.html_url}))},null,2));}
else if(action==='enable-pages'){const pages=await request('/pages');if(!pages)await request('/pages','POST',{build_type:'workflow'});else if(pages.build_type!=='workflow')await request('/pages','PUT',{build_type:'workflow'});console.log('Pages workflow enabled');}
else if(action==='jobs'){const result=await request(`/actions/runs/${process.argv[3]}/jobs`);console.log(JSON.stringify(result?.jobs.map(job=>({id:job.id,name:job.name,conclusion:job.conclusion,steps:job.steps})),null,2));}
else throw Error('Unknown action');
