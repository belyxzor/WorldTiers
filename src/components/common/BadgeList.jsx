import React from 'react';
import {BADGES} from '../../config/badges';
export function BadgeList({badges=[],compact=false}){return <span className={`badge-list${compact?' compact':''}`}>{badges.filter(id=>BADGES[id]).map(id=>{const badge=BADGES[id];return <span className={`player-badge ${badge.tone}`} title={badge.label} key={id}><i>{badge.icon}</i>{!compact&&<b>{badge.label}</b>}</span>})}</span>}
