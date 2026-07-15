# Endpoints

| Route | Rôle |
| --- | --- |
| `GET /api` | Index JSON de l’API et liste des routes |
| `GET /api/health` | État du serveur |
| `GET /api/players` | Tous les joueurs classés |
| `GET /api/top100` | Top 100 global |
| `GET /api/stats` | Statistiques calculées depuis les profils |
| `GET /api/modes` | Modes disponibles |
| `GET /api/user/:username` | Profil global |
| `GET /api/:mode` | Classement par mode |
| `GET /api/:mode/user/:username` | Tier d’un joueur dans un mode |
| `GET /api/minecraft/:username` | UUID Minecraft depuis l’API officielle Mojang |
| `GET /api/v1/branding` | Informations de marque pour les intégrations |
| `GET /api/v1/modes` | Modes au format v1 |
| `GET /api/v1/leaderboard/:mode` | Classement d’un mode au format v1 |

Modes autorisés : `crystal`, `sword`, `uhc`, `nethpot`, `pot`, `smp`, `axe`, `diasmp`, `mace`, `spear-mace`.
