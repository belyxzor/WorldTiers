# WorldTiers API

URL de base : `https://worldtiers.ddns.net/api`

Toutes les routes publiques répondent en JSON.

## Routes publiques

| Méthode | Route | Description |
| --- | --- | --- |
| GET | `/api` | Index de l’API |
| GET | `/api/health` | État du service |
| GET | `/api/players` | Tous les joueurs classés par points |
| GET | `/api/top100` | Les 100 meilleurs joueurs |
| GET | `/api/stats` | Statistiques réelles de la base |
| GET | `/api/modes` | Identifiants des modes |
| GET | `/api/user/:username` | Profil complet d’un joueur |
| GET | `/api/:mode` | Classement d’un mode |
| GET | `/api/:mode/user/:username` | Joueur dans un mode |
| GET | `/api/minecraft/:username` | UUID Minecraft officiel |

Modes : `crystal`, `sword`, `uhc`, `nethpot`, `pot`, `smp`, `axe`, `diasmp`, `mace`, `spear-mace`.

## Exemples

```bash
curl https://worldtiers.ddns.net/api/top100
curl https://worldtiers.ddns.net/api/sword
curl https://worldtiers.ddns.net/api/sword/user/Belyxzor
curl https://worldtiers.ddns.net/api/user/Belyxzor
```

## Administration

`POST /api/admin` est privé : il est accessible uniquement aux IP de `data/worldtiers.json`.

Actions : `add_player`, `update_player`, `delete_player`, `set_tier`, `remove_tier`.

## Points par tier

| Tier | Points |
| --- | ---: |
| HT1 | 60 |
| LT1 | 45 |
| HT2 | 30 |
| LT2 | 20 |
| HT3 | 10 |
| LT3 | 6 |
| HT4 | 4 |
| LT4 | 3 |
| HT5 | 2 |
| LT5 | 1 |
| N/A | 0 |
