import React,{useState} from 'react';

const modes='crystal · sword · uhc · nethpot · pot · smp · axe · diasmp · mace · spear-mace';
const pages={
 overview:{group:'Démarrage',label:'Vue d’ensemble',content:<><h1>Documentation WorldTiers</h1><p>Référence technique du classement PvP Minecraft et de son API publique.</p><div className="doc-callout"><b>URL de base</b><code>{location.origin}/api</code></div><h2>Structure</h2><div className="doc-cards"><span><b>API publique</b><small>Classements, profils, UUID et statistiques.</small></span><span><b>Compatibilité Minecraft</b><small>Les données peuvent être utilisées par le mod Companion.</small></span><span><b>Données réelles</b><small>Les statistiques sont calculées depuis les joueurs enregistrés.</small></span></div></>},
 endpoints:{group:'API publique',label:'Endpoints',content:<><h1>Endpoints</h1><p>Toutes les routes publiques répondent en JSON.</p><div className="doc-table">{[['GET','/api','Index de l’API'],['GET','/api/health','État du serveur'],['GET','/api/players','Tous les joueurs'],['GET','/api/top100','Top 100 global'],['GET','/api/stats','Statistiques réelles'],['GET','/api/modes','Liste des modes'],['GET','/api/user/:username','Profil complet'],['GET','/api/:mode','Classement d’un mode'],['GET','/api/:mode/user/:username','Profil par mode'],['GET','/api/minecraft/:username','UUID Minecraft']].map(([method,path,description])=><div key={path}><b>{method}</b><code>{path}</code><span>{description}</span></div>)}</div></>},
 player:{group:'API publique',label:'Format joueur',content:<><h1>Format d’un joueur</h1><p>Les classements retournent des objets joueurs normalisés.</p><pre>{`{
  "id": "uuid-interne",
  "username": "Belyxzor",
  "minecraft_uuid": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "region": "EU",
  "points": 60,
  "rank": 1,
  "tiers": { "sword": "HT1" },
  "history": []
}`}</pre><h2>Exemples</h2><pre>{`curl ${location.origin}/api/top100
curl ${location.origin}/api/sword/user/Belyxzor`}</pre></>},
 modes:{group:'API publique',label:'Modes',content:<><h1>Modes</h1><p>Utilise l’identifiant du mode dans les routes <code>/api/:mode</code>.</p><pre>{modes}</pre><p>Exemple : <code>/api/spear-mace</code>.</p></>},
 tiers:{group:'Référence',label:'Tiers et points',content:<><h1>Points par tier</h1><p>Le total d’un joueur est calculé automatiquement depuis ses tiers.</p><div className="doc-tier-grid">{[['HT1',60],['LT1',45],['HT2',30],['LT2',20],['HT3',10],['LT3',6],['HT4',4],['LT4',3],['HT5',2],['LT5',1],['N/A',0]].map(([tier,points])=><span key={tier}><b>{tier}</b><small>{points} points</small></span>)}</div></>},
 deploy:{group:'Guides',label:'Déploiement',content:<><h1>Déploiement</h1><p>WorldTiers est servi par le serveur Node intégré.</p><pre>{`npm ci
npm run build
npm start`}</pre><p>Les joueurs sont sauvegardés dans <code>data/worldtiers.json</code>. Garde ce fichier persistant lors des mises à jour.</p></>}
};
export function DocsPage(){const [active,setActive]=useState('overview');const page=pages[active];const groups=[...new Set(Object.values(pages).map(page=>page.group))];return <main className="docs-shell"><aside className="docs-sidebar"><a className="docs-brand" href="/docs"><b>WorldTiers</b><small>Documentation</small></a>{groups.map(group=><section key={group}><small>{group}</small>{Object.entries(pages).filter(([,item])=>item.group===group).map(([id,item])=><button className={active===id?'active':''} key={id} onClick={()=>{setActive(id);scrollTo({top:0,behavior:'smooth'})}}>{item.label}</button>)}</section>)}</aside><article className="docs-content"><header><small>{page.group.toUpperCase()}</small><a href="/api" target="_blank" rel="noreferrer">API JSON ↗</a></header>{page.content}<footer>WorldTiers documentation · Dev Belyxzor and ChatGPT</footer></article></main>}
