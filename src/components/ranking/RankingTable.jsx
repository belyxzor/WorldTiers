import React from 'react';
import {PlayerRow} from './PlayerRow';
import {EmptyState} from '../common/EmptyState';

export function RankingTable({players,modeId,navigate,loading=false,isFiltering=false}){const empty=loading?<EmptyState title="Chargement du classement" text="Récupération des données WorldTiers…"/>:<EmptyState title={isFiltering?'Aucun résultat':'Aucun joueur classé'} text={isFiltering?'Essaie une autre recherche.':'Les premiers profils apparaîtront ici.'}/>;return <section className="ranking-table"><div className="table-header"><span>#</span><span>Joueur</span><span>Région</span><span>Tiers validés</span></div>{players.length?players.map((player,index)=><PlayerRow key={player.id} player={player} rank={index+1} modeId={modeId} navigate={navigate}/>):empty}</section>}
