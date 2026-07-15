import {spawn} from 'node:child_process';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(fileURLToPath(import.meta.url));
const apiPort=process.env.API_PORT||process.env.PORT||'3001';
const host=process.env.HOST||'0.0.0.0';
const api=spawn(process.execPath,[join(root,'server.js')],{stdio:'inherit',env:{...process.env,PORT:apiPort}});
const vite=spawn(process.execPath,[join(root,'node_modules','vite','bin','vite.js'),'--host',host],{stdio:'inherit',env:{...process.env,API_PORT:apiPort}});
const close=()=>{api.kill();vite.kill();process.exit()};
process.on('SIGINT',close);process.on('SIGTERM',close);
api.on('exit',code=>{if(code&&code!==0){vite.kill();process.exit(code)}});
vite.on('exit',code=>{api.kill();process.exit(code||0)});
