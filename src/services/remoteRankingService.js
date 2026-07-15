export async function loadRemotePlayers(){
 try{const response=await fetch('/api/players');if(!response.ok)return null;return await response.json()}catch{return null}
}
