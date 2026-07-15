import React,{useEffect,useState} from 'react';
import {Logo} from '../common/Logo';
import {getAllPlayers} from '../../services/rankingService';
import {avatarUrl} from '../../services/skinService';

export function Header({navigate,theme,onTheme,onInfo}){
 const [query,setQuery]=useState('');
 useEffect(()=>{setQuery('')},[]);
 const results=query.trim().length>1?getAllPlayers().filter(player=>player.username.toLowerCase().includes(query.toLowerCase())).slice(0,6):[];
 return <header className="site-header"><Logo navigate={navigate}/><nav className="header-links"><button onClick={()=>navigate('/home')}>Classement</button><button onClick={()=>navigate('/stats')}>Statistiques</button><button onClick={()=>navigate('/infos')}>Guide</button></nav><div className="global-search"><span>⌕</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Rechercher un joueur..." aria-label="Rechercher un joueur" autoComplete="off"/>{results.length>0&&<div className="search-results">{results.map(player=><button key={player.id} onClick={()=>{setQuery('');navigate(`/player/${player.username}`)}}><img src={avatarUrl(player,40)} alt=""/><span><b>{player.username}</b><small>{player.points} pts</small></span></button>)}</div>}</div><button className="icon-btn" onClick={onTheme} aria-label="Changer le thème">{theme==='dark'?'☼':'☾'}</button><button className="info-btn" onClick={onInfo}>À propos</button></header>;
}
