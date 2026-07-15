import React from 'react';
export function ModeIcon({mode,size='md'}){return <span className={`mode-icon ${size}`} style={{'--mode':mode.color}}><img src={mode.icon} alt=""/></span>}
