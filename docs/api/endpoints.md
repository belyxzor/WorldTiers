# Endpoints

| Route | Rôle |
| --- | --- |
| `GET /api` | Index de l’API |
| `GET /api/health` | État du serveur |
| `GET /api/players` | Tous les joueurs |
| `GET /api/top100` | Top 100 global |
| `GET /api/stats` | Statistiques réelles |
| `GET /api/modes` | Modes disponibles |
| `GET /api/user/:username` | Profil global |
| `GET /api/:mode` | Classement par mode |
| `GET /api/:mode/user/:username` | Profil dans un mode |
| `GET /api/minecraft/:username` | UUID Minecraft |

Modes autorisés : `crystal`, `sword`, `uhc`, `nethpot`, `pot`, `smp`, `axe`, `diasmp`, `mace`, `spear-mace`.
