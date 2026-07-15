import {TIERS} from '../config/site';
let rankingPlayers=[];
export const setRankingPlayers=players=>{rankingPlayers=Array.isArray(players)?players:[]};
export const getAllPlayers=()=>rankingPlayers;
export const findPlayer=username=>rankingPlayers.find(p=>p.username.toLowerCase()===username.toLowerCase());
export function getOverall({query='',includeRetired=false,limit=100}={}){return rankingPlayers.filter(p=>includeRetired||!p.retired).filter(p=>p.username.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>b.points-a.points).slice(0,limit)}
export function getByMode(modeId,{query='',includeRetired=false}={}){return rankingPlayers.filter(p=>(includeRetired||!p.retired)&&p.tiers[modeId]&&p.username.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>TIERS.indexOf(a.tiers[modeId])-TIERS.indexOf(b.tiers[modeId])||b.points-a.points)}
export const getRank=player=>getOverall({includeRetired:true}).findIndex(p=>p.id===player.id)+1;
