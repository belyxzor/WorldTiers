import React,{useEffect,useMemo,useState} from 'react';
import {Header} from './components/layout/Header';
import {Footer} from './components/layout/Footer';
import {InfoModal} from './components/modals/InfoModal';
import {HomePage} from './pages/HomePage';
import {ModePage} from './pages/ModePage';
import {PlayerPage} from './pages/PlayerPage';
import {StatsPage} from './pages/StatsPage';
import {TierTaggerPage} from './pages/TierTaggerPage';
import {AboutPage} from './pages/AboutPage';
import {NotFoundPage} from './pages/NotFoundPage';
import {AdminPage} from './pages/AdminPage';
import {DocsPage} from './pages/DocsPage';
import {findPlayer} from './services/rankingService';
import {setRankingPlayers} from './services/rankingService';
import {loadRemotePlayers} from './services/remoteRankingService';

export default function App(){
 const [path,setPath]=useState(location.pathname); const [theme,setTheme]=useState(localStorage.getItem('theme')||'dark'); const [info,setInfo]=useState(false);const [dataVersion,setDataVersion]=useState(0);
 useEffect(()=>{if(location.pathname==='/' ){history.replaceState({},'', '/home');setPath('/home')}const onPop=()=>setPath(location.pathname);addEventListener('popstate',onPop);return()=>removeEventListener('popstate',onPop)},[]);
 useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('theme',theme)},[theme]);
 useEffect(()=>{const refresh=()=>loadRemotePlayers().then(players=>{if(players!==null){setRankingPlayers(players);setDataVersion(v=>v+1)}}).catch(()=>{});refresh();addEventListener('worldtiers-data-updated',refresh);return()=>removeEventListener('worldtiers-data-updated',refresh)},[]);
 const navigate=(url)=>{history.pushState({},'',url);setPath(url);scrollTo({top:0,behavior:'smooth'})};
 const page=useMemo(()=>{if(path==='/home'||path==='/')return <HomePage navigate={navigate}/>;if(path==='/stats')return <StatsPage/>;if(path==='/tier-tagger')return <TierTaggerPage/>;if(path==='/infos')return <AboutPage/>;if(path==='/docs')return <DocsPage/>;if(path==='/admin')return <AdminPage/>;if(path.startsWith('/mode/'))return <ModePage modeId={decodeURIComponent(path.split('/')[2]||'')} navigate={navigate}/>;if(path.startsWith('/player/')){const p=findPlayer(decodeURIComponent(path.split('/')[2]||''));return p?<PlayerPage player={p} navigate={navigate}/>:<NotFoundPage navigate={navigate}/>};return <NotFoundPage navigate={navigate}/>},[path,dataVersion]);
 return <div className="app-shell"><Header navigate={navigate} theme={theme} onTheme={()=>setTheme(theme==='dark'?'light':'dark')} onInfo={()=>setInfo(true)}/><div className="app-content">{page}</div><Footer navigate={navigate}/>{info&&<InfoModal onClose={()=>setInfo(false)} navigate={navigate}/>}</div>;
}
