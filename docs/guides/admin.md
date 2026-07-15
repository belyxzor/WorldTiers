# Panneau admin

Le panneau est disponible sur `/admin`.

Il permet de créer, modifier et supprimer un profil, de récupérer automatiquement l’UUID Minecraft, puis d’attribuer les tiers. L’accès est limité par la whitelist IP de `data/worldtiers.json`.

La route privée est `POST /api/admin`. Actions : `add_player`, `update_player`, `delete_player`, `set_tier`, `remove_tier`.
