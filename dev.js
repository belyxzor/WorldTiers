import net from 'node:net';
import {spawn} from 'node:child_process';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(fileURLToPath(import.meta.url));
const apiPortBase=Number(process.env.API_PORT||process.env.PORT||3001);
const host=process.env.HOST||'0.0.0.0';
const findAvailablePort=async(port,max=port+20)=>{return new Promise((resolve,reject)=>{const server=net.createServer();server.once('error',err=>{if(err.code==='EADDRINUSE'){server.close();if(port+1>max)return reject(new Error('No available port found'));resolve(findAvailablePort(port+1,max));}else reject(err)});server.once('listening',()=>{const freePort=server.address().port;server.close(()=>resolve(freePort));});server.listen(port,host);});};
const apiPort=await findAvailablePort(apiPortBase);
if(apiPort!==apiPortBase)console.log(`Port ${apiPortBase} busy, using ${apiPort}`);
const env={...process.env,PORT:String(apiPort),API_PORT:String(apiPort)};
const api=spawn(process.execPath,[join(root,'server.js')],{stdio:'inherit',env});
const vite=spawn(process.execPath,[join(root,'node_modules','vite','bin','vite.js'),'--host',host],{stdio:'inherit',env});
const close=()=>{api.kill();vite.kill();process.exit()};
process.on('SIGINT',close);process.on('SIGTERM',close);
api.on('exit',code=>{if(code&&code!==0){vite.kill();process.exit(code)}});
vite.on('exit',code=>{api.kill();process.exit(code||0)});
