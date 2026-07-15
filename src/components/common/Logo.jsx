import React from 'react';
import worldTiersLogo from '../../assets/brand/worldtiers-logo.png';
export function Logo({navigate}){return <a className="logo" href="/home" onClick={e=>{e.preventDefault();navigate?.('/home')}} aria-label="Accueil WorldTiers"><img src={worldTiersLogo} alt=""/><span>WORLD</span><b>TIERS</b></a>}
