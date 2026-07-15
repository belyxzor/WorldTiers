import React from 'react';
import {MODES} from '../config/modes';
import {TIERS} from '../config/site';
import {getAllPlayers} from '../services/rankingService';
import {StatCard} from '../components/stats/StatCard';
import {DistributionCard} from '../components/stats/DistributionCard';

const daysAgo=days=>Date.now()-days*24*60*60*1000;
const playerDate=player=>new Date(player.joinedAt||player.created_at||0).getTime();

export function StatsPage(){
 const players=getAllPlayers();
 const tierAssignments=players.reduce((sum,player)=>sum+Object.values(player.tiers||{}).filter(Boolean).length,0);
 const tests=players.reduce((sum,player)=>sum+(player.history||[]).length,0);
 const newPlayers=players.filter(player=>playerDate(player)>=daysAgo(30)).length;
 const changes=tests;
 const modeCounts=Object.fromEntries(MODES.map(mode=>[mode.id,players.filter(player=>player.tiers?.[mode.id]).length]));
 const activeModes=Object.values(modeCounts).filter(Boolean).length;
 const distributions=Object.fromEntries(MODES.map(mode=>[mode.id,TIERS.map(tier=>players.filter(player=>player.tiers?.[mode.id]===tier).length)]));
 const modeTotal=Object.values(modeCounts).reduce((sum,count)=>sum+count,0)||1;
 return <main className="stats-page"><header className="page-title"><small>DONNÉES PUBLIQUES</small><h1>Les chiffres WorldTiers</h1><p>Statistiques calculées à partir des profils réellement enregistrés.</p></header><section className="stat-cards"><StatCard label="Joueurs" value={players.length} accent="#6c64ff"/><StatCard label="Tests enregistrés" value={tests} accent="#53d7ba"/><StatCard label="Taux de réussite" value="N/A" accent="#ff5e73"/><StatCard label="Modes actifs" value={activeModes} accent="#d48cff"/></section><section className="stats-summary"><article><h2>30 derniers jours</h2><div><span><b>{tests}</b><small>Tests enregistrés</small></span><span><b>{changes}</b><small>Évolutions connues</small></span><span><b>{newPlayers}</b><small>Nouveaux joueurs</small></span></div></article><article><h2>Joueurs classés par mode</h2><div className="mode-bars">{MODES.map(mode=>{const count=modeCounts[mode.id];return <div key={mode.id}><span>{mode.name}</span><i style={{'--width':`${count/modeTotal*100}%`,'--mode':mode.color}}/><b>{count}</b></div>})}</div></article></section><h2 className="section-title">Distribution réelle des tiers</h2><section className="distribution-grid">{MODES.map(mode=><DistributionCard key={mode.id} mode={mode} values={distributions[mode.id]}/>)}</section><section className="bottom-kpis"><div><b>{tierAssignments}</b><small>Tiers attribués</small></div><div><b>{changes}</b><small>Évolutions de tier</small></div><div><b>N/A</b><small>Sanctions actives</small></div></section></main>
}
