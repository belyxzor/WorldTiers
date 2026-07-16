import React,{useEffect,useState} from 'react';

const bobSkin='https://franceranked.fr/api/v1/skin/render/2ea4d2005aceff3d?pose=confidence&width=320&height=320';
export function AnnouncementPopup(){
 const [announcement,setAnnouncement]=useState(null),[closed,setClosed]=useState(false);
 useEffect(()=>{let alive=true;fetch('/api/announcements/current').then(response=>response.ok?response.json():null).then(data=>{if(alive&&data)setAnnouncement(data)}).catch(()=>{});return()=>{alive=false}},[]);
 if(!announcement||closed)return null;
 return <aside className="announcement-popup" aria-live="polite"><button className="announcement-close" onClick={()=>setClosed(true)} aria-label="Fermer l'annonce">×</button><img src={bobSkin} alt="Bob"/><div><small>{announcement.active?'ANNONCE DU STAFF':'MESSAGE DE BOB'}</small><b>{announcement.author||'Bob'}</b><p>{announcement.message}</p></div></aside>
}
