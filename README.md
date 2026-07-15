# WorldTiers

Classement PvP Minecraft avec API et panneau d’administration intégrés.

## Développement

```bash
npm install
npm run dev
```

Le site écoute sur le réseau à l’adresse `http://IP_DU_SERVEUR:5173` et l’API sur `http://IP_DU_SERVEUR:3001`.

## Production VPS

```bash
npm ci
npm run build
npm start
```

L’API publique est disponible à `/api`. Les données des joueurs sont stockées dans `data/worldtiers.json`.

## Licence

© 2026 Belyxzor — tous droits réservés. Voir [LICENSE.md](LICENSE.md).
