import React,{useEffect,useRef,useState} from 'react';

const bobHead='https://minotar.net/helm/2ea4d2005aceff3d/128.png';
export function AnnouncementPopup(){
 const [announcement,setAnnouncement]=useState(null),[open,setOpen]=useState(false),timer=useRef(null);
 useEffect(()=>{let alive=true;fetch('/api/announcements/current').then(response=>response.ok?response.json():null).then(data=>{if(alive&&data)setAnnouncement(data)}).catch(()=>{});return()=>{alive=false;clearTimeout(timer.current)}},[]);
 const showMessage=()=>{setOpen(true);clearTimeout(timer.current);timer.current=setTimeout(()=>setOpen(false),10000)};
 if(!announcement)return null;
 return <aside className="bob-message" aria-live="polite">{open&&<div className="bob-message-bubble"><small>{announcement.active?'ANNONCE DU STAFF':'BOB'}</small><p>{announcement.message}</p></div>}<button className="bob-head" type="button" onClick={showMessage} title="Voir le message de Bob" aria-label="Voir le message de Bob"><img src={bobHead} alt="Tête Minecraft de Bob"/></button></aside>
}
