# WorldTiers

Classement PvP Minecraft avec API et panneau d’administration intégrés.

## Développement

```bash
npm install
npm run dev
```

Le site est sur `http://127.0.0.1:5173` et l’API sur `http://127.0.0.1:3001`.

## Production VPS

```bash
npm ci
npm run build
npm start
```

L’API publique est disponible à `/api`. Les données des joueurs sont stockées dans `data/worldtiers.json`.

## Licence

© 2026 Belyxzor — tous droits réservés. Voir [LICENSE.md](LICENSE.md).
