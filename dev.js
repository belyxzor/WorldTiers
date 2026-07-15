import {spawn} from 'node:child_process';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(fileURLToPath(import.meta.url));
const api=spawn(process.execPath,[join(root,'server.js')],{stdio:'inherit'});
const vite=spawn(process.execPath,[join(root,'node_modules','vite','bin','vite.js'),'--host','127.0.0.1'],{stdio:'inherit'});
const close=()=>{api.kill();vite.kill();process.exit()};
process.on('SIGINT',close);process.on('SIGTERM',close);
api.on('exit',code=>{if(code&&code!==0){vite.kill();process.exit(code)}});
vite.on('exit',code=>{api.kill();process.exit(code||0)});
