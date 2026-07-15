const WORLD_TIERS_SKIN_API='https://franceranked.fr/api/v1/skin/render';
const DEFAULT_SKIN_HASH='9736050ff10a4b8d9844f67c46e05f8a';
const safe=value=>encodeURIComponent(value.replace(/[^a-zA-Z0-9_-]/g,''));
export function skinRenderUrl(player,{pose='confidence',width=300,height=300}={}){
 const uuid=player.minecraft_uuid||player.skinHash;
 const hash=uuid&&/^[a-f0-9]{32}$/i.test(uuid)?uuid:DEFAULT_SKIN_HASH;
 return `${WORLD_TIERS_SKIN_API}/${safe(hash)}?pose=${safe(pose)}&width=${width}&height=${height}`;
}
export function handleProfileSkinError(event,{pose='confidence',width=300,height=300}={}){event.currentTarget.onerror=null;event.currentTarget.src=`${WORLD_TIERS_SKIN_API}/${DEFAULT_SKIN_HASH}?pose=${safe(pose)}&width=${width}&height=${height}`}
export function avatarUrl(player,size=64){return `https://mc-heads.net/avatar/${safe(player.username)}/${size}`}
export function handleSkinError(event,player,size=64){event.currentTarget.onerror=null;event.currentTarget.src=avatarUrl(player,size)}
