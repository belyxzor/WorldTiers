import React from 'react';
export function Logo({navigate}){return <a className="logo" href="/home" onClick={e=>{e.preventDefault();navigate?.('/home')}} aria-label="Accueil WorldTiers"><i>W</i><span>WORLD</span><b>TIERS</b></a>}
