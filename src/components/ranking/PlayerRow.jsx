import React from 'react';
import {MODES} from '../../config/modes';
import {TIER_POINTS} from '../../config/site';
import {avatarUrl,handleSkinError} from '../../services/skinService';
import {TierBadge} from './TierBadge';

export function PlayerRow({player,rank,modeId,navigate}){const visible=modeId?MODES.filter(mode=>mode.id===modeId):MODES;const score=modeId?TIER_POINTS[player.tiers[modeId]]||0:player.points;return <button className="player-row" onClick={()=>navigate(`/player/${player.username}`)}><span className="rank">{rank}</span><span className="player-identity"><img src={avatarUrl(player,64)} onError={event=>handleSkinError(event,player)} alt=""/><span><b>{player.username}</b><small>{score} <em>{modeId?'pts mode':'pts'}</em></small></span></span><span><i className={`region ${player.region.toLowerCase()}`}>{player.region}</i></span><span className="tiers">{visible.map(mode=><TierBadge key={mode.id} modeId={mode.id} tier={player.tiers[mode.id]}/>)}</span></button>}
