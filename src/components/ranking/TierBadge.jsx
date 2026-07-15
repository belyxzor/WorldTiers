import React from 'react';import {getMode} from '../../config/modes';import {ModeIcon} from '../common/ModeIcon';
export function TierBadge({modeId,tier,wide=false}){const mode=getMode(modeId);return <span className={`tier-badge ${!tier?'is-empty':''} ${wide?'wide':''}`} style={{'--mode':mode.color}}><ModeIcon mode={mode} size="sm"/><b>{tier||'—'}</b></span>}
